"""Check line coverage, real output attribution and exact suggested edits, Weeks 6–14."""
import ast
import contextlib
import hashlib
import importlib
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

activities=lines=runs=0
for week in range(6,15):
    nb,_=prepare(week,ROOT)
    page=(ROOT/f'offline/CP1_Week_{week:02d}_Offline.html').read_text()
    embedded,_=json.JSONDecoder().raw_decode(page.split('const ORIGINAL=',1)[1])
    assert embedded==nb,(week,'HTML/source parity')
    assert '"codeHistory": true' in page and 'row.onclick=()=>selectLine(index+1)' in page
    assert 'editor.showForReading?.()' in page
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']!='code':continue
        source=''.join(cell['source'])
        help=cell['metadata'].get('cp1_code_help') or nb['cells'][i+1]['metadata'].get('cp1_line_walkthrough')
        assert help and (help['line_focus'] or help.get('starter_help')),(week,i,'missing clickable walkthrough')
        assert help['source_sha256']==hashlib.sha256(source.encode()).hexdigest(),(week,i,'stale help')
        expected={str(n) for n,line in enumerate(source.splitlines(),1) if line.strip() and not line.lstrip().startswith('#')}
        assert set(help['line_focus'])==expected,(week,i,'line coverage')
        lines+=len(expected)
        if week>12:continue
        item=next(a for a in importlib.import_module(f'week{week:02d}').ACTIVITIES if str(a['number'])==str(cell['metadata']['cp1_activity']['number']))
        change=cell['metadata']['cp1_guided_change']
        assert source.count(change['old'])==1
        assert change['source']==source.replace(change['old'],change['new'],1)
        for code,help,wanted in [(source,help,item['expected']),(change['source'],change['help'],item['changed_expected'])]:
            tree=ast.parse(code)
            assert help['source_sha256']==hashlib.sha256(code.encode()).hexdigest()
            assert set(help['line_focus'])=={str(n) for n,l in enumerate(code.splitlines(),1) if l.strip() and not l.lstrip().startswith('#')}
            records.clear()
            with tempfile.TemporaryDirectory() as folder,contextlib.chdir(folder):
                with capture(code,'Guided test'):
                    exec(compile(code,'Guided test','exec'),{})
            assert ''.join(t for t,_ in records)==wanted,(week,item['number'],'traced output differs')
            assert all(owner and owner<=set(range(1,len(code.splitlines())+1)) for _,owner in records)
            # Writes to a file must not be highlighted as printed output.
            writes={n.lineno for n in ast.walk(tree) if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call) and isinstance(n.value.func,ast.Attribute) and n.value.func.attr in ('write','writelines','writerow','writerows')}
            assert not any(writes & owner for _,owner in records),(week,item['number'],'file write attributed to stdout')
            runs+=1
        activities+=1
print(f'Weeks 6–14: {lines} explained lines; {activities} guided activities; {runs} original/changed traced runs pass.')
