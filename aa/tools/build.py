#!/usr/bin/env python3
"""
Static site generator for the "Algorithm Analysis with Python" course.

    python3 aa/tools/build.py

Reads the lesson fragments in aa/tools/weeks/wNN.html plus the course-home
fragment aa/tools/home.html, wraps them in the shared page template and writes:

    aa/index.html          course home + syllabus
    aa/w1/index.html ...   one folder per week, so the published URL is
    aa/w14/index.html      https://arifsolmaz.github.io/aa/w1 ... /w14

Only the fragments and this file are edited by hand; everything under
aa/w*/ is generated.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent      # .../aa
FRAG = ROOT / "tools" / "weeks"

SITE = "Algorithm Analysis with Python"
SHORT = "AA"

PHASES = {
    1: "Phase 1 · Thinking in steps",
    2: "Phase 2 · Measuring for real",
    3: "Phase 3 · The language of growth",
    4: "Phase 4 · Choosing well",
}

# num, title, one-line summary for the home page, phase, "big question", chips
WEEKS = [
    (1, "What Is an Algorithm?",
     "Recipes, step-by-step thinking, and why two correct methods can be wildly different.",
     1, "If two people both get the right answer, why would we prefer one method?",
     ["no programming needed", "Colab setup", "≈2 hours"]),
    (2, "Your First Python: Values, Names, and Output",
     "print, variables, numbers, text — the four things you need before anything else.",
     1, "How do I give the computer one instruction at a time?",
     ["first code", "≈2 hours"]),
    (3, "Repeating Work: Loops and a Step Counter",
     "for, range, and while — plus counting how many steps your program really takes.",
     1, "How do I make the computer repeat work, and how do I count that work?",
     ["loops", "step counting", "≈2.5 hours"]),
    (4, "Lists: Holding Many Things at Once",
     "Making lists, reading items, searching with in — and feeling work grow with size.",
     1, "What happens to the work when the data gets bigger?",
     ["lists", "searching by hand", "≈2.5 hours"]),
    (5, "Functions and the Stopwatch",
     "Wrap work in a function, then time it honestly with perf_counter and repeats.",
     2, "How long does my code actually take?",
     ["functions", "timing", "≈2.5 hours"]),
    (6, "The Doubling Experiment",
     "Double n, look at the time: flat, twice as slow, or four times as slow?",
     2, "What does the running time do when the input doubles?",
     ["experiments", "matplotlib", "≈3 hours"]),
    (7, "Counting Steps Instead of Seconds",
     "Seconds depend on your laptop; step counts don't. Meet T(n) and the dominant term.",
     3, "How do we compare algorithms without comparing computers?",
     ["T(n)", "dominant term", "≈2.5 hours"]),
    (8, "Big-O Notation",
     "One short symbol for a growth story: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ).",
     3, "What is the shortest honest way to describe how an algorithm scales?",
     ["big-O", "midterm review", "≈3 hours"]),
    (9, "One Problem, Four Algorithms: The Anagram Story",
     "The classic case study — four correct solutions, four completely different costs.",
     3, "Same answer, same computer: why is one version a million times slower?",
     ["case study", "comparison", "≈3 hours"]),
    (10, "What Python Lists Really Cost",
     "append vs insert(0), pop() vs pop(0), + vs comprehension — measured, not guessed.",
     4, "Which everyday list operations are cheap, and which quietly cost a fortune?",
     ["benchmark lab", "≈3 hours"]),
    (11, "Dictionaries and Sets: Lookup That Doesn't Slow Down",
     "Hashing intuition and the single biggest speed win a beginner can learn.",
     4, "How can looking something up cost the same in a list of 10 and a list of 10 million?",
     ["dict", "set", "≈3 hours"]),
    (12, "Searching: Linear vs Binary",
     "Guess-the-number, the phone book trick, and why log n barely grows.",
     4, "How do you find something in a million items with only 20 looks?",
     ["binary search", "≈3 hours"]),
    (13, "Sorting: Why Some Sorts Are Slow",
     "Bubble and selection sort by hand, then Python's sorted() — n² vs n log n on a plot.",
     4, "Why is the sort you invent yourself so much slower than the built-in one?",
     ["sorting", "≈3 hours"]),
    (14, "Putting It All Together",
     "A checklist for choosing, the classic 'accidentally quadratic' traps, and the final project.",
     4, "Given a new problem, how do I choose — and prove — a good approach?",
     ["review", "final project", "≈3 hours"]),
]

# A short "where this leads" bridge shown at the foot of each week, tying the
# idea just finished to the one that opens next week. Keyed by week number;
# week 14 hands off to the engineering capstone. HTML is allowed.
BRIDGES = {
    1: "You reasoned about steps on <em>paper</em>. Next week the computer does the "
       "counting for you — your first lines of Python.",
    2: "You can now give the computer one instruction at a time. Real work means "
       "repeating instructions — so week 3 brings loops, and a counter that measures them.",
    3: "You can repeat work and count the repetitions. Week 4 gives you something worth "
       "repeating over — <strong>lists</strong> — and you will watch the count grow with the data.",
    4: "You searched a list by hand and felt the work grow with <code>n</code>. Time to stop "
       "counting by hand: week 5 wraps work in a function and times it with a real stopwatch.",
    5: "You can time one input size. Week 6 times several sizes at once and reads the pattern in "
       "the numbers — the doubling experiment.",
    6: "The ratio column revealed the shape, but the seconds drift with your laptop. Week 7 "
       "switches to counting <em>steps</em> — a measure that does not change when the hardware does.",
    7: "You can boil a step count down to its dominant term. Week 8 gives that shape its "
       "standard name and shorthand: <strong>Big-O</strong>.",
    8: "You can read a Big-O class off code. Week 9 puts it to work: one problem, solved four "
       "ways, landing in four completely different classes.",
    9: "You saw that changing <em>strategy</em> — not language or hardware — buys orders of "
       "magnitude. Week 10 hunts those costs inside everyday Python list operations.",
    10: "You learned that searching a list and inserting at its front are both O(n). Week 11 "
        "introduces the structures that make lookup O(1): dictionaries and sets.",
    11: "Hashing bought O(1) lookup but threw away order. Week 12 is for when you need order "
        "back — searching sorted data in O(log n) with binary search.",
    12: "Binary search only works on sorted data. Week 13 asks what sorting itself costs, and "
        "why the sort you invent is so much slower than the built-in one.",
    13: "You now have the whole toolkit — measuring, naming, choosing, and the cost of the "
        "common structures. Week 14 ties it together with a checklist, the classic traps, and "
        "your final project.",
    14: 'You can analyse an algorithm and defend a choice with evidence. One question remains, '
        'and it is the one that matters most for your degree: <strong>why does any of this belong '
        'in mechatronics engineering?</strong> The capstone answers it — deadlines, tiny chips, '
        'and control loops that cannot wait. '
        '<a href="../engineering/">Read the engineering capstone &rarr;</a>',
}

# The engineering-context capstone that closes the course.
CAP_SLUG = "engineering"
CAP_TITLE = "Why Algorithm Analysis Belongs in Mechatronics"
CAP_SUMMARY = ("The engineering payoff: in a mechatronic system an algorithm must not only be "
               "correct, it must finish before the next sensor sample arrives — on a chip with "
               "kilobytes of memory.")

HEAD = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{desc}">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}assets/style.css">
</head>
<body>
<header class="site-header">
  <a class="brand" href="{base}index.html">AA <span>/ algorithm analysis</span></a>
  <nav class="header-nav">
    <a class="hlink" href="{base}index.html">Course home</a>
    <a class="hlink" href="{base}index.html#weeks">All weeks</a>
    <a class="hlink" href="https://arifsolmaz.github.io/courses/">Other courses</a>
    <button class="hlink" data-theme-toggle type="button">&#9788; Light</button>
  </nav>
</header>
<main class="wrap">
"""

