"""Read the supplied DOCX into reference sections; never modify the source document.

Displayed equations are stored in the DOCX as images. They are emitted from
formulas.json (typed by hand, keyed by the drawing relationship id) so that no
sentence in the notes ends in a colon with its formula missing.
"""
from docx import Document
from pathlib import Path
import json,re,html,sys
source=Path(sys.argv[1]);d=Document(source)
FORMULAS=json.loads(Path(__file__).with_name('formulas.json').read_text(encoding='utf-8'))
lectures={};current=None;section=None;seen=set();missing=set()
def images(paragraph):
 return re.findall(r'r:embed="([^"]+)"',paragraph._p.xml)
for item in d.iter_inner_content():
 if hasattr(item,'rows'):
  if section is not None:
   section['html']+='<div class="table-wrap"><table>'+''.join('<tr'+(' class="turkish" lang="tr"' if i%2 else '')+'>'+''.join('<td>'+html.escape(c.text)+'</td>' for c in r.cells)+'</tr>' for i,r in enumerate(item.rows))+'</table></div>'
  continue
 text=item.text.strip()
 if not text:
  # An image-only paragraph carries a displayed equation. The English and
  # Turkish paragraphs share the same image, so each id is emitted once.
  for rid in images(item):
   if rid in seen or section is None:continue
   seen.add(rid)
   if rid in FORMULAS:
    block='<p class="formula">'+FORMULAS[rid]+'</p>'
    # The source places the image after both language paragraphs; show the
    # formula between them so the English sentence that introduces it reads on.
    tr=section['html'].rfind('<p class="turkish" lang="tr">')
    if tr!=-1 and section['html'].endswith('</p>') and '<p ' not in section['html'][tr+10:]:section['html']=section['html'][:tr]+block+section['html'][tr:]
    else:section['html']+=block
   else:missing.add(rid)
  continue
 if text=='Cheat sheet and glossary' and item.style.name.startswith('Heading 1'):break
 m=re.match(r'Lecture (\d+) — (.*)',text)
 if m and item.style.name.startswith('Heading 1'):
  current={'title':m[2],'sections':[]};lectures[int(m[1])]=current;section=None;continue
 if current is None:continue
 if item.style.name.startswith('Heading 1'):continue
 if item.style.name.startswith('Heading 2') and not item.style.name.endswith('TR'):
  section={'title':text,'html':''};current['sections'].append(section);continue
 if section is not None:
  cls=' class="turkish" lang="tr"' if item.style.name.endswith('TR') else ''
  if item.style.name.startswith('Source Code'):section['html']+='<pre'+cls+'><code>'+html.escape(item.text)+'</code></pre>'
  else:section['html']+='<p'+cls+'>'+html.escape(text)+'</p>'
if missing:raise SystemExit('formulas.json lacks entries for images: '+', '.join(sorted(missing)))
unused=set(k for k in FORMULAS if k.startswith('rId'))-seen
if unused:raise SystemExit('formulas.json has entries for images not in the document: '+', '.join(sorted(unused)))
Path(__file__).with_name('lectures.json').write_text(json.dumps(lectures,ensure_ascii=False,indent=2))
print(f'Extracted {len(lectures)} lectures; {len(seen)} displayed equations restored from formulas.json.')
