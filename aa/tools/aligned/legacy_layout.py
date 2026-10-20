"""Preserve the reviewed layout audit on the generated lessons and supplemental notes.

This small presentation layer belongs in the generator, rather than only in
published HTML. Course examples and readings stay in their canonical modules.
The constants deliberately retain the reviewed inline bytes; apply is safe
for repeated calls and does not touch lesson content.
"""

RESPONSIVE_STYLE = r'''<style id="aa-legacy-responsive-audit">
html,body{max-width:100%}.wrap,.aligned,.compact-week{min-width:0}
.table-wrap,.aa-auto-table-wrap{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable}
.table-wrap table,.aa-auto-table-wrap table{width:100%;table-layout:auto;font-variant-numeric:tabular-nums}
.aa-cols-4{min-width:620px!important}.aa-cols-5{min-width:700px!important}.aa-cols-6{min-width:760px!important}.aa-cols-7plus{min-width:860px!important}
.aa-token{white-space:nowrap!important;overflow-wrap:normal!important;word-break:keep-all!important}
.aa-numcol{text-align:right!important;font-variant-numeric:tabular-nums}.aa-total-row>td,.aa-total-row>th{font-weight:700;border-top:2px solid var(--border,var(--line,#999))}
pre{max-width:100%;overflow-x:auto}code{overflow-wrap:anywhere}img,svg,canvas,figure,.widget,.animation-panel,.anim-workspace,.anim-stage{max-width:100%;min-width:0}img,svg,canvas{height:auto}
input,select,textarea,button,details{max-width:100%;min-width:0}.week-tabs,.week-links,.week-nav,.anim-toolbar,.anim-pick,.anim-tools{max-width:100%;min-width:0}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid var(--accent,#39725e);outline-offset:2px}
@media(max-width:720px){.table-wrap th,.table-wrap td,.aa-auto-table-wrap th,.aa-auto-table-wrap td{padding:.5rem .55rem}.week-nav{flex-wrap:wrap}.week-heading h1{overflow-wrap:anywhere}}
</style>'''

TABLE_SCRIPT = r'''<script id="aa-legacy-table-audit">(function(){function tok(s){return s&&s.length<=34&&/^[\d\s.,:;()+\-×÷=<>≤≥≈ΘΩOonmVkEαφπ√²³⁴⁵ⁿ!⌊⌋⌈⌉→←↔∑Σ\/·%^_*]+$/u.test(s)}function run(){document.querySelectorAll('table').forEach(function(t){if(!t.closest('.table-wrap')&&!t.closest('.scroll')&&!t.closest('.aa-auto-table-wrap')){var w=document.createElement('div');w.className='aa-auto-table-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t)}var rs=[].slice.call(t.rows),cols=0;rs.forEach(function(r){var n=0;[].slice.call(r.cells).forEach(function(c){n+=c.colSpan||1});cols=Math.max(cols,n)});if(cols===4)t.classList.add('aa-cols-4');else if(cols===5)t.classList.add('aa-cols-5');else if(cols===6)t.classList.add('aa-cols-6');else if(cols>=7)t.classList.add('aa-cols-7plus');[].slice.call(t.querySelectorAll('td,th')).forEach(function(c){var s=(c.textContent||'').replace(/\s+/g,' ').trim();if(tok(s))c.classList.add('aa-token')});rs.forEach(function(r){var c=r.cells&&r.cells[0],s=c?(c.textContent||'').trim().toLocaleLowerCase('tr'):'';if(s==='toplam'||s==='total'||s.startsWith('toplam '))r.classList.add('aa-total-row')})})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();window.addEventListener('load',run)})();</script>'''



# Weeks 9–14 retain the same reviewed CSS with only six line breaks removed.
COMPACT_RESPONSIVE_STYLE = (RESPONSIVE_STYLE
    .replace('\n.table-wrap', '.table-wrap', 2)
    .replace('\n.aa-token', '.aa-token')
    .replace('\n.aa-numcol', '.aa-numcol')
    .replace('\ninput', 'input')
    .replace('\n@media', '@media'))

