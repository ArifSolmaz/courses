(function () {
  'use strict';
  const model = window.AAWeekOne;
  if (!model || typeof model.trace !== 'function') return;
  const $ = id => document.getElementById(id);
  const cases = {
    worked: { values: [18, 7, 18, 24], target: 24 },
    early: { values: [18, 7, 18, 24], target: 7 },
    duplicate: { values: [18, 7, 18, 24], target: 18 },
    absent: { values: [18, 7, 18, 24], target: 99 },
    empty: { values: [], target: 24 }
  };
  let trace, revealed = 0;
  let solutionSeen = false;

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderTrace() {
    const finished = revealed === trace.steps.length;
    $('trace-target').textContent = String(trace.target);
    $('trace-count').textContent = revealed + ' eşitlik kontrolü';
    $('trace-next').disabled = finished;
    const records = $('trace-records');
    records.replaceChildren();
    records.setAttribute('aria-label', trace.values.length
      ? trace.values.map((value, i) => 'Konum ' + (i + 1) + ': ' + value).join('; ')
      : 'Boş liste');
    if (!trace.values.length) records.append(element('p', 'Boş liste · hiç kayıt yok.'));
    trace.values.forEach((value, i) => {
      const card = element('div');
      card.append(element('small', 'konum ' + (i + 1)), element('b', String(value)));
      if (revealed && i + 1 === revealed) card.classList.add(finished && trace.position !== null ? 'is-match' : 'is-current');
      records.append(card);
    });
    const rows = $('trace-rows');
    rows.replaceChildren();
    if (!revealed) {
      const row = element('tr'), cell = element('td', trace.values.length ? 'Henüz bir değere bakmadık.' : 'Bakılacak kayıt yok.');
      cell.colSpan = 4;
      row.append(cell); rows.append(row);
    }
    trace.steps.slice(0, revealed).forEach(step => {
      const row = element('tr');
      const decision = step.equal ? step.position + ' sonucunu ver ve dur.'
        : step.position === trace.values.length ? 'Liste bitti. “Yok” sonucunu ver.'
          : 'Sonraki konuma geç: ' + (step.position + 1) + '.';
      [step.position, step.value, step.equal ? 'Evet' : 'Hayır', decision].forEach(text => row.append(element('td', String(text))));
      rows.append(row);
    });
    let status;
    if (!trace.values.length) status = 'Liste boş. Hiçbir değeri karşılaştırmadan “yok” sonucu verildi. 0 eşitlik kontrolü.';
    else if (!revealed) status = 'Başlangıç: bakılacak konum 1. Henüz bir değer–hedef karşılaştırması yapılmadı.';
    else if (finished && trace.position !== null) status = 'Bulundu: ilk eşleşme konum ' + trace.position + '. Sonuç ' + trace.position + '. Arama durdu; sonraki kayıtlara bakılmıyor.';
    else if (finished) status = 'Bütün ' + trace.values.length + ' kayıt kontrol edildi. Hiçbiri hedef değil. Sonuç: “yok”.';
    else status = 'Konum ' + revealed + ' hedef değil. Önceki kayıtların hepsini eledik. Sırada konum ' + (revealed + 1) + ' var.';
    $('trace-status').textContent = status;
  }

  function resetTrace() {
    const selected = cases[$('trace-case').value] || cases.worked;
    trace = model.trace(selected.values, selected.target);
    revealed = 0;
    renderTrace();
  }

  function numeric(id, min, max) {
    const input = $(id), raw = input.value.trim();
    const value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid));
    return { valid, value };
  }

  function feedback(id, text, error) {
    const node = $(id);
    node.textContent = text;
    node.dataset.state = error ? 'error' : 'ok';
  }

  $('trace-case').addEventListener('change', resetTrace);
  $('trace-next').addEventListener('click', () => {
    if (revealed < trace.steps.length) { revealed++; renderTrace(); }
  });
  $('trace-reset').addEventListener('click', resetTrace);

  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const position = numeric('guided-position', 1, 4), count = numeric('guided-count', 0, 4);
    if (!position.valid || !count.valid) {
      feedback('guided-feedback', 'İki kutuyu da doldur. Konum 1–4, kontrol sayısı 0–4 arasında tam sayı olmalı.', true);
      (!position.valid ? $('guided-position') : $('guided-count')).focus();
      return;
    }
    const expected = model.trace([12, 5, 19, 5], 19);
    if (position.value === expected.position && count.value === expected.comparisons) {
      feedback('guided-feedback', 'İki sayı da doğru. Şimdi gerekçeni kontrol et: ilk eşleşmeyi bulunca durma kararı, dördüncü kayda bakmamayı açıklıyor mu?', false);
    } else {
      const hint = position.value !== expected.position
        ? 'Hedef değer ile konumu ayır: üçüncü satırdaki eşitlik kararından hangi konum çıkmalı?'
        : 'Yalnız değer–hedef eşitlik kontrollerini say. Durduğun satır da sayaca dahil.';
      feedback('guided-feedback', hint + ' Tabloya dönüp yeniden dene.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const checks = [
      ['exit-position', 1, 4, 2, 'ilk konum'],
      ['exit-count', 0, 4, 2, 'kontrol sayısı'],
      ['exit-length', 0, 12, 4, 'n'],
      ['exit-last', 1, 4, 4, 'son konum']
    ].map(([id, min, max, expected, label]) => ({ id, expected, label, ...numeric(id, min, max) }));
    const invalid = checks.find(x => !x.valid);
    if (invalid) {
      feedback('exit-feedback', 'Dört sayı kutusunu da uygun tam sayıyla doldur. Eksik veya aralık dışında kalan kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(x => x.value !== x.expected);
    const seen = solutionSeen ? ' Model yanıtı açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(x => x.label).join(', ') + '. Konum, kimlik ve kayıt sayısının hangi soruyu cevapladığını ayır.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written
        ? 'Bu sayısal kontrol gerekçelerinin doğruluğunu ölçmedi; onları örnek yanıt ve dört ayrı ölçütle karşılaştır.'
        : 'İzleme tablonu ve açık uçlu gerekçelerini de tamamla; yalnız sayılar dersin bütün hedeflerini göstermiyor.') + seen, false);
    }
  });

  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. Çözümü görmeden ürettiğin yanıtlarla sonraki düzeltmelerini ayrı değerlendir.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => {
      $(output).textContent = '';
      if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
    });
  }
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; });
  const worked = document.querySelector('.worked-table');
  worked.open = false;
  let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  document.documentElement.classList.add('lesson-ready');
  resetTrace();
})();
