const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('aa/research/3sum-apsp/cards.js','utf8')+';this.cards=caseCards;',ctx);
const src=fs.readFileSync('aa/research/3sum-apsp/case.js','utf8');
vm.runInContext(src.slice(0,src.indexOf('let piece=0;'))+';this.math={product,exponentRatio,required,visualHTML};',ctx);
assert.equal(ctx.cards.length,18);
for(const c of ctx.cards){assert.equal(c.steps.length,3);assert(c.answer&&c.take&&c.reference);assert(ctx.math.visualHTML(c).length>50);}
const expected=[[1,0,1,0],[1,1,0,0],[2,1,1,0],[0,0,0,0]];
for(let i=0;i<4;i++)for(let j=0;j<4;j++)assert.equal(ctx.math.product(i,j),expected[i][j]);
assert.equal(ctx.math.required(['A','B']).length,4);assert.equal(ctx.math.required([]).length,0);assert.equal(ctx.math.required(['A','B','C']).length,6);
assert(Math.abs(ctx.math.exponentRatio(9,.0008)-1.016716)<.000001);
assert(ctx.math.exponentRatio(100,.0008)<1.203);
for(const a of [[-5,2,3,7],[-5,2,4,7]]){const sums=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)for(let k=j+1;k<4;k++)sums.push(a[i]+a[j]+a[k]);assert.equal(sums.includes(0),a[2]===3);}
console.log('18 pieces; 16 matrix entries; dependency unions; ratios and 3SUM examples verified.');
