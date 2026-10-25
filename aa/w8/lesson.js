(function () {
  'use strict';
  const model = window.FreshWeek8;
  if (!model || typeof model.traceBFS !== 'function') return;
  const $ = id => document.getElementById(id);
  const vertices = [4, 7, 11, 18, 20, 24, 26, 32];
  const edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 32], [20, 32]];
  const names = { 4: 'çatı', 7: 'sera', 11: 'kuyu', 18: 'pompa', 20: 'bahçe', 24: 'depo', 26: 'oda', 32: 'kapı' };
  const independentVertices = [4, 7, 18, 20, 24, 26];
  const independentEdges = [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]];
  const cases = {
    main: { vertices, edges, source: 18, target: 32, text: 'Ana ağ, kaynak 18. Komşular artan kimlik sırasıyla hazır. 26 yalıtılmış; hedef 32 için en az bağlantıyı bul.' },
    reverse: { vertices, edges, source: 18, target: 32, order: 'descending', text: 'Aynı ağ ve kaynak 18; komşular azalan sırada. Uzaklıklarla seçilen ebeveynlerin hangisi değişebilir?' },
    source32: { vertices, edges, source: 32, target: 18, text: 'Aynı ağda kaynak bu kez 32. Uzaklıkları 32’e göre baştan hesapla; başlangıç 18 artık uzaklığı 0 olan düğüm değil.' },
    isolated: { vertices, edges, source: 26, target: 32, text: 'Aynı ağda kaynak 26; komşuluk listesi boş. Diğer kenarlar çizgede var, fakat bu kaynaktan onlara ulaşılmıyor.' },
    linked: { vertices, edges: edges.concat([[32, 26]]), source: 18, target: 26, text: 'Ana ağa bir yönsüz 32–26 kenarı ekledik. Kaynak 18; 26 artık erişilebilir mi? Bütün bileşeni işle.' },
    single: { vertices: [18], edges: [], source: 18, target: 18, text: 'Tek düğüm 18, kenar yok. Kaynağın kendisine uzaklığı ve yolu nedir?' },
    noedges: { vertices, edges: [], source: 18, target: 32, text: 'Sekiz cihazın hepsi çizgede, hiç kenar yok. Kaynak 18. Düğümün mevcut olması ile erişilebilir olması aynı şey mi?' }
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; }
  function list(items) { return '[' + items.join(', ') + ']'; }
  function rowAt(state, id) { return state.rows.find(row => row.id === id); }
  function stepText(step) {
    if (step.type === 'init-root') return trace.vertices.length + ' düğümün uzaklık/ebeveyn durumunu başlat. d[' + step.vertex + ']=0 yaz, keşfedildi olarak işaretle ve kuyruğa koy.';
    if (step.type === 'dequeue') return 'FIFO’nun önünden ' + step.vertex + ' düğümünü çıkar. Şimdi onun komşularını incele; kuyrukta bekleyenlerden ayrı tut.';
    if (step.type === 'finish') return step.vertex + ' düğümünün bütün komşuları bitti. ' + (step.state.done ? 'Kuyrukta ve incelenen düğümde iş kalmadı; arama tamam.' : 'Kuyruğun önündeki düğümle devam edilecek.');
    const prefix = step.from + ' listesinin ' + (step.neighborIndex + 1) + '. girdisi: ' + step.to + '. ';
    if (!step.discovered) return prefix + 'Zaten keşfedildi; yeniden ekleme. Uzaklık ve ebeveyn aynı kalır.';
    const distance = rowAt(step.state, step.to).distance;
    return prefix + 'İlk keşif: d[' + step.to + ']=d[' + step.from + ']+1=' + distance + ', ebeveyn ' + step.from + '. İşaretle ve kuyruğun sonuna ekle.';
  }
  function statusText(row, done) {
    if (row.status === 'unseen') return done ? 'Bu kaynaktan erişilemedi' : 'Henüz keşfedilmedi';
    if (row.status === 'queued') return 'Keşfedildi · kuyrukta';
    if (row.status === 'active') return 'Şimdi inceleniyor';
    return 'Komşuları tamamlandı';
  }
  function renderPath() {
    const target = Number($('bfs-target').value);
    if (seen !== trace.steps.length) { $('bfs-path').textContent = 'Yol tablosunu karşılaştırmak için aramayı tamamla. Henüz keşfedilmemiş hedefe bu aşamada “erişilemedi” demiyoruz.'; return; }
    const path = model.shortestPath(trace, target);
    $('bfs-path').textContent = path === null ? 'Çizgede ' + target + ' var; ' + trace.source + ' kaynağından erişilemedi. Uzaklığı 0 değil, yol yok.' : 'Bir en az adımlı yol: ' + path.join(' → ') + '. ' + (path.length - 1) + ' kenar, ' + path.length + ' düğüm; d[' + target + ']=' + trace.result.distances[target] + '.';
  }
  function render() {
    const last = seen ? trace.steps[seen - 1] : null;
    const state = last ? last.state : trace.initialState;
    const done = seen === trace.steps.length;
    const counts = last ? last.counts : { initializations: 0, edgeScans: 0, enqueues: 0, dequeues: 0 };
    $('bfs-task').textContent = task.text;
    $('bfs-progress').textContent = 'V = ' + trace.vertices.length + ' · E = ' + trace.edges.length + ' · Kaynak ' + trace.source + ' · Açılan adım: ' + seen + '/' + trace.steps.length;
    const frontier = $('bfs-queue'); frontier.replaceChildren(); frontier.append(el('h4', 'FIFO kuyruğu · ön → arka'));
    const queue = el('div'); queue.className = 'queue-row';
    if (!state.queue.length) { const empty = el('span', done ? 'Boş; arama tamam.' : 'Şu anda boş; incelenen düğümde iş olabilir.'); empty.className = 'board-empty'; queue.append(empty); }
    state.queue.forEach((id, index) => {
      const chip = el('div'); chip.className = 'queue-chip'; chip.dataset.id = String(id); chip.dataset.index = String(index);
      chip.append(el('b', String(id)));
      const marks = [];
      if (index === 0) { chip.classList.add('is-front'); marks.push('Ön'); }
      if (last && last.type === 'inspect' && last.discovered && last.to === id) { chip.classList.add('is-new'); marks.push('Yeni'); }
      if (marks.length) chip.append(el('span', marks.join(' · ')));
      queue.append(chip);
    });
    frontier.append(queue);
    $('bfs-current').textContent = state.current === null ? 'Şimdi incelenen: yok.' : 'Şimdi incelenen: ' + state.current + ' · ' + names[state.current] + ' · d=' + rowAt(state, state.current).distance + '.';
    const neighbors = $('bfs-neighbors'); neighbors.replaceChildren();
    if (state.current === null) { neighbors.append(el('p', done ? 'Kaynağın bileşeninde bekleyen inceleme yok.' : 'Düğüm önden alınınca onun komşuluk listesi burada açılacak.')); }
    else {
      const items = trace.adjacency[state.current];
      neighbors.append(el('h4', state.current + ' komşuları ' + list(items) + ' · Taranan: ' + state.neighborIndex + '/' + items.length));
      const line = el('div'); line.className = 'neighbor-row';
      if (!items.length) { const empty = el('span', 'Liste boş; taranacak girdi yok.'); empty.className = 'board-empty'; line.append(empty); }
      items.forEach((id, index) => {
        const chip = el('div'); chip.className = 'neighbor-chip'; chip.dataset.id = String(id); chip.dataset.index = String(index); chip.append(el('b', String(id)));
        let mark = '';
        if (index < state.neighborIndex) { chip.classList.add('is-scanned'); mark = 'Tarandı'; }
        else if (index === state.neighborIndex) { chip.classList.add('is-next'); mark = 'Sıradaki'; }
        if (last && last.type === 'inspect' && index === last.neighborIndex) { chip.classList.add('is-last'); mark = 'Bu adımda'; }
        if (mark) chip.append(el('span', mark)); line.append(chip);
      });
      neighbors.append(line);
    }
    const table = $('bfs-table'); table.replaceChildren();
    state.rows.forEach(row => {
      const card = el('article'); card.className = 'distance-card'; card.dataset.id = String(row.id); card.dataset.status = row.status; card.dataset.distance = row.distance === null ? '' : String(row.distance); card.dataset.parent = row.parent === null ? '' : String(row.parent);
      if (state.current === row.id) card.classList.add('is-current');
      if (last && last.type === 'inspect' && last.to === row.id) card.classList.add('is-last');
      card.append(el('h4', String(row.id)));
      const place = el('span', names[row.id]); place.className = 'place'; card.append(place);
      const distance = el('p', 'd = ' + (row.distance === null ? done ? 'erişilemedi' : 'henüz bilinmiyor' : row.distance)); distance.className = 'node-distance'; card.append(distance);
      const parent = el('p', 'Ebeveyn: ' + (row.parent === null ? row.distance === 0 ? 'yok (kaynak)' : '—' : row.parent)); parent.className = 'node-parent'; card.append(parent);
      const status = el('p', statusText(row, done)); status.className = 'node-status'; card.append(status); table.append(card);
    });
    $('bfs-count').textContent = 'Başlatılan satır: ' + counts.initializations + ' · Komşuluk girdisi taraması: ' + counts.edgeScans + ' · Kuyruğa ekleme: ' + counts.enqueues + ' · Önden çıkarma: ' + counts.dequeues;
    $('bfs-order').textContent = 'Önden çıkarma sırası: ' + list(state.order) + ' · En kalabalık kuyruk: ' + (last ? last.stats.maxQueue : 0);
    $('bfs-status').textContent = done ? 'BFS bitti. ' + trace.result.reachable.length + ' düğüme ulaşıldı; ' + trace.result.unreachable.length + ' düğüme bu kaynaktan erişilemedi.' : last ? stepText(last) + ' Devam etmeden sonraki kuyruğu söyle.' : 'Henüz adım açılmadı. Önce kaynak hangi uzaklıkla kuyruğa girecek?';
    $('bfs-next').disabled = done; $('bfs-end').disabled = done;
    const history = $('bfs-history'); history.replaceChildren();
    trace.steps.slice(0, seen).forEach(step => { const item = el('li', stepText(step)); item.dataset.type = step.type; history.append(item); });
    document.querySelector('#bfs-history-details summary').textContent = 'Açılan bütün adımlar (' + seen + ')';
    renderPath();
  }
  function reset() {
    task = cases[$('bfs-case').value]; trace = model.traceBFS(task.vertices, task.edges, task.source, { neighborOrder: task.order || 'ascending' });
    const targets = $('bfs-target'); targets.replaceChildren();
    trace.vertices.forEach(id => { const option = el('option', id + ' · ' + names[id]); option.value = String(id); targets.append(option); });
    targets.value = String(task.target); seen = 0; render();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('bfs-case').addEventListener('change', reset);
  $('bfs-target').addEventListener('change', renderPath);
  $('bfs-next').addEventListener('click', () => { if (seen < trace.steps.length) { seen += 1; render(); } });
  $('bfs-end').addEventListener('click', () => { seen = trace.steps.length; render(); });
  $('bfs-reset').addEventListener('click', reset);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault(); const distance = number('guided-distance', 0, 10), queue = number('guided-queue', 0, 10);
    const invalid = [distance, queue].find(item => !item.valid);
    if (invalid) { feedback('guided-feedback', 'İki kutuyu da 0–10 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const after = model.traceBFS(vertices, edges, 18).steps.find(step => step.type === 'finish' && step.vertex === 24).state;
    if (distance.value === rowAt(after, 20).distance && queue.value === after.queue.length) feedback('guided-feedback', 'İki sayı da doğru. Kuyruğun sırasını, ebeveyni ve tekrar eklememe gerekçeni ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.', false);
    else feedback('guided-feedback', distance.value !== rowAt(after, 20).distance ? '20 ilk kez 24’ten keşfediliyor. d[24] üzerine bir bağlantı ekle; cihaz kimliklerini toplamıyoruz.' : 'Önce 24’ü çıkar. 4 ve 11 bekler; 11’i ikinci kez koyma, yalnız yeni 20’yi sona ekle.', true);
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault(); const expected = model.traceBFS(independentVertices, independentEdges, 18);
    const checks = [
      { ...number('exit-distance26', 0, 10), expected: expected.result.distances[26], label: '26 uzaklığı' },
      { ...number('exit-distance4', 0, 10), expected: expected.result.distances[4], label: '4 uzaklığı' },
      { ...number('exit-scans', 0, 40), expected: expected.counts.edgeScans, label: 'komşuluk girdisi taraması' },
      { ...number('exit-enqueues', 0, 10), expected: expected.counts.enqueues, label: 'kaynak dahil kuyruğa ekleme' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) { feedback('exit-feedback', 'Dört sayı kutusunu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true); $(invalid.id).focus(); return; }
    const wrong = checks.filter(item => item.value !== item.expected);
    const exposed = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Uzaklık kenar sayısı; her komşuluk girdisi bir tarama, her düğüm en çok bir ekleme.' + exposed, true);
    else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written ? 'Bu kontrol yazılı gerekçelerinin veya formüllerinin doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.' : 'Ağı, kuyruk izini ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + exposed, false);
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
  reset();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
