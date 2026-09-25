/* ============================================================
   AA — algorithm-analysis "Try it yourself" animations (redesign)
   aa-growth, aa-nested, aa-array-insert, aa-hash-probe, aa-heap,
   aa-bfs-grid, aa-dijkstra-grid, aa-recursion-tree, aa-kruskal, aa-dp-edit
   Registers via AAAnim.register and uses AAAnim.ui (see anim.js).
   The pure computations at the top are exported for tools/verify_anim_aa.cjs.
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     Pure computations (no DOM) — tested by node
     ============================================================ */
  function lg(n) { return Math.log(n) / Math.LN2; }
  function pow2(n) { return typeof BigInt === "function" ? (BigInt(1) << BigInt(n)).toString() : String(Math.pow(2, n)); }
  /* smallest n such that 2^n' > c·n'² for every n' from n to 64 (2¹ > 1² is a false start), or 0 if none */
  function growthCross(c) {
    var n = 64;
    if (Math.pow(2, n) <= c * n * n) return 0;
    while (n > 1 && Math.pow(2, n - 1) > c * (n - 1) * (n - 1)) n--;
    return n;
  }
  function growthRow(n) { return { n: n, log: lg(n), nlog: n * lg(n), sq: n * n, exp: pow2(n) }; }

  /* triangular loop: for i in 1..n: for j in 1..i */
  function nestedCells(n) {
    var out = [];
    for (var i = 1; i <= n; i++) for (var j = 1; j <= i; j++) out.push([i, j]);
    return out;
  }
  function triangular(n) { return n * (n + 1) / 2; }

  /* front insertion cost: packed array of n items vs linked list */
  function insertCost(n) { return { arrayMoves: n + 1, listWrites: 2 }; }

  /* linear probing, h(k) = k mod m; slots[i] = key or null */
  function probeInsert(keys, m) {
    var slots = [], steps = [];
    for (var i = 0; i < m; i++) slots.push(null);
    keys.forEach(function (k) {
      var home = ((k % m) + m) % m, probes = [], pos = null;
      for (var t = 0; t < m; t++) {
        var p = (home + t) % m; probes.push(p);
        if (slots[p] === null) { slots[p] = k; pos = p; break; }
      }
      steps.push({ key: k, home: home, probes: probes, pos: pos });
    });
    return { slots: slots, steps: steps };
  }
  function probeLookup(slots, k) {
    var m = slots.length, home = ((k % m) + m) % m, probes = [];
    for (var t = 0; t < m; t++) {
      var p = (home + t) % m; probes.push(p);
      if (slots[p] === k) return { probes: probes, found: true, pos: p };
      if (slots[p] === null) return { probes: probes, found: false, pos: null };
    }
    return { probes: probes, found: false, pos: null };
  }

  /* array-backed min-heap, positions from 1 (a[0] unused) */
  function heapInsert(a, v) {
    a.push(v);
    var i = a.length - 1, swaps = [];
    while (i > 1 && a[i >> 1] > a[i]) { var t = a[i >> 1]; a[i >> 1] = a[i]; a[i] = t; swaps.push([i >> 1, i]); i >>= 1; }
    return swaps;
  }
  function heapExtractMin(a) {
    if (a.length < 2) return { min: null, swaps: [] };
    var min = a[1], last = a.pop(), swaps = [];
    if (a.length < 2) return { min: min, swaps: swaps };
    a[1] = last;
    var i = 1, n = a.length - 1;
    while (true) {
      var l = 2 * i, r = l + 1, s = i;
      if (l <= n && a[l] < a[s]) s = l;
      if (r <= n && a[r] < a[s]) s = r;
      if (s === i) break;
      var t = a[i]; a[i] = a[s]; a[s] = t; swaps.push([i, s]); i = s;
    }
    return { min: min, swaps: swaps };
  }

  /* grids: R rows × C cols, cell id = r*C+c; walls[id] true blocks; cost[id] ≥ 1 */
  var DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];            /* up, right, down, left */
  function neighbours(id, R, C) {
    var r = Math.floor(id / C), c = id % C, out = [];
    DIRS.forEach(function (d) { var rr = r + d[0], cc = c + d[1]; if (rr >= 0 && rr < R && cc >= 0 && cc < C) out.push(rr * C + cc); });
    return out;
  }
  function bfsGrid(walls, R, C, s) {
    var dist = [], parent = [], order = [], q = [s], head = 0;
    for (var i = 0; i < R * C; i++) { dist.push(-1); parent.push(-1); }
    dist[s] = 0;
    while (head < q.length) {
      var u = q[head++]; order.push(u);
      neighbours(u, R, C).forEach(function (v) {
        if (walls[v] || dist[v] >= 0) return;
        dist[v] = dist[u] + 1; parent[v] = u; q.push(v);
      });
    }
    return { dist: dist, parent: parent, order: order };
  }
  function dijkstraGrid(cost, R, C, s) {
    var INF = Infinity, dist = [], parent = [], done = [], order = [], relax = [];
    for (var i = 0; i < R * C; i++) { dist.push(INF); parent.push(-1); done.push(false); }
    dist[s] = 0;
    while (true) {
      var u = -1;
      for (var k = 0; k < R * C; k++) if (!done[k] && dist[k] < INF && (u < 0 || dist[k] < dist[u])) u = k;
      if (u < 0) break;
      done[u] = true; order.push(u);
      neighbours(u, R, C).forEach(function (v) {
        if (cost[v] === 0 || done[v]) return;             /* cost 0 = wall */
        var nd = dist[u] + cost[v], better = nd < dist[v];
        relax.push({ u: u, v: v, nd: nd, old: dist[v], better: better });
        if (better) { dist[v] = nd; parent[v] = u; }
      });
    }
    return { dist: dist, parent: parent, order: order, relax: relax };
  }
  function pathTo(parent, t) {
    var p = [];
    for (var v = t; v >= 0; v = parent[v]) { p.push(v); if (p.length > parent.length) break; }
    return p.reverse();
  }

  /* recursion tree for T(n) = a·T(n/b) + n^d, n = b^k */
  function recTree(a, b, d, k) {
    var n = Math.pow(b, k), levels = [], total = 0;
    for (var i = 0; i <= k; i++) {
      var size = n / Math.pow(b, i), count = Math.pow(a, i), cost = count * Math.pow(size, d);
      total += cost; levels.push({ i: i, size: size, count: count, cost: cost });
    }
    var bd = Math.pow(b, d), c;
    if (a < bd) c = 1; else if (a === bd) c = 2; else c = 3;
    var logba = Math.log(a) / Math.log(b);
    var bound = c === 1 ? "Θ(n^" + d + ")" : c === 2 ? "Θ(n^" + d + " log n)" : "Θ(n^log_" + b + " " + a + ") = Θ(n^" + (+logba.toFixed(3)) + ")";
    return { n: n, levels: levels, total: total, kase: c, bd: bd, logba: logba, bound: bound };
  }

  /* edit distance with table */
  function editDistance(s, t) {
    var D = [], i, j;
    for (i = 0; i <= s.length; i++) { D.push([]); for (j = 0; j <= t.length; j++) D[i].push(0); }
    for (i = 0; i <= s.length; i++) D[i][0] = i;
    for (j = 0; j <= t.length; j++) D[0][j] = j;
    for (i = 1; i <= s.length; i++) for (j = 1; j <= t.length; j++) {
      var sub = D[i - 1][j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1);
      D[i][j] = Math.min(sub, D[i - 1][j] + 1, D[i][j - 1] + 1);
    }
    return { D: D, dist: D[s.length][t.length] };
  }

  /* Kruskal with union-find (path compression); edges [u, v, w] */
  function kruskal(nV, edges) {
    var parent = [], steps = [], total = 0, sorted = edges.slice().sort(function (x, y) { return x[2] - y[2]; });
    for (var i = 0; i < nV; i++) parent.push(i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    sorted.forEach(function (e) {
      var ru = find(e[0]), rv = find(e[1]), ok = ru !== rv;
      if (ok) { parent[ru] = rv; total += e[2]; }
      var sets = []; for (var v = 0; v < nV; v++) sets.push(find(v));
      steps.push({ e: e, accepted: ok, sets: sets, total: total });
    });
    return { steps: steps, total: total, sorted: sorted };
  }

  var PURE = { growthCross: growthCross, growthRow: growthRow, nestedCells: nestedCells, triangular: triangular, insertCost: insertCost,
    probeInsert: probeInsert, probeLookup: probeLookup, heapInsert: heapInsert, heapExtractMin: heapExtractMin,
    bfsGrid: bfsGrid, dijkstraGrid: dijkstraGrid, pathTo: pathTo, recTree: recTree, editDistance: editDistance, kruskal: kruskal };
  if (typeof module !== "undefined" && module.exports) { module.exports = PURE; return; }
  if (typeof window === "undefined" || !window.AAAnim) return;

  /* ============================================================
     DOM widgets
     ============================================================ */
  var U = window.AAAnim.ui, h = U.h, btn = U.btn, seg = U.seg, esc = U.esc, fmt = U.fmt;

  function opts(host) { var o = h("div", "anim-opts"); host.appendChild(o); return o; }
  function lab(parent, text) { parent.appendChild(h("span", "lab", text)); }
  function slider(parent, label, min, max, val, onInput, aria) {
    lab(parent, label);
    var s = h("input", "aa-in"); s.type = "range"; s.min = String(min); s.max = String(max); s.value = String(val);
    s.setAttribute("aria-label", aria || label);
    var v = h("span", "lab aa-val", String(val));
    parent.appendChild(s); parent.appendChild(v);
    s.addEventListener("input", function () { v.textContent = s.value; onInput(parseInt(s.value, 10)); });
    return { el: s, set: function (x) { s.value = String(x); v.textContent = String(x); } };
  }
  function textIn(parent, label, val, aria, width) {
    lab(parent, label);
    var i = h("input", "aa-text"); i.type = "text"; i.value = val; i.setAttribute("aria-label", aria || label);
    if (width) i.style.width = width;
    parent.appendChild(i);
    return i;
  }
  function ints(str, lim) {
    return str.split(/[,\s]+/).filter(Boolean).map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x) && Math.abs(x) <= lim; });
  }
  function statRow(host, labels) {
    var row = h("div", "anim-stats"), out = {};
    labels.forEach(function (l) { var s = U.stat(l); row.appendChild(s.el); out[l] = s; });
    host.appendChild(row);
    return out;
  }
  function code(host, src) { host.appendChild(h("pre", "aa-code", src.split("\n").map(U.pyLine).join("\n"))); }
  function nice(v) {
    if (typeof v === "string") return v.length > 15 ? Number(v).toExponential(2) : fmt(v);
    if (Math.abs(v) >= 1e15) return v.toExponential(2);
    return Number.isInteger(v) ? fmt(v) : String(+v.toFixed(2));
  }

  /* ============================================================
     1. aa-growth — a table of functions, n = 1…64
     ============================================================ */
  function growth(host) {
    U.title(host, "Animation · how fast do these functions grow?");
    host.appendChild(h("p", "aa-in-line", "Input: <code>n</code> from 1 to 64 and a constant <code>c</code>. Columns: lg n, n, n lg n, n², 2ⁿ (lg = log₂)."));
    var c = 1, o = opts(host);
    var cS = slider(o, "constant c in c·n²", 1, 1000, 1, function (v) { c = v; player.load(); }, "Constant c");
    var wrap = h("div", "anim-table-wrap aa-scroll"); host.appendChild(wrap);
    var tbl = U.table(wrap, ["n", "lg n", "n", "n lg n", "n²", "2ⁿ", "c·n²"]);
    var st = statRow(host, ["n", "n² at this n", "2ⁿ at this n", "crossover: 2ⁿ > c·n² from n ="]);
    var m = U.msg(host);
    var rows = [];
    for (var n = 1; n <= 64; n++) rows.push(growthRow(n));
    function build() { var f = []; for (var n = 1; n <= 64; n++) f.push({ n: n }); return f; }
    function render(fr) {
      var cross = growthCross(c);
      tbl.rows(rows.map(function (r) { return [r.n, nice(r.log), r.n, nice(r.nlog), nice(r.sq), nice(r.exp), nice(c * r.sq)]; }), fr.n - 1);
      var trs = tbl.el.tBodies[0].rows;
      for (var i = 0; i < trs.length; i++) {
        trs[i].classList.toggle("aa-cross", i + 1 === cross);
        trs[i].classList.toggle("aa-win", i + 1 >= cross && cross > 0);
      }
      var row = trs[fr.n - 1];
      if (row && wrap.scrollHeight > wrap.clientHeight) wrap.scrollTop = row.offsetTop - wrap.clientHeight / 2;
      var r = rows[fr.n - 1];
      st["n"].set(fr.n); st["n² at this n"].set(nice(r.sq)); st["2ⁿ at this n"].set(nice(r.exp));
      st["crossover: 2ⁿ > c·n² from n ="].set(cross || "never (n ≤ 64)");
      var exp = Math.pow(2, fr.n);
      m.innerHTML = "At n = <strong>" + fr.n + "</strong>: n² = " + nice(r.sq) + " and 2ⁿ = " + nice(r.exp) + ". " +
        (exp > c * r.sq ? "2ⁿ is already bigger than c·n² (c = " + c + ")." : "c·n² is still bigger (c = " + c + ") — but 2ⁿ doubles at every step while n² only grows by 2n+1.") +
        " <span class='muted'>Increase c: the crossover moves right, but it always comes. A constant never changes the order of growth.</span>";
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 3; } });
    player.load();
  }

  /* ============================================================
     2. aa-nested — triangular nested loop as a grid
     ============================================================ */
  function nested(host) {
    U.title(host, "Animation · the triangular loop, cell by cell");
    var n = 6, o = opts(host);
    slider(o, "n", 1, 12, n, function (v) { n = v; player.load(); }, "Loop bound n");
    code(host, "count = 0\nfor i in range(1, n + 1):\n    for j in range(1, i + 1):   # j runs 1..i\n        count += 1");
    var grid = h("div", "aa-grid"); host.appendChild(grid);
    var st = statRow(host, ["i", "j", "count", "n(n+1)/2"]);
    var m = U.msg(host);
    function build() {
      var f = [{ k: 0, i: 0, j: 0 }], cells = nestedCells(n);
      cells.forEach(function (c, k) { f.push({ k: k + 1, i: c[0], j: c[1] }); });
      return f;
    }
    function render(fr) {
      grid.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
      var html = "";
      for (var i = 1; i <= n; i++) for (var j = 1; j <= n; j++) {
        var idx = triangular(i - 1) + j, cls = j > i ? "off" : idx < fr.k ? "done" : idx === fr.k ? "cur" : "";
        html += '<div class="aa-c ' + cls + '">' + (j <= i ? (idx <= fr.k ? idx : "") : "") + "</div>";
      }
      grid.innerHTML = html;
      var T = triangular(n);
      st["i"].set(fr.i || "—"); st["j"].set(fr.j || "—"); st["count"].set(fr.k); st["n(n+1)/2"].set(n + "·" + (n + 1) + "/2 = " + T);
      if (fr.k === 0) m.innerHTML = "Row <code>i</code> has <code>i</code> cells because the inner loop runs to <code>i</code>, not to <code>n</code>. Press <strong>play</strong>.";
      else if (fr.k < T) m.innerHTML = "Row i = " + fr.i + ", cell j = " + fr.j + ". Rows so far: 1 + 2 + … + " + (fr.i - 1) + " + " + fr.j + " = <strong>" + fr.k + "</strong>.";
      else m.innerHTML = "Done: <strong>" + fr.k + "</strong> inner-loop steps = 1 + 2 + … + " + n + " = n(n+1)/2 = <strong>" + T + "</strong> ✓ — half the n×n square, so Θ(n²).";
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return n <= 6 ? 3 : 6; } });
    player.load();
  }

  /* ============================================================
     3. aa-array-insert — insert at the front: array vs linked list
     ============================================================ */
  function arrayInsert(host) {
    U.title(host, "Animation · insert 9 at the front");
    var n = 6, o = opts(host);
    o.appendChild(seg("items already stored", [[4, "4"], [6, "6"], [10, "10"], [16, "16"]], 6, function (v) { n = v; player.load(); }));
    host.appendChild(h("p", "aa-in-line", "Input: a packed array of n = <b class='aa-n'>6</b> items and a linked list with the same items; insert the value 9 in front. Each element copy or pointer write counts as one move."));
    host.appendChild(h("div", "aa-lab", "packed array — every item must shift one slot to the right"));
    var arr = h("div", "arr aa-arr"); host.appendChild(arr);
    host.appendChild(h("div", "aa-lab aa-gap", "linked list — one new node, two pointer writes"));
    var lst = h("div", "aa-list"); host.appendChild(lst);
    var st = statRow(host, ["array moves", "list pointer writes"]);
    var m = U.msg(host);
    var vals = [];
    function build() {
      vals = []; for (var i = 0; i < n; i++) vals.push(10 + i * 3);
      var f = [{ s: 0 }];
      for (var k = n - 1; k >= 0; k--) f.push({ s: 1, k: k });    /* shift item k */
      f.push({ s: 2 });                                          /* write 9 at slot 0 */
      f.push({ s: 3 });                                          /* list: new node -> old head */
      f.push({ s: 4 });                                          /* list: head -> new node */
      return f;
    }
    function render(fr, i, frames) {
      host.querySelector(".aa-n").textContent = n;
      var moves = 0, cells = [], k;
      var shifted = fr.s === 1 ? fr.k : fr.s >= 2 ? 0 : n;  /* items with index ≥ shifted are already moved */
      if (fr.s === 1) moves = n - fr.k; else if (fr.s >= 2) moves = n + 1;
      cells.push({ t: fr.s >= 2 ? "9" : shifted === 0 ? "" : vals[0], cls: fr.s === 2 ? "gold" : "" });
      for (k = 1; k <= n; k++) {
        var moved = k - 1 >= shifted, t = moved ? vals[k - 1] : (k < n ? vals[k] : "");
        cells.push({ t: t, cls: (fr.s === 1 && k - 1 === fr.k) ? "on" : moved ? "good" : "" });
      }
      arr.innerHTML = cells.map(function (c, j) { return '<div class="cell ' + c.cls + '">' + esc(c.t) + "<small>[" + j + "]</small></div>"; }).join("");
      var lw = fr.s >= 4 ? 2 : fr.s === 3 ? 1 : 0;
      var nodes = '<span class="aa-node head' + (fr.s >= 4 ? " gold" : "") + '">head</span>';
      nodes += fr.s >= 3 ? '<span class="aa-node gold' + (fr.s === 3 ? " loose" : "") + '">9</span>' : "";
      nodes += vals.map(function (v) { return '<span class="aa-node">' + v + "</span>"; }).join("");
      lst.innerHTML = nodes; lst.className = "aa-list s" + fr.s;
      st["array moves"].set(moves); st["list pointer writes"].set(lw);
      if (fr.s === 0) m.innerHTML = "Both structures hold the same " + n + " items. The array is packed: slot 0 is taken. Press <strong>play</strong>.";
      else if (fr.s === 1) m.innerHTML = "Array: copy item " + fr.k + " into slot " + (fr.k + 1) + ". Moves so far: <strong>" + moves + "</strong>.";
      else if (fr.s === 2) m.innerHTML = "Array: slot 0 is finally free — write 9. Total <strong>" + moves + " = n + 1</strong> moves. Doubling n doubles this.";
      else if (fr.s === 3) m.innerHTML = "List: make a node for 9 and point its <code>next</code> at the old head (1 write). Nothing else moves.";
      else m.innerHTML = "List: point <code>head</code> at the new node (write 2). Total <strong>2</strong> writes for any n — O(1) versus O(n) for the array.";
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return n > 8 ? 4 : 2; } });
    player.load();
  }

  /* ============================================================
     4. aa-hash-probe — linear probing
     ============================================================ */
  function hashProbe(host) {
    U.title(host, "Animation · linear probing, h(k) = k mod m");
    var m = 7, keys = [10, 15, 3, 20, 17], lookPresent = 3, lookAbsent = 8;
    var o = opts(host);
    slider(o, "m (slots)", 5, 13, m, function (v) { m = v; player.load(); }, "Number of slots m");
    var o2 = opts(host);
    var kIn = textIn(o2, "keys", keys.join(", "), "Keys to insert, separated by commas", "12rem");
    var pIn = textIn(o2, "look up", String(lookPresent), "A key that is present", "3.5rem");
    var aIn = textIn(o2, "and", String(lookAbsent), "A key that is absent", "3.5rem");
    o2.appendChild(btn("use", "", function () {
      var v = ints(kIn.value, 9999).slice(0, 12);
      if (!v.length) { msgEl.innerHTML = "Please type at least one whole number."; return; }
      keys = v; kIn.value = keys.join(", ");
      lookPresent = ints(pIn.value, 9999)[0]; if (lookPresent == null) lookPresent = keys[0];
      lookAbsent = ints(aIn.value, 9999)[0]; if (lookAbsent == null) lookAbsent = keys[0] + 1;
      player.load();
    }));
    var inLine = h("p", "aa-in-line"); host.appendChild(inLine);
    var tbl = h("div", "arr aa-arr"); host.appendChild(tbl);
    var st = statRow(host, ["stored n", "load factor n/m", "collisions", "probes this op"]);
    var msgEl = U.msg(host);
    function build() {
      var f = [], slots = [], res = probeInsert(keys, m), coll = 0, stored = 0;
      for (var i = 0; i < m; i++) slots.push(null);
      f.push({ slots: slots.slice(), stored: 0, coll: 0, probes: [], note: "Table has m = " + m + " empty slots. Keys go to slot h(k) = k mod m; if it is taken, try the next slot (wrapping round)." });
      res.steps.forEach(function (s) {
        for (var t = 0; t < s.probes.length; t++) {
          var p = s.probes[t], hit = s.pos === p;
          if (!hit && t < s.probes.length - 1) coll++;
          if (hit) { slots[p] = s.key; stored++; }
          f.push({ slots: slots.slice(), stored: stored, coll: coll, probes: s.probes.slice(0, t + 1), cur: p, key: s.key, hit: hit, full: s.pos === null && t === s.probes.length - 1,
            note: "Insert <strong>" + s.key + "</strong>: h = " + s.key + " mod " + m + " = " + s.home + ". " +
              (t === 0 ? "" : "Probe " + (t + 1) + ": slot " + p + ". ") +
              (hit ? "Slot " + p + " is free — store it (" + (t + 1) + " probe" + (t > 0 ? "s" : "") + ")." :
                s.pos === null && t === s.probes.length - 1 ? "<strong>The table is full</strong> — the key cannot be stored." :
                "Slot " + p + " is taken by " + slots[p] + " — <strong>collision</strong>, move on.") });
        }
      });
      [[lookPresent, "present"], [lookAbsent, "absent"]].forEach(function (L) {
        var r = probeLookup(slots, L[0]);
        for (var t = 0; t < r.probes.length; t++) {
          var p = r.probes[t], last = t === r.probes.length - 1;
          f.push({ slots: slots.slice(), stored: stored, coll: coll, probes: r.probes.slice(0, t + 1), cur: p, key: L[0], look: true,
            hit: last && r.found, miss: last && !r.found,
            note: "Look up <strong>" + L[0] + "</strong> (expected " + L[1] + "): h = " + (((L[0] % m) + m) % m) + ", probe " + (t + 1) + " at slot " + p + ": " +
              (last ? (r.found ? "<strong>found</strong> after " + (t + 1) + " probe" + (t > 0 ? "s" : "") + "." : "empty slot — <strong>not in the table</strong>; " + (t + 1) + " probe" + (t > 0 ? "s" : "") + " were needed to be sure.") :
                "holds " + slots[p] + ", keep going.") });
        }
      });
      return f;
    }
    function render(fr) {
      inLine.innerHTML = "Input: m = " + m + ", keys = [" + keys.join(", ") + "], then look up " + lookPresent + " and " + lookAbsent + ".";
      tbl.innerHTML = fr.slots.map(function (v, i) {
        var cls = v === null ? "" : "good";
        if (fr.probes && fr.probes.indexOf(i) >= 0 && i !== fr.cur) cls = "bad";
        if (i === fr.cur) cls = fr.hit ? "gold" : fr.miss ? "on" : "bad";
        return '<div class="cell ' + cls + '">' + (v === null ? "·" : v) + "<small>" + i + "</small></div>";
      }).join("");
      st["stored n"].set(fr.stored); st["load factor n/m"].set((fr.stored / m).toFixed(2));
      st["collisions"].set(fr.coll); st["probes this op"].set(fr.probes.length);
      msgEl.innerHTML = fr.note;
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.4; } });
    player.load();
  }

  /* ============================================================
     5. aa-heap — array-backed min-heap
     ============================================================ */
  function heap(host) {
    U.title(host, "Animation · min-heap: insert, then extract-min");
    var vals = [9, 4, 7, 1, 8, 3], ext = 2, o = opts(host);
    var vIn = textIn(o, "insert in order", vals.join(", "), "Values to insert, separated by commas", "11rem");
    o.appendChild(btn("use", "", function () {
      var v = ints(vIn.value, 999).slice(0, 12);
      if (v.length) { vals = v; vIn.value = vals.join(", "); player.load(); } else m.innerHTML = "Please type 1 to 12 whole numbers.";
    }));
    o.appendChild(seg("then extract-min", [[0, "0"], [1, "1"], [2, "2"], [3, "3"]], ext, function (v) { ext = v; player.load(); }));
    host.appendChild(h("p", "aa-in-line", "Positions start at 1: parent of i is ⌊i/2⌋, children are 2i and 2i+1. Rule: parent ≤ children."));
    var svg = h("div", "aa-tree"); host.appendChild(svg);
    var arr = h("div", "arr aa-arr"); host.appendChild(arr);
    var st = statRow(host, ["size", "swaps this op", "swaps total"]);
    var m = U.msg(host);
    function build() {
      var a = [null], f = [], total = 0;
      f.push({ a: a.slice(), swap: null, hl: [], op: 0, total: 0, note: "Empty heap. Each insert goes to the end, then bubbles up; each extract-min takes position 1, moves the last item there and sifts it down." });
      vals.forEach(function (v) {
        var b = a.slice(); b.push(v);
        f.push({ a: b.slice(), swap: null, hl: [b.length - 1], op: 0, total: total, note: "Insert <strong>" + v + "</strong> at position " + (b.length - 1) + " (the first free slot keeps the tree complete)." });
        var sw = heapInsert(a, v), c = b.slice();
        sw.forEach(function (s, k) {
          var t = c[s[0]]; c[s[0]] = c[s[1]]; c[s[1]] = t; total++;
          f.push({ a: c.slice(), swap: s, hl: [s[0], s[1]], op: k + 1, total: total, note: "Parent at " + s[0] + " (" + c[s[1]] + ") is bigger than the child at " + s[1] + " (" + c[s[0]] + ") — <strong>swap</strong>. Bubble-up swap " + (k + 1) + "." });
        });
        f.push({ a: a.slice(), swap: null, hl: [], op: sw.length, total: total, note: "Heap property holds again after " + sw.length + " swap" + (sw.length === 1 ? "" : "s") + " (at most ⌊lg " + (a.length - 1) + "⌋ = " + Math.floor(lg(a.length - 1)) + ")." });
      });
      for (var e = 0; e < ext; e++) {
        if (a.length < 2) break;
        var min = a[1], last = a[a.length - 1];
        f.push({ a: a.slice(), swap: null, hl: [1], op: 0, total: total, note: "Extract-min: the minimum is at position 1: <strong>" + min + "</strong>." });
        var r = heapExtractMin(a), c2 = a.slice();
        /* reconstruct the state right after moving the last item to the root */
        var before = [null]; if (a.length >= 2) { before = c2.slice(); r.swaps.slice().reverse().forEach(function (s) { var t = before[s[0]]; before[s[0]] = before[s[1]]; before[s[1]] = t; }); }
        f.push({ a: before.slice(), swap: null, hl: [1], op: 0, total: total, min: min, note: "Remove " + min + "; move the last item <strong>" + last + "</strong> to position 1 and sift it down." });
        var cur = before.slice();
        r.swaps.forEach(function (s, k) {
          var t = cur[s[0]]; cur[s[0]] = cur[s[1]]; cur[s[1]] = t; total++;
          f.push({ a: cur.slice(), swap: s, hl: [s[0], s[1]], op: k + 1, total: total, min: min, note: "Smaller child at " + s[1] + " (" + cur[s[0]] + ") is below the parent at " + s[0] + " (" + cur[s[1]] + ") — <strong>swap</strong>. Sift-down swap " + (k + 1) + "." });
        });
        f.push({ a: a.slice(), swap: null, hl: [], op: r.swaps.length, total: total, min: min, note: "Extracted <strong>" + min + "</strong> with " + r.swaps.length + " swap" + (r.swaps.length === 1 ? "" : "s") + ". Both operations cost O(log n) because the tree height is ⌊lg n⌋." });
      }
      return f;
    }
    function render(fr) {
      var a = fr.a, n = a.length - 1, depth = n ? Math.floor(lg(n)) + 1 : 1;
      var W = 520, H = 40 + depth * 58, s = "<svg viewBox='0 0 " + W + " " + H + "' role='img' aria-label='heap as a binary tree'>";
      function pos(i) { var lvl = Math.floor(lg(i)), k = i - Math.pow(2, lvl), cnt = Math.pow(2, lvl); return [W * (k + 0.5) / cnt, 30 + lvl * 58]; }
      for (var i = 2; i <= n; i++) { var p = pos(i), q = pos(i >> 1); s += "<line x1='" + q[0] + "' y1='" + q[1] + "' x2='" + p[0] + "' y2='" + p[1] + "'/>"; }
      for (i = 1; i <= n; i++) {
        var pp = pos(i), cls = fr.hl.indexOf(i) >= 0 ? (fr.swap ? "swap" : "hl") : "";
        s += "<g class='" + cls + "'><circle cx='" + pp[0] + "' cy='" + pp[1] + "' r='17'/><text x='" + pp[0] + "' y='" + (pp[1] + 5) + "'>" + a[i] + "</text><text class='ix' x='" + pp[0] + "' y='" + (pp[1] - 22) + "'>" + i + "</text></g>";
      }
      svg.innerHTML = s + "</svg>";
      var cells = [];
      for (i = 1; i <= n; i++) cells.push('<div class="cell ' + (fr.hl.indexOf(i) >= 0 ? (fr.swap ? "gold" : "on") : "") + '">' + a[i] + "<small>" + i + "</small></div>");
      arr.innerHTML = cells.join("") || '<div class="cell dim">·<small>1</small></div>';
      st["size"].set(n); st["swaps this op"].set(fr.op); st["swaps total"].set(fr.total);
      m.innerHTML = fr.note + (fr.min != null ? " <span class='muted'>(taken out: " + fr.min + ")</span>" : "");
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.3; } });
    player.load();
  }

  /* ============================================================
     6. aa-bfs-grid / aa-dijkstra-grid
     ============================================================ */
  function gridSearch(mode) {
    return function (host) {
      var R = 6, C = 8, S = 0, T = R * C - 1, dij = mode === "dijkstra";
      U.title(host, dij ? "Animation · Dijkstra on a grid with terrain costs" : "Animation · breadth-first search on a grid");
      var cost = [];
      for (var i = 0; i < R * C; i++) cost.push(1);
      [10, 18, 26, 34, 13, 21, 29, 37, 45, 39].forEach(function (w) { cost[w] = 0; });
      if (dij) { cost[10] = 1; cost[18] = 1; [2, 3, 4, 11, 12, 20, 27, 28, 36, 44, 43].forEach(function (w) { cost[w] = 4; }); [5, 6, 14, 22, 30, 38].forEach(function (w) { cost[w] = 2; }); }
      host.appendChild(h("p", "aa-in-line", dij ?
        "Input: 6×8 grid, start S (top-left), target T (bottom-right). Each cell has a cost 1–5 to enter; ▮ is a wall. <strong>Click a cell</strong> to cycle its cost 1→2→3→4→5→wall. Moves go up/down/left/right." :
        "Input: 6×8 grid, start S (top-left), target T (bottom-right). <strong>Click a cell</strong> to add or remove a wall. Moves go up/down/left/right; every move costs 1."));
      var o = opts(host);
      o.appendChild(btn("clear walls", "", function () { for (var i = 0; i < R * C; i++) if (cost[i] === 0) cost[i] = 1; player.load(); }));
      var grid = h("div", "aa-grid aa-map"); grid.setAttribute("role", "group"); grid.setAttribute("aria-label", "grid map; each cell is a button");
      grid.style.gridTemplateColumns = "repeat(" + C + ", 1fr)";
      host.appendChild(grid);
      var pq = h("div", "aa-pq"); host.appendChild(pq);
      var st = statRow(host, dij ? ["settled", "relaxations", "improvements", "dist(T)"] : ["visited", "current level", "queue length", "dist(T)"]);
      var m = U.msg(host);
      var btns = [];
      for (i = 0; i < R * C; i++) {
        (function (id) {
          var b = h("button", "aa-cell"); b.type = "button";
          b.addEventListener("click", function () {
            if (id === S || id === T) return;
            cost[id] = dij ? (cost[id] + 1) % 6 : (cost[id] === 0 ? 1 : 0);
            player.load();
          });
          grid.appendChild(b); btns.push(b);
        })(i);
      }
      function build() {
        var f = [];
        if (dij) {
          var res = dijkstraGrid(cost, R, C, S), dist = [], done = [], par = [], rk = 0, imp = 0, settled = 0;
          for (var i = 0; i < R * C; i++) { dist.push(Infinity); done.push(false); par.push(-1); }
          dist[S] = 0;
          f.push({ dist: dist.slice(), done: done.slice(), par: par.slice(), cur: -1, rk: 0, imp: 0, settled: 0, note: "dist(S) = 0, everything else ∞. Repeatedly take the unsettled cell with the smallest dist from the priority queue and relax its neighbours." });
          res.order.forEach(function (u) {
            done[u] = true; settled++;
            f.push({ dist: dist.slice(), done: done.slice(), par: par.slice(), cur: u, rk: rk, imp: imp, settled: settled, note: "Pop cell " + u + " (dist " + dist[u] + ") — the smallest in the queue, so its distance is final." });
            res.relax.forEach(function (x) {
              if (x.u !== u) return;
              rk++;
              if (x.better) { dist[x.v] = x.nd; par[x.v] = u; imp++; }
              f.push({ dist: dist.slice(), done: done.slice(), par: par.slice(), cur: u, edge: x.v, rk: rk, imp: imp, settled: settled,
                note: "Relax " + u + "→" + x.v + ": " + dist[u] + " + cost " + cost[x.v] + " = " + x.nd + (x.better ? " &lt; " + (x.old === Infinity ? "∞" : x.old) + " — <strong>improve</strong> dist(" + x.v + ")." : " ≥ " + x.old + " — no change.") });
            });
          });
          f.push({ dist: dist.slice(), done: done.slice(), par: par.slice(), cur: -1, rk: rk, imp: imp, settled: settled, final: true,
            note: dist[T] < Infinity ? "Done: dist(T) = <strong>" + dist[T] + "</strong>. The gold path follows parent pointers back from T. " + rk + " relaxations for " + settled + " settled cells." : "T is not reachable — walls block every route." });
        } else {
          var r2 = bfsGrid(cost.map(function (c) { return c === 0; }), R, C, S), d2 = [], p2 = [], seen = 0, q = [S], head = 0;
          for (var j = 0; j < R * C; j++) { d2.push(-1); p2.push(-1); }
          d2[S] = 0; seen = 1;
          f.push({ dist: d2.slice(), par: p2.slice(), cur: -1, level: 0, q: 1, seen: 1, note: "Start at S with distance 0. The queue holds S. BFS visits all cells at distance 1, then 2, then 3 … (one level at a time)." });
          while (head < q.length) {
            var u = q[head++];
            neighbours(u, R, C).forEach(function (v) { if (cost[v] === 0 || d2[v] >= 0) return; d2[v] = d2[u] + 1; p2[v] = u; q.push(v); seen++; });
            f.push({ dist: d2.slice(), par: p2.slice(), cur: u, level: d2[u], q: q.length - head, seen: seen,
              note: "Dequeue cell " + u + " at distance " + d2[u] + "; its unvisited neighbours get distance " + (d2[u] + 1) + " and join the back of the queue." });
          }
          f.push({ dist: d2.slice(), par: p2.slice(), cur: -1, level: r2.dist[T], q: 0, seen: seen, final: true,
            note: r2.dist[T] >= 0 ? "Done: dist(T) = <strong>" + r2.dist[T] + "</strong> moves, the fewest possible. The gold path follows parents back from T. " + seen + " cells visited, each once: O(V + E)." : "T is not reachable — walls block every route." });
        }
        return f;
      }
      function render(fr) {
        var path = fr.final ? pathTo(fr.par, T) : [];
        if (path[0] !== S) path = [];
        var frontier = {};
        if (!dij && !fr.final) for (var k = 0; k < R * C; k++) if (fr.dist[k] === fr.level + 1) frontier[k] = 1;
        btns.forEach(function (b, id) {
          var d = fr.dist[id], wall = cost[id] === 0, cls = "aa-cell";
          if (wall) cls += " wall";
          else if (path.indexOf(id) >= 0) cls += " path";
          else if (id === fr.cur) cls += " cur";
          else if (dij ? fr.done[id] : (d >= 0 && d <= fr.level)) cls += " done";
          else if (dij ? d < Infinity : frontier[id]) cls += " front";
          if (id === fr.edge) cls += " edge";
          if (dij && !wall) cls += " t" + cost[id];
          b.className = cls;
          var label = id === S ? "S" : id === T ? "T" : "";
          var dt = wall ? "" : (d >= 0 && d < Infinity ? String(d) : "");
          b.innerHTML = "<span>" + label + "</span><b>" + dt + "</b>" + (dij && !wall ? "<i>" + cost[id] + "</i>" : "");
          b.setAttribute("aria-label", "row " + Math.floor(id / C) + " col " + (id % C) + (wall ? ", wall" : dij ? ", cost " + cost[id] : "") + (dt ? ", distance " + dt : ""));
        });
        if (dij) {
          var items = [];
          for (var q = 0; q < R * C; q++) if (!fr.done[q] && fr.dist[q] < Infinity) items.push([fr.dist[q], q]);
          items.sort(function (x, y) { return x[0] - y[0] || x[1] - y[1]; });
          pq.innerHTML = "<span class='lab'>priority queue (dist, cell):</span> " + (items.length ? items.map(function (x) { return "<code>(" + x[0] + ", " + x[1] + ")</code>"; }).join(" ") : "<span class='muted'>empty</span>");
          st["settled"].set(fr.settled); st["relaxations"].set(fr.rk); st["improvements"].set(fr.imp);
          st["dist(T)"].set(fr.dist[T] < Infinity ? fr.dist[T] : "∞");
        } else {
          pq.innerHTML = "";
          st["visited"].set(fr.seen); st["current level"].set(fr.level); st["queue length"].set(fr.q);
          st["dist(T)"].set(fr.dist[T] >= 0 ? fr.dist[T] : "?");
        }
        m.innerHTML = fr.note;
      }
      var player = U.Player(host, { build: build, render: render, fps: function () { return dij ? 3 : 2.5; } });
      player.load();
    };
  }

  /* ============================================================
     7. aa-recursion-tree — T(n) = a·T(n/b) + n^d
     ============================================================ */
  function recursionTree(host) {
    U.title(host, "Animation · the recursion tree, level by level");
    var a = 2, b = 2, d = 1, k = 3, o = opts(host);
    o.appendChild(seg("a (subproblems)", [[1, "1"], [2, "2"], [3, "3"], [4, "4"], [8, "8"]], a, function (v) { a = v; player.load(); }));
    o.appendChild(seg("b (shrink factor)", [[2, "2"], [3, "3"], [4, "4"]], b, function (v) { b = v; player.load(); }));
    var o2 = opts(host);
    o2.appendChild(seg("d (work n^d per call)", [[0, "0"], [1, "1"], [2, "2"]], d, function (v) { d = v; player.load(); }));
    o2.appendChild(seg("levels k (n = b^k)", [[2, "2"], [3, "3"], [4, "4"], [5, "5"]], k, function (v) { k = v; player.load(); }));
    var inLine = h("p", "aa-in-line"); host.appendChild(inLine);
    var tree = h("div", "aa-levels"); host.appendChild(tree);
    var wrap = h("div", "anim-table-wrap"); host.appendChild(wrap);
    var tbl = U.table(wrap, ["level i", "size n/bⁱ", "calls aⁱ", "cost aⁱ·(n/bⁱ)^d"]);
    var st = statRow(host, ["total so far", "a vs b^d", "master theorem"]);
    var m = U.msg(host);
    function build() {
      var r = recTree(a, b, d, k), f = [], run = 0;
      f.push({ r: r, upto: -1, run: 0 });
      r.levels.forEach(function (L) { run += L.cost; f.push({ r: r, upto: L.i, run: run }); });
      f.push({ r: r, upto: k, run: run, final: true });
      return f;
    }
    function render(fr) {
      var r = fr.r;
      inLine.innerHTML = "Input: T(n) = " + a + "·T(n/" + b + ") + n<sup>" + d + "</sup>, n = " + b + "<sup>" + k + "</sup> = " + r.n + ", T(1) = 1.";
      var html = "";
      r.levels.forEach(function (L) {
        if (L.i > fr.upto) return;
        var show = Math.min(L.count, 16), boxes = "";
        for (var i = 0; i < show; i++) boxes += "<i>" + (L.size >= 1 ? L.size : "") + "</i>";
        if (L.count > show) boxes += "<em>… ×" + fmt(L.count) + "</em>";
        html += '<div class="aa-lvl' + (L.i === fr.upto && !fr.final ? " cur" : "") + '"><span class="aa-lab">level ' + L.i + "</span><div class='aa-boxes'>" + boxes + "</div><span class='aa-cost'>" + nice(L.cost) + "</span></div>";
      });
      tree.innerHTML = html;
      tbl.rows(r.levels.filter(function (L) { return L.i <= fr.upto; }).map(function (L) { return [L.i, nice(L.size), nice(L.count), nice(L.count) + "·" + nice(L.size) + "^" + d + " = " + nice(L.cost)]; }), fr.final ? -1 : fr.upto);
      st["total so far"].set(nice(fr.run));
      st["a vs b^d"].set(a + (r.kase === 1 ? " < " : r.kase === 2 ? " = " : " > ") + nice(r.bd));
      st["master theorem"].set(fr.final ? "case " + r.kase + ": " + r.bound : "…");
      if (fr.upto < 0) m.innerHTML = "The root does n<sup>" + d + "</sup> work and makes " + a + " calls of size n/" + b + ". Each level: (number of calls) × (work per call). Press <strong>play</strong>.";
      else if (!fr.final) {
        var L = r.levels[fr.upto], prev = fr.upto ? r.levels[fr.upto - 1].cost : null;
        m.innerHTML = "Level " + L.i + ": " + nice(L.count) + " call" + (L.count > 1 ? "s" : "") + " of size " + nice(L.size) + ", cost " + nice(L.cost) +
          (prev == null ? "." : prev === L.cost ? " — the same as the level above." : L.cost < prev ? " — shrinking by a factor " + nice(prev / L.cost) + " per level (ratio a/b^d = " + nice(a / r.bd) + ")." : " — growing by a factor " + nice(L.cost / prev) + " per level (ratio a/b^d = " + nice(a / r.bd) + ").");
      } else {
        var why = r.kase === 1 ? "the root dominates: T(n) = Θ(n^" + d + ")." : r.kase === 2 ? "every level costs the same, and there are log n + 1 levels: T(n) = Θ(n^" + d + " log n)." : "the leaves dominate: T(n) = Θ(n^log_" + b + " " + a + ").";
        m.innerHTML = "Total = <strong>" + nice(r.total) + "</strong> cost units over " + (k + 1) + " levels. Since a = " + a + " and b^d = " + nice(r.bd) + ", this is master-theorem <strong>case " + r.kase + "</strong>: " + why;
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.2; } });
    player.load();
  }

  /* ============================================================
     8. aa-kruskal — union-find sets as colours
     ============================================================ */
  function kruskalAnim(host) {
    U.title(host, "Animation · Kruskal with union-find");
    var V = 7, P = [[60, 40], [200, 30], [340, 50], [90, 150], [230, 130], [370, 160], [160, 240]];
    var E = [[0, 1, 7], [0, 3, 5], [1, 2, 8], [1, 3, 9], [1, 4, 7], [2, 4, 5], [3, 4, 15], [3, 6, 6], [4, 6, 8], [4, 5, 9], [5, 6, 11]];
    host.appendChild(h("p", "aa-in-line", "Input: 7 vertices, 11 weighted edges (Wikipedia's Kruskal example). Edges are sorted by weight; an edge is kept only if its two ends are in different sets. Colour = union-find set."));
    var svg = h("div", "aa-graph"); host.appendChild(svg);
    var list = h("div", "aa-edges"); host.appendChild(list);
    var st = statRow(host, ["edges kept", "tree weight", "sets"]);
    var m = U.msg(host);
    function build() {
      var r = kruskal(V, E), f = [{ step: -1, r: r }];
      r.steps.forEach(function (s, i) { f.push({ step: i, r: r }); });
      f.push({ step: r.steps.length, r: r, final: true });
      return f;
    }
    var COLS = ["--accent", "--blue", "--green", "--red", "--muted", "--heading", "--text"];
    function render(fr) {
      var r = fr.r, si = Math.min(fr.step, r.steps.length - 1), sets = si >= 0 ? r.steps[si].sets : P.map(function (_, i) { return i; });
      var kept = {}, cnt = 0, w = 0;
      for (var i = 0; i <= si; i++) if (r.steps[i].accepted) { kept[r.steps[i].e.join("-")] = 1; cnt++; w = r.steps[i].total; }
      var cur = si >= 0 && !fr.final ? r.steps[si] : null;
      var s = "<svg viewBox='0 0 430 280' role='img' aria-label='graph with 7 vertices'>";
      E.forEach(function (e) {
        var k = e.join("-"), cls = kept[k] ? "keep" : cur && cur.e === e ? (cur.accepted ? "keep" : "rej") : "";
        var mx = (P[e[0]][0] + P[e[1]][0]) / 2, my = (P[e[0]][1] + P[e[1]][1]) / 2;
        s += "<line class='" + cls + "' x1='" + P[e[0]][0] + "' y1='" + P[e[0]][1] + "' x2='" + P[e[1]][0] + "' y2='" + P[e[1]][1] + "'/><text class='w' x='" + mx + "' y='" + (my - 4) + "'>" + e[2] + "</text>";
      });
      P.forEach(function (p, v) {
        var roots = []; sets.forEach(function (x) { if (roots.indexOf(x) < 0) roots.push(x); });
        s += "<g style='--set:var(" + COLS[roots.indexOf(sets[v]) % COLS.length] + ")'><circle cx='" + p[0] + "' cy='" + p[1] + "' r='16'/><text x='" + p[0] + "' y='" + (p[1] + 5) + "'>" + "ABCDEFG"[v] + "</text></g>";
      });
      svg.innerHTML = s + "</svg>";
      list.innerHTML = r.sorted.map(function (e, i) {
        var cls = i < si || (i === si && fr.final) ? (r.steps[i].accepted ? "keep" : "rej") : i === si ? "cur" : "";
        return "<span class='" + cls + "'>" + "ABCDEFG"[e[0]] + "–" + "ABCDEFG"[e[1]] + " " + e[2] + "</span>";
      }).join("");
      var nsets = []; sets.forEach(function (x) { if (nsets.indexOf(x) < 0) nsets.push(x); });
      st["edges kept"].set(cnt + " / " + (V - 1)); st["tree weight"].set(w); st["sets"].set(nsets.length);
      if (fr.step < 0) m.innerHTML = "Every vertex starts in its own set (7 colours). Edges sorted: " + r.sorted.map(function (e) { return e[2]; }).join(", ") + ". Press <strong>play</strong>.";
      else if (!fr.final) m.innerHTML = "Edge " + "ABCDEFG"[cur.e[0]] + "–" + "ABCDEFG"[cur.e[1]] + " (weight " + cur.e[2] + "): " + (cur.accepted ? "ends are in <strong>different sets</strong> — keep it and <strong>union</strong> the two sets." : "both ends already in the <strong>same set</strong> — it would close a cycle, <strong>reject</strong>.");
      else m.innerHTML = "Done: " + cnt + " edges = V − 1, total weight <strong>" + w + "</strong>. Sorting costs O(E log E); each find/union is almost constant, so the scan of E edges is cheap.";
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 1.2; } });
    player.load();
  }

  /* ============================================================
     9. aa-dp-edit — edit distance table
     ============================================================ */
  function dpEdit(host) {
    U.title(host, "Animation · edit distance, one cell at a time");
    var s = "kitten", t = "sitting", o = opts(host);
    var sIn = textIn(o, "word 1", s, "First word (up to 8 letters)", "6rem");
    var tIn = textIn(o, "word 2", t, "Second word (up to 8 letters)", "6rem");
    o.appendChild(btn("use", "", function () {
      var a = sIn.value.replace(/\s/g, "").slice(0, 8), b = tIn.value.replace(/\s/g, "").slice(0, 8);
      if (!a || !b) { m.innerHTML = "Please type two non-empty words."; return; }
      s = a; t = b; sIn.value = s; tIn.value = t; player.load();
    }));
    host.appendChild(h("p", "aa-in-line", "D[i][j] = distance between the first i letters of word 1 and the first j letters of word 2. D[i][j] = min( D[i−1][j−1] + [letters differ], D[i−1][j] + 1, D[i][j−1] + 1 )."));
    var wrap = h("div", "anim-table-wrap"); host.appendChild(wrap);
    var tbl = h("table", "anim-table aa-dp"); wrap.appendChild(tbl);
    var st = statRow(host, ["cells filled", "of (m+1)(n+1)", "distance"]);
    var m = U.msg(host);
    function build() {
      var r = editDistance(s, t), f = [], cells = [];
      for (var i = 0; i <= s.length; i++) for (var j = 0; j <= t.length; j++) cells.push([i, j]);
      f.push({ r: r, k: 0 });
      cells.forEach(function (c, k) { f.push({ r: r, k: k + 1, i: c[0], j: c[1] }); });
      f.push({ r: r, k: cells.length, final: true });
      return f;
    }
    function render(fr) {
      var D = fr.r.D, W = t.length + 1, html = "<thead><tr><th></th><th>ε</th>" + t.split("").map(function (ch) { return "<th>" + esc(ch) + "</th>"; }).join("") + "</tr></thead><tbody>";
      var trace = {};
      if (fr.final) {
        var i = s.length, j = t.length;
        while (i > 0 || j > 0) {
          trace[i + "," + j] = 1;
          if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1)) { i--; j--; }
          else if (i > 0 && D[i][j] === D[i - 1][j] + 1) i--; else j--;
        }
        trace["0,0"] = 1;
      }
      for (i = 0; i <= s.length; i++) {
        html += "<tr><th>" + (i ? esc(s[i - 1]) : "ε") + "</th>";
        for (j = 0; j <= t.length; j++) {
          var idx = i * W + j + 1, cls = "";
          if (idx === fr.k && !fr.final) cls = "cur";
          else if (idx < fr.k || fr.final) cls = "done";
          if (!fr.final && idx === fr.k && i > 0 && j > 0) { /* mark the three sources */ }
          if (trace[i + "," + j]) cls += " path";
          var src = !fr.final && fr.i > 0 && fr.j > 0 && ((i === fr.i - 1 && (j === fr.j - 1 || j === fr.j)) || (i === fr.i && j === fr.j - 1));
          html += "<td class='" + cls + (src ? " src" : "") + "'>" + (idx <= fr.k ? D[i][j] : "") + "</td>";
        }
        html += "</tr>";
      }
      tbl.innerHTML = html + "</tbody>";
      st["cells filled"].set(fr.k); st["of (m+1)(n+1)"].set((s.length + 1) + "×" + (t.length + 1) + " = " + (s.length + 1) * (t.length + 1));
      st["distance"].set(fr.final ? fr.r.dist : "…");
      if (fr.k === 0) m.innerHTML = "Row 0 and column 0 are the base cases: turning a prefix into the empty word costs one deletion per letter. Press <strong>play</strong>.";
      else if (fr.final) m.innerHTML = "Done: edit distance(" + esc(s) + ", " + esc(t) + ") = <strong>" + fr.r.dist + "</strong>. The gold cells trace one cheapest edit sequence back to the corner. Work: one min per cell, Θ(m·n).";
      else if (fr.i === 0 || fr.j === 0) m.innerHTML = "Base case D[" + fr.i + "][" + fr.j + "] = " + D[fr.i][fr.j] + ".";
      else {
        var same = s[fr.i - 1] === t[fr.j - 1];
        m.innerHTML = "D[" + fr.i + "][" + fr.j + "]: letters '" + esc(s[fr.i - 1]) + "' and '" + esc(t[fr.j - 1]) + "' " + (same ? "match (substitute cost 0)" : "differ (substitute cost 1)") +
          ": min(" + D[fr.i - 1][fr.j - 1] + " + " + (same ? 0 : 1) + ", " + D[fr.i - 1][fr.j] + " + 1, " + D[fr.i][fr.j - 1] + " + 1) = <strong>" + D[fr.i][fr.j] + "</strong>.";
      }
    }
    var player = U.Player(host, { build: build, render: render, fps: function () { return 2.5; } });
    player.load();
  }

  window.AAAnim.register("aa-growth", growth);
  window.AAAnim.register("aa-nested", nested);
  window.AAAnim.register("aa-array-insert", arrayInsert);
  window.AAAnim.register("aa-hash-probe", hashProbe);
  window.AAAnim.register("aa-heap", heap);
  window.AAAnim.register("aa-bfs-grid", gridSearch("bfs"));
  window.AAAnim.register("aa-dijkstra-grid", gridSearch("dijkstra"));
  window.AAAnim.register("aa-recursion-tree", recursionTree);
  window.AAAnim.register("aa-kruskal", kruskalAnim);
  window.AAAnim.register("aa-dp-edit", dpEdit);
})();
