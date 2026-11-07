/* Week-page Python examples: CP1's bundled Pyodide worker, fresh scope per run. */
(() => {
  const english = document.documentElement.lang === 'en' && document.querySelector('#timing pre.python-example');
  const t = (tr, en) => english ? en : tr;
  const base = new URL('.', document.currentScript.src);
  let runtimePromise, worker, pending, active, timer;
  const cells = [];
  function runtime() {
    if (!runtimePromise) runtimePromise = new Promise((resolve,reject) => {
      const script=document.createElement('script'); script.src=new URL('python-runtime.js',base);
      script.onload=()=>resolve(window.AA_PYTHON_RUNTIME);
      script.onerror=()=>{script.remove();runtimePromise=null;reject(Error(t('Python yüklenemedi. Bağlantıyı kontrol edip Run ile yeniden deneyin.', 'Python could not load. Check your connection and select Run to retry.')));};
      document.head.append(script);
    });
    return runtimePromise;
  }
  function finish(message) {
    clearTimeout(timer);
    if(active) { active.status.textContent=message;active.stop.disabled=true; }
    active=null;cells.forEach(c=>c.run.disabled=false);
  }
  function terminate(message) {
    worker?.terminate();worker=null;
    if(pending){pending.reject(Error(message));pending=null;}
    finish(message);
  }
  async function startWorker(c,ticket) {
    if(worker)return;
    const bundle=await runtime();
    if(active!==c||c.ticket!==ticket)throw Error(t('Çalıştırma iptal edildi.', 'Run cancelled.'));
    const url=URL.createObjectURL(new Blob([bundle.worker],{type:'text/javascript'}));
    worker=new Worker(url);URL.revokeObjectURL(url);
    await new Promise((resolve,reject)=>{
      pending={resolve,reject};
      worker.onerror=()=>terminate(t('Python başlatılamadı. Run ile yeniden deneyin.', 'Python could not start. Select Run to retry.'));
      worker.onmessage=({data:m})=>{
        if(m.type==='ready'){pending?.resolve();pending=null;return;}
        if(m.type==='fatal'){terminate(t('Python yükleme hatası: ', 'Python load error: ')+m.text);return;}
        if(!active || m.id!==active.id)return;
        if(m.type==='stream')active.output.textContent+=m.text;
        if(m.type==='error'){active.output.textContent+='\n'+m.text;finish(t('Kod hatası — düzenleyip tekrar çalıştırabilirsiniz.', 'Code error. Edit it and run again.'));}
        if(m.type==='done'){if(!active.output.textContent)active.output.textContent=t('Kod tamamlandı; yazdırılan çıktı yok.', 'Finished. The code produced no output.');finish(t('Tamamlandı', 'Finished'));}
      };
      worker.postMessage({type:'init',files:bundle.files,config:{week:4,packages:[],outputTrace:''}});
    });
  }
  document.querySelectorAll('pre.python-example').forEach(pre=>{
    const original=pre.textContent,id=Number(pre.dataset.python),box=document.createElement('div');
    box.className='python-cell';box.id='python-example-'+id;
    box.innerHTML=`<div class="python-toolbar"><b>Python · ${id}</b><div><button type="button" class="py-edit">${t('Kodu düzenle', 'Edit code')}</button> <button type="button" class="py-reset">${t('Örneği yükle', 'Restore example')}</button> <button type="button" class="py-stop" disabled>Stop</button> <button type="button" class="btn py-run">Run</button></div></div><p class="python-hint">${t('Her çalıştırma bağımsızdır. Değerleri değiştirmek için “Kodu düzenle”yi kullanın.', 'Each run is independent. Select Edit code to change the values.')}</p><div class="python-panes"><div class="python-code"><b>${t('Kod', 'Code')}</b><pre class="py-numbered"></pre><textarea class="py-editor" spellcheck="false" hidden aria-label="Python ${id} ${t('kodu', 'code')}"></textarea></div><div class="python-result"><b>${t('Çıktı', 'Output')}</b><pre class="py-output">${t('Çıktıyı görmek için Run’a basın.', 'Select Run to see the output.')}</pre><p class="py-status" role="status" aria-live="polite"></p></div></div><div class="py-inputs" hidden><label>${t('input() yanıtları — her çağrı için bir satır', 'Responses to input(), one per call')}<textarea class="py-input" aria-label="Python ${id} ${t('giriş değerleri', 'input values')}" rows="3"></textarea></label></div>`;
    pre.replaceWith(box);
    const find=s=>box.querySelector(s),editor=find('.py-editor'),numbered=find('.py-numbered'),edit=find('.py-edit');
    editor.value=original;
    const c={id,run:find('.py-run'),stop:find('.py-stop'),output:find('.py-output'),status:find('.py-status')};cells.push(c);
    c.run.setAttribute('aria-label','Run Python '+id);
    function draw(){numbered.replaceChildren(...editor.value.split('\n').map((line,index)=>{const row=document.createElement('span');row.className='py-line';const n=document.createElement('span');n.className='py-line-number';n.textContent=index+1;n.setAttribute('aria-hidden','true');const text=document.createElement('span');text.textContent=line||' ';row.append(n,text);return row;}));find('.py-inputs').hidden=!/\binput\s*\(/.test(editor.value);}
    draw();
    edit.onclick=()=>{const editing=editor.hidden;editor.hidden=!editing;numbered.hidden=editing;edit.textContent=editing?t('Kodu oku', 'Read code'):t('Kodu düzenle', 'Edit code');if(editing)editor.focus();};
    editor.oninput=()=>{draw();c.status.textContent=t('Kod değişti. Gösterilen eski çıktı için yeniden Run’a basın.', 'The code changed. Select Run to refresh the output.');};
    find('.py-reset').onclick=()=>{editor.value=original;draw();c.output.textContent=t('Örnek yüklendi. Run’a basın.', 'Example restored. Select Run.');c.status.textContent='';};
    c.stop.onclick=()=>terminate(t('Durduruldu. Run ile yeniden başlayabilirsiniz.', 'Stopped. Select Run to start again.'));
    c.run.onclick=async()=>{
      if(active)return;
      active=c;cells.forEach(x=>x.run.disabled=true);c.stop.disabled=false;c.output.textContent='';c.status.textContent=t('Python hazırlanıyor…', 'Starting Python…');
      // The lesson stays responsive even if edited Python runs forever.
      const ticket={};c.ticket=ticket;
      const source=editor.value, responses=find('.py-input').value.split('\n');
      timer=setTimeout(()=>terminate(t('Yükleme zaman aşımı. Run ile yeniden deneyin.', 'Loading timed out. Select Run to retry.')),60000);
      try{
        await startWorker(c,ticket);
        if(active!==c||c.ticket!==ticket)return;
        clearTimeout(timer);timer=setTimeout(()=>terminate(t('20 saniye sınırı aşıldı. Döngüyü kontrol edip yeniden deneyin.', 'The 20-second limit was reached. Check the loop and try again.')),20000);
        c.status.textContent=t('Çalışıyor…', 'Running…');
        // A new dict prevents examples and reruns from depending on old variables.
        worker.postMessage({type:'run',id,realm:'lesson',inputs:responses,code:'exec('+JSON.stringify(source)+', {"__name__": "__main__"})'});
      }catch(error){if(active===c){c.output.textContent=String(error.message||error);finish(t('Çalıştırılamadı; Run ile yeniden deneyin.', 'The run failed. Select Run to retry.'));}}
    };
  });
})();
