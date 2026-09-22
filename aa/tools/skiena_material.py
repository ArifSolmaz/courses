"""Adapt the supplied CSE 373 beginner notes to the existing AA sequence.

Source exercises keep their original numbers. Advanced content stays optional.
See materials/README.md for provenance, placement and editorial decisions.
"""
from pathlib import Path
import html
import json

HERE = Path(__file__).resolve().parent
EXERCISES = {x['id']: x for x in json.loads((HERE/'materials/skiena_exercises.json').read_text())}
# Each source exercise has exactly one home. First item is the focused class problem.
WEEK_EXERCISES = {
 1:[4,1,3,5,17,29,30], 2:[2,7], 3:[18,13,19,20], 4:[33,32,34,44],
 5:[8], 6:[22,12,26], 7:[90,6,24], 8:[15,9,10,11,14,16,21,25,27,28,31],
 9:[56,55], 10:[45,35,36,43,46,47,48,61,63], 11:[53,41,42,54,60,62],
 12:[52,37,38,39,40,49,50,51,57,59],
 14:[97,65,83,87,88],
}
_used={i for ids in WEEK_EXERCISES.values() for i in ids}
WEEK_EXERCISES[13]=[72]+[i for i in range(1,98) if i not in _used and i!=72]
assert sorted(i for ids in WEEK_EXERCISES.values() for i in ids)==list(range(1,98))

