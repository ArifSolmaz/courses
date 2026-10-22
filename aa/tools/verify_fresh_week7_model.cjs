#!/usr/bin/env node
'use strict';

// Independent numerical and trace-contract checks for the fresh Week 7 lesson.
// The ordering oracle uses the platform sort plus original-position tie breaking;
// it does not call or reimplement the model's recursive merging routine.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../w7/model.js');
const model = require(modelPath);
const started = Date.now();
const report = {
  lesson: 'Sıfırdan Hafta 7 — özyineleme, birleştirme ve birleştirmeli sıralama',
  status: 'running', checks: 0, cases: 0, sections: [],
  contract: {
    comparisons: 'Yalnız iki etkin baş kaydın anahtar karşılaştırması; eşitlikte soldaki seçilir.',
    placements: 'Her birleştirme çıktısına bir kayıt ekleme; kalanları aktarma dahil, fiziksel yazma sayısı değil.',
    calls: 'Özyinelemeli sıralama çağrıları; tek başına birleştirme için sıfır.',
    ranges: 'Sıfır tabanlı, sonu dışlayan [start,end) aralıkları.',
    oracle: 'Anahtar ve özgün giriş konumuna göre bağımsız kararlı sıralama.'
  },
  modelSha256: crypto.createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex')
};
let context = '';
function check(value, message, detail) {
  report.checks += 1;
  if (!value) {
    const error = new Error(context + ': ' + message);
    if (detail !== undefined) error.detail = detail;
    throw error;
  }
}
function equal(actual, expected, message) {
  check(JSON.stringify(actual) === JSON.stringify(expected), message, { actual, expected });
}
function section(name, run) {
  const before = { checks: report.checks, cases: report.cases, time: Date.now() };
  run();
  report.sections.push({ name, checks: report.checks - before.checks, cases: report.cases - before.cases, milliseconds: Date.now() - before.time });
}
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function rec(keys, prefix = 'T') { return keys.map((key, i) => ({ key, value: 'değer-' + (i % 3), tag: prefix + i })); }
function oracle(records) {
  return records.map((record, index) => ({ record, index }))
    .sort((a, b) => a.record.key - b.record.key || a.index - b.index)
    .map(item => copy(item.record));
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); }
  return value;
}
function dimensions(n) {
  const levels = n > 1 ? Math.ceil(Math.log2(n)) : 0;
  return {
    calls: n ? 2 * n - 1 : 1, bases: n || 1, merges: Math.max(0, n - 1), depth: levels,
    placements: n ? n * (levels + 1) - 2 ** levels : 0,
    comparisonBound: n ? n * levels - 2 ** levels + 1 : 0
  };
}

// Build only the recursion's shape, ranges and legal event schedule. No key
// comparisons are used here. Sorted outputs come from the independent oracle.
function expectedSchedule(input, operation, standaloneLeft, standaloneRight) {
  const events = [], stack = [], completed = [], nodes = [];
  function frame(node) { return { ...node, records: copy(input.slice(node.start, node.end)) }; }
  function add(type, node, detail = {}) {
    events.push({ type, node, ...detail, stack: copy(stack), completed: copy(completed) });
  }
  function finish(node, base) {
    stack.pop();
    completed.push({ ...node, base, result: oracle(input.slice(node.start, node.end)) });
  }
  function merge(node, left, right) {
    if (node.end === node.start) finish(node, false);
    add('merge-start', node, { left: copy(left), right: copy(right), returned: node.end === node.start });
    for (let i = 0; i < node.end - node.start; i += 1) {
      if (i === node.end - node.start - 1) finish(node, false);
      add('take', node, { returned: i === node.end - node.start - 1 });
    }
  }
  function visit(start, end, depth, nodeId) {
    const node = { nodeId, depth, start, end }; nodes.push(node); stack.push(frame(node));
    if (end - start <= 1) {
      finish(node, true); add('base', node); return;
    }
    const mid = start + Math.floor((end - start) / 2);
    add('split', node, { mid });
    visit(start, mid, depth + 1, nodeId + 'L');
    visit(mid, end, depth + 1, nodeId + 'R');
    merge(node, oracle(input.slice(start, mid)), oracle(input.slice(mid, end)));
  }
  if (operation === 'sort') visit(0, input.length, 0, 'R');
  else {
    const node = { nodeId: 'M', depth: 0, start: 0, end: input.length };
    nodes.push(node); stack.push(frame(node)); merge(node, standaloneLeft, standaloneRight);
  }
  return { events, nodes };
}

