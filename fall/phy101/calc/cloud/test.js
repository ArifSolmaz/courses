const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{},console};vm.createContext(ctx);
for(const f of ['../challenges.js','core.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),ctx);
const C=ctx.PhyCloud, A='browser-aaaaaaaaaaaa', B='browser-bbbbbbbbbbbb';
let n=0,now=1000000;
function command(s,client,action,extra={}){const cmd={client,action,revision:s.revision,request:'request-'+String(++n).padStart(16,'0'),...extra};C.apply(s,cmd,now,()=>String(n),()=>.42);return cmd;}
let checks=0;function test(name,fn){fn();checks++;console.log('ok '+name);}
test('server controls round identity and timing across PCs',()=>{
 const s=C.blank();command(s,A,'claim');command(s,A,'create',{question:'W2-C1',seconds:120});command(s,A,'start');
 assert.equal(C.view(s,[],B,now).round.deadline,now+120000);assert.equal(C.view(s,[],B,now).control,false);
 command(s,B,'claim');assert.throws(()=>command(s,A,'pause'),/read-only/);assert.equal(C.view(s,[],B,now).round.deadline,now+120000);
});
test('stale updates and repeated commands cannot overwrite or duplicate',()=>{
 const s=C.blank();const cmd=command(s,A,'claim');assert.equal(C.apply(s,cmd,now,()=>'',Math.random).duplicate,true);assert.equal(s.revision,1);
 assert.throws(()=>command(s,A,'create',{revision:0,question:'W2-C1',seconds:120}),/Session changed/);
 const create=command(s,A,'create',{question:'W2-C1',seconds:120});C.apply(s,create,now,()=>'',Math.random);assert.equal(s.rounds.length,1);
});
test('server expiry survives closing every browser and cannot resume',()=>{
 const s=C.blank();command(s,A,'claim');command(s,A,'create',{question:'W2-C1',seconds:60});command(s,A,'start');
 assert.equal(C.normalise(s,now+61000),true);assert.equal(s.rounds[0].status,'ended');assert.throws(()=>command(s,A,'start'),/cannot be started/);
});
test('early, paused and late answers filtered before first attempt',()=>{
 const s=C.blank();command(s,A,'claim');command(s,A,'create',{question:'W2-C1',seconds:120});command(s,A,'start');
 const start=now;now+=10000;command(s,A,'pause');now+=10000;command(s,A,'start');now+=10000;command(s,A,'reveal');
 const r=s.rounds[0],ch=ctx.window.CALC_CHALLENGES[0],answer=ch.answer(r.params);
 const row=(time,id,answer,seq)=>({time,id,answer:String(answer),code:String(r.code),seq});
 const result=C.score(r,[row(start-1,'001',0,1),row(start+1000,'001',answer,2),row(start+15000,'002',answer,3),row(now,'003',answer,4),row(start+25000,'001',0,5)]);
 assert.equal(result.correct,1);assert.equal(result.rejected,3);assert.equal(result.repeats,1);assert.equal(result.rows[0].id,'001');assert.equal(result.rows[0].points,13);
 const view=C.view(s,[row(start+1000,'001',answer,2)],B,now);assert.equal(view.totals[0].points,13);assert.equal(C.view(s,[row(start+1000,'001',answer,2)],B,now).totals[0].points,13);
});
test('new codes unique even if the random source repeats',()=>{
 const s=C.blank();command(s,A,'claim');command(s,A,'create',{question:'W2-C1',seconds:120});command(s,A,'create',{question:'W3-C2',seconds:120});assert.notEqual(s.rounds[0].code,s.rounds[1].code);
});
test('answer and animation parameters withheld until reveal',()=>{
 const s=C.blank();command(s,A,'claim');command(s,A,'create',{question:'W2-C1',seconds:120});assert.equal(C.view(s,[],A,now).round.answer,undefined);assert.equal(C.view(s,[],A,now).round.params,undefined);
});
test('all question types produce correct cloud scores',()=>{
 for(const ch of ctx.window.CALC_CHALLENGES)for(let i=0;i<30;i++){
  const p=ch.gen(),round={question:ch.id,params:p,code:5678,windows:[{start:0,end:100}]};
  assert.equal(C.score(round,[{time:1,id:'1234',code:'5678',answer:ch.answer(p).toPrecision(3),seq:1}]).correct,1);
 }
});
test('invalid codes, student IDs and number formats cannot receive points',()=>{
 const ch=ctx.window.CALC_CHALLENGES[0],p=ch.gen(),r={question:ch.id,params:p,code:5678,windows:[{start:0,end:100}]};
 assert.equal(C.score(r,[{time:1,id:'__proto__',code:'5678',answer:ch.answer(p),seq:1}]).rows.length,0);
 assert.equal(C.score(r,[{time:1,id:'123',code:'5678.0',answer:ch.answer(p),seq:1}]).rows.length,0);
 assert.equal(C.number('6.2e-4'),.00062);assert.equal(C.number('17,3'),17.3);assert.ok(Number.isNaN(C.number('17garbage')));
});
console.log(checks+' cloud-state tests passed');
