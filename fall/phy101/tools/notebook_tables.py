"""Give notebook tables room before Colab typesets their mathematics.

Colab strips inline CSS from Markdown, uses a fixed table layout, and measures
inline MathJax against the initial column width. Plain pipe tables can therefore
break a short equation into several lines even on a wide screen. HTML ``width``
attributes survive its sanitizer. A full-width table with content-sized header
columns gives MathJax usable space on its first pass, without running Python.

Only pipe-table blocks are changed. Existing HTML tables and non-table prose are
left alone, so ``format_markdown_tables`` is idempotent. Mathematics is copied
verbatim: escaping a comparison as ``&lt;`` inside TeX would change its meaning.
"""

from __future__ import annotations

import html
import re


_MATH = re.compile(r"(?<!\\)\$(?!\$)(?:\\.|[^$\n])+(?<!\\)\$")
_SEPARATOR = re.compile(r"^:?-+:?$")


def _row(line: str) -> list[str]:
    """Split table delimiters, including rows with absolute-value bars in TeX."""
    text = line.strip().strip("|")
    result, cell = [], []
    in_math = False
    index = 0
    while index < len(text):
        char = text[index]
        if char == "\\" and index + 1 < len(text):
            cell.extend(text[index:index + 2])
            index += 2
            continue
        if char == "$":
            in_math = not in_math
        if char == "|" and not in_math:
            result.append("".join(cell).strip())
            cell = []
        else:
            cell.append(char)
        index += 1
    result.append("".join(cell).strip())
    return result


def _inline(source: str) -> str:
    """Render the tables' inline Markdown without passing TeX through HTML escaping."""
    protected: list[str] = []

    def protect(match: re.Match[str]) -> str:
        protected.append(match.group(0))
        return f"PHYTABLETOKEN{len(protected) - 1}END"

    source = _MATH.sub(protect, source)
    # No links occur in the current tables; these cases also keep future edits
    # readable without introducing a Markdown package dependency for builders.
    source = html.escape(source, quote=False)
    source = re.sub(r"`([^`]+)`", r"<code>\1</code>", source)
    source = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", source)
    source = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", source)
    source = re.sub(
        r"\[([^\]]+)\]\(([^\s)]+)\)",
        lambda match: '<a href="' + html.escape(html.unescape(match.group(2)), quote=True)
        + '">' + match.group(1) + '</a>',
        source,
    )
    source = source.replace(r"\|", "|")
    for index, value in enumerate(protected):
        source = source.replace(f"PHYTABLETOKEN{index}END", value)
    return source


def _column_width(values: list[str]) -> int:
    """Conservative content width at Colab's normal reading size, in pixels.

    Pixel column widths act as minimums in Colab's fixed table layout. The table
    still fills a larger viewport. On a phone, Colab's own notebook scroller
    permits horizontal scrolling instead of chopping an equation into pieces.
    """
    sizes = []
    for value in values:
        # Count visible symbols rather than the spelling of LaTeX commands.
        text = re.sub(r"\\(?:mathrm|textrm|text|mathbf|boldsymbol|mathit|operatorname)\b", "", value)
        text = re.sub(r"\\(?:left|right|displaystyle|textstyle|rm)\b", "", text)
        text = re.sub(r"\\(?:frac|dfrac|tfrac)\b", "/", text)
        text = re.sub(r"\\(?:quad|qquad)\b", "  ", text)
        text = re.sub(r"\\[a-zA-Z]+", "x", text)
        text = re.sub(r"\\[,;!: ]", " ", text)
        text = re.sub(r"[$^_{}*`]", "", text)
        text = html.unescape(text)
        sizes.append(len(text))
    # Extra room covers cell padding, mathematical glyphs, and font differences.
    return max(64, 24 + 8 * max(sizes, default=0))


def format_markdown_tables(source: str) -> str:
    """Replace complete pipe tables with readable, Colab-safe HTML tables."""
    lines = source.splitlines(keepends=True)
    result = []
    index = 0
    in_fence = False
    while index < len(lines):
        stripped = lines[index].lstrip()
        if stripped.startswith(("```", "~~~")):
            in_fence = not in_fence
        if (not in_fence and stripped.startswith("|") and index + 1 < len(lines)
                and lines[index + 1].lstrip().startswith("|")):
            headers = _row(lines[index])
            separators = _row(lines[index + 1])
            if len(headers) == len(separators) and all(_SEPARATOR.fullmatch(x) for x in separators):
                end = index + 2
                rows = []
                while end < len(lines) and lines[end].lstrip().startswith("|"):
                    row = _row(lines[end])
                    if len(row) != len(headers):
                        raise ValueError(f"Table row has {len(row)} cells; expected {len(headers)}: {lines[end].strip()}")
                    rows.append(row)
                    end += 1
                widths = [_column_width([headers[c]] + [row[c] for row in rows])
                          for c in range(len(headers))]
                output = ['<table width="100%">', '<thead>', '<tr>']
                output += [f'<th align="left" width="{width}" scope="col">{_inline(header)}</th>'
                           for header, width in zip(headers, widths)]
                output += ['</tr>', '</thead>', '<tbody>']
                for row in rows:
                    output.append('<tr>')
                    output += [f'<td>{_inline(cell)}</td>' for cell in row]
                    output.append('</tr>')
                output += ['</tbody>', '</table>']
                result.append('\n'.join(output) + ('\n' if lines[end - 1].endswith('\n') else ''))
                index = end
                continue
        result.append(lines[index])
        index += 1
    return ''.join(result)
