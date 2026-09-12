"""Execute PHY101 notebooks in fresh kernels and keep QA copies outside source.

python validate_notebooks.py notebook.ipynb ... --output-dir PATH
Requires nbformat, nbclient, ipykernel and the libraries used by each notebook.

Every demonstration panel is exercised after the notebook has run: one control
of each panel is moved and the panel must redraw without an error. The panels
record their own results in Python, so no front end is needed.

nbclient normally imitates a front end for Output widgets by sending state
updates back on the kernel's shell socket; with zmq/asyncio that can leave the
client blind to the execute reply until the cell timeout. Comm messages are
therefore ignored here: widget outputs land in the cell outputs instead and
nothing is sent back to the kernel.
"""
import argparse
import hashlib
import json
from pathlib import Path
import time

import nbformat
from nbclient import NotebookClient

PANEL_QA = """
import json as _json
_report = []
for _p in _physics_panels:
    _before = _p.updates
    for _name, _c in _p.controls.items():
        if isinstance(_c, widgets.fixed) or not hasattr(_c, 'min'):
            continue
        _c.value = _c.min if _c.value != _c.min else _c.max
        break
    _report.append({'f': _p.f.__name__, 'seconds': round(_p.seconds, 3), 'live': _p.live,
                    'outputs': _p.last_outputs, 'error': (_p.error or '')[-300:], 'changed': _p.updates > _before})
print('PANELREPORT ' + _json.dumps(_report))
assert not _physics_callback_errors, _physics_callback_errors
assert all(r['outputs'] > 0 for r in _report), 'a demonstration produced no output'
assert all(r['changed'] for r in _report), 'a demonstration did not redraw after a control change'
print('Demonstration panels checked:', len(_report))
"""


class PlainClient(NotebookClient):
    """nbclient without Output-widget front-end mimicry (see module docstring)."""

    def handle_comm_msg(self, outs, msg, cell_index):
        return None


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
        has_panels = any("class PhysicsPanel" in c.source for c in book.cells if c.cell_type == "code")
        if has_panels:
            book.cells.append(nbformat.v4.new_code_cell(PANEL_QA))
        result = {"notebook": str(path.resolve()), "source_cells": source_cells, "code_sha256": code_digest}
        if not any(c.cell_type == "code" for c in book.cells):
            result["status"] = "paper-only"
        else:
            def cell_started(cell, cell_index, **_):
                (args.output_dir / (path.stem + ".progress.json")).write_text(
                    json.dumps({"cell": cell_index, "total": len(book.cells)}), encoding="utf-8")
            client = PlainClient(book, timeout=args.timeout, kernel_name="python3", on_cell_start=cell_started,
                                 store_widget_state=False,
                                 resources={"metadata": {"path": str(path.parent.resolve())}})
            try:
                client.execute()
                result["status"] = "passed"
                if has_panels:
                    for output in book.cells[-1].get("outputs", []):
                        for line in output.get("text", "").splitlines():
                            if line.startswith("PANELREPORT "):
                                result["panels"] = json.loads(line[len("PANELREPORT "):])
            except Exception as error:
                result.update(status="failed", error=str(error)[-7000:])
                failed = True
        result["seconds"] = round(time.monotonic() - started, 1)
        nbformat.write(book, args.output_dir / path.name)
        (args.output_dir / (path.stem + ".json")).write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({k: v for k, v in result.items() if k not in ("error", "panels")}), flush=True)
        if result.get("panels"):
            slow = [p for p in result["panels"] if p["seconds"] > 0.5]
            print(f"  {len(result['panels'])} panels redrawn; slowest {max(p['seconds'] for p in result['panels']):.2f} s"
                  + (f"; slow: {[p['f'] for p in slow]}" if slow else ""), flush=True)
        if result.get("error"):
            print(result["error"][-2500:], flush=True)
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
