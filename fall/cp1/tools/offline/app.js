let notebook=structuredClone(ORIGINAL), worker, workerURL, ready=false, busy=false, active=null, execution=0, dirty=false;
const $=id=>document.getElementById(id), editors=new Map(), outputs=new Map(), runSources=new Map(), errors=new Map();
$('licenses').textContent=LICENSES;
if(location.protocol==='https:'||location.protocol==='http:'){const a=$('download-html');a.hidden=false;a.href=CONFIG.filename;a.download=CONFIG.filename;}

function markDirty(){dirty=true;$('save-state').textContent='Unsaved changes — use Save notebook before leaving.';}
function controls(){document.querySelectorAll('.run').forEach(b=>b.disabled=!ready||busy);}
function render(){
  $('notebook').replaceChildren();editors.clear();outputs.clear();errors.clear();$('sections').replaceChildren();let lastRealm=null;
  notebook.cells.forEach((cell,i)=>{
    const section=document.createElement('section');
    if(cell.cell_type==='markdown'){
      section.className='md';section.innerHTML=DOMPurify.sanitize(marked.parse(cell.source.join('')));
      section.querySelectorAll('a').forEach(a=>{if(!a.getAttribute('href').startsWith('#')){a.target='_blank';a.rel='noopener noreferrer';}});
    const heading=[...section.querySelectorAll('h1,h2')].find(h=>!h.closest('details'));
      if(heading){section.id=cell.metadata?.offline_anchor||'section-'+i;const realm=cell.metadata?.offline_realm||'lesson';if(realm!==lastRealm){const group=document.createElement('h3');group.textContent=realm==='solutions'?'Worked solutions':'Lesson & practice';$('sections').append(group);lastRealm=realm;}
        const link=document.createElement('a');link.href='#'+section.id;link.textContent=(i===0?'Week '+CONFIG.week+' overview':heading.textContent).replace(/^Part (\d+): /,'$1. ').replace(/^CP1 Week 03 — /,'');link.onclick=()=>{$('sections').querySelectorAll('a').forEach(a=>a.removeAttribute('aria-current'));link.setAttribute('aria-current','location');};$('sections').append(link);}
    }else if(cell.cell_type==='code'){
      section.className='cell';section.id='cell-'+i;
      const bar=document.createElement('div');bar.className='cell-bar';
      const label=document.createElement('span');label.textContent='Python · cell '+(i+1);
      const run=document.createElement('button');run.textContent='Run';run.className='run primary';run.setAttribute('aria-label','Run cell '+(i+1));run.onclick=()=>runCell(i);
      bar.append(label,run);
      const editor=document.createElement('textarea');editor.value=cell.source.join('');editor.spellcheck=false;editor.setAttribute('aria-label','Code cell '+(i+1));editor.rows=Math.min(24,Math.max(3,editor.value.split('\n').length));
      editor.oninput=()=>{cell.source=[editor.value];markDirty();};
      editor.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');editor.dispatchEvent(new Event('input'));} if(e.key==='Enter'&&e.shiftKey){e.preventDefault();runCell(i);}};
      const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Input values (only for input())';
      const input=document.createElement('textarea');input.rows=2;input.setAttribute('aria-label','Input values for cell '+(i+1));input.placeholder='One response per line';details.append(summary,input);
      const output=document.createElement('pre');output.className='output';output.setAttribute('aria-label','Output for cell '+(i+1));output.setAttribute('aria-live','polite');output.textContent=(cell.outputs||[]).map(o=>o.text?.join?.('')||o.text||o.traceback?.join('\n')||'').join('');
      section.append(bar);
      if(editor.value.startsWith('#@title Study tools')){const hidden=document.createElement('details');const title=document.createElement('summary');title.textContent='Study helper code — run once; reading this code is optional';hidden.append(title,editor);section.append(hidden);}else section.append(editor);
      const error=document.createElement('div');error.className='error-panel';error.hidden=true;error.setAttribute('role','alert');section.append(details,output,error);errors.set(i,error);editors.set(i,{editor,input});outputs.set(i,output);
    }
    $('notebook').append(section);
  });controls();
}
function boot(){
  if(worker)worker.terminate();if(workerURL)URL.revokeObjectURL(workerURL);
  if(active!==null){$('cell-'+active)?.classList.remove('running');const cell=notebook.cells[active];cell.outputs.push({output_type:'stream',name:'stderr',text:['Stopped. Python state was cleared.\n']});outputs.get(active).textContent+='\nStopped. Python state was cleared.\n';}
  ready=false;busy=false;active=null;execution=0;controls();$('status').textContent='Starting local Python…';$('fatal').textContent='';
  workerURL=URL.createObjectURL(new Blob([WORKER],{type:'text/javascript'}));worker=new Worker(workerURL);
  worker.onmessage=({data:m})=>{
    if(m.type==='ready'){ready=true;$('status').textContent='Python ready · runs on this computer';controls();return;}
    if(m.type==='fatal'){$('fatal').textContent=m.text;$('status').textContent='Python could not start';ready=false;busy=false;controls();return;}
    const cell=notebook.cells[m.id];if(!cell)return;
    if(m.type==='stream'){outputs.get(m.id).textContent+=m.text;cell.outputs.push({output_type:'stream',name:m.name,text:[m.text]});}
    if(m.type==='error'){const error=describePythonError(m.text,m.id,runSources);showError(m.id,error);cell.outputs.push({output_type:'error',ename:error.type,evalue:error.message,traceback:m.text.split('\n')});}
    if(m.type==='done'||m.type==='error'){busy=false;active=null;$('cell-'+m.id).classList.remove('running');$('status').textContent=m.type==='done'?'Finished · Python ready':'Cell has an error · edit and run again';controls();}
  };
  worker.onerror=e=>{$('fatal').textContent=e.message;ready=false;busy=false;controls();};
  worker.postMessage({type:'init',files:FILES});
}
function runCell(i){
  if(!ready||busy)return;busy=true;active=i;controls();$('cell-'+i).classList.add('running');$('status').textContent='Running cell '+(i+1)+'…';
  const cell=notebook.cells[i],{editor,input}=editors.get(i);cell.source=[editor.value];cell.outputs=[];cell.execution_count=++execution;outputs.get(i).textContent='';errors.get(i).hidden=true;errors.get(i).replaceChildren();runSources.set(i,editor.value);markDirty();
  worker.postMessage({type:'run',id:i,realm:cell.metadata?.offline_realm||'lesson',code:editor.value,inputs:input.value===''?[]:input.value.split('\n')});
}
function showError(id, error){
  const panel=errors.get(id);panel.replaceChildren();panel.hidden=false;
  const title=document.createElement('h3');title.textContent=error.type+(error.line?' · cell '+(error.cell+1)+', line '+error.line:'');
  const message=document.createElement('p');message.className='error-message';message.textContent=error.message;
  const hint=document.createElement('p');hint.textContent=error.hint;
  panel.append(title,message,hint);
  if(error.line && error.source){
    const snippet=document.createElement('pre');snippet.className='error-code';
    const lines=error.source.split('\n');
    for(let n=Math.max(1,error.line-1);n<=Math.min(lines.length,error.line+1);n++){
      const row=document.createElement('span');row.textContent=String(n).padStart(3)+'  '+lines[n-1]+'\n';if(n===error.line)row.className='error-line';snippet.append(row);
    }
    panel.append(snippet);
    const edit=document.createElement('button');edit.textContent='Go to line '+error.line;
    edit.onclick=()=>{const editor=editors.get(error.cell)?.editor;if(!editor)return;const hidden=editor.closest('details');if(hidden)hidden.open=true;editor.scrollIntoView({block:'center'});editor.focus();const lines=editor.value.split('\n'),start=lines.slice(0,error.line-1).reduce((n,s)=>n+s.length+1,0);editor.setSelectionRange(start,start+(lines[error.line-1]||'').length);};panel.append(edit);
  }
  const note=document.createElement('p');note.className='muted';note.textContent=error.syntax?'Fix the syntax, then run again. Previously stored variables are not cleared.':'Execution stopped at the error. Earlier statements may already have changed variables. Fix the code and rerun; restart Python if you need a clean state.';
  const details=document.createElement('details'),summary=document.createElement('summary'),raw=document.createElement('pre');summary.textContent='Technical details — full traceback';raw.textContent=error.text;details.append(summary,raw);panel.append(note,details);
}
$('restart').onclick=boot;
$('save').onclick=()=>{
  const blob=new Blob([JSON.stringify(notebook,null,2)],{type:'application/x-ipynb+json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=CONFIG.saveName;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);dirty=false;$('save-state').textContent='Download requested. Keep the .ipynb file with this HTML file.';
};
$('restore').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const nb=JSON.parse(await file.text());
    if(nb.metadata?.cp1_offline_week!==CONFIG.week||nb.nbformat!==4||nb.cells?.length!==ORIGINAL.cells.length||nb.cells.some((c,i)=>c.cell_type!==ORIGINAL.cells[i].cell_type||!Array.isArray(c.source)||c.source.some(s=>typeof s!=='string')))throw Error('Choose a saved Week '+CONFIG.week+' notebook from this offline edition.');
    if(dirty&&!confirm('Replace your unsaved edits with the selected notebook?'))return;
    // Keep the trusted lesson text; restore student code only, never execute on import.
    notebook=structuredClone(ORIGINAL);nb.cells.forEach((c,i)=>{if(c.cell_type==='code'){notebook.cells[i].source=c.source;notebook.cells[i].outputs=(Array.isArray(c.outputs)?c.outputs:[]).filter(o=>o.output_type==='stream'&&Array.isArray(o.text)&&o.text.every(t=>typeof t==='string')).map(o=>({output_type:'stream',name:o.name==='stderr'?'stderr':'stdout',text:o.text}));notebook.cells[i].execution_count=null;}});
    active=null;render();boot();dirty=false;$('save-state').textContent='Saved code opened. Rerun cells in order to rebuild Python variables.';
  }catch(err){$('fatal').textContent=String(err);}finally{e.target.value='';}
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
render();boot();
