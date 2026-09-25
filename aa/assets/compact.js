/* One weekly surface. Enhance progressively; printed pages retain all answers. */
(() => {
 const tabs=[...document.querySelectorAll('[data-week-tab]')];
 if(!tabs.length)return;
 const panels=[...document.querySelectorAll('.week-panel')];
 const tabbar=document.querySelector('.week-tabs');tabbar.setAttribute('role','tablist');
 const questions=[...document.querySelectorAll('#practice .source-exercise')];
 let page=0;const size=5,total=Math.ceil(questions.length/size);
 const controls=document.createElement('div');controls.className='practice-controls';
 controls.innerHTML='<button type="button" data-prev>Previous 5</button><label><span class="visually-hidden">Questions</span><select aria-label="Question group"></select></label><button type="button" data-next>Next 5</button><span role="status" aria-live="polite"></span>';
 const select=controls.querySelector('select');
 for(let i=0;i<total;i++){const o=document.createElement('option');o.value=i;o.textContent=`${i*size+1}–${Math.min((i+1)*size,questions.length)} of ${questions.length}`;select.append(o);}
 document.querySelector('#practice .chapter-question-bank')?.before(controls);
 document.querySelector('#practice').classList.add('paged');
 function showPage(p){page=Math.max(0,Math.min(total-1,p));questions.forEach((q,i)=>q.hidden=Math.floor(i/size)!==page);select.value=page;controls.querySelector('[data-prev]').disabled=page===0;controls.querySelector('[data-next]').disabled=page===total-1;controls.querySelector('[role=status]').textContent='Answers shown with each question';}
 controls.querySelector('[data-prev]').onclick=()=>{showPage(page-1);controls.scrollIntoView({block:'start'});};
 controls.querySelector('[data-next]').onclick=()=>{showPage(page+1);controls.scrollIntoView({block:'start'});};select.onchange=()=>showPage(Number(select.value));showPage(0);
 function pauseAnimations(){document.querySelectorAll('#lesson [data-anim],#lesson .anim-player').forEach(h=>h.dispatchEvent(new Event('aa:pause')));document.querySelectorAll('#lesson button').forEach(b=>{if(/pause/i.test(b.textContent))b.click();});}
 function activate(id,focus=false){
  panels.forEach(p=>p.hidden=p.id!==id);
  tabs.forEach(t=>{const on=t.dataset.weekTab===id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on&&focus)t.focus();});
  // Pause running demonstrations when the lesson is left.
  if(id!=='lesson')pauseAnimations();
 }
 tabs.forEach((t,i)=>{t.setAttribute('role','tab');t.setAttribute('aria-controls',t.dataset.weekTab);const panel=document.getElementById(t.dataset.weekTab);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',t.id);t.onclick=()=>{activate(t.dataset.weekTab);history.replaceState(null,'','#'+t.dataset.weekTab);tabbar.scrollIntoView({block:'start'});};t.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[j].click();tabs[j].focus();}};});
 function followHash(){const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);const panel=target?.closest('.week-panel');activate(panel?.id||'lesson');if(target&&target!==panel){const q=target.closest('.source-exercise');if(q)showPage(Math.floor(questions.indexOf(q)/size));let p=target.parentElement;while(p){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement;}requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}}
 addEventListener('hashchange',followHash);followHash();
 document.querySelector('.animation-drawer')?.addEventListener('toggle',e=>{if(!e.target.open)pauseAnimations();});
 const choice=document.getElementById('animation-choice');
 if(choice)choice.onchange=()=>{pauseAnimations();document.querySelectorAll('[data-animation-panel]').forEach(p=>{p.hidden=p.dataset.animationPanel!==choice.value;});};
})();
