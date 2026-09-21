/* ============================================================
   PHY101 Week 01 — Young & Freedman ch. 1, sections 1.7–1.10

   w1-vectors  : components of one vector, the signs quadrant by
                 quadrant, and the 180-degree arctan trap of
                 Fig. 1.20; plus Example 1.5, the skier.
   w1-order    : Example 1.7 — three displacements added in any
                 order reach the same point (Fig. 1.13).
   w1-products : one angle, two products — AB cos(phi) against
                 AB sin(phi), and why each vanishes where the
                 other is extreme.
   ============================================================ */
(function () {
  "use strict";

  /* A plot with ONE scale on both axes, centred in the canvas.

     Every drawing in this week is about a direction or an angle, and an
     angle drawn on axes with different scales is simply the wrong angle.
     The data ranges therefore fix the shape: the height sets the pixels per
     unit, the width follows from it, and what is left over becomes margin. */
  function evenPlot(s, o) {
    var pad = o.pad || { l: 56, r: 16, t: 22, b: 36 };
    var ph = (o.h || s.h) - pad.t - pad.b;
    var scale = ph / (o.ylim[1] - o.ylim[0]);
    var pw = (o.xlim[1] - o.xlim[0]) * scale;
    var boxW = Math.min(s.w, pw + pad.l + pad.r);
    return s.plot({
      x: (o.x || 0) + Math.max(0, (s.w - (o.x || 0) - boxW) / 2),
      y: o.y || 0, w: boxW, h: o.h || s.h,
      xlim: o.xlim, ylim: o.ylim, xticks: o.xticks, yticks: o.yticks,
      xlabel: o.xlabel, ylabel: o.ylabel, pad: pad
    });
  }

  /* ---------------------------------------------------------------- 1.8 */
  PhyAnim.register("w1-vectors", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "A displacement has magnitude <strong>5.00 m</strong> at <strong>130&deg;</strong> "
       + "from the <em>+x</em>-axis. What are the signs of its two components?",
      q_tr: "5.00 m büyüklüğünde, +x ekseninden 130° açılı bir yer değiştirmenin "
          + "bileşenlerinin işaretleri nedir?",
      options: [["++", "both positive"], ["-+", "x negative, y positive"],
                ["+-", "x positive, y negative"], ["--", "both negative"]],
      correct: "-+",
      why: "130&deg; is in the second quadrant, where $\\cos\\theta<0$ and $\\sin\\theta>0$: "
         + "$A_x=5.00\\cos130^\\circ=-3.21$ m and $A_y=5.00\\sin130^\\circ=+3.83$ m. "
         + "The magnitude stays $5.00$ m — squaring in Eq. (1.6) destroys the signs. "
         + "Drag the angle below and watch each component change sign as it crosses an axis.",
      why_tr: "130° ikinci bölgededir: kosinüs negatif, sinüs pozitif. "
            + "Büyüklük değişmez, çünkü (1.6) bileşenlerin karesini alır."
    });

    var mode = "comp";
    var ang = 130, mag = 5;

    var sc = U.Scene(m.stage, {
      height: 340,
      alt: "A vector on a grid with its x- and y-components, and the skier of Example 1.5"
    });

    U.seg(m.controls, "show", [["comp", "components of one vector"],
                               ["skier", "Example 1.5: the skier"]], "comp",
      function (v) { mode = v; sc.draw(); syncControls(); });

    var angCtl = U.slider(m.controls, "angle", {
      min: 0, max: 360, step: 1, value: ang, text: function (v) { return v + "°"; }
    }, function (v) { ang = v; sc.draw(); });
    var magCtl = U.slider(m.controls, "magnitude", {
      min: 0, max: 8, step: 0.1, value: mag, text: function (v) { return fmt(v, 2) + " m"; }
    }, function (v) { mag = v; sc.draw(); });

    function hide(ctl, on) {
      var e = ctl.el;
      e.style.display = on ? "" : "none";
      if (e.previousSibling && e.previousSibling.classList) {
        e.previousSibling.style.display = on ? "" : "none";
      }
      if (e.nextSibling && e.nextSibling.classList) {
        e.nextSibling.style.display = on ? "" : "none";
      }
    }
    function syncControls() {
      var on = mode === "comp";
      hide(angCtl, on);
      hide(magCtl, on);
    }
    syncControls();

    var sX = U.stat(m.stats, "Aₓ = A cos θ", "—");
    var sY = U.stat(m.stats, "Aᵧ = A sin θ", "—");
    var sMag = U.stat(m.stats, "magnitude", "—");
    var sArc = U.stat(m.stats, "calculator arctan", "—");

    sc.onDraw(function (s) {
      var orange = s.col("--phy-orange"), blue = s.col("--phy-blue"),
          green = s.col("--green"), dim = s.col("--muted");

      if (mode === "skier") {
        var P = evenPlot(s, {
          xlim: [-0.4, 2.6], ylim: [-0.4, 2.0],
          xticks: [0, 1, 2], yticks: [0, 1],
          xlabel: "east (km)", ylabel: "north (km)"
        });
        P.frame();
        P.title("Example 1.5 — 1.00 km north, then 2.00 km east");
        P.arrow(0, 0, 0, 1, { color: blue, width: 2.5 });
        P.text(0, 0.5, "1.00 km N", { color: blue, dx: 6, baseline: "middle" });
        P.arrow(0, 1, 2, 1, { color: green, width: 2.5 });
        P.text(1, 1, "2.00 km E", { color: green, dy: -8, align: "center" });
        P.arrow(0, 0, 2, 1, { color: orange, width: 3 });
        P.text(0.85, 0.36, "2.24 km", { color: orange, size: 13 });
        P.text(0.12, 0.72, "φ = 63.4°", { color: dim, size: 11 });
        sX.set("2.00 km east");
        sY.set("1.00 km north");
        sMag.set("2.24 km (3.00 km skied)");
        sArc.set("63.4° east of north");
        return;
      }

      var lim = 9;
      var P2 = evenPlot(s, {
        xlim: [-lim, lim], ylim: [-lim, lim],
        xticks: [-8, -4, 0, 4, 8], yticks: [-8, -4, 0, 4, 8],
        xlabel: "x component (m)", ylabel: "y component (m)"
      });
      P2.frame();
      P2.line([[-lim, 0], [lim, 0]], { color: dim, width: 1, dash: false });
      P2.line([[0, -lim], [0, lim]], { color: dim, width: 1, dash: false });

      var a = ang * Math.PI / 180;
      var vx = mag * Math.cos(a), vy = mag * Math.sin(a);
      var quad = mag === 0 ? 0 : Math.floor(((ang % 360) + 360) % 360 / 90) + 1;
      P2.title("Quadrant " + (quad || "—")
               + " — the signs come from cos θ and sin θ");

      P2.line([[vx, 0], [vx, vy]], { color: green, width: 1.4, dash: [4, 3] });
      P2.line([[0, vy], [vx, vy]], { color: blue, width: 1.4, dash: [4, 3] });
      P2.arrow(0, 0, vx, 0, { color: blue, width: 2.5 });
      P2.arrow(0, 0, 0, vy, { color: green, width: 2.5 });
      P2.arrow(0, 0, vx, vy, { color: orange, width: 3 });
      P2.text(vx / 2, 0, "A cos θ", { color: blue, dy: vy >= 0 ? 16 : -8, align: "center" });
      P2.text(0, vy / 2, "A sin θ", { color: green, dx: vx >= 0 ? -10 : 10, baseline: "middle",
                                          align: vx >= 0 ? "right" : "left" });
      /* the magnitude label goes on the far side of the arrow, along its normal,
         so it never lands on the vector itself or on the A sin θ label */
      if (mag > 0) {
        var ux = vx / mag, uy = vy / mag;
        P2.text(vx * 0.55, vy * 0.55, "A", { color: orange, size: 14, align: "center",
                baseline: "middle", dx: -uy * 15, dy: -ux * 15 });
      }

      /* the same arctan, 180 degrees away: the trap of Fig. 1.20 */
      var naive = Math.atan2(vy, vx) * 180 / Math.PI;
      var shown = ((Math.atan(vy / (vx || 1e-12)) * 180 / Math.PI) + 360) % 360;
      if (shown > 180) shown -= 360;
      var ghostA = shown * Math.PI / 180;
      var off = Math.abs(((naive - shown + 540) % 360) - 180) > 1;
      if (mag > 0 && off) {
        P2.line([[0, 0], [mag * Math.cos(ghostA), mag * Math.sin(ghostA)]],
                { color: dim, width: 2, dash: [5, 4] });
        P2.text(mag * Math.cos(ghostA) * 0.8, mag * Math.sin(ghostA) * 0.8,
                "what arctan says", { color: dim, size: 11, dx: 6 });
      }

      sX.set(fmt(vx, 2) + " m");
      sY.set(fmt(vy, 2) + " m");
      sMag.set(fmt(Math.hypot(vx, vy), 2) + " m");
      sArc.set(mag === 0 ? "undefined"
               : fmt(shown, 1) + "°" + (off ? " — wrong by 180°" : " — correct here"));
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });

  /* ---------------------------------------------------------------- 1.7 */
  PhyAnim.register("w1-order", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "The three contestants of Example 1.7 pace out the same three displacements "
       + "<strong>in different orders</strong>. Where do they end up?",
      q_tr: "Örnek 1.7'deki üç yarışmacı aynı üç yer değiştirmeyi <strong>farklı "
          + "sıralarla</strong> yürüyor. Nerede biterler?",
      options: [["same", "all three at the same point"],
                ["first", "the one who took the longest leg first gets furthest"],
                ["diff", "three different points"],
                ["start", "it depends on where they turn"]],
      correct: "same",
      why: "Vector addition is commutative and associative, Eqs. (1.3): "
         + "$\\vec A+\\vec B+\\vec C$ has one value however the arrows are laid head to tail. "
         + "All three dig in the same place, 12.7 m from the centre at $129^\\circ$ "
         + "— after walking 147.5 m between them. Shuffle the order below and watch "
         + "the route change while the green resultant does not move.",
      why_tr: "Vektör toplamı değişme ve birleşme özelliklerine uyar: sıra değişse de "
            + "bileşke aynıdır. Üçü de aynı noktayı kazar."
    });

    /* Example 1.7: A 72.4 m at 58.0 deg, B 57.3 m at 216.0 deg, C 17.8 m at 270.0 deg */
    var LEGS = [
      { name: "A", mag: 72.4, ang: 58.0, css: "--phy-blue" },
      { name: "B", mag: 57.3, ang: 216.0, css: "--phy-orange" },
      { name: "C", mag: 17.8, ang: 270.0, css: "--purple" }
    ];
    var ORDERS = [[0, 1, 2], [2, 0, 1], [1, 2, 0]];
    var pick = 0;

    var sc = U.Scene(m.stage, {
      height: 330,
      alt: "Three displacement arrows laid head to tail in different orders, reaching the same point"
    });

    U.seg(m.controls, "order", [[0, "A, B, C"], [1, "C, A, B"], [2, "B, C, A"]], 0,
      function (v) { pick = v; player.reset(); sc.draw(); });

    var player = U.Player(m.controls, {
      duration: 3, speeds: true,
      onFrame: function () { sc.draw(); }
    });

    var sRx = U.stat(m.stats, "Rₓ", "—");
    var sRy = U.stat(m.stats, "Rᵧ", "—");
    var sMag = U.stat(m.stats, "|R|", "—");
    var sDir = U.stat(m.stats, "direction", "—");

    function chain(order) {
      var pts = [[0, 0]];
      order.forEach(function (i) {
        var L = LEGS[i], p = pts[pts.length - 1];
        pts.push([p[0] + L.mag * Math.cos(L.ang * Math.PI / 180),
                  p[1] + L.mag * Math.sin(L.ang * Math.PI / 180)]);
      });
      return pts;
    }

    sc.onDraw(function (s) {
      var P = evenPlot(s, {
        xlim: [-70, 70], ylim: [-35, 90],
        xticks: [-60, -30, 0, 30, 60], yticks: [-30, 0, 30, 60],
        xlabel: "east (m)", ylabel: "north (m)"
      });
      P.frame();
      var order = ORDERS[pick];
      P.title("Order: " + order.map(function (i) {
        return LEGS[i].name + " " + fmt(LEGS[i].mag, 1) + " m";
      }).join("  \u2192  "));

      var pts = chain(order);
      var t = player.t() / player.duration;            /* 0 to 1 across the three legs */
      var shown = Math.min(3, Math.floor(t * 3 + 1e-9));
      var part = Math.min(1, t * 3 - shown);
      var green = s.col("--green"), dim = s.col("--muted");

      /* the resultant is drawn first, so the legs cross over it and only one
         arrowhead lands on the buried key */
      var R = pts[3];
      P.arrow(0, 0, R[0], R[1], { color: green, width: 3.4 });

      order.forEach(function (i, k) {
        if (k > shown) return;
        var L = LEGS[i], from = pts[k], to = pts[k + 1];
        var f = k < shown ? 1 : part;
        var x = from[0] + (to[0] - from[0]) * f, y = from[1] + (to[1] - from[1]) * f;
        P.arrow(from[0], from[1], x, y, { color: s.col(L.css), width: 2.4 });
        if (f > 0.35) {
          /* one letter per leg, offset along the leg's normal: A and B cross
             near their midpoints, so anything longer collides there */
          var a = L.ang * Math.PI / 180;
          P.text((from[0] + x) / 2, (from[1] + y) / 2, L.name,
                 { color: s.col(L.css), size: 14, align: "center", baseline: "middle",
                   dx: -Math.sin(a) * 15, dy: -Math.cos(a) * 15 });
        }
      });

      P.dot(R[0], R[1], { color: green, r: 4 });
      P.text(R[0], R[1], "the keys", { color: green, size: 12, align: "right",
                                       dx: -9, dy: 20 });
      P.text(-66, -30, "the green resultant is the same in every order",
             { color: dim, size: 11 });

      sRx.set(fmt(R[0], 2) + " m");
      sRy.set(fmt(R[1], 2) + " m");
      sMag.set(fmt(Math.hypot(R[0], R[1]), 1) + " m  (147.5 m walked)");
      sDir.set(fmt(((Math.atan2(R[1], R[0]) * 180 / Math.PI) + 360) % 360, 0)
               + "° from +x  (39° west of north)");
    });

    gate.onReveal = function () { sc.draw(); player.play(); };
    sc.draw();
  });

  /* --------------------------------------------------------------- 1.10 */
  PhyAnim.register("w1-products", function (m) {
    var U = m.U, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "Two vectors have fixed magnitudes. As the angle between them grows from "
       + "0&deg; to 90&deg;, what happens to the <strong>scalar</strong> product and to the "
       + "<strong>magnitude of the vector</strong> product?",
      q_tr: "İki vektörün büyüklükleri sabit. Aralarındaki açı 0°'den 90°'ye çıkarken "
          + "skaler çarpım ve vektörel çarpımın büyüklüğü ne olur?",
      options: [["both", "both grow"], ["dotup", "dot grows, cross falls"],
                ["crossup", "dot falls to zero, cross grows to AB"],
                ["same", "neither changes"]],
      correct: "crossup",
      why: "$\\vec A\\cdot\\vec B=AB\\cos\\phi$ falls from $AB$ to zero, while "
         + "$|\\vec A\\times\\vec B|=AB\\sin\\phi$ rises from zero to $AB$. Each vanishes exactly "
         + "where the other is extreme — which is why one product measures alignment "
         + "(work, Week 05) and the other measures turning (torque, Week 11).",
      why_tr: "Skaler çarpım $AB$'den sıfıra iner, vektörel çarpımın büyüklüğü sıfırdan "
            + "$AB$'ye çıkar. Biri sıfırken öteki en büyüktür."
    });

    var A = 4, B = 5, phi = 77;

    var sc = U.Scene(m.stage, {
      height: 340,
      alt: "Two vectors tail to tail beside graphs of AB cos phi and AB sin phi against the angle"
    });

    U.slider(m.controls, "angle φ", {
      min: 0, max: 180, step: 1, value: phi, text: function (v) { return v + "°"; }
    }, function (v) { phi = v; sc.draw(); });
    U.slider(m.controls, "A", {
      min: 1, max: 8, step: 0.5, value: A, text: function (v) { return fmt(v, 1); }
    }, function (v) { A = v; sc.draw(); });
    U.slider(m.controls, "B", {
      min: 1, max: 8, step: 0.5, value: B, text: function (v) { return fmt(v, 1); }
    }, function (v) { B = v; sc.draw(); });

    var sDot = U.stat(m.stats, "A·B = AB cos φ", "—");
    var sCross = U.stat(m.stats, "|A×B| = AB sin φ", "—");
    var sMax = U.stat(m.stats, "AB", "—");
    var sDir = U.stat(m.stats, "direction of A×B", "—");

    sc.onDraw(function (s) {
      var green = s.col("--green"), purple = s.col("--purple"),
          orange = s.col("--phy-orange"), blue = s.col("--phy-blue"), dim = s.col("--muted");
      var half = Math.floor(s.w / 2);
      var rad = phi * Math.PI / 180;
      var dot = A * B * Math.cos(rad), cross = A * B * Math.sin(rad);

      /* left: the two vectors, with the projection and the perpendicular part */
      var lim = Math.max(A, B) + 1.2;
      var step = lim > 6 ? 4 : 2, ticks = [];
      for (var tv = -Math.floor(lim / step) * step; tv <= lim; tv += step) ticks.push(tv);
      /* one scale on both axes: the angle is the whole point of this panel */
      var lpad = { l: 40, r: 10, t: 22, b: 34 };
      var lscale = (half - lpad.l - lpad.r) / (2 * lim);
      var lh = (lim + 1.8) * lscale + lpad.t + lpad.b;
      var P = s.plot({
        x: 0, y: Math.max(0, (s.h - lh) / 2), w: half, h: lh,
        xlim: [-lim, lim], ylim: [-1.8, lim],
        xticks: ticks, yticks: ticks.filter(function (v) { return v >= 0; }),
        xlabel: "", ylabel: "", pad: lpad
      });
      P.frame();
      P.title("φ = " + phi + "°");
      var bx = B * Math.cos(rad), by = B * Math.sin(rad);
      P.line([[0, 0], [bx, 0]], { color: green, width: 4, dash: false });
      P.line([[bx, 0], [bx, by]], { color: purple, width: 4, dash: false });
      P.arrow(0, 0, A, 0, { color: blue, width: 2.4 });
      P.arrow(0, 0, bx, by, { color: orange, width: 2.4 });
      P.text(A, 0, "A", { color: blue, dy: 16, align: "center" });
      P.text(bx, by, "B", { color: orange, dx: 6 });
      P.text(bx / 2, 0, "B cos φ", { color: green, dy: 16, align: "center", size: 10 });
      P.text(bx, by / 2, "B sin φ", { color: purple, dx: bx < 0 ? -6 : 6, baseline: "middle",
                                       align: bx < 0 ? "right" : "left", size: 10 });

      /* right: both products against the angle */
      var Q = s.plot({
        x: half, w: s.w - half, h: s.h, xlim: [0, 180], ylim: [-70, 70],
        xticks: [0, 45, 90, 135, 180], yticks: [-60, -30, 0, 30, 60],
        xlabel: "angle φ between the vectors (°)", ylabel: "product",
        pad: { l: 46, r: 14, t: 22, b: 34 }
      });
      Q.frame();
      Q.title("one angle, two products");
      var cos = [], sin = [];
      for (var d = 0; d <= 180; d += 2) {
        cos.push([d, A * B * Math.cos(d * Math.PI / 180)]);
        sin.push([d, A * B * Math.sin(d * Math.PI / 180)]);
      }
      Q.line(cos, { color: green, width: 2, dash: false });
      Q.line(sin, { color: purple, width: 2, dash: false });
      Q.vline(phi, { color: dim, width: 1.2 });
      Q.dot(phi, dot, { color: green, r: 4 });
      Q.dot(phi, cross, { color: purple, r: 4 });
      /* both labels sit in empty ground: below the cosine curve near phi = 0,
         and between the two curves past phi = 90 */
      Q.text(8, -A * B * 0.45, "AB cos φ", { color: green, size: 11 });
      Q.text(116, A * B * 0.26, "AB sin φ", { color: purple, size: 11 });

      sDot.set(fmt(dot, 2));
      sCross.set(fmt(cross, 2));
      sMax.set(fmt(A * B, 2) + " — the largest either can be");
      sDir.set(phi === 0 || phi === 180 ? "undefined (zero vector)"
               : "out of the page (+z)");
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
