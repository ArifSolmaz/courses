function showWeek(number, updateHash = true) {
  const panel = document.getElementById(`week-${number}`);
  if (!panel) return;
  document.querySelectorAll('.week-panel').forEach(item => {
    item.hidden = item !== panel;
    item.classList.toggle('active', item === panel);
  });
  document.getElementById('course-week').value = number;
  if (updateHash) {
    history.replaceState(null, '', `#week-${number}`);
    const heading = panel.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }
}
document.getElementById('week-picker').hidden = false;
function requestedWeek() {
  const n = Number(location.hash.match(/^#week-(\d+)$/)?.[1] || 1);
  showWeek(n >= 1 && n <= 14 ? n : 1, false);
}
requestedWeek();
window.addEventListener('hashchange', requestedWeek);
