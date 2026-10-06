from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json,collections
root=Path(__file__).resolve().parents[2]
void=set('area base br col embed hr img input link meta param source track wbr'.split())
class Parse(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.ids=[];self.links=[];self.labels=[];self.stack=[];self.bad=[];self.counts=collections.Counter()
 def handle_starttag(self,t,attrs):
  a=dict(attrs);self.counts[t]+=1
  if a.get('id'):self.ids.append(a['id'])
  if t=='a' and a.get('href'):self.links.append(a['href'])
  if t=='label' and a.get('for'):self.labels.append(a['for'])
  if t not in void:self.stack.append(t)
 def handle_startendtag(self,t,a):
  self.handle_starttag(t,a)
  if t not in void:self.stack.pop()
 def handle_endtag(self,t):
  if t in void:return
  if self.stack and self.stack[-1]==t:self.stack.pop()
  else:
   self.bad.append({'tag':t,'line':self.getpos()[0],'stack':self.stack[-4:]})
   if t in self.stack:
    while self.stack.pop()!=t:pass
pages=sorted(root.glob('aa/w*/**/*.html'));cache={}
def parse(p):
 if p not in cache:
  o=Parse();o.feed(p.read_text());cache[p]=o
 return cache[p]
out=[]
for p in pages:
 o=parse(p);broken=[]
 for h in o.links:
  u=urlsplit(h)
  if u.scheme or u.netloc or h.startswith('javascript:'):continue
  if u.path.startswith('/courses/'):target=root/u.path.removeprefix('/courses/')
  elif u.path.startswith('/'):target=root/u.path.lstrip('/')
  else:target=p.parent/u.path if u.path else p
  target=target.resolve()
  if target.is_dir():target=target/'index.html'
  if not target.exists():broken.append(h)
  elif u.fragment and target.suffix=='.html' and unquote(u.fragment) not in parse(target).ids:broken.append(h)
 out.append(dict(page=str(p.relative_to(root)),duplicates=[i for i,n in collections.Counter(o.ids).items() if n>1],broken=broken,missing_labels=[x for x in o.labels if x not in o.ids],tags=o.bad,unclosed=o.stack,counts=dict(o.counts)))
import sys
if len(sys.argv)>1:Path(sys.argv[1]).write_text(json.dumps(out,ensure_ascii=False,indent=2))
for o in out:
 problems={k:o[k] for k in ('duplicates','broken','missing_labels','tags','unclosed') if o[k]}
 if problems:print(o['page'],problems)
print('Pages',len(pages),'counts',dict(sum((collections.Counter(x['counts']) for x in out),collections.Counter())))

if any(any(o[k] for k in ("duplicates","broken","missing_labels","tags","unclosed")) for o in out):raise SystemExit(1)
