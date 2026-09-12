"""Embed the shared demonstration interface in every PHY101 notebook.

Usage: python fall/phy101/tools/refresh_notebook_interface.py [notebook ...]
Default targets: notebooks/Week_*.ipynb and extensions/*.ipynb.

For each notebook this script
* replaces the source of the cell with id ``phy101-widget-layout`` with the
  current ``physics_widgets.py`` (or inserts that cell after the first setup
  cell that imports ipywidgets when it is missing),
* keeps demonstration code collapsed (Colab form view, hidden source),
* clears stale code outputs and execution counts,
* formats plain pipe tables in Markdown cells as Colab-safe HTML tables.

Physics explanations, examples, problems and answers are never changed.
"""
from pathlib import Path
import json
import re
import sys

from notebook_tables import format_markdown_tables

ROOT = Path(__file__).resolve().parents[1]
HELPER_ID = "phy101-widget-layout"
HELPER_TITLE = "#@title Run once — prepare the demonstration controls\n"


def lines(text):
    return text.splitlines(keepends=True)


def refresh(path):
    raw = path.read_bytes()
    newline = "\r\n" if raw.count(b"\r\n") > raw.count(b"\n") / 2 else "\n"
    notebook = json.loads(raw.decode("utf-8"))
    helper = HELPER_TITLE + Path(__file__).with_name("physics_widgets.py").read_text(encoding="utf-8")
    helper_cell = {"cell_type": "code", "id": HELPER_ID,
                   "metadata": {"cellView": "form", "jupyter": {"source_hidden": True}, "tags": ["hide-input"]},
                   "source": lines(helper), "execution_count": None, "outputs": []}
    cells = [c for c in notebook["cells"] if c.get("id") != HELPER_ID]
    rebuilt = []
    inserted = False
    for cell in cells:
        if cell["cell_type"] == "code":
            source = "".join(cell["source"])
            cell["execution_count"] = None
            cell["outputs"] = []
            cell.setdefault("metadata", {}).update({"cellView": "form", "jupyter": {"source_hidden": True}})
            cell["metadata"]["tags"] = list(dict.fromkeys(cell["metadata"].get("tags", []) + ["hide-input"]))
            rebuilt.append(cell)
            if not inserted and re.search(r"(?:import ipywidgets|from ipywidgets import)", source):
                rebuilt.append(helper_cell)
                inserted = True
        else:
            cell["source"] = lines(format_markdown_tables("".join(cell["source"])))
            rebuilt.append(cell)
    if any(c["cell_type"] == "code" for c in cells) and not inserted:
        raise ValueError(f"No setup cell importing ipywidgets found in {path}")
    notebook["cells"] = rebuilt
    notebook["metadata"].pop("widgets", None)
    text = json.dumps(notebook, ensure_ascii=False, indent=1) + "\n"
    path.write_text(text, encoding="utf-8", newline=newline)
    print(path.name, "interface refreshed" if inserted else "paper-only, tables checked")


if __name__ == "__main__":
    paths = [Path(p) for p in sys.argv[1:]] or (
        sorted((ROOT / "notebooks").glob("Week_*.ipynb")) + sorted((ROOT / "extensions").glob("*.ipynb")))
    for path in paths:
        refresh(path)
