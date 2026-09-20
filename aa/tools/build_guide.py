#!/usr/bin/env python3
"""Build the AA course guide as a hub plus separate chapter pages."""

from __future__ import annotations

import html
import os
import pathlib
import posixpath
import re
import unicodedata
from dataclasses import dataclass


ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "guide"
GUIDE = ROOT / "guide"
WEEK_COUNT = 14


@dataclass(frozen=True)
class PageSpec:
    key: str
    label: str
    source_paths: tuple[pathlib.Path, ...]
    out_rel: pathlib.PurePosixPath
    group: str
    eyebrow: str
    headline: str
    summary: str


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "section"


def week_source(num: int) -> pathlib.Path:
    return SOURCE / "weeks" / f"w{num:02d}.md"


def deepening_source(num: int) -> pathlib.Path:
    return SOURCE / "deepening" / f"w{num:02d}.md"


def meaning_source(num: int) -> pathlib.Path:
    return SOURCE / "meaning" / f"w{num:02d}.md"


def page_link(out_rel: pathlib.PurePosixPath) -> str:
    if out_rel.name == "index.html":
        return out_rel.parent.as_posix().rstrip("/") + "/"
    return out_rel.as_posix()


def source_files() -> list[pathlib.Path]:
    files: list[pathlib.Path] = [SOURCE / "start.md", SOURCE / "toolkit.md", SOURCE / "math.md"]
    for num in range(1, WEEK_COUNT + 1):
        files.append(week_source(num))
        files.append(meaning_source(num))
        files.append(deepening_source(num))
    files.append(SOURCE / "reviews.md")
    return files


def _first_h1(path: pathlib.Path, fallback: str) -> str:
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def guide_page_specs() -> list[PageSpec]:
    specs: list[PageSpec] = [
        PageSpec(
            key="overview",
            label="Guide Hub",
            source_paths=(SOURCE / "start.md",),
            out_rel=pathlib.PurePosixPath("guide/index.html"),
            group="Start",
            eyebrow="Algorithm Analysis",
            headline="Course guide hub",
            summary="Use this as the front door: week pages, analysis toolkit, bridge notes, and review blocks are separated for easier teaching.",
        ),
        PageSpec(
            key="toolkit",
            label="Toolkit",
            source_paths=(SOURCE / "toolkit.md",),
            out_rel=pathlib.PurePosixPath("guide/toolkit/index.html"),
            group="Start",
            eyebrow="Shared Methods",
            headline="Algorithm-analysis toolkit",
            summary="The reusable methods students need every week: counting, asymptotic proofs, traces, measurement, and explanation routines.",
        ),
        PageSpec(
            key="bridges",
            label="Bridge Notes",
            source_paths=(SOURCE / "math.md",),
            out_rel=pathlib.PurePosixPath("guide/bridges/index.html"),
            group="Start",
            eyebrow="Math Bridges",
            headline="Discrete math bridge notes",
            summary="Short, teachable bridges from programming habits to sums, logarithms, proofs, and growth-rate comparisons.",
        ),
    ]

    for num in range(1, WEEK_COUNT + 1):
        week_path = week_source(num)
        title = _first_h1(week_path, f"Week {num:02d}")
        title = title.removeprefix(f"Week {num:02d} - ").removeprefix(f"Week {num:02d} -- ")
        specs.append(
            PageSpec(
                key=f"w{num:02d}",
                label=f"Week {num:02d}",
                source_paths=(week_path, meaning_source(num), deepening_source(num)),
                out_rel=pathlib.PurePosixPath(f"guide/w{num:02d}/index.html"),
                group="Weekly Guide Pages",
                eyebrow=f"Week {num:02d}",
                headline=title,
                summary="Detailed teacher notes, original lesson link, analysis prompts, model solutions, and added timed-practice material.",
            )
        )

    specs.append(
        PageSpec(
            key="reviews",
            label="Reviews",
            source_paths=(SOURCE / "reviews.md",),
            out_rel=pathlib.PurePosixPath("guide/reviews/index.html"),
            group="Review",
            eyebrow="Exam Preparation",
            headline="Review blocks and timed practice",
            summary="Midterm, final, Python fluency, and challenge review blocks aligned with the weekly algorithm-analysis sequence.",
        )
    )
    return specs


