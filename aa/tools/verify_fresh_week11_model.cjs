#!/usr/bin/env node
'use strict';
// Floyd–Warshall is the independent distance oracle. An explicit linear logical
// queue supplies the event/state oracle without sharing the indexed-heap code.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w11/model.js');
const model = require(modelPath);
const started = Date.now();
const report = {
  lesson: 'Sıfırdan Hafta 11 — ağırlıklı en kısa yol, Dijkstra ve decrease-key',
  status: 'running', checks: 0, cases: 0, sections: [],
  contract: {
    graph: '1–32 benzersiz negatif olmayan güvenli ID; yönsüz basit graf; tamsayı ağırlık0..1000000. Kaynak dışındaki negatifler de reddedilir.',
    heap: 'Gerçek indexed binary minheap+positions; her queued ID tek kayıt; decrease-key var olan kaydın anahtarını azaltır.',
    events: 'inspect yalnız tarar/ofseti ilerletir; sıkı iyileştirme ayrı relax ile uygulanır. Eşitlikte ebeveyn korunur, settled komşu güncellenmez.',
    counters: 'V başlatım, komşuluk taraması, sıkı iyileştirme, insert, decrease ve extract ayrı mantıksal birimler; kaynak insert iyileştirme sayılmaz.',
    queue: 'Mantıksal sıra uzaklık, sonra eşitlikte ID; fiziksel heap dizisi diye sunulmaz.',
    oracle: 'Floyd–Warshall; ayrı doğrusal kuyruk/minimum seçim ve adım geçişleri; gerçek kenar ağırlıklarıyla yol kontrolü.'
  },
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex')
};
let context = '';
function check(value, message, detail) { report.checks += 1; if (!value) { const error = new Error(context + ': ' + message); if (detail !== undefined) error.detail = detail; throw error; } }
function equal(actual, expected, message) { check(JSON.stringify(actual) === JSON.stringify(expected), message, { actual, expected }); }
function section(name, run) { const before = { checks: report.checks, cases: report.cases, time: Date.now() }; run(); report.sections.push({ name, checks: report.checks - before.checks, cases: report.cases - before.cases, milliseconds: Date.now() - before.time }); }
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
function canonical(triples) { return triples.map(([a, b, weight]) => ({ id: Math.min(a, b) + '-' + Math.max(a, b), u: Math.min(a, b), v: Math.max(a, b), weight: weight === 0 ? 0 : weight })); }
function oracle(vertices, triples, source) {
  const ids = vertices.slice().sort((a, b) => a - b), index = new Map(ids.map((id, i) => [id, i]));
  const weights = ids.map(() => ids.map(() => Infinity)); triples.forEach(([a, b, w]) => { weights[index.get(a)][index.get(b)] = w; weights[index.get(b)][index.get(a)] = w; });
  const distances = weights.map((row, i) => row.map((weight, j) => i === j ? 0 : weight));
  for (let k = 0; k < ids.length; k += 1) for (let i = 0; i < ids.length; i += 1) for (let j = 0; j < ids.length; j += 1) distances[i][j] = Math.min(distances[i][j], distances[i][k] + distances[k][j]);
  const result = Object.fromEntries(ids.map((id, i) => [id, Number.isFinite(distances[index.get(source)][i]) ? distances[index.get(source)][i] : null]));
  const adjacency = Object.fromEntries(ids.map((id, i) => [id, ids.flatMap((to, j) => Number.isFinite(weights[i][j]) ? [{ to, weight: weights[i][j] }] : [])]));
  const reachable = ids.filter(id => result[id] !== null), unreachable = ids.filter(id => result[id] === null);
  return { ids, index, weights, adjacency, distances: result, reachable, unreachable, scans: reachable.reduce((sum, id) => sum + adjacency[id].length, 0) };
}
function audit(trace, vertices, triples, source, tieOrder, label) {
  context = label; report.cases += 1;
  const expected = oracle(vertices, triples, source), rows = expected.ids.map(id => ({ id, distance: null, parent: null, status: 'unseen' })), byId = new Map(rows.map(row => [row.id, row]));
  const state = { rows, queue: [], current: null, neighborIndex: null, activeEdge: null, order: [], done: false }, counts = { initializations: 0, edgeScans: 0, improvements: 0, inserts: 0, decreases: 0, extracts: 0 }, stats = { maxQueue: 0 };
  const inserted = new Set(), settled = new Set(); let pending = null, previousSettled = -1;
  function syncQueue() { state.queue = rows.filter(row => row.status === 'queued').map(row => ({ id: row.id, distance: row.distance })).sort((a, b) => a.distance - b.distance || (tieOrder === 'ascending' ? a.id - b.id : b.id - a.id)); stats.maxQueue = Math.max(stats.maxQueue, state.queue.length); }
  equal(trace.operation, 'dijkstra', 'işlem türü'); equal(trace.vertices, expected.ids, 'düğüm sırası'); equal(trace.edges, canonical(triples), 'kanonik kenarlar'); equal(trace.adjacency, expected.adjacency, 'artan komşuID listeleri'); equal(trace.source, source, 'kaynak'); equal(trace.tieOrder, tieOrder, 'yalnız eşit uzaklık ID kuralı'); equal(trace.initialState, state, 'başlangıçta kaynak dahil bilinmeyen satırlar/boş kuyruk');
  trace.steps.forEach((step, i) => {
    context = label + ' / adım ' + (i + 1); equal(step.step, i + 1, 'bir tabanlı adım'); check(!state.done, 'complete sonrası olay yok');
    const type = i === 0 ? 'init' : pending ? 'relax' : state.current !== null ? state.neighborIndex < expected.adjacency[state.current].length ? 'inspect' : 'finish' : state.queue.length ? 'settle' : 'complete'; equal(step.type, type, 'bağımsız mantıksal kuyruk makinesi olayı');
    if (type === 'init') {
      equal(step.source, source, 'kaynak başlangıcı'); const row = byId.get(source); row.distance = 0; row.status = 'queued'; counts.initializations = expected.ids.length; counts.inserts = 1; inserted.add(source); syncQueue();
    } else if (type === 'settle') {
      const minimum = state.queue[0]; equal(step.vertex, minimum.id, 'gerçek en küçük mantıksal kuyruk kaydı'); equal(step.distance, minimum.distance, 'extract anahtarı'); equal(step.distance, expected.distances[step.vertex], 'kesinleşen uzaklık Floyd optimumu'); check(step.distance >= previousSettled, 'kesinleşen uzaklıklar azalmıyor'); previousSettled = step.distance;
      check(!settled.has(step.vertex), 'her düğüm yalnız bir kez extract'); settled.add(step.vertex); byId.get(step.vertex).status = 'settled'; state.current = step.vertex; state.neighborIndex = 0; state.activeEdge = null; state.order.push(step.vertex); counts.extracts += 1; syncQueue();
    } else if (type === 'inspect') {
      const link = expected.adjacency[state.current][state.neighborIndex], from = byId.get(state.current), to = byId.get(link.to), candidate = from.distance + link.weight, outcome = to.status === 'settled' ? 'settled' : to.distance === null || candidate < to.distance ? 'improve' : candidate === to.distance ? 'equal' : 'worse';
      equal(step.from, state.current, 'yalnız geçerli kesinleşen düğümün listesi'); equal(step.to, link.to, 'sıradaki komşu'); equal(step.weight, link.weight, 'gerçek ağırlık'); equal(step.neighborIndex, state.neighborIndex, 'taranan0tabanlı ofset'); equal(step.candidate, candidate, 'aday=kesinleşen uzaklık+ağırlık'); equal(step.previousDistance, to.distance, 'önceki geçici uzaklık'); equal(step.outcome, outcome, 'sıkı/eşit/kötü/settled ayrımı');
      check(Number.isSafeInteger(candidate), 'aday toplam güvenli tam sayı'); counts.edgeScans += 1; state.neighborIndex += 1; state.activeEdge = { from: step.from, to: step.to, weight: step.weight };
      if (outcome === 'improve') pending = { from: step.from, to: step.to, weight: step.weight, previousDistance: to.distance, distance: candidate };
    } else if (type === 'relax') {
      for (const key of ['from', 'to', 'weight', 'previousDistance', 'distance']) equal(step[key], pending[key], 'pending ' + key);
      const row = byId.get(pending.to), action = pending.previousDistance === null ? 'insert' : 'decrease'; equal(step.queueAction, action, 'yeni kayıt mı var olan anahtarı azaltma mı'); check(row.status !== 'settled', 'kesinleşmiş düğüm güncellenmez');
      if (action === 'insert') { check(!inserted.has(row.id), 'düğüm ikinci kez insert edilmez'); inserted.add(row.id); counts.inserts += 1; } else { check(state.queue.some(item => item.id === row.id), 'azaltılan kayıt zaten kuyrukta'); check(pending.distance < pending.previousDistance, 'decrease gerçekten sıkı'); counts.decreases += 1; }
      row.distance = pending.distance; row.parent = pending.from; row.status = 'queued'; counts.improvements += 1; syncQueue(); pending = null;
    } else if (type === 'finish') {
      equal(step.vertex, state.current, 'işlenen komşular bitti'); equal(state.neighborIndex, expected.adjacency[state.current].length, 'liste tamamen tarandı'); state.current = null; state.neighborIndex = null; state.activeEdge = null;
    } else {
      equal(state.queue, [], 'tamamlanmadan önce kuyruk boş'); equal(state.current, null, 'işlenmekte olan düğüm de yok'); state.done = true; equal(step.reachable, expected.reachable, 'tam erişilen küme'); equal(step.unreachable, expected.unreachable, 'tamamlanınca erişilemeyen küme');
    }
    equal(step.state, state, 'tam snapshot: inspect iyileştirmeyi erken uygulamaz; kuyruk tek kayıt/öncelik, ebeveyn/durum/ofset/ok/çıkarma sırası'); equal(step.counts, counts, 'sayaçlar yalnız kendi olayında artar'); equal(step.stats, stats, 'gerçek en kalabalık mantıksal kuyruk');
    equal(new Set(state.queue.map(item => item.id)).size, state.queue.length, 'indexed heap görünümünde ID tekrarı yok'); equal(state.queue.length, rows.filter(row => row.status === 'queued').length, 'queued satırlar heapteki kayıtlara eşit');
    equal(counts.inserts, rows.filter(row => row.distance !== null).length, 'her keşfedilen tek insert'); equal(counts.improvements, counts.inserts + counts.decreases - (counts.inserts ? 1 : 0), 'kaynak insert iyileştirme sayılmaz'); equal(counts.extracts, state.order.length, 'extract sırayla birebir');
    check(rows.every(row => row.distance === null || row.distance >= expected.distances[row.id]), 'geçici uzaklık gerçek optimum için üst sınır'); check(rows.filter(row => row.status === 'unseen').every(row => row.distance === null && row.parent === null), 'görülmemiş satırlar null');
  });
  context = label; equal(state.done, true, 'terminal complete'); equal(trace.steps.at(-1).type, 'complete', 'ayrı complete olayı'); equal(trace.counts, counts, 'son sayaçlar'); equal(trace.stats, stats, 'son kuyruk tepe değeri');
  equal(trace.result, { distances: expected.distances, parents: Object.fromEntries(rows.map(row => [row.id, row.parent])), order: state.order, reachable: expected.reachable, unreachable: expected.unreachable }, 'Floyd uzaklıkları ve son ebeveyn/sıra/kümeler');
  equal(counts.initializations, vertices.length, 'ulaşılamayanlar dahil V başlatımı'); equal(counts.edgeScans, expected.scans, 'ulaşılan bileşenin derece toplamı'); check(counts.edgeScans <= 2 * triples.length, 'en çok2E tarama'); equal(counts.inserts, expected.reachable.length, 'kaynak dahil her erişilene tek kayıt'); equal(counts.extracts, expected.reachable.length, 'her erişilen bir kez kesinleşir');
  equal(trace.steps.length, 2 + 2 * expected.reachable.length + counts.edgeScans + counts.improvements, 'init+Rsettle+scan+relax+Rfinish+complete');
  expected.ids.forEach(target => {
    const route = model.shortestPath(trace, target), distance = expected.distances[target];
    if (distance === null) equal(route, null, 'ulaşılamayana yol yok');
    else {
      equal(route[0], source, 'yol kaynaktan başlar'); equal(route.at(-1), target, 'yol hedefe gider'); equal(new Set(route).size, route.length, 'ebeveyn yolu çevrimsiz');
      let total = 0; for (let i = 1; i < route.length; i += 1) { const weight = expected.weights[expected.index.get(route[i - 1])][expected.index.get(route[i])]; check(Number.isFinite(weight), 'yolda gerçek kenar var'); total += weight; check(state.order.indexOf(route[i - 1]) < state.order.indexOf(route[i]), 'sıfır ağırlıkta da ebeveyn daha önce kesinleşmiştir'); }
      equal(total, distance, 'yolun toplam ağırlığı Floyd optimumu');
    }
  });
  return trace;
}
function graphCase(vertices, edges, source, tieOrder, label) { const before = copy({ vertices, edges }); const trace = audit(model.traceDijkstra(vertices, edges, source, tieOrder === undefined ? undefined : { tieOrder }), vertices, edges, source, tieOrder || 'ascending', label); equal({ vertices, edges }, before, 'girdiler değişmez'); return trace; }
function throws(fn, label) { context = label; report.cases += 1; let thrown = null; try { fn(); } catch (error) { thrown = error; } check(thrown instanceof TypeError || thrown instanceof RangeError, 'hatalı girdi açık hata üretir'); }
const vertices = [4, 7, 11, 18, 20, 24, 26, 31], triples = [[7, 4, 1], [18, 7, 2], [7, 11, 2], [4, 11, 2], [20, 31, 2], [18, 24, 3], [24, 11, 3], [24, 20, 4], [31, 26, 4], [11, 31, 5]];
try {
  section('Yedi ders örneği, iki aşamalı iyileştirme ve alıştırmalar', () => {
    const main = graphCase(vertices, triples, 24, undefined, 'ana kaynak24'); equal(main.counts, { initializations: 8, edgeScans: 20, improvements: 8, inserts: 8, decreases: 1, extracts: 8 }, 'ana8/20/8/8/1/8'); equal(main.stats.maxQueue, 5, 'ana en kalabalık5'); equal(main.steps.length, 46, 'ana46olay'); equal(main.result.order, [24, 11, 18, 20, 4, 7, 31, 26], 'ana kesinleşme'); equal(main.result.distances, { 4: 5, 7: 5, 11: 3, 18: 3, 20: 4, 24: 0, 26: 10, 31: 6 }, 'ana uzaklıklar'); equal(model.shortestPath(main, 31), [24, 20, 31], 'ana31yolu');
    const first31 = main.steps.find(step => step.type === 'relax' && step.to === 31), reduce31 = main.steps.find(step => step.type === 'relax' && step.to === 31 && step.queueAction === 'decrease'); equal([first31.distance, first31.queueAction, first31.from], [8, 'insert', 11], '31önce8via11'); equal([reduce31.previousDistance, reduce31.distance, reduce31.from, reduce31.queueAction], [8, 6, 20, 'decrease'], 'rehberli6/20veinsertdeğildecrease');
    const inspect31 = main.steps[reduce31.step - 2]; equal(inspect31.type, 'inspect', 'azaltmadan önce ayrı inspect'); equal(inspect31.state.rows.find(row => row.id === 31).distance, 8, 'inspectte8korunur'); equal(reduce31.state.rows.find(row => row.id === 31).distance, 6, 'yalnızrelaxta6olur');
    const ties = graphCase(vertices, triples, 24, 'descending', 'eşitler ters'); equal(ties.result.distances, main.result.distances, 'eşitlik sırası optimumu değiştirmez'); equal(ties.result.parents[7], 18, 'eşitlikteilkebeveyn18korunur'); equal(main.result.parents[7], 11, 'artanebeveyn11'); equal(ties.stats.maxQueue, 4, 'tersenfazla4');
    const source11 = graphCase(vertices, triples, 11, undefined, 'kaynak11'); equal(source11.result.distances[31], 5, 'MSTyolu9yerine5'); equal(model.shortestPath(source11, 31), [11, 31], 'doğrudan11-31');
    const isolated = graphCase(vertices, triples.filter(([a, b]) => !(a === 31 && b === 26)), 24, undefined, '26izole'); equal(isolated.result.unreachable, [26], '26null'); graphCase(vertices, triples.map(([a, b, w]) => [a, b, a === 7 && b === 4 ? 0 : w]), 24, undefined, 'sıfırağırlık'); graphCase([24], [], 24, undefined, 'tekdüğüm'); const noedges = graphCase(vertices, [], 24, undefined, 'kenarsız'); equal(noedges.counts, { initializations: 8, edgeScans: 0, improvements: 0, inserts: 1, decreases: 0, extracts: 1 }, 'yalnızkaynaktekextract');
    const independent = graphCase([4, 7, 18, 20, 24, 26], [[18, 7, 6], [18, 24, 2], [24, 7, 1], [7, 26, 2], [24, 26, 7], [26, 4, 1]], 18, undefined, 'bağımsız'); equal(independent.counts, { initializations: 6, edgeScans: 12, improvements: 6, inserts: 5, decreases: 2, extracts: 5 }, 'bağımsız6/12/6/5/2/5'); equal(independent.stats.maxQueue, 2, 'bağımsızmax2'); equal(independent.result.distances, { 4: 6, 7: 3, 18: 0, 20: null, 24: 2, 26: 5 }, 'bağımsızuzaklıklar'); equal(independent.steps.filter(step => step.type === 'relax' && step.queueAction === 'decrease').map(step => [step.to, step.previousDistance, step.distance]), [[7, 6, 3], [26, 9, 5]], 'bağımsıziki yerindeazaltma');
  });
  section('Dörde kadar bütün absent/0/1/2 graflar × her kaynak × iki eşitlik sırası', () => {
    for (let n = 1; n <= 4; n += 1) {
      const ids = Array.from({ length: n }, (_, i) => i), pairs = []; for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) pairs.push([a, b]);
      for (let code = 0; code < 4 ** pairs.length; code += 1) {
        let rest = code; const input = []; pairs.forEach(([a, b]) => { const state = rest % 4; rest = Math.floor(rest / 4); if (state) input.push([a, b, state - 1]); });
        for (const source of ids) for (const tieOrder of ['ascending', 'descending']) graphCase(ids, input, source, tieOrder, 'tam n' + n + '/g' + code + '/s' + source + '/' + tieOrder);
      }
    }
  });
  section('Rastgele heap/positions stresi ve32düğüm sınırları', () => {
    let seed = 0x11d11234; function random(limit) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % limit; }
    let stressDecreases = 0;
    for (let test = 0; test < 100; test += 1) {
      const n = 1 + random(16), ids = Array.from({ length: n }, (_, i) => i * 13), input = [];
      for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) if (random(4) === 0) input.push([ids[a], ids[b], random(100)]);
      const source = ids[random(n)], trace = graphCase(ids, input, source, random(2) ? 'ascending' : 'descending', 'rastgele' + test); stressDecreases += trace.counts.decreases;
      const changed = model.traceDijkstra(ids.slice().reverse(), input.slice().reverse().map(([a, b, w]) => [b, a, w]), source, { tieOrder: trace.tieOrder }); equal(changed.steps, trace.steps, 'giriş düğüm/kenar sırası ve yönlü yazım kanonik izi değiştirmez'); equal(changed.result, trace.result, 'kanonik sonuç aynı');
    }
    const ids = Array.from({ length: 32 }, (_, i) => i), chain = ids.slice(1).map((id, i) => [i, id, 1000000]); const long = graphCase(ids, chain, 0, undefined, '32düğüm/milyonluk zincir'); equal(long.result.distances[31], 31000000, '31milyon güvenli maliyet');
    const dense = []; for (let a = 0; a < 32; a += 1) for (let b = a + 1; b < 32; b += 1) dense.push([a, b, a === 0 ? 1000 + b * 10 : 1]);
    for (const tieOrder of ['ascending', 'descending']) { const trace = graphCase(ids, dense, 0, tieOrder, 'yoğun positions stresi/' + tieOrder); equal(trace.counts.decreases, 30, '31kayıt içinden30ayrıdecrease'); equal(trace.stats.maxQueue, 31, 'heap31kayıt'); stressDecreases += trace.counts.decreases; }
    check(stressDecreases > 100, 'rastgele+yoğun testler gerçekten birçok decrease yapıyor'); report.stressDecreaseOperations = stressDecreases;
    graphCase([0, Number.MAX_SAFE_INTEGER, 4], [[0, Number.MAX_SAFE_INTEGER, 0], [Number.MAX_SAFE_INTEGER, 4, 1000000]], 0, undefined, 'sıfırID/kenarveIDüst sınırı');
    graphCase([0, 1, 2, 3], [[0, 1, 1], [2, 3, 0]], 0, undefined, 'başkabileşendekikenartaranmaz');
  });
  section('Girdi ve yol doğrulama; erişilemeyen bileşende de negatif ret', () => {
    for (const bad of [undefined, null, {}, '', [], [1, 1], [-1, 1], [0, 1.5], [0, Infinity], [0, NaN], [0, Number.MAX_SAFE_INTEGER + 1], Array(2), Array.from({ length: 33 }, (_, i) => i)]) throws(() => model.traceDijkstra(bad, [], 0), 'hatalıdüğümler');
    for (const bad of [null, {}, '', [null], [[]], [[0, 1]], [[0, 1, 2, 3]], [[0, 0, 1]], [[0, 4, 1]], [[0, -1, 1]], [[0, 1.5, 1]], [[0, 1, -1]], [[0, 1, 1.5]], [[0, 1, NaN]], [[0, 1, Infinity]], [[0, 1, 1000001]], [[0, 1, '1']], Array(1), [[0, 1, 1], [0, 1, 2]], [[0, 1, 1], [1, 0, 1]]]) throws(() => model.traceDijkstra([0, 1, 2, 3], bad, 0), 'hatalıkenar/ağırlık');
    throws(() => model.traceDijkstra([0, 1, 2, 3], [[0, 1, 1], [2, 3, -1]], 0), 'uzakbileşendenegatifkenaröncedenreddedilir');
    for (const source of [null, undefined, '0', -1, 1.5, 5, NaN]) throws(() => model.traceDijkstra([0, 1], [], source), 'hatalıkaynak'); for (const options of [null, [], '', { tieOrder: null }, { tieOrder: 'random' }]) throws(() => model.traceDijkstra([0, 1], [], 0, options), 'hatalıtie');
    const trace = model.traceDijkstra(vertices, triples, 24); for (const target of [undefined, null, -1, 5, 1.5, '24', NaN]) throws(() => model.shortestPath(trace, target), 'hatalıhedef');
    for (const bad of [null, {}, { vertices: [24], result: {}, steps: [] }]) throws(() => model.shortestPath(bad, 24), 'geçersiziz'); const unfinished = copy(trace); unfinished.steps.at(-1).state.done = false; throws(() => model.shortestPath(unfinished, 24), 'tamamlanmamışiz'); const cycle = copy(trace); cycle.result.parents[31] = 31; throws(() => model.shortestPath(cycle, 31), 'ebeveynçevrimi'); const wrongCost = copy(trace); wrongCost.result.distances[31] = 2; throws(() => model.shortestPath(wrongCost, 31), 'yoltoplamıuzaklıklaeşleşmeli');
  });
  section('Saflık, dondurulmuş girdiler, snapshot bağımsızlığı ve export', () => {
    const frozenV = freeze(vertices.slice()), frozenE = freeze(copy(triples)), options = freeze({ tieOrder: 'ascending' }); const trace = graphCase(frozenV, frozenE, 24, 'ascending', 'dondurulmuşgraf'), saved = copy(trace); equal(model.traceDijkstra(frozenV, frozenE, 24, options), saved, 'dondurulmuşseçenek');
    trace.steps[0].state.rows[0].distance = 999; trace.steps[0].state.queue[0].distance = 999; equal(trace.initialState, saved.initialState, 'adımilkdurumuetkilemez'); equal(trace.steps.slice(1), saved.steps.slice(1), 'adımlarbağımsız'); equal(trace.result, saved.result, 'adımsonucuetkilemez'); trace.edges[0].weight = 999; trace.adjacency[4][0].weight = 999; equal(frozenE, triples, 'girdikorunur'); equal(model.traceDijkstra(frozenV, frozenE, 24), saved, 'çağrılarbağımsız/belirlenebilir');
    const route = model.shortestPath(saved, 31); route[0] = 999; equal(model.shortestPath(saved, 31), [24, 20, 31], 'yolyenidizidöner');
    const sandbox = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), sandbox, { filename: 'w11/model.js' }); context = 'tarayıcıexport'; report.cases += 1; equal(Object.keys(sandbox.FreshWeek11).sort(), ['shortestPath', 'traceDijkstra'], 'globalAPI'); equal(Object.keys(model).sort(), ['shortestPath', 'traceDijkstra'], 'CommonJSAPI'); equal(sandbox.FreshWeek11.traceDijkstra(vertices, triples, 24), saved, 'tarayıcıveCommonJSaynıiz'); equal(sandbox.FreshWeek11.shortestPath(saved, 31), [24, 20, 31], 'tarayıcıyolu');
  });
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = { message: error.message, detail: error.detail, stack: error.stack }; process.exitCode = 1; }
report.milliseconds = Date.now() - started; const reportFlag = process.argv.indexOf('--report'); if (reportFlag >= 0) { if (!process.argv[reportFlag + 1]) throw new Error('--report için dosya yolu gerekir.'); const reportPath = path.resolve(process.argv[reportFlag + 1]); fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify({ status: report.status, checks: report.checks, cases: report.cases, milliseconds: report.milliseconds, stressDecreaseOperations: report.stressDecreaseOperations, failure: report.failure?.message }));
