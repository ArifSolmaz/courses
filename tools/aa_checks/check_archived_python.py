"""Execute standalone lecture examples and regression-check corrected boundaries.
Run from the repository root: python3 tools/aa_checks/check_archived_python.py
"""
from pathlib import Path
from html.parser import HTMLParser
from contextlib import redirect_stdout
import io

class Blocks(HTMLParser):
    def __init__(self):
        super().__init__(); self.blocks=[]; self.inside=False
    def handle_starttag(self, tag, attrs):
        if tag=='pre': self.inside=True; self.blocks.append('')
    def handle_endtag(self, tag):
        if tag=='pre': self.inside=False
    def handle_data(self, data):
        if self.inside: self.blocks[-1]+=data

examples={}
for week in range(9,15):
    parser=Blocks(); parser.feed(Path(f'aa/w{week}/lecture-notes.html').read_text())
    for index, source in enumerate(parser.blocks):
        if 'def ' not in source: continue
        scope={}
        with redirect_stdout(io.StringIO()): exec(compile(source,f'week-{week}-block-{index}','exec'),scope)
        examples[week,index]=scope

prim=examples[10,3]['prim']
assert prim([[(1,2)],[(0,2)]],0)[0]==2
try: prim([[],[]],0)
except ValueError: pass
else: raise AssertionError('Disconnected input must not return an MST')
dag=examples[11,4]['dag_en_kisa']
assert dag(['A','B'],[('A','B',-2)],'A')['B']==-2
try: dag(['A','B'],[('A','B',1),('B','A',1)],'A')
except ValueError: pass
else: raise AssertionError('A cycle must not produce DAG distances')
fib=examples[13,0]['fib_c']
for n,value in enumerate([0,1,1,2,3,5,8,13,21,34,55]):
    cache={0:0,1:1}; assert fib(n,cache)==value; assert fib(n)==value
    if n>1: assert all(k in cache for k in range(n+1))
edit=examples[13,2]['edit_distance']
D,_=edit('thou shalt','you should')
assert len(D)==11 and len(D[0])==11 and D[-1][-1]==5
assert (2**30).bit_length()==31
assert sum(12**i for i in range(1,4))==1884
assert sum(8**i for i in range(1,4))==584
print(f'{len(examples)} Python blocks executed; corrected Prim, DAG, memoization, matrix, bit-count and counting boundaries pass.')
