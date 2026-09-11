"""Execute PHY101 notebooks in fresh kernels and keep QA copies outside source.

python validate_notebooks.py notebook.ipynb ... --output-dir PATH
Requires nbformat, nbclient, ipykernel and the libraries used by each notebook.
"""
import argparse
import hashlib
import json
from pathlib import Path
import time

import nbformat
from nbclient import NotebookClient


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("notebooks", nargs="+", type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--timeout", type=int, default=240)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    failed = False
    for path in args.notebooks:
        started = time.monotonic()
        book = nbformat.read(path, as_version=4)
        nbformat.validate(book)
        source_cells = len(book.cells)
        code_digest = hashlib.sha256("\n".join(c.source for c in book.cells if c.cell_type == "code").encode("utf-8")).hexdigest()
        if any(c.get("id") == "phy101-widget-layout" for c in book.cells):
            book.cells.append(nbformat.v4.new_code_cell(
                "assert not _physics_callback_errors, _physics_callback_errors\n"
                "for _panel in _physics_panels:\n"
                "    assert _panel.out.outputs, ('Empty demonstration', _panel.f.__name__)\n"
                "    assert not any('Traceback (most recent call last)' in o.get('text', '') for o in _panel.out.outputs), _panel.f.__name__\n"
                "print('Widget callbacks checked:', len(_physics_panels))"))
        def cell_started(cell, cell_index, **_):
            (args.output_dir / (path.stem + ".progress.json")).write_text(
                json.dumps({"cell": cell_index, "total": len(book.cells)}), encoding="utf-8")
        client = NotebookClient(book, timeout=args.timeout, kernel_name="python3", on_cell_start=cell_started,
                                resources={"metadata": {"path": str(path.parent.resolve())}})
        result = {"notebook": str(path.resolve()), "source_cells": source_cells, "code_sha256": code_digest}
        try:
            client.execute()
            result["status"] = "passed"
        except Exception as error:
            result.update(status="failed", error=str(error)[-7000:])
            failed = True
        result["seconds"] = round(time.monotonic() - started, 1)
        nbformat.write(book, args.output_dir / path.name)
        (args.output_dir / (path.stem + ".json")).write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({k: v for k, v in result.items() if k != "error"}), flush=True)
        if result.get("error"):
            print(result["error"][-2500:], flush=True)
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
