from pathlib import Path
import html,json,re,sys
from .course import WEEKS
from .visuals import figure, CODES
from .compact import animation_content, consolidate_routes
E=html.escape
ROOT=Path(__file__).resolve().parents[2]
DATA=Path(__file__).parent
LECTURES=json.loads((DATA/'lectures.json').read_text())
# Exact placement of existing source tests. Selected earlier tests serve as review.
TESTS={1:[1,2,3,4,20,121,122,123,124,125],2:[5,6,7,8,11,14,15,17,18,19],3:[9,10,12,13,16,17,18,7,8,5],4:[21,22,23,24,29,30,31,32,126,127],5:list(range(25,29))+list(range(33,41)),6:[41,42,43,44,50,51,52,21,22,31],7:[45,46,48,53,54,55,56,60,16,10],8:[47,49,57,58,59,7,11,14,19,128],9:[61,62,63,64,65,66,67,71,129,130],10:[68,72,73,75,76,77,78,66,131,132],11:[69,70,74,79,80,65,63,133,134,135],12:[81,82,83,84,85,86,87,93,99,136],13:[88,89,90,91,92,94,95,96,97,98,100],14:list(range(101,121))}
# Every original written exercise has one primary home; advanced problems stay clearly marked.
WRITTEN={1:[1,2,3,4,5,6,17,29,30],2:[7,8,9,10,11,14,15,16,21,22,25,26,27,28],3:[12,13,18,19,20,23,24,90,95],4:[32,33,34,43,44,45,46,47,48,61],5:[35,36,37,38,39,40,41,42,49,50,51,52,53,54,55,56,57,58,59,60,62,63,64],6:[65,66,67,68,69,70,76,78,79,83,92,93,94,97],7:[31,71,72,73,75,77,80,81,82,87,88,96],8:[74,84,85,86,89,91],9:[98,99,100,101,103,105,106,124,126,128,129],10:[102,104,107,108,111,112,113,115,117,118,119,121,125,127,130,131,133,134],11:[109,110,114,116,120,122,123,132],12:[135,136,137,138,139,140,141,142,148,155,156,157,161,168],13:[143,144,145,146,147,149,150,151,152,153,154,158,159,160,162,163,164,165,166,167,169,170],14:list(range(171,206))}
assert sorted(n for a in WRITTEN.values() for n in a)==list(range(1,206))
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

def configure():
 import question_bank as Q
 for ident,q,options,correct,answer in NEW:
  # Use a separate ID range from the earlier course-authored Python questions.
  newid=ident+1000
  Q.MCQ[newid]={'id':newid,'question':q,'options':options,'correct':correct,'answer':answer,'level':'Easy','origin':'course'}
 return Q

def shell(B,title,body,base):
 body=body.replace('<main ', '<div ').replace('</main>', '</div>')
 head=B.HEAD.format(title=E(title)+' — AA',desc=E(title),base=base)
 head=re.sub(r'<nav class="header-nav">.*?</nav>', '<button class="hlink" data-theme-toggle type="button">Light / dark</button>', head, flags=re.S)
 return head.replace('</head>',f'<link rel="stylesheet" href="{base}assets/aligned.css?v=compact"><script defer src="{base}assets/compact.js?v=1"></script></head>')+body+B.FOOT.format(site='Algorithm Analysis',base=base)

