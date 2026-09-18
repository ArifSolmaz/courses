# PHY101 — Calculator Challenge (weeks 2–6)

Fifteen short calculator drills, three per class, run from the projector. Each one
targets a **specific keystroke mistake** that costs marks in the common exam — squaring
a negative, DEG versus RAD, the `EXP` key, bracketing a numerator, rounding too early —
rather than just being arithmetic to do quickly.

The numbers are drawn fresh every time, so the answer cannot be passed along the row
or found in last year's notes.

Open `index.html` in a browser. No server, no accounts, no network, nothing to install.

**On the day, you want [DAY-OF-CLASS.md](DAY-OF-CLASS.md)** — one page, in order. This
file is the reference behind it.

---

## 1 · The one idea to understand

Every round shows a **four-digit code**. That code *is* the question: it seeds the random
numbers, so `(challenge, code)` reproduces the exact parameters on any machine, at any
time, next year included.

That buys three things:

- Students type the code into the form, so their answer is tied to the round they sat in.
- Nothing has to be stored between asking and marking — the console re-derives the
  numbers from the code.
- An answer copied from a friend in the other section, or from last year, is wrong,
  because their code was different.

A student who types the wrong code is not marked. Read it out as well as showing it.

---

## 2 · The Google Form (make it once, use it all term)

One form, reused for every round of every week. Turn **off** "Limit to 1 response" —
they submit repeatedly, once per round.

| # | Question | Type | Required | Notes |
|---|----------|------|----------|-------|
| 1 | Öğrenci No / Student ID | Short answer | yes | Response validation → Number → *is number*. The only thing collected that identifies anyone. |
| 2 | Kod / Code | Short answer | yes | Response validation → Number → *between 1000 and 9999*. |
| 3 | Cevap / Your answer | Short answer | yes | Plain number. Units are stripped, and a comma decimal is accepted. |

Three questions, nothing else — **no name, no handle, no email**. The projector name is
derived from the ID instead (see §6).

The column *headings* do not have to match those words exactly — the console looks for
any header containing `student`/`öğrenci`/`no`, `code`/`kod`, `answer`/`cevap`. A
`Timestamp` column is used for the speed bonus; without it everyone correct simply gets
the flat 10. (If you ever do add a handle column, it is used in place of the derived
alias.)

Shorten the form link once and put it on the first slide of every lecture. The students
should have it open before the first round, not be hunting for it while the clock runs.

**The rules are written out for them** in [students.html](students.html) — the same page
in Turkish and English, with the form link on it. Put its link on slide 1 beside the form
link. Three lines at the bottom of that file set the form link and the two rules that
depend on your Settings; see [DAY-OF-CLASS.md](DAY-OF-CLASS.md). Say them out loud once in
week 2 as well:

- Answer to **three significant figures** unless the question says otherwise.
- One submission per round counts — **the first**. A second guess is not marked.
- `g = 9.81 m/s²`.
- **Whether your number goes on screen depends on the Settings tab** — say whichever is
  true for your room. Shipped as-is it shows student numbers; switched to nicknames, each
  student appears under a fixed nickname all term and no number is ever projected.

---

## 3 · Before class

**[TESTING.md](TESTING.md) is the full procedure** — five checks, what "good" looks like
for each, and what to do when something is wrong. The short version follows.

Open the **Before class** tab.

1. **Run the checks.** Eleven checks, on your machine, in your browser, against the files
   as they sit on disk: the challenge bank, the marking rule, the answer reader, the
   sheet reader, whether this browser will store the totals, whether the stylesheet
   loaded, whether every trap is still far enough from its answer to be unmistakable,
   how many rounds this browser holds, whether live results are configured, and whether
   the window is wide enough to project. All green means the console is ready.
2. **Rehearse a round.** Press `D` (or the **rehearse** button on the Run tab). The
   console invents a class of twelve — some right, some caught by each trap, one blank,
   one who typed a comma for the decimal point, one duplicate submission and one row
   from a different round — and marks them. You see the real leaderboard from fake data.
   It is labelled a rehearsal and **cannot** be added to the term totals.

The one link in the chain the page cannot check by itself is your Google Form. To test
that too: run a round, submit an answer to your own form using the code on screen, open
the response sheet, copy it, and mark it on the **Score a round** tab. Do that once, in
week 1, and you will never wonder again.

