(function(root){'use strict';
const F=typeof module!=='undefined'&&module.exports?require('./model.js'):root.FactoryModel;
function name(value){if(typeof value!=='string')return null;const n=value.normalize('NFKC').trim().replace(/\s+/g,' ');return /^[\p{L}\p{N} _-]{2,20}$/u.test(n)?n:null;}
function replay(row){if(!row||!['steady','burst'].includes(row.shift)||!['queue','stack','free'].includes(row.policy)||!name(row.nickname)||!Array.isArray(row.order)||row.order.length!==6||new Set(row.order).size!==6)return null;const s=F.create(row.shift,row.policy);for(const id of row.order)if(typeof id!=='string'||!F.run(s,id))return null;return {nickname:name(row.nickname),shift:row.shift,policy:row.policy,order:[...row.order],...F.metrics(s)};}
function compare(a,b){return b.onTime-a.onTime||a.maxWait-b.maxWait;}
function upsert(rows,candidate){const r=replay(candidate);if(!r)return {rows,status:'invalid'};const index=rows.findIndex(x=>x.shift===r.shift&&x.nickname.toLowerCase()===r.nickname.toLowerCase());if(index<0)return{rows:[...rows,r],status:'added'};if(compare(r,rows[index])<0){const out=[...rows];out[index]=r;return{rows:out,status:'improved'};}return{rows,status:compare(r,rows[index])===0?'equal':'kept'};}
function clean(raw){let rows=[];if(Array.isArray(raw))for(const r of raw.slice(0,500))rows=upsert(rows,r).rows;return rows;}
function rank(rows,shift){const list=rows.filter(r=>r.shift===shift).sort((a,b)=>compare(a,b)||a.nickname.localeCompare(b.nickname));return list.map((r,i)=>({...r,rank:i&&compare(r,list[i-1])===0?0:i+1})).map((r,i,a)=>{if(!r.rank)r.rank=a[i-1].rank;return r;});}
const api={name,replay,compare,upsert,clean,rank};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactoryLeaderboard=api;
})(typeof globalThis!=='undefined'?globalThis:this);
