/* ============================================================
   AA — week 12 "Try it yourself" animations (searching)
   w12-halvings, w12-unsorted, w12-crossover, w12-range,
   w12-paper-trace, w12-six-tests
   Needs anim.js (AAAnim.ui) loaded first.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, fmt = U.fmt, esc = U.esc;

  /* the exact binary_search from §12.3 */
  var BS_CODE = [
    "def binary_search(data, target):",
    "    low = 0",
    "    high = len(data) - 1",
    "    steps = 0",
    "",
    "    while low <= high:",
    "        steps += 1",
    "        middle = (low + high) // 2",
    "",
    "        if data[middle] == target:",
    "            return middle, steps",
    "        elif target < data[middle]:",
    "            high = middle - 1          # drop the right half",
    "        else:",
    "            low = middle + 1           # drop the left half",
    "",
    "    return -1, steps"
  ].join("\n");

  function num(v) { return Math.abs(v) >= 10000 ? fmt(v) : String(v); }
  function neg(v) { return v < 0 ? "−" + Math.abs(v) : String(v); }
  function pyTuple(a) { return "(" + a[0] + ", " + a[1] + ")"; }

  /* Faithful trace of binary_search.
     data: array or function(i) -> data[i];  n = len(data)
     o.base: vars shown before target;  o.callLine: line of the print() call
     o.present: index where target really sits (or -1), to flag discarded halves */
  function bsFrames(data, n, target, o) {
    o = o || {};
    var get = typeof data === "function" ? data : function (i) { return data[i]; };
    var f = [], low = null, high = null, steps = null, middle = null, rows = [];
    function vars() {
      var v = {}, k;
      if (o.base) for (k in o.base) v[k] = o.base[k];
      v.target = target;
      if (low !== null) { v.low = low; v.high = high; v.steps = steps; }
      if (middle !== null) { v.middle = middle; v["data[middle]"] = get(middle); }
      return v;
    }
    function push(line, note, extra) {
      var fr = { line: line, vars: vars(), note: note, low: low, high: high, mid: middle, steps: steps, rows: rows.slice() };
      for (var k in extra) fr[k] = extra[k];
      f.push(fr);
      return fr;
    }
    var P = o.present == null ? -1 : o.present;
    function lost(a, b) {   /* was the real position inside the part we just threw away? */
      return P >= a && P <= b ? " <strong>But " + target + " sits at index " + P + " — it has just been thrown away.</strong>" : "";
    }
    push(o.callLine || 0, o.startNote || "Press <strong>play</strong>.", { phase: "start", hl: [] });
    low = 0; high = n - 1; steps = 0;
    push(4, "The window starts as the whole list: <strong>low = 0</strong>, <strong>high = " + num(n - 1) + "</strong>" +
      (n === 0 ? " (the list is empty)." : " — " + num(n) + " candidates."), { phase: "init", hl: [2, 3] });
    while (low <= high) {
      push(6, "low ≤ high (" + num(low) + " ≤ " + num(high) + "): " + num(high - low + 1) +
        (high === low ? " candidate is" : " candidates are") + " still possible, so go round again.", { phase: "check" });
      steps++;
      middle = Math.floor((low + high) / 2);
      push(8, "Step " + steps + ": middle = (" + num(low) + " + " + num(high) + ") // 2 = <strong>" + num(middle) + "</strong>.", { phase: "mid", hl: [7] });
      var dm = get(middle), lo0 = low, hi0 = high;
      if (dm === target) {
        rows.push([steps, lo0, hi0, middle, dm, "match → return (" + middle + ", " + steps + ")"]);
        push(11, "data[" + num(middle) + "] is " + num(dm) + " — a match. Return <strong>(" + num(middle) + ", " + steps + ")</strong>.",
          { phase: "found", hl: [10], result: [middle, steps] });
        return f;
      } else if (target < dm) {
        high = middle - 1;
        rows.push([steps, lo0, hi0, middle, dm, neg(target) + " < " + dm + " → high = " + neg(high)]);
        push(13, neg(target) + " &lt; " + num(dm) + ", so it can only be on the left: drop the right half, <strong>high = " + neg(high) + "</strong>." +
          lost(middle, hi0), { phase: "left", hl: [10, 12] });
      } else {
        low = middle + 1;
        rows.push([steps, lo0, hi0, middle, dm, neg(target) + " > " + dm + " → low = " + low]);
        push(15, neg(target) + " &gt; " + num(dm) + ", so it can only be on the right: drop the left half, <strong>low = " + num(low) + "</strong>." +
          lost(lo0, middle), { phase: "right", hl: [10, 12, 14] });
      }
    }
    rows.push([rows.length + 1, low, high, "—", "—", "low > high → return (−1, " + steps + ")"]);
    push(6, "low = " + num(low) + " &gt; high = " + neg(high) + ": the window has closed to nothing, so the loop ends.", { phase: "cross" });
    push(17, "Return <strong>(−1, " + steps + ")</strong>: “not here”.", { phase: "miss", result: [-1, steps] });
    return f;
  }
  function bsResult(get, n, target) {       /* fast, no frames */
    var low = 0, high = n - 1, steps = 0;
    while (low <= high) {
      steps++;
      var m = Math.floor((low + high) / 2), v = get(m);
      if (v === target) return [m, steps];
      if (target < v) high = m - 1; else low = m + 1;
    }
    return [-1, steps];
  }
  function ident(i) { return i; }
  /* LineChart draws at 720 px; on phones use a narrower canvas so its labels stay readable */
  function fitChart(c) { if (window.innerWidth < 600) { c.el.width = 460; } }
  function wrapTable(parent, heads) {
    var w = h("div", "anim-table-wrap");
    parent.appendChild(w);
    return U.table(w, heads);
  }

  /* ============================================================
     Task 1 — count the halvings
     ============================================================ */
  function halvings(host) {
    var SIZES = [1000, 10000, 100000, 1000000, 10000000];
    var LAB = { 1000: "1 000", 10000: "10 000", 100000: "100 000", 1000000: "1 000 000", 10000000: "10 000 000" };
    var N = 1000, kind = "past", res = { past: {}, before: {} };
    U.title(host, "Animation · binary_search on list(range(n)), target missing");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("n =", [[1000, "1k"], [10000, "10k"], [100000, "100k"], [1000000, "1M"], [10000000, "10M"]], N,
      function (v) { N = v; ct.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    opts2.appendChild(U.seg("target", [["past", "n · above all"], ["before", "−5 · below all"]], kind,
      function (v) { kind = v; ct.load(); }));
    host.appendChild(opts2);
    var opts3 = h("div", "anim-opts");
    var guess = h("input"); guess.type = "number"; guess.min = "0"; guess.placeholder = "steps?";
    guess.setAttribute("aria-label", "Predicted number of steps");
    opts3.appendChild(h("span", "lab", "your prediction:"));
    opts3.appendChild(guess);
    opts3.appendChild(U.btn("fill the rest of the table", "", fillAll, "Run every size instantly, without animation"));
    host.appendChild(opts3);

    function T() { return kind === "past" ? N : -5; }
    var ct = U.CodeTrace(host, {
      code: function () { return BS_CODE + "\n\ndata = list(range(" + N + "))\nprint(binary_search(data, " + T() + "))"; },
      build: build, onFrame: onFrame,
      fps: function (i, fr) { return Math.max(2.5, fr.length / 15); }
    });

    /* window-to-scale bar + results table */
    var ex = ct.extra;
    ex.appendChild(h("div", "lab muted", "<small>the window [low, high], drawn to scale inside the whole list</small>"));
    var bar = h("div", "w12-win"), win = h("div", "w12-win-in"), mid = h("div", "w12-win-mid");
    bar.appendChild(win); bar.appendChild(mid); ex.appendChild(bar);
    var scale = h("div", "w12-scale", "<span>0</span><span></span>");
    ex.appendChild(scale);
    var tb = wrapTable(ex, ["n", "steps, target n", "steps, target −5", "change"]);
    var pat = h("p", "w12-pat", "");
    ex.appendChild(pat);

    function build() {
      var t = T();
      var f = bsFrames(ident, N, t, {
        base: { "len(data)": N }, callLine: 20,
        startNote: "Predict first: how many steps for n = " + LAB[N] + " with target " + neg(t) + "? Type it above, then press <strong>play</strong>."
      });
      var last = f[f.length - 1];
      f.push({ line: 20, vars: last.vars, out: [pyTuple(last.result)], phase: "done", result: last.result, low: last.low, high: last.high, mid: last.mid, steps: last.steps,
        note: "" });
      f.forEach(function (fr) {
        fr.counters = { "steps": fr.steps || 0, "candidates left": fr.low === null ? fmt(N) : fmt(Math.max(0, fr.high - fr.low + 1)) };
      });
      return f;
    }
    function onFrame(fr) {
      scale.lastChild.textContent = fmt(N - 1);
      if (fr.low === null) { win.style.left = "0%"; win.style.width = "100%"; mid.style.display = "none"; }
      else {
        var lo = Math.max(0, fr.low), hi = Math.min(N - 1, fr.high), w = hi >= lo ? (hi - lo + 1) / N * 100 : 0;
        win.style.left = Math.min(100, lo / N * 100) + "%";
        win.style.width = (hi >= lo ? Math.max(0.6, w) : 0) + "%";
        mid.style.display = fr.mid === null || fr.phase === "cross" || fr.phase === "miss" || fr.phase === "done" ? "none" : "block";
        if (fr.mid !== null) mid.style.left = ((fr.mid + 0.5) / N * 100) + "%";
      }
      if (fr.phase === "done") {
        res[kind][N] = fr.result[1];
        var p = parseInt(guess.value, 10), s = fr.result[1], v = "";
        if (!isNaN(p)) v = p === s ? " Your prediction was exactly right." : " You predicted " + p + ".";
        ct.msg.innerHTML = "binary_search printed <strong>" + pyTuple(fr.result) + "</strong>: " + s + " steps to be sure " + neg(T()) +
          " is not among " + fmt(N) + " items." + v + " The row is now in the table — try another n.";
        paint();
      }
    }
    function paint() {
      var prev = null;
      tb.rows(SIZES.map(function (s) {
        var a = res.past[s], b = res.before[s], ch = "";
        if (a != null && prev != null) ch = "+" + (a - prev);
        prev = a != null ? a : null;
        return [LAB[s], a != null ? "<b>" + a + "</b>" : "—", b != null ? b : "—", ch];
      }), SIZES.indexOf(N));
      var all = SIZES.every(function (s) { return res.past[s] != null; });
      pat.innerHTML = all ? "Pattern: " + SIZES.map(function (s) { return res.past[s]; }).join(", ") +
        ". Each ten-fold increase adds only 3 or 4 steps, because 10 is about 2<sup>3.3</sup>: ten times the data is 3.3 more halvings. " +
        "For target n the count is ⌊log₂ n⌋ + 1 — the worst case. Target −5 can finish sooner, because rounding the middle down leaves a slightly smaller left half." : "";
    }
    function fillAll() {
      SIZES.forEach(function (s) {
        res.past[s] = bsResult(ident, s, s)[1];
        res.before[s] = bsResult(ident, s, -5)[1];
      });
      paint();
    }
    paint();
    ct.load();
  }

  /* ============================================================
     Task 2 — break it deliberately (unsorted data)
     ============================================================ */
  function unsorted(host) {
    var UNS = [38, 5, 91, 12, 72, 2, 56, 23, 16, 8];
    var SRT = UNS.slice().sort(function (a, b) { return a - b; });
    var mode = "uns", target = 23, pred = null, tested = null;
    U.title(host, "Animation · binary_search on a list that is not sorted");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("data", [["uns", "unsorted"], ["srt", "same values, sorted"]], mode, function (v) { mode = v; tested = null; ct.load(); }));
    opts.appendChild(U.btn("test every value", "", testAll, "Search for each of the ten values and mark which ones are found"));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var predSeg = U.seg("your prediction", [["found", "finds it"], ["miss", "returns −1"], ["err", "raises an error"]], null, function (v) { pred = v; });
    opts2.appendChild(predSeg);
    host.appendChild(opts2);
    var pickLab = h("div", "lab muted", "<small>click a card to choose the target — every one of these values is in the list</small>");
    host.appendChild(pickLab);
    var arr = h("div", "arr idx w12-arr");
    host.appendChild(arr);
    var cells = [];

    function data() { return mode === "uns" ? UNS : SRT; }
    function drawCells() {
      arr.innerHTML = ""; cells = [];
      data().forEach(function (v, j) {
        var c = U.btn(v + "<small>" + j + "</small>", "cell w12-pick", function () { target = v; tested = null; ct.load(); }, "Search for " + v);
        arr.appendChild(c); cells.push(c);
      });
    }
    var ct = U.CodeTrace(host, {
      code: function () { return BS_CODE + "\n\ndata = [" + data().join(", ") + "]\nprint(binary_search(data, " + target + "))"; },
      build: build, onFrame: onFrame,
      fps: function () { return 1.6; }
    });

    function build() {
      drawCells();
      var d = data(), P = d.indexOf(target);
      var f = bsFrames(d, d.length, target, {
        base: { data: d }, callLine: 20, present: P,
        startNote: (mode === "uns" ? "The list is <strong>not sorted</strong>. " : "Now the same ten values, sorted. ") +
          "Target " + target + " is at index " + P + ". Will binary_search find it? Choose a prediction, then press <strong>play</strong>."
      });
      var last = f[f.length - 1];
      f.push({ line: 20, vars: last.vars, out: [pyTuple(last.result)], phase: "done", result: last.result, low: last.low, high: last.high, mid: last.mid, steps: last.steps });
      f.forEach(function (fr) { fr.counters = { "steps": fr.steps || 0, "error raised": "no" }; });
      return f;
    }
    function onFrame(fr) {
      var P = data().indexOf(target);
      cells.forEach(function (c, j) {
        var cls = "cell w12-pick" + (j === P ? " w12-tgt" : "");
        if (tested) cls += tested[j] ? " good" : " bad";
        else if (fr.low !== null) {
          if (fr.phase === "found" && j === fr.mid) cls += " good";
          else if ((fr.phase === "miss" || fr.phase === "done") && fr.result[0] < 0 && j === P) cls += " bad";
          else if (j < fr.low || j > fr.high) cls += " dim";
          else if (j === fr.mid && fr.phase !== "cross") cls += " on";
        }
        c.className = cls;
      });
      if (fr.phase === "done" && !tested) {
        var ok = fr.result[0] === P, said = ok ? "found" : "miss";
        var v = pred ? (pred === said ? " Your prediction was right." : pred === "err" ? " You expected an error — notice that none came." : " Your prediction was different — look at which half was thrown away.") : "";
        ct.msg.innerHTML = ok
          ? "Printed <strong>" + pyTuple(fr.result) + "</strong> — found at index " + P + "." + (mode === "uns" ? " Lucky: the halves it kept happened to contain " + target + ". Try another card, or <strong>test every value</strong>." : "") + v
          : "Printed <strong>" + pyTuple(fr.result) + "</strong>, yet " + target + " is right there at index " + P + ". No error, no warning — just a wrong answer." + v;
      }
    }
    function testAll() {
      var d = data();
      tested = d.map(function (v, j) { return bsResult(function (i) { return d[i]; }, d.length, v)[0] === j; });
      var k = tested.filter(Boolean).length;
      onFrame({ low: null, phase: "tested" });
      ct.msg.innerHTML = "Found <strong>" + k + " of " + d.length + "</strong> values that are all present" + (k < d.length ? " (red = missed)." : ".") + " " +
        (mode === "uns"
          ? "<strong>Why no error?</strong> Every line is legal on any list of numbers — comparing, adding and indexing never fail — and nothing in the code checks that the data is sorted. " +
            "The function simply trusts its precondition, throws away the half that “cannot” hold the target, and reports −1 as if that were the truth."
          : "With sorted data the thrown-away half really never holds the target, so every search succeeds.");
    }
    ct.load();
  }

  /* ============================================================
     Task 3 — the crossover with sorting included (cost model)
     ============================================================ */
  function crossover(host) {
    var N = 1000000, LG = Math.log(N) / Math.LN2, NS = 50e-9;
    var QS = [1, 10, 100, 1000, 10000];
    var ST = [
      { id: "lin", name: "(a) linear each time", color: "--red", steps: function (q) { return q * N; } },
      { id: "srt", name: "(b) sort once + binary", color: "--blue", steps: function (q) { return N * LG + q * LG; } },
      { id: "set", name: "(c) set once + lookup", color: "--green", steps: function (q) { return 1.5 * N + q; } }
    ];
    var NAMES = { lin: "linear", srt: "sort + binary", set: "set" };
    U.title(host, "Animation · q searches in 1 000 000 unsorted items — total time");
    var opts = h("div", "anim-opts");
    var p1 = h("select"), p2 = h("select");
    [p1, p2].forEach(function (s, k) {
      s.setAttribute("aria-label", k ? "Your prediction for q = 10 000" : "Your prediction for q = 1");
      [["", "?"], ["lin", "linear"], ["srt", "sort + binary"], ["set", "set"]].forEach(function (o) {
        var op = h("option", "", o[1]); op.value = o[0]; s.appendChild(op);
      });
    });
    opts.appendChild(h("span", "lab", "fastest at q = 1:")); opts.appendChild(p1);
    opts.appendChild(h("span", "lab", "at q = 10 000:")); opts.appendChild(p2);
    host.appendChild(opts);

    var chartBox = h("div", "");
    host.appendChild(chartBox);
    var chart = U.LineChart(chartBox, { logx: true, logy: true, xlabel: "q (number of searches)", ylabel: "total seconds", height: 300,
      label: "Total time against number of searches for three strategies, log-log" });
    fitChart(chart);
    var tb = wrapTable(host, ["q", "(a) linear", "(b) sort", "(c) set", "fastest"]);
    tb.el.classList.add("w12-hide-last");
    host.appendChild(h("p", "note-sim", "Simulated timings from a step-count model — run the real code in Colab for your own numbers. " +
      "Model (§12.6): linear q·n steps; sort n·log₂n + q·log₂n; set 1.5·n (hashing each item) + q; one step ≈ 50 ns, ±4% seeded noise."));

    var explore = h("div", "w12-explore");
    var eo = h("div", "anim-opts");
    var sl = h("input"); sl.type = "range"; sl.min = "0"; sl.max = "5"; sl.step = "0.02"; sl.value = "0";
    sl.setAttribute("aria-label", "Number of searches q (log scale)");
    var qv = h("span", "lab", "");
    eo.appendChild(h("span", "lab", "explore q")); eo.appendChild(sl); eo.appendChild(qv);
    explore.appendChild(eo);
    var bars = ST.map(function (s) {
      var row = h("div", "w12-hb"), lab = h("span", "w12-hb-l", NAMES[s.id]), tr = h("div", "w12-hb-t"), fill = h("div", "w12-hb-f"), val = h("span", "w12-hb-v", "");
      fill.style.background = "var(" + s.color + ")";
      tr.appendChild(fill); row.appendChild(lab); row.appendChild(tr); row.appendChild(val); explore.appendChild(row);
      return { fill: fill, val: val, row: row };
    });
    explore.appendChild(h("p", "db-sub", "bar length on a log scale, 1 ms … 1 hour"));
    host.appendChild(explore);
    sl.addEventListener("input", exploreDraw);

    var m = U.msg(host);
    var R = U.rng(1207), noise = {};
    ST.forEach(function (s) { noise[s.id] = QS.map(function () { return 1 + (R() - 0.5) * 0.08; }); });
    function secs(s, q, k) { return s.steps(q) * NS * (k == null ? 1 : noise[s.id][k]); }
    function fs(t) {
      if (t < 1) return t.toFixed(3) + " s";
      if (t < 10) return t.toFixed(2) + " s";
      if (t < 100) return t.toFixed(1) + " s";
      if (t < 3600) return fmt(Math.round(t)) + " s";
      return (t / 3600).toFixed(1) + " h";
    }
    function winner(k) {
      var best = null;
      ST.forEach(function (s) { if (!best || secs(s, QS[k], k) < secs(best, QS[k], k)) best = s; });
      return best.id;
    }
    function firstQ(a, b) { var q = 1; while (a.steps(q) >= b.steps(q) && q < 1e7) q++; return q; }

    function render(fr) {
      var k = fr.k;
      chart.draw(ST.map(function (s) {
        return { name: s.name, color: s.color, points: QS.map(function (q, j) { return [q, secs(s, q, j)]; }) };
      }), { upto: k });
      tb.rows(QS.map(function (q, j) {
        if (j >= k) return [fmt(q), "", "", "", ""];
        var w = winner(j);
        return [fmt(q)].concat(ST.map(function (s) {
          var t = fs(secs(s, q, j));
          return s.id === w ? "<b class='w12-win-c'>" + t + "</b>" : t;
        })).concat(["<b>" + NAMES[w] + "</b>"]);
      }), k - 1);
      explore.style.display = k >= QS.length ? "" : "none";
      if (k === 0) {
        m.innerHTML = "Predict the fastest strategy for one search and for ten thousand, then press <strong>play</strong> to add the rows one q at a time.";
      } else if (k < QS.length) {
        var w = winner(k - 1);
        m.innerHTML = "q = " + fmt(QS[k - 1]) + ": <strong>" + NAMES[w] + "</strong> is fastest. " +
          (k === 1 ? "No preparation beats preparation when you only ask once." :
           "Linear pays a full scan for every query; the other two paid once and now answer almost for free.");
      } else {
        var ql = firstQ(ST[2], ST[0]), qs = firstQ(ST[1], ST[0]);
        var v = "";
        if (p1.value || p2.value) {
          var okA = p1.value === winner(0), okB = p2.value === winner(QS.length - 1);
          v = " Your predictions: q = 1 " + (p1.value ? (okA ? "✓" : "✗") : "–") + ", q = 10 000 " + (p2.value ? (okB ? "✓" : "✗") : "–") + ".";
        }
        m.innerHTML = "Linear wins only at q = 1. The set overtakes it from <strong>q = " + ql + "</strong> (one pass to build). " +
          "Sorting beats linear from about <strong>q = " + qs + "</strong> — the §12.6 envelope — but never beats the set for plain membership; " +
          "its payoff is order questions (Task 4)." + v + " Drag <strong>explore q</strong> to find the crossovers yourself.";
        exploreDraw();
      }
    }
    function exploreDraw() {
      var q = Math.round(Math.pow(10, parseFloat(sl.value)));
      qv.textContent = "q = " + fmt(q);
      var lo = Math.log10(1e-3), hi = Math.log10(3600), best = null;
      ST.forEach(function (s) { if (!best || secs(s, q) < secs(best, q)) best = s; });
      ST.forEach(function (s, j) {
        var t = secs(s, q), w = (Math.log10(t) - lo) / (hi - lo) * 100;
        bars[j].fill.style.width = Math.max(1, Math.min(100, w)) + "%";
        bars[j].val.textContent = fs(t);
        bars[j].row.className = "w12-hb" + (s === best ? " best" : "");
      });
    }
    var player = U.Player(host, {
      build: function () { var f = []; for (var k = 0; k <= QS.length; k++) f.push({ k: k }); return f; },
      render: render, fps: function () { return 0.8; }
    });
    player.load();
  }

  /* ============================================================
     Task 4 — a question a set cannot answer (range count)
     ============================================================ */
  function rangeCount(host) {
    var R = U.rng(412), pool = [];
    while (pool.length < 24) { var x = Math.floor(R() * 1000); if (pool.indexOf(x) < 0) pool.push(x); }
    var DATA = pool.slice().sort(function (a, b) { return a - b; });
    /* a set iterates in hash-table order, not in value order (illustrative scramble) */
    var SETORD = pool.slice().sort(function (a, b) { return (a % 64) - (b % 64) || pool.indexOf(a) - pool.indexOf(b); });
    var mode = "bis", LOW = 250, HIGH = 600;
    U.title(host, "Animation · how many of 24 sorted timestamps fall in [low, high]?");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("method", [["bis", "sorted list + bisect"], ["set", "set"]], mode, function (v) { mode = v; ct.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    function slider(lab, val) {
      var s = h("input"); s.type = "range"; s.min = "0"; s.max = "999"; s.step = "1"; s.value = String(val);
      s.setAttribute("aria-label", lab);
      var v = h("span", "lab w12-sv", String(val));
      opts2.appendChild(h("span", "lab", lab)); opts2.appendChild(s); opts2.appendChild(v);
      s.addEventListener("input", function () {
        var a = parseInt(sLo.value, 10), b = parseInt(sHi.value, 10);
        if (a > b) { if (s === sLo) sHi.value = String(a); else sLo.value = String(b); }
        LOW = parseInt(sLo.value, 10); HIGH = parseInt(sHi.value, 10);
        vLo.textContent = LOW; vHi.textContent = HIGH;
        ct.load();
      });
      return [s, v];
    }
    var a1 = slider("low", LOW), sLo = a1[0], vLo = a1[1];
    var a2 = slider("high", HIGH), sHi = a2[0], vHi = a2[1];
    host.appendChild(opts2);
    var cap = h("div", "lab muted", "");
    host.appendChild(cap);
    var arr = h("div", "arr w12-arr");
    host.appendChild(arr);

    var CODE_B = "import bisect\ncount = bisect.bisect_right(data, high) - bisect.bisect_left(data, low)";
    var CODE_S = "lookup = set(data)\ncount = 0\nfor t in lookup:              # a set has no order to exploit\n    if low <= t <= high:\n        count += 1";
    var ct = U.CodeTrace(host, {
      code: function () { return mode === "bis" ? CODE_B : CODE_S; },
      build: build, onFrame: onFrame,
      fps: function (i, fr) { return mode === "bis" ? 1.3 : Math.max(3, fr.length / 14); }
    });
    var cells = [];
    function build() {
      var order = mode === "bis" ? DATA : SETORD;
      cap.innerHTML = "<small>" + (mode === "bis" ? "the sorted list <code>data</code> (index underneath)" : "the set <code>lookup</code> — its elements come out in hash order, not value order") + "</small>";
      arr.className = "arr w12-arr" + (mode === "bis" ? " idx" : " w12-bag");
      arr.innerHTML = ""; cells = [];
      order.forEach(function (v, j) {
        var c = h("div", "cell", v + (mode === "bis" ? "<small>" + j + "</small>" : ""));
        arr.appendChild(c); cells.push(c);
      });
      var truth = DATA.filter(function (t) { return t >= LOW && t <= HIGH; }).length;
      var f = [], seen = [];
      var base = { low: LOW, high: HIGH };
      function V(extra) { var v = {}, k; for (k in base) v[k] = base[k]; for (k in extra) v[k] = extra[k]; return v; }
      if (mode === "bis") {
        var looks = 0, rightVal = null, leftVal = null;
        f.push({ line: 0, vars: V({}), looked: [], note: "Predict first: how many timestamps must be <em>looked at</em> to count the ones between " + LOW + " and " + HIGH + "? Press <strong>play</strong>.", counters: { "elements looked at": 0 } });
        var passes = [["right", HIGH], ["left", LOW]];
        passes.forEach(function (ps) {
          var lo = 0, hi = DATA.length, x = ps[1], nm = "bisect_" + ps[0];
          var ex = {}; if (rightVal !== null) ex["bisect_right(...)"] = rightVal;
          f.push({ line: 2, vars: V(ex), looked: seen.slice(), lo: lo, hi: hi, which: ps[0],
            note: "Python evaluates the left operand first: <strong>" + nm + "(data, " + x + ")</strong>. It halves a window lo = 0, hi = " + hi + " — the same idea as insertion_point in §12.5.",
            counters: { "elements looked at": looks } });
          while (lo < hi) {
            var mid = Math.floor((lo + hi) / 2), dv = DATA[mid];
            looks++; seen.push(mid);
            var goRight = ps[0] === "right" ? !(x < dv) : dv < x;
            var e2 = {}; for (var k in ex) e2[k] = ex[k];
            e2.lo = lo; e2.hi = hi; e2.mid = mid;
            f.push({ line: 2, vars: e2, looked: seen.slice(), lo: lo, hi: hi, mid: mid, which: ps[0],
              note: "Look at data[" + mid + "] = " + dv + ". " + (goRight
                ? (ps[0] === "right" ? dv + " ≤ " + x : dv + " &lt; " + x) + ", so the boundary is to the right: lo = " + (mid + 1) + "."
                : (ps[0] === "right" ? dv + " &gt; " + x : dv + " ≥ " + x) + ", so the boundary is here or to the left: hi = " + mid + "."),
              counters: { "elements looked at": looks } });
            if (goRight) lo = mid + 1; else hi = mid;
          }
          if (ps[0] === "right") rightVal = lo; else leftVal = lo;
          var e3 = {}; if (rightVal !== null) e3["bisect_right(...)"] = rightVal; if (leftVal !== null) e3["bisect_left(...)"] = leftVal;
          f.push({ line: 2, vars: V(e3), looked: seen.slice(), which: ps[0], bound: lo,
            note: nm + " returns <strong>" + lo + "</strong>: " + (ps[0] === "right" ? "the first index holding a value &gt; " + x : "the first index holding a value ≥ " + x) + ".",
            counters: { "elements looked at": looks } });
        });
        var cnt = rightVal - leftVal;
        f.push({ line: 2, vars: V({ "bisect_right(...)": rightVal, "bisect_left(...)": leftVal, count: cnt }), looked: seen.slice(), range: [leftVal, rightVal],
          out: ["count = " + cnt], done: true,
          note: "count = " + rightVal + " − " + leftVal + " = <strong>" + cnt + "</strong>" + (cnt === truth ? " ✓" : "") + ", after looking at only <strong>" + looks + " of 24</strong> elements. " +
            "With a million timestamps each bisect needs at most 20 looks: about <strong>40 in total, O(log n)</strong>.",
          counters: { "elements looked at": looks, "count": cnt } });
      } else {
        var c = 0, n = 0;
        f.push({ line: 0, vars: V({}), looked: [], note: "Predict first: how many elements must the set version look at? Press <strong>play</strong>.", counters: { "elements looked at": 0 } });
        f.push({ line: 1, vars: V({}), looked: [], note: "Building the set is one pass over the data (O(n)) — and it throws the order away.", counters: { "elements looked at": 0 } });
        f.push({ line: 2, vars: V({ count: 0 }), looked: [], note: "Start counting.", counters: { "elements looked at": 0, "count": 0 } });
        SETORD.forEach(function (t, j) {
          n++; seen.push(j);
          var inR = t >= LOW && t <= HIGH;
          f.push({ line: 4, hl: [3], vars: V({ t: t, count: c }), looked: seen.slice(), cur: j, hit: inR,
            note: "t = " + t + ": " + (inR ? "inside the range." : "outside.") + " Nothing about " + t + " tells us where the in-range values are, so keep going.",
            counters: { "elements looked at": n, "count": c } });
          if (inR) { c++; f.push({ line: 5, vars: V({ t: t, count: c }), looked: seen.slice(), cur: j, hit: true, note: "count = " + c + ".", counters: { "elements looked at": n, "count": c } }); }
        });
        f.push({ line: 3, vars: V({ count: c }), looked: seen.slice(), done: true, out: ["count = " + c],
          note: "count = <strong>" + c + "</strong>" + (c === truth ? " ✓" : "") + ", but it looked at <strong>all 24</strong>. A set has no notion of “between”, so every element must be checked: " +
            "with a million timestamps that is <strong>1 000 000 looks, O(n)</strong>. (Asking <code>x in lookup</code> for every x from low to high costs high − low + 1 lookups instead — hopeless for real timestamps.)",
          counters: { "elements looked at": n, "count": c } });
      }
      return f;
    }
    function onFrame(fr) {
      cells.forEach(function (cel, j) {
        var v = mode === "bis" ? DATA[j] : SETORD[j], inR = v >= LOW && v <= HIGH, cls = "cell";
        if (mode === "bis") {
          if (fr.range) cls += j >= fr.range[0] && j < fr.range[1] ? " good" : " dim";
          else if (fr.mid === j) cls += " on";
          else if (fr.lo != null && (j < fr.lo || j >= fr.hi)) cls += " dim";
          if (!fr.range && fr.looked.indexOf(j) >= 0 && fr.mid !== j) cls += " w12-seen";
        } else {
          if (fr.cur === j) cls += fr.hit ? " good on" : " on";
          else if (fr.looked.indexOf(j) >= 0) cls += inR ? " good" : " dim";
        }
        cel.className = cls;
      });
    }
    ct.load();
  }

  /* ============================================================
     Task 5 — trace it on paper
     ============================================================ */
  function paperTrace(host) {
    var D = [3, 7, 9, 14, 21, 28, 33, 40];
    var target = 33, mode = "watch";
    U.title(host, "Animation · trace binary_search([3, 7, 9, 14, 21, 28, 33, 40], …)");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("target", [[33, "33"], [10, "10 (absent)"]], target, function (v) { target = v; reset(); }));
    opts.appendChild(U.seg("mode", [["watch", "watch it"], ["you", "you trace it"]], mode, function (v) { mode = v; reset(); }));
    host.appendChild(opts);

    var arr = h("div", "arr idx w12-arr w12-arr-mk");
    host.appendChild(arr);
    var cells = D.map(function (v, j) {
      var c = h("div", "cell", v + "<small>" + j + "</small><i class='w12-mk'></i>");
      arr.appendChild(c); return c;
    });
    function paintCells(low, high, mid, phase, P) {
      cells.forEach(function (c, j) {
        var cls = "cell";
        if (low !== null && low !== undefined) {
          if (phase === "found" && j === mid) cls += " good";
          else if (j < low || j > high) cls += " dim";
          else if (j === mid && phase !== "cross") cls += " on";
        }
        c.className = cls;
        var mk = [];
        if (low !== null && low !== undefined && phase !== "start") {
          if (j === low) mk.push("low");
          if (j === mid && phase !== "cross" && phase !== "miss" && phase !== "check" && phase !== "init") mk.push("mid");
          if (j === high) mk.push("high");
        }
        c.querySelector(".w12-mk").textContent = mk.join("·");
      });
    }

    /* --- watch mode --- */
    var watch = h("div", "");
    host.appendChild(watch);
    var ct = U.CodeTrace(watch, {
      code: function () { return BS_CODE + "\n\nprint(binary_search([3, 7, 9, 14, 21, 28, 33, 40], " + target + "))"; },
      build: function () {
        var f = bsFrames(D, D.length, target, { callLine: 19,
          startNote: "Get paper ready: write low, high and middle at each step as you go. Press <strong>play</strong> or <strong>step</strong>." });
        var last = f[f.length - 1];
        f.push({ line: 19, vars: last.vars, out: [pyTuple(last.result)], phase: "done", low: last.low, high: last.high, mid: last.mid, steps: last.steps, rows: last.rows, result: last.result,
          note: target === 33 ? "Found 33 at index 6 in <strong>3 steps</strong>: (6, 3)." : "10 is absent: <strong>3 steps, then the crossing</strong> — low 3 &gt; high 2 — so it returns (−1, 3)." });
        f.forEach(function (fr) { fr.counters = { steps: fr.steps || 0 }; });
        return f;
      },
      onFrame: function (fr) {
        paintCells(fr.low, fr.high, fr.mid, fr.phase);
        tb.rows(fr.rows.map(fmtRow), fr.rows.length - 1);
      },
      fps: function () { return 1.3; }
    });
    var tb = wrapTable(ct.extra, ["step", "low", "high", "middle", "data[middle]", "decision"]);
    tb.el.classList.add("w12-hide-5");
    function fmtRow(r) { return [r[0], r[1], r[2] < 0 ? "−" + (-r[2]) : r[2], r[3], r[4], r[5]]; }

    /* --- you mode --- */
    var you = h("div", "w12-you");
    host.appendChild(you);
    var ytb = wrapTable(you, ["step", "low", "high", "middle", "data[middle]", "decision"]);
    ytb.el.classList.add("w12-hide-5");
    var form = h("div", "anim-opts w12-form");
    function inp(lab) {
      var i = h("input"); i.type = "number"; i.setAttribute("aria-label", lab); i.placeholder = lab;
      form.appendChild(h("span", "lab", lab)); form.appendChild(i); return i;
    }
    var iLo = inp("low"), iHi = inp("high"), iMid = inp("middle");
    var bCheck = U.btn("check this step", "primary", function () { check(false); });
    var bStop = U.btn("low > high: stop", "", function () { check(true); }, "Say the loop ends here");
    var bShow = U.btn("show me", "", function () { reveal(); }, "Fill in the correct values");
    form.appendChild(bCheck); form.appendChild(bStop); form.appendChild(bShow);
    you.appendChild(form);
    var ym = U.msg(you);
    var rows = [], k = 0, slips = 0, doneRows = [];

    function expected() {
      var f = bsFrames(D, D.length, target, {});
      return f[f.length - 1].rows;
    }
    function youShow() {
      ytb.rows(doneRows.map(fmtRow), doneRows.length - 1);
      [iLo, iHi, iMid].forEach(function (i) { i.value = ""; i.classList.remove("w12-bad"); });
      if (k >= rows.length) {
        form.style.display = "none";
        var last = rows[rows.length - 1], res = last[3] === "—" ? "(−1, " + (rows.length - 1) + ")" : "(" + last[3] + ", " + last[0] + ")";
        ym.innerHTML = "Done: binary_search returns <strong>" + res + "</strong>" + (target === 10 ? " — 3 steps, then the crossing." : " in 3 steps.") +
          (slips ? " " + slips + " slip" + (slips > 1 ? "s" : "") + " on the way." : " No slips at all.") + " Switch target to try the other search.";
        return;
      }
      form.style.display = "";
      var prev = k ? rows[k - 1] : null;
      ym.innerHTML = k === 0 ? "Step 1: what are low, high and middle at the start? (8 items, indices 0–7.)"
        : "After “" + prev[5] + "”: write the new low and high. If the loop still runs, also write middle; if low &gt; high, press <strong>low &gt; high: stop</strong>.";
    }
    function check(stop) {
      var r = rows[k], isStop = r[3] === "—";
      var lo = parseInt(iLo.value, 10), hi = parseInt(iHi.value, 10), md = parseInt(iMid.value, 10);
      var bad = [];
      if (lo !== r[1]) bad.push(iLo);
      if (hi !== r[2]) bad.push(iHi);
      if (!stop && !isStop && md !== r[3]) bad.push(iMid);
      [iLo, iHi, iMid].forEach(function (i) { i.classList.toggle("w12-bad", bad.indexOf(i) >= 0); });
      if (stop !== isStop) {
        slips++;
        ym.innerHTML = stop ? "Not yet — low ≤ high here, so the loop still runs. Write the middle and check the step." :
          "Look at low and high: is low ≤ high still true? If not, the loop has ended — press <strong>low &gt; high: stop</strong>.";
        return;
      }
      if (bad.length) {
        slips++;
        var tips = [];
        if (bad.indexOf(iLo) >= 0 || bad.indexOf(iHi) >= 0)
          tips.push(k === 0 ? "At the start low = 0 and high = len(data) − 1." : "Only one of low/high changes each step, and it moves <em>past</em> the middle (± 1).");
        if (bad.indexOf(iMid) >= 0) tips.push("middle = (low + high) // 2, which rounds down.");
        ym.innerHTML = "Not quite — check the red box" + (bad.length > 1 ? "es" : "") + ". " + tips.join(" ");
        return;
      }
      doneRows.push(r); k++;
      paintCells(r[1], r[2], isStop ? null : r[3], isStop ? "cross" : (String(r[5]).indexOf("match") === 0 ? "found" : "mid"));
      youShow();
    }
    function reveal() {
      var r = rows[k];
      slips++;
      iLo.value = r[1]; iHi.value = r[2]; iMid.value = r[3] === "—" ? "" : r[3];
      ym.innerHTML = "Here are the values for this step — now press " + (r[3] === "—" ? "<strong>low &gt; high: stop</strong>." : "<strong>check this step</strong>.");
    }
    function reset() {
      ct.stop();
      if (mode === "watch") { watch.style.display = ""; you.style.display = "none"; ct.load(); }
      else {
        watch.style.display = "none"; you.style.display = "";
        rows = expected(); k = 0; slips = 0; doneRows = [];
        paintCells(null); youShow();
      }
    }
    reset();
  }

  /* ============================================================
     Task 6 — pass the six tests
     ============================================================ */
  function sixTests(host) {
    var D = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    var TESTS = [
      { lab: "empty list", call: "my_search([], 5)", data: [], t: 5 },
      { lab: "one item", call: "my_search([7], 7)", data: [7], t: 7 },
      { lab: "two items", call: "my_search([10, 20], 5)", data: [10, 20], t: 5 },
      { lab: "first element", call: "my_search(D, 2)", data: D, t: 2 },
      { lab: "last element", call: "my_search(D, 91)", data: D, t: 91 },
      { lab: "missing value", call: "my_search(D, 99)", data: D, t: 99 }
    ];
    var VERS = [
      { id: "ok", lab: "correct", short: "correct", init: "len(data) - 1", cond: "<=", hiU: "middle - 1", loU: "middle + 1", bug: 0 },
      { id: "lt", lab: "while low < high", short: "low < high", init: "len(data) - 1", cond: "<", hiU: "middle - 1", loU: "middle + 1", bug: 3 },
      { id: "hm", lab: "high = middle", short: "high = mid", init: "len(data) - 1", cond: "<=", hiU: "middle", loU: "middle + 1", bug: 8 },
      { id: "lm", lab: "low = middle", short: "low = mid", init: "len(data) - 1", cond: "<=", hiU: "middle - 1", loU: "middle", bug: 10 },
      { id: "ln", lab: "high = len(data)", short: "high = len", init: "len(data)", cond: "<=", hiU: "middle - 1", loU: "middle + 1", bug: 2 }
    ];
    var ver = VERS[0], ti = 0, board = {};
    U.title(host, "Animation · five binary searches, six boundary tests");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("version", VERS.map(function (v) { return [v.id, v.lab]; }), ver.id, function (id) {
      ver = VERS.filter(function (v) { return v.id === id; })[0]; ct.load(); paintChips();
    }));
    host.appendChild(opts);
    var chipBox = h("div", "w12-tests");
    var chips = TESTS.map(function (t, j) {
      var c = U.btn("<span>" + (j + 1) + " · " + t.lab + "</span><code>" + esc(t.call) + "</code><em></em>", "w12-chip", function () { ti = j; ct.load(); paintChips(); }, "Trace test " + (j + 1));
      chipBox.appendChild(c); return c;
    });
    host.appendChild(chipBox);
    var opts2 = h("div", "anim-opts");
    opts2.appendChild(U.btn("run all six on this version", "", runAll));
    host.appendChild(opts2);

    function code() {
      var t = TESTS[ti];
      return "def my_search(data, target):\n" +
        "    low, high = 0, " + ver.init + "\n" +
        "    while low " + ver.cond + " high:\n" +
        "        middle = (low + high) // 2\n" +
        "        if data[middle] == target:\n" +
        "            return middle\n" +
        "        elif target < data[middle]:\n" +
        "            high = " + ver.hiU + "\n" +
        "        else:\n" +
        "            low = " + ver.loU + "\n" +
        "    return -1\n\n" +
        "D = [" + D.join(", ") + "]\n" +
        "print(" + t.call + ")";
    }
    function sim(v, t, frames) {
      var d = t.data, n = d.length, low = 0, high = v.init === "len(data)" ? n : n - 1, middle = null, it = 0, prev = null;
      var BH = v.bug ? [v.bug] : [];
      function V() { var o = { "len(data)": n, target: t.t, low: low, high: high }; if (middle !== null) o.middle = middle; return o; }
      function P(line, note, extra) {
        if (!frames) return;
        var fr = { line: line, vars: V(), note: note, hl: BH, low: low, high: high, mid: middle, counters: { "loop rounds": it } };
        for (var k in extra) fr[k] = extra[k];
        frames.push(fr);
      }
      var expect = bsResult(function (i) { return d[i]; }, n, t.t)[0];
      P(14, "Test: <code>" + esc(t.call) + "</code> should print <strong>" + expect + "</strong>. Predict: will this version pass? Press <strong>play</strong>.", { phase: "start", hl: [] });
      P(2, "low = 0, high = " + high + ".");
      while (true) {
        var go = v.cond === "<=" ? low <= high : low < high;
        if (!go) {
          P(3, "low " + v.cond + " high is <strong>False</strong> (" + low + " " + v.cond + " " + high + "), so the loop ends.");
          P(11, "Return −1.", {});
          return fin(-1);
        }
        it++;
        if (prev && prev[0] === low && prev[1] === high && it > 2) {
          P(3, "low = " + low + " and high = " + high + " — <strong>exactly as last round</strong>. The window never shrinks, so this loop never ends. (The animation stops here; Python would hang.)", { phase: "loop", err: 3 });
          return fin("loop");
        }
        prev = [low, high];
        P(3, "low " + v.cond + " high (" + low + " " + v.cond + " " + high + ") — round " + it + ".");
        middle = Math.floor((low + high) / 2);
        P(4, "middle = (" + low + " + " + high + ") // 2 = " + middle + ".");
        if (middle >= n) {
          P(5, "data[" + middle + "] — but the list only has indices 0–" + (n - 1) + (n ? "" : " (it is empty)") + ". <strong>IndexError!</strong>",
            { phase: "error", err: 5, out: ["Traceback (most recent call last):", "  ...", "IndexError: list index out of range"], errOut: true });
          return fin("error");
        }
        var dm = d[middle];
        if (dm === t.t) { P(6, "data[" + middle + "] is " + dm + " — return " + middle + ".", { hl: BH.concat([5]) }); return fin(middle); }
        if (t.t < dm) {
          var h0 = high;
          high = v.hiU === "middle" ? middle : middle - 1;
          P(8, t.t + " &lt; " + dm + ": high = " + high + (high === h0 ? " — <strong>unchanged</strong>." : "."), { hl: BH.concat([7]) });
        } else {
          var l0 = low;
          low = v.loU === "middle" ? middle : middle + 1;
          P(10, t.t + " &gt; " + dm + ": low = " + low + (low === l0 ? " — <strong>unchanged</strong>." : "."), { hl: BH.concat([9]) });
        }
      }
      function fin(r) {
        var st = r === "loop" ? "loop" : r === "error" ? "err" : r === expect ? "pass" : "fail";
        if (frames) {
          var last = frames[frames.length - 1];
          var out = st === "err" ? last.out : st === "loop" ? ["(still running …)"] : [String(r)];
          var words = {
            pass: "Printed " + r + " — <strong>pass</strong> ✓.",
            fail: "Printed " + r + " but the answer is " + expect + " — <strong>fail</strong>: a wrong answer with no error.",
            loop: "<strong>Fail</strong>: an infinite loop.",
            err: "<strong>Fail</strong>: the program crashed."
          }[st];
          frames.push({ line: st === "pass" || st === "fail" ? 14 : last.line, err: last.err, errOut: st === "err", hl: BH, vars: last.vars, out: out, low: low, high: high, mid: null,
            counters: last.counters, note: words, phase: "done", status: st });
        }
        return st;
      }
    }
    var SYM = { pass: "✓ pass", fail: "✗ wrong", loop: "∞ hangs", err: "✗ crash" };
    var ct = U.CodeTrace(host, {
      code: code,
      build: function () { var f = []; sim(ver, TESTS[ti], f); return f; },
      onFrame: function (fr) {
        if (fr.phase === "done") { board[ver.id + ti] = fr.status; paintChips(); paintBoard(); }
      },
      fps: function () { return 1.8; }
    });
    var btb = wrapTable(ct.extra, ["version"].concat(TESTS.map(function (t, j) { return String(j + 1); })));
    var sum = h("p", "w12-pat", "");
    ct.extra.appendChild(sum);

    function paintChips() {
      chips.forEach(function (c, j) {
        var st = board[ver.id + j];
        c.className = "w12-chip" + (j === ti ? " sel" : "") + (st ? (st === "pass" ? " pass" : " fail") : "");
        c.querySelector("em").textContent = st ? SYM[st] : "not run";
      });
    }
    function paintBoard() {
      var rows = VERS.map(function (v) {
        return [v.short].concat(TESTS.map(function (t, j) {
          var st = board[v.id + j];
          return st ? (st === "pass" ? "<span class='w12-ok'>✓</span>" : "<span class='w12-no'>" + (st === "loop" ? "∞" : st === "err" ? "crash" : "✗") + "</span>") : "·";
        }));
      });
      var caught = TESTS.map(function (t, j) {
        return VERS.filter(function (v) { var s = board[v.id + j]; return s && s !== "pass"; }).length;
      });
      rows.push(["<b>bugs caught</b>"].concat(caught.map(function (c) { return "<b>" + c + "</b>"; })));
      btb.rows(rows, VERS.indexOf(ver));
      var full = VERS.every(function (v) { return TESTS.every(function (t, j) { return board[v.id + j]; }); });
      var mine = TESTS.map(function (t, j) { return board[ver.id + j]; });
      var failed = mine.map(function (s, j) { return s && s !== "pass" ? TESTS[j].lab : null; }).filter(Boolean);
      var top = Math.max.apply(null, caught);
      var best = TESTS.filter(function (t, j) { return caught[j] === top; }).map(function (t) { return t.lab; });
      sum.innerHTML = full
        ? "All five versions tested. Most bugs caught: <strong>" + best.join(" and ") + "</strong> (" + top + " each). " +
          "No single test catches every bug — <code>high = middle</code> only shows up on the two-item list, <code>high = len(data)</code> on the empty list and the value just past the end. That is why you run all six."
        : mine.every(Boolean)
          ? (failed.length ? "This version fails: <strong>" + failed.join(", ") + "</strong>. Pick another version." : "All six pass — the loop condition and both narrowing steps are consistent.")
          : "Tip: guess which test will expose this version, then trace it — or run all six.";
    }
    function runAll() {
      TESTS.forEach(function (t, j) { board[ver.id + j] = sim(ver, t, null); });
      paintChips(); paintBoard();
    }
    paintChips(); paintBoard();
    ct.load();
  }

  function reg(name, fn) { AAAnim.register(name, function (host) { host.classList.add("w12"); fn(host); }); }
  reg("w12-halvings", halvings);
  reg("w12-unsorted", unsorted);
  reg("w12-crossover", crossover);
  reg("w12-range", rangeCount);
  reg("w12-paper-trace", paperTrace);
  reg("w12-six-tests", sixTests);
})();
