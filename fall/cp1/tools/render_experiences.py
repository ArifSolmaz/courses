"""Render the authored engineering experiences alongside the notebook index."""
from pathlib import Path
import html
import json
import re
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('cp1_experiences', ROOT / 'lessons' / 'experiences.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
LESSONS = module.LESSONS
COLAB = 'https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/cp1/'

def esc(value):
    return html.escape(str(value))

def shell(title, body, week=0):
    lab_assets = (f'<link rel="stylesheet" href="cp1-lab.css?v=3"><script src="lab-data/week-{week:02d}.js?v=2" defer></script><script src="cp1-lab.js?v=3" defer></script>' if week else '')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="CP1 weekly lessons for mechatronics: physical problems, clear explanations, worked examples and companion Python notebooks.">
<title>{esc(title)} · CP1 Engineering Experiences</title>
<link rel="stylesheet" href="cp1-experiences.css?v=4"><script src="cp1-experiences.js?v=3" defer></script>{lab_assets}<link rel="stylesheet" href="../../../assets/learning-path.css?v=1"><script src="../../../assets/learning-path.js?v=1" defer></script></head>
<body data-week="{week}"><a class="skip" href="#main">Skip to content</a>
<header class="top"><a class="brand" href="CP1_Course_Dashboard.html">CP1 <span>/ ENGINEERING EXPERIENCES</span></a><nav aria-label="Course"><a href="CP1_Course_Dashboard.html#week-{week or 1}">Course home</a><details class="path-menu"><summary>Resources</summary><div><a href="CP1_Syllabus.html">Syllabus</a><a href="../STUDY_GUIDE.md">Study advice</a></div></details><button type="button" id="theme-toggle" hidden>Dark theme</button></nav></header>
{body}<footer><p>Computer Programming I · Mechatronics Engineering · Dr. Arif Solmaz</p><a href="CP1_Course_Dashboard.html">Course home</a></footer></body></html>'''

def introduction_markdown(lesson):
    intro = lesson['intro']
    return (f"## {lesson['title']}\n\n"
            f"{intro['connection']}\n\n{lesson['brief']}\n\n"
            f"**Try this first — before code.** {intro['first_task']}\n\n"
            f"**Why this week's tool?** {intro['why_tool']}\n\n"
            f"**By the end.** {intro['success']}\n")


def sync_introductions(write):
    """Keep the notebook opening identical in meaning to its HTML introduction."""
    for lesson in LESSONS:
        path = ROOT / 'notebooks' / f"Week_{lesson['week']:02d}.ipynb"
        nb = json.loads(path.read_text())
        candidates = [c for c in nb['cells'] if c.get('metadata', {}).get('cp1', {}).get('weekly_intro')
                      or '## 🎯 Core Mastery Connection' in ''.join(c['source'])]
        if len(candidates) != 1:
            raise ValueError(f"Expected one introduction in {path.name}")
        intro_cell = candidates[0]
        intro_cell['source'] = introduction_markdown(lesson).splitlines(keepends=True)
        intro_cell.setdefault('metadata', {}).setdefault('cp1', {})['weekly_intro'] = True
        nb['cells'].remove(intro_cell)
        nb['cells'].insert(1, intro_cell)
        title = ''.join(nb['cells'][0]['source'])
        title = '\n'.join(line for line in title.splitlines() if 'Core Mastery:' not in line)
        phase = 1 if lesson['week'] <= 5 else 2 if lesson['week'] <= 9 else 3
        title = re.sub(r'— PHASE[^\n]*', f"— PHASE {phase}: {lesson['strand']}", title)
        nb['cells'][0]['source'] = title.rstrip().splitlines(keepends=True)
        # Preserve teaching/assessment details while reducing the opening's visual load.
        for cell in nb['cells'][2:]:
            if cell['cell_type'] != 'markdown':
                continue
            text = ''.join(cell['source'])
            if '<details>' in text:
                continue
            label = ('Learning objectives' if 'Learning Objectives' in text else
                     'Class participation and assessment' if 'Mechatronics Learning Contract' in text else
                     'Class schedule and checkpoints' if 'Roadmap' in text else None)
            if label:
                cell['source'] = (f'<details><summary>{label}</summary>\n\n'
                                  + text.strip() + '\n\n</details>\n').splitlines(keepends=True)
        write(path, json.dumps(nb, ensure_ascii=False, indent=1) + '\n')


def render_lesson(lesson, notebook):
    n = lesson['week']
    filename = f'Week_{n:02d}.html'
    concepts = ''.join(f'<article><h3>{esc(title)}</h3><p>{esc(text)}</p></article>' for title, text in lesson['concepts'])
    cases = ''
    for i, c in enumerate(lesson['cases']):
        trace = ''.join(f'<li>{esc(t)}</li>' for t in c['trace'])
        cases += f'''<details class="bench-case" data-case="{i}"><summary><span class="case-number">0{i+1}</span>{esc(c['label'])}</summary><div class="case-body"><p class="case-input">{esc(c['inputs'])}</p><p><strong>Question:</strong> {esc(c['question'])}</p><button type="button" class="advance" hidden>Reveal step 1</button><ol class="trace">{trace}</ol><div class="case-result"><h4>{esc(c['result'])}</h4><p>{esc(c['explanation'])}</p></div></div></details>'''
    by_id = {e['id']: e for e in notebook['exercises']}
    practice = ''.join(f'<li><span class="tag">{eid}</span> {esc(by_id[eid]["title"])}</li>' for eid in lesson['practice'])
    investigate = ''.join(f'<li>{esc(step)}</li>' for step in lesson['investigate'])
    options = ''.join(f'<option value="Week_{w:02d}.html"{" selected" if w == n else ""}>Week {w:02d} · {esc(LESSONS[w-1]["title"])}</option>' for w in range(1,15))
    weeknav = f'<div class="path-picker" data-jump-control hidden><label for="lesson-week">Week</label><select id="lesson-week" data-week-jump>{options}</select></div>'
    previous = f'<a href="Week_{n-1:02d}.html">← Week {n-1:02d}</a>' if n > 1 else '<a href="CP1_Course_Dashboard.html">← Course journey</a>'
    following = f'<a href="Week_{n+1:02d}.html">Week {n+1:02d} →</a>' if n < 14 else '<a href="CP1_Course_Dashboard.html">Return to course journey →</a>'
    caveat = f'<p class="note">{esc(lesson["caveat"])}</p>' if lesson.get('caveat') else ''
    body = f'''<main id="main">
{weeknav}
<div class="lesson-layout"><div class="lesson-content">
<header class="hero"><p class="eyebrow">Week {n:02d} / {esc(lesson['strand'])}</p><h1>{esc(lesson['title'])}</h1><p class="subtitle">{esc(lesson['subtitle'])}</p></header>
<section id="brief" class="section weekly-opening"><span id="understand" class="legacy-anchor"></span><p class="connection">{esc(lesson['intro']['connection'])}</p><p class="lead">{esc(lesson['brief'])}</p><div class="first-task"><p class="eyebrow">Start with the problem</p><h2>Try this first.</h2><p>{esc(lesson['intro']['first_task'])}</p></div><h3>Why this week's tool?</h3><p>{esc(lesson['intro']['why_tool'])}</p><p class="opening-outcome"><strong>By the end:</strong> {esc(lesson['intro']['success'])}</p></section>
<section id="model" class="section"><h2>The idea behind the program</h2><div class="concepts">{concepts}</div><details class="code-model"><summary>A short Python example</summary><p>Read the example alongside the explanation. Run it in a new notebook cell and change one input to see how it behaves.</p><pre><code>{esc(lesson['model'])}</code></pre><h3>Example output</h3><pre><samp>{esc(lesson['output'])}</samp></pre>{caveat}</details></section>
<section id="bench" class="section"><span id="experiment" class="legacy-anchor"></span><h2>Examples and variations</h2><p>Each example changes something about the same problem. Open the ones you want to explore and follow the worked explanation.</p>{cases}</section>
<section id="notebook-animations" class="section"><h2>See the Colab code run</h2><section class="cp1-lab" data-cp1-lab="{n}"><p>Interactive walkthroughs of {esc(notebook["title"])}. Enable JavaScript to step through code, variables, collections and output. The companion notebook remains available below.</p></section></section>
<section id="investigate" class="section"><h2>Work on it in Colab</h2><p>Use the notebook to try the ideas yourself. The steps below connect this week's example to the programming practice.</p><ol class="investigation">{investigate}</ol><p><strong>Something to take away:</strong> {esc(lesson['evidence'])}</p><div id="notebook"><div class="actions"><a class="button" href="{COLAB + notebook['notebook']}" target="_blank" rel="noopener">Open Week {n:02d} in Colab ↗</a></div><details class="path-resources"><summary>Suggested exercises, downloads &amp; solutions</summary><div><p>Read the notebook's teaching cells before these exercises.</p><ul class="practice">{practice}</ul><a href="../{notebook['notebook']}" download>Download notebook</a><a href="{COLAB + notebook['solutions']}" target="_blank" rel="noopener">Worked solutions</a><p>Use the notebook's core and optional labels to choose your workload. This activity fits within guided class time.</p></div></details></div></section>
<aside id="handover" class="section lesson-discussion"><span id="check" class="legacy-anchor"></span><h2>A question to discuss</h2><p class="lead">{esc(lesson['defend'])}</p><p>Use an example from your work to explain your answer to a classmate.</p><p class="next-idea">{esc(lesson['transfer'])}</p></aside>
<details class="path-reference"><summary>Optional notes</summary><div class="lesson-notes"><label for="observations">What I tried and noticed</label><textarea id="observations" data-note rows="4" placeholder="Changes, results or useful examples…"></textarea><label for="decision">What I want to remember or ask</label><textarea id="decision" data-note rows="4" placeholder="An explanation, a question or something to revisit…"></textarea><div class="notebook-tools" hidden><button type="button" id="export-notes">Download my notes</button><p id="save-status" role="status">Notes stay in this browser. Download a copy to keep them.</p></div><noscript><p>Automatic saving and note downloads require JavaScript. You can record notes separately.</p></noscript></div></details>
<details class="path-reference"><summary>Using AI or working with a partner</summary><div class="lesson-notes"><p>{esc(lesson['ai'])}</p><p>You can also review the supplied example with a partner. Use the same inputs to compare the reasoning. Follow the syllabus rules for assessed work.</p></div></details>
<nav class="prev-next" aria-label="Previous and next lesson">{previous}{following}</nav>
</div></div></main>'''
    return filename, shell(f'Week {n:02d}: {lesson["title"]}', body, n)

def render(weeks, write):
    assert [l['week'] for l in LESSONS] == list(range(1, 15))
    by_week = {w['week']: w for w in weeks}
    for lesson in LESSONS:
        name, content = render_lesson(lesson, by_week[lesson['week']])
        write(ROOT / 'web' / name, content)
    alias = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=CP1_Course_Dashboard.html"><title>CP1 weekly lessons</title></head><body><p>The engineering experiences are now the weekly lessons. <a href="CP1_Course_Dashboard.html">Open CP1</a>.</p></body></html>'
    write(ROOT / 'web' / 'CP1_Experiences.html', alias)
