"""Check CP1 coverage and optionally execute every lesson/solution notebook.

Usage: python tools/verify_course.py --execute --save-outputs
Requires nbformat, nbclient and a Python 3 Jupyter kernel for execution.
Sample input replies are audit fixtures; original lesson source is preserved.
"""
from pathlib import Path
import argparse
import concurrent.futures
import contextlib
import io
import json
import re
import tempfile
import warnings
from html.parser import HTMLParser
from urllib.parse import unquote, urlparse

import nbformat

ROOT = Path(__file__).resolve().parents[1]

INPUT_SETUP = '''
_audit_prompt_counts = {}
_audit_inputs_used = []
def _audit_input(prompt=""):
    text = str(prompt).lower()
    key = text
    if "what is your name" in text: values = ["Ada"]
    elif "age (1-120)" in text: values = ["0", "121", "20"]
    elif "age" in text: values = ["20"]
    elif "height" in text: values = ["1.75"]
    elif "weight" in text: values = ["70"]
    elif "guess a number" in text: values = ["3"]
    elif "try again" in text: values = ["7"]
    elif "something" in text and "quit" in text: values = ["hello", "quit"]
    elif "0 to stop" in text: values = ["2", "3", "0"]
    elif "score" in text: values = ["80"]
    elif "want to continue" in text: values = ["yes", "no"]
    elif "yes or no" in text: values = ["maybe", "yes"]
    elif "how many numbers" in text: values = ["3"]
    elif "enter number" in text: values = ["4"]
    else: raise RuntimeError("Unrecognized audit input prompt: " + str(prompt))
    count = _audit_prompt_counts.get(key, 0)
    if count >= len(values):
        raise RuntimeError("Audit input exhausted: " + str(prompt))
    _audit_prompt_counts[key] = count + 1
    answer = values[count]
    _audit_inputs_used.append((str(prompt), answer))
    print(str(prompt) + answer)
    return answer
input = _audit_input
'''


def source(cell):
    value = cell.get("source", "")
    return value if isinstance(value, str) else "".join(value)


def normalize_runtime_path(output, directory):
    """Keep machine-specific temporary folder names out of saved examples."""
    if output.get("output_type") == "stream":
        text = output["text"]
        for spelling in (str(directory), directory.as_posix()):
            text = text.replace(spelling, "[runtime folder]")
        output["text"] = text


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.links.append(value)


def check_page_links():
    checked = 0
    for page in (ROOT / "web").glob("*.html"):
        parser = LinkParser()
        parser.feed(page.read_text(encoding="utf-8"))
        for link in parser.links:
            url = urlparse(link)
            if not url.path or link.startswith("#"):
                continue
            if url.scheme:
                marker = "/fall/cp1/"
                if url.netloc == "colab.research.google.com" and marker in url.path:
                    target = ROOT / unquote(url.path.split(marker, 1)[1])
                else:
                    continue
            else:
                target = (page.parent / unquote(url.path)).resolve()
            assert target.is_file(), (page.name, link, "Missing file")
            checked += 1
    return checked


def structural_checks():
    manifest = json.loads((ROOT / "course_manifest.json").read_text(encoding="utf-8"))
    assert len(manifest["weeks"]) == 14
    assert manifest["assessment"] == {"midterm": 50, "final": 50}
    totals = {"notebooks": 0, "exercises": 0, "solution_sections": 0, "code_cells": 0}
    for week in manifest["weeks"]:
        lesson = json.loads((ROOT / week["notebook"]).read_text(encoding="utf-8"))
        solutions = json.loads((ROOT / week["solutions"]).read_text(encoding="utf-8"))
        for nb in (lesson, solutions):
            with warnings.catch_warnings():
                warnings.simplefilter("error")
                nbformat.validate(nb)
            ids = [c["id"] for c in nb["cells"]]
            assert len(ids) == len(set(ids)), "Duplicate notebook cell IDs"
            totals["notebooks"] += 1
            totals["code_cells"] += sum(c["cell_type"] == "code" for c in nb["cells"])
        expected = {ex["id"] for ex in week["exercises"]}
        actual = {f"EX{int(match.group(1)):02d}" for cell in lesson["cells"]
                  if cell["cell_type"] == "code"
                  for match in re.finditer(r"^\s*#\s*✏️\s*\[EX(\d+)\]", source(cell), re.M)}
        assert actual == expected, (week["week"], "Manifest exercise list is stale")
        sections = [c.get("metadata", {}).get("cp1", {}).get("solution_for") for c in solutions["cells"] if c["cell_type"] == "markdown"]
        if week["bridge"]:
            expected.add("BRIDGE")
        for ex_id in expected:
            assert sections.count(ex_id) == 1, (week["week"], ex_id, "missing or duplicate solution section")
        totals["exercises"] += len(week["exercises"])
        totals["solution_sections"] += len(expected)
        for i, cell in enumerate(solutions["cells"]):
            if cell["cell_type"] != "markdown" or cell.get("metadata", {}).get("cp1", {}).get("solution_for") not in expected:
                continue
            following = []
            for later in solutions["cells"][i + 1:]:
                if later["cell_type"] == "markdown" and later.get("metadata", {}).get("cp1", {}).get("solution_for") in expected:
                    break
                if later["cell_type"] == "code":
                    following.append(source(later))
            assert following and any(re.search(r"^[^#\s]", s, re.M) for s in following), (week["week"], "Empty solution", source(cell)[:80])
        helper = next(source(c) for c in lesson["cells"] if c["cell_type"] == "code" and "def exercise_checkpoint(" in source(c))
        ns = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(helper, ns)
            assert ns["record_checkpoint"](1, [("matches", True), ("retry", False)]) == (1, 2)
            ns["In"] = [source(c) for c in lesson["cells"] if c["cell_type"] == "code"]
            assert ns["exercise_checkpoint"](5, [], expected=week["core"]) == (0, week["core"])
            assert ns["exercise_checkpoint"](5, [1, 2, 2], expected=week["core"]) == (2, week["core"])
            assert ns["exercise_checkpoint"](5, [True, 1], expected=week["core"]) == (0, week["core"])
            assert 5 not in ns["_checkpoint_results"], "Invalid self-report retained an earlier result"
            assert ns["exercise_checkpoint"](5, [999], expected=week["core"]) == (0, week["core"])
        assert "globals().get(\"In\"" not in helper
        assert not any("counts only exercise cells" in source(c) for c in lesson["cells"])
    assert totals["exercises"] == 171
    assert totals["solution_sections"] == 184  # 171 exercises + 13 bridges/previews
    dashboard = (ROOT / "web" / "CP1_Course_Dashboard.html").read_text(encoding="utf-8")
    assert len(re.findall(r'class="week-panel(?: active)?"', dashboard)) == 14
    assert "Week_14_Starter" not in dashboard and "Week_14_Build" not in dashboard
    assert "38 valid" not in dashboard and "auto-graded" not in dashboard
    assert "12-15 graded exercises" not in (ROOT / "web" / "CP1_Syllabus.html").read_text(encoding="utf-8")
    totals["page_links"] = check_page_links()
    return totals


