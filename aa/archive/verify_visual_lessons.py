"""Execute the compact lessons and compare algorithm results to independent oracles."""
import builtins
import contextlib
import html
import io
import itertools
import math
import re
from pathlib import Path
from visual_lessons import LESSONS, lesson, practice

root = Path(__file__).resolve().parents[1]
states = {}
for week in LESSONS:
    source = lesson(week)
    answers = iter(['4.10', '3'])
    env = {'__builtins__': dict(vars(builtins), input=lambda _: next(answers))}
    with contextlib.redirect_stdout(io.StringIO()):
        for snippet in re.findall(r'<pre><code>(.*?)</code></pre>', source, re.S):
            exec(compile(html.unescape(snippet), f'week{week}', 'exec'), env)
    states[week] = env
    assert source.count('class="vl-lesson"') == 4
    assert practice(week).count('class="vl-task"') == 3
    page = (root / f'w{week}/index.html').read_text()
    ids = re.findall(r'data-anim="([^"]+)"', page)
    original = re.findall(r'data-anim="([^"]+)"', (root / f'tools/weeks/w{week:02}.html').read_text())
    assert sorted(ids) == sorted(original) and len(ids) == len(set(ids)), (week, ids)

assert math.isclose(states[2]['total'], 12.3) and (states[2]['a'], states[2]['b']) == (9, 4)
assert states[3]['total'] == 10 and states[3]['steps'] == 4
assert states[4]['total'] == 71 and states[4]['largest'] == 30
assert states[4]['a'] == [2,4,6] and states[4]['c'] == [2,4]
assert states[7]['count'] == 10
assert states[11]['counts'] == {'red':3,'blue':2,'green':1}
assert states[12]['count'] == 3
assert states[13]['ranked'] == [('Lin',70),('Ada',80),('Sam',80)]
checks = 0
for n in range(7):
    for values in itertools.product(range(-1, 2), repeat=n):
        for target in range(-3, 4):
            actual = states[14]['two_sum'](values, target)
            expected = any(a+b == target for a,b in itertools.combinations(values,2))
            assert actual == expected
            checks += 1
for n in range(30):
    values = list(range(0,2*n,2))
    for target in range(-1,2*n+1):
        result = states[12]['binary_search'](values,target)
        assert result == (values.index(target) if target in values else -1)
        assert states[5]['contains'](values,target) == (target in values)
        checks += 2
words = [''.join(x) for n in range(5) for x in itertools.product('ab',repeat=n)]
for a in words:
    for b in words:
        assert states[9]['anagram'](a,b) == (sorted(a) == sorted(b))
        checks += 1
assert states[8]['doubled']([1,-2,3]) == [2,-4,6]
print(f'PASS: 13 compact lessons, all code blocks execute, 39 tasks, animations preserved exactly once; {checks:,} algorithm oracle checks.')
