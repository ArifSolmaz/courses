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
  var STORE = "phy101-calc-v1";

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

  function newCode() { return 1000 + Math.floor(Math.random() * 9000); }

  /* ------------------------------------------------------------------ state */
  var S = {
    week: 2, idx: 0,          /* idx = which of the week's three */
    code: newCode(),
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
  function load() {
    try {
      var raw = window.localStorage.getItem(STORE);
      if (!raw) return { totals: {}, rounds: [], history: [] };
      var d = JSON.parse(raw);
      return { totals: d.totals || {}, rounds: d.rounds || [], history: d.history || [] };
    } catch (e) { return { totals: {}, rounds: [], history: [] }; }
  }
  function save(d) {
    try { window.localStorage.setItem(STORE, JSON.stringify(d)); return true; }
    catch (e) { return false; }
  }
  var DB = load();

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
    S.left = S.seconds; S.revealed = false;
    renderQuestion(); paintClock();
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
        + (DB.rounds.indexOf(h.key) >= 0 ? "   (already banked)" : ""));
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

  /* ---------------------------------------------------------------- scoring */
  /* A real CSV reader: Google Forms quotes any field containing a comma, and
     handles will contain commas sooner or later. */
  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false, i = 0;
    text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
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
      return { err: "Could not find a column for: " + missing.join(", ")
                 + ". Headers seen: " + head.join(" | ") };
    }

    var round = override || scoringRound();
    var ch = round.ch, wanted = round.code;
    var out = [], seen = {};
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      var code = parseInt(String(row[ci.code] || "").replace(/\D/g, ""), 10);
      if (!(code >= 1000 && code <= 9999)) continue;           /* other rounds */
      if (code !== wanted) continue;
      var id = String(row[ci.id] || "").trim();
      if (!id) continue;
      if (seen[id]) continue;                                   /* first try only */
      seen[id] = true;

      var p = paramsFor(ch, code);
      var val = parseNum(row[ci.ans]);
      var ok = isFinite(val) && MARK(ch, p, val);
      var which = null;
      if (!ok && isFinite(val)) {
        for (var k = 0; k < ch.traps.length; k++) {
          var tv = ch.traps[k].value(p);
          if (isFinite(tv) && Math.abs(val - tv) <= 0.01 * Math.abs(tv)) { which = k; break; }
        }
      }
      out.push({
        id: id,
        handle: (ci.handle >= 0 ? String(row[ci.handle] || "").trim() : "") || ("#" + id.slice(-3)),
        ts: ci.ts >= 0 ? String(row[ci.ts] || "").trim() : "",
        raw: String(row[ci.ans] || "").trim(),
        val: val, ok: ok, trap: which
      });
    }
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
    var byPts = out.slice().sort(function (a, b) { return b.points - a.points; });
    return { rows: out, board: byPts, ch: ch, code: wanted,
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

    var t = el("table", "board");
    t.innerHTML = "<thead><tr><th>#</th><th>handle</th><th>answer</th><th></th>"
                + "<th class='num'>pts</th></tr></thead>";
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
        + "<td class='handle'>" + esc(o.handle) + "</td>"
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
    box.appendChild(el("p", "fine",
      "Student IDs stay in this browser. Only handles appear in the table above, "
      + "so the projector never shows an ID."));
  }

  function commit(res) {
    var key = res.ch.id + "-" + res.code;
    if (DB.rounds.indexOf(key) >= 0) {
      window.alert("That round is already in the totals.");
      return;
    }
    DB.rounds.push(key);
    renderRoundPicker();
    res.rows.forEach(function (o) {
      var rec = DB.totals[o.id] || { handle: o.handle, points: 0, correct: 0, attempts: 0 };
      rec.handle = o.handle || rec.handle;
      rec.points += o.points;
      rec.correct += o.ok ? 1 : 0;
      rec.attempts += 1;
      DB.totals[o.id] = rec;
    });
    if (!save(DB)) {
      window.alert("The totals could not be stored in this browser, so they will be lost when "
        + "you close the tab. Export them now from the Totals panel.");
    }
    renderTotals();
    $("s-out").appendChild(el("p", "s-sum", "Added. " + DB.rounds.length + " rounds banked."));
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
        res.push({ name: name, ok: d === true || d == null, detail: d === true ? "" : String(d || "") });
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
      var li = el("li", r.ok ? "pass" : "fail");
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
    var ids = Object.keys(DB.totals);
    if (!ids.length) { box.appendChild(el("p", "fine", "No rounds banked yet.")); return; }
    ids.sort(function (a, b) { return DB.totals[b].points - DB.totals[a].points; });

    box.appendChild(el("p", "s-sum", ids.length + " students · " + DB.rounds.length + " rounds"));
    var t = el("table", "board");
    t.innerHTML = "<thead><tr><th>#</th><th>handle</th><th class='id-col'>student ID</th>"
                + "<th class='num'>correct</th><th class='num'>of</th>"
                + "<th class='num'>points</th></tr></thead>";
    var tb = el("tbody");
    ids.forEach(function (id, i) {
      var r = DB.totals[id];
      var tr = el("tr");
      tr.innerHTML = "<td class='num'>" + (i + 1) + "</td>"
        + "<td class='handle'>" + esc(r.handle) + "</td>"
        + "<td class='id-col'>" + esc(id) + "</td>"
        + "<td class='num'>" + r.correct + "</td>"
        + "<td class='num'>" + r.attempts + "</td>"
        + "<td class='num'>" + r.points + "</td>";
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    box.appendChild(t);
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
    var ids = Object.keys(DB.totals);
    ids.sort(function (a, b) { return DB.totals[b].points - DB.totals[a].points; });
    var lines = ["student_id,handle,correct,attempts,points"];
    ids.forEach(function (id) {
      var r = DB.totals[id];
      lines.push([id, '"' + String(r.handle).replace(/"/g, '""') + '"',
                  r.correct, r.attempts, r.points].join(","));
    });
    download("phy101-calc-points.csv", lines.join("\n") + "\n", "text/csv;charset=utf-8");
  }
  function exportJSON() {
    download("phy101-calc-backup.json", JSON.stringify(DB, null, 2), "application/json");
  }

  /* -------------------------------------------------------------------- tabs */
  function show(which) {
    ["run", "score", "totals", "check"].forEach(function (k) {
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
      stop(); S.revealed = true; remember(); renderQuestion(); paintClock();
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
      if (!window.confirm("Delete all banked rounds and totals from this browser?")) return;
      DB = { totals: {}, rounds: [], history: [] }; save(DB);
      renderTotals(); renderRoundPicker();
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
    });

    renderRoundPicker();
    reset();
    show("run");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* exposed for the test harness only */
  window.CALC_CONSOLE = {
    paramsFor: paramsFor, seedFor: seedFor, parseCSV: parseCSV, parseNum: parseNum,
    scoreRows: scoreRows, state: S, rehearse: rehearse, selfCheck: selfCheck,
    setRound: function (w, i, code) { S.week = w; S.idx = i; S.code = code; reset(); },
    db: function () { return DB; }
  };
})();
