/* Equation-driven textbook demonstrations. No autoplay; each stops at its model boundary. */
(function(root){
'use strict';
const models={
 route:{title:'Watch distance accumulate while displacement cancels',end:110,key:40,keyLabel:'At the turn',unit:'m',state(t){const x=t<=40?5*t:200-4*(t-40);return {x,v:t===40?null:t<40?5:-4,d:t<=40?5*t:200+4*(t-40),a:null};},note(t){return t===40?'At the turn the ideal model changes velocity abruptly; acceleration at that instant is not defined.':t<40?'Eastward: distance and displacement both increase.':'Westward: distance keeps increasing while displacement decreases.';}},
 car:{title:'Zero velocity is an instant, not necessarily a parked car',end:16,key:40/3,keyLabel:'At zero velocity',unit:'m',state(t){return{x:2.4*t*t-.12*t*t*t,v:4.8*t-.36*t*t,a:4.8-.72*t};},note(t){return Math.abs(t-40/3)<1e-5?'At the turn: velocity = 0, but acceleration = −4.80 m/s².':t<40/3?'The car still moves right while its velocity is positive.':'The prescribed model continues: negative velocity means motion to the left.';}},
 incline:{title:'Half the distance gives more than half the final speed',end:13.6/3.8,key:(13.6/3.8)/Math.sqrt(2),keyLabel:'Halfway down',unit:'m',state(t){const a=3.8*3.8/13.6;return{x:.5*a*t*t,v:a*t,a};},note(t){return Math.abs(t-this.key)<1e-5?'At 3.40 m: speed is 2.69 m/s, not 1.90 m/s.':'From rest, v² is proportional to distance. Acceleration stays constant downhill.';}},
 balloon:{title:'Released does not mean initially at rest',end:(5+Math.sqrt(809))/9.8,key:5/9.8,keyLabel:'At the highest point',unit:'m',state(t){return{x:40+5*t-4.9*t*t,v:5-9.8*t,a:-9.8};},note(t){return Math.abs(t-this.key)<1e-5?'At the apex: velocity = 0 while acceleration remains −9.80 m/s².':t<this.key?'The bag initially rises because it inherits the balloon’s upward velocity.':t>=this.end-1e-7?'Just before impact. The collision and its acceleration are outside this model.':'The bag descends, speeding up under downward gravity.';}}
};
if(typeof module!=='undefined'&&module.exports)module.exports=models;
if(typeof document==='undefined')return;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function setup(host){
 const key=host.dataset.w2Explorer,M=models[key]; if(!M)return;
 host.classList.add('w2-explorer');
 host.innerHTML=`<h4>${M.title}</h4><p class="w2-predict">Predict the motion at the marked instant, then use the controls to check.</p><div class="w2-scene"></div><p class="w2-values"></p><div class="w2-buttons"><button type="button" data-play>Play</button><button type="button" data-reset>Reset</button><button type="button" data-key>${M.keyLabel}</button></div><label class="w2-time">Time <input type="range" min="0" max="${M.end}" step="any" value="0" aria-label="Time for ${key} motion"><output>0.00 s</output></label><p class="w2-note"></p>`;
 const slider=host.querySelector('input'),play=host.querySelector('[data-play]');
 let t=0,running=false,last=0,raf=0;
 const f=(n,d=2)=>(Math.abs(n)<.000001?0:n).toFixed(d);
 const text=(x,y,s,color='#24354b')=>`<text x="${x}" y="${y}" fill="${color}" font-size="20">${esc(s)}</text>`;
 const line=(x,y,u,v,color='#24354b')=>`<path d="M${x},${y} L${u},${v}" stroke="${color}" stroke-width="3" fill="none"/>`;
 function draw(){
  const S=M.state(t);let b='';
  if(key==='balloon'){
   const Y=y=>275-y*4.8;
   b+=line(95,40,95,275)+line(80,275,490,275)+text(110,40,'+y upward')+text(330,267,'Ground: 0 m');
   b+=line(85,Y(40),105,Y(40))+text(110,Y(40)+5,'Release: 40.0 m');
   b+=`<circle cx="305" cy="${Y(S.x)}" r="11" fill="#145e96"/>`;
   const dv=-S.v*2,da=48;
   b+=text(404,135,"v", "#145e96")+text(470,135,"a", "#b0442c");
   if(Math.abs(dv)>.01)b+=line(415,160,415,160+dv,'#145e96')+`<path d="M409,${160+dv-Math.sign(dv)*9} L415,${160+dv} L421,${160+dv-Math.sign(dv)*9}" fill="none" stroke="#145e96" stroke-width="3"/>`;
   b+=line(480,160,480,160+da,'#b0442c')+`<path d="M474,${160+da-9} L480,${160+da} L486,${160+da-9}" fill="none" stroke="#b0442c" stroke-width="3"/>`;
   b+=text(22,330,'Blue: velocity · rust: acceleration');
  }else if(key==='incline'){
   b+=line(65,65,495,255)+text(30,37,'Start: 0 m')+text(350,300,'End: 6.80 m');
   const q=S.x/6.8,x=65+430*q,y=65+190*q;
   b+=`<rect x="${x-10}" y="${y-22}" width="22" height="22" fill="#145e96" transform="rotate(23.85 ${x} ${y})"/>`;
   b+=line(280,148,280,177,'#b0442c')+text(290,133,'Halfway: 3.40 m')+text(22,330,'Schematic incline · positive downhill');
  }else{
   const lo=key==='route'?-80:0,hi=key==='route'?200:150,X=x=>65+(x-lo)/(hi-lo)*430;
   b+=line(50,180,520,180)+text(415,219,'+x right');
   for(const x of [lo,hi])b+=line(X(x),174,X(x),186)+text(X(x)-20,252,`${x} m`);
   if(key==='route')b+=line(X(0),174,X(0),186)+text(X(0)-6,211,'0');
   b+=`<circle cx="${X(S.x)}" cy="165" r="12" fill="#145e96"/>`;
   b+=text(30,60,key==='route'?'← West · East →':'Prescribed motion: 0–16 s')+text(30,110,`Position: ${f(S.x)} m`);
   if(Math.abs(S.v)>.00001){const dir=Math.sign(S.v),x=X(S.x),u=x+dir*30;b+=line(x,143,u,143,'#145e96')+`<path d="M${u-dir*8},137 L${u},143 L${u-dir*8},149" fill="none" stroke="#145e96" stroke-width="3"/>`;}
  }
  host.querySelector('.w2-scene').innerHTML=`<svg viewBox="0 0 560 350" role="img" aria-label="${esc(M.title)} at ${f(t)} seconds"><rect width="560" height="350" rx="12" fill="#f6f8fb"/><g font-family="Arial, sans-serif">${b}</g></svg>`;
  host.querySelector('.w2-values').textContent=(key==='balloon'?'Height':'Position')+` ${f(S.x)} m · Velocity ${S.v===null?"undefined at the turn":f(S.v)+" m/s"}`+(S.a!==null?` · Acceleration ${f(S.a)} m/s²`:` · Distance ${f(S.d)} m`);
  host.querySelector('.w2-note').textContent=M.note(t);
  slider.value=t;host.querySelector('output').value=`${f(t)} s`;
 }
 function stop(){running=false;cancelAnimationFrame(raf);play.textContent='Play';}
 function frame(now){if(!running)return;if(last)t=Math.min(M.end,t+(now-last)/1000*M.end/12);last=now;draw();if(t>=M.end)stop();else raf=requestAnimationFrame(frame);}
 play.addEventListener('click',()=>{if(running){stop();return;}if(t>=M.end)t=0;running=true;last=0;play.textContent='Pause';raf=requestAnimationFrame(frame);});
 slider.addEventListener('input',()=>{stop();t=Number(slider.value);draw();});
 host.querySelector('[data-reset]').addEventListener('click',()=>{stop();t=0;draw();});
 host.querySelector('[data-key]').addEventListener('click',()=>{stop();t=M.key;draw();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 if('IntersectionObserver'in root)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(host);
 draw();
}
document.querySelectorAll('[data-w2-explorer]').forEach(setup);
})(typeof window==='undefined'?globalThis:window);
