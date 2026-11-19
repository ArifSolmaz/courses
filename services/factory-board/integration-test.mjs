import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';
const base=process.env.TEST_API||'http://127.0.0.1:8787',suffix=randomBytes(4).toString('hex'),token=()=>randomBytes(32).toString('hex');
async function call(path,{body,auth,origin='http://127.0.0.1:8877'}={}){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer '+auth}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
const a=token(),b=token(),c=token(),name='Test-'+suffix;
assert.equal((await call('/board?shift=steady')).status,401);
assert.equal((await call('/join',{body:{nickname:name,classCode:'BAD-CODE',token:a}})).status,403);
assert.equal((await call('/join',{body:{nickname:name,classCode:'AA-DEMO',token:a}})).status,200);
assert.equal((await call('/join',{body:{nickname:name,classCode:'AA-DEMO',token:a}})).status,200);
assert.equal((await call('/join',{body:{nickname:name,classCode:'AA-DEMO',token:b}})).status,409);
assert.equal((await call('/join',{body:{nickname:'Peer-'+suffix,classCode:'AA-DEMO',token:b}})).status,200);
assert.equal((await call('/join',{body:{nickname:name,classCode:'AA-OTHER',token:c}})).status,200);
assert.equal((await call('/score',{auth:a,body:{shift:'steady',policy:'queue',order:['A','B','C','D','E','F'],onTime:999}})).status,200);
let board=await call('/board?shift=steady',{auth:b});const row=board.data.rows.find(r=>r.nickname===name);assert.equal(row.onTime,6);assert.equal(row.maxWait,1);
assert.equal((await call('/board?shift=steady',{auth:c})).data.rows.some(r=>r.nickname===name),false);
assert.equal((await call('/score',{auth:b,body:{shift:'burst',policy:'free',order:['F','A','B','C','D','E']}})).status,400);
assert.equal((await call('/score',{auth:a,body:{shift:'steady',policy:'stack',order:['B','C','D','E','F','A']}})).data.saved,false);
assert.equal((await call('/board?shift=steady',{auth:a,origin:'https://untrusted.example'})).status,403);
console.log('PASS: two independent identities see shared data; class isolation, reserved aliases, auth, CORS, replay, forged-score rejection and best-only updates.');

assert.equal((await call('/play-board')).status,401);
const goal={game:'robot',kind:'classic',level:1,plan:['B','A','C'],points:9999};
assert.equal((await call('/progress',{auth:a,body:goal})).data.points,10);
assert.equal((await call('/progress',{auth:a,body:goal})).data.points,0);
assert.equal((await call('/progress',{auth:a,body:{...goal,plan:['A','B','C']}})).status,400);
assert.equal((await call('/progress',{auth:a,body:{game:'depot',kind:'adventure',level:1,seed:1,plan:[7,21,28,14],structure:'hash',erase:'mark'}})).status,400);
const progress=await call('/play-board',{auth:b}),mine=progress.data.rows.find(r=>r.nickname===name);
assert.equal(mine.games.robot,1);assert.equal(mine.games.factory,1);assert.equal(mine.points,20);
assert.equal((await call('/play-board',{auth:c})).data.rows.find(r=>r.nickname===name).points,0);
assert.equal(progress.data.nickname,'Peer-'+suffix);
console.log('PASS: all-game board authenticated/class-scoped; replay and fixed-order validation; duplicates award zero; forged points ignored; prior Factory result contributes.');

const quest={game:'robot',kind:'quest',mode:'repair',plan:{order:['B','A','C']},answer:0,points:999};
assert.equal((await call('/progress',{auth:a,body:quest})).data.points,10);
assert.equal((await call('/progress',{auth:a,body:quest})).data.points,0);
assert.equal((await call('/progress',{auth:a,body:{...quest,answer:1}})).status,400);
const updated=(await call('/play-board',{auth:b})).data;
assert.equal(updated.rows.find(r=>r.nickname===name).points,30);
assert.equal(Object.values(updated.totals).reduce((a,b)=>a+b,0),48);
console.log('PASS: new quest shared across identities, duplicate earns zero, wrong explanation rejected, 480-point cap.');

// Old and new generators share one classroom milestone.
const {createRequire}=await import('node:module'),require=createRequire(import.meta.url);
const A=require('../../aa/play-lab/adventures/model.js'),Legacy=require('./legacy-adventure-cases.cjs');
for(const game of ['commands','depot']){
 function submission(model,version){const seed=4,s=model[game==='commands'?'commandSpec':'depotSpec'](3,seed),b={game,kind:'adventure',level:3,seed,...(version?{caseVersion:version}:{})};
  if(game==='commands'){b.plan=A.commandBest(s);if(s.mode==='stack')b.plan.reverse();}
  else{b.erase='mark';outer:for(const mode of s.modes)for(const p of A.perm(s.keys)){if(A.depot(s,p,mode).cost===A.depotBest(s)){b.structure=mode;b.plan=p;break outer;}}}return b;
 }
 const old=submission(Legacy),fresh=submission(A,2);
 assert.equal((await call('/progress',{auth:a,body:old})).data.points,10);
 assert.equal((await call('/progress',{auth:a,body:fresh})).data.points,0);
 assert.equal((await call('/progress',{auth:b,body:fresh})).data.points,10);
 assert.equal((await call('/progress',{auth:b,body:old})).data.points,0);
 assert.equal((await call('/progress',{auth:b,body:{...fresh,caseVersion:99}})).status,400);
}
console.log('PASS: legacy/new cases accepted in either order; each shared milestone awards 10 only once.');

for(const game of ['robot','sorting']){
 function submission(model,caseVersion){const seed=10,b={game,kind:'adventure',level:3,seed,caseVersion};
  if(game==='robot'){const s=model.routeSpec(3,seed);b.plan=A.perm(Object.keys(s.points).filter(x=>x!=='S')).find(p=>{const r=A.route(s,p);return r.valid&&r.cost===A.routeBest(s);});}
  else Object.assign(b,A.sortBest(model.sortSpec(3,seed)).plan);return b;
 }
 const old=submission(Legacy,2),fresh=submission(A,3);
 assert.equal((await call('/progress',{auth:a,body:old})).data.points,10);
 assert.equal((await call('/progress',{auth:a,body:fresh})).data.points,0);
 assert.equal((await call('/progress',{auth:b,body:fresh})).data.points,10);
 assert.equal((await call('/progress',{auth:b,body:old})).data.points,0);
}
console.log('PASS: Robot/Sorting v2 and v3 share milestone IDs; either completion order awards points only once.');
