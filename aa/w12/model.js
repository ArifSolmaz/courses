(function (root) {
  'use strict';

  /* Fresh Week 12: exactly-k-edge walks, not simple paths.
   * Repeated vertices/edges are allowed, and reaching the target early does not
   * stop recursion. Each choice is an edge extension; r=0 is tested before the
   * optional nonnegative-cost bound. Only one minimum is required: equal-cost
   * candidates keep the first walk found in ascending-neighbor DFS order.
   *
   * API: traceWalks(vertices, triples, source, target, k, {prune:false}).
   * Frames have 1-based invocation IDs; depth starts at 0. state.current is an
   * invocation ID, never a vertex ID. A choose announces an edge without calling
   * its child; enter is the separate next step. A terminal announces a valid or
   * invalid leaf without updating the incumbent; a strict improvement is a
   * separate record step. enter and return clear the active edge.
   *
   * counts are logical events, not runtime/physical memory operations:
   * calls, extensions, terminals, valid, improvements, prunes, returns.
   * Validation and the resource-limit preflight are outside these counters.
   * Both modes reject an unpruned tree of more than 5,000 invocations, rather
   * than return a truncated search or an unproved optimum. k is limited to 0..6.
   */
  const MAX_VERTICES = 32, MAX_K = 6, MAX_CALLS = 5000, MAX_WEIGHT = 1000000;
  const safeId = value => Number.isSafeInteger(value) && value >= 0;
  const cloneFrame = frame => ({ id: frame.id, parentId: frame.parentId,
    vertex: frame.vertex, remaining: frame.remaining, cost: frame.cost,
    path: frame.path.slice(), depth: frame.depth });

  function graph(vertices, triples) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > MAX_VERTICES)
      throw new RangeError('Use 1–32 distinct nonnegative safe-integer device IDs.');
    const ids = [], known = new Set();
    for (const raw of vertices) {
      if (!safeId(raw) || known.has(raw)) throw new TypeError('Device IDs must be unique nonnegative safe integers.');
      const id = raw === 0 ? 0 : raw; known.add(id); ids.push(id);
    }
    ids.sort((a, b) => a - b);
    if (!Array.isArray(triples)) throw new TypeError('Edges must be an array of [u,v,weight] triples.');
    const edges = [], seen = new Set(), adjacency = Object.create(null);
    ids.forEach(id => { adjacency[id] = []; });
    for (const edge of triples) {
      if (!Array.isArray(edge) || edge.length !== 3) throw new TypeError('Each edge must contain exactly two IDs and a weight.');
      const [a, b, weight] = edge;
      if (!safeId(a) || !safeId(b) || !known.has(a) || !known.has(b) || a === b)
        throw new TypeError('Use existing distinct endpoints; self-loops are not part of this simple undirected graph.');
      if (!Number.isSafeInteger(weight) || weight < 0 || weight > MAX_WEIGHT)
        throw new RangeError('Every input edge, including remote edges, must have integer weight 0..1000000.');
      const u = Math.min(a, b) === 0 ? 0 : Math.min(a, b), v = Math.max(a, b), id = u + '-' + v;
      if (seen.has(id)) throw new TypeError('An undirected edge may appear only once, including its reverse.');
      seen.add(id); edges.push({ id, u, v, weight });
      adjacency[u].push({ to: v, weight }); adjacency[v].push({ to: u, weight });
    }
    ids.forEach(id => adjacency[id].sort((a, b) => a.to - b.to));
    return { ids, edges, adjacency, known };
  }

  // Counts all walk prefixes without materializing their paths. Saturation is
  // only for rejecting an excessive request; it never changes a returned trace.
  function checkBudget(ids, adjacency, source, k) {
    let frontier = new Map([[source, 1]]), calls = 1;
    for (let depth = 0; depth < k; depth += 1) {
      const next = new Map();
      for (const [u, count] of frontier) for (const edge of adjacency[u])
        next.set(edge.to, Math.min(MAX_CALLS + 1, (next.get(edge.to) || 0) + count));
      for (const count of next.values()) calls = Math.min(MAX_CALLS + 1, calls + count);
      if (calls > MAX_CALLS) throw new RangeError('The unpruned choice tree exceeds the 5000-call teaching limit. No partial result was returned.');
      frontier = next;
    }
  }

  function traceWalks(vertices, triples, source, target, k, options) {
    const g = graph(vertices, triples);
    if (!safeId(source) || !g.known.has(source) || !safeId(target) || !g.known.has(target))
      throw new TypeError('Source and target must be device IDs in the graph.');
    if (!Number.isSafeInteger(k) || k < 0 || k > MAX_K) throw new RangeError('k must be an integer from 0 through 6.');
    if (options === undefined) options = {};
    if (options === null || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Options must be an object.');
    const prune = options.prune === undefined ? false : options.prune;
    if (typeof prune !== 'boolean') throw new TypeError('prune must be true or false.');
    source = source === 0 ? 0 : source; target = target === 0 ? 0 : target;
    checkBudget(g.ids, g.adjacency, source, k);
    const state = { stack: [], current: null, activeEdge: null, bestCost: null, bestPath: null, done: false };
    const counts = { calls: 0, extensions: 0, terminals: 0, valid: 0, improvements: 0, prunes: 0, returns: 0 };
    const snapshot = () => ({ stack: state.stack.map(cloneFrame), current: state.current,
      activeEdge: state.activeEdge ? { ...state.activeEdge } : null,
      bestCost: state.bestCost, bestPath: state.bestPath ? state.bestPath.slice() : null, done: state.done });
    const initialState = snapshot(), steps = []; let nextId = 1;
    function emit(type, detail) { steps.push({ step: steps.length + 1, type, ...detail, state: snapshot(), counts: { ...counts } }); }
    function visit(vertex, remaining, cost, path, parentId) {
      const frame = { id: nextId++, parentId, vertex, remaining, cost, path: path.slice(), depth: k - remaining };
      state.stack.push(frame); state.current = frame.id; state.activeEdge = null;
      counts.calls += 1; emit('enter', { node: cloneFrame(frame) });
      if (remaining === 0) {
        const valid = vertex === target, improves = valid && (state.bestCost === null || cost < state.bestCost);
        counts.terminals += 1; if (valid) counts.valid += 1;
        emit('terminal', { nodeId: frame.id, valid, cost, improves });
        if (improves) {
          const previousBest = state.bestCost; state.bestCost = cost; state.bestPath = path.slice(); counts.improvements += 1;
          emit('record', { nodeId: frame.id, previousBest, bestCost: cost, path: path.slice() });
        }
      } else if (prune && state.bestCost !== null && cost >= state.bestCost) {
        counts.prunes += 1; emit('prune', { nodeId: frame.id, cost, bound: state.bestCost });
      } else if (g.adjacency[vertex].length === 0) {
        emit('deadend', { nodeId: frame.id });
      } else {
        for (const edge of g.adjacency[vertex]) {
          const nextCost = cost + edge.weight;
          if (!Number.isSafeInteger(nextCost)) throw new RangeError('Walk cost exceeded safe-integer arithmetic.');
          state.activeEdge = { from: vertex, to: edge.to, weight: edge.weight }; counts.extensions += 1;
          emit('choose', { nodeId: frame.id, from: vertex, to: edge.to, weight: edge.weight, nextRemaining: remaining - 1, nextCost });
          visit(edge.to, remaining - 1, nextCost, path.concat(edge.to), frame.id);
        }
      }
      state.stack.pop(); state.current = parentId; state.activeEdge = null; counts.returns += 1;
      emit('return', { nodeId: frame.id });
    }
    visit(source, k, 0, [source], null); state.done = true; emit('complete', {});
    return { operation: 'walks', vertices: g.ids.slice(), edges: g.edges.map(edge => ({ ...edge })),
      adjacency: Object.fromEntries(g.ids.map(id => [id, g.adjacency[id].map(edge => ({ ...edge }))])),
      source, target, k, prune, initialState, steps,
      result: { bestCost: state.bestCost, bestPath: state.bestPath ? state.bestPath.slice() : null, found: state.bestCost !== null },
      counts: { ...counts } };
  }
  const api = Object.freeze({ traceWalks });
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek12 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
