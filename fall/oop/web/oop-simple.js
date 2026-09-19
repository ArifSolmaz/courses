/* One notebook route; the existing teaching material remains available in place. */
(() => {
  const main = document.querySelector('.main');
  const panels = [...document.querySelectorAll('.week-panel')];
  const picker = document.createElement('div');
  picker.className = 'path-picker';
  picker.innerHTML = '<label for="oop-week">Choose a week</label><select id="oop-week"></select>';
  const select = picker.querySelector('select');
  panels.forEach((panel, i) => {
    const num = i + 1;
    const heading = panel.querySelector('.week-heading');
    const title = heading?.childNodes[0]?.textContent.trim() || `Week ${num}`;
    select.add(new Option(`Week ${num} · ${title}`, String(num)));
    const header = panel.querySelector('.week-header');
    const source = panel.querySelector('.nb-btn');
    const start = document.createElement('div');
    start.className = 'oop-start';
    if (source) {
      const link = source.cloneNode(true);
      link.textContent = `Start Week ${num} in Colab →`;
      link.className = 'oop-primary';
      start.append(link);
    }
    const route = document.createElement('p');
    route.textContent = 'Work through the notebook in order. Explain your design choices and check the behaviour of your components.';
    start.append(route);
    // Keep every original section, but show only its label until requested.
    const nodes = [...panel.children];
    let group;
    nodes.forEach(node => {
      if (node === header) return;
      if (node.classList.contains('section-title')) {
        group = document.createElement('details');
        group.className = 'path-reference';
        const summary = document.createElement('summary');
        summary.textContent = node.textContent.trim();
        group.append(summary);
        node.replaceWith(group);
      } else if (group) {
        group.append(node);
      }
    });
    header.after(start);
  });
  main.prepend(picker);
  document.body.classList.add('simple-oop');
  const oldShow = window.showWeek;
  window.showWeek = function(n, focus = true) {
    if (!document.getElementById('week-' + n)) n = 1;
    oldShow(n);
    select.value = String(n);
    if (focus) {
      history.replaceState(null, '', '#week-' + n);
      const h = document.querySelector('.week-panel.active .week-heading');
      h.tabIndex = -1; h.focus({preventScroll:true});
      window.scrollTo(0, 0);
    }
  };
  select.addEventListener('change', () => showWeek(Number(select.value)));
  function fromHash() {
    const match = location.hash.match(/^#week-?(\d+)$/);
    showWeek(match ? Number(match[1]) : 1, false);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
