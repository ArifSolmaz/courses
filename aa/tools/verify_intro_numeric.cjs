/* Pure production helpers checked against Python results and arbitrary integer arithmetic. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
let source=fs.readFileSync(path.join(__dirname,'../assets/anim-w2.js'),'utf8');
source=source.replace(/\}\)\(\);\s*$/,'globalThis.audit={fixed,floatRepr,pyInt,pyFloat,intAdd};})();');
const context={AAAnim:{ui:{fmt:String,esc:String},register(){}}};vm.runInNewContext(source,context);const a=context.audit;let checks=0;
function eq(x,y){assert.equal(x,y);checks++}
for(const text of ['0','-0','+12','  -42  ','1_000_000','9007199254740991','9007199254740992','999999999999999999999999','-999999999999999999999999']){const r=a.pyInt(text);eq(r.t,'int');eq(String(r.v),BigInt(text.trim().replaceAll('_','')).toString());eq(String(a.intAdd(r.v,5)),(BigInt(text.trim().replaceAll('_',''))+5n).toString())}
for(const text of ['','2.5','12junk','1e3','_1','1_','1__2'])eq(Boolean(a.pyInt(text).err),true);
for(const [text,val] of [['1_2_3.4',123.4],['-1e3',-1000],['.5',.5],['1e309',Infinity],['-infinity',-Infinity]]){eq(a.pyFloat(text).t,'float');eq(a.pyFloat(text).v,val)}
for(const text of ['1__2','1,2','5tail'])eq(Boolean(a.pyFloat(text).err),true);
// Expected strings are from CPython format(..., '.2f') and repr(...).
for(const [n,out] of [[-0,'-0.00'],[2.675,'2.67'],[1.125,'1.12'],[1.375,'1.38'],[-1.125,'-1.12'],[1e21,'1000000000000000000000.00'],[1e22,'10000000000000000000000.00'],[1.234e21,'1234000000000000000000.00']])eq(a.fixed(n,2),out);
for(const [n,out] of [[-0,'-0.0'],[1e-5,'1e-05'],[1e-4,'0.0001'],[1e15,'1000000000000000.0'],[1e16,'1e+16'],[Infinity,'inf'],[-Infinity,'-inf']])eq(a.floatRepr(n),out);
console.log(`${checks} introductory Python numeric assertions passed.`);
