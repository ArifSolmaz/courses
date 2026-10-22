#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), vm = require('node:vm'), { createHash } = require('node:crypto');
const modelPath = path.resolve(__dirname, '../w14/model.js');
const api = require(modelPath);
const started = Date.now();
let checks = 0, cases = 0;
const groups = [];
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const ok = (v, m) => { assert.ok(v, m); checks++; };
const throws = (f, m) => { assert.throws(f, m); checks++; cases++; };
const copy = v => JSON.parse(JSON.stringify(v));
const mainV = [4, 7, 11, 18, 20, 24, 26, 31];
const mainE = [[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
const independentV = [4,7,18,24], independentE = [[18,24,3],[24,7,1],[7,4,2],[18,7,1],[24,4,7]];
// This acceptance oracle has no event/check-order implementation. It builds an
// adjacency matrix, then directly evaluates the mathematical certificate facts.
function oracle(V, E, s, t, k, B, candidate, simple) {
  if (!Array.isArray(candidate) || candidate.length > 64 || candidate.length !== k + 1) return false;
  if (!candidate.every(v => Number.isSafeInteger(v) && v >= 0 && V.includes(v))) return false;
  if (candidate[0] !== s || candidate.at(-1) !== t) return false;
  if (simple && new Set(candidate).size !== candidate.length) return false;
  const matrix = V.map(() => V.map(() => null));
  for (const [u,v,w] of E) { matrix[V.indexOf(u)][V.indexOf(v)] = w; matrix[V.indexOf(v)][V.indexOf(u)] = w; }
  const weights = candidate.slice(1).map((v,i) => matrix[V.indexOf(candidate[i])][V.indexOf(v)]);
  return weights.every(w => w !== null) && weights.reduce((a,b) => a+b,0) <= B;
}
function trace(V,E,s,t,k,B,candidate,simple=true,detailed=true) {
  const tr = api.traceCertificate(V,E,s,t,k,B,candidate,{simple}); cases++;
  eq(tr.result.accepted,oracle(V,E,s,t,k,B,candidate,simple),'independent mathematical certificate acceptance');
  if (detailed) inspectTrace(tr,V,E,candidate);
  return tr;
}
function inspectTrace(tr,V,E,candidate) {
  eq(tr.operation,'certificate'); eq(tr.initialState,{phase:'idle',index:null,checkedIds:[],uniqueIds:[],checkedEdges:[],total:0,activeEdge:null,violation:null,accepted:null,done:false});
  const count = {lengthChecks:0,idChecks:0,endpointChecks:0,repeatChecks:0,edgeChecks:0,costAdds:0,budgetChecks:0};
  const increments = {length:'lengthChecks',id:'idChecks',endpoint:'endpointChecks',repeat:'repeatChecks',edge:'edgeChecks',add:'costAdds',budget:'budgetChecks'};
  const ranks = {idle:0,format:1,length:2,ids:3,endpoints:4,simple:5,edges:6,budget:7,complete:8};
  const phase = {start:'format',length:'length',id:'ids',endpoint:'endpoints',repeat:'simple',edge:'edges',add:'edges',budget:'budget',accept:'complete',reject:'complete'};
  let total=0, ids=[], unique=[], attempted=[], active=null, rank=0;
  eq(tr.steps[0].type,'start');
  for (let i=0; i<tr.steps.length; i++) {
    const st=tr.steps[i],state=st.state;
    eq(st.ordinal,i+1); ok(Object.hasOwn(phase,st.type)); eq(state.phase,phase[st.type]); ok(ranks[state.phase]>=rank); rank=ranks[state.phase];
    if (increments[st.type]) count[increments[st.type]]++;
    if (st.type==='start') eq(st.formatValid,Array.isArray(candidate)&&candidate.length<=64);
    if (st.type==='length') {eq(st.actual,candidate.length);eq(st.expected,tr.k+1);eq(st.passed,candidate.length===tr.k+1);}
    if (st.type==='id') {
      const raw=candidate[st.index],passed=Number.isSafeInteger(raw)&&raw>=0&&V.includes(raw);
      eq(st.id,Number.isSafeInteger(raw)?raw:null);eq(st.passed,passed);if(passed)ids.push(raw);eq(state.index,st.index);
    }
    if (st.type==='endpoint') {eq(st.actual,candidate[st.index]);eq(st.expected,st.kind==='source'?tr.source:tr.target);eq(st.index,st.kind==='source'?0:tr.k);eq(st.passed,st.actual===st.expected);}
    if (st.type==='repeat') {
      const first=candidate.slice(0,st.index).indexOf(st.id),passed=first===-1;
      eq(st.id,candidate[st.index]);eq(st.firstIndex,passed?null:first);eq(st.passed,passed);if(passed)unique.push(st.id);
    }
    if (st.type==='edge') {
      const from=candidate[st.index-1],to=candidate[st.index],edge=E.find(([u,v])=>u===from&&v===to||v===from&&u===to),exists=Boolean(edge),weight=exists?edge[2]:null;
      eq([st.from,st.to,st.exists,st.weight,st.passed],[from,to,exists,weight,exists]);
      active={from,to,exists,weight};attempted.push(active);
      eq(tr.steps[i+1].type,exists?'add':'reject','check edge before a separate cost addition');
    }
    if (st.type==='add') {eq(st.previous,total);eq(st.weight,active.weight);eq([st.from,st.to],[active.from,active.to]);total+=st.weight;eq(st.total,total);}
    if (!['edge','add'].includes(st.type)) active=null;
    if (st.type==='budget') {eq(st.total,total);eq(st.B,tr.B);eq(st.passed,total<=tr.B);eq(count.costAdds,tr.k);}
    eq(state.checkedIds,ids);eq(state.uniqueIds,unique);eq(state.checkedEdges,attempted);eq(state.total,total);eq(state.activeEdge,active);eq(st.counts,count);
    const terminal=st.type==='accept'||st.type==='reject';eq(state.done,terminal);eq(state.accepted,terminal?st.type==='accept':null);eq(state.violation,st.type==='reject'?{reason:st.reason,index:st.index}:null);
    if (terminal) {eq(i,tr.steps.length-1);eq(state.index,st.type==='reject'?st.index:null);}
    else if (st.type==='start'&&!st.formatValid||Object.hasOwn(st,'passed')&&!st.passed) eq(tr.steps[i+1].type,'reject','first failed fact stops immediately');
    if (i) {ok(st.state!==tr.steps[i-1].state);ok(st.counts!==tr.steps[i-1].counts);ok(st.state.checkedIds!==tr.steps[i-1].state.checkedIds);ok(st.state.uniqueIds!==tr.steps[i-1].state.uniqueIds);ok(st.state.checkedEdges!==tr.steps[i-1].state.checkedEdges);}
  }
  eq(tr.counts,count);eq(tr.result.accepted,tr.steps.at(-1).type==='accept');eq(tr.result.reason,tr.result.accepted?'valid':tr.steps.at(-1).reason);eq(tr.result.cost,count.budgetChecks?total:null);
  if (!tr.simple) {eq(count.repeatChecks,0);eq(unique,[]);}
  eq(count.costAdds,attempted.filter(e=>e.exists).length);
  ok(count.edgeChecks<=tr.k);ok(count.costAdds<=tr.k);ok(count.idChecks<=tr.k+1);ok(count.repeatChecks<=tr.k+1);
  ok(!Object.hasOwn(tr.result,'exists')&&!Object.hasOwn(tr.result,'optimal')&&!Object.hasOwn(tr.result,'minimum'),'verifier exposes no global decision or optimum claim');
}
function sequences(alphabet,length) { let result=[[]]; for(let i=0;i<length;i++)result=result.flatMap(p=>alphabet.map(x=>p.concat(x)));return result; }
function permutations(a) { if(!a.length)return[[]];return a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])); }
function graphPairs(n) {const pairs=[];for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)pairs.push([u,v]);return pairs;}
function hamilton(V,E,s,t,p) {return p.length===V.length&&p[0]===s&&p.at(-1)===t&&new Set(p).size===V.length&&p.every(v=>V.includes(v))&&p.slice(1).every((v,i)=>E.some(([u,w])=>u===p[i]&&w===v||w===p[i]&&u===v));}
function group(name,fn) {const before={checks,cases},at=Date.now();fn();groups.push({name,status:'passed',cases:cases-before.cases,checks:checks-before.checks,durationMs:Date.now()-at});}

