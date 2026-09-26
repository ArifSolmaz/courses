from pathlib import Path
import html,json,re,sys
from .course import WEEKS
from .visuals import figure, CODES
from .sample_questions import MIDTERM,FINAL
from .compact import animation_content, consolidate_routes, redirect
from . import theory, transfer
E=html.escape
ROOT=Path(__file__).resolve().parents[2]
DATA=Path(__file__).parent
LECTURES=json.loads((DATA/'lectures.json').read_text())
MIDTERM_WEEKS=range(1,8);FINAL_EMPHASIS=range(8,15)
# Exact placement of existing source tests by topic. Selected earlier tests serve as review.
# Ids 121–136 are the course-authored conceptual tests in NEW (stored as 1121–1136).
TESTS={1:[1,2,3,4,20,121,122,123,124,125],2:[5,6,7,8,11,14,15,17,18,19],3:[9,10,12,13,16,17,18,7,8,5],4:[21,22,23,24,29,30,31,32,126,127],5:list(range(25,29))+list(range(33,41)),6:[41,42,43,44,50,51,52,21,22,31],
 7:[45,46,48,53,54,55,56,60,47,49,57,58,59,128,16,10,7,11,14,19],   # mergesort, quicksort, lower bound, linear sorting
 8:[61,62,63,64,65,66,67,71,129,130],                                # graph representations and BFS
 9:[68,72,76,77,78,66,64,71,129,130],                                # DFS, edge types, topological order
 10:[73,75,131,132,61,62,63,65,66,67],                               # MST, Prim, Kruskal, union-find
 11:[69,70,74,79,80,65,63,133,134,135],
 12:[81,82,83,84,85,86,87,93,99,136],13:[88,89,90,91,92,94,95,96,97,98,100],14:list(range(101,121))}
# Every original written exercise has one primary home; advanced problems stay clearly marked.
WRITTEN={1:[1,2,3,4,5,6,17,29,30],2:[7,8,9,10,11,14,15,16,21,22,25,26,27,28],3:[12,13,18,19,20,23,24,90,95],4:[32,33,34,43,44,45,46,47,48,61],5:[35,36,37,38,39,40,41,42,49,50,51,52,53,54,55,56,57,58,59,60,62,63,64],6:[65,66,67,68,69,70,76,78,79,83,92,93,94,97],
 7:[31,71,72,73,75,77,80,81,82,87,88,96,74,84,85,86,89,91],
 8:[98,99,100,101,103,105,106,124,126,128,129],
 9:[102,104,107,111,117,118,119,121,127,134],
 10:[108,112,113,115,125,130,131,133],
 11:[109,110,114,116,120,122,123,132],
 12:[135,136,137,138,139,140,141,142,148,155,156,157,161,168],13:[143,144,145,146,147,149,150,151,152,153,154,158,159,160,162,163,164,165,166,167,169,170],14:list(range(171,206))}
