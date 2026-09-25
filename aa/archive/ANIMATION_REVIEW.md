# AA animation review — 21 September 2026

## Coverage and limits

All **81 weekly animation activities** were opened individually in the local browser at desktop size. The primary demonstration state was inspected visually; playback activities were advanced to their final frame. Quiz-first activities were inspected in their initial state and selected additional modes were exercised as recorded below. This is not an exhaustive test of every possible input or quiz answer.

Every activity was also opened at **390 × 844**. All 81 initialised successfully and none widened the document beyond the 390 px viewport. Phone screenshots were inspected for at least one activity per week, with additional sorting checks. Dense material remains scrollable inside its panel; Expand opens a larger view. Three separate growth widgets (weeks 1, 8, 14) were also inspected and exercised.

## Corrections

- Preserve diagram labels/indices beside their diagrams instead of moving them to an unrelated column.
- Stack phone panels, use the available screen width, and show supporting diagrams before code.
- Keep nested code traces at readable height; prevent transport controls from consuming the code area.
- Seek to an exact diagram state without an old CSS transition contradicting the counter or answer.
- Render shared plots at their displayed size and device pixel density; reserve legend space, keep axes inside the plot, and reduce phone tick density.
- Give FizzBuzz labels enough width to show the full word.
- Remove the exponential-count cap at n=400; represent larger counts with scientific notation.
- Replace “instant” with “<1 ms”; explain model assumptions and capped log bars.
- Require the exact halving prediction before calling it exact; mark rounded near-100% shares as approximate.

## Individual review log

All rows received the desktop visual check and phone-width check described above. Numerical notes refer to the observed fixture, not all possible inputs. Random fixtures can differ on a later visit.

