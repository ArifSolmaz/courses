(function (root) {
  'use strict';
  /* Fresh Week13: bottom-up minimum-cost EXACT-k-edge walks.
   * traceDP(vertices, [u,v,weight] triples, source, target, k).
   * Rows use ascending device IDs; incoming neighbors also use ascending IDs.
   * Every candidate comes from column r-1. A strict improvement is applied in
   * an update event after inspect; equal candidates keep the earlier parent.
   * Repeated devices/edges are allowed. Reconstruction follows (parent,r-1),
   * not a visited-device set. The nonnegative-weight input domain is retained
   * from this course's network examples; exact-length DP itself does not rely
   * on the nonnegative-cost pruning argument used in Week12.
   *
   * Every event owns a full snapshot. Pending cells are distinct from completed
   * null/∞ cells. counts.initCells includes the baseCells subset; it is not an
   * additional physical write count. scans counts all incoming entries, even
   * when their previous-column value is null. Reconstruction has its own
   * pathEdges counter. Validation/sorting/snapshots/display are not DP units.
   */
  const MAX_VERTICES=32,MAX_K=6,MAX_WEIGHT=1000000;
  const safeId=n=>Number.isSafeInteger(n)&&n>=0;
  function graph(vertices,triples){
    if(!Array.isArray(vertices)||vertices.length<1||vertices.length>MAX_VERTICES)throw new RangeError('Use 1–32 distinct nonnegative safe-integer device IDs.');
    const ids=[],known=new Set();
    for(const raw of vertices){if(!safeId(raw)||known.has(raw))throw new TypeError('Device IDs must be unique nonnegative safe integers.');const id=raw===0?0:raw;ids.push(id);known.add(id);}
    ids.sort((a,b)=>a-b);
    if(!Array.isArray(triples))throw new TypeError('Edges must be [u,v,weight] triples.');
    const edges=[],seen=new Set(),adjacency=Object.create(null);ids.forEach(id=>{adjacency[id]=[];});
    for(const edge of triples){
      if(!Array.isArray(edge)||edge.length!==3)throw new TypeError('Each edge must have two endpoints and one weight.');
      const[a,b,rawWeight]=edge;
      if(!safeId(a)||!safeId(b)||!known.has(a)||!known.has(b)||a===b)throw new TypeError('Use existing distinct endpoints in a simple undirected graph.');
      if(!Number.isSafeInteger(rawWeight)||rawWeight<0||rawWeight>MAX_WEIGHT)throw new RangeError('Every edge, including remote edges, must have integer weight 0..1000000.');
      const u=Math.min(a,b)===0?0:Math.min(a,b),v=Math.max(a,b),weight=rawWeight===0?0:rawWeight,id=u+'-'+v;
      if(seen.has(id))throw new TypeError('An undirected edge may occur only once, including its reverse.');
      seen.add(id);edges.push({id,u,v,weight});adjacency[u].push({to:v,weight});adjacency[v].push({to:u,weight});
    }
    ids.forEach(id=>adjacency[id].sort((a,b)=>a.to-b.to));return{ids,known,edges,adjacency};
  }
  function traceDP(vertices,triples,source,target,k){
    const g=graph(vertices,triples);
    if(!safeId(source)||!g.known.has(source)||!safeId(target)||!g.known.has(target))throw new TypeError('Source and target must be device IDs in the graph.');
    if(!Number.isSafeInteger(k)||k<0||k>MAX_K)throw new RangeError('k must be an integer from 0 through 6.');
    source=source===0?0:source;target=target===0?0:target;k=k===0?0:k;
    const rows=g.ids.map(id=>({id,values:Array(k+1).fill(null),parents:Array(k+1).fill(null),statuses:Array(k+1).fill('pending')})),byId=new Map(rows.map(row=>[row.id,row]));
    const state={rows,column:null,current:null,activeCandidate:null,phase:'idle',reversePath:[],cursor:null,done:false};
    const counts={initCells:0,baseCells:0,computedCells:0,scans:0,finiteCandidates:0,improvements:0,pathEdges:0};
    const snapshot=()=>({rows:rows.map(row=>({id:row.id,values:row.values.slice(),parents:row.parents.slice(),statuses:row.statuses.slice()})),column:state.column,current:state.current?{...state.current}:null,activeCandidate:state.activeCandidate?{...state.activeCandidate}:null,phase:state.phase,reversePath:state.reversePath.slice(),cursor:state.cursor?{...state.cursor}:null,done:state.done});
    const initialState=snapshot(),steps=[];
    function emit(type,detail={}){steps.push({step:steps.length+1,type,...detail,state:snapshot(),counts:{...counts}});}
    rows.forEach(row=>{row.statuses[0]='done';});byId.get(source).values[0]=0;state.column=0;state.phase='base';counts.initCells=g.ids.length*(k+1);counts.baseCells=g.ids.length;emit('init');
    for(let r=1;r<=k;r+=1){
      state.column=r;state.phase='fill';
      for(const v of g.ids){
        const destination=byId.get(v);destination.values[r]=null;destination.parents[r]=null;destination.statuses[r]='working';state.current={vertex:v,r};state.activeCandidate=null;emit('start-cell',{v,r});
        for(const{to:u,weight}of g.adjacency[v]){
          const sourceValue=byId.get(u).values[r-1],candidate=sourceValue===null?null:sourceValue+weight,previousValue=destination.values[r];
          if(candidate!==null&&!Number.isSafeInteger(candidate))throw new RangeError('Walk cost exceeded safe-integer arithmetic.');
          const outcome=candidate===null?'unreachable':previousValue===null||candidate<previousValue?'improve':candidate===previousValue?'equal':'worse';
          counts.scans+=1;if(candidate!==null)counts.finiteCandidates+=1;
          state.activeCandidate={from:u,to:v,r,sourceValue,weight,candidate,outcome};emit('inspect',{u,v,r,sourceValue,weight,candidate,outcome});
          if(outcome==='improve'){destination.values[r]=candidate;destination.parents[r]=u;counts.improvements+=1;emit('update',{u,v,r,previousValue,value:candidate});}
        }
        destination.statuses[r]='done';counts.computedCells+=1;state.current=null;state.activeCandidate=null;emit('finish-cell',{v,r,value:destination.values[r],parent:destination.parents[r]});
      }
      state.current=null;state.activeCandidate=null;emit('finish-column',{r});
    }
    const bestCost=byId.get(target).values[k],found=bestCost!==null;
    state.phase='path';state.current=null;state.activeCandidate=null;state.reversePath=found?[target]:[];state.cursor=found?{vertex:target,r:k}:null;emit('path-start',{target,k,found,value:bestCost});
    if(found){
      for(let r=k;r>0;r-=1){const from=state.cursor.vertex,to=byId.get(from).parents[r];if(to===null)throw new Error('A finite non-base cell must have a predecessor.');state.reversePath.push(to);state.cursor={vertex:to,r:r-1};counts.pathEdges+=1;emit('path-step',{from,to,fromColumn:r,toColumn:r-1});}
      if(state.cursor.vertex!==source)throw new Error('Reconstruction must reach the source in column zero.');
    }
    const bestPath=found?state.reversePath.slice().reverse():null;state.phase='complete';state.done=true;emit('complete',{found,bestCost,bestPath:bestPath?bestPath.slice():null});
    return{operation:'exact-k-dp',vertices:g.ids.slice(),edges:g.edges.map(edge=>({...edge})),adjacency:Object.fromEntries(g.ids.map(id=>[id,g.adjacency[id].map(edge=>({...edge}))])),source,target,k,initialState,steps,result:{found,bestCost,bestPath:bestPath?bestPath.slice():null,values:Object.fromEntries(rows.map(row=>[row.id,row.values.slice()])),parents:Object.fromEntries(rows.map(row=>[row.id,row.parents.slice()]))},counts:{...counts}};
  }
  const api=Object.freeze({traceDP});if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.FreshWeek13=api;
})(typeof globalThis!=='undefined'?globalThis:this);
