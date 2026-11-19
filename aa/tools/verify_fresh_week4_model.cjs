#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const modelPath = path.resolve(__dirname, '../w4/model.js');
const model = require(modelPath);
const reportIndex = process.argv.indexOf('--report');
const reportPath = reportIndex < 0 ? null : process.argv[reportIndex + 1];
let assertions = 0, accessCases = 0, insertCases = 0, policyCases = 0;
const checks = [];
function eq(actual, expected, message) { assert.deepEqual(actual, expected, message); assertions++; }
function ok(value, message) { assert.ok(value, message); assertions++; }
function rejects(call) { assert.throws(call); assertions++; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function walk(state) {
  const byId = new Map(state.nodes.map(node => [node.id, node]));
  const visited = new Set(), values = [], ids = [];
  let cursor = state.head;
  while (cursor !== null) {
    ok(byId.has(cursor), 'Her bağlı adres mevcut bir düğümü göstermeli.');
    ok(!visited.has(cursor), 'Bağlı zincir döngü oluşturmamalı.');
    visited.add(cursor); const node = byId.get(cursor);
    ok(node.nextSet, 'Ulaşılabilir düğümün sonraki bağı yazılmış olmalı.');
    ids.push(cursor); values.push(node.value); cursor = node.next;
  }
  return { ids, values };
}
function checkAccess(values, position, structure) {
  const before = values.slice(), result = model.traceAccess(values, position, structure);
  eq(values, before); eq(result.values, before); ok(result.values !== values);
  eq(result.value, values[position - 1]); eq(result.position, position); eq(result.structure, structure);
  eq(result.initial.read, null);
  const expectedCounts = structure === 'array'
    ? { indexReads: 1, linkFollows: 0, nodeValueReads: 0 }
    : { indexReads: 0, linkFollows: position - 1, nodeValueReads: 1 };
  eq(result.counts, expectedCounts);
  eq(result.steps.length, structure === 'array' ? 1 : position);
  for (let i = 0; i < result.steps.length; i++) {
    const step = result.steps[i]; eq(step.step, i + 1);
    ok(step.state !== result.initial);
    if (structure === 'array') {
      eq(step.op, 'index-read'); eq(step.position, position); eq(step.value, values[position - 1]);
      eq(step.state.slots, before); eq(step.counts, expectedCounts);
    } else {
      eq(walk(step.state).values, before, 'Erişim zincirin değerlerini değiştirmemeli.');
      eq(step.state.cursor, 'N' + Math.min(i + 2, position));
      if (i < position - 1) {
        eq(step.op, 'follow-link'); eq([step.from, step.to], [i + 1, i + 2]);
        eq([step.fromNode, step.toNode], ['N' + (i + 1), 'N' + (i + 2)]);
        eq(step.state.read, null); eq(step.counts, { indexReads: 0, linkFollows: i + 1, nodeValueReads: 0 });
      } else {
        eq(step.op, 'node-read'); eq(step.value, values[position - 1]); eq(step.counts, expectedCounts);
      }
    }
  }
  eq(result.steps.at(-1).state.read, { position, value: values[position - 1] });
  ok(!('total' in result.counts), 'Farklı birimler genel toplamda birleştirilmemeli.');
  accessCases++;
  return result;
}
function checkInsert(values, position, value, structure, predecessorKnown = false) {
  const before = values.slice(), options = { capacity: values.length + 1, predecessorKnown };
  const result = model.traceInsert(values, position, value, structure, options);
  const expected = before.slice(); expected.splice(position - 1, 0, value);
  eq(values, before); eq(result.values, before); ok(result.values !== values);
  eq(result.result, expected); eq(result.position, position); eq(result.value, value);
  eq(result.structure, structure); eq(result.predecessorKnown, predecessorKnown);
  const expectedCounts = structure === 'array'
    ? { valueShifts: before.length - position + 1, valueWrites: 1, linkFollows: 0, pointerWrites: 0 }
    : { valueShifts: 0, valueWrites: 0, linkFollows: predecessorKnown ? 0 : Math.max(0, position - 2), pointerWrites: 2 };
  eq(result.counts, expectedCounts);
  if (structure === 'array') {
    eq(result.capacity, values.length + 1); eq(result.initial.slots, before.concat([null]));
    eq(result.steps.length, before.length - position + 2);
    const slots = before.concat([null]);
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i]; eq(step.step, i + 1);
      if (i < before.length - position + 1) {
        const from = before.length - i; slots[from] = slots[from - 1];
        eq(step.op, 'shift'); eq([step.from, step.to], [from, from + 1]); eq(step.value, before[from - 1]);
        eq(step.counts, { valueShifts: i + 1, valueWrites: 0, linkFollows: 0, pointerWrites: 0 });
      } else {
        slots[position - 1] = value; eq(step.op, 'value-write'); eq(step.position, position); eq(step.value, value); eq(step.counts, expectedCounts);
      }
      eq(step.state, { slots: slots.slice(), capacity: before.length + 1 });
    }
    eq(result.steps.at(-1).state.slots, expected);
  } else {
    eq(result.capacity, null); eq(result.initial.head, values.length ? 'N1' : null);
    eq(walk(result.initial).values, before);
    const newInitial = result.initial.nodes.find(node => node.id === 'new');
    eq(newInitial, { id: 'new', value, next: null, nextSet: false }, 'Yeni next başlangıçta yazılmamış yer tutucudur.');
    eq(result.steps.length, expectedCounts.linkFollows + 2);
    eq(result.initial.cursor, position === 1 ? null : predecessorKnown ? 'N' + (position - 1) : 'N1');
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i]; eq(step.step, i + 1);
      if (i < expectedCounts.linkFollows) {
        eq(step.op, 'follow-link'); eq([step.from, step.to], [i + 1, i + 2]);
        eq(step.state.cursor, 'N' + (i + 2));
        eq(step.counts, { valueShifts: 0, valueWrites: 0, linkFollows: i + 1, pointerWrites: 0 });
        eq(walk(step.state).values, before);
      } else if (i === expectedCounts.linkFollows) {
        eq(step.op, 'pointer-write'); eq(step.field, 'new.next'); eq(step.node, 'new');
        eq(step.next, position <= values.length ? 'N' + position : null);
        eq(step.state.nodes.find(node => node.id === 'new').nextSet, true);
        eq(step.state.nodes.find(node => node.id === 'new').next, step.next);
        eq(walk(step.state).values, before, 'İlk referans yazımı yeni düğümü henüz baş zincire bağlamaz.');
        eq(step.counts, { valueShifts: 0, valueWrites: 0, linkFollows: expectedCounts.linkFollows, pointerWrites: 1 });
      } else {
        eq(step.op, 'pointer-write'); eq(step.field, position === 1 ? 'head' : 'N' + (position - 1) + '.next');
        eq(step.next, 'new'); eq(step.counts, expectedCounts);
        const chain = walk(step.state); eq(chain.values, expected);
        const expectedIds = before.map((_, j) => 'N' + (j + 1)); expectedIds.splice(position - 1, 0, 'new'); eq(chain.ids, expectedIds);
      }
    }
  }
  ok(!('total' in result.counts)); insertCases++;
  return result;
}
function checkPolicy(operations, policy) {
  const before = clone(operations), result = model.tracePolicy(operations, policy);
  eq(operations, before); eq(result.policy, policy); eq(result.steps.length, operations.length);
  const active = new Map(), output = [];
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i], step = result.steps[i];
    let item = null, empty = false;
    if (operation.type === 'put') {
      item = { token: operation.token, id: operation.id }; active.set(i, item);
    } else if (active.size) {
      const arrival = policy === 'fifo' ? Math.min(...active.keys()) : Math.max(...active.keys());
      item = active.get(arrival); active.delete(arrival); output.push(item);
    } else empty = true;
    eq(step.event, i + 1); eq(step.type, operation.type); eq(step.item, item); eq(step.empty, empty);
    eq(step.state, [...active.values()]); eq(step.removed, output);
    ok(!('counts' in step), 'FIFO/LIFO mantıksal sıraları maliyet ölçümü olarak sunulmamalı.');
  }
  eq(result.remaining, [...active.values()]); eq(result.removed, output); policyCases++;
  return result;
}

