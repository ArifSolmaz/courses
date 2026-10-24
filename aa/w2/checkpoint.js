(function () {
  'use strict';
  const tr = document.documentElement.lang === 'tr';
  const words = tr ? {
    pause: n => 'İlk satır tamamlandı: ' + n + ' kontrol. Sonraki kontrolü açmadan önce aşağıdaki tahminini yaz.',
    context: n => 'n = ' + n + '. İlk satır bitti; sayaç ' + n + '. Sıradaki kontrol için tahmin et.',
    invalid: 'Dört alanı da doldur. i ve j için 1–n, sayaç için 0–n² arasında tam sayı kullan; eşitlik sonucunu da seç.',
    correct: 'Tahminindeki dört alan gerçek adımla eşleşiyor. Şimdi geçişin nedenini kendi cümlenle açıkla.',
    different: 'Gerçek adımla farklı olan tahmin alanları: ',
    labels: ['i', 'j', 'eşitlik sonucu', 'sayaç'],
    actual: n => 'Çalıştırılan adım: (i, j) = (2, 1). Konum 2’deki 7 ile konum 1’deki 18 karşılaştırıldı: 7 ≠ 18. Bir hücre dolduruldu; sayaç ' + n + ' → ' + (n + 1) + '.',
    hints: [
      'İlk satır bitince dış döngü ikinci satıra geçer: i = 2.',
      'İç döngü her yeni satırda ilk sütundan başlar: j = 1. Önceki satırın son j değerinden sürmez.',
      'Konum ile değeri ayır: konum 2’de 7, konum 1’de 18 var. Bu iki kimlik farklı.',
      'Bir eşitlik sorusu daha sorulduğu için sayaç bir artar. “Farklı” sonucu da bir kontroldür; burada döngü koşullarını saymıyoruz.'
    ],
    support: used => 'Çalıştırmadan önce ipucu: ' + (used ? 'açıldı.' : 'açılmadı.') + ' İpucu kullanımı tahminin doğruluğundan ayrı tutulur.',
    hintOpen: 'İpucu açık',
    explainMissing: 'Karşılaştırmadan önce kendi açıklamanı yaz. Emin değilsen “bilmiyorum” yazıp model açıklamayla karşılaştırabilirsin.',
    ungraded: 'Gerekçen otomatik puanlanmadı. Yazdığını aşağıdaki açıklamayla karşılaştır; hazır olduğunda “Bir kontrol yap” ile sürdür.'
  } : {
    pause: n => 'The first row is complete: ' + n + ' checks. Write your prediction below before revealing the next check.',
    context: n => 'n = ' + n + '. The first row is complete; the counter is ' + n + '. Predict the next check.',
    invalid: 'Complete all four fields. Use integers from 1–n for i and j, and 0–n² for the counter; also choose the equality result.',
    correct: 'All four prediction fields match the actual step. Now explain the transition in your own words.',
    different: 'Prediction fields that differ from the actual step: ',
    labels: ['i', 'j', 'equality result', 'counter'],
    actual: n => 'Step executed: (i, j) = (2, 1). Compare 7 at position 2 with 18 at position 1: 7 ≠ 18. One cell was filled; counter ' + n + ' → ' + (n + 1) + '.',
    hints: [
      'After the first row ends, the outer loop moves to the second row: i = 2.',
      'The inner loop starts at the first column for each new row: j = 1. It does not continue from the previous row’s final j.',
      'Distinguish positions from values: position 2 contains 7; position 1 contains 18. The two IDs differ.',
      'One more equality question adds one to the counter. A “different” result is also a check; loop-condition checks are outside this counter.'
    ],
    support: used => 'Hint before running: ' + (used ? 'opened.' : 'not opened.') + ' Hint use is kept separate from prediction correctness.',
    hintOpen: 'Hint is open',
    explainMissing: 'Write your own explanation before comparing. If you are unsure, write “I don’t know” and compare with the model explanation.',
    ungraded: 'Your explanation has not been automatically graded. Compare it with the explanation below; when ready, continue with “Make one check”.'
  };

  function create(options) {
    const $ = id => document.getElementById(id);
    const panel = $('row-checkpoint');
    if (!panel) return null;
    const fields = ['predict-i', 'predict-j', 'predict-relation', 'predict-count'].map($);
    let phase = 'waiting', work = null, hintUsed = false;

    function message(id, text, error) {
      $(id).textContent = text;
      $(id).dataset.state = error ? 'error' : 'ok';
    }

    function reset() {
      phase = 'waiting'; work = null; hintUsed = false;
      panel.dataset.phase = phase;
      panel.hidden = true;
      $('prediction-form').reset();
      fields.forEach(field => {
        field.disabled = false;
        field.removeAttribute('aria-invalid');
      });
      $('checkpoint-explanation').value = '';
      $('checkpoint-explanation').readOnly = false;
      $('checkpoint-explanation').removeAttribute('aria-invalid');
      for (const id of ['checkpoint-feedback', 'checkpoint-actual', 'checkpoint-explain-feedback']) $(id).textContent = '';
      for (const id of ['checkpoint-hint-text', 'checkpoint-explain', 'checkpoint-model']) $(id).hidden = true;
      $('checkpoint-differences').replaceChildren();
      $('checkpoint-run').disabled = false;
      $('checkpoint-hint').disabled = false;
      $('checkpoint-compare').hidden = false;
      $('checkpoint-hint').textContent = $('checkpoint-hint').dataset.label;
      $('checkpoint-support').textContent = words.support(false);
    }

    function blocked() { return phase === 'predict' || phase === 'explain'; }

    function update(nextWork, revealed) {
      work = nextWork;
      if (phase === 'waiting' && work.mode === 'nested' && work.n >= 2 && revealed === work.n) {
        phase = 'predict'; panel.dataset.phase = phase; panel.hidden = false;
        $('checkpoint-context').textContent = words.context(work.n);
        $('predict-i').max = $('predict-j').max = String(work.n);
        $('predict-count').max = String(work.n * work.n);
        fields[0].focus();
      }
      if (phase === 'predict') $('work-status').textContent = words.pause(work.n);
      if (blocked()) $('work-next').disabled = true;
    }

    $('prediction-form').addEventListener('submit', event => {
      event.preventDefault();
      if (phase !== 'predict') return;
      const expected = [2, 1, 'different', work.n + 1];
      const results = fields.map((field, index) => {
        const raw = field.value.trim(), value = index === 2 ? raw : Number(raw);
        const valid = index === 2 ? ['equal', 'different'].includes(raw)
          : raw !== '' && !field.validity.badInput && Number.isSafeInteger(value)
            && value >= Number(field.min) && value <= Number(field.max);
        field.setAttribute('aria-invalid', String(!valid));
        return { field, valid, correct: value === expected[index] };
      });
      const invalid = results.find(result => !result.valid);
      if (invalid) {
        message('checkpoint-feedback', words.invalid, true);
        invalid.field.focus(); return;
      }
      const wrong = results.map((result, index) => result.correct ? -1 : index).filter(index => index >= 0);
      message('checkpoint-feedback', wrong.length
        ? words.different + wrong.map(index => words.labels[index]).join(', ') + '.' : words.correct, wrong.length > 0);
      $('checkpoint-differences').replaceChildren();
      wrong.forEach(index => {
        const li = document.createElement('li'); li.textContent = words.hints[index];
        $('checkpoint-differences').append(li);
      });
      fields.forEach(field => { field.disabled = true; field.removeAttribute('aria-invalid'); });
      $('checkpoint-run').disabled = true;
      $('checkpoint-hint').disabled = true;
      $('checkpoint-actual').textContent = words.actual(work.n);
      $('checkpoint-explain').hidden = false;
      phase = 'explain'; panel.dataset.phase = phase;
      options.advance();
      $('checkpoint-explanation').focus();
    });

    $('checkpoint-hint').addEventListener('click', () => {
      if (phase !== 'predict') return;
      hintUsed = true;
      $('checkpoint-hint-text').hidden = false;
      $('checkpoint-hint').textContent = words.hintOpen;
      $('checkpoint-hint').disabled = true;
      $('checkpoint-support').textContent = words.support(hintUsed);
    });

    $('checkpoint-compare').addEventListener('click', () => {
      if (phase !== 'explain') return;
      const input = $('checkpoint-explanation');
      if (!input.value.trim()) {
        input.setAttribute('aria-invalid', 'true');
        message('checkpoint-explain-feedback', words.explainMissing, true);
        input.focus(); return;
      }
      input.readOnly = true;
      input.removeAttribute('aria-invalid');
      $('checkpoint-model').hidden = false;
      $('checkpoint-compare').hidden = true;
      message('checkpoint-explain-feedback', words.ungraded, false);
      phase = 'review'; panel.dataset.phase = phase;
      options.refresh();
      $('checkpoint-model-title').focus();
    });

    $('checkpoint-explanation').addEventListener('input', () => {
      $('checkpoint-explanation').removeAttribute('aria-invalid');
      $('checkpoint-explain-feedback').textContent = '';
    });
    $('prediction-form').addEventListener('input', event => {
      if (phase === 'predict') $('checkpoint-feedback').textContent = '';
      event.target.removeAttribute('aria-invalid');
    });
    document.documentElement.classList.add('checkpoint-ready');
    reset();
    return { update, reset, blocked };
  }
  window.AAWeekTwoCheckpoint = { create };
})();
