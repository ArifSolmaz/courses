let py, realms, active = null, inputs = [], streamCount = 0;
const send = (type, data={}) => postMessage({type, id:active, ...data});
function stream(name, text) {
  if (streamCount++ < 400) send('stream', {name, text: text+'\n'});
  else if(streamCount===401) send('stream',{name:'stderr',text:'Output limit reached. Stop and restart if your loop does not finish.\n'});
}
self.onmessage = async ({data:m}) => {
  try {
    if(m.type==='init') {
      const raw = {};
      for(const [name,b64] of Object.entries(m.files)) raw[name]=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
      // Resolve only bundled runtime assets. There is no network fallback.
      self.fetch = async url => {
        const name=String(url).split('/').pop();
        if(!String(url).startsWith('https://offline.invalid/') || !raw[name]) throw Error('This offline edition does not include: '+name);
        return new Response(raw[name],{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});
      };
      py=await loadPyodide({indexURL:'https://offline.invalid/',lockFileContents:new TextDecoder().decode(raw['pyodide-lock.json']),
        stdout:s=>stream('stdout',s),stderr:s=>stream('stderr',s),
        stdin:()=>inputs.length?inputs.shift():null});
      realms={lesson:py.globals,solutions:py.runPython("dict(__name__='__main__')")};
      send('ready');
    } else if(m.type==='run') {
      active=m.id; streamCount=0; inputs=m.inputs;
      try {
        const result=await py.runPythonAsync(m.code,{globals:realms[m.realm||'lesson']});
        if(result!==undefined) {stream('stdout',String(result)); if(result?.destroy) result.destroy();}
        send('done');
      } catch(e) {send('error',{text:String(e)});}
      active=null;
    }
  } catch(e) {send('fatal',{text:String(e)});}
};
