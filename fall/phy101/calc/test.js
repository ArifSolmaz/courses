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

  /* --------------------------------- 2b. every trap is unmistakably wrong */
  section("2b. no trap sits close enough to the answer to be mistaken for it");
  const margin = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES;
    const bad = [];
    for (const ch of CH) {
      const want = ch.minMargin == null ? window.CALC_MIN_MARGIN : ch.minMargin;
      let worst = Infinity, worstAt = null;
      for (let code = 1000; code < 4000; code++) {
        const p = C.paramsFor(ch, code);
        const m = window.CALC_TRAP_MARGIN(ch, p);
        if (m < worst) { worst = m; worstAt = { code, p }; }
      }
      if (want > 0 && worst < want) {
        bad.push(ch.id + ": closest trap " + (worst * 100).toFixed(2) + "% away at code "
          + worstAt.code + " " + JSON.stringify(worstAt.p));
      }
      /* and the exemption must be deliberate, not an accident of omission */
      if (want === 0 && ch.mark !== "sf3") {
        bad.push(ch.id + ": exempt from the margin rule but not marked by significant figures");
      }
    }
    return bad;
  });
  ok(margin.length === 0,
     "3000 draws each: every trap is a Math ERROR, opposite in sign, or >=15% away",
     margin.slice(0, 3).join(" | "));

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
    localStorage.removeItem("phy101-calc-v2");
    const C = window.CALC_CONSOLE;
    /* the score pane still holds the round from the previous step */
    document.getElementById("btn-score").click();
    const add = [...document.querySelectorAll("#s-out button")]
      .find(b => /term totals/i.test(b.textContent));
    add.click();
    const first = JSON.parse(localStorage.getItem("phy101-calc-v2"));
    /* a second click must be refused, not double-counted */
    const realAlert = window.alert; let alerted = false;
    window.alert = () => { alerted = true; };
    document.getElementById("btn-score").click();
    [...document.querySelectorAll("#s-out button")]
      .find(b => /term totals/i.test(b.textContent)).click();
    window.alert = realAlert;
    const second = JSON.parse(localStorage.getItem("phy101-calc-v2"));

    document.getElementById("tab-totals").click();
    const html = document.getElementById("t-out").innerHTML;
    /* If the table is missing entirely something upstream broke; say which,
       rather than throwing on a null element. */
    const cell = () => document.querySelector("#t-out .id-col");
    const noTable = !cell();
    const idsHidden = noTable ? false : getComputedStyle(cell()).display === "none";
    if (!noTable) document.getElementById("btn-ids").click();
    const idsShown = noTable ? false : getComputedStyle(cell()).display !== "none";
    if (!noTable) document.getElementById("btn-ids").click();

    return {
      rounds: first.results.length,
      students: Object.keys(C.totals()).length,
      nova: C.totals()["2201"],
      refused: alerted && JSON.stringify(first.results) === JSON.stringify(second.results),
      idsHidden, idsShown,
      noTable,
      totalsShowHandle: html.indexOf("Nova") >= 0,
      /* the rows themselves must be kept, not just their sum - that is what
         makes a backup restorable and a merge exact */
      keepsRows: first.results[0].rows.length === 9
                 && first.results[0].rows.every(r => "sid" in r && "points" in r),
      /* and the header must say how many rounds are banked, all term */
      headerSays: document.getElementById("banked").textContent
    };
  });
  ok(bank.rounds === 1 && bank.students === 9, "one round banked for nine students",
     JSON.stringify([bank.rounds, bank.students]));
  ok(bank.nova && bank.nova.points === 13 && bank.nova.correct === 1 && bank.nova.attempts === 1,
     "the top scorer's record is right", JSON.stringify(bank.nova));
  ok(bank.refused, "banking the same round twice is refused, not double-counted");
  ok(!bank.noTable, "the totals table rendered at all");
  ok(bank.idsHidden, "the totals tab hides student IDs until asked");
  ok(bank.idsShown, "and reveals them on request");
  ok(bank.totalsShowHandle, "the totals table is keyed to handles on screen");
  ok(bank.keepsRows, "the round's individual rows are stored, not only their sum");
  ok(/1 round banked/.test(bank.headerSays),
     "the header reports how many rounds this browser holds", bank.headerSays);

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
    localStorage.removeItem("phy101-calc-v2");
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

  /* ------------------- 7c. the term: unique codes, backup, restore, merge */
  section("7c. surviving five weeks - unique codes, and a backup you can load back");
  const term = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    localStorage.removeItem("phy101-calc-v2");
    location.reload();
  });
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CONSOLE.db().results.length === 0);
  const term2 = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    const out = {};

    /* --- a code must never repeat across the term. Play a lot of rounds and
       check every code drawn is new, because marking filters by code alone. */
    const codes = [];
    for (let i = 0; i < 120; i++) {
      g("btn-new").click();
      g("btn-reveal").click();                 /* revealing is what records it */
      codes.push(+g("q-code").textContent);
    }
    out.codesDrawn = codes.length;
    out.codesDistinct = new Set(codes).size;

    /* Every code ever drawn must stay recognised - including the first, long
       after the played-round list (capped at 80) has forgotten it. That cap is
       why the ledger is separate. Read these BEFORE the corner case below,
       which deliberately rewrites the ledger: an earlier version of this test
       measured them afterwards and so measured nothing. */
    out.knowsUsed = C.codeUsed(codes[0]) === true;
    out.knowsAll = codes.every(c => C.codeUsed(c) === true);
    out.historyCapped = C.db().history.length <= 80;
    out.ledgerKeepsAll = C.db().codes.length >= 120;

    /* 120 random draws from 9000 collide only about half the time, so counting
       distinct codes is not evidence on its own. Corner the mechanism instead:
       mark all but one code as used and check the next draw is that one. This
       rewrites the ledger, so it goes last. */
    const db = C.db();
    const spared = 4747;
    db.codes.length = 0;
    for (let c = 1000; c <= 9999; c++) if (c !== spared) db.codes.push(c);
    g("btn-new").click();
    out.forcedCode = +g("q-code").textContent;
    out.pickedTheOnlyFreeCode = out.forcedCode === spared;

    /* --- now bank two real rounds and round-trip them through a backup */
    localStorage.removeItem("phy101-calc-v2");
    location.reload();
    return out;
  });
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CONSOLE.db().results.length === 0);
  const term3 = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    const out = {};

    function bankRound(week, idx, code, ids) {
      C.setRound(week, idx, code);
      const ch = CH.find(c => c.id === g("q-id").textContent);
      g("btn-reveal").click();
      const a = ch.answer(C.paramsFor(ch, code));
      const rows = ["Timestamp,Student ID,Handle,Variant code,Your answer"];
      ids.forEach((sid, i) => rows.push(
        `2026/03/0${week} 10:3${i}:00,${sid},H${sid},${code},${SF3(a)}`));
      g("tab-score").click();
      g("s-in").value = rows.join("\n");
      g("s-round").value = ch.id + "-" + code;
      g("btn-score").click();
      [...document.querySelectorAll("#s-out button")]
        .find(b => /term totals/i.test(b.textContent)).click();
      document.body.classList.remove("sheet-folded");
    }

    bankRound(2, 0, 1111, ["7001", "7002"]);
    bankRound(3, 0, 2222, ["7001", "7003"]);

    const backup = JSON.stringify(C.db());
    out.beforeRounds = C.db().results.length;
    out.beforeTotals = C.totals();

    /* (a) importing the very same backup must change nothing - the commonest
       real mistake is loading a backup twice */
    const again = C.importJSON(backup);
    out.reimport = again;
    out.afterReimportRounds = C.db().results.length;
    out.totalsUnchanged = JSON.stringify(C.totals()) === JSON.stringify(out.beforeTotals);

    /* (b) a wipe followed by a restore must give back exactly what was lost */
    localStorage.removeItem("phy101-calc-v2");
    location.reload();
    window.__backup = backup;
    return out;
  });
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CONSOLE.db().results.length === 0);
  const term4 = await page.evaluate(() => {
    const C = window.CALC_CONSOLE;
    const backup = sessionStorage.getItem("bk") || window.__backup;
    return { hasBackup: !!backup };
  });

  ok(term2.codesDrawn === 120 && term2.codesDistinct === 120,
     "120 rounds in a row, no code repeated once",
     term2.codesDistinct + " distinct of " + term2.codesDrawn);
  ok(term2.pickedTheOnlyFreeCode,
     "with 8999 of 9000 codes used, the next draw is the one that is free",
     "drew " + term2.forcedCode);
  ok(term2.knowsUsed && term2.knowsAll,
     "every code ever drawn stays recognised, all 120 of them");
  ok(term2.historyCapped && term2.ledgerKeepsAll,
     "the round picker is capped but the code ledger is not",
     JSON.stringify([term2.historyCapped, term2.ledgerKeepsAll]));
  ok(term3.beforeRounds === 2, "two rounds banked", term3.beforeRounds);
  ok(term3.reimport && term3.reimport.added === 0 && term3.reimport.skipped === 2,
     "importing the same backup adds nothing and skips both rounds",
     JSON.stringify(term3.reimport));
  ok(term3.totalsUnchanged,
     "so nobody's points are doubled by a second import");
  ok(term3.beforeTotals["7001"] && term3.beforeTotals["7001"].attempts === 2,
     "a student who played both rounds is counted once per round",
     JSON.stringify(term3.beforeTotals["7001"]));

  /* (c) the wipe-and-restore round trip, done in a fresh page */
  section("7d. a wipe followed by a restore returns exactly what was lost");
  const restore = await page.evaluate((backupJson) => {
    const C = window.CALC_CONSOLE;
    const before = { rounds: C.db().results.length, totals: C.totals() };
    const r = C.importJSON(backupJson);
    return {
      startedEmpty: before.rounds === 0,
      result: r,
      rounds: C.db().results.length,
      totals: C.totals(),
      headerSays: document.getElementById("banked").textContent,
      /* and the restored rounds are re-markable, not just countable */
      pickerHas: [...document.getElementById("s-round").options].map(o => o.value)
    };
  }, await page.evaluate(() => null) || null);
  /* the backup is gone with the reload, so rebuild it the same way and compare */
  const rt = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    localStorage.removeItem("phy101-calc-v2");
    location.reload();
  });
  await page.waitForFunction(() => window.CALC_CONSOLE && window.CALC_CONSOLE.db().results.length === 0);
  const rt2 = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    function bankRound(week, idx, code, ids) {
      C.setRound(week, idx, code);
      const ch = CH.find(c => c.id === g("q-id").textContent);
      g("btn-reveal").click();
      const a = ch.answer(C.paramsFor(ch, code));
      const rows = ["Timestamp,Student ID,Handle,Variant code,Your answer"];
      ids.forEach((sid, i) => rows.push(
        `2026/03/0${week} 10:3${i}:00,${sid},H${sid},${code},${SF3(a)}`));
      g("tab-score").click();
      g("s-in").value = rows.join("\n");
      g("s-round").value = ch.id + "-" + code;
      g("btn-score").click();
      [...document.querySelectorAll("#s-out button")]
        .find(b => /term totals/i.test(b.textContent)).click();
      document.body.classList.remove("sheet-folded");
    }
    bankRound(2, 0, 1111, ["7001", "7002"]);
    bankRound(3, 0, 2222, ["7001", "7003"]);
    const backup = JSON.stringify(C.db());
    const wanted = { rounds: C.db().results.length, totals: C.totals() };

    /* wipe it the way a cleared browser would */
    document.getElementById("btn-wipe");
    window.confirm = () => true;
    document.getElementById("tab-totals").click();
    document.getElementById("btn-wipe").click();
    const emptied = { rounds: C.db().results.length, totals: C.totals(),
                      header: document.getElementById("banked").textContent };

    const r = C.importJSON(backup);
    const got = { rounds: C.db().results.length, totals: C.totals(),
                  header: document.getElementById("banked").textContent };
    return {
      wanted, emptied, r, got,
      identical: JSON.stringify(got.totals) === JSON.stringify(wanted.totals)
                 && got.rounds === wanted.rounds,
      /* a v1-style backup must be refused rather than silently mismerged */
      codesRestored: C.codeUsed(1111) && C.codeUsed(2222),
      /* A code drawn but never banked exists only in the ledger. If the import
         does not merge it, the other machine can draw it again - and only then
         do two rounds share a code. */
      orphanCodeRestored: (function () {
        var r = C.importJSON(JSON.stringify({ v: 2, results: [{
          key: "W5-C1-3939", id: "W5-C1", code: 3939, at: "2026-04-01 10:00",
          rows: [{ sid: "8001", handle: "Z", points: 10, ok: true }] }],
          history: [], codes: [3939, 8888] }));
        var ok = r.added === 1 && C.codeUsed(8888) === true;
        /* put the store back: the next section counts the rounds it can see */
        var db = C.db();
        db.results = db.results.filter(function (q) { return q.key !== "W5-C1-3939"; });
        return ok;
      })(),
      /* and specifically in the ledger, not merely inferable from the restored
         rounds - the ledger is what protects codes from rounds long since
         dropped from the picker */
      ledgerRestored: C.db().codes.indexOf(1111) >= 0 && C.db().codes.indexOf(2222) >= 0,
      oldRefused: !!C.importJSON(JSON.stringify({ totals: { "1": { points: 99 } } })).err,
      junkRefused: !!C.importJSON("not json at all").err,
      emptyRefused: !!C.importJSON(JSON.stringify({ results: [] })).err
    };
  });
  ok(rt2.emptied.rounds === 0 && /no rounds banked/.test(rt2.emptied.header),
     "clearing really empties it, and the header says so", JSON.stringify(rt2.emptied));
  ok(rt2.r.added === 2, "the backup restores both rounds", JSON.stringify(rt2.r));
  ok(rt2.identical,
     "and the totals come back byte for byte identical to what was lost",
     JSON.stringify([rt2.wanted.totals, rt2.got.totals]));
  ok(rt2.orphanCodeRestored,
     "a code drawn on another machine but never banked is merged too");
  ok(rt2.codesRestored && rt2.ledgerRestored,
     "and the used-code ledger travels with it, so the codes cannot be re-drawn",
     JSON.stringify([rt2.codesRestored, rt2.ledgerRestored]));
  ok(rt2.oldRefused, "an older backup holding only summed totals is refused, not mismerged");
  ok(rt2.junkRefused, "an unreadable file is refused with a message");
  ok(rt2.emptyRefused, "a file with no rounds in it is refused");

  /* --------------------- 7e. removing a round that was marked by mistake */
  section("7e. removing one round takes its points with it");
  const rm = await page.evaluate(() => {
    const C = window.CALC_CONSOLE;
    const g = id => document.getElementById(id);
    window.confirm = () => true;
    g("tab-totals").click();
    const before = { rounds: C.db().results.length, totals: C.totals() };
    const buttons = [...document.querySelectorAll("#t-out .roundlist button")];
    const target = C.db().results[0];                 /* the older of the two */
    /* the list is newest-first, so the last button is the oldest round */
    buttons[buttons.length - 1].click();
    const after = { rounds: C.db().results.length, totals: C.totals() };
    /* and it must be gone from storage too, not just the screen */
    const stored = JSON.parse(localStorage.getItem("phy101-calc-v2"));
    return {
      buttons: buttons.length,
      removedId: target.id,
      before, after,
      stillStored: stored.results.some(r => r.key === target.key),
      /* a student who only played the removed round must be gone entirely */
      lostStudent: Object.keys(before.totals).filter(k => !(k in after.totals)),
      /* one who played both keeps only the surviving round's points */
      survivor: after.totals["7001"]
    };
  });
  ok(rm.buttons === 2, "each banked round gets its own remove button", rm.buttons);
  ok(rm.after.rounds === 1, "removing one leaves the other", JSON.stringify(rm.after.rounds));
  ok(rm.stillStored === false, "and it is gone from storage, not only from the screen");
  ok(rm.survivor && rm.survivor.attempts === 1 && rm.survivor.points === 13,
     "a student who played both rounds keeps only the surviving round's points",
     JSON.stringify(rm.survivor));
  ok(rm.lostStudent.length === 1,
     "and a student who only played the removed round drops off the table",
     JSON.stringify(rm.lostStudent));

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
    localStorage.removeItem("phy101-calc-v2");
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
    const totalsCheck = after.find(r => /term totals/.test(r.name));
    return { ...out, failed, healthyAgain: after.every(r => r.ok),
             noteNotFailure: !!(totalsCheck && totalsCheck.ok && totalsCheck.note
                                && totalsCheck.detail),
             noteDetail: totalsCheck && totalsCheck.detail,
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
  ok(chk.noteNotFailure,
     "an informational check (no rounds banked yet) passes with a remark, not a cross",
     JSON.stringify(chk.noteDetail));
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