# title, source lectures, concise explanation, engineering transfer, evidence to keep
WEEK_NOTES = {
1:('Test a robot route with a small example',[1],
'''<p>A robot visits solder points on a circuit board and returns to its start. “Choose the nearest unvisited point” sounds sensible, but a shorter move now can force a longer move later. Before writing code, say which inputs are allowed, how distance is measured and whether the route must return home.</p><p>On a line, any closed route visiting both extremes travels at least twice their separation. That gives a lower bound: a distance no valid route can beat. A sweep from one extreme to the other and back can reach it. Compare the nearest-neighbour trace in the investigation with that bound. One failing example (a counterexample) disproves the claim that the rule always gives the best route. Many successful tests do not prove that claim.</p>''',
'If an AI proposes a routing rule, ask what it tries to minimise, how it chooses between equal options, and whether a small example can show it fails.',
'A route sketch, both distances, and one sentence stating exactly which claim failed.'),
2:('Write the input and output before the program',[1,2],
'''<p>An algorithm gives steps for a range of possible inputs. A program puts those steps into code. Sorting means returning the same items in order from smallest to largest, allowing equal values; it does not mean printing a particular example. Write names for the input, its size and the output before you choose Python statements.</p><p>For sensor records, specify what is being ordered: timestamp, temperature or sensor identifier. Repeated readings are still separate records. Printing a plausible list is not enough: the output must preserve every record as well as satisfy the ordering rule.</p><p>Later we will use the RAM model: a simplified way to count basic computer operations. For now, notice that <code>x = a + b</code> performs a fixed amount of work on values whose size is kept fixed, while an instruction such as “sort all readings” hides work that grows with the data.</p>''',
'Ask a teammate to check your output specification without seeing your code.',
'Three lines describing the input and required output, plus a small example with repeated values.'),
3:('Count a loop by drawing its work',[2,3],
'''<p>Do not count indentation levels alone. Draw one mark for each execution of the operation you care about. If the outer counter runs from 1 to n and the inner counter runs from 1 to that outer counter, the rows contain 1, 2, …, n marks. At n = 4 there are 10 marks, not 16.</p><p>The total is n(n + 1)/2. Pair the first and last rows, then the second and second-last: each pair has n + 1 marks. A full rectangular pair of loops has n² marks instead. Both eventually grow quadratically, but their exact counts differ.</p><p>A doubling counter follows a different pattern: 1, 2, 4, 8, … . Count the doublings rather than the size of the final value. We will attach the formal growth notation in Week 8.</p>''',
'For a collision check between parts, distinguish pairs counted in both orders, pairs counted only once, and a part paired with itself.',
'A hand-drawn trace at n = 4 and the operation being counted.'),
4:('The order of service changes the system',[4],
'''<p>A list stores items, but a stack or queue also specifies which item leaves next. A stack removes the most recently added item; a queue removes the earliest. These rules describe what comes out next, whatever code stores the items.</p><p>Imagine three inspection jobs arriving as 1, 2 and 3. A stack (last in, first out) returns 3 then 2. A queue (first in, first out) returns 1 then 2. The same stored values produce different behaviour because the service rule changed.</p><p>A Python list gives direct access to a position. A linked list reaches a position by following links. Both can grow, but they pay different costs for access and rearrangement. Do not assume that a container's name proves it is appropriate for the job.</p>''',
'Choose a service rule for inspection jobs and a different rule for undoing a sequence of edits. Explain the consequence of each.',
'Two short service traces and an explanation of which job waits longest.'),
5:('A stopwatch answers a question about an input',[2,3],
'''<p>The notes separate best, worst and average cost over inputs of the same size. A timing measurement is one observation on one machine, implementation and input. One run does not tell you the best, worst or average time across all inputs of that size.</p><p>Searching a hundred readings can stop at the first reading, stop at the last, or exhaust the list without finding the target. Keep n fixed and compare those cases. Repeat measurements and record what setup work you included. The worst observed time is evidence about your trials, not proof of the worst possible time.</p><p>Counting how many operations the method needs helps explain the measured time. A real controller deadline additionally depends on the computer, memory access and other tasks running at the same time.</p>''',
'Write “largest time in these trials” rather than “guaranteed maximum” unless you have established that guarantee.',
'A timing table with positions of the target, including a missing target, repeat count, units and one limitation.'),
6:('Predict a larger case, then test it',[2,3],
'''<p>If time is approximately proportional to n², doubling n predicts four times the time. If it is proportional to n, doubling predicts twice the time. These are model predictions to test against fresh observations.</p><p>Suppose 1,000 records take one second. At 10,000 records, a quadratic model predicts 100 seconds. An n log₂ n model predicts about 13.3 seconds. The same starting measurement supports very different forecasts until you identify the growth pattern.</p><p>Big-Theta describes the growth pattern, but does not give an exact timing ratio for particular input sizes. These estimates assume the same speed per unit of work and smaller terms that matter little. Record the difference between the predicted and measured time (the residual)—and investigate when the model stops fitting.</p>''',
'Before increasing a sensor log tenfold, predict processing time and memory use. Test a smaller increase first.',
'A prediction, a measured result, and the assumption that would most threaten the forecast.'),
7:('Prove that some work cannot be avoided',[1,2,3],
'''<p>To find the maximum of n distinct readings using comparisons, every reading except the winner must lose at least one comparison. A comparison can create only one new loser. Therefore at least n − 1 comparisons are necessary in the worst case.</p><p>A single scan achieves n − 1 comparisons, so its comparison count meets the lower bound. This is stronger than saying “my code looks short”: it explains why a different method that finds the answer by comparing values cannot remove that work.</p><p>State your model. The argument counts comparisons on distinct values; it does not count every instruction or memory access. To prove the answer and the count, state your assumptions, check the starting case, and explain why each next step keeps the claim true.</p>''',
'Use a maximum-temperature scan to separate a proof of the returned value from a claim about controller timing.',
'A comparison tournament for five readings and a sentence explaining why four comparisons are unavoidable.'),
8:('Show where a growth limit starts to hold',[2,3],
'''<p>Big-O gives an upper limit on growth once the input is large enough. To show 2n² + 6n is O(n²), choose c = 3 and n₀ = 6. For n ≥ 6, the linear term 6n is at most n², so the whole expression is at most 3n².</p><p>Big-Omega gives a lower limit on growth for large enough inputs. Big-Theta means the upper and lower limits have the same growth pattern. A quadratic function is also O(n³), but that upper bound is loose. Naming a bound is different from selecting a best, average or worst input case: apply the notation to the input case and type of work you chose to count.</p><p>Test your reasoning with a claim that fails. If n² were O(n), then n² ≤ cn would imply n ≤ c for every sufficiently large n. No fixed c can satisfy that.</p>''',
'When an AI labels a loop O(n), require it to define n, identify the repeated operation and justify the bound.',
'A valid constant/threshold pair and a counterargument to one incorrect bound.'),
9:('Compare whole strategies, including preparation',[6,7,8],
'''<p>The notes use sorting and hashing to turn repeated searching into organised work. To find two records whose values sum to T, one strategy sorts then moves pointers inward; another remembers earlier values in a hash set and looks for T − x.</p><p>Preparation matters. Sorting is part of the first method's total cost. Hashing needs extra storage, hashing that spreads keys well across storage slots and a rule that prevents using one record twice. Check the complement before inserting the current record, or track counts explicitly.</p><p>This is the same habit as comparing anagram methods: state the output contract, trace a small case, count the expensive operations, and include setup. A method that is fast on average can still have a slow worst case.</p>''',
'Use paired loads or calibration values as the test case. Include duplicate values and a case with no valid pair.',
'Two traces, their preparation costs, and a reason to prefer one under a stated constraint.'),
10:('Occasional expensive work can hide in an average',[4],
'''<p>A dynamic array is an array that can grow; it keeps some empty slots for new items. In the simplified doubling model, growth copies 1, 2, 4, … items into successively larger arrays. To reach n = 2ᵏ stored items from capacity 1, the copies total n − 1, even though the final resize alone is expensive.</p><p>This gives constant copying cost per append when the total is spread over the whole sequence (amortised cost). It does not make every individual append constant-time. Growing by only ten slots instead repeatedly copies nearly all the items already stored, producing quadratic total copying.</p><p>The exact way Python reserves extra slots depends on its implementation; the doubling model explains the idea rather than specifying its precise behaviour. Keep “amortised over a sequence” separate from “expected over random choices” and “worst case for one operation”.</p>''',
'A data logger may tolerate occasional slow appends. A controller with a strict deadline may not tolerate the pause when storage grows.',
'A capacity/copies table up to 16 items and a statement distinguishing total cost from a single append.'),
11:('A collision is normal; losing a key is a bug',[6],
'''<p>A hash function uses a key to choose a storage slot. Different keys can share a slot, so the program needs a rule for keeping both keys when this happens (a collision). With h(k) = k mod 10, keys 12, 22, 32 and 42 all enter slot 2. Using the remainder after division by 11 instead separates this set, but does not guarantee separation for every set.</p><p>Chaining means keeping several entries at one slot. Open addressing means checking other slots until a suitable one is found. In open addressing, simply clearing a deleted slot can make later keys appear absent; a special “deleted” marker tells the search to keep going.</p><p>Expected O(1) lookup needs a hash function that spreads keys well and a table that is not too full. The worst case can still be linear. For a lookup with a strict time deadline, compare a hashing design with one offering a more predictable bound.</p>''',
'Trace insertion, deletion and lookup on a small sensor-ID table. A passing insertion test does not test deletion correctness.',
'A slot diagram, one collision, and a lookup trace after deletion.'),
12:('Binary search needs more than sorted values',[3,4,5],
'''<p>Binary search repeatedly discards half the positions that might still contain the answer. Its O(log n) search cost requires reaching the middle position in constant time. A sorted array supports that access; a linked list has to walk through links to reach the middle.</p><p>With one candidate, a search may still need a comparison. For a conventional successful binary search on n ≥ 1 array items, the worst comparison count is floor(log₂ n) + 1. “About log n” is useful for growth, but an exact count needs an implementation and a rule for what counts as one comparison.</p><p>A balanced search tree offers a different route: follow one link per level, keeping the number of levels proportional to log n. An ordinary unbalanced tree can become a chain. Sorted data, random insertion order and guaranteed balance are not interchangeable conditions.</p>''',
'Choose between an array of calibration points and a linked record chain by examining the actual access operations.',
'A search trace and a list of the conditions needed for the growth bound you claim.'),
13:('Merge first, then explain the full sort',[3,7,8,9],
'''<p>Merging two sorted lists only compares their next items that have not yet been copied. Each comparison chooses one item to copy to the result. When one list empties, copy the rest without more key comparisons. With n items in total, at most n − 1 comparisons are needed when both lists start nonempty.</p><p>Mergesort merges all n items at each level, across about log₂ n levels. Quicksort splits items around a chosen value, called the pivot, instead: choosing pivots randomly gives expected O(n log n) comparisons in the usual analysis, but repeatedly splitting into very unequal parts can be quadratic. Equal values need care. Three-way partitioning makes separate groups smaller than, equal to and larger than the pivot.</p><p>The lower bound for sorts based only on comparisons does not apply to every kind of sort. Counting sort uses counts within a known value range; radix sort groups values by digits. Check the key range, whether equal-value records must keep their original order and memory cost before claiming a faster solution.</p>''',
'Merge timestamped sensor streams and keep equal-time records in a defined order.',
'A merge trace, its comparison count, and the assumption behind the sort you recommend.'),
14:('Explain a pairing rule by swapping pairs',[1,7,19],
'''<p>Suppose 2n task durations must be paired onto n work stations and the goal is to make the largest pair total as small as possible. Sort the durations and pair the smallest with the largest. A proof can explain why the rule works.</p><p>Take a pairing with the best possible largest total where the smallest a is paired with x and the largest b with y. Replace those pairs by (a,b) and (x,y). Since a ≤ y and x ≤ b, neither new sum exceeds the old sum b + y. The maximum cannot increase. Repeat on the remaining durations.</p><p>The goal matters. This proof covers pairs of two tasks with the goal of reducing the largest total; it does not solve every scheduling problem. When the task changes, check what has changed in the problem before reusing the rule. The optional extension introduces networks, dynamic programming and the limits of exact methods.</p>''',
'For your final design, state the objective, give a small worked case, justify the algorithm, and explain what changes would invalidate the claim.',
'A one-page decision note with a trace, description of the work counted, test results and a limitation.'),
}

