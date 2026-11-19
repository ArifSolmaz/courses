/* Independent bounded numerical and CSV checks for the 6–8-student pilot.
 * Run: node aa/tools/verify_pilot_models.cjs [--report /outside/aa/result.json]
 * Hand-calculated paired cohorts, all 256 teacher missingness masks, an
 * independent CSV reader and mutation checks exercise the public contract.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modelPath = path.resolve(__dirname, '../bridge/capstone/pilot/model.js');
const M = require(modelPath), capstone = require('../bridge/capstone/model.js');
let assertions = 0;
const equal = (actual, expected, label) => { assert.deepStrictEqual(actual, expected, label); assertions++; };
const ok = (value, label) => { assert.ok(value, label); assertions++; };
const throws = (fn, type, label) => { assert.throws(fn, type, label); assertions++; };
const copy = value => structuredClone(value);
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function teacher(record, pre, post) {
  M.DIMENSIONS.forEach(({ id }, i) => {
    record.teacher[id].pre = pre[i]; record.teacher[id].post = post[i];
    record.teacher[id].evidencePre = pre[i] === null ? '' : 'İlk yanıttan somut kanıt ' + i;
    record.teacher[id].evidencePost = post[i] === null ? '' : 'Son yanıttan somut kanıt ' + i;
  });
  return record;
}
function metric(actual, expected, label) {
  equal(actual.n, expected[0], label + ' paired n');
  ['preMean', 'postMean', 'deltaMean'].forEach((field, i) => {
    if (expected[i + 1] === null) equal(actual[field], null, label + ' ' + field);
    else { ok(Math.abs(actual[field] - expected[i + 1]) < 1e-12, label + ' ' + field); }
  });
}
// A small CSV state machine handles quoted delimiters, quotes and newlines;
// it does not depend on the writer's escaping implementation.
function readCSV(source) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\r' && source[i + 1] === '\n' || char === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; if (char === '\r') i++;
    } else cell += char;
  }
  assert.equal(quoted, false, 'CSV must close quoted fields');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

equal(Object.keys(M).sort(), ['DIMENSIONS', 'IDS', 'RUBRICS', 'createRecord', 'summarize', 'toCSV', 'validateRecord'].sort(), 'Explicit pilot API');
equal(M.IDS, ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08'], 'Eight fixed anonymous slots');
equal(M.DIMENSIONS, capstone.DIMENSIONS, 'The original four difficulties are preserved');
for (const question of capstone.PHASES.pre.questions) equal(M.RUBRICS[question.id], question.rubric, 'Actual capstone rubric is reused');
const blanks = M.IDS.map(M.createRecord), blankSummary = M.summarize(blanks);
equal(blankSummary.activeCount, 0, 'Blank placeholders do not become participants');
equal(blankSummary.completeTeacherCount, 0, 'Blank is not a completed teacher score');
equal(blankSummary.invalid, [], 'An untouched slot is a valid empty draft');
for (const value of [...blankSummary.dimensions, ...Object.values(blankSummary.totals)]) metric(value, [0, null, null, null], 'No paired data');
equal(blankSummary.timing, {n: 0, mean: null, min: null, max: null, within25: 0, within30: 0}, 'No timing invented for blanks');
equal(blankSummary.rows.length, 8, 'Summary retains the fixed template slots');
blanks[0].teacher.code.pre = 2;
equal(blanks[1].teacher.code.pre, null, 'Fresh records do not share teacher objects');
throws(() => M.createRecord('P09'), RangeError, 'New slots cannot silently expand the eight-student pilot');

// Literal hand-calculated cohort: asymmetric missingness deliberately makes
// phase-only means different from the paired means that must be reported.
const records = M.IDS.map(M.createRecord);
teacher(records[0], [0, 1, 2, 0], [1, 1, 0, 2]);
Object.assign(records[0], {minutes: 24.5, choice: {pre: 1, post: 3}, self: {pre: 2, post: 6}});
teacher(records[1], [2, 2, 1, 1], [1, 0, 2, 1]);
Object.assign(records[1], {minutes: 30, choice: {pre: 4, post: 0}, self: {pre: 8, post: 7}});
teacher(records[2], [2, 1, null, 0], [null, 2, 0, 0]);
Object.assign(records[2], {minutes: 25.5, choice: {pre: 0, post: null}, self: {pre: null, post: 0}});
teacher(records[3], [2, 0, 0, 1], [null, 0, 1, 1]);
Object.assign(records[3], {minutes: 31, choice: {pre: null, post: 4}, self: {pre: 0, post: 4}});
teacher(records[5], [2, 2, 2, 2], [0, 0, 0, 0]);
Object.assign(records[5], {minutes: -1, choice: {pre: 0, post: 4}, self: {pre: 0, post: 8}});
Object.assign(records[6], {minutes: 0, notes: 'Yalnız süre gözlemi var.'});
teacher(records[7], [0, 0, 0, 0], [0, 0, 0, 0]);
Object.assign(records[7], {minutes: 25, choice: {pre: 0, post: 0}, self: {pre: 0, post: 0}});
const frozen = freeze(copy(records)), before = copy(frozen), summary = M.summarize(frozen);
equal(summary.activeCount, 7, 'Entered invalid slot remains visible, blank P05 stays out');
equal(summary.completeTeacherCount, 3, 'Only three valid all-eight teacher pairs are complete');
equal(summary.invalid.map(value => value.id), ['P06'], 'A single invalid field excludes the whole record');
metric(summary.totals.teacher, [3, 3, 8 / 3, -1 / 3], 'Teacher total');
metric(summary.totals.choice, [3, 5 / 3, 1, -2 / 3], 'Choice count');
metric(summary.totals.self, [4, 2.5, 4.25, 1.75], 'Self total');
const dimensionAnswers = [[3, 2 / 3, 2 / 3, 0, 1, 1, 1], [5, .8, .6, -.2, 1, 3, 1],
  [4, .75, .75, 0, 2, 1, 1], [5, .4, .8, .4, 1, 4, 0]];
summary.dimensions.forEach((dimension, i) => {
  metric(dimension, dimensionAnswers[i].slice(0, 4), 'Dimension ' + dimension.id);
  equal([dimension.increased, dimension.unchanged, dimension.decreased], dimensionAnswers[i].slice(4), 'Paired increase/unchanged/decrease counts');
});
equal(summary.timing, {n: 6, mean: 136 / 6, min: 0, max: 31, within25: 3, within30: 5}, 'Timing uses only active valid observations, including zero');
equal([summary.rows[3].teacherPre, summary.rows[3].teacherPost, summary.rows[3].teacherDelta], [3, null, null], 'A complete pre total cannot manufacture a post total');
equal([summary.rows[5].teacherPre, summary.rows[5].choiceDelta, summary.rows[5].minutes], [null, null, null], 'Invalid whole record has no derived row metrics');
equal(frozen, before, 'Summaries never mutate submitted records');
const reverse = M.summarize(copy(records).reverse());
equal(reverse.dimensions, summary.dimensions, 'Dimension summaries do not depend on input row order');
equal(reverse.totals, summary.totals, 'Paired total summaries do not depend on input row order');

// All 2^8 teacher missingness patterns. Enumerated observed field coordinates
// determine completion independently from the model's numeric normalization.
for (let mask = 0; mask < 256; mask++) {
  const record = M.createRecord('P01'), expectedPre = [], expectedPost = [];
  M.DIMENSIONS.forEach(({ id }, d) => {
    const pre = mask & 2 ** d ? d % 3 : null, post = mask & 2 ** (d + 4) ? (d + 1) % 3 : null;
    record.teacher[id] = {pre, post, evidencePre: pre === null ? '' : 'Kanıt', evidencePost: post === null ? '' : 'Kanıt'};
    if (pre !== null) expectedPre.push(pre); if (post !== null) expectedPost.push(post);
  });
  const result = M.summarize([record]);
  equal(result.rows[0].teacherPre, expectedPre.length === 4 ? expectedPre.reduce((a, b) => a + b, 0) : null, 'Pre total requires each dimension');
  equal(result.rows[0].teacherPost, expectedPost.length === 4 ? expectedPost.reduce((a, b) => a + b, 0) : null, 'Post total requires each dimension');
  equal(result.totals.teacher.n, mask === 255 ? 1 : 0, 'Teacher total pairing requires all eight fields');
  equal(result.completeTeacherCount, mask === 255 ? 1 : 0, 'Completion denominator is explicit');
  result.dimensions.forEach((dimension, d) => equal(dimension.n, (mask & 2 ** d) && (mask & 2 ** (d + 4)) ? 1 : 0, 'Each dimension pairs only its own two phases'));
}

for (const raw of [null, undefined, true, false, 4, 'P01', [], NaN]) equal(M.validateRecord(raw).valid, false, 'Malformed user record returns validation feedback, not an exception');
const strings = teacher(M.createRecord('P01'), ['0', '1', '2', '0'], ['2', '0', '1', '2']);
Object.assign(strings, {minutes: ' 25.5 ', choice: {pre: '', post: '0'}, self: {pre: '  ', post: '8'}});
const normalized = M.validateRecord(strings);
equal(normalized.valid, true, 'Raw decimal and integer strings normalize');
equal([normalized.record.minutes, normalized.record.choice.pre, normalized.record.choice.post, normalized.record.self.pre, normalized.record.self.post], [25.5, null, 0, null, 8], 'Blank is null while a real zero is preserved');
for (const value of [-1, 3, .5, NaN, Infinity, true, '2abc', '0x2', {}, []]) {
  const raw = M.createRecord('P01'); raw.teacher.code.pre = value; raw.teacher.code.evidencePre = 'Kanıt';
  const checked = M.validateRecord(raw); equal(checked.valid, false, 'Invalid teacher score rejected');
  ok(checked.errors.some(error => error.field === 'teacher.code.pre'), 'Teacher score error uses a stable field path');
  equal(M.summarize([raw]).totals.teacher.n, 0, 'Invalid teacher score is not silently coerced into an aggregate');
}
for (const [group, max] of [['choice', 4], ['self', 8]]) {
  for (const value of [-1, max + 1, .5, NaN, Infinity, true, '2foo']) {
    const raw = M.createRecord('P01'); raw[group].pre = value;
    equal(M.validateRecord(raw).valid, false, 'Bounded whole-number score required for ' + group);
  }
  for (const value of [0, max, String(max)]) {
    const raw = M.createRecord('P01'); raw[group].pre = value;
    equal(M.validateRecord(raw).valid, true, 'Valid score boundary accepted');
  }
}
for (const score of [0, 1, 2]) {
  const raw = M.createRecord('P01'); raw.teacher.code.pre = score;
  equal(M.validateRecord(raw).valid, false, 'Every awarded teacher score, including zero, needs evidence');
  raw.teacher.code.evidencePre = '   '; equal(M.validateRecord(raw).valid, false, 'Whitespace is not teacher evidence');
  raw.teacher.code.evidencePre = ' Rastgele metin '; equal(M.validateRecord(raw).valid, true, 'Evidence text is not automatically evaluated for meaning');
  equal(M.validateRecord(raw).record.teacher.code.pre, score, 'Evidence never changes the human teacher score');
}
for (const [field, max] of [['bottleneck', 500], ['notes', 1200]]) {
  const raw = M.createRecord('P01'); raw[field] = 'x'.repeat(max); equal(M.validateRecord(raw).valid, true, 'Text limit inclusive');
  raw[field] += 'x'; equal(M.validateRecord(raw).valid, false, 'Overlong text is flagged');
}
const evidenceLimit = teacher(M.createRecord('P01'), [0, null, null, null], [null, null, null, null]);
evidenceLimit.teacher.code.evidencePre = 'x'.repeat(1200); equal(M.validateRecord(evidenceLimit).valid, true, '1200 evidence characters accepted');
evidenceLimit.teacher.code.evidencePre += 'x'; equal(M.validateRecord(evidenceLimit).valid, false, 'Overlong evidence excluded');
for (const value of [0, 25.5, 120, '120']) { const raw = M.createRecord('P01'); raw.minutes = value; equal(M.validateRecord(raw).valid, true, 'Optional decimal duration boundary accepted'); }
for (const value of [-.1, 120.1, NaN, Infinity, true, '25abc']) { const raw = M.createRecord('P01'); raw.minutes = value; equal(M.validateRecord(raw).valid, false, 'Invalid duration rejected'); }
const notesOnly = M.createRecord('P01'); notesOnly.notes = 'Takıldığı yer gözlendi.';
equal(M.summarize([notesOnly]).activeCount, 1, 'Text-only observation is an active slot without a score');
equal(M.summarize([notesOnly]).totals.teacher.n, 0, 'Text is never converted to a teacher score');
const duplicate = M.summarize([records[0], copy(records[0])]);
equal(duplicate.activeCount, 1, 'Duplicate student code is not a second participant');
equal(duplicate.invalid.length, 2, 'Both duplicate records are flagged rather than first-wins');
equal(duplicate.timing.n, 0, 'Duplicate records cannot inflate any denominator');
equal(duplicate.totals.teacher.n, 0, 'Both duplicate records are excluded');
const unknown = copy(records[0]); unknown.id = 'P99';
equal(M.summarize([unknown]).activeCount, 0, 'Unknown code does not create a ninth slot');
equal(M.summarize([unknown]).invalid[0].id, 'P99', 'Unknown record is transparently reported');
equal(M.summarize(null).invalid[0].errors[0].field, 'records', 'Malformed input list returns explicit feedback');
throws(() => M.toCSV([records[0], copy(records[0])]), RangeError, 'CSV refuses duplicate IDs instead of silently discarding work');
throws(() => M.toCSV([unknown]), RangeError, 'CSV refuses unknown IDs instead of silently discarding work');

const csv = M.toCSV(frozen, {conclusion: 'Betimsel gözlem; öğrenme etkisi ölçülmedi.'}), matrix = readCSV(csv), headers = matrix[0];
equal(matrix.length, 9, 'CSV contains header and all eight template rows');
equal(headers.length, 36, 'Readable, fixed scoring/evidence columns');
matrix.forEach(row => equal(row.length, headers.length, 'Every CSV row is rectangular'));
equal(matrix.slice(1).map(row => row[0]), M.IDS, 'CSV order follows P01 through P08');
const column = name => { const index = headers.indexOf(name); assert(index >= 0, name); return index; };
equal(matrix[5][column('Durum')], 'Boş', 'Blank CSV row is explicitly empty, not a participant');
equal(matrix[5][column('Öğretmen başlangıç toplamı (0–8)')], '', 'Blank teacher total is not exported as zero');
ok(matrix[6][column('Durum')].startsWith('Geçersiz'), 'Invalid raw row has a visible status');
equal(matrix[6][column('Süre (dakika)')], '-1', 'Invalid raw duration is recoverable');
equal(matrix[6][column('Öğretmen toplam farkı (aktarım − başlangıç)')], '', 'Invalid record cannot export a misleading computed total');
equal(matrix[2][column('Öğretmen toplam farkı (aktarım − başlangıç)')], '-2', 'Computed negative delta remains numeric without an apostrophe');
equal(matrix[2][column('Seçenek farkı (aktarım − başlangıç)')], '-4', 'Negative choice delta remains numeric');
matrix.slice(1).forEach(row => equal(row[column('Oturum sonuç notu')], 'Betimsel gözlem; öğrenme etkisi ölçülmedi.', 'Session note included without extra pseudo-participant rows'));
for (const attack of ['=1+1', '+CMD', '-1+2', '@SUM(1)', '\t=1', '\r=1', ' \n=1']) {
  const raw = M.createRecord('P01'); raw.bottleneck = attack; raw.notes = attack;
  raw.teacher.code.pre = 1; raw.teacher.code.evidencePre = attack;
  const rows = readCSV(M.toCSV([raw], {conclusion: attack}));
  for (const header of ['Takılma noktası', 'Öğretmen notları', M.DIMENSIONS[0].title + ' · başlangıç kanıtı', 'Oturum sonuç notu'])
    equal(rows[1][column(header)], "'" + attack, 'Formula-leading text is neutralized while retaining the original text');
}
const quoted = M.createRecord('P01'); quoted.notes = 'a,"b"\nTürkçe çığ';
equal(readCSV(M.toCSV([quoted]))[1][column('Öğretmen notları')], quoted.notes, 'Quotes, commas, newlines and Turkish Unicode survive CSV round trip');
const rawInvalid = M.createRecord('P01'); rawInvalid.choice.pre = '=1+1'; rawInvalid.teacher.code.pre = 'iki'; rawInvalid.teacher.code.evidencePre = 'Ham gözlem';
const rawCells = readCSV(M.toCSV([rawInvalid]));
equal(rawCells[1][column('Seçenek başlangıç (0–4)')], "'=1+1", 'Invalid score text is retained and protected');
equal(rawCells[1][column(M.DIMENSIONS[0].title + ' · öğretmen başlangıç (0–2)')], 'iki', 'Invalid teacher text is recoverable');
ok(rawCells[1][column('Hatalar')].includes('choice.pre'), 'CSV explains why raw fields were excluded');
const malformedGroup = M.createRecord('P01'); malformedGroup.choice = 'bozuk bölüm';
equal(readCSV(M.toCSV([malformedGroup]))[1][column('Seçenek başlangıç (0–4)')], 'bozuk bölüm', 'Malformed field group text is not lost during export');
equal(frozen, before, 'CSV export never mutates input evidence or scores');

const browser = {AACapstone: capstone};
vm.runInNewContext(fs.readFileSync(modelPath, 'utf8'), browser, {timeout: 1000});
ok(browser.AAPilot && typeof browser.AAPilot.summarize === 'function', 'Browser receives AAPilot without Node');
equal(JSON.parse(JSON.stringify(browser.AAPilot.RUBRICS)), M.RUBRICS, 'Browser and CommonJS share exact rubrics');
equal(JSON.parse(JSON.stringify(browser.AAPilot.summarize([]))), M.summarize([]), 'Both module surfaces share the blank-state contract');

const result = {status: 'passed', assertions, syntheticFixture: true, handCalculatedSlots: 8,
  fixtureActiveSlots: 7, fixtureValidActiveSlots: 6, teacherMissingnessMasks: 256,
  dimensions: 4, fixedSlots: 8, csvColumns: headers.length,
  coverage: ['paired-only means and denominators', 'independent asymmetric cohort arithmetic', 'null vs real zero',
    'invalid whole-record exclusion', 'required teacher evidence without automatic text grading',
    'all 256 teacher missingness masks', 'unknown and duplicate student IDs', 'raw invalid export recovery',
    'independent CSV parse and formula protection', 'browser/CommonJS parity', 'input immutability']};
if (process.argv.includes('--report')) {
  const destination = path.resolve(process.argv[process.argv.indexOf('--report') + 1] || '');
  const aa = path.resolve(__dirname, '..');
  if (destination === aa || destination.startsWith(aa + path.sep)) throw new Error('Report must be outside the AA source tree');
  fs.mkdirSync(path.dirname(destination), {recursive: true}); fs.writeFileSync(destination, JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
