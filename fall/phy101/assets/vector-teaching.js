/* Planar teaching cases; geometry is separate from the viewing rotation. */
(function(root){
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>Math.hypot(...a);
function build(key){let angle=Number(key),a=[4,0,0],b;if(key==='zero-a'||key==='zero-b'||key==='swap')angle=30;b=[3*Math.cos(angle*Math.PI/180),3*Math.sin(angle*Math.PI/180),0];if(key==='zero-a')a=[0,0,0];if(key==='zero-b')b=[0,0,0];if(key==='swap')[a,b]=[b,a];const A=norm(a),B=norm(b),d=dot(a,b),c=cross(a,b),area=norm(c),valid=A*B>1e-9,projection=A>1e-9?d/A:null,f=A>1e-9?a.map(x=>x*d/(A*A)):[0,0,0],height=A>1e-9?norm(b.map((x,i)=>x-f[i])):null;return {a,b,f,sum:a.map((x,i)=>x+b[i]),A,B,d,c,area,projection,height,theta:valid?Math.acos(Math.max(-1,Math.min(1,d/(A*B))))*180/Math.PI:null,normal:area>1e-9?c.map(x=>x/area):null};}
const api={build,dot,cross,norm};if(typeof module!=='undefined')module.exports=api;else root.VectorTeaching=api;
})(typeof window==='undefined'?globalThis:window);
