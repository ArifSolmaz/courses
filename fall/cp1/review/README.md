# Week 6 entry diagnostic: CP1 Weeks 1–5

Standalone `index.html`, built with `python3 fall/cp1/review/build.py`. No runtime, dependencies or network requests are needed for the quiz. Its external course links need internet. Students download one small HTML file, not the offline Python engine.

Source alignment: maintained `notebooks/Week_01.ipynb` through `Week_05.ipynb`, checked 2026-10-17. These are original review questions based on taught concepts. Five questions per week, numbered 1–25; no Week-6 lists or later material is assessed.

| Week | Questions | Sampled topics |
|---|---|---|
| 1 | 1–5 | Assignment, types, comments/print, runtime state, arithmetic with units |
| 2 | 6–10 | Quotient/remainder, precedence, input conversion, formatting, conversion errors |
| 3 | 11–15 | Threshold equality, branch order, inclusive bounds, Boolean validation, indentation |
| 4 | 16–20 | range endpoints, sum, filtered count, nested loops, product initialization |
| 5 | 21–25 | while trace, break, continue, progress/termination, sentinel/empty data |

Each item has one correct option, explanation, specific feedback for each of its three distractors, and a notebook part/exercise reference. After all questions are answered, scoring awards one point per correct answer (25 total), shows five week scores and orders missed topics by weakest week. All explanations then appear beneath the questions. No speed scoring. The score bands are instructional wording, not validated proficiency cutoffs; the UI states the sampling limitations.

This is self-assessment, not secure assessment: answers are present in source, no proctoring or identity validation, no instructor dashboard or central collection. Scores/choices remain local. Browser storage is guarded and optional; shared-computer users can clear answers. Retrying clears the attempt; repeat results are not represented as independent evidence of learning.

Run `python3 fall/cp1/review/verify.py` to validate executable traces and boundary answers, and `node fall/cp1/review/verify.cjs` for scoring and state validation. Never run Q24 directly: it intentionally describes a nonterminating loop.

Browser verification: incomplete submission withheld scores; deliberate three-error attempt gave 22/25 with the expected week/topic recommendations; perfect and all-wrong attempts gave 25/25 and 0/25; all 25 explanations appeared only after submission. Completed and partial attempts restored on reload; clearing reset progress. Desktop and 430px result layouts checked, with no page-width overflow.