assert sorted(n for a in WRITTEN.values() for n in a)==list(range(1,206))
assert all(len(set(v))==len(v) for v in TESTS.values()) and all(len(set(v))==len(v) for v in WRITTEN.values())
# Self-contained new questions fill conceptual gaps without assuming Python.
NEW=[
(121,'Why can one counterexample refute a claim of correctness?',['The claim concerns every legal input.','It tests every input.','It proves all alternatives correct.','It measures the worst running time.'],'a','A universal claim fails if even one legal instance produces an incorrect result.'),
(122,'Before comparing two algorithms, what must agree?',['Their programming language.','Their input and required-output contract.','Their variable names.','Their measured runtime.'],'b','Two methods may be compared as solutions only if they solve the same specified problem.'),
(123,'For equal-value fixed intervals, earliest-finish scheduling leaves what advantage?',['The most remaining time for compatible jobs.','The highest guaranteed income for weighted jobs.','The fewest jobs.','The longest first job.'],'a','Choosing a first job that finishes no later than another feasible first job cannot reduce the remaining scheduling window.'),
(124,'Many successful tests establish which conclusion?',['Correctness for every input.','Evidence on the tested instances.','A proof of optimality.','Constant running time.'],'b','Testing checks particular instances. A universal claim needs an argument covering every legal case.'),
(125,'Which is a precise tour objective?',['Find the nicest tour.','Find the most sensible tour.','Minimise total distance while visiting all specified points and returning to the start.','Use an elegant method.'],'c','The objective and legal routes must be defined before optimality has a meaning.'),
(126,'Given the head of a singly linked list, front insertion needs how many existing-node traversals?',['Zero.','n.','n².','log n.'],'a','Create a node pointing to the old head and update the head; searching for a different insertion location is a separate cost.'),
(127,'To read array position i in constant time, the model assumes:',['A walk from the head.','Random access to fixed-size entries.','Sorted values.','Distinct values.'],'b','Random-access addressing reaches the location directly. Sorting and uniqueness are unnecessary.'),
(128,'Stable sorting preserves:',['All original positions.','The relative order of records with equal keys.','The order of unequal keys.','The array length only.'],'b','Stability matters when earlier ordering information must survive another sorting pass.'),
(129,'In BFS, when should a vertex be marked discovered?',['When first enqueued.','Only after the entire search.','Every time an edge reaches it.','Never.'],'a','Marking on enqueue prevents different parents from placing the same vertex into the queue repeatedly.'),
(130,'BFS distance measures what in an unweighted graph?',['Total arbitrary edge weight.','Minimum edge count from the source.','MST total weight.','DFS finishing time.'],'b','BFS processes vertices by levels: all distance-k vertices precede distance-(k+1) vertices.'),
(131,'Kruskal rejects an edge when it:',['Has positive weight.','Joins vertices already in the same component.','Has the smallest weight.','Touches the start vertex.'],'b','That edge would form a cycle with the accepted edges.'),
(132,'An MST minimises:',['Every pairwise path simultaneously.','The total weight of a spanning tree.','The number of vertices.','The BFS discovery order.'],'b','Minimum total connecting weight is different from a shortest-path objective.'),
(133,'Relaxing edge u→v with weight w means:',['Always increase d(v).','Replace d(v) by min(d(v),d(u)+w).','Mark v permanently before comparison.','Delete u.'],'b','The edge offers a candidate route through u; retain it only if it improves the current distance.'),
(134,'A predecessor table in shortest-path search is used to:',['Reconstruct a path.','Make negative weights safe for Dijkstra.','Sort the graph.','Count all spanning trees.'],'a','Distances give costs; predecessors record which earlier vertex supplied a chosen route.'),
(135,'An unreachable vertex keeps which shortest-path distance?',['0.','1.','Infinity.','The number of vertices.'],'c','Infinity denotes that no source-to-vertex route has been found; in the completed search the vertex is unreachable.'),
(136,'What must a dynamic-programming state specify?',['Enough information to define a reusable subproblem.','Only the final answer.','The entire execution history in every problem.','A random guess.'],'a','Equivalent states must have the same remaining subproblem; otherwise caching their answers would be invalid.')]

def mcq_id(x):
 """Visible placement ids 121–136 are the NEW questions, stored under 1121–1136 to avoid the support library."""
 return x+1000 if 121<=x<=136 else x

def placements():
 """Effective test/written lists per week: the placements above plus the hook modules' extras."""
 tests={n:[mcq_id(x) for x in TESTS[n]] for n in TESTS};written={n:list(WRITTEN[n]) for n in WRITTEN}
 for mod in (theory,transfer):
  for n,ids in getattr(mod,'EXTRA_TESTS',{}).items():tests[n]+=[i for i in ids if i not in tests[n]]
  for n,ids in getattr(mod,'EXTRA_WRITTEN',{}).items():written[n]+=[i for i in ids if i not in written[n]]
 return tests,written

def display_numbers(Q,S,tests,written):
 """Visible weekly numbering: tests sorted by level then id, written continue the count."""
 rank={'Easy':0,'Medium':1,'Hard':2};out={}
 for n in tests:
  ts=sorted(tests[n],key=lambda i:(rank[Q.MCQ[i]['level']],i));ws=sorted(written[n],key=lambda i:(rank[S.EXERCISES[i]['level']],i))
  for k,i in enumerate(ts,1):out[('mcq',i)]=(n,k)
  for k,i in enumerate(ws,len(ts)+1):out[('ex',i)]=(n,k)
 return out

