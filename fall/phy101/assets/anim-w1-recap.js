/* ============================================================
   PHY101 Week 01 recap — products of vectors (Y&F ch. 1 §1.10)

   w1r-dot      : the scalar product two ways (Example 1.9 and the
                  variation problems), with the projection drawn.
   w1r-angle3d  : the angle between two vectors in three dimensions
                  (Example 1.10, VP1.10.3), on a rotatable view.
   w1r-work     : work as a scalar product with one unknown
                  component (VP1.10.4).
   w1r-cross    : the vector product in the plane (Example 1.11):
                  parallelogram, ± k̂, and the swapped order.
   w1r-torque   : torque as r × F (problem P9): where the turning
                  effect is largest, zero, and which way it turns.
   w1r-cross3d  : a vector product in three dimensions, drawn
                  perpendicular to both factors.

   Uses the shared harness in anim.js (PhyAnim.ui). Every drawing keeps
   one scale on both axes: an angle drawn on unequal axes is the wrong
   angle, and angles are the whole point here.
   ============================================================ */
(function () {
  "use strict";

  var DEG = Math.PI / 180;

  function evenPlot(s, o) {
    var pad = o.pad || { l: 56, r: 16, t: 24, b: 36 };
    var ph = (o.h || s.h) - pad.t - pad.b;
    var scale = ph / (o.ylim[1] - o.ylim[0]);
    var pw = (o.xlim[1] - o.xlim[0]) * scale;
    var boxW = Math.min(s.w - (o.x || 0), pw + pad.l + pad.r);
    return s.plot({
      x: (o.x || 0) + Math.max(0, (s.w - (o.x || 0) - boxW) / 2),
      y: o.y || 0, w: boxW, h: o.h || s.h,
      xlim: o.xlim, ylim: o.ylim, xticks: o.xticks, yticks: o.yticks,
      xlabel: o.xlabel, ylabel: o.ylabel, pad: pad
    });
  }

  function ticks(lim, step) {
    var out = [];
    for (var v = -Math.floor(lim / step) * step; v <= lim + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
    return out;
  }

  /* an angle arc from angle a to angle b (degrees, signed sweep), radius r data units */
  function arc(P, cx, cy, r, a, b, opt) {
    var pts = [], n = 40;
    for (var i = 0; i <= n; i++) {
      var t = (a + (b - a) * i / n) * DEG;
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    P.line(pts, opt);
  }

  function pol(m, deg) { return [m * Math.cos(deg * DEG), m * Math.sin(deg * DEG)]; }
  function dot2(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function crossz(a, b) { return a[0] * b[1] - a[1] * b[0]; }
  function mag(v) { return Math.hypot.apply(null, v); }
  function sgnfmt(x, d) { var f = PhyAnim.ui.fmt(x, d); return (x > 0 ? "+" : "") + f; }

  /* -------- a tiny 3-D view: yaw about z, then tilt by an elevation -------- */
  function View3(yaw, elev) {
    var self = { yaw: yaw, elev: elev };
    self.project = function (v) {
      var q = self.yaw * DEG, t = self.elev * DEG;
      var u = v[0] * Math.cos(q) - v[1] * Math.sin(q);        /* screen right */
      var w = v[0] * Math.sin(q) + v[1] * Math.cos(q);        /* into the screen */
      return [u, v[2] * Math.cos(t) + w * Math.sin(t)];       /* screen up */
    };
    return self;
  }

  function drawAxes3(P, view, L, col) {
    var o = view.project([0, 0, 0]);
    [["x", [L, 0, 0]], ["y", [0, L, 0]], ["z", [0, 0, L]]].forEach(function (ax) {
      var p = view.project(ax[1]);
      P.arrow(o[0], o[1], p[0], p[1], { color: col, width: 1.2, head: 6 });
      P.text(p[0], p[1], ax[0], { color: col, dx: 6, dy: -4 });
    });
  }

  /* ================================================================ 1 */
  PhyAnim.register("w1r-dot", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Example 1.9: <strong>A</strong> = 4.00 at 53.0° and <strong>B</strong> = 5.00 at 130.0°, "
       + "both measured from +<em>x</em>. Before any arithmetic — is <strong>A · B</strong> positive, zero or negative?",
      q_tr: "Örnek 1.9: A = 4.00 (53.0°), B = 5.00 (130.0°). Hesap yapmadan: A · B pozitif mi, sıfır mı, negatif mi?",
      options: [["pos", "positive"], ["zero", "zero"], ["neg", "negative"], ["cant", "cannot tell without the components"]],
      correct: "pos",
      why: "The angle between them is 130.0° − 53.0° = 77.0°, less than 90°, so cos φ > 0 and "
         + "$\\vec A\\cdot\\vec B = AB\\cos\\phi = (4.00)(5.00)\\cos 77.0^\\circ = 4.50$. "
         + "The component route gives the same 4.50: (2.407)(−3.214) + (3.195)(3.830). The sign was decided by the angle alone.",
      why_tr: "Aradaki açı 77.0° < 90° olduğundan kosinüs pozitif, çarpım +4.50. Bileşen yolu da 4.50 verir."
    });

    var presets = {
      ex19:  { A: 4.00, tA: 53.0, B: 5.00, tB: 130.0, unit: "", label: "Example 1.9" },
      vp1:   { A: 5.00, tA: -36.9, B: 6.40, tB: 110.0, unit: "", label: "VP1.10.1" },
      vp2:   { A: 6.50, tA: 55.0, B: 9.675, tB: -60.26, unit: "", label: "VP1.10.2" },
      p8:    { A: 2.563, tA: 20.56, B: 1.897, tB: 108.43, unit: " (×100 N)", label: "P8 cables" }
    };
    var st = Object.assign({}, presets.ex19);

    var sc = U.Scene(m.stage, { height: 360, alt: "Two vectors tail to tail with the projection of B on A and the angle between them" });

    U.seg(m.controls, "case", [["ex19", "Ex 1.9"], ["vp1", "VP1.10.1"], ["vp2", "VP1.10.2"], ["p8", "P8"]], "ex19",
      function (k) { Object.assign(st, presets[k]); sync(); sc.draw(); });
    var cA = U.slider(m.controls, "A", { min: 0.5, max: 10, step: 0.05, value: st.A, text: function (v) { return fmt(v, 2); } }, function (v) { st.A = v; sc.draw(); });
    var cTA = U.slider(m.controls, "θA", { min: -180, max: 180, step: 0.5, value: st.tA, text: function (v) { return fmt(v, 1) + "°"; } }, function (v) { st.tA = v; sc.draw(); });
    var cB = U.slider(m.controls, "B", { min: 0.5, max: 10, step: 0.05, value: st.B, text: function (v) { return fmt(v, 2); } }, function (v) { st.B = v; sc.draw(); });
    var cTB = U.slider(m.controls, "θB", { min: -180, max: 180, step: 0.5, value: st.tB, text: function (v) { return fmt(v, 1) + "°"; } }, function (v) { st.tB = v; sc.draw(); });
    function sync() { cA.set(st.A); cTA.set(st.tA); cB.set(st.B); cTB.set(st.tB); }

    var sPhi = U.stat(m.stats, "φ between them", "—");
    var sGeo = U.stat(m.stats, "AB cos φ", "—");
    var sCmp = U.stat(m.stats, "AxBx + AyBy", "—");
    var sProj = U.stat(m.stats, "B cos φ (along A)", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), green = s.col("--green"), dim = s.col("--muted");
      var a = pol(st.A, st.tA), b = pol(st.B, st.tB);
      var lim = Math.max(st.A, st.B) * 1.15 + 0.5;
      var step = lim > 6 ? 4 : 2;
      var P = evenPlot(s, { xlim: [-lim, lim], ylim: [-lim, lim], xticks: ticks(lim, step), yticks: ticks(lim, step),
                            xlabel: "x", ylabel: "y" });
      P.frame();
      P.line([[-lim, 0], [lim, 0]], { color: dim, width: 1 });
      P.line([[0, -lim], [0, lim]], { color: dim, width: 1 });

      var d = dot2(a, b), phi = Math.acos(Math.max(-1, Math.min(1, d / (st.A * st.B)))) / DEG;
      /* projection of B on the line of A: (B cos phi) along the unit vector of A */
      var ua = [a[0] / st.A, a[1] / st.A], bc = d / st.A, proj = [ua[0] * bc, ua[1] * bc];
      P.line([[-ua[0] * lim, -ua[1] * lim], [ua[0] * lim, ua[1] * lim]], { color: dim, width: 1, dash: [3, 4] });
      P.line([[0, 0], proj], { color: green, width: 5 });
      P.line([proj, b], { color: dim, width: 1.2, dash: [4, 3] });
      /* the angle arc from A toward B, the shorter way */
      var sweep = ((st.tB - st.tA) % 360 + 540) % 360 - 180;
      var ra = Math.min(st.A, st.B) * 0.28;
      arc(P, 0, 0, ra, st.tA, st.tA + sweep, { color: dim, width: 1.4 });
      var mid = (st.tA + sweep / 2) * DEG, rr = ra * 1.5 + lim * 0.03;
      P.text(rr * Math.cos(mid), rr * Math.sin(mid), "φ", { color: dim, size: 13, align: "center", baseline: "middle" });

      P.arrow(0, 0, a[0], a[1], { color: blue, width: 2.6 });
      P.arrow(0, 0, b[0], b[1], { color: orange, width: 2.6 });
      P.text(a[0], a[1], "A", { color: blue, size: 14, dx: 8 * Math.sign(a[0] || 1), dy: -6, align: a[0] >= 0 ? "left" : "right" });
      P.text(b[0], b[1], "B", { color: orange, size: 14, dx: 8 * Math.sign(b[0] || 1), dy: -6, align: b[0] >= 0 ? "left" : "right" });
      /* the projection label sits at the tip of the green segment, on the side of A's line away from B */
      var side = crossz(a, b) >= 0 ? -1 : 1;
      P.text(proj[0], proj[1], "B cos φ", { color: green, size: 11, dx: side * -ua[1] * 28, dy: side * -ua[0] * 28 + 4, align: "center", baseline: "middle" });
      P.title(st.label + " — A·B = AB cos φ = AxBx + AyBy");

      sPhi.set(fmt(phi, 1) + "°");
      sGeo.set(fmt(st.A * st.B * Math.cos(phi * DEG), 2) + st.unit);
      sCmp.set(fmt(d, 2) + "  = (" + fmt(a[0], 3) + ")(" + fmt(b[0], 3) + ") + (" + fmt(a[1], 3) + ")(" + fmt(b[1], 3) + ")");
      sProj.set(sgnfmt(bc, 2) + (bc < 0 ? "  — against A" : ""));
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ================================================================ 2 */
  PhyAnim.register("w1r-angle3d", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Example 1.10: <strong>A</strong> = 2.00î + 3.00ĵ + 1.00k̂ and <strong>B</strong> = −4.00î + 2.00ĵ − 1.00k̂. "
       + "Their scalar product is −3.00. Without computing the magnitudes, what kind of angle is between them?",
      q_tr: "Örnek 1.10: A·B = −3.00. Büyüklükleri hesaplamadan, aradaki açı ne türdür?",
      options: [["acute", "acute (less than 90°)"], ["right", "exactly 90°"], ["obtuse", "obtuse (more than 90°)"], ["cant", "cannot tell"]],
      correct: "obtuse",
      why: "The sign of $\\vec A\\cdot\\vec B$ is the sign of $\\cos\\phi$. A negative product means an obtuse angle, before any magnitudes are known. "
         + "With $A=\\sqrt{14}$ and $B=\\sqrt{21}$, $\\cos\\phi=-3.00/\\sqrt{294}=-0.175$ and $\\phi=100^\\circ$. Turn the view to see the angle from any side.",
      why_tr: "Skaler çarpımın işareti kosinüsün işaretidir: negatif ⇒ geniş açı. Sayılarla φ = 100°."
    });

    var presets = {
      ex110: { A: [2, 3, 1], B: [-4, 2, -1], label: "Example 1.10", yaw: 75, elev: 60 },
      vp3:   { A: [-5, 3, 0], B: [2.5, 4, -1.5], label: "VP1.10.3", yaw: 140, elev: 60 },
      p9:    { A: [2, -1, 3], B: [-1, 4, 2], label: "P9 pair", yaw: 30, elev: 10 },
      ex18:  { A: [8, 11, -10], B: [6, 3, -1], label: "Ex 1.8: F and D", yaw: 25, elev: 25 }
    };
    var st = presets.ex110, view = View3(st.yaw, st.elev);

    var sc = U.Scene(m.stage, { height: 380, alt: "Two three-dimensional vectors from a common origin with the angle between them, on a rotatable view" });
    U.seg(m.controls, "case", [["ex110", "Ex 1.10"], ["vp3", "VP1.10.3"], ["p9", "P9 pair"], ["ex18", "Ex 1.8"]], "ex110",
      function (k) { st = presets[k]; view.yaw = st.yaw; view.elev = st.elev; cYaw.set(st.yaw); cEl.set(st.elev); sc.draw(); });
    var cYaw = U.slider(m.controls, "turn", { min: 0, max: 360, step: 1, value: view.yaw, text: function (v) { return v + "°"; } }, function (v) { view.yaw = v; sc.draw(); });
    var cEl = U.slider(m.controls, "tilt", { min: -90, max: 90, step: 1, value: view.elev, text: function (v) { return v + "°"; } }, function (v) { view.elev = v; sc.draw(); });

    var sDot = U.stat(m.stats, "A·B", "—");
    var sMag = U.stat(m.stats, "A, B", "—");
    var sCos = U.stat(m.stats, "cos φ", "—");
    var sPhi = U.stat(m.stats, "φ", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), dim = s.col("--muted"), green = s.col("--green");
      var A = st.A, B = st.B, a = mag(A), b = mag(B);
      var d = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
      var cos = d / (a * b), phi = Math.acos(Math.max(-1, Math.min(1, cos))) / DEG;
      var lim = Math.max(a, b) * 1.15;
      /* the y-range is kept positive so the harness draws no zero line across a 3-D view */
      var P = evenPlot(s, { xlim: [-lim, lim], ylim: [0, 2 * lim], xticks: [], yticks: [], pad: { l: 14, r: 14, t: 24, b: 14 } });
      P.frame();
      var v3 = { yaw: view.yaw, elev: view.elev, project: function (v) { var q = view.project(v); return [q[0], q[1] + lim]; } };
      drawAxes3(P, v3, lim * 0.8, dim);
      var pa = v3.project(A), pb = v3.project(B), o = v3.project([0, 0, 0]);
      /* the angle arc lives in the plane of A and B: sweep from A toward B in that plane */
      var ua = A.map(function (x) { return x / a; });
      var bperp = B.map(function (x, i) { return x - d / a * ua[i]; }), bp = mag(bperp);
      if (bp > 1e-9) {
        var ub = bperp.map(function (x) { return x / bp; }), pts = [], r = Math.min(a, b) * 0.35;
        for (var i = 0; i <= 40; i++) {
          var t = phi * DEG * i / 40;
          pts.push(v3.project(ua.map(function (x, k) { return r * (Math.cos(t) * x + Math.sin(t) * ub[k]); })));
        }
        P.line(pts, { color: green, width: 1.6 });
        var tm = phi * DEG / 2, lp = v3.project(ua.map(function (x, k) { return r * 2.1 * (Math.cos(tm) * x + Math.sin(tm) * ub[k]); }));
        P.text(lp[0], lp[1], "φ = " + fmt(phi, 0) + "°", { color: green, size: 12, align: "center", baseline: "middle" });
      }
      P.arrow(o[0], o[1], pa[0], pa[1], { color: blue, width: 2.6 });
      P.arrow(o[0], o[1], pb[0], pb[1], { color: orange, width: 2.6 });
      P.text(pa[0], pa[1], "A", { color: blue, size: 14, dx: 8, dy: -6 });
      P.text(pb[0], pb[1], "B", { color: orange, size: 14, dx: 8, dy: -6 });
      P.title(st.label + " — cos φ = (AxBx + AyBy + AzBz) / AB");
      sDot.set(fmt(d, 2));
      sMag.set(fmt(a, 3) + ", " + fmt(b, 3));
      sCos.set(fmt(cos, 3));
      sPhi.set(fmt(phi, 1) + "°" + (Math.abs(d) < 1e-9 ? "  — perpendicular" : d < 0 ? "  — obtuse" : "  — acute"));
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ================================================================ 3 */
  PhyAnim.register("w1r-work", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "VP1.10.4: the object moves through <strong>s</strong> = (4.00 m)î + (5.00 m)ĵ while a force with "
       + "<em>F<sub>x</sub></em> = −12.0 N acts on it. If the force had <strong>no</strong> <em>y</em>-component, would its work be positive, zero or negative?",
      q_tr: "VP1.10.4: s = (4.00, 5.00) m, Fx = −12.0 N. Kuvvetin y bileşeni sıfır olsaydı yapılan iş pozitif mi, sıfır mı, negatif mi olurdu?",
      options: [["pos", "positive"], ["zero", "zero"], ["neg", "negative"]],
      correct: "neg",
      why: "$W=\\vec F\\cdot\\vec s=F_xs_x+F_ys_y=(-12.0)(4.00)+0=-48.0$ J: the force opposes the x-part of the motion. "
         + "For the work to reach the stated +26.0 J the y-component must supply +74.0 J, so $F_y=74.0/5.00=14.8$ N. Slide $F_y$ and watch W cross zero.",
      why_tr: "Fy = 0 iken W = (−12.0)(4.00) = −48.0 J, negatif. +26.0 J için y bileşeni +74.0 J vermeli: Fy = 14.8 N."
    });

    var s2 = [4, 5], Fx = -12, Fy = 14.8;
    var sc = U.Scene(m.stage, { height: 360, alt: "A displacement vector and a force vector from a common origin, with the component of the force along the displacement" });
    U.slider(m.controls, "Fy (N)", { min: -20, max: 30, step: 0.1, value: Fy, text: function (v) { return fmt(v, 1); } }, function (v) { Fy = v; sc.draw(); });
    var sW = U.stat(m.stats, "W = F·s", "—");
    var sF = U.stat(m.stats, "|F|", "—");
    var sPhi = U.stat(m.stats, "φ between F and s", "—");
    var sPar = U.stat(m.stats, "F cos φ (along s)", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), green = s.col("--green"), dim = s.col("--muted"), red = s.col("--red");
      var F = [Fx, Fy], sm = mag(s2), Fm = mag(F), W = dot2(F, s2), cos = W / (Fm * sm), phi = Math.acos(Math.max(-1, Math.min(1, cos))) / DEG;
      /* one drawing scale: metres for s, and 1 N drawn as 0.25 m so both fit */
      var k = 0.25, f = [F[0] * k, F[1] * k];
      var lim = 8.5;
      var P = evenPlot(s, { xlim: [-lim, lim], ylim: [-lim, lim], xticks: [-8, -4, 0, 4, 8], yticks: [-8, -4, 0, 4, 8], xlabel: "x (m; force drawn at 0.25 m per N)", ylabel: "y" });
      P.frame();
      P.line([[-lim, 0], [lim, 0]], { color: dim, width: 1 });
      P.line([[0, -lim], [0, lim]], { color: dim, width: 1 });
      var us = [s2[0] / sm, s2[1] / sm], fpar = dot2(f, us), proj = [us[0] * fpar, us[1] * fpar];
      P.line([[-us[0] * lim, -us[1] * lim], [us[0] * lim, us[1] * lim]], { color: dim, width: 1, dash: [3, 4] });
      P.line([[0, 0], proj], { color: W >= 0 ? green : red, width: 6 });
      P.line([proj, f], { color: dim, width: 1.2, dash: [4, 3] });
      P.arrow(0, 0, s2[0], s2[1], { color: blue, width: 2.8 });
      P.arrow(0, 0, f[0], f[1], { color: orange, width: 2.6 });
      P.text(s2[0], s2[1], "s = (4.00, 5.00) m", { color: blue, size: 12, dx: 8, dy: -4 });
      P.text(f[0], f[1], "F = (−12.0, " + fmt(Fy, 1) + ") N", { color: orange, size: 12, dx: -6, dy: f[1] >= 0 ? -14 : 18, align: "right" });
      P.text(proj[0] / 2, proj[1] / 2, "F cos φ", { color: W >= 0 ? green : red, size: 11, dx: 14, dy: 8 });
      P.title("W = F·s = Fx sx + Fy sy = " + sgnfmt(W, 1) + " J");
      sW.set(sgnfmt(W, 1) + " J" + (Math.abs(W - 26) < 0.3 ? "  ← the stated 26.0 J" : ""));
      sF.set(fmt(Fm, 1) + " N");
      sPhi.set(fmt(phi, 1) + "°");
      sPar.set(sgnfmt(Fm * cos, 2) + " N  × " + fmt(sm, 2) + " m");
    });
    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ================================================================ 4 */
  PhyAnim.register("w1r-cross", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Example 1.11: <strong>A</strong> has magnitude 6 along +<em>x</em>; <strong>B</strong> has magnitude 4 in the <em>xy</em>-plane at 30° from +<em>x</em>. "
       + "Which way does <strong>A × B</strong> point?",
      q_tr: "Örnek 1.11: A = 6 (+x boyunca), B = 4 (+x'ten 30°). A × B hangi yöne bakar?",
      options: [["out", "out of the page (+z)"], ["in", "into the page (−z)"], ["plane", "in the plane, between A and B"], ["zero", "it is zero"]],
      correct: "out",
      why: "Curl the right hand from A toward B (counter-clockwise on the page) and the thumb points out of the page: $\\vec A\\times\\vec B=12\\hat k$, "
         + "magnitude $AB\\sin 30^\\circ = 12$. From components, $C_z=A_xB_y-A_yB_x=(6)(2)-(0)(2\\sqrt3)=12$. Press <em>swap order</em> to see $\\vec B\\times\\vec A=-12\\hat k$.",
      why_tr: "Sağ el A'dan B'ye kıvrılır, başparmak sayfadan dışarı: A × B = 12k̂. Sırayı değiştirince −12k̂."
    });

    var A = 6, B = 4, phi = 30, swap = false;
    var sc = U.Scene(m.stage, { height: 360, alt: "Two vectors spanning a parallelogram, with the direction of their vector product marked as out of or into the page" });
    U.slider(m.controls, "angle of B", { min: -180, max: 180, step: 1, value: phi, text: function (v) { return v + "°"; } }, function (v) { phi = v; sc.draw(); });
    U.slider(m.controls, "B", { min: 0, max: 8, step: 0.5, value: B, text: function (v) { return fmt(v, 1); } }, function (v) { B = v; sc.draw(); });
    U.seg(m.controls, "order", [[false, "A × B"], [true, "B × A"]], false, function (v) { swap = v; sc.draw(); });
    var sMag = U.stat(m.stats, "|A × B| = AB sin φ", "—");
    var sCz = U.stat(m.stats, "Cz = AxBy − AyBx", "—");
    var sDir = U.stat(m.stats, "direction", "—");
    var sArea = U.stat(m.stats, "parallelogram area", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), purple = s.col("--purple"), dim = s.col("--muted"), fill = s.col("--fig-fill");
      var a = [A, 0], b = pol(B, phi);
      var first = swap ? b : a, second = swap ? a : b;
      var cz = crossz(first, second), area = Math.abs(cz);
      var ylim = B + 1.2, xlo = -(B + 1.2), xhi = A + B + 1.2;
      var P = evenPlot(s, { xlim: [xlo, xhi], ylim: [-ylim, ylim], xticks: ticks(xhi, 2).filter(function (v) { return v >= xlo; }),
                            yticks: ticks(ylim, 2), xlabel: "x", ylabel: "y" });
      P.frame();
      P.line([[xlo, 0], [xhi, 0]], { color: dim, width: 1 });
      P.line([[0, -ylim], [0, ylim]], { color: dim, width: 1 });
      /* parallelogram spanned by A and B */
      var c = [a[0] + b[0], a[1] + b[1]];
      var ctx = s.ctx;
      ctx.save(); ctx.fillStyle = fill; ctx.beginPath();
      [[0, 0], a, c, b].forEach(function (q, i) { i ? ctx.lineTo(P.X(q[0]), P.Y(q[1])) : ctx.moveTo(P.X(q[0]), P.Y(q[1])); });
      ctx.closePath(); ctx.fill(); ctx.restore();
      P.line([a, c], { color: dim, width: 1, dash: [4, 3] });
      P.line([b, c], { color: dim, width: 1, dash: [4, 3] });
      /* the height B sin phi, drawn from the tip of B down to the line of A */
      P.line([[b[0], 0], b], { color: purple, width: 3 });
      P.text(b[0], b[1] / 2, "B sin φ", { color: purple, size: 11, dx: 7, align: "left", baseline: "middle" });
      var sweep = ((phi % 360) + 540) % 360 - 180;
      arc(P, 0, 0, 1.4, 0, sweep, { color: dim, width: 1.4 });
      P.arrow(0, 0, a[0], a[1], { color: blue, width: 2.6 });
      P.arrow(0, 0, b[0], b[1], { color: orange, width: 2.6 });
      P.text(a[0], a[1], "A", { color: blue, size: 14, dx: 4, dy: 18 });
      P.text(b[0], b[1], "B", { color: orange, size: 14, dx: b[0] >= 0 ? 8 : -8, dy: -6, align: b[0] >= 0 ? "left" : "right" });
      /* out-of-page / into-page marker at the parallelogram's centre */
      /* the marker sits in the right-hand part of the parallelogram, clear of the height label */
      var cxm = b[0] / 2 + A * 0.8, cym = c[1] / 2, R = 0.55;
      var rp = Math.abs(R * (P.X(1) - P.X(0)));       /* pixels; guarded, a collapsed layout must not throw */
      if (area > 1e-6 && rp > 1) {
        ctx.save(); ctx.strokeStyle = purple; ctx.fillStyle = purple; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(P.X(cxm), P.Y(cym), rp, 0, Math.PI * 2); ctx.stroke();
        if (cz > 0) { ctx.beginPath(); ctx.arc(P.X(cxm), P.Y(cym), 3, 0, Math.PI * 2); ctx.fill(); }
        else {
          ctx.beginPath(); ctx.moveTo(P.X(cxm) - rp * 0.7, P.Y(cym) - rp * 0.7); ctx.lineTo(P.X(cxm) + rp * 0.7, P.Y(cym) + rp * 0.7);
          ctx.moveTo(P.X(cxm) - rp * 0.7, P.Y(cym) + rp * 0.7); ctx.lineTo(P.X(cxm) + rp * 0.7, P.Y(cym) - rp * 0.7); ctx.stroke();
        }
        ctx.restore();
      }
      var name = swap ? "B × A" : "A × B";
      P.title(name + " = (" + fmt(cz, 2) + ") k̂ — " + (cz > 1e-6 ? "out of the page ⊙" : cz < -1e-6 ? "into the page ⊗" : "zero: A and B are parallel"));
      sMag.set(fmt(area, 2) + "  (φ = " + fmt(Math.abs(sweep), 0) + "°)");
      sCz.set(sgnfmt(cz, 2));
      sDir.set(cz > 1e-6 ? "+z, out of the page" : cz < -1e-6 ? "−z, into the page" : "undefined — zero vector");
      sArea.set(fmt(area, 2) + " = base " + fmt(A, 1) + " × height " + fmt(Math.abs(b[1]), 2));
    });
    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ================================================================ 5 */
  PhyAnim.register("w1r-torque", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Problem P9: the wrench <strong>r</strong> (0.320 m) is tilted 35.0° above +<em>x</em> and the mechanic pulls with 95.0 N "
       + "straight <strong>down</strong> (−<em>y</em>). Which way does the bolt turn?",
      q_tr: "P9: kol 35.0° yukarı eğik, kuvvet 95.0 N tam aşağı (−y). Cıvata hangi yöne döner?",
      options: [["cw", "clockwise (torque into the page)"], ["ccw", "counter-clockwise (torque out of the page)"], ["none", "it does not turn"]],
      correct: "cw",
      why: "$\\tau_z=r_xF_y-r_yF_x=(0.262)(-95.0)-(0.184)(0)=-24.9$ N·m: negative, so $\\vec\\tau$ points into the page and the turning is clockwise. "
         + "The right hand agrees: curl from r (up-right) toward F (down) and the thumb points away from you. "
         + "Turn the force direction below: the torque is largest at 125° and 305° (perpendicular to the wrench) and vanishes along it.",
      why_tr: "τz = rxFy − ryFx = −24.9 N·m < 0: tork sayfaya doğru, dönüş saat yönünde. En büyük tork kola dik çekişte (125° veya 305°), kol boyunca çekişte sıfır."
    });

    var r = 0.320, tr = 35.0, F = 95.0, tF = 270;
    var sc = U.Scene(m.stage, { height: 360, alt: "A wrench as a position vector from the bolt, with the applied force at its end and the perpendicular component of that force" });
    U.slider(m.controls, "force direction", { min: 0, max: 360, step: 1, value: tF, text: function (v) { return v + "°"; } }, function (v) { tF = v; sc.draw(); });
    U.slider(m.controls, "|F| (N)", { min: 10, max: 150, step: 1, value: F, text: function (v) { return fmt(v, 0); } }, function (v) { F = v; sc.draw(); });
    var sTau = U.stat(m.stats, "τz = rxFy − ryFx", "—");
    var sMag = U.stat(m.stats, "|τ| = rF sin φ", "—");
    var sSense = U.stat(m.stats, "sense", "—");
    var sMax = U.stat(m.stats, "largest possible rF", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), purple = s.col("--purple"), dim = s.col("--muted"), ink = s.col("--heading");
      var rv = pol(r, tr), fv = pol(F, tF);
      var tz = crossz(rv, fv), sweep = ((tF - tr) % 360 + 540) % 360 - 180;
      /* one scale: metres, with 1 N drawn as 0.0035 m so the 95 N arrow is about the wrench's length */
      var k = 0.0035, fd = [fv[0] * k, fv[1] * k];
      var lim = 0.62;
      var P = evenPlot(s, { xlim: [-lim, lim], ylim: [-lim, lim], xticks: [-0.6, -0.3, 0, 0.3, 0.6], yticks: [-0.6, -0.3, 0, 0.3, 0.6], xlabel: "x (m)", ylabel: "y (m)" });
      P.frame();
      P.line([[-lim, 0], [lim, 0]], { color: dim, width: 1 });
      P.line([[0, -lim], [0, lim]], { color: dim, width: 1 });
      /* the wrench body, the bolt, then the force applied at the grip */
      P.line([[0, 0], rv], { color: ink, width: 9 });
      P.arrow(0, 0, rv[0], rv[1], { color: blue, width: 2.4 });
      P.dot(0, 0, { color: orange, r: 6 });
      P.text(0, 0, "bolt", { color: dim, size: 11, dx: -30, dy: 18 });
      P.text(rv[0] / 2, rv[1] / 2, "r", { color: blue, size: 14, dx: -14, dy: -10 });
      var tip = [rv[0] + fd[0], rv[1] + fd[1]];
      P.arrow(rv[0], rv[1], tip[0], tip[1], { color: orange, width: 2.8 });
      P.text(tip[0], tip[1], "F", { color: orange, size: 14, dx: 8, dy: -6 });
      /* the part of F perpendicular to r is what turns the wrench */
      var ur = [rv[0] / r, rv[1] / r], fpar = dot2(fd, ur), fperp = [fd[0] - ur[0] * fpar, fd[1] - ur[1] * fpar];
      P.line([rv, [rv[0] + fperp[0], rv[1] + fperp[1]]], { color: purple, width: 5 });
      P.text(rv[0] + fperp[0] / 2, rv[1] + fperp[1] / 2, "F sin φ", { color: purple, size: 11, dx: 10, baseline: "middle" });
      arc(P, rv[0], rv[1], 0.09, tr, tr + sweep, { color: dim, width: 1.3 });
      /* curved arrow around the bolt showing the sense */
      if (Math.abs(tz) > 1e-6) {
        var dir = tz > 0 ? 1 : -1, a0 = 200, a1 = a0 + dir * 120, R = 0.13;
        arc(P, 0, 0, R, a0, a1, { color: purple, width: 2 });
        var e = a1 * DEG, e2 = (a1 - dir * 12) * DEG;
        P.arrow(R * Math.cos(e2), R * Math.sin(e2), R * Math.cos(e), R * Math.sin(e), { color: purple, width: 2, head: 8 });
      }
      P.title("τ = r × F — τz = " + sgnfmt(tz, 1) + " N·m " + (tz < -1e-6 ? "(clockwise, into the page)" : tz > 1e-6 ? "(counter-clockwise, out of the page)" : "(no torque)"));
      sTau.set(sgnfmt(tz, 1) + " N·m");
      sMag.set(fmt(Math.abs(tz), 1) + " N·m  (φ = " + fmt(Math.abs(sweep), 0) + "°)");
      sSense.set(tz < -1e-6 ? "clockwise" : tz > 1e-6 ? "counter-clockwise" : "none — F along the wrench");
      sMax.set(fmt(r * F, 1) + " N·m at 125° or 305°");
    });
    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ================================================================ 6 */
  PhyAnim.register("w1r-cross3d", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "For <strong>any</strong> two vectors, let <strong>C</strong> = <strong>A × B</strong>. What is <strong>C · A</strong>?",
      q_tr: "Herhangi iki vektör için C = A × B olsun. C · A nedir?",
      options: [["zero", "always zero"], ["ab", "AB, the product of the magnitudes"], ["dep", "it depends on the angle between A and B"], ["neg", "always negative"]],
      correct: "zero",
      why: "The vector product is perpendicular to the plane of A and B, so it is perpendicular to each of them: $\\vec C\\cdot\\vec A=\\vec C\\cdot\\vec B=0$ always. "
         + "That is the quickest check on a cross product you have just computed by components. Turn the view until you look along C: A and B then lie flat in the screen.",
      why_tr: "Vektörel çarpım her iki çarpanına da diktir; C·A = C·B = 0 her zaman. Bileşenlerle hesaplanan çarpımın en hızlı kontrolü budur."
    });

    var presets = {
      p9:    { A: [2, -1, 3], B: [-1, 4, 2], label: "P9: A·B = 0, so |A×B| = AB", yaw: 130, elev: 60 },
      ex110: { A: [2, 3, 1], B: [-4, 2, -1], label: "Example 1.10 vectors", yaw: 145, elev: 25 },
      ex111: { A: [6, 0, 0], B: [3.464, 2, 0], label: "Example 1.11 (in the xy-plane)", yaw: 260, elev: 20 }
    };
    var st = presets.p9, view = View3(st.yaw, st.elev);
    var sc = U.Scene(m.stage, { height: 380, alt: "Two vectors and their vector product, drawn perpendicular to both, on a rotatable three-dimensional view" });
    U.seg(m.controls, "case", [["p9", "P9"], ["ex110", "Ex 1.10"], ["ex111", "Ex 1.11"]], "p9",
      function (k) { st = presets[k]; view.yaw = st.yaw; view.elev = st.elev; cYaw.set(st.yaw); cEl.set(st.elev); sc.draw(); });
    var cYaw = U.slider(m.controls, "turn", { min: 0, max: 360, step: 1, value: view.yaw, text: function (v) { return v + "°"; } }, function (v) { view.yaw = v; sc.draw(); });
    var cEl = U.slider(m.controls, "tilt", { min: -90, max: 90, step: 1, value: view.elev, text: function (v) { return v + "°"; } }, function (v) { view.elev = v; sc.draw(); });
    var sC = U.stat(m.stats, "A × B", "—");
    var sMag = U.stat(m.stats, "|A × B|", "—");
    var sChk = U.stat(m.stats, "C·A, C·B", "—");
    var sPhi = U.stat(m.stats, "AB sin φ", "—");

    sc.onDraw(function (s) {
      var blue = s.col("--phy-blue"), orange = s.col("--phy-orange"), purple = s.col("--purple"), dim = s.col("--muted"), fill = s.col("--fig-fill");
      var A = st.A, B = st.B;
      var C = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
      var a = mag(A), b = mag(B), c = mag(C), d = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
      var phi = Math.acos(Math.max(-1, Math.min(1, d / (a * b)))) / DEG;
      /* draw C at a length comparable to A and B: the magnitude is reported, the direction is what the picture shows */
      var kC = c > 1e-9 ? Math.max(a, b) * 0.9 / c : 0, Cd = C.map(function (x) { return x * kC; });
      var lim = Math.max(a, b) * 1.2;
      var P = evenPlot(s, { xlim: [-lim, lim], ylim: [0, 2 * lim], xticks: [], yticks: [], pad: { l: 14, r: 14, t: 24, b: 14 } });
      P.frame();
      var v3 = { project: function (v) { var q = view.project(v); return [q[0], q[1] + lim]; } };
      drawAxes3(P, v3, lim * 0.8, dim);
      var o = v3.project([0, 0, 0]), pa = v3.project(A), pb = v3.project(B), pc = v3.project(Cd), pab = v3.project([A[0] + B[0], A[1] + B[1], A[2] + B[2]]);
      var ctx = s.ctx;
      ctx.save(); ctx.fillStyle = fill; ctx.beginPath();
      [o, pa, pab, pb].forEach(function (q, i) { i ? ctx.lineTo(P.X(q[0]), P.Y(q[1])) : ctx.moveTo(P.X(q[0]), P.Y(q[1])); });
      ctx.closePath(); ctx.fill(); ctx.restore();
      P.line([pa, pab], { color: dim, width: 1, dash: [4, 3] });
      P.line([pb, pab], { color: dim, width: 1, dash: [4, 3] });
      P.arrow(o[0], o[1], pa[0], pa[1], { color: blue, width: 2.6 });
      P.arrow(o[0], o[1], pb[0], pb[1], { color: orange, width: 2.6 });
      P.arrow(o[0], o[1], pc[0], pc[1], { color: purple, width: 3 });
      P.text(pa[0], pa[1], "A", { color: blue, size: 14, dx: 8, dy: -6 });
      P.text(pb[0], pb[1], "B", { color: orange, size: 14, dx: 8, dy: -6 });
      P.text(pc[0], pc[1], "A × B", { color: purple, size: 13, dx: 8, dy: -6 });
      P.title(st.label);
      sC.set("(" + fmt(C[0], 2) + ", " + fmt(C[1], 2) + ", " + fmt(C[2], 2) + ")");
      sMag.set(fmt(c, 2));
      var ca = C[0] * A[0] + C[1] * A[1] + C[2] * A[2], cb = C[0] * B[0] + C[1] * B[1] + C[2] * B[2];
      sChk.set(fmt(Math.abs(ca) < 1e-9 ? 0 : ca, 2) + ", " + fmt(Math.abs(cb) < 1e-9 ? 0 : cb, 2) + "  — perpendicular to both");
      sPhi.set(fmt(a * b * Math.sin(phi * DEG), 2) + "  (φ = " + fmt(phi, 1) + "°)");
    });
    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
