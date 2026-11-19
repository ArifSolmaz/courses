#!/usr/bin/env node
'use strict';
// Distances are checked against Floyd–Warshall, not a second BFS implementation.
// Every event is also checked as a local transition of a logical FIFO machine.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w8/model.js');
const model = require(modelPath);
const started = Date.now();
const report = {
  lesson: 'Sıfırdan Hafta 8 — komşuluk listesi, FIFO ve BFS uzaklığı',
  status: 'running', checks: 0, cases: 0, sections: [],
  contract: {
    graph: 'Yönsüz basit graf; düğümler benzersiz, negatif olmayan güvenli tamsayı; 1–32 düğüm.',
    scans: 'Bir komşuluk listesi girdisi. Erişilen bileşenin derece toplamı; bütün grafın her zaman 2E değeri değil.',
    discovery: 'Uzaklık, ebeveyn ve keşfedildi işareti kuyruğa ekleme anında birlikte belirlenir.',
    units: 'V satır başlatımı, komşu girdisi taraması, enqueue ve dequeue ayrı mantıksal birimlerdir.',
    unknown: 'Null uzaklık, tamamlanmadan önce henüz keşfedilmedi; bütün kaynak bileşeni bitince erişilemez.',
    oracle: 'Bağımsız komşuluk matrisi ve Floyd–Warshall tüm çift en kısa uzaklıkları.'
  },
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex')
};
let context = '';
function check(value, message, detail) {
  report.checks += 1;
  if (!value) { const error = new Error(context + ': ' + message); if (detail !== undefined) error.detail = detail; throw error; }
}
function equal(actual, expected, message) { check(JSON.stringify(actual) === JSON.stringify(expected), message, { actual, expected }); }
function section(name, run) {
  const before = { checks: report.checks, cases: report.cases, time: Date.now() }; run();
  report.sections.push({ name, checks: report.checks - before.checks, cases: report.cases - before.cases, milliseconds: Date.now() - before.time });
}
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } return value; }
function oracle(vertices, edges, source, neighborOrder) {
  const ids = vertices.slice().sort((a, b) => a - b), index = new Map(ids.map((id, i) => [id, i]));
  const matrix = ids.map(() => ids.map(() => false));
  edges.forEach(([a, b]) => { matrix[index.get(a)][index.get(b)] = true; matrix[index.get(b)][index.get(a)] = true; });
  const distance = matrix.map((row, i) => row.map((linked, j) => i === j ? 0 : linked ? 1 : Infinity));
  for (let k = 0; k < ids.length; k += 1) for (let i = 0; i < ids.length; i += 1) for (let j = 0; j < ids.length; j += 1) distance[i][j] = Math.min(distance[i][j], distance[i][k] + distance[k][j]);
  const distances = Object.fromEntries(ids.map((id, i) => [id, Number.isFinite(distance[index.get(source)][i]) ? distance[index.get(source)][i] : null]));
  const adjacency = Object.fromEntries(ids.map((id, i) => { const neighbors = ids.filter((_, j) => matrix[i][j]); return [id, neighborOrder === 'descending' ? neighbors.reverse() : neighbors]; }));
  const reachable = ids.filter(id => distances[id] !== null), unreachable = ids.filter(id => distances[id] === null);
  return { ids, matrix, index, adjacency, distances, reachable, unreachable, scans: reachable.reduce((sum, id) => sum + adjacency[id].length, 0) };
}
function audit(trace, vertices, edges, source, neighborOrder, label) {
  context = label; report.cases += 1;
  const expected = oracle(vertices, edges, source, neighborOrder);
  const rows = expected.ids.map(id => ({ id, distance: null, parent: null, status: 'unseen' }));
  const byId = new Map(rows.map(row => [row.id, row]));
  const state = { queue: [], current: null, neighborIndex: null, activeEdge: null, rows, order: [], done: false };
  const counts = { initializations: 0, edgeScans: 0, enqueues: 0, dequeues: 0 }, stats = { maxQueue: 0 };
  const discovered = new Set(), finished = new Set();
  equal(trace.operation, 'bfs', 'işlem türü'); equal(trace.vertices, expected.ids, 'sayısal artan düğümler');
  equal(trace.edges, edges, 'kenar çiftleri bağımsız kopya'); equal(trace.source, source, 'kaynak');
  equal(trace.neighborOrder, neighborOrder, 'komşu sırası'); equal(trace.adjacency, expected.adjacency, 'bağımsız matristen komşuluk listesi');
  equal(trace.initialState, state, 'başlangıçta henüz açılmamış kaynak ve bilinmeyen uzaklıklar');
  equal(trace.steps.length, 1 + expected.scans + 2 * expected.reachable.length, 'bir init, her erişilene pop/finish ve her girdiye inspect');
  let priorDequeuedDistance = -1;
  trace.steps.forEach((step, i) => {
    context = label + ' / adım ' + (i + 1);
    equal(step.step, i + 1, 'bir tabanlı adım'); check(!state.done, 'biten aramadan sonra yeni olay yok');
    if (step.type === 'init-root') {
      equal(i, 0, 'init yalnız ilk olay'); equal(step.vertex, source, 'kaynak başlangıcı');
      counts.initializations = expected.ids.length;
      const root = byId.get(source); root.distance = 0; root.status = 'queued';
      state.queue.push(source); counts.enqueues += 1; stats.maxQueue = 1; discovered.add(source);
    } else if (step.type === 'dequeue') {
      check(i > 0, 'kaynak açıldıktan sonra pop'); equal(state.current, null, 'önceki düğümün bütün komşuları bitmiş');
      equal(step.vertex, state.queue[0], 'yalnız FIFO başı çıkar');
      state.queue.shift(); state.current = step.vertex; state.neighborIndex = 0; state.activeEdge = null;
      state.order.push(step.vertex); byId.get(step.vertex).status = 'active'; counts.dequeues += 1;
      check(byId.get(step.vertex).distance >= priorDequeuedDistance, 'FIFO pop uzaklıkları azalmıyor'); priorDequeuedDistance = byId.get(step.vertex).distance;
    } else if (step.type === 'inspect') {
      equal(step.from, state.current, 'yalnız etkin düğümün listesi taranır'); equal(step.neighborIndex, state.neighborIndex, 'ofset sırayla ve bir kez');
      equal(step.to, expected.adjacency[state.current][state.neighborIndex], 'doğru komşuluk girdisi');
      const next = byId.get(step.to), current = byId.get(step.from), isNew = next.distance === null;
      equal(step.previousDistance, next.distance, 'önceki uzaklık; sıfır da keşfedilmiş demek'); equal(step.discovered, isNew, 'keşif yalnız ilk enqueue anında');
      if (isNew) {
        check(!discovered.has(step.to), 'aynı düğüm yeniden kuyruğa konmaz'); discovered.add(step.to);
        next.distance = current.distance + 1; next.parent = step.from; next.status = 'queued';
        equal(next.distance, expected.distances[step.to], 'ilk keşif uzaklığı bağımsız en kısa uzaklıkla aynı');
        state.queue.push(step.to); counts.enqueues += 1; stats.maxQueue = Math.max(stats.maxQueue, state.queue.length);
      }
      counts.edgeScans += 1; state.neighborIndex += 1; state.activeEdge = { from: step.from, to: step.to };
    } else if (step.type === 'finish') {
      equal(step.vertex, state.current, 'etkin düğüm tamamlanır'); equal(state.neighborIndex, expected.adjacency[state.current].length, 'erken bitirme yok; bütün komşular tarandı');
      check(!finished.has(step.vertex), 'bir kez tamamlanır'); finished.add(step.vertex); byId.get(step.vertex).status = 'done';
      state.current = null; state.neighborIndex = null; state.activeEdge = null; state.done = state.queue.length === 0;
      if (state.done) equal(i, trace.steps.length - 1, 'yalnız bütün kaynak bileşeni bitince done');
    } else check(false, 'tanınmayan olay türü', step.type);
    equal(step.state, state, 'FIFO, etkin düğüm/kenar/ofset, tüm satırlar, sıra ve done snapshotı');
    equal(step.counts, counts, 'yalnız açılmış olayları ayrı birimlerde say'); equal(step.stats, stats, 'gerçek en büyük bekleyen kuyruk');
    equal(new Set(state.queue).size, state.queue.length, 'bekleyen kuyrukta tekrar yok');
    check(state.current === null || !state.queue.includes(state.current), 'çıkan etkin düğüm kuyrukta değil');
    const queueDistances = state.queue.map(id => byId.get(id).distance);
    check(queueDistances.every((d, j) => !j || queueDistances[j - 1] <= d), 'FIFO kuyruğu katman sırasını korur');
    check(queueDistances.every(d => Number.isInteger(d) && d >= 0), 'kuyruğa konmadan uzaklık yazılmıştır');
    equal(rows.filter(row => row.distance !== null).length, counts.enqueues, 'her uzaklık tek enqueue ile atanır');
    equal(state.order.length, counts.dequeues, 'sıra yalnız dequeue ile büyür');
  });
  context = label;
  equal(state.done, true, 'tam kaynak bileşeni bitti'); equal(state.queue, [], 'son FIFO boş'); equal(state.current, null, 'son etkin düğüm yok');
  equal(trace.counts, counts, 'son sayaçlar'); equal(trace.stats, stats, 'son kuyruk tepe değeri');
  equal(trace.result.vertices, expected.ids, 'sonuç kendi düğüm evrenini içerir'); equal(trace.result.source, source, 'sonuç kaynağı');
  equal(trace.result.distances, expected.distances, 'Floyd–Warshall bütün uzaklıkları');
  equal(trace.result.parents, Object.fromEntries(rows.map(row => [row.id, row.parent])), 'keşif ebeveynleri değişmez');
  equal(trace.result.order, state.order, 'dequeue sırası'); equal(trace.result.reachable, expected.reachable, 'erişilen küme'); equal(trace.result.unreachable, expected.unreachable, 'yalnız sonda erişilemeyen küme');
  equal(counts.initializations, vertices.length, 'bütün V satır ayrı başlatılır'); equal(counts.enqueues, expected.reachable.length, 'kök dahil her erişilen bir kez enqueue'); equal(counts.dequeues, expected.reachable.length, 'her erişilen bir kez dequeue');
  equal(counts.edgeScans, expected.scans, 'erişilen bileşenin derece toplamı'); check(counts.edgeScans <= 2 * edges.length, 'yönsüz grafın toplam2E üst sınırı');
  equal(discovered.size, expected.reachable.length, 'keşif sayısı'); equal(finished.size, expected.reachable.length, 'tamamlanma sayısı');
  expected.ids.forEach(target => {
    const route = model.shortestPath(trace, target), d = expected.distances[target];
    if (d === null) equal(route, null, 'erişilemeyene yol yok');
    else {
      equal(route[0], source, 'yol kaynaktan başlar'); equal(route.at(-1), target, 'yol hedefte biter'); equal(route.length - 1, d, 'yolun kenar sayısı en kısa uzaklık');
      equal(new Set(route).size, route.length, 'ebeveyn yolunda çevrim yok');
      check(route.every((id, j) => !j || expected.matrix[expected.index.get(route[j - 1])][expected.index.get(id)]), 'yolun her adımı gerçek kenar');
    }
  });
  return trace;
}
function graphCase(vertices, edges, source, order, label) {
  const before = copy({ vertices, edges });
  const trace = audit(model.traceBFS(vertices, edges, source, order === undefined ? undefined : { neighborOrder: order }), vertices, edges, source, order || 'ascending', label);
  equal({ vertices, edges }, before, 'girdiler değişmez'); return trace;
}
function throws(fn, label) {
  context = label; report.cases += 1; let thrown = null; try { fn(); } catch (error) { thrown = error; }
  check(thrown instanceof TypeError || thrown instanceof RangeError, 'geçersiz girdi açık hata üretir');
}
const vertices = [4, 7, 11, 18, 20, 24, 26, 31];
const edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 31], [20, 31]];
try {
  section('Yedi öğrenci örneği ve iki alıştırmanın sabit beklentileri', () => {
    const main = graphCase(vertices, edges, 18, undefined, 'ana graf');
    equal(main.counts, { initializations: 8, edgeScans: 16, enqueues: 7, dequeues: 7 }, 'main V8/tarama16/7enqueue/7dequeue'); equal(main.stats, { maxQueue: 3 }, 'tepe kuyruk3'); equal(main.steps.length, 31, 'main31 olay');
    equal(main.result.order, [18, 7, 24, 4, 11, 20, 31], 'main FIFO sırası'); equal(model.shortestPath(main, 31), [18, 7, 11, 31], 'main üç kenarlı yol'); equal(model.shortestPath(main, 26), null, '26 erişilemez');
    const reverse = graphCase(vertices, edges, 18, 'descending', 'ters komşu sırası');
    equal(reverse.result.distances, main.result.distances, 'komşu sırası uzaklıkları değiştirmez'); equal(reverse.result.order, [18, 24, 7, 20, 11, 4, 31], 'ters FIFO sırası'); equal(model.shortestPath(reverse, 31), [18, 24, 20, 31], 'eşit uzunluklu başka ebeveyn yolu');
    const opposite = graphCase(vertices, edges, 31, 'ascending', 'kaynak31'); equal(model.shortestPath(opposite, 18), [31, 11, 7, 18], 'ters yönden üç kenar');
    const isolated = graphCase(vertices, edges, 26, undefined, 'izole kaynak26'); equal(isolated.counts, { initializations: 8, edgeScans: 0, enqueues: 1, dequeues: 1 }, 'izole0tarama/1enqueue/1dequeue'); equal(isolated.steps.length, 3, 'izole üç olay');
    const linked = graphCase(vertices, edges.concat([[31, 26]]), 18, undefined, '26 bağlandı'); equal(linked.counts, { initializations: 8, edgeScans: 18, enqueues: 8, dequeues: 8 }, 'bağlı graf18tarama/8enqueue'); equal(linked.result.distances[26], 4, 'yeni düğüme dört kenar');
    graphCase([18], [], 18, undefined, 'tek düğüm'); const noedges = graphCase(vertices, [], 18, undefined, 'kenarsız graf'); equal(noedges.result.reachable, [18], 'kenarsız yalnız kaynak');
    const sevenFinished = main.steps.find(step => step.type === 'finish' && step.vertex === 7), twentyFourFinished = main.steps.find(step => step.type === 'finish' && step.vertex === 24);
    equal(sevenFinished.state.queue, [24, 4, 11], 'rehberli başlangıç FIFO'); equal(twentyFourFinished.state.queue, [4, 11, 20], 'rehberli sonuç FIFO'); equal([twentyFourFinished.state.rows.find(row => row.id === 20).distance, main.adjacency[24].length], [2, 3], 'rehberli2/3');
    const independent = graphCase([4, 7, 18, 20, 24, 26], [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]], 18, undefined, 'bağımsız altı düğüm/beş kenar');
    equal([independent.result.distances[26], independent.result.distances[4], independent.counts.edgeScans, independent.counts.enqueues], [2, 3, 10, 5], 'bağımsız2/3/10/5'); equal(independent.counts.initializations, 6, 'V6 sayısı E5 ve erişilen5 değildir'); equal(independent.result.unreachable, [20], 'bağımsız20 izole');
  });
  section('Beşe kadar bütün basit yönsüz graflar, her kaynak ve iki komşu sırası', () => {
    for (let n = 1; n <= 5; n += 1) {
      const ids = Array.from({ length: n }, (_, i) => i), possible = [];
      for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) possible.push([a, b]);
      for (let mask = 0; mask < 2 ** possible.length; mask += 1) {
        const links = possible.filter((_, i) => mask & (2 ** i));
        for (const source of ids) for (const order of ['ascending', 'descending']) graphCase(ids, links, source, order, 'tam tarama n' + n + '/g' + mask + '/s' + source + '/' + order);
      }
    }
  });
  section('Rastgele graflar, uzak bileşen, güvenli ID ve en büyük graf', () => {
    let seed = 0x8bf51234;
    function random(limit) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % limit; }
    for (let test = 0; test < 80; test += 1) {
      const n = 1 + random(16), ids = Array.from({ length: n }, (_, i) => 2 + i * 7), links = [];
      for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) if (random(5) === 0) links.push([ids[a], ids[b]]);
      const source = ids[random(n)], trace = graphCase(ids, links, source, 'ascending', 'rastgele graf' + test);
      const changed = model.traceBFS(ids.slice().reverse(), links.slice().reverse().map(edge => edge.slice().reverse()), source);
      equal(changed.steps, trace.steps, 'kenar giriş sırası/yönü ve düğüm sırası yürütümü değiştirmez'); equal(changed.result, trace.result, 'aynı graf sonucu');
    }
    const twoComponents = graphCase([0, 1, 2, 3], [[0, 1], [2, 3]], 0, undefined, 'kenarlı erişilemeyen bileşen'); equal(twoComponents.counts.edgeScans, 2, '2E4 yerine erişilen bileşende2tarama');
    graphCase([0, Number.MAX_SAFE_INTEGER, 4], [[0, Number.MAX_SAFE_INTEGER], [Number.MAX_SAFE_INTEGER, 4]], 0, undefined, 'sıfır ve güvenli tamsayı sınırı');
    const ids = Array.from({ length: 32 }, (_, i) => i), chain = ids.slice(1).map((id, i) => [i, id]); graphCase(ids, chain, 0, undefined, '32 düğümlü zincir');
    const clique = []; for (let a = 0; a < 32; a += 1) for (let b = a + 1; b < 32; b += 1) clique.push([a, b]);
    const complete = graphCase(ids, clique, 0, undefined, '32 düğümlü tam graf'); equal(complete.counts.edgeScans, 992, 'tam grafta992komşu girdisi'); equal(complete.stats.maxQueue, 31, 'tam grafta31bekleyen');
  });
  section('Girdi doğrulama ve yol sözleşmesi', () => {
    for (const bad of [undefined, null, {}, '', [], [1, 1], [-1, 1], [0, 1.5], [0, Infinity], [0, NaN], [0, Number.MAX_SAFE_INTEGER + 1], Array(2), Array.from({ length: 33 }, (_, i) => i)]) throws(() => model.traceBFS(bad, [], 0), 'geçersiz düğüm dizisi');
    for (const source of [null, undefined, '1', -1, 1.5, 3, Infinity]) throws(() => model.traceBFS([0, 1, 2], [], source), 'bilinmeyen/geçersiz kaynak');
    for (const bad of [null, {}, '', [null], [[]], [[0]], [[0, 1, 2]], [[0, 0]], [[0, 4]], [[0, -1]], [[0, 1.5]], [[0, NaN]], Array(1), [[0, 1], [0, 1]], [[0, 1], [1, 0]]]) throws(() => model.traceBFS([0, 1, 2, 3], bad, 0), 'geçersiz kenar dizisi');
    for (const options of [null, [], '', { neighborOrder: 'random' }, { neighborOrder: null }]) throws(() => model.traceBFS([0], [], 0, options), 'geçersiz komşu sırası');
    const trace = model.traceBFS(vertices, edges, 18);
    for (const target of [undefined, null, -1, 5, 1.5, '18', NaN]) throws(() => model.shortestPath(trace, target), 'bilinmeyen/geçersiz hedef');
    for (const bad of [null, {}, { vertices: [18], result: {}, steps: [] }]) throws(() => model.shortestPath(bad, 18), 'geçersiz BFS izi');
    const unfinished = copy(trace); unfinished.steps.at(-1).state.done = false; throws(() => model.shortestPath(unfinished, 18), 'tamamlanmamış iz');
    const cyclic = copy(trace); cyclic.result.parents[31] = 31; throws(() => model.shortestPath(cyclic, 31), 'bozuk ebeveyn çevrimi');
    const inconsistent = copy(trace); inconsistent.result.distances[31] = 1; throws(() => model.shortestPath(inconsistent, 31), 'bozuk uzaklık/yol');
  });
  section('Saflık, dondurulmuş girdiler ve bağımsız snapshotlar', () => {
    const frozenVertices = freeze(vertices.slice()), frozenEdges = freeze(copy(edges));
    const trace = graphCase(frozenVertices, frozenEdges, 18, 'ascending', 'dondurulmuş graf'), saved = copy(trace);
    trace.steps[0].state.rows[0].parent = 999; trace.steps[0].state.queue.push(999);
    equal(trace.initialState, saved.initialState, 'adım değişimi ilk gösterimi değiştirmez'); equal(trace.steps.slice(1), saved.steps.slice(1), 'anlık görüntüler birbirinden bağımsız'); equal(trace.result, saved.result, 'adım değişimi sonucu değiştirmez');
    trace.adjacency[18].push(999); trace.edges[0][0] = 999; trace.vertices[0] = 999; equal(frozenVertices, vertices, 'düğüm girdisi korunur'); equal(frozenEdges, edges, 'kenar girdisi korunur');
    equal(model.traceBFS(frozenVertices, frozenEdges, 18), saved, 'çağrılar arası belirlenebilirlik ve bağımsızlık');
    const routeTrace = model.traceBFS(vertices, edges, 18), route = model.shortestPath(routeTrace, 31); route[0] = 999; equal(model.shortestPath(routeTrace, 31), [18, 7, 11, 31], 'yol yeni dizi döner');
  });
  section('Tarayıcı globali ve CommonJS aynı genel API', () => {
    const sandbox = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), sandbox, { filename: 'w8/model.js' });
    context = 'tarayıcı export'; report.cases += 1;
    equal(Object.keys(sandbox.FreshWeek8).sort(), ['shortestPath', 'traceBFS'], 'global API yöntemleri'); equal(Object.keys(model).sort(), ['shortestPath', 'traceBFS'], 'CommonJS API yöntemleri');
    const trace = model.traceBFS(vertices, edges, 18); equal(sandbox.FreshWeek8.traceBFS(vertices, edges, 18), trace, 'tarayıcı ve CommonJS aynı iz'); equal(sandbox.FreshWeek8.shortestPath(trace, 31), [18, 7, 11, 31], 'tarayıcı yol API');
  });
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = { message: error.message, detail: error.detail, stack: error.stack }; process.exitCode = 1;
}
report.milliseconds = Date.now() - started;
const reportFlag = process.argv.indexOf('--report');
if (reportFlag >= 0) {
  if (!process.argv[reportFlag + 1]) throw new Error('--report için dosya yolu gerekir.');
  const reportPath = path.resolve(process.argv[reportFlag + 1]); fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ status: report.status, checks: report.checks, cases: report.cases, milliseconds: report.milliseconds, failure: report.failure?.message }));
