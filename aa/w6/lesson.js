(function () {
  'use strict';
  const model = window.FreshWeek6;
  if (!model || typeof model.traceInsert !== 'function') return;
  const $ = id => document.getElementById(id);
  const jobs = [
    { id: 'A', device: 18, priority: 4, seq: 1 }, { id: 'B', device: 7, priority: 7, seq: 2 },
    { id: 'C', device: 24, priority: 6, seq: 3 }, { id: 'D', device: 4, priority: 12, seq: 4 },
    { id: 'E', device: 11, priority: 9, seq: 5 }, { id: 'F', device: 20, priority: 8, seq: 6 },
    { id: 'G', device: 31, priority: 10, seq: 7 }
  ];
  const h = { id: 'H', device: 26, priority: 3, seq: 8 };
  const independent = [
    { id: 'K', device: 18, priority: 2, seq: 1 }, { id: 'L', device: 7, priority: 5, seq: 2 },
    { id: 'M', device: 24, priority: 3, seq: 3 }, { id: 'N', device: 31, priority: 7, seq: 4 }
  ];
  const p = { id: 'P', device: 11, priority: 1, seq: 5 };
  const cases = {
    insert: { operation: 'insert', source: jobs, job: h, text: 'H: cihaz 26, öncelik 3, geliş 8. Hazır yedi işe H’yi ekle.' },
    extract: { operation: 'extract', source: jobs, text: 'İlk yedi işten en küçüğü çıkar. Henüz H yok; kökte A var.' },
    after: { operation: 'extract', source: model.traceInsert(jobs, h).heap, text: 'H önceden eklendi. Hazır sekiz işten en küçüğü çıkar; yalnız bu çıkarmayı say.' },
    tie: { operation: 'extract', source: [jobs[0], { id: 'B', device: 7, priority: 4, seq: 2 }, { id: 'C', device: 24, priority: 6, seq: 3 }], text: 'Hazır [A,B,C]: A=(4,1), B=(4,2), C=(6,3). Eşit öncelikte önce gelen işi seç; en küçüğü çıkar.' },
    stop: { operation: 'insert', source: jobs, job: { id: 'I', device: 26, priority: 15, seq: 8 }, text: 'I: cihaz 26, öncelik 15, geliş 8. İlk yedi işe ekle; yukarı çıkması gerekiyor mu?' },
    single: { operation: 'extract', source: [jobs[0]], text: 'Yalnız A bekliyor: cihaz 18, öncelik 4, geliş 1. En küçüğü çıkar.' },
    empty: { operation: 'extract', source: [], text: 'Bekleyen iş yok. enKüçüğüÇıkar() ne döndürür?' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function name(job) { return job.id + '=(' + job.priority + ',' + job.seq + ')'; }
  function stepText(step) {
    if (step.type === 'append') return name(step.job) + ' işini son boş konum ' + (step.index + 1) + '’e yaz.';
    if (step.type === 'empty') return 'Kuyruk boş: sonuç “iş yok”. İş karşılaştırması veya yer değiştirme gerekmedi.';
    if (step.type === 'remove') return name(step.job) + ' işini yanıt olarak ayır, tek hücreyi kaldır. Kuyruk boşaldı.';
    if (step.type === 'replace-root') return name(step.removed) + ' işini yanıt olarak ayır. Son konum ' + (step.from + 1) + '’teki ' + name(step.job) + ' işini köke taşı ve son hücreyi kaldır. Bu bir swap değil.';
    if (step.type === 'swap') return 'Konum ' + (step.i + 1) + ' ile ' + (step.j + 1) + '’deki işleri yer değiştir. Artık ' + (step.i + 1) + '’de ' + step.heap[step.i].id + ', ' + (step.j + 1) + '’de ' + step.heap[step.j].id + ' var.';
    const left = step.heap[step.left], right = step.heap[step.right];
    const prefix = 'Konum ' + (step.left + 1) + '’deki ' + name(left) + ' ile ' + (step.right + 1) + '’deki ' + name(right) + ' karşılaştırılır. ';
    if (step.purpose === 'choose-child') return prefix + (step.result <= 0 ? left.id : right.id) + ' önce gelen çocuk; şimdi onu ebeveynle karşılaştır.';
    return prefix + (step.result < 0 ? left.id + ' önce gelir; yer değiştirme gerekli.' : 'Ebeveyn önce gelir; bu yolda düzeltme biter.');
  }
  function activePositions(step) {
    if (!step) return [];
    if (step.type === 'compare') return [step.left, step.right];
    if (step.type === 'swap') return [step.i, step.j];
    if (step.type === 'append') return [step.index];
    if (step.type === 'replace-root') return [step.to];
    return [];
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const heap = last ? last.heap : trace.initial;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { comparisons: 0, swaps: 0 };
    const valid = last ? last.heapValid : true;
    $('heap-task').textContent = task.text;
    $('heap-stats').textContent = 'n = ' + heap.length + (heap.length ? ' · h = ' + Math.floor(Math.log2(heap.length)) + ' kenar' : ' · boş heap') + ' · Açılan adım: ' + seen + '/' + trace.steps.length;
    $('heap-order').textContent = 'Dizi sırası (konum 1’den): [' + heap.map(job => job.id).join(', ') + ']';
    const board = $('heap-board'); board.replaceChildren();
    const active = activePositions(last);
    if (!heap.length) { const empty = el('p', 'Bekleyen iş yok; kök yok.'); empty.className = 'board-empty'; board.append(empty); }
    for (let first = 0, depth = 0; first < heap.length; depth += 1, first = 2 * first + 1) {
      const level = el('div'); level.className = 'heap-level'; level.dataset.depth = String(depth);
      level.append(el('h4', 'Derinlik ' + depth));
      const row = el('div'); row.className = 'node-row';
      for (let i = first; i < Math.min(2 * first + 1, heap.length); i += 1) {
        const job = heap[i], position = i + 1;
        const children = [2 * position, 2 * position + 1].filter(child => child <= heap.length);
        const parent = position === 1 ? 'kök' : 'ebeveyn ' + Math.floor(position / 2);
        const card = el('div'); card.className = 'heap-node'; card.dataset.position = String(position); card.dataset.job = job.id;
        card.append(el('b', job.id + ' · p' + job.priority));
        const info = el('span', 'Cihaz ' + job.device + ' · geliş ' + job.seq); info.className = 'job-info'; card.append(info);
        const ref = el('span', 'Konum ' + position + ' · ' + parent + ' · çocuk ' + (children.length ? children.join(', ') : 'yok')); ref.className = 'position-info'; card.append(ref);
        if (active.includes(i)) { card.classList.add('is-current'); const label = el('span', 'Bu adımda'); label.className = 'active-label'; card.append(label); }
        card.setAttribute('aria-label', 'Konum ' + position + ', iş ' + job.id + ', öncelik ' + job.priority + ', cihaz ' + job.device + ', geliş ' + job.seq + ', ' + parent + ', çocuk ' + (children.length ? children.join(', ') : 'yok'));
        row.append(card);
      }
      level.append(row); board.append(level);
    }
    $('heap-invariant').dataset.valid = String(valid);
    $('heap-invariant').textContent = valid ? (heap.length ? 'Ebeveyn–çocuk düzeni şu anda sağlanıyor.' : 'Boş kuyrukta düzeni bozacak iş yok.') : 'Ara durum: ebeveyn–çocuk düzeni henüz sağlanmıyor; düzeltme sürüyor.';
    const history = $('heap-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; history.append(item); });
    $('heap-count').textContent = 'İş karşılaştırması: ' + counts.comparisons + ' · Yer değiştirme: ' + counts.swaps;
    $('heap-next').disabled = done;
    let status = 'Henüz adım açılmadı. Sıradaki konumu ve kararı tahmin et.';
    if (done) {
      if (trace.operation === 'insert') status = 'Ekleme bitti. ' + name(trace.inserted) + ' kuyrukta; n = ' + heap.length + '. Min-heap düzeni sağlandı.';
      else status = trace.result === null ? 'Çıkarma bitti. Sonuç: iş yok. Kuyruk boş.' : 'Çıkarma bitti. Çıkan iş ' + trace.result.id + ': cihaz ' + trace.result.device + ', öncelik ' + trace.result.priority + ', geliş ' + trace.result.seq + '. Kalan n = ' + heap.length + '.';
    } else if (last) status = stepText(last) + ' Devam etmeden sonraki adımı söyle.';
    $('heap-status').textContent = status;
  }
  function reset() {
    task = cases[$('heap-case').value];
    trace = task.operation === 'insert' ? model.traceInsert(task.source, task.job) : model.traceExtract(task.source);
    seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('heap-case').addEventListener('change', reset);
  $('heap-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('heap-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const comparisons = number('guided-comparisons', 0, 20), swaps = number('guided-swaps', 0, 10);
    const invalid = [comparisons, swaps].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'İki kutuyu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const expected = model.traceExtract(model.traceInsert(jobs, h).heap).counts;
    if (comparisons.value === expected.comparisons && swaps.value === expected.swaps) feedback('guided-feedback', 'İki sayı da doğru. Çıkarma izini, çıkan iş kaydını ve son heap’i ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.', false);
    else feedback('guided-feedback', comparisons.value !== expected.comparisons ? 'Yalnız çıkarmayı say. Her iki çocuklu seviyede önce çocukları, sonra seçilen çocuğu ebeveynle karşılaştır.' : 'Yalnız iki mevcut işin konum değiş tokuşlarını say. Son işi köke taşımak bu sayaçta bir yer değiştirme değil.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const inserted = model.traceInsert(independent, p), extracted = model.traceExtract(inserted.heap);
    const checks = [
      { ...number('exit-insert', 0, 20), expected: inserted.counts.comparisons, label: 'ekleme karşılaştırması' },
      { ...number('exit-extract', 0, 20), expected: extracted.counts.comparisons, label: 'çıkarma karşılaştırması' },
      { ...number('exit-swaps', 0, 10), expected: extracted.counts.swaps, label: 'yalnız çıkarma yer değiştirmesi' },
      { ...number('exit-size', 0, 10), expected: extracted.heap.length, label: 'son kayıt sayısı' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Ekleme ve çıkarmanın sayaçlarını ayır; çocuk seçimini de say.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written ? 'Bu kontrol yazılı gerekçelerinin veya formüllerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.' : 'İzi ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + exposed, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) { solutionSeen = true; $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. İlk denemenle çözüm sonrası düzeltmeni ayrı değerlendir.'; $('exit-feedback').textContent = ''; }
  });
  for (const [form, output] of [['guided-form', 'guided-feedback'], ['independent-form', 'exit-feedback']]) {
    $(form).addEventListener('input', event => { $(output).textContent = ''; if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  }
  // A disabled hidden submit prevents implicit Enter navigation without JS.
  const worked = document.querySelector('.worked-table'); worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
