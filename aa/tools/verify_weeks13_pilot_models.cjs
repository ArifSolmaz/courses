/* Independent, synthetic-data checks for the bilingual Weeks 1–3 pilot.
 * node aa/tools/verify_weeks13_pilot_models.cjs --report /outside/aa/result.json
 * Literal cohorts, missingness enumeration, Python CSV/HTML oracles and the
 * browser UMD surface exercise the portable data/report contract.
 */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const M = require('../pilot/model.js'), C = require('../pilot/csv.js'), R = require('../pilot/report.js');
const SOURCE_FILES = ['pilot/model.js', 'pilot/csv.js', 'pilot/report.js', 'tools/verify_weeks13_pilot_models.cjs'];
const sourceHashes = () => Object.fromEntries(SOURCE_FILES.map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '..', name))).digest('hex')]));
const sourceHashesBefore = sourceHashes();
let assertions = 0, structuralRejections = 0, csvOracleCalls = 0, htmlOracleCalls = 0;
const equal = (actual, expected, label) => { assert.deepStrictEqual(actual, expected, label); assertions++; };
const ok = (value, label) => { assert.ok(value, label); assertions++; };
const reject = (fn, code) => { assert.throws(fn, error => error instanceof Error && (!code || error.code === code)); assertions++; structuralRejections++; };
const clone = value => structuredClone(value);
const blank = () => M.IDS.map(M.createRecord);
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function teacher(record, pre, post, supports = ['independent', 'independent']) {
  M.DIMENSIONS.forEach(({ id }, index) => { record.teacher[id] = { pre: pre[index], post: post[index],
    evidencePre: pre[index] === null ? '' : 'Initial literal evidence ' + index,
    evidencePost: post[index] === null ? '' : 'Son yanıttan somut kanıt ' + index,
    supportPre: pre[index] === null ? '' : supports[0], supportPost: post[index] === null ? '' : supports[1] }; });
  return record;
}
function metric(actual, expected) {
  equal(actual.n, expected[0]);
  ['preMean', 'postMean', 'deltaMean'].forEach((key, index) => expected[index + 1] === null ? equal(actual[key], null) : ok(Math.abs(actual[key] - expected[index + 1]) < 1e-12));
}
function python(source, input) {
  const result = spawnSync('python3', ['-c', source], { input, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);
}
function readCSV(text) {
  csvOracleCalls++;
  return python('import csv,io,json,sys\nprint(json.dumps(list(csv.reader(io.StringIO(sys.stdin.read(),newline=""))),ensure_ascii=False))', text);
}
function writeCSV(rows) {
  const result = spawnSync('python3', ['-c', 'import csv,io,json,sys\nw=csv.writer(sys.stdout,lineterminator="\\r\\n");w.writerows(json.load(sys.stdin))'], { input: JSON.stringify(rows), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); return result.stdout;
}
const HTML_ORACLE = String.raw`
from html.parser import HTMLParser
import json,re,sys
class Node:
 def __init__(self,tag,attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(c if isinstance(c,str)else c.text()for c in self.children)
 def walk(self):
  yield self
  for c in self.children:
   if isinstance(c,Node):yield from c.walk()
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node('document');self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
  if tag not in('meta','link','br','hr','img','input','source','area','base','embed','wbr'):self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:del self.stack[i:];break
 def handle_data(self,data):self.stack[-1].children.append(data)
p=Parser();p.feed(sys.stdin.read());nodes=list(p.root.walk());tables=[]
for table in(n for n in nodes if n.tag=='table'):
 rows=[]
 for n in table.walk():
  if n.tag=='tr':rows.append([c.text()for c in n.children if isinstance(c,Node)and c.tag in('th','td')])
 tables.append({'rows':rows,'wrapped':table.parent.attrs.get('class')=='table-scroll'})
numeric=lambda n:bool(re.fullmatch(r'[+-]?\d+(?:[.,]\d+)?(?:/(?:2|8))?',n.text()))
cells=[n for n in nodes if n.tag in('th','td')and n.parent.parent.tag=='tbody']
print(json.dumps({'lang':next(n.attrs.get('lang')for n in nodes if n.tag=='html'),'tags':[n.tag for n in nodes],'ids':[n.attrs['id']for n in nodes if'id'in n.attrs],'urls':[v for n in nodes for k,v in n.attrs.items()if k in('src','href')],'events':[k for n in nodes for k in n.attrs if k.lower().startswith('on')],'paragraphs':[n.text()for n in nodes if n.tag=='p'],'tables':tables,'sections':{n.attrs['id']:n.text()for n in nodes if'id'in n.attrs},'participants':[n.attrs['data-participant']for n in nodes if'data-participant'in n.attrs],'numericCells':[n.text()for n in cells if'data-numeric'in n.attrs],'numericMisses':[n.text()for n in cells if numeric(n)and'data-numeric'not in n.attrs],'markedTextCells':[n.text()for n in cells if not numeric(n)and'data-numeric'in n.attrs]},ensure_ascii=False))
`;
function dom(html) { htmlOracleCalls++; return python(HTML_ORACLE, html); }

equal([M.FORMAT, M.PILOT_ID, M.TASK_VERSION], ['AA-W1-3-PILOT-1', 'weeks1-3', '1.0']);
equal(M.IDS, ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08']);
equal(M.PHASES.map(item => [item.id, item.plannedMinutes]), [['pre', 5], ['practice', 10], ['post', 7], ['reflection', 3]]);
equal(M.DIMENSIONS.map(item => item.id), ['code', 'math', 'purpose', 'links']);
equal(C.HEADERS.length, 41); equal(new Set(C.HEADERS).size, 41);
const empty = blank(), emptySummary = M.summarize(empty);
equal(emptySummary.activeCount, 0); equal(emptySummary.completeTeacherCount, 0); equal(emptySummary.invalid, []);
for (const metricValue of [...emptySummary.dimensions, emptySummary.totals.teacher]) metric(metricValue, [0, null, null, null]);
equal(emptySummary.timing.n, 0); equal(emptySummary.timing.mean, null); equal(emptySummary.timing.within25, 0);
equal(M.summarize(empty.map(record => ({ ...record, language: 'en' }))).activeCount, 0, 'Language selection alone is not participation');
empty[0].teacher.code.pre = 2; equal(empty[1].teacher.code.pre, null, 'Fresh slot objects are independent');
reject(() => M.createRecord('P09'));

// This cohort is hand-calculated independently of the production summary.
const records = blank();
teacher(records[0], [0, 1, 2, 0], [2, 2, 1, 1]); records[0].language = 'en';
teacher(records[1], [1, 0, 1, 2], [1, 2, 2, 2], ['hint', 'solution']); records[1].language = 'tr';
teacher(records[2], [2, null, 0, 1], [1, null, 0, null], ['', 'independent']); records[2].language = 'mixed';
Object.assign(records[0], { timing: { pre: 5, practice: 10, post: 7, reflection: 3 }, practice: { hints: 0, solutionSeen: 'no' } });
Object.assign(records[1], { timing: { pre: 4, practice: 11, post: 8, reflection: 3 }, practice: { hints: 3, solutionSeen: 'yes' } });
Object.assign(records[2], { timing: { pre: 0, practice: null, post: 6, reflection: null }, practice: { hints: null, solutionSeen: '' } });
const summary = M.summarize(records);
equal(summary.activeCount, 3); equal(summary.completeTeacherCount, 2); equal(summary.invalid, []);
[[3, 1, 4 / 3, 1 / 3], [2, .5, 2, 1.5], [3, 1, 1, 0], [2, 1, 1.5, .5]].forEach((answer, index) => metric(summary.dimensions[index], answer));
equal(summary.dimensions.map(item => [item.increased, item.unchanged, item.decreased, item.independentN]), [[1, 1, 1, 1], [2, 0, 0, 1], [1, 1, 1, 1], [1, 1, 0, 1]]);
metric(summary.totals.teacher, [2, 3.5, 6.5, 3]);
equal([summary.timing.n, summary.timing.mean, summary.timing.min, summary.timing.max, summary.timing.within25], [2, 25.5, 25, 26, 1]);
equal(summary.timing.phases.map(item => [item.n, item.mean, item.min, item.max]), [[3, 3, 0, 5], [2, 10.5, 10, 11], [3, 7, 6, 8], [2, 3, 3, 3]]);
equal([summary.rows[2].minutes, summary.rows[2].observedMinutes, summary.rows[2].missingTimePhases], [null, 6, ['practice', 'reflection']]);
equal(summary.languages, [{ id: 'en', n: 1 }, { id: 'tr', n: 1 }, { id: 'mixed', n: 1 }]);
equal(summary.support, { pre: { independent: 4, hint: 4, solution: 0, unknown: 3 }, post: { independent: 6, hint: 0, solution: 4, unknown: 0 } });
equal(summary.practice, { hintsN: 2, hintsTotal: 3, solutionYes: 1, solutionNo: 1, solutionUnknown: 1 });
const frozen = freeze(clone(records)), snapshot = clone(frozen);
equal(M.summarize(frozen), summary); equal(frozen, snapshot, 'Summary does not mutate raw evidence');
equal(M.summarize(clone(records).reverse()).dimensions, summary.dimensions);

// Every teacher-score missingness pattern has its own relevant paired n.
for (let mask = 0; mask < 256; mask++) {
  const record = M.createRecord('P01'); record.language = 'en';
  const pre = [], post = [];
  M.DIMENSIONS.forEach(({ id }, index) => {
    const a = mask & 2 ** index ? index % 3 : null, b = mask & 2 ** (index + 4) ? (index + 1) % 3 : null;
    record.teacher[id] = { pre: a, post: b, evidencePre: a === null ? '' : 'a', evidencePost: b === null ? '' : 'b', supportPre: '', supportPost: '' };
    if (a !== null) pre.push(a); if (b !== null) post.push(b);
  });
  const result = M.summarize([record]);
  equal(result.rows[0].teacherPre, pre.length === 4 ? pre.reduce((a, b) => a + b, 0) : null);
  equal(result.rows[0].teacherPost, post.length === 4 ? post.reduce((a, b) => a + b, 0) : null);
  equal(result.totals.teacher.n, mask === 255 ? 1 : 0);
  result.dimensions.forEach((item, index) => equal(item.n, mask & 2 ** index && mask & 2 ** (index + 4) ? 1 : 0));
}
// Every phase-duration missingness pattern; a real zero remains observed.
for (let mask = 0; mask < 16; mask++) {
  const record = M.createRecord('P01'); record.language = 'tr'; record.notes = 'Observed';
  M.PHASES.forEach(({ id }, index) => { record.timing[id] = mask & 2 ** index ? 0 : null; });
  const result = M.summarize([record]);
  equal(result.rows[0].minutes, mask === 15 ? 0 : null); equal(result.timing.n, mask === 15 ? 1 : 0);
  result.timing.phases.forEach((phase, index) => equal(phase.n, mask & 2 ** index ? 1 : 0));
}

for (const value of [null, undefined, false, 1, [], 'record']) equal(M.validateRecord(value).valid, false);
const languageMissing = M.createRecord('P01'); languageMissing.notes = 'A concrete observation';
equal(M.validateRecord(languageMissing).errors, [{ field: 'language', code: 'language' }]);
for (const value of [0, '0', 2, '2']) {
  const record = M.createRecord('P01'); record.language = 'en'; record.teacher.code.pre = value;
  equal(M.validateRecord(record).valid, false, 'Any awarded score needs evidence');
  record.teacher.code.evidencePre = '  '; equal(M.validateRecord(record).valid, false);
  record.teacher.code.evidencePre = 'Observed literal'; equal(M.validateRecord(record).valid, true);
}
for (const [field, values] of [
  ['score', [-1, 3, .5, Infinity, NaN, false, '2foo', '0x2', {}, []]],
  ['time', [-1, 120.1, Infinity, NaN, true, '3foo']],
  ['hints', [-1, 4, .5, true, 'abc']]
]) for (const value of values) {
  const record = clone(records[0]);
  if (field === 'score') record.teacher.code.pre = value;
  else if (field === 'time') record.timing.pre = value;
  else record.practice.hints = value;
  equal(M.validateRecord(record).valid, false); equal(M.summarize([record]).totals.teacher.n, 0, 'Any invalid field excludes the whole record');
}
for (const [field, value] of [['language', 'de'], ['practice', 'bad'], ['teacher', 'bad'], ['timing', []], ['bottlenecks', false]]) {
  const record = clone(records[0]); record[field] = value; equal(M.validateRecord(record).valid, false);
}
for (const value of ['guided', false, 0]) { const record = clone(records[0]); record.teacher.code.supportPre = value; equal(M.validateRecord(record).valid, false); }
for (const value of ['', 'independent', 'hint', 'solution']) { const record = clone(records[0]); record.teacher.code.supportPre = value; equal(M.validateRecord(record).valid, true); }
for (const value of ['', 'yes', 'no']) { const record = clone(records[0]); record.practice.solutionSeen = value; equal(M.validateRecord(record).valid, true); }
const stringInputs = clone(records[0]); stringInputs.timing.pre = ' 5.5 '; stringInputs.teacher.code.pre = '0';
equal(M.validateRecord(stringInputs).record.timing.pre, 5.5); equal(M.validateRecord(stringInputs).record.teacher.code.pre, 0);
const zeroes = blank(); zeroes[0].language = 'en'; teacher(zeroes[0], [0, 0, 0, 0], [0, 0, 0, 0]); M.PHASES.forEach(({ id }) => { zeroes[0].timing[id] = 0; });
equal(M.summarize(zeroes).totals.teacher, { n: 1, preMean: 0, postMean: 0, deltaMean: 0 }); equal(M.summarize(zeroes).timing.within25, 1);
const duplicate = M.summarize([records[0], clone(records[0])]); equal(duplicate.invalid.length, 2); equal(duplicate.activeCount, 1); equal(duplicate.timing.n, 0);
const unknown = clone(records[0]); unknown.id = 'P99'; equal(M.summarize([unknown]).invalid[0].errors[0].code, 'id');
equal(M.summarize(null).invalid[0].errors[0].code, 'records');
for (const [type, max] of [['notes', 1200], ['evidence', 1200], ['bottleneck', 500]]) {
  const record = clone(records[0]), set = value => type === 'notes' ? record.notes = value : type === 'evidence' ? record.teacher.code.evidencePre = value : record.bottlenecks.pre = value;
  set('x'.repeat(max)); equal(M.validateRecord(record).valid, true); set('x'.repeat(max + 1)); equal(M.validateRecord(record).valid, false);
}
ok(M.errorText({ code: 'evidence' }, 'en').includes('evidence')); ok(M.errorText({ code: 'range', max: 120 }, 'tr').includes('120'));

const hostile = '</p><script>globalThis.__weeksPilotPwn=1</script><img src=x onerror=1>&\'"\nTürkçe evidence';
const rich = clone(records); rich[0].notes = hostile; rich[0].bottlenecks.practice = 'Comma, quote"\nSecond line'; rich[0].teacher.links.evidencePost = "'literal";
const conclusion = 'Teacher decision: \n' + hostile;
const csv = C.serialize(freeze(clone(rich)), { conclusion }), matrix = readCSV(csv);
equal(matrix.length, 9); equal(matrix[0], C.HEADERS); matrix.forEach(row => equal(row.length, 41));
equal(C.parse(csv).records, rich); equal(C.parse(csv).conclusion, conclusion); equal(C.parse(csv).summary, M.summarize(rich));
equal(C.parse('\uFEFF' + csv.replace(/\r\n/g, '\n')).records, rich, 'BOM/LF accepted');
equal(C.parse(csv + '\r\n\n').records, rich, 'Only terminal physical blank lines ignored');
const reorder = matrix.map(row => row.slice().reverse()); reorder.splice(1, 8, ...reorder.slice(1).reverse());
equal(C.parse(writeCSV(reorder)).records, rich, 'Rows and exact named columns may be reordered');
for (const attack of ['=1+1', '+cmd', '-1+2', '@SUM(1)', '\t=1', '\r=1', ' \n=1', "'literal", "''double", "'=formula", '', 'Çığ,"quoted"\nline']) {
  let data = blank(); data[0].language = 'en'; data[0].notes = attack; let note = attack;
  for (let round = 0; round < 3; round++) { const encoded = C.serialize(data, { conclusion: note }); const decoded = C.parse(encoded); equal(decoded.records[0].notes, attack); equal(decoded.conclusion, attack); data = decoded.records; note = decoded.conclusion; }
  if (/^[\t\r]|^\s*[=+\-@]/.test(attack)) ok(readCSV(C.serialize(data))[1][C.HEADERS.indexOf('notes')].startsWith("'"), 'CSV formula-leading text neutralized');
}
const invalid = clone(rich); invalid[1].timing.pre = '-1'; invalid[1].teacher.code.post = '=bad'; invalid[1].teacher.code.evidencePost = 'Still retain evidence';
const invalidRound = C.parse(C.serialize(invalid)); equal(invalidRound.records[1].timing.pre, -1); equal(invalidRound.records[1].teacher.code.post, '=bad');
equal(invalidRound.warnings.map(item => item.id), ['P02']); equal(invalidRound.summary.totals.teacher.n, 1);
const original = freeze(clone(rich)); const originalBefore = clone(original); C.serialize(original, { conclusion }); equal(original, originalBefore);
function changed(change) { const rows = clone(matrix); change(rows); return writeCSV(rows); }
for (const key of ['format', 'pilotId', 'taskVersion']) reject(() => C.parse(changed(rows => { rows[2][C.HEADERS.indexOf(key)] = 'other'; })), 'different-pilot');
reject(() => C.parse(changed(rows => { rows[1][C.HEADERS.indexOf('id')] = 'P09'; })), 'id');
reject(() => C.parse(changed(rows => { rows[2][C.HEADERS.indexOf('id')] = 'P01'; })), 'duplicate-id');
reject(() => C.parse(changed(rows => rows.pop())), 'row-count'); reject(() => C.parse(changed(rows => rows.push(clone(rows[1])))), 'row-count');
reject(() => C.parse(changed(rows => rows[1].pop())), 'column-count'); reject(() => C.parse(changed(rows => rows[1].push('extra'))), 'column-count');
reject(() => C.parse(changed(rows => { rows[0][4] = rows[0][3]; })), 'duplicate-header');
reject(() => C.parse(changed(rows => { rows[0][4] = 'unknown'; })), 'headers');
reject(() => C.parse(changed(rows => { rows[2][C.HEADERS.indexOf('conclusion')] = 'different'; })), 'conflicting-conclusion');
reject(() => C.parse(changed(rows => { rows[1][C.HEADERS.indexOf('notes')] = 'x'.repeat(1201); })), 'field-length');
for (const bad of ['', '\uFEFF', '\n\n', 'a"b,c\n', '"a" x,b\n', '"a', 'a,b\rc,d', 'a\0,b']) reject(() => C.parse(bad));
for (const bad of [null, undefined, [], 42]) reject(() => C.parse(bad), 'text');
reject(() => C.parse('ş'.repeat(C.MAX_BYTES / 2 + 1)), 'size');
const legacy = require('../bridge/capstone/pilot/csv.js'), legacyModel = require('../bridge/capstone/pilot/model.js');
reject(() => C.parse(legacy.toCSV(legacyModel.IDS.map(legacyModel.createRecord))), 'different-pilot');
for (const bad of [null, [], rich.slice(0, 7), [...rich, rich[0]], rich.map(record => record.id === 'P08' ? { ...record, id: 'P01' } : record)]) reject(() => C.serialize(bad));
reject(() => C.serialize(rich, { conclusion: null })); reject(() => C.serialize(rich, { conclusion: 'x'.repeat(1201) }));
equal(original, originalBefore, 'Failed imports never mutate existing records');

for (const language of ['en', 'tr']) {
  const report = R.build(original, { language, conclusion, generatedAt: hostile }), parsed = dom(report.html);
  equal(report.summary, M.summarize(original)); equal(parsed.lang, language); equal(parsed.participants, ['P01', 'P02', 'P03']);
  equal(parsed.tables[0].rows.slice(1).map(row => row.slice(1)), language === 'en' ? [['3', '1', '1.33', '+0.33', '1', '1', '1', '1'], ['2', '0.5', '2', '+1.5', '2', '0', '0', '1'], ['3', '1', '1', '0', '1', '1', '1', '1'], ['2', '1', '1.5', '+0.5', '1', '1', '0', '1']] : [['3', '1', '1,33', '+0,33', '1', '1', '1', '1'], ['2', '0,5', '2', '+1,5', '2', '0', '0', '1'], ['3', '1', '1', '0', '1', '1', '1', '1'], ['2', '1', '1,5', '+0,5', '1', '1', '0', '1']]);
  equal(parsed.tables[1].rows[1], language === 'en' ? ['2', '3.5', '6.5', '+3'] : ['2', '3,5', '6,5', '+3']);
  equal(parsed.numericMisses, [], 'Every report numeric token is protected from line splitting');
  equal(parsed.markedTextCells, [], 'Text cells retain normal wrapping');
  ok(parsed.numericCells.includes(language === 'en' ? '+0.33' : '+0,33'), 'Signed decimal difference is marked as one numeric token');
  ok(parsed.paragraphs.includes(hostile)); ok(parsed.paragraphs.includes(conclusion)); ok(parsed.paragraphs.includes("'literal"));
  ok(report.text.includes(hostile)); ok(report.text.includes(conclusion)); ok(report.text.includes('25.5') || report.text.includes('25,5'));
  equal(parsed.tags.filter(tag => ['script', 'img', 'iframe', 'object', 'embed', 'link'].includes(tag)), []); equal(parsed.urls, []); equal(parsed.events, []);
  ok(parsed.tables.every(table => table.wrapped)); equal(parsed.ids.length, new Set(parsed.ids).size);
  ok(!/@import|url\s*\(/i.test(report.html.match(/<style>([\s\S]*?)<\/style>/)[1]));
  ok(report.html.includes('white-space:pre-wrap')); ok(report.html.includes('@media print'));
  equal(report.html, R.build(original, { language, conclusion, generatedAt: hostile }).html, 'Pure deterministic report');
  const invalidReport = R.build(invalidRound.records, { language }); ok(invalidReport.text.includes('Still retain evidence')); ok(invalidReport.text.includes('-1'));
  const noData = R.build(blank(), { language }), blankDOM = dom(noData.html); equal(blankDOM.participants, []); ok(blankDOM.sections['report-timing'].includes(language === 'en' ? 'No complete' : 'Tam süre kaydı yok'));
}
for (const bad of [null, [], rich.slice(0, 7), [...rich, rich[0]]]) reject(() => R.build(bad));
for (const bad of [null, [], { language: 'de' }, { conclusion: null }, { generatedAt: 42 }]) reject(() => R.build(rich, bad));
equal(globalThis.__weeksPilotPwn, undefined); equal(original, originalBefore);

const browser = {};
for (const filename of ['model.js', 'csv.js', 'report.js']) vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../pilot', filename), 'utf8'), browser, { timeout: 1000 });
equal(JSON.parse(JSON.stringify(browser.AAWeeksPilot.summarize(records))), summary, 'Browser/CommonJS model parity');
equal(browser.AAWeeksPilotCSV.serialize(records, { conclusion }), C.serialize(records, { conclusion }), 'Browser/CommonJS codec parity');
equal(JSON.parse(JSON.stringify(browser.AAWeeksPilotCSV.parse(csv))), C.parse(csv));
equal(browser.AAWeeksPilotReport.build(records, { language: 'tr', conclusion }).html, R.build(records, { language: 'tr', conclusion }).html, 'Browser/CommonJS report parity');
const sourceHashesAfter = sourceHashes(); equal(sourceHashesAfter, sourceHashesBefore, 'Tested source bytes stay unchanged');
const result = { status: 'passed', assertions, structuralRejections, csvOracleCalls, htmlOracleCalls, syntheticDataOnly: true, sourceHashesBefore, sourceHashesAfter,
  teacherMissingnessMasks: 256, durationMissingnessMasks: 16, csvColumns: C.HEADERS.length,
  coverage: ['independent asymmetric paired arithmetic', 'null versus real zero', 'evidence and observed support kept separate', 'language counts and blank slots',
    'whole-record invalid exclusion with raw recovery', 'four-phase durations and 25-minute threshold', 'all teacher and duration missingness masks',
    'Python CSV oracle and three reversible hostile-text cycles', 'mandatory task identity and legacy rejection', 'strict atomic structural rejection',
    'Python HTML DOM numeric/evidence checks in two languages', 'whole signed decimal tokens with text wrapping retained', 'offline escaped report and no external resources', 'input immutability', 'browser/CommonJS parity'] };
if (process.argv.includes('--report')) {
  const destination = path.resolve(process.argv[process.argv.indexOf('--report') + 1] || ''), aa = path.resolve(__dirname, '..');
  if (destination === aa || destination.startsWith(aa + path.sep)) throw new Error('Report must be outside AA source.');
  fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
