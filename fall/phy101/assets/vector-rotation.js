/* Columns are the rotated basis vectors. World-axis turns left-multiply the orientation. */
(function(root){
'use strict';
const identity=()=>[[1,0,0],[0,1,0],[0,0,1]];
function point(v,axis,degrees){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);let [x,y,z]=v;if(axis==='x')return [x,c*y-s*z,s*y+c*z];if(axis==='y')return [c*x+s*z,y,-s*x+c*z];if(axis==='z')return [c*x-s*y,s*x+c*y,z];throw new Error('Unknown rotation axis');}
const turn=(basis,axis,degrees)=>basis.map(v=>point(v,axis,degrees));
const transform=(basis,v)=>[0,1,2].map(i=>basis[0][i]*v[0]+basis[1][i]*v[1]+basis[2][i]*v[2]);
const api={identity,point,turn,transform};if(typeof module!=='undefined')module.exports=api;else root.VectorRotation=api;
})(typeof window==='undefined'?globalThis:window);
