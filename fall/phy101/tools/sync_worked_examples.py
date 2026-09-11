"""Embed the authored, fully solved question-bank examples in source notebooks.

The JSON files in examples/ hold the explanations and precise bank references.
Original Word files are not required to rebuild the notebooks and are not copied
into the public course. Run this before build_calendar_notebooks.py.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path

import nbformat
from notebook_tables import format_markdown_tables

ROOT = Path(__file__).resolve().parents[1]
INTRO_ID = "phy101-bank-examples"


def read_examples():
    examples = []
    for path in sorted((ROOT / "examples").glob("worked_examples_*.json")):
        examples.extend(json.loads(path.read_text(encoding="utf-8")))
    ids = [example["id"] for example in examples]
    if len(examples) != 60 or len(ids) != len(set(ids)):
        raise ValueError("Expected 60 uniquely identified worked examples")
    for example in examples:
        assert example["module"] in range(1, 15), example["id"]
        assert example["calendar_week"] in range(1, 14), example["id"]
        assert example["markdown"].strip() and example["checks"], example["id"]
        assert {"file", "section", "question", "mode"} <= example["source"].keys()
        assert not any(c in example["markdown"] for c in "\x00\x01\x08"), example["id"]
    return examples


def example_cell(example):
    body = example["markdown"].strip()
    if not re.search(r"^#{1,6}\s", body, re.M):
        body = "### Worked example: " + example["title"] + "\n\n" + body
    return nbformat.v4.new_markdown_cell(
        format_markdown_tables(body),
        id="worked-" + example["id"],
        metadata={"phy101_worked_example": {
            "id": example["id"], "title": example["title"],
            "calendar_week": example["calendar_week"],
            "source": copy.deepcopy(example["source"]),
        }},
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    examples = read_examples()
    for module in range(1, 15):
        path = ROOT / "notebooks" / f"Week_{module:02}.ipynb"
        before = nbformat.read(path, as_version=4)
        notebook = copy.deepcopy(before)
        notebook.cells = [c for c in notebook.cells
                          if c.id != INTRO_ID and "phy101_worked_example" not in c.metadata]
        selected = [e for e in examples if e["module"] == module]
        if selected:
            position = next(i for i, cell in enumerate(notebook.cells)
                            if cell.cell_type == "markdown"
                            and re.search(r"^## Problem Set\b", cell.source, re.M))
            intro = nbformat.v4.new_markdown_cell(
                "## More worked examples / Ek çözümlü örnekler\n\n"
                "These examples connect the chapter ideas to concrete calculations. "
                "Read the complete solution one step at a time: identify the law, "
                "follow the rearrangement, then check the units and physical meaning. "
                "Return to individual examples during review.\n\n"
                "**Türkçe:** Her örnekte çözüm açık olarak verilmiştir. "
                "Yalnızca sonuca değil, iki işlem arasındaki gerekçeye odaklan. "
                "Kaynak bölüm ve soru numarası her örneğin sonunda belirtilmiştir.",
                id=INTRO_ID,
            )
            notebook.cells[position:position] = [intro] + [example_cell(e) for e in selected]
        nbformat.validate(notebook)
        if args.check:
            assert notebook == before, f"Stale worked examples: {path}"
        elif notebook != before:
            path.write_text(nbformat.writes(notebook) + "\n", encoding="utf-8", newline="\n")
        print(f"Module {module:02}: {len(selected)} fully worked examples")


if __name__ == "__main__":
    main()
