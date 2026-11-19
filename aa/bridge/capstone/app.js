/* Progressive enhancement: the worksheet, hints and model key remain in HTML. */
(function () {
  'use strict';
  const M = window.AACapstone;
  if (!M) return;
  const $ = id => document.getElementById(id);
  const state = { pre: null, post: null, preGrade: null, postGrade: null, traceIndex: 0, report: '' };
  const trace = M.dijkstraTrace(M.buildGraph(3), 'A');
  const phaseNames = { pre: 'Başlangıç', post: 'Aktarım' };
  const ratingSelects = Array.from(document.querySelectorAll('.rubric select'));
  const fmt = n => Number.isFinite(n) ? String(n) : '∞';

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function optionLabel(question, value) {
    const option = question.options.find(item => item.value === value);
    return option ? option.label : 'Seçilmedi';
  }
  function answerFields(phase, id) {
    return { radios: Array.from(document.querySelectorAll('input[name="' + phase + '-' + id + '"]')), reason: $(phase + '-' + id + '-reason') };
  }
  function readAnswers(phase) {
    return Object.fromEntries(M.DIMENSIONS.map(({ id }) => {
      const fields = answerFields(phase, id);
      const selected = fields.radios.find(radio => radio.checked);
      return [id, { choice: selected ? selected.value : '', reason: fields.reason.value }];
    }));
  }
  function snapshot(answers) {
    return Object.freeze(Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, Object.freeze({ ...answer })])));
  }
  function mirrorReason(phase, id) {
    $(phase + '-' + id + '-print-reason').textContent = answerFields(phase, id).reason.value || 'Gerekçem: ______________________________________________';
  }
  function validate(phase) {
    const answers = readAnswers(phase);
    let first = null;
    let missing = 0;
    M.DIMENSIONS.forEach(({ id }) => {
      const fields = answerFields(phase, id);
      const validChoice = M.PHASES[phase].questions.find(q => q.id === id).options.some(o => o.value === answers[id].choice);
      const validReason = answers[id].reason.trim().length > 0 && answers[id].reason.length <= 1200;
      fields.reason.setAttribute('aria-invalid', String(!validReason));
      fields.radios.forEach(radio => radio.setAttribute('aria-invalid', String(!validChoice)));
      if (!validChoice || !validReason) {
        missing += 1;
        if (!first) first = validChoice ? fields.reason : fields.radios[0];
      }
    });
    if (missing || !M.assess(phase, answers).complete) {
      $('flow-status').textContent = phaseNames[phase] + ': ' + missing + ' soruda seçenek veya gerekçe eksik. Her soruya bir seçenek ve boş olmayan gerekçe yaz; Bilmiyorum seçeneği de geçerlidir.';
      if (phase === 'post') $('post-status').textContent = 'Henüz kontrol edilmedi. Eksik seçenekleri ve gerekçeleri tamamla.';
      if (first) first.focus();
      return null;
    }
    return snapshot(answers);
  }
  function clearReport(message) {
    const hadReport = Boolean(state.report);
    state.report = '';
    $('report-output').value = '';
    $('report-print').textContent = '';
    $('download-report').disabled = true;
    $('report-status').textContent = hadReport ? message : '';
  }
  function ratings() {
    const values = { pre: {}, post: {} };
    ratingSelects.forEach(select => {
      values[select.dataset.phase][select.dataset.dimension] = select.value === '' ? null : Number(select.value);
    });
    return values;
  }
  function manualTotals() {
    const values = ratings();
    const selected = ratingSelects.filter(select => select.value !== '').length;
    if (selected !== 8) return { values, selected, complete: false };
    const pre = M.DIMENSIONS.reduce((sum, { id }) => sum + values.pre[id], 0);
    const post = M.DIMENSIONS.reduce((sum, { id }) => sum + values.post[id], 0);
    return { values, selected, complete: true, pre, post, delta: post - pre };
  }
  function renderManualSummary() {
    const total = manualTotals();
    $('manual-summary').textContent = total.complete
      ? 'Başlangıç özpuan toplamı: ' + total.pre + '/8. Aktarım özpuan toplamı: ' + total.post + '/8. Özpuan farkı (aktarım − başlangıç): ' + (total.delta > 0 ? '+' : '') + total.delta + '. Bu, ilk ve son gerekçelerinin özdeğerlendirmesidir.'
      : total.selected + '/8 özpuan seçildi. İki toplam ve özpuan farkı, sekiz seçim de tamamlanınca gösterilir. Seçilmemiş değerler 0 sayılmaz.';
    const dimensions = $('dimension-summary');
    dimensions.replaceChildren();
    if (!total.complete) {
      dimensions.textContent = 'Dört boyutun karşılaştırması için sekiz özpuanı da seç.';
      return;
    }
    const list = el('ul');
    M.DIMENSIONS.forEach(({ id, title }) => {
      const before = total.values.pre[id], after = total.values.post[id], delta = after - before;
      list.append(el('li', title + ': başlangıç ' + before + '/2 → aktarım ' + after + '/2; özpuan farkı ' + (delta > 0 ? '+' : '') + delta + '.'));
    });
    dimensions.append(list);
  }
  function invalidatePost() {
    $('save-post').disabled = false;
    const wasGraded = Boolean(state.postGrade);
    state.post = state.preGrade = state.postGrade = null;
    ratingSelects.forEach(select => { select.value = ''; });
    $('comparison').hidden = $('rubrics').hidden = $('report-section').hidden = true;
    $('feedback').replaceChildren();
    $('objective-counts').replaceChildren();
    $('model-key').hidden = true;
    $('model-key').open = false;
    renderManualSummary();
    clearReport('Yanıtın değişti; eski rapor silindi. Yeniden kontrol ettikten sonra raporu oluştur.');
    if (wasGraded) {
      $('post-status').textContent = 'Aktarım yanıtın değişti. Önceki kontrol ve bütün özpuanlar silindi; yeniden kontrol et.';
      $('flow-status').textContent = 'Aktarım yanıtlarını yeniden kontrol et; ardından özdeğerlendirmeyi yeniden yap.';
    }
  }
  function renderPreSnapshot() {
    const container = $('pre-snapshot-content');
    container.replaceChildren();
    M.PHASES.pre.questions.forEach(q => {
      const article = el('article');
      article.append(el('h4', q.title), el('p', 'Seçimim: ' + optionLabel(q, state.pre[q.id].choice)), el('p', state.pre[q.id].reason, 'saved-reason'));
      container.append(article);
    });
    $('pre-snapshot').hidden = false;
  }
  function savePre() {
    if (state.pre) return;
    const answers = validate('pre');
    if (!answers) return;
    state.pre = answers;
    M.DIMENSIONS.forEach(({ id }) => {
      const fields = answerFields('pre', id);
      fields.radios.forEach(radio => { radio.disabled = true; });
      fields.reason.readOnly = true;
    });
    $('save-pre').hidden = true;
    renderPreSnapshot();
    $('practice').hidden = $('post-section').hidden = false;
    $('flow-status').textContent = 'Başlangıç yanıtların kaydedildi. Şimdi 10 dakikalık rehberli çalışmayı yap, ardından aktarım sorularını yanıtla. Seçenek kontrolü iki yoklama tamamlandıktan sonra açılır.';
    $('practice-title').focus();
  }
  function renderFeedback() {
    const count = $('objective-counts');
    count.replaceChildren(el('p', 'Başlangıç: ' + state.preGrade.correctCount + '/4 seçenek doğru.'), el('p', 'Aktarım: ' + state.postGrade.correctCount + '/4 seçenek doğru.'));
    const container = $('feedback');
    container.replaceChildren();
    M.DIMENSIONS.forEach(({ id, title }) => {
      const article = el('article', undefined, 'feedback-card');
      article.append(el('h3', title));
      ['pre', 'post'].forEach(phase => {
        const question = M.PHASES[phase].questions.find(q => q.id === id);
        const result = state[phase + 'Grade'].results.find(r => r.id === id);
        const section = el('section');
        section.append(el('h4', phaseNames[phase] + ' — ' + (result.correct ? 'Seçenek doğru' : 'Seçenek beklenenle eşleşmedi')),
          el('p', 'Seçimim: ' + optionLabel(question, state[phase][id].choice)),
          el('p', 'Gerekçem: ' + state[phase][id].reason, 'saved-reason'),
          el('p', 'Beklenen seçenek: ' + optionLabel(question, result.expected)),
          el('p', result.explanation));
        article.append(section);
      });
      container.append(article);
    });
  }
  function savePost() {
    if (!state.pre || state.postGrade) return;
    const answers = validate('post');
    if (!answers) return;
    state.post = answers;
    state.preGrade = M.assess('pre', state.pre);
    state.postGrade = M.assess('post', state.post);
    if (!state.preGrade.complete || !state.postGrade.complete) return;
    $('save-post').disabled = true;
    ratingSelects.forEach(select => { select.value = ''; });
    clearReport('Yeniden kontrol edildi; raporu yeni özpuanlarınla yeniden oluştur.');
    renderManualSummary();
    renderFeedback();
    $('comparison').hidden = $('rubrics').hidden = $('report-section').hidden = $('model-key').hidden = false;
    $('post-status').textContent = 'Dört yanıtın kontrol edildi. Bir yanıtı değiştirirsen kontrol, tüm özpuanlar ve rapor silinir.';
    $('flow-status').textContent = 'İki yoklama tamamlandı. Seçenek kontrolünü incele ve kendi gerekçelerini aynı ölçütlerle değerlendir.';
    $('comparison-title').focus();
  }
  function renderTrace() {
    const frame = trace[state.traceIndex];
    const labels = { init: 'Başlangıç', settle: 'Düğümü kesinleştir', scan: 'Komşuluk girdisini incele', skip: 'Eski kuyruk kaydını atla', finish: 'Tamamlandı' };
    $('trace-status').textContent = 'Adım ' + state.traceIndex + ' / ' + (trace.length - 1) + ' · ' + (labels[frame.event] || frame.event) + (frame.node ? ' · düğüm ' + frame.node : '') + (frame.neighbor ? ', komşu ' + frame.neighbor : '');
    $('trace-distances').textContent = Object.entries(frame.distances).map(([node, distance]) => node + ': ' + fmt(distance)).join(' · ');
    $('trace-queue').textContent = frame.queue.length ? frame.queue.map(entry => entry.node + ' (' + fmt(entry.distance) + ')').join(' → ') : 'Boş';
    $('trace-settled').textContent = frame.settled.length ? frame.settled.join(', ') : 'Henüz yok';
    $('trace-note').textContent = frame.note;
    $('trace-comparison').textContent = frame.event === 'scan'
      ? 'Aday: ' + fmt(frame.candidate) + '. Önceki d[' + frame.neighbor + ']: ' + fmt(frame.previous) + '. ' + fmt(frame.candidate) + ' < ' + fmt(frame.previous) + ' → ' + (frame.changed ? 'doğru; uzaklık güncellendi.' : 'yanlış; uzaklık değişmedi.')
      : 'Komşuluk inceleme adımında aday ile önceki uzaklık burada karşılaştırılır.';
    $('trace-prev').disabled = state.traceIndex === 0;
    $('trace-next').disabled = state.traceIndex === trace.length - 1;
    document.querySelectorAll('#trace-graph [data-node]').forEach(node => {
      node.classList.toggle('current', node.dataset.node === frame.node);
      node.classList.toggle('settled', frame.settled.includes(node.dataset.node));
    });
    document.querySelectorAll('#trace-graph [data-edge]').forEach(edge => {
      edge.classList.toggle('current', Boolean(frame.neighbor) && edge.dataset.edge.split('').every(node => node === frame.node || node === frame.neighbor));
    });
  }
  function makeReport() {
    if (!state.pre || !state.post || !state.postGrade || !state.postGrade.complete) return;
    const total = manualTotals();
    const lines = ['AA · Bütünleşik sensör ağı uygulaması', 'İlk ve son yanıtların seçenek kontrolü ve özdeğerlendirmesi.', 'Çalışma kodu: ' + ($('student-code').value.trim() || '(yazılmadı)'), '', 'Seçenek kontrolü yalnız seçimleri değerlendirir; gerekçelere otomatik puan verilmez.'];
    ['pre', 'post'].forEach(phase => {
      lines.push('', '=== ' + M.PHASES[phase].title + ' ===', M.PHASES[phase].context, 'Otomatik seçenek kontrolü: ' + state[phase + 'Grade'].correctCount + '/4');
      M.PHASES[phase].questions.forEach(q => {
        const answer = state[phase][q.id];
        const score = total.values[phase][q.id];
        lines.push('', q.title, 'Boyut: ' + M.DIMENSIONS.find(d => d.id === q.id).title, 'Soru: ' + q.prompt);
        if (q.code) lines.push('Kod:', q.code);
        lines.push('Seçimim: ' + optionLabel(q, answer.choice), 'Beklenen seçenek: ' + optionLabel(q, q.correct), 'Gerekçem:', answer.reason, 'Model açıklama: ' + q.explanation, 'Özdeğerlendirmem: ' + (score === null ? 'Seçilmedi (0 değildir)' : score + '/2'), 'Aynı özdeğerlendirme ölçütleri:', ...q.rubric);
      });
    });
    lines.push('', '=== Özdeğerlendirme özeti ===');
    if (total.complete) {
      lines.push('Başlangıç özpuan toplamı: ' + total.pre + '/8', 'Aktarım özpuan toplamı: ' + total.post + '/8', 'Özpuan farkı (aktarım − başlangıç): ' + (total.delta > 0 ? '+' : '') + total.delta);
      M.DIMENSIONS.forEach(({ id, title }) => {
        const before = total.values.pre[id], after = total.values.post[id], delta = after - before;
        lines.push(title + ': başlangıç ' + before + '/2 → aktarım ' + after + '/2; özpuan farkı ' + (delta > 0 ? '+' : '') + delta + '.');
      });
    } else {
      lines.push(total.selected + '/8 özpuan seçildi. Eksik özpuanlar 0 sayılmaz. Bütün özpuanlar seçilmediği için toplam ve fark hesaplanmadı.');
    }
    lines.push('Bu özpuanlar kişinin kendi değerlendirmesidir; seçenek doğruluğundan ayrı tutulur.', '', 'Sonraki adımım: __________________________________________');
    state.report = lines.join('\n');
    $('report-output').value = state.report;
    $('report-print').textContent = state.report;
    $('download-report').disabled = false;
    $('report-status').textContent = total.complete ? 'Güncel rapor hazır. İndirebilir veya metni kopyalayabilirsin.' : 'Rapor hazır; eksik özpuanlar açıkça işaretlendi. Toplam ve özpuan farkı hesaplanmadı.';
  }
  function resetAll(focusStart = true) {
    state.pre = state.post = state.preGrade = state.postGrade = null;
    state.traceIndex = 0;
    ['pre', 'post'].forEach(phase => {
      $(phase + '-form').reset();
      M.DIMENSIONS.forEach(({ id }) => {
        const fields = answerFields(phase, id);
        fields.radios.forEach(radio => { radio.disabled = false; radio.removeAttribute('aria-invalid'); });
        fields.reason.readOnly = false;
        fields.reason.removeAttribute('aria-invalid');
        mirrorReason(phase, id);
      });
    });
    ratingSelects.forEach(select => { select.value = ''; });
    $('student-code').value = '';
    $('pre-snapshot').hidden = true;
    $('pre-snapshot-content').replaceChildren();
    $('save-pre').hidden = false;
    $('save-post').disabled = false;
    $('practice').hidden = $('post-section').hidden = $('comparison').hidden = $('rubrics').hidden = $('report-section').hidden = $('model-key').hidden = true;
    $('model-key').open = false;
    $('feedback').replaceChildren();
    $('objective-counts').replaceChildren();
    $('post-status').textContent = '';
    $('reset-confirm').hidden = true;
    $('practice').querySelectorAll('details').forEach(details => { details.open = false; });
    clearReport('');
    $('report-status').textContent = '';
    renderTrace();
    renderManualSummary();
    $('flow-status').textContent = 'Çalışma sıfırlandı. Başlangıç yoklamasını yeniden yapabilirsin.';
    if (focusStart) $('pre-title').focus();
  }

  // Turn on controls only after the model and event handlers can be initialized.
  document.documentElement.classList.add('js');
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; });
  $('practice').hidden = $('post-section').hidden = $('comparison').hidden = $('rubrics').hidden = $('report-section').hidden = $('model-key').hidden = true;
  $('flow-status').textContent = 'Önce başlangıç yoklamasını tamamla. Kaydettiğinde rehber ve aktarım soruları açılır.';
  ['pre', 'post'].forEach(phase => {
    const form = $(phase + '-form');
    form.addEventListener('submit', event => { event.preventDefault(); phase === 'pre' ? savePre() : savePost(); });
    form.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target.matches('input[type="radio"]')) {
        event.preventDefault();
        phase === 'pre' ? savePre() : savePost();
      }
    });
    M.DIMENSIONS.forEach(({ id }) => {
      const fields = answerFields(phase, id);
      mirrorReason(phase, id);
      fields.reason.addEventListener('input', () => {
        mirrorReason(phase, id);
        fields.reason.removeAttribute('aria-invalid');
        if (phase === 'post') invalidatePost();
      });
      fields.radios.forEach(radio => radio.addEventListener('change', () => {
        fields.radios.forEach(item => item.removeAttribute('aria-invalid'));
        if (phase === 'post') invalidatePost();
      }));
    });
  });
  $('save-pre').addEventListener('click', savePre);
  $('save-post').addEventListener('click', savePost);
  $('trace-prev').addEventListener('click', () => { state.traceIndex = Math.max(0, state.traceIndex - 1); renderTrace(); });
  $('trace-next').addEventListener('click', () => { state.traceIndex = Math.min(trace.length - 1, state.traceIndex + 1); renderTrace(); });
  $('trace-reset').addEventListener('click', () => { state.traceIndex = 0; renderTrace(); });
  ratingSelects.forEach(select => select.addEventListener('change', () => { renderManualSummary(); clearReport('Özpuanın değişti; eski rapor silindi. Güncel raporu yeniden oluştur.'); }));
  $('student-code').addEventListener('input', () => { clearReport('Çalışma kodun değişti; eski rapor silindi. Güncel raporu yeniden oluştur.'); });
  $('make-report').addEventListener('click', makeReport);
  $('download-report').addEventListener('click', () => {
    if (!state.report) return;
    const url = URL.createObjectURL(new Blob(['\uFEFF', state.report], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'aa-sensor-agi-calismam.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('reset-request').addEventListener('click', () => { $('reset-confirm').hidden = false; $('reset-all').focus(); });
  $('reset-cancel').addEventListener('click', () => { $('reset-confirm').hidden = true; $('reset-request').focus(); });
  $('reset-all').addEventListener('click', resetAll);
  // A normal history return may restore form values without using BFCache.
  resetAll(false);
  $('flow-status').textContent = 'Önce başlangıç yoklamasını tamamla. Kaydettiğinde rehber ve aktarım soruları açılır.';
  window.addEventListener('pageshow', () => {
    resetAll(false);
    $('flow-status').textContent = 'Önce başlangıç yoklamasını tamamla. Kaydettiğinde rehber ve aktarım soruları açılır.';
  });
})();