function audit(trace, input, operation, left, right, label) {
  context = label; report.cases += 1;
  const expected = expectedSchedule(input, operation, left, right);
  const zero = { comparisons: 0, placements: 0, calls: 0, baseCalls: 0 };
  equal(trace.operation, operation, 'işlem türü');
  equal(trace.initial, input, 'başlangıç kayıtları');
  equal(trace.result, oracle(input), 'kararlı sonuç ve kayıt kimlikleri');
  equal(trace.initialState.stack, [], 'başlangıç yığını');
  equal(trace.initialState.completed, [], 'başlangıçta tamamlanan parça yok');
  equal(trace.initialState.merge, operation === 'sort' ? null : { nodeId: 'M', left, right, leftIndex: 0, rightIndex: 0, out: [] }, 'başlangıç birleştirmesi');
  equal(trace.steps.length, expected.events.length, 'yalnız açılmış işlemler için olay sayısı');
  const totals = { ...zero }, stats = { maxDepth: 0, merges: 0 }, levelPlacements = new Map(), recordPlacements = new Map();
  let currentMerge = null;
  const nodeComp = new Map(), nodePlace = new Map();
  trace.steps.forEach((step, i) => {
    const event = expected.events[i], node = event.node;
    context = label + ' / adım ' + (i + 1);
    equal(step.step, i + 1, 'bir tabanlı adım numarası');
    equal(step.type, event.type, 'çağrı/birleştirme olay sırası');
    for (const key of ['nodeId', 'depth', 'start', 'end']) equal(step[key], node[key], key + ' doğru');
    if (step.type === 'split' || step.type === 'base') {
      totals.calls += 1; stats.maxDepth = Math.max(stats.maxDepth, node.depth); currentMerge = null;
      if (step.type === 'base') {
        totals.baseCalls += 1;
        equal(step.records, input.slice(node.start, node.end), 'taban girdisi');
        equal(step.result, input.slice(node.start, node.end), 'taban sonucu');
        check(step.returned === true, 'taban hemen döner');
      } else {
        equal(step.mid, event.mid, 'tek sayıda floor orta');
        equal(step.left, input.slice(node.start, event.mid), 'sol özgün parça');
        equal(step.right, input.slice(event.mid, node.end), 'sağ özgün parça');
      }
    }
    if (step.type === 'merge-start') {
      stats.merges += 1;
      equal(step.left, event.left, 'sol parça gerçekten sıralı');
      equal(step.right, event.right, 'sağ parça gerçekten sıralı');
      currentMerge = { nodeId: node.nodeId, left: copy(event.left), right: copy(event.right), leftIndex: 0, rightIndex: 0, out: [] };
      equal(step.returned, event.returned, 'boş birleştirme tamamlanır');
    }
    if (step.type === 'take') {
      check(currentMerge && currentMerge.nodeId === node.nodeId, 'etkin birleştirme gerekir');
      const lh = currentMerge.left[currentMerge.leftIndex], rh = currentMerge.right[currentMerge.rightIndex];
      const compared = Boolean(lh && rh);
      const comparison = compared ? Math.sign(lh.key - rh.key) : null;
      const side = lh && (!rh || lh.key <= rh.key) ? 'left' : 'right';
      equal(step.compared, compared, 'yalnız iki baş varken karşılaştırma');
      equal(step.comparison, comparison, 'üç yönlü karşılaştırma sonucu');
      equal(step.heads, compared ? { left: lh, right: rh } : null, 'karşılaştırılan yalnız etkin başlar');
      equal(step.tail, !compared, 'kalanları aktarmada karşılaştırma yok');
      equal(step.side, side, 'en küçük baş ve eşitlikte soldaki');
      equal(step.record, side === 'left' ? lh : rh, 'tam kayıt ve kimliği taşınır');
      currentMerge[side + 'Index'] += 1; currentMerge.out.push(copy(step.record));
      equal(currentMerge.out, oracle(input.slice(node.start, node.end)).slice(0, currentMerge.out.length), 'çıktı henüz açılan kararlı önek');
      totals.comparisons += Number(compared); totals.placements += 1;
      nodeComp.set(node.nodeId, (nodeComp.get(node.nodeId) || 0) + Number(compared));
      nodePlace.set(node.nodeId, (nodePlace.get(node.nodeId) || 0) + 1);
      levelPlacements.set(node.depth, (levelPlacements.get(node.depth) || 0) + 1);
      recordPlacements.set(step.record.tag, (recordPlacements.get(step.record.tag) || 0) + 1);
      equal(step.returned, event.returned, 'yalnız son yerleştirmede dönüş');
    }
    equal(step.counts, totals, 'birimler ayrı ve yalnız açılmış olaylar sayılır');
    equal(step.stats, stats, 'açılmış çağrı derinliği ve birleştirme sayısı');
    equal(step.state.merge, currentMerge, 'tam sol/sağ indis ve çıktı snapshotı');
    equal(step.state.stack, event.stack, 'gerçek etkin çağrı yığını');
    equal(step.state.completed, event.completed, 'yalnız dönmüş parçalar ve doğru sonuçlar');
  });
  context = label;
  equal(trace.counts, totals, 'son sayaçlar'); equal(trace.stats, stats, 'son istatistikler');
  equal(trace.steps.at(-1).state.stack, [], 'son yığın boş');
  if (operation === 'sort') {
    const d = dimensions(input.length);
    equal(totals.calls, d.calls, 'bağımsız 2n−1 çağrı formülü');
    equal(totals.baseCalls, d.bases, 'yaprak/taban sayısı');
    equal(stats.merges, d.merges, 'n−1 birleştirme'); equal(stats.maxDepth, d.depth, 'ceil(log2 n) derinlik');
    equal(totals.placements, d.placements, 'dengeli ağacın bağımsız yerleştirme formülü');
    check(totals.comparisons <= d.comparisonBound, 'birleştirmeli sıralama karşılaştırma üst sınırı');
    for (const node of expected.nodes) {
      const n = node.end - node.start;
      if (n > 1) {
        equal(nodePlace.get(node.nodeId), n, 'her iç parça tüm kayıtlarını bir kez yerleştirir');
        check((nodeComp.get(node.nodeId) || 0) <= n - 1, 'birleştirmede en çok a+b−1 karşılaştırma');
      } else if (n === 1) equal(recordPlacements.get(input[node.start].tag) || 0, node.depth, 'kayıt yalnız atalarının birleştirmelerinde taşınır');
    }
    for (const [level, count] of levelPlacements) check(level < d.depth && count <= input.length, 'her iş düzeyinde en çok n yerleştirme');
  } else {
    equal(totals.calls, 0, 'birleştirme özyinelemeli sort çağrısı saymaz');
    equal(totals.baseCalls, 0, 'birleştirme sort tabanı saymaz');
    equal(stats.merges, 1, 'birleştirme bir işlemdir'); equal(totals.placements, input.length, 'birleştirme her kaydı bir kez taşır');
    check(totals.comparisons <= Math.max(0, input.length - 1), 'birleştirme karşılaştırma sınırı');
  }
  return trace;
}
function sortCase(records, label) {
  const before = copy(records); const trace = audit(model.traceSort(records), records, 'sort', null, null, label);
  equal(records, before, 'sort girdi dizisini değiştirmez'); return trace;
}
function mergeCase(left, right, label) {
  const before = copy([left, right]); const trace = audit(model.traceMerge(left, right), left.concat(right), 'merge', left, right, label);
  equal([left, right], before, 'merge girdi dizilerini değiştirmez'); return trace;
}
function throws(fn, label) {
  context = label; report.cases += 1; let thrown = null;
  try { fn(); } catch (error) { thrown = error; }
  check(thrown instanceof TypeError || thrown instanceof RangeError, 'geçersiz girdi açık hata üretir');
}

