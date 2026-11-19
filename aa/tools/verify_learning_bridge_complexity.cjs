/* Verify the actual Week 14 models without changing production files.
 * Run: node aa/tools/verify_learning_bridge_complexity.cjs
 * Independent oracles enumerate graph assignments and two-machine schedules.
 * Tiny exhaustive checks illustrate the claims; they are not general proofs
 * of reductions, complexity classifications or approximation guarantees.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const counts = {assertions: 0, graphCases: 0, subsetCases: 0, approximationTraces: 0,
  schedulingCases: 0, scheduleAssignments: 0, satAssignments: 0,
  gadgetAssignments: 0, constructionCandidates: 0, defaultVisuals: 0};
const serial = x => JSON.stringify(x);
function eq(actual, expected, message) {
  assert.equal(serial(actual), serial(expected), message); counts.assertions++;
}
function ok(condition, message) { assert.ok(condition, message); counts.assertions++; }
const sum = a => a.reduce((total, x) => total + x, 0);
const sorted = a => Array.from(a).sort();
function sameMembers(a, b, message) { eq(sorted(a), sorted(b), message); }

// Export lexical helpers into the isolated audit context, leaving the source
// file and its public interface untouched. No browser or network is involved.
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'aa/w14/examples/cards.js'), 'utf8'), context,
  {timeout: 3000});
const source = fs.readFileSync(path.join(root, 'aa/w14/examples/visuals.js'), 'utf8');
const marker = 'return {has:';
eq(source.split(marker).length, 2, 'There is exactly one module export boundary');
const names = ['subsets', 'cover', 'independent', 'complement', 'coverFrame', 'sat',
  'gadget', 'assignmentData', 'lpt', 'approx', 'construction', 'scenarios', 'cards'];
vm.runInContext(source.replace(marker,
  `globalThis.audit={${names.join(',')}};${marker}`), context, {timeout: 3000});
const model = context.audit;

function choices(n) {
  return Array.from({length: 2 ** n}, (_, mask) => Array.from({length: n}, (_, i) => i)
    .filter(i => Math.floor(mask / 2 ** i) % 2));
}
function graphOracle(g) {
  const at = new Map(g.v.map((v, i) => [v, i]));
  const pairs = g.e.map(([u, v]) => [at.get(u), at.get(v)]);
  let optimum = Infinity, largestIndependent = 0;
  const states = [];
  for (let mask = 0; mask < 2 ** g.v.length; mask++) {
    const selected = i => Math.floor(mask / 2 ** i) % 2 === 1;
    const chosen = g.v.filter((_, i) => selected(i));
    const covers = !pairs.some(([u, v]) => !selected(u) && !selected(v));
    const independent = !pairs.some(([u, v]) => selected(u) && selected(v));
    if (covers) optimum = Math.min(optimum, chosen.length);
    if (independent) largestIndependent = Math.max(largestIndependent, chosen.length);
    states.push({chosen, covers, independent});
  }
  return {optimum, largestIndependent, states};
}
const edgeKey = ([u, v]) => [u, v].sort().join('|');
function verifyApproximation(g, optimum) {
  counts.approximationTraces++;
  const before = serial(g), trace = model.approx(g), result = trace.at(-1);
  const endpoints = Array.from(result.matching).flatMap(e => Array.from(e));
  eq(new Set(endpoints).size, endpoints.length, 'Matching edges have disjoint endpoints');
  ok(result.matching.every(e => g.e.some(p => edgeKey(p) === edgeKey(e))),
    'Each matching edge is an actual input edge');
  eq(new Set(result.chosen).size, result.chosen.length, 'The approximation returns distinct vertices');
  sameMembers(result.chosen, endpoints, 'The cover consists of both endpoints of every matching edge');
  ok(g.e.every(([u, v]) => result.chosen.includes(u) || result.chosen.includes(v)),
    'Every input edge is covered by the returned vertices');
  ok(g.e.every(([u, v]) => endpoints.includes(u) || endpoints.includes(v)),
    'No extra input edge can be added to the maximal matching');
  eq(result.optimum, optimum, 'The displayed optimum agrees with independent subset enumeration');
  ok(result.matching.length <= optimum, 'Disjoint matching edges give a valid lower bound on any cover');
  eq(result.chosen.length, 2 * result.matching.length, 'The returned cover is twice that lower bound');
  ok(result.chosen.length <= 2 * optimum, 'The approximation is within twice the exact minimum');
  eq(trace.length, result.matching.length + 1, 'There is one frame per matching edge and one bound frame');
  eq(serial(g), before, 'Approximation preserves the caller graph');
}
function verifyGraph(g, reverse = false) {
  counts.graphCases++;
  const before = serial(g), oracle = graphOracle(g), complement = model.complement(g);
  eq(complement.v, g.v, 'The complement retains precisely the input vertex set');
  ok(complement.v !== g.v, 'The complement owns its vertex array');
  const originalEdges = new Set(g.e.map(edgeKey)), expectedComplement = [];
  for (let i = 0; i < g.v.length; i++) for (let j = i + 1; j < g.v.length; j++)
    if (!originalEdges.has(edgeKey([g.v[i], g.v[j]]))) expectedComplement.push([g.v[i], g.v[j]]);
  sameMembers(complement.e.map(edgeKey), expectedComplement.map(edgeKey),
    'Exactly the missing distinct-vertex pairs appear in the complement');
  sameMembers(model.complement(complement).e.map(edgeKey), g.e.map(edgeKey),
    'Taking the simple-graph complement twice restores the original edges');
  const complementEdges = new Set(complement.e.map(edgeKey));
  for (const state of oracle.states) {
    counts.subsetCases++;
    eq(model.cover(g, state.chosen), state.covers, 'The production cover checker matches edge constraints');
    eq(model.independent(g, state.chosen), state.independent,
      'The production independent-set checker matches pair constraints');
    const rest = g.v.filter(v => !state.chosen.includes(v));
    eq(model.independent(g, rest), state.covers,
      'A set covers every edge iff its complement is independent');
    let clique = true;
    for (let i = 0; i < state.chosen.length; i++) for (let j = i + 1; j < state.chosen.length; j++)
      clique &&= complementEdges.has(edgeKey([state.chosen[i], state.chosen[j]]));
    eq(clique, state.independent, 'An independent set in G is a clique in the complement of G');
  }
  eq(oracle.optimum + oracle.largestIndependent, g.v.length,
    'Minimum vertex-cover size plus maximum independent-set size is V');
  verifyApproximation(g, oracle.optimum);
  if (reverse && g.e.length > 1)
    verifyApproximation({v: g.v.slice(), e: g.e.slice().reverse()}, oracle.optimum);
  eq(serial(g), before, 'Cover, independent-set and complement helpers preserve the graph');
}

// All simple undirected graphs on zero through five vertices, including empty
// graphs, isolated vertices and dense/tied alternatives. This is a tiny bound.
for (let n = 0; n <= 5; n++) {
  const v = [...'ABCDE'.slice(0, n)], pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([v[i], v[j]]);
  for (const indices of choices(pairs.length))
    verifyGraph({v, e: indices.map(i => pairs[i])}, true);
}
let seed = 0x14c0ffee;
function random(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; }
for (let sample = 0; sample < 120; sample++) {
  const v = [...'ABCDEFGH'.slice(0, 6 + sample % 3)], e = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++)
    if (random(5) < 2) e.push([v[i], v[j]]);
  verifyGraph({v, e}, true);
}

// The new learning bridge uses the triangle A–B–C–A. The pre-existing cover
// widget uses the different four-vertex path A–B–C–D; check its exact states too.
const triangle = {v: [...'ABC'], e: [['A','B'], ['B','C'], ['A','C']]};
eq(graphOracle(triangle).optimum, 2, 'The shared sensor triangle needs exactly two monitoring vertices');
eq(model.approx(triangle).at(-1).optimum, 2, 'The sensor bridge guided answer is independently two');
const pathGraph = {v: [...'ABCD'], e: [['A','B'], ['B','C'], ['C','D']]};
for (const state of graphOracle(pathGraph).states) {
  const f = model.coverFrame(state.chosen);
  eq(f.valid, state.covers, 'All sixteen reachable cover-widget selections have correct feedback');
  const green = (f.html.match(/stroke="#167065"/g) || []).length;
  const orange = (f.html.match(/stroke="#a74c20"/g) || []).length;
  eq(green, pathGraph.e.filter(([u, v]) => state.chosen.includes(u) || state.chosen.includes(v)).length,
    'The widget colors precisely the covered path edges green');
  eq(green + orange, pathGraph.e.length, 'Every path edge receives covered or uncovered feedback');
}

// Production subsets uses a JavaScript bit mask. Exercise only lengths <= 10;
// these tests deliberately make no claim about a general 32-bit implementation.
for (let n = 0; n <= 10; n++) {
  const values = Array.from({length: n}, (_, i) => `v${i}`), result = model.subsets(values);
  eq(result.length, 2 ** n, 'Tiny subset enumeration has exactly 2^n candidates');
  sameMembers(result.map(a => a.join('|')), choices(n).map(a => a.map(i => values[i]).join('|')),
    'Tiny subsets contain every candidate exactly once');
}

function cnfSatisfied(clauses, assignment) {
  return clauses.every(clause => clause.some(literal => {
    const value = assignment[Math.abs(literal) - 1];
    return literal > 0 ? value : !value;
  }));
}
function rowNumbers(html, label) {
  const start = html.indexOf(`<strong>${label}</strong>`);
  ok(start >= 0, `The displayed ${label} row exists`);
  const tiles = html.slice(start).split('</div></div>')[0];
  return [...tiles.matchAll(/<span class="v-tile">([^<]*)<\/span>/g)].map(m => Number(m[1]));
}
const satFrames = model.sat();
eq(satFrames.length, 8, 'The SAT truth table has all eight three-variable assignments');
const seenSat = new Set();
for (const f of satFrames) {
  counts.satAssignments++;
  const bits = Array.from(f.assignment);
  eq(bits.length, 3, 'A SAT row has three Boolean values');
  ok(bits.every(v => typeof v === 'boolean'), 'SAT assignments are genuinely Boolean');
  seenSat.add(bits.map(Number).join(''));
  eq(f.title, `a=${+bits[0]}, b=${+bits[1]}, c=${+bits[2]}`,
    'The SAT row title matches its actual assignment');
  eq(f.valid, cnfSatisfied([[1, 2], [-1, 3]], bits), 'Both original clauses must evaluate true');
}
eq(seenSat.size, 8, 'The truth table contains each assignment once');
eq(satFrames.filter(f => f.valid).length, 4, 'The displayed two-clause formula has four satisfying assignments');
const gadgetFrames = model.gadget();
eq(gadgetFrames.length, 16, 'The four-literal split has all sixteen original assignments');
for (let mask = 0; mask < gadgetFrames.length; mask++) {
  counts.gadgetAssignments++;
  const f = gadgetFrames[mask], bits = [8, 4, 2, 1].map(bit => Boolean(mask & bit));
  eq(f.title, `Original literals: ${bits.map(Number).join('')}`,
    'The gadget title identifies the original assignment being evaluated');
  const original = cnfSatisfied([[1, 2, 3, 4]], bits);
  const options = [false, true].filter(w => cnfSatisfied([[1, 2, 5], [-5, 3, 4]], [...bits, w]));
  eq(f.original, original, 'The original four-literal disjunction has the correct truth value');
  eq(f.equivalent, options.length > 0, 'Existential choice of fresh w preserves satisfiability');
  eq(f.original, f.equivalent, 'Each original assignment extends iff the original clause is true');
  eq(rowNumbers(f.html, 'Working fresh w values'), options.map(Number),
    'The displayed w values are exactly the satisfying extensions');
}

const construction = model.construction()[0];
eq(construction.edges.length, 9, 'The three-variable one-clause construction has nine edges');
eq(construction.selected.length, 5, 'The sample cover uses the stated n + 2m = 5 budget');
const constructionGraph = {v: Array.from({length: 9}, (_, i) => i), e: construction.edges};
const constructionOracle = graphOracle(constructionGraph);
eq(constructionOracle.optimum, 5, 'Independent enumeration establishes the tiny construction optimum');
ok(construction.edges.every(([u, v]) => construction.selected.includes(u) || construction.selected.includes(v)),
  'The worked selected vertices cover all nine construction edges');
for (const state of constructionOracle.states) {
  counts.constructionCandidates++;
  if (!state.covers || state.chosen.length > 5) continue;
  for (const [u, v] of [[0, 1], [2, 3], [4, 5]])
    eq(Number(state.chosen.includes(u)) + Number(state.chosen.includes(v)), 1,
      'Every budget-five cover chooses exactly one vertex per variable pair');
  eq(state.chosen.filter(v => v >= 6).length, 2,
    'Every budget-five cover chooses exactly two clause-triangle vertices');
  const decoded = [0, 2, 4].map(v => state.chosen.includes(v));
  ok(cnfSatisfied([[1, 2, 3]], decoded), 'Every budget-five cover decodes to a satisfying assignment');
  const omitted = [6, 7, 8].find(v => !state.chosen.includes(v));
  ok(state.chosen.includes([0, 2, 4][omitted - 6]),
    'The omitted clause occurrence forces its matching literal vertex into the cover');
}
for (const indices of choices(3)) {
  const truth = [0, 1, 2].map(i => indices.includes(i));
  const variableVertices = truth.map((value, i) => 2 * i + Number(!value));
  const extensions = [6, 7, 8].filter(omit => {
    const selected = [...variableVertices, ...[6, 7, 8].filter(v => v !== omit)];
    return construction.edges.every(([u, v]) => selected.includes(u) || selected.includes(v));
  });
  eq(extensions.length > 0, cnfSatisfied([[1, 2, 3]], truth),
    'A variable assignment extends to a budget-five cover iff the clause is true');
}

// This oracle assigns each indexed job recursively to either machine. It uses
// neither the production bitmask enumerator nor the production greedy order.
function optimumSchedule(values) {
  let best = Infinity;
  function place(i, left, right) {
    if (i === values.length) { counts.scheduleAssignments++; best = Math.min(best, Math.max(left, right)); return; }
    place(i + 1, left + values[i], right);
    place(i + 1, left, right + values[i]);
  }
  place(0, 0, 0); return best;
}
function verifySchedule(values) {
  counts.schedulingCases++;
  const before = serial(values), optimum = optimumSchedule(values);
  const exact = model.assignmentData(values), trace = model.lpt(values), final = trace.at(-1);
  eq(exact.best, optimum, 'Displayed exact assignment cost agrees with independent recursive allocation');
  eq(new Set(exact.bestA).size, exact.bestA.length, 'The exact witness uses distinct job indices');
  ok(exact.bestA.every(i => Number.isInteger(i) && i >= 0 && i < values.length),
    'Every exact witness index identifies a real job');
  const left = sum(exact.bestA.map(i => values[i]));
  eq(Math.max(left, sum(values) - left), optimum, 'The returned exact witness attains its claimed optimum');
  eq(final.optimum, optimum, 'The LPT comparison uses the true tiny-instance optimum');
  ok(final.heuristic >= optimum, 'The heuristic cannot beat the exact optimum');
  ok(6 * final.heuristic <= 7 * optimum,
    'Nonnegative two-machine LPT cases respect the known 7/6 bound');
  ok(final.heuristic >= Math.max(sum(values) / 2, ...values, 0),
    'The heuristic cost respects total-work and longest-job lower bounds');
  eq(trace.length, values.length + 1, 'Each job is assigned once before the comparison frame');
  let previous = [[], []];
  for (let i = 0; i < values.length; i++) {
    const groups = [rowNumbers(trace[i].html, 'Machine 1'), rowNumbers(trace[i].html, 'Machine 2')];
    const loads = groups.map(sum);
    eq(rowNumbers(trace[i].html, 'Loads'), loads, 'Every intermediate displayed load equals its assigned jobs');
    eq(groups[0].length + groups[1].length, i + 1, 'One additional indexed job appears per LPT step');
    for (let machine = 0; machine < 2; machine++)
      eq(groups[machine].slice(0, previous[machine].length), previous[machine],
        'An assigned job remains on its previous machine during later steps');
    const changed = [0, 1].filter(machine => groups[machine].length !== previous[machine].length);
    eq(changed.length, 1, 'Exactly one machine receives the next job');
    ok(sum(previous[changed[0]]) <= sum(previous[1 - changed[0]]),
      'The job goes to a machine with minimum previous load');
    const oldValues = previous.flat(), newValues = groups.flat();
    const delta = newValues.slice();
    for (const value of oldValues) {
      const index = delta.indexOf(value);
      ok(index >= 0, 'Every previously assigned duration remains in the displayed groups');
      delta.splice(index, 1);
    }
    eq(delta.length, 1, 'A step preserves all previous jobs and adds exactly one job duration');
    const remaining = values.slice();
    for (const value of oldValues) remaining.splice(remaining.indexOf(value), 1);
    eq(delta[0], Math.max(...remaining), 'The next assigned job has maximum remaining duration');
    previous = groups;
  }
  sameMembers(previous.flat(), values, 'The final displayed groups contain every input job exactly once');
  eq(final.heuristic, Math.max(...previous.map(sum)), 'The reported heuristic cost is the actual final maximum load');
  eq(serial(values), before, 'Exact assignment and LPT preserve the original jobs');
}
for (let n = 0; n <= 5; n++) for (let code = 0; code < 5 ** n; code++) {
  let rest = code; const values = [];
  for (let i = 0; i < n; i++) { values.push(rest % 5); rest = Math.floor(rest / 5); }
  verifySchedule(values);
}
for (let sample = 0; sample < 96; sample++) {
  const values = Array.from({length: 6 + sample % 5}, () => random(81) / 4);
  verifySchedule(values);
}
verifySchedule([8, 7, 6, 5, 4]);
verifySchedule([3, 3, 2, 2, 2]);
eq(model.lpt([8, 7, 6, 5, 4]).at(-1).heuristic, 17, 'The default LPT schedule really takes 17');
eq(model.assignmentData([8, 7, 6, 5, 4]).best, 15, 'The default exact optimum really is 15');
eq(model.lpt([3, 3, 2, 2, 2]).at(-1).heuristic, 7, 'The tight small LPT example has cost seven');
eq(model.assignmentData([3, 3, 2, 2, 2]).best, 6, 'That example has exact cost six, attaining 7/6');

eq(model.cards.length, 22, 'All original twenty-two Week 14 cards remain present');
const visualCards = model.cards.filter(c => c.visual), breakCards = model.cards.filter(c => !c.visual);
eq(visualCards.length, 20, 'Twenty original cards have computed visual scenarios');
eq(breakCards.length, 2, 'The two original break cards have no synthetic visual');
sameMembers(visualCards.map(c => c.visual), Object.keys(model.scenarios),
  'The visual inventory and original cards correspond exactly');
for (const card of visualCards) {
  counts.defaultVisuals++;
  const trace = model.scenarios[card.visual]();
  ok(Array.isArray(trace) && trace.length > 0, `Default ${card.visual} has a nonempty trace`);
  for (const f of trace) for (const field of ['title', 'html', 'caption'])
    eq(typeof f[field], 'string', `Default ${card.visual} supplies ${field}`);
}
const targetSubsets = choices(5).filter(indices => sum(indices.map(i => [8, 7, 6, 5, 4][i])) === 15);
eq(model.scenarios.python().length, targetSubsets.length,
  'Every displayed target-fifteen subset corresponds to an independently valid assignment');
eq(targetSubsets.length, 2, 'The default verifier search finds precisely the two target-fifteen subsets');
eq(46 / Math.max(30, 40, 25, 35), 1.15, 'The displayed 40-to-46 interval permits at most a fifteen-percent gap');

// For the stated Euclidean square, independently enumerate tours and trees.
const points = [[0,0], [1,0], [1,1], [0,1]], distance = (a, b) => Math.hypot(points[a][0] - points[b][0], points[a][1] - points[b][1]);
let shortestTour = Infinity;
function tour(route) {
  if (route.length === 4) {
    shortestTour = Math.min(shortestTour, sum(route.map((v, i) => distance(v, route[(i + 1) % 4])))); return;
  }
  for (let v = 1; v < 4; v++) if (!route.includes(v)) tour([...route, v]);
}
tour([0]);
eq(shortestTour, 4, 'Every permutation of the unit-square tour confirms optimum four');
const pairs = [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]];
let minimumTree = Infinity;
for (const indices of choices(pairs.length).filter(s => s.length === 3)) {
  const edges = indices.map(i => pairs[i]), reached = new Set([0]);
  for (let pass = 0; pass < 4; pass++) for (const [u, v] of edges)
    if (reached.has(u) || reached.has(v)) { reached.add(u); reached.add(v); }
  if (reached.size === 4) minimumTree = Math.min(minimumTree, sum(edges.map(([u, v]) => distance(u, v))));
}
eq(minimumTree, 3, 'Independent tree enumeration confirms unit-square MST cost three');

const limitations = [
  'Graph equivalences: every simple undirected graph on 0–5 vertices, plus 120 deterministic 6–8-vertex samples; no loops or parallel edges.',
  'Subset helper checked only through 10 elements; its JavaScript bitmask is deliberately a tiny-example implementation.',
  'Schedules: nonnegative two-machine jobs only; exhaustive 0–4 integer durations through five jobs, plus 96 sampled quarter-unit cases of 6–10 jobs and two canonical cases.',
  'SAT equivalence and the one-clause construction checked on all tiny Boolean assignments; tests do not substitute for general reduction or approximation proofs.',
  'Frame and model checks do not replace separate browser interaction, Python execution, accessibility or responsive-view checks.'
];
console.log(JSON.stringify({status: 'PASS', ...counts, sensorTriangleMinimumCover: 2,
  originalCards: 22, defaultComputedVisuals: 20, breakCards: 2, limitations}, null, 2));
