(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek14 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /*
   * Certificate verifier, not a search/decision/optimization solver.
   *
   * traceCertificate(vertices, weightedEdges, source, target, k, B,
   *                  certificate, { simple: true } = {})
   * - Domain errors in the graph/task/options throw. A malformed/unsuitable
   *   candidate is a normal rejection. No alternative candidate is examined.
   * - Undirected simple graph; 1..32 distinct nonnegative safe integer IDs;
   *   integer weights 0..1,000,000; 0 <= k < 32; B nonnegative safe integer.
   * - Candidate array cap: 64. A valid candidate has exactly k+1 records.
   * - Check order: format, length, all IDs, source, target, all repetitions
   *   (simple mode only), consecutive edges and separate additions, budget.
   *   First failure emits reject and stops. Equality to B is allowed.
   * - indices are zero-based certificate positions. For edge/add, index is
   *   the TARGET position (1..k). An add changes total; edge only checks it.
   * - counts are logical checks/additions, NOT comparisons/time. Graph
   *   preparation, copies for teaching, and UI drawing are outside them.
   * - checkedIds contains valid IDs (including repeats). uniqueIds follows
   *   successful repeat checks in insertion order. checkedEdges includes a
   *   missing attempted edge, with weight:null. Every step owns a snapshot.
   * - result.cost is null until ALL edges have been added; then it is their
   *   exact sum, including when a later budget check rejects the candidate.
   *   state.total is the sum actually added so far, even before rejection.
   *
   * Events / detail (all have ordinal,type,state,counts):
   * start {formatValid}; length {actual,expected,passed};
   * id {index,id,passed} (id:null for a non-integer token);
   * endpoint {kind,index,actual,expected,passed};
   * repeat {index,id,firstIndex,passed};
   * edge {index,from,to,exists,weight,passed};
   * add {index,from,to,weight,previous,total};
   * budget {total,B,passed}; accept {cost}; reject {reason,index}.
   *
   * transformHamiltonianST(vertices, unweightedEdgePairs, source, target)
   * only constructs the same graph with unit weights, k=B=|V|-1 and
   * simple:true. It does not find a path or answer the decision problem.
   */
  const MAX_VERTICES = 32;
  const MAX_K = MAX_VERTICES - 1;
  const MAX_CANDIDATE = 64;
  const MAX_WEIGHT = 1000000;
  const safeId = value => Number.isSafeInteger(value) && value >= 0;
  function requireId(value, name) {
    if (!safeId(value)) throw new TypeError(name + ' must be a nonnegative safe integer ID.');
  }
  function copy(value, memo) {
    if (value === null || typeof value !== 'object') return value;
    memo = memo || new WeakMap();
    if (memo.has(value)) return memo.get(value);
    const result = Array.isArray(value) ? [] : {};
    memo.set(value, result);
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      // Never evaluate a candidate object's accessor while copying invalid data.
      Object.defineProperty(result, key, { value: descriptor && 'value' in descriptor ? copy(descriptor.value, memo) : null, enumerable: true, writable: true, configurable: true });
    }
    if (Array.isArray(value)) result.length = value.length;
    return result;
  }
  function graph(vertices, edges, weighted) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > MAX_VERTICES) throw new RangeError('vertices must contain 1..32 IDs.');
    const ids = vertices.slice(), known = new Set();
    for (const id of ids) {
      requireId(id, 'vertex');
      if (known.has(id)) throw new RangeError('Vertex IDs must be distinct.');
      known.add(id);
    }
    ids.sort((a, b) => a - b);
    if (!Array.isArray(edges)) throw new TypeError('edges must be an array.');
    const normalized = [], weights = new Map();
    for (const entry of edges) {
      if (!Array.isArray(entry) || entry.length !== (weighted ? 3 : 2)) throw new TypeError('Each edge must be a ' + (weighted ? 'weighted triple.' : 'pair.'));
      const [a, b] = entry;
      requireId(a, 'edge endpoint'); requireId(b, 'edge endpoint');
      if (!known.has(a) || !known.has(b)) throw new RangeError('Every edge endpoint must be a vertex.');
      if (a === b) throw new RangeError('Self loops are outside this simple graph domain.');
      const u = Math.min(a, b), v = Math.max(a, b), id = u + '-' + v;
      if (weights.has(id)) throw new RangeError('Undirected edges must be unique, including reverse pairs.');
      const weight = weighted ? entry[2] : 1;
      if (!Number.isSafeInteger(weight) || weight < 0 || weight > MAX_WEIGHT) throw new RangeError('Every weight must be an integer from 0 to 1000000.');
      const edge = { id, u, v, weight };
      normalized.push(edge); weights.set(id, weight);
    }
    return { vertices: ids, edges: normalized, known, weights };
  }
  function taskEndpoints(g, source, target) {
    requireId(source, 'source'); requireId(target, 'target');
    if (!g.known.has(source) || !g.known.has(target)) throw new RangeError('Source and target must be graph vertices.');
  }
  function traceCertificate(vertices, edges, source, target, k, B, certificate, options) {
    const g = graph(vertices, edges, true);
    taskEndpoints(g, source, target);
    if (!Number.isSafeInteger(k) || k < 0 || k > MAX_K) throw new RangeError('k must be an integer satisfying 0 <= k < 32.');
    if (!Number.isSafeInteger(B) || B < 0) throw new RangeError('B must be a nonnegative safe integer.');
    if (options === undefined) options = {};
    if (options === null || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('options must be an object.');
    const simple = options.simple === undefined ? true : options.simple;
    if (typeof simple !== 'boolean') throw new TypeError('simple must be boolean.');
    const candidate = Array.isArray(certificate) ? copy(certificate) : null;
    const state = { phase: 'idle', index: null, checkedIds: [], uniqueIds: [], checkedEdges: [], total: 0, activeEdge: null, violation: null, accepted: null, done: false };
    const initialState = copy(state);
    const counts = { lengthChecks: 0, idChecks: 0, endpointChecks: 0, repeatChecks: 0, edgeChecks: 0, costAdds: 0, budgetChecks: 0 };
    const steps = [];
    let costComplete = false;
    function emit(type, detail) {
      steps.push({ ordinal: steps.length + 1, type, ...(detail || {}), state: copy(state), counts: copy(counts) });
    }
    function finish(accepted, reason, index) {
      state.phase = 'complete'; state.index = index; state.activeEdge = null;
      state.accepted = accepted; state.done = true;
      state.violation = accepted ? null : { reason, index };
      emit(accepted ? 'accept' : 'reject', accepted ? { cost: state.total } : { reason, index });
      return { operation: 'certificate', vertices: g.vertices.slice(), edges: copy(g.edges), source, target, k, B, simple, certificate: copy(candidate), initialState, steps, result: { accepted, reason, cost: costComplete ? state.total : null }, counts: copy(counts) };
    }
    state.phase = 'format';
    const formatValid = Array.isArray(certificate) && certificate.length <= MAX_CANDIDATE;
    emit('start', { formatValid });
    if (!formatValid) return finish(false, 'format', null);
    state.phase = 'length'; counts.lengthChecks++;
    const lengthPassed = candidate.length === k + 1;
    emit('length', { actual: candidate.length, expected: k + 1, passed: lengthPassed });
    if (!lengthPassed) return finish(false, 'length', null);
    state.phase = 'ids';
    for (let index = 0; index < candidate.length; index++) {
      state.index = index; counts.idChecks++;
      const raw = candidate[index], passed = safeId(raw) && g.known.has(raw);
      if (passed) state.checkedIds.push(raw);
      emit('id', { index, id: Number.isSafeInteger(raw) ? raw : null, passed });
      if (!passed) return finish(false, 'unknown-id', index);
    }
    state.phase = 'endpoints';
    for (const [kind, index, expected] of [['source', 0, source], ['target', k, target]]) {
      state.index = index; counts.endpointChecks++;
      const actual = candidate[index], passed = actual === expected;
      emit('endpoint', { kind, index, actual, expected, passed });
      if (!passed) return finish(false, kind, index);
    }
    if (simple) {
      state.phase = 'simple';
      const first = new Map();
      for (let index = 0; index < candidate.length; index++) {
        state.index = index; counts.repeatChecks++;
        const id = candidate[index], firstIndex = first.has(id) ? first.get(id) : null, passed = firstIndex === null;
        if (passed) { first.set(id, index); state.uniqueIds.push(id); }
        emit('repeat', { index, id, firstIndex, passed });
        if (!passed) return finish(false, 'repeat', index);
      }
    }
    state.phase = 'edges';
    for (let index = 1; index < candidate.length; index++) {
      state.index = index; counts.edgeChecks++;
      const from = candidate[index - 1], to = candidate[index], id = Math.min(from, to) + '-' + Math.max(from, to), exists = g.weights.has(id), weight = exists ? g.weights.get(id) : null;
      const attempted = { from, to, exists, weight };
      state.activeEdge = copy(attempted); state.checkedEdges.push(copy(attempted));
      emit('edge', { index, ...attempted, passed: exists });
      if (!exists) return finish(false, 'missing-edge', index);
      const previous = state.total; state.total += weight; counts.costAdds++;
      emit('add', { index, from, to, weight, previous, total: state.total });
    }
    costComplete = true;
    state.phase = 'budget'; state.index = null; state.activeEdge = null; counts.budgetChecks++;
    const budgetPassed = state.total <= B;
    emit('budget', { total: state.total, B, passed: budgetPassed });
    return finish(budgetPassed, budgetPassed ? 'valid' : 'budget', null);
  }
  function transformHamiltonianST(vertices, edges, source, target) {
    const g = graph(vertices, edges, false);
    taskEndpoints(g, source, target);
    return { vertices: g.vertices.slice(), edges: g.edges.map(e => [e.u, e.v, 1]), source, target, k: g.vertices.length - 1, B: g.vertices.length - 1, simple: true };
  }
  return Object.freeze({ traceCertificate, transformHamiltonianST, MAX_VERTICES, MAX_K, MAX_CANDIDATE, MAX_WEIGHT });
});
