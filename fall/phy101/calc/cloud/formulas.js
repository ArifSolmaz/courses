/* Native MathML: accessible display mathematics without a CDN or runtime download. */
(function(){
'use strict';
const i=s=>'<mi>'+s+'</mi>', n=s=>'<mn>'+s+'</mn>', o=s=>'<mo>'+s+'</mo>';
const row=(...s)=>'<mrow>'+s.join('')+'</mrow>';
const sub=(a,b)=>'<msub>'+a+b+'</msub>', sq=a=>a.startsWith('<msub>')?'<msubsup>'+a.slice(6,-7)+n(2)+'</msubsup>':'<msup>'+a+n(2)+'</msup>';
const frac=(a,b)=>'<mfrac>'+a+b+'</mfrac>', root=a=>'<msqrt>'+a+'</msqrt>';
const v=i('v'),v0=sub(v,n(0)),g=i('g'),a=i('a'),dx=row(i('Δ'),i('x')),theta=i('θ'),m=i('m');
const trig=(name,x)=>row('<mi mathvariant="normal">'+name+'</mi>',o('⁡'),x);
const half=frac(n(1),n(2)), muk=sub(i('μ'),i('k')),vy=sub(v,row(n(0),i('y')));
const equations={
 'W2-C1':row(sq(v),o('='),sq(v0),o('+'),n(2),a,dx),
 'W2-C2':row(a,o('='),frac(row(sq(v),o('−'),sq(v0)),row(n(2),dx))),
 'W2-C3':row(n(0),o('='),sq(v0),o('−'),n(2),a,dx),
 'W3-C1':row(i('R'),o('='),frac(row(sq(v0),trig('sin',row(o('('),n(2),theta,o(')')))),g)),
 'W3-C2':row(i('t'),o('='),frac(row(vy,o('+'),root(row(sq(vy),o('+'),n(2),g,i('h')))),g)),
 'W3-C3':row(o('∑'),i('F'),o('='),m,a),
 'W4-C1':row(a,o('='),g,o('('),trig('sin',theta),o('−'),muk,trig('cos',theta),o(')')),
 'W4-C2':row(trig('tan',sub(theta,i('c'))),o('='),sub(i('μ'),i('s'))),
 'W4-C3':row(a,o('='),frac(row(o('('),sub(m,n(1)),o('−'),sub(m,n(2)),o(')'),g),row(sub(m,n(1)),o('+'),sub(m,n(2))))),
 'W5-C1':row(i('W'),o('='),i('F'),i('d'),trig('cos',theta)),
 'W5-C2':row(sub(i('U'),i('s')),o('='),half,i('k'),sq(i('x'))),
 'W5-C3':row(i('P'),o('='),frac(i('W'),row(i('Δ'),i('t')))),
 'W6-C1':row(i('F'),o('='),root(row(sq(sub(i('F'),i('x'))),o('+'),sq(sub(i('F'),i('y')))))),
 'W6-C2':row(m,g,i('h'),o('−'),muk,m,g,i('d'),o('='),half,m,sq(v)),
 'W6-C3':row(i('W'),o('='),i('F'),i('d'),trig('cos',theta))
};
const notes={
 'W2-C3':['Convert the speed to m/s first.','Önce hızı m/s birimine çevir.'],
 'W5-C1':['Check the sign of the work.','İşin işaretine dikkat et.'],
 'W6-C2':['The mass cancels.','Kütle sadeleşir.'],
 'W6-C3':['Round only the final answer.','Yalnızca son cevabı yuvarla.']
};
window.PHY_FORMULAS={render(host,id,lang,fallback){
 const key=id+'/'+lang;if(host.dataset.formula===key)return;host.dataset.formula=key;
 host.replaceChildren();
 const equation=document.createElement('div');equation.className='equation';
 if(equations[id])equation.innerHTML='<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+equations[id]+'</math>';
 else equation.textContent=fallback;
 host.appendChild(equation);
 if(notes[id]){const note=document.createElement('div');note.className='formula-note';note.textContent=notes[id][lang==='tr'?1:0];host.appendChild(note);}
}};
})();
