# Skiena-aligned teaching route

`course.py` is the canonical 14-week mapping and authored core explanations.
`visuals.py` supplies labelled figures and runnable Python demonstrations.
`lectures.json` contains extracted paragraphs and tables from the supplied bilingual notes; lecture numbering stays 1–22. The download and repository DOCX have identical paragraph text (formatting differs). No DOCX was edited for this change.
`build.py` combines that content with the previously reviewed question bank. All 120 original MCQs and 205 original written exercises remain included. Tests may repeat as prerequisite review; every written exercise has one primary home. Sixteen new conceptual tests fill gaps. Existing Python-specific authored questions remain in the support library.

Run `python3 aa/tools/build.py`, then `python3 aa/tools/verify_alignment.py`.

The earlier generated course and guide were preserved under `aa/python/` with rewritten relative links. These are deliberately labelled as the former sequence, not current teaching weeks. The old source generator is retained as `build_legacy.py` for reference; do not run it into the published current routes. Earlier verifier scripts that assert the former sequence are historical checks; `verify_alignment.py` checks the current route. The unchanged Week 1 animation maths checks still apply.

Weeks 12–14 explicitly select introductory sections. Advanced exercises are teaching reserves, not a demand to cover all source lectures in full during one class. Assessment weighting remains 50% midterm and 50% final; optional material is not introduced as assessed scope.

## Compact route update

`compact.py` maps existing demonstrations to topic weeks and consolidates earlier URLs into redirects. `textbook-problems.json` preserves the 53 articles from the former textbook companion; these are now embedded under Notes in Weeks 2, 3 and 14. `assets/compact.js` provides accessible in-page views, five-question pagination and hash-link handling. The earlier snapshot pages under `python/` have been replaced by redirects; their content remains in Git history and original authoring files. Run the alignment verifier to check complete animation retention and absence of links to the retired libraries.

## 14-week map (September 2026)

`course.py` now holds one dict per week: `title`, `lectures`, `summary`, `python`, `examples` (a list of worked examples, each `question/example/steps/edge` with optional `label` and `figure`), `objectives`, `scope` (items ending in "(reading only)" are not examined) and an optional `code`. Week 7 merges the former sorting weeks (Lectures 8–9), Week 8 is Lectures 10–11, Week 9 is DFS (Lecture 12), Week 10 is MST and union-find (Lecture 13), Week 11 is shortest paths with a core Bellman–Ford example.

`build.py` places every original test and written exercise by topic (`TESTS`, `WRITTEN`; `placements()` adds the hook modules' extras) and generates three extra pages: `scope/` (what the exams cover; `<!-- AA:SAMPLE-QUESTIONS -->` marks where sample exam questions go), `review/` (cumulative review by week) and `textbook-problems/` (the 53 textbook articles grouped by topic, linked from the Notes of Weeks 2, 3 and 14).

Hooks for other authors, imported by `build.py` and `compact.py`:
- `theory.py`: `THEORY` (week → HTML after the worked examples), `NEW_MCQ` (ids 2000–2999), `NEW_WRITTEN` (ids 300–399), `EXTRA_TESTS`, `EXTRA_WRITTEN`.
- `transfer.py`: `TRANSFER` (week → HTML at the top of Practice), `NEW_MCQ` (ids 3000–3999), `NEW_WRITTEN` (ids 400–499), `EXTRA_TESTS`, `EXTRA_WRITTEN`.
- `animations_extra.py`: `ANIMATIONS_EXTRA` (week → list of `(slug, title, html, assets_html)`) appended by `compact.animation_content`.
