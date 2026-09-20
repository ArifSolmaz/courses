/* Illustrative Casio-style key guide, not a hardware emulator. No dependencies.
   Plans use the same drawn parameters as the question; never round Ans internally. */
(function () {
  'use strict';
  function plans(ch, p) {
    var g = 9.81, rad = Math.PI / 180, steps = [];
    function add(expression, value, en, tr) { steps.push({ expression: expression, value: value, en: en, tr: tr }); }
    switch (ch.id) {
      case 'W2-C1':
        add('sqrt((' + p.v0 + ')^2+2*' + p.a + '*' + p.dx + ')', Math.sqrt(p.v0*p.v0+2*p.a*p.dx),
          'Bracket the negative velocity before squaring. Take the square root of the entire sum.',
          'Negatif hızı kare almadan önce paranteze al. Toplamın tamamının karekökünü al.'); break;
      case 'W2-C2':
        add('(' + p.v + '^2-' + p.v0 + '^2)/(2*' + p.dx + ')', (p.v*p.v-p.v0*p.v0)/(2*p.dx),
          'Bracket the whole numerator and the whole denominator.', 'Payın ve paydanın tamamını ayrı ayrı paranteze al.'); break;
      case 'W2-C3':
        add(p.kmh + '/3.6', p.kmh/3.6, 'Convert km/h to m/s first.', 'Önce km/sa birimini m/s birimine çevir.');
        add('Ans^2/(2*' + p.a + ')', (p.kmh/3.6)**2/(2*p.a),
          'Ans keeps the converted speed. Square it, then divide by 2a.', 'Ans çevrilmiş hızı tutar. Karesini al, sonra 2a değerine böl.'); break;
      case 'W3-C1':
        add(p.v + '^2*sin(2*' + p.th + ')/9.81', p.v*p.v*Math.sin(2*p.th*rad)/g,
          'Use DEG. Double the angle inside sin, not the sine result.', 'DEG kullan. Sinüs sonucunu değil, sinüs içindeki açıyı ikiyle çarp.'); break;
      case 'W3-C2':
        var vy = p.v*Math.sin(p.th*rad);
        add(p.v + '*sin(' + p.th + ')', vy, 'Use DEG to find the vertical launch velocity.', 'DEG modunda ilk hızın düşey bileşenini bul.');
        add('(Ans+sqrt(Ans^2+2*9.81*' + p.h + '))/9.81', (vy+Math.sqrt(vy*vy+2*g*p.h))/g,
          'Both Ans entries use the unrounded vertical velocity. Divide the entire numerator by g.',
          'İki Ans girişi de yuvarlanmamış düşey hızı kullanır. Payın tamamını g değerine böl.'); break;
      case 'W3-C3':
        add(p.m + 'e3*' + p.a, p.m*1000*p.a,
          'The ×10ˣ (EXP) key already enters a power of ten. Do not type an extra ×10.',
          '×10ˣ (EXP) tuşu zaten onun kuvvetini girer. Fazladan ×10 yazma.'); break;
      case 'W4-C1':
        add('9.81*(sin(' + p.th + ')-' + p.mu + '*cos(' + p.th + '))', g*(Math.sin(p.th*rad)-p.mu*Math.cos(p.th*rad)),
          'In DEG: sin gives the downslope term; friction uses cos. Multiply the whole difference by g.',
          'DEG modunda: eğim boyunca sinüs, sürtünmede kosinüs kullanılır. Farkın tamamını g ile çarp.'); break;
      case 'W4-C2':
        add('atan(' + p.mu + ')', Math.atan(p.mu)/rad,
          'Use DEG. SHIFT then tan selects inverse tangent, not 1 ÷ tan.',
          'DEG kullan. SHIFT ardından tan, ters tanjantı seçer; 1 ÷ tan değildir.'); break;
      case 'W4-C3':
        add('(' + p.m1 + '-' + p.m2 + ')*9.81/(' + p.m1 + '+' + p.m2 + ')', (p.m1-p.m2)*g/(p.m1+p.m2),
          'Bracket the mass difference and the mass sum. The denominator is their sum.',
          'Kütle farkını ve kütle toplamını paranteze al. Payda kütlelerin toplamıdır.'); break;
      case 'W5-C1': case 'W6-C3':
        add(p.F + '*' + p.d + '*cos(' + p.th + ')', p.F*p.d*Math.cos(p.th*rad),
          ch.id === 'W5-C1' ? 'Use DEG and keep the negative result: the force removes energy.' : 'Use DEG. Enter the whole expression; round only the final answer.',
          ch.id === 'W5-C1' ? 'DEG kullan ve negatif sonucu koru: kuvvet enerjiyi azaltır.' : 'DEG kullan. İfadenin tamamını gir; yalnızca son cevabı yuvarla.'); break;
      case 'W5-C2':
        add('0.5*' + p.k + '*' + p.x + '^2', 0.5*p.k*p.x*p.x,
          'Only the compression x is squared. Keep the factor 0.5.', 'Yalnızca sıkışma miktarı x karelenir. 0,5 çarpanını unutma.'); break;
      case 'W5-C3':
        add(p.kJ + 'e3/' + p.t, p.kJ*1000/p.t,
          'Convert kJ to J with ×10ˣ 3, then divide by time to get watts.',
          '×10ˣ 3 ile kJ birimini J birimine çevir, sonra zamana bölerek watt bul.'); break;
      case 'W6-C1':
        add('sqrt(' + p.fx + '^2+' + p.fy + '^2)', Math.hypot(p.fx,p.fy),
          'Square each component, add, then take the square root of the whole sum.',
          'Her bileşenin karesini al, topla, sonra toplamın tamamının karekökünü al.'); break;
      case 'W6-C2':
        var h = p.h-p.mu*p.d;
        add(p.h + '-' + p.mu + '*' + p.d, h,
          'Mass cancels. Subtract the friction term from the initial height.',
          'Kütle sadeleşir. İlk yükseklikten sürtünme terimini çıkar.');
        add('sqrt(2*9.81*Ans)', Math.sqrt(2*g*h),
          'Keep the first result in Ans without rounding. Multiply by 2g and take the square root.',
          'İlk sonucu yuvarlamadan Ans içinde tut. 2g ile çarpıp karekök al.'); break;
      default: return null;
    }
    return { steps: steps, degrees: /sin|cos|atan/.test(steps.map(function(s){return s.expression;}).join('')) };
  }
  function keys(expression) {
    var tokens = expression.match(/sqrt\(|atan\(|sin\(|cos\(|Ans|\^2|e|[0-9.]|[()+*/-]/g) || [];
    if (tokens.join('') !== expression) throw new Error('Unsupported walkthrough expression');
    var result = [];
    tokens.forEach(function(t,i) {
      if (t === 'atan(') {
        result.push({key:'SHIFT', text:''}); result.push({key:'tan', text:'tan⁻¹('}); return;
      }
      var key = {'sqrt(':'√','sin(':'sin','cos(':'cos','^2':'x²','*':'×','/':'÷','e':'×10ˣ'}[t] || t;
      if(t === '-' && (i === 0 || /[(*\/+-]/.test(tokens[i-1].slice(-1)))) key='(−)';
      result.push({key:key, text:{'sqrt(':'√(','^2':'²','*':'×','/':'÷','e':'E','-':'−'}[t] || t});
    });
    return result;
  }
  function frames(ch,p,lang) {
    var plan=plans(ch,p); if(!plan) return [];
    var tr=lang==='tr', out=[], last='0';
    out.push({key:'',expression:'',result:'0',note: plan.degrees
      ? (tr?'Başlamadan önce kendi hesap makinende DEG (derece) modunu seç.':'Before starting, select DEG (degrees) on your own calculator.')
      : (tr?'Normal hesaplama modunu seç. Örnekteki tuşları kendi makinende takip et.':'Select normal calculation mode. Follow these keys on your own calculator.'), stage:0});
    plan.steps.forEach(function(s,i) {
      var expression='';
      if(i===0) out.push({key:'AC',expression:'',result:'0',note:tr?'Önce ekranı temizle.':'Clear the display first.',stage:0});
      keys(s.expression).forEach(function(k) {
        expression+=k.text;
        out.push({key:k.key,expression:expression,result:last,note:s[tr?'tr':'en'],stage:i+1});
      });
      last=Number(s.value.toPrecision(10)).toString();
      out.push({key:'=',expression:expression,result:last,note:s[tr?'tr':'en'],stage:i+1});
    });
    out.push({key:'',expression:out[out.length-1].expression,result:Number(plan.steps[plan.steps.length-1].value).toPrecision(3),
      note:(tr?'Yalnızca şimdi üç anlamlı rakama yuvarla. Cevap: ':'Only now round to three significant figures. Answer: ')
        + Number(plan.steps[plan.steps.length-1].value).toPrecision(3)+' '+ch.unit,stage:plan.steps.length, final:true});
    return out;
  }
  var timer=null, host=null;
  function stop() { if(timer!==null) { clearTimeout(timer); timer=null; } }
  function clear() { stop(); if(host) host.replaceChildren(); host=null; }
  function mount(target,ch,p,lang) {
    clear(); if(!target) return;
    host=target;
    var tr=lang==='tr', list=frames(ch,p,lang); if(!list.length) return;
    var pos=0, playing=false, controls={}, keyNodes={};
    function element(tag,cls,text,parent) {
      var e=document.createElement(tag); e.className=cls||'';
      if(text!=null) e.textContent=text; if(parent) parent.appendChild(e); return e;
    }
    var details=element('details','calc-walk',null,host);
    element('summary','',tr?'Hesap makinesiyle adım adım':'Calculator · step by step',details);
    var body=element('div','calc-walk-body',null,details);
    var machine=element('div','calc-machine',null,body);
    machine.setAttribute('aria-label',tr?'Casio tarzı tuş gösterimi':'Casio-style key demonstration');
    element('div','calc-wordmark',tr?'BİLİMSEL · TUŞ REHBERİ':'SCIENTIFIC · KEY GUIDE',machine);
    var lcd=element('div','calc-lcd',null,machine);
    element('div','calc-mode',plans(ch,p).degrees?'DEG':'COMP',lcd);
    var input=element('div','calc-input','',lcd), output=element('div','calc-output','0',lcd);
    var keyboard=element('div','calc-keyboard',null,machine);
    // Decorative keys: navigation buttons, not the keypad, control the lesson.
    keyboard.setAttribute('aria-hidden','true');
    ['SHIFT','√','x²','sin','cos','tan','(',')','(−)','AC','7','8','9','÷','Ans','4','5','6','×','×10ˣ','1','2','3','−','+','0','.','='].forEach(function(key) {
      keyNodes[key]=element('span','calc-key'+(key==='AC'?' calc-ac':'')+(key==='='?' calc-equals':''),key,keyboard);
    });
    keyNodes['-']=keyNodes['−'];
    var lesson=element('div','calc-lesson',null,body);
    element('p','calc-model-note',tr
      ? 'Casio tarzı eğitim gösterimi; belirli bir modelin emülatörü değildir. Tuş konumları ve DEG menüsü modele göre değişir.'
      : 'Casio-style teaching guide, not an emulator of a specific model. Key positions and the DEG menu vary by model.',lesson);
    var progress=element('p','calc-progress','',lesson);
    var note=element('p','calc-explanation','',lesson); note.setAttribute('aria-live','polite');
    var pressed=element('p','calc-pressed','',lesson);
    var buttons=element('div','calc-controls',null,lesson);
    function button(id,label,fn) { var b=element('button','btn',label,buttons); b.type='button'; b.addEventListener('click',fn); controls[id]=b; }
    function pause() { playing=false; stop(); }
    function paint() {
      var f=list[pos]; input.textContent=f.expression || '0'; output.textContent=f.result;
      input.scrollLeft=input.scrollWidth;
      Object.keys(keyNodes).forEach(function(k){keyNodes[k].classList.toggle('is-pressed',k===f.key);});
      // '-' has two aliases in the lookup; set its state once after the loop.
      keyNodes['-'].classList.toggle('is-pressed',f.key==='-');
      if(note.textContent!==f.note) note.textContent=f.note;
      pressed.textContent=f.key ? (tr?'Tuş: ':'Key: ')+f.key : (f.final?(tr?'Tamamlandı':'Complete'):(tr?'Hazır':'Ready'));
      progress.textContent=(tr?'Adım ':'Step ')+(pos+1)+' / '+list.length;
      controls.back.disabled=pos===0; controls.next.disabled=pos===list.length-1;
      controls.play.textContent=playing?(tr?'Duraklat':'Pause'):(pos===list.length-1?(tr?'Yeniden oynat':'Replay'):(tr?'Oynat':'Play'));
    }
    function advance() {
      if(!playing) return;
      if(!details.open || !host || !host.isConnected || host.closest('[hidden]') || document.hidden) { pause(); paint(); return; }
      if(pos<list.length-1) pos++;
      if(pos===list.length-1) playing=false;
      paint(); if(playing) timer=setTimeout(advance,list[pos].key==='='?1600:650);
    }
    button('back',tr?'← Önceki':'← Back',function(){pause();pos=Math.max(0,pos-1);paint();});
    button('play',tr?'Oynat':'Play',function(){
      if(playing) pause(); else { if(pos===list.length-1) pos=0; playing=true; timer=setTimeout(advance,650); } paint();
    });
    button('next',tr?'Sonraki →':'Next →',function(){pause();pos=Math.min(list.length-1,pos+1);paint();});
    button('reset',tr?'Başa dön':'Restart',function(){pause();pos=0;paint();});
    details.addEventListener('toggle',function(){if(!details.open){pause();paint();}});
    // The console's single-letter shortcuts must not fire while using this guide.
    details.addEventListener('keydown',function(e){e.stopPropagation();});
    paint();
  }
  window.CALC_WALKTHROUGH={plans:plans,frames:frames,mount:mount,clear:clear};
})();
