(function () {
  'use strict';
  const model = window.AAWeekTwo;
  if (!model || typeof model.traceWork !== 'function') return;
  const $ = id => document.getElementById(id);
  const values = [18, 7, 18, 24, 11, 20];
  let work, revealed = 0, solutionSeen = false;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function comparison(step) {
    const left = values[step.i - 1];
    const right = work.mode === 'nested' ? values[step.j - 1] : step.pass === 2 ? 24 : 7;
    return { left, right, equal: left === right };
  }

  function render() {
    const n = work.n, mode = work.mode, done = revealed === work.steps.length;
    $('work-records').textContent = 'Records: [' + values.slice(0, n).join(', ') + ']. n = ' + n + '.';
    $('work-task').textContent = mode === 'nested'
      ? 'Compare every row position with every column position. Include self-comparisons and reversed pairs.'
      : mode === 'sequential'
        ? "Compare all records with 7 first, then all records with 24. Do not stop after a match."
        : 'Compare every record with 7 once. We need a result for every record; do not stop after a match.';
    const board = $('work-board');
    board.replaceChildren();
    board.style.gridTemplateColumns = 'repeat(' + Math.max(1, n) + ', minmax(48px, 1fr))';
    if (!n) {
      const empty = el('p', 'An empty list has no records or cells to fill.');
      empty.className = 'empty-board'; board.append(empty);
    }
    work.steps.forEach((step, index) => {
      if (index % n === 0) {
        const label = el('div', mode === 'nested' ? 'Row i = ' + step.i
          : 'Pass ' + step.pass + ' · target ' + (step.pass === 2 ? 24 : 7));
        label.className = 'row-label'; board.append(label);
      }
      const cell = el('div'), name = mode === 'nested' ? '(' + step.i + ',' + step.j + ')' : 'position ' + step.i;
      cell.className = 'work-cell';
      cell.dataset.step = String(index + 1);
      cell.append(el('small', name));
      if (index < revealed) {
        const result = comparison(step);
        cell.classList.add('counted');
        if (result.equal) cell.classList.add('equal');
        if (index + 1 === revealed) cell.classList.add('current');
        cell.append(el('b', result.equal ? '=' : '≠'));
        cell.setAttribute('aria-label', name + ': ' + result.left + (result.equal ? ' equals ' : ' does not equal ') + result.right + '; one check was made.');
      } else {
        cell.append(el('b', '?'));
        cell.setAttribute('aria-label', name + ': not checked yet.');
      }
      board.append(cell);
    });
    $('work-next').disabled = done;
    $('work-count').textContent = 'Equality checks: ' + revealed;
    let status;
    if (!n) status = 'n = 0. No equality checks were made. Total: 0.';
    else if (!revealed) status = 'No equality checks have been made yet. Predict the total first, then reveal the first cell.';
    else {
      const last = work.steps[revealed - 1], result = comparison(last);
      status = (mode === 'nested' ? 'Last pair (' + last.i + ',' + last.j + ')' : 'Pass ' + last.pass + ', position ' + last.i)
        + ': ' + result.left + (result.equal ? ' = ' : ' ≠ ') + result.right + '. One was added to the counter.';
      if (done) status += ' The report is complete. Equality checks: ' + revealed + '.';
      else {
        const next = work.steps[revealed];
        status += mode === 'nested' ? ' Next pair (' + next.i + ',' + next.j + ').'
          : ' Next: pass ' + next.pass + ', position ' + next.i + '.';
        if (result.equal) status += ' A match fills only one cell of the report; we continue for the other results.';
      }
    }
    $('work-status').textContent = status;
  }

  function reset() {
    work = model.traceWork(Number($('work-n').value), $('work-mode').value);
    revealed = 0; render();
  }

  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid));
    return { id, value, valid };
  }

  function feedback(id, text, error) {
    $(id).textContent = text;
    $(id).dataset.state = error ? 'error' : 'ok';
  }

  $('work-n').addEventListener('change', reset);
  $('work-mode').addEventListener('change', reset);
  $('work-next').addEventListener('click', () => { if (revealed < work.steps.length) { revealed++; render(); } });
  $('work-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const seq = number('guided-seq', 0, 100), nested = number('guided-nested', 0, 100);
    if (!seq.valid || !nested.valid) {
      feedback('guided-feedback', 'Fill in both fields with integers from 0–100.', true);
      $(!seq.valid ? seq.id : nested.id).focus(); return;
    }
    const seqCount = model.traceWork(3, 'sequential').count, nestedCount = model.traceWork(3, 'nested').count;
    if (seq.value === seqCount && nested.value === nestedCount) {
      feedback('guided-feedback', 'Both numbers are correct. Review your explanation too: did you add two full passes, and multiply three rows by three checks per row?', false);
    } else {
      const hint = seq.value !== seqCount ? 'In the sequential pattern, the second full scan starts after the first finishes. Add the counts for the two passes.'
        : 'In the nested pattern, each of three rows contains three cells to check. Do not count only the cells that are equal.';
      feedback('guided-feedback', hint + ' Try again.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const pairs = model.traceWork(3, 'nested').count;
    const total = pairs + model.traceWork(3, 'single').count;
    const doubled = model.traceWork(6, 'nested').count + model.traceWork(6, 'single').count;
    const checks = [
      { ...number('exit-n', 0, 12), expected: 3, label: 'record count n' },
      { ...number('exit-pairs', 0, 200), expected: pairs, label: 'checks in the full table' },
      { ...number('exit-total', 0, 200), expected: total, label: 'total across both parts' },
      { ...number('exit-double', 0, 200), expected: doubled, label: 'total for six records' }
    ];
    const invalid = checks.find(x => !x.valid);
    if (invalid) {
      feedback('exit-feedback', 'Fill in all four number fields with integers in the allowed ranges. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(x => x.value !== x.expected);
    const seen = solutionSeen ? ' You have opened the model answer; mark this attempt as a check made after seeing the solution.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Check again: ' + wrong.map(x => x.label).join(', ') + '. Count the work of one full scan and the full table separately, then add them.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written
        ? 'This check has not assessed your formula or written reasoning; compare them with the model answer and the four criteria.'
        : 'Complete your trace, formula and explanations too; numbers alone do not show all the lesson outcomes.') + seen, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'You have opened the model answer in this session. Assess what you wrote before seeing it separately from later corrections.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => {
      $(output).textContent = '';
      if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
    });
  }
  const worked = document.querySelector('.worked-table');
  worked.open = false;
  let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  document.querySelectorAll('.js-only').forEach(node => {
    node.hidden = false;
    if (node.matches('button[type="submit"]')) node.disabled = false;
  });
  document.documentElement.classList.add('lesson-ready');
  reset();
})();
