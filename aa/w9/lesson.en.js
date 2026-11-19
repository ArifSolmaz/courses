(function () {
  'use strict';
  const model = window.FreshWeek9;
  if (!model || typeof model.traceDFS !== 'function' || typeof model.validateTopologicalOrder !== 'function') return;
  const $ = id => document.getElementById(id);
  const vertices = [4, 7, 11, 18, 20, 24, 26, 32];
  const edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 32], [20, 32]];
  const names = {4:'roof',7:'greenhouse',11:'well',18:'pump',20:'garden',24:'warehouse',26:'room',32:'gate'};
  const independentVertices = [4, 7, 18, 20, 24, 26];
  const independentEdges = [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]];
  const cases = {
    main: {vertices,edges,first:18,text:'Main directed dependencies. Start with 18, then the remaining unentered roots in increasing order; neighbours are in increasing order. Each arrow goes from the job that must finish first to the next one.'},
    reverse: {vertices,edges,first:18,order:'descending',text:'The same directed network; outgoing neighbours in decreasing order. The first root is still 18. Can the valid order change?'},
    first7: {vertices,edges,first:7,text:'The same network; the first DFS root is 7. Then examine the remaining unentered roots in increasing order. Finishing the call for 7 does not mean the whole network is finished.'},
    cycle: {vertices,edges:edges.concat([[32,7]]),first:18,text:'We added the 32 → 7 dependency to the main network. First root 18, neighbours increasing. Find the arrow to an active vertex and the closed-cycle witness.'},
    remote: {vertices,edges:edges.concat([[26,26]]),first:18,text:'We added only 26 → 26 to the main network. The search below 18 may finish without a cycle; do not conclude before checking every job.'},
    single: {vertices:[18],edges:[],first:18,text:'One job, 18; no arrows. One entry and one return; the valid job order has one element.'},
    noedges: {vertices,edges:[],first:18,text:'Eight jobs, no arrows. Start with 18, then the remaining roots in increasing order. Every order containing each job once is valid.'}
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function list(values) {return '['+values.join(', ')+']';}
  function stepText(step) {
    if(step.type==='init')return trace.vertices.length+' jobs: initialise their states as “unentered”. First root candidate '+trace.rootOrder[0]+'.';
    if(step.type==='enter')return (step.root?'New root ':'Child call ')+step.vertex+': enter, mark active and put on the stack.'+(step.parent===null?'':' Caller '+step.parent+' waits to continue with its remaining neighbour.');
    if(step.type==='finish')return step.vertex+' call: all outgoing arrows have been examined. Mark finished, append to the finish list and pop from the stack; '+(step.state.stack.length?'return to the caller.':'no active calls remain. Remaining root candidates may still need examination.');
    if(step.type==='complete')return 'Every job has been examined; no cycle was found. Reverse the finish list to produce a candidate job order.';
    if(step.type==='cycle')return 'Back to an active ancestor: '+step.cycle.join(' → ')+'. The whole search stopped at the first cycle; open calls did not return. No valid job order exists.';
    const prefix=step.from+' list, arrow '+(step.neighborIndex+1)+': '+step.from+' → '+step.to+'. ';
    return prefix+(step.classification==='unseen'?'The target is unentered. Enter its call on the next step; the current call’s next position has been saved.':step.classification==='active'?'The target is active, still on the call stack. On the next step, show the cycle closed by this back arrow.':'The target is finished; continue without calling it again. This arrow alone is not evidence of a cycle.');
  }
  function render() {
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,entries:0,edgeScans:0,returns:0};
    $('dfs-task').textContent=task.text;
    $('dfs-progress').textContent='V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Revealed step: '+seen+'/'+trace.steps.length;
    const stack=$('dfs-stack');stack.replaceChildren();stack.append(el('h4','Active calls · bottom → top'));
    const frames=el('ol');frames.className='stack-frames';
    state.stack.forEach((frame,index)=>{
      const item=el('li');item.dataset.id=String(frame.vertex);item.dataset.next=String(frame.nextIndex);
      if(index===state.stack.length-1)item.classList.add('is-top');
      item.append(el('b',String(frame.vertex)+' · '+names[frame.vertex]));
      item.append(el('span',(index===state.stack.length-1?'Top':'Waiting caller')+' · Frame '+(index+1)));
      const neighbors=trace.adjacency[frame.vertex];
      item.append(el('span','Arrows read: '+frame.nextIndex+'/'+neighbors.length+' · '+(frame.nextIndex<neighbors.length?'next neighbour '+neighbors[frame.nextIndex]:'end of list')));
      frames.append(item);
    });
    if(!state.stack.length){const p=el('p',done?'The stack is empty; every call has returned.':'No call is active right now. That alone does not mean the remaining roots are finished too.');p.className='board-empty';stack.append(p);}
    stack.append(frames);
    const neighbors=$('dfs-neighbors');neighbors.replaceChildren();
    const top=state.stack.at(-1);
    if(!top)neighbors.append(el('p',done?'No waiting call.':'Once a call is entered, its outgoing list will appear here.'));
    else{
      const items=trace.adjacency[top.vertex];neighbors.append(el('h4',top.vertex+' outgoing neighbours '+list(items)+' · Read: '+top.nextIndex+'/'+items.length));
      const line=el('div');line.className='neighbor-row';
      if(!items.length){const p=el('span','The list is empty; the call can return on the next step.');p.className='board-empty';line.append(p);}
      items.forEach((id,index)=>{
        const chip=el('div');chip.className='neighbor-chip';chip.dataset.id=String(id);chip.dataset.index=String(index);chip.append(el('b',String(id)));let label='';
        if(index<top.nextIndex){chip.classList.add('is-scanned');label='Read';}
        else if(index===top.nextIndex){chip.classList.add('is-next');label='Next';}
        if(state.activeEdge&&state.activeEdge.from===top.vertex&&last&&(last.type==='inspect'||last.type==='cycle')&&index===top.nextIndex-1){chip.classList.add('is-last');label='This step';}
        if(label)chip.append(el('span',label));line.append(chip);
      });neighbors.append(line);
    }
    const table=$('dfs-table');table.replaceChildren();
    state.rows.forEach(row=>{
      const card=el('article');card.className='state-card';card.dataset.id=String(row.id);card.dataset.status=row.status;card.dataset.parent=row.parent===null?'':String(row.parent);
      if(row.status==='active')card.classList.add('is-active');
      if(top&&top.vertex===row.id)card.classList.add('is-top');
      if(state.activeEdge&&state.activeEdge.to===row.id)card.classList.add('is-last');
      card.append(el('h4',String(row.id)));const place=el('span',names[row.id]);place.className='place';card.append(place);
      const status=el('p',row.status==='unseen'?'Unentered':row.status==='active'?'Active · on stack':'Finished · returned');status.className='node-status';card.append(status);
      const parent=el('p','Caller: '+(row.parent===null?row.status==='unseen'?'—':'none (root)':row.parent));parent.className='node-parent';card.append(parent);table.append(card);
    });
    $('dfs-finished').textContent='Finish list · not yet reversed: '+list(state.finished);
    $('dfs-count').textContent='Rows initialised: '+counts.initializations+' · Call entries: '+counts.entries+' · Directed-entry scans: '+counts.edgeScans+' · Returns: '+counts.returns;
    $('dfs-depth').textContent='Current stack length: '+state.stack.length+' · Maximum stack: '+(last?last.stats.maxStack:0)+' frames';
    $('dfs-status').textContent=last?stepText(last):'No steps revealed yet. State the first call and the stack’s first state.';
    $('dfs-next').disabled=done;$('dfs-end').disabled=done;
    const history=$('dfs-history');history.replaceChildren();
    trace.steps.slice(0,seen).forEach(step=>{const item=el('li',stepText(step));item.dataset.type=step.type;history.append(item);});
    document.querySelector('#dfs-history-details summary').textContent='All revealed steps ('+seen+')';
    const checks=$('dfs-edge-checks');checks.replaceChildren();
    $('dfs-edge-details').hidden=true;
    if(!done)$('dfs-result').textContent='The search has not finished. The current finish list is not a complete job order; we do not claim “no cycle” before checking every job.';
    else if(!trace.result.acyclic)$('dfs-result').textContent='Cycle witness: '+trace.result.cycle.join(' → ')+'. No order satisfies all dependencies. The search stopped early; do not reverse partial finishes to produce a plan.';
    else{
      const order=trace.result.topologicalOrder,positions=new Map(order.map((id,index)=>[id,index+1]));
      $('dfs-result').textContent='One topological job order: '+list(order)+'. Every job once; every arrow leads to a later job. Other valid orders may also exist.';
      trace.edges.forEach(([a,b])=>{const item=el('li',a+' → '+b+': '+positions.get(a)+' (position) < '+positions.get(b)+' (position).');item.dataset.from=String(a);item.dataset.to=String(b);checks.append(item);});
      if(!trace.edges.length)checks.append(el('li','No arrows; including every job once is enough.'));
      $('dfs-edge-details').hidden=false;
    }
  }
  function reset(){task=cases[$('dfs-case').value];trace=model.traceDFS(task.vertices,task.edges,{firstRoot:task.first,neighborOrder:task.order||'ascending'});seen=0;$('dfs-edge-details').open=false;render();}
  function number(id,min,max){const input=$(id),raw=input.value.trim(),value=Number(raw);const valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(value)&&value>=min&&value<=max;input.setAttribute('aria-invalid',String(!valid));return{id,value,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  function parseOrder(raw){const value=raw.trim();if(!value||!value.split(/[,\s]+/).every(part=>/^\d+$/.test(part)))return null;const order=value.split(/[,\s]+/).map(Number);return order.every(Number.isSafeInteger)?order:null;}
  $('dfs-case').addEventListener('change',reset);
  $('dfs-next').addEventListener('click',()=>{if(seen<trace.steps.length){seen++;render();}});
  $('dfs-end').addEventListener('click',()=>{seen=trace.steps.length;render();});
  $('dfs-reset').addEventListener('click',reset);
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const next=number('guided-next',0,100),depth=number('guided-depth',0,32),invalid=[next,depth].find(item=>!item.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers in the stated ranges. I have marked the missing or invalid box.',true);$(invalid.id).focus();return;}
    const entering=model.traceDFS(vertices,edges,{firstRoot:18}).steps.find(step=>step.type==='enter'&&step.vertex===24);
    if(next.value===entering.vertex&&depth.value===entering.state.stack.length)feedback('guided-feedback','Both numbers are correct. Also compare the return position, the state of 11 and the distinction between search and actual work with the solution; your written reasoning was not graded automatically.',false);
    else feedback('guided-feedback',next.value!==entering.vertex?'18’s list is [7, 24]; the call for 7 has returned. Choose the remaining second neighbour; we are not searching again from the smallest ID.':'The call for 18 stays open; the new child enters above it. Count the active stack, not the total finished calls.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDFS(independentVertices,independentEdges,{firstRoot:18});
    const checks=[{...number('exit-scans',0,64),expected:expected.counts.edgeScans,label:'directed-entry scans'},{...number('exit-entries',0,32),expected:expected.counts.entries,label:'total entries'},{...number('exit-depth',0,32),expected:expected.stats.maxStack,label:'maximum stack'}];
    const invalid=checks.find(item=>!item.valid);
    if(invalid){feedback('exit-feedback','Fill all three numbers with integers in the stated ranges.',true);$(invalid.id).focus();return;}
    const order=parseOrder($('exit-order').value),validation=model.validateTopologicalOrder(independentVertices,independentEdges,order);
    $('exit-order').setAttribute('aria-invalid',String(validation.reason==='not-permutation'));
    if(validation.reason==='not-permutation'){feedback('exit-feedback','The order must contain all 6 job IDs exactly once. Separate only IDs with commas or spaces; do not omit, repeat or use unknown IDs.',true);$('exit-order').focus();return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Look again: '+wrong.map(item=>item.label).join(', ')+'. Directed arrows, total calls and simultaneously active calls are different counts.',true);return;}
    if(!validation.valid){const [a,b]=validation.violatingEdge;feedback('exit-feedback','The three numbers are correct; your proposed order violates '+a+' → '+b+': '+a+', '+b+' must be in this order, with the first before the second. Check your order against every arrow.',true);return;}
    feedback('exit-feedback','The three numbers are correct and your proposed job order satisfies every dependency. This check did not assess the correctness of your written trace, formula or reasoning; evaluate those separately with the four criteria.'+(solutionSeen?' The model answer was opened; record this as an attempt after viewing the solution.':' Your trace and reasoning produced before viewing the solution are independent evidence.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer has been opened in this session. Evaluate further corrections separately from the first independent attempt.';}});
  const printed=[];
  window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
