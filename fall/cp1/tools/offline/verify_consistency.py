"""Audit all fourteen published-page sources and every code/help/control association."""
import ast
import hashlib
import json
from pathlib import Path
import re
from content import prepare
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
rows=[]

def exercise_numbers(cells):
    found=[]
    for cell in cells:
        if cell['cell_type']=='markdown':
            found.extend(int(n) for n in re.findall(r'^#{2,3}[^\n]*?\bExercise\s+(\d+)\s*:', ''.join(cell['source']),re.M|re.I))
    return found

def bridge_count(cells):
    return sum(len(re.findall(r'^#{2,3}\s+(?:🌉\s+)?(?:Optional\s+)?Bridge(?:\s+Exercise:|\s+to\s+Next\s+Week)', ''.join(c['source']),re.M|re.I)) for c in cells if c['cell_type']=='markdown')

for week in range(1,15):
    nb,split=prepare(week,ROOT)
    page=(ROOT/f'offline/CP1_Week_{week:02d}_Offline.html').read_text()
    embedded,_=json.JSONDecoder().raw_decode(page.split('const ORIGINAL=',1)[1]);assert embedded==nb
    assert (HERE/'app.js').read_text() in page,(week,'Outdated shared app bundle: rebuild this page')
    assert (HERE/'code_history.js').read_text() in page,(week,'Outdated undo bundle')
    assert '"codeHistory": true' in page
    assert 'row.onclick=()=>selectLine(index+1)' in page and 'output-fragment' in page
    assert "practice:'/home/pyodide/practice'" in page
    original=json.loads((ROOT/f'notebooks/Week_{week:02d}.ipynb').read_text())['cells']
    solutions=json.loads((ROOT/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())['cells']
    assert exercise_numbers(nb['cells'][:split])==exercise_numbers(original),(week,'Exercise task missing or reordered')
    assert exercise_numbers(nb['cells'][split:])==exercise_numbers(solutions),(week,'Worked exercise missing or reordered')
    assert bridge_count(nb['cells'][:split])==bridge_count(original),(week,'Missing bridge exercise')
    assert bridge_count(nb['cells'][split:])==bridge_count(solutions),(week,'Missing bridge answer')
    authored_answers=[''.join(c['source']) for c in solutions if c['cell_type']=='code']
    restored_answers=[''.join(c['source']) for c in nb['cells'][split:] if c['cell_type']=='code']
    assert restored_answers==authored_answers,(week,'Worked answer code changed')
    assert len({c['id'] for c in nb['cells']})==len(nb['cells'])
    code_count=changes=lines=0
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']!='code':continue
        code_count+=1;source=''.join(cell['source'])
        walk=cell['metadata'].get('cp1_code_help') or nb['cells'][i+1]['metadata'].get('cp1_line_walkthrough')
        assert walk and (walk['line_focus'] or walk.get('starter_help')),(week,i,'Missing explanation')
        assert walk['source_sha256']==hashlib.sha256(source.encode()).hexdigest(),(week,i,'Stale explanation')
        needed={str(n) for n,l in enumerate(source.splitlines(),1) if l.strip() and not l.lstrip().startswith('#')}
        assert set(walk['line_focus'])==needed,(week,i,'Incomplete line coverage')
        lines+=len(needed)
        change=cell['metadata'].get('cp1_guided_change')
        if not change:continue
        changes+=1
        assert source.count(change['old'])==1 and change['source']==source.replace(change['old'],change['new'],1)
        ast.parse(change['source'])
        assert change['help']['source_sha256']==hashlib.sha256(change['source'].encode()).hexdigest()
        needed={str(n) for n,l in enumerate(change['source'].splitlines(),1) if l.strip() and not l.lstrip().startswith('#')}
        assert set(change['help']['line_focus'])==needed
    row=dict(week=week,code_cells=code_count,suggested_edits=changes,explained_lines=lines,
             exercises=len(exercise_numbers(original)),worked_exercises=len(exercise_numbers(solutions)),
             bridges=bridge_count(original),worked_bridges=bridge_count(solutions))
    rows.append(row)
    print(f'Week {week:02d}: {code_count} code cells, {changes} suggested edits, {row["exercises"]} exercises, {row["worked_exercises"]} worked exercises; explanations/bundles pass.')
assert sum(r['suggested_edits'] for r in rows)==431
assert sum(r['code_cells'] for r in rows)==806
print('All fourteen pages use identical current controls; every exercise, worked answer, and line explanation is present.')
if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--json',type=Path);args=parser.parse_args()
    if args.json:args.json.write_text(json.dumps(rows,indent=2)+'\n')
