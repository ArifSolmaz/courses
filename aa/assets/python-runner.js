/* Week-page Python examples: CP1's bundled Pyodide worker, fresh scope per run. */
(() => {
  const base = new URL('.', document.currentScript.src);
  let runtimePromise, worker, pending, active, timer;
  const cells = [];
  function runtime() {
    if (!runtimePromise) runtimePromise = new Promise((resolve,reject) => {
      const script=document.createElement('script'); script.src=new URL('python-runtime.js',base);
      script.onload=()=>resolve(window.AA_PYTHON_RUNTIME);
      script.onerror=()=>{script.remove();runtimePromise=null;reject(Error('Python yüklenemedi. Bağlantıyı kontrol edip Run ile yeniden deneyin.'));};
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
    if(active!==c||c.ticket!==ticket)throw Error("Çalıştırma iptal edildi.");
    const url=URL.createObjectURL(new Blob([bundle.worker],{type:'text/javascript'}));
    worker=new Worker(url);URL.revokeObjectURL(url);
    await new Promise((resolve,reject)=>{
      pending={resolve,reject};
      worker.onerror=()=>terminate('Python başlatılamadı. Run ile yeniden deneyin.');
      worker.onmessage=({data:m})=>{
        if(m.type==='ready'){pending?.resolve();pending=null;return;}
        if(m.type==='fatal'){terminate('Python yükleme hatası: '+m.text);return;}
        if(!active || m.id!==active.id)return;
        if(m.type==='stream')active.output.textContent+=m.text;
        if(m.type==='error'){active.output.textContent+='\n'+m.text;finish('Kod hatası — düzenleyip tekrar çalıştırabilirsiniz.');}
        if(m.type==='done'){if(!active.output.textContent)active.output.textContent='Kod tamamlandı; yazdırılan çıktı yok.';finish('Tamamlandı');}
      };
      worker.postMessage({type:'init',files:bundle.files,config:{week:4,packages:[],outputTrace:''}});
    });
  }
  document.querySelectorAll('pre.python-example').forEach(pre=>{
    const original=pre.textContent,id=Number(pre.dataset.python),box=document.createElement('div');
    box.className='python-cell';box.id='python-example-'+id;
    box.innerHTML=`<div class="python-toolbar"><b>Python · ${id}</b><div><button type="button" class="py-edit">Kodu düzenle</button> <button type="button" class="py-reset">Örneği yükle</button> <button type="button" class="py-stop" disabled>Stop</button> <button type="button" class="btn py-run">Run</button></div></div><p class="python-hint">Her çalıştırma bağımsızdır. Değerleri değiştirmek için “Kodu düzenle”yi kullanın.</p><div class="python-panes"><div class="python-code"><b>Kod</b><pre class="py-numbered"></pre><textarea class="py-editor" spellcheck="false" hidden aria-label="Python ${id} kodu"></textarea></div><div class="python-result"><b>Çıktı</b><pre class="py-output">Çıktıyı görmek için Run’a basın.</pre><p class="py-status" role="status" aria-live="polite"></p></div></div><div class="py-inputs" hidden><label>input() yanıtları — her çağrı için bir satır<textarea class="py-input" aria-label="Python ${id} giriş değerleri" rows="3"></textarea></label></div>`;
    pre.replaceWith(box);
    const find=s=>box.querySelector(s),editor=find('.py-editor'),numbered=find('.py-numbered'),edit=find('.py-edit');
    editor.value=original;
    const c={id,run:find('.py-run'),stop:find('.py-stop'),output:find('.py-output'),status:find('.py-status')};cells.push(c);
    c.run.setAttribute('aria-label','Run Python '+id);
    function draw(){numbered.replaceChildren(...editor.value.split('\n').map((line,index)=>{const row=document.createElement('span');row.className='py-line';const n=document.createElement('span');n.className='py-line-number';n.textContent=index+1;n.setAttribute('aria-hidden','true');const text=document.createElement('span');text.textContent=line||' ';row.append(n,text);return row;}));find('.py-inputs').hidden=!/\binput\s*\(/.test(editor.value);}
    draw();
    edit.onclick=()=>{const editing=editor.hidden;editor.hidden=!editing;numbered.hidden=editing;edit.textContent=editing?'Kodu oku':'Kodu düzenle';if(editing)editor.focus();};
    editor.oninput=()=>{draw();c.status.textContent='Kod değişti. Gösterilen eski çıktı için yeniden Run’a basın.';};
    find('.py-reset').onclick=()=>{editor.value=original;draw();c.output.textContent='Örnek yüklendi. Run’a basın.';c.status.textContent='';};
    c.stop.onclick=()=>terminate('Durduruldu. Run ile yeniden başlayabilirsiniz.');
    c.run.onclick=async()=>{
      if(active)return;
      active=c;cells.forEach(x=>x.run.disabled=true);c.stop.disabled=false;c.output.textContent='';c.status.textContent='Python hazırlanıyor…';
      // The lesson stays responsive even if edited Python runs forever.
      const ticket={};c.ticket=ticket;
      const source=editor.value, responses=find('.py-input').value.split('\n');
      timer=setTimeout(()=>terminate('Yükleme zaman aşımı. Run ile yeniden deneyin.'),60000);
      try{
        await startWorker(c,ticket);
        if(active!==c||c.ticket!==ticket)return;
        clearTimeout(timer);timer=setTimeout(()=>terminate('20 saniye sınırı aşıldı. Döngüyü kontrol edip yeniden deneyin.'),20000);
        c.status.textContent='Çalışıyor…';
        // A new dict prevents examples and reruns from depending on old variables.
        worker.postMessage({type:'run',id,realm:'lesson',inputs:responses,code:'exec('+JSON.stringify(source)+', {"__name__": "__main__"})'});
      }catch(error){if(active===c){c.output.textContent=String(error.message||error);finish('Çalıştırılamadı; Run ile yeniden deneyin.');}}
    };
  });
})();
