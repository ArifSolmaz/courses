# AA Weeks 1–8 audit — 17 October 2026

Local changes only; not committed or pushed. Complements `AA_WEEKS_09_14_AUDIT.md`.

## Scope and confidence

Reviewed the main Week 1–3 lesson text and all 143 example cards in the current Week 4–8 lessons (37 + 28 + 28 + 28 + 22), including answers and explanations. Checked the preserved Week 4–8 lecture notes for algorithm definitions, complexity assumptions, worked calculations and executable Python examples. The preserved notes received a targeted technical review, not an independent proof of every sentence. Supplementary `ek-notlar` and `tekrar` pages were included in local-link validation, but their complete content and every interaction were not audited.

The tests below provide concrete evidence, not a guarantee that every possible edited input or browser configuration is correct. Original Week 1–3 interactions and archived lecture widgets received preset smoke checks, not exhaustive state-by-state interaction tests. A more extensive Week 2 step sweep was interrupted by a browser automation timeout; its unsaved results are not counted.

## Corrections

- **Week 1:** corrected the nearest-neighbour statement: starting at the leftmost point is optimal on a line, but does not guarantee an optimal tour in the plane. Updated English and Turkish.
- **Week 2:** corrected the polynomial Big-O witness and nonnegativity threshold; explained that subtraction can cancel leading terms; removed unsupported claims about best/worst-case frequency and difficulty. Clarified function-call overhead versus the work in the body, uniform successful-search assumptions, and limits of the simplified deadline model.
- **Week 3:** corrected a loop updating the wrong variable; distinguished exact operation-count timing from a Θ class; corrected a pair-count ratio; qualified algorithm correctness and operation units; added an empty-input guard to the maximum example.
- **Week 4 preserved notes:** corrected known-node deletion costs for singly versus doubly linked lists; distinguished amortized append cost from a single expensive resize; clarified preallocation and ring-buffer memory accounting.
- **Week 6 preserved notes:** included the initial scan of all k lists in the k-way merge bound, including empty-list cases.
- **Week 7 preserved notes:** corrected the decision-tree halving argument; specified the independence/distribution assumptions behind expected linear bucket-sort work.
- **Week 8 preserved notes:** removed component sorting that contradicted the stated linear running time; guarded grid BFS against empty grids, blocked/out-of-bounds endpoints and ragged rows; corrected Manhattan terminology, Dijkstra's nonnegative-weight condition, heap peek versus removal, memory assumptions and incidence-matrix conversion with no edges.
- **Week 8 layout:** grid children previously forced the graph-editor columns to 760 px on a 390 px phone viewport. Added shrinkable grid tracks and children. Page width now equals 390 px; wide tables remain in their own scroll containers.
- **Links:** repaired Week 4 extra-note script path, Week 5/7 exercise references, and the extensions redirect to the preserved Week 8 lecture notes.

## Verification

Run from the repository root:

```sh
node tools/aa_checks/check-w1-2.cjs
python3 tools/aa_checks/check_early_python.py
node tools/aa_checks/check-w5.cjs
node tools/aa_checks/check-w6.cjs
node tools/aa_checks/check-w7.cjs
node tools/aa_checks/check-w8.cjs
```

Results:

- Six robot cases compared with exhaustive tours; earliest-finish interval scheduling checked on 1,024 interval subsets; growth/count functions checked for n=1..64.
- 29 definition-bearing Python blocks executed in lesson order. This preserves intentional earlier-cell dependencies. Sorting checked on 300 deterministic random arrays, including empty inputs, duplicates and negative numbers; graph colouring compared with brute force on all 64 simple undirected four-vertex graphs. Maximum and grid boundary regressions pass.
- Week 5: 101 default visual frames, 1,000 search/hash inputs; hashing, probing and birthday-probability results verified.
- Week 6: 145 default visual frames; heap build, insert, extraction and sorting checked on 564 arrays.
- Week 7: 113 default visual frames; 564 merge/partition inputs and 200 counting/radix inputs.
- Week 8: 121 default visual frames; 768 BFS source cases compared with all-pairs shortest paths, 64 graph colourings, route and source references verified.
- All original topic references covered by the Week 5–8 card tests.
- 46 inline scripts parsed successfully. `git diff --check` passes.
- 538 local references under Week 1–8 HTML files resolve after repairs. External URL availability was not rechecked. The wider repository link scan still reports unrelated legacy/archive failures and some embedded-code extraction false positives; this is not a claim that every course link is clean.

## Browser and visual coverage

- Current Week 4–8 default visual frames: **566 at each viewport**, 1,132 frame observations total, at **1280×720** and **390×844**. Week 4: 86; Week 5: 101; Week 6: 145; Week 7: 113; Week 8: 121.
- No horizontal page/stage overflow in these frames. Laptop animation panels remained within the 640 px height threshold. The lesson page still scrolls: students must scroll to the animation to see its full panel; the complete lesson is not compressed into one screen.
- Screenshots inspected for representative hashing, heap, sorting, and graph layouts. Frame geometry checks are not equivalent to manually inspecting every screenshot.
- Week 4 custom widgets: range endpoints for growth, halving, ceiling/floor and resizing; all five search placements; mixed/sorted/reverse insertion-sort counts; all three stack/queue removals; sensor wraparound to [20,30,40], sum 90, average 30. Results agree with the explanations.
- Original/preserved pages: 641 select-option changes across Weeks 1–8, without observed JavaScript errors or desktop page overflow. Counts by week: 77, 157, 155, 18, 44, 43, 62, 85. This checks preset loading, not every subsequent animation state.
- All eight original/preserved pages checked at phone width. Week 8 page overflow corrected and rechecked. Wider tables in Weeks 3–8 use horizontal scroll containers.

## Reference checks

Primary sources used when reviewing asymptotic and amortized distinctions:

- [Cornell: amortized analysis](https://www.cs.cornell.edu/courses/cs3110/2014sp/lectures/22/amortized-analysis.html)
- [Cornell: hashing](https://www.cs.cornell.edu/courses/cs312/2008sp/lectures/lec20.html)
- [Skiena CSE 373 lecture materials](https://www3.cs.stonybrook.edu/~skiena/373/current-lectures/)

No deployment or publication check was performed: fixes remain local.