def crossref(text,homes,display):
 """Turn source cross-references into links that use the visible weekly numbering."""
 def ex(m):
  i=int(m[1])
  if i not in homes:return m[0]
  n,k=display[('ex',i)]
  return f'<a href="../w{n}/#skiena-ex-{i:03}">Week {n}, Question {k}</a>'
 text=re.sub(r'(?i)(?:written |source )?exercise (\d+)',ex,text)
 # Test 116 refers to source test 119 by its original number.
 if ('mcq',119) in display:
  n,k=display[('mcq',119)]
  text=text.replace('question 119',f'<a href="../w{n}/#skiena-mcq-119">Week {n}, Question {k}</a>')
 return text

def wrap_tables(html_text):
 """Tables scroll inside their column on narrow screens."""
 return re.sub(r'(?<!<div class="table-wrap">)(<table\b.*?</table>)',r'<div class="table-wrap">\1</div>',html_text,flags=re.S)

def configure():
 import question_bank as Q
 import skiena_material as S
 def add_mcq(ident,q,options,correct,answer,level='Easy'):
  Q.MCQ[ident]={'id':ident,'question':q,'options':options,'correct':correct,'answer':answer,'level':level,'origin':'course'}
 for item in NEW:add_mcq(mcq_id(item[0]),*item[1:])
 for mod,lo,hi,wlo,whi in ((theory,2000,2999,300,399),(transfer,3000,3999,400,499)):
  for item in getattr(mod,'NEW_MCQ',[]):
   assert lo<=item[0]<=hi and item[0] not in Q.MCQ,(mod.__name__,item[0])
   add_mcq(*item)
   level=getattr(mod,'NEW_MCQ_LEVEL',{}).get(item[0])
   if level:Q.MCQ[item[0]]['level']=level
  for item in getattr(mod,'NEW_WRITTEN',[]):
   assert wlo<=item['id']<=whi and item['id'] not in S.EXERCISES,(mod.__name__,item['id'])
   S.EXERCISES[item['id']]=item
 return Q

def shell(B,title,body,base,assets='',sheets=('course.css?v=4',),scripts=('compact.js?v=4','course.js?v=1')):
 """One page. `sheets`/`scripts` are the page's own layer (course.* for the
 lessons and reference pages, home.* for the dashboard); `assets` carries the
 per-week animation bundles, which must load before compact.js and course.js."""
 body=body.replace('<main ', '<div ').replace('</main>', '</div>')
 head=B.HEAD.format(title=E(title)+' — AA',desc=E(title),base=base)
 head=re.sub(r'<nav class="header-nav">.*?</nav>', '<button class="hlink" data-theme-toggle type="button">Light / dark</button>', head, flags=re.S)
 extra=''.join(f'<link rel="stylesheet" href="{base}assets/{s}">' for s in sheets)+assets \
      +''.join(f'<script defer src="{base}assets/{s}"></script>' for s in scripts)
 return head.replace('</head>',extra+'</head>')+body+B.FOOT.format(site='Algorithm Analysis',base=base)

def reading_label(lectures):
 return 'Lectures '+', '.join(map(str,lectures)) if len(lectures)>1 else f'Lecture {lectures[0]}'

def digraph_svg(nodes,edges,caption,weights=None):
 """Small directed graph for a worked example: nodes {name:(x,y)}, edges [(a,b,label)]."""
 out=['<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#526b78"/></marker></defs>']
 for a,b,label in edges:
  (x1,y1),(x2,y2)=nodes[a],nodes[b];dx,dy=x2-x1,y2-y1;d=(dx*dx+dy*dy)**.5;ux,uy=dx/d,dy/d
  sx,sy,tx,ty=x1+ux*24,y1+uy*24,x2-ux*26,y2-uy*26
  out.append(f'<line x1="{sx:.0f}" y1="{sy:.0f}" x2="{tx:.0f}" y2="{ty:.0f}" marker-end="url(#arrow)"/>')
  if label:out.append(f'<text x="{(x1+x2)/2-uy*14:.0f}" y="{(y1+y2)/2+ux*14+5:.0f}" text-anchor="middle" font-size="14">{E(label)}</text>')
 for name,(x,y) in nodes.items():
  out.append(f'<circle cx="{x}" cy="{y}" r="22" fill="#e2eaf0" stroke="#526b78" stroke-width="2"/><text x="{x}" y="{y+6}" text-anchor="middle">{E(name)}</text>')
 return f'<figure><svg viewBox="0 0 780 220" role="img" aria-label="{E(caption)}">{"".join(out)}</svg><figcaption>{E(caption)}</figcaption></figure>'

