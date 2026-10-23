(function () {
  'use strict';
  const model=window.FreshWeek14;
  if(!model||typeof model.traceCertificate!=='function'||typeof model.transformHamiltonianST!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const repeatPath=[24,20,31,20,31],simplePath=[24,18,7,11,31];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2],[18,7,1],[24,4,7]];
  const cases={
    repeat:{source:24,target:31,k:4,B:10,path:repeatPath,simple:true,text:'Week 13’s candidate, now with repeated devices forbidden. Keep the ID and edge conditions distinct.'},
    walk:{source:24,target:31,k:4,B:10,path:repeatPath,simple:false,text:'Previous walk contract: repeats allowed. This comparison does not use L’s simple-path rule.'},
    budget:{source:24,target:31,k:4,B:10,path:simplePath,simple:true,text:'A candidate with no repeats and real edges; budget 10. Predict which check will stop it.'},
    valid:{source:24,target:31,k:4,B:12,path:simplePath,simple:true,text:'The same candidate with no repeats, budget 12. Does accepting it prove minimum cost?'},
    short:{source:24,target:31,k:4,B:12,path:[24,20,31],simple:true,text:'This cheap candidate uses only two edges. With exactly four required, which check fails first?'},
    missing:{source:24,target:31,k:4,B:12,path:[24,18,7,26,31],simple:true,text:'The IDs are known and distinct; is every consecutive pair really linked? Do not invent a missing edge’s cost.'},
    wrong:{source:24,target:31,k:4,B:12,path:[18,24,11,7,31],simple:true,text:'The list contains familiar IDs, but the source condition is unchanged. No further conditions are tested after the first error.'},
    unknown:{source:24,target:31,k:4,B:12,path:[24,18,7,99,31],simple:true,text:'99 is not registered in this graph. The ID check comes before looking for edges.'},
    empty:{source:24,target:24,k:0,B:0,path:[24],simple:true,text:'Source and target 24; k=0. A list with one device position traverses no edges and costs 0.'},
    separate:{source:24,target:31,k:0,B:0,path:[24],simple:true,text:'Source 24, target 31; k=0. Even if list length is correct, what happens to the target condition?'}
  };
  const reasons={format:'invalid list format',length:'the exactly k+1 entries condition failed','unknown-id':'an ID is absent from the graph or invalid',source:'the first ID is not the source',target:'the last ID is not the target',repeat:'the no-repeat rule was violated','missing-edge':'there is no edge between consecutive devices',budget:'the total cost exceeds the budget',valid:'all candidate conditions were met'};
  let task,trace,seen=0,dirty=false,solutionSeen=false;
  const pathText=ids=>ids.join(' → ');
  function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function describe(s){
    if(s.type==='start')return s.formatValid?'Start checking the given list. Length, IDs, and edges have not been checked yet.':'The given candidate is not a list or exceeds the demonstration limit; rejection is next.';
    if(s.type==='length')return 'Length '+s.actual+' entries; required k+1='+s.expected+'. '+(s.passed?'Condition passed.':'Condition failed; we will reject this candidate.');
    if(s.type==='id')return 'Position '+(s.index+1)+' · ID '+(s.id===null?'invalid':s.id)+': '+(s.passed?'is in the graph.':'is not a valid registered ID. Rejection is next.');
    if(s.type==='endpoint')return (s.kind==='source'?'Source':'Target')+' check: position '+(s.index+1)+' has value '+s.actual+', required '+s.expected+'. '+(s.passed?'Passed.':'This candidate fails the condition.');
    if(s.type==='repeat')return 'Position '+(s.index+1)+' · '+s.id+': '+(s.passed?'has not appeared in earlier positions; add it to the set.':'first appeared at position '+(s.firstIndex+1)+'. The no-repeat rule is violated; we have not started adding edge costs.');
    if(s.type==='edge')return 'Position '+s.index+' → '+(s.index+1)+': '+s.from+' → '+s.to+' edge '+(s.exists?'exists; cost '+s.weight+'. Not added to the total yet.':'does not exist. Do not invent a finite cost; this candidate will be rejected.');
    if(s.type==='add')return 'Add the real edge’s cost: '+s.previous+' + '+s.weight+' = '+s.total+'. This is the cost of the prefix checked and added so far.';
    if(s.type==='budget')return 'All edges have been added: '+s.total+' ≤ '+s.B+'? '+(s.passed?'Yes; acceptance is next.':'No; this candidate exceeds the budget.');
    if(s.type==='accept')return 'This candidate is accepted; total '+s.cost+'. A valid YES witness exists. Minimum cost was not checked.';
    return 'This candidate is rejected: '+reasons[s.reason]+'. This rejection does not prove that no other valid candidate exists.';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,c=last?last.counts:{lengthChecks:0,idChecks:0,endpointChecks:0,repeatChecks:0,edgeChecks:0,costAdds:0,budgetChecks:0};
    $('certificate-widget').dataset.seen=String(seen);$('certificate-widget').dataset.type=last?last.type:'';$('certificate-widget').dataset.phase=state.phase;$('certificate-widget').dataset.dirty=String(dirty);
    $('cert-task').textContent=task.text+' Applied contract: s='+trace.source+', t='+trace.target+', k='+trace.k+', B='+trace.B+'; '+(trace.simple?'repeats forbidden.':'repeats allowed.');
    $('cert-progress').textContent='Revealed step: '+seen+'/'+trace.steps.length+' · Applied candidate: '+(trace.certificate.length?pathText(trace.certificate):'[] · empty list');
    $('cert-draft').textContent=dirty?'The edited candidate/budget has not been applied. Use Apply candidate to continue.':'The displayed trace belongs to the applied candidate and budget.';
    const cards=$('cert-records');cards.replaceChildren();
    trace.certificate.forEach((id,index)=>{const card=el('article');card.className='cert-card';card.dataset.index=String(index);card.dataset.id=String(id);card.dataset.current=String(state.index===index&&!state.done);card.dataset.violation=String(Boolean(state.violation&&state.violation.index===index));const known=index<state.checkedIds.length;card.dataset.known=String(known);card.append(el('h5','Position '+(index+1)+' · device '+id));card.append(el('p',state.violation&&state.violation.index===index?'Rejected at this position: '+reasons[state.violation.reason]:known?'ID verified in the graph.':'ID not checked yet.'));cards.append(card);});
    if(!trace.certificate.length)cards.append(el('p','Candidate []: no entries. Even for k=0, include the source position.'));
    const active=$('cert-active');active.replaceChildren(el('h4','Current condition'));
    active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';active.dataset.total=String(state.total);active.dataset.checkedEdges=String(state.checkedEdges.length);active.dataset.unique=state.uniqueIds.join(',');
    if(state.activeEdge){const a=state.activeEdge;active.append(el('p','Edge: '+a.from+' → '+a.to));active.append(el('p',a.exists?'Real cost: '+a.weight+(last.type==='add'?' · added to the total.':' · not added to the total yet.'):'This link is absent from the graph; no cost is shown.'));}
    else if(last)active.append(el('p',describe(last)));
    else active.append(el('p','No checks have been revealed. What should the first condition be?'));
    active.append(el('p','Repeat set: '+(state.uniqueIds.length?state.uniqueIds.join(', '):'still empty')+(trace.simple?'':' · this check does not apply in walk mode.')));
    $('cert-cost').textContent='Cost actually added so far: '+state.total+' · The complete candidate cost is known only after every edge has been checked and added.';
    $('cert-cost').dataset.total=String(state.total);
    $('cert-count').textContent='Length: '+c.lengthChecks+' · IDs: '+c.idChecks+' · Endpoints: '+c.endpointChecks+' · Repeats: '+c.repeatChecks+' · Edges: '+c.edgeChecks+' · Additions: '+c.costAdds+' · Budget: '+c.budgetChecks;
    $('cert-status').textContent=last?describe(last):'Length, IDs, endpoints, repeats, edges, and budget. Predict the next condition, then reveal it.';
    ['cert-next','cert-stage','cert-end'].forEach(id=>{$(id).disabled=state.done||dirty;});
    const result=$('cert-result');result.dataset.accepted=state.done?String(trace.result.accepted):'pending';result.dataset.reason=state.done?trace.result.reason:'';result.dataset.cost=state.done?(trace.result.cost===null?'null':String(trace.result.cost)):'pending';
    result.textContent=!state.done?'Checking this candidate is not finished. Unrevealed checks have not passed.':trace.result.accepted?'Candidate accepted. '+(trace.simple?'It is a YES witness for this input of L.':'It is a YES witness under the walk contract allowing repeats; L’s no-repeat rule was not applied.')+' Total '+trace.result.cost+'. Neither minimum cost nor a general fast solver was proved.':'This candidate is rejected: '+reasons[trace.result.reason]+'. '+(trace.result.cost===null?'The edge phase did not finish; the complete cost was not calculated.':'The candidate’s complete cost is '+trace.result.cost+'.')+' This does not imply that no other valid candidate exists.';
    const history=$('cert-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#cert-history-details summary').textContent='Revealed checks ('+seen+')';
  }
  function loadedTrace(path,B){
    trace=model.traceCertificate(vertices,edges,task.source,task.target,task.k,B,path,{simple:task.simple});seen=0;dirty=false;$('cert-input-error').textContent='';$('cert-input').removeAttribute('aria-invalid');$('cert-budget').removeAttribute('aria-invalid');$('cert-input').value=path.join(',');$('cert-budget').value=String(B);render();
  }
  function selectCase(){task=cases[$('cert-case').value];loadedTrace(task.path,task.B);}
  function markDirty(){dirty=true;$('cert-input-error').textContent='';$('cert-input').removeAttribute('aria-invalid');$('cert-budget').removeAttribute('aria-invalid');render();}
  $('cert-case').addEventListener('change',selectCase);$('cert-input').addEventListener('input',markDirty);$('cert-budget').addEventListener('input',markDirty);$('cert-budget').addEventListener('change',markDirty);
  $('cert-apply').addEventListener('click',()=>{
    const raw=$('cert-input').value.trim();let path=[];
    if(raw!==''&&!/^[+-]?\d+(?:(?:\s*,\s*|\s*→\s*|\s+)[+-]?\d+)*$/.test(raw)){inputError('cert-input','Separate IDs with commas, spaces, or →; do not use decimal fractions or text.');return;}
    if(raw!=='')path=raw.split(/\s*(?:,|→)\s*|\s+/).map(Number);
    if(path.length>64||path.some(n=>!Number.isSafeInteger(n))){inputError('cert-input','Use at most 64 entries and safe-integer IDs.');return;}
    const budget=$('cert-budget'),budgetRaw=budget.value.trim(),B=Number(budgetRaw);
    if(!/^\d+$/.test(budgetRaw)||!budget.validity.valid||!Number.isSafeInteger(B)||B<0){inputError('cert-budget','Enter a nonnegative integer B within the safe range.');return;}
    loadedTrace(path,B);
  });
  function inputError(id,message){$(id).setAttribute('aria-invalid','true');$('cert-input-error').textContent=message;$('cert-input-error').dataset.state='error';$(id).focus();}
  $('cert-next').addEventListener('click',()=>{if(!dirty&&seen<trace.steps.length){seen++;render();}});
  $('cert-stage').addEventListener('click',()=>{if(dirty)return;while(seen<trace.steps.length){const step=trace.steps[seen++];if(['length','endpoint','add','budget','accept','reject'].includes(step.type)||(['id','repeat'].includes(step.type)&&(step.passed===false||step.index===trace.certificate.length-1)))break;}render();});
  $('cert-end').addEventListener('click',()=>{if(!dirty){seen=trace.steps.length;render();}});
  $('cert-reset').addEventListener('click',()=>loadedTrace(trace.certificate,trace.B));
  function number(id){const input=$(id),raw=input.value.trim(),n=Number(raw),valid=raw!==''&&!input.validity.badInput&&Number.isSafeInteger(n)&&n>=0&&n<=100;input.setAttribute('aria-invalid',String(!valid));return{id,value:n,valid};}
  function feedback(id,text,error){$(id).textContent=text;$(id).dataset.state=error?'error':'ok';}
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const cost=number('guided-cost'),count=number('guided-edges'),invalid=[cost,count].find(x=>!x.valid);
    if(invalid){feedback('guided-feedback','Fill both boxes with integers from 0–100.',true);$(invalid.id).focus();return;}
    const choice=$('guided-claim');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('guided-feedback','Along with the numbers, choose the claim this check proves.',true);choice.focus();return;}
    if(cost.value!==12){feedback('guided-feedback','Add the candidate’s four edge costs: 3+2+2+5. Do not enter the budget instead of the candidate’s cost.',true);return;}
    if(count.value!==4){feedback('guided-feedback','Count transitions between the five device positions. k edges differ from k+1 entries.',true);return;}
    if(choice.value!=='yes'){feedback('guided-feedback','The given candidate meets every condition. Did this check examine alternatives or a general solution algorithm?',true);return;}
    feedback('guided-feedback','Both numbers and the YES-witness claim are correct. Your written reasoning about B=10, minimum cost, and all candidates was not automatically graded; compare it with the solution separately.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const good=model.traceCertificate(independentVertices,independentEdges,18,4,3,6,[18,24,7,4]),bad=model.traceCertificate(independentVertices,independentEdges,18,4,3,6,[18,7,24,4]),reduced=model.transformHamiltonianST(independentVertices,independentEdges.map(([u,v])=>[u,v]),18,4);
    const checks=[{...number('exit-good'),expected:good.result.cost,label:'Y’s cost'},{...number('exit-bad'),expected:bad.result.cost,label:'Z’s cost'},{...number('exit-k'),expected:reduced.k,label:'the transformation’s k value'},{...number('exit-budget'),expected:reduced.B,label:'the unit-weight transformation’s budget'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Fill all four boxes with integers from 0–100.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Revisit: '+wrong.map(x=>x.label).join(', ')+'. Calculate the original edge costs and the unit-weight transformation separately.',true);return;}
    const choice=$('exit-arrow');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('exit-feedback','After the four numbers, choose the reduction arrow’s direction.',true);choice.focus();return;}
    if(choice.value!=='a-to-l'){feedback('exit-feedback','We want to solve the known hard UHAMPATH problem using L’s solver. Which question’s input must we transform first?',true);return;}
    feedback('exit-feedback','All four numbers and the arrow direction are correct. Your written check, class interpretation, and reduction proof must also be assessed using the four criteria.'+(solutionSeen?' The model answer was opened; mark this attempt as after seeing the solution.':' The evidence you produced without seeing the solution is your independent work.'),false);
  });
  function clear(form,id){const run=()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));};form.addEventListener('input',run);form.addEventListener('change',run);}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='The model answer was opened in this session. Assess corrections after seeing the solution separately from the first independent attempt.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(n=>{printed.push([n,n.open]);n.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([n,open])=>{n.open=open;});printed.length=0;});
  selectCase();document.querySelectorAll('details.worked-table').forEach(n=>{n.open=false;});document.querySelectorAll('.js-only').forEach(n=>{n.hidden=false;});document.querySelectorAll('form button').forEach(n=>{n.disabled=false;});
})();
