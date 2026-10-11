"""Exercise Week 7's actual teaching code on changed data and boundary cases."""
import ast
import contextlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
lesson = json.loads((ROOT/'notebooks/Week_07.ipynb').read_text())['cells']
solutions = json.loads((ROOT/'solutions/Week_07_Solutions.ipynb').read_text())['cells']


def run(cell, **inputs):
    tree = ast.parse(''.join(cell['source']))
    # Replace supplied data only; retain the real algorithm. Fixed-example asserts
    # are replaced by the changed-case expectations below.
    remaining = dict(inputs)
    body = []
    for node in tree.body:
        if isinstance(node, ast.Assert):
            continue
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            name = node.targets[0].id
            if name in remaining:
                node.value = ast.parse(repr(remaining.pop(name)), mode='eval').body
        body.append(node)
    assert not remaining, remaining
    tree.body = body
    namespace = {}
    with contextlib.redirect_stdout(io.StringIO()) as output:
        exec(compile(ast.fix_missing_locations(tree), '<Week 7 boundary>', 'exec'), namespace)
    return namespace, output.getvalue()


def answer(exercise):
    return next(c for c in solutions if c['cell_type'] == 'code' and f'[EX{exercise}]' in ''.join(c['source']))


checks = 0
for tally, expected in [({}, None), ({"WARN": 2, "OK": 2}, "WARN"), ({"OK": 1, "ERR": 3}, "ERR")]:
    state, output = run(lesson[39], tally=tally)
    assert state['most_common'] == expected
    if expected is None: assert 'No status codes' in output
    checks += 1
for groups, expected in [({}, None), ({"T1": []}, None), ({"T1": [], "T2": [-2]}, "T2"), ({"T1": [3], "T2": [3]}, "T1"), ({"T1": [-5], "T2": [-2]}, "T2")]:
    state, output = run(answer(5), groups=groups)
    assert state['warmest'] == expected
    if expected is None: assert 'No sensor readings available' in output
    checks += 1
for log, expected in [([], {}), (["ERR", "OK", "ERR"], {"ERR": 2, "OK": 1})]:
    state, _ = run(answer(2), status_log=log)
    assert state['tally'] == expected and list(state['tally']) == list(expected)
    checks += 1
for readings, expected in [([], {}), ([("T2", 1), ("T1", 9), ("T2", 2)], {"T2": [1, 2], "T1": [9]})]:
    state, _ = run(answer(4), readings=readings)
    assert state['groups'] == expected
    checks += 1
for measured, missing, unseen in [([], [], ["T1", "T2", "T3", "P1"]), ([("H1", 1), ("H1", 2)], ["H1"], ["T1", "T2", "T3", "P1"]), ([("T1", 60)], [], ["T2", "T3", "P1"])]:
    state, output = run(answer(12), measured=measured)
    assert state['missing'] == missing and state['not_measured'] == unseen
    if measured == [("T1", 60)]: assert 'within limit 60.0' in output
    checks += 1
for user in [{}, {"rate_hz": 0, "new_setting": False}]:
    state, _ = run(answer(8), user=user)
    assert state['defaults']['rate_hz'] == 10
    assert state['merged'] == {**state['defaults'], **user}
    assert state['merged'] is not state['defaults']
    checks += 1
for samples, expected in [([(5, 19)], (5, 19, 0)), ([(0, 24), (10, 24)], (0, 24, 2))]:
    state, _ = run(answer(10), samples=samples)
    assert (state['peak_t'], state['peak_v'], state['warm']) == expected
    checks += 1
state, output = run(answer(1), calibration={"T1": 0}, requested=["T1", "H1"])
assert 'T1: factor 0' in output and 'H1: no calibration factor' in output
checks += 1
for index, cell in enumerate(solutions):
    if cell['cell_type'] == 'code':
        _, output = run(cell)
        expected = ''.join(solutions[index+1]['source']).split('```text\n')[1].split('```')[0]
        assert output == expected, f'Solution cell {index+1}: expected-result mismatch\n{output!r}\n{expected!r}'
print(f'Passed {checks} changed-data/boundary cases and all 13 published solution outputs.')
