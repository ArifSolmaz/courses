const assert=require('node:assert/strict'),M=require('./model.js');
const maps=new Set(),sets=new Set(),shapes=new Set();let prev=0;
function balanced(keys){if(!keys.length)return [];const a=[...keys].sort((a,b)=>a-b),i=Math.floor(a.length/2);return [a[i],...balanced(a.slice(0,i)),...balanced(a.slice(i+1))];}
for(let seed=1;seed<=120;seed++){
 const s=M.commandSpec(3,seed),path=M.commandBest(s),lo=[0,6,9,12,15][s.tier];
 assert(path.length>=lo&&path.length<=lo+2);assert(path.length<=20);
 assert.equal(new Set([s.start,s.end,...(s.key?[s.key]:[]),...s.walls].map(String)).size,2+(s.key?1:0)+s.walls.length);
 const plan=s.mode==='stack'?[...path].reverse():path;assert(M.command(s,plan).won);
 assert(!M.command(s,[]).won);assert.deepEqual(M.commandSpec(3,seed),s);
 maps.add(JSON.stringify([s.start,s.end,s.key,s.walls]));
 if(seed%3===1){assert(path.length>=prev);prev=lo;}
 const d=M.depotSpec(3,seed);assert.equal(d.keys.length,3+d.tier);assert.equal(new Set(d.keys).size,d.keys.length);assert(d.keys.every(k=>k>0&&k<100));sets.add([...d.keys].sort((a,b)=>a-b).join(','));shapes.add(d.keys.map(k=>k%7).sort().join(','));
 const target=M.depotBest(d),tree=M.depot(d,balanced(d.keys),'tree');assert(tree.valid);assert(target<=tree.cost);
 // Independently find a witness for the advertised target, including hash wins.
 let witness=tree.cost===target;
 if(!witness)for(const p of M.perm(d.keys)){const out=M.depot(d,p,'hash');if(out.valid&&out.cost===target){witness=true;break;}}
 assert(witness,'Unreachable depot target '+seed);
}
assert.equal(maps.size,120);assert.equal(sets.size,120);assert(shapes.size>30);
console.log(`PASS: 120 unique maps + 120 unique parcel sets; ${shapes.size} hash patterns; all targets reachable; four bounded difficulty bands.`);
