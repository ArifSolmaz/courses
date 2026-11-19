"""Build the standalone offline quiz from the reviewed question bank."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
questions=json.loads((ROOT/'questions.json').read_text())
assert len(questions)==25
assert [q['id'] for q in questions]==list(range(1,26))
for week in range(1,6):assert sum(q['week']==week for q in questions)==5
for q in questions:
 assert len(q['steps'])>=4 and all(q['steps'])
 assert len(q['options'])==len(q['feedback'])==4 and 0<=q['answer']<4
 assert all(q['feedback'][i] for i in range(4) if i!=q['answer'])
(ROOT/'index.html').write_text((ROOT/'template.html').read_text().replace('/*QUESTIONS*/',json.dumps(questions,ensure_ascii=False).replace('</','<\\/')))
print('Built 25-question standalone review.')