def guide_html_outputs() -> list[pathlib.Path]:
    return [ROOT / spec.out_rel for spec in guide_page_specs()]


def _page_source(spec: PageSpec) -> str:
    return "\n\n".join(path.read_text(encoding="utf-8").strip() for path in spec.source_paths)


def _strip_first_h1(markdown: str) -> str:
    lines = markdown.splitlines()
    if lines and lines[0].startswith("# "):
        return "\n".join(lines[1:]).strip()
    return markdown


def _heading_records(markdown: str) -> list[tuple[int, str, str]]:
    ids: dict[str, int] = {}
    records: list[tuple[int, str, str]] = []
    for line in markdown.splitlines():
        match = re.match(r"^(#{1,4})\s+(.+)$", line)
        if not match:
            continue
        level = len(match.group(1))
        title = match.group(2).strip()
        base = slug(title)
        count = ids.get(base, 0)
        ids[base] = count + 1
        anchor = base if count == 0 else f"{base}-{count + 1}"
        records.append((level, title, anchor))
    return records


def _anchor_routes(specs: list[PageSpec]) -> dict[str, pathlib.PurePosixPath]:
    seen: dict[str, pathlib.PurePosixPath | None] = {}
    for spec in specs:
        for _level, _title, anchor in _heading_records(_page_source(spec)):
            if anchor not in seen:
                seen[anchor] = spec.out_rel
            elif seen[anchor] != spec.out_rel:
                seen[anchor] = None
    return {anchor: out_rel for anchor, out_rel in seen.items() if out_rel is not None}


def _course_prefix(current_rel: pathlib.PurePosixPath) -> str:
    current_dir = ROOT / pathlib.Path(*current_rel.parts).parent
    rel = os.path.relpath(ROOT, current_dir).replace("\\", "/")
    return "" if rel == "." else rel.rstrip("/") + "/"


def _relative_page_link(
    current_rel: pathlib.PurePosixPath,
    target_rel: pathlib.PurePosixPath,
    fragment: str = "",
) -> str:
    current_dir = ROOT / pathlib.Path(*current_rel.parts).parent
    target_dir = ROOT / pathlib.Path(*target_rel.parts).parent
    rel = os.path.relpath(target_dir, current_dir).replace("\\", "/")
    href = "./" if rel == "." else rel.rstrip("/") + "/"
    if fragment:
        href += f"#{fragment}"
    return href


