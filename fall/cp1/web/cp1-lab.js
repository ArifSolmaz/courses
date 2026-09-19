/* Playback of real Python traces generated from lessons/notebook_labs.py.
   The browser never executes submitted code and sends no data anywhere. */
(() => {
  'use strict';
  const host = document.querySelector('[data-cp1-lab]');
  const data = window.CP1_NOTEBOOK_LABS;
  if (!host || !data) return;
  const node = (tag, cls, text) => {
    const item = document.createElement(tag);
    if (cls) item.className = cls;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const button = text => { const b = node('button', '', text); b.type = 'button'; return b; };
  const select = (id, label, parent) => {
    const wrap = node('div', 'lab-field');
    const caption = node('label', '', label); caption.htmlFor = id;
    const input = node('select'); input.id = id;
    wrap.append(caption, input); parent.append(wrap); return input;
  };
  const option = (text, value) => { const o = node('option', '', text); o.value = String(value); return o; };
  host.replaceChildren();
  const heading = node('header','lab-heading');
  const title = node('h3','',`Week ${data.week} · ${data.title}`);
  const expand = button('Expand'); expand.setAttribute('aria-label','Expand animation workspace');
  heading.append(title,expand); host.append(heading);
  const choices = node('div', 'lab-choices');
  const topic = select('lab-topic', 'Notebook topic', choices);
  data.labs.forEach((lab,i) => topic.append(option(`${i+1}. ${lab.title}`, i)));
  const inputCase = select('lab-case', 'Input / variation', choices);
  host.append(choices);
  const focus = node('p', 'lab-focus');
  const source = node('p', 'lab-source');

  const controls = node('div', 'lab-controls');
  const back = button('← Back'), play = button('Play'), next = button('Step →'), reset = button('Restart');
  const speed = select('lab-speed', 'Speed', controls);
  [['Slow',1100],['Normal',650],['Fast',220]].forEach(([label,value]) => speed.append(option(label,value)));
  speed.value = '650';
  controls.prepend(back, play, next, reset);
  const copy = button('Copy Python'); controls.append(copy);
  host.append(controls);
  const timelineLabel = node('label', 'lab-progress-label', 'Execution step'); timelineLabel.htmlFor = 'lab-timeline';
  const timeline = node('input','lab-timeline'); timeline.type = 'range'; timeline.id='lab-timeline'; timeline.min=0; timeline.step=1;
  const counter = node('output','lab-count'); counter.htmlFor='lab-timeline';
  const progress = node('div','lab-progress'); progress.append(timelineLabel, timeline, counter); host.append(progress);
  const event = node('p', 'lab-event'); event.setAttribute('role','status'); host.append(event);
  const workspace = node('div', 'lab-workspace');
  const codePane = node('section', 'lab-code-pane'); codePane.append(node('h4','','Python · highlighted line runs next'));
  const codeList = node('ol', 'lab-code'); codePane.append(codeList);
  const statePane = node('section', 'lab-state-pane'); statePane.append(node('h4','','Variables & call stack'));
  const scopes = node('div','lab-scopes'); statePane.append(scopes);
  const inspector=node('div','lab-inspector'); inspector.append(statePane);
  workspace.append(codePane,inspector); host.append(workspace);
  const memoryPane = node('section','lab-memory-pane'); memoryPane.append(node('h4','','Collections in memory'));
  const memory = node('div','lab-memory'); memoryPane.append(memory); inspector.append(memoryPane);
  const outputs = node('div','lab-outputs');
  const outputPane = node('section','lab-output-pane'); outputPane.append(node('h4','','Printed output'));
  const output = node('pre','lab-output'); outputPane.append(output); outputs.append(outputPane);
  const filesPane = node('section','lab-files-pane'); filesPane.append(node('h4','','Saved file contents'));
  const files = node('div','lab-files'); filesPane.append(files); outputs.append(filesPane); host.append(outputs);
  const legend = node('details','lab-help'); legend.append(node('summary','','Guide'));
  legend.append(focus,source);
  legend.append(node('p','','A highlighted line is about to run: its effects appear on the next step. A call opens a local frame; a return passes a value to its caller. Highlighted variable cards changed since the previous step. Object labels identify shared containers, not physical memory addresses. Indexes start at zero.'));
  legend.append(node('p','','These are recorded executions of the displayed Python for the supplied input cases, adapted from the named notebook sections. Copy an example into Colab to edit any value or statement freely. File contents appear when Python writes them to disk; buffered writes may appear only when the file closes. No code or files are uploaded from this page.'));
  heading.insertBefore(legend,expand);
  const transport=node('footer','lab-transport'); transport.append(controls,progress,event);host.append(transport);
  const dialog=node('dialog','lab-dialog'); dialog.setAttribute('aria-label','Animation workspace');document.body.append(dialog);
  const placeholder=document.createComment('animation workspace');
  expand.addEventListener('click',()=>{
    if(dialog.open){dialog.close();return;}
    legend.open=false;host.before(placeholder);dialog.append(host);dialog.showModal();expand.textContent='Close';expand.setAttribute('aria-label','Close expanded animation workspace');
  });
  dialog.addEventListener('close',()=>{stop();placeholder.replaceWith(host);expand.textContent='Expand';expand.setAttribute('aria-label','Expand animation workspace');expand.focus({preventScroll:true});});
  let lab, selected, position=0, timer=null;
  function stop() { clearTimeout(timer); timer=null; play.textContent='Play'; play.setAttribute('aria-pressed','false'); }
  function keepInView() {
    if(dialog.open)return;
    const bounds=host.getBoundingClientRect();
    if(bounds.top<72 || bounds.bottom>window.innerHeight-8)host.scrollIntoView({block:'start',behavior:'instant'});
  }
  function revealChange(container, selector) {
    const changed=[...container.querySelectorAll(selector)].at(-1);
    if(!changed)return;
    const target=changed.getBoundingClientRect(),area=container.getBoundingClientRect();
    if(target.top<area.top || target.bottom>area.bottom)container.scrollTop+=target.top-area.top-Math.max(0,(area.height-target.height)/2);
  }
  function compact(value) { return value.ref || value.text; }
  function scopeBox(name, values, previous, top) {
    const box=node('section','lab-scope'+(top?' current':'')); box.append(node('h5','',name));
    const list=node('div','lab-bindings');
    for (const [key,value] of Object.entries(values)) {
      const changed=JSON.stringify(value)!==JSON.stringify(previous?.[key]);
      const card=node('div','lab-binding'+(changed?' changed':''));
      card.append(node('strong','',key),node('span','lab-type',value.type),node('code','',compact(value)));
      if (value.ref) card.append(node('span','lab-ref-hint','collection ↓'));
      list.append(card);
    }
    if (!Object.keys(values).length) list.append(node('p','lab-empty','No variables assigned yet.'));
    box.append(list); return box;
  }
  function gather(value, objects) {
    if (!value.ref || objects.has(value.ref)) return;
    objects.set(value.ref,value);
    (value.items||[]).forEach(item=>gather(value.type==='dict'?item.value:item,objects));
  }
  function drawMemory(frame, previous) {
    const objects=new Map(), oldObjects=new Map(), names=new Map();
    const collect=(scope,map,label)=>Object.entries(scope).forEach(([name,value])=>{
      gather(value,map);
      if(map===objects && value.ref) {if(!names.has(value.ref))names.set(value.ref,[]);names.get(value.ref).push(label+name);}
    });
    collect(frame.globals,objects,''); frame.stack.forEach(s=>collect(s.values,objects,s.name+'.'));
    if(previous){collect(previous.globals,oldObjects,'');previous.stack.forEach(s=>collect(s.values,oldObjects,''));}
    memory.replaceChildren(); memoryPane.hidden=!objects.size; inspector.classList.toggle('has-memory',!!objects.size);
    for(const [ref,value] of objects) {
      const box=node('article','lab-object');
      box.append(node('h5','',`${ref} · ${value.type}${names.has(ref)?' ← '+names.get(ref).join(', '):''}`));
      const values=node('div','lab-cells');
      (value.items||[]).forEach((item,i)=>{
        const v=value.type==='dict'?item.value:item, key=value.type==='dict'?item.key:i;
        const cell=node('div','lab-cell');
        if(JSON.stringify(item)!==JSON.stringify(oldObjects.get(ref)?.items?.[i]))cell.classList.add('changed');
        cell.append(node('small','',String(key)),node('code','',compact(v))); values.append(cell);
      });
      if(!(value.items||[]).length)values.append(node('span','lab-empty','Empty container'));
      box.append(values); memory.append(box);
    }
  }
  function paint() {
    const f=selected.frames[position], previous=selected.frames[position-1];
    timeline.value=position; counter.textContent=`${position+1} / ${selected.frames.length}`;
    back.disabled=position===0;next.disabled=position===selected.frames.length-1;
    codeList.querySelectorAll('li').forEach((line,i)=>{line.classList.toggle('current',i+1===f.line);line.classList.toggle('error',i+1===f.line&&f.event==='exception');if(i+1===f.line)line.setAttribute('aria-current','step');else line.removeAttribute('aria-current');});
    if(f.line){const active=codeList.children[f.line-1]; if(active && (active.offsetTop<codeList.scrollTop || active.offsetTop+active.offsetHeight>codeList.scrollTop+codeList.clientHeight)) codeList.scrollTop=Math.max(0,active.offsetTop-codeList.clientHeight/2);}
    const messages={line:`Next: line ${f.line}`,call:`Call: ${f.stack.at(-1)?.name||'notebook'}`,return:f.detail,exception:`Raised: ${f.detail} · follow the next step to see whether it is handled.`,end:f.detail};
    event.textContent=messages[f.event];event.classList.toggle('lab-error',f.event==='exception'||f.event==='end'&&f.detail!=='Completed');
    scopes.replaceChildren(scopeBox('Notebook / global',f.globals,previous?.globals,!f.stack.length));
    f.stack.forEach((s,i)=>scopes.append(scopeBox(`${i+1}. ${s.name}(…)`,s.values,previous?.stack.find(p=>p.name===s.name)?.values,i===f.stack.length-1)));
    if(f.stack.length && f.stack.length!==previous?.stack.length) scopes.scrollTop=scopes.scrollHeight;
    revealChange(scopes,'.lab-binding.changed');
    drawMemory(f,previous);
    revealChange(memory,'.lab-cell.changed');
    output.textContent=f.output||'(No output yet)';
    filesPane.hidden=!Object.keys(f.files).length;files.replaceChildren();
    Object.entries(f.files).forEach(([name,text])=>{const file=node('article');file.append(node('h5','',name),node('pre','',text||'(empty file)'));files.append(file);});
    output.scrollTop=output.scrollHeight;
    host.dataset.ready='true';
  }
  function loadCase() {
    stop();selected=lab.cases[Number(inputCase.value)];position=0;timeline.max=selected.frames.length-1;
    codeList.replaceChildren(...selected.code.trimEnd().split('\n').map((text,i)=>{const line=node('li');line.append(node('span','lab-line-number',String(i+1)),node('code','',text||' '));return line;}));
    codeList.scrollTop=0;copy.textContent='Copy Python';paint();
  }
  function loadTopic() {
    lab=data.labs[Number(topic.value)];focus.textContent=lab.focus;
    source.textContent=lab.sections.join(' · ')+` · Related practice: ${lab.exercise}`;
    inputCase.replaceChildren(...lab.cases.map((c,i)=>option(c.label,i)));loadCase();
  }
  function advance() {position=Math.min(position+1,selected.frames.length-1);paint();if(position===selected.frames.length-1)stop();else timer=setTimeout(advance,Number(speed.value));}
  topic.addEventListener('change',loadTopic);inputCase.addEventListener('change',loadCase);
  timeline.addEventListener('input',()=>{keepInView();stop();position=Number(timeline.value);paint();});
  back.addEventListener('click',()=>{keepInView();stop();position=Math.max(0,position-1);paint();});
  next.addEventListener('click',()=>{keepInView();stop();position=Math.min(selected.frames.length-1,position+1);paint();});
  reset.addEventListener('click',()=>{keepInView();stop();position=0;paint();});
  play.addEventListener('click',()=>{keepInView();if(timer){stop();return;}if(position===selected.frames.length-1)position=0;play.textContent='Pause';play.setAttribute('aria-pressed','true');paint();timer=setTimeout(advance,Number(speed.value));});
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(selected.code);copy.textContent='Copied';}catch{copy.textContent='Select code to copy';}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  loadTopic();
})();
