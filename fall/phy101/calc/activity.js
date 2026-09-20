/* Public availability only. Fail closed if the server cannot be reached. */
(function(){
const endpoint='https://script.google.com/macros/s/AKfycbyvlnt9Pj9oYobNwzOrk0HaojwQ7-oAZrirgsSTLb1W0ZZ74vFC5sUGhOq3-upvJjX9/exec';
let expires=0,updated=0,offset=0,pending=false;
function show(open){
 document.querySelectorAll('[data-activity-join]').forEach(a=>{a.hidden=!open;a.style.display=open?'':'none';});
 document.querySelectorAll('[data-activity-status]').forEach(p=>{p.textContent=open?'Calculator activity is open for this class. / Hesap makinesi etkinliği bu ders için açık.':'No calculator activity is open. / Açık hesap makinesi etkinliği yok.';});
}
window.phyActivityStatus=data=>{pending=false;updated=Date.now();offset=data.serverTime-Date.now();expires=data.open?data.closesAt:0;show(!!expires&&Date.now()+offset<expires);};
function check(){
 if(pending)return;pending=true;
 const script=document.createElement('script');script.src=endpoint+'?status=1&t='+Date.now();
 const timer=setTimeout(()=>{pending=false;show(false);script.remove();},12000);
 script.onload=()=>{clearTimeout(timer);pending=false;script.remove();};
 script.onerror=()=>{clearTimeout(timer);pending=false;show(false);script.remove();};
 document.head.appendChild(script);
}
show(false);check();setInterval(()=>{if(!document.hidden)check();},30000);
setInterval(()=>{if(Date.now()-updated>45000||Date.now()+offset>=expires)show(false);},1000);
})();
