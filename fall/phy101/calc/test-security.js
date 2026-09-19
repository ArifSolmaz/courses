/* Deterministic security regressions; no browser, network or real student data.
   Run: node fall/phy101/calc/test-security.js */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let now = Date.parse('2026-09-20T10:00:00Z'), tick, boot;
const nodes = new Map();
function node() {
  return { value: '', disabled: true, style: {}, children: [], classList: {add(){},remove(){},toggle(){}},
    appendChild(n) { this.children.push(n); return n; }, insertBefore(){},
    addEventListener(){}, setAttribute(){}, click(){ if(this.onclick) this.onclick(); },
    innerHTML: '', textContent: '' };
}
const document = { readyState: 'loading', body: node(),
  getElementById(id) { if(!nodes.has(id)) nodes.set(id,node()); return nodes.get(id); },
  createElement: node, addEventListener(event, fn) { if(event==='DOMContentLoaded') boot=fn; } };
class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now(){return now;} }
const ctx = { document, Date: Clock, console, setTimeout, clearTimeout,
  localStorage: {getItem(){return null;},setItem(){}},
  setInterval(fn){ tick=fn; return 1; }, clearInterval(){}, alert(){}, confirm(){return false;} };
ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['challenges.js','console.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx);
boot();
const C=ctx.CALC_CONSOLE, ch=ctx.CALC_CHALLENGES[0];
const get=id=>document.getElementById(id);
const iso=t=>new Date(t).toISOString();
let checks=0;
function check(label, fn){fn();checks++;console.log('ok '+label);}
C.setRound(2,0,4567);
const answer=ch.answer(C.paramsFor(ch,4567));
const head=['Timestamp','Student ID','Code','Answer'];
const row=(t,id,ans=answer,code='4567')=>[iso(t),id,code,String(ans)];
const score=rows=>C.scoreRows([head,...rows],{ch,code:4567});
const start=now;
check('untimed rounds cannot earn points',()=>assert.match(score([row(now,'1')]).err,/timing/));
get('btn-start').click();
now+=10000; get('btn-start').click(); // pause
now+=10000; get('btn-start').click(); // resume
now+=10000; get('btn-reveal').click();
check('start, pause, resume and reveal persist two closed windows',()=>{
  const h=C.db().history.find(h=>h.code===4567);
  assert.deepEqual(JSON.parse(JSON.stringify(h.windows)),[{start,end:start+10000},{start:start+20000,end:start+30000}]);
});
check('early, paused, deadline and post-reveal answers are excluded',()=>{
 const result=score([row(start-1,'early'),row(start+1000,'valid'),row(start+10000,'pause'),row(start+15000,'paused'),row(start+21000,'valid2'),row(start+30000,'end'),row(start+40000,'late')]);
 assert.equal(result.rows.length,2);assert.equal(result.excluded,5);
});
check('first attempt chosen chronologically, not lexicographically',()=>{
 const result=score([row(start+21000,'1',answer),row(start+1000,'1',999999),row(start-1,'1',answer)]);
 assert.equal(result.rows[0].ok,false);assert.equal(result.repeats,1);
});
check('late guesses cannot win under last or best policy',()=>{
 for(const attempt of ['first','last','best']) {C.setPrefs({attempt});assert.equal(score([row(start+1000,'1',999999),row(start+40000,'1',answer)]).rows[0].ok,false);}
 C.setPrefs({attempt:'first'});
});
check('malformed codes never become valid codes',()=>{
 for(const code of ['4a567','4567.0','04567','4567abc']) assert.ok(score([row(start+1000,'1',answer,code)]).err);
});
check('missing and ambiguous timestamps fail closed',()=>{
 assert.match(C.scoreRows([head.slice(1),['1','4567',String(answer)]],{ch,code:4567}).err,/Timestamp/);
 for(const ts of ['', '09/20/2026 10:00:01', 'not a date']) assert.ok(score([[ts,'1','4567',String(answer)]]).err);
});
check('prototype property names cannot bypass duplicate handling',()=>{
 for(const id of ['__proto__','constructor','toString']) assert.equal(score([row(start+1000,id),row(start+2000,id)]).rows.length,1);
});
check('decimal comma and scientific notation are accepted',()=>{
 assert.equal(C.parseNum('17,3'),17.3);assert.equal(C.parseNum('6.2e-4'),0.00062);
 for(const value of ['2^3','17e','17garbage']) assert.ok(Number.isNaN(C.parseNum(value)));
});
check('reveal cannot restart the same round',()=>{get('btn-start').click();assert.equal(C.state.running,false);});
check('timer follows elapsed time even when callbacks are delayed',()=>{
 get('btn-new').click();get('btn-start').click();now+=125000;tick();assert.equal(C.state.left,0);assert.equal(C.state.running,false);
});
check('changing question closes the original round, not the new one',()=>{
 get('btn-new').click();const old=C.state.code;get('btn-start').click();now+=1000;get('btn-next').click();
 assert.equal(C.db().history.find(h=>h.code===old).windows[0].end,now);assert.notEqual(C.state.code,old);
});
check('all 15 challenges accept rounded correct answers and reject traps across 100 draws',()=>{
 assert.equal(ctx.CALC_CHALLENGES.length,15);
 for(const challenge of ctx.CALC_CHALLENGES) for(let code=1000;code<1100;code++) {
  const p=C.paramsFor(challenge,code), a=challenge.answer(p);
  assert.ok(Number.isFinite(a));assert.ok(ctx.CALC_MARK(challenge,p,+a.toPrecision(3)));
  for(const trap of challenge.traps) assert.equal(ctx.CALC_MARK(challenge,p,trap.value(p)),false,challenge.id+'/'+code);
 }
});
console.log(`${checks} security and functional checks passed`);
