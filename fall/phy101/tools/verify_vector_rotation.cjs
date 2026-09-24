const assert=require('node:assert/strict'),r=require('../assets/vector-rotation.js');
const eq=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-9,`${a} != ${b}`));
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
let z=r.turn(r.identity(),'z',90),zx=r.turn(z,'x',90),xz=r.turn(r.turn(r.identity(),'x',90),'z',90);
eq(r.transform(zx,[4,0,0]),[0,0,4]);eq(r.transform(xz,[4,0,0]),[0,4,0]);
for(const axis of ['x','y','z']){let i='xyz'.indexOf(axis),v=[1.3,-2.1,3.8];eq(r.point([...[0,0,0].map((_,j)=>j===i?1:0)],axis,73),[0,0,0].map((_,j)=>j===i?1:0));for(let angle=-180;angle<=180;angle+=5){let basis=r.turn(zx,axis,angle),a=r.transform(basis,[4,0,0]),b=r.transform(basis,[2.8,2.3,0]),h=r.transform(basis,[0,2.3,0]);assert.ok(Math.abs(r.point(v,axis,angle)[i]-v[i])<1e-10);assert.ok(Math.abs(dot(a,b)-11.2)<1e-9);assert.ok(Math.abs(dot(a,h))<1e-9);eq(cross(a,b),r.transform(basis,[0,0,9.2]));}let full=r.turn(zx,axis,360);eq(r.transform(full,v),r.transform(zx,v));eq(r.transform(r.turn(r.turn(zx,axis,67),axis,-67),v),r.transform(zx,v));}
console.log('Passed: ordered world-axis turns, fixed axis components, inverse/full turns, dot/cross products and perpendicular height (219 combined cases).');
