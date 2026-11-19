(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.AAWeeksPilotReport = factory(root.AAWeeksPilot);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (model) {
  'use strict';
  if (!model || !model.PILOT_ID) throw new Error('AAWeeksPilot must load before its report module.');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const STYLE = `*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:#f5f6f2;color:#20382c;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Arial,sans-serif}.report{max-width:76rem;margin:auto;padding:clamp(.8rem,3vw,2.5rem)}h1,h2,h3,h4{overflow-wrap:anywhere}h1{font-size:clamp(1.65rem,4vw,2.5rem);line-height:1.2}h2{font-size:1.35rem;margin-top:2rem}h3{font-size:1.1rem}.panel{background:white;border:1px solid #cbd5cb;border-radius:12px;padding:clamp(.8rem,2vw,1.3rem);margin:1rem 0}.preserve{white-space:pre-wrap;overflow-wrap:anywhere}.table-scroll{max-width:100%;overflow-x:auto;border:1px solid #cbd5cb;border-radius:8px;margin:1rem 0}.table-scroll:focus-visible{outline:3px solid #285d44;outline-offset:3px}table{width:100%;min-width:40rem;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{text-align:left;vertical-align:top;padding:.65rem;border-bottom:1px solid #d8dfd5;overflow-wrap:anywhere}[data-numeric]{white-space:nowrap;overflow-wrap:normal;word-break:normal}th{background:#edf2e9}tbody th{min-width:8rem}tr:last-child>*{border-bottom:0}.invalid{border-left:4px solid #9b4c23;padding-left:.7rem}.meta{font-size:.95rem;color:#455847}.label{font-weight:650;margin-bottom:.2rem}.value{margin-top:0}@media(max-width:480px){th,td{padding:.5rem}}@page{margin:14mm}@media print{body{background:white;color:black;font-size:10pt}.report{max-width:none;padding:0}h1{font-size:20pt}h2{font-size:14pt;break-after:avoid}h3,h4{break-after:avoid}.panel{border:1px solid #aaa;border-radius:0;padding:8pt}.table-scroll{overflow:visible;border:0;border-radius:0}table{min-width:0;font-size:9pt}th,td{padding:4pt}tbody th{min-width:0}tr{break-inside:avoid}}`;
  function rawText(value) {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') { try { return JSON.stringify(value); } catch (_) { return '[Invalid circular value]'; } }
    return String(value);
  }
  function get(raw, path) {
    let value = raw;
    for (const key of path.split('.')) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
      value = value[key];
    }
    return value;
  }
  function structure(records) {
    if (!Array.isArray(records) || records.length !== model.IDS.length) throw new Error('Report needs exactly eight P01–P08 records.');
    const byId = new Map();
    for (const record of records) {
      if (!record || typeof record !== 'object' || Array.isArray(record) || !model.IDS.includes(record.id) || byId.has(record.id)) throw new Error('Report participant IDs must be unique P01–P08.');
      byId.set(record.id, record);
    }
    return byId;
  }
  function build(records, options = {}) {
    const byId = structure(records);
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Report options must be an object.');
    const language = options.language === undefined ? 'en' : options.language;
    if (!['en', 'tr'].includes(language)) throw new Error('Report language must be en or tr.');
    const conclusion = options.conclusion === undefined ? '' : options.conclusion, generatedAt = options.generatedAt === undefined ? '' : options.generatedAt;
    if (typeof conclusion !== 'string' || typeof generatedAt !== 'string') throw new Error('Report conclusion and timestamp must be text.');
    const tr = language === 'tr', t = (en, turkish) => tr ? turkish : en;
    const number = new Intl.NumberFormat(tr ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 2 });
    const format = value => value === null || value === undefined ? t('Not calculated', 'Hesaplanmadı') : number.format(value);
    const delta = value => value === null || value === undefined ? format(null) : (value > 0 ? '+' : '') + format(value);
    const missing = t('Not recorded', 'Kaydedilmedi');
    const languages = { en: t('English', 'İngilizce'), tr: t('Turkish', 'Türkçe'), mixed: t('Mixed', 'Karma'), '': missing };
    const supports = { independent: t('Independent', 'Bağımsız'), hint: t('Hint used', 'İpucu kullanıldı'), solution: t('Solution seen', 'Çözüm görüldü'), '': missing };
    const yesNo = { yes: t('Yes', 'Evet'), no: t('No', 'Hayır'), '': missing };
    const summary = model.summarize(records), blocks = [];
    const heading = (level, text) => blocks.push({ type: 'heading', level, text });
    const paragraph = (text, className = '') => blocks.push({ type: 'paragraph', text, className });
    const open = (tag, attributes) => blocks.push({ type: 'open', tag, attributes });
    const close = tag => blocks.push({ type: 'close', tag });
    const table = (caption, headers, rows, dimensions = []) => blocks.push({ type: 'table', caption, headers, rows, dimensions });
    const field = (label, value) => { paragraph(label, 'label'); paragraph(rawText(value).trim() === '' ? missing : rawText(value), 'value preserve'); };
    const title = t('AA · Weeks 1–3 pilot teacher report', 'AA · Hafta 1–3 pilot öğretmen raporu');
    heading(1, title);
    paragraph(model.FORMAT + ' · ' + model.PILOT_ID + ' · ' + t('Task version ', 'Görev sürümü ') + model.TASK_VERSION, 'meta');
    if (generatedAt !== '') paragraph(t('Created: ', 'Oluşturulma bilgisi: ') + generatedAt, 'meta');
    paragraph(t('This 6–8-student pilot describes this group. A before/after difference alone does not establish a learning effect or equivalence of the two language editions.', 'Bu 6–8 öğrencilik pilot yalnız bu grubu betimler. Ön/son fark tek başına öğrenme etkisini veya iki dil sürümünün eşdeğerliğini kanıtlamaz.'));
    paragraph(t('Entered participants: ', 'Veri girilen katılımcı: ') + summary.activeCount + '/8. ' + t('Unused slots: ', 'Kullanılmayan slot: ') + (8 - summary.activeCount) + '/8. ' + t('Complete, valid teacher pairs in all four dimensions: ', 'Dört boyutta öğretmen puanları iki aşamada da tam ve geçerli katılımcı: ') + summary.completeTeacherCount + '.');
    paragraph(t('Missing scores are not zero. Each mean uses the same participants with both scores and evidence, and has its own paired n. Content ratings (0–2) and observed support are recorded separately; support never automatically changes a rating.', 'Eksik puan sıfır değildir. Her ortalama iki puanı ve kanıtı bulunan aynı katılımcılarla hesaplanır ve kendi eşleşmiş n değerini taşır. İçerik puanı (0–2) ve gözlenen destek ayrı kaydedilir; destek bir puanı otomatik değiştirmez.'));
    if (summary.activeCount === 0) paragraph(t('No participant data entered yet.', 'Henüz katılımcı verisi girilmedi.'));

    open('section', { id: 'report-invalid' });
    heading(2, t('Excluded numerical records', 'Sayısal hesap dışında kalan kayıtlar'));
    if (!summary.invalid.length) paragraph(t('No invalid records. An unmatched score is excluded only from its relevant paired calculation.', 'Hatalı kayıt yok. Eşleşmeyen puan yalnız ilgili eşleşmiş hesap dışında kalır.'));
    else {
      paragraph(t('Each invalid record is excluded from all numerical summaries until corrected. Raw observations remain below.', 'Her hatalı kayıt düzeltilene kadar bütün sayısal özetlerden çıkarılır. Ham gözlemler aşağıda korunur.'));
      summary.invalid.forEach(({ id, errors }) => { heading(3, id || '?'); errors.forEach(error => paragraph(error.field + ': ' + model.errorText(error, language), 'invalid')); });
    }
    close('section');

    open('section', { id: 'report-dimensions' });
    heading(2, t('Four evidence-based dimensions', 'Kanıta dayalı dört boyut'));
    table(t('Paired teacher ratings', 'Eşleşmiş öğretmen puanları'),
      [t('Dimension', 'Boyut'), 'n', t('Initial mean /2', 'Ön ort. /2'), t('Transfer mean /2', 'Son ort. /2'), t('Mean change', 'Ort. fark'), t('Increased', 'Artan'), t('Same', 'Aynı'), t('Decreased', 'Azalan'), t('Both independent n', 'İkisi bağımsız n')],
      summary.dimensions.map(d => [d.title[language], String(d.n), format(d.preMean), format(d.postMean), delta(d.deltaMean),
        d.n ? String(d.increased) : '—', d.n ? String(d.unchanged) : '—', d.n ? String(d.decreased) : '—', String(d.independentN)]), summary.dimensions.map(d => d.id));
    paragraph(t('“Both independent n” counts pairs observed as independent at both stages. It is a support description, not a separate effect estimate. The main means include all valid matched content ratings.', '“İkisi bağımsız n” her iki aşaması bağımsız olarak gözlenen eşleşmeleri sayar. Bu bir destek betimlemesidir; ayrı bir etki tahmini değildir. Ana ortalamalar bütün geçerli eşleşmiş içerik puanlarını içerir.'));
    const total = summary.totals.teacher;
    table(t('Four-dimension total', 'Dört boyut toplamı'), ['n', t('Initial mean /8', 'Ön ort. /8'), t('Transfer mean /8', 'Son ort. /8'), t('Mean change', 'Ort. fark')], [[String(total.n), format(total.preMean), format(total.postMean), delta(total.deltaMean)]]);
    paragraph(t('A total pair requires all eight ratings and their evidence. The four dimension-specific sample sizes may differ.', 'Toplam eşleşme için sekiz puan ve kanıtlarının tamamı gerekir. Dört boyutun örneklem büyüklüğü farklı olabilir.'));
    close('section');

    open('section', { id: 'report-languages' });
    heading(2, t('Response language and support', 'Yanıt dili ve destek'));
    table(t('Valid entered participants by response language', 'Yanıt diline göre geçerli veri girilen katılımcılar'), [t('Response language', 'Yanıt dili'), t('Participants', 'Katılımcı')], summary.languages.map(item => [languages[item.id], String(item.n)]));
    table(t('Support observed for scored responses', 'Puanlanan yanıtlarda gözlenen destek'), [t('Stage', 'Aşama'), supports.independent, supports.hint, supports.solution, missing], ['pre', 'post'].map(phase => [t(phase === 'pre' ? 'Initial' : 'Transfer', phase === 'pre' ? 'Ön' : 'Son'), ...['independent', 'hint', 'solution', 'unknown'].map(key => String(summary.support[phase][key]))]));
    paragraph(t('Support counts responses, up to four per participant at each stage; it does not count students. Unrecorded support is not independent work.', 'Destek sayıları katılımcıları değil, her aşamada kişi başına en çok dört yanıtı sayar. Kaydedilmeyen destek bağımsız çalışma sayılmaz.'));
    const practice = summary.practice;
    paragraph(t('Practice hints observed for ', 'Rehberli çalışmada ipucu kaydı bulunan ') + practice.hintsN + t(' participant(s); total hints: ', ' katılımcı; toplam ipucu: ') + (practice.hintsN ? practice.hintsTotal : format(null)) + '. ' + t('Solution seen: ', 'Çözüm görüldü: ') + practice.solutionYes + '; ' + t('not seen: ', 'görülmedi: ') + practice.solutionNo + '; ' + t('unrecorded: ', 'kaydedilmedi: ') + practice.solutionUnknown + '.');
    close('section');

    open('section', { id: 'report-timing' });
    heading(2, t('Observed durations', 'Gözlenen süreler'));
    paragraph(t('Plan: 5 + 10 + 7 + 3 = 25 minutes. A total is calculated only when all four phase durations are observed. Partial durations are retained and have their own phase n.', 'Plan: 5 + 10 + 7 + 3 = 25 dakika. Toplam yalnız dört aşamanın süresi de gözlendiğinde hesaplanır. Kısmi süreler korunur ve her aşamanın kendi n değeri vardır.'));
    if (summary.timing.n) paragraph(t('Complete duration records: ', 'Tam süre kaydı: ') + summary.timing.n + '. ' + t('Mean: ', 'Ortalama: ') + format(summary.timing.mean) + t(' min; range: ', ' dk; aralık: ') + format(summary.timing.min) + '–' + format(summary.timing.max) + '. ' + t('Finished within 25 minutes: ', '25 dakikada veya önce bitiren: ') + summary.timing.within25 + '/' + summary.timing.n + '.');
    else paragraph(t('No complete duration record; total mean and the 25-minute comparison are not calculated.', 'Tam süre kaydı yok; toplam ortalaması ve 25 dakika karşılaştırması hesaplanmadı.'));
    table(t('Phase durations in minutes', 'Dakika olarak aşama süreleri'), [t('Phase', 'Aşama'), t('Planned', 'Plan'), 'n', t('Mean', 'Ortalama'), t('Minimum', 'En az'), t('Maximum', 'En çok')], summary.timing.phases.map(phase => [phase.title[language], String(phase.plannedMinutes), String(phase.n), format(phase.mean), format(phase.min), format(phase.max)]));
    table(t('Participant totals and partial observations', 'Katılımcı toplamları ve kısmi gözlemler'), [t('ID', 'Kod'), t('Complete total (min)', 'Tam toplam (dk)'), t('Observed phases sum (min)', 'Gözlenen aşamalar toplamı (dk)'), t('Missing phases', 'Eksik aşamalar'), t('Status', 'Durum')], summary.rows.map(row => [row.id, format(row.minutes), format(row.observedMinutes), row.missingTimePhases.map(id => model.PHASES.find(phase => phase.id === id).title[language]).join(', ') || '—', !row.valid ? t('Invalid; excluded', 'Hatalı; hesap dışı') : !row.active ? t('Unused slot', 'Kullanılmayan slot') : t('Valid draft', 'Geçerli taslak')]));
    close('section');

    open('section', { id: 'report-observations' });
    heading(2, t('Evidence, support and bottlenecks', 'Kanıt, destek ve takılma noktaları'));
    for (const row of summary.rows.filter(row => row.active)) {
      const raw = byId.get(row.id);
      open('article', { class: 'panel', 'data-participant': row.id }); heading(3, row.id);
      if (!row.valid) paragraph(t('Invalid record; excluded from numerical summaries. Values below are raw entries.', 'Hatalı kayıt; sayısal özetlerden çıkarıldı. Aşağıdaki değerler ham girişlerdir.'), 'invalid');
      const responseLanguage = rawText(get(raw, 'language'));
      field(t('Response language', 'Yanıt dili'), languages[responseLanguage] || responseLanguage);
      for (const { id, title } of model.PHASES) {
        field(title[language] + t(' · observed minutes', ' · gözlenen dakika'), get(raw, 'timing.' + id));
        field(title[language] + t(' · bottleneck', ' · takılma noktası'), get(raw, 'bottlenecks.' + id));
      }
      field(t('Practice hints (0–3)', 'Rehberli çalışma ipuçları (0–3)'), get(raw, 'practice.hints'));
      const solution = rawText(get(raw, 'practice.solutionSeen'));
      field(t('Practice solution seen', 'Rehberli çalışmada çözüm görüldü'), yesNo[solution] || solution);
      for (const { id, title } of model.DIMENSIONS) {
        heading(4, title[language]);
        for (const phase of ['pre', 'post']) {
          const suffix = phase === 'pre' ? 'Pre' : 'Post', phaseName = phase === 'pre' ? t('Initial', 'Ön') : t('Transfer', 'Son');
          field(phaseName + t(' · rating /2', ' · puan /2'), get(raw, 'teacher.' + id + '.' + phase));
          field(phaseName + t(' · evidence', ' · kanıt'), get(raw, 'teacher.' + id + '.evidence' + suffix));
          const support = rawText(get(raw, 'teacher.' + id + '.support' + suffix));
          field(phaseName + t(' · support', ' · destek'), supports[support] || support);
        }
      }
      field(t('Teacher notes', 'Öğretmen notları'), get(raw, 'notes')); close('article');
    }
    close('section');
    open('section', { id: 'report-decision' }); heading(2, t('Next lesson decision', 'Sonraki ders için karar'));
    paragraph(conclusion.trim() === '' ? t('No decision recorded.', 'Karar kaydedilmedi.') : conclusion, 'preserve'); close('section');
    paragraph(t('Keep the CSV as well to resume assessment. This HTML report is an offline snapshot, not an editable data file.', 'Değerlendirmeye devam etmek için CSV dosyasını da sakla. Bu HTML raporu çevrimdışı bir görüntüdür; düzenlenebilir veri dosyası değildir.'));
    const htmlBody = [], text = [];
    for (const block of blocks) {
      if (block.type === 'heading') { htmlBody.push('<h' + block.level + '>' + escape(block.text) + '</h' + block.level + '>'); text.push(block.text, ''); }
      else if (block.type === 'paragraph') { htmlBody.push('<p' + (block.className ? ' class="' + escape(block.className) + '"' : '') + '>' + escape(block.text) + '</p>'); text.push(block.text, ''); }
      else if (block.type === 'open') htmlBody.push('<' + block.tag + Object.entries(block.attributes || {}).map(([key, value]) => ' ' + key + '="' + escape(value) + '"').join('') + '>');
      else if (block.type === 'close') htmlBody.push('</' + block.tag + '>');
      else if (block.type === 'table') {
        htmlBody.push('<div class="table-scroll" role="region" tabindex="0" aria-label="' + escape(block.caption) + '"><table><caption>' + escape(block.caption) + '</caption><thead><tr>' + block.headers.map(value => '<th scope="col">' + escape(value) + '</th>').join('') + '</tr></thead><tbody>');
        block.rows.forEach((row, index) => htmlBody.push('<tr' + (block.dimensions[index] ? ' data-dimension="' + escape(block.dimensions[index]) + '"' : '') + '>' + row.map((value, cell) => {
          const numeric = /^[+-]?\d+(?:[.,]\d+)?(?:\/(?:2|8))?$/.test(String(value)) ? ' data-numeric="true"' : '';
          return cell === 0 ? '<th scope="row"' + numeric + '>' + escape(value) + '</th>' : '<td' + numeric + '>' + escape(value) + '</td>';
        }).join('') + '</tr>'));
        htmlBody.push('</tbody></table></div>'); text.push(block.caption, block.headers.join(' | '), ...block.rows.map(row => row.join(' | ')), '');
      }
    }
    return { summary, text: text.join('\n'), html: '<!doctype html>\n<html lang="' + language + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>' + escape(title) + '</title><style>' + STYLE + '</style></head><body><main class="report">' + htmlBody.join('\n') + '</main></body></html>\n' };
  }
  return Object.freeze({ build });
});
