"""Check the worked-example data, calculations, and optional local bank references."""
from __future__ import annotations

import argparse
import ast
import json
import math
import re
from pathlib import Path

from sync_worked_examples import read_examples

FUNCTIONS = {name: getattr(math, name) for name in
             ["sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
              "radians", "degrees", "exp", "log", "log10", "hypot"]}
FUNCTIONS.update(abs=abs, round=round)
NAMES = {**FUNCTIONS, "pi": math.pi, "e": math.e, "math": math}


def calculate(expression):
    tree = ast.parse(expression, mode="eval")
    allowed = (ast.Expression, ast.Constant, ast.BinOp, ast.UnaryOp,
               ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod,
               ast.UAdd, ast.USub, ast.Call, ast.Name, ast.Load, ast.Attribute)
    for node in ast.walk(tree):
        assert isinstance(node, allowed), f"Unsupported calculation: {expression}"
        if isinstance(node, ast.Name):
            assert node.id in NAMES, f"Unknown numeric name: {node.id}"
        if isinstance(node, ast.Attribute):
            assert isinstance(node.value, ast.Name) and node.value.id == "math"
            assert node.attr in FUNCTIONS or node.attr in {"pi", "e"}
        if isinstance(node, ast.Constant):
            assert isinstance(node.value, (int, float))
    result = eval(compile(tree, "<worked-example-calculation>", "eval"),
                  {"__builtins__": {}}, NAMES)
    assert math.isfinite(result), expression
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path,
                        help="Optional directory of extracted *_questions.json bank records")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    examples = read_examples()
    checks = []
    failures = []
    source_cache = {}
    for example in examples:
        label = example["id"]
        text = example["markdown"]
        assert "Türkçe" in text, f"Missing Turkish explanation: {label}"
        assert "<details" not in text.lower(), f"Hidden worked solution: {label}"
        assert not re.search(r"^[A-E]\)\s", text, re.M), f"Answer choices in solved example: {label}"
        assert example["source"]["file"] in text, f"Missing visible source reference: {label}"
        for check in example["checks"]:
            value = calculate(check["calculation"])
            passed = math.isclose(value, check["expected"], rel_tol=5e-4, abs_tol=1e-8)
            result = dict(example=label, quantity=check["quantity"],
                          calculated=value, expected=check["expected"], unit=check["unit"], passed=passed)
            checks.append(result)
            if not passed: failures.append(result)
        if args.source_root:
            source = example["source"]
            filename = Path(source["file"]).stem + "_questions.json"
            if filename not in source_cache:
                source_cache[filename] = json.loads((args.source_root / filename).read_text(encoding="utf-8"))
            normalize = lambda s: re.sub(r"\s+", "", s).lower()
            records = [q for q in source_cache[filename]
                       if q["number"] == source["question"]
                       and normalize(q["section"]) == normalize(source["section"])]
            assert len(records) == 1, f"Unresolved source anchor: {label}, {source}"
            assert not records[0]["contains_object"], f"Source needs object/figure review: {label}"
    report = dict(examples=len(examples), numeric_checks=len(checks),
                  source_anchors_checked=bool(args.source_root), failures=failures, checks=checks)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "checks"}, ensure_ascii=False))
    return bool(failures)


if __name__ == "__main__":
    raise SystemExit(main())
