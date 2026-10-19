# AA Play Lab

Local/static page: `/aa/play-lab/`. No build step or external dependencies.

Three games each have guided practice, a mission and a sandbox. All explanation text is visible. Only three completion flags are stored in browser localStorage (`aa-play-lab-v1`); storage failure does not stop play. No uploads, timers or assessment scores.

## Model boundaries

- Rail tour: three distinct stations and one start, integer positions 0–10. Visit each station once and return to start. Passing a station is not a service stop. Nearest-next ties use alphabetical order. Optimal distance is calculated by all six visit orders, appropriate only to this tiny game. A 16-versus-14 example disproves universal optimality; it is not an asymptotic improvement claim.
- Command centre: jobs use FIFO or LIFO. Undo reverses one unit move. Correct undo restores the most recent remaining action, not merely the final position. Sandbox contains at most eight moves on a 5×5 board; attempts to leave it change nothing.
- Depot: seven-slot linear probing, nonnegative integer keys 0–999. Searches skip tombstones, terminate at empty slots or after seven probes. Insertions check duplicates before reusing tombstones. The deletion mission deliberately offers an incorrect empty-slot deletion to demonstrate its consequence.
- BST sandbox: ordinary unbalanced BST, unique keys, at most seven nodes. Both presets contain identical keys but use different insertion orders. No claim that every tree is logarithmic. No BST deletion feature.

## Checks

Run `node aa/play-lab/core.test.cjs` for exhaustive rail maps and hash/BST/move checks. UI review includes successful missions, failed empty deletion, queue/stack, custom inputs, and laptop/narrow-screen layout. Browser mission marks used in QA should be cleared before handing over the preview.
