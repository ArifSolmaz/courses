const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const QUESTIONS=JSON.parse(fs.readFileSync(__dirname+'/questions.json','utf8'));
const scoreSource='function scores('+script.split('function scores(')[1].split('function progress')[0];
const validSource='function validState('+script.split('function validState(')[1].split('function scores')[0];
const ctx={QUESTIONS};vm.createContext(ctx);vm.runInContext(scoreSource+validSource,ctx);
const key=QUESTIONS.map(q=>q.answer);
assert.equal(ctx.scores(key).total,25);assert.equal(ctx.scores(key.map(v=>(v+1)%4)).total,0);
for(let i=0;i<25;i++){const a=[...key];a[i]=(a[i]+1)%4;const s=ctx.scores(a);assert.equal(s.total,24);assert.equal(s.byWeek[QUESTIONS[i].week-1],4);}
assert.equal(ctx.validState({answers:key,submitted:true,deadline:12345}),true);
assert.equal(ctx.validState({answers:Array(25).fill(null),submitted:true,deadline:12345}),true);
assert.equal(ctx.validState({answers:Array(25).fill(9),submitted:false,deadline:12345}),false);
assert.equal(ctx.validState({answers:Array(25).fill(null),submitted:false,deadline:12345}),true);
console.log('PASS: score totals, all 25 individual mistakes, week attribution, stored-state validation and JS syntax.');

const timerSource="function remainingSeconds("+script.split("function remainingSeconds(")[1].split("function tick")[0];vm.runInContext(timerSource,ctx);assert.equal(ctx.remainingSeconds(1800000,0),1800);assert.equal(ctx.remainingSeconds(1800000,1799999),1);assert.equal(ctx.remainingSeconds(1800000,1800000),0);assert.equal(ctx.remainingSeconds(1800000,1800001),0);assert.equal(ctx.scores(Array(25).fill(null)).total,0);console.log("PASS: 30-minute deadline boundaries and unanswered scoring.");
const tickSource='function tick('+script.split('function tick(')[1].split("$('start').onclick")[0];
const timer={textContent:''};let expired=0;
const tickContext={deadline:1800000,submitted:false,Date:{now:()=>1800001},$:()=>timer,remainingSeconds:ctx.remainingSeconds,finish:(value)=>{assert.equal(value,true);expired++;}};
vm.createContext(tickContext);vm.runInContext(tickSource+'tick();',tickContext);assert.equal(expired,1);assert.equal(timer.textContent,'Time remaining: 0:00');
tickContext.submitted=true;vm.runInContext('tick();',tickContext);assert.equal(expired,1);
console.log('PASS: expiry calls automatic submission; completed attempts do not resubmit.');
