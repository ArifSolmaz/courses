(function () {
  'use strict';
  const model = window.AAWeekFour;
  if (!model || typeof model.traceInsert !== 'function') return;
  const $ = id => document.getElementById(id);
  const directory = [4, 7, 11, 18, 24, 31];
  const cases = {
    access: { values: directory, kind: 'access', position: 4 },
    insert: { values: directory, kind: 'insert', position: 4, value: 15 },
    head: { values: directory, kind: 'insert', position: 1, value: 2 },
    tail: { values: directory, kind: 'insert', position: 7, value: 42 },
    empty: { values: [], kind: 'insert', position: 1, value: 15 }
  };
  const events = [
    { type: 'put', token: 'A', id: 24 }, { type: 'put', token: 'B', id: 4 },
    { type: 'put', token: 'C', id: 18 }, { type: 'take' },
    { type: 'put', token: 'D', id: 11 }, { type: 'take' }
  ];
  let storage, storageCase, storageSeen = 0, policy, policySeen = 0, solutionSeen = false;

  function el(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function name(id) { return id === null ? 'son' : id === 'new' ? 'yeni' : id; }
  function stepText(step) {
    if (step.op === 'index-read') return 'Konum ' + step.position + ': ' + step.value + ' değerini indeksle oku.';
    if (step.op === 'node-read') return name(step.node) + ' düğümünün değerini oku: ' + step.value + '.';
    if (step.op === 'follow-link') return name(step.fromNode) + ' → ' + name(step.toNode) + ': bir sonraki bağlantısını izle.';
    if (step.op === 'shift') return 'Konum ' + step.from + ' → ' + step.to + ': ' + step.value + ' değerini taşı.';
    if (step.op === 'value-write') return 'Konum ' + step.position + ': yeni ' + step.value + ' değerini yaz.';
    const field = step.field === 'head' ? 'baş' : name(step.node) + '.sonraki';
    return field + ' ← ' + name(step.next) + ': bir referans ata.';
  }
  function countsText(counts) {
    if (storageCase.kind === 'access') return storage.structure === 'array'
      ? 'İndeksli okuma: ' + counts.indexReads
      : 'Bağlantı izleme: ' + counts.linkFollows + ' · Düğüm değeri okuma: ' + counts.nodeValueReads;
    return storage.structure === 'array'
      ? 'Değer taşıma: ' + counts.valueShifts + ' · Yeni değer yazımı: ' + counts.valueWrites
      : 'Bağlantı izleme: ' + counts.linkFollows + ' · Referans ataması: ' + counts.pointerWrites;
  }
  function orderedNodes(state) {
    const map = new Map(state.nodes.map(node => [node.id, node]));
    const connected = new Set(), order = [];
    let current = state.head;
    while (current && map.has(current) && !connected.has(current)) {
      const node = map.get(current);
      connected.add(current); order.push(node);
      current = node.nextSet ? node.next : null;
    }
    return { connected, nodes: order.concat(state.nodes.filter(node => !connected.has(node.id))) };
  }
  function renderStorage() {
    const last = storageSeen ? storage.steps[storageSeen - 1] : null;
    const state = last ? last.state : storage.initial;
    const done = storageSeen === storage.steps.length;
    const zero = Object.fromEntries(Object.keys(storage.counts).map(key => [key, 0]));
    $('storage-task').textContent = storageCase.kind === 'access'
      ? 'n = ' + storage.values.length + '. k = ' + storage.position + ' konumundaki değeri oku.'
      : 'Başlangıç n = ' + storage.values.length + '. ' + storage.value + ' değerini verilen p = ' + storage.position + ' konumuna ekle. ' + (storage.structure === 'array' ? 'Bir boş hücre hazır.' : 'Yeni düğüm ve değeri hazır; yalnız baş adresi var.');
    const board = $('storage-board'); board.replaceChildren();
    $('storage-head').textContent = storage.structure === 'linked' ? 'baş → ' + name(state.head) : 'Dizi · konumlar 1 tabanlı';
    if (storage.structure === 'array') {
      state.slots.forEach((value, index) => {
        const card = el('div'); card.className = 'storage-card'; card.dataset.position = String(index + 1);
        if (last && (last.to || last.position) === index + 1) card.classList.add('is-current');
        card.append(el('small', 'konum ' + (index + 1)), el('b', value === null ? 'boş' : String(value)));
        card.setAttribute('aria-label', 'Konum ' + (index + 1) + ': ' + (value === null ? 'boş hücre' : value));
        board.append(card);
      });
      $('storage-note').textContent = storageCase.kind === 'access'
        ? 'İndeksli okuma doğrudan istenen konuma gider.'
        : 'Bir boş hücre ayrıldı. Taşırken kaynak hücre temizlenmez; geçici tekrarlar sonraki yazımla örtülür.';
    } else {
      const ordered = orderedNodes(state);
      ordered.nodes.forEach(node => {
        const card = el('div'); card.className = 'storage-card'; card.dataset.node = node.id;
        if (node.id === 'new') card.classList.add('is-new');
        if (!ordered.connected.has(node.id)) card.classList.add('is-detached');
        const current = last && (last.op === 'follow-link' ? last.toNode : last.op === 'pointer-write' ? last.node || 'new' : last.node);
        if (current === node.id) card.classList.add('is-current');
        card.append(el('small', name(node.id)), el('b', String(node.value)));
        const next = el('span', '→ ' + (node.nextSet ? name(node.next) : '?'));
        next.className = 'next-ref'; card.append(next);
        card.setAttribute('aria-label', name(node.id) + ', değer ' + node.value + ', sonraki ' + (node.nextSet ? name(node.next) : 'henüz atanmadı') + (ordered.connected.has(node.id) ? '' : ', baştan henüz erişilmiyor'));
        board.append(card);
      });
      $('storage-note').textContent = 'N adları sabit düğüm etiketleri. Ok etiketlerini izle. Kesikli kutuya baştan henüz erişilmiyor; ? sonraki bağının atanmadığını gösterir.';
    }
    const history = $('storage-history'); history.replaceChildren();
    storage.steps.slice(0, storageSeen).forEach(step => {
      const item = el('li', stepText(step)); item.dataset.op = step.op; history.append(item);
    });
    $('storage-count').textContent = countsText(last ? last.counts : zero);
    $('storage-next').disabled = done;
    let status = 'Henüz işlem açılmadı. Sıradaki işi tahmin et, sonra bir adım aç.';
    if (last) status = stepText(last) + (done
      ? storageCase.kind === 'access' ? ' Erişim tamamlandı; sonuç ' + storage.value + '.'
        : ' Ekleme tamamlandı. Sonuç [' + storage.result.join(', ') + ']. Etkin kayıt sayısı ' + storage.result.length + '.'
      : ' Devam etmeden sonraki durumu sen söyle.');
    $('storage-status').textContent = status;
  }
  function resetStorage() {
    storageCase = cases[$('storage-case').value];
    const structure = $('storage-structure').value;
    storage = storageCase.kind === 'access'
      ? model.traceAccess(storageCase.values, storageCase.position, structure)
      : model.traceInsert(storageCase.values, storageCase.position, storageCase.value, structure, { capacity: storageCase.values.length + 1 });
    storageSeen = 0; renderStorage();
  }
  function policyText(step) {
    if (step.type === 'put') return step.item.token + ': cihaz ' + step.item.id + ' mesajı geldi.';
    if (step.empty) return 'Çıkarma istendi; bekleyen mesaj yok.';
    return step.item.token + ': cihaz ' + step.item.id + ' mesajı çıkarıldı.';
  }
  function renderPolicy() {
    const last = policySeen ? policy.steps[policySeen - 1] : null;
    const waiting = last ? last.state : [], removed = last ? last.removed : [];
    const board = $('policy-board'); board.replaceChildren();
    if (!waiting.length) {
      const empty = el('p', 'Bekleyen mesaj yok.'); empty.className = 'board-empty'; board.append(empty);
    }
    waiting.forEach(message => {
      const card = el('div'); card.className = 'message-card'; card.dataset.token = message.token;
      card.append(el('small', message.token), el('b', String(message.id))); board.append(card);
    });
    $('policy-step').textContent = 'Açılan olay: ' + policySeen + ' / ' + policy.steps.length;
    $('policy-out').textContent = 'Çıkanlar: ' + (removed.length ? removed.map(item => item.id + ' (' + item.token + ')').join(' → ') : 'henüz yok') + '.';
    const history = $('policy-history'); history.replaceChildren();
    policy.steps.slice(0, policySeen).forEach(step => {
      const item = el('li', policyText(step)); item.dataset.type = step.type; history.append(item);
    });
    const done = policySeen === policy.steps.length;
    $('policy-next').disabled = done;
    $('policy-status').textContent = last
      ? policyText(last) + (done ? ' Olaylar tamamlandı. ' : ' ') + (policy.policy === 'fifo' ? 'En eski bekleyen önce çıkar.' : 'En yeni bekleyen önce çıkar.')
      : 'Başlangıç boş. İlk geliş olayını açmadan önce durumu tahmin et.';
  }
  function resetPolicy() {
    policy = model.tracePolicy(events, $('policy-mode').value);
    policySeen = 0; renderPolicy();
  }
  function number(id, min, max) {
    const input = $(id), raw = input.value.trim(), value = Number(raw);
    const valid = raw !== '' && !input.validity.badInput && Number.isSafeInteger(value) && value >= min && value <= max;
    input.setAttribute('aria-invalid', String(!valid)); return { id, value, valid };
  }
  function feedback(id, text, error) { $(id).textContent = text; $(id).dataset.state = error ? 'error' : 'ok'; }
  $('storage-case').addEventListener('change', resetStorage);
  $('storage-structure').addEventListener('change', resetStorage);
  $('storage-next').addEventListener('click', () => { if (storageSeen < storage.steps.length) { storageSeen++; renderStorage(); } });
  $('storage-reset').addEventListener('click', resetStorage);
  $('policy-mode').addEventListener('change', resetPolicy);
  $('policy-next').addEventListener('click', () => { if (policySeen < policy.steps.length) { policySeen++; renderPolicy(); } });
  $('policy-reset').addEventListener('click', resetPolicy);
  $('guided-form').addEventListener('submit', event => {
    event.preventDefault();
    const checks = [number('guided-shifts', 0, 6), number('guided-follows', 0, 6)];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('guided-feedback', 'İki kutuyu da 0–6 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const shifts = model.traceInsert(directory, 2, 6, 'array', { capacity: 7 }).counts.valueShifts;
    const follows = model.traceInsert(directory, 2, 6, 'linked').counts.linkFollows;
    if (checks[0].value === shifts && checks[1].value === follows) {
      feedback('guided-feedback', 'İki sayı da doğru. Taşıma yönünü ve iki bağ atamasını ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.', false);
    } else {
      feedback('guided-feedback', checks[0].value !== shifts
        ? 'Yeni konumdan eski son konuma kadar kaç değer yer açmak için taşınır? Sağdan sola izini yaz.'
        : 'Eklenecek konumun bir öncesi hangi düğüm? Baş adresi zaten hazır. Bağ izlemeyi iki referans atamasından ayır.', true);
    }
  });
  $('independent-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = [3, 8, 12, 17, 23];
    const access = model.traceAccess(values, 4, 'linked');
    const array = model.traceInsert(values, 3, 10, 'array', { capacity: 6 });
    const linked = model.traceInsert(values, 3, 10, 'linked');
    const checks = [
      { ...number('exit-access', 0, 10), expected: access.counts.linkFollows, label: 'erişimde bağlantı izleme' },
      { ...number('exit-shifts', 0, 10), expected: array.counts.valueShifts, label: 'dizide değer taşıma' },
      { ...number('exit-locate', 0, 10), expected: linked.counts.linkFollows, label: 'listede öncekiyi bulma' },
      { ...number('exit-pointers', 0, 10), expected: linked.counts.pointerWrites, label: 'referans ataması' }
    ];
    const invalid = checks.find(item => !item.valid);
    if (invalid) {
      feedback('exit-feedback', 'Dört sayı kutusunu da 0–10 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.', true);
      $(invalid.id).focus(); return;
    }
    const wrong = checks.filter(item => item.value !== item.expected);
    const seen = solutionSeen ? ' Model yanıt açıldı; bu denemeyi çözüm sonrası kontrol olarak işaretle.' : '';
    if (wrong.length) {
      feedback('exit-feedback', 'Yeniden bak: ' + wrong.map(item => item.label).join(', ') + '. Erişilecek konumla eklemenin önceki düğümünü ayır; her sayacın birimini söyle.' + seen, true);
    } else {
      const written = ['exit-trace', 'exit-math', 'exit-purpose', 'exit-link'].every(id => $(id).value.trim() !== '');
      feedback('exit-feedback', 'Dört sayı da beklenen değerlerle eşleşiyor. ' + (written
        ? 'Bu kontrol yazılı gerekçelerinin ve FIFO/LIFO yanıtının doğruluğunu ölçmedi; onları model yanıt ve dört ölçütle karşılaştır.'
        : 'İzi ve gerekçelerini de tamamla; yalnız sayılar bütün hedefleri göstermiyor.') + seen, false);
    }
  });
  $('independent-key').addEventListener('toggle', () => {
    if ($('independent-key').open) {
      solutionSeen = true;
      $('solution-seen').textContent = 'Model yanıt bu oturumda açıldı. İlk denemenle çözüm sonrası düzeltmeni ayrı değerlendir.';
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
  worked.open = false; let workedWasOpen = false;
  window.addEventListener('beforeprint', () => { workedWasOpen = worked.open; worked.open = true; });
  window.addEventListener('afterprint', () => { worked.open = workedWasOpen; });
  resetStorage(); resetPolicy();
  document.querySelectorAll('.js-only').forEach(node => { node.hidden = false; if (node.tagName === 'BUTTON') node.disabled = false; });
})();
