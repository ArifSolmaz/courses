#!/usr/bin/env node
'use strict';
// Independent cycle oracles: Kahn's indegree elimination and positive-length
// transitive closure. DFS events are checked by an explicit stack machine;
// topological validation is exhaustively compared with every small permutation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w9/model.js');
const model = require(modelPath);
const started = Date.now();
const report = {
  lesson: 'Sıfırdan Hafta 9 — yönlü bağımlılık, DFS, çevrim ve topolojik sıra',
  status: 'running', checks: 0, cases: 0, sections: [],
  contract: {
    graph: '1–32 benzersiz, negatif olmayan güvenli tam ID; yönlü oklar benzersiz; karşıt oklar ayrı, self-loop geçerli çevrim.',
    stack: 'Alt→üst çağrı yığını; inspect çağıranın ofsetini artırır, görülmemiş çocuk sonraki enter ile girer.',
    cycle: 'Etkin düğüme ok sonrası ayrı terminal cycle; etkin çağrılar geri dönmez, kısmi finish tersinden topolojik sıra üretilmez.',
    counters: 'Başlatılan satır, giriş, taranan komşuluk girdisi ve normal bitiş/dönüş ayrı mantıksal birimler.',
    validator: 'Bütün düğümlerin her birini bir kez içerip her yönlü oku ileri taşıyan herhangi bir sıra geçerli.',
    oracle: 'Bağımsız Kahn ve transitif kapanış; her küçük permütasyonda doğrudan ok-konum koşulu.'
  },
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex')
};
let context = '';
function check(value, message, detail) {
  report.checks += 1;
  if (!value) { const error = new Error(context + ': ' + message); if (detail !== undefined) error.detail = detail; throw error; }
}
function equal(actual, expected, message) { check(JSON.stringify(actual) === JSON.stringify(expected), message, { actual, expected }); }
function section(name, run) { const before = { checks: report.checks, cases: report.cases, time: Date.now() }; run(); report.sections.push({ name, checks: report.checks - before.checks, cases: report.cases - before.cases, milliseconds: Date.now() - before.time }); }
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
function oracle(vertices, edges, options = {}) {
  const ids = vertices.slice().sort((a, b) => a - b), index = new Map(ids.map((id, i) => [id, i]));
  const matrix = ids.map(() => ids.map(() => false)); edges.forEach(([a, b]) => { matrix[index.get(a)][index.get(b)] = true; });
  const reach = matrix.map(row => row.slice());
  for (let k = 0; k < ids.length; k += 1) for (let i = 0; i < ids.length; i += 1) for (let j = 0; j < ids.length; j += 1) reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
  const closureCycle = ids.some((_, i) => reach[i][i]);
  const remaining = new Set(ids), indegree = new Map(ids.map(id => [id, edges.filter(edge => edge[1] === id).length]));
  let eliminated = 0;
  while (true) {
    const ready = ids.find(id => remaining.has(id) && indegree.get(id) === 0); if (ready === undefined) break;
    remaining.delete(ready); eliminated += 1; edges.filter(edge => edge[0] === ready).forEach(edge => indegree.set(edge[1], indegree.get(edge[1]) - 1));
  }
  const kahnCycle = eliminated !== ids.length; check(kahnCycle === closureCycle, 'Kahn ve transitif kapanış çevrim konusunda eşleşir');
  const adjacency = Object.fromEntries(ids.map((id, i) => { const neighbors = ids.filter((_, j) => matrix[i][j]); return [id, options.neighborOrder === 'descending' ? neighbors.reverse() : neighbors]; }));
  const rootOrder = options.firstRoot === undefined ? ids.slice() : [options.firstRoot].concat(ids.filter(id => id !== options.firstRoot));
  return { ids, index, matrix, adjacency, rootOrder, cyclic: kahnCycle };
}
function validOrder(vertices, edges, order) {
  if (!Array.isArray(order) || order.length !== vertices.length || new Set(order).size !== order.length || !Array.from(order).every(id => Number.isSafeInteger(id) && vertices.includes(id))) return false;
  return edges.every(([a, b]) => order.indexOf(a) < order.indexOf(b));
}
function audit(trace, vertices, edges, options, label) {
  context = label; report.cases += 1;
  const expected = oracle(vertices, edges, options), rows = expected.ids.map(id => ({ id, status: 'unseen', parent: null })), byId = new Map(rows.map(row => [row.id, row]));
  const state = { stack: [], rows, finished: [], activeEdge: null, done: false, cycle: null };
  const counts = { initializations: 0, entries: 0, edgeScans: 0, returns: 0 }, stats = { maxStack: 0 };
  const entered = new Set(), scanned = new Set(); let pending = null;
  equal(trace.operation, 'dfs', 'işlem türü'); equal(trace.vertices, expected.ids, 'düğüm sırası'); equal(trace.edges, edges, 'yönlü kenarlar aynen kopya');
  equal(trace.adjacency, expected.adjacency, 'matristen komşuluk listeleri'); equal(trace.rootOrder, expected.rootOrder, 'ilk kök ve kalan artan kökler'); equal(trace.neighborOrder, options.neighborOrder || 'ascending', 'komşu sırası'); equal(trace.initialState, state, 'başlangıçta boş yığın ve bütün satırlar görülmemiş');
  trace.steps.forEach((step, i) => {
    context = label + ' / adım ' + (i + 1); equal(step.step, i + 1, 'bir tabanlı adım'); check(!state.done, 'terminal olaydan sonra yeni olay yok');
    const top = state.stack.at(-1), nextRoot = expected.rootOrder.find(id => byId.get(id).status === 'unseen');
    const expectedType = i === 0 ? 'init' : pending ? pending.type : top ? top.nextIndex < expected.adjacency[top.vertex].length ? 'inspect' : 'finish' : nextRoot !== undefined ? 'enter' : 'complete';
    equal(step.type, expectedType, 'bağımsız yığın makinesinin sonraki olayı');
    if (step.type === 'init') {
      equal(step.vertices, expected.ids, 'başlatılan düğümler'); counts.initializations = expected.ids.length;
    } else if (step.type === 'enter') {
      const vertex = pending ? pending.vertex : nextRoot, parent = pending ? pending.parent : null, root = !pending;
      equal(step.vertex, vertex, 'beklenen çocuk veya ilk görülmemiş kök'); equal(step.parent, parent, 'giriş ebeveyni'); equal(step.root, root, 'kök ve çocuk ayrımı');
      equal(byId.get(vertex).status, 'unseen', 'yalnız görülmemiş düğüme girilir'); check(!entered.has(vertex), 'tek giriş'); entered.add(vertex);
      byId.get(vertex).status = 'active'; byId.get(vertex).parent = parent; state.stack.push({ vertex, nextIndex: 0 }); state.activeEdge = null;
      counts.entries += 1; stats.maxStack = Math.max(stats.maxStack, state.stack.length); pending = null;
    } else if (step.type === 'inspect') {
      const to = expected.adjacency[top.vertex][top.nextIndex], classification = byId.get(to).status;
      equal(step.from, top.vertex, 'yalnız üst çağrının listesi'); equal(step.to, to, 'sıradaki yönlü komşu'); equal(step.neighborIndex, top.nextIndex, 'tarama ofseti'); equal(step.classification, classification, 'ok hedefinin önceki durumu');
      const signature = step.from + ':' + step.to; check(!scanned.has(signature), 'her yönlü ok en çok bir tarama'); scanned.add(signature);
      top.nextIndex += 1; counts.edgeScans += 1; state.activeEdge = { from: step.from, to: step.to };
      if (classification === 'unseen') { pending = { type: 'enter', vertex: to, parent: top.vertex }; equal(byId.get(to).status, 'unseen', 'çocuk inspect sırasında henüz girmez'); }
      else if (classification === 'active') pending = { type: 'cycle', from: top.vertex, to };
    } else if (step.type === 'finish') {
      equal(step.vertex, top.vertex, 'yalnız üst çağrı döner'); equal(top.nextIndex, expected.adjacency[top.vertex].length, 'dönüşten önce bütün komşular tarandı');
      state.stack.pop(); byId.get(step.vertex).status = 'done'; state.finished.push(step.vertex); state.activeEdge = null; counts.returns += 1;
    } else if (step.type === 'cycle') {
      equal(step.from, pending.from, 'çevrimi kapatan ok kaynağı'); equal(step.to, pending.to, 'etkin ata hedefi');
      const start = state.stack.findIndex(frame => frame.vertex === step.to), cycle = state.stack.slice(start).map(frame => frame.vertex).concat([step.to]);
      equal(step.cycle, cycle, 'yığının etkin soneki ve kapanan hedef tanığı'); state.cycle = cycle; state.done = true; pending = null;
      check(expected.cyclic, 'bağımsız oracleda da çevrim var'); equal(i, trace.steps.length - 1, 'ilk çevrimde terminal duruş');
    } else if (step.type === 'complete') {
      equal(state.stack, [], 'tamamlanınca yığın boş'); check(rows.every(row => row.status === 'done'), 'uzak bileşenler de işlendi');
      equal(step.topologicalOrder, state.finished.slice().reverse(), 'yalnız tam bitişten ters finish'); state.done = true; state.activeEdge = null;
    }
    equal(step.state, state, 'tüm yığın/ofset/ebeveyn/durum/finish/ok/terminal snapshotı'); equal(step.counts, counts, 'yalnız açılmış işlemler ayrı birimlerde'); equal(step.stats, stats, 'gerçek en büyük etkin yığın');
    equal(new Set(state.stack.map(frame => frame.vertex)).size, state.stack.length, 'yığında aynı düğüm yeniden çağrılmaz');
    equal(rows.filter(row => row.status === 'active').map(row => row.id).sort((a, b) => a - b), state.stack.map(frame => frame.vertex).sort((a, b) => a - b), 'etkin satırlar tam olarak yığındakiler');
    equal(rows.filter(row => row.status === 'done').map(row => row.id).sort((a, b) => a - b), state.finished.slice().sort((a, b) => a - b), 'done satırları normal dönenlerdir');
    equal(counts.entries, rows.filter(row => row.status !== 'unseen').length, 'görülme yalnız enter ile'); equal(counts.returns, state.finished.length, 'return sayısı finish uzunluğu');
    check(state.stack.every((frame, j) => !j || byId.get(frame.vertex).parent === state.stack[j - 1].vertex), 'etkin yığın gerçek ebeveyn zinciri');
  });
  context = label;
  equal(state.done, true, 'son olay terminal'); equal(trace.counts, counts, 'son sayaçlar'); equal(trace.stats, stats, 'son istatistik'); equal(trace.result.finished, state.finished, 'normal bitiş sırası');
  equal(trace.result.acyclic, !expected.cyclic, 'Kahn/transitif kapanış ile aynı çevrim sonucu'); equal(trace.result.fullTraversal, !expected.cyclic, 'yalnız acyclic durumda tam normal bitiş');
  equal(trace.result.cycle, state.cycle, 'son çevrim tanığı'); check(counts.entries <= vertices.length, 'en çok V giriş'); check(counts.returns <= counts.entries, 'normal dönüş girişten fazla değil'); check(counts.edgeScans <= edges.length, 'en çok E yönlü tarama'); equal(counts.initializations, vertices.length, 'bütün V satır bir kez hazırlanır');
  if (!expected.cyclic) {
    equal(trace.steps.at(-1).type, 'complete', 'çevrimsiz tamamlama'); equal(trace.result.topologicalOrder, state.finished.slice().reverse(), 'topolojik sıra ters normal bitiş');
    check(validOrder(vertices, edges, trace.result.topologicalOrder), 'her ok doğrudan bağımsız konum koşulunu sağlar'); equal(model.validateTopologicalOrder(vertices, edges, trace.result.topologicalOrder), { valid: true, reason: 'valid', violatingEdge: null }, 'doğrulayıcı DFS topolojik sırasını kabul eder');
    equal(counts.entries, vertices.length, 'çevrimsizde bütün V girilir'); equal(counts.returns, vertices.length, 'çevrimsizde bütün V döner'); equal(counts.edgeScans, edges.length, 'çevrimsizde bütün E taranır'); equal(state.stack, [], 'çevrimsizde boş yığın');
    equal(trace.steps.length, 2 + 2 * vertices.length + edges.length, 'init+Venter+Einspect+Vfinish+complete olay formülü');
  } else {
    equal(trace.steps.at(-1).type, 'cycle', 'çevrim ilk tanıkta durur'); equal(trace.result.topologicalOrder, null, 'kısmi finish topolojik sıra olarak sunulmaz'); check(state.stack.length > 0, 'yarım kalan çağrılar yığında korunur');
    const cycle = trace.result.cycle; check(cycle.length >= 2 && cycle[0] === cycle.at(-1), 'tanık kapalı yürüyüş'); equal(new Set(cycle.slice(0, -1)).size, cycle.length - 1, 'kapanış dışında tanıkta tekrar yok');
    check(cycle.every((id, j) => !j || expected.matrix[expected.index.get(cycle[j - 1])][expected.index.get(id)]), 'tanığın her adımı gerçek yönlü ok');
    check(cycle.slice(0, -1).every(id => byId.get(id).status === 'active'), 'tanık düğümlerinin çağrıları geri dönmedi');
  }
  return trace;
}
function graphCase(vertices, edges, options, label) {
  const before = copy({ vertices, edges, options }); const trace = audit(model.traceDFS(vertices, edges, options), vertices, edges, options || {}, label);
  equal({ vertices, edges, options }, before, 'graf ve seçenek girdileri değişmez'); return trace;
}
function validatorCase(vertices, edges, order, label) {
  context = label; report.cases += 1; const expected = validOrder(vertices, edges, order), result = model.validateTopologicalOrder(vertices, edges, order);
  equal(result.valid, expected, 'bağımsız ok-konum koşulu');
  const permutation = Array.isArray(order) && order.length === vertices.length && new Set(order).size === order.length && Array.from(order).every(id => Number.isSafeInteger(id) && vertices.includes(id));
  const firstViolation = permutation ? edges.find(([a, b]) => order.indexOf(a) >= order.indexOf(b)) : null;
  equal(result, expected ? { valid: true, reason: 'valid', violatingEdge: null } : { valid: false, reason: permutation ? 'backward-edge' : 'not-permutation', violatingEdge: firstViolation || null }, 'kararlı reason ve ilk ihlal eden ok');
  return result;
}
function permutations(input) { if (!input.length) return [[]]; return input.flatMap((id, i) => permutations(input.slice(0, i).concat(input.slice(i + 1))).map(tail => [id].concat(tail))); }
function throws(fn, label) { context = label; report.cases += 1; let thrown = null; try { fn(); } catch (error) { thrown = error; } check(thrown instanceof TypeError || thrown instanceof RangeError, 'geçersiz graf/seçenek açık hata üretir'); }
const vertices = [4, 7, 11, 18, 20, 24, 26, 31], edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 31], [20, 31]];
try {
  section('Ders örnekleri ve çevrimde yarım kalan çağrılar', () => {
    const main = graphCase(vertices, edges, { firstRoot: 18 }, 'ana DAG');
    equal(main.steps.filter(step => step.type === 'enter').map(step => step.vertex), [18, 7, 4, 11, 31, 24, 20, 26], 'ana giriş sırası'); equal(main.result.finished, [4, 31, 11, 7, 20, 24, 18, 26], 'ana finish sırası'); equal(main.result.topologicalOrder, [26, 18, 24, 20, 7, 11, 31, 4], 'ana örnek topolojik sıra'); equal(main.counts, { initializations: 8, entries: 8, edgeScans: 8, returns: 8 }, 'ana8/8/8/8'); equal(main.stats, { maxStack: 4 }, 'ana en büyük yığın4'); equal(main.steps.length, 26, 'ana26olay');
    const cyclic = graphCase(vertices, edges.concat([[31, 7]]), { firstRoot: 18 }, '31→7 çevrimi'); equal(cyclic.result.cycle, [7, 11, 31, 7], 'ana çevrim tanığı'); equal(cyclic.counts, { initializations: 8, entries: 5, edgeScans: 5, returns: 1 }, 'çevrim8/5/5/1'); equal(cyclic.steps.at(-1).state.stack.map(frame => frame.vertex), [18, 7, 11, 31], 'çevrimde açık çağrılar korunur'); equal(cyclic.stats.maxStack, 4, 'çevrim derinliği4');
    const remote = graphCase(vertices, edges.concat([[26, 26]]), { firstRoot: 18 }, 'uzak self-loop'); equal(remote.result.cycle, [26, 26], 'kendine ok çevrim'); equal(remote.result.finished, [4, 31, 11, 7, 20, 24, 18], 'uzak kökten önce diğer bileşen normal bitti'); equal(remote.counts, { initializations: 8, entries: 8, edgeScans: 9, returns: 7 }, 'uzak çevrim sayacı');
    const reverse = graphCase(vertices, edges, { firstRoot: 18, neighborOrder: 'descending' }, 'ters komşular'); equal(reverse.result.topologicalOrder, [26, 18, 7, 4, 24, 11, 20, 31], 'başka geçerli sıra'); check(JSON.stringify(reverse.result.topologicalOrder) !== JSON.stringify(main.result.topologicalOrder), 'tek model sıra zorunluluğu yok');
    const first7 = graphCase(vertices, edges, { firstRoot: 7 }, 'ilk kök7'); equal(first7.steps.filter(step => step.type === 'enter').map(step => step.vertex), [7, 4, 11, 31, 18, 24, 20, 26], 'kök seçimi ormanı değiştirir'); equal(first7.stats.maxStack, 3, 'ilk7 en büyük yığın3');
    graphCase([18], [], {}, 'tek düğüm'); graphCase(vertices, [], { firstRoot: 18 }, 'oksuz graf');
    const independent = graphCase([4, 7, 18, 20, 24, 26], [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]], { firstRoot: 18 }, 'bağımsızV6/E5'); equal(independent.result.finished, [4, 26, 7, 24, 18, 20], 'bağımsız finish'); equal(independent.result.topologicalOrder, [20, 18, 24, 7, 26, 4], 'bağımsız topo'); equal(independent.counts, { initializations: 6, entries: 6, edgeScans: 5, returns: 6 }, 'bağımsız6/6/5/6'); equal(independent.stats.maxStack, 4, 'bağımsız max4');
    graphCase([0], [[0, 0]], {}, 'sıfır ID self-loop'); graphCase([0, 1], [[0, 1], [1, 0]], { firstRoot: 0 }, 'karşıt oklar ayrı ve çevrim');
  });
  section('Üçe kadar self-loop dahil bütün yönlü graflar, her kök ve iki sıra', () => {
    for (let n = 1; n <= 3; n += 1) {
      const ids = Array.from({ length: n }, (_, i) => i), possible = ids.flatMap(a => ids.map(b => [a, b])), orders = permutations(ids);
      for (let mask = 0; mask < 2 ** possible.length; mask += 1) {
        const arrows = possible.filter((_, i) => mask & (2 ** i));
        for (const firstRoot of ids) for (const neighborOrder of ['ascending', 'descending']) graphCase(ids, arrows, { firstRoot, neighborOrder }, 'tam n' + n + '/g' + mask + '/r' + firstRoot + '/' + neighborOrder);
        for (const order of orders) validatorCase(ids, arrows, order, 'küçük permütasyon n' + n + '/g' + mask);
      }
    }
  });
  section('Dört düğümde bütün4096 yönlü graf ve bütün24 permütasyon', () => {
    const ids = [0, 1, 2, 3], possible = ids.flatMap(a => ids.filter(b => a !== b).map(b => [a, b])), orders = permutations(ids);
    for (let mask = 0; mask < 2 ** possible.length; mask += 1) {
      const arrows = possible.filter((_, i) => mask & (2 ** i)); graphCase(ids, arrows, { firstRoot: 0 }, 'n4/g' + mask);
      if (mask % 17 === 0) graphCase(ids, arrows, { firstRoot: 3, neighborOrder: 'descending' }, 'n4 ters/g' + mask);
      for (const order of orders) validatorCase(ids, arrows, order, 'n4 permütasyon/g' + mask);
    }
  });
  section('Ana DAG bütün8! sıraları, rastgele ve en büyük girdiler', () => {
    let accepted = 0; for (const order of permutations(vertices)) if (validatorCase(vertices, edges, order, 'ana8! doğrulama').valid) accepted += 1;
    check(accepted > 1, 'birçok farklı geçerli topolojik sıra kabul edilir'); report.mainAcceptedTopologicalOrders = accepted;
    let seed = 0x9df51234; function random(limit) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % limit; }
    for (let test = 0; test < 100; test += 1) {
      const n = 1 + random(12), ids = Array.from({ length: n }, (_, i) => 3 + i * 11), arrows = [];
      for (const a of ids) for (const b of ids) if (random(7) === 0) arrows.push([a, b]);
      const options = { firstRoot: ids[random(n)], neighborOrder: random(2) ? 'ascending' : 'descending' }, trace = graphCase(ids, arrows, options, 'rastgele' + test);
      const changed = model.traceDFS(ids.slice().reverse(), arrows.slice().reverse(), options); equal(changed.steps, trace.steps, 'düğüm/ok giriş sırası DFS davranışını değiştirmez'); equal(changed.result, trace.result, 'aynı yönlü graf sonucu');
    }
    const ids = Array.from({ length: 32 }, (_, i) => i), chain = ids.slice(1).map((id, i) => [i, id]);
    const long = graphCase(ids, chain, {}, '32 düğümlü zincir'); equal(long.stats.maxStack, 32, '32 etkin çağrı sınırı');
    const completeDAG = []; for (let a = 0; a < 32; a += 1) for (let b = a + 1; b < 32; b += 1) completeDAG.push([a, b]); graphCase(ids, completeDAG, {}, '32 düğümlü yoğun DAG');
    graphCase(ids, chain.concat([[31, 0]]), {}, '32 düğümlü uzun çevrim'); graphCase([0, Number.MAX_SAFE_INTEGER, 4], [[0, Number.MAX_SAFE_INTEGER], [Number.MAX_SAFE_INTEGER, 4]], { firstRoot: 0 }, 'güvenli ID sınırları');
  });
  section('Girdi doğrulama ve öğrenci sırası nedenleri', () => {
    for (const bad of [undefined, null, {}, '', [], [1, 1], [-1, 1], [0, 1.5], [0, Infinity], [0, NaN], [0, Number.MAX_SAFE_INTEGER + 1], Array(2), Array.from({ length: 33 }, (_, i) => i)]) throws(() => model.traceDFS(bad, []), 'geçersiz düğüm dizisi');
    for (const bad of [null, {}, '', [null], [[]], [[0]], [[0, 1, 2]], [[0, 4]], [[0, -1]], [[0, 1.5]], [[0, NaN]], Array(1), [[0, 1], [0, 1]]]) throws(() => model.traceDFS([0, 1, 2, 3], bad), 'geçersiz yönlü ok');
    for (const options of [null, [], '', { firstRoot: null }, { firstRoot: 9 }, { firstRoot: '0' }, { firstRoot: -1 }, { neighborOrder: 'random' }, { neighborOrder: null }]) throws(() => model.traceDFS([0, 1], [], options), 'geçersiz seçenek');
    for (const order of [undefined, null, '', {}, [], [0], [0, 0], [0, 2], ['0', 1], [0, 1.5], Array(2)]) validatorCase([0, 1], [[0, 1]], order, 'hatalı öğrenci permütasyonu');
    validatorCase([0, 1], [[0, 1]], [1, 0], 'ters ok'); validatorCase([0], [[0, 0]], [0], 'self-loop için hiçbir topo olamaz');
    throws(() => model.validateTopologicalOrder([], [], []), 'validator grafı boş'); throws(() => model.validateTopologicalOrder([0, 1], [[0, 5]], [0, 1]), 'validator bilinmeyen uç');
  });
  section('Saflık, dondurulmuş girdiler, snapshot bağımsızlığı ve export', () => {
    const frozenV = freeze(vertices.slice()), frozenE = freeze(copy(edges)), options = freeze({ firstRoot: 18 });
    const trace = graphCase(frozenV, frozenE, options, 'dondurulmuş DAG'), saved = copy(trace);
    trace.steps[1].state.stack[0].nextIndex = 999; trace.steps[1].state.rows[0].status = 'active';
    equal(trace.initialState, saved.initialState, 'adım ilk durumu etkilemez'); equal(trace.steps.slice(2), saved.steps.slice(2), 'snapshotlar arası ortak referans yok'); equal(trace.result, saved.result, 'adım sonucu etkilemez');
    trace.adjacency[18].push(999); trace.vertices[0] = 999; trace.edges[0][0] = 999; equal(frozenV, vertices, 'düğüm girdisi korunur'); equal(frozenE, edges, 'ok girdisi korunur'); equal(model.traceDFS(frozenV, frozenE, options), saved, 'çağrılar bağımsız ve belirlenebilir');
    const cyclic = model.traceDFS(vertices, edges.concat([[31, 7]]), { firstRoot: 18 }), savedCycle = copy(cyclic); cyclic.result.cycle[0] = 999; equal(cyclic.steps.at(-1).state.cycle, savedCycle.steps.at(-1).state.cycle, 'sonuç tanığı state tanığından bağımsız'); equal(cyclic.steps.at(-1).cycle, savedCycle.steps.at(-1).cycle, 'sonuç tanığı event tanığından bağımsız');
    const invalid = model.validateTopologicalOrder(frozenV, frozenE, frozenV); if (invalid.violatingEdge) invalid.violatingEdge[0] = 999; equal(frozenE, edges, 'validator ihlal oku bağımsız kopya');
    const sandbox = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), sandbox, { filename: 'w9/model.js' }); context = 'tarayıcı export'; report.cases += 1;
    equal(Object.keys(sandbox.FreshWeek9).sort(), ['traceDFS', 'validateTopologicalOrder'], 'global yöntemler'); equal(Object.keys(model).sort(), ['traceDFS', 'validateTopologicalOrder'], 'CommonJS yöntemler');
    equal(sandbox.FreshWeek9.traceDFS(vertices, edges, { firstRoot: 18 }), saved, 'tarayıcı ve CommonJS aynı iz'); equal(sandbox.FreshWeek9.validateTopologicalOrder(vertices, edges, saved.result.topologicalOrder), { valid: true, reason: 'valid', violatingEdge: null }, 'tarayıcı validator');
  });
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = { message: error.message, detail: error.detail, stack: error.stack }; process.exitCode = 1; }
report.milliseconds = Date.now() - started;
const reportFlag = process.argv.indexOf('--report'); if (reportFlag >= 0) { if (!process.argv[reportFlag + 1]) throw new Error('--report için dosya yolu gerekir.'); const reportPath = path.resolve(process.argv[reportFlag + 1]); fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify({ status: report.status, checks: report.checks, cases: report.cases, milliseconds: report.milliseconds, mainAcceptedTopologicalOrders: report.mainAcceptedTopologicalOrders, failure: report.failure?.message }));
