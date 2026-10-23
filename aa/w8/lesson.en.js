(function () {
  'use strict';
  const model = window.FreshWeek8;
  if (!model || typeof model.traceBFS !== 'function') return;
  const $ = id => document.getElementById(id);
  const vertices = [4, 7, 11, 18, 20, 24, 26, 31];
  const edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 31], [20, 31]];
  const names = { 4: 'roof', 7: 'greenhouse', 11: 'well', 18: 'pump', 20: 'garden', 24: 'warehouse', 26: 'room', 31: 'gate' };
  const independentVertices = [4, 7, 18, 20, 24, 26];
  const independentEdges = [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]];
  const cases = {
    main: { vertices, edges, source: 18, target: 31, text: 'Main network, source 18. Neighbours are ready in increasing ID order. 26 is isolated; find the fewest connections to target 31.' },
    reverse: { vertices, edges, source: 18, target: 31, order: 'descending', text: 'The same network and source 18, with neighbours in decreasing order. Which can change: distances or the selected parents?' },
    source31: { vertices, edges, source: 31, target: 18, text: 'The source in the same network is now 31. Recalculate distances from 31; the original start 18 is no longer the vertex at distance 0.' },
    isolated: { vertices, edges, source: 26, target: 31, text: 'Source 26 in the same network; its adjacency list is empty. The other edges exist in the graph but cannot be reached from this source.' },
    linked: { vertices, edges: edges.concat([[31, 26]]), source: 18, target: 26, text: 'We added one undirected edge 31–26 to the main network. Source 18; is 26 now reachable? Process the whole component.' },
    single: { vertices: [18], edges: [], source: 18, target: 18, text: 'One vertex 18, no edges. What are the source’s distance and path to itself?' },
    noedges: { vertices, edges: [], source: 18, target: 31, text: 'All eight devices exist in the graph, with no edges. Source 18. Is a vertex’s existence the same as reachability?' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
  function list(items) { return '[' + items.join(', ') + ']'; }
  function rowAt(state, id) { return state.rows.find(row => row.id === id); }
  function stepText(step) {
    if (step.type === 'init-root') return trace.vertices.length + ' vertices: initialise distances and parents. Set d[' + step.vertex + ']=0, mark it as discovered and add it to the queue.';
    if (step.type === 'dequeue') return 'Take ' + step.vertex + ' from the front of FIFO. Examine its neighbours now; keep it separate from those waiting in the queue.';
    if (step.type === 'finish') return step.vertex + ' has finished all its neighbours. ' + (step.state.done ? 'No work remains in the queue or the current vertex; the search is complete.' : 'Continue with the vertex at the front of the queue.');
    const prefix = step.from + ' adjacency list, entry ' + (step.neighborIndex + 1) + ': ' + step.to + '. ';
    if (!step.discovered) return prefix + 'Already discovered; do not add it again. Distance and parent remain unchanged.';
    const distance = rowAt(step.state, step.to).distance;
    return prefix + 'First discovery: d[' + step.to + ']=d[' + step.from + ']+1=' + distance + ', parent ' + step.from + '. Mark it and add it at the rear of the queue.';
  }
  function statusText(row, done) {
    if (row.status === 'unseen') return done ? 'Unreachable from this source' : 'Not yet discovered';
    if (row.status === 'queued') return 'Discovered · queued';
    if (row.status === 'active') return 'Currently examining';
    return 'Neighbours finished';
  }
  function renderPath() {
    const target = Number($('bfs-target').value);
    if (seen !== trace.steps.length) { $('bfs-path').textContent = 'Finish the search to compare the path table. We do not yet call an undiscovered target “unreachable”.'; return; }
    const path = model.shortestPath(trace, target);
    $('bfs-path').textContent = path === null ? 'Vertex ' + target + ' exists; it is unreachable from source ' + trace.source + '. Its distance is not 0; no path.' : 'One path with the fewest steps: ' + path.join(' → ') + '. ' + (path.length - 1) + ' edges, ' + path.length + ' vertices; d[' + target + ']=' + trace.result.distances[target] + '.';
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initialState;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { initializations: 0, edgeScans: 0, enqueues: 0, dequeues: 0 };
    $('bfs-task').textContent = task.text;
    $('bfs-progress').textContent = 'V = ' + trace.vertices.length + ' · E = ' + trace.edges.length + ' · Source ' + trace.source + ' · Revealed step: ' + seen + '/' + trace.steps.length;
    const frontier = $('bfs-queue'); frontier.replaceChildren(); frontier.append(el('h4', 'FIFO queue · front → rear'));
    const queue = el('div'); queue.className = 'queue-row';
    if (!state.queue.length) { const empty = el('span', done ? 'Empty; the search is complete.' : 'Empty now; the current vertex may still have work.'); empty.className = 'board-empty'; queue.append(empty); }
    state.queue.forEach((id, index) => {
      const chip = el('div'); chip.className = 'queue-chip'; chip.dataset.id = String(id); chip.dataset.index = String(index);
      chip.append(el('b', String(id)));
      const marks = [];
      if (index === 0) { chip.classList.add('is-front'); marks.push('Front'); }
      if (last && last.type === 'inspect' && last.discovered && last.to === id) { chip.classList.add('is-new'); marks.push('New'); }
      if (marks.length) chip.append(el('span', marks.join(' · ')));
      queue.append(chip);
    });
    frontier.append(queue);
    $('bfs-current').textContent = state.current === null ? 'Currently examining: none.' : 'Currently examining: ' + state.current + ' · ' + names[state.current] + ' · d=' + rowAt(state, state.current).distance + '.';
    const neighbors = $('bfs-neighbors'); neighbors.replaceChildren();
    if (state.current === null) { neighbors.append(el('p', done ? 'No examination remains in the source’s component.' : 'Taking a vertex from the front will reveal its adjacency list here.')); }
    else {
      const items = trace.adjacency[state.current];
      neighbors.append(el('h4', state.current + ' neighbours ' + list(items) + ' · Scanned: ' + state.neighborIndex + '/' + items.length));
      const line = el('div'); line.className = 'neighbor-row';
      if (!items.length) { const empty = el('span', 'Empty list; no entries to scan.'); empty.className = 'board-empty'; line.append(empty); }
      items.forEach((id, index) => {
        const chip = el('div'); chip.className = 'neighbor-chip'; chip.dataset.id = String(id); chip.dataset.index = String(index); chip.append(el('b', String(id)));
        let mark = '';
        if (index < state.neighborIndex) { chip.classList.add('is-scanned'); mark = 'Scanned'; }
        else if (index === state.neighborIndex) { chip.classList.add('is-next'); mark = 'Next'; }
        if (last && last.type === 'inspect' && index === last.neighborIndex) { chip.classList.add('is-last'); mark = 'This step'; }
        if (mark) chip.append(el('span', mark)); line.append(chip);
      });
      neighbors.append(line);
    }
    const table = $('bfs-table'); table.replaceChildren();
    state.rows.forEach(row => {
      const card = el('article'); card.className = 'distance-card'; card.dataset.id = String(row.id); card.dataset.status = row.status; card.dataset.distance = row.distance === null ? '' : String(row.distance); card.dataset.parent = row.parent === null ? '' : String(row.parent);
      if (state.current === row.id) card.classList.add('is-current');
      if (last && last.type === 'inspect' && last.to === row.id) card.classList.add('is-last');
      card.append(el('h4', String(row.id)));
      const place = el('span', names[row.id]); place.className = 'place'; card.append(place);
      const distance = el('p', 'd = ' + (row.distance === null ? done ? 'unreachable' : 'not yet known' : row.distance)); distance.className = 'node-distance'; card.append(distance);
      const parent = el('p', 'Parent: ' + (row.parent === null ? row.distance === 0 ? 'none (source)' : '—' : row.parent)); parent.className = 'node-parent'; card.append(parent);
      const status = el('p', statusText(row, done)); status.className = 'node-status'; card.append(status); table.append(card);
    });
    $('bfs-count').textContent = 'Initialised rows: ' + counts.initializations + ' · Adjacency entries scanned: ' + counts.edgeScans + ' · Queue additions: ' + counts.enqueues + ' · Front removals: ' + counts.dequeues;
    $('bfs-order').textContent = 'Removal order: ' + list(state.order) + ' · Largest queue: ' + (last ? last.stats.maxQueue : 0);
    $('bfs-status').textContent = done ? 'BFS is complete. ' + trace.result.reachable.length + ' vertices reached; ' + trace.result.unreachable.length + ' vertices unreachable from this source.' : last ? stepText(last) + ' State the next queue before continuing.' : 'No step has been revealed. At what distance will the source enter the queue?';
    $('bfs-next').disabled = done; $('bfs-end').disabled = done;
    const history = $('bfs-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; history.append(item); });
    document.querySelector('#bfs-history-details summary').textContent = 'All revealed steps (' + seen + ')';
    renderPath();
  }
  function reset() {
    task = cases[$('bfs-case').value]; trace = model.traceBFS(task.vertices, task.edges, task.source, { neighborOrder: task.order || 'ascending' });
    const targets = $('bfs-target'); targets.replaceChildren();
    trace.vertices.forEach(id => { const option = el('option', id + ' · ' + names[id]); option.value = String(id); targets.append(option); });
    targets.value = String(task.target); seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('bfs-case').addEventListener('change', reset);
  $('bfs-target').addEventListener('change', renderPath);
  $('bfs-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('bfs-end').addEventListener('click', () => { seen = trace.steps.length; render(); });
  $('bfs-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault(); const distance = number('guided-distance', 0, 10), queue = number('guided-queue', 0, 10);
    const invalid = [distance, queue].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'Fill both boxes with integers from 0–10. I have marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const after = model.traceBFS(vertices, edges, 18).steps.find(step => step.type === 'finish' && step.vertex === 24).state;
    if (distance.value === rowAt(after, 20).distance && queue.value === after.queue.length) feedback('guided-feedback', 'Both numbers are correct. Also compare your queue order, parent and reason for avoiding duplicate additions with the solution; your written reasoning was not graded automatically.', false);
    else feedback('guided-feedback', distance.value !== rowAt(after, 20).distance ? '20 is first discovered from 24. Add one connection to d[24]; we are not adding device IDs.' : 'Remove 24 first. 4 and 11 wait; do not add 11 a second time. Add only the new 20 at the rear.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault(); const expected = model.traceBFS(independentVertices, independentEdges, 18);
    const checks = [
      { ...number('exit-distance26', 0, 10), expected: expected.result.distances[26], label: 'distance to 26' },
      { ...number('exit-distance4', 0, 10), expected: expected.result.distances[4], label: 'distance to 4' },
      { ...number('exit-scans', 0, 40), expected: expected.counts.edgeScans, label: 'adjacency entries scanned' },
      { ...number('exit-enqueues', 0, 10), expected: expected.counts.enqueues, label: 'queue additions including the source' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Fill all four number boxes with integers in the stated ranges. I have marked the missing or invalid box.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' The model answer has been opened; mark this attempt as a check after seeing the solution.' : '';
    if (wrong.length) feedback('exit-feedback', 'Look again at: ' + wrong.map(item => item.label).join(', ') + '. Distance counts edges; each adjacency entry is one scan, and each vertex is added at most once.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'All four numbers match the expected values. ' + (written ? 'This check did not assess the correctness of your written reasoning or formulas; compare them with the model answer and four criteria.' : 'Complete the network, queue trace and explanations too; the numbers alone do not demonstrate every goal.') + exposed, false);
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
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
