# Factory Rush shared class service

Cloudflare Worker + D1. Reuses the game's scoring module; browser-supplied scores and nicknames on score submissions are ignored. Stored result is replayed from the six dispatch IDs using the authenticated player's nickname. Same scoring across tools; separate arrival schedules; atomic best-result SQL update, tied competition ranks.

## Deploy
1. `npx wrangler d1 create aa-factory-board` and put the returned database ID in wrangler.jsonc.
2. `npx wrangler d1 migrations apply aa-factory-board --remote --config services/factory-board/wrangler.jsonc`
3. `npx wrangler deploy --config services/factory-board/wrangler.jsonc`
4. Generate a class: `node services/factory-board/create-class.mjs "AA 2026" /tmp/new-class.sql`. Apply that SQL with `wrangler d1 execute ... --remote --file /tmp/new-class.sql`. Give the invite code to students; do not commit it.
5. Set the HTTPS Worker URL in `aa/play-lab/factory/shared-config.js`, then publish the static website.

Never put API tokens or OAuth credentials in this repo. D1 binding is server-only. The student bundle contains only the public Worker URL. Use ALLOWED_ORIGINS to restrict browser origins. Localhost is included for instructor testing; it does not replace authentication.

## Identity / classroom limits
A 256-bit random device token reserves a normalized nickname within a class. Server stores a hash, browser stores the original token. Reloads preserve identity; students should use their own device. This is pseudonymous practice, not verified enrollment or exam-grade authentication. A user with the invite code can reserve multiple aliases; replay checks do not prove who solved a task.

A lost browser token cannot be recovered through a public endpoint. Teacher may remove that alias using an authenticated D1 transaction (delete its scores, then player), after checking the student's request. Classes can be closed with `UPDATE classes SET active=0 WHERE id=...`; old sessions then stop working. Store the invite code securely; only its SHA-256 digest is stored. DB backups and retention are managed by the account owner through D1.

POST /join: classCode, nickname, token. Returns class identity. Idempotent for same alias/token. Conflicting alias is rejected. Maximum 500 players per class. Join retries preserve the pending token on the browser.
GET /board?shift=steady|burst: bearer device token; returns only that class.
POST /score: bearer token; shift, policy, order; no client-controlled score.

Bounded JSON bodies (4KB), prepared statements, origin checks, token hashing, 600 joins per 10 minutes per IP (shared campus networks), 120 calls/minute per player. Rate-limit IP hashes expire with their window and are cleaned on requests. No IPs in score records. The board refreshes explicitly, avoiding continuous database polling.

## Local testing
Apply migrations with `--local`; start `npx wrangler dev --config services/factory-board/wrangler.jsonc --port 8787`. Create test classes with invite-code hashes for AA-DEMO and AA-OTHER. Run `node services/factory-board/integration-test.mjs`. Tests use unique pseudonyms in those test classes only; never run against student classes. The server tests cover two independent tokens reading the same board, class isolation, nickname conflicts, bad origins, invalid order, forged score, and best-only storage.

Production publication must not point at localhost or the placeholder D1 UUID. No local demonstration records are copied to production.

## All-game progress (October 2026)
`POST /progress` replays a bounded milestone proof using the shared models. `GET /play-board` returns only the authenticated class, including the authenticated nickname (for teacher-renamed accounts). Each of 33 named milestones earns ten points once; a unique player/game/task key makes repeated saves idempotent. Free-form sandbox attempts are practice, not farmable points. Existing qualifying Factory scores are backfilled by migration 0002; subsequent legacy `/score` requests also award their matching milestone. No existing records are deleted.

Apply migration 0002 before deploying the worker. Tests: `node services/factory-board/play-scoring.test.cjs` plus the extended integration test against local D1, never a student class. As with the old board, replay validation establishes that a submitted solution works, not that the player personally discovered it.