CUSTOM_FIGURES={
 'dfs':lambda:digraph_svg({'A':(80,110),'B':(240,50),'C':(240,170),'D':(400,110),'E':(560,50),'F':(560,170)},[('A','B',''),('A','C',''),('B','D',''),('C','D',''),('C','F',''),('D','E',''),('E','B','')],'Directed graph for the DFS trace. The edge E→B returns to a vertex still on the recursion stack: a back edge, hence a cycle.'),
 'bellman':lambda:digraph_svg({'S':(90,110),'A':(330,40),'B':(330,180),'C':(620,110)},[('S','A','4'),('S','B','2'),('B','A','−3'),('A','C','1'),('B','C','5')],'Bellman–Ford input. The negative edge B→A lets the route S→B→A beat the direct edge S→A.'),
}
def example_figure(week,item):
 key=item.get('figure')
 if key is None:return ''
 if isinstance(key,int):return figure(key)
 if key in CUSTOM_FIGURES:return CUSTOM_FIGURES[key]()
 return key

def week_code(n):
 w=WEEKS[n-1];code=w.get('code',n)
 return CODES[code] if isinstance(code,int) else code

def render_example(n,item,i,count):
 label=f'<span class="example-label">{E(item["label"])}</span>' if item.get('label') else ''
 heading=f'<h2 id="example-{n}-{i}">{E(item["question"])}</h2>' if count==1 else f'<h2 id="example-{n}-{i}"><span class="example-number">Worked example {i}</span>{E(item["question"])}</h2>'
 steps=''.join(f'<article><span>Step {k}</span><p>{E(step)}</p></article>' for k,step in enumerate(item['steps'],1))
 return f'<article class="worked-example">{heading}{label}<p class="problem">{E(item["example"])}</p>{example_figure(n,item)}<div class="trace" aria-label="Worked solution steps">{steps}</div><p class="edge"><strong>Change the case.</strong> {E(item["edge"])}</p></article>'

def week_card(n,title,reading):
 """One card on the dashboard. The tick and the progress bar are driven by
 assets/home.js through data-week/data-tick; without JavaScript the card is
 simply a link."""
 return (f'<li class="wk" data-week="w{n}"><a class="wk-link" href="w{n}/">'
         f'<span class="wk-num">Week {n:02}</span><span class="wk-title">{E(title)}</span>'
         f'<span class="wk-read">Document &middot; {reading}</span></a>'
         f'<button class="wk-tick" type="button" data-tick="w{n}" aria-pressed="false">'
         f'<span class="wk-tick-mark" aria-hidden="true"></span>'
         f'<span class="visually-hidden">Mark week {n:02} as done</span></button></li>')

def term_block(label,note,cards,start):
 items=''.join(week_card(*c) for c in cards)
 return (f'<div class="term"><h3 class="term-head">{label} <span>{note}</span></h3>'
         f'<ol class="weeks"{f" start={chr(34)}{start}{chr(34)}" if start>1 else ""}>{items}</ol></div>')

def objectives_html(w):
 return '<div class="objectives"><h2>By the end of this week you can…</h2><ul>'+''.join(f'<li>{E(x)}</li>' for x in w['objectives'])+'</ul></div>'

# --- Additional textbook problems (53 articles) grouped by topic on one page ---
TEXTBOOK_GROUPS=[
 ('growth','Big-O and growth',2,lambda k:k is None or 7<=k<=24),
 ('analysis','Program analysis, sums and logarithms',3,lambda k:k is not None and (k<=6 or 25<=k<=42)),
 ('puzzles','Interview questions, puzzles and programming challenges',14,lambda k:k is not None and k>=43),
]
def textbook_articles():
 articles=json.loads((DATA/'textbook-problems.json').read_text())
 groups={g[0]:[] for g in TEXTBOOK_GROUPS}
 for i,article in enumerate(articles):
  m=re.search(r'id="p2-(\d+)"',article);k=int(m[1]) if m else None
  if k is None and i==len(articles)-1:k=99   # the closing programming-challenges article
  for slug,_,_,pred in TEXTBOOK_GROUPS:
   if pred(k):groups[slug].append(article);break
 assert sum(map(len,groups.values()))==len(articles)==53
 return groups

