(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AAWeeksPilot = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const FORMAT = 'AA-W1-3-PILOT-1', PILOT_ID = 'weeks1-3', TASK_VERSION = '1.0';
  const IDS = Object.freeze(Array.from({ length: 8 }, (_, index) => 'P' + String(index + 1).padStart(2, '0')));
  const DIMENSIONS = [
    { id: 'code', title: { en: 'Following code and loops', tr: 'Kodları ve döngüleri takip etmek' } },
    { id: 'math', title: { en: 'Understanding mathematical expressions', tr: 'Matematiksel ifadeleri anlamak' } },
    { id: 'purpose', title: { en: 'Seeing what the topics are for', tr: 'Konuların ne işe yaradığını görmek' } },
    { id: 'links', title: { en: 'Connecting topics', tr: 'Konular arasındaki bağlantıları kurmak' } }
  ];
  const PHASES = [
    { id: 'pre', plannedMinutes: 5, title: { en: 'First attempt', tr: 'İlk deneme' } },
    { id: 'practice', plannedMinutes: 10, title: { en: 'Guided work', tr: 'Rehberli çalışma' } },
    { id: 'post', plannedMinutes: 7, title: { en: 'Transfer attempt', tr: 'Aktarım denemesi' } },
    { id: 'reflection', plannedMinutes: 3, title: { en: 'Save and reflect', tr: 'Sakla ve düşün' } }
  ];
  for (const entry of [...DIMENSIONS, ...PHASES]) { Object.freeze(entry.title); Object.freeze(entry); }
  Object.freeze(DIMENSIONS); Object.freeze(PHASES);
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const LANGUAGES = Object.freeze(['', 'en', 'tr', 'mixed']);
  const SUPPORT = Object.freeze(['', 'independent', 'hint', 'solution']);
  const MAX_TEXT = 1200, MAX_BOTTLENECK = 500;

  function blank(id) {
    return { id, language: '',
      timing: Object.fromEntries(PHASES.map(({ id }) => [id, null])),
      bottlenecks: Object.fromEntries(PHASES.map(({ id }) => [id, ''])),
      practice: { hints: null, solutionSeen: '' }, notes: '',
      teacher: Object.fromEntries(DIMENSIONS.map(({ id }) => [id,
        { pre: null, post: null, evidencePre: '', evidencePost: '', supportPre: '', supportPost: '' }])) };
  }

  function createRecord(id) {
    if (!IDS.includes(id)) throw new RangeError('Participant ID must be P01–P08.');
    return blank(id);
  }

  const MESSAGES = {
    object: { en: 'This field must be an object.', tr: 'Bu alan bir nesne olmalı.' },
    records: { en: 'Records must be an array.', tr: 'Kayıtlar bir liste olmalı.' },
    id: { en: 'Participant ID must be P01–P08.', tr: 'Katılımcı kodu P01–P08 arasında olmalı.' },
    duplicate: { en: 'This ID is repeated; all its records are excluded from numerical summaries.', tr: 'Bu kod tekrarlanmış; bu kodun bütün kayıtları sayısal özetlerden çıkarıldı.' },
    number: { en: 'Leave blank or enter a valid number.', tr: 'Boş bırak veya geçerli bir sayı gir.' },
    range: { en: 'Enter a finite number from 0 to {max}.', tr: '0–{max} arasında sonlu bir sayı gir.' },
    whole: { en: 'Enter a whole number from 0 to {max}.', tr: '0–{max} arasında bir tam sayı gir.' },
    text: { en: 'This field must contain text.', tr: 'Bu alan metin olmalı.' },
    length: { en: 'Use no more than {max} characters.', tr: 'En çok {max} karakter kullan.' },
    nul: { en: 'Text cannot contain a NUL character.', tr: 'Metin NUL karakteri içeremez.' },
    language: { en: 'Choose English, Turkish or mixed for an entered participant.', tr: 'Veri girilen katılımcı için İngilizce, Türkçe veya karma dil seç.' },
    enum: { en: 'Choose one of the listed values or leave blank.', tr: 'Listelenen değerlerden birini seç veya boş bırak.' },
    evidence: { en: 'Every awarded score, including 0, needs written evidence.', tr: '0 dâhil verilen her puan için yazılı kanıt gerekir.' }
  };
  function errorText(error, language = 'en') {
    const languageKey = language === 'tr' ? 'tr' : 'en';
    const message = MESSAGES[error && error.code] || MESSAGES.object;
    return message[languageKey].replace('{max}', String(error && error.max !== undefined ? error.max : ''));
  }

  function entered(value, seen = new Set()) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value !== 'object') return true;
    if (seen.has(value)) return false;
    seen.add(value);
    return Object.values(value).some(child => entered(child, seen));
  }
  // Selecting only a language prepares a slot; it does not invent a participant.
  function active(raw) {
    return object(raw) && Object.entries(raw).some(([key, value]) => key !== 'id' && key !== 'language' && entered(value));
  }

  function validateRecord(raw) {
    const errors = [];
    const error = (field, code, extra = {}) => errors.push({ field, code, ...extra });
    const source = object(raw) ? raw : {};
    if (!object(raw)) error('record', 'object');
    const id = typeof source.id === 'string' ? source.id.trim() : '';
    const record = blank(id);
    if (!IDS.includes(id)) error('id', 'id');
    function group(value, field) {
      if (value === undefined || value === null) return {};
      if (!object(value)) { error(field, 'object'); return {}; }
      return value;
    }
    function numeric(value, field, max, whole = false) {
      if (value === undefined || value === null || typeof value === 'string' && value.trim() === '') return null;
      let result;
      if (typeof value === 'number') result = value;
      else if (typeof value === 'string' && NUMBER.test(value.trim())) result = Number(value.trim());
      else { error(field, 'number'); return null; }
      if (!Number.isFinite(result) || result < 0 || result > max || whole && !Number.isInteger(result)) {
        error(field, whole ? 'whole' : 'range', { max }); return null;
      }
      return result === 0 ? 0 : result;
    }
    function text(value, field, max) {
      if (value === undefined || value === null) return '';
      if (typeof value !== 'string') { error(field, 'text'); return ''; }
      if (value.length > max) error(field, 'length', { max });
      if (value.includes('\0')) error(field, 'nul');
      return value;
    }
    function enumeration(value, field, allowed) {
      if (value === undefined || value === null) return '';
      if (!allowed.includes(value)) { error(field, 'enum'); return ''; }
      return value;
    }
    record.language = enumeration(source.language, 'language', LANGUAGES);
    const timing = group(source.timing, 'timing'), bottlenecks = group(source.bottlenecks, 'bottlenecks');
    PHASES.forEach(({ id: phase }) => {
      record.timing[phase] = numeric(timing[phase], 'timing.' + phase, 120);
      record.bottlenecks[phase] = text(bottlenecks[phase], 'bottlenecks.' + phase, MAX_BOTTLENECK);
    });
    const practice = group(source.practice, 'practice');
    record.practice.hints = numeric(practice.hints, 'practice.hints', 3, true);
    record.practice.solutionSeen = enumeration(practice.solutionSeen, 'practice.solutionSeen', ['', 'yes', 'no']);
    record.notes = text(source.notes, 'notes', MAX_TEXT);
    const teacher = group(source.teacher, 'teacher');
    DIMENSIONS.forEach(({ id: dimension }) => {
      const values = group(teacher[dimension], 'teacher.' + dimension), target = record.teacher[dimension];
      for (const phase of ['pre', 'post']) {
        const suffix = phase === 'pre' ? 'Pre' : 'Post', prefix = 'teacher.' + dimension + '.';
        target[phase] = numeric(values[phase], prefix + phase, 2, true);
        target['evidence' + suffix] = text(values['evidence' + suffix], prefix + 'evidence' + suffix, MAX_TEXT);
        target['support' + suffix] = enumeration(values['support' + suffix], prefix + 'support' + suffix, SUPPORT);
        if (target[phase] !== null && target['evidence' + suffix].trim() === '') error(prefix + 'evidence' + suffix, 'evidence');
      }
    });
    if (active(raw) && record.language === '' && !errors.some(item => item.field === 'language')) error('language', 'language');
    return { valid: errors.length === 0, errors, record };
  }

  function prepare(rawRecords) {
    if (!Array.isArray(rawRecords)) return { entries: [], invalid: [{ id: '', errors: [{ field: 'records', code: 'records' }] }] };
    const entries = Array.from(rawRecords, (raw, index) => ({ raw, index, active: active(raw), ...validateRecord(raw) }));
    const counts = new Map();
    entries.forEach(entry => { if (IDS.includes(entry.record.id)) counts.set(entry.record.id, (counts.get(entry.record.id) || 0) + 1); });
    entries.forEach(entry => {
      if (counts.get(entry.record.id) > 1) { entry.valid = false; entry.errors.push({ field: 'id', code: 'duplicate' }); }
    });
    return { entries, invalid: entries.filter(entry => !entry.valid).map(entry => ({ id: entry.record.id, errors: entry.errors.map(item => ({ ...item })) })) };
  }
  const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  function pairSummary(pairs) {
    const usable = pairs.filter(([pre, post]) => pre !== null && post !== null);
    return { n: usable.length, preMean: mean(usable.map(pair => pair[0])), postMean: mean(usable.map(pair => pair[1])), deltaMean: mean(usable.map(pair => pair[1] - pair[0])) };
  }
  function phaseTotal(record, phase) {
    const values = DIMENSIONS.map(({ id }) => record.teacher[id][phase]);
    return values.every(value => value !== null) ? values.reduce((sum, value) => sum + value, 0) : null;
  }
  function totalTime(record) {
    const values = PHASES.map(({ id }) => record.timing[id]);
    return values.every(value => value !== null) ? values.reduce((sum, value) => sum + value, 0) : null;
  }
  function timeSummary(values) {
    return { n: values.length, mean: mean(values), min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null };
  }
  function summarize(rawRecords) {
    const prepared = prepare(rawRecords), usable = prepared.entries.filter(entry => entry.active && entry.valid);
    const dimensions = DIMENSIONS.map(({ id, title }) => {
      const pairs = usable.map(({ record }) => record.teacher[id]).filter(item => item.pre !== null && item.post !== null);
      return { id, title, ...pairSummary(pairs.map(item => [item.pre, item.post])),
        increased: pairs.filter(item => item.post > item.pre).length, unchanged: pairs.filter(item => item.post === item.pre).length,
        decreased: pairs.filter(item => item.post < item.pre).length,
        independentN: pairs.filter(item => item.supportPre === 'independent' && item.supportPost === 'independent').length };
    });
    const rows = IDS.map(id => {
      const group = prepared.entries.filter(entry => entry.record.id === id), isActive = group.some(entry => entry.active), valid = group.every(entry => entry.valid);
      const record = group.length === 1 && valid ? group[0].record : blank(id);
      const teacherPre = phaseTotal(record, 'pre'), teacherPost = phaseTotal(record, 'post');
      return { id, active: isActive, valid, language: record.language, teacherPre, teacherPost,
        teacherDelta: teacherPre !== null && teacherPost !== null ? teacherPost - teacherPre : null,
        minutes: totalTime(record), observedMinutes: PHASES.some(({ id }) => record.timing[id] !== null) ? PHASES.reduce((sum, { id }) => sum + (record.timing[id] || 0), 0) : null,
        missingTimePhases: PHASES.filter(({ id }) => record.timing[id] === null).map(({ id }) => id) };
    });
    const times = usable.map(({ record }) => totalTime(record)).filter(value => value !== null);
    const support = Object.fromEntries(['pre', 'post'].map(phase => {
      const suffix = phase === 'pre' ? 'Pre' : 'Post', all = usable.flatMap(({ record }) => DIMENSIONS.map(({ id }) => record.teacher[id])).filter(value => value[phase] !== null);
      return [phase, { independent: all.filter(value => value['support' + suffix] === 'independent').length,
        hint: all.filter(value => value['support' + suffix] === 'hint').length, solution: all.filter(value => value['support' + suffix] === 'solution').length,
        unknown: all.filter(value => value['support' + suffix] === '').length }];
    }));
    return { activeCount: rows.filter(row => row.active).length, completeTeacherCount: rows.filter(row => row.valid && row.teacherDelta !== null).length,
      invalid: prepared.invalid, dimensions, totals: { teacher: pairSummary(usable.map(({ record }) => [phaseTotal(record, 'pre'), phaseTotal(record, 'post')])) },
      timing: { ...timeSummary(times), within25: times.filter(value => value <= 25).length,
        phases: PHASES.map(({ id, title, plannedMinutes }) => ({ id, title, plannedMinutes, ...timeSummary(usable.map(({ record }) => record.timing[id]).filter(value => value !== null)) })) },
      languages: ['en', 'tr', 'mixed'].map(id => ({ id, n: usable.filter(({ record }) => record.language === id).length })), support,
      practice: { hintsN: usable.filter(({ record }) => record.practice.hints !== null).length,
        hintsTotal: usable.reduce((sum, { record }) => sum + (record.practice.hints || 0), 0),
        solutionYes: usable.filter(({ record }) => record.practice.solutionSeen === 'yes').length,
        solutionNo: usable.filter(({ record }) => record.practice.solutionSeen === 'no').length,
        solutionUnknown: usable.filter(({ record }) => record.practice.solutionSeen === '').length }, rows };
  }
  return Object.freeze({ FORMAT, PILOT_ID, TASK_VERSION, IDS, DIMENSIONS, PHASES, LANGUAGES, SUPPORT, MAX_TEXT, MAX_BOTTLENECK,
    createRecord, validateRecord, summarize, errorText });
});
