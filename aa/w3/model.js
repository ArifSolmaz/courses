(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AAWeekThree = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  const MAX_N = 1000000;
  const MAX_VALUES = 32;

  function growth(n) {
    if (!Number.isSafeInteger(n) || n < 0 || n > MAX_N) {
      throw new RangeError('n, 0 ile 1.000.000 arasında bir tam sayı olmalıdır.');
    }
    return {
      n: n,
      linear: 2 * n,
      quadratic: n * n,
      doubleN: 2 * n,
      linearAtDouble: 4 * n,
      quadraticAtDouble: 4 * n * n
    };
  }

  function validateSearch(values, target, mode) {
    if (!Array.isArray(values) || values.length > MAX_VALUES) {
      throw new TypeError('Arama dizisi en fazla 32 öğe içeren bir dizi olmalıdır.');
    }
    for (let i = 0; i < values.length; i += 1) {
      if (!Number.isSafeInteger(values[i]) || (i > 0 && values[i - 1] >= values[i])) {
        throw new TypeError('Dizi, artan sırada ve birbirinden farklı güvenli tam sayılar içermelidir.');
      }
    }
    if (!Number.isSafeInteger(target)) {
      throw new TypeError('Aranan değer güvenli bir tam sayı olmalıdır.');
    }
    if (mode !== 'linear' && mode !== 'binary') {
      throw new TypeError('Arama yöntemi linear veya binary olmalıdır.');
    }
  }

  // A probe is one abstract three-way comparison of a key with the target.
  // Positions and interval ends in the trace use the lesson's one-based notation.
  function traceSearch(values, target, mode) {
    if (mode === undefined) mode = 'binary';
    validateSearch(values, target, mode);
    const source = values.slice();
    const steps = [];
    let left = 1;
    let right = source.length;
    let found = null;

    while (left <= right) {
      const position = mode === 'binary' ? Math.floor((left + right) / 2) : left;
      const value = source[position - 1];
      const relation = value < target ? -1 : value > target ? 1 : 0;
      let nextLeft = left;
      let nextRight = right;
      if (relation !== 0) {
        if (mode === 'linear' || relation < 0) nextLeft = position + 1;
        else nextRight = position - 1;
      }
      steps.push({
        probe: steps.length + 1,
        position: position,
        value: value,
        relation: relation,
        left: left,
        right: right,
        mid: mode === 'binary' ? position : null,
        candidatesBefore: [left, right],
        nextLeft: nextLeft,
        nextRight: nextRight
      });
      if (relation === 0) {
        found = position;
        break;
      }
      left = nextLeft;
      right = nextRight;
    }

    return {
      values: source,
      target: target,
      mode: mode,
      steps: steps,
      position: found,
      probes: steps.length
    };
  }

  return Object.freeze({ growth: growth, traceSearch: traceSearch });
});
