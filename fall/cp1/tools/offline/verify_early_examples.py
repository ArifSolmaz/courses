"""Check early-week synchronization corrections against concrete boundary results."""
import ast
import contextlib
import io
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def cell(week, original):
    cells=json.loads((ROOT/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())['cells']
    return next(c for c in cells if c['cell_type']=='code' and c['metadata']['cp1_source_cell']==original)
def run(c, values):
    tree=ast.parse(''.join(c['source']))
    for node in tree.body:
        if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name) and node.targets[0].id in values:
            node.value=ast.Constant(values[node.targets[0].id])
    ns={}
    with contextlib.redirect_stdout(io.StringIO()) as out:exec(compile(ast.fix_missing_locations(tree),'<early example>','exec'),ns)
    return ns,out.getvalue()
for midterm,final,wanted in [(0,100,50),(100,0,50),(78,92,85),(0,0,0),(100,100,100)]:
    ns,_=run(cell(2,39),{'midterm':midterm,'final':final})
    assert ns['average']==wanted
for voltage,wanted in [(1,0),(3,5),(5,10)]:
    ns,_=run(cell(2,23),{'voltage':voltage})
    assert ns['pressure_bar']==wanted
for voltage,band in [(3,'LOW'),(3.24,'OK'),(3.96,'FULL'),(4.2,'FULL')]:
    ns,_=run(cell(3,35),{'voltage':voltage})
    assert ns['band']==band
for voltage in [2.99,4.21]:
    ns,out=run(cell(3,35),{'voltage':voltage})
    assert 'soc' not in ns and 'INVALID READING' in out
for bad in ['3.14','hello','']:
    try:int(bad)
    except ValueError:pass
    else:raise AssertionError(bad)
assert int(-3.7)==-3 and -7//2==-4
assert round(2.5)==2 and round(3.5)==4
assert bool('False') and not bool('')
print('Early examples passed: equal exam weights, sensor endpoints, exact battery bands, invalid readings, conversion and rounding distinctions.')
