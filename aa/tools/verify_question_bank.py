#!/usr/bin/env python3
"""Coverage, visible-answer structure, and independent checks of numeric/proof examples."""
import itertools as it
import json, math, re, heapq
from pathlib import Path
from html.parser import HTMLParser
from question_bank import MCQ,WEEK_MCQ,EXTENSION_MCQ
from materials.question_guidance import WRITTEN,MCQ as GUIDED_MCQ
from skiena_material import EXERCISES,WEEK_EXERCISES,EXTENSIONS
ROOT=Path(__file__).resolve().parent.parent
assert set(MCQ)==set(range(1,121))
assert set(WRITTEN)=={n for n,x in EXERCISES.items() if x['level']=='Hard'}
assert set(GUIDED_MCQ)=={n for n,x in MCQ.items() if x['level']=='Hard'}
for x in MCQ.values():
 assert len(x['options'])==4 and len(set(x['options']))==4
 assert x['correct'] in 'abcd' and x['answer']
for group in (WRITTEN,GUIDED_MCQ):
 for plain,hint,steps in group.values():assert plain and hint and len(steps)>=2 and all(steps)
class Scan(HTMLParser):
 def __init__(self,source):
  super().__init__();self.tests=[];self.written=[];self.stack=[];self.visible_answers=0;self.hints=0;self.feed(source)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);ident=a.get('id','');classes=a.get('class','').split()
  if ident.startswith('skiena-mcq-'):self.tests.append(int(ident.rsplit('-',1)[1]))
  if ident.startswith('skiena-ex-'):self.written.append(int(ident.rsplit('-',1)[1]))
  if 'question-answer' in classes:
   assert tag=='div' and 'hidden' not in a;self.visible_answers+=1
  if 'question-hint' in classes:
   assert tag=='p' and 'hidden' not in a;self.hints+=1
all_mcq=[];all_written=[]
for n in range(1,15):
 s=(ROOT/f'w{n}/index.html').read_text();p=Scan(s)
 assert sorted(p.tests)==sorted(WEEK_MCQ[n]);assert sorted(p.written)==sorted(WEEK_EXERCISES[n])
 assert p.visible_answers==len(p.tests)+len(p.written)
 assert p.hints==sum(MCQ[i]['level']=='Hard' for i in p.tests)+sum(EXERCISES[i]['level']=='Hard' for i in p.written)
 assert s.index('class="source-exercise test-question"')<s.index('id="skiena-ex-')
 # The question bank is on the visible lesson route, not nested in a reference disclosure.
 prefix=s[:s.index('<section class="chapter-question-bank"')]
 assert prefix.count('<details')==prefix.count('</details>')
 all_mcq+=p.tests;all_written+=p.written
s=(ROOT/'extensions/index.html').read_text();p=Scan(s)
assert p.visible_answers==len(p.tests)+len(p.written)
for key,_,_,ids,*_ in EXTENSIONS:
 start=s.index(f'id="{key}-questions"');end=s.find('<section class="extension-chapter"',start)
 chapter=s[start:end if end!=-1 else len(s)]
 scan=Scan(chapter);assert scan.tests==list(EXTENSION_MCQ[key]);assert scan.written==list(ids)
 assert chapter.index('id="skiena-mcq-')<chapter.index('id="skiena-ex-')
all_mcq+=p.tests;all_written+=p.written
assert sorted(all_mcq)==list(range(1,121))
assert sorted(all_written)==list(range(1,206))
# A named registry makes clear which computations are independently checked.
checks=[]
def check(name,condition):
 assert condition,name
 checks.append(name)
