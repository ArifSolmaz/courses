/* Exercise the real Week 8–9 graph helpers without modifying production files.
 * Run: node aa/tools/verify_learning_bridge_graphs.cjs
 * Independent oracles: Floyd–Warshall distances, edge constraints for topology,
 * and disjoint sets for undirected cycles. No browser/package is required.
 * Self-loops below test helper logic only: both UI editors reject self-loops,
 * so these cases make no claim about rendering unsupported self-loop pictures.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
let assertions = 0, bfsCases = 0, dfsCases = 0, kahnCases = 0;
function eq(actual, expected, message) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
  assertions++;
}
function ok(condition, message) { assert.ok(condition, message); assertions++; }
function helpers(week, names) {
  const file = path.join(root, `aa/w${week}/examples/visuals.js`);
  const source = fs.readFileSync(file, 'utf8'), marker = ' return {has:';
  assert.equal(source.split(marker).length, 2, `Week ${week}: one module boundary`);
  const context = {};
  vm.runInNewContext(source.replace(marker,
    ` globalThis.audit={${names.join(',')}};${marker}`), context, {timeout: 3000});
  return context.audit;
}
const breadth = helpers(8, ['bfs']);
const depth = helpers(9, ['dfs', 'kahn']);
const plain = value => JSON.parse(JSON.stringify(value));
const sorted = values => Array.from(values).sort();
const sameMembers = (a, b, message) => eq(sorted(a), sorted(b), message);
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function distances(g) {
  const n = g.v.length, index = Object.fromEntries(g.v.map((v, i) => [v, i]));
  const d = Array.from({length: n}, (_, i) =>
    Array.from({length: n}, (_, j) => i === j ? 0 : Infinity));
  for (const [u, v] of g.e) {
    const a = index[u], b = index[v];
    d[a][b] = Math.min(d[a][b], 1);
    if (!g.directed) d[b][a] = Math.min(d[b][a], 1);
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
  return {d, index};
}
function edgeExists(g, u, v) {
  return g.e.some(([a, b]) => a === u && b === v || !g.directed && a === v && b === u);
}
function directedCycle(g, oracle) {
  return g.e.some(([u, v]) => Number.isFinite(oracle.d[oracle.index[v]][oracle.index[u]]));
}
function undirectedCycle(g) {
  const group = Object.fromEntries(g.v.map(v => [v, v]));
  const leader = v => { while (group[v] !== v) v = group[v]; return v; };
  for (const [u, v] of g.e) {
    const a = leader(u), b = leader(v);
    if (a === b) return true;
    group[a] = b;
  }
  return false;
}
function topological(g, order) {
  if (order.length !== g.v.length || new Set(order).size !== g.v.length) return false;
  const rank = Object.fromEntries(order.map((v, i) => [v, i]));
  return g.e.every(([u, v]) => rank[u] < rank[v]);
}

function verifyBfs(g, source, oracle = distances(g)) {
  bfsCases++;
  const before = JSON.stringify(g), frames = breadth.bfs(g, source), result = frames.at(-1);
  const expected = {};
  for (const v of g.v) {
    const distance = oracle.d[oracle.index[source]][oracle.index[v]];
    if (Number.isFinite(distance)) expected[v] = distance;
  }
  eq(Object.fromEntries(g.v.filter(v => owns(result.distance, v)).map(v => [v, result.distance[v]])),
    expected, 'BFS distances match an independent all-pairs shortest-path oracle');
  const reachable = new Set(Object.keys(expected));
  const scans = g.e.reduce((sum, [u, v]) =>
    sum + Number(reachable.has(u)) + Number(!g.directed && reachable.has(v)), 0);
  eq(result.scans, scans, 'BFS counts every inspected reachable adjacency entry');
  eq(result.processed, reachable.size, 'Every reachable vertex is processed exactly once');
  sameMembers(result.order, reachable, 'Every reachable vertex is discovered exactly once');
  eq(result.queue, [], 'BFS finishes with an empty queue');
  eq(result.parent[source], null, 'The source has no parent');
  eq(frames.filter(f => f.title.startsWith('Process ')).map(f => f.title.slice(8)),
    result.order, 'Processing follows exactly the FIFO discovery order');
  eq(result.order.map(v => result.distance[v]),
    result.order.map(v => result.distance[v]).slice().sort((a, b) => a - b),
    'BFS processes complete distance layers before later layers');
  for (const v of reachable) if (v !== source) {
    const parent = result.parent[v];
    ok(edgeExists(g, parent, v), 'A BFS parent is an actual predecessor');
    eq(result.distance[parent] + 1, result.distance[v], 'Parent links follow a shortest route');
    let cursor = v, hops = 0;
    while (cursor !== source && cursor !== undefined && hops <= g.v.length) {
      cursor = result.parent[cursor]; hops++;
    }
    eq(cursor, source, 'Every parent chain terminates at the source');
    eq(hops, expected[v], 'The parent route has the independent minimum edge count');
  }
  let previous = {scans: 0, processed: 0, order: [], distance: {}, parent: {}};
  for (const frame of frames) {
    eq(new Set(frame.queue).size, frame.queue.length, 'No duplicate vertex waits in the queue');
    eq(new Set(frame.order).size, frame.order.length, 'No vertex is enqueued/discovered twice');
    ok(frame.queue.every(v => owns(frame.distance, v)), 'Marking happens before enqueueing');
    eq(frame.order.slice(0, previous.order.length), previous.order, 'Discovery records grow only at the end');
    for (const v of Object.keys(previous.distance)) {
      eq(frame.distance[v], previous.distance[v], 'First-discovery distances never change');
      eq(frame.parent[v], previous.parent[v], 'First-discovery parents never change');
    }
    ok(frame.scans - previous.scans === 0 || frame.scans - previous.scans === 1,
      'One trace event inspects at most one neighbor entry');
    ok(frame.processed - previous.processed === 0 || frame.processed - previous.processed === 1,
      'One trace event processes at most one queue vertex');
    previous = frame;
  }
  eq(JSON.stringify(g), before, 'The BFS trace preserves its caller graph');
  return plain(result);
}

function verifyDfs(g, oracle = distances(g)) {
  dfsCases++;
  const before = JSON.stringify(g), frames = depth.dfs(g), result = frames.at(-1);
  const cycle = g.directed ? directedCycle(g, oracle) : undirectedCycle(g);
  eq(result.cycle, cycle, 'DFS cycle evidence agrees with independent reachability/disjoint sets');
  sameMembers(Object.keys(result.entry), g.v, 'The full DFS enters every vertex, including disconnected ones');
  sameMembers(Object.keys(result.exit), g.v, 'The full DFS finishes every vertex');
  eq(new Set(result.finish).size, g.v.length, 'Every vertex finishes once');
  eq(sorted([...Object.values(result.entry), ...Object.values(result.exit)]).map(Number).sort((a, b) => a - b),
    Array.from({length: 2 * g.v.length}, (_, i) => i + 1), 'The entry/exit clock uses each timestamp once');
  eq(result.finish, g.v.slice().sort((a, b) => result.exit[a] - result.exit[b]),
    'The finish list follows actual exit times');
  for (const v of g.v) ok(result.entry[v] < result.exit[v], 'Entry precedes exit');
  for (const [v, parent] of Object.entries(result.parent)) {
    ok(edgeExists(g, parent, v), 'A DFS tree parent is an actual edge');
    ok(result.entry[parent] < result.entry[v] && result.exit[v] < result.exit[parent],
      'The child interval nests strictly inside its parent interval');
  }
  eq(result.classes.length, g.e.length,
    g.directed ? 'Full directed DFS classifies each outgoing arc once' :
      'Undirected DFS classifies each physical edge once, skipping the reverse list entry');
  const normalize = ([u, v]) => g.directed ? u + v : [u, v].sort().join('');
  sameMembers(result.classes.map(e => normalize([e.u, e.v])), g.e.map(normalize),
    'Every classification corresponds to one original edge');
  let classified = 0;
  for (const frame of frames) {
    ok(frame.classes.length === classified || frame.classes.length === classified + 1,
      'An edge event adds exactly one classification');
    if (frame.classes.length > classified) {
      const {u, v, kind} = frame.classes.at(-1);
      ok(owns(frame.entry, u) && !owns(frame.exit, u), 'The inspecting vertex is gray/active');
      if (kind === 'tree') {
        ok(!owns(frame.entry, v), 'A tree edge reaches a white/unseen vertex');
        eq(frame.parent[v], u, 'The tree edge establishes its parent before the recursive call');
      } else if (kind === 'back') {
        ok(owns(frame.entry, v) && !owns(frame.exit, v), 'A back edge reaches a gray/active vertex');
        ok(frame.cycle, 'An active-target edge records cycle evidence');
      } else {
        ok(owns(frame.exit, v), 'Forward/cross edges reach black/finished vertices');
        ok(kind === 'forward' || kind === 'cross', 'Only the documented edge classes are produced');
        eq(kind, frame.entry[u] < frame.entry[v] ? 'forward' : 'cross',
          'Finished-target classification agrees with the entry intervals');
      }
    }
    classified = frame.classes.length;
  }
  if (g.directed) {
    eq(topological(g, result.finish.slice().reverse()), !cycle,
      'Reverse finishing order satisfies every edge exactly when the graph is a DAG');
    ok(cycle ? result.caption.includes('NOT a valid topological order') :
      result.caption.includes('valid topological order'), 'The final DFS explanation refuses cyclic topology');
  }
  eq(JSON.stringify(g), before, 'The DFS trace preserves its caller graph');
  return plain(result);
}

function verifyKahn(g, oracle = distances(g)) {
  kahnCases++;
  const before = JSON.stringify(g), frames = depth.kahn(g), result = frames.at(-1);
  const cycle = directedCycle(g, oracle);
  eq(result.cycle, cycle, 'Kahn completion agrees with the independent cycle oracle');
  eq(topological(g, result.order), !cycle, 'Only a DAG yields a complete edge-respecting Kahn order');
  for (const frame of frames) {
    const removed = new Set(frame.order), ready = [];
    eq(removed.size, frame.order.length, 'No vertex is removed twice');
    eq(new Set(frame.queue).size, frame.queue.length, 'No ready vertex is queued twice');
    for (const v of g.v) if (!removed.has(v)) {
      const degree = g.e.filter(([u, target]) => target === v && !removed.has(u)).length;
      eq(frame.degree[v], degree, 'The stored remaining indegree matches original unremoved prerequisites');
      if (degree === 0) ready.push(v);
    }
    sameMembers(frame.queue, ready, 'Exactly the remaining zero-indegree vertices are ready');
    for (const [i, v] of frame.order.entries())
      ok(g.e.filter(([, target]) => target === v).every(([u]) => frame.order.indexOf(u) < i && removed.has(u)),
        'An emitted vertex follows all its prerequisites');
  }
  if (cycle) {
    ok(result.order.length < g.v.length, 'A cyclic result is explicitly incomplete');
    eq(result.title, 'Stopped: cycle detected', 'The widget refuses a complete order for a cyclic graph');
  }
  eq(JSON.stringify(g), before, 'Kahn preserves its caller graph');
  return plain(result);
}

function* graphs(vertices, directed, selfLoops = false) {
  const possible = [];
  for (let i = 0; i < vertices.length; i++) for (let j = 0; j < vertices.length; j++)
    if (directed ? selfLoops || i !== j : i < j) possible.push([vertices[i], vertices[j]]);
  for (let mask = 0; mask < 2 ** possible.length; mask++)
    yield {v: vertices.slice(), e: possible.filter((_, bit) => mask & 2 ** bit), directed};
}

// All directed graphs through three vertices, including helper-only self-loops.
// Shortest paths use Floyd–Warshall rather than another queue traversal.
for (let n = 1; n <= 3; n++) for (const g of graphs('ABC'.slice(0, n).split(''), true, true)) {
  const oracle = distances(g);
  for (const source of g.v) verifyBfs(g, source, oracle);
  verifyDfs(g, oracle); verifyKahn(g, oracle);
}
// Every simple undirected graph through four vertices, from each possible source.
for (let n = 1; n <= 4; n++) for (const g of graphs('ABCD'.slice(0, n).split(''), false)) {
  const oracle = distances(g);
  for (const source of g.v) verifyBfs(g, source, oracle);
  verifyDfs(g, oracle);
}
// Empty complete traversals are supported; a BFS source outside V is not a UI input.
verifyDfs({v: [], e: [], directed: true});
verifyKahn({v: [], e: [], directed: true});

const diamond = {v: ['A', 'B', 'C', 'D', 'E'],
  e: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']], directed: false};
const bfsWorked = verifyBfs(diamond, 'A');
eq(bfsWorked.distance, {A: 0, B: 1, C: 1, D: 2}, 'Week 8: E remains unreachable');
eq(bfsWorked.parent, {A: null, B: 'A', C: 'A', D: 'B'}, 'Week 8: first parent survives the second route');
eq(bfsWorked.scans, 8, 'Week 8 guided answer: four undirected edges give eight inspected entries');
const directed = {...diamond, directed: true};
eq(verifyBfs(directed, 'A').scans, 4, 'The same four directed arcs give four inspections');
const dfsWorked = verifyDfs(directed);
eq(dfsWorked.classes.length, 4, 'Week 9 guided answer: four directed arc inspections');
eq(dfsWorked.finish, ['D', 'B', 'C', 'A', 'E'], 'Disconnected E is separately finished by a full traversal');
eq(verifyDfs({...directed, v: ['A', 'B', 'C', 'D']}).finish, ['D', 'B', 'C', 'A'],
  'Week 9 worked finishing order');
eq(dfsWorked.classes.find(e => e.u === 'C' && e.v === 'D').kind, 'cross',
  'C → D reaches a black/finished vertex and is not a cycle witness');
eq(dfsWorked.cycle, false, 'A shared finished destination alone is not a directed cycle');
const cyclic = {...directed, e: [...directed.e, ['D', 'A']]};
eq(verifyDfs(cyclic).classes.find(e => e.u === 'D' && e.v === 'A').kind, 'back',
  'D → A reaches a gray/active ancestor and closes a directed cycle');
verifyKahn(directed); verifyKahn(cyclic);

console.log(`PASS ${assertions.toLocaleString()} assertions: ${bfsCases} BFS, ${dfsCases} DFS and ${kahnCases} Kahn traces; exhaustive directed graphs through 3 vertices and simple undirected graphs through 4; independent shortest paths/cycles/topology; first-parent/FIFO/mark-on-enqueue; directed E vs undirected 2E; white/gray/black edge events; disconnected and empty complete traversals.`);
console.log('Limits: self-loops test helper logic only (editors reject them); DFS exposes edge classifications, not every internal adjacency read or live stack/state. Undirected DFS classifications deliberately skip reverse entries. Browser widgets and mobile rendering need the separate browser suite.');
