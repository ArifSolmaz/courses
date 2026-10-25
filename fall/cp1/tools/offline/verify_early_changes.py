"""Verify small edits, original tasks, worked answers, checks and output links, Weeks 1–5."""
import ast
import contextlib
import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import types
from content import prepare
ROOT=Path(__file__).resolve().parents[2]
records=[]
bridge=types.ModuleType('offline_output')
bridge.emit=lambda text,lines:records.append((text,set(map(int,lines.split(','))) if lines else set()))
sys.modules['offline_output']=bridge
from output_trace import capture


def execute(cell,namespace,code=None,traced=False):
    responses=iter(cell['metadata'].get('offline_inputs',[]))
    def read_input(prompt=''):
        response=next(responses)
        print(prompt+response)
        return response
    namespace['input']=read_input
    source=code or ''.join(cell['source'])
    with contextlib.redirect_stdout(io.StringIO()) as out:
        if traced:
            records.clear()
            with capture(source,'Suggested example'):
                exec(compile(source,'Suggested example','exec'),namespace)
        else:exec(compile(source,'Original prerequisite','exec'),namespace)
    return ''.join(t for t,_ in records) if traced else out.getvalue()


def is_check(cell):
    tree=ast.parse(''.join(cell['source']))
    return any(isinstance(n,ast.Assert) for n in ast.walk(tree)) and not any(isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in ('print','input') for n in ast.walk(tree))


counts={};runs=checks=0
for week in range(1,6):
    nb,lesson_count=prepare(week,ROOT)
    original=json.loads((ROOT/f'notebooks/Week_{week:02d}.ipynb').read_text())['cells']+json.loads((ROOT/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())['cells']
    assert len(original)==len(nb['cells'])
    for authored,cell in zip(original,nb['cells']):
        if authored['cell_type']=='code':
            assert ast.dump(ast.parse(''.join(authored['source'])))==ast.dump(ast.parse(''.join(cell['source']))),'Original exercise/answer code changed'
    page=(ROOT/f'offline/CP1_Week_{week:02d}_Offline.html').read_text()
    embedded,_=json.JSONDecoder().raw_decode(page.split('const ORIGINAL=',1)[1]);assert embedded==nb
    assert '"codeHistory": true' in page and 'row.onclick=()=>selectLine(index+1)' in page
    targets=[(i,c) for i,c in enumerate(nb['cells']) if c['metadata'].get('cp1_guided_change')]
    counts[week]=len(targets)
    for i,cell in targets:
        source=''.join(cell['source']);change=cell['metadata']['cp1_guided_change'];variant=change['source']
        assert source.count(change['old'])==1
        assert variant==source.replace(change['old'],change['new'],1) and variant!=source
        assert change['help']['source_sha256']==hashlib.sha256(variant.encode()).hexdigest()
        assert set(change['help']['line_focus'])=={str(n) for n,l in enumerate(variant.splitlines(),1) if l.strip() and not l.lstrip().startswith('#')}
        before_walk=nb['cells'][i+1]['metadata']['cp1_line_walkthrough'];assert before_walk['line_focus']
        realm=cell['metadata'].get('offline_realm','lesson');results=[]
        for code in (source,variant):
            with tempfile.TemporaryDirectory() as folder,contextlib.chdir(folder):
                namespace={}
                for earlier in nb['cells'][:i]:
                    if earlier['cell_type']=='code' and earlier['metadata'].get('offline_realm','lesson')==realm:
                        execute(earlier,namespace)
                text=execute(cell,namespace,code,traced=True);results.append(text)
                assert all(owner and owner<=set(range(1,len(code.splitlines())+1)) for _,owner in records),(week,i,'output attribution')
                for later in nb['cells'][i+1:]:
                    if later['cell_type']!='code':continue
                    if not is_check(later):break
                    execute(later,namespace);checks+=1
                runs+=1
        assert results[0]!=results[1],(week,i,'Suggested edit has no visible effect')
print(f'Weeks 1–5 suggested edits: {counts}; {sum(counts.values())} controls; {runs} original/changed traced runs and {checks} subsequent answer-check cells pass.')
