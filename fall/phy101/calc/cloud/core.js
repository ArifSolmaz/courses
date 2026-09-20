/* Server-owned classroom state. Pure functions; no browser persistence. */
var PhyCloud = (function () {
  'use strict';
  function blank() { return {schema:1,revision:0,controller:null,active:null,rounds:[],codes:[],receipts:[]}; }
  function challenge(id) { var ch=window.CALC_CHALLENGES.find(function(c){return c.id===id;}); if(!ch) throw Error('Unknown question'); return ch; }
  function active(s) { return s.rounds.find(function(r){return r.id===s.active;}) || null; }
  function isOpen(s,now) {return !!(s.classroom && now<s.classroom.closesAt && !s.classroom.closed);}
  function endClass(s,now) {
    if(s.classroom)s.classroom.closed=true;
    var r=active(s);
    if(r && ['running','paused','ended'].indexOf(r.status)>=0){close(r,now);r.status='closed';r.closed=now;}
  }
  function normalise(s,now) {
    if(s.classroom && !s.classroom.closed && now>=s.classroom.closesAt){endClass(s,s.classroom.closesAt);return true;}
    var r=active(s);
    if(r && r.status==='running' && now>=r.deadline) {r.status='ended';r.remaining=0;return true;}
    return false;
  }
  function close(r,now) {
    if(r.status==='running') {
      r.windows[r.windows.length-1].end=Math.min(now,r.deadline);
      r.remaining=Math.max(0,r.deadline-now);
    }
  }
  function apply(s,cmd,now,makeId,random) {
    if(!cmd || typeof cmd.client!=='string' || !/^[\w-]{16,100}$/.test(cmd.client) || !/^[\w-]{16,100}$/.test(cmd.request||'')) throw Error('Invalid request');
    if(s.receipts.some(function(r){return r.request===cmd.request && r.client===cmd.client;})) return {duplicate:true};
    if(cmd.revision!==s.revision) throw Error('Session changed on another PC. Refresh and try again.');
    if(cmd.action!=='claim' && s.controller!==cmd.client) throw Error('This PC is read-only. Take control here first.');
    normalise(s,now);
    var r=active(s);
    switch(cmd.action) {
      case 'claim': s.controller=cmd.client; break;
      case 'openClass':
        if(isOpen(s,now))throw Error('Classroom is already open');
        if([15,30,45,60,90,120].indexOf(cmd.minutes)<0)throw Error('Invalid classroom duration');
        s.classroom={openedAt:now,closesAt:now+cmd.minutes*60000,closed:false,code:String(makeId()).replace(/-/g,'').slice(0,8).toUpperCase()};
        break;
      case 'endClass': endClass(s,now); break;
      case 'create':
        if(r && ['running','paused','ended'].indexOf(r.status)>=0) throw Error('Reveal the current round before creating another.');
        var ch=challenge(cmd.question);
        if([60,90,120,180,300].indexOf(cmd.seconds)<0) throw Error('Invalid duration');
        if(s.codes.length>=9000) throw Error('All round codes are used. Start a new course store.');
        var code=1000+Math.floor(random()*9000);
        while(s.codes.indexOf(code)>=0) code=code===9999?1000:code+1;
        s.codes.push(code);
        // Store the actual parameters; they do not depend on a browser seed.
        r={id:makeId(),question:ch.id,code:code,params:ch.gen(),duration:cmd.seconds*1000,remaining:cmd.seconds*1000,status:'ready',windows:[],deadline:null,created:now};
        s.rounds.push(r);s.active=r.id;break;
      case 'start':
        if(!isOpen(s,now))throw Error('Open the classroom activity before starting a round');
        if(!r || ['ready','paused'].indexOf(r.status)<0) throw Error('This round cannot be started');
        r.deadline=Math.min(now+r.remaining,s.classroom.closesAt);r.windows.push({start:now,end:r.deadline});r.status='running';break;
      case 'pause':
        if(!r || r.status!=='running') throw Error('The round is not running');
        close(r,now);r.status='paused';break;
      case 'reveal':
        if(!r || ['running','paused','ended'].indexOf(r.status)<0) throw Error('Start the round before revealing it');
        close(r,now);r.status='closed';r.closed=now;break;
      default: throw Error('Unknown command');
    }
    s.revision++;
    s.receipts.push({client:cmd.client,request:cmd.request});
    if(s.receipts.length>200) s.receipts.shift();
    return {duplicate:false};
  }
  function number(raw) {
    var s=String(raw==null?'':raw).trim().replace(/\u2212/g,'-');
    if(s.indexOf(',')>=0 && s.indexOf('.')<0) s=s.replace(',','.');
    if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(s)) return NaN;
    return Number(s);
  }
  function score(round,rows) {
    var ch=challenge(round.question), byId=Object.create(null), rejected=0,repeats=0;
    rows.filter(function(row){return String(row.code).trim()===String(round.code);})
      .sort(function(a,b){return a.time-b.time || a.seq-b.seq;}).forEach(function(row){
        var id=String(row.id).trim();
        if(!/^\d+$/.test(id) || !Number.isFinite(row.time) || !round.windows.some(function(w){return row.time>=w.start && row.time<w.end;})){rejected++;return;}
        if(byId[id]){repeats++;return;}
        var val=number(row.answer),ok=Number.isFinite(val)&&window.CALC_MARK(ch,round.params,val);
        byId[id]={id:id,raw:String(row.answer),correct:ok,time:row.time,seq:row.seq,points:ok?10:0};
      });
    var entries=Object.keys(byId).map(function(id){return byId[id];}).sort(function(a,b){return a.time-b.time || a.seq-b.seq;});
    var rank=0;entries.forEach(function(row){if(row.correct){rank++;}});
    return {rows:entries,rejected:rejected,repeats:repeats,correct:rank};
  }
  function view(s,rows,client,now) {
    var r=active(s), totals=Object.create(null);
    var history=s.rounds.filter(function(x){return x.status==='closed';}).map(function(x){
      var marked=score(x,rows);
      marked.rows.forEach(function(row){if(!totals[row.id])totals[row.id]={id:row.id,points:0,correct:0,rounds:0};var t=totals[row.id];t.points+=row.points;t.correct+=row.correct?1:0;t.rounds++;});
      return {id:x.id,question:x.question,code:x.code,correct:marked.correct,count:marked.rows.length};
    });
    var current=null;
    if(r) {
      var ch=challenge(r.question);
      current={id:r.id,question:r.question,code:r.code,status:r.status,duration:r.duration,remaining:r.remaining,deadline:r.deadline,
        text:ch.text(r.params),text_tr:ch.text_tr(r.params),hint:ch.hint,unit:ch.unit,
        received:rows.filter(function(row){return String(row.code).trim()===String(r.code);}).length};
      if(r.status==='closed') {current.params=r.params;current.answer=ch.answer(r.params).toPrecision(3);current.score=score(r,rows);}
    }
    return {classroom:{open:isOpen(s,now),closesAt:s.classroom?s.classroom.closesAt:null,code:isOpen(s,now)?s.classroom.code:null},acknowledged:s.receipts.filter(function(r){return r.client===client;}).map(function(r){return r.request;}),revision:s.revision,serverTime:now,control:s.controller===client,round:current,history:history,
      totals:Object.keys(totals).map(function(id){return totals[id];}).sort(function(a,b){return b.points-a.points || a.id.localeCompare(b.id);})};
  }
  return {isOpen:isOpen,blank:blank,apply:apply,normalise:normalise,view:view,score:score,number:number};
})();
