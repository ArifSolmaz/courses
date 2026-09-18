/* ============================================================
   PHY101 Week 12 — torque, equilibrium, centre of mass
   w12-balance : a loaded beam on two supports, with both conditions live
   w12-tipping : slide or tip? the two thresholds, side by side
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* -------------------------------------------------------------- balance */
  PhyAnim.register("w12-balance", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A uniform plank rests on two supports. You slide a heavy box along it, towards the right "
       + "support. What happens to the force on the <strong>left</strong> support?",
      q_tr: "Düzgün bir kalas iki desteğe oturuyor. Ağır bir kutuyu sağ desteğe doğru kaydırıyorsun. "
          + "<strong>Sol</strong> destekteki kuvvete ne olur?",
      options: [["up", "it increases"], ["down", "it decreases"],
                ["same", "it does not change"], ["neg", "it becomes negative at once"]],
      correct: "down",
      why: "Take torques about the right support: the box's moment arm shrinks as it approaches, so "
         + "the left support has less and less turning to undo. Both conditions run at once below — "
         + "$\\sum F=0$ fixes the two forces together, $\\sum\\tau=0$ decides how they share the "
         + "load. Push the box past a support and watch a reaction go negative: the plank would "
         + "lift off, and something must hold it down.",
      why_tr: "Torku sağ desteğe göre al: kutu yaklaştıkça moment kolu küçülür, sol desteğin "
            + "dengeleyeceği döndürme etkisi azalır."
    });

    var boxX = 3.0, boxM = 40, plankM = 20;
    var A = 1.0, B = 5.0, LEN = 6.0;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A plank on two supports carrying a movable box, with the two support forces plotted "
         + "against the box position"
    });

    U.slider(m.controls, "box position", {
      min: 0, max: 6, step: 0.1, value: boxX, text: function (v) { return fmt(v, 1) + " m"; }
    }, function (v) { boxX = v; sc.draw(); });
    U.slider(m.controls, "box mass", {
      min: 5, max: 120, step: 5, value: boxM, text: function (v) { return v + " kg"; }
    }, function (v) { boxM = v; sc.draw(); });
    U.slider(m.controls, "right support at", {
      min: 3.0, max: 6.0, step: 0.1, value: B, text: function (v) { return fmt(v, 1) + " m"; }
    }, function (v) { B = v; sc.draw(); });

    /* torques about A give R_B; vertical equilibrium then gives R_A */
    function forces(x) {
      var W = boxM * G, Wp = plankM * G;
      var RB = (W * (x - A) + Wp * (LEN / 2 - A)) / (B - A);
      var RA = W + Wp - RB;
      return [RA, RB];
    }

    var sRA = U.stat(m.stats, "left support", "—");
    var sRB = U.stat(m.stats, "right support", "—");
    var sSum = U.stat(m.stats, "ΣF", "—");
    var sTau = U.stat(m.stats, "Στ about A", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");
      var red = s.col("--red", "#b91c1c");

      var f = forces(boxX), RA = f[0], RB = f[1];
      var W = boxM * G, Wp = plankM * G;

      /* ---- top: the plank ---- */
      var topH = s.h * 0.50;
      var P = s.plot({
        w: s.w, h: topH, xlim: [-0.4, 6.4], ylim: [0, 3],
        pad: { l: 52, r: 16, t: 16, b: 18 }, xticks: [], yticks: []
      });
      P.title("ΣF = 0 and Στ = 0, both at once");

      var ctx = s.ctx;
      ctx.save();
      ctx.fillStyle = dim; ctx.globalAlpha = 0.35;
      ctx.fillRect(P.X(0), P.Y(1.5), P.X(LEN) - P.X(0), P.Y(1.3) - P.Y(1.5));
      ctx.restore();

      [[A, RA], [B, RB]].forEach(function (sup) {
        var x = sup[0], R = sup[1];
        P.line([[x - 0.16, 1.05], [x, 1.3], [x + 0.16, 1.05], [x - 0.16, 1.05]],
               { color: dim, width: 1.6 });
        var col = R < 0 ? red : green;
        P.arrow(x, 1.3, x, 1.3 + Math.min(Math.abs(R) / 400, 1.3) * (R < 0 ? -1 : 1),
                { color: col, width: 2.4 });
        P.text(x, 0.95, fmt(R, 0) + " N", { color: col, align: "center", dy: 2 });
      });

      /* the two weights, pointing down */
      P.arrow(boxX, 1.5, boxX, 1.5 + Math.min(W / 400, 1.2), { color: accent, width: 2.4 });
      ctx.save();
      ctx.fillStyle = accent; ctx.globalAlpha = 0.8;
      var bw = 0.14 + boxM * 0.0016;
      ctx.fillRect(P.X(boxX - bw), P.Y(1.5 + 0.55), P.X(boxX + bw) - P.X(boxX - bw),
                   P.Y(1.5) - P.Y(1.5 + 0.55));
      ctx.restore();
      P.text(boxX, 2.15, fmt(boxM, 0) + " kg", { color: accent, align: "center", dy: -2 });
      P.arrow(LEN / 2, 1.3, LEN / 2, 1.3 - Math.min(Wp / 400, 0.8), { color: dim, width: 1.8 });
      P.text(LEN / 2, 0.42, "plank " + plankM + " kg", { color: dim, align: "center" });

      /* ---- bottom: both reactions against the box position ---- */
      var Q = s.plot({
        y: topH, w: s.w, h: s.h - topH, xlim: [0, 6],
        ylim: [Math.min(-200, forces(6)[0] * 1.2), Math.max(forces(6)[1], forces(0)[0]) * 1.15],
        pad: { l: 58, r: 14, t: 18, b: 32 },
        xlabel: "box position (m)", ylabel: "support force (N)",
        xticks: [0, 1, 2, 3, 4, 5, 6]
      });
      Q.frame();
      Q.title("as the box moves, the two reactions trade places");

      var ca = [], cb = [];
      for (var i = 0; i <= 60; i++) {
        var x = 6 * i / 60, ff = forces(x);
        ca.push([x, ff[0]]); cb.push([x, ff[1]]);
      }
      Q.line(ca, { color: green, width: 2.2 });
      Q.line(cb, { color: blue, width: 2.2 });
      Q.dot(boxX, RA, { color: green, r: 5.5 });
      Q.dot(boxX, RB, { color: blue, r: 5.5 });
      Q.text(0.15, forces(0)[0], "left", { color: green, align: "left", dy: -5 });
      Q.text(5.85, forces(6)[1], "right", { color: blue, align: "right", dy: -5 });

      sRA.set(fmt(RA, 0) + " N" + (RA < 0 ? " — it would lift off" : ""));
      sRB.set(fmt(RB, 0) + " N");
      sSum.set(fmt(RA + RB - W - Wp, 3) + " N");
      sTau.set(fmt(RB * (B - A) - W * (boxX - A) - Wp * (LEN / 2 - A), 2) + " N·m");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* -------------------------------------------------------------- tipping */
  PhyAnim.register("w12-tipping", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "You tilt a ramp under a box. A tall narrow box and a short wide box have the same mass "
       + "and the same friction. Which is more likely to topple rather than slide?",
      q_tr: "Bir kutunun altındaki rampayı eğiyorsun. Uzun-dar ve kısa-geniş kutuların kütlesi ve "
          + "sürtünmesi aynı. Hangisi kaymak yerine devrilmeye daha yatkındır?",
      options: [["tall", "the tall narrow one"], ["short", "the short wide one"],
                ["same", "both the same"], ["mass", "it depends on the mass"]],
      correct: "tall",
      why: "Sliding starts at $\\tan\\theta=\\mu_s$; tipping starts at $\\tan\\theta = b/h$, the "
         + "width over the height. Whichever threshold comes first is what happens. A tall narrow "
         + "box has a small $b/h$, so its tipping angle arrives early. Neither threshold contains "
         + "the mass. Drag the shape below and watch which line you cross first.",
      why_tr: "Kayma $\\tan\\theta=\\mu_s$'de, devrilme $\\tan\\theta=b/h$'de başlar. Hangisi önce "
            + "gelirse o olur; ikisinde de kütle yoktur."
    });

    var theta = 10, mus = 0.60, bOverH = 0.5;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A box on a tilting ramp, with the sliding and tipping thresholds marked on an "
         + "angle axis"
    });

    U.slider(m.controls, "tilt", {
      min: 0, max: 60, step: 1, value: theta, text: function (v) { return v + "°"; }
    }, function (v) { theta = v; sc.draw(); });
    U.slider(m.controls, "width ÷ height", {
      min: 0.2, max: 2.0, step: 0.05, value: bOverH, text: function (v) { return fmt(v, 2); }
    }, function (v) { bOverH = v; sc.draw(); });
    U.slider(m.controls, "static coeff", {
      min: 0.1, max: 1.5, step: 0.05, value: mus, text: function (v) { return fmt(v, 2); }
    }, function (v) { mus = v; sc.draw(); });

    var sSlide = U.stat(m.stats, "slides at", "—");
    var sTip = U.stat(m.stats, "tips at", "—");
    var sNow = U.stat(m.stats, "at this tilt", "—");
    var sWhich = U.stat(m.stats, "which comes first", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var slideAt = Math.atan(mus) * 180 / Math.PI;
      var tipAt = Math.atan(bOverH) * 180 / Math.PI;
      var first = slideAt < tipAt ? "slides" : "tips";
      var state = theta < Math.min(slideAt, tipAt) ? "sits still"
                : (first === "slides" ? "sliding" : "tipping over");

      /* ---- left: the ramp with the box drawn at the true tilt ---- */
      var LW = s.w * 0.52;
      var r = theta * Math.PI / 180;
      var P = s.plot({
        w: LW, h: s.h, xlim: [0, 10],
        ylim: [0, 10 * (s.h - 46) / (LW - 58)],
        pad: { l: 40, r: 12, t: 16, b: 30 }, xticks: [], yticks: []
      });
      P.title(state);

      /* ramp surface through the origin, rising to the right */
      var x0 = 1.0, y0 = 1.0, len = 7.5;
      var ex = x0 + len * Math.cos(r), ey = y0 + len * Math.sin(r);
      P.line([[x0, y0], [ex, ey]], { color: dim, width: 2 });
      P.line([[x0, y0], [ex, y0]], { color: dim, width: 1, dash: [4, 3] });

      /* the box, sitting on the surface at 55% along, drawn in the ramp frame */
      var f = 0.55, bx = x0 + len * f * Math.cos(r), by = y0 + len * f * Math.sin(r);
      var hBox = 2.2, wBox = hBox * bOverH;
      var ux = Math.cos(r), uy = Math.sin(r);        // along the ramp
      var nx = -Math.sin(r), ny = Math.cos(r);       // out of the ramp
      var corners = [
        [bx - ux * wBox / 2, by - uy * wBox / 2],
        [bx + ux * wBox / 2, by + uy * wBox / 2],
        [bx + ux * wBox / 2 + nx * hBox, by + uy * wBox / 2 + ny * hBox],
        [bx - ux * wBox / 2 + nx * hBox, by - uy * wBox / 2 + ny * hBox]
      ];
      P.line(corners.concat([corners[0]]), { color: accent, width: 2 });

      /* centre of mass and its plumb line */
      var cmx = bx + nx * hBox / 2, cmy = by + ny * hBox / 2;
      P.dot(cmx, cmy, { color: accent, r: 5 });
      P.line([[cmx, cmy], [cmx, y0 - 0.15]], { color: accent, width: 1.3, dash: [4, 3] });
      /* the downhill bottom corner is the pivot it would tip about */
      P.dot(corners[1][0], corners[1][1], { color: blue, r: 4.5 });

      /* ---- right: the two thresholds on one angle axis ---- */
      var Q = s.plot({
        x: LW, w: s.w - LW, h: s.h, xlim: [0, 60], ylim: [0, 3],
        pad: { l: 20, r: 18, t: 16, b: 34 },
        xlabel: "tilt angle (°)", xticks: [0, 15, 30, 45, 60], yticks: []
      });
      Q.frame();
      Q.title("whichever threshold you reach first");

      Q.line([[0, 2.1], [60, 2.1]], { color: dim, width: 1.4 });
      Q.line([[0, 1.1], [60, 1.1]], { color: dim, width: 1.4 });
      Q.line([[0, 2.1], [Math.min(slideAt, 60), 2.1]], { color: green, width: 5 });
      Q.line([[0, 1.1], [Math.min(tipAt, 60), 1.1]], { color: blue, width: 5 });
      Q.text(1, 2.1, "does not slide", { color: green, align: "left", dy: -7 });
      Q.text(1, 1.1, "does not tip", { color: blue, align: "left", dy: -7 });
      Q.dot(Math.min(slideAt, 60), 2.1, { color: green, r: 5 });
      Q.dot(Math.min(tipAt, 60), 1.1, { color: blue, r: 5 });
      Q.text(Math.min(slideAt, 59), 2.1, fmt(slideAt, 1) + "°",
             { color: green, align: "left", dx: 8, dy: 4 });
      Q.text(Math.min(tipAt, 59), 1.1, fmt(tipAt, 1) + "°",
             { color: blue, align: "left", dx: 8, dy: 4 });
      Q.line([[theta, 0.55], [theta, 2.55]], { color: accent, width: 2 });
      Q.text(theta, 2.62, "you are here", { color: accent, align: "center" });

      sSlide.set(fmt(slideAt, 1) + "°   (tan θ = μs)");
      sTip.set(fmt(tipAt, 1) + "°   (tan θ = b/h)");
      sNow.set(state);
      sWhich.set(first + " first, by " + fmt(Math.abs(slideAt - tipAt), 1) + "°");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
