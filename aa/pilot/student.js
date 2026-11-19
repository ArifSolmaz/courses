(function () {
  'use strict';
  const model=window.AAWeeksPilot,tasks=window.AAWeeksPilotTasks;
  if(!model||!tasks||!window.AAWeekOne||!window.AAWeekTwo||!window.AAWeekThree)return;
  const $=id=>document.getElementById(id),lang=document.documentElement.lang==='tr'?'tr':'en';
  const say=(en,tr)=>lang==='tr'?tr:en,phases=model.PHASES.map(p=>p.id),dims=model.DIMENSIONS.map(d=>d.id);
  const checkpointModule=window.AAPilotW2Checkpoint;
  const STORAGE='aa-weeks1-3-student-1',stages=['intro',...phases],support=['','independent','hint','solution'];
  const labelSupport=value=>({'':say('Not recorded','Kaydedilmedi'),independent:say('Independent','Bağımsız'),hint:say('Hint received','İpucu alındı'),solution:say('Solution seen','Çözüm görüldü')})[value];
  const empty=()=>({format:model.FORMAT,taskVersion:model.TASK_VERSION,id:'P01',responseLanguage:'',stage:'intro',answers:Object.fromEntries(['pre','post'].map(p=>[p,Object.fromEntries(dims.map(d=>[d,'']))])),support:Object.fromEntries(['pre','post'].map(p=>[p,Object.fromEntries(dims.map(d=>[d,'']))])),timing:Object.fromEntries(phases.map(p=>[p,''])),bottlenecks:Object.fromEntries(phases.map(p=>[p,''])),languages:[],predictions:{w1:'',w2:'',w3:''},hintSeen:[],seen:{w1:0,w2sequential:0,w2nested:0,w3:0},mode:'sequential',workedResultSeen:false,keySeen:false,reflection:'',w2Checkpoint:checkpointModule?checkpointModule.empty():null});
  let state=empty(),storageOK=true,restoreMessage='';
  function validDraft(s){
    return s&&(!checkpointModule||checkpointModule.valid(s.w2Checkpoint))&&s.format===model.FORMAT&&s.taskVersion===model.TASK_VERSION&&(model.IDS.includes(s.id)||s.stage==='intro'&&s.id==='')&&['','en','tr','mixed'].includes(s.responseLanguage)&&['w1','w2','w3'].every(k=>typeof s.predictions?.[k]==='string'&&s.predictions[k].length<=1200)&&stages.includes(s.stage)&&['sequential','nested'].includes(s.mode)&&typeof s.keySeen==='boolean'&&typeof s.workedResultSeen==='boolean'&&typeof s.reflection==='string'&&s.reflection.length<=1200&&Array.isArray(s.languages)&&s.languages.every(x=>['en','tr'].includes(x))&&Array.isArray(s.hintSeen)&&s.hintSeen.every(x=>['w1','w2','w3'].includes(x))&&s.seen&&Object.keys(empty().seen).every(k=>Number.isInteger(s.seen[k])&&s.seen[k]>=0&&s.seen[k]<=9)&&phases.every(p=>typeof s.timing?.[p]==='string'&&s.timing[p].length<=100&&typeof s.bottlenecks?.[p]==='string'&&s.bottlenecks[p].length<=500)&&['pre','post'].every(p=>dims.every(d=>typeof s.answers?.[p]?.[d]==='string'&&s.answers[p][d].length<=4000&&support.includes(s.support?.[p]?.[d])));
  }
  try {
    const raw=sessionStorage.getItem(STORAGE);
    if(raw){
      const parsed=JSON.parse(raw);let checkpointRecovered=false;
      if(checkpointModule){
        if(parsed.w2Checkpoint==null)parsed.w2Checkpoint=checkpointModule.empty(true,parsed);
        else if(!checkpointModule.valid(parsed.w2Checkpoint)){
          parsed.w2CheckpointUnparsed=parsed.w2Checkpoint;
          parsed.w2Checkpoint=checkpointModule.empty(true,parsed);checkpointRecovered=true;
        }
        if(parsed.w2CheckpointHistoryGap===true){
          parsed.w2Checkpoint.legacyHistory=true;parsed.w2Checkpoint.current=null;
          delete parsed.w2CheckpointHistoryGap;
        }
      }
      if(!validDraft(parsed))throw Error('incompatible');
      state=parsed;
      restoreMessage=say('This tab’s draft was restored. Download a copy before closing.','Bu sekmenin taslağı geri yüklendi. Kapatmadan önce bir kopya indir.');
      if(checkpointRecovered)restoreMessage+=' '+say('Earlier checkpoint data could not be interpreted; it is kept separately in TXT. Other responses were restored.','Önceki durak verisi yorumlanamadı; TXT’de ayrıca korunuyor. Diğer yanıtlar geri yüklendi.');
    }
  }catch(_){storageOK=false;restoreMessage=say('The draft could not be restored. A new form is shown; the previous stored value was not overwritten. Keep a downloaded copy.','Taslak geri yüklenemedi. Yeni form gösteriliyor; önceki kayıtlı değer değiştirilmedi. İndirilmiş kopyanı sakla.');}
  if(!checkpointModule&&state.w2Checkpoint)state.w2CheckpointHistoryGap=true;
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  function save(){try{sessionStorage.setItem(STORAGE,JSON.stringify(state));storageOK=true;$('draft-status').textContent=say('Draft kept in this browser tab. Download TXT before closing the tab.','Taslak bu tarayıcı sekmesinde tutuluyor. Sekmeyi kapatmadan TXT indir.');return true;}catch(_){storageOK=false;$('draft-status').textContent=say('This browser cannot keep the draft. Download TXT now; language navigation is blocked to protect the current answers.','Bu tarayıcı taslağı saklayamıyor. TXT’yi şimdi indir; mevcut yanıtları korumak için dil geçişi durduruldu.');return false;}}
  function announce(text,error=false){$('student-status').textContent=text;$('student-status').dataset.state=error?'error':'ok';}
  function languageUsed(){if(!state.languages.includes(lang))state.languages.push(lang);}
  function load(){
    $('student-id').value=state.id;$('student-response-language').value=state.responseLanguage;for(const k of ['w1','w2','w3'])$('guide-'+k+'-predict').value=state.predictions[k];
    for(const p of ['pre','post'])for(const d of dims){$(p+'-'+d).value=state.answers[p][d];$('support-'+p+'-'+d).value=state.support[p][d];}
    for(const p of phases){$('time-'+p).value=state.timing[p]==='invalid'?'':state.timing[p];$('bottleneck-'+p).value=state.bottlenecks[p];}
    $('reflection-notes').value=state.reflection;$('guide-w2-mode').value=state.mode;
    document.querySelectorAll('[data-hint]').forEach(n=>n.open=n.dataset.hint==='w2'&&checkpointModule?state.w2Checkpoint.generalHintOpened:state.hintSeen.includes(n.dataset.hint));
  }
  const traces={w1:window.AAWeekOne.trace(tasks.practice.w1.records,tasks.practice.w1.target),w2sequential:window.AAWeekTwo.traceWork(tasks.practice.w2.records.length,'sequential'),w2nested:window.AAWeekTwo.traceWork(tasks.practice.w2.records.length,'nested'),w3:window.AAWeekThree.traceSearch(tasks.practice.w3.directory,tasks.practice.w3.target,'binary')};
  const checkpoint=checkpointModule?checkpointModule.mount({state:()=>state,records:tasks.practice.w2.records,persist:save,changed:(redraw=true)=>{save();if(redraw)guides();mirrors();}}):null;
  function stepText(key,s){
    if(key==='w1')return say('Position ','Konum ')+s.position+' · '+s.value+(s.equal?' = ':' ≠ ')+tasks.practice.w1.target+' · '+say('equality checks: ','eşitlik kontrolü: ')+s.comparisons;
    if(key.startsWith('w2'))return(key==='w2nested'?say('Row ','Satır ')+s.i+say(', column ',', sütun ')+s.j:say('Pass ','Tur ')+s.pass+say(', position ',', konum ')+s.i)+' · '+say('equality checks: ','eşitlik kontrolü: ')+s.count;
    const relation=s.relation===0?' = ':s.relation<0?' < ':' > ';
    return '['+s.left+', '+s.right+'] · '+say('middle position ','orta konum ')+s.position+' · '+s.value+relation+tasks.practice.w3.target+' · '+say('probes: ','yoklama: ')+s.probe+(s.relation===0?'':say(' · next interval ',' · sonraki aralık ')+'['+s.nextLeft+', '+s.nextRight+']');
  }
  function guides(){for(const name of ['w1','w2','w3']){
    const key=name==='w2'?'w2'+state.mode:name,trace=traces[key],seen=Math.min(state.seen[key],trace.steps.length),done=seen===trace.steps.length;
    const panel=$('guide-'+name+'-state');panel.dataset.seen=String(seen);panel.dataset.done=String(done);panel.replaceChildren(node('p',say('Revealed steps: ','Açılan adım: ')+seen+'/'+trace.steps.length));
    if(seen)panel.append(node('p',stepText(key,trace.steps[seen-1])));else panel.append(node('p',say('Predict the first step, then reveal it.','İlk adımı tahmin et; sonra aç.')));
    if(done){panel.append(node('p',tasks.practice[name].solution[lang]));}
    const list=$('guide-'+name+'-history');list.replaceChildren();trace.steps.slice(0,seen).forEach(s=>list.append(node('li',stepText(key,s))));
    for(const action of ['next','end'])$('guide-'+name+'-'+action).disabled=done||state.stage!=='practice';$('guide-'+name+'-reset').disabled=state.stage!=='practice';
  }if(checkpoint)checkpoint.update();}
  function key(){const target=$('answer-key');target.replaceChildren();if(!state.keySeen)return;for(const p of ['pre','post']){target.append(node('h3',tasks.phases[p].title[lang]));for(const q of tasks.phases[p].questions){target.append(node('h4',q.title[lang]),node('p',q.answer[lang]));}}target.append(node('p',tasks.rubricPolicy[lang]));}
  function saved(){const target=$('saved-response-text');target.replaceChildren();for(const p of ['pre','post']){if(stages.indexOf(state.stage)<=stages.indexOf(p))continue;target.append(node('h3',tasks.phases[p].title[lang]));for(const d of model.DIMENSIONS){target.append(node('h4',d.title[lang]),node('pre',state.answers[p][d.id]||say('No response recorded','Yanıt kaydedilmedi')),node('p',labelSupport(state.support[p][d.id])));}}}
  function mirrors(){document.querySelectorAll('[data-print-for]').forEach(n=>{const source=$(n.dataset.printFor);if(!source)return;n.textContent=source.tagName==='SELECT'?source.selectedOptions[0]?.textContent||'________________':source.value||'________________';});}
  function reviewTimings(){const box=$('reflection-records');if(!box)return;for(const p of phases){$('review-time-'+p).value=state.timing[p]==='invalid'?'':state.timing[p];$('review-bottleneck-'+p).value=state.bottlenecks[p];}}
  function render(){
    document.body.dataset.stage=state.stage;$('student-form').dataset.stage=state.stage;
    document.querySelectorAll('[data-stage]').forEach(n=>n.hidden=n.dataset.stage!==state.stage);
    $('student-id').disabled=state.stage!=='intro';$('start-pilot').hidden=state.stage!=='intro';
    for(const p of ['pre','post'])for(const d of dims){$(p+'-'+d).readOnly=state.stage!==p;$('support-'+p+'-'+d).disabled=state.stage!==p;}
    $('show-key').hidden=state.stage!=='reflection';$('show-key').disabled=state.keySeen;$('answer-key').hidden=!state.keySeen||state.stage!=='reflection';
    $('saved-responses').hidden=!['practice','post','reflection'].includes(state.stage);
    guides();key();saved();reviewTimings();mirrors();
  }
  function errors(){const messages=[];for(const p of phases){const input=$('time-'+p),value=state.timing[p],valid=value===''||value!=='invalid'&&Number.isFinite(Number(value))&&Number(value)>=0&&Number(value)<=120;input.setAttribute('aria-invalid',String(!valid));const alias=$('review-time-'+p);if(alias)alias.setAttribute('aria-invalid',String(!valid));if(!valid)messages.push(model.PHASES.find(x=>x.id===p).title[lang]+': '+say('enter observed minutes from 0–120 or leave blank.','gözlenen dakikayı 0–120 arasında yaz veya boş bırak.'));}$('student-errors').textContent=messages.join('\n');return !messages.length;}
  function advance(stage){if(!errors()){announce(say('Correct the duration field before continuing.','Devam etmeden süre alanını düzelt.'),true);return;}state.stage=stage;save();render();announce(say('The previous responses are locked. Missing responses remain missing; they were not scored.','Önceki yanıtlar kilitlendi. Eksik yanıtlar eksik kaldı; puanlanmadı.'));const heading=document.querySelector('section[data-stage="'+stage+'"] h2');if(heading){heading.tabIndex=-1;heading.focus();}}
  function exportText(){
    const used=state.languages.length>1?'mixed':state.languages[0]||'',out=[say('AA · Weeks 1–3 · Original pilot responses','AA · Hafta 1–3 · İlk pilot yanıtları'),model.FORMAT,model.PILOT_ID+' · '+model.TASK_VERSION,say('Participant: ','Katılımcı: ')+state.id,say('Response language (student record): ','Yanıt dili (öğrenci kaydı): ')+(state.responseLanguage||say('not recorded','kaydedilmedi')),say('Interface editions used for first/transfer responses: ','İlk/aktarım yanıtlarında kullanılan arayüz sürümleri: ')+(used||say('not recorded','kaydedilmedi')),say('Current phase: ','Mevcut aşama: ')+state.stage,say('Written answers are not automatically graded.','Yazılı yanıtlar otomatik puanlanmadı.')];
    for(const p of ['pre','post']){out.push('\n'+tasks.phases[p].title[lang],tasks.phases[p].context[lang]);for(const d of dims){const q=tasks.phases[p].questions.find(q=>q.id===d);out.push(q.title[lang],q.prompt[lang],state.answers[p][d]||say('[no response recorded]','[yanıt kaydedilmedi]'),say('Support: ','Destek: ')+labelSupport(state.support[p][d]));}}
    out.push('\n'+say('Optional guided predictions (not graded)','İsteğe bağlı rehber tahminleri (puanlanmadı)'));for(const k of ['w1','w2','w3']){const g=tasks.practice[k];out.push(g.title[lang],say('Records/directory: ','Kayıtlar/rehber: ')+(g.records||g.directory).join(', ')+(g.target===undefined?'':say(' · target: ',' · hedef: ')+g.target),state.predictions[k]||say('not recorded','kaydedilmedi'));}out.push('\n'+say('Observed phase times and bottlenecks','Gözlenen aşama süreleri ve takılmalar'));for(const p of model.PHASES)out.push(p.title[lang]+': '+(state.timing[p.id]||say('not recorded','kaydedilmedi'))+say(' minutes; planned ',' dakika; planlanan ')+p.plannedMinutes,say('Bottleneck: ','Takılma: ')+(state.bottlenecks[p.id]||say('not recorded','kaydedilmedi')));
    if(checkpointModule)out.push(...checkpointModule.exportLines(state.w2Checkpoint,lang));else{out.push(say('W2 checkpoint module unavailable; this opening could not record checkpoint support/exposure. Earlier evidence below is unchanged.','W2 durak modülü kullanılamadı; bu açılıştaki durak destek/gösterim bilgisi kaydedilemedi. Aşağıdaki önceki kanıt değişmedi.'));if(state.w2Checkpoint)out.push(say('Saved W2 checkpoint evidence (raw JSON): ','Saklanan W2 durak kanıtı (ham JSON): ')+JSON.stringify(state.w2Checkpoint));}
    if(Object.prototype.hasOwnProperty.call(state,'w2CheckpointUnparsed'))out.push(say('Earlier unparsed checkpoint data (not interpreted): ','Önceki çözümlenemeyen durak verisi (yorumlanmadı): ')+JSON.stringify(state.w2CheckpointUnparsed));
    out.push(say('Distinct optional hints opened: ','Açılan farklı isteğe bağlı ipucu: ')+state.hintSeen.length+'/3',say('Any worked guide result shown: ','Rehberde tamamlanmış sonuç gösterildi: ')+(state.workedResultSeen?say('yes','evet'):say('no','hayır')),say('Model answer opened after locking the transfer response: ','Aktarım kilitlendikten sonra model yanıt açıldı: ')+(state.keySeen?say('yes','evet'):say('no','hayır')),say('Separate reflection/corrections after the original responses: ','İlk yanıtlardan ayrı düşünme/düzeltme notu: ')+(state.reflection||say('not recorded','kaydedilmedi')),tasks.interpretation[lang]);return out.join('\n\n')+'\n';
  }
  function download(text,filename){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=node('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('student-form').addEventListener('submit',e=>e.preventDefault());
  $('student-form').addEventListener('input',e=>{const id=e.target.id;for(const p of ['pre','post'])for(const d of dims)if(id===p+'-'+d){state.answers[p][d]=e.target.value;languageUsed();}for(const p of phases){if(id==='time-'+p){state.timing[p]=e.target.validity.badInput?'invalid':e.target.value;}if(id==='bottleneck-'+p)state.bottlenecks[p]=e.target.value;}for(const k of ['w1','w2','w3'])if(id==='guide-'+k+'-predict')state.predictions[k]=e.target.value;if(id==='reflection-notes')state.reflection=e.target.value;save();errors();mirrors();});
  $('student-form').addEventListener('change',e=>{const id=e.target.id;if(id==='student-id')state.id=e.target.value;if(id==='student-response-language')state.responseLanguage=e.target.value;for(const p of ['pre','post'])for(const d of dims)if(id==='support-'+p+'-'+d)state.support[p][d]=e.target.value;save();mirrors();});
  $('start-pilot').addEventListener('click',()=>{if(!model.IDS.includes($('student-id').value)){$('student-id').setAttribute('aria-invalid','true');announce(say('Choose an assigned participant code P01–P08 before starting.','Başlamadan atanmış P01–P08 katılımcı kodunu seç.'),true);$('student-id').focus();return;}$('student-id').removeAttribute('aria-invalid');state.id=$('student-id').value;state.stage='pre';save();render();announce(say('First attempt started. Write your own four short answers.','İlk deneme başladı. Dört kısa yanıtını kendin yaz.'));});
  $('finish-pre').addEventListener('click',()=>advance('practice'));$('finish-practice').addEventListener('click',()=>advance('post'));$('finish-post').addEventListener('click',()=>advance('reflection'));
  for(const name of ['w1','w2','w3'])for(const action of ['next','end','reset'])$('guide-'+name+'-'+action).addEventListener('click',()=>{if(state.stage!=='practice')return;const key=name==='w2'?'w2'+state.mode:name;if(name==='w2'&&checkpoint){if(action!=='reset'&&checkpoint.held())return;if(action==='reset'&&state.mode==='nested')checkpoint.reset();}state.seen[key]=action==='reset'?0:action==='end'?(name==='w2'&&checkpoint&&state.mode==='nested'&&state.seen[key]<3?3:traces[key].steps.length):Math.min(traces[key].steps.length,state.seen[key]+1);if(state.seen[key]===traces[key].steps.length)state.workedResultSeen=true;save();guides();});
  $('guide-w2-mode').addEventListener('change',e=>{state.mode=e.target.value;save();guides();});
  document.querySelectorAll('[data-hint]').forEach(n=>n.addEventListener('toggle',()=>{if(state.stage==='practice'&&n.open){if(!state.hintSeen.includes(n.dataset.hint))state.hintSeen.push(n.dataset.hint);if(n.dataset.hint==='w2'&&checkpointModule)state.w2Checkpoint.generalHintOpened=true;save();}}));
  $('show-key').addEventListener('click',()=>{if(state.stage!=='reflection')return;state.keySeen=true;save();render();announce(say('Original responses remain locked. Put any correction in the separate reflection field.','İlk yanıtlar kilitli kaldı. Düzeltmeyi ayrı düşünme alanına yaz.'));});
  $('download-student').addEventListener('click',()=>{save();download(exportText(),'aa-weeks1-3-'+state.id+'.txt');announce(say('Response file downloaded. Open it and check both attempts before handing it in.','Yanıt dosyası indirildi. Teslim etmeden iki denemeyi içerdiğini açıp denetle.'));});
  $('student-print').addEventListener('click',()=>{mirrors();window.print();});window.addEventListener('beforeprint',mirrors);
  $('student-reset-request').addEventListener('click',()=>{$('student-reset-confirm').hidden=false;});$('student-reset-cancel').addEventListener('click',()=>{$('student-reset-confirm').hidden=true;});$('student-reset').addEventListener('click',()=>{state=empty();if(checkpoint)checkpoint.reset();save();load();render();$('student-reset-confirm').hidden=true;announce(say('Student draft cleared. Choose the next participant code before starting.','Öğrenci taslağı temizlendi. Başlamadan sonraki katılımcı kodunu seç.'));});
  document.querySelectorAll('.language-switch a').forEach(a=>a.addEventListener('click',e=>{if(!save()){e.preventDefault();announce(say('Download the response file before leaving this page.','Sayfadan ayrılmadan yanıt dosyasını indir.'),true);}}));
  const reflection=document.querySelector('[data-stage=reflection]'),box=node('details');box.id='reflection-records';box.className='no-print';box.append(node('summary',say('Review observed times and bottleneck notes','Gözlenen süreleri ve takılma notlarını gözden geçir')));
  for(const p of model.PHASES){const label=node('label',p.title[lang]+say(' · observed minutes',' · gözlenen dakika')),input=node('input');input.id='review-time-'+p.id;input.type='number';input.min='0';input.max='120';input.step='any';label.htmlFor=input.id;label.append(input);const noteLabel=node('label',p.title[lang]+say(' · bottleneck',' · takılma')),note=node('textarea');note.id='review-bottleneck-'+p.id;note.maxLength=500;note.rows=2;noteLabel.htmlFor=note.id;noteLabel.append(note);box.append(label,noteLabel);input.addEventListener('input',()=>{state.timing[p.id]=input.validity.badInput?'invalid':input.value;$('time-'+p.id).value=input.value;save();errors();mirrors();});note.addEventListener('input',()=>{state.bottlenecks[p.id]=note.value;$('bottleneck-'+p.id).value=note.value;save();mirrors();});}
  reflection.append(box);load();render();errors();document.querySelectorAll('.js-only').forEach(n=>{if(!['start-pilot','show-key'].includes(n.id))n.hidden=false;if(n.matches('button'))n.disabled=false;});render();if($('enhancement-fallback'))$('enhancement-fallback').hidden=true;$('draft-status').textContent=restoreMessage||say('This page sends no answers to a server. A draft stays in this tab; download a TXT backup.','Bu sayfa yanıtları sunucuya göndermez. Taslak bu sekmede kalır; TXT yedeği indir.');
})();
