const assert=require('node:assert/strict'),C=require('./core.js');
let maps=0;
for(let a=0;a<=10;a++)for(let b=0;b<=10;b++)for(let c=0;c<=10;c++)for(let d=0;d<=10;d++){
 if(new Set([a,b,c,d]).size!==4)continue;
 const p={S:a,A:b,B:c,C:d};assert.equal(C.bestRoute(p).distance,2*(Math.max(a,b,c,d)-Math.min(a,b,c,d)));assert.ok(C.routeDistance(p,C.nearest(p))>=C.bestRoute(p).distance);maps++;
}
assert.equal(C.routeDistance({S:5,A:4,B:7,C:0},['A','B','C']),16);
assert.equal(C.routeDistance({S:5,A:4,B:7,C:0},['A','C','B']),14);
let t=Array(7).fill(null);[7,14,21].forEach(k=>C.insert(t,k));t[1]=null;assert.equal(C.probe(t,21).found,false);t[1]=C.DEAD;assert.equal(C.probe(t,21).found,true);assert.equal(C.insert(t,21).duplicate,true);assert.equal(C.insert(t,28).slot,1);
t=Array(7).fill(null);[6,13,20,27,34,41,48].forEach(k=>C.insert(t,k));assert.deepEqual(C.probe(t,20).path,[6,0,1]);assert.equal(C.insert(t,55).full,true);assert.equal(C.probe(t,55).path.length,7);t[0]=C.DEAD;assert.equal(C.insert(t,55).slot,0);
for(let seed=0;seed<50;seed++){t=Array(7).fill(null);const ref=new Set();for(let i=0;i<200;i++){const k=(i*13+seed*17)%31;if(i%3===0){const r=C.probe(t,k);if(r.found){t[r.slot]=C.DEAD;ref.delete(k);}}else{const r=C.insert(t,k);if(!r.full)ref.add(k);}for(let q=0;q<31;q++){assert.equal(C.probe(t,q).found,ref.has(q));assert.ok(C.probe(t,q).path.length<=7);}}}
assert.equal(C.treeSearch(C.tree([40,20,60,10,30,50,70]),70).path.length,3);assert.equal(C.treeSearch(C.tree([10,20,30,40,50,60,70]),70).path.length,7);assert.equal(C.treeSearch(C.tree([1,1]),2).found,false);
let pos={x:1,y:3};for(const m of ['Right','Up','Up'])pos=C.move(pos,m);assert.deepEqual(pos,{x:2,y:1});assert.notDeepEqual(C.move(pos,'Right',true),C.move(pos,'Up',true));for(const m of ['Up','Up','Right'])pos=C.move(pos,m,true);assert.deepEqual(pos,{x:1,y:3});
console.log(`PASS: ${maps} rail maps; hash collision, deletion, wrap, full-table and reference-set checks; BST and undo checks.`);
