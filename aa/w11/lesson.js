(function () {
  'use strict';
  const model=window.FreshWeek11;
  if(!model||typeof model.traceDijkstra!=='function'||typeof model.shortestPath!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,32];
  const edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,32,2],[18,24,3],[24,11,3],[24,20,4],[32,26,4],[11,32,5]];
  const independentVertices=[4,7,18,20,24,26],independentEdges=[[18,7,6],[18,24,2],[24,7,1],[7,26,2],[24,26,7],[26,4,1]];
  const cases={
    main:{vertices,edges,source:24,text:'Kaynak 24; bütün bağlantılar mevcut. Komşular kimlik artan; kuyrukta küçük mesafe, eşitlikte küçük kimlik önce. 32 için ilk bulunan 8 değişir mi?'},
    ties:{vertices,edges,source:24,order:'descending',text:'Kaynak 24, aynı ağ. Yalnız eşit kuyruk mesafelerinde büyük kimlik önce. Öncelik yine küçük mesafe. Son maliyetler ve öncüller nasıl değişir?'},
    source11:{vertices,edges,source:11,text:'Aynı ağ; kaynak artık 11. Şekildeki koyu 24 bu örneğin kaynağı değil. 32’e doğrudan 5 maliyetle gidilebilir; önceki minimum toplam ağdaki 9 maliyetli yolla karşılaştır.'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===32&&b===26)),source:24,text:'Kaynak 24; 32–26 bağlantısı kaldırıldı. 26 cihaz listesinde ama kenarı yok. Ne zaman erişilemez diyeceğiz?'},
    zero:{vertices,edges:edges.map(([a,b,w])=>[a,b,a===7&&b===4?0:w]),source:24,text:'Kaynak 24; yalnız 4–7 maliyeti 0 oldu. Sıfır bedel gerçek kenar; d[4]=d[7] mümkün. Eşit adayda öncülü koru.'},
    single:{vertices:[24],edges:[],source:24,text:'Tek cihaz ve kaynak 24; kenar yok. Kendine boş yol 0 maliyet. Kuyruk çıkarıldıktan sonra bütün ulaşılabilir işler biter.'},
    noedges:{vertices,edges:[],source:24,text:'Sekiz cihaz, kenar yok, kaynak 24. Kaynak için 0; diğerleri ancak kuyruk boşalınca erişilemez diye raporlanır.'}
  };
  let trace,task,seen=0,solutionSeen=false;
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function value(distance){return distance===null?'∞':String(distance);}
  function stepText(step){
    if(step.type==='init')return trace.vertices.length+' mesafe satırı başlatıldı. Kaynak '+trace.source+' için 0; diğerleri ∞. Kaynak kuyruğa eklendi.';
    if(step.type==='settle')return step.vertex+' en küçük '+step.distance+' ile çıkarıldı. Bu mesafe kesin; şimdi komşularına bak.';
    if(step.type==='inspect'){
      const base=step.from+' → '+step.to+' · kenar '+step.weight+'; aday '+step.candidate+', mevcut '+value(step.previousDistance)+'. ';
      if(step.outcome==='settled')return base+'Komşu zaten kesin; kayıt değiştirilmez. Bu bakış tarama sayısına dahildir.';
      if(step.outcome==='improve')return base+'Daha ucuz aday var. Henüz kayıt değişmedi; sonraki adımda d, öncül ve kuyruk güncellenecek.';
      if(step.outcome==='equal')return base+'Eşit; mesafe, öncül ve kuyruk değişmez.';
      return base+'Daha pahalı; kayıt değişmez.';
    }
    if(step.type==='relax')return step.from+' üzerinden '+step.to+' gevşetildi: '+value(step.previousDistance)+' → '+step.distance+'; öncül '+step.from+'. '+(step.queueAction==='insert'?'İlk bulunan cihaz için tek kuyruk kaydı eklendi.':'Mevcut kuyruk anahtarı küçültüldü; ikinci kayıt eklenmedi.');
    if(step.type==='finish')return step.vertex+' için bütün komşuluklar tarandı. Kuyruğun sıradaki en küçüğünü söyle.';
    return 'Kuyruk boş; bütün ulaşılabilir cihazlar kesinleşti. '+(step.unreachable.length?'Erişilemeyenler: '+step.unreachable.join(', ')+'.':'Bütün cihazlara kaynaktan yol var.');
  }
  function path(){
    const target=Number($('dijkstra-target').value),done=seen===trace.steps.length;
    $('dijkstra-path').dataset.target=String(target);$('dijkstra-path').dataset.path='';
    if(!done){$('dijkstra-path').textContent='Bu hedefin son yolu henüz açılmadı. Bütün izi tamamla; hedef değiştirmek adımı ilerletmez.';return;}
    const ids=model.shortestPath(trace,target);$('dijkstra-path').dataset.path=ids?ids.join(','):'';
    $('dijkstra-path').textContent=ids?(ids.length===1?'Kaynak '+trace.source+' için boş yol; maliyet 0.':'Yol: '+ids.join(' → ')+' · toplam '+trace.result.distances[target]+' maliyet birimi.'):'Kaynak '+trace.source+' cihazından '+target+' cihazına yol yok; erişilemez (∞).';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,edgeScans:0,improvements:0,inserts:0,decreases:0,extracts:0};
    $('dijkstra-task').textContent=task.text;
    $('dijkstra-progress').textContent='Kaynak = '+trace.source+' · V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Açılan adım: '+seen+'/'+trace.steps.length;
    const queue=$('dijkstra-queue');queue.replaceChildren();
    if(!state.queue.length){const p=el('p','Kuyruk boş.');p.className='board-empty';queue.append(p);}
    state.queue.forEach(item=>{const chip=el('span',item.id+' : '+item.distance);chip.className='priority-chip';chip.dataset.id=String(item.id);chip.dataset.distance=String(item.distance);queue.append(chip);});
    const active=$('dijkstra-active');active.replaceChildren();active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';active.dataset.type=last?last.type:'';
    active.append(el('h4','Kesinleşen cihaz / incelenen kenar'));
    active.append(el('p',state.current===null?'Etkin cihaz yok.':'Etkin cihaz: '+state.current+' · kesin mesafe '+value(state.rows.find(row=>row.id===state.current).distance)));
    if(state.activeEdge){const p=el('p',state.activeEdge.from+' → '+state.activeEdge.to+' · kenar bedeli '+state.activeEdge.weight);p.className='candidate-edge';active.append(p);active.append(el('p',last.type==='inspect'?'Aday '+last.candidate+' · mevcut '+value(last.previousDistance)+'. Karar: '+(last.outcome==='improve'?'iyileşir; kayıt açılmadı':last.outcome==='equal'?'eşit':last.outcome==='worse'?'daha pahalı':'zaten kesin')+'.':'Yeni kayıt açıldı.'));if(last.type==='relax')active.lastChild.textContent='Yeni mesafe '+last.distance+' · yeni öncül '+last.from+' · '+(last.queueAction==='decrease'?'anahtar küçültme':'ilk ekleme')+'.';}
    else active.append(el('p',done?'Bütün komşuluk taramaları bitti.':'Henüz etkin kenar yok.'));
    const rows=$('dijkstra-rows');rows.replaceChildren();
    state.rows.forEach(row=>{
      const card=el('article');card.className='distance-card';card.dataset.id=String(row.id);card.dataset.distance=row.distance===null?'null':String(row.distance);card.dataset.parent=row.parent===null?'null':String(row.parent);card.dataset.status=row.status;
      if(row.id===state.current)card.classList.add('is-active');
      card.append(el('h4','Cihaz '+row.id));card.append(el('p','d = '+value(row.distance)));card.append(el('p','Öncül: '+(row.parent===null?'—':row.parent)));
      card.append(el('p',row.status==='settled'?'Kesin':row.status==='queued'?'Bekliyor · geçici':done?'Erişilemez':'Henüz bulunmadı'));rows.append(card);
    });
    $('dijkstra-count').textContent='Başlatılan satır: '+counts.initializations+' · Komşuluk taraması: '+counts.edgeScans+' · İyileştirme: '+counts.improvements+' · Kuyruğa ekleme: '+counts.inserts+' · Anahtar küçültme: '+counts.decreases+' · En küçüğü çıkarma: '+counts.extracts;
    $('dijkstra-status').textContent=last?stepText(last):'Henüz adım açılmadı. Kaynağı, ilk mesafeyi ve başlangıç kuyruğunu söyle.';
    $('dijkstra-next').disabled=done;$('dijkstra-end').disabled=done;
    $('dijkstra-result').textContent=!done?'Son rapor henüz açılmadı. ∞ olan cihazları şimdiden erişilemez sayma.':'Kesinleşme sırası: ['+state.order.join(', ')+']. '+(trace.result.unreachable.length?'Erişilemeyenler: ['+trace.result.unreachable.join(', ')+'].':'Bütün cihazlara yol var.')+' Her mesafe seçili kaynağa göredir; bütün kenarların toplamı değildir.';
    path();
    const history=$('dijkstra-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',stepText(step));li.dataset.type=step.type;history.append(li);});
    document.querySelector('#dijkstra-history-details summary').textContent='Açılan bütün adımlar ('+seen+')';
  }
  function reset(){
    task=cases[$('dijkstra-case').value];trace=model.traceDijkstra(task.vertices,task.edges,task.source,{tieOrder:task.order||'ascending'});seen=0;
    const target=$('dijkstra-target');target.replaceChildren();trace.vertices.forEach(id=>{const option=el('option',String(id));option.value=String(id);target.append(option);});target.value=String(trace.vertices.includes(32)?32:trace.source);render();
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
    feedback('negative-feedback',rejected?'Girdi reddedildi: kenar maliyeti −4. Bu Dijkstra gösterimi bütün kenarların negatif olmamasını ister; arama başlatılmadı.':'Beklenen negatif ağırlık reddi oluşmadı; girdi denetimi incelenmeli.',!rejected);
  });
  $('guided-form').addEventListener('submit',event=>{
    event.preventDefault();const distance=number('guided-distance',0,100),parent=number('guided-parent',0,100),invalid=[distance,parent].find(item=>!item.valid);
    if(invalid){feedback('guided-feedback','İki kutuyu da 0–100 arasında tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.',true);$(invalid.id).focus();return;}
    const step=model.traceDijkstra(vertices,edges,24).steps.find(step=>step.type==='relax'&&step.from===20&&step.to===32);
    if(distance.value===step.distance&&parent.value===step.from)feedback('guided-feedback','İki sayı doğru. Aday formülünü, öncül yolunu ve tek kuyruk kaydını çözümle ayrıca karşılaştır; yazılı gerekçen otomatik puanlanmadı.',false);
    else feedback('guided-feedback',distance.value!==step.distance?'Aday yalnız son kenarın bedeli değil: d[20]+w(20,32)=4+2. Bulunan 8 ile karşılaştır.':'Daha ucuz aday 20 üzerinden geldi. Yeni mesafeyle birlikte öncülü de güncelle.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDijkstra(independentVertices,independentEdges,18);
    const checks=[{...number('exit-distance7',0,100),expected:expected.result.distances[7],label:'d[7]'},{...number('exit-distance26',0,100),expected:expected.result.distances[26],label:'d[26]'},{...number('exit-distance4',0,100),expected:expected.result.distances[4],label:'d[4]'},{...number('exit-decreases',0,100),expected:expected.counts.decreases,label:'anahtar küçültme sayısı'}];
    const invalid=checks.find(item=>!item.valid);if(invalid){feedback('exit-feedback','Dört kutuyu da 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Yeniden bak: '+wrong.map(item=>item.label).join(', ')+'. İlk bulunan maliyet geçici; daha ucuz adayda d ve öncül birlikte değişir. İlk eklemeyi anahtar küçültme sayma.',true);return;}
    feedback('exit-feedback','Dört sayı doğru. Bu kontrol yazılı izin, formülün ve gerekçenin doğruluğunu ölçmedi; dört ölçütle ayrıca değerlendir.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin iz ve gerekçe bağımsız kanıttır.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Bundan sonraki düzeltmeleri ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button,#negative-check').forEach(node=>{node.disabled=false;});
})();
