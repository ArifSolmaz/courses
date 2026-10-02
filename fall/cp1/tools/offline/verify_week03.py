"""Execute full content and actual answer code at decision boundaries."""
import ast, contextlib, io, json
from pathlib import Path
from week03 import complete_week
root=Path(__file__).resolve().parents[2]
nb=complete_week(json.loads((root/'notebooks/Week_03.ipynb').read_text()),root)
ns={'lesson':{},'solutions':{}}
count=0
for cell in nb['cells']:
    if cell['cell_type']=='code':
        with contextlib.redirect_stdout(io.StringIO()):
            exec(''.join(cell['source']),ns[cell.get('metadata',{}).get('offline_realm','lesson')])
        count+=1

def answer(index,values):
    tree=ast.parse(''.join(nb['cells'][120+index]['source']))
    pending=dict(values)
    for node in tree.body:
        if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name) and node.targets[0].id in pending:
            node.value=ast.Constant(pending.pop(node.targets[0].id))
    assert not pending,pending
    env={}
    with contextlib.redirect_stdout(io.StringIO()):exec(compile(ast.fix_missing_locations(tree),'<answer>','exec'),env)
    return env

for temp,want in [(-40.1,'SENSOR FAULT'),(-40,'NORMAL'),(69.9,'NORMAL'),(70,'WARNING'),(89.9,'WARNING'),(90,'SHUTDOWN'),(200,'SHUTDOWN'),(200.1,'SENSOR FAULT')]:
    assert answer(11,{'temperature':temp})['status']==want
for measurement,want in [(9.949,'FAIL'),(9.95,'PASS'),(10.05,'PASS'),(10.051,'FAIL')]:
    assert answer(15,{'measured_1':measurement})['result_1']==want
for voltage,want in [(3,'LOW'),(3.2399,'LOW'),(3.24,'OK'),(3.9599,'OK'),(3.96,'FULL'),(4.2,'FULL')]:
    assert answer(35,{'voltage':voltage})['band']==want
for voltage in [2.99,4.21]:assert 'soc' not in answer(35,{'voltage':voltage})
for age,want in [(0,0),(5,0),(6,30),(12,30),(13,45),(17,45),(18,60),(64,60),(65,35)]:
    assert answer(19,{'age':age})['price']==want
for month,want in [(0,'Invalid month'),(1,'Winter'),(3,'Spring'),(6,'Summer'),(9,'Autumn'),(12,'Winter'),(13,'Invalid month')]:
    assert answer(31,{'month':month})['season']==want
assert len(nb['cells'])==175
print(f'PASS: {count} code cells, all answer assertions, 36 boundary/invalid-input cases.')
