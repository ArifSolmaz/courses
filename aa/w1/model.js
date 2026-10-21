(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.AAWeekOne = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MAX_VALUES = 12;

  function requireInteger(value, label) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError(label + ' güvenli bir tam sayı olmalıdır.');
    }
  }

  function trace(values, target) {
    if (!Array.isArray(values)) {
      throw new TypeError('Değerler bir dizi olmalıdır.');
    }
    if (values.length > MAX_VALUES) {
      throw new RangeError('En fazla ' + MAX_VALUES + ' değer kullanılabilir.');
    }
    requireInteger(target, 'Aranan değer');

    // Copy and validate every slot, including holes in a sparse input array.
    var copy = [];
    for (var index = 0; index < values.length; index += 1) {
      requireInteger(values[index], (index + 1) + '. değer');
      copy.push(values[index]);
    }

    var steps = [];
    var position = null;
    var comparisons = 0;

    for (var cursor = 0; cursor < copy.length; cursor += 1) {
      // Only a value-equality test counts as a comparison in this lesson.
      comparisons += 1;
      var equal = copy[cursor] === target;
      steps.push({
        position: cursor + 1,
        value: copy[cursor],
        equal: equal,
        comparisons: comparisons
      });
      if (equal) {
        position = cursor + 1;
        break;
      }
    }

    return {
      values: copy,
      target: target,
      steps: steps,
      position: position,
      comparisons: comparisons
    };
  }

  return Object.freeze({ trace: trace });
}));