def scope_table(n):
 w=WEEKS[n-1]
 rows=''.join(f'<tr><td>{E(item.replace(" (reading only)",""))}</td><td>{"Reading only" if "(reading only)" in item else "Core"}</td></tr>' for item in w['scope'])
 return f'<section class="scope-week" id="scope-w{n}"><h3>Week {n} · {E(w["title"])}</h3><p class="reading">{reading_label(w["lectures"])} · <a href="../w{n}/">Open the week</a></p><table class="scope-table"><thead><tr><th>Topic</th><th>Status</th></tr></thead><tbody>{rows}</tbody></table></section>'

def scope_page(B):
 midterm=''.join(scope_table(n) for n in MIDTERM_WEEKS);final=''.join(scope_table(n) for n in FINAL_EMPHASIS)
 body=f'''<main class="aligned compact-week scope-page"><header class="week-heading"><p class="eyebrow">Assessment</p><h1>What the exams cover</h1><p>The midterm and the final each count 50% of the grade. Weekly practice, including every question on the weekly pages and the cumulative review, is ungraded and needs no upload: it is how you prepare, not something you hand in.</p></header>
<p>Each table lists the examinable topics of one week. <strong>Core</strong> topics can appear on the exam, including the newly added theory (master theorem, amortised analysis, Bellman–Ford, correctness invariants). <strong>Reading only</strong> topics give background in the notes and are not examined. Exam questions follow the style of the worked examples: a small instance to trace, a bound to derive, or a short argument to write.</p>
<nav class="page-links"><a href="#midterm">Midterm</a><a href="#final">Final</a><a href="../review/">Cumulative review</a><a href="../">All weeks</a></nav>
<section id="midterm"><h2>Midterm · weeks 1–7</h2><p>The midterm covers weeks 1 to 7: correctness, growth notation, program analysis, elementary data structures, search trees and hashing, heaps, and the sorting block including recurrences.</p>{midterm}
{MIDTERM}</section>
<section id="final"><h2>Final · weeks 1–14, emphasis on weeks 8–14</h2><p>The final covers the whole course. Most questions come from weeks 8 to 14 (graphs, spanning trees, shortest paths, backtracking, dynamic programming, NP-completeness); some questions reuse ideas from weeks 1 to 7, for example bounding the cost of a graph algorithm or proving a greedy choice correct. The tables for weeks 1–7 above remain in scope.</p>{final}
{FINAL}</section>
<nav class="week-nav"><a href="../">All weeks</a><a href="../review/">Cumulative review →</a></nav></main>'''
 return shell(B,'What the exams cover',body,'../')

