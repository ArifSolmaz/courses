/* Student-paced geometry. No continuous sweep or live number stream. */
(()=>{'use strict';
const host=document.getElementById('trig-lab');if(!host)return;
const steps=[
 {title:'Start with one vector',question:'Where is the angle measured from?',text:'B points 30° above the horizontal. The angle starts at +x. Its length is the slanted side; it is not either component.',eq:'B=5\\,\\mathrm{cm},\\quad\\theta=30^\\circ',mode:'vector'},
 {title:'Build the right triangle',question:'Which side is adjacent to θ?',text:'Drop a perpendicular from the tip of B to the horizontal. B is the hypotenuse. The horizontal leg is adjacent to θ; the vertical leg is opposite θ.',eq:'B^2=B_x^2+B_y^2',mode:'triangle'},
 {title:'Cosine gives the along-part',question:'How much of B points horizontally?',text:'Focus on the green adjacent side. Cosine is adjacent divided by hypotenuse. Multiply by B to obtain the horizontal component.',eq:'\\cos\\theta=\\frac{B_x}{B}\\quad\\Rightarrow\\quad B_x=B\\cos\\theta',mode:'cos'},
 {title:'Sine gives the transverse part',question:'How much of B points vertically?',text:'Focus on the purple opposite side. Sine is opposite divided by hypotenuse. Multiply by B to obtain the vertical component.',eq:'\\sin\\theta=\\frac{B_y}{B}\\quad\\Rightarrow\\quad B_y=B\\sin\\theta',mode:'sin'},
 {title:'Build the dot product',question:'Which part of B lies along A?',text:'Place A along the horizontal. Only the green projection contributes: multiply A by the signed horizontal component of B. The result is a scalar.',eq:'\\mathbf A\\cdot\\mathbf B=A B_x=AB\\cos\\theta',mode:'dot'},
 {title:'Build the cross-product magnitude',question:'What is the perpendicular height?',text:'Complete the parallelogram. Its base is A and its height is the purple vertical leg, not the slanted length B. Base × height gives its area and the cross-product magnitude.',eq:'|\\mathbf A\\times\\mathbf B|=Ah=AB\\sin\\theta',mode:'cross'},
 {title:'Predict: parallel vectors',question:'At 0°, which product becomes zero?',text:'Before revealing, imagine the purple height collapsing while the green projection becomes the full length of B.',answer:'The height is zero, so cross product and area vanish. All of B lies along A, so the dot product is +AB.',eq:'\\mathbf A\\cdot\\mathbf B=AB,\\quad\\mathbf A\\times\\mathbf B=\\mathbf0',mode:'limit',angle:0},
 {title:'Predict: perpendicular vectors',question:'At 90°, which product becomes zero?',text:'Before revealing, imagine the horizontal projection shrinking to zero while the perpendicular height becomes the full length of B.',answer:'There is no component along A, so the dot product is zero. The height is B, giving the largest cross-product magnitude for these lengths.',eq:'\\mathbf A\\cdot\\mathbf B=0,\\quad|\\mathbf A\\times\\mathbf B|=AB',mode:'limit',angle:90},
 {title:'Predict: opposite vectors',question:'Does opposite mean perpendicular?',text:'Before revealing, imagine B pointing backward along the same line as A. Is there any height?',answer:'The projection is −B, so the dot product is −AB. There is no height, so the cross product is zero. Opposite vectors are not perpendicular.',eq:'\\mathbf A\\cdot\\mathbf B=-AB,\\quad\\mathbf A\\times\\mathbf B=\\mathbf0',mode:'limit',angle:180},
 {title:'Direction is a separate question',question:'Can geometric area be negative?',text:'Compare B above and below the horizontal. The height as a distance remains positive. The right-hand rule reverses the cross-product direction: out of the screen above, into the screen below.',eq:'|\\mathbf A\\times\\mathbf B|=AB|\\sin\\alpha|',mode:'direction'},
 {title:'Change the angle reference',question:'Why do sine and cosine exchange roles?',text:'Keep B still. Measure β from +y instead. The vertical leg is now adjacent to β. The vector has not changed; only the angle’s reference has changed.',eq:'B_x=B\\sin\\beta,\\quad B_y=B\\cos\\beta',mode:'reference'}
];
let index=0,revealed=false,below=false,fromY=false;
host.innerHTML='<h3>Guided lesson · one idea at a time</h3><div class="recap-workspace"><div class="recap-visual"><div class="recap-scene"></div></div><div class="recap-controls"><p class="lesson-progress" aria-live="polite"></p><h3 class="lesson-title"></h3><p class="lesson-question"></p><p class="lesson-text"></p><div class="lesson-equation"></div><button class="lesson-action" type="button"></button><details class="lesson-values"><summary>Show numerical example</summary><p></p></details><div class="recap-play"><button data-back type="button">← Back</button><button data-next type="button">Next →</button><button data-replay type="button">Replay step</button></div><p class="lesson-pacing">Nothing advances automatically. Pause, explain the picture, then continue.</p></div></div>';
const P=(x,y)=>[230+40*x,280-40*y];
function draw(){
 const st=steps[index],angle=st.mode==='limit'?(revealed?st.angle:30):st.mode==='direction'&&below?-30:30,t=angle*Math.PI/180,x=5*Math.cos(t),y=5*Math.sin(t);
 const triangle=st.mode!=='vector',base=['dot','cross','limit','direction'].includes(st.mode),area=['cross','limit','direction'].includes(st.mode),ref=st.mode==='reference'&&fromY;
 const O=P(0,0),B=P(x,y),F=P(x,0),A=P(4,0),C=P(4+x,y);
 const line=(a,b,col,width=3,dash=false)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${width}" ${dash?'stroke-dasharray="6 5"':''}/>`;
 const arrow=(a,b,c,w=3)=>{let dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<.01)return '';let ux=dx/l,uy=dy/l;return line(a,b,c,w)+`<polygon points="${b} ${[b[0]-11*ux+5*uy,b[1]-11*uy-5*ux]} ${[b[0]-11*ux-5*uy,b[1]-11*uy+5*ux]}" fill="${c}"/>`;};
 const txt=(p,s,c='#24354b',dx=8,dy=-10)=>`<text x="${p[0]+dx}" y="${p[1]+dy}" fill="${c}" font-size="21">${s}</text>`;
 const green=st.mode==='sin'?'#bec9c3':'#28744f',purple=['cos','dot'].includes(st.mode)?'#c8c1d0':'#8351a8';
 const arc=[];const start=ref?Math.PI/2:0;for(let j=0;j<=40;j++){let q=start+(t-start)*j/40;arc.push(P(1.1*Math.cos(q),1.1*Math.sin(q)).join(','));}
 let svg=`${line(P(-5.4,0),P(9.6,0),'#b0b8c2',1.5)}${txt(P(9.6,0),'+x','#697586',0,25)}`;
 if(st.mode==='reference')svg+=line(O,P(0,5.6),'#b0b8c2',1.5)+txt(P(0,5.6),'+y','#697586');
 if(area)svg+=`<polygon points="${O} ${A} ${C} ${B}" fill="#e8c5ad" fill-opacity=".45"/>`+line(A,C,'#b34b25',2,true)+line(B,C,'#165a9b',2,true);
 if(triangle){svg+=line(O,F,green,7)+line(F,B,purple,5);if(Math.abs(x)>.1&&Math.abs(y)>.1)svg+=`<polyline points="${P(x-Math.sign(x)*.3,0)} ${P(x-Math.sign(x)*.3,Math.sign(y)*.3)} ${P(x,Math.sign(y)*.3)}" stroke="${purple}" fill="none" stroke-width="2"/>`;
 svg+=txt(P(x/2,0),Math.abs(x)<1e-8?'Bx = 0':st.mode==='triangle'?'adjacent':'Bx',green,-22,y<0?-18:43)+txt(P(x,y/2),Math.abs(y)<1e-8?'By = 0':st.mode==='triangle'?'opposite':area?'height':'By',purple,14,Math.abs(y)<1e-8?25:0);}
 if(base)svg+=arrow(O,A,'#165a9b')+txt(A,'A','#165a9b',5,y<0?-14:24);
 svg+=arrow(O,B,'#b34b25',4)+txt(B,st.mode==='triangle'?'B · hypotenuse':'B','#b34b25',8,-12)+txt(O,'O','#24354b',-22,22);
 if(!(st.mode==='limit'&&revealed))svg+=`<polyline points="${arc.join(' ')}" stroke="#24354b" fill="none" stroke-width="2"/>`+txt(P(1.65*Math.cos((start+t)/2),1.65*Math.sin((start+t)/2)),ref?'β':st.mode==='direction'?'α':'θ','#24354b',0,0);
 else svg+=txt(P(2,1),angle+'°','#24354b');
 if(st.mode==='direction')svg+=`<text x="30" y="435" font-size="22" fill="#24354b">${below?'⊗ Into the screen (−z)':'⊙ Out of the screen (+z)'} · area stays positive</text>`;
 const scene=host.querySelector('.recap-scene');scene.innerHTML=`<svg viewBox="0 0 680 470" role="img" aria-label="${st.title}. B at ${angle} degrees from positive x."><rect width="680" height="470" rx="12" fill="#f5f7fb"/><g font-family="Arial,sans-serif">${svg}</g></svg>`;
 host.querySelector('.lesson-progress').textContent=`Step ${index+1} of ${steps.length}`;host.querySelector('.lesson-title').textContent=st.title;host.querySelector('.lesson-question').textContent=st.question;host.querySelector('.lesson-text').textContent=st.mode==='limit'&&revealed?st.answer:st.text;
 const eq=host.querySelector('.lesson-equation');eq.innerHTML='';if(st.mode!=='limit'||revealed){const formula=st.mode==='reference'&&!fromY?'B_x=B\\cos\\theta,\\quad B_y=B\\sin\\theta':st.eq;if(window.katex)window.katex.render(formula,eq,{displayMode:true,throwOnError:false});else eq.textContent=formula;}
 const action=host.querySelector('.lesson-action');action.hidden=!['limit','direction','reference'].includes(st.mode);action.textContent=st.mode==='limit'?(revealed?'Predict again':'Reveal the result'):st.mode==='direction'?(below?'Place B above the axis':'Place B below the axis'):(fromY?'Measure from +x':'Measure from +y');
 host.querySelector('.lesson-values p').textContent=`For B = 5 cm${base?' and A = 4 cm':''}, at ${angle}°: Bx = ${(Math.abs(x)<1e-8?0:x).toFixed(2)} cm; By = ${(Math.abs(y)<1e-8?0:y).toFixed(2)} cm.${base?' Dot = '+(Math.abs(4*x)<1e-8?0:4*x).toFixed(2)+' cm²; cross-product magnitude = '+Math.abs(4*y).toFixed(2)+' cm².':''}`;
 host.querySelector('.lesson-values').hidden=st.mode==='limit'&&!revealed;
 host.querySelector('[data-back]').disabled=index===0;host.querySelector('[data-next]').disabled=index===steps.length-1;
}
function reset(){revealed=false;below=false;fromY=false;host.querySelector('.lesson-values').open=false;draw();if(innerWidth<=800)host.querySelector('.lesson-progress').scrollIntoView({block:'start',behavior:'instant'});}
host.querySelector('[data-next]').addEventListener('click',()=>{if(index<steps.length-1){index++;reset();}});host.querySelector('[data-back]').addEventListener('click',()=>{if(index>0){index--;reset();}});host.querySelector('[data-replay]').addEventListener('click',reset);
host.querySelector('.lesson-action').addEventListener('click',()=>{const m=steps[index].mode;if(m==='limit')revealed=!revealed;if(m==='direction')below=!below;if(m==='reference')fromY=!fromY;draw();});draw();
})();
