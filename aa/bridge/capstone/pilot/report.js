(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.AAPilotReport = factory(root.AAPilot);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (model) {
  'use strict';
  if (!model || typeof model.summarize !== 'function') throw new Error('Öğretmen raporundan önce AAPilot yüklenmeli.');
  const TITLE = 'AA · Pilot öğretmen raporu';
  const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
  const format = value => number.format(value);
  const delta = value => (value > 0 ? '+' : '') + format(value);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const LABELS = { minutes: 'Süre', bottleneck: 'Takılma gözlemi', notes: 'Öğretmen notu',
    choice: 'Seçenek doğruluğu', self: 'Öğrenci özpuanı', teacher: 'Öğretmen puanları',
    'choice.pre': 'Başlangıç seçenek doğruluğu', 'choice.post': 'Aktarım seçenek doğruluğu',
    'self.pre': 'Başlangıç öğrenci özpuanı', 'self.post': 'Aktarım öğrenci özpuanı' };
  model.DIMENSIONS.forEach(({ id, title }) => {
    LABELS['teacher.' + id] = title;
    LABELS['teacher.' + id + '.pre'] = title + ' · başlangıç öğretmen puanı';
    LABELS['teacher.' + id + '.post'] = title + ' · aktarım öğretmen puanı';
    LABELS['teacher.' + id + '.evidencePre'] = title + ' · başlangıç kanıtı';
    LABELS['teacher.' + id + '.evidencePost'] = title + ' · aktarım kanıtı';
  });

  function rawText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch (_) { return '[Geçersiz metin değeri]'; }
    }
    return String(value);
  }

  function present(text) { return text.trim() !== ''; }

  function structure(records) {
    if (!Array.isArray(records) || records.length !== model.IDS.length) throw new Error('Rapor için P01–P08 kodlarıyla tam sekiz kayıt gerekli.');
    const byId = new Map();
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record) || typeof record.id !== 'string' || !model.IDS.includes(record.id.trim())) {
        throw new Error('Rapordaki öğrenci kodları P01–P08 arasında olmalı.');
      }
      const id = record.id.trim();
      if (byId.has(id)) throw new Error('Raporda aynı öğrenci kodu birden fazla kullanılamaz.');
      byId.set(id, record);
    }
    return byId;
  }

  const STYLE = `
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:#f3f5f2;color:#152820;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Arial,sans-serif}.report{max-width:76rem;margin:auto;padding:clamp(.9rem,3vw,2.5rem)}h1,h2,h3{overflow-wrap:anywhere}h1{font-size:clamp(1.65rem,4vw,2.5rem);line-height:1.2}h2{font-size:1.35rem;margin-top:2rem}h3{font-size:1.1rem;margin:.25rem 0}.lead{font-size:1.1rem}.panel{background:#fff;border:1px solid #ccd7cd;border-radius:12px;padding:clamp(.85rem,2vw,1.3rem);margin:1rem 0}.preserve{white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal}.table-scroll{max-width:100%;overflow-x:auto;border:1px solid #ccd7cd;border-radius:8px;margin:1rem 0}.table-scroll:focus-visible{outline:3px solid #225c43;outline-offset:3px}table{width:100%;min-width:40rem;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{text-align:left;vertical-align:top;padding:.65rem;border-bottom:1px solid #d8e0d8;overflow-wrap:anywhere}th{background:#edf2ec}tbody th{background:#f7f9f5;min-width:8rem}tr:last-child>*{border-bottom:0}.muted{color:#43564a}.invalid{border-left:4px solid #8c431a}.note-label{font-weight:650;margin-bottom:.25rem}.note-value{margin-top:0}.meta{color:#43564a;font-size:.95rem}@media(max-width:480px){.report{padding:.8rem}.panel{padding:.8rem}th,td{padding:.5rem}}@page{margin:14mm}@media print{body{background:white;color:black;font-size:10pt}.report{max-width:none;padding:0}h1{font-size:20pt}h2{font-size:14pt;break-after:avoid}h3{font-size:11pt;break-after:avoid}.panel{border:1px solid #aaa;border-radius:0;padding:8pt}.table-scroll{overflow:visible;border:0;border-radius:0}table{min-width:0;font-size:9pt}th,td{padding:4pt}tbody th{min-width:0}tr{break-inside:avoid}.preserve{overflow-wrap:anywhere}}
`;

  function build(records, options = {}) {
    const byId = structure(records);
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Rapor seçenekleri bir nesne olmalı.');
    const conclusion = options.conclusion === undefined ? '' : options.conclusion;
    const generatedAt = options.generatedAt === undefined ? '' : options.generatedAt;
    if (typeof conclusion !== 'string' || typeof generatedAt !== 'string') throw new Error('Oturum kararı ve rapor tarihi metin olmalı.');
    const summary = model.summarize(records);
    const blocks = [];
    const heading = (level, text) => blocks.push({ type: 'heading', level, text });
    const paragraph = (text, className = '') => blocks.push({ type: 'paragraph', text, className });
    const table = (title, headers, rows, dimensions = null) => blocks.push({ type: 'table', title, headers, rows, dimensions });
    const open = (tag, attributes) => blocks.push({ type: 'open', tag, attributes });
    const close = tag => blocks.push({ type: 'close', tag });
    heading(1, TITLE);
    if (generatedAt !== '') paragraph('Oluşturulma bilgisi: ' + generatedAt, 'meta');
    paragraph('Bu küçük pilotun özeti yalnız bu grubu betimler; ön/son fark tek başına ders etkisini göstermez.', 'lead');
    paragraph('Veri girilen öğrenci: ' + summary.activeCount + '/8. Boş slot: ' + (8 - summary.activeCount) + '/8. Sekiz öğretmen puanı da tamamlanan geçerli öğrenci: ' + summary.completeTeacherCount + '.');
    if (summary.activeCount === 0) paragraph('Henüz öğrenci verisi yok. Boş slotlar ve eksik puanlar sıfır puan değildir.');
    paragraph('Her ortalama ve fark, yalnız aynı ölçümün başlangıç ve aktarım değerleri birlikte bulunan geçerli öğrencilerden hesaplanır. Her ölçümün kendi eşleşmiş öğrenci sayısı (n) vardır. Gerekçe puanları öğretmenin verdiği 0–2 değerleridir.');

    heading(2, 'Hesaba katılmayan kayıtlar');
    if (!summary.invalid.length) paragraph('Hatalı kayıt yok. Eksik eşleşmeler ilgili hesabın dışında tutulur.');
    else {
      paragraph(summary.invalid.length + ' hatalı kayıt bütün sayısal özetlerden çıkarıldı. Ham gözlem ve öğretmen notları aşağıda korunuyor.');
      model.IDS.forEach(id => {
        const invalid = summary.invalid.find(record => record.id === id);
        if (!invalid) return;
        heading(3, id + ' — Hatalı kayıt; sayısal özetten dışlandı');
        invalid.errors.forEach(error => paragraph((LABELS[error.field] || error.field) + ': ' + error.message, 'invalid'));
      });
    }

    open('section', { id: 'report-dimensions' });
    heading(2, 'Dört boyutta öğretmen değerlendirmesi');
    paragraph('Öğretmen her gerekçeyi aynı 0–2 ölçütüyle değerlendirir. Buradaki fark, öğrenci özpuanı veya seçenek doğruluğu değildir.');
    table('Dört boyutun eşleşmiş öğretmen puanları', ['Boyut', 'Eşleşmiş öğrenci (n)', 'Başlangıç ort.', 'Aktarım ort.', 'Ort. fark (son − ilk)', 'Artan', 'Aynı', 'Azalan'],
      summary.dimensions.map(d => [d.title, String(d.n), d.n ? format(d.preMean) + '/2' : 'Hesaplanmadı',
        d.n ? format(d.postMean) + '/2' : 'Hesaplanmadı', d.n ? delta(d.deltaMean) + ' puan' : 'Hesaplanmadı',
        d.n ? String(d.increased) : '—', d.n ? String(d.unchanged) : '—', d.n ? String(d.decreased) : '—']), summary.dimensions.map(d => d.id));
    close('section');

    heading(2, 'Birbirinden ayrı üç toplam');
    const measures = [['teacher', 'Öğretmen gerekçe puanı', 8], ['choice', 'Seçenek doğruluğu', 4], ['self', 'Öğrenci özpuanı', 8]];
    table('Öğretmen, seçenek ve özpuan toplamları', ['Ölçüm', 'Eşleşmiş öğrenci (n)', 'Başlangıç ort.', 'Aktarım ort.', 'Ort. fark (son − ilk)'], measures.map(([key, title, max]) => {
      const value = summary.totals[key];
      return [title, String(value.n), value.n ? format(value.preMean) + '/' + max : 'Hesaplanmadı',
        value.n ? format(value.postMean) + '/' + max : 'Hesaplanmadı', value.n ? delta(value.deltaMean) + ' puan' : 'Hesaplanmadı'];
    }));
    paragraph('Öğretmen toplamı, aynı öğrencinin dört boyutunun iki aşamada da puanlanmasını gerektirir. Seçenek doğruluğu 0–4, öğrenci özpuanı 0–8, öğretmen toplamı 0–8 ölçeğindedir; bu üç ölçüm birleştirilmez.');

    open('section', { id: 'report-timing' });
    heading(2, 'Çalışma süreleri');
    const timing = summary.timing;
    if (timing.n) paragraph('Geçerli süre kaydı: ' + timing.n + ' öğrenci. Ortalama: ' + format(timing.mean) + ' dk. En kısa: ' + format(timing.min) + ' dk; en uzun: ' + format(timing.max) + ' dk. 25 dakikada veya önce bitiren: ' + timing.within25 + '/' + timing.n + '. 30 dakikada veya önce bitiren: ' + timing.within30 + '/' + timing.n + '.');
    else paragraph('Geçerli süre kaydı yok; süre ortalaması, aralığı ve eşik karşılaştırmaları hesaplanmadı.');
    table('Sekiz slotun süre durumu', ['Öğrenci', 'Süre / ham giriş', 'Durum'], summary.rows.map(row => {
      const raw = rawText(byId.get(row.id).minutes);
      const duration = !row.valid ? present(raw) ? 'Ham giriş: ' + raw : 'Girilmedi' : row.minutes === null ? 'Girilmedi' : format(row.minutes) + ' dk';
      const status = !row.valid ? 'Hatalı; hesap dışı' : !row.active ? 'Boş slot; öğrenci verisi girilmedi' : row.minutes === null ? 'Süre girilmedi' : 'Geçerli süre';
      return [row.id, duration, status];
    }));
    close('section');

    open('section', { id: 'report-observations' });
    heading(2, 'Takılma gözlemleri ve öğretmen notları');
    const activeRows = summary.rows.filter(row => row.active);
    const observations = activeRows.map(row => ({ row, bottleneck: rawText(byId.get(row.id).bottleneck), notes: rawText(byId.get(row.id).notes) }));
    paragraph('Veri girilen ' + activeRows.length + ' kayıt: takılma gözlemi bulunan ' + observations.filter(item => present(item.bottleneck)).length + ', öğretmen notu bulunan ' + observations.filter(item => present(item.notes)).length + '. Notlar öğretmenin girdiği metinlerdir.');
    if (!activeRows.length) paragraph('Not girilmiş öğrenci kaydı yok.');
    observations.forEach(({ row, bottleneck, notes }) => {
      open('article', { 'data-participant': row.id, class: 'panel' });
      heading(3, row.id + (row.valid ? '' : ' — Hatalı kayıt; sayısal özetten dışlandı'));
      paragraph('Takılma gözlemi', 'note-label'); paragraph(present(bottleneck) ? bottleneck : 'Not girilmedi', 'note-value');
      paragraph('Öğretmen notu', 'note-label'); paragraph(present(notes) ? notes : 'Not girilmedi', 'note-value');
      close('article');
    });
    close('section');

    open('section', { id: 'report-decision' });
    heading(2, 'Öğretmenin oturum kararı');
    paragraph('Öğretmenin bir sonraki ders için yazdığı karar.');
    paragraph(present(conclusion) ? conclusion : 'Karar yazılmadı', 'note-value');
    close('section');

    const text = blocks.map(block => {
      if (block.type === 'open' || block.type === 'close') return null;
      if (block.type === 'table') return block.title + '\n' + block.headers.join(' | ') + '\n' + block.rows.map(row => row.join(' | ')).join('\n');
      return block.text;
    }).filter(value => value !== null).join('\n\n') + '\n';
    const body = blocks.map(block => {
      if (block.type === 'open') return '<' + block.tag + Object.entries(block.attributes).map(([key, value]) => ' ' + key + '="' + escape(value) + '"').join('') + '>';
      if (block.type === 'close') return '</' + block.tag + '>';
      if (block.type === 'heading') return '<h' + block.level + '>' + escape(block.text) + '</h' + block.level + '>';
      if (block.type === 'paragraph') return '<p class="preserve ' + escape(block.className) + '">' + escape(block.text) + '</p>';
      return '<div class="table-scroll" role="region" tabindex="0" aria-label="' + escape(block.title) + '"><table><caption>' + escape(block.title) + '</caption><thead><tr>' + block.headers.map(value => '<th scope="col">' + escape(value) + '</th>').join('') + '</tr></thead><tbody>' + block.rows.map((row, index) => '<tr' + (block.dimensions ? ' data-dimension="' + escape(block.dimensions[index]) + '"' : '') + '>' + row.map((value, i) => i === 0 ? '<th scope="row">' + escape(value) + '</th>' : '<td>' + escape(value) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }).join('\n');
    const html = '<!doctype html>\n<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + escape(TITLE) + '</title><style>' + STYLE + '</style></head><body><main class="report">' + body + '</main></body></html>\n';
    return { summary, text, html };
  }

  return Object.freeze({ build });
});
