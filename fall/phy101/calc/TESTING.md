# Testing the calculator challenge before class

Five checks, in increasing order of cost. The first three take four minutes together
and need nobody but you. Do **§4 once**, before week 2, and never again. Do **§0 and §1**
before each class.

Decide one thing first, because it changes everything else:

> **Which copy are you running this term — the web page or the local file?**
>
> - Web: `https://arifsolmaz.github.io/courses/fall/phy101/calc/`
> - Local: `fall/phy101/calc/index.html` in your clone
>
> They are separate browsers as far as storage is concerned, so the term totals kept in
> one are **invisible** to the other. Pick one, test that one, and use that one all term.
> The web page is usually the better choice: it works from any machine, including a
> podium PC you don't control. The local file is the better choice if the lecture hall
> network is unreliable.

---

## 0 · Is it alive? — 10 seconds, on the day

Open your chosen copy. You are looking for three things, all visible without clicking:

- The question renders, with a four-digit **code** in the top right.
- The header says **"N rounds banked"** — the number you expect for this point in term.
- The clock reads **2:00**.

If the header says *no rounds banked* and you have already run rounds this term, **stop**:
you are in the wrong browser, or its storage was cleared. Go to **Totals →
restore / merge a backup** and load your most recent backup file before the lecture.

If the page does not load at all, see §5.

---

## 1 · Does the console work on this machine? — 1 minute, the day before

**Before class** tab → **Run the checks**.

Ten lines. What you want is *"all 10 checks passed — the console is ready"*.

- A **green ✓** is a pass.
- A **blue ✓** is a remark, not a fault — it is information you asked for, such as how
  many rounds this browser is holding.
- A **red ✕** is the only thing that should stop you.

The checks run against the files as they actually are, in the browser you will actually
use, so they cover the things that differ between machines: whether the stylesheet
loaded, whether this browser will store the totals, whether every trap is still far
enough from its answer, and whether the window is wide enough to project.

Run this on the **podium machine** if you are using one, not only on your own laptop.

---

## 2 · Does a round work? — 2 minutes, the day before

On the Run tab, press **D** (or the **rehearse** button).

The console invents a class of twelve and marks them. What you should see:

- **"5 of 10 correct"** — twelve rows submitted, ten marked. The two that vanish are a
  duplicate submission and a row carrying another round's code, both correctly ignored.
- An orange **Rehearsal** banner.
- A leaderboard of handles with points 13 / 12 / 11 / 10 / 10 for the correct ones.
- The wrong answers each labelled with the mistake that produced them, not just marked
  wrong.
- **No student IDs anywhere**, and no button offering to add it to the term totals.

Then press **R** on the Run tab and read the reveal: the answer, and the two wrong
answers with the keystroke that causes each. Press **T** and check the Turkish reads
properly. That is the part of the lesson that does the teaching, so it is worth seeing
once before you have to narrate it.

---

## 3 · Does the projector work? — 5 minutes, in the room

Only worth doing once, in the hall you actually teach in.

1. Full-screen the browser window (**F11**, or ⌃⌘F on a Mac).
2. Walk to the **back row**. You must be able to read the four-digit code and the
   question without squinting. If you cannot, the room needs the browser's zoom at
   110–125 % (⌘/Ctrl and `+`), not a smaller font.
3. Check the clock is visible from the back — it is deliberately huge for this reason.
4. Press **R**. The reveal must fit on screen without scrolling. If it does not, use a
   90-second timer so the clock is smaller, or zoom out one step.

---

## 4 · Does the whole chain work? — 10 minutes, ONCE before week 2

This is the only test that touches the Google Form, and the Form is the one link the
console cannot check by itself. Do it properly once and you will not have to wonder
again.

**You need:** the Form built (README §2), and your phone.

1. On the console, pick **W2 → 1**. Press **N** for fresh numbers. Note the code.
2. Press **Space** to start the clock — you want the real thing, not a shortcut.
3. On your **phone**, open the Form exactly as a student would, from the shortened link
   you will put on the slide. Do not use a bookmark on your laptop; the point is to test
   the path they will take.
4. Submit **three times**, with different student IDs and handles:
   - once with the correct answer,
   - once with a deliberately wrong number,
   - once with the answer typed with a comma for the decimal point (`17,3`) — a lot of
     phone keyboards do this, and it must still be marked correct.
5. Open the Form's response sheet. Select all (⌘A / Ctrl+A), copy.
6. On the console: **Score a round** → pick this round from the dropdown → paste →
   **Mark this round**.

**What good looks like:**

- All three rows appear, none missing.
- The correct one and the comma one are both marked **correct**.
- The wrong one is marked wrong — and if you happened to type one of the two trap
  values, it is named.
- The paste box disappears the moment it is marked, taking the student IDs off screen.
- Handles are shown; **no IDs anywhere**.

**Then clean up.** Do *not* press *Add this round to the term totals* — or if you
already did, go to **Totals → Rounds banked** and press **remove** on it. Your test
students must not be in the term scores.

If a column is not found, the console says which one. The headings do not have to match
the README's wording exactly — it looks for `student`/`öğrenci`/`no`, `handle`/`takma`,
`code`/`kod`, `answer`/`cevap`.

---

## 5 · When something is wrong

| what happened | what to do |
|---|---|
| The page will not load | Use the other copy — local file if the web page is down, web page if you cannot find the file. Remember the totals do not follow you; restore a backup if you need them that day. |
| Header says *no rounds banked* but it shouldn't | Wrong browser, or storage cleared. **Totals → restore / merge a backup.** Never re-mark old rounds by hand. |
| A red ✕ in the checks | The line names what failed. A missing stylesheet means the folder was copied without `console.css`; a storage failure means a private window or blocked site data. |
| The room has no network | The console itself needs none — it runs entirely offline. The **students** need it for the Form. Run the round anyway, reveal the answer, and score it as a show of hands; no points that round. |
| No projector | Run it from the board: read the question aloud, write the numbers up, read the code. Everything else is unchanged. |
| You marked a round against the wrong sheet | **Totals → Rounds banked → remove**, then mark it again. The points go with it. |
| A student says they submitted but is not listed | Almost always the wrong code, or a second submission — only the first counts. Both are visible in the sheet. |

---

## 6 · The habit that matters most

After banking each round: **Totals → backup (JSON)**, and keep the file somewhere that
is not that one browser. Two seconds.

The totals live in one browser on one machine. Everything else in this system can be
reconstructed — the questions are seeded by their codes, the marking is deterministic,
the console is in git. The banked rounds are the only thing that exists in exactly one
place, and week 6 is a long way from week 2.
