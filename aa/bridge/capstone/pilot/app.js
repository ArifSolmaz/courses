(function () {
  'use strict';
  const model = window.AAPilot;
  if (!model) return;

  const byId = id => document.getElementById(id);
  const phases = ['pre', 'post'];
  const fields = {
    minutes: 'minutes', bottleneck: 'bottleneck', notes: 'notes',
    'choice.pre': 'choice-pre', 'choice.post': 'choice-post',
    'self.pre': 'self-pre', 'self.post': 'self-post'
  };
  model.DIMENSIONS.forEach(({ id }) => phases.forEach(phase => {
    fields[`teacher.${id}.${phase}`] = `teacher-${phase}-${id}`;
    fields[`teacher.${id}.evidence${phase === 'pre' ? 'Pre' : 'Post'}`] = `evidence-${phase}-${id}`;
  }));

  let records, selected = 'P01', conclusion = '';
  const invalidNumber = 'Geçersiz sayı (alanı yeniden gir)';
  const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
  const format = value => value === null || value === undefined ? '—' : number.format(value);
  const difference = value => value === null || value === undefined ? '—' : (value > 0 ? '+' : '') + number.format(value);
  const get = (object, path) => path.split('.').reduce((value, key) => value && value[key], object);
  function set(object, path, value) {
    const keys = path.split('.'), key = keys.pop();
    keys.reduce((parent, part) => parent[part], object)[key] = value;
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function paragraph(parent, text) { parent.append(element('p', text)); }
  function current() { return records.find(record => record.id === selected); }
  function collect() {
    const record = current();
    Object.entries(fields).forEach(([path, id]) => {
      const input = byId(id);
      // Native number inputs expose an empty value for unfinished entries such
      // as "-". Keep that state invalid rather than treating it as missing.
      const bad = input.type === 'number' && (input.validity.badInput || input.dataset.invalidNumber === 'true');
      set(record, path, bad ? invalidNumber : input.value);
    });
    conclusion = byId('pilot-conclusion').value;
  }
  function load() {
    const record = current();
    byId('participant').value = selected;
    Object.entries(fields).forEach(([path, id]) => {
      const input = byId(id), value = get(record, path);
      const bad = input.type === 'number' && value === invalidNumber;
      input.value = bad ? '' : value ?? '';
      if (bad) { input.dataset.invalidNumber = 'true'; input.placeholder = 'Geçersiz sayı; yeniden gir'; }
      else { delete input.dataset.invalidNumber; input.removeAttribute('placeholder'); }
    });
  }
  function mirrors() {
    const record = current();
    document.querySelectorAll('[data-print-field]').forEach(node => {
      let path = node.dataset.printField, value;
      if (path === 'participant') value = selected;
      else if (path === 'pilotConclusion') value = conclusion;
      else {
        // Paper markup names the evidence by phase; stored records keep it with its dimension.
        const evidence = /^evidence\.([a-z]+)\.(pre|post)$/.exec(path);
        if (evidence) path = `teacher.${evidence[1]}.evidence${evidence[2] === 'pre' ? 'Pre' : 'Post'}`;
        value = get(record, path);
      }
      node.textContent = value === null || value === undefined || value === '' ? '________________' : String(value);
    });
    const paperParticipant = byId('paper-participant');
    if (paperParticipant) paperParticipant.textContent = selected;
  }
  function validation(summary) {
    const result = model.validateRecord(current());
    const errors = byId('record-errors');
    errors.replaceChildren();
    Object.values(fields).forEach(id => byId(id).removeAttribute('aria-invalid'));
    if (!result.valid) {
      paragraph(errors, `${selected}: Bu kayıt düzeltilene kadar karşılaştırma hesaplarına katılmaz.`);
      const list = element('ul');
      result.errors.forEach(error => {
        const id = fields[error.field];
        const item = element('li');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          const link = element('a', (label ? label.textContent.trim() + ': ' : '') + error.message);
          link.href = '#' + id;
          link.addEventListener('click', event => { event.preventDefault(); byId(id).focus(); });
          byId(id).setAttribute('aria-invalid', 'true');
          item.append(link);
        } else item.textContent = error.message;
        list.append(item);
      });
      errors.append(list);
    }
    const otherInvalid = summary.invalid.filter(record => record.id !== selected).map(record => record.id);
    byId('record-status').textContent = `${selected} bu sekmede tutuluyor. Katılımcı değiştirince alanlar korunur.` +
      (otherInvalid.length ? ` Düzeltilecek diğer kayıtlar: ${otherInvalid.join(', ')}.` : '') +
      ' Sayfadan ayrılmadan veya yenilemeden CSV’yi indir.';
  }
  function renderDimensions(summary) {
    const target = byId('dimension-results');
    target.replaceChildren();
    summary.dimensions.forEach(dimension => {
      const card = element('article', undefined, 'result-card');
      card.dataset.dimension = dimension.id;
      card.append(element('h3', dimension.title));
      paragraph(card, `Eşleşmiş öğrenci: ${dimension.n}`);
      if (dimension.n) {
        paragraph(card, `Aynı öğrencilerde öğretmen puanı ortalaması: başlangıç ${format(dimension.preMean)}/2 → aktarım ${format(dimension.postMean)}/2.`);
        paragraph(card, `Ortalama fark: ${difference(dimension.deltaMean)} puan.`);
        paragraph(card, `Artan: ${dimension.increased} · Aynı: ${dimension.unchanged} · Azalan: ${dimension.decreased}.`);
      } else paragraph(card, 'Her iki öğretmen puanı da girilmiş kayıt yok; ortalama ve fark hesaplanmadı.');
      target.append(card);
    });
  }
  function renderTotals(summary) {
    const target = byId('total-results');
    target.replaceChildren();
    const names = {
      teacher: ['Öğretmen gerekçe puanı', 8],
      choice: ['Seçenek doğruluğu', 4],
      self: ['Öğrenci özpuanı', 8]
    };
    Object.entries(names).forEach(([key, [title, max]]) => {
      const values = summary.totals[key], card = element('article', undefined, 'result-card');
      card.dataset.total = key;
      card.append(element('h3', title));
      paragraph(card, `Eşleşmiş öğrenci: ${values.n}`);
      paragraph(card, values.n ? `Aynı öğrencilerde ortalama: ${format(values.preMean)}/${max} → ${format(values.postMean)}/${max}; ortalama fark ${difference(values.deltaMean)} puan.` : 'Eksik eşleşme: toplam ortalaması ve fark hesaplanmadı.');
      target.append(card);
    });
  }
  function renderTable(summary) {
    const target = byId('comparison-body');
    target.replaceChildren();
    summary.rows.forEach(row => {
      const tr = element('tr');
      tr.dataset.participant = row.id;
      const status = !row.active ? 'Boş slot' : !row.valid ? 'Hatalı; hesap dışı' : row.teacherDelta === null ? 'Kısmi kayıt' : 'Öğretmen puanları tam';
      const values = [row.id, format(row.teacherPre), format(row.teacherPost), difference(row.teacherDelta),
        format(row.choicePre), format(row.choicePost), format(row.selfPre), format(row.selfPost), format(row.minutes), status];
      values.forEach((value, index) => {
        const cell = element(index ? 'td' : 'th', value);
        if (!index) cell.scope = 'row';
        tr.append(cell);
      });
      target.append(tr);
    });
  }
  function render() {
    const summary = model.summarize(records);
    const invalidIds = summary.invalid.map(record => record.id);
    byId('comparison-summary').textContent = `Veri girilen öğrenci: ${summary.activeCount}/8. Sekiz öğretmen puanı tamamlanan: ${summary.completeTeacherCount}.` +
      (invalidIds.length ? ` Hesap dışı hatalı kayıtlar: ${invalidIds.join(', ')}. CSV’de ham değerler ve hata açıklamaları korunur.` : '') +
      ' Kullanılmayan slotlar ve eksik puanlar sıfır sayılmaz. Her özette kendi eşleşmiş öğrenci sayısı gösterilir.';
    renderDimensions(summary);
    renderTotals(summary);
    renderTable(summary);
    const timing = summary.timing;
    byId('timing-results').textContent = timing.n ? `Süre kaydı: ${timing.n} öğrenci. Ortalama ${format(timing.mean)} dk; en kısa ${format(timing.min)}, en uzun ${format(timing.max)} dk. 25 dakikada veya önce bitiren: ${timing.within25}/${timing.n}; 30 dakikada veya önce bitiren: ${timing.within30}/${timing.n}.` : 'Süre girilmedi; süre ortalaması hesaplanmadı.';
    validation(summary);
    mirrors();
  }
  function download(blank) {
    collect();
    render();
    const csv = model.toCSV(blank ? model.IDS.map(model.createRecord) : records, { conclusion: blank ? '' : conclusion });
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = element('a');
    link.href = url;
    link.download = blank ? 'aa-pilot-bos-sablon.csv' : 'aa-pilot-karsilastirma.csv';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    byId('record-status').textContent = blank ? 'Sekiz boş satırlı CSV şablonu hazırlandı. Mevcut kayıtların değiştirilmedi.' : 'Güncel kayıtlar CSV olarak hazırlandı. İndirilenler klasörünü kontrol et; bu sekme kalıcı kayıt tutmaz.';
  }
  function reset(focus) {
    records = model.IDS.map(id => model.createRecord(id));
    selected = 'P01'; conclusion = '';
    byId('record-form').reset();
    byId('pilot-conclusion').value = '';
    byId('clear-confirm').hidden = true;
    delete document.body.dataset.printMode;
    load(); render();
    if (focus) byId('participant').focus();
  }

  document.body.classList.add('js-ready');
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; });
  byId('record-form').addEventListener('submit', event => event.preventDefault());
  Object.values(fields).forEach(id => {
    const input = byId(id);
    const update = () => {
      delete input.dataset.invalidNumber;
      input.removeAttribute('placeholder');
      collect(); render();
    };
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    input.addEventListener('keydown', event => {
      if (input.dataset.invalidNumber === 'true' && input.value === '' && ['Backspace', 'Delete'].includes(event.key)) update();
    });
  });
  byId('pilot-conclusion').addEventListener('input', () => { collect(); mirrors(); });
  byId('participant').addEventListener('change', () => {
    // Each input event has already saved the preceding slot. Never collect the new slot over it.
    selected = byId('participant').value;
    load(); render();
  });
  byId('download-template').addEventListener('click', () => download(true));
  byId('download-results').addEventListener('click', () => download(false));
  byId('clear-request').addEventListener('click', () => { byId('clear-confirm').hidden = false; byId('clear-cancel').focus(); });
  byId('clear-cancel').addEventListener('click', () => { byId('clear-confirm').hidden = true; byId('clear-request').focus(); });
  byId('clear-all').addEventListener('click', () => reset(true));
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => {
    collect(); render();
    document.body.dataset.printMode = button.dataset.print;
    window.print();
  }));
  window.addEventListener('afterprint', () => { delete document.body.dataset.printMode; });
  // Browsers can restore native input values even without the back-forward cache.
  // This page has no persistent records; clear all restored fields together with memory.
  window.addEventListener('pageshow', () => reset(false));
  reset(false);
})();
