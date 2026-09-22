const assert=require('node:assert/strict');
const a=require('../assets/week1-stories.js');
const near=(x,y)=>assert(Math.abs(x-y)<1e-9,`${x} != ${y}`);
const line=a.robotCases.nearest.p;
assert.deepEqual(a.nearest(line).map(i=>line[i].x),[0,1,-1,3,-5,11,-21,0]);
near(a.length(line,a.nearest(line)),84);
near(Math.min(...a.exhaustive(line).map(t=>t.cost)),64);
// Independent Held–Karp subset DP, not the production permutation search.
function optimum(p) {
 const n=p.length,dp=new Map([['1,0',0]]),dist=(i,j)=>Math.hypot(p[i].x-p[j].x,p[i].y-p[j].y);
 for(let mask=1;mask<1<<n;mask++)for(let i=0;i<n;i++){
  const old=dp.get(`${mask},${i}`);if(old===undefined)continue;
  for(let j=1;j<n;j++)if(!(mask&(1<<j))){
   const key=`${mask|1<<j},${j}`,next=old+dist(i,j);dp.set(key,Math.min(dp.get(key)??Infinity,next));
  }
 }
 return Math.min(...p.slice(1).map((_,j)=>dp.get(`${(1<<n)-1},${j+1}`)+dist(j+1,0)));
}
for(const c of Object.values(a.robotCases)){
 const tours=a.exhaustive(c.p,c.start||0);near(Math.min(...tours.map(t=>t.cost)),optimum(c.p));
 for(const t of tours){assert.equal(t.route[0],t.route.at(-1));assert.equal(new Set(t.route.slice(0,-1)).size,c.p.length);}
 if(c.algorithm==='closest'){
  for(const [i,f] of a.closest(c.p).entries()){
   const degrees=c.p.map(()=>0);for(const e of f.edges){degrees[e.a]++;degrees[e.b]++;}
   assert(Math.max(...degrees)<=2);
   if(f.edges.length===c.p.length)assert(degrees.every(d=>d===2));
  }
 }
}
near(a.closest(a.robotCases.pairRows.p).at(-1).edges.reduce((s,e)=>s+e.d,0),12+Math.sqrt(40));
near(optimum(a.robotCases.pairRows.p),16);
near(a.length(a.robotCases.outside.p,a.robotCases.outside.route),16);
assert.equal(a.exhaustive(a.robotCases.exact.p).length,6);
// Independent interval optimum: finish-sorted dynamic programming.
function intervalOptimum(jobs){
 const sorted=jobs.slice().sort((x,y)=>x.e-y.e),dp=[0];
 for(let i=0;i<sorted.length;i++){
  let pred=i-1;while(pred>=0&&sorted[pred].e>sorted[i].s)pred--;
  dp.push(Math.max(dp.at(-1),1+dp[pred+1]));
 }
 return dp.at(-1);
}
let checked=0;
const check=jobs=>{
 const best=intervalOptimum(jobs);
 assert.equal(a.optimalSchedule(jobs).length,best);
 assert.equal(a.schedule(jobs,'finish').at(-1)?.selected.length||0,best);
 for(const rule of ['start','shortest','finish'])for(const f of a.schedule(jobs,rule)){
  for(let i=0;i<f.selected.length;i++)for(let j=i+1;j<f.selected.length;j++){
   const x=f.selected[i],y=f.selected[j];assert(x.e<=y.s||y.e<=x.s);
  }
 }
 checked++;
};
Object.values(a.filmCases).forEach(c=>check(c.jobs));
const all=[];for(let s=0;s<4;s++)for(let e=s+1;e<=4;e++)all.push({id:String(all.length),s,e});
for(let mask=0;mask<1<<all.length;mask++)check(all.filter((_,i)=>mask&(1<<i)));
for(const [key,rule] of [['long','start'],['short','shortest']])assert.equal(a.schedule(a.filmCases[key].jobs,rule).at(-1).selected.length,1);
console.log(`PASS: every robot case verified against independent subset DP; ${checked} interval sets verified against independent scheduling DP; all schedules conflict-free.`);
