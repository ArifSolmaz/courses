(function () {
  'use strict';
  const model=window.FreshWeek12;
  if(!model||typeof model.traceWalks!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2]];
  const cases={
    main:{vertices,edges,source:24,target:31,k:4,text:'Ana ağ; kaynak24, hedef31, tam4 kenar. İlk12 maliyetli aday son söz mü? Hedefe erken geldiğinde kalan r’ye bak.'},
    two:{vertices,edges,source:24,target:31,k:2,text:'Aynı ağ, kaynak24/hedef31; yalnız k=2. Kâğıttaki küçük ağacın bütün sekiz terminalini karşılaştır.'},
    none:{vertices,edges,source:24,target:31,k:3,text:'Aynı ağ, kaynak24/hedef31; k=3. Cihazlar bağlantılı olsa da bu tam kenar sayısında çözüm var mı?'},
    zero:{vertices,edges:edges.map(([u,v])=>[u,v,0]),source:24,target:31,k:4,text:'Aynı ağın bütün kenar bedelleri0 oldu; kaynak24/hedef31,k=4. Bir geçerli0 adaydan sonra eşit bedelli iç dalları neden atlayabiliriz?'},
    self:{vertices,edges,source:24,target:24,k:0,text:'Kaynak ve hedef24, k=0. Hiç kenar geçmeden boş yürüyüş geçerli. Bu örnekte şeklin hedef31 açıklaması kullanılmıyor.'},
    wrongzero:{vertices,edges,source:24,target:31,k:0,text:'Kaynak24, hedef31,k=0. Kök terminaldir ama hedefte değil. Boş yürüyüş bu hedefe cevap olabilir mi?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===31&&b===26)),source:24,target:26,k:4,text:'31–26 kaldırıldı; kaynak24, hedef26,k=4. 26 listede var ama yalıtık. Tam arama bittiğinde sonucu açıkla.'}
  };
  Object.values(cases).forEach(task=>{task.text=task.text.replace(/(kaynak|Kaynak|hedef|hedefi|bedelleri|geçerli|adaydan sonra eşit bedelli iç dalları neden atlayabiliriz)(\d)/g,'$1 $2').replace('tam4','tam 4').replace('İlk12','İlk 12').replace('hedef24','hedef 24').replace('hedef31','hedef 31').replace('geçerli0','geçerli 0');});
  let task,trace,fullTrace,seen=0,solutionSeen=false;
  function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function pathText(ids){return ids.join(' → ');}
  function val(n){return n===null?'yok':String(n);}
  function describe(step){
    if(step.type==='enter')return 'Çağrı '+step.node.id+': cihaz '+step.node.vertex+', r='+step.node.remaining+', c='+step.node.cost+'. Önek '+pathText(step.node.path)+'. '+(step.node.remaining===0?'Terminal kontrolünü söyle.':'Sıradaki kararı söyle; hedefe erken varmak durdurmaz.');
    if(step.type==='choose')return step.from+' → '+step.to+' seçimi: kenar '+step.weight+'; çocukta r='+step.nextRemaining+', c='+step.nextCost+'. Çocuk henüz çağrılmadı; sonraki adımda yığına girecek.';
    if(step.type==='terminal')return 'Çağrı '+step.nodeId+' için r=0. '+(step.valid?'Hedefte, geçerli aday; maliyet '+step.cost+'. '+(step.improves?'Daha ucuz; henüz en iyi kayıt değişmedi.':'Mevcut en iyiyi iyileştirmiyor; kayıt korunur.'):'Hedefte değil; geçersiz terminal.');
    if(step.type==='record')return 'Geçerli aday kaydedildi: en iyi '+val(step.previousBest)+' → '+step.bestCost+'. Yürüyüş '+pathText(step.path)+'. Arama henüz tamamlanmadı.';
    if(step.type==='prune')return 'Çağrı '+step.nodeId+' budandı: c='+step.cost+' ≥ B='+step.bound+'. Kalan bedeller negatif değil; bu iç dal daha ucuz tamamlanamaz. Eşit optimumları listelemiyoruz.';
    if(step.type==='deadend')return 'Çağrı '+step.nodeId+': r>0 ama komşu yok. Kalan geçiş tamamlanamaz; geri dön.';
    if(step.type==='return')return 'Çağrı '+step.nodeId+' bitti ve yığından çıktı. '+(step.state.current===null?'Köke dönüş de tamamlandı.':'Ebeveyn çağrı '+step.state.current+' sıradaki komşusundan devam edecek.');
    return 'Bütün açık çağrılar döndü; arama tamamlandı. Sonuç artık minimumluk raporuyla açılabilir.';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=state.done;
    const c=last?last.counts:{calls:0,extensions:0,terminals:0,valid:0,improvements:0,prunes:0,returns:0};
    $('walk-task').textContent=task.text+' Budama '+(trace.prune?'açık.':'kapalı.');
    $('walk-progress').textContent='Kaynak '+trace.source+' · Hedef '+trace.target+' · k='+trace.k+' · Açılan adım: '+seen+'/'+trace.steps.length;
    const active=$('walk-active');active.replaceChildren();active.dataset.type=last?last.type:'';active.dataset.current=state.current===null?'':String(state.current);active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';
    active.append(el('h4','Şimdiki karar'));
    if(state.activeEdge){const p=el('p',state.activeEdge.from+' → '+state.activeEdge.to+' · bedel '+state.activeEdge.weight);p.className='candidate-edge';active.append(p);active.append(el('p','Çocukta kalan '+last.nextRemaining+' kenar · toplam '+last.nextCost+' birim. Henüz çocuğa girilmedi.'));}
    else if(state.current!==null){const f=state.stack.find(f=>f.id===state.current);active.append(el('p','Çağrı '+f.id+' · cihaz '+f.vertex+' · r='+f.remaining+' · c='+f.cost));active.append(el('p','Önek: '+pathText(f.path)));}
    else active.append(el('p',done?'Açık çağrı kalmadı.':'Henüz kök çağrı açılmadı.'));
    const stack=$('walk-stack');stack.replaceChildren();
    if(!state.stack.length){const p=el('p','Yığın boş.');p.className='board-empty';stack.append(p);}
    state.stack.forEach(f=>{const card=el('article');card.className='stack-card';card.dataset.id=String(f.id);card.dataset.vertex=String(f.vertex);card.dataset.remaining=String(f.remaining);card.dataset.cost=String(f.cost);card.dataset.path=f.path.join(',');card.dataset.depth=String(f.depth);card.append(el('h5','Çağrı '+f.id+' · cihaz '+f.vertex));card.append(el('p','r = '+f.remaining+' · c = '+f.cost+' · derinlik '+f.depth));card.append(el('p',pathText(f.path)));stack.append(card);});
    $('walk-best').dataset.cost=state.bestCost===null?'null':String(state.bestCost);$('walk-best').dataset.path=state.bestPath?state.bestPath.join(','):'';
    $('walk-best').textContent=state.bestCost===null?'Henüz geçerli aday kaydedilmedi. Bu, maliyet 0 demek değil.':'Geçici en iyi: '+state.bestCost+' birim · '+pathText(state.bestPath)+'.';
    $('walk-count').textContent='Çağrı: '+c.calls+' · Uzatma: '+c.extensions+' · Terminal: '+c.terminals+' · Görülen geçerli: '+c.valid+' · Sıkı iyileştirme: '+c.improvements+' · Budama: '+c.prunes+' · Geri dönüş: '+c.returns;
    $('walk-status').textContent=last?describe(last):'Kökün cihazını, kalan kenarını ve maliyetini söyle. Henüz çağrı açılmadı.';
    ['walk-next','walk-decision','walk-end'].forEach(id=>{$(id).disabled=done;});
    if(!done){$('walk-result').textContent='Arama henüz bitmedi. Ara en iyi adayın minimumluğu, bütün kalan dallar işlenmeden veya güvenle budanmadan kesinleşmez.';$('walk-compare').textContent='';}
    else{
      $('walk-result').textContent=trace.result.found?'Tam '+trace.k+' kenarlı en ucuz bir yürüyüş: '+pathText(trace.result.bestPath)+' · maliyet '+trace.result.bestCost+' birim.':'Kaynak '+trace.source+' → hedef '+trace.target+' için tam '+trace.k+' kenarlı yürüyüş yok. Bu, her kenar sayısında veya bütün hedeflere erişim yok demek değildir.';
      $('walk-compare').textContent='Budamasız tam ağaç: '+fullTrace.counts.calls+' çağrı, '+fullTrace.counts.terminals+' terminal, '+fullTrace.counts.valid+' geçerli. '+(trace.prune?'Bu budamalı koşuda gerçekten görülen: '+c.calls+' çağrı, '+c.terminals+' terminal, '+c.valid+' geçerli; '+c.prunes+' iç dal budandı. Budanan dallardaki adaylar sayılmadı.':'Bu koşuda bütün terminal yürüyüşler görüldü. Budamayı açıp aynı minimumu ve değişen işi karşılaştır.');
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
    const labels={open:'Açık çağrı',expanded:'Çocukları bitti',valid:'Geçerli terminal',invalid:'Hedefte olmayan terminal',pruned:'İç dal budandı',deadend:'Komşu yok; r tamamlanmadı'};
    opened.forEach(f=>{const li=el('li');li.className='choice-node';li.dataset.id=String(f.id);li.dataset.parent=f.parentId===null?'null':String(f.parentId);li.dataset.vertex=String(f.vertex);li.dataset.remaining=String(f.remaining);li.dataset.cost=String(f.cost);li.dataset.path=f.path.join(',');li.dataset.status=f.status;li.dataset.returned=String(f.returned);li.style.setProperty('--depth',String(f.depth));if(f.id===state.current)li.classList.add('is-active');li.append(el('strong','Çağrı '+f.id+' · cihaz '+f.vertex+' · derinlik '+f.depth));li.append(el('p','r='+f.remaining+' · c='+f.cost+' · '+labels[f.status]+(f.returned?' · döndü':'')));li.append(el('p',pathText(f.path)));tree.append(li);});
    if(!opened.size){const p=el('li','Henüz çağrı yok.');p.className='board-empty';tree.append(p);}
    document.querySelector('#walk-tree-details summary').textContent='Açılan seçim ağacı ('+opened.size+' çağrı)';
    const history=$('walk-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#walk-history-details summary').textContent='Açılan bütün adımlar ('+seen+')';
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
    if(invalid){feedback('guided-feedback','İki kutuyu belirtilen aralıkta tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const choice=$('guided-decision');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('guided-feedback','İki sayıdan sonra bu iç dal için kararını seç.',true);choice.focus();return;}
    if(cost.value!==10){feedback('guided-feedback','Önekte üç geçiş var: 4+2+4. Sonraki kenarın bedeli henüz ödenmedi.',true);return;}
    if(remaining.value!==1){feedback('guided-feedback','Dört kenar kullanmalısın; önek üç kenar geçti. Cihaz sayısını değil geçişleri say.',true);return;}
    if(choice.value!=='prune'){feedback('guided-feedback','c=10 ve geçerli B=10. Negatif olmayan devam daha ucuz olabilir mi? Yalnız bir optimum arıyoruz.',true);return;}
    feedback('guided-feedback','İki sayı ve budama kararı doğru. Alt sınır, eşitlik ve negatif ağırlık gerekçeni çözümle ayrıca karşılaştır; yazılı açıklaman otomatik puanlanmadı.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceWalks(independentVertices,independentEdges,18,4,5);
    const checks=[{...number('exit-cost',0,100),expected:expected.result.bestCost,label:'en ucuz maliyet'},{...number('exit-terminals',0,100),expected:expected.counts.terminals,label:'terminal sayısı'},{...number('exit-valid',0,100),expected:expected.counts.valid,label:'geçerli aday sayısı'},{...number('exit-calls',0,100),expected:expected.counts.calls,label:'kök dahil çağrı sayısı'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Dört kutuyu da 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Yeniden bak: '+wrong.map(x=>x.label).join(', ')+'. Bu görevde budamasız bütün terminal ve çağrıları say; tam beş kenar sonunda hedef kontrolü yap.',true);return;}
    feedback('exit-feedback','Dört sayı doğru. Bu kontrol yazılı ağacın, yürüyüşlerin, formülün ve gerekçenin doğruluğunu ölçmedi; dört ölçütle ayrıca değerlendir.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin iz ve gerekçe bağımsız kanıttır.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});form.addEventListener('change',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Bundan sonraki düzeltmeleri ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
