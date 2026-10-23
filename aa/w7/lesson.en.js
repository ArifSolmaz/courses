(function () {
  'use strict';
  const model = window.FreshWeek7;
  if (!model || typeof model.traceSort !== 'function') return;
  const $ = id => document.getElementById(id);
  const keys = [18, 7, 24, 4, 11, 20, 31, 26];
  const values = ['pump', 'greenhouse', 'warehouse', 'roof', 'well', 'garden', 'gate', 'room'];
  const records = keys.map((key, index) => ({ key, value: values[index], tag: String.fromCharCode(65 + index) }));
  function byKeys(list) { return list.map(key => records.find(record => record.key === key)); }
  const guidedLeft = byKeys([4, 7, 18, 24]), guidedRight = byKeys([11, 20, 26, 31]);
  const independent = byKeys([20, 4, 31, 7]);
  const cases = {
    small: { source: records.slice(0, 4), text: 'Four records: [18, 7, 24, 4]. Complete the left call, then the right call, then merge. Count the whole sort.' },
    merge: { left: byKeys([7, 18]), right: byKeys([4, 24]), text: 'Ready-made sorted left [7, 18], right [4, 24]. Count only this single merge; earlier sorting is excluded.' },
    full: { source: records, text: 'Eight records: [18, 7, 24, 4, 11, 20, 31, 26]. Sort the whole directory by ID, including every lower merge.' },
    odd: { source: records.slice(0, 5), text: 'Five records: [18, 7, 24, 4, 11]. The first split has 2 and 3 records; halves need not be equal.' },
    sorted: { source: records.slice().sort((a, b) => a.key - b.key), text: 'The input is already sorted. This basic version does not detect sorted pieces and skip merging.' },
    single: { source: [records[0]], text: 'One record: [18:pump]. The base case immediately returns the sorted result; no merge.' },
    empty: { source: [], text: 'An empty array. The base case returns the empty result; no ID comparisons or merging.' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function list(items) { return '[' + items.map(record => record.key).join(', ') + ']'; }
  function named(record) { return record.key + ':' + record.value; }
  function stepText(step) {
    if (step.type === 'split') return 'sort(' + list(step.left.concat(step.right)) + '): make smaller calls for the left ' + list(step.left) + ', then the right ' + list(step.right) + '. The caller waits for their results.';
    if (step.type === 'base') return list(step.result) + ' is a base case: 0/1 records are already sorted. Return the result' + (step.depth ? '; the caller will continue.' : '; this call is complete.');
    if (step.type === 'merge-start') return 'Sorted left ' + list(step.left) + ' and right ' + list(step.right) + ' are ready. Start this call’s merge output as empty.';
    const selection = named(step.record) + ' is taken from the ' + (step.side === 'left' ? 'left' : 'right') + ' into the output.';
    let reason = step.compared ? 'Compare the heads: ' + step.heads.left.key + (step.comparison < 0 ? ' < ' : step.comparison > 0 ? ' > ' : ' = ') + step.heads.right.key + '. ' : 'One piece is exhausted; no new ID comparison for the remaining record. ';
    if (step.compared && step.comparison === 0) reason += 'On equal IDs, take the left first. ';
    return reason + selection + (step.returned ? step.depth ? ' This merge is complete; its result returns to the caller.' : ' This merge is complete; the result for this task is ready.' : '');
  }
  function recordRow(items, options = {}) {
    const row = el('div'); row.className = 'record-row';
    if (!items.length) { const empty = el('span', 'Empty'); empty.className = 'board-empty'; row.append(empty); }
    items.forEach((record, index) => {
      const card = el('div'); card.className = 'record-chip'; card.dataset.key = String(record.key); card.dataset.tag = record.tag; card.dataset.index = String(index);
      card.append(el('b', String(record.key)));
      const value = el('span', record.value); value.className = 'record-value'; card.append(value);
      let mark = '';
      if (options.cursor !== undefined) {
        if (index < options.cursor) { card.classList.add('is-used'); mark = 'Taken'; }
        else if (index === options.cursor) { card.classList.add('is-next'); mark = 'Next head'; }
      }
      if (options.last && index === items.length - 1) { card.classList.add('is-last'); mark = 'Last placement'; }
      if (mark) { const label = el('span', mark); label.className = 'record-mark'; card.append(label); }
      card.setAttribute('aria-label', 'ID ' + record.key + ', label ' + record.value + (mark ? ', ' + mark : ''));
      row.append(card);
    });
    return row;
  }
  function piece(title, items, className, options) {
    const box = el('div'); box.className = className || 'piece'; box.append(el('h4', title), recordRow(items, options)); return box;
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initialState;
    const counts = last ? last.counts : { comparisons: 0, placements: 0, calls: 0, baseCalls: 0 };
    const done = seen === trace.steps.length;
    $('sort-task').textContent = task.text;
    $('sort-progress').textContent = 'Input n = ' + trace.initial.length + ' records · Revealed step: ' + seen + '/' + trace.steps.length;
    const stack = $('sort-stack'); stack.replaceChildren(); stack.append(el('h4', 'Open sort calls after this step'));
    if (trace.operation === 'merge' || !state.stack.length) {
      const caption = el('p', trace.operation === 'merge' ? 'This example merges only; no sort calls are counted.' : done ? 'No calls remain open; the result is ready.' : 'No call has opened yet.'); caption.className = 'call-empty'; stack.append(caption);
    } else {
      const chain = el('ol');
      state.stack.forEach(frame => { const item = el('li', 'Depth ' + frame.depth + ' · sort(' + list(frame.records) + ')'); item.dataset.node = frame.nodeId; item.dataset.depth = String(frame.depth); chain.append(item); });
      stack.append(chain);
    }
    const board = $('sort-board'); board.replaceChildren();
    const merging = state.merge && (!last || last.type === 'take' || last.type === 'merge-start');
    if (merging) {
      const merge = state.merge;
      const grid = el('div'); grid.className = 'merge-grid';
      const left = piece('Left · after this step', merge.left, 'merge-lane', { cursor: merge.leftIndex }); left.dataset.lane = 'left';
      const right = piece('Right · after this step', merge.right, 'merge-lane', { cursor: merge.rightIndex }); right.dataset.lane = 'right'; grid.append(left, right); board.append(grid);
      const output = piece('Output of this merge ' + list(merge.out), merge.out, 'merge-lane merge-output', { last: !!last && last.type === 'take' }); output.dataset.lane = 'out'; board.append(output);
    } else if (last && last.type === 'split') {
      const grid = el('div'); grid.className = 'merge-grid'; grid.append(piece('Left subinput · for the sort call', last.left), piece('Right subinput · after the left result', last.right)); board.append(grid);
    } else {
      board.append(piece(done ? 'Returned result ' + list(trace.result) : last && last.type === 'base' ? 'Returned from the base case ' + list(last.result) : 'Initial input ' + list(trace.initial), done ? trace.result : last && last.type === 'base' ? last.result : trace.initial));
    }
    $('sort-count').textContent = 'ID comparisons: ' + counts.comparisons + ' · Output placements: ' + counts.placements;
    const callCount = el('p', 'Revealed sort calls: ' + counts.calls + ' · Of these, base calls: ' + counts.baseCalls); callCount.className = 'count-line'; callCount.id = 'sort-call-count'; board.append(callCount);
    const history = $('sort-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; item.dataset.node = step.nodeId; history.append(item); });
    $('sort-next').disabled = done; $('sort-end').disabled = done;
    document.querySelector('#sort-history-details summary').textContent = 'All revealed steps (' + seen + ')';
    $('sort-status').textContent = done ? (trace.operation === 'merge' ? 'Merging' : 'Sorting') + ' is complete. Result ' + list(trace.result) + '; all ' + trace.result.length + ' records were preserved with their labels.' : last ? stepText(last) + ' State the next call or choice before continuing.' : 'No step has been revealed. Predict the first call or which of the two heads to take.';
  }
  function reset() {
    task = cases[$('sort-case').value]; trace = task.left ? model.traceMerge(task.left, task.right) : model.traceSort(task.source);
    seen = 0; render();
  }
  function growth() {
    const n = Number($('growth-n').value), current = model.growth(n), doubled = model.growth(n * 2);
    const board = $('growth-board'); board.replaceChildren();
    [current, doubled].forEach(item => { const card = el('article'); card.className = 'growth-card'; card.dataset.n = String(item.n); card.append(el('h4', 'n = ' + item.n), el('p', 'Merge layers: ' + item.levels), el('p', 'Output placements P(n): ' + item.placements)); board.append(card); });
    $('growth-status').textContent = 'For power-of-two sizes, P(' + (2 * n) + ') = 2 × ' + current.placements + ' + ' + (2 * n) + ' = ' + doubled.placements + '. Twice the data, one more merge layer. These values are not exact comparison counts.';
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('sort-case').addEventListener('change', reset);
  $('sort-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('sort-end').addEventListener('click', () => { seen = trace.steps.length; render(); });
  $('sort-reset').addEventListener('click', reset);
  $('growth-n').addEventListener('change', growth);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const comparisons = number('guided-comparisons', 0, 40), placements = number('guided-placements', 0, 40);
    const invalid = [comparisons, placements].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'Fill both boxes with integers from 0–40. I have marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const expected = model.traceMerge(guidedLeft, guidedRight).counts;
    if (comparisons.value === expected.comparisons && placements.value === expected.placements) feedback('guided-feedback', 'Both numbers are correct. Also compare your head choices and remainders taken without comparisons with the solution; your written reasoning was not graded automatically.', false);
    else feedback('guided-feedback', comparisons.value !== expected.comparisons ? 'Count only the final merge. Compare while both heads exist; after one piece is exhausted, do not compare the remainder.' : 'Each whole record is placed once in this merge’s output. Count the remainder taken without comparisons too; exclude lower merges.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault(); const expected = model.traceSort(independent);
    const checks = [
      { ...number('exit-comparisons', 0, 40), expected: expected.counts.comparisons, label: 'whole-sort comparisons' },
      { ...number('exit-placements', 0, 40), expected: expected.counts.placements, label: 'whole-sort placements' },
      { ...number('exit-levels', 0, 10), expected: model.growth(independent.length).levels, label: 'merge layers' },
      { ...number('exit-size', 0, 10), expected: expected.result.length, label: 'final record count' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Fill all four number boxes with integers in the stated ranges. I have marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' The model answer has been opened; mark this attempt as a check after seeing the solution.' : '';
    if (wrong.length) feedback('exit-feedback', 'Look again at: ' + wrong.map(item => item.label).join(', ') + '. This task includes all lower merges; count calls, records and placements separately.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written ? 'This check did not assess the correctness of your written reasoning or formulas; compare them with the model answer and four criteria.' : 'Complete the call trace and your explanations too; the numbers alone do not demonstrate every goal.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) { solutionSeen = true; $('solution-seen').textContent = 'The model answer has been opened in this session. Evaluate your first attempt separately from corrections after viewing the solution.'; $('exit-feedback').textContent = ''; }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  const worked = [...document.querySelectorAll('.worked-table')]; worked.forEach(node => { node.open = false; }); let printState = [];
  window.addEventListener('beforeprint', () => { printState = worked.map(node => node.open); worked.forEach(node => { node.open = true; }); });
  window.addEventListener('afterprint', () => { worked.forEach((node, index) => { node.open = printState[index]; }); });
  reset(); growth();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
