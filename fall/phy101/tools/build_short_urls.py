#!/usr/bin/env python3
"""
Generate the /phy101/wN/ redirect pages for the short-URL repository.

    python3 fall/phy101/tools/build_short_urls.py

Writes tools/short-urls/phy101/wN/index.html for every week in calendar.json.
Those files belong in ArifSolmaz/arifsolmaz.github.io, not here; see
tools/short-urls/README.md. They contain no teaching content, so the rule in
PUBLIC_URLS.md still holds: that repository routes, this one teaches.
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "tools" / "short-urls" / "phy101"
DEST = "https://arifsolmaz.github.io/courses/fall/phy101/w{n}/"

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>PHY101 Week {n:02d} — {title}</title>
<link rel="canonical" href="{dest}">
<meta http-equiv="refresh" content="0; url={dest}">
<meta name="robots" content="noindex">
<script>location.replace("{dest}");</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{{color-scheme:light dark}}body{{margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;text-align:center;background:#fbfaf8;color:#22201d;font:400 1rem/1.7 'Source Serif 4',Georgia,serif}}p{{max-width:44ch;margin:0 0 1.2rem}}.tag{{font:500 .68rem/1.6 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#c2410c}}a{{display:inline-block;padding:.55rem 1.2rem;border:1px solid #c2410c;border-radius:999px;color:#c2410c;text-decoration:none;font-weight:600;font-family:'Syne',system-ui,sans-serif}}@media(prefers-color-scheme:dark){{body{{background:#12130f;color:#e4e2d9}}a,.tag{{color:#fb923c}}a{{border-color:#fb923c}}}}</style>
</head>
<body>
<main>
<p class="tag">PHY101 &middot; Week {n:02d}</p>
<p><strong>{title}</strong><br>Taking you to the week notes.</p>
<a href="{dest}">Open Week {n:02d}</a>
</main>
</body>
</html>
"""


def main():
    calendar = json.loads((ROOT / "calendar.json").read_text(encoding="utf-8"))
    for wk in calendar["weeks"]:
        n = wk["week"]
        target = OUT / f"w{n}" / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            TEMPLATE.format(n=n, title=wk["title_en"], dest=DEST.format(n=n)),
            encoding="utf-8")
    print(f"  wrote {len(calendar['weeks'])} redirect pages under {OUT.relative_to(ROOT)}")
    print("  copy them into ArifSolmaz/arifsolmaz.github.io at /phy101/wN/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
