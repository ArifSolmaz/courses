(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek9 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // Public API: traceDFS(vertices,edges,{firstRoot,neighborOrder}={}) and
  // validateTopologicalOrder(vertices,edges,order). The graph is directed;
  // opposite arrows are distinct and a self-loop is a permitted cycle.
  // Stack frames run bottom to top. inspect advances the caller cursor, but
  // an unseen child enters in the NEXT event. An arrow to an active vertex
  // is followed by a terminal cycle event; those calls do not finish/pop.
  // Separate counters count initialized rows, entries, adjacency entries and
  // normal finishes/returns. Graph preparation and teaching copies are excluded.
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validId(id) { return Number.isSafeInteger(id) && id >= 0; }
  function prepare(vertices, edges, options) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > 32
      || !Array.from(vertices).every(validId) || new Set(vertices).size !== vertices.length) throw new TypeError('1–32 benzersiz, negatif olmayan güvenli tam sayı düğüm gerekir.');
    const ids = vertices.slice().sort(function (a, b) { return a - b; }), known = new Set(ids);
    if (!Array.isArray(edges) || edges.length > ids.length * ids.length) throw new TypeError('Yönlü oklar bir dizi içinde verilmelidir.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('DFS seçenekleri bir nesne içinde verilmelidir.');
    const neighborOrder = options.neighborOrder === undefined ? 'ascending' : options.neighborOrder;
    if (neighborOrder !== 'ascending' && neighborOrder !== 'descending') throw new RangeError('Komşu sırası ascending veya descending olmalıdır.');
    const firstRoot = options.firstRoot;
    if (firstRoot !== undefined && (!validId(firstRoot) || !known.has(firstRoot))) throw new RangeError('İlk kök grafın bilinen bir düğümü olmalıdır.');
    const adjacency = Object.fromEntries(ids.map(function (id) { return [id, []]; })), seen = new Set();
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(validId)
        || !known.has(edge[0]) || !known.has(edge[1])) throw new TypeError('Her ok, grafın bilinen iki düğümü arasında olmalıdır.');
      const signature = edge[0] + ':' + edge[1];
      if (seen.has(signature)) throw new TypeError('Aynı yönlü ok iki kez verilemez.');
      seen.add(signature); adjacency[edge[0]].push(edge[1]);
    }
    ids.forEach(function (id) { adjacency[id].sort(function (a, b) { return neighborOrder === 'ascending' ? a - b : b - a; }); });
    const rootOrder = firstRoot === undefined ? ids.slice() : [firstRoot].concat(ids.filter(function (id) { return id !== firstRoot; }));
    return { vertices: ids, edges: edges.map(function (edge) { return edge.slice(); }), adjacency: adjacency, rootOrder: rootOrder, neighborOrder: neighborOrder };
  }
  function traceDFS(vertices, edges, options) {
    const graph = prepare(vertices, edges, options === undefined ? {} : options);
    const rows = graph.vertices.map(function (id) { return { id: id, status: 'unseen', parent: null }; });
    const byId = new Map(rows.map(function (row) { return [row.id, row]; }));
    const state = { stack: [], rows: rows, finished: [], activeEdge: null, done: false, cycle: null };
    const initialState = copy(state), steps = [];
    const counts = { initializations: 0, entries: 0, edgeScans: 0, returns: 0 }, stats = { maxStack: 0 };
    function emit(type, detail) { steps.push(Object.assign({ step: steps.length + 1, type: type }, detail, { state: copy(state), counts: copy(counts), stats: copy(stats) })); }
    counts.initializations = graph.vertices.length;
    emit('init', { vertices: graph.vertices.slice() });
    function visit(vertex, parent, root) {
      const row = byId.get(vertex); row.status = 'active'; row.parent = parent;
      state.stack.push({ vertex: vertex, nextIndex: 0 }); state.activeEdge = null;
      counts.entries += 1; stats.maxStack = Math.max(stats.maxStack, state.stack.length);
      emit('enter', { vertex: vertex, parent: parent, root: root });
      const frame = state.stack[state.stack.length - 1];
      for (let index = 0; index < graph.adjacency[vertex].length; index += 1) {
        const neighbor = graph.adjacency[vertex][index], classification = byId.get(neighbor).status;
        frame.nextIndex = index + 1; state.activeEdge = { from: vertex, to: neighbor }; counts.edgeScans += 1;
        emit('inspect', { from: vertex, to: neighbor, neighborIndex: index, classification: classification });
        if (classification === 'unseen') {
          if (!visit(neighbor, vertex, false)) return false;
        } else if (classification === 'active') {
          const start = state.stack.findIndex(function (item) { return item.vertex === neighbor; });
          state.cycle = state.stack.slice(start).map(function (item) { return item.vertex; }).concat([neighbor]); state.done = true;
          emit('cycle', { from: vertex, to: neighbor, cycle: state.cycle.slice() }); return false;
        }
      }
      state.stack.pop(); row.status = 'done'; state.finished.push(vertex); state.activeEdge = null; counts.returns += 1;
      emit('finish', { vertex: vertex }); return true;
    }
    for (const root of graph.rootOrder) {
      if (byId.get(root).status === 'unseen' && !visit(root, null, true)) break;
    }
    const acyclic = state.cycle === null;
    const topologicalOrder = acyclic ? state.finished.slice().reverse() : null;
    if (acyclic) { state.done = true; state.activeEdge = null; emit('complete', { topologicalOrder: topologicalOrder.slice() }); }
    const result = { acyclic: acyclic, fullTraversal: acyclic, topologicalOrder: topologicalOrder, cycle: state.cycle === null ? null : state.cycle.slice(), finished: state.finished.slice() };
    return Object.assign({ operation: 'dfs' }, graph, { initialState: initialState, steps: steps, result: result, counts: copy(counts), stats: copy(stats) });
  }
  function validateTopologicalOrder(vertices, edges, order) {
    const graph = prepare(vertices, edges, {}), known = new Set(graph.vertices);
    if (!Array.isArray(order) || order.length !== graph.vertices.length
      || !Array.from(order).every(function (id) { return validId(id) && known.has(id); }) || new Set(order).size !== order.length) return { valid: false, reason: 'not-permutation', violatingEdge: null };
    const positions = new Map(order.map(function (id, index) { return [id, index]; }));
    for (const edge of graph.edges) if (positions.get(edge[0]) >= positions.get(edge[1])) return { valid: false, reason: 'backward-edge', violatingEdge: edge.slice() };
    return { valid: true, reason: 'valid', violatingEdge: null };
  }
  return Object.freeze({ traceDFS: traceDFS, validateTopologicalOrder: validateTopologicalOrder });
});
