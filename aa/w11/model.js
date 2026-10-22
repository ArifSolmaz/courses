(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek11 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // Public API: traceDijkstra(vertices,triples,source,{tieOrder}={}),
  // shortestPath(trace,target). Simple undirected graph, 1..32 vertices;
  // integer weights 0..1,000,000. Every edge is validated before searching,
  // including edges outside the source component. IDs are nonnegative safe ints.
  // Each queued ID has exactly one entry in an indexed binary minheap. The
  // displayed queue is a sorted logical view, not the heap's physical array.
  // inspect only scans; a strict improvement is applied in a separate relax.
  // Counters are logical operations, excluding heap comparisons and snapshots.
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validId(id) { return Number.isSafeInteger(id) && id >= 0; }
  function prepare(vertices, edges, source, options) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > 32
      || !Array.from(vertices).every(validId) || new Set(vertices).size !== vertices.length) throw new TypeError('1–32 benzersiz, negatif olmayan güvenli tam sayı düğüm gerekir.');
    const ids = vertices.map(function (id) { return id === 0 ? 0 : id; }).sort(function (a, b) { return a - b; }), known = new Set(ids);
    if (!validId(source) || !known.has(source)) throw new RangeError('Kaynak grafın bilinen bir düğümü olmalıdır.');
    if (!Array.isArray(edges) || edges.length > ids.length * (ids.length - 1) / 2) throw new TypeError('Yönsüz basit grafın kenarları bir dizi içinde verilmelidir.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Eşit uzaklık sırası seçenek nesnesiyle verilmelidir.');
    const tieOrder = options.tieOrder === undefined ? 'ascending' : options.tieOrder;
    if (tieOrder !== 'ascending' && tieOrder !== 'descending') throw new RangeError('Eşit uzaklık sırası ascending veya descending olmalıdır.');
    const canonical = [], seen = new Set(), adjacency = Object.fromEntries(ids.map(function (id) { return [id, []]; }));
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length !== 3 || !validId(edge[0]) || !validId(edge[1])
        || !known.has(edge[0]) || !known.has(edge[1]) || edge[0] === edge[1]
        || !Number.isSafeInteger(edge[2]) || edge[2] < 0 || edge[2] > 1000000) throw new TypeError('Her kenar iki farklı bilinen düğüm ve 0–1000000 arası tam sayı ağırlık içermelidir; negatif ağırlık kabul edilmez.');
      const u = Math.min(edge[0], edge[1]), v = Math.max(edge[0], edge[1]), weight = edge[2] === 0 ? 0 : edge[2], id = u + '-' + v;
      if (seen.has(id)) throw new TypeError('Aynı yönsüz kenar ters yazılarak da tekrarlanamaz.');
      seen.add(id); canonical.push({ id: id, u: u, v: v, weight: weight }); adjacency[u].push({ to: v, weight: weight }); adjacency[v].push({ to: u, weight: weight });
    }
    ids.forEach(function (id) { adjacency[id].sort(function (a, b) { return a.to - b.to; }); });
    return { vertices: ids, edges: canonical, adjacency: adjacency, source: source === 0 ? 0 : source, tieOrder: tieOrder };
  }
  function IndexedMinHeap(tieOrder) {
    this.heap = []; this.positions = new Map(); this.direction = tieOrder === 'ascending' ? 1 : -1;
  }
  IndexedMinHeap.prototype.compare = function (a, b) { return a.distance - b.distance || this.direction * (a.id - b.id); };
  IndexedMinHeap.prototype.swap = function (i, j) {
    const value = this.heap[i]; this.heap[i] = this.heap[j]; this.heap[j] = value;
    this.positions.set(this.heap[i].id, i); this.positions.set(this.heap[j].id, j);
  };
  IndexedMinHeap.prototype.up = function (index) {
    while (index > 0) { const parent = Math.floor((index - 1) / 2); if (this.compare(this.heap[index], this.heap[parent]) >= 0) break; this.swap(index, parent); index = parent; }
  };
  IndexedMinHeap.prototype.down = function (index) {
    while (true) {
      const left = 2 * index + 1, right = left + 1; let best = index;
      if (left < this.heap.length && this.compare(this.heap[left], this.heap[best]) < 0) best = left;
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[best]) < 0) best = right;
      if (best === index) break; this.swap(index, best); index = best;
    }
  };
  IndexedMinHeap.prototype.insert = function (id, distance) {
    if (this.positions.has(id)) throw new Error('Kuyruktaki düğüm ikinci kez eklenemez.');
    const index = this.heap.length; this.heap.push({ id: id, distance: distance }); this.positions.set(id, index); this.up(index);
  };
  IndexedMinHeap.prototype.decrease = function (id, distance) {
    const index = this.positions.get(id);
    if (index === undefined || distance >= this.heap[index].distance) throw new Error('Azaltma, kuyruktaki kaydın daha küçük anahtarını gerektirir.');
    this.heap[index].distance = distance; this.up(index);
  };
  IndexedMinHeap.prototype.extract = function () {
    if (!this.heap.length) return null;
    const minimum = this.heap[0], last = this.heap.pop(); this.positions.delete(minimum.id);
    if (this.heap.length) { this.heap[0] = last; this.positions.set(last.id, 0); this.down(0); }
    return { id: minimum.id, distance: minimum.distance };
  };
  IndexedMinHeap.prototype.view = function () { const self = this; return this.heap.map(function (item) { return { id: item.id, distance: item.distance }; }).sort(function (a, b) { return self.compare(a, b); }); };
  function traceDijkstra(vertices, edges, source, options) {
    const graph = prepare(vertices, edges, source, options === undefined ? {} : options);
    const rows = graph.vertices.map(function (id) { return { id: id, distance: null, parent: null, status: 'unseen' }; }), byId = new Map(rows.map(function (row) { return [row.id, row]; }));
    const state = { rows: rows, queue: [], current: null, neighborIndex: null, activeEdge: null, order: [], done: false }, initialState = copy(state), steps = [];
    const counts = { initializations: 0, edgeScans: 0, improvements: 0, inserts: 0, decreases: 0, extracts: 0 }, stats = { maxQueue: 0 }, heap = new IndexedMinHeap(graph.tieOrder);
    function emit(type, detail) { steps.push(Object.assign({ step: steps.length + 1, type: type }, detail, { state: copy(state), counts: copy(counts), stats: copy(stats) })); }
    function syncQueue() { state.queue = heap.view(); stats.maxQueue = Math.max(stats.maxQueue, state.queue.length); }
    counts.initializations = graph.vertices.length; byId.get(graph.source).distance = 0; byId.get(graph.source).status = 'queued'; heap.insert(graph.source, 0); counts.inserts = 1; syncQueue(); emit('init', { source: graph.source });
    while (heap.heap.length) {
      const next = heap.extract(), row = byId.get(next.id); row.status = 'settled'; state.current = next.id; state.neighborIndex = 0; state.activeEdge = null; state.order.push(next.id); counts.extracts += 1; syncQueue(); emit('settle', { vertex: next.id, distance: next.distance });
      graph.adjacency[next.id].forEach(function (link, index) {
        const target = byId.get(link.to), previousDistance = target.distance, candidate = row.distance + link.weight;
        if (!Number.isSafeInteger(candidate)) throw new RangeError('Yol toplamı güvenli tam sayı sınırını aştı.');
        const outcome = target.status === 'settled' ? 'settled' : previousDistance === null || candidate < previousDistance ? 'improve' : candidate === previousDistance ? 'equal' : 'worse';
        counts.edgeScans += 1; state.neighborIndex = index + 1; state.activeEdge = { from: next.id, to: link.to, weight: link.weight };
        emit('inspect', { from: next.id, to: link.to, weight: link.weight, neighborIndex: index, candidate: candidate, previousDistance: previousDistance, outcome: outcome });
        if (outcome === 'improve') {
          const queueAction = previousDistance === null ? 'insert' : 'decrease'; target.distance = candidate; target.parent = next.id; target.status = 'queued'; counts.improvements += 1;
          if (queueAction === 'insert') { heap.insert(link.to, candidate); counts.inserts += 1; } else { heap.decrease(link.to, candidate); counts.decreases += 1; }
          syncQueue(); emit('relax', { from: next.id, to: link.to, weight: link.weight, previousDistance: previousDistance, distance: candidate, queueAction: queueAction });
        }
      });
      state.current = null; state.neighborIndex = null; state.activeEdge = null; emit('finish', { vertex: next.id });
    }
    const reachable = rows.filter(function (row) { return row.distance !== null; }).map(function (row) { return row.id; }), unreachable = rows.filter(function (row) { return row.distance === null; }).map(function (row) { return row.id; });
    state.done = true; emit('complete', { reachable: reachable.slice(), unreachable: unreachable.slice() });
    const result = { distances: Object.fromEntries(rows.map(function (row) { return [row.id, row.distance]; })), parents: Object.fromEntries(rows.map(function (row) { return [row.id, row.parent]; })), order: state.order.slice(), reachable: reachable, unreachable: unreachable };
    return Object.assign({ operation: 'dijkstra' }, graph, { initialState: initialState, steps: steps, result: result, counts: copy(counts), stats: copy(stats) });
  }
  function shortestPath(trace, target) {
    if (!trace || !trace.result || !Array.isArray(trace.vertices) || !Array.isArray(trace.steps)
      || !trace.steps.length || !trace.steps[trace.steps.length - 1].state.done) throw new TypeError('Yol için tamamlanmış bir Dijkstra izi gerekir.');
    if (!validId(target) || !trace.vertices.includes(target)) throw new RangeError('Hedef grafın bilinen bir düğümü olmalıdır.');
    if (trace.result.distances[target] === null) return null;
    const path = [], seen = new Set(); let current = target;
    while (current !== null) {
      if (!trace.vertices.includes(current) || seen.has(current) || !Object.prototype.hasOwnProperty.call(trace.result.parents, current)) throw new TypeError('Geçerli uzaklık ve ebeveyn tabloları gerekir.');
      seen.add(current); path.push(current); current = trace.result.parents[current];
    }
    path.reverse(); if (path[0] !== trace.source) throw new TypeError('Yol kaynakta başlamalıdır.');
    let total = 0;
    for (let i = 1; i < path.length; i += 1) {
      const link = trace.adjacency[path[i - 1]].find(function (edge) { return edge.to === path[i]; });
      if (!link) throw new TypeError('Ebeveyn yolu grafın gerçek kenarlarını izlemelidir.'); total += link.weight;
    }
    if (total !== trace.result.distances[target]) throw new TypeError('Yol maliyeti uzaklıkla eşleşmelidir.');
    return path;
  }
  return Object.freeze({ traceDijkstra: traceDijkstra, shortestPath: shortestPath });
});
