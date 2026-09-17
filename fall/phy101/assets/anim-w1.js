/* ============================================================
   PHY101 Week 01 — vectors
   w1-vectors : components of one vector, and why two vectors of
                length 3 and 4 add to 5 rather than 7.
   ============================================================ */
(function () {
  "use strict";
  PhyAnim.register("w1-vectors", function (m) {
    var U = m.U, h = U.h, fmt = U.fmt;

    var gate = U.predict(m.gate, {
      q: "You walk <strong>3 km east</strong>, then <strong>4 km north</strong>. "
       + "How far are you from where you started — not how far you walked?",
      q_tr: "3 km doğu, sonra 4 km kuzeye yürüyorsun. Başladığın noktadan "
          + "uzaklığın ne kadar — yürüdüğün yol değil?",
      options: [["7", "7 km"], ["5", "5 km"], ["3.5", "3.5 km"], ["1", "1 km"]],
      correct: "5",
      why: "Distance walked is 7 km, but displacement is the straight line home: "
         + "$\\sqrt{3^2+4^2}=5$ km. Components add; magnitudes do not. Watch the two arrows "
         + "join tip-to-tail below and read the third side of the triangle.",
      why_tr: "Yürüdüğün yol 7 km, ama yer değiştirme 5 km. "
            + "Bileşenler toplanır, büyüklükler toplanmaz."
    });

    var mode = "add";
    var ang = 53, mag = 5;   // for the single-vector mode

    var sc = U.Scene(m.stage, {
      height: 330,
      alt: "Vector diagram on a grid showing components and tip-to-tail addition"
    });

    /* ---------- controls ---------- */
    U.seg(m.controls, "show", [["add", "3 + 4 tip-to-tail"], ["comp", "components of one vector"]], "add",
      function (v) { mode = v; sc.draw(); syncControls(); });

    var angCtl = U.slider(m.controls, "angle", {
      min: 0, max: 90, step: 1, value: ang, text: function (v) { return v + "°"; }
    }, function (v) { ang = v; sc.draw(); });
    var magCtl = U.slider(m.controls, "length", {
      min: 1, max: 8, step: 0.1, value: mag, text: function (v) { return fmt(v, 1); }
    }, function (v) { mag = v; sc.draw(); });

    function syncControls() {
      var on = mode === "comp";
      [angCtl.el, magCtl.el].forEach(function (e) {
        e.style.display = on ? "" : "none";
        if (e.previousSibling && e.previousSibling.classList) e.previousSibling.style.display = on ? "" : "none";
        if (e.nextSibling && e.nextSibling.classList) e.nextSibling.style.display = on ? "" : "none";
      });
    }
    syncControls();

    /* ---------- readouts ---------- */
    var sX = U.stat(m.stats, "x-component", "—");
    var sY = U.stat(m.stats, "y-component", "—");
    var sMag = U.stat(m.stats, "magnitude", "—");
    var sSum = U.stat(m.stats, "sum of the parts", "—");

    sc.onDraw(function (s) {
      var lim = 9;
      var P = s.plot({
        w: s.w, h: s.h, xlim: [0, lim], ylim: [0, lim],
        xticks: [0, 2, 4, 6, 8], yticks: [0, 2, 4, 6, 8],
        xlabel: "east (km)", ylabel: "north (km)",
        pad: { l: 52, r: 16, t: 20, b: 34 }
      });
      P.frame();

      var orange = s.col("--phy-orange"), blue = s.col("--phy-blue"), green = s.col("--green");

      if (mode === "add") {
        P.title("3 east, then 4 north — displacement is the third side");
        P.arrow(0, 0, 3, 0, { color: blue, width: 2.5 });
        P.text(1.5, 0, "3 km east", { color: blue, dy: 16, align: "center" });
        P.arrow(3, 0, 3, 4, { color: green, width: 2.5 });
        P.text(3, 2, "4 km north", { color: green, dx: 8, baseline: "middle" });
        P.arrow(0, 0, 3, 4, { color: orange, width: 3 });
        P.text(1.3, 2.3, "5 km", { color: orange, size: 13 });
        P.line([[0, 0], [3, 4]], { color: orange, width: 0 });
        sX.set("3.00 km"); sY.set("4.00 km");
        sMag.set("5.00 km"); sSum.set("7.00 km walked");
      } else {
        P.title("One vector, resolved into components");
        var a = ang * Math.PI / 180;
        var vx = mag * Math.cos(a), vy = mag * Math.sin(a);
        P.line([[vx, 0], [vx, vy]], { color: green, width: 1.5, dash: [4, 3] });
        P.line([[0, vy], [vx, vy]], { color: blue, width: 1.5, dash: [4, 3] });
        P.arrow(0, 0, vx, 0, { color: blue, width: 2.5 });
        P.arrow(0, 0, 0, vy, { color: green, width: 2.5 });
        P.arrow(0, 0, vx, vy, { color: orange, width: 3 });
        P.text(vx / 2, 0, "V cosθ", { color: blue, dy: 16, align: "center" });
        P.text(0, vy / 2, "V sinθ", { color: green, dx: 6, baseline: "middle" });
        P.text(vx * 0.55, vy * 0.55, "V = " + fmt(mag, 1), { color: orange, size: 13, dx: 6 });
        sX.set(fmt(vx, 2)); sY.set(fmt(vy, 2));
        sMag.set(fmt(Math.hypot(vx, vy), 2));
        sSum.set(fmt(vx + vy, 2) + " (not the magnitude)");
      }
    });

    gate.onReveal = function () { sc.draw(); };
    sc.draw();
  });
})();
