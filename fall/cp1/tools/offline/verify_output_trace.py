"""Verify real output attribution and unchanged Week 4 execution."""
import contextlib
import io
import json
import sys
import types
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
records = []
module = types.ModuleType('offline_output')
module.emit = lambda text, lines: records.append((text, set(map(int, lines.split(','))) if lines else set()))
sys.modules['offline_output'] = module
from output_trace import capture


def traced(code, namespace=None, filename='Cell 1'):
    records.clear()
    with capture(code, filename):
        exec(compile(code, filename, 'exec'), {} if namespace is None else namespace)
    return list(records)


code = 'for i in range(1, 4):\n    for j in range(1, 4):\n        print(i, j)\n    print("end", i)\n'
result = traced(code)
for line, expected in [(1, 12), (2, 9), (3, 9), (4, 3)]:
    assert sum(text.count('\n') for text, lines in result if line in lines) == expected
assert ''.join(text for text, lines in result if 4 in lines) == 'end 1\nend 2\nend 3\n'
result = traced('x = 7\nprint(x, end=" ")\nprint("done")\n')
assert all(1 not in lines for _, lines in result)
assert ''.join(t for t, lines in result if 2 in lines) == '7 '
assert ''.join(t for t, lines in result if 3 in lines) == 'done\n'
result = traced('print(\n    "one\\ntwo"\n)\n')
assert all(lines == {1, 2, 3} for _, lines in result)
namespace = {}
exec(compile('def helper():\n    print("helper")\n', 'Cell 99', 'exec'), namespace)
result = traced('helper()\n', namespace)
assert ''.join(t for t, lines in result if 1 in lines) == 'helper\n'
previous = sys.stdout
try:
    traced('print("before")\nraise ValueError("test")\n')
except ValueError:
    pass
assert sys.stdout is previous
assert ''.join(t for t, _ in records) == 'before\n'
try:
    traced('for\n')
except SyntaxError as error:
    assert error.filename == 'Cell 1'
assert sys.stdout is previous

count = 0
for relative in ('notebooks/Week_04.ipynb', 'solutions/Week_04_Solutions.ipynb'):
    plain_namespace, traced_namespace = {}, {}
    for i, cell in enumerate(json.loads((ROOT/relative).read_text())['cells']):
        if cell['cell_type'] != 'code':
            continue
        source = ''.join(cell['source'])
        plain = io.StringIO()
        with contextlib.redirect_stdout(plain):
            exec(compile(source, f'Cell {i+1}', 'exec'), plain_namespace)
        actual = traced(source, traced_namespace, f'Cell {i+1}')
        assert ''.join(text for text, _ in actual) == plain.getvalue(), (relative, i)
        count += 1
print(f'Output attribution checks passed; all {count} Week 4 cells retain identical stdout.')
