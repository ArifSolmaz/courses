"""Exercise Week 6's actual teaching code on changed data and boundary cases."""
import ast
import contextlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
lesson = json.loads((ROOT/'notebooks/Week_06.ipynb').read_text())['cells']
solutions = json.loads((ROOT/'solutions/Week_06_Solutions.ipynb').read_text())['cells']


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
        exec(compile(ast.fix_missing_locations(tree), '<Week 6 boundary>', 'exec'), namespace)
    return namespace, output.getvalue()


def answer(exercise):
    return next(c for c in solutions if c['cell_type'] == 'code' and c.get('metadata',{}).get('cp1_exercise') == str(exercise))


checks = 0
for values, expected in [([], 'No data'), ([7], 'no following sample'), ([-5, -2, -7], 'What followed the peak: -7'), ([9, 3, 9], 'What followed the peak: 3')]:
    state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 35), temps_c=values)
    assert expected in output
    checks += 1
state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 33), current_a=[])
assert state['average'] is None and 'no data' in output
checks += 1
for values, warm_up, expected in [([], 3, None), ([1, 2], 3, None), ([3, 6], 0, 4.5)]:
    state, output = run(answer(6), rpm=values, warm_up=warm_up)
    assert state['average'] == expected
    if expected is None:
        assert 'No steady samples' in output
    checks += 1
for values, expected in [([5], None), ([5, 5, 5], None), ([-5, -2, -7], -5), ([3, 9, 9, 8], 8)]:
    state, _ = run(answer(9), pressures_kpa=values)
    assert state['second'] == expected
    checks += 1
for values, expected in [([], (0, -1)), ([80, 79], (0, -1)), ([81, 82, 80, 83, 84], (2, 0)), ([81, 82, 83], (3, 0))]:
    state, _ = run(answer(10), temps_c=values)
    assert (state['longest'], state['longest_start']) == expected
    checks += 1
for values, expected in [([], []), ([1], []), ([0, 1], [1]), ([1, 1, 0, 1], [3])]:
    state, _ = run(answer(12), samples=values)
    assert state['rising'] == expected
    checks += 1
# Match published expected-result blocks to the real solution output.
for index, cell in enumerate(solutions):
    if cell['cell_type'] == 'code':
        _, output = run(cell)
        expected_cell = next(c for c in solutions[index+1:] if c['cell_type']=='markdown' and '```text\n' in ''.join(c['source']))
        expected = ''.join(expected_cell['source']).split('```text\n')[1].split('```')[0]
        assert output == expected, f'Solution cell {index+1}: expected-result mismatch'
print(f'Passed {checks} changed-data/boundary cases and all 13 published solution outputs.')