FOOT = """</main>
<footer class="site-footer">
  <span>{site} &middot; Dr. Arif Solmaz</span>
  <span><a href="{base}index.html">Course home</a> &middot; <a href="https://arifsolmaz.github.io/courses/">All courses</a></span>
</footer>
<script src="{base}assets/app.js"></script>
</body>
</html>
"""


def week_page(meta, body):
    num, title, summary, phase, question, chips = meta
    base = "../"
    prev_link = (
        f'<a href="../w{num-1}/">&larr; Week {num-1}</a>' if num > 1
        else '<a href="../index.html">&larr; Course home</a>'
    )
    next_link = (
        f'<a href="../w{num+1}/">Week {num+1} &rarr;</a>' if num < len(WEEKS)
        else f'<a href="../{CAP_SLUG}/">Engineering capstone &rarr;</a>'
    )
    bridge = BRIDGES.get(num)
    bridge_html = (
        f"""
<div class="note blue">
  <span class="label">Where this leads</span>
  <p>{bridge}</p>
</div>
""" if bridge else ""
    )
    chip_html = "".join(f'<span class="chip">{c}</span>' for c in chips)
    out = [
        HEAD.format(
            title=f"Week {num}: {title} — {SHORT}",
            desc=summary,
            base=base,
        ),
        f"""<div class="hero">
  <div class="eyebrow">Week {num:02d} &middot; {PHASES[phase]}</div>
  <h1>{title}</h1>
  <p class="lede">{summary}</p>
  <div class="hero-meta"><span class="chip gold">Big question: {question}</span>{chip_html}</div>
</div>
""",
        body.strip(),
        bridge_html,
        f"""
<nav class="week-nav">
  {prev_link}
  <button class="done-btn" type="button" data-done="w{num}">mark this week done</button>
  {next_link}
</nav>
""",
        FOOT.format(site=SITE, base=base),
    ]
    return "\n".join(out)


