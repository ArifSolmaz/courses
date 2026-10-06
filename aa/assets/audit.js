/* Protect math tokens and keep dynamically rebuilt result tables readable. */
(function () {
  'use strict';
  var math = /(?:[OΩΘ]\([^()\n]{1,48}\)|(?:log|lg)(?:[₂₃₁₀]|_[0-9]+)?\s*[nmV]|\bn\s+(?:log|lg)\s+n|\bn\([^()\n]{1,24}\)(?:\/\d+)?|[nmVc2-9][⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵏ]+|\bn!|[⌊⌈][^⌊⌋⌈⌉\n]{1,40}[⌋⌉])/gu;
  function protect(root) {
    if (!root || !root.querySelectorAll) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return node.parentElement.closest('script,style,pre,code,svg,select,textarea,.aa-token,[contenteditable]')
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], node;
    while ((node = walker.nextNode())) { math.lastIndex = 0; if (math.test(node.data)) nodes.push(node); }
    nodes.forEach(function (node) {
      var text = node.data, fragment = document.createDocumentFragment(), at = 0, match;
      math.lastIndex = 0;
      while ((match = math.exec(text))) {
        fragment.appendChild(document.createTextNode(text.slice(at, match.index)));
        var span = document.createElement('span'); span.className = 'aa-token'; span.textContent = match[0];
        fragment.appendChild(span); at = math.lastIndex;
      }
      fragment.appendChild(document.createTextNode(text.slice(at))); node.replaceWith(fragment);
    });
    var codes=root.matches?.('code')?[root]:[]; codes.push(...root.querySelectorAll('code'));
    codes.forEach(function (code) {
      // A formula is indivisible; a full inline program may wrap at spaces.
      var text=code.textContent.trim();
      code.classList.toggle('aa-token', !code.closest('pre') && text.length <= 24 && !/[;{}\n]/.test(text) && !/\b(?:for|while|return|if)\b/.test(text));
    });
    root.querySelectorAll('.en').forEach(function (term) {
      if (/^[OΩΘ]\(/.test(term.textContent.trim()) && term.textContent.trim().length <= 55) term.classList.add('aa-token');
    });
  }
  function fitTokens(root) {
    root.querySelectorAll?.('.aa-token').forEach(function (token) {
      token.classList.remove('aa-long-token');
      if (token.closest('table,.formula,.big,pre')) return;
      var parent=token.parentElement;
      while(parent && getComputedStyle(parent).display==='inline') parent=parent.parentElement;
      if (!parent) return;
      var style=getComputedStyle(parent), available=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
      if (available>0 && token.getBoundingClientRect().width>available) token.classList.add('aa-long-token');
    });
  }
  function table(t) {
    if (!t.closest('.scroll,.table-wrap')) {
      var wrap = document.createElement('div'); wrap.className = 'table-wrap'; t.before(wrap); wrap.append(t);
    }
    var rows = Array.from(t.rows), cols = Math.max(0, ...rows.map(r => Array.from(r.cells).reduce((n,c) => n+c.colSpan,0)));
    ['aa-cols-2','aa-cols-3','aa-cols-4','aa-cols-5','aa-cols-6','aa-cols-7plus','aa-code-first'].forEach(c => t.classList.remove(c));
    if (cols >= 2) t.classList.add(cols >= 7 ? 'aa-cols-7plus' : 'aa-cols-'+cols);
    // A matrix is a figure; it does not need a prose table's 760px minimum.
    if (t.classList.contains('mx')) ['aa-cols-4','aa-cols-5','aa-cols-6','aa-cols-7plus'].forEach(c => t.classList.remove(c));
    rows.forEach(function (r) {
      var first = r.cells[0];
      r.classList.toggle('aa-total-row', !!first && /^(toplam|total)(?:\s|$)/i.test(first.textContent.trim()));
      Array.from(r.cells).forEach(function (c) {
        c.classList.remove('aa-numcol');
        if (c.classList.contains('aa-token') && c.textContent.trim().length > 45) c.classList.remove('aa-token');
      });
    });
    for (var i=0; i<cols; i++) {
      var cells=rows.filter(r => Array.from(r.cells).every(c => c.colSpan===1)).map(r => r.cells[i]).filter(Boolean);
      var values=cells.filter(c => c.tagName==='TD' && c.textContent.trim());
      if (values.length && values.filter(c => c.classList.contains('r') || /^(?:[−+\-]?\d[\d\s.,%]*|[OΩΘ]\([^\n]+\)|[nm](?:[²³ⁿᵏ!]|\s*[+−/×]\s*\d+)*)$/.test(c.textContent.trim())).length/values.length >= .6)
        cells.forEach(c => c.classList.add('aa-numcol'));
    }
    var heading=rows[0]?.cells[0]?.textContent || '';
    if (cols===4 && /kod|satır|code|line/i.test(heading)) t.classList.add('aa-code-first');
  }
  function run(root) {
    protect(root);
    root.querySelectorAll?.('figure > svg').forEach(function (svg) {
      var wrap=document.createElement('div'); wrap.className='figure-scroll'; svg.before(wrap); wrap.append(svg);
    });
    var charts=root.matches?.('canvas.lc')?[root]:[];
    charts.push(...(root.querySelectorAll?.('canvas.lc')||[]));
    charts.forEach(function (canvas) {
      if (canvas.closest('.chart-scroll')) return;
      var wrap=document.createElement('div'); wrap.className='chart-scroll'; canvas.before(wrap); wrap.append(canvas);
    });
    var maps=root.matches?.('.aa-map')?[root]:[]; maps.push(...(root.querySelectorAll?.('.aa-map')||[]));
    maps.forEach(function (map) {
      if(map.closest('.map-scroll'))return;
      var wrap=document.createElement('div'); wrap.className='map-scroll'; map.before(wrap); wrap.append(map);
    });
    if (root.matches?.('table')) table(root);
    root.querySelectorAll?.('table').forEach(table);
    var selector='input:not([type="hidden"]),select,textarea',fields=root.matches?.(selector)?[root]:[];
    fields.push(...(root.querySelectorAll?.(selector)||[]));
    fields.forEach(function (field) {
      if (field.labels?.length || field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) return;
      var box=field.closest('.try,.box,.rule,details,section');
      var heading=box?.querySelector('.lab,h3,h4,b.t,summary');
      var context=heading?.textContent.trim() || '';
      var previous=field.previousElementSibling;
      while(previous && !previous.matches('span,label,b,strong')) previous=previous.previousElementSibling;
      var label=previous?.textContent.trim() || field.getAttribute('placeholder') || '';
      if (!/[\p{L}\p{N}]/u.test(label)) label='';
      if(!label && field.tagName==='SELECT') label=field.options[0]?.textContent.trim() || 'Seçenek';
      if(!label) label=field.type==='range'?'Değer':field.type==='number'?'Sayı':'Girdi';
      field.setAttribute('aria-label', (context ? context+' — ' : '')+label);
    });
    fitTokens(root);
  }
  run(document.body);
  window.addEventListener('resize',function(){fitTokens(document.body)});
  var pending=new Set(), scheduled=false;
  var observer=new MutationObserver(function (records) {
    records.forEach(function (r) {
      var target=r.target.nodeType===3?r.target.parentElement:r.target;
      if (target.closest?.('.aa-token,#aa-sb,#aa-bar,#aa-fab')) return;
      var t=target.closest?.('table'); if(t) pending.add(t);
      if(r.type==='characterData') pending.add(target);
      r.addedNodes.forEach(function(n){if(n.nodeType===1&&!n.matches('.aa-token'))pending.add(n);else if(n.nodeType===3)pending.add(target)});
    });
    if(!scheduled && pending.size){scheduled=true;requestAnimationFrame(function(){scheduled=false;observer.disconnect();pending.forEach(run);pending.clear();observer.observe(document.body,{childList:true,subtree:true,characterData:true})})}
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
})();
