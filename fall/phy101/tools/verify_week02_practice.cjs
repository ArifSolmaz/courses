/* Independent kinematics checks for textbook answers and the animation trajectories. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const M=require('../assets/week02-practice.js');
const close=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
const expected=[1,2,3,4,5,6,7,8,9,14,15,16,19,20,21,24,30,32,37,42];
const nb=JSON.parse(fs.readFileSync(path.join(root,'notebooks/Week_02.ipynb')));
const cells=nb.cells.filter(c=>c.metadata.solution_visible);
assert.equal(cells.length,20);
expected.forEach((id,i)=>{
 assert(cells[i].source.join('').includes(`${i+1}. Y&F Exercise 2.${id} —`));
 assert(fs.existsSync(path.join(root,`assets/week02-solutions/exercise-2-${String(id).padStart(2,'0')}.svg`)));
});
const page=fs.readFileSync(path.join(root,'w2/index.html'),'utf8');
assert.equal((page.match(/data-solution-visible="true"/g)||[]).length,20);
assert.equal((page.match(/data-w2-explorer=/g)||[]).length,4);
assert(page.indexOf('selected-textbook-questions',page.indexOf('id="stage-practise"'))>0);
// Reference answers calculated from the supplied givens, independent of rendering.
close(6.25*4,25);
close(-5150000/(13.5*86400),-4.415295,1e-6);
close((105*(110/60)/70)*60-110,55);
close((200+280)/(200/5+280/4),48/11);
close((200-280)/110,-8/11);
close(20/64,.3125);close(100/64,1.5625);
const x=t=>1.5*t*t-.05*t*t*t;
close(x(2)/2,2.8);close(x(4)/4,5.2);close((x(4)-x(2))/2,7.6);
close(M.car.state(10).x/10,12);close(M.car.state(5).v,15);close(M.car.state(10).v,12);
close(12.4-3*.045*64,3.76);
close((2*2+3)/3,7/3);close((2*2-3)/3,1/3);
close(2*Math.sqrt(.86*12),6.424951,1e-6);
close(((3+.1*25)-3)/5,.5);close(2*.1*5,1);
close((5-15)/10,-1);close((-15+5)/10,-1);close((-15-15)/10,-3);
const vi=2*70/6-15;close(vi,25/3);close((15-vi)/6,10/9);
close(73.14/.03,2438);close(.5*73.14*.03,1.0971);
close(45**2/3,675);close(45/675,1/15);
close(20**2/(2*120),5/3);close(240/20,12);close(20*12,240);
close(M.incline.state(M.incline.key).x,3.4);close(M.incline.state(M.incline.key).v,3.8/Math.sqrt(2));
const tr=(22+Math.sqrt(1072))/9.8;close(30+22*tr-4.9*tr*tr,0);close(22-9.8*tr,-Math.sqrt(1072));
close(24-9.8,14.2);close(24-9.8*3,-5.4);
close(M.balloon.state(.25).x,40.94375);close(M.balloon.state(.25).v,2.55);
close(M.balloon.state(1).x,40.1);close(M.balloon.state(1).v,-4.8);
close(M.balloon.state(M.balloon.end).x,0);close(M.balloon.state(M.balloon.end).v,-Math.sqrt(809));
close(M.balloon.state(M.balloon.key).x,40+25/19.6);
// Numerically differentiate position and velocity at interior times.
for(const [name,m] of Object.entries(M))for(let i=1;i<100;i++){
 const t=m.end*i/100,h=1e-5;
 if(name==='route'&&Math.abs(t-40)<h*2)continue;
 const s=m.state(t),lo=m.state(t-h),hi=m.state(t+h);
 close((hi.x-lo.x)/(2*h),s.v,1e-6);
 if(s.a!==null)close((hi.v-lo.v)/(2*h),s.a,1e-6);
}
close(M.route.state(110).x,-80);close(M.route.state(110).d,480);
close(M.car.state(M.car.key).v,0);close(M.car.state(M.car.key).a,-4.8);
assert(M.car.state(14).v<0);
close(M.incline.state(M.incline.end).x,6.8);close(M.incline.state(M.incline.end).v,3.8);
console.log('PASS: 20 source-numbered solutions, 20 figures, four animations, reference answers, numerical derivatives and model boundaries.');
