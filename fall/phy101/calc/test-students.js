/* Checks on students.html — the page the students actually read.
   Run:  node test-students.js
   Exit code 0 = all passed.  Everything is measured in a real browser, because
   the failures worth catching here (a placeholder left on screen, one language
   leaking into the other, a config value that silently does nothing) are all
   things that look fine in the source. */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const SRC = fs.readFileSync(path.join(__dirname, "students.html"), "utf8");
let pass = 0, fail = 0;

function ok(name, cond, detail) {
  if (cond) { pass++; console.log("  ok   " + name); }
  else { fail++; console.log("  FAIL " + name + (detail ? "  — " + detail : "")); }
}

/* Serve a copy with STUDENT_PAGE rewritten, so every permutation is tested
   against the real file rather than a re-implementation of it. */
function withConfig(cfg) {
  const re = /var STUDENT_PAGE = \{[\s\S]*?\};/;
  if (!re.test(SRC)) throw new Error("STUDENT_PAGE block not found — test is stale");
  return SRC.replace(re, "var STUDENT_PAGE = " + JSON.stringify(cfg) + ";");
}

async function load(page, cfg) {
  await page.setContent(withConfig(cfg), { waitUntil: "load" });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

  /* ------------------------------------------------- 1 · the form link */
  console.log("\nthe form link");

  await load(page, { formUrl: "", attempt: "first", show: "id" });
  let box = await page.locator("#form-tr").innerHTML();
  ok("empty formUrl leaves no dead button",
     !/<a\b/i.test(box), box.slice(0, 80));
  ok("empty formUrl says where the link is",
     /slayt/i.test(box));
  ok("no href=\"#\" survives anywhere",
     (await page.locator('a[href="#"]').count()) === 0);

  await load(page, { formUrl: "https://forms.gle/abc123", attempt: "first", show: "id" });
  ok("a set formUrl becomes the button's href",
     (await page.locator("#form-link-tr").getAttribute("href")) === "https://forms.gle/abc123");
  ok("...in English too",
     (await page.locator("#form-link-en").getAttribute("href")) === "https://forms.gle/abc123");

  /* A half-pasted link must not become a relative link to a page that does not
     exist — that would 404 on GitHub Pages and look like the form is broken. */
  await load(page, { formUrl: "forms.gle/abc123", attempt: "first", show: "id" });
  ok("a link without a scheme is refused, not linked",
     (await page.locator("#form-tr a").count()) === 0);

  /* ------------------------------------------- 2 · the attempt policy */
  console.log("\nwhich attempt counts");

  const attemptWords = {
    first: { tr: /ilk gönderin/i, en: /first submission/i },
    last:  { tr: /son gönderin/i, en: /last submission/i },
    best:  { tr: /ilk doğru cevabın/i, en: /first correct answer/i },
  };
  for (const key of ["first", "last", "best"]) {
    await load(page, { formUrl: "", attempt: key, show: "id" });
    const tr = await page.locator("#rule-attempt-tr").innerText();
    const en = await page.locator("#rule-attempt-en").innerText();
    ok('attempt "' + key + '" — Turkish says so', attemptWords[key].tr.test(tr), tr);
    ok('attempt "' + key + '" — English says so', attemptWords[key].en.test(en), en);
    /* The three must actually differ; a copy-paste slip that gives two policies
       the same sentence would pass a looser test. */
    for (const other of ["first", "last", "best"]) {
      if (other === key) continue;
      ok('attempt "' + key + '" differs from "' + other + '" (TR)',
         !attemptWords[other].tr.test(tr));
    }
  }

  await load(page, { formUrl: "", attempt: "nonsense", show: "id" });
  ok("an unknown attempt value falls back to 'first', not to blank",
     /ilk gönderin/i.test(await page.locator("#rule-attempt-tr").innerText()));

  /* ------------------------------------------ 3 · what goes on screen */
  console.log("\nwhat the projector shows");

  await load(page, { formUrl: "", attempt: "first", show: "id" });
  let trShow = await page.locator("#show-tr").innerText();
  let enShow = await page.locator("#show-en").innerText();
  ok("show:id promises student numbers (TR)", /öğrenci numara/i.test(trShow), trShow);
  ok("show:id promises student numbers (EN)", /student number/i.test(enShow), enShow);
  ok("show:id does NOT promise a nickname (TR)", !/takma ad/i.test(trShow), trShow);
  ok("show:id does NOT promise a nickname (EN)", !/nickname/i.test(enShow), enShow);

  await load(page, { formUrl: "", attempt: "first", show: "alias" });
  trShow = await page.locator("#show-tr").innerText();
  enShow = await page.locator("#show-en").innerText();
  ok("show:alias promises a nickname (TR)", /takma ad/i.test(trShow), trShow);
  ok("show:alias promises a nickname (EN)", /nickname/i.test(enShow), enShow);
  /* The claim that matters legally: with aliases on, the page must say the
     number does not appear. This sentence went stale once already in the
     README, so it is asserted here. */
  ok("show:alias states the number does not appear (TR)",
     /numaras[ıi] görünmez/i.test(trShow), trShow);
  ok("show:alias states the number does not appear (EN)",
     /no student number appears/i.test(enShow), enShow);

  /* ---------------------------------------------- 4 · the two languages */
  console.log("\nlanguage");

  await load(page, { formUrl: "https://forms.gle/x", attempt: "first", show: "id" });
  ok("Turkish is the default", await page.locator("#tr").isVisible());
  ok("English starts hidden", !(await page.locator("#en").isVisible()));
  ok("the button offers the other language", (await page.locator("#btn-lang").innerText()) === "English");
  ok("html lang follows", (await page.locator("html").getAttribute("lang")) === "tr");

  await page.locator("#btn-lang").click();
  ok("after the click English shows", await page.locator("#en").isVisible());
  ok("...and Turkish is gone", !(await page.locator("#tr").isVisible()));
  ok("...and the button offers Turkish back",
     (await page.locator("#btn-lang").innerText()) === "Türkçe");
  ok("...and html lang follows", (await page.locator("html").getAttribute("lang")) === "en");

  /* Nothing Turkish may be visible on the English page. Checked on rendered
     text rather than the source, because `hidden` is what actually decides it. */
  let vis = await page.evaluate(() => document.body.innerText);
  ok("no Turkish leaks into the English view",
     !/(Kurallar|Puanlar|hocana|öğrenci numaran)/i.test(vis), vis.slice(0, 120));
  ok("the English footer is the visible one",
     /whole term/i.test(vis) && !/dönem boyunca/i.test(vis));

  await page.locator("#btn-lang").click();
  vis = await page.evaluate(() => document.body.innerText);
  ok("and no English leaks back into the Turkish view",
     !/(The rules|Points|your instructor)/i.test(vis), vis.slice(0, 120));

  /* ------------------------------------------------- 5 · the substance */
  console.log("\nthe rules as stated");

  await load(page, { formUrl: "", attempt: "first", show: "id" });
  /* Read each language while it is the VISIBLE one. innerText on a hidden
     subtree silently degrades to textContent, which runs table cells together
     — "inside the time10First correct" — so a \b-anchored search for the
     points misses. That exact trap has bitten this project once before. */
  const trText = await page.evaluate(() => document.body.innerText);
  await page.locator("#btn-lang").click();
  const enText = await page.evaluate(() => document.body.innerText);
  await page.locator("#btn-lang").click();
  ok("the Turkish text was read while visible", /Kurallar/.test(trText));
  ok("the English text was read while visible", /The rules/.test(enText));

  /* These numbers are the contract with README §5 and challenges.js. If either
     changes, this page must change with it, and this is what notices. */
  ok("3 sig figs stated (TR)", /üç anlamlı rakam/i.test(trText));
  ok("3 sig figs stated (EN)", /three significant figures/i.test(enText));
  ok("g = 9,81 stated (TR)", /9,81/.test(trText), "Turkish decimal comma");
  ok("g = 9.81 stated (EN)", /9\.81/.test(enText));
  ok("1 % tolerance stated (TR)", /%1/.test(trText));
  ok("1 % tolerance stated (EN)", /1 %/.test(enText));
  ok("wrong code = not marked (TR)", /değerlendirilmez/i.test(trText));
  ok("wrong code = not marked (EN)", /not marked/i.test(enText));
  ok("decimal comma accepted (TR)", /17,3/.test(trText));
  ok("decimal comma accepted (EN)", /17,3/.test(enText));
  /* The parser strips units, so a student who types them is not punished — but
     the page must not invite it either, and must never tell them to. */
  ok("no units, just the number (TR)", /Birim yazma/i.test(trText), trText.slice(0, 80));
  ok("no units, just the number (EN)", /No units/i.test(enText), enText.slice(0, 80));
  ok("the page never asks for a unit (TR)", !/birimi(ni)? (de )?yaz/i.test(trText));
  ok("the page never asks for a unit (EN)", !/write the unit/i.test(enText));
  ok("exponent notation is allowed (TR)", /6\.2e-4/.test(trText));
  ok("exponent notation is allowed (EN)", /6\.2e-4/.test(enText));

  for (const [lang, text] of [["TR", trText], ["EN", enText]]) {
    ok("points 10 / +3 / +2 / +1 all present (" + lang + ")",
       /\b10\b/.test(text) && /\+3/.test(text) && /\+2/.test(text) && /\+1/.test(text));
    ok("a fast wrong answer is stated to score 0 (" + lang + ")", /\b0\b/.test(text));
  }

  /* ----------------------------------------------- 6 · fit and finish */
  console.log("\nfit and finish");

  ok("no template placeholder left in the file",
     !/(TODO|FIXME|XXX|lorem ipsum|PUT YOUR)/i.test(SRC));

  /* At 420 px — a phone in the lecture hall, which is where this is read. */
  let overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok("no horizontal scroll at 420 px", overflow <= 0, "overflow " + overflow + "px");

  await page.setViewportSize({ width: 1280, height: 900 });
  overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok("no horizontal scroll at 1280 px", overflow <= 0, "overflow " + overflow + "px");

  /* Body text must survive a projector and a phone alike. */
  const fs_ = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector("#tr p")).fontSize));
  ok("body text is at least 16 px", fs_ >= 16, fs_ + "px");

  /* The page must not need the network to be readable — no stylesheet link, no
     script src. It is opened on a phone in a lecture hall. */
  ok("no external stylesheet", !/<link[^>]+stylesheet/i.test(SRC));
  ok("no external script", !/<script[^>]+src=/i.test(SRC));

  /* Dark mode must not leave text on a same-coloured background. */
  await page.emulateMedia({ colorScheme: "dark" });
  const colors = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return [b.color, b.backgroundColor];
  });
  ok("dark mode changes the background off white",
     colors[1] !== "rgb(251, 250, 248)" && colors[1] !== "rgba(0, 0, 0, 0)", colors.join(" on "));
  ok("dark mode text is not the background colour", colors[0] !== colors[1], colors.join(" on "));
  await page.emulateMedia({ colorScheme: "light" });

  /* --------------------------------------------- 7 · the endpoint is NOT here */
  console.log("\nnothing secret on a public page");
  ok("no script.google.com URL in the student page",
     !/script\.google\.com/i.test(SRC));
  ok("no deployment id shape in the student page",
     !/AKfyc[A-Za-z0-9_-]{20,}/.test(SRC));

  await browser.close();

  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });