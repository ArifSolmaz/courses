const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const ctx={PlayCore:require('../core.js'),SortModel:require('../sorting/model.js'),FactoryModel:require('../factory/model.js')};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/tasks.js','utf8'),ctx);
const answers=['16','A,C,B','6,5,8,1','6','15,20','1,2,3,4,5,6','5','A,D,B,E,F,C','5,6','orange','blue,star,open','plain','1','3','6,13,20'];
ctx.WorkshopTasks.slice(0,-1).forEach((t,i)=>{assert.equal(t.check(answers[i]).ok,true,t.id);assert.equal(t.check('').ok,false,t.id+' empty');assert.equal(t.check('bad input').ok,false,t.id+' invalid');});
assert.equal(ctx.WorkshopTasks.find(t=>t.id==='robot-2').check('A,B,C').ok,false);assert.equal(ctx.WorkshopTasks.find(t=>t.id==='factory-2').check('F,A,B,C,D,E').ok,false);assert.equal(ctx.WorkshopTasks.find(t=>t.id==='hash-3').check('7,7,14').ok,false);
console.log('PASS: all 15 automatic evidence checks, empty/invalid answers, counterexample and arrival constraints. Final reflection is self-reviewed.');
