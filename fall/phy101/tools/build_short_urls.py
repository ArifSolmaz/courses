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
<style>body{{font-family:system-ui,sans-serif;margin:3rem auto;max-width:34rem;padding:0 1rem;line-height:1.6}}</style>
</head>
<body>
<p>PHY101 · Week {n:02d} — <strong>{title}</strong></p>
<p>Redirecting to the week notes. If nothing happens,
<a href="{dest}">open Week {n:02d}</a>.</p>
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
