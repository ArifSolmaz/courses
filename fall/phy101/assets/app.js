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
    if (!saved) saved = "light";   // the course site is light; dark stays available from the toggle
    applyTheme(saved);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    });
  }


  /* ---------- language: EN + TR (default) or EN only ---------- */
  var LANG_KEY = "phy101_lang";

  function applyLang(l) {
    if (l === "en") document.documentElement.setAttribute("data-lang", "en");
    else document.documentElement.removeAttribute("data-lang");
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
      b.textContent = l === "en" ? "EN only" : "EN + TR";
      b.setAttribute("aria-pressed", String(l === "en"));
      b.setAttribute("title", l === "en" ? "Show the Turkish notes" : "Hide the Turkish notes");
    });
  }
  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    applyLang(saved === "en" ? "en" : "both");
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        applyLang(document.documentElement.getAttribute("data-lang") === "en" ? "both" : "en");
      });
    });
  }

  /* ---------- stages: one panel at a time; deep links open their stage ---------- */
  function initStages() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".stage[data-stage]"));
    if (!panels.length) return;
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".stagebar .stage-btn"));

    function show(key, scrollTop) {
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-stage") !== key; });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-stage") === key)); });
      if (scrollTop) {
        var bar = document.querySelector(".stagebar");
        if (bar) window.scrollTo({ top: bar.getBoundingClientRect().top + window.pageYOffset - 60, behavior: "auto" });
      }
      window.dispatchEvent(new CustomEvent("phy101:stage", { detail: { stage: key } }));
    }
    function stageOf(el) {
      var p = el && el.closest ? el.closest(".stage[data-stage]") : null;
      return p ? p.getAttribute("data-stage") : null;
    }
    function openHash(hash) {
      if (!hash || hash.length < 2) return false;
      var target = null;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) {}
      var key = stageOf(target);
      if (!key) return false;
      show(key, false);
      requestAnimationFrame(function () { target.scrollIntoView({ block: "start" }); });
      return true;
    }

    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-stage]");
      if (b && b.tagName === "BUTTON") { show(b.getAttribute("data-stage"), true); return; }
      var a = e.target.closest('a[href^="#"]');
      if (a && openHash(a.getAttribute("href"))) e.preventDefault();
    });
    window.addEventListener("hashchange", function () { openHash(location.hash); });

    if (!openHash(location.hash)) show("learn", false);
  }

  /* ---------- printing: open every folded route ---------- */
  function initPrint() {
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details.wex-more").forEach(function (d) { d.open = true; });
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
    initLang();
    initStages();
    initPrint();
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
