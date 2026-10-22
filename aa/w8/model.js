(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek8 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // Public API: traceBFS(vertices, edges, source, {neighborOrder} = {}),
  // shortestPath(trace, target). Vertices are unique nonnegative safe integers;
  // the graph is simple, undirected and nonempty (at most 32 vertices).
  // Each inspect scans ONE adjacency entry. Discovery, distance, parent and
  // enqueue happen together, before another entry is inspected. Thus a vertex
  // is enqueued once. A null distance means undiscovered until state.done,
  // and unreachable only after the source component has been fully explored.
  // Counts are distinct logical units, not seconds or physical writes.
  // Adjacency construction/sorting and teaching snapshots are outside them.
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validId(id) { return Number.isSafeInteger(id) && id >= 0; }
  function prepare(vertices, edges, source, options) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > 32
      || !Array.from(vertices).every(validId) || new Set(vertices).size !== vertices.length) throw new TypeError('1–32 benzersiz, negatif olmayan güvenli tam sayı düğüm gerekir.');
    const ordered = vertices.slice().sort(function (a, b) { return a - b; });
    const known = new Set(ordered);
    if (!validId(source) || !known.has(source)) throw new RangeError('Kaynak grafın bilinen bir düğümü olmalıdır.');
    if (!Array.isArray(edges) || edges.length > ordered.length * (ordered.length - 1) / 2) throw new TypeError('Yönsüz basit graf için bir kenar dizisi gerekir.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Komşu sırası seçenek nesnesiyle verilmelidir.');
    const neighborOrder = options.neighborOrder === undefined ? 'ascending' : options.neighborOrder;
    if (neighborOrder !== 'ascending' && neighborOrder !== 'descending') throw new RangeError('Komşu sırası ascending veya descending olmalıdır.');
    const adjacency = Object.fromEntries(ordered.map(function (id) { return [id, []]; }));
    const seen = new Set();
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(validId)
        || !known.has(edge[0]) || !known.has(edge[1]) || edge[0] === edge[1]) throw new TypeError('Her kenar, grafın iki farklı bilinen düğümünü bağlamalıdır.');
      const signature = Math.min(edge[0], edge[1]) + ':' + Math.max(edge[0], edge[1]);
      if (seen.has(signature)) throw new TypeError('Yönsüz basit grafta aynı kenar iki kez verilemez.');
      seen.add(signature); adjacency[edge[0]].push(edge[1]); adjacency[edge[1]].push(edge[0]);
    }
    ordered.forEach(function (id) { adjacency[id].sort(function (a, b) { return neighborOrder === 'ascending' ? a - b : b - a; }); });
    return { vertices: ordered, edges: edges.map(function (edge) { return edge.slice(); }), source: source, adjacency: adjacency, neighborOrder: neighborOrder };
  }
  function traceBFS(vertices, edges, source, options) {
    const graph = prepare(vertices, edges, source, options === undefined ? {} : options);
    const rows = graph.vertices.map(function (id) { return { id: id, distance: null, parent: null, status: 'unseen' }; });
    const rowById = new Map(rows.map(function (row) { return [row.id, row]; }));
    const state = { queue: [], current: null, neighborIndex: null, activeEdge: null, rows: rows, order: [], done: false };
    const initialState = copy(state), steps = [];
    const counts = { initializations: 0, edgeScans: 0, enqueues: 0, dequeues: 0 };
    const stats = { maxQueue: 0 };
    // A logical FIFO uses a head index. Teaching snapshots copy only its live
    // suffix; those copies are not part of the claimed queue-operation unit.
    const frontier = []; let head = 0;
    function enqueue(id) {
      frontier.push(id); counts.enqueues += 1;
      state.queue = frontier.slice(head); stats.maxQueue = Math.max(stats.maxQueue, state.queue.length);
    }
    function emit(type, detail) {
      steps.push(Object.assign({ step: steps.length + 1, type: type }, detail, { state: copy(state), counts: copy(counts), stats: copy(stats) }));
    }
    counts.initializations = graph.vertices.length;
    const root = rowById.get(source); root.distance = 0; root.status = 'queued'; enqueue(source);
    emit('init-root', { vertex: source });
    while (head < frontier.length) {
      const vertex = frontier[head++], row = rowById.get(vertex);
      counts.dequeues += 1; state.queue = frontier.slice(head); state.current = vertex;
      state.neighborIndex = 0; state.activeEdge = null; state.order.push(vertex); row.status = 'active';
      emit('dequeue', { vertex: vertex });
      graph.adjacency[vertex].forEach(function (neighbor, index) {
        const next = rowById.get(neighbor), previousDistance = next.distance;
        const discovered = previousDistance === null;
        counts.edgeScans += 1;
        if (discovered) { next.distance = row.distance + 1; next.parent = vertex; next.status = 'queued'; enqueue(neighbor); }
        state.neighborIndex = index + 1; state.activeEdge = { from: vertex, to: neighbor };
        emit('inspect', { from: vertex, to: neighbor, neighborIndex: index, discovered: discovered, previousDistance: previousDistance });
      });
      row.status = 'done'; state.current = null; state.neighborIndex = null; state.activeEdge = null;
      state.done = head === frontier.length;
      emit('finish', { vertex: vertex });
    }
    const result = {
      vertices: graph.vertices.slice(), source: source, order: state.order.slice(),
      distances: Object.fromEntries(rows.map(function (row) { return [row.id, row.distance]; })),
      parents: Object.fromEntries(rows.map(function (row) { return [row.id, row.parent]; })),
      reachable: rows.filter(function (row) { return row.distance !== null; }).map(function (row) { return row.id; }),
      unreachable: rows.filter(function (row) { return row.distance === null; }).map(function (row) { return row.id; })
    };
    return Object.assign({ operation: 'bfs' }, graph, { initialState: initialState, steps: steps, result: result, counts: copy(counts), stats: copy(stats) });
  }
  function shortestPath(trace, target) {
    if (!trace || !trace.result || !Array.isArray(trace.vertices) || !Array.isArray(trace.steps)
      || !trace.steps.length || !trace.steps[trace.steps.length - 1].state.done) throw new TypeError('Yol için tamamlanmış bir BFS izi gerekir.');
    if (!validId(target) || !trace.vertices.includes(target)) throw new RangeError('Hedef grafın bilinen bir düğümü olmalıdır.');
    const result = trace.result;
    if (result.distances[target] === null) return null;
    const path = [], seen = new Set(); let current = target;
    while (current !== null) {
      if (!trace.vertices.includes(current) || seen.has(current) || !Object.prototype.hasOwnProperty.call(result.parents, current)) throw new TypeError('Uzaklık ve ebeveyn tabloları geçerli bir BFS sonucu olmalıdır.');
      seen.add(current); path.push(current); current = result.parents[current];
    }
    path.reverse();
    if (path[0] !== trace.source || path.length - 1 !== result.distances[target]) throw new TypeError('Yol, kaynak ve uzaklıkla eşleşmelidir.');
    return path;
  }
  return Object.freeze({ traceBFS: traceBFS, shortestPath: shortestPath });
});
