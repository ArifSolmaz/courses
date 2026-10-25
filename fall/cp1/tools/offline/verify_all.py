"""Run every prepared code cell in its actual browser namespace and working folder."""
import contextlib
import io
import os
from pathlib import Path
import tempfile
import warnings
os.environ['MPLBACKEND']='Agg'
warnings.filterwarnings('ignore',message='FigureCanvasAgg is non-interactive')
import matplotlib.pyplot as plt
from content import prepare,text
ROOT=Path(__file__).resolve().parents[2]
expected={'lesson':457,'practice':97,'solutions':252}
counts=dict.fromkeys(expected,0)
fail=[]
plt.show=lambda *args,**kwargs:plt.close('all')
for week in range(1,15):
    nb,_=prepare(week,ROOT)
    for realm in expected:
        namespace={'__name__':'__main__'}
        with tempfile.TemporaryDirectory() as folder,contextlib.chdir(folder):
            for i,cell in enumerate(nb['cells']):
                if cell['cell_type']!='code' or cell['metadata'].get('offline_realm','lesson')!=realm:continue
                responses=iter(cell['metadata'].get('offline_inputs',[]))
                def read_input(prompt=''):
                    try:return next(responses)
                    except StopIteration:raise EOFError('No preset input') from None
                namespace['input']=read_input
                try:
                    with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
                        exec(compile(text(cell),f'Week {week} cell {i+1}','exec'),namespace)
                    counts[realm]+=1
                except Exception as error:
                    fail.append((week,realm,i+1,type(error).__name__,str(error)))
            plt.close('all')
assert not fail,fail
assert counts==expected,('Review changes in course coverage',counts)
print(f'All {sum(counts.values())} code cells pass in their separate workspaces: {counts}.')
