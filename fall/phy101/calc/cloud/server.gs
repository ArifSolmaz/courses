/* Private Apps Script deployment. Configuration is supplied by the private build.
   All helpers end in _ so google.script.run cannot invoke them directly. */
function cloudConfig_() {
  var config=cloudDeploymentConfig_();
  if(!config.sheet || !config.owner || !Number.isFinite(config.tab)) throw Error('Instructor app is not configured');
  return config;
}
function cloudAuthorise_() {
  var cfg=cloudConfig_(),email=Session.getActiveUser().getEmail();
  if(!email || email.toLowerCase()!==cfg.owner.toLowerCase()) throw Error('Instructor access only. Sign in with the configured account.');
  return cfg;
}
function doGet(e) {
  if(e && e.parameter && e.parameter.status==='1'){
    return ContentService.createTextOutput('phyActivityStatus('+JSON.stringify(cloudStudentStatus())+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  if(e && e.parameter && e.parameter.student==='1'){
    return HtmlService.createHtmlOutput(cloudStudentHtml_()).setTitle('PHY101 · Classroom activity').addMetaTag('viewport','width=device-width, initial-scale=1');
  }
  cloudAuthorise_();
  return HtmlService.createHtmlOutput(cloudHtml_()).setTitle('PHY101 · Instructor').addMetaTag('viewport','width=device-width, initial-scale=1');
}
function cloudBook_(cfg) {return SpreadsheetApp.openById(cfg.sheet);}
function cloudDigest_(text) {return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text));}
function cloudRead_(book) {
  var head=PropertiesService.getScriptProperties().getProperty('PHY_HEAD');
  if(!head) return PhyCloud.blank();
  head=JSON.parse(head);
  var sheet=book.getSheetByName('_PHY101_STATE_'+head.slot);
  if(!sheet || sheet.getRange('A1').getValue()!=='PHY101 cloud state v1') throw Error('Cloud state is missing. Do not create a replacement session.');
  var text=sheet.getRange(2,1,head.chunks,1).getValues().map(function(row){return row[0];}).join('');
  if(cloudDigest_(text)!==head.digest) throw Error('Cloud state integrity check failed');
  return JSON.parse(text);
}
function cloudWrite_(book,state) {
  var props=PropertiesService.getScriptProperties(),head=JSON.parse(props.getProperty('PHY_HEAD')||'null');
  var slot=head && head.slot==='A'?'B':'A',name='_PHY101_STATE_'+slot;
  var sheet=book.getSheetByName(name);
  if(sheet && sheet.getRange('A1').getValue()!=='PHY101 cloud state v1') throw Error('Storage tab name already used by another sheet');
  if(!sheet){sheet=book.insertSheet(name);sheet.getRange('A1').setValue('PHY101 cloud state v1');sheet.hideSheet();}
  var text=JSON.stringify(state),chunks=[];
  // Sheets cells have a 50,000-character limit. Chunk state without touching responses.
  for(var i=0;i<text.length;i+=40000) chunks.push([text.slice(i,i+40000)]);
  if(sheet.getMaxRows()<chunks.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),chunks.length+1-sheet.getMaxRows());
  sheet.getRange(2,1,chunks.length,1).setNumberFormat('@').setValues(chunks);
  SpreadsheetApp.flush();
  // Publish the new pointer only after the complete alternate slot is durable.
  props.setProperty('PHY_HEAD',JSON.stringify({slot:slot,chunks:chunks.length,digest:cloudDigest_(text),revision:state.revision}));
}
function cloudResponses_(book,cfg) {
  var sheet=book.getSheets().find(function(s){return s.getSheetId()===cfg.tab;});
  if(!sheet)throw Error('Configured response tab not found');
  var n=sheet.getLastRow();if(n<2)return [];
  if(n>20001)throw Error('Response sheet has more than 20,000 rows. Archive the previous course before continuing.');
  var range=sheet.getRange(1,1,n,4),values=range.getValues(),display=range.getDisplayValues();
  var headers=display[0];
  if(!/timestamp|zaman/i.test(headers[0])||!/student|öğrenci/i.test(headers[1])||!/code|kod/i.test(headers[2])||!/answer|cevap/i.test(headers[3]))throw Error('Response columns changed; expected timestamp, student ID, code, answer');
  return values.slice(1).map(function(row,i){return {time:row[0] instanceof Date?row[0].getTime():NaN,id:display[i+1][1],code:display[i+1][2],answer:display[i+1][3],seq:i+1};});
}
function cloudSnapshot(client) {
  var cfg=cloudAuthorise_();
  if(typeof client!=='string'||!/^\w[\w-]{15,99}$/.test(client))throw Error('Invalid browser session');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    var book=cloudBook_(cfg),state=cloudRead_(book),now=Date.now();
    if(PhyCloud.normalise(state,now)){state.revision++;cloudWrite_(book,state);}
    return PhyCloud.view(state,cloudResponses_(book,cfg),client,now);
  } finally {lock.releaseLock();}
}
function cloudCommand(cmd) {
  var cfg=cloudAuthorise_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    var book=cloudBook_(cfg),state=cloudRead_(book),now=Date.now();
    var result=PhyCloud.apply(state,cmd,now,function(){return Utilities.getUuid();},Math.random);
    if(!result.duplicate)cloudWrite_(book,state);
    return PhyCloud.view(state,cloudResponses_(book,cfg),cmd.client,now);
  } finally {lock.releaseLock();}
}


// Public operations return only availability and, after a classroom-code check,
// the existing student form link. Never expose state, questions, IDs or scores.
function cloudPublic_(code) {
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var state=cloudRead_(cloudBook_(cloudConfig_())),now=Date.now(),open=PhyCloud.isOpen(state,now);
    var result={open:open,closesAt:open?state.classroom.closesAt:null,serverTime:now};
    if(typeof code==='string' && open){
      result.admitted=code.trim().toUpperCase()===state.classroom.code;
      if(result.admitted)result.formUrl='https://forms.gle/MxGUR2aZhvWRgMdZ6';
    }
    return result;
  }finally{lock.releaseLock();}
}
function cloudStudentStatus(){return cloudPublic_();}
function cloudJoin(code){
  if(typeof code!=='string'||code.length>32)throw Error('Enter the classroom code shown by your instructor.');
  return cloudPublic_(code);
}
