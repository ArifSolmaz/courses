(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AAWeekFour = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  function validateValues(values) {
    if (!Array.isArray(values) || values.length > 32) {
      throw new TypeError('En fazla 32 değer içeren bir dizi gerekir.');
    }
    for (let i = 0; i < values.length; i += 1) {
      if (!Number.isSafeInteger(values[i])) throw new TypeError('Değerler güvenli tam sayılar olmalıdır.');
    }
  }
  function validateStructure(structure) {
    if (structure !== 'array' && structure !== 'linked') throw new TypeError('Yapı array veya linked olmalıdır.');
  }
  function validatePosition(position, upper) {
    if (!Number.isSafeInteger(position) || position < 1 || position > upper) {
      throw new RangeError('Konum, verilen aralıkta 1 tabanlı bir tam sayı olmalıdır.');
    }
  }
  function nodesFor(values) {
    return values.map(function (value, index) {
      return { id: 'N' + (index + 1), value: value, next: index + 1 < values.length ? 'N' + (index + 2) : null, nextSet: true };
    });
  }
  function copyState(state) {
    if (state.slots) {
      const copy = { slots: state.slots.slice() };
      if ('capacity' in state) copy.capacity = state.capacity;
      if ('read' in state) copy.read = state.read === null ? null : { position: state.read.position, value: state.read.value };
      return copy;
    }
    const copy = {
      head: state.head,
      nodes: state.nodes.map(function (node) { return { id: node.id, value: node.value, next: node.next, nextSet: node.nextSet }; }),
      cursor: state.cursor
    };
    if ('read' in state) copy.read = state.read === null ? null : { position: state.read.position, value: state.read.value };
    return copy;
  }
  function readCounts() { return { indexReads: 0, linkFollows: 0, nodeValueReads: 0 }; }
  function insertCounts() { return { valueShifts: 0, valueWrites: 0, linkFollows: 0, pointerWrites: 0 }; }
  function addStep(steps, step, state, counts) {
    steps.push(Object.assign({ step: steps.length + 1 }, step, { state: copyState(state), counts: Object.assign({}, counts) }));
  }

  // Head's address is supplied. Following next and reading the reached node's
  // value are different units; they are never added into one time estimate.
  function traceAccess(values, position, structure) {
    if (structure === undefined) structure = 'array';
    validateValues(values); validateStructure(structure); validatePosition(position, values.length);
    const source = values.slice(), steps = [], counts = readCounts();
    const state = structure === 'array'
      ? { slots: source.slice(), read: null }
      : { head: 'N1', nodes: nodesFor(source), cursor: 'N1', read: null };
    const initial = copyState(state);
    if (structure === 'linked') {
      for (let from = 1; from < position; from += 1) {
        state.cursor = 'N' + (from + 1); counts.linkFollows += 1;
        addStep(steps, { op: 'follow-link', from: from, to: from + 1, fromNode: 'N' + from, toNode: 'N' + (from + 1) }, state, counts);
      }
      state.read = { position: position, value: source[position - 1] }; counts.nodeValueReads += 1;
      addStep(steps, { op: 'node-read', position: position, node: 'N' + position, value: source[position - 1] }, state, counts);
    } else {
      state.read = { position: position, value: source[position - 1] }; counts.indexReads += 1;
      addStep(steps, { op: 'index-read', position: position, value: source[position - 1] }, state, counts);
    }
    return { values: source, position: position, structure: structure, value: source[position - 1], initial: initial, steps: steps, counts: counts };
  }

  // Position p is already supplied. We do not search for sorted order.
  // Array capacity must have room; no allocation or resizing is simulated.
  // A linked node is allocated and assigned its value before counting starts.
  // nextSet=false marks an unwritten placeholder, not a counted initialization.
  function traceInsert(values, position, value, structure, options) {
    if (structure === undefined) structure = 'array';
    if (options === undefined) options = {};
    validateValues(values); validateStructure(structure); validatePosition(position, values.length + 1);
    if (!Number.isSafeInteger(value)) throw new TypeError('Eklenecek değer güvenli tam sayı olmalıdır.');
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Seçenekler bir nesne olmalıdır.');
    if ('predecessorKnown' in options && typeof options.predecessorKnown !== 'boolean') throw new TypeError('predecessorKnown doğru veya yanlış olmalıdır.');
    const source = values.slice(), steps = [], counts = insertCounts();
    const predecessorKnown = options.predecessorKnown === true;
    let capacity = null, state, initial;
    if (structure === 'array') {
      capacity = options.capacity;
      if (!Number.isSafeInteger(capacity) || capacity < source.length + 1) {
        throw new RangeError('Dizinin kapasitesi açıkça verilmeli ve en az n + 1 olmalıdır.');
      }
      // Show the used prefix and the one additional slot needed by this insert.
      state = { slots: source.concat([null]), capacity: capacity };
      initial = copyState(state);
      for (let from = source.length; from >= position; from -= 1) {
        state.slots[from] = state.slots[from - 1]; counts.valueShifts += 1;
        addStep(steps, { op: 'shift', from: from, to: from + 1, value: state.slots[from] }, state, counts);
      }
      state.slots[position - 1] = value; counts.valueWrites += 1;
      addStep(steps, { op: 'value-write', position: position, value: value }, state, counts);
    } else {
      state = {
        head: source.length ? 'N1' : null,
        nodes: nodesFor(source).concat([{ id: 'new', value: value, next: null, nextSet: false }]),
        cursor: position === 1 ? null : predecessorKnown ? 'N' + (position - 1) : 'N1'
      };
      initial = copyState(state);
      if (!predecessorKnown) {
        for (let from = 1; from < position - 1; from += 1) {
          state.cursor = 'N' + (from + 1); counts.linkFollows += 1;
          addStep(steps, { op: 'follow-link', from: from, to: from + 1, fromNode: 'N' + from, toNode: 'N' + (from + 1) }, state, counts);
        }
      }
      const added = state.nodes[state.nodes.length - 1];
      added.next = position <= source.length ? 'N' + position : null; added.nextSet = true;
      counts.pointerWrites += 1;
      addStep(steps, { op: 'pointer-write', field: 'new.next', node: 'new', next: added.next }, state, counts);
      const previousNode = position === 1 ? null : 'N' + (position - 1);
      if (position === 1) state.head = 'new';
      else state.nodes[position - 2].next = 'new';
      counts.pointerWrites += 1;
      addStep(steps, { op: 'pointer-write', field: previousNode === null ? 'head' : previousNode + '.next', node: previousNode, next: 'new' }, state, counts);
    }
    const result = source.slice(); result.splice(position - 1, 0, value);
    return { values: source, position: position, value: value, structure: structure, capacity: capacity, predecessorKnown: predecessorKnown, initial: initial, steps: steps, counts: counts, result: result };
  }

  function copyItem(item) { return item === null ? null : { token: item.token, id: item.id }; }
  function copyItems(items) { return items.map(copyItem); }

  // These are logical policy events, not implementation/time-cost measurements.
  // A token identifies a particular message, even when device IDs repeat.
  function tracePolicy(operations, policy) {
    if (policy === undefined) policy = 'fifo';
    if (policy !== 'fifo' && policy !== 'lifo') throw new TypeError('İlke fifo veya lifo olmalıdır.');
    if (!Array.isArray(operations) || operations.length > 100) throw new TypeError('En fazla 100 işlem içeren bir dizi gerekir.');
    const seen = new Set(), input = [];
    for (let i = 0; i < operations.length; i += 1) {
      const operation = operations[i];
      if (!operation || typeof operation !== 'object' || !['put', 'take'].includes(operation.type)) throw new TypeError('Her işlem put veya take olmalıdır.');
      if (operation.type === 'put') {
        if (typeof operation.token !== 'string' || !operation.token.trim() || operation.token.length > 32 || seen.has(operation.token) || !Number.isSafeInteger(operation.id)) {
          throw new TypeError('Her yeni mesajın benzersiz bir tokenı ve güvenli tam sayı kimliği olmalıdır.');
        }
        seen.add(operation.token); input.push({ type: 'put', token: operation.token, id: operation.id });
      } else input.push({ type: 'take' });
    }
    const state = [], removed = [], steps = [];
    input.forEach(function (operation, index) {
      let item = null, empty = false;
      if (operation.type === 'put') {
        item = { token: operation.token, id: operation.id }; state.push(item);
      } else if (state.length) {
        item = policy === 'fifo' ? state.shift() : state.pop(); removed.push(item);
      } else empty = true;
      steps.push({ event: index + 1, type: operation.type, item: copyItem(item), state: copyItems(state), removed: copyItems(removed), empty: empty });
    });
    return { operations: input, policy: policy, steps: steps, remaining: copyItems(state), removed: copyItems(removed) };
  }

  return Object.freeze({ traceAccess: traceAccess, traceInsert: traceInsert, tracePolicy: tracePolicy });
});
