/* ============================================================
   AA — week 7 "Try it yourself" animations (Counting Steps Instead of Seconds)
   w7-count-verify, w7-dominant, w7-crossover, w7-two-counters,
   w7-triangle, w7-add-vs-mult
   Step counts are exact (the loops really run in JS). The only seconds shown
   (Task 3) are SIMULATED from a step-count model and labelled as such.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui;
  var h = U.h, btn = U.btn, seg = U.seg;

  /* ---------- small helpers (local to week 7) ---------- */
  function ext(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  function rj(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }
  function sp(n) { return Math.round(n).toLocaleString("en-US").replace(/,/g, " "); }
  function log2(x) { return Math.log(x) / Math.LN2; }
  function cls(el, c) { el.classList.add(c); return el; }
  function pressed(b, on) { b.setAttribute("aria-pressed", String(!!on)); }
  function note(host, text) { host.appendChild(h("p", "note-sim", text)); }
  function codeBlock(parent, src, extraCls) {
    var box = h("div", "ct-code w7-code" + (extraCls ? " " + extraCls : ""));
    src.split("\n").forEach(function (ln, j) {
      box.appendChild(h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + (U.pyLine(ln) || " ") + "</code>"));
    });
    parent.appendChild(box);
    return box;
  }
  function choice(parent, label, options, onPick, klass) {   /* a row of toggle buttons that remembers one pick */
    var wrap = cls(h("span", ""), klass || "w7-seg2");
    if (label) parent.appendChild(h("span", "lab", label));
    var s = h("span", "seg");
    var bs = options.map(function (o) {
      var b = btn(o[1], "", function () { bs.forEach(function (x) { pressed(x, x === b); }); onPick(o[0]); });
      pressed(b, false); s.appendChild(b); return b;
    });
    wrap.appendChild(s); parent.appendChild(wrap);
    return { reset: function () { bs.forEach(function (x) { pressed(x, false); }); } };
  }

  /* ---------- Plot: crisp, theme-aware canvas (coordinates already in [0,1]) ---------- */
  function Plot(parent, o) {
    o = o || {};
    var cv = h("canvas", "lc w7-plot");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", o.label || "chart");
    var H0 = o.height || 280;
    cv.style.height = H0 + "px";
    parent.appendChild(cv);
    var last = null;
    function draw(spec) {
      last = spec;
      var W = cv.clientWidth, H = cv.clientHeight || H0;
      if (!W) return;
      var dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var small = W < 480, fs = small ? 10 : 11.5;
      var mono = U.cssVar(parent, "--font-mono") || "monospace";
      var col = function (v) { return (v && v.indexOf("--") === 0) ? U.cssVar(parent, v) : v; };
      var L = (spec.ylabel ? 18 : 4) + (small ? 46 : 60), R = 14, T = 14, B = spec.xlabel ? 40 : 26;
      var pw = W - L - R, ph = H - T - B;
      var X = function (u) { return L + u * pw; }, Y = function (v) { return T + (1 - v) * ph; };
      ctx.font = fs + "px " + mono; ctx.lineWidth = 1;
      (spec.yticks || []).forEach(function (t) {
        if (t.v < -0.001 || t.v > 1.001) return;
        ctx.strokeStyle = col("--border"); ctx.beginPath(); ctx.moveTo(L, Y(t.v)); ctx.lineTo(W - R, Y(t.v)); ctx.stroke();
        ctx.fillStyle = col("--muted"); ctx.textAlign = "right"; ctx.fillText(t.label, L - 6, Y(t.v) + 4);
      });
      (spec.xticks || []).forEach(function (t) {
        if (t.u < -0.001 || t.u > 1.001) return;
        ctx.strokeStyle = col("--border"); ctx.beginPath(); ctx.moveTo(X(t.u), T); ctx.lineTo(X(t.u), H - B); ctx.stroke();
        ctx.fillStyle = col("--muted"); ctx.textAlign = "center"; ctx.fillText(t.label, X(t.u), H - B + 15);
      });
      ctx.strokeStyle = col("--border-strong");
      ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, H - B); ctx.lineTo(W - R, H - B); ctx.stroke();
      ctx.fillStyle = col("--muted");
      if (spec.xlabel) { ctx.textAlign = "center"; ctx.fillText(spec.xlabel, L + pw / 2, H - 8); }
      if (spec.ylabel) { ctx.save(); ctx.translate(11, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(spec.ylabel, 0, 0); ctx.restore(); }
      ctx.save(); ctx.beginPath(); ctx.rect(L, T - 6, pw + 6, ph + 12); ctx.clip();
      (spec.vlines || []).forEach(function (l) {
        ctx.strokeStyle = col(l.color || "--muted"); ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(X(l.u), T); ctx.lineTo(X(l.u), H - B); ctx.stroke(); ctx.setLineDash([]);
      });
      (spec.series || []).forEach(function (s) {
        var c = col(s.color || "--accent");
        ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = s.width || 2.5;
        ctx.setLineDash(s.dashed ? [6, 5] : []);
        if (s.pts.length > 1 && s.line !== false) {
          ctx.beginPath();
          s.pts.forEach(function (p, j) { if (j) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); });
          ctx.stroke();
        }
        ctx.setLineDash([]);
        if (s.dots !== false) s.pts.forEach(function (p) {
          ctx.beginPath();
          if (s.square) ctx.rect(X(p[0]) - 3.5, Y(p[1]) - 3.5, 7, 7); else ctx.arc(X(p[0]), Y(p[1]), s.r || 3.6, 0, 7);
          ctx.fill();
        });
      });
      ctx.restore();
      (spec.marks || []).forEach(function (mk) {
        ctx.strokeStyle = col(mk.color || "--green"); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(X(mk.u), Y(mk.v), 8, 0, 7); ctx.stroke();
      });
      (spec.texts || []).forEach(function (t) {
        ctx.fillStyle = col(t.color || "--text"); ctx.textAlign = t.align || "left";
        ctx.font = (t.bold ? "bold " : "") + fs + "px " + mono;
        ctx.fillText(t.text, X(t.u) + (t.dx || 0), Y(t.v) + (t.dy || 0));
      });
      ctx.font = fs + "px " + mono;
      var named = (spec.series || []).filter(function (s) { return s.name; }), ly = T + 10;
      named.forEach(function (s) {
        ctx.fillStyle = col(s.color); ctx.fillRect(L + 10, ly - 2, 16, 3);
        ctx.fillStyle = col("--text"); ctx.textAlign = "left"; ctx.fillText(s.name, L + 32, ly + 3);
        ly += fs + 6;
      });
    }
    if (window.ResizeObserver) new ResizeObserver(function () { if (last) draw(last); }).observe(cv);
    new MutationObserver(function () { if (last) draw(last); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return { draw: draw, el: cv };
  }

  /* ============================================================
     Task 1 — count, then verify (snippets A, B, C of §7.7)
     ============================================================ */
  var SNIPS = {
    A: { src: ["total = 0", "for i in range(n):", "    total = total + i", "for j in range(n):", "    total = total + j"],
         acc: "total", page: "4n + 1", f: function (n) { return 4 * n + 1; },
         shape: "n", pageConv: true },
    B: { src: ["count = 0", "for i in range(n):", "    for j in range(n):", "        count = count + 1"],
         acc: "count", page: "n² + 1", f: function (n) { return n * n + 1; }, shape: "n²", pageConv: false },
    C: { src: ["count = 0", "for i in range(n):", "    for j in range(10):", "        count = count + 1"],
         acc: "count", page: "10n + 1", f: function (n) { return 10 * n + 1; }, shape: "n", pageConv: false }
  };
  /* runs a snippet for real; emit(ev) gets every assignment: {line (in snippet, 1-based), kind, vars} */
  function runSnip(key, n, emit) {
    var v = { n: n };
    var ev = function (line, kind) { if (emit) emit({ line: line, kind: kind, vars: ext({}, v) }); };
    var steps = { init: 0, loop: 0, body: 0 };
    var hit = function (line, kind) { steps[kind]++; ev(line, kind); };
    v[SNIPS[key].acc] = 0; hit(1, "init");
    if (key === "A") {
      for (var i = 0; i < n; i++) { v.i = i; hit(2, "loop"); v.total += i; hit(3, "body"); }
      for (var j = 0; j < n; j++) { v.j = j; hit(4, "loop"); v.total += j; hit(5, "body"); }
    } else {
      var inner = key === "B" ? n : 10;
      for (var a = 0; a < n; a++) {
        v.i = a; delete v.j; hit(2, "loop");
        for (var b = 0; b < inner; b++) { v.j = b; hit(3, "loop"); v.count += 1; hit(4, "body"); }
      }
    }
    return steps;
  }
  function polyText(a, b) {          /* a·n² + b·n as text */
    var parts = [];
    if (a) parts.push((a === 1 ? "" : a === -1 ? "−" : (a < 0 ? "−" : "") + Math.abs(a)) + "n²");
    if (b) parts.push((b < 0 ? "−" : "") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "n");
    if (!parts.length) return "0";
    return parts.map(function (p, j) { return j && p.charAt(0) !== "−" ? "+ " + p : j ? "− " + p.slice(1) : p; }).join(" ");
  }
  function countVerify(host) {
    var key = "A", conv = false, tn = 3, pred = null;
    U.title(host, "Animation · count the assignments, then check the formula");
    var opts = h("div", "anim-opts");
    opts.appendChild(cls(seg("snippet", [["A", "A · two loops"], ["B", "B · n inside n"], ["C", "C · 10 inside n"]], key, function (v) { key = v; ct.load(); }), "w7-seg1"));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var bConv = btn("also count loop-variable assignments (i = …, j = …)", "w7-tog", function () { conv = !conv; pressed(bConv, conv); ct.load(); });
    pressed(bConv, conv);
    opts2.appendChild(bConv);
    opts2.appendChild(seg("trace n", [[2, "2"], [3, "3"]], tn, function (v) { tn = v; ct.load(); }));
    host.appendChild(opts2);
    var opts3 = h("div", "anim-opts");
    var inp = h("input"); inp.type = "number"; inp.min = "0"; inp.placeholder = "T(10)?";
    inp.setAttribute("aria-label", "Your predicted step count at n = 10");
    opts3.appendChild(h("span", "lab", "write down T(n) first — your T(10):"));
    opts3.appendChild(inp);
    host.appendChild(opts3);

    function code() {
      return ["n = " + tn + "        # input, not counted"].concat(SNIPS[key].src).join("\n");
    }
    function build() {
      var S = SNIPS[key], f = [], steps = 0, last = 0;
      f.push({ line: 0, vars: { n: tn }, counters: { "steps counted": 0 }, note:
        "Snippet " + key + ". Write your T(n) (and your T(10) above) before pressing <strong>play</strong>. Convention: " +
        (conv ? "every assignment, <em>including</em> the loop variables." : "the accumulator assignments only — loop variables are <em>not</em> counted.") });
      runSnip(key, tn, function (e) {
        var counted = e.kind !== "loop" || conv;
        if (counted) steps++;
        var what = e.kind === "init" ? "the starting assignment" : e.kind === "body" ? "an assignment to <code>" + S.acc + "</code>" : "the loop assigns <code>" + (e.line === 2 ? "i" : "j") + "</code>";
        var vars = ext(e.vars, {});
        f.push({ line: e.line + 1, vars: vars, hl: counted ? [e.line + 1] : [],
          counters: { "steps counted": steps },
          note: (counted ? "<strong>+1</strong> — " : "<span class='muted'>+0</span> — ") + what + (counted ? "" : " (not counted under this convention)") + ". Steps so far: <strong>" + steps + "</strong>." });
        last = steps;
      });
      var formula = S.f(tn);
      f.push({ line: 0, vars: f[f.length - 1].vars, end: true,
        note: "Done at n = " + tn + ": the counter says <strong>" + last + "</strong>; the page's formula T(n) = " + S.page + " gives " + formula + "." +
          (last === formula ? " <strong>Exact match.</strong>" : " <strong>They differ</strong> — see the table below for why.") });
      f[f.length - 1].counters = (function () { var c = {}; c["steps counted"] = last; c["page's " + S.page + " at n = " + tn] = formula; return c; })();
      return f;
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, varsTitle: "variables", outTitle: "counting rule",
      fps: function () { return key === "C" ? (tn === 3 ? 7 : 5) : 2.6; },
      onFrame: function (fr) {
        host.querySelector(".ct-out").textContent = conv
          ? "count: total/count = …\n       i = … (loop)\n       j = … (loop)"
          : "count: total/count = …\nskip:  i = …, j = … (loop variables)";
        tableBox.style.display = fr.end ? "" : "none";
        if (fr.end) paintTable();
      }
    });
    var tableBox = h("div", "");
    ct.extra.appendChild(tableBox);
    tableBox.appendChild(h("div", "ct-h", "the counter at the task's sizes (the loops really run)"));
    var tw = h("div", "anim-table-wrap"); tableBox.appendChild(tw);
    var tab = U.table(tw, ["n", "counter", "page", "counter − page"]);
    var why = h("p", "w7-small", ""); tableBox.appendChild(why);
    function paintTable() {
      var S = SNIPS[key], rows = [], d = {};
      [10, 100, 1000].forEach(function (n) {
        var st = runSnip(key, n, null), c = st.init + st.body + (conv ? st.loop : 0);
        d[n] = c - S.f(n);
        rows.push([sp(n), sp(c), sp(S.f(n)), d[n] === 0 ? "<span class='w7-good'>0 ✓</span>" : "<span class='w7-bad'>" + (d[n] > 0 ? "+" : "−") + sp(Math.abs(d[n])) + "</span>"]);
      });
      tab.el.tHead.rows[0].cells[2].textContent = S.page;
      tab.rows(rows);
      var a = (d[100] - 10 * d[10]) / 9000, b = (d[10] - 100 * a) / 10;
      var p = parseInt(inp.value, 10), pv = "";
      if (!isNaN(p)) {
        var c10 = S.f(10), st10 = runSnip(key, 10, null), m10 = st10.init + st10.body + (conv ? st10.loop : 0);
        pv = " Your T(10) = " + p + (p === m10 ? " matches this counter." : p === c10 ? " matches the page's formula." : " matches neither — recount with one clear convention.");
      }
      if (!a && !b) {
        why.innerHTML = "Same convention as the page, so the counter equals " + S.page + " exactly." +
          (key === "A" ? " (For A the page counts the loop variables too: 1 + 2n + 2n.)" : " (For " + key + " the page counts the initialisation and the inner assignment only.)") + pv;
      } else {
        why.innerHTML = "counter − formula = <strong>" + polyText(a, b) + "</strong>: " +
          (a + b > 0 || a > 0 ? "this counter also includes the loop-variable assignments that the page's " + S.page + " leaves out." : "the page's " + S.page + " also counts the loop-variable assignments i and j, which this counter skips.") +
          " Different convention, different count — but the dominant term is still <strong>" + S.shape + "</strong>. Reconcile the convention before you simplify." + pv;
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 2 — simplify to the dominant term
     ============================================================ */
  var STOPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  var FORMS = [
    { lab: "§7.3", tex: "5n² + 200n + 3000", terms: [["5n²", function (n) { return 5 * n * n; }], ["200n", function (n) { return 200 * n; }], ["3000", function () { return 3000; }]],
      win: 0, ans: "n2", say: "n² — keep 5n², then drop the 5" },
    { lab: "1", tex: "3n + 17", terms: [["3n", function (n) { return 3 * n; }], ["17", function () { return 17; }]], win: 0, ans: "n", say: "n" },
    { lab: "2", tex: "n² + n + 1", terms: [["n²", function (n) { return n * n; }], ["n", function (n) { return n; }], ["1", function () { return 1; }]], win: 0, ans: "n2", say: "n²" },
    { lab: "3", tex: "2n³ + 500n² + 10 000n", terms: [["2n³", function (n) { return 2 * n * n * n; }], ["500n²", function (n) { return 500 * n * n; }], ["10 000n", function (n) { return 10000 * n; }]],
      win: 0, ans: "n3", say: "n³" },
    { lab: "4", tex: "42", terms: [["42", function () { return 42; }]], win: 0, ans: "c", say: "a constant (does not grow)" },
    { lab: "5", tex: "6n + 3n log n", terms: [["6n", function (n) { return 6 * n; }], ["3n log n", function (n) { return 3 * n * log2(n); }]],
      win: 1, ans: "nlogn", say: "n log n — because n log n grows faster than n" }
  ];
  var TCOL = ["--accent", "--blue", "--green"];
  function share(x) {
    var p = x * 100;
    if (p >= 99.995) return p === 100 ? "100%" : "≈100%";
    if (p >= 99.5) return p.toFixed(2) + "%";
    if (p < 0.01) return p === 0 ? "0%" : "<0.01%";
    if (p < 1) return p.toFixed(2) + "%";
    return p.toFixed(0) + "%";
  }
  function dominant(host) {
    var fi = 0, si = 3, solved = {};
    U.title(host, "Animation · which term survives as n grows?");
    var opts = h("div", "anim-opts");
    opts.appendChild(cls(seg("formula", FORMS.map(function (F, j) { return [j, F.lab === "§7.3" ? "§7.3 example" : "T" + F.lab]; }), fi, function (v) { fi = v; setup(); }), "w7-seg2"));
    host.appendChild(opts);
    var big = h("p", "w7-formula", "");
    host.appendChild(big);
    var opts2 = h("div", "anim-opts");
    var sl = h("input"); sl.type = "range"; sl.min = "0"; sl.max = String(STOPS.length - 1); sl.step = "1"; sl.value = String(si);
    sl.setAttribute("aria-label", "n");
    var sv = h("span", "lab", "");
    opts2.appendChild(h("span", "lab", "n ="));
    opts2.appendChild(sl); opts2.appendChild(sv);
    sl.addEventListener("input", function () { player.stop(); si = +sl.value; paint(si); });
    host.appendChild(opts2);
    var bar = h("div", "w7-share");
    host.appendChild(bar);
    var tw = h("div", "anim-table-wrap"); host.appendChild(tw);
    var tab = U.table(tw, ["term", "value at n", "share of T(n)"]);
    var stats = h("div", "anim-stats");
    var sBig = U.stat("biggest term right now"), sOver = U.stat("eventual winner is > half from n =");
    stats.appendChild(sBig.el); stats.appendChild(sOver.el);
    host.appendChild(stats);
    var quiz = h("div", "w7-quiz");
    quiz.appendChild(h("p", "", "Reduce T(n) to its dominant term, no constants:"));
    var qrow = h("div", "anim-opts");
    var ANS = [["c", "a constant"], ["logn", "log n"], ["n", "n"], ["nlogn", "n log n"], ["n2", "n²"], ["n3", "n³"]];
    var qb = ANS.map(function (a) { var b = btn(a[1], "", function () { answer(a[0], b); }); qrow.appendChild(b); return b; });
    quiz.appendChild(qrow);
    var qfb = h("p", "w7-fb", "");
    quiz.appendChild(qfb);
    host.appendChild(quiz);
    var m = U.msg(host);

    function overFrom(F) {
      if (F.terms.length < 2) return "—";
      for (var n = 1; n <= 1e6; n++) {
        var w = F.terms[F.win][1](n), rest = 0;
        F.terms.forEach(function (t, j) { if (j !== F.win) rest += t[1](n); });
        if (w > rest) return sp(n);
      }
      return "> 1 000 000";
    }
    function answer(a, b) {
      var F = FORMS[fi];
      if (a === F.ans) {
        solved[fi] = true;
        qb.forEach(function (x) { x.disabled = true; x.className = x === b ? "w7-right" : ""; });
        qfb.innerHTML = "Right: <strong>" + F.say + "</strong>." + (fi === 0 ? " At n = 100 000 the 5n² term is already 99.96% of the total." : "");
      } else {
        b.className = "w7-wrong";
        var W = F.terms[F.win][0];
        qfb.innerHTML = a === "c" ? "A constant would stay the same size however big n gets. Drag n to 1 000 000 — does T(n) stay put?"
          : "Not quite. Press play (or drag n to 1 000 000) and see which term ends up with almost all of the share; then drop its constant multiplier" +
            (F.terms.length > 1 ? " (hint: the survivor is written <strong>" + W + "</strong> here)." : ".");
      }
    }
    function setup() {
      player.stop();
      var F = FORMS[fi];
      big.innerHTML = "T(n) = " + F.tex;
      qfb.innerHTML = "";
      qb.forEach(function (x) { x.className = ""; x.disabled = !!solved[fi]; });
      if (solved[fi]) { qb.forEach(function (x, j) { if (ANS[j][0] === F.ans) x.className = "w7-right"; }); qfb.innerHTML = "Solved: <strong>" + F.say + "</strong>."; }
      bar.innerHTML = "";
      F.parts = F.terms.map(function (t, j) {
        var seg_ = h("div", "w7-part");
        seg_.style.background = "var(" + TCOL[j] + ")";
        seg_.appendChild(h("span", "", t[0]));
        bar.appendChild(seg_);
        return seg_;
      });
      sOver.set(overFrom(F));
      player.load();
    }
    function paint(k, playing) {
      var F = FORMS[fi], n = STOPS[k];
      sl.value = String(k); sv.textContent = sp(n);
      var vals = F.terms.map(function (t) { return t[1](n); }), tot = vals.reduce(function (a, b) { return a + b; }, 0);
      F.parts.forEach(function (p, j) {
        var sh = vals[j] / tot;
        p.style.width = (sh * 100) + "%";
        p.firstChild.textContent = sh > 0.08 ? F.terms[j][0] + " " + share(sh) : "";
      });
      var bi = 0; vals.forEach(function (v, j) { if (v > vals[bi]) bi = j; });
      tab.rows(F.terms.map(function (t, j) {
        return ["<span class='w7-dot' style='background:var(" + TCOL[j] + ")'></span>" + t[0], sp(vals[j]), share(vals[j] / tot)];
      }).concat([["<strong>T(n)</strong>", "<strong>" + sp(tot) + "</strong>", "100%"]]), bi);
      sBig.set(F.terms[bi][0]);
      if (F.terms.length === 1) {
        m.innerHTML = "n = " + sp(n) + ": T(n) = 42. " + (k === 0 && !playing ? "Press <strong>play</strong> and watch how T(n) changes as n grows." : "Whatever n is, the value is the same: there is no n in the formula at all.");
      } else if (k === 0 && !playing) {
        m.innerHTML = "Which term will own T(n) when n is huge? Pick your answer below, or press <strong>play</strong> to sweep n from 1 to 1 000 000 first.";
      } else {
        var wsh = vals[F.win] / tot;
        m.innerHTML = "n = " + sp(n) + ": the biggest term is <strong>" + F.terms[bi][0] + "</strong>" +
          (bi !== F.win ? " — for small inputs the lower-order terms can dominate." : ", with " + share(wsh) + " of the total." +
            (k === STOPS.length - 1 ? " The other terms' shares shrink towards zero" + (F.ans === "nlogn" ? " (slowly, because log n grows slowly)" : "") + ": keep " + F.terms[F.win][0] + ", drop the rest." : ""));
      }
    }
    var player = U.Player(host, {
      build: function () { var f = []; for (var k = 0; k < STOPS.length; k++) f.push({ k: k }); return f; },
      render: function (fr, i) { si = fr.k; paint(fr.k, i > 0); },
      fps: function () { return 1.8; }
    });
    setup();
  }

  /* ============================================================
     Task 3 — the crossover, measured: 100n vs n²
     ============================================================ */
  function crossover(host) {
    var mode = "steps", zoom = "near", faster = false, seed = 7;
    U.title(host, "Animation · 100 steps per item vs a full nested pass");
    var codes = h("div", "w7-codes");
    codeBlock(codes, "def hundred_per_item(n):   # A: 100n\n    count = 0\n    for i in range(n):\n        for j in range(100):\n            count += 1\n    return count");
    codeBlock(codes, "def full_nested(n):        # B: n²\n    count = 0\n    for i in range(n):\n        for j in range(n):\n            count += 1\n    return count");
    host.appendChild(codes);
    var opts = h("div", "anim-opts w7-gap");
    opts.appendChild(cls(seg("measure", [["steps", "step counts (exact)"], ["secs", "seconds (simulated)"]], mode, function (v) { mode = v; player.load(); }), "w7-seg2"));
    opts.appendChild(cls(seg("range", [["near", "n = 10 … 300"], ["far", "n up to 100 000 (log–log)"]], zoom, function (v) { zoom = v; player.load(); }), "w7-seg2"));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var bFast = btn("run B on a 2× faster computer", "w7-tog", function () { faster = !faster; pressed(bFast, faster); player.load(); });
    pressed(bFast, false);
    opts2.appendChild(bFast);
    var bNoise = btn("new noise", "", function () { seed++; player.load(); });
    opts2.appendChild(bNoise);
    var inp = h("input"); inp.type = "number"; inp.min = "1"; inp.placeholder = "n?";
    inp.setAttribute("aria-label", "Your predicted crossover n");
    opts2.appendChild(h("span", "lab", "predict the crossover:"));
    opts2.appendChild(inp);
    host.appendChild(opts2);
    var plot = Plot(host, { height: 270, label: "Cost of method A (100n) and method B (n squared) as n grows" });
    var tw = h("div", "anim-table-wrap"); host.appendChild(tw);
    var tab = U.table(tw, ["n", "A", "B", "slower"]);
    var stats = h("div", "anim-stats");
    var sX = U.stat("B first slower (and stays slower) at n =");
    stats.appendChild(sX.el); host.appendChild(stats);
    var m = U.msg(host);
    var simNote = h("p", "note-sim", "");
    host.appendChild(simNote);
    var C = 4e-8, O = 1.5e-7;         /* seconds per `count += 1`, per outer pass (both functions) */

    function sizes() {
      if (zoom === "near") { var a = []; for (var n = 10; n <= 300; n += 10) a.push(n); return a; }
      return [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
    }
    function cost(which, n, r) {
      var k = which === "B" && faster ? 0.5 : 1;
      if (mode === "steps") return (which === "A" ? 100 * n : n * n) * k;
      var t = which === "A" ? n * (100 * C + O) : n * (n * C + O);
      return t * k * (1 + (r() - 0.5) * 0.08);
    }
    function build() {
      var r = U.rng(seed * 977 + (zoom === "far" ? 5 : 0)), S = sizes(), A = [], B = [];
      S.forEach(function (n) { A.push(cost("A", n, r)); B.push(cost("B", n, r)); });
      var cross = null;
      for (var j = S.length - 1; j >= 0; j--) { if (B[j] > A[j]) cross = S[j]; else break; }
      var f = [];
      for (var k = 0; k <= S.length; k++) f.push({ k: k, S: S, A: A, B: B, cross: cross });
      f.push({ k: S.length, S: S, A: A, B: B, cross: cross, end: true });
      return f;
    }
    function fmtC(x) { return mode === "steps" ? sp(x) : x < 0.01 ? (x * 1000).toFixed(3) + " ms" : x.toFixed(3) + " s"; }
    function render(fr) {
      var S = fr.S, k = fr.k, far = zoom === "far";
      var xmax = S[S.length - 1], ymax = Math.max(Math.max.apply(null, fr.A), Math.max.apply(null, fr.B));
      var ymin = Math.min(Math.min.apply(null, fr.A), Math.min.apply(null, fr.B));
      if (!far) ymax = Math.max.apply(null, fr.A.concat(fr.B.filter(function (x, j) { return S[j] <= 200; }))) * 1.9;
      var lx0 = Math.log10(S[0]) - 0.1, lx1 = Math.log10(xmax) + 0.1, ly0 = Math.log10(ymin) - 0.3, ly1 = Math.log10(ymax) + 0.3;
      var uu = function (n) { return far ? (Math.log10(n) - lx0) / (lx1 - lx0) : n / 300; };
      var vv = function (y) { return far ? (Math.log10(y) - ly0) / (ly1 - ly0) : y / ymax; };
      var pa = [], pb = [];
      for (var j = 0; j < k; j++) { pa.push([uu(S[j]), vv(fr.A[j])]); pb.push([uu(S[j]), vv(fr.B[j])]); }
      var xt = far ? [10, 100, 1000, 10000, 100000].map(function (n) { return { u: uu(n), label: n >= 1000 ? (n / 1000) + "k" : String(n) }; })
        : [0, 50, 100, 150, 200, 250, 300].map(function (n) { return { u: n / 300, label: String(n) }; });
      var yt = [];
      if (far) { for (var e = Math.ceil(ly0); e <= ly1; e++) yt.push({ v: vv(Math.pow(10, e)), label: mode === "steps" ? "1e" + e : "1e" + e + " s" }); }
      else for (var g = 0; g <= 4; g++) { var yv = ymax * g / 4; yt.push({ v: g / 4, label: !g ? "0" : mode === "steps" ? (yv >= 1000 ? +(yv / 1000).toPrecision(3) + "k" : String(Math.round(yv))) : +(yv * 1000).toPrecision(2) + " ms" }); }
      var marks = [], texts = [], vlines = [];
      if (fr.end && fr.cross) {
        var ci = S.indexOf(fr.cross);
        marks.push({ u: uu(fr.cross), v: vv(fr.B[ci]), color: "--green" });
        vlines.push({ u: uu(mode === "steps" ? (faster ? 200 : 100) : fr.cross), color: "--green" });
      }
      plot.draw({
        xlabel: "n" + (far ? "  (log scale)" : ""), ylabel: (mode === "steps" ? "steps" : "seconds") + (far ? " (log)" : ""),
        xticks: xt, yticks: yt, marks: marks, vlines: vlines, texts: texts,
        series: [{ name: "A · 100n", color: "--blue", pts: pa }, { name: "B · " + (faster ? "n² on a 2× faster computer" : "n²"), color: "--accent", pts: pb, square: true }]
      });
      var rows = [], from = Math.max(0, k - 5);
      for (var q = from; q < k; q++) {
        var slower = fr.B[q] > fr.A[q] ? "B" : fr.B[q] < fr.A[q] ? "A" : "tie";
        rows.push([sp(S[q]), fmtC(fr.A[q]), fmtC(fr.B[q]), slower === "tie" ? "tie" : "<span class='" + (slower === "B" ? "w7-bad" : "w7-good") + "'>" + slower + "</span>"]);
      }
      tab.rows(rows.length ? rows : [["—", "", "", ""]], rows.length - 1);
      sX.set(fr.end ? (fr.cross ? sp(fr.cross) : "never here") : "?");
      simNote.textContent = mode === "secs" ? "Simulated seconds from a step-count model: 4e-8 s per count += 1, 1.5e-7 s per outer pass, ±4 % seeded noise — run the real code in Colab for your own numbers."
        : "Exact step counts (count += 1 executions): A = 100n, B = n²" + (faster ? ", B halved to model the faster computer" : "") + ".";
      if (k === 0) { m.innerHTML = "Predict where B (n²) becomes slower than A (100n), then press <strong>play</strong> to measure from n = 10 upward."; return; }
      var n = S[k - 1], a = fr.A[k - 1], b = fr.B[k - 1];
      if (!fr.end) {
        m.innerHTML = "n = " + sp(n) + ": A " + fmtC(a) + ", B " + fmtC(b) + " — " +
          (b < a ? "<strong>B is faster</strong> (its constant head start still wins)." : b > a ? "<strong>B is slower</strong>." : "<strong>a tie</strong>.");
        return;
      }
      var p = parseInt(inp.value, 10), pv = "";
      if (!isNaN(p)) pv = " You predicted n = " + p + ".";
      var target = faster ? 200 : 100;
      if (mode === "steps" && !far) {
        m.innerHTML = "Exact counts cross at <strong>n = " + target + "</strong> (" + (faster ? "0.5n² = 100n" : "100n = n²") + ", both " + sp(100 * target) + "); from the next measured size B is slower and the gap only widens." +
          (faster ? " The 2× faster computer moved the crossover from 100 to 200 — it did not remove it." : " Switch to <em>n up to 100 000</em> to watch the gap grow.") + pv;
      } else if (mode === "steps") {
        m.innerHTML = "At n = 50, A costs 5 000 and B " + sp(faster ? 1250 : 2500) + ": B wins. At n = 1 000, A costs 100 000 and B " + sp(faster ? 500000 : 1000000) + " — A wins by " + (faster ? 5 : 10) + "×. At n = 100 000, A wins by " + sp(faster ? 500 : 1000) + "×. On log–log axes the two lines have slopes 1 and 2, so they cross once and then separate for good." + pv;
      } else {
        m.innerHTML = "Measured (simulated) crossover: B is slower from <strong>n = " + (fr.cross ? sp(fr.cross) : "?") + "</strong> onward — " +
          (far ? (fr.cross === S.filter(function (x) { return x >= target; })[0] || fr.cross === S.filter(function (x) { return x > target; })[0]
              ? "consistent with the predicted " + target + " (on this coarse scale the sizes jump " + target + " → " + (2 * target) + ")"
              : "away from the predicted " + target + ", because noise blurs sizes where the two costs are almost equal")
            : (Math.abs((fr.cross || 0) - target) <= 10 ? "near" : "not exactly at") + " the predicted " + target + ", because noise blurs sizes where the two costs are almost equal") +
          ". Press <em>new noise</em>: the exact point wobbles, the existence of the crossover does not." + pv;
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return zoom === "near" ? 3.2 : 1.8; } });
    player.load();
  }

  /* ============================================================
     Task 4 — count a different operation (the §7.5 contains)
     ============================================================ */
  function twoCounters(host) {
    var tn = 6, pred = null;
    U.title(host, "Animation · three ways to count the same worst-case search");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("list size n", [[4, "4"], [6, "6"], [8, "8"]], tn, function (v) { tn = v; ct.load(); }));
    host.appendChild(opts);
    var popts = h("div", "anim-opts");
    choice(popts, "predict: when n doubles, the three counts grow", [["same", "in the same proportion"], ["diff", "differently"]], function (v) { pred = v; });
    host.appendChild(popts);
    var legend = h("p", "w7-small", "Per pass: <code>for item in data</code> assigns <code>item</code> (1 assignment, 1 op) · <code>comparisons += 1</code> adds and stores (1 assignment, 2 ops) · <code>item == target</code> (1 comparison, 1 op).");
    host.appendChild(legend);
    function code() {
      return ["def contains(data, target):", "    comparisons = 0", "    for item in data:", "        comparisons += 1", "        if item == target:",
        "            return True, comparisons", "    return False, comparisons", "", "haystack = list(range(" + tn + "))",
        "print(contains(haystack, -1))    # missing: full pass"].join("\n");
    }
    function build() {
      var f = [], c = { cmp: 0, asg: 0, ops: 0 }, data = [];
      for (var q = 0; q < tn; q++) data.push(q);
      var C = function () { return { "comparisons": c.cmp, "assignments in the loop": c.asg, "all basic operations": c.ops }; };
      var v = {};
      function push(line, nv, note, hl, extra) { v = ext(v, nv || {}); f.push(ext({ line: line, vars: v, out: [], counters: C(), note: note, hl: hl || [], c: ext(c, {}) }, extra || {})); }
      push(0, {}, "A missing target forces a full pass. Predict whether the three counters will grow alike, then press <strong>play</strong>.");
      push(9, { haystack: data }, "Build the list 0 … " + (tn - 1) + ". (Setup, outside the function: not counted.)");
      push(10, { target: -1 }, "Search for −1, which is not there.");
      v = { data: data, target: -1 };
      push(2, { comparisons: 0 }, "Set the counter to 0 before the loop — setup, not part of the loop body.");
      for (var k = 0; k < tn; k++) {
        c.asg++; c.ops++;
        push(3, { item: k }, "Pass " + (k + 1) + ": <code>item = " + k + "</code> → assignments +1, operations +1.", [3]);
        c.asg++; c.ops += 2;
        push(4, { comparisons: k + 1 }, "<code>comparisons += 1</code> → an addition and a store: assignments +1, operations +2.", [4]);
        c.cmp++; c.ops++;
        push(5, {}, "<code>" + k + " == -1</code> is False → comparisons +1, operations +1.", [5]);
      }
      push(3, {}, "No items left — the loop ends without finding −1.");
      push(7, {}, "Return <code>(False, " + tn + ")</code>.");
      f.push({ line: 10, vars: v, out: ["(False, " + tn + ")"], counters: C(), c: ext(c, {}), end: true,
        note: "n = " + tn + ": " + c.cmp + " comparisons, " + c.asg + " assignments, " + c.ops + " basic operations — n, 2n and 4n. Different constants… now look at the table below." });
      return f;
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, fps: function () { return tn > 6 ? 4.5 : 3; },
      onFrame: function (fr) {
        var mx = 4 * tn;
        [["cmp", fr.c.cmp], ["asg", fr.c.asg], ["ops", fr.c.ops]].forEach(function (p, j) {
          bars[j].fill.style.width = (p[1] / mx * 100) + "%";
          bars[j].num.textContent = p[1];
        });
        tableBox.style.display = fr.end ? "" : "none";
        if (fr.end) {
          var rows = [], prev = null;
          [100, 200, 400].forEach(function (n) {
            var r = [sp(n), sp(n), sp(2 * n), sp(4 * n)];
            var rr = prev ? [n / prev, 2 * n / (2 * prev), 4 * n / (4 * prev)].map(function (x) { return x.toFixed(2); }) : null;
            r.push(!rr ? "—" : rr[0] === rr[1] && rr[1] === rr[2] ? "all " + rr[0] : rr.join(" / "));
            rows.push(r); prev = n;
          });
          tab.rows(rows);
          whyP.innerHTML = "The raw counts differ by a constant factor (n, 2n, 4n), but all three <strong>double</strong> when n doubles — the ratio columns are identical. " +
            "The choice of operation set the constant, not the shape; either is fine as long as you say which you counted." +
            (pred ? (pred === "same" ? " <strong>Your prediction was right.</strong>" : " You predicted they would grow differently — the ratios say otherwise.") : "") +
            " <span class='muted'>(The page's answer says “say n vs 3n”; the exact multiplier depends on which operations you include — here 2n for assignments, 4n for every operation.)</span>";
        }
      }
    });
    var bars = [["comparisons", "--blue"], ["assignments in the loop", "--green"], ["all basic operations", "--accent"]].map(function (b) {
      var row = h("div", "w7-tally");
      row.appendChild(h("span", "lab", b[0]));
      var tr = h("span", "w7-track"), fill = h("i", ""); fill.style.background = "var(" + b[1] + ")";
      tr.appendChild(fill); row.appendChild(tr);
      var num = h("b", "", "0"); row.appendChild(num);
      ct.extra.appendChild(row);
      return { fill: fill, num: num };
    });
    var tableBox = h("div", "w7-gap");
    ct.extra.appendChild(tableBox);
    tableBox.appendChild(h("div", "ct-h", "the task's sizes, missing target (worst case)"));
    var tw = h("div", "anim-table-wrap"); tableBox.appendChild(tw);
    var tab = U.table(tw, ["n", "compar&shy;isons", "assign&shy;ments", "all ops", "ratios"]);
    var whyP = h("p", "w7-small", ""); tableBox.appendChild(whyP);
    ct.load();
  }

  /* ============================================================
     Task 5 — the triangular loop
     ============================================================ */
  function triCount(n, full) { var c = 0; for (var i = 0; i < n; i++) for (var j = 0; j < (full ? n : i); j++) c += 1; return c; }
  function triangle(host) {
    var tn = 8, full = false;
    U.title(host, "Animation · which cells of the n × n grid does the loop visit?");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("n", [[5, "5"], [8, "8"], [12, "12"]], tn, function (v) { tn = v; grid(); ct.load(); }));
    opts.appendChild(cls(seg("inner loop", [[false, "range(i) · triangular"], [true, "range(n) · full grid"]], full, function (v) { full = v; ct.load(); }), "w7-seg2"));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var inp = h("input"); inp.type = "number"; inp.min = "0"; inp.placeholder = "count?";
    inp.setAttribute("aria-label", "Your predicted count");
    opts2.appendChild(h("span", "lab", "predict the returned count:"));
    opts2.appendChild(inp);
    host.appendChild(opts2);
    function code() {
      return [full ? "def full_grid(n):" : "def triangular(n):", "    count = 0", "    for i in range(n):",
        full ? "        for j in range(n):       # runs n times" : "        for j in range(i):       # runs i times, not n",
        "            count += 1", "    return count", "", "print(" + (full ? "full_grid" : "triangular") + "(" + tn + "))"].join("\n");
    }
    function build() {
      var f = [], count = 0, n = tn, merge = n > 5;
      var cnt = function () { return { "count": count, "n(n−1)/2": n * (n - 1) / 2, "n²": n * n }; };
      f.push({ line: 0, vars: { n: n }, counters: cnt(), cells: [], note: "Grid rows are i, columns are j. Predict the count, then press <strong>play</strong>." });
      f.push({ line: 8, vars: { n: n }, counters: cnt(), cells: [], note: "Call with n = " + n + "." });
      f.push({ line: 2, vars: { n: n, count: 0 }, counters: cnt(), cells: [], note: "Start the counter at 0." });
      var cells = [];
      for (var i = 0; i < n; i++) {
        var lim = full ? n : i;
        f.push({ line: 3, vars: { n: n, count: count, i: i }, counters: cnt(), cells: cells.slice(), row: i,
          note: "Row i = " + i + ": the inner loop will run <strong>" + lim + "</strong> time" + (lim === 1 ? "" : "s") + (lim === 0 ? " — range(0) is empty, nothing happens." : ".") });
        for (var j = 0; j < lim; j++) {
          if (!merge) f.push({ line: 4, vars: { n: n, count: count, i: i, j: j }, counters: cnt(), cells: cells.slice(), row: i, cur: [i, j], note: "j = " + j + "." });
          count++; cells.push(i * n + j);
          f.push({ line: 5, vars: { n: n, count: count, i: i, j: j }, counters: cnt(), cells: cells.slice(), row: i, cur: [i, j], hl: merge ? [4] : [],
            note: "Visit cell (i = " + i + ", j = " + j + "): count = " + count + "." });
        }
      }
      f.push({ line: 6, vars: { n: n, count: count }, counters: cnt(), cells: cells.slice(), note: "Return " + count + "." });
      f.push({ line: 8, vars: { n: n, count: count }, out: [String(count)], counters: cnt(), cells: cells.slice(), end: true, note: endNote(count, n) });
      return f;
    }
    function endNote(count, n) {
      var p = parseInt(inp.value, 10), pv = isNaN(p) ? "" : p === count ? " Your prediction was exact." : " You predicted " + p + ".";
      if (full) return "The full grid: count = n² = <strong>" + count + "</strong>." + pv + " Doubling n multiplies n² by exactly 4.";
      return "count = <strong>" + count + "</strong> = " + n + "·" + (n - 1) + "/2 = n(n−1)/2 — just under half of the " + (n * n) + " cells (the diagonal is skipped too)." + pv +
        " Half a grid is still a quadratic: ½n² − ½n, keep n².";
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, varsTitle: "variables", outTitle: "output",
      fps: function () { return tn <= 5 ? 2.4 : tn <= 8 ? 4.5 : 9; },
      onFrame: function (fr) { paintGrid(fr); }
    });
    var gwrap = h("div", "w7-gridwrap");
    var gridEl = h("div", "w7-grid");
    gwrap.appendChild(h("div", "w7-axis", "j →"));
    gwrap.appendChild(gridEl);
    ct.extra.appendChild(gwrap);
    var tableBox = h("div", "w7-gap");
    ct.extra.appendChild(tableBox);
    tableBox.appendChild(h("div", "ct-h", "the task's sizes (the loops really run)"));
    var tw = h("div", "anim-table-wrap"); tableBox.appendChild(tw);
    var tab = U.table(tw, ["n", "count", "", "ratio"]);
    var whyP = h("p", "w7-small", ""); tableBox.appendChild(whyP);
    var cellEls = [], lastN = 0;
    function grid() {
      if (lastN === tn) return;
      lastN = tn; gridEl.innerHTML = ""; cellEls = [];
      gridEl.style.gridTemplateColumns = "1.4rem repeat(" + tn + ", 1fr)";
      gridEl.style.maxWidth = (tn * 30 + 24) + "px";
      for (var i = 0; i < tn; i++) {
        gridEl.appendChild(h("span", "w7-rl", "i=" + i));
        for (var j = 0; j < tn; j++) { var c = h("i", "w7-cell"); gridEl.appendChild(c); cellEls.push(c); }
      }
    }
    var cache = {};
    function paintGrid(fr) {
      grid();
      var set = {};
      (fr.cells || []).forEach(function (x) { set[x] = 1; });
      cellEls.forEach(function (c, x) {
        var i = Math.floor(x / tn), j = x % tn;
        var never = !full && j >= i;
        var k = "w7-cell" + (set[x] ? " on" : "") + (never ? " never" : "") + (fr.cur && fr.cur[0] === i && fr.cur[1] === j ? " cur" : "") +
          (fr.row === i && !set[x] && !never ? " row" : "");
        if (c.className !== k) c.className = k;
      });
      tableBox.style.display = fr.end ? "" : "none";
      if (fr.end) {
        var key = full ? "f" : "t";
        if (!cache[key]) cache[key] = [500, 1000, 2000].map(function (n) { return triCount(n, full); });
        var cs = cache[key];
        tab.el.tHead.rows[0].cells[2].innerHTML = full ? "n²" : "n(n−1)/2";
        tab.rows([500, 1000, 2000].map(function (n, j) {
          var formula = full ? n * n : n * (n - 1) / 2;
          return [sp(n), sp(cs[j]), sp(formula) + (formula === cs[j] ? " <span class='w7-good'>✓</span>" : ""), j ? (cs[j] / cs[j - 1]).toFixed(3) : "—"];
        }));
        whyP.innerHTML = full ? "Ratios are exactly 4: n² quadruples when n doubles."
          : "The count equals n(n−1)/2 exactly. The ratio is ≈ 4 (slightly above, and closing in) because the dominant term is ½n² — doubling n multiplies ½n² by 4. The ½ is a constant we drop: half a quadratic is still a quadratic.";
      }
    }
    grid();
    ct.load();
  }

  /* ============================================================
     Task 6 — adding vs multiplying
     ============================================================ */
  function geomChain(n) { var c = [n], i = n; while (i > 1) { i = Math.floor(i / 2); c.push(i); } return c; }
  function addVsMult(host) {
    var SIZES = [1000, 1000000, 1000000000], cur = 0, done = {}, dn = 8;
    U.title(host, "Animation · one pass at a time: add 1, or halve?");
    var codes = h("div", "w7-codes");
    codeBlock(codes, "def arithmetic_steps(n):\n    steps = 0\n    i = 0\n    while i < n:\n        i = i + 1    # ADD a constant\n        steps += 1\n    return steps");
    codeBlock(codes, "def geometric_steps(n):\n    steps = 0\n    i = n\n    while i > 1:\n        i = i // 2   # MULTIPLY (by 1/2)\n        steps += 1\n    return steps");
    host.appendChild(codes);
    var opts = h("div", "anim-opts w7-gap");
    opts.appendChild(cls(seg("n", SIZES.map(function (n, j) { return [j, sp(n)]; }), cur, function (v) { cur = v; player.load(); }), "w7-seg1"));
    host.appendChild(opts);
    function lane(name, cl) {
      var l = h("div", "w7-lane " + cl);
      var hd = h("div", "w7-lane-h");
      var nm = h("span", "who", name), info = h("span", "", "");
      hd.appendChild(nm); hd.appendChild(info);
      var tr = h("div", "w7-bar"), fill = h("i", "");
      tr.appendChild(fill);
      l.appendChild(hd); l.appendChild(tr);
      host.appendChild(l);
      return { info: info, fill: fill, l: l };
    }
    var LA = lane("adding · i = i + 1", "add"), LG = lane("halving · i = i // 2", "half");
    var ticks = h("div", "w7-ticks"), tk = [];
    for (var q = 0; q < 30; q++) { var t = h("i", ""); ticks.appendChild(t); tk.push(t); }
    LG.l.appendChild(ticks);
    var chain = h("div", "w7-chain");
    LG.l.appendChild(chain);
    var stats = h("div", "anim-stats");
    var sA = U.stat("adding: steps"), sG = U.stat("halving: steps");
    stats.appendChild(sA.el); stats.appendChild(sG.el);
    host.appendChild(stats);
    var m = U.msg(host);
    var box = h("div", "w7-gap");
    box.appendChild(h("div", "ct-h", "for n in [1000, 1000000, 1000000000]: print(…) — rows appear as you run each n"));
    var con = h("pre", "ct-out w7-con", "");
    box.appendChild(con);
    var tw = h("div", "anim-table-wrap"); box.appendChild(tw);
    var tab = U.table(tw, ["n", "adding", "halving", "vs row above"]);
    host.appendChild(box);
    var dbl = h("div", "w7-dbl");
    dbl.appendChild(h("div", "ct-h", "week 6's row: what does one doubling cost the halving loop?"));
    var drow = h("div", "anim-opts");
    var dOut = h("span", "w7-dout", "");
    drow.appendChild(btn("n ÷ 2", "", function () { if (dn > 1) { dn = Math.floor(dn / 2); if (hist.length > 1) hist.pop(); else hist = [dn]; paintD(); } }));
    drow.appendChild(btn("n × 2", "", function () { if (dn < 1 << 30) { dn *= 2; hist.push(dn); paintD(); } }));
    drow.appendChild(dOut);
    dbl.appendChild(drow);
    var dHist = h("div", "w7-chain");
    dbl.appendChild(dHist);
    host.appendChild(dbl);
    var hist = [8];
    function paintD() {
      var g = geomChain(dn).length - 1;
      dOut.innerHTML = "n = <b>" + sp(dn) + "</b> → adding <b>" + sp(dn) + "</b>, halving <b>" + g + "</b>";
      dHist.innerHTML = hist.map(function (n) { return "<b>" + sp(n) + "</b>: " + (geomChain(n).length - 1); }).join("  ·  ") +
        (hist.length > 1 ? "  <span class='w7-good'>— every doubling adds exactly one halving step</span>" : "");
    }
    function line(n) { return "n=" + rj(n, 8) + "   adding: " + rj(n, 8) + "   halving: " + (geomChain(n).length - 1); }
    function paintTable() {
      var lines = [], rows = [];
      SIZES.forEach(function (n, j) {
        if (!done[n]) return;
        lines.push(line(n));
        var g = geomChain(n).length - 1, prev = SIZES[j - 1];
        rows.push([sp(n), sp(n), String(g), prev && done[prev] ? "×1000 / +" + (g - (geomChain(prev).length - 1)) : "—"]);
      });
      con.textContent = lines.join("\n");
      tab.rows(rows.length ? rows : [["<span class='muted'>run a size</span>", "", "", ""]]);
    }
    function build() {
      var n = SIZES[cur], ch = geomChain(n), G = ch.length - 1, f = [];
      for (var k = 0; k <= G; k++) f.push({ k: k, n: n, ch: ch, G: G });
      f.push({ k: G, n: n, ch: ch, G: G, end: true });
      return f;
    }
    function human(sec) {
      if (sec < 3600) return Math.round(sec / 60) + " minutes";
      if (sec < 86400 * 2) return (sec / 3600).toFixed(1) + " hours";
      if (sec < 86400 * 365 * 2) return Math.round(sec / 86400) + " days";
      return Math.round(sec / (86400 * 365.25)) + " years";
    }
    function render(fr) {
      var n = fr.n, k = fr.k, iA = Math.min(k, n), iG = fr.ch[k];
      LA.fill.style.width = Math.max(iA / n * 100, iA ? 0.4 : 0) + "%";
      LA.info.textContent = "i = " + sp(iA) + " of " + sp(n);
      LG.fill.style.width = Math.max(iG / n * 100, 0.4) + "%";
      LG.info.textContent = "i = " + sp(iG);
      tk.forEach(function (t, j) { t.className = j < k ? "on" : j >= fr.G ? "off" : ""; });
      var show = fr.ch.slice(0, k + 1).map(function (x) { return "<b>" + sp(x) + "</b>"; });
      if (show.length > 9) show = show.slice(0, 2).concat(["…"]).concat(show.slice(-6));
      chain.innerHTML = show.join(" → ");
      sA.set(sp(k) + (fr.end ? " (still going)" : ""));
      sG.set(k + (k === fr.G ? " ✓" : ""));
      if (k === 0) {
        m.innerHTML = "Both loops take one pass per tick. How many passes will each need for n = " + sp(n) + "? Guess, then press <strong>play</strong>.";
      } else if (!fr.end) {
        m.innerHTML = "Pass " + k + ": the adding loop has reached i = " + k + " (" + (k / n * 100 < 0.01 ? "under 0.01%" : (k / n * 100).toFixed(1) + "%") + " of the way); the halving loop has cut i to " + sp(iG) + ".";
      } else {
        done[n] = true; paintTable();
        var rest = n - fr.G;
        m.innerHTML = "The halving loop is done after <strong>" + fr.G + " passes</strong>. The adding loop has done " + fr.G + " of its <strong>" + sp(n) + "</strong>; at one pass per second it would need about " +
          human(rest) + " more. " + (Object.keys(done).length < 3 ? "Run the other sizes to fill the table." : "Multiplying n by 1 000 multiplies the adding count by 1 000 but adds only about 10 halving steps (log₂ 1000 ≈ 10): that is O(log n).");
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 2.2; } });
    paintTable(); paintD();
    player.load();
  }

  function reg(name, fn) { AAAnim.register(name, function (host) { host.classList.add("w7-host"); fn(host); }); }
  reg("w7-count-verify", countVerify);
  reg("w7-dominant", dominant);
  reg("w7-crossover", crossover);
  reg("w7-two-counters", twoCounters);
  reg("w7-triangle", triangle);
  reg("w7-add-vs-mult", addVsMult);
})();
