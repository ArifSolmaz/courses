/* Bounded CSV compatibility/codec oracles, without a browser or packages.
 * Run: node aa/tools/verify_pilot_csv.cjs [--report /outside/aa/result.json]
 * The captured v1 fixture below came from the previously deployed pilot,
 * independently of the new CSV reader/writer. All records are synthetic.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const M=require('../bridge/capstone/pilot/model.js'),C=require('../bridge/capstone/pilot/csv.js');
const csvPath=path.resolve(__dirname,'../bridge/capstone/pilot/csv.js');
const LEGACY_CAPTURED="﻿\"Öğrenci kodu\",\"Durum\",\"Hatalar\",\"Süre (dakika)\",\"Seçenek başlangıç (0–4)\",\"Seçenek aktarım (0–4)\",\"Seçenek farkı (aktarım − başlangıç)\",\"Özpuan başlangıç (0–8)\",\"Özpuan aktarım (0–8)\",\"Özpuan farkı (aktarım − başlangıç)\",\"Öğretmen başlangıç toplamı (0–8)\",\"Öğretmen aktarım toplamı (0–8)\",\"Öğretmen toplam farkı (aktarım − başlangıç)\",\"Kodları ve döngüleri takip etmek · öğretmen başlangıç (0–2)\",\"Kodları ve döngüleri takip etmek · başlangıç kanıtı\",\"Kodları ve döngüleri takip etmek · öğretmen aktarım (0–2)\",\"Kodları ve döngüleri takip etmek · aktarım kanıtı\",\"Kodları ve döngüleri takip etmek · öğretmen farkı (aktarım − başlangıç)\",\"Matematiksel ifadeleri anlamak · öğretmen başlangıç (0–2)\",\"Matematiksel ifadeleri anlamak · başlangıç kanıtı\",\"Matematiksel ifadeleri anlamak · öğretmen aktarım (0–2)\",\"Matematiksel ifadeleri anlamak · aktarım kanıtı\",\"Matematiksel ifadeleri anlamak · öğretmen farkı (aktarım − başlangıç)\",\"Konuların ne işe yaradığını görmek · öğretmen başlangıç (0–2)\",\"Konuların ne işe yaradığını görmek · başlangıç kanıtı\",\"Konuların ne işe yaradığını görmek · öğretmen aktarım (0–2)\",\"Konuların ne işe yaradığını görmek · aktarım kanıtı\",\"Konuların ne işe yaradığını görmek · öğretmen farkı (aktarım − başlangıç)\",\"Konular arasındaki bağlantıları kurmak · öğretmen başlangıç (0–2)\",\"Konular arasındaki bağlantıları kurmak · başlangıç kanıtı\",\"Konular arasındaki bağlantıları kurmak · öğretmen aktarım (0–2)\",\"Konular arasındaki bağlantıları kurmak · aktarım kanıtı\",\"Konular arasındaki bağlantıları kurmak · öğretmen farkı (aktarım − başlangıç)\",\"Takılma noktası\",\"Öğretmen notları\",\"Oturum sonuç notu\"\r\n\"P01\",\"Geçerli\",\"\",\"24.5\",\"1\",\"3\",2,\"2\",\"6\",4,3,5,2,\"0\",\"pre code: gözlenen açıklama, 0 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",\"2\",\"post code: gözlenen açıklama, 2 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",2,\"1\",\"pre math: gözlenen açıklama, 1 puan. \",\"2\",\"post math: gözlenen açıklama, 2 puan. \",1,\"2\",\"pre purpose: gözlenen açıklama, 2 puan. \",\"1\",\"post purpose: gözlenen açıklama, 1 puan. \",-1,\"0\",\"pre links: gözlenen açıklama, 0 puan. \",\"0\",\"post links: gözlenen açıklama, 0 puan. \",0,\"'=HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",\"İlk adımda koşulu atladı.\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P02\",\"Geçerli\",\"\",\"31\",\"4\",\"2\",-2,\"8\",\"\",\"\",\"\",\"\",\"\",\"2\",\"pre code: gözlenen açıklama, 2 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",\"1\",\"post code: gözlenen açıklama, 1 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",-1,\"\",\"\",\"2\",\"post math: gözlenen açıklama, 2 puan. \",\"\",\"0\",\"pre purpose: gözlenen açıklama, 0 puan. \",\"\",\"\",\"\",\"1\",\"pre links: gözlenen açıklama, 1 puan. \",\"2\",\"post links: gözlenen açıklama, 2 puan. \",1,\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P03\",\"Geçersiz — özete alınmadı\",\"minutes: 0–120 arasında sonlu bir sayı olmalı.\",\"'-1\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"2\",\"pre code: gözlenen açıklama, 2 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",\"2\",\"post code: gözlenen açıklama, 2 puan. =HYPERLINK(\"\"https://example.invalid\"\",\"\"deneme\"\")\n<img src=x onerror=\"\"window.pilotInjected=true\"\">; Türkçe, \"\"kanıt\"\"\",\"\",\"2\",\"pre math: gözlenen açıklama, 2 puan. \",\"2\",\"post math: gözlenen açıklama, 2 puan. \",\"\",\"2\",\"pre purpose: gözlenen açıklama, 2 puan. \",\"2\",\"post purpose: gözlenen açıklama, 2 puan. \",\"\",\"2\",\"pre links: gözlenen açıklama, 2 puan. \",\"2\",\"post links: gözlenen açıklama, 2 puan. \",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P04\",\"Boş\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P05\",\"Boş\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P06\",\"Boş\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P07\",\"Boş\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n\"P08\",\"Boş\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"Bir sonraki ders: aday ile koşulu birlikte konuştur.\"\r\n";
const CAPTURED_SHA256='f91c1364839bf345efb23c1ffc3bd9428a8eea7d8135de35c30250c460ce9e63';
let assertions=0,structuralRejections=0,codecCases=0;
const equal=(a,b,message)=>{assert.deepStrictEqual(a,b,message);assertions++;};
const ok=(value,message)=>{assert.ok(value,message);assertions++;};
function reject(text,label){assert.throws(()=>C.parse(text),error=>error instanceof Error&&error.message.startsWith('CSV okunamadı:'),label);assertions++;structuralRejections++;}
const clone=value=>structuredClone(value);
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}

// A lexical-regex oracle reads known well-formed CSV, rather than reusing the
// production state machine. The always-quoted writer builds adversarial
// matrices independently of either pilot exporter.
function readCSV(text){
 text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],position=0;
 const token=/("(?:[^"]|"")*"|[^,"\r\n]*)(,|\r\n|\n|$)/gy;
 while(position<text.length){token.lastIndex=position;const found=token.exec(text);assert(found&&found.index===position,'Oracle expects well-formed CSV');
  let value=found[1];if(value.startsWith('"'))value=value.slice(1,-1).replace(/""/g,'"');row.push(value);position=token.lastIndex;
  if(found[2]!==','){rows.push(row);row=[];}if(found[2]==='')break;
 }
 if(row.length)rows.push(row);return rows;
}
function writeCSV(rows,newline='\r\n'){return rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join(newline)+newline;}
function score(record,id,pre,post){record.teacher[id]={pre,post,evidencePre:pre===null?'':'İlk yanıttan kanıt',evidencePost:post===null?'':'Son yanıttan kanıt'};}
function metric(value,n,pre,post,delta,label){equal(value.n,n,label+' n');equal(value.preMean,pre,label+' pre');equal(value.postMean,post,label+' post');equal(value.deltaMean,delta,label+' delta');}

equal(Object.keys(C).sort(),['MAX_BYTES','parse','toCSV'].sort(),'Small public CSV API');
equal(C.MAX_BYTES,1048576,'File gate is one MiB of UTF-8 bytes');
equal(crypto.createHash('sha256').update(LEGACY_CAPTURED).digest('hex'),CAPTURED_SHA256,'Immutable deployed v1 fixture capture');
const oldHeaders=readCSV(M.toCSV(M.IDS.map(M.createRecord)))[0];
equal(oldHeaders.length,36,'Old exporter still has 36 columns');
const blankV2=C.toCSV(M.IDS.map(M.createRecord)),blankMatrix=readCSV(blankV2);
equal(blankMatrix.length,9,'New export keeps all eight slots');
equal(blankMatrix[0],[...oldHeaders,'Dosya biçimi'],'The existing header schema is retained exactly');
blankMatrix.slice(1).forEach(row=>{equal(row.length,37,'Rectangular new CSV');equal(row[36],'AA-PILOT-2','Explicit reversible text encoding version');});
const empty=C.parse(blankV2);
equal(empty.format,'v2');equal(empty.warnings,[]);equal(empty.summary.activeCount,0);equal(empty.records,M.IDS.map(M.createRecord),'Blank numeric cells restore to null');

// External v1 capture arithmetic, calculated from its original exported raw
// inputs rather than from the derived CSV columns or the current writer.
const captured=C.parse(LEGACY_CAPTURED);
equal(captured.format,'legacy');equal(captured.summary.activeCount,3);equal(captured.summary.completeTeacherCount,1);
metric(captured.summary.totals.teacher,1,3,5,2,'Captured teacher totals');
metric(captured.summary.totals.choice,2,2.5,2.5,0,'Captured choice totals');
metric(captured.summary.totals.self,1,2,6,4,'Captured self totals');
equal(captured.records[2].minutes,'-1','Old protected invalid raw negative is decoded, not treated as missing');
equal(captured.summary.invalid.map(item=>item.id),['P03'],'The invalid entire record remains out');
equal(captured.summary.timing,{n:2,mean:27.75,min:24.5,max:31,within25:1,within30:1},'Old captured duration results');
ok(captured.warnings.filter(text=>text.includes('eski CSV')).length===1,'Legacy ambiguity is explained once');
equal(captured.records[0].teacher.code.pre,'0','Real zero remains a raw score, never a blank');

const fixture=M.IDS.map(M.createRecord);
for(const id of M.DIMENSIONS.map(d=>d.id))score(fixture[0],id,'0','2');
Object.assign(fixture[0],{minutes:'25.5',choice:{pre:'0',post:'4'},self:{pre:'8',post:'0'},
 notes:'Türkçe: çığ, şüphe; "iki söz"\nYeni satır.',bottleneck:'A, B ve C'});
score(fixture[1],'code','3','0');fixture[1].teacher.code.evidencePost='';fixture[1].choice.pre='NaN';
fixture[2].minutes='Geçersiz sayı (alanı yeniden gir)';fixture[2].notes='Önce yeniden girilecek.';
const frozen=freeze(clone(fixture)),before=clone(frozen);
const round=C.parse(C.toCSV(frozen,{conclusion:'Gözlem, "etki" kanıtı değil.\nİkinci satır.'}));
equal(round.records,frozen,'Raw strings, Unicode and quoted multiline evidence round-trip');
equal(round.conclusion,'Gözlem, "etki" kanıtı değil.\nİkinci satır.');
equal(round.summary,M.summarize(fixture),'Summary is recomputed from restored raw fields');
equal(round.summary.invalid.map(item=>item.id),['P02','P03'],'Bad scores and missing proof are restored with warnings');
ok(round.warnings.some(text=>text.startsWith('P02 '))&&round.warnings.some(text=>text.startsWith('P03 ')),'Each restored invalid record is visible');
equal(frozen,before,'Export does not mutate raw records');

const textCases=[
 ['literal','literal'],["'literal","''literal"],["'","''"],["''literal","'''literal"],
 ['=1+1',"'=1+1"],['+CMD',"'+CMD"],['-1+2',"'-1+2"],['@SUM(1)',"'@SUM(1)"],
 ['\t=1',"'\t=1"],['\r=1',"'\r=1"],[' \n=1',"' \n=1"],["'=oldliteral","''=oldliteral"],
 ["''=two","'''=two"],["'\t=1","''\t=1"],['a,"b"\nçığ','a,"b"\nçığ']
];
for(const [raw,encoded]of textCases){
 const records=M.IDS.map(M.createRecord);records[0].notes=raw;records[0].bottleneck=raw;
 score(records[0],'code','1',null);records[0].teacher.code.evidencePre=raw;
 const original=clone(records);let exported=C.toCSV(records,{conclusion:raw});
 const cells=readCSV(exported);equal(cells[1][34],encoded,'Hand-specified v2 encoded text');
 for(let cycle=0;cycle<3;cycle++){
  const restored=C.parse(exported);equal(restored.records,original,'Cycle '+cycle+' restores exact raw text');equal(restored.conclusion,raw,'Conclusion follows same reversible codec');equal(restored.format,'v2');
  const next=C.toCSV(restored.records,{conclusion:restored.conclusion});equal(next,exported,'UI-domain CSV bytes remain stable across repeated cycles');exported=next;codecCases++;
 }
}
// Legacy has an unavoidable ambiguity only when a literal apostrophe is
// immediately followed by a dangerous prefix. The documented decode policy
// and warning are tested explicitly instead of claiming a lossless v1 codec.
for(const [raw,expected]of [["'literal","'literal"],["'=literal",'=literal'],['=formula','=formula'],["''=literal","''=literal"]]){
 const records=M.IDS.map(M.createRecord);records[0].notes=raw;
 const result=C.parse(M.toCSV(records));equal(result.records[0].notes,expected,'Declared legacy apostrophe policy');equal(result.warnings.length,1,'One legacy ambiguity message');
}
const negative=M.IDS.map(M.createRecord);for(const id of M.DIMENSIONS.map(d=>d.id))score(negative[0],id,'2','0');
negative[0].choice={pre:'4',post:'0'};negative[0].self={pre:'8',post:'0'};
const negCells=readCSV(C.toCSV(negative));equal(negCells[1][6],'-4');equal(negCells[1][9],'-8');equal(negCells[1][12],'-8');equal(negCells[1][17],'-2','Computed negative deltas remain numeric without a protective apostrophe');
const nan=M.IDS.map(M.createRecord);nan[0].choice.pre=NaN;
equal(C.parse(C.toCSV(nan)).records[0].choice.pre,'NaN','Nonfinite raw value remains an invalid editable string');

const validMatrix=readCSV(C.toCSV(fixture,{conclusion:'Oturum aynı.'}));
const reverseColumns=validMatrix.map(row=>row.slice().reverse());
const reverseEverything=[reverseColumns[0],...reverseColumns.slice(1).reverse()];
const reordered=C.parse(writeCSV(reverseEverything));equal(reordered.records,fixture,'Header map and IDs permit any column and row order');
equal(reordered.conclusion,'Oturum aynı.');
equal(C.parse('\uFEFF'+writeCSV(validMatrix,'\n')).records,fixture,'BOM and LF files accepted');
equal(C.parse(writeCSV(validMatrix)+'\r\n\n').records,fixture,'Only terminal physical empty lines are ignored');
const poisoned=clone(validMatrix);
for(const row of poisoned.slice(1))for(const i of [1,2,6,9,10,11,12,17,22,27,32])row[i]='=globalThis.__pilotCSVWasEvaluated=1';
equal(C.parse(writeCSV(poisoned)).summary,round.summary,'Statuses, errors and every derived score column are ignored');
equal(globalThis.__pilotCSVWasEvaluated,undefined,'CSV formulas and text are never evaluated');

function changed(mutator){const rows=clone(validMatrix);mutator(rows);return writeCSV(rows);}
reject(changed(rows=>{rows[1][0]='P09';}),'Unknown ID');
reject(changed(rows=>{rows[1][0]='constructor';}),'Prototype-like ID cannot become an object key');
reject(changed(rows=>{rows[2][0]='P01';}),'Duplicate ID / missing corresponding ID');
reject(changed(rows=>rows.pop()),'Missing row');
reject(changed(rows=>rows.push(clone(rows[1]))),'Extra row');
reject(changed(rows=>rows[1].pop()),'Short row');
reject(changed(rows=>rows[1].push('extra')),'Long row');
reject(changed(rows=>{rows[0][1]=rows[0][0];}),'Duplicate header');
reject(changed(rows=>{rows[0][1]='Tanınmayan başlık';}),'Unknown header');
equal(C.parse(changed(rows=>rows.forEach(row=>row.pop()))).format,'legacy','Removing the version column yields the old schema, with its explicit ambiguity policy');
reject(changed(rows=>{rows[1][36]='AA-PILOT-3';}),'Unsupported version');
reject(changed(rows=>{rows[1][36]='';}),'Missing version on one row');
reject(changed(rows=>{rows[1][35]='Bir başka oturum.';}),'Conflicting repeated conclusion');
reject(changed(rows=>{rows[1][34]='NUL\0burada';}),'NUL anywhere in data');
for(const bad of ['', '\uFEFF', '\n\n', 'a"b,c\n', '"a" x,b\n', '"a', 'a,b\rc,d'])reject(bad,'Malformed or missing CSV');
for(const bad of [undefined,null,{},42])reject(bad,'Text argument required');
reject(writeCSV(validMatrix).replace('\r\n','\r\n\r\n'),'Empty line inside data is not terminal');
reject(writeCSV(validMatrix)+'""\r\n','A quoted empty extra record is not a physical blank line');

for(const [column,max]of [[14,1200],[16,1200],[19,1200],[21,1200],[24,1200],[26,1200],[29,1200],[31,1200],[33,500],[34,1200]]){
 const rows=clone(validMatrix);rows[1][column]='x'.repeat(max);ok(C.parse(writeCSV(rows)).records.length===8,'Text field exact boundary');
 rows[1][column]+='x';reject(writeCSV(rows),'Overlong editable field is rejected before applying');
}
const maxConclusion=clone(validMatrix);maxConclusion.slice(1).forEach(row=>row[35]='x'.repeat(1200));equal(C.parse(writeCSV(maxConclusion)).conclusion.length,1200);maxConclusion.slice(1).forEach(row=>row[35]+='x');reject(writeCSV(maxConclusion),'Conclusion cannot be silently truncated');
const unicode=clone(validMatrix);unicode[1][14]='😀'.repeat(600);equal(C.parse(writeCSV(unicode)).records[0].teacher.code.evidencePre.length,1200);unicode[1][14]+='😀';reject(writeCSV(unicode),'HTML maxlength uses UTF-16 code units');

// The UTF-8 byte boundary is tested using an ignored derived column, keeping
// all editable text below its much smaller UI limit. Buffer.byteLength is an
// independent byte oracle for the browser-compatible production counter.
const sizeFixture=readCSV(blankV2);sizeFixture[1][1]='';
const overhead=Buffer.byteLength(writeCSV(sizeFixture),'utf8');
sizeFixture[1][1]='ş'.repeat(Math.floor((C.MAX_BYTES-overhead)/2))+((C.MAX_BYTES-overhead)%2?'a':'');
const atLimit=writeCSV(sizeFixture);equal(Buffer.byteLength(atLimit),C.MAX_BYTES);equal(C.parse(atLimit).summary.activeCount,0,'Exactly one MiB accepted; derived filler is ignored');
reject(atLimit+'a','One byte over limit');
reject('ş'.repeat(C.MAX_BYTES/2+1),'UTF-8 bytes, not JS character count');

const oldFile=fs.readFileSync(path.resolve(__dirname,'../bridge/capstone/pilot/model.js'));
const browser={AAPilot:M};vm.runInNewContext(fs.readFileSync(csvPath,'utf8'),browser,{timeout:1000});
equal(browser.AAPilotCSV.MAX_BYTES,C.MAX_BYTES,'Browser module exposes the same size cap');
equal(JSON.parse(JSON.stringify(browser.AAPilotCSV.parse(blankV2))),empty,'Browser/CommonJS parser parity');
equal(browser.AAPilotCSV.toCSV(M.IDS.map(M.createRecord)),blankV2,'Browser/CommonJS writer parity');
equal(fs.readFileSync(path.resolve(__dirname,'../bridge/capstone/pilot/model.js')),oldFile,'Tests never modify the old model/export source');

const result={status:'passed',assertions,structuralRejections,codecCases,syntheticDataOnly:true,
 capturedLegacy:{source:'outputs/aa-pilot-paketi/canli-test-doldurulmus-karsilastirma.csv',deployedCommit:'73e01495a0cc2f0f36c9cc5c320ff5420775a474',sha256:CAPTURED_SHA256},
 coverage:['captured v1 external fixture arithmetic','v2 reversible leading apostrophe and formula-prefix text','three export/import cycles',
 'BOM/CRLF/LF and quoted Unicode multiline text','all-column and row reordering','raw invalid editable record warnings',
 'derived columns ignored and recomputed','strict atomic structural rejection','editable text limits','UTF-8 byte boundary','old exporter untouched','browser/CommonJS parity']};
if(process.argv.includes('--report')){const dest=path.resolve(process.argv[process.argv.indexOf('--report')+1]||''),aa=path.resolve(__dirname,'..');if(dest===aa||dest.startsWith(aa+path.sep))throw new Error('Report must be outside AA');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
