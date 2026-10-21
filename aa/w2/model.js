(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AAWeekTwo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_N = 32;
  const MODES = ['single', 'sequential', 'nested'];

  function requireInteger(value, name) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError(name + ' must be a finite safe integer.');
    }
  }

  // Search counts only value === target, stopping at the first matching position.
  function traceSearch(values, target) {
    if (!Array.isArray(values)) throw new TypeError('values must be an array.');
    if (values.length > MAX_N) throw new RangeError('At most 32 values are supported.');
    requireInteger(target, 'target');
    for (let index = 0; index < values.length; index += 1) {
      requireInteger(values[index], 'Every value');
    }

    const steps = [];
    let position = null;
    for (let index = 0; index < values.length; index += 1) {
      const equal = values[index] === target;
      steps.push({ position: index + 1, value: values[index], equal, comparisons: steps.length + 1 });
      if (equal) {
        position = index + 1;
        break;
      }
    }
    return { values: values.slice(), target, steps, position, comparisons: steps.length };
  }

  // Every body executes one value-equality test, including false results. The
  // single scan tests all n values against a fixed target; sequential scans use
  // two targets in two complete passes. Neither scan returns early. Nested scans
  // test every ordered position pair, including i === j and the reverse pair.
  // Loop conditions, increments and assignments are outside the chosen unit.
  function traceWork(n, mode) {
    requireInteger(n, 'n');
    if (n < 0 || n > MAX_N) throw new RangeError('n must be between 0 and 32.');
    if (!MODES.includes(mode)) throw new TypeError('Unknown loop mode.');

    const steps = [];
    function recordEquality(pass, i, j) {
      steps.push({ pass, i, j, count: steps.length + 1 });
    }

    if (mode === 'nested') {
      for (let i = 1; i <= n; i += 1) {
        for (let j = 1; j <= n; j += 1) recordEquality(1, i, j);
      }
    } else {
      const passes = mode === 'sequential' ? 2 : 1;
      for (let pass = 1; pass <= passes; pass += 1) {
        for (let i = 1; i <= n; i += 1) recordEquality(pass, i, null);
      }
    }
    return { n, mode, steps, count: steps.length };
  }

  return Object.freeze({ traceSearch, traceWork });
});
