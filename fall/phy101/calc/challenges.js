/* ============================================================================
   PHY101 — Calculator Challenge bank, weeks 2 to 6
   ----------------------------------------------------------------------------
   Fifteen challenges, three per class. Each one targets a SPECIFIC keystroke
   mistake that costs marks in the common exam, not just "do some arithmetic".

   Every challenge is a template:
     gen()      -> fresh random parameters, so neighbours get different numbers
                   and the set can be re-run next year
     text(p)    -> the question, in English and Turkish
     answer(p)  -> the correct value
     unit, sf   -> unit string and the significant figures expected
     tol        -> accepted relative tolerance (default 1%; tighter where the
                   challenge is itself about precision)
     traps      -> the wrong values students actually produce, each with the
                   keystroke that causes it. These are the teaching moment:
                   after the timer you show the room its own wrong answers and
                   name the cause.

   g = 9.81 m/s^2 throughout, matching calendar.json's numeric_policy.
   ========================================================================= */
(function () {
  "use strict";
  var G = 9.81;
  var D2R = Math.PI / 180;

  /* round to three significant figures, as a string, for exact comparison */
  function sf3(v) { return Number(v).toPrecision(3); }

  /* THE marking rule. The console and the test suite both call this, so a
     student is never marked by one rule and checked by another. */
  function isCorrect(ch, p, submitted) {
    var a = ch.answer(p);
    if (!isFinite(submitted)) return false;
    if (ch.mark === "sf3") return sf3(submitted) === sf3(a);
    var tol = ch.tol == null ? 0.01 : ch.tol;
    return Math.abs(submitted - a) <= tol * Math.abs(a);
  }

  /* pick a random value on a grid, so the numbers stay tidy to read aloud */
  function pick(lo, hi, step) {
    var n = Math.round((hi - lo) / step);
    return +(lo + step * Math.floor(Math.random() * (n + 1))).toFixed(6);
  }

  var CHALLENGES = [

    /* ------------------------------------------------------------- WEEK 02 */
    {
      id: "W2-C1", week: 2, skill: "squaring a negative",
      gen: function () {
        return { v0: -pick(8, 16, 0.5), a: pick(2.0, 4.0, 0.1), dx: pick(12, 24, 1) };
      },
      text: function (p) {
        return "A trolley moving at <b>" + p.v0 + " m/s</b> (leftward is negative) is pushed "
             + "rightward with a constant <b>" + p.a + " m/s²</b> for <b>" + p.dx + " m</b> of "
             + "displacement. Find its final <b>speed</b>.";
      },
      text_tr: function (p) {
        return "<b>" + p.v0 + " m/s</b> ile hareket eden bir araba (sola doğru negatif), "
             + "<b>" + p.dx + " m</b> yer değiştirme boyunca sağa doğru sabit "
             + "<b>" + p.a + " m/s²</b> ile itiliyor. Son <b>süratini</b> bulun.";
      },
      hint: "v² = v₀² + 2aΔx",
      answer: function (p) { return Math.sqrt(p.v0 * p.v0 + 2 * p.a * p.dx); },
      unit: "m/s", sf: 3,
      traps: [
        { value: function (p) { return Math.sqrt(-(p.v0 * p.v0) + 2 * p.a * p.dx); },
          label: "Math ERROR, or a smaller root",
          label_tr: "Math ERROR, ya da daha küçük bir kök",
          why: function (p) {
            return "Typing <code>" + p.v0 + " x²</code> gives <b>" + (-(p.v0 * p.v0)) + "</b>, "
                 + "because the calculator squares first and applies the minus afterwards. "
                 + "Square the bracket: <code>(" + p.v0 + ")²</code>."; },
          why_tr: function (p) {
            return "<code>" + p.v0 + " x²</code> yazmak <b>" + (-(p.v0 * p.v0)) + "</b> verir; "
                 + "önce kare alınır, eksi sonra uygulanır. Parantezi kareleyin: "
                 + "<code>(" + p.v0 + ")²</code>."; } },
        { value: function (p) { return p.v0 * p.v0 + 2 * p.a * p.dx; },
          label: "the value of v², not v",
          label_tr: "v² değeri, v değil",
          why: "The equation gives <b>v²</b>. Take the square root at the end.",
          why_tr: "Denklem <b>v²</b> verir. En sonda karekök alın." }
      ]
    },
    {
      id: "W2-C2", week: 2, skill: "bracketing a numerator",
      gen: function () {
        return { v: pick(18, 30, 0.5), v0: pick(4, 12, 0.5), dx: pick(30, 70, 1) };
      },
      text: function (p) {
        return "A train speeds up from <b>" + p.v0 + " m/s</b> to <b>" + p.v + " m/s</b> over "
             + "<b>" + p.dx + " m</b>. Find its acceleration.";
      },
      text_tr: function (p) {
        return "Bir tren <b>" + p.dx + " m</b> boyunca <b>" + p.v0 + " m/s</b>'den "
             + "<b>" + p.v + " m/s</b>'ye hızlanıyor. İvmesini bulun.";
      },
      hint: "a = (v² − v₀²) / (2Δx)",
      answer: function (p) { return (p.v * p.v - p.v0 * p.v0) / (2 * p.dx); },
      unit: "m/s²", sf: 3,
      traps: [
        { value: function (p) { return p.v * p.v - p.v0 * p.v0 / (2 * p.dx); },
          label: "far too large",
          label_tr: "çok fazla büyük",
          why: "Without brackets, <code>v² − v₀² ÷ 2Δx</code> divides only <b>v₀²</b>. "
             + "The whole numerator needs brackets: <code>(v² − v₀²) ÷ (2Δx)</code>.",
          why_tr: "Parantezsiz yazılınca <code>v² − v₀² ÷ 2Δx</code> yalnızca <b>v₀²</b>'yi böler. "
                + "Pay tümüyle parantez içine alınmalı." },
        { value: function (p) { return (p.v * p.v - p.v0 * p.v0) / p.dx / 2 * 2; },
          label: "twice the right answer",
          label_tr: "doğru cevabın iki katı",
          why: "The 2 in <b>2Δx</b> is in the denominator, so it divides. Dividing by Δx alone "
             + "leaves you a factor of two too big.",
          why_tr: "<b>2Δx</b>'teki 2 paydadadır. Yalnızca Δx'e bölmek sonucu iki kat büyütür." }
      ]
    },
    {
      id: "W2-C3", week: 2, skill: "km/h to m/s",
      gen: function () { return { kmh: pick(72, 126, 6), a: pick(5.0, 8.5, 0.5) }; },
      text: function (p) {
        return "A car travelling at <b>" + p.kmh + " km/h</b> brakes at <b>" + p.a + " m/s²</b> "
             + "until it stops. How far does it travel while braking?";
      },
      text_tr: function (p) {
        return "<b>" + p.kmh + " km/h</b> hızla giden bir araba <b>" + p.a + " m/s²</b> ile "
             + "frenleyip duruyor. Frenleme boyunca ne kadar yol alır?";
      },
      hint: "convert first, then 0 = v₀² − 2aΔx",
      answer: function (p) { var v = p.kmh / 3.6; return v * v / (2 * p.a); },
      unit: "m", sf: 3,
      traps: [
        { value: function (p) { return p.kmh * p.kmh / (2 * p.a); },
          label: "about 13 times too far",
          label_tr: "yaklaşık 13 kat fazla",
          why: "The speed was used as <b>" + "km/h" + "</b>. Divide by <b>3.6</b> to get m/s "
             + "before squaring — every kinematics equation is in SI units.",
          why_tr: "Sürat km/h olarak kullanılmış. Kare almadan önce <b>3.6</b>'ya bölüp m/s'ye "
                + "çevirin." },
        { value: function (p) { return p.kmh / 3.6 / (2 * p.a); },
          label: "far too small",
          label_tr: "çok fazla küçük",
          why: "The speed must be <b>squared</b>. Converting is only the first step.",
          why_tr: "Sürat <b>karesi</b> alınmalı. Birim çevirmek yalnızca ilk adımdır." }
      ]
    },

    /* ------------------------------------------------------------- WEEK 03 */
    {
      id: "W3-C1", week: 3, skill: "DEG vs RAD",
      /* Reject angles where the sin-instead-of-sin-2 trap collides with the
         answer. sin 2θ = sin θ exactly at θ = 60°, so a draw of 60 would mark
         the wrong method correct. Keep the two at least 5% apart. */
      gen: function () {
        var th = 38;
        for (var k = 0; k < 60; k++) {
          th = pick(24, 62, 1);
          if (Math.abs(Math.sin(2 * th * D2R) - Math.sin(th * D2R))
              > 0.05 * Math.sin(2 * th * D2R)) break;
        }
        return { v: pick(18, 30, 0.5), th: th };
      },
      text: function (p) {
        return "A ball is launched from level ground at <b>" + p.v + " m/s</b>, "
             + "<b>" + p.th + "°</b> above the horizontal. Find its range.";
      },
      text_tr: function (p) {
        return "Bir top düz zeminden <b>" + p.v + " m/s</b> ile yatayla <b>" + p.th + "°</b> "
             + "yapacak şekilde atılıyor. Menzilini bulun.";
      },
      hint: "R = v₀² sin(2θ) / g",
      answer: function (p) { return p.v * p.v * Math.sin(2 * p.th * D2R) / G; },
      unit: "m", sf: 3,
      traps: [
        { value: function (p) { return p.v * p.v * Math.sin(2 * p.th) / G; },
          label: "wildly wrong, often negative",
          label_tr: "tamamen yanlış, çoğu zaman negatif",
          why: "The calculator was in <b>RAD</b>. Press <code>MODE</code> and choose <b>DEG</b>. "
             + "A negative range is the give-away: sin of a large radian angle can be negative.",
          why_tr: "Hesap makinesi <b>RAD</b> modundaydı. <code>MODE</code> ile <b>DEG</b> seçin. "
                + "Negatif menzil bunun açık işaretidir." },
        { value: function (p) { return p.v * p.v * Math.sin(p.th * D2R) / G; },
          label: "smaller than the right answer",
          label_tr: "doğru cevaptan küçük",
          why: "It is <b>sin 2θ</b>, not sin θ. Double the angle before taking the sine.",
          why_tr: "<b>sin 2θ</b> olmalı, sin θ değil. Sinüsten önce açıyı ikiye katlayın." }
      ]
    },
    {
      id: "W3-C2", week: 3, skill: "bracketing a denominator",
      gen: function () {
        return { v: pick(20, 32, 1), th: pick(35, 60, 5), h: pick(8, 20, 1) };
      },
      text: function (p) {
        return "A stone leaves a cliff top at <b>" + p.v + " m/s</b>, <b>" + p.th + "°</b> above "
             + "the horizontal, and lands <b>" + p.h + " m</b> below the launch point. "
             + "How long is it in the air?";
      },
      text_tr: function (p) {
        return "Bir taş uçurumun tepesinden <b>" + p.v + " m/s</b> ile yatayla <b>" + p.th + "°</b> "
             + "yapacak şekilde atılıyor ve atış noktasının <b>" + p.h + " m</b> altına düşüyor. "
             + "Havada ne kadar kalır?";
      },
      hint: "½gt² − v₀y t − h = 0, so t = [v₀y + √(v₀y² + 2gh)] / g",
      answer: function (p) {
        var vy = p.v * Math.sin(p.th * D2R);
        return (vy + Math.sqrt(vy * vy + 2 * G * p.h)) / G;
      },
      unit: "s", sf: 3,
      traps: [
        { value: function (p) {
            var vy = p.v * Math.sin(p.th * D2R);
            return vy + Math.sqrt(vy * vy + 2 * G * p.h) / G; },
          label: "several seconds too long",
          label_tr: "birkaç saniye fazla",
          why: "Without brackets round the whole numerator, <code>÷ g</code> divides only the "
             + "square-root term. Type <code>( v₀y + √(…) ) ÷ 9.81</code>.",
          why_tr: "Payın tamamı parantezlenmezse <code>÷ g</code> yalnızca karekök terimini böler." },
        { value: function (p) {
            var vy = p.v * Math.sin(p.th * D2R);
            return (vy - Math.sqrt(vy * vy + 2 * G * p.h)) / G; },
          label: "negative",
          label_tr: "negatif",
          why: "The minus root is the time <em>before</em> the throw. Take the <b>+</b> root: "
             + "a landing time cannot be negative.",
          why_tr: "Eksi kök atıştan <em>önceki</em> zamandır. <b>+</b> kökü alın." }
      ]
    },
    {
      id: "W3-C3", week: 3, skill: "the EXP key",
      gen: function () { return { m: pick(1.15, 1.95, 0.05), a: pick(1.8, 3.6, 0.1) }; },
      text: function (p) {
        return "A car of mass <b>" + p.m + " × 10³ kg</b> accelerates at <b>" + p.a + " m/s²</b>. "
             + "Find the net force on it.";
      },
      text_tr: function (p) {
        return "Kütlesi <b>" + p.m + " × 10³ kg</b> olan bir araba <b>" + p.a + " m/s²</b> ile "
             + "ivmeleniyor. Üzerindeki net kuvveti bulun.";
      },
      hint: "ΣF = ma",
      answer: function (p) { return p.m * 1e3 * p.a; },
      unit: "N", sf: 3,
      traps: [
        { value: function (p) { return p.m * 1e4 * p.a; },
          label: "ten times too big",
          label_tr: "on kat büyük",
          why: function (p) {
            return "<code>" + p.m + " × 10 EXP 3</code> means " + p.m + " × 10 × 10³ = "
                 + p.m + " × 10⁴. The <code>EXP</code> (or <code>×10ˣ</code>) key <em>is</em> "
                 + "the “× 10 to the”. Type <code>" + p.m + " EXP 3</code>."; },
          why_tr: function (p) {
            return "<code>" + p.m + " × 10 EXP 3</code> = " + p.m + " × 10⁴ demektir. "
                 + "<code>EXP</code> tuşu zaten “× 10 üzeri”dir; <code>" + p.m
                 + " EXP 3</code> yazın."; } },
        { value: function (p) { return p.m * p.a; },
          label: "a thousand times too small",
          label_tr: "bin kat küçük",
          why: "The <b>× 10³</b> was dropped altogether. Read the mass back before pressing =.",
          why_tr: "<b>× 10³</b> tamamen atlanmış. = tuşundan önce kütleyi kontrol edin." }
      ]
    },

    /* ------------------------------------------------------------- WEEK 04 */
    {
      id: "W4-C1", week: 4, skill: "sin and cos on an incline",
      gen: function () { return { th: pick(22, 40, 1), mu: pick(0.20, 0.45, 0.05) }; },
      text: function (p) {
        return "A block slides down a <b>" + p.th + "°</b> slope with kinetic friction "
             + "<b>μk = " + p.mu.toFixed(2) + "</b>. Find its acceleration.";
      },
      text_tr: function (p) {
        return "Bir blok <b>" + p.th + "°</b> eğimde <b>μk = " + p.mu.toFixed(2) + "</b> kinetik "
             + "sürtünmeyle aşağı kayıyor. İvmesini bulun.";
      },
      hint: "a = g(sin θ − μk cos θ)",
      answer: function (p) {
        return G * (Math.sin(p.th * D2R) - p.mu * Math.cos(p.th * D2R));
      },
      unit: "m/s²", sf: 3,
      traps: [
        { value: function (p) {
            return G * (Math.cos(p.th * D2R) - p.mu * Math.sin(p.th * D2R)); },
          label: "too large",
          label_tr: "çok büyük",
          why: "<b>sin</b> goes with the direction of motion, <b>cos</b> with the normal force. "
             + "Swapping them is the second most common error of the semester.",
          why_tr: "<b>sin</b> hareket yönüyle, <b>cos</b> normal kuvvetle gider. Bunları "
                + "karıştırmak dönemin en sık ikinci hatasıdır." },
        { value: function (p) { return G * (Math.sin(p.th) - p.mu * Math.cos(p.th)); },
          label: "nonsense, possibly negative",
          label_tr: "anlamsız, muhtemelen negatif",
          why: "<b>RAD</b> mode again. Check the little <code>D</code> on the display before "
             + "every trigonometric calculation.",
          why_tr: "Yine <b>RAD</b> modu. Her trigonometrik işlemden önce ekrandaki "
                + "<code>D</code> göstergesini kontrol edin." }
      ]
    },
    {
      id: "W4-C2", week: 4, skill: "inverse trig",
      gen: function () { return { mu: pick(0.35, 0.85, 0.01) }; },
      text: function (p) {
        return "A crate rests on a plank with <b>μs = " + p.mu.toFixed(2) + "</b>. You slowly "
             + "raise one end. At what angle does the crate begin to slide?";
      },
      text_tr: function (p) {
        return "Bir sandık <b>μs = " + p.mu.toFixed(2) + "</b> olan bir kalas üzerinde duruyor. "
             + "Bir ucunu yavaşça kaldırıyorsunuz. Sandık hangi açıda kaymaya başlar?";
      },
      hint: "tan θc = μs",
      answer: function (p) { return Math.atan(p.mu) / D2R; },
      unit: "°", sf: 3,
      traps: [
        { value: function (p) { return Math.atan(p.mu); },
          label: "a number under 1",
          label_tr: "1'den küçük bir sayı",
          why: function (p) {
            return "That is the answer <b>in radians</b>. Switch to <b>DEG</b>, or multiply by "
                 + "180/π. An angle of " + Math.atan(p.mu).toFixed(2) + "° should look wrong "
                 + "immediately — a plank does not tip a crate at a fraction of a degree."; },
          why_tr: "Bu, cevabın <b>radyan</b> hâli. <b>DEG</b>'e geçin ya da 180/π ile çarpın." },
        { value: function (p) { return Math.tan(p.mu * D2R); },
          label: "far too small",
          label_tr: "çok fazla küçük",
          why: "You need <b>tan⁻¹</b> (the <code>SHIFT tan</code> key), not tan. You are given "
             + "the ratio and want the angle.",
          why_tr: "tan değil <b>tan⁻¹</b> gerekiyor (<code>SHIFT tan</code>). Oran verilmiş, "
                + "açı isteniyor." }
      ]
    },
    {
      id: "W4-C3", week: 4, skill: "bracketing both parts of a fraction",
      gen: function () {
        var a = pick(3.5, 6.5, 0.1), b = pick(1.5, 3.0, 0.1);
        return { m1: a, m2: b };
      },
      text: function (p) {
        return "An Atwood machine carries <b>" + p.m1.toFixed(1) + " kg</b> on one side and "
             + "<b>" + p.m2.toFixed(1) + " kg</b> on the other, over a frictionless pulley. "
             + "Find the acceleration.";
      },
      text_tr: function (p) {
        return "Sürtünmesiz bir makarada bir yanda <b>" + p.m1.toFixed(1) + " kg</b>, diğer yanda "
             + "<b>" + p.m2.toFixed(1) + " kg</b> asılı. İvmeyi bulun.";
      },
      hint: "a = (m₁ − m₂)g / (m₁ + m₂)",
      answer: function (p) { return (p.m1 - p.m2) * G / (p.m1 + p.m2); },
      unit: "m/s²", sf: 3,
      traps: [
        { value: function (p) { return p.m1 - p.m2 * G / (p.m1 + p.m2); },
          label: "close to m₁, far too large",
          label_tr: "m₁'e yakın, çok büyük",
          why: "<code>m₁ − m₂ × g ÷ (m₁ + m₂)</code> only multiplies <b>m₂</b> by g. "
             + "Bracket the numerator: <code>(m₁ − m₂) × 9.81 ÷ (m₁ + m₂)</code>.",
          why_tr: "Parantezsiz yazımda yalnızca <b>m₂</b> g ile çarpılır. Payı parantezleyin." },
        { value: function (p) { return (p.m1 - p.m2) * G / p.m1 + p.m2; },
          label: "oddly close, but wrong",
          label_tr: "tuhaf biçimde yakın ama yanlış",
          why: "The <b>denominator</b> needs brackets too, or <code>÷ m₁ + m₂</code> divides by "
             + "m₁ and then <em>adds</em> m₂.",
          why_tr: "<b>Payda</b> da parantezlenmeli; aksi hâlde m₁'e bölüp m₂'yi <em>ekler</em>." }
      ]
    },

    /* ------------------------------------------------------------- WEEK 05 */
    {
      id: "W5-C1", week: 5, skill: "cos of an obtuse angle",
      gen: function () { return { F: pick(240, 420, 10), d: pick(6.0, 12.0, 0.5), th: pick(105, 150, 5) }; },
      text: function (p) {
        return "A rope pulls a sledge with a force of <b>" + p.F + " N</b> at "
             + "<b>" + p.th + "°</b> to its displacement of <b>" + p.d + " m</b>. "
             + "Find the work done by the rope.";
      },
      text_tr: function (p) {
        return "Bir halat kızağı, <b>" + p.d + " m</b> yer değiştirmesiyle <b>" + p.th + "°</b> "
             + "açı yapacak şekilde <b>" + p.F + " N</b> kuvvetle çekiyor. Halatın yaptığı işi "
             + "bulun.";
      },
      hint: "W = Fd cos θ  — and mind the sign",
      answer: function (p) { return p.F * p.d * Math.cos(p.th * D2R); },
      unit: "J", sf: 3,
      traps: [
        { value: function (p) { return Math.abs(p.F * p.d * Math.cos(p.th * D2R)); },
          label: "the right size, wrong sign",
          label_tr: "büyüklük doğru, işaret yanlış",
          why: "Beyond 90° the cosine is <b>negative</b>, so the rope is <em>removing</em> energy. "
             + "Keep the minus sign — it is the physics, not a typo.",
          why_tr: "90°'nin ötesinde kosinüs <b>negatiftir</b>; halat enerji <em>götürüyor</em>. "
                + "Eksi işareti koruyun." },
        { value: function (p) { return p.F * p.d * Math.cos(p.th); },
          label: "plausible, and wrong",
          label_tr: "makul görünen, yanlış cevap",
          why: "<b>RAD</b> mode. This one bites hardest with obtuse angles, because the sign "
             + "can come out right by accident and hide the mistake.",
          why_tr: "<b>RAD</b> modu. Geniş açılarda işaret tesadüfen doğru çıkıp hatayı "
                + "gizleyebilir." }
      ]
    },
    {
      id: "W5-C2", week: 5, skill: "the half and the square",
      gen: function () { return { k: pick(600, 1200, 50), x: pick(0.08, 0.22, 0.01) }; },
      text: function (p) {
        return "A spring of stiffness <b>" + p.k + " N/m</b> is compressed by "
             + "<b>" + p.x.toFixed(2) + " m</b>. How much elastic energy is stored?";
      },
      text_tr: function (p) {
        return "<b>" + p.k + " N/m</b> sertliğinde bir yay <b>" + p.x.toFixed(2) + " m</b> "
             + "sıkıştırılıyor. Depolanan esneklik enerjisi nedir?";
      },
      hint: "Us = ½kx²",
      answer: function (p) { return 0.5 * p.k * p.x * p.x; },
      unit: "J", sf: 3,
      traps: [
        { value: function (p) { return Math.pow(0.5 * p.k * p.x, 2); },
          label: "hugely too big",
          label_tr: "aşırı büyük",
          why: "Only <b>x</b> is squared, not the whole product. Type "
             + "<code>0.5 × k × x x²</code>, or square x first and then multiply.",
          why_tr: "Yalnızca <b>x</b> karelenir, çarpımın tamamı değil." },
        { value: function (p) { return p.k * p.x * p.x; },
          label: "exactly twice the answer",
          label_tr: "cevabın tam iki katı",
          why: "The <b>½</b> was dropped. It is there because the force grows from zero to kx, "
             + "so the stored energy is the <em>triangle</em>, not the rectangle.",
          why_tr: "<b>½</b> düşmüş. Kuvvet sıfırdan kx'e arttığı için enerji üçgenin alanıdır." }
      ]
    },
    {
      id: "W5-C3", week: 5, skill: "unit prefixes",
      gen: function () { return { kJ: pick(24, 60, 0.5), t: pick(6.0, 14.0, 0.2) }; },
      text: function (p) {
        return "A hoist does <b>" + p.kJ.toFixed(1) + " kJ</b> of work in "
             + "<b>" + p.t.toFixed(1) + " s</b>. Find its average power output.";
      },
      text_tr: function (p) {
        return "Bir vinç <b>" + p.t.toFixed(1) + " s</b> içinde <b>" + p.kJ.toFixed(1) + " kJ</b> "
             + "iş yapıyor. Ortalama güç çıkışını bulun.";
      },
      hint: "P = W / Δt",
      answer: function (p) { return p.kJ * 1000 / p.t; },
      unit: "W", sf: 3,
      traps: [
        { value: function (p) { return p.kJ / p.t; },
          label: "a thousand times too small",
          label_tr: "bin kat küçük",
          why: function (p) {
            return "<b>kJ</b>, not J. One kilojoule is 10³ J — a hoist producing "
                 + (p.kJ / p.t).toFixed(1) + " W would not lift anything. A sanity check on the "
                 + "size catches this instantly."; },
          why_tr: "<b>kJ</b>, J değil. 1 kJ = 10³ J. Sonucun büyüklüğünü sorgulamak bu hatayı "
                + "hemen yakalar." },
        { value: function (p) { return p.kJ * 1000 * p.t; },
          label: "enormous",
          label_tr: "muazzam büyük",
          why: "Power is work <b>divided</b> by time. Multiplying gives joule-seconds, which is "
             + "not a unit of anything you want.",
          why_tr: "Güç, işin zamana <b>bölümüdür</b>. Çarpmak işe yaramayan bir birim verir." }
      ]
    },

    /* --------------------------------------------- WEEK 06 (review, mixed) */
    {
      id: "W6-C1", week: 6, skill: "square root of a sum",
      gen: function () { return { fx: pick(60, 140, 5), fy: pick(40, 120, 5) }; },
      text: function (p) {
        return "Two perpendicular forces act on a crate: <b>" + p.fx + " N</b> east and "
             + "<b>" + p.fy + " N</b> north. Find the <b>magnitude</b> of the resultant.";
      },
      text_tr: function (p) {
        return "Bir sandığa dik iki kuvvet etki ediyor: doğuya <b>" + p.fx + " N</b>, kuzeye "
             + "<b>" + p.fy + " N</b>. Bileşkenin <b>büyüklüğünü</b> bulun.";
      },
      hint: "F = √(Fx² + Fy²)",
      answer: function (p) { return Math.hypot(p.fx, p.fy); },
      unit: "N", sf: 3,
      traps: [
        { value: function (p) { return p.fx + p.fy; },
          label: "the sum of the two",
          label_tr: "ikisinin toplamı",
          why: "Magnitudes do not add. Only <b>components</b> add — and these are perpendicular, "
             + "so you need Pythagoras.",
          why_tr: "Büyüklükler toplanmaz. Yalnızca <b>bileşenler</b> toplanır; bunlar dik "
                + "olduğundan Pisagor gerekir." },
        { value: function (p) { return p.fx + p.fy * p.fy; },
          label: "absurdly large",
          label_tr: "saçma derecede büyük",
          why: "The square root must cover the <b>whole sum</b>: <code>√( Fx² + Fy² )</code>. "
             + "On most calculators the √ opens a bracket — close it in the right place.",
          why_tr: "Karekök <b>toplamın tamamını</b> kapsamalı. Çoğu makinede √ bir parantez açar; "
                + "doğru yerde kapatın." }
      ]
    },
    {
      id: "W6-C2", week: 6, skill: "a two-stage chain",
      /* The friction must not eat all the height, or the block never reaches the
         far side and the "answer" is a Math ERROR. Insist on at least 0.6 m of
         height surviving, so the final speed is always a sensible few m/s. */
      gen: function () {
        var p = { m: 2.0, h: 2.4, mu: 0.30, d: 2.0 };
        for (var k = 0; k < 80; k++) {
          p = { m: pick(1.2, 3.0, 0.1), h: pick(1.4, 3.0, 0.1),
                mu: pick(0.15, 0.40, 0.05), d: pick(1.0, 3.0, 0.5) };
          if (p.h - p.mu * p.d >= 0.6) break;
        }
        return p;
      },
      text: function (p) {
        return "A <b>" + p.m.toFixed(1) + " kg</b> block slides from rest down a frictionless "
             + "ramp of height <b>" + p.h.toFixed(1) + " m</b>, then crosses <b>"
             + p.d.toFixed(1) + " m</b> of rough floor with <b>μk = " + p.mu.toFixed(2)
             + "</b>. Find its final speed.";
      },
      text_tr: function (p) {
        return "<b>" + p.m.toFixed(1) + " kg</b>'lık bir blok, <b>" + p.h.toFixed(1) + " m</b> "
             + "yükseklikteki sürtünmesiz rampadan durgun hâlden kayıyor, sonra "
             + "<b>μk = " + p.mu.toFixed(2) + "</b> olan <b>" + p.d.toFixed(1) + " m</b> pürüzlü "
             + "zemini geçiyor. Son süratini bulun.";
      },
      hint: "mgh − μk mg d = ½mv²  — the mass cancels",
      answer: function (p) {
        return Math.sqrt(2 * G * (p.h - p.mu * p.d));
      },
      unit: "m/s", sf: 3,
      traps: [
        { value: function (p) { return Math.sqrt(2 * G * p.h); },
          label: "too fast",
          label_tr: "çok hızlı",
          why: "The friction over the floor was ignored. Subtract <b>μk mg d</b> before taking "
             + "the root — the block arrives slower than it left the ramp.",
          why_tr: "Zemindeki sürtünme atlanmış. Kökten önce <b>μk mg d</b>'yi çıkarın." },
        { value: function (p) { return 2 * G * (p.h - p.mu * p.d); },
          label: "the value of v²",
          label_tr: "v² değeri",
          why: "Stopping one step early. The energy equation gives <b>v²</b>; the question "
             + "asks for v.",
          why_tr: "Bir adım erken durulmuş. Denklem <b>v²</b> verir, soru v istiyor." }
      ]
    },
    {
      id: "W6-C3", week: 6, skill: "significant figures",
      /* The trap here is rounding cos θ to 2 d.p. before multiplying, so reject
         any angle whose cosine is already close to a 2-d.p. value — there the
         early rounding changes nothing and the trap stops being wrong. */
      gen: function () {
        /* the early rounding must move the product by more than the 0.3%
           accept window; a 2-d.p. shift of cos is at most 0.005, so 0.0035
           relative is both sufficient and reachable for about half of angles */
        /* keep drawing until rounding cos to 2 d.p. actually changes the answer
           at three significant figures — otherwise the trap is not wrong */
        var p = { F: 68, th: 41, d: 6.5 };
        for (var k = 0; k < 80; k++) {
          p = { F: pick(45, 95, 1), th: pick(28, 56, 1), d: pick(4.0, 9.0, 0.5) };
          var c = Math.cos(p.th * D2R);
          var good = p.F * p.d * c;
          var early = p.F * p.d * (Math.round(c * 100) / 100);
          if (sf3(good) !== sf3(early)) break;
        }
        return p;
      },
      text: function (p) {
        return "A force of <b>" + p.F + " N</b> at <b>" + p.th + "°</b> to the horizontal drags a "
             + "box <b>" + p.d.toFixed(1) + " m</b> horizontally. Give the work done to "
             + "<b>three significant figures</b>.";
      },
      text_tr: function (p) {
        return "Yatayla <b>" + p.th + "°</b> açı yapan <b>" + p.F + " N</b>'luk kuvvet bir kutuyu "
             + "yatay olarak <b>" + p.d.toFixed(1) + " m</b> çekiyor. Yapılan işi <b>üç anlamlı "
             + "rakamla</b> verin.";
      },
      hint: "W = Fd cos θ, rounded only at the end",
      answer: function (p) { return p.F * p.d * Math.cos(p.th * D2R); },
      unit: "J", sf: 3,
      /* This challenge IS about rounding, so no relative window can work: an
         honest 3-s.f. answer can be 0.5% off while the early-rounding trap can
         be 0.4% off. Mark it the way the question asks instead — the submitted
         value must agree with the correct one at three significant figures. */
      mark: "sf3",
      traps: [
        { value: function (p) {
            var c = Math.round(Math.cos(p.th * D2R) * 100) / 100;   // rounded too early
            return p.F * p.d * c; },
          label: "off in the third figure",
          label_tr: "üçüncü rakamda hatalı",
          why: "The cosine was rounded to two decimals <em>before</em> multiplying. Keep the full "
             + "value in the calculator and round <b>only the final answer</b>. Use "
             + "<code>Ans</code> rather than retyping.",
          why_tr: "Kosinüs çarpmadan <em>önce</em> yuvarlanmış. Tam değeri makinede tutup "
                + "<b>yalnızca son cevabı</b> yuvarlayın; <code>Ans</code> tuşunu kullanın." },
        { value: function (p) { return p.F * p.d; },
          label: "too large",
          label_tr: "çok büyük",
          why: "The <b>cos θ</b> was dropped. Only the component of the force along the "
             + "displacement does work.",
          why_tr: "<b>cos θ</b> düşmüş. Yalnızca kuvvetin yer değiştirme yönündeki bileşeni iş "
                + "yapar." }
      ]
    }
  ];

  window.CALC_CHALLENGES = CHALLENGES;
  window.CALC_MARK = isCorrect;
  window.CALC_SF3 = sf3;
})();
