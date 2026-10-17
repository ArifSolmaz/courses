const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const QUESTIONS=JSON.parse(fs.readFileSync(__dirname+'/questions.json','utf8'));
const scoreSource='function scores('+script.split('function scores(')[1].split('function progress')[0];
const validSource='function validState('+script.split('function validState(')[1].split('function scores')[0];
const ctx={QUESTIONS};vm.createContext(ctx);vm.runInContext(scoreSource+validSource,ctx);
const key=QUESTIONS.map(q=>q.answer);
assert.equal(ctx.scores(key).total,25);assert.equal(ctx.scores(key.map(v=>(v+1)%4)).total,0);
for(let i=0;i<25;i++){const a=[...key];a[i]=(a[i]+1)%4;const s=ctx.scores(a);assert.equal(s.total,24);assert.equal(s.byWeek[QUESTIONS[i].week-1],4);}
assert.equal(ctx.validState({answers:key,submitted:true}),true);
assert.equal(ctx.validState({answers:Array(25).fill(null),submitted:true}),false);
assert.equal(ctx.validState({answers:Array(25).fill(9),submitted:false}),false);
assert.equal(ctx.validState({answers:Array(25).fill(null),submitted:false}),true);
console.log('PASS: score totals, all 25 individual mistakes, week attribution, stored-state validation and JS syntax.');
