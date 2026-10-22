(function () {
  'use strict';
  const model = window.AAWeekOne;
  if (!model || typeof model.trace !== 'function') return;
  const $ = id => document.getElementById(id);
  const cases = {
    worked: { values: [18, 7, 18, 24], target: 24 },
    early: { values: [18, 7, 18, 24], target: 7 },
    duplicate: { values: [18, 7, 18, 24], target: 18 },
    absent: { values: [18, 7, 18, 24], target: 99 },
    empty: { values: [], target: 24 }
  };
  let trace, revealed = 0;
  let solutionSeen = false;

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderTrace() {
    const finished = revealed === trace.steps.length;
    $('trace-target').textContent = String(trace.target);
    $('trace-count').textContent = 'Equality checks: ' + revealed;
    $('trace-next').disabled = finished;
    const records = $('trace-records');
    records.replaceChildren();
    records.setAttribute('aria-label', trace.values.length
      ? trace.values.map((value, i) => 'Position ' + (i + 1) + ': ' + value).join('; ')
      : 'Empty list');
    if (!trace.values.length) records.append(element('p', 'Empty list · no records.'));
    trace.values.forEach((value, i) => {
      const card = element('div');
      card.append(element('small', 'position ' + (i + 1)), element('b', String(value)));
      if (revealed && i + 1 === revealed) card.classList.add(finished && trace.position !== null ? 'is-match' : 'is-current');
      records.append(card);
    });
    const rows = $('trace-rows');
    rows.replaceChildren();
    if (!revealed) {
      const row = element('tr'), cell = element('td', trace.values.length ? 'No value has been checked yet.' : 'There are no records to check.');
      cell.colSpan = 4;
      row.append(cell); rows.append(row);
    }
    trace.steps.slice(0, revealed).forEach(step => {
      const row = element('tr');
      const decision = step.equal ? 'Return ' + step.position + ' and stop.'
        : step.position === trace.values.length ? 'The list has ended. Return “not found”.'
          : 'Move to the next position: ' + (step.position + 1) + '.';
      [step.position, step.value, step.equal ? 'Yes' : 'No', decision].forEach(text => row.append(element('td', String(text))));
      rows.append(row);
    });
    let status;
    if (!trace.values.length) status = 'The list is empty. Return “not found” without comparing any values. 0 equality checks.';
    else if (!revealed) status = 'Start: position 1 is next. No value–target comparison has been made yet.';
    else if (finished && trace.position !== null) status = 'Found: the first match is at position ' + trace.position + '. Result: ' + trace.position + '. The search has stopped; later records are not checked.';
    else if (finished) status = 'All ' + trace.values.length + ' records have been checked. None equals the target. Result: “not found”.';
    else status = 'The value at position ' + revealed + ' does not equal the target. All earlier records have been ruled out. Position ' + (revealed + 1) + ' is next.';
    $('trace-status').textContent = status;
  }

  function resetTrace() {
    const selected = cases[$('trace-case').value] || cases.worked;
    trace = model.trace(selected.values, selected.target);
    revealed = 0;
    renderTrace();
  }

  function numeric(id, min, max) {
    const input = $(id), raw = input.value.trim();
    const value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid));
    return { valid, value };
  }

  function feedback(id, text, error) {
    const node = $(id);
    node.textContent = text;
    node.dataset.state = error ? 'error' : 'ok';
  }

  $('trace-case').addEventListener('change', resetTrace);
  $('trace-next').addEventListener('click', () => {
    if (revealed < trace.steps.length) { revealed++; renderTrace(); }
  });
  $('trace-reset').addEventListener('click', resetTrace);

  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const position = numeric('guided-position', 1, 4), count = numeric('guided-count', 0, 4);
    if (!position.valid || !count.valid) {
      feedback('guided-feedback', 'Fill in both fields. The position must be an integer from 1–4, and the check count an integer from 0–4.', true);
      (!position.valid ? $('guided-position') : $('guided-count')).focus();
      return;
    }
    const expected = model.trace([12, 5, 19, 5], 19);
    if (position.value === expected.position && count.value === expected.comparisons) {
      feedback('guided-feedback', 'Both numbers are correct. Now review your explanation: does stopping at the first match explain why we do not check the fourth record?', false);
    } else {
      const hint = position.value !== expected.position
        ? 'Distinguish the target value from its position: which position should the equality decision in row 3 return?'
        : 'Count only value–target equality checks. Include the row where you stop.';
      feedback('guided-feedback', hint + ' Return to the table and try again.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const checks = [
      ['exit-position', 1, 4, 2, 'first-match position'],
      ['exit-count', 0, 4, 2, 'check count'],
      ['exit-length', 0, 12, 4, 'n'],
      ['exit-last', 1, 4, 4, 'last-match position']
    ].map(([id, min, max, expected, label]) => ({ id, expected, label, ...numeric(id, min, max) }));
    const invalid = checks.find(x => !x.valid);
    if (invalid) {
      feedback('exit-feedback', 'Fill in all four number fields with integers in the allowed ranges. The missing or out-of-range field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(x => x.value !== x.expected);
    const seen = solutionSeen ? ' You have opened the model answer; mark this attempt as a check made after seeing the solution.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Check again: ' + wrong.map(x => x.label).join(', ') + '. Distinguish the questions answered by the position, ID and record count.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written
        ? 'This number check has not assessed your reasoning; compare it with the model answer and the four separate criteria.'
        : 'Complete your trace table and written explanations too; numbers alone do not show all the lesson outcomes.') + seen, false);
    }
  });

  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'You have opened the model answer in this session. Assess the answers you produced before seeing it separately from later corrections.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => {
      $(output).textContent = '';
      if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
    });
  }
  document.querySelectorAll('.js-only').forEach(node => {
    node.hidden = false;
    if (node.matches('button[type="submit"]')) node.disabled = false;
  });
  const worked = document.querySelector('.worked-table');
  worked.open = false;
  let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  document.documentElement.classList.add('lesson-ready');
  resetTrace();
})();
