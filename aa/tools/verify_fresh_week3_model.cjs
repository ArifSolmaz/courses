#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const modelPath = path.resolve(__dirname, '../w3/model.js');
const { growth, traceSearch } = require(modelPath);
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex === -1 ? null : process.argv[reportIndex + 1];
let assertions = 0;
let searchCases = 0;
const checks = [];

function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}
function ok(value, message) {
  assert.ok(value, message);
  assertions += 1;
}
function rejects(call, message) {
  assert.throws(call, undefined, message);
  assertions += 1;
}

function checkSearch(values, target, mode) {
  const before = values.slice();
  const result = traceSearch(values, target, mode);
  const index = values.indexOf(target);
  const expected = index === -1 ? null : index + 1;
  equal(result.position, expected, 'Arama sonucu bağımsız indexOf sonucuyla eşleşmeli.');
  equal(values, before, 'Arama girdiyi değiştirmemeli.');
  ok(result.values !== values, 'Sonuç bir dizi kopyası taşımalı.');
  equal(result.values, before);
  equal(result.mode, mode);
  equal(result.target, target);
  equal(result.probes, result.steps.length);
  let previous = null;
  for (let i = 0; i < result.steps.length; i += 1) {
    const step = result.steps[i];
    equal(step.probe, i + 1);
    equal(step.candidatesBefore, [step.left, step.right]);
    ok(step.left >= 1 && step.right <= values.length && step.left <= step.right);
    ok(step.position >= step.left && step.position <= step.right);
    equal(step.value, values[step.position - 1]);
    equal(step.relation, Math.sign(step.value - target));
    if (previous) {
      equal([step.left, step.right], [previous.nextLeft, previous.nextRight]);
      ok(step.right - step.left < previous.right - previous.left, 'Başarısız adım aday aralığını küçültmeli.');
    } else {
      equal([step.left, step.right], [1, values.length]);
    }
    if (expected !== null) ok(step.left <= expected && expected <= step.right, 'Hedef atılan bölgede kalmamalı.');
    if (mode === 'binary') {
      equal(step.mid, step.position);
      equal(step.position, Math.floor((step.left + step.right) / 2));
      if (step.relation < 0) equal([step.nextLeft, step.nextRight], [step.position + 1, step.right]);
      if (step.relation > 0) equal([step.nextLeft, step.nextRight], [step.left, step.position - 1]);
    } else {
      equal(step.mid, null);
      equal(step.position, i + 1);
      equal(step.right, values.length);
      if (step.relation !== 0) equal([step.nextLeft, step.nextRight], [i + 2, values.length]);
    }
    if (step.relation === 0) {
      equal(i, result.steps.length - 1, 'Eşitlikte arama hemen bitmeli.');
      equal([step.nextLeft, step.nextRight], [step.left, step.right]);
    }
    previous = step;
  }
  if (mode === 'linear') equal(result.probes, expected === null ? values.length : expected);
  else ok(result.probes <= (values.length ? Math.floor(Math.log2(values.length)) + 1 : 0));
  if (expected === null && previous) ok(previous.nextLeft > previous.nextRight, 'Bulunamadı sonucu boş aday aralığında bitmeli.');
  if (expected !== null) equal(previous.relation, 0);
  searchCases += 1;
  return result;
}

