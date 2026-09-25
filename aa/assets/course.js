/* ============================================================
   AA — Algorithm Analysis
   course.js — reading controls shared by every sub-page.

   Adds four things, all progressive enhancement. Every page is
   complete and readable with this file absent or blocked:
     1. a week switcher in the site header
     2. a language control (Both / English)
     3. a contents menu for long lesson panels
     4. Core / Reading-only tagging on the scope tables

   It never moves or rewrites content, and it binds to nothing
   that compact.js or the animation bundles use.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var page = document.querySelector(".aligned");
  if (!page) return;

  var WEEKS = [
    ["w1", "01", "Algorithms and correctness"],
    ["w2", "02", "Counting work and growth"],
    ["w3", "03", "Program analysis and logarithms"],
    ["w4", "04", "Arrays, lists, stacks, queues"],
    ["w5", "05", "Search trees and hashing"],
    ["w6", "06", "Priority queues and heaps"],
    ["w7", "07", "Sorting II and recurrences"],
    ["w8", "08", "Graphs I: BFS"],
    ["w9", "09", "Graphs II: DFS and SCCs"],
    ["w10", "10", "Minimum spanning trees"],
    ["w11", "11", "Shortest paths"],
    ["w12", "12", "Backtracking and DP"],
    ["w13", "13", "Dynamic programming"],
    ["w14", "14", "Reductions and NP-completeness"]
  ];

  /* current location: "w7", "scope", "review", "textbook-problems" or "" */
  var here = (location.pathname.replace(/\/index\.html$/, "").split("/").filter(Boolean).pop() || "");

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  /* ---------- 1. week switcher in the header ---------- */
  (function () {
    var header = document.querySelector(".site-header");
    if (!header || document.querySelector(".week-switch")) return;
    var depth = here === "" ? "" : "../";
    var box = el("div", {});
    WEEKS.forEach(function (w) {
      var a = el("a", { href: depth + w[0] + "/" });
      if (w[0] === here) a.setAttribute("aria-current", "page");
      a.appendChild(el("b", { text: w[1] }));
      a.appendChild(el("span", { text: w[2] }));
      box.appendChild(a);
    });
    [["Exam scope", "scope"], ["Cumulative review", "review"],
     ["Textbook problems", "textbook-problems"]].forEach(function (p) {
      var a = el("a", { href: depth + p[1] + "/" });
      if (p[1] === here) a.setAttribute("aria-current", "page");
      a.appendChild(el("b", { text: "\u2192" }));
      a.appendChild(el("span", { text: p[0] }));
      box.appendChild(a);
    });
    var label = /^w\d+$/.test(here) ? "Week " + here.slice(1) + " \u25be" : "Jump to week \u25be";
    var menu = el("details", { class: "week-switch" }, [el("summary", { text: label }), box]);
    var toggle = header.querySelector("[data-theme-toggle]");
    header.insertBefore(menu, toggle || null);
    document.addEventListener("click", function (e) {
      if (menu.open && (!menu.contains(e.target) || e.target.closest("a"))) menu.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
    });
  })();

  /* ---------- 2. language control ----------
     Turkish and English alternate through the lessons. Every Turkish node
     carries lang="tr", so hiding that side is exact. The reverse is not:
     164 of the 934 Turkish nodes trail their block instead of leading it,
     so "which node is the English one" cannot be decided safely — a
     Turkish-only mode is deliberately not offered. Default is Both, so
     nothing changes for anyone who never touches the control. */
  var LANG_KEY = "aa_reading_lang";
  var turkish = page.querySelectorAll(".turkish");

  if (turkish.length) {
    var modes = [["both", "Both"], ["en", "English"]];
    var saved = "both";
    try { saved = localStorage.getItem(LANG_KEY) || "both"; } catch (e) {}
    if (saved !== "en") saved = "both";

    var group = el("div", { class: "lang-switch", role: "group", "aria-label": "Reading language" },
                   [el("span", { text: "Language" })]);
    var buttons = modes.map(function (m) {
      var b = el("button", { type: "button", "aria-pressed": "false", "data-lang": m[0], text: m[1] });
      b.addEventListener("click", function () { apply(m[0], true); });
      group.appendChild(b);
      return b;
    });

    function apply(mode, persist) {
      root.classList.toggle("reading-en", mode === "en");
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === mode));
      });
      if (persist) { try { localStorage.setItem(LANG_KEY, mode); } catch (e) {} }
      window.dispatchEvent(new Event("resize"));   /* let diagrams re-measure */
    }

    var bar = el("div", { class: "reading-bar" }, [group]);
    var tabs = page.querySelector(".week-tabs");
    if (tabs && tabs.nextSibling) tabs.parentNode.insertBefore(bar, tabs.nextSibling);
    else page.insertBefore(bar, page.children[1] || null);
    apply(saved, false);
  }

  /* ---------- 3. contents menu for the lesson panel ---------- */
  (function () {
    var bar = page.querySelector(".reading-bar");
    var lesson = document.getElementById("lesson") || page;
    var heads = [].slice.call(lesson.querySelectorAll("h2")).filter(function (h) {
      return !h.closest(".objectives") && h.textContent.trim();
    });
    if (!bar || heads.length < 4) return;
    var list = el("div", {});
    heads.forEach(function (h, i) {
      if (!h.id) h.id = "section-" + (i + 1);
      list.appendChild(el("a", { href: "#" + h.id, text: h.textContent.trim() }));
    });
    var toc = el("details", { class: "lesson-toc" },
                 [el("summary", { text: "Contents (" + heads.length + ") \u25be" }), list]);
    bar.appendChild(toc);
    toc.addEventListener("click", function (e) { if (e.target.closest("a")) toc.open = false; });
  })();

  /* ---------- 4. scope tables: Core vs Reading-only ---------- */
  page.querySelectorAll(".scope-table tbody tr").forEach(function (tr) {
    var cell = tr.cells[tr.cells.length - 1];
    if (!cell) return;
    var v = cell.textContent.trim().toLowerCase();
    if (v.indexOf("core") === 0) cell.classList.add("is-core");
    else if (v.indexOf("reading") === 0) cell.classList.add("is-reading");
  });
})();
