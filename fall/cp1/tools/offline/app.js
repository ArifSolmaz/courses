let notebook=structuredClone(ORIGINAL), worker, workerURL, ready=false, busy=false, active=null, execution=0, dirty=false;
const $=id=>document.getElementById(id), editors=new Map(), outputs=new Map(), runSources=new Map(), errors=new Map(), plots=new Map();
let runtimeFiles={lesson:[],solutions:[]};
$('licenses').textContent=LICENSES;
if(location.protocol==='https:'||location.protocol==='http:'){const a=$('download-html');a.hidden=false;a.href=CONFIG.filename;a.download=CONFIG.filename;}

function markDirty(){dirty=true;$('save-state').textContent='Unsaved changes — use Save notebook before leaving.';}
function controls(){document.querySelectorAll('.run,[data-runtime-control]').forEach(b=>b.disabled=!ready||busy);}
function fitEditor(editor){
  editor.style.height='auto';
  editor.style.height=(editor.scrollHeight+2)+'px';
}
function expandContent(root){
  root.querySelectorAll('details').forEach(detail=>{
    const section=document.createElement('section');section.className='expanded-content';
    for(const child of [...detail.childNodes]){
      if(child.nodeName==='SUMMARY'){const title=document.createElement('h3');title.textContent=child.textContent;section.append(title);}
      else section.append(child);
    }
    detail.replaceWith(section);
  });
}
function fitAllEditors(){document.querySelectorAll('.cell textarea').forEach(fitEditor);}
let editorWidth=0;
new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==editorWidth){editorWidth=width;requestAnimationFrame(fitAllEditors);}}).observe($('notebook'));
function render(){
  $('notebook').replaceChildren();editors.clear();outputs.clear();errors.clear();plots.clear();$('sections').replaceChildren();let lastRealm=null;
  notebook.cells.forEach((cell,i)=>{
    const section=document.createElement('section');
    if(cell.cell_type==='markdown'){
      section.className='md';section.innerHTML=DOMPurify.sanitize(marked.parse(cell.source.join('')));
      section.querySelectorAll('a').forEach(a=>{if(!a.getAttribute('href').startsWith('#')){a.target='_blank';a.rel='noopener noreferrer';}});
    const heading=[...section.querySelectorAll('h1,h2')].find(h=>!h.closest('details'));
      if(heading){section.id=cell.metadata?.offline_anchor||'section-'+i;const realm=cell.metadata?.offline_realm||'lesson';if(realm!==lastRealm){const group=document.createElement('h3');group.textContent=realm==='solutions'?'Worked solutions':'Lesson & practice';$('sections').append(group);lastRealm=realm;}
        const link=document.createElement('a');link.href='#'+section.id;link.textContent=(i===0?'Week '+CONFIG.week+' overview':cell.metadata?.offline_anchor==='solutions'?'Solutions overview':heading.textContent).replace(/^Part (\d+): /,'$1. ').replace(/^CP1 Week \d+ — /,'');$('sections').append(link);}
    }else if(cell.cell_type==='code'){
      section.className='cell';section.id='cell-'+i;
      const bar=document.createElement('div');bar.className='cell-bar';
      const label=document.createElement('span');label.textContent='Python · cell '+(i+1);
      const run=document.createElement('button');run.textContent='Run';run.className='run primary';run.setAttribute('aria-label','Run cell '+(i+1));run.onclick=()=>runCell(i);
      bar.append(label,run);
      const editor=document.createElement('textarea');editor.value=cell.source.join('');editor.spellcheck=false;editor.setAttribute('aria-label','Code cell '+(i+1));editor.rows=Math.max(3,editor.value.split('\n').length);
      editor.oninput=()=>{cell.source=[editor.value];fitEditor(editor);markDirty();};
      editor.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');editor.dispatchEvent(new Event('input'));} if(e.key==='Enter'&&e.shiftKey){e.preventDefault();runCell(i);}};
      const details=document.createElement('section');details.className='cell-inputs';const summary=document.createElement('h3');summary.textContent='Input values (only for input())';
      const input=document.createElement('textarea');input.rows=2;input.setAttribute('aria-label','Input values for cell '+(i+1));input.placeholder='One response per line';input.value=(cell.metadata?.offline_inputs||[]).join('\n');input.oninput=()=>{cell.metadata.offline_inputs=input.value===''?[]:input.value.split('\n');fitEditor(input);markDirty();};details.open=Boolean(cell.metadata?.offline_inputs);const help=document.createElement('p');help.className='input-help';help.textContent='One response per input() call, in order. Edit the sample values to try another case.';details.append(summary,help,input);
      const output=document.createElement('pre');output.className='output';output.setAttribute('aria-label','Output for cell '+(i+1));output.setAttribute('aria-live','polite');output.textContent=(cell.outputs||[]).filter(o=>o.output_type!=='display_data').map(o=>o.text?.join?.('')||o.text||o.traceback?.join('\n')||'').join('');
      section.append(bar);
      const layout=document.createElement('div');layout.className='cell-layout';
      const codePane=document.createElement('div');codePane.className='code-pane';codePane.append(editor);
      const resultPane=document.createElement('div');resultPane.className='result-pane';
      const outputTitle=document.createElement('h3');outputTitle.textContent='Output';outputTitle.className='output-title';
      const error=document.createElement('div');error.className='error-panel';error.hidden=true;error.setAttribute('role','alert');
      const images=document.createElement('div');images.className='plots';plots.set(i,images);
      resultPane.append(details,outputTitle,output,images,error);layout.append(codePane,resultPane);section.append(layout);
      for(const o of cell.outputs||[]){if(o.output_type==='display_data'&&o.data?.['image/png'])addPlot(i,o.data['image/png']);}
      errors.set(i,error);editors.set(i,{editor,input});outputs.set(i,output);
    }
    expandContent(section);$('notebook').append(section);
  });fitAllEditors();controls();scheduleSectionSync();
}
function boot(){
  if(worker)worker.terminate();if(workerURL)URL.revokeObjectURL(workerURL);
  if(active!==null){$('cell-'+active)?.classList.remove('running');const cell=notebook.cells[active];cell.outputs.push({output_type:'stream',name:'stderr',text:['Stopped. Python state was cleared.\n']});outputs.get(active).textContent+='\nStopped. Python state was cleared.\n';}
  runtimeFiles={lesson:[],solutions:[]};renderFiles();ready=false;busy=false;active=null;execution=0;controls();$('status').textContent='Starting local Python…';$('fatal').textContent='';
  workerURL=URL.createObjectURL(new Blob([WORKER],{type:'text/javascript'}));worker=new Worker(workerURL);
  worker.onmessage=({data:m})=>{
    if(m.type==='ready'){ready=true;$('status').textContent='Python ready · runs on this computer';controls();return;}
    if(m.type==='fatal'){$('fatal').textContent=m.text;$('status').textContent='Python could not start';ready=false;busy=false;controls();return;}
    if(m.type==='loading'){$('status').textContent=m.text;return;}
    if(m.type==='files'){runtimeFiles[m.realm]=m.files;renderFiles();return;}
    if(m.type==='download'){downloadBlob(new Blob([m.bytes]),m.name);return;}
    if(m.type==='fileError'){$('fatal').textContent=m.text;return;}
    const cell=notebook.cells[m.id];if(!cell)return;
    if(m.type==='plot'){addPlot(m.id,m.png);cell.outputs.push({output_type:'display_data',data:{'image/png':m.png},metadata:{}});}
    if(m.type==='stream'){outputs.get(m.id).textContent+=m.text;cell.outputs.push({output_type:'stream',name:m.name,text:[m.text]});}
    if(m.type==='error'){const error=describePythonError(m.text,m.id,runSources);showError(m.id,error);cell.outputs.push({output_type:'error',ename:error.type,evalue:error.message,traceback:m.text.split('\n')});}
    if(m.type==='done'||m.type==='error'){outputs.get(m.id).classList.add('has-run');busy=false;active=null;$('cell-'+m.id).classList.remove('running');$('status').textContent=m.type==='done'?'Finished · Python ready':'Cell has an error · edit and run again';controls();}
  };
  worker.onerror=e=>{$('fatal').textContent=e.message;ready=false;busy=false;controls();};
  worker.postMessage({type:'init',files:FILES,config:CONFIG});
}
function runCell(i){
  if(!ready||busy)return;busy=true;active=i;controls();$('cell-'+i).classList.add('running');$('status').textContent='Running cell '+(i+1)+'…';
  const cell=notebook.cells[i],{editor,input}=editors.get(i);cell.source=[editor.value];cell.outputs=[];cell.execution_count=++execution;outputs.get(i).textContent='';outputs.get(i).classList.remove('has-run');plots.get(i).replaceChildren();errors.get(i).hidden=true;errors.get(i).replaceChildren();runSources.set(i,editor.value);markDirty();
  worker.postMessage({type:'run',id:i,realm:cell.metadata?.offline_realm||'lesson',code:editor.value,inputs:input.value===''?[]:input.value.split('\n')});
}
function addPlot(id,png){
  const image=document.createElement('img');image.src='data:image/png;base64,'+png;image.alt='Python plot from cell '+(id+1);plots.get(id).append(image);
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function renderFiles(){
  $('file-list').replaceChildren();$('runtime-files').hidden=!Object.values(runtimeFiles).some(a=>a.length);
  for(const [realm,files] of Object.entries(runtimeFiles)){
    if(!files.length)continue;const heading=document.createElement('h3');heading.textContent=realm==='lesson'?'Lesson & practice':'Worked solutions';$('file-list').append(heading);
    for(const f of files){const button=document.createElement('button');button.textContent=f.name+' · '+Math.ceil(f.size/1024)+' KB';button.disabled=busy||!ready;button.dataset.runtimeControl='';button.onclick=()=>{if(ready&&!busy)worker.postMessage({type:'getFile',realm,name:f.name});};$('file-list').append(button);}
  }
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
  const details=document.createElement('details'),summary=document.createElement('summary'),raw=document.createElement('pre');summary.textContent='Technical details — full traceback';raw.textContent=error.text;details.append(summary,raw);panel.append(note,details);expandContent(panel);
}
$('restart').onclick=boot;
$('save').onclick=()=>{
  const blob=new Blob([JSON.stringify(notebook,null,2)],{type:'application/x-ipynb+json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=CONFIG.saveName;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);dirty=false;$('save-state').textContent='Download requested. Keep the .ipynb file with this HTML file.';
};
$('restore').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const nb=JSON.parse(await file.text());
    if(nb.nbformat!==4||![ORIGINAL.cells.length,CONFIG.lessonCells].includes(nb.cells?.length)||(nb.metadata?.cp1_offline_week!==CONFIG.week&&nb.cells?.[0]?.source?.toString()!==ORIGINAL.cells[0].source.toString())||nb.cells.some((c,i)=>c.cell_type!==ORIGINAL.cells[i].cell_type||!(typeof c.source==='string'||Array.isArray(c.source)&&c.source.every(s=>typeof s==='string'))))throw Error('Choose a saved Week '+CONFIG.week+' notebook from this offline edition.');
    if(dirty&&!confirm('Replace your unsaved edits with the selected notebook?'))return;
    // Keep the trusted lesson text; restore student code only, never execute on import.
    notebook=structuredClone(ORIGINAL);nb.cells.forEach((c,i)=>{if(c.cell_type==='code'){notebook.cells[i].source=typeof c.source==='string'?[c.source]:c.source;notebook.cells[i].outputs=(Array.isArray(c.outputs)?c.outputs:[]).filter(o=>o.output_type==='stream'&&Array.isArray(o.text)&&o.text.every(t=>typeof t==='string')||o.output_type==='display_data'&&typeof o.data?.['image/png']==='string'&&o.data['image/png'].length<14000000&&/^[A-Za-z0-9+/=\s]+$/.test(o.data['image/png'])).map(o=>o.output_type==='stream'?{output_type:'stream',name:o.name==='stderr'?'stderr':'stdout',text:o.text}:{output_type:'display_data',data:{'image/png':o.data['image/png']},metadata:{}});if(Array.isArray(c.metadata?.offline_inputs)&&c.metadata.offline_inputs.every(v=>typeof v==='string'))notebook.cells[i].metadata.offline_inputs=c.metadata.offline_inputs;notebook.cells[i].execution_count=null;}});
    active=null;render();boot();dirty=false;$('save-state').textContent='Saved code opened. Rerun cells in order to rebuild Python variables.';
  }catch(err){$('fatal').textContent=String(err);}finally{e.target.value='';}
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
// Follow the document, including manual scrolling, anchors and layout changes.
let sectionFrame=0;
function scheduleSectionSync(){
  if(sectionFrame)return;
  sectionFrame=requestAnimationFrame(()=>{sectionFrame=0;syncCurrentSection();});
}
function syncCurrentSection(){
  const links=[...$('sections').querySelectorAll('a')];
  if(!links.length)return;
  let current=links[0];
  const readingLine=Math.min(80,window.innerHeight*0.15);
  for(const link of links){
    const section=$(link.hash.slice(1));
    if(section && section.getBoundingClientRect().top<=readingLine)current=link;
  }
  if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-3)current=links.at(-1);
  if(current.getAttribute('aria-current')==='location')return;
  links.forEach(link=>link.removeAttribute('aria-current'));
  current.setAttribute('aria-current','location');
  // Scroll only the sidebar, never the lesson or mobile document.
  if(window.matchMedia('(min-width: 851px)').matches){
    const menu=document.querySelector('.contents'),box=menu.getBoundingClientRect(),item=current.getBoundingClientRect();
    if(item.top<box.top+12)menu.scrollTop-=box.top+12-item.top;
    else if(item.bottom>box.bottom-12)menu.scrollTop+=item.bottom-box.bottom+12;
  }
}
window.addEventListener('scroll',scheduleSectionSync,{passive:true});
window.addEventListener('resize',scheduleSectionSync);
window.addEventListener('hashchange',scheduleSectionSync);
new ResizeObserver(scheduleSectionSync).observe($('notebook'));
render();boot();
