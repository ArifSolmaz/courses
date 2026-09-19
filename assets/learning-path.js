/* Progressive enhancement: every lesson remains readable without JavaScript. */
(() => {
  'use strict';
  document.querySelectorAll('[data-week-jump]').forEach(select => {
    select.addEventListener('change', () => {
      if (select.value) location.href = select.value;
    });
    select.closest('[data-jump-control]')?.removeAttribute('hidden');
  });
  document.querySelectorAll('[data-learning-path]').forEach(path => {
    const panels = [...path.querySelectorAll(':scope > [data-step]')];
    const nav = path.querySelector(':scope > .path-steps');
    if (!panels.length || !nav) return;
    nav.hidden = false;
    function openParents(target) {
      for (let parent = target?.parentElement; parent && parent !== path; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
      if (target?.tagName === 'DETAILS') target.open = true;
    }
    function show(panel, moveFocus = false) {
      panels.forEach(item => { item.hidden = item !== panel; });
      nav.querySelectorAll('[data-step-target]').forEach(button => {
        const active = button.dataset.stepTarget === panel.id;
        button.setAttribute('aria-pressed', String(active));
      });
      path.querySelectorAll('.path-next').forEach(button => { button.hidden = false; });
      if (moveFocus) {
        history.replaceState(null, '', '#' + panel.id);
        const heading = panel.querySelector('h2,h3') || panel;
        heading.setAttribute('tabindex', '-1');
        heading.focus({preventScroll:true});
        nav.scrollIntoView({block:'start', behavior:'auto'});
      }
      window.dispatchEvent(new Event('resize'));
    }
    function followHash() {
      let target;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch {}
      const panel = target?.closest('[data-step]');
      if (!panel || !panels.includes(panel)) return false;
      show(panel); openParents(target);
      requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
      return true;
    }
    path.addEventListener('click', event => {
      const button = event.target.closest('button[data-step-target]');
      if (button) {
        const panel = panels.find(item => item.id === button.dataset.stepTarget);
        if (panel) show(panel, true);
      }
    });
    window.addEventListener('hashchange', followHash);
    if (!followHash()) show(panels[0]);
  });
  // Legacy anchors and links into folded reference material still open the target.
  function revealAnchor() {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch {}
    if (!target) return;
    for (let item = target; item; item = item.parentElement) {
      if (item.tagName === 'DETAILS') item.open = true;
    }
  }
  revealAnchor();
  window.addEventListener('hashchange', revealAnchor);
  // Redraw responsive diagrams when folded explanations become visible.
  document.addEventListener('toggle', event => {
    if (event.target.tagName === 'DETAILS' && event.target.open) window.dispatchEvent(new Event('resize'));
  }, true);
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('details')].map(el => [el, el.open]);
    printState.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener('afterprint', () => printState.forEach(([el, open]) => { el.open = open; }));
})();
