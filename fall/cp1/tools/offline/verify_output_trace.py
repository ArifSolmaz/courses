"""Verify real output attribution and unchanged Weeks 1–14 execution."""
import contextlib
import io
import json
import sys
import types
import tempfile
import os
import warnings
os.environ["MPLBACKEND"] = "Agg"
warnings.filterwarnings("ignore", message="FigureCanvasAgg is non-interactive")
from pathlib import Path
from unittest.mock import patch

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

# Input prompts are output belonging to the input() call, including repeated calls.
with patch('sys.stdin', io.StringIO('5\n0\n')):
    result = traced('value = int(input("Value: "))\nwhile value != 0:\n    print(value)\n    value = int(input("Next: "))\nprint("done")\n')
assert ''.join(t for t, lines in result if 1 in lines) == 'Value: '
assert ''.join(t for t, lines in result if 2 in lines) == '5\nNext: '
assert ''.join(t for t, lines in result if 4 in lines) == 'Next: '
result = traced('i = 0\nwhile i < 4:\n    i += 1\n    if i == 2:\n        continue\n    print(i, end=" ")\nprint("done")\n')
assert ''.join(t for t, lines in result if 6 in lines) == '1 3 4 '
assert not any(5 in lines for _, lines in result)

# File writes are not printed output; only the later display owns the text.
with tempfile.TemporaryDirectory(prefix='cp1_trace_file_') as folder, contextlib.chdir(folder):
    result = traced('with open("demo.txt", "w") as file:\n    file.write("saved")\nwith open("demo.txt") as file:\n    print(file.read())\n')
    assert ''.join(t for t, _ in result) == 'saved\n'
    assert all(1 not in lines and 2 not in lines for _, lines in result)
    assert all(3 in lines and 4 in lines for _, lines in result)
    assert Path('demo.txt').read_text() == 'saved'

count = 0
for relative in [f'{folder}/Week_{week:02d}{suffix}.ipynb' for week in range(1,15) for folder,suffix in [('notebooks',''),('solutions','_Solutions')]]:
    # Independent persistent folders prevent append/write examples from interfering
    # with each other or touching the repository during either execution.
    with tempfile.TemporaryDirectory(prefix='cp1_trace_parity_') as folder:
        plain_dir, traced_dir = Path(folder)/'plain', Path(folder)/'traced'
        plain_dir.mkdir(); traced_dir.mkdir()
        plain_namespace, traced_namespace = {}, {}
        for i, cell in enumerate(json.loads((ROOT/relative).read_text())['cells']):
            if cell['cell_type'] != 'code':
                continue
            source = ''.join(cell['source'])
            plain = io.StringIO()
            responses = '\n'.join(cell.get('metadata', {}).get('offline_inputs', [])) + '\n'
            with contextlib.chdir(plain_dir), contextlib.redirect_stdout(plain), patch('sys.stdin', io.StringIO(responses)):
                exec(compile(source, f'Cell {i+1}', 'exec'), plain_namespace)
            with contextlib.chdir(traced_dir), patch('sys.stdin', io.StringIO(responses)):
                actual = traced(source, traced_namespace, f'Cell {i+1}')
            # The directory-report lesson prints its cwd; normalize only that path.
            expected = plain.getvalue().replace(str(plain_dir.resolve()), '<working-directory>')
            observed = ''.join(text for text, _ in actual).replace(str(traced_dir.resolve()), '<working-directory>')
            assert observed == expected, (relative, i)
            count += 1
        plain_files = {str(p.relative_to(plain_dir)): p.read_bytes() for p in plain_dir.rglob('*') if p.is_file()}
        traced_files = {str(p.relative_to(traced_dir)): p.read_bytes() for p in traced_dir.rglob('*') if p.is_file()}
        assert plain_files == traced_files, (relative, 'file contents changed under tracing')
print(f'Output attribution checks passed; all {count} Week 1–14 cells retain identical stdout and generated file contents.')