group('Known independent fixtures, fail order, full vs partial cost and no global NO',()=>{
  const good=trace(mainV,mainE,24,31,4,12,[24,18,7,11,31]);eq(good.steps.length,24);eq(good.result,{accepted:true,reason:'valid',cost:12});eq(good.counts,{lengthChecks:1,idChecks:5,endpointChecks:2,repeatChecks:5,edgeChecks:4,costAdds:4,budgetChecks:1});
  eq(trace(mainV,mainE,24,31,4,10,[24,18,7,11,31]).result,{accepted:false,reason:'budget',cost:12});
  const repeated=trace(mainV,mainE,24,31,4,10,[24,20,31,20,31]);eq(repeated.steps.length,14);eq(repeated.result,{accepted:false,reason:'repeat',cost:null});eq(repeated.steps.at(-1).index,3);eq(repeated.counts.repeatChecks,4);eq(repeated.counts.edgeChecks,0);
  const walk=trace(mainV,mainE,24,31,4,10,[24,20,31,20,31],false);eq(walk.steps.length,19);eq(walk.result.cost,10);eq(walk.counts.repeatChecks,0);
  const missing=trace(mainV,mainE,24,31,4,100,[24,18,4,11,31]);eq(missing.result,{accepted:false,reason:'missing-edge',cost:null});eq(missing.counts.edgeChecks,2);eq(missing.counts.costAdds,1);eq(missing.steps.at(-1).state.total,3);eq(missing.steps.at(-2).state.activeEdge,{from:18,to:4,exists:false,weight:null});
  for(const [candidate,reason,index]of[[[18,24,7,11,31],'source',0],[[24,18,7,11,20],'target',4],[[24,99,31,20,31],'unknown-id',1],[[24,31],'length',null],[null,'format',null],[Array(65).fill(24),'format',null]]) {const t=trace(mainV,mainE,24,31,4,12,candidate);eq(t.result.reason,reason);eq(t.steps.at(-1).index,index);}
  for(const bad of['24',24.5,-1,null,undefined,NaN,Infinity,{},[],true]) {const p=[24,18,bad,11,31],t=trace(mainV,mainE,24,31,4,12,p);eq(t.result.reason,'unknown-id');eq(t.counts.idChecks,3);eq(t.counts.endpointChecks,0);}
  const arr=[];arr.length=5;eq(trace(mainV,mainE,24,31,4,12,arr).result.reason,'unknown-id');
  const both=trace(mainV,mainE,24,31,4,10,[18,7,18,7,11]);eq(both.result.reason,'source');eq(both.counts.endpointChecks,1);eq(both.counts.repeatChecks,0);
  eq(trace(mainV,mainE,24,24,0,0,[24]).result,{accepted:true,reason:'valid',cost:0});eq(trace(mainV,mainE,24,31,0,0,[24]).result.reason,'target');eq(trace(mainV,mainE,24,24,0,0,[]).result.reason,'length');
  eq(trace([0],[],0,0,0,0,[0]).result.cost,0);
  const indepGood=trace(independentV,independentE,18,4,3,6,[18,24,7,4]),indepBad=trace(independentV,independentE,18,4,3,6,[18,7,24,4]);eq(indepGood.result,{accepted:true,reason:'valid',cost:6});eq(indepBad.result,{accepted:false,reason:'budget',cost:9});ok(permutations(independentV).some(p=>oracle(independentV,independentE,18,4,3,6,p,true)),'a rejected certificate can coexist with a YES instance');
});

