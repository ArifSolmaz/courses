# PHY101 — Calculator Challenge (weeks 2–6)

Fifteen short calculator drills, three per class, run from the projector. Each one
targets a **specific keystroke mistake** that costs marks in the common exam — squaring
a negative, DEG versus RAD, the `EXP` key, bracketing a numerator, rounding too early —
rather than just being arithmetic to do quickly.

The numbers are drawn fresh every time, so the answer cannot be passed along the row
or found in last year's notes.

Open `index.html` in a browser. No server, no accounts, no network, nothing to install.

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
| 1 | Student ID / Öğrenci No | Short answer | yes | Response validation → Number → *is number*. This is how points are attributed. |
| 2 | Handle / Takma ad | Short answer | yes | What appears on the projector. Tell them once: **pick one and keep it all term**. |
| 3 | Code / Kod | Short answer | yes | Response validation → Number → *between 1000 and 9999*. |
| 4 | Your answer / Cevabınız | Short answer | yes | Plain number. Units are stripped, and a comma decimal is accepted. |

The column *headings* do not have to match those words exactly — the console looks for
any header containing `student`/`öğrenci`/`no`, `handle`/`takma`/`rumuz`, `code`/`kod`,
`answer`/`cevap`. A `Timestamp` column is used for the speed bonus; without it everyone
correct simply gets the flat 10.

Shorten the form link once and put it on the first slide of every lecture. The students
should have it open before the first round, not be hunting for it while the clock runs.

**Tell them the rules once, in week 2:**

- Answer to **three significant figures** unless the question says otherwise.
- One submission per round counts — **the first**. A second guess is not marked.
- `g = 9.81 m/s²`.
- The handle is public; the ID is not.

---

## 3 · Before class

Open the **Before class** tab.

1. **Run the checks.** Nine checks, on your machine, in your browser, against the files
   as they sit on disk: the challenge bank, the marking rule, the answer reader, the
   sheet reader, whether this browser will store the totals, whether the stylesheet
   loaded, whether every trap is still far enough from its answer to be unmistakable,
   and whether the window is wide enough to project. All green means the console is
   ready.
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

Open the response sheet, select all, copy. On **Score a round**, pick the round from the
dropdown (every round you revealed is remembered, with its code and the time it ran),
paste, and press **Mark this round**.

You can paste the *whole term's* sheet every time — only rows carrying that round's code
are marked. The paste box folds itself away as soon as the round is marked, because it
contains student IDs and this tab ends up on a projector.

Each wrong answer is matched against the two traps, so the table tells you *why* it was
wrong, not just that it was. That is worth reading out.

**Add this round to the term totals** banks it. The same round cannot be banked twice.

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
`student_id, handle, correct, attempts, points`, ready to drop into a gradebook if a
participation bonus is agreed with the other sections.

Student IDs are hidden on the Totals tab until you press **show IDs**, so the tab is
safe to project as a leaderboard.

---

## 6 · Personal data

Student IDs are personal data under KVKK, and this is designed so they are never on the
wall:

- The projector shows **handles only** — on the round table and on the term totals.
- IDs live in the response sheet (Google, your account) and in this browser's local
  storage. They are on the Totals tab but hidden behind a button.
- The pasted sheet disappears from the screen the moment a round is marked.
- The rehearsal invents its students, so a dry run in front of the class shows nothing
  real.

Handles are self-chosen. Say in week 2 that the handle will be on the wall, so nobody
puts their own name in and then regrets it.

---

## 7 · The fifteen challenges

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

## 8 · Files

```
calc/
  index.html      the console
  console.css     projector styling, follows the site's tokens and dark mode
  console.js      the console: seeding, clock, reveal, marking, totals, self check
  challenges.js   the fifteen challenges and THE marking rule
  README.md       this file
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

`test.js` drives the page in headless Chromium — 89 checks, including a fabricated
Google Form sheet with traps, junk, a duplicate and a foreign round pasted in and
marked end to end.

```
node test.js
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
