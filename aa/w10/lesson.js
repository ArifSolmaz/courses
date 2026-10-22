(function () {
  'use strict';
  const model=window.FreshWeek10;
  if(!model||typeof model.traceKruskal!=='function'||typeof model.validateForest!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31];
  const edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const independentVertices=[4,7,18,20,24,26],independentEdges=[[18,7,1],[7,24,2],[18,24,3],[24,26,4],[26,4,5],[4,18,6]];
  const cases={
    main:{vertices,edges,text:'Ana yönsüz ağ. Maliyetler artan; eşitlikte küçük uç, sonra büyük uç artan sırada. Bütün 10 adayı işle.'},
    reverse:{vertices,edges,order:'descending',text:'Aynı ağ; yalnız eşit maliyetlerin uç sırası ters. Maliyetler yine küçükten büyüğe. Aynı toplamla farklı kablolar seçilebilir mi?'},
    isolated:{vertices,edges:edges.filter(([a,b])=>!(a===31&&b===26)),text:'31–26 adayını kaldırdık. 26 hâlâ cihaz listesinde; ona hiç kablo adayı yok. Tek ağaç kurabilir miyiz?'},
    split:{vertices,edges:edges.filter(([a,b])=>!(a===24&&b===20)&&!(a===11&&b===31)),text:'20–24 ve 11–31 adaylarını kaldırdık. İki ayrı giriş bileşeni var; her birinin minimum ağını bul.'},
    single:{vertices:[18],edges:[],text:'Tek cihaz 18, aday yok. Bütün cihazları kapsamak için sıfır kablo yeterli.'},
    noedges:{vertices,edges:[],text:'Sekiz cihaz, hiç aday yok. Cihazları silmeden kopuk sonucu raporla.'},
    zero:{vertices,edges:edges.map(([a,b,w])=>[a,b,a===7&&b===4?0:w]),text:'Yalnız 4–7 maliyeti 0 oldu. Sıfır maliyetli aday yok sayılmaz; seçimi ve toplamı yeniden kur.'}
  };
  let trace,task,seen=0,solutionSeen=false;
  function el(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function list(ids){return '['+ids.join(', ')+']';}
  function edgeText(edge){return edge.u+'–'+edge.v+' · maliyet '+edge.weight;}
  function stepText(step){
    if(step.type==='init')return trace.vertices.length+' cihazı ayrı bileşen olarak başlat. Henüz kablo seçilmedi; toplam 0.';
    if(step.type==='consider')return edgeText(step.edge)+'. Uç etiketleri '+step.componentU+' ve '+step.componentV+'. '+(step.componentU===step.componentV?'Aynı bileşen; seçili yolu ve kapanacak çevrimi söyle.':'Farklı bileşenler; seçersek hangi gruplar birleşecek?');
    if(step.type==='accept')return edgeText(step.edge)+' seçildi. İki bileşen '+step.mergedComponent+' etiketinde birleşti. Bütün '+trace.vertices.length+' etiket satırı tarandı; toplam '+step.state.total+'.';
    if(step.type==='reject')return edgeText(step.edge)+' elendi. Uçlar zaten seçili bir yolla bağlı: '+step.cycle.join(' → ')+'. Bileşen ve maliyet toplamı değişmedi; birleşme taraması yapılmadı.';
    return 'Bütün adaylar işlendi. '+(step.connected?'Cihazların tümü tek bileşende; minimum kapsayan ağaç hazır.':'Girdi kopuk; her giriş bileşeni için minimum ağaçtan oluşan orman hazır.');
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,edgeChecks:0,merges:0,rejections:0,labelScans:0};
    $('kruskal-task').textContent=task.text;
    $('kruskal-progress').textContent='V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Açılan adım: '+seen+'/'+trace.steps.length;
    const candidate=$('kruskal-candidate');candidate.replaceChildren();candidate.append(el('h4','Sıradaki karar · kenar ve bileşen etiketleri'));
    candidate.dataset.edge=state.activeEdge?state.activeEdge.id:'';candidate.dataset.decision=state.decision||'';
    if(state.activeEdge){
      const p=el('p',edgeText(state.activeEdge));p.className='candidate-edge';candidate.append(p);
      const beforeU=last.componentU??state.rows.find(row=>row.id===state.activeEdge.u).component,beforeV=last.componentV??state.rows.find(row=>row.id===state.activeEdge.v).component;
      candidate.append(el('p','Karar öncesi etiketler: '+beforeU+' / '+beforeV));
      candidate.append(el('p',state.decision==='pending'?'Karar henüz açılmadı. Önce seç mi, ele mi söyle.':state.decision==='accept'?'Seçildi · iki ayrı grup birleşti.':'Elendi · aynı grupta çevrim kapatır.'));
    }else candidate.append(el('p',done?'Aday kalmadı.':'Henüz kenara bakılmadı.'));
    const groups=$('kruskal-components');groups.replaceChildren();
    state.components.forEach(ids=>{
      const card=el('article');card.className='component-card';card.dataset.label=String(ids[0]);card.dataset.members=ids.join(',');
      if(state.activeEdge&&(ids.includes(state.activeEdge.u)||ids.includes(state.activeEdge.v)))card.classList.add('is-touched');
      card.append(el('h4','Bileşen etiketi '+ids[0]));const members=el('div');members.className='members';
      ids.forEach(id=>{const chip=el('span',String(id));chip.className='member-chip';chip.dataset.id=String(id);members.append(chip);});card.append(members);groups.append(card);
    });
    $('kruskal-total').textContent='Bileşen sayısı: '+state.components.length+' · Seçili kenar: '+state.selected.length+' · Toplam kurulum maliyeti: '+state.total+' birim';
    const chosen=$('kruskal-selected');chosen.replaceChildren();chosen.append(el('h4','Şu ana kadar seçilen kablolar'));
    const chips=el('div');chips.className='edge-chips';
    if(!state.selected.length){const p=el('p','Henüz seçili kablo yok.');p.className='board-empty';chosen.append(p);}
    state.selected.forEach(edge=>{const chip=el('span',edgeText(edge));chip.className='edge-chip';chip.dataset.id=edge.id;chips.append(chip);});chosen.append(chips);
    $('kruskal-cycle').textContent=state.cycle?'Seçili yol + elenen kenar: '+state.cycle.join(' → ')+'. Bu kapalı zincir çevrim tanığıdır.':'';
    $('kruskal-count').textContent='Başlatılan satır: '+counts.initializations+' · İncelenen kenar: '+counts.edgeChecks+' · Birleştirme: '+counts.merges+' · Ret: '+counts.rejections+' · Birleşmelerde etiket satırı taraması: '+counts.labelScans;
    $('kruskal-status').textContent=last?stepText(last):'Henüz adım açılmadı. En ucuz aday ve başlangıç bileşenlerini söyle.';
    $('kruskal-next').disabled=done;$('kruskal-end').disabled=done;
    if(!done)$('kruskal-result').textContent='Bütün adaylar henüz işlenmedi. Bu bir ara orman; bu gösterimin son maliyet ve bağlılık raporu tamamlanınca açılır.';
    else $('kruskal-result').textContent=trace.result.connected?'Bütün '+trace.vertices.length+' cihaz tek bileşende. Minimum kapsayan ağaç: '+state.selected.length+' kenar, toplam '+state.total+' birim. Eşitliklerde başka minimum ağaçlar da olabilir.':'Mevcut adaylarla bütün cihazları tek ağda bağlamak mümkün değil. Minimum kapsayan orman: '+state.components.length+' bileşen, '+state.selected.length+' kenar, toplam '+state.total+' birim; yalıtılmış cihazlar da dahil.';
    const sorted=$('kruskal-sorted');sorted.replaceChildren();
    trace.sortedEdges.forEach(edge=>{
      const status=state.selected.some(item=>item.id===edge.id)?'selected':state.rejected.some(item=>item.id===edge.id)?'rejected':state.activeEdge&&state.activeEdge.id===edge.id?'examining':'waiting';
      const label=status==='selected'?' · seçildi':status==='rejected'?' · elendi':status==='examining'?' · inceleniyor':'';
      const li=el('li',edgeText(edge)+label);li.dataset.id=edge.id;li.dataset.state=status;sorted.append(li);
    });
    if(!trace.sortedEdges.length)sorted.append(el('li','Kablo adayı yok.'));
    const history=$('kruskal-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',stepText(step));li.dataset.type=step.type;if(step.edge)li.dataset.edge=step.edge.id;history.append(li);});
    document.querySelector('#kruskal-history-details summary').textContent='Açılan bütün adımlar ('+seen+')';
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
    if(invalid){feedback('guided-feedback','İki kutuyu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.',true);$(invalid.id).focus();return;}
    const rejected=model.traceKruskal(vertices,edges).steps.find(step=>step.type==='reject'&&step.edge.id==='7-11').state;
    if(components.value===rejected.components.length&&total.value===rejected.total)feedback('guided-feedback','İki sayı da doğru. Seç/ele kararını, ortak etiketi ve çevrim yolunu ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.',false);
    else feedback('guided-feedback',components.value!==rejected.components.length?'7 ve 11 zaten {4,7,11} içinde. Aynı gruba giden kenar iki ayrı bileşeni birleştirmez.':'Yalnız seçilen 4–7 ve 4–11 maliyetlerini topla. Elenen kenarın maliyeti kuruluma eklenmez.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceKruskal(independentVertices,independentEdges);
    const checks=[{...number('exit-selected',0,32),expected:expected.result.selected.length,label:'seçili kenar sayısı'},{...number('exit-total',0,100),expected:expected.result.total,label:'kurulum toplamı'},{...number('exit-components',1,32),expected:expected.result.componentCount,label:'son bileşen sayısı'},{...number('exit-scans',0,1024),expected:expected.counts.labelScans,label:'etiket satırı taraması'}];
    const invalid=checks.find(item=>!item.valid);if(invalid){feedback('exit-feedback','Dört kutuyu da belirtilen aralıkta tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const ids=parseEdges($('exit-edges').value),validation=model.validateForest(independentVertices,independentEdges,ids);
    $('exit-edges').setAttribute('aria-invalid',String(validation.reason==='not-edge-set'));
    if(validation.reason==='not-edge-set'){feedback('exit-feedback','Yalnız bu ağın aday kenarlarını yaz; uçları kısa çizgiyle, kenarları virgülle veya boşlukla ayır. Eksik biçim, yinelenen veya bilinmeyen kenar var.',true);$('exit-edges').focus();return;}
    if(validation.reason==='cycle'){feedback('exit-feedback','Seçiminde '+validation.violatingEdge+' çevrim kapatıyor. Aynı seçili bileşenin içindeki kenarı yeniden düşün.',true);return;}
    if(validation.reason==='not-spanning'){feedback('exit-feedback','Seçimin girişte bağlanabilen bir parçayı eksik bırakıyor. '+validation.violatingEdge+' uçları hâlâ ayrı; bütün giriş bileşenlerini kapsa. 20 tek başına kalabilir.',true);return;}
    if(validation.reason==='not-minimum'){feedback('exit-feedback','Seçimin parçaları kapsıyor ama toplamı minimum değil. '+validation.violatingEdge+' ile daha ucuz bir değiş tokuş mümkün; pahalı seçimini yeniden denetle.',true);return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Kenar seçimin minimum orman; yeniden bak: '+wrong.map(item=>item.label).join(', ')+'. Kurulum, bileşen ve satır taraması farklı birimler.',true);return;}
    feedback('exit-feedback','Dört sayı doğru ve kenar seçimin minimum kapsayan orman. Bu kontrol yazılı izin, formülün ve gerekçenin doğruluğunu ölçmedi; dört ölçütle ayrıca değerlendir.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin iz ve gerekçe bağımsız kanıttır.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Bundan sonraki düzeltmeleri ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