def execute_notebook(path, save_outputs=False):
    from nbclient import NotebookClient
    nb = nbformat.read(path, as_version=4)
    # Reset fixture state per notebook. Repeated prompts within distinct cells
    # are supported by clearing their counts just before each original cell.
    # Keep raw JSON source arrays/strings intact when saving new outputs.
    original = json.loads(path.read_text(encoding="utf-8"))
    augmented = [nbformat.v4.new_code_cell(INPUT_SETUP)]
    original_indexes = []
    for cell in nb.cells:
        if cell.cell_type == "code":
            augmented.append(nbformat.v4.new_code_cell("_audit_prompt_counts.clear()"))
        original_indexes.append(len(augmented))
        augmented.append(cell)
    augmented.append(nbformat.v4.new_code_cell("assert not _audit_inputs_used" if "_Solutions" in path.name else "assert len(_audit_inputs_used) <= 40"))
    nb.cells = augmented
    with tempfile.TemporaryDirectory(prefix="cp1-verify-") as temporary:
        target = Path(temporary).resolve()
        assert target.is_relative_to(Path(tempfile.gettempdir()).resolve())
        client = NotebookClient(nb, timeout=90, kernel_name="python3", resources={"metadata": {"path": str(target)}}, allow_errors=False)
        client.execute()
    execution_number = 0
    for dest, index in zip(original["cells"], original_indexes):
        if dest["cell_type"] == "code":
            execution_number += 1
            dest["outputs"] = nb.cells[index].outputs
            dest["execution_count"] = execution_number
            for output in dest["outputs"]:
                normalize_runtime_path(output, target)
                if output.output_type == "execute_result":
                    output.execution_count = execution_number
    if save_outputs:
        from prepare_notebooks import save
        save(path, original)
    return {"notebook": str(path.relative_to(ROOT)), "code_cells": sum(c["cell_type"] == "code" for c in original["cells"]), "status": "passed"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--save-outputs", action="store_true")
    parser.add_argument("--match", default="Week_*.ipynb", help="Filename glob for bounded reruns")
    parser.add_argument("--kind", choices=("all", "lessons", "solutions"), default="all")
    args = parser.parse_args()
    print(json.dumps({"structure": structural_checks()}, ensure_ascii=False), flush=True)
    if args.execute:
        paths = []
        if args.kind in ("all", "lessons"):
            paths += sorted((ROOT / "notebooks").glob(args.match))
        if args.kind in ("all", "solutions"):
            paths += sorted((ROOT / "solutions").glob(args.match))
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(execute_notebook, path, args.save_outputs): path for path in paths}
            for future in concurrent.futures.as_completed(futures):
                path = futures[future]
                try:
                    result = future.result()
                except Exception as error:
                    result = {"notebook": str(path.relative_to(ROOT)), "status": "failed", "error": str(error)}
                results.append(result)
                print(json.dumps(result, ensure_ascii=False), flush=True)
        report = {"results": results, "passed": sum(r["status"] == "passed" for r in results), "total": len(results)}
        report_path = Path(tempfile.gettempdir()) / "cp1-execution-report.json"
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Execution report: {report_path}", flush=True)
        if report["passed"] != report["total"]:
            raise SystemExit(1)
