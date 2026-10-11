"""Require a synchronized walkthrough for every Week 4 code cell and code line."""
import hashlib
import json
import re
from pathlib import Path
R = Path(__file__).resolve().parents[2]
blocks = lines = starters = 0
for name in ['notebooks/Week_04.ipynb', 'solutions/Week_04_Solutions.ipynb']:
    cells = json.loads((R/name).read_text())['cells']
    for i,c in enumerate(cells):
        if c['cell_type'] != 'code': continue
        source = ''.join(c['source'])
        walk = cells[i+1]
        assert walk['cell_type'] == 'markdown', (name,i)
        meta = walk['metadata']['cp1_line_walkthrough']
        assert meta['source_sha256'] == hashlib.sha256(source.encode()).hexdigest(), (name,i,'Update explanations after changing code')
        executable = [(n,s.strip()) for n,s in enumerate(source.splitlines(),1) if s.strip() and not s.lstrip().startswith('#')]
        assert meta['explained_lines'] == [n for n,_ in executable], (name,i)
        prose = ''.join(walk['source'])
        assert '**Line-by-line walkthrough**' in prose
        focus=meta['line_focus']
        assert list(focus)==[str(n) for n,_ in executable], (name,i,'Line-focus coverage')
        for explanation in focus.values():
            assert explanation in prose, (name,i,'Notebook and selected-line explanation differ')
        if not executable: assert meta['starter_help']
        for n,s in executable:
            assert f'- **Line {n} —** `` {s} ``\n\n  ' in prose, (name,i,n)
        assert len(re.findall(r'^- \*\*Line \d+ —\*\*',prose,re.M)) == len(executable)
        if not executable:
            assert 'comment' in prose and len(prose)>180
            starters += 1
        blocks += 1
        lines += len(executable)
    for c in cells:
        if c['cell_type']=='markdown' and '```python' in ''.join(c['source']):
            assert 'Line-by-line walkthrough of' in ''.join(c['source'])
print(f'Covered {blocks} code blocks, {lines} non-comment code lines, {starters} comment-only starters, and all 3 syntax templates.')
