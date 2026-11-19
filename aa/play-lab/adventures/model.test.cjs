const assert=require('node:assert/strict'),M=require('./model.js');
for(let l=0;l<4;l++)for(let seed=1;seed<=12;seed++){
 const r=M.routeSpec(l,seed),ids=Object.keys(r.points).filter(x=>x!=='S'),routes=M.perm(ids).map(p=>M.route(r,p));assert(routes.some(x=>x.valid&&x.cost===M.routeBest(r)));assert(routes.filter(x=>x.valid).every(x=>x.cost>=0));
 const c=M.commandSpec(l,seed),path=M.commandBest(c);assert(M.command(c,c.mode==='stack'?[...path].reverse():path).won);assert(path.length<=20);
 const s=M.sortSpec(l,seed),best=M.sortBest(s);let min=Infinity;for(let cut=0;cut<s.a.length;cut++)for(const a of ['selection','insertion'])for(const b of ['selection','insertion']){const out=M.sorting(s,cut,a,b);assert.deepEqual(out.a,[...s.a].sort((a,b)=>a-b));assert.equal(out.cost,out.comparisons+s.writeWeight*out.writes);min=Math.min(min,out.cost);}assert.equal(best.cost,min);
}
const r=M.routeSpec(0);assert.equal(M.route(r,['B','A','C']).cost,14);assert.equal(M.nearest(r).cost,16);
const c=M.commandSpec(0);assert(M.command(c,['R']).error);assert(!M.command(c,[]).won);
const d=M.depotSpec(1);assert(!M.depot(d,d.keys,'hash','empty').valid);assert(M.depot(d,d.keys,'hash','mark').valid);
for(let l=0;l<4;l++)for(let seed=1;seed<=2;seed++){const s=M.depotSpec(l,seed);let min=Infinity;for(const mode of s.modes)for(const order of (s.fixed?[s.keys]:M.perm(s.keys))){const r=M.depot(s,order,mode);if(r.valid)min=Math.min(min,r.cost);}assert.equal(M.depotBest(s),min);}
assert.throws(()=>M.depot(M.depotSpec(0),[7,7,21,2],'hash'));
assert.equal(M.sorting({a:[1,2,3],writeWeight:1},0,'insertion','insertion').comparisons,2);
assert.equal(M.sorting({a:[3,2,1],writeWeight:1},0,'selection','selection').writes,2);
console.log('PASS: four worlds, 48 route/grid/sort cases, all candidate sort plans, exhaustive depot plans, queue/stack paths, deletion trap, known distances and sort counts.');
