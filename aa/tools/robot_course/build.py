"""Build the engineering route while retaining the former bilingual lessons."""

from html import escape
from math import log10, log2
import re

from . import foundations, planning
from .labs import SHARED_MAP, lab_code


LESSONS = {"en": foundations.EN + planning.EN, "tr": foundations.TR + planning.TR}
# Each entry selects three of the eight questions for the in-class finish.
EXAM_QUESTIONS = (
    (2, 5, 7), (1, 5, 7), (0, 4, 7), (3, 4, 7), (2, 4, 7), (1, 6, 7), (1, 5, 7),
    (1, 3, 7), (2, 3, 7), (3, 5, 6), (3, 4, 7), (0, 4, 6), (2, 5, 7), (3, 5, 6),
)
# Topic equivalents in the previous edition, including comparisons for new topics.
REFERENCES = (
    (1,), (2, 3), (3,), (4,), (5,), (7,), (6,), (8,), (11,), (11,), (9,), (10,), (13,), (14,),
)


def page(lang, title, home, body, right, extra=""):
    tr = lang == "tr"
    label = "Algoritma Analizi" if tr else "Algorithm Analysis"
    skip = "İçeriğe geç" if tr else "Skip to content"
    top = "Başa dön ↑" if tr else "Back to top ↑"
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} · AA</title>
<link rel="stylesheet" href="{home}assets/route.css?v=2">
<link rel="stylesheet" href="{home}assets/robot-course.css?v=1">
{extra}
</head>
<body>
<a class="skip" href="#main">{skip}</a>
<header class="site-header"><a class="brand" href="{home}">AA <span>{label}</span></a>{right}</header>
<main id="main">{body}</main>
<footer><span>{label} · Dr. Arif Solmaz</span><a href="#main">{top}</a></footer>
</body>
</html>
"""


def growth_figure(tr):
    sizes = (10, 100, 1000)
    series = (("n", "#175d43", lambda n: n), ("n log₂ n", "#235d99", lambda n: n * log2(n)),
              ("n²", "#9d4626", lambda n: n * n))
    columns = "".join(f'<th scope="col">{label}</th>' for label, _, _ in series)
    rows = "".join(
        f'<tr><th scope="row">{n}</th>'
        + "".join(f'<td>{round(fn(n))}</td>' for _, _, fn in series) + '</tr>'
        for n in sizes
    )
    chart = []
    for power in range(1, 7):
        y = 216 - (power - 1) * 38
        chart.append(f'<path d="M65 {y}H350" stroke="#d5dbcf"/><text x="8" y="{y + 5}">{10**power}</text>')
    for i, n in enumerate(sizes):
        chart.append(f'<text x="{57 + i * 137}" y="238">{n}</text>')
    for i, (label, color, fn) in enumerate(series):
        coords = [(65 + j * 137, 216 - (log10(fn(n)) - 1) * 38) for j, n in enumerate(sizes)]
        points = " ".join(f"{x},{y:.2f}" for x, y in coords)
        chart.append(f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="3"/>')
        chart.extend(f'<circle cx="{x}" cy="{y:.2f}" r="4" fill="{color}"/>' for x, y in coords)
        chart.append(f'<text x="{65 + i * 95}" y="264" fill="{color}">{label}</text>')
    caption = ("Modeldeki yaklaşık işlem sayıları. İki eksen de logaritmiktir."
               if tr else "Approximate work counts in the models. Both axes use logarithmic scales.")
    return f"""<details><summary>{"Doldurduğun tabloyu karşılaştır" if tr else "Check your completed table"}</summary>
