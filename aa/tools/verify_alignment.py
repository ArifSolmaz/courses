from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,sys,io,contextlib
from aligned.build import WEEKS,TESTS,WRITTEN,LECTURES
from aligned.visuals import CODES
root=Path(__file__).resolve().parents[1]
assert all(len(x['sections'])>=4 for x in LECTURES.values())
assert all(any('class="turkish"' in s['html'] for s in x['sections']) for x in LECTURES.values())
assert sorted(l for w in WEEKS for l in w[1])==list(range(1,23))
assert set(range(1,121)) <= {x for ids in TESTS.values() for x in ids}
assert sorted(x for ids in WRITTEN.values() for x in ids)==list(range(1,206))
expected={1:'[(0, 3), (3, 5)]',2:'40 5200',3:'10',4:'[8, 2, 5, 7]',5:'[10, 15, 20, 3, None]',6:'[1, 2, 3, 4]',7:'[1, 2, 3, 4, 7, 8]',8:'[12, 13, 21, 23]',9:'5: 3',10:'1\n2\n4\n3\n5',11:'3',12:'[0, 1, 1, 2, 3, 5, 8]',13:'1',14:'True'}
for n,code in CODES.items():
 stream=io.StringIO()
 with contextlib.redirect_stdout(stream):exec(code,{})
 assert expected[n] in stream.getvalue(),(n,stream.getvalue())
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[]
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  for key in ('href','src'):
   if key in d:self.links.append(d[key])
for n in range(1,15):
 p=root/f'w{n}/index.html';s=p.read_text();parsed=Links();parsed.feed(s)
 assert len(parsed.ids)==len(set(parsed.ids)),(n,'duplicate IDs')
 assert len(TESTS[n])>=10
 nums=[int(x) for x in re.findall(r'Question (\d+) ·',s)]
 assert nums==list(range(1,len(nums)+1)),(n,'question numbering')
 assert WEEKS[n-1][0] in s
 for url in parsed.links:
  u=urlsplit(url)
  if u.scheme or u.netloc:continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(p,url)
  if u.fragment and target.suffix=='.html':
   assert re.search(r'id=[\"\']'+re.escape(u.fragment)+r'[\"\']',target.read_text()),(p,url,'missing anchor')
 print(f'Week {n:02}: {len(TESTS[n])} tests + {len(WRITTEN[n])} written; links, numbering and code passed')
print('22 lectures, all 120 original tests and all 205 written exercises accounted for.')
