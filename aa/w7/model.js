(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek7 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // Public API: traceMerge(left,right), traceSort(records), growth(n).
  // Record identity is tag, not key. Equal keys remain separate records.
  // start/end are zero-based half-open ranges. Placement means appending one
  // record into one merge output, including copied tails; it is not a count
  // of physical memory writes. Calls count only recursive sort invocations.
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function recordCopy(record) { return { key: record.key, value: record.value, tag: record.tag }; }
  function recordsCopy(records) { return records.map(recordCopy); }
  function validate(records) {
    if (!Array.isArray(records) || records.length > 32) throw new TypeError('En fazla 32 kayıt içeren bir dizi gerekir.');
    const tags = new Set();
    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      if (!record || typeof record !== 'object' || Array.isArray(record)
        || !Number.isSafeInteger(record.key) || record.key < 0
        || typeof record.value !== 'string' || record.value.length > 200
        || typeof record.tag !== 'string' || !record.tag.trim() || record.tag.length > 24
        || tags.has(record.tag)) throw new TypeError('Kayıtlar güvenli cihaz anahtarı, metin değer ve benzersiz kayıt etiketi içermelidir.');
      tags.add(record.tag);
    }
  }
  function ordered(records) { return records.every(function (record, index) { return index === 0 || records[index - 1].key <= record.key; }); }
  function counts() { return { comparisons: 0, placements: 0, calls: 0, baseCalls: 0 }; }
  function stats() { return { maxDepth: 0, merges: 0 }; }
  function mergeState(nodeId, left, right) { return { nodeId: nodeId, left: recordsCopy(left), right: recordsCopy(right), leftIndex: 0, rightIndex: 0, out: [] }; }
  function nodeInfo(nodeId, depth, start, end) { return { nodeId: nodeId, depth: depth, start: start, end: end }; }
  function emit(steps, type, node, detail, state, totals, metrics) {
    steps.push(Object.assign({ step: steps.length + 1, type: type }, node, detail, { state: copy(state), counts: copy(totals), stats: copy(metrics) }));
  }
  function complete(state, node, base, result) {
    const frame = state.stack.pop();
    if (!frame || frame.nodeId !== node.nodeId) throw new Error('Çağrı yığını ile tamamlanan parça eşleşmiyor.');
    state.completed.push(Object.assign({}, node, { base: base, result: recordsCopy(result) }));
  }
  function merge(left, right, node, state, totals, metrics, steps) {
    state.merge = mergeState(node.nodeId, left, right); metrics.merges += 1;
    const empty = left.length + right.length === 0;
    if (empty) complete(state, node, false, []);
    emit(steps, 'merge-start', node, { left: recordsCopy(left), right: recordsCopy(right), returned: empty }, state, totals, metrics);
    const current = state.merge;
    while (current.leftIndex < left.length || current.rightIndex < right.length) {
      const compared = current.leftIndex < left.length && current.rightIndex < right.length;
      let heads = null, comparison = null, side;
      if (compared) {
        heads = { left: recordCopy(left[current.leftIndex]), right: recordCopy(right[current.rightIndex]) };
        comparison = heads.left.key < heads.right.key ? -1 : heads.left.key > heads.right.key ? 1 : 0;
        totals.comparisons += 1; side = comparison <= 0 ? 'left' : 'right';
      } else side = current.leftIndex < left.length ? 'left' : 'right';
      const record = side === 'left' ? left[current.leftIndex++] : right[current.rightIndex++];
      current.out.push(recordCopy(record)); totals.placements += 1;
      const returned = current.out.length === left.length + right.length;
      if (returned) complete(state, node, false, current.out);
      emit(steps, 'take', node, { side: side, record: recordCopy(record), compared: compared, comparison: comparison, heads: heads, tail: !compared, returned: returned }, state, totals, metrics);
    }
    return recordsCopy(current.out);
  }
  function envelope(operation, initial, initialState, steps, result, totals, metrics) {
    return { operation: operation, initial: recordsCopy(initial), initialState: copy(initialState), steps: steps, result: recordsCopy(result), counts: copy(totals), stats: copy(metrics) };
  }
  function traceMerge(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right)) throw new TypeError('İki sıralı kayıt dizisi gerekir.');
    validate(left.concat(right));
    if (!ordered(left) || !ordered(right)) throw new RangeError('Birleştirme girdilerinin her biri önceden sıralı olmalıdır.');
    const initial = recordsCopy(left.concat(right)), node = nodeInfo('M', 0, 0, initial.length), totals = counts(), metrics = stats(), steps = [];
    const state = { stack: [], merge: mergeState('M', left, right), completed: [] }, initialState = copy(state);
    state.stack.push(Object.assign({}, node, { records: recordsCopy(initial) }));
    const result = merge(left, right, node, state, totals, metrics, steps);
    return envelope('merge', initial, initialState, steps, result, totals, metrics);
  }
  function traceSort(records) {
    validate(records);
    const initial = recordsCopy(records), totals = counts(), metrics = stats(), steps = [];
    const state = { stack: [], merge: null, completed: [] }, initialState = copy(state);
    function sort(part, start, end, depth, nodeId) {
      const node = nodeInfo(nodeId, depth, start, end);
      totals.calls += 1; metrics.maxDepth = Math.max(metrics.maxDepth, depth);
      state.stack.push(Object.assign({}, node, { records: recordsCopy(part) })); state.merge = null;
      if (part.length <= 1) {
        totals.baseCalls += 1; complete(state, node, true, part);
        emit(steps, 'base', node, { records: recordsCopy(part), result: recordsCopy(part), returned: true }, state, totals, metrics);
        return recordsCopy(part);
      }
      const leftLength = Math.floor(part.length / 2), mid = start + leftLength;
      const left = part.slice(0, leftLength), right = part.slice(leftLength);
      emit(steps, 'split', node, { mid: mid, left: recordsCopy(left), right: recordsCopy(right) }, state, totals, metrics);
      const sortedLeft = sort(left, start, mid, depth + 1, nodeId + 'L');
      const sortedRight = sort(right, mid, end, depth + 1, nodeId + 'R');
      return merge(sortedLeft, sortedRight, node, state, totals, metrics, steps);
    }
    const result = sort(initial, 0, initial.length, 0, 'R');
    return envelope('sort', initial, initialState, steps, result, totals, metrics);
  }
  function growth(n) {
    if (!Number.isSafeInteger(n) || n < 1 || n > 1024 || !Number.isInteger(Math.log2(n))) throw new RangeError('n, 1 ile 1024 arasında ikinin bir kuvveti olmalıdır.');
    const levels = Math.log2(n);
    return { n: n, levels: levels, placements: n * levels, quadratic: n * n };
  }
  return Object.freeze({ traceMerge: traceMerge, traceSort: traceSort, growth: growth });
});
