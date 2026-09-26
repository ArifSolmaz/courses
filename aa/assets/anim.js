/* ============================================================
   AA — "Try it yourself" animations
   Drop a host element anywhere:  <div class="widget anim" data-anim="NAME"></div>
   Names (week 1): max-scan, guess-race, letter-sort, hunt-assumption,
                   doublings, literal-robot
   Weeks 2–14 live in anim-wN.js and register via AAAnim.register(name, fn),
   using the shared helpers on AAAnim.ui (Player, CodeTrace, LineChart, …).
   No dependencies. Works with the light/dark tokens in style.css.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tiny helpers ---------- */
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, onClick, title) {
    var b = h("button", cls || "", label);
    b.type = "button";
    if (title) { b.title = title; b.setAttribute("aria-label", title); }
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }
  function seg(label, options, value, onChange) {
    var wrap = h("span", "");
    wrap.appendChild(h("span", "lab", label));
    var s = h("span", "seg");
    s.setAttribute("role", "group");
    s.setAttribute("aria-label", label);
    options.forEach(function (o) {
      var b = btn(o[1], "", function () {
        s.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        onChange(o[0]);
      });
      b.setAttribute("aria-pressed", String(o[0] === value));
      s.appendChild(b);
    });
    wrap.appendChild(s);
    return wrap;
  }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(lo, hi, k) {           /* k distinct ints in [lo, hi] */
    var pool = [];
    for (var i = lo; i <= hi; i++) pool.push(i);
    return shuffle(pool).slice(0, k);
  }
  function cssVar(el, name) { return getComputedStyle(el).getPropertyValue(name).trim(); }
  function stat(label) {
    var s = h("span", "anim-stat", label + "<b>0</b>");
    return { el: s, set: function (v) { s.querySelector("b").textContent = v; } };
  }
  function title(host, text) { host.appendChild(h("p", "anim-title", text)); }
  function msg(host) {
    var p = h("p", "anim-msg");
    p.setAttribute("aria-live", "polite");
    host.appendChild(p);
    return p;
  }

  /* ---------- generic frame player ----------
     cfg.build()            -> array of frames (full snapshots)
     cfg.render(frame, i, frames)
     cfg.fps()              -> frames per second at 1x                       */
  function Player(host, cfg) {
    var bar = h("div", "anim-controls");
    var frames = [], i = 0, playing = false, raf = 0, last = 0, acc = 0, speed = 1;
    var bReset = btn("&#8634;", "", function () { stop(); i = 0; draw(); }, "Back to start");
    var bBack  = btn("&#8249; step", "", function () { stop(); if (i > 0) { i--; draw(); } }, "Step back");
    var bPlay  = btn("&#9654; play", "primary", toggle, "Play or pause");
    var bStep  = btn("step &#8250;", "", function () { stop(); if (i < frames.length - 1) { i++; draw(); } }, "Step forward");
    var sel = h("select");
    sel.setAttribute("aria-label", "Speed");
    [["0.5", "0.5×"], ["1", "1×"], ["2", "2×"], ["4", "4×"]].forEach(function (o) {
      var op = h("option", "", o[1]); op.value = o[0]; if (o[0] === "1") op.selected = true; sel.appendChild(op);
    });
    sel.addEventListener("change", function () { speed = parseFloat(sel.value); });
    var scrub = h("input", "aa-scrub"); scrub.type = "range"; scrub.min = "0"; scrub.step = "1";
    scrub.setAttribute("aria-label", "Animation step");
    scrub.addEventListener("input", function () { stop(); (host.closest("[data-anim]") || host).classList.add("aa-scrubbing"); i = Number(scrub.value); draw(); });
    scrub.addEventListener("keydown", function (event) {
      if (event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      scrub.value = event.key === "Home" ? "0" : scrub.max;
      scrub.dispatchEvent(new Event("input", { bubbles: true }));
    });
    var count = h("span", "anim-count");
    [bReset, bBack, bPlay, bStep, sel, scrub, count].forEach(function (x) { bar.appendChild(x); });
    host.appendChild(bar);

    function draw() {
      scrub.max = String(Math.max(0, frames.length - 1)); scrub.value = String(i);
      if (!frames.length) { count.textContent = "no steps yet"; bPlay.innerHTML = "&#9654; play"; return; }   /* e.g. play pressed before the keys were dropped */
      cfg.render(frames[i], i, frames);
      count.textContent = "step " + i + " / " + (frames.length - 1);
      bBack.disabled = bReset.disabled = i === 0;
      bStep.disabled = i >= frames.length - 1;
      bPlay.innerHTML = playing ? "&#10074;&#10074; pause" : (i >= frames.length - 1 ? "&#8634; replay" : "&#9654; play");
    }
    function loop(t) {
      if (!playing) return;
      if (!last) last = t;
      acc += (t - last) / 1000 * cfg.fps(i, frames) * speed;
      last = t;
      var moved = false;
      while (acc >= 1 && i < frames.length - 1) { i++; acc -= 1; moved = true; }
      if (i >= frames.length - 1) playing = false;
      if (moved || !playing) draw();
      if (playing) raf = requestAnimationFrame(loop);
    }
    function play() {
      (host.closest("[data-anim]") || host).classList.remove("aa-scrubbing");
      if (i >= frames.length - 1) i = 0;
      playing = true; last = 0; acc = 1;          /* first step happens immediately */
      draw();
      raf = requestAnimationFrame(loop);
    }
    function stop() { playing = false; cancelAnimationFrame(raf); }
    function toggle() { if (playing) { stop(); draw(); } else play(); }
    function load() { stop(); frames = cfg.build(); i = 0; draw(); }
    new MutationObserver(function () { if (frames.length) draw(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    var root = host.closest("[data-anim]") || host;
    root.addEventListener("aa:pause", function () { stop(); if (frames.length) draw(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { stop(); if (frames.length) draw(); } });
    return { load: load, stop: stop, el: bar };
  }

  /* ============================================================
     1. max-scan — find the largest card, one look at a time
     ============================================================ */
  function maxScan(host) {
    var n = 10, values = [];
    title(host, "Animation · find the largest, remembering one number");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("cards", [[10, "10"], [100, "100"], [1000, "1000"]], 10, function (v) { n = v; setup(); }));
    opts.appendChild(btn("new cards", "", function () { setup(); }));
    var guessLab = h("span", "lab", "your prediction:");
    var guess = h("input"); guess.type = "number"; guess.min = "0"; guess.placeholder = "turns?";
    guess.setAttribute("aria-label", "Predicted number of turns");
    opts.appendChild(guessLab); opts.appendChild(guess);
    host.appendChild(opts);

    var stage = h("div", "");
    host.appendChild(stage);
    var reg = h("div", "mx-register");
    var slot = h("div", "mx-slot", "—");
    reg.appendChild(h("span", "lab muted", "biggest so far"));
    reg.appendChild(slot);
    host.appendChild(reg);
    var stats = h("div", "anim-stats");
    var sTurn = stat("cards turned"), sUp = stat("times the memory changed");
    stats.appendChild(sTurn.el); stats.appendChild(sUp.el);
    host.appendChild(stats);
    var m = msg(host);

    var cards = [], canvas = null, ctx = null, lastBest = -1;

    function setup() {
      values = sample(1, n <= 10 ? 99 : 9999, n);
      stage.innerHTML = ""; cards = []; canvas = null;
      if (n <= 10) {
        var g = h("div", "mx-cards");
        values.forEach(function (v) {
          var c = h("div", "mx-card", "<span>" + v + "</span>");
          g.appendChild(c); cards.push(c);
        });
        stage.appendChild(g);
      } else {
        var cols = n === 100 ? 20 : 50, rows = n / cols, cell = 20;
        canvas = h("canvas");
        canvas.width = cols * cell; canvas.height = rows * cell;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", n + " face-down cards in a grid; they are turned over one by one");
        canvas._cols = cols; canvas._cell = cell;
        ctx = canvas.getContext("2d");
        stage.appendChild(canvas);
      }
      player.load();
    }

    function build() {
      var f = [{ k: 0, best: -1, ups: 0 }], best = -1, ups = 0;
      for (var k = 0; k < n; k++) {
        if (best < 0 || values[k] > values[best]) { best = k; ups++; }
        f.push({ k: k + 1, best: best, ups: ups });
      }
      return f;
    }

    function render(fr) {
      var cur = fr.k - 1;
      if (cards.length) {
        cards.forEach(function (c, j) {
          c.className = "mx-card" + (j < fr.k ? " up" : "") + (j < cur ? " seen" : "") +
            (j === cur ? " cur" : "") + (j === fr.best ? " best" : "");
        });
      } else if (ctx) {
        var cols = canvas._cols, cell = canvas._cell;
        var cBg = cssVar(host, "--bg-soft"), cDown = cssVar(host, "--surface-2"),
            cSeen = cssVar(host, "--border-strong"), cCur = cssVar(host, "--blue"), cBest = cssVar(host, "--accent");
        ctx.fillStyle = cBg; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var j = 0; j < n; j++) {
          var x = (j % cols) * cell, y = Math.floor(j / cols) * cell;
          ctx.fillStyle = j === fr.best ? cBest : j === cur ? cCur : j < fr.k ? cSeen : cDown;
          ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        }
      }
      var bv = fr.best >= 0 ? values[fr.best] : "—";
      if (String(slot.textContent) !== String(bv)) {
        slot.textContent = bv;
        if (fr.best !== lastBest && fr.best >= 0 && !REDUCED) {
          slot.classList.remove("bump"); void slot.offsetWidth; slot.classList.add("bump");
        }
      }
      lastBest = fr.best;
      sTurn.set(fmt(fr.k) + " / " + fmt(n));
      sUp.set(fr.ups);

      if (fr.k === 0) {
        m.innerHTML = "Every card is face down. Type how many turns you think you need, then press <strong>play</strong>.";
      } else if (fr.k < n) {
        m.innerHTML = "Turned card " + fmt(fr.k) + ": <strong>" + values[cur] + "</strong>. " +
          (fr.best === cur ? "Bigger than anything so far — replace the remembered number." : "Not bigger — keep the remembered number.") +
          " <span class='muted'>Could the largest still be among the " + fmt(n - fr.k) + " unturned cards? Yes.</span>";
      } else {
        var p = parseInt(guess.value, 10), verdict = "";
        if (!isNaN(p)) verdict = p === n ? " Your prediction was exactly right." : " You predicted " + fmt(p) + ".";
        m.innerHTML = "Done: the largest is <strong>" + values[fr.best] + "</strong> (card " + fmt(fr.best + 1) +
          "). It took <strong>" + fmt(n) + " turns for " + fmt(n) + " cards</strong> — one look per card, and no card could be skipped." + verdict;
      }
    }

    var player = Player(host, {
      build: build, render: render,
      fps: function () { return n === 10 ? 1.6 : n === 100 ? 14 : 110; }
    });
    setup();
  }

  /* ============================================================
     2. guess-race — counting up vs halving
     ============================================================ */
  function guessRace(host) {
    var N = 100, secret = 73;
    title(host, "Animation · two players, same secret number");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("range 1 to", [[100, "100"], [200, "200"], [1000, "1000"]], 100, function (v) {
      N = v; slider.max = String(N); if (secret > N) secret = N; slider.value = String(secret); sync(); player.load();
    }));
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var slider = h("input"); slider.type = "range"; slider.min = "1"; slider.max = "100"; slider.value = "73";
    slider.setAttribute("aria-label", "Secret number");
    var sv = h("span", "lab", "");
    opts2.appendChild(h("span", "lab", "secret number"));
    opts2.appendChild(slider); opts2.appendChild(sv);
    opts2.appendChild(btn("random", "", function () { secret = 1 + Math.floor(Math.random() * N); slider.value = String(secret); sync(); player.load(); }));
    opts2.appendChild(btn("worst case", "", function () { secret = worst(N); slider.value = String(secret); sync(); player.load(); },
      "Pick a secret number that makes both players take their longest"));
    host.appendChild(opts2);
    slider.addEventListener("input", function () { secret = parseInt(slider.value, 10); sync(); player.load(); });
    function sync() { sv.textContent = String(secret); }

    function lane(name) {
      var l = h("div", "gr-lane");
      var head = h("div", "gr-head");
      var who = h("span", "who", name), ans = h("span", "gr-ans", ""), cnt = h("span", "", "");
      head.appendChild(who); head.appendChild(ans); head.appendChild(cnt);
      var tr = h("div", "gr-track");
      var dl = h("div", "gr-dead"), dr = h("div", "gr-dead"), sec = h("div", "gr-secret"), mk = h("div", "gr-mark");
      [sec, dl, dr, mk].forEach(function (x) { tr.appendChild(x); });
      var sc = h("div", "gr-scale", "<span>1</span><span></span>");
      l.appendChild(head); l.appendChild(tr); l.appendChild(sc);
      host.appendChild(l);
      return { ans: ans, cnt: cnt, dl: dl, dr: dr, sec: sec, mk: mk, sc: sc };
    }
    var A = lane("A · count up: 1, 2, 3 …");
    var B = lane("B · halve: always guess the middle");
    var stats = h("div", "anim-stats");
    var sWorst = stat("worst case A / B");
    stats.appendChild(sWorst.el); host.appendChild(stats);
    var m = msg(host);

    function halving(N, s) {
      var lo = 1, hi = N, out = [];
      while (true) {
        var g = Math.floor((lo + hi) / 2);
        if (g === s) { out.push({ g: g, a: "correct", lo: g, hi: g }); break; }
        if (g < s) lo = g + 1; else hi = g - 1;
        out.push({ g: g, a: g < s ? "higher" : "lower", lo: lo, hi: hi });
      }
      return out;
    }
    function worst(N) {
      var best = 1, len = 0;
      for (var s = N; s >= 1; s--) { var L = halving(N, s).length; if (L > len) { len = L; best = s; } }
      return best;              /* largest secret among the halving worst cases → counting up is slow too */
    }
    function counting(s) {
      var out = [];
      for (var g = 1; g <= s; g++) out.push(g === s ? { g: g, a: "correct", lo: g, hi: g } : { g: g, a: "higher", lo: g + 1, hi: N });
      return out;
    }
    var hA = [], hB = [];
    function build() {
      hA = counting(secret); hB = halving(N, secret);
      var T = Math.max(hA.length, hB.length), f = [];
      for (var t = 0; t <= T; t++) f.push({ t: t });
      var wB = 0;
      for (var s = 1; s <= N; s++) wB = Math.max(wB, halving(N, s).length);
      sWorst.set(fmt(N) + " / " + wB);
      return f;
    }
    function pct(x) { return ((x - 1) / N) * 100; }
    function paint(L, hist, t) {
      L.sc.lastChild.textContent = fmt(N);
      L.sec.style.left = ((secret - 0.5) / N * 100) + "%";
      var k = Math.min(t, hist.length);
      if (k === 0) {
        L.dl.style.width = "0%"; L.dr.style.left = "100%"; L.dr.style.width = "0%";
        L.mk.style.display = "none"; L.ans.textContent = ""; L.ans.className = "gr-ans"; L.cnt.textContent = "0 guesses";
        return;
      }
      var e = hist[k - 1];
      L.dl.style.left = "0%"; L.dl.style.width = pct(e.lo) + "%";
      L.dr.style.left = (e.hi / N * 100) + "%"; L.dr.style.width = ((N - e.hi) / N * 100) + "%";
      L.mk.style.display = "block";
      L.mk.style.left = ((e.g - 0.5) / N * 100) + "%";
      L.mk.setAttribute("data-g", e.g);
      L.mk.classList.toggle("flip", e.g > N * 0.8);
      L.ans.textContent = "guess " + e.g + " → " + e.a;
      L.ans.className = "gr-ans " + e.a;
      L.cnt.textContent = k + (k === 1 ? " guess" : " guesses") + (k === hist.length ? " ✓" : "");
    }
    function render(fr) {
      paint(A, hA, fr.t); paint(B, hB, fr.t);
      var t = fr.t, doneA = t >= hA.length, doneB = t >= hB.length;
      if (t === 0) m.innerHTML = "Green = numbers still possible. Striped = ruled out. Press <strong>play</strong> and watch how much each guess throws away.";
      else if (doneB && !doneA) m.innerHTML = "B has already found <strong>" + secret + "</strong> in " + hB.length + " guesses. A is still going — each of its guesses rules out only one number.";
      else if (doneA && doneB) m.innerHTML = "Final score: A needed <strong>" + hA.length + "</strong>, B needed <strong>" + hB.length + "</strong>. " +
        "Switch the range to 200 or 1000: A's worst case grows with the range, B's grows by one guess per doubling.";
      else m.innerHTML = "Each B guess cuts the green region roughly in half; each A guess shaves off a single number.";
    }
    var player = Player(host, {
      build: build, render: render,
      fps: function (i, frames) {
        if (i < hB.length) return 1.3;                       /* watch the halving closely */
        var rest = frames.length - 1 - hB.length;
        return Math.min(40, Math.max(2, rest / 4));           /* then finish A in ~4 s */
      }
    });
    sync(); player.load();
  }

  /* ============================================================
     3. letter-sort — compare two, swap, repeat (the hint's method)
     ============================================================ */
  function letterSort(host) {
    var start = ["A", "C", "E", "B", "D"];
    title(host, "Animation · follow the instructions literally");
    host.appendChild(h("p", "muted", "<small>Rule being followed: compare neighbours left to right and swap if out of order; if a pass made any swap, start again from the left.</small>"));
    var opts = h("div", "anim-opts");
    var mode = "watch";
    opts.appendChild(seg("mode", [["watch", "watch it"], ["you", "you be the machine"]], "watch", function (v) { mode = v; reset(); }));
    var inp = h("input"); inp.type = "text"; inp.value = start.join(""); inp.maxLength = 6;
    inp.setAttribute("aria-label", "Letters to sort (up to 6, all different)");
    inp.style.cssText = "font-family:var(--font-mono);font-size:.8rem;width:6.5rem;padding:.38rem .6rem;border-radius:8px;border:1px solid var(--border-strong);background:var(--surface-2);color:var(--text);text-transform:uppercase";
    opts.appendChild(h("span", "lab", "letters"));
    opts.appendChild(inp);
    opts.appendChild(btn("use", "", function () {
      var s = inp.value.toUpperCase().replace(/[^A-Z]/g, "").split("");
      var uniq = s.filter(function (c, i) { return s.indexOf(c) === i; });
      if (uniq.length >= 3) { start = uniq.slice(0, 6); inp.value = start.join(""); reset(); }
      else { m.innerHTML = "Please type 3 to 6 <strong>different</strong> letters."; }
    }));
    opts.appendChild(btn("shuffle", "", function () { start = shuffle(start.slice()); inp.value = start.join(""); reset(); }));
    host.appendChild(opts);

    var row = h("div", "bs-row");
    host.appendChild(row);
    var you = h("div", "bs-you");
    var bSwap = btn("swap them", "primary", function () { answer(true); });
    var bKeep = btn("leave them", "", function () { answer(false); });
    you.appendChild(bSwap); you.appendChild(bKeep);
    host.appendChild(you);
    var stats = h("div", "anim-stats");
    var sCmp = stat("comparisons"), sSw = stat("swaps"), sPass = stat("pass");
    [sCmp, sSw, sPass].forEach(function (s) { stats.appendChild(s.el); });
    host.appendChild(stats);
    var m = msg(host);
    var tiles = {};

    function build() {
      var a = start.slice(), f = [], c = 0, s = 0, pass = 0;
      f.push({ a: a.slice(), i: -1, kind: "start", c: 0, s: 0, pass: 0 });
      var swapped = true;
      while (swapped) {
        swapped = false; pass++;
        for (var i = 0; i < a.length - 1; i++) {
          c++;
          f.push({ a: a.slice(), i: i, kind: "cmp", c: c, s: s, pass: pass });
          if (a[i] > a[i + 1]) {
            var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; s++; swapped = true;
            f.push({ a: a.slice(), i: i, kind: "swp", c: c, s: s, pass: pass });
          } else {
            f.push({ a: a.slice(), i: i, kind: "keep", c: c, s: s, pass: pass });
          }
        }
        f.push({ a: a.slice(), i: -1, kind: swapped ? "again" : "done", c: c, s: s, pass: pass });
      }
      return f;
    }

    function layout(fr) {
      var n = fr.a.length, w = 100 / n;
      row.style.maxWidth = (n * 92) + "px";
      Object.keys(tiles).forEach(function (k) { if (fr.a.indexOf(k) < 0) { row.removeChild(tiles[k]); delete tiles[k]; } });
      fr.a.forEach(function (ch, j) {
        var t = tiles[ch];
        if (!t) { t = h("div", "bs-tile", ch); tiles[ch] = t; row.appendChild(t); }
        t.style.width = (w - 3) + "%";
        t.style.left = (j * w + 1.5) + "%";
        var inPair = fr.i >= 0 && (j === fr.i || j === fr.i + 1);
        t.className = "bs-tile" + (inPair && fr.kind === "cmp" ? " cmp" : "") +
          (inPair && fr.kind === "swp" ? " swp" : "") + (inPair && fr.kind === "keep" ? " ok" : "") +
          (fr.kind === "done" ? " ok" : "");
      });
      sCmp.set(fr.c); sSw.set(fr.s); sPass.set(fr.pass);
    }
    function words(fr) {
      var x = fr.a[fr.i], y = fr.a[fr.i + 1];
      switch (fr.kind) {
        case "start": return "Start: " + fr.a.join(" ") + ". Press <strong>play</strong>, or step through one instruction at a time.";
        case "cmp":   return "Compare <strong>" + x + "</strong> and <strong>" + y + "</strong>. Are they out of alphabetical order?";
        case "swp":   return "Yes — they were out of order, so swap them. Now: " + fr.a.join(" ") + ".";
        case "keep":  return "No — <strong>" + x + "</strong> already comes before <strong>" + y + "</strong>. Leave them and move one place right.";
        case "again": return "End of pass " + fr.pass + ". A swap happened during this pass, so the rule says: <strong>start over from the left</strong>.";
        case "done":  return "Pass " + fr.pass + " made no swaps, so we stop. Sorted with <strong>" + fr.c + " comparisons</strong> and " + fr.s + " swaps. " +
          "Notice the last pass only checked that nothing was left to do — the rule needs it to know when to stop.";
      }
    }
    var player = Player(host, {
      build: build,
      render: function (fr) { layout(fr); m.innerHTML = words(fr); },
      fps: function () { return 1.4; }
    });

    /* "you be the machine" mode */
    var yf = [], yi = 0, mistakes = 0, busy = false;
    function youShow() {
      /* skip to the next compare frame */
      while (yi < yf.length && yf[yi].kind !== "cmp" && yf[yi].kind !== "done") yi++;
      var fr = yf[yi];
      layout(fr);
      if (fr.kind === "done") {
        you.classList.remove("on");
        m.innerHTML = "Sorted! <strong>" + fr.c + " comparisons</strong>, " + fr.s + " swaps, " + fr.pass + " passes, " +
          (mistakes ? mistakes + " slip" + (mistakes > 1 ? "s" : "") + " along the way." : "and you never improvised once.");
      } else {
        you.classList.add("on");
        m.innerHTML = (fr.pass > 1 && fr.i === 0 ? "New pass (a swap happened last time). " : "") +
          "You can only look at the two raised letters: <strong>" + fr.a[fr.i] + "</strong> and <strong>" + fr.a[fr.i + 1] + "</strong>. What does the rule say?";
      }
    }
    function answer(saysSwap) {
      if (busy) return;
      var fr = yf[yi], should = fr.a[fr.i] > fr.a[fr.i + 1];
      if (saysSwap !== should) {
        mistakes++;
        m.innerHTML = "Not quite — " + (should ? "<strong>" + fr.a[fr.i] + "</strong> comes after <strong>" + fr.a[fr.i + 1] + "</strong>, so they must swap."
          : "<strong>" + fr.a[fr.i] + "</strong> already comes first, so they stay.") + " Try again.";
        return;
      }
      yi++;                  /* to the swp/keep frame */
      layout(yf[yi]);
      yi++;
      busy = true;
      setTimeout(function () { busy = false; youShow(); }, REDUCED ? 0 : 450);
    }
    function reset() {
      player.stop();
      if (mode === "watch") { you.classList.remove("on"); player.el.style.display = ""; player.load(); }
      else { player.el.style.display = "none"; yf = build(); yi = 0; mistakes = 0; youShow(); }
    }
    reset();
  }

  /* ============================================================
     4. hunt-assumption — halving on a sorted vs a shuffled pile
     ============================================================ */
  function huntAssumption(host) {
    var TARGET = 42, K = 15, mode = "sorted", pile = [];
    title(host, "Animation · look for card 42, following the instruction word for word");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("method", [["sorted", "halving · sorted pile"], ["shuffled", "halving · shuffled pile"], ["linear", "one by one · shuffled"]], mode,
      function (v) { mode = v; setup(false); }));
    opts.appendChild(btn("new pile", "", function () { setup(true); }));
    host.appendChild(opts);
    var idx = h("div", "ha-idx");
    for (var q = 1; q <= K; q++) idx.appendChild(h("span", "", q));
    host.appendChild(idx);
    var grid = h("div", "ha-cards");
    host.appendChild(grid);
    var stats = h("div", "anim-stats");
    var sLook = stat("cards opened"), sLeft = stat("cards still in play");
    stats.appendChild(sLook.el); stats.appendChild(sLeft.el); host.appendChild(stats);
    var m = msg(host);
    var values = [], shuffled = [], cards = [];

    function halvingFrames(arr) {
      var lo = 0, hi = arr.length - 1, opened = [], f = [];
      f.push({ lo: lo, hi: hi, mid: -1, opened: [], note: "start" });
      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2);
        opened = opened.concat([mid]);
        f.push({ lo: lo, hi: hi, mid: mid, opened: opened, note: "look" });
        if (arr[mid] === TARGET) { f.push({ lo: mid, hi: mid, mid: mid, opened: opened, note: "found" }); return f; }
        if (arr[mid] > TARGET) hi = mid - 1; else lo = mid + 1;
        f.push({ lo: lo, hi: hi, mid: mid, opened: opened, note: arr[mid] > TARGET ? "dropR" : "dropL", seen: arr[mid] });
      }
      f.push({ lo: lo, hi: hi, mid: -1, opened: opened, note: "fail" });
      f.push({ lo: lo, hi: hi, mid: -1, opened: opened, note: "reveal" });
      return f;
    }
    function fails(arr) { var f = halvingFrames(arr); return f[f.length - 1].note === "reveal"; }

    function setup(fresh) {
      if (fresh || !values.length) {
        values = sample(1, 99, K - 1).filter(function (v) { return v !== TARGET; }).slice(0, K - 1);
        while (values.length < K - 1) { var r = 1 + Math.floor(Math.random() * 99); if (r !== TARGET && values.indexOf(r) < 0) values.push(r); }
        values.push(TARGET);
        values.sort(function (a, b) { return a - b; });
        var tries = 0;
        do { shuffled = shuffle(values.slice()); tries++; } while (!fails(shuffled) && tries < 500);
      }
      pile = mode === "sorted" ? values : shuffled;
      grid.innerHTML = ""; cards = [];
      pile.forEach(function (v) { var c = h("div", "ha-card", v); grid.appendChild(c); cards.push(c); });
      player.load();
    }

    function build() {
      if (mode !== "linear") return halvingFrames(pile);
      var f = [{ lo: 0, hi: K - 1, mid: -1, opened: [], note: "lstart" }], op = [];
      for (var i = 0; i < K; i++) {
        op = op.concat([i]);
        f.push({ lo: i, hi: K - 1, mid: i, opened: op, note: pile[i] === TARGET ? "lfound" : "lnext", seen: pile[i] });
        if (pile[i] === TARGET) break;
      }
      return f;
    }

    function render(fr) {
      var reveal = fr.note === "reveal";
      var linear = mode === "linear";
      cards.forEach(function (c, j) {
        var open = fr.opened.indexOf(j) >= 0 || reveal;
        var gone = linear ? (fr.opened.indexOf(j) >= 0 && j !== fr.mid) : (j < fr.lo || j > fr.hi);
        var cls = "ha-card" + (open ? " open" : "") + (j === fr.mid && !reveal ? " mid" : "") + (gone && !reveal ? " gone" : "");
        if ((fr.note === "found" || fr.note === "lfound") && j === fr.mid) cls = "ha-card open hit";
        if (reveal && pile[j] === TARGET) cls = "ha-card open lost";
        else if (reveal) cls += " gone";
        c.className = cls;
      });
      var inPlay = linear ? K - fr.opened.length + (fr.mid >= 0 ? 1 : 0) : Math.max(0, fr.hi - fr.lo + 1);
      sLook.set(fr.opened.length);
      sLeft.set(fr.note === "found" || fr.note === "lfound" ? "found" : inPlay);
      var where = pile.indexOf(TARGET) + 1;
      var txt = {
        start: mode === "sorted" ? "15 face-down cards, <strong>in increasing order</strong>. Instruction: open the middle, then throw away the half that cannot hold 42."
          : "The same 15 cards, <strong>shuffled</strong>. We follow exactly the same instruction — no improvising.",
        look: "Open the middle card of what is left (position " + (fr.mid + 1) + "): it shows <strong>" + pile[fr.mid] + "</strong>.",
        dropR: fr.seen + " is bigger than 42, so the instruction says 42 must be to the <strong>left</strong>. Throw away everything to the right.",
        dropL: fr.seen + " is smaller than 42, so the instruction says 42 must be to the <strong>right</strong>. Throw away everything to the left.",
        found: "Found 42 after opening <strong>" + fr.opened.length + "</strong> of 15 cards.",
        fail: "Nothing left in play — the method reports <strong>“no card 42 here”</strong>. Is that true?",
        reveal: "No! Card 42 was at position <strong>" + where + "</strong> all along — it was thrown away with a half. " +
          "On a shuffled pile, the middle card tells you nothing about which side 42 is on. The hidden word was <strong>sorted</strong>.",
        lstart: "Shuffled pile, but now the honest method: open cards left to right until 42 appears.",
        lnext: "Position " + (fr.mid + 1) + " is " + fr.seen + ". Not 42 — open the next one.",
        lfound: "Found 42 at position " + where + " after opening <strong>" + fr.opened.length + "</strong> cards. Always correct, but in the worst case it opens all 15 (all 100 in the task)."
      }[fr.note];
      m.innerHTML = txt;
    }
    var player = Player(host, { build: build, render: render, fps: function () { return mode === "linear" ? 2.5 : 1.1; } });
    setup(true);
  }

  /* ============================================================
     5. doublings — how many halvings until 1?
     ============================================================ */
  function doublings(host) {
    var SIZES = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
    var N = 1000000;
    title(host, "Animation · halve until one item is left");
    var opts = h("div", "anim-opts");
    var slider = h("input"); slider.type = "range"; slider.min = "0"; slider.max = String(SIZES.length - 1); slider.value = "5";
    slider.setAttribute("aria-label", "List size");
    var nv = h("span", "lab", "");
    opts.appendChild(h("span", "lab", "list size"));
    opts.appendChild(slider); opts.appendChild(nv);
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts");
    var guess = h("input"); guess.type = "number"; guess.min = "0"; guess.placeholder = "halvings?";
    guess.setAttribute("aria-label", "Predicted number of halvings");
    opts2.appendChild(h("span", "lab", "your prediction:"));
    opts2.appendChild(guess);
    opts2.appendChild(btn("1 000 000", "", function () { slider.value = "5"; change(); }));
    opts2.appendChild(btn("1 000 000 000", "", function () { slider.value = "8"; change(); }));
    host.appendChild(opts2);
    slider.addEventListener("input", change);
    function change() { N = SIZES[parseInt(slider.value, 10)]; nv.textContent = fmt(N); player.load(); }

    host.appendChild(h("div", "lab muted", "<small>items still in play (a minimum-width marker keeps tiny values visible)</small>"));
    var bar = h("div", "db-bar"); var fill = h("div", "db-fill"); bar.appendChild(fill); host.appendChild(bar);
    var sub = h("div", "db-sub", "");
    host.appendChild(sub);
    host.appendChild(h("div", "lab muted", "<small>halvings used — round up after each halving</small>"));
    var ticks = h("div", "db-ticks"); var tk = [];
    for (var i = 0; i < 30; i++) { var t = h("div", "db-tick"); ticks.appendChild(t); tk.push(t); }
    host.appendChild(ticks);
    var chain = h("div", "db-chain"); host.appendChild(chain);
    var m = msg(host);

    function build() {
      var f = [{ k: 0, left: N, chain: [N] }], left = N, c = [N];
      while (left > 1) { left = Math.ceil(left / 2); c = c.concat([left]); f.push({ k: f.length, left: left, chain: c }); }
      return f;
    }
    function render(fr, i, frames) {
      var K = frames.length - 1;
      fill.style.width = Math.max(0.3, fr.left / N * 100) + "%";
      sub.textContent = fmt(fr.left) + " of " + fmt(N) + " left" + (fr.left / N < 0.01 && fr.left > 1 ? "  —  too small to see, but still more than one" : "");
      tk.forEach(function (t, j) { t.className = "db-tick" + (j < fr.k ? " on" : "") + (j >= K ? " off" : ""); });
      var show = fr.chain.length > 12 ? ["<b>" + fmt(fr.chain[0]) + "</b>", "…"].concat(fr.chain.slice(-9).map(function (x) { return "<b>" + fmt(x) + "</b>"; }))
        : fr.chain.map(function (x) { return "<b>" + fmt(x) + "</b>"; });
      chain.innerHTML = show.join(" → ");
      if (fr.k === 0) {
        m.innerHTML = "Guess first, using the doubling rule: how many times can you halve " + fmt(N) + " before one item is left? Then press <strong>play</strong>.";
      } else if (fr.left > 1) {
        m.innerHTML = "Halving " + fr.k + ": round the remaining half up, leaving " + fmt(fr.left) + ". <span class='muted'>Doubling the other way: 2<sup>" + fr.k + "</sup> = " + fmt(Math.pow(2, fr.k)) + ".</span>";
      } else {
        var p = parseInt(guess.value, 10), v = "";
        if (!isNaN(p)) v = p === K ? " Your prediction (" + p + ") was spot on." : " You predicted " + p + " — compare with the doubling rule.";
        m.innerHTML = "<strong>" + K + " halvings</strong> for " + fmt(N) + " items, because 2<sup>" + K + "</sup> = " + fmt(Math.pow(2, K)) +
          " is the first power of two that reaches " + fmt(N) + ". This counts reductions to one candidate, not exact binary-search probes (the last candidate still needs checking)." + v +
          (N >= 1e6 ? " Try the other size: a thousand times more items costs only about ten more halvings." : "");
      }
    }
    var player = Player(host, { build: build, render: render, fps: function () { return 2.2; } });
    change();
  }

  /* ============================================================
     6. literal-robot — broken instructions vs a literal follower
     ============================================================ */
  function literalRobot(host) {
    var SCEN = {
      a: { bad: "“Warm the milk a bit.”", good: "“Heat the milk to 60 °C.”", rule: "amb" },
      b: { bad: "“Keep drawing cards until you have enough.”", good: "“Draw cards until you hold exactly five.”", rule: "stop" },
      c: { bad: "“Put the book back where it goes.”", good: "“Place the book on the shelf whose label contains the first letter of the author’s surname.”", rule: "hid" }
    };
    var RULES = [["amb", "ambiguous step"], ["stop", "no stopping rule"], ["hid", "hidden assumption"]];
    var cur = "a", timer = 0, token = 0, solved = false;
    title(host, "Animation · a follower who does exactly what is written");
    var opts = h("div", "anim-opts");
    opts.appendChild(seg("instruction", [["a", "(a) milk"], ["b", "(b) cards"], ["c", "(c) book"]], "a", function (v) { cur = v; load(); }));
    host.appendChild(opts);

    var stage = h("div", "lr-stage");
    var bot = h("div", "lr-bot",
      '<svg viewBox="0 0 90 100" aria-hidden="true"><line x1="45" y1="4" x2="45" y2="16" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="45" cy="4" r="3" class="eye"/><rect x="15" y="16" width="60" height="42" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="33" cy="36" r="5" class="eye"/><circle cx="57" cy="36" r="5" class="eye"/>' +
      '<rect x="25" y="62" width="40" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<line x1="35" y1="72" x2="55" y2="72" stroke="currentColor" stroke-width="2"/><line x1="35" y1="80" x2="50" y2="80" stroke="currentColor" stroke-width="2"/></svg>');
    bot.style.color = "var(--muted)";
    var right = h("div", "");
    var instr = h("p", "lr-instr", "");
    var say = h("div", "lr-say", "");
    say.setAttribute("aria-live", "polite");
    right.appendChild(instr); right.appendChild(say);
    stage.appendChild(bot); stage.appendChild(right);
    host.appendChild(stage);
    var scene = h("div", "lr-scene");
    host.appendChild(scene);

    var rules = h("div", "lr-rules");
    rules.appendChild(h("p", "q", "Which instruction check did this example fail?"));
    var rrow = h("div", "anim-opts");
    var rbtns = RULES.map(function (r) {
      var b = btn(r[1], "", function () { pick(r[0], b); });
      rrow.appendChild(b); return b;
    });
    rules.appendChild(rrow);
    var rfb = h("p", "anim-msg", ""); rules.appendChild(rfb);
    host.appendChild(rules);

    var ctr = h("div", "anim-controls");
    var bRun = btn("&#9654; run as written", "primary", function () { run(false); });
    var bFix = btn("&#9654; run the fixed version", "", function () { run(true); });
    var bStop = btn("&#9632; stop", "", function () { halt("Stopped by you. Notice that <em>you</em> had to decide — the instruction never did."); });
    bFix.disabled = true; bStop.disabled = true;
    [bRun, bFix, bStop].forEach(function (b) { ctr.appendChild(b); });
    host.appendChild(ctr);

    function mood(x) { bot.className = "lr-bot " + (x || ""); }
    function speak(t, cls) { say.innerHTML = t; say.className = "lr-say " + (cls || ""); }
    function clear() { token++; clearTimeout(timer); bStop.disabled = true; }
    host.addEventListener("aa:pause", function () { clear(); bRun.disabled = false; });
    function later(fn, ms) { var my = token; timer = setTimeout(function () { if (my === token) fn(); }, REDUCED ? Math.min(ms, 60) : ms); }
    function halt(t) { clear(); mood("confused"); speak(t, "q"); showRules(); bRun.disabled = false; bFix.disabled = !solved; }
    function showRules() { rules.classList.add("on"); }

    function load() {
      clear(); mood(""); solved = false; bRun.disabled = false; bFix.disabled = true;
      bRun.className = "primary"; bFix.className = "";
      instr.className = "lr-instr"; instr.textContent = SCEN[cur].bad;
      speak("I follow instructions exactly as written. I never guess what you meant.");
      rules.classList.remove("on"); rfb.innerHTML = "";
      rbtns.forEach(function (b) { b.className = ""; b.disabled = false; });
      drawScene();
    }
    function pick(id, b) {
      if (id === SCEN[cur].rule) {
        rbtns.forEach(function (x) { x.disabled = true; });
        b.className = "right";
        rfb.innerHTML = "Right. Here is a version a literal follower can obey: <strong>" + SCEN[cur].good + "</strong>";
        solved = true; bFix.disabled = false; bFix.className = "primary"; bRun.className = "";
      } else {
        b.className = "wrong"; b.disabled = true;
        rfb.innerHTML = { amb: "Is there a word here the follower has to <em>interpret</em>? Not quite — look again.",
          stop: "Would the follower ever be unsure <em>when to stop</em>? Not the main problem here.",
          hid: "Does it quietly rely on knowledge the follower might not have? Not the main problem here." }[id];
      }
    }

    /* --- scenes --- */
    var parts = {};
    function drawScene() {
      scene.innerHTML = ""; parts = {};
      if (cur === "a") {
        var th = h("div", "lr-therm");
        var tube = h("div", "tube"); var lvl = h("div", "lvl"); var goal = h("div", "goal");
        tube.appendChild(lvl); tube.appendChild(goal); goal.style.display = "none";
        var lab = h("span", "", "20 °C");
        th.appendChild(h("span", "muted", "milk")); th.appendChild(tube); th.appendChild(lab);
        scene.appendChild(th);
        scene.appendChild(h("p", "db-sub", "scale 0 – 100 °C"));
        parts = { lvl: lvl, lab: lab, goal: goal };
        setTemp(20);
      } else if (cur === "b") {
        var hand = h("div", "lr-hand");
        var cnt = h("p", "db-sub", "cards in hand: 0");
        scene.appendChild(hand); scene.appendChild(cnt);
        parts = { hand: hand, cnt: cnt };
      } else {
        var wrap = h("div", "lr-shelves");
        var labels = ["A–D", "E–H", "I–L", "M–P", "Q–T", "U–Z"];
        parts.shelves = labels.map(function (l) { var s = h("div", "lr-shelf", l); wrap.appendChild(s); return s; });
        var book = h("div", "lr-book", "Orwell · 1984");
        wrap.appendChild(book);
        scene.appendChild(wrap);
        parts.book = book; parts.wrap = wrap;
        moveBook(-1);
      }
    }
    function setTemp(t) {
      parts.lvl.style.width = t + "%";
      parts.lab.textContent = Math.round(t) + " °C";
    }
    function moveBook(i) {
      var b = parts.book;
      if (i < 0) { b.style.left = "0px"; b.style.top = "0px"; b.style.opacity = ".9"; return; }
      var s = parts.shelves[i];
      b.style.left = s.offsetLeft + "px";
      b.style.top = Math.max(0, s.offsetTop - 26) + "px";
      parts.shelves.forEach(function (x, j) { x.className = "lr-shelf" + (j === i ? " look" : ""); });
    }

    function run(fixed) {
      clear(); drawScene();
      var my = token;
      bRun.disabled = true; bFix.disabled = true;
      mood("busy");
      instr.className = "lr-instr" + (fixed ? " fixed" : "");
      instr.textContent = fixed ? SCEN[cur].good : SCEN[cur].bad;

      if (cur === "a") {
        var t = 20;
        if (fixed) parts.goal.style.display = "block", parts.goal.style.left = "60%";
        speak(fixed ? "Heating… I will check the thermometer against 60 °C." : "Heating… is this “a bit”?");
        (function step() {
          if (my !== token) return;
          t += 1; setTemp(t);
          if (fixed && t >= 60) { mood("happy"); speak("60 °C reached. The condition is met, so I stop. Done.", "ok"); bRun.disabled = false; bFix.disabled = false; return; }
          if (!fixed && t === 32) {
            halt("Stuck at 32 °C. Is this “a bit”? Is 25 °C? Is 70 °C? “A bit” is not something I can measure, so I cannot decide.");
            return;
          }
          later(step, 70);
        })();
      } else if (cur === "b") {
        var n = 0; bStop.disabled = fixed;
        speak(fixed ? "Drawing… I stop the moment I hold exactly five." : "Drawing… the instruction says stop at “enough”. How many is enough?");
        (function step() {
          if (my !== token) return;
          n++;
          parts.hand.appendChild(h("i"));
          parts.cnt.textContent = "cards in hand: " + n;
          if (fixed && n === 5) { mood("happy"); speak("I hold exactly five. Condition met — done.", "ok"); bRun.disabled = false; bFix.disabled = false; return; }
          if (!fixed) {
            if (n === 10) speak("Ten cards. Is that enough? Nothing tells me, so I keep going…");
            if (n === 25) speak("Twenty-five… still no condition I can check. I will draw forever.");
            if (n === 52) { halt("The deck ran out after 52 cards. I only stopped by accident — the instruction never told me when."); return; }
          }
          later(step, fixed ? 380 : 170);
        })();
      } else {
        if (!fixed) {
          var order = [0, 1, 2, 3, 4, 5], k = 0;
          speak("Where does it go? Let me try each shelf…");
          (function step() {
            if (my !== token) return;
            if (k === order.length) { parts.shelves.forEach(function (x) { x.className = "lr-shelf"; }); moveBook(-1);
              halt("Every shelf is possible. “Where it goes” assumes I already know the shelving scheme — nobody told me."); return; }
            moveBook(order[k]);
            speak("Shelf " + parts.shelves[order[k]].textContent + "… is this where it goes? I have no way to know.");
            k++;
            later(step, 650);
          })();
        } else {
          speak("The author is Orwell. First letter of the surname: <strong>O</strong>.");
          var labels = ["A–D", "E–H", "I–L", "M–P", "Q–T", "U–Z"], k2 = 0;
          later(function step() {
            if (my !== token) return;
            moveBook(k2);
            var hit = labels[k2] === "M–P";
            speak("Shelf " + labels[k2] + ": does it contain O? " + (hit ? "<strong>Yes.</strong>" : "No."));
            if (hit) {
              later(function () {
                parts.shelves[k2].className = "lr-shelf done";
                parts.book.style.top = (parts.shelves[k2].offsetTop + 8) + "px";
                mood("happy"); speak("Book placed on shelf M–P. Every step was something I could check. Done.", "ok");
                bRun.disabled = false; bFix.disabled = false;
              }, 500);
              return;
            }
            k2++;
            later(step, 550);
          }, 900);
        }
      }
    }
    load();
  }


  /* ============================================================
     Shared building blocks for week files (exported on AAAnim.ui)
     ============================================================ */

  /* --- Python-ish syntax colouring (display only) --- */
  var PY_KW = /\b(def|return|for|in|while|if|elif|else|break|continue|import|from|as|and|or|not|True|False|None|print|range|len|lambda|pass|with|class)\b/g;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function pyLine(src) {
    /* split off comment, colour strings/numbers/keywords in the rest */
    var ci = -1, q = null;
    for (var k = 0; k < src.length; k++) {
      var c = src[k];
      if (q) { if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === "#") { ci = k; break; }
    }
    var code = ci >= 0 ? src.slice(0, ci) : src, com = ci >= 0 ? src.slice(ci) : "";
    var parts = code.split(/("[^"]*"|'[^']*')/);
    var outHtml = parts.map(function (p, j) {
      if (j % 2) return '<span class="py-str">' + esc(p) + "</span>";
      return esc(p).replace(PY_KW, '<span class="py-kw">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="py-num">$1</span>');
    }).join("");
    return outHtml + (com ? '<span class="py-com">' + esc(com) + "</span>" : "");
  }

  /* --- CodeTrace: code panel + variables + console + counters, driven by frames ---
     cfg.code     : string (or function returning string) — the program shown
     cfg.build()  : frames [{ line: 1-based or 0, vars: {name: value}, out: [lines],
                              note: html, counters: {label: value}, hl: [extra lines] }]
     cfg.fps      : number or function(i, frames)
     cfg.onFrame  : optional function(frame, i, frames) for extra visuals
     cfg.varsTitle / cfg.outTitle : optional headings
     returns { load(), stop(), el, extra }  — put custom visuals in .extra            */
  function CodeTrace(host, cfg) {
    var wrap = h("div", "ct");
    var codeBox = h("div", "ct-code");
    var side = h("div", "ct-side");
    var varsBox = h("div", "ct-vars");
    var outBox = h("pre", "ct-out");
    side.appendChild(h("div", "ct-h", cfg.varsTitle || "variables"));
    side.appendChild(varsBox);
    side.appendChild(h("div", "ct-h", cfg.outTitle || "output"));
    side.appendChild(outBox);
    wrap.appendChild(codeBox); wrap.appendChild(side);
    host.appendChild(wrap);
    var extra = h("div", "ct-extra");
    host.appendChild(extra);
    var stats = h("div", "anim-stats");
    host.appendChild(stats);
    var m = msg(host);
    var lastCode = null, lineEls = [], prevVars = {};

    function paintCode() {
      var src = typeof cfg.code === "function" ? cfg.code() : cfg.code;
      if (src === lastCode) return;
      lastCode = src;
      codeBox.innerHTML = ""; lineEls = [];
      src.replace(/\n$/, "").split("\n").forEach(function (ln, j) {
        var row = h("div", "ct-line", '<span class="ct-no">' + (j + 1) + "</span><code>" + (pyLine(ln) || " ") + "</code>");
        codeBox.appendChild(row); lineEls.push(row);
      });
    }
    function show(v) {
      if (typeof v === "string") return '"' + esc(v) + '"';
      if (Array.isArray(v)) return "[" + v.map(show).join(", ") + "]";
      if (v === true) return "True"; if (v === false) return "False"; if (v === null) return "None";
      if (typeof v === "object") return esc(JSON.stringify(v));
      return esc(String(v));
    }
    function render(fr, i, frames) {
      paintCode();
      lineEls.forEach(function (el, j) {
        el.className = "ct-line" + (fr.line === j + 1 ? " on" : "") + (fr.hl && fr.hl.indexOf(j + 1) >= 0 ? " hl" : "") +
          (fr.err === j + 1 ? " err" : "");
      });
      if (fr.line && lineEls[fr.line - 1] && codeBox.scrollHeight > codeBox.clientHeight) {
        var el = lineEls[fr.line - 1];
        var top = el.offsetTop - codeBox.clientHeight / 2;
        codeBox.scrollTop = Math.max(0, top);
      }
      var vars = fr.vars || {};
      var keys = Object.keys(vars);
      varsBox.innerHTML = keys.length ? keys.map(function (k) {
        var val = show(vars[k]);
        var changed = i > 0 && prevVars[k] !== val;
        return '<div class="ct-var' + (changed ? " chg" : "") + '"><span>' + esc(k) + "</span><b>" + val + "</b></div>";
      }).join("") : '<div class="muted ct-empty">—</div>';
      prevVars = {}; keys.forEach(function (k) { prevVars[k] = show(vars[k]); });
      outBox.textContent = (fr.out || []).join("\n");
      outBox.scrollTop = outBox.scrollHeight;
      outBox.classList.toggle("err", !!fr.errOut);
      var cs = fr.counters || {};
      stats.innerHTML = Object.keys(cs).map(function (k) { return '<span class="anim-stat">' + esc(k) + "<b>" + esc(cs[k]) + "</b></span>"; }).join("");
      m.innerHTML = fr.note || "";
      if (cfg.onFrame) cfg.onFrame(fr, i, frames);
    }
    var fps = cfg.fps || 1.5;
    var p = Player(host, { build: cfg.build, render: render, fps: typeof fps === "function" ? fps : function () { return fps; } });
    return { load: function () { lastCode = null; p.load(); }, stop: p.stop, el: p.el, extra: extra, msg: m };
  }

  /* --- LineChart: small theme-aware canvas chart (log or linear axes) ---
     var c = LineChart(parent, { logx, logy, xlabel, ylabel, height })
     c.draw([{ name, color: "--blue", points: [[x, y], ...], dashed }], { upto: k })  */
  function LineChart(parent, o) {
    o = o || {};
    var cv = h("canvas", "lc");
    cv.width = 720; cv.height = o.height || 320;
    cv.style.height = (o.height || 320) + "px";
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", o.label || "chart");
    parent.appendChild(cv);
    var ctx = cv.getContext("2d"), last = null;
    function tx(v, log) { return log ? Math.log10(Math.max(v, 1e-12)) : v; }
    function nice(v) {
      if (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-3 && v !== 0)) return v.toExponential(0);
      return String(+v.toPrecision(3));
    }
    function draw(series, d) {
      last = [series, d]; d = d || {};
      var W = cv.clientWidth, H = cv.clientHeight || o.height || 320;
      if (!W) return;
      var dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var L = W < 480 ? 66 : 84, R = 34,
          T = 20 + series.filter(function(s){return s.name;}).length * 17, B = 44;
      var col = function (v) { return cssVar(parent, v) || v; };
      ctx.clearRect(0, 0, W, H);
      ctx.font = "12px " + (cssVar(parent, "--font-mono") || "monospace");
      var xs = [], ys = [];
      series.forEach(function (s) { s.points.forEach(function (p) { xs.push(tx(p[0], o.logx)); ys.push(tx(p[1], o.logy)); }); });
      if (d.xr) xs = xs.concat([tx(d.xr[0], o.logx), tx(d.xr[1], o.logx)]);
      if (d.yr) ys = ys.concat([tx(d.yr[0], o.logy), tx(d.yr[1], o.logy)]);
      if (!xs.length) return;
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      if (!o.logy && y0 > 0) y0 = 0;
      if (x1 === x0) x1 = x0 + 1; if (y1 === y0) y1 = y0 + 1;
      var px = function (x) { return L + (tx(x, o.logx) - x0) / (x1 - x0) * (W - L - R); };
      var py = function (y) { return H - B - (tx(y, o.logy) - y0) / (y1 - y0) * (H - T - B); };
      ctx.strokeStyle = col("--border"); ctx.fillStyle = col("--muted"); ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var gy = T + g * (H - T - B) / 4, vy = y1 - g * (y1 - y0) / 4;
        ctx.beginPath(); ctx.moveTo(L, gy); ctx.lineTo(W - R, gy); ctx.stroke();
        ctx.textAlign = "right"; ctx.fillText(nice(o.logy ? Math.pow(10, vy) : vy), L - 6, gy + 4);
        var gx = L + g * (W - L - R) / 4, vx = x0 + g * (x1 - x0) / 4;
        if (W >= 480 || g % 2 === 0) {
          ctx.textAlign = "center"; ctx.fillText(nice(o.logx ? Math.pow(10, vx) : vx), gx, H - B + 16);
        }
      }
      ctx.fillText((o.xlabel || "n") + (o.logx ? "  (log scale)" : ""), (L + W - R) / 2, H - 8);
      ctx.save(); ctx.translate(12, (T + H - B) / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText((o.ylabel || "") + (o.logy ? "  (log)" : ""), 0, 0); ctx.restore();
      var ly = 9;
      series.forEach(function (s) {
        var c = col(s.color || "--accent"), pts = s.points.slice(0, d.upto == null ? s.points.length : d.upto);
        ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.5;
        ctx.setLineDash(s.dashed ? [6, 5] : []);
        ctx.beginPath();
        pts.forEach(function (p, j) { var X = px(p[0]), Y = py(p[1]); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
        ctx.stroke(); ctx.setLineDash([]);
        if (!s.noDots) pts.forEach(function (p) { ctx.beginPath(); ctx.arc(px(p[0]), py(p[1]), 4, 0, 7); ctx.fill(); });
        if (s.name) {
          ctx.fillRect(L + 10, ly, 14, 3); ctx.textAlign = "left";
          ctx.fillStyle = col("--text"); ctx.fillText(s.name, L + 30, ly + 5); ly += 17;
        }
      });
    }
    new MutationObserver(function () { if (last) draw(last[0], last[1]); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    new ResizeObserver(function () { if (last) draw(last[0], last[1]); }).observe(cv);
    return { draw: draw, el: cv };
  }

  /* --- simple table --- */
  function table(parent, headers) {
    var t = h("table", "anim-table");
    t.innerHTML = "<thead><tr>" + headers.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody></tbody>";
    parent.appendChild(t);
    return {
      el: t,
      rows: function (rows, hiRow) {
        t.tBodies[0].innerHTML = rows.map(function (r, j) {
          return "<tr" + (j === hiRow ? ' class="on"' : "") + ">" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
        }).join("");
      }
    };
  }

  /* --- seeded random (so "simulated" data is repeatable) --- */
  function rng(seed) {
    var a = seed >>> 0 || 1;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /* ---------- boot ---------- */
  var REGISTRY = {
    "max-scan": maxScan,
    "guess-race": guessRace,
    "letter-sort": letterSort,
    "hunt-assumption": huntAssumption,
    "doublings": doublings,
    "literal-robot": literalRobot
  };
  function boot() {
    document.querySelectorAll("[data-anim]").forEach(function (host) {
      var fn = REGISTRY[host.getAttribute("data-anim")];
      if (!fn || host.dataset.animReady) return;
      host.dataset.animReady = "1";
      host.innerHTML = "";
      try { fn(host); } catch (e) { host.textContent = "This animation could not start: " + e.message; }
    });
  }
  window.AAAnim = {
    register: function (name, fn) { REGISTRY[name] = fn; if (document.readyState !== "loading") boot(); },
    boot: boot,
    ui: { h: h, btn: btn, seg: seg, fmt: fmt, shuffle: shuffle, sample: sample, cssVar: cssVar, stat: stat,
          title: title, msg: msg, Player: Player, CodeTrace: CodeTrace, LineChart: LineChart, table: table,
          rng: rng, esc: esc, pyLine: pyLine, REDUCED: REDUCED }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
