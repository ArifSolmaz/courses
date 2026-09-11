function showWeek(number, updateHash = true) {
  const panel = document.getElementById(`week-${number}`);
  if (!panel) return;
  document.querySelectorAll('.week-panel').forEach(item => {
    item.classList.toggle('active', item === panel);
    item.hidden = item !== panel;
  });
  document.querySelectorAll('.week-btn').forEach(button => {
    const active = Number(button.dataset.week) === number;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (updateHash) history.replaceState(null, '', `#week-${number}`);
  document.querySelector('.main').scrollTo({top: 0, behavior: 'auto'});
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  document.getElementById('darkToggle').textContent = isLight ? '☾ Dark' : '☀ Light';
  try { localStorage.setItem('course_theme', isLight ? 'light' : 'dark'); } catch {}
}

try {
  if (localStorage.getItem('course_theme') === 'light') {
    document.body.classList.add('light');
    document.getElementById('darkToggle').textContent = '☾ Dark';
  }
} catch {}
const requestedWeek = Number(location.hash.match(/^#week-(\d+)$/)?.[1] || 1);
showWeek(requestedWeek >= 1 && requestedWeek <= 14 ? requestedWeek : 1, false);
window.addEventListener('hashchange', () => {
  const number = Number(location.hash.match(/^#week-(\d+)$/)?.[1] || 1);
  showWeek(number >= 1 && number <= 14 ? number : 1, false);
});
