from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,sys,io,contextlib
from aligned.build import WEEKS,TESTS,WRITTEN,LECTURES,placements,configure,week_code,textbook_articles,TEXTBOOK_GROUPS
root=Path(__file__).resolve().parents[1]
configure()
tests,written=placements()

# --- the 14-week map ---
TITLES={1:'Algorithms and correctness',2:'Counting work and growth',3:'Program analysis and logarithms',4:'Arrays, linked lists, stacks and queues',5:'Search trees and hashing',6:'Priority queues and heaps',7:'Sorting II: mergesort, quicksort, lower bounds, linear sorting — and solving recurrences',8:'Graphs I: representations, BFS and its applications',9:'Graphs II: DFS, edge types, topological order, strongly connected components',10:'Minimum spanning trees and union-find',11:'Shortest paths: Dijkstra, Bellman–Ford, Floyd',12:'Backtracking and the start of dynamic programming',13:'Dynamic programming: edit distance, partition, TSP',14:'Reductions and NP-completeness'}
LECT={1:[1],2:[2],3:[3],4:[4],5:[5,6],6:[7],7:[8,9],8:[10,11],9:[12],10:[13],11:[14],12:[15,16],13:[17,18],14:[19,20,21,22]}
assert len(WEEKS)==14
for n,w in enumerate(WEEKS,1):
 assert w['title']==TITLES[n],(n,w['title'])
 assert w['lectures']==LECT[n],(n,w['lectures'])
 assert 3<=len(w['objectives'])<=5 and len(w['scope'])>=3,(n,'objectives/scope')
 assert w['examples'] and all({'question','example','steps','edge'}<=set(x) for x in w['examples']),(n,'examples')
assert all(len(x['sections'])>=4 for x in LECTURES.values())
assert all(any('class="turkish"' in s['html'] for s in x['sections']) for x in LECTURES.values())
assert sorted(l for w in WEEKS for l in w['lectures'])==list(range(1,23))
assert len(WEEKS[6]['examples'])>=2 and len(WEEKS[9]['examples'])>=2 and len(WEEKS[10]['examples'])>=2
assert any(x.get('label','').startswith('Core: Bellman') for x in WEEKS[10]['examples'])

# --- question placement ---
assert set(range(1,121)) <= {x for ids in TESTS.values() for x in ids}
assert sorted(x for ids in WRITTEN.values() for x in ids)==list(range(1,206))
assert all(len(set(v))==len(v) for v in tests.values()),'duplicate test within a week'
placed=[x for ids in written.values() for x in ids]
assert len(placed)==len(set(placed)),'a written exercise has two homes'
assert set(range(1,206))<=set(placed)
assert all(len(v)>=10 for v in tests.values())
import question_bank as Q,skiena_material as S
for n,ids in tests.items():
 for i in ids:assert i in Q.MCQ,(n,i)
for n,ids in written.items():
 for i in ids:assert i in S.EXERCISES,(n,i)

# --- Python demonstrations ---
expected={1:'[(0, 3), (3, 5)]',2:'40 5200',3:'10',4:'[8, 2, 5, 7]',5:'[10, 15, 20, 3, None]',6:'[1, 2, 3, 4]',7:'[1, 2, 3, 4, 7, 8]',8:'5: 3',9:"['A', 'C', 'F', 'B', 'D', 'E']",10:'1 [1, 1, 1, 1, 5, 5]',11:'3',12:'[0, 1, 1, 2, 3, 5, 8]',13:'1',14:'True'}
for n in range(1,15):
 stream=io.StringIO()
 with contextlib.redirect_stdout(stream):exec(week_code(n),{})
 assert expected[n] in stream.getvalue(),(n,stream.getvalue())
stream=io.StringIO()
with contextlib.redirect_stdout(stream):exec(week_code(7),{})
assert '[12, 13, 21, 23]' in stream.getvalue(),'week 7 radix demonstration'

class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[]
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  for key in ('href','src'):
   if key in d:self.links.append(d[key])
