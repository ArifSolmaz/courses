'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w2/model.js');
const model = require(modelPath);
let assertions = 0;
let workCases = 0;
let searchCases = 0;

function equal(actual, expected, label) {
  assertions += 1;
  assert.deepStrictEqual(actual, expected, label);
}

function check(condition, label) {
  assertions += 1;
  assert.ok(condition, label);
}

function rejects(run, errorClass, label) {
  assertions += 1;
  assert.throws(run, errorClass, label);
}

function checkSearch(values, target) {
  searchCases += 1;
  const original = values.slice();
  const nativeIndex = values.indexOf(target);
  const position = nativeIndex < 0 ? null : nativeIndex + 1;
  const comparisons = nativeIndex < 0 ? values.length : nativeIndex + 1;
  const result = model.traceSearch(values, target);
  equal(result.values, original, 'search preserves the input order');
  check(result.values !== values, 'search returns a new array');
  equal(result.target, target, 'search retains the target');
  equal(result.position, position, 'search returns the first matching 1-based position');
  equal(result.comparisons, comparisons, 'search counts equalities actually reached');
  equal(result.steps.length, comparisons, 'every equality has exactly one trace row');
  equal(values, original, 'search does not mutate input');
  const expectedSteps = original.slice(0, comparisons).map((value, index) => ({
    position: index + 1, value, equal: value === target, comparisons: index + 1
  }));
  equal(result.steps, expectedSteps, 'search trace matches an independent native lookup');
  equal(model.traceSearch(values, target), result, 'search is deterministic');
  return result;
}

// A data-product oracle independently enumerates equality-test locations without
// running the model's loop structure. False tests count too; full scans do not
// return early. Loop conditions are outside the chosen counting unit.
function checkWork(n, mode) {
  workCases += 1;
  const indices = Array.from({ length: n }, (_, index) => index + 1);
  let locations;
  if (mode === 'single') {
    locations = indices.map(i => [1, i, null]);
  } else if (mode === 'sequential') {
    locations = indices.map(i => [1, i, null]).concat(indices.map(i => [2, i, null]));
  } else {
    locations = indices.flatMap(i => indices.map(j => [1, i, j]));
  }
  const expected = locations.map(([pass, i, j], index) => ({ pass, i, j, count: index + 1 }));
  const result = model.traceWork(n, mode);
  equal(result.n, n, 'n remains the input size');
  equal(result.mode, mode, 'trace retains the selected loop shape');
  equal(result.steps, expected, 'loop trace matches independent ordered locations');
  equal(result.count, expected.length, 'count equals the number of value-equality tests');
  equal(result.count, mode === 'single' ? n : mode === 'sequential' ? n + n : n * n,
    'exact count agrees with the derived formula');
  equal(model.traceWork(n, mode), result, 'work trace is deterministic');
  if (mode === 'nested') {
    equal(new Set(result.steps.map(step => step.i + ':' + step.j)).size, n * n,
      'each ordered pair is visited once');
    equal(result.steps.filter(step => step.i === step.j).length, n,
      'self pairs are included');
    for (const i of indices) {
      equal(result.steps.filter(step => step.i === i).map(step => step.j), indices,
        'inner index restarts and runs through every position for each outer index');
    }
  }
  return result;
}

equal(Object.keys(model), ['traceSearch', 'traceWork'], 'public API contains only the two lesson models');

