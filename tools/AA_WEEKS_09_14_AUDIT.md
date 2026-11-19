# AA Weeks 9–14 audit — 17 October 2026

Scope: the local English example lessons and their preserved `lecture-notes.html` pages. Changes are local; this audit did not publish them.

## Verification

- Reviewed new example explanations, comparison cases, questions, answers and walkthroughs, plus preserved lecture content. Checked reference anchors and coverage of archived topics.
- 132 lesson screens (22 per week), with 180-minute schedules.
- 831 default animation frames checked through browser controls at 1280×720 and 390×844. Desktop animation panels fit within 640px height. Layout geometry checks covered every frame; screenshots were inspected at representative states, not individually for every frame.
- Week 9 mobile DFS tables initially overflowed. Fixed wrapping/table sizing and shortened the displayed state to `done`, with a visible definition. All 40 frames of the two affected examples passed the final mobile recheck.
- Archived lessons: exercised 302 select-option presets across six pages; no browser errors. Fixed Week 10 adjacency-matrix horizontal overflow and verified the repaired laptop layout.
- All six algorithm regression suites pass. All reference anchors resolve and all archived topic IDs have example references.
- Executed 23 archived Python blocks, with targeted assertions for corrected functions and numerical claims. Function-definition execution alone does not cover every possible function input.
- All 40 inline JavaScript blocks pass syntax checking. `git diff --check` passes.

## Algorithm checks

| Week | Frames | Independent checks |
|---|---:|---|
| 9 | 196 | All 4,096 simple directed four-vertex graphs: DFS cycles, timestamps, edge classes, topological order, SCCs |
| 10 | 87 | 4,096 weighted graphs against exhaustive minimum-forest enumeration; Prim from every source on connected cases |
| 11 | 167 | 4,096 directed topologies from every source, signed Bellman–Ford and nonnegative Dijkstra/Floyd; 4,096 DAGs; robot routing |
| 12 | 195 | 4,096 obstacle layouts, 7,290 task/target cases, queens n=1–5, Sudoku, Fibonacci, combinations, exact-edge walks |
| 13 | 127 | 961 word pairs, edit alignment/LCS, 243 sequence cases, exhaustive partition splits, knapsack and worked examples |
| 14 | 59 | 16 clause-gadget assignments, SAT table, 64 four-vertex graphs, cover/complement/approximation, 256 scheduling inputs |

## Corrections

- Week 9: undirected DFS edge types; articulation points on disconnected graphs; SCC pass counts; prerequisite-cycle versus general deadlock claims; ambiguous cycle-detection quiz; mobile records table.
- Week 10: sensor count; undirected connected-component assumption; tied second-best trees; disconnected-input guard in Prim; chain length wording; union-find initialization cost; laptop matrix sizing.
- Week 11: Dijkstra proof intuition; Bellman–Ford per-pass guarantee; DAG route costs versus task scheduling; DAG cycle rejection; negative-cycle assumptions; terrain-cost comparison and energy analogy.
- Week 12: compare partial robot checks with partial checks, separately from complete configurations; corrected live calculator denominator; backtracking versus permanent DFS visited state; pruning can still reach dead ends; exact-edge DP includes table initialization cost.
- Week 13: Fibonacci cache handling; edit-table dimensions; binary bit count and pseudo-polynomial explanation; DTW interpretation and unequal-length feedback; memory-budget qualification; directed TSP recurrence edge orientation.
- Week 14: TSP decision exercise uses a total-tour bound; Euler condition includes connectivity of non-isolated vertices.

## Reproduce

From the repository root:

```sh
for w in 9 10 11 12 13 14; do node tools/aa_checks/check-w${w}.cjs; done
python3 tools/aa_checks/check_archived_python.py
git diff --check
```

## Limits

This is a substantial finite audit, not a formal proof of every claim or every user input. The archived widgets received preset smoke tests, not exhaustive traversal of every legacy animation or input combination. Separate `ek-notlar` pages, other weeks, notebooks, external links and the deployed GitHub Pages version were not fully re-audited in this pass. Browser layout checks used two viewport sizes; they do not establish identical behavior on every device/browser.
