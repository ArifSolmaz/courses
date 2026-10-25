(function () {
  'use strict';
  const model = window.AAWeekThree;
  if (!model || typeof model.traceSearch !== 'function') return;
  const $ = id => document.getElementById(id);
  const directory = [4, 7, 11, 18, 24, 32, 42, 56];
  const cases = { worked: 42, first: 4, guided: 11, missing: 5, last: 56, empty: 42 };
  let trace, revealed = 0, solutionSeen = false;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function range(left, right) {
    return left <= right ? left + '–' + right : 'empty (left ' + left + ', right ' + right + ')';
  }

  function renderSearch() {
    const last = revealed ? trace.steps[revealed - 1] : null;
    const left = last ? last.nextLeft : 1;
    const right = last ? last.nextRight : trace.values.length;
    const done = revealed === trace.probes;
    const board = $('search-records');
    board.replaceChildren();
    $('search-target').textContent = 'Target: ' + trace.target + '. n = ' + trace.values.length + ' records. ' + (trace.mode === 'binary' ? 'Round the midpoint down.' : 'Scan from the left until a match or the end.');
    if (!trace.values.length) {
      const empty = el('p', 'The directory is empty. There is no position to probe.');
      empty.className = 'empty-directory';
      board.append(empty);
    }
    trace.values.forEach((value, i) => {
      const position = i + 1;
      const record = el('div');
      record.className = 'directory-record';
      record.dataset.position = String(position);
      const eliminated = position < left || position > right;
      const current = last && last.position === position;
      const matched = current && last.relation === 0;
      if (eliminated) record.classList.add('is-eliminated');
      if (current) record.classList.add('is-current');
      if (matched) record.classList.add('is-match');
      record.append(el('small', 'position ' + position), el('b', String(value)));
      record.setAttribute('aria-label', 'Position ' + position + ', value ' + value + (matched ? ', found.' : eliminated ? ', discarded.' : current ? ', last probe.' : ', candidate.'));
      board.append(record);
    });
    const history = $('search-history');
    history.replaceChildren();
    trace.steps.slice(0, revealed).forEach(step => {
      const relation = step.relation < 0 ? '<' : step.relation > 0 ? '>' : '=';
      const text = 'Interval ' + range(step.left, step.right) + '. ' + (trace.mode === 'binary' ? 'Midpoint position ' : 'Position ') + step.position + ': ' + step.value + ' ' + relation + ' ' + trace.target + '. ' + (step.relation === 0 ? 'Found; stop.' : 'New interval ' + range(step.nextLeft, step.nextRight) + '.');
      const item = el('li', text);
      item.dataset.position = String(step.position);
      history.append(item);
    });
    $('search-count').textContent = 'Probes: ' + revealed;
    $('search-next').disabled = done;
    let status = 'No probes have been made yet. Predict the first position, then reveal a probe.';
    if (!trace.values.length) status = 'Empty directory: result “not found”, 0 probes. Initially, left is 1 and right is 0; there are no candidates.';
    else if (done) status = trace.position === null
      ? 'The interval is empty. Result: “not found”. Total probes: ' + revealed + '.'
      : 'Found. Result: position ' + trace.position + '. Total probes: ' + revealed + '. The search has stopped.';
    else if (last) status = 'Last probed position: ' + last.position + '. Remaining candidate interval: ' + range(left, right) + '. Calculate the next position yourself.';
    $('search-status').textContent = status;
  }

  function resetSearch() {
    const selected = $('search-case').value;
    trace = model.traceSearch(selected === 'empty' ? [] : directory, cases[selected], $('search-mode').value);
    revealed = 0;
    renderSearch();
  }

  function renderGrowth() {
    const counts = model.growth(Number($('growth-n').value));
    $('growth-input').textContent = 'Input: n = ' + counts.n + ' → ' + counts.doubleN + ' records.';
    $('growth-linear').textContent = counts.linear + ' → ' + counts.linearAtDouble + ' checks';
    $('growth-quadratic').textContent = counts.quadratic + ' → ' + counts.quadraticAtDouble + ' checks';
    $('growth-status').textContent = 'We increased the input size for the same report. We did not replace one report with a different one.';
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

  $('growth-n').addEventListener('change', renderGrowth);
  $('search-case').addEventListener('change', resetSearch);
  $('search-mode').addEventListener('change', resetSearch);
  $('search-next').addEventListener('click', () => { if (revealed < trace.probes) { revealed++; renderSearch(); } });
  $('search-reset').addEventListener('click', resetSearch);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const position = number('guided-position', 1, 8), probes = number('guided-probes', 0, 8);
    const invalid = [position, probes].find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'Fill in both number fields with integers in the allowed ranges. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const expected = model.traceSearch(directory, 11, 'binary');
    if (position.value === expected.position && probes.value === expected.probes) {
      feedback('guided-feedback', 'Both numbers are correct. Use the solution to review your interval trace and comparison with linear search too; your written reasoning has not been graded automatically.', false);
    } else {
      feedback('guided-feedback', position.value !== expected.position
        ? 'The result is the target ID’s position in this given directory. Distinguish the ID, position and probe count, then try again.'
        : 'Count the first probe and the final matching probe too. Recalculate the midpoint after the interval becomes 1–3.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = [3, 8, 12, 17, 23, 30, 41];
    const binary = model.traceSearch(values, 30, 'binary');
    const linear = model.traceSearch(values, 30, 'linear');
    const checks = [
      { ...number('exit-position', 1, 7), expected: binary.position, label: 'result position' },
      { ...number('exit-binary', 0, 7), expected: binary.probes, label: 'binary probe count' },
      { ...number('exit-linear', 0, 7), expected: linear.probes, label: 'linear probe count' },
      { ...number('exit-square', 0, 100), expected: model.growth(values.length).quadratic, label: 'n² report count' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Fill in all four number fields with integers in the allowed ranges. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const seen = solutionSeen ? ' You have opened the model answer; mark this attempt as a check made after seeing the solution.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Check again: ' + wrong.map(item => item.label).join(', ') + '. Distinguish the result position from the probe count; the full table is a different report.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written
        ? 'This check has not assessed your written reasoning; compare it with the model answer and the four criteria.'
        : 'Complete your interval trace and explanations too; numbers alone do not show all the lesson outcomes.') + seen, false);
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
    if (node.tagName === 'BUTTON') node.disabled = false;
  });
  renderGrowth();
  resetSearch();
})();
