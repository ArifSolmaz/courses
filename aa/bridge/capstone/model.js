(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AACapstone = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DIMENSIONS = [
    { id: 'code', title: 'Kodları ve döngüleri takip etmek' },
    { id: 'math', title: 'Matematiksel ifadeleri anlamak' },
    { id: 'purpose', title: 'Konuların ne işe yaradığını görmek' },
    { id: 'links', title: 'Konular arasındaki bağlantıları kurmak' }
  ];

  // Identical pre/post rubrics compare the same reasoning operations. A choice
  // can be checked automatically; these criteria are for a human self-review.
  const RUBRICS = {
    code: [
      '0: Tahminimi yazdım; döngüde hangi değerlerin karşılaştırıldığını henüz açıklayamıyorum.',
      '1: Aday maliyeti ve mevcut uzaklığı doğru yazdım; güncelleme kararının gerekçesi eksik.',
      '2: Aday = d[B] + w(B,C) hesabını, aday < d[C] koşulunu ve koşulun d[C] üzerindeki sonucunu birlikte açıkladım.'
    ],
    math: [
      '0: Bir sayı seçtim; saydığım işlemi veya birimini henüz açıklayamıyorum.',
      '1: Altı komşuluk girdisini buldum; 2E ile ilişkisini veya ağırlık toplamından farkını eksik açıkladım.',
      '2: Tüm düğümlerden taranan komşuluk girdilerini 2 + 2 + 2 = 6 = 2E olarak saydım; bu birimin saniye ya da kenar ağırlığı toplamı olmadığını açıkladım.'
    ],
    purpose: [
      '0: Yalnız bir maliyet sayısı verdim; istenen çıktının türünü henüz ayıramıyorum.',
      '1: Ağacı ve yolu ayırdım; en az birinin kenar/düğüm listesini veya amacını eksik yazdım.',
      '2: Tüm sensörleri bağlayan ağacın kenarlarını ve mesaj yolunun sıralı düğümlerini maliyetleriyle yazdım; iki çıktının hangi farklı ihtiyacı karşıladığını açıkladım.'
    ],
    links: [
      '0: Yalnız en kısa yolun maliyetini kullandım; tam iki kenar koşulunu henüz modelleyemiyorum.',
      '1: Durumu (v,k) olarak ayırdım; taban durumunu veya neden sıradan d[v] değerinin yetmediğini eksik açıkladım.',
      '2: D[v,k] durumunu, D[A,0] = 0 ve diğer D[v,0] = ∞ tabanını yazdım; tam iki kenar kısıtını ve bir örnekte maliyetlerin eşit olmasının genel garanti olmadığını açıkladım.'
    ]
  };

  const RELAX_CODE = [
    'for v, weight in graph[u]:',
    '    candidate = dist[u] + weight',
    '    if candidate < dist[v]:',
    '        dist[v] = candidate',
    '        heappush(heap, (candidate, v))'
  ].join('\n');

  const PHASES = {
    pre: {
      title: 'Başlangıç yoklaması',
      context: 'Üç sensör A, B ve C arasında yönsüz bağlantılar var: AB = 2, BC = 2, AC = 3. Ağırlık birimi bağlantı maliyetidir. Her sensörün komşuluk listesinde iki girdi vardır. Önce kendi açıklamanı yaz; Bilmiyorum da geçerli bir başlangıçtır.',
      acWeight: 3,
      questions: [
        {
          id: 'code', title: 'Bir gevşetme adımını izle',
          prompt: 'Dijkstra A’dan başladı. A işlendiğinde dist[B] = 2 ve dist[C] = 3 oldu. Şimdi u = B; döngü C komşusunu weight = 2 ile inceliyor. candidate kaç olur ve bu if bloğu dist[C] değerini değiştirir mi? Karşılaştırmayı da yaz.',
          code: RELAX_CODE,
          options: [
            { value: 'a', label: 'candidate = 4; dist[C] koşulsuz olarak 4 yapılır.' },
            { value: 'b', label: 'candidate = 4; 4 < 3 yanlış olduğu için dist[C] = 3 kalır.' },
            { value: 'c', label: 'candidate = 2; dist[C] = 2 yapılır.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'b',
          explanation: 'Aday maliyet dist[B] + w(B,C) = 2 + 2 = 4’tür. Kod yalnız daha küçük bir aday bulursa günceller. 4 < 3 yanlış olduğundan dist[C] = 3 kalır; B üzerinden dolanmak AC bağlantısından pahalıdır.',
          rubric: RUBRICS.code
        },
        {
          id: 'math', title: 'Saydığın işlemin birimini seç',
          prompt: 'Tam BFS çalışmasında, ulaşılan her düğümün komşuluk listesindeki her girdi bir kez incelensin. Bu bağlı üçgenin tamamında kaç komşuluk girdisi taranır? 2E eşitliğini ve sayının birimini açıklayarak yanıtla. Kuyruk işlemlerini bu sayıya ekleme.',
          options: [
            { value: 'a', label: '6 komşuluk girdisi: 2 + 2 + 2 = 2E.' },
            { value: 'b', label: '3 komşuluk girdisi; yalnız farklı yönsüz kenarlar sayılır.' },
            { value: 'c', label: '7 saniye; 2 + 2 + 3 ağırlıkları çalışma süresidir.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'a',
          explanation: 'E = 3 farklı yönsüz kenardır. Her biri iki uçtaki listede göründüğü için tüm BFS taraması 2E = 6 komşuluk girdisini inceler. 2 + 2 + 3 = 7 kenar ağırlığı toplamıdır; bir işlem sayısı veya saniye ölçümü değildir.',
          rubric: RUBRICS.math
        },
        {
          id: 'purpose', title: 'İhtiyaca göre çıktıyı seç',
          prompt: 'İki ayrı teslim isteniyor: (1) bütün sensörleri en az toplam bağlantı maliyetiyle bağlayan bir ağaç; (2) A’daki tek mesajın C’ye en düşük maliyetle gideceği sıralı yol. Hangi iki somut çıktı bu iki isteği karşılar? Yalnız sayı yazmak yerine kenarları ve yolun sırasını gerekçelendir.',
          options: [
            { value: 'a', label: 'Ağaç: yalnız AC, maliyet 3. Mesaj yolu: A → C, maliyet 3.' },
            { value: 'b', label: 'Ağaç: AB ve AC, maliyet 5. Mesaj yolu: A → B → C, maliyet 4.' },
            { value: 'c', label: 'Ağaç: AB ve BC, maliyet 4. Mesaj yolu: A → C, maliyet 3.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'c',
          explanation: 'Minimum kapsayan ağaç AB ve BC kenarlarıyla üç sensörü 4 maliyetle bağlar. A’dan C’ye en kısa mesaj yolu ise doğrudan A → C’dir ve maliyeti 3’tür. Bir ağaç kenar kümesi, diğeri başlangıç ve bitişi belli sıralı bir yoldur; amaçları farklıdır.',
          rubric: RUBRICS.purpose
        },
        {
          id: 'links', title: 'Yeni kısıtı yeni duruma bağla',
          prompt: 'Mesaj A’dan C’ye tam iki kenar geçişiyle ulaşmalı; yürüyüşte tekrar ziyaret serbest. Önceki haftanın sıradan en kısa yol d[C] değeri 3’tür. Hangi durum ve taban bilgisi bu yeni isteği doğru modeller? Tam iki kenarlı yürüyüşün maliyetini de açıklamana kat.',
          options: [
            { value: 'a', label: 'D[v,k]: A’dan v’ye tam k kenarla en düşük maliyet. D[A,0] = 0, diğer D[v,0] = ∞; D[C,2] = 4.' },
            { value: 'b', label: 'Yalnız d[v] yeter; d[C] = 3 her kenar sayısı için geçerlidir.' },
            { value: 'c', label: 'Her düğümü bir kez ziyaret etmek yeter; k’yi ve taban durumunu tutmaya gerek yoktur.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'a',
          explanation: 'Tam iki kenarlı tek A–C yürüyüşü A → B → C’dir; maliyeti 4’tür. D[v,k], hedef düğümle birlikte kullanılan kenar sayısını saklar. D[A,0] = 0 ve diğer düğümlerde D[v,0] = ∞ tabanı gerekir. Sıradan en kısa yolun maliyeti 3 bu kısıtı sağlamaz; bir başka örnekte sayılar eşit olsa da bu genel bir garanti olmaz.',
          rubric: RUBRICS.links
        }
      ]
    },
    post: {
      title: 'Aktarım yoklaması',
      context: 'Aynı üç sensör ve aynı yönsüz topoloji korunuyor. Yalnız AC bağlantısının maliyeti 3’ten 5’e çıktı: AB = 2, BC = 2, AC = 5. Aynı dört düşünme adımını bu yeni veriye uygula; ilk açıklamanı kopyalamadan gerekçeni yeniden kur.',
      acWeight: 5,
      questions: [
        {
          id: 'code', title: 'Bir gevşetme adımını izle',
          prompt: 'Dijkstra A’dan başladı. A işlendiğinde dist[B] = 2 ve dist[C] = 5 oldu. Şimdi u = B; döngü C komşusunu weight = 2 ile inceliyor. candidate kaç olur ve bu if bloğu dist[C] değerini değiştirir mi? Karşılaştırmayı da yaz.',
          code: RELAX_CODE,
          options: [
            { value: 'a', label: 'candidate = 7; dist[C] = 7 yapılır.' },
            { value: 'b', label: 'candidate = 4; dist[C] = 5 kalır, çünkü yalnız doğrudan bağlantı kullanılabilir.' },
            { value: 'c', label: 'candidate = 4; 4 < 5 doğru olduğu için dist[C] = 4 yapılır.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'c',
          explanation: 'Aday dist[B] + w(B,C) = 2 + 2 = 4’tür. Bu kez 4 < 5 doğrudur: dist[C] = 4 olur ve heap’e yeni aday eklenir. Başlangıçtaki doğrudan bağlantı tahmini bir üst sınırdı; daha ucuz yol bulununca iyileştirilir.',
          rubric: RUBRICS.code
        },
        {
          id: 'math', title: 'Saydığın işlemin birimini seç',
          prompt: 'Tam BFS çalışmasında, ulaşılan her düğümün komşuluk listesindeki her girdi bir kez incelensin. Bu bağlı üçgenin tamamında kaç komşuluk girdisi taranır? 2E eşitliğini ve sayının birimini açıklayarak yanıtla. Kuyruk işlemlerini bu sayıya ekleme.',
          options: [
            { value: 'a', label: '9 saniye; 2 + 2 + 5 ağırlıkları çalışma süresidir.' },
            { value: 'b', label: '6 komşuluk girdisi: 2 + 2 + 2 = 2E.' },
            { value: 'c', label: '3 komşuluk girdisi; yalnız farklı yönsüz kenarlar sayılır.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'b',
          explanation: 'Topoloji değişmedi: E = 3, toplam komşuluk girdisi yine 2E = 6’dır. Ağırlıkların toplamı artık 9 olsa da bu BFS taramasındaki işlem sayısı aynı kalır. İşlem sayısını bağlantı maliyetiyle veya ölçülmüş süreyle karıştırmamak gerekir.',
          rubric: RUBRICS.math
        },
        {
          id: 'purpose', title: 'İhtiyaca göre çıktıyı seç',
          prompt: 'İki ayrı teslim isteniyor: (1) bütün sensörleri en az toplam bağlantı maliyetiyle bağlayan bir ağaç; (2) A’daki tek mesajın C’ye en düşük maliyetle gideceği sıralı yol. Hangi iki somut çıktı bu iki isteği karşılar? İki maliyetin de 4 olması çıktı türlerinin aynı olduğunu gösterir mi?',
          options: [
            { value: 'a', label: 'Ağaç: AB ve BC, maliyet 4. Mesaj yolu: A → B → C, maliyet 4; çıktı türleri ve amaçları farklıdır.' },
            { value: 'b', label: 'Her iki çıktı da yalnız 4 sayısıdır; kenar kümesi veya sıralı yol gerekli değildir.' },
            { value: 'c', label: 'Ağaç: yalnız AC, maliyet 5. Mesaj yolu: A → C, maliyet 5.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'a',
          explanation: 'Minimum kapsayan ağaç yine AB ve BC kenarlarından oluşur ve maliyeti 4’tür. En kısa mesaj yolu artık A → B → C, yine maliyet 4’tür. Bu örnekte maliyetler ve kullanılan kenarlar çakışır; ağaç tüm sensörleri bağlama, sıralı yol ise belirli mesajı ulaştırma çıktısıdır. Tek bir sayısal eşitlik iki problemi özdeş yapmaz.',
          rubric: RUBRICS.purpose
        },
        {
          id: 'links', title: 'Yeni kısıtı yeni duruma bağla',
          prompt: 'Mesaj A’dan C’ye tam iki kenar geçişiyle ulaşmalı; yürüyüşte tekrar ziyaret serbest. Bu yeni grafikte sıradan en kısa yol maliyeti de 4’tür. Tam iki kenar isteğini hangi durum ve taban bilgisi doğru modeller? Bu örnekte iki maliyetin eşit olmasının neden genel bir garanti olmadığını açıkla.',
          options: [
            { value: 'a', label: 'Yalnız d[v] yeter; bu örnekte 4 bulunduğu için d[v] her grafikte tam iki kenarı zorunlu kılar.' },
            { value: 'b', label: 'Her düğümü bir kez ziyaret etmek yeter; k’yi ve taban durumunu tutmaya gerek yoktur.' },
            { value: 'c', label: 'D[v,k]: A’dan v’ye tam k kenarla en düşük maliyet. D[A,0] = 0, diğer D[v,0] = ∞; D[C,2] = 4, fakat eşitlik genel garanti değildir.' },
            { value: 'd', label: 'Bilmiyorum.' }
          ],
          correct: 'c',
          explanation: 'Tam iki kenarlı yürüyüş A → B → C, maliyet 4’tür. Sıradan en kısa yolun maliyetinin de 4 olması bu örneğe özgüdür; önceki AC = 3 grafiğinde 3 ve 4 farklıydı. Kenar sayısını zorunlu kılan bilgi hâlâ (v,k) durumudur: D[A,0] = 0, diğer D[v,0] = ∞ ve D[v,k] komşuların bir önceki k katmanından hesaplanır.',
          rubric: RUBRICS.links
        }
      ]
    }
  };

  function finiteWeight(value, name) {
    if (typeof value !== 'number') throw new TypeError(name + ' must be a number');
    if (!Number.isFinite(value) || value < 0) throw new RangeError(name + ' must be finite and nonnegative');
    return value;
  }

  function integer(value, name) {
    if (typeof value !== 'number') throw new TypeError(name + ' must be a number');
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(name + ' must be a nonnegative safe integer');
    return value;
  }

  function validateGraph(graph) {
    if (!graph || typeof graph !== 'object' || Array.isArray(graph)) throw new TypeError('graph must be an adjacency object');
    const prototype = Object.getPrototypeOf(graph);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError('graph must be a plain adjacency object');
    if (Object.getOwnPropertySymbols(graph).length) throw new TypeError('node names must be strings');
    const nodes = Object.keys(graph), known = new Set(nodes);
    for (const node of nodes) {
      if (!node) throw new TypeError('node names must be nonempty strings');
      if (!Array.isArray(graph[node])) throw new TypeError('each adjacency list must be an array');
      const neighbors = new Set();
      for (const edge of graph[node]) {
        if (!Array.isArray(edge) || edge.length !== 2 || typeof edge[0] !== 'string' || !known.has(edge[0])) {
          throw new TypeError('each edge must name an existing node and a weight');
        }
        if (neighbors.has(edge[0])) throw new TypeError('duplicate adjacency entries are not supported');
        neighbors.add(edge[0]);
        finiteWeight(edge[1], 'edge weight');
      }
    }
    for (const node of nodes) {
      for (const [neighbor, weight] of graph[node]) {
        if (!graph[neighbor].some(edge => edge[0] === node && edge[1] === weight)) {
          throw new TypeError('the graph must be undirected with equal reverse weights');
        }
      }
    }
    return nodes;
  }

  function requireNode(nodes, node, name) {
    if (typeof node !== 'string') throw new TypeError(name + ' must be a node name');
    if (!nodes.includes(node)) throw new RangeError(name + ' is not in the graph');
  }

  function addCosts(a, b) {
    const sum = a + b;
    if (Number.isFinite(a) && Number.isFinite(b) && !Number.isFinite(sum)) {
      throw new RangeError('path cost exceeds the finite number range');
    }
    return sum;
  }

  function buildGraph(acWeight = 3) {
    finiteWeight(acWeight, 'AC weight');
    return { A: [['B', 2], ['C', acWeight]], B: [['A', 2], ['C', 2]], C: [['A', acWeight], ['B', 2]] };
  }

  function bfsTrace(graph, start) {
    const nodes = validateGraph(graph); requireNode(nodes, start, 'start');
    const distances = Object.fromEntries(nodes.map(node => [node, Infinity]));
    const queue = [start], visited = new Set([start]), frames = [];
    distances[start] = 0;
    function frame(event, node, neighbor, note) {
      frames.push({ step: frames.length, event, node, neighbor, queue: queue.slice(), visited: Array.from(visited), distances: { ...distances }, note });
    }
    frame('init', start, null, start + ' keşfedildi; uzaklık 0 kenar, kuyrukta başlangıç var.');
    while (queue.length) {
      const node = queue.shift();
      frame('pop', node, null, node + ' kuyruğun başından alındı.');
      for (const [neighbor] of graph[node]) {
        const isNew = !visited.has(neighbor);
        frame('scan', node, neighbor, node + ' → ' + neighbor + ' komşuluk girdisi tarandı. ' + (isNew ? 'Bu düğüm henüz keşfedilmedi.' : 'Bu düğüm zaten keşfedilmiş; kuyruğa yeniden eklenmez.'));
        if (isNew) {
          visited.add(neighbor); distances[neighbor] = distances[node] + 1; queue.push(neighbor);
          frame('discover', node, neighbor, neighbor + ' keşfedildi, uzaklığı ' + distances[neighbor] + ' kenar; kuyruğun sonuna eklendi.');
        }
      }
    }
    frame('finish', null, null, 'Kuyruk boş. Uzaklıklar kenar sayısıdır; BFS bu ağırlıklı grafikte maliyeti en aza indirmeyi garanti etmez.');
    return frames;
  }

  function dijkstraTrace(graph, start) {
    const nodes = validateGraph(graph); requireNode(nodes, start, 'start');
    const order = new Map(nodes.map((node, i) => [node, i]));
    const distances = Object.fromEntries(nodes.map(node => [node, Infinity]));
    const settled = new Set(), queue = [{ node: start, distance: 0 }], frames = [];
    distances[start] = 0;
    function sortedQueue() {
      return queue.map(item => ({ ...item })).sort((a, b) => a.distance - b.distance || order.get(a.node) - order.get(b.node));
    }
    function frame(event, node, neighbor, candidate, previous, changed, note) {
      frames.push({ step: frames.length, event, node, neighbor, queue: sortedQueue(), distances: { ...distances }, settled: Array.from(settled), candidate, previous, changed, note });
    }
    frame('init', start, null, null, null, false, 'Başlangıç uzaklığı 0; diğer uzaklıklar ∞. Kuyruk en düşük aday maliyeti önce seçer.');
    while (queue.length) {
      queue.sort((a, b) => a.distance - b.distance || order.get(a.node) - order.get(b.node));
      const item = queue.shift(), node = item.node;
      if (settled.has(node) || item.distance !== distances[node]) {
        frame('skip', node, null, item.distance, distances[node], false, 'Kuyruktaki eski aday atlandı; güncel uzaklık değişmedi.');
        continue;
      }
      settled.add(node);
      frame('settle', node, null, null, null, false, node + ' en düşük güncel maliyetle seçildi; negatif olmayan ağırlıklarda uzaklığı kesinleşir.');
      for (const [neighbor, weight] of graph[node]) {
        const candidate = addCosts(distances[node], weight), previous = distances[neighbor];
        const changed = candidate < previous;
        if (changed) { distances[neighbor] = candidate; queue.push({ node: neighbor, distance: candidate }); }
        frame('scan', node, neighbor, candidate, previous, changed,
          'Aday = d[' + node + '] + w(' + node + ',' + neighbor + ') = ' + distances[node] + ' + ' + weight + ' = ' + candidate + '. ' + candidate + ' < ' + (previous === Infinity ? '∞' : previous) + (changed ? ' doğru: uzaklık güncellendi ve yeni aday kuyruğa eklendi.' : ' yanlış: uzaklık aynı kaldı.'));
      }
    }
    frame('finish', null, null, null, null, false, 'Kuyruk boş. Ulaşılamayan düğümlerin uzaklığı ∞; bulunan uzaklıklar toplam bağlantı maliyetidir.');
    return frames;
  }

  // A disconnected nonempty graph has no spanning tree: return Infinity, not
  // the weight of a spanning forest. The empty graph has weight zero here.
  function mstWeight(graph) {
    const nodes = validateGraph(graph);
    if (!nodes.length) return 0;
    const visited = new Set([nodes[0]]); let total = 0;
    while (visited.size < nodes.length) {
      let next = null;
      for (const node of visited) {
        for (const [neighbor, weight] of graph[node]) {
          if (!visited.has(neighbor) && (!next || weight < next.weight)) next = { node: neighbor, weight };
        }
      }
      if (!next) return Infinity;
      visited.add(next.node); total = addCosts(total, next.weight);
    }
    return total;
  }

  function shortestCost(graph, start, end) {
    const nodes = validateGraph(graph); requireNode(nodes, start, 'start'); requireNode(nodes, end, 'end');
    const frames = dijkstraTrace(graph, start);
    return frames[frames.length - 1].distances[end];
  }

  function exactWalkCost(graph, start, end, k) {
    const nodes = validateGraph(graph); requireNode(nodes, start, 'start'); requireNode(nodes, end, 'end'); integer(k, 'k');
    let previous = Object.fromEntries(nodes.map(node => [node, node === start ? 0 : Infinity]));
    for (let edges = 1; edges <= k; edges++) {
      const current = Object.fromEntries(nodes.map(node => [node, Infinity]));
      for (const node of nodes) {
        for (const [neighbor, weight] of graph[node]) {
          current[node] = Math.min(current[node], addCosts(previous[neighbor], weight));
        }
      }
      previous = current;
    }
    return previous[end];
  }

  function verifyCover(graph, candidate) {
    const nodes = validateGraph(graph), known = new Set(nodes);
    if (!Array.isArray(candidate)) return false;
    for (const node of candidate) if (typeof node !== 'string' || !known.has(node)) return false;
    const selected = new Set(candidate);
    if (selected.size !== candidate.length) return false;
    return nodes.every(node => graph[node].every(([neighbor]) => selected.has(node) || selected.has(neighbor)));
  }

  function pairCount(n) {
    integer(n, 'n');
    const result = n * (n - 1) / 2;
    if (!Number.isSafeInteger(result)) throw new RangeError('pair count exceeds the exact integer range');
    return result === 0 ? 0 : result;
  }

  function assess(phase, answers) {
    if (typeof phase !== 'string' || !Object.prototype.hasOwnProperty.call(PHASES, phase)) throw new RangeError('phase must be pre or post');
    const input = answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
    let complete = true, correctCount = 0;
    const results = PHASES[phase].questions.map(question => {
      const answer = Object.prototype.hasOwnProperty.call(input, question.id) ? input[question.id] : null;
      const isObject = answer && typeof answer === 'object' && !Array.isArray(answer);
      const choice = isObject && typeof answer.choice === 'string' ? answer.choice : null;
      const validChoice = question.options.some(option => option.value === choice);
      const reason = isObject && typeof answer.reason === 'string' ? answer.reason.trim() : '';
      if (!validChoice || reason.length < 1 || reason.length > 1200) complete = false;
      const correct = validChoice && choice === question.correct;
      if (correct) correctCount++;
      return { id: question.id, correct, expected: question.correct, explanation: question.explanation };
    });
    return { complete, results, correctCount };
  }

  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  }
  freeze(DIMENSIONS); freeze(PHASES);
  return Object.freeze({ DIMENSIONS, PHASES, buildGraph, bfsTrace, dijkstraTrace, mstWeight, shortestCost, exactWalkCost, verifyCover, pairCount, assess });
});
