#!/usr/bin/env node
'use strict';
// Independent optimum oracle enumerates every candidate spanning-forest subset.
// Connectivity uses a matrix traversal, not the model's component relabeling.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w10/model.js');
const model = require(modelPath);
const started = Date.now();
const report = {
  lesson: 'Sıfırdan Hafta 10 — maliyetli bağlantı, Kruskal ve minimum germe ormanı',
  status: 'running', checks: 0, cases: 0, sections: [],
  contract: {
    graph: '1–32 benzersiz negatif olmayan güvenli ID; yönsüz basit kenarlar; maliyet tamsayı0..1000000.',
    core: 'Maliyetler daima artan. Yalnız eşit maliyetlerde uç sırası değişir. Bütün E kenar işlenir.',
    relabel: 'Her kabulde bütün V satır taranır; labelScans=V×merges. Bu basit sürümün çekirdek üst sınırı O(ElogE+E+V²).',
    outputs: 'Kopuk grafta minimum germe ormanı; izole düğümler de bileşendir. Çevrim tanığı seçili orman yolu ve reddedilen kapanış kenarıdır.',
    validator: 'Aynı optimum maliyetli bütün farklı ormanlar kabul edilir; seçili kenar listesi sırasından bağımsızdır.',
    oracle: 'Dört düğüme kadar bütün absent/0/1/2 ağırlıklı graflarda tüm orman altkümeleri; matris bağlantı bileşenleri.'
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
function parts(ids, selected) {
  const matrix = ids.map(() => ids.map(() => false)), index = new Map(ids.map((id, i) => [id, i]));
  selected.forEach(edge => { matrix[index.get(edge.u)][index.get(edge.v)] = true; matrix[index.get(edge.v)][index.get(edge.u)] = true; });
  const unseen = new Set(ids), groups = [];
  for (const root of ids) {
    if (!unseen.has(root)) continue;
    const group = [], frontier = [root]; unseen.delete(root);
    for (let head = 0; head < frontier.length; head += 1) { const vertex = frontier[head]; group.push(vertex); ids.forEach(id => { if (unseen.has(id) && matrix[index.get(vertex)][index.get(id)]) { unseen.delete(id); frontier.push(id); } }); }
    groups.push(group.sort((a, b) => a - b));
  }
  return groups.sort((a, b) => a[0] - b[0]);
}
function labelsFor(groups) { return Object.fromEntries(groups.flatMap(group => group.map(id => [id, group[0]]))); }
function pathOracle(ids, selected, source, target) {
  const parent = new Map([[source, null]]), frontier = [source];
  for (let head = 0; head < frontier.length && !parent.has(target); head += 1) {
    const vertex = frontier[head];
    const neighbors = selected.flatMap(edge => edge.u === vertex ? [{ to: edge.v, edge }] : edge.v === vertex ? [{ to: edge.u, edge }] : []).sort((a, b) => a.to - b.to);
    for (const link of neighbors) if (!parent.has(link.to)) { parent.set(link.to, { from: vertex, edge: link.edge }); frontier.push(link.to); }
  }
  if (!parent.has(target)) return null;
  const vertices = [target], edges = []; let vertex = target;
  while (vertex !== source) { const link = parent.get(vertex); vertices.push(link.from); edges.push(link.edge); vertex = link.from; }
  return { vertices: vertices.reverse(), edges: edges.reverse() };
}
function enumerate(ids, triples) {
  const edges = canonical(triples), inputParts = parts(ids, edges), candidates = [];
  let optimum = Infinity;
  for (let mask = 0; mask < 2 ** edges.length; mask += 1) {
    const selected = edges.filter((_, i) => mask & (2 ** i)), groups = parts(ids, selected), total = selected.reduce((sum, edge) => sum + edge.weight, 0);
    const cycle = selected.length > ids.length - groups.length, spanning = JSON.stringify(groups) === JSON.stringify(inputParts), forest = !cycle && spanning;
    if (forest) optimum = Math.min(optimum, total); candidates.push({ selected, groups, total, cycle, spanning, forest });
  }
  return { optimum, candidates, inputParts, edges };
}
function sortedOracle(edges, tieOrder) {
  const weights = [...new Set(edges.map(edge => edge.weight))].sort((a, b) => a - b);
  return weights.flatMap(weight => { const group = edges.filter(edge => edge.weight === weight).sort((a, b) => a.u - b.u || a.v - b.v); return tieOrder === 'descending' ? group.reverse() : group; });
}
function audit(trace, vertices, triples, tieOrder, optimum, label) {
  context = label; report.cases += 1;
  const ids = vertices.slice().sort((a, b) => a - b), edges = canonical(triples), sorted = sortedOracle(edges, tieOrder);
  const state = { rows: ids.map(id => ({ id, component: id })), components: ids.map(id => [id]), selected: [], rejected: [], total: 0, activeEdge: null, decision: null, cycle: null, done: false };
  const counts = { initializations: 0, edgeChecks: 0, merges: 0, rejections: 0, labelScans: 0 };
  equal(trace.operation, 'kruskal', 'işlem türü'); equal(trace.vertices, ids, 'düğüm sırası'); equal(trace.edges, edges, 'kanonik kenarlar ve maliyetler'); equal(trace.sortedEdges, sorted, 'maliyet grupları artan, yalnız eşit uçlar ters çevrilebilir'); equal(trace.tieOrder, tieOrder, 'eşitlik kuralı'); equal(trace.initialState, state, 'başlangıçta sıfır işlem ve tekil bileşenler'); equal(trace.steps.length, 2 + 2 * edges.length, 'bütün E için consider+karar, init+complete');
  trace.steps.forEach((step, i) => {
    context = label + ' / adım ' + (i + 1); equal(step.step, i + 1, 'bir tabanlı adım'); check(!state.done, 'complete sonrası adım yok');
    if (i === 0) {
      equal(step.type, 'init', 'ilk olay init'); equal(step.vertices, ids, 'bütün düğüm satırları'); counts.initializations = ids.length;
    } else if (i === trace.steps.length - 1) {
      equal(step.type, 'complete', 'son olay complete'); state.activeEdge = null; state.decision = null; state.cycle = null; state.done = true;
      equal(step.connected, state.components.length === 1, 'MST/MSF bağlılık ayrımı'); equal(step.componentCount, state.components.length, 'son bileşen sayısı'); equal(step.total, state.total, 'son maliyet');
    } else {
      const edge = sorted[Math.floor((i - 1) / 2)], labels = labelsFor(state.components), componentU = labels[edge.u], componentV = labels[edge.v]; equal(step.edge, edge, 'doğru sıradaki tam kenar');
      if (i % 2 === 1) {
        equal(step.type, 'consider', 'karar ayrı sonraki olay'); equal(step.componentU, componentU, 'u bileşen etiketi'); equal(step.componentV, componentV, 'v bileşen etiketi');
        state.activeEdge = copy(edge); state.decision = 'pending'; state.cycle = null; counts.edgeChecks += 1;
      } else if (componentU !== componentV) {
        equal(step.type, 'accept', 'farklı bileşenler kabul'); equal(step.componentU, componentU, 'eski u etiketi'); equal(step.componentV, componentV, 'eski v etiketi'); equal(step.mergedComponent, Math.min(componentU, componentV), 'yeni etiket bileşenin minimumu');
        state.selected.push(copy(edge)); state.total += edge.weight; state.components = parts(ids, state.selected); const after = labelsFor(state.components); state.rows = ids.map(id => ({ id, component: after[id] })); state.decision = 'accept'; counts.merges += 1; counts.labelScans += ids.length;
      } else {
        equal(step.type, 'reject', 'aynı bileşen çevrim oluşturur'); const path = pathOracle(ids, state.selected, edge.u, edge.v), witness = path.vertices.concat([edge.u]);
        equal(step.cycle, witness, 'seçili ormanda benzersiz yol ve kapanış kenarı'); equal(witness[0], witness.at(-1), 'kapalı tanık'); equal(witness[0], edge.u, 'tanık u ile başlar'); equal(witness.at(-2), edge.v, 'son seçili yol düğümü v');
        equal(new Set(witness.slice(0, -1)).size, witness.length - 1, 'kapanış dışında tekrar yok'); check(path.edges.every(item => state.selected.some(selected => selected.id === item.id)), 'tanıktaki yol kenarları önceden seçilmiş');
        state.rejected.push(copy(edge)); state.cycle = witness; state.decision = 'reject'; counts.rejections += 1;
      }
    }
    equal(step.state, state, 'bütün satır/bileşen/seçili/ret/toplam/karar/tanık snapshotı'); equal(step.counts, counts, 'ayrı mantıksal sayaçlar');
    equal(counts.merges, state.selected.length, 'her kabul tek birleştirme'); equal(counts.rejections, state.rejected.length, 'ret sayısı'); equal(counts.labelScans, ids.length * counts.merges, 'her kabulde V etiket satırı'); equal(state.components.length, ids.length - state.selected.length, 'seçili orman bileşen özdeşliği'); equal(state.total, state.selected.reduce((sum, item) => sum + item.weight, 0), 'yalnız kabul edilen maliyetler');
    equal(state.components, parts(ids, state.selected), 'bağımsız erişilebilirlik bileşenleri');
  });
  context = label;
  equal(trace.counts, counts, 'son sayaçlar'); equal(counts.edgeChecks, edges.length, 'V−1 sonrasında bile bütün E denetlenir'); equal(counts.merges + counts.rejections, edges.length, 'her kenar tek karar'); equal(counts.initializations, ids.length, 'bütün V başlatımı');
  equal(state.components, parts(ids, edges), 'orman her giriş bileşenini gerer; izole düğümler korunur');
  equal(trace.result, { connected: state.components.length === 1, componentCount: state.components.length, components: state.components, selected: state.selected, rejected: state.rejected, total: state.total }, 'sonuç tam orman');
  if (optimum !== undefined) equal(state.total, optimum, 'tüm altkümelerden bağımsız minimum maliyet');
  equal(model.validateForest(vertices, triples, state.selected.map(edge => edge.id)), { valid: true, reason: 'valid', total: state.total, violatingEdge: null }, 'modelin ormanı validator tarafından kabul edilir');
  return trace;
}
function graphCase(vertices, triples, order, optimum, label) {
  const before = copy({ vertices, triples }); const trace = audit(model.traceKruskal(vertices, triples, order === undefined ? undefined : { tieOrder: order }), vertices, triples, order || 'ascending', optimum, label); equal({ vertices, triples }, before, 'girdiler değişmez'); return trace;
}
function validatorCase(vertices, triples, candidate, optimum, label) {
  context = label; report.cases += 1;
  const ids = vertices.slice().sort((a, b) => a - b), edges = canonical(triples), chosen = candidate.selected.map(edge => edge.id), result = model.validateForest(vertices, triples, chosen);
  const expectedValid = candidate.forest && candidate.total === optimum;
  equal(result.valid, expectedValid, 'tüm altkümelerden minimum orman oracle’ı'); equal(result.total, candidate.total, 'ret nedeninden bağımsız seçili toplam');
  const reason = candidate.cycle ? 'cycle' : !candidate.spanning ? 'not-spanning' : candidate.total !== optimum ? 'not-minimum' : 'valid'; equal(result.reason, reason, 'bağımsız ret nedeni önceliği');
  let violation = null;
  if (reason === 'cycle') {
    const prefix = []; for (const edge of candidate.selected) { if (pathOracle(ids, prefix, edge.u, edge.v)) { violation = edge.id; break; } prefix.push(edge); }
  } else if (reason === 'not-spanning') {
    const labels = labelsFor(candidate.groups); violation = edges.find(edge => labels[edge.u] !== labels[edge.v]).id;
  } else if (reason === 'not-minimum') {
    const set = new Set(chosen); violation = edges.find(edge => !set.has(edge.id) && Math.max(...pathOracle(ids, candidate.selected, edge.u, edge.v).edges.map(item => item.weight)) > edge.weight).id;
  }
  equal(result.violatingEdge, violation, 'ilk geçerli çevrim/eksik bağ/daha ucuz değişim tanığı');
  return result;
}
function throws(fn, label) { context = label; report.cases += 1; let thrown = null; try { fn(); } catch (error) { thrown = error; } check(thrown instanceof TypeError || thrown instanceof RangeError, 'hatalı graf/seçenek açık hata üretir'); }
const vertices = [4, 7, 11, 18, 20, 24, 26, 31], triples = [[7, 4, 1], [18, 7, 2], [7, 11, 2], [4, 11, 2], [20, 31, 2], [18, 24, 3], [24, 11, 3], [24, 20, 4], [31, 26, 4], [11, 31, 5]];
try {
  section('Yedi ders örneği, iki alıştırma ve farklı eşitlik ormanları', () => {
    const main = graphCase(vertices, triples, undefined, 18, 'ana maliyet ağı');
    equal(main.sortedEdges.map(edge => edge.id), ['4-7', '4-11', '7-11', '7-18', '20-31', '11-24', '18-24', '20-24', '26-31', '11-31'], 'ana artan kenar sırası'); equal(main.counts, { initializations: 8, edgeChecks: 10, merges: 7, rejections: 3, labelScans: 56 }, 'ana8/10/7/3/56'); equal(main.steps.length, 22, 'ana22olay');
    const reverse = graphCase(vertices, triples, 'descending', 18, 'ters eşit maliyet uçları'); check(JSON.stringify(reverse.result.selected.map(e => e.id)) !== JSON.stringify(main.result.selected.map(e => e.id)), 'aynı minimumda farklı kenarlar olabilir');
    equal(model.validateForest(vertices, triples, reverse.result.selected.map(edge => edge.id).reverse()), { valid: true, reason: 'valid', total: 18, violatingEdge: null }, 'kenar listesi sırası zorunlu değil');
    const isolated = triples.filter(edge => !edge.includes(26)); const isolatedTrace = graphCase(vertices, isolated, undefined, 14, '26 izole'); equal(isolatedTrace.result.components, [[4, 7, 11, 18, 20, 24, 31], [26]], 'izole düğüm ormanda korunur');
    const split = triples.filter(([a, b]) => !((a === 24 && b === 20) || (a === 11 && b === 31))), splitTrace = graphCase(vertices, split, undefined, 14, 'iki kenarlı bileşen'); equal(splitTrace.result.components, [[4, 7, 11, 18, 24], [20, 26, 31]], 'iki gerçek bileşen');
    const single = graphCase([18], [], undefined, 0, 'tek düğüm'); equal(single.result.connected, true, 'tek düğüm bağlı ve boş ağaç'); const emptyEdges = graphCase(vertices, [], undefined, 0, 'kenarsız bütün düğümler'); equal(emptyEdges.result.componentCount, 8, 'kenarsız8bileşen');
    graphCase(vertices, triples.map(edge => edge[0] === 7 && edge[1] === 4 ? [7, 4, 0] : edge), undefined, 17, 'sıfır maliyet');
    const guided = main.steps.find(step => step.type === 'reject' && step.edge.id === '7-11'); equal([guided.state.components.length, guided.state.total], [6, 3], 'rehberli sonraki7-11ret,6bileşen,toplam3'); equal(guided.state.cycle, [7, 4, 11, 7], 'rehberli ret tanığı');
    const independent = graphCase([4, 7, 18, 20, 24, 26], [[18, 7, 1], [7, 24, 2], [18, 24, 3], [24, 26, 4], [26, 4, 5], [4, 18, 6]], undefined, 12, 'bağımsızV6'); equal(independent.result.componentCount, 2, 'bağımsız2bileşen'); equal(independent.counts, { initializations: 6, edgeChecks: 6, merges: 4, rejections: 2, labelScans: 24 }, 'bağımsız6/6/4/2/24'); equal(independent.steps.filter(step => step.type === 'reject').map(step => step.cycle), [[18, 7, 24, 18], [4, 26, 24, 7, 18, 4]], 'bağımsız tanıklar');
    const optimumSets = enumerate(vertices, triples).candidates.filter(candidate => candidate.forest && candidate.total === 18); report.mainMinimumForestCount = optimumSets.length; check(optimumSets.length > 1, 'ana ağda birçok minimum orman var'); for (const candidate of optimumSets) validatorCase(vertices, triples, candidate, 18, 'ana alternatif minimum');
  });
  section('Dörde kadar bütün absent/0/1/2 graflar, iki tie sırası ve bütün kenar altkümeleri', () => {
    for (let n = 1; n <= 4; n += 1) {
      const ids = Array.from({ length: n }, (_, i) => i), pairs = []; for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) pairs.push([a, b]);
      for (let code = 0; code < 4 ** pairs.length; code += 1) {
        let rest = code; const input = []; pairs.forEach(([a, b]) => { const state = rest % 4; rest = Math.floor(rest / 4); if (state) input.push([a, b, state - 1]); });
        const all = enumerate(ids, input);
        graphCase(ids, input, 'ascending', all.optimum, 'tam n' + n + '/g' + code + '/asc'); graphCase(ids, input, 'descending', all.optimum, 'tam n' + n + '/g' + code + '/desc');
        for (const candidate of all.candidates) validatorCase(ids, input, candidate, all.optimum, 'altküme n' + n + '/g' + code);
      }
    }
  });
  section('Rastgele altküme oracle’ı, güvenli sınırlar ve32düğüm', () => {
    let seed = 0x10c01234; function random(limit) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % limit; }
    for (let test = 0; test < 100; test += 1) {
      const n = 1 + random(7), ids = Array.from({ length: n }, (_, i) => i * 13), input = [];
      for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) if (input.length < 10 && random(3) === 0) input.push([ids[a], ids[b], random(8)]);
      const all = enumerate(ids, input), trace = graphCase(ids, input, random(2) ? 'ascending' : 'descending', all.optimum, 'rastgele' + test);
      const changed = model.traceKruskal(ids.slice().reverse(), input.slice().reverse().map(([a, b, w]) => [b, a, w]), { tieOrder: trace.tieOrder }); equal(changed.steps, trace.steps, 'giriş kenar sırası/ucunu ters yazmak kanonik yürütümü değiştirmez'); equal(changed.result, trace.result, 'kanonik sonuç aynı');
      for (const candidate of all.candidates) validatorCase(ids, input, candidate, all.optimum, 'rastgele altküme' + test);
    }
    const ids = Array.from({ length: 32 }, (_, i) => i), chain = ids.slice(1).map((id, i) => [i, id, 1000000]); const large = graphCase(ids, chain, undefined, 31000000, '32düğüm/maksimum maliyet'); equal(large.counts.labelScans, 992, '31kabul×32satır');
    const clique = []; for (let a = 0; a < 32; a += 1) for (let b = a + 1; b < 32; b += 1) clique.push([a, b, 0]); const dense = graphCase(ids, clique, undefined, 0, '32düğüm sıfır maliyetli tamgraf'); equal(dense.counts.edgeChecks, 496, 'ağaç tamamlandıktan sonra da bütün496kenar'); equal(dense.counts.rejections, 465, 'tamgrafta465ret');
    graphCase([0, Number.MAX_SAFE_INTEGER, 4], [[0, Number.MAX_SAFE_INTEGER, 0], [Number.MAX_SAFE_INTEGER, 4, 1000000]], undefined, 1000000, 'sıfırID ve güvenliID sınırları');
  });
  section('Geçersiz girdiler ve validator nedenleri', () => {
    for (const bad of [undefined, null, {}, '', [], [1, 1], [-1, 1], [0, 1.5], [0, Infinity], [0, NaN], [0, Number.MAX_SAFE_INTEGER + 1], Array(2), Array.from({ length: 33 }, (_, i) => i)]) throws(() => model.traceKruskal(bad, []), 'hatalı düğümler');
    for (const bad of [null, {}, '', [null], [[]], [[0, 1]], [[0, 1, 2, 3]], [[0, 0, 1]], [[0, 4, 1]], [[0, -1, 1]], [[0, 1.5, 1]], [[0, 1, -1]], [[0, 1, 1.5]], [[0, 1, NaN]], [[0, 1, Infinity]], [[0, 1, 1000001]], [[0, 1, '1']], Array(1), [[0, 1, 1], [0, 1, 2]], [[0, 1, 1], [1, 0, 1]]]) throws(() => model.traceKruskal([0, 1, 2, 3], bad), 'hatalı kenar/maliyet');
    for (const options of [null, [], '', { tieOrder: null }, { tieOrder: 'random' }]) throws(() => model.traceKruskal([0, 1], [], options), 'hatalı tie seçeneği');
    for (const choice of [null, undefined, '', {}, [1], ['4-7', '4-7'], ['7-4'], ['4-99'], Array(1)]) { context = 'hatalı öğrenci kenar listesi'; report.cases += 1; equal(model.validateForest(vertices, triples, choice), { valid: false, reason: 'not-edge-set', total: null, violatingEdge: null }, 'not-edge-set sözleşmesi'); }
    const triangle = [[0, 1, 1], [1, 2, 2], [0, 2, 3]];
    equal(model.validateForest([0, 1, 2], triangle, ['0-1', '0-2']), { valid: false, reason: 'not-minimum', total: 4, violatingEdge: '1-2' }, 'daha ucuz değişim kenarı');
    equal(model.validateForest([0, 1, 2], triangle, ['0-1', '1-2', '0-2']), { valid: false, reason: 'cycle', total: 6, violatingEdge: '0-2' }, 'çevrim ilkret nedeni');
    equal(model.validateForest([0, 1, 2], triangle, []), { valid: false, reason: 'not-spanning', total: 0, violatingEdge: '0-1' }, 'eksik germe');
    equal(model.validateForest([0, 1], [], []), { valid: true, reason: 'valid', total: 0, violatingEdge: null }, 'izole düğümler için boş orman geçerli');
    throws(() => model.validateForest([], [], []), 'validator boş graf'); throws(() => model.validateForest([0, 1], [[0, 5, 1]], []), 'validator bilinmeyen uç');
  });
  section('Saflık, dondurulmuş girdiler, snapshot bağımsızlığı ve export', () => {
    const frozenV = freeze(vertices.slice()), frozenE = freeze(copy(triples)), options = freeze({ tieOrder: 'ascending' }); const trace = graphCase(frozenV, frozenE, 'ascending', 18, 'dondurulmuş graf'), saved = copy(trace);
    const separate = model.traceKruskal(frozenV, frozenE, options); equal(separate, saved, 'dondurulmuş seçenek nesnesi');
    trace.steps[1].state.rows[0].component = 999; trace.steps[1].state.activeEdge.weight = 999; equal(trace.initialState, saved.initialState, 'adım ilk gösterimi değiştirmez'); equal(trace.steps.slice(2), saved.steps.slice(2), 'snapshotlar bağımsız'); equal(trace.result, saved.result, 'adım sonucu değiştirmez');
    trace.edges[0].weight = 999; trace.sortedEdges[0].weight = 888; trace.result.selected[0].weight = 777; equal(trace.steps.at(-1), saved.steps.at(-1), 'kanonik/sonuç kenarı snapshotla ortak değil'); equal(frozenE, triples, 'girdi korunur'); equal(model.traceKruskal(frozenV, frozenE), saved, 'çağrılar belirlenebilir ve bağımsız');
    const rejection = model.traceKruskal(vertices, triples).steps.find(step => step.type === 'reject'); rejection.cycle[0] = 999; check(rejection.state.cycle[0] !== 999, 'event ve state çevrim tanıkları bağımsız');
    const sandbox = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), sandbox, { filename: 'w10/model.js' }); context = 'tarayıcı export'; report.cases += 1;
    equal(Object.keys(sandbox.FreshWeek10).sort(), ['traceKruskal', 'validateForest'], 'global API'); equal(Object.keys(model).sort(), ['traceKruskal', 'validateForest'], 'CommonJS API'); equal(sandbox.FreshWeek10.traceKruskal(vertices, triples), saved, 'tarayıcı ve CommonJS aynı trace'); equal(sandbox.FreshWeek10.validateForest(vertices, triples, saved.result.selected.map(edge => edge.id)), { valid: true, reason: 'valid', total: 18, violatingEdge: null }, 'tarayıcı validator');
  });
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = { message: error.message, detail: error.detail, stack: error.stack }; process.exitCode = 1; }
report.milliseconds = Date.now() - started;
const reportFlag = process.argv.indexOf('--report'); if (reportFlag >= 0) { if (!process.argv[reportFlag + 1]) throw new Error('--report için dosya yolu gerekir.'); const reportPath = path.resolve(process.argv[reportFlag + 1]); fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify({ status: report.status, checks: report.checks, cases: report.cases, milliseconds: report.milliseconds, mainMinimumForestCount: report.mainMinimumForestCount, failure: report.failure?.message }));
