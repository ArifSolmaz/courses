const assert=require('node:assert/strict'),M=require('./model.js');
const routes=new Set(),sorts=new Set(),strategies=new Set();
for(let seed=1;seed<=120;seed++){
 const r=M.routeSpec(3,seed),ids=Object.keys(r.points).filter(x=>x!=='S');assert.equal(ids.length,r.tier+2);assert.equal(new Set(Object.values(r.points).map(String)).size,ids.length+1);
 assert(Object.values(r.points).every(p=>p[0]>=0&&p[0]<=7&&p[1]>=0&&p[1]<=5));
 let best=Infinity;for(const p of M.perm(ids)){let cost=0,at='S';for(const id of [...p,'S']){cost+=Math.abs(r.points[at][0]-r.points[id][0])+Math.abs(r.points[at][1]-r.points[id][1]);at=id;}const valid=!r.precedence||p.indexOf('A')<p.indexOf('D');assert.equal(M.route(r,p).valid,valid);if(valid)best=Math.min(best,cost);}
 assert.equal(M.routeBest(r),best);routes.add(JSON.stringify(r.points));
 const s=M.sortSpec(3,seed),b=M.sortBest(s);assert.equal(s.a.length,[0,4,5,7,8][s.tier]);assert(s.a.every(x=>x>=1&&x<=9));let min=Infinity;
 for(let cut=0;cut<s.a.length;cut++)for(const left of ['selection','insertion'])for(const right of ['selection','insertion']){const out=M.sorting(s,cut,left,right);assert.deepEqual(out.a,[...s.a].sort((a,b)=>a-b));assert.equal(out.cost,out.comparisons+s.writeWeight*out.writes);min=Math.min(min,out.cost);}
 assert.equal(b.cost,min);strategies.add(b.plan.cut?'split':b.plan.left);sorts.add(JSON.stringify([s.a,s.writeWeight]));
}
assert.equal(routes.size,120);assert.equal(sorts.size,120);assert(strategies.has('split'));assert(strategies.has('selection'));assert(strategies.has('insertion'));
console.log('PASS: 120 distinct routes and sorting cases; every optimum reachable; bounds, route rules, all sorting plans and diverse winning strategies.');
