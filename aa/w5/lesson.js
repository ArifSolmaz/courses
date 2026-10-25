(function () {
  'use strict';
  const model = window.AAWeekFive;
  if (!model || typeof model.traceGet !== 'function') return;
  const $ = id => document.getElementById(id);
  const entries = [
    { key: 18, value: 'pompa' }, { key: 7, value: 'sera' }, { key: 24, value: 'depo' },
    { key: 4, value: 'çatı' }, { key: 11, value: 'kuyu' }, { key: 20, value: 'bahçe' }, { key: 32, value: 'kapı' }
  ];
  const added = { key: 26, value: 'oda' };
  const cases = {
    found: { entries, kind: 'get', key: 32 },
    missing: { entries, kind: 'get', key: 16 },
    insert: { entries, kind: 'set', key: 26, value: 'oda' },
    after: { entries: entries.concat([added]), kind: 'get', key: 26 },
    update: { entries, kind: 'set', key: 32, value: 'atölye' },
    sorted: { entries: entries.slice().sort((a, b) => a.key - b.key), kind: 'get', key: 32 },
    empty: { entries: [], kind: 'get', key: 32 }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function ref(key) { return key === null ? 'yok' : String(key); }
  function stepText(step) {
    if (step.op === 'hash') return step.key + ' mod ' + step.m + ' = ' + step.bucketIndex + ': kovayı hesapla.';
    if (step.op === 'compare-key') return 'Kova ' + step.bucketIndex + ', sıra ' + step.offset + ': ' + step.key + (step.equal ? ' = ' : ' ≠ ') + step.target + (step.equal ? '; aynı anahtar.' : '; sonraki kayda bak.');
    if (step.op === 'compare-node') return step.key + (step.relation < 0 ? ' < ' : step.relation > 0 ? ' > ' : ' = ') + step.target + (step.direction === 'found' ? '; aynı anahtar.' : step.direction === 'left' ? '; sol dala git.' : '; sağ dala git.');
    return step.key + ' → “' + step.value + '”: ' + (step.updated ? 'mevcut kaydı güncelle.' : 'yeni kaydı ekle.');
  }
  function levels(state) {
    const map = new Map(state.nodes.map(node => [node.key, node]));
    const result = [], queue = state.root === null ? [] : [{ key: state.root, depth: 0 }];
    const visited = new Set();
    for (let i = 0; i < queue.length; i++) {
      const { key, depth } = queue[i];
      if (visited.has(key)) continue;
      visited.add(key);
      const node = map.get(key);
      if (!result[depth]) result[depth] = [];
      result[depth].push(node);
      if (node.left !== null) queue.push({ key: node.left, depth: depth + 1 });
      if (node.right !== null) queue.push({ key: node.right, depth: depth + 1 });
    }
    return result;
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initial;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { nodeComparisons: 0, bucketKeyChecks: 0, hashComputations: 0, recordSets: 0 };
    const selected = $('lookup-case').value;
    $('lookup-task').textContent = (task.kind === 'get' ? 'bul(' + task.key + ')' : 'kaydet(' + task.key + ', “' + task.value + '”)')
      + '. ' + (selected === 'after' ? '26 önceden eklenmiş; şimdi yalnız arama sayılıyor.' : selected === 'sorted' ? 'Aynı kayıtlar artan kimlik sırasıyla yerleştirildi.' : selected === 'empty' ? 'Başlangıçta kayıt yok.' : 'Başlangıç yerleştirme sırası: 18, 7, 24, 4, 11, 20, 32.');
    const board = $('lookup-board'); board.replaceChildren();
    const written = last && last.op === 'set-record' ? last.key : null;
    if (trace.structure === 'bst') {
      $('lookup-stats').textContent = 'n = ' + state.stats.size + (state.stats.size ? ' · h = ' + state.stats.height + ' kenar' : ' · boş ağaç');
      const rows = levels(state);
      if (!rows.length) {
        const empty = el('p', 'Kök yok; karşılaştırılacak anahtar yok.'); empty.className = 'board-empty'; board.append(empty);
      }
      rows.forEach((nodes, depth) => {
        const level = el('div'); level.className = 'tree-level'; level.dataset.depth = String(depth);
        level.append(el('h4', 'Derinlik ' + depth));
        const row = el('div'); row.className = 'node-row';
        nodes.forEach(node => {
          const card = el('div'); card.className = 'node-card'; card.dataset.key = String(node.key);
          if (state.path.includes(node.key)) card.classList.add('is-visited');
          if (last && state.active === node.key) card.classList.add('is-current');
          if (written === node.key) card.classList.add('is-written');
          card.append(el('b', String(node.key)));
          const value = el('span', node.value); value.className = 'record-value'; card.append(value);
          const left = el('span', 'sol → ' + ref(node.left)); left.className = 'child-ref';
          const right = el('span', 'sağ → ' + ref(node.right)); right.className = 'child-ref';
          card.append(left, right);
          card.setAttribute('aria-label', 'Anahtar ' + node.key + ', bilgi ' + node.value + ', sol ' + ref(node.left) + ', sağ ' + ref(node.right));
          row.append(card);
        });
        level.append(row); board.append(level);
      });
      $('lookup-note').textContent = 'Kutudaki sayı anahtar, altındaki sözcük kayıt bilgisi. Derinlik kökten kenar sayısı; sol/sağ etiketleri çocuk anahtarlarını gösterir. Renkli zemin karşılaştırılan düğümleri, çerçeve son işlemi gösterir; kaydetme ayrıca işaretlenir.';
      $('lookup-count').textContent = 'Düğüm karşılaştırması: ' + counts.nodeComparisons + (task.kind === 'set' ? ' · Mantıksal kaydetme: ' + counts.recordSets : '');
    } else {
      $('lookup-stats').textContent = 'n = ' + state.stats.size + ' · m = ' + state.m + ' · α = ' + state.stats.alpha.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
      const checked = new Set(trace.steps.slice(0, seen).filter(step => step.op === 'compare-key').map(step => step.key));
      state.buckets.forEach((bucket, index) => {
        const row = el('div'); row.className = 'bucket-row'; row.dataset.bucket = String(index);
        if (state.activeBucket === index) row.classList.add('is-active');
        row.append(el('h4', 'Kova ' + index));
        const items = el('div'); items.className = 'bucket-items';
        if (!bucket.length) { const empty = el('span', 'Boş'); empty.className = 'board-empty'; items.append(empty); }
        bucket.forEach((record, offset) => {
          const card = el('div'); card.className = 'bucket-item'; card.dataset.key = String(record.key); card.dataset.offset = String(offset + 1);
          if (checked.has(record.key)) card.classList.add('is-visited');
          if (last && state.activeBucket === index && state.activeOffset === offset + 1) card.classList.add('is-current');
          if (written === record.key) card.classList.add('is-written');
          card.append(el('b', String(record.key)), el('span', record.value));
          card.setAttribute('aria-label', 'Kova ' + index + ', sıra ' + (offset + 1) + ', anahtar ' + record.key + ', bilgi ' + record.value);
          items.append(card);
        });
        row.append(items); board.append(row);
      });
      $('lookup-note').textContent = 'Kova etiketleri 0–4. Her kovada giriş sırasını soldan sağa izle; satır kayması bu sırayı değiştirmez. Çerçeve son işlemin kaydını gösterir; yeni/güncel kayıt ayrıca işaretlenir.';
      $('lookup-count').textContent = 'Kova hesabı: ' + counts.hashComputations + ' · Eşitlik kontrolü: ' + counts.bucketKeyChecks + (task.kind === 'set' ? ' · Mantıksal kaydetme: ' + counts.recordSets : '');
    }
    const history = $('lookup-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.op = step.op; history.append(item); });
    $('lookup-next').disabled = done;
    let status = 'Henüz işlem açılmadı. Sıradaki dalı veya kovayı tahmin et.';
    if (done) status = task.kind === 'get'
      ? trace.result === null ? 'Arama bitti. Sonuç: yok. Ek anahtar kontrolü yok.' : 'Arama bitti. Sonuç: “' + trace.result.value + '”. Anahtar ' + trace.result.key + '.'
      : 'Kaydetme bitti. ' + (trace.result.updated ? 'Aynı anahtar güncellendi.' : 'Yeni anahtar eklendi.') + ' n = ' + trace.stats.size + '.';
    else if (last) status = stepText(last) + ' Devam etmeden sonraki işi sen söyle.';
    $('lookup-status').textContent = status;
  }
  function reset() {
    task = cases[$('lookup-case').value];
    const structure = $('lookup-structure').value;
    trace = task.kind === 'get' ? model.traceGet(task.entries, task.key, structure, { m: 5 }) : model.traceSet(task.entries, task.key, task.value, structure, { m: 5 });
    seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('lookup-case').addEventListener('change', reset);
  $('lookup-structure').addEventListener('change', reset);
  $('lookup-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen++; render(); } });
  $('lookup-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const tree = number('guided-tree', 0, 10), hash = number('guided-hash', 0, 10);
    const invalid = [tree, hash].find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'İki kutuyu da 0–10 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const source = entries.concat([added]);
    if (tree.value === model.traceGet(source, 26, 'bst').counts.nodeComparisons && hash.value === model.traceGet(source, 26, 'hash').counts.bucketKeyChecks) {
      feedback('guided-feedback', 'İki sayı da doğru. Ekleme sonrası arama izini, dönen bilgiyi ve yükü ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.', false);
    } else {
      feedback('guided-feedback', tree.value !== model.traceGet(source, 26, 'bst').counts.nodeComparisons
        ? 'Yalnız ekleme bittikten sonraki aramayı say. Yeni düğüme kadar yolu izle; eşleşen düğüm de karşılaştırılır.'
        : 'Kova hesabını eşitlik sayacına ekleme. Kova içindeki 11 ve yeni anahtarı sırayla denetle.', true);
    }
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const source = [{ key: 12, value: 'sera' }, { key: 3, value: 'çatı' }, { key: 22, value: 'depo' }, { key: 8, value: 'kuyu' }, { key: 17, value: 'pompa' }];
    const tree = model.traceGet(source, 17, 'bst'), hash = model.traceGet(source, 17, 'hash', { m: 5 });
    const checks = [
      { ...number('exit-tree', 0, 10), expected: tree.counts.nodeComparisons, label: 'ağaç karşılaştırması' },
      { ...number('exit-bucket', 0, 4), expected: 17 % 5, label: 'kova etiketi' },
      { ...number('exit-checks', 0, 10), expected: hash.counts.bucketKeyChecks, label: 'kova içi eşitlik kontrolü' },
      { ...number('exit-size', 0, 10), expected: model.traceSet(source, 17, 'kapı', 'bst').stats.size, label: 'güncelleme sonrası kayıt sayısı' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Anahtarı, kova etiketini ve güncel kaydı ayır; her sayacın birimini söyle.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written
        ? 'Bu kontrol yazılı gerekçelerinin veya formüllerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.'
        : 'İzi ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true; $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. İlk denemenle çözüm sonrası düzeltmeni ayrı değerlendir.';
      $('exit-feedback').textContent = '';
    }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  const worked = document.querySelector('.worked-table'); worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