---

## 4 · In class — the two-minute routine

1. Pick the week and the challenge with the chips, or press `2`–`6`.
2. `N` for fresh numbers if you want them (each press is a new code).
3. Read the question aloud; read the **code** aloud.
4. `Space` starts the clock. 2 minutes is the default; 90 s once they are used to it.
5. `R` reveals. Do not skip this part — it is the whole lesson. The screen shows the
   answer *and* the two wrong answers the room actually produced, each with the
   keystroke that causes it. Say the keystroke out loud.
6. `→` moves to the next challenge.

`T` switches the whole console between English and Turkish, mid-round if you like.

| key | does |
|-----|------|
| `Space` | start / pause / resume |
| `R` | reveal the answer and the traps |
| `N` | new numbers (new code) |
| `→` | next challenge |
| `2`–`6` | jump to that week |
| `T` | English ↔ Turkish |
| `D` | rehearse (dry run) |
| `Esc` | back to the Run tab |

---

## 5 · After class — scoring

Open the response sheet and select **the whole thing including the heading row** — the
corner box above row 1, or ⌘A / Ctrl+A. The headings are how the columns are identified,
so a paste without them cannot be marked. Copy. On **Score a round**, pick the round from
the dropdown (every round you revealed is remembered, with its code and the time it ran),
paste, and press **Mark this round**.

Copying out of Google Sheets puts **tab**-separated text on the clipboard; a downloaded
`.csv` is comma-separated; a Turkish-locale export uses semicolons. All three are read —
the separator is detected from the heading row. (This was a real bug: every test fed it
commas, so a genuine Sheets paste failed until it was tried for real.)

You can paste the *whole term's* sheet every time — only rows carrying that round's code
are marked. The paste box folds itself away as soon as the round is marked, because it
contains student IDs and this tab ends up on a projector.

Each wrong answer is matched against the two traps, so the table tells you *why* it was
wrong, not just that it was. That is worth reading out.

**Add this round to the term totals** banks it. The same round cannot be banked twice.

### If a student submits twice

The form cannot stop a second submission, so the console decides which one counts —
**Settings → If a student submits twice**:

| | |
|---|---|
| **first counts** (default) | The earliest stands. Strictest, and the only one that keeps the speed bonus meaningful: a student cannot fire off guesses and keep the one that lands. |
| **last counts** | The newest stands, so a typo can be corrected — and so can a guess, repeatedly, until the clock stops. |
| **best counts** | Their first correct answer counts wherever it falls. Kindest, and the easiest to brute-force. |

Whichever you pick, the result says how many students resubmitted and how many extra rows
there were, so you can see whether it is happening at all before deciding it matters.

### Points

| | |
|---|---|
| correct, within the window | **10** |
| first correct | **+3** |
| second correct | **+2** |
| third correct | **+1** |

Accuracy carries the weight; speed is only a tiebreak. A fast wrong answer scores
nothing — which is the habit the whole exercise is trying to build.

Correct means within **1 %** of the true value, except where the challenge is itself
about precision (`W6-C3`), where the answer must agree to **three significant figures**.
The console and the test suite call the same function for this, so a student is never
marked by one rule and checked by another.

### The totals

Kept in that browser's local storage, on that machine, and nowhere else. **Export the
CSV regularly** — clearing site data, or switching laptops, loses them. The CSV is
`student_id, alias, correct, attempts, points`, ready to drop into a gradebook if a
participation bonus is agreed with the other sections.

Student IDs are hidden on the Totals tab until you press **show IDs**, so the tab is
safe to project as a leaderboard.

---

## 6 · Personal data

Student IDs are personal data under KVKK, and this is designed so they never reach the
wall:

- The form collects **only the student number** — no name, no handle, no email.
- **What the projector shows is a setting** — **Settings → On the projector**. It ships
  showing **student numbers**, which is what was asked for; switch it to nicknames if you
  would rather not project them. It relabels the whole term at once, including rounds
  already banked, because the name is worked out when the table is drawn and never stored.
- The nickname option shows a **derived alias**, like `Frekans-935`. The same student
  number always gives the same alias, on any machine, in any week, so a term leaderboard
  still works. Nothing is stored to make this happen and the student chooses nothing.
