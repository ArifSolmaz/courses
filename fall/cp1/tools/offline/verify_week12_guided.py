"""Verify every approved Week 12 program, single edit, and published activity."""
import csv
import tempfile
import contextlib
import io
import json
import re
from pathlib import Path

from week12 import ACTIVITIES, prepare

ROOT = Path(__file__).resolve().parents[2]


def output(source):
    # Every run gets a fresh directory: no dependency on a prior activity or user file.
    with tempfile.TemporaryDirectory() as folder, contextlib.chdir(folder):
        with contextlib.redirect_stdout(io.StringIO()) as stream:
            namespace = {}
            exec(compile(source, '<Week 12 activity>', 'exec'), namespace)
        first = stream.getvalue()
        artifacts = {str(p): p.read_bytes() for p in Path('.').rglob('*') if p.is_file()}
        with contextlib.redirect_stdout(io.StringIO()) as rerun:
            exec(compile(source, '<Week 12 repeat>', 'exec'), {})
        assert rerun.getvalue() == first, 'Repeat run changed output'
        assert artifacts == {str(p): p.read_bytes() for p in Path('.').rglob('*') if p.is_file()}, 'Repeat run changed files'
        if 'copied' in namespace:
            assert Path('w12_ex15_copy.txt').read_text() == namespace['original']
        if 'restored' in namespace:
            assert namespace['restored'] == namespace['rows']
        if 'accepted' in namespace:
            def rows(name):
                with open(name, newline='', encoding='utf-8') as file:
                    return list(csv.reader(file))
            assert rows('w12_ex25_raw_demo.csv') == namespace['rows'], 'Raw data was overwritten by processing'
            assert rows('w12_ex25_clean.csv') == [['sensor', 'temperature_c']] + [[str(v) for v in row] for row in namespace['accepted']]
            assert rows('w12_ex25_rejected.csv') == [['record', 'sensor', 'original_text', 'reason']] + [[str(v) for v in row] for row in namespace['rejected']]
        if 'results' in namespace:
            with open('w12_ex22_report.csv', newline='', encoding='utf-8') as file:
                assert list(csv.reader(file)) == namespace['results']
        if 'filename' in namespace and namespace['filename'] == 'w12_ex24.log':
            assert Path('w12_ex24.log').read_text().count('\n') == 2
        return first


def verify():
    nb, count = prepare(ROOT)
    assert count == len(nb['cells'])
    assert [a['number'] for a in ACTIVITIES] == [str(n) for n in range(1, 27)]
    assert sum(not a['optional'] for a in ACTIVITIES) == 14
    for item in ACTIVITIES:
        context = 'Example ' + item['number']
        assert item['optional'] == (int(item['number']) >= 15), context
        assert output(item['code']) == item['expected'], (context, 'starting output')
        assert item['code'].count(item['old']) == 1, (context, 'ambiguous change')
        changed = item['code'].replace(item['old'], item['new'], 1)
        assert output(changed) == item['changed_expected'], (context, 'changed output')
        cells = [c for c in nb['cells'] if c['metadata'].get('cp1_activity', {}).get('number') == item['number']]
        assert len(cells) == 3, context
        before, code, after = cells
        assert '### Predict\n' in ''.join(before['source']), context
        assert '### Run\n' in ''.join(before['source']), context
        assert '### Change one thing\n' in ''.join(after['source']), context
        assert code['cell_type'] == 'code' and ''.join(code['source']) == item['code']
        assert not code['outputs'] and code['execution_count'] is None
        assert ('Optional example' in ''.join(before['source'])) == item['optional'], context
    content = '\n'.join(''.join(c['source']) for c in nb['cells'])
    assert not re.search('[çğıöşüÇĞİÖŞÜ]', content)
    page = (ROOT / 'offline/CP1_Week_12_Offline.html').read_text()
    embedded, _ = json.JSONDecoder().raw_decode(page.split('const ORIGINAL=', 1)[1])
    assert embedded == nb, 'Rebuild the Week 12 HTML after editing the activity source.'
    assert 'exercises and worked solutions are included below' not in page
    assert 'Examples 1–14 are the main activities.' in page
    assert len({c['id'] for c in nb['cells']}) == len(nb['cells'])
    print('Week 12: 14 main + 12 optional activities; all 52 starting/changed programs and English step structure pass.')


if __name__ == '__main__':
    verify()
