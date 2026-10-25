const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'code_history.js'),'utf8'),context);
const make=(initial='original',original='original')=>context.createCodeHistory(initial,original);
const a=make(),b=make();
assert.equal(a.canUndo,false);assert.equal(a.isOriginal,true);
a.record('first');a.record('second');
assert.equal(a.undo(),'first');assert.equal(a.undo(),'original');
assert.equal(a.canUndo,false);assert.equal(b.isOriginal,true);
a.record('changed');assert.equal(a.restore(),'original');
assert.equal(a.undo(),'changed'); // Reset is reversible.
assert.equal(a.undo(),'original');
a.record('original');assert.equal(a.canUndo,false); // No-op adds no history.
const saved=make('saved student edit');
assert.equal(saved.isOriginal,false);assert.equal(saved.canUndo,false);
assert.equal(saved.restore(),'original');assert.equal(saved.undo(),'saved student edit');
const limited=make();for(let i=0;i<105;i++)limited.record(String(i));
let count=0;while(limited.canUndo){limited.undo();count++;}assert.equal(count,100);
for(const week of [6,7,8,9,10,11,12,13,14]){
  const page=fs.readFileSync(path.join(__dirname,`../../offline/CP1_Week_${String(week).padStart(2,'0')}_Offline.html`),'utf8');
  assert.ok(page.includes('"codeHistory": true'));
  assert.ok(page.includes(fs.readFileSync(path.join(__dirname,'code_history.js'),'utf8')));
  assert.ok(page.includes('if(CONFIG.codeHistory)addCodeHistory(bar,editor,i);'));
}
console.log('Per-cell undo, reversible restore, saved edits, no-op edits, history limit and all nine page bundles pass.');
