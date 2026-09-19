/* Run pure production algorithm helpers, independently checking invariants. No browser dependencies. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
function moduleHelpers(week, names) {
  let source = fs.readFileSync(path.join(__dirname, '../assets/anim-w'+week+'.js'), 'utf8');
  source = source.replace(/\}\)\(\);\s*$/, 'globalThis.audit = {'+names.join(',')+'};})();');
  const ctx = {AAAnim: {ui: {fmt: String, esc: String}, register() {}}};
  vm.runInNewContext(source, ctx);
  return ctx.audit;
}
const sorts = moduleHelpers(13,['bubbleCount','selectionCount','insertionCount']);
let checks=0;
function equal(actual, expected) {assert.equal(JSON.stringify(actual),JSON.stringify(expected)); checks++;}
for(let n=0;n<=7;n++) {
  // Exhaustive small ternary lists include sorted/reversed, duplicates and negatives.
  for(let k=0;k<3**n;k++) {
    let q=k;const a=Array.from({length:n},()=>{const x=q%3-1;q=Math.floor(q/3);return x;});
    const expected=a.slice().sort((a,b)=>a-b);
    let inversions=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(a[i]>a[j])inversions++;
    for(const name of ['bubbleCount','selectionCount','insertionCount']){
      const r=sorts[name](a);equal(Array.from(r.a),expected);
      if(name==='selectionCount')equal(r.c,n*(n-1)/2);else equal(r.s,inversions);
    }
  }
}
const search=moduleHelpers(12,['bsResult','bsFrames']);
for(let n=0;n<=80;n++)for(let target=-1;target<=n;target++){
  const a=Array.from({length:n},(_,i)=>i);
  const result=search.bsResult(i=>a[i],n,target);
  equal(result[0],target>=0&&target<n?target:-1);
  assert(result[1]<=Math.ceil(Math.log2(n+1)));checks++;
  const frames=search.bsFrames(a,n,target);equal(frames.at(-1).result,result);
  for(const f of frames)if(f.mid!=null){assert(f.mid>=0&&f.mid<n);checks++;}
}
const anagram=moduleHelpers(9,['checkingOffOps','countOps']);
for(let n=0;n<=100;n++){
  const a=Array.from({length:n},(_,i)=>'abc'[i%3]).join('');const b=a.split('').reverse().join('');
  equal(anagram.checkingOffOps(a,b),n*(n+1)/2);equal(anagram.countOps(a,b),2*n+26);
}
equal(anagram.checkingOffOps('a','bb'),0);equal(anagram.countOps('a','bb'),0);
equal(anagram.checkingOffOps('aaa','aab'),6);equal(anagram.countOps('aaa','aab'),7);
console.log(`${checks.toLocaleString()} assertions passed: sorting results/counts, binary-search bounds and frames, anagram counts.`);
const formatting=moduleHelpers(2,['fixed','floatRepr']);
for(const [v,out] of [[-0,'-0.00'],[2.675,'2.67'],[1.125,'1.12'],[1.375,'1.38'],[-1.125,'-1.12'],[4.1*3,'12.30']])equal(formatting.fixed(v,2),out);
// Test the actual budget inversion, independently checking the time it implies.
const source13=fs.readFileSync(path.join(__dirname,'../assets/anim-w13.js'),'utf8');
const largestSource=source13.slice(source13.indexOf('    function largest('),source13.indexOf('    function words('));
for(const budget of [1,60,3600]){
  const context={budget,COST:{sortedUnit:23e-9},fmt:String};
  vm.runInNewContext(largestSource+'result=largest([[8000,0.002]],1.14,"sorted");',context);
  const n=Number(context.result.replace('≈ ',''));
  if(Number.isFinite(n)){const t=23e-9*n*Math.log2(n);assert(Math.abs(t/budget-1)<0.04);checks++;}
}
console.log(`${checks.toLocaleString()} total assertions including numeric formatting and sorting-budget inversion.`);
