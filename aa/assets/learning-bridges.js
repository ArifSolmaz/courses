/* Optional numeric feedback. Hints, worked answers and routes also work without JS. */
(() => {
  'use strict';
  document.querySelectorAll('.learning-bridge [data-learning-check]').forEach(check => {
    const input = check.querySelector('input');
    const button = check.querySelector('[data-learning-check-button]');
    const feedback = check.querySelector('[role="status"]');
    if (!input || !button || !feedback) return;
    button.hidden = false;
    function respond() {
      const raw = input.value.trim();
      const value = Number(raw);
      const valid = raw !== '' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
      const correct = valid && value === Number(check.dataset.answer);
      feedback.dataset.result = correct ? 'correct' : 'retry';
      feedback.textContent = !valid
        ? 'Önce sıfır veya daha büyük bir tam sayı gir.'
        : correct
          ? 'Doğru sayım. Şimdi nasıl bulduğunu bir cümleyle açıkla; sonra yeni durumu dene.'
          : 'Henüz değil. Her adımın katkısını yaz; gerekirse ipucuna dön ve yeniden say.';
    }
    button.addEventListener('click', respond);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); respond(); }
    });
    input.addEventListener('input', () => {
      delete feedback.dataset.result;
      feedback.textContent = 'Tahminin değişti; yeni sayımını kontrol edebilirsin.';
    });
  });
})();