group('Exhaustive n≤3 weighted graphs, all bounded candidates/source/target/mode/budget',()=>{
  for(let n=1;n<=3;n++) {const V=Array.from({length:n},(_,i)=>i),pairs=graphPairs(n),configurations=3**pairs.length;
    for(let code=0;code<configurations;code++) {let digits=code;const E=[];for(const[u,v]of pairs){const state=digits%3;digits=Math.floor(digits/3);if(state)E.push([u,v,state-1]);}
      for(let k=0;k<=3;k++)for(const p of sequences(V,k+1))for(const s of V)for(const t of V)for(const simple of[false,true])for(const B of[0,1,3])trace(V,E,s,t,k,B,p,simple,false);
    }
  }
});

group('Every-event invariants on all n≤3 graphs and all candidate words, including zero edges',()=>{
  const V=[0,1,2],pairs=graphPairs(3);for(let code=0;code<27;code++){let digits=code;const E=[];for(const[u,v]of pairs){const st=digits%3;digits=Math.floor(digits/3);if(st)E.push([u,v,st-1]);}for(let k=0;k<=3;k++)for(const p of sequences(V,k+1))for(const simple of[false,true])trace(V,E,0,2,k,1,p,simple,true);}
});

group('Hamilton s→t unit-cost reduction: every graph and permutation through n=4',()=>{
  for(let n=1;n<=4;n++){const V=Array.from({length:n},(_,i)=>i),pairs=graphPairs(n),ps=permutations(V);for(let mask=0;mask<2**pairs.length;mask++){const E=pairs.filter((_,i)=>mask>>i&1);for(const s of V)for(const t of V){const input={V:copy(V),E:copy(E)},reduced=api.transformHamiltonianST(V,E,s,t);cases++;eq(reduced,{vertices:V,edges:E.map(([u,v])=>[u,v,1]),source:s,target:t,k:n-1,B:n-1,simple:true});eq({V,E},input);let left=false,right=false;for(const p of ps){const original=hamilton(V,E,s,t,p),tr=trace(reduced.vertices,reduced.edges,s,t,reduced.k,reduced.B,p,true,false);eq(tr.result.accepted,original,'same individual certificate');left||=original;right||=tr.result.accepted;}eq(right,left,'existential equivalence, not inferred from one rejection');}}}
});

