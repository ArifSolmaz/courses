/* ============================================================
   PHY101 Week 05 — work and kinetic energy
   w5-area : work as the signed area under F(x), accumulating as the block moves
   ============================================================ */
(function () {
  "use strict";

  PhyAnim.register("w5-area", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A force pushes a block forward for 4 m, then an equally sized force opposes it for the "
       + "next 4 m. Over the whole 8 m, what is the net work?",
      q_tr: "Bir kuvvet bloğu 4 m ileri iter, sonra aynı büyüklükte bir kuvvet 4 m boyunca ona "
          + "karşı koyar. 8 m boyunca net iş nedir?",
      options: [["pos", "positive"], ["zero", "zero"], ["neg", "negative"],
                ["cant", "cannot be found without the mass"]],
      correct: "zero",
      why: "Work is the <em>signed</em> area under the force–position graph. Area above the axis is "
         + "energy put in, area below it is energy taken out, and equal areas cancel exactly. The "
         + "block ends with the kinetic energy it started with. Switch the force profile below and "
         + "watch the running total climb and then fall back.",
      why_tr: "İş, kuvvet–konum grafiğinin altındaki <em>işaretli</em> alandır. Eksenin üstündeki "
            + "alan enerji verir, altındaki alır; eşit alanlar tam olarak birbirini götürür."
    });

    var profile = "cancel", mass = 2, v0 = 4;

    /* the three force profiles, each F(x) in newtons over 0..8 m */
    var PROFILES = {
      cancel: { label: "equal and opposite", f: function (x) { return x < 4 ? 6 : -6; } },
      spring: { label: "spring-like, F = −kx", f: function (x) { return 6 - 1.8 * x; } },
      ramp:   { label: "rising then falling",  f: function (x) { return 6 * Math.sin(Math.PI * x / 8) * 1.0; } }
    };

    var sc = U.Scene(m.stage, {
      height: 330,
      alt: "A force-position graph with the signed area shaded as a block advances, and the "
         + "running total of work and kinetic energy below it"
    });

    var pl = U.Player(m.controls, { duration: 5, onFrame: function () { sc.draw(); } });
    U.seg(m.controls, "force profile",
      [["cancel", "equal and opposite"], ["spring", "spring-like"], ["ramp", "one hump"]],
      "cancel", function (v) { profile = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "mass", {
      min: 0.5, max: 6, step: 0.5, value: mass, text: function (v) { return fmt(v, 1) + " kg"; }
    }, function (v) { mass = v; sc.draw(); });
    U.slider(m.controls, "start speed", {
      min: 1, max: 8, step: 0.5, value: v0, text: function (v) { return fmt(v, 1) + " m/s"; }
    }, function (v) { v0 = v; sc.draw(); });

    var sX = U.stat(m.stats, "position", "—");
    var sW = U.stat(m.stats, "work done so far", "—");
    var sK = U.stat(m.stats, "kinetic energy", "—");
    var sV = U.stat(m.stats, "speed", "—");

    /* Cumulative work, tabulated once per profile rather than re-integrated on
       every frame for every sample (which was 160 x 200 evaluations a frame). */
    var N = 320, TBL = null, TBLfor = null;
    function table() {
      if (TBLfor === profile) return TBL;
      var f = PROFILES[profile].f, w = 0, out = [0];
      for (var i = 1; i <= N; i++) {
        var a = 8 * (i - 1) / N, b = 8 * i / N;
        w += 0.5 * (f(a) + f(b)) * (b - a);
        out.push(w);
      }
      TBL = out; TBLfor = profile;
      return TBL;
    }
    function workTo(xEnd) {
      var t = table(), u = Math.max(0, Math.min(1, xEnd / 8)) * N;
      var i = Math.floor(u), fr = u - i;
      if (i >= N) return t[N];
      return t[i] + fr * (t[i + 1] - t[i]);
    }
    /* the true range of K over the whole run — the peak is usually mid-way,
       not at either end, and using the ends put the curve outside its own axes */
    function kRange(K0) {
      var t = table(), lo = K0, hi = K0;
      for (var i = 0; i <= N; i++) {
        var k = K0 + t[i];
        if (k < lo) lo = k;
        if (k > hi) hi = k;
      }
      return [lo, hi];
    }

    sc.onDraw(function (s) {
      var frac = Math.min(pl.t() / pl.duration, 1);
      var x = 8 * frac;
      var f = PROFILES[profile].f;
      var W = workTo(x);
      var K0 = 0.5 * mass * v0 * v0;
      var K = Math.max(K0 + W, 0);
      var v = Math.sqrt(2 * K / mass);

      var accent = s.col("--phy-orange", "#e65100");
      var green = s.col("--green", "#15803d");
      var blue = s.col("--phy-blue", "#1565c0");
      var dim = s.col("--dim", "#888");

      var half = s.h * 0.56;

      /* ---- top: F against x, with the swept area shaded by sign ---- */
      var P = s.plot({
        w: s.w, h: half, xlim: [0, 8], ylim: [-8, 8],
        pad: { l: 52, r: 14, t: 16, b: 24 },
        xlabel: "", ylabel: "F (N)",
        xticks: [0, 2, 4, 6, 8], yticks: [-6, 0, 6]
      });
      P.frame();
      P.title("signed area under F(x) — that area is the work");

      var full = [], swept = [];
      for (var i = 0; i <= 160; i++) {
        var xx = 8 * i / 160;
        full.push([xx, f(xx)]);
        if (xx <= x) swept.push([xx, f(xx)]);
      }
      if (swept.length > 1) P.fill(swept, { base: 0 });
      P.line(full, { color: accent, width: 2.4 });
      P.vline(x, { color: blue, dash: [3, 3] });
      P.dot(x, f(x), { color: blue, r: 5 });

      /* ---- bottom: the running totals, so cause and effect sit together ---- */
      var kr = kRange(K0), pad = Math.max(2, (kr[1] - kr[0]) * 0.18);
      var Q = s.plot({
        y: half, w: s.w, h: s.h - half, xlim: [0, 8],
        ylim: [Math.max(0, kr[0] - pad), kr[1] + pad],
        pad: { l: 52, r: 14, t: 16, b: 30 },
        xlabel: "position x (m)", ylabel: "energy (J)",
        xticks: [0, 2, 4, 6, 8],
        yticks: [Math.round(kr[0]), Math.round((kr[0] + kr[1]) / 2), Math.round(kr[1])]
      });
      Q.frame();
      Q.title("kinetic energy follows the area, step for step");

      var track = [];
      for (i = 0; i <= 160; i++) {
        var xq = 8 * i / 160;
        if (xq > x) break;
        track.push([xq, K0 + workTo(xq)]);
      }
      Q.line([[0, K0], [8, K0]], { color: dim, width: 1.2, dash: [5, 4] });
      Q.text(7.9, K0, "starting K", { color: dim, align: "right", dy: -4 });
      Q.line(track, { color: green, width: 2.4 });
      if (track.length) Q.dot(x, K0 + W, { color: green, r: 5.5 });

      sX.set(fmt(x, 2) + " m");
      sW.set((W >= 0 ? "+" : "") + fmt(W, 1) + " J");
      sK.set(fmt(K, 1) + " J");
      sV.set(fmt(v, 2) + " m/s");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
