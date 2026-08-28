/* ============================================================
   AA — Algorithm Analysis for Absolute Beginners
   Shared behaviour: theme, copy buttons, quizzes, growth widget,
   "week done" tracking + progress bar.
   No dependencies, no build step.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- theme ---------- */
  var THEME_KEY = "aa_theme";
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.textContent = t === "light" ? "☾ Dark" : "☀ Light";
    });
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) {
      saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    applyTheme(saved);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    });
  }

  /* ---------- copy buttons ---------- */
  function initCopy() {
    document.querySelectorAll(".code").forEach(function (block) {
      var head = block.querySelector(".code-head");
      if (!head || head.querySelector(".copy-btn")) return;
      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "copy";
      btn.addEventListener("click", function () {
        var code = block.querySelector("pre code");
        var text = code ? code.innerText : "";
        var ok = function () {
          btn.textContent = "copied";
          btn.classList.add("done");
          setTimeout(function () { btn.textContent = "copy"; btn.classList.remove("done"); }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok, function () {});
        } else {
          var ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); ok(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
      head.appendChild(btn);
    });
  }

  /* ---------- quizzes ---------- */
  function initQuiz() {
    document.querySelectorAll("[data-quiz]").forEach(function (quiz) {
      var questions = quiz.querySelectorAll(".q");
      var score = document.createElement("p");
      score.className = "quiz-score";
      var answered = 0, correct = 0;
      function refresh() {
        score.textContent = "answered " + answered + "/" + questions.length + "  •  correct " + correct;
      }
      questions.forEach(function (q) {
        var right = parseInt(q.getAttribute("data-answer"), 10);
        var opts = q.querySelectorAll(".opt");
        var why = q.querySelector(".why");
        opts.forEach(function (opt, i) {
          opt.type = "button";
          opt.addEventListener("click", function () {
            if (q.dataset.locked) return;
            q.dataset.locked = "1";
            answered++;
            if (i === right) correct++;
            opts.forEach(function (o, j) {
              o.classList.add("locked");
              if (j === right) o.classList.add("right");
            });
            if (i !== right) opt.classList.add("wrong");
            if (why) why.classList.add("show");
            refresh();
          });
        });
      });
      refresh();
      quiz.appendChild(score);
    });
  }

  /* ---------- growth widget ---------- */
  var ORDERS = [
    { name: "O(1)",      f: function () { return 1; } },
    { name: "O(log n)",  f: function (n) { return Math.max(1, Math.log(n) / Math.LN2); } },
    { name: "O(n)",      f: function (n) { return n; } },
    { name: "O(n log n)",f: function (n) { return n * Math.max(1, Math.log(n) / Math.LN2); } },
    { name: "O(n²)", f: function (n) { return n * n; } },
    { name: "O(2ⁿ)", f: function (n) { return Math.pow(2, Math.min(n, 400)); } }
  ];
  var SIZES = [10, 50, 100, 500, 1000, 5000, 10000, 100000, 1000000];

  function human(x) {
    if (!isFinite(x)) return "forever";
    if (x < 1000) return String(Math.round(x));
    if (x < 1e6) return (x / 1e3).toFixed(1) + " thousand";
    if (x < 1e9) return (x / 1e6).toFixed(1) + " million";
    if (x < 1e12) return (x / 1e9).toFixed(1) + " billion";
    if (x < 1e15) return (x / 1e12).toFixed(1) + " trillion";
    return x.toExponential(1);
  }
  function humanTime(steps) {           /* assume 10 million steps per second */
    var s = steps / 1e7;
    if (s < 1e-3) return "instant";
    if (s < 1) return (s * 1000).toFixed(1) + " ms";
    if (s < 60) return s.toFixed(1) + " s";
    if (s < 3600) return (s / 60).toFixed(1) + " min";
    if (s < 86400) return (s / 3600).toFixed(1) + " hours";
    if (s < 3.15e7) return (s / 86400).toFixed(1) + " days";
    if (s / 3.15e7 > 1e9) return "longer than the universe";
    return (s / 3.15e7).toFixed(1) + " years";
  }

  function initGrowth() {
    document.querySelectorAll("[data-growth]").forEach(function (host) {
      var mode = host.getAttribute("data-growth") || "steps";
      host.innerHTML =
        '<label for="' + (host.id || "g") + '-slider">Problem size n — drag to grow the input</label>' +
        '<input id="' + (host.id || "g") + '-slider" type="range" min="0" max="' + (SIZES.length - 1) + '" value="2" step="1">' +
        '<div class="readout"></div><div class="bars"></div>' +
        '<p style="font-size:.76rem;color:var(--muted);margin:.8rem 0 0">' +
        (mode === "time"
          ? "Time assumes a computer doing 10 million simple steps per second."
          : "Bars are on a logarithmic scale — each step right is 10× more work.") +
        "</p>";
      var slider = host.querySelector("input");
      var readout = host.querySelector(".readout");
      var bars = host.querySelector(".bars");
      bars.innerHTML = ORDERS.map(function (o) {
        return '<div class="bar-row"><span class="name">' + o.name + '</span>' +
               '<span class="bar-track"><span class="bar-fill"></span></span>' +
               '<span class="val"></span></div>';
      }).join("");
      var fills = bars.querySelectorAll(".bar-fill");
      var vals = bars.querySelectorAll(".val");

      function draw() {
        var n = SIZES[parseInt(slider.value, 10)];
        readout.textContent = "n = " + n.toLocaleString("en-US");
        var counts = ORDERS.map(function (o) { return o.f(n); });
        /* scale to the worst *practical* order (n squared); the exponential row
           is astronomically larger and would flatten everything else to nothing */
        var scaleTo = counts.slice(0, ORDERS.length - 1).map(function (c) {
          return Math.log10(Math.max(c, 1));
        });
        var maxLog = Math.max.apply(null, scaleTo);
        counts.forEach(function (c, i) {
          var pct = maxLog > 0 ? (Math.log10(Math.max(c, 1)) / maxLog) * 100 : 2;
          pct = Math.min(pct, 100);
          fills[i].style.width = Math.max(pct, 1.5) + "%";
          vals[i].textContent = mode === "time" ? humanTime(c) : human(c) + " steps";
        });
      }
      slider.addEventListener("input", draw);
      draw();
    });
  }

  /* ---------- week completion ---------- */
  var DONE_KEY = "aa_done_weeks";
  function readDone() {
    try { return JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeDone(list) {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function initDone() {
    var done = readDone();
    document.querySelectorAll("[data-done]").forEach(function (btn) {
      var id = btn.getAttribute("data-done");
      function paint() {
        var on = readDone().indexOf(id) !== -1;
        btn.classList.toggle("on", on);
        btn.textContent = on ? "✓ marked as done" : "mark this week done";
      }
      btn.addEventListener("click", function () {
        var list = readDone();
        var i = list.indexOf(id);
        if (i === -1) list.push(id); else list.splice(i, 1);
        writeDone(list);
        paint();
      });
      paint();
    });

    /* home page: tick finished weeks + progress bar */
    document.querySelectorAll("a.week-card[data-week]").forEach(function (a) {
      if (done.indexOf(a.getAttribute("data-week")) !== -1) {
        var card = a.querySelector(".card");
        if (card) card.classList.add("done");
      }
    });
    var host = document.querySelector("[data-progress]");
    if (host) {
      var total = parseInt(host.getAttribute("data-progress"), 10) || 14;
      var n = done.length;
      host.innerHTML =
        '<div class="progress-track"><div class="progress-fill"></div></div>' +
        '<div class="progress-label"></div>';
      host.querySelector(".progress-fill").style.width = (n / total) * 100 + "%";
      host.querySelector(".progress-label").textContent =
        n + " of " + total + " weeks marked done — progress is stored in this browser only";
    }
  }

  function boot() { initTheme(); initCopy(); initQuiz(); initGrowth(); initDone(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