<figure class="growth-figure">
<table><thead><tr><th scope="col">n</th>{columns}</tr></thead><tbody>{rows}</tbody></table>
<svg viewBox="0 0 370 275" aria-hidden="true">{"".join(chart)}</svg>
<figcaption>{caption}</figcaption>
</figure>
</details>"""


def practice(questions, indices, answer):
    return '<ol class="practice-list">' + "".join(
        f'<li><p>{escape(questions[i][0])}</p><details><summary>{answer}</summary>'
        f'<p>{escape(questions[i][1])}</p></details></li>' for i in indices
    ) + '</ol>'


def lesson(week, lang):
    tr = lang == "tr"
    title, topic, setup, trace, solution, lab, questions = LESSONS[lang][week - 1]
    home = "../../" if tr else "../"
    suffix = "tr/" if tr else ""
    answer = "Yanıtı göster" if tr else "Show answer"
    paper, timing, exam, drills, references = (
        ("Kâğıt üzerinde izle", "Süreyi ölç", "Sınav tipi sorular", "Ek alıştırmalar", "Konu kaynakları")
        if tr else
        ("Trace it on paper", "Measure it", "Exam-style questions", "More practice", "Topic references")
    )
    switch = ('<a href="../" hreflang="en" lang="en">English</a>' if tr else
              '<a href="tr/" hreflang="tr" lang="tr">Türkçe</a>')
    extra = f"""<link rel="alternate" hreflang="{"en" if tr else "tr"}" href="{"../" if tr else "tr/"}">
<link rel="stylesheet" href="{home}assets/python-runner.css">
<script defer src="{home}assets/python-runner.js?v=3"></script>
<script defer src="{home}assets/robot-course.js?v=1"></script>"""
    map_view = ""
    route_trace = ""
    if 8 <= week <= 10:
        label = "Robotun ortak ızgarası" if tr else "The shared robot grid"
        key = ("S başlangıç, G hedef, # engel. Satır ve sütunlar sıfırdan başlar."
               if tr else "S is the start, G is the goal and # is blocked. Rows and columns start at zero.")
        map_view = f'<figure><pre aria-label="{label}">{chr(10).join(SHARED_MAP)}</pre><figcaption>{key}</figcaption></figure>'
        if week == 8:
            heading = "Çıkarılan" if tr else "Popped"
            column = "Kalan FIFO" if tr else "FIFO after processing"
            rows = (
                ("(0,0)", "(0,1), (1,0)"), ("(0,1)", "(1,0), (0,2)"),
                ("(1,0)", "(0,2), (2,0)"), ("(0,2)", "(2,0), (0,3)"),
                ("(2,0)", "(0,3), (2,1)"), ("(0,3)", "(2,1), (0,4)"),
                ("(2,1)", "(0,4), (2,2)"),
                ("(0,4)", "(2,2) · " + ("dur" if tr else "stop")),
            )
        else:
            heading = "Çıkarılan" if tr else "Popped"
            column = "g" if week == 9 else "g + h"
            path = ("(0,0)", "(1,0)", "(2,0)", "(2,1)", "(2,2)", "(2,3)", "(2,4)", "(1,4)", "(0,4)")
            priorities = range(9) if week == 9 else (4, 6, 8, 8, 8, 8, 8, 8, 8)
            rows = tuple(zip(path, priorities))
        trace_rows = "".join(f'<tr><th scope="row">{cell}</th><td>{state}</td></tr>' for cell, state in rows)
        route_trace = (f'<table class="robot-table"><thead><tr><th scope="col">{heading}</th>'
                       f'<th scope="col">{column}</th></tr></thead><tbody>{trace_rows}</tbody></table>')
    chosen = EXAM_QUESTIONS[week - 1]
    other = [i for i in range(len(questions)) if i not in chosen]
    ref_links = "".join(
        f'<li><a href="{home}w{n}/{suffix}reference.html">{escape(("Önceki ders " if tr else "Earlier Week ") + str(n))} · '
        f'{escape(LEGACY_TOPICS[lang][n - 1])}</a></li>'
        f'<li><a href="{home}w{n}/ek-notlar/#practice">'
        f'{("Geniş soru bankası ve ek notlar" if tr else "Extended question bank and notes")} · {n:02}</a></li>'
        for n in REFERENCES[week - 1]
    )
    paper_cue = ("Önce kendi izini yaz. Sonra adımları karşılaştır ve yöntemin neden işe yaradığını üç cümleyle açıkla."
                 if tr else "Write your trace first. Compare your steps, then explain why the method works in three sentences.")
    measurement = ("Çalıştır’a bas veya kodu Python 3’e kopyala. Çıktıdaki iki süre, beş grup ortalamasının medyanı ve en büyüğüdür. "
                   "Her biri çağrı başına milisaniye cinsindendir. Gözlenen en büyük grup ortalaması tek bir çağrının üst sınırı değildir."
                   if tr else "Select Run or copy the code into Python 3. The two times are the median and largest of five batch averages, "
                   "in milliseconds per call. The largest batch average does not bound an individual call.")
    if 8 <= week <= 10:
        measurement += (" Çıkarma sayısı hedefi içerir ve öbekteki eski kayıtları saymaz."
                        if tr else " The pop count includes the goal and excludes stale heap entries.")
    lesson_nav = "".join(
        f'<a href="#{fragment}">{label}</a>'
        for fragment, label in (("paper", paper), ("timing", timing), ("exam-practice", exam), ("topic-references", references))
    )
    weeks_nav = "".join(
        f'<a href="{home}w{n}/{suffix}">{arrow} {prefix} {n}</a>'
        for n, arrow, prefix in ((week - 1, "←", "Hafta" if tr else "Week"),
                                 (week + 1, "→", "Hafta" if tr else "Week"))
        if 1 <= n <= 14
    )
    midterm = ""
    if week == 7:
        midterm = '<p>' + ("Ara sınav 1–7. haftaları kapsar." if tr else "The midterm covers Weeks 1–7.") + '</p>'
    bridge = (
        '<p>Karar sürümü, “B bütçesine uyan bir tur var mı?” diye sorar. Bu TSP karar problemi NP-tamdır. '
        'P, NP’nin içindedir. Verilen bir turun hızlı kontrolü bütün örnekleri hızlı çözmenin mümkün olduğunu göstermez.</p>'
        if tr else
        '<p>The decision version asks whether a tour fits budget B. This version of TSP is NP-complete '
        'for integer distance tables. P is contained in NP. Checking one proposed tour quickly leaves open '
        'whether every instance can be solved quickly.</p>'
    ) if week == 14 else ""
    if week == 14 and tr:
        bridge = bridge.replace("Bu TSP karar problemi NP-tamdır.", "Tam sayı uzaklık tablolarında bu TSP karar problemi NP-tamdır.")
    body = f"""
