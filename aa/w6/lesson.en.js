(function () {
  'use strict';
  const model = window.FreshWeek6;
  if (!model || typeof model.traceInsert !== 'function') return;
  const $ = id => document.getElementById(id);
  const jobs = [
    { id: 'A', device: 18, priority: 4, seq: 1 }, { id: 'B', device: 7, priority: 7, seq: 2 },
    { id: 'C', device: 24, priority: 6, seq: 3 }, { id: 'D', device: 4, priority: 12, seq: 4 },
    { id: 'E', device: 11, priority: 9, seq: 5 }, { id: 'F', device: 20, priority: 8, seq: 6 },
    { id: 'G', device: 31, priority: 10, seq: 7 }
  ];
  const h = { id: 'H', device: 26, priority: 3, seq: 8 };
  const independent = [
    { id: 'K', device: 18, priority: 2, seq: 1 }, { id: 'L', device: 7, priority: 5, seq: 2 },
    { id: 'M', device: 24, priority: 3, seq: 3 }, { id: 'N', device: 31, priority: 7, seq: 4 }
  ];
  const p = { id: 'P', device: 11, priority: 1, seq: 5 };
  const cases = {
    insert: { operation: 'insert', source: jobs, job: h, text: 'H: device 26, priority 3, arrival 8. Insert H into the seven ready jobs.' },
    extract: { operation: 'extract', source: jobs, text: 'Extract the minimum from the first seven jobs. H is not present yet; A is at the root.' },
    after: { operation: 'extract', source: model.traceInsert(jobs, h).heap, text: 'H has already been inserted. Extract the minimum from the eight ready jobs; count only this extraction.' },
    tie: { operation: 'extract', source: [jobs[0], { id: 'B', device: 7, priority: 4, seq: 2 }, { id: 'C', device: 24, priority: 6, seq: 3 }], text: 'Ready heap [A,B,C]: A=(4,1), B=(4,2), C=(6,3). For equal priorities, choose the earlier arrival; extract the minimum.' },
    stop: { operation: 'insert', source: jobs, job: { id: 'I', device: 26, priority: 15, seq: 8 }, text: 'I: device 26, priority 15, arrival 8. Insert it into the first seven jobs; does it need to move up?' },
    single: { operation: 'extract', source: [jobs[0]], text: 'Only A is waiting: device 18, priority 4, arrival 1. Extract the minimum.' },
    empty: { operation: 'extract', source: [], text: 'No job is waiting. What does extractMin() return?' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function name(job) { return job.id + '=(' + job.priority + ',' + job.seq + ')'; }
  function stepText(step) {
    if (step.type === 'append') return name(step.job) + ': append at the last free position ' + (step.index + 1) + '.';
    if (step.type === 'empty') return 'The queue is empty: result “no job”. No job comparison or swap was needed.';
    if (step.type === 'remove') return name(step.job) + ': set aside as the result and remove the only cell. The queue is now empty.';
    if (step.type === 'replace-root') return name(step.removed) + ': set aside as the result. From the last position ' + (step.from + 1) + ', move ' + name(step.job) + ' to the root and remove the last cell. This is not a swap.';
    if (step.type === 'swap') return 'Position ' + (step.i + 1) + ' and ' + (step.j + 1) + ': swap their jobs. Now position ' + (step.i + 1) + ' holds ' + step.heap[step.i].id + ', ' + (step.j + 1) + ' holds ' + step.heap[step.j].id + '.';
    const left = step.heap[step.left], right = step.heap[step.right];
    const prefix = 'Position ' + (step.left + 1) + ' holds ' + name(left) + ' and ' + (step.right + 1) + ' holds ' + name(right) + '; compare these jobs. ';
    if (step.purpose === 'choose-child') return prefix + (step.result <= 0 ? left.id : right.id) + ' is the child that comes first; compare it with the parent next.';
    return prefix + (step.result < 0 ? left.id + ' comes first; a swap is needed.' : 'The parent comes first; sifting along this path stops.');
  }
  function activePositions(step) {
    if (!step) return [];
    if (step.type === 'compare') return [step.left, step.right];
    if (step.type === 'swap') return [step.i, step.j];
    if (step.type === 'append') return [step.index];
    if (step.type === 'replace-root') return [step.to];
    return [];
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const heap = last ? last.heap : trace.initial;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { comparisons: 0, swaps: 0 };
    const valid = last ? last.heapValid : true;
    $('heap-task').textContent = task.text;
    $('heap-stats').textContent = 'n = ' + heap.length + (heap.length ? ' · h = ' + Math.floor(Math.log2(heap.length)) + ' edges' : ' · empty heap') + ' · Steps revealed: ' + seen + '/' + trace.steps.length;
    $('heap-order').textContent = 'Array order (positions start at 1): [' + heap.map(job => job.id).join(', ') + ']';
    const board = $('heap-board'); board.replaceChildren();
    const active = activePositions(last);
    if (!heap.length) { const empty = el('p', 'No job is waiting; there is no root.'); empty.className = 'board-empty'; board.append(empty); }
    for (let first = 0, depth = 0; first < heap.length; depth += 1, first = 2 * first + 1) {
      const level = el('div'); level.className = 'heap-level'; level.dataset.depth = String(depth);
      level.append(el('h4', 'Depth ' + depth));
      const row = el('div'); row.className = 'node-row';
      for (let i = first; i < Math.min(2 * first + 1, heap.length); i += 1) {
        const job = heap[i], position = i + 1;
        const children = [2 * position, 2 * position + 1].filter(child => child <= heap.length);
        const parent = position === 1 ? 'root' : 'parent ' + Math.floor(position / 2);
        const card = el('div'); card.className = 'heap-node'; card.dataset.position = String(position); card.dataset.job = job.id;
        card.append(el('b', job.id + ' · p' + job.priority));
        const info = el('span', 'Device ' + job.device + ' · arrival ' + job.seq); info.className = 'job-info'; card.append(info);
        const ref = el('span', 'Position ' + position + ' · ' + parent + ' · children ' + (children.length ? children.join(', ') : 'none')); ref.className = 'position-info'; card.append(ref);
        if (active.includes(i)) { card.classList.add('is-current'); const label = el('span', 'This step'); label.className = 'active-label'; card.append(label); }
        card.setAttribute('aria-label', 'Position ' + position + ', job ' + job.id + ', priority ' + job.priority + ', device ' + job.device + ', arrival ' + job.seq + ', ' + parent + ', children ' + (children.length ? children.join(', ') : 'none'));
        row.append(card);
      }
      level.append(row); board.append(level);
    }
    $('heap-invariant').dataset.valid = String(valid);
    $('heap-invariant').textContent = valid ? (heap.length ? 'Parent–child order currently holds.' : 'In an empty queue, no job can violate the order.') : 'Intermediate state: parent–child order does not yet hold; sifting continues.';
    const history = $('heap-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; history.append(item); });
    $('heap-count').textContent = 'Job comparisons: ' + counts.comparisons + ' · Swaps: ' + counts.swaps;
    $('heap-next').disabled = done;
    let status = 'No step has been revealed yet. Predict the next position and decision.';
    if (done) {
      if (trace.operation === 'insert') status = 'Insertion complete. ' + name(trace.inserted) + ' is in the queue; n = ' + heap.length + '. Min-heap order is restored.';
      else status = trace.result === null ? 'Extraction complete. Result: no job. The queue is empty.' : 'Extraction complete. Extracted job ' + trace.result.id + ': device ' + trace.result.device + ', priority ' + trace.result.priority + ', arrival ' + trace.result.seq + '. Remaining n = ' + heap.length + '.';
    } else if (last) status = stepText(last) + ' State the next step before continuing.';
    $('heap-status').textContent = status;
  }
  function reset() {
    task = cases[$('heap-case').value];
    trace = task.operation === 'insert' ? model.traceInsert(task.source, task.job) : model.traceExtract(task.source);
    seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('heap-case').addEventListener('change', reset);
  $('heap-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('heap-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const comparisons = number('guided-comparisons', 0, 20), swaps = number('guided-swaps', 0, 10);
    const invalid = [comparisons, swaps].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'Fill both boxes with integers in the stated ranges. I marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const expected = model.traceExtract(model.traceInsert(jobs, h).heap).counts;
    if (comparisons.value === expected.comparisons && swaps.value === expected.swaps) feedback('guided-feedback', 'Both numbers are correct. Also compare your extraction trace, extracted job record and final heap with the solution; your written explanation was not automatically scored.', false);
    else feedback('guided-feedback', comparisons.value !== expected.comparisons ? 'Count only the extraction. At each level with two children, compare the children first, then compare the selected child with the parent.' : 'Count only exchanges of positions between two existing jobs. Moving the last job to the root is not a swap in this counter.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const inserted = model.traceInsert(independent, p), extracted = model.traceExtract(inserted.heap);
    const checks = [
      { ...number('exit-insert', 0, 20), expected: inserted.counts.comparisons, label: 'insertion comparisons' },
      { ...number('exit-extract', 0, 20), expected: extracted.counts.comparisons, label: 'extraction comparisons' },
      { ...number('exit-swaps', 0, 10), expected: extracted.counts.swaps, label: 'extraction-only swaps' },
      { ...number('exit-size', 0, 10), expected: extracted.heap.length, label: 'final record count' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Fill all four number boxes with integers in the stated ranges. I marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' The model answer has been opened; mark this attempt as a check after viewing the solution.' : '';
    if (wrong.length) feedback('exit-feedback', 'Look again: ' + wrong.map(item => item.label).join(', ') + '. Keep insertion and extraction counters separate; include child selection.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written ? 'This check did not assess the correctness of your written explanations or formulas; compare those with the model answer and four criteria.' : 'Complete your trace and explanations too; numbers alone do not demonstrate every goal.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) { solutionSeen = true; $('solution-seen').textContent = 'The model answer was opened in this session. Evaluate your first attempt separately from corrections made after viewing it.'; $('exit-feedback').textContent = ''; }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  // A disabled hidden submit prevents implicit Enter navigation without JS.
  const worked = document.querySelector('.worked-table'); worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
