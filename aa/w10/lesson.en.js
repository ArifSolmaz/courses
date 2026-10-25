(function () {
  'use strict';
  const model=window.FreshWeek10;
  if(!model||typeof model.traceKruskal!=='function'||typeof model.validateForest!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,32];
  const edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,32,2],[18,24,3],[24,11,3],[24,20,4],[32,26,4],[11,32,5]];
  const independentVertices=[4,7,18,20,24,26],independentEdges=[[18,7,1],[7,24,2],[18,24,3],[24,26,4],[26,4,5],[4,18,6]];
  const cases={
    main:{vertices,edges,text:'The main undirected network. Costs increase; ties use increasing smaller endpoint, then increasing larger endpoint. Process all 10 candidates.'},
    reverse:{vertices,edges,order:'descending',text:'The same network; only endpoint order within equal costs is reversed. Costs still increase. Can we choose different cables with the same total?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===32&&b===26)),text:'We removed candidate 32–26. 26 is still in the device list; no candidate cable reaches it. Can we build one tree?'},
    split:{vertices,edges:edges.filter(([a,b])=>!(a===24&&b===20)&&!(a===11&&b===32)),text:'We removed candidates 20–24 and 11–32. There are two separate input components; find the minimum network for each.'},
    single:{vertices:[18],edges:[],text:'One device, 18, with no candidates. Zero cables suffice to include every device.'},
    noedges:{vertices,edges:[],text:'Eight devices, no candidates. Report the disconnected result without deleting devices.'},
    zero:{vertices,edges:edges.map(([a,b,w])=>[a,b,a===7&&b===4?0:w]),text:'Only the 4–7 cost changed to 0. A zero-cost candidate is not ignored; rebuild the selection and total.'}
  };
  let trace,task,seen=0,solutionSeen=false;
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function list(ids){return '['+ids.join(', ')+']';}
  function edgeText(edge){return edge.u+'–'+edge.v+' · cost '+edge.weight;}
  function stepText(step){
    if(step.type==='init')return trace.vertices.length+' devices start as separate components. No cable is selected yet; total 0.';
    if(step.type==='consider')return edgeText(step.edge)+'. Endpoint labels '+step.componentU+' and '+step.componentV+'. '+(step.componentU===step.componentV?'The same component; state the selected path and the cycle that would close.':'Different components; which groups would accepting this edge merge?');
    if(step.type==='accept')return edgeText(step.edge)+' accepted. Two components merged under label '+step.mergedComponent+'. Scanned all '+trace.vertices.length+' label rows; total '+step.state.total+'.';
    if(step.type==='reject')return edgeText(step.edge)+' rejected. Its endpoints already have a selected path: '+step.cycle.join(' → ')+'. Components and total cost stayed unchanged; no merge scan was performed.';
    return 'All candidates processed. '+(step.connected?'All devices are in one component; the minimum spanning tree is ready.':'The input is disconnected; a forest with a minimum tree for each input component is ready.');
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,edgeChecks:0,merges:0,rejections:0,labelScans:0};
    $('kruskal-task').textContent=task.text;
    $('kruskal-progress').textContent='V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Revealed step: '+seen+'/'+trace.steps.length;
    const candidate=$('kruskal-candidate');candidate.replaceChildren();candidate.append(el('h4','Next decision · edge and component labels'));
    candidate.dataset.edge=state.activeEdge?state.activeEdge.id:'';candidate.dataset.decision=state.decision||'';
    if(state.activeEdge){
      const p=el('p',edgeText(state.activeEdge));p.className='candidate-edge';candidate.append(p);
      const beforeU=last.componentU??state.rows.find(row=>row.id===state.activeEdge.u).component,beforeV=last.componentV??state.rows.find(row=>row.id===state.activeEdge.v).component;
      candidate.append(el('p','Labels before the decision: '+beforeU+' / '+beforeV));
      candidate.append(el('p',state.decision==='pending'?'Decision not revealed yet. State accept or reject first.':state.decision==='accept'?'Accepted · two separate groups merged.':'Rejected · closes a cycle within the same group.'));
    }else candidate.append(el('p',done?'No candidates left.':'No edge inspected yet.'));
    const groups=$('kruskal-components');groups.replaceChildren();
    state.components.forEach(ids=>{
      const card=el('article');card.className='component-card';card.dataset.label=String(ids[0]);card.dataset.members=ids.join(',');
      if(state.activeEdge&&(ids.includes(state.activeEdge.u)||ids.includes(state.activeEdge.v)))card.classList.add('is-touched');
      card.append(el('h4','Component label '+ids[0]));const members=el('div');members.className='members';
      ids.forEach(id=>{const chip=el('span',String(id));chip.className='member-chip';chip.dataset.id=String(id);members.append(chip);});card.append(members);groups.append(card);
    });
    $('kruskal-total').textContent='Component count: '+state.components.length+' · Selected edges: '+state.selected.length+' · Total installation cost: '+state.total+' units';
    const chosen=$('kruskal-selected');chosen.replaceChildren();chosen.append(el('h4','Cables selected so far'));
    const chips=el('div');chips.className='edge-chips';
    if(!state.selected.length){const p=el('p','No cable selected yet.');p.className='board-empty';chosen.append(p);}
    state.selected.forEach(edge=>{const chip=el('span',edgeText(edge));chip.className='edge-chip';chip.dataset.id=edge.id;chips.append(chip);});chosen.append(chips);
    $('kruskal-cycle').textContent=state.cycle?'Selected path + rejected edge: '+state.cycle.join(' → ')+'. This closed chain is a cycle witness.':'';
    $('kruskal-count').textContent='Initialised rows: '+counts.initializations+' · Edges inspected: '+counts.edgeChecks+' · Merges: '+counts.merges+' · Rejections: '+counts.rejections+' · Label-row scans during merges: '+counts.labelScans;
    $('kruskal-status').textContent=last?stepText(last):'No step revealed yet. State the cheapest candidate and the initial components.';
    $('kruskal-next').disabled=done;$('kruskal-end').disabled=done;
    if(!done)$('kruskal-result').textContent='Not all candidates have been processed. This is an intermediate forest; the final cost and connectivity report opens when this demonstration is complete.';
    else $('kruskal-result').textContent=trace.result.connected?'All '+trace.vertices.length+' devices are in one component. Minimum spanning tree: '+state.selected.length+' edges, total '+state.total+' units. Ties may allow other minimum trees.':'The available candidates cannot connect every device into one network. Minimum spanning forest: '+state.components.length+' components, '+state.selected.length+' edges, total '+state.total+' units; isolated devices are included too.';
    const sorted=$('kruskal-sorted');sorted.replaceChildren();
    trace.sortedEdges.forEach(edge=>{
      const status=state.selected.some(item=>item.id===edge.id)?'selected':state.rejected.some(item=>item.id===edge.id)?'rejected':state.activeEdge&&state.activeEdge.id===edge.id?'examining':'waiting';
      const label=status==='selected'?' · accepted':status==='rejected'?' · rejected':status==='examining'?' · examining':'';
      const li=el('li',edgeText(edge)+label);li.dataset.id=edge.id;li.dataset.state=status;sorted.append(li);
    });
    if(!trace.sortedEdges.length)sorted.append(el('li','No candidate cables.'));
    const history=$('kruskal-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',stepText(step));li.dataset.type=step.type;if(step.edge)li.dataset.edge=step.edge.id;history.append(li);});
    document.querySelector('#kruskal-history-details summary').textContent='All revealed steps ('+seen+')';
  }
  function reset(){task=cases[$('kruskal-case').value];trace=model.traceKruskal(task.vertices,task.edges,{tieOrder:task.order||'ascending'});seen=0;render();}
  function number(id,min,max){const input=$(id),raw=input.value.trim(),value=Number(raw);const valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(value)&&value>=min&&value<=max;input.setAttribute('aria-invalid',String(!valid));return{id,value,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  function parseEdges(raw){
    const text=raw.trim().replace(/\s*[-–−—]\s*/g,'-');if(!text)return null;
    const tokens=text.split(/[,\s]+/);if(!tokens.every(token=>/^\d+-\d+$/.test(token)))return null;
    const pairs=tokens.map(token=>token.split('-').map(Number));if(!pairs.every(pair=>pair.every(Number.isSafeInteger)))return null;
    return pairs.map(([a,b])=>Math.min(a,b)+'-'+Math.max(a,b));
  }
  $('kruskal-case').addEventListener('change',reset);
  $('kruskal-next').addEventListener('click',()=>{if(seen<trace.steps.length){seen++;render();}});
  $('kruskal-end').addEventListener('click',()=>{seen=trace.steps.length;render();});
  $('kruskal-reset').addEventListener('click',reset);
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const components=number('guided-components',1,32),total=number('guided-total',0,100),invalid=[components,total].find(item=>!item.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers in the stated ranges. I marked the missing or invalid box.',true);$(invalid.id).focus();return;}
    const rejected=model.traceKruskal(vertices,edges).steps.find(step=>step.type==='reject'&&step.edge.id==='7-11').state;
    if(components.value===rejected.components.length&&total.value===rejected.total)feedback('guided-feedback','Both numbers are correct. Compare your accept/reject decision, shared label and cycle path with the solution too; your written reasoning was not graded automatically.',false);
    else feedback('guided-feedback',components.value!==rejected.components.length?'7 and 11 are already in {4,7,11}. An edge within the same group does not merge two separate components.':'Add only the selected 4–7 and 4–11 costs. A rejected edge’s cost is not added to the installation total.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceKruskal(independentVertices,independentEdges);
    const checks=[{...number('exit-selected',0,32),expected:expected.result.selected.length,label:'selected-edge count'},{...number('exit-total',0,100),expected:expected.result.total,label:'installation total'},{...number('exit-components',1,32),expected:expected.result.componentCount,label:'final component count'},{...number('exit-scans',0,1024),expected:expected.counts.labelScans,label:'label-row scans'}];
    const invalid=checks.find(item=>!item.valid);if(invalid){feedback('exit-feedback','Fill all four boxes with integers in the stated ranges.',true);$(invalid.id).focus();return;}
    const ids=parseEdges($('exit-edges').value),validation=model.validateForest(independentVertices,independentEdges,ids);
    $('exit-edges').setAttribute('aria-invalid',String(validation.reason==='not-edge-set'));
    if(validation.reason==='not-edge-set'){feedback('exit-feedback','Write only this network’s candidate edges; separate endpoints with a hyphen and edges with commas or spaces. The format is incomplete, or an edge is repeated or unknown.',true);$('exit-edges').focus();return;}
    if(validation.reason==='cycle'){feedback('exit-feedback','In your selection, '+validation.violatingEdge+' closes a cycle. Reconsider the edge within the same selected component.',true);return;}
    if(validation.reason==='not-spanning'){feedback('exit-feedback','Your selection leaves part of a connectable input component unconnected. '+validation.violatingEdge+' still has endpoints in separate groups; span every input component. 20 may remain alone.',true);return;}
    if(validation.reason==='not-minimum'){feedback('exit-feedback','Your selection spans the parts, but its total is not minimum. '+validation.violatingEdge+' allows a cheaper exchange; check your expensive selection again.',true);return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Your edge selection is a minimum forest; recheck: '+wrong.map(item=>item.label).join(', ')+'. Installation, components and row scans have different units.',true);return;}
    feedback('exit-feedback','All four numbers are correct and your edge selection is a minimum spanning forest. This check did not assess the accuracy of your written trace, formula or reasoning; evaluate those separately using the four criteria.'+(solutionSeen?' The model answer was opened; record this as an attempt after viewing the solution.':' The trace and reasoning you produced without seeing the solution are independent evidence.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer has been opened in this session. Evaluate later corrections separately from the first independent attempt.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
