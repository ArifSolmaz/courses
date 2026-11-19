/* Exercise the real Week 10–11 models without changing production files.
 * Run: node aa/tools/verify_learning_bridge_networks.cjs
 * Oracles enumerate edge subsets, simple paths and simple cycles. They do not
 * repeat the production union-find or shortest-path relaxation algorithms.
 * Only finite simple-graph UI inputs are used; browser/mobile checks are separate.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
let assertions = 0, mstCases = 0, primCases = 0, dijkstraCases = 0;
let bellmanCases = 0, dagCases = 0, floydCases = 0, unionCases = 0;
const serial = value => JSON.stringify(value, (_, x) =>
  typeof x === 'number' && !Number.isFinite(x) ? String(x) : x);
function eq(actual, expected, message) {
  assert.equal(serial(actual), serial(expected), message); assertions++;
}
function ok(condition, message) { assert.ok(condition, message); assertions++; }
function helpers(week, names) {
  const source = fs.readFileSync(path.join(root, `aa/w${week}/examples/visuals.js`), 'utf8');
  const marker = 'return {has:';
  assert.equal(source.split(marker).length, 2, `Week ${week}: one module boundary`);
  const context = {};
  vm.runInNewContext(source.replace(marker,
    `globalThis.audit={${names.join(',')}};${marker}`), context, {timeout: 3000});
  return context.audit;
}
const trees = helpers(10, ['uf', 'kruskal', 'prim', 'enumerate', 'unionTrace']);
const routes = helpers(11, ['dijkstra', 'bellman', 'dagTrace', 'floyd', 'grid']);
const sorted = values => Array.from(values).sort();
const members = (a, b, message) => eq(sorted(a), sorted(b), message);
const sum = edges => edges.reduce((a, e) => a + e[2], 0);
const edgeKey = edge => edge.slice(0, 2).sort().join('');
const treeKey = edges => edges.map(edgeKey).sort().join('|');
function components(vertices, edges) {
  const unseen = new Set(vertices), groups = [];
  while (unseen.size) {
    const seed = unseen.values().next().value, group = [seed]; unseen.delete(seed);
    for (let i = 0; i < group.length; i++) for (const [u, v] of edges) {
      const other = u === group[i] ? v : v === group[i] ? u : undefined;
      if (unseen.delete(other)) group.push(other);
    }
    groups.push(group);
  }
  return groups;
}
function minimumForest(g) {
  const count = components(g.v, g.e).length, wanted = g.v.length - count;
  let best = Infinity; const winners = [], spanningTrees = [];
  for (let mask = 0; mask < 2 ** g.e.length; mask++) {
    const edges = g.e.filter((_, bit) => mask & 2 ** bit);
    if (edges.length !== wanted || components(g.v, edges).length !== count) continue;
    const cost = sum(edges);
    if (count === 1) spanningTrees.push({edges, total: cost});
    if (cost < best) { best = cost; winners.length = 0; }
    if (cost === best) winners.push(edges);
  }
  return {count, wanted, best, winners, spanningTrees};
}
function verifyMst(g) {
  mstCases++; const before = serial(g), oracle = minimumForest(g);
  const frames = trees.kruskal(g), result = frames.at(-1);
  eq(result.total, oracle.best, 'Kruskal equals minimum-cost forest by independent subset enumeration');
  eq(result.chosen.length, oracle.wanted, 'A minimum forest has V minus component-count edges');
  ok(oracle.winners.some(e => treeKey(e) === treeKey(result.chosen)), 'The selected forest is an optimum candidate');
  eq(result.title, oracle.count === 1 ? 'Minimum spanning tree complete' : 'Disconnected: minimum spanning forest',
    'A disconnected forest is never labeled a whole-graph MST');
  let previous = [];
  for (const frame of frames) {
    eq(frame.total, sum(frame.chosen), 'Every displayed total equals the chosen edge weights');
    eq(frame.chosen.slice(0, previous.length), previous, 'Accepted edges are never removed by Kruskal');
    ok(frame.chosen.length - previous.length <= 1, 'One edge event accepts at most one cable');
    eq(frame.chosen.length + components(g.v, frame.chosen).length, g.v.length,
      'Every intermediate chosen graph is acyclic');
    members(frame.components.map(sorted).map(serial), components(g.v, frame.chosen).map(sorted).map(serial),
      'The displayed components equal independent reachability through selected cables');
    previous = frame.chosen;
  }
  const enumerated = trees.enumerate(g);
  eq(enumerated.best, oracle.count === 1 ? oracle.best : null, 'Tree enumeration rejects disconnected graphs');
  eq(enumerated.trees.length, oracle.spanningTrees.length, 'Enumeration finds every spanning tree once');
  members(enumerated.trees.map(t => treeKey(t.edges)), oracle.spanningTrees.map(t => treeKey(t.edges)),
    'The enumeration has exactly the independently connected subsets');
  if (oracle.count === 1) eq(enumerated.winners.length, oracle.winners.length,
    'Equal weights produce exactly the genuine minimum trees');
  for (const start of g.v) {
    primCases++;
    const group = components(g.v, g.e).find(c => c.includes(start));
    const sub = {v: group, e: g.e.filter(([u, v]) => group.includes(u) && group.includes(v))};
    const trace = trees.prim(g, start), final = trace.at(-1);
    eq(final.total, minimumForest(sub).best, 'Prim is minimum on the component reachable from its start');
    members(final.inside, group, 'Prim spans exactly its reachable component');
    eq(final.chosen.length, group.length - 1, 'Prim has one edge per newly reached vertex');
    eq(final.title, group.length === g.v.length ? 'Prim complete' : 'Cannot span this graph',
      'Prim explicitly refuses a whole-graph MST when vertices are unreachable');
    for (let i = 1; i < trace.length; i++) {
      const old = trace[i - 1], next = trace[i];
      if (next.chosen.length === old.chosen.length) continue;
      const edge = next.chosen.at(-1), inside = new Set(old.inside);
      ok(inside.has(edge[0]) !== inside.has(edge[1]), 'Every added Prim edge crosses the previous boundary');
      eq(edge[2], Math.min(...g.e.filter(([u, v]) => inside.has(u) !== inside.has(v)).map(e => e[2])),
        'The selected boundary edge has the minimum available cost');
    }
  }
  eq(serial(g), before, 'MST helpers preserve their caller graph');
  return result;
}

function verifyUnionFind(n) {
  unionCases++; const vertices = Array.from({length: n}, (_, i) => i + 1);
  const d = trees.uf(vertices), joins = [];
  for (let step = 0; step < 3 * n; step++) {
    const a = vertices[(step * 7 + 1) % n], b = vertices[(step * 3 + 2) % n];
    const same = components(vertices, joins).some(g => g.includes(a) && g.includes(b));
    eq(d.union(a, b), !same, 'Union merges exactly previously distinct components'); joins.push([a, b]);
    const groups = components(vertices, joins);
    members(d.groups().map(sorted).map(serial), groups.map(sorted).map(serial), 'Groups match independent connectivity');
    for (const group of groups) {
      const leader = d.find(group[0], false);
      eq(d.size[leader], group.length, 'Each current root stores its actual component size');
      for (const v of group) {
        eq(d.find(v, false), leader, 'Find returns the same root throughout a component');
        const saved = serial(d.parent); d.find(v, false);
        eq(serial(d.parent), saved, 'find(compress=false) preserves every parent');
        let cursor = v, depth = 0;
        while (d.parent[cursor] !== cursor && depth <= n) { cursor = d.parent[cursor]; depth++; }
        ok(depth <= Math.floor(Math.log2(n)), 'Union by size bounds depth by floor(log2 n), even before compression');
      }
    }
  }
}

function allArcs(g) {
  return g.directed ? g.e : g.e.flatMap(([u, v, w]) => [[u, v, w], [v, u, w]]);
}
function routeOracle(g) {
  const adj = Object.fromEntries(g.v.map(v => [v, []]));
  for (const [u, v, w] of allArcs(g)) adj[u].push([v, w]);
  const costs = {}, reachable = {}, negative = new Set();
  for (const source of g.v) {
    const dist = Object.fromEntries(g.v.map(v => [v, v === source ? 0 : Infinity]));
    function walk(u, used, cost) {
      for (const [v, w] of adj[u]) {
        if (v === source && cost + w < 0) negative.add(source);
        if (used.has(v)) continue;
        dist[v] = Math.min(dist[v], cost + w);
        walk(v, new Set([...used, v]), cost + w);
      }
    }
    walk(source, new Set([source]), 0);
    costs[source] = dist;
    reachable[source] = new Set(g.v.filter(v => Number.isFinite(dist[v])));
  }
  const affected = {};
  for (const source of g.v) {
    affected[source] = new Set(g.v.filter(v => [...negative].some(c =>
      reachable[source].has(c) && reachable[c].has(v))));
    for (const v of affected[source]) costs[source][v] = -Infinity;
  }
  return {costs, reachable, affected};
}
function verifyParents(g, source, result, expected) {
  const arcs = allArcs(g);
  for (const v of g.v) {
    eq(result.distance[v], expected[v], 'The distance agrees with independently enumerated routes and negative cycles');
    if (!Number.isFinite(expected[v])) {
      eq(result.parent[v], null, 'Unreachable or unbounded destinations have no finite path parent');
      continue;
    }
    if (v === source) { eq(result.parent[v], null, 'The finite source has no predecessor'); continue; }
    let cursor = v, steps = 0, cost = 0;
    while (cursor !== source && steps <= g.v.length) {
      const parent = result.parent[cursor];
      const edge = arcs.find(([u, target, w]) => u === parent && target === cursor &&
        result.distance[u] + w === result.distance[cursor]);
      ok(Boolean(edge), 'A finite parent link is an actual tight edge');
      cost += edge[2]; cursor = parent; steps++;
    }
    eq(cursor, source, 'Every finite parent chain terminates at the source');
    ok(steps < g.v.length, 'The finite parent route is simple');
    eq(cost, expected[v], 'The reconstructed parent route has the independent minimum cost');
  }
}
function verifyShortest(g, testDag = false) {
  const oracle = routeOracle(g), before = serial(g), nonnegative = g.e.every(e => e[2] >= 0);
  for (const source of g.v) {
    bellmanCases++;
    const bellman = routes.bellman(g, source), result = bellman.at(-1);
    verifyParents(g, source, result, oracle.costs[source]);
    members(result.affected, oracle.affected[source], 'Bellman–Ford marks exactly the destinations downstream of reachable negative cycles');
    eq(result.title, oracle.affected[source].size ? 'Reachable negative cycle detected' : 'Bellman–Ford complete',
      'Only a reachable negative cycle makes source distances unbounded');
    if (nonnegative) {
      dijkstraCases++; const trace = routes.dijkstra(g, source), final = trace.at(-1);
      verifyParents(g, source, final, oracle.costs[source]);
      members(final.settled, oracle.reachable[source], 'Every reachable vertex is settled exactly once');
      eq(new Set(final.settled).size, final.settled.length, 'Stale offers cannot settle a vertex twice');
      eq(final.settled.map(v => final.distance[v]), final.settled.map(v => final.distance[v]).slice().sort((a, b) => a - b),
        'Finalized Dijkstra costs are nondecreasing');
      for (const frame of trace) for (const v of frame.settled)
        eq(frame.distance[v], final.distance[v], 'A settled distance never changes later');
    } else {
      assert.throws(() => routes.dijkstra(g, source), /nonnegative/, 'Dijkstra rejects even an unreachable negative edge');
      assertions++;
    }
    if (testDag) {
      dagCases++; const trace = routes.dagTrace(g, source), final = trace.at(-1);
      eq(final.distance, oracle.costs[source], 'DAG relaxation agrees with independent paths, including negative costs');
    }
  }
  floydCases++; const matrix = routes.floyd(g).at(-1).matrix;
  eq(matrix.some((row, i) => row[i] < 0), g.v.some(v => oracle.affected[v].has(v)),
    'Some negative Floyd diagonal exists exactly when the graph has a negative cycle');
  for (let i = 0; i < g.v.length; i++) {
    const source = g.v[i];
    if (matrix[i][i] < 0) ok(oracle.affected[source].has(source),
      'A negative Floyd diagonal is genuine evidence of an unbounded closed walk');
    for (let j = 0; j < g.v.length; j++) if (!oracle.affected[source].has(g.v[j]))
      eq(matrix[i][j], oracle.costs[source][g.v[j]], 'Every bounded Floyd entry equals independently enumerated simple paths');
  }
  eq(serial(g), before, 'Shortest-path traces preserve their caller graph');
  return oracle;
}

// All weighted simple undirected graphs through three vertices; absent, negative,
// zero, tied and positive edge weights. Four-node graphs cover every edge subset.
for (let n = 1; n <= 3; n++) {
  const v = [...'ABC'.slice(0, n)], possible = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) possible.push([v[i], v[j]]);
  for (let code = 0; code < 5 ** possible.length; code++) {
    let digits = code; const e = [];
    for (const pair of possible) { const digit = digits % 5; digits = Math.floor(digits / 5); if (digit) e.push([...pair, [-2, 0, 2, 3][digit - 1]]); }
    verifyMst({v, e});
  }
}
const pairs = [['A','B'],['A','C'],['A','D'],['B','C'],['B','D'],['C','D']];
for (let mask = 0; mask < 64; mask++) for (let pattern = 0; pattern < 4; pattern++)
  verifyMst({v: [...'ABCD'], e: pairs.flatMap((p, i) => mask & 2 ** i ? [[...p, [-2, 0, 2, 3][(i + pattern) % 4]]] : [])});
for (let n = 1; n <= 12; n++) verifyUnionFind(n);
const compress = trees.uf([1,2,3,4,5,6,7,8]);
for (let i = 2; i <= 8; i++) compress.parent[i] = i - 1;
eq(compress.find(8, false), 1, 'Find can follow a valid seven-link parent chain');
eq(compress.parent[8], 7, 'Noncompressing find leaves the long chain intact');
eq(compress.find(8), 1, 'Full compression returns the same representative');
for (let i = 2; i <= 8; i++) eq(compress.parent[i], 1, 'Full compression redirects every followed node to its root');
const unionTrace = trees.unionTrace();
eq(unionTrace[3].parent[4], 3, 'The worked union-by-size trace first leaves 4 → 3 → 1');
eq(unionTrace[4].parent[4], 1, 'The worked find(4) compresses 4 directly to 1');
eq(unionTrace.at(-1).parent, unionTrace.at(-2).parent, 'Repeating a union inside one group leaves the partition unchanged');

// Every directed edge subset on three vertices under three weight assignments;
// the signed assignments include reachable and unreachable negative cycles.
const directedPairs = [];
for (const u of 'ABC') for (const v of 'ABC') if (u !== v) directedPairs.push([u, v]);
for (let mask = 0; mask < 64; mask++) for (let pattern = 0; pattern < 3; pattern++) {
  const weights = pattern === 0 ? [0, 1, 3, 0, 2, 4] : pattern === 1 ? [-2, 1, 3, -1, 0, 2] : [2, -3, 0, 1, -2, 4];
  verifyShortest({v: [...'ABC'], e: directedPairs.flatMap((p, i) => mask & 2 ** i ? [[...p, weights[i]]] : []), directed: true});
}
// Every four-node DAG edge subset, with positive, zero and negative costs.
for (let mask = 0; mask < 64; mask++) for (let pattern = 0; pattern < 3; pattern++)
  verifyShortest({v: [...'ABCD'], e: pairs.flatMap((p, i) => mask & 2 ** i ? [[...p, [-3, 0, 2][(i + pattern) % 3]]] : []), directed: true}, true);
for (let mask = 0; mask < 8; mask++) for (let pattern = 0; pattern < 3; pattern++)
  verifyShortest({v: [...'ABC'], e: [['A','B'],['A','C'],['B','C']].flatMap((p, i) => mask & 2 ** i ? [[...p, [0, 2, -1][(i + pattern) % 3]]] : []), directed: false});
for (const g of [
  {v: [...'ABCDE'], e: [['A','B',1],['B','C',-3],['C','B',1],['C','D',2]], directed:true},
  {v: [...'ABCDE'], e: [['A','D',2],['B','C',-3],['C','B',1]], directed:true},
  {v: [...'ABCDE'], e: [['A','B',4],['A','C',1],['B','C',2],['B','D',5],['C','D',8],['D','E',3],['C','E',10]], directed:false},
  {v: ['A'], e: [], directed:true},
]) verifyShortest(g);
const cyclicDag = routes.dagTrace({v: [...'ABC'], e: [['A','B',1],['B','C',2],['C','A',0]], directed:true});
eq(cyclicDag.length, 1, 'Cyclic inputs have no fake topological relaxation trace');
eq(cyclicDag[0].title, 'Not a DAG', 'DAG shortest paths explicitly reject directed cycles');

const common = {v: [...'ABC'], e: [['A','B',2],['B','C',2],['A','C',3]], directed:false};
eq(verifyMst(common).total, 4, 'The shared sensor network minimum installed cost is 4');
const commonPaths = verifyShortest(common);
eq(commonPaths.costs.A.C, 3, 'The same sensor network shortest A-to-C route costs 3');
eq(routes.dijkstra(common, 'A').at(-1).parent.C, 'A', 'A direct C parent distinguishes shortest paths from the MST detour');
eq(routes.dijkstra({v: [...'ABC'], e: [['A','B',7],['A','C',1],['C','B',1]], directed:true}, 'A')
  .filter(f => f.title.startsWith('Skip stale')).length, 1, 'An improved route leaves one old queue offer that must be skipped');

// Enumerate all simple grid routes independently: entry fees exclude the start
// and include the goal. BFS minimizes moves; Dijkstra/A* minimize terrain cost.
const fees = [1,8,1,3,3,1], gridPaths = [];
function gridWalk(route, cost) {
  const u = route.at(-1);
  if (u === 2) { gridPaths.push({path: route, cost}); return; }
  for (let v = 0; v < 6; v++) if (!route.includes(v) &&
    Math.abs(Math.floor(u / 3) - Math.floor(v / 3)) + Math.abs(u % 3 - v % 3) === 1)
    gridWalk([...route, v], cost + fees[v]);
}
gridWalk([0], 0);
const optimal = Math.min(...gridPaths.map(p => p.cost)), fewest = Math.min(...gridPaths.map(p => p.path.length - 1));
for (const mode of ['bfs', 'dijkstra', 'astar']) {
  const result = routes.grid(mode);
  ok(gridPaths.some(p => serial(p.path) === serial(result.path)), 'Every grid result is a valid simple route from start to goal');
  eq(result.cost, result.path.slice(1).reduce((a, v) => a + fees[v], 0), 'Grid cost includes every entered cell, including the goal and excluding the start');
  eq(new Set(result.order).size, result.order.length, 'A grid cell is expanded at most once');
  if (mode === 'bfs') eq(result.path.length - 1, fewest, 'BFS takes the fewest moves');
  else eq(result.cost, optimal, `${mode} takes the independently cheapest terrain route`);
}
eq(routes.grid('bfs').cost, 9, 'The two-move BFS route pays 8 + 1 = 9');
eq(optimal, 8, 'The cheaper four-move route pays 3 + 3 + 1 + 1 = 8');
const heuristic = i => Math.abs(Math.floor(i / 3)) + Math.abs(i % 3 - 2);
eq(Array.from({length: 6}, (_, i) => heuristic(i)), [2,1,0,3,2,1], 'The displayed Manhattan estimates match the actual grid');
for (let u = 0; u < 6; u++) for (let v = 0; v < 6; v++) if (
  Math.abs(Math.floor(u / 3) - Math.floor(v / 3)) + Math.abs(u % 3 - v % 3) === 1)
  ok(heuristic(u) <= fees[v] + heuristic(v), 'The A* heuristic is consistent with every directed entry-cost move');

console.log(`PASS ${assertions.toLocaleString()} assertions: ${mstCases} Kruskal/enumeration cases, ${primCases} Prim traces, ${unionCases} union-find sequences, ${dijkstraCases} Dijkstra, ${bellmanCases} Bellman–Ford, ${dagCases} DAG and ${floydCases} Floyd traces; independent edge-subset/simple-path/simple-cycle oracles; signed/zero/tied/disconnected inputs; negative-cycle reachability; parent reconstruction; stale offers; shared sensor MST=4 versus route=3; independent grid/BFS/Dijkstra/A* costs.`);
console.log('Limits: the Floyd widget diagnoses negative cycles through a negative diagonal; it does not annotate affected pairs with −∞. Tests compare exact distances only for bounded/unreachable pairs. UI input validation, step controls, Python runner and responsive rendering need the separate browser suite.');
