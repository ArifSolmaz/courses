/* ============================================================
   AA — week 3 "Try it yourself" animations
   w3-countdown, w3-evens, w3-nested, w3-halving, w3-multiple, w3-fizzbuzz
   Uses AAAnim.ui helpers from anim.js; extra styles in anim-w3.css.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt;

  /* CodeTrace prints a function value with String(v): lets us show plain text like None */
  function raw(text) { var f = function () {}; f.toString = function () { return text; }; return f; }
  var NONE = raw("None");
  function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
  function numIn(label, ph) {
    var i = h("input"); i.type = "number"; i.min = "0"; i.placeholder = ph || "your guess";
    i.setAttribute("aria-label", label);
    return i;
  }
  /* LineChart draws on a 720-px canvas; on phones use a narrower canvas so the labels stay legible */
  function fitChart(host, chart) {
    var w = host.clientWidth, cw = !w || w >= 560 ? 720 : Math.max(330, Math.round(w * 1.25));
    if (chart.el.width !== cw) { chart.el.width = cw; chart.el.height = Math.min(300, Math.round(cw * 0.7)); }
  }
  function guessOf(inp) { var v = parseInt(inp.value, 10); return isNaN(v) ? null : v; }

  /* Python range(start, stop, step) as an array */
  function pyRange(a, b, s) {
    var out = [], v;
    if (s > 0) for (v = a; v < b; v += s) out.push(v);
    else for (v = a; v > b; v += s) out.push(v);
    return out;
  }

  /* ============================================================
     Task 1 — w3-countdown: what range(10, 0, -1) really produces
     ============================================================ */
  function countdown(host) {
    var S = 10, V = "ok";
    var VAR = {
      ok:   { stop: 0,  step: -1, call: function () { return "range(" + S + ", 0, -1)"; } },
      one:  { stop: 1,  step: -1, call: function () { return "range(" + S + ", 1, -1)"; } },
      neg:  { stop: -1, step: -1, call: function () { return "range(" + S + ", -1, -1)"; } },
      up:   { stop: 0,  step: 1,  call: function () { return "range(" + S + ", 0)"; } }
    };
    U.title(host, "Animation · which numbers does range hand to the loop?");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("range", [["ok", "(S, 0, -1)"], ["one", "(S, 1, -1)"], ["neg", "(S, -1, -1)"], ["up", "(S, 0)"]], V,
      function (v) { V = v; ct.load(); }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts w3-opts");
    opts2.appendChild(U.seg("start S", [[10, "10"], [100, "100"]], S, function (v) { S = v; ct.load(); }));
    var guess = numIn("Predicted number of values printed before Lift off", "how many?");
    opts2.appendChild(h("span", "lab", "numbers printed before “Lift off”:"));
    opts2.appendChild(guess);
    host.appendChild(opts2);

    function code() { return "for i in " + VAR[V].call() + ":\n    print(i)\nprint(\"Lift off\")"; }
    var strip;
    function build() {
      var cfg = VAR[V], vals = pyRange(S, cfg.stop, cfg.step), f = [], out = [], passes = 0;
      function push(line, note, ex) {
        var fr = { line: line, vars: {}, out: out.slice(), note: note, cur: null, printed: passes,
          counters: { "loop passes": passes, "lines printed": out.length } };
        if (ex) Object.keys(ex).forEach(function (k) { fr[k] = ex[k]; });
        f.push(fr);
      }
      push(0, "The strip shows the numbers near the countdown. Predict how many numbers get printed, then press <strong>play</strong>.", { hideRange: true });
      push(1, "<code>" + cfg.call() + "</code> means: start at " + S + ", go in steps of " + cfg.step + ", and stop <em>before</em> reaching " + cfg.stop + "." +
        (vals.length ? " The highlighted cells are the values it will produce." : " Stepping <em>up</em> from " + S + " can never get below " + cfg.stop + " — so it produces <strong>nothing</strong>."));
      vals.forEach(function (v, j) {
        push(1, j === 0 ? "First pass: <code>i</code> is " + v + "." : "Next pass: <code>i</code> is " + v + ".", { cur: v, vars: { i: v } });
        out.push(String(v)); passes++;
        push(2, "Print it.", { cur: v, vars: { i: v } });
      });
      var last = vals.length ? vals[vals.length - 1] : null;
      push(1, vals.length ? "The next value would be " + (last + cfg.step) + " — that is the stop value, so the loop ends." : "Nothing to loop over: the body never runs.",
        { vars: last === null ? {} : { i: last }, stopHit: true });
      out.push("Lift off");
      push(3, "After the loop (not indented), print once.", { vars: last === null ? {} : { i: last } });
      var g = guessOf(guess), verdict = g === null ? "" : g === passes ? " Your prediction was right." : " You predicted " + g + ".";
      var end = {
        ok: "<strong>" + passes + " passes</strong>: " + S + " down to 1, then Lift off. A countdown from " + S + " costs " + S + " passes — " +
          (S === 10 ? "switch the start to 100 and it costs 100." : "ten times the start, ten times the work."),
        one: "Only <strong>" + passes + " passes</strong> — 1 is missing. The stop value is never produced, so <code>range(" + S + ", 1, -1)</code> ends at 2. Classic off-by-one.",
        neg: "<strong>" + passes + " passes</strong> — one too many: it printed 0. The stop is −1, so 0 is the last value produced.",
        up: "<strong>0 passes</strong>. Without <code>-1</code>, <code>range</code> counts <em>up</em> from " + S + ", and " + S + " is already past 0. Only “Lift off” appears."
      }[V];
      push(0, end + verdict, { done: true, vars: last === null ? {} : { i: last } });
      return f;
    }
    function onFrame(fr) {
      var cfg = VAR[V], vals = pyRange(S, cfg.stop, cfg.step);
      var lo = Math.min(-1, cfg.stop), cells = [];
      for (var v = S; v >= lo; v--) cells.push(v);
      if (strip.childNodes.length !== cells.length) {
        strip.innerHTML = "";
        cells.forEach(function (v) { var c = h("div", "cell", String(v)); strip.appendChild(c); });
      }
      var small = S > 10;
      strip.className = "arr w3-strip" + (small ? " w3-small" : "");
      cells.forEach(function (v, j) {
        var c = strip.childNodes[j], inR = vals.indexOf(v) >= 0, k = vals.indexOf(v);
        var cls = "cell";
        if (!fr.hideRange) {
          if (!inR) cls += " dim";
          if (v === cfg.stop) cls = "cell w3-stop" + (fr.stopHit ? " bad" : "");
          if (inR && k < fr.printed) cls += " good";
          if (v === fr.cur) cls += " on";
        }
        c.className = cls;
      });
      if (fr.hideRange) strip.childNodes.forEach(function (c) { c.className = "cell"; });
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: onFrame,
      fps: function (i, fr) { return S > 10 && fr[i] && fr[i].cur !== null && fr[i].cur < S - 2 && fr[i].cur > 2 ? 14 : 1.3; }
    });
    ct.extra.appendChild(h("div", "ct-h", "from the start down to −1 · green = printed · dashed = the stop value"));
    strip = h("div", "arr w3-strip");
    ct.extra.appendChild(strip);
    guess.addEventListener("change", function () { ct.load(); });
    ct.load();
  }
  AAAnim.register("w3-countdown", countdown);

  /* ============================================================
     Task 2 — w3-evens: steps and answer both grow with n
     ============================================================ */
  function evens(host) {
    var N = 100, results = {};
    U.title(host, "Animation · count the evens, and count the work");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("n", [[100, "100"], [200, "200"], [400, "400"]], N, function (v) { N = v; ct.load(); }));
    host.appendChild(opts);
    function code() {
      return "n = " + N + "\nevens = 0\nsteps = 0\n\nfor number in range(1, n + 1):\n    steps = steps + 1\n" +
        "    if number % 2 == 0:\n        evens = evens + 1\n\nprint(f\"n = {n}: {evens} evens, {steps} steps\")";
    }
    var cv, ctx, tbl, chart, COLS = 25;
    function build() {
      var f = [], out = [], ev = 0, st = 0;
      function push(line, note, k, ex) {
        var fr = { line: line, vars: { n: N, evens: ev, steps: st }, out: out.slice(), note: note, k: k,
          counters: { steps: st, evens: ev } };
        if (k > 0) fr.vars = { n: N, evens: ev, steps: st, number: k };
        if (ex) Object.keys(ex).forEach(function (x) { fr[x] = ex[x]; });
        f.push(fr);
      }
      push(0, "Before you run it: for n = " + N + ", how many evens, and how many steps? Press <strong>play</strong>.", 0, { vars: {} });
      push(3, "Two accumulators start at 0, <em>above</em> the loop: one for the answer, one for the work.", 0);
      for (var k = 1; k <= N; k++) {
        var even = k % 2 === 0;
        if (k <= 4) {
          push(5, "Pass " + k + ": <code>number</code> is " + k + ".", k, { part: 0 });
          st++;
          push(6, "One unit of work: <code>steps</code> becomes " + st + ".", k, { part: 1 });
          push(7, k + " % 2 is " + (k % 2) + (even ? ", so it is even." : ", so it is odd — skip the next line."), k, { part: 1 });
          if (even) { ev++; push(8, "<code>evens</code> becomes " + ev + ".", k, { part: 2 }); }
        } else {
          st++; if (even) ev++;
          push(even ? 8 : 7, "Pass " + k + " of " + N + ". Every pass adds 1 to <code>steps</code>; only every second pass adds to <code>evens</code>.", k, { hl: [5, 6, 7], fast: true });
        }
      }
      out.push("n = " + N + ": " + ev + " evens, " + st + " steps");
      push(10, "Done — the loop visited every number from 1 to " + N + ".", N, { finished: true });
      return f;
    }
    function drawGrid(fr) {
      var hw = host.clientWidth, narrow = hw > 0 && hw < 560;
      COLS = narrow ? 20 : 25;
      var rows = Math.ceil(N / COLS), cell = 28;
      if (cv.width !== COLS * cell || cv.height !== rows * cell) { cv.width = COLS * cell; cv.height = rows * cell; }
      var cDown = U.cssVar(host, "--surface-2"), cSeen = U.cssVar(host, "--border-strong"), cEven = U.cssVar(host, "--green"),
        cCur = U.cssVar(host, "--blue"), cTxt = U.cssVar(host, "--muted"), cBg = U.cssVar(host, "--bg-soft"), cOnTxt = U.cssVar(host, "--bg");
      ctx.fillStyle = cBg; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.font = "10px " + (U.cssVar(host, "--font-mono") || "monospace");
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var v = 1; v <= N; v++) {
        var x = ((v - 1) % COLS) * cell, y = Math.floor((v - 1) / COLS) * cell;
        var seen = v <= fr.k, fill = v === fr.k && !fr.finished ? cCur : seen ? (v % 2 === 0 ? cEven : cSeen) : cDown;
        ctx.fillStyle = fill; ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        if (narrow) continue;             /* numbers would be too small to read on a phone */
        ctx.fillStyle = seen && (v % 2 === 0 || v === fr.k) ? cOnTxt : cTxt;
        ctx.fillText(String(v), x + cell / 2, y + cell / 2 + 1);
      }
    }
    function drawResults() {
      var ns = [100, 200, 400];
      tbl.rows(ns.map(function (n) {
        var r = results[n];
        return [fmt(n), r ? fmt(r.ev) : "?", r ? fmt(r.st) : "?", r ? r.st / n : "?"];
      }), ns.indexOf(N));
      var have = ns.filter(function (n) { return results[n]; });
      fitChart(host, chart);
      chart.draw([
        { name: "steps", color: "--accent", points: have.map(function (n) { return [n, results[n].st]; }) },
        { name: "evens", color: "--green", points: have.map(function (n) { return [n, results[n].ev]; }) }
      ], { xr: [100, 400], yr: [0, 400] });
    }
    function onFrame(fr) {
      drawGrid(fr);
      if (fr.finished && !results[N]) { results[N] = { ev: N / 2, st: N }; drawResults(); }
      if (fr.finished) {
        var have = [100, 200, 400].filter(function (n) { return results[n]; });
        ct.msg.innerHTML = "<strong>" + fmt(N / 2) + " evens, " + fmt(N) + " steps.</strong> The step count is exactly n. " +
          (have.length < 3 ? "Now run the other sizes and watch the table fill." : "Doubling n doubles both columns — two straight lines through zero.");
      }
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: onFrame,
      fps: function (i, fr) { return fr[i] && fr[i].fast && fr[i + 1] && fr[i + 1].fast ? N / 5 : 1.4; }
    });
    ct.extra.appendChild(h("div", "ct-h", "numbers 1 to n · blue = this pass · green = counted as even"));
    cv = h("canvas", "w3-grid"); cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Grid of the numbers 1 to n; visited numbers are shaded and even numbers are green");
    ctx = cv.getContext("2d");
    ct.extra.appendChild(cv);
    var two = h("div", "w3-two");
    var left = h("div", ""), right = h("div", "");
    left.appendChild(h("div", "ct-h", "your notes (filled when a run finishes)"));
    var tw = h("div", "anim-table-wrap"); left.appendChild(tw);
    tbl = U.table(tw, ["n", "evens", "steps", "steps ÷ n"]);
    tbl.el.classList.add("w3-tbl");
    chart = U.LineChart(right, { xlabel: "n", ylabel: "count", height: 300, label: "Steps and evens plotted against n" });
    two.appendChild(left); two.appendChild(right);
    ct.extra.appendChild(two);
    drawResults();
    ct.load();
  }
  AAAnim.register("w3-evens", evens);

  /* ============================================================
     Task 3 — w3-nested: the inner loop runs n times per outer pass
     ============================================================ */
  function nested(host) {
    var N = 300;
    U.title(host, "Animation · every pair: watch the grid fill");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("n", [[5, "5"], [10, "10"], [100, "100"], [300, "300"]], N, function (v) { N = v; ct.load(); }));
    var guess = numIn("Your predicted step count", "steps?");
    opts.appendChild(h("span", "lab", "predicted steps:"));
    opts.appendChild(guess);
    host.appendChild(opts);
    guess.addEventListener("change", function () { ct.load(); });
    function code() { return "n = " + N + "\nsteps = 0\n\nfor i in range(n):\n    for j in range(n):\n        steps = steps + 1\n\nprint(f\"n = {n}, steps = {steps}\")"; }
    var cv, ctx, bars;
    function build() {
      var f = [], out = [], steps = 0, fine = N <= 10;
      function push(line, note, ex) {
        var fr = { line: line, vars: ex.vars || { n: N, steps: steps }, out: out.slice(), note: note, steps: steps, cells: ex.cells, cur: ex.cur,
          counters: { "outer passes": ex.rows == null ? 0 : ex.rows, steps: fmt(steps) } };
        if (ex.hl) fr.hl = ex.hl;
        if (ex.final) fr.final = true;
        f.push(fr);
      }
      var g = guessOf(guess);
      push(0, "Write your prediction for n = " + N + " in the box" + (g === null ? "" : " (you wrote " + fmt(g) + ")") + ", then press <strong>play</strong>. Each square of the grid is one pair (i, j).", { cells: 0 });
      for (var i = 0; i < N; i++) {
        if (fine) {
          push(4, "Outer pass " + (i + 1) + " of " + N + ": <code>i</code> is " + i + ". The inner loop now runs from the beginning.", { cells: steps, rows: i, vars: { n: N, steps: steps, i: i } });
          for (var j = 0; j < N; j++) {
            steps++;
            push(6, "i = " + i + ", j = " + j + ": one more step (" + steps + ").", { cells: steps, cur: steps - 1, rows: i + (j === N - 1 ? 1 : 0), vars: { n: N, steps: steps, i: i, j: j } });
          }
        } else {
          steps += N;
          push(6, "Outer pass " + (i + 1) + " of " + fmt(N) + ": the inner loop ran all " + fmt(N) + " values of <code>j</code>, adding " + fmt(N) + " steps.",
            { cells: steps, rows: i + 1, hl: [4, 5], vars: { n: N, steps: steps, i: i, j: raw("0 … " + (N - 1)) } });
        }
      }
      out.push("n = " + N + ", steps = " + steps);
      var verdict = "";
      if (g !== null) {
        verdict = g === N * N ? " Your prediction, " + fmt(g) + ", was exactly right." :
          g === 2 * N ? " You predicted " + fmt(g) + " = " + N + " + " + N + ": you <strong>added</strong> when the loops <strong>multiply</strong>." :
          " You predicted " + fmt(g) + ".";
      }
      push(8, "<strong>" + fmt(steps) + " steps</strong> = " + N + " × " + N + ". The inner loop ran completely for every one of the " + N + " outer passes." + verdict,
        { cells: steps, rows: N, final: true, vars: { n: N, steps: steps } });
      return f;
    }
    function onFrame(fr) {
      var px = N <= 10 ? 36 : N <= 100 ? 4 : 2, size = N * px;
      if (cv.width !== size) { cv.width = size; cv.height = size; }
      var cBg = U.cssVar(host, "--bg-soft"), cOff = U.cssVar(host, "--surface-2"), cOn = U.cssVar(host, "--accent"), cCur = U.cssVar(host, "--blue");
      ctx.fillStyle = cBg; ctx.fillRect(0, 0, size, size);
      var gap = px >= 8 ? 3 : 0;
      if (gap) {
        for (var q = 0; q < N * N; q++) {
          var x = (q % N) * px, y = Math.floor(q / N) * px;
          ctx.fillStyle = q === fr.cur ? cCur : q < fr.cells ? cOn : cOff;
          ctx.fillRect(x + gap / 2, y + gap / 2, px - gap, px - gap);
        }
        ctx.font = "11px " + (U.cssVar(host, "--font-mono") || "monospace");
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (var t = 0; t < Math.min(fr.cells, N * N); t++) {
          ctx.fillStyle = U.cssVar(host, "--bg");
          ctx.fillText(String(t + 1), (t % N) * px + px / 2, Math.floor(t / N) * px + px / 2 + 1);
        }
      } else {
        ctx.fillStyle = cOff; ctx.fillRect(0, 0, size, size);
        var rows = Math.floor(fr.cells / N);
        ctx.fillStyle = cOn; ctx.fillRect(0, 0, size, rows * px);
        if (rows < N && rows > 0 && !fr.final) { ctx.fillStyle = cCur; ctx.fillRect(0, (rows - 1) * px, size, px); }
      }
      /* added vs multiplied */
      var added = 2 * N, max = N * N, g = guessOf(guess);
      var rowsHtml = [["if the loops added: n + n", added, "w3-b-add"], ["steps counted so far", fr.steps, "w3-b-now"]];
      if (g !== null && g > 0) rowsHtml.splice(1, 0, ["your prediction", g, "w3-b-you"]);
      var scale = Math.max(max, g || 0);
      bars.innerHTML = rowsHtml.map(function (r) {
        return '<div class="w3-brow"><span class="w3-blab">' + r[0] + '</span><span class="w3-btrack"><span class="w3-bar ' + r[2] + '" style="width:' +
          Math.max(0.4, r[1] / scale * 100) + '%"></span></span><b>' + fmt(r[1]) + "</b></div>";
      }).join("");
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: onFrame,
      fps: function () { return N === 5 ? 2.4 : N === 10 ? 9 : N === 100 ? 22 : 60; }
    });
    var row = h("div", "w3-nest");
    var gl = h("div", "");
    gl.appendChild(h("div", "ct-h", "one square per step · row = outer pass i, column = j"));
    cv = h("canvas", "w3-sq"); cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "An n by n grid that fills one row per outer pass");
    ctx = cv.getContext("2d");
    gl.appendChild(cv);
    var gr = h("div", "");
    gr.appendChild(h("div", "ct-h", "adding vs multiplying (to scale)"));
    bars = h("div", "w3-bars");
    gr.appendChild(bars);
    row.appendChild(gl); row.appendChild(gr);
    ct.extra.appendChild(row);
    ct.load();
  }
  AAAnim.register("w3-nested", nested);

  /* ============================================================
     Task 4 — w3-halving: ×10 input, only +3 or +4 reductions
     ============================================================ */
  function halving(host) {
    var START = 1000, results = {};
    var SIZES = [1000, 10000, 100000, 1000000];
    U.title(host, "Animation · halve until the size is 1, for bigger and bigger starts");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("start", SIZES.map(function (s) { return [s, fmt(s)]; }), START, function (v) { START = v; ct.load(); }));
    host.appendChild(opts);
    function code() {
      return "start = " + START + "\nremaining = start\nreductions = 0\n\nwhile remaining > 1:\n" +
        "    remaining = remaining // 2   # halve, rounding down\n    reductions = reductions + 1\n\n" +
        "print(f\"start {start}: {reductions} reductions\")";
    }
    var chain, bar, fill, tbl, chart;
    function build() {
      var f = [], out = [], rem = START, red = 0, sizes = [START];
      function push(line, note, ex) {
        var fr = { line: line, vars: { start: START, remaining: rem, reductions: red }, out: out.slice(), note: note, sizes: sizes.slice(), rem: rem,
          counters: { reductions: red } };
        if (ex) Object.keys(ex).forEach(function (k) { fr[k] = ex[k]; });
        f.push(fr);
      }
      push(0, "How many halvings take " + fmt(START) + " down to 1? Guess, then press <strong>play</strong>.", { vars: {} });
      push(3, "The starting size is now a variable, so one edit changes the whole experiment.");
      while (rem > 1) {
        var old = rem;
        if (red < 3) push(5, fmt(rem) + " &gt; 1 is True, so the loop body runs.");
        rem = Math.floor(rem / 2); red++; sizes.push(rem);
        push(7, fmt(old) + " // 2 = <strong>" + fmt(rem) + "</strong>" + (old % 2 ? " (rounded down)" : "") + ". Reduction " + red + ".", red > 3 ? { hl: [5, 6] } : { hl: [6] });
      }
      push(5, "1 &gt; 1 is False — the loop stops.");
      out.push("start " + START + ": " + red + " reductions");
      push(9, "", { finished: true, red: red });
      return f;
    }
    function drawResults() {
      tbl.rows(SIZES.map(function (s) {
        var r = results[s];
        return [fmt(s), r == null ? "?" : r, fmt(s * s)];
      }), SIZES.indexOf(START));
      var have = SIZES.filter(function (s) { return results[s] != null; });
      fitChart(host, chart);
      chart.draw([{ name: "reductions", color: "--accent", points: have.map(function (s) { return [s, results[s]]; }) }],
        { xr: [1000, 1000000], yr: [0, 20] });
    }
    function onFrame(fr) {
      var s = fr.sizes, show = s.length > 11 ? [s[0], "…"].concat(s.slice(-9)) : s;
      chain.innerHTML = show.map(function (x, j) {
        return x === "…" ? "<span>…</span>" : "<b" + (j === show.length - 1 ? ' class="now"' : "") + ">" + fmt(x) + "</b>";
      }).join(" &rarr; ");
      fill.style.width = Math.max(0.3, fr.rem / START * 100) + "%";
      if (fr.finished && results[START] == null) { results[START] = fr.red; drawResults(); }
      if (fr.finished) {
        var i = SIZES.indexOf(START), prev = i > 0 ? results[SIZES[i - 1]] : null;
        ct.msg.innerHTML = "<strong>" + fr.red + " reductions</strong> for " + fmt(START) + "." +
          (prev != null ? " Ten times the start of " + fmt(SIZES[i - 1]) + " added only <strong>" + (fr.red - prev) + "</strong>." : "") +
          (SIZES.every(function (x) { return results[x] != null; }) ? " The column reads 9, 13, 16, 19 — while the nested loop's n × n column explodes." :
            " Try the next size.");
      }
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: onFrame,
      fps: function (i, fr) { return fr[i] && fr[i].hl && fr[i].hl.length === 2 ? 4 : 1.3; }
    });
    ct.extra.appendChild(h("div", "ct-h", "size still left (bar drawn to scale)"));
    bar = h("div", "db-bar"); fill = h("div", "db-fill"); bar.appendChild(fill);
    ct.extra.appendChild(bar);
    chain = h("div", "w3-chain");
    ct.extra.appendChild(chain);
    var two = h("div", "w3-two");
    var left = h("div", ""), right = h("div", "");
    left.appendChild(h("div", "ct-h", "your record"));
    var tw = h("div", "anim-table-wrap"); left.appendChild(tw);
    tbl = U.table(tw, ["start", "reductions", "nested n × n"]);
    tbl.el.classList.add("w3-tbl");
    chart = U.LineChart(right, { logx: true, xlabel: "start", ylabel: "reductions", height: 300, label: "Reductions against the starting size, log scale" });
    two.appendChild(left); two.appendChild(right);
    ct.extra.appendChild(two);
    drawResults();
    ct.load();
  }
  AAAnim.register("w3-halving", halving);

  /* ============================================================
     Task 5 — w3-multiple: break stops the search at 63
     ============================================================ */
  function multiple(host) {
    var mode = "break";
    U.title(host, "Animation · check 1, 2, 3 … until one is a multiple of 7 and of 9");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("loop", [["break", "with break"], ["nobreak", "break removed"]], mode, function (v) { mode = v; ct.load(); }));
    var guess = numIn("Predicted count of numbers checked", "how many?");
    opts.appendChild(h("span", "lab", "numbers checked:"));
    opts.appendChild(guess);
    host.appendChild(opts);
    guess.addEventListener("change", function () { ct.load(); });
    function code() {
      return "steps = 0\nanswer = None\n\nfor k in range(1, 1000):\n    steps = steps + 1\n    if k % 7 == 0 and k % 9 == 0:\n        answer = k\n" +
        (mode === "break" ? "        break\n" : "") + "\nprint(f\"answer {answer}, checked {steps}\")";
    }
    function cond(k) {
      var a = k % 7 === 0;
      if (!a) return { v: false, txt: k + " % 7 == 0 is False, so <code>and</code> stops right there: False." };
      var b = k % 9 === 0;
      return { v: b, txt: k + " % 7 == 0 is True, and " + k + " % 9 == 0 is " + (b ? "True" : "False") + ": " + (b ? "<strong>True</strong>." : "False.") };
    }
    var grid, cv, ctx, cells = [], LIMIT = 70;
    function build() {
      var f = [], out = [], steps = 0, ans = null, brk = mode === "break", printLine = brk ? 10 : 9;
      function push(line, note, k, ex) {
        var fr = { line: line, vars: { steps: steps, answer: ans === null ? NONE : ans }, out: out.slice(), note: note, k: k, ans: ans,
          counters: { "numbers checked": fmt(steps), answer: ans === null ? "None" : ans } };
        if (k) fr.vars.k = k;
        if (ex) Object.keys(ex).forEach(function (x) { fr[x] = ex[x]; });
        f.push(fr);
      }
      push(0, "Predict: how many numbers will the loop check" + (brk ? "" : " now that <code>break</code> is gone") + "? Then press <strong>play</strong>.", 0);
      push(2, "<code>answer</code> starts as <code>None</code> — \"nothing found yet\".", 0);
      for (var k = 1; k < 1000; k++) {
        steps++;
        var c = cond(k), slow = k <= 3 || (k >= 61 && k <= 63) || (!brk && k % 63 === 0 && k <= 126);
        if (slow) {
          push(4, "<code>k</code> is " + k + ".", k, { hl: [5] });
          push(6, c.txt, k);
        } else {
          push(6, "k = " + k + ": " + c.txt, k, { hl: [4, 5], fast: true });
        }
        if (c.v) {
          ans = k;
          push(7, "Found one: <code>answer</code> = " + k + ".", k);
          if (brk) {
            push(8, "<code>break</code> leaves the loop immediately — the numbers 64 to 999 are never checked.", k, { brk: true });
            break;
          } else if (slow) {
            push(7, "No <code>break</code>, so the loop just carries on — and will overwrite <code>answer</code> at the next multiple.", k);
          }
        }
      }
      out.push("answer " + ans + ", checked " + steps);
      var g = guessOf(guess), verdict = g === null ? "" : g === steps ? " Your prediction was right." : " You predicted " + fmt(g) + ".";
      var lastK = steps;
      push(printLine, brk ? "<strong>answer 63, checked 63</strong>. 63 = 7 × 9 is the first number both divide, so exactly 63 numbers were checked." + verdict +
        " Now remove the <code>break</code>." :
        "<strong>checked " + fmt(steps) + "</strong> — the loop ground on to 999. And <code>answer</code> is now " + ans + ", the <em>last</em> multiple of 63, not the first." + verdict,
        lastK, { finished: true });
      return f;
    }
    function paint(fr) {
      var brk = mode === "break";
      grid.style.display = brk ? "" : "none";
      cv.style.display = brk ? "none" : "";
      if (brk) {
        if (!cells.length) {
          for (var v = 1; v <= LIMIT; v++) { var c = h("div", "cell", String(v)); grid.appendChild(c); cells.push(c); }
        }
        cells.forEach(function (c, j) {
          var v = j + 1, cls = "cell";
          if (v <= fr.k) {
            cls += v % 63 === 0 ? " gold" : v % 7 === 0 ? " w3-m7" : v % 9 === 0 ? " w3-m9" : " w3-seen";
            if (v === fr.k && !fr.finished && !fr.brk) cls += " on";
          } else if (fr.finished || fr.brk) cls += " dim";
          c.className = cls;
        });
      } else {
        var COLS = 37, px = 18, rows = Math.ceil(999 / COLS);
        if (cv.width !== COLS * px) { cv.width = COLS * px; cv.height = rows * px; }
        var cBg = U.cssVar(host, "--bg-soft"), cOff = U.cssVar(host, "--surface-2"), cSeen = U.cssVar(host, "--border-strong"),
          c7 = U.cssVar(host, "--blue"), c9 = U.cssVar(host, "--green"), cG = U.cssVar(host, "--accent"), cR = U.cssVar(host, "--red");
        ctx.fillStyle = cBg; ctx.fillRect(0, 0, cv.width, cv.height);
        for (var q = 1; q <= 999; q++) {
          var x = ((q - 1) % COLS) * px, y = Math.floor((q - 1) / COLS) * px, seen = q <= fr.k;
          ctx.fillStyle = !seen ? cOff : q % 63 === 0 ? (q === fr.ans ? cG : cR) : q % 7 === 0 ? c7 : q % 9 === 0 ? c9 : cSeen;
          ctx.globalAlpha = seen && q % 63 !== 0 && (q % 7 === 0 || q % 9 === 0) ? 0.55 : 1;
          ctx.fillRect(x + 1.5, y + 1.5, px - 3, px - 3);
        }
        ctx.globalAlpha = 1;
      }
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: paint,
      fps: function (i, fr) { return fr[i] && fr[i].fast && fr[i + 1] && fr[i + 1].fast ? (mode === "break" ? 9 : 160) : 1.3; }
    });
    ct.extra.appendChild(h("div", "ct-h w3-legend", '<span class="w3-k7">multiple of 7</span> <span class="w3-k9">multiple of 9</span> <span class="w3-kg">both</span>' +
      ' <span class="w3-kr">earlier “both”, overwritten</span>'));
    grid = h("div", "arr w3-mgrid");
    ct.extra.appendChild(grid);
    cv = h("canvas", "w3-mcanvas"); cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "The numbers 1 to 999 as small squares, shaded as they are checked");
    ctx = cv.getContext("2d");
    ct.extra.appendChild(cv);
    ct.load();
  }
  AAAnim.register("w3-multiple", multiple);

  /* ============================================================
     Task 6 — w3-fizzbuzz: the first true branch wins
     ============================================================ */
  function fizzbuzz(host) {
    var order = "good", mode = "watch";
    var PROGS = {
      good: {
        code: 'for n in range(1, 21):\n    if n % 3 == 0 and n % 5 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n' +
          '    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)',
        tests: [["both", 2, 3, "FizzBuzz"], ["3", 4, 5, "Fizz"], ["5", 6, 7, "Buzz"]]
      },
      bad: {
        code: 'for n in range(1, 21):\n    if n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n' +
          '    elif n % 3 == 0 and n % 5 == 0:\n        print("FizzBuzz")\n    else:\n        print(n)',
        tests: [["3", 2, 3, "Fizz"], ["5", 4, 5, "Buzz"], ["both", 6, 7, "FizzBuzz"]]
      }
    };
    U.title(host, "Animation · Python takes the first branch that is true");
    var opts = h("div", "anim-opts w3-opts");
    opts.appendChild(U.seg("branch order", [["good", "“both” test first"], ["bad", "“Fizz” test first"]], order, function (v) { order = v; reset(); }));
    opts.appendChild(U.seg("mode", [["watch", "watch it"], ["you", "you be Python"]], mode, function (v) { mode = v; reset(); }));
    host.appendChild(opts);

    var strip = h("div", "w3-fb");
    host.appendChild(strip);
    var tiles = [];
    for (var n = 1; n <= 20; n++) {
      var t = h("div", "w3-fbt", '<span class="num">' + n + '</span><span class="said"></span>');
      strip.appendChild(t); tiles.push(t);
    }
    function evalTest(kind, n) {
      if (kind === "3") return { v: n % 3 === 0, txt: n + " % 3 == 0 is " + (n % 3 === 0 ? "True" : "False") };
      if (kind === "5") return { v: n % 5 === 0, txt: n + " % 5 == 0 is " + (n % 5 === 0 ? "True" : "False") };
      var a = n % 3 === 0;
      if (!a) return { v: false, txt: n + " % 3 == 0 is False, so the <code>and</code> is False" };
      var b = n % 5 === 0;
      return { v: b, txt: n + " % 3 == 0 is True and " + n + " % 5 == 0 is " + (b ? "True" : "False") + ", so the <code>and</code> is " + (b ? "True" : "False") };
    }
    function runProg(prog) {   /* [{n, said, checks:[...], branch}] */
      var res = [];
      for (var n = 1; n <= 20; n++) {
        var checks = [], said = null, line = 9;
        for (var q = 0; q < prog.tests.length; q++) {
          var T = prog.tests[q], e = evalTest(T[0], n);
          checks.push({ line: T[1], txt: e.txt, v: e.v });
          if (e.v) { said = T[3]; line = T[2]; break; }
        }
        if (said === null) { checks.push({ line: 8, txt: "Nothing above was true, so the <code>else</code> branch runs", v: true }); said = String(n); }
        res.push({ n: n, said: said, checks: checks, line: line });
      }
      return res;
    }
    function correctSaid(n) { return n % 15 === 0 ? "FizzBuzz" : n % 3 === 0 ? "Fizz" : n % 5 === 0 ? "Buzz" : String(n); }

    var ctBox = h("div", "");
    host.appendChild(ctBox);
    function build() {
      var prog = PROGS[order], res = runProg(prog), f = [], out = [], conds = 0, visited = 0;
      function push(line, note, ex) {
        var fr = { line: line, vars: ex.n ? { n: ex.n } : {}, out: out.slice(), note: note, upto: ex.upto, cur: ex.n || 0,
          counters: { "numbers visited": visited, "conditions checked": conds }, slow: ex.slow };
        f.push(fr);
      }
      push(0, "Twenty numbers, one pass each. Watch which test catches each number — especially 15. Press <strong>play</strong>.", { upto: 0, slow: true });
      res.forEach(function (r) {
        var slow = r.n <= 5 || r.n === 15;
        visited++;
        push(1, "Pass " + r.n + ": <code>n</code> is " + r.n + ".", { n: r.n, upto: r.n - 1, slow: slow });
        r.checks.forEach(function (c, q) {
          if (c.line !== 8) conds++;
          var more = c.v ? (c.line === 8 ? "." : " — take this branch and <strong>skip the rest</strong>.") : " — try the next test.";
          push(c.line, c.txt + more, { n: r.n, upto: r.n - 1, slow: slow });
        });
        out.push(r.said);
        var wrong = r.said !== correctSaid(r.n);
        push(r.line, wrong ? "It prints <strong>" + r.said + "</strong> — but 15 is a multiple of both! The Fizz test was true first, so the FizzBuzz test was never even checked."
          : "Print <strong>" + r.said + "</strong>.", { n: r.n, upto: r.n, slow: slow });
      });
      var bad = res.filter(function (r) { return r.said !== correctSaid(r.n); });
      push(0, order === "good" ? "All 20 correct. " + visited + " passes and " + conds + " condition checks — the pass count is n, however the branches are ordered. Now try the <em>Fizz test first</em> order."
        : "Wrong output for <strong>" + bad.map(function (r) { return r.n; }).join(", ") + "</strong>: it printed Fizz. In this order the FizzBuzz branch can <em>never</em> run — any multiple of 15 is already caught by the Fizz test.",
        { upto: 20, slow: true });
      f.forEach(function (fr) { fr.res = res; });
      return f;
    }
    function paint(res, upto, cur) {
      tiles.forEach(function (t, j) {
        var r = res[j], shown = j < upto, wrong = shown && r.said !== correctSaid(r.n);
        t.className = "w3-fbt" + (j + 1 === cur ? " on" : "") + (shown ? " done" : "") + (wrong ? " bad" : "") +
          (shown && r.said === "FizzBuzz" ? " fz" : shown && r.said === "Fizz" ? " f3" : shown && r.said === "Buzz" ? " f5" : "");
        t.querySelector(".said").textContent = shown ? r.said : "";
      });
    }
    var ct = U.CodeTrace(ctBox, {
      code: function () { return PROGS[order].code; }, build: build,
      onFrame: function (fr) { paint(fr.res, fr.upto, fr.cur); },
      fps: function (i, fr) { return fr[i] && fr[i].slow ? 1.3 : 7; }
    });

    /* you be Python */
    var you = h("div", "w3-you");
    var ask = h("p", "anim-msg");
    var row = h("div", "anim-opts w3-opts");
    var youStats = h("div", "anim-stats");
    you.appendChild(ask); you.appendChild(row); you.appendChild(youStats);
    host.appendChild(you);
    var yn = 1, slips = 0, yres = [], busy = false;
    function choices(n) { return ["FizzBuzz", "Fizz", "Buzz", String(n)]; }
    function youShow() {
      paint(yres, yn - 1, yn <= 20 ? yn : 0);
      youStats.innerHTML = '<span class="anim-stat">answered<b>' + (yn - 1) + ' / 20</b></span><span class="anim-stat">slips<b>' + slips + "</b></span>";
      row.innerHTML = "";
      if (yn > 20) {
        ask.innerHTML = "Done! " + (slips ? slips + " slip" + (slips > 1 ? "s" : "") + " on the way. " : "No slips at all. ") +
          (order === "bad" ? "You followed the badly ordered program faithfully — which is why 15 had to be Fizz." : "Switch to the <em>Fizz test first</em> order and be Python for that program too.");
        return;
      }
      ask.innerHTML = "<code>n</code> is <strong>" + yn + "</strong>. Following the program " + (order === "good" ? "(“both” test first)" : "(<strong>Fizz</strong> test first)") +
        " exactly as written, what does it print?";
      choices(yn).forEach(function (c) {
        row.appendChild(btn(c, "", function () { answer(c); }));
      });
    }
    function answer(c) {
      if (busy) return;
      var r = yres[yn - 1];
      if (c !== r.said) {
        slips++;
        var first = r.checks.filter(function (x) { return x.v; })[0];
        ask.innerHTML = "Not what Python does. Check the tests top to bottom: " + r.checks.map(function (x) { return x.txt; }).join("; ") +
          ". The first true one decides. Try again.";
        youStats.innerHTML = '<span class="anim-stat">answered<b>' + (yn - 1) + ' / 20</b></span><span class="anim-stat">slips<b>' + slips + "</b></span>";
        return;
      }
      yn++; busy = true;
      paint(yres, yn - 1, 0);
      setTimeout(function () { busy = false; youShow(); }, U.REDUCED ? 0 : 250);
    }
    function reset() {
      ct.stop();
      if (mode === "watch") { you.style.display = "none"; ctBox.style.display = ""; ct.load(); }
      else { ctBox.style.display = "none"; you.style.display = ""; yres = runProg(PROGS[order]); yn = 1; slips = 0; youShow(); }
    }
    reset();
  }
  AAAnim.register("w3-fizzbuzz", fizzbuzz);
})();
