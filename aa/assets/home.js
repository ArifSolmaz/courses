/* ============================================================
   AA — course home page behaviour.
   Two things only:
     1. "Continue" points at the first week not yet ticked.
     2. Week ticks + progress bar, stored in this browser under
        the same key the week pages use ("aa_done_weeks").
   The page is complete without this file; it only adds bookkeeping.
   ============================================================ */
(function () {
  "use strict";

  /* Set this to the Monday of week 01 (e.g. "2026-02-16") and the current
     week is highlighted automatically. Leave null to switch that off. */
  var TERM_START = null;

  var KEY = "aa_done_weeks";
  var items = [].slice.call(document.querySelectorAll(".wk[data-week]"));
  if (!items.length) return;
  document.documentElement.classList.add("js-on");
  var total = items.length;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  var progress = document.querySelector("[data-progress]");
  var fill = progress && progress.querySelector(".progress-fill");
  var label = document.querySelector("[data-progress-label]");
  var resume = document.querySelector("[data-resume]");

  function paint() {
    var done = read();
    var next = null;
    items.forEach(function (li) {
      var id = li.getAttribute("data-week");
      var on = done.indexOf(id) !== -1;
      li.classList.toggle("is-done", on);
      var tick = li.querySelector("[data-tick]");
      if (tick) tick.setAttribute("aria-pressed", String(on));
      if (!on && !next) next = li;
    });

    if (resume) {
      var target = next || items[0];
      var link = target.querySelector(".wk-link");
      var num = (link.querySelector(".wk-num") || {}).textContent || "";
      resume.setAttribute("href", link.getAttribute("href"));
      resume.firstChild.nodeValue =
        (done.length ? "Continue with " : "Start with ") + num.toLowerCase() + " ";
    }

    if (progress) {
      var n = done.filter(function (id) {
        return items.some(function (li) { return li.getAttribute("data-week") === id; });
      }).length;
      progress.hidden = n === 0;
      if (fill) fill.style.width = (n / total) * 100 + "%";
      if (label) label.textContent = n + " of " + total + " weeks ticked \u00b7 this browser only";
    }
  }

  items.forEach(function (li) {
    var tick = li.querySelector("[data-tick]");
    if (!tick) return;
    tick.addEventListener("click", function () {
      var id = tick.getAttribute("data-tick");
      var list = read();
      var i = list.indexOf(id);
      if (i === -1) list.push(id); else list.splice(i, 1);
      write(list);
      paint();
    });
  });

  var reset = document.querySelector("[data-progress-reset]");
  if (reset) reset.addEventListener("click", function () { write([]); paint(); });

  /* Optional: mark the week the term is currently in. */
  if (TERM_START) {
    var start = new Date(TERM_START + "T00:00:00");
    var i = Math.floor((Date.now() - start.getTime()) / 6048e5);
    if (i >= 0 && i < total) {
      var li = items[i];
      li.classList.add("is-current");
      var tag = document.createElement("span");
      tag.className = "wk-now";
      tag.textContent = "this week";
      li.querySelector(".wk-num").after(tag);
    }
  }

  paint();
})();
