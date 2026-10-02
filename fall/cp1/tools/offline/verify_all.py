"""Execute all prepared lesson and solution cells in separate temporary folders.
Requires local NumPy and Matplotlib for the scientific weeks.
"""
import sys,tempfile,os,contextlib,io,builtins
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from content import prepare,text
root=HERE.parents[1];fail=[];counts=[0,0]
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.show=lambda *a,**k:plt.close('all')
for w in range(1,15):
 nb,n=prepare(w,root)
 for realm in ['lesson','solutions']:
  ns={'__name__':'__main__'}
  with tempfile.TemporaryDirectory() as d:
   prev=os.getcwd();os.chdir(d)
   try:
    for i,c in enumerate(nb['cells']):
     if c['cell_type']!='code' or (i>=n)!=(realm=='solutions'):continue
     ins=iter(c['metadata'].get('offline_inputs',[]))
     def inp(prompt=''):
      try:return next(ins)
      except StopIteration:raise EOFError('No preset input')
     ns['input']=inp
     try:
      with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):exec(compile(text(c),f'Cell {i+1}','exec'),ns)
      counts[realm=='solutions']+=1
     except Exception as e:fail.append((w,realm,i+1,type(e).__name__,str(e)))
   finally:os.chdir(prev);plt.close('all')
print('successful lesson, solution cells',counts)
for f in fail:print(f)

assert not fail, "Unexpected cell execution failures"
assert counts == [541,252], "Notebook coverage changed; review the expected counts"
