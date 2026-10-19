const assert=require('node:assert/strict'),M=require('./campaign-model.js');
assert.deepEqual([0,1,2,3,4].map(i=>M.getLevel(i).target),[3,4,3,9,4]);
assert.equal(M.simulate(M.getLevel(2).jobs,['A','B','C','D']).onTime,2);
assert.equal(M.simulate(M.getLevel(3).jobs,['B','C','D','E','A']).value,3);
const wait=M.simulate(M.getLevel(4).jobs,['B','C','A','D']);assert.equal(wait.onTime,4);assert.equal(wait.rows[0].idle,1);
assert.throws(()=>M.simulate(M.getLevel(0).jobs,['A','A','C']));
// Independent integer-time dynamic programming oracle: idle or run any available job.
function oracle(jobs){const memo=new Map();function solve(mask,time){if(mask===(1<<jobs.length)-1)return 0;if(time>25)return 0;const key=mask+':'+time;if(memo.has(key))return memo.get(key);let ans=solve(mask,time+1);jobs.forEach((j,i)=>{if(!(mask>>i&1)&&j.arrival<=time)ans=Math.max(ans,(time+j.duration<=j.due?1:0)+solve(mask|1<<i,time+j.duration));});memo.set(key,ans);return ans;}return solve(0,0);}
for(let seed=1;seed<=100;seed++){const l=M.getLevel(5,seed),b=M.best(l.jobs);assert.equal(b.score,oracle(l.jobs));const r=M.simulate(l.jobs,b.order);assert.equal(r.onTime,l.target);for(const j of r.rows){assert(j.start>=j.arrival);assert.equal(j.finish-j.start,j.duration);assert.equal(j.onTime,j.finish<=j.due);}}
console.log('PASS: five level targets, trade-offs, deliberate idle, invalid plans, 100 new days vs independent scheduling oracle.');
