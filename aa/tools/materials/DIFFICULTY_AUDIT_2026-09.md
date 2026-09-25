# Difficulty audit — September 2026

Rubric (AA_SPEC): **Easy** = one-step recall or trace; **Medium** = derivation or
multi-step trace; **Hard** = proof or design. Every item labelled `Hard` in
`skiena_mcq.json` (12) and `skiena_exercises.json` (45) was read against that
rubric. Only the `level` field was changed; questions, options and answers are untouched.

Result: 22 downgrades (12 MCQ, 10 written). 35 written items remain Hard; no MCQ remains Hard.

## Multiple-choice (`skiena_mcq.json`)

| id | old → new | reason |
|---|---|---|
| 19 | Hard → Medium | Recall of the growth ladder (log powers < polynomial powers); one comparison to check, no derivation. |
| 20 | Hard → Easy | One-step arithmetic 2 × (9 − (−10)) = 38; same closed-tour bound as the Week 1 lesson and exercise 29. |
| 39 | Hard → Easy | Literally the new-Week-5 lesson example (10, 15, 3, 20 into 5 slots, h = k mod 5, linear probing). |
| 40 | Hard → Medium | Recall of four data-structure costs; the false option (hash table minimum) is a known property, no proof. |
| 59 | Hard → Medium | Short derivation: n³ − 1 has three base-n digits, so three counting passes. Not a proof. |
| 60 | Hard → Medium | Recall that random-pivot quicksort has expected, not worst-case, Θ(n log n). |
| 79 | Hard → Medium | Three-vertex Dijkstra trace showing the negative-edge failure; multi-step trace. |
| 80 | Hard → Medium | Recall of MST/shortest-path/BFS/bipartite facts; the triangle counterexample is in the notes. |
| 99 | Hard → Medium | Apply the derangement recurrence five times; derivation, no proof or design. |
| 100 | Hard → Easy | One-step recall of the TSP DP state (visited set + current city), stated in the notes. |
| 119 | Hard → Medium | Recall of the subset-sum → partition gadget (2W − t, W + t); the full proof is written exercise 199. |
| 120 | Hard → Medium | Recall of four standard results (vertex-cover 2-approximation, doubled MST, 3-colouring, UNSAT). |

## Written (`skiena_exercises.json`)

| id | old → new | reason |
|---|---|---|
| 30 | Hard → Medium | One two-job counterexample; no proof or design. |
| 62 | Hard → Medium | Linear-probing insertion trace plus the tombstone fix from the notes; multi-step trace. |
| 92 | Hard → Medium | Explain in-place heapsort as taught; explanation, not proof or design. |
| 96 | Hard → Medium | Trace quicksort on equal keys and name three-way partitioning (given in the notes). |
| 166 | Hard → Medium | Explain the TSP state count (2ⁿ subsets × n cities); direct restatement of the lesson. |
| 167 | Hard → Medium | Construct one small set-cover counterexample; a derivation, not a proof. |
| 168 | Hard → Medium | The candidate rule and fewest-candidates ordering are stated verbatim in the notes. |
| 201 | Hard → Medium | Conceptual explanation of why forced two-colouring does not extend; no proof. |
| 204 | Hard → Medium | Recall of NP versus co-NP status for UNSAT; explanation only. |
| 205 | Hard → Medium | Apply a given reduction to a two-clause formula; multi-step trace with counting. |

## Kept Hard (35 written)

27, 28, 29, 31, 59, 60, 61, 63, 64, 89, 90, 91, 93, 94, 95, 97, 127, 128, 129, 130,
131, 132, 133, 134, 161, 162, 163, 164, 165, 169, 170, 199, 200, 202, 203 —
each asks for a proof (induction, exchange, lower bound, reduction) or a data-structure /
algorithm design. 134 (tree has n − 1 edges) and 161 (Fibonacci call count) are
short inductions but still proofs, so they stay Hard under the rubric.

## Follow-ups for other owners

- `tools/aligned/build.py` line `bank=bank.replace('· hard','· hard · optional challenge')`:
  remove it. Proposed label: `· hard` only. All written practice is ungraded, and
  "optional challenge" implied that hard items are outside scope, which is not true for the
  newly examinable theory.
- `tools/question_bank.py` `bank()` intro text "Hard questions also include a starting hint
  and smaller reasoning steps" is now slightly inaccurate: the scaffolds in
  `question_guidance.py` were kept for the 22 downgraded items (they still help). Suggested
  wording: "Some questions include a starting hint and smaller reasoning steps."
- `tools/verify_question_bank.py` lines 12–13 and 41 assert scaffold set == Hard set and
  count hints by Hard level; relax to "every Hard item has a scaffold" (`>=`) or update the
  expected counts. `question_guidance.py` was not trimmed on purpose.