def exercise(number, display_number=None):
    x=EXERCISES[number]; ident=f'skiena-ex-{number:03d}'
    answer=html.escape(x['answer']);question=html.escape(x['question'])
    from question_bank import scaffold
    start, worked = scaffold('written', number)
    context = CONTEXT.get(number, '')
    context_html = f'<p class="source-context">{html.escape(context)}</p>' if context else ''
    label = f"Question {display_number}" if display_number is not None else f"Source exercise {number}"
    attribution=f"{label} · {x['level'].lower()}"
    return f'''<article class="source-exercise" id="{ident}"><p class="source-label">{attribution}</p><p>{question}</p>{context_html}{start}<div class="question-answer"><h5>Answer &amp; reasoning</h5>{worked}<p>{answer}</p></div></article>'''


def exercise_choice(number):
    item = EXERCISES[number]
    preview = item['question'][:100] + ('…' if len(item['question']) > 100 else '')
    return f'<details class="source-choice"><summary>Exercise {number} · {item["level"].lower()} — {html.escape(preview)}</summary>{exercise(number)}</details>'


def weekly_material(num):
    title,lectures,body,transfer,evidence=WEEK_NOTES[num]
    lecture_label = 'Lecture' if len(lectures) == 1 else 'Lectures'
    notes=f'''<section class="source-lesson" id="skiena-notes"><p class="source-label">From the beginner notes · {lecture_label} {', '.join(map(str,lectures))}</p><h3>{title}</h3>{body}<p class="engineering-transfer"><strong>Engineering use.</strong> {transfer}</p></section>'''
    ids=WEEK_EXERCISES[num]
    from question_bank import bank, WEEK_MCQ
    focus=bank(WEEK_MCQ[num], ids)
    more=''
    if num==14:
        more+='<details class="path-reference"><summary>Optional next topics: graphs, dynamic programming &amp; hard problems</summary><div><p>These are extensions beyond the 14-week sequence, with explanations and further source exercises. There is no additional submission.</p><a href="../extensions/">Explore one extension →</a></div></details>'
    return notes,focus,more

