/* ============================================================
   AA — Week 10 "Try it yourself" animations
   w10-verify    Task 1 — doubling experiment for five list operations
   w10-fixslow   Task 2 — slow vs fixed unique_reversed, step by step
   w10-strings   Task 3 — += vs join: copy work and the doubling ratio
   w10-capacity  Task 4 — watch_capacity.py to 1 000 items: the jumps
   w10-deque     Task 5 — list or deque? run each scenario on both
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt, esc = U.esc;

  function simNote(host, text) {
    host.appendChild(h("p", "note-sim", text ||
      "Simulated timings from a step-count model — run the real code in Colab for your own numbers."));
  }
  function choice(parent, label, options, onPick) {
    /* a row of answer buttons; returns {set(value), clear(), el} */
    var wrap = h("div", "anim-opts");
    if (label) wrap.appendChild(h("span", "lab", label));
    var bs = options.map(function (o) {
      var b = btn(o[1], "", function () { onPick(o[0]); });
      b.setAttribute("aria-pressed", "false");
      wrap.appendChild(b);
      return { v: o[0], b: b };
    });
    parent.appendChild(wrap);
    return {
      el: wrap,
      mark: function (v, state) {
        bs.forEach(function (x) {
          x.b.className = x.v === v ? "w10-pick " + (state || "") : "";
          x.b.setAttribute("aria-pressed", String(x.v === v));
        });
      }
    };
  }
  function fitChart(c) {           /* bigger text on phones: draw on a narrower canvas */
    if ((window.innerWidth || 1000) < 640) { c.el.width = 380; c.el.height = 300; }
    return c;
  }
  function secs(t) {
    if (t >= 60) return (t / 60).toFixed(1) + " min";
    if (t >= 1) return t.toFixed(1) + " s";
    if (t >= 1e-3) return +(t * 1e3).toPrecision(2) + " ms";
    return +(t * 1e6).toPrecision(2) + " µs";
  }

  /* ============================================================
     Task 1 — verify the table (doubling experiment)
     ============================================================ */
  function verify(host) {
    var OPS = [
      { id: "idx", short: "d[n//2]", code: "data[n // 2]", cls: 1, base: 38, per: 0, color: "--blue",
        how: "repeat 100 000 times inside the timed region and divide; the list size stays n" },
      { id: "app", short: "append", code: "data.append(1)", cls: 1, base: 52, per: 0, color: "--green",
        how: "repeat 100 000 times and divide (the list grows a little while you time it)" },
      { id: "pop0", short: "pop(0)", code: "data.pop(0)", cls: 2, base: 30, per: 0.95, color: "--red",
        how: "rebuild a fresh list of n items before each timing, then time one pop(0)" },
      { id: "inm", short: "x in d", code: "x in data   (x missing)", cls: 2, base: 40, per: 14.1, color: "--accent",
        how: "repeat 100 times and divide; x = -1 is never in the list, so every item is checked" },
      { id: "copy", short: "d[:]", code: "data[:]", cls: 2, base: 60, per: 2.2, color: "--muted",
        how: "repeat 100 times and divide; each repeat builds a brand-new list of n items" }
    ];
    var SIZES = [100000, 200000, 400000, 800000];
    var MEAS = {};
    OPS.forEach(function (op, k) {
      var r = U.rng(1009 + 17 * k);
      MEAS[op.id] = SIZES.map(function (n) { return (op.base + op.per * n) * (1 + 0.08 * (r() - 0.5)); });
    });
    var op = OPS[0], pred = {}, done = {};

    U.title(host, "Animation · a doubling experiment for five list operations");
    var opts = h("div", "anim-opts w10-wrap");
    opts.appendChild(U.seg("operation", OPS.map(function (o) { return [o.id, o.short]; }), op.id, function (v) {
      op = OPS.filter(function (o) { return o.id === v; })[0]; sync(); player.load();
    }));
    host.appendChild(opts);
    var codeLine = h("p", "w10-opline", "");
    host.appendChild(codeLine);
    var ch = choice(host, "your prediction — when n doubles, the time per call…", [[1, "stays about the same"], [2, "about doubles"]], function (v) {
      pred[op.id] = v; ch.mark(v); player.load();
    });

    var lk = h("div", "w10-lockers");
    host.appendChild(lk);
    var rowA = lockRow(lk, 8), rowB = lockRow(lk, 16);
    var tw = h("div", "anim-table-wrap w10-tw");
    host.appendChild(tw);
    var tbl = U.table(tw, ["n", "time per call", "ratio to previous n"]);
    var chart = fitChart(U.LineChart(host, { logx: true, logy: true, xlabel: "n (list length)", ylabel: "ns per call", height: 280,
      label: "Log–log chart of time per call against n for the operations measured so far" }));
    simNote(host);
    var m = U.msg(host);

    function lockRow(parent, N) {
      var r = h("div", "w10-lrow");
      var lab = h("span", "w10-llab", "n = " + N);
      var cells = h("div", "w10-lcells");
      var cnt = h("span", "w10-lcnt", "");
      r.appendChild(lab); r.appendChild(cells); r.appendChild(cnt);
      parent.appendChild(r);
      var els = [];
      for (var j = 0; j <= N; j++) { var c = h("i", "w10-lk"); cells.appendChild(c); els.push(c); }
      return { N: N, els: els, cnt: cnt };
    }
    function touches(N) {
      var t = [], j;
      if (op.id === "idx") t.push([N >> 1, "gold"]);
      else if (op.id === "app") t.push([N, "gold"]);
      else if (op.id === "pop0") { t.push([0, "bad"]); for (j = 1; j < N; j++) t.push([j, "on"]); }
      else for (j = 0; j < N; j++) t.push([j, op.id === "inm" ? "on" : "good"]);
      return t;
    }
    function paintRow(R, s) {
      var t = touches(R.N), cls = {}, k = Math.min(s, t.length);
      for (var q = 0; q < k; q++) cls[t[q][0]] = t[q][1];
      R.els.forEach(function (e, j) {
        var ghost = j === R.N;
        e.className = "w10-lk" + (ghost ? " ghost" : "") + (cls[j] ? " " + cls[j] : "") +
          (ghost && op.id === "app" && k ? " filled" : "") + (op.id === "pop0" && j === 0 && k ? " gone" : "");
      });
      R.cnt.textContent = k + (k === 1 ? " item touched" : " items touched");
    }
    function sync() {
      codeLine.innerHTML = "<code>" + esc(op.code) + "</code> <span class='muted'>— timed by: " + esc(op.how) + "</span>";
      ch.mark(pred[op.id]);
    }
    function build() {
      var T = touches(16).length, f = [];
      for (var s = 0; s <= T; s++) f.push({ ph: "t", s: s });
      for (var k = 1; k <= SIZES.length; k++) f.push({ ph: "m", s: T, k: k });
      f.push({ ph: "end", s: T, k: SIZES.length });
      return f;
    }
    function ratioAvg() {
      var v = MEAS[op.id], s = 0;
      for (var k = 1; k < v.length; k++) s += v[k] / v[k - 1];
      return s / (v.length - 1);
    }
    function render(fr) {
      paintRow(rowA, fr.s); paintRow(rowB, fr.s);
      var k = fr.k || 0, v = MEAS[op.id];
      if (fr.ph === "end") done[op.id] = true;
      tbl.rows(SIZES.slice(0, Math.max(k, 0)).map(function (n, j) {
        return [fmt(n), fmt(Math.round(v[j])) + " ns", j ? "×" + (v[j] / v[j - 1]).toFixed(2) : "—"];
      }), k - 1);
      var series = OPS.filter(function (o) { return done[o.id] && o !== op; }).map(function (o) {
        return { name: o.short, color: o.color, points: SIZES.map(function (n, j) { return [n, MEAS[o.id][j]]; }) };
      });
      if (k) series.push({ name: op.short + (fr.ph === "end" ? "" : " (running)"), color: op.color,
        points: SIZES.slice(0, k).map(function (n, j) { return [n, v[j]]; }) });
      chart.draw(series, { xr: [SIZES[0], SIZES[SIZES.length - 1]], yr: [20, 2e7] });

      var T = touches(16).length, t8 = touches(8).length;
      if (fr.ph === "t" && fr.s === 0) {
        m.innerHTML = "Predict first: does one <code>" + esc(op.code) + "</code> touch more of the list when the list is longer? " +
          "Pick your answer above, then press <strong>play</strong>.";
      } else if (fr.ph === "t") {
        m.innerHTML = fr.s < T ? "One call on a list of 8 and one on a list of 16, side by side. Watch how many lockers each call has to touch." :
          "One call touched <strong>" + t8 + "</strong> of 8 and <strong>" + T + "</strong> of 16. " +
          (T === t8 ? "Doubling the list did not change the work." : "Doubling the list doubled the work.") + " Now the stopwatch.";
      } else if (fr.ph === "m") {
        m.innerHTML = "n = " + fmt(SIZES[k - 1]) + ": about <strong>" + fmt(Math.round(v[k - 1])) + " ns</strong> per call." +
          (k > 1 ? " Ratio to the previous size: <strong>×" + (v[k - 1] / v[k - 2]).toFixed(2) + "</strong>." : "");
      } else {
        var r = ratioAvg(), cls = op.cls === 1 ? "O(1)" : "O(n)", p = pred[op.id];
        m.innerHTML = "Ratios hover around <strong>×" + r.toFixed(2) + "</strong> each time n doubles, so the measured class is <strong>" + cls + "</strong>" +
          (op.cls === 1 ? " — the time does not care how long the list is." : " — every doubling of n doubles the time.") +
          (p ? (p === op.cls ? " Your prediction was right." : " Your prediction said otherwise — look at the lockers again.") : "") +
          " Pick another operation: the finished ones stay on the chart, and they split into a flat group and a rising group.";
      }
    }
    var player = U.Player(host, { build: build, render: render,
      fps: function (i, frames) { return frames[i] && frames[i].ph === "t" && i < frames.length - 1 && frames[i + 1].ph === "t" ? 6 : 1.1; } });
    sync(); player.load();
  }
  AAAnim.register("w10-verify", verify);

  /* ============================================================
     Task 2 — fix a slow function
     ============================================================ */
  function fixSlow(host) {
    var DATA = [5, 3, 5, 8, 3, 1];
    var SLOW = [
      "def unique_reversed(data):",
      "    result = []",
      "    for item in data:",
      "        if item not in result:          # problem 1",
      "            result = [item] + result    # problem 2",
      "    return result",
      "",
      "print(unique_reversed([5, 3, 5, 8, 3, 1]))"
    ].join("\n");
    var FAST = [
      "def unique_reversed(data):",
      "    seen = set()",
      "    result = []",
      "    for item in data:",
      "        if item not in seen:      # O(1)",
      "            seen.add(item)",
      "            result.append(item)   # O(1)",
      "    result.reverse()              # O(n), once",
      "    return result",
      "",
      "print(unique_reversed([5, 3, 5, 8, 3, 1]))"
    ].join("\n");
    var ver = "slow";
    U.title(host, "Animation · the slow unique_reversed and its fix, one step at a time");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("version", [["slow", "slow.py"], ["fast", "fast.py"]], ver, function (v) { ver = v; ct.load(); }));
    host.appendChild(opts);

    function pyList(a) { return "[" + a.join(", ") + "]"; }
    function buildSlow() {
      var f = [], out = [], result = [], cmp = 0, cop = 0, item = null, ii = -1;
      function push(line, note, v) {
        var vars = { data: DATA };
        if (f.length) vars.result = result.slice();
        if (item !== null) vars.item = item;
        f.push({ line: line, note: note, out: out.slice(), vars: vars,
          counters: { "items compared": cmp, "items copied": cop, "total steps": cmp + cop },
          view: { ii: ii, result: result.slice(), scan: v && v.scan, found: v && v.found, fresh: v && v.fresh } });
      }
      push(8, "We call the slow version on <code>[5, 3, 5, 8, 3, 1]</code>. Press <strong>play</strong> and watch the two counters.");
      push(2, "Start with an empty result list.");
      DATA.forEach(function (x, i) {
        item = x; ii = i;
        push(3, "Next item: <strong>" + x + "</strong>.");
        if (!result.length) push(4, "<code>" + x + " not in []</code> — nothing to compare, so it is True.");
        var found = -1;
        for (var j = 0; j < result.length; j++) {
          cmp++;
          var hit = result[j] === x;
          push(4, "<code>not in</code> scans the list: compare " + x + " with result[" + j + "] = " + result[j] + (hit ? " — <strong>equal</strong>." : " — different."), { scan: j, found: hit ? j : -1 });
          if (hit) { found = j; break; }
        }
        if (found >= 0) { push(4, x + " is already in result, so the test is False and we skip it. That check cost " + (found + 1) + " comparison" + (found ? "s" : "") + ".", { found: found }); return; }
        if (result.length) push(4, "Checked all " + result.length + " items: " + x + " is not there, so the test is True.", {});
        var k = result.length;
        result = [x].concat(result);
        cop += k + 1;
        push(5, "<code>[item] + result</code> builds a <strong>brand-new list</strong>: " + x + " plus copies of all " + k + " old items = " + (k + 1) + " writes.", { fresh: true });
      });
      item = null; ii = -1;
      push(6, "Return the result.");
      out.push(pyList(result));
      push(8, "Done: <strong>" + pyList(result) + "</strong> with " + cmp + " comparisons and " + cop + " copies. At n = 6 that is nothing — the table shows what happens when n grows: both problems grow like n², so the total is about n².");
      f[f.length - 1].end = true;
      return f;
    }
    function buildFast() {
      var f = [], out = [], result = [], seen = [], lk = 0, ad = 0, mv = 0, item = null, ii = -1;
      function push(line, note, v) {
        var vars = { data: DATA };
        if (f.length >= 1) vars["seen (a set)"] = seen.slice();
        if (f.length >= 2) vars.result = result.slice();
        if (item !== null) vars.item = item;
        f.push({ line: line, note: note, out: out.slice(), vars: vars,
          counters: { "set lookups": lk, "adds + appends": ad, "items moved by reverse": mv, "total steps": lk + ad + mv },
          view: { ii: ii, result: result.slice(), seen: seen.slice(), hit: v && v.hit, look: v && v.look, rev: v && v.rev } });
      }
      push(11, "The fixed version on the same input. Press <strong>play</strong>.");
      push(2, "An empty set to remember what we have seen.");
      push(3, "An empty result list.");
      DATA.forEach(function (x, i) {
        item = x; ii = i;
        push(4, "Next item: <strong>" + x + "</strong>.");
        lk++;
        var had = seen.indexOf(x) >= 0;
        push(5, "<code>" + x + " not in seen</code>: the set jumps straight to where " + x + " would be — <strong>one lookup</strong>, no scanning. " +
          (had ? "It is there, so skip." : "Not there."), { look: x, hit: had });
        if (had) return;
        seen.push(x); ad++;
        push(6, "Remember " + x + " in the set (O(1)).", { look: x });
        result.push(x); ad++;
        push(7, "Append " + x + " at the cheap end (O(1)) — nothing else moves.");
      });
      item = null; ii = -1;
      mv = result.length;
      result.reverse();
      push(8, "Reverse once at the end: one pass over " + mv + " items.", { rev: true });
      push(9, "Return the result.");
      out.push(pyList(result));
      push(11, "Same answer, <strong>" + pyList(result) + "</strong>, and every item cost a fixed handful of steps: about 4n in total, so O(n).", {});
      f[f.length - 1].end = true;
      return f;
    }

    var ct = U.CodeTrace(host, {
      code: function () { return ver === "slow" ? SLOW : FAST; },
      build: function () { return ver === "slow" ? buildSlow() : buildFast(); },
      fps: function (i, fr) { return fr[i] && fr[i].line === 4 && ver === "slow" ? 2.4 : 1.6; },
      onFrame: draw
    });
    var ex = ct.extra;
    var rData = row("data"), rRes = row("result"), rSeen = row("seen");
    var scale = h("div", "w10-scale");
    ex.appendChild(scale);
    var tw = h("div", "anim-table-wrap w10-tw"); scale.appendChild(tw);
    scale.insertBefore(h("p", "w10-cap", "Scale it up — all-different input of size n: slow ≈ n² steps, fast ≈ 4n steps, times at 10 ns per step:"), tw);
    var tbl = U.table(tw, ["n", "slow.py", "fast.py"]);
    tbl.rows([1000, 10000, 100000].map(function (n) {
      return [fmt(n), fmt(n * n) + " steps<br><small>≈ " + secs(n * n * 1e-8) + "</small>", fmt(4 * n) + " steps<br><small>≈ " + secs(4 * n * 1e-8) + "</small>"];
    }));
    simNote(scale, "Times are a model (10 ns per step), not measurements — time both versions in Colab to see your own gap.");

    function row(label) {
      var r = h("div", "w10-arow");
      r.appendChild(h("span", "w10-alab", label));
      var a = h("div", "arr");
      r.appendChild(a);
      ex.appendChild(r);
      return { r: r, a: a };
    }
    function cells(a, vals, cls) {
      a.innerHTML = vals.length ? vals.map(function (v, j) { return '<div class="cell ' + (cls(j, v) || "") + '">' + v + "</div>"; }).join("")
        : '<div class="cell dim">empty</div>';
    }
    function draw(fr) {
      var v = fr.view;
      cells(rData.a, DATA, function (j) { return j === v.ii ? "on" : j < v.ii ? "dim" : ""; });
      cells(rRes.a, v.result, function (j) {
        if (v.fresh) return "gold";
        if (v.rev) return "good";
        if (v.found === j) return "good";
        if (v.scan != null && j <= v.scan) return j === v.scan ? "on" : "dim";
        return "";
      });
      rSeen.r.style.display = ver === "fast" ? "" : "none";
      if (ver === "fast") cells(rSeen.a, v.seen, function (j, x) { return x === v.look ? (v.hit ? "good" : "on") : ""; });
      scale.style.display = fr.end ? "" : "none";
    }
    ct.load();
  }
  AAAnim.register("w10-fixslow", fixSlow);

  /* ============================================================
     Task 3 — += vs join
     ============================================================ */
  function strings(host) {
    var W = 6, CH = 5;                 /* "word " is 5 characters */
    var model = "copy", guess = null;
    U.title(host, "Animation · building text with += versus collecting pieces and joining once");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("model of +=", [["copy", "copies the text every time"], ["opt", "grows in place (optimised)"]], model,
      function (v) { model = v; player.load(); }));
    host.appendChild(opts);
    var ch = choice(host, "predict: when n doubles, += takes…", [[1, "about the same"], [2, "about ×2"], [4, "about ×4"]], function (v) {
      guess = v; ch.mark(v); player.load();
    });
    var panes = h("div", "w10-panes");
    var pA = pane("text += \"word \""), pB = pane("pieces.append(\"word \") … \"\".join(pieces)");
    host.appendChild(panes);
    var leg = h("div", "w10-legend", '<span><i class="w10-b copy"></i>copied again</span><span><i class="w10-b new"></i>new word written</span>' +
      '<span><i class="w10-b keep"></i>left where it is</span><span><i class="w10-b join"></i>written once by join</span>');
    host.appendChild(leg);
    var stats = h("div", "anim-stats");
    var sA = U.stat("+= characters written"), sB = U.stat("join characters written");
    stats.appendChild(sA.el); stats.appendChild(sB.el);
    host.appendChild(stats);
    var scale = h("div", "w10-scale");
    host.appendChild(scale);
    var tw = h("div", "anim-table-wrap w10-tw"); scale.appendChild(tw);
    scale.insertBefore(h("p", "w10-cap", "Scale it up (model timings):"), tw);
    var tbl = U.table(tw, ["n", "+=", "join", "ratio"]);
    var dbl = h("p", "w10-cap", "");
    scale.appendChild(dbl);
    simNote(scale, "Simulated timings from a character-count model, tuned to land near the illustrative §10.5 numbers — run both in Colab and report your own ratios.");
    var m = U.msg(host);

    function pane(label) {
      var p = h("div", "w10-pane");
      p.appendChild(h("div", "w10-plab", "<code>" + esc(label) + "</code>"));
      var rows = h("div", "w10-stair");
      p.appendChild(rows);
      panes.appendChild(p);
      return { rows: rows };
    }
    function resized(r) {   /* optimised model: capacity (in words) doubles when full */
      var cap = 0;
      for (var s = 1; s <= r; s++) { if (s > cap) { if (s === r) return s > 1; cap = Math.max(1, cap * 2); } }
      return false;
    }
    function build() {
      var f = [{ i: 0 }];
      for (var i = 1; i <= W; i++) f.push({ i: i });
      f.push({ i: W, join: true });
      f.push({ i: W, join: true, scale: true });
      return f;
    }
    function blocks(r, kind) {
      var s = "";
      for (var q = 1; q <= r; q++) {
        var c = q === r ? "new" : kind === "plus" ? (model === "copy" || resized(r) ? "copy" : "keep") : "keep";
        s += '<i class="w10-b ' + c + '">' + q + "</i>";
      }
      return s;
    }
    /* timing model (seconds) */
    var A = 1.32e-8, B = 3.0507e-11;
    function plusCopy(n) { return A * n + B * CH * n * (n + 1) / 2; }
    function plusOpt(n) { var c = 0; for (var s = 1; s < n; s *= 2) c += s; return 6e-8 * n + B * CH * c; }
    function joinT(n) { return 6.8e-8 * n + 7.8e-5; }
    function plusT(n) { return model === "copy" ? plusCopy(n) : plusOpt(n); }
    function render(fr) {
      var rowsA = "", rowsB = "", wA = 0, wB = 0;
      for (var r = 1; r <= fr.i; r++) {
        rowsA += '<div class="w10-srow"><span>' + r + "</span>" + blocks(r, "plus") + "</div>";
        rowsB += '<div class="w10-srow"><span>' + r + "</span>" + blocks(r, "join") + "</div>";
        wA += CH + (model === "copy" || resized(r) ? CH * (r - 1) : 0);
      }
      if (fr.join) {
        var j = "";
        for (var q = 1; q <= W; q++) j += '<i class="w10-b join">' + q + "</i>";
        rowsB += '<div class="w10-srow jn"><span>join</span>' + j + "</div>";
        wB = CH * W;
      }
      pA.rows.innerHTML = rowsA || '<div class="w10-srow muted">text = ""</div>';
      pB.rows.innerHTML = rowsB || '<div class="w10-srow muted">pieces = []</div>';
      sA.set(wA); sB.set(wB);
      scale.style.display = fr.scale ? "" : "none";
      if (fr.scale) {
        var N = [25000, 50000, 100000];
        tbl.rows(N.map(function (n) {
          return [fmt(n), plusT(n).toFixed(4) + "s", joinT(n).toFixed(4) + "s", fmt(Math.round(plusT(n) / joinT(n))) + "x"];
        }));
        dbl.innerHTML = "Doubling n from 25 000 to 50 000 multiplies += by <strong>×" + (plusT(50000) / plusT(25000)).toFixed(2) +
          "</strong> and join by <strong>×" + (joinT(50000) / joinT(25000)).toFixed(2) + "</strong>.";
      }
      if (fr.i === 0) {
        m.innerHTML = "Six words, built two ways. Each row is the text after one more word. Choose a model for <code>+=</code>, make your prediction, then press <strong>play</strong>.";
      } else if (!fr.join) {
        m.innerHTML = model === "copy"
          ? "Word " + fr.i + ": <code>+=</code> makes a new string, so the " + (fr.i - 1) + " old words are copied again (" + CH * (fr.i - 1) + " characters) before the new one is written. The staircase is the total work — a triangle, about n²/2 words."
          : "Word " + fr.i + ": the interpreter extends the text in place" + (resized(fr.i) ? " — but it was full, so this time it moves the old words to a bigger block." : ", nothing old moves.") + " Moves are rare, so the work stays roughly one word per step.";
      } else if (!fr.scale) {
        m.innerHTML = "The list only holds references to the pieces; <code>join</code> then writes each character exactly <strong>once</strong>: " + CH * W + " characters in one linear pass.";
      } else {
        var r2 = plusT(50000) / plusT(25000), v = model === "copy" ? 4 : 2, gtxt = "";
        if (guess) gtxt = guess === v ? " Your prediction matches this model." : " Your prediction (×" + guess + ") does not match this model.";
        m.innerHTML = (model === "copy"
          ? "If every <code>+=</code> copies the text, doubling n gives about <strong>×" + r2.toFixed(1) + "</strong>: quadratic, and the gap to join doubles each time (27x → 55x)."
          : "If the interpreter optimises <code>+=</code>, doubling n gives about <strong>×" + r2.toFixed(1) + "</strong>: linear, and the ratio to join stays flat.") +
          gtxt + " Switch the model to see the other case — then run it for real and report which one your Python matches.";
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.2; } });
    player.load();
  }
  AAAnim.register("w10-strings", strings);

  /* ============================================================
     Task 4 — see the amortised jumps
     ============================================================ */
  function capacity(host) {
    var model = "py", N = 1000, view = "bytes", ans = null;
    U.title(host, "Animation · watch_capacity.py, adapted to append 1 000 items");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("growth rule", [["py", "CPython (64-bit)"], ["dbl", "idealised doubling (§10.3)"]], model, function (v) { model = v; player.load(); }));
    opts.appendChild(U.seg("appends", [[17, "17"], [1000, "1 000"]], N, function (v) { N = v; player.load(); }));
    host.appendChild(opts);
    var ch = choice(host, "predict: each new capacity compared with the previous one is…", [["add", "+ a fixed number of slots"], ["fac", "× a roughly constant factor"], ["x2", "always exactly ×2"]], function (v) {
      ans = v; ch.mark(v); player.load();
    });

    var box = h("div", "w10-cap-box");
    host.appendChild(box);
    var lab = h("div", "w10-cap-lab", "");
    var slots = h("div", "w10-slots");
    var bar = h("div", "w10-cbar", '<div class="cap"></div><div class="len"></div>');
    box.appendChild(lab); box.appendChild(slots); box.appendChild(bar);
    var cols = h("div", "w10-two");
    var left = h("div", ""), right = h("div", "");
    cols.appendChild(left); cols.appendChild(right);
    host.appendChild(cols);
    var conH = h("div", "ct-h", "printed output");
    left.appendChild(conH);
    var con = h("pre", "ct-out w10-con");
    left.appendChild(con);
    right.appendChild(h("div", "ct-h", "capacity jumps"));
    var tw = h("div", "anim-table-wrap w10-tw w10-jt");
    right.appendChild(tw);
    var tbl = U.table(tw, ["len", "slots", "× previous", "copied"]);
    var copt = h("div", "anim-opts w10-chopt");
    copt.appendChild(U.seg("chart", [["bytes", "getsizeof(data)"], ["avg", "average work per append"]], view, function (v) { view = v; player.redraw(); }));
    host.appendChild(copt);
    var chart = fitChart(U.LineChart(host, { xlabel: "len(data)", ylabel: "bytes", height: 260, label: "Chart of list size in bytes, or average work per append, against length" }));
    var stats = h("div", "anim-stats");
    var sApp = U.stat("appends"), sRes = U.stat("resizes"), sCop = U.stat("items copied"), sAvg = U.stat("work per append");
    [sApp, sRes, sCop, sAvg].forEach(function (s) { stats.appendChild(s.el); });
    host.appendChild(stats);
    host.appendChild(h("p", "note-sim", "Sizes come from a simulation of the growth rule (CPython 3.9+ on 64-bit: 56 bytes + 8 per slot). Older or newer Pythons may jump at slightly different lengths — run it yourself."));
    var m = U.msg(host);

    function grow(len, cap) {
      if (model === "dbl") return Math.max(1, cap * 2);
      var ns = len + 1, na = (ns + (ns >> 3) + 6) & ~3;
      if (ns - len > na - ns) na = (ns + 3) & ~3;
      return na;
    }
    function build() {
      var f = [], cap = 0, len = 0, copies = 0, jumps = [], last = -1, out = [], pts = [], avg = [], resizes = 0;
      var wide = N > 99 ? 4 : 2;
      function pad(x) { x = String(x); while (x.length < wide) x = " " + x; return x; }
      for (var i = 0; i <= N; i++) {
        var fr = { len: len, cap: cap, copies: copies, resizes: resizes };
        if (i < N) {
          var size = 56 + 8 * cap, jump = size !== last;
          if (jump) {
            jumps.push({ len: len, cap: cap, prev: jumps.length ? jumps[jumps.length - 1].cap : null, copied: len ? len : 0 });
            out.push("len=" + pad(len) + "   " + size + " bytes  <- grew here");
            if (pts.length) pts.push([len, last]);
            pts.push([len, size]);
            last = size;
          } else if (N <= 99) {
            out.push("len=" + pad(len) + "   " + size + " bytes");
          }
          fr.jump = jump;
        }
        fr.out = out.slice(-40); fr.nOut = out.length;
        fr.jumps = jumps.slice();
        fr.pts = pts.slice(); fr.avg = avg.slice();
        f.push(fr);
        if (i === N) break;
        /* data.append(i) */
        if (len + 1 > cap) { cap = grow(len, cap); copies += len; resizes++; }
        len++;
        avg.push([len, (len + copies) / len]);
      }
      f[f.length - 1].pts.push([N, last]);
      return f;
    }
    var frames = [], cur = 0;
    function render(fr, i, fs) {
      frames = fs; cur = i;
      var nx = fs[i + 1];                         /* the append that happens next */
      var maxCap = fs[fs.length - 1].cap;
      lab.innerHTML = "len = <strong>" + fr.len + "</strong> &nbsp; capacity = <strong>" + fr.cap + "</strong> slots" +
        (fr.cap ? " &nbsp; <span class='muted'>(" + (fr.cap - fr.len) + " free)</span>" : "");
      if (N <= 99) {
        slots.style.display = ""; bar.style.display = "none";
        var s = "", prevCap = i > 0 ? fs[i - 1].cap : 0, grew = fr.cap !== prevCap;
        for (var j = 0; j < maxCap; j++) {
          var c = j < fr.len ? (grew && j < fr.len - 1 ? "copy" : j === fr.len - 1 ? "new" : "used") : j < fr.cap ? "free" : "none";
          s += '<i class="w10-slot ' + c + '"></i>';
        }
        slots.innerHTML = s;
      } else {
        slots.style.display = "none"; bar.style.display = "";
        bar.firstChild.style.width = (fr.cap / maxCap * 100) + "%";
        bar.lastChild.style.width = (fr.len / maxCap * 100) + "%";
        bar.classList.toggle("flash", i > 0 && fr.cap !== fs[i - 1].cap);
      }
      conH.textContent = N <= 99 ? "printed output (range(17), as in §10.3)" : "printed output (range(1000), jump lines only)";
      con.textContent = (fr.nOut > fr.out.length ? "…\n" : "") + fr.out.join("\n");
      con.scrollTop = con.scrollHeight;
      var J = fr.jumps.filter(function (x) { return x.len > 0; });
      tbl.rows(J.map(function (x) {
        return [fmt(x.len), x.cap, x.prev ? "×" + (x.cap % x.prev ? (x.cap / x.prev).toFixed(3) : x.cap / x.prev) : "—", x.len - 1];
      }).slice(-8), Math.min(J.length, 8) - 1);
      drawChart(fr);
      sApp.set(fmt(fr.len)); sRes.set(fr.resizes); sCop.set(fmt(fr.copies));
      sAvg.set(fr.len ? ((fr.len + fr.copies) / fr.len).toFixed(2) : "—");

      var fin = i === fs.length - 1;
      if (i === 0) {
        m.innerHTML = "An empty list already takes 56 bytes and has no free slots. Make your prediction, then press <strong>play</strong> to append " + fmt(N) + " items.";
      } else if (!fin) {
        var p = fs[i - 1];
        if (fr.cap !== p.cap) {
          m.innerHTML = "Append number " + fr.len + " found the list full: rent " + fr.cap + " slots" +
            (p.len ? " and copy the " + p.len + " existing item" + (p.len > 1 ? "s" : "") : "") + ". <strong>Expensive, but rare.</strong>" +
            (p.cap ? " New capacity ÷ old = ×" + (fr.cap / p.cap).toFixed(2) + "." : "");
        } else if (model === "dbl" && (fr.len & (fr.len - 1)) === 0) {
          m.innerHTML = "n = " + fr.len + " (a power of two): copies so far " + fr.copies + " = n − 1, plus " + fr.len + " writes = <strong>" + (fr.len + fr.copies) + " = 2n − 1</strong> units.";
        } else {
          m.innerHTML = "Append number " + fr.len + " lands in a free slot: <strong>one write</strong>, nothing copied.";
        }
      } else {
        var big = fr.jumps[fr.jumps.length - 1], pr = fr.jumps[fr.jumps.length - 2];
        var fb = ans ? (ans === "fac" ? " Your prediction was right." : ans === "x2" ? (model === "dbl" ? " Exactly ×2 is true for this idealised model — and it is one example of a constant factor." : " Not exactly ×2 in CPython — look at the × previous column.") : " A fixed number of slots would keep the gaps the same size; they are not.") : "";
        m.innerHTML = fmt(N) + " appends, " + fr.resizes + " resizes, " + fmt(fr.copies) + " items copied: <strong>" + ((fr.len + fr.copies) / fr.len).toFixed(2) + " units of work per append</strong> on average. " +
          (model === "py" ? "The last jump went from " + pr.cap + " to " + big.cap + " slots (×" + (big.cap / pr.cap).toFixed(2) + "): each new block is a bit more than the previous one, about ×1.125." :
            "Each block is twice the previous one.") +
          " Because capacity grows by a factor, the gaps between jumps widen and the copying averages out to a constant — O(1) amortised." + fb;
      }
    }
    function drawChart(fr) {
      if (view === "bytes") {
        chart.draw([{ name: "sys.getsizeof(data)", color: "--accent", points: fr.pts, noDots: true }], { xr: [0, N] });
      } else {
        chart.draw([{ name: "(writes + copies) ÷ appends", color: "--blue", points: fr.avg, noDots: true }], { xr: [0, N], yr: [0, model === "py" ? 10 : 3] });
      }
      chart.el.setAttribute("aria-label", view === "bytes" ? "Step chart of list size in bytes against length" : "Chart of average work per append against length");
    }
    var player = U.Player(host, { build: build, render: render, fps: function (i) { return N <= 99 ? 2 : Math.min(140, 3 + i / 2.5); } });
    player.redraw = function () { if (frames.length) render(frames[cur], cur, frames); };
    player.load();
  }
  AAAnim.register("w10-capacity", capacity);

  /* ============================================================
     Task 5 — list or deque?
     ============================================================ */
  function dequeTask(host) {
    var START = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var SC = {
      a: { text: "(a) a to-do queue you always take from the front and add to the back",
        ans: "deque", why: "deque — both hot operations are at the ends, O(1) each; a list would be O(n) per <code>pop(0)</code>.",
        ops: [["pf"], ["pb", 13], ["pf"], ["pb", 14], ["pf"], ["pb", 15], ["pf"], ["pb", 16], ["pf"], ["pb", 17]] },
      b: { text: "(b) a table of scores you look up by row number thousands of times",
        ans: "list", why: "list — random indexing by position is O(1) on a list but O(n) on a deque.",
        ops: [["ix", 6], ["ix", 2], ["ix", 9], ["ix", 5], ["ix", 7], ["ix", 3], ["ix", 10], ["ix", 4]] },
      c: { text: "(c) a browser history where you add to one end and occasionally pop the other",
        ans: "deque", why: "deque — adds and pops at the two ends are what a deque is for.",
        ops: [["pb", 13], ["pb", 14], ["pb", 15], ["pf"], ["pb", 16], ["pb", 17], ["pf"], ["pb", 18], ["pf"]] }
    };
    var cur = "a", picks = {};
    U.title(host, "Animation · run each scenario on a list and on a deque");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("scenario", [["a", "(a) to-do queue"], ["b", "(b) score table"], ["c", "(c) history"]], cur, function (v) { cur = v; sync(); player.load(); }));
    host.appendChild(opts);
    var q = h("p", "w10-scen", "");
    host.appendChild(q);
    var ch = choice(host, "your choice:", [["list", "list"], ["deque", "deque"]], function (v) {
      picks[cur] = v; sync(); player.load();
    });
    var fb = h("p", "w10-fb", "");
    host.appendChild(fb);
    var laneL = lane("list", "one unbroken row — front changes shift everything"),
        laneD = lane("deque", "linked blocks — cheap at both ends, walks to reach the middle");
    var m = U.msg(host);

    function lane(name, sub) {
      var l = h("div", "w10-lane");
      var head = h("div", "w10-lhead", "<b>" + name + "</b> <span class='muted'>" + sub + "</span>");
      var cnt = h("span", "w10-lsteps", "");
      head.appendChild(cnt);
      var a = h("div", "arr w10-dq" + (name === "deque" ? " blocks" : ""));
      var bar = h("div", "w10-lbar", "<i></i>");
      l.appendChild(head); l.appendChild(a); l.appendChild(bar);
      host.appendChild(l);
      return { a: a, cnt: cnt, bar: bar.firstChild };
    }
    function sync() {
      var s = SC[cur];
      q.innerHTML = s.text + ".";
      ch.mark(picks[cur], picks[cur] ? (picks[cur] === s.ans ? "right" : "wrong") : "");
      fb.innerHTML = picks[cur] ? (picks[cur] === s.ans ? "Right: " : "Not quite. ") + s.why : "";
    }
    function build() {
      var s = SC[cur], data = START.slice(), f = [], cl = 0, cd = 0;
      f.push({ data: data.slice(), cl: 0, cd: 0, tl: {}, td: {}, op: null });
      s.ops.forEach(function (o) {
        var n = data.length, tl = {}, td = {}, sl = 0, sd = 0, j, desc, val = null, before = data.slice();
        if (o[0] === "pf") {
          val = data.shift();
          tl[0] = "bad"; for (j = 1; j < n; j++) tl[j] = "on";
          td[0] = "bad";
          sl = n; sd = 1;
          desc = "take from the front → <code>pop(0)</code> / <code>popleft()</code>";
        } else if (o[0] === "pb") {
          data.push(o[1]);
          tl[n] = "gold"; td[n] = "gold"; sl = 1; sd = 1;
          desc = "add " + o[1] + " at the back → <code>append(" + o[1] + ")</code>";
        } else {
          var i = o[1], d = Math.min(i, n - 1 - i);
          tl[i] = "good"; sl = 1;
          if (i <= n - 1 - i) for (j = 0; j <= i; j++) td[j] = j === i ? "good" : "on";
          else for (j = n - 1; j >= i; j--) td[j] = j === i ? "good" : "on";
          sd = d + 1;
          desc = "read row " + i + " → <code>scores[" + i + "]</code>";
          val = data[i];
        }
        cl += sl; cd += sd;
        f.push({ data: (o[0] === "pf" ? before : data).slice(), cl: cl, cd: cd, tl: tl, td: td, op: desc, sl: sl, sd: sd, val: val });
      });
      return f;
    }
    function paint(L, fr, t, steps, total) {
      L.a.innerHTML = fr.data.map(function (v, j) { return '<div class="cell ' + (t[j] || "") + '">' + v + "</div>"; }).join("");
      L.cnt.textContent = steps + " steps";
      L.bar.style.width = Math.max(1, steps / total * 100) + "%";
    }
    function render(fr, i, fs) {
      var last = fs[fs.length - 1], total = Math.max(last.cl, last.cd, 1);
      paint(laneL, fr, fr.tl, fr.cl, total);
      paint(laneD, fr, fr.td, fr.cd, total);
      var s = SC[cur];
      if (i === 0) {
        m.innerHTML = (picks[cur] ? "" : "Pick list or deque first. ") + "Then press <strong>play</strong> to run the scenario on both structures (12 items to start). Each highlighted cell is one step of work.";
      } else if (i < fs.length - 1) {
        m.innerHTML = "Operation " + i + ": " + fr.op + ". List: <strong>" + fr.sl + "</strong> step" + (fr.sl > 1 ? "s" : "") +
          ", deque: <strong>" + fr.sd + "</strong> step" + (fr.sd > 1 ? "s" : "") + ".";
      } else {
        var winner = last.cl < last.cd ? "list" : "deque";
        m.innerHTML = "Totals — list <strong>" + last.cl + "</strong>, deque <strong>" + last.cd + "</strong> steps: the <strong>" + winner + "</strong> wins. " +
          (cur === "b" ? "With 100 000 rows, a middle lookup on a deque walks tens of thousands of items; the list jumps straight there. (Real deques walk block by block, but it is still O(n).)"
            : "With 100 000 items, every <code>pop(0)</code> on a list shifts ~100 000 items; the deque still does one step.") +
          (picks[cur] ? (picks[cur] === s.ans ? " Matches your choice." : " Compare with your choice.") : "");
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.3; } });
    sync(); player.load();
  }
  AAAnim.register("w10-deque", dequeTask);
})();
