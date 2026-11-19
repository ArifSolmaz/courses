'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w1/model.js');
const model = require(modelPath);
let assertions = 0;
let cases = 0;

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

function verify(values, target) {
  cases += 1;
  const original = values.slice();
  const foundIndex = values.findIndex(value => value === target);
  const expectedPosition = foundIndex < 0 ? null : foundIndex + 1;
  const expectedCount = foundIndex < 0 ? values.length : foundIndex + 1;
  const result = model.trace(values, target);
  equal(result.position, expectedPosition, 'first occurrence uses a 1-based position');
  equal(result.comparisons, expectedCount, 'one equality comparison per visited value');
  equal(result.steps.length, expectedCount, 'one trace step per equality comparison');
  equal(result.values, original, 'returned values preserve order');
  check(result.values !== values, 'returned array is independent of the input');
  equal(values, original, 'input remains unchanged');
  equal(result.target, target, 'target is preserved');
  result.steps.forEach((step, index) => {
    equal(step.position, index + 1, 'trace positions start at 1');
    equal(step.value, values[index], 'trace visits the value at that position');
    equal(step.equal, values[index] === target, 'equality flag is correct');
    equal(step.comparisons, index + 1, 'comparison count grows by one');
    check(values.slice(0, index).every(value => value !== target),
      'all earlier values are known not to match');
    check(!step.equal || index === result.steps.length - 1,
      'the trace stops immediately at the first match');
  });
  equal(model.trace(values, target), result, 'trace is deterministic');
  return result;
}

equal(Object.keys(model), ['trace'], 'public API stays small');

equal(verify([12, 5, 19, 5], 19), {
  values: [12, 5, 19, 5],
  target: 19,
  steps: [
    { position: 1, value: 12, equal: false, comparisons: 1 },
    { position: 2, value: 5, equal: false, comparisons: 2 },
    { position: 3, value: 19, equal: true, comparisons: 3 }
  ],
  position: 3,
  comparisons: 3
}, 'guided example has exactly three tests');
equal(verify([31, 8, 31, 14], 31).comparisons, 1,
  'transfer example stops at the first repeated value');
equal(verify([12, 5, 19, 5], 20).comparisons, 4,
  'absent target requires every value to be tested');
equal(verify([], 20), {
  values: [], target: 20, steps: [], position: null, comparisons: 0
}, 'empty input has no comparison');
verify([0], 0);
verify([-4, 0, -4], -4);
verify([2, 2, 2], 2);
verify([3, 6, 9], 9);
verify([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], Number.MAX_SAFE_INTEGER);
verify(Array.from({ length: 12 }, (_, index) => index - 6), 100);
verify(Object.freeze([12, 5, 19, 5]), 19);

// An independent native first-index lookup is the oracle for every small case.
const alphabet = [-1, 0, 2];
const targets = [-1, 0, 1, 2];
function enumerate(prefix, remaining) {
  if (remaining === 0) {
    for (const target of targets) verify(prefix, target);
    return;
  }
  for (const value of alphabet) enumerate(prefix.concat(value), remaining - 1);
}
for (let length = 0; length <= 6; length += 1) enumerate([], length);

for (const badValues of [null, undefined, {}, '1,2', 4, new Int32Array([1, 2])]) {
  rejects(() => model.trace(badValues, 2), TypeError, 'non-array input is rejected');
}
for (const badNumber of [NaN, Infinity, -Infinity, 1.5, '2', null, undefined,
  true, {}, [], Number.MAX_SAFE_INTEGER + 1, Number.MIN_SAFE_INTEGER - 1, 1n]) {
  rejects(() => model.trace([badNumber], 2), TypeError, 'invalid array value is rejected');
  rejects(() => model.trace([], badNumber), TypeError, 'invalid target is rejected');
}
rejects(() => model.trace(new Array(2), 2), TypeError, 'sparse arrays are rejected');
rejects(() => model.trace([2, 3.5], 2), TypeError,
  'even unused values after a potential match are validated');
rejects(() => model.trace(Array(13).fill(0), 0), RangeError, 'length is limited to 12');

const input = [1, 2, 3];
const independent = model.trace(input, 2);
independent.values[0] = 999;
independent.steps[0].value = 999;
equal(input, [1, 2, 3], 'editing output cannot mutate the original input');
equal(model.trace(input, 2).steps[0].value, 1, 'traces share no state between calls');

const browser = {};
vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), browser, { filename: modelPath });
equal(typeof browser.AAWeekOne.trace, 'function', 'browser exposes AAWeekOne.trace');
equal(JSON.parse(JSON.stringify(browser.AAWeekOne.trace([12, 5, 19, 5], 19))),
  model.trace([12, 5, 19, 5], 19), 'browser and CommonJS traces agree');
equal(browser.AAWeekOne.trace([], 0).comparisons, 0, 'browser handles empty input');

console.log(JSON.stringify({
  status: 'passed',
  assertions,
  traceCases: cases,
  exhaustiveCases: 4372,
  checked: [
    'first occurrence and 1-based positions',
    'one equality test per trace step',
    'unmatched-prefix invariant and immediate stopping',
    'absence, empty input, duplicates, zero, negatives, safe limits',
    'input validation, immutability, browser and CommonJS API'
  ]
}, null, 2));
