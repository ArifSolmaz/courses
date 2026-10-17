const assert=require('assert/strict');
const a=require('../../aa/assets/week1-stories.js'), b=require('../../aa/assets/anim-aa.js');
for(const c of Object.values(a.robotCases)){
 const best=Math.min(...a.exhaustive(c.p).map(x=>x.cost));
 assert(a.length(c.p,a.nearest(c.p))>=best-1e-9);
 if(c.route)assert(Math.abs(a.length(c.p,c.route)-best)<1e-9);
 const frames=a.closest(c.p),edges=frames.at(-1).edges;
 assert.equal(edges.length,c.p.length);
 assert(edges.reduce((s,x)=>s+x.d,0)>=best-1e-9);
}
const jobs=[];for(let s=0;s<4;s++)for(let e=s+1;e<=4;e++)jobs.push({id:`${s}-${e}`,s,e});
for(let mask=0;mask<1024;mask++){
 const x=jobs.filter((_,i)=>mask>>i&1),f=a.schedule(x,'finish');
 assert.equal(f.at(-1)?.selected.length||0,a.optimalSchedule(x).length);
}
for(let n=1;n<=64;n++){
 assert.equal(b.nestedCells(n).length,n*(n+1)/2);
 assert.equal(b.growthRow(n).sq,n*n);assert.equal(b.growthRow(n).exp,(2n**BigInt(n)).toString());
}
console.log('All six robot cases checked against exhaustive tours; earliest-finish checked on 1,024 interval sets; growth/count models checked for n=1..64.');
