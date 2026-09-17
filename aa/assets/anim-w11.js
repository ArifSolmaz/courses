/* ============================================================
   AA — Week 11 "Try it yourself" animations
   w11-plateau    Task 1 — list vs set membership on log–log axes
   w11-wordfreq   Task 2 — word frequency with a list vs a dictionary
   w11-common     Task 3 — common elements: nested loops vs set(a) & set(b)
   w11-wrongset   Task 4 — when converting to a set is a mistake
   w11-buckets    Task 5 — trace [16, 24, 5, 40, 9] into 8 buckets
   w11-dice       Task 6 — a million dice rolls: Counter vs set
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt, esc = U.esc;

  function fitChart(c) {           /* bigger text on phones: draw on a narrower canvas */
    if ((window.innerWidth || 1000) < 640) { c.el.width = 380; c.el.height = 300; }
    return c;
  }
  function choice(parent, label, options, onPick) {
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
          x.b.className = x.v === v ? "w11-pick " + (state || "") : "";
          x.b.setAttribute("aria-pressed", String(x.v === v));
        });
      }
    };
  }
  function secs(t) {
    if (t >= 60) return (t / 60).toFixed(1) + " min";
    if (t >= 1) return t.toFixed(1) + " s";
    if (t >= 1e-3) return +(t * 1e3).toPrecision(2) + " ms";
    return +(t * 1e6).toPrecision(2) + " µs";
  }
  function pySet(a) {               /* small non-negative ints print in ascending order */
    return a.length ? "{" + a.slice().sort(function (x, y) { return x - y; }).join(", ") + "}" : "set()";
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function chipsHTML(vals, cls) {
    return vals.map(function (v, j) { return '<span class="w11-chip ' + (cls ? cls(v, j) || "" : "") + '">' + esc(v) + "</span>"; }).join("");
  }

  /* ============================================================
     Task 1 — reproduce the plateau
     ============================================================ */
  function plateau(host) {
    var PAGE = [[10000, 52.31, 0.05], [100000, 521.90, 0.05], [1000000, 5208.44, 0.05]];
    var src = "page", axes = "log", mine = null;
    U.title(host, "Animation · plot §11.8 on log–log axes");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("numbers", [["page", "§11.8 output"], ["mine", "my own"]], src, function (v) { src = v; sync(); player.load(); }));
    opts.appendChild(U.seg("axes", [["log", "log–log"], ["lin", "linear"]], axes, function (v) { axes = v; sync(); player.load(); }));
    host.appendChild(opts);

    var mineBox = h("div", "w11-mine");
    mineBox.appendChild(h("span", "lab", "n"));
    mineBox.appendChild(h("span", "lab", "list µs"));
    mineBox.appendChild(h("span", "lab", "set µs"));
    var inputs = PAGE.map(function (r) {
      mineBox.appendChild(h("span", "w11-n", fmt(r[0])));
      var a = h("input"), b = h("input");
      [a, b].forEach(function (x, k) {
        x.type = "number"; x.min = "0"; x.step = "any"; x.placeholder = k ? "e.g. 0.06" : "e.g. 48.1";
        x.setAttribute("aria-label", (k ? "set" : "list") + " microseconds at n = " + r[0]);
        mineBox.appendChild(x);
      });
      return [a, b];
    });
    var bPlot = btn("plot my numbers", "", function () { readMine(); player.load(); });
    mineBox.appendChild(bPlot);
    host.appendChild(mineBox);

    var tw = h("div", "anim-table-wrap w11-tw");
    host.appendChild(tw);
    var tbl = U.table(tw, ["n", "list µs", "set µs", "ratio"]);
    var ctitle = h("p", "w11-ctitle", "Membership test for a missing value: list vs set");
    host.appendChild(ctitle);
    var cLog = fitChart(U.LineChart(host, { logx: true, logy: true, xlabel: "n (items)", ylabel: "µs per lookup", height: 300,
      label: "Log–log chart: time per membership test against n, list and set" }));
    var cLin = fitChart(U.LineChart(host, { xlabel: "n (items)", ylabel: "µs per lookup", height: 300,
      label: "Linear chart: time per membership test against n, list and set" }));
    var slope = h("p", "w11-slope", "");
    host.appendChild(slope);
    var check = h("div", "w11-check", "");
    host.appendChild(check);
    var srcNote = h("p", "note-sim", "");
    host.appendChild(srcNote);
    var m = U.msg(host);

    function readMine() {
      var rows = PAGE.map(function (r, j) {
        var a = parseFloat(inputs[j][0].value), b = parseFloat(inputs[j][1].value);
        return [r[0], a, b];
      });
      mine = rows.every(function (r) { return r[1] > 0 && r[2] > 0; }) ? rows : null;
    }
    function data() { return src === "page" ? PAGE : mine; }
    function sync() {
      mineBox.style.display = src === "mine" ? "" : "none";
      cLog.el.style.display = axes === "log" ? "" : "none";
      cLin.el.style.display = axes === "lin" ? "" : "none";
      srcNote.textContent = src === "page"
        ? "These are the illustrative numbers printed in §11.8, not a measurement made in your browser — run the code in Colab and plot your own."
        : "Your own measurements, typed in above. Nothing is timed in the browser.";
    }
    function build() {
      var f = [{ k: 0 }];
      if (data()) { for (var k = 1; k <= 3; k++) f.push({ k: k }); f.push({ k: 3, end: true }); }
      return f;
    }
    function sl(D, c) { return Math.log10(D[2][c] / D[0][c]) / Math.log10(D[2][0] / D[0][0]); }
    function render(fr) {
      var D = data();
      var ch = axes === "log" ? cLog : cLin;
      if (!D) {
        tbl.rows([]); ch.draw([]); slope.innerHTML = ""; check.innerHTML = "";
        m.innerHTML = "Type your six numbers (µs per lookup) from your own run of §11.8, then press <strong>plot my numbers</strong>.";
        return;
      }
      var k = fr.k;
      tbl.rows(D.slice(0, k).map(function (r) {
        return [fmt(r[0]), r[1].toFixed(2), r[2].toFixed(2), fmt(Math.round(r[1] / r[2])) + "x"];
      }), k - 1);
      ch.draw(k ? [
        { name: "list  (x in as_list)", color: "--red", points: D.slice(0, k).map(function (r) { return [r[0], r[1]]; }) },
        { name: "set  (x in as_set)", color: "--green", points: D.slice(0, k).map(function (r) { return [r[0], r[2]]; }) }
      ] : [], { xr: [10000, 1000000], yr: axes === "log" ? [0.02, 10000] : [0, 5500] });
      if (fr.end) {
        var sL = sl(D, 1), sS = sl(D, 2);
        slope.innerHTML = "Slope on log–log axes: list <strong>" + sL.toFixed(2) + "</strong> · set <strong>" + sS.toFixed(2) + "</strong>";
        check.innerHTML = ["title says what was measured", "x axis: n (items)", "y axis: µs per lookup (units!)", "legend names both lines", axes === "log" ? "log scale stated on both axes" : "linear axes stated"]
          .map(function (t) { return "<span>✓ " + t + "</span>"; }).join("");
      } else { slope.innerHTML = ""; check.innerHTML = ""; }

      if (k === 0) {
        m.innerHTML = "Before you plot: on log–log axes, what shape will the set line have? And the list line? Press <strong>play</strong> to add one row " + (src === "page" ? "of §11.8" : "of your numbers") + " at a time.";
      } else if (!fr.end) {
        var r = D[k - 1];
        m.innerHTML = "n = " + fmt(r[0]) + ": list " + r[1].toFixed(2) + " µs, set " + r[2].toFixed(2) + " µs." +
          (k > 1 ? " n grew ×10; the list time grew ×" + (r[1] / D[k - 2][1]).toFixed(1) + ", the set time ×" + (r[2] / D[k - 2][2]).toFixed(1) + "." : "");
      } else if (axes === "log") {
        m.innerHTML = "On log–log axes the list is a <strong>straight line of slope ≈ " + sl(D, 1).toFixed(1) + "</strong> (×10 items → ×10 time: O(n)) and the set is <strong>flat</strong> (slope ≈ " + Math.abs(sl(D, 2)).toFixed(1) + ": O(1) on average). Switch to linear axes to see why log–log is the right choice.";
      } else {
        m.innerHTML = "On linear axes the set line is squashed onto the floor — you cannot read its values at all, and the two small list points bunch up on the left. Log–log axes show both lines clearly.";
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1; } });
    sync(); player.load();
  }
  AAAnim.register("w11-plateau", plateau);

  /* ============================================================
     Task 2 — word frequency two ways
     ============================================================ */
  function wordFreq(host) {
    var TEXT = "the quick brown fox jumps over the lazy dog the end";
    var WORDS = TEXT.split(" ");
    var CODE_A = [
      'text = "the quick brown fox jumps over the lazy dog the end"',
      "",
      "seen = []                # words, in first-seen order",
      "counts = []              # counts[i] belongs to seen[i]",
      "for word in text.split():",
      "    if word in seen:             # scan the list",
      "        i = seen.index(word)     # scan again to find it",
      "        counts[i] += 1",
      "    else:",
      "        seen.append(word)",
      "        counts.append(1)",
      "",
      'print(counts[seen.index("the")])     # 3'
    ].join("\n");
    var CODE_B = [
      'text = "the quick brown fox jumps over the lazy dog the end"',
      "",
      "counts = {}",
      "for word in text.split():",
      "    counts[word] = counts.get(word, 0) + 1     # O(1) per word",
      "",
      'print(counts["the"])       # 3'
    ].join("\n");
    var ver = "a";
    U.title(host, "Animation · count the words with a list, then with a dictionary");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("version", [["a", "(a) list + in"], ["b", "(b) dictionary"]], ver, function (v) { ver = v; ct.load(); }));
    host.appendChild(opts);

    function buildA() {
      var f = [], seen = [], counts = [], cmp = 0, out = [], word = null, i = null;
      function push(line, note, v) {
        var vars = {};
        if (word !== null) vars.word = word;
        if (f.length > 1) vars.seen = seen.slice();
        if (f.length > 2) vars.counts = counts.slice();
        if (i !== null) vars.i = i;
        f.push({ line: line, note: note, vars: vars, out: out.slice(), counters: { "word comparisons": cmp },
          view: { seen: seen.slice(), counts: counts.slice(), scan: v && v.scan, hit: v && v.hit, add: v && v.add, wi: v ? v.wi : -1 } });
      }
      push(1, "Eleven words, nine of them different. Press <strong>play</strong> and watch the comparison counter.");
      push(3, "An empty list of words we have seen…");
      push(4, "…and a parallel list of their counts.");
      WORDS.forEach(function (w, wi) {
        word = w; i = null;
        push(5, "Next word: <strong>" + w + "</strong>.", { wi: wi });
        if (!seen.length) push(6, "<code>word in seen</code> on an empty list: nothing to compare — False.", { wi: wi });
        var pos = -1;
        for (var j = 0; j < seen.length; j++) {
          cmp++;
          var hit = seen[j] === w;
          push(6, "<code>in</code> scans: is <strong>" + w + "</strong> equal to seen[" + j + "] = " + seen[j] + "? " + (hit ? "<strong>Yes.</strong>" : "No."), { scan: j, hit: hit ? j : -1, wi: wi });
          if (hit) { pos = j; break; }
        }
        if (pos >= 0) {
          cmp += pos + 1; i = pos;
          push(7, "<code>seen.index(word)</code> starts again from the front: " + (pos + 1) + " more comparison" + (pos ? "s" : "") + " to learn that i = " + pos + ".", { scan: pos, hit: pos, wi: wi });
          counts[pos]++;
          push(8, "Add one to counts[" + pos + "]: " + w + " has now been seen " + counts[pos] + " times.", { hit: pos, wi: wi });
        } else {
          if (seen.length) push(6, "Scanned all " + seen.length + " words — " + w + " is new.", { wi: wi });
          seen.push(w);
          push(10, "Append it to seen…", { add: seen.length - 1, wi: wi });
          counts.push(1);
          push(11, "…and start its count at 1.", { add: seen.length - 1, wi: wi });
        }
      });
      word = null; i = null;
      cmp += 1;
      out.push(String(counts[seen.indexOf("the")]));
      push(13, "Finding “the” once more costs 1 comparison (it is first). Total: <strong>" + cmp + " comparisons</strong> for 11 words — and every new word had to be compared with <em>every</em> word seen so far.", { hit: 0 });
      return f;
    }
    function buildB() {
      var f = [], keys = [], vals = {}, lk = 0, out = [], word = null;
      function push(line, note, v) {
        var vars = {};
        if (word !== null) { vars.word = word; vars["counts[word]"] = vals[word] || 0; }
        if (f.length > 1) vars["len(counts)"] = keys.length;
        f.push({ line: line, note: note, vars: vars, out: out.slice(), counters: { "dictionary lookups": lk },
          view: { keys: keys.slice(), vals: JSON.parse(JSON.stringify(vals)), hit: v && v.hit, wi: v ? v.wi : -1, isNew: v && v.isNew } });
      }
      push(1, "The same eleven words. Press <strong>play</strong>.");
      push(3, "An empty dictionary.");
      WORDS.forEach(function (w, wi) {
        word = w;
        push(4, "Next word: <strong>" + w + "</strong>.", { wi: wi });
        var had = keys.indexOf(w) >= 0;
        lk += 2;
        if (!had) keys.push(w);
        vals[w] = (vals[w] || 0) + 1;
        push(5, "<code>get</code> hashes “" + w + "” and jumps straight to its slot (" + (had ? "found " + (vals[w] - 1) : "absent, so 0") +
          "); the assignment jumps there again to store " + vals[w] + ". <strong>Two lookups</strong>, however many words are stored.", { hit: w, wi: wi, isNew: !had });
      });
      word = null;
      lk += 1;
      out.push(String(vals.the));
      push(7, "<code>counts[\"the\"]</code> is one more lookup. Total: <strong>" + lk + " lookups</strong> for 11 words — exactly 2 per word, plus 1.", { hit: "the" });
      return f;
    }
    var ct = U.CodeTrace(host, {
      code: function () { return ver === "a" ? CODE_A : CODE_B; },
      build: function () { return ver === "a" ? buildA() : buildB(); },
      fps: function (i, fr) { return fr[i] && fr[i].line === 6 && fr[i + 1] && fr[i + 1].line === 6 ? 4 : 1.7; },
      onFrame: draw
    });
    var ex = ct.extra;
    var wordsRow = h("div", "w11-words");
    var store = h("div", "arr idx w11-store");
    ex.appendChild(h("div", "ct-h", "text.split()"));
    ex.appendChild(wordsRow);
    var storeH = h("div", "ct-h", "");
    ex.appendChild(storeH);
    ex.appendChild(store);
    function draw(fr) {
      var v = fr.view;
      wordsRow.innerHTML = chipsHTML(WORDS, function (w, j) { return j === v.wi ? "on" : j < v.wi ? "dim" : ""; });
      if (ver === "a") {
        storeH.textContent = "seen (with counts underneath)";
        store.innerHTML = v.seen.length ? v.seen.map(function (w, j) {
          var c = j === v.hit ? "good" : j === v.add ? "gold" : (v.scan != null && j <= v.scan) ? (j === v.scan ? "on" : "dim") : "";
          return '<div class="cell ' + c + '">' + w + "<small>" + v.counts[j] + "</small></div>";
        }).join("") : '<div class="cell dim">[]</div>';
      } else {
        storeH.textContent = "counts (a dictionary: one jump per lookup)";
        store.innerHTML = v.keys.length ? v.keys.map(function (w) {
          var c = w === v.hit ? (v.isNew ? "gold" : "good") : "";
          return '<div class="cell ' + c + '">' + w + "<small>" + v.vals[w] + "</small></div>";
        }).join("") : '<div class="cell dim">{}</div>';
      }
    }

    /* the experiment at two sizes */
    var exp = h("div", "w11-exp");
    host.appendChild(exp);
    exp.appendChild(h("p", "w11-ctitle", "Now scale it up: time both versions at two text sizes"));
    var kind = "rep";
    var eo = h("div", "anim-opts");
    eo.appendChild(U.seg("text", [["rep", "the paragraph × 5 000 and × 10 000"], ["grow", "same length, vocabulary keeps growing"]], kind, function (v) { kind = v; out.style.display = "none"; }));
    eo.appendChild(btn("run both sizes", "primary", runExp));
    exp.appendChild(eo);
    var out = h("div", "");
    out.style.display = "none";
    exp.appendChild(out);
    var tw = h("div", "anim-table-wrap w11-tw");
    out.appendChild(tw);
    var tbl = U.table(tw, ["text", "(a) list", "(b) dict", "ratio"]);
    var verdict = h("p", "w11-cap", "");
    out.appendChild(verdict);
    out.appendChild(h("p", "note-sim", "Comparison counts are exact for this code; times are a model (14 ns per comparison + 50 ns per word for (a), 120 ns per word for (b)). Run the real code for your own numbers."));

    function textWord(j) { return kind === "rep" ? WORDS[j % 11] : (j % 2 ? "w" + j : WORDS[(j >> 1) % 11]); }
    function measure(n) {
      var pos = Object.create(null), len = 0, cmp = 0;
      for (var j = 0; j < n; j++) {
        var w = textWord(j), p = pos[w];
        if (p === undefined) { cmp += len; pos[w] = len++; } else cmp += 2 * (p + 1);
      }
      cmp += pos.the + 1;
      return { n: n, u: len, cmp: cmp, lk: 2 * n + 1, ta: cmp * 14e-9 + n * 50e-9, tb: n * 120e-9 };
    }
    function runExp() {
      var R = [55000, 110000].map(measure);
      tbl.rows(R.map(function (r) {
        return [fmt(r.n) + " words<br><small>" + fmt(r.u) + " distinct</small>",
          fmt(r.cmp) + " comparisons<br><small>≈ " + secs(r.ta) + "</small>",
          fmt(r.lk) + " lookups<br><small>≈ " + secs(r.tb) + "</small>",
          (r.ta / r.tb < 10 ? (r.ta / r.tb).toFixed(1) : fmt(Math.round(r.ta / r.tb))) + "x"];
      }));
      var g = (R[1].ta / R[1].tb) / (R[0].ta / R[0].tb);
      verdict.innerHTML = kind === "rep"
        ? "Doubling the text left the ratio at about the same size (×" + g.toFixed(2) + "): the vocabulary is stuck at " + R[0].u + " words, so each list scan is short and both versions are linear in n."
        : "Doubling the text multiplied the ratio by <strong>×" + g.toFixed(2) + "</strong>: with the vocabulary growing, every new word is compared with all the words before it — O(n × unique words).";
      out.style.display = "";
    }
    ct.load();
  }
  AAAnim.register("w11-wordfreq", wordFreq);

  /* ============================================================
     Task 3 — find the common elements
     ============================================================ */
  function common(host) {
    var A = [4, 7, 1, 7, 9, 2, 5, 12], B = [3, 7, 8, 2, 7, 10, 6, 1];
    U.title(host, "Animation · every comparison of the nested loops, then one set intersection");
    var opts = h("div", "anim-opts");
    opts.appendChild(btn("new random lists", "", function () { newLists(); ct.load(); }));
    host.appendChild(opts);
    function code() {
      return [
        "a = [" + A.join(", ") + "]",
        "b = [" + B.join(", ") + "]",
        "",
        "common_slow = set()",
        "for x in a:                       # up to n × m comparisons",
        "    for y in b:",
        "        if x == y:",
        "            common_slow.add(x)    # output stores distinct matches",
        "            break",
        "",
        "common_fast = set(a) & set(b)    # O(n + m) average, including construction",
        "",
        "assert common_slow == common_fast",
        "print(common_slow == common_fast)"
      ].join("\n");
    }
    function newLists() {
      do {
        A = []; B = [];
        for (var k = 0; k < 8; k++) { A.push(1 + Math.floor(Math.random() * 12)); B.push(1 + Math.floor(Math.random() * 12)); }
        var I = uniq(A).filter(function (x) { return B.indexOf(x) >= 0; });
      } while (I.length < 2 || I.length > 4 || uniq(A).length > 7);
    }
    function build() {
      var f = [], slow = [], cmp = 0, st = 0, out = [], x = null, y = null, grid = {}, sets = null;
      function push(line, note, extra) {
        var vars = { a: A, b: B };
        if (f.length >= 2) vars["common_slow (set)"] = slow.slice().sort(function (p, q) { return p - q; });
        if (x !== null) vars.x = x;
        if (y !== null) vars.y = y;
        if (sets && sets.stage >= 3) vars["common_fast (set)"] = sets.I;
        var g = {}; Object.keys(grid).forEach(function (k) { g[k] = grid[k]; });
        f.push({ line: line, note: note, vars: vars, out: out.slice(), hl: extra && extra.hl,
          counters: { "x == y comparisons": cmp, "set steps": st },
          view: { grid: g, cur: extra && extra.cur, row: extra ? extra.row : -1, sets: sets ? { stage: sets.stage, SA: sets.SA, SB: sets.SB, I: sets.I } : null, slow: slow.slice() } });
      }
      push(2, "Two lists of 8 numbers. Press <strong>play</strong>: the grid has one square for every possible comparison (8 × 8 = 64).");
      push(4, "Start with an empty set for the answer.");
      A.forEach(function (xv, r) {
        x = xv; y = null;
        push(5, "Outer loop: x = <strong>" + xv + "</strong> (row " + (r + 1) + ").", { row: r });
        for (var c = 0; c < B.length; c++) {
          y = B[c]; cmp++;
          var eq = xv === y;
          grid[r + "," + c] = eq ? "good" : "dim";
          push(7, "Is " + xv + " == " + y + "? " + (eq ? "<strong>Yes.</strong>" : "No."), { cur: r + "," + c, row: r, hl: [6] });
          if (eq) {
            var dup = slow.indexOf(xv) >= 0;
            if (!dup) slow.push(xv);
            push(8, dup ? xv + " is already in common_slow — a set keeps one copy, so nothing changes." : "Add " + xv + " to common_slow.", { cur: r + "," + c, row: r });
            for (var s = c + 1; s < B.length; s++) grid[r + "," + s] = "skip";
            push(9, "<code>break</code>: the rest of this row is skipped.", { row: r });
            break;
          }
        }
        if (xv !== y) push(6, xv + " matched nothing: all " + B.length + " comparisons of this row were needed.", { row: r });
      });
      x = null; y = null;
      var SA = uniq(A).sort(function (p, q) { return p - q; }), SB = uniq(B).sort(function (p, q) { return p - q; });
      var I = SA.filter(function (v) { return SB.indexOf(v) >= 0; });
      sets = { stage: 1, SA: SA, SB: SB, I: I };
      st += A.length;
      push(11, "<code>set(a)</code>: one pass over a — " + A.length + " hash inserts, duplicates collapse.");
      sets.stage = 2; st += B.length;
      push(11, "<code>set(b)</code>: one pass over b — " + B.length + " inserts.");
      sets.stage = 3; st += Math.min(SA.length, SB.length);
      push(11, "<code>&amp;</code>: for each value of the smaller set, one O(1) lookup in the other — " + Math.min(SA.length, SB.length) + " lookups.");
      push(13, "Both ways found " + pySet(I) + ". The assert checks they agree — it would stop the program if not.");
      out.push("True");
      push(14, "<strong>True.</strong> Nested loops: " + cmp + " comparisons. Sets: " + st + " steps. The table above shows the gap at the task's size.", { end: true });
      f[f.length - 1].end = true;
      return f;
    }
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: draw,
      fps: function (i, fr) { return fr[i] && (fr[i].line === 7 || fr[i].line === 5) ? 5 : 1.5; } });
    var ex = ct.extra;
    var grid = h("div", "w11-grid");
    ex.appendChild(h("div", "ct-h", "rows: x in a · columns: y in b"));
    ex.appendChild(grid);
    var setsBox = h("div", "w11-sets");
    ex.appendChild(setsBox);
    var big = h("div", "w11-big");
    ex.appendChild(big);
    var bigDone = null;

    function draw(fr) {
      var v = fr.view, s = '<span class="w11-gh"></span>';
      B.forEach(function (y) { s += '<span class="w11-gh">' + y + "</span>"; });
      A.forEach(function (x, r) {
        s += '<span class="w11-gh' + (r === v.row ? " on" : "") + '">' + x + "</span>";
        B.forEach(function (y, c) {
          var k = r + "," + c;
          s += '<span class="w11-gc ' + (v.grid[k] || "") + (k === v.cur ? " cur" : "") + '"></span>';
        });
      });
      grid.innerHTML = s;
      grid.style.gridTemplateColumns = "repeat(" + (B.length + 1) + ", minmax(0, 1fr))";
      if (v.sets) {
        var S = v.sets;
        setsBox.innerHTML =
          '<div class="w11-srow"><span>set(a)</span>' + chipsHTML(S.SA, function (x) { return S.stage >= 3 && S.I.indexOf(x) >= 0 ? "good" : ""; }) + "</div>" +
          (S.stage >= 2 ? '<div class="w11-srow"><span>set(b)</span>' + chipsHTML(S.SB, function (x) { return S.stage >= 3 && S.I.indexOf(x) >= 0 ? "good" : ""; }) + "</div>" : "") +
          (S.stage >= 3 ? '<div class="w11-srow"><span>a &amp; b</span>' + chipsHTML(S.I, function () { return "gold"; }) + "</div>" : "");
      } else setsBox.innerHTML = "";
      big.style.display = fr.end ? "" : "none";
      if (fr.end && !bigDone) bigDone = bigTable();
    }
    function bigTable() {
      var r = U.rng(2025), n = 50000, a = [], b = [], first = Object.create(null), j;
      for (j = 0; j < n; j++) a.push(1 + Math.floor(r() * 1000000));
      for (j = 0; j < n; j++) { var y = 1 + Math.floor(r() * 1000000); b.push(y); if (first[y] === undefined) first[y] = j; }
      var cmp = 0, sa = Object.create(null), sb = Object.create(null), ua = 0, ub = 0, hits = 0;
      for (j = 0; j < n; j++) { var x = a[j], p = first[x]; cmp += p === undefined ? n : p + 1; if (!sa[x]) { sa[x] = 1; ua++; } }
      for (j = 0; j < n; j++) if (!sb[b[j]]) { sb[b[j]] = 1; ub++; }
      Object.keys(sa).forEach(function (k) { if (sb[k]) hits++; });
      var steps = n + n + Math.min(ua, ub);
      big.innerHTML = "";
      big.appendChild(h("p", "w11-ctitle", "At the task's size: two lists of 50 000 random integers from 1 to 1 000 000 (seeded)"));
      var tw = h("div", "anim-table-wrap w11-tw");
      big.appendChild(tw);
      var t = U.table(tw, ["method", "work", "model time"]);
      t.rows([
        ["nested loops", fmt(cmp) + " comparisons", "≈ " + secs(cmp * 40e-9)],
        ["set(a) &amp; set(b)", fmt(steps) + " set steps", "≈ " + secs(steps * 60e-9)]
      ]);
      big.appendChild(h("p", "w11-cap", "Both find the same " + fmt(hits) + " distinct common values. Most x values are not in b at all, so their rows run all 50 000 comparisons."));
      big.appendChild(h("p", "note-sim", "Comparison counts are exact for these seeded lists; times are a model (40 ns per Python-level comparison, 60 ns per set step). Measure your own speedup — no fixed factor is guaranteed."));
      return true;
    }
    ct.load();
  }
  AAAnim.register("w11-common", common);

  /* ============================================================
     Task 4 — when a set is the wrong answer
     ============================================================ */
  function wrongSet(host) {
    var CARDS = [
      { t: "Tally the class vote: <code>['A', 'B', 'A', 'C', 'A', 'B']</code>", ok: false,
        why: "Mistake — duplicates carry meaning: <code>set(votes)</code> keeps each option once and throws away the counts you need." },
      { t: "Check 10 000 new sign-ups against 100 000 known emails", ok: true,
        why: "Fine — build the set once (O(n)), then each of the many lookups is O(1) on average: the §11.8 repair." },
      { t: "Show the top-5 leaderboard in rank order", ok: false,
        why: "Mistake — order matters: a set has no order, so the ranking is scrambled." },
      { t: "List which distinct countries appear in a log (order does not matter)", ok: true,
        why: "Fine — “which values appear?” is exactly the question a set answers." },
      { t: "Check once whether “Ece” is in a 20-name list", ok: false,
        why: "A poor choice — building the set is already a full pass; for one lookup, <code>in</code> on the list is simpler and may be faster." },
      { t: "Find every name that starts with “B”", ok: false,
        why: "Mistake — a hash table cannot answer order or range questions; you still walk every item (next week’s subject)." }
    ];
    U.title(host, "Animation · set() is fine, or set() is a mistake?");
    var quiz = h("div", "w11-cards");
    host.appendChild(quiz);
    var score = h("p", "w11-cap", "");
    var answered = {};
    CARDS.forEach(function (c, i) {
      var card = h("div", "w11-card");
      card.appendChild(h("p", "", c.t));
      var row = h("div", "anim-opts");
      var fb = h("p", "w11-fb", "");
      [[true, "set() is fine"], [false, "set() is a mistake"]].forEach(function (o) {
        var b = btn(o[1], "", function () {
          var right = o[0] === c.ok;
          row.querySelectorAll("button").forEach(function (x) { x.className = ""; });
          b.className = "w11-pick " + (right ? "right" : "wrong");
          fb.innerHTML = (right ? "Right. " : "Not quite. ") + c.why;
          card.className = "w11-card " + (right ? "right" : "wrong");
          answered[i] = right;
          var k = Object.keys(answered), g = k.filter(function (x) { return answered[x]; }).length;
          score.textContent = g + " of " + k.length + " answered correctly" + (k.length === CARDS.length ? " — now see three of them happen below." : "");
        });
        row.appendChild(b);
      });
      card.appendChild(row); card.appendChild(fb);
      quiz.appendChild(card);
    });
    host.appendChild(score);

    /* demos */
    var DEMO = {
      votes: { list: ["A", "B", "A", "C", "A", "B"], q: "Who won the vote?" },
      board: { list: ["Cem", "Ada", "Ece", "Bilal", "Dilek"], q: "Who is in first place?" },
      once: { list: ["Ada", "Bilal", "Cem", "Dilek", "Ece", "Fatma", "Gül", "Hakan", "İpek", "Jale", "Kaan", "Leyla", "Mert", "Nil", "Oya", "Pınar", "Rıza", "Selin", "Tolga", "Ufuk"], q: "Is “Ece” in the list?" }
    };
    var cur = "votes", token = 0, timer = 0;
    host.appendChild(h("p", "w11-ctitle", "Watch it go wrong"));
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("situation", [["votes", "votes"], ["board", "leaderboard"], ["once", "one lookup"]], cur, function (v) { cur = v; reset(); }));
    host.appendChild(opts);
    var stage = h("div", "w11-demo");
    host.appendChild(stage);
    var lRow = h("div", "w11-srow"), sRow = h("div", "w11-srow"), ans = h("div", "w11-ans");
    stage.appendChild(lRow); stage.appendChild(sRow); stage.appendChild(ans);
    var lookBox = h("div", "w11-lookups");
    host.appendChild(lookBox);
    var lk = h("input"); lk.type = "range"; lk.min = "1"; lk.max = "10"; lk.value = "1";
    lk.setAttribute("aria-label", "Number of lookups");
    var lkRow = h("div", "anim-opts");
    lkRow.appendChild(h("span", "lab", "lookups"));
    lkRow.appendChild(lk);
    var lkv = h("span", "lab", "1");
    lkRow.appendChild(lkv);
    lookBox.appendChild(lkRow);
    var barL = bar("scan the list each time"), barS = bar("build a set, then look up");
    lk.addEventListener("input", costs);
    var ctr = h("div", "anim-controls");
    var bGo = btn("&#9654; convert with set()", "primary", run);
    var bReset = btn("&#8634;", "", reset, "Back to start");
    ctr.appendChild(bReset); ctr.appendChild(bGo);
    host.appendChild(ctr);
    var m = U.msg(host);

    function bar(label) {
      var r = h("div", "w11-cost");
      r.appendChild(h("span", "", label));
      var t = h("div", "w11-ctrack"), f = h("i", "");
      t.appendChild(f);
      var v = h("b", "", "");
      r.appendChild(t); r.appendChild(v);
      lookBox.appendChild(r);
      return { f: f, v: v };
    }
    function costs() {
      var k = parseInt(lk.value, 10), n = DEMO.once.list.length;
      var L = k * n, S = n + k, mx = Math.max(10 * n, n + 10);
      lkv.textContent = k;
      barL.f.style.width = (L / mx * 100) + "%"; barL.v.textContent = L + " steps";
      barS.f.style.width = (S / mx * 100) + "%"; barS.v.textContent = S + " steps";
      barL.f.className = L <= S ? "win" : ""; barS.f.className = S < L ? "win" : "";
    }
    function hashOrder(list) {       /* a stand-in for hash order: arbitrary but fixed */
      function hs(s) { var x = 7; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 1009; return x; }
      return list.slice().sort(function (a, b) { return hs(a) % 11 - hs(b) % 11 || hs(a) - hs(b); });
    }
    function later(fn, ms) { var my = token; timer = setTimeout(function () { if (my === token) fn(); }, U.REDUCED ? 30 : ms); }
    function listHTML(list, hi, cls) {
      return "<span>" + (cur === "once" ? "names" : cur) + "</span>" + list.map(function (v, j) {
        return '<span class="w11-chip ' + (j === hi ? cls || "on" : "") + (cur === "board" ? " rank" : "") + '"' + (cur === "board" ? ' data-r="' + (j + 1) + '"' : "") + ">" + esc(v) + "</span>";
      }).join("");
    }
    function reset() {
      token++; clearTimeout(timer);
      var d = DEMO[cur];
      lRow.innerHTML = listHTML(d.list, -1);
      sRow.innerHTML = "<span>set(…)</span>";
      ans.innerHTML = "";
      lookBox.style.display = cur === "once" ? "" : "none";
      bGo.disabled = false;
      bGo.innerHTML = cur === "once" ? "&#9654; look up “Ece” both ways" : "&#9654; convert with set()";
      costs();
      m.innerHTML = { votes: "Six votes. Predict: after <code>set(votes)</code>, can you still say who won? Press the button.",
        board: "Five players in rank order. Predict: after <code>set(board)</code>, who is first? Press the button.",
        once: "Twenty names, one question. Which is less work: scanning the list, or building a set first?" }[cur];
    }
    function run() {
      reset();
      bGo.disabled = true;
      var d = DEMO[cur], S = [], i = 0;
      if (cur === "once") {
        var target = d.list.indexOf("Ece");
        var build = function () {
          if (i < d.list.length) {
            S.push(d.list[i]);
            sRow.innerHTML = "<span>set(names)</span>" + chipsHTML(S);
            i++; later(build, 90); return;
          }
          sRow.innerHTML = "<span>set(names)</span>" + chipsHTML(S, function (v) { return v === "Ece" ? "good" : ""; });
          ans.innerHTML += "<br><b>set:</b> " + d.list.length + " inserts to build it, then <strong>1</strong> lookup = " + (d.list.length + 1) + " steps.";
          m.innerHTML = "For a single question the set did <em>more</em> work than the scan it replaced. Slide the number of lookups: the set only pays off once its build cost is shared by many lookups.";
          bGo.disabled = false;
        };
        (function scan() {
          lRow.innerHTML = listHTML(d.list, i, i === target ? "good" : "on");
          if (i === target) {
            ans.innerHTML = "<b>scan:</b> found after <strong>" + (i + 1) + "</strong> comparisons.";
            i = 0; later(build, 700); return;
          }
          i++; later(scan, 220);
        })();
        return;
      }
      (function step() {
        if (i === d.list.length) { finish(); return; }
        var v = d.list[i], dup = S.indexOf(v) >= 0;
        lRow.innerHTML = listHTML(d.list, i, dup ? "bad" : "on");
        if (!dup) S.push(v);
        var shown = cur === "board" ? hashOrder(S) : S;
        sRow.innerHTML = "<span>set(" + cur + ")</span>" + chipsHTML(shown, function (x) { return x === v ? (dup ? "bad" : "gold") : ""; });
        m.innerHTML = dup ? "“" + v + "” is already in the set — this vote is <strong>dropped</strong>." :
          cur === "board" ? "“" + v + "” goes wherever its hash says, not after the previous name." : "“" + v + "” goes into the set.";
        i++; later(step, 650);
      })();
      function finish() {
        var shown = cur === "board" ? hashOrder(S) : S;
        sRow.innerHTML = "<span>set(" + cur + ")</span>" + chipsHTML(shown, function () { return "bad"; });
        if (cur === "votes") {
          ans.innerHTML = "<b>" + d.q + "</b> From the list: A has 3 votes, B 2, C 1 — <strong>A wins</strong>. From the set: {A, B, C} — every option once, <strong>no way to tell</strong>.";
          m.innerHTML = "Duplicates carried the meaning, and <code>set()</code> silently threw them away. Counting needs a dictionary or <code>Counter</code>, not a set.";
        } else {
          ans.innerHTML = "<b>" + d.q + "</b> From the list: <strong>Cem</strong> (position 1). From the set: the names come out in hash order — here " + shown.join(", ") + " — so <strong>the ranking is gone</strong>.";
          m.innerHTML = "Order mattered, and a set has none (the order you see depends on hashing and can change between runs). Keep the list; add a set alongside it only if you also need fast lookups.";
        }
        bGo.disabled = false;
      }
    }
    reset();
  }
  AAAnim.register("w11-wrongset", wrongSet);

  /* ============================================================
     Task 5 — trace the buckets by hand
     ============================================================ */
  function buckets(host) {
    var KEYS = { t5: [16, 24, 5, 40, 9], p: [10, 18, 3, 26, 7] };
    var kid = "t5", size = 8, mode = "you";
    U.title(host, "Animation · drop each key into bucket key % size");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("mode", [["you", "you trace it"], ["watch", "watch the code"]], mode, function (v) { mode = v; setup(); }));
    opts.appendChild(U.seg("keys", [["t5", "[16, 24, 5, 40, 9]"], ["p", "§11.6 keys"]], kid, function (v) { kid = v; setup(); }));
    opts.appendChild(U.seg("size", [[8, "8"], [13, "13"]], size, function (v) { size = v; setup(); }));
    host.appendChild(opts);

    var youBox = h("div", "w11-you");
    var prompt = h("p", "w11-prompt", "");
    youBox.appendChild(prompt);
    host.appendChild(youBox);
    var bvWrap = h("div", "");
    var bv = h("div", "w11-bks");
    bvWrap.appendChild(bv);
    var noColl = btn("no bucket has a collision", "", function () { collision(-1); });
    var ncRow = h("div", "anim-opts w11-nc");
    ncRow.appendChild(noColl);
    bvWrap.appendChild(ncRow);
    var look = h("div", "anim-opts w11-look");
    look.appendChild(h("span", "lab", "look up a key:"));
    var inp = h("input"); inp.type = "number"; inp.setAttribute("aria-label", "Key to look up");
    look.appendChild(inp);
    look.appendChild(btn("look up", "", lookup));
    bvWrap.appendChild(look);
    var lookMsg = h("p", "w11-fb", "");
    bvWrap.appendChild(lookMsg);
    youBox.appendChild(bvWrap);
    var youFb = U.msg(youBox);
    var ctHost = h("div", "");
    host.appendChild(ctHost);

    function code() {
      var K = KEYS[kid];
      return [
        "size = " + size,
        "buckets = [[] for _ in range(size)]     # " + (size === 8 ? "eight" : "thirteen") + " empty chains",
        "",
        "for key in [" + K.join(", ") + "]:",
        "    home = key % size                   # the \"hook number\"",
        "    buckets[home].append(key)",
        '    print(f"{key:>3}  ->  bucket {home}")',
        "",
        "print(buckets)"
      ].join("\n");
    }
    function pad3(x) { x = String(x); while (x.length < 3) x = " " + x; return x; }
    function arith(k) { return k + " % " + size + " = " + (k % size) + "  (" + k + " = " + Math.floor(k / size) + " × " + size + " + " + (k % size) + ")"; }
    function empty() { var b = []; for (var i = 0; i < size; i++) b.push([]); return b; }
    function pyB(b) { return "[" + b.map(function (c) { return "[" + c.join(", ") + "]"; }).join(", ") + "]"; }
    function build() {
      var K = KEYS[kid], f = [], b = null, out = [], key = null, home = null;
      function push(line, note, v) {
        var vars = { size: size };
        if (b) vars.buckets = b.map(function (c) { return c.slice(); });
        if (key !== null) vars.key = key;
        if (home !== null) vars.home = home;
        f.push({ line: line, note: note, vars: vars, out: out.slice(), view: { b: b ? b.map(function (c) { return c.slice(); }) : empty(), hi: v && v.hi, key: v && v.key } });
      }
      push(1, "A table of " + size + " buckets. Press <strong>play</strong>, or step one line at a time.");
      b = empty();
      push(2, size + " empty chains.");
      K.forEach(function (k) {
        key = k; home = null;
        push(4, "Next key: <strong>" + k + "</strong>.");
        home = k % size;
        push(5, "<code>" + arith(k) + "</code>", { hi: home });
        b[home].push(k);
        push(6, b[home].length > 1 ? "Bucket " + home + " already holds " + b[home].slice(0, -1).join(", ") + " — a <strong>collision</strong>. " + k + " joins the chain." : k + " goes into bucket " + home + ".", { hi: home, key: k });
        out.push(pad3(k) + "  ->  bucket " + home);
        push(7, "Print the line.", { hi: home });
      });
      key = null; home = null;
      out.push(pyB(b));
      var coll = b.map(function (c, i) { return c.length > 1 ? i : -1; }).filter(function (i) { return i >= 0; });
      push(9, coll.length ? "Done. Collision" + (coll.length > 1 ? "s" : "") + " in bucket " + coll.join(" and ") + ": " + coll.map(function (i) { return "[" + b[i].join(", ") + "]"; }).join(", ") + ". Try looking up a key above." :
        "Done — with size " + size + " no two keys share a bucket. Try looking up a key above.");
      return f;
    }
    var ct = U.CodeTrace(ctHost, { code: code, build: build, onFrame: function (fr) { paint(fr.view.b, fr.view.hi, fr.view.key); }, fps: 1.4 });

    /* you-trace state */
    var yi = 0, yb = [], phase = "place", tries = 0;
    function paint(b, hi, key, walk) {
      bv.innerHTML = b.map(function (c, i) {
        var cls = "w11-bk" + (i === hi ? " hi" : "") + (mode === "you" && phase !== "done" ? " pick" : "");
        return '<div class="' + cls + '" data-i="' + i + '"' + (mode === "you" && phase !== "done" ? ' role="button" tabindex="0" aria-label="bucket ' + i + '"' : "") + '><span class="w11-bi">' + i + "</span>" +
          (c.length ? c.map(function (k, j) {
            var s = k === key ? "gold" : walk && walk.b === i ? (j < walk.j ? "dim" : j === walk.j ? (walk.hit ? "good" : "on") : "") : "";
            return (j ? '<span class="w11-arrow">→</span>' : "") + '<span class="w11-chip ' + s + '">' + k + "</span>";
          }).join("") : '<span class="w11-empty">[]</span>') + "</div>";
      }).join("");
    }
    function youPrompt() {
      var K = KEYS[kid];
      if (phase === "place") {
        prompt.innerHTML = "Key <strong>" + K[yi] + "</strong> (" + (yi + 1) + " of " + K.length + "): which bucket is <code>" + K[yi] + " % " + size + "</code>? Click it.";
      } else if (phase === "coll") {
        prompt.innerHTML = "All five keys placed. <strong>Which bucket holds a collision?</strong> Click it" + " — or press the button if none does.";
      } else {
        prompt.innerHTML = "Traced by hand" + (tries ? " (" + tries + " slip" + (tries > 1 ? "s" : "") + " along the way)" : " without a slip") + ". Now switch to <strong>watch the code</strong> to check yourself, or look up a key.";
      }
      ncRow.style.display = phase === "coll" ? "" : "none";
      look.style.display = lookMsg.style.display = phase === "done" ? "" : "none";
    }
    function onPick(i) {
      if (mode !== "you" || phase === "done") return;
      if (phase === "coll") { collision(i); return; }
      var K = KEYS[kid], k = K[yi], home = k % size;
      if (i === home) {
        yb[home].push(k);
        youFb.innerHTML = "Right: <code>" + arith(k) + "</code>" + (yb[home].length > 1 ? " — and bucket " + home + " already had a key, so it forms a chain." : ".");
        yi++;
        if (yi === K.length) phase = "coll";
        paint(yb, home, k);
      } else {
        tries++;
        youFb.innerHTML = "Not bucket " + i + ". Hint: " + k + " = " + Math.floor(k / size) + " × " + size + " + <strong>?</strong> — the remainder is the bucket.";
        paint(yb, -1);
      }
      youPrompt();
    }
    function collision(i) {
      var coll = yb.map(function (c, j) { return c.length > 1 ? j : -1; }).filter(function (j) { return j >= 0; });
      var ok = i < 0 ? !coll.length : coll.indexOf(i) >= 0;
      if (ok) {
        phase = "done";
        youFb.innerHTML = coll.length ? "Right: bucket " + coll.join(" and ") + " — " + coll.map(function (j) { return "[" + yb[j].join(", ") + "]"; }).join(", ") +
          (kid === "t5" && size === 8 ? ". A three-way collision: 16, 24 and 40 are all multiples of 8, so a poor table size piles them together. Try size 13." : ".") :
          "Right: with size " + size + " every key has its own bucket.";
        paint(yb, coll.length ? coll[0] : -1);
      } else {
        tries++;
        youFb.innerHTML = i < 0 ? "Look again — one bucket holds more than one key." : "Bucket " + i + " holds " + (yb[i].length ? "only one key" : "nothing") + ". A collision needs two or more keys in the same bucket.";
      }
      youPrompt();
    }
    bv.addEventListener("click", function (e) { var r = e.target.closest(".w11-bk"); if (r) onPick(parseInt(r.getAttribute("data-i"), 10)); });
    bv.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var r = e.target.closest(".w11-bk"); if (r) { e.preventDefault(); onPick(parseInt(r.getAttribute("data-i"), 10)); }
    });

    var ltok = 0;
    function lookup() {
      var k = parseInt(inp.value, 10);
      if (isNaN(k) || k < 0) { lookMsg.innerHTML = "Type a whole number ≥ 0."; return; }
      var b = empty();
      KEYS[kid].forEach(function (x) { b[x % size].push(x); });
      var home = k % size, chain = b[home], j = 0, my = ++ltok;
      lookMsg.innerHTML = "<code>" + k + " % " + size + " = " + home + "</code> — jump straight to bucket " + home + ".";
      paint(b, home, null);
      (function stepL() {
        if (my !== ltok) return;
        if (j === chain.length) {
          lookMsg.innerHTML = "<code>" + k + " % " + size + " = " + home + "</code>. Bucket " + home + " holds " + (chain.length ? "[" + chain.join(", ") + "]" : "nothing") +
            " — <strong>" + k + " is absent</strong> after " + chain.length + " comparison" + (chain.length === 1 ? "" : "s") + ". The other buckets were never touched.";
          paint(b, home, null, { b: home, j: j });
          return;
        }
        var hit = chain[j] === k;
        paint(b, home, null, { b: home, j: j, hit: hit });
        if (hit) {
          lookMsg.innerHTML = "<code>" + k + " % " + size + " = " + home + "</code>. Walk the chain: <strong>found " + k + "</strong> after " + (j + 1) + " comparison" + (j ? "s" : "") +
            ", out of " + KEYS[kid].length + " keys stored. The other buckets were never touched.";
          return;
        }
        j++;
        setTimeout(stepL, U.REDUCED ? 30 : 600);
      })();
    }

    function setup() {
      ltok++;
      inp.value = kid === "t5" ? (size === 8 ? "40" : "24") : (size === 8 ? "26" : "99");
      lookMsg.innerHTML = "";
      if (mode === "you") {
        ct.stop();
        ctHost.style.display = "none";
        youBox.style.display = "";
        youBox.insertBefore(bvWrap, youFb);
        yi = 0; yb = empty(); phase = "place"; tries = 0;
        youFb.innerHTML = "No code yet — just the arithmetic. Take the remainder after dividing by " + size + ".";
        paint(yb, -1);
        youPrompt();
      } else {
        youBox.style.display = "none";
        ctHost.style.display = "";
        ct.extra.appendChild(bvWrap);
        ncRow.style.display = "none";
        look.style.display = lookMsg.style.display = "";
        ct.load();
      }
    }
    setup();
  }
  AAAnim.register("w11-buckets", buckets);

  /* ============================================================
     Task 6 — count without a set
     ============================================================ */
  function dice(host) {
    var FACES = [1, 2, 3, 4, 5, 6], CHECK = [100, 1000, 10000, 100000, 1000000], FIRST = 30;
    var die = "fair", guess = null, cache = {};
    U.title(host, "Animation · a million dice rolls, counted and de-duplicated");
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("die", [["fair", "fair die"], ["loaded", "loaded die (4 comes up more)"]], die, function (v) { die = v; player.load(); }));
    host.appendChild(opts);
    var ch = choice(host, "predict: how many items will set(rolls) have after a million rolls?", [[6, "6"], [1000000, "1 000 000"], [0, "it depends on the die"]], function (v) {
      guess = v; ch.mark(v); player.load();
    });
    var code = h("div", "ct-code w11-code");
    ["from collections import Counter", "print(Counter(rolls).most_common(1))", "print(set(rolls))"].forEach(function (ln, j) {
      code.appendChild(h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + U.pyLine(ln) + "</code>"));
    });
    host.appendChild(code);
    var stage = h("div", "w11-dstage");
    var dieEl = h("div", "w11-die", "");
    var left = h("div", "w11-dpane"), right = h("div", "w11-dpane");
    left.appendChild(h("div", "ct-h", "Counter(rolls) — a count per face"));
    var hist = h("div", "w11-hist");
    left.appendChild(hist);
    right.appendChild(h("div", "ct-h", "set(rolls) — which faces appeared"));
    var setv = h("div", "w11-setv");
    right.appendChild(setv);
    stage.appendChild(dieEl); stage.appendChild(left); stage.appendChild(right);
    host.appendChild(stage);
    var bars = FACES.map(function (f) {
      var col = h("div", "w11-hc");
      var num = h("span", "w11-hn", "0"), b = h("div", "w11-hb"), lab = h("span", "w11-hl", f);
      col.appendChild(num); col.appendChild(b); col.appendChild(lab);
      hist.appendChild(col);
      return { num: num, b: b };
    });
    var slots = FACES.map(function (f) { var s = h("span", "w11-slot", f); setv.appendChild(s); return s; });
    var outp = h("pre", "ct-out w11-out");
    host.appendChild(outp);
    var stats = h("div", "anim-stats");
    var sRolls = U.stat("rolls"), sLen = U.stat("len(set(rolls))");
    stats.appendChild(sRolls.el); stats.appendChild(sLen.el);
    host.appendChild(stats);
    host.appendChild(h("p", "note-sim", "Rolls are simulated in your browser with a seeded random generator (a million of them, so the counts are real counts of these rolls) — your own rolls will give different numbers."));
    var m = U.msg(host);

    function gen(kind) {
      if (cache[kind]) return cache[kind];
      var r = U.rng(kind === "fair" ? 11 : 12), c = [0, 0, 0, 0, 0, 0, 0], seq = [], snaps = {}, ci = 0;
      for (var n = 1; n <= 1000000; n++) {
        var u = r(), f;
        if (kind === "fair") f = 1 + Math.floor(u * 6);
        else f = u < 0.25 ? 4 : [1, 2, 3, 5, 6][Math.floor((u - 0.25) / 0.75 * 5)];
        c[f]++;
        if (n <= FIRST) { seq.push(f); snaps[n] = c.slice(); }
        if (n === CHECK[ci]) { snaps[n] = c.slice(); ci++; }
      }
      return (cache[kind] = { seq: seq, snaps: snaps });
    }
    function build() {
      var f = [{ n: 0 }];
      for (var n = 1; n <= FIRST; n++) f.push({ n: n });
      CHECK.forEach(function (n) { f.push({ n: n }); });
      return f;
    }
    function most(c) { var b = 1; for (var q = 2; q <= 6; q++) if (c[q] > c[b]) b = q; return b; }
    function render(fr, i, fs) {
      var G = gen(die), n = fr.n, c = n ? G.snaps[n] : [0, 0, 0, 0, 0, 0, 0];
      var mx = Math.max.apply(null, c.slice(1)) || 1;
      var roll = n && n <= FIRST ? G.seq[n - 1] : null;
      bars.forEach(function (b, j) {
        var f = j + 1;
        b.b.style.height = (c[f] / mx * 100) + "%";
        b.b.className = "w11-hb" + (f === roll ? " on" : "") + (i === fs.length - 1 && f === most(c) ? " top" : "");
        b.num.textContent = c[f] >= 10000 ? (c[f] / 1000).toFixed(1) + "k" : fmt(c[f]);
      });
      var present = FACES.filter(function (f) { return c[f] > 0; });
      slots.forEach(function (s, j) { s.className = "w11-slot" + (c[j + 1] ? " in" : "") + (j + 1 === roll ? " on" : ""); });
      dieEl.textContent = roll ? "⚀⚁⚂⚃⚄⚅".charAt(roll - 1) : "🎲";
      dieEl.className = "w11-die" + (roll ? " roll" : "");
      sRolls.set(fmt(n)); sLen.set(present.length);
      var end = i === fs.length - 1;
      if (end) {
        var b = most(c);
        outp.textContent = "[(" + b + ", " + c[b] + ")]\n" + pySet(present);
      } else outp.textContent = "";
      if (n === 0) {
        m.innerHTML = "Make your prediction, then press <strong>play</strong>. The first " + FIRST + " rolls go one at a time; then we jump to a million.";
      } else if (n <= FIRST) {
        m.innerHTML = "Roll " + n + ": <strong>" + roll + "</strong>. Counter adds one to face " + roll + "; the set " +
          (c[roll] === 1 ? "records " + roll + " for the first time." : "already has " + roll + " — <strong>nothing changes</strong>.");
      } else if (!end) {
        m.innerHTML = fmt(n) + " rolls. The counts keep growing; the set has been stuck at " + present.length + " items for a long time.";
      } else {
        var bb = most(c), gtxt = guess === null ? "" : guess === 6 ? " Your prediction was right." : " You predicted " + (guess ? fmt(guess) : "that it depends on the die") + " — the set has only 6 items.";
        m.innerHTML = "Counter answers: face <strong>" + bb + "</strong>, " + fmt(c[bb]) + " times (" + (c[bb] / 1e4).toFixed(1) + "%). The set answers <strong>{1, 2, 3, 4, 5, 6}</strong> — " +
          (die === "fair" ? "and for the loaded die it would say exactly the same." : "exactly what it says for a fair die.") +
          " A million rolls collapse to six values: the frequencies you were asked for are erased." + gtxt;
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function (i) { return i < FIRST ? 2.5 : 1; } });
    player.load();
  }
  AAAnim.register("w11-dice", dice);
})();