class Renderer:
    def __init__(
        self,
        current_rel: pathlib.PurePosixPath,
        local_anchors: set[str],
        anchor_routes: dict[str, pathlib.PurePosixPath],
    ):
        self.current_rel = current_rel
        self.local_anchors = local_anchors
        self.anchor_routes = anchor_routes
        self.course_prefix = _course_prefix(current_rel)
        self.ids: dict[str, int] = {}

    def heading_id(self, text: str) -> str:
        base = slug(text)
        count = self.ids.get(base, 0)
        self.ids[base] = count + 1
        return base if count == 0 else f"{base}-{count + 1}"

    def link_url(self, url: str) -> str:
        if re.match(r"^[a-z][a-z0-9+.-]*:", url, flags=re.IGNORECASE) or url.startswith("//"):
            return url
        if url.startswith("#"):
            anchor = url[1:]
            if anchor in self.local_anchors:
                return url
            target = self.anchor_routes.get(anchor)
            if target is not None:
                return _relative_page_link(self.current_rel, target, anchor)
            return url
        return posixpath.normpath(self.course_prefix + url).replace("\\", "/")

    def inline(self, text: str) -> str:
        placeholders: list[str] = []

        def code_repl(match: re.Match[str]) -> str:
            placeholders.append(f"<code>{html.escape(match.group(1))}</code>")
            return f"\u0000{len(placeholders) - 1}\u0000"

        safe = re.sub(r"`([^`]+)`", code_repl, html.escape(text))
        safe = re.sub(r"\*\*([^*]+)\*\*", lambda m: f"<strong>{m.group(1)}</strong>", safe)
        safe = re.sub(r"\*([^*]+)\*", lambda m: f"<em>{m.group(1)}</em>", safe)

        def link_repl(match: re.Match[str]) -> str:
            label = match.group(1)
            url = self.link_url(html.unescape(match.group(2)))
            return f'<a href="{html.escape(url)}">{label}</a>'

        safe = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link_repl, safe)
        safe = safe.replace(" -- ", " &mdash; ")
        for i, value in enumerate(placeholders):
            safe = safe.replace(f"\u0000{i}\u0000", value)
        return safe

    def render_table(self, lines: list[str]) -> str:
        rows = []
        for line in lines:
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            rows.append(cells)
        head = "".join(f"<th>{self.inline(cell)}</th>" for cell in rows[0])
        body_rows = []
        for row in rows[2:]:
            body_rows.append("<tr>" + "".join(f"<td>{self.inline(cell)}</td>" for cell in row) + "</tr>")
        return (
            '<div class="table-scroll"><table><thead><tr>'
            + head
            + "</tr></thead><tbody>"
            + "".join(body_rows)
            + "</tbody></table></div>"
        )

    def render(self, markdown: str) -> str:
        html_parts: list[str] = []
        lines = markdown.splitlines()
        i = 0
        in_list: str | None = None

        def close_list() -> None:
            nonlocal in_list
            if in_list:
                html_parts.append(f"</{in_list}>")
                in_list = None

        while i < len(lines):
            line = lines[i]

            if not line.strip():
                close_list()
                i += 1
                continue

            if line.startswith("```"):
                close_list()
                lang = line.strip("`").strip() or "text"
                code: list[str] = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    code.append(lines[i])
                    i += 1
                joined = "\n".join(code)
                html_parts.append(
                    '<div class="guide-code">'
                    f'<div class="code-label">{html.escape(lang)}</div>'
                    f'<pre><code class="language-{html.escape(lang)}">{html.escape(joined)}</code></pre>'
                    "</div>"
                )
                i += 1
                continue

            if "|" in line and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{3,}", lines[i + 1]):
                close_list()
                table_lines = [line, lines[i + 1]]
                i += 2
                while i < len(lines) and "|" in lines[i] and lines[i].strip():
                    table_lines.append(lines[i])
                    i += 1
                html_parts.append(self.render_table(table_lines))
                continue

            heading = re.match(r"^(#{1,4})\s+(.+)$", line)
            if heading:
                close_list()
                level = min(len(heading.group(1)), 4)
                title = heading.group(2).strip()
                hid = self.heading_id(title)
                html_parts.append(f'<h{level} id="{hid}">{self.inline(title)}</h{level}>')
                i += 1
                continue

            bullet = re.match(r"^-\s+(.+)$", line)
            if bullet:
                if in_list != "ul":
                    close_list()
                    html_parts.append("<ul>")
                    in_list = "ul"
                html_parts.append(f"<li>{self.inline(bullet.group(1))}</li>")
                i += 1
                continue

            numbered = re.match(r"^\d+\.\s+(.+)$", line)
            if numbered:
                if in_list != "ol":
                    close_list()
                    html_parts.append("<ol>")
                    in_list = "ol"
                html_parts.append(f"<li>{self.inline(numbered.group(1))}</li>")
                i += 1
                continue

            close_list()

            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"^(#{1,4})\s+|- |\d+\. |\|", lines[i]):
                paragraph.append(lines[i])
                i += 1
            text = " ".join(part.strip() for part in paragraph)
            turkish = text.startswith(("**Türkçe", "**Turkce", "**TR:", "Türkçe:", "Turkce:"))
            cls = ' class="turkish"' if turkish else ""
            html_parts.append(f"<p{cls}>{self.inline(text)}</p>")

        close_list()
        return "\n".join(html_parts)


