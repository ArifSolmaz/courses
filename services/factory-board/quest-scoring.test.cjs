const assert=require('node:assert/strict'),M=require('../../aa/play-lab/quests/model.js'),P=require('./play-scoring.cjs');
const answers={robot:{order:['B','A','C']},commands:{order:['U','U','R','R'],mode:'queue'},depot:{structure:'hash',erase:'mark'},sorting:{tool:'selection',cut:0},factory:{order:['C','B','A']}};

const transfer={robot:{order:['B','A','C']},commands:{order:['R','R','U','U'],mode:'queue'},depot:{structure:'tree',erase:'mark'},sorting:{tool:'selection',cut:0},factory:{order:['B','C','D','A']}};

const duel={...answers,depot:{structure:'tree',erase:'mark'},sorting:{tool:'selection',cut:3},factory:{order:['A','B','C','D','E']}};

for(const game of Object.keys(M.worlds))for(const mode of Object.keys(M.modes)){
 const plan=({repair:answers,transfer,race:duel})[mode][game];
 const b={game,kind:'quest',mode,plan,answer:0,prediction:'you',...(mode==='transfer'?{firstPlan:M.spec(game,mode,0).initial,firstAnswer:0}:{})};
 assert.deepEqual(P.replay(b),{game,task:'quest-'+mode,points:10});
 assert.equal(P.replay({...b,answer:1}),null);
 assert.equal(P.replay({...b,plan:{}}),null);
 assert.equal(P.replay({...b,mode:'fake'}),null);
 if(mode==='transfer')assert.equal(P.replay({...b,firstPlan:null}),null);
 if(mode==='race')assert.equal(P.replay({...b,prediction:''}),null);
}
assert.equal(P.replay({game:'sorting',kind:'quest',mode:'repair',answer:0,plan:{tool:'selection',cut:3}}),null);
console.log('PASS: 15 server-verified quests, invalid plans/answers/modes, incomplete transfers, missing predictions, repair constraints.');
