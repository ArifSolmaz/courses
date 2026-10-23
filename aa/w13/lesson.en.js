(function () {
  'use strict';
  const model=window.FreshWeek13;
  if(!model||typeof model.traceDP!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2]];
  const cases={
    main:{vertices,edges,source:24,target:31,k:4,text:'Main network · source 24, target 31, exactly 4 edges. Which column should you read when adding the last edge?'},
    none:{vertices,edges,source:24,target:31,k:3,text:'Same network · source 24, target 31, exactly 3 edges. Does the cheap two-edge answer solve this question?'},
    zero:{vertices,edges:edges.map(([u,v])=>[u,v,0]),source:24,target:31,k:4,text:'Every edge costs 0 · source 24, target 31, exactly 4 edges. Ties keep the first predecessor; unreachable cells still contain ∞.'},
    self:{vertices,edges,source:24,target:24,k:0,text:'Source and target 24 · k=0. Check the empty walk, which traverses no edges, in the base cell.'},
    wrongzero:{vertices,edges,source:24,target:31,k:0,text:'Source 24, target 31 · k=0. What base cost applies outside the source?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===31&&b===26)),source:24,target:26,k:4,text:'Edge 31–26 removed · source 24, target 26, k=4. Device 26 is listed but isolated; how do you finish a cell with no neighbors?'},
    return:{vertices,edges,source:24,target:24,k:4,text:'Same network · source and target 24, exactly 4 edges. Does starting at the source allow a free 0 in the final column?'}
  };
  let task,trace,seen=0,viewColumn=0,solutionSeen=false;
  const val=n=>n===null?'∞':String(n);
  const pathText=ids=>ids.join(' → ');
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function describe(s){
    if(s.type==='init')return 'Base ready: D['+trace.source+',0]=0; other devices have ∞. '+s.counts.initCells+' cells initialized; '+s.counts.baseCells+' of them are base cells. The other columns are not yet computed.';
    if(s.type==='start-cell')return 'D['+s.v+','+s.r+'] is being computed. Provisional minimum ∞; we will read only neighbors in column r='+(s.r-1)+'.';
    if(s.type==='inspect')return 'D['+s.u+','+(s.r-1)+']='+val(s.sourceValue)+'; last edge '+s.u+' → '+s.v+' costs '+s.weight+'. '+(s.sourceValue===null?'The previous cell is unreachable; no finite candidate.':'Candidate '+s.sourceValue+'+'+s.weight+'='+s.candidate+'. '+({improve:'Cheaper; the cell will change at the next update.',equal:'Equal; keep the first predecessor.',worse:'More expensive; keep the current cell.'}[s.outcome]));
    if(s.type==='update')return 'D['+s.v+','+s.r+']: '+val(s.previousValue)+' → '+s.value+'. P['+s.v+','+s.r+']='+s.u+' recorded. Other neighbors for this cell may remain unprocessed.';
    if(s.type==='finish-cell')return 'D['+s.v+','+s.r+'] finished: '+val(s.value)+'. '+(s.parent===null?'No predecessor.':'Predecessor '+s.parent+'.');
    if(s.type==='finish-column')return 'r='+s.r+' is ready for every device. '+(s.r<trace.k?'The next column may read only this column.':'The requested final column is complete; now follow the target’s predecessors.');
    if(s.type==='path-start')return s.found?'D['+s.target+','+s.k+'] is finite: '+s.value+'. Backward reconstruction starts at cell ('+s.target+','+s.k+').':'D['+s.target+','+s.k+']=∞. There is no walk with this exact edge count; we do not start following predecessors.';
    if(s.type==='path-step')return '('+s.from+','+s.fromColumn+') has predecessor '+s.to+'. One edge backwards: ('+s.to+','+s.toColumn+'). Devices may repeat; the column decreases by one.';
    return 'Table computation and predecessor traversal are complete. '+(s.found?'A minimum-cost walk with exactly '+trace.k+' edges is ready.':'There is no walk for this target and k.');
  }
  function decorateCell(node,row,r,state){
    const status=row.statuses[r],value=row.values[r],parent=row.parents[r];
    node.dataset.vertex=String(row.id);node.dataset.r=String(r);node.dataset.status=status;
    node.dataset.value=status==='pending'?'pending':value===null?'null':String(value);
    node.dataset.parent=parent===null?'null':String(parent);
    node.dataset.current=String(Boolean(state.current&&state.current.vertex===row.id&&state.current.r===r));
    node.dataset.reading=String(Boolean(state.activeCandidate&&state.activeCandidate.from===row.id&&state.activeCandidate.r-1===r));
    return {status,value,parent};
  }
  function renderMatrix(state){
    const table=$('dp-matrix');table.replaceChildren(el('caption','Revealed D[v,r] and P[v,r] cells'));
    const head=el('thead'),header=el('tr'),vhead=el('th','Device');vhead.scope='col';header.append(vhead);
    for(let r=0;r<=trace.k;r++){const th=el('th','r='+r);th.scope='col';header.append(th);}head.append(header);table.append(head);
    const body=el('tbody');
    state.rows.forEach(row=>{const tr=el('tr'),th=el('th',String(row.id));th.scope='row';tr.append(th);for(let r=0;r<=trace.k;r++){const td=el('td'),cell=decorateCell(td,row,r,state);td.append(el('span',cell.status==='pending'?'·':val(cell.value)));td.append(el('small',cell.status==='pending'?'pending':cell.status==='working'?'working · P '+(cell.parent===null?'none':cell.parent):'P '+(cell.parent===null?'none':cell.parent)));tr.append(td);}body.append(tr);});
    table.append(body);
    const cards=$('dp-cards');cards.replaceChildren();
    state.rows.forEach(row=>{const card=el('article');card.className='dp-card';const cell=decorateCell(card,row,viewColumn,state);card.append(el('h5','Device '+row.id+' · r='+viewColumn));card.append(el('p','D = '+(cell.status==='pending'?'· · not yet computed':val(cell.value)+(cell.status==='working'?' · working':' · complete'))));card.append(el('p','P = '+(cell.parent===null?'none':cell.parent)));cards.append(card);});
    $('dp-column').value=String(viewColumn);
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,c=last?last.counts:{initCells:0,baseCells:0,computedCells:0,scans:0,finiteCandidates:0,improvements:0,pathEdges:0};
    $('dp-task').textContent=task.text;
    $('dp-progress').textContent='Source '+trace.source+' · Target '+trace.target+' · k='+trace.k+' · Revealed step: '+seen+'/'+trace.steps.length;
    $('dp-widget').dataset.seen=String(seen);$('dp-widget').dataset.type=last?last.type:'';$('dp-widget').dataset.phase=state.phase;$('dp-widget').dataset.column=state.column===null?'null':String(state.column);
    renderMatrix(state);
    const active=$('dp-active');active.replaceChildren(el('h4','Separate reading from writing'));
    if(state.activeCandidate){const a=state.activeCandidate;active.append(el('p','Read: D['+a.from+','+(a.r-1)+'] = '+val(a.sourceValue)));active.append(el('p','Last edge: '+a.from+' → '+a.to+' · cost '+a.weight));active.append(el('p',a.sourceValue===null?'No finite candidate can be produced.':'Candidate: '+a.sourceValue+' + '+a.weight+' = '+a.candidate));const row=state.rows.find(row=>row.id===a.to);active.append(el('p','Cell written: D['+a.to+','+a.r+'] = '+val(row.values[a.r])+' · '+(last.type==='update'?'improvement applied.':'candidate not yet applied; ties and higher costs leave the cell unchanged.')));}
    else if(state.current)active.append(el('p','D['+state.current.vertex+','+state.current.r+']: try neighbors in the previous column.'));
    else active.append(el('p',state.phase==='idle'?'The base has not yet been revealed.':state.phase==='base'?'Base ready; the next column is r=1.':state.phase==='path'||state.done?'Table computation is complete; follow the predecessor columns backwards.':'The completed cells in this column are ready for the next computation.'));
    $('dp-count').textContent='D cells initialized: '+c.initCells+' (including '+c.baseCells+' base cells) · Recurrence cells finished: '+c.computedCells+' · Neighbor scans: '+c.scans+' · Finite candidates: '+c.finiteCandidates+' · Strict improvements: '+c.improvements+' · Predecessor steps: '+c.pathEdges;
    $('dp-status').textContent=last?describe(last):'No cell has been revealed yet. Where can you be with zero edges, and at what cost?';
    $('dp-path').dataset.path=state.reversePath.join(',');$('dp-path').dataset.cursor=state.cursor?state.cursor.vertex+','+state.cursor.r:'';
    $('dp-path').textContent=state.reversePath.length?state.reversePath.map((id,i)=>'('+id+','+(trace.k-i)+')').join(' ← '):(state.phase==='path'||state.done?'The final cell is unreachable; there is no predecessor chain.':'Predecessor traversal starts after the table is complete.');
    $('dp-result').dataset.cost=state.done?(trace.result.bestCost===null?'null':String(trace.result.bestCost)):'pending';$('dp-result').dataset.path=state.done&&trace.result.bestPath?trace.result.bestPath.join(','):'';
    $('dp-result').textContent=!state.done?'Complete the table and predecessor traversal. The final walk appears here when both are complete.':trace.result.found?'A minimum-cost walk with exactly '+trace.k+' edges: '+pathText(trace.result.bestPath)+' · cost '+trace.result.bestCost+' units.':'Source '+trace.source+' → target '+trace.target+': no walk with exactly '+trace.k+' edges. A different k requires a different column.';
    ['dp-next','dp-stage','dp-end'].forEach(id=>{$(id).disabled=state.done;});
    const history=$('dp-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#dp-history-details summary').textContent='Revealed steps ('+seen+')';
  }
  function followColumn(){const state=seen?trace.steps[seen-1].state:trace.initialState;viewColumn=state.cursor?state.cursor.r:state.column===null?0:state.column;}
  function reset(){
    task=cases[$('dp-case').value];trace=model.traceDP(task.vertices,task.edges,task.source,task.target,task.k);seen=0;viewColumn=0;
    $('dp-column').replaceChildren();for(let r=0;r<=trace.k;r++){const option=el('option','r='+r);option.value=String(r);$('dp-column').append(option);}render();
  }
  $('dp-case').addEventListener('change',reset);
  $('dp-next').addEventListener('click',()=>{if(seen<trace.steps.length){seen++;followColumn();render();}});
  $('dp-stage').addEventListener('click',()=>{while(seen<trace.steps.length){const type=trace.steps[seen++].type;if(['init','finish-column','path-step','complete'].includes(type))break;}followColumn();render();});
  $('dp-end').addEventListener('click',()=>{seen=trace.steps.length;followColumn();render();});
  $('dp-reset').addEventListener('click',reset);
  $('dp-column').addEventListener('change',()=>{viewColumn=Number($('dp-column').value);render();});
  function number(id){const input=$(id),raw=input.value.trim(),n=Number(raw),valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(n)&&n>=0&&n<=100;input.setAttribute('aria-invalid',String(!valid));return{id,value:n,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const cost=number('guided-cost'),parent=number('guided-parent'),invalid=[cost,parent].find(x=>!x.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers from 0–100.',true);$(invalid.id).focus();return;}
    if(cost.value!==10){feedback('guided-feedback','Form the three candidate totals: 7+5, 8+2, 10+4. Choose the minimum.',true);return;}
    if(parent.value!==20){feedback('guided-feedback','Which neighbor supplied the final edge giving the minimum? Record its ID, rather than the edge cost.',true);return;}
    feedback('guided-feedback','Both numbers are correct. Compare your recurrence, column, and ∞ reasoning with the solution separately; your written explanation was not scored automatically.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDP(independentVertices,independentEdges,18,4,5);
    const checks=[{...number('exit-cost'),expected:expected.result.bestCost,label:'minimum cost'},{...number('exit-cells'),expected:expected.counts.initCells,label:'D cells including the base'},{...number('exit-scans'),expected:expected.counts.scans,label:'all neighbor scans'},{...number('exit-edges'),expected:expected.counts.pathEdges,label:'predecessor steps'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Fill all four boxes with integers from 0–100.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Recheck: '+wrong.map(x=>x.label).join(', ')+'. Count exactly five edges, V(k+1) cells, and the adjacency entries for both directions of each edge in every column.',true);return;}
    feedback('exit-feedback','All four numbers are correct. This check did not assess your written table, predecessor chain, or reasoning; evaluate these separately using the four criteria.'+(solutionSeen?' The model answer was opened; mark this as an attempt after seeing the solution.':' The table and reasoning you produced before seeing the solution are independent evidence.'),false);
  });
  function clear(form,id){const run=()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));};form.addEventListener('input',run);form.addEventListener('change',run);}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer has been opened in this session. Assess later corrections separately from your first independent attempt.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();

