"use strict";

(() => {
  const root = document.documentElement;
  const theme = document.getElementById("theme") || document.getElementById("themeToggle");
  const printButton = document.getElementById("print") || document.getElementById("printGuide");
  const selectors = [...document.querySelectorAll("[data-guide-select]")];
  const navLinks = [...document.querySelectorAll(".sidebar nav a")];

  function applyTheme(value) {
    root.dataset.theme = value;
    if (theme) theme.textContent = value === "dark" ? "Light theme" : "Dark theme";
  }

  try {
    applyTheme(localStorage.getItem("aa-guide-theme") === "dark" ? "dark" : "light");
  } catch (_) {
    applyTheme("light");
  }

  if (theme) {
    theme.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
      try {
        localStorage.setItem("aa-guide-theme", root.dataset.theme);
      } catch (_) {}
    });
  }

  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  selectors.forEach((select) => {
    select.addEventListener("change", () => {
      if (select.value) window.location.href = select.value;
    });
  });

  const here = new URL(window.location.href);
  const herePath = here.pathname.replace(/index\.html$/, "").replace(/\/$/, "");

  navLinks.forEach((link) => {
    const target = new URL(link.getAttribute("href"), window.location.href);
    const targetPath = target.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
    if (targetPath === herePath) link.setAttribute("aria-current", "page");
  });
})();
