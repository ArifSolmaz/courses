(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek10 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  // Public API: traceKruskal(vertices,triples,{tieOrder}={}),
  // validateForest(vertices,triples,chosenEdgeIds). Simple undirected graph;
  // nonnegative safe-integer IDs, integer costs 0..1,000,000; at most 32 vertices.
  // Sorting always keeps costs ascending; only equal-cost endpoint order varies.
  // The teaching algorithm relabels ALL V rows on every accepted edge. Its core
  // cost is O(E log E + E + V²), not an efficient union-find bound. Adjacency for
  // cycle witnesses, validator work and all display snapshots are extra work,
  // outside the logical edgeChecks/merges/rejections/labelScans counters.
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validId(id) { return Number.isSafeInteger(id) && id >= 0; }
  function edgeId(a, b) { return Math.min(a, b) + '-' + Math.max(a, b); }
  function prepare(vertices, edges, options) {
    if (!Array.isArray(vertices) || vertices.length < 1 || vertices.length > 32
      || !Array.from(vertices).every(validId) || new Set(vertices).size !== vertices.length) throw new TypeError('1–32 benzersiz, negatif olmayan güvenli tam sayı düğüm gerekir.');
    const ids = vertices.map(function (id) { return id === 0 ? 0 : id; }).sort(function (a, b) { return a - b; }), known = new Set(ids);
    if (!Array.isArray(edges) || edges.length > ids.length * (ids.length - 1) / 2) throw new TypeError('Yönsüz basit grafın kenarları bir dizi içinde verilmelidir.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Eşit maliyet sırası seçenek nesnesiyle verilmelidir.');
    const tieOrder = options.tieOrder === undefined ? 'ascending' : options.tieOrder;
    if (tieOrder !== 'ascending' && tieOrder !== 'descending') throw new RangeError('Eşit maliyet sırası ascending veya descending olmalıdır.');
    const seen = new Set(), canonical = [];
    for (const edge of edges) {
      if (!Array.isArray(edge) || edge.length !== 3 || !validId(edge[0]) || !validId(edge[1])
        || !known.has(edge[0]) || !known.has(edge[1]) || edge[0] === edge[1]
        || !Number.isSafeInteger(edge[2]) || edge[2] < 0 || edge[2] > 1000000) throw new TypeError('Her kenar iki farklı bilinen düğüm ve 0–1000000 arası tam sayı maliyet içermelidir.');
      const id = edgeId(edge[0], edge[1]);
      if (seen.has(id)) throw new TypeError('Aynı yönsüz kenar, ters yazılarak da tekrarlanamaz.');
      seen.add(id); canonical.push({ id: id, u: Math.min(edge[0], edge[1]), v: Math.max(edge[0], edge[1]), weight: edge[2] === 0 ? 0 : edge[2] });
    }
    const direction = tieOrder === 'ascending' ? 1 : -1;
    const sortedEdges = canonical.slice().sort(function (a, b) { return a.weight - b.weight || direction * (a.u - b.u || a.v - b.v); });
    return { vertices: ids, edges: canonical, sortedEdges: copy(sortedEdges), tieOrder: tieOrder };
  }
  function componentsOf(rows) {
    const groups = new Map();
    rows.forEach(function (row) { if (!groups.has(row.component)) groups.set(row.component, []); groups.get(row.component).push(row.id); });
    return [...groups.values()].map(function (group) { return group.slice().sort(function (a, b) { return a - b; }); }).sort(function (a, b) { return a[0] - b[0]; });
  }
  // The selected graph is a forest, so its path between connected endpoints is
  // unique. Path extraction only supplies teaching/validation witnesses.
  function pathInForest(vertices, selected, source, target) {
    const adjacency = new Map(vertices.map(function (id) { return [id, []]; }));
    selected.forEach(function (edge) { adjacency.get(edge.u).push({ to: edge.v, edge: edge }); adjacency.get(edge.v).push({ to: edge.u, edge: edge }); });
    const parent = new Map([[source, null]]), frontier = [source]; let head = 0;
    while (head < frontier.length && !parent.has(target)) {
      const vertex = frontier[head++];
      adjacency.get(vertex).forEach(function (link) { if (!parent.has(link.to)) { parent.set(link.to, { vertex: vertex, edge: link.edge }); frontier.push(link.to); } });
    }
    if (!parent.has(target)) return null;
    const path = [target], edges = []; let current = target;
    while (current !== source) { const link = parent.get(current); edges.push(link.edge); current = link.vertex; path.push(current); }
    return { vertices: path.reverse(), edges: edges.reverse() };
  }
  function traceKruskal(vertices, edges, options) {
    const graph = prepare(vertices, edges, options === undefined ? {} : options);
    const rows = graph.vertices.map(function (id) { return { id: id, component: id }; }), byId = new Map(rows.map(function (row) { return [row.id, row]; }));
    const state = { rows: rows, components: componentsOf(rows), selected: [], rejected: [], total: 0, activeEdge: null, decision: null, cycle: null, done: false };
    const initialState = copy(state), steps = [], counts = { initializations: 0, edgeChecks: 0, merges: 0, rejections: 0, labelScans: 0 };
    function emit(type, detail) { steps.push(Object.assign({ step: steps.length + 1, type: type }, detail, { state: copy(state), counts: copy(counts) })); }
    counts.initializations = graph.vertices.length; emit('init', { vertices: graph.vertices.slice() });
    graph.sortedEdges.forEach(function (edge) {
      const componentU = byId.get(edge.u).component, componentV = byId.get(edge.v).component;
      state.activeEdge = copy(edge); state.decision = 'pending'; state.cycle = null; counts.edgeChecks += 1;
      emit('consider', { edge: copy(edge), componentU: componentU, componentV: componentV });
      if (componentU !== componentV) {
        const mergedComponent = Math.min(componentU, componentV);
        rows.forEach(function (row) { counts.labelScans += 1; if (row.component === componentU || row.component === componentV) row.component = mergedComponent; });
        state.components = componentsOf(rows); state.selected.push(copy(edge)); state.total += edge.weight; state.decision = 'accept'; counts.merges += 1;
        emit('accept', { edge: copy(edge), componentU: componentU, componentV: componentV, mergedComponent: mergedComponent });
      } else {
        const path = pathInForest(graph.vertices, state.selected, edge.u, edge.v);
        if (!path) throw new Error('Aynı bileşendeki uçların seçili ormanda yolu bulunamadı.');
        state.cycle = path.vertices.concat([edge.u]); state.rejected.push(copy(edge)); state.decision = 'reject'; counts.rejections += 1;
        emit('reject', { edge: copy(edge), cycle: state.cycle.slice() });
      }
    });
    state.activeEdge = null; state.decision = null; state.cycle = null; state.done = true;
    emit('complete', { connected: state.components.length === 1, componentCount: state.components.length, total: state.total });
    const result = { connected: state.components.length === 1, componentCount: state.components.length, components: copy(state.components), selected: copy(state.selected), rejected: copy(state.rejected), total: state.total };
    return Object.assign({ operation: 'kruskal' }, graph, { initialState: initialState, steps: steps, result: result, counts: copy(counts) });
  }
  function validateForest(vertices, edges, chosenEdgeIds) {
    const graph = prepare(vertices, edges, {}), known = new Map(graph.edges.map(function (edge) { return [edge.id, edge]; }));
    if (!Array.isArray(chosenEdgeIds) || new Set(chosenEdgeIds).size !== chosenEdgeIds.length
      || !Array.from(chosenEdgeIds).every(function (id) { return typeof id === 'string' && known.has(id); })) return { valid: false, reason: 'not-edge-set', total: null, violatingEdge: null };
    const selected = chosenEdgeIds.map(function (id) { return known.get(id); }), total = selected.reduce(function (sum, edge) { return sum + edge.weight; }, 0);
    const labels = new Map(graph.vertices.map(function (id) { return [id, id]; }));
    for (const edge of selected) {
      const a = labels.get(edge.u), b = labels.get(edge.v);
      if (a === b) return { valid: false, reason: 'cycle', total: total, violatingEdge: edge.id };
      const merged = Math.min(a, b); graph.vertices.forEach(function (id) { if (labels.get(id) === a || labels.get(id) === b) labels.set(id, merged); });
    }
    for (const edge of graph.edges) if (labels.get(edge.u) !== labels.get(edge.v)) return { valid: false, reason: 'not-spanning', total: total, violatingEdge: edge.id };
    const chosen = new Set(chosenEdgeIds);
    for (const edge of graph.edges) {
      if (chosen.has(edge.id)) continue;
      const path = pathInForest(graph.vertices, selected, edge.u, edge.v);
      if (!path) throw new Error('Germe denetimiyle orman yolu eşleşmiyor.');
      const maximum = Math.max.apply(null, path.edges.map(function (item) { return item.weight; }));
      if (maximum > edge.weight) return { valid: false, reason: 'not-minimum', total: total, violatingEdge: edge.id };
    }
    return { valid: true, reason: 'valid', total: total, violatingEdge: null };
  }
  return Object.freeze({ traceKruskal: traceKruskal, validateForest: validateForest });
});
