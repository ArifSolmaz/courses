/* ============================================================
   PHY101 — shared page behaviour for the week notes.
   Theme, table wrapping, "week done" tracking, KaTeX kick-off.
   No dependencies, no build step. Conventions follow aa/assets/app.js.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- theme ---------- */
  var THEME_KEY = "phy101_theme";

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.textContent = t === "light" ? "☾ Dark" : "☀ Light";
      b.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
    });
    // Canvas animations read CSS custom properties at draw time, so they
    // must be told to redraw when the palette changes.
    window.dispatchEvent(new CustomEvent("phy101:theme", { detail: { theme: t } }));
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) {
      // Same default as aa/assets/app.js and the rest of the course site: dark,
      // unless the reader's system explicitly asks for light.
      saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
        ? "light" : "dark";
    }
    applyTheme(saved);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    });
  }

  /* ---------- tables: let wide notebook tables scroll instead of overflowing ---------- */
  function initTables() {
    document.querySelectorAll(".wrap table").forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains("tablewrap")) return;
      var w = document.createElement("div");
      w.className = "tablewrap";
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  /* ---------- week done ---------- */
  var DONE_KEY = "phy101_done";

  function readDone() {
    try { return JSON.parse(localStorage.getItem(DONE_KEY) || "{}"); } catch (e) { return {}; }
  }
  function writeDone(d) {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  function initDone() {
    var done = readDone();
    document.querySelectorAll("[data-done]").forEach(function (b) {
      var key = b.getAttribute("data-done");
      var set = function (on) {
        b.setAttribute("aria-pressed", String(!!on));
        b.textContent = on ? "✓ marked done" : "mark this week done";
      };
      set(done[key]);
      b.addEventListener("click", function () {
        var d = readDone();
        d[key] = !d[key];
        if (!d[key]) delete d[key];
        writeDone(d);
        set(d[key]);
      });
    });
  }

  /* ---------- maths ---------- */
  function initMath() {
    if (typeof window.renderMathInElement !== "function") return;
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
      throwOnError: false
    });
  }

  function boot() {
    initTheme();
    initTables();
    initDone();
    initMath();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
