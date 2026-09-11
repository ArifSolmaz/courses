"use strict";
(() => {
  const root = document.documentElement;
  const theme = document.getElementById("theme");
  const select = document.getElementById("chapter");
  function applyTheme(value) {
    root.dataset.theme = value;
    theme.textContent = value === "dark" ? "Light theme" : "Dark theme";
  }
  try { applyTheme(localStorage.getItem("aa-guide-theme") === "dark" ? "dark" : "light"); } catch (_) {}
  theme.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    try { localStorage.setItem("aa-guide-theme", root.dataset.theme); } catch (_) {}
  });
  document.getElementById("print").addEventListener("click", () => window.print());
  select.addEventListener("change", () => { window.location.hash = select.value; });
  const chapters = [...document.querySelectorAll(".reading h1")];
  const links = [...document.querySelectorAll(".sidebar nav a")];
  let queued = false;
  function updateChapter() {
    queued = false;
    let current = chapters[0];
    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top <= 155) current = chapter;
      else break;
    }
    if (!current) return;
    select.value = current.id;
    links.forEach(link => {
      if (link.hash === "#" + current.id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", () => {
    if (!queued) { queued = true; window.requestAnimationFrame(updateChapter); }
  }, { passive: true });
  window.addEventListener("hashchange", () => window.requestAnimationFrame(updateChapter));
  updateChapter();
})();
