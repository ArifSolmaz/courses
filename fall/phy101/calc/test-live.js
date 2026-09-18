/* The live-results path, with a fake Apps Script endpoint. Playwright serves
   the JSONP so the real request path is exercised: a script tag, a callback,
   cleanup - not a mocked function. */
const { chromium } = require("playwright");
const path = require("path");

let fails = 0, checks = 0;
function ok(c, what, extra) { checks++; if (!c) { fails++; console.log("  FAIL " + what + (extra ? "  <- " + extra : "")); } }
function section(s) { console.log("\n" + s); }

const EP = "https://fake-endpoint.test/exec";

(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));

  /* the fake endpoint: behaviour switched by a variable the test sets */
  let MODE = "ok", ROWS = [], SEEN = [];
  await page.route("https://fake-endpoint.test/**", async (route) => {
    const url = new URL(route.request().url());
    const cb = url.searchParams.get("callback");
    const code = url.searchParams.get("code");
    SEEN.push({ code, key: url.searchParams.get("key") });
    if (MODE === "network") return route.abort();
    let body;
    if (MODE === "refuse") body = { ok: false, error: "bad key" };
    else if (MODE === "nocols") body = { ok: false, error: "could not find the student / code / answer columns", headings: ["a","b"] };
    else body = { ok: true, code, rows: ROWS.filter(r => String(r.code) === String(code)), n: ROWS.length };
    await route.fulfill({
      status: 200, contentType: "text/javascript",
      body: cb + "(" + JSON.stringify(body) + ");"
    });
  });

  await page.goto("file://" + path.join(__dirname, "index.html"));
  await page.waitForFunction(() => window.CALC_CONSOLE);

  section("1. connecting");
  const conn = await page.evaluate(async (ep) => {
    const C = window.CALC_CONSOLE, g = id => document.getElementById(id);
    C.saveLive(ep, "");
    return await new Promise(res => C.liveFetch(1234, (err, data) => res({ err, data })));
  }, EP);
  ok(!conn.err && conn.data && conn.data.ok === true, "a JSONP request reaches the endpoint and parses", conn.err);
  ok(await page.evaluate(() => document.querySelectorAll("script[src*='fake-endpoint']").length === 0),
     "and the script tag is cleaned up afterwards");

  section("2. the live counter while the clock runs");
  SEEN = [];                         /* section 1's probe is not a poll */
  const live = await page.evaluate(async (ep) => {
    const C = window.CALC_CONSOLE, g = id => document.getElementById(id);
    const code = 4242;
    C.setRound(2, 0, code);
    return { code, hiddenBefore: g("live").hidden };
  }, EP);
  await page.evaluate(() => { window.__rows = null; });
  ROWS = [ { ts: "t1", code: 4242, id: "1111", ans: "10" },
           { ts: "t2", code: 4242, id: "2222", ans: "20" } ];
  await page.evaluate(() => document.getElementById("btn-start").click());
  await page.waitForFunction(() => /\b2\b/.test(document.getElementById("live").textContent), { timeout: 8000 })
    .then(() => ok(true, "the counter shows 2 submissions within a few seconds"))
    .catch(async () => ok(false, "the counter shows 2 submissions",
      await page.evaluate(() => document.getElementById("live").textContent)));
  ROWS.push({ ts: "t3", code: 4242, id: "3333", ans: "30" });
  await page.waitForFunction(() => /\b3\b/.test(document.getElementById("live").textContent), { timeout: 9000 })
    .then(() => ok(true, "and it rises to 3 when another answer arrives"))
    .catch(async () => ok(false, "counter rises to 3",
      await page.evaluate(() => document.getElementById("live").textContent)));
  ok(SEEN.every(s => s.code === "4242"), "every poll asks only for the current round's code",
     JSON.stringify([...new Set(SEEN.map(s => s.code))]));

  section("3. REVEAL marks the round by itself");
  const marked = await page.evaluate(async () => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const g = id => document.getElementById(id);
    const ch = CH.find(c => c.id === g("q-id").textContent);
    const a = ch.answer(C.paramsFor(ch, 4242));
    return { answer: SF3(a), id: ch.id };
  });
  /* now give the endpoint real answers: two right, one trap */
  ROWS = await page.evaluate(() => {
    const C = window.CALC_CONSOLE, CH = window.CALC_CHALLENGES, SF3 = window.CALC_SF3;
    const ch = CH.find(c => c.id === document.getElementById("q-id").textContent);
    const p = C.paramsFor(ch, 4242), a = ch.answer(p), t = ch.traps[1].value(p);
    return [
      { ts: "2026/03/04 10:31:02", code: 4242, id: "1111", ans: SF3(a) },
      { ts: "2026/03/04 10:31:09", code: 4242, id: "2222", ans: String(SF3(a)).replace(".", ",") },
      { ts: "2026/03/04 10:31:20", code: 4242, id: "3333", ans: isFinite(t) ? SF3(t) : "0" }
    ];
  });
  await page.evaluate(() => document.getElementById("btn-reveal").click());
  await page.waitForFunction(() => {
    const m = document.getElementById("live-msg");
    return m && !m.hidden && /correct/.test(m.textContent);
  }, { timeout: 8000 }).catch(() => {});
  const auto = await page.evaluate(() => {
    const g = id => document.getElementById(id);
    return {
      msg: g("live-msg").textContent,
      msgOk: !/bad|could not/i.test(g("live-msg").className + g("live-msg").textContent),
      scoreText: g("s-out").textContent,
      /* the projector must still show no student numbers */
      idsOnRunPane: /\b[123]{4}\b/.test(g("pane-run").textContent)
    };
  });
  ok(/2 of 3/.test(auto.msg), "it marks without any paste: 2 of 3 correct", auto.msg);
  ok(/press/i.test(auto.msg), "and says how to show the leaderboard", auto.msg);
  ok(auto.idsOnRunPane === false, "no student number appears on the projector pane");
  const board = await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "l", bubbles: true }));
    return { onScore: !document.getElementById("pane-score").hidden,
             text: document.getElementById("s-out").textContent };
  });
  ok(board.onScore, "L opens the leaderboard");
  ok(/correct/.test(board.text) && !/\b1111\b/.test(board.text),
     "which shows aliases and marks, and no student numbers", board.text.slice(0, 80));

  section("4. when the endpoint fails, it says so and falls back");
  MODE = "network";
  const netFail = await page.evaluate(async () => {
    const g = id => document.getElementById(id);
    g("btn-new").click();                       /* fresh round, clears the message */
    g("btn-reveal").click();
    await new Promise(r => setTimeout(r, 1500));
    return { msg: g("live-msg").textContent, bad: /bad/.test(g("live-msg").className) };
  });
  ok(/could not|reach/i.test(netFail.msg) && /paste/i.test(netFail.msg),
     "a dead endpoint says what happened and points at the paste box", netFail.msg);
  ok(netFail.bad, "and is shown as an error, not as a result");

  MODE = "refuse";
  const refused = await page.evaluate(async () => {
    const g = id => document.getElementById(id);
    g("btn-new").click(); g("btn-reveal").click();
    await new Promise(r => setTimeout(r, 1200));
    return g("live-msg").textContent;
  });
  ok(/bad key/.test(refused), "a refusal from the script is reported verbatim", refused);

  MODE = "ok";
  section("5. the secret never reaches the screen");
  const secret = await page.evaluate(() => {
    const vis = ["pane-run", "pane-score", "pane-totals", "pane-check"]
      .map(id => document.getElementById(id).textContent).join(" ");
    return { leaked: vis.indexOf("fake-endpoint") >= 0,
             stored: window.CALC_CONSOLE.live.url.indexOf("fake-endpoint") >= 0 };
  });
  ok(secret.leaked === false, "the endpoint URL is on no pane that gets projected");
  ok(secret.stored, "it is held in the console's own state, for the Settings field only");

  section("6. no page errors");
  ok(errors.length === 0, "nothing threw during any of it", errors.slice(0, 2).join(" | "));

  console.log("\n" + (fails ? "FAILED " + fails + " of " + checks : "all " + checks + " checks passed"));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