def capstone_page(body):
    """The engineering-context page that closes the course."""
    base = "../"
    out = [
        HEAD.format(
            title=f"{CAP_TITLE} — {SHORT}",
            desc=CAP_SUMMARY,
            base=base,
        ),
        f"""<div class="hero">
  <div class="eyebrow">Capstone &middot; Engineering context</div>
  <h1>{CAP_TITLE}</h1>
  <p class="lede">{CAP_SUMMARY}</p>
  <div class="hero-meta"><span class="chip gold">For Mechatronics Engineering students</span><span class="chip blue">Real-time &middot; embedded &middot; control</span><span class="chip">reading, ≈1 hour</span></div>
</div>
""",
        body.strip(),
        """
<nav class="week-nav">
  <a href="../w14/">&larr; Week 14</a>
  <a href="../index.html">Course home</a>
  <a href="https://arifsolmaz.github.io/courses/spring/dsa/web/DSA_Course_Dashboard.html">Next course: DSA &rarr;</a>
</nav>
""",
        FOOT.format(site=SITE, base=base),
    ]
    return "\n".join(out)


def home_page(intro):
    cards = []
    current_phase = None
    for num, title, summary, phase, question, chips in WEEKS:
        if phase != current_phase:
            current_phase = phase
            cards.append(f'</div>\n<div class="phase">{PHASES[phase]}</div>\n<div class="grid">')
        cards.append(
            f"""  <a class="week-card" data-week="w{num}" href="w{num}/">
    <div class="card">
      <div class="wk">WEEK {num:02d}</div>
      <h4>{title}</h4>
      <p>{summary}</p>
      <span class="tick">&#10003;</span>
    </div>
  </a>"""
        )
    grid = '<div class="grid">' + "\n".join(cards) + "</div>"
    grid = grid.replace('<div class="grid"></div>\n', "", 1)
    body = intro.replace("<!--WEEK-GRID-->", grid)
    return "\n".join([
        HEAD.format(
            title=f"{SITE} — {SHORT}",
            desc="A 14-week introduction to algorithm analysis with Python, from the basics to Big-O, with a mechatronics engineering capstone.",
            base="",
        ),
        body.strip(),
        FOOT.format(site=SITE, base=""),
    ])


def main():
    missing = []
    for meta in WEEKS:
        num = meta[0]
        frag = FRAG / f"w{num:02d}.html"
        if not frag.exists():
            missing.append(frag.name)
            continue
        target = ROOT / f"w{num}" / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(week_page(meta, frag.read_text()), encoding="utf-8")
        print(f"  wrote {target.relative_to(ROOT.parent)}")

    home_frag = ROOT / "tools" / "home.html"
    if home_frag.exists():
        (ROOT / "index.html").write_text(home_page(home_frag.read_text()), encoding="utf-8")
        print(f"  wrote {(ROOT / 'index.html').relative_to(ROOT.parent)}")
    else:
        missing.append("home.html")

    cap_frag = ROOT / "tools" / f"{CAP_SLUG}.html"
    if cap_frag.exists():
        target = ROOT / CAP_SLUG / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(capstone_page(cap_frag.read_text()), encoding="utf-8")
        print(f"  wrote {target.relative_to(ROOT.parent)}")
    else:
        missing.append(f"{CAP_SLUG}.html")

    if missing:
        print("\nMISSING FRAGMENTS: " + ", ".join(missing), file=sys.stderr)
        return 1
    print("\nOK — 14 weeks + capstone + home built.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
