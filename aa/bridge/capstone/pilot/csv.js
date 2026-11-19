(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.AAPilotCSV = factory(root.AAPilot);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (model) {
  'use strict';
  if (!model || !model.IDS || typeof model.toCSV !== 'function') throw new Error('AAPilot CSV modülünden önce yüklenmeli.');

  const MAX_BYTES = 1048576;
  const VERSION_HEADER = 'Dosya biçimi';
  const VERSION = 'AA-PILOT-2';
  const danger = text => /^[\t\r]/.test(text) || /^\s*[=+\-@]/.test(text);
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  function fail(message) { throw new Error('CSV okunamadı: ' + message); }

  // A logical row may span physical lines inside quoted fields. Blank terminal
  // lines are identified separately from a deliberately quoted empty cell.
  function matrix(text) {
    const rows = [];
    let row = [], value = '', state = 'start', touched = false;
    function cell() { row.push(value); value = ''; state = 'start'; }
    function line() { cell(); rows.push({ cells: row, blank: !touched }); row = []; touched = false; }
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (state === 'quoted') {
        if (char === '"' && text[i + 1] === '"') { value += '"'; i++; }
        else if (char === '"') state = 'closed';
        else value += char;
        continue;
      }
      if (char === ',' ) { touched = true; cell(); continue; }
      if (char === '\r' || char === '\n') {
        if (char === '\r') {
          if (text[i + 1] !== '\n') fail('Satır sonları LF veya CRLF olmalı.');
          i++;
        }
        line(); continue;
      }
      if (state === 'closed') fail('Kapanan çift tırnaktan sonra yalnız virgül veya satır sonu gelebilir.');
      touched = true;
      if (char === '"') {
        if (state !== 'start') fail('Tırnaklı alanın çift tırnağı alanın başında olmalı.');
        state = 'quoted';
      } else { value += char; state = 'plain'; }
    }
    if (state === 'quoted') fail('Bir çift tırnaklı alan kapanmamış.');
    if (touched || row.length || value !== '' || state !== 'start') line();
    while (rows.length && rows[rows.length - 1].blank) rows.pop();
    return rows;
  }

  const BASE_HEADERS = Object.freeze(matrix(model.toCSV(model.IDS.map(model.createRecord)))[0].cells.slice());
  const RAW_FIELDS = [
    { index: 3, path: 'minutes', numeric: true },
    { index: 4, path: 'choice.pre', numeric: true }, { index: 5, path: 'choice.post', numeric: true },
    { index: 7, path: 'self.pre', numeric: true }, { index: 8, path: 'self.post', numeric: true }
  ];
  model.DIMENSIONS.forEach(({ id }, d) => {
    const first = 13 + 5 * d;
    RAW_FIELDS.push({ index: first, path: 'teacher.' + id + '.pre', numeric: true },
      { index: first + 1, path: 'teacher.' + id + '.evidencePre', max: 1200 },
      { index: first + 2, path: 'teacher.' + id + '.post', numeric: true },
      { index: first + 3, path: 'teacher.' + id + '.evidencePost', max: 1200 });
  });
  RAW_FIELDS.push({ index: 33, path: 'bottleneck', max: 500 }, { index: 34, path: 'notes', max: 1200 });
  const DERIVED_NUMBERS = [6, 9, 10, 11, 12, 17, 22, 27, 32];

  function decode(value, format) {
    if (!value.startsWith("'")) return value;
    const rest = value.slice(1);
    if (format === 'v2' && rest.startsWith("'") || danger(rest)) return rest;
    return value;
  }

  function put(record, path, value) {
    const keys = path.split('.'), final = keys.pop();
    keys.reduce((object, key) => object[key], record)[final] = value;
  }

  function read(raw, path) {
    let value = raw;
    for (const key of path.split('.')) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
      if (!owns(value, key)) return undefined;
      value = value[key];
    }
    return value;
  }

  function withinSize(text) {
    let bytes = 0;
    for (const char of text) {
      const point = char.codePointAt(0);
      bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
      if (bytes > MAX_BYTES) fail('Dosya en çok 1 MiB (1.048.576 bayt) olabilir.');
    }
  }

  function parse(text) {
    if (typeof text !== 'string') fail('Dosyanın metni gerekli.');
    withinSize(text);
    if (text.includes('\0')) fail('Dosyada geçersiz NUL karakteri var.');
    const rows = matrix(text.replace(/^\uFEFF/, ''));
    if (!rows.length) fail('Dosya boş.');
    const headers = rows[0].cells;
    if (new Set(headers).size !== headers.length) fail('Başlıklar tekrarlanamaz.');
    let format;
    if (headers.length === BASE_HEADERS.length) format = 'legacy';
    else if (headers.length === BASE_HEADERS.length + 1) format = 'v2';
    else fail('Dosyada 36 eski biçim veya 37 yeni biçim sütunu olmalı.');
    const expected = format === 'v2' ? [...BASE_HEADERS, VERSION_HEADER] : BASE_HEADERS;
    if (headers.some(header => !expected.includes(header)) || expected.some(header => !headers.includes(header))) {
      fail('Başlıklar pilot CSV şablonuyla aynı olmalı; eksik veya tanınmayan başlık var.');
    }
    if (rows.length !== 9) fail('Başlıktan sonra P01–P08 için tam sekiz öğrenci satırı olmalı.');
    const columns = new Map(headers.map((header, i) => [header, i]));
    const at = (row, oldIndex) => row[columns.get(BASE_HEADERS[oldIndex])];
    const records = new Map();
    let conclusion;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r].cells;
      if (rows[r].blank || row.length !== headers.length) fail(r + '. öğrenci satırındaki sütun sayısı başlıklarla aynı olmalı.');
      const id = at(row, 0);
      if (!model.IDS.includes(id)) fail(r + '. öğrenci satırının kodu P01–P08 arasında olmalı.');
      if (records.has(id)) fail(id + ' kodu tekrarlanmış; her öğrenci bir satırda olmalı.');
      if (format === 'v2' && row[columns.get(VERSION_HEADER)] !== VERSION) fail(id + ': Dosya biçimi AA-PILOT-2 olmalı.');
      const record = model.createRecord(id);
      for (const field of RAW_FIELDS) {
        const value = decode(at(row, field.index), format);
        if (field.max !== undefined && value.length > field.max) fail(id + ' · ' + BASE_HEADERS[field.index] + ': en çok ' + field.max + ' karakter olabilir.');
        put(record, field.path, field.numeric && value === '' ? null : value);
      }
      const note = decode(at(row, 35), format);
      if (note.length > 1200) fail(id + ' · Oturum sonuç notu: en çok 1200 karakter olabilir.');
      if (conclusion !== undefined && note !== conclusion) fail('Oturum sonuç notu sekiz satırda da aynı olmalı.');
      conclusion = note;
      records.set(id, record);
    }
    const restored = model.IDS.map(id => records.get(id));
    const summary = model.summarize(restored);
    const warnings = format === 'legacy' ? ["Bu dosya eski CSV biçiminde. Metnin başında kesme işareti (') varsa özgün metinle karşılaştır; eski biçimde bu işaret ile tablo koruması her zaman ayırt edilemez."] : [];
    summary.invalid.forEach(({ id, errors }) => warnings.push(id + ' geri yüklendi; ' + errors.map(error => error.message).join(' ') + ' Bu kayıt düzeltilene kadar karşılaştırma hesaplarına katılmaz.'));
    return { records: restored, conclusion: conclusion === undefined ? '' : conclusion, summary, warnings, format };
  }

  function rawValue(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string' || typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch (_) { return '[Geçersiz döngüsel veri]'; }
    }
    return String(value);
  }

  function encode(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    let text = value === undefined || value === null ? '' : String(value);
    if (text.startsWith("'") || danger(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function toCSV(records, options = {}) {
    // The original writer remains the authority for headers and recomputed
    // values. Replace its raw cells from the actual inputs, never by decoding
    // its ambiguous legacy apostrophe encoding.
    const legacy = matrix(model.toCSV(records, options));
    const actual = new Map(records.map(record => [model.validateRecord(record).record.id, record]));
    const result = [[...BASE_HEADERS, VERSION_HEADER]];
    for (let r = 1; r < legacy.length; r++) {
      const cells = legacy[r].cells.slice(), id = cells[0], raw = actual.get(id) || model.createRecord(id);
      RAW_FIELDS.forEach(field => { cells[field.index] = rawValue(read(raw, field.path)); });
      cells[35] = options.conclusion || '';
      DERIVED_NUMBERS.forEach(index => { if (cells[index] !== '') cells[index] = Number(cells[index]); });
      cells.push(VERSION);
      result.push(cells);
    }
    return result.map(row => row.map(encode).join(',')).join('\r\n') + '\r\n';
  }

  return Object.freeze({ MAX_BYTES, parse, toCSV });
});
