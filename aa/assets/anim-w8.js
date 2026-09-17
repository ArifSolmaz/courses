/* ============================================================
   AA — week 8 "Try it yourself" animations (Big-O notation)
   w8-classify · w8-ratio-class · w8-seconds · w8-receipt · w8-cases
   Uses the shared helpers on AAAnim.ui (see anim.js).
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt, esc = U.esc;

  var CLS = [["1", "O(1)"], ["logn", "O(log n)"], ["n", "O(n)"], ["nlogn", "O(n log n)"], ["n2", "O(n²)"]];
  function clsName(id) { for (var i = 0; i < CLS.length; i++) if (CLS[i][0] === id) return CLS[i][1]; return id; }

  /* static code listing (same look as CodeTrace), returns row elements */
  function codeBox(parent, src, extraCls) {
    var box = h("div", "ct-code w8-code" + (extraCls ? " " + extraCls : ""));
    var rows = [];
    function set(s) {
      box.innerHTML = ""; rows.length = 0;
      s.split("\n").forEach(function (ln, j) {
        var r = h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + (U.pyLine(ln) || " ") + "</code>");
        box.appendChild(r); rows.push(r);
      });
    }
    set(src);
    parent.appendChild(box);
    return {
      el: box, rows: rows, set: set,
      mark: function (on, hl) {
        rows.forEach(function (r, j) {
          r.className = "ct-line" + ((on || []).indexOf(j + 1) >= 0 ? " on" : "") + ((hl || []).indexOf(j + 1) >= 0 ? " hl" : "");
        });
      }
    };
  }

  /* a row of answer buttons; judge(id) -> {ok, text} */
  function quizRow(parent, label, choices, judge) {
    var row = h("div", "anim-opts w8-quiz");
    var lab = h("span", "lab", label);
    row.appendChild(lab);
    var bs = choices.map(function (c) {
      var b = btn(c[1], "", function () {
        var r = judge(c[0]);
        if (!r) return;
        if (r.ok) { bs.forEach(function (x) { x.disabled = true; }); b.className = "right"; }
        else { b.className = "wrong"; b.disabled = true; }
      });
      b.setAttribute("data-id", c[0]);
      row.appendChild(b);
      return b;
    });
    parent.appendChild(row);
    return {
      el: row, lab: lab,
      reset: function (enabled) { bs.forEach(function (b) { b.className = ""; b.disabled = !enabled; }); },
      enable: function () { bs.forEach(function (b) { if (b.className !== "wrong") b.disabled = false; }); },
      solved: function (id) {
        bs.forEach(function (b) { b.disabled = true; b.className = b.getAttribute("data-id") === id ? "right" : ""; });
      }
    };
  }

  function sp(x) { return fmt(x).replace(/,/g, " "); }
  function pad(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }

  /* ============================================================
     Task 1 — classify: what each line does to the data
     ============================================================ */
  function classify(host) {
    host.classList.add("w8-anim");
    var LINES = [
      { src: "a = len(data)", ans: "1", unit: "steps",
        hint: "Does <code>len</code> have to count the items, or is the answer already stored? Play it at n = 8 and n = 16.",
        why: "<code>a</code> is <strong>O(1)</strong> — Python stores the length, so nothing is counted." },
      { src: "b = data[len(data) // 2]", ans: "1", unit: "steps",
        hint: "How many items does this line actually touch? Play it at both sizes and compare the steps.",
        why: "<code>b</code> is <strong>O(1)</strong> — arithmetic plus one lookup, however long the list is." },
      { src: "c = max(data)", ans: "n", unit: "items inspected",
        hint: "Could <code>max</code> skip any item? Play it at n = 8 and n = 16 and compare the work.",
        why: "<code>c</code> is <strong>O(n)</strong> — <code>max</code> must inspect every item; the biggest could be anywhere." },
      { src: "d = sorted(data)", ans: "nlogn", unit: "item moves",
        hint: "Play it at n = 8 and n = 16: count the rounds and the moves per round.",
        why: "<code>d</code> is <strong>O(n log n)</strong> — good sorting: about log₂ n rounds, each a pass over the data." },
      { src: "e = [x * 2 for x in data]", ans: "n", unit: "items visited",
        hint: "How many times does the comprehension visit each item? Play it at both sizes.",
        why: "<code>e</code> is <strong>O(n)</strong> — one visit per item, building a new list of n items." },
      { src: "f = [(x, y) for x in data for y in data]", ans: "n2", unit: "pairs built",
        hint: "Two <code>for</code> clauses in one comprehension: how many pairs come out? Play it at n = 8 and n = 16.",
        why: "<code>f</code> is <strong>O(n²)</strong> — and it builds a list of n² pairs, so it eats memory at the same rate." }
    ];
    var cur = 0, n = 8, vals = {}, st = LINES.map(function () { return { ok: false, runs: {} }; });

    U.title(host, "Animation · what does each line do to the data?");
    var list = h("div", "w8-lines");
    var rowEls = LINES.map(function (L, j) {
      var r = btn('<code>' + U.pyLine(L.src) + '</code><span class="w8-mark" aria-hidden="true"></span>', "w8-line", function () { select(j); });
      r.setAttribute("aria-label", "Line " + L.src.charAt(0) + ": " + L.src);
      list.appendChild(r); return r;
    });
    host.appendChild(list);

    var quiz = quizRow(host, "", CLS, function (id) {
      var L = LINES[cur];
      if (id === L.ans) {
        st[cur].ok = true; paintRows(); score();
        fb.innerHTML = "Right. " + L.why;
        return { ok: true };
      }
      fb.innerHTML = "Not " + clsName(id) + ". " + L.hint;
      return { ok: false };
    });
    var fb = h("p", "w8-fb", "");
    fb.setAttribute("aria-live", "polite");
    host.appendChild(fb);

    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("n = len(data)", [[8, "8"], [16, "16"]], 8, function (v) { n = v; setup(); }));
    var scoreEl = U.stat("classified correctly");
    opts.appendChild(scoreEl.el);
    host.appendChild(opts);

    var stage = h("div", "w8-stage");
    host.appendChild(stage);
    var stats = h("div", "anim-stats");
    var sWork = U.stat("steps"), sMem = U.stat("new cells stored");
    stats.appendChild(sWork.el); stats.appendChild(sMem.el);
    host.appendChild(stats);
    var runsWrap = h("div", "anim-table-wrap");
    host.appendChild(runsWrap);
    var m = U.msg(host);

    function score() { scoreEl.set(st.filter(function (s) { return s.ok; }).length + " / 6"); }
    function paintRows() {
      rowEls.forEach(function (r, j) {
        r.className = "w8-line" + (j === cur ? " sel" : "") + (st[j].ok ? " done" : "");
        r.querySelector(".w8-mark").textContent = st[j].ok ? clsName(LINES[j].ans) : "?";
      });
    }
    function select(j) {
      cur = j; paintRows();
      var L = LINES[j];
      quiz.lab.innerHTML = "line <code>" + L.src.charAt(0) + "</code> is";
      if (st[j].ok) { quiz.solved(L.ans); fb.innerHTML = L.why; }
      else { quiz.reset(true); fb.innerHTML = "Predict the class of line <code>" + L.src.charAt(0) + "</code>, or play it first and watch the work."; }
      setup();
    }

    function data(k) {
      if (!vals[k]) { var r = U.rng(k * 7 + 3); vals[k] = []; for (var i = 0; i < k; i++) vals[k].push(1 + Math.floor(r() * 99)); }
      return vals[k];
    }

    /* persistent DOM for the current line + n */
    var D = {};
    function cells(parent, k, cls, withIdx) {
      var row = h("div", "arr" + (withIdx ? " idx" : "") + (cls ? " " + cls : "")), out = [];
      for (var i = 0; i < k; i++) {
        var c = h("div", "cell", "");
        row.appendChild(c); out.push(c);
      }
      parent.appendChild(row);
      return out;
    }
    function setup() {
      var L = LINES[cur], v = data(n);
      stage.innerHTML = ""; D = {};
      D.lab1 = h("div", "w8-cap", "data (n = " + n + ")");
      stage.appendChild(D.lab1);
      D.data = cells(stage, n, "", true);
      D.data.forEach(function (c, i) { c.innerHTML = v[i] + "<small>" + i + "</small>"; });
      D.chips = h("div", "w8-chips");
      stage.appendChild(D.chips);
      if (cur === 3 || cur === 4) {
        D.lab2 = h("div", "w8-cap", cur === 3 ? "the new sorted list, being written" : "e — the new list");
        stage.appendChild(D.lab2);
        D.out = cells(stage, n, "w8-out", false);
      }
      if (cur === 5) {
        D.lab2 = h("div", "w8-cap", "f — one tile per pair (x, y): row = x, column = y");
        stage.appendChild(D.lab2);
        var g = h("div", "w8-grid");
        g.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
        g.style.maxWidth = (n * 22) + "px";
        D.grid = [];
        for (var q = 0; q < n * n; q++) { var t = h("i", ""); g.appendChild(t); D.grid.push(t); }
        stage.appendChild(g);
      }
      sWork.el.firstChild.textContent = L.unit;
      paintRuns();
      player.load();
    }

    function mergeFrames(v) {
      var a = v.slice(), N = a.length, f = [], steps = 0, round = 0, R = Math.round(Math.log(N) / Math.LN2);
      for (var w = 1; w < N; w *= 2) {
        round++;
        var out = a.map(function () { return null; }), used = [];
        for (var lo = 0; lo < N; lo += 2 * w) {
          var mid = Math.min(lo + w, N), hi = Math.min(lo + 2 * w, N), i = lo, j = mid;
          for (var k = lo; k < hi; k++) {
            var left = j >= hi || (i < mid && a[i] <= a[j]);
            var src = left ? i++ : j++;
            out[k] = a[src]; used = used.concat([src]); steps++;
            f.push({ steps: steps, stored: N, inp: a.slice(), out: out.slice(), src: src, k: k, used: used, w: w, round: round, R: R,
              note: "Round " + round + " of " + R + ": merge neighbouring runs of " + w + " into runs of " + (2 * w) +
                ". Move <strong>" + a[src] + "</strong> into place — one step." });
          }
        }
        a = out;
      }
      f[f.length - 1].final = true;
      return f;
    }

    function build() {
      var v = data(n), f = [{ steps: 0, stored: 0, note: "start" }], k;
      if (cur === 0) {
        f.push({ steps: 1, stored: 0, len: true, chip: "len(data) → " + n + "  (read from the list's header)",
          note: "Python keeps the length next to the list, so <code>len(data)</code> just reads it: <code>a = " + n + "</code>. Not one item was looked at." });
      } else if (cur === 1) {
        f.push({ steps: 1, stored: 0, len: true, chip: "len(data) → " + n, note: "Read the stored length: " + n + "." });
        f.push({ steps: 2, stored: 0, len: true, chip: "len(data) → " + n + "   ·   " + n + " // 2 → " + (n >> 1), note: "One piece of arithmetic: " + n + " // 2 = " + (n >> 1) + "." });
        f.push({ steps: 3, stored: 0, len: true, on: [n >> 1], chip: "len(data) → " + n + "   ·   " + n + " // 2 → " + (n >> 1) + "   ·   data[" + (n >> 1) + "] → " + v[n >> 1],
          note: "One lookup: <code>data[" + (n >> 1) + "]</code> is " + v[n >> 1] + ". Done — the other " + (n - 1) + " items were never touched." });
      } else if (cur === 2) {
        var best = 0;
        for (k = 0; k < n; k++) {
          if (v[k] > v[best]) best = k;
          f.push({ steps: k + 1, stored: 0, on: [k], gold: [best], seen: k, chip: "biggest so far → " + v[best],
            note: "Inspect item " + k + " (" + v[k] + "). " + (k < n - 1 ? "Could a bigger one still be further on? Yes — keep going." : "That was the last one; now <code>max</code> can answer.") });
        }
      } else if (cur === 3) {
        f = f.concat(mergeFrames(v));
      } else if (cur === 4) {
        for (k = 0; k < n; k++) {
          f.push({ steps: k + 1, stored: k + 1, on: [k], seen: k, fill: k + 1,
            note: "Visit item " + k + " (" + v[k] + ") and append " + v[k] * 2 + " to the new list." });
        }
      } else {
        for (k = 0; k < n * n; k++) {
          var x = Math.floor(k / n), y = k % n;
          f.push({ steps: k + 1, stored: k + 1, on: [x], gold: [y], fill: k + 1,
            note: "Pair (" + v[x] + ", " + v[y] + "): x is item " + x + ", y is item " + y + ". " +
              (y === n - 1 ? "The inner <code>for y</code> finished a full pass — next x." : "Inner loop keeps going over <em>every</em> y.") });
        }
      }
      f[f.length - 1].last = true;
      return f;
    }

    function render(fr, i, frames) {
      var L = LINES[cur], v = data(n);
      if (cur === 3 && fr.inp) {
        D.lab1.textContent = "round " + fr.round + " input (runs of " + fr.w + ")";
        D.data.forEach(function (c, j) {
          c.innerHTML = fr.inp[j] + "<small>" + j + "</small>";
          c.className = "cell" + (j === fr.src ? " on" : fr.used.indexOf(j) >= 0 ? " dim" : "") + (j % (2 * fr.w) === 0 && j ? " w8-gap" : "");
        });
        D.out.forEach(function (c, j) {
          c.textContent = fr.out[j] == null ? "" : fr.out[j];
          c.className = "cell" + (fr.out[j] == null ? " w8-empty" : j === fr.k ? " gold" : fr.last ? " good" : "") + (j % (4 * fr.w) === 0 && j && !fr.last ? " w8-gap" : "");
        });
      } else {
        if (cur === 3) {
          D.lab1.textContent = "data (n = " + n + ")";
          D.data.forEach(function (c, j) { c.innerHTML = v[j] + "<small>" + j + "</small>"; c.className = "cell"; });
          D.out.forEach(function (c) { c.textContent = ""; c.className = "cell w8-empty"; });
        } else {
          D.data.forEach(function (c, j) {
            var cls = "cell";
            if (fr.gold && fr.gold.indexOf(j) >= 0) cls += " gold";
            if (fr.on && fr.on.indexOf(j) >= 0) cls += " on";
            else if (fr.seen != null && j < fr.seen && !(fr.gold && fr.gold.indexOf(j) >= 0)) cls += " dim";
            c.className = cls;
          });
        }
        if (cur === 4) D.out.forEach(function (c, j) {
          var on = j < (fr.fill || 0);
          c.textContent = on ? v[j] * 2 : "";
          c.className = "cell" + (on ? (j === fr.fill - 1 ? " gold" : "") : " w8-empty");
        });
        if (cur === 5) D.grid.forEach(function (t, j) { t.className = j < (fr.fill || 0) ? (j === fr.fill - 1 ? "now" : "on") : ""; });
      }
      D.chips.textContent = fr.chip || "";
      D.chips.className = "w8-chips" + (fr.chip ? " on" : "");
      sWork.set(fmt(fr.steps));
      sMem.set(fmt(fr.stored));

      if (fr.note === "start") {
        m.innerHTML = "Line <code>" + esc(L.src) + "</code> on a list of " + n + " items. Press <strong>play</strong> and count the work.";
      } else if (fr.last) {
        st[cur].runs[n] = { steps: fr.steps, stored: fr.stored };
        paintRuns();
        var other = n === 8 ? 16 : 8, o = st[cur].runs[other];
        var txt = "Finished at n = " + n + ": <strong>" + fmt(fr.steps) + " " + (fr.steps === 1 ? L.unit.replace(/s$/, "") : L.unit) + "</strong>, " + fmt(fr.stored) + " new cells stored. ";
        if (o) {
          var r8 = st[cur].runs[8], r16 = st[cur].runs[16], ratio = r16.steps / r8.steps;
          txt += "Doubling n from 8 to 16 took the work from " + fmt(r8.steps) + " to " + fmt(r16.steps) +
            " (<strong>×" + (+ratio.toFixed(2)) + "</strong>). " + (st[cur].ok ? "" : "Which class responds to doubling like that?");
        } else {
          txt += "Now switch n to " + other + " and replay: does the work stay put, double, or more?";
        }
        m.innerHTML = txt;
      } else {
        m.innerHTML = fr.note;
      }
    }
    function paintRuns() {
      var R = st[cur].runs;
      runsWrap.innerHTML = "";
      if (!R[8] && !R[16]) return;
      var t = U.table(runsWrap, ["n", LINES[cur].unit, "new cells stored"]);
      var rows = [];
      [8, 16].forEach(function (k) { if (R[k]) rows.push([k, fmt(R[k].steps), fmt(R[k].stored)]); });
      if (R[8] && R[16]) rows.push(["16 ÷ 8", "×" + (+(R[16].steps / R[8].steps).toFixed(2)),
        R[8].stored ? "×" + (+(R[16].stored / R[8].stored).toFixed(2)) : "—"]);
      t.rows(rows, rows.length === 3 ? 2 : -1);
    }

    var player = U.Player(host, { build: build, render: render,
      fps: function (i, frames) { return Math.max(1.2, frames.length / 6); } });
    score();
    select(0);
  }

  /* ============================================================
     Task 2 — from a ratio column to a class, then check the code
     ============================================================ */
  function ratioClass(host) {
    host.classList.add("w8-anim");
    var STUDIES = [
      { key: "a", name: "(a) summing a list", start: 100000, dbl: 5, ans: "n", seed: 11,
        t: function (n) { return 4.9e-8 * n; },
        code: "def summing(n):                 # (a) add up n numbers\n    total = 0\n    for x in range(n):\n        total += x\n    return total\n\ndoubling(summing, start_n=100000)",
        shape: [3, 4],
        verdict: "One loop over n, constant work inside → <strong>O(n)</strong>. Column (≈ 2.00) and code agree." },
      { key: "b", name: "(b) worst-case contains", start: 100000, dbl: 5, ans: "n", seed: 12,
        t: function (n) { return 2.3e-8 * n; },
        code: "def contains(data, target):     # week 5\n    for item in data:\n        if item == target:\n            return True\n    return False\n\ndef worst_contains(n):           # target absent: every item checked\n    return contains(list(range(n)), -1)\n\ndoubling(worst_contains, start_n=100000)",
        shape: [2, 3],
        verdict: "The target is absent, so the single loop never returns early and runs all n rounds → <strong>O(n)</strong> worst case. Column and code agree." },
      { key: "c", name: "(c) duplicate-finder", start: 500, dbl: 4, ans: "n2", seed: 13,
        t: function (n) { return 1.0e-7 * n * (n - 1) / 2; },
        code: "def duplicates(n):              # week 4, wrapped in a function\n    data = random.sample(range(1000000), n)\n    comparisons = 0\n    found = False\n    for i in range(len(data)):\n        for j in range(i + 1, len(data)):\n            comparisons = comparisons + 1\n            if data[i] == data[j]:\n                found = True\n    return found, comparisons\n\ndoubling(duplicates, start_n=500, doublings=4)",
        shape: [5, 6, 7],
        verdict: "A loop inside a loop, both over n: n(n−1)/2 comparisons → <strong>O(n²)</strong>. Column (≈ 4.0) and code agree." },
      { key: "d", name: "(d) sorted() on a shuffled list", start: 100000, dbl: 5, ans: "nlogn", seed: 14, noise: 0.002,
        t: function (n) { return 7.0e-9 * n * Math.log(n) / Math.LN2; },
        code: "def sort_shuffled(n):\n    data = shuffled_lists[n]    # shuffled beforehand, outside the timer\n    return sorted(data)         # no loop in sight...\n\ndoubling(sort_shuffled, start_n=100000)",
        shape: [3],
        verdict: "No loop is visible — the work hides inside <code>sorted()</code>, which is <strong>O(n log n)</strong>. The column (just above 2, drifting down) agrees, " +
          "but at a glance it could pass for linear: that near-disagreement is the finding worth a paragraph (§6.5, case 2)." }
    ];
    var HINTS = {
      a: { "1": "The time does change: each row is about twice the one before.", logn: "A log n column adds a small fixed amount per doubling; this one multiplies.", nlogn: "These ratios sit right at 2.00 and do not drift down — no extra log factor.", n2: "Four times the work would show ratios near 4." },
      c: { "1": "The time is far from unchanged.", logn: "The time multiplies each doubling — much more than a fixed addition.", n: "Look at the size of the ratio: it is not near 2.", nlogn: "n log n posts ratios just above 2; these are far bigger." },
      d: { "1": "The time does change each doubling.", logn: "The time multiplies; it does not grow by a fixed addition.", n: "Close — but every ratio is above 2.00 and they creep downward. A plain loop posts clean 2.0s.", n2: "Too big — nested loops give ratios near 4." }
    };
    HINTS.b = HINTS.a;
    var cur = 0, seedBump = 0, st = STUDIES.map(function () { return { played: false, ok: false, ratios: null }; });

    U.title(host, "Animation · read the ratio column, name the class, then check the code");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("study", STUDIES.map(function (s, j) { return [j, "(" + s.key + ")"]; }), 0, function (v) { cur = v; setup(); }));
    opts.appendChild(btn("run again", "", function () { seedBump++; setup(); }, "Run the same study again with fresh noise"));
    host.appendChild(opts);
    var name = h("p", "w8-cap w8-study", "");
    host.appendChild(name);
    var out = h("pre", "ct-out w8-pre", "");
    host.appendChild(out);
    host.appendChild(h("p", "note-sim", "Simulated timings from a step-count model (steps × a per-step cost, plus a little seeded noise) — run the real code in Colab for your own numbers."));

    var gauge = h("div", "w8-gauge");
    var track = h("div", "w8-gtrack");
    [1, 2, 3, 4].forEach(function (x) {
      var t = h("span", "w8-gtick", "<b>" + x + ".0</b>");
      t.style.left = gpos(x) + "%"; track.appendChild(t);
    });
    gauge.appendChild(h("div", "w8-cap", "each ratio, placed on a ruler"));
    gauge.appendChild(track);
    host.appendChild(gauge);

    var quiz = quizRow(host, "this column implies", CLS, function (id) {
      var S = STUDIES[cur];
      if (id === S.ans) {
        st[cur].ok = true;
        fb.innerHTML = "Right — the column says <strong>" + clsName(id) + "</strong>. Now look at the code and confirm it from its shape:";
        showCode(); paintSummary();
        return { ok: true };
      }
      fb.innerHTML = (HINTS[S.key][id] || "Not quite.") + " Try again.";
      return { ok: false };
    });
    var fb = h("p", "w8-fb", "");
    fb.setAttribute("aria-live", "polite");
    host.appendChild(fb);
    var codeWrap = h("div", "w8-codewrap");
    host.appendChild(codeWrap);
    var sumWrap = h("div", "anim-table-wrap");
    host.appendChild(sumWrap);
    var m = U.msg(host);

    function gpos(r) { return Math.max(0, Math.min(100, (r - 0.5) / 4 * 100)); }

    function rows() {
      var S = STUDIES[cur], r = U.rng(S.seed * 101 + seedBump * 7919), res = [], n = S.start, prev = null;
      for (var k = 0; k < S.dbl; k++) {
        var t = S.t(n) * (1 + (S.noise || 0.02) * (r() - 0.5));
        res.push({ n: n, t: t, ratio: prev ? t / prev : NaN });
        prev = t; n *= 2;
      }
      return res;
    }
    function line(x) {
      return pad(x.n, 9) + " " + pad(x.t.toFixed(5), 12) + " " + pad(isNaN(x.ratio) ? "nan" : x.ratio.toFixed(2), 7);
    }
    var data = [];
    function setup() {
      var S = STUDIES[cur];
      name.textContent = S.name + " — doubling(), start_n = " + fmt(S.start) + ", " + S.dbl + " doublings";
      data = rows();
      st[cur].ratios = data.slice(1).map(function (x) { return x.ratio; });
      codeWrap.innerHTML = "";
      if (st[cur].ok) { quiz.solved(S.ans); fb.innerHTML = "Solved — the class and the code:"; showCode(); }
      else { quiz.reset(st[cur].played); fb.innerHTML = st[cur].played ? "" : "The class buttons unlock once the whole column has printed."; }
      player.load();
    }
    function showCode() {
      var S = STUDIES[cur];
      codeWrap.innerHTML = "";
      var cb = codeBox(codeWrap, S.code);
      cb.mark(S.shape, []);
      codeWrap.appendChild(h("p", "w8-verdict", S.verdict));
    }
    function build() {
      var f = [{ k: 0 }];
      for (var k = 1; k <= data.length; k++) f.push({ k: k });
      return f;
    }
    var dots = [];
    function render(fr, i, frames) {
      var head = pad("n", 9) + " " + pad("seconds", 12) + " " + pad("ratio", 7);
      out.textContent = [head].concat(data.slice(0, fr.k).map(line)).join("\n");
      dots.forEach(function (d) { track.removeChild(d); });
      dots = [];
      data.slice(1, fr.k).forEach(function (x, j, arr) {
        var d = h("span", "w8-gdot" + (j === arr.length - 1 ? " last" : ""), j === arr.length - 1 ? "<em>" + x.ratio.toFixed(2) + "</em>" : "");
        d.style.left = gpos(x.ratio) + "%";
        d.style.top = (6 + j * 5) + "px";
        track.appendChild(d); dots.push(d);
      });
      if (fr.k === 0) m.innerHTML = "Press <strong>play</strong> to print the ratio column for " + STUDIES[cur].name + ". Then name its class.";
      else if (fr.k === 1) m.innerHTML = "The first row has no ratio yet — there is nothing to divide by.";
      else if (fr.k < data.length) m.innerHTML = "n doubled; the time was multiplied by <strong>" + data[fr.k - 1].ratio.toFixed(2) + "</strong>.";
      else {
        var rs = st[cur].ratios;
        m.innerHTML = "Column complete: ratios " + rs.map(function (x) { return x.toFixed(2); }).join(", ") + ". " +
          (st[cur].ok ? "" : "Which class does that imply? Pick one above.");
        if (!st[cur].played) { st[cur].played = true; quiz.enable(); if (!st[cur].ok) fb.innerHTML = ""; }
      }
    }
    function paintSummary() {
      sumWrap.innerHTML = "";
      var done = STUDIES.filter(function (s, j) { return st[j].ok; });
      if (!done.length) return;
      var t = U.table(sumWrap, ["study", "last ratio", "class", "code shape"]);
      t.rows(STUDIES.map(function (s, j) {
        if (!st[j].ok) return [s.name, "…", "…", "…"];
        var rs = st[j].ratios;
        return [s.name, rs[rs.length - 1].toFixed(2), clsName(s.ans), ["one loop", "one loop, runs to the end", "loop inside a loop", "hidden inside sorted()"][j]];
      }), cur);
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.1; } });
    setup();
  }

  /* ============================================================
     Task 3 — predict in seconds (models T = c n² and T = c n)
     ============================================================ */
  function seconds(host) {
    host.classList.add("w8-anim");
    var N0 = 10000, target = 40000, played = false;
    U.title(host, "Animation · two stopwatches, both 1.0 s at n = 10 000");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("predict for n =", [[20000, "20 000"], [40000, "40 000"], [80000, "80 000"]], 40000, function (v) {
      target = v; syncLabels(); testWrap.innerHTML = ""; player.load();
    }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var pq = h("input"); pq.type = "number"; pq.min = "0"; pq.step = "any"; pq.placeholder = "seconds";
    var pl = h("input"); pl.type = "number"; pl.min = "0"; pl.step = "any"; pl.placeholder = "seconds";
    pq.setAttribute("aria-label", "Your prediction for the quadratic model, in seconds");
    pl.setAttribute("aria-label", "Your prediction for the linear model, in seconds");
    var lq = h("span", "lab", ""), ll = h("span", "lab", "");
    opts2.appendChild(lq); opts2.appendChild(pq); opts2.appendChild(ll); opts2.appendChild(pl);
    host.appendChild(opts2);

    function lane(label, cls) {
      var l = h("div", "w8-lane " + cls);
      var head = h("div", "w8-lhead");
      head.appendChild(h("span", "who", label));
      var clock = h("span", "w8-clock", "0.0 s");
      head.appendChild(clock);
      var tr = h("div", "w8-ltrack"), fill = h("div", "w8-lfill");
      tr.appendChild(fill);
      l.appendChild(head); l.appendChild(tr);
      host.appendChild(l);
      return { clock: clock, tr: tr, fill: fill, marks: [] };
    }
    var Q = lane("quadratic model  T(n) = c·n²", "q");
    var Li = lane("linear model  T(n) = c·n", "l");
    var m = U.msg(host);
    var testBtn = btn("test it on a bounded implementation (simulated)", "", runTest);
    var testRow = h("div", "anim-opts"); testRow.appendChild(testBtn);
    var testWrap = h("div", "");

    function steps() { return Math.round(Math.log(target / N0) / Math.LN2); }
    function Tq(n) { return Math.pow(n / N0, 2); }
    function Tl(n) { return n / N0; }
    function syncLabels() {
      var t = sp(target);
      lq.textContent = "quadratic at " + t + ":"; ll.textContent = "linear at " + t + ":";
    }
    function placeMarks(L, T, max) {
      L.marks.forEach(function (x) { L.tr.removeChild(x); }); L.marks = [];
      for (var d = 0, n = N0; d <= steps(); d++, n *= 2) {
        var mk = h("span", "w8-lmark", "<b>" + (n / 1000) + "k</b>");
        var pc = T(n) / max * 100;
        mk.style.left = pc + "%";
        if (pc > 92) mk.classList.add("end");
        mk.setAttribute("data-pc", pc);
        mk.setAttribute("data-d", d);
        L.tr.appendChild(mk); L.marks.push(mk);
      }
    }
    function build() {
      var max = Tq(target), f = [];
      placeMarks(Q, Tq, max); placeMarks(Li, Tl, max);
      for (var i = 0; i <= 100; i++) f.push({ t: max * i / 100 });
      return f;
    }
    function clockTxt(x) { return x < 100 ? x.toFixed(1) + " s" : fmt(Math.round(x)) + " s"; }
    function paint(L, T, t, max) {
      var fin = T(target), shown = Math.min(t, fin);
      L.fill.style.width = (shown / max * 100) + "%";
      L.clock.textContent = clockTxt(shown) + (t >= fin && t > 0 ? "  ✓ done" : "");
      L.clock.className = "w8-clock" + (t >= fin && t > 0 ? " done" : "");
      L.marks.forEach(function (mk) {
        var d = +mk.getAttribute("data-d"), val = T(N0 * Math.pow(2, d));
        mk.className = "w8-lmark" + (shown >= val - 1e-9 ? " on" : "") + (+mk.getAttribute("data-pc") > 92 ? " end" : "");
      });
      var tw = L.tr.clientWidth || 600;
      L.marks.forEach(function (mk, j) {
        var nx = L.marks[j + 1];
        if (nx && (+nx.getAttribute("data-pc") - +mk.getAttribute("data-pc")) / 100 * tw < 34) mk.classList.add("nolab");
      });
    }
    function verdict(inp, want) {
      var p = parseFloat(inp.value);
      if (isNaN(p)) return "";
      return Math.abs(p - want) <= want * 0.05 ? " You predicted " + p + " s — spot on." : " You predicted " + p + " s.";
    }
    function render(fr, i, frames) {
      var max = Tq(target), fq = Tq(target), fl = Tl(target);
      paint(Q, Tq, fr.t, max); paint(Li, Tl, fr.t, max);
      var k = steps(), mult = Math.pow(2, k);
      if (i === 0) {
        m.innerHTML = "Both models take 1.0 s at n = 10 000. Type your predictions for n = " + sp(target) +
          " above, then press <strong>play</strong>. <span class='muted'>(The clocks run " + +(max / 5).toFixed(1) + "× faster than real time.)</span>";
      } else if (i < frames.length - 1) {
        m.innerHTML = fr.t >= fl ? "The linear run has finished at <strong>" + clockTxt(fl) + "</strong>; the quadratic run is still going…"
          : "Each tick on a track is one doubling of n. Linear: each doubling ×2. Quadratic: each doubling ×4.";
      } else {
        m.innerHTML = "n went up ×" + mult + " (" + k + " doubling" + (k > 1 ? "s" : "") + "). Quadratic: ×" + mult + "² = ×" + (mult * mult) +
          " → <strong>" + clockTxt(fq) + "</strong>." + verdict(pq, fq) + " Linear: ×" + mult + " → <strong>" + clockTxt(fl) + "</strong>." + verdict(pl, fl) +
          " These come from the tight models c·n² and c·n — an O(n²) upper bound alone would not fix the ratio.";
        if (!played) { played = true; testBtn.disabled = false; }
      }
    }
    function runTest() {
      testWrap.innerHTML = "";
      var cb = codeBox(testWrap,
        "def quadratic(n):          # nested loops, calibrated: ~1 s at n = 10 000\n    for i in range(n):\n        for j in range(n):\n            pass\n\n" +
        "def linear(n):             # one loop, calibrated: ~1 s at n = 10 000\n    for i in range(n):\n        work()               # a fixed-size job");
      cb.mark([], [2, 3, 7]);
      var r = U.rng(target + 5), rows = [], pq0 = null, pl0 = null;
      for (var d = 0, n = N0; d <= steps(); d++, n *= 2) {
        var mem = 1 + 0.025 * d;                       /* memory effects work against the bigger runs */
        var q = Tq(n) * mem * (1 + 0.02 * (r() - 0.5)), l = Tl(n) * mem * (1 + 0.02 * (r() - 0.5));
        rows.push([sp(n), q.toFixed(2), pq0 ? "×" + (q / pq0).toFixed(2) : "—", l.toFixed(2), pl0 ? "×" + (l / pl0).toFixed(2) : "—"]);
        pq0 = q; pl0 = l;
        if (d === steps()) { var lastQ = q, lastL = l; }
      }
      var tw = h("div", "anim-table-wrap"); testWrap.appendChild(tw);
      U.table(tw, ["n", "quadratic s", "ratio", "linear s", "ratio"]).rows(rows, rows.length - 1);
      testWrap.appendChild(h("p", "note-sim", "Simulated timings from the two models plus a small memory penalty (+2.5% per doubling) and ±1% seeded noise — run real code in Colab for your own numbers."));
      testWrap.appendChild(h("p", "w8-verdict", "At n = " + sp(target) + ": predicted " + clockTxt(Tq(target)) + " and " + clockTxt(Tl(target)) +
        ", “measured” " + lastQ.toFixed(1) + " s and " + lastL.toFixed(2) + " s — a bit above the prediction, because memory effects usually work against the bigger run."));
    }
    host.appendChild(testRow);
    host.appendChild(testWrap);
    var player = U.Player(host, { build: build, render: render, fps: function () { return 20; } });
    testBtn.disabled = true;
    syncLabels();
    player.load();
  }

  /* ============================================================
     Task 4 — price the receipt / watch two() run
     ============================================================ */
  function receipt(host) {
    host.classList.add("w8-anim");
    var SRC = "def one(data):\n    s = sum(data)                 # ?\n    data.sort()                   # ?\n    return s, data[0]\n\ndef two(data):\n    seen = []\n    for x in data:                # ?\n        if x not in seen:         # ?\n            seen.append(x)\n    return seen";
    var OPTS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)"];
    var ITEMS = [
      { fn: "one", label: "s = sum(data)", line: 2, ans: "O(n)", why: "<code>sum</code> walks every item: O(n)." },
      { fn: "one", label: "data.sort()", line: 3, ans: "O(n log n)", why: "sorting is O(n log n)." },
      { fn: "one", label: "return s, data[0]", line: 4, given: "O(1)" },
      { fn: "one", label: "total — in sequence, so add and keep the biggest", total: true, lines: [2, 3, 4], ans: "O(n log n)", why: "O(n) + O(n log n) + O(1) → <strong>O(n log n)</strong>." },
      { fn: "two", label: "for x in data:  (rounds)", line: 8, ans: "O(n)", why: "the loop runs n times." },
      { fn: "two", label: "if x not in seen:  (each round)", line: 9, ans: "O(n)", why: "<code>not in</code> is itself a scan of <code>seen</code>, up to n items." },
      { fn: "two", label: "seen.append(x)", line: 10, given: "O(1)" },
      { fn: "two", label: "total time — the test is nested inside the loop", total: true, lines: [8, 9, 10], ans: "O(n²)", why: "O(n) × O(n) → <strong>O(n²)</strong>." },
      { fn: "two", label: "extra space", total: true, lines: [7, 10], ans: "O(n)", why: "<code>seen</code> can grow to the size of the input → <strong>O(n)</strong>." }
    ];
    var mode = "price";
    U.title(host, "Animation · price each region, then watch the hidden loop");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("mode", [["price", "price the receipt"], ["watch", "watch two() run"]], "price", function (v) { mode = v; show(); }));
    host.appendChild(opts);

    /* ----- price mode ----- */
    var P = h("div", "w8-price");
    host.appendChild(P);
    var cb = codeBox(P, SRC);
    var paper = h("div", "w8-receipt");
    P.appendChild(paper);
    var sels = [];
    var lastFn = null;
    ITEMS.forEach(function (it, j) {
      if (it.fn !== lastFn) { paper.appendChild(h("div", "w8-rhead", it.fn + "(data)")); lastFn = it.fn; }
      var row = h("div", "w8-ritem" + (it.total ? " total" : ""));
      row.appendChild(h("span", "w8-rlab", it.total ? esc(it.label) : "<code>" + esc(it.label) + "</code>"));
      if (it.given) {
        row.appendChild(h("span", "w8-given", it.given));
      } else {
        var s = h("select");
        s.setAttribute("aria-label", it.fn + ": " + it.label);
        ["?"].concat(OPTS).forEach(function (o) { var op = h("option", "", o); op.value = o; s.appendChild(op); });
        var hi = function () { cb.mark([], it.total ? it.lines : [it.line]); };
        s.addEventListener("focus", hi); s.addEventListener("mouseenter", hi);
        s.addEventListener("change", function () { row.className = "w8-ritem" + (it.total ? " total" : ""); hi(); sum(); });
        row.appendChild(s);
        sels.push({ it: it, s: s, row: row });
      }
      row.addEventListener("mouseenter", function () { cb.mark([], it.total ? it.lines : [it.line]); });
      paper.appendChild(row);
    });
    var pr = h("div", "anim-opts w8-checkrow");
    var bCheck = btn("check my receipt", "primary", check);
    var bClear = btn("clear", "", function () { sels.forEach(function (x) { x.s.value = "?"; x.row.className = "w8-ritem" + (x.it.total ? " total" : ""); }); pm.innerHTML = start; cb.mark([], []); });
    pr.appendChild(bCheck); pr.appendChild(bClear);
    P.appendChild(pr);
    var pm = h("p", "anim-msg", "");
    pm.setAttribute("aria-live", "polite");
    P.appendChild(pm);
    var start = "Pick a price for every <code># ?</code> region, then the totals. Hover a row to see which lines it covers.";
    pm.innerHTML = start;
    function sum() {
      var left = sels.filter(function (x) { return x.s.value === "?"; }).length;
      pm.innerHTML = left ? left + " price" + (left > 1 ? "s" : "") + " still blank." : "All filled in — press <strong>check my receipt</strong>.";
    }
    function check() {
      var wrong = 0, blank = 0, notes = [];
      sels.forEach(function (x) {
        var v = x.s.value, cls = "w8-ritem" + (x.it.total ? " total" : "");
        if (v === "?") { blank++; }
        else if (v === x.it.ans) { cls += " good"; notes.push(x.it.why); }
        else { cls += " bad"; wrong++; }
        x.row.className = cls;
      });
      if (blank) { pm.innerHTML = "Fill in the " + blank + " blank price" + (blank > 1 ? "s" : "") + " first."; return; }
      if (wrong) {
        pm.innerHTML = wrong + " of " + sels.length + " prices need another look (marked in red). Remember §8.5: statements in sequence <em>add</em> (keep the biggest); loops written inside each other <em>multiply</em>. " +
          "Tip: switch to <strong>watch two() run</strong> and count the comparisons.";
        return;
      }
      pm.innerHTML = "All correct. <code>one</code>: O(n) + O(n log n) + O(1) → <strong>O(n log n)</strong>. " +
        "<code>two</code>: the loop runs n times and <code>not in seen</code> is itself an O(n) scan, so O(n) × O(n) = <strong>O(n²)</strong> time, and <strong>O(n)</strong> space. " +
        "(Week 11's set turns that membership test into O(1) and the whole thing into O(n).)";
    }

    /* ----- watch mode ----- */
    var W = h("div", "w8-watch");
    host.appendChild(W);
    var wopts = h("div", "anim-opts");
    var kind = "diff", N = 6;
    wopts.appendChild(U.seg("data", [["diff", "all different"], ["same", "all the same"]], "diff", function (v) { kind = v; ct.load(); }));
    wopts.appendChild(U.seg("n", [[6, "6"], [12, "12"]], 6, function (v) { N = v; ct.load(); }));
    W.appendChild(wopts);
    var runs = {};
    function input() {
      if (kind === "same") { var a = []; for (var i = 0; i < N; i++) a.push(7); return a; }
      return N === 6 ? [5, 3, 8, 1, 9, 2] : [5, 3, 8, 1, 9, 2, 12, 4, 10, 6, 11, 0];
    }
    function code() {
      return "def two(data):\n    seen = []\n    for x in data:\n        if x not in seen:\n            seen.append(x)\n    return seen\n\nprint(two(" + "[" + input().join(", ") + "]" + "))";
    }
    var dRow, sRow, tally;
    function buildW() {
      var d = input(), f = [], seen = [], cmp = 0;
      function fr(line, x, extra) {
        var o = { line: line, vars: { data: d.slice(), seen: seen.slice() }, out: [], counters: { "comparisons inside not in": cmp, "len(seen)": seen.length } };
        if (x != null) o.vars.x = x;
        for (var k in extra) o[k] = extra[k];
        return o;
      }
      f.push(fr(8, null, { note: "Call <code>two</code> on " + d.length + " items (" + (kind === "same" ? "all the same" : "all different") + "). Press <strong>play</strong>.", di: -1 }));
      delete f[0].vars.seen;
      f.push(fr(2, null, { note: "Start with an empty <code>seen</code> list.", di: -1 }));
      for (var i = 0; i < d.length; i++) {
        var x = d[i];
        f.push(fr(3, x, { note: "Round " + (i + 1) + " of " + d.length + ": x = " + x + ".", di: i }));
        var hit = -1;
        for (var j = 0; j < seen.length; j++) {
          cmp++;
          var eq = seen[j] === x;
          f.push(fr(4, x, { note: "<code>not in</code> compares x with seen[" + j + "] = " + seen[j] + (eq ? " — equal, so the scan stops." : " — not equal, keep scanning."), di: i, sj: j, eq: eq }));
          if (eq) { hit = j; break; }
        }
        if (hit < 0) {
          f.push(fr(4, x, { note: seen.length ? "Scanned all " + seen.length + " of <code>seen</code>: " + x + " is not there, so the test is True." : "<code>seen</code> is empty — nothing to compare, the test is True.", di: i }));
          seen.push(x);
          f.push(fr(5, x, { note: "Append " + x + ". <code>seen</code> now holds " + seen.length + " item" + (seen.length > 1 ? "s" : "") + ".", di: i, sj: seen.length - 1, add: true }));
        } else {
          f.push(fr(4, x, { note: x + " is already in <code>seen</code>: the test is False, nothing appended.", di: i, sj: hit, eq: true }));
        }
      }
      var last = fr(6, null, { di: -1, done: true });
      last.out = ["[" + seen.join(", ") + "]"];
      var nn = d.length;
      last.note = "Returned after <strong>" + cmp + " comparisons</strong> hidden inside <code>not in</code> for n = " + nn + "." +
        (kind === "diff" ? " With all items different that is 0 + 1 + … + " + (nn - 1) + " = n(n−1)/2 — quadratic. Try n = " + (nn === 6 ? 12 : 6) + "." :
          " With repeats, <code>seen</code> stays tiny, so each scan is short — the worst case (all different) is what O(n²) promises about.");
      f.push(last);
      return f;
    }
    function onFrame(fr) {
      var d = input();
      var ex = ct.extra;
      if (!dRow) {
        ex.innerHTML = "";
        ex.appendChild(h("div", "w8-cap", "data — the loop's position"));
        dRow = h("div", "arr idx"); ex.appendChild(dRow);
        ex.appendChild(h("div", "w8-cap", "seen — what <code>not in</code> must scan"));
        sRow = h("div", "arr"); ex.appendChild(sRow);
        tally = h("div", "w8-cap w8-tally", ""); ex.appendChild(tally);
      }
      dRow.innerHTML = d.map(function (v, j) {
        return '<div class="cell' + (j === fr.di ? " on" : j < fr.di || fr.done ? " dim" : "") + '">' + v + "<small>" + j + "</small></div>";
      }).join("");
      var s = fr.vars.seen || [];
      sRow.innerHTML = s.length ? s.map(function (v, j) {
        var c = "cell";
        if (j === fr.sj) c += fr.add ? " good" : fr.eq ? " gold" : " on";
        else if (fr.sj != null && j < fr.sj && !fr.add) c += " dim";
        return '<div class="' + c + '">' + v + "</div>";
      }).join("") : '<div class="cell w8-empty">empty</div>';
      if (fr.done) {
        runs[kind + N] = fr.counters["comparisons inside not in"];
        var parts = [];
        [["diff", 6], ["diff", 12], ["same", 6], ["same", 12]].forEach(function (p) {
          if (runs[p[0] + p[1]] != null) parts.push((p[0] === "diff" ? "all different" : "all the same") + ", n = " + p[1] + ": " + runs[p[0] + p[1]]);
        });
        tally.textContent = "comparisons so far — " + parts.join("  ·  ");
      }
    }
    var ct = U.CodeTrace(W, { code: code, build: buildW, onFrame: onFrame, varsTitle: "variables", outTitle: "output",
      fps: function (i, frames) { return frames.length > 60 ? 6 : 3; } });

    function show() {
      P.style.display = mode === "price" ? "" : "none";
      W.style.display = mode === "watch" ? "" : "none";
      if (mode === "watch") ct.load(); else ct.stop();
    }
    var origLoad = ct.load;
    ct.load = function () { dRow = null; origLoad(); };
    ct.load();
    show();
  }

  /* ============================================================
     Task 5 — best, worst, average: count the comparisons
     ============================================================ */
  function cases(host) {
    host.classList.add("w8-anim");
    var N = 1000, mode = "best";
    var SRC1 = "def find(data, target):\n    for i, x in enumerate(data):\n        if x == target:\n            return i          # stops the moment it hits\n    return -1\n\nnums = list(range(1000))\nprint(find(nums, 0))          # best case: 1 comparison\nprint(find(nums, 999))        # worst case: 1000 comparisons\nprint(find(nums, -1))         # worst case: 1000 comparisons, absent";
    var SRC2 = "def find_count(data, target):     # find, plus a comparison counter\n    comparisons = 0\n    for i, x in enumerate(data):\n        comparisons += 1\n        if x == target:\n            return comparisons\n    return comparisons\n\nnums = list(range(1000))\ntotal = 0\nfor target in nums:               # every position equally likely\n    total += find_count(nums, target)\nprint(total / len(nums))";
    U.title(host, "Animation · one function, three amounts of work");

    /* predictions */
    var pbox = h("div", "w8-predict");
    pbox.appendChild(h("div", "w8-cap", "your answers for 1 000 items (comparisons, then class)"));
    var fields = [["best", 1, "O(1)"], ["worst", 1000, "O(n)"], ["average", 500.5, "O(n)"]].map(function (d) {
      var row = h("div", "anim-opts w8-prow");
      row.appendChild(h("span", "lab w8-plab", d[0]));
      var inp = h("input"); inp.type = "number"; inp.step = "any"; inp.min = "0"; inp.placeholder = "count";
      inp.setAttribute("aria-label", d[0] + " case: number of comparisons");
      var sel = h("select"); sel.setAttribute("aria-label", d[0] + " case: Big-O class");
      ["class?", "O(1)", "O(log n)", "O(n)", "O(n²)"].forEach(function (o) { var op = h("option", "", o); op.value = o; sel.appendChild(op); });
      var mark = h("span", "w8-pmark", "");
      row.appendChild(inp); row.appendChild(sel); row.appendChild(mark);
      pbox.appendChild(row);
      return { name: d[0], want: d[1], cls: d[2], inp: inp, sel: sel, mark: mark, row: row };
    });
    var crow = h("div", "anim-opts");
    crow.appendChild(btn("check my answers", "", checkAns));
    pbox.appendChild(crow);
    var pmsg = h("p", "w8-fb", "");
    pmsg.setAttribute("aria-live", "polite");
    pbox.appendChild(pmsg);
    host.appendChild(pbox);
    function checkAns() {
      var bad = [], blank = false;
      fields.forEach(function (f) {
        var v = parseFloat(f.inp.value), okN = Math.abs(v - f.want) < 1e-9, okC = f.sel.value === f.cls;
        if (isNaN(v) || f.sel.value === "class?") { blank = true; f.mark.textContent = ""; f.row.className = "anim-opts w8-prow"; return; }
        f.mark.textContent = okN && okC ? "✓" : "✗";
        f.row.className = "anim-opts w8-prow " + (okN && okC ? "good" : "bad");
        if (!(okN && okC)) bad.push(f);
      });
      if (blank) { pmsg.innerHTML = "Fill in all three numbers and classes first."; return; }
      if (!bad.length) {
        pmsg.innerHTML = "All right. Best: 1 comparison, O(1). Worst: 1 000 comparisons, O(n). Average: (1 + 1 000) / 2 = <strong>500.5</strong> comparisons — still O(n) once the ½ constant is dropped.";
        return;
      }
      var f = bad[0], v = parseFloat(f.inp.value), tip;
      if (f.name === "average" && Math.abs(v - 500) < 1e-9) tip = "Close! 500 is not exact: the target sits at position 1 to 1 000 with equal chance, and the mean of 1 … 1 000 is not 500. Run the <strong>average</strong> mode.";
      else if (Math.abs(v - f.want) < 1e-9) tip = "Your number for the " + f.name + " case is right, but its class is not: drop the constants, keep how it grows with n.";
      else tip = "The " + f.name + " case is not right yet. Pick the matching mode below and press play to count.";
      pmsg.innerHTML = tip;
    }

    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("target", [["best", "0"], ["worst", "999"], ["absent", "-1"], ["avg", "each of 0…999 (average)"]], "best",
      function (v) { mode = v; ct.load(); }));
    opts.className += " w8-wrapseg";
    host.appendChild(opts);

    var cv = null, ctx = null;
    function target() { return mode === "best" ? 0 : mode === "worst" ? 999 : -1; }
    function build() {
      var f = [];
      if (mode !== "avg") {
        var t = target(), pl = { best: 8, worst: 9, absent: 10 }[mode], cmp = 0;
        f.push({ line: 7, hl: [pl], vars: { target: t }, out: [], counters: { comparisons: 0 }, scan: 0,
          note: "<code>nums</code> holds 0 … 999. We call <code>find(nums, " + t + ")</code>. How many times will <code>x == target</code> run? Press <strong>play</strong>." });
        for (var i = 0; i < N; i++) {
          cmp++;
          var hit = i === t;
          f.push({ line: 3, hl: [pl], vars: { target: t, i: i, x: i, comparisons: cmp }, out: [], counters: { comparisons: fmt(cmp) }, scan: i + 1, hit: hit ? i : -1,
            note: hit ? "x == target: <strong>yes</strong> — at position " + i + "." : "Is " + i + " == " + t + "? No — next item." });
          if (hit) break;
        }
        var res = t >= 0 ? t : -1;
        f.push({ line: t >= 0 ? 4 : 5, hl: [pl], vars: { target: t, comparisons: cmp }, out: [String(res)], counters: { comparisons: fmt(cmp) }, scan: cmp, hit: t >= 0 ? t : -1, done: true,
          note: (t === 0 ? "Best case: the target is the first item, so <strong>1 comparison</strong> — whatever the length of the list." :
            t === 999 ? "Worst case: the target is last, so <strong>1 000 comparisons</strong> — every item was checked." :
              "Absent: no item matches, so the loop runs to the end — <strong>1 000 comparisons</strong>, then <code>return -1</code>.") });
      } else {
        var total = 0;
        f.push({ line: 10, vars: { total: 0 }, out: [], counters: { "targets tried": 0, total: 0 }, k: 0,
          note: "Average case: try every target 0 … 999 once (each position equally likely) and add up the comparisons. Press <strong>play</strong>." });
        for (var k = 0; k < N; k++) {
          total += k + 1;
          f.push({ line: 12, vars: { target: k, "find_count(…)": k + 1, total: total }, out: [], k: k + 1,
            counters: { "targets tried": fmt(k + 1), total: fmt(total), "total / tried": +(total / (k + 1)).toFixed(4) },
            note: "Target " + k + " sits at position " + (k + 1) + " → " + (k + 1) + " comparison" + (k ? "s" : "") + ". Running total " + fmt(total) + "." });
        }
        f.push({ line: 13, vars: { total: total }, out: [String(total / N)], k: N, done: true,
          counters: { "targets tried": fmt(N), total: fmt(total), "total / tried": total / N },
          note: "(1 + 2 + … + 1 000) / 1 000 = " + sp(total) + " / 1 000 = <strong>500.5</strong> comparisons on average — about n/2, which is still <strong>O(n)</strong> once the ½ is dropped." });
      }
      return f;
    }
    function draw(fr) {
      if (!cv) {
        cv = h("canvas", "w8-cv"); cv.width = 720; cv.height = 320;
        ct.extra.appendChild(cv);
        ctx = cv.getContext("2d");
        new MutationObserver(function () { if (lastFr) draw(lastFr); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        var redraw = function () { if (lastFr) draw(lastFr); };
        var det = host.closest("details");
        if (det) det.addEventListener("toggle", redraw);
        window.addEventListener("resize", redraw);
      }
      lastFr = fr;
      var W = cv.width, H = cv.height, c = function (v) { return U.cssVar(host, v); };
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = c("--bg-soft"); ctx.fillRect(0, 0, W, H);
      ctx.font = "12px " + (c("--font-mono") || "monospace");
      if (mode !== "avg") {
        cv.setAttribute("aria-label", "1000 list items in a grid; checked items are highlighted");
        var narrow = (host.clientWidth || 999) < 460, cols = narrow ? 25 : 50, cell = narrow ? 27 : 14, top = 8, left = 10;
        var needH = top + Math.ceil(N / cols) * cell + 24;
        if (cv.height !== needH) cv.height = needH;
        H = cv.height;
        ctx.fillStyle = c("--bg-soft"); ctx.fillRect(0, 0, W, H);
        ctx.font = (narrow ? "22px " : "12px ") + (c("--font-mono") || "monospace");
        for (var j = 0; j < N; j++) {
          var x = left + (j % cols) * cell, y = top + Math.floor(j / cols) * cell;
          ctx.fillStyle = j === fr.hit ? c("--green") : j >= fr.scan ? c("--border-strong") :
            (j === fr.scan - 1 && !fr.done ? c("--blue") : c("--accent"));
          ctx.globalAlpha = j < fr.scan && j !== fr.hit && j !== fr.scan - 1 ? 0.55 : 1;
          ctx.fillRect(x + 1, y + 1, cell - 3, cell - 3);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = c("--muted"); ctx.textAlign = "left";
        ctx.fillText("nums: 1 000 items, " + cols + " per row · lit = compared", left, H - 8);
      } else {
        cv.setAttribute("aria-label", "Comparisons needed for each target position, with the running average");
        if (cv.height !== 320) { cv.height = 320; H = 320; ctx.font = "12px " + (c("--font-mono") || "monospace"); }
        ctx.fillStyle = c("--bg-soft"); ctx.fillRect(0, 0, W, H);
        var L = 56, R = 14, T = 16, B = 34, pw = W - L - R, ph = H - T - B;
        ctx.strokeStyle = c("--border"); ctx.lineWidth = 1; ctx.fillStyle = c("--muted");
        [0, 250, 500, 750, 1000].forEach(function (v) {
          var y = T + ph - v / N * ph;
          ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(W - R, y); ctx.stroke();
          ctx.textAlign = "right"; ctx.fillText(String(v), L - 6, y + 4);
          var x = L + v / N * pw; ctx.textAlign = "center"; ctx.fillText(String(v), x, H - B + 16);
        });
        ctx.textAlign = "center"; ctx.fillText("target position (1 … 1 000)", L + pw / 2, H - 4);
        ctx.save(); ctx.translate(12, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("comparisons", 0, 0); ctx.restore();
        var k = fr.k;
        if (k > 0) {
          ctx.fillStyle = c("--accent-soft") || c("--surface-2");
          ctx.beginPath(); ctx.moveTo(L, T + ph);
          ctx.lineTo(L + k / N * pw, T + ph - k / N * ph); ctx.lineTo(L + k / N * pw, T + ph); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = c("--accent"); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(L, T + ph - 1 / N * ph); ctx.lineTo(L + k / N * pw, T + ph - k / N * ph); ctx.stroke();
          var mean = (k + 1) / 2, my = T + ph - mean / N * ph;
          ctx.strokeStyle = c("--blue"); ctx.setLineDash([6, 5]);
          ctx.beginPath(); ctx.moveTo(L, my); ctx.lineTo(W - R, my); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = c("--blue"); ctx.textAlign = "right";
          ctx.fillText("average so far = " + (+mean.toFixed(1)), W - R - 4, my - 6);
        }
      }
    }
    var lastFr = null;
    var ct = U.CodeTrace(host, {
      code: function () { return mode === "avg" ? SRC2 : SRC1; },
      build: build, onFrame: draw, outTitle: "output",
      fps: function (i, frames) { return Math.max(1.5, frames.length / 5); }
    });
    ct.load();
  }

  AAAnim.register("w8-classify", classify);
  AAAnim.register("w8-ratio-class", ratioClass);
  AAAnim.register("w8-seconds", seconds);
  AAAnim.register("w8-receipt", receipt);
  AAAnim.register("w8-cases", cases);
})();
