/* ============================================================
   AA — week 6 "Try it yourself" animations (The Doubling Experiment)
   w6-ratio-id, w6-four-studies, w6-two-axes, w6-fit-slope,
   w6-nlogn-drift, w6-noise-floor
   Timings here are SIMULATED from a step-count model (steps × a per-step
   cost, plus seeded noise) — every widget that shows seconds says so.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui;
  var h = U.h, btn = U.btn, seg = U.seg;

  /* ---------- small helpers (local to week 6) ---------- */
  function ext(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function rj(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }
  function ff(x, d) { return (x !== x) ? "nan" : x.toFixed(d); }            /* Python :.Nf (nan-aware) */
  function sp(n) { return Math.round(n).toLocaleString("en-US").replace(/,/g, " "); }  /* 1 000 000 like the page */
  function log2(x) { return Math.log(x) / Math.LN2; }
  function raw(s) { return "§§" + s; }                           /* show a CodeTrace value without quotes */
  function fixRaw(host) {
    host.querySelectorAll(".ct-var b").forEach(function (b) {
      var t = b.textContent;
      if (t.indexOf("\"§§") === 0) b.textContent = t.slice(3, -1);
      else if (t === "NaN") b.textContent = "nan";
    });
  }
  function note(host, text) { host.appendChild(h("p", "note-sim", text || "Simulated timings from a step-count model — run the real code in Colab for your own numbers.")); }
  function codeBlock(parent, src) {
    var box = h("div", "ct-code w6-code");
    src.split("\n").forEach(function (ln, j) {
      box.appendChild(h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + (U.pyLine(ln) || " ") + "</code>"));
    });
    parent.appendChild(box);
    return box;
  }
  function polyfitSlope(xs, ys) {      /* least-squares slope of ys on xs (what np.polyfit(..., 1)[0] returns) */
    var n = xs.length, mx = 0, my = 0, sxy = 0, sxx = 0, i;
    for (i = 0; i < n; i++) { mx += xs[i] / n; my += ys[i] / n; }
    for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
    return { slope: sxy / sxx, mx: mx, my: my };
  }
  function loglogSlope(sizes, times) {
    return polyfitSlope(sizes.map(Math.log), times.map(Math.log)).slope;
  }
  function cls(el, c) { el.classList.add(c); return el; }
  function pressed(b, on) { b.setAttribute("aria-pressed", String(!!on)); }

  /* ---------- Plot: crisp, theme-aware canvas; callers pass coordinates already in [0,1] ----------
     spec = { title, xlabel, ylabel, xticks:[{u,label,alpha}], yticks:[{v,label,alpha}],
              series:[{color, pts:[[u,v]], dashed, dots, width, name, alpha}],
              segs:[{u1,v1,u2,v2,color}], texts:[{u,v,text,color,align,dy}], hlines:[{v,color,dashed}],
              legend: bool }                                                                     */
  function Plot(parent, o) {
    o = o || {};
    var cv = h("canvas", "lc w6-plot");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", o.label || "chart");
    var H0 = o.height || 300;
    cv.style.height = H0 + "px";
    parent.appendChild(cv);
    var last = null;
    function draw(spec) {
      last = spec;
      var W = cv.clientWidth, H = cv.clientHeight || H0;
      if (!W) return;
      var dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      }
      var ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var small = W < 480;
      var fs = small ? 10 : 11.5;
      var mono = U.cssVar(parent, "--font-mono") || "monospace";
      var col = function (v) { return (v && v.indexOf("--") === 0) ? U.cssVar(parent, v) : v; };
      var L = (spec.ylabel ? 18 : 4) + (small ? 42 : 56), R = 14, T = spec.title && spec.showTitle !== false ? 30 : 14;
      var B = (spec.xlabel ? 40 : 26);
      var pw = W - L - R, ph = H - T - B;
      var X = function (u) { return L + u * pw; }, Y = function (v) { return T + (1 - v) * ph; };
      ctx.font = fs + "px " + mono;
      ctx.lineWidth = 1;
      (spec.yticks || []).forEach(function (t) {
        if (t.v < -0.001 || t.v > 1.001) return;
        ctx.globalAlpha = t.alpha == null ? 1 : t.alpha;
        ctx.strokeStyle = col("--border"); ctx.beginPath(); ctx.moveTo(L, Y(t.v)); ctx.lineTo(W - R, Y(t.v)); ctx.stroke();
        ctx.fillStyle = col("--muted"); ctx.textAlign = "right"; ctx.fillText(t.label, L - 6, Y(t.v) + 4);
      });
      (spec.xticks || []).forEach(function (t) {
        if (t.u < -0.001 || t.u > 1.001) return;
        ctx.globalAlpha = t.alpha == null ? 1 : t.alpha;
        ctx.strokeStyle = col("--border"); ctx.beginPath(); ctx.moveTo(X(t.u), T); ctx.lineTo(X(t.u), H - B); ctx.stroke();
        ctx.fillStyle = col("--muted"); ctx.textAlign = "center"; ctx.fillText(t.label, X(t.u), H - B + 15);
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col("--border-strong");
      ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, H - B); ctx.lineTo(W - R, H - B); ctx.stroke();
      ctx.fillStyle = col("--muted");
      if (spec.xlabel) { ctx.textAlign = "center"; ctx.fillText(spec.xlabel, L + pw / 2, H - 8); }
      if (spec.ylabel) {
        ctx.save(); ctx.translate(11, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
        ctx.fillText(spec.ylabel, 0, 0); ctx.restore();
      }
      if (spec.title && spec.showTitle !== false) {
        ctx.fillStyle = col("--heading"); ctx.textAlign = "center";
        ctx.font = "bold " + (fs + 1) + "px " + mono;
        ctx.fillText(spec.title, L + pw / 2, 18);
        ctx.font = fs + "px " + mono;
      }
      ctx.save();
      ctx.beginPath(); ctx.rect(L, T - 6, pw + 6, ph + 12); ctx.clip();
      (spec.hlines || []).forEach(function (l) {
        ctx.strokeStyle = col(l.color || "--muted"); ctx.lineWidth = 1.5;
        ctx.setLineDash(l.dashed ? [5, 5] : []);
        ctx.beginPath(); ctx.moveTo(L, Y(l.v)); ctx.lineTo(W - R, Y(l.v)); ctx.stroke();
        ctx.setLineDash([]);
      });
      (spec.segs || []).forEach(function (s) {
        ctx.strokeStyle = col(s.color || "--red"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(X(s.u1), Y(s.v1)); ctx.lineTo(X(s.u2), Y(s.v2)); ctx.stroke();
      });
      (spec.series || []).forEach(function (s) {
        var c = col(s.color || "--accent");
        ctx.globalAlpha = s.alpha == null ? 1 : s.alpha;
        ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = s.width || 2.5;
        ctx.setLineDash(s.dashed ? [6, 5] : []);
        if (s.line !== false && s.pts.length > 1) {
          ctx.beginPath();
          s.pts.forEach(function (p, j) { if (j) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); });
          ctx.stroke();
        }
        ctx.setLineDash([]);
        if (s.dots !== false) s.pts.forEach(function (p) {
          ctx.beginPath();
          if (s.square) ctx.rect(X(p[0]) - 4, Y(p[1]) - 4, 8, 8); else ctx.arc(X(p[0]), Y(p[1]), 4.2, 0, 7);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
      ctx.restore();
      (spec.texts || []).forEach(function (t) {
        ctx.fillStyle = col(t.color || "--text"); ctx.textAlign = t.align || "left";
        if (t.bold) ctx.font = "bold " + fs + "px " + mono;
        ctx.fillText(t.text, X(t.u) + (t.dx || 0), Y(t.v) + (t.dy || 0));
        ctx.font = fs + "px " + mono;
      });
      if (spec.legend) {
        var named = (spec.series || []).filter(function (s) { return s.name; });
        var ly = T + 8;
        named.forEach(function (s) {
          ctx.fillStyle = col(s.color);
          ctx.fillRect(L + 10, ly - 2, 16, 3);
          ctx.fillStyle = col("--text"); ctx.textAlign = "left";
          ctx.fillText(s.name, L + 32, ly + 3);
          ly += fs + 6;
        });
      }
    }
    if (window.ResizeObserver) new ResizeObserver(function () { if (last) draw(last); }).observe(cv);
    new MutationObserver(function () { if (last) draw(last); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return { draw: draw, el: cv };
  }

  /* ---------- the four studies of Task 2 (shared by Tasks 2–4) ----------
     cost model: seconds = steps(n) × cost per step × (1 ± 1 % seeded noise)                          */
  var STUDIES = {
    a: { fn: "sum_study", name: "(a) summing a list", short: "(a) sum",
         what: "<code>sum_study(n)</code> adds up a list of n numbers with one loop — n additions.",
         steps: function (n) { return n; }, cost: 4.9e-8, start: 100000, dbl: 5, expect: "≈ 2.0", exp: 2 },
    b: { fn: "contains_study", name: "(b) contains, worst case", short: "(b) contains",
         what: "<code>contains_study(n)</code> calls week 5's <code>contains(data, target)</code> on n items with a <em>missing</em> target — a full pass, n comparisons.",
         steps: function (n) { return n; }, cost: 3.6e-8, start: 100000, dbl: 5, expect: "≈ 2.0", exp: 2 },
    c: { fn: "dups_study", name: "(c) duplicate finder", short: "(c) duplicates",
         what: "<code>dups_study(n)</code> runs week 4's every-item-with-every-later-item check on n random numbers — n(n−1)/2 comparisons.",
         steps: function (n) { return n * (n - 1) / 2; }, cost: 7.5e-8, start: 500, dbl: 4, expect: "≈ 4.0", exp: 4 },
    d: { fn: "sort_study", name: "(d) sorted(data), shuffled", short: "(d) sorted",
         what: "<code>sort_study(n)</code> times <code>sorted(data)</code> on a shuffled list of n (list prepared before the clock starts) — about n·log₂n comparisons.",
         steps: function (n) { return n * log2(n); }, cost: 1.2e-8, start: 100000, dbl: 5, expect: "≈ 2.1–2.2", exp: 2.15 }
  };
  function runStudy(key, seed, sizesOverride) {
    var S = STUDIES[key], r = U.rng(seed * 7919 + key.charCodeAt(0) * 31);
    var sizes = sizesOverride || [], times = [], ratios = [], i, n;
    if (!sizesOverride) for (i = 0, n = S.start; i < S.dbl; i++, n *= 2) sizes.push(n);
    sizes.forEach(function (n, j) {
      var t = S.steps(n) * S.cost * (1 + (r() - 0.5) * 0.02);
      times.push(t);
      ratios.push(j ? t / times[j - 1] : NaN);
    });
    return { sizes: sizes, times: times, ratios: ratios };
  }
  var HEADER = rj("n", 9) + " " + rj("seconds", 12) + " " + rj("ratio", 7);
  function row(n, t, ratio) { return rj(n, 9) + " " + rj(ff(t, 5), 12) + " " + rj(ff(ratio, 2), 7); }

  /* ============================================================
     Task 1 — identify by ratio alone
     ============================================================ */
  function ratioId(host) {
    var NS = [1000, 2000, 4000, 8000], NL = ["1k", "2k", "4k", "8k"];
    var COLS = [
      { k: "A", v: [0.0021, 0.0042, 0.0084, 0.0167], d: 4, ans: "lin" },
      { k: "B", v: [0.0000004, 0.0000004, 0.0000004, 0.0000004], d: 7, ans: "const" },
      { k: "C", v: [0.0100, 0.0401, 0.1602, 0.6410], d: 4, ans: "quad" },
      { k: "D", v: [0.0000060, 0.0000065, 0.0000070, 0.0000075], d: 7, ans: "log" }
    ];
    var KINDS = [["const", "constant"], ["log", "logarithmic"], ["lin", "linear"], ["quad", "quadratic"]];
    var RIGHT = {
      A: "Right — A doubles each time: one loop over the data (linear).",
      B: "Right — B never changes: constant. The input size is irrelevant.",
      C: "Right — C quadruples: a loop inside a loop (quadratic).",
      D: "Right — D grows by a small fixed <em>amount</em> each doubling, not a multiple: the halving pattern, logarithmic."
    };
    var SIGN = { const: "a ratio of exactly 1 (no change at all)", log: "the same small <em>addition</em> every doubling",
                 lin: "a ratio of ≈ 2", quad: "a ratio of ≈ 4" };
    var NAME = { const: "constant", log: "logarithmic", lin: "linear", quad: "quadratic" };
    var mode = "ratio";
    COLS.forEach(function (c) {
      c.ratio = []; c.diff = [];
      for (var r = 1; r < 4; r++) { c.ratio.push(c.v[r] / c.v[r - 1]); c.diff.push(c.v[r] - c.v[r - 1]); }
    });

    U.title(host, "Animation · name the pattern from the numbers alone");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("compare neighbours by", [["ratio", "ratio  ÷"], ["diff", "difference  −"]], mode, function (v) { mode = v; player.redraw(); }));
    host.appendChild(opts);
    host.appendChild(h("p", "muted w6-small", "Rows are n = 1 000, 2 000, 4 000, 8 000; times in seconds (the table from the task). Bars are drawn to scale within each column."));
    var grid = h("div", "w6-cards");
    host.appendChild(grid);
    var right = {};
    COLS.forEach(function (c) {
      var card = h("div", "w6-card");
      card.appendChild(h("div", "w6-card-h", c.k));
      var bars = h("div", "vbars w6-mini");
      c.bars = c.v.map(function (x) {
        var b = h("div", "vb"); b.style.height = Math.max(3, x / c.v[3] * 100) + "%"; bars.appendChild(b); return b;
      });
      card.appendChild(bars);
      var rows = h("div", "w6-rows");
      c.gapEls = [null];
      c.rowEls = c.v.map(function (x, r) {
        if (r) { var g = h("div", "w6-between", '<b class="w6-chip"></b>'); rows.appendChild(g); c.gapEls.push(g); }
        var el = h("div", "w6-row", '<span class="muted">' + NL[r] + "</span><span>" + x.toFixed(c.d) + "</span>");
        rows.appendChild(el); return el;
      });
      card.appendChild(rows);
      var vb = h("div", "w6-verdict");
      c.vbtns = KINDS.map(function (kd) {
        var b = btn(kd[1], "", function () { pick(c, kd[0], b); });
        vb.appendChild(b); return b;
      });
      card.appendChild(vb);
      c.fb = h("p", "w6-fb", "");
      card.appendChild(c.fb);
      c.card = card;
      grid.appendChild(card);
    });
    var stats = h("div", "anim-stats");
    var sRight = U.stat("verdicts right");
    sRight.set("0 / 4");
    stats.appendChild(sRight.el);
    host.appendChild(stats);
    var m = U.msg(host);

    function pick(c, kind, b) {
      if (right[c.k]) return;
      if (kind === c.ans) {
        right[c.k] = true;
        c.vbtns.forEach(function (x) { x.disabled = x !== b; x.className = x === b ? "w6-right" : ""; });
        c.fb.innerHTML = RIGHT[c.k];
      } else {
        b.className = "w6-wrong";
        c.fb.innerHTML = "Not " + NAME[kind] +
          ": that would show " + SIGN[kind] + ". Press play and read " + c.k + "'s " + (c.k === "D" ? "ratios <em>and</em> differences" : "ratios") + ".";
      }
      var k = Object.keys(right).length;
      sRight.set(k + " / 4");
    }
    function chip(c, r) {
      if (mode === "ratio") return "×" + c.ratio[r - 1].toFixed(2);
      var d = c.diff[r - 1];
      return (d < 0 ? "−" : "+") + Math.abs(d).toFixed(c.d);
    }
    function build() {
      var f = [{ c: -1, r: 0 }];
      for (var c = 0; c < 4; c++) { for (var r = 1; r < 4; r++) f.push({ c: c, r: r }); f.push({ c: c, r: 4 }); }
      f.push({ c: 4, r: 0 });
      return f;
    }
    function list(a, fn) { return a.map(fn).join(", "); }
    var curFr = null;
    function render(fr) {
      curFr = fr;
      COLS.forEach(function (c, ci) {
        var started = ci < fr.c || (ci === fr.c);
        c.card.classList.toggle("on", ci === fr.c && fr.r < 4);
        c.bars.forEach(function (b, r) {
          var shown = ci < fr.c || (ci === fr.c && r <= Math.min(fr.r, 3));
          b.style.opacity = shown ? "1" : "0";
          b.className = "vb" + (ci === fr.c && (r === fr.r || r === fr.r - 1) && fr.r < 4 ? " on" : "");
        });
        c.rowEls.forEach(function (el, r) {
          var live = ci === fr.c && fr.r < 4;
          el.className = "w6-row" + (live && (r === fr.r || r === fr.r - 1) ? " on" : "");
          if (!r) return;
          var shown = ci < fr.c || (ci === fr.c && r <= fr.r);
          c.gapEls[r].firstChild.textContent = shown ? chip(c, r) : "";
          c.gapEls[r].className = "w6-between" + (live && r === fr.r ? " on" : "");
        });
        void started;
      });
      var c = COLS[fr.c];
      if (fr.c < 0) {
        m.innerHTML = "Four columns of timings and no code. Guess each pattern with its buttons if you like, then press <strong>play</strong> to work out every ratio (each time ÷ the one above it).";
      } else if (fr.c > 3) {
        var k = Object.keys(right).length;
        m.innerHTML = "All ratios in. The §6.1 fingerprints: ≈ 1 → constant, a fixed tiny <em>addition</em> → halving, ≈ 2 → one loop, ≈ 4 → loop inside a loop. " +
          (k === 4 ? "<strong>You named all four.</strong>" : "Now name the columns you have not named yet (" + k + " / 4 so far).");
      } else if (fr.r < 4) {
        var a = c.v[fr.r - 1], b = c.v[fr.r];
        m.innerHTML = "Column <strong>" + c.k + "</strong>, n = " + sp(NS[fr.r - 1]) + " → " + sp(NS[fr.r]) + ": " +
          b.toFixed(c.d) + " ÷ " + a.toFixed(c.d) + " = <strong>×" + c.ratio[fr.r - 1].toFixed(2) + "</strong>" +
          " <span class='muted'>(difference " + (b - a >= 0 ? "+" : "−") + Math.abs(b - a).toFixed(c.d) + " s)</span>";
      } else {
        var rs = list(c.ratio, function (x) { return x.toFixed(2); });
        var ds = list(c.diff, function (x) { return "+" + x.toFixed(c.d); });
        m.innerHTML = {
          A: "A: ratios <strong>" + rs + "</strong> — the time doubles whenever n doubles.",
          B: "B: ratios <strong>" + rs + "</strong> — the time does not move at all when n doubles.",
          C: "C: ratios <strong>" + rs + "</strong> — twice the data, four times the time.",
          D: "D: ratios <strong>" + rs + "</strong> — not 1, not 2, and sliding down. Its differences are <strong>" + ds +
             "</strong>: the same small amount added per doubling" + (mode === "ratio" ? " (switch to <em>difference</em> to see it)." : ".")
        }[c.k];
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.4; } });
    player.redraw = function () { if (curFr) render(curFr); };
    player.load();
  }

  /* ============================================================
     Task 2 — your own doubling study (the harness, traced)
     ============================================================ */
  function fourStudies(host) {
    var cur = "a", seed = 1, preds = {}, results = {};
    host.classList.add("w6-wide");
    U.title(host, "Animation · run doubling() on four functions and record the ratio columns");
    var opts = h("div", "anim-opts");
    opts.appendChild(cls(seg("study", [["a", "(a) sum"], ["b", "(b) contains"], ["c", "(c) duplicates"], ["d", "(d) sorted"]], cur, function (v) {
      cur = v; syncPred(); ct.load();
    }), "w6-seg2"));
    opts.appendChild(btn("re-run (new noise)", "", function () { seed++; results = {}; ct.load(); }));
    host.appendChild(opts);
    var what = h("p", "w6-small", "");
    host.appendChild(what);
    var popts = h("div", "anim-opts");
    popts.appendChild(h("span", "lab", "predict this study's ratio column:"));
    var PRED = [["1", "≈ 1"], ["2", "≈ 2"], ["2.1", "≈ 2.1–2.2"], ["4", "≈ 4"]];
    var pbtns = PRED.map(function (p) {
      var b = btn(p[1], "", function () { preds[cur] = p[0]; syncPred(); });
      popts.appendChild(b); return b;
    });
    var pseg = h("span", "seg"); pbtns.forEach(function (b) { pseg.appendChild(b); });
    popts.appendChild(cls(h("span", "", ""), "w6-seg2")).appendChild(pseg);
    host.appendChild(popts);
    function syncPred() {
      pbtns.forEach(function (b, j) { pressed(b, preds[cur] === PRED[j][0]); });
      what.innerHTML = STUDIES[cur].what;
    }

    function code() {
      var S = STUDIES[cur];
      return [
        "def doubling(func, start_n=10000, doublings=5):",
        "    \"\"\"Time func at n, 2n, 4n ... and print the ratio each time.\"\"\"",
        "    sizes, times = [], []",
        "    n = start_n",
        "    previous = None",
        "    print(f\"{'n':>9} {'seconds':>12} {'ratio':>7}\")",
        "    for _ in range(doublings):",
        "        t = time_it(func, n)",
        "        ratio = t / previous if previous else float('nan')",
        "        print(f\"{n:>9} {t:>12.5f} {ratio:>7.2f}\")",
        "        sizes.append(n); times.append(t)",
        "        previous = t",
        "        n = n * 2",
        "    return sizes, times",
        "",
        "sizes, times = doubling(" + S.fn + ", start_n=" + S.start + (S.dbl !== 5 ? ", doublings=" + S.dbl : "") + ")"
      ].join("\n");
    }
    var PL = { sayPred: { "1": "≈ 1", "2": "≈ 2", "2.1": "≈ 2.1–2.2", "4": "≈ 4" } };
    function build() {
      var S = STUDIES[cur], res = runStudy(cur, seed), f = [], out = [];
      var v = { func: raw(S.fn), start_n: S.start, doublings: S.dbl };
      var cnt = function (k, last) { return { "pass": k + " / " + S.dbl, "last ratio": last }; };
      function push(line, nv, note, c) { v = ext(v, nv || {}); f.push({ line: line, vars: v, out: out.slice(), note: note, counters: c }); }
      f.push({ line: 16, vars: {}, out: [], counters: cnt(0, "—"),
        note: "Pick your prediction for <strong>" + S.name + "</strong> above, then press <strong>play</strong>." });
      push(3, { sizes: [], times: [] }, "Enter <code>doubling</code> with <code>func = " + S.fn + "</code>. Two empty lists will collect the results.", cnt(0, "—"));
      push(4, { n: S.start }, "Start at n = " + sp(S.start) + (cur === "c" ? " — a nested-loop study must start small (§6.2)." : "."), cnt(0, "—"));
      push(5, { previous: null }, "No earlier time yet.", cnt(0, "—"));
      out.push(HEADER);
      push(6, {}, "Print the table header.", cnt(0, "—"));
      var n = S.start, prev = null, lastR = "—";
      for (var k = 0; k < S.dbl; k++) {
        var t = res.times[k], ratio = prev ? t / prev : NaN;
        push(7, { _: k }, "Doubling round " + (k + 1) + " of " + S.dbl + ", n = " + sp(n) + ".", cnt(k + 1, lastR));
        push(8, { t: +t.toPrecision(4) }, "<code>time_it</code> runs <code>" + S.fn + "(" + n + ")</code> five times and keeps the fastest: <strong>" + ff(t, 5) + " s</strong> <span class='muted'>(simulated)</span>.", cnt(k + 1, lastR));
        push(9, { ratio: prev ? +ratio.toFixed(4) : raw("nan") }, prev ? "ratio = t / previous = " + ff(t, 5) + " / " + ff(prev, 5) + " = <strong>" + ff(ratio, 2) + "</strong>"
          : "<code>previous</code> is None, so the ratio is <code>nan</code> (not a number) — there is nothing to divide by yet.", cnt(k + 1, prev ? ff(ratio, 2) : "—"));
        if (prev) lastR = ff(ratio, 2);
        out.push(row(n, t, ratio));
        push(10, {}, "Print one row: n right-aligned in 9 characters, seconds with 5 decimals, ratio with 2.", cnt(k + 1, lastR));
        push(11, { sizes: res.sizes.slice(0, k + 1), times: res.times.slice(0, k + 1).map(function (x) { return +x.toPrecision(4); }) }, "Keep n and t for plotting later.", cnt(k + 1, lastR));
        push(12, { previous: +t.toPrecision(4) }, "Remember this time for the next ratio.", cnt(k + 1, lastR));
        n *= 2; prev = t;
        push(13, { n: n }, "Double n → " + sp(n) + ".", cnt(k + 1, lastR));
      }
      push(14, {}, "All " + S.dbl + " rounds done: return both lists.", cnt(S.dbl, lastR));
      var rs = res.ratios.slice(1).map(function (x) { return x.toFixed(2); }).join(", ");
      f.push({ line: 16, vars: { sizes: res.sizes, times: res.times.map(function (x) { return +x.toPrecision(4); }) }, out: out.slice(),
        counters: cnt(S.dbl, lastR), done: true, res: res,
        note: "Ratio column for " + S.name + ": <strong>" + rs + "</strong>. The page expects " + S.expect + "." +
          (preds[cur] ? " You predicted " + PL.sayPred[preds[cur]] + (verdict(preds[cur], cur) ? " — <strong>right</strong>." : " — compare with the column.") : "") +
          (Object.keys(results).length + 1 < 4 ? " Pick another study to fill in the record below." : "") });
      return f;
    }
    function verdict(p, key) { return p === { a: "2", b: "2", c: "4", d: "2.1" }[key]; }
    var ct = U.CodeTrace(host, {
      code: code, build: build, varsTitle: "variables", outTitle: "printed table",
      fps: function (i, frames) { return i < 6 ? 1.6 : 3; },
      onFrame: function (fr) {
        fixRaw(host);
        if (fr.done) { results[cur] = fr.res; paintTable(); }
      }
    });
    var tWrap = h("div", "anim-table-wrap");
    ct.extra.appendChild(h("div", "ct-h", "your record of the four ratio columns"));
    ct.extra.appendChild(tWrap);
    var tab = U.table(tWrap, ["study", "start_n", "ratio column", "you predicted", "page expects"]);
    note(ct.extra);
    function paintTable() {
      tab.rows(["a", "b", "c", "d"].map(function (k) {
        var S = STUDIES[k], r = results[k];
        return [S.short, sp(S.start),
          r ? r.ratios.slice(1).map(function (x) { return x.toFixed(2); }).join("  ") : "<span class='muted'>not run yet</span>",
          preds[k] ? PL.sayPred[preds[k]] + (verdict(preds[k], k) ? " ✓" : " ✗") : "—",
          r ? S.expect : "?"];
      }), ["a", "b", "c", "d"].indexOf(cur));
    }
    syncPred(); paintTable(); ct.load();
  }

  /* ============================================================
     Task 3 — one figure, two curves: linear axes ↔ log–log
     ============================================================ */
  function twoAxes(host) {
    var SIZES = [1000, 2000, 4000, 8000, 16000];
    var B = runStudy("b", 3, SIZES), C = runStudy("c", 3, SIZES);
    var tNow = 0, anim = 0, parts = { labels: true, title: true, legend: true };
    U.title(host, "Animation · the same two curves, two kinds of axes");
    var opts = h("div", "anim-opts");
    var axSeg = seg("axes", [["lin", "linear"], ["log", "log–log"]], "lin", function (v) { player.stop(); morphTo(v === "log" ? 1 : 0); });
    opts.appendChild(axSeg);
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    opts2.appendChild(h("span", "lab", "plot parts:"));
    [["labels", "axis labels"], ["title", "title"], ["legend", "legend"]].forEach(function (p) {
      var b = btn(p[1], "", function () { parts[p[0]] = !parts[p[0]]; pressed(b, parts[p[0]]); paint(); });
      pressed(b, true); b.className = "w6-tog";
      opts2.appendChild(b);
    });
    host.appendChild(opts2);
    var plot = Plot(host, { height: 300, label: "Running time against input size for the worst-case contains search and the duplicate finder" });
    var badge = h("p", "w6-small w6-badge", "");
    host.appendChild(badge);
    note(host, "Simulated timings from a step-count model (n = 1 000 … 16 000 for both studies) — run the real code in Colab for your own numbers.");

    var quiz = h("div", "w6-quiz");
    quiz.appendChild(h("p", "", "Which version would you put in front of…"));
    var fb = h("p", "w6-fb", "");
    [["a manager deciding whether the duplicate finder can ship", "lin"], ["a technical appendix that must show the growth pattern", "log"]].forEach(function (q) {
      var r = h("div", "anim-opts");
      r.appendChild(h("span", "lab", q[0] + ":"));
      var bs = [["lin", "linear axes"], ["log", "log–log axes"]].map(function (o) {
        var b = btn(o[1], "", function () {
          if (o[0] === q[1]) {
            bs.forEach(function (x) { x.disabled = true; x.className = x === b ? "w6-right" : ""; });
            fb.innerHTML = q[1] === "lin" ? "Yes — the linear plot shows the practical horror: one curve shoots off the top while the other hugs the floor."
              : "Yes — the log–log plot shows the structure: two straight lines, slope ≈ 1 and slope ≈ 2.";
          } else {
            b.className = "w6-wrong";
            fb.innerHTML = q[1] === "lin" ? "A decision-maker needs to see the cost, not a slope. Which picture makes the danger obvious at a glance?"
              : "An appendix needs the structure: which picture turns both curves into lines whose slopes you can read?";
          }
        });
        r.appendChild(b); return b;
      });
      quiz.appendChild(r);
    });
    quiz.appendChild(fb);

    var quizSlot = h("div", "");
    host.appendChild(quizSlot);
    var m = U.msg(host);
    var XL = [0, 16000], LX = [Math.log10(800), Math.log10(20000)];
    var YL = [0, 10], LY = [-5, 1.3];
    function ux(x, t) { var a = x / XL[1], b = (Math.log10(x) - LX[0]) / (LX[1] - LX[0]); return (1 - t) * a + t * b; }
    function vy(y, t) { var a = y / YL[1], b = (Math.log10(y) - LY[0]) / (LY[1] - LY[0]); return (1 - t) * a + t * b; }
    var upto = 0;
    function paint() {
      var t = tNow, ease = t * t * (3 - 2 * t), small = plot.el.clientWidth < 480;
      var kl = function (x) { return small ? (x / 1000) + "k" : sp(x); };
      var xt = [], yt = [];
      [0, 4000, 8000, 12000, 16000].forEach(function (x) { xt.push({ u: x / XL[1], label: x ? kl(x) : "0", alpha: 1 - ease }); });
      SIZES.forEach(function (x) { xt.push({ u: (Math.log10(x) - LX[0]) / (LX[1] - LX[0]), label: kl(x), alpha: ease }); });
      [0, 2.5, 5, 7.5, 10].forEach(function (y) { yt.push({ v: y / YL[1], label: String(y), alpha: 1 - ease }); });
      [-5, -4, -3, -2, -1, 0, 1].forEach(function (e) { yt.push({ v: (e - LY[0]) / (LY[1] - LY[0]), label: e === 0 ? "1" : e === 1 ? "10" : "1e" + e, alpha: ease }); });
      var pb = [], pc = [];
      for (var i = 0; i < upto; i++) {
        pb.push([ux(SIZES[i], ease), vy(B.times[i], ease)]);
        pc.push([ux(SIZES[i], ease), vy(C.times[i], ease)]);
      }
      var texts = [];
      if (ease > 0.98 && upto === 5) {
        var sb = loglogSlope(SIZES, B.times), sc = loglogSlope(SIZES, C.times);
        texts.push({ u: pb[4][0], v: pb[4][1], text: "slope " + sb.toFixed(2), color: "--blue", align: "right", dy: -10, bold: true });
        texts.push({ u: pc[2][0], v: pc[2][1], text: "slope " + sc.toFixed(2), color: "--accent", align: "right", dx: -8, dy: -6, bold: true });
      }
      if (ease < 0.02 && upto === 5) {
        texts.push({ u: pc[4][0], v: pc[4][1], text: C.times[4].toFixed(1) + " s", color: "--accent", align: "right", dx: -8, dy: 4, bold: true });
        texts.push({ u: pb[4][0], v: pb[4][1], text: (B.times[4] * 1000).toFixed(2) + " ms" + (small ? "" : " — flat on the floor"), color: "--blue", align: "right", dx: -8, dy: -8 });
      }
      plot.draw({
        title: "Running time vs input size" + (ease > 0.5 && !small ? " (log–log)" : ""), showTitle: parts.title,
        xlabel: parts.labels ? "input size n" + (ease > 0.5 ? "  (log scale)" : "") : "",
        ylabel: parts.labels ? "time (seconds)" + (ease > 0.5 ? " (log)" : "") : "",
        xticks: xt, yticks: yt, legend: parts.legend,
        series: [
          { name: small ? "(b) contains" : "(b) contains, worst case", color: "--blue", pts: pb },
          { name: small ? "(c) duplicates" : "(c) duplicate finder", color: "--accent", pts: pc, square: true }
        ],
        texts: texts
      });
      var missing = [];
      if (!parts.labels) missing.push("axis labels");
      if (!parts.title) missing.push("a title");
      if (!parts.legend) missing.push("a legend");
      badge.innerHTML = missing.length ? "<strong class='w6-bad'>Decoration, not evidence:</strong> this plot is missing " + missing.join(" and ") + "."
        : "<strong class='w6-good'>Evidence:</strong> labelled axes (with units), a title and a legend for the two lines.";
    }
    function morphTo(target) {
      cancelAnimationFrame(anim);
      if (upto < 5) upto = 5;
      var from = tNow, t0 = null;
      axSeg.querySelectorAll("button").forEach(function (b, j) { pressed(b, (j === 1) === (target === 1)); });
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = U.REDUCED ? 1 : Math.min(1, (ts - t0) / 900);
        tNow = from + (target - from) * k;
        paint();
        if (k < 1) anim = requestAnimationFrame(step);
        else { m.innerHTML = target ? LOGMSG() : LINMSG(); if (target) quizSlot.appendChild(quiz); }
      }
      anim = requestAnimationFrame(step);
    }
    function LINMSG() {
      return "Linear axes: at n = 16 000 the duplicate finder takes <strong>" + C.times[4].toFixed(1) + " s</strong> while the search takes " +
        (B.times[4] * 1000).toFixed(2) + " ms — so small that its whole curve is squashed onto the axis.";
    }
    function LOGMSG() {
      return "Log–log axes: both studies become straight lines. Their slopes (≈ 1 and ≈ 2) are the growth patterns, and the gap between them is readable at every size.";
    }
    function build() {
      var f = [{ k: 0, t: 0 }];
      for (var k = 1; k <= 5; k++) f.push({ k: k, t: 0 });
      f.push({ k: 5, t: 0, hold: true });
      for (var j = 1; j <= 14; j++) f.push({ k: 5, t: j / 14 });
      f.push({ k: 5, t: 1, end: true });
      return f;
    }
    function render(fr) {
      cancelAnimationFrame(anim);
      upto = fr.k; tNow = fr.t; paint();
      axSeg.querySelectorAll("button").forEach(function (b, j) { pressed(b, (j === 1) === (fr.t >= 0.5)); });
      if (fr.k === 0) m.innerHTML = "Empty axes, n up to 16 000. Before you press <strong>play</strong>: which curve will shoot off the top, and what will the other one look like?";
      else if (fr.t === 0 && !fr.hold) m.innerHTML = "n = " + sp(SIZES[fr.k - 1]) + ": search " + ff(B.times[fr.k - 1], 5) + " s, duplicates " + ff(C.times[fr.k - 1], 5) + " s.";
      else if (fr.hold) m.innerHTML = LINMSG() + " Now watch both axes switch to logarithmic scale…";
      else if (fr.end) { m.innerHTML = LOGMSG(); quizSlot.appendChild(quiz); }
      else m.innerHTML = "Switching to log–log: every factor of 10 now gets the same space on each axis.";
    }
    var player = U.Player(host, { build: build, render: render, fps: function (i) { return i <= 6 ? 1.4 : 14; } });
    player.load();
  }

  /* ============================================================
     Task 4 — fit the slope, don't just guess it
     ============================================================ */
  function fitSlope(host) {
    var cur = "a", guess = 0.5, disturb = false, fits = {};
    U.title(host, "Animation · fit the best straight line through the log–log points");
    codeBlock(host, "import numpy as np\n\ndef loglog_slope(sizes, times):\n    \"\"\"Best-fit slope through the points on log-log axes.\"\"\"\n    slope, intercept = np.polyfit(np.log(sizes), np.log(times), 1)\n    return slope");
    var opts = h("div", "anim-opts w6-gap");
    opts.appendChild(cls(seg("study", [["a", "(a) sum"], ["b", "(b) contains"], ["c", "(c) duplicates"], ["d", "(d) sorted"]], cur, function (v) { cur = v; player.load(); }), "w6-seg2"));
    var bDist = btn("disturb the last run (×1.6)", "w6-tog", function () { disturb = !disturb; pressed(bDist, disturb); fits = {}; paintTable(); player.load(); },
      "Pretend background load slowed the largest run by 60 %");
    pressed(bDist, false);
    opts.appendChild(bDist);
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var sl = h("input"); sl.type = "range"; sl.min = "0"; sl.max = "3"; sl.step = "0.05"; sl.value = String(guess);
    sl.setAttribute("aria-label", "Your slope guess");
    var sv = h("span", "lab", "");
    opts2.appendChild(h("span", "lab", "your slope guess"));
    opts2.appendChild(sl); opts2.appendChild(sv);
    sl.addEventListener("input", function () { guess = parseFloat(sl.value); player.load(); });
    host.appendChild(opts2);
    var plot = Plot(host, { height: 280, label: "Log-log points of one study with a candidate straight line and its misfit" });
    var stats = h("div", "anim-stats");
    var sSlope = U.stat("line slope"), sMis = U.stat("squared misfit"), sR = U.stat("last ratio");
    [sSlope, sMis, sR].forEach(function (s) { stats.appendChild(s.el); });
    host.appendChild(stats);
    var m = U.msg(host);
    var tWrap = h("div", "anim-table-wrap");
    host.appendChild(tWrap);
    var tab = U.table(tWrap, ["study", "fitted slope", "2<sup>slope</sup>", "last ratio", "agree"]);
    note(host);

    function data() {
      var r = runStudy(cur, 1);
      if (disturb) {
        r.times = r.times.slice(); r.times[r.times.length - 1] *= 1.6;
        var k = r.times.length - 1; r.ratios = r.ratios.slice(); r.ratios[k] = r.times[k] / r.times[k - 1];
      }
      var xs = r.sizes.map(Math.log), ys = r.times.map(Math.log), fit = polyfitSlope(xs, ys);
      return { r: r, xs: xs, ys: ys, fit: fit };
    }
    function misfit(D, k) {
      var s = 0; D.xs.forEach(function (x, i) { var e = D.ys[i] - (D.fit.my + k * (x - D.fit.mx)); s += e * e; }); return s;
    }
    function build() {
      var D = data(), f = [], N = 22;
      f.push({ k: guess, D: D, j: 0 });
      for (var j = 1; j <= N; j++) {
        var e = j / N; e = e * e * (3 - 2 * e);
        f.push({ k: guess + (D.fit.slope - guess) * e, D: D, j: j });
      }
      f[f.length - 1].end = true;
      return f;
    }
    function render(fr) {
      var D = fr.D, xs = D.xs, ys = D.ys;
      sv.textContent = guess.toFixed(2);
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var px = (x1 - x0) * 0.12, py = Math.max((y1 - y0) * 0.15, 0.3);
      x0 -= px; x1 += px; y0 -= py; y1 += py;
      var U_ = function (x) { return (x - x0) / (x1 - x0); }, V = function (y) { return (y - y0) / (y1 - y0); };
      var lineY = function (x) { return D.fit.my + fr.k * (x - D.fit.mx); };
      var xt = D.r.sizes.map(function (n) { return { u: U_(Math.log(n)), label: n >= 1e6 ? (n / 1e6) + "M" : n >= 1000 ? (n / 1000) + "k" : String(n) }; });
      var yt = [];
      for (var e = Math.ceil(y0 / Math.LN10 * 2) / 2; e <= y1 / Math.LN10; e += 0.5) {
        var val = Math.pow(10, e);
        yt.push({ v: V(e * Math.LN10), label: Math.abs(e - Math.round(e)) < 1e-9 ? "1e" + Math.round(e) : val.toPrecision(1) });
      }
      var segs = xs.map(function (x, i) { return { u1: U_(x), v1: V(ys[i]), u2: U_(x), v2: V(lineY(x)), color: "--red" }; });
      plot.draw({
        xlabel: "n  (log scale)", ylabel: "seconds (log)", xticks: xt, yticks: yt, segs: segs,
        series: [
          { color: fr.end ? "--green" : "--muted", pts: [[0, V(lineY(x0))], [1, V(lineY(x1))]], dots: false, width: 2, dashed: !fr.end },
          { color: "--blue", pts: xs.map(function (x, i) { return [U_(x), V(ys[i])]; }), line: false }
        ],
        texts: fr.end ? [{ u: 0.02, v: 0.95, text: "np.polyfit → slope = " + D.fit.slope.toFixed(2), color: "--green", bold: true }] : []
      });
      var S = STUDIES[cur], lastR = D.r.ratios[D.r.ratios.length - 1];
      sSlope.set(fr.k.toFixed(2)); sMis.set(misfit(D, fr.k).toFixed(4)); sR.set(lastR.toFixed(2));
      if (fr.j === 0) {
        m.innerHTML = "Study " + S.name + " on log–log axes. Drag <strong>your slope guess</strong> until the red misfit sticks are as short as you can make them, then press <strong>play</strong> to let the least-squares fit finish the job.";
      } else if (!fr.end) {
        m.innerHTML = "Turning the line towards the slope that makes the total squared misfit smallest (that is what <code>np.polyfit(…, 1)</code> computes)…";
      } else {
        var s = D.fit.slope, p2 = Math.pow(2, s), ok = Math.abs(p2 - lastR) / lastR < 0.05;
        fits[cur] = { s: s, p2: p2, r: lastR, ok: ok };
        m.innerHTML = "<code>loglog_slope</code> → <strong>" + s.toFixed(2) + "</strong> (you guessed " + guess.toFixed(2) + "). Slope " + s.toFixed(2) + " predicts a doubling ratio of 2<sup>" + s.toFixed(2) + "</sup> = " + p2.toFixed(2) +
          "; the last measured ratio is " + lastR.toFixed(2) + (ok ? " — they <strong>agree</strong>." : " — they <strong>disagree</strong>.") +
          (disturb ? " One slow run moved the last ratio a lot and dragged the slope too: an outlier biases both, so look at the raw samples before trusting either number."
            : cur === "d" ? " For sorting the slope sits a little above 1 and depends on the size range — a straight-line fit is evidence about this range, not a proof." : "");
        paintTable();
      }
    }
    function paintTable() {
      tab.rows(["a", "b", "c", "d"].map(function (k) {
        var F = fits[k];
        return [STUDIES[k].short + (disturb && F ? " *" : ""), F ? F.s.toFixed(2) : "—", F ? F.p2.toFixed(2) : "—", F ? F.r.toFixed(2) : "—",
          F ? (F.ok ? "<span class='w6-good'>yes</span>" : "<span class='w6-bad'>no</span>") : "<span class='muted'>—</span>"];
      }), ["a", "b", "c", "d"].indexOf(cur));
    }
    var player = U.Player(host, { build: build, render: render, fps: function (i) { return i === 0 ? 1.2 : 9; } });
    paintTable();
    player.load();
  }

  /* ============================================================
     Task 5 — watch n log n drift
     ============================================================ */
  function nlognDrift(host) {
    var mode = "ideal", dbl = 7, seed = 5, pred = null;
    U.title(host, "Animation · doubling(sorted_wrapper, start_n=10000, doublings=7)");
    var opts = h("div", "anim-opts");
    opts.appendChild(cls(seg("what is timed", [["ideal", "ideal n·log₂n model"], ["sort", "sort only"], ["wrap", "shuffle + sort (wrapper)"]], mode, function (v) { mode = v; player.load(); }), "w6-seg1"));
    opts.appendChild(seg("doublings", [[7, "7"], [12, "12"]], dbl, function (v) { dbl = v; player.load(); }));
    host.appendChild(opts);
    var popts = h("div", "anim-opts");
    popts.appendChild(h("span", "lab", "predict: the ratio column will…"));
    var ps = h("span", "seg");
    var pb = [["settle", "settle on one number"], ["drift", "drift"]].map(function (p) {
      var b = btn(p[1], "", function () { pred = p[0]; pb.forEach(function (x, j) { pressed(x, pb[j] === b); }); });
      pressed(b, false); ps.appendChild(b); return b;
    });
    popts.appendChild(cls(h("span", "", ""), "w6-seg2")).appendChild(ps);
    host.appendChild(popts);
    var scope = h("p", "w6-small", "");
    host.appendChild(scope);
    var two = h("div", "w6-two");
    var left = h("div", ""), rightCol = h("div", "");
    left.appendChild(h("div", "ct-h", "printed table"));
    var con = h("pre", "ct-out w6-con");
    left.appendChild(con);
    rightCol.appendChild(h("div", "ct-h", "ratio column, plotted"));
    two.appendChild(left); two.appendChild(rightCol);
    host.appendChild(two);
    var plot = Plot(rightCol, { height: 230, label: "Doubling ratios for the sorting study compared with 2" });
    var stats = h("div", "anim-stats");
    var sLast = U.stat("latest ratio"), sSlope = U.stat("fitted slope");
    stats.appendChild(sLast.el); stats.appendChild(sSlope.el);
    host.appendChild(stats);
    var m = U.msg(host);
    var chk = h("div", "w6-check");
    host.appendChild(chk);
    var simNote = h("p", "note-sim", "");
    host.appendChild(simNote);
    var ideal = function (n) { return 2 + 2 / log2(n); };   /* T(2n)/T(n) for T = n·log₂n */
    chk.innerHTML = "<div class='ct-h'>§6.5's table, from T(2n)/T(n) = 2 + 2/log₂n</div>" +
      [[1000, 2000], [2000, 4000], [4000, 8000], [1000000, 2000000]].map(function (p) {
        return "<span class='anim-stat'>" + sp(p[0]) + " → " + sp(p[1]) + "<b>" + ideal(p[0]).toFixed(2) + "</b></span>";
      }).join(" ");

    function times() {
      var r = U.rng(seed * 101 + (mode === "wrap" ? 7 : 3)), sizes = [], ts = [];
      for (var k = 0, n = 10000; k < dbl; k++, n *= 2) {
        var sort = 1.2e-8 * n * log2(n);
        var t = mode === "ideal" ? sort : mode === "sort" ? sort * (1 + (r() - 0.5) * 0.012) : (3.5e-7 * n + sort) * (1 + (r() - 0.5) * 0.012);
        sizes.push(n); ts.push(t);
      }
      return { sizes: sizes, times: ts };
    }
    function build() {
      var D = times(), f = [{ k: 0, D: D }];
      for (var k = 1; k <= dbl; k++) f.push({ k: k, D: D });
      f.push({ k: dbl, D: D, end: true });
      return f;
    }
    function render(fr) {
      var D = fr.D, lines = [HEADER], ratios = [];
      for (var i = 0; i < fr.k; i++) {
        var r = i ? D.times[i] / D.times[i - 1] : NaN;
        ratios.push(r);
        lines.push(row(D.sizes[i], D.times[i], r));
      }
      if (fr.end) lines.push("", "slope = " + loglogSlope(D.sizes, D.times).toFixed(2));
      con.textContent = lines.join("\n");
      scope.innerHTML = {
        ideal: "Computed, not measured: T(n) = c·n·log₂n exactly, so every ratio is 2 + 2/log₂n.",
        sort: "Only <code>sorted()</code> is inside the timed interval (lists prepared beforehand) — the task's “isolate sorting” version.",
        wrap: "<code>sorted_wrapper(n)</code> shuffles <em>and</em> sorts inside the timed interval. Label that scope: the shuffle is linear work mixed into the time."
      }[mode];
      simNote.textContent = mode === "ideal" ? "Seconds column: the model c·n·log₂n with c = 1.2e-8 s — illustrative, not a measurement."
        : "Simulated timings from a step-count model (sort ≈ 1.2e-8 s per n·log₂n step" + (mode === "wrap" ? ", shuffle ≈ 3.5e-7 s per item" : "") + ", ±0.6 % noise) — run the real code in Colab for your own numbers.";
      var lastN = D.sizes[dbl - 1];
      var X0 = Math.log(D.sizes[1]) - 0.3, X1 = Math.log(lastN) + 0.3;
      var allR = [];
      for (var j = 1; j < dbl; j++) allR.push(D.times[j] / D.times[j - 1]);
      var Y0 = Math.min(1.96, Math.min.apply(null, allR) - 0.02), Y1 = Math.max(2.2, Math.max.apply(null, allR) + 0.02);
      var uu = function (n) { return (Math.log(n) - X0) / (X1 - X0); }, vv = function (y) { return (y - Y0) / (Y1 - Y0); };
      var pts = [];
      for (var q = 1; q < fr.k; q++) pts.push([uu(D.sizes[q]), vv(ratios[q])]);
      var curve = [];
      for (var z = 0; z <= 40; z++) { var n = Math.exp(X0 + (X1 - X0) * z / 40); curve.push([uu(n), vv(ideal(n / 2))]); }
      var xt = D.sizes.slice(1).filter(function (n, j) { return dbl <= 7 || j % 2 === 0; }).map(function (n) {
        return { u: uu(n), label: n >= 1e6 ? (+(n / 1e6).toPrecision(3)) + "M" : (n / 1000) + "k" };
      });
      var yt = [];
      for (var y = Math.ceil(Y0 * 20) / 20; y <= Y1 + 1e-9; y += 0.05) yt.push({ v: vv(y), label: y.toFixed(2) });
      plot.draw({
        xlabel: "larger n of each pair (log scale)", xticks: xt, yticks: yt,
        hlines: [{ v: vv(2), color: "--green", dashed: true }],
        series: (fr.end ? [{ color: "--muted", pts: curve, dots: false, width: 1.5, dashed: true, alpha: 0.8 }] : []).concat([{ color: "--accent", pts: pts }]),
        texts: [{ u: 0.99, v: vv(2), text: "2 = pure linear", color: "--green", align: "right", dy: 14 }]
          .concat(fr.end ? [{ u: 0.99, v: vv(ideal(lastN / 2)), text: "2 + 2/log₂n", color: "--muted", align: "right", dy: 18 }] : [])
      });
      var lastR = fr.k > 1 ? ratios[fr.k - 1] : NaN;
      sLast.set(fr.k > 1 ? lastR.toFixed(2) : "—");
      sSlope.set(fr.end ? loglogSlope(D.sizes, D.times).toFixed(2) : "—");
      if (fr.k === 0) m.innerHTML = "Will the ratio column settle on one number, or drift? Predict above, then press <strong>play</strong>.";
      else if (fr.k === 1) m.innerHTML = "First row: n = 10 000. No ratio yet.";
      else if (!fr.end) m.innerHTML = "n = " + sp(D.sizes[fr.k - 1]) + ": ratio <strong>" + lastR.toFixed(2) + "</strong>" +
        (mode === "ideal" ? " = 2 + 2/log₂(" + sp(D.sizes[fr.k - 2]) + ")." : ".");
      else {
        var first = ratios[1], lst = ratios[dbl - 1], s = loglogSlope(D.sizes, D.times);
        var pv = !pred || mode === "wrap" ? "" : pred === "drift" ? " Your prediction (drift) fits the model." : " You predicted a single number — compare the first and the last ratio.";
        m.innerHTML = {
          ideal: "The column <strong>drifts</strong>: " + first.toFixed(2) + " at the top, " + lst.toFixed(2) + " at the bottom — above 2 and falling, because the log₂n factor adds a sliver that shrinks as n grows. It never reaches 2" +
            (dbl === 12 ? " (still " + lst.toFixed(2) + " at " + sp(D.sizes[dbl - 1]) + ")" : " — try 12 doublings") + ". Fitted slope " + s.toFixed(2) + ": a little above 1, and it depends on the range.",
          sort: "With noise the drift is harder to see (" + first.toFixed(2) + " … " + lst.toFixed(2) + "), but the column still sits above 2. Fitted slope " + s.toFixed(2) + ". State whether <em>your</em> numbers support the model — real Timsort also adapts to its input.",
          wrap: "The wrapper's column sits much closer to 2 (" + first.toFixed(2) + " … " + lst.toFixed(2) + ") because the linear shuffle dominates the timed work. Fitted slope " + s.toFixed(2) + ". This is why the scope must be labelled."
        }[mode] + pv;
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.5; } });
    player.load();
  }

  /* ============================================================
     Task 6 — a misleading start size (the noise floor)
     ============================================================ */
  var NOISE_SEED = 18619;   /* chosen so start_n=10 prints ratios ≈ 0.7, 1.8, 1.1 like the page's answer */
  function noiseMeasure(n, r) {
    var work = 4.9e-8 * n, over = 1.5e-7;
    var busy = r() * 4e-6;                          /* background disturbance during this size */
    var best = Infinity;
    for (var k = 0; k < 5; k++) {                   /* time_it: best of 5 repeats */
      var e = busy * (0.6 + 0.8 * r()) + (-Math.log(1 - r())) * 1.5e-7;
      best = Math.min(best, work + over + e);
    }
    return { t: best, work: work, over: over, noise: best - work - over };
  }
  function noiseRun(start, seed) {
    var r = U.rng(seed * 1000003 + start), rows = [];
    for (var k = 0, n = start; k < 4; k++, n *= 2) {
      var x = noiseMeasure(n, r);
      x.n = n; x.ratio = k ? x.t / rows[k - 1].t : NaN;
      rows.push(x);
    }
    return rows;
  }
  function noiseFloor(host) {
    var STARTS = [10, 100, 1000, 10000, 100000, 1000000];
    var startA = 10, seed = NOISE_SEED, pred = null;
    U.title(host, "Animation · the same linear study, two starting sizes");
    var opts = h("div", "anim-opts");
    var sl = h("input"); sl.type = "range"; sl.min = "0"; sl.max = String(STARTS.length - 1); sl.value = "0"; sl.step = "1";
    sl.setAttribute("aria-label", "start_n for the left run");
    var sv = h("span", "lab", "10");
    opts.appendChild(h("span", "lab", "left run start_n"));
    opts.appendChild(sl); opts.appendChild(sv);
    opts.appendChild(btn("new noise", "", function () { seed = 1 + Math.floor(Math.random() * 1e6); player.load(); }));
    sl.addEventListener("input", function () { startA = STARTS[+sl.value]; sv.textContent = sp(startA); player.load(); });
    host.appendChild(opts);
    var popts = h("div", "anim-opts");
    popts.appendChild(h("span", "lab", "predict: clean 2.0s come from"));
    var ps = h("span", "seg");
    var pb = [["small", "the small start"], ["large", "start_n = 1 000 000"]].map(function (p) {
      var b = btn(p[1], "", function () { pred = p[0]; pb.forEach(function (x) { pressed(x, x === b); }); });
      pressed(b, false); ps.appendChild(b); return b;
    });
    popts.appendChild(cls(h("span", "", ""), "w6-seg2")).appendChild(ps);
    host.appendChild(popts);
    var lanes = h("div", "w6-two");
    host.appendChild(lanes);
    function lane(title) {
      var l = h("div", "w6-lane");
      var hd = h("div", "ct-h", title);
      var con = h("pre", "ct-out w6-con");
      var bars = h("div", "w6-sbars");
      var share = h("p", "w6-small", "");
      l.appendChild(hd); l.appendChild(con); l.appendChild(bars); l.appendChild(share);
      lanes.appendChild(l);
      return { hd: hd, con: con, bars: bars, share: share };
    }
    var LA = lane(""), LB = lane("doubling(linear, start_n=1000000, doublings=4)");
    var key = h("p", "w6-small w6-key", "<span><i class='w6-k work'></i>the loop's own work</span><span><i class='w6-k over'></i>fixed call overhead</span><span><i class='w6-k noise'></i>timer &amp; background noise</span>");
    host.appendChild(key);
    var m = U.msg(host);
    note(host, "Simulated timings: work = 4.9e-8 s per item, plus a fixed overhead and seeded background noise of a few microseconds — run the real code in Colab for your own numbers.");

    function paintLane(L, rows, k, start) {
      L.hd.textContent = "doubling(linear, start_n=" + start + ", doublings=4)";
      var lines = [HEADER];
      rows.slice(0, k).forEach(function (x) { lines.push(row(x.n, x.t, x.ratio)); });
      L.con.textContent = lines.join("\n");
      var mx = Math.max.apply(null, rows.map(function (x) { return x.t; }));
      L.bars.innerHTML = "";
      rows.forEach(function (x, j) {
        var b = h("div", "w6-sbar" + (j < k ? "" : " off"));
        b.innerHTML = "<span class='lab'>" + sp(x.n) + "</span><span class='w6-track'>" +
          "<i class='work' style='width:" + (x.work / mx * 100) + "%'></i><i class='over' style='width:" + (x.over / mx * 100) + "%'></i>" +
          "<i class='noise' style='width:" + (x.noise / mx * 100) + "%'></i></span>";
        L.bars.appendChild(b);
      });
      if (k) {
        var tot = 0, w = 0;
        rows.slice(0, k).forEach(function (x) { tot += x.t; w += x.work; });
        L.share.innerHTML = "Share of the measured time that is the loop itself: <strong>" + (w / tot * 100).toFixed(w / tot > 0.995 ? 2 : 0) + "%</strong>";
      } else L.share.innerHTML = "&nbsp;";
    }
    function build() {
      var A = noiseRun(startA, seed), B = noiseRun(1000000, seed);
      var f = [];
      for (var k = 0; k <= 4; k++) f.push({ k: k, A: A, B: B });
      f.push({ k: 4, A: A, B: B, end: true });
      return f;
    }
    function rs(rows) { return rows.slice(1).map(function (x) { return x.ratio.toFixed(2); }).join(", "); }
    function render(fr) {
      paintLane(LA, fr.A, fr.k, startA);
      paintLane(LB, fr.B, fr.k, 1000000);
      if (fr.k === 0) m.innerHTML = "Same code, same machine, only <code>start_n</code> differs. Which printed ratio column will read clean 2.0s? Predict, then press <strong>play</strong>.";
      else if (!fr.end) m.innerHTML = "Round " + fr.k + ": left n = " + sp(fr.A[fr.k - 1].n) + " took " + ff(fr.A[fr.k - 1].t, 7) + " s; right n = " + sp(fr.B[fr.k - 1].n) + " took " + ff(fr.B[fr.k - 1].t, 5) + " s." +
        (fr.k > 1 ? " Ratios: " + fr.A[fr.k - 1].ratio.toFixed(2) + " vs " + fr.B[fr.k - 1].ratio.toFixed(2) + "." : "");
      else {
        var cleanA = fr.A.slice(1).every(function (x) { return Math.abs(x.ratio - 2) < 0.03; });
        var pv = pred ? (pred === "large" ? " Your prediction was right." : " You predicted the small start — the bars show why it cannot be.") : "";
        m.innerHTML = "Left (start_n = " + sp(startA) + "): ratios <strong>" + rs(fr.A) + "</strong>" + (cleanA ? " — clean." : " — jumpy and meaningless: most of each bar is noise, so you are timing interruptions, not the loop" +
          (startA < 1000 ? " (the 5-decimal seconds column cannot even show these runs)." : ".")) +
          " Right (start_n = 1 000 000): <strong>" + rs(fr.B) + "</strong> — steady 2.0s." +
          (!cleanA ? " Drag the slider to find where the left column cleans up." : "") + pv +
          " A ratio is only worth reading once the run is well clear of the noise floor (§6.5, case 1).";
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.1; } });
    player.load();
  }

  function reg(name, fn) { AAAnim.register(name, function (host) { host.classList.add("w6-host"); fn(host); }); }
  reg("w6-ratio-id", ratioId);
  reg("w6-four-studies", fourStudies);
  reg("w6-two-axes", twoAxes);
  reg("w6-fit-slope", fitSlope);
  reg("w6-nlogn-drift", nlognDrift);
  reg("w6-noise-floor", noiseFloor);
  AAAnim._w6 = { noiseRun: noiseRun, runStudy: runStudy };   /* exposed for tests */
})();
