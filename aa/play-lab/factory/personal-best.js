(()=>{'use strict';
const key='aa-factory-personal-best-v1';let best={};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const shift of ['steady','burst']){const row=FactoryLeaderboard.replay(saved[shift]);if(row&&row.shift===shift)best[shift]=row;}}catch{}
window.updateFactoryPersonalBest=(state,mission)=>{
 if(mission!=='undo'&&state.finished.length===6){
  const row=FactoryLeaderboard.replay({nickname:'My best',shift:state.shift,policy:state.policy,order:state.finished.map(j=>j.id)});
  if(row&&(!best[row.shift]||FactoryLeaderboard.compare(row,best[row.shift])<0)){
   best[row.shift]=row;
   try{localStorage.setItem(key,JSON.stringify(best));document.getElementById('personal-save-status').textContent='Best result saved on this browser.';}catch{document.getElementById('personal-save-status').textContent='Browser storage is unavailable. This result lasts only while this page is open.';}
  }
 }
 const host=document.getElementById('personal-results');host.replaceChildren();
 for(const [shift,label] of [['steady','First shift'],['burst','The rush']]){
  const p=document.createElement('p'),title=document.createElement('strong');title.textContent=label+': ';p.append(title);
  const r=best[shift];p.append(r?`${r.onTime}/6 on time · longest wait ${r.maxWait} ${r.maxWait===1?'step':'steps'} · ${{queue:'Queue',stack:'Stack',free:'You choose'}[r.policy]} · ${r.order.join(' → ')}`:'Finish this shift to save your best result.');host.append(p);
 }
};
})();
