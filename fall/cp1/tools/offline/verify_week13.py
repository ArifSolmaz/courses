"""Check Week 13 numerical results, invalid data, CSV shape and saved plots."""
import ast
import contextlib
import io
import json
import os
import re
import tempfile
import warnings
warnings.filterwarnings("ignore", message="FigureCanvasAgg is non-interactive")
from pathlib import Path
os.environ['MPLBACKEND'] = 'Agg'
import numpy as np
import matplotlib.pyplot as plt
R = Path(__file__).resolve().parents[2]
L = json.loads((R/'notebooks/Week_13.ipynb').read_text())['cells']
S = json.loads((R/'solutions/Week_13_Solutions.ipynb').read_text())['cells']

def source(c): return ''.join(c['source'])
def execute(c, ns=None, changes=None):
    ns = {} if ns is None else ns
    tree = ast.parse(source(c))
    if changes is not None:
        # Keep the teaching algorithm, replace only fixture assignments, and
        # remove assertions about the original fixture when using other inputs.
        ns["_fixtures"] = changes
        class Change(ast.NodeTransformer):
            def visit_Assert(self, node): return None
            def visit_Assign(self, node):
                if len(node.targets)==1 and isinstance(node.targets[0], ast.Name) and node.targets[0].id in changes:
                    node.value = ast.Subscript(value=ast.Name(id='_fixtures', ctx=ast.Load()), slice=ast.Constant(node.targets[0].id), ctx=ast.Load())
                return node
        tree = ast.fix_missing_locations(Change().visit(tree))
    with contextlib.redirect_stdout(io.StringIO()) as out:
        exec(compile(tree, '<Week 13>', 'exec'), ns)
    return ns, out.getvalue()

def expected(c): return re.search(r'```(?:text)?\n(.*?)```', source(c), re.S).group(1)
checks = 0

def reject(i, changes):
    global checks
    try: execute(S[i], changes=changes)
    except ValueError: checks += 1
    else: raise AssertionError((i, changes))

with tempfile.TemporaryDirectory(prefix='cp1_science_') as folder, contextlib.chdir(folder):
    ns = {}
    for c in L:
        if c['cell_type']=='code': execute(c, ns)
    assert np.array_equal(ns['data'], ns['data2']); checks += 1
    assert ns['hot'].sum(axis=0).tolist()==[6,0,6]; checks += 1
    assert ns['current'][14]==6.5 and ns['clipped'][14]==4; checks += 1
    for i in range(3,40,3):
        n, out = execute(S[i])  # every solution must also run on its own
        exercise = str(i//3) if i<39 else 'Bridge'
        student = next(c for c in L if c['cell_type']=='markdown' and source(c).startswith('### '+('Exercise '+exercise+':' if exercise!='Bridge' else 'Bridge Exercise:')))
        student_expected = re.search(r'\*\*Expected output[^\n]*\n```(?:text)?\n(.*?)```',source(student),re.S).group(1)
        assert out==expected(S[i+1])==student_expected, (exercise,out,expected(S[i+1]))
    for filename in ['current.png','temps.png','spike_check.png','sensor_a.png','sensors.png','calibration.png']:
        assert Path(filename).read_bytes().startswith(b'\x89PNG\r\n\x1a\n'); checks+=1
    assert not plt.get_fignums(); checks+=1
    # Tied/flat peaks remove one selected sample, not all equal readings.
    for values,wanted in [([5,1,5],[1,5]),([2,2,2],[2,2]),([1,3],[1])]:
        n,_=execute(S[15],changes={'time_s':list(range(len(values))),'current_a':values})
        assert n['without'].tolist()==wanted; checks+=1
    n,_=execute(S[18],changes={'time_s':[0,1,2],'current_a':[1,2,3]})
    assert n['averages'].tolist()==[2] and n['best']==0; checks+=1
    n,_=execute(S[18]); assert n['best']==13; checks+=1
    for i in [15,18,30]:
        for changes in [{'time_s':[],'current_a':[]},{'time_s':[0,1,2],'current_a':[2,3]}, {'time_s':[0,0,2],'current_a':[2,3,4]}, {'time_s':[0,1,2],'current_a':[2,float('inf'),3]}]:
            reject(i,changes)
    for values in [[[1,2],[1,3]],[[1,2]],[],[[1,2],[3,float('inf')]]]:reject(27,{'temps':values})
    n,_=execute(S[27],changes={'temps':[[1,4],[3,8]]});assert np.allclose(n['z'],[[-1,-1],[1,1]]);checks+=1
    n,_=execute(S[30],changes={'time_s':[0,1,2],'current_a':[2,2,2]});assert not n['flags'].any();checks+=1
    for k in [0,-1]:reject(30,{'k':k})
    n,_=execute(S[33],changes={'t_s':[0,2,5],'v_ms':[2,2,2]});assert n['distance']==10;checks+=1
    for changes in [{'t_s':[0,0],'v_ms':[1,1]},{'t_s':[0,1],'v_ms':[-1,1]},{'t_s':[0],'v_ms':[1]}]:reject(33,changes)
    for changes in [{'pressure_kpa':[0,0], 'voltage_v':[1,2]}, {'voltage_v':[1,1,1,1,1,1]}, {'reading_v':10}]:reject(36,changes)
    n,_=execute(S[39],changes={'csv_text':'minute,sensor_a,sensor_b,sensor_c\n0,10,20,30\n'})
    assert n['data'].shape==(1,4) and n['means'].tolist()==[10,20,30];checks+=1
    for text in ['minute,sensor_a,sensor_b,sensor_c\n0,1,nan,3\n','minute,sensor_a,sensor_b,sensor_c\n0,1,2\n','minute,sensor_a,sensor_b,sensor_c\n1,1,2,3\n0,1,2,3\n']:
        reject(39,{'csv_text':text})
print(f'Passed all 13 student/solution outputs and {checks} numerical, boundary, CSV and plot checks.')
