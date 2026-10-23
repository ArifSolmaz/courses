(function () {
  'use strict';
  const model=window.FreshWeek12;
  if(!model||typeof model.traceWalks!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2]];
  const cases={
    main:{vertices,edges,source:24,target:31,k:4,text:'Main network; source 24, target 31, exactly 4 edges. Is the first candidate costing 12 the final answer? Check remaining r when you reach the target early.'},
    two:{vertices,edges,source:24,target:31,k:2,text:'Same network, source 24/target 31; only k=2. Compare all eight terminals of the small tree on paper.'},
    none:{vertices,edges,source:24,target:31,k:3,text:'Same network, source 24/target 31; k=3. The devices are connected, but is there a solution with this exact edge count?'},
    zero:{vertices,edges:edges.map(([u,v])=>[u,v,0]),source:24,target:31,k:4,text:'All edge costs in the same network are now 0; source 24/target 31,k=4. After a valid 0-cost candidate, why can we skip internal branches with equal cost?'},
    self:{vertices,edges,source:24,target:24,k:0,text:'Source and target are 24, k=0. The empty walk is valid without traversing an edge. The drawing’s target 31 description does not apply to this example.'},
    wrongzero:{vertices,edges,source:24,target:31,k:0,text:'Source 24, target 31,k=0. The root is terminal but is not at the target. Can the empty walk answer this target?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===31&&b===26)),source:24,target:26,k:4,text:'31–26 was removed; source 24, target 26,k=4. Device 26 is listed but isolated. Explain the result after the full search finishes.'}
  };
  Object.values(cases).forEach(task=>{task.text=task.text.replace(/(kaynak|Kaynak|hedef|hedefi|bedelleri|geçerli|adaydan sonra eşit bedelli iç dalları neden atlayabiliriz)(\d)/g,'$1 $2').replace('tam4','tam 4').replace('İlk12','İlk 12').replace('hedef24','hedef 24').replace('hedef31','hedef 31').replace('geçerli0','geçerli 0');});
  let task,trace,fullTrace,seen=0,solutionSeen=false;
  function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function pathText(ids){return ids.join(' → ');}
  function val(n){return n===null?'none':String(n);}
  function describe(step){
    if(step.type==='enter')return 'Call '+step.node.id+': device '+step.node.vertex+', r='+step.node.remaining+', c='+step.node.cost+'. Prefix '+pathText(step.node.path)+'. '+(step.node.remaining===0?'Predict the terminal check.':'Predict the next decision; reaching the target early does not stop the search.');
    if(step.type==='choose')return step.from+' → '+step.to+' chosen: edge cost '+step.weight+'; in the child r='+step.nextRemaining+', c='+step.nextCost+'. The child has not been called yet; it enters the stack in the next step.';
    if(step.type==='terminal')return 'Call '+step.nodeId+' has r=0. '+(step.valid?'At the target, a valid candidate; cost '+step.cost+'. '+(step.improves?'Cheaper; the best record has not changed yet.':'It does not improve the current best; retain the record.'):'Not at the target; an invalid terminal.');
    if(step.type==='record')return 'Valid candidate recorded: best '+val(step.previousBest)+' → '+step.bestCost+'. Walk '+pathText(step.path)+'. The search is not complete yet.';
    if(step.type==='prune')return 'Call '+step.nodeId+' pruned: c='+step.cost+' ≥ B='+step.bound+'. Remaining costs are nonnegative; this internal branch cannot finish cheaper. We are not listing tied optima.';
    if(step.type==='deadend')return 'Call '+step.nodeId+': r>0 but there is no neighbor. The remaining traversals cannot be completed; return.';
    if(step.type==='return')return 'Call '+step.nodeId+' finished and left the stack. '+(step.state.current===null?'The root has also returned.':'Parent call '+step.state.current+' will resume at its next neighbor.');
    return 'Every open call has returned; the search is complete. The result can now include a minimum report.';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=state.done;
    const c=last?last.counts:{calls:0,extensions:0,terminals:0,valid:0,improvements:0,prunes:0,returns:0};
    $('walk-task').textContent=task.text+' Pruning '+(trace.prune?'on.':'off.');
    $('walk-progress').textContent='Source '+trace.source+' · Target '+trace.target+' · k='+trace.k+' · Revealed steps: '+seen+'/'+trace.steps.length;
    const active=$('walk-active');active.replaceChildren();active.dataset.type=last?last.type:'';active.dataset.current=state.current===null?'':String(state.current);active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';
    active.append(el('h4','Current decision'));
    if(state.activeEdge){const p=el('p',state.activeEdge.from+' → '+state.activeEdge.to+' · cost '+state.activeEdge.weight);p.className='candidate-edge';active.append(p);active.append(el('p','In the child, '+last.nextRemaining+' edges remain · total '+last.nextCost+' units. The child has not been entered yet.'));}
    else if(state.current!==null){const f=state.stack.find(f=>f.id===state.current);active.append(el('p','Call '+f.id+' · device '+f.vertex+' · r='+f.remaining+' · c='+f.cost));active.append(el('p','Prefix: '+pathText(f.path)));}
    else active.append(el('p',done?'No calls remain open.':'The root call has not been revealed yet.'));
    const stack=$('walk-stack');stack.replaceChildren();
    if(!state.stack.length){const p=el('p','The stack is empty.');p.className='board-empty';stack.append(p);}
    state.stack.forEach(f=>{const card=el('article');card.className='stack-card';card.dataset.id=String(f.id);card.dataset.vertex=String(f.vertex);card.dataset.remaining=String(f.remaining);card.dataset.cost=String(f.cost);card.dataset.path=f.path.join(',');card.dataset.depth=String(f.depth);card.append(el('h5','Call '+f.id+' · device '+f.vertex));card.append(el('p','r = '+f.remaining+' · c = '+f.cost+' · depth '+f.depth));card.append(el('p',pathText(f.path)));stack.append(card);});
    $('walk-best').dataset.cost=state.bestCost===null?'null':String(state.bestCost);$('walk-best').dataset.path=state.bestPath?state.bestPath.join(','):'';
    $('walk-best').textContent=state.bestCost===null?'No valid candidate has been recorded yet. This does not mean cost 0.':'Provisional best: '+state.bestCost+' units · '+pathText(state.bestPath)+'.';
    $('walk-count').textContent='Calls: '+c.calls+' · Extensions: '+c.extensions+' · Terminals: '+c.terminals+' · Valid seen: '+c.valid+' · Strict improvements: '+c.improvements+' · Prunes: '+c.prunes+' · Returns: '+c.returns;
    $('walk-status').textContent=last?describe(last):'Predict the root’s device, remaining edges, and cost. No call has been revealed yet.';
    ['walk-next','walk-decision','walk-end'].forEach(id=>{$(id).disabled=done;});
    if(!done){$('walk-result').textContent='The search has not finished yet. The provisional best is not confirmed as minimum until every remaining branch is processed or safely pruned.';$('walk-compare').textContent='';}
    else{
      $('walk-result').textContent=trace.result.found?'Exactly '+trace.k+'-edge walk of minimum cost: '+pathText(trace.result.bestPath)+' · cost '+trace.result.bestCost+' units.':'Source '+trace.source+' → target '+trace.target+': no walk with exactly '+trace.k+' edges exists. This does not mean no walk exists at every edge count or that all targets are unreachable.';
      $('walk-compare').textContent='Full unpruned tree: '+fullTrace.counts.calls+' calls, '+fullTrace.counts.terminals+' terminals, '+fullTrace.counts.valid+' valid. '+(trace.prune?'Actually seen in this pruned run: '+c.calls+' calls, '+c.terminals+' terminals, '+c.valid+' valid; '+c.prunes+' internal branches pruned. Candidates in pruned branches were not counted.':'Every terminal walk was seen in this run. Enable pruning to compare the same minimum with the changed work.');
    }
    // Build only from opened events; final model data never reveals future tree nodes.
    const opened=new Map();trace.steps.slice(0,seen).forEach(step=>{
      if(step.type==='enter')opened.set(step.node.id,{...step.node,status:'open',returned:false});
      else if(step.type==='terminal')opened.get(step.nodeId).status=step.valid?'valid':'invalid';
      else if(step.type==='prune')opened.get(step.nodeId).status='pruned';
      else if(step.type==='deadend')opened.get(step.nodeId).status='deadend';
      else if(step.type==='return'){const f=opened.get(step.nodeId);f.returned=true;if(f.status==='open')f.status='expanded';}
    });
    const tree=$('walk-tree');tree.replaceChildren();
    const labels={open:'Open call',expanded:'Children finished',valid:'Valid terminal',invalid:'Terminal away from target',pruned:'Internal branch pruned',deadend:'No neighbor; r not completed'};
    opened.forEach(f=>{const li=el('li');li.className='choice-node';li.dataset.id=String(f.id);li.dataset.parent=f.parentId===null?'null':String(f.parentId);li.dataset.vertex=String(f.vertex);li.dataset.remaining=String(f.remaining);li.dataset.cost=String(f.cost);li.dataset.path=f.path.join(',');li.dataset.status=f.status;li.dataset.returned=String(f.returned);li.style.setProperty('--depth',String(f.depth));if(f.id===state.current)li.classList.add('is-active');li.append(el('strong','Call '+f.id+' · device '+f.vertex+' · depth '+f.depth));li.append(el('p','r='+f.remaining+' · c='+f.cost+' · '+labels[f.status]+(f.returned?' · returned':'')));li.append(el('p',pathText(f.path)));tree.append(li);});
    if(!opened.size){const p=el('li','No calls yet.');p.className='board-empty';tree.append(p);}
    document.querySelector('#walk-tree-details summary').textContent='Revealed choice tree ('+opened.size+' calls)';
    const history=$('walk-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#walk-history-details summary').textContent='All revealed steps ('+seen+')';
  }
  function reset(){task=cases[$('walk-case').value];fullTrace=model.traceWalks(task.vertices,task.edges,task.source,task.target,task.k);trace=$('walk-prune').checked?model.traceWalks(task.vertices,task.edges,task.source,task.target,task.k,{prune:true}):fullTrace;seen=0;render();}
  $('walk-case').addEventListener('change',reset);$('walk-prune').addEventListener('change',reset);
  $('walk-next').addEventListener('click',()=>{if(seen<trace.steps.length){seen++;render();}});
  $('walk-decision').addEventListener('click',()=>{while(seen<trace.steps.length){const type=trace.steps[seen++].type;if(['terminal','record','prune','deadend','complete'].includes(type))break;}render();});
  $('walk-end').addEventListener('click',()=>{seen=trace.steps.length;render();});$('walk-reset').addEventListener('click',reset);
  function number(id,min,max){const input=$(id),raw=input.value.trim(),n=Number(raw),valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(n)&&n>=min&&n<=max;input.setAttribute('aria-invalid',String(!valid));return{id,value:n,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const cost=number('guided-cost',0,100),remaining=number('guided-remaining',0,6),invalid=[cost,remaining].find(x=>!x.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers in the stated ranges.',true);$(invalid.id).focus();return;}
    const choice=$('guided-decision');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('guided-feedback','After the two numbers, choose your decision for this internal branch.',true);choice.focus();return;}
    if(cost.value!==10){feedback('guided-feedback','The prefix has three traversals: 4+2+4. The next edge cost has not been paid yet.',true);return;}
    if(remaining.value!==1){feedback('guided-feedback','You must use four edges; the prefix has traversed three. Count traversals rather than devices.',true);return;}
    if(choice.value!=='prune'){feedback('guided-feedback','c=10 and valid B=10. Can a nonnegative continuation be cheaper? We want only one optimum.',true);return;}
    feedback('guided-feedback','Both numbers and the pruning decision are correct. Compare your lower-bound, equality, and negative-weight explanations with the solution separately; your written explanation was not scored automatically.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceWalks(independentVertices,independentEdges,18,4,5);
    const checks=[{...number('exit-cost',0,100),expected:expected.result.bestCost,label:'cheapest cost'},{...number('exit-terminals',0,100),expected:expected.counts.terminals,label:'terminal count'},{...number('exit-valid',0,100),expected:expected.counts.valid,label:'valid candidate count'},{...number('exit-calls',0,100),expected:expected.counts.calls,label:'call count including the root'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Fill all four boxes with integers from 0–100.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Check again: '+wrong.map(x=>x.label).join(', ')+'. In this task, count all unpruned terminals and calls; check the target after exactly five edges.',true);return;}
    feedback('exit-feedback','The four numbers are correct. This check did not assess your written tree, walks, formula, or justification; evaluate those separately with the four criteria.'+(solutionSeen?' The model answer was opened; record this attempt as after seeing the solution.':' Your trace and justification produced before seeing the solution are independent evidence.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});form.addEventListener('change',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer was opened in this session. Evaluate later corrections separately from the first independent attempt.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
