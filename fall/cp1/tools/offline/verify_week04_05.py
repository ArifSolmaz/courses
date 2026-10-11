"""Run both complete editions, solution assertions, and changed stopping boundaries."""
import contextlib
import io
import json
import subprocess
from pathlib import Path
from content import prepare, text

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
cases = []
counts = {}
for week in (4, 5):
    nb, lesson_count = prepare(week, ROOT)
    realms = {'lesson': {}, 'solutions': {}}
    for index, cell in enumerate(nb['cells']):
        if cell['cell_type'] != 'code':
            continue
        realm = 'lesson' if index < lesson_count else 'solutions'
        responses = iter(cell['metadata'].get('offline_inputs', []))
        def read_input(prompt=''):
            try:
                return next(responses)
            except StopIteration:
                raise EOFError('Missing preset response')
        namespace = realms[realm]
        namespace['input'] = read_input
        with contextlib.redirect_stdout(io.StringIO()) as output:
            exec(compile(text(cell), f'Week {week} cell {index+1}', 'exec'), namespace)
        counts[week, realm] = counts.get((week, realm), 0) + 1
        # Expected interactive examples; all solution scripts use supplied values.
        needs_input = week == 5 and index in (25, 27, 42, 60, 63, 66, 70, 82)
        cases.append([text(cell), needs_input])
        if week == 4 and index == 18:
            assert output.getvalue() == 'Current color is: red\nCurrent color is: green\nCurrent color is: blue\n\nAfter the loop, color = blue\n'
        if realm == 'solutions' and 'print(f"Stable after {step}' in text(cell):
            assert namespace['step'] == 8 and namespace['change'] < 0.1
            # Exercise the actual answer's alternate termination branch.
            limited = text(cell).replace('step < 100', 'step < 2')
            with contextlib.redirect_stdout(io.StringIO()) as stopped:
                exec(limited, {})
            assert 'not yet stable' in stopped.getvalue()
            assert 'Stable after' not in stopped.getvalue()

cases.extend([
    ['# input("ignored")\nprint("input()")', False],
    ['"""Example: input()"""\nprint(3)', False],
    ['answer = input ("Name: ")', True],
    ['number = int(input("Number: "))', True],
    ['for x in [1, 2]:\n    print(x)', False],
    ['# Write your code below:', False],
])
# Test the shipping detector without booting the DOM/runtime.
script = r'''
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const app=fs.readFileSync(process.argv[1],'utf8');
const fn=app.slice(app.indexOf('function codeNeedsInput'),app.indexOf('function syncInputs'));
const context={};vm.createContext(context);vm.runInContext(fn,context);
const cases=JSON.parse(fs.readFileSync(0,'utf8'));
for(const [source,expected] of cases)assert.equal(context.codeNeedsInput(source),expected,source);
console.log(`${cases.length} input-visibility checks passed`);
'''
subprocess.run(['node', '-e', script, str(HERE/'app.js')], input=json.dumps(cases), text=True, check=True)
print('Passed all lesson and solution code cells:', counts)
print('Temperature convergence and safety-limit cases passed.')
