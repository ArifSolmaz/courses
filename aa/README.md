# AA — Algorithm Analysis with Python

A 14-week introduction to algorithm analysis with Python that builds the needed
programming from the basics,
published at:

- Course home: <https://arifsolmaz.github.io/aa/>
- Weeks: <https://arifsolmaz.github.io/aa/w1> … `/aa/w14`

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
  index.html          generated — course home + syllabus
  w1/ … w14/          generated — one folder per week (URL: /aa/w7)
  assets/style.css    hand-written — shared styles, dark + light themes
  assets/app.js       hand-written — theme, copy buttons, quizzes, growth widget,
                                     per-week "done" tracking (localStorage)
  tools/build.py      the generator: page template + week metadata
  tools/home.html     source fragment for the course home
  tools/weeks/wNN.html  source fragment for each week's lesson
```

## Editing

Edit only `tools/` and `assets/`, then rebuild:

```bash
python3 aa/tools/build.py
```

That rewrites `aa/index.html` and `aa/w1/…/w14/index.html`. Week titles, summaries,
phases, "big questions" and chips live in the `WEEKS` list in `tools/build.py`;
lesson bodies live in `tools/weeks/`.

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
