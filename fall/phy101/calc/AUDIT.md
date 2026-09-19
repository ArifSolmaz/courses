# PHY101 calculator practice review — 20 September 2026

The student page and linked Google Form load. The activity is suitable for supervised,
low-stakes practice, but the current architecture cannot guarantee cheating-free results.
Changes below are local repository changes, not a published website or Apps Script update.

## Findings

| Finding | Consequence | Status |
|---|---|---|
| Scoring originally checked the code but not start/end times | Answers after the reveal, before start or during pauses could earn points | Fixed locally: recorded running intervals, deadline filtering before duplicate selection, elapsed-time clock |
| Student ID is self-reported; the live form says the Google account is not included | A student can claim another ID, including sending an early wrong answer under the first-attempt policy | Requires verified institutional identity mapped to the roster; not fixed by numeric validation |
| Public console and question bank reproduce answers from challenge and code | Students can look up answers without using a calculator | Inherent in this public design; use supervised practice, or a private assessment system with a new private question bank |
| Everyone in a round sees the same code/question | Neighbours can share answers | Corrected the misleading anti-copying claim in both languages |
| Live form code validation allows `1234.5` | A fractional code passes the form but is not a valid round | Strict downstream validation added; change the live form validation as below |
| Old scorer stripped non-digits from codes | Malformed codes could match a real round | Fixed in scorer and Apps Script source |
| Timestamps sorted as strings; Apps Script used locale-dependent Date strings | Speed order could be wrong; timing could depend on locale | Numeric time ordering and ISO UTC serialization added; ambiguous pasted dates rejected |
| Number parser treated `2^3` as `2e3` and stripped arbitrary letter suffixes | Incorrect expressions could be scored as valid numeric answers | Fixed; documented comma decimals, scientific notation and recognised units retained |
| Student instructions claimed only the ID was collected | Code, answer and timestamp were omitted | Corrected both languages; added calculator preparation and phone-use rules |
| Live endpoint uses a secret URL and optional shared key | A leaked URL without a key exposes submitted IDs/answers; four-digit codes are enumerable | Set a strong private shared key, keep URL/key off the projector, never publish the response sheet |

## Changes needed in the actual Google Form

These were not changed through the public respondent page.

- Code: **Regular expression → Matches → `^[1-9][0-9]{3}$`**, required.
- Student ID: **Regular expression → Matches → `^[0-9]+$`**, required;
  use the actual roster's length if uniform. Preserve leading zeros. This validates
  format only, not identity.
- Answer: allow decimal commas and `6.2e-4`; a generic numeric validator may reject
  these. Keep the field required and use the console's numeric parser.
- Disable response editing and respondent access to response summaries. These owner
  settings were not visible and remain unverified.
- Keep “Limit to 1 response” off for this reusable multi-round form.
- For credit-bearing use, collect verified institutional accounts and reject any
  account/ID pair not on the instructor's roster. This requires changing the privacy
  statement and the scoring/backend workflow too; merely collecting email is insufficient.

## Publication and timing requirements

Publish the repository changes and update the deployed Apps Script with `apps-script.gs`
before relying on these fixes. Configure its shared key privately. The existing deployment
was not accessed, and no real form response was submitted, so Form → Sheet → live endpoint
has not been verified end to end. The browser test used synthetic pasted rows locally.

Always start the timer before submissions. Reveal, pause and timeout close the current
acceptance interval. Switching questions draws a fresh code. Missing timing or timestamp
columns fail closed; old untimed history cannot be re-marked using the new rules.
Previously banked totals are preserved, not retroactively corrected.

Use a correctly synchronised instructor clock. Live timestamps are ISO UTC after the
Apps Script update. For pasted Sheets data use `yyyy-mm-dd hh:mm:ss` and the same timezone
as the instructor computer; slash dates with ambiguous day/month order are rejected.
The cutoff is exclusive: a timestamp exactly at the deadline is late. Network delays and
second-resolution timestamps near the boundary can still affect fairness. Avoid making
these speed bonuses part of consequential exam grades.

## Verification completed

- Live student page and form opened in a browser; required-field and number validation
  inspected without submitting a response. The form accepted `1234.5` on leaving the
  code field and rejected a nonnumeric student ID.
- `node fall/phy101/calc/test-security.js`: 13 passing groups covering timing,
  duplicate policies, strict codes, invalid dates, prototype-like IDs, number input,
  delayed timer callbacks, question changes, and 1,500 challenge draws (15 × 100).
- From this directory, `node test-gs.js`: 25 checks passed, including ISO timestamps,
  code filtering, data minimisation and shared-key rejection.
- Real-browser readiness checks: all 11 passed. Rehearsal: 5 of 10 correct with
  scores 13/12/11/10/10. A timed local test accepted a comma-decimal answer and
  excluded a correct answer timestamped after reveal.
- Bilingual student page checked in-browser; English header now translates too.
  At 375 px the English page and at 320 px the Turkish page had no horizontal
  overflow; dark-mode form button and
  body text were inspected visually.
- The older Playwright suites were not run here: Playwright is not installed and they
  hard-code a Linux browser path. Their scoring fixtures predate required timing
  intervals. The dependency-free security suite and browser checks above cover this patch.

For the lesson, ask students to bring the calculator permitted in the midterm, open the
form before the clock starts, solve independently, and explain one keystroke after each
reveal. Occasional observed calculator demonstrations give better evidence of learning
than a fast online answer alone.
