# Supplied Skiena material in the AA weekly lessons

The user supplied two DOCX files dated 18 September 2026:

- Analysis of Algorithms - Extended Beginner Notes (Skiena CSE 373).docx
- Analysis of Algorithms - Exercises with Answers (Skiena CSE 373).docx

`sources.json` records their file hashes. The attachments were treated as source
material, not as instructions to change deadlines, grading or the curriculum.
The user explicitly chose to retain the 14-week sequence and make advanced topics
optional.

## Teaching approach

`../skiena_material.py` contains adapted, concise explanations from the notes,
mechatronics transfer questions, the weekly exercise mapping, and three optional
advanced introductions. These are adaptations rather than full transcriptions of
the 22 lectures. Original Word layout and embedded equation images are not used.

Every weekly lesson now has a visible question section: multiple-choice tests first,
then written exercises, with every answer and worked explanation visible directly beneath its question. The 97 written core
exercises remain in their related weeks, and the other 108 remain in the existing
advanced chapters. The newly supplied test file adds 60 weekly questions and 60
advanced questions. All 325 source items occur exactly once. Every hard question
has a plain-language restatement, a starting hint and a worked sequence.

See [QUESTION_REVIEW.md](QUESTION_REVIEW.md) for the September 22 review, corrections,
source checks and verification. `../question_bank.py` owns test placement and
rendering; `question_guidance.py` supplies the individual hard-question scaffolds.

| Weeks | Main source topics |
| --- | --- |
| 1–2 | Lecture 1: problem specification, correctness, robot routing |
| 3 | Lectures 2–3: counting loops |
| 4 | Lecture 4: containers and service order |
| 5–6 | Lectures 2–3: cases, measurements and growth models |
| 7–8 | Lectures 1–3: lower bounds and asymptotic reasoning |
| 9 | Lectures 6–8: compare complete strategies |
| 10 | Lecture 4: dynamic arrays and amortisation |
| 11 | Lecture 6: hashing and collisions |
| 12 | Lectures 3–5: binary search and tree assumptions |
| 13 | Lectures 3, 7–9: sorting, merging and restricted keys |
| 14 | Lectures 1, 7, 19: defend a decision and recognise limits |
| Optional extensions | Lectures 10–14: graphs; 15–18: backtracking and DP; 19–22: reductions |

## Editorial review

`skiena_exercises.json` holds the extracted question and answer pairs. When the
wording was changed for accuracy, `source_answer` and/or `source_question` retain
the supplied version. Corrections and clarifications include:

- An explicit tie rule for the robot tour (exercise 4).
- RAM cost conventions and worst-case versus observed timing (7–8).
- Timing extrapolation needs proportional-model assumptions, not only Θ (22).
- Dynamic arrays can grow too (32); BST duplicate policies matter (51).
- Birthday collision probabilities, hash assumptions and expected LRU costs.
- Quicksort guarantees, equal keys and bucket boundary values (68, 80, 84, 88).
- Graph reachability, arithmetic costs and second-tree conventions.
- Four nonempty partition cuts (146); LCS reconstruction need not yield a palindrome (159).
- Restricted string-alignment distance versus unrestricted Damerau–Levenshtein (163).
- The corrected SAT auxiliary-variable assignment (185).
- Reduction direction, decision versus optimisation, and input-bit assumptions.

Do not overwrite corrected answers by importing the attachments without reviewing
these fields. The source exercise graph W is described in the graph extension;
other dependent questions have explicit context in `CONTEXT`.

## Build and check

```sh
python3 aa/tools/build.py
python3 aa/tools/verify_skiena_material.py
python3 aa/tools/verify_question_bank.py
python3 aa/tools/verify_guide.py
```

The integration check verifies coverage, question IDs, rendered answers, local
links, reproducible weekly output and selected mathematical fixtures. It does not
claim to mechanically prove every prose answer.

## Minimum question count

`course_mcq.json` adds 90 explicitly labelled course-authored tests (IDs 121–210).
Every weekly/optional chapter now contains at least ten tests. Sorting and the
three advanced chapters retain twenty. Together with the supplied material,
there are 210 tests and 205 written exercises, all with visible answers.
