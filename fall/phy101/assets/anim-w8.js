/* ============================================================
   PHY101 Week 08 — potential energy and conservation
   w8-track  : a cart on a track, with live K/U/E bars and optional friction
   w8-spring : a spring launcher — elastic energy becomes height
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* ---------------------------------------------------------------- track */
  PhyAnim.register("w8-track", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A cart is released from rest at the top of a frictionless track. It reaches the bottom, "
       + "rises over a smaller hill, and carries on. What is its speed at the bottom the "
       + "<strong>second</strong> time it passes, compared with the first?",
      q_tr: "Sürtünmesiz pistin tepesinden durgun bırakılan araba, dibe iner, küçük bir tepeyi "
          + "aşar ve devam eder. Dipten <strong>ikinci</strong> geçişindeki sürati birinciye göre "
          + "nasıldır?",
      options: [["less", "smaller"], ["same", "exactly the same"],
                ["more", "larger"], ["stops", "it never gets there"]],
      correct: "same",
      why: "Without friction, the speed at a given height is fixed by "
         + "$\\tfrac12mv^2+mgy=E$, and nothing in that equation remembers the path or the number of "
         + "trips. Same height, same speed. Turn friction on below and watch the total bar start "
         + "shrinking — that is the only thing that can change the answer.",
      why_tr: "Sürtünme yokken belirli bir yükseklikteki sürat sabittir; denklem yolu hatırlamaz. "
            + "Sürtünmeyi açınca toplam çubuk küçülmeye başlar."
    });

    var friction = 0, push = 0;
    var START = 8;                 // the crest of the first hill

    /* track profile y(s) over s in [0, 100] metres of path */
    function ground(s) {
      return 18 * Math.exp(-Math.pow((s - 8) / 14, 2))
           + 11 * Math.exp(-Math.pow((s - 55) / 13, 2))
           + 6 * Math.exp(-Math.pow((s - 88) / 12, 2)) + 1.5;
    }

    var sc = U.Scene(m.stage, {
      height: 330,
      alt: "A cart on a hilly track with three bars showing kinetic, potential and total energy"
    });

    var pl = U.Player(m.controls, { duration: 8, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "starting push", {
      min: 0, max: 120, step: 5, value: 0,
      text: function (v) { return v === 0 ? "released from rest" : v + " J"; }
    }, function (v) { push = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "friction loss", {
      min: 0, max: 0.06, step: 0.005, value: 0, text: function (v) { return v === 0 ? "none" : fmt(v * 100, 1) + "%/m"; }
    }, function (v) { friction = v; pl.reset(); sc.draw(); });

    var sPos = U.stat(m.stats, "height", "—");
    var sK = U.stat(m.stats, "kinetic", "—");
    var sU = U.stat(m.stats, "potential", "—");
    var sE = U.stat(m.stats, "total", "—");
    var sV = U.stat(m.stats, "speed", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      /* march the cart along the track at the speed energy allows */
      var mMass = 1;
      var E0 = mMass * G * ground(START) + push;   // at rest on the crest, plus any push
      var frac = Math.min(pl.t() / pl.duration, 1);
      var sPosM = START + frac * (100 - START);
      var y = ground(sPosM);
      var lost = E0 * friction * (sPosM - START);
      var E = Math.max(E0 - lost, mMass * G * y);
      var Upot = mMass * G * y;
      var K = Math.max(E - Upot, 0);
      var v = Math.sqrt(2 * K / mMass);

      /* ---- left: the track ---- */
      var LW = s.w * 0.62;
      var P = s.plot({
        w: LW, h: s.h, xlim: [0, 100], ylim: [0, 26],
        pad: { l: 44, r: 12, t: 16, b: 32 },
        xlabel: "distance along the track (m)", ylabel: "height (m)",
        xticks: [0, 50, 100], yticks: [0, 10, 20]
      });
      P.frame();
      P.title(friction ? "with friction — the total drains away" : "frictionless — the total never moves");

      var prof = [];
      for (var i = 0; i <= 200; i++) { var ss = i * 0.5; prof.push([ss, ground(ss)]); }
      P.line(prof, { color: dim, width: 2 });

      /* the height the cart can still reach, as a line it can never cross */
      P.line([[0, E / (mMass * G)], [100, E / (mMass * G)]],
             { color: accent, width: 1.3, dash: [5, 4] });
      P.text(99, E / (mMass * G), "reachable height", { color: accent, align: "right", dy: -4 });

      P.dot(sPosM, y, { color: green, r: 7 });

      /* ---- right: the energy account, as stacked bars ---- */
      var RW = s.w - LW;
      var Q = s.plot({
        x: LW, w: RW, h: s.h, xlim: [0, 3], ylim: [0, E0 * 1.15],
        pad: { l: 50, r: 12, t: 16, b: 32 },
        ylabel: "energy (J)", xticks: [],
        yticks: [0, Math.round(E0 / 2), Math.round(E0)]
      });
      Q.frame();
      Q.title("the account");

      var ctx = s.ctx;
      function bar(xc, from, to, colour) {
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.8;
        ctx.fillRect(Q.X(xc - 0.32), Q.Y(to), Q.X(xc + 0.32) - Q.X(xc - 0.32), Q.Y(from) - Q.Y(to));
        ctx.restore();
      }
      bar(0.6, 0, K, green);
      bar(1.5, 0, Upot, blue);
      bar(2.4, 0, Upot, blue);
      bar(2.4, Upot, Upot + K, green);
      Q.text(0.6, 0, "K", { color: green, align: "center", dy: 14 });
      Q.text(1.5, 0, "U", { color: blue, align: "center", dy: 14 });
      Q.text(2.4, 0, "K+U", { color: dim, align: "center", dy: 14 });
      Q.line([[0, E0], [3, E0]], { color: accent, width: 1.3, dash: [4, 4] });
      Q.text(2.9, E0, "started with", { color: accent, align: "right", dy: -4 });

      sPos.set(fmt(y, 1) + " m");
      sK.set(fmt(K, 1) + " J");
      sU.set(fmt(Upot, 1) + " J");
      sE.set(fmt(E, 1) + " J" + (friction ? "  (falling)" : "  — unchanged"));
      sV.set(fmt(v, 2) + " m/s");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });

  /* --------------------------------------------------------------- spring */
  PhyAnim.register("w8-spring", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A spring launcher fires a ball straight up. If you compress the spring "
       + "<strong>twice</strong> as far, how much higher does the ball go?",
      q_tr: "Bir yay fırlatıcı topu dik yukarı atıyor. Yayı <strong>iki kat</strong> sıkıştırırsan "
          + "top ne kadar yükselir?",
      options: [["x2", "twice as high"], ["x4", "four times as high"],
                ["x14", "1.4 times as high"], ["same", "the same height"]],
      correct: "x4",
      why: "The stored energy is $\\tfrac12kx^2$, so doubling $x$ stores four times the energy; all "
         + "of it becomes $mgh$, so the height is four times greater. The square is the whole story "
         + "— and it is why the spring bar below grows so much faster than the compression slider.",
      why_tr: "Depolanan enerji $\\tfrac12kx^2$'dir; $x$ iki katına çıkınca enerji dört katına çıkar "
            + "ve tamamı $mgh$ olur. Yükseklik dört kat artar."
    });

    var comp = 0.10, k = 800, mass = 0.30;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A spring launcher with energy bars and a curve of launch height against compression"
    });

    U.slider(m.controls, "compression", {
      min: 0.02, max: 0.20, step: 0.005, value: comp,
      text: function (v) { return fmt(v * 100, 1) + " cm"; }
    }, function (v) { comp = v; sc.draw(); });
    U.slider(m.controls, "spring constant", {
      min: 200, max: 2000, step: 50, value: k, text: function (v) { return v + " N/m"; }
    }, function (v) { k = v; sc.draw(); });
    U.slider(m.controls, "ball mass", {
      min: 0.05, max: 1.0, step: 0.05, value: mass,
      text: function (v) { return fmt(v, 2) + " kg"; }
    }, function (v) { mass = v; sc.draw(); });

    var sUs = U.stat(m.stats, "stored ½kx²", "—");
    var sH = U.stat(m.stats, "launch height", "—");
    var sVv = U.stat(m.stats, "launch speed", "—");
    var sDbl = U.stat(m.stats, "double the squeeze", "—");

    function height(x) { return 0.5 * k * x * x / (mass * G); }

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var Hnow = height(comp), Hmax = height(0.20);
      var half = s.w * 0.44;

      /* ---- left: launcher and the height reached ---- */
      var P = s.plot({
        w: half, h: s.h, xlim: [0, 4], ylim: [0, Math.max(Hmax, 0.5) * 1.1],
        pad: { l: 50, r: 12, t: 16, b: 32 },
        ylabel: "height (m)", xticks: [],
        yticks: [0, Math.round(Hmax / 2), Math.round(Hmax)]
      });
      P.frame();
      P.title("how high it goes");

      var ctx = s.ctx;
      /* the compressed spring, drawn to scale at the base */
      var sy = P.ylim[1] * 0.06 * (comp / 0.20);
      ctx.save();
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var f2 = i / 40;
        var xx = 1.6 + 0.5 * Math.sin(f2 * Math.PI * 9);
        var yy = f2 * sy;
        i ? ctx.lineTo(P.X(xx), P.Y(yy)) : ctx.moveTo(P.X(xx), P.Y(yy));
      }
      ctx.stroke();
      ctx.restore();

      P.line([[0.6, Hnow], [3.4, Hnow]], { color: green, width: 2 });
      P.dot(1.6, Hnow, { color: green, r: 7 });
      P.text(3.3, Hnow, fmt(Hnow, 2) + " m", { color: green, align: "right", dy: -6 });

      /* ---- right: height against compression — a parabola, not a line ---- */
      var Q = s.plot({
        x: half, w: s.w - half, h: s.h, xlim: [0, 20], ylim: [0, Math.max(Hmax, 0.5) * 1.1],
        pad: { l: 50, r: 14, t: 16, b: 34 },
        xlabel: "compression (cm)", ylabel: "height (m)",
        xticks: [0, 5, 10, 15, 20],
        yticks: [0, Math.round(Hmax / 2), Math.round(Hmax)]
      });
      Q.frame();
      Q.title("height goes as the square of the squeeze");

      var curve = [];
      for (i = 0; i <= 80; i++) { var xc = 0.20 * i / 80; curve.push([xc * 100, height(xc)]); }
      Q.line(curve, { color: blue, width: 2.4 });
      Q.dot(comp * 100, Hnow, { color: green, r: 6 });

      /* the doubling, drawn as two guides so the factor of four is visible */
      if (comp * 2 <= 0.20) {
        Q.dot(comp * 200, height(comp * 2), { color: accent, r: 5 });
        Q.line([[comp * 200, 0], [comp * 200, height(comp * 2)]],
               { color: accent, width: 1.2, dash: [4, 3] });
        Q.line([[0, height(comp * 2)], [comp * 200, height(comp * 2)]],
               { color: accent, width: 1.2, dash: [4, 3] });
      }
      Q.line([[comp * 100, 0], [comp * 100, Hnow]], { color: green, width: 1.2, dash: [4, 3] });

      sUs.set(fmt(0.5 * k * comp * comp, 2) + " J");
      sH.set(fmt(Hnow, 2) + " m");
      sVv.set(fmt(Math.sqrt(2 * G * Hnow), 2) + " m/s");
      sDbl.set(comp * 2 <= 0.20
        ? fmt(height(comp * 2), 2) + " m  =  4.00 ×"
        : "off the slider — but still 4 ×");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
