/* ============================================================
   PHY101 Week 02 — motion in one dimension
   w2-graphs : one motion, three graphs, one clock. The time cursor
               moves across x-t, v-t and a-t together, and the shaded
               area under v-t is shown to equal the displacement.
               Targets the classic misconception that v = 0 implies a = 0.
   ============================================================ */
(function () {
  "use strict";
  PhyAnim.register("w2-graphs", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A ball is thrown straight up. At the instant it reaches its "
       + "<strong>highest point</strong>, what are its velocity and its acceleration?",
      q_tr: "Bir top d\u00fc\u015fey olarak yukar\u0131 at\u0131l\u0131yor. En y\u00fcksek noktaya "
          + "ula\u015ft\u0131\u011f\u0131 anda h\u0131z\u0131 ve ivmesi nedir?",
      options: [
        ["both0", "v = 0 and a = 0"],
        ["v0",    "v = 0, a = 9.81 m/s\u00b2 down"],
        ["a0",    "v = 9.81 m/s, a = 0"],
        ["bothup", "v = 0, a = 9.81 m/s\u00b2 up"]
      ],
      correct: "v0",
      why: "Gravity does not pause at the top. The velocity passes through zero, but the "
         + "acceleration stays $9.81\\ \\mathrm{m/s^2}$ downward the whole time \u2014 if it were zero "
         + "there, the ball would stop in mid-air. Choose <em>thrown straight up</em> below: the "
         + "v\u2013t line crosses zero while the a\u2013t line never moves off its constant value.",
      why_tr: "Yer\u00e7ekimi tepede durmaz. H\u0131z s\u0131f\u0131rdan ge\u00e7er, ama ivme boyunca "
            + "sabittir; s\u0131f\u0131r olsa top havada as\u0131l\u0131 kal\u0131rd\u0131."
    });

    var MOTIONS = {
      const_v: {
        label: "constant velocity", tmax: 5, x0: 0, v0: 3, a: 0,
        note: "No acceleration: x rises as a straight line, v is flat, a sits on zero."
      },
      const_a: {
        label: "constant acceleration", tmax: 5, x0: 0, v0: 0, a: 1.5,
        note: "x curves (it goes as t\u00b2), v rises as a straight line, a is flat and nonzero."
      },
      up: {
        label: "thrown straight up", tmax: 2.45, x0: 0, v0: 12, a: -9.81,
        note: "At the top v = 0 but a is unchanged. That is the whole point of this graph."
      },
      brake: {
        label: "braking to a stop", tmax: 5, x0: 0, v0: 15, a: -3,
        note: "v falls to zero; the shaded area is the stopping distance."
      }
    };
    var key = "const_a", M = MOTIONS[key];

    var sc = U.Scene(m.stage, {
      height: 430,
      alt: "Three stacked graphs — position, velocity and acceleration against time — sharing one time cursor"
    });

    var pl = U.Player(m.controls, {
      duration: 4,
      onFrame: function (t01) { frac = t01; sc.draw(); }
    });
    var frac = 0;

    var motionSeg = U.seg(m.controls, "motion",
      Object.keys(MOTIONS).map(function (k) { return [k, MOTIONS[k].label]; }), key,
      function (k) { key = k; M = MOTIONS[k]; pl.reset(); frac = 0; sc.draw(); });

    var sT = U.stat(m.stats, "t", "\u2014");
    var sX = U.stat(m.stats, "x", "\u2014");
    var sV = U.stat(m.stats, "v", "\u2014");
    var sA = U.stat(m.stats, "a", "\u2014");
    var sArea = U.stat(m.stats, "area under v\u2013t", "\u2014");

    function x(t) { return M.x0 + M.v0 * t + 0.5 * M.a * t * t; }
    function v(t) { return M.v0 + M.a * t; }

    function limits() {
      var n = 80, xs = [], vs = [];
      for (var i = 0; i <= n; i++) { var t = M.tmax * i / n; xs.push(x(t)); vs.push(v(t)); }
      function pad(arr, extra) {
        var lo = Math.min.apply(null, arr), hi = Math.max.apply(null, arr);
        if (lo > 0) lo = 0;
        if (hi < 0) hi = 0;
        var d = (hi - lo) || 1;
        return [lo - d * extra, hi + d * extra];
      }
      var al = M.a === 0 ? [-1, 1] : (M.a < 0 ? [M.a * 1.35, -M.a * 0.35] : [-M.a * 0.35, M.a * 1.35]);
      return { x: pad(xs, 0.1), v: pad(vs, 0.1), a: al };
    }

    sc.onDraw(function (s) {
      var L = limits();
      var t = frac * M.tmax;
      var orange = s.col("--phy-orange"), blue = s.col("--phy-blue"), green = s.col("--green");
      var panelH = s.h / 3;
      var ticks = [];
      for (var k2 = 0; k2 <= 5; k2++) ticks.push(Math.round(M.tmax * k2 / 5 * 100) / 100);

      function curve(fn, upto) {
        var pts = [], n = 120, lim = upto == null ? M.tmax : upto;
        for (var i = 0; i <= n; i++) { var tt = lim * i / n; pts.push([tt, fn(tt)]); }
        return pts;
      }

      /* --- x-t --- */
      var Px = s.plot({
        y: 0, w: s.w, h: panelH, xlim: [0, M.tmax], ylim: L.x,
        xticks: ticks, yticks: [Math.round(L.x[0]), L.x[0] < 0 && L.x[1] > 0 ? 0 : Math.round((L.x[0] + L.x[1]) / 2), Math.round(L.x[1])],
        ylabel: "x (m)", pad: { l: 52, r: 16, t: 20, b: 24 }
      });
      Px.frame(); Px.title("position");
      Px.line(curve(x), { color: blue, width: 2 });
      Px.vline(t, { color: orange });
      Px.dot(t, x(t), { color: orange, r: 4.5 });

      /* --- v-t, with the area that IS the displacement --- */
      var Pv = s.plot({
        y: panelH, w: s.w, h: panelH, xlim: [0, M.tmax], ylim: L.v,
        xticks: ticks, yticks: [Math.round(L.v[0]), 0, Math.round(L.v[1])],
        ylabel: "v (m/s)", pad: { l: 52, r: 16, t: 20, b: 24 }
      });
      Pv.frame(); Pv.title("velocity \u2014 the shaded area is the displacement");
      if (t > 0) Pv.fill(curve(v, t), { base: 0, color: s.col("--accent-soft"),
                                       negColor: s.col("--red-soft") });
      Pv.line(curve(v), { color: green, width: 2 });
      Pv.vline(t, { color: orange });
      Pv.dot(t, v(t), { color: orange, r: 4.5 });

      /* --- a-t --- */
      var Pa = s.plot({
        y: 2 * panelH, w: s.w, h: panelH, xlim: [0, M.tmax], ylim: L.a,
        xticks: ticks, yticks: M.a === 0 ? [0] : [0, Math.round(M.a * 10) / 10],
        ylabel: "a (m/s\u00b2)", xlabel: "t (s)", pad: { l: 52, r: 16, t: 20, b: 30 }
      });
      Pa.frame(); Pa.title("acceleration");
      Pa.line([[0, M.a], [M.tmax, M.a]], { color: blue, width: 2 });
      Pa.vline(t, { color: orange });
      Pa.dot(t, M.a, { color: orange, r: 4.5 });

      sT.set(fmt(t, 2) + " s");
      sX.set(fmt(x(t), 2) + " m");
      sV.set(fmt(v(t), 2) + " m/s");
      sA.set(fmt(M.a, 2) + " m/s\u00b2");
      sArea.set(fmt(x(t) - M.x0, 2) + " m = \u0394x");
    });

    gate.onReveal = function () {
      // Jump straight to the motion the question was about, and keep the
      // selector honest about what is on screen.
      key = "up"; M = MOTIONS.up;
      motionSeg.set("up");
      pl.reset(); frac = 0; sc.draw();
      pl.play();
    };
    sc.draw();
  });
})();
