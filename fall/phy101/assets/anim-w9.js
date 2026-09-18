/* ============================================================
   PHY101 Week 09 — momentum, impulse, collisions
   w9-impulse    : the same momentum change spread over different times
   w9-collisions : one slider from perfectly elastic to perfectly inelastic
   ============================================================ */
(function () {
  "use strict";

  /* -------------------------------------------------------------- impulse */
  PhyAnim.register("w9-impulse", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A car stops in a crash. An airbag makes the stop last four times longer. What happens to "
       + "the <strong>impulse</strong> delivered to the driver?",
      q_tr: "Bir araba çarpışmada duruyor. Hava yastığı durmayı dört kat uzatıyor. Sürücüye "
          + "aktarılan <strong>impuls</strong> ne olur?",
      options: [["quarter", "it falls to a quarter"], ["same", "it is unchanged"],
                ["four", "it becomes four times larger"], ["zero", "it becomes zero"]],
      correct: "same",
      why: "Impulse <em>is</em> the momentum change, $\\vec J=\\Delta\\vec p$, and the driver still "
         + "has to go from moving to stopped. What the airbag changes is how that fixed area under "
         + "the force–time curve is shaped: spread it over four times as long and the average force "
         + "falls to a quarter. Drag the duration and watch the area refuse to change.",
      why_tr: "İmpuls momentum değişiminin kendisidir ve sürücü yine de durmak zorundadır. Hava "
            + "yastığı aynı alanı zamana yayar; ortalama kuvvet dörtte bire iner."
    });

    var dur = 0.05, mass = 70, v0 = 14, shape = "tri";

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A force-time curve whose area is fixed, reshaped as the collision duration changes"
    });

    U.slider(m.controls, "stopping time", {
      min: 0.01, max: 0.40, step: 0.005, value: dur,
      text: function (v) { return fmt(v * 1000, 0) + " ms"; }
    }, function (v) { dur = v; sc.draw(); });
    U.slider(m.controls, "impact speed", {
      min: 2, max: 30, step: 1, value: v0, text: function (v) { return v + " m/s"; }
    }, function (v) { v0 = v; sc.draw(); });
    U.seg(m.controls, "pulse shape", [["tri", "triangular"], ["flat", "square"]], "tri",
      function (v) { shape = v; sc.draw(); });

    var sJ = U.stat(m.stats, "impulse = Δp", "—");
    var sAvg = U.stat(m.stats, "average force", "—");
    var sPk = U.stat(m.stats, "peak force", "—");
    var sG = U.stat(m.stats, "that is", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var dim = s.col("--dim", "#888");
      var green = s.col("--green", "#15803d");

      var J = mass * v0;                       // the fixed area
      var Favg = J / dur;
      var Fpk = shape === "tri" ? 2 * Favg : Favg;
      var refPk = 2 * J / 0.01;                // the worst case, for a fixed y-axis

      var tmax = 0.42, ymax = Math.min(refPk, 2 * J / 0.02) * 1.1;

      var P = s.plot({
        w: s.w, h: s.h, xlim: [0, tmax], ylim: [0, ymax],
        pad: { l: 66, r: 14, t: 18, b: 34 },
        xlabel: "time (s)", ylabel: "force (N)",
        xticks: [0, 0.1, 0.2, 0.3, 0.4],
        yticks: [0, Math.round(ymax / 2), Math.round(ymax)]
      });
      P.frame();
      P.title("the area is fixed — only its shape is yours to choose");

      var pts;
      if (shape === "tri") {
        pts = [[0, 0], [dur / 2, Fpk], [dur, 0]];
      } else {
        pts = [[0, 0], [0, Fpk], [dur, Fpk], [dur, 0]];
      }
      P.fill(pts, { base: 0 });
      P.line(pts, { color: accent, width: 2.4 });

      /* a ghost of the hardest stop, to compare against */
      var ghost = shape === "tri"
        ? [[0, 0], [0.01, 2 * J / 0.02], [0.02, 0]]
        : [[0, 0], [0, J / 0.02], [0.02, J / 0.02], [0.02, 0]];
      P.line(ghost, { color: dim, width: 1.4, dash: [4, 3] });
      P.text(0.03, ymax * 0.92, "a 20 ms stop, for comparison", { color: dim, align: "left" });

      P.line([[0, Favg], [dur, Favg]], { color: green, width: 1.4, dash: [6, 4] });
      P.text(dur + 0.005, Favg, "average", { color: green, align: "left", dy: -4 });

      sJ.set(fmt(J, 0) + " N·s — fixed");
      sAvg.set(fmt(Favg / 1000, 1) + " kN");
      sPk.set(fmt(Fpk / 1000, 1) + " kN");
      sG.set(fmt(Favg / (mass * 9.81), 1) + " g on the driver");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ----------------------------------------------------------- collisions */
  PhyAnim.register("w9-collisions", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A moving cart hits an identical stationary one and they stick together. How much of the "
       + "kinetic energy survives?",
      q_tr: "Hareketli bir araba, duran özdeş bir arabaya çarpıp ona yapışıyor. Kinetik enerjinin "
          + "ne kadarı kalır?",
      options: [["all", "all of it"], ["half", "half of it"],
                ["quarter", "a quarter"], ["none", "none"]],
      correct: "half",
      why: "Momentum fixes the final speed: $mv=(2m)v_f$ gives $v_f=v/2$. The kinetic energy is then "
         + "$\\tfrac12(2m)(v/2)^2=\\tfrac14mv^2$ — exactly half of the original $\\tfrac12mv^2$. "
         + "Momentum is conserved in every collision here; energy is not, and the slider below "
         + "shows exactly how much goes missing.",
      why_tr: "Momentum son sürati belirler: $v_f=v/2$. Kinetik enerji dörtte bir $mv^2$ olur, yani "
            + "başlangıcın tam yarısı. Momentum hep korunur, enerji korunmaz."
    });

    var e = 0, m1 = 1, m2 = 1, u1 = 4;

    var sc = U.Scene(m.stage, {
      height: 310,
      alt: "Two carts colliding, with momentum and kinetic energy bars before and after"
    });

    var pl = U.Player(m.controls, { duration: 4, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "bounciness e", {
      min: 0, max: 1, step: 0.05, value: e,
      text: function (v) { return fmt(v, 2) + (v === 0 ? " (sticks)" : v === 1 ? " (elastic)" : ""); }
    }, function (v) { e = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "mass of the target", {
      min: 0.5, max: 5, step: 0.5, value: m2, text: function (v) { return fmt(v, 1) + " kg"; }
    }, function (v) { m2 = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "approach speed", {
      min: 1, max: 8, step: 0.5, value: u1, text: function (v) { return fmt(v, 1) + " m/s"; }
    }, function (v) { u1 = v; pl.reset(); sc.draw(); });

    var sP = U.stat(m.stats, "momentum", "—");
    var sK = U.stat(m.stats, "kinetic energy", "—");
    var sV1 = U.stat(m.stats, "cart 1 after", "—");
    var sV2 = U.stat(m.stats, "cart 2 after", "—");
    var sLost = U.stat(m.stats, "energy lost", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      /* general 1-D collision with restitution e, target initially at rest */
      var v1 = ((m1 - e * m2) * u1) / (m1 + m2);
      var v2 = ((1 + e) * m1 * u1) / (m1 + m2);
      var p0 = m1 * u1, K0 = 0.5 * m1 * u1 * u1;
      var pf = m1 * v1 + m2 * v2, Kf = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

      /* Geometry first, then motion: the carts must touch exactly at the hit,
         never overlap. Approach is interpolated onto the contact position; after
         the hit both move at their true velocities on one shared px-per-(m/s). */
      var w1 = 0.28 + m1 * 0.13, w2 = 0.28 + m2 * 0.13;
      var xStart = 1.0, xTarget = 7.4, xContact = xTarget - (w1 + w2);
      var t = pl.t(), hit = pl.duration * 0.45;
      var SCALE = (xContact - xStart) / (u1 * hit);   // units per metre travelled
      var x1, x2;
      if (t < hit) {
        x1 = xStart + (xContact - xStart) * (t / hit);
        x2 = xTarget;
      } else {
        var dt = t - hit;
        x1 = xContact + v1 * dt * SCALE;
        x2 = xTarget + v2 * dt * SCALE;
        if (e === 0) x1 = x2 - (w1 + w2);             // stuck: they travel as one
      }

      /* ---- top: the carts ---- */
      var topH = s.h * 0.44;
      var P = s.plot({
        w: s.w, h: topH, xlim: [0, 12], ylim: [0, 4],
        pad: { l: 44, r: 14, t: 18, b: 18 }, xticks: [], yticks: []
      });
      P.title(t < hit ? "before" : (e === 0 ? "after — stuck together" : "after"));

      var ctx = s.ctx;
      function cart(x, mm, colour, label) {
        var w = 0.28 + mm * 0.13, hh = 0.5 + mm * 0.12;   // same rule as above
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.8;
        ctx.fillRect(P.X(x - w), P.Y(1.2 + hh), P.X(x + w) - P.X(x - w), P.Y(1.2) - P.Y(1.2 + hh));
        ctx.restore();
        P.text(x, 1.2 + hh, label, { color: colour, align: "center", dy: -6 });
      }
      P.line([[0.2, 1.2], [11.8, 1.2]], { color: dim, width: 1.4 });
      cart(x1, m1, accent, fmt(m1, 1) + " kg");
      cart(x2, m2, blue, fmt(m2, 1) + " kg");

      var vNow1 = t < hit ? u1 : v1, vNow2 = t < hit ? 0 : v2;
      if (Math.abs(vNow1) > 0.05) P.arrow(x1, 2.9, x1 + vNow1 * 0.28, 2.9, { color: accent, width: 2 });
      if (Math.abs(vNow2) > 0.05) P.arrow(x2, 2.9, x2 + vNow2 * 0.28, 2.9, { color: blue, width: 2 });

      /* ---- bottom: the two ledgers, side by side ---- */
      var Q = s.plot({
        y: topH, w: s.w, h: s.h - topH, xlim: [0, 4], ylim: [0, Math.max(p0, K0) * 1.2],
        pad: { l: 56, r: 14, t: 20, b: 30 },
        ylabel: "", xticks: [],
        yticks: [0, Math.round(Math.max(p0, K0) / 2), Math.round(Math.max(p0, K0))]
      });
      Q.frame();
      Q.title("momentum is conserved; kinetic energy need not be");

      function bar(xc, val, colour, label) {
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.8;
        ctx.fillRect(Q.X(xc - 0.28), Q.Y(val), Q.X(xc + 0.28) - Q.X(xc - 0.28), Q.Y(0) - Q.Y(val));
        ctx.restore();
        Q.text(xc, 0, label, { color: dim, align: "center", dy: 14 });
        Q.text(xc, val, fmt(val, 1), { color: colour, align: "center", dy: -4 });
      }
      bar(0.6, p0, green, "p before");
      bar(1.4, pf, green, "p after");
      bar(2.6, K0, accent, "K before");
      bar(3.4, Kf, accent, "K after");

      sP.set(fmt(p0, 2) + " → " + fmt(pf, 2) + " kg·m/s");
      sK.set(fmt(K0, 2) + " → " + fmt(Kf, 2) + " J");
      sV1.set(fmt(v1, 2) + " m/s");
      sV2.set(fmt(v2, 2) + " m/s");
      sLost.set(fmt(100 * (K0 - Kf) / K0, 1) + "%");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
