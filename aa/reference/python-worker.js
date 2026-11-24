"use strict";
const base="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let runtime=null, busy=false, runId=null, used=0, truncated=false;
function emit(kind,value){
  if(runId===null)return;
  const message=String(value);
  const remaining=16000-used;
  if(remaining<=0){if(!truncated){truncated=true;postMessage({type:"truncated",id:runId});}return;}
  const chunk=message.slice(0,remaining);used+=chunk.length;
  postMessage({type:kind,id:runId,text:chunk});
  if(chunk.length<message.length&&!truncated){truncated=true;postMessage({type:"truncated",id:runId});}
}
onmessage=async({data})=>{
  if(busy||data.type!=="run")return;
  busy=true;runId=data.id;used=0;truncated=false;
  let globals=null;
  try{
    if(!runtime){
      importScripts(base+"pyodide.js");
      runtime=await loadPyodide({indexURL:base});
      runtime.setStdout({batched:line=>emit("stdout",line+"\n")});
      runtime.setStderr({batched:line=>emit("stderr",line+"\n")});
      runtime.setStdin({stdin:()=>null});
    }
    postMessage({type:"ready",id:runId});
    globals=runtime.toPy({});
    globals.set("__name__","__main__");
    const result=await runtime.runPythonAsync(data.code,{globals});
    if(result&&typeof result.destroy==="function")result.destroy();
    postMessage({type:"done",id:runId});
  }catch(error){emit("stderr",String(error.message||error)+"\n");postMessage({type:"failed",id:runId});}
  finally{if(globals)globals.destroy();busy=false;runId=null;}
};
