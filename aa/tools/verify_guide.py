#!/usr/bin/env python3
"""Check all guide pages and run every Python example independently."""

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

from build_guide import ROOT, guide_html_outputs, source_files


class Page(HTMLParser):
    def __init__(self, text: str):
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.duplicates: list[str] = []
        self.feed(text)

    def handle_starttag(self, tag: str, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                self.duplicates.append(attrs["id"])
            self.ids.add(attrs["id"])
        for attr in ("href", "src"):
            if attr in attrs:
                self.links.append(attrs[attr])


def sha256_text(path: Path) -> str:
    return hashlib.sha256(path.read_text(encoding="utf-8").encode("utf-8")).hexdigest()


def parse_page(path: Path, cache: dict[Path, Page]) -> Page:
    resolved = path.resolve()
    if resolved not in cache:
        cache[resolved] = Page(resolved.read_text(encoding="utf-8"))
    return cache[resolved]


def check_local_links(html_outputs: list[Path]) -> tuple[list[dict[str, str]], int]:
    failures: list[dict[str, str]] = []
    cache: dict[Path, Page] = {}
    checked: set[tuple[str, str]] = set()

    for html_path in html_outputs:
        page = parse_page(html_path, cache)
        failures.extend(
            {"file": html_path.relative_to(ROOT).as_posix(), "duplicate_id": value}
            for value in page.duplicates
        )
        for link in page.links:
            parts = urlsplit(link)
            if parts.scheme or parts.netloc:
                continue
            key = (html_path.relative_to(ROOT).as_posix(), link)
            if key in checked:
                continue
            checked.add(key)

            resolved = (html_path.parent / unquote(parts.path)).resolve() if parts.path else html_path.resolve()
            if resolved.is_dir():
                resolved = resolved / "index.html"
            if not resolved.is_file():
                failures.append(
                    {
                        "file": html_path.relative_to(ROOT).as_posix(),
                        "broken_link": link,
                        "resolved": str(resolved),
                    }
                )
                continue
            if parts.fragment and resolved.suffix.lower() == ".html":
                target_page = parse_page(resolved, cache)
                if unquote(parts.fragment) not in target_page.ids:
                    failures.append(
                        {
                            "file": html_path.relative_to(ROOT).as_posix(),
                            "missing_anchor": link,
                        }
                    )

    return failures, len(checked)


def run_python_blocks(source: Path) -> tuple[list[dict[str, str]], int]:
    failures: list[dict[str, str]] = []
    text = source.read_text(encoding="utf-8")
    blocks = re.findall(r"^```python\s*\n(.*?)^```\s*$", text, re.M | re.S)
    rel = source.relative_to(ROOT).as_posix()
    for number, code in enumerate(blocks, 1):
        name = f"{rel} Python block {number}"
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
    return failures, len(blocks)


def main() -> int:
    failures: list[dict[str, str]] = []
    chapters: list[dict[str, object]] = []
    executed = 0

    for source in source_files():
        text = source.read_text(encoding="utf-8")
        block_failures, blocks = run_python_blocks(source)
        failures.extend(block_failures)
        executed += blocks
        chapter = {
            "source": source.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "words": len(re.findall(r"\S+", text)),
            "python_examples": blocks,
            "practice_solutions": len(re.findall(r"^#### Solution\b", text, re.M)),
        }
        chapters.append(chapter)
        print(f"  {chapter['source']}: {chapter['words']:,} words; {blocks} independently executed examples")

    html_outputs = guide_html_outputs()
    missing_outputs = [path for path in html_outputs if not path.is_file()]
    failures.extend({"missing_output": path.relative_to(ROOT).as_posix()} for path in missing_outputs)
    link_failures, checked_links = check_local_links([path for path in html_outputs if path.is_file()])
    failures.extend(link_failures)

    week_chapters = [c for c in chapters if "/weeks/" in str(c["source"])]
    deepening_chapters = [c for c in chapters if "/deepening/" in str(c["source"])]
    if len(week_chapters) != 14:
        failures.append({"week_count": str(len(week_chapters))})
    if len(deepening_chapters) != 14:
        failures.append({"deepening_week_count": str(len(deepening_chapters))})

    artifact_paths = [
        ROOT / "COURSE_GUIDE.md",
        *html_outputs,
        ROOT / "assets" / "guide.css",
        ROOT / "assets" / "guide.js",
    ]
    report = {
        "status": "passed" if not failures else "failed",
        "hash_normalization": "UTF-8 text with LF line endings",
        "guide_pages": len(html_outputs),
        "weekly_chapters": len(week_chapters),
        "deepening_chapters": len(deepening_chapters),
        "total_words": sum(int(c["words"]) for c in chapters),
        "python_examples_executed": executed,
        "weekly_practice_solutions": sum(int(c["practice_solutions"]) for c in week_chapters),
        "unique_local_links_checked": checked_links,
        "artifacts": {
            path.relative_to(ROOT).as_posix(): sha256_text(path)
            for path in artifact_paths
            if path.is_file()
        },
        "sources": chapters,
        "failures": failures,
    }
    (ROOT / "tools" / "guide" / "verification.json").write_bytes(
        (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    )
    print(json.dumps({k: v for k, v in report.items() if k not in ("sources", "artifacts")}, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
