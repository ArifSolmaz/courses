"""Verify every approved Week 9 program, single edit, and published activity."""
import contextlib
import io
import json
import re
from pathlib import Path

from week09 import ACTIVITIES, prepare

ROOT = Path(__file__).resolve().parents[2]


def output(source):
    with contextlib.redirect_stdout(io.StringIO()) as stream:
        exec(compile(source, '<Week 9 activity>', 'exec'), {})
    return stream.getvalue()


def verify():
    nb, count = prepare(ROOT)
    assert count == len(nb['cells'])
    assert [a['number'] for a in ACTIVITIES] == [str(n) for n in range(1, 27)]
    assert sum(not a['optional'] for a in ACTIVITIES) == 12
    for item in ACTIVITIES:
        context = 'Example ' + item['number']
        assert item['optional'] == (int(item['number']) >= 13), context
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
    page = (ROOT / 'offline/CP1_Week_09_Offline.html').read_text()
    embedded, _ = json.JSONDecoder().raw_decode(page.split('const ORIGINAL=', 1)[1])
    assert embedded == nb, 'Rebuild the Week 9 HTML after editing the activity source.'
    assert 'exercises and worked solutions are included below' not in page
    assert 'Examples 1–12 are the main activities.' in page
    assert len({c['id'] for c in nb['cells']}) == len(nb['cells'])
    print('Week 9: 12 main + 14 optional activities; all 52 starting/changed programs and English step structure pass.')


if __name__ == '__main__':
    verify()
