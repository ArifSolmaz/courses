(function () {
  'use strict';
  const model = window.AAWeekTwo;
  if (!model || typeof model.traceWork !== 'function') return;
  const $ = id => document.getElementById(id);
  const values = [18, 7, 18, 24, 11, 20];
  let work, revealed = 0, solutionSeen = false;
  const checkpoint = window.AAWeekTwoCheckpoint ? window.AAWeekTwoCheckpoint.create({
    advance() { if (revealed < work.steps.length) { revealed++; render(); } },
    refresh() { render(); }
  }) : null;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function comparison(step) {
    const left = values[step.i - 1];
    const right = work.mode === 'nested' ? values[step.j - 1] : step.pass === 2 ? 24 : 7;
    return { left, right, equal: left === right };
  }

  function render() {
    const n = work.n, mode = work.mode, done = revealed === work.steps.length;
    $('work-records').textContent = 'Kayıtlar: [' + values.slice(0, n).join(', ') + ']. n = ' + n + '.';
    $('work-task').textContent = mode === 'nested'
      ? 'Her satır konumunu her sütun konumuyla karşılaştır. Kendisiyle ve ters yöndeki çiftler dahil.'
      : mode === 'sequential'
        ? "Önce bütün kayıtları 7 ile, sonra bütün kayıtları 24 ile karşılaştır. Eşleşme bulunca durma."
        : 'Her kaydı 7 ile bir kez karşılaştır. Bütün kayıtlar için sonuç gerekiyor; eşleşme bulunca durma.';
    const board = $('work-board');
    board.replaceChildren();
    board.style.gridTemplateColumns = 'repeat(' + Math.max(1, n) + ', minmax(48px, 1fr))';
    if (!n) {
      const empty = el('p', 'Boş listede doldurulacak kayıt veya hücre yok.');
      empty.className = 'empty-board'; board.append(empty);
    }
    work.steps.forEach((step, index) => {
      if (index % n === 0) {
        const label = el('div', mode === 'nested' ? 'Satır i = ' + step.i
          : 'Tur ' + step.pass + ' · hedef ' + (step.pass === 2 ? 24 : 7));
        label.className = 'row-label'; board.append(label);
      }
      const cell = el('div'), name = mode === 'nested' ? '(' + step.i + ',' + step.j + ')' : 'konum ' + step.i;
      cell.className = 'work-cell';
      cell.dataset.step = String(index + 1);
      cell.append(el('small', name));
      if (index < revealed) {
        const result = comparison(step);
        cell.classList.add('counted');
        if (result.equal) cell.classList.add('equal');
        if (index + 1 === revealed) cell.classList.add('current');
        cell.append(el('b', result.equal ? '=' : '≠'));
        cell.setAttribute('aria-label', name + ': ' + result.left + (result.equal ? ' eşittir ' : ' eşit değildir ') + result.right + '; bir kontrol yapıldı.');
      } else {
        cell.append(el('b', '?'));
        cell.setAttribute('aria-label', name + ': henüz kontrol edilmedi.');
      }
      board.append(cell);
    });
    $('work-next').disabled = done;
    $('work-count').textContent = revealed + ' eşitlik kontrolü';
    let status;
    if (!n) status = 'n = 0. Hiçbir eşitlik kontrolü yapılmadı. Toplam 0.';
    else if (!revealed) status = 'Henüz bir eşitlik kontrolü yapılmadı. Önce kaç kontrol beklediğini tahmin et, sonra ilk hücreyi aç.';
    else {
      const last = work.steps[revealed - 1], result = comparison(last);
      status = (mode === 'nested' ? 'Son çift (' + last.i + ',' + last.j + ')' : 'Tur ' + last.pass + ', konum ' + last.i)
        + ': ' + result.left + (result.equal ? ' = ' : ' ≠ ') + result.right + '. Sayaca bir eklendi.';
      if (done) status += ' Rapor tamamlandı. Toplam ' + revealed + ' eşitlik kontrolü.';
      else {
        const next = work.steps[revealed];
        if (!(checkpoint && mode === 'nested' && n >= 2 && revealed === n)) {
          status += mode === 'nested' ? ' Sıradaki çift (' + next.i + ',' + next.j + ').'
            : ' Sırada tur ' + next.pass + ', konum ' + next.i + ' var.';
        }
        if (result.equal) status += ' Eşleşme raporun yalnız bir hücresi; diğer sonuçlar için devam ediyoruz.';
      }
    }
    $('work-status').textContent = status;
    if (checkpoint) checkpoint.update(work, revealed);
  }

  function reset() {
    work = model.traceWork(Number($('work-n').value), $('work-mode').value);
    revealed = 0;
    if (checkpoint) checkpoint.reset();
    render();
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

  $('work-n').addEventListener('change', reset);
  $('work-mode').addEventListener('change', reset);
  $('work-next').addEventListener('click', () => { if ((!checkpoint || !checkpoint.blocked()) && revealed < work.steps.length) { revealed++; render(); } });
  $('work-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const seq = number('guided-seq', 0, 100), nested = number('guided-nested', 0, 100);
    if (!seq.valid || !nested.valid) {
      feedback('guided-feedback', 'İki kutuyu da 0–100 arasında tam sayıyla doldur.', true);
      $(!seq.valid ? seq.id : nested.id).focus(); return;
    }
    const seqCount = model.traceWork(3, 'sequential').count, nestedCount = model.traceWork(3, 'nested').count;
    if (seq.value === seqCount && nested.value === nestedCount) {
      feedback('guided-feedback', 'İki sayı da doğru. Gerekçeni ayrıca denetle: iki tam turu topladın mı, üç satırın her birindeki üç kontrolü çarptın mı?', false);
    } else {
      const hint = seq.value !== seqCount ? 'Ardışık düzende ilk tam tarama bitince ikinci tam tarama başlıyor. İki turun sayımını topla.'
        : 'İç içe düzende üç ayrı satırın her birinde üç hücre kontrol ediliyor. Yalnız eşit çıkan hücreleri sayma.';
      feedback('guided-feedback', hint + ' Yeniden dene.', true);
    }
  });

  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const pairs = model.traceWork(3, 'nested').count;
    const total = pairs + model.traceWork(3, 'single').count;
    const doubled = model.traceWork(6, 'nested').count + model.traceWork(6, 'single').count;
    const checks = [
      { ...number('exit-n', 0, 12), expected: 3, label: 'kayıt sayısı n' },
      { ...number('exit-pairs', 0, 200), expected: pairs, label: 'tam tablodaki kontroller' },
      { ...number('exit-total', 0, 200), expected: total, label: 'iki bölümün toplamı' },
      { ...number('exit-double', 0, 200), expected: doubled, label: 'altı kayıt için toplam' }
    ];
    const invalid = checks.find(x => !x.valid);
    if (invalid) {
      feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(x => x.value !== x.expected);
    const seen = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(x => x.label).join(', ') + '. Bir tam taramanın ve tam tablonun yaptığı işi ayrı say, sonra topla.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written
        ? 'Bu kontrol formülünün veya yazılı gerekçelerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.'
        : 'İzleme, formül ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + seen, false);
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
    if (node.matches('button[type="submit"]')) node.disabled = false;
  });
  document.documentElement.classList.add('lesson-ready');
  reset();
})();
