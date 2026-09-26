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
  /* Two panes on a wide stage: code, state, stats and message on the left; the visual on the right; the
     option rows and the play bar span both. The widget's own element references stay valid because the
     nodes only move into wrappers inside the same host. Idempotent, so late-added children get placed too. */
  /* Two panes on a wide stage. Left: the code with its variables and output, and the play bar under them
     (the space that used to sit empty). Right: the option rows (test / predict), the visual, stats and message.
     Widgets that wrap their "watch" mode in an inner container get the same treatment on that container;
     the Week 1 stories put their text on the left and the story widget on the right. Nodes only move into
     wrappers inside the same host, so the widgets' element references stay valid; idempotent. */
  const KEEP=['anim-title','anim-opts','aa-in-line'];
  function target(host){if(host.classList.contains('anim-paned'))return host;
   const inner=host.querySelector(':scope > .anim-paned');if(inner)return inner;
   if(host.querySelector(':scope > .ct')||host.querySelector(':scope > .anim-controls'))return host;
   return [...host.children].find(c=>c.querySelector(':scope > .ct')&&c.querySelector('.anim-controls'))||(host.querySelector('.anim-controls')?host:null);}
  function group(box){let left=box.querySelector(':scope > .anim-left'),right=box.querySelector(':scope > .anim-right');
   if(!right){left=document.createElement('div');left.className='anim-left';right=document.createElement('div');right.className='anim-right';
    const anchor=[...box.children].find(c=>!c.classList.contains('anim-title'))||null;if(anchor)anchor.before(left,right);else box.append(left,right);}
   if(!left){left=document.createElement('div');left.className='anim-left';right.before(left);}
   [...box.children].forEach(c=>{if(c===left||c===right||c.classList.contains('anim-title'))return;
    if(c.classList.contains('ct')||(c.classList.contains('anim-controls')&&!box.classList.contains('anim-single')))left.append(c);else if(!c.classList.contains('anim-controls'))right.append(c);});
   const bar=left.querySelector(':scope > .anim-controls');if(bar)left.append(bar);           /* bar last, under code and state */
   if(!left.querySelector(':scope > .ct')){                                                    /* no code block: bar spans, rest in two columns */
    if(bar)box.append(bar);[...left.children].forEach(c=>right.append(c));left.remove();box.classList.add('anim-single');}
   box.classList.add('anim-paned');return box;}
  function panes(panel){const host=panel.querySelector('[data-anim]');
   if(host){const box=target(host);if(box){group(box);if(box!==host)host.classList.add('anim-outer');}return;}
   const story=panel.querySelector('.story-lesson');if(story&&!story.classList.contains('anim-paned')){
    const left=document.createElement('div');left.className='anim-left story-text';const right=document.createElement('div');right.className='anim-right';
    [...story.children].forEach(c=>{if(c.tagName==='NOSCRIPT')return;(c.classList.contains('story-widget')?right:left).append(c);});
    story.append(left,right);story.classList.add('anim-paned','anim-story');}}
  /* Each pane gets the height left under the title (and, for widgets without a code block, above the bar);
     a pane taller than that is scaled down (never below 62 %) and then scrolls for the remainder. */
  let fitting=false;
  function fit(){const panel=panels.find(p=>!p.hidden);if(!panel||fitting)return;fitting=true;try{
   const auto=zoom.value==='auto';
   const boxes=[...panel.querySelectorAll('.anim-paned')];
   const sp=getComputedStyle(stage);const stagePad=parseFloat(sp.paddingTop||0)+parseFloat(sp.paddingBottom||0);
   boxes.forEach(box=>{const panesEl=[box.querySelector(':scope > .anim-left'),box.querySelector(':scope > .anim-right')].filter(Boolean);
    const set=(e,k,v)=>{if(e.style[k]!==v)e.style[k]=v;};
    panesEl.forEach(e=>{set(e,'maxHeight','');set(e,'zoom','');});
    if(getComputedStyle(box).display!=='grid')return;
    let used=stagePad;[...box.children].forEach(c=>{if(!panesEl.includes(c)){const cs=getComputedStyle(c);used+=c.getBoundingClientRect().height+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0);}});
    const outer=box.closest('[data-anim]');if(outer&&outer!==box){[...outer.children].forEach(c=>{if(c!==box)used+=c.getBoundingClientRect().height+8;});}
    const hs=getComputedStyle(box),gap=parseFloat(hs.rowGap||0)||8;const rows=box.children.length-panesEl.length+1;
    const hostPad=(el=>{const cs=getComputedStyle(el);return parseFloat(cs.paddingTop||0)+parseFloat(cs.paddingBottom||0);})(outer||box);
    let avail=Math.max(200,Math.floor(stage.clientHeight-used-gap*rows-hostPad-parseFloat(hs.paddingTop||0)-parseFloat(hs.paddingBottom||0)-6));
    const apply=()=>panesEl.forEach(e=>{
     let z=1;for(let pass=0;pass<3;pass++){set(e,'zoom',String(z));set(e,'maxHeight','');const need=e.getBoundingClientRect().height;
      if(need<4)break;const want=z*avail/need;z=auto?Math.min(1.5,Math.max(0.62,Math.floor(want*100)/100)):Math.min(1,Math.max(0.62,Math.floor(want*100)/100));}
     set(e,'zoom',String(z));set(e,'maxHeight',Math.floor(avail/z)+'px');
     // The reflow at the chosen zoom can still leave a few pixels over: step down until the pane fits or 72 % is reached.
     for(let k=0;k<12&&z>0.62&&e.scrollHeight>e.clientHeight+1;k++){z=Math.max(0.62,Math.round((z-0.03)*100)/100);set(e,'zoom',String(z));set(e,'maxHeight',Math.floor(avail/z)+'px');}});
    apply();
    // Whatever the budget missed shows up as stage overflow: take it off and fit once more.
    const over=stage.scrollHeight-stage.clientHeight;if(over>1){avail-=over+2;apply();}});
   // A widget whose other mode (e.g. "price the receipt yourself") is a tall block outside the paned box:
   // scale that block to the space under the title and option rows.
   panel.querySelectorAll('[data-anim].anim-outer').forEach(host=>{
    const set=(e,k,v)=>{if(e.style[k]!==v)e.style[k]=v;};
    const blocks=[...host.children].filter(c=>!c.classList.contains('anim-title')&&!c.classList.contains('anim-opts')&&!c.classList.contains('anim-paned')&&getComputedStyle(c).display!=='none');
    if(!blocks.length)return;
    let used=stagePad+12;[...host.children].forEach(c=>{if(!blocks.includes(c)&&getComputedStyle(c).display!=='none')used+=c.getBoundingClientRect().height+8;});
    const avail=Math.max(200,Math.floor(stage.clientHeight-used));
    blocks.forEach(e=>{set(e,'zoom','');set(e,'maxHeight','');set(e,'overflow','');const need=e.getBoundingClientRect().height;if(need<4)return;
     let z=Math.min(zoom.value==='auto'?1.5:1,Math.max(0.62,Math.floor(avail/need*100)/100));set(e,'zoom',String(z));set(e,'maxHeight',Math.floor(avail/z)+'px');set(e,'overflow','auto');
     for(let k=0;k<12&&z>0.62&&e.scrollHeight>e.clientHeight+1;k++){z=Math.max(0.62,Math.round((z-0.03)*100)/100);set(e,'zoom',String(z));set(e,'maxHeight',Math.floor(avail/z)+'px');}});});
  }finally{fitting=false;}}
  let fitPending=false;function refit(){if(fitPending)return;fitPending=true;requestAnimationFrame(()=>{fitPending=false;fit();});}
  new ResizeObserver(refit).observe(stage);
  stage.addEventListener('aa:frame',refit);stage.addEventListener('click',()=>setTimeout(refit,60));stage.addEventListener('input',()=>setTimeout(refit,60));
  // Anything a widget adds or resizes after it was shown (late-sized graphs, panels that appear) refits too.
  new MutationObserver(records=>{if(fitting)return;if(records.some(r=>!(r.type==='attributes'&&r.target.classList&&(r.target.classList.contains('anim-left')||r.target.classList.contains('anim-right')))))refit();}).observe(stage,{subtree:true,childList:true,attributes:true,characterData:true});
  function show(i,focus){i=Math.max(0,Math.min(panels.length-1,i));pauseAnimations();choice.value=String(i);panels.forEach(p=>p.hidden=p.dataset.animationPanel!==String(i));panes(panels[i]);idx.textContent=String(i+1);refit();prev.disabled=i===0;next.disabled=i===panels.length-1;stage.scrollTop=0;if(focus)stage.focus({preventScroll:true});}
  choice.onchange=()=>show(Number(choice.value));prev.onclick=()=>show(Number(choice.value)-1,true);next.onclick=()=>show(Number(choice.value)+1,true);
  ws.addEventListener('keydown',keys);function keys(e){const t=e.target;const typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT');if(typing&&e.key!=='Escape')return;
   if((e.key==='ArrowLeft'&&e.altKey)||e.key==='PageUp'){e.preventDefault();prev.click();}if((e.key==='ArrowRight'&&e.altKey)||e.key==='PageDown'){e.preventDefault();next.click();}}
  function applyZoom(v){stage.style.zoom=v==='auto'?'':v;try{localStorage.setItem(ZKEY,v);}catch(e){}requestAnimationFrame(fit);}
  let z='auto';try{z=localStorage.getItem(ZKEY)||'auto';}catch(e){}
  if(![...zoom.options].some(o=>o.value===z))z='auto';zoom.value=z;applyZoom(z);zoom.onchange=()=>applyZoom(zoom.value);
  const m=location.hash.match(/^#animations-(\d+)$/);show(m?Number(m[1])-1:0);
  // Expand: a native modal dialog that borrows the toolbar and the stage, then gives them back.
  const dialog=document.createElement('dialog');dialog.className='anim-dialog';dialog.setAttribute('aria-label','Animation, expanded');
  const dialogHead=document.createElement('div');dialogHead.className='anim-dialog-head';
  const strip=document.createElement('button');strip.type='button';strip.className='anim-dialog-strip';strip.setAttribute('aria-label','Show the animation toolbar');strip.innerHTML='<span></span>';
  dialog.append(dialogHead,strip);document.body.append(dialog);dialog.addEventListener('keydown',keys);
  const home=document.createComment('anim-workspace home');ws.insertBefore(home,toolbar);
  /* The toolbar slides away after a moment so the whole screen is the animation; the top edge, the strip
     button, keyboard focus inside the toolbar, or Tab bring it back. */
  let hideTimer=0;function showHead(sticky){dialog.classList.add('head-open');clearTimeout(hideTimer);if(!sticky)hideTimer=setTimeout(()=>{if(!dialogHead.contains(document.activeElement))dialog.classList.remove('head-open');},1800);}
  dialog.addEventListener('mousemove',e=>{if(e.clientY<=8)showHead(false);});
  dialogHead.addEventListener('mouseenter',()=>showHead(true));dialogHead.addEventListener('mouseleave',()=>showHead(false));
  dialogHead.addEventListener('focusin',()=>showHead(true));dialogHead.addEventListener('focusout',()=>showHead(false));
  strip.addEventListener('click',()=>{showHead(true);choice.focus();});
  function open(){if(dialog.open)return;dialogHead.append(toolbar);dialog.append(stage);ws.classList.add('anim-expanded');expand.textContent='Close ✕';expand.setAttribute('aria-expanded','true');dialog.showModal();stage.focus({preventScroll:true});showHead(false);requestAnimationFrame(fit);}
  function close(){if(!dialog.open)return;dialog.close();}
  dialog.addEventListener('close',()=>{ws.insertBefore(toolbar,home.nextSibling);ws.insertBefore(stage,toolbar.nextSibling);ws.classList.remove('anim-expanded');dialog.classList.remove('head-open');expand.textContent='Expand ↗';expand.setAttribute('aria-expanded','false');expand.focus({preventScroll:true});requestAnimationFrame(fit);});
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
