/* Execute the real drawing callbacks and Scene transforms without a browser.
 * Browser checks complement these deterministic numerical/geometry checks. */
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const path = require('path'), root = path.join(__dirname, '../assets');
let checks = 0;
const check = (ok,msg) => { checks++; assert.ok(ok,msg); };
const near = (a,b,t=1e-8) => check(Math.abs(a-b)<=t, `${a} != ${b}`);
const ctx = new Proxy({measureText:s=>({width:s.length*6})}, {get:(o,k)=> k in o?o[k]:(()=>{})});
function element(){return {style:{},classList:{},clientWidth:640,appendChild(){},setAttribute(){},addEventListener(){},getContext:()=>ctx};}
const document = {readyState:'loading',documentElement:{},createElement:element,addEventListener(){}};
const sandbox = {document,console,Math,Number,isFinite, getComputedStyle:e=>({paddingLeft:e.pad||'0',paddingRight:e.pad||'0',getPropertyValue:()=>''}),window:{devicePixelRatio:1,addEventListener(){},matchMedia:()=>({matches:false})}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'anim.js'),'utf8'),sandbox);
const actual = sandbox.window.PhyAnim.ui, registry = {};
sandbox.PhyAnim = {register:(name,fn)=>registry[name]=fn};
vm.runInContext(fs.readFileSync(path.join(root,'anim-w1.js'),'utf8'),sandbox);
function mount(name,width){
 const controls={},segments={},stats={},scenes=[];
 const U = {...actual, predict:()=>({}), slider:(p,l,o,f)=>{controls[l]={o,set:f};return {el:{style:{}}};},
 seg:(p,l,opts,v,f)=>{segments[l]={opts,set:f};},stat:(p,l)=>({set:v=>stats[l]=v}),
 Player:(p,o)=>{const x={value:0,duration:o.duration,t(){return this.value;},reset(){this.value=0;},play(){}};controls.time={set:v=>{x.value=v*o.duration;o.onFrame(v,x.value);}};return x;},
 Scene:(p,o)=>{
  p.clientWidth=width+36;p.pad='18';const s=actual.Scene(p,o);s.plots=[];s.arrows=[];
  const plot=s.plot;s.plot=function(opts){const P=plot(opts);this.plots.push({opts,P});const arrow=P.arrow;P.arrow=(...args)=>{this.arrows.push(args);return arrow(...args);};return P;};
  const draw=s.draw;s.draw=function(){this.plots=[];this.arrows=[];return draw();};scenes.push(s);return s;
 }};
 registry[name]({U,stage:element(),controls:{},stats:{},gate:{}});
 return {controls,segments,stats,scene:scenes[0]};
}
function scales(s,indices){
 near(s.w,s.canvas.width);near(s.h,s.canvas.height);
 for(const i of indices){const {P}=s.plots[i];near(Math.abs(P.X(1)-P.X(0)),Math.abs(P.Y(1)-P.Y(0)));}
 for(const a of s.arrows){check(a.slice(0,4).every(Number.isFinite),'nonfinite arrow');}
}
function read(m,label){return parseFloat(m.stats[label]);}
for(const width of [268,318,480,640,1000]){
 const m=mount('w1-vectors',width);
 for(let mag=0;mag<=80;mag++){
  m.controls.magnitude.set(mag/10);
  for(let angle=0;angle<=360;angle++){
   m.controls.angle.set(angle);const r=angle*Math.PI/180;
   near(read(m,'Aₓ = A cos θ'),mag/10*Math.cos(r),.005001);
   near(read(m,'Aᵧ = A sin θ'),mag/10*Math.sin(r),.005001);
   near(read(m,'magnitude'),mag/10,.005001);scales(m.scene,[0]);
   if(mag===0)check(m.stats['calculator arctan']==='undefined','zero direction');
   else if(angle%180===90)check(m.stats['calculator arctan'].includes('Aₓ = 0'),'vertical division');
  }
 }
 m.segments.show.set('skier');scales(m.scene,[0]);near(read(m,'magnitude'),Math.sqrt(5),.005);
 const p=mount('w1-products',width);
 for(let a=1;a<=8;a+=.5){p.controls.A.set(a);for(let b=1;b<=8;b+=.5){p.controls.B.set(b);for(let phi=0;phi<=180;phi++){
  p.controls['angle φ'].set(phi);near(read(p,'A·B = AB cos φ'),a*b*Math.cos(phi*Math.PI/180),.005001);
  near(read(p,'|A×B| = AB sin φ'),a*b*Math.sin(phi*Math.PI/180),.005001);scales(p.scene,[0]);
  check(p.stats['direction of A×B']===(phi%180===0?'undefined (zero vector)':'out of the page (+z)'),'cross direction');
 }}}
 const o=mount('w1-order',width);check(o.segments.order.opts.length===6,'six orders');
 const rx=72.4*Math.sin(32*Math.PI/180)-57.3*Math.cos(36*Math.PI/180);
 const ry=72.4*Math.cos(32*Math.PI/180)-57.3*Math.sin(36*Math.PI/180)-17.8;
 for(const [i] of o.segments.order.opts){o.segments.order.set(i);for(let t=0;t<=1000;t++){
  o.controls.time.set(t/1000);near(read(o,'Rₓ'),rx,.005001);near(read(o,'Rᵧ'),ry,.005001);scales(o.scene,[0]);
  const {opts}=o.scene.plots[0];for(const a of o.scene.arrows){for(const k of [0,2]){check(a[k]>=opts.xlim[0]&&a[k]<=opts.xlim[1],'x clipped');check(a[k+1]>=opts.ylim[0]&&a[k+1]<=opts.ylim[1],'y clipped');}}
 }}
}
console.log(`PASS: ${checks} assertions; all component and product slider values, six routes at 1001 times, five widths, actual Scene transforms.`);
