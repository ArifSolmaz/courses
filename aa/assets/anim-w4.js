/* ============================================================
   AA — week 4 "Try it yourself" animations (lists)
   w4-stats, w4-misses, w4-dups, w4-evens, w4-find, w4-alias
   Uses the shared helpers on AAAnim.ui (see anim.js).
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, fmt = U.fmt;

  /* ---------- small local helpers ---------- */
  function pyFloat(v) {                      /* Python's repr of a float (for the values used here) */
    if (Number.isInteger(v)) return v + ".0";
    return String(v);
  }
  function pyList(a) {
    return "[" + a.map(function (x) { return typeof x === "string" ? "'" + x + "'" : String(x); }).join(", ") + "]";
  }
  function numInput(parent, label, ph, aria) {
    parent.appendChild(h("span", "lab", label));
    var i = h("input"); i.type = "number"; i.placeholder = ph; i.setAttribute("aria-label", aria || label);
    parent.appendChild(i);
    return i;
  }
  function readInt(inp) { var v = parseInt(String(inp.value).replace(/[\s,_]/g, ""), 10); return isNaN(v) ? null : v; }
  /* a row of array cells: items = [{t, cls, sub}] */
  function Cells(parent, extraCls) {
    var row = h("div", "arr" + (extraCls ? " " + extraCls : ""));
    parent.appendChild(row);
    var els = [];
    return {
      el: row,
      draw: function (items) {
        while (els.length > items.length) row.removeChild(els.pop());
        while (els.length < items.length) { var c = h("div", "cell"); row.appendChild(c); els.push(c); }
        items.forEach(function (it, j) {
          els[j].className = "cell" + (it.cls ? " " + it.cls : "");
          els[j].innerHTML = U.esc(it.t) + (it.sub != null ? "<small>" + it.sub + "</small>" : "");
        });
      }
    };
  }

  /* ============================================================
     Task 1 — basic statistics in one pass (stats.py)
     ============================================================ */
  function stats(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · one pass, four answers");
    var data = [12, 7, 30, 4, 18];
    var opts = h("div", "anim-opts");
    opts.appendChild(h("span", "lab", "data"));
    var inp = h("input", "w4-text"); inp.type = "text"; inp.value = data.join(", ");
    inp.setAttribute("aria-label", "List of whole numbers, separated by commas");
    opts.appendChild(inp);
    opts.appendChild(btn("use", "", function () {
      var v = inp.value.split(/[,\s]+/).filter(Boolean).map(function (x) { return parseInt(x, 10); });
      if (v.length < 2 || v.length > 10 || v.some(function (x) { return isNaN(x) || Math.abs(x) > 9999; })) {
        ct.msg.innerHTML = "Please type 2 to 10 whole numbers (between −9999 and 9999), separated by commas."; return;
      }
      data = v; inp.value = data.join(", "); ct.load();
    }));
    opts.appendChild(btn("page example", "", function () { data = [12, 7, 30, 4, 18]; inp.value = data.join(", "); ct.load(); }));
    host.appendChild(opts);
    var pr = h("div", "anim-opts w4-predict");
    pr.appendChild(h("span", "lab", "predict first →"));
    var pT = numInput(pr, "total", "?", "Predicted total");
    var pA = numInput(pr, "average", "?", "Predicted average");
    pA.step = "any";
    var pB = numInput(pr, "largest", "?", "Predicted largest");
    var pS = numInput(pr, "smallest", "?", "Predicted smallest");
    host.appendChild(pr);

    function code() {
      return "data = [" + data.join(", ") + "]\ntotal = 0\nbiggest = data[0]\nsmallest = data[0]\n\n" +
        "for x in data:\n    total = total + x\n    if x > biggest:\n        biggest = x\n    if x < smallest:\n        smallest = x\n\n" +
        "print(total, total / len(data), biggest, smallest)";
    }
    function build() {
      var f = [], total = 0, big = data[0], small = data[0], bi = 0, si = 0, visits = 0, cmp = 0, k = -1;
      function V(extra) {
        var v = { data: data.slice() };
        if (extra >= 1) v.total = total;
        if (extra >= 2) v.biggest = big;
        if (extra >= 3) v.smallest = small;
        if (k >= 0) v.x = data[k];
        return v;
      }
      function push(line, stage, note, o) {
        f.push({ line: line, vars: V(stage), note: note, k: k, bi: stage >= 2 ? bi : -1, si: stage >= 3 ? si : -1,
          counters: { "visits": visits + " / " + data.length, "comparisons": cmp }, out: o || [] });
      }
      push(0, 0, "Type your four predictions above (or just think them), then press <strong>play</strong>.");
      push(1, 0, "The list is created. One loop will have to answer four questions.");
      push(2, 1, "<code>total</code> starts at 0 — nothing added yet.");
      push(3, 2, "The first item is our starting guess for the largest: <strong>" + big + "</strong>.");
      push(4, 3, "…and for the smallest, too. (That is why the list must not be empty.)");
      for (k = 0; k < data.length; k++) {
        var x = data[k]; visits++;
        push(6, 3, "Visit " + visits + ": <code>x</code> is <strong>" + x + "</strong>.");
        total += x;
        push(7, 3, "Add it to the running total: total is now <strong>" + total + "</strong>.");
        cmp++;
        if (x > big) {
          push(8, 3, x + " &gt; " + big + "? <strong>Yes</strong> — a new largest.");
          big = x; bi = k; push(9, 3, "<code>biggest</code> becomes <strong>" + big + "</strong>.");
        } else push(8, 3, x + " &gt; " + big + "? No — keep " + big + ".");
        cmp++;
        if (x < small) {
          push(10, 3, x + " &lt; " + small + "? <strong>Yes</strong> — a new smallest.");
          small = x; si = k; push(11, 3, "<code>smallest</code> becomes <strong>" + small + "</strong>.");
        } else push(10, 3, x + " &lt; " + small + "? No — keep " + small + ".");
      }
      k = -1;
      var avg = total / data.length;
      var line = total + " " + pyFloat(avg) + " " + big + " " + small;
      push(13, 3, "", [line]);
      f[f.length - 1].final = { total: total, avg: avg, big: big, small: small };
      return f;
    }
    var cellsHost = h("div", "");
    var ct = U.CodeTrace(host, { code: code, build: build, fps: function (i) { return i < 12 ? 1.4 : 2.6; }, onFrame: onFrame });
    ct.extra.appendChild(h("div", "lab muted", "<small>the list — <span class='w4-key on'>current x</span> <span class='w4-key gold'>biggest</span> <span class='w4-key good'>smallest</span></small>"));
    ct.extra.appendChild(cellsHost);
    var cells = Cells(cellsHost, "idx");
    function onFrame(fr, i, frames) {
      cells.draw(data.map(function (v, j) {
        var cls = [];
        if (fr.bi === j) cls.push("gold"); else if (fr.si === j) cls.push("good");
        if (j === fr.k) cls.push("on");
        if (fr.line >= 6 && fr.line < 13 && j > fr.k) cls.push("dim");
        return { t: v, cls: cls.join(" "), sub: "[" + j + "]" };
      }));
      if (fr.final) {
        var F = fr.final, bits = [], any = false;
        [[pT, F.total, "total"], [pA, F.avg, "average"], [pB, F.big, "largest"], [pS, F.small, "smallest"]].forEach(function (p) {
          var g = parseFloat(p[0].value);
          if (isNaN(g)) return;
          any = true;
          bits.push(p[2] + " " + (Math.abs(g - p[1]) < 0.051 ? "✓" : "✗ (you said " + g + ")"));
        });
        ct.msg.innerHTML = "Printed: total <strong>" + F.total + "</strong>, average <strong>" + pyFloat(F.avg) + "</strong>, largest <strong>" + F.big +
          "</strong>, smallest <strong>" + F.small + "</strong>. " + (any ? "Your predictions: " + bits.join(", ") + ". " : "") +
          "<strong>One pass, four answers</strong> — " + data.length + " visits for " + data.length + " items; a list ten times longer needs ten times the visits.";
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 2 — twenty missing targets, full pass each
     ============================================================ */
  function misses(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · every miss costs a full pass");
    var N = 10000, S = 20;
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("searches", [[20, "20 (the task)"], [10000, "10 000 (the what-if)"]], 20, function (v) { S = v; ct.load(); }));
    host.appendChild(opts);
    var pr = h("div", "anim-opts");
    var guess = numInput(pr, "your prediction:", "total looks?", "Predicted total looks");
    guess.classList.add("w4-wideinp");
    host.appendChild(pr);

    function code() {
      return "data = list(range(10000))\n" +
        (S === 20 ? "targets = list(range(10000, 10020))  # all missing\n"
                  : "targets = list(range(10000, 20000))  # all missing\n") +
        "total_looks = 0\nfor target in targets:\n" +
        "    for item in data:          # never finds target\n" +
        "        total_looks = total_looks + 1\n        if item == target:\n            break\n" +
        "print(len(targets), \"searches:\", total_looks, \"looks\")";
    }
    function build() {
      var f = [], total = 0;
      function fr(line, s, looks, note, hl, o) {
        var v = {};
        if (line >= 2 || line === 0) v["len(data)"] = N;
        if (s >= 1) v.target = N + s - 1;
        if (s >= 1 && looks > 0) v.item = looks - 1;
        v.total_looks = total;
        f.push({ line: line, vars: line === 0 ? {} : v, s: s, looks: looks, note: note, hl: hl,
          counters: { "searches done": (looks === N ? s : s - 1) + " / " + fmt(S), "total looks": fmt(total) }, out: o || [] });
      }
      fr(0, 0, 0, "The list holds 0 … 9999. Every target is 10 000 or more, so <strong>none</strong> of them is there. Predict the total, then press <strong>play</strong>.");
      fr(1, 0, 0, "Build the list of " + fmt(N) + " numbers.");
      fr(2, 0, 0, "Make " + fmt(S) + " targets that are all missing.");
      fr(3, 0, 0, "The counter starts at 0.");
      if (S === 20) {
        for (var s = 1; s <= S; s++) {
          fr(4, s, 0, "Search " + s + ": look for <strong>" + (N + s - 1) + "</strong>.");
          [2500, 5000, 7500, 10000].forEach(function (L) {
            total += 2500;
            fr(6, s, L, L < N ? "…still looking: " + fmt(L) + " items checked, no match, no <code>break</code>." :
              "Checked all " + fmt(N) + " items — no match, so the inner loop ends without <code>break</code>. That miss cost <strong>" + fmt(N) + " looks</strong>.", [5, 6, 7]);
          });
        }
      } else {
        var step = 250;
        for (var d = step; d <= S; d += step) {
          total = d * N;
          fr(6, d, N, "Searches 1–" + fmt(d) + " done: each one a full pass. Total so far: <strong>" + fmt(total) + "</strong> looks.", [4, 5, 6, 7]);
        }
      }
      fr(9, S, N, "", null, [S + " searches: " + total + " looks"]);
      f[f.length - 1].final = total;
      return f;
    }
    var cv = h("canvas", "w4-area"); cv.width = 720; cv.height = 250;
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Rectangle of searches times items; each row fills as a search checks all 10 000 items");
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame,
      fps: function (i) { return S === 20 ? (i < 10 ? 1.6 : 9) : 6; } });
    ct.extra.appendChild(cv);
    function onFrame(fr) {
      draw(fr);
      if (fr.final != null) {
        var g = readInt(guess);
        ct.msg.innerHTML = (S === 20 ? "<strong>" + fmt(fr.final) + " comparisons</strong> for twenty innocent-looking searches: 20 × 10 000. "
          : "<strong>" + fmt(fr.final) + " comparisons</strong> — 100 million. Searching a list <em>inside</em> a loop over another list is a nested loop in disguise; week 11 makes this same job almost free. ") +
          (g == null ? "" : g === fr.final ? "Your prediction was exactly right. " : "You predicted " + fmt(g) + ". ") +
          (S === 20 ? "Now switch to <strong>10 000</strong> searches and predict again." : "");
      }
    }
    function draw(fr) {
      var W = Math.max(280, Math.min(720, Math.round(cv.clientWidth || 720)));
      var narrow = W < 520, H = S === 20 ? 250 : narrow ? W * 0.62 + 180 : 250;
      if (cv.width !== W) cv.width = W;
      if (cv.height !== Math.round(H)) cv.height = Math.round(H);
      var c = cv.getContext("2d");
      var col = function (v) { return U.cssVar(host, v); };
      c.clearRect(0, 0, W, H);
      c.font = "13px " + (col("--font-mono") || "monospace");
      var L = 78, T = 30, done = fr.looks === N ? fr.s : fr.s - 1;
      c.fillStyle = col("--muted"); c.textAlign = "left";
      if (S === 20) {
        var AW = W - L - 16, rh = (H - T - 12) / S;
        c.textAlign = "center"; c.fillText("← 10 000 items in each search →", L + AW / 2, 18); c.textAlign = "left";
        for (var r = 0; r < S; r++) {
          var y = T + r * rh;
          c.fillStyle = col("--surface-2"); c.fillRect(L, y + 1, AW, rh - 2);
          var frac = r < done ? 1 : r === fr.s - 1 ? fr.looks / N : 0;
          if (frac) { c.fillStyle = r < done ? col("--accent") : col("--blue"); c.fillRect(L, y + 1, AW * frac, rh - 2); }
          if (r === 0 || r === S - 1 || r === fr.s - 1) {
            c.fillStyle = col("--muted"); c.textAlign = "right";
            c.fillText("search " + (r + 1), L - 8, y + rh / 2 + 4); c.textAlign = "left";
          }
        }
      } else {
        var side = narrow ? W * 0.62 : H - T - 12, x0 = narrow ? 40 : L;
        c.fillText("10 000 items →", x0, 18);
        c.fillStyle = col("--surface-2"); c.fillRect(x0, T, side, side);
        c.fillStyle = col("--accent"); c.fillRect(x0, T, side, side * (fr.s / S));
        c.save(); c.translate(x0 - 14, T + side / 2); c.rotate(-Math.PI / 2); c.textAlign = "center";
        c.fillStyle = col("--muted"); c.fillText("10 000 searches ↓", 0, 0); c.restore();
        var tx = narrow ? 12 : x0 + side + 30, ty = narrow ? T + side - 10 : T;
        c.fillStyle = col("--text"); c.font = "15px " + (col("--font-mono") || "monospace");
        c.fillText("area = searches × items", tx, ty + 40);
        c.fillText(fmt(fr.s) + " × 10 000", tx, ty + 64);
        c.fillStyle = col("--accent"); c.font = "bold 22px " + (col("--font-mono") || "monospace");
        c.fillText("= " + fmt(fr.s * N), tx, ty + 96);
        c.fillStyle = col("--muted"); c.font = "13px " + (col("--font-mono") || "monospace");
        c.fillText("the 20-search job is one thin", tx, ty + 124);
        c.fillText("strip: 1/500 of this square", tx, ty + 142);
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 3 — duplicates by comparing every pair
     ============================================================ */
  function dups(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · every item against every later item");
    var n = 6, planted = false, seed = 7;
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("list size", [[6, "6 (trace)"], [100, "100"], [200, "200"], [400, "400"]], 6, function (v) { n = v; ct.load(); }));
    opts.appendChild(U.seg("data", [[false, "random.sample"], [true, "plant a repeat"]], false, function (v) { planted = v; ct.load(); }));
    host.appendChild(opts);
    var pr = h("div", "anim-opts");
    var guess = numInput(pr, "your prediction:", "comparisons?", "Predicted number of comparisons");
    guess.classList.add("w4-wideinp");
    pr.appendChild(btn("new random data", "", function () { seed++; ct.load(); }));
    host.appendChild(pr);

    var D = planted ? 1 : 0;
    function code() {
      D = planted ? 1 : 0;
      return "import random\ndata = random.sample(range(1000000), " + n + ")\n" +
        (planted ? "data[-1] = data[0]            # plant one repeat (demo only)\n" : "") +
        "\ncomparisons = 0\nfound = False\nfor i in range(len(data)):\n    for j in range(i + 1, len(data)):\n" +
        "        comparisons = comparisons + 1\n        if data[i] == data[j]:\n            found = True\n\nprint(found, comparisons)";
    }
    var data = [];
    function makeData() {
      var r = U.rng(seed * 1000 + n), seen = {};
      data = [];
      while (data.length < n) { var v = Math.floor(r() * 1000000); if (!seen[v]) { seen[v] = 1; data.push(v); } }
      if (planted) data[n - 1] = data[0];
    }
    function build() {
      makeData(); D = planted ? 1 : 0;
      var f = [], c = 0, found = false;
      function fr(line, i, j, note, o, hl) {
        var v = { "len(data)": n };
        if (line === 0) v = {};
        if (i >= 0) v.i = i;
        if (j >= 0) v.j = j;
        if (line >= 4 + D) v.comparisons = c;
        if (line >= 5 + D) v.found = found;
        f.push({ line: line, i: i, j: j, c: c, found: found, vars: v, note: note, out: o || [], hl: hl,
          counters: { "comparisons": fmt(c), "n(n − 1) / 2": fmt(n * (n - 1) / 2) } });
      }
      fr(0, -1, -1, "Predict how many comparisons a list of " + n + " needs, then press <strong>play</strong>.");
      fr(2, -1, -1, n + " different random numbers (<code>random.sample</code> never repeats a value).");
      if (planted) fr(3, -1, -1, "For the demo, overwrite the last item with a copy of the first — now there <em>is</em> a repeat.");
      fr(4 + D, -1, -1, "The counter starts at 0.");
      fr(5 + D, -1, -1, "No repeat found yet.");
      for (var i = 0; i < n; i++) {
        if (n <= 10) {
          fr(6 + D, i, -1, "<code>i = " + i + "</code>: compare item " + i + " with every item after it — " + (n - 1 - i) + " of them." +
            (i === n - 1 ? " (None left: the inner loop is empty.)" : ""));
          for (var j = i + 1; j < n; j++) {
            c++;
            var eq = data[i] === data[j];
            fr(8 + D, i, j, "Compare <code>data[" + i + "]</code> = " + data[i] + " with <code>data[" + j + "]</code> = " + data[j] + ": " +
              (eq ? "<strong>equal!</strong>" : "different."), null, [7 + D, 9 + D]);
            if (eq) { found = true; fr(10 + D, i, j, "A repeat — <code>found = True</code>. There is no <code>break</code>, so the loops keep going."); }
          }
        } else {
          for (var jj = i + 1; jj < n; jj++) { c++; if (data[i] === data[jj]) found = true; }
          fr(8 + D, i, -1, "Row <code>i = " + i + "</code> done: " + (n - 1 - i) + " comparisons, running total " + fmt(c) + ".", null, [6 + D, 7 + D, 9 + D]);
        }
      }
      fr(12 + D, -1, -1, "", [(found ? "True" : "False") + " " + c]);
      f[f.length - 1].final = c;
      return f;
    }
    var results = {};
    var grid = h("div", "w4-pairs");
    var cv = h("canvas", "w4-tri"); cv.width = 400; cv.height = 400;
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Triangle of all pairs i < j; it fills row by row as comparisons are made");
    var cellsHost = h("div", "");
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame,
      fps: function (i, frames) { return n <= 10 ? (i < 8 ? 1.3 : 2.4) : Math.max(8, n / 5); } });
    var vis = h("div", "w4-dupvis");
    vis.appendChild(cellsHost); vis.appendChild(grid); vis.appendChild(cv);
    ct.extra.appendChild(vis);
    var tHost = h("div", "anim-table-wrap"); ct.extra.appendChild(tHost);
    var tab = U.table(tHost, ["n", "comparisons", "× previous n"]);
    var cells = Cells(cellsHost, "idx");

    function onFrame(fr, i, frames) {
      var small = n <= 10;
      cellsHost.style.display = grid.style.display = small ? "" : "none";
      cv.style.display = small ? "none" : "";
      if (small) {
        cells.draw(data.map(function (v, k) {
          return { t: v, sub: "[" + k + "]", cls: k === fr.i ? "on" : k === fr.j ? (data[fr.i] === v ? "bad" : "gold") : "" };
        }));
        drawGrid(fr);
      } else drawTri(fr);
      if (fr.final != null) {
        results[n] = fr.final;
        var g = readInt(guess);
        ct.msg.innerHTML = "<strong>" + fmt(fr.final) + " comparisons</strong> for " + n + " items — exactly n(n − 1)/2. " +
          (g == null ? "" : g === fr.final ? "Your prediction was exact. " : "You predicted " + fmt(g) + ". ") +
          (n === 6 ? "Now try 100, 200 and 400." : "Doubling the list roughly <strong>quadruples</strong> the work — the nested-loop signature.") +
          " <span class='muted'>The count never depends on the values: there is no <code>break</code>" + (planted ? ", so even finding the repeat does not stop early" : "") + ".</span>";
      }
      var rows = [], prev = null;
      [6, 100, 200, 400].forEach(function (k) {
        if (results[k] == null) return;
        var ratio = prev && prev[0] * 2 === k ? "×" + (results[k] / prev[1]).toFixed(2) : "—";
        rows.push([k, fmt(results[k]), ratio]);
        prev = [k, results[k]];
      });
      tHost.style.display = rows.length ? "" : "none";
      tab.rows(rows, rows.map(function (r) { return r[0]; }).indexOf(n));
    }
    function drawGrid(fr) {
      var html = "<div class='w4-g-h'></div>";
      for (var j = 0; j < n; j++) html += "<div class='w4-g-h'>j " + j + "</div>";
      for (var i = 0; i < n; i++) {
        html += "<div class='w4-g-h'>i " + i + "</div>";
        for (var k = 0; k < n; k++) {
          var cls = "w4-g";
          if (k <= i) cls += " off";
          else {
            var done = fr.i > i || (fr.i === i && fr.j >= k) || fr.final != null;
            if (fr.line === 0 || fr.line < 6 + D) done = false;
            if (done) cls += data[i] === data[k] ? " hit" : " done";
            if (fr.i === i && fr.j === k) cls += " cur";
          }
          html += "<div class='" + cls + "'>" + (k > i && cls.indexOf("hit") >= 0 ? "=" : k > i && cls.indexOf("done") >= 0 ? "✓" : "") + "</div>";
        }
      }
      grid.style.gridTemplateColumns = "auto repeat(" + n + ", 1fr)";
      grid.innerHTML = html;
    }
    function drawTri(fr) {
      var c = cv.getContext("2d"), W = cv.width, cell = W / n;
      var col = function (v) { return U.cssVar(host, v); };
      c.fillStyle = col("--bg-soft"); c.fillRect(0, 0, W, W);
      var rowsDone = fr.final != null ? n : fr.i >= 0 ? fr.i + 1 : 0;
      for (var i = 0; i < n - 1; i++) {
        c.fillStyle = i < rowsDone - 1 ? col("--accent") : i === rowsDone - 1 ? col("--blue") : col("--surface-2");
        if (fr.final != null) c.fillStyle = col("--accent");
        c.fillRect((i + 1) * cell, i * cell, (n - i - 1) * cell, Math.max(1, cell));
      }
      if (planted && rowsDone >= 1) {
        c.fillStyle = col("--red"); c.fillRect(W - 12, 0, 12, 12);
        c.font = "13px " + (col("--font-mono") || "monospace"); c.textAlign = "right";
        c.fillText("the repeat: i = 0, j = " + (n - 1), W - 18, 22); c.textAlign = "left";
      }
      c.strokeStyle = col("--border-strong"); c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(W, W); c.stroke();
      c.fillStyle = col("--muted"); c.font = "14px " + (col("--font-mono") || "monospace");
      c.fillText("pairs i < j  (j →)", W * 0.42, W * 0.82);
      c.fillText("i ↓", 8, W * 0.2);
    }
    ct.load();
  }

  /* ============================================================
     Task 4 — loop vs comprehension (two_ways.py)
     ============================================================ */
  function evens(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · same list, two spellings, same visits");
    var pr = h("div", "anim-opts");
    pr.appendChild(h("span", "lab", "predict: how many items does the comprehension visit?"));
    var pick = null, pb = [];
    [["10", 10], ["20", 20]].forEach(function (o) {
      var b = btn(o[0], "", function () { pick = o[1]; pb.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); });
      b.setAttribute("aria-pressed", "false"); pr.appendChild(b); pb.push(b);
    });
    pr.appendChild(h("span", "lab", "(it keeps only 10)"));
    host.appendChild(pr);

    var CODE = "data = list(range(20))\n\nloop_way = []\nfor x in data:\n    if x % 2 == 0:\n        loop_way.append(x)\n\n" +
      "comp_way = [x for x in data if x % 2 == 0]\n\nprint(loop_way == comp_way)   # True — same result\nprint(comp_way)";
    function build() {
      var f = [], L = [], C = [], vl = 0, vc = 0;
      function fr(line, x, phase, note, o, hl) {
        var v = {};
        if (line >= 3 || line === 0) v.loop_way = L.slice();
        if (line === 0) v = {};
        if (x != null) v.x = x;
        if (phase === "comp") v["comp_way (building)"] = C.slice();
        if (phase === "end") v.comp_way = C.slice();
        f.push({ line: line, x: x, phase: phase, L: L.slice(), C: C.slice(), vars: v, note: note, out: o || [], hl: hl,
          counters: { "loop visits": vl, "comprehension visits": vc, "kept": L.length + " / " + C.length } });
      }
      fr(0, null, "loop", "Predict above, then press <strong>play</strong>. First the long spelling, then the one-liner.");
      fr(1, null, "loop", "<code>data</code> is 0, 1, 2, … 19.");
      fr(3, null, "loop", "Way 1 starts with an <strong>empty</strong> list.");
      for (var x = 0; x < 20; x++) {
        vl++;
        fr(4, x, "loop", "Visit " + vl + ": <code>x = " + x + "</code>.");
        var ev = x % 2 === 0;
        fr(5, x, "loop", x + " % 2 is " + (x % 2) + " — " + (ev ? "<strong>even</strong>, keep it." : "odd, skip it."));
        if (ev) { L.push(x); fr(6, x, "loop", "Append " + x + ": <code>loop_way</code> now has " + L.length + " item" + (L.length > 1 ? "s" : "") + "."); }
      }
      fr(8, null, "comp", "Way 2: the comprehension does the <em>same</em> walk — value to keep, where from, condition — in one line.");
      for (var y = 0; y < 20; y++) {
        vc++;
        if (y % 2 === 0) C.push(y);
        fr(8, y, "comp", "Visit " + vc + ": " + y + (y % 2 === 0 ? " passes <code>x % 2 == 0</code>, kept." : " fails the condition, skipped — but it was still visited."), null, null);
      }
      fr(8, null, "end", "The finished list is bound to <code>comp_way</code>.");
      fr(10, null, "end", "<code>==</code> compares the two lists item by item.", ["True"]);
      fr(11, null, "end", "", ["True", pyList(C)]);
      f[f.length - 1].final = true;
      return f;
    }
    var ct = U.CodeTrace(host, { code: CODE, build: build, onFrame: onFrame,
      fps: function (i, frames) { var fr = frames[i]; return i < 12 ? 1.4 : fr && fr.phase === "comp" ? 3.2 : 4.5; } });
    var dh = h("div", ""), lh = h("div", ""), chh = h("div", "");
    ct.extra.appendChild(h("div", "lab muted", "<small>data</small>")); ct.extra.appendChild(dh);
    ct.extra.appendChild(h("div", "lab muted w4-gap", "<small>loop_way (append loop)</small>")); ct.extra.appendChild(lh);
    ct.extra.appendChild(h("div", "lab muted w4-gap", "<small>comp_way (comprehension)</small>")); ct.extra.appendChild(chh);
    var cd = Cells(dh, "w4-small"), cl = Cells(lh, "w4-small"), cc = Cells(chh, "w4-small");
    function onFrame(fr) {
      var curLoop = fr.phase === "loop" ? fr.x : null, curComp = fr.phase === "comp" ? fr.x : null;
      var cur = curLoop != null ? curLoop : curComp;
      var seenUpTo = fr.phase === "loop" ? (fr.x == null ? (fr.line === 0 || fr.line < 4 ? -1 : 19) : fr.x) : fr.phase === "comp" ? (fr.x == null ? -1 : fr.x) : 19;
      var items = [];
      for (var k = 0; k < 20; k++) {
        items.push({ t: k, cls: k === cur ? "on" : (k <= seenUpTo ? (k % 2 === 0 ? "good" : "dim") : "") });
      }
      cd.draw(items);
      var empty = [{ t: "[ ]", cls: "dim" }];
      cl.draw(fr.L.length ? fr.L.map(function (v) { return { t: v, cls: fr.final ? "good" : "gold" }; }) : empty);
      cc.draw(fr.C.length ? fr.C.map(function (v) { return { t: v, cls: fr.final ? "good" : "gold" }; }) : empty);
      if (fr.final) {
        ct.msg.innerHTML = "<code>True</code> — same list. Both spellings visited all <strong>20</strong> items and kept 10: same answer, same cost (one visit per item). " +
          (pick == null ? "" : pick === 20 ? "Your prediction (20) was right." : "You predicted 10 — but a filter still has to <em>look at</em> every item to decide.");
      }
    }
    ct.load();
  }

  /* ============================================================
     Task 5 — linear search that returns a position
     ============================================================ */
  function find(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · where was it found, and how many looks?");
    var NAMES = ["Ada", "Bilal", "Cem", "Dilek", "Ece"];
    var target = "Dilek";
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("target", [["Ada", "Ada · first"], ["Dilek", "Dilek · page example"], ["Ece", "Ece · last"], ["Zeynep", "Zeynep · missing"]], target,
      function (v) { target = v; ct.load(); }));
    host.appendChild(opts);
    var pr = h("div", "anim-opts");
    var guess = numInput(pr, "your prediction:", "looks?", "Predicted number of looks");
    host.appendChild(pr);

    function code() {
      return 'names = ["Ada", "Bilal", "Cem", "Dilek", "Ece"]\ntarget = "' + target + '"\n\nposition = -1\nlooks = 0\n' +
        "for i in range(len(names)):\n    looks = looks + 1\n    if names[i] == target:\n        position = i\n        break\n\n" +
        'print(f"position {position}, {looks} looks")';
    }
    function build() {
      var f = [], pos = -1, looks = 0, cur = -1;
      function fr(line, note, o, extra) {
        var v = { target: target };
        if (line >= 4 || line === 0) v.position = pos;
        if (line >= 5) v.looks = looks;
        if (cur >= 0) { v.i = cur; v["names[i]"] = NAMES[cur]; }
        if (line === 0) v = {};
        var e = { line: line, cur: cur, pos: pos, looks: looks, vars: v, note: note, out: o || [],
          counters: { "looks": looks, "position": pos } };
        for (var k in extra) e[k] = extra[k];
        f.push(e);
      }
      fr(0, "Target <strong>" + target + "</strong>. Predict the number of looks, then press <strong>play</strong>.");
      fr(2, "We are looking for <code>\"" + target + "\"</code>.");
      fr(4, "<code>-1</code> means “not found (yet)” — it can never be a real position.");
      fr(5, "No looks yet.");
      for (var i = 0; i < NAMES.length; i++) {
        cur = i;
        fr(6, "<code>i = " + i + "</code>.");
        looks++;
        fr(7, "Look number " + looks + ".");
        var hit = NAMES[i] === target;
        fr(8, "Is <code>names[" + i + "]</code> (\"" + NAMES[i] + "\") equal to \"" + target + "\"? " + (hit ? "<strong>Yes!</strong>" : "No."));
        if (hit) {
          pos = i; fr(9, "Remember the position: <strong>" + i + "</strong>.");
          fr(10, "<code>break</code> — stop early, the remaining names are never looked at.");
          break;
        }
      }
      if (pos < 0) { cur = -1; fr(6, "The loop ran out of names without a match, so <code>position</code> is still −1."); }
      cur = -1;
      fr(12, "", ["position " + pos + ", " + looks + " looks"], { final: true });
      return f;
    }
    var done = {};
    var ch = h("div", "");
    var ct = U.CodeTrace(host, { code: code, build: build, onFrame: onFrame, fps: 1.5 });
    ct.extra.appendChild(ch);
    var cells = Cells(ch, "idx");
    var tw = h("div", "anim-table-wrap"); ct.extra.appendChild(tw);
    var tab = U.table(tw, ["target", "position", "looks", "§4.4 row"]);
    function caseOf(t) { return t === "Ada" ? "best case" : t === "Ece" || t === "Zeynep" ? "worst case" : "in between"; }
    function onFrame(fr) {
      cells.draw(NAMES.map(function (nm, k) {
        var cls = "";
        if (fr.final || fr.line === 12) cls = k === fr.pos ? "good" : (fr.pos < 0 ? "bad" : (k < fr.pos ? "dim" : ""));
        else if (k === fr.cur) cls = fr.pos === k ? "good" : "on";
        else if (fr.cur >= 0 && k < fr.cur) cls = "dim";
        else if (fr.pos < 0 && fr.line === 6 && fr.cur < 0 && fr.looks === NAMES.length) cls = "dim";
        return { t: nm, cls: cls, sub: "[" + k + "]" };
      }));
      if (fr.final) {
        done[target] = [fr.pos, fr.looks];
        var g = readInt(guess);
        var need = ["Ada", "Ece", "Zeynep"].filter(function (t) { return !done[t]; });
        ct.msg.innerHTML = "<code>position " + fr.pos + ", " + fr.looks + " looks</code> — " + (target === "Dilek" ? "neither the best nor the worst case" : "the <strong>" + caseOf(target) + "</strong>") +
          (target === "Zeynep" ? ": a miss must check every name before it can say −1." : target === "Ece" ? ": the match is the last name." : target === "Ada" ? ": found on the very first look." : ".") +
          (g == null ? "" : g === fr.looks ? " Your prediction was right." : " You predicted " + g + ".") +
          (need.length ? " <span class='muted'>Still to try: " + need.join(", ") + ".</span>" :
            " You now have all three rows of the §4.4 table: best 1, worst 5 (= n), and an average of (n + 1)/2 = 3 looks when a present target is equally likely at each position.");
      }
      var rows = ["Ada", "Dilek", "Ece", "Zeynep"].filter(function (t) { return done[t]; })
        .map(function (t) { return ['"' + t + '"', done[t][0], done[t][1], caseOf(t)]; });
      tw.style.display = rows.length ? "" : "none";
      tab.rows(rows, rows.map(function (r) { return r[0]; }).indexOf('"' + target + '"'));
    }
    ct.load();
  }

  /* ============================================================
     Task 6 — the aliasing bug and its fix
     ============================================================ */
  function alias(host) {
    host.classList.add("w4-wide"); U.title(host, "Animation · names, lists, and arrows");
    var fixed = false, pick = null;
    var opts = h("div", "anim-opts");
    opts.appendChild(U.seg("program", [[false, "buggy.py"], [true, "fixed.py"]], false, function (v) { fixed = v; setPick(null); ct.load(); }));
    host.appendChild(opts);
    var pr = h("div", "anim-opts");
    var q = h("span", "lab", "");
    pr.appendChild(q);
    var pbs = [["[1, 2, 3]", "123"], ["[2, 4, 6]", "246"]].map(function (o) {
      var b = btn("original: " + o[0], "", function () { setPick(o[1]); ct.load(); });
      pr.appendChild(b); return [b, o[1]];
    });
    host.appendChild(pr);
    function setPick(p) {
      pick = p;
      q.textContent = "predict the first printed line:";
      pbs.forEach(function (x) { x[0].setAttribute("aria-pressed", String(x[1] === p)); });
    }
    setPick(null);

    var BUG = "original = [1, 2, 3]\ncopy = original\nfor i in range(len(copy)):\n    copy[i] = copy[i] * 2\nprint(\"original:\", original)   # [2, 4, 6] — wrong!";
    var FIX = "original = [1, 2, 3]     # restore the starting data after the buggy run\ncopy = original[:]      # the [:] makes a separate outer list\n" +
      "for i in range(len(copy)):\n    copy[i] = copy[i] * 2\nprint(\"original:\", original)\nprint(\"copy:\", copy)";
    function build() {
      var A = [1, 2, 3], B = fixed ? null : A, f = [];
      function fr(line, stage, i, note, o, chg) {
        var v = {};
        if (stage >= 1) v.original = A.slice();
        if (stage >= 2) v.copy = B.slice();
        if (i != null) v.i = i;
        f.push({ line: line, stage: stage, A: A.slice(), B: B ? B.slice() : null, i: i, chg: chg, vars: v, note: note, out: o || [],
          counters: stage >= 2 ? { "copy is original": B === A ? "True" : "False" } : {} });
      }
      fr(0, 0, null, "Pick your prediction above, then press <strong>play</strong>.");
      fr(1, 1, null, "A list object is created, and the name <code>original</code> points at it.");
      if (!fixed) fr(2, 2, null, "<code>copy = original</code> copies <strong>nothing</strong>: it gives the same list a second name. Both arrows point at one box.");
      else { B = A.slice(); fr(2, 2, null, "<code>original[:]</code> builds a <strong>new</strong> list with the same items; <code>copy</code> points at that one."); }
      for (var i = 0; i < 3; i++) {
        fr(3, 2, i, "<code>i = " + i + "</code>.");
        var old = B[i]; B[i] = old * 2;
        fr(4, 2, i, "<code>copy[" + i + "]</code> becomes " + old + " × 2 = <strong>" + B[i] + "</strong>" +
          (B === A ? " — and since it is the same box, <code>original[" + i + "]</code> changes too." : " — only in copy’s own box."), null, i);
      }
      var o1 = "original: " + pyList(A);
      fr(5, 2, null, "", [o1]);
      if (fixed) fr(6, 2, null, "", [o1, "copy: " + pyList(B)]);
      f[f.length - 1].final = true;
      return f;
    }
    var svgHost = h("div", "w4-mem");
    var ct = U.CodeTrace(host, { code: function () { return fixed ? FIX : BUG; }, build: build, onFrame: onFrame, fps: 1.1 });
    ct.extra.appendChild(svgHost);
    function box(x, y, vals, chg, label) {
      var s = "";
      vals.forEach(function (v, k) {
        var on = chg === k;
        s += '<rect x="' + (x + k * 48) + '" y="' + y + '" width="44" height="36" rx="6" class="' + (on ? "w4-cellon" : "w4-cell") + '"/>' +
          '<text x="' + (x + k * 48 + 22) + '" y="' + (y + 24) + '" text-anchor="middle" class="' + (on ? "w4-von" : "w4-v") + '">' + v + "</text>" +
          '<text x="' + (x + k * 48 + 22) + '" y="' + (y + 49) + '" text-anchor="middle" class="w4-ix">[' + k + "]</text>";
      });
      s += '<text x="' + (x + 148) + '" y="' + (y + 23) + '" class="w4-ix">' + label + "</text>";
      return s;
    }
    function arrow(x1, y1, x2, y2, cls) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + cls + '" marker-end="url(#w4arr)"/>';
    }
    function onFrame(fr) {
      var s = '<svg viewBox="0 0 370 140" role="img" aria-label="Memory diagram: which list each name points at">' +
        '<defs><marker id="w4arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" class="w4-head"/></marker></defs>';
      if (fr.stage >= 1) {
        s += '<text x="4" y="38" class="w4-name">original</text>';
        s += arrow(92, 33, 146, 33, "w4-arrow");
        s += box(150, 15, fr.A, fr.B === null || fixed ? null : fr.chg, "list #1");
      } else s += '<text x="4" y="38" class="w4-ix">(no names yet)</text>';
      if (fr.stage >= 2) {
        s += '<text x="4" y="108" class="w4-name">copy</text>';
        if (!fixed) s += arrow(52, 101, 146, 46, "w4-arrow bad");
        else { s += arrow(52, 103, 146, 103, "w4-arrow good"); s += box(150, 85, fr.B, fr.chg, "list #2"); }
      }
      s += "</svg>";
      svgHost.innerHTML = s;
      if (fr.final) {
        var right = fixed ? "123" : "246";
        ct.msg.innerHTML = (fixed ? "Two boxes, so doubling <code>copy</code> left <code>original</code> as <strong>[1, 2, 3]</strong>. "
          : "One box, two names: doubling through <code>copy</code> doubled <code>original</code>, which prints <strong>[2, 4, 6]</strong>. ") +
          (pick == null ? "" : pick === right ? "Your prediction was right. " : "You predicted the other one — follow the arrows. ") +
          (fixed ? "" : "Switch to <strong>fixed.py</strong> to see what <code>[:]</code> changes.");
      }
    }
    ct.load();
  }

  AAAnim.register("w4-stats", stats);
  AAAnim.register("w4-misses", misses);
  AAAnim.register("w4-dups", dups);
  AAAnim.register("w4-evens", evens);
  AAAnim.register("w4-find", find);
  AAAnim.register("w4-alias", alias);
})();
