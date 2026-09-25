# Skiena-aligned teaching route

`course.py` is the canonical 14-week mapping and authored core explanations.
`visuals.py` supplies labelled figures and runnable Python demonstrations.
`lectures.json` contains extracted paragraphs and tables from the supplied bilingual notes; lecture numbering stays 1–22. The download and repository DOCX have identical paragraph text (formatting differs). No DOCX was edited for this change.
`build.py` combines that content with the previously reviewed question bank. All 120 original MCQs and 205 original written exercises remain included. Tests may repeat as prerequisite review; every written exercise has one primary home. Sixteen new conceptual tests fill gaps. Existing Python-specific authored questions remain in the support library.

Run `python3 aa/tools/build.py`, then `python3 aa/tools/verify_alignment.py`.

The earlier generated course and guide were preserved under `aa/python/` with rewritten relative links. These are deliberately labelled as the former sequence, not current teaching weeks. The old source generator is retained as `build_legacy.py` for reference; do not run it into the published current routes. Earlier verifier scripts that assert the former sequence are historical checks; `verify_alignment.py` checks the current route. The unchanged Week 1 animation maths checks still apply.

Weeks 12–14 explicitly select introductory sections. Advanced exercises are teaching reserves, not a demand to cover all source lectures in full during one class. Assessment weighting remains 50% midterm and 50% final; optional material is not introduced as assessed scope.
