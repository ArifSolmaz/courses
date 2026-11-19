const assert=require('node:assert/strict'),F=require('./model.js');
function play(shift,policy){let s=F.create(shift,policy);while(s.finished.length<6){const q=F.waiting(s);assert.ok(q.length);const id=policy==='queue'?q[0].id:q.at(-1).id;assert.equal(F.run(s,id),true);}assert.equal(s.time,6);assert.equal(new Set(s.finished.map(j=>j.id)).size,6);for(const j of s.finished){assert.equal(j.wait,j.start-j.at);assert.equal(j.onTime,j.finish<=j.due);}return s;}
let q=play('steady','queue'),s=play('steady','stack');assert.equal(F.metrics(q).onTime,6);assert.equal(F.metrics(s).onTime,5);assert.equal(s.finished.at(-1).id,'A');assert.equal(F.metrics(s).maxWait,5);
for(const shift of ['steady','burst'])for(const policy of ['queue','stack'])play(shift,policy);
let wrong=F.create();assert.equal(F.run(wrong,'B'),false);assert.equal(wrong.time,0);assert.equal(wrong.finished.length,0);assert.equal(F.run(wrong,'Z'),false);
// Enumerate all valid free-choice shifts; each order ships exactly once, and time progresses only on valid actions.
let best={steady:0,burst:0};let count=0;function explore(s){if(s.finished.length===6){count++;best[s.shift]=Math.max(best[s.shift],F.metrics(s).onTime);assert.equal(s.time,6);assert.equal(new Set(s.finished.map(x=>x.id)).size,6);return;}for(const j of F.waiting(s)){let next=JSON.parse(JSON.stringify(s));assert.ok(F.run(next,j.id));explore(next);}}explore(F.create('steady','free'));explore(F.create('burst','free'));
assert.equal(best.steady,6);assert.equal(best.burst,5);
let u=F.createUndo();for(let i=0;i<4;i++)assert.ok(F.apply(u));assert.deepEqual(u.box,{color:'orange',star:true,closed:true});const b={...u.box};assert.equal(F.undo(u,0),false);assert.deepEqual(u.box,b);F.undo(u,3);assert.deepEqual(u.box,{color:'orange',star:true,closed:false});F.undo(u,2);assert.deepEqual(u.box,{color:'blue',star:true,closed:false});
console.log(`PASS: FIFO/LIFO outcomes; ${count} free-choice shifts; invalid actions; wait/deadline counts; snapshot undo.`);
