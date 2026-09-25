# Weeks 2–14: compact lesson review

Reviewed 21 September 2026. Continues the Week 1 pilot.

## Main route

- Four authored visual sections per week: short code, traces, equations and comparison tables.
- Three core tasks per week: trace, calculate, change one thing; answers are folded.
- Original numbered chapters remain in optional technical reference so existing animation references remain meaningful.
- Original animations and worked tasks remain available under Investigate.
- Source textbook notes, all 205 numbered exercises and solutions, quizzes, bilingual guides and assessment requirements retained.
- Shared rendering lives in `visual_lessons.py`; original chapter files remain the reference source.

## Verification

- Executed every Python code block in the 13 new lessons, in lesson order with supplied input values.
- 10,472 oracle checks for linear/binary search, two-sum and anagrams, including empty inputs, absent targets, duplicate values and negative values.
- Existing animation-math verifier passed 76,319 assertions plus growth-widget checks.
- Textbook verifier passed: 205 exercises placed exactly once, answer text, links, unique IDs and reproducible generation.
- Guide verifier passed: 57 Python examples and 659 local links.
- Every week inspected in the browser at desktop width and at 390 × 844, with a representative main diagram inspected visually in each view.
- Browser route check on all 13 weeks: Understand → Investigate → Check; quiz feedback visible; all 75 animation panels opened and contained rendered controls.
- No page overflow at 390 pixels; none of the new compact tables overflowed their container.

## Corrections from visual review

- Removed inherited 460-pixel minimum width from new lesson tables.
- Shortened the timing-table heading so all five runs fit on phones.
- Fixed-width grid cells align list indices with values, including eight-item search traces on phones.
- Triangular-loop rows preserve triangular geometry rather than stretching across equal widths.
- Capacity-growth copy counts align with the new capacity that triggers them.
- Flow arrows become vertical on phones; formulas wrap inside their panels.

The previous detailed animation audit remains in `ANIMATION_REVIEW.md`. Animation algorithms were not changed in this lesson rewrite; this pass checked their availability after restructuring.
