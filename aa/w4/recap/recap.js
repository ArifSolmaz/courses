'use strict';
const $=id=>document.getElementById(id);let current=0;
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
cards.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${c.title}`;$('choose').append(o)});
function render(i,focus=false,updateHash=true){current=Math.max(0,Math.min(cards.length-1,i));const c=cards[current];['title','question','lesson','check','answer','extra'].forEach(k=>$(k).textContent=c[k]);['a','b'].forEach(k=>{$(k+'Title').textContent=c[k][0];$(k+'Text').textContent=c[k][1]});$('week').textContent='Week '+c.week;$('timing').textContent=`${c.start}–${c.end} min · ${c.minutes} min · ${c.block}`;$('count').textContent=`${current+1} / ${cards.length}`;$('choose').value=current;$('bar').style.width=(current+1)/cards.length*100+'%';$('prev').disabled=current===0;$('next').disabled=current===cards.length-1;$('status').textContent=`Example ${current+1} / ${cards.length}`;$('ref').href=c.ref;renderGuide(c);$('widget').replaceChildren();if(c.widget)mount(c.widget);else if(lessonVisuals.has(c.id))lessonVisuals.mount(c);if(updateHash)history.replaceState(null,'','#example-'+c.id);if(focus){$('title').focus({preventScroll:true});$('scene').scrollIntoView({block:'start',behavior:'instant'});}}
function renderGuide(c){
 const steps=c.walkthrough||[];$('walkthrough').hidden=!steps.length;$('guideNote').hidden=!(c.widget||lessonVisuals.has(c.id));$('guideSteps').replaceChildren();
 steps.forEach(step=>{const li=document.createElement('li'),title=document.createElement('h4'),body=document.createElement('p');title.textContent=step.title;body.textContent=step.text;li.append(title,body);$('guideSteps').append(li)});
}
function mount(type){const node=$('widget');node.innerHTML='<div class="demo"><div class="controls" id="controls"></div><div id="visual" class="visual"></div><p id="live" role="status" aria-live="polite"></p></div>';const ct=$('controls'),v=$('visual'),live=$('live');const chips=(values,active=-1)=>values.map((x,i)=>`<span class="chip ${i===active?'active':''}">${escapeText(x)}</span>`).join('');
if(['growth','half','boxes','resize'].includes(type)){const max=type==='boxes'?24:type==='half'?64:16;ct.innerHTML=`<label for="amount">${type==='boxes'?'Number of parts':'n'}: <output id="amountLabel"></output></label><input id="amount" type="range" min="${type==='boxes'?0:1}" max="${max}" value="${type==='boxes'?10:type==='half'?16:8}">`;const update=()=>{const n=+$('amount').value;$('amountLabel').textContent=n;if(type==='growth'){v.innerHTML=`<div class="bars" style="width:100%"><span>One pass</span><span class="meter" style="width:${n/32*100}%">${n}</span><span>Two passes</span><span class="meter" style="width:${2*n/32*100}%">${2*n}</span></div>`;live.textContent=`${n} sensors: ${n} or ${2*n} checks. Both methods grow in proportion to the number of sensors.`;}if(type==='boxes'){const full=Math.floor(n/4),boxes=Math.ceil(n/4);v.innerHTML=chips(Array.from({length:boxes},(_,i)=>Math.min(4,n-i*4)+' parts'));live.textContent=`${n} ÷ 4 = ${n/4}. Boxes needed ⌈${n}/4⌉ = ${boxes}; completely full boxes ⌊${n}/4⌋ = ${full}.`;}if(type==='half'){let x=n,seq=[n];while(x>1){x=Math.ceil(x/2);seq.push(x)}v.innerHTML=chips(seq);live.textContent=`Halve and round up: ${seq.length-1} steps to reach 1. This is a size model, not a count of binary-search comparisons.`;}if(type==='resize'){let cap=1,copies=0,terms=[];while(cap<n){copies+=cap;terms.push(cap);cap*=2}v.innerHTML=chips(terms.length?terms:['No copies']);live.textContent=`Double capacity: ${copies} copies + ${n} new writes = ${copies+n} actions. Grow by 1: ${n*(n-1)/2} copies + ${n} writes = ${n*(n+1)/2} actions. Final doubled capacity: ${cap}.`;}};$('amount').addEventListener('input',update);update();}
if(type==='order'){let removed=0;ct.innerHTML='<button id="take">Remove one item</button><button id="resetDemo">Reset</button>';const update=()=>{const remaining=['A','B','C'].slice(0,3-removed),q=['A','B','C'].slice(removed);v.innerHTML='Stack: '+chips(remaining)+' <span> · Queue: </span>'+chips(q);live.textContent=removed?`Removed ${['C','B','A'][removed-1]} from the stack and ${['A','B','C'][removed-1]} from the queue.`:'Both have the same arrival order: A, B, C.';$('take').disabled=removed===3;};$('take').onclick=()=>{removed++;update()};$('resetDemo').onclick=()=>{removed=0;update()};update();}
if(['search','insertion'].includes(type)) mountPractice(type,ct,v,live,chips);
if(type==='sensor'){let values=[],head=0,next=10,total=0;ct.innerHTML='<button id="sample">Take the next reading</button><button id="resetDemo">Reset</button>';const update=(old=null)=>{v.innerHTML=chips(Array.from({length:3},(_,i)=>values[i]??'Empty'),head);const ordered=values.length<3?values:[...values.slice(head),...values.slice(0,head)];live.textContent=values.length?`Oldest to newest: ${ordered.join(', ')}. ${old!==null?'Removed old reading '+old+'. ':''}Sum ${total}; readings stored: ${values.length}; average: ${total/values.length}. Dark slot: next write position.`:'No readings yet, so no average. Capacity: 3.';};$('sample').onclick=()=>{let old=values.length===3?values[head]:null;total+=next-(old??0);values[head]=next;head=(head+1)%3;next+=10;update(old)};$('resetDemo').onclick=()=>{values=[];head=0;next=10;total=0;update()};update();}}
$('prev').onclick=()=>render(current-1,true);$('next').onclick=()=>render(current+1,true);$('choose').onchange=()=>render(+$('choose').value,true);
// Print a complete static recap, then restore the interactive scene.
let printing=false;function preparePrint(){if(printing)return;printing=true;const area=document.createElement('div');area.id='printAll';cards.forEach((c,i)=>{const a=document.createElement('article');a.className='print-card';a.innerHTML=`<p>AA · Week ${escapeText(c.week)} · ${i+1}/${cards.length} · ${c.start}–${c.end} min</p><h2>${escapeText(c.title)}</h2><p>${escapeText(c.question)}</p><div class="pair"><section><h3>${escapeText(c.a[0])}</h3><p>${escapeText(c.a[1])}</p></section><section><h3>${escapeText(c.b[0])}</h3><p>${escapeText(c.b[1])}</p></section></div>${(c.walkthrough||[]).map((s,i)=>`<h3>${i+1}. ${escapeText(s.title)}</h3><p>${escapeText(s.text)}</p>`).join('')}<p class="lesson">${escapeText(c.lesson)}</p><p><b>Question:</b> ${escapeText(c.check)}</p><p><b>Answer:</b> ${escapeText(c.answer)}</p><p>${escapeText(c.extra)}</p>`;area.append(a)});$('scene').hidden=true;document.querySelector('main').append(area)}function afterPrint(){document.getElementById('printAll')?.remove();$('scene').hidden=false;printing=false}window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',afterPrint);$('print').onclick=()=>{preparePrint();window.print()};const requested=Number(location.hash.match(/^#(?:ornek|example)-(\d+)$/)?.[1]);const initial=requested?cards.findIndex(c=>c.id===requested):0;render(Math.max(0,initial),false,!document.getElementById(location.hash.slice(1))?.closest('.learning-bridge'));
// A direct example URL must reveal the scene below the learning bridge.
if(requested && initial>=0)requestAnimationFrame(()=>{
 $('title').focus({preventScroll:true});
 $('scene').scrollIntoView({block:'start',behavior:'instant'});
});
// Re-clicking the current virtual example must work without a hashchange.
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;
 if(!anchor)return;
 const url=new URL(anchor.href,location.href);
 if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search)return;
 const match=url.hash.match(/^#(?:ornek|example)-(\d+)$/);
 if(!match)return;
 const index=cards.findIndex(card=>card.id===Number(match[1]));
 if(index<0)return;
 event.preventDefault();
 if(location.hash!==url.hash)history.pushState(null,'',url.hash);
 render(index,true,false);
});
// Same-page example links and browser history must update the existing scene.
window.addEventListener('hashchange',()=>{
 const match=location.hash.match(/^#(?:ornek|example)-(\d+)$/);
 if(match){
  const index=cards.findIndex(card=>card.id===Number(match[1]));
  if(index>=0)render(index,true,false);
  return;
 }
 let target;
 try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch(e){return}
 if(target?.closest('.learning-bridge'))target.scrollIntoView({block:'start'});
});

function mountPractice(type,ct,v,live,chips){
 if(type==='search'){
  let step=0;ct.innerHTML='<label for="keyPosition">Key location <select id="keyPosition"><option value="1">1</option><option value="2">2</option><option value="5">5</option><option value="6" selected>6</option><option value="0">Not present</option></select></label><button id="look">Check one compartment</button><button id="restart">Reset</button>';
  const update=()=>{const target=+$('keyPosition').value,found=target>0&&step>=target;v.innerHTML=chips(Array.from({length:6},(_,i)=>i<step?(i+1===target?'Key':'Empty'):'?'),step-1);live.textContent=`Checks: ${step}. ${found?'Found.':step===6?'All compartments checked: no key.':'Check the next compartment.'}`;$('look').disabled=found||step===6};$('look').onclick=()=>{step++;update()};$('restart').onclick=$('keyPosition').onchange=()=>{step=0;update()};update();
 }
 if(type==='insertion'){
  ct.innerHTML='<label for="sortCase">Cards <select id="sortCase"><option value="mixed">3,1,4,2</option><option value="sorted">1,2,3,4</option><option value="reverse">4,3,2,1</option></select></label><button id="sortStep">Place the next card</button><button id="sortReset">Reset</button>';let arr=[],i=1,comp=0,moves=0,trace="";
  const update=()=>{v.innerHTML=chips(arr,i-1);live.textContent=trace+` The first ${Math.min(i,4)} cards are sorted. Value comparisons: ${comp}. Shifts: ${moves}. Writing the key into its final place is not counted as a shift.`;$('sortStep').disabled=i>=4};const reset=()=>{arr={mixed:[3,1,4,2],sorted:[1,2,3,4],reverse:[4,3,2,1]}[$('sortCase').value].slice();i=1;comp=0;moves=0;trace=`Start with ${arr[0]}. A single card is already sorted.`;update()};$('sortStep').onclick=()=>{let key=arr[i],j=i-1;const shifted=[];let stop=null;while(j>=0){comp++;if(arr[j]<=key){stop=arr[j];break;}shifted.push(arr[j]);arr[j+1]=arr[j];moves++;j--}arr[j+1]=key;trace=`Take ${key}. `+(shifted.length?`Shift ${shifted.join(", ")} one slot right. `:"No shifts needed. ")+(stop===null?`Place ${key} at the front.`:`Stop at ${stop}, which is no larger than ${key}. Place ${key} after it.`);i++;update()};$('sortCase').onchange=$('sortReset').onclick=reset;reset();
 }
}

// Preserve native editing and control keys while enabling page-level navigation.
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const target=event.target;
 if(target instanceof Element && target.closest('.learning-bridge,input,select,textarea,[contenteditable="true"],[role="slider"],[role="textbox"]'))return;
 if(event.key==='ArrowLeft' && current>0){event.preventDefault();render(current-1,true);}
 if(event.key==='ArrowRight' && current<cards.length-1){event.preventDefault();render(current+1,true);}
});
