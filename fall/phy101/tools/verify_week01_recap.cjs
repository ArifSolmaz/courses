const assert=require('node:assert/strict');
const v=require('../assets/week01-recap.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const [key,expected] of Object.entries({plane:[18,26],space:[4,Math.sqrt(65)]})){
 const state=v.initial(key),base=v.model(key,state);
 close(base.d,expected[0]);close(base.C,expected[1]);
 for(let angle=-180;angle<=180;angle++){
  const p=v.model(key,{...state,angle});
  close(p.d*p.d+p.C*p.C,p.A*p.A*p.B*p.B);
  close(v.dot(p.a,p.c),0);close(v.dot(p.b,p.c),0);
  const rev=v.model(key,{...state,angle,swap:true});
  close(rev.d,p.d);rev.c.forEach((x,i)=>close(x,-p.c[i]));
 }
 for(const scale of [.99,1.01]){
  const p=v.model(key,{...state,scale});close(p.C,base.C*scale*scale);close(p.angle,base.angle);
 }
 for(const change of [{length:0},{zeroA:true}]){
  const p=v.model(key,{...state,...change});assert.equal(p.angle,null);assert.equal(p.n,null);close(p.d,0);close(p.C,0);
 }
 for(const angle of [0,180])assert.equal(v.model(key,{...state,angle}).n,null);
 close(v.model(key,{...state,angle:90}).d,0);
 close(v.model(key,{...state,yaw:247}).d,base.d);
}
console.log('Recap: reference values, 722 angle cases, reversal, perpendicularity, degeneracies, and calibration checks passed.');
