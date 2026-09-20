/* Pure lesson checks. Run: node fall/phy101/calc/test-walkthrough.js */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},document:{readyState:'loading',addEventListener(){}},console};
context.window.localStorage={getItem(){return null;}};
vm.createContext(context);
for(const name of ['challenges.js','console.js','walkthrough.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),context);
const w=context.window, guide=w.CALC_WALKTHROUGH;
let lessons=0;
for(const ch of w.CALC_CHALLENGES) for(let code=1000;code<1100;code++) {
 const p=w.CALC_CONSOLE.paramsFor(ch,code), plan=guide.plans(ch,p);
 assert.ok(plan && plan.steps.length);
 let ans=0;
 for(const step of plan.steps) {
  // Independently evaluate the actual typed expression (not the stored display result).
  const evaluated=vm.runInNewContext(step.expression.replace(/\^2/g,'**2'),{
   Ans:ans,sqrt:Math.sqrt,sin:x=>Math.sin(x*Math.PI/180),cos:x=>Math.cos(x*Math.PI/180),atan:x=>Math.atan(x)*180/Math.PI
  },{timeout:100});
  assert.ok(Math.abs(evaluated-step.value)<1e-10*Math.max(1,Math.abs(evaluated)),ch.id+' step mismatch');
  ans=evaluated;
 }
 assert.ok(Math.abs(ans-ch.answer(p))<1e-10*Math.max(1,Math.abs(ans)),ch.id+' wrong answer');
 for(const lang of ['en','tr']) {
  const frames=guide.frames(ch,p,lang);
  assert.equal(frames[frames.length-1].result,ch.answer(p).toPrecision(3));
  assert.ok(frames.every(f=>f.note && f.result!==undefined));
  assert.equal(frames.filter(f=>f.key==='=').length,plan.steps.length);
  assert.ok(frames.some(f=>f.key==='AC'));
  if(ch.id==='W2-C1') assert.ok(frames.some(f=>f.key==='(−)'));
  if(ch.id==='W4-C2') {
   const shift=frames.findIndex(f=>f.key==='SHIFT');
   assert.ok(shift>0);assert.equal(frames[shift+1].key,'tan');
  }
  if(ch.id==='W3-C3'||ch.id==='W5-C3') assert.ok(frames.some(f=>f.key==='×10ˣ'));
 }
 lessons++;
}
console.log(`${lessons} lesson variants passed: expressions, intermediate values, final answers and both languages.`);
