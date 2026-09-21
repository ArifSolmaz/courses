"""Format notebook tables with bounded, percentage-based column widths.

Colab strips inline CSS from Markdown but preserves HTML width attributes.
Pixel widths based on the longest prose cell forced entire notebook cells off
screen. Percentage columns share the available page width. Colab also forces table
cells to a single truncated line, so wide/text-heavy tables become labelled
records with ordinary wrapping paragraphs.
Existing HTML tables are normalized too, so refreshing older notebooks repairs
their widths. Mathematics and cell contents are preserved verbatim.
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
    """Estimate a column weight, capped so prose wraps instead of widening the page."""
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
    return min(400, max(64, 24 + 8 * max(sizes, default=0)))


def _percentages(widths: list[int]) -> list[int]:
    """Allocate exactly 100 percent, retaining useful space for short columns."""
    total = sum(widths)
    values = [100 * width / total for width in widths]
    result = [int(value) for value in values]
    for index in sorted(range(len(values)), key=lambda i: values[i] - result[i], reverse=True)[:100-sum(result)]:
        result[index] += 1
    return result


def normalize_html_tables(source: str) -> str:
    def table(match: re.Match[str]) -> str:
        block = match.group(0)
        headers = re.findall(r'<th\b[^>]*>(.*?)</th>', block, re.S)
        if not headers:
            return block
        rows = [re.findall(r'<td\b[^>]*>(.*?)</td>', row, re.S)
                for row in re.findall(r'<tr\b[^>]*>(.*?)</tr>', block, re.S)]
        weights = [_column_width([re.sub(r'<[^>]+>', '', h)] +
                    [re.sub(r'<[^>]+>', '', row[i]) for row in rows if len(row) == len(headers)])
                   for i, h in enumerate(headers)]
        # Colab applies nowrap + hidden overflow + ellipsis to every td.
        # Width changes alone hide prose. Use ordinary blocks for content that
        # cannot safely fit a compact numerical table, without relying on CSS.
        if max(weights) >= 280 or len(headers) > 4:
            records = []
            for row in rows:
                if not row:
                    continue
                if len(row) != len(headers):
                    raise ValueError("Cannot reflow a table with an irregular row")
                records.append(f'<p><strong>{headers[0]}:</strong> {row[0]}</p>')
                records.append('<ul>')
                records.extend(f'<li><p><strong>{label}:</strong> {value}</p></li>'
                               for label, value in zip(headers[1:], row[1:]))
                records.append('</ul>')
            return '\n'.join(records)
        percentages = iter(_percentages(weights))
        block = re.sub(r'<table\b[^>]*>', '<table width="100%">', block, count=1)
        def header(m):
            tag = re.sub(r'\s+width="[^"]*"', '', m.group(0))
            return tag[:-1] + f' width="{next(percentages)}%">'
        return re.sub(r'<th\b[^>]*>', header, block)
    return re.sub(r'<table\b.*?</table>', table, source, flags=re.S)


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
                widths = _percentages(widths)
                output = ['<table width="100%">', '<thead>', '<tr>']
                output += [f'<th align="left" width="{width}%" scope="col">{_inline(header)}</th>'
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
    return normalize_html_tables(''.join(result))