group('Selected n=5 graphs and endpoint permutations; main n=8 unit instance; standalone transform',()=>{
  const V=[0,1,2,3,4],pairs=graphPairs(5);let seed=47231;for(let sample=0;sample<64;sample++){seed=(1664525*seed+1013904223)>>>0;const E=pairs.filter((_,i)=>seed>>i&1);for(const s of V)for(const t of V.filter(v=>v!==s)){const transformed=api.transformHamiltonianST(V,E,s,t),middle=V.filter(v=>v!==s&&v!==t);let left=false,right=false;for(const p of permutations(middle).map(m=>[s,...m,t])){const a=hamilton(V,E,s,t,p),tr=trace(V,transformed.edges,s,t,4,4,p,true,false);eq(tr.result.accepted,a);left||=a;right||=tr.result.accepted;}eq(left,right);}}
  const mainUnweighted=mainE.map(([u,v])=>[u,v]),transformed=api.transformHamiltonianST(mainV,mainUnweighted,24,31);eq(transformed.k,7);eq(transformed.B,7);let mainExists=false;for(const mid of permutations(mainV.filter(v=>v!==24&&v!==31))){const p=[24,...mid,31],a=hamilton(mainV,mainUnweighted,24,31,p),tr=trace(mainV,transformed.edges,24,31,7,7,p,true,false);eq(tr.result.accepted,a);mainExists||=a;}eq(mainExists,false,'26 is a non-endpoint leaf; independent enumeration confirms no Hamilton s→t path');
  const chain=[[18,24],[24,7],[7,4]],r=api.transformHamiltonianST(independentV,chain,18,4);eq(trace(r.vertices,r.edges,r.source,r.target,r.k,r.B,[18,24,7,4]).result.cost,3);ok(!Object.hasOwn(r,'result')&&!Object.hasOwn(r,'found')&&!Object.hasOwn(r,'accepted'),'transform constructs only, never solves');
});

