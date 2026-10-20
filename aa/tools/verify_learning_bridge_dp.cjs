/* Verify the real Week 12–13 visual models without changing production files.
 * Run: node aa/tools/verify_learning_bridge_dp.cjs
 * Oracles enumerate concrete choices, edit operations and alignment paths rather
 * than repeating the displayed dynamic-programming recurrences. No dependency
 * or browser is required. Browser interaction/mobile checks are separate.
 * Parameterized tests check numeric helper contracts; only edit has a custom
 * input UI. Fixed-caption demonstrations are additionally checked at their UI
 * defaults. Overshoot pruning is valid only for nonnegative remaining values;
 * sequence partitioning is tested on its nonnegative-load teaching domain.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
let assertions = 0;
const cases = {subsets: 0, permutations: 0, queens: 0, sudoku: 0,
  fibonacci: 0, recurrences: 0, binomial: 0, exactWalk: 0, grids: 0,
  decisions: 0, edits: 0, coins: 0, lcs: 0, lis: 0, shuffles: 0,
  knapsacks: 0, schedules: 0, kadane: 0, eggs: 0, cuts: 0,
  fuel: 0, partitions: 0, dtw: 0, scenes: 0, staticCards: 0};
const serial = value => JSON.stringify(value, (_, x) =>
  typeof x === 'number' && !Number.isFinite(x) ? String(x) : x);
function eq(actual, expected, message) {
  assert.equal(serial(actual), serial(expected), message); assertions++;
}
function ok(condition, message) { assert.ok(condition, message); assertions++; }
function helpers(week, names) {
  const source = fs.readFileSync(path.join(root, `aa/w${week}/examples/visuals.js`), 'utf8');
  const marker = 'return {has:';
  assert.equal(source.split(marker).length, 2, `Week ${week}: exactly one module boundary`);
  const context = {};
  vm.runInNewContext(source.replace(marker,
    `globalThis.audit={${names.join(',')}};${marker}`), context, {timeout: 3000});
  return context.audit;
}
const search = helpers(12, ['subsets', 'permutations', 'queens', 'sudoku',
  'fibTrace', 'recurrence', 'binomial', 'exactWalk', 'gridFrames', 'decision', 'scenarios']);
const dp = helpers(13, ['edit', 'coins', 'lcs', 'lis', 'shuffle', 'knapsack',
  'schedule', 'kadane', 'eggs', 'cuts', 'fuel', 'partition', 'dtw', 'scenarios']);
const sorted = values => Array.from(values).sort();
const memberKeys = values => sorted(values.map(value => serial(value)));
function arrays(alphabet, max, min = 0) {
  const result = min === 0 ? [[]] : [];
  let level = [[]];
  for (let n = 1; n <= max; n++) {
    level = level.flatMap(a => alphabet.map(x => [...a, x]));
    if (n >= min) result.push(...level);
  }
  return result;
}
const words = (alphabet, max) => arrays([...alphabet], max).map(a => a.join(''));
const indexSubsets = n => Array.from({length: 2 ** n}, (_, mask) =>
  Array.from({length: n}, (_, i) => i).filter(i => mask & 2 ** i));
const choose = (n, k) => {
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - i + 1) / i;
  return Math.round(value);
};

// A flat list of completed take/skip assignments is independent of recursion
// traversal order and of the production overshoot pruning rule.
for (const values of arrays([0, 1, 2, 3], 5)) {
  const all = indexSubsets(values.length);
  const plain = search.subsets(values);
  cases.subsets++;
  eq(memberKeys(plain.answers), memberKeys(all), 'Unfiltered search visits each positional subset once, including empty');
  eq(plain.calls, 2 ** (values.length + 1) - 1, 'A full binary decision tree counts every entered recursive call');
  for (let target = 0; target <= 8; target++) {
    cases.subsets++;
    const expected = all.filter(indices => indices.reduce((sum, i) => sum + values[i], 0) === target);
    const full = search.subsets(values, target), pruned = search.subsets(values, target, true);
    eq(memberKeys(full.answers), memberKeys(expected), 'Exact-fit search agrees with flat subset enumeration');
    eq(memberKeys(pruned.answers), memberKeys(expected), 'Nonnegative overshoot pruning preserves every solution');
    ok(pruned.calls <= full.calls, 'Valid overshoot pruning never increases the number of entered calls');
  }
}
{
  const values = [5, 4, -3, 2], full = search.subsets(values, 6), unsafe = search.subsets(values, 6, true);
  const repair = serial([0, 1, 2]);
  ok(memberKeys(full.answers).includes(repair), 'A negative later value can repair an overshoot');
  ok(!memberKeys(unsafe.answers).includes(repair), 'The unsafe demonstration actually discards the valid repaired branch');
  ok(full.answers.length > unsafe.answers.length, 'Pruning with negative future values can lose valid answers');
}

// Enumerate all index orders and deduplicate their observable values.
function permutationOracle(values) {
  const out = new Set();
  function visit(prefix, rest) {
    if (!rest.length) out.add(serial(prefix.map(i => values[i])));
    else for (const i of rest) visit([...prefix, i], rest.filter(j => i !== j));
  }
  visit([], values.map((_, i) => i)); return sorted(out);
}
for (const values of arrays(['A', 'B', 'C'], 5)) {
  cases.permutations++;
  const result = search.permutations(values);
  eq(memberKeys(result), permutationOracle(values), 'Equal-valued tasks create distinct value orders exactly once');
}
for (let n = 0; n <= 6; n++) {
  cases.permutations++;
  const labels = Array.from({length: n}, (_, i) => i + 1);
  const expected = permutationOracle(labels).filter(key => JSON.parse(key).every((x, i) => x !== i + 1));
  eq(memberKeys(search.permutations(labels, true)), expected, 'A derangement moves every numbered label away from its position');
}
{
  cases.queens++;
  const expected = permutationOracle([0, 1, 2, 3]).map(JSON.parse).filter(a =>
    a.every((x, i) => a.every((y, j) => i === j || Math.abs(x - y) !== Math.abs(i - j))));
  const result = search.queens().at(-1);
  eq(memberKeys(result.answers), memberKeys(expected), 'Four queens finds every nonattacking placement exactly once');
  eq(result.answers.length, 2, 'The four-queen default has the stated two solutions');
  cases.sudoku++;
  const given = [[1,0,0,4],[0,4,1,0],[2,1,0,3],[4,0,2,1]], solved = search.sudoku().at(-1).solution;
  for (let i = 0; i < 4; i++) {
    eq(sorted(solved[i]), [1,2,3,4], 'Every solved Sudoku row contains digits 1–4');
    eq(sorted(solved.map(row => row[i])), [1,2,3,4], 'Every solved Sudoku column contains digits 1–4');
    for (let j = 0; j < 4; j++) if (given[i][j]) eq(solved[i][j], given[i][j], 'No fixed Sudoku clue changes');
  }
  for (let r = 0; r < 4; r += 2) for (let c = 0; c < 4; c += 2)
    eq(sorted(solved.slice(r, r + 2).flatMap(row => row.slice(c, c + 2))), [1,2,3,4], 'Every Sudoku 2×2 box contains digits 1–4');
}
const stairCount = n => Array.from({length: Math.floor(n / 2) + 1}, (_, twos) => choose(n - twos, twos)).reduce((a,b) => a+b, 0);
for (let n = 0; n <= 10; n++) for (const memo of [false, true]) {
  cases.fibonacci++;
  const result = search.fibTrace(n, memo).at(-1), value = n ? stairCount(n - 1) : 0;
  eq(result.value, value, 'Fibonacci equals independently counted one/two-step compositions');
  eq(result.calls, memo ? n < 2 ? 1 : 2 * n - 1 : 2 * stairCount(n) - 1,
    'Displayed calls include every base case and every memo-cache hit');
}
for (let n = 0; n <= 20; n++) for (const stairs of [false, true]) {
  cases.recurrences++;
  const result = search.recurrence(n, stairs).at(-1).values;
  for (let i = 0; i <= n; i++) eq(result[i], stairs ? stairCount(i) : i ? stairCount(i - 1) : 0,
    'Bottom-up entries match an independent count of step compositions');
}
for (let n = 0; n <= 10; n++) {
  cases.binomial++;
  const rows = search.binomial(n).at(-1).rows;
  for (let i = 0; i <= n; i++) for (let k = 0; k <= i; k++)
    eq(rows[i][k], choose(i, k), 'Every Pascal entry equals the multiplicative binomial formula');
}
{
  cases.exactWalk++;
  // This original lab is directed AB:2, BC:3, AC:1, not the new undirected
  // sensor triangle AB:2, BC:2, AC:3. The bridge labels that distinction.
  eq(search.exactWalk().at(-1).rows, [[0,Infinity,Infinity],[Infinity,2,1],[Infinity,Infinity,5]],
    'The original walk lab distinguishes exactly zero, one and two directed edges');
}
function gridOracle(blocked, destination) {
  const r = Math.floor(destination / 4), c = destination % 4;
  let count = 0;
  function route(y, x) {
    if (blocked.has(y * 4 + x)) return;
    if (y === r && x === c) { count++; return; }
    if (y < r) route(y + 1, x);
    if (x < c) route(y, x + 1);
  }
  route(0, 0); return count;
}
for (let mask = 0; mask < 4096; mask++) {
  cases.grids++;
  const blocked = new Set(Array.from({length: 12}, (_, i) => i).filter(i => mask & 2 ** i));
  const result = search.gridFrames(blocked).at(-1).values;
  eq(result, Array.from({length: 12}, (_, i) => gridOracle(blocked, i)),
    'Every cell matches independently enumerated right/down routes for every obstacle pattern');
}
for (const values of arrays([0, 1, 3], 5, 1)) for (let target = 0; target <= 10; target++) {
  cases.decisions++;
  const frames = search.decision(values, target).slice(1);
  for (let i = 0; i < values.length; i++) {
    const totals = new Set(indexSubsets(i + 1).map(indices => indices.reduce((s, j) => s + values[j], 0)));
    eq(frames[i].reachable, Array.from({length: target + 1}, (_, t) => totals.has(t)),
      'Downward 0/1 subset updates match positional subsets of every processed prefix');
  }
}

// Breadth-first search over actual strings and single edit operations. This
// independent state space avoids reimplementing the production table formula.
const editCache = new Map();
function editDistance(s, t) {
  const alphabet = [...new Set([...s, ...t])].sort(), cap = Math.max(s.length, t.length);
  const key = serial([alphabet, cap, s]);
  if (!editCache.has(key)) {
    const distances = new Map([[s, 0]]), queue = [s];
    for (let i = 0; i < queue.length; i++) {
      const word = queue[i], neighbors = new Set();
      for (let j = 0; j < word.length; j++) {
        neighbors.add(word.slice(0, j) + word.slice(j + 1));
        for (const letter of alphabet) neighbors.add(word.slice(0, j) + letter + word.slice(j + 1));
      }
      if (word.length < cap) for (let j = 0; j <= word.length; j++) for (const letter of alphabet)
        neighbors.add(word.slice(0, j) + letter + word.slice(j));
      for (const next of neighbors) if (!distances.has(next)) {
        distances.set(next, distances.get(word) + 1); queue.push(next);
      }
    }
    editCache.set(key, distances);
  }
  return editCache.get(key).get(t);
}
const substrings = text => [...new Set(Array.from({length: text.length + 1}, (_, i) =>
  Array.from({length: text.length - i + 1}, (_, size) => text.slice(i, i + size))).flat())];
for (const source of words('ab', 3)) for (const target of words('ab', 3)) for (const approx of [false, true]) {
  cases.edits++;
  const result = dp.edit(source, target, approx).at(-1);
  const expected = approx ? Math.min(...substrings(target).map(t => editDistance(source, t))) : editDistance(source, target);
  eq(result.distance, expected, 'Full and approximate edit costs match shortest concrete edit-operation sequences');
  eq(result.alignment.map(pair => pair[0]).filter(x => x !== '—').join(''), source, 'Traceback consumes the whole source in its original order');
  const recovered = result.alignment.map(pair => pair[1]).filter(x => x !== '—').join('');
  eq(recovered, approx ? result.substring : target, 'Traceback reconstructs the chosen target or substring');
  ok(target.includes(result.substring), 'Approximate traceback selects a genuine contiguous text substring');
  eq(result.operations.filter(op => !op.startsWith('Match ')).length, expected, 'The visible edit operations have exactly the optimal unit cost');
  for (let i = 0; i <= source.length; i++) for (let j = 0; j <= target.length; j++) {
    const prefix = target.slice(0, j);
    const cost = approx ? Math.min(...Array.from({length: j + 1}, (_, start) => editDistance(source.slice(0, i), prefix.slice(start))))
      : editDistance(source.slice(0, i), prefix);
    eq(result.table[i][j], cost, 'Every boundary and interior edit-table cell has the correct prefix meaning');
  }
}
for (const [source, target, approx, expected] of [['cat','cut',false,1],['sun','snow',false,3],['cat','xxcutyy',true,1]]) {
  cases.edits++;
  eq(dp.edit(source, target, approx).at(-1).distance, expected, 'The original visible word examples retain their stated optimum');
  if (!approx) eq(editDistance(source, target), expected, 'The visible word example also matches concrete edit-operation BFS');
}
function coinOracle(coins, target) {
  let best = Infinity;
  function counts(i, left, used) {
    if (left === 0) best = Math.min(best, used);
    if (i === coins.length) return;
    for (let n = 0; n * coins[i] <= left; n++) counts(i + 1, left - n * coins[i], used + n);
  }
  counts(0, target, 0); return best;
}
for (const cs of [[],[1],[2],[1,3,4],[2,3],[3,5],[1,1,3]]) for (let target = 0; target <= 20; target++) {
  cases.coins++;
  eq(dp.coins(cs, target).at(-1).values, Array.from({length: target + 1}, (_, t) => coinOracle(cs, t)),
    'Unlimited positive-denomination coin counts match enumeration of denomination multiplicities');
}
function isSubsequence(candidate, sequence) {
  let i = 0; for (const x of sequence) if (candidate[i] === x) i++;
  return i === candidate.length;
}
for (const source of words('ab', 4)) for (const target of words('ab', 4)) {
  cases.lcs++;
  const lengths = indexSubsets(source.length).map(indices => indices.map(i => source[i]).join(''))
    .filter(s => isSubsequence(s, target)).map(s => s.length);
  const result = dp.lcs(source, target).at(-1);
  eq(result.length, Math.max(...lengths), 'LCS length matches independent subsequence enumeration');
  eq(result.sequence.length, result.length, 'The recovered LCS has the reported length');
  ok(isSubsequence(result.sequence, source) && isSubsequence(result.sequence, target), 'The recovered LCS occurs in order in both original words');
}
function increasingOracle(a) {
  return Math.max(0, ...indexSubsets(a.length).map(indices => indices.map(i => a[i]))
    .filter(xs => xs.every((x, i) => !i || xs[i - 1] < x)).map(xs => xs.length));
}
for (const a of arrays([-1, 0, 1, 2], 6, 1)) {
  cases.lis++;
  const result = dp.lis(a).at(-1);
  eq(result.length, increasingOracle(a), 'LIS is strictly increasing and agrees with all positional subsequences');
  for (let i = 0; i < a.length; i++) {
    const ending = indexSubsets(i).map(indices => [...indices.map(j => a[j]), a[i]])
      .filter(xs => xs.every((x, j) => !j || xs[j - 1] < x)).map(xs => xs.length);
    eq(result.values[i], Math.max(...ending), 'Each LIS state is the best subsequence ending at that exact position');
  }
}
function interleavings(x, y) {
  if (!x.length) return new Set([y]); if (!y.length) return new Set([x]);
  return new Set([...interleavings(x.slice(1), y)].map(s => x[0] + s)
    .concat([...interleavings(x, y.slice(1))].map(s => y[0] + s)));
}
for (const x of words('ab', 2)) for (const y of words('ab', 2)) {
  const valid = interleavings(x, y);
  for (const z of words('ab', 4)) {
    cases.shuffles++;
    eq(dp.shuffle(x, y, z).valid, valid.has(z), 'Shuffle membership preserves both input orders and exact output length');
  }
}
function knapsackOracle(items, capacity) {
  return Math.max(0, ...indexSubsets(items.length).map(indices => indices.reduce((r, i) =>
    [r[0] + items[i][0], r[1] + items[i][1]], [0,0])).filter(([weight]) => weight <= capacity).map(([,value]) => value));
}
for (let code = 0; code < 256; code++) {
  const length = code % 4 + 1, items = Array.from({length}, (_, i) =>
    [(code * (i + 3) + i) % 5, (Math.floor(code / (i + 1)) + 3 * i) % 9 - 2]);
  for (let capacity = 0; capacity <= 8; capacity++) {
    cases.knapsacks++;
    const result = dp.knapsack(items, capacity).at(-1);
    eq(result.value, knapsackOracle(items, capacity), '0/1 knapsack matches every allowed item subset, including zero weights and negative values');
    for (let i = 0; i <= items.length; i++) for (let w = 0; w <= capacity; w++)
      eq(result.table[i][w], knapsackOracle(items.slice(0, i), w), 'Every knapsack row uses each processed item at most once');
  }
}
{
  cases.schedules++;
  const jobs = [{s:2,f:3,v:3},{s:4,f:5,v:4},{s:1,f:10,v:10}];
  const trace = dp.schedule();
  for (let i = 0; i < jobs.length; i++) {
    const best = Math.max(...indexSubsets(i + 1).filter(indices => indices.every((u, k) =>
      indices.every((v, j) => k === j || jobs[u].f <= jobs[v].s || jobs[v].f <= jobs[u].s)))
      .map(indices => indices.reduce((sum, j) => sum + jobs[j].v, 0)));
    eq(trace[i].values.at(-1), best, 'Weighted scheduling matches exhaustive nonoverlapping half-open intervals');
  }
}
for (const a of arrays([-2, -1, 0, 2], 6, 1)) {
  cases.kadane++;
  const result = dp.kadane(a);
  for (let i = 0; i < a.length; i++) {
    const ending = Array.from({length: i + 1}, (_, start) => a.slice(start, i + 1).reduce((s,x) => s+x, 0));
    const all = Array.from({length: i + 1}, (_, start) => Array.from({length: i - start + 1}, (_, len) =>
      a.slice(start, start + len + 1).reduce((s,x) => s+x, 0))).flat();
    eq(result[i].end, Math.max(...ending), 'Kadane ending-state matches every nonempty segment ending here');
    eq(result[i].best, Math.max(...all), 'Kadane global state matches all nonempty segments of the processed prefix');
  }
}
{
  cases.eggs++;
  let drops = 0; while (choose(drops, 1) + choose(drops, 2) < 10) drops++;
  eq(dp.eggs()[1].value, drops, 'Two-egg worst-case drops match the independently derived triangular floor coverage');
}
function cutOracle(length, cuts) {
  let best = Infinity;
  for (const order of permutationOracle(cuts).map(JSON.parse)) {
    let cost = 0; const boundaries = [0, length];
    for (const cut of order) {
      const left = Math.max(...boundaries.filter(x => x < cut)), right = Math.min(...boundaries.filter(x => x > cut));
      cost += right - left; boundaries.push(cut);
    }
    best = Math.min(best, cost);
  }
  return best;
}
for (let length = 2; length <= 8; length++) for (const indices of indexSubsets(length - 1)) {
  if (!indices.length || indices.length > 4) continue;
  cases.cuts++;
  const inside = indices.map(i => i + 1);
  eq(dp.cuts(length, inside).at(-1).value, cutOracle(length, inside), 'Interval cutting matches every physical chronological cut order');
}
{
  cases.fuel++;
  const positions = [0,40,70,120,150,190];
  const paths = indexSubsets(4).map(indices => [0, ...indices.map(i => i + 1), 5])
    .filter(indices => indices.every((v, i) => !i || positions[v] - positions[indices[i - 1]] <= 60));
  eq(dp.fuel().at(-1).legs, Math.min(...paths.map(a => a.length - 1)), 'Minimum fuel legs match every legal increasing stop sequence');
  eq(dp.fuel().at(-1).legs - 1, 4, 'A full departure tank makes five legs equal four intermediate refills');
}
function partitionOracle(a, groups) {
  const choices = indexSubsets(a.length - 1).filter(indices => indices.length === groups - 1);
  return Math.min(...choices.map(indices => {
    const ends = [...indices.map(i => i + 1), a.length]; let start = 0, largest = -Infinity;
    for (const end of ends) { largest = Math.max(largest, a.slice(start, end).reduce((s,x) => s+x, 0)); start = end; }
    return largest;
  }));
}
for (const a of arrays([0, 1, 3], 6, 1)) for (let groups = 1; groups <= a.length; groups++) {
  cases.partitions++;
  eq(dp.partition(a, groups).at(-1).value, partitionOracle(a, groups),
    'Nonnegative load partitioning matches every placement of exactly K−1 interior cuts');
}
function dtwOracle(a, b) {
  let best = Infinity;
  function route(i, j, cost) {
    cost += Math.abs(a[i] - b[j]);
    if (i === a.length - 1 && j === b.length - 1) { best = Math.min(best, cost); return; }
    if (i + 1 < a.length) route(i + 1, j, cost);
    if (j + 1 < b.length) route(i, j + 1, cost);
    if (i + 1 < a.length && j + 1 < b.length) route(i + 1, j + 1, cost);
  }
  route(0, 0, 0); return best;
}
const signals = arrays([0, 1, 3], 3, 1);
for (const a of signals) for (const b of signals) {
  cases.dtw++;
  eq(dp.dtw(a, b).at(-1).value, dtwOracle(a, b), 'DTW equals the minimum absolute-difference cost over every monotone alignment path');
}
eq(dp.dtw().at(-1).value, 0, 'The fixed default DTW caption correctly states its zero-cost alignment');

// Exercise all original card visuals at their actual authored default inputs.
for (const [week, models] of [[12, search], [13, dp]]) {
  const source = fs.readFileSync(path.join(root, `aa/w${week}/examples/cards.js`), 'utf8');
  const context = {}; vm.runInNewContext(source + '\nglobalThis.cardAudit=cards;', context);
  for (const card of context.cardAudit) {
    if (card.visual === null) {
      cases.staticCards++;
      ok(typeof card.question === 'string' && typeof card.answer === 'string',
        `Week ${week} card ${card.id} intentionally contains a static question and answer`);
      continue;
    }
    ok(typeof models.scenarios[card.visual] === 'function', `Week ${week} card ${card.id} names a supported visual`);
    const frames = models.scenarios[card.visual](); cases.scenes++;
    ok(Array.isArray(frames) && frames.length > 0, `Week ${week} card ${card.id} has computed visual frames`);
    for (const frame of frames) {
      ok(typeof frame.title === 'string' && typeof frame.html === 'string' && typeof frame.caption === 'string',
        `Week ${week} card ${card.id} exposes complete title, picture and caption`);
      ok(!/\b(?:NaN|undefined)\b/.test(frame.title + frame.html + frame.caption),
        `Week ${week} card ${card.id} never displays missing or invalid numeric values`);
    }
  }
}
console.log(JSON.stringify({status: 'passed', assertions, cases,
  scope: 'Production numeric models; authored default scenes; browser/mobile and Python bridge checks run separately.',
  limits: ['Overshoot-pruning correctness requires nonnegative remaining values; the negative counterexample intentionally loses a solution.',
    'Partition inputs are nonnegative loads with 1 ≤ K ≤ n; coin denominations are positive.',
    'LIS, Kadane and DTW parameter sweeps use nonempty sequences; empty edit strings are exhaustively included.',
    'Parameterized numeric tests do not imply that fixed demonstration captions support arbitrary custom inputs.']}, null, 2));
