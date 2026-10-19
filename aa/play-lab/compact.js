/* Shared, reversible game view. Existing controls keep their event handlers. */
(()=>{'use strict';
const main=document.querySelector('main');if(!main)return;
const menu=document.createElement('details');menu.className='play-menu';
const summary=document.createElement('summary');summary.textContent='☰ Games & settings · Oyunlar ve ayarlar';menu.append(summary);
const content=document.createElement('div');content.className='play-menu-content';menu.append(content);
const selectors=['.intro','.world-links','.games','#worlds','#modes','.setup','.mode-tabs','.game-heading','.heading','.adventure-entry','.quest-entry','#map'];
for(const child of [...main.children])if(selectors.some(s=>child.matches(s))||(child.matches('p')&&child.querySelector('a')&&!child.hasAttribute('lang'))){content.append(child);}
for(const link of document.querySelectorAll('#workbench .adventure-entry,#workbench #quest-link'))content.append(link);
main.insertBefore(menu,main.querySelector('.class-banner')?.nextSibling||main.firstChild);
const focus=document.createElement('button');focus.type='button';focus.className='jump-play';focus.textContent='▶ Back to game';content.append(focus);
focus.onclick=()=>{menu.open=false;const game=document.querySelector('#workbench,#adventure,#campaign:not([hidden]),#workshop,.arena,#mission,#card');game?.scrollIntoView({block:'start',behavior:'smooth'});};
// A mobile comparison can show either lane, or both. No lane content is removed.
let laneView='you';
function lanes(){for(const duel of document.querySelectorAll('.duel:not([data-compact])')){
 duel.dataset.compact='true';duel.dataset.view=laneView;
 const tabs=document.createElement('div');tabs.className='lane-switch';tabs.setAttribute('aria-label','Compare plans');
 for(const [id,label] of [['you','Your plan'],['rival','Pip’s plan'],['both','Both']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(id===laneView));b.onclick=()=>{laneView=id;duel.dataset.view=id;for(const x of tabs.children)x.setAttribute('aria-pressed',String(x===b));};tabs.append(b);}
 duel.before(tabs);
}}
const mission=document.querySelector('#mission');if(mission){lanes();new MutationObserver(lanes).observe(mission,{childList:true,subtree:true});}
})();
