(function () {
  'use strict';
  const model=window.FreshWeek14;
  if(!model||typeof model.traceCertificate!=='function'||typeof model.transformHamiltonianST!=='function')return;
  const $=id=>document.getElementById(id);
  const vertices=[4,7,11,18,20,24,26,31],edges=[[7,4,1],[18,7,2],[7,11,2],[4,11,2],[20,31,2],[18,24,3],[24,11,3],[24,20,4],[31,26,4],[11,31,5]];
  const repeatPath=[24,20,31,20,31],simplePath=[24,18,7,11,31];
  const independentVertices=[4,7,18,24],independentEdges=[[18,24,3],[24,7,1],[7,4,2],[18,7,1],[24,4,7]];
  const cases={
    repeat:{source:24,target:31,k:4,B:10,path:repeatPath,simple:true,text:'Hafta 13’ün adayı, bu kez cihaz tekrarı yasak. Kimlik/kenar koşullarını birbirine karıştırma.'},
    walk:{source:24,target:31,k:4,B:10,path:repeatPath,simple:false,text:'Önceki yürüyüş sözleşmesi: tekrar serbest. Bu karşılaştırma L’nin basit yol kuralını kullanmıyor.'},
    budget:{source:24,target:31,k:4,B:10,path:simplePath,simple:true,text:'Tekrarsız ve gerçek kenarlı aday; bütçe 10. Hangi kontrolde duracağını önce söyle.'},
    valid:{source:24,target:31,k:4,B:12,path:simplePath,simple:true,text:'Aynı tekrarsız aday, bütçe 12. Kabul edilmesi minimumluğu kanıtlar mı?'},
    short:{source:24,target:31,k:4,B:12,path:[24,20,31],simple:true,text:'Bu ucuz aday yalnız iki kenar içeriyor. Tam dört koşulunda ilk hangi kontrol başarısız?'},
    missing:{source:24,target:31,k:4,B:12,path:[24,18,7,26,31],simple:true,text:'Kimlikler biliniyor ve farklı; her ardışık çift gerçekten bağlantılı mı? Eksik kenarın bedelini uydurma.'},
    wrong:{source:24,target:31,k:4,B:12,path:[18,24,11,7,31],simple:true,text:'Liste tanıdık kimliklerden oluşuyor ama kaynak koşulu aynı kaldı. İlk hatadan sonra diğer koşullar test edilmez.'},
    unknown:{source:24,target:31,k:4,B:12,path:[24,18,7,99,31],simple:true,text:'99 bu çizgede kayıtlı değil. Kimlik denetimi kenar aramadan önce gelir.'},
    empty:{source:24,target:24,k:0,B:0,path:[24],simple:true,text:'Kaynak ve hedef 24; k=0. Tek cihaz konumu içeren liste hiç kenar geçmez ve bedeli 0.'},
    separate:{source:24,target:31,k:0,B:0,path:[24],simple:true,text:'Kaynak 24, hedef 31; k=0. Liste uzunluğu doğru olsa bile hedef koşulu ne olur?'}
  };
  const reasons={format:'liste biçimi uygun değil',length:'tam k+1 kayıt koşulu sağlanmadı','unknown-id':'bir kimlik çizgede yok veya geçersiz',source:'ilk kimlik kaynak değil',target:'son kimlik hedef değil',repeat:'tekrar yasağı bozuldu','missing-edge':'ardışık iki cihaz arasında kenar yok',budget:'toplam bedel bütçeyi aşıyor',valid:'bütün aday koşulları sağlandı'};
  let task,trace,seen=0,dirty=false,solutionSeen=false;
  const pathText=ids=>ids.join(' → ');
  function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function describe(s){
    if(s.type==='start')return s.formatValid?'Verilen listeyi denetlemeye başla. Henüz uzunluk, kimlik veya kenar kontrol edilmedi.':'Verilen aday bir liste değil veya gösterim sınırını aşıyor; ret kararı sırada.';
    if(s.type==='length')return 'Uzunluk '+s.actual+' kayıt; gereken k+1='+s.expected+'. '+(s.passed?'Koşul geçti.':'Koşul sağlanmadı; bu adayı reddedeceğiz.');
    if(s.type==='id')return 'Konum '+(s.index+1)+' · kimlik '+(s.id===null?'geçersiz':s.id)+': '+(s.passed?'çizgede var.':'geçerli bir kayıtlı kimlik değil. Ret kararı sırada.');
    if(s.type==='endpoint')return (s.kind==='source'?'Kaynak':'Hedef')+' kontrolü: konum '+(s.index+1)+' değeri '+s.actual+', gereken '+s.expected+'. '+(s.passed?'Geçti.':'Bu aday koşulu sağlamıyor.');
    if(s.type==='repeat')return 'Konum '+(s.index+1)+' · '+s.id+': '+(s.passed?'önceki konumlarda kullanılmadı; kümeye ekle.':'ilk kez konum '+(s.firstIndex+1)+' içinde vardı. Tekrar yasağı bozuldu; henüz kenarları toplamıyoruz.');
    if(s.type==='edge')return 'Konum '+s.index+' → '+(s.index+1)+': '+s.from+' → '+s.to+' kenarı '+(s.exists?'var; bedel '+s.weight+'. Toplama henüz eklenmedi.':'yok. Sonlu bir bedel uydurma; bu aday reddedilecek.');
    if(s.type==='add')return 'Gerçek kenarın bedelini ekle: '+s.previous+' + '+s.weight+' = '+s.total+'. Bu, şimdiye kadar denetlenip eklenmiş öneğin bedeli.';
    if(s.type==='budget')return 'Bütün kenarlar toplandı: '+s.total+' ≤ '+s.B+' mi? '+(s.passed?'Evet; kabul kararı sırada.':'Hayır; bu aday bütçeyi aşıyor.');
    if(s.type==='accept')return 'Bu aday kabul edildi; toplam '+s.cost+'. Geçerli bir EVET tanığı var. Minimumluk kontrol edilmedi.';
    return 'Bu aday reddedildi: '+reasons[s.reason]+'. Bu ret başka bir geçerli adayın olmadığını kanıtlamaz.';
  }
  function render(){
    const last=seen?trace.steps[seen-1]:null,state=last?last.state:trace.initialState,c=last?last.counts:{lengthChecks:0,idChecks:0,endpointChecks:0,repeatChecks:0,edgeChecks:0,costAdds:0,budgetChecks:0};
    $('certificate-widget').dataset.seen=String(seen);$('certificate-widget').dataset.type=last?last.type:'';$('certificate-widget').dataset.phase=state.phase;$('certificate-widget').dataset.dirty=String(dirty);
    $('cert-task').textContent=task.text+' Denetime alınan sözleşme: s='+trace.source+', t='+trace.target+', k='+trace.k+', B='+trace.B+'; '+(trace.simple?'tekrar yasak.':'tekrar serbest.');
    $('cert-progress').textContent='Açılan adım: '+seen+'/'+trace.steps.length+' · Denetime alınan aday: '+(trace.certificate.length?pathText(trace.certificate):'[] · boş liste');
    $('cert-draft').textContent=dirty?'Düzenlenen aday/bütçe henüz uygulanmadı. Devam etmek için Adayı uygula düğmesini kullan.':'Ekrandaki iz, denetime alınmış aday ve bütçeye aittir.';
    const cards=$('cert-records');cards.replaceChildren();
    trace.certificate.forEach((id,index)=>{const card=el('article');card.className='cert-card';card.dataset.index=String(index);card.dataset.id=String(id);card.dataset.current=String(state.index===index&&!state.done);card.dataset.violation=String(Boolean(state.violation&&state.violation.index===index));const known=index<state.checkedIds.length;card.dataset.known=String(known);card.append(el('h5','Konum '+(index+1)+' · cihaz '+id));card.append(el('p',state.violation&&state.violation.index===index?'Bu konumda ret: '+reasons[state.violation.reason]:known?'Kimlik çizgede doğrulandı.':'Kimlik henüz denetlenmedi.'));cards.append(card);});
    if(!trace.certificate.length)cards.append(el('p','Aday []: hiç kayıt yok. k=0 için bile kaynak konumunu yazmalısın.'));
    const active=$('cert-active');active.replaceChildren(el('h4','Şimdiki koşul'));
    active.dataset.edge=state.activeEdge?state.activeEdge.from+'-'+state.activeEdge.to:'';active.dataset.total=String(state.total);active.dataset.checkedEdges=String(state.checkedEdges.length);active.dataset.unique=state.uniqueIds.join(',');
    if(state.activeEdge){const a=state.activeEdge;active.append(el('p','Kenar: '+a.from+' → '+a.to));active.append(el('p',a.exists?'Gerçek bedel: '+a.weight+(last.type==='add'?' · toplama eklendi.':' · henüz toplama eklenmedi.'):'Bu bağlantı çizgede yok; bedel yazılmaz.'));}
    else if(last)active.append(el('p',describe(last)));
    else active.append(el('p','Henüz hiçbir kontrol açılmadı. İlk koşul ne olmalı?'));
    active.append(el('p','Tekrar kümesi: '+(state.uniqueIds.length?state.uniqueIds.join(', '):'henüz boş')+(trace.simple?'':' · yürüyüş modunda bu kontrol uygulanmaz.')));
    $('cert-cost').textContent='Şimdiye kadar gerçekten eklenen bedel: '+state.total+' · Tam aday maliyeti, bütün kenarlar denetlenip toplandıktan sonra belli olur.';
    $('cert-cost').dataset.total=String(state.total);
    $('cert-count').textContent='Uzunluk: '+c.lengthChecks+' · Kimlik: '+c.idChecks+' · Uç: '+c.endpointChecks+' · Tekrar: '+c.repeatChecks+' · Kenar: '+c.edgeChecks+' · Toplama: '+c.costAdds+' · Bütçe: '+c.budgetChecks;
    $('cert-status').textContent=last?describe(last):'Uzunluk, kimlikler, uçlar, tekrar, kenarlar ve bütçe. Sıradaki koşulu söyle; sonra aç.';
    ['cert-next','cert-stage','cert-end'].forEach(id=>{$(id).disabled=state.done||dirty;});
    const result=$('cert-result');result.dataset.accepted=state.done?String(trace.result.accepted):'pending';result.dataset.reason=state.done?trace.result.reason:'';result.dataset.cost=state.done?(trace.result.cost===null?'null':String(trace.result.cost)):'pending';
    result.textContent=!state.done?'Bu adayın denetimi henüz bitmedi. Açılmamış kontroller geçmiş sayılmaz.':trace.result.accepted?'Aday kabul edildi. '+(trace.simple?'L’nin bu girdisi için EVET tanığıdır.':'Tekrar serbest yürüyüş sözleşmesinde EVET tanığıdır; L’nin tekrar yasağı uygulanmadı.')+' Toplam '+trace.result.cost+'. Minimumluk veya genel bir hızlı çözücü kanıtlanmadı.':'Bu aday reddedildi: '+reasons[trace.result.reason]+'. '+(trace.result.cost===null?'Kenar bölümü tamamlanmadı; tam maliyet hesaplanmadı.':'Adayın tam maliyeti '+trace.result.cost+'.')+' Başka geçerli aday olmadığı sonucu çıkmaz.';
    const history=$('cert-history');history.replaceChildren();trace.steps.slice(0,seen).forEach(step=>{const li=el('li',describe(step));li.dataset.type=step.type;history.append(li);});document.querySelector('#cert-history-details summary').textContent='Açılan kontrol adımları ('+seen+')';
  }
  function loadedTrace(path,B){
    trace=model.traceCertificate(vertices,edges,task.source,task.target,task.k,B,path,{simple:task.simple});seen=0;dirty=false;$('cert-input-error').textContent='';$('cert-input').removeAttribute('aria-invalid');$('cert-budget').removeAttribute('aria-invalid');$('cert-input').value=path.join(',');$('cert-budget').value=String(B);render();
  }
  function selectCase(){task=cases[$('cert-case').value];loadedTrace(task.path,task.B);}
  function markDirty(){dirty=true;$('cert-input-error').textContent='';$('cert-input').removeAttribute('aria-invalid');$('cert-budget').removeAttribute('aria-invalid');render();}
  $('cert-case').addEventListener('change',selectCase);$('cert-input').addEventListener('input',markDirty);$('cert-budget').addEventListener('input',markDirty);$('cert-budget').addEventListener('change',markDirty);
  $('cert-apply').addEventListener('click',()=>{
    const raw=$('cert-input').value.trim();let path=[];
    if(raw!==''&&!/^[+-]?\d+(?:(?:\s*,\s*|\s*→\s*|\s+)[+-]?\d+)*$/.test(raw)){inputError('cert-input','Kimlikleri virgül, boşluk veya → ile ayır; ondalık veya metin kullanma.');return;}
    if(raw!=='')path=raw.split(/\s*(?:,|→)\s*|\s+/).map(Number);
    if(path.length>64||path.some(n=>!Number.isSafeInteger(n))){inputError('cert-input','En çok 64 kayıt ve güvenli tam sayı kimlikleri kullan.');return;}
    const budget=$('cert-budget'),budgetRaw=budget.value.trim(),B=Number(budgetRaw);
    if(!/^\d+$/.test(budgetRaw)||!budget.validity.valid||!Number.isSafeInteger(B)||B<0){inputError('cert-budget','B için güvenli aralıkta negatif olmayan bir tam sayı yaz.');return;}
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
    if(invalid){feedback('guided-feedback','İki kutuyu 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const choice=$('guided-claim');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('guided-feedback','Sayılarla birlikte bu denetimin kanıtladığı iddiayı seç.',true);choice.focus();return;}
    if(cost.value!==12){feedback('guided-feedback','Adayın dört kenarını topla: 3+2+2+5. Bütçeyi adayın maliyeti yerine yazma.',true);return;}
    if(count.value!==4){feedback('guided-feedback','Beş cihaz konumu arasındaki geçişleri say. k kenar ile k+1 kayıt farklı.',true);return;}
    if(choice.value!=='yes'){feedback('guided-feedback','Verilen aday bütün koşulları sağlıyor. Alternatifler veya genel çözme algoritması bu denetimde incelendi mi?',true);return;}
    feedback('guided-feedback','İki sayı ve EVET tanığı iddiası doğru. B=10, minimumluk ve bütün adaylar hakkındaki yazılı gerekçen otomatik puanlanmadı; çözümle ayrıca karşılaştır.',false);
  });
  $('independent-form').addEventListener('submit',event=>{
    event.preventDefault();const good=model.traceCertificate(independentVertices,independentEdges,18,4,3,6,[18,24,7,4]),bad=model.traceCertificate(independentVertices,independentEdges,18,4,3,6,[18,7,24,4]),reduced=model.transformHamiltonianST(independentVertices,independentEdges.map(([u,v])=>[u,v]),18,4);
    const checks=[{...number('exit-good'),expected:good.result.cost,label:'Y maliyeti'},{...number('exit-bad'),expected:bad.result.cost,label:'Z maliyeti'},{...number('exit-k'),expected:reduced.k,label:'dönüşümün k değeri'},{...number('exit-budget'),expected:reduced.B,label:'birim ağırlıklı dönüşümün bütçesi'}];
    const invalid=checks.find(x=>!x.valid);if(invalid){feedback('exit-feedback','Dört kutuyu 0–100 arasında tam sayıyla doldur.',true);$(invalid.id).focus();return;}
    const wrong=checks.filter(x=>x.value!==x.expected);if(wrong.length){feedback('exit-feedback','Yeniden bak: '+wrong.map(x=>x.label).join(', ')+'. Orijinal kenar maliyetleriyle birim-ağırlık dönüşümünü ayrı hesapla.',true);return;}
    const choice=$('exit-arrow');choice.setAttribute('aria-invalid',String(!choice.value));if(!choice.value){feedback('exit-feedback','Dört sayıdan sonra indirgeme okunun yönünü seç.',true);choice.focus();return;}
    if(choice.value!=='a-to-l'){feedback('exit-feedback','L’nin çözücüsünü kullanarak bilinen zor UHAMPATH’ı çözmek istiyoruz. Önce hangi sorunun girdisini dönüştürmeliyiz?',true);return;}
    feedback('exit-feedback','Dört sayı ve ok yönü doğru. Yazılı denetim, sınıf yorumu ve indirgeme kanıtı ayrıca dört ölçütle değerlendirilmeli.'+(solutionSeen?' Model yanıt açıldı; bu denemeyi çözüm sonrası olarak kaydet.':' Çözümü görmeden ürettiğin kanıt bağımsız çalışmandır.'),false);
  });
  function clear(form,id){const run=()=>{$(id).textContent='';form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));};form.addEventListener('input',run);form.addEventListener('change',run);}
  clear($('guided-form'),'guided-feedback');clear($('independent-form'),'exit-feedback');
  $('independent-key').addEventListener('toggle',()=>{if($('independent-key').open){solutionSeen=true;$('exit-feedback').textContent='';$('solution-seen').hidden=false;$('solution-seen').textContent='Model yanıt bu oturumda açıldı. Çözüm sonrası düzeltmeyi ilk bağımsız denemeden ayrı değerlendir.';}});
  const printed=[];window.addEventListener('beforeprint',()=>{printed.length=0;document.querySelectorAll('details.worked-table').forEach(n=>{printed.push([n,n.open]);n.open=true;});});window.addEventListener('afterprint',()=>{printed.forEach(([n,open])=>{n.open=open;});printed.length=0;});
  selectCase();document.querySelectorAll('details.worked-table').forEach(n=>{n.open=false;});document.querySelectorAll('.js-only').forEach(n=>{n.hidden=false;});document.querySelectorAll('form button').forEach(n=>{n.disabled=false;});
})();
