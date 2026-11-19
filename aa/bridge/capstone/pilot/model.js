(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../model.js'));
  else root.AAPilot = factory(root.AACapstone);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (capstone) {
  'use strict';
  if (!capstone || !capstone.PHASES || !capstone.DIMENSIONS) throw new Error('AACapstone is required before AAPilot');

  const DIMENSIONS = capstone.DIMENSIONS.map(({ id, title }) => Object.freeze({ id, title }));
  const RUBRICS = Object.fromEntries(DIMENSIONS.map(({ id }) => [id,
    Object.freeze(capstone.PHASES.pre.questions.find(question => question.id === id).rubric.slice())]));
  const IDS = Array.from({ length: 8 }, (_, i) => 'P' + String(i + 1).padStart(2, '0'));
  Object.freeze(DIMENSIONS); Object.freeze(RUBRICS); Object.freeze(IDS);
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  function blankRecord(id) {
    return { id, minutes: null, bottleneck: '', notes: '', choice: { pre: null, post: null },
      self: { pre: null, post: null },
      teacher: Object.fromEntries(DIMENSIONS.map(({ id: dimension }) => [dimension,
        { pre: null, post: null, evidencePre: '', evidencePost: '' }])) };
  }

  function createRecord(id) {
    if (!IDS.includes(id)) throw new RangeError('Öğrenci kodu P01–P08 arasında olmalı.');
    return blankRecord(id);
  }

  function validateRecord(raw) {
    const errors = [];
    const error = (field, message) => errors.push({ field, message });
    const source = isObject(raw) ? raw : {};
    if (!isObject(raw)) error('record', 'Öğrenci kaydı bir nesne olmalı.');
    const id = typeof source.id === 'string' ? source.id.trim() : '';
    const record = blankRecord(id);
    if (!IDS.includes(id)) error('id', 'Öğrenci kodu P01–P08 arasında olmalı.');
    function numeric(value, field, max, whole) {
      if (value === null || value === undefined || typeof value === 'string' && value.trim() === '') return null;
      let number;
      if (typeof value === 'number') number = value;
      else if (typeof value === 'string' && NUMBER.test(value.trim())) number = Number(value.trim());
      else { error(field, 'Boş bırak veya geçerli bir sayı gir.'); return null; }
      if (!Number.isFinite(number) || number < 0 || number > max || whole && !Number.isInteger(number)) {
        error(field, whole ? '0–' + max + ' arasında bir tam sayı olmalı.' : '0–' + max + ' arasında sonlu bir sayı olmalı.');
        return null;
      }
      return number === 0 ? 0 : number;
    }
    function text(value, field, max) {
      if (value === null || value === undefined) return '';
      if (typeof value !== 'string') { error(field, 'Metin olmalı.'); return ''; }
      const result = value.trim();
      if (result.length > max) error(field, 'En çok ' + max + ' karakter olmalı.');
      return result;
    }
    function object(value, field) {
      if (value === undefined || value === null) return {};
      if (!isObject(value)) { error(field, 'Bu alanın alt alanları bir nesne olmalı.'); return {}; }
      return value;
    }
    record.minutes = numeric(source.minutes, 'minutes', 120, false);
    record.bottleneck = text(source.bottleneck, 'bottleneck', 500);
    record.notes = text(source.notes, 'notes', 1200);
    for (const [name, max] of [['choice', 4], ['self', 8]]) {
      const values = object(source[name], name);
      for (const phase of ['pre', 'post']) record[name][phase] = numeric(values[phase], name + '.' + phase, max, true);
    }
    const teacher = object(source.teacher, 'teacher');
    for (const { id: dimension } of DIMENSIONS) {
      const values = object(teacher[dimension], 'teacher.' + dimension), target = record.teacher[dimension];
      for (const phase of ['pre', 'post']) {
        const evidence = phase === 'pre' ? 'evidencePre' : 'evidencePost';
        target[phase] = numeric(values[phase], 'teacher.' + dimension + '.' + phase, 2, true);
        target[evidence] = text(values[evidence], 'teacher.' + dimension + '.' + evidence, 1200);
        if (target[phase] !== null && target[evidence] === '') {
          error('teacher.' + dimension + '.' + evidence, 'Puan verildiğinde bu yanıttan kısa bir kanıt yaz.');
        }
      }
    }
    return { valid: errors.length === 0, errors, record };
  }

  function entered(value, seen = new Set()) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value !== 'object') return true;
    if (seen.has(value)) return false;
    seen.add(value);
    return Object.values(value).some(child => entered(child, seen));
  }

  function active(raw) {
    return isObject(raw) && Object.entries(raw).some(([key, value]) => key !== 'id' && entered(value));
  }

  function prepare(rawRecords) {
    if (!Array.isArray(rawRecords)) return { entries: [], invalid: [{ id: '(liste)', errors: [{ field: 'records', message: 'Kayıtlar bir liste olmalı.' }] }] };
    const entries = Array.from(rawRecords, (raw, index) => ({ raw, index, active: active(raw), ...validateRecord(raw) }));
    const counts = new Map();
    entries.forEach(entry => { if (IDS.includes(entry.record.id)) counts.set(entry.record.id, (counts.get(entry.record.id) || 0) + 1); });
    entries.forEach(entry => {
      if (counts.get(entry.record.id) > 1) {
        entry.valid = false;
        entry.errors.push({ field: 'id', message: 'Bu öğrenci kodu birden fazla kullanılmış; bu kodun tüm kayıtları özetten çıkarıldı.' });
      }
    });
    return { entries, invalid: entries.filter(entry => !entry.valid).map(entry => ({
      id: entry.record.id || '(satır ' + (entry.index + 1) + ')', errors: entry.errors.map(error => ({ ...error }))
    })) };
  }

  function phaseTotal(record, phase) {
    const scores = DIMENSIONS.map(({ id }) => record.teacher[id][phase]);
    return scores.every(score => score !== null) ? scores.reduce((sum, score) => sum + score, 0) : null;
  }

  function difference(pre, post) { return pre !== null && post !== null ? post - pre : null; }

  function pairSummary(pairs) {
    const usable = pairs.filter(([pre, post]) => pre !== null && post !== null);
    if (!usable.length) return { n: 0, preMean: null, postMean: null, deltaMean: null };
    return { n: usable.length,
      preMean: usable.reduce((sum, pair) => sum + pair[0], 0) / usable.length,
      postMean: usable.reduce((sum, pair) => sum + pair[1], 0) / usable.length,
      deltaMean: usable.reduce((sum, pair) => sum + pair[1] - pair[0], 0) / usable.length };
  }

  function summarize(rawRecords) {
    const prepared = prepare(rawRecords);
    const usable = prepared.entries.filter(entry => entry.active && entry.valid);
    const dimensions = DIMENSIONS.map(({ id, title }) => {
      const pairs = usable.map(({ record }) => [record.teacher[id].pre, record.teacher[id].post])
        .filter(pair => pair[0] !== null && pair[1] !== null);
      return { id, title, ...pairSummary(pairs),
        increased: pairs.filter(pair => pair[1] > pair[0]).length,
        unchanged: pairs.filter(pair => pair[1] === pair[0]).length,
        decreased: pairs.filter(pair => pair[1] < pair[0]).length };
    });
    const rows = IDS.map(id => {
      const group = prepared.entries.filter(entry => entry.record.id === id);
      const isActive = group.some(entry => entry.active), valid = group.every(entry => entry.valid);
      const record = group.length === 1 && valid ? group[0].record : blankRecord(id);
      const teacherPre = phaseTotal(record, 'pre'), teacherPost = phaseTotal(record, 'post');
      return { id, active: isActive, valid, teacherPre, teacherPost, teacherDelta: difference(teacherPre, teacherPost),
        choicePre: record.choice.pre, choicePost: record.choice.post, choiceDelta: difference(record.choice.pre, record.choice.post),
        selfPre: record.self.pre, selfPost: record.self.post, selfDelta: difference(record.self.pre, record.self.post), minutes: record.minutes };
    });
    const times = usable.map(({ record }) => record.minutes).filter(value => value !== null);
    return { activeCount: rows.filter(row => row.active).length,
      completeTeacherCount: rows.filter(row => row.valid && row.teacherDelta !== null).length,
      invalid: prepared.invalid, dimensions,
      totals: {
        teacher: pairSummary(usable.map(({ record }) => [phaseTotal(record, 'pre'), phaseTotal(record, 'post')])),
        choice: pairSummary(usable.map(({ record }) => [record.choice.pre, record.choice.post])),
        self: pairSummary(usable.map(({ record }) => [record.self.pre, record.self.post]))
      },
      timing: { n: times.length, mean: times.length ? times.reduce((sum, value) => sum + value, 0) / times.length : null,
        min: times.length ? Math.min(...times) : null, max: times.length ? Math.max(...times) : null,
        within25: times.filter(value => value <= 25).length, within30: times.filter(value => value <= 30).length }, rows };
  }

  function rawAt(raw, path) {
    let value = raw;
    for (const key of path.split('.')) {
      // If a malformed parent replaced an entire field group, keep that raw
      // value in its affected CSV cells instead of silently exporting blanks.
      if (!isObject(value)) return value;
      if (!owns(value, key)) return undefined;
      value = value[key];
    }
    return value;
  }

  function rawText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch (_) { return '[Geçersiz döngüsel veri]'; }
    }
    return String(value);
  }

  function csvCell(value) {
    if (value === null || value === undefined) return '""';
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    let text = String(value);
    // Preserve computed negative numbers as numbers. Only text is neutralized;
    // quoted CSV alone does not stop spreadsheet formula interpretation.
    if (/^[\t\r]/.test(text) || /^\s*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function toCSV(rawRecords, options = {}) {
    if (!Array.isArray(rawRecords)) throw new TypeError('CSV için kayıt listesi gerekli.');
    if (!isObject(options)) throw new TypeError('CSV seçenekleri bir nesne olmalı.');
    if (options.conclusion !== undefined && typeof options.conclusion !== 'string') throw new TypeError('Oturum notu metin olmalı.');
    const prepared = prepare(rawRecords);
    const counts = new Map();
    for (const entry of prepared.entries) {
      if (!IDS.includes(entry.record.id)) throw new RangeError('CSV oluşturulmadı: bilinmeyen öğrenci kodunu düzelt; hiçbir kayıt atılmadı.');
      if (counts.has(entry.record.id)) throw new RangeError('CSV oluşturulmadı: tekrarlanan öğrenci kodunu düzelt; hiçbir kayıt atılmadı.');
      counts.set(entry.record.id, entry);
    }
    const summary = summarize(rawRecords);
    const headers = ['Öğrenci kodu', 'Durum', 'Hatalar', 'Süre (dakika)',
      'Seçenek başlangıç (0–4)', 'Seçenek aktarım (0–4)', 'Seçenek farkı (aktarım − başlangıç)',
      'Özpuan başlangıç (0–8)', 'Özpuan aktarım (0–8)', 'Özpuan farkı (aktarım − başlangıç)',
      'Öğretmen başlangıç toplamı (0–8)', 'Öğretmen aktarım toplamı (0–8)', 'Öğretmen toplam farkı (aktarım − başlangıç)'];
    DIMENSIONS.forEach(({ title }) => headers.push(title + ' · öğretmen başlangıç (0–2)', title + ' · başlangıç kanıtı',
      title + ' · öğretmen aktarım (0–2)', title + ' · aktarım kanıtı', title + ' · öğretmen farkı (aktarım − başlangıç)'));
    headers.push('Takılma noktası', 'Öğretmen notları', 'Oturum sonuç notu');
    const matrix = [headers];
    for (const id of IDS) {
      const entry = counts.get(id) || { raw: createRecord(id), ...validateRecord(createRecord(id)), active: false };
      const row = summary.rows.find(item => item.id === id);
      const raw = entry.raw;
      const cells = [id, !entry.valid ? 'Geçersiz — özete alınmadı' : entry.active ? 'Geçerli' : 'Boş',
        entry.errors.map(error => error.field + ': ' + error.message).join(' | '), rawText(rawAt(raw, 'minutes')),
        rawText(rawAt(raw, 'choice.pre')), rawText(rawAt(raw, 'choice.post')), row.choiceDelta,
        rawText(rawAt(raw, 'self.pre')), rawText(rawAt(raw, 'self.post')), row.selfDelta,
        row.teacherPre, row.teacherPost, row.teacherDelta];
      for (const { id: dimension } of DIMENSIONS) {
        const scores = entry.record.teacher[dimension];
        cells.push(rawText(rawAt(raw, 'teacher.' + dimension + '.pre')), rawText(rawAt(raw, 'teacher.' + dimension + '.evidencePre')),
          rawText(rawAt(raw, 'teacher.' + dimension + '.post')), rawText(rawAt(raw, 'teacher.' + dimension + '.evidencePost')),
          entry.valid ? difference(scores.pre, scores.post) : null);
      }
      cells.push(rawText(rawAt(raw, 'bottleneck')), rawText(rawAt(raw, 'notes')), options.conclusion || '');
      matrix.push(cells);
    }
    return matrix.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }

  return Object.freeze({ DIMENSIONS, RUBRICS, IDS, createRecord, validateRecord, summarize, toCSV });
});
