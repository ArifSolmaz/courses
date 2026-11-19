const assert=require('node:assert/strict'),M=require('./model.js');
const answers={robot:{order:['B','A','C']},commands:{order:['U','U','R','R'],mode:'queue'},depot:{structure:'hash',erase:'mark'},sorting:{tool:'selection',cut:0},factory:{order:['C','B','A']}};
for(const g of Object.keys(M.worlds)){const s=M.spec(g,'repair');assert.equal(M.evaluate(s,s.initial).pass,false,g+' broken plan');assert.equal(M.evaluate(s,answers[g]).pass,true,g+' one edit rescue');}
const transfer={robot:{order:['B','A','C']},commands:{order:['R','R','U','U'],mode:'queue'},depot:{structure:'tree',erase:'mark'},sorting:{tool:'selection',cut:0},factory:{order:['B','C','D','A']}};
for(const g of Object.keys(M.worlds)){const a=M.spec(g,'transfer',0),b=M.spec(g,'transfer',1);assert.equal(M.evaluate(a,a.initial).pass,true,g+' first case');assert.equal(M.evaluate(b,g==='factory'?b.initial:a.initial).pass,false,g+' old rule fails');assert.equal(M.evaluate(b,transfer[g]).pass,true,g+' adapt');}
const duel={...answers,depot:{structure:'tree',erase:'mark'},sorting:{tool:'selection',cut:3},factory:{order:['A','B','C','D','E']}};
for(const g of Object.keys(M.worlds)){const s=M.spec(g,'race'),a=M.evaluate(s,duel[g]),b=M.evaluate(s,s.rival);assert.equal(a.pass,true,g+' duel');assert.equal(M.winner(s,a,b),'you',g+' better than original');assert.equal(M.winner(s,b,b),'tie');}
const f=M.spec('factory','race');assert.equal(M.evaluate(f,f.rival).onTime,4);assert.equal(M.evaluate(f,duel.factory).onTime,4);assert.equal(M.evaluate(f,duel.factory).value,9);
assert.equal(M.evaluate(M.spec('sorting','repair'),answers.sorting).cost,39);assert.equal(M.evaluate(M.spec('sorting','race'),duel.sorting).cost,15);
assert.equal(M.evaluate(M.spec('depot','repair'),answers.depot).cost,4);
console.log('PASS: all 15 quests; one-edit repairs; five old-rule failures and adaptations; duel/tie outcomes; exact costs.');
