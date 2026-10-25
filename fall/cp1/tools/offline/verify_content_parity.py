"""Check Weeks 1–14 notebook-to-HTML parity, allowing only presentation adaptations."""
import ast
import contextlib
import io
import json
import re
import tempfile
import os
os.environ["MPLBACKEND"] = "Agg"
from pathlib import Path
from content import prepare, text

ROOT = Path(__file__).resolve().parents[2]


def lesson_text(source):
    # Destinations change to in-page anchors, but labels and teaching text stay.
    source = re.sub(r'\[([^\]]+)\]\([^\n)]+\)', r'\1', source)
    source = source.replace('Hints (click to reveal)', 'Hints (shown below)')
    source = source.replace('so **Run All never waits for keyboard input**', 'so no live keyboard input is needed')
    source = source.replace('Use a separate runtime for your\nown practice so the worked answers do not supply hidden variables to it.', 'This page keeps solution variables and files separate from your practice.')
    # Only these platform-specific instructions may differ, not surrounding content.
    patterns = [
        r'^If you are using Colab, open the published solution notebook\.$',
        r'^The worked solutions are included below in this offline page\.$',
        r'^Open it in a separate runtime\.',
        r'^Solutions use a separate Python namespace and working folder in this page\.',
        r'^In Google Colab and Jupyter Notebooks, `input\(\)`.*$',
        r'^In this offline page, fill in \*\*Input values.*$',
        r'^- In Jupyter/Colab:.*$',
        r'^- On this offline page: use \*\*Stop / restart Python\*\*.*$',
    ]
    for pattern in patterns:
        source = re.sub(pattern, '', source, flags=re.M)
    return '\n'.join(line.strip() for line in source.splitlines() if line.strip())


for week in range(1,15):
    lesson = json.loads((ROOT / f'notebooks/Week_{week:02d}.ipynb').read_text())
    solutions = json.loads((ROOT / f'solutions/Week_{week:02d}_Solutions.ipynb').read_text())
    page = (ROOT / f'offline/CP1_Week_{week:02d}_Offline.html').read_text()
    embedded, _ = json.JSONDecoder().raw_decode(page.split('const ORIGINAL=', 1)[1])
    prepared, lesson_count = prepare(week, ROOT)
    assert embedded == prepared, f'Week {week}: HTML is stale; rebuild it'
    if week == 6:
        # This offline-only edition intentionally follows the instructor-approved
        # guided sequence. Its actual code and changes have their own verifier.
        from verify_week06_guided import verify
        verify()
        print('Week 6: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    if week == 7:
        from verify_week07_guided import verify
        verify()
        print('Week 7: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    if week == 8:
        from verify_week08_guided import verify
        verify()
        print('Week 8: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    if week == 9:
        from verify_week09_guided import verify
        verify()
        print('Week 9: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    if week == 10:
        from verify_week10_guided import verify
        verify()
        print('Week 10: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    if week == 11:
        from verify_week11_guided import verify
        verify()
        print('Week 11: guided offline source matches HTML; all starting and changed programs pass.')
        continue
    assert lesson_count == len(lesson['cells'])
    source_cells = lesson['cells'] + solutions['cells']
    assert len(source_cells) == len(embedded['cells'])
    for index, (source, offline) in enumerate(zip(source_cells, embedded['cells'])):
        context = f'Week {week}, cell {index + 1}'
        assert source['cell_type'] == offline['cell_type'], context
        if source['cell_type'] == 'code':
            # Colab helper visibility comments can differ; executable code cannot.
            assert ast.dump(ast.parse(text(source))) == ast.dump(ast.parse(text(offline))), context
        else:
            assert lesson_text(text(source)) == lesson_text(text(offline)), context
    # Run the original notebooks too and compare every saved output. Echo seeded
    # responses as Colab does, rather than silently substituting input().
    for notebook in (lesson, solutions):
        with tempfile.TemporaryDirectory(prefix="cp1_parity_") as folder, contextlib.chdir(folder):
            namespace = {}
            for index, cell in enumerate(notebook['cells']):
                if cell['cell_type'] != 'code':
                    continue
                responses = iter(cell.get('metadata', {}).get('offline_inputs', []))
                def read_input(prompt=''):
                    answer = next(responses)
                    print(prompt + answer)
                    return answer
                namespace['input'] = read_input
                with contextlib.redirect_stdout(io.StringIO()) as output:
                    exec(compile(text(cell), f'Week {week} original cell {index+1}', 'exec'), namespace)
                if cell.get('outputs'):
                    stored = ''.join(''.join(item.get('text', [])) for item in cell['outputs'] if item['output_type'] == 'stream')
                    assert stored == output.getvalue(), f'Week {week}, cell {index+1}: stale saved output'
    print(f'Week {week}: all {len(source_cells)} lesson/solution cells match; only platform instructions differ.')