group('Bounds, negative remote weight rejection, purity, snapshots, exports and malformed domain',()=>{
  const V=Array.from({length:32},(_,i)=>i),E=V.slice(1).map((v,i)=>[i,v,1000000]),p=V.slice(),input=copy({V,E,p});const t=trace(V,E,0,31,31,Number.MAX_SAFE_INTEGER,p);eq(t.result.cost,31000000);eq({V,E,p},input);const saved=copy(t);p[0]=99;V[0]=99;E[0][2]=0;eq(t,saved,'mutating inputs after return cannot mutate trace');t.certificate[0]=123;eq(t.steps[2].state.checkedIds[0],0);const withEdge=t.steps.find(s=>s.type==='edge');withEdge.state.checkedEdges[0].weight=777;eq(t.edges[0].weight,1000000);eq(t.steps.find(s=>s.type==='add').state.checkedEdges[0].weight,1000000);
  const big=Number.MAX_SAFE_INTEGER;eq(trace([0,big],[[0,big,1000000]],0,big,1,1000000,[0,big]).result.cost,1000000);eq(trace([0,1],[[0,1,0]],0,1,31,0,Array.from({length:32},(_,i)=>i%2),false).result.cost,0);eq(trace([0,1],[[0,1,0]],0,1,31,0,Array.from({length:32},(_,i)=>i%2),true).result.reason,'repeat');
  const accessor=[];Object.defineProperty(accessor,0,{enumerable:true,get(){throw new Error('Do not run candidate getter');}});accessor.length=1;eq(api.traceCertificate([0],[],0,0,0,0,accessor).result.reason,'unknown-id');cases++;
  const valid=()=>api.traceCertificate([0,1],[[0,1,1]],0,1,1,1,[0,1]);eq(valid().result.accepted,true);eq(api.traceCertificate([0,1],[[0,1,1]],0,1,1,1,[0,1]).simple,true);
  for(const V of[null,[],Array.from({length:33},(_,i)=>i),[0,0],[-1],[0.5],[Infinity],['0']])throws(()=>api.traceCertificate(V,[],0,0,0,0,[0]));
  for(const E of[null,[null],[[0,1]],[[0,1,1,2]],[[0,2,1]],[[0,0,1]],[[0,1,1],[1,0,2]],[[0,1,-1]],[[0,1,1.5]],[[0,1,1000001]],[[0,1,NaN]],[[0,1,'1']]])throws(()=>api.traceCertificate([0,1],E,0,1,1,1,[0,1]));
  throws(()=>api.traceCertificate([0,1,2,3],[[0,1,1],[2,3,-1]],0,1,1,1,null));
  for(const k of[-1,0.5,32,NaN,'1'])throws(()=>api.traceCertificate([0,1],[[0,1,1]],0,1,k,1,[0,1]));
  for(const B of[-1,0.5,Infinity,Number.MAX_SAFE_INTEGER+1,'1'])throws(()=>api.traceCertificate([0,1],[[0,1,1]],0,1,1,B,[0,1]));
  for(const opts of[null,true,[],{simple:1},{simple:'false'}])throws(()=>api.traceCertificate([0,1],[[0,1,1]],0,1,1,1,[0,1],opts));
  throws(()=>api.traceCertificate([0,1],[[0,1,1]],2,1,1,1,[0,1]));throws(()=>api.traceCertificate([0,1],[[0,1,1]],0,2,1,1,[0,1]));
  for(const args of[[[],[],0,0],[[0,1],[[0,1],[1,0]],0,1],[[0],[[0,0]],0,0],[[0,1],[[0,1,1]],0,1],[[0,1],[[0,2]],0,1],[[0,1],[],0,2]])throws(()=>api.transformHamiltonianST(...args));
  const rv=[4,0,2],re=[[4,0],[2,4]],rr=api.transformHamiltonianST(rv,re,0,2);rv[0]=7;re[0][0]=7;eq(rr,{vertices:[0,2,4],edges:[[0,4,1],[2,4,1]],source:0,target:2,k:2,B:2,simple:true});
  const sandbox={};vm.runInNewContext(fs.readFileSync(modelPath,'utf8'),sandbox);eq(typeof sandbox.FreshWeek14.traceCertificate,'function');eq(typeof sandbox.FreshWeek14.transformHamiltonianST,'function');eq(Object.isFrozen(sandbox.FreshWeek14),true);eq(JSON.parse(JSON.stringify(sandbox.FreshWeek14.traceCertificate([0,1],[[1,0,1]],0,1,1,1,[0,1]))).result,{accepted:true,reason:'valid',cost:1});
});
const report={status:'passed',cases,checks,durationMs:Date.now()-started,modelSha256:createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'),groups,independentOracle:'Adjacency-matrix certificate predicates; exhaustive weighted small graphs and all bounded candidate words. Reduction equivalence uses independent Hamilton s→t permutation checks. Exponential enumeration occurs only in this test script, never in the product model.',bounds:{vertices:32,k:31,candidate:64,weight:1000000,budget:'nonnegative safe integer'},examples:{simple:{path:[24,18,7,11,31],B:12,cost:12},walk:{path:[24,20,31,20,31],B:10,cost:10,firstRepeat:{id:20,index:3,firstIndex:1}},independent:{good:{path:[18,24,7,4],cost:6},bad:{path:[18,7,24,4],cost:9},B:6},reduction:{k:3,B:3,path:[18,24,7,4]}}};
const reportAt=process.argv.indexOf('--report');if(reportAt!==-1){if(!process.argv[reportAt+1])throw new Error('--report requires a destination');const dest=path.resolve(process.argv[reportAt+1]);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