EXTENSIONS = [
('graphs','Graphs and routes','Lectures 10–14',range(98,135),114,
'''<h3>Model the network before choosing the algorithm</h3>
<p>A graph has vertices for things and edges for relationships. A factory map might use junctions as vertices and traversable aisles as edges. Decide whether travel is directed and whether the weight represents distance, time or energy. A graph model can be wrong even when the algorithm is implemented correctly.</p>
<p>An adjacency matrix uses space proportional to n²; adjacency lists use space proportional to n + m, where n is the number of vertices and m the number of edges. Lists are often convenient for sparse networks. A matrix provides direct edge lookup but also stores the absent connections.</p>
<h3>Explore with a queue or a stack</h3>
<p>Breadth-first search (BFS) uses a queue. It discovers vertices in increasing numbers of edges from the start, so its parent pointers give shortest paths when every edge has the same cost. Depth-first search (DFS) follows one branch deeply before returning, using a stack or recursion. Both take O(n + m) with adjacency lists, but DFS does not generally find shortest paths.</p>
<p>For a disconnected network, restart at an undiscovered vertex to find every component. A two-colouring attempt gives neighbours opposite colours; an edge whose ends have the same colour exposes a conflict. With directed dependencies, a back edge during DFS signals a cycle. Reversing DFS finishing order gives a topological order only when the directed graph is acyclic. Low-link methods extend DFS to articulation vertices or strongly connected components; they need more state than a visited flag.</p>
<h3>Connecting everything is different from finding a route</h3>
<p>A minimum spanning tree (MST) connects all vertices of a connected undirected weighted graph with minimum total edge weight. Prim grows a tree using a cheapest crossing edge. Kruskal considers edges in increasing weight order and uses union-find to reject cycles. An MST minimises the cost of the network, not the distance of every journey through it.</p>
<p>Dijkstra finds shortest paths from one source with nonnegative edge weights. Each relaxation asks whether a route through the current vertex improves a stored distance. With adjacency lists and a binary heap, its cost is O((n + m) log n). Negative edges invalidate its settled-distance argument. For all pairs, Floyd–Warshall considers each possible intermediate vertex: D[i,j] = min(D[i,j], D[i,k] + D[k,j]), taking Θ(n³). Negative cycles require separate detection and make some shortest distances unbounded below.</p>
<h3>Trace one small network</h3>
<p><strong>Graph W:</strong> undirected edges A–B (4), A–C (1), B–C (2), B–D (5), C–D (8), D–E (3), C–E (10). Draw it on paper. Run a shortest-path trace from A, then compare the purpose of that result with a minimum spanning tree.</p>
<p><strong>Engineering question:</strong> Are you minimising the wiring installed, a robot’s travel time, or the number of junctions crossed? Those are three different objectives.</p>'''),
('dynamic','Search and dynamic programming','Lectures 15–18',range(135,171),149,
'''<h3>Search systematically and reject impossible branches</h3>
<p>Backtracking builds a solution one choice at a time. A solution test recognises a complete valid answer; a candidate generator proposes the next choices; a processing step records a finished answer. Undo a choice before trying its alternative. Pruning rejects a partial solution only when no completion of that partial solution can work.</p>
<p>For Sudoku, candidates are values missing from the cell’s row, column and box. Choosing the cell with the fewest candidates often exposes contradictions sooner. The search can still be expensive: pruning improves particular instances without proving a polynomial bound.</p>
<h3>Reuse answers to repeated subproblems</h3>
<p>Naive Fibonacci recursion repeatedly asks for the same smaller values. Memoisation caches each computed answer; bottom-up dynamic programming fills a table in dependency order. Both reduce the number of subproblem evaluations. Counting operations on arbitrarily large integers still requires attention to bit length.</p>
<p>The design questions are: What does one state mean? Which smaller states determine it? What are the base cases? In what order can the states be evaluated? For coin values 1, 3 and 4, let best[a] be the fewest coins for amount a. Set best[0] = 0 and minimise 1 + best[a−coin] over coins that fit. The greedy choice 4 for amount 6 misses the better pair 3 + 3.</p>
<h3>Strings and ordered work</h3>
<p>Edit distance uses the cost of transforming one prefix into another. The final edit is a substitution or match, an insertion, or a deletion. Initialise distances to the empty string by the prefix lengths, then fill each cell from the three neighbouring predecessor states. Save decisions if you need the actual edit sequence, rather than just its cost.</p>
<p>For nonnegative task durations in a fixed order, linear partitioning chooses contiguous ranges to minimise the largest range sum. The last cut separates an already-solved prefix from a final range: minimise the maximum of those two costs over possible cuts. State whether empty ranges are allowed. Similar “choose the last decision” reasoning helps with string cuts, weighted scheduling and egg-dropping strategies.</p>
<h3>The state must contain the information that matters</h3>
<p>The best continuation must depend only on the state you stored. A route through cities needs to remember which cities were already visited; recording only the current city loses essential information. A travelling-salesman DP can use a visited subset and final city, but there are exponentially many subsets. Dynamic programming avoids repeated work; it does not automatically make the number of distinct states small.</p>
<p><strong>Engineering question:</strong> Before caching a planning result, identify what may change: position, battery level, visited tasks or remaining capacity. An incomplete cache key can reuse an answer to the wrong problem.</p>'''),
('limits','Limits and reductions','Lectures 19–22',range(171,206),185,
'''<h3>Specify a yes-or-no question</h3>
<p>“Find the best tour” is an optimisation request. “Is there a tour of length at most K?” is its decision counterpart. P and NP are classes of decision problems: P has polynomial-time solution algorithms; NP has polynomial-size certificates of yes-answers verifiable in polynomial time. Checking a tour means checking its visits and total weight, not proving that it is the shortest.</p>
<h3>Keep the reduction direction straight</h3>
<p>A polynomial reduction A → B translates any instance of A into an instance of B while preserving its answer. A fast algorithm for B would therefore solve A. To show that B is NP-hard, reduce a known hard problem to B. To call B NP-complete, also establish membership in NP. Reducing B to a known hard problem does not prove B hard.</p>
<p>For example, a vertex cover touches every edge. Its complement is an independent set containing no edge. That complementary relationship translates one decision question into the other. Independent sets become cliques in the complement graph. The reduction preserves the required size as well as the yes-or-no answer.</p>
<h3>Use a small gadget you can check</h3>
<p>SAT asks for truth values satisfying every clause. A long clause can be replaced by smaller clauses using fresh variables; the fresh values must be chosen so the transformed formula is satisfiable exactly when the original is. Work through Exercise 185 before trusting a memorised transformation.</p>
<p>In the standard 3-SAT-to-vertex-cover construction, use two opposite literal vertices joined by an edge for each variable, and a triangle of occurrence vertices for each clause. Join each clause occurrence to its matching variable literal. A satisfying assignment selects one true literal per variable and two vertices per triangle; leave out a true clause occurrence, whose cross-edge is then covered from the variable side. The target size is n + 2c.</p>
<p>Subset-sum and partition connect numerical selection problems. A subset-sum table indexed by target T takes O(nT), which is not polynomial in the bit length of a binary-encoded T. Integer programming can encode SAT with 0/1 variables and linear clause constraints. Restriction and local replacement are useful proof techniques, but the target problem’s rules must remain exactly the rules you claim to analyse.</p>
<h3>Make a practical choice without claiming impossibility</h3>
<p>NP-completeness does not prove that every instance takes exponential time, nor that no polynomial algorithm exists. P versus NP remains unresolved. It tells us why a universal efficient exact method would be a major breakthrough. Small-instance backtracking, structural restrictions, approximation and heuristics are practical options with different guarantees.</p>
<p><strong>Engineering question:</strong> State which concession a planner makes: a bounded instance size, a restricted graph, an approximation guarantee, or a heuristic with no optimality guarantee. Test whether the concession is acceptable for the actual machine.</p>''')]

