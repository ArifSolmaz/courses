(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FreshWeek6 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  // Public API: compareJobs(a,b), traceInsert(heap,job), traceExtract(heap).
  // Jobs: {id,device,priority,seq}; seq is a positive global arrival number.
  // Heap/trace indices are zero-based; a lesson can display index+1 positions.
  // One comparison compares the complete (priority,seq) tuple abstractly.
  // Swaps are separate units. Append/remove/replace-root, index arithmetic,
  // validation and snapshot auditing are outside both operation counters.
  function validateJob(job) {
    if (!job || typeof job !== 'object' || Array.isArray(job)
      || typeof job.id !== 'string' || !job.id.trim() || job.id.length > 24
      || !Number.isSafeInteger(job.device) || job.device < 0
      || !Number.isSafeInteger(job.priority)
      || !Number.isSafeInteger(job.seq) || job.seq < 1) {
      throw new TypeError('Her iş id, negatif olmayan cihaz kimliği, tam sayı öncelik ve pozitif geliş sırası içermelidir.');
    }
  }
  function copyJob(job) { return job === null ? null : { id: job.id, device: job.device, priority: job.priority, seq: job.seq }; }
  function copyHeap(heap) { return heap.map(copyJob); }
  function compare(a, b) {
    if (a.priority < b.priority) return -1;
    if (a.priority > b.priority) return 1;
    return a.seq < b.seq ? -1 : a.seq > b.seq ? 1 : 0;
  }
  function compareJobs(a, b) { validateJob(a); validateJob(b); return compare(a, b); }
  function heapIsValid(heap) {
    for (let i = 1; i < heap.length; i += 1) {
      if (compare(heap[Math.floor((i - 1) / 2)], heap[i]) > 0) return false;
    }
    return true;
  }
  function validateHeap(heap) {
    if (!Array.isArray(heap) || heap.length > 32) throw new TypeError('En fazla 32 iş içeren bir heap dizisi gerekir.');
    const ids = new Set(), arrivals = new Set();
    for (let i = 0; i < heap.length; i += 1) {
      validateJob(heap[i]);
      if (ids.has(heap[i].id) || arrivals.has(heap[i].seq)) throw new TypeError('İş etiketleri ve geliş sıraları ayrı ayrı benzersiz olmalıdır.');
      ids.add(heap[i].id); arrivals.add(heap[i].seq);
    }
    if (!heapIsValid(heap)) throw new RangeError('Başlangıç dizisi (öncelik,geliş sırası) anahtarına göre geçerli bir min-heap olmalıdır.');
  }
  function emit(steps, event, heap, counts) {
    steps.push(Object.assign({ step: steps.length + 1 }, event, {
      heap: copyHeap(heap), counts: { comparisons: counts.comparisons, swaps: counts.swaps }, heapValid: heapIsValid(heap)
    }));
  }
  function compareAt(heap, left, right, purpose, counts, steps) {
    const result = compare(heap[left], heap[right]); counts.comparisons += 1;
    emit(steps, { type: 'compare', left: left, right: right, result: result, purpose: purpose }, heap, counts);
    return result;
  }
  function swapAt(heap, i, j, counts, steps) {
    const held = heap[i]; heap[i] = heap[j]; heap[j] = held; counts.swaps += 1;
    emit(steps, { type: 'swap', i: i, j: j }, heap, counts);
  }
  function finish(operation, initial, steps, heap, result, inserted, counts) {
    return { operation: operation, initial: copyHeap(initial), steps: steps, heap: copyHeap(heap), result: copyJob(result), inserted: copyJob(inserted), counts: { comparisons: counts.comparisons, swaps: counts.swaps }, heapValid: heapIsValid(heap) };
  }

  function traceInsert(source, job) {
    validateHeap(source); validateJob(job);
    if (source.length >= 32) throw new RangeError('Bu ders modelinde en fazla 32 iş tutulabilir.');
    if (source.some(function (old) { return old.id === job.id; })) throw new TypeError('Yeni işin etiketi zaten kullanılıyor.');
    if (job.seq <= Math.max.apply(null, [0].concat(source.map(function (old) { return old.seq; })))) {
      throw new RangeError('Yeni işin geliş numarası mevcut işlerden büyük olmalıdır; genel geliş sayacı her yeni işte artırılır.');
    }
    const initial = copyHeap(source), heap = copyHeap(source), steps = [], counts = { comparisons: 0, swaps: 0 };
    heap.push(copyJob(job)); let current = heap.length - 1;
    emit(steps, { type: 'append', index: current, job: copyJob(job) }, heap, counts);
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (compareAt(heap, current, parent, 'up', counts, steps) >= 0) break;
      swapAt(heap, current, parent, counts, steps); current = parent;
    }
    return finish('insert', initial, steps, heap, null, job, counts);
  }

  function traceExtract(source) {
    validateHeap(source);
    const initial = copyHeap(source), heap = copyHeap(source), steps = [], counts = { comparisons: 0, swaps: 0 };
    if (heap.length === 0) {
      emit(steps, { type: 'empty' }, heap, counts);
      return finish('extract', initial, steps, heap, null, null, counts);
    }
    const minimum = copyJob(heap[0]);
    if (heap.length === 1) {
      heap.pop(); emit(steps, { type: 'remove', index: 0, job: copyJob(minimum) }, heap, counts);
      return finish('extract', initial, steps, heap, minimum, null, counts);
    }
    const from = heap.length - 1, replacement = heap.pop(); heap[0] = replacement;
    // Taking the last job to the root also removes the previous root. This is
    // a conceptual replacement step, not an exchange of two surviving jobs.
    emit(steps, { type: 'replace-root', from: from, to: 0, job: copyJob(replacement), removed: copyJob(minimum) }, heap, counts);
    let current = 0;
    while (2 * current + 1 < heap.length) {
      const left = 2 * current + 1, right = left + 1;
      let child = left;
      if (right < heap.length && compareAt(heap, left, right, 'choose-child', counts, steps) > 0) child = right;
      if (compareAt(heap, child, current, 'down', counts, steps) >= 0) break;
      swapAt(heap, current, child, counts, steps); current = child;
    }
    return finish('extract', initial, steps, heap, minimum, null, counts);
  }
  return Object.freeze({ compareJobs: compareJobs, traceInsert: traceInsert, traceExtract: traceExtract });
});
