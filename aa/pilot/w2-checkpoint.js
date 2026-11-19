(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AAPilotW2Checkpoint = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 'AA-W2-ROW-1';
  const names = ['i', 'j', 'relation', 'count'];
  const blank = () => ({ i: '', j: '', relation: '', count: '' });
  const flags = ['generalHintOpened', 'hintOpened', 'resultExposed', 'transitionExposed', 'modelExposed'];
  function empty(legacy = false, previous = {}) {
    return {
      version: VERSION, legacyHistory: legacy, attempts: [], current: null, draft: blank(),
      generalHintOpened: !!(legacy && previous.hintSeen?.includes('w2')), hintOpened: false,
      resultExposed: !!(legacy && (previous.seen?.w2sequential === 6 || previous.seen?.w2nested === 9)),
      transitionExposed: !!(legacy && previous.seen?.w2nested >= 4), modelExposed: false
    };
  }
  const text = (value, max) => typeof value === 'string' && value.length <= max;
  function valid(cp) {
    return !!cp && cp.version === VERSION && typeof cp.legacyHistory === 'boolean'
      && flags.every(k => typeof cp[k] === 'boolean') && cp.draft
      && names.every(k => text(cp.draft[k], 100)) && Array.isArray(cp.attempts)
      && (cp.current === null || Number.isInteger(cp.current) && cp.current >= 0 && cp.current < cp.attempts.length)
      && cp.attempts.every((a, index) => a && a.id === index + 1 && ['en', 'tr'].includes(a.language)
        && a.prediction && names.every(k => text(a.prediction[k], 100))
        && ['equal', 'different'].includes(a.prediction.relation)
        && a.context && flags.every(k => ['yes', 'no', 'unknown'].includes(a.context[k]))
        && text(a.explanation, 1200) && Array.isArray(a.explanationEditions)
        && a.explanationEditions.every(k => ['en', 'tr'].includes(k)) && typeof a.compared === 'boolean'
        && (a.explanationContext == null || flags.every(k => ['yes', 'no', 'unknown'].includes(a.explanationContext[k]))));
  }
  const context = cp => Object.fromEntries(flags.map(k => [k, cp[k] ? 'yes' : cp.legacyHistory ? 'unknown' : 'no']));
  function snapshot(cp, prediction, language) {
    const attempt = { id: cp.attempts.length + 1, prediction: { ...prediction }, language, context: context(cp),
      explanation: '', explanationEditions: [], compared: false, explanationContext: null };
    cp.attempts.push(attempt); cp.current = cp.attempts.length - 1;
    return attempt;
  }
  function exportLines(cp, language) {
    const say = (en, tr) => language === 'tr' ? tr : en;
    const label = value => ({ yes: say('yes', 'evet'), no: say('no', 'hayır'), unknown: say('unknown', 'bilinmiyor') })[value];
    const titles = {
      generalHintOpened: say('Earlier general W2 hint', 'Önceki genel W2 ipucu'),
      hintOpened: say('Earlier checkpoint hint', 'Önceki durak ipucu'),
      resultExposed: say('Earlier full W2 solution', 'Önceki tam W2 çözümü'),
      transitionExposed: say('Earlier row-transition step', 'Önceki satır-geçiş adımı'),
      modelExposed: say('Earlier checkpoint model explanation', 'Önceki durak model açıklaması')
    };
    const out = ['\n' + say('Week 2 · Predict → Run → Explain evidence', 'Hafta 2 · Tahmin et → Çalıştır → Açıkla kaydı'), VERSION,
      say('Guided practice, not a scored test. Support is separate from correctness.', 'Rehberli çalışmadır; puanlanan sınav değildir. Destek, doğruluktan ayrıdır.'),
      say('Records [18, 7, 18]; paused after (1,1), (1,2), (1,3), counter 3.', 'Kayıtlar [18, 7, 18]; (1,1), (1,2), (1,3) sonrası durak, sayaç 3.'),
      say('Submitted predictions: ', 'Gönderilen tahmin: ') + cp.attempts.length,
      say('Older support/exposure history: ', 'Önceki destek/gösterim geçmişi: ') + (cp.legacyHistory ? say('partly unknown; migrated draft', 'kısmen bilinmiyor; eski taslak') : say('recorded within this draft', 'bu taslak içinde kaydedildi'))];
    if (!cp.attempts.length) out.push(say('[No prediction submitted; missing is not incorrect.]', '[Tahmin gönderilmedi; eksik yanıt yanlış sayılmaz.]'));
    for (const a of cp.attempts) {
      out.push('\n' + (a.id === 1 ? say('FIRST SUBMITTED ATTEMPT', 'İLK GÖNDERİLEN DENEME') : say('LATER ATTEMPT', 'SONRAKİ DENEME')) + ' #' + a.id,
        say('Interface at submission: ', 'Gönderim arayüzü: ') + a.language,
        'i = ' + a.prediction.i + '; j = ' + a.prediction.j + '; ' + say('equality result', 'eşitlik sonucu') + ' = ' + (a.prediction.relation === 'equal' ? '=' : '≠') + '; ' + say('counter', 'sayaç') + ' = ' + a.prediction.count,
        ...flags.map(k => titles[k] + ': ' + label(a.context[k])),
        say('Explanation for THIS attempt: ', 'BU denemenin gerekçesi: ') + (a.explanation || say('[not recorded]', '[kaydedilmedi]')),
        say('Explanation interface editions: ', 'Gerekçe arayüz sürümleri: ') + (a.explanationEditions.join(', ') || say('not recorded', 'kaydedilmedi')),
        say('Explanation submitted for self-comparison: ', 'Gerekçe öz karşılaştırmaya gönderildi: ') + (a.compared ? say('yes', 'evet') : say('no; unfinished text remains unfinished', 'hayır; yarım metin yarım kaldı')),
        say('Support/exposure before THIS explanation comparison:', 'BU gerekçe karşılaştırmasından önce destek/gösterim:'),
        ...flags.map(k => titles[k] + ': ' + label(a.explanationContext?.[k] || 'unknown')));
    }
    out.push(say('Current unsubmitted prediction draft: ', 'Güncel gönderilmemiş tahmin taslağı: ') + (cp.current === null && names.some(k => cp.draft[k])
      ? names.map(k => k + '=' + (cp.draft[k] || '—')).join('; ') : say('[none]', '[yok]')),
      say('Overall W2 history, including AFTER the first prediction:', 'İlk tahminden SONRAKİ kullanımlar dahil genel W2 geçmişi:'),
      ...flags.map(k => titles[k] + ': ' + label(context(cp)[k])),
      say('Original predictions and their own explanations survive demonstration resets and language changes. Written explanations are not automatically graded.', 'İlk tahminler ve kendi gerekçeleri gösterim sıfırlamalarında ve dil geçişlerinde korunur. Yazılı gerekçeler otomatik puanlanmaz.'));
    return out;
  }

  function mount(options) {
    const $ = id => document.getElementById(id), panel = $('pilot-w2-checkpoint');
    if (!panel) return null;
    const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';
    const say = (en, tr) => lang === 'tr' ? tr : en;
    const state = options.state, cp = () => state().w2Checkpoint, fields = names.map(k => $('w2-predict-' + k));
    const n = options.records.length, relation = options.records[1] === options.records[0] ? 'equal' : 'different';
    let previousPhase = '', feedback = '', invalid = false;
    const element = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
    function current() { const c = cp(); return c.current === null ? null : c.attempts[c.current]; }
    function phase() {
      if (state().mode !== 'nested' || state().seen.w2nested < n) return 'waiting';
      if (state().seen.w2nested === n) return 'predict';
      return current() ? current().compared ? 'review' : 'explain' : 'seen';
    }
    function held() { return ['predict', 'explain'].includes(phase()) && state().stage === 'practice'; }
    function reset() {
      cp().current = null; cp().draft = blank(); feedback = ''; invalid = false; previousPhase = '';
      fields.forEach(field => field.removeAttribute('aria-invalid'));
      $('w2-checkpoint-explanation').removeAttribute('aria-invalid');
      $('w2-checkpoint-explain-status').textContent = '';
    }
    function update() {
      const c = cp(), active = current(), p = phase(), practicing = state().stage === 'practice';
      let observed = false;
      if ((state().seen.w2sequential === n * 2 || state().seen.w2nested === n * n) && !c.resultExposed) { c.resultExposed = true; observed = true; }
      if (state().seen.w2nested > n && !c.transitionExposed) { c.transitionExposed = true; observed = true; }
      if (observed) options.persist();
      panel.dataset.phase = p; panel.hidden = p === 'waiting';
      $('w2-checkpoint-predict').hidden = p === 'seen';
      $('w2-checkpoint-seen').hidden = p !== 'seen';
      $('w2-checkpoint-explain').hidden = !active;
      $('w2-checkpoint-model').hidden = !active?.compared;
      $('w2-checkpoint-context').textContent = say('The first row is complete: ', 'İlk satır tamamlandı: ') + n + say(' checks. Predict the next check.', ' kontrol. Sıradaki kontrolü tahmin et.');
      fields.forEach((field, i) => {
        const value = (active ? active.prediction : c.draft)[names[i]];
        if (field.value !== value) field.value = value;
        field.disabled = !practicing || p !== 'predict';
      });
      $('w2-checkpoint-run').disabled = !practicing || p !== 'predict';
      $('w2-checkpoint-hint').disabled = !practicing || p !== 'predict' || c.hintOpened;
      $('w2-checkpoint-hint-text').hidden = !c.hintOpened;
      $('w2-checkpoint-support').textContent = say('Checkpoint hint history: ', 'Durak ipucu geçmişi: ') + (c.hintOpened ? say('opened.', 'açıldı.') : c.legacyHistory ? say('older history unknown.', 'eski geçmiş bilinmiyor.') : say('not opened.', 'açılmadı.'));
      $('w2-checkpoint-feedback').textContent = feedback; $('w2-checkpoint-feedback').dataset.state = invalid ? 'error' : 'ok';
      $('w2-checkpoint-actual').textContent = active ? say('Actual step: ', 'Gerçek adım: ') + '(2,1): ' + options.records[1] + (relation === 'equal' ? ' = ' : ' ≠ ') + options.records[0] + '; ' + say('counter ', 'sayaç ') + n + ' → ' + (n + 1) + '.' : '';
      const explanation = $('w2-checkpoint-explanation');
      if (explanation.value !== (active?.explanation || '')) explanation.value = active?.explanation || '';
      explanation.readOnly = !practicing || !active || active.compared;
      $('w2-checkpoint-compare').hidden = !!active?.compared;
      $('w2-checkpoint-compare').disabled = !practicing || !active || active.compared;
      const evidence = $('w2-checkpoint-evidence'); evidence.replaceChildren();
      for (const attempt of c.attempts) {
        const group = element('div', '');
        group.append(element('h4', (attempt.id === 1 ? say('First submitted attempt', 'İlk gönderilen deneme') : say('Later attempt', 'Sonraki deneme')) + ' #' + attempt.id),
          element('p', 'i=' + attempt.prediction.i + ', j=' + attempt.prediction.j + ', ' + (attempt.prediction.relation === 'equal' ? '=' : '≠') + ', ' + say('counter ', 'sayaç ') + attempt.prediction.count),
          element('p', attempt.explanation || say('No explanation recorded for this attempt.', 'Bu deneme için gerekçe kaydedilmedi.')),
          element('p', attempt.compared ? say('Compared with the model; not automatically graded.', 'Modelle karşılaştırıldı; otomatik puanlanmadı.') : say('Not submitted for comparison; any text remains unfinished.', 'Karşılaştırmaya gönderilmedi; varsa metin yarım kaldı.')));
        evidence.append(group);
      }
      $('w2-checkpoint-evidence-box').hidden = !c.attempts.length;
      if (held()) for (const id of ['guide-w2-next', 'guide-w2-end']) $(id).disabled = true;
      if (p === 'predict') $('guide-w2-state').textContent = say('First row complete. Fill in the checkpoint before revealing the next check.', 'İlk satır bitti. Sıradaki kontrolü açmadan duraktaki tahminini yaz.');
      if (p !== previousPhase && practicing) {
        if (p === 'predict') fields[0].focus();
        if (p === 'explain') explanation.focus();
      }
      previousPhase = p;
    }
    function run() {
      if (phase() !== 'predict' || state().stage !== 'practice') return;
      const expected = ['2', '1', relation, String(n + 1)], values = fields.map(field => field.value.trim());
      const bad = fields.find((field, i) => {
        const valid = i === 2 ? ['equal', 'different'].includes(values[i]) : values[i] !== '' && !field.validity.badInput
          && Number.isSafeInteger(Number(values[i])) && Number(values[i]) >= Number(field.min) && Number(values[i]) <= Number(field.max);
        field.setAttribute('aria-invalid', String(!valid)); return !valid;
      });
      if (bad) {
        feedback = say('Complete all four fields with valid integers and an equality result. The step has not run.', 'Dört alanı da uygun tam sayılar ve eşitlik sonucuyla doldur. Adım çalıştırılmadı.'); invalid = true; update(); bad.focus(); return;
      }
      snapshot(cp(), Object.fromEntries(names.map((name, i) => [name, values[i]])), lang);
      const wrong = names.filter((name, i) => i === 2 ? values[i] !== expected[i] : Number(values[i]) !== Number(expected[i]));
      feedback = wrong.length ? say('Fields to compare with the actual step: ', 'Gerçek adımla karşılaştırılacak alanlar: ') + wrong.join(', ') + '. '
        + say('The new row starts at i=2, j=1. Every equality question adds one check, including a different result.', 'Yeni satır i=2, j=1 ile başlar. Sonuç farklı olsa da her eşitlik sorusu bir kontrol ekler.')
        : say('All four predictions match the actual step. Explain why it works.', 'Dört tahmin de gerçek adımla eşleşiyor. Nedenini açıkla.');
      invalid = wrong.length > 0;
      state().seen.w2nested = n + 1; cp().transitionExposed = true;
      fields.forEach(field => field.removeAttribute('aria-invalid'));
      options.changed();
    }
    $('w2-checkpoint-run').addEventListener('click', run);
    panel.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.isComposing && fields.includes(event.target) && event.target.tagName === 'INPUT') { event.preventDefault(); run(); }
    });
    fields.forEach((field, index) => field.addEventListener('input', () => {
      if (phase() !== 'predict') return;
      cp().draft[names[index]] = field.value; field.removeAttribute('aria-invalid'); feedback = ''; invalid = false;
      options.changed(false);
    }));
    $('w2-checkpoint-hint').addEventListener('click', () => {
      if (phase() !== 'predict' || state().stage !== 'practice') return;
      cp().hintOpened = true;
      if (!state().hintSeen.includes('w2')) state().hintSeen.push('w2');
      options.changed();
    });
    $('w2-checkpoint-explanation').addEventListener('input', event => {
      const active = current(); if (!active || active.compared || state().stage !== 'practice') return;
      active.explanation = event.target.value;
      if (!active.explanationEditions.includes(lang)) active.explanationEditions.push(lang);
      event.target.removeAttribute('aria-invalid'); $('w2-checkpoint-explain-status').textContent = '';
      options.changed(false);
    });
    $('w2-checkpoint-compare').addEventListener('click', () => {
      const active = current(); if (!active || active.compared || state().stage !== 'practice') return;
      if (!active.explanation.trim()) {
        $('w2-checkpoint-explanation').setAttribute('aria-invalid', 'true');
        $('w2-checkpoint-explain-status').textContent = say('Write your own reason, or “I don’t know”, before comparing. It is not automatically graded.', 'Karşılaştırmadan kendi gerekçeni veya “bilmiyorum” yaz. Otomatik puanlanmaz.');
        $('w2-checkpoint-explanation').focus(); return;
      }
      active.explanationContext = context(cp());
      active.compared = true; cp().modelExposed = true;
      $('w2-checkpoint-explain-status').textContent = say('Compare your reason with the model. No automatic explanation score was assigned.', 'Gerekçeni modelle karşılaştır. Açıklamana otomatik puan verilmedi.');
      options.changed(); $('w2-checkpoint-model-title').focus();
    });
    document.documentElement.classList.add('pilot-w2-checkpoint-ready');
    return { update, held, reset };
  }
  return { VERSION, empty, valid, snapshot, exportLines, mount };
});
