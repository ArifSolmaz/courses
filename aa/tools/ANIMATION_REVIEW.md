# AA animation review — 20 September 2026

## Scope and screen fit

Reviewed all 81 activities across weeks 1–14. Default rendered results were inspected at 1366×768. A second browser sweep exercised 333 default/available segmented-control states at 1280×720; all expanded workspaces fit within the viewport. The final inline sweep covered all 81 activities at 1366×768. One chart-specific scroll failure was corrected and rechecked at both laptop sizes.

The main diagram or code trace retains the full stage height. Supporting content occupies a second pane. Playback controls stay in the workspace; long code, explanations, tables and output can scroll inside their panes. Original activity nodes and handlers are preserved. Expand moves the same activity into a native dialog; Escape restores it without resetting the step. No lessons, options or explanations were deleted to achieve fit.

A keyboard-accessible timeline now supports revisiting and inspecting steps. Closing an activity pauses shared playback. Inline activities use more horizontal space on laptops. Smooth page scrolling is disabled while an animation is open, preventing it from fighting playback positioning.

## Corrections

- Week 1: distinguish ceil-rounded halvings to one candidate from exact binary-search probe counts.
- Week 2: account for uppercase expansion in the badge example (ß → SS); count uppercase code points correctly in the final diagram. Preserve negative zero when formatting decimals.
- Week 5: show the actual final `previous = t` assignment rather than leaving the previous iteration’s time in the variable panel.
- Week 8: timing ratios suggest a growth class; they do not prove it. Label the sorting diagram as a conceptual merge model rather than Python’s exact sorting trace.
- Week 9: adding a character multiplies n! candidates by n+1, but n·n! joined characters by (n+1)²/n. Label Counter distinct-key checks as a conceptual model rather than an exact CPython internal-operation count.
- Week 10: describe observed ratios as consistent with the expected class rather than a measured proof of complexity.
- Week 12: distinguish evaluation of the left and right bisect operands; label illustrative set iteration order.
- Week 13: invert the stated n·log₂n model for sorted() time-budget estimates instead of extrapolating a fixed local power-law slope. Explain the other budget estimates as extrapolations and remove an unsupported universal memory claim. Clarify why insertion sort does less work on the sampled random inputs.

## Validation and limits

- `node aa/tools/verify_animation_math.cjs`: 76,319 assertions. Executes production helpers for sorting, searching, anagram counting, decimal formatting and the sorting-budget estimate.
- Exhaustive ternary arrays of lengths 0–7 check sorted output, swaps/shifts against inversion counts, and selection comparisons against n(n−1)/2.
- Binary search checks empty through 80-element arrays, every present target, and missing targets on both sides; frame results, valid midpoint indices and logarithmic probe bounds agree.
- Genuine anagrams of lengths 0–100 check n(n+1)/2 and 2n+26, plus length mismatch and failed-match examples.
- Browser spot checks verify Unicode badge output, final timing variables, reverse/reset, keyboard timeline navigation, nested activity modes, and Expand/Escape state preservation.
- All 15 animation scripts pass syntax checks. The local link audit checked 2,823 local references with zero failures.

Coverage is not an exhaustive proof of every free-form input or every manual-game path. Timing models remain explicitly illustrative; actual performance must be measured in Colab. Large logs and long explanations remain accessible by internal scrolling, rather than being reduced to unreadable text.

## Inventory

| Week | Activities reviewed |
|---|---|
| 1 | `max-scan`, `guess-race`, `letter-sort`, `hunt-assumption`, `doublings`, `literal-robot` |
| 2 | `w2-receipt`, `w2-swap`, `w2-predict`, `w2-split`, `w2-badge`, `w2-bug` |
| 3 | `w3-countdown`, `w3-evens`, `w3-nested`, `w3-halving`, `w3-multiple`, `w3-fizzbuzz` |
| 4 | `w4-stats`, `w4-misses`, `w4-dups`, `w4-evens`, `w4-find`, `w4-alias` |
| 5 | `w5-contains`, `w5-worst`, `w5-dishonest`, `w5-warmup`, `w5-timeit`, `w5-noise` |
| 6 | `w6-ratio-id`, `w6-four-studies`, `w6-two-axes`, `w6-fit-slope`, `w6-nlogn-drift`, `w6-noise-floor` |
| 7 | `w7-count-verify`, `w7-dominant`, `w7-crossover`, `w7-two-counters`, `w7-triangle`, `w7-add-vs-mult` |
| 8 | `w8-classify`, `w8-ratio-class`, `w8-seconds`, `w8-receipt`, `w8-cases` |
| 9 | `w9-checkoff`, `w9-brute`, `w9-crossover`, `w9-counter`, `w9-digits`, `w9-count-ratios` |
| 10 | `w10-verify`, `w10-fixslow`, `w10-strings`, `w10-capacity`, `w10-deque` |
| 11 | `w11-plateau`, `w11-wordfreq`, `w11-common`, `w11-wrongset`, `w11-buckets`, `w11-dice` |
| 12 | `w12-halvings`, `w12-unsorted`, `w12-crossover`, `w12-range`, `w12-paper-trace`, `w12-six-tests` |
| 13 | `w13-bubble-paper`, `w13-doubling`, `w13-cases`, `w13-loglog`, `w13-insertion`, `w13-stability` |
| 14 | `w14-diagnose`, `w14-two-sum`, `w14-review`, `w14-traps`, `w14-profile` |

## Primary references

- [Python sorting documentation](https://docs.python.org/3/howto/sorting.html): stability and exploitation of existing order.
- [CPython 3.13 Counter implementation](https://github.com/python/cpython/blob/3.13/Lib/collections/__init__.py): conceptual distinct-key comparisons must not be presented as exact implementation counts.
- [CPython 3.13 list implementation](https://github.com/python/cpython/blob/3.13/Objects/listobject.c): list growth remains an implementation model, not a language guarantee.

All changes are local; this review did not publish or commit them.
