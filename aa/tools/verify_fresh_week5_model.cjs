#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const modelPath = path.resolve(__dirname, '../w5/model.js');
const model = require(modelPath);
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex < 0 ? null : process.argv[reportIndex + 1];
let assertions = 0, buildCases = 0, getCases = 0, setCases = 0;
const checks = [];
function eq(actual, expected, message) { assert.deepEqual(actual, expected, message); assertions++; }
function ok(value, message) { assert.ok(value, message); assertions++; }
function rejects(call) { assert.throws(call); assertions++; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function recordsOf(entries) { const map = new Map(); entries.forEach(({ key, value }) => map.set(key, { key, value })); return [...map.values()]; }
// This independent oracle uses a recursive nested tree, not the model's flat
// nodes and links. Hash bucket membership uses exact BigInt remainder.
function insert(root, record) {
  if (root === null) return { ...record, left: null, right: null };
  if (record.key === root.key) return { ...root, value: record.value };
  if (record.key < root.key) return { ...root, left: insert(root.left, record) };
  return { ...root, right: insert(root.right, record) };
}
function treeOf(entries) { return entries.reduce((root, entry) => insert(root, entry), null); }
function height(root) { return root === null ? -1 : 1 + Math.max(height(root.left), height(root.right)); }
function pathTo(root, target) { const path = []; while (root !== null) { path.push(root.key); if (root.key === target) break; root = target < root.key ? root.left : root.right; } return path; }
function nodesOf(root, records) {
  const all = new Map();
  function visit(node) { if (node === null) return; all.set(node.key, { key: node.key, value: node.value, left: node.left === null ? null : node.left.key, right: node.right === null ? null : node.right.key }); visit(node.left); visit(node.right); }
  visit(root); return records.map(record => all.get(record.key));
}
function bucketOf(key, m) { return Number(BigInt(key) % BigInt(m)); }
function bucketsOf(records, m) { return Array.from({ length: m }, (_, index) => records.filter(record => bucketOf(record.key, m) === index)); }
function expectedState(entries, structure, m) {
  const records = recordsOf(entries), tree = treeOf(entries);
  if (structure === 'bst') return { root: tree === null ? null : tree.key, nodes: nodesOf(tree, records), stats: { size: records.length, height: height(tree) } };
  const buckets = bucketsOf(records, m);
  return { m, buckets, stats: { size: records.length, alpha: records.length / m, maxBucketLength: Math.max(...buckets.map(bucket => bucket.length)) } };
}
function sameStructure(state, expected, structure) {
  eq(state.stats, expected.stats);
  if (structure === 'bst') { eq(state.root, expected.root); eq(state.nodes, expected.nodes); }
  else { eq(state.m, expected.m); eq(state.buckets, expected.buckets); }
}
function searchOracle(entries, key, structure, m) {
  const records = recordsOf(entries), record = records.find(record => record.key === key) || null;
  if (structure === 'bst') return { keys: pathTo(treeOf(entries), key), result: record };
  const bucketIndex = bucketOf(key, m), bucket = bucketsOf(records, m)[bucketIndex], found = bucket.findIndex(record => record.key === key);
  return { keys: bucket.slice(0, found < 0 ? bucket.length : found + 1).map(record => record.key), result: record, bucketIndex };
}
function countsFor(structure, keyCount, writes = 0) { return { nodeComparisons: structure === 'bst' ? keyCount : 0, bucketKeyChecks: structure === 'hash' ? keyCount : 0, hashComputations: structure === 'hash' ? 1 : 0, recordSets: writes }; }
function inspectSearchSteps(steps, entries, key, structure, m) {
  const expected = searchOracle(entries, key, structure, m), state = expectedState(entries, structure, m);
  eq(steps.length, expected.keys.length + (structure === 'hash' ? 1 : 0));
  if (structure === 'hash') {
    const hashStep = steps[0]; eq(hashStep.op, 'hash'); eq(hashStep.key, key); eq(hashStep.m, m); eq(hashStep.bucketIndex, expected.bucketIndex);
    eq(hashStep.counts, countsFor('hash', 0)); eq(hashStep.state.activeBucket, expected.bucketIndex); eq(hashStep.state.activeOffset, null); sameStructure(hashStep.state, state, structure);
  }
  expected.keys.forEach((value, index) => {
    const step = steps[index + (structure === 'hash' ? 1 : 0)]; eq(step.target, key); eq(step.key, value); eq(step.counts, countsFor(structure, index + 1)); sameStructure(step.state, state, structure);
    if (structure === 'bst') {
      const relation = value < key ? -1 : value > key ? 1 : 0;
      eq(step.op, 'compare-node'); eq(step.relation, relation); eq(step.direction, relation < 0 ? 'right' : relation > 0 ? 'left' : 'found'); eq(step.state.path, expected.keys.slice(0, index + 1)); eq(step.state.active, value);
    } else {
      eq(step.op, 'compare-key'); eq(step.equal, value === key); eq(step.offset, index + 1); eq(step.bucketIndex, expected.bucketIndex); eq(step.state.activeOffset, index + 1);
    }
  });
  return expected;
}
function checkGet(entries, key, structure, m = 5) {
  const before = clone(entries), result = model.traceGet(entries, key, structure, { m });
  const expected = inspectSearchSteps(result.steps, entries, key, structure, m);
  eq(entries, before); eq(result.entries, before); ok(result.entries !== entries); eq(result.result, expected.result, 'Get anahtar/değer kaydı döndürmeli, konum değil.');
  eq(result.records, recordsOf(entries)); eq(result.counts, countsFor(structure, expected.keys.length));
  const state = expectedState(entries, structure, m); sameStructure(result.initial, state, structure); sameStructure(result.state, state, structure); eq(result.stats, state.stats);
  if (structure === 'bst') { eq(result.initial.active, null); eq(result.initial.path, []); eq(result.state.path, expected.keys); }
  else { eq(result.initial.activeBucket, null); eq(result.initial.activeOffset, null); eq(result.state.activeBucket, expected.bucketIndex); }
  result.steps.forEach((step, index) => eq(step.step, index + 1)); ok(!('total' in result.counts)); getCases++; return result;
}
function checkSet(entries, key, value, structure, m = 5) {
  const before = clone(entries), result = model.traceSet(entries, key, value, structure, { m }), search = result.steps.slice(0, -1);
  const expected = inspectSearchSteps(search, entries, key, structure, m), updated = expected.result !== null;
  const after = entries.concat([{ key, value }]), state = expectedState(after, structure, m), last = result.steps.at(-1);
  eq(entries, before); eq(result.entries, before); eq(result.result, { key, value, updated }); eq(result.records, recordsOf(after)); eq(result.counts, countsFor(structure, expected.keys.length, 1));
  eq(last.op, 'set-record'); eq(last.key, key); eq(last.value, value); eq(last.updated, updated); eq(last.counts, result.counts); sameStructure(last.state, state, structure); sameStructure(result.state, state, structure); eq(result.stats, state.stats);
  sameStructure(result.initial, expectedState(entries, structure, m), structure); eq(result.stats.size, recordsOf(entries).length + (updated ? 0 : 1));
  if (updated && structure === 'bst') {
    eq(result.state.root, result.initial.root); eq(result.state.nodes.map(({ key, left, right }) => ({ key, left, right })), result.initial.nodes.map(({ key, left, right }) => ({ key, left, right })));
  }
  if (updated && structure === 'hash') eq(result.state.buckets.map(bucket => bucket.map(record => record.key)), result.initial.buckets.map(bucket => bucket.map(record => record.key)));
  result.steps.forEach((step, index) => eq(step.step, index + 1)); ok(!('total' in result.counts)); setCases++; return result;
}
function checkBuild(entries, structure, m = 5) {
  const before = clone(entries), result = model.traceBuild(entries, structure, { m }), expected = expectedState(entries, structure, m);
  eq(entries, before); eq(result.entries, before); sameStructure(result.initial, expectedState([], structure, m), structure); sameStructure(result.state, expected, structure); eq(result.stats, expected.stats); eq(result.records, recordsOf(entries)); eq(result.result, recordsOf(entries));
  const totals = { nodeComparisons: 0, bucketKeyChecks: 0, hashComputations: 0, recordSets: 0 };
  let prefix = [];
  entries.forEach((entry, index) => {
    const search = searchOracle(prefix, entry.key, structure, m), group = result.steps.filter(step => step.entry === index + 1);
    eq(group.length, search.keys.length + (structure === 'hash' ? 1 : 0) + 1);
    const prior = expectedState(prefix, structure, m), offset = structure === 'hash' ? 1 : 0;
    if (structure === 'hash') { totals.hashComputations++; eq(group[0].op, 'hash'); eq(group[0].bucketIndex, search.bucketIndex); eq(group[0].counts, totals); sameStructure(group[0].state, prior, structure); }
    search.keys.forEach((key, i) => {
      const step = group[i + offset]; if (structure === 'bst') totals.nodeComparisons++; else totals.bucketKeyChecks++;
      eq(step.op, structure === 'bst' ? 'compare-node' : 'compare-key'); eq(step.key, key); eq(step.target, entry.key); eq(step.counts, totals); sameStructure(step.state, prior, structure);
    });
    prefix = prefix.concat([entry]); totals.recordSets++;
    const last = group.at(-1); eq(last.op, 'set-record'); eq(last.updated, search.result !== null); eq(last.counts, totals); sameStructure(last.state, expectedState(prefix, structure, m), structure);
  });
  eq(result.counts, totals); result.steps.forEach((step, index) => eq(step.step, index + 1)); buildCases++; return result;
}
function permutations(values) { if (!values.length) return [[]]; return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest])); }
let report;
try {
  const main = [[18, 'pompa'], [7, 'sera'], [24, 'depo'], [4, 'çatı'], [11, 'kuyu'], [20, 'bahçe'], [31, 'kapı']].map(([key, value]) => ({ key, value }));
  for (const structure of ['bst', 'hash']) {
    checkBuild(main, structure); checkGet(main, 31, structure); checkGet(main, 16, structure); checkGet([], 31, structure);
    const added = checkSet(main, 26, 'oda', structure); checkGet(added.records, 26, structure); const updated = checkSet(main, 31, 'atölye', structure); eq(checkGet(updated.records, 31, structure).result, { key: 31, value: 'atölye' });
  }
  eq(model.traceGet(main, 31).steps.map(step => step.key), [18, 24, 31]); eq(model.traceBuild(main).stats.height, 2);
  const sorted = main.slice().sort((a, b) => a.key - b.key); eq(checkBuild(sorted, 'bst').stats.height, 6); eq(checkGet(sorted, 31, 'bst').counts.nodeComparisons, 7);
  eq(checkGet(main, 31, 'hash').counts, { nodeComparisons: 0, bucketKeyChecks: 2, hashComputations: 1, recordSets: 0 });
  eq(checkGet(main, 16, 'hash').counts.bucketKeyChecks, 2); eq(model.traceBuild(main, 'hash').state.buckets[1].map(record => record.key), [11, 31]);
  const addedBst = model.traceSet(main, 26, 'oda'), addedHash = model.traceSet(main, 26, 'oda', 'hash');
  eq(addedBst.counts.nodeComparisons, 3); eq(addedHash.counts.bucketKeyChecks, 2);
  eq(checkGet(addedBst.records, 26, 'bst').counts.nodeComparisons, 4); eq(checkGet(addedHash.records, 26, 'hash').counts.bucketKeyChecks, 3);
  const independent = [[12, 'sera'], [3, 'çatı'], [22, 'depo'], [8, 'kuyu'], [17, 'pompa']].map(([key, value]) => ({ key, value }));
  eq(checkGet(independent, 17, 'bst').state.path, [12, 22, 17]); eq(checkGet(independent, 17, 'bst').counts.nodeComparisons, 3);
  eq(checkGet(independent, 17, 'hash').counts.bucketKeyChecks, 3); eq(checkBuild(independent, 'hash').stats.alpha, 1); eq(checkBuild(independent, 'bst').stats.height, 2);
  checks.push('Ana örnekler ve yedi UI preset: kayıt değeri, başarısız arama, yeni key, update, sıralı zincir ve boş yapı; guided26 sayımı set sonrası get için4/3.');

  for (let n = 0; n <= 5; n++) for (const keys of permutations(Array.from({ length: n }, (_, i) => i))) {
    const entries = keys.map(key => ({ key, value: 'değer-' + (key % 2) }));
    for (const structure of ['bst', 'hash']) {
      checkBuild(entries, structure);
      for (let target = 0; target <= n + 1; target++) checkGet(entries, target, structure);
      checkSet(entries, n, '', structure);
      if (n) checkSet(entries, keys[Math.floor(n / 2)], 'yeni değer', structure);
    }
  }
  const duplicateKeys = [{ key: 11, value: 'ilk' }, { key: 31, value: 'aynı' }, { key: 11, value: 'son' }, { key: 26, value: 'aynı' }];
  for (const structure of ['bst', 'hash']) { const built = checkBuild(duplicateKeys, structure); eq(built.stats.size, 3); eq(checkGet(duplicateKeys, 11, structure).result, { key: 11, value: 'son' }); checkSet(duplicateKeys, 11, '', structure); }
  eq(model.traceBuild(duplicateKeys, 'hash').state.buckets[1].map(record => record.key), [11, 31, 26]);
  checks.push('0..5anahtarın tüm ekleme permütasyonları bağımsız özyinelemeli BST ve BigInt kova oracle ile denetlendi; her hedef, key0, boş değer ve yinelenen değer/key güncellemesi.');

  for (const m of [1, 2, 5, 16]) {
    const entries = [{ key: 0, value: '' }, { key: Number.MAX_SAFE_INTEGER, value: 'büyük' }, { key: 7, value: 'yedi' }];
    checkBuild(entries, 'hash', m); checkGet(entries, Number.MAX_SAFE_INTEGER, 'hash', m); checkGet(entries, 8, 'hash', m); checkSet(entries, 7, 'yeni', 'hash', m);
  }
  const chain = Array.from({ length: 32 }, (_, key) => ({ key, value: String(key) })); eq(checkBuild(chain, 'bst').stats.height, 31); eq(checkGet(chain, 31, 'bst').counts.nodeComparisons, 32); eq(checkGet(chain, 32, 'bst').counts.nodeComparisons, 32);
  const collisions = Array.from({ length: 32 }, (_, i) => ({ key: i * 5, value: String(i) }));
  eq(checkBuild(collisions, 'hash').stats, { size: 32, alpha: 6.4, maxBucketLength: 32 }); eq(checkGet(collisions, 155, 'hash').counts.bucketKeyChecks, 32); eq(checkGet(collisions, 160, 'hash').counts.bucketKeyChecks, 32);
  for (const structure of ['bst', 'hash']) { checkSet(chain, 31, 'güncel', structure); rejects(() => model.traceSet(chain, 32, 'yeni', structure)); }
  checks.push('En kötü durum karşı örnekleri: n32 BST zinciri h31 ve tek kovada32eşitlik; α=n/m bir garanti değildir. m1/2/5/16 ve en büyük güvenli key.');

  for (const entries of [null, {}, 'x', Array(1), [null], [{ key: -1, value: 'x' }], [{ key: '1', value: 'x' }], [{ key: 1.5, value: 'x' }], [{ key: Infinity, value: 'x' }], [{ key: 1, value: 1 }], [{ key: 1, value: 'x'.repeat(201) }], Array.from({ length: 33 }, (_, key) => ({ key, value: 'x' }))]) rejects(() => model.traceBuild(entries));
  for (const key of [-1, NaN, Infinity, 0.5, '1', null, undefined, Number.MAX_SAFE_INTEGER + 1]) { rejects(() => model.traceGet([], key)); rejects(() => model.traceSet([], key, 'x')); }
  for (const value of [null, undefined, 1, {}, 'x'.repeat(201)]) rejects(() => model.traceSet([], 1, value));
  for (const m of [0, -1, 1.5, 17, Infinity, '5', null]) rejects(() => model.traceGet([], 1, 'hash', { m }));
  for (const options of [null, [], 1, 'x']) rejects(() => model.traceBuild([], 'hash', options));
  for (const structure of [null, '', 'BST', 'array', 1]) rejects(() => model.traceBuild([], structure));
  checks.push('Geçersiz kayıt/tür/anahtar/m/boyut ve eğitim modeli sınırları; bulunamadı null ile boş değerli kaydın ayrılması.');

  const frozen = Object.freeze(main.map(entry => Object.freeze({ ...entry })));
  checkBuild(frozen, 'bst'); checkGet(frozen, 31, 'hash'); checkSet(frozen, 31, 'güncel', 'hash');
  const snapshot = model.traceSet(main, 26, 'oda', 'hash'), initial = clone(snapshot.initial), second = clone(snapshot.steps[1]), final = clone(snapshot.state);
  snapshot.steps[0].state.buckets[1][0].value = 'bozuldu'; snapshot.steps[0].counts.hashComputations = 999;
  eq(snapshot.initial, initial); eq(snapshot.steps[1], second); eq(snapshot.state, final); eq(main[4].value, 'kuyu');
  snapshot.records[0].value = 'bozuldu'; eq(snapshot.result.value, 'oda'); eq(snapshot.state.buckets[3][0].value, 'pompa');
  const treeSnapshot = model.traceGet(main, 31); treeSnapshot.steps[0].state.path.push(999); treeSnapshot.steps[0].state.nodes[0].left = null; eq(treeSnapshot.steps[1].state.path, [18, 24]); eq(treeSnapshot.state.nodes[0].left, 7);
  const context = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath }); ok(context.AAWeekFive); eq(context.AAWeekFive.traceGet([{ key: 0, value: '' }], 0).result.value, '');
  checks.push('Girdi mutasyonu yok; dondurulmuş kayıtlar, bağımsız adım/başlangıç/sonuç snapshotları ve tarayıcı/CommonJS dışa aktarımları.');
  report = { status: 'passed', assertions, buildCases, getCases, setCases, checks, model_sha256: createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'), units: ['nodeComparisons: one abstract three-way comparison per visited node', 'bucketKeyChecks: one equality per scanned bucket record', 'hashComputations: one h(k)', 'recordSets: one logical dictionary save, not physical writes'], height: 'edges; empty=-1, leaf=0', probability: 'No expected-time guarantee inferred from deterministic mod5 examples.' };
} catch (error) { report = { status: 'failed', assertions, buildCases, getCases, setCases, checks, error: error.stack }; process.exitCode = 1; }
if (reportPath) { fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify(report, null, 2));
