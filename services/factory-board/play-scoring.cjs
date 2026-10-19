const A=require('../../aa/play-lab/adventures/model.js');
const Legacy=require('./legacy-adventure-cases.cjs');
const C=require('../../aa/play-lab/core.js');
const S=require('../../aa/play-lab/sorting/model.js');
const F=require('../../aa/play-lab/factory/campaign-model.js');
const Classic=require('../../aa/play-lab/factory/leaderboard-model.js');
const totals={robot:9,commands:9,depot:9,sorting:9,factory:12};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function replay(b){try{
 if(!b||!Object.hasOwn(totals,b.game))return null;
 const {game,kind,level}=b;let pass=false,task;
 if(kind==='quest'){pass=require('./quest-scoring.cjs')(b);task='quest-'+b.mode;}else if(kind==='adventure'){
  if(!Number.isInteger(level)||level<0||level>=(game==='factory'?6:4)||!Number.isInteger(b.seed)||b.seed<1||b.seed>1000000)return null;
  if(b.caseVersion!==undefined&&b.caseVersion!==2)return null;
  const Cases=b.caseVersion===2?A:Legacy;
  if(game==='factory'){const s=F.getLevel(level,b.seed),r=F.simulate(s.jobs,b.plan);pass=r[s.objective]>=s.target;}
  else if(game==='robot'){const s=A.routeSpec(level,b.seed),r=A.route(s,b.plan);pass=r.valid&&r.cost<=A.routeBest(s);}
  else if(game==='commands'){if(!Array.isArray(b.plan)||b.plan.length>40)return null;const s=Cases.commandSpec(level,b.seed),r=A.command(s,b.plan);pass=r.won&&b.plan.length<=A.commandBest(s).length;}
  else if(game==='depot'){const s=Cases.depotSpec(level,b.seed);if(s.fixed&&!equal(b.plan,s.keys))return null;if(!['mark','empty'].includes(b.erase))return null;const r=A.depot(s,b.plan,b.structure,b.erase);pass=r.valid&&r.cost<=A.depotBest(s);}
  else{if(!['selection','insertion'].includes(b.left)||!['selection','insertion'].includes(b.right))return null;const s=A.sortSpec(level,b.seed);pass=A.sorting(s,b.cut,b.left,b.right).cost<=A.sortBest(s).cost;}
  task='adventure-'+level;
 }else if(kind==='classic'){
  if(game==='robot'){
   if(![0,1].includes(level)||!Array.isArray(b.plan)||b.plan.length!==3||new Set(b.plan).size!==3||b.plan.some(x=>!['A','B','C'].includes(x)))return null;
   const p=level===0?{S:0,A:2,B:4,C:7}:{S:5,A:4,B:7,C:0};pass=level===0?C.routeDistance(p,b.plan)===C.bestRoute(p).distance:C.routeDistance(p,b.plan)<C.routeDistance(p,C.nearest(p));task='classic-'+level;
  }else if(game==='commands'){pass=level===0?equal(b.trace,['Scan','Grip','Lift']):level===1&&equal(b.trace,['Up','Up','Right']);task='classic-'+level;
  }else if(game==='depot'){pass=[0,1].includes(level)&&equal(b.path,[0,1,2])&&(level===0||b.erase==='mark');task='classic-'+level;
  }else if(game==='sorting'){
   if(!['selection','insertion'].includes(b.mode)||!equal(b.input,[5,2,6,1,4,3])||!Array.isArray(b.trace)||b.trace.length>200)return null;
   const s=S.create(b.input,b.mode);for(const action of b.trace){if(!['left','right','place'].includes(action)||s.done)return null;S.step(s,action);}pass=s.done;task='classic-'+b.mode;
  }else if(game==='factory'){
   if(b.shift==='repair'){pass=equal(b.trace,['Paint blue','Add star','Paint orange','Close box',3,2]);task='classic-repair';}
   else{const r=Classic.replay({nickname:'test',shift:b.shift,policy:b.policy,order:b.plan});pass=r&&r.onTime===(b.shift==='steady'?6:5);task='classic-'+b.shift;}
  }
 }
 return pass?{game,task,points:10}:null;
 }catch{return null;}}
module.exports={replay,totals};