let report;
try {
  for (const n of [0, 1, 2, 3, 4, 5, 8, 16, 32, 100, 1000, 1000000]) {
    equal(growth(n), { n, linear: 2 * n, quadratic: n * n, doubleN: 2 * n, linearAtDouble: 4 * n, quadraticAtDouble: 4 * n * n });
    const value = growth(n);
    equal(value.linearAtDouble, value.linear * 2);
    equal(value.quadraticAtDouble, value.quadratic * 4);
  }
  equal(growth(2).linear, growth(2).quadratic, '2n ve n² n=2 için eşittir.');
  ok(growth(1).linear > growth(1).quadratic, 'n=1 sınır örneği.');
  ok(growth(3).linear < growth(3).quadratic, 'n>2 için n² daha büyüktür.');
  for (const n of [-1, 0.1, 1000001, NaN, Infinity, -Infinity, '8', null, undefined, Number.MAX_SAFE_INTEGER]) rejects(() => growth(n));
  checks.push('2n, n² ve n iki katına çıktığında tam sayım; küçük n istisnaları ve güvenli aralık.');

  // Exhaust every ordered subset of nine different values, including the empty set.
  const alphabet = [-8, -6, -4, -2, 0, 2, 4, 6, 8];
  for (let mask = 0; mask < 2 ** alphabet.length; mask += 1) {
    const values = alphabet.filter((_, i) => mask & (1 << i));
    for (let target = -9; target <= 9; target += 1) {
      checkSearch(values, target, 'linear');
      checkSearch(values, target, 'binary');
    }
  }
  for (let length = 1; length <= 32; length += 1) {
    const values = Array.from({ length }, (_, i) => i * 10 - 150);
    for (const target of [values[0] - 1, ...values, values.at(-1) + 1]) {
      checkSearch(values, target, 'binary');
      checkSearch(values, target, 'linear');
    }
  }
  for (const mode of ['linear', 'binary']) {
    checkSearch([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER], Number.MIN_SAFE_INTEGER, mode);
    checkSearch([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER, mode);
    checkSearch([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER], -1, mode);
    checkSearch([Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER], 1, mode);
  }
  checks.push('Sıralı benzersiz dizilerin tüm küçük alt kümeleri, her hedef, boş ve sınır durumları, 32 öğeye kadar ikili arama üst sınırı.');

  const sample = [4, 7, 11, 18, 24, 31, 42, 56];
  equal(traceSearch(sample, 42).steps.map(step => step.position), [4, 6, 7]);
  equal(traceSearch(sample, 42).probes, 3);
  equal(traceSearch(sample, 42, 'linear').probes, 7);
  equal(traceSearch(sample, 5).steps.map(step => step.position), [4, 2, 1]);
  equal(traceSearch(sample, 5).probes, 3);
  equal(traceSearch(sample, 5, 'linear').probes, 8, 'Doğrusal yöntem daha büyük anahtarda erken durmayan tam tarama olmalı.');
  equal(traceSearch(sample, 42).steps.map(step => step.candidatesBefore), [[1, 8], [5, 8], [7, 8]]);
  equal(traceSearch([], 42), { values: [], target: 42, mode: 'binary', steps: [], position: null, probes: 0 });
  checks.push('Dersin 42 ve 5 hedeflerinin elle hesaplanan tam izleri ve ortak çıktı sözleşmesi.');

  for (const values of [null, '1,2', {}, [2, 1], [1, 1], [NaN], [Infinity], [1.5], ['1'], [null], [Number.MAX_SAFE_INTEGER + 1], Array(2), Array.from({ length: 33 }, (_, i) => i)]) {
    rejects(() => traceSearch(values, 1));
  }
  for (const target of [NaN, Infinity, 1.2, '1', null, undefined, Number.MAX_SAFE_INTEGER + 1]) rejects(() => traceSearch([1, 2], target));
  for (const mode of ['Binary', 'sequential', '', null, 0]) rejects(() => traceSearch([1, 2], 1, mode));
  checks.push('Sırasız, tekrarlı, aşırı uzun, delikli ve geçersiz türdeki girdilerin reddi.');

  const input = Object.freeze([1, 3, 5]);
  const result = traceSearch(input, 3);
  result.values[0] = 99;
  equal(input, [1, 3, 5]);
  const context = { console };
  vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath });
  ok(context.AAWeekThree && typeof context.AAWeekThree.traceSearch === 'function');
  equal(context.AAWeekThree.traceSearch([1, 3, 5], 5).position, 3);
  checks.push('CommonJS ve tarayıcı dışa aktarımı; dondurulmuş girdiye ve kopya değiştirmeye karşı koruma.');

  report = { status: 'passed', assertions, searchCases, checks };
} catch (error) {
  report = { status: 'failed', assertions, searchCases, checks, error: error.stack };
  process.exitCode = 1;
}
if (reportPath) {
  fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
