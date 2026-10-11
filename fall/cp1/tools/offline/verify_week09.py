"""Verify Week 9's actual functions, boundary contracts and published outputs."""
import contextlib
import io
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
lesson = json.loads((ROOT / 'notebooks/Week_09.ipynb').read_text())['cells']
solutions = json.loads((ROOT / 'solutions/Week_09_Solutions.ipynb').read_text())['cells']


def run(cell, namespace=None):
    namespace = {} if namespace is None else namespace
    with contextlib.redirect_stdout(io.StringIO()) as output:
        exec(compile(''.join(cell['source']), '<Week 9>', 'exec'), namespace)
    return namespace, output.getvalue()


answers = {}
for index, cell in enumerate(solutions):
    if cell['cell_type'] != 'code':
        continue
    namespace, output = run(cell)
    marker = cell['metadata']['cp1_exercise']
    answers[marker] = namespace
    expected_cell = next(c for c in solutions[index+1:] if c['cell_type']=='markdown' and '```text\n' in ''.join(c['source']))
    expected = ''.join(expected_cell['source']).split('```text\n')[1].split('```')[0]
    assert output == expected, f'Solution {marker}: output mismatch'
    student = next(i for i, c in enumerate(lesson) if c['cell_type'] == 'code' and c.get('metadata',{}).get('cp1_exercise') == marker)
    expected = ''.join(lesson[student - 1]['source']).split('```\n')[1].split('```')[0]
    assert output == expected, f'Exercise {marker}: student output mismatch'

checks = 0

def check(function, cases):
    global checks
    for arguments, expected in cases:
        with contextlib.redirect_stdout(io.StringIO()) as output:
            actual = function(*arguments)
        assert actual == expected, (arguments, actual, expected)
        assert output.getvalue() == '', 'Calculation function unexpectedly printed'
        checks += 1


check(answers['1']['greet'], [(('Ayşe',), 'Hello, Ayşe! Welcome!')])
check(answers['2']['circle_area'], [((0,), 0), ((2,), 12.56636)])
check(answers['3']['wheel_distance'], [((0, 65), 0.0), ((1, 1000), 3.14), ((0.5, 1000), 1.57)])
check(answers['4']['max_of_two'], [((-8, -3), -3), ((-4, -4), -4)])
check(answers['5']['is_even'], [((-6,), True), ((-5,), False), ((0,), True)])
check(answers['6']['factorial'], [((0,), 1), ((1,), 1), ((6,), 720)])
check(answers['7']['is_prime'], [((-3,), False), ((0,), False), ((2,), True), ((49,), False), ((97,), True)])
check(answers['8']['power'], [((0, 0), 1), ((-2, 3), -8), ((0.5, 2), 0.25)])
check(answers['9']['count_vowels'], [(('',), 0), (('AEIOU',), 5), (('rhythm',), 0)])
check(answers['10']['average'], [(([],), 0), (([-6, -2],), -4), (([0],), 0)])
check(answers['11']['dynamic_pressure'], [((-1, 0), None), ((1.225, 0), 0.0), ((0, 10), 0.0), ((1000, -2), 2000.0)])
check(answers['12']['calculate'], [((0, '/', 2), 0.0), ((2, '/', 0), 'Error: Division by zero'), ((2, '%', 3), 'Error: Unknown operator')])
namespace, _ = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 53))
check(namespace['voltage_to_force'], [((0.5,), 0.0), ((2.5,), 50.0), ((4.5,), 100.0), ((0.49,), None), ((4.51,), None)])
namespace, _ = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 31))
check(namespace['min_max'], [(([],), (None, None)), (([-3],), (-3, -3)), (([-5, -2, -8],), (-8, -2))])
namespace, _ = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 59))
run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 61), namespace)
run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 63), namespace)
check(namespace['calculate'], [(('1', 2, 3), 5), (('2', 2, 3), -1), (('3', 2, 3), 6), (('4', 0, 2), 0.0), (('4', 2, 0), None), (('?', 2, 3), None)])
# A local y never overwrites an existing global binding.
for seed in ({}, {'y': 99}):
    state, _ = run(next(c for c in lesson if c.get("metadata", {}).get("cp1_source_cell") == 96), seed.copy())
    assert state.get('y') == seed.get('y')
    checks += 1
print(f'Passed {checks} boundary/changed-input cases and all 13 student/solution expected outputs.')
