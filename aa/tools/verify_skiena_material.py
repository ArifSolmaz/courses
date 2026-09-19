#!/usr/bin/env python3
"""Check imported coverage, rendered answers, regeneration and selected math fixtures."""
import html
import itertools
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from skiena_material import EXERCISES,WEEK_EXERCISES,EXTENSIONS,WEEK_NOTES
import build

ROOT=Path(__file__).resolve().parent.parent
assert set(EXERCISES)==set(range(1,206))
assert set(WEEK_NOTES)==set(range(1,15))
all_ids=[i for ids in WEEK_EXERCISES.values() for i in ids]+[i for *_,ids,focus,body in EXTENSIONS for i in ids]
assert sorted(all_ids)==list(range(1,206))
class Scan(HTMLParser):
 def __init__(self,text):
  super().__init__();self.ids=[];self.links=[];self.stack=[];self.answers=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  for key in ('src','href'):
   if key in d:self.links.append(d[key])

pages=[]
for meta in build.WEEKS:
 n=meta[0];p=ROOT/f'w{n}'/'index.html';text=p.read_text();pages.append(p)
 assert text==build.week_page(meta,(build.FRAG/f'w{n:02d}.html').read_text()),f'w{n}: stale build'
 assert text.count('id="skiena-practice"')==1
 assert 'Show reasoning</summary>' in text
 for number in WEEK_EXERCISES[n]:
  assert f'id="skiena-ex-{number:03d}"' in text
  assert html.escape(EXERCISES[number]['answer']) in text
p=ROOT/'extensions/index.html';pages.append(p)
for number in range(98,206):assert f'id="skiena-ex-{number:03d}"' in p.read_text()
for p in pages:
 s=Scan(p.read_text());assert len(s.ids)==len(set(s.ids)),f'{p}: duplicate ids'
 for link in s.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  dest=(p.parent/unquote(u.path)).resolve() if u.path else p
  if dest.is_dir():dest=dest/'index.html'
  assert dest.exists(),(p,link)
  if u.fragment:assert unquote(u.fragment) in Scan(dest.read_text()).ids,(p,link)
# Nearest-neighbour tour with the stated tie convention.
remaining={-21,-5,-1,1,3,11};tour=[0]
while remaining:
 x=min(remaining,key=lambda v:(abs(v-tour[-1]),abs(v),-v));tour.append(x);remaining.remove(x)
tour.append(0)
assert tour==[0,1,-1,3,-5,11,-21,0]
assert sum(abs(a-b) for a,b in zip(tour,tour[1:]))==84
assert min(sum(abs(a-b) for a,b in zip((0,)+p+(0,),p+(0,))) for p in itertools.permutations([-21,-5,-1,1,3,11]))==64
# Correct existential assignment for source exercise 185, all truth values.
for a,b,c,d in itertools.product([False,True],repeat=4):
 original=a or b or c or d
 transformed=any((a or b or v) and (not v or c or d) for v in (False,True))
 assert transformed==original
 if original:
  v=False if a or b else True
  assert (a or b or v) and (not v or c or d)
values=[1,2,3,4,5]
assert [max(sum(values[:i]),sum(values[i:])) for i in range(1,5)]==[14,12,9,10]
assert all(3*n*n+10*n<=4*n*n for n in range(10,1001))
assert [k%11 for k in (12,22,32,42)]==[1,0,10,9]
print('PASS: 14 weeks, 205 exercises placed exactly once, all answer text, links and IDs, reproducible weekly pages, and 5 mathematical checks.')