| Week | Activity | Observation |
|---|---|---|
| 1 | `max-scan` | Maximum found by visiting every card; count and remembered maximum agree. |
| 1 | `guess-race` | Linear search 73 checks versus binary 6 for default secret 73. |
| 1 | `letter-sort` | Final ordering and comparison/swap counters inspected. |
| 1 | `hunt-assumption` | Found target in sorted pile; card indices now stay above the matching cards. |
| 1 | `doublings` | 1,000,000 takes 20 ceiling-halvings; exact prediction feedback and minimum marker corrected. |
| 1 | `literal-robot` | Ambiguous milk instruction stops for a question; corrected instruction reaches and stops at 60 °C. |
| 2 | `w2-receipt` | 4.1 × 3 prints 12.30; tax total 14.76; stored float distinguished from formatting. |
| 2 | `w2-swap` | Overwritten-value example ends with two right values, as the displayed code does. |
| 2 | `w2-predict` | All five outputs run: 2.5, 2, 2, 101010, 30. |
| 2 | `w2-split` | 137 divided among 4: 34 remainder 1 and 34.25. |
| 2 | `w2-badge` | Name lengths, space and uppercase indices inspected. |
| 2 | `w2-bug` | String-plus-integer TypeError shown against the offending line. |
| 3 | `w3-countdown` | Countdown range excludes zero; ten numbers plus final line. |
| 3 | `w3-evens` | 50 evens in 1…100 after 100 visits. |
| 3 | `w3-nested` | 300 × 300 gives 90,000 inner steps; compressed playback labelled. |
| 3 | `w3-halving` | Floor-halving 1,000 takes 9 reductions to one. |
| 3 | `w3-multiple` | First common multiple of 7 and 9 is 63. |
| 3 | `w3-fizzbuzz` | 20 outputs and 53 branch-condition checks; replay/pause/reset and expanded layout checked. |
| 4 | `w4-stats` | [12,7,30,4,18]: sum 71, mean 14.2, max 30, min 4. |
| 4 | `w4-misses` | 20 missing searches in 10,000 items = 200,000 comparisons. |
| 4 | `w4-dups` | Six distinct entries give 15 unordered pair checks. |
| 4 | `w4-evens` | Two even-number implementations agree on ten outputs. |
| 4 | `w4-find` | Dilek at zero-based position 3 takes four looks. |
| 4 | `w4-alias` | Aliasing diagram agrees with shared mutations to [2,4,6]. |
| 5 | `w5-contains` | Two calls return True/False after 2+3 looks. |
| 5 | `w5-worst` | Doubling sizes show approximately ×2; timings explicitly simulated. |
| 5 | `w5-dishonest` | Including list construction changes measured scope; comparison table inspected. |
| 5 | `w5-warmup` | Dropping cold first sample changes mean and leaves minimum unchanged. |
| 5 | `w5-timeit` | Batch timing spreads compared using labelled simulated microseconds. |
| 5 | `w5-noise` | Percent disturbance and spread contrasted for short and long runs. |
| 6 | `w6-ratio-id` | A linear, B constant, C quadratic, D logarithmic table visually inspected. |
| 6 | `w6-four-studies` | Default sum study has approximately ×2 ratios; recorded table and trace agree. |
| 6 | `w6-two-axes` | Linear/log-log chart states and axes inspected. |
| 6 | `w6-fit-slope` | Fitted linear slope approximately 1 and doubling ratio approximately 2. |
| 6 | `w6-nlogn-drift` | n log₂n ratios drift from 2.15 to 2.11, with model stated. |
| 6 | `w6-noise-floor` | Small-input noise contrasted with large-input approximately ×2 ratios. |
| 7 | `w7-count-verify` | 2n+1 versus 4n+1 explained by whether loop-variable assignments count. |
| 7 | `w7-dominant` | Term shares inspected; near-100% now explicitly approximate. |
| 7 | `w7-crossover` | 100n and n² cross at n=100; chart and counts agree. |
| 7 | `w7-two-counters` | At n=6: 6 comparisons, 12 loop assignments, 24 model operations. |
| 7 | `w7-triangle` | n=8 triangular loop visits 28 of 64 cells. |
| 7 | `w7-add-vs-mult` | 1,000 floor-halvings finish in 9 iterations while linear work remains. |
| 8 | `w8-classify` | len example reads stored size in one model step. |
| 8 | `w8-ratio-class` | Measured ratio column near 2 invites linear classification. |
| 8 | `w8-seconds` | Input ×4 predicts time ×16 versus ×4 under the named tight models. |
| 8 | `w8-receipt` | Two() trace on six distinct values makes 15 hidden membership comparisons. |
| 8 | `w8-cases` | Best-case first match takes one comparison; cases explicitly separated. |
| 9 | `w9-checkoff` | listen/silent uses 21 checks; search lengths permute 1…6. |
| 9 | `w9-brute` | Three repeated letters still generate 6 positional permutations and 18 joined characters. |
| 9 | `w9-crossover` | No observed crossover reported honestly within the tested model range. |
| 9 | `w9-counter` | 26-slot and Counter models distinguish updates from key comparisons. |
| 9 | `w9-digits` | Four-digit pair: 8 updates and 10 zero checks. |
| 9 | `w9-count-ratios` | Counts match n(n+1)/2 and 2n+26, independently regression-tested. |
| 10 | `w10-verify` | Middle lookup stays flat in the model; operation diagram inspected. |
| 10 | `w10-fixslow` | Slow unique-reversed output [1,8,3,5], 10 comparisons and 10 copies. |
| 10 | `w10-strings` | Repeated string-copy model distinguished from interpreter optimisation. |
| 10 | `w10-capacity` | 1,000 appends: 28 model resizes, capacity 1,100; amortised explanation inspected. |
| 10 | `w10-deque` | Queue model gives 65 list steps versus 10 deque steps. |
| 11 | `w11-plateau` | Log-log list slope approximately 1 and set slope approximately 0. |
| 11 | `w11-wordfreq` | Eleven words, frequency of the = 3, total 41 list comparisons. |
| 11 | `w11-common` | Nested and set intersection both produce {1,2,7}. |
| 11 | `w11-wrongset` | Six scenario prompts and conversion controls inspected (not every quiz response). |
| 11 | `w11-buckets` | Code mode places [16,24,40] in bucket 0, 9 in 1 and 5 in 5; expanded view checked. |
| 11 | `w11-dice` | One million simulated rolls; histogram and Counter/set distinction inspected. |
| 12 | `w12-halvings` | Missing value above 1,000 items takes ten probes. |
| 12 | `w12-unsorted` | Unsorted example falsely misses 23 at index 7, intentionally illustrating the precondition. |
| 12 | `w12-crossover` | Build-once costs and repeated-search crossover explicitly modelled. |
| 12 | `w12-range` | Inclusive [250,600] count is 17−7=10; two bisections inspect ten values. |
| 12 | `w12-paper-trace` | Target 33 found at index 6 in three probes. |
| 12 | `w12-six-tests` | All 30 combinations (five versions × six boundary cases) run; correct version passes six. |
| 13 | `w13-bubble-paper` | [5,1,4,2,8] sorts to [1,2,4,5,8] with 9 comparisons/4 swaps; visual seek mismatch fixed. |
| 13 | `w13-doubling` | Selection comparison ratios approach 4; exact n(n−1)/2 counts checked. |
| 13 | `w13-cases` | Sorted 20-item bubble example: 19 comparisons, zero swaps. |
| 13 | `w13-loglog` | Four sorting growth curves and model-budget caveat inspected. |
| 13 | `w13-insertion` | Sorted eight-item insertion example: seven comparisons, zero shifts. |
| 13 | `w13-stability` | Equal-grade students retain input order under stable key sort. |
| 14 | `w14-diagnose` | All four diagnosis markers revealed successfully; code and prompts inspected. |
| 14 | `w14-two-sum` | Default target 13 found after 15 unordered pair checks. |
| 14 | `w14-review` | Draft benchmark intentionally mixes input-generation cost and bounded vocabulary. |
| 14 | `w14-traps` | Worst-case repeated membership: n² versus 2n model operations. |
| 14 | `w14-profile` | Profile distinguishes function cumulative time from hidden list-membership cost. |

