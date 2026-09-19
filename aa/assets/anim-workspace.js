/* Rehouse existing animation nodes; preserve their content, state and listeners. */
(function () {
  'use strict';
  function element(tag, cls, text) {var e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;}
  function mount(host) {
    if(host.dataset.workspaceReady || host.dataset.animReady!=='1')return;
    host.dataset.workspaceReady='1';host.classList.add('aa-workspace');
    var original=Array.from(host.children),header=element('header','aa-toolbar'),settings=element('div','aa-settings'),stage=element('div','aa-stage'),footer=element('div','aa-transport');
    var title=host.querySelector('.anim-title')||element('p','anim-title',host.dataset.anim);
    var expand=element('button','aa-expand','Expand');expand.type='button';expand.setAttribute('aria-label','Expand animation');header.append(title,expand);
    original.forEach(function(child){
      if(child===title)return;
      if(child.classList.contains('anim-opts'))settings.append(child);
      else if(child.matches('.anim-controls,.anim-stats,.anim-msg'))footer.append(child);
      else {var pane=element('div','aa-pane');pane.tabIndex=0;pane.setAttribute('role','region');pane.setAttribute('aria-label','Animation content '+(stage.children.length+1));pane.append(child);stage.append(pane);}
    });
    // Keep the main diagram or code trace at full height; supporting content
    // shares a second scrollable column rather than shrinking the diagram.
    var panes=Array.from(stage.children);
    if(panes.length>1){
      var main=panes.find(function(p){return p.querySelector('.ct');}) || panes.find(function(p){return p.querySelector('canvas,svg');}) || panes.find(function(p){return p.firstElementChild.tagName==='DIV' && !p.firstElementChild.classList.contains('lab');}) || panes[0];
      var side=element('div','aa-pane aa-support');side.tabIndex=0;side.setAttribute('role','region');side.setAttribute('aria-label','Supporting diagrams and explanation');
      panes.forEach(function(p){if(p!==main){while(p.firstChild)side.append(p.firstChild);p.remove();}});
      main.classList.add('aa-primary');stage.prepend(main);stage.append(side);
    }
    host.append(header,settings,stage,footer);
    function fitVisiblePanes(){
      Array.from(stage.children).forEach(function(p){
        var empty=Array.from(p.children).every(function(c){return getComputedStyle(c).display==='none';});
        p.classList.toggle('aa-empty',empty);
      });
    }
    fitVisiblePanes();
    host.addEventListener('click',function(){requestAnimationFrame(fitVisiblePanes);});
    host.addEventListener('change',function(){requestAnimationFrame(fitVisiblePanes);});
    if(!settings.children.length)settings.hidden=true;
    if(!footer.children.length)footer.hidden=true;
    if(stage.querySelector('.ct'))stage.classList.add('aa-trace-stage');
    var dialog=element('dialog','aa-dialog'),marker=document.createComment('animation position');dialog.setAttribute('aria-label',title.textContent);document.body.append(dialog);
    expand.addEventListener('click',function(){
      if(dialog.open){dialog.close();return;}
      host.before(marker);dialog.append(host);dialog.showModal();expand.textContent='Close';expand.setAttribute('aria-label','Close animation');
    });
    dialog.addEventListener('close',function(){host.dispatchEvent(new Event('aa:pause'));marker.replaceWith(host);expand.textContent='Expand';expand.setAttribute('aria-label','Expand animation');expand.focus({preventScroll:true});});
    function alignPlayback(event){
      if(dialog.open || !event.target.closest('.anim-controls'))return;
      requestAnimationFrame(function(){
        var r=host.getBoundingClientRect();
        if(r.top<65||r.bottom>innerHeight-8)host.scrollIntoView({block:'start',behavior:'instant'});
      });
    }
    ['click','input','focusin','keydown'].forEach(function(name){host.addEventListener(name,alignPlayback);});
    var disclosure=host.closest('details.anim-wrap');
    if(disclosure)disclosure.addEventListener('toggle',function(){if(!disclosure.open)host.dispatchEvent(new Event('aa:pause'));else requestAnimationFrame(function(){host.scrollIntoView({block:'start',behavior:'instant'});});});
  }
  function boot(){document.querySelectorAll('[data-anim]').forEach(mount);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
