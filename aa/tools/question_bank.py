"""Render reviewed test questions before written practice, without extra routes."""
from pathlib import Path
import html
import json
from materials.question_guidance import WRITTEN, MCQ as MCQ_GUIDANCE

HERE = Path(__file__).resolve().parent
MCQ = {x['id']: x for x in json.loads((HERE/'materials/skiena_mcq.json').read_text())}
WEEK_MCQ = {
 1:[1,2,3,4,20], 2:[5], 3:[10,13], 4:[21,22,23,30], 5:[6],
 6:[9,15,18], 7:[12], 8:[7,8,11,14,19], 9:[17],
 10:[24,29,31,32], 11:[28,35,36,37,39,40], 12:[25,26,27,33,34,38],
 13:[16,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59], 14:[60],
}
EXTENSION_MCQ = {'graphs':list(range(61,81)), 'dynamic':list(range(81,101)), 'limits':list(range(101,121))}
assert sorted(i for ids in WEEK_MCQ.values() for i in ids) == list(range(1,61))
# Preserve all source IDs; additions are explicitly authored course questions.
COURSE_MCQ = json.loads((HERE/'materials/course_mcq.json').read_text())
for item in COURSE_MCQ:
    assert item['id'] not in MCQ
    MCQ[item['id']] = item
    WEEK_MCQ[item['week']].append(item['id'])
assert all(len(ids) >= 10 for ids in [*WEEK_MCQ.values(), *EXTENSION_MCQ.values()])

def scaffold(kind, number):
    data = (WRITTEN if kind == 'written' else MCQ_GUIDANCE).get(number)
    if not data:return '', ''
    plain, hint, steps = data
    start = f'<p class="question-plain"><strong>In simpler words:</strong> {html.escape(plain)}</p><p class="question-hint"><strong>Starting hint:</strong> {html.escape(hint)}</p>'
    worked = '<h5>Step by step</h5><ol class="reasoning-steps">' + ''.join(f'<li>{html.escape(s)}</li>' for s in steps) + '</ol>'
    return start, worked

GRAPH_W = 'Graph W is undirected: A–B (4), A–C (1), B–C (2), B–D (5), C–D (8), D–E (3), C–E (10). Parenthesised numbers are edge weights.'

def test_question(number, display_number):
    x = MCQ[number]; start, worked = scaffold('mcq', number)
    origin = ' · course question' if x.get('origin') == 'course' else ''
    context = f'<p class="source-context">{GRAPH_W}</p>' if number in (73,74,75) else ''
    options = '<ol class="mcq-options" type="a">' + ''.join(f'<li>{html.escape(o)}</li>' for o in x['options']) + '</ol>'
    # Deliberately no correct-option class, colour, checked state or answer in the prompt.
    return f'''<article class="source-exercise test-question" id="skiena-mcq-{number:03d}">
<p class="source-label">Question {display_number} · {x['level'].lower()}{origin}</p><p class="question-prompt">{html.escape(x['question'])}</p>{context}{options}{start}
<div class="question-answer"><p><strong>Answer: option {x['correct'].upper()}.</strong> {html.escape(x['answer'])}</p>{worked}</div></article>'''

def bank(mcq_ids, written_ids, ident='skiena-practice', title='Practice questions'):
    from skiena_material import exercise
    rank={'Easy':0,'Medium':1,'Hard':2}
    tests=sorted(mcq_ids,key=lambda n:(rank[MCQ[n]['level']],n))
    from skiena_material import EXERCISES
    written=sorted(written_ids,key=lambda n:(rank[EXERCISES[n]['level']],n))
    return f'''<section class="chapter-question-bank" id="{ident}"><h3>{html.escape(title)}</h3>
<p class="source-label">{len(tests)} test questions · {len(written)} written questions · {len(tests) + len(written)} total</p>
<p>Each question is followed by its answer and explanation. Some questions include a starting hint and smaller reasoning steps.</p>
<h4>Test questions</h4><p class="source-context">Choose one option. Cost questions state their model and whether the bound is tight, expected or worst-case. Here lg means log₂, and heap positions start at 1.</p>
{''.join(test_question(n, i) for i, n in enumerate(tests, 1))}
<h4>Written questions</h4><p class="source-context">Read each question together with its explanation, trace or proof. Numbering continues from the test questions.</p>
{''.join(exercise(n, display_number=i) for i, n in enumerate(written, len(tests) + 1))}</section>'''
