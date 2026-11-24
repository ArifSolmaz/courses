"use strict";
(function(){
  const src=document.currentScript.src;
  const workerURL=new URL("python-worker.js",src);
  const tr=document.documentElement.lang==="tr";
  const t=(a,b)=>tr?a:b;
  let worker=null, active=null, sequence=0, timer=null, warm=false;
  const labs=Array.from(document.querySelectorAll(".python-lab"));
  function status(lab,message){lab.querySelector(".py-status").textContent=message;}
  function output(lab){return lab.querySelector(".py-output");}
  function buttons(){
    labs.forEach(lab=>{
      lab.querySelector(".py-run").disabled=!!active;
      lab.querySelector(".py-reset").disabled=active?.lab===lab;
      lab.querySelector(".py-stop").disabled=active?.lab!==lab;
    });
  }
  function finish(message,kill=false){
    clearTimeout(timer);timer=null;
    if(kill&&worker){worker.terminate();worker=null;warm=false;}
    if(active)status(active.lab,message);
    active=null;buttons();
  }
  function connect(){
    const w=new Worker(workerURL);
    w.onmessage=({data})=>{
      if(w!==worker||!active||data.id!==active.id)return;
      const lab=active.lab;
      if(data.type==="ready"){
        warm=true;status(lab,t("Python çalışıyor…","Python is running…"));
        clearTimeout(timer);timer=setTimeout(()=>finish(t("10 saniye sınırı aşıldı.","10-second execution limit reached."),true),10000);
      }else if(data.type==="stdout"||data.type==="stderr"){
        output(lab).textContent+=data.text;
      }else if(data.type==="truncated"){
        output(lab).textContent+=t("\n[Çıktı sınırı aşıldı.]\n","\n[Output limit reached.]\n");
      }else if(data.type==="done"){
        if(!output(lab).textContent)output(lab).textContent=t("(Çıktı yok; print() kullan.)","(No output; use print().)");
        finish(t("Tamamlandı.","Finished."));
      }else if(data.type==="failed"){
        finish(t("Python hatası veya yükleme sorunu. Çıktıyı incele.","Python error or loading problem. See output."),!warm);
      }
    };
    w.onerror=()=>{if(w===worker&&active)finish(t("Python yüklenemedi. İnternet bağlantısını kontrol et.","Python could not load. Check your internet connection."),true);};
    return w;
  }
  function run(lab){
    if(active)return;
    const code=lab.querySelector("textarea").value;
    output(lab).textContent="";
    active={id:++sequence,lab};buttons();
    status(lab,warm?t("Python çalışıyor…","Python is running…"):t("Python motoru yükleniyor…","Loading Python runtime…"));
    try{
      if(!worker)worker=connect();
      timer=setTimeout(()=>finish(t("Python yükleme zaman aşımı. Tekrar dene.","Python loading timed out. Try again."),true),60000);
      worker.postMessage({type:"run",id:active.id,code});
    }catch(e){output(lab).textContent=String(e);finish(t("Çalıştırılamadı.","Could not run."),true);}
  }
  for(const lab of labs){
    const editor=lab.querySelector("textarea"), initial=editor.value, initialOutput=output(lab).textContent;
    lab.querySelector(".py-run").addEventListener("click",()=>run(lab));
    lab.querySelector(".py-stop").addEventListener("click",()=>{if(active?.lab===lab)finish(t("Durduruldu.","Stopped."),true);});
    lab.querySelector(".py-reset").addEventListener("click",()=>{editor.value=initial;output(lab).textContent=initialOutput;status(lab,t("Örnek çıktı · henüz çalıştırılmadı","Expected output · not run yet"));});
    editor.addEventListener("input",()=>{if(active?.lab!==lab)status(lab,t("Kod değiştirildi; Çalıştır ile sonucu güncelle.","Code edited; run to update the result."));});
    editor.addEventListener("keydown",e=>{
      if(e.key==="Tab"&&!e.shiftKey){e.preventDefault();editor.setRangeText("    ",editor.selectionStart,editor.selectionEnd,"end");editor.dispatchEvent(new Event("input"));}
      if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();run(lab);}
    });
  }
  buttons();
})();
