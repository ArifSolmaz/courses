const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const props=new Map(),sheets=new Map();let failFlush=false,email='owner@example.test',locks=0;
function makeSheet(name){const cells=new Map();return {getMaxRows:()=>100,insertRowsAfter(){},hideSheet(){},getRange(a,b,c=1,d=1){let row=a,col=b;if(a==='A1'){row=1;col=1;}return {getValue:()=>cells.get(row+','+col)||'',setValue(v){cells.set(row+','+col,v);return this;},setNumberFormat(){return this;},setValues(rows){rows.forEach((r,i)=>r.forEach((v,j)=>cells.set((row+i)+','+(col+j),v)));return this;},getValues:()=>Array.from({length:c},(_,i)=>Array.from({length:d},(_,j)=>cells.get((row+i)+','+(col+j))||''))};}};}
const book={getSheetByName:n=>sheets.get(n),insertSheet(n){const s=makeSheet(n);sheets.set(n,s);return s;}};
const ctx={console,PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty(k,v){props.set(k,v);}})},SpreadsheetApp:{openById:()=>book,flush(){if(failFlush)throw Error('simulated outage');}},Session:{getActiveUser:()=>({getEmail:()=>email})},Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>crypto.createHash('sha256').update(s).digest(),base64Encode:b=>Buffer.from(b).toString('base64')},cloudDeploymentConfig_:()=>({sheet:'sheet',tab:1,owner:'owner@example.test'}),PhyCloud:{blank:()=>({revision:0})}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/server.gs','utf8'),ctx);
assert.equal(ctx.cloudRead_(book).revision,0);
ctx.cloudWrite_(book,{revision:1,text:'x'.repeat(100000)});assert.equal(ctx.cloudRead_(book).text.length,100000);
ctx.cloudWrite_(book,{revision:2,text:'new'});assert.equal(ctx.cloudRead_(book).revision,2);
failFlush=true;assert.throws(()=>ctx.cloudWrite_(book,{revision:3,text:'partial'}),/outage/);assert.equal(ctx.cloudRead_(book).revision,2);failFlush=false;
assert.ok(ctx.cloudAuthorise_());email='';assert.throws(()=>ctx.cloudAuthorise_(),/Instructor access only/);email='other@example.test';assert.throws(()=>ctx.cloudAuthorise_(),/Instructor access only/);
const head=JSON.parse(props.get('PHY_HEAD'));sheets.get('_PHY101_STATE_'+head.slot).getRange(2,1).setValue('corrupted');assert.throws(()=>ctx.cloudRead_(book),/integrity/);
console.log('Storage checks passed: chunking, alternating snapshots, failed-write recovery, auth rejection and integrity validation.');
