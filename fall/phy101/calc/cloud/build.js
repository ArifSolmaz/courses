/* Build a private Apps Script file. Output/config stay outside the public repo.
   node build.js /absolute/output/Code.gs SHEET_ID RESPONSE_TAB OWNER_EMAIL */
const fs=require('node:fs'),path=require('node:path');
const [out,sheet,tab,owner]=process.argv.slice(2),base=path.resolve(__dirname,'..');
if(!out||!path.isAbsolute(out)||out.startsWith(base+path.sep)||!/^[-\w]{20,}$/.test(sheet||'')||!/^\d+$/.test(tab||'')||!/^\S+@\S+\.\S+$/.test(owner||''))throw Error('Supply an absolute private output path, sheet ID, response tab ID and owner email');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
let html=read('cloud/instructor.html');
html=html.replace('<!-- WALKTHROUGH_CSS -->','<style>'+read('walkthrough.css')+'</style>')
 .replace('<!-- CHALLENGES_JS -->','<script>'+read('challenges.js')+'</script>')
 .replace('<!-- WALKTHROUGH_JS -->','<script>'+read('walkthrough.js')+'</script>');
const config={sheet,tab:Number(tab),owner};
const source='var window = {};\n'+read('challenges.js')+'\n'+read('cloud/core.js')+'\n'+read('cloud/server.gs')+'\nfunction cloudDeploymentConfig_(){return '+JSON.stringify(config)+';}\nfunction cloudHtml_(){return '+JSON.stringify(html)+';}\n';
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,source,{mode:0o600});
console.log('Private Apps Script bundle built: '+Buffer.byteLength(source)+' bytes');
