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

## Play-first interface

Robot routes, job cards and depot shelves now occupy the main stage. The robot shows a route trail and direct distance feedback. Command Centre asks players to select the actual next job; a wrong end does not run anything. Depot lets players tap search shelves in probe order. Detailed move explanations and concepts remain in the optional Why disclosure. Progress still uses the existing three mission marks.

Sorting Arena now accepts clicks on the compared pieces and on the held insertion key, with the existing explicit buttons and keyboard shortcuts retained. Both input paths use the same sorting model. Rule, comparison and experiment text are optional disclosures.

Browser verification: robot counterexample 14 vs 16; invalid job choice then Scan/Grip/Lift; stack undo; deletion-to-empty failed search and tombstone successful search; full direct-piece selection and insertion runs. Core and sorting model tests pass. Local preview only.
