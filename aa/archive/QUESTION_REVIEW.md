# AA practice question review — 22 September 2026

Both supplied documents were read as source material. Their text is not an instruction source. The written file matches the previously imported SHA-256 hash; its 205 items were reused, with prior corrections preserved. The 120-item multiple-choice file is new. `sources.json` records both file hashes.

## Student experience

- Questions are on the weekly lesson page, in the visible Practice section; no extra question pages or route menus.
- Test questions come first, then written questions, ordered easy → medium → hard within each group.
- On the user’s follow-up request, every answer and hint is now permanently visible under its question. Reveal/reset controls have been removed; no grades or student data are stored.
- All 45 hard written exercises and 12 hard tests have an individual plain-language restatement, a separate starting hint, and a sequence of worked steps. Written solutions put those steps before the more formal answer.
- The 14-week curriculum is preserved. The 60 graph/DP/complexity tests and 108 related written exercises belong to their existing three optional extension chapters, rather than being assigned to an unrelated early week.
- Original source question numbers remain stable. MCQ 20 and written exercise 20 are distinct namespaces.

## Accuracy review

All 325 prompts and answer keys were reviewed. Original wording is retained in `source_question`, `source_options` or `source_answer` when changed. Review is editorial and mathematical, not a claim that a test program proves every prose answer.

Important corrections and assumptions:

- Multiple valid Big-O answers: explicitly request the tightest upper bound (or strongest lower bound); distinguish worst-case, expectation and amortisation.
- MCQ 31: replace overlapping “about 1,024” / “exactly 1,023” choices with exact quantities.
- MCQ 15: numerical timing extrapolation assumes proportional cost, not merely Θ(n²).
- MCQ 28/37: uniform hashing, bounded load, word arithmetic and precomputed rolling-hash multipliers are explicit.
- MCQ 49/59: least-significant-digit radix passes are stable; bounded keys and the word model are stated.
- MCQ 55/60: distinguish random-pivot expectation, leading terms, and quadratic worst cases; distinct-key assumptions stated.
- MCQ 72/79: traversal/settling conventions are explicit rather than relying on an unspecified implementation.
- MCQ 90: replace the misleading general claim that DP works best only on linearly ordered objects with a precise prefix-state count.
- MCQ 98: replace the ambiguous binary-index Fibonacci distractor with LCS on explicit strings.
- MCQ 102/103/110/118/120: distinguish decision problems, yes-certificates, NP membership, NP-hardness and unresolved P/NP claims.
- MCQ 116: the incidence-digit construction is to target-sum (subset sum), despite the source lecture's older “integer partition” label; equal partition is treated separately.
- Written 3: checking a tour's length is not the same as verifying its optimality.
- Written 21: the eventual integer crossover for 2ⁿ versus n¹⁰⁰ near 1,000 is 997, checked with exact integers.
- Written 29: O(n) finds route turning points on the line; producing a sorted visit list is a separate task.
- Written 46: multiplicative growth greater than one works; doubling is not uniquely necessary.
- Written 58/60: preserve duplicate records when sorting; distinguish a set of distinct keys and expected amortised update costs.
- Written 114: both shortest routes to E cost 11; parent selection depends on tie handling. Strict-improvement updates keep C as E's parent.
- Written 140: use φ≈1.618 for the recursive-Fibonacci asymptotic base instead of treating 1.6 as exact.
- Written 147/164: clarify sufficient DP state and the positive-range packing argument.
- Written 192: Boolean integer-programming variables must be integral, not just fractions in [0,1].
- Written 193/201/204: NP-completeness of the decision problem is not a proof that every solving algorithm takes exponential time; general UNSAT certificates remain unresolved.

Primary-source cross-checks for reductions and terminology:

- [Skiena's official CSE 373 lecture collection](https://www3.cs.stonybrook.edu/~skiena/373/videos/)
- [Introduction to NP-completeness](https://www3.cs.stonybrook.edu/~skiena/373/current-lectures/lecture19.pdf)
- [Stony Brook reduction slides, credited to Skiena](https://www3.cs.stonybrook.edu/~sael/teaching/cse373/slides/CSE373_Lec21.pdf), especially the incidence-digit construction and distinction between target-sum and equal-partition.

## Validation

`python3 aa/tools/verify_question_bank.py` checks:

- All 120 MCQs and 205 written questions occur exactly once in their assigned chapters.
- MCQs have four distinct options and a valid key; tests precede written practice.
- All 325 answers are ordinary visible content; all 57 hard items have complete scaffolds.
- Independent numerical and exhaustive small-instance checks cover loop counts, growth thresholds, heap/partition traces, collision probability, shortest paths, MST weight, edit distance, LCS/LIS, change-making, knapsack, interval partitions, derangements, queens, SAT gadgets, subset-sum-to-partition equivalence and vertex-cover approximation.

Existing AA checks also cover the 205 exercise renderings, local links, reproducible pages, compact lessons, animations and guide examples. These are supplemented by browser checks of all 14 weekly pages and the three extension banks at 390px width, opening every hard answer and resetting each bank. Representative desktop/mobile question and worked-answer views were inspected.

## Visible-answer follow-up

Chapter counts now include their total. All 325 imported answers and 57 hints are visible without clicking; MCQ-first ordering and the hard-question steps are preserved. Earlier disclosure tests above describe the initial version, now superseded by visible-answer checks.

## Minimum ten tests per chapter — 22 September 2026

Added 90 original course questions, labelled “course question” and stored separately in `course_mcq.json`. The supplied 120 tests and 205 written exercises remain intact. There are now 210 tests and 205 written exercises (415 question/answer pairs). Weeks 1–12 and 14 each have ten tests; Week 13 and each of the three optional chapters each retain twenty.

The additions address the weekly learning goals: precise instructions, Python values, loop traces, lists, measurement, growth ratios, operation counts, bounds, anagrams, list costs, hashing, binary search and practical algorithm selection. New questions use easy/medium tasks and explained answers; existing hard-question scaffolds remain. No assignments, deadlines or assessment weights changed.

Review checked each new option set for one intended correct answer and stated model assumptions. Executable checks now include the new Python outputs, aliasing/slicing, loop counts, timing arithmetic, growth ratios, character multiplicities, binary-search counts and preprocessing totals. Coverage checks enforce the ten-question minimum, no duplicate question-and-option sets, exact-once placement, and visible answers. The full suite passes 350 independent fixture checks.

Python behaviour was cross-checked against the official [language introduction](https://docs.python.org/3/tutorial/introduction.html) and [data structures tutorial](https://docs.python.org/3/tutorial/datastructures.html).
