/* Independent hand-calculated/HTML checks for the teacher report.
 * Run: node aa/tools/verify_pilot_report.cjs [--report /outside/aa/result.json]
 * Python's standard-library HTMLParser is an independent DOM-text oracle.
 * All fixtures are synthetic; the generated product never labels real input
 * as synthetic and never treats these tests as learning-effect evidence.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const M=require('../bridge/capstone/pilot/model.js'),R=require('../bridge/capstone/pilot/report.js');
const reportFile=path.resolve(__dirname,'../bridge/capstone/pilot/report.js');
let assertions=0,htmlDocuments=0;
const equal=(a,b,label)=>{assert.deepStrictEqual(a,b,label);assertions++;};
const ok=(value,label)=>{assert.ok(value,label);assertions++;};
const throws=fn=>{assert.throws(fn,error=>error instanceof Error&&/[öğüşıçİÖĞÜŞÇ]|Rapor/.test(error.message));assertions++;};
const clone=value=>structuredClone(value);
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function teacher(record,pre,post){M.DIMENSIONS.forEach(({id},i)=>record.teacher[id]={pre:pre[i],post:post[i],evidencePre:pre[i]===null?'':'İlk kanıt',evidencePost:post[i]===null?'':'Son kanıt'});}

const HTML_ORACLE=String.raw`
from html.parser import HTMLParser
import json,sys
class Node:
 def __init__(self,tag,attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
 def walk(self):
  yield self
  for c in self.children:
   if isinstance(c,Node):yield from c.walk()
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node('document');self.stack=[self.root]
 def handle_starttag(self,tag,attrs):
  n=Node(tag,attrs,self.stack[-1]);self.stack[-1].children.append(n)
  if tag not in ('meta','link','br','hr','img','input','source','area','base','embed','wbr'):self.stack.append(n)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==tag:del self.stack[i:];break
 def handle_data(self,data):self.stack[-1].children.append(data)
p=Parser();p.feed(sys.stdin.read());nodes=list(p.root.walk());ids={n.attrs['id']:n for n in nodes if 'id'in n.attrs}
def children(n,tag):return [c for c in n.children if isinstance(c,Node) and c.tag==tag]
tables=[]
for table in (n for n in nodes if n.tag=='table'):
 captions=[n.text()for n in table.walk()if n.tag=='caption'];rows=[];headers=[]
 for n in table.walk():
  if n.tag=='tr':
   cells=[c.text()for c in n.children if isinstance(c,Node)and c.tag in('th','td')]
   if n.parent.tag=='thead':headers=cells
   else:rows.append({'values':cells,'dimension':n.attrs.get('data-dimension')})
 tables.append({'caption':captions,'headers':headers,'rows':rows,'wrapped':table.parent.attrs.get('class')=='table-scroll'})
notes=[]
for n in ids['report-observations'].walk():
 if 'data-participant'in n.attrs:
  ps=children(n,'p');notes.append({'id':n.attrs['data-participant'],'text':n.text(),'bottleneck':ps[1].text(),'notes':ps[3].text()})
decision=children(ids['report-decision'],'p')[-1].text()
print(json.dumps({'ids':list(ids),'tags':[n.tag for n in nodes],'urls':[v for n in nodes for k,v in n.attrs.items()if k in('src','href')],'events':[k for n in nodes for k in n.attrs if k.lower().startswith('on')],'tables':tables,'notes':notes,'decision':decision,'sections':{k:v.text()for k,v in ids.items()},'paragraphs':[n.text()for n in nodes if n.tag=='p']},ensure_ascii=False))
`;
function dom(html){const process=spawnSync('python3',['-c',HTML_ORACLE],{input:html,encoding:'utf8'});assert.equal(process.status,0,process.stderr);htmlDocuments++;return JSON.parse(process.stdout);}

equal(Object.keys(R),['build'],'One public pure report API');
const blanks=M.IDS.map(M.createRecord),blank=R.build(blanks),empty=dom(blank.html);
equal(blank.summary,M.summarize(blanks),'Summary remains the model result');
ok(blank.text.startsWith('AA · Pilot öğretmen raporu'));
ok(blank.text.includes('Henüz öğrenci verisi yok'));
ok(blank.text.includes('Boş slot: 8/8'));
ok(blank.text.includes('Karar yazılmadı'));
ok(!blank.text.includes('Oluşturulma bilgisi:'));
equal(empty.decision,'Karar yazılmadı');
equal(empty.notes,[],'Blank placeholders do not create observation records');
empty.tables.slice(0,2).forEach(table=>table.rows.forEach(({values})=>{equal(values[1],'0','n zero is explicit');equal(values.slice(2,5),['Hesaplanmadı','Hesaplanmadı','Hesaplanmadı'],'Missing means never become false zero scores');}));
equal(empty.tables[2].rows.length,8,'All eight duration slots remain visible');
ok(empty.sections['report-timing'].includes('eşik karşılaştırmaları hesaplanmadı'));

// Eight fixed slots, seven entered records, one wholly invalid record and
// asymmetric missingness: literal expected table cells are hand-calculated.
const records=M.IDS.map(M.createRecord);
teacher(records[0],[0,1,2,0],[1,1,0,2]);Object.assign(records[0],{minutes:24.5,choice:{pre:1,post:3},self:{pre:2,post:6}});
teacher(records[1],[2,2,1,1],[1,0,2,1]);Object.assign(records[1],{minutes:30,choice:{pre:4,post:0},self:{pre:8,post:7}});
teacher(records[2],[2,1,null,0],[null,2,0,0]);Object.assign(records[2],{minutes:25.5,choice:{pre:0,post:null},self:{pre:null,post:0}});
teacher(records[3],[2,0,0,1],[null,0,1,1]);Object.assign(records[3],{minutes:31,choice:{pre:null,post:4},self:{pre:0,post:4}});
teacher(records[5],[2,2,2,2],[0,0,0,0]);Object.assign(records[5],{minutes:-1,choice:{pre:0,post:4},self:{pre:0,post:8}});
Object.assign(records[6],{minutes:0,notes:'Yalnız süre gözlemi var.'});
teacher(records[7],[0,0,0,0],[0,0,0,0]);Object.assign(records[7],{minutes:25,choice:{pre:0,post:0},self:{pre:0,post:0}});
const attack='</p><script>globalThis.__reportPwn=1</script><img src="https://example.invalid/x" onerror="alert(1)">&\'"\nİkinci satır.';
const longNote='Çok satırlı, "alıntılı" gözlem.\n'+('çığ '.repeat(400)).slice(0,1158)+' SON KANIT';
records[0].bottleneck=attack;records[0].notes=longNote;
records[5].bottleneck='Negatif süre düzeltilecek.\nDöngüde durduğu satır.';records[5].notes=longNote;
const conclusion='  Öğretmenin kararı:\n'+attack+'\n  Sonraki ders.  ',generatedAt='Tarih: <img src=x onerror=1> & "şimdi"';
const frozen=freeze(clone(records)),before=clone(frozen),report=R.build(frozen,{conclusion,generatedAt}),parsed=dom(report.html);
equal(report.summary,M.summarize(records));equal(frozen,before,'Inputs are never normalized in place or mutated');
equal(report,R.build(frozen,{conclusion,generatedAt}),'No automatic clock or nondeterministic output');
ok(report.text.includes('Veri girilen öğrenci: 7/8. Boş slot: 1/8'));
ok(report.text.includes('geçerli öğrenci: 3.'));
equal(parsed.tables[0].rows.map(row=>row.dimension),['code','math','purpose','links']);
const expectedDimensions=[
 [M.DIMENSIONS[0].title,'3','0,67/2','0,67/2','0 puan','1','1','1'],
 [M.DIMENSIONS[1].title,'5','0,8/2','0,6/2','-0,2 puan','1','3','1'],
 [M.DIMENSIONS[2].title,'4','0,75/2','0,75/2','0 puan','2','1','1'],
 [M.DIMENSIONS[3].title,'5','0,4/2','0,8/2','+0,4 puan','1','4','0']
];
equal(parsed.tables[0].rows.map(row=>row.values),expectedDimensions,'Independent dimension n/means/deltas and change counts');
const expectedTotals=[['Öğretmen gerekçe puanı','3','3/8','2,67/8','-0,33 puan'],
 ['Seçenek doğruluğu','3','1,67/4','1/4','-0,67 puan'],['Öğrenci özpuanı','4','2,5/8','4,25/8','+1,75 puan']];
equal(parsed.tables[1].rows.map(row=>row.values),expectedTotals,'Three distinct matched cohorts and units');
for(const row of [...expectedDimensions,...expectedTotals])ok(report.text.includes(row.join(' | ')),'Plain text has exactly the same numeric table values as DOM cells');
ok(parsed.sections['report-timing'].includes('Geçerli süre kaydı: 6 öğrenci'));
ok(parsed.sections['report-timing'].includes('Ortalama: 22,67 dk'));
ok(parsed.sections['report-timing'].includes('En kısa: 0 dk; en uzun: 31 dk'));
ok(parsed.sections['report-timing'].includes('25 dakikada veya önce bitiren: 3/6'));
ok(parsed.sections['report-timing'].includes('30 dakikada veya önce bitiren: 5/6'));
equal(parsed.tables[2].rows[4].values,['P05','Girilmedi','Boş slot; öğrenci verisi girilmedi']);
equal(parsed.tables[2].rows[5].values,['P06','Ham giriş: -1','Hatalı; hesap dışı'],'Invalid raw duration is transparent and never counted');
equal(parsed.tables[2].rows[6].values,['P07','0 dk','Geçerli süre'],'Real zero duration is not missing');
equal(parsed.notes.map(note=>note.id),['P01','P02','P03','P04','P06','P07','P08'],'Active observations follow student-ID order');
equal(parsed.notes[0].bottleneck,attack,'Untrusted markup is restored only as literal visible text');
equal(parsed.notes[0].notes,longNote,'Long Unicode notes are not truncated');
const invalidNotes=parsed.notes.find(note=>note.id==='P06');equal(invalidNotes.notes,longNote);ok(invalidNotes.text.includes('Hatalı kayıt; sayısal özetten dışlandı'));
equal(parsed.notes.find(note=>note.id==='P02').notes,'Not girilmedi');
equal(parsed.decision,conclusion,'Teacher decision keeps full whitespace and is never inferred from notes');
ok(report.text.includes(longNote));ok(report.text.includes(attack));ok(report.text.includes(conclusion));
ok(parsed.paragraphs.includes('Oluşturulma bilgisi: '+generatedAt),'Timestamp is a caller-supplied escaped literal');
ok(report.html.includes('&lt;script&gt;'));ok(report.html.includes('&amp;'));ok(report.html.includes('&#39;'));
equal(parsed.tags.filter(tag=>['script','img','iframe','object','embed','link'].includes(tag)),[],'Downloaded HTML has no scripts, image requests or external dependencies');
equal(parsed.urls,[]);equal(parsed.events,[]);equal(globalThis.__reportPwn,undefined);
ok(!/@import|url\s*\(/i.test(report.html.match(/<style>([\s\S]*?)<\/style>/)[1]),'Inline CSS does not fetch anything');
ok(parsed.tables.every(table=>table.wrapped),'Wide tables have keyboard-accessible scroll wrappers');
ok(report.html.includes('white-space:pre-wrap'));ok(report.html.includes('@media print'));
equal(parsed.ids.length,new Set(parsed.ids).size,'Semantic report IDs remain unique');
for(const id of ['report-dimensions','report-timing','report-observations','report-decision'])ok(parsed.ids.includes(id));
ok(report.text.includes('ön/son fark tek başına ders etkisini göstermez'));
ok(!report.text.toLocaleLowerCase('tr').includes('sentetik'),'Real user reports do not assume input is synthetic');

// True zero scores versus missing values, plus whole-record exclusion when
// even one evidence field is missing. Text contents never decide a score.
const zeros=M.IDS.map(M.createRecord);teacher(zeros[0],[0,0,0,0],[0,0,0,0]);zeros[0].minutes=0;zeros[0].choice={pre:0,post:0};zeros[0].self={pre:0,post:0};
const zero=R.build(zeros),zeroDOM=dom(zero.html);equal(zero.summary.totals.teacher.n,1);
equal(zeroDOM.tables[0].rows[0].values.slice(1,5),['1','0/2','0/2','0 puan']);
equal(zeroDOM.tables[1].rows[0].values,['Öğretmen gerekçe puanı','1','0/8','0/8','0 puan']);
ok(zero.text.includes('25 dakikada veya önce bitiren: 1/1'));ok(zero.text.includes('30 dakikada veya önce bitiren: 1/1'));
const missing=clone(zeros);missing[0].teacher.code.evidencePre='';missing[0].notes='Kanıt eksik olsa da bu gözlem korunmalı.';
const invalid=R.build(missing),invalidDOM=dom(invalid.html);equal(invalid.summary.totals.teacher.n,0);equal(invalid.summary.timing.n,0);equal(invalidDOM.notes[0].notes,missing[0].notes);ok(invalid.text.includes('başlangıç kanıtı:'));
const differentText=clone(zeros);M.DIMENSIONS.forEach(({id})=>{differentText[0].teacher[id].evidencePre='x';differentText[0].teacher[id].evidencePost=attack;});differentText[0].notes='Cevapları daha iyi buldum.';
equal(R.build(differentText).summary.totals,zero.summary.totals,'Free prose cannot improve or classify human-assigned scores');
equal(R.build(records.slice().reverse(),{conclusion,generatedAt}).html,report.html,'Presentation order does not depend on raw record order');

for(const values of [null,[],records.slice(0,7),[...records,records[0]]])throws(()=>R.build(values));
const duplicate=clone(records);duplicate[7].id='P01';throws(()=>R.build(duplicate));
const unknown=clone(records);unknown[7].id='P99';throws(()=>R.build(unknown));
const malformed=clone(records);malformed[7]=null;throws(()=>R.build(malformed));
for(const options of [null,[],{conclusion:null},{generatedAt:123}])throws(()=>R.build(records,options));

const browser={AAPilot:M};vm.runInNewContext(fs.readFileSync(reportFile,'utf8'),browser,{timeout:1000});
equal(browser.AAPilotReport.build(blanks).html,blank.html,'Browser/CommonJS standalone report parity');
equal(browser.AAPilotReport.build(records,{conclusion,generatedAt}).text,report.text,'Both module surfaces have identical plain text');
const result={status:'passed',assertions,htmlDocuments,syntheticDataOnly:true,handCalculatedSlots:8,
 coverage:['hand-calculated asymmetric paired cohorts','null versus real zero','invalid entire-record exclusion',
 'inclusive 25/30-minute timing thresholds','all active raw notes including invalid records','long Unicode multiline notes',
 'HTMLParser DOM cells equal plain text values','literal escaped metadata and hostile markup','no automatic prose grading',
 'offline no-script standalone HTML','structural ID validation','pure deterministic output','browser/CommonJS parity']};
if(process.argv.includes('--report')){const dest=path.resolve(process.argv[process.argv.indexOf('--report')+1]||''),aa=path.resolve(__dirname,'..');if(dest===aa||dest.startsWith(aa+path.sep))throw new Error('Report must be outside AA');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
