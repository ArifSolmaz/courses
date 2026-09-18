/* ============================================================================
   Tests for the calculator-challenge console.

   The point of this file is the end-to-end one: build a Google Form sheet by
   hand containing right answers, trap answers, junk, duplicates and rows from
   another round, paste it in, and check that the marking, the diagnosis and
   the points come out right. Reading the code is not evidence.
   ========================================================================= */
const { chromium } = require("playwright");
const path = require("path");

let fails = 0, checks = 0;
function ok(cond, what, extra) {
  checks++;
  if (!cond) { fails++; console.log("  FAIL " + what + (extra ? "  <- " + extra : "")); }
}
function section(s) { console.log("\n" + s); }

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.goto("file://" + path.join(__dirname, "index.html"));
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CHALLENGES);

  /* ------------------------------------------------ 1. seeding is honest */
  section("1. the variant code reproduces the numbers");
  const seed = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES;
    const out = { stable: true, restored: true, varies: 0, total: 0, sameCodeCollides: 0 };
    /* Math.random must be the real one again after every call */
    const before = Math.random;
    for (const ch of CH) {
      const a = JSON.stringify(C.paramsFor(ch, 4271));
      const b = JSON.stringify(C.paramsFor(ch, 4271));
      if (a !== b) out.stable = false;
      const c = JSON.stringify(C.paramsFor(ch, 4272));
      out.total++;
      if (a !== c) out.varies++;
    }
    if (Math.random !== before) out.restored = false;
    /* One code must drive fifteen unrelated draws, not one draw used fifteen
       times. Comparing the parameter OBJECTS cannot show this, because no two
       challenges happen to share a parameter shape - so compare the seeds
       themselves, which is the property that actually matters. */
    const seeds = new Set(CH.map(ch => C.seedFor(ch, 5555)));
    out.distinctSeedsOneCode = seeds.size;
    /* and the seed must still move with the code */
    out.seedFollowsCode = CH.every(ch => C.seedFor(ch, 5555) !== C.seedFor(ch, 5556));
    return out;
  });
  ok(seed.stable, "same code gives the same parameters every time");
  ok(seed.restored, "Math.random is put back after generating");
  ok(seed.varies === seed.total, "a new code changes the numbers",
     seed.varies + "/" + seed.total + " challenges changed");
  ok(seed.distinctSeedsOneCode === 15,
     "one code seeds fifteen different challenges differently",
     seed.distinctSeedsOneCode + " distinct seeds");
  ok(seed.seedFollowsCode, "and every challenge's seed moves when the code does");

  /* --------------------------------------------- 2. every round displays */
  section("2. every challenge renders, both languages, many codes");
  const render = await page.evaluate(() => {
    const CH = window.CALC_CHALLENGES;
    const bad = [];
    for (const ch of CH) {
      for (let n = 0; n < 40; n++) {
        const code = 1000 + Math.floor(Math.random() * 9000);
        const p = window.CALC_CONSOLE.paramsFor(ch, code);
        const a = ch.answer(p);
        if (!isFinite(a)) bad.push(ch.id + " code " + code + ": answer " + a);
        for (const fn of ["text", "text_tr"]) {
          const s = ch[fn] ? ch[fn](p) : "";
          if (!s) { bad.push(ch.id + ": no " + fn); continue; }
          if (/undefined|NaN|Infinity|\[object/.test(s)) bad.push(ch.id + " " + fn + ": " + s);
        }
        for (const t of ch.traps) {
          const tv = t.value(p);
          /* a trap may legitimately be a Math ERROR, but if it is a number it
             must be a WRONG number, or the console would mark it correct */
          if (isFinite(tv) && window.CALC_MARK(ch, p, tv)) {
            bad.push(ch.id + " code " + code + ": trap " + tv + " accepted as correct");
          }
        }
      }
    }
    return bad;
  });
  ok(render.length === 0, "15 challenges x 40 codes x 2 languages are clean",
     render.slice(0, 4).join(" | "));

  /* ----------------------------------------- 3. the messy-number parser */
  section("3. the answer parser copes with what students type");
  const nums = await page.evaluate(() => {
    const f = window.CALC_CONSOLE.parseNum;
    const good = [
      ["17.3", 17.3], ["17,3", 17.3], [" 17.3 m/s ", 17.3], ["=17.3", 17.3],
      ["1.23e3", 1230], ["1.23E3", 1230], ["2x10^3", 2000], ["2*10^3", 2000],
      ["-4.5", -4.5], ["+4.5", 4.5], [".5", 0.5], ["1,234.5", 1234.5],
      ["3.2J", 3.2], ["45°", 45], ["7", 7]
    ];
    const bad = ["", "  ", "about 17", "17-18", "abc", "?", "17.3.2", "e5", "--5"];
    const wrong = [];
    for (const [s, want] of good) {
      const got = f(s);
      if (!(Math.abs(got - want) < 1e-9)) wrong.push("accepted wrong: " + JSON.stringify(s) + " -> " + got);
    }
    for (const s of bad) if (isFinite(f(s))) wrong.push("should reject: " + JSON.stringify(s) + " -> " + f(s));
    return wrong;
  });
  ok(nums.length === 0, "24 input shapes parse as intended", nums.join(" | "));

  /* ------------------------------------------------- 4. the CSV reader */
  section("4. the CSV reader");
  const csv = await page.evaluate(() => {
    const p = window.CALC_CONSOLE.parseCSV;
    const r = p('a,b,c\n1,"two, and a half",3\n4,"say ""hi""",6\n\n7,8,9\n');
    return {
      rows: r.length,
      quoted: r[1][1],
      escaped: r[2][1],
      blankDropped: r.length === 4 && r[3][0] === "7"
    };
  });
  ok(csv.rows === 4, "blank lines dropped, rows counted", "got " + csv.rows);
  ok(csv.quoted === "two, and a half", "a comma inside quotes stays in one cell", csv.quoted);
  ok(csv.escaped === 'say "hi"', "doubled quotes unescape", csv.escaped);

  /* ------------------------------ 5. end to end: mark a fabricated round */
  section("5. end to end - paste a sheet and mark it");
  const e2e = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    /* W4-C2 (inverse trig), a definite code */
    const idx = CH.findIndex(c => c.id === "W4-C2");
    const ch = CH[idx];
    const code = 7314;
    C.setRound(4, 1, code);
    if (document.getElementById("q-id").textContent !== "W4-C2") return { err: "wrong round selected" };

    const p = C.paramsFor(ch, code);
    const a = ch.answer(p);
    const t0 = ch.traps[0].value(p), t1 = ch.traps[1].value(p);

    const rows = [
      "Timestamp,Student ID,Handle,Variant code,Your answer",
      /* The fastest hand in the room is usually wrong. This row must take no
         bonus at all, and must not push the correct ones down the ranking. */
      `2026/03/04 10:30:50,2210,Berk,${code},${isFinite(t0) ? SF3(t0) : "ERROR"}`,
      /* three correct, in time order -> bonuses 3, 2, 1 */
      `2026/03/04 10:31:02,2201,Nova,${code},${SF3(a)}`,
      `2026/03/04 10:31:11,2202,"Kaya, the swift",${code},${(+a).toFixed(4)}`,
      `2026/03/04 10:31:20,2203,Deniz,${code},${SF3(a)}`,
      /* a fourth correct: 10 points, no bonus */
      `2026/03/04 10:31:40,2204,Ege,${code},${SF3(a)}`,
      /* the two traps, which must be diagnosed by name */
      `2026/03/04 10:31:25,2205,Mira,${code},${isFinite(t0) ? SF3(t0) : "ERROR"}`,
      `2026/03/04 10:31:26,2206,Aras,${code},${isFinite(t1) ? SF3(t1) : "ERROR"}`,
      /* junk, and a blank */
      `2026/03/04 10:31:30,2207,Yigit,${code},no idea`,
      `2026/03/04 10:31:31,2208,Sude,${code},`,
      /* a second attempt by a student who was already right - must be ignored */
      `2026/03/04 10:33:00,2201,Nova,${code},${SF3(a)}`,
      /* a row from a DIFFERENT round - must be ignored entirely */
      `2026/03/04 09:00:00,2209,Other,1234,${SF3(a)}`
    ].join("\n");

    document.getElementById("s-in").value = rows;
    document.getElementById("tab-score").click();
    document.getElementById("btn-score").click();

    const res = C.scoreRows(C.parseCSV(rows));
    const by = {};
    (res.rows || []).forEach(r => { by[r.id] = r; });
    const html = document.getElementById("s-out").innerHTML;

    return {
      counted: (res.rows || []).length,
      nOk: res.nOk,
      pts: { "2201": by["2201"] && by["2201"].points, "2202": by["2202"] && by["2202"].points,
             "2203": by["2203"] && by["2203"].points, "2204": by["2204"] && by["2204"].points,
             "2205": by["2205"] && by["2205"].points, "2210": by["2210"] && by["2210"].points },
      trapDiag: [by["2205"] && by["2205"].trap, by["2206"] && by["2206"].trap],
      otherRound: !!by["2209"],
      handleWithComma: by["2202"] && by["2202"].handle,
      htmlHasHandle: html.indexOf("Nova") >= 0,
      htmlHasId: html.indexOf("2201") >= 0,
      /* The earlier version of this check looked only inside the results
         table, and missed that the pasted sheet - every student ID in it -
         was still sitting on the projector above the table. Ask the question
         the room can answer: is an ID VISIBLE anywhere on this pane? */
      idVisibleOnPane: (function () {
        var pane = document.getElementById("pane-score");
        function visibleText(node) {
          var out = "";
          for (var i = 0; i < node.childNodes.length; i++) {
            var c = node.childNodes[i];
            if (c.nodeType === 3) { out += c.nodeValue; continue; }
            if (c.nodeType !== 1) continue;
            var st = getComputedStyle(c);
            if (st.display === "none" || st.visibility === "hidden") continue;
            if (c.tagName === "TEXTAREA") { out += c.value; continue; }
            out += visibleText(c);
          }
          return out;
        }
        return /\b220[1-9]\b/.test(visibleText(pane));
      })(),
      pasteBoxFolded: getComputedStyle(document.getElementById("s-in")).display === "none",
      ordinals: (function () {
        var t = document.getElementById("s-out").textContent;
        return { first: t.indexOf("1st in") >= 0, second: t.indexOf("2nd in") >= 0,
                 third: t.indexOf("3rd in") >= 0, broken: /\d(st|nd|rd)/.test(t)
                   && /2st|3st|1nd|1rd/.test(t) };
      })(),
      trapLabelShown: html.indexOf(ch.traps[0].label) >= 0,
      err: res.err || null
    };
  });
  ok(!e2e.err, "the sheet marked without complaint", e2e.err);
  ok(e2e.counted === 9, "9 distinct students counted, the repeat and the other round dropped",
     "got " + e2e.counted);
  ok(e2e.nOk === 4, "four correct", "got " + e2e.nOk);
  ok(e2e.pts["2201"] === 13 && e2e.pts["2202"] === 12 && e2e.pts["2203"] === 11,
     "first three correct get 13 / 12 / 11",
     JSON.stringify(e2e.pts));
  ok(e2e.pts["2204"] === 10, "a later correct answer gets the flat 10", e2e.pts["2204"]);
  ok(e2e.pts["2205"] === 0, "a trap answer scores nothing", e2e.pts["2205"]);
  ok(e2e.pts["2210"] === 0,
     "being first means nothing if the answer is wrong - no speed bonus for a trap",
     e2e.pts["2210"]);
  ok(e2e.trapDiag[0] === 0 && e2e.trapDiag[1] === 1,
     "each wrong answer is matched to the keystroke that caused it",
     JSON.stringify(e2e.trapDiag));
  ok(e2e.otherRound === false, "a row from another round is never marked");
  ok(e2e.handleWithComma === "Kaya, the swift", "a handle containing a comma survives",
     e2e.handleWithComma);
  ok(e2e.htmlHasHandle && !e2e.htmlHasId,
     "the projected table shows handles and NO student IDs",
     "handle " + e2e.htmlHasHandle + ", id " + e2e.htmlHasId);
  ok(e2e.trapLabelShown, "the wrong-answer diagnosis reaches the screen");
  ok(e2e.pasteBoxFolded, "the pasted sheet folds away once the round is marked");
  ok(e2e.idVisibleOnPane === false,
     "no student ID is visible anywhere on the pane that gets projected");
  ok(e2e.ordinals.first && e2e.ordinals.second && e2e.ordinals.third
       && !e2e.ordinals.broken,
     "the podium reads 1st / 2nd / 3rd", JSON.stringify(e2e.ordinals));

  /* --------------------------------------- 6. totals, and the duplicate guard */
  section("6. banking a round into the totals");
  const bank = await page.evaluate(() => {
    localStorage.removeItem("phy101-calc-v1");
    const C = window.CALC_CONSOLE;
    /* the score pane still holds the round from the previous step */
    document.getElementById("btn-score").click();
    const add = [...document.querySelectorAll("#s-out button")]
      .find(b => /term totals/i.test(b.textContent));
    add.click();
    const first = JSON.parse(localStorage.getItem("phy101-calc-v1"));
    /* a second click must be refused, not double-counted */
    const realAlert = window.alert; let alerted = false;
    window.alert = () => { alerted = true; };
    document.getElementById("btn-score").click();
    [...document.querySelectorAll("#s-out button")]
      .find(b => /term totals/i.test(b.textContent)).click();
    window.alert = realAlert;
    const second = JSON.parse(localStorage.getItem("phy101-calc-v1"));

    document.getElementById("tab-totals").click();
    const html = document.getElementById("t-out").innerHTML;
    const idsHidden = getComputedStyle(document.querySelector("#t-out .id-col")).display === "none";
    document.getElementById("btn-ids").click();
    const idsShown = getComputedStyle(document.querySelector("#t-out .id-col")).display !== "none";
    document.getElementById("btn-ids").click();

    return {
      rounds: first.rounds.length,
      students: Object.keys(first.totals).length,
      nova: first.totals["2201"],
      refused: alerted && JSON.stringify(first.totals) === JSON.stringify(second.totals),
      idsHidden, idsShown,
      totalsShowHandle: html.indexOf("Nova") >= 0
    };
  });
  ok(bank.rounds === 1 && bank.students === 9, "one round banked for nine students",
     JSON.stringify([bank.rounds, bank.students]));
  ok(bank.nova && bank.nova.points === 13 && bank.nova.correct === 1 && bank.nova.attempts === 1,
     "the top scorer's record is right", JSON.stringify(bank.nova));
  ok(bank.refused, "banking the same round twice is refused, not double-counted");
  ok(bank.idsHidden, "the totals tab hides student IDs until asked");
  ok(bank.idsShown, "and reveals them on request");
  ok(bank.totalsShowHandle, "the totals table is keyed to handles on screen");

  /* --------------------------------------------- 7. clock, reveal, shortcuts */
  section("7. the clock, the reveal and the keyboard");
  await page.evaluate(() => { document.getElementById("tab-run").click(); });
  const clock = await page.evaluate(async () => {
    const C = window.CALC_CONSOLE;
    C.setRound(3, 0, 8642);
    const g = id => document.getElementById(id);
    const out = {};
    out.startLabel = g("btn-start").textContent;
    out.hiddenBefore = g("reveal").hidden;
    g("btn-start").click();
    out.runningLabel = g("btn-start").textContent;
    await new Promise(r => setTimeout(r, 2200));
    out.ticked = g("clock").textContent;
    out.barShrank = parseFloat(g("bar").style.width) < 100;
    g("btn-reveal").click();
    out.hiddenAfter = g("reveal").hidden;
    out.pausedOnReveal = g("btn-start").textContent !== "PAUSE";
    out.answerShown = g("r-answer").textContent.trim();
    out.trapCards = document.querySelectorAll("#r-traps .trap").length;
    /* the reveal must actually be the answer to the displayed numbers */
    const ch = window.CALC_CHALLENGES.find(c => c.id === g("q-id").textContent);
    const p = C.paramsFor(ch, 8642);
    out.answerMatches = out.answerShown.indexOf(window.CALC_SF3(ch.answer(p))) === 0;
    /* 'n' must draw new numbers and clear the reveal */
    const codeBefore = g("q-code").textContent;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true }));
    out.codeChanged = g("q-code").textContent !== codeBefore;
    out.revealCleared = g("reveal").hidden;
    out.clockReset = g("clock").textContent === "2:00";
    /* a digit jumps weeks */
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "5", bubbles: true }));
    out.weekJumped = g("q-id").textContent.indexOf("W5") === 0;
    /* and typing in the paste box must NOT trigger shortcuts */
    g("tab-score").click();
    const ta = g("s-in"); ta.focus();
    const codeNow = g("q-code").textContent;
    ta.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true }));
    out.shortcutSuppressed = g("q-code").textContent === codeNow;
    g("tab-run").click();
    return out;
  });
  ok(clock.startLabel === "START", "the clock starts at START", clock.startLabel);
  ok(clock.runningLabel === "PAUSE", "and offers PAUSE while running", clock.runningLabel);
  ok(clock.ticked !== "2:00" && clock.barShrank, "it counts down and the bar follows",
     clock.ticked);
  ok(clock.hiddenBefore && !clock.hiddenAfter, "the answer is hidden until REVEAL");
  ok(clock.pausedOnReveal, "revealing stops the clock");
  ok(clock.answerMatches, "the revealed answer belongs to the numbers on screen",
     clock.answerShown);
  ok(clock.trapCards === 2, "both wrong-keystroke cards appear", clock.trapCards);
  ok(clock.codeChanged && clock.revealCleared && clock.clockReset,
     "'n' draws new numbers, hides the answer and resets the clock");
  ok(clock.weekJumped, "a digit key jumps to that week");
  ok(clock.shortcutSuppressed, "shortcuts do not fire while typing in the paste box");

  /* -------------- 7b. a round can still be marked after the numbers move on */
  section("7b. marking a round that has already been replaced on screen");
  const hist = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    localStorage.removeItem("phy101-calc-v1");
    location.reload();
  });
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CONSOLE.db().history.length === 0);
  const hist2 = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);

    /* play W2-C2 with code 4400 and reveal it, which is what makes it a round */
    C.setRound(2, 1, 4400);
    const chA = CH.find(c => c.id === g("q-id").textContent);
    g("btn-reveal").click();
    const ansA = chA.answer(C.paramsFor(chA, 4400));

    /* play a second round, so the first one is off the screen entirely */
    C.setRound(2, 2, 9100);
    const chB = CH.find(c => c.id === g("q-id").textContent);
    g("btn-reveal").click();
    const ansB = chB.answer(C.paramsFor(chB, 9100));

    /* then draw fresh numbers, as he would at the start of the next class */
    g("btn-new").click();
    const liveCode = g("q-code").textContent;

    /* now mark the FIRST round from one sheet holding both */
    const rows = [
      "Timestamp,Student ID,Handle,Variant code,Your answer",
      `2026/03/04 10:31:02,3301,Alp,4400,${SF3(ansA)}`,
      `2026/03/04 10:31:09,3302,Bora,4400,${SF3(ansA)}`,
      `2026/03/04 10:44:02,3303,Ceren,9100,${SF3(ansB)}`
    ].join("\n");
    g("tab-score").click();
    g("s-in").value = rows;

    const sel = g("s-round");
    const options = [...sel.options].map(o => o.value);
    sel.value = chA.id + "-4400";
    g("btn-score").click();
    const first = g("s-out").textContent;

    /* and then the second round, from the very same paste */
    document.body.classList.remove("sheet-folded");
    sel.value = chB.id + "-9100";
    g("btn-score").click();
    const second = g("s-out").textContent;

    return {
      remembered: options,
      liveCodeDiffers: liveCode !== "4400" && liveCode !== "9100",
      firstMarked: /2 of 2 correct/.test(first) && first.indexOf("Alp") >= 0
                   && first.indexOf("Ceren") < 0,
      secondMarked: /1 of 1 correct/.test(second) && second.indexOf("Ceren") >= 0
                    && second.indexOf("Alp") < 0,
      firstShowsRightId: first.indexOf(chA.id) >= 0,
      secondShowsRightId: second.indexOf(chB.id) >= 0
    };
  });
  ok(hist2.remembered.length === 2, "both played rounds are remembered",
     JSON.stringify(hist2.remembered));
  ok(hist2.liveCodeDiffers, "and the live code has genuinely moved on");
  ok(hist2.firstMarked,
     "the earlier round marks correctly from a sheet holding both rounds");
  ok(hist2.secondMarked, "and so does the later one, from the same paste");
  ok(hist2.firstShowsRightId && hist2.secondShowsRightId,
     "each result is labelled with the challenge it actually belongs to");

  /* --------------------------- 8. the Turkish reveal is actually Turkish */
  section("8. nothing on the reveal is left in English when TR is on");
  const lang = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES;
    const g = id => document.getElementById(id);
    const bad = [];
    /* start from English */
    if (g("btn-lang").textContent !== "TR") g("btn-lang").click();
    for (let w = 2; w <= 6; w++) {
      for (let i = 0; i < 3; i++) {
        C.setRound(w, i, 2600 + w * 10 + i);
        g("btn-reveal").click();
        const en = g("reveal").textContent;
        g("btn-lang").click();                       /* -> Turkish */
        const tr = g("reveal").textContent;
        const id = g("q-id").textContent;
        const ch = CH.find(c => c.id === id);
        if (tr === en) bad.push(id + ": reveal identical in both languages");
        /* the furniture */
        if (/the answer|the room will have produced|Accepted within/i.test(tr)) {
          bad.push(id + ": English heading survived into the Turkish reveal");
        }
        /* both trap labels */
        for (const t of ch.traps) {
          const lab = typeof t.label === "function" ? "" : t.label;
          if (lab && lab !== "Math ERROR" && tr.indexOf(lab) >= 0) {
            bad.push(id + ': English label "' + lab + '" shown in Turkish mode');
          }
        }
        g("btn-lang").click();                       /* back to English */
      }
    }
    return bad;
  });
  ok(lang.length === 0, "all 15 reveals are fully translated",
     lang.slice(0, 4).join(" | "));

  /* ------------- 8b. an explanation never quotes a number nobody saw */
  section("8b. worked keystrokes quote the student's own numbers");
  const quoted = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES;
    const bad = [];
    /* Any explanation written as a function must mention a value drawn for THIS
       round; any written as a plain string must contain no number that looks
       like a drawn parameter. This is what the -12.5 / -13.5 mismatch was. */
    /* a number stands alone only if it is not part of a longer numeral:
       looking for "6" inside "3.6" is what made the first version of this
       test cry wolf */
    const standsAlone = (txt, d) => {
      const lit = String(d).replace(/[.\\+*?()[\]{}|^$]/g, m => "\\" + m);
      /* a trailing superscript makes it a power, not a quoted value: "10\u00b3"
         is the definition of a kilojoule, not somebody's drawn time of 10 s */
      return new RegExp("(?<![\\d.])" + lit + "(?![\\d.\u2070-\u209f\u00b2\u00b3\u00b9])").test(txt);
    };
    for (const ch of CH) {
      for (const t of ch.traps) {
        for (const f of ["why", "why_tr"]) {
          const v = t[f];
          if (v == null) continue;

          if (typeof v === "function") {
            /* the only property worth asserting: the wording MOVES with the
               numbers. A function that returns a constant is just a string. */
            const pa = C.paramsFor(ch, 1234), pb = C.paramsFor(ch, 8765);
            const ta = v(pa), tb = v(pb);
            if (/undefined|NaN/.test(ta + tb)) {
              bad.push(ch.id + " " + f + ": " + ta.slice(0, 70));
            }
            if (JSON.stringify(pa) !== JSON.stringify(pb) && ta === tb) {
              bad.push(ch.id + " " + f + ": a function, but the wording never changes");
            }
          } else {
            /* a fixed string must hold no value that is redrawn each round */
            const txt = String(v);
            if (/undefined|NaN/.test(txt)) bad.push(ch.id + " " + f + ": " + txt.slice(0, 70));
            for (let n = 0; n < 25; n++) {
              const p = C.paramsFor(ch, 1000 + Math.floor(Math.random() * 9000));
              for (const k of Object.keys(p)) {
                if (standsAlone(txt, p[k])) {
                  bad.push(ch.id + " " + f + ': fixed text contains the drawn value '
                    + k + "=" + p[k] + " - it will be wrong next round");
                }
              }
            }
          }
        }
      }
    }
    return [...new Set(bad)];
  });
  ok(quoted.length === 0, "no explanation quotes a number the room did not see",
     quoted.slice(0, 3).join(" | "));

  /* --------------------------------- 8c. the rehearsal, and the self check */
  section("8c. the dry run he does before class");
  const dry = await page.evaluate(() => {
    const C = window.CALC_CONSOLE;
    const g = id => document.getElementById(id);
    localStorage.removeItem("phy101-calc-v1");
    C.setRound(4, 0, 6100);
    const before = JSON.stringify(C.db().totals);
    g("btn-rehearse").click();
    const txt = g("s-out").textContent;
    const onScorePane = !g("pane-score").hidden;
    /* a rehearsal must be unmistakable, and must not be bankable */
    const bankButton = [...document.querySelectorAll("#s-out button")]
      .some(b => /term totals/i.test(b.textContent));
    /* and the invented IDs must not be on the screen either */
    const idOnScreen = /\b90\d\d\b/.test(txt);
    return {
      onScorePane,
      labelled: /Rehearsal/i.test(txt),
      bankButton,
      idOnScreen,
      /* 6 of the 12 rows are correct answers in various shapes; the duplicate
         and the foreign round must drop out, leaving 10 marked */
      summary: (txt.match(/(\d+) of (\d+) correct/) || []).slice(1, 3).join("/"),
      totalsUntouched: JSON.stringify(C.db().totals) === before,
      /* the keyboard route must work too, since that is what he will use */
      viaKeyboard: (function () {
        g("tab-run").click();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
        return !g("pane-score").hidden && /Rehearsal/i.test(g("s-out").textContent);
      })()
    };
  });
  ok(dry.onScorePane, "rehearsing jumps straight to the marked result");
  ok(dry.labelled, "the result is labelled a rehearsal, so it cannot be mistaken for real");
  ok(dry.bankButton === false, "a rehearsal offers no way to add itself to the totals");
  ok(dry.totalsUntouched, "and the term totals are untouched by it");
  ok(dry.summary === "5/10",
     "ten of the twelve invented rows are marked, five of them correct",
     "got " + dry.summary);
  ok(dry.idOnScreen === false, "the invented student IDs stay off the screen too");
  ok(dry.viaKeyboard, "the D key rehearses as well");

  section("8d. the self check catches a genuinely broken console");
  const chk = await page.evaluate(async () => {
    const C = window.CALC_CONSOLE;
    document.getElementById("tab-check").click();
    const clean = C.selfCheck();
    const out = { total: clean.length, failedWhenHealthy: clean.filter(r => !r.ok) };

    /* Break things one at a time and confirm the button notices. If it cannot
       fail, it is decoration, not a check. */
    const CH = window.CALC_CHALLENGES;
    const failed = {};

    /* (a) a challenge removed from the bank */
    const gone = CH.pop();
    failed.bankSize = C.selfCheck().some(r => !r.ok && /15 challenges/.test(r.name));
    CH.push(gone);

    /* (b) a challenge whose answer goes non-finite */
    const ch = CH[7], realAnswer = ch.answer;
    ch.answer = () => NaN;
    failed.badAnswer = C.selfCheck().some(r => !r.ok && /sensible question/.test(r.name));
    ch.answer = realAnswer;

    /* (c) a trap that is no longer wrong */
    const t = ch.traps[0], realValue = t.value;
    t.value = p => ch.answer(p);
    failed.badTrap = C.selfCheck().some(r => !r.ok && /marking rule/.test(r.name));
    t.value = realValue;

    /* (d) the stylesheet missing. Re-enabling a stylesheet does not take
       effect in the same task, so give the engine a tick before the final
       all-green check below - otherwise the test reports a fault of its own
       making. */
    const link = document.querySelector('link[href="console.css"]');
    link.disabled = true;
    failed.noCss = C.selfCheck().some(r => !r.ok && /stylesheet/.test(r.name));
    link.disabled = false;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    /* (e) storage refusing writes */
    const realSet = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error("denied"); };
    failed.noStorage = C.selfCheck().some(r => !r.ok && /store the running totals/.test(r.name));
    Storage.prototype.setItem = realSet;

    const after = C.selfCheck();
    return { ...out, failed, healthyAgain: after.every(r => r.ok),
             stillFailing: after.filter(r => !r.ok).map(r => r.name + " :: " + r.detail),
             rendered: document.getElementById("c-out").textContent };
  });
  ok(chk.failedWhenHealthy.length === 0,
     "a healthy console passes every check",
     JSON.stringify(chk.failedWhenHealthy.map(r => r.name + ": " + r.detail)));
  ok(/all \d+ checks passed/.test(chk.rendered), "and says so on the page", chk.rendered.slice(0, 80));
  ok(chk.failed.bankSize, "it notices a missing challenge");
  ok(chk.failed.badAnswer, "it notices an answer that stops being a number");
  ok(chk.failed.badTrap, "it notices a trap that is no longer wrong");
  ok(chk.failed.noCss, "it notices a missing stylesheet");
  ok(chk.failed.noStorage, "it notices a browser that will not store the totals");
  ok(chk.healthyAgain, "and goes green again once everything is put back",
     JSON.stringify(chk.stillFailing));

  /* ------------------------------------------------- 9. nothing threw at all */
  section("9. no page errors");
  ok(errors.length === 0, "no exceptions or console errors during the whole run",
     errors.slice(0, 3).join(" | "));

  /* screenshots for the eye check */
  await page.evaluate(() => {
    window.CALC_CONSOLE.setRound(5, 0, 4812);
    document.getElementById("btn-reveal").click();
  });
  await page.screenshot({ path: path.join(__dirname, "shot-light.png"), fullPage: true });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.screenshot({ path: path.join(__dirname, "shot-dark.png"), fullPage: true });
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => {
    document.getElementById("btn-lang").click();
    window.CALC_CONSOLE.setRound(2, 0, 3190);
    document.getElementById("btn-reveal").click();
  });
  await page.screenshot({ path: path.join(__dirname, "shot-tr.png"), fullPage: true });

  console.log("\n" + (fails ? "FAILED " + fails + " of " + checks : "all " + checks + " checks passed"));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
