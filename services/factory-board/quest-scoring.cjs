const Q=require('../../aa/play-lab/quests/model.js');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function valid(s,p){
 if(!p||typeof p!=='object'||Array.isArray(p))return false;
 const a=s.initial;
 if(Object.keys(p).sort().join()!==Object.keys(a).sort().join())return false;
 if(a.order){if(!Array.isArray(p.order)||p.order.length!==a.order.length)return false;
  if(s.g==='commands'){if(p.order.some(x=>!['U','D','L','R'].includes(x))||!['queue','stack'].includes(p.mode))return false;if(s.m==='race'&&!same(p.order,a.order))return false;if(s.m!=='race'&&p.mode!==a.mode)return false;}
  else if(!same([...p.order].sort(),[...a.order].sort()))return false;
 }
 if(s.g==='depot'&&(!['hash','tree'].includes(p.structure)||!['mark','empty'].includes(p.erase)))return false;
 if(s.g==='sorting'&&(!['selection','insertion'].includes(p.tool)||!Number.isInteger(p.cut)||p.cut<0||p.cut>=s.data.a.length))return false;
 if(s.g==='depot'&&(s.m==='repair'?p.structure!==a.structure:p.erase!==a.erase))return false;
 if(s.g==='sorting'&&s.m!=='race'&&p.cut!==a.cut)return false;
 if(s.m==='repair'){
  if(a.order){const d=a.order.map((v,i)=>v===p.order[i]?null:i).filter(x=>x!==null);if(s.g==='commands'){if(d.length!==1)return false;}else if(d.length!==2||p.order[d[0]]!==a.order[d[1]]||p.order[d[1]]!==a.order[d[0]])return false;}
  else if(Object.keys(a).filter(k=>!same(a[k],p[k])).length!==1)return false;
 }
 return Q.evaluate(s,p).pass;
}
module.exports=function(b){try{
 if(!Object.hasOwn(Q.modes,b.mode))return false;
 const s=Q.spec(b.game,b.mode,b.mode==='transfer'?1:0);
 if(b.answer!==s.correct||!valid(s,b.plan))return false;
 if(b.mode==='race'&&!['you','rival','tie'].includes(b.prediction))return false;
 if(b.mode==='transfer'){const first=Q.spec(b.game,b.mode,0);if(b.firstAnswer!==first.correct||!valid(first,b.firstPlan))return false;}
 return true;
}catch{return false;}};
