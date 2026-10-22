(function () {
  'use strict';
  const model = window.FreshWeek9;
  if (!model || typeof model.traceDFS !== 'function' || typeof model.validateTopologicalOrder !== 'function') return;
  const $ = id => document.getElementById(id);
  const vertices = [4, 7, 11, 18, 20, 24, 26, 31];
  const edges = [[18, 7], [18, 24], [7, 4], [7, 11], [24, 11], [24, 20], [11, 31], [20, 31]];
  const names = {4:'çatı',7:'sera',11:'kuyu',18:'pompa',20:'bahçe',24:'depo',26:'oda',31:'kapı'};
  const independentVertices = [4, 7, 18, 20, 24, 26];
  const independentEdges = [[18, 7], [18, 24], [7, 26], [24, 26], [26, 4]];
  const cases = {
    main: {vertices,edges,first:18,text:'Ana yönlü bağımlılıklar. Önce 18, sonra girilmemiş kalan kökler artan sırada; komşular artan sırada. Her ok önce bitmesi gereken işten sonrakine gider.'},
    reverse: {vertices,edges,first:18,order:'descending',text:'Aynı yönlü ağ; çıkan komşular azalan sırada. İlk kök yine 18. Geçerli sıra değişebilir mi?'},
    first7: {vertices,edges,first:7,text:'Aynı ağ; ilk DFS kökü 7. Ardından girilmemiş kalan kökler artan sırada. 7’nin çağrısının bitmesi bütün ağın bittiği anlamına gelmez.'},
    cycle: {vertices,edges:edges.concat([[31,7]]),first:18,text:'Ana ağa 31→7 bağımlılığını ekledik. İlk kök 18, komşular artan. Etkin düğüme giden oku ve kapalı çevrim tanığını bul.'},
    remote: {vertices,edges:edges.concat([[26,26]]),first:18,text:'Ana ağa yalnız 26→26 ekledik. 18’in altındaki arama çevrimsiz bitebilir; bütün işler denetlenmeden sonuca varma.'},
    single: {vertices:[18],edges:[],first:18,text:'Tek iş 18, ok yok. Bir giriş, bir geri dönüş; geçerli iş sırası tek elemanlı.'},
    noedges: {vertices,edges:[],first:18,text:'Sekiz iş var, ok yok. Önce 18, kalan kökler artan sırada. Her işi bir kez içeren bütün sıralar geçerlidir.'}
  };
  let trace, task, seen = 0, solutionSeen = false;
  function el(tag, text) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
  function list(values) {return '['+values.join(', ')+']';}
  function stepText(step) {
    if(step.type==='init')return trace.vertices.length+' işin durumunu “girilmedi” olarak başlat. İlk kök adayı '+trace.rootOrder[0]+'.';
    if(step.type==='enter')return (step.root?'Yeni kök ':'Çocuk çağrı ')+step.vertex+' içine gir; etkin işaretle ve yığına koy.'+(step.parent===null?'':' Çağıran '+step.parent+' kalan komşusundan devam etmek için bekler.');
    if(step.type==='finish')return step.vertex+' çağrısının bütün çıkan okları bitti. Tamamlandı işaretle, bitiş listesine ekle ve yığından çıkar; '+(step.state.stack.length?'çağırana geri dön.':'etkin çağrı kalmadı. Kalan kök adayları henüz incelenebilir.');
    if(step.type==='complete')return 'Bütün işler incelendi, çevrim bulunmadı. Bitiş listesinin tersini aday iş sırası olarak üret.';
    if(step.type==='cycle')return 'Etkin ataya dönüş: '+step.cycle.join(' → ')+'. İlk çevrimde bütün arama durdu; açık çağrılar geri dönmedi. Geçerli iş sırası yok.';
    const prefix=step.from+' listesinin '+(step.neighborIndex+1)+'. oku: '+step.from+'→'+step.to+'. ';
    return prefix+(step.classification==='unseen'?'Hedefe girilmedi. Sonraki adımda onun çağrısına gir; mevcut çağrının sonraki konumu saklandı.':step.classification==='active'?'Hedef etkin, hâlâ çağrı yığınında. Sonraki adımda bu geri okun kapattığı çevrimi göster.':'Hedef tamamlanmış; yeniden çağırmadan devam et. Bu ok tek başına çevrim kanıtı değildir.');
  }
  function render() {
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,done=seen===trace.steps.length;
    const counts=last?last.counts:{initializations:0,entries:0,edgeScans:0,returns:0};
    $('dfs-task').textContent=task.text;
    $('dfs-progress').textContent='V = '+trace.vertices.length+' · E = '+trace.edges.length+' · Açılan adım: '+seen+'/'+trace.steps.length;
    const stack=$('dfs-stack');stack.replaceChildren();stack.append(el('h4','Etkin çağrılar · alt → üst'));
    const frames=el('ol');frames.className='stack-frames';
    state.stack.forEach((frame,index)=>{
      const item=el('li');item.dataset.id=String(frame.vertex);item.dataset.next=String(frame.nextIndex);
      if(index===state.stack.length-1)item.classList.add('is-top');
      item.append(el('b',String(frame.vertex)+' · '+names[frame.vertex]));
      item.append(el('span',(index===state.stack.length-1?'Tepe':'Bekleyen üst çağrı')+' · Çerçeve '+(index+1)));
      const neighbors=trace.adjacency[frame.vertex];
      item.append(el('span','Okunan ok: '+frame.nextIndex+'/'+neighbors.length+' · '+(frame.nextIndex<neighbors.length?'sonraki komşu '+neighbors[frame.nextIndex]:'liste sonu')));
      frames.append(item);
    });
    if(!state.stack.length){const p=el('p',done?'Yığın boş; bütün çağrılar döndü.':'Şu anda etkin çağrı yok. Bu, kalan köklerin de bittiğini tek başına söylemez.');p.className='board-empty';stack.append(p);}
    stack.append(frames);
    const neighbors=$('dfs-neighbors');neighbors.replaceChildren();
    const top=state.stack.at(-1);
    if(!top)neighbors.append(el('p',done?'Bekleyen çağrı yok.':'Bir çağrıya girince onun çıkan listesi burada açılacak.'));
    else{
      const items=trace.adjacency[top.vertex];neighbors.append(el('h4',top.vertex+' çıkan komşuları '+list(items)+' · Okunan: '+top.nextIndex+'/'+items.length));
      const line=el('div');line.className='neighbor-row';
      if(!items.length){const p=el('span','Liste boş; çağrı bir sonraki adımda geri dönebilir.');p.className='board-empty';line.append(p);}
      items.forEach((id,index)=>{
        const chip=el('div');chip.className='neighbor-chip';chip.dataset.id=String(id);chip.dataset.index=String(index);chip.append(el('b',String(id)));let label='';
        if(index<top.nextIndex){chip.classList.add('is-scanned');label='Okundu';}
        else if(index===top.nextIndex){chip.classList.add('is-next');label='Sıradaki';}
        if(state.activeEdge&&state.activeEdge.from===top.vertex&&last&&(last.type==='inspect'||last.type==='cycle')&&index===top.nextIndex-1){chip.classList.add('is-last');label='Bu adımda';}
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
      const status=el('p',row.status==='unseen'?'Girilmedi':row.status==='active'?'Etkin · yığında':'Tamamlandı · geri döndü');status.className='node-status';card.append(status);
      const parent=el('p','Çağıran: '+(row.parent===null?row.status==='unseen'?'—':'yok (kök)':row.parent));parent.className='node-parent';card.append(parent);table.append(card);
    });
    $('dfs-finished').textContent='Bitiş listesi · henüz ters çevrilmedi: '+list(state.finished);
    $('dfs-count').textContent='Başlatılan satır: '+counts.initializations+' · Çağrıya giriş: '+counts.entries+' · Yönlü girdi taraması: '+counts.edgeScans+' · Geri dönüş: '+counts.returns;
    $('dfs-depth').textContent='Şu anki yığın uzunluğu: '+state.stack.length+' · En büyük yığın: '+(last?last.stats.maxStack:0)+' çerçeve';
    $('dfs-status').textContent=last?stepText(last):'Henüz adım açılmadı. İlk çağrıyı ve yığının ilk durumunu söyle.';
    $('dfs-next').disabled=done;$('dfs-end').disabled=done;
    const history=$('dfs-history');history.replaceChildren();
    trace.steps.slice(0,seen).forEach(step=>{const item=el('li',stepText(step));item.dataset.type=step.type;history.append(item);});
    document.querySelector('#dfs-history-details summary').textContent='Açılan bütün adımlar ('+seen+')';
    const checks=$('dfs-edge-checks');checks.replaceChildren();
    $('dfs-edge-details').hidden=true;
    if(!done)$('dfs-result').textContent='Arama henüz bitmedi. Bu aşamadaki bitiş listesi tam bir iş sırası değildir; bütün işler denetlenmeden “çevrim yok” demiyoruz.';
    else if(!trace.result.acyclic)$('dfs-result').textContent='Çevrim tanığı: '+trace.result.cycle.join(' → ')+'. Bütün bağımlılıkları karşılayan sıra yok. Erken duruldu; kısmi bitişleri ters çevirerek plan üretme.';
    else{
      const order=trace.result.topologicalOrder,positions=new Map(order.map((id,index)=>[id,index+1]));
      $('dfs-result').textContent='Bir topolojik iş sırası: '+list(order)+'. Her iş bir kez; bütün oklar ilerideki işe gider. Başka geçerli sıralar da olabilir.';
      trace.edges.forEach(([a,b])=>{const item=el('li',a+'→'+b+': '+positions.get(a)+'. konum < '+positions.get(b)+'. konum.');item.dataset.from=String(a);item.dataset.to=String(b);checks.append(item);});
      if(!trace.edges.length)checks.append(el('li','Ok yok; her işi bir kez içermek yeterli.'));
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
    if(invalid){feedback('guided-feedback','İki kutuyu da belirtilen aralıkta tam sayıyla doldur. Eksik veya geçersiz kutuyu işaretledim.',true);$(invalid.id).focus();return;}
    const entering=model.traceDFS(vertices,edges,{firstRoot:18}).steps.find(step=>step.type==='enter'&&step.vertex===24);
    if(next.value===entering.vertex&&depth.value===entering.state.stack.length)feedback('guided-feedback','İki sayı da doğru. Dönüş yerini, 11’in durumunu ve arama/gerçek iş ayrımını ayrıca çözümle karşılaştır; yazılı gerekçen otomatik puanlanmadı.',false);
    else feedback('guided-feedback',next.value!==entering.vertex?'18’in [7, 24] listesinde 7’nin çağrısı döndü. Kalan ikinci komşuyu seç; en küçük kimliği baştan aramıyoruz.':'18’in çağrısı açık kalır; yeni çocuk onun üstüne girer. Toplam bitmiş çağrıları değil etkin yığını say.',true);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const expected=model.traceDFS(independentVertices,independentEdges,{firstRoot:18});
    const checks=[{...number('exit-scans',0,64),expected:expected.counts.edgeScans,label:'yönlü girdi taraması'},{...number('exit-entries',0,32),expected:expected.counts.entries,label:'toplam giriş'},{...number('exit-depth',0,32),expected:expected.stats.maxStack,label:'en büyük yığın'}];
    const invalid=checks.find(item=>!item.valid);
    if(invalid){feedback('exit-feedback','Üç sayıyı da belirtilen aralıklarda tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const order=parseOrder($('exit-order').value),validation=model.validateTopologicalOrder(independentVertices,independentEdges,order);
    $('exit-order').setAttribute('aria-invalid',String(validation.reason==='not-permutation'));
    if(validation.reason==='not-permutation'){feedback('exit-feedback','Sırada bütün 6 iş kimliği tam bir kez bulunmalı. Yalnız kimlikleri virgülle veya boşlukla ayır; eksik, yinelenen ve bilinmeyen kimlik kullanma.',true);$('exit-order').focus();return;}
    const wrong=checks.filter(item=>item.value!==item.expected);
    if(wrong.length){feedback('exit-feedback','Yeniden bak: '+wrong.map(item=>item.label).join(', ')+'. Yönlü ok, toplam çağrı ve aynı anda etkin çağrı farklı sayılır.',true);return;}
    if(!validation.valid){const [a,b]=validation.violatingEdge;feedback('exit-feedback','Üç sayı doğru; önerdiğin sıra '+a+'→'+b+' koşulunu bozuyor: '+a+', '+b+' işinden önce gelmeli. Sıranı bütün oklarda denetle.',true);return;}
    feedback('exit-feedback','Üç sayı doğru ve önerdiğin iş sırası bütün bağımlılıkları karşılıyor. Bu kontrol yazılı izin, formülün ve gerekçenin doğruluğunu ölçmedi; dört ölçütle ayrıca değerlendir.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin iz ve gerekçe bağımsız kanıttır.'),false);
  });
  function clear(form,id){form.addEventListener('input',()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));});}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Bundan sonraki düzeltmeleri ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];
  window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(node=>{printed.push([node,node.open]);node.open=true;});});
  window.addEventListener('afterprint',()=>{printed.forEach(([node,open])=>{node.open=open;});printed.length=0;});
  reset();document.querySelectorAll('details.worked-table').forEach(node=>{node.open=false;});
  document.querySelectorAll('.js-only').forEach(node=>{node.hidden=false;});
  document.querySelectorAll('form button').forEach(node=>{node.disabled=false;});
})();