## Additional checks

- Growth widgets: week 1 largest input displays approximately 9.90 × 10^301029 steps; week 8 displays the one-million-input time model; week 14 smallest input correctly reports sub-millisecond model times.
- Shared controls: replay, pause, reset, keyboard Home/End seeking, Expand/Close exercised; FizzBuzz and hash-table nested layouts rechecked after corrections.
- Mathematical regression suite: 76,319 existing assertions plus 8 growth-widget assertions pass (sorting, binary-search bounds and frames, anagram counts, float formatting, budget inversion and growth labels).
- Course checks: 205 exercise placements preserved; 57 executable guide examples and 659 local links pass.
- Browser console sampled during the review: no errors observed in those samples. This is not an assertion of exhaustive browser/platform coverage.

Simulated timing/profile data remain explicitly labelled. The review does not convert those models into measured Python performance or guarantee every input/platform combination.

---

## Previous review (historical record)

### AA animation review — 20 September 2026

### Scope and screen fit

Reviewed all 81 activities across weeks 1–14. Default rendered results were inspected at 1366×768. A second browser sweep exercised 333 default/available segmented-control states at 1280×720; all expanded workspaces fit within the viewport. The final inline sweep covered all 81 activities at 1366×768. One chart-specific scroll failure was corrected and rechecked at both laptop sizes.

The main diagram or code trace retains the full stage height. Supporting content occupies a second pane. Playback controls stay in the workspace; long code, explanations, tables and output can scroll inside their panes. Original activity nodes and handlers are preserved. Expand moves the same activity into a native dialog; Escape restores it without resetting the step. No lessons, options or explanations were deleted to achieve fit.

A keyboard-accessible timeline now supports revisiting and inspecting steps. Closing an activity pauses shared playback. Inline activities use more horizontal space on laptops. Smooth page scrolling is disabled while an animation is open, preventing it from fighting playback positioning.

### Corrections

- Week 1: distinguish ceil-rounded halvings to one candidate from exact binary-search probe counts.
- Week 2: account for uppercase expansion in the badge example (ß → SS); count uppercase code points correctly in the final diagram. Preserve negative zero when formatting decimals.
- Week 5: show the actual final `previous = t` assignment rather than leaving the previous iteration’s time in the variable panel.
- Week 8: timing ratios suggest a growth class; they do not prove it. Label the sorting diagram as a conceptual merge model rather than Python’s exact sorting trace.
- Week 9: adding a character multiplies n! candidates by n+1, but n·n! joined characters by (n+1)²/n. Label Counter distinct-key checks as a conceptual model rather than an exact CPython internal-operation count.
- Week 10: describe observed ratios as consistent with the expected class rather than a measured proof of complexity.
- Week 12: distinguish evaluation of the left and right bisect operands; label illustrative set iteration order.
- Week 13: invert the stated n·log₂n model for sorted() time-budget estimates instead of extrapolating a fixed local power-law slope. Explain the other budget estimates as extrapolations and remove an unsupported universal memory claim. Clarify why insertion sort does less work on the sampled random inputs.

### Validation and limits

- `node aa/tools/verify_animation_math.cjs`: 76,319 assertions. Executes production helpers for sorting, searching, anagram counting, decimal formatting and the sorting-budget estimate.
- Exhaustive ternary arrays of lengths 0–7 check sorted output, swaps/shifts against inversion counts, and selection comparisons against n(n−1)/2.
- Binary search checks empty through 80-element arrays, every present target, and missing targets on both sides; frame results, valid midpoint indices and logarithmic probe bounds agree.
- Genuine anagrams of lengths 0–100 check n(n+1)/2 and 2n+26, plus length mismatch and failed-match examples.
- Browser spot checks verify Unicode badge output, final timing variables, reverse/reset, keyboard timeline navigation, nested activity modes, and Expand/Escape state preservation.
- All 15 animation scripts pass syntax checks. The local link audit checked 2,823 local references with zero failures.

Coverage is not an exhaustive proof of every free-form input or every manual-game path. Timing models remain explicitly illustrative; actual performance must be measured in Colab. Large logs and long explanations remain accessible by internal scrolling, rather than being reduced to unreadable text.

### Inventory

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

### Primary references

- [Python sorting documentation](https://docs.python.org/3/howto/sorting.html): stability and exploitation of existing order.
- [CPython 3.13 Counter implementation](https://github.com/python/cpython/blob/3.13/Lib/collections/__init__.py): conceptual distinct-key comparisons must not be presented as exact implementation counts.
- [CPython 3.13 list implementation](https://github.com/python/cpython/blob/3.13/Objects/listobject.c): list growth remains an implementation model, not a language guarantee.

All changes are local; this review did not publish or commit them.
