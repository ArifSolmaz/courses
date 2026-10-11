"""Exercise Week 8's actual teaching code on changed data and boundary cases."""
import ast
import contextlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
lesson = json.loads((ROOT/'notebooks/Week_08.ipynb').read_text())['cells']
solutions = json.loads((ROOT/'solutions/Week_08_Solutions.ipynb').read_text())['cells']


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
        exec(compile(ast.fix_missing_locations(tree), '<Week 8 boundary>', 'exec'), namespace)
    return namespace, output.getvalue()


def answer(exercise):
    return next(c for c in solutions if c['cell_type'] == 'code' and c.get('metadata',{}).get('cp1_exercise') == str(exercise))


checks = 0
for sentence, expected in [("", 0), ("  one\ttwo\nthree ", 3)]:
    state, _ = run(answer(1), sentence=sentence)
    assert len(state['words']) == expected
    checks += 1
for sentence, expected in [("  hELLO   wORLD ", "Hello World"), ("", "")]:
    state, _ = run(answer(5), sentence=sentence)
    assert state['result'] == expected
    checks += 1
for phrase, expected in [("  central   processing unit ", "CPU"), ("", "")]:
    state, _ = run(answer(8), phrase=phrase)
    assert state['acronym'] == expected
    checks += 1
for text, expected in [("a12-b", "a##-b"), ("", "")]:
    state, _ = run(answer(9), text=text)
    assert state['masked'] == expected
    checks += 1
for data, count, highest_sensor in [("", 0, ""), ("  \n", 0, ""), ("t1,A,-5\n\nt2,B,-2", 2, "B"), ("t1,A,3\nt2,B,3", 2, "A")]:
    state, output = run(answer(11), log_data=data)
    assert state['count'] == count and state['highest_sensor'] == highest_sensor
    if not count: assert 'No readings available.' in output
    checks += 1
for text, search, expected in [("aaa", "aa", [0, 1]), ("abc", "z", []), ("abc", "", []), ("", "a", [])]:
    state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 52), text=text, search=search)
    assert state['positions'] == expected
    if not search: assert 'non-empty search term' in output
    checks += 1
state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 65), data="")
assert 'No student records.' in output
checks += 1
state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 57), students=[('Test', 40, 100)])
assert state['grade'] == 70
checks += 1
for sample_text, special in [('Aa1 ', False), ('Aa1!', True)]:
    state, output = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 81), sample_text=sample_text)
    assert state['has_special'] is special
    assert 'Strong' not in output and 'Weak' not in output
    checks += 1
# Verify each answer against both the solution and student-facing expected output.
import re
for index, cell in enumerate(solutions):
    if cell['cell_type'] != 'code': continue
    _, output = run(cell)
    expected_cell = next(c for c in solutions[index+1:] if c['cell_type']=='markdown' and '```text\n' in ''.join(c['source']))
    expected = ''.join(expected_cell['source']).split('```text\n')[1].split('```')[0]
    assert output == expected, f'Solution cell {index+1}: expected-result mismatch'
    marker = cell['metadata']['cp1_exercise']
    student_index = next(i for i,c in enumerate(lesson) if c['cell_type']=='code' and c.get('metadata',{}).get('cp1_exercise') == marker)
    expected_student = ''.join(lesson[student_index-1]['source']).split('```\n')[1].split('```')[0]
    assert output == expected_student, f'Exercise {marker}: student/solution output mismatch'
print(f'Passed {checks} boundary cases and all 13 student/solution expected outputs.')