CONTEXT = {
 39:'Exercise 38 uses the BST obtained by inserting 50, 30, 70, 20, 40, 60, 80 in that order.',
 77:'Use zero-based Lomuto partitioning: scan all items before the last pivot, swapping each item strictly less than the pivot into the next low slot, then swap the pivot into that slot.',
 96:'Use the two-way partition described in Exercise 77: only values strictly less than the last-element pivot enter the low partition.',
 102:'Use the undirected graph with edges 1–2, 1–3, 2–4, 3–4, 4–5; visit neighbours in increasing order.',
 118:'Use the DAG with edges 1→2, 1→3, 2→4, 3→4, 4→5, 3→5.',
 178:'Use the path graph with vertices 1, 2, 3, 4 and edges 1–2, 2–3, 3–4.',
 169:'Each fixed-time job has a fee; choose nonoverlapping jobs to maximise total fee, rather than the number of jobs. Define compatibility consistently; adjacent jobs may share a boundary if their intervals are half-open.',
}

def extension_body():
    intro='''<div class="hero"><p class="eyebrow">Optional · after the core sequence</p><h1>Choose one deeper question.</h1><p class="lede">Networks, repeated subproblems, and the limits of exact algorithms. These topics extend the supplied beginner notes; they do not add weeks, deadlines or required submissions.</p><a href="../w14/#check">← Return to Week 14</a></div>'''
    from question_bank import bank, EXTENSION_MCQ
    panels=[]
    for key,title,lectures,ids,focus,notes in EXTENSIONS:
        questions = bank(EXTENSION_MCQ[key], ids, ident=f'{key}-questions')
        panels.append(f'<section class="extension-chapter" id="{key}"><h2>{title}</h2><p class="source-label">{lectures} · optional extension</p><div class="source-lesson">{notes}</div>{questions}</section>')
    return intro+'<div class="continuous-lesson">'+''.join(panels)+'</div>'