equal(checkSearch([12, 5, 19, 5], 19).comparisons, 3, 'Week 1 table has three equality tests');
equal(checkSearch([12, 5, 19, 5], 12).comparisons, 1, 'same n can need one equality');
equal(checkSearch([12, 5, 19, 5], 20).comparisons, 4, 'same n can need n equalities');
equal(checkSearch([31, 8, 31, 14], 31).position, 1, 'repeated values stop at the first occurrence');
equal(checkSearch([], 20).comparisons, 0, 'empty search requires no equality');
checkSearch([0], 0);
checkSearch([-4, 0, -4], -4);
checkSearch([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER);
checkSearch(Array.from({ length: 32 }, (_, index) => index - 16), 100);
checkSearch(Object.freeze([12, 5, 19, 5]), 19);

// Exhaust all arrays of length 0..6 over three symbols and four targets.
const alphabet = [-1, 0, 2];
const targets = [-1, 0, 1, 2];
function enumerate(prefix, remaining) {
  if (remaining === 0) {
    for (const target of targets) checkSearch(prefix, target);
    return;
  }
  for (const value of alphabet) enumerate(prefix.concat(value), remaining - 1);
}
for (let length = 0; length <= 6; length += 1) enumerate([], length);

for (let n = 0; n <= 32; n += 1) {
  for (const mode of ['single', 'sequential', 'nested']) checkWork(n, mode);
}
equal(model.traceWork(3, 'sequential').count, 6, 'two sequential n=3 loops give six equality tests');
equal(model.traceWork(3, 'nested').count, 9, 'two nested n=3 loops give nine equality tests');
equal(model.traceWork(4, 'sequential').count, 8, 'two sequential n=4 loops give eight equality tests');
equal(model.traceWork(4, 'nested').count, 16, 'two nested n=4 loops give sixteen equality tests');
equal(model.traceWork(6, 'sequential').count / model.traceWork(3, 'sequential').count, 2,
  'doubling n doubles the sequential count');
equal(model.traceWork(6, 'nested').count / model.traceWork(3, 'nested').count, 4,
  'doubling n quadruples the nested count');
equal(model.traceWork(1, 'sequential').count, 2, 'n=1 shows sequential may exceed nested');
equal(model.traceWork(1, 'nested').count, 1, 'n=1 nested count is one');
equal(model.traceWork(2, 'sequential').count, model.traceWork(2, 'nested').count,
  'n=2 counts coincide, so "nested is always more" would be false');
equal(model.traceWork(0, 'nested').steps, [], 'zero iterations produce no value-equality tests');
for (let n = 0; n <= 32; n += 1) {
  equal(model.traceWork(n, 'single').count + model.traceWork(n, 'nested').count, n + n * n,
    'a full single scan followed by a nested scan adds to n+n²');
}

for (const bad of [NaN, Infinity, -Infinity, 0.5, '2', null, undefined,
  true, {}, [], Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1, 1n]) {
  rejects(() => model.traceWork(bad, 'single'), TypeError, 'non-safe-integer n is rejected');
  rejects(() => model.traceSearch([bad], 2), TypeError, 'invalid search value is rejected');
  rejects(() => model.traceSearch([], bad), TypeError, 'invalid search target is rejected');
}
for (const bad of [-1, 33, 100, Number.MAX_SAFE_INTEGER]) {
  rejects(() => model.traceWork(bad, 'single'), RangeError, 'out-of-range n is rejected');
}
for (const bad of ['', 'Nested', 'n', null, undefined, {}, [], 1, true]) {
  rejects(() => model.traceWork(3, bad), TypeError, 'unknown loop shape is rejected');
}
for (const bad of [null, undefined, {}, '1,2', 4, new Int32Array([1, 2])]) {
  rejects(() => model.traceSearch(bad, 2), TypeError, 'search input must be an array');
}
rejects(() => model.traceSearch(new Array(2), 2), TypeError, 'sparse arrays are rejected');
rejects(() => model.traceSearch([2, 1.5], 2), TypeError,
  'invalid values are rejected even after an early matching position');
rejects(() => model.traceSearch(Array(33).fill(0), 0), RangeError, 'search size is bounded');

const source = [1, 2, 3];
const editedSearch = model.traceSearch(source, 2);
editedSearch.values[0] = 999;
editedSearch.steps[0].value = 999;
equal(source, [1, 2, 3], 'mutating returned search data cannot mutate its input');
equal(model.traceSearch(source, 2).steps[0].value, 1, 'search calls share no mutable state');
const editedWork = model.traceWork(3, 'nested');
editedWork.steps[0].count = 999;
equal(model.traceWork(3, 'nested').steps[0].count, 1, 'work calls share no mutable state');

const browser = {};
vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), browser, { filename: modelPath });
equal(typeof browser.AAWeekTwo.traceSearch, 'function', 'browser exposes the search model');
equal(typeof browser.AAWeekTwo.traceWork, 'function', 'browser exposes the loop model');
for (const mode of ['single', 'sequential', 'nested']) {
  equal(JSON.parse(JSON.stringify(browser.AAWeekTwo.traceWork(4, mode))), model.traceWork(4, mode),
    'browser and CommonJS work models agree');
}
equal(JSON.parse(JSON.stringify(browser.AAWeekTwo.traceSearch([12, 5, 19, 5], 19))),
  model.traceSearch([12, 5, 19, 5], 19), 'browser and CommonJS search models agree');
equal(browser.AAWeekTwo.traceSearch([], 0).comparisons, 0, 'browser supports empty search');
equal(browser.AAWeekTwo.traceWork(0, 'nested').count, 0, 'browser supports empty work');

const report = {
  status: 'passed', assertions, searchCases, workCases,
  coverage: [
    'First-occurrence equality counts, missing target, repeated and empty inputs',
    'All 0..32 sizes for single, sequential and nested value-equality tests',
    'Ordered and self-inclusive pairs, inner-index restart, exact n/2n/n² counts',
    'Doubling-size behavior and n=0/1/2 exceptions',
    'Invalid inputs, no input mutation, independent calls, browser/CommonJS parity'
  ]
};
const reportIndex = process.argv.indexOf('--report');
if (reportIndex !== -1) {
  if (!process.argv[reportIndex + 1]) throw new Error('--report requires an output path.');
  const reportPath = path.resolve(process.argv[reportIndex + 1]);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
