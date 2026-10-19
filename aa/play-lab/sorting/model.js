/* Count key comparisons and writes to the array, not clicks or elapsed time. */
(function(root){
'use strict';
function create(input,mode){return {input:[...input],a:[...input],mode,i:mode==='selection'?0:1,j:mode==='selection'?1:0,min:0,key:mode==='insertion'?input[1]:null,phase:'compare',comparisons:0,writes:0,mistakes:0,done:false,passes:0};}
function step(s,choice){
 if(s.done)return {ok:false,text:'This round is complete.'};
 if(s.phase==='compare'){
  const left=s.mode==='selection'?s.a[s.min]:s.a[s.j],right=s.mode==='selection'?s.a[s.j]:s.key;
  // Equal values keep the earlier item first.
  const correct=left<=right?'left':'right';
  if(choice!==correct){s.mistakes++;return {ok:false,text:left===right?`Both are ${left}. Keep the earlier part first. Choose the left part.`:`${Math.min(left,right)} is smaller than ${Math.max(left,right)}. Try again. Nothing has moved.`};}
  s.comparisons++;
  if(s.mode==='selection'){
   if(choice==='right')s.min=s.j;
   s.j++;
   if(s.j===s.a.length)s.phase='place';
   return {ok:true,text:`${Math.min(left,right)} is the smallest seen in this scan. ${s.phase==='place'?'The scan is finished. Put it at the front of the unsorted part.':'Now compare it with the next part.'}`};
  }
  if(choice==='right'){
   s.a[s.j+1]=s.a[s.j];s.writes++;s.j--;
   if(s.j<0)s.phase='place';
   return {ok:true,text:`${left} is larger than the held part ${right}. Slide ${left} one slot right. ${s.j<0?'No part is left to check. Put the held part in slot 1.':'The gap moved left. Check the next neighbour.'}`};
  }
  s.phase='place';return {ok:true,text:`${left} is not larger than ${right}. Stop moving left. Put ${right} just after it.`};
 }
 if(choice!=='place')return {ok:false,text:'Use the place button to finish this pass.'};
 if(s.mode==='selection'){
  if(s.min!==s.i){[s.a[s.i],s.a[s.min]]=[s.a[s.min],s.a[s.i]];s.writes+=2;}
  s.passes++;s.i++;s.min=s.i;s.j=s.i+1;
  s.done=s.i>=s.a.length-1;
 }else{
  s.a[s.j+1]=s.key;s.writes++;s.passes++;s.i++;s.done=s.i>=s.a.length;
  if(!s.done){s.key=s.a[s.i];s.j=s.i-1;}
 }
 s.phase=s.done?'done':'compare';
 return {ok:true,text:s.done?'Every part is in order. The line is ready!':s.mode==='selection'?`${s.i} front slots are finished. Start a new scan of the remaining parts.`:`The first ${s.i} parts are in order. Pick up the next part and find its place.`};
}
if(typeof module!=='undefined'&&module.exports)module.exports={create,step};else root.SortModel={create,step};
})(typeof globalThis!=='undefined'?globalThis:this);
