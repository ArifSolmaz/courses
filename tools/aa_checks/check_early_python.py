"""Run definition-bearing Python examples in W1–8, in lesson order, and check boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from contextlib import redirect_stdout
import io, random, itertools
class Blocks(HTMLParser):
    def __init__(self): super().__init__(); self.blocks=[]; self.inside=False
    def handle_starttag(self,t,a):
        if t=='pre': self.inside=True; self.blocks.append('')
    def handle_endtag(self,t):
        if t=='pre': self.inside=False
    def handle_data(self,d):
        if self.inside: self.blocks[-1]+=d
scopes={}; count=0
for w in range(1,9):
    p=Blocks(); p.feed(Path(f'aa/w{w}/'+('index.html' if w<4 else 'lecture-notes.html')).read_text()); scope={}
    for i,s in enumerate(p.blocks):
        if 'def ' not in s: continue
        with redirect_stdout(io.StringIO()): exec(compile(s,f'week-{w}-block-{i}','exec'),scope)
        count+=1
    scopes[w]=scope
rng=random.Random(17)
for _ in range(300):
    a=[rng.randrange(-20,21) for _ in range(rng.randrange(40))]; expected=sorted(a)
    for name in ('selection','insertion'): assert scopes[3][name](a[:])[0]==expected
    assert scopes[6]['heapsort'](a[:])==expected
    assert scopes[7]['mergesort'](a[:])==expected
    assert scopes[7]['qsort3'](a[:])==expected
    b=a[:]; scopes[7]['quicksort'](b,0,len(b)-1); assert b==expected
    positive=[x+20 for x in a]; assert scopes[7]['counting_sort'](positive,41)==sorted(positive)
assert scopes[3]['maksimum']([-3,-1,-9])==-1
try: scopes[3]['maksimum']([])
except ValueError: pass
else: raise AssertionError('empty maximum')
grid=scopes[8]['izgara_bfs']
assert grid([], (0,0),(0,0)) is None
assert grid([[1,0]],(0,0),(0,1)) is None
assert grid([[0,1]],(0,0),(0,1)) is None
assert grid([[0]],(0,0),(0,0))==[(0,0)]
try: grid([[0],[0,0]],(0,0),(1,0))
except ValueError: pass
else: raise AssertionError('ragged grid')
edges=list(itertools.combinations(range(1,5),2))
for mask in range(64):
    selected=[e for i,e in enumerate(edges) if mask>>i&1]; g=scopes[8]['kur'](4,selected)
    expected=any(all(c[u-1]!=c[v-1] for u,v in selected) for c in itertools.product((0,1),repeat=4))
    assert scopes[8]['iki_renk'](4,g)[0]==expected
    comp=scopes[8]['bilesenler'](4,g); assert sorted(sum(comp,[]))==[1,2,3,4]
print(f'{count} definition-bearing Python blocks executed in lesson order; 300 sorting inputs, 64 graph colorings and grid/maximum boundaries pass.')
