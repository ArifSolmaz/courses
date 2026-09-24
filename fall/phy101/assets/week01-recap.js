/* Chapter 1 recap: pure vector model + accessible SVG teaching controls. */
(function(root){
'use strict';
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(...a);
const unit=a=>norm(a)>1e-10?mul(a,1/norm(a)):null;
const bases={plane:{a:[3,4,0],b:[-2,6,0],unit:'cm'},space:{a:[2,-1,2],b:[1,2,2],unit:'mm'}};
function products(a,b){
 const A=norm(a),B=norm(b),d=dot(a,b),c=cross(a,b),C=norm(c);
 return {a,b,A,B,d,c,C,angle:A*B>1e-10?Math.acos(Math.max(-1,Math.min(1,d/(A*B))))*180/Math.PI:null,n:C>1e-10?mul(c,1/C):null,projection:A>1e-10?d/A:null,R:add(a,b)};
}
function initial(key){const m=bases[key];return {angle:products(m.a,m.b).angle,length:norm(m.b),zeroA:false,swap:false,scale:1,yaw:330};}
function model(key,s){
 const m=bases[key],u=unit(m.a),perp=unit(add(m.b,mul(u,-dot(m.b,u))));
 const r=s.angle*Math.PI/180;
 let a=mul(m.a,s.zeroA?0:s.scale),b=mul(add(mul(u,Math.cos(r)),mul(perp,Math.sin(r))),s.length*s.scale);
 if(s.swap)[a,b]=[b,a];return products(a,b);
}
const API={add,mul,dot,cross,norm,products,initial,model,bases};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(typeof document==='undefined')return;
const NS='http://www.w3.org/2000/svg';
const f=(v,n=3)=>(Math.abs(v)<1e-10?0:v).toFixed(n);
const vec=v=>'('+v.map(x=>f(x)).join(', ')+')';
const colors={a:'#165a9b',b:'#b34b25',c:'#28744f',axis:'#718096'};
function svgEl(tag,attrs,parent,text){const el=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;if(parent)parent.appendChild(el);return el;}
function makeLab(host){
 const key=host.dataset.vectorLab,m=bases[key],is3=key==='space';let s=initial(key),playing=false,last=0,raf=0;
 host.innerHTML=`<h3>${is3?'3D edge and normal explorer':'Dot, cross and projection explorer'}</h3><p>${is3?'Blue a · rust b · green unit-normal direction. The drawing is a 2D projection; read the true 3D angle below.':'Blue A · rust B. The shaded parallelogram gives area; the dashed line drops B onto the line of A.'}</p><div class="recap-scene"></div><div class="recap-readouts" aria-live="off"></div><div class="recap-inputs"><label>Rotation of original second vector <output data-angle-output></output><input type="range" data-angle min="-180" max="180" step="0.1" aria-label="${key} vector angle"></label><label>Original second length (${m.unit}) <output data-length-output></output><input type="range" data-length min="0" max="${is3?4:8}" step="0.01" aria-label="${key} second edge length"></label>${is3?'<label>View rotation <output data-view-output></output><input type="range" data-view min="0" max="360" step="1" value="330" aria-label="3D view rotation"></label><label>Shared scale error <output data-scale-output></output><input type="range" data-scale min="-1" max="1" step="0.1" value="0" aria-label="Shared scale error percent"></label>':''}</div><div class="recap-presets" aria-label="${key} edge cases"><button data-case="original">Given vectors</button><button data-case="parallel">Parallel 0°</button><button data-case="perpendicular">Perpendicular 90°</button><button data-case="opposite">Opposite 180°</button><button data-case="clockwise">${is3?'Negative rotation −90°':'Clockwise −90°'}</button><button data-case="equal">Equal vectors</button>${is3?'<button data-case="near">Nearly parallel 1°</button>':''}<button data-case="zeroB">Zero second edge</button><button data-case="zeroA">Zero first edge</button><button data-case="swap">Swap order</button></div><div class="recap-play"><button type="button" data-play>Play angle sweep</button><button type="button" data-reset>Reset animation</button><span>No autoplay · 20 seconds per full sweep · drawing auto-fits</span></div><p class="recap-case-note"></p>`;
 host.querySelectorAll('button').forEach(b=>b.type='button');
 const angle=host.querySelector('[data-angle]'),length=host.querySelector('[data-length]'),view=host.querySelector('[data-view]'),scale=host.querySelector('[data-scale]'),play=host.querySelector('[data-play]');
 function stop(){playing=false;cancelAnimationFrame(raf);play.textContent='Play angle sweep';}
 function draw(){
  const p=model(key,s),scene=host.querySelector('.recap-scene');scene.replaceChildren();
  const svg=svgEl('svg',{viewBox:'0 0 560 400',role:'img','aria-label':`${is3?'3D':'Planar'} vectors. Dot product ${f(p.d)} ${m.unit} squared. Cross product ${vec(p.c)} ${m.unit} squared.`},scene);
  svgEl('rect',{width:560,height:400,rx:12,fill:'#f5f7fb'},svg);
  const g=svgEl('g',{'font-family':'Arial, sans-serif'},svg);
  const project=is3?(v)=>{const yaw=s.yaw*Math.PI/180,u=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw),w=v[0]*Math.sin(yaw)+v[1]*Math.cos(yaw);return[u,-.48*w+.88*v[2]];}:v=>[v[0],v[1]];
  const nArrow=p.n?mul(p.n,2.7):[0,0,0];
  const pts=[[0,0,0],p.a,p.b,p.R,...(is3?[[4,0,0],[0,4,0],[0,0,4],nArrow]:[])].map(project);
  const minX=Math.min(...pts.map(v=>v[0]),-1),maxX=Math.max(...pts.map(v=>v[0]),1),minY=Math.min(...pts.map(v=>v[1]),-1),maxY=Math.max(...pts.map(v=>v[1]),1);
  const k=Math.min(390/(maxX-minX),270/(maxY-minY));
  const P=v=>{const q=project(v);return[85+(q[0]-minX)*k,330-(q[1]-minY)*k];};
  function line(v,w,col,width=2,dash=false){const a=P(v),b=P(w);svgEl('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:col,'stroke-width':width,...(dash?{'stroke-dasharray':'6 5'}:{})},g);}
  function text(v,str,dx=10,dy=-10,col='#24354b'){const a=P(v);svgEl('text',{x:Math.max(12,Math.min(520,a[0]+dx)),y:Math.max(23,Math.min(375,a[1]+dy)),fill:col,'font-size':19},g,str);}
  function arrow(v,col,width=3){const a=P([0,0,0]),b=P(v),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1)return;line([0,0,0],v,col,width);const ux=dx/l,uy=dy/l;svgEl('polygon',{points:`${b} ${[b[0]-10*ux+4*uy,b[1]-10*uy-4*ux]} ${[b[0]-10*ux-4*uy,b[1]-10*uy+4*ux]}`,fill:col},g);}
  if(is3){[[4,0,0],[0,4,0],[0,0,4]].forEach((v,i)=>{arrow(v,colors.axis,1.4);text(v,['x','y','z'][i],0,-10,colors.axis);});}
  else{line([minX,0,0],[maxX,0,0],colors.axis,1);line([0,minY,0],[0,maxY,0],colors.axis,1);text([maxX,0,0],'+x',13,5);text([0,maxY,0],'+y',-25,-14);}
  const poly=is3?[[0,0,0],p.a,p.b]:[[0,0,0],p.a,p.R,p.b];
  svgEl('polygon',{points:poly.map(v=>P(v).join(',')).join(' '),fill:'#b34b25','fill-opacity':'.12',stroke:'#b34b25','stroke-opacity':'.25'},g);
  if(!is3){line(p.a,p.R,colors.b,1.8,true);line(p.b,p.R,colors.a,1.8,true);if(p.A>1e-10){const foot=mul(p.a,p.d/(p.A*p.A));line(p.b,foot,'#68768b',2,true);line([0,0,0],foot,colors.c,4);}}
  arrow(p.a,colors.a);arrow(p.b,colors.b);
  text(p.a,is3?'a':'A',10,-14,colors.a);text(p.b,is3?'b':'B',-22,24,colors.b);
  const origin=P([0,0,0]);svgEl('circle',{cx:origin[0],cy:origin[1],r:4,fill:'#24354b'},g);text([0,0,0],'O',-22,20);
  if(is3&&p.n){arrow(nArrow,colors.c);text(nArrow,'n̂',8,-9,colors.c);}
  svgEl('text',{x:18,y:384,'font-size':16,fill:'#465569'},g,is3?'Normal arrow: direction only; drawn at a fixed length.':(p.C<1e-10?'Zero area · no cross-product direction':p.c[2]>0?'⊙  Cross product points out of the board (+z)':'⊗  Cross product points into the board (−z)'));
  const data=[['First vector',vec(p.a)+' '+m.unit],['Second vector',vec(p.b)+' '+m.unit],['Dot product',f(p.d)+' '+m.unit+'²'],['Cross product',vec(p.c)+' '+m.unit+'²'],['Included angle',p.angle===null?'Undefined (zero vector)':f(p.angle,2)+'°'],[is3?'Triangle area':'Parallelogram area',f(p.C/(is3?2:1))+' '+m.unit+'²'],[is3?'Unit normal':'Signed projection onto first',is3?(p.n?vec(p.n):'Undefined (zero cross product)'):(p.projection===null?'Undefined (zero first vector)':f(p.projection)+' '+m.unit)]];
  const reads=host.querySelector('.recap-readouts');reads.replaceChildren();for(const [name,value] of data){const box=document.createElement('div'),label=document.createElement('span'),val=document.createElement('strong');label.textContent=name;val.textContent=value;box.append(label,val);reads.append(box);}
  angle.value=s.angle;length.value=s.length;host.querySelector('[data-angle-output]').textContent=f(s.angle,2)+'°';host.querySelector('[data-length-output]').textContent=f(s.length)+' '+m.unit;
  if(is3){view.value=s.yaw;scale.value=(s.scale-1)*100;host.querySelector('[data-view-output]').textContent=s.yaw+'°';host.querySelector('[data-scale-output]').textContent=f((s.scale-1)*100,1)+'%';}
  let note=p.angle===null?'A zero vector has no direction. Both products vanish, but an included angle cannot be calculated.':p.C<1e-9?'The edges lie on one line. Area is zero and no unique plane normal exists.':Math.abs(p.d)<1e-9?'The edges are perpendicular: the dot product is zero while area is maximal for these lengths.':p.d<0?'The angle is obtuse. The dot product is negative; geometric area remains nonnegative.':'The angle is acute. The dot product is positive; the cross product also records orientation.';
  if(s.swap)note+=' The order has been swapped: cross-product direction reverses, dot product and area do not.';
  host.querySelector('.recap-case-note').textContent=note;
 }
 angle.addEventListener('input',()=>{stop();s.angle=Number(angle.value);draw();});length.addEventListener('input',()=>{stop();s.length=Number(length.value);draw();});
 if(is3){view.addEventListener('input',()=>{s.yaw=Number(view.value);draw();});scale.addEventListener('input',()=>{stop();s.scale=1+Number(scale.value)/100;draw();});}
 host.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{stop();const c=b.dataset.case;if(c==='swap')s.swap=!s.swap;else{const yaw=s.yaw;s=initial(key);s.yaw=yaw;if(c==='parallel')s.angle=0;if(c==='perpendicular')s.angle=90;if(c==='opposite')s.angle=180;if(c==='clockwise')s.angle=-90;if(c==='equal'){s.angle=0;s.length=norm(m.a);}if(c==='near')s.angle=1;if(c==='zeroB')s.length=0;if(c==='zeroA')s.zeroA=true;}draw();}));
 host.querySelector('[data-reset]').addEventListener('click',()=>{stop();s=initial(key);draw();});
 function frame(now){if(!playing)return;if(last)s.angle=Math.min(180,s.angle+(now-last)*.018);last=now;draw();if(s.angle>=180)stop();else raf=requestAnimationFrame(frame);}
 play.addEventListener('click',()=>{if(playing){stop();return;}if(s.length===0||s.zeroA)s=initial(key);if(s.angle>=180)s.angle=-180;playing=true;last=0;play.textContent='Pause sweep';draw();raf=requestAnimationFrame(frame);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 if('IntersectionObserver'in root)new IntersectionObserver(es=>{if(!es[0].isIntersecting)stop();}).observe(host);
 draw();
}
function update(q){const ds=[...q.querySelectorAll('.recap-steps > details')],n=ds.filter(d=>d.open).length;q.querySelector('.reveal-status').textContent=`${n} of ${ds.length} steps revealed`;q.querySelector('.next-step').disabled=n===ds.length;}
document.querySelectorAll('.recap-question').forEach(q=>{q.querySelector('.next-step').addEventListener('click',()=>{const d=q.querySelector('.recap-steps > details:not([open])');if(d){d.open=true;d.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}update(q);});q.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>update(q)));update(q);});
document.querySelector('[data-reveal-all]').addEventListener('click',()=>document.querySelectorAll('.recap-steps > details').forEach(d=>d.open=true));
document.querySelector('[data-hide-all]').addEventListener('click',()=>document.querySelectorAll('.recap-steps > details').forEach(d=>d.open=false));
document.querySelectorAll('[data-vector-lab]').forEach(makeLab);
})(typeof window==='undefined'?globalThis:window);
