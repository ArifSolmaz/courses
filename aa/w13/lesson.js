(function () {
  'use strict';
  const model=window.FreshWeek13;
  if(!model||typeof model.traceDP!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,32],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,32,2],[18,24,3],[24,11,3],[24,20,4],[32,26,4],[11,32,5]];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2]];
  const cases={
    main:{vertices,edges,source:24,target:32,k:4,text:'Ana ağ · kaynak 24, hedef 32, tam 4 kenar. Son kenarı eklerken hangi sütunu okumalısın?'},
    none:{vertices,edges,source:24,target:32,k:3,text:'Aynı ağ · kaynak 24, hedef 32, tam 3 kenar. İki kenarlık ucuz cevap bu soruyu çözer mi?'},
    zero:{vertices,edges:edges.map(([u,v])=>[u,v,0]),source:24,target:32,k:4,text:'Bütün kenar bedelleri 0 · kaynak 24, hedef 32, tam 4 kenar. Eşit adayda ilk öncül korunur; erişilemeyen hücre hâlâ ∞.'},
    self:{vertices,edges,source:24,target:24,k:0,text:'Kaynak ve hedef 24 · k=0. Hiç kenar geçmeyen boş yürüyüşü taban hücresinde kontrol et.'},
    wrongzero:{vertices,edges,source:24,target:32,k:0,text:'Kaynak 24, hedef 32 · k=0. Taban kaynak dışında hangi maliyeti verir?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===32&&b===26)),source:24,target:26,k:4,text:'32–26 kenarı kaldırıldı · kaynak 24, hedef 26, k=4. 26 listede ama yalıtık; komşusuz hücreyi nasıl bitirirsin?'},
    return:{vertices,edges,source:24,target:24,k:4,text:'Aynı ağ · kaynak ve hedef 24, tam 4 kenar. Kaynakta başlamak son sütuna ücretsiz 0 yazma hakkı verir mi?'}
  };
  let task,trace,seen=0,viewColumn=0,solutionSeen=false;
  const val=n=>n===null?'∞':String(n);
  const pathText=ids=>ids.join(' → ');
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function describe(s){
    if(s.type==='init')return 'Taban hazır: D['+trace.source+',0]=0; diğer cihazlarda ∞. '+s.counts.initCells+' hücre hazırlandı; bunun '+s.counts.baseCells+' tanesi taban. Diğer sütunlar henüz hesaplanmadı.';
    if(s.type==='start-cell')return 'D['+s.v+','+s.r+'] işleniyor. Geçici minimum ∞; yalnız r='+(s.r-1)+' sütununun komşularını okuyacağız.';
    if(s.type==='inspect')return 'D['+s.u+','+(s.r-1)+']='+val(s.sourceValue)+'; son kenar '+s.u+' → '+s.v+' bedeli '+s.weight+'. '+(s.sourceValue===null?'Önceki hücre erişilemez; sonlu aday yok.':'Aday '+s.sourceValue+'+'+s.weight+'='+s.candidate+'. '+({improve:'Daha ucuz; hücre bir sonraki güncellemede değişecek.',equal:'Eşit; ilk öncülü koru.',worse:'Daha pahalı; mevcut hücreyi koru.'}[s.outcome]));
    if(s.type==='update')return 'D['+s.v+','+s.r+']: '+val(s.previousValue)+' → '+s.value+'. P['+s.v+','+s.r+']='+s.u+' kaydedildi. Hücrenin kalan komşuları henüz bitmemiş olabilir.';
    if(s.type==='finish-cell')return 'D['+s.v+','+s.r+'] tamamlandı: '+val(s.value)+'. '+(s.parent===null?'Öncül yok.':'Öncül '+s.parent+'.');
    if(s.type==='finish-column')return 'r='+s.r+' sütununun bütün cihazları hazır. '+(s.r<trace.k?'Sonraki sütun yalnız bu sütunu okuyabilir.':'İstenen son sütun bitti; şimdi hedefin öncüllerini izle.');
    if(s.type==='path-start')return s.found?'D['+s.target+','+s.k+'] sonlu: '+s.value+'. Geriye kurma ('+s.target+','+s.k+') hücresinden başlar.':'D['+s.target+','+s.k+']=∞. Bu tam kenar sayısı için yürüyüş yok; öncül izlemeye başlamıyoruz.';
    if(s.type==='path-step')return '('+s.from+','+s.fromColumn+') hücresinin öncülü '+s.to+'. Geriye bir kenar: ('+s.to+','+s.toColumn+'). Cihaz tekrarı serbest; sütun bir azalır.';
    return 'Tablo ve öncül takibi tamamlandı. '+(s.found?'Tam '+trace.k+' kenarlı en ucuz bir yürüyüş hazır.':'Bu hedef ve k için yürüyüş yok.');
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
    const table=$('dp-matrix');table.replaceChildren(el('caption','Açılan D[v,r] ve P[v,r] hücreleri'));
    const head=el('thead'),header=el('tr'),vhead=el('th','Cihaz');vhead.scope='col';header.append(vhead);
    for(let r=0;r<=trace.k;r++){const th=el('th','r='+r);th.scope='col';header.append(th);}head.append(header);table.append(head);
    const body=el('tbody');
    state.rows.forEach(row=>{const tr=el('tr'),th=el('th',String(row.id));th.scope='row';tr.append(th);for(let r=0;r<=trace.k;r++){const td=el('td'),cell=decorateCell(td,row,r,state);td.append(el('span',cell.status==='pending'?'·':val(cell.value)));td.append(el('small',cell.status==='pending'?'bekliyor':cell.status==='working'?'işleniyor · P '+(cell.parent===null?'yok':cell.parent):'P '+(cell.parent===null?'yok':cell.parent)));tr.append(td);}body.append(tr);});
    table.append(body);
    const cards=$('dp-cards');cards.replaceChildren();
    state.rows.forEach(row=>{const card=el('article');card.className='dp-card';const cell=decorateCell(card,row,viewColumn,state);card.append(el('h5','Cihaz '+row.id+' · r='+viewColumn));card.append(el('p','D = '+(cell.status==='pending'?'· · henüz hesaplanmadı':val(cell.value)+(cell.status==='working'?' · işleniyor':' · tamamlandı'))));card.append(el('p','P = '+(cell.parent===null?'yok':cell.parent)));cards.append(card);});
    $('dp-column').value=String(viewColumn);
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,c=last?last.counts:{initCells:0,baseCells:0,computedCells:0,scans:0,finiteCandidates:0,improvements:0,pathEdges:0};
    $('dp-task').textContent=task.text;
    $('dp-progress').textContent='Kaynak '+trace.source+' · Hedef '+trace.target+' · k='+trace.k+' · Açılan adım: '+seen+'/'+trace.steps.length;
    $('dp-widget').dataset.seen=String(seen);$('dp-widget').dataset.type=last?last.type:'';$('dp-widget').dataset.phase=state.phase;$('dp-widget').dataset.column=state.column===null?'null':String(state.column);
    renderMatrix(state);
    const active=$('dp-active');active.replaceChildren(el('h4','Okuma ve yazmayı ayır'));
    if(state.activeCandidate){const a=state.activeCandidate;active.append(el('p','Oku: D['+a.from+','+(a.r-1)+'] = '+val(a.sourceValue)));active.append(el('p','Son kenar: '+a.from+' → '+a.to+' · bedel '+a.weight));active.append(el('p',a.sourceValue===null?'Sonlu aday üretilemez.':'Aday: '+a.sourceValue+' + '+a.weight+' = '+a.candidate));const row=state.rows.find(row=>row.id===a.to);active.append(el('p','Yazılan hücre: D['+a.to+','+a.r+'] = '+val(row.values[a.r])+' · '+(last.type==='update'?'iyileştirme uygulandı.':'aday henüz uygulanmadı; eşit/pahalı adayda değişmez.')));}
    else if(state.current)active.append(el('p','D['+state.current.vertex+','+state.current.r+'] için önceki sütunun komşularını dene.'));
    else active.append(el('p',state.phase==='idle'?'Henüz taban açılmadı.':state.phase==='base'?'Taban hazır; sonraki sütun r=1.':state.phase==='path'||state.done?'Tablo hesaplaması bitti; öncül sütunlarına dön.':'Sütunun tamamlanan hücreleri sonraki hesaplamaya hazır.'));
    $('dp-count').textContent='Hazırlanan D hücresi: '+c.initCells+' (taban '+c.baseCells+' dahil) · Geçişle biten: '+c.computedCells+' · Komşu taraması: '+c.scans+' · Sonlu aday: '+c.finiteCandidates+' · Sıkı iyileştirme: '+c.improvements+' · Öncül adımı: '+c.pathEdges;
    $('dp-status').textContent=last?describe(last):'Henüz hiçbir hücre açılmadı. Sıfır kenarda nerede ve hangi maliyette olabilirsin?';
    $('dp-path').dataset.path=state.reversePath.join(',');$('dp-path').dataset.cursor=state.cursor?state.cursor.vertex+','+state.cursor.r:'';
    $('dp-path').textContent=state.reversePath.length?state.reversePath.map((id,i)=>'('+id+','+(trace.k-i)+')').join(' ← '):(state.phase==='path'||state.done?'Son hücre erişilemez; öncül zinciri yok.':'Öncül takibi tablo bitince başlayacak.');
    $('dp-result').dataset.cost=state.done?(trace.result.bestCost===null?'null':String(trace.result.bestCost)):'pending';$('dp-result').dataset.path=state.done&&trace.result.bestPath?trace.result.bestPath.join(','):'';
    $('dp-result').textContent=!state.done?'Tabloyu ve öncül takibini tamamla. Son yürüyüş bu alanda tamamlanınca açılır.':trace.result.found?'Tam '+trace.k+' kenarlı en ucuz bir yürüyüş: '+pathText(trace.result.bestPath)+' · maliyet '+trace.result.bestCost+' birim.':'Kaynak '+trace.source+' → hedef '+trace.target+' için tam '+trace.k+' kenarlı yürüyüş yok. Başka k için ayrı sütuna bakmak gerekir.';
    ['dp-next','dp-stage','dp-end'].forEach(id=>{$(id).disabled=state.done;});
    const history=$('dp-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#dp-history-details summary').textContent='Açılan adımlar ('+seen+')';
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
    if(invalid){feedback('guided-feedback','İki kutuyu 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    if(cost.value!==10){feedback('guided-feedback','Üç aday toplamını kur: 7+5, 8+2, 10+4. En küçüğünü seç.',true);return;}
    if(parent.value!==20){feedback('guided-feedback','Minimumu hangi komşudan gelen son kenar verdi? Kimliği kaydet; kenar bedelini değil.',true);return;}
    feedback('guided-feedback','İki sayı doğru. Geçiş, sütun ve ∞ gerekçeni çözümle ayrıca karşılaştır; yazılı açıklaman otomatik puanlanmadı.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDP(independentVertices,independentEdges,18,4,5);
    const checks=[{...number('exit-cost'),expected:expected.result.bestCost,label:'en küçük maliyet'},{...number('exit-cells'),expected:expected.counts.initCells,label:'taban dahil D hücresi'},{...number('exit-scans'),expected:expected.counts.scans,label:'bütün komşu taraması'},{...number('exit-edges'),expected:expected.counts.pathEdges,label:'öncül adımı'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Dört kutuyu 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Yeniden bak: '+wrong.map(x=>x.label).join(', ')+'. Tam beş kenarı, V(k+1) hücreyi ve her sütunda iki yönlü komşu girişlerini say.',true);return;}
    feedback('exit-feedback','Dört sayı doğru. Bu kontrol yazılı tablonun, öncül zincirinin ve gerekçenin doğruluğunu ölçmedi; dört ölçütle ayrıca değerlendir.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin tablo ve gerekçe bağımsız kanıttır.'),false);
  });
  function clear(form,id){const run=()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));};form.addEventListener('input',run);form.addEventListener('change',run);}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Bundan sonraki düzeltmeleri ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();

