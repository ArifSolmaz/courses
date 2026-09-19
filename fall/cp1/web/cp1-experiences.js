/* No network calls or dependencies. Notes never leave this browser unless exported. */
(() => {
  'use strict';
  const theme = document.getElementById('theme-toggle');
  let savedTheme;
  try { savedTheme = localStorage.getItem('course_theme'); } catch { /* Storage is optional. */ }
  document.body.classList.toggle('dark', savedTheme === 'dark');
  function themeLabel() {
    theme.textContent = document.body.classList.contains('dark') ? 'Light theme' : 'Dark theme';
    theme.setAttribute('aria-label', `Switch to ${theme.textContent.toLowerCase()}`);
  }
  theme.hidden = false;
  themeLabel();
  theme.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    try { localStorage.setItem('course_theme', dark ? 'dark' : 'light'); } catch { /* Still usable. */ }
    themeLabel();
  });

  document.querySelectorAll('.bench-case').forEach(bench => {
    const button = bench.querySelector('.advance');
    const steps = [...bench.querySelectorAll('.trace li')];
    const result = bench.querySelector('.case-result');
    let revealed = 0;
    steps.forEach(step => { step.hidden = true; });
    result.hidden = true;
    bench.querySelector('.trace').setAttribute('aria-live', 'polite');
    result.setAttribute('aria-live', 'polite');
    button.hidden = false;
    button.addEventListener('click', () => {
      if (revealed < steps.length) {
        steps[revealed++].hidden = false;
        button.textContent = revealed < steps.length ? `Reveal step ${revealed + 1}` : 'Reveal the conclusion';
      } else if (result.hidden) {
        result.hidden = false;
        button.textContent = 'Reset this case';
      } else {
        steps.forEach(step => { step.hidden = true; });
        result.hidden = true;
        revealed = 0;
        button.textContent = 'Reveal step 1';
      }
    });
  });

  const diameter = document.getElementById('diameter');
  if (diameter) {
    const update = () => {
      const mm = Number(diameter.value);
      document.getElementById('wheel-result').textContent = `${mm.toFixed(1)} mm → ${(10 * Math.PI * mm / 1000).toFixed(3)} m ideal travel`;
    };
    diameter.addEventListener('input', update); update();
  }
  const interval = document.getElementById('interval');
  if (interval) {
    const offset = document.getElementById('offset');
    const update = () => {
      const times = [];
      for (let t = Number(offset.value); t <= 500; t += Number(interval.value)) times.push(t);
      const high = times.filter(t => t >= 200 && t < 300).length;
      document.getElementById('sampling-result').textContent = `Interval ${interval.value} ms · offset ${offset.value} ms → ${high} high / ${times.length} samples`;
      const points = document.getElementById('sample-points');
      points.replaceChildren(...times.map(t => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(40 + t * .8));
        circle.setAttribute('cy', t >= 200 && t < 300 ? '35' : '100');
        circle.setAttribute('r', '5');
        return circle;
      }));
      const strip = document.getElementById('sample-strip');
      strip.replaceChildren(...times.map(t => {
        const item = document.createElement('span');
        const detected = t >= 200 && t < 300;
        item.className = detected ? 'high' : 'low';
        item.textContent = `${t} ms · ${detected ? 'HIGH' : 'low'}`;
        return item;
      }));
    };
    interval.addEventListener('input', update); offset.addEventListener('input', update); update();
  }
  const voltage = document.getElementById('voltage');
  if (voltage) {
    const update = () => {
      const v = Number(voltage.value);
      const domain = v >= .5 && v <= 4.5 ? 'Inside calibration interval' : 'OUTSIDE calibration interval — unvalidated extrapolation';
      document.getElementById('force-result').textContent = `${v.toFixed(1)} V → ${((v - .5) * 25).toFixed(1)} N · ${domain}`;
    };
    voltage.addEventListener('input', update); update();
  }

  const fields = [...document.querySelectorAll('[data-note]')];
  if (!fields.length) return;
  const week = document.body.dataset.week;
  const key = `cp1-engineering-log-v1-week-${week}`;
  const status = document.getElementById('save-status');
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(field => { if (saved && typeof saved[field.id] === 'string') field.value = saved[field.id]; });
  } catch {
    storageAvailable = false;
    status.textContent = 'Saved notes could not be loaded. Download your log before leaving this page.';
  }
  document.querySelector('.notebook-tools').hidden = false;
  const values = () => Object.fromEntries(fields.map(field => [field.id, field.value]));
  fields.forEach(field => field.addEventListener('input', () => {
    try {
      localStorage.setItem(key, JSON.stringify(values()));
      storageAvailable = true;
      status.textContent = 'Saved in this browser only. Download a copy to keep or share your log.';
    } catch {
      storageAvailable = false;
      status.textContent = 'Browser saving is unavailable. Download your log before leaving this page.';
    }
  }));
  window.addEventListener('beforeunload', event => {
    if (!storageAvailable && fields.some(field => field.value.trim())) {
      event.preventDefault(); event.returnValue = '';
    }
  });
  document.getElementById('export-notes').addEventListener('click', () => {
    const heading = document.querySelector('h1').textContent;
    const log = `# CP1 · Week ${week.padStart(2, '0')} · ${heading}\n\n${fields.map(field => `## ${document.querySelector(`label[for="${field.id}"]`).textContent}\n\n${field.value || '(Not recorded)'}\n`).join('\n')}\nSource: ${location.href}\n\nThis log records my reasoning; it is not an automatic assessment.\n`;
    const url = URL.createObjectURL(new Blob([log], {type:'text/markdown;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = `CP1_Week_${week.padStart(2, '0')}_Engineering_Log.md`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  // Include full models and case traces in a printout; restore the reader's view afterward.
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('details')].map(element => [element, element.open]);
    printState.forEach(([element]) => { element.open = true; });
  });
  window.addEventListener('afterprint', () => { printState.forEach(([element, open]) => { element.open = open; }); });
})();
