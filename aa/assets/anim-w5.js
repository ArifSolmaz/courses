/* ============================================================
   AA — week 5 "Try it yourself" animations (functions, stopwatch)
   w5-contains, w5-worst, w5-dishonest, w5-warmup, w5-timeit, w5-noise
   Timing tasks use a documented step-count cost MODEL (see below) with
   seeded noise — the browser cannot run the page's Python.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt;

  /* ---------- the timing model (shared by tasks 2–6) ----------
     seconds = steps × per-step cost, plus noise:
       · sum_to: 41.3 ns per loop step (the §5.6 timeit figure: 41.30 µs for sum_to(1000))
       · contains: 20 ns per look;   list(range(n)): 20 ns per item
       · every perf_counter pair adds 0.25 µs of overhead and 0–12 µs of jitter
       · each run is up to ±0.3 % slower or faster at random
       · "disturbances" (other programs, the OS) arrive about 4 times per second
         and cost about 0.25 ms each                                                   */
  var M = { sum: 41.3e-9, look: 20e-9, build: 20e-9, over: 0.25e-6, jit: 12e-6, rel: 0.003, rate: 4, dist: 0.25e-3 };
  function gauss(r) { var u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function poisson(l, r) {
    if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss(r)));
    var L = Math.exp(-l), k = 0, p = 1;
    do { k++; p *= r(); } while (p > L);
    return k - 1;
  }
  /* one perf_counter measurement of work that truly takes `sec` seconds */
  function measure(sec, r) {
    var t = sec * (1 + M.rel * (2 * r() - 1)) + M.over + r() * r() * M.jit;
    var k = poisson(M.rate * sec, r);
    for (var i = 0; i < k; i++) t += M.dist * (0.6 + 0.8 * r());
    return t;
  }
  function simNote(parent, extra) {
    parent.appendChild(h("p", "note-sim", "Simulated timings from a step-count model (" + extra +
      "; plus random jitter and 0.25 ms disturbances) — run the real code in Colab for your own numbers."));
  }

  /* ---------- Python-ish formatting ---------- */
  function fx(v, d) { return Number(v).toFixed(d); }
  function padL(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }
  function pyList(a) { return "[" + a.join(", ") + "]"; }
  function mu(sec) { return fx(sec * 1e6, 2) + " µs"; }
  function ms(sec) { return fx(sec * 1e3, 3) + " ms"; }
  function niceT(sec) { return sec < 1e-3 ? mu(sec) : sec < 1 ? ms(sec) : fx(sec, 3) + " s"; }

  function predictRow(host, label, options, onPick) {
    var row = h("div", "anim-opts");
    row.appendChild(h("span", "lab", label));
    var bs = options.map(function (o) {
      var b = btn(o[1], "", function () {
        bs.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onPick(o[0]);
      });
      b.setAttribute("aria-pressed", "false");
      row.appendChild(b);
      return b;
    });
    host.appendChild(row);
    return { clear: function () { bs.forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); } };
  }

  /* ============================================================
     Task 1 — contains(data, target)
     ============================================================ */
  function contains(host) {
    host.classList.add("w5-wide");
    U.title(host, "Animation · a function call, and a return that leaves early");
    var mode = "page", pick = null, myData = [7, 1, 8, 2], myT = 2;
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("test", [["page", "the page's two calls"], ["mine", "my own call"]], "page", function (v) { mode = v; mine.style.display = v === "mine" ? "" : "none"; ct.load(); }));
    host.appendChild(opts);
    var mine = h("div", "anim-opts");
    mine.style.display = "none";
    mine.appendChild(h("span", "lab", "data"));
    var dIn = h("input", "w5-text"); dIn.type = "text"; dIn.value = myData.join(", "); dIn.setAttribute("aria-label", "List of whole numbers");
    mine.appendChild(dIn);
    mine.appendChild(h("span", "lab", "target"));
    var tIn = h("input"); tIn.type = "number"; tIn.value = String(myT); tIn.setAttribute("aria-label", "Target");
    mine.appendChild(tIn);
    mine.appendChild(btn("run this call", "", function () {
      var v = dIn.value.split(/[,\s]+/).filter(Boolean).map(function (x) { return parseInt(x, 10); });
      var t = parseInt(tIn.value, 10);
      if (!v.length || v.length > 8 || v.some(isNaN) || isNaN(t)) { ct.msg.innerHTML = "Type 1 to 8 whole numbers and a whole-number target."; return; }
      myData = v; myT = t; dIn.value = v.join(", "); ct.load();
    }));
    host.appendChild(mine);
    var pr = predictRow(host, "predict the page's output:", [["True False", "True False"], ["True True", "True True"], ["False False", "False False"]], function (v) { pick = v; });

    function calls() { return mode === "page" ? [[[3, 9, 4], 9], [[3, 9, 4], 5]] : [[myData, myT]]; }
    function code() {
      var cs = calls().map(function (c) { return "contains(" + pyList(c[0]) + ", " + c[1] + ")"; });
      return "def contains(data, target):\n    for item in data:\n        if item == target:\n" +
        "            return True      # return leaves the function immediately\n    return False\n\nprint(" + cs.join(", ") + ")";
    }
    function build() {
      var C = calls(), f = [], results = [], total = 0;
      function fr(line, ci, k, note, extra) {
        var v = {};
        if (ci >= 0) { v.data = C[ci][0].slice(); v.target = C[ci][1]; if (k >= 0) v.item = C[ci][0][k]; }
        var e = { line: line, ci: ci, k: k, results: results.slice(), vars: v, note: note, out: [],
          counters: { "calls finished": results.length + " / " + C.length, "total looks": total } };
        for (var x in extra) e[x] = extra[x];
        f.push(e);
      }
      fr(0, -1, -1, mode === "page" ? "Pick a prediction above, then press <strong>play</strong>." : "Press <strong>play</strong> to follow your call.");
      fr(1, -1, -1, "<code>def</code> only <em>teaches</em> Python the word <code>contains</code>. Nothing is searched yet, nothing is printed.", { hl: [2, 3, 4, 5] });
      fr(7, -1, -1, "<code>print</code> needs " + (C.length > 1 ? "both values, so Python makes the calls left to right." : "the value, so Python makes the call."));
      C.forEach(function (c, ci) {
        fr(1, ci, -1, "Call " + (ci + 1) + ": the parameters are filled in fresh — <code>data = " + pyList(c[0]) + "</code>, <code>target = " + c[1] + "</code>.");
        var hit = false;
        for (var k = 0; k < c[0].length; k++) {
          total++;
          fr(2, ci, k, "<code>item</code> is " + c[0][k] + ".");
          hit = c[0][k] === c[1];
          fr(3, ci, k, c[0][k] + " == " + c[1] + "? " + (hit ? "<strong>Yes.</strong>" : "No — go on to the next item."));
          if (hit) {
            fr(4, ci, k, "<code>return True</code> hands the answer back <strong>and leaves the function</strong> — " +
              (k < c[0].length - 1 ? "the remaining item" + (c[0].length - k - 1 > 1 ? "s are" : " is") + " never looked at." : "that was the last item anyway."), { ret: "True" });
            break;
          }
        }
        if (!hit) fr(5, ci, -1, "The loop ran out without a match, so we reach <code>return False</code>.", { ret: "False" });
        results.push(hit ? "True" : "False");
        fr(7, -1, -1, "Back in <code>print</code>: call " + (ci + 1) + " gave <strong>" + results[ci] + "</strong>.");
      });
      var last = f[f.length - 1];
      last.out = [results.join(" ")];
      last.final = true;
      return f;
    }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: 1.3 });
    var stack = h("div", "w5-calls"); ct.extra.appendChild(stack);
    function onFrame(fr) {
      var C = calls();
      stack.innerHTML = C.map(function (c, ci) {
        var state = ci < fr.results.length ? "done" : ci === fr.ci ? "run" : "wait";
        var cells = c[0].map(function (v, k) {
          var cls = "cell";
          if (state === "run" && fr.k < 0 && fr.ret) cls += " bad";
          else if (state === "run" && k === fr.k) cls += fr.ret ? " good" : " on";
          else if (state === "run" && k < fr.k) cls += " dim";
          else if (state === "done" && fr.results[ci] === "True" && k > c[0].indexOf(c[1])) cls += " dim";
          else if (state === "done" && fr.results[ci] === "True" && k === c[0].indexOf(c[1])) cls += " good";
          else if (state === "done") cls += " dim";
          return "<div class='" + cls + "'>" + v + "</div>";
        }).join("");
        var tag = state === "done" ? "returned <b>" + fr.results[ci] + "</b>" : state === "run" ? (fr.ret ? "returning <b>" + fr.ret + "</b>…" : "running") : "waiting";
        return "<div class='w5-call " + state + "'><div class='w5-call-h'><code>contains(" + pyList(c[0]) + ", " + c[1] + ")</code><span>" + tag + "</span></div>" +
          "<div class='arr'>" + cells + "</div></div>";
      }).join("");
      if (fr.final) {
        var r = fr.results.join(" ");
        ct.msg.innerHTML = "Printed <strong>" + r + "</strong>. " +
          (mode === "page" ? "The first call stopped after 2 looks — <code>return</code> leaves at once, so 4 was never checked. The second call is the worst case: all 3 items, then <code>return False</code>. " +
            (pick == null ? "" : pick === r ? "Your prediction was right." : "You predicted " + pick + ".")
            : "One function, any input: the parameters are refilled for every call.");
      }
    }
    ct.load();
  }

  /* ============================================================
     Tasks 2 & 3 — the doubling table for contains (honest / dishonest)
     ============================================================ */
  function bench(host, dishonestTask) {
    host.classList.add("w5-stack");
    U.title(host, dishonestTask ? "Animation · what is inside the timed region?" : "Animation · worst-case search, timed at doubling sizes");
    var inside = false, small = false, seed = 11, pick = null, guessInp = null;
    var opts = h("div", "anim-opts");
    if (dishonestTask) {
      opts.appendChild(U.seg("list built", [[false, "before start (Task 2)"], [true, "inside the timed region"]], false, function (v) { inside = v; ct.load(); }));
    } else {
      opts.appendChild(U.seg("sizes", [[false, "100 000 … 800 000"], [true, "100 … 800 (too small)"]], false, function (v) { small = v; ct.load(); }));
    }
    opts.appendChild(btn("run again", "", function () { seed++; ct.load(); }, "Take a fresh set of simulated measurements"));
    host.appendChild(opts);
    if (dishonestTask) {
      predictRow(host, "predict, with the build inside:", [["a", "times grow, ratios ≈ 2"], ["b", "times grow, ratios go wild"], ["c", "nothing changes"]], function (v) { pick = v; });
    } else {
      var pr = h("div", "anim-opts");
      pr.appendChild(h("span", "lab", "your predicted ratio:"));
      guessInp = h("input"); guessInp.type = "number"; guessInp.step = "0.1"; guessInp.placeholder = "ratio?"; guessInp.setAttribute("aria-label", "Predicted ratio");
      pr.appendChild(guessInp);
      host.appendChild(pr);
    }

    function sizes() { return small ? [100, 200, 400, 800] : [100000, 200000, 400000, 800000]; }
    function code() {
      var build = "    data = list(range(n))" + (inside ? "            # now INSIDE the timed region" : "            # built BEFORE the clock starts") + "\n";
      return "sizes = [" + sizes().join(", ") + "]\n" +
        "print(f\"{'n':>10} {'seconds':>12} {'ratio':>8}\")\nprevious = None\nfor n in sizes:\n" +
        (inside ? "" : build) +
        "    start = time.perf_counter()\n" +
        (inside ? build : "") +
        "    contains(data, -1)                 # -1 is missing: a full pass\n" +
        "    t = time.perf_counter() - start\n" +
        "    ratio = t / previous if previous else 1.0\n" +
        "    print(f\"{n:>10} {t:>12.5f} {ratio:>8.2f}\")\n    previous = t";
    }
    /* line numbers (1-based) */
    var LN = { sizes: 1, head: 2, prev: 3, loop: 4 };
    function lines() {
      return inside ? { start: 5, build: 6, search: 7, t: 8, ratio: 9, print: 10, keep: 11 }
                    : { build: 5, start: 6, search: 7, t: 8, ratio: 9, print: 10, keep: 11 };
    }
    var store = {};           /* results by variant for the comparison table */
    function sample(n, variant, r) {
      var search = n * M.look, bld = n * M.build;
      var timed = variant ? bld + search : search;
      return { t: measure(timed, r), search: search, build: variant ? bld : 0 };
    }
    function build() {
      /* each placement has its own fixed random stream, so toggling never changes the other's numbers */
      var r = U.rng(seed + (inside ? 1000 : 0)), other = U.rng(seed + (inside ? 0 : 1000));
      var S = sizes(), L = lines(), f = [], out = [], rows = [], prev = null;
      var hdr = padL("n", 10) + " " + padL("seconds", 12) + " " + padL("ratio", 8);
      function fr(line, n, note, extra) {
        var v = {};
        if (line !== 0 && line !== LN.sizes) v.previous = prev == null ? null : +fx(prev, 5);
        if (n != null) v.n = n;
        var e = { line: line, n: n, rows: rows.slice(), vars: v, note: note, out: out.slice(),
          hl: [L.start, L.search, L.t].concat(inside ? [L.build] : []).sort(), counters: {} };
        for (var x in extra) e[x] = extra[x];
        f.push(e);
      }
      fr(0, null, dishonestTask ? "Choose where the list is built, predict, then press <strong>play</strong>. The shaded lines are the timed region."
        : "Predict the ratio column, then press <strong>play</strong>. The shaded lines are the timed region.");
      fr(LN.sizes, null, "Four sizes, each double the last.");
      out.push(hdr);
      fr(LN.head, null, "Print the table header.");
      fr(LN.prev, null, "No previous time yet, so the first ratio will be 1.0.");
      var res = S.map(function (n) { return sample(n, inside, r); });
      var alt = S.map(function (n) { return sample(n, !inside, other); });
      store[inside ? "in" : "out"] = { S: S, res: res };
      store[inside ? "out" : "in"] = { S: S, res: alt };
      S.forEach(function (n, k) {
        var m = res[k];
        fr(LN.loop, n, "<code>n = " + fmt(n) + "</code>.");
        if (!inside) fr(L.build, n, "Build the " + fmt(n) + "-item list — the clock is <strong>not</strong> running yet.", { phase: "build" });
        fr(L.start, n, "Start the stopwatch.", { phase: "start" });
        if (inside) fr(L.build, n, "Build the list — <strong>while the clock runs</strong>. This time lands in <code>t</code>.", { phase: "build", timing: true });
        fr(L.search, n, "Search for −1: it is not there, so all " + fmt(n) + " items are looked at.", { phase: "search", timing: true });
        var ratio = prev ? m.t / prev : 1.0;
        rows.push({ n: n, t: m.t, ratio: ratio, m: m });
        fr(L.t, n, "Stop: <code>t = " + fx(m.t, 5) + "</code> s" + (inside ? " (build + search)." : " (search only)."), { phase: "stop", cur: k });
        fr(L.ratio, n, prev ? "ratio = " + fx(m.t, 5) + " / " + fx(prev, 5) + " = <strong>" + fx(ratio, 2) + "</strong>" : "First size: ratio is 1.0 by definition.", { cur: k });
        out.push(padL(n, 10) + " " + padL(fx(m.t, 5), 12) + " " + padL(fx(ratio, 2), 8));
        fr(L.print, n, "One row of the table.", { cur: k });
        prev = m.t;
        fr(L.keep, n, "Save this time in previous for the next ratio.", { cur: k });
      });
      f[f.length - 1].final = true;
      return f;
    }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, outTitle: "output",
      fps: function (i) { return i < 10 ? 1.3 : 2.4; } });
    var vis = h("div", "w5-bench");
    ct.extra.appendChild(vis);
    var tw = null, tab = null;
    var charts = {};
    if (!dishonestTask) {
      /* plotted in ms (or µs for tiny n): the shared axis labels print very small numbers as 1-digit exponents */
      charts.big = U.LineChart(ct.extra, { xlabel: "n (list size)", ylabel: "milliseconds", height: 260, label: "Measured time against list size" });
      charts.small = U.LineChart(ct.extra, { xlabel: "n (list size)", ylabel: "microseconds", height: 260, label: "Measured time against list size" });
    }
    else {
      tw = h("div", "anim-table-wrap"); ct.extra.appendChild(tw);
      tab = U.table(tw, ["n", "before: s", "ratio", "inside: s", "ratio"]);
    }
    simNote(ct.extra, dishonestTask ? "contains: 20 ns per look; list(range(n)): 20 ns per item" : "contains: 20 ns per look");

    function onFrame(fr) {
      /* timeline bars: what the stopwatch saw for each n */
      var S = sizes(), maxT = 0;
      fr.rows.forEach(function (r) { maxT = Math.max(maxT, r.t); });
      var scale = Math.max(maxT, S[S.length - 1] * (M.look + (inside ? M.build : 0)) * 1.02);
      vis.innerHTML = "<div class='w5-bh'><span>n</span><span>what the stopwatch measured" + (dishonestTask ? " — <i class='w5-k b'></i>building the list <i class='w5-k s'></i>searching" : "") + "</span></div>" +
        S.map(function (n, k) {
          var r = fr.rows[k], inner = "", lab = "";
          if (r) {
            var bw = r.m.build / scale * 100, sw = (r.t - r.m.build) / scale * 100;
            inner = (bw ? "<div class='w5-seg b' style='width:" + bw + "%'></div>" : "") + "<div class='w5-seg s' style='width:" + sw + "%'></div>";
            lab = (small ? mu(r.t) : fx(r.t, 5) + " s") + " · ×" + fx(r.ratio, 2);
          } else if (fr.n === n && fr.phase) {
            var partial = fr.phase === "build" && inside ? "<div class='w5-seg b run' style='width:" + (n * M.build / scale * 100) + "%'></div>" : "";
            if (fr.phase === "search") partial = (inside ? "<div class='w5-seg b' style='width:" + (n * M.build / scale * 100) + "%'></div>" : "") +
              "<div class='w5-seg s run' style='width:" + (n * M.look / scale * 100) + "%'></div>";
            inner = partial;
            lab = fr.phase === "build" && !inside ? "building… (clock off)" : "clock running…";
          }
          return "<div class='w5-brow" + (fr.n === n ? " on" : "") + "'><span>" + fmt(n) + "</span><div class='w5-track'>" + inner + "</div><em>" + lab + "</em></div>";
        }).join("");
      if (!dishonestTask) {
        var unit = small ? 1e6 : 1e3, chart = small ? charts.small : charts.big;
        charts.small.el.style.display = small ? "" : "none";
        charts.big.el.style.display = small ? "none" : "";
        var pts = fr.rows.map(function (r) { return [r.n, r.t * unit]; });
        var ideal = S.map(function (n) { return [n, n * M.look * unit]; });
        chart.draw([{ name: "measured (simulated)", color: "--accent", points: pts.length ? pts : [[S[0], 0]], noDots: !pts.length },
          { name: "model: steps × cost", color: "--blue", points: ideal, dashed: true, noDots: true }], { xr: [0, S[S.length - 1]] });
      }
      if (tab) {
        var a = store.out, b = store["in"], rws = [];
        if (a && b && fr.final) {
          a.S.forEach(function (n, k) {
            rws.push([fmt(n), fx(a.res[k].t, 5), k ? fx(a.res[k].t / a.res[k - 1].t, 2) : "1.00",
              fx(b.res[k].t, 5), k ? fx(b.res[k].t / b.res[k - 1].t, 2) : "1.00"]);
          });
        }
        tw.style.display = rws.length ? "" : "none";
        tab.rows(rws);
      }
      if (fr.final) {
        var rs = fr.rows.slice(1).map(function (r) { return fx(r.ratio, 2); }).join(", ");
        if (!dishonestTask) {
          var g = guessInp ? parseFloat(guessInp.value) : NaN;
          ct.msg.innerHTML = small
            ? "Ratios: <strong>" + rs + "</strong>. At a few microseconds per run, the clock overhead and jitter are as big as the search itself — the ratios are noise, and the seconds column barely has any digits left. Grow n."
            : "Ratios: <strong>" + rs + "</strong> — close to 2.0. A missing item forces a full pass, so doubling the list doubles the time." +
              (isNaN(g) ? "" : Math.abs(g - 2) < 0.25 ? " Your prediction (" + g + ") matches." : " You predicted " + g + ".") +
              " Press <strong>run again</strong>: the seconds wobble, the ratios stay near 2.";
        } else {
          ct.msg.innerHTML = (inside
            ? "Ratios <strong>" + rs + "</strong> still look linear, but every time is bigger: <code>t</code> now holds “build a list of n items” <em>plus</em> the search. "
            : "Build outside: <code>t</code> is search time only, ratios <strong>" + rs + "</strong>. ") +
            "The table compares both placements on the same sizes. The inside version is a fair <em>end-to-end</em> measurement if labelled so — it just cannot isolate search cost." +
            (pick == null ? "" : pick === "a" ? " Your prediction was right." : " Your prediction: compare it with the table.");
        }
      }
    }
    ct.load();
  }
  function worst(host) { bench(host, false); }
  function dishonest(host) { bench(host, true); }

  /* ============================================================
     Task 4 — the warm-up run
     ============================================================ */
  function warmup(host) {
    host.classList.add("w5-stack");
    U.title(host, "Animation · eight runs, and what dropping run 1 changes");
    var scen = "cold", seed = 5, pick = null;
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("this time, run 1 is", [["cold", "slow (cold start)"], ["fast", "the fastest"], ["none", "ordinary"]], "cold", function (v) { scen = v; ct.load(); }));
    opts.appendChild(btn("new samples", "", function () { seed++; ct.load(); }));
    host.appendChild(opts);
    predictRow(host, "predict: dropping run 1 changes most —", [["min", "the fastest"], ["mean", "the mean"], ["same", "neither"]], function (v) { pick = v; });

    var CODE = "import time\ntimes = []\nfor run in range(8):\n    start = time.perf_counter()\n    sum_to(2000000)\n" +
      "    elapsed = time.perf_counter() - start\n    times.append(elapsed)\n    print(f\"run {run + 1}: {elapsed:.5f} s\")\n\n" +
      "rest = times[1:]                          # drop run 1\n" +
      "print(f\"all 8:    fastest {min(times):.5f}  mean {sum(times) / 8:.5f}\")\n" +
      "print(f\"runs 2-8: fastest {min(rest):.5f}  mean {sum(rest) / 7:.5f}\")";
    function samples() {
      var r = U.rng(seed * 31 + (scen === "cold" ? 1 : scen === "fast" ? 2 : 3)), base = 2000000 * M.sum, t = [];
      for (var i = 0; i < 8; i++) {
        var x = measure(base, r);
        if (i > 0 && scen === "fast") x += base * (0.02 + 0.03 * r());     /* e.g. the CPU slowed down after run 1 */
        t.push(x);
      }
      if (scen === "cold") t[0] += base * (0.3 + 0.1 * r());              /* one-off start-up costs */
      if (scen === "fast") t[0] = base * (1 - 0.004);
      return t;
    }
    function stat(a) { var mn = Math.min.apply(null, a), s = 0; a.forEach(function (x) { s += x; }); return { min: mn, mean: s / a.length }; }
    var T = [];
    function build() {
      T = samples();
      var f = [], out = [], done = [];
      function fr(line, run, note, extra) {
        var v = { times: done.map(function (x) { return +fx(x, 5); }) };
        if (run != null) v.run = run;
        var e = { line: line, run: run, done: done.slice(), vars: line === 0 ? {} : v, note: note, out: out.slice(), counters: { "runs timed": done.length + " / 8" } };
        for (var x in extra) e[x] = extra[x];
        f.push(e);
      }
      fr(0, null, "Choose a scenario, predict, then press <strong>play</strong>.");
      fr(2, null, "An empty list to keep every sample — never throw measurements away.");
      for (var i = 0; i < 8; i++) {
        fr(5, i, "Run " + (i + 1) + ": the clock runs while <code>sum_to(2000000)</code> does 2 000 000 loop steps.", { hl: [4, 6], running: i });
        done.push(T[i]);
        out.push("run " + (i + 1) + ": " + fx(T[i], 5) + " s");
        fr(8, i, "Run " + (i + 1) + " took " + fx(T[i], 5) + " s" + (i === 0 && scen === "cold" ? " — noticeably slower: one-off start-up work was timed too." : "."), { hl: [6, 7] });
      }
      var A = stat(T), R = stat(T.slice(1));
      fr(10, null, "Keep runs 2–8 in a separate list.");
      out.push("all 8:    fastest " + fx(A.min, 5) + "  mean " + fx(A.mean, 5));
      fr(11, null, "Summaries of all eight runs.", { A: A });
      out.push("runs 2-8: fastest " + fx(R.min, 5) + "  mean " + fx(R.mean, 5));
      fr(12, null, "", { A: A, R: R, final: true });
      return f;
    }
    var ct = U.CodeTrace(host, { code: CODE, build: build, onFrame: onFrame, fps: function (i) { return i < 4 ? 1.2 : 2.2; } });
    var zoom = h("div", "w5-lane-note"); ct.extra.appendChild(zoom);
    var bars = h("div", "vbars w5-vbars"); ct.extra.appendChild(bars);
    var bl = [];
    for (var i = 0; i < 8; i++) { var b = h("div", "vb"); bars.appendChild(b); bl.push(b); }
    var minL = h("div", "w5-line min"), meanL = h("div", "w5-line mean");
    bars.appendChild(minL); bars.appendChild(meanL);
    ct.extra.appendChild(h("div", "w5-legend", "<span class='muted'>runs 1–8</span><span><i class='w5-k min'></i>fastest</span><span><i class='w5-k mean'></i>mean</span><span class='muted'>(lines for the runs shown; dashed = runs 2–8 only)</span>"));
    var tw = h("div", "anim-table-wrap"); ct.extra.appendChild(tw);
    var tab = U.table(tw, ["", "all 8 runs", "runs 2–8", "change"]);
    simNote(ct.extra, "sum_to: 41.3 ns per loop step, so about 0.083 s per run" + (scen === "cold" ? "" : ""));

    function onFrame(fr) {
      var tmin = Math.min.apply(null, T), tmax = Math.max.apply(null, T);
      var lo = tmin - (tmax - tmin) * 1.5, hi = tmax;
      zoom.textContent = "zoomed in: the bottom of the chart is " + fx(lo, 5) + " s, the top " + fx(hi, 5) + " s";
      var y = function (v) { return Math.max(4, (v - lo) / (hi - lo) * 100); };
      bl.forEach(function (b, k) {
        var shown = k < fr.done.length;
        b.style.height = shown ? y(T[k]) + "%" : (fr.running === k ? "10%" : "0%");
        b.className = "vb" + (fr.running === k ? " on w5-pulse" : shown ? (k === 0 ? " gold" : "") : "");
        b.innerHTML = "<span>" + (k + 1) + "</span>";
        b.title = shown ? "run " + (k + 1) + ": " + fx(T[k], 5) + " s" : "";
      });
      var d = fr.done;
      var useRest = fr.final || fr.R;
      if (d.length) {
        var S = stat(d);
        minL.style.display = meanL.style.display = "";
        minL.style.bottom = y(S.min) + "%"; meanL.style.bottom = y(S.mean) + "%";
        minL.classList.toggle("rest", false); meanL.classList.toggle("rest", false);
        if (useRest) {
          var R = stat(d.slice(1));
          minL.style.bottom = y(R.min) + "%"; meanL.style.bottom = y(R.mean) + "%";
          minL.classList.add("rest"); meanL.classList.add("rest");
        }
      } else { minL.style.display = meanL.style.display = "none"; }
      var rows = [];
      if (fr.A) {
        var A = fr.A, RR = stat(T.slice(1));
        var ch = function (a, b) { var p = (b - a) / a * 100; return (Math.abs(p) < 0.005 ? "unchanged" : (p > 0 ? "+" : "") + fx(p, 2) + " %"); };
        rows.push(["fastest", fx(A.min, 5), fr.R ? fx(RR.min, 5) : "…", fr.R ? ch(A.min, RR.min) : ""]);
        rows.push(["mean", fx(A.mean, 5), fr.R ? fx(RR.mean, 5) : "…", fr.R ? ch(A.mean, RR.mean) : ""]);
      }
      tw.style.display = rows.length ? "" : "none";
      tab.rows(rows);
      if (fr.final) {
        var A2 = fr.A, R2 = fr.R;
        var dMin = Math.abs(R2.min - A2.min) / A2.min, dMean = Math.abs(R2.mean - A2.mean) / A2.mean;
        var most = dMin < 1e-9 ? "mean" : dMin > dMean ? "min" : "mean";
        var why = scen === "cold" ? "Run 1 was the slow one, so dropping it pulled the <strong>mean</strong> down by " + fx(dMean * 100, 1) + " % and left the <strong>fastest</strong> unchanged — the minimum had already ignored the cold start."
          : scen === "fast" ? "Here run 1 happened to be the fastest, so dropping it changed the <strong>fastest</strong> too (by " + fx(dMin * 100, 2) + " %). Taking the minimum is not a warm-up policy."
          : "No run stood out, so both statistics barely moved (" + (dMin < 1e-9 ? "fastest unchanged" : "fastest " + fx(dMin * 100, 2) + " %") + ", mean " + fx(dMean * 100, 2) + " %). Report what your samples show.";
        var verdict = pick == null ? "" : (pick === most || (pick === "same" && dMean < 0.005 && dMin < 0.005)) ? " Your prediction fits these samples." : " Compare that with your prediction.";
        ct.msg.innerHTML = why + verdict + (scen === "cold" ? " Try the other scenarios." : "");
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 5 — one perf_counter reading vs a timeit batch
     ============================================================ */
  function timeitTask(host) {
    host.classList.add("w5-stack");
    U.title(host, "Animation · two instruments, three repeats");
    var seed = 3, reps = 3, pick = null;
    predictRow(host, "predict: which is steadier?", [["pc", "single perf_counter"], ["ti", "timeit ÷ 10 000"]], function (v) { pick = v; });
    var CODE = "import time, timeit\nfor rep in range(3):\n    start = time.perf_counter()\n    sum_to(1000)\n    single = time.perf_counter() - start\n" +
      "    total = timeit.timeit(\"sum_to(1000)\", globals=globals(), number=10000)\n" +
      "    per_call = total / 10000\n" +
      "    print(f\"{single * 1e6:.2f} µs  vs  {per_call * 1e6:.2f} µs\")";
    function code() { return CODE.replace("range(3)", "range(" + reps + ")"); }
    var ctrl = h("div", "anim-opts");
    ctrl.appendChild(btn("+3 repeats", "", function () { if (reps < 30) { reps += 3; ct.load(); } }, "Add three more repeats"));
    ctrl.appendChild(btn("back to 3", "", function () { reps = 3; ct.load(); }));
    ctrl.appendChild(btn("new samples", "", function () { seed++; ct.load(); }));
    host.appendChild(ctrl);

    var call = 1000 * M.sum;
    var P = [], Q = [];
    function build() {
      var r = U.rng(seed * 17);
      P = []; Q = [];
      for (var k = 0; k < reps; k++) {
        P.push(measure(call * (1 + 0.01 * gauss(r)), r));
        /* timeit: one clock pair around 10 000 calls; per-call variation averages out */
        var batch = 10000 * call * (1 + 0.0001 * gauss(r));
        Q.push(measure(batch, r) / 10000);
      }
      var f = [], out = [], sp = [], sq = [];
      function fr(line, k, note, extra) {
        var v = {};
        if (k != null) v.rep = k;
        if (sp.length > (k || 0) && k != null) v.single = +fx(sp[k], 9);
        if (sq.length > (k || 0) && k != null) { v.per_call = +fx(sq[k], 9); }
        var e = { line: line, k: k, sp: sp.slice(), sq: sq.slice(), vars: v, note: note, out: out.slice(), counters: counters() };
        for (var x in extra) e[x] = extra[x];
        f.push(e);
      }
      function counters() {
        var c = {};
        if (sp.length > 1) c["single: spread"] = spread(sp) + " %";
        if (sq.length > 1) c["timeit: spread"] = spread(sq) + " %";
        return c;
      }
      fr(0, null, "Predict, then press <strong>play</strong>. One call of <code>sum_to(1000)</code> takes about 41 microseconds.");
      for (var k = 0; k < reps; k++) {
        var slow = reps > 6 && k >= 3;
        if (!slow) fr(4, k, "Repeat " + (k + 1) + ": one call between two clock readings — the reading includes the clock's own overhead and jitter.", { hl: [3, 5], phase: "pc" });
        sp.push(P[k]);
        if (!slow) fr(5, k, "Single reading: <strong>" + mu(P[k]) + "</strong>.", { phase: "pc" });
        if (!slow) fr(6, k, "Now 10 000 calls in one batch (about 0.41 s). Fixed disturbances are shared out over 10 000 calls.", { phase: "ti" });
        sq.push(Q[k]);
        if (!slow) fr(7, k, "Batch total ÷ 10 000 = <strong>" + mu(Q[k]) + "</strong> per call.", { phase: "ti" });
        out.push(fx(P[k] * 1e6, 2) + " µs  vs  " + fx(Q[k] * 1e6, 2) + " µs");
        fr(8, k, slow ? "Repeat " + (k + 1) + " done." : "", {});
      }
      f[f.length - 1].final = true;
      return f;
    }
    function spread(a) { var mn = Math.min.apply(null, a), mx = Math.max.apply(null, a); return fx((mx - mn) / mn * 100, 2); }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: function (i, fs) { return reps > 6 ? 3 : 1.2; } });
    var strips = h("div", "w5-strips"); ct.extra.appendChild(strips);
    simNote(ct.extra, "sum_to(1000): 41.3 µs per call");
    function strip(name, vals, lo, hi, cur) {
      var dots = vals.map(function (v, k) {
        var x = (v - lo) / (hi - lo) * 100;
        return "<i class='w5-dot" + (k === cur ? " cur" : "") + "' style='left:" + Math.max(0, Math.min(100, x)) + "%' title='" + mu(v) + "'></i>";
      }).join("");
      return "<div class='w5-strip'><div class='w5-strip-h'><span>" + name + "</span><b>" + (vals.length > 1 ? "spread " + spread(vals) + " %" : vals.length ? mu(vals[0]) : "—") + "</b></div>" +
        "<div class='w5-axis'>" + dots + "</div></div>";
    }
    function onFrame(fr) {
      var lo = 40e-6, hi = 56e-6;
      strips.innerHTML = strip("single perf_counter reading", fr.sp, lo, hi, fr.phase === "pc" ? fr.k : -1) +
        strip("timeit total ÷ 10 000", fr.sq, lo, hi, fr.phase === "ti" ? fr.k : -1) +
        "<div class='w5-scale'><span>40 µs</span><span>44</span><span>48</span><span>52</span><span>56 µs</span></div>";
      if (fr.final) {
        var a = spread(fr.sp), b = spread(fr.sq);
        ct.msg.innerHTML = "Across " + reps + " repeats the single readings spread by <strong>" + a + " %</strong>, the timeit per-call figures by only <strong>" + b + " %</strong>. " +
          "A 41-µs call is only a few hundred times the clock overhead, so any fixed disturbance is a big share of one reading; spread over 10 000 calls it becomes a tiny percentage." +
          (pick == null ? "" : pick === "ti" ? " Your prediction was right." : " So timeit, not a single reading, is the instrument for calls this fast.");
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 6 — relative noise shrinks with n
     ============================================================ */
  function noise(host) {
    host.classList.add("w5-stack");
    U.title(host, "Animation · the same disturbance, a smaller share");
    var seed = 9;
    var opts = h("div", "anim-opts");
    opts.appendChild(btn("new samples", "", function () { seed++; ct.load(); }));
    host.appendChild(opts);
    var gp = h("div", "anim-opts");
    gp.appendChild(h("span", "lab", "predict the spread:"));
    var g1 = h("input"); g1.type = "number"; g1.placeholder = "% at 1 000"; g1.setAttribute("aria-label", "Predicted spread percent at n = 1000");
    var g2 = h("input"); g2.type = "number"; g2.step = "any"; g2.placeholder = "% at 2 000 000"; g2.setAttribute("aria-label", "Predicted spread percent at n = 2000000");
    g1.className = g2.className = "w5-winp";
    gp.appendChild(g1); gp.appendChild(g2);
    host.appendChild(gp);

    var CODE = "for n in [1000, 2000000]:\n    times = []\n    for _ in range(10):\n        start = time.perf_counter()\n        sum_to(n)\n" +
      "        times.append(time.perf_counter() - start)\n" +
      "    spread = (max(times) - min(times)) / min(times) * 100\n" +
      "    print(f\"n={n}: spread {spread:.2f}%\")";
    var NS = [1000, 2000000], DATA = {};
    function build() {
      var r = U.rng(seed * 101);
      NS.forEach(function (n) { var a = []; for (var i = 0; i < 10; i++) a.push(measure(n * M.sum, r)); DATA[n] = a; });
      var f = [], out = [], shown = { 1000: 0, 2000000: 0 }, spreads = {};
      function fr(line, n, note, extra) {
        var v = {};
        if (n != null) { v.n = n; v["len(times)"] = shown[n]; }
        if (n != null && spreads[n] != null) v.spread = +fx(spreads[n], 2);
        var sh = { 1000: shown[1000], 2000000: shown[2000000] }, sp = {};
        for (var q in spreads) sp[q] = spreads[q];
        var e = { line: line, n: n, shown: sh, spreads: sp, vars: v, note: note, out: out.slice(), counters: {} };
        for (var x in extra) e[x] = extra[x];
        f.push(e);
      }
      fr(0, null, "Predict both spreads, then press <strong>play</strong>.");
      NS.forEach(function (n) {
        fr(1, n, "<code>n = " + fmt(n) + "</code>: one run should take about " + niceT(n * M.sum) + ".");
        for (var i = 0; i < 10; i++) {
          shown[n]++;
          fr(6, n, i === 0 ? "Each run is timed and kept." : "Run " + (i + 1) + ": " + niceT(DATA[n][i]) + ".", { hl: [4, 5], cur: i });
        }
        var a = DATA[n], mn = Math.min.apply(null, a), mx = Math.max.apply(null, a);
        spreads[n] = (mx - mn) / mn * 100;
        fr(7, n, "(slowest − fastest) / fastest × 100 = (" + niceT(mx) + " − " + niceT(mn) + ") / " + niceT(mn) + " × 100 = <strong>" + fx(spreads[n], 2) + " %</strong>.");
        out.push("n=" + n + ": spread " + fx(spreads[n], 2) + "%");
        fr(8, n, "");
      });
      f[f.length - 1].final = true;
      return f;
    }
    var ct = U.CodeTrace(host, { code: CODE, build: build, onFrame: onFrame, fps: function (i) { return i < 3 ? 1.2 : 3; } });
    var lanes = h("div", "w5-lanes"); ct.extra.appendChild(lanes);
    /* §5.6 calculator */
    var calc = h("div", "w5-calc");
    calc.appendChild(h("div", "ct-h", "§5.6 · a 0.25 ms disturbance as a share of the run"));
    var crow = h("div", "anim-opts");
    var sl = h("input"); sl.type = "range"; sl.min = "0"; sl.max = "400"; sl.value = "0"; sl.setAttribute("aria-label", "Run length (log scale)");
    crow.appendChild(h("span", "lab", "run length"));
    crow.appendChild(sl);
    var cval = h("span", "lab", "");
    crow.appendChild(cval);
    crow.appendChild(btn("0.5 ms", "", function () { setRun(0.5e-3); }));
    crow.appendChild(btn("2 s", "", function () { setRun(2); }));
    calc.appendChild(crow);
    var cbar = h("div", "w5-cbar", "<div class='w5-cfill'></div>");
    calc.appendChild(cbar);
    var cout = h("p", "w5-cout", "");
    calc.appendChild(cout);
    ct.extra.appendChild(calc);
    simNote(ct.extra, "sum_to: 41.3 ns per loop step");
    var LO = Math.log10(0.5e-3 / 2), HI = Math.log10(4);
    var runLen = 0.5e-3;
    function setRun(v) { runLen = v; sl.value = String(Math.round((Math.log10(v) - LO) / (HI - LO) * 400)); paintCalc(); }
    sl.addEventListener("input", function () { runLen = Math.pow(10, LO + (HI - LO) * parseInt(sl.value, 10) / 400); paintCalc(); });
    function pct(p) { return p >= 1 ? String(+p.toFixed(2)) : String(+p.toPrecision(3)); }
    function paintCalc() {
      var p = 0.25e-3 / runLen * 100;
      cval.textContent = niceT(runLen).replace(".000 ms", " ms");
      if (Math.abs(runLen - 0.5e-3) < 1e-9) cval.textContent = "0.5 ms";
      if (Math.abs(runLen - 2) < 1e-9) cval.textContent = "2 s";
      cbar.firstChild.style.width = Math.min(100, p) + "%";
      cout.innerHTML = "0.25 ms / " + cval.textContent + " × 100 = <strong>" + pct(p) + " %</strong> of the measurement" +
        (p > 20 ? " — the disturbance is a big part of what you measured." : p < 1 ? " — a rounding error." : ".");
    }
    function onFrame(fr) {
      lanes.innerHTML = NS.map(function (n) {
        var a = DATA[n], k = fr.shown[n], mn = Math.min.apply(null, a);
        var shownVals = a.slice(0, k);
        var cur = fr.n === n ? fr.cur : -1;
        var mnShown = shownVals.length ? Math.min.apply(null, shownVals) : mn;
        var bars = "";
        for (var i = 0; i < 10; i++) {
          if (i < k) {
            var over = (a[i] - mnShown) / mnShown * 100;
            var hgt = Math.min(100, over / 40 * 100);
            bars += "<div class='w5-nb" + (i === cur ? " cur" : "") + "' title='" + niceT(a[i]) + "'><i style='height:" + Math.max(2, hgt) + "%'></i><span>" + (over < 10 ? fx(over, 2) : fx(over, 1)) + "</span></div>";
          } else bars += "<div class='w5-nb empty'><i style='height:0'></i><span></span></div>";
        }
        var sp = fr.spreads[n];
        return "<div class='w5-lane" + (fr.n === n ? " on" : "") + "'><div class='w5-lane-h'><span>n = " + fmt(n) + " · one run ≈ " + niceT(n * M.sum) + "</span><b>" +
          (sp != null ? "spread " + fx(sp, 2) + " %" : "") + "</b></div><div class='w5-nbars'>" + bars + "</div></div>";
      }).join("") + "<div class='w5-lane-note'>bar height = how much slower each run was than the fastest so far, in % (scale 0–40 %)</div>";
      if (fr.final) {
        var s1 = fr.spreads[1000], s2 = fr.spreads[2000000];
        var a1 = parseFloat(g1.value), a2 = parseFloat(g2.value);
        ct.msg.innerHTML = "Spread <strong>" + fx(s1, 2) + " %</strong> at n = 1 000 but only <strong>" + fx(s2, 2) + " %</strong> at n = 2 000 000. " +
          "The disturbances are about the same size in both cases; at 41 µs they are a big share of the run, at 83 ms a rounding error. That is why we grow n." +
          (isNaN(a1) && isNaN(a2) ? "" : " You predicted " + (isNaN(a1) ? "?" : a1) + " % and " + (isNaN(a2) ? "?" : a2) + " %.");
      }
    }
    setRun(0.5e-3);
    ct.load();
  }

  AAAnim.register("w5-contains", contains);
  AAAnim.register("w5-worst", worst);
  AAAnim.register("w5-dishonest", dishonest);
  AAAnim.register("w5-warmup", warmup);
  AAAnim.register("w5-timeit", timeitTask);
  AAAnim.register("w5-noise", noise);
})();
