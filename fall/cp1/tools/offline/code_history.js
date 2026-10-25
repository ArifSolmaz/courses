// One independent, session-only undo history for each code cell.
function createCodeHistory(initial, original) {
  let current=initial;
  const previous=[];
  return {
    record(value){
      if(value===current)return;
      previous.push(current);
      if(previous.length>100)previous.shift();
      current=value;
    },
    undo(){if(previous.length)current=previous.pop();return current;},
    restore(){this.record(original);return current;},
    get canUndo(){return previous.length>0;},
    get isOriginal(){return current===original;}
  };
}

function addCodeHistory(bar,editor,i){
  const history=createCodeHistory(editor.value,ORIGINAL.cells[i].source.join(''));
  const actions=document.createElement('div');actions.className='code-actions';
  const undo=document.createElement('button');undo.textContent='Undo last change';
  undo.setAttribute('aria-label','Undo last change in cell '+(i+1));
  const restore=document.createElement('button');restore.textContent='Restore original code';
  restore.setAttribute('aria-label','Restore original code in cell '+(i+1));
  const note=document.createElement('p');note.className='code-edit-note';note.hidden=true;
  note.setAttribute('aria-live','polite');
  let applying=false;
  function sync(){undo.disabled=!history.canUndo;restore.disabled=history.isOriginal;}
  function apply(value,message){
    applying=true;editor.value=value;editor.dispatchEvent(new Event('input'));applying=false;
    if(editor.getClientRects().length)editor.focus();
    note.textContent=message+' Press Run to update the output.';note.hidden=false;sync();
  }
  editor.addEventListener('input',()=>{
    if(!applying){
      history.record(editor.value);
      note.textContent='Code changed. Press Run to update the output.';note.hidden=false;
    }
    sync();
  });
  undo.onclick=()=>{if(history.canUndo)apply(history.undo(),'Last change undone.');};
  restore.onclick=()=>{if(!history.isOriginal)apply(history.restore(),'Original code restored.');};
  editor.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==='z'){
      e.preventDefault();undo.onclick();
    }
  });
  actions.append(undo,restore,bar.querySelector('.run'));bar.append(actions);
  bar.after(note);sync();
}
