/* Geometry-first derivation: signed components, projection, and area. */
(()=>{'use strict';
const host=document.getElementById('trig-lab');if(!host)return;
let angle=30,reference='x',playing=false,last=0,raf=0;
host.innerHTML=`<h3>One vector, two angle references</h3><div class="recap-workspace"><div class="recap-visual"><div class="recap-scene"></div><div class="recap-readouts" aria-live="off"></div></div><div class="recap-controls"><div class="recap-inputs"><label>Direction from +x <output></output><input aria-label="Triangle vector direction" type="range" min="-90" max="180" step="1" value="30"></label></div><div class="recap-presets"><button data-ref="x" aria-pressed="true">Angle from +x</button><button data-ref="y" aria-pressed="false">Angle from +y</button></div><p class="trig-formula"></p><div class="recap-presets">${[-90,-30,0,30,60,90,120,180].map(n=>`<button data-angle="${n}">${n}° from +x</button>`).join('')}</div><div class="recap-play"><button data-play>Play rotation</button><button data-reset>Reset</button></div><p class="recap-case-note"></p><p class="trig-legend">Green: signed horizontal projection.<br>Purple: vertical component.<br>Shading: parallelogram area.<br>Arc: selected directed angle.</p></div></div>`;
const scene=host.querySelector('.recap-scene'),reads=host.querySelector('.recap-readouts'),slider=host.querySelector('input'),play=host.querySelector('[data-play]');
const fmt=n=>(Math.abs(n)<1e-9?0:n).toFixed(2),P=(x,y)=>[260+32*x,220-32*y];
function draw(){const t=angle*Math.PI/180,x=5*Math.cos(t),y=5*Math.sin(t),beta=90-angle;
const O=P(0,0),B=P(x,y),F=P(x,0),A=P(4,0),C=P(4+x,y);
const line=(a,b,col,dash='',width=3)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${width}" ${dash?'stroke-dasharray="6 5"':''}/>`;
const arrow=(a,b,col)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<.01)return '';const ux=dx/l,uy=dy/l;return line(a,b,col)+`<polygon points="${b} ${[b[0]-10*ux+4*uy,b[1]-10*uy-4*ux]} ${[b[0]-10*ux-4*uy,b[1]-10*uy+4*ux]}" fill="${col}"/>`;};
const label=(p,s,col,dx=8,dy=-10)=>`<text x="${p[0]+dx}" y="${p[1]+dy}" fill="${col}" font-size="19">${s}</text>`;
const start=reference==='x'?0:Math.PI/2,arc=[];for(let i=0;i<=40;i++){const a=start+(t-start)*i/40;arc.push(P(1.35*Math.cos(a),1.35*Math.sin(a)).join(','));}
scene.innerHTML=`<svg viewBox="0 0 680 440" role="img" aria-label="B has components ${fmt(x)}, ${fmt(y)} centimetres; angle from x ${angle} degrees. Dot ${fmt(4*x)}; signed cross z ${fmt(4*y)} square centimetres."><rect width="680" height="440" rx="12" fill="#f5f7fb"/><g font-family="Arial, sans-serif">${line(P(-6,0),P(10.8,0),'#a0aab7')}${line(P(0,-5.8),P(0,5.8),'#a0aab7')}${label(P(10.5,0),'+x','#465569')}${label(P(0,5.7),'+y','#465569')}
<polygon points="${O} ${A} ${C} ${B}" fill="#b34b25" fill-opacity=".13"/>${line(A,C,'#b34b25',true)}${line(B,C,'#165a9b',true)}${line(O,F,'#28744f','',8)}${line(F,B,'#8351a8')}${arrow(O,A,'#165a9b')}${arrow(O,B,'#b34b25')}
${Math.abs(x)>.3&&Math.abs(y)>.3?`<polyline points="${P(x-Math.sign(x)*.35,0)} ${P(x-Math.sign(x)*.35,Math.sign(y)*.35)} ${P(x,Math.sign(y)*.35)}" fill="none" stroke="#8351a8" stroke-width="2"/>`:''}
<polyline points="${arc.join(' ')}" fill="none" stroke="#24354b" stroke-width="2"/>${label(P(1.8*Math.cos((start+t)/2),1.8*Math.sin((start+t)/2)),reference==='x'?'α':'β','#24354b',0,0)}
${label(A,'A = 4','#165a9b',4,24)}${label(B,'B = 5','#b34b25',10,-12)}${label(P(x/2,0),'Bx','#28744f',-12,42)}${label(P(x,y/2),Math.abs(y)<1e-9?'By = 0':'By','#8351a8',12,Math.abs(y)<1e-9?25:0)}${label(O,'O','#24354b',-20,22)}
<text x="18" y="425" font-size="17" fill="#465569">${y>1e-9?'Cross product: out of screen (+z)':y< -1e-9?'Cross product: into screen (−z)':'Zero height: cross product is zero'}</text></g></svg>`;
const values=[['Angle α from +x',angle+'°'],['Angle β from +y',beta+'°'],['Included angle φ',Math.abs(angle)+'°'],[reference==='x'?'Bx = 5 cos α':'Bx = 5 sin β',fmt(x)+' cm'],[reference==='x'?'By = 5 sin α':'By = 5 cos β',fmt(y)+' cm'],['Dot = 4 Bx',fmt(4*x)+' cm²'],['Cross z = 4 By',fmt(4*y)+' cm²'],['Height = |By|',fmt(Math.abs(y))+' cm'],['Area = 4 |By|',fmt(Math.abs(4*y))+' cm²']];
reads.innerHTML=values.map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');
slider.value=angle;host.querySelector('output').textContent=angle+'°';
host.querySelector('.trig-formula').textContent=reference==='x'?'α is measured counterclockwise from +x. Bx = 5 cos α; By = 5 sin α.':'β = 90° − α is measured clockwise from +y. Bx = 5 sin β; By = 5 cos β. Negative β means counterclockwise.';
host.querySelectorAll('[data-ref]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ref===reference)));
host.querySelector('.recap-case-note').textContent=Math.abs(x)<1e-9?'No horizontal projection: dot = 0. Full perpendicular height: cross-product magnitude is maximal.':Math.abs(y)<1e-9?'No perpendicular height: area and cross product vanish. The signed projection, and therefore dot product, is '+(x>0?'positive.':'negative.'):x<0?'The projection points against A, so the dot product is negative. Height and geometric area remain nonnegative.':y<0?'The projection is positive, but B lies below A. Dot is positive; the cross-product z-component is negative.':'Cosine measures how much of B is along A. Sine supplies the perpendicular height. The dot product and cross-product z-component are positive here.';
}
function stop(){playing=false;cancelAnimationFrame(raf);play.textContent='Play rotation';}
slider.addEventListener('input',()=>{stop();angle=Number(slider.value);draw();});
host.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{stop();angle=Number(b.dataset.angle);draw();}));
host.querySelectorAll('[data-ref]').forEach(b=>b.addEventListener('click',()=>{reference=b.dataset.ref;draw();}));
host.querySelector('[data-reset]').addEventListener('click',()=>{stop();angle=30;reference='x';draw();});
function frame(now){if(!playing)return;if(last)angle=Math.min(180,angle+(now-last)*.012);last=now;angle=Math.round(angle*100)/100;draw();if(angle>=180)stop();else raf=requestAnimationFrame(frame);}
play.addEventListener('click',()=>{if(playing)return stop();if(angle>=180)angle=-90;playing=true;last=0;play.textContent='Pause rotation';raf=requestAnimationFrame(frame);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});new IntersectionObserver(es=>{if(!es[0].isIntersecting)stop();}).observe(host);draw();
})();
