const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('aa/w6/examples/cards.js','utf8')+'\nthis.cards=cards;',ctx);
vm.runInContext(fs.readFileSync('aa/w6/examples/visuals.js','utf8').replace('return {has:id=>','this.api={scenarios,valid,insertTrace,extractTrace,buildTrace,sortTrace};return {has:id=>'),ctx);
const {cards,api}=ctx,notes=fs.readFileSync('aa/w6/lecture-notes.html','utf8');let count=0;
for(const c of cards){if(!c.visual)continue;assert.equal(c.walkthrough.length,3);for(const ref of c.refs)assert(notes.includes('id="topic-'+ref+'"'),ref);for(const f of api.scenarios[c.visual]()){assert(f.title&&f.caption&&f.html);assert(!/NaN|undefined/.test(f.html+f.caption));count++}}
const topics=[...notes.matchAll(/id="topic-([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(topics.filter(x=>!cards.some(c=>c.refs?.includes(x))),[]);
assert.equal(cards.at(-1).end,180);assert.equal(cards.filter(c=>!c.visual).length,2);
const last=t=>Array.from(t.at(-1).array);assert.deepEqual(last(api.buildTrace([9,4,7,1,3,8,2])),[1,3,2,4,9,8,7]);assert.deepEqual(last(api.insertTrace([2,4,3],1)),[1,2,3,4]);assert.equal(api.insertTrace([2,4,3],1).at(-1).swaps,2);
assert.deepEqual(last(api.extractTrace([1,3,2,7,4])),[2,3,4,7]);assert.equal(api.extractTrace([1,3,2,7,4]).at(-1).comparisons,2);
assert.equal(api.scenarios.repeated('ascending').at(-1).swaps,0);assert.equal(api.scenarios.repeated('descending').at(-1).swaps,10);
let inputs=0;
function verify(a){inputs++;let h=last(api.buildTrace(a));assert(api.valid(h));assert.deepEqual(h.slice().sort((x,y)=>x-y),a.slice().sort((x,y)=>x-y));let popped=[];while(h.length){popped.push(h[0]);h=last(api.extractTrace(h));assert(api.valid(h))}assert.deepEqual(popped,a.slice().sort((x,y)=>x-y));assert.deepEqual(last(api.sortTrace(a)),a.slice().sort((x,y)=>x-y));for(const k of [-2,0,3]){const next=last(api.insertTrace(last(api.buildTrace(a)),k));assert(api.valid(next));assert.deepEqual(next.slice().sort((x,y)=>x-y),[...a,k].sort((x,y)=>x-y))}}
function enumerate(a){verify(a);if(a.length<5)for(const v of [-1,0,1])enumerate([...a,v])}enumerate([]);for(let i=0;i<200;i++)verify(Array.from({length:7},(_,j)=>((i*17+j*13)*(j+3))%29-14));
console.log(`${cards.length} screens; ${count} visual frames; all ${topics.length} lecture topics mapped; ${inputs} arrays checked for heap construction, extraction order, insertion and sorting.`);
