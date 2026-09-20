# PHY101 — an instructor session that follows you between PCs

Status: private Google deployment is authorized and live. Response reads and cloud
snapshot writes have been verified. The public instructor landing page provides the
Google sign-in link; the older console is labelled as a browser-only demonstration.

Access to the supplied response spreadsheet was confirmed. The response tab is
`Form Responses 1`, ID 698473429, with Timestamp / Student ID / Code / Answer headers.
Response cells are preserved. Private deployment configuration is generated outside
the public repository. See [cloud/README.md](cloud/README.md) for build and operations.

## The instructor's workflow

1. Open one private instructor URL on any PC and sign in with the owning Google account.
2. The page loads the current course session: selected question, drawn numbers,
   round code, running/paused/closed state, response count and scores.
3. Continue the session. Changes save on the server automatically. There is no
   routine export, restore, endpoint entry or machine-specific setup.
4. Close the page or change computers. The session and any active deadline remain on
   the server. Opening the URL on the next computer resumes that same session.

Students keep the current instructions URL, Google Form and QR code. They watch the
calculator animation on the classroom projector after the instructor reveals it.

## Where it runs

Host the instructor UI as a Google Apps Script HTML-service web app, deployed with
access restricted to the deploying instructor (MYSELF), executing as that instructor.
Use `google.script.run` for authenticated calls to the backend. Do not try to make
GitHub Pages manage Google credentials or expose an instructor shared key.

Keep the public instructions, QR screen and Google Form on their current URLs.
The private response spreadsheet is the central record, with two alternating, app-owned snapshot tabs
for round state, control ownership and command receipts. Scores and totals are derived
from the centrally saved rounds and original response records. Identify the response tab
by its configured sheet ID, never by its position in the workbook. Do not change its
sharing or replace its existing response data.

## Server-owned session

Each round has a unique internal ID, unique public submission code within the course,
question ID, exact parameters, start/pause/resume/end times, attempt policy and status.
Record the selected question/draw before displaying it as ready. The server allocates
codes and timestamps, so different PC clocks and independent browser histories cannot
change deadlines or accidentally reuse codes.

Commands are semantic operations: create round, start, pause, resume, close/reveal,
refresh results and choose display settings. Clients never upload an arbitrary whole
copy of the scores or claim that a round started at a client-supplied time.

Use a server lock for each mutation. Commands carry an expected session revision and
an idempotency ID. Retrying a command returns its previous result; an out-of-date
browser refreshes instead of overwriting newer state. The UI displays a pending state
until the server confirms success. Never show “saved” for an unacknowledged request.

Only one PC controls a session at a time. A second signed-in PC initially shows the
same session read-only, with a “Take control here” action. Taking control invalidates
the old controller's token and its subsequent commands; it does not restart the timer.
The old page reports that control moved. No silent last-writer-wins merge.

## Timing and scoring

The server records accepted running intervals and an absolute deadline. The browser
clock is only a display, updated using the server's current time. Closing a laptop
must not pause, extend or erase a round. Pause closes an interval; resume opens a new
one; reveal closes acceptance before returning answers/animation data.

Google Form submission timestamps determine eligibility. Filter by exact code and
accepted intervals before selecting the first/last/best attempt. Score on the server
using the shared question and marking logic. Persist results centrally and derive term
totals from those records. Refresh after reveal to include on-time responses that took
a moment to appear in the response sheet. Banking/refreshing must never count a round twice.

A lost connection shows “Not connected — controls unavailable”. Do not accept new
round commands locally or claim that they were saved. An already-started round still
ends at its server deadline. When connectivity returns, reload the actual session.

## Privacy and integrity

The private deployment and every callable server operation must enforce the instructor
access policy. Do not return student records to public pages, publish the response sheet,
or place credentials in a URL, QR code or repository. Do not retain student scores in
persistent browser storage on shared PCs. Sign out of Google when leaving a shared PC.

Central storage solves continuity, not student impersonation or answer sharing. The
current form still accepts self-reported IDs, and previously published question code
remains public. Verified student identity and supervision are separate requirements
before these results can be used for consequential grades.

## Migration and rollout

1. Identify the form's actual linked response spreadsheet and its owning Google account.
2. Build the private instructor service and reuse the question bank, presentation styles
   and calculator walkthrough; replace local timing/persistence/scoring calls.
3. Validate with synthetic rounds in an isolated local backend, then verify the private Google deployment.
4. Check whether any real scores exist only in an old browser; recover those once,
   without replacing newer server records. Existing missing timing cannot be invented.
5. Deploy privately and verify the same round resumes on two independent signed-in PCs.
6. Direct the instructor to the private URL. Keep the public console as an explicitly
   labelled ungraded demonstration, not a second independent source of course totals.
7. Retire the old secret-URL results endpoint only after the replacement works.

## Acceptance checks

- PC A starts a round; PC B displays the same question, code and remaining time.
- Closing A does not stop the server deadline or lose submissions.
- Taking control on B blocks stale changes from A.
- Retrying start/reveal cannot duplicate a round or points.
- Wrong, early, paused and late submissions are rejected identically on both PCs.
- A failed save cannot appear successful; reconnect restores server state.
- Closing/reopening either browser restores the same centrally stored totals.
- A signed-out browser and another Google account cannot read or control the instructor app.
- Students' existing Form and QR URLs still work.

## Verified platform references

- Apps Script web apps: https://developers.google.com/apps-script/guides/web
- Access/execute-as configuration: https://developers.google.com/apps-script/manifest/web-app-api-executable
- Authenticated HTML-service calls: https://developers.google.com/apps-script/guides/html/communication
