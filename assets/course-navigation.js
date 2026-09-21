/* Close the small course menu after choosing a destination, or with Escape. */
(() => {
  document.addEventListener('click', event => {
    document.querySelectorAll('.path-menu[open]').forEach(menu => {
      if (!menu.contains(event.target) || event.target.closest('a')) menu.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.path-menu[open]').forEach(menu => {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    });
  });
})();
