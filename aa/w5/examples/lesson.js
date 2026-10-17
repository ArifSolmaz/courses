'use strict';
const $=id=>document.getElementById(id);let current=0;
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
cards.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${c.title}`;$('choose').append(o)});
function render(i,focus=false){current=Math.max(0,Math.min(cards.length-1,i));const c=cards[current];['title','question','lesson','check','answer','extra'].forEach(k=>$(k).textContent=c[k]);['a','b'].forEach(k=>{$(k+'Title').textContent=c[k][0];$(k+'Text').textContent=c[k][1]});$('week').textContent='Week '+c.week;$('timing').textContent=`${c.start}–${c.end} min · ${c.minutes} min · ${c.block}`;$('count').textContent=`${current+1} / ${cards.length}`;$('choose').value=current;$('bar').style.width=(current+1)/cards.length*100+'%';$('prev').disabled=current===0;$('next').disabled=current===cards.length-1;$('status').textContent=`Example ${current+1} / ${cards.length}`;$('ref').href=c.ref;document.querySelectorAll('.extra-ref').forEach(n=>n.remove());(c.refs||[]).slice(1).reverse().forEach(ref=>{const a=document.createElement('a');a.className='extra-ref';a.href='lecture-notes.html#topic-'+ref;a.textContent='Lecture '+ref.replaceAll('-','.')+' →';$('ref').after(a)});renderGuide(c);$('widget').replaceChildren();if(lessonVisuals.has(c.id))lessonVisuals.mount(c);history.replaceState(null,'','#example-'+c.id);if(focus){$('title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}}
function renderGuide(c){
 const steps=c.walkthrough||[];$('walkthrough').hidden=!steps.length;$('guideNote').hidden=!(c.widget||lessonVisuals.has(c.id));$('guideSteps').replaceChildren();
 steps.forEach(step=>{const li=document.createElement('li'),title=document.createElement('h4'),body=document.createElement('p');title.textContent=step.title;body.textContent=step.text;li.append(title,body);$('guideSteps').append(li)});
}
$('prev').onclick=()=>render(current-1,true);$('next').onclick=()=>render(current+1,true);$('choose').onchange=()=>render(+$('choose').value,true);
// Print a complete static recap, then restore the interactive scene.
let printing=false;function preparePrint(){if(printing)return;printing=true;const area=document.createElement('div');area.id='printAll';cards.forEach((c,i)=>{const a=document.createElement('article');a.className='print-card';a.innerHTML=`<p>AA · Week ${escapeText(c.week)} · ${i+1}/${cards.length} · ${c.start}–${c.end} min</p><h2>${escapeText(c.title)}</h2><p>${escapeText(c.question)}</p><div class="pair"><section><h3>${escapeText(c.a[0])}</h3><p>${escapeText(c.a[1])}</p></section><section><h3>${escapeText(c.b[0])}</h3><p>${escapeText(c.b[1])}</p></section></div>${(c.walkthrough||[]).map((s,i)=>`<h3>${i+1}. ${escapeText(s.title)}</h3><p>${escapeText(s.text)}</p>`).join('')}<p class="lesson">${escapeText(c.lesson)}</p><p><b>Question:</b> ${escapeText(c.check)}</p><p><b>Answer:</b> ${escapeText(c.answer)}</p><p>${escapeText(c.extra)}</p>`;area.append(a)});$('scene').hidden=true;document.querySelector('main').append(area)}function afterPrint(){document.getElementById('printAll')?.remove();$('scene').hidden=false;printing=false}window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',afterPrint);$('print').onclick=()=>{preparePrint();window.print()};const requested=Number(location.hash.match(/^#(?:ornek|example)-(\d+)$/)?.[1]);const initial=requested?cards.findIndex(c=>c.id===requested):0;render(Math.max(0,initial));

// Preserve native editing and control keys while enabling page-level navigation.
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const target=event.target;
 if(target instanceof Element && target.closest('input,select,textarea,[contenteditable="true"],[role="slider"],[role="textbox"]'))return;
 if(event.key==='ArrowLeft' && current>0){event.preventDefault();render(current-1,true);}
 if(event.key==='ArrowRight' && current<cards.length-1){event.preventDefault();render(current+1,true);}
});