try {
  section('Ders örnekleri, ölçü birimleri ve kesin sonuçlar', () => {
    const keys = [18, 7, 24, 4, 11, 20, 31, 26], values = ['pompa', 'sera', 'depo', 'çatı', 'kuyu', 'bahçe', 'kapı', 'oda'];
    const main = keys.map((key, i) => ({ key, value: values[i], tag: String.fromCharCode(65 + i) }));
    const full = sortCase(main, 'ana sekiz kayıt');
    equal(full.counts, { comparisons: 15, placements: 24, calls: 15, baseCalls: 8 }, 'ana sayaçlar C15/P24');
    equal(full.stats, { maxDepth: 3, merges: 7 }, 'ana üç düzey'); equal(full.steps.length, 46, 'ana olay sayısı');
    const small = sortCase(main.slice(0, 4), 'varsayılan dört kayıt');
    equal(small.counts, { comparisons: 5, placements: 8, calls: 7, baseCalls: 4 }, 'küçük C5/P8'); equal(small.steps.length, 18, 'küçük olay sayısı');
    const odd = sortCase(main.slice(0, 5), 'tek uzunluk beş'); equal([odd.counts.comparisons, odd.counts.placements], [8, 12], 'beş kayıt C8/P12');
    sortCase(oracle(main), 'önceden sıralı sekiz'); sortCase(oracle(main).reverse(), 'ters sıralı sekiz');
    sortCase(main.slice(0, 1), 'tek kayıt'); sortCase([], 'boş rehber');
    const merge = mergeCase([main[1], main[0]], [main[3], main[2]], 'iki sıralı parça');
    equal([merge.counts.comparisons, merge.counts.placements], [3, 4], 'C3/P4');
    const byKey = new Map(main.map(r => [r.key, r]));
    const guided = mergeCase([4, 7, 18, 24].map(k => byKey.get(k)), [11, 20, 26, 31].map(k => byKey.get(k)), 'rehberli birleştirme');
    equal([guided.counts.comparisons, guided.counts.placements], [6, 8], 'rehberli C6/P8');
    const independent = sortCase([20, 4, 31, 7].map(k => byKey.get(k)), 'bağımsız alıştırma');
    equal([independent.counts.comparisons, independent.counts.placements, independent.stats.maxDepth, independent.result.length], [5, 8, 2, 4], 'bağımsız C5/P8/düzey2/n4');
  });
  section('Tüm küçük dizilerde kararlı sıralama ve her adımın durumu', () => {
    // All 3^n key sequences for n=0..6, with unique identities and repeated values.
    for (let n = 0; n <= 6; n += 1) {
      for (let code = 0; code < 3 ** n; code += 1) {
        let rest = code; const keys = Array.from({ length: n }, () => { const key = rest % 3; rest = Math.floor(rest / 3); return key; });
        sortCase(rec(keys), 'küçük tam tarama n' + n + '/' + code);
      }
    }
  });
  section('İki sıralı parçanın tam taraması, eşit başlar ve boş parçalar', () => {
    const sequences = [[]];
    for (let n = 1; n <= 4; n += 1) {
      for (let code = 0; code < 3 ** n; code += 1) {
        let rest = code; const keys = Array.from({ length: n }, () => { const key = rest % 3; rest = Math.floor(rest / 3); return key; });
        if (keys.every((key, i) => !i || keys[i - 1] <= key)) sequences.push(keys);
      }
    }
    sequences.forEach((l, li) => sequences.forEach((r, ri) => mergeCase(rec(l, 'L'), rec(r, 'R'), 'parçalar ' + li + '/' + ri)));
  });
  section('Belirlenebilir rastgele ve en büyük girdiler', () => {
    let seed = 0x7a771234;
    function random(limit) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % limit; }
    for (let i = 0; i < 100; i += 1) {
      const n = random(33), records = rec(Array.from({ length: n }, () => random(20)));
      sortCase(records, 'rastgele sort ' + i);
      const cut = random(n + 1), left = oracle(records.slice(0, cut)), right = oracle(records.slice(cut));
      mergeCase(left, right, 'rastgele merge ' + i);
    }
    sortCase(rec(Array.from({ length: 32 }, (_, i) => 31 - i)), '32 ters kayıt');
    sortCase(rec(Array(32).fill(7)), '32 eşit anahtar ve kararlı etiket');
    sortCase(rec([0, Number.MAX_SAFE_INTEGER, 1, Number.MAX_SAFE_INTEGER - 1]), 'güvenli tam sayı sınırları');
    const sameValue = rec([4, 1, 4, 1]).map(r => ({ ...r, value: '' })); sortCase(sameValue, 'boş ve yinelenen değer metinleri');
  });
  section('Büyüme ifadesi ve bağımsız n log2 n eşitliği', () => {
    for (let exponent = 0; exponent <= 10; exponent += 1) {
      const n = 2 ** exponent; context = 'growth n' + n; report.cases += 1;
      equal(model.growth(n), { n, levels: exponent, placements: n * exponent, quadratic: n * n }, 'ikinin kuvvetinde büyüme');
      if (n <= 32) {
        const trace = sortCase(rec(Array.from({ length: n }, (_, i) => n - i)), 'growth gerçek sort n' + n);
        equal(trace.counts.placements, model.growth(n).placements, 'sayısal büyüme gerçek yerleştirmeyle eşit');
      }
    }
    [undefined, null, '8', 0, -2, 3, 6, 1.5, NaN, Infinity, 2048, Number.MAX_SAFE_INTEGER].forEach(v => throws(() => model.growth(v), 'growth geçersiz ' + String(v)));
  });
  section('Girdi doğrulama ve sıralı parça önkoşulu', () => {
    const valid = { key: 1, value: 'sera', tag: 'A' };
    [null, undefined, {}, 'x', 5].forEach(v => throws(() => model.traceSort(v), 'dizi olmayan sort'));
    [null, undefined, 'x', {}, [], { ...valid, key: -1 }, { ...valid, key: 1.5 }, { ...valid, key: Infinity }, { ...valid, key: NaN }, { ...valid, key: Number.MAX_SAFE_INTEGER + 1 }, { ...valid, value: 5 }, { ...valid, value: 'x'.repeat(201) }, { ...valid, tag: '' }, { ...valid, tag: ' ' }, { ...valid, tag: 'x'.repeat(25) }, { key: 1, value: 'x' }].forEach(v => throws(() => model.traceSort([v]), 'geçersiz kayıt'));
    throws(() => model.traceSort([valid, { ...valid, key: 2 }]), 'yinelenen kimlik');
    throws(() => model.traceSort(rec(Array.from({ length: 33 }, (_, i) => i))), '33 kayıt sınırı');
    throws(() => model.traceMerge(rec([2, 1], 'L'), rec([3], 'R')), 'sırasız sol parça');
    throws(() => model.traceMerge(rec([1], 'L'), rec([3, 2], 'R')), 'sırasız sağ parça');
    throws(() => model.traceMerge(rec(Array(17).fill(1), 'L'), rec(Array(16).fill(1), 'R')), 'toplam 33 kayıt sınırı');
    throws(() => model.traceMerge([valid], [valid]), 'parçalar arasında yinelenen kimlik');
    throws(() => model.traceMerge(null, []), 'sol dizi değil'); throws(() => model.traceMerge([], {}), 'sağ dizi değil');
    sortCase([{ key: 0, value: 'x'.repeat(200), tag: 'T'.repeat(24) }], 'kabul edilen metin sınırları');
  });
  section('Saflık, dondurulmuş girdiler ve snapshotların bağımsızlığı', () => {
    const input = freeze(rec([18, 7, 24, 4])); const trace = sortCase(input, 'dondurulmuş sort');
    const saved = copy(trace); trace.steps[0].state.stack[0].records[0].value = 'değişti';
    equal(trace.initial, saved.initial, 'snapshot değişimi başlangıcı etkilemez'); equal(trace.result, saved.result, 'snapshot değişimi sonucu etkilemez');
    equal(trace.steps.slice(1), saved.steps.slice(1), 'bir snapshot diğer adımlardan ayrı');
    trace.result[0].value = 'başka'; equal(trace.steps.at(-1).state.merge.out, saved.steps.at(-1).state.merge.out, 'sonuç son çıktıdan ayrı');
    equal(input, rec([18, 7, 24, 4]), 'dondurulmuş girdi korunur');
    const left = freeze(rec([1, 3], 'L')), right = freeze(rec([2, 4], 'R'));
    const merged = mergeCase(left, right, 'dondurulmuş merge'), mergedSaved = copy(merged);
    merged.initialState.merge.left[0].value = 'değişti';
    equal(merged.steps, mergedSaved.steps, 'ilk gösterim gelecek adımlarla ortak referans taşımaz'); equal(merged.result, mergedSaved.result, 'ilk gösterim sonuçla ortak referans taşımaz');
    const repeated = model.traceSort(input); equal(repeated, saved, 'ardışık çağrılar bağımsız ve belirlenebilir');
  });
  section('Tarayıcı globali ve CommonJS aynı genel API', () => {
    const sandbox = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), sandbox, { filename: 'w7/model.js' });
    context = 'tarayıcı export'; report.cases += 1;
    equal(Object.keys(sandbox.FreshWeek7).sort(), ['growth', 'traceMerge', 'traceSort'], 'global API yöntemleri');
    equal(Object.keys(model).sort(), ['growth', 'traceMerge', 'traceSort'], 'CommonJS API yöntemleri');
    const records = rec([3, 1, 2, 1]); equal(sandbox.FreshWeek7.traceSort(records), model.traceSort(records), 'tarayıcı ve CommonJS aynı trace');
    equal(sandbox.FreshWeek7.growth(8), model.growth(8), 'tarayıcı büyüme API');
  });
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = { message: error.message, detail: error.detail, stack: error.stack };
  process.exitCode = 1;
}
report.milliseconds = Date.now() - started;
const reportFlag = process.argv.indexOf('--report');
if (reportFlag >= 0) {
  if (!process.argv[reportFlag + 1]) throw new Error('--report için dosya yolu gerekir.');
  const reportPath = path.resolve(process.argv[reportFlag + 1]); fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ status: report.status, checks: report.checks, cases: report.cases, milliseconds: report.milliseconds, failure: report.failure?.message }));
