(function () {
  'use strict';
  const model = window.AAWeekFour;
  if (!model || typeof model.traceInsert !== 'function') return;
  const $ = id => document.getElementById(id);
  const directory = [4, 7, 11, 18, 24, 31];
  const cases = {
    access: { values: directory, kind: 'access', position: 4 },
    insert: { values: directory, kind: 'insert', position: 4, value: 15 },
    head: { values: directory, kind: 'insert', position: 1, value: 2 },
    tail: { values: directory, kind: 'insert', position: 7, value: 42 },
    empty: { values: [], kind: 'insert', position: 1, value: 15 }
  };
  const events = [
    { type: 'put', token: 'A', id: 24 }, { type: 'put', token: 'B', id: 4 },
    { type: 'put', token: 'C', id: 18 }, { type: 'take' },
    { type: 'put', token: 'D', id: 11 }, { type: 'take' }
  ];
  let storage, storageCase, storageSeen = 0, policy, policySeen = 0, solutionSeen = false;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function name(id) { return id === null ? 'end' : id === 'new' ? 'new' : id; }
  function stepText(step) {
    if (step.op === 'index-read') return 'Position ' + step.position + ': read ' + step.value + ' by index.';
    if (step.op === 'node-read') return name(step.node) + ' — read its value: ' + step.value + '.';
    if (step.op === 'follow-link') return name(step.fromNode) + ' → ' + name(step.toNode) + ': follow the next link once.';
    if (step.op === 'shift') return 'Position ' + step.from + ' → ' + step.to + ': shift ' + step.value + '.';
    if (step.op === 'value-write') return 'Position ' + step.position + ': write the new value ' + step.value + '.';
    const field = step.field === 'head' ? 'head' : name(step.node) + '.next';
    return field + ' ← ' + name(step.next) + ': one pointer assignment.';
  }
  function countsText(counts) {
    if (storageCase.kind === 'access') return storage.structure === 'array'
      ? 'Indexed reads: ' + counts.indexReads
      : 'Link follows: ' + counts.linkFollows + ' · Node-value reads: ' + counts.nodeValueReads;
    return storage.structure === 'array'
      ? 'Value shifts: ' + counts.valueShifts + ' · New-value writes: ' + counts.valueWrites
      : 'Link follows: ' + counts.linkFollows + ' · Pointer assignments: ' + counts.pointerWrites;
  }
  function orderedNodes(state) {
    const map = new Map(state.nodes.map(node => [node.id, node]));
    const connected = new Set(), order = [];
    let current = state.head;
    while (current && map.has(current) && !connected.has(current)) {
      const node = map.get(current);
      connected.add(current); order.push(node);
      current = node.nextSet ? node.next : null;
    }
    return { connected, nodes: order.concat(state.nodes.filter(node => !connected.has(node.id))) };
  }
  function renderStorage() {
    const last = storageSeen ? storage.steps[storageSeen - 1] : null;
    const state = last ? last.state : storage.initial;
    const done = storageSeen === storage.steps.length;
    const zero = Object.fromEntries(Object.keys(storage.counts).map(key => [key, 0]));
    $('storage-task').textContent = storageCase.kind === 'access'
      ? 'n = ' + storage.values.length + '. Read the value at k = ' + storage.position + '.'
      : 'Initial n = ' + storage.values.length + '. Insert ' + storage.value + ' at the given position p = ' + storage.position + '. ' + (storage.structure === 'array' ? 'One spare cell is ready.' : 'The new node and its value are ready; only the head address is known.');
    const board = $('storage-board'); board.replaceChildren();
    $('storage-head').textContent = storage.structure === 'linked' ? 'head → ' + name(state.head) : 'Array · positions are 1-based';
    if (storage.structure === 'array') {
      state.slots.forEach((value, index) => {
        const card = el('div'); card.className = 'storage-card'; card.dataset.position = String(index + 1);
        if (last && (last.to || last.position) === index + 1) card.classList.add('is-current');
        card.append(el('small', 'position ' + (index + 1)), el('b', value === null ? 'empty' : String(value)));
        card.setAttribute('aria-label', 'Position ' + (index + 1) + ': ' + (value === null ? 'empty cell' : value));
        board.append(card);
      });
      $('storage-note').textContent = storageCase.kind === 'access'
        ? 'An indexed read goes directly to the requested position.'
        : 'One spare cell is ready. Shifting does not clear the source cell; later writes overwrite temporary duplicates.';
    } else {
      const ordered = orderedNodes(state);
      ordered.nodes.forEach(node => {
        const card = el('div'); card.className = 'storage-card'; card.dataset.node = node.id;
        if (node.id === 'new') card.classList.add('is-new');
        if (!ordered.connected.has(node.id)) card.classList.add('is-detached');
        const current = last && (last.op === 'follow-link' ? last.toNode : last.op === 'pointer-write' ? last.node || 'new' : last.node);
        if (current === node.id) card.classList.add('is-current');
        card.append(el('small', name(node.id)), el('b', String(node.value)));
        const next = el('span', '→ ' + (node.nextSet ? name(node.next) : '?'));
        next.className = 'next-ref'; card.append(next);
        card.setAttribute('aria-label', name(node.id) + ', value ' + node.value + ', next ' + (node.nextSet ? name(node.next) : 'not assigned yet') + (ordered.connected.has(node.id) ? '' : ', not reachable from the head yet'));
        board.append(card);
      });
      $('storage-note').textContent = 'N names are fixed node labels. Follow the arrow labels. A dashed card is not reachable from the head yet; ? means its next link is not assigned.';
    }
    const history = $('storage-history'); history.replaceChildren();
    storage.steps.slice(0, storageSeen).forEach(step => {
      const item = el('li', stepText(step)); item.dataset.op = step.op; history.append(item);
    });
    $('storage-count').textContent = countsText(last ? last.counts : zero);
    $('storage-next').disabled = done;
    let status = 'No operations have been revealed yet. Predict the next operation, then reveal one step.';
    if (last) status = stepText(last) + (done
      ? storageCase.kind === 'access' ? ' Access complete; result: ' + storage.value + '.'
        : ' Insertion complete. Result: [' + storage.result.join(', ') + ']. Active record count: ' + storage.result.length + '.'
      : ' Describe the next state before continuing.');
    $('storage-status').textContent = status;
  }
  function resetStorage() {
    storageCase = cases[$('storage-case').value];
    const structure = $('storage-structure').value;
    storage = storageCase.kind === 'access'
      ? model.traceAccess(storageCase.values, storageCase.position, structure)
      : model.traceInsert(storageCase.values, storageCase.position, storageCase.value, structure, { capacity: storageCase.values.length + 1 });
    storageSeen = 0; renderStorage();
  }
  function policyText(step) {
    if (step.type === 'put') return step.item.token + ': message from device ' + step.item.id + ' arrived.';
    if (step.empty) return 'A removal was requested; no messages are waiting.';
    return step.item.token + ': message from device ' + step.item.id + ' was removed.';
  }
  function renderPolicy() {
    const last = policySeen ? policy.steps[policySeen - 1] : null;
    const waiting = last ? last.state : [], removed = last ? last.removed : [];
    const board = $('policy-board'); board.replaceChildren();
    if (!waiting.length) {
      const empty = el('p', 'No messages are waiting.'); empty.className = 'board-empty'; board.append(empty);
    }
    waiting.forEach(message => {
      const card = el('div'); card.className = 'message-card'; card.dataset.token = message.token;
      card.append(el('small', message.token), el('b', String(message.id))); board.append(card);
    });
    $('policy-step').textContent = 'Events revealed: ' + policySeen + ' / ' + policy.steps.length;
    $('policy-out').textContent = 'Removed: ' + (removed.length ? removed.map(item => item.id + ' (' + item.token + ')').join(' → ') : 'none yet') + '.';
    const history = $('policy-history'); history.replaceChildren();
    policy.steps.slice(0, policySeen).forEach(step => {
      const item = el('li', policyText(step)); item.dataset.type = step.type; history.append(item);
    });
    const done = policySeen === policy.steps.length;
    $('policy-next').disabled = done;
    $('policy-status').textContent = last
      ? policyText(last) + (done ? ' All events are complete. ' : ' ') + (policy.policy === 'fifo' ? 'The oldest waiting message leaves first.' : 'The newest waiting message leaves first.')
      : 'The initial state is empty. Predict the state before revealing the first arrival.';
  }
  function resetPolicy() {
    policy = model.tracePolicy(events, $('policy-mode').value);
    policySeen = 0; renderPolicy();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('storage-case').addEventListener('change', resetStorage);
  $('storage-structure').addEventListener('change', resetStorage);
  $('storage-next').addEventListener('click', () => { if (storageSeen < storage.steps.length) { storageSeen++; renderStorage(); } });
  $('storage-reset').addEventListener('click', resetStorage);
  $('policy-mode').addEventListener('change', resetPolicy);
  $('policy-next').addEventListener('click', () => { if (policySeen < policy.steps.length) { policySeen++; renderPolicy(); } });
  $('policy-reset').addEventListener('click', resetPolicy);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const checks = [number('guided-shifts', 0, 6), number('guided-follows', 0, 6)];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'Fill in both fields with integers from 0–6. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const shifts = model.traceInsert(directory, 2, 6, 'array', { capacity: 7 }).counts.valueShifts;
    const follows = model.traceInsert(directory, 2, 6, 'linked').counts.linkFollows;
    if (checks[0].value === shifts && checks[1].value === follows) {
      feedback('guided-feedback', 'Both numbers are correct. Compare your shift direction and two pointer assignments with the solution too; your written reasoning has not been graded automatically.', false);
    } else {
      feedback('guided-feedback', checks[0].value !== shifts
        ? 'How many values from the new position through the old last position must shift to make room? Write the trace from right to left.'
        : 'Which node is just before the insertion position? Its head address is already known. Distinguish link follows from the two pointer assignments.', true);
    }
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = [3, 8, 12, 17, 23];
    const access = model.traceAccess(values, 4, 'linked');
    const array = model.traceInsert(values, 3, 10, 'array', { capacity: 6 });
    const linked = model.traceInsert(values, 3, 10, 'linked');
    const checks = [
      { ...number('exit-access', 0, 10), expected: access.counts.linkFollows, label: 'link follows for access' },
      { ...number('exit-shifts', 0, 10), expected: array.counts.valueShifts, label: 'array value shifts' },
      { ...number('exit-locate', 0, 10), expected: linked.counts.linkFollows, label: 'finding the list predecessor' },
      { ...number('exit-pointers', 0, 10), expected: linked.counts.pointerWrites, label: 'pointer assignments' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Fill in all four number fields with integers from 0–10. The missing or invalid field is marked.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const seen = solutionSeen ? ' You have opened the model answer; mark this attempt as a check made after seeing the solution.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Check again: ' + wrong.map(item => item.label).join(', ') + '. Distinguish the access position from the insertion predecessor; name each counter’s unit.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written
        ? 'This check has not assessed your written reasoning or FIFO/LIFO answer; compare them with the model answer and the four criteria.'
        : 'Complete your trace and explanations too; numbers alone do not show all the lesson outcomes.') + seen, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'You have opened the model answer in this session. Assess your first attempt separately from corrections made after seeing the solution.';
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
  worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  resetStorage(); resetPolicy();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
