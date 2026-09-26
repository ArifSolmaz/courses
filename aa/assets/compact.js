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
  /* Packing (2026-09, third design). A widget is not split into fixed panes any more: every block it renders
     (title, option rows, the code, its variables+output, the play bar, each visual, stats, message) becomes an
     item of one CSS grid on the widget root. Wrappers between the root and a code trace or play bar get
     display:contents, so a wrapper the widget hides for its other mode hides its blocks. compact.js then tries
     1–4 columns: it measures every block, gives a block that is wider than a column (a long code line, a wide
     table) the full width, splits the rest into columns of nearly equal height (the linear-partition DP from
     Week 13, block order kept) and scales the whole widget with CSS zoom so the tallest column just fills the
     stage. The column count with the largest zoom wins. Text is one size everywhere in the widget.
     During playback only the row spans and the zoom follow the frames; the columns stay put. */
  const UNIT=4,GAP=16,MINCOL=250,ZMIN=0.62,ZMAX=1.7;
  const set=(e,k,v)=>{if(e.style[k]!==v)e.style[k]=v;};
  const shown=e=>e.nodeType===1&&!['SCRIPT','STYLE','TEMPLATE','NOSCRIPT'].includes(e.tagName)&&getComputedStyle(e).display!=='none';
  const hgt=e=>{const cs=getComputedStyle(e);return e.offsetHeight+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0);};
  const rowsOf=h=>Math.max(1,Math.ceil((h+6)/UNIT));
  /* How much of a block is visible across: 1 when nothing inside it is clipped, else the ratio of a code block, pre
     or table wrapper that scrolls sideways (it or one of its descendants). */
  function clipRatio(it){let r=1;[it,...it.querySelectorAll('.ct-code, pre, .anim-table-wrap, .table-wrap')].forEach(e=>{if(e.scrollWidth>e.clientWidth+2)r=Math.min(r,e.clientWidth/e.scrollWidth);});return r;}
  function flatten(host){host.querySelectorAll('.ct, .anim-controls').forEach(el=>{let p=el.classList.contains('ct')?el:el.parentElement;while(p&&p!==host){p.classList.add('anim-flat');p=p.parentElement;}});}
  /* A tall, plain container (no border, background or padding; several stacked block children — e.g. a
     .ct-extra holding a grid, a notes table and a chart) is opened up so its children pack separately. */
  const OWN=['ct-code','ct-side','anim-opts','anim-controls','anim-stats','anim-msg','anim-title','aa-in-line'];
  function splittable(c){if(OWN.some(k=>c.classList.contains(k))||c.offsetHeight<220)return false;const cs=getComputedStyle(c);
   if(cs.display!=='block'||parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth)>0)return false;
   if(!/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)||cs.backgroundImage!=='none')return false;
   if(cs.position!=='static')return false;const kids=[...c.children].filter(shown);if(kids.length<2)return false;
   return kids.every(k=>{const ks=getComputedStyle(k);return ks.position==='static'&&(ks.display==='block'||ks.display==='grid'||ks.display==='flex'||ks.display==='table');});}
  function blocks(host){const out=[];(function walk(el){[...el.children].forEach(c=>{if(!shown(c))return;
    if(!c.classList.contains('anim-flat')&&splittable(c))c.classList.add('anim-flat');
    if(c.classList.contains('anim-flat'))walk(c);else out.push(c);});})(host);return out;}
  /* Split h (block heights, order kept) into K consecutive runs so that the tallest column is as short as
     possible; off[c] is what column c already holds. Returns [start,end) per column. */
  function partition(h,K,off){const n=h.length;if(!n)return[];K=Math.min(K,n);off=off||Array(K).fill(0);const pre=[0];h.forEach(x=>pre.push(pre[pre.length-1]+x));
   const M=Array.from({length:n+1},()=>Array(K+1).fill(Infinity)),D=Array.from({length:n+1},()=>Array(K+1).fill(0));M[0][0]=0;
   for(let i=1;i<=n;i++)for(let k=1;k<=Math.min(K,i);k++)for(let j=k-1;j<i;j++){const v=Math.max(M[j][k-1],off[k-1]+pre[i]-pre[j]);if(v<M[i][k]){M[i][k]=v;D[i][k]=j;}}
   const cols=[];let i=n;for(let k=K;k>0;k--){const j=D[i][k];cols.unshift([j,i]);i=j;}return cols;}
  function stageBox(){const sp=getComputedStyle(stage);return{w:stage.clientWidth-parseFloat(sp.paddingLeft||0)-parseFloat(sp.paddingRight||0),h:stage.clientHeight-parseFloat(sp.paddingTop||0)-parseFloat(sp.paddingBottom||0)};}
  function budget(host){const cs=getComputedStyle(host);const b=stageBox();let used=0;
   let p=host.parentElement;while(p&&p!==stage){const ps=getComputedStyle(p);used+=parseFloat(ps.paddingTop||0)+parseFloat(ps.paddingBottom||0)+parseFloat(ps.marginTop||0)+parseFloat(ps.marginBottom||0);p=p.parentElement;}
   const own=parseFloat(cs.paddingTop||0)+parseFloat(cs.paddingBottom||0)+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0);   /* css px inside the zoom */
   const side=parseFloat(cs.paddingLeft||0)+parseFloat(cs.paddingRight||0)+parseFloat(cs.borderLeftWidth||0)+parseFloat(cs.borderRightWidth||0);
   return{avail:Math.max(160,Math.floor(b.h-used-4)),width:b.w,own,side};}
  const zcap=()=>zoom.value==='auto'?ZMAX:Math.min(1,Number(zoom.value)||1);
  const colCss=(bud,K,z)=>(bud.width/z-bud.side-(K-1)*GAP)/K;                          /* one column, css px, at zoom z */
  const zFor=(bud,K,w)=>bud.width/(K*(w+8)+bud.side+(K-1)*GAP);                      /* zoom at which a block w css px wide fits a column */
  /* Natural width of each block (css px): measured once in the narrowest column the packer can produce; 0 when
     the block fits any column (text wraps, canvases scale). A code line or table wider than that is what
     decides between a full-width band and a smaller zoom. */
  function naturals(host,items,bud){(host._grown||[]).forEach(e=>e.style.maxHeight='');host._grown=[];set(host,'zoom',String(ZMAX));set(host,'gridTemplateColumns',`repeat(4, minmax(0, 1fr))`);set(host,'gridAutoRows','auto');
   items.forEach(it=>{set(it,'maxWidth','');set(it,'gridColumn','1');set(it,'gridRow','auto');});
   host._fluid=new Set();
   return items.map(it=>{const r=clipRatio(it);let w=r<0.98?it.clientWidth/r:0;
    /* A grid of several equal tracks (cards, lanes, a square with its caption, a table drawn with divs) wraps
       its text rather than overflowing, so it has no measurable minimum: allow 170 css px per track (2–4
       tracks; a board of many small cells scales instead). Such a block is fluid: as a band it takes the
       whole width rather than a measured one. The variables/output pair is small and exempt. */
    if(!it.classList.contains('ct-side'))[it,...it.querySelectorAll('*')].forEach(e=>{if(e.clientWidth<it.clientWidth*0.8)return;const cs=getComputedStyle(e);if(cs.display!=='grid')return;
     const n=cs.gridTemplateColumns.split(' ').filter(x=>x&&x!=='none').length;if(n>=2&&n<=4&&n*170>w){w=n*170;host._fluid.add(it);}});
    return w;});}
  /* Place the blocks for K columns at zoom z. cols: Map block -> column (0 = full-width band); when absent it is
     built here: bands are the title and (mode 'band') every block wider than a column, the rest is split into
     K runs of nearly equal height. Returns the height of the packing in css px and the map. */
  function place(host,items,K,z,cols,nat,mode,forced){set(host,'zoom',String(z));set(host,'gridTemplateColumns',`repeat(${K}, minmax(0, 1fr))`);set(host,'gridAutoRows','auto');
   if(!cols){cols=new Map();const cw=colCss(bud_,K,z);
    items.forEach(it=>{set(it,'gridColumn','1');set(it,'gridRow','auto');set(it,'maxWidth','');});
    const need=items.map((it,i)=>{const r=clipRatio(it);return Math.max(nat[i],r<0.98?it.clientWidth/r:0);});   /* css px this block wants across */
    const wide=items.map((it,i)=>it.classList.contains('anim-title')||K>1&&mode==='band'&&(need[i]>cw||forced&&forced.has(it)));if(forced)items.forEach((it,i)=>{if(wide[i])forced.add(it);});
    /* a wide block spans as many columns as it needs (all of them for the title), the rest flow around it */
    items.forEach((it,i)=>{it._need=need[i];it._span=it.classList.contains('anim-title')?K:Math.max(2,Math.min(K,Math.ceil((need[i]+8+GAP)/(cw+GAP))));if(wide[i]){set(it,'gridColumn',`1 / span ${it._span}`);set(it,'maxWidth',bandWidth(host,it));}});
    const hs=items.map(hgt);let g=[];const cur=Array(K).fill(0);
    const flush=()=>{if(!g.length)return;partition(g.map(i=>hs[i]),K,cur).forEach(([a,b],c)=>{for(let k=a;k<b;k++){cols.set(items[g[k]],c+1);cur[c]+=rowsOf(hs[g[k]]);}});g=[];};
    items.forEach((it,i)=>{if(wide[i]){flush();cols.set(it,0);const s=it._span,start=Math.max(...cur.slice(0,s));for(let c=0;c<s;c++)cur[c]=start+rowsOf(hs[i]);}else g.push(i);});flush();}
   items.forEach(it=>{const c=cols.get(it);set(it,'gridColumn',c?String(c):`1 / span ${it.classList.contains('anim-title')?K:Math.min(K,it._span||K)}`);set(it,'gridRow','auto');set(it,'maxWidth',c?'':bandWidth(host,it));});
   const hs=items.map(hgt);const cur=Array(K).fill(0);
   items.forEach((it,i)=>{const c=cols.get(it),r=sticky_?Math.max(rowsOf(hs[i]),it._rows||0):rowsOf(hs[i]);it._rows=r;
    if(!c){const s=it.classList.contains('anim-title')?K:Math.min(K,it._span||K),start=Math.max(...cur.slice(0,s));set(it,'gridRow',`${start+1} / span ${r}`);for(let k=0;k<s;k++)cur[k]=start+r;}
    else{set(it,'gridRow',`${cur[c-1]+1} / span ${r}`);cur[c-1]+=r;}});
   set(host,'gridAutoRows',UNIT+'px');
   return{total:Math.max(...cur)*UNIT,cols};}
  const bandWidth=(host,it)=>it._need&&!it.classList.contains('anim-title')&&!(host._fluid&&host._fluid.has(it))?Math.ceil(it._need+8)+'px':'';
  let bud_=null,sticky_=false;
  /* Zoom for K columns: the largest value at which the tallest column fits the stage, the narrowest column is
     still MINCOL css px, and (mode 'cap', or once the columns are fixed) no block in a column is clipped. */
  function fitZ(host,items,K,cols,z,bud,cap,nat,mode,final){bud_=bud;const keep=!!cols,forced=new Set();let r;
   for(let pass=0;pass<4;pass++){r=place(host,items,K,z,keep?cols:null,nat,mode,forced);cols=r.cols;
    const wcap=zFor(bud,K,MINCOL-8);let z2=Math.min(cap,wcap,r.total>0?bud.avail/(r.total+bud.own):cap);
    if(keep||mode==='cap')items.forEach((it,i)=>{const c=cols.get(it),s=it._span||K;
     if(!c){if(s<K&&it._need&&!it.classList.contains('anim-title'))z2=Math.min(z2,bud.width/(bud.side+(K-1)*GAP+K*(it._need+8-(s-1)*GAP)/s));return;}   /* a band spanning s of K columns */
     if(nat[i])z2=Math.min(z2,zFor(bud,K,nat[i]));const cr=clipRatio(it);if(cr<1)z2=Math.min(z2,z*cr);});
    z2=Math.max(ZMIN,Math.floor(z2*100)/100);
    if(Math.abs(z2-z)<0.011){z=z2;break;}z=z2;}
    if(!keep&&mode==='band')items.forEach(it=>{if(cols.get(it)&&clipRatio(it)<0.98)forced.add(it);});
   if(!keep)return fitZ(host,items,K,cols,z,bud,cap,nat,mode,final);      /* the zoom these columns really allow */
   let r2=place(host,items,K,z,cols,nat,mode);
   if(final){grow(host,items,K,cols,bud.avail/z-bud.own-r2.total);r2=place(host,items,K,z,cols,nat,mode);
    for(let k=0;k<10&&z>ZMIN&&stage.scrollHeight>stage.clientHeight+1;k++){z=Math.max(ZMIN,Math.round((z-0.03)*100)/100);place(host,items,K,z,cols,nat,mode);}
    for(let k=0;k<4&&stage.scrollHeight>stage.clientHeight+1;k++){if(!shrink(host,items,cols,(stage.scrollHeight-stage.clientHeight)/z+4))break;place(host,items,K,z,cols,nat,mode);}}
   return{z,cols,total:r2.total};}
  /* Still too tall at the smallest zoom (a fifty-line listing): the tallest scroll box in the deepest column
     gives up the overflow and scrolls, as the widget's own stylesheet would have had it do. */
  function shrink(host,items,cols,over){const z=parseFloat(host.style.zoom)||1;const bottom=new Map();let deepest=0,col=0;
   items.forEach(it=>{const c=cols.get(it)||0,b=it.getBoundingClientRect().bottom;bottom.set(c,Math.max(bottom.get(c)||0,b));if(b>deepest){deepest=b;col=c;}});
   let best=null;items.forEach(it=>{if((cols.get(it)||0)!==col)return;const box=[it,...it.querySelectorAll('*')].find(e=>/auto|scroll/.test(getComputedStyle(e).overflowY)&&e.clientHeight>120);
    if(box&&(!best||box.clientHeight>best.clientHeight))best=box;});
   if(!best)return false;best.style.maxHeight=Math.max(96,best.clientHeight-over)+'px';(host._grown=host._grown||[]).push(best);return true;}
  /* Space left under a column goes to a scroll box in it (a long output, a table the widget capped), so the
     widget shows more instead of scrolling. Undone at the next packing. */
  const scroller=it=>[it,...it.querySelectorAll('*')].find(e=>{const cs=getComputedStyle(e);return /auto|scroll/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+2;});
  function grow(host,items,K,cols,free){if(!(free>24))return;const tall=[];items.forEach(it=>{const b=it.getBoundingClientRect();tall.push(b.bottom);});
   const colBottom=Array(K+1).fill(0);items.forEach((it,i)=>{const c=cols.get(it)||0;colBottom[c]=Math.max(colBottom[c],tall[i]);});const deepest=Math.max(...colBottom);
   const z=parseFloat(host.style.zoom)||1;
   items.forEach(it=>{const c=cols.get(it);if(!c)return;const box=scroller(it);if(!box)return;const room=free+(deepest-colBottom[c])/z;if(room<24)return;
    box.style.maxHeight=Math.min(box.scrollHeight+4,box.clientHeight+room)+'px';(host._grown=host._grown||[]).push(box);colBottom[c]=deepest;});}
  function pack(host){const items=blocks(host);if(!items.length)return;host.classList.add('anim-packed');set(host,'display','grid');items.forEach(it=>it.classList.add('anim-item'));
   const bud=budget(host),cap=zcap(),nat=naturals(host,items,bud);let best=null;const trials=[];
   for(let K=1;K<=4;K++){if(K>1&&zFor(bud,K,MINCOL-8)<ZMIN)break;
    for(const mode of (K===1?['cap']:['band','cap'])){const r=fitZ(host,items,K,null,best?best.z:1,bud,cap,nat,mode,false);trials.push([K,mode,r.z,r.total]);if(!best||r.z>best.z+0.02||(r.z>=best.z-0.005&&r.total<best.total-8))best={K,mode,...r};}}
   const r=fitZ(host,items,best.K,best.cols,best.z,bud,cap,nat,best.mode,true);
   host._pack={K:best.K,cols:best.cols,items,z:r.z,nat,trials,bud};}
  /* Between clicks (a frame drawn): nothing moves unless it must. Blocks keep their columns and rows; a block
     that grew past its rows gets more, and the zoom only steps down if the stage would scroll. A block that
     appeared or vanished means a new packing; so does the end of a run (aa:end) or any click. */
  function follow(host){const p=host._pack;if(!p)return pack(host);const items=blocks(host);
   if(items.length!==p.items.length||items.some((it,i)=>it!==p.items[i]))return pack(host);
   if(!items.some(it=>rowsOf(hgt(it))>(it._rows||0))&&stage.scrollHeight<=stage.clientHeight+1)return;
   bud_=budget(host);sticky_=true;try{let z=p.z;place(host,items,p.K,z,p.cols,p.nat,'band');
    for(let k=0;k<10&&z>ZMIN&&stage.scrollHeight>stage.clientHeight+1;k++){z=Math.max(ZMIN,Math.round((z-0.03)*100)/100);place(host,items,p.K,z,p.cols,p.nat,'band');}
    p.z=z;}finally{sticky_=false;}}
  function unpack(host){if(!host.classList.contains('anim-packed'))return;host.classList.remove('anim-packed');['display','zoom','gridTemplateColumns','gridAutoRows'].forEach(k=>host.style[k]='');
   host.querySelectorAll('.anim-item').forEach(it=>{it.classList.remove('anim-item');it.style.gridColumn='';it.style.gridRow='';it.style.maxWidth='';});(host._grown||[]).forEach(e=>e.style.maxHeight='');host._grown=[];delete host._pack;}
  function fitStory(story){const {avail}=budget(story);let z=1;for(let pass=0;pass<3;pass++){set(story,'zoom',String(z));const h=hgt(story);if(h<4)break;z=Math.max(ZMIN,Math.min(zcap(),Math.floor(avail/h*100)/100));}set(story,'zoom',String(z));
   for(let k=0;k<10&&z>ZMIN&&stage.scrollHeight>stage.clientHeight+1;k++){z=Math.max(ZMIN,Math.round((z-0.03)*100)/100);set(story,'zoom',String(z));}}
  function prepare(panel){const host=panel.querySelector('[data-anim]');if(host&&!host.classList.contains('anim-flattened')){flatten(host);host.classList.add('anim-flattened');}
   const story=panel.querySelector('.story-lesson');if(story&&!story.classList.contains('anim-paned')){
    const left=document.createElement('div');left.className='anim-left story-text';const right=document.createElement('div');right.className='anim-right';
    [...story.children].forEach(c=>{if(c.tagName==='NOSCRIPT')return;(c.classList.contains('story-widget')?right:left).append(c);});
    story.append(left,right);story.classList.add('anim-paned','anim-story');}}
  let fitting=false;
  function fit(full){const panel=panels.find(p=>!p.hidden);if(!panel||fitting)return;fitting=true;try{
   const wide=stageBox().w>=860;
   const host=panel.querySelector('[data-anim]');if(host){if(!wide)unpack(host);else if(full||!host._pack)pack(host);else follow(host);}
   const story=panel.querySelector('.story-lesson');if(story){if(!wide)set(story,'zoom','');else fitStory(story);}
  }finally{fitting=false;}}
  let fitPending=0;function refit(full){fitPending=Math.max(fitPending,full?2:1);requestAnimationFrame(()=>{const f=fitPending===2;fitPending=0;fit(f);});}
  new ResizeObserver(()=>refit(true)).observe(stage);
  stage.addEventListener('aa:frame',()=>refit(false));stage.addEventListener('aa:end',()=>refit(true));stage.addEventListener('click',()=>setTimeout(()=>refit(true),60));stage.addEventListener('input',()=>setTimeout(()=>refit(true),60));
  // Anything a widget adds or resizes after it was shown (late-sized graphs, panels that appear) is followed too.
  // Our own placement writes style attributes too: a style change on a placed block only counts when its height no
  // longer matches the rows it was given (a canvas that resized itself, a panel that grew).
  new MutationObserver(records=>{if(fitting)return;if(records.some(r=>{if(r.type!=='attributes'||r.attributeName!=='style')return true;const el=r.target;
   if(el.classList.contains('anim-packed')||el.classList.contains('story-lesson'))return false;
   if(el.classList.contains('anim-item'))return el._rows!==undefined&&shown(el)&&rowsOf(hgt(el))!==el._rows;return true;}))refit(false);}).observe(stage,{subtree:true,childList:true,attributes:true,characterData:true});
  function show(i,focus){i=Math.max(0,Math.min(panels.length-1,i));pauseAnimations();choice.value=String(i);panels.forEach(p=>p.hidden=p.dataset.animationPanel!==String(i));prepare(panels[i]);idx.textContent=String(i+1);refit(true);prev.disabled=i===0;next.disabled=i===panels.length-1;stage.scrollTop=0;if(focus)stage.focus({preventScroll:true});}
  choice.onchange=()=>show(Number(choice.value));prev.onclick=()=>show(Number(choice.value)-1,true);next.onclick=()=>show(Number(choice.value)+1,true);
  ws.addEventListener('keydown',keys);function keys(e){const t=e.target;const typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT');if(typing&&e.key!=='Escape')return;
   if((e.key==='ArrowLeft'&&e.altKey)||e.key==='PageUp'){e.preventDefault();prev.click();}if((e.key==='ArrowRight'&&e.altKey)||e.key==='PageDown'){e.preventDefault();next.click();}}
  function applyZoom(v){try{localStorage.setItem(ZKEY,v);}catch(e){}refit(true);}
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
  function open(){if(dialog.open)return;dialogHead.append(toolbar);dialog.append(stage);ws.classList.add('anim-expanded');expand.textContent='Close ✕';expand.setAttribute('aria-expanded','true');dialog.showModal();stage.focus({preventScroll:true});showHead(false);refit(true);}
  function close(){if(!dialog.open)return;dialog.close();}
  dialog.addEventListener('close',()=>{ws.insertBefore(toolbar,home.nextSibling);ws.insertBefore(stage,toolbar.nextSibling);ws.classList.remove('anim-expanded');dialog.classList.remove('head-open');expand.textContent='Expand ↗';expand.setAttribute('aria-expanded','false');expand.focus({preventScroll:true});refit(true);});
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
