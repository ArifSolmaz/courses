"""Render the authored engineering experiences alongside the notebook index."""
from pathlib import Path
import html
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
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="CP1 engineering experiences for mechatronics: predict, investigate, test and explain, with companion Python notebooks.">
<title>{esc(title)} · CP1 Engineering Experiences</title>
<link rel="stylesheet" href="cp1-experiences.css?v=2"><script src="cp1-experiences.js?v=2" defer></script><link rel="stylesheet" href="../../../assets/learning-path.css?v=1"><script src="../../../assets/learning-path.js?v=1" defer></script></head>
<body data-week="{week}"><a class="skip" href="#main">Skip to content</a>
<header class="top"><a class="brand" href="CP1_Course_Dashboard.html">CP1 <span>/ ENGINEERING EXPERIENCES</span></a><nav aria-label="Course"><a href="CP1_Course_Dashboard.html#week-{week or 1}">Course home</a><details class="path-menu"><summary>Resources</summary><div><a href="CP1_Syllabus.html">Syllabus</a><a href="../STUDY_GUIDE.md">Study advice</a></div></details><button type="button" id="theme-toggle" hidden>Dark theme</button></nav></header>
{body}<footer><p>Computer Programming I · Mechatronics Engineering · Dr. Arif Solmaz</p><p>Predict → investigate → test → explain. <span lang="tr">Önce düşün, dene, kanıtla ve açıkla.</span></p><a href="CP1_Course_Dashboard.html">Course home</a></footer></body></html>'''

def simulator(week):
    if week == 1:
        return '''<section class="simulator" aria-labelledby="sim-title"><p class="eyebrow">Change one assumption</p><h3 id="sim-title">Wheel travel model</h3><p>Move the diameter slider with rotations fixed at 10. This computes ideal travel; it does not model slip.</p><label for="diameter">Wheel diameter (mm)</label><input id="diameter" type="range" min="60" max="70" step="0.5" value="65"><output id="wheel-result" for="diameter" aria-live="polite">65.0 mm → 2.042 m ideal travel</output><p>Formula: 10 × π × diameter_mm / 1000. Compare the result with your prediction before changing a second assumption.</p></section>'''
    if week == 4:
        return '''<section class="simulator" aria-labelledby="sim-title"><p class="eyebrow">Change the observations</p><h3 id="sim-title">Sampling bench</h3><p>The pulse is high for 200 ≤ t &lt; 300 ms. Samples start at the chosen offset and continue through 500 ms if the schedule lands there. This is simulated time.</p><label for="interval">Sample interval (ms)</label><input id="interval" type="range" min="50" max="350" step="50" value="100"><label for="offset">First sample offset (ms)</label><input id="offset" type="range" min="0" max="100" step="25" value="0"><output id="sampling-result" for="interval offset" aria-live="polite"></output><svg class="signal-plot" viewBox="0 0 480 155" role="img" aria-labelledby="signal-title signal-desc"><title id="signal-title">Pulse and sample positions</title><desc id="signal-desc">The signal is high from 200 milliseconds inclusive to 300 milliseconds exclusive. Circles show the selected sampling schedule. Exact observations are listed below.</desc><path class="axis" d="M40 20V115H450"/><path class="signal" d="M40 100H200V35H280V100H440"/><text x="4" y="39">HIGH</text><text x="7" y="104">low</text><text x="37" y="140">0</text><text x="185" y="140">200</text><text x="265" y="140">300</text><text x="410" y="140">500 ms</text><g id="sample-points"></g></svg><div class="sample-strip" id="sample-strip" aria-label="Sample observations"></div><p>Change interval first, then offset. A detected sample is marked HIGH; the log cannot establish what happened at unsampled times.</p></section>'''
    if week == 8:
        return '<section class="simulator"><p class="eyebrow">Keep the coordinates</p><h3>Inspect the original thermal map</h3><p>Zero-based row and column indices. Each cell is a temperature sample in °C. No spatial scale is supplied.</p><table class="thermal-map"><caption>Prepared 2 × 3 thermal map</caption><thead><tr><th scope="col">Row / column</th><th scope="col">0</th><th scope="col">1</th><th scope="col">2</th></tr></thead><tbody><tr><th scope="row">0</th><td>22</td><td>23</td><td>24</td></tr><tr><th scope="row">1</th><td>25</td><td class="hot">80 <small>Peak</small></td><td>26</td></tr></tbody></table><p>The colour emphasizes the maximum; the numeric values and label carry the same information without colour.</p></section>'
    if week == 10:
        return '''<section class="simulator" aria-labelledby="sim-title"><p class="eyebrow">Explore the domain</p><h3 id="sim-title">Calibration bench</h3><p>Fixed model: (voltage − 0.5) × 25 N/V. The supplied calibration covers 0.5–4.5 V.</p><label for="voltage">Sensor voltage (V)</label><input id="voltage" type="range" min="0" max="5" step="0.1" value="2.5"><output id="force-result" for="voltage" aria-live="polite"></output><p>The arithmetic continues outside the interval. The calibration evidence does not.</p></section>'''
    return ''

def render_lesson(lesson, notebook):
    n = lesson['week']
    filename = f'Week_{n:02d}.html'
    concepts = ''.join(f'<article><h3>{esc(title)}</h3><p>{esc(text)}</p></article>' for title, text in lesson['concepts'])
    cases = ''
    for i, c in enumerate(lesson['cases']):
        trace = ''.join(f'<li>{esc(t)}</li>' for t in c['trace'])
        cases += f'''<details class="bench-case" data-case="{i}"><summary><span class="case-number">0{i+1}</span>{esc(c['label'])}</summary><div class="case-body"><p class="case-input">{esc(c['inputs'])}</p><p><strong>Predict:</strong> {esc(c['question'])}</p><button type="button" class="advance" hidden>Reveal step 1</button><ol class="trace">{trace}</ol><div class="case-result"><h4>{esc(c['result'])}</h4><p>{esc(c['explanation'])}</p></div></div></details>'''
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
<div class="lesson-layout">
<div class="lesson-content"><section class="hero"><p class="eyebrow">Week {n:02d} / {esc(lesson['strand'])}</p><h1>{esc(lesson['title'])}</h1><p class="subtitle">{esc(lesson['subtitle'])}</p><p class="topic">Python tools: {esc(notebook['title'])}</p></section>
<div data-learning-path><nav class="path-steps" aria-label="Lesson steps" hidden><button type="button" data-step-target="understand" aria-controls="understand">1 · Understand</button><button type="button" data-step-target="experiment" aria-controls="experiment">2 · Investigate</button><button type="button" data-step-target="check" aria-controls="check">3 · Check</button></nav><section id="understand" data-step><section id="brief" class="section"><p class="eyebrow">01 / The situation</p><h2>{esc(lesson['question'])}</h2><p class="lead">{esc(lesson['brief'])}</p><div class="mission"><span class="tag">Your handover</span><p>{esc(lesson['evidence'])}</p></div><p class="note">Start on paper. Work alone or in a pair: one person predicts, the other challenges the assumptions; swap roles halfway through. All essential data is provided. No hardware or AI account is required.</p></section>
<section id="model" class="section"><p class="eyebrow">02 / Build a model</p><h2>Understand what the code represents.</h2><div class="concepts">{concepts}</div><details class="code-model"><summary>Inspect the small Python model</summary><p>Read and predict first. Run this self-contained example in a new notebook cell; use the result as evidence to discuss.</p><pre><code>{esc(lesson['model'])}</code></pre><h3>Reference output</h3><pre><samp>{esc(lesson['output'])}</samp></pre>{caveat}</details></section>
<button class="path-next" type="button" data-step-target="experiment" hidden>Next: investigate →</button></section><section id="experiment" data-step><section id="bench" class="section"><p class="eyebrow">03 / Predict & inspect</p><h2>Try to break your first explanation.</h2><p>These are prepared teaching cases, not live sensor readings or an automatic grade. Write a prediction before opening a case, then reveal the reasoning one step at a time. Explain any disagreement.</p><label for="prediction">My prediction, with a reason</label><textarea id="prediction" data-note rows="3" placeholder="For case … I expect … because …"></textarea>{cases}{simulator(n)}</section>
<section id="investigate" class="section"><p class="eyebrow">04 / Investigate</p><h2>One question. Several kinds of evidence.</h2><ol class="investigation">{investigate}</ol><div class="mission"><span class="tag">Keep the evidence</span><p>{esc(lesson['evidence'])}</p></div><label for="observations">Observed results and counterexamples</label><textarea id="observations" data-note rows="4" placeholder="Input → predicted result → observed result. What changed my explanation?"></textarea></section>
<section id="notebook" class="section"><p class="eyebrow">05 / Work in Colab</p><h2>Use Python to test the claim.</h2><p>The HTML experience supplies the engineering question; the existing notebook supplies the programming workshop. These are entry points into this week's notebook. Follow its prerequisite teaching cells before the exercises.</p><ul class="practice">{practice}</ul><div class="actions"><a class="button" href="{COLAB + notebook['notebook']}" target="_blank" rel="noopener">Week {n:02d} in Colab ↗</a></div><details class="path-resources"><summary>Downloads &amp; worked solutions</summary><div><a href="../{notebook['notebook']}" download>Download notebook</a><a href="{COLAB + notebook['solutions']}" target="_blank" rel="noopener">Compare solutions after your attempt</a></div></details><p class="note">Notebook core/optional labels and assessment rules remain as stated in the syllabus. Use this investigation within guided class time, not as an additional homework checklist. Colab opens the published repository copy.</p><details><summary>Suggested rhythm within the existing five-hour session</summary><p>30 min situation and prediction · 45 min model discussion · 60 min investigation · 90 min notebook workshop · 45 min review and explanation · 30 min breaks and reflection. The instructor can redistribute the time; this is a teaching suggestion, not a new timetable.</p></details></section>
<details class="path-reference"><summary>Review an AI or peer solution</summary><div><section class="section ai-review"><p class="eyebrow">AI as a collaborator / You own the judgment</p><h2>Review the answer, not its confidence.</h2><p>{esc(lesson['ai'])}</p><p>Without AI, review the supplied model or exchange an implementation with a partner. The same standard applies: state the claim, find a counterexample, and explain the correction. AI practice here does not change exam or demonstration rules.</p></section>
</div></details><button class="path-next" type="button" data-step-target="check" hidden>Next: check and explain →</button></section><section id="check" data-step><section id="handover" class="section"><p class="eyebrow">06 / Defend the result</p><h2>{esc(lesson['defend'])}</h2><p>Give a brief technical explanation using your own results. A useful handover contains a claim with units, one independent check, one boundary or fault case, and one limitation. More lines of code or more completed cells are not substitutes for this evidence.</p><label for="decision">My decision and its limits</label><textarea id="decision" data-note rows="5" placeholder="I conclude … My evidence is … This does not establish … Next I would …"></textarea><div class="notebook-tools" hidden><button type="button" id="export-notes">Download my engineering log</button><p id="save-status" role="status">Notes stay in this browser. Download a copy to keep or share them.</p></div><noscript><p>You can read all lessons and expand all cases without JavaScript. Automatic saving, log download and sliders require JavaScript; record your notes separately.</p></noscript><p class="next-idea">{esc(lesson['transfer'])}</p></section></section></div><nav class="prev-next" aria-label="Previous and next lesson">{previous}{following}</nav></div></div></main>'''
    return filename, shell(f'Week {n:02d}: {lesson["title"]}', body, n)

def render(weeks, write):
    assert [l['week'] for l in LESSONS] == list(range(1, 15))
    by_week = {w['week']: w for w in weeks}
    for lesson in LESSONS:
        name, content = render_lesson(lesson, by_week[lesson['week']])
        write(ROOT / 'web' / name, content)
    alias = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=CP1_Course_Dashboard.html"><title>CP1 weekly lessons</title></head><body><p>The engineering experiences are now the weekly lessons. <a href="CP1_Course_Dashboard.html">Open CP1</a>.</p></body></html>'
    write(ROOT / 'web' / 'CP1_Experiences.html', alias)
