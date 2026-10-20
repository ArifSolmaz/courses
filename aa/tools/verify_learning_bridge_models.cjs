/* Execute the production lesson helpers against independent result/count oracles.
 * Run: node aa/tools/verify_learning_bridge_models.cjs
 * No browser or third-party package is required; production files stay unchanged.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
let assertions = 0;
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
function eq(actual, expected, message) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
  assertions++;
}
function ok(condition, message) {assert.ok(condition, message); assertions++;}
function section(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Missing production boundaries: ${start}`);
  return source.slice(a, b);
}
function visualHelpers(week, names) {
  const source = read(`aa/w${week}/examples/visuals.js`);
  const marker = ' return {has:';
  assert.equal(source.split(marker).length, 2, 'Expected one visual module return');
  const instrumented = source.replace(marker, ` globalThis.audit={${names.join(',')}};${marker}`);
  const context = {};
  vm.runInNewContext(instrumented, context, {timeout: 3000});
  return context.audit;
}

// Week 4: use the functions actually called by the linked shift counter.
const shiftContext = {};
vm.runInNewContext(section(read('aa/w4/lecture-notes.html'), 'function insArr(', 'const mkA=') +
  ';globalThis.audit={insArr,delArr};', shiftContext);
for (let n = 0; n <= 40; n++) {
  const original = Array.from({length:n}, (_, i) => 100 + i);
  for (let i = 0; i <= n; i++) {
    const values = original.slice();
    eq(shiftContext.audit.insArr(values, i, 8), n - i, `Insertion shifts: n=${n}, i=${i}`);
    eq(values, [...original.slice(0,i), 8, ...original.slice(i)], 'Insertion preserves every old value');
  }
  for (let i = 0; i < n; i++) {
    const values = original.slice();
    eq(shiftContext.audit.delArr(values, i), n-i-1, 'Deletion shift count excludes removed item');
    eq(values, original.filter((_, j) => j !== i), 'Deletion preserves remaining order');
  }
}
eq(shiftContext.audit.insArr([4,7,9,12], 2, 8), 2, 'Week 4 worked example');

// Week 5: expose the original lookup/operation helpers, with view-only DOM stubs.
const controls = new Map();
function control(selector) {
  if (!controls.has(selector)) controls.set(selector, {value: selector === '#ht2_del' ? 'tomb' : ''});
  return controls.get(selector);
}
const hashContext = {$:control, num:String, mkStep:() => ({set(){}})};
vm.runInNewContext(section(read('aa/w5/lecture-notes.html'), 'const H2={', 'function h2go(') +
  ';globalThis.audit={H2,h2find,h2do};', hashContext);
const hashing = hashContext.audit;
function setTable(cells) {
  Object.assign(hashing.H2, {m:cells.length, mode:'lin', cells:cells.slice(), n:cells.filter(x=>x!==null&&x!=='T').length, coll:0});
}
function find(target, index, sequence) {
  const result = hashing.h2find(target);
  eq(result.found, index >= 0, 'Lookup existence');
  eq(result.idx, index, 'Lookup result index');
  eq(result.seq, sequence, 'Lookup inspects the independently expected slot route');
  ok(result.seq.length <= hashing.H2.m, 'A missing key never loops beyond m probes');
  const cells=JSON.stringify(hashing.H2.cells),frames=hashing.h2do('srch',target);
  eq(frames.at(-1).probes,sequence.length,'The actual search stepper reports the same probe count');
  eq(JSON.stringify(hashing.H2.cells),cells,'Searching does not mutate the table');
  return result;
}
setTable(Array(7).fill(null));
for (const key of [7,14,21]) hashing.h2do('ins',key);
eq(hashing.H2.cells, [7,14,21,null,null,null,null], 'Worked input builds the stated table');
find(21,2,[0,1,2]); find(28,-1,[0,1,2,3]);
hashing.h2do('del',14);
eq(hashing.H2.cells, [7,'T',21,null,null,null,null], 'Deletion keeps a tombstone');
find(21,2,[0,1,2]);
hashing.h2do('ins',21);
eq(hashing.H2.n, 2, 'Duplicate check continues past a tombstone');
eq(hashing.H2.cells, [7,'T',21,null,null,null,null], 'An existing key is not duplicated in a tombstone');
hashing.h2do('ins',28);
eq(hashing.H2.cells, [7,28,21,null,null,null,null], 'New key can reuse a tombstone');
setTable([7,14,21,null,null,null,null]); control('#ht2_del').value='naive'; hashing.h2do('del',14);
find(21,-1,[0,1]); // The intentionally broken mode demonstrates the advertised failure.
control('#ht2_del').value='tomb';
setTable(Array(7).fill(null));
for (const key of [6,13,20]) hashing.h2do('ins',key);
eq(hashing.H2.cells, [13,20,null,null,null,null,6], 'Linear probing wraps from slot 6 to slot 0');
find(20,1,[6,0,1]); hashing.h2do('del',13); find(20,1,[6,0,1]);
setTable([0,1,2,3,4,5,6]);
ok(find(7,-1,[0,1,2,3,4,5,6]).exhausted, 'A full-table miss terminates after m probes');
setTable(Array(7).fill('T')); find(7,-1,[0,1,2,3,4,5,6]);
setTable(Array(7).fill(null)); hashing.h2do('ins',-1); find(-1,6,[6]);
for (let m=3; m<=13; m++) {
  setTable(Array(m).fill(null));
  for (let i=0; i<m; i++) hashing.h2do('ins',i*m);
  for (let i=0; i<m; i++) find(i*m,i,Array.from({length:i+1},(_,j)=>j));
  find(m*m,-1,Array.from({length:m},(_,j)=>j));
  hashing.h2do('ins',m*m);
  eq(hashing.H2.n,m,'Insertion into a full table does not lose existing records');
}

// Week 6: all short ternary heaps, including ties, empty/root cases and both
// stopping early and rising to the root. The oracle is the initial ancestor
// path, while correctness is checked by heap order and multiset invariants.
const heaps = visualHelpers(6,['insertTrace','extractTrace','buildTrace']);
const sorted = values => Array.from(values).sort((a,b)=>a-b);
function validHeap(values) {
  return values.every((value,i) => !i || values[Math.floor((i-1)/2)] <= value);
}
function ancestorCost(input,key) {
  const ancestors=[];
  for(let i=input.length; i>0;) {i=Math.floor((i-1)/2);ancestors.push(input[i]);}
  const firstStop=ancestors.findIndex(value => value <= key);
  return firstStop < 0 ? {comparisons:ancestors.length,swaps:ancestors.length} :
    {comparisons:firstStop+1,swaps:firstStop};
}
for(let n=0;n<=6;n++) for(let code=0;code<3**n;code++) {
  let q=code;
  const input=Array.from({length:n},()=>{const value=q%3-1;q=Math.floor(q/3);return value;});
  const built=heaps.buildTrace(input).at(-1).array;
  ok(validHeap(built),'Bottom-up builder returns a valid heap'); eq(sorted(built),sorted(input),'Builder preserves the multiset');
  if(!validHeap(input))continue;
  for(const key of [-2,-1,0,1,2]) {
    const initial=input.slice(), result=heaps.insertTrace(input,key).at(-1), expected=ancestorCost(input,key);
    ok(validHeap(result.array),'Insertion restores every parent-child edge');
    eq(sorted(result.array),sorted([...input,key]),'Insertion preserves every occurrence');
    eq(result.comparisons,expected.comparisons,'Insertion key comparison count');
    eq(result.swaps,expected.swaps,'Insertion swap count');
    eq(input,initial,'The trace leaves the caller input unchanged');
  }
  const extracted=heaps.extractTrace(input).at(-1).array;
  ok(validHeap(extracted),'Extraction restores heap order, including empty and singleton heaps');
  eq(sorted(extracted),sorted(input).slice(input.length ? 1 : 0),'Extraction removes exactly one minimum');
}
for(const [input,key,output,comparisons] of [
  [[2,5,4,9,7,8],1,[1,5,2,9,7,8,4],2],
  [[1,3,2,7,5,4,6],0,[0,1,2,3,5,4,6,7],3],
]) {
  const result=heaps.insertTrace(input,key).at(-1);
  eq(result.array,output,'New bridge heap trace'); eq(result.comparisons,comparisons,'New bridge key count');
  eq(result.swaps,comparisons,'Every comparison in these two rising examples causes a swap');
}

// Week 7: expected stable output is obtained by independently sorting tagged
// records. The earlier last-origin rank tells when one input becomes empty.
const sorting = visualHelpers(7,['merge','mergeSort']);
function sortedLists(maxLength) {
  const result=[];
  function add(list,min) {
    result.push(list);
    if(list.length===maxLength)return;
    for(let value=min;value<=1;value++)add([...list,value],value);
  }
  add([],-1); return result;
}
for(const left of sortedLists(4))for(const right of sortedLists(4)) {
  let primitiveCalls=0;
  const tagged=(values,origin)=>values.map((key,i)=>({key,origin,id:`${origin}:${i}`,
    valueOf(){primitiveCalls++;return key;},toString(){return String(key);}}));
  const a=tagged(left,0),b=tagged(right,1);
  const expected=[...a,...b].sort((x,y)=>x.key-y.key||x.origin-y.origin||x.id.localeCompare(y.id));
  const lastLeft=expected.map(x=>x.origin).lastIndexOf(0),lastRight=expected.map(x=>x.origin).lastIndexOf(1);
  const comparisons=left.length&&right.length?Math.min(lastLeft,lastRight)+1:0;
  const result=sorting.merge(a,b).at(-1);
  eq(result.result.map(x=>x.id),expected.map(x=>x.id),'Merge output preserves sortedness, occurrences and left-first stability');
  eq(result.comparisons,comparisons,'Merge comparisons stop when either input becomes empty');
  eq(primitiveCalls,2*comparisons,'Published merge counter matches actual key comparisons');
  eq(result.writes,left.length+right.length,'Every output, including leftovers, is written exactly once in this model');
}
for(const [left,right,count] of [
  [[2,5],[1,4],3], [[1,3,5],[2,4,6],5], [[],[1,2,3],0], [[1,1],[1,1],2],
]) eq(sorting.merge(left,right).at(-1).comparisons,count,'Worked/guided or boundary merge count');
for(let k=0;k<=8;k++) {
  const n=2**k,input=Array.from({length:n},(_,i)=>n-i),frames=sorting.mergeSort(input);
  eq(frames.at(-1).result,sorted(input),'Merge sort produces a sorted sequence');
  const writes=frames.reduce((sum,frame)=>sum+Number(frame.caption.match(/writes (\d+) items/)?.[1]||0),0);
  eq(writes,n*k,'Power-of-two model counts n writes on each merge level, T(1)=0');
  if(n>=2) {
    const left=Array.from({length:n/2},(_,i)=>2*i),right=left.map(x=>x+1);
    eq(sorting.merge(left,right).at(-1).comparisons,n-1,'Interleaved inputs attain the distinct n−1 comparison bound');
  }
}
eq(sorting.mergeSort([]).at(-1).result,[],'An empty sorting input is already sorted');
console.log(`PASS ${assertions.toLocaleString()} assertions: production shift/probe/heap/merge helpers; independent results/counts; empty, duplicate, full, tombstone and wraparound boundaries; write recurrence and key comparison counts.`);
