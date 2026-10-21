(function () {
  'use strict';
  const model = window.AAWeekThree;
  if (!model || typeof model.traceSearch !== 'function') return;
  const $ = id => document.getElementById(id);
  const directory = [4, 7, 11, 18, 24, 31, 42, 56];
  const cases = { worked: 42, first: 4, guided: 11, missing: 5, last: 56, empty: 42 };
  let trace, revealed = 0, solutionSeen = false;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function range(left, right) {
    return left <= right ? left + '–' + right : 'boş (sol ' + left + ', sağ ' + right + ')';
  }

  function renderSearch() {
    const last = revealed ? trace.steps[revealed - 1] : null;
    const left = last ? last.nextLeft : 1;
    const right = last ? last.nextRight : trace.values.length;
    const done = revealed === trace.probes;
    const board = $('search-records');
    board.replaceChildren();
    $('search-target').textContent = 'Hedef: ' + trace.target + '. n = ' + trace.values.length + ' kayıt. ' + (trace.mode === 'binary' ? 'Ortayı aşağı yuvarla.' : 'Eşleşene veya sona kadar soldan ilerle.');
    if (!trace.values.length) {
      const empty = el('p', 'Rehber boş. Yoklanacak konum yok.');
      empty.className = 'empty-directory';
      board.append(empty);
    }
    trace.values.forEach((value, i) => {
      const position = i + 1;
      const record = el('div');
      record.className = 'directory-record';
      record.dataset.position = String(position);
      const eliminated = position < left || position > right;
      const current = last && last.position === position;
      const matched = current && last.relation === 0;
      if (eliminated) record.classList.add('is-eliminated');
      if (current) record.classList.add('is-current');
      if (matched) record.classList.add('is-match');
      record.append(el('small', 'konum ' + position), el('b', String(value)));
      record.setAttribute('aria-label', 'Konum ' + position + ', değer ' + value + (matched ? ', bulundu.' : eliminated ? ', elendi.' : current ? ', son yoklama.' : ', aday.'));
      board.append(record);
    });
    const history = $('search-history');
    history.replaceChildren();
    trace.steps.slice(0, revealed).forEach(step => {
      const relation = step.relation < 0 ? '<' : step.relation > 0 ? '>' : '=';
      const text = 'Aralık ' + range(step.left, step.right) + '. ' + (trace.mode === 'binary' ? 'Orta konum ' : 'Konum ') + step.position + ': ' + step.value + ' ' + relation + ' ' + trace.target + '. ' + (step.relation === 0 ? 'Bulundu; dur.' : 'Yeni aralık ' + range(step.nextLeft, step.nextRight) + '.');
      const item = el('li', text);
      item.dataset.position = String(step.position);
      history.append(item);
    });
    $('search-count').textContent = revealed + ' yoklama';
    $('search-next').disabled = done;
    let status = 'Henüz yoklama yapılmadı. İlk konumu tahmin et, sonra bir yoklama aç.';
    if (!trace.values.length) status = 'Boş rehber: sonuç yok, 0 yoklama. Başlangıçta sol 1, sağ 0; aday kalmadı.';
    else if (done) status = trace.position === null
      ? 'Aralık boşaldı. Sonuç: yok. Toplam ' + revealed + ' yoklama.'
      : 'Bulundu. Sonuç: konum ' + trace.position + '. Toplam ' + revealed + ' yoklama. Arama durdu.';
    else if (last) status = 'Son yoklama konum ' + last.position + '. Kalan aday aralığı ' + range(left, right) + '. Sıradaki konumu sen hesapla.';
    $('search-status').textContent = status;
  }

  function resetSearch() {
    const selected = $('search-case').value;
    trace = model.traceSearch(selected === 'empty' ? [] : directory, cases[selected], $('search-mode').value);
    revealed = 0;
    renderSearch();
  }

  function renderGrowth() {
    const counts = model.growth(Number($('growth-n').value));
    $('growth-input').textContent = 'Girdi: n = ' + counts.n + ' → ' + counts.doubleN + ' kayıt.';
    $('growth-linear').textContent = counts.linear + ' → ' + counts.linearAtDouble + ' kontrol';
    $('growth-quadratic').textContent = counts.quadratic + ' → ' + counts.quadraticAtDouble + ' kontrol';
    $('growth-status').textContent = 'Aynı raporun girdi boyutunu büyüttük. İki farklı raporu birbirinin yerine koymadık.';
  }

  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid));
    return { id, value, valid };
  }

  function feedback(id, text, error) {
    $(id).textContent = text;
    $(id).dataset.state = error ? 'error' : 'ok';
  }

  $('growth-n').addEventListener('change', renderGrowth);
  $('search-case').addEventListener('change', resetSearch);
  $('search-mode').addEventListener('change', resetSearch);
  $('search-next').addEventListener('click', () => { if (revealed < trace.probes) { revealed++; renderSearch(); } });
  $('search-reset').addEventListener('click', resetSearch);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const position = number('guided-position', 1, 8), probes = number('guided-probes', 0, 8);
    const invalid = [position, probes].find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'İki kutuyu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const expected = model.traceSearch(directory, 11, 'binary');
    if (position.value === expected.position && probes.value === expected.probes) {
      feedback('guided-feedback', 'İki sayı da doğru. Aralık izini ve doğrusal aramayla karşılaştırmanı ayrıca çözümle denetle; yazılı gerekçen otomatik puanlanmadı.', false);
    } else {
      feedback('guided-feedback', position.value !== expected.position
        ? 'Sonuç, hedef kimliğin bu verilen rehberdeki konumudur. Kimliği, konumu ve yoklama sayısını ayırıp yeniden bak.'
        : 'İlk yoklamayı ve eşleşen son yoklamayı da say. Aralık 1–3 olduktan sonra ortayı yeniden hesapla.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = [3, 8, 12, 17, 23, 30, 41];
    const binary = model.traceSearch(values, 30, 'binary');
    const linear = model.traceSearch(values, 30, 'linear');
    const checks = [
      { ...number('exit-position', 1, 7), expected: binary.position, label: 'sonuç konumu' },
      { ...number('exit-binary', 0, 7), expected: binary.probes, label: 'ikili yoklama sayısı' },
      { ...number('exit-linear', 0, 7), expected: linear.probes, label: 'doğrusal yoklama sayısı' },
      { ...number('exit-square', 0, 100), expected: model.growth(values.length).quadratic, label: 'n² raporunun sayımı' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const seen = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Konumla yapılan yoklama sayısını ayır; tam tablo farklı bir rapordur.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written
        ? 'Bu kontrol yazılı gerekçelerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.'
        : 'Aralık izini ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + seen, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. Çözümü görmeden yazdıklarınla sonraki düzeltmelerini ayrı değerlendir.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => {
      $(output).textContent = '';
      if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid');
    });
  }
  const worked = document.querySelector('.worked-table');
  worked.open = false;
  let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  document.querySelectorAll('.js-only').forEach(node => {
    node.hidden = false;
    if (node.tagName === 'BUTTON') node.disabled = false;
  });
  renderGrowth();
  resetSearch();
})();
