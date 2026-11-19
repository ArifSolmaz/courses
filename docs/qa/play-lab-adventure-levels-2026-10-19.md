# Adventure level visual audit — 2026-10-19

## Scope and evidence

Live baseline: `https://arifsolmaz.github.io/courses/aa/play-lab/adventures/` at commit `17745fc`.

All 16 levels across Beat the Robot, Command Centre, Depot Detective and Sorting Arena were played through UI controls. Each level was run with a successful and an unsuccessful plan at 1366×768 and 390×844: **64 completed live runs**. Result screenshots were visually reviewed for every level and viewport; playback captures were reviewed separately. The old 350 ms depot/sorting transition frequently finished before capture, which helped identify the missing useful playback.

Mobile checks used browser viewport emulation, not physical phones. New-case levels used case 1; this is not a claim to cover every generated case or browser. Factory and Strategy Quests are outside this follow-up's scope.

| Game | Levels individually checked | Laptop success/failure | Mobile success/failure |
|---|---|---|---|
| Beat the Robot | 1, 2, 3, 4 | 8 runs | 8 runs |
| Command Centre | 1, 2, 3, 4 | 8 runs | 8 runs |
| Depot Detective | 1, 2, 3, 4 | 8 runs | 8 runs |
| Sorting Arena | 1, 2, 3, 4 | 8 runs | 8 runs |

All expected live outcomes matched. No horizontal body overflow in these runs. Previously fixed small-bar faces and square command grids remained intact.

## Findings and local fixes

- Command playback did not identify the executing stored command. Highlight its correct queue/stack position; preserve the blocked command and robot-cell highlight on a collision. Include the failed attempt in playback rather than skipping straight to the failure report.
- Depot displayed the completed index almost instantly without showing searches. Show each search path and found/stopped status; highlight its shelves or tree nodes. These are per-search summaries, not individual probe animations.
- Tree labels were too small on mobile, with excess empty space. Fit the SVG to its actual tree size and enlarge labels.
- Sorting jumped immediately to the result. Show labeled starting order, sorted lane summaries, then merged result. These are phase summaries, not per-comparison sorting animations.
- Keep sorting phase height fixed. Allocate lane width by part count; keep wrapped lane headings the same height and retain dark numbers/faces for contrast. Checked an extra 1+7 split at 320 px and 390 px.
- Do not show the next-level button before playback finishes.

## Verification after edits

All 12 changed command/depot/sorting levels rerun locally with both outcome types at both primary widths. Additional targeted checks after final CSS refinements covered split sorting on mobile, the 320 px narrow split, and a laptop collision. Final screenshots inspected. Robot's model and layout were unchanged; its playback delay alone was increased.

`node --check aa/play-lab/adventures/adventure.js` passed.
`node --test aa/play-lab/adventures/model.test.cjs services/factory-board/play-scoring.test.cjs` passed (model cases and scoring replay checks).
`git diff --check` passed.

Raw baseline evidence: `/tmp/aa-adventure-live-audit/` (64 results + playback screenshots and JSON).
Local follow-up evidence: `/tmp/aa-adventure-audit/`.

## Publication follow-up

Published with teacher-note updates in `39577fd` on 19 October 2026. GitHub Pages run `39301395474` completed successfully. Browser confirmed `adventure.js?v=20261019playback3` on the live page.

Post-deploy UI checks: Command level 1 collision (laptop), Command level 2 success (mobile), Depot level 2 failed search (mobile), Depot level 3 successful balanced tree (laptop), Sorting level 3 success and lane phase (mobile), Robot level 4 success (laptop), Sorting level 4 over-budget failure (laptop). All seven outcomes matched, no horizontal overflow, no captured browser errors. Reviewed the published screenshots. Play Lab's Adventure link reached the live page. Repeat completion returned “Already counted. Keep exploring!”.

These seven post-deploy spot checks supplement the 64-run baseline and local retests above; they are not another full 64-run audit.
