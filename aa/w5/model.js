(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AAWeekFive = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validKey(key) { if (!Number.isSafeInteger(key) || key < 0) throw new TypeError('Anahtar negatif olmayan güvenli bir tam sayı olmalıdır.'); }
  function validValue(value) { if (typeof value !== 'string' || value.length > 200) throw new TypeError('Kayıt değeri en fazla 200 karakterli bir metin olmalıdır.'); }
  function validate(entries, structure, options) {
    if (!Array.isArray(entries) || entries.length > 32) throw new TypeError('En fazla 32 giriş içeren bir kayıt dizisi gerekir.');
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError('Her kayıt key ve value içermelidir.');
      validKey(entry.key); validValue(entry.value);
    }
    if (structure !== 'bst' && structure !== 'hash') throw new TypeError('Yapı bst veya hash olmalıdır.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Seçenekler bir nesne olmalıdır.');
    const m = options.m === undefined ? 5 : options.m;
    if (!Number.isSafeInteger(m) || m < 1 || m > 16) throw new RangeError('Kova sayısı 1 ile 16 arasında bir tam sayı olmalıdır.');
    return m;
  }
  function counts() { return { nodeComparisons: 0, bucketKeyChecks: 0, hashComputations: 0, recordSets: 0 }; }
  function emptyState(structure, m) {
    return structure === 'bst'
      ? { root: null, nodes: [], active: null, path: [], stats: { size: 0, height: -1 } }
      : { m: m, buckets: Array.from({ length: m }, function () { return []; }), activeBucket: null, activeOffset: null, stats: { size: 0, alpha: 0, maxBucketLength: 0 } };
  }
  function refresh(state, structure) {
    if (structure === 'bst') {
      const nodes = new Map(state.nodes.map(function (node) { return [node.key, node]; }));
      function height(key) {
        if (key === null) return -1;
        const node = nodes.get(key);
        return 1 + Math.max(height(node.left), height(node.right));
      }
      state.stats = { size: state.nodes.length, height: height(state.root) };
    } else {
      const size = state.buckets.reduce(function (total, bucket) { return total + bucket.length; }, 0);
      state.stats = { size: size, alpha: size / state.m, maxBucketLength: Math.max.apply(null, state.buckets.map(function (bucket) { return bucket.length; })) };
    }
  }
  function resetTraversal(state, structure) {
    if (structure === 'bst') { state.active = null; state.path = []; }
    else { state.activeBucket = null; state.activeOffset = null; }
  }
  function emit(steps, operation, state, totals, entry) {
    if (!steps) return;
    const step = Object.assign({ step: steps.length + 1 }, operation);
    if (entry !== undefined) step.entry = entry;
    step.state = copy(state); step.counts = copy(totals); steps.push(step);
  }
  function find(state, key, structure, totals, steps, entry) {
    resetTraversal(state, structure);
    if (structure === 'bst') {
      const nodes = new Map(state.nodes.map(function (node) { return [node.key, node]; }));
      let current = state.root, parent = null, direction = null;
      while (current !== null) {
        const node = nodes.get(current);
        const relation = node.key < key ? -1 : node.key > key ? 1 : 0;
        direction = relation < 0 ? 'right' : relation > 0 ? 'left' : 'found';
        state.active = node.key; state.path.push(node.key); totals.nodeComparisons += 1;
        emit(steps, { op: 'compare-node', key: node.key, target: key, relation: relation, direction: direction }, state, totals, entry);
        if (relation === 0) return { record: node, parent: parent, direction: direction };
        parent = node; current = node[direction];
      }
      // Reaching a null child does not compare an additional key.
      return { record: null, parent: parent, direction: direction };
    }
    const bucketIndex = key % state.m;
    state.activeBucket = bucketIndex; totals.hashComputations += 1;
    emit(steps, { op: 'hash', key: key, m: state.m, bucketIndex: bucketIndex }, state, totals, entry);
    const bucket = state.buckets[bucketIndex];
    for (let i = 0; i < bucket.length; i += 1) {
      state.activeOffset = i + 1; totals.bucketKeyChecks += 1;
      const equal = bucket[i].key === key;
      emit(steps, { op: 'compare-key', key: bucket[i].key, target: key, equal: equal, bucketIndex: bucketIndex, offset: i + 1 }, state, totals, entry);
      if (equal) return { record: bucket[i], bucketIndex: bucketIndex, offset: i + 1 };
    }
    return { record: null, bucketIndex: bucketIndex };
  }
  function setRecord(state, key, value, structure, totals, steps, entry) {
    const location = find(state, key, structure, totals, steps, entry);
    const updated = location.record !== null;
    if (!updated && state.stats.size >= 32) throw new RangeError('Bu ders modelinde en fazla 32 ayrı anahtar tutulabilir.');
    if (updated) location.record.value = value;
    else if (structure === 'bst') {
      const node = { key: key, value: value, left: null, right: null }; state.nodes.push(node);
      if (location.parent === null) state.root = key;
      else location.parent[location.direction] = key;
    } else state.buckets[location.bucketIndex].push({ key: key, value: value });
    if (structure === 'bst') state.active = key;
    else state.activeOffset = updated ? location.offset : state.buckets[location.bucketIndex].length;
    totals.recordSets += 1; refresh(state, structure);
    // One logical dictionary set, not a claim of one physical memory write.
    emit(steps, { op: 'set-record', key: key, value: value, updated: updated }, state, totals, entry);
    return { key: key, value: value, updated: updated };
  }
  function canonicalRecords(entries) {
    const records = new Map();
    entries.forEach(function (entry) { records.set(entry.key, { key: entry.key, value: entry.value }); });
    return Array.from(records.values());
  }
  function prepared(entries, structure, m) {
    const state = emptyState(structure, m), ignored = counts();
    entries.forEach(function (entry) { setRecord(state, entry.key, entry.value, structure, ignored, null); });
    resetTraversal(state, structure); return state;
  }
  function resultEnvelope(entries, structure, initial, steps, totals, state, records, result) {
    return { entries: entries.map(function (entry) { return { key: entry.key, value: entry.value }; }), structure: structure, initial: copy(initial), steps: steps, counts: copy(totals), state: copy(state), records: copy(records), stats: copy(state.stats), result: copy(result) };
  }
  function traceBuild(entries, structure, options) {
    if (structure === undefined) structure = 'bst'; if (options === undefined) options = {};
    const m = validate(entries, structure, options), state = emptyState(structure, m), initial = copy(state), steps = [], totals = counts();
    entries.forEach(function (entry, index) { setRecord(state, entry.key, entry.value, structure, totals, steps, index + 1); });
    const records = canonicalRecords(entries);
    return resultEnvelope(entries, structure, initial, steps, totals, state, records, records);
  }
  function traceGet(entries, key, structure, options) {
    if (structure === undefined) structure = 'bst'; if (options === undefined) options = {};
    const m = validate(entries, structure, options); validKey(key);
    const state = prepared(entries, structure, m), initial = copy(state), steps = [], totals = counts();
    const found = find(state, key, structure, totals, steps).record;
    const result = found === null ? null : { key: found.key, value: found.value };
    return resultEnvelope(entries, structure, initial, steps, totals, state, canonicalRecords(entries), result);
  }
  function traceSet(entries, key, value, structure, options) {
    if (structure === undefined) structure = 'bst'; if (options === undefined) options = {};
    const m = validate(entries, structure, options); validKey(key); validValue(value);
    const state = prepared(entries, structure, m), initial = copy(state), steps = [], totals = counts();
    const result = setRecord(state, key, value, structure, totals, steps);
    const records = canonicalRecords(entries), existing = records.find(function (record) { return record.key === key; });
    if (existing) existing.value = value; else records.push({ key: key, value: value });
    return resultEnvelope(entries, structure, initial, steps, totals, state, records, result);
  }
  return Object.freeze({ traceBuild: traceBuild, traceGet: traceGet, traceSet: traceSet });
});
