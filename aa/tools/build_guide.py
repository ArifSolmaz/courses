#!/usr/bin/env python3
"""Build the AA guide in Markdown and HTML using only Python's standard library.

The source intentionally uses a small Markdown subset: headings, paragraphs,
flat lists, pipe tables, fenced code, emphasis, inline code, and links.
Unsupported block syntax fails loudly instead of silently losing content.
"""

from __future__ import annotations

import html
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "guide"


def source_files():
    return [SOURCE / "start.md", SOURCE / "math.md", *[
        SOURCE / "weeks" / f"w{n:02d}.md" for n in range(1, 15)
    ], SOURCE / "reviews.md"]


def slug(text):
    text = unicodedata.normalize("NFC", text.lower().replace("`", ""))
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    return re.sub(r"\s", "-", text.strip())


def inline(text):
    """Escape ordinary text, then render the deliberately small inline grammar."""
    pattern = r"`([^`]+)`|\[([^\]]+)\]\(([^\s)]+)\)|\*\*(.+?)\*\*|(?<!\*)\*([^*]+)\*(?!\*)"
    output, position = [], 0
    for match in re.finditer(pattern, text):
        output.append(html.escape(text[position:match.start()]))
        code, label, url, strong, emphasis = match.groups()
        if code is not None:
            output.append(f"<code>{html.escape(code)}</code>")
        elif label is not None:
            if not url.startswith(("#", "https://", "http://", "mailto:")):
                url = "../" + url
            output.append(f'<a href="{html.escape(url, quote=True)}">{inline(label)}</a>')
        elif strong is not None:
            output.append(f"<strong>{inline(strong)}</strong>")
        else:
            output.append(f"<em>{inline(emphasis)}</em>")
        position = match.end()
    output.append(html.escape(text[position:]))
    return "".join(output)


def table_cells(line):
    # A pipe in inline code is content, not a column boundary.
    tokens = re.split(r"(`[^`]*`)", line.strip().strip("|"))
    protected = "".join(token.replace("|", "\x00") if token.startswith("`") else token for token in tokens)
    return [cell.strip().replace("\x00", "|") for cell in protected.split("|")]