<section class="hero compact" aria-labelledby="lesson-title">
<p class="eyebrow">{"Hafta" if tr else "Week"} {week:02} / 14 · {escape(topic)}</p>
<h1 id="lesson-title">{escape(title)}</h1>
<p class="eyebrow">10 min · {"Mühendislik sorusu" if tr else "Engineering question"}</p>
<p class="lead">{escape(setup)}</p>
{bridge}
<nav class="robot-nav" aria-label="{"Ders akışı" if tr else "Lesson sections"}">{lesson_nav}</nav>
</section>
<section id="paper"><p class="eyebrow">25 min</p><h2>{paper}</h2>
{map_view}<p>{escape(trace)}</p><p>{paper_cue}</p>
<details><summary>{"İzi karşılaştır" if tr else "Check your trace"}</summary><p>{escape(solution)}</p>{route_trace}</details>
{growth_figure(tr) if week == 2 else ""}
</section>
<section id="timing"><p class="eyebrow">20 min</p><h2>{timing}</h2>
<p>{escape(lab)}</p><p>{escape(measurement)}</p>
<pre class="python-example" data-python="1"><code>{escape(lab_code(week))}</code></pre>
</section>
<section id="exam-practice"><h2>{exam}</h2>{practice(questions, chosen, answer)}{midterm}</section>
<section id="drills"><h2>{drills}</h2>{practice(questions, other, answer)}</section>
<section id="topic-references"><h2>{references}</h2>
<p>{"Önceki derslerin hafta numaraları farklı konulara karşılık gelebilir." if tr else "Earlier lessons can use different week numbers for the same topic."}</p>
<ul class="plain-links">{ref_links}</ul>
<p><a href="{home}resources/#assessment">{"Sınav kapsamı ve proje" if tr else "Exam scope and project"}</a></p>
<nav class="robot-nav" aria-label="{"Haftalar" if tr else "Weeks"}">{weeks_nav}</nav>
</section>"""
    return page(lang, title, home, body, switch, extra)


LEGACY_TOPICS = {
    "en": ("Linear search", "Counting work", "Growth and binary search", "Arrays and queues",
           "Lookup and hashing", "Heaps", "Sorting and recursion", "BFS", "DFS and dependencies",
           "Kruskal", "Dijkstra", "Backtracking", "Dynamic programming", "Verification and complexity"),
    "tr": ("Doğrusal arama", "İşlem sayımı", "Büyüme ve ikili arama", "Diziler ve kuyruklar",
           "Arama ve karma", "Öbekler", "Sıralama ve özyineleme", "BFS", "DFS ve bağımlılıklar",
           "Kruskal", "Dijkstra", "Geri izleme", "Dinamik programlama", "Doğrulama ve karmaşıklık"),
}


def dashboard(template):
    phases = {
        1: ("01–03 · Read and measure", "Count work and estimate the budget for a control cycle."),
        4: ("04–07 · Store, filter and schedule", "Keep sensor data and release timers within a fixed budget."),
        8: ("08–11 · Route and start up", "Find a grid route, then order the robot’s startup tasks."),
        12: ("12–14 · Connect, reuse and approximate", "Wire the dock, reuse route costs and plan a pickup tour."),
    }
    weeks = []
    for n, (question, topic, *_) in enumerate(LESSONS["en"], 1):
        phase = ""
        if n in phases:
            heading, description = phases[n]
            phase = f'<div class="phase"><h3>{heading}</h3><p>{description}</p></div>'
        midterm = '<p class="language-note">Midterm follows Week 7.</p>' if n == 7 else ""
        weeks.append(f'<li class="week">{phase}<a href="w{n}/"><span class="week-number">Week {n:02}</span>'
                     f'<span><strong>{escape(question)}</strong><span class="outcome">{escape(topic)}</span></span>'
                     f'<span class="arrow" aria-hidden="true">→</span></a>{midterm}</li>')
    template = template.replace(
        "One connected route through fourteen weeks of Algorithm Analysis, using the same devices and their network.",
        "Fourteen engineering questions about time, memory and algorithm choice for a mobile robot.",
    )
    template = template.replace("14 weeks · One connected course", "14 weeks · Algorithm Analysis for mechatronics")
    template = template.replace("From one record<br>to a whole network.", "Will it fit the robot’s budget?")
    template = re.sub(r'<p class="lead">.*?</p>\s*<p>.*?</p>',
                      '<p class="lead">Will this computation fit in my robot’s time and memory budget, and which method should I pick?</p>'
                      '<p>Follow one mobile robot from its first sensor reading to its route, startup and workcell tour. '
                      'Each week opens with a 10-minute engineering question, then moves through a 25-minute paper trace, '
                      'a 20-minute Python timing lab and three exam-style questions. No prior Python is required.</p>',
                      template, count=1)
    return re.sub(r'(<ol class="weeks"[^>]*>).*?(</ol>)', lambda match: match[1] + "\n" + "\n".join(weeks) + "\n" + match[2],
                  template, count=1, flags=re.S)


def resources(template):
    legacy = "".join(
        f'<li><strong>{escape(topic)}</strong> <a href="../w{n}/reference.html">English</a> · '
        f'<a href="../w{n}/tr/reference.html" hreflang="tr" lang="tr">Türkçe</a></li>'
        for n, topic in enumerate(LEGACY_TOPICS["en"], 1)
    )
    template = template.replace('<section id="earlier-notes">', f"""<section id="earlier-lessons">
