/* Local, synthetic-only preview. Never connects to Google or stores student data. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(read('challenges.js')+read('cloud/core.js'),ctx);
let state=ctx.PhyCloud.blank();
let html=read('cloud/instructor.html').replace('<!-- WALKTHROUGH_CSS -->','<style>'+read('walkthrough.css')+'</style>').replace('<!-- CHALLENGES_JS -->','<script>'+read('challenges.js')+'</script>').replace('<!-- WALKTHROUGH_JS -->','<script>'+read('walkthrough.js')+'</script>');
html=html.replace('<script>','<script>window.google={script:{get run(){var ok,fail;return new Proxy({withSuccessHandler(f){ok=f;return this;},withFailureHandler(f){fail=f;return this;}},{get(target,key,proxy){if(key in target)return target[key].bind(proxy);return arg=>fetch("/rpc",{method:"POST",body:JSON.stringify({name:key,arg})}).then(r=>r.json()).then(r=>r.error?fail({message:r.error}):ok(r)).catch(fail);}});}}};</script><script>');
http.createServer((req,res)=>{
 if(req.url==='/rpc'&&req.method==='POST'){let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{const {name,arg}=JSON.parse(body),now=Date.now();if(name==='cloudCommand')ctx.PhyCloud.apply(state,arg,now,()=>crypto.randomUUID(),Math.random);else if(ctx.PhyCloud.normalise(state,now))state.revision++;res.end(JSON.stringify(ctx.PhyCloud.view(state,[],typeof arg==='string'?arg:arg.client,now)));}catch(e){res.end(JSON.stringify({error:e.message}));}});return;}
 res.setHeader('content-type','text/html');res.end(html);
}).listen(8766,'127.0.0.1',()=>console.log('Synthetic instructor preview: http://127.0.0.1:8766'));
