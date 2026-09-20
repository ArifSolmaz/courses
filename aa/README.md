# AA — Algorithm Analysis with Python

A 14-week introduction to algorithm analysis with Python that builds the needed
programming from the basics,
published at:

- Course home: <https://arifsolmaz.github.io/courses/aa/>
- Detailed guide: <https://arifsolmaz.github.io/courses/aa/guide/>
- Weeks: <https://arifsolmaz.github.io/courses/aa/w1/> … `/courses/aa/w14/`

Start at the course home and choose a week. Each weekly lesson follows
**Understand → Investigate → Check**. Slower bilingual explanations are available
inside that lesson under “Need a slower explanation?”, so students do not have to
choose between two competing weekly routes. The standalone guide URLs and complete
Markdown edition remain available as reference material.

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
                                     weeks/wNN.md, meaning/wNN.md, deepening/wNN.md
  assets/guide.css    guide reading, mobile, dark/light and print styles
  assets/guide.js     guide chapter navigation, theme and printing
  tools/learning_path.py  weekly stages and embedded bilingual support
  tools/course_reference.html  folded syllabus and course policies
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

## Supplied beginner notes and exercises

The two supplied Skiena DOCX sources are adapted within the existing weekly route.
Each week has a concise explanation and one focused problem; the rest is folded
optional practice. All 205 source exercises retain their numbers: 97 in weekly
pages and 108 alongside three optional advanced introductions at `extensions/`.
Source mapping and editorial corrections are documented in
[tools/materials/README.md](tools/materials/README.md).

Run `python3 aa/tools/verify_skiena_material.py` after rebuilding.

## Meaning before analysis

`tools/guide/meaning/wNN.md` supplies the topic-specific meaning, representation, prediction, worked reasoning and transfer question for every week. The same authored source appears at the start of the weekly Understand stage and in the detailed guide; the main lesson folds the worked answer until students choose to reveal it. `build_guide.py` includes the sources in its guide and verification manifest, and `learning_path.py` renders them into the weekly route. Use the existing Markdown grammar and independently runnable, bounded Python examples. These sections strengthen the current topic order without adding graded work.