- The alias carries **no digits of the ID**, and consecutive student numbers give
  unrelated aliases. That second part needed fixing: the first version advanced the word
  by exactly 45 and the number by 849 for every consecutive ID, so two classmates could
  have reconstructed the whole register from their own two aliases. A murmur3 avalanche
  now breaks the pattern — measured, the next alias is predictable 0.00 % of the time.
- IDs live in the response sheet (Google, your account) and in this browser's local
  storage. They are on the Totals tab but hidden behind a button.
- The pasted sheet disappears from the screen the moment a round is marked.
- The rehearsal invents its students, so a dry run in front of the class shows nothing
  real.

**What this is not.** The alias is a pseudonym, not a secret. `console.js` is public on
GitHub Pages, so anyone who already knows a particular student's number can compute that
student's alias. It keeps identifiers off a projected screen, which is the actual risk;
it is not protection against someone who holds the register. If you want it to be
unguessable, say so and I will add a one-time secret salt that lives only on your
machine.

**Two students, one alias.** About 0.7 % of classes of 30, and 2.9 % of 60 — the console
detects it when marking and tells you. Their points stay separate, because the totals are
keyed to the student number, not the alias; only the screen shows the name twice.

**Telling students their alias.** The `export points (CSV)` file on the Totals tab has
`student_id, alias` in it. Post it once where each student can find their own row, or
let them spot themselves on the first round — they will recognise their own answer.

---

## 7 · Live results — no pasting (optional, 5 minutes, once)

With this set up, submissions arrive by themselves: a live count while the clock runs, and
the round marks itself the moment you press **REVEAL**. Without it nothing changes — you
paste the sheet as before, and everything else works the same.

**Setting it up**

1. Open the response **sheet** (not the form) → **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs` and paste in the whole of **`apps-script.gs`** from
   this folder. Save.
3. **Deploy → New deployment** → gear icon → **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**   ← required; the console is not signed in as you
4. Deploy. Google will warn you that the script is unverified — it is your own script, in
   your own account, reading only your own sheet. Click through
   *Advanced → Go to (project name)*.
5. Copy the **Web app URL** (it ends in `/exec`).
6. In the console: **Settings**, paste the URL, **Save**, then **Test**. It should say
   *Connected*.

**What "Anyone" does and does not mean.** The script hands out only the rows whose code
you ask for, and only the student number, code and answer. It refuses a request with no
code, so the URL cannot be used to pull the whole term. But anyone holding that URL can
read one round's student numbers, so **treat it as a password**: it lives in your
browser's settings and nowhere else — not on a slide, not in this repository, not in an
email. If it leaks: **Deploy → Manage deployments → Archive**, then deploy again for a
fresh URL.

If you want a second lock, set `SHARED_KEY` in the script to any word and put the same
word in the console's Settings. Requests without it are refused.

**In class it looks like this.** Press **Space** and a count appears under the clock,
rising as answers come in — that alone is worth it, because you can see when to stop
waiting. Press **R** and the answer and traps appear as usual, with a line underneath
saying how many were correct. Press **L** for the leaderboard.

**If it fails mid-lecture** the console says so and points at the paste box. Nothing is
lost: the answers are in the sheet either way, and you can mark the round afterwards.

---

## 8 · The fifteen challenges

| id | week | the keystroke it is about | formula |
|----|------|---------------------------|---------|
| W2-C1 | 2 | squaring a negative | v² = v₀² + 2aΔx |
| W2-C2 | 2 | bracketing a numerator | a = (v² − v₀²) / 2Δx |
| W2-C3 | 2 | km/h → m/s before squaring | braking distance |
| W3-C1 | 3 | DEG vs RAD | R = v₀² sin 2θ / g |
| W3-C2 | 3 | bracketing a denominator | quadratic flight time |
| W3-C3 | 3 | the `EXP` key | ΣF = ma, m = x × 10³ |
| W4-C1 | 4 | sin and cos on an incline | a = g(sin θ − μ cos θ) |
| W4-C2 | 4 | inverse trig, and DEG again | θc = tan⁻¹ μs |
| W4-C3 | 4 | bracketing numerator *and* denominator | Atwood machine |
| W5-C1 | 5 | cosine of an obtuse angle (the sign) | W = Fd cos θ |
| W5-C2 | 5 | the half and the square | Us = ½kx² |
| W5-C3 | 5 | unit prefixes | P = W/Δt, W in kJ |
| W6-C1 | 6 | square root of a sum | F = √(Fx² + Fy²) |
| W6-C2 | 6 | a two-stage chain, `Ans` not retyping | ramp then rough floor |
| W6-C3 | 6 | rounding only at the end | W to 3 s.f. |

Week 6 is the review class, so its three are mixed and a little longer.

---

## 9 · Files

```
calc/
  index.html        the console
  students.html     the page the students read — rules, points, what a round is
  console.css       projector styling, follows the site's tokens and dark mode
  console.js        the console: seeding, clock, reveal, marking, totals, self check
  challenges.js     the fifteen challenges and THE marking rule
  apps-script.gs    the Google Apps Script for live results (§7)
  DAY-OF-CLASS.md   one page: what to do, in order, on the day
  TESTING.md        five levels of testing, and what "good" looks like for each
  README.md         this file
  test.js  test-live.js  test-gs.js  test-students.js
