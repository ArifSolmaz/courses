/* ============================================================
   PHY101 Week 10 — rotational kinematics and moment of inertia
   w10-omega   : one angular velocity, many linear speeds
   w10-inertia : the same mass, moved out, is four times harder to spin
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- omega */
  PhyAnim.register("w10-omega", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Two children sit on a spinning roundabout, one twice as far from the centre as the "
       + "other. Compared with the inner child, the outer one has …",
      q_tr: "Dönen bir atlıkarıncada iki çocuk oturuyor; biri merkeze diğerinin iki katı uzaklıkta. "
          + "İçteki çocuğa göre dıştaki çocuğun …",
      options: [["w2", "twice the angular velocity"],
                ["v2", "the same ω but twice the speed"],
                ["both", "twice of both"],
                ["same", "the same of both"]],
      correct: "v2",
      why: "They stay in line with each other, so they sweep the same angle in the same time: "
         + "$\\omega$ belongs to the whole disc. But the outer child travels round a circle twice "
         + "as big in that same time, so $v=\\omega r$ is twice as large. Angular quantities are "
         + "shared; linear ones are not.",
      why_tr: "Aynı sürede aynı açıyı tararlar, yani $\\omega$ ortaktır. Ama dıştaki iki kat büyük "
            + "bir çember kat eder: $v=\\omega r$ iki katıdır."
    });

    var omega = 1.4, r1 = 0.45;

    var sc = U.Scene(m.stage, {
      height: 320,
      alt: "A rotating disc with two marked points at different radii and their velocity arrows"
    });

    var pl = U.Player(m.controls, { duration: 6, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "angular velocity", {
      min: 0.2, max: 3, step: 0.1, value: omega,
      text: function (v) { return fmt(v, 1) + " rad/s"; }
    }, function (v) { omega = v; sc.draw(); });
    U.slider(m.controls, "inner radius", {
      min: 0.15, max: 0.9, step: 0.05, value: r1,
      text: function (v) { return fmt(v, 2) + " m"; }
    }, function (v) { r1 = Math.min(v, 0.9); sc.draw(); });

    var sW = U.stat(m.stats, "ω (both points)", "—");
    var sV1 = U.stat(m.stats, "inner speed", "—");
    var sV2 = U.stat(m.stats, "rim speed", "—");
    var sRatio = U.stat(m.stats, "ratio", "—");
    var sT = U.stat(m.stats, "one turn takes", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var R = 1.0;
      var ang = omega * pl.t();
      var v1 = omega * r1, v2 = omega * R;

      var LW = s.w * 0.56;
      var span = 1.35;
      var P = s.plot({
        w: LW, h: s.h, xlim: [-span, span],
        ylim: [-span * (s.h - 46) / (LW - 58), span * (s.h - 46) / (LW - 58)],
        pad: { l: 46, r: 12, t: 16, b: 30 }, xticks: [], yticks: []
      });
      P.title("one disc, one ω");

      var ctx = s.ctx;
      ctx.save();
      ctx.strokeStyle = dim; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(P.X(0), P.Y(0), Math.abs(P.X(R) - P.X(0)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      /* the radius line makes "they stay in line" visible */
      var cx = Math.cos(ang), cy = Math.sin(ang);
      P.line([[0, 0], [R * cx, R * cy]], { color: dim, width: 1.4 });

      /* tangential velocity: perpendicular to the radius, magnitude omega*r */
      var tx = -cy, ty = cx, k = 0.42;
      P.dot(r1 * cx, r1 * cy, { color: blue, r: 6 });
      P.dot(R * cx, R * cy, { color: green, r: 6 });
      P.arrow(r1 * cx, r1 * cy, r1 * cx + tx * v1 * k, r1 * cy + ty * v1 * k,
              { color: blue, width: 2.2 });
      P.arrow(R * cx, R * cy, R * cx + tx * v2 * k, R * cy + ty * v2 * k,
              { color: green, width: 2.2 });
      P.dot(0, 0, { color: dim, r: 4 });

      /* ---- right: v against r is a straight line through the origin ---- */
      var Q = s.plot({
        x: LW, w: s.w - LW, h: s.h, xlim: [0, 1.05], ylim: [0, Math.max(omega * 1.05, 0.3) * 1.15],
        pad: { l: 54, r: 14, t: 16, b: 34 },
        xlabel: "radius r (m)", ylabel: "speed v (m/s)",
        xticks: [0, 0.5, 1], yticks: [0, fmt(omega / 2, 1) * 1, fmt(omega, 1) * 1]
      });
      Q.frame();
      Q.title("v = ωr — a straight line, slope ω");
      Q.line([[0, 0], [1.05, omega * 1.05]], { color: accent, width: 2.4 });
      Q.dot(r1, v1, { color: blue, r: 6 });
      Q.dot(R, v2, { color: green, r: 6 });
      Q.line([[r1, 0], [r1, v1]], { color: blue, width: 1.1, dash: [4, 3] });
      Q.line([[R, 0], [R, v2]], { color: green, width: 1.1, dash: [4, 3] });

      sW.set(fmt(omega, 2) + " rad/s — shared");
      sV1.set(fmt(v1, 2) + " m/s");
      sV2.set(fmt(v2, 2) + " m/s");
      sRatio.set(fmt(v2 / (v1 || 1e-9), 2) + " ×  = the radius ratio");
      sT.set(fmt(2 * Math.PI / omega, 2) + " s");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });

  /* -------------------------------------------------------------- inertia */
  PhyAnim.register("w10-inertia", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "You hold a bar with two heavy weights bolted to it and spin it about its centre. You then "
       + "slide both weights out to twice the distance, without changing anything else. Spinning it "
       + "up is now …",
      q_tr: "Ortasından döndürdüğün, üzerine iki ağırlık cıvatalanmış bir çubuk. Ağırlıkları iki "
          + "kat uzağa kaydırıyorsun. Onu döndürmek artık …",
      options: [["x2", "twice as hard"], ["x4", "four times as hard"],
                ["same", "exactly as hard"], ["half", "easier"]],
      correct: "x4",
      why: "Moment of inertia counts every scrap of mass by the <em>square</em> of its distance: "
         + "$I=\\sum mr^2$. Twice the distance is four times the inertia, for the same mass and the "
         + "same torque. Nothing about the bar got heavier — only further out.",
      why_tr: "Eylemsizlik momenti her kütleyi uzaklığın <em>karesiyle</em> sayar: $I=\\sum mr^2$. "
            + "İki kat uzaklık, dört kat eylemsizlik demektir."
    });

    var r = 0.30, torque = 2.0, mBlob = 1.0;

    var sc = U.Scene(m.stage, {
      height: 310,
      alt: "Two dumbbells of equal mass spun by equal torques, one with its masses further out, "
         + "with their angular positions compared over time"
    });

    var pl = U.Player(m.controls, { duration: 5, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "inner radius", {
      min: 0.10, max: 0.45, step: 0.01, value: r, text: function (v) { return fmt(v, 2) + " m"; }
    }, function (v) { r = v; pl.reset(); sc.draw(); });
    U.slider(m.controls, "applied torque", {
      min: 0.5, max: 6, step: 0.5, value: torque, text: function (v) { return fmt(v, 1) + " N·m"; }
    }, function (v) { torque = v; pl.reset(); sc.draw(); });

    var sI1 = U.stat(m.stats, "I close in", "—");
    var sI2 = U.stat(m.stats, "I twice out", "—");
    var sA1 = U.stat(m.stats, "α close in", "—");
    var sA2 = U.stat(m.stats, "α twice out", "—");
    var sTurn = U.stat(m.stats, "turns so far", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var I1 = 2 * mBlob * r * r;
      var I2 = 2 * mBlob * (2 * r) * (2 * r);
      var a1 = torque / I1, a2 = torque / I2;
      var t = pl.t();
      var th1 = 0.5 * a1 * t * t, th2 = 0.5 * a2 * t * t;

      var ctx = s.ctx;
      var topH = s.h * 0.56;
      var halfW = s.w / 2;

      function rig(x0, w, rad, theta, colour, label) {
        var span = 1.05;
        var P = s.plot({
          x: x0, w: w, h: topH, xlim: [-span, span],
          ylim: [-span * (topH - 40) / (w - 40), span * (topH - 40) / (w - 40)],
          pad: { l: 20, r: 20, t: 16, b: 20 }, xticks: [], yticks: []
        });
        P.title(label);
        var cx = Math.cos(theta), cy = Math.sin(theta);
        P.line([[-rad * cx, -rad * cy], [rad * cx, rad * cy]], { color: dim, width: 2 });
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.85;
        [1, -1].forEach(function (sg) {
          ctx.beginPath();
          ctx.arc(P.X(sg * rad * cx), P.Y(sg * rad * cy), 11, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
        P.dot(0, 0, { color: dim, r: 3.5 });
      }
      rig(0, halfW, r * 2, th1, blue, "mass close in");
      rig(halfW, halfW, Math.min(2 * r * 2, 1.0), th2, green, "mass twice as far out");

      /* ---- bottom: angle turned, so "four times harder" is a measurement ---- */
      var Q = s.plot({
        y: topH, w: s.w, h: s.h - topH, xlim: [0, pl.duration],
        ylim: [0, Math.max(0.5 * a1 * pl.duration * pl.duration, 1)],
        pad: { l: 58, r: 14, t: 18, b: 32 },
        xlabel: "time (s)", ylabel: "angle (rad)",
        xticks: [0, 1, 2, 3, 4, 5]
      });
      Q.frame();
      Q.title("same torque, same time — one turns four times as far");
      var c1 = [], c2 = [];
      for (var i = 0; i <= 80; i++) {
        var tt = pl.duration * i / 80;
        c1.push([tt, 0.5 * a1 * tt * tt]);
        c2.push([tt, 0.5 * a2 * tt * tt]);
      }
      Q.line(c1, { color: blue, width: 2.2 });
      Q.line(c2, { color: green, width: 2.2 });
      Q.vline(t, { color: accent });
      Q.dot(t, th1, { color: blue, r: 5 });
      Q.dot(t, th2, { color: green, r: 5 });

      sI1.set(fmt(I1, 3) + " kg·m²");
      sI2.set(fmt(I2, 3) + " kg·m²  = 4 ×");
      sA1.set(fmt(a1, 2) + " rad/s²");
      sA2.set(fmt(a2, 2) + " rad/s²  = ¼");
      sTurn.set(fmt(th1 / (2 * Math.PI), 2) + "  vs  " + fmt(th2 / (2 * Math.PI), 2));
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
