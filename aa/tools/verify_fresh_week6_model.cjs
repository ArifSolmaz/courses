#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const modelPath = path.resolve(__dirname, '../w6/model.js');
const model = require(modelPath);
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex < 0 ? null : process.argv[reportIndex + 1];
let assertions = 0, insertCases = 0, extractCases = 0, exhaustiveHeaps = 0, randomizedOperations = 0;
const checks = [];
function eq(actual, expected, message) { assert.deepEqual(actual, expected, message); assertions++; }
function ok(value, message) { assert.ok(value, message); assertions++; }
function rejects(call) { assert.throws(call); assertions++; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function order(a, b) { if (a.priority !== b.priority) return a.priority < b.priority ? -1 : 1; return a.seq === b.seq ? 0 : a.seq < b.seq ? -1 : 1; }
function valid(heap) { return heap.every((job, index) => index === 0 || order(heap[Math.floor((index - 1) / 2)], job) <= 0); }
function byId(heap) { return heap.slice().sort((a, b) => a.id.localeCompare(b.id)); }
function job(id, priority, seq, device = seq) { return { id, device, priority, seq }; }
function inspect(trace, source) {
  eq(trace.initial, source); ok(trace.initial !== source);
  let previous = clone(source), comparisons = 0, swaps = 0;
  const downPerParent = new Map();
  for (let i = 0; i < trace.steps.length; i++) {
    const step = trace.steps[i]; eq(step.step, i + 1);
    let expected = clone(previous);
    if (step.type === 'append') {
      eq(i, 0); eq(step.index, previous.length); eq(step.job, trace.inserted); expected.push(clone(step.job));
    } else if (step.type === 'compare') {
      ok(Number.isInteger(step.left) && step.left >= 0 && step.left < previous.length);
      ok(Number.isInteger(step.right) && step.right >= 0 && step.right < previous.length);
      eq(step.result, order(previous[step.left], previous[step.right])); comparisons++;
      if (step.purpose === 'up') eq(step.right, Math.floor((step.left - 1) / 2));
      else {
        let parent;
        if (step.purpose === 'choose-child') { eq(step.right, step.left + 1); ok(step.left % 2 === 1); parent = Math.floor((step.left - 1) / 2); }
        else { eq(step.purpose, 'down'); parent = step.right; ok([2 * parent + 1, 2 * parent + 2].includes(step.left)); const sibling = step.left === 2 * parent + 1 ? step.left + 1 : step.left - 1; if (sibling < previous.length) ok(order(previous[step.left], previous[sibling]) <= 0, 'Aşağı karşılaştırmada küçük çocuk seçilmeli.'); }
        downPerParent.set(parent, (downPerParent.get(parent) || 0) + 1); ok(downPerParent.get(parent) <= 2, 'Bir aşağı düzeyde en fazla iki tuple karşılaştırması.');
      }
    } else if (step.type === 'swap') {
      ok(step.i >= 0 && step.j >= 0 && step.i < previous.length && step.j < previous.length && step.i !== step.j);
      const prior = trace.steps[i - 1]; eq(prior.type, 'compare'); ok(prior.result < 0); eq([step.i, step.j].slice().sort((a, b) => a - b), [prior.left, prior.right].slice().sort((a, b) => a - b));
      [expected[step.i], expected[step.j]] = [expected[step.j], expected[step.i]]; swaps++;
    } else if (step.type === 'replace-root') {
      eq(i, 0); ok(previous.length > 1); eq(step.from, previous.length - 1); eq(step.to, 0); eq(step.job, previous.at(-1)); eq(step.removed, previous[0]);
      expected = previous.slice(0, -1); expected[0] = clone(previous.at(-1));
    } else if (step.type === 'remove') {
      eq(i, 0); eq(previous.length, 1); eq(step.index, 0); eq(step.job, previous[0]); expected = [];
    } else { eq(step.type, 'empty'); eq(i, 0); eq(previous.length, 0); expected = []; }
    eq(step.heap, expected, 'Bir adım yalnız bildirilen karşılaştırma/ekleme/çıkarma/değiş tokuşu yapmalı.');
    eq(step.counts, { comparisons, swaps }); eq(step.heapValid, valid(step.heap));
    previous = clone(step.heap);
  }
  eq(trace.heap, previous); eq(trace.counts, { comparisons, swaps }); eq(trace.heapValid, true); ok(valid(trace.heap)); ok(!('total' in trace.counts));
}
function checkInsert(source, added) {
  const before = clone(source), addedBefore = clone(added), trace = model.traceInsert(source, added); inspect(trace, source);
  eq(source, before); eq(added, addedBefore); eq(trace.operation, 'insert'); eq(trace.inserted, added); eq(trace.result, null);
  eq(byId(trace.heap), byId(source.concat([added]))); eq(trace.heap.length, source.length + 1);
  ok(trace.counts.comparisons <= Math.floor(Math.log2(trace.heap.length)), 'Yukarı yol yüksekliğinden fazla karşılaştırma yok.'); ok(trace.counts.swaps <= trace.counts.comparisons);
  insertCases++; return trace;
}
function checkExtract(source) {
  const before = clone(source), trace = model.traceExtract(source); inspect(trace, source);
  eq(source, before); eq(trace.operation, 'extract'); eq(trace.inserted, null);
  const expected = source.slice().sort(order), minimum = expected.length ? expected.shift() : null;
  eq(trace.result, minimum, 'Öncelik kuyruğu yalnız öncelik sayısını değil bütün minimum işi döndürmeli.'); eq(byId(trace.heap), byId(expected)); eq(trace.heap.length, Math.max(0, source.length - 1));
  const height = trace.heap.length ? Math.floor(Math.log2(trace.heap.length)) : 0;
  ok(trace.counts.comparisons <= 2 * height); ok(trace.counts.swaps <= height); eq(trace.steps[0].type, source.length === 0 ? 'empty' : source.length === 1 ? 'remove' : 'replace-root');
  extractCases++; return trace;
}
function permutations(values) { if (!values.length) return [[]]; return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest])); }
let report;
try {
  const priorities = [4, 7, 6, 12, 9, 8, 10], devices = [18, 7, 24, 4, 11, 20, 31];
  const initial = priorities.map((priority, i) => job(String.fromCharCode(65 + i), priority, i + 1, devices[i]));
  const added = job('H', 3, 8, 26), inserted = checkInsert(initial, added), extracted = checkExtract(initial), after = checkExtract(inserted.heap);
  eq(inserted.counts, { comparisons: 3, swaps: 3 }); eq(inserted.heap.map(item => item.id), ['H', 'A', 'C', 'B', 'E', 'F', 'G', 'D']);
  eq(inserted.steps.filter(step => step.type === 'compare').map(step => [step.left, step.right]), [[7, 3], [3, 1], [1, 0]]);
  eq(extracted.result, initial[0]); eq(extracted.counts, { comparisons: 3, swaps: 2 }); eq(extracted.heap.map(item => item.id), ['C', 'B', 'F', 'D', 'E', 'G']);
  eq(after.result, added); eq(after.heap, initial); eq(after.counts, { comparisons: 4, swaps: 2 });
  eq(checkInsert(initial, job('I', 15, 8, 26)).counts, { comparisons: 1, swaps: 0 });
  checkExtract([initial[0]]); checkExtract([]); checkInsert([], job('only', 5, 1));
  const tied = [job('A', 4, 1), job('B', 4, 2), job('C', 6, 3)]; const first = checkExtract(tied); eq(first.result.id, 'A'); eq(checkExtract(first.heap).result.id, 'B');
  const independent = [job('K', 2, 1, 3), job('L', 5, 2, 8), job('M', 3, 3, 12), job('N', 7, 4, 17)];
  const p = job('P', 1, 5, 23), independentInsert = checkInsert(independent, p); eq(independentInsert.counts, { comparisons: 2, swaps: 2 });
  eq(independentInsert.heap.map(item => item.id), ['P', 'K', 'M', 'N', 'L']); const independentExtract = checkExtract(independentInsert.heap); eq(independentExtract.result, p); eq(independentExtract.counts, { comparisons: 3, swaps: 1 });
  checks.push('Ana Hekleme, minimumçıkarma ve birleşik akışın elle hesaplanan izleri; erken durma, tek/boş ve bağımsız örnek.');

  for (let n = 0; n <= 7; n++) {
    for (let code = 0; code < 3 ** n; code++) {
      let digits = code;
      const heap = Array.from({ length: n }, (_, i) => { const priority = digits % 3; digits = Math.floor(digits / 3); return job('E' + i, priority, i + 1, i % 2); });
      if (!valid(heap)) continue; exhaustiveHeaps++; checkExtract(heap);
      for (const priority of [-1, 0, 1, 2, 3]) checkInsert(heap, job('new', priority, n + 1, 0));
    }
  }
  for (let n = 0; n <= 6; n++) {
    const jobs = Array.from({ length: n }, (_, i) => job('V' + i, i % 3, i + 1));
    for (const heap of permutations(jobs)) {
      if (!valid(heap)) continue; exhaustiveHeaps++; checkExtract(heap); checkInsert(heap, job('extra', 1, n + 1));
    }
  }
  checks.push('Küçük heaplerin tüm üç-öncelik atamaları ve tüm iş permütasyonları; bağlı seq sırası, geçici ihlal ve adım/sayaç geçişleri.');

  let random = 0x4170ab23, heap = [], oracle = [], nextSeq = 1;
  function next() { random = (Math.imul(random, 1664525) + 1013904223) >>> 0; return random; }
  for (let i = 0; i < 2000; i++) {
    if (!heap.length || (heap.length < 24 && next() % 10 < 6)) {
      const added = job('R' + nextSeq, (next() % 11) - 3, nextSeq, next() % 7); nextSeq++;
      heap = checkInsert(heap, added).heap; oracle.push(added);
    } else {
      const expected = oracle.slice().sort(order)[0], trace = checkExtract(heap); eq(trace.result, expected);
      oracle = oracle.filter(item => item.id !== expected.id); heap = trace.heap;
    }
    eq(byId(heap), byId(oracle)); randomizedOperations++;
  }
  while (heap.length) { const expected = oracle.slice().sort(order)[0], trace = checkExtract(heap); eq(trace.result, expected); oracle = oracle.filter(item => item.id !== expected.id); heap = trace.heap; }
  eq(oracle, []);
  const allTied = [job('Z', 4, 1, 18), job('A', 4, 2, 18), job('M', 4, 3, 18)]; const removed = []; let tieHeap = allTied;
  while (tieHeap.length) { const trace = checkExtract(tieHeap); removed.push(trace.result.id); tieHeap = trace.heap; } eq(removed, ['Z', 'A', 'M'], 'Eşit öncelikte iş etiketi/cihaz değil, geliş sırası belirleyici.');
  checks.push('2.000 sabit tohumlu ekleme/çıkarma bağımsız sıralı öncelik-kuyruğu oracle ile; ardışık işlemler ve aynı cihazın ayrı işleri.');

  for (let n = 1; n <= 32; n++) {
    const source = Array.from({ length: n }, (_, i) => job('B' + i, Math.floor(i / 3), i + 1)); checkExtract(source);
    if (n < 32) { const maximalUp = checkInsert(source, job('urgent', -1, n + 1)); eq(maximalUp.counts.comparisons, Math.floor(Math.log2(n + 1))); checkInsert(source, job('late', Number.MAX_SAFE_INTEGER, n + 1)); }
  }
  const early = Array.from({ length: 31 }, (_, i) => job('T' + i, 1000 + i, i + 1));
  for (const [index, priority] of [[0, 0], [1, 1], [2, 2], [5, 3], [6, 4], [13, 4], [14, 4], [29, 5], [30, 5]]) early[index].priority = priority;
  eq(checkExtract(early).counts, { comparisons: 4, swaps: 1 });
  checkInsert([job('min', Number.MIN_SAFE_INTEGER, 1)], job('max', Number.MAX_SAFE_INTEGER, 2));
  checks.push('32iş sınırına kadar yukarı yol ve her aşağı düzeyde≤2karşılaştırma; O(logn) üst sınırı, her işlemde eşitlik/Theta iddiası yok; büyük heapte erken durma.');

  for (const invalid of [null, {}, 'x', Array(1), [null], [job('', 1, 1)], [job('bad', 1.5, 1)], [job('bad', Infinity, 1)], [job('bad', 1, 0)], [job('bad', 1, 1, -1)], [job('same', 1, 1), job('same', 2, 2)], [job('a', 1, 1), job('b', 2, 1)], [job('a', 5, 1), job('b', 3, 2)], [job('a', 4, 2), job('b', 4, 1)], Array.from({ length: 33 }, (_, i) => job('x' + i, i, i + 1))]) rejects(() => model.traceExtract(invalid));
  rejects(() => model.traceInsert(initial, job('A', 1, 8))); rejects(() => model.traceInsert(initial, job('new', 1, 7)));
  rejects(() => model.traceInsert(Array.from({ length: 32 }, (_, i) => job('full' + i, i, i + 1)), job('overflow', 1, 33)));
  for (const bad of [null, {}, job('x', NaN, 1), job('x', 1, Number.MAX_SAFE_INTEGER + 1)]) rejects(() => model.compareJobs(initial[0], bad));
  eq(model.compareJobs(job('x', 1, 2), job('y', 1, 1)), 1); eq(model.compareJobs(job('x', 1, 1), job('y', 2, 2)), -1); eq(model.compareJobs(initial[0], initial[0]), 0);
  checks.push('Geçersiz heap, aynı etiket/seq, yanlış tie düzeni, eski geliş numarası, tür/sayı/kapasite doğrulaması.');

  const frozen = Object.freeze(initial.map(item => Object.freeze({ ...item }))); checkExtract(frozen); checkInsert(frozen, Object.freeze({ ...added }));
  const trace = model.traceInsert(initial, added), second = clone(trace.steps[1]), start = clone(trace.initial), final = clone(trace.heap);
  trace.steps[0].heap[0].priority = 999; trace.steps[0].counts.comparisons = 999; eq(trace.steps[1], second); eq(trace.initial, start); eq(trace.heap, final); eq(initial[0].priority, 4);
  trace.inserted.device = 999; eq(trace.heap.find(item => item.id === 'H').device, 26);
  const extractedSnapshot = model.traceExtract(initial); extractedSnapshot.result.priority = 999; eq(extractedSnapshot.initial[0].priority, 4); eq(extractedSnapshot.steps[0].removed.priority, 4);
  const context = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath }); ok(context.FreshWeek6); eq(context.FreshWeek6.traceExtract([]).steps[0].type, 'empty');
  checks.push('Girdiler değişmez; dondurulmuş işler ve bağımsız başlangıç/adım/sonuç kopyaları; FreshWeek6 tarayıcı/CommonJS API.');
  report = { status: 'passed', assertions, insertCases, extractCases, exhaustiveHeaps, randomizedOperations, checks, model_sha256: createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'), comparisonUnit: 'One abstract lexicographic (priority,arrivalSeq) comparison; separate swap counter.', bounds: 'Insert <= floor(log2(newN)); extract <= 2*floor(log2(remainingN)) comparisons; <=2 per visited down-level. These are upper bounds, not per-operation equalities.', indices: 'zero-based; seq is positive global arrival order', transientSnapshotsMayViolateHeap: true };
} catch (error) { report = { status: 'failed', assertions, insertCases, extractCases, exhaustiveHeaps, randomizedOperations, checks, error: error.stack }; process.exitCode = 1; }
if (reportPath) { fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify(report, null, 2));
