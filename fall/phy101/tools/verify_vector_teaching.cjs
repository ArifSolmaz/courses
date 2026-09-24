const assert = require('node:assert/strict');
const {build,dot} = require('../assets/vector-teaching.js');
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
const expected = {'30':[6*Math.sqrt(3),6], '60':[6,6*Math.sqrt(3)], '0':[12,0], '90':[0,12], '120':[-6,6*Math.sqrt(3)], '180':[-12,0], '-90':[0,-12], 'swap':[6*Math.sqrt(3),-6], 'zero-a':[0,0], 'zero-b':[0,0]};
for(const [key,[d,z]] of Object.entries(expected)) {
  const g=build(key);
  near(g.d,d); near(g.c[2],z); near(g.area,Math.abs(z));
  near(g.d*g.d+g.area*g.area,g.A*g.A*g.B*g.B);
  if(g.A) { near(dot(g.a,g.b.map((v,i)=>v-g.f[i])),0); near(g.A*g.height,g.area); }
  if(key.startsWith('zero')) { assert.equal(g.theta,null); assert.equal(g.normal,null); }
  if(g.normal) { near(dot(g.a,g.normal),0); near(dot(g.b,g.normal),0); }
}
assert.equal(build('zero-a').projection,null);
near(build('zero-b').projection,0);
near(build('-90').theta,90);
near(build('swap').theta,30);
console.log('All 10 teaching cases: products, signs, projections, normals and degenerate cases passed.');