class Renderer:
    def __init__(self):
        self.ids = {}
        self.toc = []

    def heading_id(self, label):
        base = slug(label)
        number = self.ids.get(base, 0)
        self.ids[base] = number + 1
        return base if number == 0 else f"{base}-{number}"

    def render(self, markdown):
        lines = markdown.splitlines()
        out, i = [], 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            if line.startswith("```"):
                language = line[3:].strip()
                code = []
                i += 1
                while i < len(lines) and lines[i].strip() != "```":
                    code.append(lines[i])
                    i += 1
                if i == len(lines):
                    raise ValueError("Unclosed code fence")
                label = "Python · small runnable example" if language == "python" else "Trace / calculation" if language == "text" else language or "Example"
                out.append(f'<div class="guide-code"><div class="code-label">{html.escape(label)}</div><pre tabindex="0"><code class="language-{html.escape(language, quote=True)}">{html.escape(chr(10).join(code))}</code></pre></div>')
                i += 1
                continue
            heading = re.match(r"^(#{1,6})\s+(.+)$", line)
            if heading:
                level, label = len(heading[1]), heading[2]
                anchor = self.heading_id(label)
                if level == 1:
                    self.toc.append((label, anchor))
                css = ' class="solution-heading"' if re.match(r"Solution\b", label, re.I) else ""
                out.append(f'<h{level} id="{anchor}"{css}>{inline(label)}<a class="anchor" href="#{anchor}" aria-label="Link to this section">#</a></h{level}>')
                i += 1
                continue
            if line.startswith("|"):
                rows = []
                while i < len(lines) and lines[i].strip().startswith("|"):
                    rows.append(table_cells(lines[i]))
                    i += 1
                if len(rows) < 2 or not all(re.fullmatch(r":?-{3,}:?", c) for c in rows[1]):
                    raise ValueError(f"Malformed table near {line}")
                if any(len(row) != len(rows[0]) for row in rows):
                    raise ValueError(f"Inconsistent table columns near {line}")
                out.append('<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable explanation table"><table><thead><tr>')
                out.extend(f'<th scope="col">{inline(c)}</th>' for c in rows[0])
                out.append("</tr></thead><tbody>")
                for row in rows[2:]:
                    out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
                out.append("</tbody></table></div>")
                continue
            item = re.match(r"^([-*]|\d+\.)\s+(.+)$", line)
            if item:
                ordered = item[1][0].isdigit()
                tag = "ol" if ordered else "ul"
                out.append(f"<{tag}>")
                while i < len(lines):
                    item = re.match(r"^([-*]|\d+\.)\s+(.+)$", lines[i].strip())
                    if not item or item[1][0].isdigit() != ordered:
                        break
                    out.append(f"<li>{inline(item[2])}</li>")
                    i += 1
                out.append(f"</{tag}>")
                continue
            if line.startswith((">", "<", "~~~", "![")) or re.match(r"^[-*_]{3,}$", line):
                raise ValueError(f"Unsupported guide block: {line}")
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,6} |```|\||[-*] |\d+\. )", lines[i].strip()):
                paragraph.append(lines[i].strip())
                i += 1
            text = " ".join(paragraph)
            tr = text.startswith(("**Türkçe", "**TR:", "**Türkçe köprü", "Türkçe:"))
            attributes = ' class="turkish" lang="tr"' if tr else ""
            out.append(f"<p{attributes}>{inline(text)}</p>")
        return "\n".join(out)


def build():
    sources = source_files()
    missing = [str(p.relative_to(ROOT)) for p in sources if not p.exists()]
    if missing:
        raise FileNotFoundError("Missing guide sources: " + ", ".join(missing))
    parts = [p.read_text(encoding="utf-8").strip() for p in sources]
    renderer = Renderer()
    bodies = [renderer.render(part) for part in parts]
    navigation = "\n".join(f'<a href="#{anchor}">{html.escape(label)}</a>' for label, anchor in renderer.toc)
    options = "\n".join(f'<option value="{anchor}">{html.escape(label)}</option>' for label, anchor in renderer.toc)
    md_toc = "\n".join(f"- [{label}](#{anchor})" for label, anchor in renderer.toc[1:])
    first = parts[0].split("\n", 1)
    combined = first[0] + "\n\n## Contents\n\n" + md_toc + "\n\n" + first[1].lstrip() + "\n\n" + "\n\n".join(parts[1:]) + "\n"
    (ROOT / "COURSE_GUIDE.md").write_bytes(combined.encode("utf-8"))
    document = f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="A detailed 14-week algorithm analysis learning guide, with worked examples, complete practice solutions, Turkish explanations, arithmetic bridges, and four in-class reviews.">
<title>AA · Detailed Learning Guide</title>
<link rel="stylesheet" href="../assets/guide.css">
</head>
<body>
<a class="skip-link" href="#reading">Skip to reading</a>
<header class="guide-header">
  <a class="brand" href="../index.html">AA <span>/ learning guide</span></a>
  <div class="header-actions"><a href="../COURSE_GUIDE.md">Markdown</a><button id="theme" type="button">Dark theme</button><button id="print" type="button">Print</button></div>
</header>
<div class="mobile-jump"><label for="chapter">Go to a chapter</label><select id="chapter">{options}</select></div>
<div class="guide-layout">
<aside class="sidebar"><p class="eyebrow">14 weeks · EN + TR</p><h2>Learn one step at a time</h2><nav aria-label="Guide chapters">{navigation}</nav><p class="sidebar-note">Worked examples → your attempt → complete solution. Reviews stay inside Weeks 4, 6, 8 and 11.</p></aside>
<main id="reading" class="reading">
<div class="guide-intro"><span>COURSE COMPANION</span><p>Understand the steps.<br>Then explain the growth.</p><div>14 weekly chapters · 9 arithmetic bridges · 4 review sessions</div></div>
{''.join('<article class="guide-chapter">' + body + '</article>' for body in bodies)}
<footer>Based on the AA course notes · Dr. Arif Solmaz · <a href="../index.html">Course home</a></footer>
</main></div>
<script src="../assets/guide.js"></script>
</body></html>
'''
    target = ROOT / "guide" / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(document.encode("utf-8"))
    words = len(re.findall(r"\S+", combined))
    print(f"  wrote aa/COURSE_GUIDE.md + aa/guide/index.html ({words:,} whitespace-separated words)")


if __name__ == "__main__":
    build()