let report;
try {
  for (const n of [...Array.from({ length: 17 }, (_, i) => i), 32]) {
    const values = Array.from({ length: n }, (_, i) => 3 * i - 20);
    for (let position = 1; position <= n; position++) for (const structure of ['array', 'linked']) checkAccess(values, position, structure);
    for (let position = 1; position <= n + 1; position++) {
      checkInsert(values, position, 999, 'array');
      checkInsert(values, position, 999, 'linked');
      checkInsert(values, position, 999, 'linked', true);
    }
  }
  checks.push('Her yasal erişim ve ekleme konumu: boş, baş, orta, son; ayrı birimler ve her adımın durum/sayaç izi.');
  const reference = [4, 7, 11, 18, 24, 31, 42, 56];
  eq(checkAccess(reference, 7, 'array').counts, { indexReads: 1, linkFollows: 0, nodeValueReads: 0 });
  eq(checkAccess(reference, 7, 'linked').counts, { indexReads: 0, linkFollows: 6, nodeValueReads: 1 });
  const independent = [3, 8, 12, 17, 23];
  eq(checkAccess(independent, 4, 'linked').counts.linkFollows, 3);
  eq(checkAccess(independent, 4, 'array').counts.indexReads, 1);
  eq(checkInsert(independent, 3, 10, 'array').counts.valueShifts, 3);
  eq(checkInsert(independent, 3, 10, 'linked').counts, { valueShifts: 0, valueWrites: 0, linkFollows: 1, pointerWrites: 2 });
  const guided = [4, 7, 11, 18, 24, 31];
  eq(checkInsert(guided, 2, 6, 'array').counts.valueShifts, 5);
  eq(checkInsert(guided, 2, 6, 'linked').counts.linkFollows, 0);
  for (const structure of ['array', 'linked']) {
    eq(checkInsert([9, 2, 2], 2, 7, structure).result, [9, 7, 2, 2], 'Model verilen konuma ekler; sıralama veya tekilleştirme yapmaz.');
    checkAccess([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], 2, structure);
  }
  eq(model.traceInsert([], 1, 7, 'array', { capacity: Number.MAX_SAFE_INTEGER }).initial.slots, [null], 'Boş kapasite kadar bellek ayırmadan görünür önek gösterilir.');
  checks.push('Ana örnek, bağımsız [3,8,12,17,23]/k4/p3, rehberli n6/p2; sıralama yapılmaması ve yinelenen değerlerin korunması.');

  const preset = [
    { type: 'put', token: 'A', id: 24 }, { type: 'put', token: 'B', id: 4 }, { type: 'put', token: 'C', id: 18 },
    { type: 'take' }, { type: 'put', token: 'D', id: 11 }, { type: 'take' }
  ];
  const fifo = checkPolicy(preset, 'fifo'), lifo = checkPolicy(preset, 'lifo');
  eq(fifo.removed.map(item => item.id), [24, 4]); eq(fifo.remaining.map(item => item.id), [18, 11]);
  eq(lifo.removed.map(item => item.id), [18, 11]); eq(lifo.remaining.map(item => item.id), [24, 4]);
  for (let length = 0; length <= 9; length++) {
    for (let mask = 0; mask < 2 ** length; mask++) {
      const operations = Array.from({ length }, (_, i) => mask & (1 << i) ? { type: 'put', token: 'T' + i, id: i % 3 } : { type: 'take' });
      checkPolicy(operations, 'fifo'); checkPolicy(operations, 'lifo');
    }
  }
  const duplicateIds = [{ type: 'put', token: 'a', id: 24 }, { type: 'put', token: 'b', id: 24 }, { type: 'take' }, { type: 'take' }, { type: 'take' }];
  eq(checkPolicy(duplicateIds, 'fifo').removed.map(item => item.token), ['a', 'b']);
  eq(checkPolicy(duplicateIds, 'lifo').removed.map(item => item.token), ['b', 'a']);
  checkPolicy(Array.from({ length: 100 }, () => ({ type: 'take' })), 'fifo');
  checks.push('FIFO/LIFO için tüm kısa işlem dizileri bağımsız geliş-zamanı oracle ile denetlendi; aynı cihaz kimliğine sahip ayrı mesajlar ve boş çıkarma.');

  for (const values of [null, {}, '1,2', [1.5], [NaN], [Infinity], ['1'], [null], Array(2), [Number.MAX_SAFE_INTEGER + 1], Array.from({ length: 33 }, (_, i) => i)]) {
    rejects(() => model.traceAccess(values, 1)); rejects(() => model.traceInsert(values, 1, 1, 'array', { capacity: 40 }));
  }
  for (const position of [0, -1, 1.5, 3, NaN, Infinity, '1', null, undefined]) rejects(() => model.traceAccess([1, 2], position));
  rejects(() => model.traceAccess([], 1));
  for (const position of [0, -1, 1.5, 4, NaN, Infinity, '1', null, undefined]) rejects(() => model.traceInsert([1, 2], position, 3, 'linked'));
  for (const capacity of [undefined, null, 0, 2, 2.5, '3', Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) rejects(() => model.traceInsert([1, 2], 2, 3, 'array', { capacity }));
  for (const value of [NaN, Infinity, '3', null, 1.5, Number.MAX_SAFE_INTEGER + 1]) rejects(() => model.traceInsert([1, 2], 2, value, 'linked'));
  for (const options of [null, 3, 'x', [], { predecessorKnown: 'yes' }]) rejects(() => model.traceInsert([1, 2], 2, 3, 'linked', options));
  for (const structure of ['', null, 'list', 'Array', 1]) { rejects(() => model.traceAccess([1], 1, structure)); rejects(() => model.traceInsert([1], 1, 3, structure)); }
  for (const operations of [null, {}, ['take'], Array(1), [{ type: 'add' }], [{ type: 'put', token: '', id: 1 }], [{ type: 'put', token: 'x', id: Infinity }], [{ type: 'put', token: 'x', id: 1 }, { type: 'take' }, { type: 'put', token: 'x', id: 2 }], Array.from({ length: 101 }, () => ({ type: 'take' }))]) rejects(() => model.tracePolicy(operations));
  for (const policy of ['', null, 'FIFO', 1]) rejects(() => model.tracePolicy([], policy));
  checks.push('Geçersiz tür/sınır, yetersiz/belirtilmemiş kapasite, token tekrarı, delikli dizi ve güvenli tam sayı doğrulamaları.');

  const frozen = Object.freeze([1, 3, 5]);
  checkAccess(frozen, 3, 'linked'); checkInsert(frozen, 2, 2, 'array'); checkInsert(frozen, 2, 2, 'linked');
  const independentSnapshots = model.traceInsert([1, 3, 5], 2, 2, 'linked');
  const retainedInitial = clone(independentSnapshots.initial), retainedSecond = clone(independentSnapshots.steps[1]);
  independentSnapshots.steps[0].state.nodes[0].value = 999;
  independentSnapshots.steps[0].counts.pointerWrites = 999;
  eq(independentSnapshots.initial, retainedInitial); eq(independentSnapshots.steps[1], retainedSecond); eq(independentSnapshots.result, [1, 2, 3, 5]);
  const arraySnapshots = model.traceInsert([1, 3, 5], 1, 0, 'array', { capacity: 4 });
  arraySnapshots.steps[0].state.slots[0] = 999; eq(arraySnapshots.steps[1].state.slots[0], 1); eq(arraySnapshots.initial.slots[0], 1);
  const policySnapshots = model.tracePolicy(preset, 'fifo');
  policySnapshots.steps[0].state[0].id = 999; eq(policySnapshots.steps[1].state[0].id, 24); eq(preset[0].id, 24); eq(policySnapshots.removed[0].id, 24);
  const context = {}; vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), context, { filename: modelPath });
  ok(context.AAWeekFour); eq(context.AAWeekFour.traceAccess([1, 2], 2).value, 2);
  eq(context.AAWeekFour.traceInsert([1], 2, 3, 'linked').result.join(','), '1,3');
  checks.push('Girdi mutasyonu olmaması, dondurulmuş kaynaklar, bağımsız başlangıç/adım/sonuç snapshotları ve tarayıcı/CommonJS dışa aktarımları.');

  report = { status: 'passed', assertions, accessCases, insertCases, policyCases, checks, model_sha256: createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'), units: { access: ['indexReads', 'linkFollows', 'nodeValueReads'], insertion: ['valueShifts', 'valueWrites', 'linkFollows', 'pointerWrites'], policy: 'logical events only; no time/cost total' } };
} catch (error) {
  report = { status: 'failed', assertions, accessCases, insertCases, policyCases, checks, error: error.stack }; process.exitCode = 1;
}
if (reportPath) { fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n'); }
console.log(JSON.stringify(report, null, 2));
