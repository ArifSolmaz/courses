(function () {
  'use strict';
  const model = window.FreshWeek7;
  if (!model || typeof model.traceSort !== 'function') return;
  const $ = id => document.getElementById(id);
  const keys = [18, 7, 24, 4, 11, 20, 31, 26];
  const values = ['pompa', 'sera', 'depo', 'çatı', 'kuyu', 'bahçe', 'kapı', 'oda'];
  const records = keys.map((key, index) => ({ key, value: values[index], tag: String.fromCharCode(65 + index) }));
  function byKeys(list) { return list.map(key => records.find(record => record.key === key)); }
  const guidedLeft = byKeys([4, 7, 18, 24]), guidedRight = byKeys([11, 20, 26, 31]);
  const independent = byKeys([20, 4, 31, 7]);
  const cases = {
    small: { source: records.slice(0, 4), text: 'Dört kayıt: [18,7,24,4]. Önce sol çağrı, sonra sağ çağrı ve birleştirme. Bütün sıralamayı say.' },
    merge: { left: byKeys([7, 18]), right: byKeys([4, 24]), text: 'Hazır sıralı sol [7,18], sağ [4,24]. Yalnız bu tek birleştirmeyi say; öncesindeki sıralamalar dahil değil.' },
    full: { source: records, text: 'Sekiz kayıt: [18,7,24,4,11,20,31,26]. Bütün rehberi kimliğe göre sırala; bütün alt birleşmeler dahil.' },
    odd: { source: records.slice(0, 5), text: 'Beş kayıt: [18,7,24,4,11]. İlk bölünme 2 ve 3 kayda; yarılar eşit olmak zorunda değil.' },
    sorted: { source: records.slice().sort((a, b) => a.key - b.key), text: 'Başlangıç zaten sıralı. Bu temel sürüm, hazır sıralı parçaları fark edip birleşmeyi atlamaz.' },
    single: { source: [records[0]], text: 'Tek kayıt: [18:pompa]. Taban durumu sıralı sonucu hemen geri verir; birleştirme yok.' },
    empty: { source: [], text: 'Boş dizi. Taban durumu boş sonucu geri verir; kimlik karşılaştırması ve birleştirme yok.' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function list(items) { return '[' + items.map(record => record.key).join(', ') + ']'; }
  function named(record) { return record.key + ':' + record.value; }
  function stepText(step) {
    if (step.type === 'split') return 'sirala(' + list(step.left.concat(step.right)) + '): önce sol ' + list(step.left) + ', sonra sağ ' + list(step.right) + ' için daha küçük çağrılar yapılacak. Üst çağrı sonuçlarını bekler.';
    if (step.type === 'base') return list(step.result) + ' taban durum: 0/1 kayıt zaten sıralı. Sonucu geri ver' + (step.depth ? '; üst çağrı devam edecek.' : '; bu çağrı bitti.');
    if (step.type === 'merge-start') return 'Sıralı sol ' + list(step.left) + ' ve sağ ' + list(step.right) + ' hazır. Bu çağrının birleştirme çıktısını boş başlat.';
    const selection = named(step.record) + ' kaydını ' + (step.side === 'left' ? 'soldan' : 'sağdan') + ' çıktıya yerleştir.';
    let reason = step.compared ? 'Başları karşılaştır: ' + step.heads.left.key + (step.comparison < 0 ? ' < ' : step.comparison > 0 ? ' > ' : ' = ') + step.heads.right.key + '. ' : 'Bir parça bitti; kalan kayıt için yeni kimlik karşılaştırması yok. ';
    if (step.compared && step.comparison === 0) reason += 'Eşitlikte soldaki önce. ';
    return reason + selection + (step.returned ? step.depth ? ' Bu birleşme tamamlandı; sonuç üst çağrıya döner.' : ' Bu birleşme tamamlandı; bu görevin sonucu hazır.' : '');
  }
  function recordRow(items, options = {}) {
    const row = el('div'); row.className = 'record-row';
    if (!items.length) { const empty = el('span', 'Boş'); empty.className = 'board-empty'; row.append(empty); }
    items.forEach((record, index) => {
      const card = el('div'); card.className = 'record-chip'; card.dataset.key = String(record.key); card.dataset.tag = record.tag; card.dataset.index = String(index);
      card.append(el('b', String(record.key)));
      const value = el('span', record.value); value.className = 'record-value'; card.append(value);
      let mark = '';
      if (options.cursor !== undefined) {
        if (index < options.cursor) { card.classList.add('is-used'); mark = 'Alındı'; }
        else if (index === options.cursor) { card.classList.add('is-next'); mark = 'Sıradaki baş'; }
      }
      if (options.last && index === items.length - 1) { card.classList.add('is-last'); mark = 'Son yerleşim'; }
      if (mark) { const label = el('span', mark); label.className = 'record-mark'; card.append(label); }
      card.setAttribute('aria-label', 'Kimlik ' + record.key + ', bilgi ' + record.value + (mark ? ', ' + mark : ''));
      row.append(card);
    });
    return row;
  }
  function piece(title, items, className, options) {
    const box = el('div'); box.className = className || 'piece'; box.append(el('h4', title), recordRow(items, options)); return box;
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initialState;
    const counts = last ? last.counts : { comparisons: 0, placements: 0, calls: 0, baseCalls: 0 };
    const done = seen === trace.steps.length;
    $('sort-task').textContent = task.text;
    $('sort-progress').textContent = 'Girdide n = ' + trace.initial.length + ' kayıt · Açılan adım: ' + seen + '/' + trace.steps.length;
    const stack = $('sort-stack'); stack.replaceChildren(); stack.append(el('h4', 'Bu adımdan sonra açık sirala çağrıları'));
    if (trace.operation === 'merge' || !state.stack.length) {
      const caption = el('p', trace.operation === 'merge' ? 'Bu örnek yalnız birleştirme; sirala çağrısı sayılmıyor.' : done ? 'Açık çağrı kalmadı; sonuç hazır.' : 'Henüz çağrı açılmadı.'); caption.className = 'call-empty'; stack.append(caption);
    } else {
      const chain = el('ol');
      state.stack.forEach(frame => { const item = el('li', 'Derinlik ' + frame.depth + ' · sirala(' + list(frame.records) + ')'); item.dataset.node = frame.nodeId; item.dataset.depth = String(frame.depth); chain.append(item); });
      stack.append(chain);
    }
    const board = $('sort-board'); board.replaceChildren();
    const merging = state.merge && (!last || last.type === 'take' || last.type === 'merge-start');
    if (merging) {
      const merge = state.merge;
      const grid = el('div'); grid.className = 'merge-grid';
      const left = piece('Sol · bu adımdan sonra', merge.left, 'merge-lane', { cursor: merge.leftIndex }); left.dataset.lane = 'left';
      const right = piece('Sağ · bu adımdan sonra', merge.right, 'merge-lane', { cursor: merge.rightIndex }); right.dataset.lane = 'right'; grid.append(left, right); board.append(grid);
      const output = piece('Bu birleşmenin çıktısı ' + list(merge.out), merge.out, 'merge-lane merge-output', { last: !!last && last.type === 'take' }); output.dataset.lane = 'out'; board.append(output);
    } else if (last && last.type === 'split') {
      const grid = el('div'); grid.className = 'merge-grid'; grid.append(piece('Sol alt girdi · sırala çağrısına gidecek', last.left), piece('Sağ alt girdi · sol sonuçtan sonra', last.right)); board.append(grid);
    } else {
      board.append(piece(done ? 'Geri dönen sonuç ' + list(trace.result) : last && last.type === 'base' ? 'Tabandan geri dönen ' + list(last.result) : 'Başlangıç girdisi ' + list(trace.initial), done ? trace.result : last && last.type === 'base' ? last.result : trace.initial));
    }
    $('sort-count').textContent = 'Kimlik karşılaştırması: ' + counts.comparisons + ' · Çıktı yerleşimi: ' + counts.placements;
    const callCount = el('p', 'Açılan sirala çağrısı: ' + counts.calls + ' · Bunlardan taban: ' + counts.baseCalls); callCount.className = 'count-line'; callCount.id = 'sort-call-count'; board.append(callCount);
    const history = $('sort-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; item.dataset.node = step.nodeId; history.append(item); });
    $('sort-next').disabled = done; $('sort-end').disabled = done;
    document.querySelector('#sort-history-details summary').textContent = 'Açılan bütün adımlar (' + seen + ')';
    $('sort-status').textContent = done ? (trace.operation === 'merge' ? 'Birleştirme' : 'Sıralama') + ' bitti. Sonuç ' + list(trace.result) + '; bütün ' + trace.result.length + ' kayıt etiketleriyle korundu.' : last ? stepText(last) + ' Devam etmeden sonraki çağrıyı veya seçimi söyle.' : 'Henüz adım açılmadı. İlk çağrıyı veya iki baştan hangisini alacağını tahmin et.';
  }
  function reset() {
    task = cases[$('sort-case').value]; trace = task.left ? model.traceMerge(task.left, task.right) : model.traceSort(task.source);
    seen = 0; render();
  }
  function growth() {
    const n = Number($('growth-n').value), current = model.growth(n), doubled = model.growth(n * 2);
    const board = $('growth-board'); board.replaceChildren();
    [current, doubled].forEach(item => { const card = el('article'); card.className = 'growth-card'; card.dataset.n = String(item.n); card.append(el('h4', 'n = ' + item.n), el('p', 'Birleşme katmanı: ' + item.levels), el('p', 'Çıktı yerleşimi P(n): ' + item.placements)); board.append(card); });
    $('growth-status').textContent = 'İki kuvveti boyutlarda P(' + (2 * n) + ') = 2 × ' + current.placements + ' + ' + (2 * n) + ' = ' + doubled.placements + '. Veri iki kat, birleşme katmanı bir fazla. Bu değerler kesin karşılaştırma sayısı değil.';
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('sort-case').addEventListener('change', reset);
  $('sort-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('sort-end').addEventListener('click', () => { seen = trace.steps.length; render(); });
  $('sort-reset').addEventListener('click', reset);
  $('growth-n').addEventListener('change', growth);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const comparisons = number('guided-comparisons', 0, 40), placements = number('guided-placements', 0, 40);
    const invalid = [comparisons, placements].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'İki kutuyu da 0–40 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const expected = model.traceMerge(guidedLeft, guidedRight).counts;
    if (comparisons.value === expected.comparisons && placements.value === expected.placements) feedback('guided-feedback', 'İki sayı da doğru. Baş seçimlerini ve karşılaştırmasız kalanları ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.', false);
    else feedback('guided-feedback', comparisons.value !== expected.comparisons ? 'Yalnız son birleşmeyi say. İki baş varken karşılaştır; bir parça bittikten sonra kalanları karşılaştırma.' : 'Her tam kayıt bu birleşmenin çıktısına bir kez yerleşir. Karşılaştırmasız kalanları da say; alt birleşmeleri ekleme.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault(); const expected = model.traceSort(independent);
    const checks = [
      { ...number('exit-comparisons', 0, 40), expected: expected.counts.comparisons, label: 'bütün sıralama karşılaştırması' },
      { ...number('exit-placements', 0, 40), expected: expected.counts.placements, label: 'bütün sıralama yerleşimi' },
      { ...number('exit-levels', 0, 10), expected: model.growth(independent.length).levels, label: 'birleşme katmanı' },
      { ...number('exit-size', 0, 10), expected: expected.result.length, label: 'son kayıt sayısı' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Bu görevde bütün alt birleşmeler dahil; çağrı, kayıt ve yerleşimi ayrı say.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written ? 'Bu kontrol yazılı gerekçelerinin veya formüllerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.' : 'Çağrı izini ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) { solutionSeen = true; $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. İlk denemenle çözüm sonrası düzeltmeni ayrı değerlendir.'; $('exit-feedback').textContent = ''; }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  const worked = [...document.querySelectorAll('.worked-table')]; worked.forEach(node => { node.open = false; }); let printState = [];
  window.addEventListener('beforeprint', () => { printState = worked.map(node => node.open); worked.forEach(node => { node.open = true; }); });
  window.addEventListener('afterprint', () => { worked.forEach((node, index) => { node.open = printState[index]; }); });
  reset(); growth();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
