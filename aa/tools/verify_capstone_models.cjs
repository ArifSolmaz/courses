/* Independent, bounded tests for the integrated sensor-network capstone.
 * Run: node aa/tools/verify_capstone_models.cjs
 * Oracles enumerate edge subsets, simple paths, and exact-length vertex
 * sequences. They do not implement Prim/Kruskal, Dijkstra, BFS, or DP.
 * No browser, network, installed package, or production mutation is needed.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modelFile = path.resolve(__dirname, '../bridge/capstone/model.js');
const model = require(modelFile);
let assertions = 0, graphs = 0, pathCases = 0, walkCases = 0, traceCases = 0;
function equal(actual, expected, message) {
  assert.deepStrictEqual(actual, expected, message); assertions++;
}
function ok(value, message) { assert.ok(value, message); assertions++; }
function throws(operation, error, message) {
  assert.throws(operation, error, message); assertions++;
}
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (!value || typeof value !== 'object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  Object.setPrototypeOf(result, Object.getPrototypeOf(value));
  return result;
}
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
function graphOf(vertices, edges) {
  const entries = vertices.map(v => [v, []]);
  const graph = Object.fromEntries(entries);
  for (const [a, b, w] of edges) { graph[a].push([b, w]); graph[b].push([a, w]); }
  return graph;
}
function physicalEdges(graph) {
  const vertices = Object.keys(graph), position = new Map(vertices.map((v, i) => [v, i]));
  return vertices.flatMap(a => graph[a].filter(([b]) => position.get(a) < position.get(b))
    .map(([b, w]) => [a, b, w]));
}
function weight(graph, a, b) {
  const edge = graph[a].find(([neighbor]) => neighbor === b);
  return edge ? edge[1] : Infinity;
}
function* sequences(values, count, prefix = []) {
  if (count === 0) { yield prefix; return; }
  for (const value of values) yield* sequences(values, count - 1, [...prefix, value]);
}
function routeCost(graph, route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += weight(graph, route[i - 1], route[i]);
  return total;
}
function shortestOracle(graph, start, end) {
  const vertices = Object.keys(graph);
  let best = start === end ? 0 : Infinity;
  // Nonnegative weights admit a simple optimal path, including zero edges.
  for (let middle = 0; middle <= vertices.length - 2; middle++) {
    for (const inner of sequences(vertices, middle)) {
      const route = [start, ...inner, end];
      if (new Set(route).size === route.length) best = Math.min(best, routeCost(graph, route));
    }
  }
  return best;
}
function exactOracle(graph, start, end, steps) {
  if (steps === 0) return start === end ? 0 : Infinity;
  let best = Infinity;
  for (const inner of sequences(Object.keys(graph), steps - 1))
    best = Math.min(best, routeCost(graph, [start, ...inner, end]));
  return best;
}
function mstOracle(graph) {
  const vertices = Object.keys(graph), edges = physicalEdges(graph);
  if (vertices.length === 0) return 0;
  let best = Infinity;
  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    const selected = edges.filter((_, i) => mask & 2 ** i);
    if (selected.length !== vertices.length - 1) continue;
    // A closure over selected edges decides connectedness independently of
    // the model's optimization algorithm and tie-breaking rules.
    const reached = new Set([vertices[0]]);
    for (let pass = 0; pass < vertices.length; pass++) for (const [a, b] of selected) {
      if (reached.has(a)) reached.add(b);
      if (reached.has(b)) reached.add(a);
    }
    if (reached.size === vertices.length)
      best = Math.min(best, selected.reduce((sum, edge) => sum + edge[2], 0));
  }
  return best;
}
function coverOracle(graph, selected) {
  if (!Array.isArray(selected) || Array.from(selected).some(v => typeof v !== 'string' || !owns(graph, v)) ||
      new Set(selected).size !== selected.length) return false;
  const remaining = Object.keys(graph).filter(v => !selected.includes(v));
  return remaining.every(a => graph[a].every(([b]) => !remaining.includes(b)));
}
function hopOracle(graph, start, end) {
  if (start === end) return 0;
  const vertices = Object.keys(graph);
  for (let hops = 1; hops < vertices.length; hops++) {
    for (const inner of sequences(vertices, hops - 1)) {
      const route = [start, ...inner, end];
      if (new Set(route).size === route.length && Number.isFinite(routeCost(graph, route))) return hops;
    }
  }
  return Infinity;
}
function verifyTraceFrames(graph, start, frames, kind) {
  traceCases++;
  ok(Array.isArray(frames) && frames.length > 0, `${kind} returns nonempty frame snapshots`);
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    equal(frame.step, i, `${kind} step numbers agree with frame order`);
    ok(typeof frame.event === 'string' && typeof frame.note === 'string', `${kind} events have descriptions`);
    ok(Array.isArray(frame.queue), `${kind} snapshots expose a queue`);
    for (const node of Object.keys(graph)) {
      ok(owns(frame.distances, node), `${kind} distances include every vertex, including unreachable ones`);
      const value = frame.distances[node];
      ok(value === Infinity || Number.isFinite(value) && value >= 0, `${kind} distances are nonnegative or Infinity`);
    }
    if (kind === 'BFS') {
      ok(Array.isArray(frame.visited), 'BFS exposes discovered vertices');
      equal(new Set(frame.visited).size, frame.visited.length, 'BFS marks each vertex once');
      equal(new Set(frame.queue).size, frame.queue.length, 'BFS never queues a vertex twice');
      ok(frame.queue.every(v => frame.visited.includes(v)), 'BFS marks vertices before enqueueing');
    } else {
      ok(Array.isArray(frame.settled), 'Dijkstra exposes settled vertices');
      equal(new Set(frame.settled).size, frame.settled.length, 'Dijkstra settles each vertex once');
      for (const entry of frame.queue)
        ok(owns(graph, entry.node) && Number.isFinite(entry.distance), 'Dijkstra queue contains valid numeric proposals');
    }
  }
  const final = frames.at(-1);
  for (const end of Object.keys(graph))
    equal(final.distances[end], kind === 'BFS' ? hopOracle(graph, start, end) : shortestOracle(graph, start, end),
      `${kind} final distances match independent route enumeration`);
  equal(final.queue, [], `${kind} finishes with an empty queue`);
  const reachable = Object.keys(graph).filter(v => Number.isFinite(final.distances[v]));
  const expectedScans = reachable.flatMap(node => graph[node].map(([neighbor]) => JSON.stringify([node, neighbor]))).sort();
  const actualScans = frames.filter(frame => frame.event === 'scan')
    .map(frame => JSON.stringify([frame.node, frame.neighbor])).sort();
  equal(actualScans, expectedScans, `${kind} inspects each reachable adjacency entry once, including reverse entries`);
  equal(final.event, 'finish', `${kind} explicitly marks completion`);
  // Later snapshots must not share mutable arrays/maps with earlier frames.
  if (frames.length > 1) {
    const earlier = clone(frames.slice(0, -1)), last = frames.at(-1);
    for (const change of [
      () => last.queue.push(kind === 'BFS' ? 'AUDIT' : {node: 'AUDIT', distance: 999}),
      () => { last.distances[start] = 999; },
      () => (kind === 'BFS' ? last.visited : last.settled).push('AUDIT'),
    ]) {
      try { change(); } catch (error) { ok(error instanceof TypeError, 'Frozen snapshots may reject mutation'); }
    }
    equal(frames.slice(0, -1), earlier, `${kind} historical snapshots do not alias the final snapshot`);
  }
}
function verifyGraph(graph, traces = false) {
  graphs++;
  const frozen = freeze(clone(graph)), vertices = Object.keys(graph), before = clone(frozen);
  equal(model.mstWeight(frozen), mstOracle(graph), 'MST agrees with exhaustive edge-subset optimization');
  for (const start of vertices) {
    for (const end of vertices) {
      pathCases++;
      equal(model.shortestCost(frozen, start, end), shortestOracle(graph, start, end),
        'Shortest path agrees with simple route enumeration');
      for (let steps = 0; steps <= 4; steps++) {
        walkCases++;
        equal(model.exactWalkCost(frozen, start, end, steps), exactOracle(graph, start, end, steps),
          'Exact-step cost agrees with all intermediate vertex sequences');
      }
    }
    if (traces) {
      verifyTraceFrames(graph, start, model.bfsTrace(frozen, start), 'BFS');
      verifyTraceFrames(graph, start, model.dijkstraTrace(frozen, start), 'Dijkstra');
    }
  }
  for (let mask = 0; mask < 2 ** vertices.length; mask++) {
    const selected = vertices.filter((_, i) => mask & 2 ** i);
    equal(model.verifyCover(frozen, selected), coverOracle(graph, selected),
      'A cover is valid exactly when the unselected induced graph has no edge');
  }
  equal(frozen, before, 'All algorithms preserve the caller graph and adjacency arrays');
}

for (const name of ['buildGraph', 'bfsTrace', 'dijkstraTrace', 'mstWeight', 'shortestCost',
  'exactWalkCost', 'verifyCover', 'pairCount', 'assess'])
  equal(typeof model[name], 'function', `Public CommonJS export ${name} is present`);

// Seven states per potential edge: absent, or weight 0..5. This covers every
// three-vertex simple undirected topology, disconnectedness, and zero ties.
for (const [ab, ac, bc] of sequences([-1, 0, 1, 2, 3, 4, 5], 3)) {
  const edges = [['A', 'B', ab], ['A', 'C', ac], ['B', 'C', bc]].filter(e => e[2] >= 0);
  verifyGraph(graphOf(['A', 'B', 'C'], edges));
}
const fixtures = [
  {}, {A: []}, graphOf(['A', 'B', 'C', 'D'], [['A', 'B', 2], ['B', 'C', 2], ['A', 'C', 3]]),
  graphOf(['A', 'B', 'C', 'D'], [['A', 'B', 1], ['A', 'C', 9], ['B', 'C', 1], ['C', 'D', 0]]),
  graphOf(['__proto__', 'constructor', 'toString'], [['__proto__', 'constructor', 2], ['constructor', 'toString', 0]]),
  Object.assign(Object.create(null), graphOf(['A', 'B'], [['A', 'B', 0]])),
  {A: [['A', 0], ['B', 2]], B: [['A', 2]]},
];
fixtures.forEach(g => verifyGraph(g, true));
for (const w of [0, 1, 2, 3, 5]) {
  const graph = model.buildGraph(w);
  equal(graph, {A: [['B', 2], ['C', w]], B: [['A', 2], ['C', 2]], C: [['A', w], ['B', 2]]},
    'The shared scenario preserves AB/BC and changes only AC');
  verifyGraph(graph, true);
}
const pre = model.buildGraph(3), post = model.buildGraph(5);
equal([model.mstWeight(pre), model.shortestCost(pre, 'A', 'C'), model.exactWalkCost(pre, 'A', 'C', 2)],
  [4, 3, 4], 'Initial scenario distinguishes network, unrestricted route, and exact-step objectives');
equal([model.mstWeight(post), model.shortestCost(post, 'A', 'C'), model.exactWalkCost(post, 'A', 'C', 2)],
  [4, 4, 4], 'Transfer scenario has three equal totals without making the objectives equivalent');
equal(physicalEdges(pre).length, 3, 'The original graph contains three physical undirected edges');
equal(Object.values(pre).reduce((sum, adjacent) => sum + adjacent.length, 0), 6,
  'Adjacency inspection counts both directions separately');
equal(model.verifyCover(pre, ['B']), false, 'The single middle sensor leaves AC uncovered');
for (const pair of [['A', 'B'], ['A', 'C'], ['B', 'C']])
  equal(model.verifyCover(pre, pair), true, 'Every pair covers the triangle');
for (const [graph, previous, changed, expected] of [[pre, 3, false, 3], [post, 5, true, 4]]) {
  const step = model.dijkstraTrace(graph, 'A').find(frame => frame.event === 'scan' && frame.node === 'B' && frame.neighbor === 'C');
  ok(step, 'Both scenarios expose the assessed B-to-C relaxation event');
  equal([step.previous, step.candidate, step.changed, step.distances.C], [previous, 4, changed, expected],
    'The assessed relaxation compares its candidate against the previous best and records the actual branch');
}
const stale = model.dijkstraTrace(post, 'A');
ok(stale.some(frame => frame.event === 'skip' && frame.node === 'C' && frame.candidate === 5 && frame.previous === 4),
  'The replaced direct C=5 proposal is explicitly skipped instead of settling C twice');

// Input contracts intentionally distinguish malformed types from ranges.
for (const value of [null, undefined, true, false, '3', {}, []]) {
  throws(() => model.pairCount(value), TypeError, 'Pair counting rejects nonnumeric inputs');
  throws(() => model.exactWalkCost(pre, 'A', 'C', value), TypeError, 'Exact-step input rejects nonnumeric step types');
}
for (const value of [-1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
  throws(() => model.pairCount(value), RangeError, 'Pair counting rejects invalid integer ranges');
  throws(() => model.exactWalkCost(pre, 'A', 'C', value), RangeError, 'Exact-step input rejects invalid integer ranges');
}
for (let vertices = 0; vertices <= 100; vertices++) {
  let enumeratedPairs = 0;
  for (let a = 0; a < vertices; a++) for (let b = a + 1; b < vertices; b++) enumeratedPairs++;
  equal(model.pairCount(vertices), enumeratedPairs, 'Pair formula agrees with literal unordered pair enumeration');
}
throws(() => model.pairCount(Number.MAX_SAFE_INTEGER), RangeError, 'Unsafe pair totals are rejected');
for (const value of [null, true, '3', NaN, Infinity, -1])
  throws(() => model.buildGraph(value), value === null || value === true || value === '3' ? TypeError : RangeError,
    'Scenario weights are finite nonnegative numbers');
for (const candidate of [null, undefined, {}, 'AB', ['A', 'A'], ['A', 'Z'], [1], [null], new Array(1), ['A', , 'B']])
  equal(model.verifyCover(pre, candidate), false, 'Malformed candidate certificates return false');
for (const bad of [null, [], {A: null}, {A: [['Z', 2]]}, {A: [['B', 2]], B: []},
  {A: [['B', 2]], B: [['A', 3]]}, {A: [['B', 2], ['B', 2]], B: [['A', 2]]},
  {A: [['B', -1]], B: [['A', -1]]}, {A: [['B', Infinity]], B: [['A', Infinity]]},
  {A: [['B', '2']], B: [['A', '2']]}, {[Symbol('node')]: []}]) {
  for (const call of [() => model.mstWeight(bad), () => model.shortestCost(bad, 'A', 'C'),
    () => model.exactWalkCost(bad, 'A', 'C', 2), () => model.bfsTrace(bad, 'A'),
    () => model.dijkstraTrace(bad, 'A')])
    throws(call, Error, 'All graph algorithms reject malformed graph definitions');
}
for (const start of ['Z', undefined, null, 0]) {
  for (const call of [() => model.shortestCost(pre, start, 'C'),
    () => model.exactWalkCost(pre, start, 'C', 2), () => model.bfsTrace(pre, start),
    () => model.dijkstraTrace(pre, start)])
    throws(call, Error, 'Algorithms reject unknown or malformed start vertices');
}
for (const end of ['Z', undefined, null, 0]) {
  throws(() => model.shortestCost(pre, 'A', end), Error, 'Shortest route rejects invalid endpoints');
  throws(() => model.exactWalkCost(pre, 'A', end, 2), Error, 'Exact-step route rejects invalid endpoints');
}

// Exercise both module surfaces: the browser receives the same export contract.
const browserContext = {};
vm.runInNewContext(fs.readFileSync(modelFile, 'utf8'), browserContext, {timeout: 1000});
ok(browserContext.AACapstone && typeof browserContext.AACapstone.assess === 'function',
  'A browser script exports AACapstone without requiring Node globals');
equal(Array.from(model.DIMENSIONS, dimension => dimension.id), ['code', 'math', 'purpose', 'links'],
  'The four dimensions retain the four requested learning difficulties');
const expectedChoices = {pre: ['b', 'a', 'c', 'a'], post: ['c', 'b', 'a', 'c']};
equal(model.PHASES.pre.questions.map(q => q.rubric), model.PHASES.post.questions.map(q => q.rubric),
  'Pre and post assess the same reasoning criteria with the same 0-to-2 rubric');
for (const phase of ['pre', 'post']) {
  const specification = model.PHASES[phase], questions = specification.questions;
  equal(specification.acWeight, phase === 'pre' ? 3 : 5, 'Assessment phase uses the intended scenario weight');
  equal(questions.map(q => q.id), ['code', 'math', 'purpose', 'links'], 'Both phases cover the same four dimensions');
  equal(questions.map(q => q.correct), expectedChoices[phase],
    'Answer keys match the independently reviewed relaxation, adjacency, objective, and exact-step mathematics');
  for (const q of questions) {
    ok(typeof q.prompt === 'string' && q.prompt.trim().length > 0, 'Every task has a learner-facing prompt');
    equal(q.rubric.length, 3, 'Every dimension has explicit 0, 1, and 2 descriptors');
    equal(new Set(q.options.map(option => option.value)).size, q.options.length, 'Task option values are unique');
    equal(q.options.filter(option => option.value === q.correct).length, 1, 'Every task has one declared expected choice');
  }
  const answers = Object.fromEntries(questions.map(q => [q.id, {choice: q.correct, reason: ' Kendi gerekçem. '}]))
  const frozen = freeze(clone(answers)), before = clone(frozen), assessed = model.assess(phase, frozen);
  equal(assessed.complete, true, 'All four selected choices with reasons complete the phase');
  equal(assessed.correctCount, 4, 'All independently declared expected choices count correctly');
  equal(assessed.results.map(result => result.id), questions.map(q => q.id), 'Results preserve dimension order');
  equal(assessed.results.map(result => result.expected), expectedChoices[phase], 'Feedback returns the reviewed expected choice values');
  ok(assessed.results.every(result => result.correct && typeof result.explanation === 'string'),
    'Completed results include choice feedback and explanations');
  equal(frozen, before, 'Assessment preserves submitted response objects');
  const arbitraryReason = clone(answers);
  for (const answer of Object.values(arbitraryReason)) answer.reason = 'x';
  equal(model.assess(phase, arbitraryReason).correctCount, assessed.correctCount,
    'Free text is required but never automatically scored for meaning');
  const incorrect = Object.fromEntries(questions.map(q => [q.id,
    {choice: q.options.find(option => option.value !== q.correct).value, reason: 'Bilmiyorum.'}]))
  equal(model.assess(phase, incorrect).correctCount, 0, 'Incorrect choices are not promoted by explanatory text');
  equal(model.assess(phase, incorrect).complete, true, 'An honest incorrect answer is a complete submission');
  const unknown = Object.fromEntries(questions.map(q => [q.id, {choice: 'd', reason: 'Bilmiyorum.'}]));
  equal(model.assess(phase, unknown).complete, true, 'Bilmiyorum is accepted without forcing a guessed answer');
  equal(model.assess(phase, unknown).correctCount, 0, 'Bilmiyorum does not count as mathematically correct');
  for (const replacement of [undefined, null, {}, {choice: 'missing', reason: 'gerekçe'},
    {choice: questions[0].correct, reason: ''}, {choice: questions[0].correct, reason: '   '},
    {choice: questions[0].correct, reason: 'x'.repeat(1201)},
    {choice: questions[0].correct, reason: 123}]) {
    const invalid = clone(answers); invalid[questions[0].id] = replacement;
    equal(model.assess(phase, invalid).complete, false, 'Missing, blank, invalid, and overlong answers remain incomplete');
  }
  for (const malformed of [null, undefined, [], true, 'answers'])
    equal(model.assess(phase, malformed).complete, false, 'Malformed response containers remain incomplete');
  const boundary = clone(answers); boundary[questions[0].id].reason = 'x'.repeat(1200);
  equal(model.assess(phase, boundary).complete, true, 'The documented 1200-character boundary is accepted');
}
throws(() => model.assess('unknown', {}), RangeError, 'Unknown assessment phases are rejected');

console.log(JSON.stringify({status: 'passed', assertions, graphs, pathCases, walkCases, traceCases,
  independentOracles: ['edge-subset connectivity', 'simple vertex sequences',
    'exact-length vertex sequences', 'unselected induced graph', 'unordered pair enumeration']}, null, 2));
