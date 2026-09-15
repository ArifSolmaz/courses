# AA — Algorithm Analysis with Python

A 14-week introduction to algorithm analysis with Python that builds the needed
programming from the basics,
published at:

- Course home: <https://arifsolmaz.github.io/courses/aa/>
- Detailed guide: <https://arifsolmaz.github.io/courses/aa/guide/>
- Weeks: <https://arifsolmaz.github.io/courses/aa/w1/> … `/courses/aa/w14/`

Start with the [Detailed Learning Guide hub — English with Turkish explanations](guide/index.html)
or its [complete Markdown edition](COURSE_GUIDE.md). The web guide is now separated into
toolkit, bridge, weekly, and review pages. Every week includes slow explanations,
traces, worked calculations, fully solved practice, misconceptions, and readiness checks.
Nine arithmetic bridges and four review sessions support the existing 14-week sequence.

## Design

Audience is students who have **never programmed**. Weeks 1–4 teach only the Python
needed (print, variables, loops, lists); weeks 5–14 are the subject itself. Every idea
follows the same cycle: **guess → measure → explain → name**.

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 · Thinking in steps | 1–4 | Algorithms, first Python, loops, lists, counting steps by hand |
| 2 · Measuring for real | 5–6 | Functions, `perf_counter`, the doubling experiment, plots |
| 3 · The language of growth | 7–9 | T(n) and dominant terms, Big-O, the anagram case study |
| 4 · Choosing well | 10–14 | List costs, dict/set, searching, sorting, capstone |

Weeks 7–11 follow the Algorithm Analysis chapter of Miller & Ranum,
*Problem Solving with Algorithms and Data Structures using Python*
(<https://runestone.academy/ns/books/published/pythonds/AlgorithmAnalysis/toctree.html>),
rewritten for a beginner audience with step counters and benchmarks added throughout.

## Layout

```
aa/
  COURSE_GUIDE.md      generated — complete bilingual guide, all 14 weeks
  guide/index.html    generated — guide hub and page menu
  guide/toolkit/      generated — shared analysis methods
  guide/bridges/      generated — discrete math bridge notes
  guide/w01/ … w14/   generated — separate weekly teacher-guide pages
  guide/reviews/      generated — review blocks and timed practice
  index.html          generated — course home + syllabus
  w1/ … w14/          generated — one folder per week (URL: /aa/w7)
  assets/style.css    hand-written — shared styles, dark + light themes
  assets/app.js       hand-written — theme, copy buttons, quizzes, growth widget,
                                     per-week "done" tracking (localStorage)
  tools/build.py      the generator: page template + week metadata
  tools/build_guide.py  dependency-free guide generator (called by build.py)
  tools/guide/        guide sources: start.md, toolkit.md, math.md, reviews.md,
                                     weeks/wNN.md, deepening/wNN.md
  assets/guide.css    guide reading, mobile, dark/light and print styles
  assets/guide.js     guide chapter navigation, theme and printing
  tools/home.html     source fragment for the course home
  tools/weeks/wNN.html  source fragment for each week's lesson
```

## Editing

Edit only `tools/` and `assets/`, then rebuild:

```bash
python3 aa/tools/build.py
```

That rewrites `aa/index.html`, `aa/w1/…/w14/index.html`, the capstone, the guide hub,
all separated guide pages, and the complete Markdown guide. Week titles, summaries,
phases, "big questions" and chips live in the `WEEKS` list in `tools/build.py`;
lesson bodies live in `tools/weeks/`.

Edit guide content in `tools/guide/`. Its small Markdown grammar supports headings,
paragraphs, flat unordered and ordered lists, pipe tables, fenced code, emphasis,
inline code, and links.
Links in those fragments are relative to `aa/`; the HTML generator adjusts them for
`aa/guide/`, `aa/guide/w01/`, `aa/guide/reviews/`, and the other separated pages.
Keep Python fences independently runnable with bounded example inputs;
use `text` fences for pseudocode, calculations, and illustrative output. The guide can
also be rebuilt alone with `python3 aa/tools/build_guide.py`.

Run `python3 aa/tools/verify_guide.py` to execute every guide Python example in a
fresh process and check every generated guide page's local links and anchors. It records
source/artifact hashes and results in `tools/guide/verification.json`.
Hashes normalize text to UTF-8 with LF line endings, so Windows and GitHub checkouts agree.

### Conventions used in the fragments

- `<section>` per numbered part, headed by `<h2><span class="num">7.3</span>Title</h2>`
- Code: `<div class="code"><div class="code-head">…</div><pre><code>…</code></pre></div>`
  (a copy button is added by JS); sample output goes in `<div class="out">`
- Callouts: `<div class="note">`, plus `.blue`, `.green`, `.red` variants
- Exercises: `<div class="task">` with a `<details class="solution">` for the answer
- Quizzes: `<div class="quiz" data-quiz>` containing `<div class="q" data-answer="2">`
  with `<button class="opt">` options and one `<div class="why">` explanation
- Growth widget: `<div class="widget" data-growth="steps">` or `data-growth="time"`
- Escape `<` and `>` inside code samples as `&lt;` / `&gt;`

No build dependencies beyond Python 3 — the site is plain static HTML/CSS/JS.
