(function(root){'use strict';const C=typeof module!=='undefined'?require('../core.js'):root.PlayCore,S=typeof module!=='undefined'?require('../sorting/model.js'):root.SortModel;
const perm=a=>a.length?a.flatMap((x,i)=>perm(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
const distance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
function random(seed){let x=seed>>>0;return n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n;};}
function routeSpec(level,seed=1){
 const sets=[{S:[5,2],A:[4,2],B:[7,2],C:[0,2]},{S:[3,3],A:[0,0],B:[0,5],C:[6,0],D:[6,5]},{S:[3,3],A:[6,1],B:[0,0],C:[1,5],D:[5,5]}];
 if(level<3)return {points:sets[level],precedence:level===2?['A','D']:null};
 const tier=Math.min(4,1+Math.floor((seed-1)/3)),r=caseRandom(seed*6151+47),cells=shuffled(Array.from({length:48},(_,i)=>[i%8,Math.floor(i/8)]),r),points={S:cells.pop()};
 for(const id of ['A','B','C','D','E','F'].slice(0,tier+2))points[id]=cells.pop();
 return {points,precedence:tier>=3?['A','D']:null,tier};
}
function route(spec,order){const ids=Object.keys(spec.points).filter(x=>x!=='S');if(order.length!==ids.length||new Set(order).size!==ids.length||order.some(x=>!ids.includes(x)))return {valid:false};let current='S',cost=0;const legs=[];for(const id of [...order,'S']){const d=distance(spec.points[current],spec.points[id]);legs.push({from:current,to:id,cost:d});cost+=d;current=id;}return {valid:!spec.precedence||order.indexOf(spec.precedence[0])<order.indexOf(spec.precedence[1]),cost,legs};}
function routeBest(spec){return Math.min(...perm(Object.keys(spec.points).filter(x=>x!=='S')).map(p=>route(spec,p)).filter(r=>r.valid).map(r=>r.cost));}
function nearest(spec){let here='S',todo=Object.keys(spec.points).filter(x=>x!=='S'),order=[];while(todo.length){todo.sort((a,b)=>distance(spec.points[here],spec.points[a])-distance(spec.points[here],spec.points[b])||a.localeCompare(b));here=todo.shift();order.push(here);}return route(spec,order);}
const moves={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
// Use high bits: low LCG bits create short, visible repeating patterns.
function caseRandom(seed){const next=random(seed);return n=>Math.floor(next(4294967296)/4294967296*n);}
function shuffled(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const commandCases=new Map();
function commandSpec(level,seed=1){
 const layouts=[{start:[0,4],end:[4,0],walls:[[1,4],[1,3],[3,1]],key:null},{start:[0,4],end:[4,0],walls:[[1,4],[1,3],[3,1]],key:null},{start:[0,4],end:[4,4],walls:[[2,3],[2,2]],key:[0,0]}];
 if(level!==3)return {...layouts[level],mode:level===1?'stack':'queue'};
 if(commandCases.has(seed))return commandCases.get(seed);
 const tier=Math.min(4,1+Math.floor((seed-1)/3)),r=caseRandom(seed*7919+83),min=[0,6,9,12,15][tier],max=min+2;
 for(let attempt=0;attempt<4000;attempt++){
  const cells=shuffled(Array.from({length:25},(_,i)=>[i%5,Math.floor(i/5)]),r);
  const start=cells.pop(),end=cells.pop(),key=tier>=2?cells.pop():null;
  const spec={start,end,key,walls:cells.slice(0,2+tier+r(3)),mode:tier===1?'queue':tier===2?'stack':seed%2?'queue':'stack',tier};
  try{const path=commandBest(spec);if(path.length<min||path.length>max)continue;}catch{continue;}
  if(commandCases.size>256)commandCases.clear();commandCases.set(seed,spec);return spec;
 }
 // Guaranteed reachable fallback: a single serpentine corridor, with tier-sized route.
 const corridor=Array.from({length:17},(_,i)=>i<5?[i,0]:i===5?[4,1]:i<11?[10-i,2]:i===11?[0,3]:[i-12,4]);
 const path=corridor.slice(0,min+1),spec={start:path[0],end:path.at(-1),key:tier>=2?path[Math.floor(min/2)]:null,walls:Array.from({length:25},(_,i)=>[i%5,Math.floor(i/5)]).filter(p=>!path.some(q=>same(p,q))),mode:tier===1?'queue':'stack',tier};
 commandCases.set(seed,spec);return spec;
}
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function command(spec,plan){let pos=[...spec.start],hasKey=!spec.key,trail=[pos],error='',keys=[hasKey];const order=spec.mode==='stack'?[...plan].reverse():[...plan];for(const m of order){if(!moves[m])throw Error('Bad command');const d=moves[m],p=[pos[0]+d[0],pos[1]+d[1]];if(p.some(v=>v<0||v>4)||spec.walls.some(w=>same(w,p))){error='Bump! The robot stopped at a wall.';break;}pos=p;if(spec.key&&same(pos,spec.key))hasKey=true;trail.push(pos);keys.push(hasKey);}return {won:!error&&same(pos,spec.end)&&hasKey,trail,keys,error,order};}
function commandBest(spec){const queue=[{pos:spec.start,key:!spec.key,path:[]}],seen=new Set();while(queue.length){const q=queue.shift(),id=q.pos+':'+q.key;if(seen.has(id))continue;seen.add(id);if(same(q.pos,spec.end)&&q.key)return q.path;for(const [m,d]of Object.entries(moves)){const p=[q.pos[0]+d[0],q.pos[1]+d[1]];if(p.some(v=>v<0||v>4)||spec.walls.some(w=>same(w,p)))continue;queue.push({pos:p,key:q.key||spec.key&&same(p,spec.key),path:[...q.path,m]});}}throw Error('Unreachable');}
function depotSpec(level,seed=1){
 if(level<3)return [{keys:[7,14,21,2],modes:['hash'],remove:null},{keys:[7,14,21,28],modes:['hash'],remove:14,fixed:true},{keys:[10,20,30,40,50,60,70],modes:['tree'],remove:null}][level];
 const tier=Math.min(4,1+Math.floor((seed-1)/3)),n=3+tier,r=caseRandom(seed*3571+19),offset=r(7),style=(seed-1)%3;
 // Spread, mixed and clustered home shelves require different structure choices.
 const residues=style===0?shuffled([0,1,2,3,4,5,6],r).slice(0,n):Array.from({length:n},(_,i)=>(offset+(style===1?r(2+tier):r(3)===0?1:0))%7);
 const used=new Set(),keys=residues.map(home=>{let k;do{k=7*(1+r(12))+home;}while(used.has(k));used.add(k);return k;});
 return {keys:shuffled(keys,r),modes:['hash','tree'],remove:null,tier};
}
function depot(spec,order,mode,erase='mark'){if(order.length!==spec.keys.length||new Set(order).size!==spec.keys.length||order.some(k=>!spec.keys.includes(k)))throw Error('Invalid key order');if(!spec.modes.includes(mode))throw Error('Invalid structure');const table=Array(7).fill(null);let tree=null;if(mode==='hash'){order.forEach(k=>C.insert(table,k));if(spec.remove!==null){const at=table.indexOf(spec.remove);table[at]=erase==='mark'?C.DEAD:null;}}else tree=C.tree(order);const probes=spec.keys.filter(k=>k!==spec.remove).map(key=>({key,...(mode==='hash'?C.probe(table,key):C.treeSearch(tree,key))}));return {table,tree,probes,valid:probes.every(p=>p.found),cost:Math.max(...probes.map(p=>p.path.length))};}
const depotTargets=new Map();
function depotBest(spec){const cacheKey=JSON.stringify(spec);if(depotTargets.has(cacheKey))return depotTargets.get(cacheKey);let best=Infinity;for(const mode of spec.modes){if(mode==='hash'){const orders=spec.fixed?[spec.keys]:perm(spec.keys);for(const order of orders){const r=depot(spec,order,mode);if(r.valid)best=Math.min(best,r.cost);}}else best=Math.min(best,Math.ceil(Math.log2(spec.keys.length+1)));}if(depotTargets.size>256)depotTargets.clear();depotTargets.set(cacheKey,best);return best;}
function sortLane(a,mode){if(a.length<2)return {a:[...a],comparisons:0,writes:0};const s=S.create(a,mode);while(!s.done){const choice=s.phase==='place'?'place':(mode==='selection'?s.a[s.min]<=s.a[s.j]:s.a[s.j]<=s.key)?'left':'right';S.step(s,choice);}return {a:s.a,comparisons:s.comparisons,writes:s.writes};}
function sortSpec(level,seed=1){
 if(level<3)return {a:level===0?[1,2,3,4,5,6]:level===1?[6,5,4,3,2,1]:[4,5,6,1,2,3],writeWeight:level===1?4:1};
 const tier=Math.min(4,1+Math.floor((seed-1)/3)),r=caseRandom(seed*4877+101),n=[0,4,5,7,8][tier];
 let a=Array.from({length:n},()=>1+r(9));const pattern=(seed-1)%4;
 if(tier===1||pattern===0){a.sort((a,b)=>a-b);const i=r(n-1);[a[i],a[i+1]]=[a[i+1],a[i]];}
 else if(pattern===1)a.sort((a,b)=>b-a);
 else if(pattern===2){const k=2+r(n-3);a=[...a.slice(0,k).sort((a,b)=>a-b),...a.slice(k).sort((a,b)=>a-b)];}
 return {a,writeWeight:tier===1?1:1+r(tier+1),tier};
}
function sorting(spec,cut,left,right){if(!Number.isInteger(cut)||cut<0||cut>=spec.a.length)throw Error('Bad split');const l=sortLane(cut?spec.a.slice(0,cut):spec.a,left),r=cut?sortLane(spec.a.slice(cut),right):{a:[],comparisons:0,writes:0};let a=[],i=0,j=0,c=0;if(cut){while(i<l.a.length&&j<r.a.length){c++;a.push(l.a[i]<=r.a[j]?l.a[i++]:r.a[j++]);}a.push(...l.a.slice(i),...r.a.slice(j));}else a=l.a;const comparisons=l.comparisons+r.comparisons+c,writes=l.writes+r.writes+(cut?spec.a.length:0);return {a,left:l.a,right:r.a,comparisons,writes,mergeComparisons:c,cost:comparisons+spec.writeWeight*writes};}
function sortBest(spec){let cost=Infinity,plan;for(let cut=0;cut<spec.a.length;cut++)for(const left of ['selection','insertion'])for(const right of ['selection','insertion']){const r=sorting(spec,cut,left,right);if(r.cost<cost){cost=r.cost;plan={cut,left,right};}}return {cost,plan};}
const api={perm,routeSpec,route,routeBest,nearest,commandSpec,command,commandBest,depotSpec,depot,depotBest,sortSpec,sorting,sortBest};if(typeof module!=='undefined')module.exports=api;else root.AdventureModel=api;
})(globalThis);