def _navigation(specs: list[PageSpec], current: PageSpec) -> str:
    parts: list[str] = []
    current_group = ""
    for spec in specs:
        if spec.group != current_group:
            current_group = spec.group
            parts.append(f'<div class="nav-group-title">{html.escape(current_group)}</div>')
        href = _relative_page_link(current.out_rel, spec.out_rel)
        active = ' aria-current="page"' if spec == current else ""
        parts.append(f'<a href="{html.escape(href)}"{active}>{html.escape(spec.label)}</a>')
    return "\n".join(parts)


def _mobile_options(specs: list[PageSpec], current: PageSpec) -> str:
    options = []
    for spec in specs:
        selected = " selected" if spec == current else ""
        href = _relative_page_link(current.out_rel, spec.out_rel)
        options.append(f'<option value="{html.escape(href)}"{selected}>{html.escape(spec.label)}</option>')
    return "\n".join(options)


def _page_toc(records: list[tuple[int, str, str]]) -> str:
    links = [
        f'<a href="#{html.escape(anchor)}">{html.escape(title)}</a>'
        for level, title, anchor in records
        if level == 2
    ]
    if not links:
        return ""
    return '<div class="page-toc"><strong>On this page</strong><nav>' + "\n".join(links) + "</nav></div>"


def _hub_cards(specs: list[PageSpec], current: PageSpec) -> str:
    start_cards = [spec for spec in specs if spec.group == "Start" and spec.key != "overview"]
    week_cards = [spec for spec in specs if spec.group == "Weekly Guide Pages"]
    review_cards = [spec for spec in specs if spec.group == "Review"]

    def card(spec: PageSpec) -> str:
        href = _relative_page_link(current.out_rel, spec.out_rel)
        return (
            f'<a class="guide-card" href="{html.escape(href)}">'
            f'<span>{html.escape(spec.eyebrow)}</span>'
            f"<h3>{html.escape(spec.headline)}</h3>"
            f"<p>{html.escape(spec.summary)}</p>"
            "</a>"
        )

    return f"""<section class="guide-hub" id="guide-pages">
  <h2>Separated Guide Pages</h2>
  <p class="guide-summary">The old single guide has been split into focused pages. Use the weekly pages during class, and keep the toolkit, bridge notes, and review blocks open as references.</p>
  <div class="guide-card-grid compact">
    {''.join(card(spec) for spec in start_cards + review_cards)}
  </div>
  <h2 id="weeks">Weekly Teacher Notes</h2>
  <div class="guide-card-grid weeks">
    {''.join(card(spec) for spec in week_cards)}
  </div>
</section>"""


def _page_pager(specs: list[PageSpec], index: int, current: PageSpec) -> str:
    links = []
    if index > 0:
        prev = specs[index - 1]
        links.append(
            f'<a class="pager-link" href="{html.escape(_relative_page_link(current.out_rel, prev.out_rel))}">'
            f"<span>Previous</span><strong>{html.escape(prev.label)}</strong></a>"
        )
    if index + 1 < len(specs):
        nxt = specs[index + 1]
        links.append(
            f'<a class="pager-link next" href="{html.escape(_relative_page_link(current.out_rel, nxt.out_rel))}">'
            f"<span>Next</span><strong>{html.escape(nxt.label)}</strong></a>"
        )
    if not links:
        return ""
    return '<nav class="page-pager" aria-label="Guide pagination">' + "".join(links) + "</nav>"


def _shell(
    specs: list[PageSpec],
    current: PageSpec,
    index: int,
    body: str,
    records: list[tuple[int, str, str]],
    intro_id: str,
) -> str:
    nav = _navigation(specs, current)
    options = _mobile_options(specs, current)
    toc = _page_toc(records)
    pager = _page_pager(specs, index, current)
    prefix = _course_prefix(current.out_rel)
    guide_home = _relative_page_link(current.out_rel, pathlib.PurePosixPath("guide/index.html"))
    lesson_return = ''
    if re.fullmatch(r'w\d{2}', current.key):
        week = int(current.key[1:])
        lesson_return = f'<p class="lesson-return">This is supporting reference material. <a href="{prefix}w{week}/">Return to Week {week:02d} lesson →</a></p>'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(current.headline)} | Algorithm Analysis Guide</title>
  <link rel="stylesheet" href="{prefix}assets/guide.css" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%2325665c'/%3E%3Ctext x='32' y='41' font-size='28' text-anchor='middle' fill='white' font-family='Arial'%3EAA%3C/text%3E%3C/svg%3E" />
