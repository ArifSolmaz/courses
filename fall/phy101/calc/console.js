/* ============================================================================
   PHY101 — Calculator Challenge console
   ----------------------------------------------------------------------------
   Runs on the projector. No server, no accounts: open index.html, pick a
   challenge, press START, read the code to the room, reveal, then paste the
   Google Form sheet in to score.

   The one idea that makes the rest work: the four-digit VARIANT CODE seeds the
   random numbers. Given (challenge id, code) the parameters are reproducible
   exactly, on any machine, next year included. So nothing has to be stored
   between the question and the marking, and a student who copies last year's
   answer gets it wrong because their code is different.
   ========================================================================= */
(function () {
  "use strict";

  var CH = window.CALC_CHALLENGES, MARK = window.CALC_MARK, SF3 = window.CALC_SF3;
  /* v2 keeps each banked round's own rows instead of only the running totals.
     That is what makes a backup restorable and a merge exact: totals are
     derived, so importing a file from another machine can skip the rounds this
     browser already has instead of double-counting them. */
  var STORE = "phy101-calc-v2";

  /* ------------------------------------------------------------------ seeded
     mulberry32: small, fast, and good enough that consecutive codes do not
     produce visibly similar numbers. */
  function rng(seed) {
    var a = (seed >>> 0) + 0x6D2B79F5;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Mix the challenge id into the seed, so one code drives three unrelated
     draws within a week rather than three correlated ones. */
  function seedFor(ch, code) {
    var s = code >>> 0;
    for (var i = 0; i < ch.id.length; i++) s = (Math.imul(s, 31) + ch.id.charCodeAt(i)) >>> 0;
    return s;
  }
  /* Generate a challenge's parameters from a code, deterministically.
     gen() calls Math.random (directly, and inside its rejection loops), so the
     honest way to make it reproducible is to swap the generator for the call
     and put the real one back afterwards - including if gen() throws. */
  function paramsFor(ch, code) {
    var real = Math.random;
    Math.random = rng(seedFor(ch, code));
    try { return ch.gen(); }
    finally { Math.random = real; }
  }

  /* A code must be unique across the whole term. Marking filters the sheet by
     code, so two rounds sharing one would silently mark one round's answers
     against the other round's numbers. With fifteen rounds the birthday odds
     of that are about 1.2% a term, and about 10% over three years - small, and
     the failure is both invisible and unfair, so it is worth excluding
     outright rather than living with. */
  function newCode() {
    var c, k;
    /* the fast path, which is the only one that ever runs in practice */
    for (k = 0; k < 200; k++) {
      c = 1000 + Math.floor(Math.random() * 9000);
      if (!codeUsed(c)) { burn(c); return c; }
    }
    /* Random probing gets slow long before the codes run out - with 8999 of
       9000 taken it finds the free one about a fifth of the time - so fall
       back to an exact scan rather than quietly handing back a used code. */
    var free = [];
    for (c = 1000; c <= 9999; c++) if (!codeUsed(c)) free.push(c);
    if (free.length) {
      c = free[Math.floor(Math.random() * free.length)];
      burn(c);
      return c;
    }
    /* genuinely exhausted: several hundred terms of use. Reuse the oldest
       code rather than refusing to run a round, and say so. */
    c = DB.codes.length ? DB.codes[0] : 1000;
    window.alert("All 9000 variant codes have been used. Code " + c + " is being reused, so "
      + "clear the old rounds (Totals tab) after exporting a backup.");
    return c;
  }
  /* The ledger of codes ever drawn is never trimmed, unlike the played-round
     history, which keeps only the last 80 so the picker stays usable. A code
     falling off that list and being re-drawn would mismark a whole round in
     silence, so uniqueness is tracked separately and exactly. */
  function burn(c) {
    if (DB.codes.indexOf(c) < 0) { DB.codes.push(c); save(DB); }
  }
  function codeUsed(c) {
    if (DB.codes.indexOf(c) >= 0) return true;
    var i;
    for (i = 0; i < DB.history.length; i++) if (DB.history[i].code === c) return true;
    for (i = 0; i < DB.results.length; i++) if (DB.results[i].code === c) return true;
    return false;
  }

  /* ------------------------------------------------------------------ state */
  /* code is filled in by boot(), not here: newCode() has to consult the stored
     round history to keep codes unique across the term, and the store is
     loaded further down. `var` hoisting would make that read `undefined`
     rather than complain. */
  var S = {
    week: 2, idx: 0,          /* idx = which of the week's three */
    code: 0,
    lang: "en",
    seconds: 120, left: 120, running: false, revealed: false,
    tick: null
  };

  function weekList(w) { return CH.filter(function (c) { return c.week === w; }); }
  function current() {
    var list = weekList(S.week);
    return list[Math.min(S.idx, list.length - 1)];
  }

  /* -------------------------------------------------------------- persistence
     localStorage can be absent, full, or throw outright (private windows, and
     file:// on some builds). Every touch is guarded and the console works
     without it - only the running totals are lost. */
  function blank() { return { v: 2, results: [], history: [], codes: [] }; }
  function load() {
    try {
      var raw = window.localStorage.getItem(STORE);
      if (!raw) return blank();
      var d = JSON.parse(raw);
      return { v: 2, results: d.results || [], history: d.history || [],
               codes: d.codes || [] };
    } catch (e) { return blank(); }
  }
  function save(d) {
    try { window.localStorage.setItem(STORE, JSON.stringify(d)); return true; }
    catch (e) { return false; }
  }
  var DB = load();

  /* Totals are never stored - they are added up from the banked rounds every
     time they are shown. One source of truth, so an import cannot drift from
     it and a removed round cannot leave its points behind. */
  function totals() {
    var out = {};
    DB.results.forEach(function (r) {
      r.rows.forEach(function (o) {
        var rec = out[o.sid] || { handle: o.handle, points: 0, correct: 0, attempts: 0 };
        if (o.handle) rec.handle = o.handle;          /* the most recent one wins */
        rec.points += o.points;
        rec.correct += o.ok ? 1 : 0;
        rec.attempts += 1;
        out[o.sid] = rec;
      });
    });
    return out;
  }
  function hasRound(key) {
    return DB.results.some(function (r) { return r.key === key; });
  }
  /* shown in the header all term, so a browser that has lost the totals - or a
     different browser from the one used last week - is obvious at a glance
     rather than in week 6 */
  function paintBanked() {
    var n = DB.results.length;
    var b = $("banked");
    if (!b) return;
    b.textContent = n === 0 ? "no rounds banked" : n + (n === 1 ? " round" : " rounds") + " banked";
    b.className = "banked" + (n === 0 ? " empty" : "");
  }

  /* ------------------------------------------------------------- preferences
     Two teaching decisions, both his to make, both changeable without
     re-marking anything: what name goes on the projector, and which attempt
     counts when a student submits more than once. */
  var PREFS = { show: "id", attempt: "first" };
  function loadPrefs() {
    try {
      var raw = window.localStorage.getItem("phy101-calc-prefs");
      if (raw) {
        var d = JSON.parse(raw);
        if (d.show === "id" || d.show === "alias") PREFS.show = d.show;
        if (d.attempt === "first" || d.attempt === "last" || d.attempt === "best") {
          PREFS.attempt = d.attempt;
        }
      }
    } catch (e) { /* defaults */ }
  }
  function savePrefs() {
    try { window.localStorage.setItem("phy101-calc-prefs", JSON.stringify(PREFS)); return true; }
    catch (e) { return false; }
  }
  /* What a row is CALLED on screen is decided at render time, never stored, so
     flipping the setting relabels the whole term at once instead of leaving
     old rounds under their old names. */
  function label(sid) {
    return PREFS.show === "id" ? String(sid) : alias(sid);
  }
  /* the name that goes on screen for one marked row */
  function rowLabel(o) { return (o && o.handle) || label(o && (o.id || o.sid)); }

  /* ------------------------------------------------------------------ alias
     Only the student ID is collected, and a student ID must never reach the
     projector. So the screen name is DERIVED from the ID: the same ID always
     gives the same alias, on any machine, in any week, with nothing stored and
     nothing for the student to choose. The mapping is one-way in practice -
     the alias carries no digits of the ID - and the ID<->alias list is in the
     points CSV for the lecturer's own use.

     Words are ASCII and read the same in Turkish and English, so a podium PC
     with missing fonts cannot mangle them. */
  var ALIAS_WORDS = [
    "Atom", "Foton", "Proton", "Elektron", "Kuark", "Plazma", "Vektor", "Skaler",
    "Tensor", "Kuantum", "Orbit", "Radyan", "Momentum", "Enerji", "Kinetik", "Gravite",
    "Manyetik", "Elektrik", "Optik", "Lazer", "Prizma", "Spektrum", "Dalga", "Frekans",
    "Genlik", "Rezonans", "Sarkac", "Kaldirac", "Tork", "Ivme", "Kuvvet", "Basinc",
    "Yogunluk", "Entropi", "Termal", "Izotop", "Nova", "Pulsar", "Kuasar", "Komet",
    "Meteor", "Asteroit", "Galaksi", "Nebula", "Yildiz", "Gezegen", "Uydu", "Yorunge",
    "Teleskop", "Mercek", "Ayna", "Piksel", "Kepler", "Newton", "Joule", "Watt",
    "Pascal", "Kelvin", "Hertz", "Tesla", "Amper", "Volt", "Ohm", "Gauss"
  ];
  function alias(sid) {
    var h = 2166136261, str = String(sid);
    for (var i = 0; i < str.length; i++) {          /* FNV-1a */
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    /* FNV alone is NOT enough here. Its last step is a multiply, so inputs
       that differ by one - which is exactly what student numbers in a class
       do - come out differing by a constant. Measured before this finalizer
       was added: every consecutive pair advanced the word by exactly 45 and
       the number by 849, so two classmates comparing aliases could have
       walked the whole register. The murmur3 avalanche below breaks that. */
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16; h = h >>> 0;

    var w = ALIAS_WORDS[h % ALIAS_WORDS.length];
    var n = Math.floor(h / ALIAS_WORDS.length) % 1000;
    return w + "-" + ("00" + n).slice(-3);
  }

  /* -------------------------------------------------------------------- dom */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function ord(n, tr) {
    if (tr) return n + ".";                       /* Turkish: 1., 2., 3. */
    return n + (["st", "nd", "rd"][n - 1] || "th");
  }
  function fmtSec(n) {
    var m = Math.floor(n / 60), s = n % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* --------------------------------------------------------------- question */
  function renderQuestion() {
    var ch = current(), p = paramsFor(ch, S.code);
    var tr = S.lang === "tr";

    $("q-id").textContent = ch.id;
    $("q-skill").textContent = ch.skill;
    $("q-code").textContent = S.code;
    $("q-code-label").textContent = tr ? "kod" : "code";
    $("q-text").innerHTML = tr && ch.text_tr ? ch.text_tr(p) : ch.text(p);
    $("q-hint").innerHTML = esc(ch.hint);
    $("q-ask").innerHTML = (tr ? "Cevabı " : "Answer in ") + "<b>" + esc(ch.unit) + "</b>, "
      + (ch.mark === "sf3"
          ? (tr ? "tam <b>üç anlamlı rakam</b>" : "to exactly <b>three significant figures</b>")
          : (tr ? "en az <b>3 anlamlı rakam</b>" : "to at least <b>3 significant figures</b>"));

    /* the week / challenge chips */
    var picker = $("picker");
    picker.innerHTML = "";
    [2, 3, 4, 5, 6].forEach(function (w) {
      var b = el("button", "chip" + (w === S.week ? " on" : ""), "W" + w);
      b.onclick = function () { S.week = w; S.idx = 0; reset(); };
      picker.appendChild(b);
    });
    var sep = el("span", "sep", "");
    picker.appendChild(sep);
    weekList(S.week).forEach(function (c, i) {
      var b = el("button", "chip" + (i === S.idx ? " on" : ""), String(i + 1));
      b.title = c.skill;
      b.onclick = function () { S.idx = i; reset(); };
      picker.appendChild(b);
    });

    $("reveal").hidden = !S.revealed;
    if (S.revealed) renderReveal(ch, p);
    document.body.classList.toggle("is-revealed", S.revealed);
  }

  /* A trap's wording is either a fixed string or a function of the parameters -
     the explanations that quote the student's own keystroke have to be the
     latter, or the room is shown a number it never typed. */
  function say(field, t, p, tr) {
    var v = (tr && t[field + "_tr"] != null) ? t[field + "_tr"] : t[field];
    return typeof v === "function" ? v(p) : String(v == null ? "" : v);
  }

  /* ----------------------------------------------------------------- reveal */
  function renderReveal(ch, p) {
    var tr = S.lang === "tr";
    var a = ch.answer(p);
    $("r-answer").innerHTML = SF3(a) + " <span class='unit'>" + esc(ch.unit) + "</span>";
    $("r-head-a").textContent = tr ? "cevap" : "the answer";
    $("r-head-b").textContent = tr
      ? "ve sınıfın üreteceği iki yanlış cevap"
      : "and the two answers the room will have produced";
    $("r-note").textContent = ch.mark === "sf3"
      ? (tr ? "Üç anlamlı rakamda bu değere eşit olmalı."
            : "Must agree with this to three significant figures.")
      : (tr ? "%1 içindeki cevaplar doğru sayılır." : "Accepted within 1%.");

    var box = $("r-traps");
    box.innerHTML = "";
    ch.traps.forEach(function (t) {
      var v = t.value(p);
      var card = el("div", "trap");
      card.appendChild(el("div", "trap-val", isFinite(v)
        ? SF3(v) + " <span class='unit'>" + esc(ch.unit) + "</span>"
        : "Math ERROR"));
      card.appendChild(el("div", "trap-label", esc(say("label", t, p, tr))));
      card.appendChild(el("div", "trap-why", say("why", t, p, tr)));
      box.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ timer */
  function paintClock() {
    $("clock").textContent = fmtSec(Math.max(S.left, 0));
    var frac = S.seconds ? Math.max(S.left, 0) / S.seconds : 0;
    $("bar").style.width = (frac * 100).toFixed(2) + "%";
    document.body.classList.toggle("is-low", S.left <= 15 && S.left > 0);
    document.body.classList.toggle("is-done", S.left <= 0);
    $("btn-start").textContent = S.running ? "PAUSE" : (S.left < S.seconds ? "RESUME" : "START");
  }
  function startStop() {
    if (S.left <= 0) return;
    S.running = !S.running;
    if (S.running) startPolling(); else stopPolling();
    if (S.running) {
      S.tick = window.setInterval(function () {
        S.left--;
        if (S.left <= 0) { S.left = 0; stop(); }
        paintClock();
      }, 1000);
    } else if (S.tick) { window.clearInterval(S.tick); S.tick = null; }
    paintClock();
  }
  function stop() {
    S.running = false;
    if (S.tick) { window.clearInterval(S.tick); S.tick = null; }
  }
  function reset() {
    stop();
    stopPolling();
    S.left = S.seconds; S.revealed = false;
    LIVE.n = 0; LIVE.rows = null; LIVE.err = ""; LIVE.result = null;
    var m = $("live-msg"); if (m) { m.hidden = true; m.textContent = ""; }
    renderQuestion(); paintClock(); paintLive();
  }
  function fresh() { S.code = newCode(); reset(); }

  /* ------------------------------------------------------------------ history
     Revealing the answer is the moment a round becomes a thing that happened.
     Keep the (challenge, code) pair so it can still be marked after the
     numbers have moved on - at the end of the class, or that evening. */
  function remember() {
    var ch = current();
    var key = ch.id + "-" + S.code;
    if (DB.history.some(function (h) { return h.key === key; })) return;
    DB.history.unshift({ key: key, id: ch.id, week: S.week, idx: S.idx, code: S.code,
                         at: new Date().toISOString().slice(0, 16).replace("T", " ") });
    if (DB.codes.indexOf(S.code) < 0) DB.codes.push(S.code);
    if (DB.history.length > 80) DB.history.length = 80;
    save(DB);
    renderRoundPicker();
  }

  function renderRoundPicker() {
    var sel = $("s-round");
    if (!sel) return;
    var keep = sel.value;
    sel.innerHTML = "";
    if (!DB.history.length) {
      sel.appendChild(el("option", null, "— no round played yet —"));
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    DB.history.forEach(function (h) {
      var o = el("option", null, h.id + "  ·  code " + h.code + "  ·  " + h.at
        + (hasRound(h.key) ? "   (already banked)" : ""));
      o.value = h.key;
      sel.appendChild(o);
    });
    if (keep && DB.history.some(function (h) { return h.key === keep; })) sel.value = keep;
  }

  /* which round the Score tab is marking: whatever is chosen there, falling
     back to the one on screen */
  function scoringRound() {
    var sel = $("s-round");
    var key = sel && !sel.disabled ? sel.value : null;
    var h = key && DB.history.filter(function (x) { return x.key === key; })[0];
    if (!h) return { ch: current(), code: S.code };
    var ch = CH.filter(function (c) { return c.id === h.id; })[0] || current();
    return { ch: ch, code: h.code };
  }

  /* ------------------------------------------------------------------- live
     Submissions arrive by themselves: a small Apps Script attached to the
     response sheet returns the rows for one code, and the console asks it
     every few seconds while the clock runs.

     JSONP rather than fetch(): a script tag is the one cross-origin request
     that works unchanged from a file:// page, from GitHub Pages, and from a
     podium PC, with no CORS configuration on the Google side to get wrong.

     The endpoint URL is a secret - it is the key to that sheet - so it lives
     in this browser's storage and never in the repo. */
  var LIVE = { url: "", key: "", n: 0, rows: null, err: "", busy: false, timer: null, seq: 0 };

  function liveConfigured() { return !!LIVE.url; }

  function loadLive() {
    try {
      LIVE.url = window.localStorage.getItem("phy101-calc-endpoint") || "";
      LIVE.key = window.localStorage.getItem("phy101-calc-key") || "";
    } catch (e) { LIVE.url = ""; LIVE.key = ""; }
  }
  function saveLive(url, key) {
    LIVE.url = url; LIVE.key = key;
    try {
      window.localStorage.setItem("phy101-calc-endpoint", url);
      window.localStorage.setItem("phy101-calc-key", key);
      return true;
    } catch (e) { return false; }
  }

  /* One request. Calls back with (err, data). Always cleans up its script tag
     and always fires exactly once, including on timeout. */
  function liveFetch(code, done) {
    if (!LIVE.url) { done("no endpoint set"); return; }
    var name = "__calcjsonp" + (++LIVE.seq);
    var el = document.createElement("script");
    var finished = false;
    var timer = window.setTimeout(function () { finish("timed out after 15 s"); }, 15000);

    function finish(err, data) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      try { delete window[name]; } catch (e) { window[name] = undefined; }
      if (el.parentNode) el.parentNode.removeChild(el);
      done(err, data);
    }
    window[name] = function (data) { finish(null, data); };
    el.onerror = function () { finish("could not reach the endpoint"); };

    var sep = LIVE.url.indexOf("?") >= 0 ? "&" : "?";
    el.src = LIVE.url + sep + "code=" + encodeURIComponent(code)
           + (LIVE.key ? "&key=" + encodeURIComponent(LIVE.key) : "")
           + "&callback=" + name + "&t=" + Date.now();
    document.body.appendChild(el);
  }

  /* Turn the endpoint's rows into the same shape a pasted sheet produces, so
     exactly one marking path exists. Anything else would be a second rule. */
  function rowsToSheet(rows) {
    var out = ["Timestamp,Student ID,Code,Answer"];
    rows.forEach(function (r) {
      function q(v) {
        v = String(v == null ? "" : v);
        return /[,"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }
      out.push([q(r.ts), q(r.id), q(LIVE.lastCode), q(r.ans)].join(","));
    });
    return out.join("\n");
  }

  function poll() {
    if (!liveConfigured() || LIVE.busy) return;
    LIVE.busy = true;
    var code = S.code;
    LIVE.lastCode = code;
    liveFetch(code, function (err, data) {
      LIVE.busy = false;
      if (code !== S.code) return;                 /* the round moved on */
      if (err) { LIVE.err = err; LIVE.rows = null; paintLive(); return; }
      if (!data || data.ok !== true) {
        LIVE.err = (data && data.error) || "the endpoint refused the request";
        LIVE.rows = null; paintLive(); return;
      }
      LIVE.err = ""; LIVE.rows = data.rows || []; LIVE.n = LIVE.rows.length;
      paintLive();
    });
  }
  function startPolling() {
    stopPolling();
    if (!liveConfigured()) return;
    poll();
    LIVE.timer = window.setInterval(poll, 5000);
  }
  function stopPolling() {
    if (LIVE.timer) { window.clearInterval(LIVE.timer); LIVE.timer = null; }
  }
  function paintLive() {
    var el = $("live");
    if (!el) return;
    if (!liveConfigured()) { el.hidden = true; return; }
    el.hidden = false;
    if (LIVE.err) {
      el.className = "live bad";
      el.innerHTML = "<span class='live-n'>—</span> <span class='live-l'>"
        + esc(LIVE.err) + "</span>";
      return;
    }
    el.className = "live";
    el.innerHTML = "<span class='live-n'>" + LIVE.n + "</span> <span class='live-l'>"
      + (S.lang === "tr" ? (LIVE.n === 1 ? "cevap geldi" : "cevap geldi")
                         : (LIVE.n === 1 ? "submission" : "submissions")) + "</span>";
  }

  /* When the answer is revealed the round is over, so mark it there and then. */
  function autoMark() {
    if (!liveConfigured()) return;
    var ch = current(), code = S.code;
    LIVE.lastCode = code;
    liveFetch(code, function (err, data) {
      if (err || !data || data.ok !== true) {
        var m = $("live-msg");
        if (m) {
          m.hidden = false;
          m.className = "live-msg bad";
          m.textContent = "Could not fetch the answers ("
            + (err || (data && data.error) || "refused")
            + "). Paste the sheet on the Score tab instead.";
        }
        return;
      }
      LIVE.rows = data.rows || []; LIVE.n = LIVE.rows.length; LIVE.err = "";
      paintLive();
      var res = scoreRows(parseCSV(rowsToSheet(LIVE.rows)), { ch: ch, code: code });
      LIVE.result = res;
      var m2 = $("live-msg");
      if (m2) {
        m2.hidden = false;
        if (res.err) {
          m2.className = "live-msg bad";
          m2.textContent = res.err;
        } else {
          m2.className = "live-msg";
          m2.innerHTML = "<b>" + res.nOk + " of " + res.rows.length + "</b> correct — "
            + "press <b>L</b> for the leaderboard";
        }
      }
      if (!res.err) { renderScore(res); }
    });
  }

  /* ---------------------------------------------------------------- scoring */
  /* Work out what separates the columns before parsing.
     Copying a selection out of Google Sheets puts TAB-separated text on the
     clipboard, not commas - which is the normal way to get the data here, and
     which every test fed it as commas, so it went unnoticed until a real paste
     failed. Downloading the sheet as .csv gives commas. Both must work, and a
     semicolon export (Turkish locale Excel) too. */
  function sniffDelim(text) {
    var line = String(text).replace(/\r\n/g, "\n").split("\n")[0] || "";
    var n = { "\t": 0, ",": 0, ";": 0 }, q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') { q = !q; continue; }
      if (!q && n[c] !== undefined) n[c]++;
    }
    /* tabs win outright when present: a header can contain a comma of its own
       ("Cevap, 3 anlamli rakam") but never a tab */
    if (n["\t"]) return "\t";
    if (n[";"] > n[","]) return ";";
    return ",";
  }

  /* A real reader: Google Forms quotes any field containing the delimiter, and
     a doubled quote is an escaped one. */
  function parseCSV(text, delim) {
    var d = delim || sniffDelim(text);
    var rows = [], row = [], cell = "", q = false, i = 0;
    text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === d) { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ""; }); });
  }

  /* Find a column by any of several header spellings, so the Form's exact
     wording (and its Turkish version) does not have to match a literal. */
  function findCol(head, needles) {
    for (var i = 0; i < head.length; i++) {
      var h = head[i].toLowerCase();
      for (var j = 0; j < needles.length; j++) if (h.indexOf(needles[j]) >= 0) return i;
    }
    return -1;
  }

  /* Students type numbers in every shape a phone keyboard allows. Accept
     "1,23" (comma decimal), "2.5e3", "3 x 10^4", "1 234", a leading "=",
     and a trailing unit. Reject anything still ambiguous. */
  function parseNum(raw) {
    var s = String(raw == null ? "" : raw).trim().toLowerCase();
    if (!s) return NaN;
    s = s.replace(/^=+/, "").replace(/\s+/g, "");
    s = s.replace(/[a-z°µ\/²³]+$/i, "");                 /* trailing unit */
    s = s.replace(/(?:x|\*|·)10\^?/, "e").replace(/\^/, "e");
    if (s.indexOf(",") >= 0 && s.indexOf(".") < 0) s = s.replace(/,/g, ".");
    else s = s.replace(/,/g, "");
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/.test(s)) return NaN;
    return parseFloat(s);
  }

  function scoreRows(rows, override) {
    if (!rows.length) return { err: "Nothing pasted." };
    var head = rows[0].map(function (h) { return h.trim(); });
    var ci = {
      ts: findCol(head, ["timestamp", "zaman"]),
      id: findCol(head, ["student", "öğrenci", "ogrenci", "number", "no"]),
      handle: findCol(head, ["handle", "nick", "takma", "rumuz"]),
      code: findCol(head, ["code", "kod"]),
      ans: findCol(head, ["answer", "cevap", "sonuç", "sonuc"])
    };
    var missing = ["id", "code", "ans"].filter(function (k) { return ci[k] < 0; });
    if (missing.length) {
      /* The commonest mistake by far is pasting one column, or pasting the
         rows without the header line. Say that plainly instead of listing
         column names the person never chose. */
      if (head.length < 3) {
        return { err: "That looks like " + (head.length === 1 ? "a single column" : "only "
          + head.length + " columns") + ". Select the WHOLE sheet including the top row "
          + "of headings - click the empty corner box above row 1, or press Ctrl/Cmd+A - "
          + "then copy and paste again. What arrived: " + head.join(" | ") };
      }
      return { err: "Could not find a column for: " + missing.join(", ")
                 + ". Headings seen: " + head.join(" | ")
                 + ". They need to contain student/öğrenci/no, code/kod and answer/cevap." };
    }

    var round = override || scoringRound();
    var ch = round.ch, wanted = round.code;
    /* Gather EVERY row for this code first, then decide which attempt counts.
       That order is what makes "last" and "best" possible at all, and it is
       also how the repeat count becomes visible instead of silently dropped. */
    var all = [], p = paramsFor(ch, wanted);
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      var code = parseInt(String(row[ci.code] || "").replace(/\D/g, ""), 10);
      if (!(code >= 1000 && code <= 9999)) continue;           /* other rounds */
      if (code !== wanted) continue;
      var id = String(row[ci.id] || "").trim();
      if (!id) continue;

      var val = parseNum(row[ci.ans]);
      var ok = isFinite(val) && MARK(ch, p, val);
      var which = null;
      if (!ok && isFinite(val)) {
        for (var k = 0; k < ch.traps.length; k++) {
          var tv = ch.traps[k].value(p);
          if (isFinite(tv) && Math.abs(val - tv) <= 0.01 * Math.abs(tv)) { which = k; break; }
        }
      }
      all.push({
        id: id,
        /* Empty unless the sheet actually has a handle column. The screen name
           is worked out at render time from this plus the display setting, so
           a supplied handle still wins and the setting governs the rest. */
        handle: ci.handle >= 0 ? String(row[ci.handle] || "").trim() : "",
        ts: ci.ts >= 0 ? String(row[ci.ts] || "").trim() : "",
        raw: String(row[ci.ans] || "").trim(),
        val: val, ok: ok, trap: which,
        seq: r                   /* sheet order: the tiebreak when times tie */
      });
    }

    /* oldest first, so "first" and "last" mean what they say even when rows
       arrive out of order */
    all.sort(function (a, b) {
      if (a.ts !== b.ts) return a.ts < b.ts ? -1 : 1;
      return a.seq - b.seq;
    });

    var byId = {}, order = [], extra = 0, counts = {};
    all.forEach(function (o) {
      counts[o.id] = (counts[o.id] || 0) + 1;
      var prev = byId[o.id];
      if (!prev) { byId[o.id] = o; order.push(o.id); return; }
      extra++;
      if (PREFS.attempt === "last") byId[o.id] = o;
      else if (PREFS.attempt === "best" && !prev.ok && o.ok) byId[o.id] = o;
      /* "first": the earliest stands, whatever came after it */
    });
    var out = order.map(function (id) { return byId[id]; });
    var nRepeat = Object.keys(counts).filter(function (id) { return counts[id] > 1; }).length;
    if (!out.length) {
      return { err: "No rows carried the code " + wanted
                 + ". Either the round has not been submitted yet, or the sheet is from "
                 + "another round." };
    }

    /* Accuracy first, speed only as a tiebreak: every correct answer is worth
       the same 10 points, and the first three correct get a small bonus. */
    out.sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
    var rank = 0;
    out.forEach(function (o) {
      o.points = o.ok ? 10 : 0;
      if (o.ok) { rank++; if (rank <= 3) o.points += [3, 2, 1][rank - 1]; o.rank = rank; }
    });
    /* Two IDs can land on the same alias. Measured over 4000 simulated classes:
       never once for consecutive student numbers, which is what a real class
       has, and for scattered numbers it tracks the plain birthday odds on a
       64000-name space - 0.5% for 30 students, 2.8% for 60, 10.7% for 120.
       The points are keyed by ID so they stay correct either way, but the
       screen would show one name twice, so flag it rather than let a student
       discover it. */
    var seenAlias = {}, clash = [];
    if (PREFS.show !== "id") {                 /* student numbers cannot clash */
      out.forEach(function (o) {
        var name = rowLabel(o);
        var prev = seenAlias[name];
        if (prev && prev !== o.id) clash.push(name);
        else seenAlias[name] = o.id;
      });
    }

    var byPts = out.slice().sort(function (a, b) { return b.points - a.points; });
    return { rows: out, board: byPts, ch: ch, code: wanted, clash: clash,
             repeats: extra, nRepeat: nRepeat, attempt: PREFS.attempt,
             rehearsal: !!(override && override.rehearsal),
             nOk: out.filter(function (o) { return o.ok; }).length };
  }

  function renderScore(res) {
    var tr = S.lang === "tr";
    var box = $("s-out");
    box.innerHTML = "";
    if (res.err) {
      document.body.classList.remove("sheet-folded");
      box.appendChild(el("p", "warn", esc(res.err)));
      return;
    }
    /* The pasted sheet holds every student ID. Once it has been marked it must
       leave the screen, because this tab is on the projector. */
    document.body.classList.add("sheet-folded");

    box.appendChild(el("p", "s-sum", res.nOk + " of " + res.rows.length + " correct"
      + " &nbsp;·&nbsp; " + esc(res.ch.id) + " &nbsp;·&nbsp; code " + res.code));

    if (res.repeats) {
      var how = res.attempt === "last" ? "the last one counts"
              : res.attempt === "best" ? "their first correct one counts"
              : "only the first counts";
      box.appendChild(el("p", "fine",
        res.nRepeat + (res.nRepeat === 1 ? " student" : " students") + " submitted more than once ("
        + res.repeats + " extra " + (res.repeats === 1 ? "row" : "rows") + ") — " + how
        + ", as chosen on the Settings tab."));
    }

    if (res.clash && res.clash.length) {
      box.appendChild(el("p", "warn",
        "Two students share the alias " + esc(res.clash.join(", ")) + ". Their points are "
        + "still counted separately - the totals are keyed to the student ID - but tell "
        + "them, because the screen shows the name twice."));
    }

    var t = el("table", "board");
    t.innerHTML = "<thead><tr><th>#</th><th>"
                + (PREFS.show === "id" ? (tr ? "öğrenci no" : "student no") : (tr ? "rumuz" : "nickname"))
                + "</th><th>" + (tr ? "cevap" : "answer") + "</th><th></th>"
                + "<th class='num'>" + (tr ? "puan" : "pts") + "</th></tr></thead>";
    var tb = el("tbody");
    res.board.forEach(function (o, i) {
      var tag = o.ok
        ? (o.rank <= 3
            ? "<span class='ok'>" + (tr ? "doğru · " + ord(o.rank, tr) : "correct · " + ord(o.rank, tr) + " in") + "</span>"
            : "<span class='ok'>" + (tr ? "doğru" : "correct") + "</span>")
        : (o.trap != null
            ? "<span class='bad'>"
              + esc(say("label", res.ch.traps[o.trap], paramsFor(res.ch, res.code), tr))
              + "</span>"
            : "<span class='bad'>" + (tr ? "cevap bu değil" : "not the answer") + "</span>");
      var tr = el("tr", o.ok ? "row-ok" : "");
      tr.innerHTML = "<td class='num'>" + (i + 1) + "</td>"
        + "<td class='handle'>" + esc(rowLabel(o)) + "</td>"
        + "<td class='ans'>" + esc(o.raw) + "</td>"
        + "<td>" + tag + "</td>"
        + "<td class='num'>" + o.points + "</td>";
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    box.appendChild(t);

    if (res.rehearsal) {
      box.insertBefore(el("p", "rehearsal-note",
        "<b>Rehearsal.</b> These twelve students are invented, so this round is "
        + "<b>not</b> added to the term totals. Everything else on this screen is the real "
        + "thing: the same marking rule, the same diagnosis, the same points."),
        box.firstChild.nextSibling);
    }
    var unfold = el("button", "btn", tr ? "yapıştırma alanını göster" : "show the paste box again");
    unfold.onclick = function () { document.body.classList.remove("sheet-folded"); };
    box.appendChild(unfold);

    if (!res.rehearsal) {
      var b = el("button", "btn", "Add this round to the term totals");
      b.onclick = function () { commit(res); };
      box.appendChild(b);
    }
    box.appendChild(el("p", "fine", PREFS.show === "id"
      ? "This table shows student numbers, as chosen on the Settings tab. Switch it to "
        + "nicknames there if you would rather not project them."
      : "Student numbers stay in this browser. Only nicknames appear in the table above, "
        + "so the projector never shows one."));
  }

  function commit(res) {
    var key = res.ch.id + "-" + res.code;
    if (hasRound(key)) {
      window.alert("That round is already in the totals.");
      return;
    }
    DB.results.push({
      key: key, id: res.ch.id, code: res.code,
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      rows: res.rows.map(function (o) {
        return { sid: o.id, handle: o.handle, points: o.points, ok: o.ok };
      })
    });
    renderRoundPicker();
    if (!save(DB)) {
      window.alert("The totals could not be stored in this browser, so they will be lost when "
        + "you close the tab. Export them now from the Totals panel.");
    }
    renderTotals(); paintBanked();
    $("s-out").appendChild(el("p", "s-sum",
      "Added. " + DB.results.length + " rounds banked."));
  }

  /* ---------------------------------------------------------------- rehearsal
     A dry run with an invented class, so the whole path - question, clock,
     reveal, paste, mark, leaderboard - can be walked through before anyone is
     in the room. Rehearsal results are never added to the term totals. */
  var NAMES = ["Nova", "rocketkedi", "Ay-Işığı", "vektor42", "Karadelik", "ivme",
               "Pusula", "mu-static", "Lambda", "Deniz", "Berk, the quick", "kuantum"];

  function rehearse() {
    var ch = current(), code = S.code, p = paramsFor(ch, code);
    var a = ch.answer(p);
    var t0 = ch.traps[0].value(p), t1 = ch.traps[1].value(p);
    var n = function (v) { return isFinite(v) ? SF3(v) : "Math ERROR"; };

    /* Deliberately messy, because a real sheet is: a comma decimal, a unit
       typed in, more digits than asked for, a blank, a word, a duplicate, and
       one row from another round. If the console survives this it will survive
       the class. */
    var t = 0;
    function stamp() { t += 6 + Math.floor(Math.random() * 9);
      var mm = 30 + Math.floor(t / 60), ss = t % 60;
      return "2026/01/01 10:" + mm + ":" + (ss < 10 ? "0" + ss : ss); }
    var body = [
      [stamp(), "9001", NAMES[0], code, n(a)],
      [stamp(), "9002", NAMES[1], code, String(n(a)).replace(".", ",")],
      [stamp(), "9003", NAMES[2], code, n(t0)],
      [stamp(), "9004", NAMES[3], code, n(a) + " " + ch.unit],
      [stamp(), "9005", NAMES[4], code, (+a).toFixed(5)],
      [stamp(), "9006", NAMES[5], code, n(t1)],
      [stamp(), "9007", NAMES[6], code, "bilmiyorum"],
      [stamp(), "9008", NAMES[7], code, ""],
      [stamp(), "9009", NAMES[8], code, n(t0)],
      [stamp(), "9010", NAMES[9], code, n(a)],
      [stamp(), "9001", NAMES[0], code, n(a)],                    /* duplicate */
      [stamp(), "9011", NAMES[10], (code % 9000) + 1000, n(a)]    /* other round */
    ];
    var rows = ["Timestamp,Student ID,Handle,Variant code,Your answer"].concat(
      body.map(function (r) {
        return r.map(function (c) {
          c = String(c);
          return /[,"]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
        }).join(",");
      }));

    $("s-in").value = rows.join("\n");
    show("score");
    renderScore(scoreRows(parseCSV(rows.join("\n")),
                          { ch: ch, code: code, rehearsal: true }));
  }

  /* --------------------------------------------------------------- self check
     Everything the console needs in order to work, checked in the browser it
     will actually run in. This is the answer to "is it up and running?" -
     not a test suite somewhere else, but a button on the page. */
  function selfCheck() {
    var res = [];
    function t(name, fn) {
      try {
        var d = fn();
        if (d && typeof d === "object" && d.note != null) {
          /* passed, but with something worth reading */
          res.push({ name: name, ok: true, note: true, detail: String(d.note) });
        } else {
          res.push({ name: name, ok: d === true || d == null,
                     detail: d === true ? "" : String(d || "") });
        }
      } catch (e) { res.push({ name: name, ok: false, detail: String(e && e.message || e) }); }
    }

    t("the 15 challenges are loaded", function () {
      if (!CH || CH.length !== 15) return "found " + (CH ? CH.length : 0);
      for (var w = 2; w <= 6; w++) {
        if (weekList(w).length !== 3) return "week " + w + " has " + weekList(w).length;
      }
      return true;
    });

    t("every challenge produces a sensible question and answer", function () {
      var bad = [];
      for (var i = 0; i < CH.length; i++) {
        for (var k = 0; k < 60; k++) {
          var code = 1000 + Math.floor(Math.random() * 9000);
          var p = paramsFor(CH[i], code), a = CH[i].answer(p);
          if (!isFinite(a)) { bad.push(CH[i].id + "/" + code + " answer " + a); break; }
          var en = CH[i].text(p), tr = CH[i].text_tr ? CH[i].text_tr(p) : "";
          if (!en || !tr || /undefined|NaN/.test(en + tr)) { bad.push(CH[i].id + " text"); break; }
        }
      }
      return bad.length ? bad.slice(0, 3).join("; ") : true;
    });

    t("the marking rule accepts a correct answer and rejects every trap", function () {
      var bad = [];
      for (var i = 0; i < CH.length; i++) {
        for (var k = 0; k < 60; k++) {
          var ch = CH[i], p = paramsFor(ch, 1000 + Math.floor(Math.random() * 9000));
          var a = ch.answer(p);
          if (!MARK(ch, p, a)) bad.push(ch.id + ": exact answer refused");
          if (!MARK(ch, p, +SF3(a))) bad.push(ch.id + ": honest 3 s.f. answer refused");
          for (var j = 0; j < ch.traps.length; j++) {
            var tv = ch.traps[j].value(p);
            if (isFinite(tv) && MARK(ch, p, tv)) bad.push(ch.id + ": trap accepted");
          }
          if (bad.length) break;
        }
      }
      return bad.length ? bad.slice(0, 3).join("; ") : true;
    });

    t("no trap sits close enough to be mistaken for the answer", function () {
      var bad = [];
      for (var i = 0; i < CH.length; i++) {
        var ch = CH[i];
        var want = ch.minMargin == null ? window.CALC_MIN_MARGIN : ch.minMargin;
        if (want <= 0) continue;
        for (var k = 0; k < 60; k++) {
          var p = paramsFor(ch, 1000 + Math.floor(Math.random() * 9000));
          var m = window.CALC_TRAP_MARGIN(ch, p);
          if (m < want) { bad.push(ch.id + " " + (m * 100).toFixed(1) + "%"); break; }
        }
      }
      return bad.length ? bad.slice(0, 3).join("; ") : true;
    });

    t("the answer reader copes with commas, units and powers of ten", function () {
      var cases = [["17,3", 17.3], ["17.3 m/s", 17.3], ["1.4e3", 1400], ["2x10^3", 2000]];
      for (var i = 0; i < cases.length; i++) {
        var got = parseNum(cases[i][0]);
        if (Math.abs(got - cases[i][1]) > 1e-9) {
          return JSON.stringify(cases[i][0]) + " read as " + got;
        }
      }
      if (isFinite(parseNum("about 17"))) return "accepted a non-number";
      return true;
    });

    t("the sheet reader handles quoted fields", function () {
      var r = parseCSV('a,b\n1,"two, three"\n');
      return (r.length === 2 && r[1][1] === "two, three") ? true : "got " + JSON.stringify(r);
    });

    t("this browser can store the running totals", function () {
      try {
        window.localStorage.setItem("phy101-calc-probe", "1");
        var got = window.localStorage.getItem("phy101-calc-probe");
        window.localStorage.removeItem("phy101-calc-probe");
        if (got !== "1") return "storage did not read back";
      } catch (e) {
        return "unavailable - the console still works, but export the totals before closing";
      }
      return true;
    });

    t("the stylesheet loaded", function () {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--phy-orange");
      if (!c || !c.trim()) return "console.css was not found next to index.html";
      var f = getComputedStyle($("clock")).fontFamily || "";
      return /mono/i.test(f) ? true : "the clock is not in a monospaced face: " + f;
    });

    t("the term totals in this browser", function () {
      var n = DB.results.length;
      if (!n) {
        return { note: "no rounds banked — right for week 2, but if you have already run "
               + "rounds this term then this is the wrong browser or the storage was "
               + "cleared: restore your backup on the Totals tab" };
      }
      var last = DB.results[n - 1];
      return { note: n + (n === 1 ? " round" : " rounds") + " banked, the last on "
             + last.at + " (" + last.id + ")" };
    });

    t("live results", function () {
      if (!liveConfigured()) {
        return { note: "no endpoint set — submissions are marked by pasting the sheet. "
               + "Set one up on the Settings tab to have them arrive by themselves." };
      }
      return { note: "endpoint set; press Test on the Settings tab to confirm it answers" };
    });

    t("the window is wide enough to project", function () {
      return window.innerWidth >= 1100 ? true
        : "only " + window.innerWidth + "px wide - full-screen the window before class";
    });

    var box = $("c-out");
    box.innerHTML = "";
    var bad = res.filter(function (r) { return !r.ok; }).length;
    box.appendChild(el("p", "s-sum", bad
      ? bad + " of " + res.length + " checks failed"
      : "all " + res.length + " checks passed — the console is ready"));
    var ul = el("ul", "checklist");
    res.forEach(function (r) {
      var li = el("li", r.ok ? (r.note ? "pass note" : "pass") : "fail");
      li.innerHTML = "<span class='mark'>" + (r.ok ? "✓" : "✕") + "</span> " + esc(r.name)
        + (r.detail ? " <span class='detail'>" + esc(r.detail) + "</span>" : "");
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return res;
  }

  /* ----------------------------------------------------------------- totals */
  function renderTotals() {
    var box = $("t-out");
    box.innerHTML = "";
    var T = totals();
    var ids = Object.keys(T);
    if (!ids.length) { box.appendChild(el("p", "fine", "No rounds banked yet.")); return; }
    ids.sort(function (a, b) { return T[b].points - T[a].points; });

    box.appendChild(el("p", "s-sum",
      ids.length + " students · " + DB.results.length + " rounds"));
    var t = el("table", "board");
    t.innerHTML = "<thead><tr><th>#</th><th>"
                + (PREFS.show === "id" ? "student no" : "nickname")
                + "</th><th class='id-col'>student ID</th>"
                + "<th class='num'>correct</th><th class='num'>of</th>"
                + "<th class='num'>points</th></tr></thead>";
    var tb = el("tbody");
    ids.forEach(function (id, i) {
      var r = T[id];
      var tr = el("tr");
      tr.innerHTML = "<td class='num'>" + (i + 1) + "</td>"
        + "<td class='handle'>" + esc(r.handle || label(id)) + "</td>"
        + "<td class='id-col'>" + esc(id) + "</td>"
        + "<td class='num'>" + r.correct + "</td>"
        + "<td class='num'>" + r.attempts + "</td>"
        + "<td class='num'>" + r.points + "</td>";
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    box.appendChild(t);

    box.appendChild(el("h3", null, "Rounds banked"));
    var ul = el("ul", "roundlist");
    DB.results.slice().reverse().forEach(function (r) {
      var nOk = r.rows.filter(function (o) { return o.ok; }).length;
      var li = el("li", null,
        "<b>" + esc(r.id) + "</b> · code " + r.code + " · " + esc(r.at)
        + " · " + nOk + " of " + r.rows.length + " correct ");
      var x = el("button", "btn tiny", "remove");
      x.onclick = function () {
        if (!window.confirm("Remove " + r.id + " (code " + r.code + ") from the totals?\n\n"
          + "The points from that round go with it.")) return;
        DB.results = DB.results.filter(function (q) { return q.key !== r.key; });
        save(DB); renderTotals(); paintBanked(); renderRoundPicker();
      };
      li.appendChild(x);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function exportCSV() {
    var T = totals();
    var ids = Object.keys(T);
    ids.sort(function (a, b) { return T[b].points - T[a].points; });
    var lines = ["student_id,alias,correct,attempts,points"];
    ids.forEach(function (id) {
      var r = T[id];
      lines.push([id, '"' + String(r.handle).replace(/"/g, '""') + '"',
                  r.correct, r.attempts, r.points].join(","));
    });
    download("phy101-calc-points.csv", lines.join("\n") + "\n", "text/csv;charset=utf-8");
  }
  function exportJSON() {
    var name = "phy101-calc-backup-"
      + new Date().toISOString().slice(0, 10) + ".json";
    download(name, JSON.stringify(DB, null, 2), "application/json");
  }

  /* Restoring a backup, and merging the totals from another machine. Rounds
     are matched by (challenge, code), so a round this browser already holds is
     skipped rather than counted twice - which means the same file can be
     imported repeatedly without inflating anyone's score. */
  function importJSON(text) {
    var d;
    try { d = JSON.parse(text); }
    catch (e) { return { err: "That file is not readable JSON." }; }

    var incoming = d && d.results;
    if (!incoming || !incoming.length) {
      /* a v1 backup held only aggregate totals, which cannot be merged safely */
      if (d && d.totals) {
        return { err: "That backup is from an older version and holds only the summed "
                    + "totals, not the individual rounds, so it cannot be merged without "
                    + "risking double counting." };
      }
      return { err: "No banked rounds in that file." };
    }
    var added = 0, skipped = 0, bad = 0;
    incoming.forEach(function (r) {
      if (!r || !r.key || !r.rows || !r.rows.length) { bad++; return; }
      if (hasRound(r.key)) { skipped++; return; }
      DB.results.push(r);
      if (DB.codes.indexOf(r.code) < 0) DB.codes.push(r.code);
      added++;
    });
    (d.codes || []).forEach(function (c) {
      if (DB.codes.indexOf(c) < 0) DB.codes.push(c);
    });
    /* keep the played-round list in step, so an imported round can be re-marked */
    (d.history || []).forEach(function (h) {
      if (h && h.key && !DB.history.some(function (x) { return x.key === h.key; })) {
        DB.history.push(h);
      }
    });
    DB.results.sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
    var stored = save(DB);
    renderTotals(); paintBanked(); renderRoundPicker();
    return { added: added, skipped: skipped, bad: bad, stored: stored };
  }

  /* -------------------------------------------------------------------- tabs */
  function show(which) {
    ["run", "score", "totals", "check", "set"].forEach(function (k) {
      $("pane-" + k).hidden = k !== which;
      $("tab-" + k).classList.toggle("on", k === which);
    });
    if (which === "totals") renderTotals();
    if (which === "score") renderRoundPicker();
  }

  /* -------------------------------------------------------------------- wire */
  function boot() {
    $("btn-new").onclick = fresh;
    $("btn-start").onclick = startStop;
    $("btn-reveal").onclick = function () {
      stop(); stopPolling();
      S.revealed = true; remember(); renderQuestion(); paintClock();
      autoMark();                       /* no-op unless an endpoint is set */
    };
    $("btn-next").onclick = function () {
      var list = weekList(S.week);
      if (S.idx + 1 < list.length) S.idx++;
      else if (S.week < 6) { S.week++; S.idx = 0; }
      fresh();
    };
    $("btn-lang").onclick = function () {
      S.lang = S.lang === "en" ? "tr" : "en";
      $("btn-lang").textContent = S.lang === "en" ? "TR" : "EN";
      renderQuestion();
    };
    $("sel-time").onchange = function () {
      S.seconds = parseInt(this.value, 10); reset();
    };
    $("tab-run").onclick = function () { show("run"); };
    $("tab-score").onclick = function () { show("score"); };
    $("tab-totals").onclick = function () { show("totals"); };
    $("tab-check").onclick = function () { show("check"); };
    $("tab-set").onclick = function () { show("set"); };

    $("ep-save").onclick = function () {
      var url = $("ep-url").value.trim(), key = $("ep-key").value.trim();
      var stored = saveLive(url, key);
      var m = $("ep-msg"); m.innerHTML = "";
      m.appendChild(el("p", stored ? "s-sum" : "warn",
        !url ? "Endpoint cleared — the console is back to pasting the sheet."
             : stored ? "Saved in this browser. Press <b>Test</b> to check it answers."
                      : "This browser refused to store it, so it will be forgotten when you close the tab."));
      paintLive();
    };
    $("ep-test").onclick = function () {
      var m = $("ep-msg"); m.innerHTML = "";
      if (!$("ep-url").value.trim()) {
        m.appendChild(el("p", "warn", "Paste the deployment URL first.")); return;
      }
      saveLive($("ep-url").value.trim(), $("ep-key").value.trim());
      m.appendChild(el("p", "fine", "Asking the endpoint for code " + S.code + "…"));
      liveFetch(S.code, function (err, data) {
        m.innerHTML = "";
        if (err) {
          m.appendChild(el("p", "warn", "No answer: " + esc(err)
            + ". Check the URL, and that the deployment is set to \u201cAnyone\u201d."));
          return;
        }
        if (!data || data.ok !== true) {
          m.appendChild(el("p", "warn", "The endpoint answered, but refused: "
            + esc((data && data.error) || "unknown")
            + (data && data.headings ? " — headings it saw: " + esc(data.headings.join(" | ")) : "")));
          return;
        }
        m.appendChild(el("p", "s-sum", "Connected. It returned " + (data.rows || []).length
          + " submission(s) for the round currently on screen (code " + S.code + ")."
          + ((data.rows || []).length ? "" : " Zero is correct if nobody has answered this round yet.")));
      });
    };

    $("btn-live-board").onclick = function () { show("score"); };

    function segRow(id, opts, get, set) {
      var box = $(id);
      if (!box) return;
      function paint() {
        box.innerHTML = "";
        opts.forEach(function (o) {
          var b = el("button", get() === o[0] ? "on" : "", esc(o[1]));
          b.onclick = function () { set(o[0]); paint(); };
          box.appendChild(b);
        });
      }
      paint();
    }
    var WHY = {
      first: "The earliest submission stands. This is the strictest and the one that keeps "
           + "the speed bonus meaningful — a student cannot fire off guesses and keep the "
           + "one that lands. Recommended.",
      last:  "The newest submission stands, so a student can correct a typo — and can also "
           + "keep guessing until the clock runs out. Kinder, and easier to game.",
      best:  "Their first correct answer counts, wherever it falls. Kindest of the three, "
           + "and the easiest to brute-force: with enough attempts everyone is right."
    };
    function paintWhy() {
      var el2 = $("set-attempt-why");
      if (el2) el2.textContent = WHY[PREFS.attempt] || "";
    }
    segRow("set-show",
      [["id", "student numbers"], ["alias", "nicknames (Frekans-935)"]],
      function () { return PREFS.show; },
      function (v) {
        PREFS.show = v; savePrefs();
        if (LIVE.result && !LIVE.result.err) renderScore(LIVE.result);
        renderTotals();
      });
    segRow("set-attempt",
      [["first", "first counts"], ["last", "last counts"], ["best", "best counts"]],
      function () { return PREFS.attempt; },
      function (v) { PREFS.attempt = v; savePrefs(); paintWhy(); });
    paintWhy();
    $("btn-check").onclick = selfCheck;
    $("btn-rehearse").onclick = rehearse;
    $("btn-score").onclick = function () {
      renderScore(scoreRows(parseCSV($("s-in").value)));
    };
    $("btn-csv").onclick = exportCSV;
    $("btn-json").onclick = exportJSON;
    $("btn-ids").onclick = function () {
      document.body.classList.toggle("show-ids");
      $("btn-ids").textContent =
        document.body.classList.contains("show-ids") ? "hide IDs" : "show IDs";
    };
    $("btn-wipe").onclick = function () {
      if (!window.confirm("Delete all banked rounds and totals from this browser?\n\n"
        + "Export a backup first if you have not.")) return;
      DB = blank(); save(DB);
      renderTotals(); renderRoundPicker(); paintBanked();
    };

    $("btn-import").onclick = function () { $("file-import").click(); };
    $("file-import").onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        var r = importJSON(String(fr.result));
        var box = $("t-msg");
        box.innerHTML = "";
        if (r.err) { box.appendChild(el("p", "warn", esc(r.err))); return; }
        box.appendChild(el("p", "s-sum",
          "Imported " + r.added + (r.added === 1 ? " round" : " rounds")
          + (r.skipped ? ", skipped " + r.skipped + " already here" : "")
          + (r.bad ? ", ignored " + r.bad + " unreadable" : "") + "."
          + (r.stored ? "" : " NOTE: this browser refused to store them.")));
      };
      fr.onerror = function () {
        $("t-msg").innerHTML = "";
        $("t-msg").appendChild(el("p", "warn", "That file could not be read."));
      };
      fr.readAsText(f);
      this.value = "";                    /* so the same file can be picked again */
    };

    document.addEventListener("keydown", function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key.toLowerCase();
      if (k === " " || e.code === "Space") { e.preventDefault(); startStop(); }
      else if (k === "n") fresh();
      else if (k === "r") $("btn-reveal").click();
      else if (k === "arrowright") $("btn-next").click();
      else if (k === "t") $("btn-lang").click();
      else if (k >= "2" && k <= "6") { S.week = +k; S.idx = 0; fresh(); }
      else if (k === "escape") show("run");
      else if (k === "d") rehearse();               /* d for dry run */
      else if (k === "l") {                         /* l for leaderboard */
        if (LIVE.result && !LIVE.result.err) { renderScore(LIVE.result); show("score"); }
      }
    });

    loadPrefs();
    loadLive();
    if ($("ep-url")) { $("ep-url").value = LIVE.url; $("ep-key").value = LIVE.key; }
    S.code = newCode();
    renderRoundPicker();
    paintBanked();
    reset();
    paintLive();
    show("run");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* exposed for the test harness only */
  window.CALC_CONSOLE = {
    paramsFor: paramsFor, seedFor: seedFor, parseCSV: parseCSV, parseNum: parseNum,
    scoreRows: scoreRows, state: S, rehearse: rehearse, selfCheck: selfCheck,
    sniffDelim: sniffDelim,
    alias: alias, aliasWords: ALIAS_WORDS, prefs: PREFS, label: label,
    rowLabel: rowLabel,
    setPrefs: function (o) {
      if (o.show) PREFS.show = o.show;
      if (o.attempt) PREFS.attempt = o.attempt;
      savePrefs();
    },
    liveFetch: liveFetch, rowsToSheet: rowsToSheet, live: LIVE,
    saveLive: saveLive, poll: poll, autoMark: autoMark,
    importJSON: importJSON, totals: totals, codeUsed: codeUsed,
    setRound: function (w, i, code) { S.week = w; S.idx = i; S.code = code; reset(); },
    db: function () { return DB; }
  };
})();
