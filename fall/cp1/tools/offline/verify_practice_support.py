"""Ensure restored tasks are followed by complete answers, without filling student code."""
import contextlib
import io
import json
import re
from pathlib import Path
import tempfile
from content import prepare

ROOT=Path(__file__).resolve().parents[2]
answer_runs=starters=0
for week in range(6,15):
    nb,lesson_count=prepare(week,ROOT)
    original=json.loads((ROOT/f'notebooks/Week_{week:02d}.ipynb').read_text())['cells']
    solutions=json.loads((ROOT/f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())['cells']
    assert all('Türkçe:' not in ''.join(c['source']) for c in nb['cells'] if c['cell_type']=='markdown'), (week,'English-only instructional prose')
    source_starters=[c for c in original if c['cell_type']=='code' and c['metadata'].get('cp1_exercise')]
    restored=[c for c in nb['cells'] if c['cell_type']=='code' and c['metadata'].get('cp1_exercise') and c['metadata'].get('offline_realm')!='solutions']
    assert [''.join(c['source']) for c in restored]==[''.join(c['source']) for c in source_starters],(week,'practice starters changed or missing')
    starters+=len(restored)
    answers=[c for c in nb['cells'] if c['metadata'].get('offline_realm')=='solutions' and c['cell_type']=='code']
    source_answers=[c for c in solutions if c['cell_type']=='code']
    assert [''.join(c['source']) for c in answers]==[''.join(c['source']) for c in source_answers],(week,'worked code changed or missing')
    assert all(c['metadata'].get('offline_realm')!='solutions' for c in nb['cells'][:lesson_count])
    assert all(c['metadata'].get('offline_realm')=='solutions' for c in nb['cells'][lesson_count:])
    # Week 13/14 answers contain plots and retain their separate existing test suite.
    if week>12:continue
    assert any(c['metadata'].get('offline_anchor')=='practice' for c in nb['cells'])
    assert any(c['metadata'].get('offline_anchor')=='solutions' for c in nb['cells'])
    for n in range(1,13):
        task=next(c for c in nb['cells'] if c['metadata'].get('offline_anchor')==f'exercise-{n}')
        answer=next(c for c in nb['cells'] if c['metadata'].get('offline_anchor')==f'solution-{n}')
        assert nb['cells'].index(task)<lesson_count<=nb['cells'].index(answer)
        assert ('Optional exercise' in ''.join(task['source']))==(n>=9)
        assert ('Optional exercise' in ''.join(answer['source']))==(n>=9)
    with tempfile.TemporaryDirectory() as folder,contextlib.chdir(folder):
        namespace={}
        for cell,authored in zip(answers,source_answers):
            with contextlib.redirect_stdout(io.StringIO()) as out:
                exec(compile(''.join(cell['source']),f'Week {week} answer','exec'),namespace)
            expected=''.join(''.join(o.get('text',[])) for o in authored['outputs'] if o['output_type']=='stream' and o.get('name')=='stdout')
            assert out.getvalue()==expected,(week,cell['metadata'].get('cp1_exercise'),'answer output')
            answer_runs+=1
print(f'Weeks 6–14: {starters} practice starters restored/retained; all complete answer code preserved; {answer_runs} Weeks 6–12 worked programs pass saved outputs and internal assertions.')