```

`challenges.js` holds no DOM code and `console.js` holds no physics. A challenge is:

```js
{
  id: "W2-C1", week: 2, skill: "squaring a negative",
  gen:     function ()  { return { … } },   // random parameters, bounded
  text:    function (p) { return "…" },     // English, HTML
  text_tr: function (p) { return "…" },     // Turkish
  hint:    "v² = v₀² + 2aΔx",
  answer:  function (p) { return … },
  unit: "m/s", sf: 3,
  tol: 0.01,            // or mark: "sf3" when the question is about precision
  traps: [ { value: function (p) {…}, label: "…", label_tr: "…",
             why: "…", why_tr: "…" } ]      // why may be a function of p
}
```

Two rules if you add one:

- **A trap must be unmistakably wrong**, on every draw: a Math ERROR, the opposite sign,
  or at least **15 %** away from the answer. You do not have to enforce this yourself —
  `harden()` at the bottom of `challenges.js` re-draws the parameters until it holds, and
  both the self-check and the test suite police it. It matters more than it looks: a
  sweep of the finished bank found the RAD-mode range trap landing **1.1 %** from the
  answer at θ = 48°, purely because `sin(96 rad)` happens to sit near `sin(96°)`. A trap
  that close teaches nothing and is one rounding away from being marked correct. Six
  traps were in that state before the rule existed.
  `W6-C3` is the deliberate exception (`minMargin: 0`): it is *about* rounding, so a
  small difference is the lesson, and it is marked by significant figures instead.
- **Never quote a number in the explanation unless it comes from `p`.** Write `why` as a
  function if it names a keystroke. An explanation reading "typing −12.5 x² gives
  −156.25" is wrong the moment the draw is −13.5, and the room will see it.

### Does it open with no network?

Yes — tested with every non-`file://` request blocked. The only outbound request is
Google Fonts, and the page falls back to Georgia / system monospace with no layout
change and no horizontal overflow. Nothing else is fetched, no module scripts, no
`localStorage` dependency it cannot survive without. Run it from the folder with the
Wi-Fi off if you like.

### Tests

`test.js` drives the page in headless Chromium — 111 checks, including a fabricated
Google Form sheet with traps, junk, a duplicate and a foreign round pasted in and
marked end to end. `test-live.js` (16) covers the live-results path, `test-gs.js` (19)
the Apps Script, and `test-students.js` (70) the student page — including that what it
promises the students matches what the two Settings are set to.

```
node test.js && node test-live.js && node test-gs.js && node test-students.js
```

Every check in it has been confirmed to fail when the thing it tests is broken, by
running 26 deliberate mutations of the console — one per invariant — and requiring each
to be caught.

Several checks exist only because the first version passed while the console was wrong:
the Turkish reveal was half English, the podium read "2st in", the pasted sheet — every
student ID in it — was sitting on the projector above the results, six traps landed
within 10 % of their own answers, and the backup could not be restored. Two of the tests
themselves were passing while measuring nothing: one read the code ledger *after* the
corner case that rewrites it, and one relied on 120 random draws colliding, which they
do only about half the time.
