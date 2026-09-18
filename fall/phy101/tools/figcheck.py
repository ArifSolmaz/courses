#!/usr/bin/env python3
"""
Proof-sheet and linter for the PHY101 figure library.

    python3 fall/phy101/tools/figcheck.py

Writes tools/figproof-light.html and tools/figproof-dark.html: every figure in
tools/figures.py, one per row, rendered far larger than it appears on a week
page, with an optional coordinate grid.

WHY THIS EXISTS
A figure inspected inside a full-page screenshot is about 480 px wide, and at
that size a wrong tangent, an arrowhead that fell back to black, or a label
sitting on top of an axis all look fine. They are not fine. Every figure gets
looked at on this sheet, at size, on both themes, before it ships.

The linter catches the mechanical faults that are easy to miss by eye:

  * fill="context-stroke" / context-fill    - not supported in Chromium, so the
                                              arrowhead silently renders black
  * marker-* pointing at an undefined id    - arrowhead just missing
  * duplicated element ids across figures   - the page has them all at once
  * coordinates outside the viewBox         - clipped geometry
  * a <title>/<desc> that is not referenced by aria-labelledby
"""

import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import figures as FIGLIB

ROOT = pathlib.Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"

GRID_STEP = 20


def lint():
    problems = []
    seen_ids = {}
    for week, figs in sorted(FIGLIB.FIGURES.items()):
        for fig in figs:
            where = f"w{week}:{fig['slug']}"
            svg = fig["svg"]

            if "context-stroke" in svg or "context-fill" in svg:
                problems.append(f"{where}: uses context-stroke/context-fill, which Chromium "
                                f"ignores - the marker will render BLACK")

            defined = set(re.findall(r'<marker[^>]*\bid="([^"]+)"', svg))
            used = set(re.findall(r'marker-(?:end|start|mid)="url\(#([^)]+)\)"', svg))
            for u in used - defined:
                problems.append(f"{where}: marker-end points at #{u}, which is not defined here")

            for i in re.findall(r'\bid="([^"]+)"', svg):
                if i in seen_ids and seen_ids[i] != where:
                    problems.append(f"{where}: id #{i} already used by {seen_ids[i]} "
                                    f"- ids must be unique, the page shows every figure at once")
                seen_ids[i] = where

            vb = re.search(r'viewBox="([\d.\-\s]+)"', svg)
            if not vb:
                problems.append(f"{where}: no viewBox")
            else:
                _, _, vw, vh = (float(x) for x in vb.group(1).split())
                for attr, limit in (("x1", vw), ("x2", vw), ("cx", vw)):
                    for v in re.findall(rf'\b{attr}="(-?[\d.]+)"', svg):
                        if float(v) > limit + 1:
                            problems.append(f"{where}: {attr}={v} exceeds viewBox width {vw:g}")
                for attr, limit in (("y1", vh), ("y2", vh), ("cy", vh)):
                    for v in re.findall(rf'\b{attr}="(-?[\d.]+)"', svg):
                        if float(v) > limit + 1:
                            problems.append(f"{where}: {attr}={v} exceeds viewBox height {vh:g}")

            labelled = re.search(r'aria-labelledby="([^"]+)"', svg)
            if labelled:
                for ref in labelled.group(1).split():
                    if f'id="{ref}"' not in svg:
                        problems.append(f"{where}: aria-labelledby names #{ref}, which is missing")
            else:
                problems.append(f"{where}: no aria-labelledby, so the figure has no accessible name")
    return problems


def grid_overlay(svg):
    """Drop a faint coordinate grid behind the drawing, to check alignment."""
    vb = re.search(r'viewBox="([\d.\-\s]+)"', svg)
    if not vb:
        return svg
    _, _, vw, vh = (float(x) for x in vb.group(1).split())
    lines = []
    for x in range(0, int(vw) + 1, GRID_STEP):
        heavy = x % (GRID_STEP * 5) == 0
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{vh:g}" stroke="#4488ff" '
                     f'stroke-width="{0.7 if heavy else 0.3}" opacity="{0.5 if heavy else 0.25}"/>')
        if heavy:
            lines.append(f'<text x="{x + 2}" y="10" font-size="7" fill="#4488ff" opacity=".8">{x}</text>')
    for y in range(0, int(vh) + 1, GRID_STEP):
        heavy = y % (GRID_STEP * 5) == 0
        lines.append(f'<line x1="0" y1="{y}" x2="{vw:g}" y2="{y}" stroke="#4488ff" '
                     f'stroke-width="{0.7 if heavy else 0.3}" opacity="{0.5 if heavy else 0.25}"/>')
        if heavy:
            lines.append(f'<text x="2" y="{y - 2}" font-size="7" fill="#4488ff" opacity=".8">{y}</text>')
    grid = '<g class="proof-grid">' + "".join(lines) + "</g>"
    # insert straight after the opening <svg ...> tag so it sits behind everything
    return re.sub(r"(<svg[^>]*>)", r"\1" + grid, svg, count=1)


def sheet(theme, with_grid):
    rows = []
    n = 0
    for week, figs in sorted(FIGLIB.FIGURES.items()):
        for i, fig in enumerate(figs, start=1):
            n += 1
            svg = grid_overlay(fig["svg"]) if with_grid else fig["svg"]
            rows.append(f"""<section class="proof" id="proof-{fig['slug']}">
  <h2>Week {week} &middot; Figure {week}.{i} &middot; <code>{fig['slug']}</code></h2>
  <p class="anchor">anchored after a heading containing: <code>{fig['after']}</code></p>
  <figure class="figure">{svg}
    <figcaption><span class="fig-num">Figure {week}.{i}</span>{fig['caption']}</figcaption>
  </figure>
</section>""")
    grid_note = " with a 20-unit coordinate grid" if with_grid else ""
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="{theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PHY101 figure proof sheet &mdash; {theme}{grid_note}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Syne:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
<style>
  body {{ padding: 2rem; }}
  .proof {{ max-width: 60rem; margin: 0 auto 3.5rem; }}
  .proof h2 {{ font-size: 1rem; margin: 0 0 .2rem; border: 0; }}
  .proof .anchor {{ font-size: .75rem; color: var(--dim); margin: 0 0 .6rem; }}
  /* far larger than on a week page, which is the point */
  .proof .figure svg {{ max-width: 46rem; }}
  .proof .figure {{ margin: 0; }}
</style>
</head>
<body>
<h1 style="max-width:60rem;margin:0 auto 1.5rem;font-family:var(--font-display)">
  Figure proof sheet &mdash; {theme}{grid_note} &mdash; {n} figures</h1>
{"".join(rows)}
</body>
</html>
"""


def main():
    problems = lint()
    for theme in ("light", "dark"):
        (TOOLS / f"figproof-{theme}.html").write_text(sheet(theme, False), encoding="utf-8")
    (TOOLS / "figproof-grid.html").write_text(sheet("light", True), encoding="utf-8")
    print(f"  wrote tools/figproof-light.html, figproof-dark.html, figproof-grid.html")

    if problems:
        print(f"\n{len(problems)} problem(s) found:", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        return 1
    print("  lint clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