check('MCQ 9 / written 12 logs',math.log2(1024)==10 and math.log2(64)==6)
check('MCQ 11 constants',all(3*n*n+10*n<=4*n*n for n in range(10,1001)))
check('MCQ 12 triangular sum',all(sum(range(1,n+1))==n*(n+1)//2 for n in range(101)))
check('MCQ 15 timing model',(4000/1000)**2==16)
check('written 21 crossover',all(2**n<=n**100 for n in range(900,997)) and 2**997>997**100)
check('written 22 timing model',math.isclose(10*math.log2(10000)/math.log2(1000),40/3))
check('MCQ 20 route',min(sum(abs(a-b) for a,b in zip((0,)+p,p+(0,))) for p in it.permutations([-10,-3,4,9]))==38)
check('MCQ 29 capacity',2**12<5000<=2**13)
check('MCQ 31 / written 45 copying',sum(2**i for i in range(10))==1023)
prob=lambda n:1-math.prod((365-i)/365 for i in range(n))
check('MCQ 36 / written 54 birthday',prob(22)<.5<prob(23))
def probe(keys,size):
 slots=[None]*size;positions=[]
 for k in keys:
  j=k%size
  while slots[j] is not None:j=(j+1)%size
  slots[j]=k;positions.append(j)
 return positions
check('MCQ 39 probe',probe([10,15,3,20],5)==[0,1,3,2])
check('written 62 probe',probe([7,14,21,1],7)==[0,1,2,3])
valid_heap=lambda a:all(a[(i-1)//2]<=a[i] for i in range(1,len(a)))
check('MCQ 41 unique heap',[valid_heap(a) for a in ([1,3,2,5,4],[1,5,2,3,4],[2,1,3,4,5],[1,2,3,1,0])]==[True,False,False,False])
a=[2,4,3];heapq.heappush(a,1);check('MCQ 51 insert',a==[1,2,3,4])
a=[1,3,2,7,4];heapq.heappop(a);check('MCQ 52 remove',a==[2,3,4,7])
def partition(a):
 a=list(a);i=0
 for j in range(len(a)-1):
  if a[j]<a[-1]:a[i],a[j]=a[j],a[i];i+=1
 a[i],a[-1]=a[-1],a[i]
 return a,i
check('MCQ 53 partition',partition([4,9,1,7,3])==([1,3,4,7,9],1))
check('written 77 partition',partition([8,3,6,1,9,2,5])==([3,1,2,5,9,6,8],3))
check('MCQ 58 stable pass',sorted([170,45,75,90,802,24],key=lambda x:x%10)==[170,90,802,24,45,75])
for base in range(2,20):
 a=list(reversed(range(base**3)));b=a[:]
 for pwr in range(3):b=sorted(b,key=lambda x:(x//base**pwr)%base)
 check(f'MCQ 59 base {base}',b==sorted(a))
# Exhaustive spanning-tree enumeration and all-pairs relaxation are independent of the displayed greedy traces.
edges=[('A','B',4),('A','C',1),('B','C',2),('B','D',5),('C','D',8),('D','E',3),('C','E',10)]
def connected(sub):
 seen={'A'}
 while True:
  old=seen.copy()
  for u,v,w in sub:
   if u in seen or v in seen:seen.update([u,v])
  if old==seen:return len(seen)==5
check('MCQ 73 / written 112 MST',min(sum(w for u,v,w in sub) for sub in it.combinations(edges,4) if connected(sub))==11)
verts='ABCDE';dist={(u,v):0 if u==v else math.inf for u in verts for v in verts}
for u,v,w in edges:dist[u,v]=dist[v,u]=w
for k in verts:
 for u in verts:
  for v in verts:dist[u,v]=min(dist[u,v],dist[u,k]+dist[k,v])
check('MCQ 74 / written 114 distances',[dist['A',v] for v in verts]==[0,3,1,8,11])
check('MCQ 79 negative edge',5-4==1<2)
F=[0,1]
for n in range(2,13):F.append(F[-1]+F[-2])
check('MCQ 85 Fibonacci',F[12]==144)
check('MCQ 87 choose',math.comb(6,2)==15)
def edit(s,t):
 a=list(range(len(t)+1))
 for i,c in enumerate(s,1):
  b=[i]
  for j,d in enumerate(t,1):b.append(min(a[j]+1,b[-1]+1,a[j-1]+(c!=d)))
  a=b
 return a[-1]
check('MCQ 88 / written 143 and 150 edits',[edit(s,t) for s,t in [('flaw','lawn'),('cat','cut'),('cat','cats'),('kitten','sitting'),('sun','snow')]]==[2,1,1,3,3])
def subseqs(a):
 for mask in range(1<<len(a)):yield [v for i,v in enumerate(a) if mask>>i&1]
a=[3,1,4,1,5,9,2,6]
check('MCQ 95 LIS',max(len(s) for s in subseqs(a) if all(x<y for x,y in zip(s,s[1:])))==4)
check('MCQ 96 max stretch',max(sum([2,-5,3,4,-1,2][i:j]) for i in range(6) for j in range(i+1,7))==8)
check('MCQ 99 derangements',sum(all(i!=v for i,v in enumerate(p)) for p in it.permutations(range(5)))==44)
check('written 148 derangements',sum(all(i!=v for i,v in enumerate(p)) for p in it.permutations(range(4)))==9)
def partition_cost(a,k):
 return min(max(sum(a[i:j]) for i,j in zip((0,)+cuts,cuts+(len(a),))) for cuts in it.combinations(range(1,len(a)),k-1))
check('MCQ 94 partition',partition_cost([2,8,3,4,6],2)==13)
check('written 146 partition',partition_cost([1,2,3,4,5],2)==9)
check('written 164 partition',partition_cost([3,1,4,1,5,9,2,6],3)==14)
for bits in it.product([False,True],repeat=4):
 a,b,c,d=bits
 check('MCQ 111 / written 185 SAT '+str(bits),(a or b or c or d)==any((a or b or v) and (not v or c or d) for v in (False,True)))
# Reduction works for all small positive multisets, including repeated weights and boundary targets.
for values in it.combinations_with_replacement(range(1,5),3):
 W=sum(values)
 for t in range(W+1):
  sums={sum(s) for s in subseqs(values)}
  aug=list(values)+[2*W-t,W+t]
  check('MCQ 119 / written 199 '+str((values,t)),(t in sums)==any(sum(s)==2*W for s in subseqs(aug)))
# Tight example for doubled matching cover and independent exhaustive optimum.
for bits in range(1<<6):
 es=[e for i,e in enumerate(it.combinations(range(4),2)) if bits>>i&1];cover=set()
 for u,v in es:
  if u not in cover and v not in cover:cover.update([u,v])
 opt=min(len(s) for s in subseqs(range(4)) if all(u in s or v in s for u,v in es))
 check('MCQ 120 / written 202 graph '+str(bits),all(u in cover or v in cover for u,v in es) and len(cover)<=2*opt)
# Enumerate choices to check the optimisation examples instead of trusting the keys.
def coins(target,values):
 best=[0]+[math.inf]*target
 for a in range(1,target+1):best[a]=1+min(best[a-c] for c in values if c<=a)
 return best[target]
check('MCQ 91 / written 149 coins',coins(10,[1,5,6])==2 and coins(6,[1,3,4])==2)
def knapsack(items,capacity):return max(sum(v for w,v in s) for s in subseqs(items) if sum(w for w,v in s)<=capacity)
check('MCQ 92 knapsack',knapsack([(2,3),(3,4),(4,5)],5)==7)
check('written 152 knapsack',knapsack([(1,1),(3,4),(4,5),(5,7)],7)==9)
check('MCQ 93 stairs',F[7]==13)
def lcs(a,b):
 def is_sub(s,t):
  stream=iter(t)
  return all(any(c==v for c in stream) for v in s)
 return max(len(s) for s in subseqs(a) if is_sub(s,b))
check('MCQ 89 / written 144 and 151 LCS',lcs('ABC','BCA')==2 and lcs('ABCD','ACBD')==3 and lcs('AGGTAB','GXTXAYB')==4)
check('written 159 palindrome',max(len(s) for s in subseqs('character') if s==s[::-1])==5)
def queens(n):return sum(all(abs(p[i]-p[j])!=j-i for i in range(n) for j in range(i+1,n)) for p in it.permutations(range(n)))
check('written 156 queens',[queens(n) for n in [2,3,4]]==[0,0,2])
check('written 165 egg bound',sum(range(1,4))<10==sum(range(1,5)))
# The exact clause gadget selected in written 205 covers all its edges.
var=['x','nx','y','ny','z','nz'];c1=['c1x','c1y','c1nz'];c2=['c2nx','c2y','c2z']
gadget=[('x','nx'),('y','ny'),('z','nz')]+list(it.combinations(c1,2))+list(it.combinations(c2,2))+list(zip(c1,['x','y','nz']))+list(zip(c2,['nx','y','z']))
cover={'x','y','z','c1y','c1nz','c2nx','c2z'}
check('written 205 SAT cover',len(var+c1+c2)==12 and len(cover)==7 and all(u in cover or v in cover for u,v in gadget))
print(f'PASS: 120 tests + 205 written questions, exact-once chapter placement, tests first, 325 visible answers, all 57 hard-question scaffolds, {len(checks)} independent fixture checks.')