def build(B):
 Q=configure()
 rows=[]
 for n,(title,lectures,summary,question,example,steps,edge,python) in enumerate(WEEKS,1):
  reading='Lectures '+', '.join(map(str,lectures)) if len(lectures)>1 else f'Lecture {lectures[0]}'
  rows.append(f'<tr><td>{n:02}</td><td><strong>{E(title)}</strong><small class="reading">Document: {reading}</small></td><td><a href="w{n}/">Open →</a></td></tr>')
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
  tests=[x+1000 if 121<=x<=136 else x for x in TESTS[n]]
  bank=Q.bank(tests,WRITTEN[n],title='Practice with answers')
  bank=bank.replace('· hard','· hard · optional challenge')
  if n in (10,11): bank='<p>'+E(Q.GRAPH_W)+'</p>'+bank
  # Preserve original cross-references even though visible question numbering is weekly.
  homes={q:w for w,qs in WRITTEN.items() for q in qs}
  bank=re.sub(r'(?i)exercise (\d+)',lambda m: f'<a href="../w{homes[int(m[1])]}/#skiena-ex-{int(m[1]):03}">source exercise {m[1]}</a>' if int(m[1]) in homes else m[0],bank)
  animations,assets=animation_content(n)
  # Additional textbook solutions stay inside their topic week, not a separate site.
  textbook=json.loads((DATA/'textbook-problems.json').read_text())
  def textbook_week(article):
   match=re.search(r'id="p2-(\d+)"',article)
   k=int(match[1]) if match else 53
   return 3 if k<=6 or 25<=k<=42 else 2 if k<=24 else 14
  more=''.join(x for x in textbook if textbook_week(x)==n)
  if more:more='<details><summary>Additional textbook problems with solutions</summary>'+more+'</details>'
  body=f'''<main class="aligned compact-week"><header class="week-heading"><p class="eyebrow">Week {n:02} · {reading}</p><h1>{E(title)}</h1><p>{E(summary)}</p></header>
<nav class="week-tabs" aria-label="Weekly content"><button id="tab-lesson" data-week-tab="lesson">Lesson</button><button id="tab-practice" data-week-tab="practice">Practice</button><button id="tab-notes" data-week-tab="notes">Notes</button></nav>
<section id="lesson" class="week-panel"><h2>{E(question)}</h2><p class="problem">{E(example)}</p>{figure(n)}<div class="trace" aria-label="Worked solution steps">{''.join(f'<article><span>Step {i}</span><p>{E(step)}</p></article>' for i,step in enumerate(steps,1))}</div><p class="edge"><strong>Change the case.</strong> {E(edge)}</p>{animations}</section>
<section id="practice" class="week-panel"><p>Questions and answers are together. Hard questions are optional; some tests revisit earlier ideas.</p>{bank}</section>
<section id="notes" class="week-panel"><details class="reading-card"><summary>Document reading · {reading}</summary><ul>{''.join(core)}</ul><p><a href="../resources/algorithm-analysis-english-turkish-skiena-cse373.docx?v=aligned">Download the complete bilingual document</a></p></details><details><summary>Python explained for this lesson</summary><p>{E(python)}</p><pre><code>{E(CODES[n])}</code></pre><p>Predict the result, then run the demonstration. No prior Python fluency is required for the paper trace.</p></details><details class="reading-reference"><summary>English–Turkish explanations</summary>{''.join(depth)}</details>{more}</section>
<nav class="week-nav">{f'<a href="../w{n-1}/">← Week {n-1}</a>' if n>1 else ''}<a href="../">All weeks</a>{f'<a href="../w{n+1}/">Week {n+1} →</a>' if n<14 else ''}</nav></main>'''
  page=shell(B,title,body,'../').replace('</head>',assets+'</head>')
  (ROOT/f'w{n}/index.html').write_text(page)
  target=ROOT/f'guide/w{n:02}/index.html'
  target.write_text(f'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../../w{n}/"><title>Week {n} — AA</title><p>The current lesson and its bilingual explanations are together: <a href="../../w{n}/">Open Week {n}</a>.</p>')
 home=f'''<main class="course-dashboard compact-dashboard"><header class="dashboard-intro"><p class="eyebrow">AA · Dr. Arif Solmaz</p><h1>Algorithm Analysis</h1><p>Choose your week. Its lesson, animations, questions and notes are all on one page.</p></header><section class="course-schedule" id="weeks"><table><thead><tr><th>Week</th><th>Topic · Skiena reading</th><th></th></tr></thead><tbody>{''.join(rows)}</tbody></table></section><details id="course-info"><summary>Course information</summary><p>No prior Python knowledge is required. Python help is inside each week’s Notes view. Document lectures 1–22 are grouped into 14 weeks.</p><p>Assessment: midterm 50%, final 50%. Weekly practice is ungraded, with no upload required. Optional challenges are enrichment; exam scope is confirmed in class.</p><p><a href="resources/algorithm-analysis-english-turkish-skiena-cse373.docx?v=aligned">Download the bilingual course document</a></p></details></main>'''
 (ROOT/'index.html').write_text(shell(B,'Algorithm Analysis',home,''))
 consolidate_routes()
 (ROOT/'COURSE_GUIDE.md').write_text('# Algorithm Analysis\n\nThe main route follows the supplied Skiena lecture notes. No prior Python is required.\n\n'+ '\n'.join(f'- Week {n}: {x[0]} — document lectures {", ".join(map(str,x[1]))}' for n,x in enumerate(WEEKS,1))+'\n\nCurrent lessons: w1/ through w14/. Bilingual explanations and answers are embedded in each lesson. Python help, animations and references are inside the matching weekly page. Older library addresses redirect to that route.\n')
 print('Built 14 aligned lessons, dashboard and reference routes.')
