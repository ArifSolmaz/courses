(function () {
  'use strict';
  const model = window.AAWeekFive;
  if (!model || typeof model.traceGet !== 'function') return;
  const $ = id => document.getElementById(id);
  const entries = [
    { key: 18, value: 'pump' }, { key: 7, value: 'greenhouse' }, { key: 24, value: 'warehouse' },
    { key: 4, value: 'roof' }, { key: 11, value: 'well' }, { key: 20, value: 'garden' }, { key: 31, value: 'gate' }
  ];
  const added = { key: 26, value: 'room' };
  const cases = {
    found: { entries, kind: 'get', key: 31 },
    missing: { entries, kind: 'get', key: 16 },
    insert: { entries, kind: 'set', key: 26, value: 'room' },
    after: { entries: entries.concat([added]), kind: 'get', key: 26 },
    update: { entries, kind: 'set', key: 31, value: 'workshop' },
    sorted: { entries: entries.slice().sort((a, b) => a.key - b.key), kind: 'get', key: 31 },
    empty: { entries: [], kind: 'get', key: 31 }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function ref(key) { return key === null ? 'none' : String(key); }
  function stepText(step) {
    if (step.op === 'hash') return step.key + ' mod ' + step.m + ' = ' + step.bucketIndex + ': compute the bucket.';
    if (step.op === 'compare-key') return 'Bucket ' + step.bucketIndex + ', position ' + step.offset + ': ' + step.key + (step.equal ? ' = ' : ' ≠ ') + step.target + (step.equal ? '; same key.' : '; check the next record.');
    if (step.op === 'compare-node') return step.key + (step.relation < 0 ? ' < ' : step.relation > 0 ? ' > ' : ' = ') + step.target + (step.direction === 'found' ? '; same key.' : step.direction === 'left' ? '; go to the left branch.' : '; go to the right branch.');
    return step.key + ' → “' + step.value + '”: ' + (step.updated ? 'update the existing record.' : 'insert the new record.');
  }
  function levels(state) {
    const map = new Map(state.nodes.map(node => [node.key, node]));
    const result = [], queue = state.root === null ? [] : [{ key: state.root, depth: 0 }];
    const visited = new Set();
    for (let i = 0; i < queue.length; i++) {
      const { key, depth } = queue[i];
      if (visited.has(key)) continue;
      visited.add(key);
      const node = map.get(key);
      if (!result[depth]) result[depth] = [];
      result[depth].push(node);
      if (node.left !== null) queue.push({ key: node.left, depth: depth + 1 });
      if (node.right !== null) queue.push({ key: node.right, depth: depth + 1 });
    }
    return result;
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initial;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { nodeComparisons: 0, bucketKeyChecks: 0, hashComputations: 0, recordSets: 0 };
    const selected = $('lookup-case').value;
    $('lookup-task').textContent = (task.kind === 'get' ? 'get(' + task.key + ')' : 'set(' + task.key + ', “' + task.value + '”)')
      + '. ' + (selected === 'after' ? '26 has already been inserted; only the search is counted now.' : selected === 'sorted' ? 'The same records were inserted in ascending ID order.' : selected === 'empty' ? 'There are no records initially.' : 'Initial insertion order: 18, 7, 24, 4, 11, 20, 31.');
    const board = $('lookup-board'); board.replaceChildren();
    const written = last && last.op === 'set-record' ? last.key : null;
    if (trace.structure === 'bst') {
      $('lookup-stats').textContent = 'n = ' + state.stats.size + (state.stats.size ? ' · h = ' + state.stats.height + ' edges' : ' · empty tree');
      const rows = levels(state);
      if (!rows.length) {
        const empty = el('p', 'No root; no key to compare.'); empty.className = 'board-empty'; board.append(empty);
      }
      rows.forEach((nodes, depth) => {
        const level = el('div'); level.className = 'tree-level'; level.dataset.depth = String(depth);
        level.append(el('h4', 'Depth ' + depth));
        const row = el('div'); row.className = 'node-row';
        nodes.forEach(node => {
          const card = el('div'); card.className = 'node-card'; card.dataset.key = String(node.key);
          if (state.path.includes(node.key)) card.classList.add('is-visited');
          if (last && state.active === node.key) card.classList.add('is-current');
          if (written === node.key) card.classList.add('is-written');
          card.append(el('b', String(node.key)));
          const value = el('span', node.value); value.className = 'record-value'; card.append(value);
          const left = el('span', 'left → ' + ref(node.left)); left.className = 'child-ref';
          const right = el('span', 'right → ' + ref(node.right)); right.className = 'child-ref';
          card.append(left, right);
          card.setAttribute('aria-label', 'Key ' + node.key + ', value ' + node.value + ', left ' + ref(node.left) + ', right ' + ref(node.right));
          row.append(card);
        });
        level.append(row); board.append(level);
      });
      $('lookup-note').textContent = 'The number in a card is the key; the word below is the record value. Depth counts edges from the root; left/right labels show child keys. A coloured background marks compared nodes; an outline marks the latest step. A set operation is also highlighted.';
      $('lookup-count').textContent = 'Node comparisons: ' + counts.nodeComparisons + (task.kind === 'set' ? ' · Logical sets: ' + counts.recordSets : '');
    } else {
      $('lookup-stats').textContent = 'n = ' + state.stats.size + ' · m = ' + state.m + ' · α = ' + state.stats.alpha.toLocaleString('en-GB', { maximumFractionDigits: 2 });
      const checked = new Set(trace.steps.slice(0, seen).filter(step => step.op === 'compare-key').map(step => step.key));
      state.buckets.forEach((bucket, index) => {
        const row = el('div'); row.className = 'bucket-row'; row.dataset.bucket = String(index);
        if (state.activeBucket === index) row.classList.add('is-active');
        row.append(el('h4', 'Bucket ' + index));
        const items = el('div'); items.className = 'bucket-items';
        if (!bucket.length) { const empty = el('span', 'Empty'); empty.className = 'board-empty'; items.append(empty); }
        bucket.forEach((record, offset) => {
          const card = el('div'); card.className = 'bucket-item'; card.dataset.key = String(record.key); card.dataset.offset = String(offset + 1);
          if (checked.has(record.key)) card.classList.add('is-visited');
          if (last && state.activeBucket === index && state.activeOffset === offset + 1) card.classList.add('is-current');
          if (written === record.key) card.classList.add('is-written');
          card.append(el('b', String(record.key)), el('span', record.value));
          card.setAttribute('aria-label', 'Bucket ' + index + ', position ' + (offset + 1) + ', key ' + record.key + ', value ' + record.value);
          items.append(card);
        });
        row.append(items); board.append(row);
      });
      $('lookup-note').textContent = 'Bucket labels are 0–4. Follow insertion order from left to right within each bucket; wrapping onto another line does not change this order. An outline marks the record in the latest step; a new or updated record is also highlighted.';
      $('lookup-count').textContent = 'Hash computations: ' + counts.hashComputations + ' · Equality checks: ' + counts.bucketKeyChecks + (task.kind === 'set' ? ' · Logical sets: ' + counts.recordSets : '');
    }
    const history = $('lookup-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.op = step.op; history.append(item); });
    $('lookup-next').disabled = done;
    let status = 'No step has been revealed yet. Predict the next branch or bucket.';
    if (done) status = task.kind === 'get'
      ? trace.result === null ? 'Search complete. Result: not found. No extra key check.' : 'Search complete. Result: “' + trace.result.value + '”. Key ' + trace.result.key + '.'
      : 'Set complete. ' + (trace.result.updated ? 'The same key was updated.' : 'A new key was inserted.') + ' n = ' + trace.stats.size + '.';
    else if (last) status = stepText(last) + ' Before continuing, say what happens next.';
    $('lookup-status').textContent = status;
  }
  function reset() {
    task = cases[$('lookup-case').value];
    const structure = $('lookup-structure').value;
    trace = task.kind === 'get' ? model.traceGet(task.entries, task.key, structure, { m: 5 }) : model.traceSet(task.entries, task.key, task.value, structure, { m: 5 });
    seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('lookup-case').addEventListener('change', reset);
  $('lookup-structure').addEventListener('change', reset);
  $('lookup-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen++; render(); } });
  $('lookup-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const tree = number('guided-tree', 0, 10), hash = number('guided-hash', 0, 10);
    const invalid = [tree, hash].find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'Enter an integer from 0 to 10 in both fields. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const source = entries.concat([added]);
    if (tree.value === model.traceGet(source, 26, 'bst').counts.nodeComparisons && hash.value === model.traceGet(source, 26, 'hash').counts.bucketKeyChecks) {
      feedback('guided-feedback', 'Both numbers are correct. Also compare your post-insertion search trace, returned information and load with the solution. Your written reasoning was not graded automatically.', false);
    } else {
      feedback('guided-feedback', tree.value !== model.traceGet(source, 26, 'bst').counts.nodeComparisons
        ? 'Count only the search after insertion is complete. Follow the path to the new node; the matching node is compared too.'
        : 'Do not add the hash computation to the equality counter. Check 11, 31 and the new key in bucket order.', true);
    }
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const source = [{ key: 12, value: 'greenhouse' }, { key: 3, value: 'roof' }, { key: 22, value: 'warehouse' }, { key: 8, value: 'well' }, { key: 17, value: 'pump' }];
    const tree = model.traceGet(source, 17, 'bst'), hash = model.traceGet(source, 17, 'hash', { m: 5 });
    const checks = [
      { ...number('exit-tree', 0, 10), expected: tree.counts.nodeComparisons, label: 'tree comparisons' },
      { ...number('exit-bucket', 0, 4), expected: 17 % 5, label: 'bucket label' },
      { ...number('exit-checks', 0, 10), expected: hash.counts.bucketKeyChecks, label: 'equality checks in the bucket' },
      { ...number('exit-size', 0, 10), expected: model.traceSet(source, 17, 'gate', 'bst').stats.size, label: 'record count after updating' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Enter an integer within the stated range in all four number fields. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' The model answer has been opened; mark this attempt as a check after seeing the solution.' : '';
    if (wrong.length) feedback('exit-feedback', 'Look again: ' + wrong.map(item => item.label).join(', ') + '. Distinguish the key, bucket label and current record; state the unit of each counter.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written
        ? 'This check did not assess the correctness of your written reasoning or formulas; compare them with the model answer and the four criteria.'
        : 'Complete the trace and your reasoning too; the numbers alone do not demonstrate every objective.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true; $('solution-seen').textContent = 'The model answer has been opened in this session. Assess your first attempt separately from corrections made after seeing the solution.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  const worked = document.querySelector('.worked-table'); worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