</head>
<body>
  <a class="skip-link" href="#content">Skip to guide content</a>
  <header class="guide-header">
    <a class="brand" href="{prefix}">Algorithm Analysis <span>course guide</span></a>
    <nav class="header-actions">
      <a href="{prefix}index.html">Course Home</a>
      <a href="{guide_home}">Guide</a>
      <button id="theme" type="button">Dark theme</button>
      <button id="print" type="button">Print</button>
    </nav>
  </header>
  <div class="mobile-jump">
    <label for="chapter">Guide page</label>
    <select id="chapter" data-guide-select>
      {options}
    </select>
  </div>
  <main class="guide-layout" id="content">
    <aside class="sidebar" aria-label="Guide pages">
      <div class="eyebrow">Guide pages</div>
      <h2>Algorithm Analysis</h2>
      <label for="chapterSide">Guide page</label>
      <select id="chapterSide" data-guide-select>
        {options}
      </select>
      <nav>
        {nav}
      </nav>
    </aside>
    <article class="reading">
      <section class="guide-intro">
        <span>{html.escape(current.eyebrow)}</span>
        <h1 id="{html.escape(intro_id)}">{html.escape(current.headline)}</h1>
{lesson_return}
        <details><summary>About this reference</summary><p>{html.escape(current.summary)}</p></details>
      </section>
      <details class="reference-toc"><summary>Find a topic in this reference</summary>{toc}</details>
      <section class="guide-chapter">
        {body}
      </section>
      {pager}
    </article>
  </main>
  <script src="{prefix}assets/guide.js"></script>
</body>
</html>
"""


def _course_guide_markdown(specs: list[PageSpec]) -> str:
    start = (SOURCE / "start.md").read_text(encoding="utf-8").strip()
    title, rest = start.split("\n", 1)
    web_links = "\n".join(f"- [{spec.label}: {spec.headline}]({page_link(spec.out_rel)})" for spec in specs)
    parts = [
        title,
        "## Web guide pages",
        web_links,
        rest.strip(),
    ]
    for spec in specs[1:]:
        parts.append(_page_source(spec))
    return "\n\n".join(parts).strip() + "\n"


def build() -> None:
    missing = [path for path in source_files() if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing guide source files:\n" + "\n".join(str(path) for path in missing))

    GUIDE.mkdir(exist_ok=True)
    specs = guide_page_specs()
    routes = _anchor_routes(specs)

    for index, spec in enumerate(specs):
        markdown = _page_source(spec)
        all_records = _heading_records(markdown)
        intro_id = all_records[0][2] if all_records and all_records[0][0] == 1 else slug(spec.headline)
        body_markdown = _strip_first_h1(markdown)
        records = _heading_records(body_markdown)
        local_anchors = {intro_id} | {anchor for _level, _title, anchor in records}
        body = Renderer(spec.out_rel, local_anchors, routes).render(body_markdown)
        if spec.key == "overview":
            body = _hub_cards(specs, spec) + "\n" + body
        target = ROOT / spec.out_rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(_shell(specs, spec, index, body, records, intro_id), encoding="utf-8")
        print(f"wrote {target.relative_to(ROOT).as_posix()}")

    combined = _course_guide_markdown(specs)
    (ROOT / "COURSE_GUIDE.md").write_text(combined, encoding="utf-8")
    print(f"wrote COURSE_GUIDE.md ({len(combined.split()):,} words, {len(specs)} guide pages)")


if __name__ == "__main__":
    build()
