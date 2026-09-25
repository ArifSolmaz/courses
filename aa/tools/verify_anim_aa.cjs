/* Checks the pure computations behind assets/anim-aa.js against hand-computed fixtures.
   Run: node tools/verify_anim_aa.cjs */
const path = require('node:path');
const assert = require('node:assert/strict');
const A = require(path.join(__dirname, '../assets/anim-aa.js'));
let checks = 0;
function equal(actual, expected, what) { assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), what); checks++; }

// 1. growth: 2^n overtakes n² at n = 5 (32 > 25); with c = 10, at n = 10 (1024 > 1000)
equal(A.growthCross(1), 5); equal(A.growthCross(10), 10); equal(A.growthCross(1000), 19);
equal(A.growthRow(8).sq, 64); equal(A.growthRow(8).exp, '256'); equal(A.growthRow(64).exp, '18446744073709551616');
assert(Math.abs(A.growthRow(8).nlog - 24) < 1e-9); checks++;

// 2. triangular loop
for (let n = 0; n <= 20; n++) { equal(A.nestedCells(n).length, n * (n + 1) / 2); equal(A.triangular(n), n * (n + 1) / 2); }
equal(A.nestedCells(3), [[1, 1], [2, 1], [2, 2], [3, 1], [3, 2], [3, 3]]);

// 3. front insertion
equal(A.insertCost(6), { arrayMoves: 7, listWrites: 2 }); equal(A.insertCost(16).listWrites, 2);

// 4. linear probing: keys [10,15,3,20] mod 5 -> positions [0,1,3,2]
{
  const r = A.probeInsert([10, 15, 3, 20], 5);
  equal(r.steps.map(s => s.pos), [0, 1, 3, 2]);
  equal(r.steps[1].probes, [0, 1]);                     // 15 collides with 10 at slot 0
  equal(r.steps[3].probes, [0, 1, 2]);                  // 20: 0 taken, 1 taken, 2 free
  equal(r.slots, [10, 15, 20, 3, null]);
  equal(A.probeLookup(r.slots, 20), { probes: [0, 1, 2], found: true, pos: 2 });
  equal(A.probeLookup(r.slots, 9), { probes: [4], found: false, pos: null });
  equal(A.probeLookup(r.slots, 5).found, false);        // 5 mod 5 = 0: walks to the empty slot 4
  equal(A.probeLookup(r.slots, 5).probes, [0, 1, 2, 3, 4]);
  const full = A.probeInsert([1, 2, 3, 4], 3);
  equal(full.steps[3].pos, null);                       // table full: cannot store
}

// 5. heap: five inserts [9,4,7,1,8] -> [1,4,7,9,8]; extract-min twice
{
  const a = [null];
  const swaps = [9, 4, 7, 1, 8].map(v => A.heapInsert(a, v).length);
  equal(a, [null, 1, 4, 7, 9, 8]); equal(swaps, [0, 1, 0, 2, 0]);
  let r = A.heapExtractMin(a); equal(r.min, 1); equal(a, [null, 4, 8, 7, 9]); equal(r.swaps, [[1, 2]]);
  r = A.heapExtractMin(a); equal(r.min, 4); equal(a, [null, 7, 8, 9]); equal(r.swaps, [[1, 3]]);
  // random heaps stay heaps and extract in sorted order
  for (let t = 0; t < 200; t++) {
    const b = [null], vals = Array.from({ length: 1 + (t % 12) }, () => Math.floor(Math.random() * 50));
    vals.forEach(v => A.heapInsert(b, v));
    for (let i = 2; i < b.length; i++) { assert(b[i >> 1] <= b[i]); checks++; }
    const out = []; while (b.length > 1) out.push(A.heapExtractMin(b).min);
    equal(out, vals.slice().sort((x, y) => x - y));
  }
  equal(A.heapExtractMin([null]), { min: null, swaps: [] });
}

