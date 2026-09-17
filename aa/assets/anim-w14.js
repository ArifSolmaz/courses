/* ============================================================
   AA — week 14 "Workshop tasks" animations (§14.7)
   w14-diagnose   Task 1  find the four problems in build_report, trace, count growth
   w14-two-sum    Task 2  every pair vs one pass with a set; modelled benchmark
   w14-review     Task 3  peer-review a (made-up) benchmark draft
   w14-traps      Task 4  the five patterns of §14.3 as work maps + counted ratios
   w14-profile    Task 5  cProfile (function level) vs a focused list/set benchmark
   Timings shown here come from step-count models and are always labelled.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt;
  var SIM = "Simulated timings from a step-count model — run the real code in Colab for your own numbers.";

  /* ---------- local helpers ---------- */
  /* CodeTrace quotes every JS string; raw() lets a value print exactly as written (e.g. a Python set) */
  function raw(s) { var f = function () {}; f.toString = function () { return s; }; return f; }
  function pyList(a) { return raw("[" + a.join(", ") + "]"); }
  function pyStr(s) { return "'" + s + "'"; }
  function codeBox(src, first, cls) {
    var box = h("div", "ct-code w14-code" + (cls ? " " + cls : "")), rows = [];
    src.split("\n").forEach(function (ln, j) {
      var r = h("div", "ct-line", '<span class="ct-no">' + (first + j) + "</span><code>" + (U.pyLine(ln) || " ") + "</code>");
      box.appendChild(r); rows.push(r);
    });
    return { el: box, rows: rows };
  }
  /* U.seg, but allowed to wrap onto a second line on narrow screens */
  function seg(label, options, value, onChange) {
    var s = U.seg(label, options, value, onChange);
    s.className = "w14-seg";
    return s;
  }
  function secs(t) { return t >= 0.1 ? t.toFixed(3) : t >= 0.001 ? t.toFixed(4) : t.toFixed(5); }
  function ratio(a, b) { return "×" + (a / b).toFixed(2); }
  function tableIn(parent, heads) {
    var w = h("div", "anim-table-wrap w14-tw"); parent.appendChild(w);
    return U.table(w, heads);
  }
  function simNote(parent, text) { parent.appendChild(h("p", "note-sim", text || SIM)); }
  /* one multiple-choice question: opts = [{t, ok, why}] */
  function choice(parent, question, opts, cls, onRight) {
    var wrap = h("div", "w14-q" + (cls ? " " + cls : ""));
    wrap.appendChild(h("p", "q", question));
    var row = h("div", "anim-opts"), fb = h("p", "w14-fb");
    fb.setAttribute("aria-live", "polite");
    var bs = opts.map(function (o) {
      var b = btn(o.t, "", function () {
        fb.innerHTML = o.why;
        if (o.ok) {
          bs.forEach(function (x) { x.disabled = true; });
          b.className = "right";
          if (onRight) onRight();
        } else { b.className = "wrong"; b.disabled = true; }
      });
      row.appendChild(b); return b;
    });
    wrap.appendChild(row); wrap.appendChild(fb);
    parent.appendChild(wrap);
    return wrap;
  }
  /* python-like make_data(n, n // 10): customer index per order, watch position per name */
  function makeData(n, seed) {
    var r = U.rng(seed), names = Math.floor(n / 2), m = Math.floor(n / 10), j;
    var cust = new Int32Array(n), pool = new Int32Array(names), pos = new Int32Array(names);
    for (j = 0; j < n; j++) cust[j] = Math.floor(r() * names);
    for (j = 0; j < names; j++) { pool[j] = j; pos[j] = -1; }
    for (j = 0; j < m; j++) {
      var k = j + Math.floor(r() * (names - j)), t = pool[j]; pool[j] = pool[k]; pool[k] = t;
      pos[pool[j]] = j;
    }
    return { n: n, m: m, cust: cust, pos: pos };
  }

  /* ============================================================
     Task 1 — diagnose without running (report.py)
     ============================================================ */
  var T1_CODE = [
    "def build_report(orders, vip_customers):",
    "    lines = []",
    '    text = ""',
    "    for order in orders:",
    '        if order["customer"] in vip_customers:      # vip_customers is a list',
    "            lines = lines + [order]",
    '            text = text + order["id"] + ", "',
    "    total = 0",
    "    for order in lines:",
    '        total = total + sum(o["value"] for o in lines)',
    "    return lines, text, total"].join("\n");
  var T1_FIXED = [
    "def build_report(orders, vip_customers):",
    "    vips = set(vip_customers)                # O(m), once",
    '    lines = [o for o in orders if o["customer"] in vips]   # O(n)',
    '    text = ", ".join(o["id"] for o in lines)               # O(n)',
    '    total = sum(o["value"] for o in lines)                 # O(n)',
    "    return lines, text, total"].join("\n");
  var T1_ORD = [["o1", "Ada", 10], ["o2", "Bob", 5], ["o3", "Eve", 20], ["o4", "Ada", 15], ["o5", "Cy", 7], ["o6", "Dan", 12]];
  var T1_VIP = ["Dan", "Eve", "Ada"];
  var T1_PROB = {
    5: ["problem 1", "<strong>Problem 1 — search inside a loop.</strong> <code>in vip_customers</code> scans a <em>list</em>: up to m name comparisons for every order → O(n·m). Fix: <code>vips = set(vip_customers)</code> once, before the loop."],
    6: ["problem 2", "<strong>Problem 2 — building by concatenation.</strong> <code>lines + [order]</code> makes a brand-new list and copies everything already in <code>lines</code>. The copies add up to 1 + 2 + … + k → quadratic. Fix: <code>append</code>, or a list comprehension."],
    7: ["problem 3", "<strong>Problem 3 — string concatenation.</strong> <code>text + …</code> builds a new string each time; in the repeated-copy model it copies all the text so far → quadratic in the output length. Fix: <code>\", \".join(...)</code> once at the end."],
    10: ["problem 4", "<strong>Problem 4 — recomputing a total every round.</strong> <code>sum(...)</code> re-adds <em>all</em> of <code>lines</code> once per line → quadratic, <strong>and wrong</strong>: the total is multiplied by the number of lines. Fix: one <code>sum</code>, no loop."]
  };
  var T1_OTHER = {
    9: "Close — this loop on its own would be harmless. Look at what runs <em>inside</em> it.",
    4: "One pass over the orders is unavoidable — that is the n. The trouble is what happens inside this loop.",
    1: "The header just names the inputs. Not a problem.",
    11: "Returning three values is constant work. Not a problem."
  };

  function diagnose(host) {
    U.title(host, "Animation · diagnose build_report without running it");
    var mode = "hunt", found = {}, fine = {}, wrong = 0, classOk = false, player = null;
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("step", [["hunt", "1 · find the problems"], ["trace", "2 · trace a small run"], ["grow", "3 · count the growth"]], mode,
      function (v) { mode = v; show(); }));
    host.appendChild(opts);
    var stage = h("div", "");
    host.appendChild(stage);

    function show() {
      if (player) player.stop();
      player = null;
      stage.innerHTML = "";
      if (mode === "hunt") hunt(); else if (mode === "trace") trace(); else grow();
    }

    /* ----- 1. hunt ----- */
    function hunt() {
      stage.appendChild(h("p", "w14-lead", "Read <code>report.py</code> and click every line that hides repeated work or gives a wrong answer. There are <strong>four</strong>."));
      var cb = codeBox(T1_CODE, 1, "w14-pick");
      stage.appendChild(cb.el);
      var stats = h("div", "anim-stats");
      var sFound = U.stat("problems found"), sWrong = U.stat("lines that were fine");
      stats.appendChild(sFound.el); stats.appendChild(sWrong.el);
      stage.appendChild(stats);
      var m = U.msg(stage);
      var quiz = h("div", "");
      stage.appendChild(quiz);
      var ctr = h("div", "anim-controls");
      ctr.appendChild(btn("show all four", "", function () {
        Object.keys(T1_PROB).forEach(function (k) { found[k] = true; });
        paint(); m.innerHTML = "All four are marked. Click any red line to read why."; maybeQuiz();
      }));
      ctr.appendChild(btn("start again", "", function () { found = {}; fine = {}; wrong = 0; classOk = false; show(); }));
      stage.appendChild(ctr);

      function nFound() { return Object.keys(found).length; }
      function paint() {
        cb.rows.forEach(function (r, j) {
          var no = j + 1;
          r.className = "ct-line" + (found[no] ? " w14-hit" : fine[no] ? (no === 9 ? " w14-near" : " w14-fine") : "");
          var tag = r.querySelector(".w14-tag");
          if (found[no] && !tag) r.appendChild(h("span", "w14-tag", T1_PROB[no][0]));
        });
        sFound.set(nFound() + " / 4"); sWrong.set(wrong);
      }
      function pick(no, r) {
        if (T1_PROB[no]) {
          found[no] = true; paint();
          m.innerHTML = T1_PROB[no][1] + (nFound() < 4 ? " <span class='muted'>" + (4 - nFound()) + " to go.</span>" : "");
          maybeQuiz();
        } else {
          if (!fine[no] && no !== 9) wrong++;
          fine[no] = true;
          paint();
          m.innerHTML = "Line " + no + ": " + (T1_OTHER[no] || "this line does a fixed amount of work each time it runs. Not a problem.");
        }
      }
      cb.rows.forEach(function (r, j) {
        r.setAttribute("role", "button"); r.tabIndex = 0;
        r.setAttribute("aria-label", "Line " + (j + 1));
        r.addEventListener("click", function () { pick(j + 1, r); });
        r.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(j + 1, r); } });
      });
      function maybeQuiz() {
        if (nFound() < 4 || quiz.firstChild) return;
        choice(quiz, "All four found. Now name the class: with n orders and a VIP list that grows with n, <code>build_report</code> as written is…", [
          { t: "O(n)", why: "It has one loop over the orders — but count what each pass does: line 5 scans up to m names, lines 6–7 copy everything built so far." },
          { t: "O(n log n)", why: "Nothing here halves anything, so there is no log factor." },
          { t: "O(n²)", ok: true, why: "Right. The pieces are n·m scans, about k²/2 list copies, a triangular sum of copied characters and k² re-additions (k = VIP orders). They <em>add</em>, and with m and k growing with n the whole is O(n²). Now open <strong>2 · trace a small run</strong>." },
          { t: "O(n³)", why: "Line 10 is one <code>sum</code> inside one loop: k × k, not k³. The four problems add up; they do not multiply." }
        ], "", function () { classOk = true; });
      }
      paint();
      m.innerHTML = nFound() ? nFound() + " of 4 found so far." : "Nothing is marked yet. Predict before you click: which lines repeat work that grows with the data?";
      maybeQuiz();
    }

    /* ----- 2. trace ----- */
    var variant = "bug";
    function trace() {
      var o2 = h("div", "anim-opts");
      o2.appendChild(seg("version", [["bug", "report.py (as given)"], ["fix", "report_fixed.py"]], variant, function (v) { variant = v; ct.load(); }));
      stage.appendChild(o2);
      var ct = U.CodeTrace(stage, {
        code: function () { return variant === "bug" ? T1_CODE : T1_FIXED; },
        varsTitle: "variables", outTitle: "returned",
        build: function () { return variant === "bug" ? bugFrames() : fixFrames(); },
        fps: function () { return variant === "bug" ? 1.8 : 1.2; },
        onFrame: paint
      });
      player = ct;
      var ex = ct.extra;
      function row(label) { var r = h("div", "w14-row"); r.appendChild(h("span", "lab", label)); ex.appendChild(r); return r; }
      var rO = row("orders"), ordArr = h("div", "arr"); rO.appendChild(ordArr);
      var ordCells = T1_ORD.map(function (o) { var c = h("div", "cell w14-ord", o[0] + "<small>" + o[1] + " · " + o[2] + "</small>"); ordArr.appendChild(c); return c; });
      var rV = row("vip_customers"), vOpen = h("span", "w14-brace", ""), vipArr = h("div", "arr"), vClose = h("span", "w14-brace", ""), vFlag = h("span", "w14-flag", "");
      rV.appendChild(vOpen); rV.appendChild(vipArr); rV.appendChild(vClose); rV.appendChild(vFlag);
      var vipCells = T1_VIP.map(function (v) { var c = h("div", "cell", v); vipArr.appendChild(c); return c; });
      var rL = row("lines"), linesArr = h("div", "arr"); rL.appendChild(linesArr);
      var rT = row("text"), textBox = h("div", "w14-text", ""); rT.appendChild(textBox);

      function paint(fr) {
        var bug = variant === "bug";
        vOpen.textContent = bug ? "[" : "{"; vClose.textContent = bug ? "]" : "}";
        rV.firstChild.textContent = bug ? "vip_customers (list)" : "vips (set)";
        ordCells.forEach(function (c, j) {
          var cls = "cell w14-ord";
          if (fr.second || fr.done) cls += fr.inL && fr.inL.indexOf(T1_ORD[j][0]) >= 0 ? (fr.sumAll ? " gold" : " good") : " dim";
          else if (j === fr.ord) cls += fr.hitNow ? " good" : " on";
          else if (fr.ord >= 0 && j < fr.ord) cls += fr.L.indexOf(T1_ORD[j][0]) >= 0 ? " good" : " dim";
          c.className = cls;
        });
        vipCells.forEach(function (c, j) {
          var cls = "cell";
          if (bug && fr.vj >= 0) cls += j === fr.vj ? (fr.vhit ? " good" : " bad") : j < fr.vj ? " dim" : "";
          if (!bug && fr.vhitName && T1_VIP[j] === fr.vhitName) cls += " good";
          if (!bug && fr.built === false) cls += " dim";
          c.className = cls;
        });
        vFlag.className = "w14-flag" + (fr.flag ? " " + fr.flag[1] : "");
        vFlag.textContent = fr.flag ? fr.flag[0] : "";
        linesArr.innerHTML = "";
        if (!fr.L.length) linesArr.appendChild(h("div", "cell w14-empty", "[ ]"));
        fr.L.forEach(function (id, j) {
          var cls = "cell";
          if (fr.copyN != null) cls += j < fr.copyN ? " gold" : " good";
          else if (fr.sumAll) cls += " gold";
          else if (fr.sumI === j) cls += " on";
          linesArr.appendChild(h("div", cls, id));
        });
        var t = fr.text, cp = fr.copyChars;
        if (t == null) textBox.innerHTML = "<span class='muted'>(not built yet)</span>";
        else if (cp != null) textBox.innerHTML = '"<span class="cp">' + U.esc(t.slice(0, cp)) + '</span><span class="nw">' + U.esc(t.slice(cp)) + '</span>"';
        else textBox.innerHTML = '"' + U.esc(t) + '"';
      }

      function bugFrames() {
        var f = [], cmp = 0, items = 0, chars = 0, sums = 0, L = [], text = "", total = null;
        function push(line, note, o, x) {
          var v = {};
          if (o) { v['order["id"]'] = o[0]; if (!x || !x.second) v['order["customer"]'] = o[1]; }
          if (!x || !x.second) v["lines (ids)"] = L.slice();
          if (line >= 3 && (!x || !x.second)) v.text = text;
          if (total != null) v.total = total;
          var fr = { line: line, note: note, vars: v, out: [], ord: -1, vj: -1, L: L.slice(), text: line >= 3 ? text : null,
            counters: { "list comparisons": cmp, "items copied": items, "chars copied": chars, "values re-added": sums } };
          for (var k in x) fr[k] = x[k];
          f.push(fr);
        }
        push(1, "<code>build_report</code> is called with the 6 orders and the 3-name VIP <em>list</em> shown below. Press <strong>play</strong> and watch the four counters — each one is a problem from step 1.");
        push(2, "<code>lines</code> starts as an empty list.");
        push(3, "<code>text</code> starts as an empty string.");
        T1_ORD.forEach(function (o, oi) {
          push(4, "Next order: <strong>" + o[0] + "</strong> from " + o[1] + ".", o, { ord: oi });
          var hit = -1;
          for (var j = 0; j < T1_VIP.length; j++) {
            cmp++;
            var eq = T1_VIP[j] === o[1];
            push(5, "<code>in</code> on a list compares one name at a time: is \"" + o[1] + "\" == \"" + T1_VIP[j] + "\"? " +
              (eq ? "<strong>Yes</strong> — found after " + (j + 1) + " comparison" + (j ? "s" : "") + "."
                : j === T1_VIP.length - 1 ? "No, and that was the last name: <strong>" + T1_VIP.length + " comparisons</strong> just to learn “not a VIP”." : "No — keep scanning."),
              o, { ord: oi, vj: j, vhit: eq, hitNow: eq, flag: eq ? ["found", "good"] : ["scanning…", "bad"] });
            if (eq) { hit = j; break; }
          }
          if (hit < 0) return;
          var old = L.length;
          items += old + 1; L.push(o[0]);
          push(6, "<code>lines + [order]</code> builds a <em>new</em> list: it copies the " + old + " item" + (old === 1 ? "" : "s") + " already there (gold) plus the new one → <strong>" +
            (old + 1) + " cop" + (old ? "ies" : "y") + "</strong>. The old list is thrown away.", o, { ord: oi, hitNow: true, copyN: old });
          var t0 = text.length, a = t0 + o[0].length, b = a + 2;
          chars += a + b; text = text + o[0] + ", ";
          push(7, "<code>text + order[\"id\"]</code> builds a new " + a + "-character string, then <code>+ \", \"</code> builds another of " + b +
            " → <strong>" + (a + b) + " characters copied</strong>. The old text (gold, " + t0 + " chars) is copied again every time.", o, { ord: oi, hitNow: true, copyChars: t0 });
        });
        total = 0;
        push(8, "First loop done: " + L.length + " VIP orders in <code>lines</code>. <code>total</code> starts at 0.", null, { second: true, inL: L.slice() });
        var vals = T1_ORD.filter(function (o) { return L.indexOf(o[0]) >= 0; }).map(function (o) { return o[2]; });
        var s = vals.reduce(function (p, q) { return p + q; }, 0);
        L.forEach(function (id, li) {
          var o = T1_ORD.filter(function (x) { return x[0] === id; })[0];
          push(9, "Loop over <code>lines</code>: order <strong>" + id + "</strong>.", o, { second: true, inL: L.slice(), sumI: li });
          sums += L.length; total += s;
          push(10, "<code>sum(o[\"value\"] for o in lines)</code> walks <em>all</em> " + L.length + " lines again: " + vals.join(" + ") + " = " + s +
            ". <code>total</code> is now <strong>" + total + "</strong>" + (li ? " — it keeps growing." : "."), o, { second: true, inL: L.slice(), sumAll: true });
        });
        push(11, "Returned. <strong>total = " + total + "</strong>, but the VIP orders are worth " + vals.join(" + ") + " = " + s +
          ": the last loop multiplied the answer by " + L.length + ". Work: " + cmp + " + " + items + " + " + chars + " + " + sums +
          " = <strong>" + (cmp + items + chars + sums) + " steps</strong> for 6 orders. Now switch to <em>report_fixed.py</em>.",
          null, { done: true, inL: L.slice() });
        f[f.length - 1].out = ["lines = [" + L.join(", ") + "]   (the order dicts)", "text  = " + pyStr(text), "total = " + total + "   ← should be " + s];
        f[f.length - 1].errOut = true;
        return f;
      }

      function fixFrames() {
        var f = [], ins = 0, look = 0, app = 0, chars = 0, adds = 0, L = [], text = null, total = null, built = false;
        function push(line, note, o, x) {
          var v = {};
          if (built) v.vips = raw("{" + T1_VIP.map(function (s) { return pyStr(s); }).join(", ") + "}");
          if (o) { v['o["id"]'] = o[0]; v['o["customer"]'] = o[1]; }
          if (line >= 4 || (line === 3 && L.length)) v["lines (ids)"] = L.slice();
          if (text != null) v.text = text;
          if (total != null) v.total = total;
          var fr = { line: line, note: note, vars: v, out: [], ord: -1, vj: -1, L: L.slice(), text: text, built: built,
            counters: { "set inserts": ins, "set lookups": look, "items appended": app, "chars joined": chars, "values added": adds } };
          for (var k in x) fr[k] = x[k];
          f.push(fr);
        }
        push(1, "Same call, repaired function. Press <strong>play</strong> and compare the counters with the buggy run (15 + 10 + 72 + 16 = 113).");
        ins = T1_VIP.length; built = true;
        push(2, "Build the set <em>once</em>: " + ins + " inserts. This O(m) is paid up front, outside any loop.");
        T1_ORD.forEach(function (o, oi) {
          look++;
          var hit = T1_VIP.indexOf(o[1]) >= 0;
          if (hit) { app++; L.push(o[0]); }
          push(3, "Comprehension, order <strong>" + o[0] + "</strong>: is \"" + o[1] + "\" in <code>vips</code>? One hash lookup, no scanning → " +
            (hit ? "<strong>yes</strong>, keep it (one append)." : "no."), o,
            { ord: oi, hitNow: hit, vhitName: hit ? o[1] : null, flag: hit ? ["1 lookup: found", "good"] : ["1 lookup: not there", "bad"] });
        });
        text = L.join(", "); chars = text.length;
        push(4, "<code>\", \".join(...)</code> works out the final length and copies each character <em>once</em>: " + chars + " characters, and no trailing separator.",
          null, { copyChars: 0, done: true, inL: L.slice() });
        var vals = T1_ORD.filter(function (o) { return L.indexOf(o[0]) >= 0; }).map(function (o) { return o[2]; });
        adds = vals.length; total = vals.reduce(function (p, q) { return p + q; }, 0);
        push(5, "One <code>sum</code>: " + vals.join(" + ") + " = <strong>" + total + "</strong>. " + adds + " additions, and the right answer.",
          null, { sumAll: true, done: true, inL: L.slice() });
        push(6, "Returned. Work: " + ins + " + " + look + " + " + app + " + " + chars + " + " + adds + " = <strong>" + (ins + look + app + chars + adds) +
          " steps</strong> (buggy: 113) and <code>total = " + total + "</code> (buggy: 228). At 6 orders the gap looks small — open <strong>3 · count the growth</strong>.",
          null, { done: true, inL: L.slice() });
        f[f.length - 1].out = ["lines = [" + L.join(", ") + "]   (the order dicts)", "text  = " + pyStr(text), "total = " + total];
        return f;
      }
      ct.load();
    }

    /* ----- 3. growth (counted operations on make_data-style inputs) ----- */
    function grow() {
      stage.appendChild(h("p", "w14-lead", "Same two functions on bigger inputs built like §14.4’s <code>make_data(n, n // 10)</code> (ids <code>o1</code>, <code>o2</code>, …). Predict first: when n doubles, the buggy version’s work grows by…"));
      var pred = null;
      var po = h("div", "anim-opts");
      po.appendChild(seg("prediction", [["2", "×2"], ["4", "×4"], ["8", "×8"]], null, function (v) { pred = v; }));
      stage.appendChild(po);
      var ctr = h("div", "anim-controls");
      var bRun = btn("&#9654; count the work", "primary", run);
      ctr.appendChild(bRun);
      stage.appendChild(ctr);
      var tb = tableIn(stage, ["n", "buggy work", "×", "fixed work", "×"]);
      tb.rows([]);
      var bd = h("div", "w14-hide");
      stage.appendChild(bd);
      bd.appendChild(h("div", "w14-h", "where the buggy work goes at n = 8 000"));
      var stack = h("div", "w14-stack"); bd.appendChild(stack);
      var legend = h("div", "w14-legend"); bd.appendChild(legend);
      var m = U.msg(stage);
      stage.appendChild(h("p", "note-sim", "Counted operations from a model (list comparisons, list items copied, string characters copied in the repeated-copy model, values added) — not timings."));
      m.innerHTML = "Pick a prediction, then press <strong>count the work</strong>.";
      var timer = 0;
      function count(n) {
        var d = makeData(n, 1400 + n), cmp = 0, k = 0, items = 0, chars = 0, tlen = 0, idLen = 0;
        for (var i = 0; i < n; i++) {
          var p = d.pos[d.cust[i]];
          cmp += p >= 0 ? p + 1 : d.m;
          if (p >= 0) {
            k++; items += k;
            var len = 1 + String(i + 1).length;           /* "o" + number */
            chars += (tlen + len) + (tlen + len + 2); tlen += len + 2; idLen += len;
          }
        }
        var sums = k * k, bug = cmp + items + chars + sums;
        var fix = d.m + n + k + (k ? idLen + 2 * (k - 1) : 0) + k;
        return { n: n, bug: bug, fix: fix, parts: [cmp, items, chars, sums] };
      }
      function run() {
        clearTimeout(timer); bRun.disabled = true;
        var sizes = [1000, 2000, 4000, 8000], res = [], i = 0;
        (function next() {
          res.push(count(sizes[i]));
          tb.rows(res.map(function (r, j) {
            return [fmt(r.n), fmt(r.bug), j ? ratio(r.bug, res[j - 1].bug) : "", fmt(r.fix), j ? ratio(r.fix, res[j - 1].fix) : ""];
          }), res.length - 1);
          i++;
          if (i < sizes.length) { timer = setTimeout(next, U.REDUCED ? 0 : 550); return; }
          bRun.disabled = false;
          var last = res[3], tot = last.bug, cols = ["--red", "--accent", "--blue", "--green"],
            names = ["1 · list comparisons", "2 · list copies", "3 · text chars", "4 · re-sums"];
          stack.innerHTML = ""; legend.innerHTML = "";
          last.parts.forEach(function (p, j) {
            var s = h("span", ""); s.style.width = (p / tot * 100) + "%"; s.style.background = "var(" + cols[j] + ")"; stack.appendChild(s);
            legend.appendChild(h("span", "", "<i style='background:var(" + cols[j] + ")'></i>" + names[j] + " " + Math.round(p / tot * 100) + "%"));
          });
          bd.classList.remove("w14-hide");
          var avg = Math.pow(res[3].bug / res[0].bug, 1 / 3);
          var verdict = pred == null ? "" : pred === "4" ? " Your prediction (×4) was right." : " You predicted ×" + pred + "; the table says about ×4.";
          m.innerHTML = "The buggy column grows about <strong>×" + avg.toFixed(1) + "</strong> per doubling — the O(n²) fingerprint — while the fixed column grows ×2 (O(n)). " +
            "At 8 000 orders the buggy version does <strong>" + Math.round(res[3].bug / res[3].fix) + "×</strong> the work, and the gap keeps widening." + verdict;
        })();
      }
    }
    show();
  }
  AAAnim.register("w14-diagnose", diagnose);

  /* ============================================================
     Task 2 — the interview question (two-sum)
     ============================================================ */
  var T2_SLOW = [
    "def has_pair_slow(data, target):",
    "    for i in range(len(data)):",
    "        for j in range(i + 1, len(data)):",
    "            if data[i] + data[j] == target:",
    "                return True",
    "    return False"].join("\n");
  var T2_FAST = [
    "def has_pair(data, target):",
    "    seen = set()",
    "    for x in data:",
    "        if target - x in seen:      # O(1)",
    "            return True",
    "        seen.add(x)",
    "    return False"].join("\n");
  var T2_BENCH = [
    "for n in [2000, 4000, 8000]:",
    "    data = random.sample(range(10**6), n)   # built outside the timer",
    "    target = -1                             # no pair: the worst case",
    "    for f in (has_pair_slow, has_pair):",
    "        start = time.perf_counter()",
    "        f(data, target)",
    "        print(n, f.__name__, round(time.perf_counter() - start, 5))"].join("\n");
  var T2_DATA = [8, 3, 11, 6, 2, 9, 4, 7];

  function twoSum(host) {
    U.title(host, "Animation · does any pair add up to the target?");
    var mode = "trace", variant = "slow", target = 13, player = null;
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("part", [["trace", "1 · trace both on 8 numbers"], ["bench", "2 · benchmark 2 000 → 8 000"]], mode, function (v) { mode = v; show(); }));
    host.appendChild(opts);
    var stage = h("div", "");
    host.appendChild(stage);
    function show() {
      if (player) player.stop();
      player = null; stage.innerHTML = "";
      if (mode === "trace") trace(); else bench();
    }

    function trace() {
      var o1 = h("div", "anim-opts");
      o1.appendChild(seg("version", [["slow", "obvious · every pair"], ["fast", "set · one pass"]], variant, function (v) { variant = v; ct.load(); }));
      stage.appendChild(o1);
      var o2 = h("div", "anim-opts");
      var tSeg = seg("target", [[13, "13 (a pair exists)"], [100, "100 (no pair: worst case)"]], target, function (v) { target = v; inp.value = String(v); ct.load(); });
      o2.appendChild(tSeg);
      var inp = h("input"); inp.type = "number"; inp.value = String(target);
      inp.setAttribute("aria-label", "Your own target");
      o2.appendChild(h("span", "lab", "or your own:"));
      o2.appendChild(inp);
      o2.appendChild(btn("use", "", function () {
        var v = parseInt(inp.value, 10);
        if (isNaN(v)) return;
        target = v;
        tSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        ct.load();
      }));
      stage.appendChild(o2);
      var ct = U.CodeTrace(stage, {
        code: function () { return variant === "slow" ? T2_SLOW : T2_FAST; },
        build: function () { return variant === "slow" ? slowFrames() : fastFrames(); },
        fps: function (i, fr) { return fr.length > 40 ? 3.2 : 1.6; },
        onFrame: paint
      });
      player = ct;
      var ex = ct.extra;
      var r1 = h("div", "w14-row"); r1.appendChild(h("span", "lab", "data")); var dArr = h("div", "arr idx"); r1.appendChild(dArr); ex.appendChild(r1);
      var dCells = T2_DATA.map(function (v, j) { var c = h("div", "cell", v + "<small>" + j + "</small>"); dArr.appendChild(c); return c; });
      var r2 = h("div", "w14-row"); var r2l = h("span", "lab", "seen"); r2.appendChild(r2l);
      var sOpen = h("span", "w14-brace", "{"), sArr = h("div", "arr"), sClose = h("span", "w14-brace", "}"), sFlag = h("span", "w14-flag", "");
      r2.appendChild(sOpen); r2.appendChild(sArr); r2.appendChild(sClose); r2.appendChild(sFlag);
      ex.appendChild(r2);

      function paint(fr) {
        var slow = variant === "slow";
        dCells.forEach(function (c, j) {
          var cls = "cell";
          if (slow) {
            if (fr.eq && (j === fr.i || j === fr.j)) cls += " good";
            else if (j === fr.i) cls += " on";
            else if (j === fr.j) cls += " gold";
            else if (fr.i != null && j < fr.i) cls += " dim";
          } else {
            if (j === fr.k) cls += fr.hit ? " good" : " on";
            else if (fr.k != null && j < fr.k) cls += " dim";
          }
          c.className = cls;
        });
        r2.style.display = slow ? "none" : "";
        sArr.innerHTML = "";
        (fr.seen || []).forEach(function (v) { sArr.appendChild(h("div", "cell" + (fr.hit && v === fr.need ? " good" : ""), v)); });
        if (!fr.seen || !fr.seen.length) sArr.appendChild(h("div", "cell w14-empty", "empty"));
        sFlag.className = "w14-flag" + (fr.need != null ? (fr.hit ? " good" : " bad") : "");
        sFlag.textContent = fr.need != null ? "looking for " + fr.need + (fr.hit ? ": found" : ": not there") : "";
      }

      function slowFrames() {
        var d = T2_DATA, f = [], checks = 0, n = d.length;
        function push(line, note, x, out) {
          var fr = { line: line, note: note, vars: { target: target }, out: out || [], counters: { "pair checks": checks } };
          if (x && x.i != null) { fr.vars.i = x.i; fr.vars["data[i]"] = d[x.i]; }
          if (x && x.j != null) { fr.vars.j = x.j; fr.vars["data[j]"] = d[x.j]; fr.vars["data[i] + data[j]"] = d[x.i] + d[x.j]; fr.hl = [3]; }
          for (var k in x) fr[k] = x[k];
          f.push(fr);
        }
        push(1, "<code>has_pair_slow(data, " + target + ")</code>: try every pair i &lt; j. How many checks will it need? Guess, then press <strong>play</strong>.", {});
        for (var i = 0; i < n; i++) {
          push(2, "i = " + i + ", so data[i] = <strong>" + d[i] + "</strong>. Pair it with every number to its right.", { i: i });
          for (var j = i + 1; j < n; j++) {
            checks++;
            var s = d[i] + d[j], eq = s === target;
            push(4, d[i] + " + " + d[j] + " = " + s + (eq ? " = target!" : " ≠ " + target + "."), { i: i, j: j, eq: eq });
            if (eq) {
              push(5, "Return <code>True</code> after <strong>" + checks + " pair checks</strong>.", { i: i, j: j, eq: true }, ["True"]);
              return f;
            }
          }
        }
        push(6, "No pair adds up to " + target + ": all <strong>" + checks + "</strong> pairs were checked (8·7/2). For n numbers that is n(n−1)/2 checks — O(n²).", {}, ["False"]);
        return f;
      }
      function fastFrames() {
        var d = T2_DATA, f = [], look = 0, seen = [];
        function push(line, note, x, out) {
          var fr = { line: line, note: note, vars: { target: target }, out: out || [], counters: { "set lookups": look }, seen: seen.slice() };
          if (line > 1) fr.vars.seen = raw(seen.length ? "{" + seen.join(", ") + "}" : "set()");
          if (x && x.k != null) fr.vars.x = d[x.k];
          if (x && x.need != null) fr.vars["target - x"] = x.need;
          for (var k in x) fr[k] = x[k];
          f.push(fr);
        }
        push(1, "<code>has_pair(data, " + target + ")</code>: one pass, remembering what we have seen. How many lookups will it need? Guess, then press <strong>play</strong>.", {});
        push(2, "<code>seen</code> starts as an empty set.", {});
        for (var k = 0; k < d.length; k++) {
          var x = d[k];
          push(3, "x = <strong>" + x + "</strong>.", { k: k });
          look++;
          var need = target - x, hit = seen.indexOf(need) >= 0;
          push(4, "Its partner would be target − x = " + target + " − " + x + " = <strong>" + need + "</strong>. Is it in <code>seen</code>? One hash lookup: " +
            (hit ? "<strong>yes!</strong>" : "no."), { k: k, need: need, hit: hit });
          if (hit) {
            push(5, "Return <code>True</code>: " + need + " + " + x + " = " + target + ", found after only <strong>" + look + " lookup" + (look > 1 ? "s" : "") + "</strong>.",
              { k: k, need: need, hit: true }, ["True"]);
            return f;
          }
          seen.push(x);
          push(6, "Remember " + x + " so a later number can pair with it.", { k: k });
        }
        push(7, "Return <code>False</code> after <strong>" + look + " lookups</strong> — exactly one per number, never a search. For n numbers: n lookups, O(n).", {}, ["False"]);
        return f;
      }
      ct.load();
    }

    function bench() {
      stage.appendChild(h("p", "w14-lead", "Benchmark the worst case — no pair exists, so both functions must finish their work. The harness:"));
      stage.appendChild(codeBox(T2_BENCH, 1).el);
      var pred = null;
      var po = h("div", "anim-opts"); po.style.marginTop = ".8rem";
      po.appendChild(seg("predict: slow time per doubling", [["2", "×2"], ["4", "×4"], ["8", "×8"]], null, function (v) { pred = v; }));
      stage.appendChild(po);
      var ctr = h("div", "anim-controls");
      var bRun = btn("&#9654; run the benchmark", "primary", run);
      ctr.appendChild(bRun);
      stage.appendChild(ctr);
      var tb = tableIn(stage, ["n", "slow (s)", "×", "set (s)", "×", "slow ÷ set"]);
      tb.rows([]);
      var chartBox = h("div", "w14-hide");
      stage.appendChild(chartBox);
      var chart = U.LineChart(chartBox, { logx: true, logy: true, xlabel: "n", ylabel: "seconds", height: 280, label: "log-log plot of simulated times for both versions" });
      var m = U.msg(stage);
      simNote(stage, SIM + " Model: slow = n(n−1)/2 pair checks × 55 ns; set = n × 75 ns; ±4% noise.");
      m.innerHTML = "Predict first, then press <strong>run the benchmark</strong>.";
      var timer = 0;
      function run() {
        clearTimeout(timer); bRun.disabled = true;
        var r = U.rng(214), sizes = [2000, 4000, 8000], res = [], i = 0;
        function noise() { return 1 + 0.04 * (2 * r() - 1); }
        (function next() {
          var n = sizes[i];
          res.push({ n: n, slow: (n * (n - 1) / 2 * 55e-9 + n * 40e-9) * noise(), fast: n * 75e-9 * noise() });
          tb.rows(res.map(function (x, j) {
            return [fmt(x.n), secs(x.slow), j ? ratio(x.slow, res[j - 1].slow) : "", secs(x.fast), j ? ratio(x.fast, res[j - 1].fast) : "", fmt(Math.round(x.slow / x.fast)) + "×"];
          }), res.length - 1);
          chartBox.classList.remove("w14-hide");
          chart.draw([
            { name: "has_pair_slow  O(n²)", color: "--red", points: res.map(function (x) { return [x.n, x.slow]; }) },
            { name: "has_pair (set)  O(n)", color: "--green", points: res.map(function (x) { return [x.n, x.fast]; }) }
          ], { xr: [2000, 8000], yr: [1e-4, 3] });
          i++;
          if (i < sizes.length) { timer = setTimeout(next, U.REDUCED ? 0 : 700); return; }
          bRun.disabled = false;
          var N = 1e6, ts = N * (N - 1) / 2 * 55e-9, tf = N * 75e-9;
          var v = pred == null ? "" : pred === "4" ? " Your prediction (×4) was right." : " You predicted ×" + pred + " — the slow column says about ×4.";
          m.innerHTML = "The slow column grows about <strong>×4</strong> per doubling, the set column about <strong>×2</strong>, and the gap column keeps growing — two different classes." + v +
            " <span class='muted'>Same model at the task’s million numbers: slow ≈ " + fmt(Math.round(ts)) + " s (about " + (ts / 3600).toFixed(1) + " hours) versus set ≈ " + tf.toFixed(3) + " s.</span>";
        })();
      }
    }
    show();
  }
  AAAnim.register("w14-two-sum", twoSum);

  /* ============================================================
     Task 3 — peer review (a made-up classmate's draft)
     ============================================================ */
  var T3_HEAD = [
    "import time, random",
    "",
    "def dedupe_slow(ids):",
    "    out = []",
    "    for x in ids:",
    "        if x not in out:",
    "            out.append(x)",
    "    return out",
    ""];
  var T3_DRAFT = T3_HEAD.concat([
    "for n in [1000, 2000, 4000, 8000]:",
    "    start = time.perf_counter()",
    "    ids = [random.randint(1, 100) for _ in range(n)]",
    "    result = dedupe_slow(ids)",
    "    t = time.perf_counter() - start",
    "    print(n, round(t, 4))"]).join("\n");
  var T3_FIXED = T3_HEAD.concat([
    "for n in [1000, 2000, 4000, 8000]:",
    "    ids = random.sample(range(10**9), n)   # all distinct: worst case",
    '    best = float("inf")',
    "    for _ in range(5):                      # repeats, keep the best",
    "        start = time.perf_counter()",
    "        dedupe_slow(ids)",
    "        best = min(best, time.perf_counter() - start)",
    "    print(n, round(best, 4))"]).join("\n");
  var T3_SIZES = [1000, 2000, 4000, 8000];
  var C_CMP = 30e-9, C_ITEM = 60e-9, C_RANDINT = 0.65e-6;

  function t3Draft() {                     /* simulate the draft: randint(1, 100), timer around everything */
    return T3_SIZES.map(function (n) {
      var r = U.rng(3000 + n), pos = {}, len = 0, comps = 0;
      for (var i = 0; i < n; i++) {
        var x = 1 + Math.floor(r() * 100);
        if (pos[x] !== undefined) comps += pos[x] + 1; else { comps += len; pos[x] = len; len++; }
      }
      var build = n * C_RANDINT, work = comps * C_CMP + n * C_ITEM, noise = 1 + 0.12 * (2 * r() - 1);
      return { n: n, comps: comps, distinct: len, build: build * noise, work: work * noise, t: (build + work) * noise };
    });
  }
  function t3Fixed() {                     /* all distinct, built outside the timer, best of 5 */
    return T3_SIZES.map(function (n) {
      var r = U.rng(3100 + n), comps = n * (n - 1) / 2, base = comps * C_CMP + n * C_ITEM, runs = [], best = Infinity;
      for (var k = 0; k < 5; k++) { var t = base * (1 + 0.08 * r()); runs.push(t); best = Math.min(best, t); }
      return { n: n, comps: comps, distinct: n, runs: runs, t: best };
    });
  }
  function r4(t) { var v = Math.round(t * 1e4) / 1e4; return String(v).indexOf(".") < 0 ? v + ".0" : String(v); }

  function review(host) {
    U.title(host, "Animation · peer-review a benchmark draft");
    host.appendChild(h("p", "w14-lead", "A <strong>made-up</strong> classmate’s draft. Watch what the stopwatch covers, read their table and claim, then answer the three review questions from the task."));
    var variant = "draft";
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("harness", [["draft", "as submitted"], ["fixed", "after your review"]], variant, function (v) { variant = v; ct.load(); }));
    host.appendChild(opts);
    var DATA = { draft: t3Draft(), fixed: t3Fixed() };
    var ct = U.CodeTrace(host, {
      code: function () { return variant === "draft" ? T3_DRAFT : T3_FIXED; },
      varsTitle: "stopwatch & work", outTitle: "printed",
      build: function () { return variant === "draft" ? draftFrames() : fixedFrames(); },
      fps: function () { return variant === "draft" ? 1.6 : 3.2; },
      onFrame: paint
    });
    var ex = ct.extra;
    ex.appendChild(h("div", "w14-h", "their report (excerpt)"));
    var box = h("div", "w14-draft");
    ex.appendChild(box);
    var tb = tableIn(box, ["n", "time (s)", "ratio"]);
    var claim = h("p", "", "");
    box.appendChild(claim);
    simNote(ex, SIM + " Model: 30 ns per list comparison, 60 ns per item, 0.65 µs per randint.");

    function ms(t) { return (t * 1000).toFixed(1) + " ms"; }
    function paint(fr) {
      var d = DATA[variant], k = fr.printed;
      tb.rows(d.slice(0, k).map(function (x, j) {
        var t = Number(r4(x.t));
        return [fmt(x.n), r4(x.t), j ? "×" + (t / Number(r4(d[j - 1].t))).toFixed(1) : "—"];
      }), k - 1);
      if (variant === "draft") {
        claim.innerHTML = k < 4 ? "<span class='muted'>(the table fills in as the script prints)</span>"
          : "“Each doubling roughly doubles the time. <code>dedupe_slow</code> searches a list inside a loop, so it is <strong>O(n²)</strong>.” <em>Limitations: none — the results were very consistent.</em>";
      } else {
        claim.innerHTML = k < 4 ? "<span class='muted'>(the table fills in as the script prints)</span>"
          : "Revised: “On all-distinct IDs (the worst case), the best-of-5 time grows about ×4 per doubling, which matches O(n²). " +
            "Limitations: one shared Colab machine; with few distinct IDs the scan is capped and the curve looks linear.”";
      }
    }
    function draftFrames() {
      var f = [], out = [], d = DATA.draft;
      function push(line, note, v, x) {
        var fr = { line: line, note: note, vars: v || {}, out: out.slice(), printed: out.length };
        for (var k in x) fr[k] = x[k];
        f.push(fr);
      }
      push(10, "Before judging the numbers, watch <em>what the stopwatch is running around</em>. Press <strong>play</strong>.", {});
      d.forEach(function (x) {
        push(10, "n = " + fmt(x.n) + ".", { n: x.n, stopwatch: raw("stopped") });
        push(11, "Stopwatch <strong>started</strong>.", { n: x.n, stopwatch: raw("running"), "timed so far": raw("0.0 ms") }, { hl: [11, 12, 13, 14] });
        push(12, "Building " + fmt(x.n) + " random IDs <em>while the clock runs</em>: " + ms(x.build) + " of data-making is counted as if it were dedupe time. " +
          "<span class='muted'>Note the range: 1 to 100.</span>",
          { n: x.n, stopwatch: raw("running"), "timed: making data": raw(ms(x.build)), "timed so far": raw(ms(x.build)) }, { hl: [11, 12, 13, 14] });
        push(13, "<code>dedupe_slow</code>: " + fmt(x.comps) + " comparisons — but <code>out</code> never holds more than <strong>" + x.distinct + "</strong> IDs, so every scan is short.",
          { n: x.n, stopwatch: raw("running"), "timed: making data": raw(ms(x.build)), "timed: dedupe_slow": raw(ms(x.work)), "len(out)": x.distinct, "timed so far": raw(ms(x.t)) }, { hl: [11, 12, 13, 14] });
        push(14, "Stopwatch read <em>once</em> — one run, no repeats.",
          { n: x.n, stopwatch: raw("stopped"), t: Number(x.t.toFixed(6)), "len(out)": x.distinct });
        out.push(x.n + " " + r4(x.t));
        push(15, "Printed. " + (out.length < 4 ? "Next size." : "All four sizes are in — read their report below, then answer the questions."),
          { n: x.n, stopwatch: raw("stopped"), t: Number(x.t.toFixed(6)) });
      });
      return f;
    }
    function fixedFrames() {
      var f = [], out = [], d = DATA.fixed;
      function push(line, note, v, x) {
        var fr = { line: line, note: note, vars: v || {}, out: out.slice(), printed: out.length };
        for (var k in x) fr[k] = x[k];
        f.push(fr);
      }
      push(10, "The same function, with the harness repaired after review. Press <strong>play</strong>.", {});
      d.forEach(function (x) {
        push(10, "n = " + fmt(x.n) + ".", { n: x.n, stopwatch: raw("stopped") });
        push(11, "IDs are built <em>before</em> any timing, and all " + fmt(x.n) + " are different, so <code>out</code> grows to n — the worst case.",
          { n: x.n, stopwatch: raw("stopped"), "len(ids)": x.n });
        push(12, "<code>best</code> starts at infinity.", { n: x.n, stopwatch: raw("stopped"), best: raw("inf") });
        var best = Infinity;
        x.runs.forEach(function (t, k) {
          push(15, "Repeat " + (k + 1) + " of 5: only <code>dedupe_slow</code> is inside the timer — " + fmt(x.comps) + " comparisons, " + ms(t) + ".",
            { n: x.n, repeat: k + 1, stopwatch: raw("running"), "this run": raw(ms(t)), best: best === Infinity ? raw("inf") : raw(ms(best)) }, { hl: [14, 15, 16] });
          best = Math.min(best, t);
          push(16, "Keep the smallest time so far: " + ms(best) + ".", { n: x.n, repeat: k + 1, stopwatch: raw("stopped"), "this run": raw(ms(t)), best: raw(ms(best)) });
        });
        out.push(x.n + " " + r4(x.t));
        push(17, "Printed the best of 5. " + (out.length < 4 ? "Next size." : "Now the ratio column really does show ×4 — and the claim matches it."),
          { n: x.n, stopwatch: raw("stopped"), best: raw(ms(best)) });
      });
      return f;
    }
    ct.load();

    /* ----- the review questions ----- */
    var panel = h("div", "w14-panel");
    host.appendChild(panel);
    panel.appendChild(h("div", "w14-h", "your review of the draft (“as submitted”)"));
    var d0 = DATA.draft, dr = [1, 2, 3].map(function (j) { return Number(r4(d0[j].t)) / Number(r4(d0[j - 1].t)); });
    var avg = (dr[0] + dr[1] + dr[2]) / 3;
    var ITEMS = [
      { q: "Q1a · Is the data built <strong>outside</strong> the timer?", a: false,
        yes: "Look again at lines 11–12: the stopwatch starts on line 11, <em>before</em> the IDs are made.",
        no: "Right — line 12 runs while the clock is running, so random-number generation is timed as if it were dedupe." },
      { q: "Q1b · Are there <strong>repeats</strong> (several runs, best or mean reported)?", a: false,
        yes: "Each size goes through the stopwatch exactly once (lines 11–14) — there is no repeat loop.",
        no: "Right — one run per size, so a single hiccup on a shared machine changes a row." },
      { q: "Q1c · Was the <strong>worst case</strong> chosen?", a: false,
        yes: "<code>randint(1, 100)</code> gives at most 100 different IDs. Watch <code>len(out)</code> in the trace — it never passes 100.",
        no: "Right — with at most 100 distinct IDs, <code>out</code> stops growing and each <code>not in out</code> scan is capped. The worst case is all-distinct IDs." },
      { q: "Q2 · Does the claimed class, O(n²), <strong>match the ratio column</strong> (about ×" + avg.toFixed(1) + ")?", a: false,
        yes: "O(n²) predicts about ×4 per doubling. Their column shows about ×" + avg.toFixed(1) + ".",
        no: "Right — ratios near ×2 are the fingerprint of O(n), not O(n²). The code <em>can</em> be quadratic, but this benchmark never showed it, because of the capped input in Q1c." }
    ];
    var answers = {};
    ITEMS.forEach(function (it, j) {
      var row = h("div", "w14-yn w14-q");
      row.appendChild(h("span", "qq", it.q));
      var fb = h("p", "w14-fb");
      fb.setAttribute("aria-live", "polite");
      var bY = btn("yes", "", function () { mark(true); }), bN = btn("no", "", function () { mark(false); });
      function mark(v) {
        var ok = v === it.a;
        fb.innerHTML = ok ? it.no : it.yes;
        (v ? bY : bN).className = ok ? "right" : "wrong";
        if (ok) { bY.disabled = bN.disabled = true; answers[j] = true; summary(); }
      }
      row.appendChild(bY); row.appendChild(bN); row.appendChild(fb);
      panel.appendChild(row);
    });
    choice(panel, "Q3 · Which limitation did they <strong>not</strong> mention (and should)?", [
      { t: "Python is slower than C.", why: "True, but it is not a limitation of <em>this</em> measurement — a constant factor does not change the class." },
      { t: "The IDs have at most 100 distinct values, so the result says nothing about all-distinct data.", ok: true,
        why: "Right — that is the caveat that changes the conclusion. (One run on a shared machine would be a good second one.)" },
      { t: "They should have used a set.", why: "That is a suggestion for a better approach B, not a limitation of the measurement." }
    ], "long", function () { answers.q3 = true; summary(); });
    var sum = h("div", "w14-sum w14-hide");
    panel.appendChild(sum);
    function summary() {
      if (Object.keys(answers).length < 5) return;
      sum.innerHTML = "<div class='w14-h'>your half page, in outline</div>" +
        "<p><strong>Honest benchmark?</strong> Not yet: the timer also covers building the data (line 12), each size is timed once, and <code>randint(1, 100)</code> is a friendly case rather than the worst case.</p>" +
        "<p><strong>Class vs ratios?</strong> The ratio column (about ×" + avg.toFixed(1) + ") says linear, the text says O(n²). The capped input explains the mismatch.</p>" +
        "<p><strong>Missing limitation?</strong> At most 100 distinct IDs — the results say nothing about all-distinct data.</p>" +
        "<p><strong>Suggestion:</strong> all-distinct IDs built outside the timer, best of 5 — switch the harness to <em>after your review</em> and play it.</p>";
      sum.classList.remove("w14-hide");
    }
  }
  AAAnim.register("w14-review", review);

  /* ============================================================
     Task 4 — the traps gallery
     ============================================================ */
  function lg(n) { return Math.ceil(Math.log(n) / Math.LN2 - 1e-9); }
  var TRAPS = {
    search: {
      name: "search inside a loop", unit: "comparisons / hash steps",
      slow: ["def common_slow(a, b):", "    out = []", "    for x in a:", "        if x in b:              # b is a list: a full scan", "            out.append(x)", "    return out"],
      fast: ["def common_fast(a, b):", "    b = set(b)                  # once, before the loop", "    out = []", "    for x in a:", "        if x in b:              # O(1) on average", "            out.append(x)", "    return out"],
      hs: [4], hf: [2, 5], answer: "4",
      setup: "Worst case: <code>a</code> and <code>b</code> both hold n values and share none, so every scan runs to the end.",
      rowS: function (i, n) { return { c: rep("cmp", n), w: n }; },
      prepF: function (n) { return { c: rep("prep", n), w: n, l: "set(b)" }; },
      rowF: function () { return { c: ["hit"], w: 1 }; },
      work: function (n) { return [n * n, 2 * n]; },
      why: "Each of n rounds scans all n items of <code>b</code>: n × n. The set is built once (n) and then each round costs one lookup (n)."
    },
    concat: {
      name: "building by concatenation", unit: "characters copied (5-letter words)",
      slow: ["def spaced_slow(words):", '    text = ""', "    for word in words:", '        text += word + " "      # may copy all text so far', "    return text"],
      fast: ["def spaced_fast(words):", "    parts = []", "    for word in words:", "        parts.append(word)      # O(1) each", '    return " ".join(parts) + (" " if parts else "")'],
      hs: [4], hf: [4, 5], answer: "4", answerIn: "2",
      setup: "n words of 5 letters; both functions return exactly the same text, trailing space included.",
      rowS: function (i, n, inplace) { return inplace ? { c: ["cpy"], w: 12 } : { c: rep("cpy", i), w: 6 + 6 * i }; },
      rowF: function () { return { c: ["hit"], w: 1 }; },
      postF: function (n) { return { c: rep("prep", n), w: (6 * n - 1) + 6 * n, l: "join" }; },
      work: function (n, inplace) { return [inplace ? 12 * n : 6 * n + 3 * n * (n + 1), 13 * n - 1]; },
      why: "In the repeated-copy model round i copies the i pieces built so far: 6 + 12 + … + 6n characters, a triangular sum. <code>join</code> copies each character once."
    },
    front: {
      name: "working at the front of a list", unit: "element moves",
      slow: ["def build_queue_slow(jobs):", "    queue = []", "    for job in jobs:", "        queue.insert(0, job)    # shifts every item right", "    return queue"],
      fast: ["from collections import deque", "", "def build_queue_fast(jobs):", "    queue = deque()", "    for job in jobs:", "        queue.appendleft(job)   # O(1) each", "    return queue"],
      hs: [4], hf: [4, 6], answer: "4",
      setup: "n jobs, each added at the front.",
      rowS: function (i) { return { c: rep("cpy", i - 1).concat(["hit"]), w: i }; },
      rowF: function () { return { c: ["hit"], w: 1 }; },
      work: function (n) { return [n * (n + 1) / 2, n]; },
      why: "Inserting at the front slides the i − 1 items already there: 1 + 2 + … + n moves. A deque just links the new item in."
    },
    sort: {
      name: "sorting inside a loop", unit: "comparisons (sort ≈ n·⌈log₂ n⌉)",
      slow: ["from bisect import bisect_left", "", "def ranks_slow(data, queries):", "    out = []", "    for q in queries:", "        s = sorted(data)          # sorted again every round", "        out.append(bisect_left(s, q))", "    return out"],
      fast: ["from bisect import bisect_left", "", "def ranks_fast(data, queries):", "    s = sorted(data)              # sort once, outside", "    out = []", "    for q in queries:", "        out.append(bisect_left(s, q))", "    return out"],
      hs: [6], hf: [4, 7], answer: "4+",
      setup: "n data values and n queries. A sort costs about n·⌈log₂ n⌉ comparisons, a bisect about ⌈log₂(n+1)⌉.",
      rowS: function (i, n) { return { c: rep("cmp", n).concat(["hit"]), w: n * lg(n) + lg(n + 1) }; },
      prepF: function (n) { return { c: rep("prep", n), w: n * lg(n), l: "sorted" }; },
      rowF: function (i, n) { return { c: ["hit"], w: lg(n + 1) }; },
      work: function (n) { return [n * (n * lg(n) + lg(n + 1)), n * lg(n) + n * lg(n + 1)]; },
      why: "n sorts of n items is n × n log n = O(n² log n). The log factor also grows when n doubles, so the ratio is a bit <em>more</em> than ×4 (and the fix a bit more than ×2)."
    },
    sum: {
      name: "recomputing a total every round", unit: "additions",
      slow: ["def running_mean_slow(data):", "    out, seen = [], []", "    for x in data:", "        seen.append(x)", "        out.append(sum(seen) / len(seen))   # re-adds everything", "    return out"],
      fast: ["def running_mean_fast(data):", "    out, total = [], 0", "    for i, x in enumerate(data, start=1):", "        total += x                           # keep a running total", "        out.append(total / i)", "    return out"],
      hs: [5], hf: [4], answer: "4",
      setup: "n values; after each one, report the mean so far.",
      rowS: function (i) { return { c: rep("cmp", i), w: i }; },
      rowF: function () { return { c: ["hit"], w: 1 }; },
      work: function (n) { return [n * (n + 1) / 2, n]; },
      why: "Round i re-adds i values: 1 + 2 + … + n = n(n+1)/2. A running total adds one value per round."
    }
  };
  function rep(x, k) { var a = []; for (var i = 0; i < k; i++) a.push(x); return a; }

  function traps(host) {
    U.title(host, "Animation · the traps gallery — count the work before predicting");
    var key = "search", inplace = false, pred = null, MAPN = 8;
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("pattern", [["search", "search in loop"], ["concat", "concatenation"], ["front", "front of list"], ["sort", "sort in loop"], ["sum", "total every round"]], key,
      function (v) { key = v; setup(); }));
    host.appendChild(opts);
    var setupP = h("p", "w14-lead", "");
    host.appendChild(setupP);
    var pair = h("div", "w14-pair");
    host.appendChild(pair);
    var strOpt = h("div", "anim-opts");
    strOpt.style.marginTop = ".7rem";
    strOpt.appendChild(seg("string model", [["copy", "repeated-copy model"], ["inplace", "in-place resize (CPython sometimes)"]], "copy",
      function (v) { inplace = v === "inplace"; player.load(); }));
    host.appendChild(strOpt);
    var predRow = h("div", "anim-opts");
    predRow.style.marginTop = ".7rem";
    var predSeg = null;
    host.appendChild(predRow);

    var maps = h("div", "w14-maps");
    host.appendChild(maps);
    function mapBox(label) {
      var b = h("div", "w14-map"), hd = h("div", "w14-h", label), body = h("div", "");
      b.appendChild(hd); b.appendChild(body); maps.appendChild(b);
      return { hd: hd, body: body, label: label };
    }
    var mS = mapBox("offender"), mF = mapBox("fix");
    var legend = h("div", "w14-legend",
      "<span><i style='background:var(--red)'></i>scan / compare</span><span><i style='background:var(--accent)'></i>copy / shift</span>" +
      "<span><i style='background:var(--blue)'></i>prepare once</span><span><i style='background:var(--green)'></i>O(1) step</span>" +
      "<span>one row = one round, n = " + MAPN + "</span>");
    host.appendChild(legend);
    var m = U.msg(host);
    var player = U.Player(host, { build: build, render: render, fps: function () { return 2.4; } });
    var res = h("div", "w14-hide");
    host.appendChild(res);
    var tb = tableIn(res, ["n", "offender", "×", "fix", "×"]);
    var chart = U.LineChart(res, { logx: true, logy: true, xlabel: "n", ylabel: "work", height: 260, label: "log-log plot of counted work for offender and fix" });
    res.appendChild(h("p", "note-sim", "Counted operations from the model in the heading — not timings. Measure the real code: interpreter optimisations can change what you see."));

    function rowsFor(tp, side, n) {
      var rows = [];
      if (side === "S") { for (var i = 1; i <= n; i++) rows.push(tp.rowS(i, n, inplace)); return rows; }
      if (tp.prepF) rows.push(tp.prepF(n));
      for (var j = 1; j <= n; j++) rows.push(tp.rowF(j, n));
      if (tp.postF) rows.push(tp.postF(n));
      return rows;
    }
    function setup() {
      var tp = TRAPS[key];
      pred = null;
      setupP.innerHTML = "<strong>" + tp.name + "</strong> — " + tp.setup + " <span class='muted'>Work unit: " + tp.unit + ".</span>";
      pair.innerHTML = "";
      [["offender", tp.slow, tp.hs], ["fix", tp.fast, tp.hf]].forEach(function (s) {
        var w = h("div", ""); w.appendChild(h("div", "w14-h", s[0]));
        var cb = codeBox(s[1].join("\n"), 1);
        s[2].forEach(function (k) { cb.rows[k - 1].classList.add(s[0] === "fix" ? "hl" : "on"); });
        w.appendChild(cb.el); pair.appendChild(w);
      });
      strOpt.style.display = key === "concat" ? "" : "none";
      predRow.innerHTML = "";
      predSeg = seg("predict: offender work when n doubles", [["2", "×2"], ["4", "×4"], ["4+", "a bit more than ×4"], ["8", "×8"]], null, function (v) { pred = v; });
      predRow.appendChild(predSeg);
      res.classList.add("w14-hide");
      player.load();
    }
    function build() {
      var tp = TRAPS[key], S = rowsFor(tp, "S", MAPN), F = rowsFor(tp, "F", MAPN), T = Math.max(S.length, F.length), f = [];
      for (var t = 0; t <= T; t++) f.push({ t: t, S: S, F: F });
      return f;
    }
    function paintMap(mb, rows, t, title) {
      var shown = rows.slice(0, t), w = 0;
      shown.forEach(function (r) { w += r.w; });
      mb.hd.innerHTML = title + " · work <b>" + fmt(w) + "</b>";
      mb.body.innerHTML = "";
      shown.forEach(function (r, j) {
        var row = h("div", "w14-mrow" + (j === t - 1 && t < rows.length ? " now" : ""));
        r.c.forEach(function (c) { row.appendChild(h("span", "w14-sq " + c)); });
        if (r.l) row.appendChild(h("span", "w14-rl", r.l));
        mb.body.appendChild(row);
      });
      return w;
    }
    function render(fr, i, frames) {
      var tp = TRAPS[key], last = i === frames.length - 1;
      var ws = paintMap(mS, fr.S, fr.t, "offender"), wf = paintMap(mF, fr.F, fr.t, "fix");
      if (fr.t === 0) {
        m.innerHTML = "Count before you predict: how much work does each round of the offender do? Pick a ratio above, then press <strong>play</strong>.";
        res.classList.add("w14-hide");
        return;
      }
      if (!last) {
        m.innerHTML = "Round " + Math.min(fr.t, fr.S.length) + ": offender " + fmt(ws) + " vs fix " + fmt(wf) + " so far. " +
          (tp.rowS(2, MAPN, inplace).w > tp.rowS(1, MAPN, inplace).w ? "Each offender row is longer than the last." : key === "concat" && inplace ? "With in-place resizing each row stays short." : "Every offender row repeats the full job.");
        res.classList.add("w14-hide");
        return;
      }
      var sizes = [1000, 2000, 4000, 8000], R = sizes.map(function (n) { var w = tp.work(n, inplace); return { n: n, s: w[0], f: w[1] }; });
      tb.rows(R.map(function (r, j) {
        return [fmt(r.n), fmt(r.s), j ? ratio(r.s, R[j - 1].s) : "", fmt(r.f), j ? ratio(r.f, R[j - 1].f) : ""];
      }));
      res.classList.remove("w14-hide");
      chart.draw([
        { name: "offender", color: "--red", points: R.map(function (r) { return [r.n, r.s]; }) },
        { name: "fix", color: "--green", points: R.map(function (r) { return [r.n, r.f]; }) }
      ]);
      var ans = key === "concat" && inplace ? tp.answerIn : tp.answer;
      var lab = { "2": "×2", "4": "×4", "4+": "a bit more than ×4", "8": "×8" };
      var v = pred == null ? " <span class='muted'>(Next time, pick a prediction before playing.)</span>"
        : pred === ans ? " Your prediction (" + lab[pred] + ") matches the counts."
        : " You predicted " + lab[pred] + "; the counts say " + lab[ans] + ".";
      m.innerHTML = tp.why + " At n = 8 000 the offender does <strong>" + fmt(Math.round(R[3].s / R[3].f)) + "×</strong> the fix’s work." + v +
        (key === "concat" && !inplace ? " <span class='muted'>Now switch the string model: if the interpreter resizes in place, the curve can look linear — measure and report what you see.</span>" : "");
    }
    setup();
  }
  AAAnim.register("w14-traps", traps);

  /* ============================================================
     Task 5 — profile before you cut
     ============================================================ */
  var T5_RUN = [
    "import cProfile",
    "",
    "orders, watch = make_data(40000, 4000)",
    'cProfile.run("summarise_slow(orders, watch)", sort="cumtime")'].join("\n");
  var T5_FN = [
    "def summarise_slow(orders, watch):",
    "    totals = {}",
    "    for o in orders:                          # n orders ...",
    '        if o["customer"] in watch:            # ... scan of the watch list → O(m) each',
    '            name = o["customer"]',
    '            totals[name] = totals.get(name, 0) + o["amount"]',
    "    return totals"].join("\n");
  var T5_FOCUS = [
    'customers = [o["customer"] for o in orders]   # identical input for both',
    "watch_set = set(watch)                         # built outside the timer",
    "",
    "start = time.perf_counter()",
    "hits_list = sum(1 for c in customers if c in watch)",
    "t_list = time.perf_counter() - start",
    "",
    "start = time.perf_counter()",
    "hits_set = sum(1 for c in customers if c in watch_set)",
    "t_set = time.perf_counter() - start",
    "",
    "assert hits_list == hits_set                   # same answer"].join("\n");
  var PAGE_SLOW = { 5000: 0.0631, 10000: 0.2498, 20000: 0.9987, 40000: 3.9901 };   /* §14.4 printed output */
  function t5Count(n) {
    var d = makeData(n, 5000 + n), comps = 0, hits = 0;
    for (var i = 0; i < n; i++) { var p = d.pos[d.cust[i]]; if (p >= 0) { comps += p + 1; hits++; } else comps += d.m; }
    return { n: n, m: d.m, comps: comps, hits: hits };
  }
  function f8(x) { var s = x.toFixed(3); while (s.length < 8) s = " " + s; return s; }
  function rj(s, w) { s = String(s); while (s.length < w) s = " " + s; return s; }

  function profile(host) {
    U.title(host, "Animation · profile first, then test the suspect");
    host.appendChild(h("p", "w14-lead", "Step 1 — run <code>summarise_slow</code> from §14.4 under <code>cProfile</code> at n = 40 000."));
    host.appendChild(codeBox(T5_RUN, 1).el);
    var guess = null;
    var go = h("div", "anim-opts"); go.style.marginTop = ".7rem";
    go.appendChild(seg("predict: which row will dominate cumtime?", [["fn", "summarise_slow"], ["get", "dict.get (called thousands of times)"]], null, function (v) { guess = v; }));
    host.appendChild(go);
    var bar = h("div", "w14-bar"), fill = h("span", "");
    bar.appendChild(fill); host.appendChild(bar);
    var prof = h("pre", "w14-prof", "");
    prof.setAttribute("aria-label", "cProfile output");
    host.appendChild(prof);
    var stats = h("div", "anim-stats");
    var sOrd = U.stat("orders processed"), sCmp = U.stat("list comparisons");
    stats.appendChild(sOrd.el); stats.appendChild(sCmp.el);
    host.appendChild(stats);
    var m = U.msg(host);

    var P = t5Count(40000);
    var r = U.rng(5140);
    var tGet = P.hits * 0.3e-6, tFn = (P.comps * 27.7e-9 + P.n * 30e-9 + P.hits * 0.25e-6) * (1 + 0.02 * r());
    var total = tFn + tGet, calls = P.hits + 4;
    var ROWS = [
      [1, 0, total, "{built-in method builtins.exec}"],
      [1, 0, total, "<string>:1(<module>)"],
      [1, tFn, total, "case_study.py:10(summarise_slow)"],
      [P.hits, tGet, tGet, "{method 'get' of 'dict' objects}"],
      [1, 0, 0, "{method 'disable' of '_lsprof.Profiler' objects}"]
    ];
    function line(rw) {
      return rj(rw[0], 9) + " " + f8(rw[1]) + " " + f8(rw[1] / rw[0]) + " " + f8(rw[2]) + " " + f8(rw[2] / rw[0]) + " " + rw[3];
    }
    var STEPS = 12;
    function build() {
      var f = [{ k: 0 }];
      for (var s = 1; s <= STEPS; s++) f.push({ k: s });
      for (var j = 1; j <= ROWS.length + 1; j++) f.push({ k: STEPS, rows: j });
      return f;
    }
    function render(fr, i, frames) {
      var p = fr.k / STEPS;
      fill.style.width = (p * 100) + "%";
      sOrd.set(fmt(Math.round(P.n * p)) + " / " + fmt(P.n));
      sCmp.set(fmt(Math.round(P.comps * p)));
      if (!fr.rows) {
        prof.innerHTML = fr.k ? "<span class='dim'>profiling… " + (total * p).toFixed(1) + " s (simulated)</span>" : "<span class='dim'>(output appears here)</span>";
        m.innerHTML = fr.k ? "The profiler watches every <em>function call</em>. Meanwhile the loop is doing millions of list comparisons — watch the counter." :
          "Predict which row will dominate, then press <strong>play</strong>.";
        panel2.classList.add("w14-hide");
        return;
      }
      var head = "         " + calls + " function calls in " + total.toFixed(3) + " seconds\n\n   Ordered by: cumulative time\n\n" +
        "   ncalls  tottime  percall  cumtime  percall filename:lineno(function)\n";
      prof.innerHTML = U.esc(head) + ROWS.slice(0, fr.rows - 1).map(function (rw, j) {
        return j === 2 ? "<span class='top'>" + U.esc(line(rw)) + "</span>" : U.esc(line(rw));
      }).join("\n");
      if (i < frames.length - 1) { m.innerHTML = "Printing, slowest cumulative time first…"; panel2.classList.add("w14-hide"); return; }
      var v = guess == null ? "" : guess === "fn" ? " Your prediction was right." : " You guessed dict.get — it has the most calls, but look at its time.";
      m.innerHTML = "<code>summarise_slow</code> dominates: <strong>" + tFn.toFixed(3) + " s</strong> of its own time (tottime). <code>dict.get</code> ran " + fmt(P.hits) +
        " times yet took only " + tGet.toFixed(3) + " s." + v + " But notice: there is <strong>no row for <code>in watch</code></strong> — a list membership test is not a function call, so its time is folded into <code>summarise_slow</code>.";
      panel2.classList.remove("w14-hide");
    }
    var player = U.Player(host, { build: build, render: render, fps: function (i) { return i < STEPS ? 3.5 : 2.5; } });
    simNote(host, "Simulated profile: a step-count model calibrated to the §14.4 printed timings (about 28 ns per list comparison) — run it yourself for real numbers.");

    /* ----- step 2: hypothesis ----- */
    var panel2 = h("div", "w14-panel w14-hide");
    host.appendChild(panel2);
    panel2.appendChild(h("p", "w14-lead", "Step 2 — the profile names a <em>function</em>. Click the <strong>line</strong> inside it that you suspect (your source-line hypothesis)."));
    var fb = codeBox(T5_FN, 10, "w14-pick");
    panel2.appendChild(fb.el);
    var hm = U.msg(panel2);
    hm.innerHTML = "No hypothesis yet.";
    var HYP = {
      10: "The header runs once per call. It cannot cost 4 seconds.",
      11: "One empty dictionary, once. Not it.",
      12: "The loop runs n = 40 000 times — that alone is fast. What does each round cost?",
      13: "A strong suspect: <code>in watch</code> scans a " + fmt(P.m) + "-name list for each of 40 000 orders. But the profile has no row for it — so test it directly.",
      14: "A plain assignment, only for VIP orders. Cheap.",
      15: "This line holds the only profiled call inside the loop, <code>dict.get</code> — and the profile shows its " + fmt(P.hits) + " calls cost " + tGet.toFixed(3) + " s. Not the bottleneck.",
      16: "Returning the dictionary is constant work."
    };
    var hyp = null;
    fb.rows.forEach(function (rw, j) {
      var no = 10 + j;
      function pick() {
        hyp = no;
        fb.rows.forEach(function (x) { x.className = "ct-line"; });
        rw.className = "ct-line " + (no === 13 ? "w14-pickd" : "w14-fine");
        hm.innerHTML = "Hypothesis: line " + no + ". " + HYP[no];
        if (no === 13) panel3.classList.remove("w14-hide");
      }
      rw.setAttribute("role", "button"); rw.tabIndex = 0; rw.setAttribute("aria-label", "Line " + no);
      rw.addEventListener("click", pick);
      rw.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });

    /* ----- step 3: focused benchmark ----- */
    var panel3 = h("div", "w14-panel w14-hide");
    host.appendChild(panel3);
    panel3.appendChild(h("p", "w14-lead", "Step 3 — a focused benchmark: the <em>same</em> customers, list membership versus set membership, nothing else timed."));
    panel3.appendChild(codeBox(T5_FOCUS, 1).el);
    var c3 = h("div", "anim-controls");
    var bRun = btn("&#9654; run the focused benchmark", "primary", run3);
    c3.appendChild(bRun);
    panel3.appendChild(c3);
    var tb = tableIn(panel3, ["n", "list in (s)", "×", "set in (s)", "×", "§14.4 slow (s)"]);
    tb.rows([]);
    var chBox = h("div", "w14-hide");
    panel3.appendChild(chBox);
    var chart = U.LineChart(chBox, { logx: true, logy: true, xlabel: "n orders", ylabel: "seconds", height: 270, label: "log-log plot: list membership, set membership and the page's summarise_slow timings" });
    var m3 = U.msg(panel3);
    simNote(panel3, "“list in” and “set in” are simulated from exact comparison counts on make_data-style inputs (28 ns per list comparison, 45 ns per set test). The last column is the §14.4 printed output, copied from the page.");
    var panel4 = h("div", "w14-panel w14-hide");
    host.appendChild(panel4);
    var timer = 0;
    function run3() {
      clearTimeout(timer); bRun.disabled = true;
      var sizes = [5000, 10000, 20000, 40000], R = [], i = 0, rr = U.rng(5300);
      (function next() {
        var c = t5Count(sizes[i]);
        R.push({ n: c.n, list: (c.comps * 26e-9 + c.n * 40e-9) * (1 + 0.03 * rr()), set: c.n * 45e-9 * (1 + 0.05 * rr()) });
        tb.rows(R.map(function (x, j) {
          return [fmt(x.n), secs(x.list), j ? ratio(x.list, R[j - 1].list) : "", secs(x.set), j ? ratio(x.set, R[j - 1].set) : "", PAGE_SLOW[x.n].toFixed(4)];
        }), R.length - 1);
        chBox.classList.remove("w14-hide");
        chart.draw([
          { name: "summarise_slow (page)", color: "--muted", dashed: true, points: R.map(function (x) { return [x.n, PAGE_SLOW[x.n]]; }) },
          { name: "list membership only", color: "--red", points: R.map(function (x) { return [x.n, x.list]; }) },
          { name: "set membership only", color: "--green", points: R.map(function (x) { return [x.n, x.set]; }) }
        ], { xr: [5000, 40000], yr: [1e-4, 5] });
        i++;
        if (i < sizes.length) { timer = setTimeout(next, U.REDUCED ? 0 : 650); m3.innerHTML = "Timing size " + fmt(sizes[i - 1]) + "…"; return; }
        bRun.disabled = false;
        var share = Math.round(R[3].list / PAGE_SLOW[40000] * 100);
        m3.innerHTML = "List membership alone grows about <strong>×4</strong> per doubling and, at 40 000, accounts for roughly <strong>" + share +
          "%</strong> of the whole <code>summarise_slow</code> time. Set membership on the same customers grows ×2. The evidence supports the line-13 hypothesis — now write it up.";
        quiz();
      })();
    }

    /* ----- step 4: the two sentences ----- */
    var s1 = false, s2 = false, done4 = false;
    function quiz() {
      if (done4) return;
      done4 = true;
      panel4.classList.remove("w14-hide");
      panel4.appendChild(h("p", "w14-lead", "Step 4 — build the two sentences the task asks for."));
      choice(panel4, "Sentence 1 · what the <strong>profile</strong> says:", [
        { t: "The profile shows that line 13, <code>in watch</code>, takes about 4 seconds.", why: "Look at the output again: there is no row for a line, and none for <code>in</code>. cProfile reports functions only." },
        { t: "cProfile shows <code>summarise_slow</code> dominating the cumulative time, but it reports whole functions, so it cannot say which line inside is slow.", ok: true,
          why: "Right — a function-level fact, stated with its limit." },
        { t: "The profile shows <code>dict.get</code> is the bottleneck, because it has the most calls.", why: "Most calls is not most time: " + fmt(P.hits) + " calls cost only " + tGet.toFixed(3) + " s." }
      ], "long", function () { s1 = true; both(); });
      choice(panel4, "Sentence 2 · what the <strong>hypothesis test</strong> adds:", [
        { t: "Since cProfile already named the function, no further test was needed.", why: "The function is 7 lines long. Naming it does not tell you which line to change." },
        { t: "The focused benchmark proves every line of <code>summarise_slow</code> is quadratic.", why: "It tested one operation — membership — not every line." },
        { t: "Our source-line hypothesis, the list membership test, is supported by a focused benchmark: on identical customers, list membership grows about ×4 per doubling while set membership grows about ×2.", ok: true,
          why: "Right — a hypothesis about a line, backed by a controlled comparison." }
      ], "long", function () { s2 = true; both(); });
      var out = h("div", "w14-sum w14-hide");
      panel4.appendChild(out);
      function both() {
        if (!(s1 && s2)) return;
        out.innerHTML = "<div class='w14-h'>your two sentences</div><p>cProfile shows <code>summarise_slow</code> dominating the cumulative time, but it reports whole functions, so it cannot say which line inside is slow. " +
          "Our source-line hypothesis, the list membership test on line 13, is supported by a focused benchmark: on identical customers, list membership grows about ×4 per doubling while set membership grows about ×2.</p>";
        out.classList.remove("w14-hide");
      }
    }
    player.load();
    void hyp;
  }
  AAAnim.register("w14-profile", profile);
})();
