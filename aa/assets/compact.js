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
 function showPage(p){page=Math.max(0,Math.min(total-1,p));questions.forEach((q,i)=>q.hidden=Math.floor(i/size)!==page);select.value=page;controls.querySelector('[data-prev]').disabled=page===0;controls.querySelector('[data-next]').disabled=page===total-1;controls.querySelector('[role=status]').textContent='Answers stay hidden until you ask';}
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
 /* Animation workspace (2026-09): one stage bounded to the viewport, prev/next + chooser, zoom, and an
    Expand button that moves the same stage into a full-screen <dialog> so state (frames, canvases) survives. */
 const ws=document.querySelector('.anim-workspace');
 if(ws){
  const choice=ws.querySelector('#animation-choice'),stage=ws.querySelector('.anim-stage'),toolbar=ws.querySelector('.anim-toolbar');
  const panels=[...ws.querySelectorAll('[data-animation-panel]')],idx=ws.querySelector('[data-anim-index]');
  const prev=ws.querySelector('[data-anim-prev]'),next=ws.querySelector('[data-anim-next]'),zoom=ws.querySelector('[data-anim-zoom]'),expand=ws.querySelector('[data-anim-expand]');
  const ZKEY='aa-anim-zoom';
  function show(i,focus){i=Math.max(0,Math.min(panels.length-1,i));pauseAnimations();choice.value=String(i);panels.forEach(p=>p.hidden=p.dataset.animationPanel!==String(i));idx.textContent=String(i+1);prev.disabled=i===0;next.disabled=i===panels.length-1;stage.scrollTop=0;if(focus)stage.focus({preventScroll:true});}
  choice.onchange=()=>show(Number(choice.value));prev.onclick=()=>show(Number(choice.value)-1,true);next.onclick=()=>show(Number(choice.value)+1,true);
  stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(e.key==='ArrowLeft'&&e.altKey)prev.click();if(e.key==='ArrowRight'&&e.altKey)next.click();});
  function applyZoom(v){stage.style.zoom=v;try{localStorage.setItem(ZKEY,v);}catch(e){}}
  let z='1';try{z=localStorage.getItem(ZKEY)||'1';}catch(e){}
  if(![...zoom.options].some(o=>o.value===z))z='1';zoom.value=z;applyZoom(z);zoom.onchange=()=>applyZoom(zoom.value);
  const m=location.hash.match(/^#animations-(\d+)$/);show(m?Number(m[1])-1:0);
  // Expand: a native modal dialog that borrows the toolbar and the stage, then gives them back.
  const dialog=document.createElement('dialog');dialog.className='anim-dialog';dialog.setAttribute('aria-label','Animation, expanded');
  const dialogHead=document.createElement('div');dialogHead.className='anim-dialog-head';dialog.append(dialogHead);document.body.append(dialog);
  const home=document.createComment('anim-workspace home');ws.insertBefore(home,toolbar);
  function open(){if(dialog.open)return;dialogHead.append(toolbar);dialog.append(stage);ws.classList.add('anim-expanded');expand.textContent='Close \u2715';expand.setAttribute('aria-expanded','true');dialog.showModal();stage.focus({preventScroll:true});}
  function close(){if(!dialog.open)return;dialog.close();}
  dialog.addEventListener('close',()=>{ws.insertBefore(toolbar,home.nextSibling);ws.insertBefore(stage,toolbar.nextSibling);ws.classList.remove('anim-expanded');expand.textContent='Expand \u2197';expand.setAttribute('aria-expanded','false');expand.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  expand.onclick=()=>dialog.open?close():open();
 }
})();

/* Retrieval practice (added 2026-09): every .question-answer starts hidden. One "Show answers / Hide answers"
   button per .chapter-question-bank toggles all of them and remembers the choice in localStorage
   ("aa-answers-visible"); each question also gets its own "Show answer" button. A hash link to a question
   (#skiena-mcq-012) or to its answer reveals that one answer. Printing shows every answer (aligned.css). */
(() => {
 const KEY='aa-answers-visible';
 const banks=[...document.querySelectorAll('.chapter-question-bank')];
 if(!banks.length)return;
 const read=()=>{try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}};
 const save=v=>{try{localStorage.setItem(KEY,v?'1':'0');}catch(e){}};
 const answers=[];let all=read();
 function setOne(a,show){a.hidden=!show;const b=a._toggle;if(b){b.setAttribute('aria-expanded',String(show));b.textContent=show?'Hide answer':'Show answer';}}
 banks.forEach((bank,k)=>{
  const bar=document.createElement('div');bar.className='answer-controls';
  const btn=document.createElement('button');btn.type='button';btn.className='answers-toggle';if(bank.id)btn.setAttribute('aria-controls',bank.id);
  const note=document.createElement('span');note.className='answer-note';note.textContent='Try each question before you look. Hash links open one answer.';
  bar.append(btn,note);bank.prepend(bar);bank._btn=btn;
  bank.querySelectorAll('.question-answer').forEach((a,i)=>{
   if(!a.id)a.id=(a.closest('.source-exercise')?.id||`${bank.id||'bank'+k}-q${i+1}`)+'-answer';
   const b=document.createElement('button');b.type='button';b.className='answer-toggle';b.setAttribute('aria-controls',a.id);
   b.onclick=()=>{setOne(a,a.hidden);if(!a.hidden)a.scrollIntoView?.({block:'nearest'});};
   a._toggle=b;a.before(b);answers.push(a);
  });
 });
 function setAll(show,persist){all=show;answers.forEach(a=>setOne(a,show));banks.forEach(b=>{b._btn.textContent=show?'Hide answers':'Show answers';b._btn.setAttribute('aria-expanded',String(show));});if(persist)save(show);}
 banks.forEach(b=>{b._btn.onclick=()=>setAll(!all,true);});
 setAll(all,false);
 // A link to a question (or its answer) reveals that answer only; pagination and tab switching stay with the block above.
 function revealHash(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const t=document.getElementById(id);const a=t?.classList.contains('question-answer')?t:t?.closest('.source-exercise')?.querySelector('.question-answer');if(a)setOne(a,true);}
 addEventListener('hashchange',revealHash);revealHash();
})();
