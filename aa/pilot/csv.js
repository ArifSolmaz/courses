(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.AAWeeksPilotCSV = factory(root.AAWeeksPilot);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (model) {
  'use strict';
  if (!model || !model.PILOT_ID) throw new Error('AAWeeksPilot must load before its CSV module.');
  const MAX_BYTES = 1048576;
  const identity = { format: model.FORMAT, pilotId: model.PILOT_ID, taskVersion: model.TASK_VERSION };
  const fields = [{ path: 'id', max: 3 }, { path: 'language', max: 20 }];
  model.PHASES.forEach(({ id }) => fields.push({ path: 'timing.' + id, numeric: true, max: 100 }));
  model.PHASES.forEach(({ id }) => fields.push({ path: 'bottlenecks.' + id, max: model.MAX_BOTTLENECK }));
  fields.push({ path: 'practice.hints', numeric: true, max: 100 }, { path: 'practice.solutionSeen', max: 100 }, { path: 'notes', max: model.MAX_TEXT });
  model.DIMENSIONS.forEach(({ id }) => {
    fields.push({ path: 'teacher.' + id + '.pre', numeric: true, max: 100 }, { path: 'teacher.' + id + '.post', numeric: true, max: 100 },
      { path: 'teacher.' + id + '.evidencePre', max: model.MAX_TEXT }, { path: 'teacher.' + id + '.evidencePost', max: model.MAX_TEXT },
      { path: 'teacher.' + id + '.supportPre', max: 100 }, { path: 'teacher.' + id + '.supportPost', max: 100 });
  });
  const HEADERS = Object.freeze([...Object.keys(identity), ...fields.map(field => field.path), 'conclusion']);
  const danger = text => /^[\t\r]/.test(text) || /^\s*[=+\-@]/.test(text);
  function fail(code) {
    const error = new Error('CSV was not loaded: ' + code + '.'); error.code = code; throw error;
  }
  function matrix(text) {
    const rows = []; let row = [], value = '', state = 'start', touched = false;
    function cell() { row.push(value); value = ''; state = 'start'; }
    function line() { cell(); rows.push({ cells: row, blank: !touched }); row = []; touched = false; }
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (state === 'quoted') {
        if (char === '"' && text[index + 1] === '"') { value += '"'; index++; }
        else if (char === '"') state = 'closed';
        else value += char;
        continue;
      }
      if (char === ',') { touched = true; cell(); continue; }
      if (char === '\r' || char === '\n') {
        if (char === '\r') { if (text[index + 1] !== '\n') fail('line-ending'); index++; }
        line(); continue;
      }
      if (state === 'closed') fail('after-quote');
      touched = true;
      if (char === '"') { if (state !== 'start') fail('quote-position'); state = 'quoted'; }
      else { value += char; state = 'plain'; }
    }
    if (state === 'quoted') fail('unclosed-quote');
    if (touched || row.length || value !== '' || state !== 'start') line();
    while (rows.length && rows[rows.length - 1].blank) rows.pop();
    return rows;
  }
  function withinSize(text) {
    let bytes = 0;
    for (const char of text) {
      const point = char.codePointAt(0);
      bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
      if (bytes > MAX_BYTES) fail('size');
    }
  }
  function decode(value) {
    if (!value.startsWith("'")) return value;
    const rest = value.slice(1);
    return rest.startsWith("'") || danger(rest) ? rest : value;
  }
  function encode(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    let text = value === null || value === undefined ? '' : String(value);
    if (text.startsWith("'") || danger(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function get(raw, path) {
    let value = raw;
    for (const key of path.split('.')) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
      if (!Object.prototype.hasOwnProperty.call(value, key)) return undefined;
      value = value[key];
    }
    return value;
  }
  function put(record, path, value) {
    const keys = path.split('.'), last = keys.pop();
    keys.reduce((parent, key) => parent[key], record)[last] = value;
  }
  function rawText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string' || typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'object') { try { return JSON.stringify(value); } catch (_) { return '[Invalid circular value]'; } }
    return String(value);
  }
  function structure(records) {
    if (!Array.isArray(records) || records.length !== model.IDS.length) fail('records');
    const byId = new Map();
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record) || !model.IDS.includes(record.id)) fail('id');
      if (byId.has(record.id)) fail('duplicate-id');
      byId.set(record.id, record);
    }
    return byId;
  }
  function serialize(records, options = {}) {
    const byId = structure(records);
    if (!options || typeof options !== 'object' || Array.isArray(options)) fail('options');
    const conclusion = options.conclusion === undefined ? '' : options.conclusion;
    if (typeof conclusion !== 'string' || conclusion.length > model.MAX_TEXT || conclusion.includes('\0')) fail('conclusion');
    const rows = [HEADERS];
    for (const id of model.IDS) {
      const record = byId.get(id);
      const values = fields.map(field => rawText(get(record, field.path)));
      fields.forEach((field, index) => {
        if (String(values[index]).length > field.max || String(values[index]).includes('\0')) fail('field-length');
      });
      rows.push([...Object.values(identity), ...values, conclusion]);
    }
    const result = rows.map(row => row.map(encode).join(',')).join('\r\n') + '\r\n';
    withinSize(result);
    return result;
  }
  function parse(text) {
    if (typeof text !== 'string') fail('text');
    withinSize(text);
    if (text.includes('\0')) fail('nul');
    const rows = matrix(text.replace(/^\uFEFF/, ''));
    if (!rows.length) fail('empty');
    const headers = rows[0].cells;
    // The former capstone used different tasks and rubrics. Its CSV must stay
    // on the legacy page, never become a new Week 1–3 observation by accident.
    if (!headers.includes('format') || !headers.includes('pilotId') || !headers.includes('taskVersion')) fail('different-pilot');
    if (new Set(headers).size !== headers.length) fail('duplicate-header');
    if (headers.length !== HEADERS.length || HEADERS.some(header => !headers.includes(header))) fail('headers');
    if (rows.length !== model.IDS.length + 1) fail('row-count');
    const column = new Map(headers.map((header, index) => [header, index])), byId = new Map();
    let conclusion;
    for (let index = 1; index < rows.length; index++) {
      const row = rows[index];
      if (row.blank || row.cells.length !== headers.length) fail('column-count');
      for (const [key, value] of Object.entries(identity)) if (row.cells[column.get(key)] !== value) fail('different-pilot');
      const id = row.cells[column.get('id')];
      if (!model.IDS.includes(id)) fail('id');
      if (byId.has(id)) fail('duplicate-id');
      const record = model.createRecord(id);
      for (const field of fields) {
        let value = decode(row.cells[column.get(field.path)]);
        if (value.length > field.max) fail('field-length');
        if (field.numeric) {
          if (value.trim() === '') value = null;
          else if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()) && Number.isFinite(Number(value))) value = Number(value);
        }
        put(record, field.path, value);
      }
      const note = decode(row.cells[column.get('conclusion')]);
      if (note.length > model.MAX_TEXT) fail('conclusion');
      if (conclusion !== undefined && note !== conclusion) fail('conflicting-conclusion');
      conclusion = note; byId.set(id, record);
    }
    const records = model.IDS.map(id => byId.get(id)), summary = model.summarize(records);
    return { records, conclusion: conclusion || '', summary,
      warnings: summary.invalid.map(({ id, errors }) => ({ id, errors: errors.map(error => ({ ...error })) })),
      format: model.FORMAT, pilotId: model.PILOT_ID, taskVersion: model.TASK_VERSION };
  }
  return Object.freeze({ MAX_BYTES, HEADERS, parse, serialize });
});
