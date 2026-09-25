"""Read the supplied DOCX into reference sections; never modify the source document."""
from docx import Document
from pathlib import Path
import json,re,html,sys
source=Path(sys.argv[1]);d=Document(source)
lectures={};current=None;section=None
for item in d.iter_inner_content():
 if hasattr(item,'rows'):
  if section is not None:
   section['html']+='<div class="table-wrap"><table>'+''.join('<tr'+(' class="turkish" lang="tr"' if i%2 else '')+'>'+''.join('<td>'+html.escape(c.text)+'</td>' for c in r.cells)+'</tr>' for i,r in enumerate(item.rows))+'</table></div>'
  continue
 text=item.text.strip()
 if not text:continue
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
Path(__file__).with_name('lectures.json').write_text(json.dumps(lectures,ensure_ascii=False,indent=2))
