# Day of class

One page. The rest of the documentation explains *why*; this one is what to do, in order.

- **The console (you):** <https://arifsolmaz.github.io/courses/fall/phy101/calc/>
- **The page for students:** <https://arifsolmaz.github.io/courses/fall/phy101/calc/students.html>
- **The form (them):** <https://forms.gle/MxGUR2aZhvWRgMdZ6>
- **Big QR for the projector:** <https://arifsolmaz.github.io/courses/fall/phy101/calc/join.html>
  — also available from **Form QR ↗** in the console. Show it before starting the clock.

---

## Ten minutes before

1. Open the console on the machine you will project from — **the same browser every
   week**, because the term totals live in it and nowhere else.
2. Check the header: **"N rounds banked"**, where N is the number of rounds you have run
   so far this term. If it says *no rounds banked* and it shouldn't, you are in the wrong
   browser — **Totals → restore / merge a backup** before you do anything else.
3. **Before class → Run the checks.** Eleven lines, four seconds. Green ✓ is a pass, blue
   ✓ is a remark, red ✕ is the only thing that should stop you.
4. **Settings → Test** if you are using live results. It should say *Connected*.
5. Confirm the computer clock and response-sheet timezone agree. For paste scoring, format
   timestamps as `yyyy-mm-dd hh:mm:ss`; live results require the updated Apps Script for ISO timestamps.
6. Slide 1 up with the form link and the student-page link on it. Ask them to open the
   form now, before the first round, not while the clock is running.

## Each round — about four minutes

| | |
|---|---|
| Pick the week and question | chips, or `2`–`6` for the week and `→` to step along |
| Fresh numbers | `N` — new draw, new code |
| **Read the question aloud, then read the code aloud** | the commonest lost point is a mistyped code |
| Start the clock | `Space` |
| Watch the count under the clock | it rises as submissions land, if live results are on |
| Reveal | `R` — the answer, then the two wrong answers the room produced, each with the keystroke behind it |
| Say the keystroke out loud | this is the lesson; the points are the bait |
| Leaderboard | `L` |
| Next | `→` |

`T` switches the whole console between English and Turkish, mid-round if you like.

Three rounds is a normal class. Fifteen across weeks 2–6.

Always start the clock. Only submissions during recorded running intervals count;
pausing closes an interval, resuming opens another, and reveal closes it immediately.
Old rounds without recorded timing cannot be re-marked safely. Keep backups of timing
history as well as totals. Use this activity as supervised practice; see [AUDIT.md](AUDIT.md)
for identity and answer-lookup limitations.

## After the last round

1. On each round's result: **Add this round to the term totals.**
2. **Totals → backup (JSON).** Two seconds, every week, kept somewhere that is not that
   browser. The banked rounds are the only thing in this system that exists in exactly
   one place — everything else can be rebuilt from git and the codes.

---

## If you are not using live results

Everything above is the same except the reveal does not mark itself. After class: open the
form's response sheet, select **the whole sheet including the heading row** (the corner box
above row 1, or ⌘A / Ctrl+A), copy, then **Score a round → pick the round → paste → Mark
this round**. You can paste the whole term's sheet every time; only the rows carrying that
round's code are marked.

---

## When something goes wrong

| | |
|---|---|
| The page will not load | Run the local copy: `fall/phy101/calc/index.html` in your clone. Different browser, so the totals do not come with it — restore a backup if you need them that day. |
| No network in the room | The console needs none. The **students** do, for the form. Run the round, reveal the answer, take it on a show of hands, and score nobody that round. |
| No projector | Read the question, write the numbers on the board, read the code. Nothing else changes. |
| Live results time out | Use the paste route above for that round. It is a fallback, not a failure. |
| You banked a round against the wrong sheet | **Totals → Rounds banked → remove**, then mark it again. The points go with it. |

The fuller table, and the five levels of testing, are in **TESTING.md**.

---

## The two settings, and the one place they have to agree

**Settings → On the projector** decides whether the wall shows student numbers or derived
nicknames. **Settings → If a student submits twice** decides whether the first, last or
best attempt counts.

The student page states both to the students, so if you change either one on the console,
change it in `students.html` too — the block at the bottom of that file:

```js
var STUDENT_PAGE = {
  formUrl: "https://forms.gle/…",   // your shortened form link
  attempt: "first",                 // "first" | "last" | "best"
  show: "id"                        // "id" | "alias"
};
```

Nothing else in that file needs touching, and `node test-students.js` checks that what it
says matches what you set.

---

## What not to put on a slide

The **deployment URL** from Settings. It is the key to your response sheet: anyone holding
it can read a round's student numbers. It lives in that browser's storage and nowhere
else — not in this repository, not in an email, not on a slide. If it leaks, open the
script editor and **Deploy → Manage deployments → Archive**, then deploy again for a fresh
one.

If you ran a round on a shared or podium machine, clear it before you walk away:
**Settings → empty the URL box → Save**.

## Using a different computer

Form responses are collected by Google, independent of the instructor's PC. Open the
same console URL on the new PC. For automatic results, enter the private deployment URL
and shared key in Settings and press Test, before connecting the projector. Alternatively,
sign into the Google account with access to the response sheet and paste its data.

Before changing PCs, export **Totals → backup (JSON)** on the old PC, then use
**Totals → restore / merge a backup** on the new PC. This transfers totals, used codes and
recorded round timings; endpoint settings are entered separately. Do this even if a round
has not yet been banked. Do not switch PCs in the middle of a running round. These local
browser records do not automatically sync through Google or GitHub.
