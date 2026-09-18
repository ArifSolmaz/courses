/* ============================================================
   PHY101 Week 03 — projectiles and the first force diagram
   w3-independence : a dropped ball and a launched ball fall together
   w3-range        : range against launch angle, and complementary pairs
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* ---------------------------------------------------------- independence */
  PhyAnim.register("w3-independence", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Two balls leave the same height at the same instant: one is simply dropped, "
       + "the other is fired horizontally at 12 m/s. Which lands first?",
      q_tr: "İki top aynı anda aynı yükseklikten ayrılıyor: biri serbest bırakılıyor, "
          + "diğeri yatay olarak 12 m/s ile fırlatılıyor. Hangisi önce yere iner?",
      options: [["drop", "the dropped one"], ["launch", "the launched one"],
                ["same", "they land together"], ["depends", "depends on the speed"]],
      correct: "same",
      why: "The vertical equation is $y=y_0-\\tfrac12gt^2$ for both: same $y_0$, same "
         + "$v_{0y}=0$, same $g$. Horizontal speed appears nowhere in it, so it changes "
         + "<em>where</em> the second ball lands, never <em>when</em>. Raise the launch speed "
         + "below and watch the two balls stay level the whole way down.",
      why_tr: "Düşey denklem ikisi için de aynıdır; yatay hız o denklemde hiç geçmez. "
            + "Yatay hız nereye düşeceğini değiştirir, ne zaman düşeceğini değil."
    });

    var v0 = 12, h0 = 20;
    var T = Math.sqrt(2 * h0 / G);

    var sc = U.Scene(m.stage, {
      height: 270,
      alt: "Two balls falling from the same height, one dropped and one launched horizontally, "
         + "shown level with each other at every instant"
    });

    var pl = U.Player(m.controls, {
      duration: T,
      onFrame: function () { sc.draw(); }
    });
    U.slider(m.controls, "launch speed", {
      min: 0, max: 30, step: 1, value: v0, text: function (v) { return v + " m/s"; }
    }, function (v) { v0 = v; sc.draw(); });
    U.slider(m.controls, "drop height", {
      min: 5, max: 45, step: 1, value: h0, text: function (v) { return v + " m"; }
    }, function (v) {
      h0 = v; T = Math.sqrt(2 * h0 / G); pl.reset(); sc.draw();
    });

    var sT = U.stat(m.stats, "time", "—");
    var sYa = U.stat(m.stats, "height of dropped", "—");
    var sYb = U.stat(m.stats, "height of launched", "—");
    var sGap = U.stat(m.stats, "difference in height", "—");

    sc.onDraw(function (s) {
      var t = Math.min(pl.t(), T);
      var y = h0 - 0.5 * G * t * t;
      var x = v0 * t;
      var xmax = Math.max(v0 * T * 1.3, 10);

      var P = s.plot({
        w: s.w, h: s.h, xlim: [0, xmax], ylim: [0, h0 * 1.08],
        xlabel: "horizontal distance (m)", ylabel: "height (m)",
        xticks: [0, Math.round(xmax / 2), Math.round(xmax)],
        yticks: [0, Math.round(h0 / 2), h0]
      });
      P.frame();
      P.title("released together — level at every instant");

      /* the level line is the whole point: draw it before the balls */
      P.line([[0, y], [Math.max(x, 0) + xmax * 0.04, y]],
             { color: s.col("--dim", "#888"), width: 1.2, dash: [4, 4] });

      /* faint trails */
      var trailA = [], trailB = [], n = 40;
      for (var i = 0; i <= n; i++) {
        var tt = t * i / n, yy = h0 - 0.5 * G * tt * tt;
        trailA.push([0, yy]);
        trailB.push([v0 * tt, yy]);
      }
      P.line(trailA, { color: s.col("--phy-blue", "#1565c0"), width: 1.4, dash: [3, 3] });
      P.line(trailB, { color: s.col("--green", "#15803d"), width: 1.4, dash: [3, 3] });

      P.dot(0, y, { color: s.col("--phy-blue", "#1565c0"), r: 7 });
      P.dot(x, y, { color: s.col("--green", "#15803d"), r: 7 });
      P.text(0, h0 * 1.02, "dropped", { color: s.col("--phy-blue", "#1565c0"), align: "left" });
      P.text(xmax * 0.98, h0 * 1.02, "launched", { color: s.col("--green", "#15803d"), align: "right" });

      sT.set(fmt(t, 2) + " s");
      sYa.set(fmt(Math.max(y, 0), 2) + " m");
      sYb.set(fmt(Math.max(y, 0), 2) + " m");
      sGap.set("0.00 m — always");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });

  /* ---------------------------------------------------------------- range */
  PhyAnim.register("w3-range", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "At a fixed launch speed on level ground, which pair of angles gives the "
       + "<strong>same</strong> range?",
      q_tr: "Sabit atış süratinde, düz zeminde hangi açı çifti <strong>aynı</strong> menzili verir?",
      options: [["1", "20° and 40°"], ["2", "30° and 60°"], ["3", "45° and 90°"], ["4", "no pair does"]],
      correct: "2",
      why: "$R=\\dfrac{v_0^2\\sin 2\\theta}{g}$, and $\\sin 2\\theta$ is unchanged when "
         + "$\\theta\\to 90^\\circ-\\theta$: two angles either side of 45° that add to 90° share a "
         + "range. The steeper one simply spends longer in the air with less horizontal speed. "
         + "Drag the angle and watch the mirrored point keep pace.",
      why_tr: "$90^\\circ$ toplamı veren iki açı aynı menzili verir. Dik olan havada daha uzun "
            + "kalır ama yatay hızı düşüktür."
    });

    var ang = 30, v0 = 25, showPair = true;

    var sc = U.Scene(m.stage, {
      height: 320,
      alt: "Range plotted against launch angle, with the trajectory for the chosen angle "
         + "and for its complement"
    });

    U.slider(m.controls, "angle", {
      min: 5, max: 85, step: 1, value: ang, text: function (v) { return v + "°"; }
    }, function (v) { ang = v; sc.draw(); });
    U.slider(m.controls, "speed", {
      min: 10, max: 40, step: 1, value: v0, text: function (v) { return v + " m/s"; }
    }, function (v) { v0 = v; sc.draw(); });
    U.seg(m.controls, "complement", [[true, "show"], [false, "hide"]], true,
      function (v) { showPair = v; sc.draw(); });

    var sR = U.stat(m.stats, "range", "—");
    var sH = U.stat(m.stats, "peak height", "—");
    var sT = U.stat(m.stats, "flight time", "—");
    var sC = U.stat(m.stats, "complement", "—");

    function range(a, v) { return v * v * Math.sin(2 * a * Math.PI / 180) / G; }

    sc.onDraw(function (s) {
      var half = s.h / 2;
      var rad = ang * Math.PI / 180;
      var R = range(ang, v0), Rmax = v0 * v0 / G;
      var H = Math.pow(v0 * Math.sin(rad), 2) / (2 * G);
      var T = 2 * v0 * Math.sin(rad) / G;
      var comp = 90 - ang;

      /* ---- top: the two trajectories, drawn to the same scale ---- */
      var Pt = s.plot({
        w: s.w, h: half, xlim: [0, Rmax * 1.05], ylim: [0, Rmax * 0.55],
        pad: { l: 46, r: 12, t: 16, b: 22 },
        xlabel: "", ylabel: "height (m)",
        xticks: [0, Math.round(Rmax / 2), Math.round(Rmax)],
        yticks: [0, Math.round(Rmax * 0.25)]
      });
      Pt.frame();
      Pt.title("the flight");

      function traj(a, colour, dash) {
        var r = a * Math.PI / 180, tf = 2 * v0 * Math.sin(r) / G, pts = [];
        for (var i = 0; i <= 60; i++) {
          var tt = tf * i / 60;
          pts.push([v0 * Math.cos(r) * tt, v0 * Math.sin(r) * tt - 0.5 * G * tt * tt]);
        }
        Pt.line(pts, { color: colour, width: dash ? 1.8 : 2.4, dash: dash });
      }
      function apex(a) {
        var r = a * Math.PI / 180;
        return [range(a, v0) / 2, Math.pow(v0 * Math.sin(r), 2) / (2 * G)];
      }
      if (showPair && Math.abs(comp - ang) > 0.5) {
        traj(comp, s.col("--dim", "#888"), [5, 4]);
        var ac = apex(comp);
        Pt.text(ac[0], ac[1], comp + "°", { color: s.col("--dim", "#888"), align: "center", dy: -4 });
      }
      traj(ang, s.col("--phy-orange", "#e65100"));
      var aa = apex(ang);
      Pt.text(aa[0], aa[1], ang + "°", { color: s.col("--phy-orange", "#e65100"), align: "center", dy: -4 });
      Pt.dot(R, 0, { color: s.col("--phy-orange", "#e65100"), r: 5 });

      /* ---- bottom: R against angle, with the two matching points ---- */
      var Pr = s.plot({
        y: half, w: s.w, h: half, xlim: [0, 90], ylim: [0, Rmax * 1.08],
        pad: { l: 46, r: 12, t: 16, b: 30 },
        xlabel: "launch angle (°)", ylabel: "range (m)",
        xticks: [0, 15, 30, 45, 60, 75, 90],
        yticks: [0, Math.round(Rmax / 2), Math.round(Rmax)]
      });
      Pr.frame();
      Pr.title("range against angle — symmetric about 45°");

      var curve = [];
      for (var a = 0; a <= 90; a += 1) curve.push([a, range(a, v0)]);
      Pr.line(curve, { color: s.col("--phy-blue", "#1565c0"), width: 2 });
      Pr.vline(45, { color: s.col("--dim", "#888") });
      Pr.text(45, Rmax * 1.0, "45°", { color: s.col("--dim", "#888"), align: "center", dx: 0 });

      if (showPair && Math.abs(comp - ang) > 0.5) {
        Pr.dot(comp, range(comp, v0), { color: s.col("--dim", "#888"), r: 5 });
      }
      Pr.dot(ang, R, { color: s.col("--phy-orange", "#e65100"), r: 6 });

      sR.set(fmt(R, 1) + " m");
      sH.set(fmt(H, 1) + " m");
      sT.set(fmt(T, 2) + " s");
      sC.set(comp + "° gives " + fmt(range(comp, v0), 1) + " m");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
