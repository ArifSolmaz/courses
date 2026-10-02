let py, realms, plotScope, active = null, inputs = [], streamCount = 0, fileSupport=false;
const roots={lesson:'/home/pyodide/lesson',solutions:'/home/pyodide/solutions'};
const send = (type, data={}) => postMessage({type, id:active, ...data});
function stream(name, text) {
  if (streamCount++ < 400) send('stream', {name, text: text+'\n'});
  else if(streamCount===401) send('stream',{name:'stderr',text:'Output limit reached. Stop and restart if your loop does not finish.\n'});
}
function listFiles(realm){
  const files=[];
  function walk(path,depth){
    if(depth>4||files.length>=100)return;
    for(const name of py.FS.readdir(path)){
      if(name.startsWith('.'))continue;
      const p=path+'/'+name,stat=py.FS.lstat(p);
      if(py.FS.isDir(stat.mode))walk(p,depth+1);
      else if(py.FS.isFile(stat.mode)&&stat.size<=10*1024*1024)files.push({name:p.slice(roots[realm].length+1),size:stat.size});
    }
  }
  walk(roots[realm],0);send('files',{realm,files});
}
self.onmessage = async ({data:m}) => {
  try {
    if(m.type==='init') {
      const raw = {};
      for(const [name,b64] of Object.entries(m.files)) raw[name]=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
      self.fetch = async url => {
        const name=String(url).split('/').pop();
        if(!String(url).startsWith('https://offline.invalid/') || !raw[name]) throw Error('This offline edition does not include: '+name);
        return new Response(raw[name],{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});
      };
      py=await loadPyodide({indexURL:'https://offline.invalid/',packageBaseUrl:'https://offline.invalid/',lockFileContents:new TextDecoder().decode(raw['pyodide-lock.json']),
        stdout:s=>stream('stdout',s),stderr:s=>stream('stderr',s),stdin:()=>inputs.length?inputs.shift():null});
      if(m.config.packages?.length){
        send('loading',{text:'Loading bundled NumPy and plotting libraries…'});
        const failures=[];
        await py.loadPackage(m.config.packages,{errorCallback:message=>failures.push(message)});
        if(failures.length)throw Error(failures.join("\n"));
        py.registerJsModule('offline_ui',{plot:png=>send('plot',{png})});
        plotScope=py.runPython("dict(__name__='__offline_plots__')");
        py.runPython(m.config.plotSetup,{globals:plotScope});
      }
      realms={lesson:py.globals,solutions:py.runPython("dict(__name__='__main__')")};
      for(const path of Object.values(roots))py.FS.mkdirTree(path);
      fileSupport=m.config.week>=11;
      send('ready');
    } else if(m.type==='run') {
      active=m.id;streamCount=0;inputs=m.inputs;
      const realm=m.realm||'lesson';py.FS.chdir(roots[realm]);
      try {
        const result=await py.runPythonAsync(m.code,{globals:realms[realm],filename:'Cell '+(m.id+1)});
        if(result!==undefined) {stream('stdout',String(result));if(result?.destroy)result.destroy();}
        if(plotScope)py.runPython('show_offline()',{globals:plotScope});
        send('done');
      } catch(e) {if(plotScope)py.runPython('plt.close("all")',{globals:plotScope});send('error',{text:String(e)});}
      if(fileSupport)listFiles(realm);
      active=null;
    } else if(m.type==='getFile'){
      if(!roots[m.realm]||m.name.split('/').some(s=>s==='..'||s===''))throw Error('Invalid file path');
      const path=roots[m.realm]+'/'+m.name;
      if(py.FS.stat(path).size>10*1024*1024)throw Error('File exceeds the 10 MB download limit.');
      send('download',{name:m.name.split('/').at(-1),bytes:py.FS.readFile(path)});
    }
  } catch(e) {send(m.type==='getFile'?'fileError':'fatal',{text:String(e)});}
};