// 6. BFS on a 6x8 grid with a vertical wall in column 2 (rows 0-4): shortest path goes round the bottom
{
  const R = 6, C = 8, walls = Array(R * C).fill(false);
  for (let r = 0; r < 5; r++) walls[r * C + 2] = true;
  const res = A.bfsGrid(walls, R, C, 0);
  equal(res.dist[1], 1); equal(res.dist[2], -1);        // wall never reached
  equal(res.dist[5 * C + 2], 7);                        // (5,2): down 5, right 2
  equal(res.dist[3], 13);                               // (0,3): down 5, right 3, up 5 round the wall
  equal(res.dist[R * C - 1], 12);                       // (5,7): 5 + 7
  const p = A.pathTo(res.parent, R * C - 1);
  equal(p[0], 0); equal(p.length, 13);
  for (let i = 1; i < p.length; i++) { const d = Math.abs(p[i] - p[i - 1]); assert(d === 1 || d === C); checks++; }
  const open = A.bfsGrid(Array(R * C).fill(false), R, C, 0);
  for (let id = 0; id < R * C; id++) equal(open.dist[id], Math.floor(id / C) + id % C);
  equal(open.order.length, R * C);
}
// Dijkstra: 2x3 grid, costs [[1,5,1],[1,1,1]], source 0: dist to (0,2) = 4 (round the bottom), not 6
{
  const res = A.dijkstraGrid([1, 5, 1, 1, 1, 1], 2, 3, 0);
  equal(res.dist, [0, 5, 4, 1, 2, 3]); equal(A.pathTo(res.parent, 2), [0, 3, 4, 5, 2]);
  equal(res.order, [0, 3, 4, 5, 2, 1]);
  const wall = A.dijkstraGrid([1, 0, 1, 1, 0, 1], 2, 3, 0);
  equal(wall.dist[2], Infinity);
  // agrees with BFS when every cost is 1
  const R = 6, C = 8, walls = Array(R * C).fill(false); [10, 18, 26, 34].forEach(w => walls[w] = true);
  const b = A.bfsGrid(walls, R, C, 0), d = A.dijkstraGrid(walls.map(w => w ? 0 : 1), R, C, 0);
  for (let id = 0; id < R * C; id++) equal(b.dist[id] < 0 ? Infinity : b.dist[id], d.dist[id]);
}

// 7. recursion tree: a=2,b=2,d=1 at n=8 -> every level costs 8, four levels, total 32, case 2
{
  const r = A.recTree(2, 2, 1, 3);
  equal(r.n, 8); equal(r.levels.map(L => L.cost), [8, 8, 8, 8]); equal(r.total, 32); equal(r.kase, 2);
  equal(A.recTree(4, 2, 1, 3).kase, 3); equal(A.recTree(4, 2, 1, 3).total, 8 + 16 + 32 + 64);
  equal(A.recTree(1, 2, 1, 3).kase, 1); equal(A.recTree(1, 2, 1, 3).total, 8 + 4 + 2 + 1);
  equal(A.recTree(1, 2, 0, 3).kase, 2);                 // binary search: Θ(log n)
  equal(A.recTree(3, 2, 1, 2).levels.map(L => L.count), [1, 3, 9]);
}

// 8. edit distance
equal(A.editDistance('cat', 'cut').dist, 1);
equal(A.editDistance('kitten', 'sitting').dist, 3);
equal(A.editDistance('', 'abc').dist, 3); equal(A.editDistance('abc', 'abc').dist, 0);
equal(A.editDistance('thou shalt', 'you should').dist, 5);
equal(A.editDistance('cat', 'cut').D, [[0, 1, 2, 3], [1, 0, 1, 2], [2, 1, 1, 2], [3, 2, 2, 1]]);

// 9. Kruskal on the widget's graph: MST weight 39 with 6 edges
{
  const E = [[0, 1, 7], [0, 3, 5], [1, 2, 8], [1, 3, 9], [1, 4, 7], [2, 4, 5], [3, 4, 15], [3, 6, 6], [4, 6, 8], [4, 5, 9], [5, 6, 11]];
  const r = A.kruskal(7, E);
  equal(r.total, 39); equal(r.steps.filter(s => s.accepted).length, 6);
  equal(r.steps.map(s => s.accepted), [true, true, true, true, true, false, false, false, true, false, false]);
  equal(new Set(r.steps.at(-1).sets).size, 1);
}

console.log(`${checks.toLocaleString()} assertions passed: growth crossover, triangular loop, insertion costs, linear probing, heap ops, BFS/Dijkstra grids, recursion trees, edit distance, Kruskal.`);
