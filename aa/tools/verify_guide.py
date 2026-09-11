#!/usr/bin/env python3
"""Check guide links and run every Python example in an independent process."""

from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

from build_guide import ROOT, source_files


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links, self.duplicates = set(), [], []
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        for attr in ("href", "src"):
            if attr in attrs:
                self.links.append(attrs[attr])


def main():
    failures, chapters, executed = [], [], 0
    for source in source_files():
        text = source.read_text(encoding="utf-8")
        blocks = re.findall(r"^```python\s*\n(.*?)^```\s*$", text, re.M | re.S)
        for number, code in enumerate(blocks, 1):
            name = f"{source.name} Python block {number}"
            try:
                result = subprocess.run(
                    [sys.executable, "-B", "-X", "utf8", "-c", code],
                    cwd=ROOT,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    timeout=30,
                    env={**os.environ, "MPLBACKEND": "Agg", "PYTHONIOENCODING": "utf-8"},
                )
                if result.returncode:
                    failures.append({"example": name, "error": result.stderr.strip()})
            except subprocess.TimeoutExpired:
                failures.append({"example": name, "error": "Exceeded 30-second limit"})
            executed += 1
        chapter = {
            "source": source.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "words": len(re.findall(r"\S+", text)),
            "python_examples": len(blocks),
            "practice_solutions": len(re.findall(r"^#### Solution\b", text, re.M)),
        }
        chapters.append(chapter)
        print(f"  {source.name}: {chapter['words']:,} words; {len(blocks)} independently executed examples")
    target = ROOT / "guide" / "index.html"
    page = Page(target.read_text(encoding="utf-8"))
    failures.extend({"duplicate_id": value} for value in page.duplicates)
    cache = {target.resolve(): page}
    checked = set()
    for link in page.links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc or link in checked:
            continue
        checked.add(link)
        path = (target.parent / unquote(parts.path)).resolve() if parts.path else target.resolve()
        if path.is_dir():
            path = path / "index.html"
        if not path.is_file():
            failures.append({"broken_link": link, "resolved": str(path)})
        elif parts.fragment and path.suffix.lower() == ".html":
            if path not in cache:
                cache[path] = Page(path.read_text(encoding="utf-8"))
            if unquote(parts.fragment) not in cache[path].ids:
                failures.append({"missing_anchor": link})
    week_chapters = [c for c in chapters if "/weeks/" in c["source"]]
    if len(week_chapters) != 14:
        failures.append({"week_count": len(week_chapters)})
    report = {
        "status": "passed" if not failures else "failed",
        "hash_normalization": "UTF-8 text with LF line endings",
        "weekly_chapters": len(week_chapters),
        "total_words": sum(c["words"] for c in chapters),
        "python_examples_executed": executed,
        "weekly_practice_solutions": sum(c["practice_solutions"] for c in week_chapters),
        "unique_local_links_checked": len(checked),
        "artifacts": {
            str(path.relative_to(ROOT)).replace("\\", "/"): hashlib.sha256(path.read_text(encoding="utf-8").encode("utf-8")).hexdigest()
            for path in [ROOT / "COURSE_GUIDE.md", target, ROOT / "assets" / "guide.css", ROOT / "assets" / "guide.js"]
        },
        "sources": chapters,
        "failures": failures,
    }
    (ROOT / "tools" / "guide" / "verification.json").write_bytes((json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(json.dumps({k: v for k, v in report.items() if k not in ("sources", "artifacts")}, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
