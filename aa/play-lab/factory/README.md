# Factory Rush

Static standalone game linked from Play Lab. Three missions: FIFO/LIFO dispatch; burst arrivals with free scheduling; snapshot-based stack undo. No dependencies, uploads, real-time clock, or persistent results.

## Rules and teaching boundaries
- Six jobs, one worker, each job takes one time step. All initial arrivals are available at time zero. A valid shipment advances one step; arrivals at the new time then become available. Finishing at the deadline is on time. Invalid actions do not advance time.
- Waiting time = start minus arrival. Finish is start plus one. Relative deadlines are arrival plus three. Tied arrivals enter in alphabetical order; LIFO reverses that insertion order.
- Steady scenario: FIFO has 6 on time, max wait 1; LIFO has 5 on time, max wait 5. Finite arrivals mean no infinite starvation here; the explanation explicitly reserves that risk for an endless arrival stream.
- Burst: both fixed policies have 4 on time. Free order A,D,B,E,F,C has 5 on time. All 6 on time is impossible: final finish is 6 but the latest deadline is 5. Improving on-time count may increase the wait of an old order; FIFO fairness and deadline success are distinct goals.
- Policy is locked after first shipment. Restart permits switching. Records retain latest completed shift for each scenario/policy during this page session.
- Repair stores a state snapshot before each action. Undo must pop the latest snapshot; it restores blue paint while preserving the earlier star. It is not a generic inverse-function claim.

## Validation
`node aa/play-lab/factory/model.test.cjs`
Tests fixed policies, all 320 possible free-choice shifts across the two arrival schedules, invalid actions, wait/deadline accounting and repair snapshots.
Browser checks cover incorrect FIFO choice, full FIFO and LIFO runs, a five-on-time free burst run, full repair including an incorrect undo, and laptop/narrow-screen layouts.

## Previous local leaderboard preview (replaced by shared service)

- Nicknames: 2–20 Unicode letters/numbers, spaces, underscores or hyphens; normalized and matched case-insensitively. This is a local alias, not an authenticated identity.
- Separate boards per arrival schedule. Rank by on-time shipments descending, then maximum wait ascending. Exact ties share competition ranks (1, 1, 3). Clicking speed and retries are not scored. All policies compete within the same scenario.
- Save is available only after a full dispatch shift. Repair is not ranked. Replays validate all six dispatches and recalculate metrics; stored scores are not trusted. This is still browser-only code and is not secure class-wide verification.
- One best result per alias/scenario; weaker and equal attempts do not replace it. LocalStorage key `aa-factory-leaderboard-v1`. Failure to save is reported; in-memory play remains available.
- Sample board uses explicitly fictional names, replay-validated sequences, a separate view and no persistence. It is never mixed with local entries.
- Test `node aa/play-lab/factory/leaderboard.test.cjs`. Browser QA includes incomplete/repair disabled submission, blank nickname feedback, a saved Preview Tester result, reload persistence, weaker retry preservation, sample ranks and laptop/mobile layout.

## Shared class board

The active page uses shared-config.js and shared-board.js, backed by Cloudflare Workers + D1. The previous leaderboard.js is retained as an inactive local prototype; it is not loaded. See services/factory-board/README.md for deployment, identity, retention and testing. Students join with a teacher-provided class code and nickname. The public bundle holds no Cloudflare credentials. Dispatch sequences are replayed on the server; only improved scores replace previous bests. No local prototype scores are uploaded. The server uses a different browser identity key from the old local leaderboard.

Live QA passed against isolated demo classes with two independent tokens and a browser submission. Demo classes were deactivated after testing. The student class starts without test scores.
