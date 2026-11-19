(function(root){'use strict';
const job=(id,duration,due,value=1,arrival=0)=>({id,duration,due,value,arrival});
const levels=[
 {name:'Open the doors',goal:'Deliver all 3 on time.',idea:'A deadline belongs to a box. Arrival order alone does not tell you which box needs help first.',jobs:[job('A',1,3),job('B',1,1),job('C',1,2)]},
 {name:'The big box',goal:'Deliver all 4 on time.',idea:'A long job can hold up several short jobs. Look at work time as well as the deadline.',jobs:[job('A',3,6),job('B',1,1),job('C',1,2),job('D',1,3)]},
 {name:'You cannot save everyone',goal:'Save 3 deliveries.',idea:'The earliest deadline is not always the best next choice when your goal is to save the most deliveries.',jobs:[job('A',4,4),job('B',1,5),job('C',1,5),job('D',1,5)]},
 {name:'Special cargo',goal:'Earn 9 stars. Stars count only for on-time boxes.',objective:'value',idea:'Saving the most boxes and saving the most value are different goals. A good plan depends on what you are trying to improve.',jobs:[job('A',3,3,6),job('B',1,4),job('C',1,5),job('D',1,6),job('E',1,3)]},
 {name:'Wait for it',goal:'Deliver all 4 on time.',idea:'Sometimes waiting briefly is better than starting a long job. A running job cannot be paused here.',jobs:[job('A',3,6),job('B',1,2,1,1),job('C',1,3,1,1),job('D',1,7)]},
 {name:'New factory day',goal:'Find the best plan for this new day.',idea:'Check the jobs again. A rule that worked yesterday may fail today. Compare plans using the same jobs.',fresh:true}
];
function fresh(seed){let x=seed>>>0;const rand=n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n;};return Array.from({length:5},(_,i)=>job(String.fromCharCode(65+i),1+rand(3),3+rand(8),1,rand(3)));}
function simulate(jobs,order){if(order.length!==jobs.length||new Set(order).size!==jobs.length||order.some(id=>!jobs.some(j=>j.id===id)))throw Error('Use each box exactly once.');let time=0;const rows=order.map(id=>{const j=jobs.find(j=>j.id===id),idle=Math.max(0,j.arrival-time),start=Math.max(time,j.arrival);time=start+j.duration;return {...j,start,finish:time,idle,onTime:time<=j.due};});return {rows,onTime:rows.filter(r=>r.onTime).length,value:rows.reduce((a,r)=>a+(r.onTime?r.value:0),0),time};}
function best(jobs,objective='onTime'){let score=-1,order=[];function visit(prefix,rest){if(!rest.length){const r=simulate(jobs,prefix);if(r[objective]>score){score=r[objective];order=prefix;}return;}for(const id of rest)visit([...prefix,id],rest.filter(v=>v!==id));}visit([],jobs.map(j=>j.id));return {score,order};}
function getLevel(index,seed=1){const base=levels[index];if(!base)throw Error('Unknown level');const jobs=base.fresh?fresh(seed):base.jobs.map(j=>({...j})),objective=base.objective||'onTime';return {...base,jobs,objective,target:best(jobs,objective).score};}
const api={levels,getLevel,simulate,best};if(typeof module!=='undefined')module.exports=api;else root.FactoryCampaign=api;
})(globalThis);