def review_page(B,Q,tests,homes_written=None,display=None):
 homes={}
 for n in range(1,15):
  for t in tests[n]:homes.setdefault(t,n)
 later={t for n in range(1,15) for t in tests[n] if homes[t]<n}
 number=0;sections=[];index=[]
 for n,w in enumerate(WEEKS,1):
  index.append(f'<a href="#review-w{n}">Week {n}</a>')
  quick=[t for t in tests[n] if homes[t]==n and t in later]
  if not quick:quick=[t for t in tests[n] if homes[t]==n and Q.MCQ[t]['level']=='Easy'][:3]
  checks=''
  for t in quick:
   number+=1;checks+=crossref(Q.test_question(t,number),homes_written or {},display or {})
  retrieve=''.join(f'<li><strong>{E(x["question"])}</strong> {E(x["example"])} <a href="../w{n}/#example-{n}-{i}">See the worked steps →</a></li>' for i,x in enumerate(w['examples'],1))
  sections.append(f'''<section class="review-week" id="review-w{n}"><h2>Week {n} · {E(w["title"])}</h2><p class="reading">{reading_label(w["lectures"])} · <a href="../w{n}/">Open the week</a> · <a href="../scope/#scope-w{n}">Exam scope</a></p>
<h3>You should be able to</h3><ul>{''.join(f'<li>{E(x)}</li>' for x in w['objectives'])}</ul>
<h3>Retrieve before you re-read</h3><p>Cover the steps, solve each problem on paper, then compare.</p><ul class="retrieve">{retrieve}</ul>
<h3>Quick checks</h3><p>These tests also appear as review in later weeks. Answer first, then open the answer.</p>{checks}
<p><a href="../w{n}/#practice">All Week {n} practice questions →</a></p></section>''')
 body=f'''<main class="aligned compact-week review-page"><header class="week-heading"><p class="eyebrow">Cumulative review</p><h1>Review the whole course</h1><p>One page for revision before the midterm (weeks 1–7) and the final (weeks 1–14, emphasis on 8–14). For each week: what you should be able to do, the worked problems to retrieve from memory, and the quick-check tests that later weeks reuse. Everything here is ungraded practice.</p></header>
<nav class="page-links">{''.join(index)}</nav>
<p>Use it in three passes. First, read the objectives and mark the ones you cannot yet do. Second, solve the retrieval problems on paper without looking at the steps. Third, answer the quick checks; every wrong answer names the week to reopen. The <a href="../scope/">exam scope page</a> lists exactly which topics are core and which are reading only.</p>
{''.join(sections)}
<nav class="week-nav"><a href="../">All weeks</a><a href="../scope/">What the exams cover →</a></nav></main>'''
 return shell(B,'Cumulative review',body,'../')

def textbook_page(B):
 groups=textbook_articles()
 nav=''.join(f'<a href="#{slug}">{E(heading)}</a>' for slug,heading,_,_ in TEXTBOOK_GROUPS)
 sections=''.join(f'<section class="textbook-group" id="{slug}"><h2>{E(heading)}</h2><p class="reading">{len(groups[slug])} problems · used with <a href="../w{week}/">Week {week}</a></p>{"".join(groups[slug])}</section>' for slug,heading,week,_ in TEXTBOOK_GROUPS)
 body=f'''<main class="aligned compact-week textbook-page"><header class="week-heading"><p class="eyebrow">Extra practice</p><h1>Additional textbook problems</h1><p>Fifty-three problems from the textbook’s analysis chapter, each restated in plain words and solved in full. They extend the practice of weeks 2, 3 and 14; they are not additional homework and nothing is uploaded.</p></header>
<nav class="page-links">{nav}</nav>{sections}
<section class="textbook-group" id="further-reading"><h2>Further reading</h2><p>A plain-language walkthrough of the textbook’s analysis chapter: <a href="../resources/Skiena_Ch2_Explained_Simply.pdf">Skiena chapter 2, explained simply (PDF)</a> · <a href="../resources/Skiena_Ch2_Explained_Simply.docx">Word version</a>.</p></section>
<nav class="week-nav"><a href="../">All weeks</a><a href="../review/">Cumulative review →</a></nav></main>'''
 return shell(B,'Additional textbook problems',body,'../')