<h2>Earlier bilingual lessons and animations</h2>
<p>Use these for extra traces, interactive demonstrations and formal theory. Week numbers in this edition follow the earlier sequence.</p>
<details><summary>Find an earlier lesson by topic</summary><ul class="plain-links">{legacy}</ul></details>
</section>
<section id="earlier-notes">""")
    template = template.replace("One connected route through fourteen weeks of Algorithm Analysis, using the same devices and their network.",
                                "Resources, assessment and optional grid-planner project for Algorithm Analysis.")
    return re.sub(r'<details id="assessment">.*?</details>', """<section id="assessment"><h2>Assessment for the engineering route</h2>
<p>Midterm 50%, Weeks 1–7. Final 50%, Weeks 1–14, with emphasis on Weeks 8–14. Weekly practice is ungraded.</p>
<p>Expect traces, operation and memory counts, method choices with short explanations, and estimates against a time budget.
Use the three exam-style questions in each lesson as models. The earlier exam scope above is historical.</p>
<h3 id="grid-project">Optional grid-planner project</h3>
<p>Compare BFS, Dijkstra and A* on the shared grid, a larger open map and a map with an unreachable goal.
Predict which method will minimize moves, which will minimize cost, and how much work each will do.
Run each planner with the same map and endpoints. Record the route, moves, terrain cost, pop count and repeated timings.
Track peak frontier size and estimate storage for frontier entries and parent records.
Explain one case where the methods differ and recommend a planner for a stated time and memory budget.
Use the code in <a href="../w8/#timing">Week 8</a>, <a href="../w9/#timing">Week 9</a> and <a href="../w10/#timing">Week 10</a> as a starting point.</p>
<p>Suggested deliverable is one table and a one-page explanation. Check path validity and handle the unreachable case explicitly.
The project is ungraded. A 20–30% weighting can be considered if the course regulations permit it and the instructor approves a revised grading plan.</p>
<details lang="tr"><summary>Türkçe sınav ve proje bilgisi</summary>
<p>Ara sınav %50 (1–7. haftalar), final %50 (1–14. haftalar, ağırlık 8–14). Haftalık alıştırmalar puanlanmaz.
Adım izleme, süre ve bellek hesabı, yöntem seçimi ve kısa gerekçe beklenir.</p>
<p>İsteğe bağlı projede BFS, Dijkstra ve A*’ı ortak ızgarada, daha büyük açık bir haritada ve hedefe ulaşılamayan bir haritada karşılaştır.
Önce tahmin et. Rota, hamle, arazi maliyeti, çıkarılan hücre sayısı ve tekrarlı süre ölçümlerini yaz.
Arama sınırındaki en yüksek kayıt sayısını ölç. Sınır ve ebeveyn kayıtları için gereken belleği tahmin et.
Bir farklılığı açıkla ve bir süre ile bellek bütçesi için yöntem seç. Bir tablo ve bir sayfalık açıklama yeterlidir. Proje puanlanmaz.</p></details>
</section>""", template, count=1, flags=re.S)


def legacy_lesson(source, lang):
    # Keep assets and local anchors at their original relative depth.
    prefix = "../../" if lang == "tr" else "../"
    archive = "tr/reference.html" if lang == "tr" else "reference.html"
    target = re.escape(prefix) + r'w(\d+)/' + ('tr/' if lang == 'tr' else '')
    source = re.sub(r'href="' + target + r'(?=[#"])',
                    lambda m: f'href="{prefix}w{m[1]}/{archive}', source)
    source = source.replace('href="tr/"', 'href="tr/reference.html"')
    if lang == "tr":
        source = re.sub(r'(<nav class="language-switch"[^>]*>.*?)href="../"', r'\1href="../reference.html"', source, count=1)
        notice = 'Önceki konu anlatımı · <a href="../../#schedule">Güncel ders programı</a>'
    else:
        notice = 'Earlier topic lesson · <a href="../#schedule">Current course schedule</a>'
    return re.sub(r'(<main[^>]*>)', lambda m: m[1] + f'<p class="caption">{notice}</p>', source, count=1)


def write_route(root):
    for week in range(1, 15):
        for lang in LESSONS:
            directory = root / f"w{week}"
            if lang == "tr":
                directory /= "tr"
            main = directory / "index.html"
            reference = legacy_lesson(main.read_text(encoding="utf-8"), lang)
            (directory / "reference.html").write_text(reference, encoding="utf-8")
            main.write_text(lesson(week, lang), encoding="utf-8")

    for path, render in (("index.html", dashboard), ("resources/index.html", resources)):
        output = root / path
        output.write_text(render(output.read_text(encoding="utf-8")), encoding="utf-8")
    guide = "# Algorithm Analysis\n\n" + "\n".join(
        f"- Week {n}: [{question}](w{n}/) · {topic}"
        for n, (question, topic, *_) in enumerate(LESSONS["en"], 1)
    )
    (root / "COURSE_GUIDE.md").write_text(guide + "\n\nSee [resources](resources/) for assessment and earlier editions.\n",
                                         encoding="utf-8")
