"""Execute every Week 13/14 suggested edit after its original prerequisite cells."""
import ast
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import warnings
os.environ['MPLBACKEND']='Agg'
warnings.filterwarnings('ignore',message='FigureCanvasAgg is non-interactive')
import matplotlib.pyplot as plt
from content import prepare
ROOT=Path(__file__).resolve().parents[2]
counts={};runs=0
for week in (13,14):
    nb,lesson_count=prepare(week,ROOT)
    page=(ROOT/f'offline/CP1_Week_{week:02d}_Offline.html').read_text()
    embedded,_=json.JSONDecoder().raw_decode(page.split('const ORIGINAL=',1)[1])
    assert embedded==nb,'Rebuild the scientific offline page'
    controls=[(i,c) for i,c in enumerate(nb['cells']) if c['metadata'].get('cp1_guided_change')]
    counts[week]=len(controls)
    assert counts[week]==(40 if week==13 else 14),(week,counts)
    for target,cell in controls:
        source=''.join(cell['source']);change=cell['metadata']['cp1_guided_change']
        assert source.count(change['old'])==1
        assert change['source']==source.replace(change['old'],change['new'],1)
        assert change['source']!=source
        assert change['help']['source_sha256']==hashlib.sha256(change['source'].encode()).hexdigest()
        ast.parse(change['source'])
        assert len(source.splitlines())==len(change['source'].splitlines())
        original_focus=nb['cells'][target+1]['metadata']['cp1_line_walkthrough']['line_focus']
        assert set(change['help']['line_focus'])==set(original_focus)
        for n,(before,after) in enumerate(zip(source.splitlines(),change['source'].splitlines()),1):
            if before!=after:assert change['help']['line_focus'][str(n)]!=original_focus.get(str(n))
        # Each variant starts fresh with only the original prerequisites in its realm.
        realm=cell['metadata'].get('offline_realm','lesson')
        for chosen in (source,change['source']):
            with tempfile.TemporaryDirectory() as folder,contextlib.chdir(folder):
                namespace={}
                with contextlib.redirect_stdout(io.StringIO()):
                    for earlier in nb['cells'][:target]:
                        if earlier['cell_type']=='code' and earlier['metadata'].get('offline_realm','lesson')==realm:
                            exec(compile(''.join(earlier['source']),'Original prerequisite','exec'),namespace)
                seen=[]
                def show():
                    seen.extend(plt.figure(n) for n in plt.get_fignums())
                old_show=plt.show;plt.show=show
                try:
                    with contextlib.redirect_stdout(io.StringIO()) as out:
                        exec(compile(chosen,f'Week {week} cell {target+1}','exec'),namespace)
                    # Each plot really contains artists, and saved images are valid PNGs.
                    assert all(any(ax.lines or ax.collections for ax in fig.axes) for fig in seen)
                    assert all(p.read_bytes().startswith(b'\x89PNG\r\n\x1a\n') for p in Path('.').glob('*.png'))
                    assert out.getvalue() or seen or cell['metadata'].get('cp1_exercise'),(week,target,'No visible result or starter input')
                finally:
                    plt.show=old_show;plt.close('all')
            runs+=1
print(f'Week 13: {counts[13]} suggested edits; Week 14: {counts[14]}; all {runs} original/changed executions and plot/file checks pass.')
