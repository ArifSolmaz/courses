(function () {
  'use strict';
  const checklist=document.getElementById('pilot-checklist');
  const button=document.getElementById('print-pilot-checklist');
  const status=document.getElementById('checklist-print-status');
  if(!checklist||!button||!status)return;
  const tr=document.documentElement.lang==='tr';
  let pending=null;
  function prepare(scope){
    if(pending)return;
    pending={open:checklist.open,scope:document.body.getAttribute('data-print-scope'),focus:document.activeElement};
    checklist.open=true;
    if(scope)document.body.setAttribute('data-print-scope','pilot-checklist');
  }
  function restore(){
    if(!pending)return;
    const prior=pending;pending=null;
    checklist.open=prior.open;
    if(prior.scope===null)document.body.removeAttribute('data-print-scope');
    else document.body.setAttribute('data-print-scope',prior.scope);
    if(prior.focus&&prior.focus.isConnected)prior.focus.focus({preventScroll:true});
  }
  window.addEventListener('beforeprint',()=>prepare(false));
  window.addEventListener('afterprint',restore);
  button.addEventListener('click',()=>{
    prepare(true);status.textContent='';
    try{window.print();}
    catch(_){status.textContent=tr?'Yazdırma açılamadı. Tarayıcının Yazdır komutuyla öğretmen sayfasını yazdırabilirsin; kontrol listesi çıktıda açılır.':'Printing could not open. Use the browser Print command to print the teacher page; the checklist expands in the output.';}
    finally{restore();}
  });
  button.hidden=false;button.disabled=false;
})();
