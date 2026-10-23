(function () {
  'use strict';
  const model=window.FreshWeek11;
  if(!model||typeof model.traceDijkstra!=='function'||typeof model.shortestPath!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31];
  const edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const independentVertices=[4,7,18,20,24,26],independentEdges=[[18,7,6],[18,24,2],[24,7,1],[7,26,2],[24,26,7],[26,4,1]];
  const cases={
    main:{vertices,edges,source:24,text:'Source 24; all links exist. Inspect neighbors in increasing ID order; in the queue, smaller distances come first, then smaller IDs. For 31, will the first value 8 change?'},
    ties:{vertices,edges,source:24,order:'descending',text:'Source 24, the same network. Larger IDs come first only for equal queue distances. Smaller distances still have priority. How do the final costs and predecessors change?'},
    source11:{vertices,edges,source:11,text:'The same network; the source is now 11. The dark device 24 in the drawing is not this example’s source. The direct path to 31 costs 5; compare it with the path costing 9 in the earlier network of minimum total cost.'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===31&&b===26)),source:24,text:'Source 24; link 31–26 has been removed. Device 26 is listed but has no edges. When can we call it unreachable?'},
    zero:{vertices,edges:edges.map(([a,b,w])=>[a,b,a===7&&b===4?0:w]),source:24,text:'Source 24; only the cost of 4–7 has become 0. Zero cost is a real edge; d[4]=d[7] is possible. Keep the predecessor when a candidate is equal.'},
    single:{vertices:[24],edges:[],source:24,text:'A single device, source 24; no edges. The empty path to itself costs 0. Once the source is extracted from the queue, all reachable work is complete.'},
    noedges:{vertices,edges:[],source:24,text:'Eight devices, no edges, source 24. The source has 0; the others are reported as unreachable only after the queue empties.'}
  };
  let trace,task,seen=0,solutionSeen=false;
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function value(distance){return distance===null?'∞':String(distance);}
  function stepText(step){
    if(step.type==='init')return trace.vertices.length+' distance rows initialized. Source '+trace.source+' has 0; the others have ∞. The source was inserted into the queue.';
    if(step.type==='settle')return step.vertex+' was extracted with minimum distance '+step.distance+'. This distance is settled; now inspect its neighbors.';
    if(step.type==='inspect'){
      const base=step.from+' → '+step.to+' · edge '+step.weight+'; candidate '+step.candidate+', current '+value(step.previousDistance)+'. ';
      if(step.outcome==='settled')return base+'The neighbor is already settled; its record stays unchanged. This inspection counts as a scan.';
      if(step.outcome==='improve')return base+'A cheaper candidate exists. The record has not changed yet; the next step will update d, predecessor and queue.';
      if(step.outcome==='equal')return base+'Equal; distance, predecessor and queue stay unchanged.';
      return base+'More expensive; the record stays unchanged.';
    }
    if(step.type==='relax')return step.from+' → '+step.to+' relaxed: '+value(step.previousDistance)+' → '+step.distance+'; predecessor '+step.from+'. '+(step.queueAction==='insert'?'A single queue entry was added for the newly discovered device.':'The existing queue key decreased; no second entry was added.');
    if(step.type==='finish')return step.vertex+': all adjacency entries have been scanned. Predict the next minimum in the queue.';
    return 'The queue is empty; all reachable devices are settled. '+(step.unreachable.length?'Unreachable: '+step.unreachable.join(', ')+'.':'Every device has a path from the source.');
  }
  function path(){
    const target=Number($('dijkstra-target').value),done=seen===trace.steps.length;
    $('dijkstra-path').dataset.target=String(target);$('dijkstra-path').dataset.path='';
    if(!done){$('dijkstra-path').textContent='The final path to this target is not revealed yet. Complete the entire trace; changing the target does not advance a step.';return;}
    const ids=model.shortestPath(trace,target);$('dijkstra-path').dataset.path=ids?ids.join(','):'';
    $('dijkstra-path').textContent=ids?(ids.length===1?'Source '+trace.source+' has an empty path to itself; cost 0.':'Path: '+ids.join(' → ')+' · total '+trace.result.distances[target]+' cost units.'):'Source '+trace.source+' has no path to device '+target+'; unreachable (∞).';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,edgeScans:0,improvements:0,inserts:0,decreases:0,extracts:0};
    $('dijkstra-task').textContent=task.text;
    $('dijkstra-progress').textContent='Source = '+trace.source+' · V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Revealed steps: '+seen+'/'+trace.steps.length;
    const queue=$('dijkstra-queue');queue.replaceChildren();
    if(!state.queue.length){const p=el('p','The queue is empty.');p.className='board-empty';queue.append(p);}
    state.queue.forEach(item=>{const chip=el('span',item.id+' : '+item.distance);chip.className='priority-chip';chip.dataset.id=String(item.id);chip.dataset.distance=String(item.distance);queue.append(chip);});
    const active=$('dijkstra-active');active.replaceChildren();active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';active.dataset.type=last?last.type:'';
    active.append(el('h4','Settled device / inspected edge'));
    active.append(el('p',state.current===null?'No active device.':'Active device: '+state.current+' · settled distance '+value(state.rows.find(row=>row.id===state.current).distance)));
    if(state.activeEdge){const p=el('p',state.activeEdge.from+' → '+state.activeEdge.to+' · edge cost '+state.activeEdge.weight);p.className='candidate-edge';active.append(p);active.append(el('p',last.type==='inspect'?'Candidate '+last.candidate+' · current '+value(last.previousDistance)+'. Decision: '+(last.outcome==='improve'?'improves; record not revealed yet':last.outcome==='equal'?'equal':last.outcome==='worse'?'more expensive':'already settled')+'.':'New record revealed.'));if(last.type==='relax')active.lastChild.textContent='New distance '+last.distance+' · new predecessor '+last.from+' · '+(last.queueAction==='decrease'?'decrease-key':'first insertion')+'.';}
    else active.append(el('p',done?'All adjacency scans are complete.':'No active edge yet.'));
    const rows=$('dijkstra-rows');rows.replaceChildren();
    state.rows.forEach(row=>{
      const card=el('article');card.className='distance-card';card.dataset.id=String(row.id);card.dataset.distance=row.distance===null?'null':String(row.distance);card.dataset.parent=row.parent===null?'null':String(row.parent);card.dataset.status=row.status;
      if(row.id===state.current)card.classList.add('is-active');
      card.append(el('h4','Device '+row.id));card.append(el('p','d = '+value(row.distance)));card.append(el('p','Predecessor: '+(row.parent===null?'—':row.parent)));
      card.append(el('p',row.status==='settled'?'Settled':row.status==='queued'?'Waiting · tentative':done?'Unreachable':'Not found yet'));rows.append(card);
    });
    $('dijkstra-count').textContent='Rows initialized: '+counts.initializations+' · Adjacency scans: '+counts.edgeScans+' · Improvements: '+counts.improvements+' · Queue insertions: '+counts.inserts+' · Decrease-key operations: '+counts.decreases+' · Extract-min operations: '+counts.extracts;
    $('dijkstra-status').textContent=last?stepText(last):'No step revealed yet. Predict the source, its initial distance and the starting queue.';
    $('dijkstra-next').disabled=done;$('dijkstra-end').disabled=done;
    $('dijkstra-result').textContent=!done?'The final report is not revealed yet. Do not treat devices at ∞ as unreachable already.':'Settling order: ['+state.order.join(', ')+']. '+(trace.result.unreachable.length?'Unreachable: ['+trace.result.unreachable.join(', ')+'].':'Every device has a path.')+' Every distance is relative to the selected source; it is not the sum of all edge costs.';
    path();
    const history=$('dijkstra-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',stepText(step));li.dataset.type=step.type;history.append(li);});
    document.querySelector('#dijkstra-history-details summary').textContent='All revealed steps ('+seen+')';
  }
  function reset(){
    task=cases[$('dijkstra-case').value];trace=model.traceDijkstra(task.vertices,task.edges,task.source,{tieOrder:task.order||'ascending'});seen=0;
    const target=$('dijkstra-target');target.replaceChildren();trace.vertices.forEach(id=>{const option=el('option',String(id));option.value=String(id);target.append(option);});target.value=String(trace.vertices.includes(31)?31:trace.source);render();
  }
  function number(id,min,max){const input=$(id),raw=input.value.trim(),n=Number(raw),valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(n)&&n>=min&&n<=max;input.setAttribute('aria-invalid',String(!valid));return{id,value:n,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  $('dijkstra-case').addEventListener('change',reset);
  $('dijkstra-target').addEventListener('change',path);
  $('dijkstra-next').addEventListener('click',()=>{if(seen<trace.steps.length){seen++;render();}});
  $('dijkstra-end').addEventListener('click',()=>{seen=trace.steps.length;render();});
  $('dijkstra-reset').addEventListener('click',reset);
  $('negative-check').addEventListener('click',()=>{
    let rejected=false;try{model.traceDijkstra([7,18,24],[[18,7,2],[18,24,-4]],18);}catch(error){rejected=true;}
    feedback('negative-feedback',rejected?'Input rejected: edge cost −4. This Dijkstra demonstration requires every edge to be nonnegative; the search did not start.':'The expected negative-weight rejection did not occur; input validation needs checking.',!rejected);
  });
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const distance=number('guided-distance',0,100),parent=number('guided-parent',0,100),invalid=[distance,parent].find(item=>!item.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers from 0 to 100. The missing or invalid box is marked.',true);$(invalid.id).focus();return;}
    const step=model.traceDijkstra(vertices,edges,24).steps.find(step=>step.type==='relax'&&step.from===20&&step.to===31);
    if(distance.value===step.distance&&parent.value===step.from)feedback('guided-feedback','Both numbers are correct. Also compare your candidate formula, predecessor path and single queue entry with the solution; your written reasoning was not graded automatically.',false);
    else feedback('guided-feedback',distance.value!==step.distance?'The candidate is not just the last edge’s cost: d[20]+w(20,31)=4+2. Compare it with the value 8 already found.':'The cheaper candidate came via 20. Update the predecessor along with the new distance.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDijkstra(independentVertices,independentEdges,18);
    const checks=[{...number('exit-distance7',0,100),expected:expected.result.distances[7],label:'d[7]'},{...number('exit-distance26',0,100),expected:expected.result.distances[26],label:'d[26]'},{...number('exit-distance4',0,100),expected:expected.result.distances[4],label:'d[4]'},{...number('exit-decreases',0,100),expected:expected.counts.decreases,label:'decrease-key count'}];
    const invalid=checks.find(item=>!item.valid);if(invalid){feedback('exit-feedback','Fill all four boxes with integers from 0 to 100.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Check again: '+wrong.map(item=>item.label).join(', ')+'. The first cost found is tentative; a cheaper candidate changes d and predecessor together. Do not count the first insertion as a decrease-key operation.',true);return;}
    feedback('exit-feedback','All four numbers are correct. This check did not assess your written trace, formula or reasoning; evaluate them separately using the four criteria.'+(solutionSeen?' The model answer has been opened; record this as an attempt after viewing the solution.':' A trace and explanation produced before viewing the solution are independent evidence.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer was opened during this session. Assess later corrections separately from your first independent attempt.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button,#negative-check').forEach(node=>{node.disabled=false;});
})();
