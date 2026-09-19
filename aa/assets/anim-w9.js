/* ============================================================
   AA — week 9 "Try it yourself" animations (anagram case study)
   w9-checkoff · w9-brute · w9-crossover · w9-counter · w9-digits · w9-count-ratios
   Uses the shared helpers on AAAnim.ui (see anim.js).
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt, esc = U.esc;

  function sp(x) { return fmt(x).replace(/,/g, " "); }
  function pad(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }
  var ABC = "abcdefghijklmnopqrstuvwxyz";

  /* seeded stand-in for make_pair(n): genuine anagram pair of random lowercase letters */
  function makePair(n, seed) {
    var r = U.rng(seed), letters = [];
    for (var i = 0; i < n; i++) letters.push(ABC.charAt(Math.floor(r() * 26)));
    var sh = letters.slice();
    for (var k = sh.length - 1; k > 0; k--) { var j = Math.floor(r() * (k + 1)), t = sh[k]; sh[k] = sh[j]; sh[j] = t; }
    return [letters.join(""), sh.join("")];
  }
  /* faithful JS versions of §9.7 counters */
  function checkingOffOps(s1, s2, lens) {
    if (s1.length !== s2.length) return 0;
    var ops = 0, letters = s2.split("");
    for (var a = 0; a < s1.length; a++) {
      var found = false, start = ops;
      for (var i = 0; i < letters.length; i++) {
        ops++;
        if (letters[i] === s1.charAt(a)) { letters[i] = null; found = true; break; }
      }
      if (lens) lens.push(ops - start);
      if (!found) return ops;
    }
    return ops;
  }
  function countOps(s1, s2) {
    if (s1.length !== s2.length) return 0;
    var ops = 0, c1 = [], c2 = [], i;
    for (i = 0; i < 26; i++) { c1.push(0); c2.push(0); }
    for (i = 0; i < s1.length; i++) { c1[s1.charCodeAt(i) - 97]++; ops++; }
    for (i = 0; i < s2.length; i++) { c2[s2.charCodeAt(i) - 97]++; ops++; }
    for (i = 0; i < 26; i++) { ops++; if (c1[i] !== c2[i]) return ops; }
    return ops;
  }

  function codeBox(parent, src) {
    var box = h("div", "ct-code w9-code"), rows = [];
    src.split("\n").forEach(function (ln, j) {
      var r = h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + (U.pyLine(ln) || " ") + "</code>");
      box.appendChild(r); rows.push(r);
    });
    parent.appendChild(box);
    return {
      el: box,
      mark: function (on, hl, err) {
        rows.forEach(function (r, j) {
          r.className = "ct-line" + (on === j + 1 ? " on" : "") + ((hl || []).indexOf(j + 1) >= 0 ? " hl" : "") + (err === j + 1 ? " err" : "");
        });
        if (on && rows[on - 1] && box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, rows[on - 1].offsetTop - box.clientHeight / 2);
      }
    };
  }
  function quizRow(parent, label, choices, judge) {
    var row = h("div", "anim-opts w9-quiz");
    row.appendChild(h("span", "lab", label));
    var bs = choices.map(function (c) {
      var b = btn(c[1], "", function () {
        var ok = judge(c[0]);
        if (ok) { bs.forEach(function (x) { x.disabled = true; }); b.className = "right"; }
        else { b.className = "wrong"; b.disabled = true; }
      });
      row.appendChild(b); return b;
    });
    parent.appendChild(row);
    return { el: row, reset: function () { bs.forEach(function (b) { b.className = ""; b.disabled = false; }); } };
  }
  function numInput(ph, label) {
    var i = h("input"); i.type = "number"; i.min = "0"; i.step = "any"; i.placeholder = ph;
    i.setAttribute("aria-label", label);
    return i;
  }
  /* LineChart draws on a fixed 720px canvas; on phones use a narrower one so its text stays legible */
  function fitChart(chart, host) {
    var w = (host.clientWidth || 999) < 460 ? 380 : 720;
    if (chart.el.width !== w) chart.el.width = w;
  }
  function chartOn(host, opts) {
    var c = U.LineChart(host, opts), last = null, draw = c.draw;
    c.draw = function (series, d) { last = [series, d]; fitChart(c, host); draw(series, d); };
    var redraw = function () { if (last) c.draw(last[0], last[1]); };
    var det = host.closest ? host.closest("details") : null;
    if (det) det.addEventListener("toggle", redraw);
    window.addEventListener("resize", redraw);
    return c;
  }
  function watchTheme(fn) {
    new MutationObserver(fn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ============================================================
     Task 1 — instrument solution 1 (checking off)
     ============================================================ */
  function checkoff(host) {
    host.classList.add("w9-anim");
    var PAIRS = [["listen", "silent"], ["python", "typhon"], ["silence", "license"], ["listen", "silence"]];
    var pair = PAIRS[0];
    U.title(host, "Animation · count every comparison while crossing letters off");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("pair", PAIRS.map(function (p, j) { return [j, p[0] + " / " + p[1]]; }), 0, function (v) { pair = PAIRS[v]; ct.load(); }));
    opts.className += " w9-wrapseg";
    host.appendChild(opts);

    function code() {
      return "def checking_off_ops(s1, s2):\n    if len(s1) != len(s2):\n        return 0\n    ops = 0\n    letters = list(s2)\n    for letter in s1:\n        found = False\n" +
        "        for i in range(len(letters)):\n            ops += 1                         # one comparison\n            if letters[i] == letter:\n" +
        "                letters[i] = None\n                found = True\n                break\n        if not found:\n            return ops\n    return ops\n\n" +
        'print(checking_off_ops("' + pair[0] + '", "' + pair[1] + '"))';
    }
    function build() {
      var s1 = pair[0], s2 = pair[1], f = [], ops = 0, letters = null, lens = [];
      function fr(line, v, extra) {
        var o = { line: line, vars: { s1: s1, s2: s2 }, out: [], counters: { "comparisons (ops)": ops }, lens: lens.slice(), letters: letters ? letters.slice() : null };
        for (var k in v) o.vars[k] = v[k];
        for (var e in extra) o[e] = extra[e];
        return o;
      }
      f.push(fr(18, {}, { a: -1, note: "Call the instrumented version on <code>" + s1 + "</code> / <code>" + s2 + "</code>. Predict the count, then press <strong>play</strong>." }));
      f.push(fr(2, {}, { a: -1, note: "Lengths " + s1.length + " and " + s2.length + (s1.length === s2.length ? " match, so we go on." : " differ.") }));
      if (s1.length !== s2.length) {
        var e = fr(3, {}, { a: -1, done: true, note: "Different lengths: return <strong>0</strong> before a single letter comparison (the plain <code>anagram_checking_off</code> returns False here). A rejection can be very cheap." });
        e.out = ["0"]; f.push(e); return f;
      }
      f.push(fr(4, { ops: 0 }, { a: -1, note: "Start the counter at zero." }));
      letters = s2.split("");
      f.push(fr(5, { ops: 0, letters: letters.slice() }, { a: -1, note: "Copy <code>s2</code> into a list we can cross letters off." }));
      for (var a = 0; a < s1.length; a++) {
        var L = s1.charAt(a), start = ops, found = false;
        f.push(fr(6, { ops: ops, letters: letters.slice(), letter: L }, { a: a, note: "Next letter of s1: <strong>" + L + "</strong>. Search <code>letters</code> from the left for a partner." }));
        for (var i = 0; i < letters.length; i++) {
          ops++;
          var eq = letters[i] === L;
          f.push(fr(10, { ops: ops, letters: letters.slice(), letter: L, i: i }, { a: a, i: i, eq: eq, hl: [9],
            note: "ops = " + ops + ": is letters[" + i + "] " + (letters[i] === null ? "(None — already crossed off, but still compared)" : "= " + letters[i]) + " equal to " + L + "? " + (eq ? "<strong>Yes.</strong>" : "No.") }));
          if (eq) {
            letters[i] = null; found = true;
            lens.push(ops - start);
            f.push(fr(13, { ops: ops, letters: letters.slice(), letter: L, i: i, found: true }, { a: a, i: i, cross: true, hl: [11, 12],
              note: "Cross it off (set to None) and <code>break</code>. This search took <strong>" + (ops - start) + "</strong> comparison" + (ops - start > 1 ? "s" : "") + "." }));
            break;
          }
        }
        if (!found) {
          var nf = fr(15, { ops: ops, letters: letters.slice(), letter: L, found: false }, { a: a, done: true, note: "No partner for " + L + ": return early." });
          nf.out = [String(ops)]; f.push(nf); return f;
        }
      }
      var n = s1.length, last = fr(16, { ops: ops, letters: letters.slice() }, { a: s1.length, done: true });
      last.out = [String(ops)];
      last.note = "Done: <strong>" + ops + " comparisons</strong>. The search lengths were " + lens.join(", ") + " — a reshuffle of 1 … " + n +
        ", so the total is 1 + 2 + … + " + n + " = " + n + "·" + (n + 1) + "/2 = <strong>" + (n * (n + 1) / 2) + "</strong>. Now scale up below.";
      f.push(last);
      return f;
    }
    var rows = null;
    function onFrame(fr) {
      var ex = ct.extra;
      if (!rows || rows.pair !== pair) {
        ex.insertBefore(rowsBox, ex.firstChild);
        rows = { pair: pair };
      }
      var s1 = pair[0];
      r1.innerHTML = s1.split("").map(function (c, j) {
        return '<div class="cell' + (j === fr.a && !fr.done ? " on" : j < fr.a || fr.done && j <= fr.a ? " dim" : "") + '">' + c + "<small>" + j + "</small></div>";
      }).join("");
      var L = fr.letters;
      r2.innerHTML = L ? L.map(function (c, j) {
        var cls = "cell";
        if (j === fr.i) cls += fr.cross ? " good" : fr.eq ? " good" : " on";
        else if (c === null) cls += " w9-none";
        return '<div class="' + cls + '">' + (c === null ? "None" : c) + "<small>" + j + "</small></div>";
      }).join("") : '<div class="cell w9-empty">not made yet</div>';
      var n = s1.length;
      lensRow.innerHTML = fr.lens.length ? fr.lens.map(function (x) {
        return '<span class="w9-len" style="height:' + (8 + x / n * 40) + 'px" title="' + x + '"><b>' + x + "</b></span>";
      }).join("") : "";
    }
    var rowsBox = h("div", "");
    rowsBox.appendChild(h("div", "w9-cap", "s1 — the letter we are placing"));
    var r1 = h("div", "arr idx"); rowsBox.appendChild(r1);
    rowsBox.appendChild(h("div", "w9-cap", "letters — copy of s2; crossed-off entries stay in the list"));
    var r2 = h("div", "arr idx"); rowsBox.appendChild(r2);
    rowsBox.appendChild(h("div", "w9-cap", "comparisons each search took"));
    var lensRow = h("div", "w9-lens"); rowsBox.appendChild(lensRow);

    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: 3 });

    /* scale up: n = 100, 200, 400 */
    var big = h("div", "w9-panel");
    big.appendChild(h("div", "w9-h", "Scale up: genuine pairs from <code>make_pair(n)</code>"));
    var prow = h("div", "anim-opts");
    prow.appendChild(h("span", "lab", "your predictions:"));
    var preds = [100, 200, 400].map(function (n) {
      var i = numInput("n = " + n, "Predicted comparisons for n = " + n);
      prow.appendChild(i); return i;
    });
    var bRun = btn("count them", "primary", runBig);
    prow.appendChild(bRun);
    big.appendChild(prow);
    var tw = h("div", "anim-table-wrap"); big.appendChild(tw);
    var bopts = h("div", "anim-opts w9-barsopts");
    var bn = 100, sorted = false;
    bopts.appendChild(U.seg("bars for n =", [[100, "100"], [200, "200"], [400, "400"]], 100, function (v) { bn = v; drawBars(); }));
    bopts.appendChild(U.seg("order", [[false, "as searched"], [true, "sorted"]], false, function (v) { sorted = v; drawBars(); }));
    var cv = h("canvas", "w9-cv"); cv.width = 720; cv.height = 220;
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "One bar per letter of s1: how many comparisons its search took");
    var bmsg = h("p", "w9-fb", "");
    var shown = false;
    host.appendChild(big);
    var data = {};
    function runBig() {
      [100, 200, 400].forEach(function (n) {
        var p = makePair(n, n * 13 + 1), lens = [];
        data[n] = { ops: checkingOffOps(p[0], p[1], lens), lens: lens };
      });
      var rowsT = [100, 200, 400].map(function (n, j) {
        var d = data[n], pv = parseFloat(preds[j].value), pr = isNaN(pv) ? "—" : sp(pv) + (pv === d.ops ? " ✓" : "");
        return [n, sp(d.ops), sp(n * (n + 1) / 2), j ? "×" + (d.ops / data[n / 2].ops).toFixed(2) : "—", pr];
      });
      tw.innerHTML = "";
      U.table(tw, ["n", "comparisons", "n(n+1)/2", "ratio", "your prediction"]).rows(rowsT);
      if (!shown) { big.appendChild(bopts); big.appendChild(cv); big.appendChild(bmsg); shown = true; }
      bmsg.innerHTML = "Exactly <strong>5 050, 20 100 and 80 200</strong> — the formula n(n+1)/2 on the nose, with doubling ratios 3.98 and 3.99, approaching four. " +
        "Each bar below is one letter's search; flip to <em>sorted</em> to see why the total is a triangle.";
      drawBars();
    }
    function drawBars() {
      if (!data[bn]) return;
      var lens = data[bn].lens.slice();
      if (sorted) lens.sort(function (a, b) { return a - b; });
      var ctx = cv.getContext("2d"), W = cv.width, H = cv.height, c = function (v) { return U.cssVar(host, v); };
      var L = 40, B = 26, T = 10, pw = W - L - 10, ph = H - T - B;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c("--bg-soft"); ctx.fillRect(0, 0, W, H);
      ctx.font = "12px " + (c("--font-mono") || "monospace");
      ctx.fillStyle = c("--muted"); ctx.textAlign = "right";
      ctx.fillText(String(bn), L - 6, T + 10); ctx.fillText("0", L - 6, T + ph);
      ctx.textAlign = "left";
      ctx.fillText((sorted ? "sorted: 1, 2, …, " + bn + " — a triangle of area n(n+1)/2 = " : "search length of each letter of s1, in order — total ") + sp(bn * (bn + 1) / 2), L, H - 8);
      var bw = pw / lens.length;
      ctx.fillStyle = c("--accent");
      lens.forEach(function (x, j) {
        var bh = x / bn * ph;
        ctx.fillRect(L + j * bw, T + ph - bh, Math.max(1, bw - (bw > 3 ? 1 : 0)), bh);
      });
    }
    watchTheme(drawBars);
    ct.load();
  }

  /* ============================================================
     Task 2 — how far can brute force go?
     ============================================================ */
  function brute(host) {
    host.classList.add("w9-anim");
    var n = 3, kind = "non";
    U.title(host, "Animation · every rearrangement, one at a time");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("pair", [["non", "non-anagram (forces exhaustion)"], ["ana", "anagram"]], "non", function (v) { kind = v; ct.load(); }));
    opts.appendChild(U.seg("n", [[3, "3"], [4, "4"]], 3, function (v) { n = v; ct.load(); }));
    host.appendChild(opts);
    function words() {
      if (kind === "non") { var a = ""; for (var i = 0; i < n; i++) a += "a"; return [a, a.slice(1) + "b"]; }
      return n === 3 ? ["abc", "cab"] : ["abcd", "cabd"];
    }
    function code() {
      var w = words();
      return "from itertools import permutations\n\ndef anagram_brute_force(s1, s2):\n    if len(s1) != len(s2):\n        return False\n" +
        "    for candidate in permutations(s1):\n        if \"\".join(candidate) == s2:\n            return True\n    return False\n\n" +
        "print(anagram_brute_force(\"" + w[0] + "\", \"" + w[1] + "\"))";
    }
    function perms(k) {             /* itertools.permutations order, as index tuples */
      var out = [];
      (function rec(pre, rest) {
        if (!rest.length) { out.push(pre); return; }
        for (var i = 0; i < rest.length; i++) rec(pre.concat([rest[i]]), rest.slice(0, i).concat(rest.slice(i + 1)));
      })([], Array.apply(null, Array(k)).map(function (_, i) { return i; }));
      return out;
    }
    function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
    function build() {
      var w = words(), s1 = w[0], s2 = w[1], f = [], P = perms(n), chars = 0, list = [];
      f.push({ line: 11, vars: { s1: s1, s2: s2 }, out: [], counters: { candidates: 0, "characters joined": 0 }, list: [],
        note: "A word of " + n + " positions has " + n + "! = " + fact(n) + " positional rearrangements. Press <strong>play</strong> to try them in order." });
      f.push({ line: 4, vars: { s1: s1, s2: s2 }, out: [], counters: { candidates: 0, "characters joined": 0 }, list: [], note: "Same length — start generating." });
      for (var k = 0; k < P.length; k++) {
        var cand = P[k].map(function (i) { return s1.charAt(i); }), joined = cand.join("");
        chars += n;
        var eq = joined === s2;
        list = list.concat([{ idx: P[k], s: joined, eq: eq }]);
        f.push({ line: 7, hl: [6], vars: { s1: s1, s2: s2, candidate: cand, '"".join(candidate)': joined }, out: [], list: list, cur: P[k],
          counters: { candidates: (k + 1) + " / " + fact(n), "characters joined": chars },
          note: "Candidate " + (k + 1) + " uses positions (" + P[k].join(", ") + ") → <code>" + joined + "</code>. Equal to <code>" + s2 + "</code>? " + (eq ? "<strong>Yes.</strong>" : "No.") +
            (kind === "non" && k > 0 ? " <span class='muted'>(Same string as before — permutations works on positions, so repeated letters give repeated strings.)</span>" : "") });
        if (eq) {
          f.push({ line: 8, vars: { s1: s1, s2: s2 }, out: ["True"], list: list, counters: { candidates: (k + 1) + " / " + fact(n), "characters joined": chars }, done: true,
            note: "Found after " + (k + 1) + " of " + fact(n) + " candidates — early success can stop much sooner. The timing task uses a non-anagram so that <em>every</em> candidate is tried." });
          return f;
        }
      }
      f.push({ line: 9, vars: { s1: s1, s2: s2 }, out: ["False"], list: list, counters: { candidates: fact(n) + " / " + fact(n), "characters joined": chars }, done: true,
        note: "Exhausted: all <strong>" + fact(n) + "</strong> candidates tried, each costing a join of " + n + " characters → " + chars + " characters = n · n!. Adding one letter multiplies the candidate count by n + 1, but the characters joined by (n + 1)² / n (each candidate is longer too)." });
      return f;
    }
    function onFrame(fr) {
      var ex = ct.extra;
      if (!chips.parentNode) ex.insertBefore(chipsBox, ex.firstChild);
      var w = words();
      tiles.innerHTML = w[0].split("").map(function (c, i) {
        var pos = fr.cur ? fr.cur.indexOf(i) : -1;
        return '<div class="cell' + (fr.cur ? " on" : "") + '">' + c + "<sub>" + i + "</sub>" + (pos >= 0 ? "<small>→" + pos + "</small>" : "<small>&nbsp;</small>") + "</div>";
      }).join("");
      chips.innerHTML = fr.list.map(function (x, j) {
        return '<span class="w9-chip' + (x.eq ? " hit" : "") + (j === fr.list.length - 1 && !fr.done ? " now" : "") + '">' + x.s + "<i>" + x.idx.join("") + "</i></span>";
      }).join("");
    }
    var chipsBox = h("div", "");
    chipsBox.appendChild(h("div", "w9-cap", "s1 by position (arrow = where this candidate puts it)"));
    var tiles = h("div", "arr idx"); chipsBox.appendChild(tiles);
    chipsBox.appendChild(h("div", "w9-cap", "candidates generated so far (small digits = position order)"));
    var chips = h("div", "w9-chips"); chipsBox.appendChild(chips);
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: function (i, fr) { return fr.length > 20 ? 3 : 1.6; } });

    /* timing table + prediction */
    var P = h("div", "w9-panel");
    P.appendChild(h("div", "w9-h", "Time it at n = 6, 7, 8, 9 — then predict n = 12"));
    var model = "cand";
    var mo = h("div", "anim-opts");
    mo.appendChild(U.seg("cost model", [["cand", "constant per candidate (n!)"], ["join", "join costs n (n · n!)"]], "cand", function (v) { model = v; if (tabled) table(); checkPred(true); }));
    mo.className += " w9-wrapseg";
    P.appendChild(mo);
    var bT = btn("run n = 6 … 9 (simulated)", "primary", function () { tabled = true; table(); });
    var tr = h("div", "anim-opts"); tr.appendChild(bT); P.appendChild(tr);
    var tw = h("div", "anim-table-wrap"); P.appendChild(tw);
    var note = h("p", "note-sim", "Simulated timings from a cost model calibrated so n = 9 takes 1.00 s (the page's illustrative run), with ±3% seeded noise on the other rows — run the real code in Colab for your own numbers.");
    var pr = h("div", "anim-opts");
    pr.appendChild(h("span", "lab", "your prediction for n = 12:"));
    var pin = numInput("minutes", "Predicted time for n = 12, in minutes");
    pr.appendChild(pin);
    pr.appendChild(h("span", "lab", "minutes"));
    var bP = btn("check", "", function () { checkPred(false); });
    pr.appendChild(bP);
    var pm = h("p", "w9-fb", "");
    pm.setAttribute("aria-live", "polite");
    var chartBox = h("div", "");
    var tabled = false, checked = false, chart = null;
    host.appendChild(P);
    function T(k) { return model === "cand" ? fact(k) / fact(9) : (k * fact(k)) / (9 * fact(9)); }
    function table() {
      var r = U.rng(model === "cand" ? 91 : 92), rows = [], prev = null;
      for (var k = 6; k <= 9; k++) {
        var t = T(k) * (k === 9 ? 1 : 1 + 0.06 * (r() - 0.5));
        rows.push([k, sp(fact(k)), t.toPrecision(3), prev ? "×" + (t / prev).toFixed(2) : "—"]);
        prev = t;
      }
      tw.innerHTML = "";
      U.table(tw, ["n", "candidates n!", "seconds", "ratio"]).rows(rows, 3);
      if (!note.parentNode) { P.appendChild(note); P.appendChild(pr); P.appendChild(pm); P.appendChild(chartBox); }
      if (!checked) pm.innerHTML = "Each step up multiplies the time by about " + (model === "cand" ? "n (7, 8, 9)" : "n · n/(n−1) (≈ 8.2, 9.1, 10.1)") + ". Extrapolate from the 1.00 s at n = 9 to n = 12.";
    }
    function human(s) {
      if (s < 120) return (+s.toFixed(1)) + " seconds";
      if (s < 7200) return (+(s / 60).toFixed(1)) + " minutes";
      if (s < 172800) return (+(s / 3600).toFixed(1)) + " hours";
      if (s < 3.1536e7 * 2) return (+(s / 86400).toFixed(1)) + " days";
      return sp(Math.round(s / 3.1536e7)) + " years";
    }
    function checkPred(silent) {
      if (silent && !checked) return;
      var v = parseFloat(pin.value);
      if (isNaN(v) && !silent) { pm.innerHTML = "Type a number of minutes first."; return; }
      checked = true;
      var t12 = T(12), mins = t12 / 60, ok = !isNaN(v) && Math.abs(v - mins) <= mins * 0.1;
      var chain = model === "cand" ? "12!/9! = 10 × 11 × 12 = <strong>1 320</strong>, so 1 s × 1 320 = 1 320 s = <strong>22 minutes</strong>"
        : "(12 · 12!)/(9 · 9!) = 1 320 × 12/9 = 1 760, so 1 760 s ≈ <strong>29.3 minutes</strong>";
      var fifteen = model === "cand" ? "15!/9! = 3 603 600 seconds, about <strong>41.7 days</strong>" : "3 603 600 × 15/9 = 6 006 000 seconds, about <strong>69.5 days</strong>";
      pm.innerHTML = (isNaN(v) ? "" : ok ? "Your " + v + " minutes is right. " : "You said " + v + " minutes. ") + chain + ". At n = 15 it is " + fifteen +
        ". Would you wait? For 12, maybe with a coffee; for 15, no. These are extrapolations for exhaustive searches, not guaranteed durations.";
      drawChart();
    }
    function drawChart() {
      if (!chart) {
        chartBox.innerHTML = "";
        chart = chartOn(chartBox, { logy: true, xlabel: "word length n", ylabel: "predicted seconds", height: 300, label: "Predicted brute-force time for n = 6 to 15 on a log scale, with one minute, one hour and one day marked" });
        watchTheme(function () { if (checked) drawChart(); });
      }
      var pts = [], x;
      for (x = 6; x <= 15; x++) pts.push([x, T(x)]);
      function ref(v) { return [[6, v], [15, v]]; }
      chart.draw([
        { name: model === "cand" ? "n!/9! s" : "n·n!/(9·9!) s", color: "--accent", points: pts },
        { name: "1 minute", color: "--green", points: ref(60), dashed: true, noDots: true },
        { name: "1 hour", color: "--blue", points: ref(3600), dashed: true, noDots: true },
        { name: "1 day", color: "--red", points: ref(86400), dashed: true, noDots: true }
      ]);
    }
    ct.load();
  }

  /* ============================================================
     Task 3 — find the crossover (or honestly report none)
     ============================================================ */
  function crossover(host) {
    host.classList.add("w9-anim");
    var MAX = 100000, K = 18, inside = false, call = null;
    var CS = 1.34e-8;                    /* sort: seconds per n·log2(n) unit (illustrative) */
    var CM = 1.2e-6;                     /* make_pair: seconds per letter (illustrative) */
    U.title(host, "Animation · sort vs count as n grows — where do they cross?");
    var o1 = h("div", "anim-opts");
    o1.appendChild(U.seg("test up to n =", [[100000, "100 000"], [1000000, "1 000 000"], [10000000, "10 000 000"]], MAX, function (v) { MAX = v; player.load(); }));
    host.appendChild(o1);
    var o2 = h("div", "anim-opts");
    o2.appendChild(h("span", "lab", "one counting step costs"));
    var sl = h("input"); sl.type = "range"; sl.min = "10"; sl.max = "28"; sl.step = "1"; sl.value = String(K);
    sl.setAttribute("aria-label", "How many sort steps one counting step costs");
    var kv = h("span", "lab", "");
    o2.appendChild(sl); o2.appendChild(kv);
    sl.addEventListener("input", function () { K = +sl.value; sync(); player.load(); });
    host.appendChild(o2);
    var o3 = h("div", "anim-opts");
    o3.appendChild(U.seg("timer scope", [[false, "pairs built outside the timer"], [true, "make_pair inside the timer"]], false, function (v) { inside = v; player.load(); }));
    o3.className += " w9-wrapseg";
    host.appendChild(o3);
    var o4 = h("div", "anim-opts");
    o4.appendChild(U.seg("your call", [["sort", "sort stays faster"], ["count", "count overtakes"]], null, function (v) { call = v; }));
    host.appendChild(o4);
    function sync() { kv.innerHTML = "× " + K + " a sort step <span class='muted'>(model crossover n* = 2<sup>" + K + "</sup> ≈ " + sp(Math.pow(2, K)) + ")</span>"; }

    var chart = chartOn(host, { logx: true, logy: true, xlabel: "n (word length)", ylabel: "seconds", height: 300, label: "Simulated times for sorting and counting against n, log–log" });
    host.appendChild(h("p", "note-sim", "Simulated timings from cost models — sort: c·n·log₂n, count: " + "k·c·n, pair building: a fixed cost per letter — with ±3% seeded noise. Constants are illustrative; run the real benchmark in Colab for your own numbers."));
    var tw = h("div", "anim-table-wrap"); host.appendChild(tw);
    var tbl = U.table(tw, ["n", "sort s", "count s", "faster"]);
    var m = U.msg(host);
    var rows = [];
    function build() {
      var r = U.rng(K * 1000 + MAX % 977 + (inside ? 5 : 0)), f = [{ k: 0 }];
      rows = [];
      for (var j = 10; j >= 0; j--) {
        var n = Math.round(MAX / Math.pow(2, j));
        var base = inside ? CM * n : 0;
        var ts = (CS * n * Math.log(n) / Math.LN2 + base) * (1 + 0.06 * (r() - 0.5));
        var tc = (K * CS * n + 26 * 5e-8 + base) * (1 + 0.06 * (r() - 0.5));
        rows.push({ n: n, s: ts, c: tc });
        f.push({ k: rows.length });
      }
      return f;
    }
    function fmtT(t) { return t < 0.001 ? t.toExponential(2) : t.toFixed(4); }
    function render(fr, i, frames) {
      var shown = rows.slice(0, fr.k);
      chart.draw([
        { name: "sorted(s1) == sorted(s2)", color: "--blue", points: rows.map(function (x) { return [x.n, x.s]; }) },
        { name: "count and compare", color: "--accent", points: rows.map(function (x) { return [x.n, x.c]; }) }
      ], { upto: fr.k });
      tbl.rows(shown.map(function (x) { return [sp(x.n), fmtT(x.s), fmtT(x.c), x.s <= x.c ? "sort" : "<b>count</b>"]; }), fr.k - 1);
      if (fr.k === 0) { m.innerHTML = "Make your call above, then press <strong>play</strong> to benchmark doubling sizes up to n = " + sp(MAX) + "."; return; }
      if (fr.k < rows.length) { var x = shown[shown.length - 1]; m.innerHTML = "n = " + sp(x.n) + ": " + (x.s <= x.c ? "sorting" : "counting") + " is faster by ×" + (Math.max(x.s, x.c) / Math.min(x.s, x.c)).toFixed(2) + "."; return; }
      /* verdict: first size from which count is faster at every later size */
      var from = -1;
      for (var q = rows.length - 1; q >= 0; q--) { if (rows[q].c < rows[q].s) from = q; else break; }
      var lo = sp(rows[0].n), hi = sp(rows[rows.length - 1].n), txt;
      if (from > 0) {
        txt = "In this simulated run counting pulls ahead between n = " + sp(rows[from - 1].n) + " and n = " + sp(rows[from].n) + " and stays ahead — a crossover inside the tested range (the model puts it near 2<sup>" + K + "</sup> ≈ " + sp(Math.pow(2, K)) + ").";
      } else if (from === 0) {
        txt = "Counting is faster at every tested size, n = " + lo + " … " + hi + " — no crossover to report inside this range.";
      } else {
        txt = "<strong>No crossover</strong> in the tested range n = " + lo + " … " + hi + " for this input family (random lowercase genuine anagrams). Report exactly that — do not invent one beyond the data.";
      }
      if (inside) txt += " Careful: with <code>make_pair</code> inside the timer both columns mostly measure pair building, so the two lines nearly coincide and noise can flip the winner. Build inputs outside the timer.";
      if (call) {
        var saw = from >= 0 && rows[rows.length - 1].c < rows[rows.length - 1].s;
        txt += " Your call (“" + (call === "sort" ? "sort stays faster" : "count overtakes") + "”) " + ((call === "count") === saw ? "matches this run." : "does not match this run.");
      }
      m.innerHTML = txt;
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.5; } });
    sync();
    player.load();
  }

  /* ============================================================
     Task 4 — a fifth solution: Counter vs the 26-slot lists
     ============================================================ */
  function counter(host) {
    host.classList.add("w9-anim");
    var PAIRS = [["listen", "silent"], ["café", "éfac"], ["Listen", "Silent"]];
    var pair = PAIRS[0];
    var SRC4 = "def anagram_count(s1, s2):\n    if len(s1) != len(s2):\n        return False\n\n    counts1 = [0] * 26          # one slot per letter a-z\n    counts2 = [0] * 26\n\n" +
      "    for letter in s1:                          # n steps\n        counts1[ord(letter) - ord('a')] += 1\n    for letter in s2:                          # n steps\n        counts2[ord(letter) - ord('a')] += 1\n\n" +
      "    for i in range(26):                        # up to 26 checks; all 26 for anagrams\n        if counts1[i] != counts2[i]:\n            return False\n    return True";
    var SRCC = "from collections import Counter\n\ndef anagram_counter(s1, s2):\n    return Counter(s1) == Counter(s2)";
    U.title(host, "Animation · same class, different machinery");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("pair", PAIRS.map(function (p, j) { return [j, p[0] + " / " + p[1]]; }), 0, function (v) { pair = PAIRS[v]; player.load(); }));
    host.appendChild(opts);

    var grid = h("div", "w9-duo");
    var left = h("div", "w9-side"), right = h("div", "w9-side");
    grid.appendChild(left); grid.appendChild(right);
    host.appendChild(grid);
    left.appendChild(h("div", "w9-h", "solution 4 · two 26-slot lists"));
    var cb4 = codeBox(left, SRC4);
    var slots = [];
    ["counts1", "counts2"].forEach(function (nm) {
      left.appendChild(h("div", "w9-cap", nm));
      var g = h("div", "w9-slots"), arr = [];
      for (var i = 0; i < 26; i++) { var c = h("div", "w9-slot", "<i>" + ABC.charAt(i) + "</i><b>0</b>"); g.appendChild(c); arr.push(c); }
      left.appendChild(g); slots.push(arr);
    });
    var st4 = h("div", "anim-stats"); left.appendChild(st4);
    right.appendChild(h("div", "w9-h", "anagram_counter · collections.Counter (conceptual distinct-key comparison)"));
    var cbc = codeBox(right, SRCC);
    var dicts = [];
    ["Counter(s1)", "Counter(s2)"].forEach(function (nm) {
      right.appendChild(h("div", "w9-cap", nm));
      var d = h("div", "w9-dict", "{}"); right.appendChild(d); dicts.push(d);
    });
    var stc = h("div", "anim-stats"); right.appendChild(stc);
    var m = U.msg(host);

    function slotOf(ch) {                /* Python: counts[ord(ch) - ord('a')] with negative indexing */
      var v = ch.charCodeAt(0) - 97;
      if (v < -26 || v >= 26) return { err: true, v: v };
      return { i: v < 0 ? v + 26 : v, v: v };
    }
    function build() {
      var s1 = pair[0], s2 = pair[1], f = [], c1 = [], c2 = [], i;
      for (i = 0; i < 26; i++) { c1.push(0); c2.push(0); }
      var d1 = {}, k1 = [], d2 = {}, k2 = [], up4 = 0, upC = 0, chk4 = 0, chkC = 0, err = null, errLine = 0, res4 = null, resC = null;
      function snap(extra) {
        var o = { c1: c1.slice(), c2: c2.slice(), d1: k1.map(function (k) { return [k, d1[k]]; }), d2: k2.map(function (k) { return [k, d2[k]]; }),
          up4: up4, upC: upC, chk4: chk4, chkC: chkC, err: err, e4: errLine, res4: res4, resC: resC };
        for (var e in extra) o[e] = extra[e];
        return o;
      }
      f.push(snap({ l4: 0, lc: 0, note: "Both functions get <code>" + esc(s1) + "</code> and <code>" + esc(s2) + "</code>. Press <strong>play</strong> and watch them work side by side." }));
      var words = [[s1, c1, d1, k1, 9, 0], [s2, c2, d2, k2, 11, 1]];
      for (var w = 0; w < 2; w++) {
        var W = words[w];
        for (var p = 0; p < W[0].length; p++) {
          var ch = W[0].charAt(p), so = slotOf(ch), note;
          if (!(ch in W[2])) { W[2][ch] = 0; W[3].push(ch); }
          W[2][ch]++; upC++;
          if (err === null) {
            if (so.err) {
              err = "IndexError: list index out of range"; errLine = W[4];
              note = "<code>ord('" + ch + "') - ord('a')</code> = " + so.v + " — outside 0–25, so solution 4 crashes with <strong>IndexError</strong>. Counter just adds a key '" + ch + "'.";
              f.push(snap({ l4: W[4], lc: 4, slot: -1, list: W[5], key: ch, dict: W[5], note: note }));
              continue;
            }
            W[1][so.i]++; up4++;
            note = "Letter <strong>" + esc(ch) + "</strong>: solution 4 adds 1 to slot " + so.v + (so.v < 0 ? " — negative! Python wraps it to slot " + so.i + " ('" + ABC.charAt(so.i) + "'), silently counting in the wrong place" : " ('" + ch + "')") +
              "; Counter adds 1 to key '" + esc(ch) + "'. One step each.";
          } else {
            note = "Solution 4 has already crashed. Counter keeps going: key '" + esc(ch) + "'.";
          }
          f.push(snap({ l4: err ? 0 : W[4], lc: 4, slot: err ? -1 : so.i, list: W[5], key: ch, dict: W[5], note: note }));
        }
      }
      /* final checks: 26 slots vs dict comparison over keys */
      var same = k1.length === k2.length && k1.every(function (k) { return d1[k] === d2[k]; });
      var keysToCheck = k1.length === k2.length ? k1 : [];
      var steps = Math.max(err ? 0 : 26, keysToCheck.length);
      for (i = 0; i < steps; i++) {
        var o = { note: "" };
        var parts = [];
        if (!err && res4 === null && i < 26) {
          chk4++;
          o.l4 = 14; o.cmp = i;
          if (c1[i] !== c2[i]) { res4 = false; parts.push("Solution 4, slot " + i + " ('" + ABC.charAt(i) + "'): " + c1[i] + " ≠ " + c2[i] + " → <strong>False</strong>."); }
          else parts.push("Solution 4 checks slot " + i + " ('" + ABC.charAt(i) + "'): " + c1[i] + " = " + c2[i] + ".");
        } else o.l4 = err ? 0 : 16;
        if (resC === null) {
          if (i < keysToCheck.length) {
            var key = keysToCheck[i];
            chkC++;
            o.lc = 4; o.ckey = key;
            if (d1[key] !== d2[key]) { resC = false; parts.push("Counter, key '" + esc(key) + "': " + d1[key] + " ≠ " + (d2[key] || 0) + " → <strong>False</strong>."); }
            else if (i === keysToCheck.length - 1) { resC = true; parts.push("Counter checked its " + keysToCheck.length + " keys: all equal → <strong>True</strong>."); }
            else parts.push("Counter compares key '" + esc(key) + "': " + d1[key] + " = " + d2[key] + ".");
          } else if (!keysToCheck.length) { resC = same; parts.push("Counter: different sets of keys → <strong>False</strong>."); }
        }
        o.note = parts.join(" ");
        f.push(snap(o));
        if ((res4 !== null || err) && resC !== null) break;
      }
      if (res4 === null && !err) res4 = true;
      if (resC === null) resC = same;
      var last = snap({ l4: err ? 0 : res4 ? 16 : 15, lc: 4, done: true });
      var r4 = err ? "crashes (IndexError)" : String(res4 ? "True" : "False");
      last.note = "Solution 4: <strong>" + r4 + "</strong> after " + up4 + " tally updates and " + chk4 + " slot checks. Counter: <strong>" + (resC ? "True" : "False") + "</strong> after " + upC + " updates and " + chkC + " distinct-key check" + (chkC === 1 ? "" : "s") + " in this conceptual model (not an exact count of CPython Counter internals). " +
        (err ? "Counter supports a broader alphabet; the 26-slot list assumes a–z only." :
          pair[0] === "Listen" ? "Uppercase letters gave <em>negative</em> slot numbers — Python wrapped them silently. The 26-slot version needs validated input." :
            "Both visit every character once: same O(n) class. The difference is the work per step — a list slot vs a hash-table entry — and the fixed part: 26 + 26 slots vs k + k keys (k = " + k1.length + ").");
      f.push(last);
      return f;
    }
    function statHtml(o) { return Object.keys(o).map(function (k) { return '<span class="anim-stat">' + k + "<b>" + o[k] + "</b></span>"; }).join(""); }
    function render(fr) {
      var e4 = fr.err && fr.e4;
      cb4.mark(e4 ? 0 : fr.l4, [], e4 || 0);
      cbc.mark(fr.lc, []);
      [fr.c1, fr.c2].forEach(function (c, w) {
        slots[w].forEach(function (el, i) {
          el.lastChild.textContent = c[i];
          el.className = "w9-slot" + (c[i] ? " full" : "") + (fr.list === w && fr.slot === i ? " now" : "") +
            (fr.cmp === i ? (fr.c1[i] === fr.c2[i] ? " ok" : " bad") : fr.cmp > i ? " seen" : "");
        });
      });
      [fr.d1, fr.d2].forEach(function (d, w) {
        dicts[w].innerHTML = "{" + d.map(function (kv) {
          var cls = (fr.dict === w && fr.key === kv[0]) ? "now" : fr.ckey === kv[0] ? "cmp" : "";
          return '<span class="' + cls + '">\'' + esc(kv[0]) + "': " + kv[1] + "</span>";
        }).join(", ") + "}";
      });
      st4.innerHTML = statHtml({ "tally updates": fr.up4, "slot checks": fr.chk4 + " / 26", "result": fr.done ? (fr.err ? "IndexError" : fr.res4 ? "True" : "False") : "…" });
      stc.innerHTML = statHtml({ "tally updates": fr.upC, "distinct-key checks (model)": fr.chkC, "result": fr.resC === null ? "…" : fr.resC ? "True" : "False" });
      st4.classList.toggle("w9-crash", !!fr.err);
      m.innerHTML = fr.note;
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 2; } });

    /* benchmark (simulated) */
    var B = h("div", "w9-panel");
    B.appendChild(h("div", "w9-h", "Benchmark both on long words"));
    var bb = btn("benchmark n = 1 000 … 64 000 (simulated)", "", bench);
    var br = h("div", "anim-opts"); br.appendChild(bb); B.appendChild(br);
    var bout = h("div", ""); B.appendChild(bout);
    host.appendChild(B);
    var chart = null;
    function bench() {
      var r = U.rng(404), rows = [], p4 = null, pc = null, s4 = [], scn = [];
      for (var n = 1000; n <= 64000; n *= 2) {
        var t4 = (2 * n * 1.1e-7 + 3e-6) * (1 + 0.04 * (r() - 0.5));
        var tc = (2 * n * 4.0e-8 + 9e-6) * (1 + 0.04 * (r() - 0.5));
        rows.push([sp(n), (t4 * 1000).toFixed(3), p4 ? "×" + (t4 / p4).toFixed(2) : "—", (tc * 1000).toFixed(3), pc ? "×" + (tc / pc).toFixed(2) : "—"]);
        s4.push([n, t4]); scn.push([n, tc]); p4 = t4; pc = tc;
      }
      bout.innerHTML = "";
      var tw = h("div", "anim-table-wrap"); bout.appendChild(tw);
      U.table(tw, ["n", "solution 4 ms", "ratio", "Counter ms", "ratio"]).rows(rows);
      chart = chartOn(bout, { logx: true, logy: true, xlabel: "n", ylabel: "seconds", height: 260, label: "Simulated times for solution 4 and Counter, log–log: two parallel lines" });
      chart.draw([{ name: "solution 4 (26-slot lists)", color: "--accent", points: s4 }, { name: "Counter", color: "--blue", points: scn }]);
      bout.appendChild(h("p", "note-sim", "Simulated timings from a cost model with illustrative constants (solution 4: 110 ns per letter + 3 µs; Counter: 40 ns per letter + 9 µs) and ±2% seeded noise — benchmark the real functions in Colab; do not assume which is faster."));
      bout.appendChild(h("p", "w9-fb", "Both ratio columns settle at about ×2 and the lines on the log–log plot are parallel: the <strong>same class, O(n)</strong>. " +
        "The vertical gap is the constant: how much work each letter costs (Counter counts in C and uses a hash table; solution 4 does Python-level <code>ord</code> arithmetic and list indexing) plus the fixed setup. " +
        "In this model Counter wins on long words; your measurement decides for your machine."));
    }
    player.load();
  }

  /* ============================================================
     Task 5 — digits: add for one list, subtract for the other
     ============================================================ */
  function digits(host) {
    host.classList.add("w9-anim");
    var PRE = [[[3, 1, 4, 1], [1, 4, 3, 1]], [[3, 1, 4, 1], [1, 4, 3, 3]], [[2, 7, 1, 8, 2, 8], [8, 2, 8, 1, 7]]];
    var A = PRE[0][0], Bv = PRE[0][1];
    U.title(host, "Animation · one 10-slot list: +1 for a, −1 for b");
    var opts = h("div", "anim-opts");
    var presetSeg = U.seg("example", [[0, "[3,1,4,1] / [1,4,3,1]"], [1, "[3,1,4,1] / [1,4,3,3]"], [2, "different lengths"]], 0, function (v) {
      A = PRE[v][0]; Bv = PRE[v][1]; ia.value = A.join(", "); ib.value = Bv.join(", "); ct.load();
    });
    opts.appendChild(presetSeg);
    opts.className += " w9-wrapseg";
    host.appendChild(opts);
    var o2 = h("div", "anim-opts");
    function txt(label) {
      var i = h("input", "w9-text"); i.type = "text"; i.setAttribute("aria-label", label); return i;
    }
    var ia = txt("List a: digits 0 to 9 separated by commas"), ib = txt("List b: digits 0 to 9 separated by commas");
    ia.value = A.join(", "); ib.value = Bv.join(", ");
    o2.appendChild(h("span", "lab", "a"));
    o2.appendChild(ia);
    o2.appendChild(h("span", "lab", "b"));
    o2.appendChild(ib);
    o2.appendChild(btn("use", "", function () {
      var a = parse(ia.value), b = parse(ib.value);
      if (!a || !b) { m2.innerHTML = "Use whole numbers <strong>0–9</strong> only, up to 12 per list. (The function assumes that: 10 would raise IndexError, and −1 would silently use slot 9.)"; return; }
      m2.innerHTML = "";
      presetSeg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      A = a; Bv = b; ct.load();
    }));
    host.appendChild(o2);
    var m2 = h("p", "w9-fb", ""); host.appendChild(m2);
    function parse(s) {
      var parts = s.split(/[\s,]+/).filter(function (x) { return x !== ""; });
      if (!parts.length || parts.length > 12) return null;
      var out = [];
      for (var i = 0; i < parts.length; i++) { if (!/^\d$/.test(parts[i])) return null; out.push(+parts[i]); }
      return out;
    }
    function lst(a) { return "[" + a.join(", ") + "]"; }
    function code() {
      return "def same_multiset(a, b):\n    if len(a) != len(b):\n        return False\n    counts = [0] * 10          # one slot per digit 0-9\n" +
        "    for x in a:\n        counts[x] += 1\n    for x in b:\n        counts[x] -= 1         # cancel out\n    return all(c == 0 for c in counts)\n\n" +
        "print(same_multiset(" + lst(A) + ", " + lst(Bv) + "))";
    }
    function build() {
      var a = A, b = Bv, f = [], counts = null, up = 0, chk = 0;
      function fr(line, v, extra) {
        var o = { line: line, vars: { a: a, b: b }, out: [], counts: counts ? counts.slice() : null, counters: { "tally updates": up, "zero checks": chk } };
        for (var k in v) o.vars[k] = v[k];
        for (var e in extra) o[e] = extra[e];
        return o;
      }
      f.push(fr(11, {}, { note: "Two lists of digits. Predict: will every slot cancel to zero? Press <strong>play</strong>." }));
      f.push(fr(2, {}, { note: "Lengths " + a.length + " and " + b.length + "." }));
      if (a.length !== b.length) {
        var e = fr(3, {}, { done: true, note: "Different lengths → <strong>False</strong> at once. No counting needed." });
        e.out = ["False"]; f.push(e); return f;
      }
      counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      f.push(fr(4, { counts: counts.slice() }, { note: "Ten slots, one per digit. No <code>ord</code> arithmetic needed: the digit <em>is</em> the slot number." }));
      var i, x;
      for (i = 0; i < a.length; i++) {
        x = a[i];
        f.push(fr(5, { counts: counts.slice(), x: x }, { la: i, note: "From <code>a</code>: x = " + x + "." }));
        counts[x]++; up++;
        f.push(fr(6, { counts: counts.slice(), x: x }, { la: i, slot: x, sign: 1, note: "counts[" + x + "] += 1 → " + counts[x] + "." }));
      }
      for (i = 0; i < b.length; i++) {
        x = b[i];
        f.push(fr(7, { counts: counts.slice(), x: x }, { lb: i, note: "From <code>b</code>: x = " + x + "." }));
        counts[x]--; up++;
        f.push(fr(8, { counts: counts.slice(), x: x }, { lb: i, slot: x, sign: -1, note: "counts[" + x + "] −= 1 → " + counts[x] + (counts[x] === 0 ? " — cancelled out." : ".") }));
      }
      var res = true;
      for (i = 0; i < 10; i++) {
        chk++;
        var ok = counts[i] === 0;
        f.push(fr(9, { counts: counts.slice(), c: counts[i] }, { cmp: i, ok: ok, note: "<code>all</code> checks slot " + i + ": " + counts[i] + (ok ? " == 0 ✓" : " ≠ 0 → <strong>False</strong>, and <code>all</code> stops right here.") }));
        if (!ok) { res = false; break; }
      }
      var n = a.length, last = fr(9, { counts: counts.slice() }, { done: true, cmp: res ? 10 : i });
      last.out = [res ? "True" : "False"];
      last.note = "<strong>" + (res ? "True" : "False") + "</strong> after " + up + " tally updates (2n, n = " + n + ") and " + chk + " zero check" + (chk > 1 ? "s" : "") + " (at most 10): " +
        "<strong>O(n)</strong>, same class as the letters version. What changed: 10 slots instead of 26, the digit is the slot (no <code>ord</code>), and one list with +1 / −1 instead of two lists compared.";
      f.push(last);
      return f;
    }
    var box = h("div", "");
    box.appendChild(h("div", "w9-cap", "a"));
    var ra = h("div", "arr idx"); box.appendChild(ra);
    box.appendChild(h("div", "w9-cap", "b"));
    var rb = h("div", "arr idx"); box.appendChild(rb);
    box.appendChild(h("div", "w9-cap", "counts — slot 0 … 9"));
    var rc = h("div", "w9-dig"); box.appendChild(rc);
    function onFrame(fr) {
      if (!box.parentNode) ct.extra.appendChild(box);
      ra.innerHTML = A.map(function (v, j) { return '<div class="cell' + (fr.la === j ? " on" : fr.la > j || fr.lb != null || fr.cmp != null || fr.done ? " dim" : "") + '">' + v + "<small>" + j + "</small></div>"; }).join("");
      rb.innerHTML = Bv.map(function (v, j) { return '<div class="cell' + (fr.lb === j ? " on" : fr.lb > j || fr.cmp != null || fr.done ? " dim" : "") + '">' + v + "<small>" + j + "</small></div>"; }).join("");
      var c = fr.counts;
      var html = "";
      for (var i = 0; i < 10; i++) {
        var v = c ? c[i] : null, cls = "w9-d";
        if (c && v > 0) cls += " pos"; else if (c && v < 0) cls += " neg";
        if (fr.slot === i) cls += fr.sign > 0 ? " up" : " down";
        if (fr.cmp != null && i < fr.cmp) cls += " zero";
        if (fr.cmp === i && !fr.done) cls += fr.ok ? " zero now" : " bad";
        if (fr.done && fr.cmp === i) cls += " bad";
        var hgt = v == null ? 0 : Math.min(3, Math.abs(v)) * 11;
        html += '<div class="' + cls + '"><span class="bar" style="height:' + hgt + 'px"></span><b>' + (v == null ? "·" : v) + "</b><i>" + i + "</i></div>";
      }
      rc.innerHTML = html;
    }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: 1.8 });
    ct.load();
  }

  /* ============================================================
     Task 6 — confirm by counting, not timing
     ============================================================ */
  function countRatios(host) {
    host.classList.add("w9-anim");
    host.classList.add("w9-stack");
    var SIZES = [[100, 200, 400, 800], [100, 200, 400, 800, 1600, 3200, 6400]], which = 0;
    U.title(host, "Animation · two ratio columns, zero stopwatch calls");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("sizes", [[0, "task: 100 … 800"], [1, "extended: 100 … 6 400"]], 0, function (v) { which = v; ct.load(); }));
    host.appendChild(opts);
    var o2 = h("div", "anim-opts");
    o2.appendChild(h("span", "lab", "predict the last ratios — checking-off:"));
    var pA = numInput("ratio", "Predicted last ratio for checking-off"), pC = numInput("ratio", "Predicted last ratio for counting");
    o2.appendChild(pA); o2.appendChild(h("span", "lab", "count:")); o2.appendChild(pC);
    host.appendChild(o2);
    function code() {
      return "import random, string\n\ndef make_pair(n):\n    letters = [random.choice(string.ascii_lowercase) for _ in range(n)]\n    shuffled = letters[:]\n    random.shuffle(shuffled)\n" +
        "    return \"\".join(letters), \"\".join(shuffled)\n\ndef checking_off_ops(s1, s2):\n    if len(s1) != len(s2):\n        return 0\n    ops = 0\n    letters = list(s2)\n" +
        "    for letter in s1:\n        found = False\n        for i in range(len(letters)):\n            ops += 1                         # one comparison\n" +
        "            if letters[i] == letter:\n                letters[i] = None\n                found = True\n                break\n        if not found:\n            return ops\n    return ops\n\n" +
        "def count_ops(s1, s2):\n    if len(s1) != len(s2):\n        return 0\n    ops = 0\n    c1 = [0] * 26\n    c2 = [0] * 26\n    for letter in s1:\n" +
        "        c1[ord(letter) - ord('a')] += 1; ops += 1\n    for letter in s2:\n        c2[ord(letter) - ord('a')] += 1; ops += 1\n    for i in range(26):\n        ops += 1\n" +
        "        if c1[i] != c2[i]:\n            return ops\n    return ops\n\n" +
        "print(f\"{'n':>6}  {'checking-off':>14}  {'ratio':>6}   {'count':>8}  {'ratio':>6}\")\nprev_a = prev_c = None\nfor n in [" + SIZES[which].join(", ") + "]:\n" +
        "    s1, s2 = make_pair(n)\n    a = checking_off_ops(s1, s2)\n    c = count_ops(s1, s2)\n    ra = \"-\" if prev_a is None else f\"{a/prev_a:.1f}x\"\n" +
        "    rc = \"-\" if prev_c is None else f\"{c/prev_c:.1f}x\"\n    print(f\"{n:>6}  {a:>14,}  {ra:>6}   {c:>8,}  {rc:>6}\")\n    prev_a, prev_c = a, c";
    }
    var results = [];
    function build() {
      var f = [], out = [], printed = 0;
      var head = pad("n", 6) + "  " + pad("checking-off", 14) + "  " + pad("ratio", 6) + "   " + pad("count", 8) + "  " + pad("ratio", 6);
      function base(line, v, extra) {
        var o = { line: line, vars: v, out: out.slice(), counters: { "time.perf_counter calls": 0, "rows printed": printed } };
        for (var e in extra) o[e] = extra[e];
        return o;
      }
      f.push(base(42, {}, { k: 0, note: "No stopwatch anywhere: the program counts selected operations. Type your predictions for the last ratios, then press <strong>play</strong>." }));
      out.push(head);
      f.push(base(42, {}, { k: 0, note: "Print the header." }));
      f.push(base(43, { prev_a: null, prev_c: null }, { k: 0, note: "No previous row yet." }));
      results = [];
      var pa = null, pc = null;
      SIZES[which].forEach(function (n, j) {
        var p = makePair(n, 7000 + n);
        var a = checkingOffOps(p[0], p[1]), c = countOps(p[0], p[1]);
        var ra = pa === null ? "-" : (a / pa).toFixed(1) + "x", rc = pc === null ? "-" : (c / pc).toFixed(1) + "x";
        var s1 = p[0].slice(0, 8) + "… (" + n + " letters)", s2 = p[1].slice(0, 8) + "… (" + n + " letters)";
        f.push(base(44, { n: n, prev_a: pa, prev_c: pc }, { k: j, note: "n = " + n + "." }));
        f.push(base(45, { n: n, s1: s1, s2: s2, prev_a: pa, prev_c: pc }, { k: j, hl: [3, 4, 5, 6, 7], note: "Build a genuine anagram pair of " + n + " random letters." }));
        f.push(base(46, { n: n, s1: s1, s2: s2, a: a, prev_a: pa, prev_c: pc }, { k: j, hl: rangeArr(9, 24), note: "checking_off_ops → <strong>" + sp(a) + "</strong> = " + n + "·" + (n + 1) + "/2." }));
        f.push(base(47, { n: n, a: a, c: c, prev_a: pa, prev_c: pc }, { k: j, hl: rangeArr(26, 40), note: "count_ops → <strong>" + sp(c) + "</strong> = 2·" + n + " + 26." }));
        f.push(base(49, { n: n, a: a, c: c, ra: ra, rc: rc }, { k: j, hl: [48], note: pa === null ? "First row: no ratios yet (\"-\")." : "Ratios: " + sp(a) + " / " + sp(pa) + " = " + (a / pa).toFixed(3) + " → <strong>" + ra + "</strong>;  " + c + " / " + pc + " = " + (c / pc).toFixed(3) + " → <strong>" + rc + "</strong>." }));
        out.push(pad(n, 6) + "  " + pad(fmt(a), 14) + "  " + pad(ra, 6) + "   " + pad(fmt(c), 8) + "  " + pad(rc, 6));
        printed++;
        results.push({ n: n, a: a, c: c, ra: pa === null ? null : a / pa, rc: pc === null ? null : c / pc });
        f.push(base(50, { n: n, a: a, c: c, ra: ra, rc: rc }, { k: j + 1, note: "Print the row." }));
        pa = a; pc = c;
        f.push(base(51, { n: n, prev_a: pa, prev_c: pc }, { k: j + 1, note: "Remember this row for the next ratio." }));
      });
      var L = results[results.length - 1];
      var last = f[f.length - 1];
      last.done = true;
      last.final = L;
      return f;
    }
    function verdictPred(L) {
      var a = parseFloat(pA.value), c = parseFloat(pC.value), s = [];
      if (!isNaN(a)) s.push("checking-off: you said " + a + (Math.abs(a - L.ra) < 0.15 ? " ✓" : ""));
      if (!isNaN(c)) s.push("count: you said " + c + (Math.abs(c - L.rc) < 0.15 ? " ✓" : ""));
      return s.length ? "(" + s.join("; ") + ")" : "";
    }
    function rangeArr(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
    var chartBox = h("div", "");
    var chart = null, tw = null, tbl = null;
    function onFrame(fr) {
      if (fr.final) {
        var L = fr.final;
        ct.msg.innerHTML = "Last ratios: checking-off <strong>" + L.ra.toFixed(3) + "</strong> (→ 4), counting <strong>" + L.rc.toFixed(3) + "</strong> (→ 2). " + verdictPred(L) +
          " Every count matched n(n+1)/2 and 2n + 26 exactly — and <code>time.perf_counter</code> was called 0 times. Now name the classes below.";
      }
      if (!chart) {
        ct.extra.appendChild(chartBox);
        chart = chartOn(chartBox, { logx: true, xlabel: "n", ylabel: "doubling ratio", height: 260, label: "Doubling ratios of the two operation counts, with reference lines at 4 and 2" });
        tw = h("div", "anim-table-wrap"); chartBox.appendChild(tw);
        tbl = U.table(tw, ["n", "checking-off", "n(n+1)/2", "count", "2n + 26"]);
      }
      var S = SIZES[which], R = results.slice(0, fr.k);
      var ptsA = R.filter(function (x) { return x.ra !== null; }).map(function (x) { return [x.n, x.ra]; });
      var ptsC = R.filter(function (x) { return x.rc !== null; }).map(function (x) { return [x.n, x.rc]; });
      var lo = S[1], hi = S[S.length - 1];
      chart.draw([
        { name: "checking-off ratio", color: "--accent", points: ptsA },
        { name: "count ratio", color: "--blue", points: ptsC },
        { name: "4 (n² limit)", color: "--red", points: [[lo, 4], [hi, 4]], dashed: true, noDots: true },
        { name: "2 (n limit)", color: "--green", points: [[lo, 2], [hi, 2]], dashed: true, noDots: true }
      ], { xr: [lo, hi], yr: [0, 4] });
      tbl.rows(R.map(function (x) {
        return [x.n, sp(x.a), sp(x.n * (x.n + 1) / 2) + (x.a === x.n * (x.n + 1) / 2 ? " ✓" : " ✗"), sp(x.c), sp(2 * x.n + 26) + (x.c === 2 * x.n + 26 ? " ✓" : " ✗")];
      }), fr.k - 1);
    }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, outTitle: "output", fps: 2 });

    var Q = h("div", "w9-panel");
    Q.appendChild(h("div", "w9-h", "One sentence each: what does the count formula prove?"));
    var CH = [["n", "Θ(n)"], ["nlogn", "Θ(n log n)"], ["n2", "Θ(n²)"]];
    var qm = h("p", "w9-fb", "");
    qm.setAttribute("aria-live", "polite");
    quizRow(Q, "checking-off, n(n+1)/2 →", CH, function (id) {
      var ok = id === "n2";
      qm.innerHTML = ok ? "Right: n(n+1)/2 for every genuine length-n anagram establishes <strong>Θ(n²)</strong>, and the column agrees — its ratios approach 4."
        : "Not quite: expand n(n+1)/2 = n²/2 + n/2 and keep the fastest-growing term.";
      return ok;
    });
    quizRow(Q, "counting, 2n + 26 →", CH, function (id) {
      var ok = id === "n";
      qm.innerHTML = ok ? "Right: 2n + 26 establishes <strong>Θ(n)</strong>, and the column agrees — its ratios approach 2 (1.9, 1.9, 2.0: the fixed 26 fades as n grows)."
        : "Not quite: 2n + 26 has one term that grows. Drop the constants.";
      return ok;
    });
    Q.appendChild(qm);
    Q.appendChild(h("p", "w9-note", "The finite table checks the formulas; deriving the formulas for every n is what proves the classes."));
    host.appendChild(Q);
    ct.load();
  }

  AAAnim.register("w9-checkoff", checkoff);
  AAAnim.register("w9-brute", brute);
  AAAnim.register("w9-crossover", crossover);
  AAAnim.register("w9-counter", counter);
  AAAnim.register("w9-digits", digits);
  AAAnim.register("w9-count-ratios", countRatios);
})();
