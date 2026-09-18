/* ============================================================
   PHY101 Week 04 — friction, inclines, connected bodies
   w4-incline : does the block slide, and how fast, as theta and mu change
   w4-atwood  : an Atwood machine, with the limiting cases made visible
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* -------------------------------------------------------------- incline */
  PhyAnim.register("w4-incline", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A block rests on a rough slope. You slowly tilt the slope up. What decides the exact "
       + "angle at which it starts to slide?",
      q_tr: "Pürüzlü bir eğimde duran blok. Eğimi yavaşça artırıyorsun. Kaymaya başladığı açıyı "
          + "ne belirler?",
      options: [["m", "the mass of the block"],
                ["mu", "the coefficient of static friction alone"],
                ["both", "mass and friction together"],
                ["area", "the contact area"]],
      correct: "mu",
      why: "At the tipping point $mg\\sin\\theta=\\mu_s mg\\cos\\theta$. Every term carries $m$, so "
         + "the mass divides out and $\\tan\\theta_c=\\mu_s$ — a heavier block is pulled harder down "
         + "the slope, but it also presses harder and gets exactly proportionally more friction. "
         + "Change the mass below and watch the critical angle refuse to move.",
      why_tr: "Kayma anında kütle sadeleşir: $\\tan\\theta_c=\\mu_s$. Ağır blok daha çok çekilir ama "
            + "aynı oranda daha çok bastırır."
    });

    var th = 20, mus = 0.50, muk = 0.35, mass = 4;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A block on an incline with the weight resolved along and perpendicular to the slope, "
         + "beside a bar comparing the driving force with the available friction"
    });

    U.slider(m.controls, "slope angle", {
      min: 0, max: 60, step: 1, value: th, text: function (v) { return v + "°"; }
    }, function (v) { th = v; sc.draw(); });
    U.slider(m.controls, "static coeff", {
      min: 0.05, max: 1.2, step: 0.05, value: mus, text: function (v) { return fmt(v, 2); }
    }, function (v) { mus = v; if (muk > v) muk = v; sc.draw(); });
    U.slider(m.controls, "kinetic coeff", {
      min: 0.0, max: 1.2, step: 0.05, value: muk, text: function (v) { return fmt(v, 2); }
    }, function (v) { muk = Math.min(v, mus); sc.draw(); });
    U.slider(m.controls, "mass", {
      min: 1, max: 20, step: 1, value: mass, text: function (v) { return v + " kg"; }
    }, function (v) { mass = v; sc.draw(); });

    var sCrit = U.stat(m.stats, "critical angle", "—");
    var sState = U.stat(m.stats, "state", "—");
    var sDrive = U.stat(m.stats, "mg sin θ", "—");
    var sHold = U.stat(m.stats, "friction available", "—");
    var sAcc = U.stat(m.stats, "acceleration", "—");

    sc.onDraw(function (s) {
      var r = th * Math.PI / 180;
      var W = mass * G;
      var drive = W * Math.sin(r);
      var N = W * Math.cos(r);
      var hold = mus * N;
      var slides = drive > hold + 1e-9;
      var a = slides ? G * (Math.sin(r) - muk * Math.cos(r)) : 0;
      var critical = Math.atan(mus) * 180 / Math.PI;

      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");
      var ink = s.col("--fig-ink", "#333");

      /* ---- left: the slope, drawn true to the chosen angle ---- */
      var LW = s.w * 0.56;
      var P = s.plot({
        w: LW, h: s.h, xlim: [0, 10], ylim: [0, 10 * (s.h - 44) / (LW - 58)],
        pad: { l: 46, r: 12, t: 14, b: 30 }, xticks: [], yticks: []
      });
      P.title("the slope, to scale");

      /* slope triangle: base 8 units, apex height set by the angle */
      var base = 8, rise = base * Math.tan(r);
      var top = P.ylim[1] * 0.92;
      if (rise > top - 0.6) { base = (top - 0.6) / Math.tan(r || 1e-6); rise = top - 0.6; }
      var ox = 0.8, oy = 0.6;                       // bottom-right corner of the slope
      P.line([[ox, oy], [ox + base, oy], [ox, oy + rise], [ox, oy]],
             { color: dim, width: 1.6 });
      /* the surface runs from the apex (ox, oy+rise) down to (ox+base, oy) */

      /* block sits 45% of the way down the slope */
      var f = 0.45;
      var bx = ox + base * f, by = oy + rise * (1 - f);
      P.dot(bx, by, { color: slides ? accent : green, r: 9 });

      /* weight and its two components, drawn from the block */
      var L = Math.min(2.2, top * 0.28);
      P.arrow(bx, by, bx, by - L, { color: accent, width: 2 });
      P.text(bx, by - L, "mg", { color: accent, align: "left", dx: 6, dy: 2 });
      /* down-slope component: unit vector along the surface, pointing downhill */
      var ux = Math.cos(r), uy = -Math.sin(r);
      var sl = L * Math.sin(r);
      P.arrow(bx, by, bx + ux * sl, by + uy * sl, { color: green, width: 2 });
      /* friction opposes it */
      var fl = L * Math.min(hold, drive) / (W || 1);
      P.arrow(bx, by, bx - ux * fl, by - uy * fl, { color: blue, width: 2 });

      P.text(ox + base * 0.62, oy + 0.15, th + "°", { color: dim, align: "center" });

      /* ---- right: the two forces as bars, which is the actual decision ---- */
      var RW = s.w - LW;
      var top2 = Math.max(drive, hold, 1) * 1.25;
      var Q = s.plot({
        x: LW, w: RW, h: s.h, xlim: [0, 2], ylim: [0, top2],
        pad: { l: 52, r: 14, t: 14, b: 30 },
        ylabel: "force (N)", xticks: [],
        yticks: [0, Math.round(top2 / 2), Math.round(top2)]
      });
      Q.frame();
      Q.title(slides ? "sliding" : "held");

      function bar(xc, val, colour, label) {
        var hw = 0.30;
        var ctx = s.ctx;
        ctx.save();
        ctx.fillStyle = colour;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(Q.X(xc - hw), Q.Y(val), Q.X(xc + hw) - Q.X(xc - hw), Q.Y(0) - Q.Y(val));
        ctx.restore();
        Q.text(xc, 0, label, { color: dim, align: "center", dy: 14 });
        Q.text(xc, val, fmt(val, 1), { color: colour, align: "center", dy: -4 });
      }
      bar(0.55, drive, green, "mg sin θ");
      bar(1.45, hold, blue, "μs N");

      sCrit.set(fmt(critical, 1) + "°  (tan θ = μs)");
      sState.set(slides ? "sliding" : "held by static friction");
      sDrive.set(fmt(drive, 1) + " N");
      sHold.set(fmt(hold, 1) + " N");
      sAcc.set(slides ? fmt(a, 2) + " m/s²" : "0 — nothing moves");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* --------------------------------------------------------------- Atwood */
  PhyAnim.register("w4-atwood", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Two masses hang over a frictionless pulley, 3 kg on one side and 2 kg on the other. "
       + "Is the tension in the string bigger than 2g, between 2g and 3g, or bigger than 3g?",
      q_tr: "Sürtünmesiz makarada 3 kg ve 2 kg asılı. İpteki gerilme 2g'den küçük mü, 2g ile 3g "
          + "arasında mı, yoksa 3g'den büyük mü?",
      options: [["lo", "less than 2g"], ["mid", "between 2g and 3g"],
                ["hi", "more than 3g"], ["eq", "exactly 2.5g"]],
      correct: "mid",
      why: "The light mass accelerates upward, so the string must pull it with more than its own "
         + "weight; the heavy one accelerates downward, so the string pulls it with less than its "
         + "weight. The tension is therefore squeezed between the two weights — "
         + "$T=\\dfrac{2m_1m_2}{m_1+m_2}g$, the harmonic mean. Drag the masses together and watch "
         + "$T$ stay trapped between the two dashed lines.",
      why_tr: "Hafif kütle yukarı ivmelenir, ağır kütle aşağı; gerilme iki ağırlığın arasında "
            + "sıkışır. Harmonik ortalamadır."
    });

    var m1 = 3, m2 = 2;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "An Atwood machine with the acceleration and tension plotted against the mass ratio"
    });

    var pl = U.Player(m.controls, { duration: 3, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "heavy mass m₁", {
      min: 1, max: 10, step: 0.5, value: m1, text: function (v) { return fmt(v, 1) + " kg"; }
    }, function (v) { m1 = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "light mass m₂", {
      min: 1, max: 10, step: 0.5, value: m2, text: function (v) { return fmt(v, 1) + " kg"; }
    }, function (v) { m2 = v; pl.reset(); sc.draw(); });

    var sA = U.stat(m.stats, "acceleration", "—");
    var sT = U.stat(m.stats, "tension", "—");
    var sW1 = U.stat(m.stats, "m₁g", "—");
    var sW2 = U.stat(m.stats, "m₂g", "—");

    sc.onDraw(function (s) {
      var hi = Math.max(m1, m2), lo = Math.min(m1, m2);
      var a = (hi - lo) / (hi + lo) * G;
      var T = 2 * hi * lo / (hi + lo) * G;
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      /* ---- left: the machine, masses moving with the real acceleration ---- */
      var LW = s.w * 0.46;
      var P = s.plot({
        w: LW, h: s.h, xlim: [0, 10], ylim: [0, 10], pad: { l: 20, r: 12, t: 14, b: 30 },
        xticks: [], yticks: []
      });
      P.title("the machine");

      var t = pl.t();
      var drop = Math.min(0.5 * a * t * t * 0.06, 3.2);   // scaled for the picture
      var pulleyY = 8.6, xL = 3.2, xR = 6.8;
      var ctx = s.ctx;
      ctx.save();
      ctx.strokeStyle = dim; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(P.X(5), P.Y(pulleyY), Math.abs(P.X(6.8) - P.X(5)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      var yHeavy = 5.2 - drop, yLight = 2.6 + drop;
      P.line([[xL, pulleyY], [xL, yHeavy]], { color: dim, width: 1.4 });
      P.line([[xR, pulleyY], [xR, yLight]], { color: dim, width: 1.4 });

      function box(x, y, mm, colour) {
        var w = 0.55 + mm * 0.06, hh = 0.5 + mm * 0.05;
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.8;
        ctx.fillRect(P.X(x - w), P.Y(y + hh), P.X(x + w) - P.X(x - w), P.Y(y - hh) - P.Y(y + hh));
        ctx.restore();
        P.text(x, y - hh, fmt(mm, 1) + " kg", { color: colour, align: "center", dy: -5 });
      }
      box(xL, yHeavy, hi, accent);
      box(xR, yLight, lo, blue);
      P.arrow(xL - 1.4, yHeavy, xL - 1.4, yHeavy - 1.1, { color: accent, width: 2 });
      P.arrow(xR + 1.4, yLight, xR + 1.4, yLight + 1.1, { color: blue, width: 2 });

      /* ---- right: T against the mass ratio, trapped between the weights ---- */
      var RW = s.w - LW;
      var ymax = Math.max(hi, lo) * G * 1.2;
      var Q = s.plot({
        x: LW, w: RW, h: s.h, xlim: [1, 10], ylim: [0, ymax],
        pad: { l: 52, r: 14, t: 14, b: 32 },
        xlabel: "heavy mass m₁ (kg)", ylabel: "force (N)",
        xticks: [1, 4, 7, 10], yticks: [0, Math.round(ymax / 2), Math.round(ymax)]
      });
      Q.frame();
      Q.title("tension stays between the two weights");

      var curve = [], w1 = [], w2 = [];
      for (var x = 1; x <= 10; x += 0.25) {
        var h2 = Math.max(x, lo), l2 = Math.min(x, lo);
        curve.push([x, 2 * h2 * l2 / (h2 + l2) * G]);
        if (x * G <= ymax) w1.push([x, x * G]);     // clip: it leaves the plot fast
        w2.push([x, lo * G]);
      }
      var xTop = ymax / G;                          // where m1g meets the top of the plot
      Q.line(w1, { color: accent, width: 1.3, dash: [5, 4] });
      Q.line(w2, { color: blue, width: 1.3, dash: [5, 4] });
      Q.line(curve, { color: green, width: 2.4 });
      Q.dot(hi, T, { color: green, r: 5.5 });
      Q.text(10, lo * G, "m₂g", { color: blue, align: "right", dy: -4 });
      Q.text(Math.min(xTop, 9.6), Math.min(xTop * G, ymax) * 0.96, "m₁g",
             { color: accent, align: "right", dy: 12 });

      sA.set(fmt(a, 2) + " m/s²");
      sT.set(fmt(T, 1) + " N");
      sW1.set(fmt(hi * G, 1) + " N");
      sW2.set(fmt(lo * G, 1) + " N");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
