/* ============================================================
   AA — week 13 "Try it yourself" animations (sorting)
   w13-bubble-paper, w13-doubling, w13-cases, w13-loglog,
   w13-insertion, w13-stability
   Needs anim.js (AAAnim.ui) loaded first.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, fmt = U.fmt;

  function pyList(a) { return "[" + a.join(", ") + "]"; }
  function wrapTable(parent, heads) {
    var w = h("div", "anim-table-wrap");
    parent.appendChild(w);
    return U.table(w, heads);
  }
  function fitChart(c) { if (window.innerWidth < 600) c.el.width = 460; }
  function randomData(seed, n) {             /* data = [random.randrange(1000000) for _ in range(n)] */
    var R = U.rng(seed), a = new Int32Array(n);
    for (var i = 0; i < n; i++) a[i] = Math.floor(R() * 1000000);
    return a;
  }
  function caseData(kind, n, seed) {
    var a = new Int32Array(n), i;
    if (kind === "sorted") for (i = 0; i < n; i++) a[i] = i + 1;
    else if (kind === "reversed") for (i = 0; i < n; i++) a[i] = n - i;
    else a = randomData(seed, n);
    return a;
  }

  /* --- the three sorts from §13.2–13.4, counting exactly as the page's code does --- */
  function bubbleCount(src) {
    var a = Int32Array.from(src), n = a.length, c = 0, s = 0;
    for (var end = n - 1; end > 0; end--) {
      var swapped = false;
      for (var i = 0; i < end; i++) {
        c++;
        if (a[i] > a[i + 1]) { var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; s++; swapped = true; }
      }
      if (!swapped) break;
    }
    return { c: c, s: s, a: a };
  }
  function selectionCount(src) {
    var a = Int32Array.from(src), n = a.length, c = 0, s = 0;
    for (var start = 0; start < n; start++) {
      var sm = start;
      for (var i = start + 1; i < n; i++) { c++; if (a[i] < a[sm]) sm = i; }
      if (sm !== start) { var t = a[start]; a[start] = a[sm]; a[sm] = t; s++; }
    }
    return { c: c, s: s, a: a };
  }
  function insertionCount(src, perItem) {
    var a = Int32Array.from(src), n = a.length, c = 0, s = 0;
    for (var i = 1; i < n; i++) {
      var cur = a[i], j = i - 1, c0 = c;
      while (j >= 0) {
        c++;
        if (a[j] > cur) { a[j + 1] = a[j]; s++; j--; } else break;
      }
      a[j + 1] = cur;
      if (perItem) perItem.push(c - c0);
    }
    return { c: c, s: s, a: a };
  }

  /* ============================================================
     Task 1 — bubble sort on paper first
     ============================================================ */
  var BUBBLE_CODE = [
    "def bubble_sort(data):",
    '    """Sorts a copy of data. Returns (sorted list, comparisons, swaps)."""',
    "    items = data[:]                      # work on a copy",
    "    comparisons = swaps = 0",
    "    n = len(items)",
    "",
    "    for end in range(n - 1, 0, -1):      # shrinking unsorted region",
    "        swapped = False",
    "        for i in range(end):",
    "            comparisons += 1",
    "            if items[i] > items[i + 1]:",
    "                items[i], items[i + 1] = items[i + 1], items[i]",
    "                swaps += 1",
    "                swapped = True",
    "        if not swapped:                  # already sorted — stop early",
    "            break",
    "",
    "    return items, comparisons, swaps",
    "",
    "print(bubble_sort([5, 1, 4, 2, 8]))"
  ].join("\n");

  function bubblePaper(host) {
    var START = [5, 1, 4, 2, 8], mode = "watch";
    U.title(host, "Animation · bubble_sort([5, 1, 4, 2, 8]), one comparison at a time");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("mode", [["watch", "watch the code"], ["you", "you be the machine"]], mode, function (v) { mode = v; reset(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    function num(lab) {
      var i = h("input"); i.type = "number"; i.min = "0"; i.placeholder = lab; i.setAttribute("aria-label", "Your count of " + lab);
      opts2.appendChild(i); return i;
    }
    opts2.appendChild(h("span", "lab", "your paper counts:"));
    var gC = num("comparisons"), gS = num("swaps");
    host.appendChild(opts2);

    var row = h("div", "w13-tiles");
    host.appendChild(row);
    var tiles = {};
    START.forEach(function (v) { var t = h("div", "w13-tile", String(v)); tiles[v] = t; row.appendChild(t); });
    function layout(a, i, kind, end) {
      var n = a.length, w = 100 / n;
      a.forEach(function (v, j) {
        var t = tiles[v], pair = i >= 0 && (j === i || j === i + 1);
        t.style.left = (j * w + 1.5) + "%";
        t.style.width = (w - 3) + "%";
        t.className = "w13-tile" + (pair ? " " + kind : "") + (end != null && j > end ? " fin" : "") + (kind === "done" ? " fin" : "");
      });
    }
    var logBox = h("ol", "w13-log");
    host.appendChild(logBox);
    function paintLog(log) {
      logBox.innerHTML = "<li class='muted'>start " + pyList(START) + "</li>" + log.map(function (l) { return "<li>" + l + "</li>"; }).join("");
    }

    /* frames shared by both modes */
    function build() {
      var a = START.slice(), f = [], n = a.length, c = 0, s = 0, log = [], end = null, i = null, swapped = null;
      function V() {
        var v = { data: START, items: a.slice() };
        if (c !== null) { v.comparisons = c; v.swaps = s; v.n = n; }
        if (end !== null) { v.end = end; v.swapped = swapped; }
        if (i !== null) v.i = i;
        return v;
      }
      function P(line, note, x) {
        var fr = { line: line, vars: V(), note: note, a: a.slice(), i: -1, end: end, log: log.slice(), counters: { comparisons: c || 0, swaps: s || 0 } };
        for (var k in x) fr[k] = x[k];
        f.push(fr);
      }
      c = null;
      P(20, "Sort it on paper first and write your two counts above. Then press <strong>play</strong> — or switch to <strong>you be the machine</strong>.", { kind: "start" });
      c = 0; s = 0;
      P(5, "items is a copy of data; both counters start at 0; n = 5.", { hl: [3, 4], kind: "init" });
      var pass = 0;
      for (end = n - 1; end > 0; end--) {
        pass++; swapped = false; i = null;
        var c0 = c, s0 = s;
        P(8, "Pass " + pass + ": end = " + end + ", so compare neighbours at i = 0 … " + (end - 1) + ". Everything right of index " + end + " is already in place.", { hl: [7], kind: "pass", pass: pass });
        for (i = 0; i < end; i++) {
          c++;
          P(11, "Compare items[" + i + "] = <strong>" + a[i] + "</strong> with items[" + (i + 1) + "] = <strong>" + a[i + 1] + "</strong>. " +
            (a[i] > a[i + 1] ? a[i] + " &gt; " + a[i + 1] + " — out of order." : a[i] + " &lt; " + a[i + 1] + " — fine, leave them."),
            { hl: [9, 10], i: i, kind: a[i] > a[i + 1] ? "cmp" : "ok", pass: pass, should: a[i] > a[i + 1] });
          if (a[i] > a[i + 1]) {
            var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; s++; swapped = true;
            P(12, "Swap them → " + pyList(a) + ". swaps = " + s + ", swapped = True.", { hl: [13, 14], i: i, kind: "swp", pass: pass });
          }
        }
        i = null;
        log.push("pass " + pass + " → " + (swapped ? pyList(a) : "no swaps, stop") + " <span class='muted'>(" + (c - c0) + " comparisons, " + (s - s0) + (s - s0 === 1 ? " swap" : " swaps") + ")</span>");
        P(15, "End of pass " + pass + ". " + (swapped ? "A swap happened, so <code>not swapped</code> is False — keep going." : "No swaps at all, so the list is sorted: <strong>break</strong>."),
          { kind: swapped ? "passend" : "stop", pass: pass, swapped: swapped });
        if (!swapped) { P(16, "Early exit after " + pass + " passes — the full 4 + 3 + 2 + 1 = 10 comparisons are not needed.", { kind: "stop", pass: pass }); break; }
      }
      var res = "(" + pyList(a) + ", " + c + ", " + s + ")";
      P(18, "Return the sorted copy and both counters.", { kind: "done" });
      f.push({ line: 20, vars: f[f.length - 1].vars, a: a.slice(), i: -1, end: null, log: log.slice(), counters: { comparisons: c, swaps: s }, kind: "done", out: [res],
        note: "Printed <strong>" + res + "</strong> — <strong>9 comparisons, 4 swaps</strong>, exactly the page's output.", final: true });
      return f;
    }
    function verdict() {
      var pc = parseInt(gC.value, 10), ps = parseInt(gS.value, 10);
      if (isNaN(pc) && isNaN(ps)) return "";
      return (pc === 9 && ps === 4) ? " Your paper counts match exactly." :
        " Your paper said " + (isNaN(pc) ? "?" : pc) + " comparisons and " + (isNaN(ps) ? "?" : ps) + " swaps — find the step where they differ.";
    }

    var watch = h("div", "");
    host.appendChild(watch);
    var ct = U.CodeTrace(watch, {
      code: BUBBLE_CODE, build: build, fps: function () { return 1.5; },
      onFrame: function (fr) {
        layout(fr.a, fr.i, fr.kind, fr.kind === "done" ? null : fr.end);
        paintLog(fr.log);
        if (fr.final) ct.msg.innerHTML = fr.note + verdict();
      }
    });

    /* you be the machine */
    var you = h("div", "w13-you");
    var bSwap = U.btn("swap them", "primary", function () { answer("swap"); });
    var bKeep = U.btn("leave them", "", function () { answer("keep"); });
    var bStop = U.btn("stop (break)", "primary", function () { answer("stop"); });
    var bMore = U.btn("another pass", "", function () { answer("more"); });
    [bSwap, bKeep, bStop, bMore].forEach(function (b) { you.appendChild(b); });
    host.appendChild(you);
    var ystats = h("div", "anim-stats");
    host.appendChild(ystats);
    var ym = U.msg(host);
    var yf = [], yi = 0, slips = 0, busy = false;
    function yShow() {
      while (yi < yf.length && ["ok", "cmp", "passend", "stop", "done"].indexOf(yf[yi].kind) < 0) yi++;
      var fr = yf[yi];
      layout(fr.a, fr.kind === "passend" || fr.kind === "stop" ? -1 : fr.i, fr.kind === "ok" ? "cmp" : fr.kind, fr.kind === "done" ? null : fr.end);
      paintLog(fr.kind === "passend" || fr.kind === "stop" ? fr.log.slice(0, -1) : fr.log);
      ystats.innerHTML = "<span class='anim-stat'>comparisons<b>" + fr.counters.comparisons + "</b></span><span class='anim-stat'>swaps<b>" + fr.counters.swaps + "</b></span>";
      var cmp = fr.kind === "ok" || fr.kind === "cmp", pe = fr.kind === "passend" || fr.kind === "stop";
      bSwap.style.display = bKeep.style.display = cmp ? "" : "none";
      bStop.style.display = bMore.style.display = pe ? "" : "none";
      if (cmp) ym.innerHTML = "Pass " + fr.pass + ", i = " + fr.i + ": the raised tiles are <strong>" + fr.a[fr.i] + "</strong> and <strong>" + fr.a[fr.i + 1] + "</strong>. What does line 11 say?";
      else if (pe) ym.innerHTML = "End of pass " + fr.pass + ". Did this pass make any swap? Decide what line 15 does.";
      else {
        ym.innerHTML = "Done: <strong>" + fr.counters.comparisons + " comparisons, " + fr.counters.swaps + " swaps</strong> — the same as the code's (…, 9, 4)." +
          (slips ? " " + slips + " slip" + (slips > 1 ? "s" : "") + " along the way." : " No slips.") + verdict();
      }
    }
    function answer(what) {
      if (busy) return;
      var fr = yf[yi], right;
      if (fr.kind === "ok" || fr.kind === "cmp") right = (what === "swap") === fr.should;
      else right = (what === "stop") === (fr.kind === "stop");
      if (!right) {
        slips++;
        ym.innerHTML = "Not quite — " + (fr.kind === "ok" || fr.kind === "cmp"
          ? (fr.should ? fr.a[fr.i] + " &gt; " + fr.a[fr.i + 1] + ", so they are out of order and must swap." : fr.a[fr.i] + " &lt; " + fr.a[fr.i + 1] + ", so they stay.")
          : (fr.kind === "stop" ? "this pass made no swaps, so swapped is still False and the code breaks out." : "a swap happened this pass, so swapped is True and another pass runs.")) + " Try again.";
        return;
      }
      yi++;
      if (fr.kind === "cmp") { layout(yf[yi].a, yf[yi].i, "swp", yf[yi].end); yi++; }
      if (fr.kind === "stop") { while (yi < yf.length && yf[yi].kind !== "done") yi++; }
      busy = true;
      setTimeout(function () { busy = false; yShow(); }, U.REDUCED ? 0 : 450);
    }
    function reset() {
      ct.stop();
      if (mode === "watch") { watch.style.display = ""; you.style.display = "none"; ystats.style.display = "none"; ym.style.display = "none"; ct.load(); }
      else {
        watch.style.display = "none"; you.style.display = ""; ystats.style.display = ""; ym.style.display = "";
        yf = build(); yi = 1; slips = 0; yShow();
      }
    }
    reset();
  }

  /* ============================================================
     Task 2 — confirm the class (doubling table)
     ============================================================ */
  var COST = {   /* seconds per counted operation — a model, anchored to §13.6 (n = 1000 bubble ≈ 0.09 s) */
    bubble: { c: 110e-9, s: 150e-9 },
    selection: { c: 125e-9, s: 150e-9 },
    insertion: { c: 110e-9, s: 90e-9 },
    sortedUnit: 23e-9      /* sorted(): per n·log2(n) unit (§13.6: n = 1000 → 0.00023 s) */
  };
  function doubling(host) {
    var SIZES = [500, 1000, 2000, 4000], seed = 13, col = "c", memo = null;
    U.title(host, "Animation · bubble vs selection on random data, n doubling");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("column", [["c", "comparisons"], ["t", "seconds (simulated)"]], col, function (v) { col = v; player.load(); }));
    opts.appendChild(U.btn("new random data", "", function () { seed++; memo = null; player.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var guess = h("input"); guess.type = "number"; guess.step = "0.1"; guess.min = "0"; guess.placeholder = "ratio?";
    guess.setAttribute("aria-label", "Predicted ratio when n doubles");
    opts2.appendChild(h("span", "lab", "when n doubles, the count is multiplied by about:"));
    opts2.appendChild(guess);
    host.appendChild(opts2);
    var cv = h("div", "");
    host.appendChild(cv);
    var chart = null, chartCol = null;
    function makeChart() {
      if (chartCol === col) return;
      cv.innerHTML = ""; chartCol = col;
      chart = U.LineChart(cv, { xlabel: "n", ylabel: col === "c" ? "comparisons (millions)" : "seconds (simulated)", height: 280,
        label: col === "c" ? "Comparisons in millions against n for bubble and selection sort" : "Simulated seconds against n for bubble and selection sort" });
      fitChart(chart);
    }
    var tb = wrapTable(host, ["n", "bubble", "×", "selection", "×"]);
    tb.el.classList.add("w13-dbl");
    var sim = h("p", "note-sim", "");
    host.appendChild(sim);
    var m = U.msg(host);

    function compute() {
      if (memo) return memo;
      var R = U.rng(seed * 7 + 1);
      memo = SIZES.map(function (n) {
        var d = randomData(seed * 1000 + n, n), b = bubbleCount(d), s = selectionCount(d);
        return {
          n: n, b: b, s: s,
          tb: (b.c * COST.bubble.c + b.s * COST.bubble.s) * (1 + (R() - 0.5) * 0.04),
          ts: (s.c * COST.selection.c + s.s * COST.selection.s) * (1 + (R() - 0.5) * 0.04)
        };
      });
      return memo;
    }
    function val(r, which) { return col === "c" ? r[which].c : (which === "b" ? r.tb : r.ts); }
    function show(v) { return col === "c" ? fmt(v) : v.toFixed(4) + " s"; }
    function render(fr) {
      var k = fr.k;
      makeChart();
      sim.textContent = col === "t" ? "Simulated timings from a step-count model — run the real code in Colab for your own numbers. Model: the real comparison and swap counts × 110–150 ns each, ±2% seeded noise." :
        "Comparison counts are real: the page's bubble_sort and selection_sort run on this random data in your browser.";
      if (k === 0) {
        chart.draw([{ name: "bubble", color: "--red", points: [[500, 0]] }, { name: "selection", color: "--blue", points: [[500, 0]] }], { upto: 0, xr: [500, 4000] });
        tb.rows(SIZES.map(function (n) { return [fmt(n), "", "", "", ""]; }), -1);
        m.innerHTML = "Guess the ratio first, then press <strong>play</strong>: each step runs both sorts on a list twice as long.";
        return;
      }
      var rows = compute();
      chart.draw([
        { name: "bubble_sort", color: "--red", points: rows.map(function (r) { return [r.n, col === "c" ? r.b.c / 1e6 : r.tb]; }) },
        { name: "selection_sort", color: "--blue", points: rows.map(function (r) { return [r.n, col === "c" ? r.s.c / 1e6 : r.ts]; }), dashed: true }
      ], { upto: k });
      tb.rows(rows.map(function (r, j) {
        if (j >= k) return [fmt(r.n), "", "", "", ""];
        var p = rows[j - 1];
        var rb = p ? (val(r, "b") / val(p, "b")).toFixed(3) + "×" : "—", rs = p ? (val(r, "s") / val(p, "s")).toFixed(3) + "×" : "—";
        return [fmt(r.n), show(val(r, "b")) + "<b class='w13-mr'>" + rb + "</b>", "<b>" + rb + "</b>",
          show(val(r, "s")) + "<b class='w13-mr'>" + rs + "</b>", "<b>" + rs + "</b>"];
      }), k - 1);
      var r = rows[k - 1];
      if (k < SIZES.length) {
        m.innerHTML = "n = " + fmt(r.n) + ": bubble made " + fmt(r.b.c) + " comparisons and " + fmt(r.b.s) + " swaps; selection made " + fmt(r.s.c) +
          " comparisons but only " + fmt(r.s.s) + " swaps." + (k > 1 ? " Look at the ratio column." : "");
      } else {
        var g = parseFloat(guess.value), v = isNaN(g) ? "" : (Math.abs(g - 4) < 0.35 ? " Your guess of " + g + " was right." : " You guessed " + g + ".");
        m.innerHTML = col === "c"
          ? "Selection always makes exactly n(n−1)/2 comparisons, so its ratios are " + rows.slice(1).map(function (x, j) { return (x.s.c / rows[j].s.c).toFixed(3); }).join(", ") +
            " — <strong>approaching four</strong>, never exactly four. " +
            "Bubble's count is a little smaller and changes with the data (its early exit) — press <strong>new random data</strong> to see." + v
          : "Both time columns roughly quadruple: same class. Selection is faster at every n (" + (r.tb / r.ts).toFixed(1) + "× at n = 4 000) because it swaps at most n − 1 times against bubble's ≈ " +
            fmt(Math.round(r.b.s / 1e5) / 10) + " million — a constant-factor difference within O(n²)." + v;
      }
    }
    var player = U.Player(host, {
      build: function () { var f = []; for (var k = 0; k <= SIZES.length; k++) f.push({ k: k }); return f; },
      render: render, fps: function () { return 0.9; }
    });
    player.load();
  }

  /* ============================================================
     Task 3 — best and worst case (bubble, with selection for contrast)
     ============================================================ */
  function cases(host) {
    var NS = 20, NB = 2000, kind = "sorted", alg = "bubble", seed = 5, revealed = {}, memo = {};
    var SMALL = { random: [] };
    U.title(host, "Animation · the same sort on sorted, reversed and random input");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("input", [["sorted", "(a) sorted"], ["reversed", "(b) reversed"], ["random", "(c) random"]], kind, function (v) { kind = v; player.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    opts2.appendChild(U.seg("algorithm", [["bubble", "bubble_sort"], ["selection", "selection_sort"]], alg, function (v) { alg = v; player.load(); paint(); }));
    host.appendChild(opts2);
    host.appendChild(h("div", "lab muted", "<small>n = 20 bars you can watch</small>"));
    var vb = h("div", "vbars w13-vb");
    host.appendChild(vb);
    var bars = [];
    for (var q = 0; q < NS; q++) { var b = h("div", "vb"); vb.appendChild(b); bars.push(b); }
    var stats = h("div", "anim-stats");
    var sC = U.stat("comparisons"), sS = U.stat("swaps"), sP = U.stat("passes / rounds");
    [sC, sS, sP].forEach(function (x) { stats.appendChild(x.el); });
    host.appendChild(stats);
    var m = U.msg(host);
    host.appendChild(h("div", "lab muted w13-sub", "<small>the same input at n = 2 000 — each row unlocks when you have watched that input to the end</small>"));
    var tb = wrapTable(host, ["input", "comparisons", "swaps", "% of n(n−1)/2"]);
    tb.el.classList.add("w13-pct");

    var R0 = U.rng(99);
    (function () { var a = []; for (var i = 1; i <= NS; i++) a.push(i); for (var j = NS - 1; j > 0; j--) { var r = Math.floor(R0() * (j + 1)), t = a[j]; a[j] = a[r]; a[r] = t; } SMALL.random = a; })();
    function small() {
      var a = [];
      for (var i = 1; i <= NS; i++) a.push(kind === "sorted" ? i : kind === "reversed" ? NS + 1 - i : SMALL.random[i - 1]);
      return a;
    }
    function big(k, al) {
      var key = k + al;
      if (!memo[key]) memo[key] = (al === "bubble" ? bubbleCount : selectionCount)(caseData(k, NB, seed));
      return memo[key];
    }
    function build() {
      var a = small(), f = [], n = a.length, c = 0, s = 0, passes = 0;
      function P(x) { var fr = { a: a.slice(), c: c, s: s, p: passes }; for (var k in x) fr[k] = x[k]; f.push(fr); }
      P({ kind: "start", fin: -1 });
      if (alg === "bubble") {
        for (var end = n - 1; end > 0; end--) {
          var sw = false; passes++;
          for (var i = 0; i < end; i++) {
            c++; P({ kind: "cmp", i: i, j: i + 1, fin: end + 1 });
            if (a[i] > a[i + 1]) { var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; s++; sw = true; P({ kind: "swp", i: i, j: i + 1, fin: end + 1 }); }
          }
          P({ kind: sw ? "pass" : "exit", fin: sw ? end : 0 });
          if (!sw) break;
        }
      } else {
        for (var st = 0; st < n; st++) {
          var sm = st; passes++;
          for (var x = st + 1; x < n; x++) {
            c++;
            if (a[x] < a[sm]) sm = x;
            P({ kind: "scan", i: x, j: sm, lo: st });
          }
          if (sm !== st) { var u = a[st]; a[st] = a[sm]; a[sm] = u; s++; P({ kind: "swp", i: st, j: sm, lo: st + 1 }); }
        }
      }
      P({ kind: "done", fin: 0, lo: n });
      return f;
    }
    function render(fr, i, frames) {
      fr.a.forEach(function (v, j) {
        var cls = "vb";
        if (fr.kind === "done") cls += " good";
        else if (alg === "bubble") {
          if (j >= fr.fin && fr.fin >= 0 && fr.kind !== "exit") cls += " good";
          if (fr.kind === "exit") cls += " good";
          if ((fr.kind === "cmp" || fr.kind === "swp") && (j === fr.i || j === fr.j)) cls = "vb " + (fr.kind === "swp" ? "gold" : "on");
        } else {
          if (j < fr.lo) cls += " good";
          if (j === fr.i && fr.kind === "scan") cls = "vb on";
          if (j === fr.j) cls = "vb gold";
          if (fr.kind === "swp" && j === fr.i) cls = "vb gold";
        }
        bars[j].className = cls;
        bars[j].style.height = (v / NS * 100) + "%";
      });
      sC.set(fr.c); sS.set(fr.s); sP.set(fr.p);
      var full = NS * (NS - 1) / 2;
      if (fr.kind === "start") m.innerHTML = "Predict: how many of the " + full + " possible comparisons will " + alg + "_sort need on this " + kind + " input? Press <strong>play</strong>.";
      else if (fr.kind === "done") {
        revealed[kind + alg] = true; paint();
        m.innerHTML = alg === "bubble"
          ? (kind === "sorted" ? "<strong>" + fr.c + " comparisons, 0 swaps</strong>: one clean pass and the early exit fires — O(n)."
            : kind === "reversed" ? "<strong>" + fr.c + " comparisons and " + fr.s + " swaps</strong>: every pair was out of order, so every comparison was also a swap — the worst case."
              : "<strong>" + fr.c + " of " + full + "</strong> comparisons: a random list still needs nearly every pass, so it lands close to the worst case.")
          : "<strong>" + fr.c + " comparisons</strong> — selection sort always scans the whole remaining list, whatever the input. Only its swap count (" + fr.s + ") changes.";
      } else if (fr.kind === "exit") m.innerHTML = "Pass " + fr.p + " made no swaps: <code>break</code>. The remaining passes are skipped.";
      else if (fr.kind === "pass") m.innerHTML = "Pass " + fr.p + " done: the largest remaining bar has bubbled to the right end (green = in place).";
      else if (alg === "bubble") m.innerHTML = "Pass " + fr.p + ": compare neighbours " + fr.i + " and " + fr.j + (fr.kind === "swp" ? " — out of order, swap." : ".");
      else m.innerHTML = "Round " + fr.p + ": scanning for the smallest remaining bar (gold = smallest so far).";
    }
    function paint() {
      var full = NB * (NB - 1) / 2;
      tb.rows(["sorted", "reversed", "random"].map(function (k, j) {
        var lab = "(" + "abc"[j] + ") " + k;
        if (!revealed[k + alg]) return [lab, "?", "?", "?"];
        var r = big(k, alg);
        return [lab, fmt(r.c), fmt(r.s), (r.c / full * 100).toFixed(1) + "%"];
      }), ["sorted", "reversed", "random"].indexOf(kind));
    }
    var player = U.Player(host, {
      build: build, render: render,
      fps: function (i, fr) { return Math.min(40, Math.max(3, fr.length / 12)); }
    });
    paint();
    player.load();
  }

  /* ============================================================
     Task 4 — the honest comparison plot (log–log)
     ============================================================ */
  function loglog(host) {
    var SIZES = [1000, 2000, 4000, 8000], budget = 60, memo = null;
    var ALGS = [
      { id: "bubble", name: "bubble_sort", color: "--red" },
      { id: "selection", name: "selection_sort", color: "--muted" },
      { id: "insertion", name: "insertion_sort", color: "--blue" },
      { id: "sorted", name: "sorted()", color: "--green" }
    ];
    var on = { bubble: true, selection: true, insertion: true, sorted: true };
    U.title(host, "Animation · four sorts on one log–log figure");
    var opts = h("div", "anim-opts");
    opts.appendChild(h("span", "lab", "your slope guesses:"));
    function pick(lab) {
      var s = h("select"); s.setAttribute("aria-label", "Your slope guess for " + lab);
      [["", lab + " ?"], ["1", lab + " ≈ 1"], ["1.1", lab + " ≈ 1.1"], ["2", lab + " ≈ 2"], ["3", lab + " ≈ 3"]].forEach(function (o) {
        var op = h("option", "", o[1]); op.value = o[0]; s.appendChild(op);
      });
      opts.appendChild(s); return s;
    }
    var gB = pick("bubble"), gP = pick("sorted()");
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    opts2.appendChild(h("span", "lab", "show"));
    ALGS.forEach(function (a) {
      var b = U.btn(a.name, "w13-tog", function () { on[a.id] = !on[a.id]; b.setAttribute("aria-pressed", String(on[a.id])); player.load(); });
      b.setAttribute("aria-pressed", "true");
      b.style.setProperty("--w13c", "var(" + a.color + ")");
      opts2.appendChild(b);
    });
    host.appendChild(opts2);
    var cv = h("div", "");
    host.appendChild(cv);
    var chart = U.LineChart(cv, { logx: true, logy: true, xlabel: "n", ylabel: "seconds", height: 320, label: "Log-log plot of time against n for four sorts" });
    fitChart(chart);
    host.appendChild(h("p", "note-sim", "Simulated timings from a step-count model — run the real code in Colab for your own numbers. " +
      "Model: real comparison and move counts of the page's three sorts on random data × 90–150 ns each; sorted() = 23 ns × n·log₂n (matched to §13.6); ±5% seeded noise."));
    var opts3 = h("div", "anim-opts");
    opts3.appendChild(U.seg("largest n you would hand it, with a time budget of", [[1, "1 s"], [60, "1 min"], [3600, "1 hour"]], budget, function (v) { budget = v; player.load(); }));
    host.appendChild(opts3);
    var tb = wrapTable(host, ["algorithm", "slope", "in words", "largest n"]);
    tb.el.classList.add("w13-words");
    var m = U.msg(host);

    function compute() {
      if (memo) return memo;
      var R = U.rng(4242);
      memo = {};
      ALGS.forEach(function (a) { memo[a.id] = []; });
      SIZES.forEach(function (n) {
        var d = randomData(8000 + n, n);
        var b = bubbleCount(d), s = selectionCount(d), ins = insertionCount(d);
        function nz() { return 1 + (R() - 0.5) * 0.1; }
        memo.bubble.push([n, (b.c * COST.bubble.c + b.s * COST.bubble.s) * nz()]);
        memo.selection.push([n, (s.c * COST.selection.c + s.s * COST.selection.s) * nz()]);
        memo.insertion.push([n, (ins.c * COST.insertion.c + ins.s * COST.insertion.s) * nz()]);
        memo.sorted.push([n, n * Math.log(n) / Math.LN2 * COST.sortedUnit * nz()]);
      });
      return memo;
    }
    function slope(pts) {           /* least-squares slope of log t against log n */
      var xs = pts.map(function (p) { return Math.log(p[0]); }), ys = pts.map(function (p) { return Math.log(p[1]); });
      var mx = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length, my = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length, nu = 0, de = 0;
      xs.forEach(function (x, i) { nu += (x - mx) * (ys[i] - my); de += (x - mx) * (x - mx); });
      return nu / de;
    }
    function largest(pts, sl, id) {
      var last = pts[pts.length - 1], n;
      if (id === "sorted") {
        // n log n is not a fixed power law; invert the stated model.
        var lo = 1, hi = 2;
        function seconds(x) { return COST.sortedUnit * x * Math.log2(x); }
        while (seconds(hi) <= budget) hi *= 2;
        for (var j = 0; j < 60; j++) { var mid = (lo + hi) / 2; if (seconds(mid) <= budget) lo = mid; else hi = mid; }
        n = lo;
      } else n = last[0] * Math.pow(budget / last[1], 1 / sl);
      if (n > 1e9) return "&gt; 1 billion (memory not modelled)";
      var p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
      return "≈ " + fmt(Math.round(n / p) * p);
    }
    function words(sl) {
      return sl > 1.6 ? "quadratic: double n, about 4× the time" : "just above 1: n log n, double n → a bit over 2×";
    }
    function render(fr) {
      var k = fr.k;
      if (k === 0) {
        chart.draw(ALGS.filter(function (a) { return on[a.id]; }).map(function (a) { return { name: a.name, color: a.color, points: [[1000, 1e-4]] }; }),
          { upto: 0, xr: [1000, 8000], yr: [1e-4, 10] });
        tb.rows(ALGS.map(function (a) { return [a.name, "?", "", ""]; }), -1);
        m.innerHTML = "Guess the slopes first, then press <strong>play</strong> to add one size at a time. On log–log axes a power law n<sup>k</sup> is a straight line with slope k.";
        return;
      }
      var d = compute();
      chart.draw(ALGS.filter(function (a) { return on[a.id]; }).map(function (a) { return { name: a.name, color: a.color, points: d[a.id] }; }),
        { upto: k, xr: [1000, 8000], yr: [1e-4, 10] });
      if (k < SIZES.length) {
        tb.rows(ALGS.map(function (a) { return [a.name, "?", "", ""]; }), -1);
        m.innerHTML = "n = " + fmt(SIZES[k - 1]) + ": bubble " + d.bubble[k - 1][1].toFixed(3) + " s, selection " + d.selection[k - 1][1].toFixed(3) +
          " s, insertion " + d.insertion[k - 1][1].toFixed(3) + " s, sorted() " + d.sorted[k - 1][1].toFixed(5) + " s.";
        return;
      }
      var sls = {};
      tb.rows(ALGS.map(function (a) {
        var sl = slope(d[a.id]); sls[a.id] = sl;
        return ["<span class='w13-dot' style='background:var(" + a.color + ")'></span>" + a.name, "<b>" + sl.toFixed(2) + "</b>", words(sl), largest(d[a.id], sl, a.id)];
      }), -1);
      var v = "";
      function chk(sel, val, name) {
        if (!sel.value) return "";
        var g = parseFloat(sel.value);
        return " " + name + ": you said ≈ " + g + (Math.abs(g - val) < 0.15 ? " ✓." : ", measured " + val.toFixed(2) + ".");
      }
      v = chk(gB, sls.bubble, "bubble") + chk(gP, sls.sorted, "sorted()");
      m.innerHTML = "Three parallel lines with slope ≈ 2 (same class, different constants — insertion does less work on average on these random inputs, with the chosen per-operation costs) and one shallow line with slope just above 1. " +
        "The gap between them widens with every doubling." + v + " Budget estimates are model extrapolations, not practical guarantees: sorted() uses 23 ns × n·log₂n; the other estimates extend the fitted power laws. Memory and hardware limits are not modelled.";
    }
    var player = U.Player(host, {
      build: function () { var f = []; for (var k = 0; k <= SIZES.length; k++) f.push({ k: k }); return f; },
      render: render, fps: function () { return 0.9; }
    });
    player.load();
  }

  /* ============================================================
     Task 5 — insertion sort loves order
     ============================================================ */
  var INS_CODE = [
    "def insertion_sort(data):",
    "    items = data[:]",
    "    comparisons = shifts = 0",
    "",
    "    for i in range(1, len(items)):",
    "        current = items[i]               # the card in your hand",
    "        j = i - 1",
    "        while j >= 0:",
    "            comparisons += 1",
    "            if items[j] > current:       # make room by shifting right",
    "                items[j + 1] = items[j]",
    "                shifts += 1",
    "                j -= 1",
    "            else:",
    "                break",
    "        items[j + 1] = current           # drop it into the gap",
    "",
    "    return items, comparisons, shifts",
    ""
  ].join("\n");
  function insertion(host) {
    var LISTS = { sorted: [1, 2, 3, 4, 5, 6, 7, 8], reversed: [8, 7, 6, 5, 4, 3, 2, 1], random: [5, 1, 4, 2, 8, 7, 3, 6] };
    var kind = "sorted", revealed = {}, big = {}, NB = 2000;
    U.title(host, "Animation · insertion_sort on sorted, reversed and random cards");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("input", [["sorted", "(a) sorted"], ["reversed", "(b) reversed"], ["random", "(c) random"]], kind, function (v) { kind = v; ct.load(); }));
    host.appendChild(opts);
    var ct = U.CodeTrace(host, {
      code: function () { return INS_CODE + "print(insertion_sort(" + pyList(LISTS[kind]) + "))"; },
      build: build, onFrame: onFrame,
      fps: function (i, fr) { return Math.max(1.6, fr.length / 22); }
    });
    var ex = ct.extra;
    var hand = h("div", "w13-hand"), slots = h("div", "w13-slots");
    ex.appendChild(hand); ex.appendChild(slots);
    var handCard = h("div", "w13-card lift", "");
    hand.appendChild(handCard);
    var slotEls = [];
    for (var q = 0; q < 8; q++) { var se = h("div", "w13-card", ""); slots.appendChild(se); slotEls.push(se); }
    var per = h("div", "w13-per", "");
    ex.appendChild(per);
    ex.appendChild(h("div", "lab muted w13-sub", "<small>the same three inputs at n = 2 000 — comparisons used by each item (average per 40 items); a row unlocks when you have watched that input</small>"));
    var cv = h("div", "");
    ex.appendChild(cv);
    var chart = U.LineChart(cv, { xlabel: "position i of the item being inserted", ylabel: "comparisons", height: 260, label: "Comparisons per inserted item for sorted, reversed and random input" });
    fitChart(chart);
    var tb = wrapTable(ex, ["input", "comparisons", "shifts", "% of worst"]);
    tb.el.classList.add("w13-pct");

    function build() {
      var src = LISTS[kind], a = src.slice(), f = [], c = null, s = null, i = null, j = null, cur = null, gap = -1, perItem = [];
      function V() {
        var v = { data: src, items: a.slice() };
        if (c !== null) { v.comparisons = c; v.shifts = s; }
        if (i !== null) { v.i = i; v.current = cur; v.j = j; }
        return v;
      }
      function P(line, note, x) {
        var fr = { line: line, vars: V(), note: note, a: a.slice(), gap: gap, cur: cur, i: i, j: j, per: perItem.slice(), counters: { comparisons: c || 0, shifts: s || 0 } };
        for (var k in x) fr[k] = x[k];
        f.push(fr);
      }
      P(20, "Predict: how many comparisons will this " + kind + " input need? Then press <strong>play</strong>.", { kind: "start" });
      c = 0; s = 0;
      P(3, "Work on a copy; both counters start at 0.", { hl: [2], kind: "init" });
      for (i = 1; i < a.length; i++) {
        cur = a[i]; j = i - 1; gap = i;
        var c0 = c;
        P(7, "Pick up items[" + i + "] = <strong>" + cur + "</strong>. Everything to its left is already sorted.", { hl: [5, 6], kind: "lift" });
        while (true) {
          if (!(j >= 0)) { P(8, "j = −1: nothing left to compare, so the while loop ends — " + cur + " goes to the very front.", { kind: "front" }); break; }
          c++;
          if (a[j] > cur) {
            P(10, "Compare items[" + j + "] = " + a[j] + " with " + cur + ": " + a[j] + " &gt; " + cur + ", so it must move right.", { hl: [8, 9], kind: "cmp", look: j });
            a[j + 1] = a[j]; s++; j--; gap = j + 1;
            P(13, "Shift " + a[j + 1] + " one place right. shifts = " + s + ", j = " + j + ".", { hl: [11, 12], kind: "shift" });
          } else {
            P(15, "Compare items[" + j + "] = " + a[j] + " with " + cur + ": " + a[j] + " ≤ " + cur + " — the gap is in the right place. <strong>break</strong>.", { hl: [8, 9, 10, 14], kind: "stop", look: j });
            break;
          }
        }
        a[j + 1] = cur; gap = -1;
        perItem.push(c - c0);
        P(16, "Drop " + cur + " into index " + (j + 1) + ". This item used <strong>" + (c - c0) + "</strong> comparison" + (c - c0 === 1 ? "" : "s") + ".", { kind: "drop", placed: j + 1 });
      }
      i = null; cur = null;
      P(18, "Return the sorted copy and both counters.", { kind: "ret" });
      var res = "(" + pyList(a) + ", " + c + ", " + s + ")";
      var words = kind === "sorted" ? "Every item stopped after <strong>one</strong> comparison: n − 1 = 7 in total. That is the best case, O(n)."
        : kind === "reversed" ? "Every item travelled all the way to the front: 1 + 2 + … + 7 = <strong>28</strong> comparisons and 28 shifts. That is the worst case, O(n²)."
          : "Some items moved far, some not at all: <strong>" + c + "</strong> comparisons, between the best (7) and the worst (28).";
      f.push({ line: 20, vars: V(), a: a.slice(), gap: -1, cur: null, per: perItem.slice(), counters: { comparisons: c, shifts: s }, out: [res], kind: "done", note: "Printed " + res + ". " + words });
      return f;
    }
    function onFrame(fr) {
      var n = fr.a.length;
      fr.a.forEach(function (v, k) {
        var el = slotEls[k], isGap = k === fr.gap;
        el.textContent = isGap ? "" : v;
        var cls = "w13-card";
        if (isGap) cls += " gap";
        else if (fr.kind === "done" || fr.kind === "ret") cls += " fin";
        else if (fr.i != null && k < fr.i + 1 && k !== fr.look) cls += " sorted";
        if (k === fr.look) cls += fr.kind === "cmp" ? " bad" : " good";
        if (fr.kind === "drop" && k === fr.placed) cls += " gold";
        el.className = cls;
      });
      if (fr.cur != null && fr.gap >= 0) {
        handCard.style.visibility = "visible";
        handCard.textContent = fr.cur;
        handCard.style.left = (fr.gap / n * 100) + "%";
      } else handCard.style.visibility = "hidden";
      per.innerHTML = fr.per.length ? "comparisons per inserted item: " + fr.per.map(function (x) { return "<b>" + x + "</b>"; }).join(" + ") + " = " + fr.per.reduce(function (p, q) { return p + q; }, 0) : "";
      if (fr.kind === "done") { revealed[kind] = true; paint(); }
    }
    function bigRun(k) {
      if (!big[k]) { var pi = []; var r = insertionCount(caseData(k, NB, 77), pi); r.per = pi; big[k] = r; }
      return big[k];
    }
    function bucket(arr) {
      var pts = [];
      for (var b = 0; b < arr.length; b += 40) {
        var sl = arr.slice(b, b + 40), avg = sl.reduce(function (p, q) { return p + q; }, 0) / sl.length;
        pts.push([b + 1 + sl.length / 2, avg]);
      }
      return pts;
    }
    var COL = { sorted: "--green", reversed: "--red", random: "--blue" };
    function paint() {
      var worst = NB * (NB - 1) / 2;
      var series = ["sorted", "reversed", "random"].filter(function (k) { return revealed[k]; }).map(function (k) {
        return { name: k, color: COL[k], points: bucket(bigRun(k).per), noDots: true };
      });
      if (series.length) chart.draw(series, { xr: [0, NB], yr: [0, NB] });
      else chart.draw([{ name: "", color: "--muted", points: [[0, 0]], noDots: true }], { xr: [0, NB], yr: [0, NB] });
      tb.rows(["sorted", "reversed", "random"].map(function (k, j) {
        var lab = "(" + "abc"[j] + ") " + k;
        if (!revealed[k]) return [lab, "?", "?", "?"];
        var r = bigRun(k);
        return [lab, fmt(r.c), fmt(r.s), (r.c / worst * 100).toFixed(1) + "%"];
      }), -1);
    }
    paint();
    ct.load();
  }

  /* ============================================================
     Task 6 — stability you can see
     ============================================================ */
  function stability(host) {
    var INPUT = [["Deniz", 72], ["Ada", 88], ["Emre", 72], ["Bilal", 88], ["Cem", 91], ["Can", 72]];
    var people = INPUT.slice(), mode = "one", pred = null;
    var GC = { 72: "--blue", 88: "--accent", 91: "--green" };
    U.title(host, "Animation · sorting (name, grade) pairs by grade");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("sort", [["one", "key=lambda p: p[1]"], ["two", "key=(grade, name)"], ["sel", "an unstable sort"]], mode, function (v) { mode = v; ct.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var predBox = h("span", "");
    opts2.appendChild(predBox);
    opts2.appendChild(U.btn("shuffle the input", "", function () { people = U.shuffle(INPUT.slice()); pred = null; ct.load(); }));
    host.appendChild(opts2);

    function qs(n) { return "('" + n[0] + "', " + n[1] + ")"; }
    function listCode(a) {
      return "people = [" + a.slice(0, 3).map(function (p) { return '("' + p[0] + '", ' + p[1] + ")"; }).join(", ") + ",\n          " +
        a.slice(3).map(function (p) { return '("' + p[0] + '", ' + p[1] + ")"; }).join(", ") + "]\n\n";
    }
    function code() {
      if (mode === "one") return listCode(people) + "print(sorted(people, key=lambda p: p[1]))";
      if (mode === "two") return listCode(people) + "print(sorted(people, key=lambda p: (p[1], p[0])))";
      return "def selection_sort_by_grade(data):     # §13.3, comparing grades\n" +
        "    items = data[:]\n" +
        "    for start in range(len(items)):\n" +
        "        smallest = start\n" +
        "        for i in range(start + 1, len(items)):\n" +
        "            if items[i][1] < items[smallest][1]:\n" +
        "                smallest = i\n" +
        "        if smallest != start:\n" +
        "            items[start], items[smallest] = items[smallest], items[start]\n" +
        "    return items\n\n" + listCode(people) + "print(selection_sort_by_grade(people))";
    }
    function firstOfGroup() {   /* the grade that has ties and appears first */
      var cnt = {};
      people.forEach(function (p) { cnt[p[1]] = (cnt[p[1]] || 0) + 1; });
      return people.filter(function (p) { return cnt[p[1]] > 1; })[0][1];
    }
    function drawPred() {
      predBox.innerHTML = "";
      var g = firstOfGroup();
      var names = people.filter(function (p) { return p[1] === g; }).map(function (p) { return p[0]; });
      predBox.appendChild(U.seg("predict: first " + g + " in the output", names.map(function (n) { return [n, n]; }), pred, function (v) { pred = v; }));
    }

    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: function () { return 1; }, varsTitle: "keys" });
    var ex = ct.extra;
    var col = h("div", "w13-people");
    ex.appendChild(col);
    var cards = {};
    var verdict = h("div", "w13-verdict");
    ex.appendChild(verdict);

    function build() {
      drawPred();
      col.innerHTML = ""; cards = {};
      people.forEach(function (p, k) {
        var c = h("div", "w13-pc", "<span class='w13-badge'>#" + (k + 1) + "</span><span class='nm'>" + p[0] + "</span><span class='gr'>" + p[1] + "</span><span class='ky'></span>");
        c.style.setProperty("--w13c", "var(" + GC[p[1]] + ")");
        col.appendChild(c); cards[p[0]] = c;
      });
      col.style.height = (people.length * 42) + "px";
      var f = [], line = mode === "sel" ? 15 : 4;
      var inOrder = people.map(function (p) { return p[0]; });
      f.push({ line: line, order: inOrder, vars: {}, note: "The badges show each person's <strong>input position</strong>. Make your prediction, then press <strong>play</strong>.", kind: "start" });
      if (mode !== "sel") {
        var kv = {};
        if (mode === "one") people.forEach(function (p) { kv[p[0]] = p[1]; });
        f.push({ line: line, order: inOrder, vars: kv, showKey: true, kind: "keys",
          note: "sorted() first computes the key of every item: " + (mode === "one" ? "just the grade. Several people share a grade — ties." : "a (grade, name) tuple, shown on each card. Now no two keys are equal.") });
        var out = people.map(function (p, k) { return { p: p, k: k }; }).sort(function (a, b) {
          if (a.p[1] !== b.p[1]) return a.p[1] - b.p[1];
          if (mode === "two" && a.p[0] !== b.p[0]) return a.p[0] < b.p[0] ? -1 : 1;
          return a.k - b.k;                        /* Timsort is stable */
        }).map(function (o) { return o.p; });
        f.push({ line: line, order: out.map(function (p) { return p[0]; }), vars: kv, showKey: true, kind: "moved",
          note: "Items move into key order. Watch the badges inside each colour group.", out: ["[" + out.map(qs).join(", ") + "]"] });
        f.push({ line: line, order: out.map(function (p) { return p[0]; }), vars: kv, showKey: true, kind: "check", out: ["[" + out.map(qs).join(", ") + "]"] });
      } else {
        var a = people.slice();
        for (var st = 0; st < a.length; st++) {
          var sm = st;
          for (var i = st + 1; i < a.length; i++) if (a[i][1] < a[sm][1]) sm = i;
          if (sm !== st) {
            f.push({ line: 9, hl: [8], order: a.map(function (p) { return p[0]; }), vars: { start: st, smallest: sm }, swap: [a[st][0], a[sm][0]], kind: "pre",
              note: "start = " + st + ": the smallest grade from here on is " + a[sm][0] + " (" + a[sm][1] + ") at index " + sm + ". Swap it with " + a[st][0] + " at index " + st + "." });
            var t = a[st]; a[st] = a[sm]; a[sm] = t;
            f.push({ line: 9, order: a.map(function (p) { return p[0]; }), vars: { start: st, smallest: sm }, swap: [a[st][0], a[sm][0]], kind: "swap",
              note: "Swapped. A long-distance swap can jump one person over someone with the same grade." });
          }
        }
        f.push({ line: 15, order: a.map(function (p) { return p[0]; }), vars: {}, kind: "check", out: ["[" + a.map(qs).join(", ") + "]"] });
      }
      return f;
    }
    function onFrame(fr) {
      var pos = {};
      fr.order.forEach(function (n, k) { pos[n] = k; });
      var inIdx = {};
      people.forEach(function (p, k) { inIdx[p[0]] = k; });
      people.forEach(function (p) {
        var c = cards[p[0]];
        c.style.top = (pos[p[0]] * 42) + "px";
        c.querySelector(".ky").textContent = fr.showKey ? "key " + (mode === "two" ? "(" + p[1] + ", '" + p[0] + "')" : p[1]) : "";
        c.className = "w13-pc" + (fr.swap && fr.swap.indexOf(p[0]) >= 0 ? " sw" : "");
      });
      if (fr.kind !== "check") { verdict.innerHTML = ""; return; }
      /* tie groups: does input order survive? */
      var groups = {}, lines = [], allKept = true;
      fr.order.forEach(function (n) { var g = people[inIdx[n]][1]; (groups[g] = groups[g] || []).push(n); });
      Object.keys(groups).forEach(function (g) {
        var ns = groups[g];
        if (ns.length < 2) return;
        var idx = ns.map(function (n) { return inIdx[n] + 1; });
        var kept = idx.every(function (x, k) { return !k || x > idx[k - 1]; });
        if (!kept) allKept = false;
        var byName = mode === "two";
        lines.push("<div class='" + (byName ? "nm" : kept ? "ok" : "no") + "'><b>" + g + "</b>: " + ns.map(function (n, k) { return n + " #" + idx[k]; }).join(" → ") +
          (byName ? " — ordered by name" : kept ? " — input order kept" : " — input order <strong>changed</strong>") + "</div>");
      });
      verdict.innerHTML = lines.join("");
      var first = groups[firstOfGroup()][0];
      var pv = pred ? (pred === first ? " Your prediction (" + pred + ") was right." : " You predicted " + pred + "; it was " + first + ".") : "";
      ct.msg.innerHTML = (mode === "one"
        ? "Stable: with the key equal, people keep their input order — that is the guarantee <code>sorted</code> gives."
        : mode === "two"
          ? "Ties are now broken by name, alphabetically: the second element of the tuple is consulted whenever the grades are equal. Same sort, richer key."
          : (allKept ? "This time the swaps happened to keep every tie in order — press <strong>shuffle the input</strong> and run it again."
            : "Unstable: the long-distance swaps jumped equal-grade people past each other. Nothing is wrong with the grades — but the order of ties is now unpredictable.")) + pv;
    }
    ct.load();
  }

  function reg(name, fn) { AAAnim.register(name, function (host) { host.classList.add("w13"); fn(host); }); }
  reg("w13-bubble-paper", bubblePaper);
  reg("w13-doubling", doubling);
  reg("w13-cases", cases);
  reg("w13-loglog", loglog);
  reg("w13-insertion", insertion);
  reg("w13-stability", stability);
})();