def check_links(p,s):
 parsed=Links();parsed.feed(s)
 assert len(parsed.ids)==len(set(parsed.ids)),(p,'duplicate IDs',[i for i in parsed.ids if parsed.ids.count(i)>1][:5])
 for url in parsed.links:
  u=urlsplit(url)
  if u.scheme or u.netloc:continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(p,url)
  if u.fragment and target.suffix=='.html':
   assert re.search(r'id=[\"\']'+re.escape(u.fragment)+r'[\"\']',target.read_text()),(p,url,'missing anchor')
 return parsed

# A colon-ended English paragraph followed by its Turkish twin must be followed by the content it introduces.
def dangling_colons(s):
 out=[]
 for m in re.finditer(r'<p(?: class="(?!turkish)[^"]*")?>([^<]*?):</p>\s*<p class="turkish">[^<]*</p>\s*(?=(</|$))',s):out.append(m[1][-60:])
 return out

for n in range(1,15):
 p=root/f'w{n}/index.html';s=p.read_text();parsed=check_links(p,s)
 assert len(tests[n])>=10
 nums=[int(x) for x in re.findall(r'Question (\d+) ·',s)]
 assert nums==list(range(1,len(nums)+1)),(n,'question numbering')
 assert WEEKS[n-1]['title'] in s
 assert 'By the end of this week you can' in s and all(E in s for E in ['href="../scope/#scope-w%d"'%n,'href="../review/#review-w%d"'%n]),(n,'objectives/scope/review links')
 assert s.count('class="worked-example"')==len(WEEKS[n-1]['examples']),(n,'worked examples rendered')
 for i in range(1,len(WEEKS[n-1]['examples'])+1):assert f'id="example-{n}-{i}"' in s
 assert 'Additional textbook problems with solutions' not in s,(n,'textbook problems must live on their own page')
 if n in (2,3,14):assert 'href="../textbook-problems/#' in s,(n,'textbook link')
 for m in re.finditer(r'href="\.\./w(\d+)/#skiena-ex-(\d+)"',s):
  assert int(m[2]) in written[int(m[1])],(n,'source exercise link points to the wrong week',m[0])
 d=dangling_colons(s);assert not d,(n,'paragraph ends with a colon and nothing follows',d)
 print(f'Week {n:02}: {len(tests[n])} tests + {len(written[n])} written; links, numbering, colons and code passed')
print('22 lectures, all 120 original tests and all 205 written exercises accounted for.')

# --- scope, review and textbook pages ---
for folder,needles in (('scope',['What the exams cover','id="midterm"','id="final"','Sample midterm questions','Sample final questions','50%']+[f'id="scope-w{n}"' for n in range(1,15)]),('review',['id="review-w%d"'%n for n in range(1,15)]+['href="../scope/"']),('textbook-problems',[f'id="{g[0]}"' for g in TEXTBOOK_GROUPS])):
 p=root/folder/'index.html';assert p.exists(),folder;s=p.read_text();check_links(p,s)
 for x in needles:assert x in s,(folder,x)
 assert not dangling_colons(s),(folder,'dangling colon')
s=(root/'scope/index.html').read_text();assert s.count('class="sample-question"')==4 and 'ungraded' in s
s=(root/'textbook-problems/index.html').read_text();assert len(re.findall(r'id="p2-\d+"',s))==51 and sum(map(len,textbook_articles().values()))==53
home=(root/'index.html').read_text();check_links(root/'index.html',home)
for x in ('href="scope/"','href="review/"','href="textbook-problems/"'):assert x in home,x
print('Scope, review and textbook-problems pages exist and are linked from the dashboard and every week.')

# The student route is only dashboard plus weekly pages; old libraries redirect.
for n in range(1,15):
 s=(root/f'w{n}/index.html').read_text()
 assert all(f'id="{x}"' in s for x in ('lesson','practice','notes'))
 assert not re.search(r'href="\.\./(?:python|guide|skiena|extensions)/',s)
old=set(re.findall(r'data-anim="([^"]+)"',''.join(p.read_text() for p in (root/'tools/weeks').glob('w*.html'))))
new=set(re.findall(r'data-anim="([^"]+)"',''.join((root/f'w{n}/index.html').read_text() for n in range(1,15))))
assert old<=new,(old-new)
for folder in ('python','guide'):
 for p in (root/folder).rglob('index.html'):assert 'http-equiv="refresh"' in p.read_text(),p
print(f'One weekly route verified; all {len(old)} prior general animations retained inline.')
