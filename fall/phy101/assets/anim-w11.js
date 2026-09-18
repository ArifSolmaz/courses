/* ============================================================
   PHY101 Week 11 — rolling, rotational energy, angular momentum
   w11-race   : a race down a ramp — shape beats mass and radius
   w11-angmom : pulling the masses in, with L held fixed
   ============================================================ */
(function () {
  "use strict";
  var G = 9.81;

  /* ----------------------------------------------------------------- race */
  PhyAnim.register("w11-race", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A hoop, a solid disc and a solid sphere are released together from the top of a ramp and "
       + "roll without slipping. Which reaches the bottom first?",
      q_tr: "Bir çember, dolu bir disk ve dolu bir küre rampanın tepesinden birlikte bırakılıyor ve "
          + "kaymadan yuvarlanıyor. Dibe önce hangisi varır?",
      options: [["hoop", "the hoop"], ["disc", "the disc"], ["sphere", "the sphere"],
                ["tie", "they arrive together"]],
      correct: "sphere",
      why: "Each body has to share the released energy between going forward and spinning. The "
         + "split depends only on the shape factor $c$ in $I=cmR^2$: "
         + "$a=\\dfrac{g\\sin\\theta}{1+c}$. The sphere ($c=\\tfrac25$) keeps the most for going "
         + "forward, the hoop ($c=1$) the least — and mass and radius cancel out completely, so a "
         + "heavy hoop and a light hoop tie with each other.",
      why_tr: "Her cisim enerjiyi öteleme ve dönme arasında paylaşır. Paylaşımı yalnızca $I=cmR^2$ "
            + "içindeki $c$ belirler; kütle ve yarıçap tamamen sadeleşir."
    });

    var theta = 18;
    var BODIES = [
      { key: "sphere", name: "solid sphere", c: 0.4, col: "--green" },
      { key: "disc", name: "solid disc", c: 0.5, col: "--phy-blue" },
      { key: "hoop", name: "hoop", c: 1.0, col: "--phy-orange" }
    ];

    var sc = U.Scene(m.stage, {
      height: 320,
      alt: "Three bodies rolling down a ramp at different accelerations, with their positions "
         + "plotted against time"
    });

    var pl = U.Player(m.controls, { duration: 4, onFrame: function () { sc.draw(); } });
    U.slider(m.controls, "ramp angle", {
      min: 5, max: 35, step: 1, value: theta, text: function (v) { return v + "°"; }
    }, function (v) { theta = v; pl.reset(); sc.draw(); });

    var sS = U.stat(m.stats, "sphere a", "—");
    var sD = U.stat(m.stats, "disc a", "—");
    var sH = U.stat(m.stats, "hoop a", "—");
    var sWin = U.stat(m.stats, "finishing order", "—");

    sc.onDraw(function (s) {
      var dim = s.col("--dim", "#888");
      var L = 8;                                   // ramp length, metres
      var rad = theta * Math.PI / 180;

      function accel(c) { return G * Math.sin(rad) / (1 + c); }
      var tFin = Math.sqrt(2 * L / accel(0.4));    // the fastest body sets the clock
      var t = pl.t() / pl.duration * tFin * 1.15;

      /* ---- top: the ramp, all three on it at once ---- */
      /* geometry first: `drop` is needed by the plot's y-limits, and `var` is
         hoisted but undefined, so computing it later silently gave NaN limits */
      var drop = L * Math.tan(rad);
      var yTop = drop * 1.05 + 0.4, yBot = 0.4;
      var topH = s.h * 0.56;
      var P = s.plot({
        w: s.w, h: topH, xlim: [0, L * 1.04], ylim: [0, drop * 1.05 + 1.2],
        pad: { l: 44, r: 16, t: 16, b: 20 }, xticks: [], yticks: []
      });
      P.title("released together — the shape decides");
      P.line([[0, yTop], [L, yBot]], { color: dim, width: 2 });

      BODIES.forEach(function (b, i) {
        var a = accel(b.c);
        var d = Math.min(0.5 * a * t * t, L);
        var f = d / L;
        var x = f * L;
        var y = yTop - (yTop - yBot) * f;
        var ctx = s.ctx;
        ctx.save();
        ctx.strokeStyle = s.col(b.col, "#333"); ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(P.X(x), P.Y(y) - 9 - i * 0.5, 9, 0, Math.PI * 2);
        ctx.stroke();
        if (b.c < 0.9) {                              // solid bodies get a fill
          ctx.globalAlpha = 0.25; ctx.fillStyle = s.col(b.col, "#333"); ctx.fill();
        }
        ctx.restore();
      });

      /* ---- bottom: distance against time — the race, as a graph ---- */
      var Q = s.plot({
        y: topH, w: s.w, h: s.h - topH, xlim: [0, tFin * 1.15], ylim: [0, L * 1.05],
        pad: { l: 56, r: 14, t: 18, b: 32 },
        xlabel: "time (s)", ylabel: "distance (m)",
        xticks: [0, 1, 2, 3], yticks: [0, 4, 8]
      });
      Q.frame();
      Q.title("distance covered — mass and radius do not appear");
      Q.line([[0, L], [tFin * 1.15, L]], { color: dim, width: 1.2, dash: [5, 4] });

      var order = [];
      BODIES.forEach(function (b) {
        var a = accel(b.c), pts = [];
        for (var i = 0; i <= 60; i++) {
          var tt = tFin * 1.15 * i / 60;
          pts.push([tt, Math.min(0.5 * a * tt * tt, L)]);
        }
        Q.line(pts, { color: s.col(b.col, "#333"), width: 2.2 });
        Q.dot(Math.min(t, tFin * 1.15), Math.min(0.5 * a * t * t, L),
              { color: s.col(b.col, "#333"), r: 5 });
        order.push([b.name, Math.sqrt(2 * L / a)]);
      });
      /* name each curve at its own finish line, so no legend is needed */
      BODIES.forEach(function (b, i) {
        var a = accel(b.c), tf = Math.sqrt(2 * L / a);
        Q.text(Math.min(tf, tFin * 1.14), L, b.name,
               { color: s.col(b.col, "#333"), align: "right", dy: 16 + i * 15 });
      });

      sS.set(fmt(accel(0.4), 2) + " m/s²");
      sD.set(fmt(accel(0.5), 2) + " m/s²");
      sH.set(fmt(accel(1.0), 2) + " m/s²");
      order.sort(function (p, q) { return p[1] - q[1]; });
      sWin.set(order.map(function (o) { return o[0]; }).join(" → "));
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });

  /* ------------------------------------------------------------- angmom */
  PhyAnim.register("w11-angmom", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A spinning skater pulls her arms in until her moment of inertia halves. What happens to "
       + "her rotational kinetic energy?",
      q_tr: "Dönen bir patenci kollarını çekip eylemsizlik momentini yarıya indiriyor. Dönme "
          + "kinetik enerjisi ne olur?",
      options: [["half", "it halves"], ["same", "it stays the same"],
                ["double", "it doubles"], ["quad", "it quadruples"]],
      correct: "double",
      why: "Angular momentum $L=I\\omega$ is conserved, so halving $I$ doubles $\\omega$. But "
         + "$K=\\tfrac12I\\omega^2=\\tfrac{L^2}{2I}$, so halving $I$ <em>doubles</em> the energy. It "
         + "is not free: her muscles do the work of pulling the weights inward against their "
         + "circular motion. Watch the L bar hold still while the K bar climbs.",
      why_tr: "$L=I\\omega$ korunur, $I$ yarıya inince $\\omega$ iki katına çıkar. Ama "
            + "$K=L^2/2I$ olduğundan enerji iki katına çıkar — kaslar iş yapar."
    });

    var pull = 0;                                   // 0 = arms out, 1 = arms in
    var I0 = 4.0, L0 = 6.0;

    var sc = U.Scene(m.stage, {
      height: 300,
      alt: "A rotating figure pulling its masses inward, with bars for angular momentum, "
         + "moment of inertia, angular velocity and kinetic energy"
    });

    var ang = 0, last = null;
    var pl = U.Player(m.controls, {
      duration: 8,
      onFrame: function (f, t) {
        if (last === null) last = t;
        var dt = Math.max(0, t - last); last = t;
        pull = t < 3 ? 0 : Math.min((t - 3) / 2, 1);
        var I = I0 * (1 - 0.75 * pull);
        ang += (L0 / I) * dt;
        sc.draw();
      }
    });
    U.slider(m.controls, "pull the masses in", {
      min: 0, max: 1, step: 0.02, value: 0,
      text: function (v) { return v === 0 ? "arms out" : v === 1 ? "arms in" : fmt(v * 100, 0) + "%"; }
    }, function (v) { pull = v; pl.stop(); sc.draw(); });

    var sL = U.stat(m.stats, "L = Iω", "—");
    var sI = U.stat(m.stats, "I", "—");
    var sOm = U.stat(m.stats, "ω", "—");
    var sK = U.stat(m.stats, "K", "—");

    sc.onDraw(function (s) {
      var accent = s.col("--phy-orange", "#e65100");
      var blue = s.col("--phy-blue", "#1565c0");
      var green = s.col("--green", "#15803d");
      var dim = s.col("--dim", "#888");

      var I = I0 * (1 - 0.75 * pull);
      var om = L0 / I;
      var K = 0.5 * I * om * om;
      var rad = 1.0 * Math.sqrt(I / I0);            // I ∝ r², so r ∝ √I

      var LW = s.w * 0.44;
      var span = 1.2;
      var P = s.plot({
        w: LW, h: s.h, xlim: [-span, span],
        ylim: [-span * (s.h - 46) / (LW - 50), span * (s.h - 46) / (LW - 50)],
        pad: { l: 25, r: 25, t: 16, b: 30 }, xticks: [], yticks: []
      });
      P.title(pull > 0.5 ? "arms in — faster" : "arms out — slower");

      var ctx = s.ctx;
      var cx = Math.cos(ang), cy = Math.sin(ang);
      P.line([[-rad * cx, -rad * cy], [rad * cx, rad * cy]], { color: dim, width: 2 });
      ctx.save();
      ctx.fillStyle = accent; ctx.globalAlpha = 0.85;
      [1, -1].forEach(function (sg) {
        ctx.beginPath();
        ctx.arc(P.X(sg * rad * cx), P.Y(sg * rad * cy), 11, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      P.dot(0, 0, { color: dim, r: 4 });

      /* ---- right: the four quantities, each against its starting value ---- */
      var K0 = 0.5 * I0 * (L0 / I0) * (L0 / I0);
      var Q = s.plot({
        x: LW, w: s.w - LW, h: s.h, xlim: [0, 4], ylim: [0, 4.4],
        pad: { l: 52, r: 14, t: 16, b: 34 },
        ylabel: "× its starting value", xticks: [], yticks: [0, 1, 2, 3, 4]
      });
      Q.frame();
      Q.title("only L is pinned");
      Q.line([[0, 1], [4, 1]], { color: dim, width: 1.2, dash: [5, 4] });

      function bar(xc, val, colour, label) {
        ctx.save();
        ctx.fillStyle = colour; ctx.globalAlpha = 0.8;
        ctx.fillRect(Q.X(xc - 0.28), Q.Y(val), Q.X(xc + 0.28) - Q.X(xc - 0.28), Q.Y(0) - Q.Y(val));
        ctx.restore();
        Q.text(xc, 0, label, { color: dim, align: "center", dy: 14 });
        Q.text(xc, val, fmt(val, 2), { color: colour, align: "center", dy: -4 });
      }
      bar(0.6, 1, green, "L");
      bar(1.5, I / I0, blue, "I");
      bar(2.4, om / (L0 / I0), accent, "ω");
      bar(3.3, K / K0, accent, "K");

      sL.set(fmt(L0, 2) + " kg·m²/s — fixed");
      sI.set(fmt(I, 2) + " kg·m²");
      sOm.set(fmt(om, 2) + " rad/s");
      sK.set(fmt(K, 2) + " J   (" + fmt(K / K0, 2) + " ×)");
    });

    gate.onReveal = function () { sc.draw(); pl.play(); };
    sc.draw();
  });
})();
