# Private instructor app

Implementation of the shared-session replacement. The public student instructions,
Form and QR remain unchanged. This app is hosted privately in Google Apps Script,
not as an unauthenticated GitHub Pages page.

## Daily use

Open [instructor sign-in](https://arifsolmaz.github.io/courses/fall/phy101/calc/instructor.html), sign in with the configured Google account, and choose
**Enable controls here**. Select a question and create/start a round. On another PC, open
the same URL and take control there. The current code, question, running intervals and
deadline come from the server; switching PCs does not reset them. No exports or per-PC
endpoint settings are needed.

**Reveal & save scores** closes acceptance. Results and term totals are calculated
centrally from the saved rounds and the original response sheet; repeated refreshes
cannot double-count a round. Results tables are collapsed by default to keep student
numbers off the projector. The calculator walkthrough is available after reveal.

Internet access is required to control this app. A started round still expires at its
server deadline if a browser disconnects. A failed request is not displayed as saved;
retrying a pending command uses its original request ID.

## Build and deploy

Run locally, with private configuration supplied as arguments:

```sh
node build.js /absolute/private/output/Code.gs SHEET_ID RESPONSE_TAB_ID OWNER_EMAIL
```

The builder emits one Apps Script file containing the server, question bank and HTML
interface. It refuses output inside the public calculator directory. Keep the generated
file and real configuration out of Git. The question bank and walkthrough sources are
reused without modifying the student's Google Form.

Create a separate Apps Script project, paste the generated file into `Code.gs`, save,
and deploy as a **Web app**, **Execute as: Me**, **Who has access: Only myself**. Authorize
Google's requested access under the same account configured as OWNER_EMAIL. The server
also checks the active account on every callable operation. Do not change access to
Anyone to work around a login problem. The account must have editor access to the
configured response spreadsheet.

The first saves create up to two hidden, app-owned snapshot tabs in that
spreadsheet. No response cells are modified. Each save writes the inactive snapshot,
flushes it, then publishes a checksum-verified pointer in Script Properties. If an
inactive-tab write fails, the previous committed snapshot remains available. Unknown
or corrupted storage is an error, not a reason to reset the course.

Keep the response sheet and its original timestamps intact. Retain the existing old
console until the private deployment has passed a live connection check. Existing
browser-only history is not automatically migrated: missing old timing cannot be
reconstructed from submissions. Handle any real legacy records once before retiring
the old workflow. Newly created rounds need no manual backup or migration between PCs.

## Tests

```sh
node test.js
node test-storage.js
node preview.js
```

The preview runs at `http://127.0.0.1:8766` with synthetic in-memory state only. Open two
separate tabs to test control transfer. It has no Google connection and creates no
real form responses or spreadsheet writes.

Tests cover concurrent control, stale revisions, idempotent retries, server expiry,
paused/early/late answers, first-attempt handling, code uniqueness, all 15 question
types, storage chunking, failed-write recovery, integrity checks and account rejection.

A live deployment additionally needs verification of Google authorization, response-tab
read access, snapshot writes, and persistence after reopening. Local tests alone do not
prove that the Google deployment is ready.

## Live verification — 20 September 2026

The private web app was deployed with access restricted to the instructor. Google
authorization and response-tab reads succeeded. Creating a ready practice round saved
its question, numbers and code in the sheet. A second browser session retrieved the
same draft and took control; refreshing the original session made it view only.
Both hidden snapshot slots were exercised by these saves. No test Form submissions
or student score records were added. The draft was left ready, without starting its timer.

This checks separate browser sessions on one machine; physical-PC and student-device
testing remains a useful classroom rehearsal. Timing and score edge cases were tested
with synthetic data in the local test suite.

## Slow-refresh regression check

Run the synthetic preview with PREVIEW_PORT=8767 and SNAPSHOT_DELAY_MS=7000.
Enable controls, create a round, press Refresh, and immediately press Start round.
Start must succeed while the read is in flight. Pause, Resume and Reveal must also
work, and a late snapshot must not restore an earlier round state. This sequence
passed in the browser after separating refresh requests from save requests.

## Classroom opening and student entry

The private deployment stays restricted to the instructor. A separate public deployment
from the same Apps Script project serves only the student HTML and public availability.
Use ?student=1 for entry, and ?status=1 for the fixed phyActivityStatus JSONP callback.
Every instructor RPC and the default page still enforce the configured Google account.
Keep both deployments updated when changing shared server code.

Sessions default closed. Opening creates a fresh eight-character classroom code and an
absolute closing deadline. End classroom activity closes acceptance immediately; each
round deadline is capped at the classroom deadline, even with no browsers connected.
The course dashboard hides its join button when closed or unavailable. The existing
student URL checks availability through the public app. The large QR points there.
Original Form URLs and previously distributed QR images may still open Google Forms;
ineligible timestamps never receive points. Classroom codes discourage casual remote
entry but cannot establish physical presence or verified student identity.

Run test-public.js for public-data minimization, code rejection and instructor auth checks.

Scoring: every correct eligible answer earns 10 points; incorrect answers earn 0.
There is no speed bonus. Totals are recalculated with this rule, including saved rounds.