def build(B):
 Q=configure()
 tests,written=placements()
 assert all(len(v)>=10 for v in tests.values())
 homes={q:w for w,qs in written.items() for q in qs}
 import skiena_material as S
 display=display_numbers(Q,S,tests,written)
 groups=textbook_articles();textbook_links={week:(slug,heading,len(groups[slug])) for slug,heading,week,_ in TEXTBOOK_GROUPS}
 rows=[]
 for n,w in enumerate(WEEKS,1):
  title,lectures,summary,python=w['title'],w['lectures'],w['summary'],w['python']
  reading=reading_label(lectures)
  rows.append((n,title,reading))
  core=[];depth=[]
  for l in lectures:
   sections=LECTURES[str(l)]['sections']
   for s in sections:
    if s['title'] in ['Growth rates, from slowest to fastest','Sources']:break
    if s['title']=='Test yourself':continue
    depth.append(f'<details><summary>Lecture {l} · {E(s["title"])}</summary>{s["html"]}</details>')
   selected=[s['title'] for s in sections if s['title']!='Test yourself']
   # Later combined weeks assign selected reading, not entire advanced chapters.
   if n>=12:
    wanted={15:['The eight queens problem','Generating all subsets'],16:['Why dynamic programming','Fibonacci numbers: three ways','The DP habit'],17:['The three steps of dynamic programming','Edit distance: the problem','The recurrence','The DP table'],18:['The linear partition problem','When can you use dynamic programming?','The principle of optimality'],19:['The main idea: reductions','Problems, instances and decision problems'],20:['Satisfiability','3-SAT','The direction of a reduction'],21:['Integer partition (subset sum)'],22:['P versus NP','Is P = NP?']}
    selected=[t for t in selected if t in wanted.get(l,[])]
   core.append(f'<li><strong>Lecture {l}: {E(LECTURES[str(l)]["title"])}</strong><br>'+E('; '.join(selected))+'.</li>')
  bank=Q.bank(tests[n],written[n],title='Practice with answers')
  if n in (10,11): bank='<p>'+E(Q.GRAPH_W)+'</p>'+bank
  # Preserve original cross-references even though visible question numbering is weekly.
  bank=crossref(bank,homes,display)
  animations,assets=animation_content(n)
  examples=''.join(render_example(n,item,i,len(w['examples'])) for i,item in enumerate(w['examples'],1))
  more=''
  if n in textbook_links:
   slug,heading,count=textbook_links[n]
   more=f'<p class="textbook-link"><a href="../textbook-problems/#{slug}">Additional textbook problems: {E(heading)} ({count} problems with solutions)</a></p>'
  exam_note='Midterm and final' if n in MIDTERM_WEEKS else 'Final (emphasis)'
  body=f'''<main class="aligned compact-week"><header class="week-heading"><p class="eyebrow">Week {n:02} · {reading}</p><h1>{E(title)}</h1><p>{E(summary)}</p><p class="week-links"><a href="../scope/#scope-w{n}">Exam scope: {exam_note}</a><a href="../review/#review-w{n}">Cumulative review</a></p></header>
<nav class="week-tabs" aria-label="Weekly content"><button id="tab-lesson" data-week-tab="lesson">Lesson</button><button id="tab-practice" data-week-tab="practice">Practice</button><button id="tab-notes" data-week-tab="notes">Notes</button></nav>
<section id="lesson" class="week-panel">{objectives_html(w)}{examples}{wrap_tables(theory.THEORY.get(n,''))}{animations}</section>
<section id="practice" class="week-panel">{transfer.TRANSFER.get(n,'')}<p>Questions and answers are together. Hard questions are optional; some tests revisit earlier ideas. Practice is ungraded.</p>{bank}</section>
<section id="notes" class="week-panel"><details class="reading-card"><summary>Document reading · {reading}</summary><ul>{''.join(core)}</ul><p><a href="../resources/algorithm-analysis-english-turkish-skiena-cse373.docx?v=aligned">Download the complete bilingual document</a></p></details><details><summary>Python explained for this lesson</summary><p>{E(python)}</p><pre><code>{E(week_code(n))}</code></pre><p>Predict the result, then run the demonstration. No prior Python fluency is required for the paper trace.</p></details><details class="reading-reference"><summary>English–Turkish explanations</summary>{''.join(depth)}</details>{more}</section>
<nav class="week-nav">{f'<a href="../w{n-1}/">← Week {n-1}</a>' if n>1 else ''}<a href="../">All weeks</a><a href="../review/#review-w{n}">Review</a>{f'<a href="../w{n+1}/">Week {n+1} →</a>' if n<14 else ''}</nav></main>'''
  page=shell(B,title,body,'../',assets)
  (ROOT/f'w{n}/index.html').write_text(page)
  redirect(ROOT/f'guide/w{n:02}/index.html',f'../../w{n}/',
           message='The current lesson and its bilingual explanations are together.',
           link=f'Open Week {n}',title=f'Week {n} — AA')
 for folder,page in (('scope',scope_page(B)),('review',review_page(B,Q,tests,homes,display)),('textbook-problems',textbook_page(B))):
  (ROOT/folder).mkdir(exist_ok=True);(ROOT/folder/'index.html').write_text(page)
 probs=sum(1 for arts in groups.values() for a in arts if 'class="ask"' in a)
 home=f'''<main class="home" id="main">
<section class="hero">
<div class="hero-text">
<p class="eyebrow">Algorithm Analysis &middot; Dr. Arif Solmaz</p>
<h1>Fourteen weeks,<br>one page each.</h1>
<p class="lede">Every week holds its lesson, animations, practice questions and notes on a single page. Pick the week you are on — or carry on from where you stopped.</p>
<p class="hero-actions"><a class="btn btn-primary" href="w1/" data-resume>Start with week 01 <span aria-hidden="true">&rarr;</span></a><a class="btn" href="#schedule">See all weeks</a></p>
</div>
<aside class="facts" aria-labelledby="facts-title">
<h2 class="facts-title" id="facts-title">How the course is assessed</h2>
<dl><div><dt>Midterm</dt><dd><b>50%</b> &middot; weeks 1&ndash;7</dd></div><div><dt>Final</dt><dd><b>50%</b> &middot; weeks 1&ndash;14, emphasis on 8&ndash;14</dd></div><div><dt>Weekly practice</dt><dd>Ungraded. Nothing to upload.</dd></div><div><dt>Prerequisite</dt><dd>No prior Python. Python help sits in each week&rsquo;s Notes view.</dd></div></dl>
<a class="doc-link" href="resources/algorithm-analysis-english-turkish-skiena-cse373.docx?v=aligned"><span class="doc-icon" aria-hidden="true">&darr;</span><span><b>Course document</b><small>Bilingual English &middot; Turkish, .docx — lectures 1&ndash;22</small></span></a>
</aside>
</section>
<section class="schedule" id="schedule" aria-labelledby="schedule-title">
<div class="section-head"><h2 id="schedule-title">The schedule</h2>
<div class="progress" data-progress hidden><div class="progress-track"><div class="progress-fill"></div></div><p class="progress-label"><span data-progress-label></span> <button class="progress-reset" type="button" data-progress-reset>Clear</button></p></div></div>
{term_block("Weeks 01&ndash;07","Midterm scope",[c for c in rows if c[0] in MIDTERM_WEEKS],1)}
{term_block("Weeks 08&ndash;14","Final emphasis",[c for c in rows if c[0] in FINAL_EMPHASIS],8)}
<p class="term-note">Ticking a week is for your own bookkeeping only. It is stored in this browser, is never uploaded, and has no effect on your grade.</p>
</section>
<section class="resources" aria-labelledby="resources-title">
<h2 id="resources-title">When you revise</h2>
<ul class="res-grid">
<li><a href="scope/"><h3>What the exams cover</h3><p>Core topics and reading-only topics, exam by exam.</p><span class="res-go" aria-hidden="true">Open &rarr;</span></a></li>
<li><a href="review/"><h3>Cumulative review</h3><p>One pass over the whole course: what you should be able to do each week, the worked problems to retrieve from memory, and the quick checks later weeks reuse.</p><span class="res-go" aria-hidden="true">Open &rarr;</span></a></li>
<li><a href="textbook-problems/"><h3>Additional textbook problems</h3><p>{probs} problems from the textbook&rsquo;s analysis chapter, restated in plain words and solved in full. Not homework.</p><span class="res-go" aria-hidden="true">Open &rarr;</span></a></li>
</ul>
</section>
</main>'''
 (ROOT/'index.html').write_text(shell(B,'Algorithm Analysis',home,'',sheets=('home.css?v=1',),scripts=('home.js?v=1',)))
 consolidate_routes()
 (ROOT/'COURSE_GUIDE.md').write_text('# Algorithm Analysis\n\nThe main route follows the supplied Skiena lecture notes. No prior Python is required.\n\n'+ '\n'.join(f'- Week {n}: {x["title"]} — document lectures {", ".join(map(str,x["lectures"]))}' for n,x in enumerate(WEEKS,1))+'\n\nCurrent lessons: w1/ through w14/. Bilingual explanations and answers are embedded in each lesson. Python help, animations and references are inside the matching weekly page. Exam scope: scope/. Cumulative review: review/. Additional textbook problems: textbook-problems/. Older library addresses redirect to that route.\n')
 print('Built 14 aligned lessons, dashboard, scope, review, textbook-problems and reference routes.')
