/* No scores or storage: students may reveal, hide and revisit each answer. */
for (const bank of document.querySelectorAll('.chapter-question-bank')) {
  const reset = bank.querySelector('.reset-answers');
  if (!reset) continue;
  reset.hidden = false;
  reset.addEventListener('click', () => {
    for (const disclosure of bank.querySelectorAll('.question-answer, .question-hint')) {
      disclosure.open = false;
    }
    reset.textContent = 'Answers hidden — try again';
  });
  bank.addEventListener('toggle', () => {
    if (bank.querySelector('.question-answer[open], .question-hint[open]')) {
      reset.textContent = 'Hide answers & hints — try again';
    }
  }, true);
}
