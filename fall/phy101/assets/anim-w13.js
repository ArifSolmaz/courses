/* ============================================================
   PHY101 Week 13 — simple harmonic motion
   w13-shm    : x, v, a together, with the phase-space loop beside them
   w13-energy : K and U trading places, against position and against time
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* -------------------------------------------------------------------- shm */
  PhyAnim.register("w13-shm", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A mass on a spring is released from its furthest point. At the instant it passes through "
       + "the centre, what are its speed and its acceleration?",
      q_tr: "Yaydaki kütle en uzak noktadan bırakılıyor. Tam merkezden geçtiği anda sürati ve ivmesi "
          + "nedir?",
      options: [["both", "both are largest"], ["vmax", "speed largest, acceleration zero"],
                ["amax", "speed zero, acceleration largest"], ["zero", "both are zero"]],
      correct: "vmax",
      why: "Acceleration follows the force, and the spring force is $-kx$ — at the centre $x=0$, so "
         + "there is no force and no acceleration. All the energy is kinetic there, so the speed is "
         + "at its greatest. At the ends it is the other way round. The three curves below are the "
         + "same motion read three ways, each a quarter cycle behind the last.",
      why_tr: "İvme kuvveti izler ve yay kuvveti $-kx$'tir: merkezde $x=0$, yani ivme sıfırdır. "
            + "Tüm enerji kinetiktir, sürat en büyüktür. Uçlarda tam tersi olur."
    });

    var A = 1.0, k = 8, mass = 0.5;

    var sc = U.Scene(m.stage, {
      height: 340,
      alt: "Displacement, velocity and acceleration against time for one oscillation, with the "
         + "velocity-against-displacement loop beside them"
    });

    var pl = U.Player(m.controls, { duration: 6, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "spring constant", {
      min: 2, max: 40, step: 1, value: k, text: function (v) { return v + " N/m"; }
    }, function (v) { k = v; sc.draw(); });
    U.slider(m.controls, "mass", {
      min: 0.1, max: 3, step: 0.1, value: mass, text: function (v) { return fmt(v, 1) + " kg"; }
    }, function (v) { mass = v; sc.draw(); });
    U.slider(m.controls, "amplitude", {
      min: 0.2, max: 1.5, step: 0.1, value: A, text: function (v) { return fmt(v, 1) + " m"; }
    }, function (v) { A = v; sc.draw(); });

    var sOm = U.stat(m.stats, "ω", "—");
    var sT = U.stat(m.stats, "period", "—");
    var sX = U.stat(m.stats, "x", "—");
    var sV = U.stat(m.stats, "v", "—");
    var sAc = U.stat(m.stats, "a", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var om = Math.sqrt(k / mass), T = 2 * Math.PI / om;
      /* The period depends on the k and m sliders, but a Player's duration is
         fixed when it is built. Map the scrub fraction onto the window the plots
         actually show, so the cursor and the readouts can never disagree. */
      var tspan = 2 * T;
      var t = (pl.t() / pl.duration) * tspan;
      var x = A * Math.cos(om * t);
      var v = -A * om * Math.sin(om * t);
      var acc = -om * om * x;

      var vmax = A * om, amax = A * om * om;

      /* ---- left: the three curves, stacked and sharing one time axis ---- */
      var LW = s.w * 0.60;
      var rowH = s.h / 3;
      var rows = [
        { lab: "x", col: blue, f: function (tt) { return A * Math.cos(om * tt); }, m: A },
        { lab: "v", col: green, f: function (tt) { return -A * om * Math.sin(om * tt); }, m: vmax },
        { lab: "a", col: accent, f: function (tt) { return -A * om * om * Math.cos(om * tt); }, m: amax }
      ];
      rows.forEach(function (row, i) {
        var P = s.plot({
          y: i * rowH, w: LW, h: rowH, xlim: [0, tspan], ylim: [-row.m * 1.25, row.m * 1.25],
          pad: { l: 40, r: 12, t: 12, b: i === 2 ? 26 : 8 },
          xlabel: i === 2 ? "time (s)" : "", ylabel: row.lab,
          xticks: i === 2 ? [0, fmt(T, 1) * 1, fmt(2 * T, 1) * 1] : []
        });
        P.frame();
        var pts = [];
        for (var j = 0; j <= 160; j++) {
          var tt = tspan * j / 160;
          pts.push([tt, row.f(tt)]);
        }
        P.line(pts, { color: row.col, width: 2.2 });
        P.vline(t, { color: dim });
        P.dot(t, row.f(t), { color: row.col, r: 5 });
      });

      /* ---- right: phase space, where the whole motion is one closed loop ---- */
      var Q = s.plot({
        x: LW, w: s.w - LW, h: s.h, xlim: [-A * 1.3, A * 1.3], ylim: [-vmax * 1.3, vmax * 1.3],
        pad: { l: 52, r: 16, t: 20, b: 36 },
        xlabel: "x (m)", ylabel: "v (m/s)",
        xticks: [-fmt(A, 1) * 1, 0, fmt(A, 1) * 1],
        yticks: [-fmt(vmax, 1) * 1, 0, fmt(vmax, 1) * 1]
      });
      Q.frame();
      Q.title("one loop per cycle");
      var loop = [];
      for (var j = 0; j <= 120; j++) {
        var ph = 2 * Math.PI * j / 120;
        loop.push([A * Math.cos(ph), -A * om * Math.sin(ph)]);
      }
      Q.line(loop, { color: dim, width: 1.6 });
      Q.dot(x, v, { color: accent, r: 6 });
      Q.line([[x, 0], [x, v]], { color: dim, width: 1, dash: [3, 3] });
      Q.line([[0, v], [x, v]], { color: dim, width: 1, dash: [3, 3] });

      sOm.set(fmt(om, 2) + " rad/s");
      sT.set(fmt(T, 2) + " s");
      sX.set(fmt(x, 2) + " m");
      sV.set(fmt(v, 2) + " m/s");
      sAc.set(fmt(acc, 2) + " m/s²");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });

  /* ----------------------------------------------------------------- energy */
  PhyAnim.register("w13-energy", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Over one full cycle of an undamped oscillation, how many times does the kinetic energy "
       + "reach its maximum?",
      q_tr: "Sönümsüz bir salınımın bir tam çevriminde kinetik enerji kaç kez en büyük değerine "
          + "ulaşır?",
      options: [["1", "once"], ["2", "twice"], ["4", "four times"], ["0", "it is constant"]],
      correct: "2",
      why: "The mass passes through the centre twice each cycle — once going each way — and the "
         + "kinetic energy only cares about speed, not direction. So $K$ completes two full cycles "
         + "for every one of $x$: the energy curves oscillate at <em>twice</em> the frequency of "
         + "the motion. Watch the two humps in the right-hand panel per single swing on the left.",
      why_tr: "Kütle her çevrimde merkezden iki kez geçer ve kinetik enerji yönü umursamaz. Enerji "
            + "eğrileri hareketin <em>iki katı</em> frekansında salınır."
    });

    var A = 1.0, k = 8, mass = 0.5;

    var sc = U.Scene(m.stage, {
      height: 330,
      alt: "Kinetic and potential energy against position and against time, always summing to the "
         + "same total"
    });

    var pl = U.Player(m.controls, { duration: 6, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "spring constant", {
      min: 2, max: 40, step: 1, value: k, text: function (v) { return v + " N/m"; }
    }, function (v) { k = v; sc.draw(); });
    U.slider(m.controls, "amplitude", {
      min: 0.2, max: 1.5, step: 0.1, value: A, text: function (v) { return fmt(v, 1) + " m"; }
    }, function (v) { A = v; sc.draw(); });

    var sE = U.stat(m.stats, "total ½kA²", "—");
    var sK = U.stat(m.stats, "K", "—");
    var sU = U.stat(m.stats, "U", "—");
    var sSum = U.stat(m.stats, "K + U", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var om = Math.sqrt(k / mass), T = 2 * Math.PI / om;
      var tspan = 2 * T;                          // same mapping as w13-shm
      var t = (pl.t() / pl.duration) * tspan;
      var x = A * Math.cos(om * t);
      var E = 0.5 * k * A * A;
      var Upot = 0.5 * k * x * x;
      var K = E - Upot;

      /* ---- left: energy against position — the bowl and its mirror ---- */
      var LW = s.w * 0.47;
      var P = s.plot({
        w: LW, h: s.h, xlim: [-A * 1.15, A * 1.15], ylim: [0, E * 1.25],
        pad: { l: 54, r: 14, t: 18, b: 34 },
        xlabel: "position x (m)", ylabel: "energy (J)",
        xticks: [-fmt(A, 1) * 1, 0, fmt(A, 1) * 1],
        yticks: [0, fmt(E / 2, 1) * 1, fmt(E, 1) * 1]
      });
      P.frame();
      P.title("against position");
      var cu = [], ck = [];
      for (var i = 0; i <= 100; i++) {
        var xx = -A + 2 * A * i / 100;
        cu.push([xx, 0.5 * k * xx * xx]);
        ck.push([xx, E - 0.5 * k * xx * xx]);
      }
      P.line([[-A * 1.15, E], [A * 1.15, E]], { color: dim, width: 1.3, dash: [5, 4] });
      P.text(A * 1.1, E, "total", { color: dim, align: "right", dy: -4 });
      P.line(cu, { color: blue, width: 2.2 });
      P.line(ck, { color: green, width: 2.2 });
      P.vline(x, { color: accent });
      P.dot(x, Upot, { color: blue, r: 5 });
      P.dot(x, K, { color: green, r: 5 });
      P.text(-A * 0.80, 0.5 * k * A * A * 0.80 * 0.80, "U", { color: blue, align: "right", dx: -4, dy: 4 });
      P.text(0, E, "K", { color: green, align: "center", dy: -6 });

      /* ---- right: the same two against time — twice the frequency ---- */
      var Q = s.plot({
        x: LW, w: s.w - LW, h: s.h, xlim: [0, tspan], ylim: [0, E * 1.25],
        pad: { l: 50, r: 14, t: 18, b: 34 },
        xlabel: "time (s)", ylabel: "",
        xticks: [0, fmt(T, 1) * 1, fmt(2 * T, 1) * 1],
        yticks: [0, fmt(E, 1) * 1]
      });
      Q.frame();
      Q.title("against time — two humps per swing");
      var ku = [], kk = [], xt = [];
      for (i = 0; i <= 200; i++) {
        var tt = tspan * i / 200;
        var xv = A * Math.cos(om * tt);
        ku.push([tt, 0.5 * k * xv * xv]);
        kk.push([tt, E - 0.5 * k * xv * xv]);
        xt.push([tt, E * 0.5 + E * 0.42 * Math.cos(om * tt)]);
      }
      Q.line(xt, { color: dim, width: 1.2, dash: [4, 3] });
      Q.text(tspan * 0.5, E * 0.5, "x, for comparison",
             { color: dim, align: "center", dy: 4 });
      Q.line(ku, { color: blue, width: 2.2 });
      Q.line(kk, { color: green, width: 2.2 });
      Q.line([[0, E], [tspan, E]], { color: dim, width: 1.3, dash: [5, 4] });
      Q.vline(t, { color: accent });
      Q.dot(t, Upot, { color: blue, r: 5 });
      Q.dot(t, K, { color: green, r: 5 });

      sE.set(fmt(E, 2) + " J");
      sK.set(fmt(K, 2) + " J");
      sU.set(fmt(Upot, 2) + " J");
      sSum.set(fmt(K + Upot, 2) + " J — always");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
