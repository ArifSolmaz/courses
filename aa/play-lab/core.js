/* Small, deterministic models. UI and teaching text live in lab.js. */
(function (root) {
  'use strict';
  const DEAD = 'deleted';
  function routeDistance(points, order) {
    let x = points.S, total = 0;
    for (const id of [...order, 'S']) { total += Math.abs(points[id] - x); x = points[id]; }
    return total;
  }
  function nearest(points) {
    let x = points.S; const todo = ['A', 'B', 'C'], order = [];
    while (todo.length) {
      todo.sort((a,b) => Math.abs(points[a]-x)-Math.abs(points[b]-x) || a.localeCompare(b));
      const id = todo.shift(); order.push(id); x = points[id];
    }
    return order;
  }
  function permutations(a) { return a.length ? a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])) : [[]]; }
  function bestRoute(points) {
    return permutations(['A','B','C']).map(order=>({order, distance:routeDistance(points,order)})).sort((a,b)=>a.distance-b.distance)[0];
  }
  function probe(table, key) {
    const path=[];
    for(let i=0;i<table.length;i++) {
      const slot=(key+i)%table.length; path.push(slot);
      if(table[slot]===key) return {path,found:true,slot};
      if(table[slot]===null) return {path,found:false,slot};
    }
    return {path,found:false,slot:-1};
  }
  function insert(table,key) {
    const result=probe(table,key);
    if(result.found) return {...result,duplicate:true};
    const dead=result.path.find(i=>table[i]===DEAD);
    const slot=dead===undefined?result.slot:dead;
    if(slot<0) return {...result,full:true};
    table[slot]=key; return {...result,slot};
  }
  function tree(keys) {
    let root=null;
    for(const key of keys) {
      if(!root) { root={key,left:null,right:null};continue; }
      let n=root;
      while(n.key!==key) {
        const side=key<n.key?'left':'right';
        if(!n[side]) {n[side]={key,left:null,right:null};break;} n=n[side];
      }
    }
    return root;
  }
  function treeSearch(root,key) {
    let n=root;const path=[];
    while(n) {path.push(n.key);if(n.key===key)return {path,found:true};n=key<n.key?n.left:n.right;}
    return {path,found:false};
  }
  const delta={Right:[1,0],Left:[-1,0],Up:[0,-1],Down:[0,1]};
  function move(pos,command,undo=false) {const d=delta[command],s=undo?-1:1;return {x:pos.x+s*d[0],y:pos.y+s*d[1]};}
  const api={DEAD,routeDistance,nearest,bestRoute,permutations,probe,insert,tree,treeSearch,move};
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  else root.PlayCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