SUPPLEMENTAL_THREE_STYLE = r'''<style id="w3-ek-responsive-fixes">
html,body{max-width:100%}
.aligned{min-width:0}
.aligned .table-wrap{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable}
.aligned .table-wrap table{width:100%;min-width:620px;table-layout:auto;font-variant-numeric:tabular-nums}
.aligned .table-wrap table.aa-cols-7plus{min-width:860px}
.aligned .table-wrap th,.aligned .table-wrap td{line-height:1.45;overflow-wrap:break-word;word-break:normal}
.aligned .table-wrap th{font-weight:600}
.aligned .table-wrap tr.aa-subhead th{font-size:.82em;color:var(--muted)}
.aligned .table-wrap .aa-token{white-space:nowrap;overflow-wrap:normal;word-break:keep-all}
.aligned pre,.aligned code{max-width:100%}
.aligned pre{overflow-x:auto}
.aligned figure,.aligned svg,.aligned canvas,.aligned img,.anim-workspace,.anim-stage,.widget{max-width:100%;min-width:0}
.aligned svg,.aligned canvas,.aligned img{height:auto}
.week-tabs,.week-links,.anim-toolbar,.anim-pick,.anim-tools{max-width:100%;min-width:0}
@media(max-width:720px){
  .aligned .table-wrap{margin-left:0;margin-right:0}
  .aligned .table-wrap th,.aligned .table-wrap td{padding:.5rem .55rem}
  .week-heading h1{overflow-wrap:anywhere}
}
</style>'''

SUPPLEMENTAL_THREE_SCRIPT = r'''<script id="w3-ek-table-audit">
(function(){
  function fix(){
    document.querySelectorAll('.table-wrap table').forEach(function(t){
      var rows=Array.prototype.slice.call(t.rows),cols=0;
      rows.forEach(function(r){var n=0;Array.prototype.forEach.call(r.cells,function(c){n+=c.colSpan||1});cols=Math.max(cols,n)});
      t.classList.toggle('aa-cols-7plus',cols>=7);
      Array.prototype.forEach.call(t.querySelectorAll('td,th'),function(c){
        var s=(c.textContent||'').replace(/\s+/g,' ').trim();
        if(s&&s.length<=26&&/^[\d\s.,()+\-×÷=<>≤≥≈ΘΩOnflg√²³ⁿ!]+$/i.test(s))c.classList.add('aa-token');
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  window.addEventListener('load',fix);
})();
</script>'''


def apply(page, week, *, supplemental=False):
    """Add reviewed audits, with an explicit supplemental-notes target."""
    if supplemental:
        if week not in range(3, 15):
            return page
        if week == 3:
            blocks = (
                ('id="w3-ek-responsive-fixes"', '\n' + SUPPLEMENTAL_THREE_STYLE + '\n', '</head>'),
                ('id="w3-ek-table-audit"', '\n' + SUPPLEMENTAL_THREE_SCRIPT, '</body>'),
            )
        else:
            style = RESPONSIVE_STYLE if week < 9 else COMPACT_RESPONSIVE_STYLE
            blocks = (
                ('id="aa-legacy-responsive-audit"', style, '</head>'),
                ('id="aa-legacy-table-audit"', TABLE_SCRIPT, '</body>'),
            )
    elif week in (1, 2):
        blocks = (
            ('id="aa-legacy-responsive-audit"', RESPONSIVE_STYLE, '</head>'),
            ('id="aa-legacy-table-audit"', TABLE_SCRIPT, '</body>'),
        )
    else:
        return page
    for marker, block, boundary in blocks:
        if marker in page:
            continue
        if boundary not in page:
            raise ValueError(f'Week {week}: missing {boundary} layout boundary')
        page = page.replace(boundary, block + boundary, 1)
    return page
