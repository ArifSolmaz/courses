/* Small, deterministic teaching examples. Algorithm data also runs under Node for verification. */
(function () {
  'use strict';
  const distance = (p, a, b) => Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y);
  const length = (p, route) => route.slice(1).reduce((s, b, i) => s + distance(p, route[i], b), 0);
  function permutations(a) {
    if (!a.length) return [[]];
    return a.flatMap((x, i) => permutations(a.filter((_, j) => i !== j)).map(t => [x, ...t]));
  }
  function exhaustive(p, start = 0) {
    return permutations(p.map((_, i) => i).filter(i => i !== start)).map(t => {
      const route = [start, ...t, start]; return {route, cost: length(p, route)};
    });
  }
  function nearest(p, start = 0) {
    const route = [start], remaining = p.map((_, i) => i).filter(i => i !== start);
    while (remaining.length) {
      remaining.sort((a, b) => distance(p, route.at(-1), a) - distance(p, route.at(-1), b) || Math.abs(p[a].x)-Math.abs(p[b].x) || p[b].x-p[a].x || a-b);
      route.push(remaining.shift());
    }
    return [...route, start];
  }
  function closest(p) {
    const candidates = [], degree = p.map(() => 0), parent = p.map((_, i) => i), chosen = [], frames = [];
    const root = a => parent[a] === a ? a : root(parent[a]);
    for (let a = 0; a < p.length; a++) for (let b = a + 1; b < p.length; b++) candidates.push({a,b,d:distance(p,a,b)});
    candidates.sort((a,b) => a.d-b.d || a.a-b.a || a.b-b.b);
    for (const e of candidates) {
      let reason = '';
      if (degree[e.a] === 2 || degree[e.b] === 2) reason = 'Reject: this would give a point three connections.';
      else if (root(e.a) === root(e.b)) reason = 'Reject: this would close a loop before all points are joined.';
      else {parent[root(e.a)] = root(e.b); degree[e.a]++; degree[e.b]++; chosen.push(e); reason = 'Accept: joins two paths without a branch or early loop.';}
      frames.push({edges:chosen.slice(),candidate:e,reason});
      if (chosen.length === p.length-1) break;
    }
    const [a,b] = degree.map((d,i) => d===1 ? i : -1).filter(i=>i>=0);
    const closing={a,b,d:distance(p,a,b)}; chosen.push(closing);
    frames.push({edges:chosen.slice(),candidate:closing,reason:'All points are in one path. Close the tour by joining its two endpoints.'});
    return frames;
  }
  const line = [0,1,-1,3,-5,11,-21].map(x=>({x,y:0,label:String(x)}));
  const rows = [0,3,6].flatMap(x=>[0,2].map(y=>({x,y,label:''})));
  rows.forEach((p,i)=>p.label=String.fromCharCode(65+i));
  const square = [{x:0,y:0,label:'A'},{x:3,y:0,label:'B'},{x:3,y:2,label:'C'},{x:0,y:2,label:'D'}];
  const robotCases = {
    nearest:{title:'Nearest neighbour · failure',p:line,algorithm:'nearest',start:0,explain:'Start at 0. Distance ties prefer smaller |x|, then positive x: +1 before −1. The route returns home after visiting every point.',lesson:'84 > 64: locally short moves can force a long journey. A single counterexample disproves an “always shortest” claim.'},
    sweep:{title:'Nearest neighbour · success on a line',p:line,algorithm:'nearest',start:6,explain:'Start at the leftmost point, −21, on this same line. This special case succeeds; it does not prove the rule for arbitrary points in a plane.',lesson:'64 = 2 × (11 − (−21)). Every closed line tour must cover the full span twice, so this route reaches a lower bound.'},
    pairLine:{title:'Closest pair · success on a line',p:line,algorithm:'closest',explain:'Consider all pairs in increasing distance. Reject degree 3 and premature loops; close the tour only when one path contains all points. Ties use point order 0, 1, −1, 3, −5, 11, −21.',lesson:'The closest-pair rule also reaches 64 on this line. The next case shows why this successful test is not a proof.'},
    pairRows:{title:'Closest pair · failure on two rows',p:rows,algorithm:'closest',explain:'Coordinates: A(0,0), B(0,2), C(3,0), D(3,2), E(6,0), F(6,2). Vertical gap = 2, horizontal gap = 3. Equal lengths use alphabetical endpoint order.',lesson:'The vertical pairs look cheap, but the final connection is long. A → C → E → F → D → B → A costs 16; the greedy tour costs about 18.32.'},
    outside:{title:'Shortest outside tour · comparison',p:rows,algorithm:'reference',route:[0,2,4,5,3,1,0],explain:'Use the same six points as the closest-pair failure. Follow the outside: A → C → E → F → D → B → A.',lesson:'3 + 3 + 2 + 3 + 3 + 2 = 16. Every tour spans width 6 and height 2; any closed tour must be at least as long as the outside boundary of these points, and this route attains that bound.'},
    exact:{title:'Exhaustive search · all six tours',p:square,algorithm:'exact',explain:'Rectangle: width 3, height 2. Fix A as the start and test all 3! = 6 visit orders, including both directions of each tour.',lesson:'After checking every candidate, 10 is guaranteed optimal. Fixing the start leaves (n−1)! orders; identifying reverse tours leaves (n−1)! / 2 for n ≥ 3 in this symmetric-distance problem.'}
  };
  const filmCases={
    long:{title:'A long film blocks two roles',jobs:[{id:'A',s:1,e:10},{id:'B',s:2,e:3},{id:'C',s:4,e:5}],note:'Earliest start takes A alone. B and C are compatible: two roles.'},
    short:{title:'A short film blocks two roles',jobs:[{id:'A',s:1,e:5},{id:'B',s:4,e:6},{id:'C',s:5.5,e:9}],note:'Shortest duration takes B alone. A and C are compatible: two roles.'},
    mixed:{title:'A full schedule with touching endpoints',jobs:[{id:'A',s:0,e:3},{id:'B',s:1,e:2},{id:'C',s:2,e:4},{id:'D',s:3,e:5},{id:'E',s:4,e:6},{id:'F',s:5,e:7},{id:'G',s:6,e:8}],note:'A film may start exactly when another finishes. Earliest finish selects B, C, E and G: four roles.'},
    ties:{title:'Equal finish times and one boundary',jobs:[{id:'A',s:0,e:3},{id:'B',s:1,e:3},{id:'C',s:3,e:5},{id:'D',s:2,e:6}],note:'A and B tie at finish time 3. Either can precede C, giving an optimal two-role schedule; alphabetical order chooses A.'},
    empty:{title:'Edge case · no offers',jobs:[],note:'With no offered films, the optimal answer is the empty schedule: zero roles.'}
  };
  const overlap=(a,b)=>a.s<b.e && b.s<a.e;
  function schedule(jobs,rule) {
    const score=j=>rule==='start'?j.s:rule==='shortest'?j.e-j.s:j.e;
    const order=jobs.slice().sort((a,b)=>score(a)-score(b)||a.id.localeCompare(b.id)),selected=[];
    return order.map(job=>{
      const conflict=selected.find(s=>overlap(job,s)); if(!conflict) selected.push(job);
      return {job,selected:selected.slice(),accepted:!conflict,conflict};
    });
  }
  function optimalSchedule(jobs) {
    let best=[];
    for(let mask=0;mask<2**jobs.length;mask++) {
      const a=jobs.filter((_,i)=>mask&(1<<i));
      if(a.length>best.length && a.every((x,i)=>a.slice(i+1).every(y=>!overlap(x,y))))best=a;
    }
    return best;
  }
  const api={distance,length,exhaustive,nearest,closest,robotCases,filmCases,schedule,optimalSchedule};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  if(typeof document==='undefined')return;
  const roles=n=>`${n} ${n===1?'role':'roles'}`;
  const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(2);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function transport(host,render,total) {
    let step=0,timer=null;
    const play=host.querySelector('[data-play]'),next=host.querySelector('[data-next]'),back=host.querySelector('[data-back]');
    const stop=()=>{clearInterval(timer);timer=null;play.textContent='Play';play.setAttribute('aria-pressed','false');};
    const draw=()=>{render(step);back.disabled=step===0;next.disabled=step>=total();play.disabled=total()===0||step>=total();};
    next.onclick=()=>{stop();step=Math.min(step+1,total());draw();};
    back.onclick=()=>{stop();step=Math.max(0,step-1);draw();};
    host.querySelector('[data-reset]').onclick=()=>{stop();step=0;draw();};
    host.querySelector('[data-end]').onclick=()=>{stop();step=total();draw();};
    play.onclick=()=>{if(timer){stop();return;}play.textContent='Pause';play.setAttribute('aria-pressed','true');timer=setInterval(()=>{step=Math.min(step+1,total());if(step>=total())stop();draw();},1300);};
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    return ()=>{stop();step=0;draw();};
  }
  function routePlot(p,edges,candidate,moveRobot) {
    const isLine=p.every(q=>q.y===0),sorted=p.map((_,i)=>i).sort((a,b)=>p[a].x-p[b].x);
    const maxX=Math.max(...p.map(q=>q.x)),maxY=Math.max(...p.map(q=>q.y));
    const scale=Math.min(270/Math.max(1,maxX),145/Math.max(1,maxY));
    const xy=i=>isLine?[26+sorted.indexOf(i)*51,218]:[180+(p[i].x-maxX/2)*scale,132-(p[i].y-maxY/2)*scale];
    const path=(a,b)=>{const [x,y]=xy(a),[u,v]=xy(b);return isLine?`M ${x} ${y} Q ${(x+u)/2} ${218-Math.max(42,Math.abs(x-u)*.9)} ${u} ${v}`:`M ${x} ${y} L ${u} ${v}`;};
    const drawn=edges.map(e=>`<path d="${path(e.a,e.b)}" class="story-edge"/>`).join('');
    const highlight=candidate?`<path d="${path(candidate.a,candidate.b)}" class="story-current"/>`:'';
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const marker=moveRobot&&candidate?`<circle r="5" fill="#d77b22" stroke="white" stroke-width="2">${reduced?`<set attributeName="cx" to="${xy(candidate.b)[0]}"/><set attributeName="cy" to="${xy(candidate.b)[1]}"/>`:`<animateMotion dur="0.7s" path="${path(candidate.a,candidate.b)}" fill="freeze"/>`}</circle>`:'';
    const dots=p.map((q,i)=>{const [x,y]=xy(i);return `<circle cx="${x}" cy="${y}" r="6" class="story-point"/><text x="${x}" y="${!isLine&&q.y===maxY?y-14:y+24}" text-anchor="middle">${esc(q.label)}</text>`;}).join('');
    return `<svg viewBox="0 0 360 260" role="img" aria-label="${isLine?'Points on a line; spacing is schematic':'Robot tour on the coordinate plane'}"><title>Robot path. The current edge is orange; accumulated edges are blue.</title>${drawn}${highlight}${dots}${marker}</svg>`;
  }
  function robot(host) {
    const select=host.querySelector('[data-case]');let data,frames,optimum;
    function prepare(){data=robotCases[select.value];optimum=exhaustive(data.p,data.start||0).reduce((a,b)=>b.cost<a.cost?b:a);if(data.algorithm==='closest')frames=closest(data.p);else if(data.algorithm==='exact')frames=exhaustive(data.p);else {const route=data.route||nearest(data.p,data.start);frames=route.slice(1).map((_,i)=>({route:route.slice(0,i+2)}));}}
    prepare();
    const reset=transport(host,step=>{
      const frame=frames[step-1];let edges=[],candidate=null,message='Ready. Press Next step to inspect the first decision.',cost=0,best=null;
      if(frame){
        if(data.algorithm==='closest'){edges=frame.edges;candidate=frame.candidate;cost=edges.reduce((s,e)=>s+e.d,0);message=`${data.p[candidate.a].label}–${data.p[candidate.b].label}: ${fmt(candidate.d)} units. ${frame.reason}`;}
        else {edges=frame.route.slice(1).map((b,i)=>({a:frame.route[i],b}));candidate=edges.at(-1);cost=length(data.p,frame.route);message=data.algorithm==='exact'?`Candidate ${step}: ${frame.route.map(i=>data.p[i].label).join(' → ')}. Total ${fmt(cost)}.`:`Move ${data.p[candidate.a].label} → ${data.p[candidate.b].label}: ${fmt(distance(data.p,candidate.a,candidate.b))} units.${step===frames.length?' All points visited; return to the start completes the tour.':''}`;}
        if(data.algorithm==='exact')best=Math.min(...frames.slice(0,step).map(f=>f.cost));
      }
      host.querySelector('[data-description]').textContent=data.explain;
      host.querySelector('[data-plot]').innerHTML=routePlot(data.p,edges,candidate,['nearest','reference'].includes(data.algorithm));
      host.querySelector('[data-plot-note]').textContent=data.p===line?'Point spacing is schematic for legibility. Labels are actual positions; distances use those positions.':'Distances are Euclidean; both axes use the same scale. Crossings without dots are not junctions.';
      host.querySelector('[data-status]').textContent=`Step ${step} of ${frames.length}. ${message}`;
      host.querySelector('[data-metrics]').innerHTML=`<div><span>${data.algorithm==='exact'?'Current candidate':'Distance accepted so far'}</span><strong>${fmt(cost)} units</strong></div><div><span>${best!==null?'Best tested so far':'Optimal tour for comparison'}</span><strong>${fmt(best!==null?best:optimum.cost)} units</strong></div>`;
      host.querySelector('[data-trace]').textContent=frame?.route?`Visit order: ${frame.route.map(i=>data.p[i].label).join(' → ')}`:edges.length?`Accepted edges: ${edges.map(e=>`${data.p[e.a].label}–${data.p[e.b].label}`).join(', ')}`:'No edge chosen yet.';
      host.querySelector('[data-conclusion]').textContent=step===frames.length?data.lesson:'Compare the rule’s decisions with the shortest complete tour. A partial distance is not yet a tour length.';
    },()=>frames.length);
    select.onchange=()=>{prepare();reset();};reset();
  }
  function filmPlot(jobs,frames,step) {
    const height=Math.max(140,60+jobs.length*38),max=Math.max(1,...jobs.map(j=>j.e)),x=t=>44+t/max*286;
    const accepted=frames[step-1]?.selected||[],seen=frames.slice(0,step).map(f=>f.job.id),current=frames[step-1]?.job.id;
    let ticks='';for(let t=0;t<=max;t+=max>8?2:1)ticks+=`<line x1="${x(t)}" x2="${x(t)}" y1="25" y2="${height-20}" class="story-grid"/><text x="${x(t)}" y="17" text-anchor="middle">${t}</text>`;
    return `<svg viewBox="0 0 360 ${height}" role="img" aria-label="Film offers on a time axis; accepted offers blue and rejected offers crossed out"><title>Each row is one film. Touching endpoints do not overlap.</title>${ticks}${jobs.map((j,i)=>{const y=40+i*38,yes=accepted.some(a=>a.id===j.id),no=seen.includes(j.id)&&!yes;return `<text x="16" y="${y+16}">${j.id}</text><rect x="${x(j.s)}" y="${y}" width="${x(j.e)-x(j.s)}" height="25" rx="3" class="story-film ${yes?'accepted':no?'rejected':''} ${current===j.id?'current':''}"/>${no?`<path d="M ${x(j.s)+3} ${y+3} L ${x(j.e)-3} ${y+22}" class="story-cross"/>`:''}`;}).join('')}${!jobs.length?'<text x="180" y="80" text-anchor="middle">No film offers</text>':''}</svg>`;
  }
  function films(host) {
    const select=host.querySelector('[data-case]'),rule=host.querySelector('[data-rule]');let data,frames,best;
    function prepare(){data=filmCases[select.value];frames=schedule(data.jobs,rule.value);best=optimalSchedule(data.jobs);}
    prepare();
    const reset=transport(host,step=>{
      const f=frames[step-1],chosen=f?.selected||[];
      host.querySelector('[data-plot]').innerHTML=filmPlot(data.jobs,frames,step);
      host.querySelector('[data-description]').textContent=data.note;
      host.querySelector('[data-status]').textContent=`Step ${step} of ${frames.length}. `+(f?`${f.accepted?'Accept':'Reject'} ${f.job.id} [${f.job.s}, ${f.job.e}): `+(f.accepted?'it does not overlap an accepted film.':`it overlaps accepted film ${f.conflict.id}.`):(frames.length?'Ready. Offers are sorted by the selected rule.':'No offers to inspect; the empty schedule is complete.'));
      host.querySelector('[data-metrics]').innerHTML=`<div><span>Accepted so far</span><strong>${roles(chosen.length)}</strong></div><div><span>Maximum possible</span><strong>${roles(best.length)}</strong></div>`;
      host.querySelector('[data-trace]').textContent=`Offers: ${data.jobs.map(j=>`${j.id} [${j.s}, ${j.e})`).join('; ')||'none'}. Accepted: ${chosen.map(j=>j.id).join(', ')||'none'}.`;
      host.querySelector('[data-conclusion]').textContent=step===frames.length?`${chosen.length===best.length?'This schedule is optimal for this input.':'This rule misses a better schedule.'} An optimal selection is ${best.map(j=>j.id).join(', ')||'empty'} (${roles(best.length)}). ${rule.value==='finish'?'Earliest finish is guaranteed for this unweighted, one-person interval problem.':'A success on another case would not prove this rule always works.'}`:'Advance through every offer, including those rejected because of a conflict.';
      host.querySelector('[data-comparison]').innerHTML=['start','shortest','finish'].map((r,i)=>{const fs=schedule(data.jobs,r),count=fs.at(-1)?.selected.length||0;return `<li>${['Earliest start','Shortest duration','Earliest finish'][i]}: <strong>${roles(count)}</strong></li>`;}).join('');
    },()=>frames.length);
    select.onchange=rule.onchange=()=>{prepare();reset();};reset();
  }
  document.querySelectorAll('[data-robot-story]').forEach(robot);
  document.querySelectorAll('[data-film-story]').forEach(films);
})();
