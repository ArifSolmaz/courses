"""Examinable theory added to the 14-week course: invariants, amortised analysis,
solving recurrences, BFS/Dijkstra correctness, the cut property and Bellman–Ford.

THEORY[week]   HTML rendered inside the Lesson view after the worked examples.
NEW_MCQ        (id, question, [4 options], correct letter, explanation), ids 2001–2099.
NEW_WRITTEN    written questions in the skiena_exercises.json dict format, ids 301–399.
EXTRA_TESTS / EXTRA_WRITTEN   which week shows which new questions.
Question and answer strings are plain text; the question bank escapes them.
"""

TAG = '<p class="scope-tag">Core · examinable</p>'

THEORY = {}

# ---------------------------------------------------------------- Week 3
THEORY[3] = f'''<section class="theory"><h2>Theory: loop invariants</h2>
<article><h3>A loop invariant for insertion sort</h3>{TAG}
<p>Tracing shows that insertion sort works on one input. An invariant shows that it works on every input. An invariant is a sentence about the loop that is true before every iteration.</p>
<p class="formula">Invariant: at the start of the outer iteration with index i, the prefix s[0 … i−1] holds the first i input items, in sorted order.</p>
<p>Check it on s = [5, 2, 4, 1] (outer loop i = 1, 2, 3; inner loop slides s[i] left while it is smaller than its left neighbour).</p>
<ol>
<li><strong>Initialisation.</strong> Before i = 1 the prefix is s[0 … 0] = [5]. One item is trivially sorted. True.</li>
<li><strong>Maintenance, i = 1.</strong> Prefix [5] is sorted. The item 2 slides left past 5: [2, 5, 4, 1]. The new prefix [2, 5] is sorted and holds the first two items. True before i = 2.</li>
<li><strong>Maintenance, i = 2.</strong> The item 4 slides past 5 and stops at 2: [2, 4, 5, 1]. Prefix [2, 4, 5] is sorted. True before i = 3.</li>
<li><strong>Maintenance, i = 3.</strong> The item 1 slides past 5, 4 and 2: [1, 2, 4, 5]. Prefix of length 4 is sorted.</li>
<li><strong>Termination.</strong> The loop stops when i = n. The invariant with i = n says: s[0 … n−1] holds all n items, sorted. That is exactly the specification of sorting.</li>
</ol>
<p>The general argument is the same. Sliding s[i] left stops at the first smaller item, so the sorted prefix gains one item and stays sorted. Nothing else in the array changes.</p>
<p class="edge"><strong>Change the case.</strong> Selection sort has a different invariant: s[0 … i−1] holds the i smallest items, sorted, and every item in s[i … n−1] is at least as large. The extra clause is needed because selection sort never moves an item back into the prefix.</p>
</article>
<article><h3>Why an invariant is a proof and a test is not</h3>{TAG}
<p>A test runs the code on one input and looks at one output. It can show that the code is wrong; it cannot show that the code is right, because there are infinitely many inputs. An invariant is a statement about every iteration on every input. Initialisation covers the first iteration, maintenance covers each step to the next, and termination turns the invariant into the specification. This is induction on the loop counter. The trace on [5, 2, 4, 1] above is not the proof; it only shows what the three parts mean.</p>
<p class="edge"><strong>Change the case.</strong> The invariant "s[0 … i−1] is sorted" alone is too weak: an algorithm that overwrites the prefix with zeros satisfies it. Say which items the prefix holds, not just that they are in order.</p>
</article></section>'''

# ---------------------------------------------------------------- Week 4
THEORY[4] = f'''<section class="theory"><h2>Theory: amortised analysis</h2>
<article><h3>The doubling array: aggregate method</h3>{TAG}
<p>A single append can cost n copies, when the array is full. Yet n appends together cost far less than n². The aggregate method adds the total cost of a whole sequence and divides by its length.</p>
<p>Start with capacity 1 and double when full. Append n = 8 items. Write the copies made at each append.</p>
<ol>
<li>Appends 1–8 each write one item: 8 writes.</li>
<li>The array is full before appends 2, 3, 5 and 9. Copies at those moments: 1, 2, 4 (and 8 at append 9). For n = 8 the copies are 1 + 2 + 4 = 7.</li>
<li>Total for 8 appends: 8 + 7 = 15 &lt; 3 · 8. The Notes give the general count of moves as M ≤ 2n. Adding the n plain writes gives:</li>
</ol>
<p class="formula">cost of n appends ≤ n + 2n = 3n &nbsp;⟹&nbsp; amortised cost per append ≤ 3 = O(1)</p>
<p class="edge"><strong>Change the case.</strong> Grow by a fixed 10 slots instead of doubling. Every tenth append copies the whole array: copies ≈ 10 + 20 + … + n ≈ n²/20. The amortised cost becomes Θ(n). Doubling matters because the copies form a geometric series.</p>
</article>
<article><h3>Stack with multipop: accounting method</h3>{TAG}
<p>Give a stack the operations push, pop and multipop(k), which pops min(k, size) items. One multipop can cost n. The accounting method charges each operation a fixed amortised price and stores the extra as credit on the data structure. The rule: credit is never negative, so total real cost ≤ total amortised cost.</p>
<ol>
<li>Charge push 2 units. One unit pays for the push itself; one unit is left as a credit on the pushed item.</li>
<li>Charge pop and multipop 0 units. Each item removed pays with the credit sitting on it.</li>
<li>Every item on the stack carries exactly one credit, so the credit is never negative. An item cannot be popped twice.</li>
<li>For any sequence of n operations the total real cost ≤ 2 · (number of pushes) ≤ 2n. Amortised O(1) per operation.</li>
</ol>
<p class="formula">real cost of n operations ≤ ∑ amortised charges = 2 · pushes ≤ 2n</p>
<p class="edge"><strong>Change the case.</strong> Add an operation "multipush(k)" that pushes k copies at once and charge it 2 units in total. The credit rule breaks: k items would share two credits. The charge must be 2k, and the amortised cost is no longer constant per operation.</p>
</article>
<article><h3>Amortised O(1) is not worst-case O(1)</h3>{TAG}
<p>Worst-case O(1) means: every single call finishes in constant time. Amortised O(1) means: any sequence of n calls finishes in O(n) time in total, even though one call inside it may be slow. A dynamic array append is amortised O(1) but its worst single call is Θ(n). Array indexing is worst-case O(1). A real-time controller that needs a bound on every call must not trust an amortised figure.</p>
<p class="formula">amortised cost = <span class="frac"><span>total cost of the sequence</span><span>number of operations</span></span>, taken over the worst sequence</p>
<p class="edge"><strong>Change the case.</strong> Amortised is not "average over random inputs". The bound holds for every sequence, including the worst one. Expected cost (Week 5 hashing, Week 7 quicksort) needs a probability assumption; amortised cost needs none.</p>
</article></section>'''

# ---------------------------------------------------------------- Week 7
THEORY[7] = f'''<section class="theory"><h2>Theory: solving recurrences</h2>
<article><h3>Reading a recurrence off code</h3>{TAG}
<p>A recurrence gives the cost for n in terms of smaller sizes. Write one T(·) term per recursive call, plus the work outside the calls.</p>
<ol>
<li><strong>Binary search.</strong> One comparison, then one call on half the array: T(n) = T(n/2) + 1.</li>
<li><strong>Mergesort.</strong> Two calls on halves, then a merge that touches every item: T(n) = 2T(n/2) + n.</li>
<li><strong>Selection sort written recursively.</strong> Find the minimum of n items (n work), then sort the remaining n−1: T(n) = T(n−1) + n.</li>
<li>Always add the base case, for example T(1) = 1. Without it the recurrence has no value.</li>
</ol>
<p class="edge"><strong>Change the case.</strong> Two calls on n−1 (close to naive Fibonacci, Week 12) give T(n) = 2T(n−1) + 1, which is exponential. Two calls on halves look similar in code but behave completely differently.</p>
</article>
<article><h3>Recursion-tree method</h3>{TAG}
<p>Draw the calls as a tree. Each level has some number of calls of some size. Add the work per level, then add the levels.</p>
<p>Mergesort, T(n) = 2T(n/2) + n, with T(1) = 1:</p>
<table><thead><tr><th>Level</th><th>Size</th><th>Calls</th><th>Work per call</th><th>Work per level</th></tr></thead>
<tbody><tr><td>0</td><td>n</td><td>1</td><td>n</td><td>n</td></tr>
<tr><td>1</td><td>n/2</td><td>2</td><td>n/2</td><td>n</td></tr>
<tr><td>2</td><td>n/4</td><td>4</td><td>n/4</td><td>n</td></tr>
<tr><td>k</td><td>n/2<sup>k</sup></td><td>2<sup>k</sup></td><td>n/2<sup>k</sup></td><td>n</td></tr>
<tr><td>lg n</td><td>1</td><td>n</td><td>1</td><td>n</td></tr></tbody></table>
<p class="formula">T(n) = n · (lg n + 1) = Θ(n lg n)</p>
<p>Binary search, T(n) = T(n/2) + 1: one call per level, work 1 per level, lg n + 1 levels.</p>
<table><thead><tr><th>Level</th><th>Size</th><th>Calls</th><th>Work per level</th></tr></thead>
<tbody><tr><td>0</td><td>n</td><td>1</td><td>1</td></tr><tr><td>1</td><td>n/2</td><td>1</td><td>1</td></tr><tr><td>k</td><td>n/2<sup>k</sup></td><td>1</td><td>1</td></tr><tr><td>lg n</td><td>1</td><td>1</td><td>1</td></tr></tbody></table>
<p class="formula">T(n) = lg n + 1 = Θ(lg n)</p>
<p class="edge"><strong>Change the case.</strong> T(n) = T(n/2) + n: work per level is n, n/2, n/4, …, a geometric series below 2n, so T(n) = Θ(n). Building a heap bottom-up (Week 6) sums the same kind of shrinking series and costs O(n).</p>
</article>
<article><h3>Substitution method</h3>{TAG}
<p>Guess the answer, then prove it by induction on n. The recursion tree suggests the guess; substitution confirms it.</p>
<p>Claim: T(n) = 2T(n/2) + n satisfies T(n) ≤ c · n lg n for some constant c and all n ≥ 2.</p>
<ol>
<li><strong>Hypothesis.</strong> Assume T(m) ≤ c · m lg m for every m &lt; n, in particular for m = n/2.</li>
<li><strong>Substitute.</strong> T(n) ≤ 2 · c(n/2) lg(n/2) + n = c n (lg n − 1) + n = c n lg n − c n + n.</li>
<li><strong>Close the bound.</strong> c n lg n − c n + n ≤ c n lg n whenever c ≥ 1. Choose c = 1 (or larger to cover the base cases). The claim holds for n.</li>
<li><strong>Base.</strong> T(2) = 2T(1) + 2 = 4 ≤ c · 2 · 1 needs c ≥ 2. Take c = 2. So T(n) = O(n lg n).</li>
</ol>
<p class="formula">2c<span class="frac"><span>n</span><span>2</span></span>lg<span class="frac"><span>n</span><span>2</span></span> + n = c n lg n − (c − 1) n ≤ c n lg n</p>
<p class="edge"><strong>Change the case.</strong> Guess T(n) ≤ c n instead. Substitution gives 2 · c(n/2) + n = c n + n, never ≤ c n. The induction fails, so the guess was too small.</p>
</article>
<article><h3>Master theorem, light form</h3>{TAG}
<p>Many divide-and-conquer recurrences have the shape below. Compare the split work n<sup>d</sup> with the number of leaves n<sup>log<sub>b</sub> a</sup>.</p>
<p class="formula">T(n) = a T(n/b) + n<sup>d</sup>, &nbsp;a ≥ 1, b &gt; 1, d ≥ 0</p>
<ol>
<li><strong>d &gt; log<sub>b</sub> a:</strong> T(n) = Θ(n<sup>d</sup>). The top level dominates. Example T(n) = T(n/2) + n: a = 1, b = 2, log₂1 = 0 &lt; 1.</li>
<li><strong>d = log<sub>b</sub> a:</strong> T(n) = Θ(n<sup>d</sup> lg n). Every level costs the same. Mergesort: a = 2, b = 2, d = 1, log₂2 = 1. Binary search: a = 1, b = 2, d = 0, log₂1 = 0: Θ(lg n).</li>
<li><strong>d &lt; log<sub>b</sub> a:</strong> T(n) = Θ(n<sup>log<sub>b</sub> a</sup>). The leaves dominate. Karatsuba-style T(n) = 3T(n/2) + n: log₂3 ≈ 1.585 &gt; 1, so Θ(n<sup>1.585</sup>). Strassen (optional) 7T(n/2) + n²: log₂7 ≈ 2.81 &gt; 2, so Θ(n<sup>2.81</sup>).</li>
</ol>
<p class="edge"><strong>Change the case.</strong> T(n) = T(n−1) + n does not fit the shape: the size shrinks by subtraction, not division. Unroll it: n + (n−1) + … + 1 = Θ(n²). The binomial and Fibonacci recurrences of Weeks 12–13 also subtract, so use unrolling or a table count there.</p>
</article>
<article><h3>Common mistakes</h3>{TAG}
<ul>
<li><strong>Dropping the + n.</strong> 2T(n/2) alone gives Θ(n); with + n it gives Θ(n lg n). The non-recursive work often decides the answer.</li>
<li><strong>Forgetting base cases.</strong> A recurrence without T(1) is a shape, not a function. Substitution proofs also need a base that satisfies the chosen c.</li>
<li><strong>Mixing logarithm bases.</strong> Inside Θ(·) the base does not matter: lg n = Θ(ln n). Inside an exponent it does: n<sup>log₂3</sup> ≠ n<sup>log₃3</sup>.</li>
<li><strong>Counting calls as size.</strong> 2T(n−1) doubles the calls, 2T(n/2) halves the size. Only the second is n lg n.</li>
</ul>
<p class="edge"><strong>Change the case.</strong> An unequal split such as T(n) = T(n/3) + T(2n/3) + n still costs n per level with depth log<sub>3/2</sub> n: still Θ(n lg n).</p>
</article></section>'''

# ---------------------------------------------------------------- Week 8
THEORY[8] = f'''<section class="theory"><h2>Theory: why BFS distances are correct</h2>
<article><h3>The BFS distance invariant</h3>{TAG}
<p>BFS sets dist[v] = dist[u] + 1 when u discovers v. Why is that the true shortest edge count? The queue processes vertices in levels, and the invariant makes this precise.</p>
<p class="formula">Invariant: when v leaves the queue, dist[v] equals the true shortest edge count from the source, and the queue holds only vertices with dist = k or k + 1, in that order.</p>
<p>Argument on levels, with δ(v) the true distance.</p>
<ol>
<li><strong>Level 0.</strong> The source s leaves the queue first with dist[s] = 0 = δ(s). Its neighbours are enqueued with dist 1; they are exactly the vertices with δ = 1, because every vertex at distance 1 is adjacent to s.</li>
<li><strong>Levels in order.</strong> Suppose every vertex with δ ≤ k has been enqueued with the correct dist, and all dist-k vertices sit in the queue before any dist-(k+1) vertex. Processing them enqueues their undiscovered neighbours with dist k + 1. Any vertex v with δ(v) = k + 1 has a neighbour u with δ(u) = k, so v is discovered from some level-k vertex, if not earlier. It cannot be discovered earlier, because a discoverer at level j &lt; k would give a path of length j + 1 &lt; k + 1.</li>
<li><strong>Every vertex.</strong> By induction on k, each reachable vertex gets dist = δ when it is enqueued, and dist never changes afterwards. Unreachable vertices keep ∞.</li>
</ol>
<p>The argument needs a FIFO queue: the level-k vertices must all leave before any level-(k+1) vertex, so a longer path never claims a vertex first.</p>
<p class="edge"><strong>Change the case.</strong> Mark vertices discovered on enqueue, not on dequeue. If marking waits until dequeue, a vertex with several level-k neighbours is enqueued several times. Distances stay correct, but the queue can hold Θ(m) entries and the running time is no longer O(n + m). With a stack instead of a queue (DFS, Week 9) the invariant fails entirely: the first path found may be long.</p>
</article></section>'''

# ---------------------------------------------------------------- Week 10
THEORY[10] = f'''<section class="theory"><h2>Theory: the cut property and union-find</h2>
<article><h3>The cut property</h3>{TAG}
<p>Prim and Kruskal are greedy. They never undo a choice. The cut property is the reason greedy choices are safe for minimum spanning trees.</p>
<p class="formula">Cut property: split the vertices into two non-empty sets S and V∖S. If e is a lightest edge with one end in each set, then some MST contains e.</p>
<p>Exchange argument. Take any MST T. If e ∈ T, done. Otherwise adding e to T closes a cycle. The cycle starts in S and returns to S, so it crosses the cut at least twice; one crossing is e, another is some tree edge f. Remove f and keep e: T − f + e is still connected, still has n − 1 edges, so it is a spanning tree, and its weight is w(T) − w(f) + w(e) ≤ w(T) because e is lightest across the cut. So T − f + e is also an MST, and it contains e.</p>
<ol>
<li><strong>Prim.</strong> The cut is (tree vertices, non-tree vertices). Prim adds the lightest edge across it. Safe by the cut property.</li>
<li><strong>Kruskal.</strong> The next edge e = (u, v) joins two different components. Take S = the component of u. No lighter edge crosses this cut, or Kruskal would already have used it. Safe.</li>
<li>Both algorithms keep the invariant "the chosen edges are contained in some MST". After n − 1 edges the chosen set is that MST.</li>
</ol>
<p class="edge"><strong>Change the case.</strong> With equal weights, several MSTs can exist; the cut property says "some MST", not "every MST". If all weights are distinct, the lightest crossing edge is unique and the MST is unique. Negative weights change nothing in the argument.</p>
</article>
<article><h3>Union-find: near-constant amortised cost</h3>{TAG}
<p>Kruskal needs to ask "are u and v already connected?" m times. Union-find answers with find(u) = find(v). The Notes prove that union by size (or by rank) keeps trees of height O(log n). Path compression re-points every node on a find path straight at the root.</p>
<p class="formula">With union by rank and path compression, any sequence of m finds and unions on n items costs O(m · α(n)), where α(n) ≤ 4 for every practical n.</p>
<p>The proof is beyond this course; the statement is examinable. Read it as amortised: one find may still walk a long path, but that walk shortens the tree for every later find. Kruskal therefore costs O(m log m) for sorting plus O(m α(n)) for the m cycle tests; sorting dominates.</p>
<p class="edge"><strong>Change the case.</strong> Path compression without union by rank, or union by rank without compression, each give O(log n) per operation amortised, still fine for Kruskal. Neither rule at all gives chains and O(n) per find.</p>
</article></section>'''

# ---------------------------------------------------------------- Week 11
THEORY[11] = f'''<section class="theory"><h2>Theory: when a distance is final</h2>
<article><h3>Why Dijkstra's settled vertex is final</h3>{TAG}
<p>Dijkstra extracts the unknown vertex v with the smallest tentative distance and never touches dist[v] again. This is safe only because all weights are non-negative.</p>
<p class="formula">Claim: when v is extracted, dist[v] = δ(s, v), the true shortest distance.</p>
<ol>
<li>Suppose not, and let v be the first extracted vertex with dist[v] &gt; δ(s, v). A true shortest path s → … → v exists. Follow it from s; let y be the first vertex on it that is not yet settled, and x the settled vertex just before y.</li>
<li>x was settled earlier, so dist[x] = δ(s, x) (v is the first failure). When x was settled, edge x → y was relaxed, so dist[y] ≤ δ(s, x) + w(x, y) = δ(s, y).</li>
<li>Weights are non-negative, so the rest of the path from y to v cannot reduce the length: δ(s, y) ≤ δ(s, v) &lt; dist[v]. Hence dist[y] &lt; dist[v], and the algorithm would have extracted y before v. Contradiction.</li>
</ol>
<p>Counterexample with a negative edge. Vertices A, B, C; edges A→B = 2, A→C = 5, C→B = −4. From A, Dijkstra settles B at 2 first, then C at 5. Relaxing C→B offers 5 − 4 = 1 &lt; 2, but B is already final. The true distance to B is 1. Step 3 above used w ≥ 0, and this is where it breaks.</p>
<p class="edge"><strong>Change the case.</strong> Non-negative, not positive: zero-weight edges are fine, the inequality in step 3 still holds. Negative edges into vertices that are already settled are the problem; a negative edge out of the source alone cannot hurt.</p>
</article>
<article><h3>Bellman–Ford</h3>{TAG}
<p>Idea: relax every edge, and repeat |V| − 1 rounds. A shortest path has at most |V| − 1 edges. After round k every vertex whose shortest path has at most k edges holds its true distance, by induction on k. So |V| − 1 rounds finish the job, for any edge weights, as long as no negative cycle is reachable.</p>
<p>Trace. Vertices S, A, B, C. Edges in this fixed order: S→A = 4, S→B = 2, B→A = −3, A→C = 2, B→C = 6. Start dist = [S 0, A ∞, B ∞, C ∞].</p>
<ol>
<li><strong>Round 1.</strong> S→A: A = 4. S→B: B = 2. B→A: 2 − 3 = −1 &lt; 4, A = −1. A→C: −1 + 2 = 1, C = 1. B→C: 2 + 6 = 8, no change. dist = [0, −1, 2, 1].</li>
<li><strong>Round 2.</strong> S→A: 4 &gt; −1, no. S→B: no. B→A: −1, no. A→C: 1, no. B→C: no. Nothing changed, so the remaining round is unnecessary.</li>
<li><strong>Round 3</strong> (the last of |V| − 1 = 3) would also change nothing. Final: A = −1, B = 2, C = 1. Dijkstra from S would have settled A at 4 before seeing B→A.</li>
<li><strong>Negative-cycle check.</strong> Run one extra round. If any dist still decreases, a path with |V| edges beats every path with fewer edges, which is only possible with a reachable negative cycle. Report "no shortest paths".</li>
</ol>
<p class="formula">cost = (|V| − 1) rounds × |E| relaxations = O(V · E)</p>
<p class="edge"><strong>Change the case.</strong> Edge order matters for the number of useful rounds, not for the answer. If the edges were listed B→A before S→B, round 1 would leave A = 4 and round 2 would fix it. The |V| − 1 bound covers the worst order.</p>
</article></section>'''

# ---------------------------------------------------------------- Week 12
THEORY[12] = f'''<section class="theory"><h2>Theory: the cost of recomputation</h2>
<article><h3>Fibonacci: naive versus memoised recurrences</h3>{TAG}
<p>The two Fibonacci programs in the Notes compute the same numbers. Their costs differ by an exponential factor. Write the recurrence for each, using the methods of Week 7.</p>
<ol>
<li><strong>Naive recursion.</strong> Each call for n makes calls for n − 1 and n − 2, plus one addition: T(n) = T(n − 1) + T(n − 2) + 1, T(0) = T(1) = 1.</li>
<li>This is not a divide-and-conquer shape, so unroll instead. T(n) ≥ 2T(n − 2) (drop the smaller call and the constant), so T(n) ≥ 2<sup>n/2</sup>: exponential. A tighter count gives T(n) = Θ(φ<sup>n</sup>) with φ ≈ 1.618, because the call tree has about F<sub>n</sub> leaves.</li>
<li><strong>Memoised recursion.</strong> Each value F(k) is computed once; later requests return from the table in O(1). Count states, not calls: n + 1 states, constant work each.</li>
<li>Therefore T(n) = Θ(n). The recurrence for the work per new state is T(n) = T(n − 1) + O(1), the same shape as one row of a table.</li>
</ol>
<p class="formula">naive: T(n) = T(n−1) + T(n−2) + 1 = Θ(φ<sup>n</sup>) &nbsp;·&nbsp; memoised: T(n) = T(n−1) + 1 = Θ(n)</p>
<p>Week 7 said: two calls on n − 1 are exponential, two calls on n/2 are n lg n. Memoisation removes the repeated calls, which turns the branching tree into a single chain.</p>
<p class="edge"><strong>Change the case.</strong> The unit-cost model counts one addition as one step. F(n) has about 0.7n bits, so with bit cost the memoised version is Θ(n²). Say which model you use. The same recurrence counting applies to the binomial table in Week 13: C(n, k) has O(nk) states, each O(1).</p>
</article></section>'''

# ---------------------------------------------------------------- MCQs (ids 2001–2099)
NEW_MCQ = [
(2001,'Which statement is a correct loop invariant for insertion sort at the start of outer iteration i?',
 ['s[0 … i−1] is sorted.','s[0 … i−1] holds the first i input items in sorted order.','s[i … n−1] is sorted.','s[0 … i−1] holds the i smallest items.'],'b',
 'The invariant must say both which items are in the prefix and that they are sorted. Option a is too weak, option d describes selection sort.'),
(2002,'A dynamic array doubles when full. Over n appends starting from capacity 1, the total number of copies is:',
 ['Θ(n²).','Θ(n lg n).','At most 2n.','Exactly n.'],'c',
 'The copies form the geometric series n/2 + n/4 + … ≤ n, and the Notes bound the moves by M ≤ 2n. Amortised O(1) per append.'),
(2003,'"Amortised O(1) per operation" means:',
 ['Every single operation takes constant time.','Any sequence of n operations takes O(n) time in total.','The average over random inputs is constant.','The operation is O(1) with high probability.'],'b',
 'Amortised bounds are about the worst sequence, not about single calls and not about probability. One call may still cost Θ(n).'),
(2004,'Binary search does one comparison and then searches one half. Its recurrence is:',
 ['T(n) = 2T(n/2) + 1.','T(n) = T(n/2) + n.','T(n) = T(n/2) + 1.','T(n) = T(n−1) + 1.'],'c',
 'One recursive call on half the input, plus constant work. The solution is Θ(lg n).'),
(2005,'T(n) = 2T(n/2) + n with T(1) = 1 solves to:',
 ['Θ(n).','Θ(n lg n).','Θ(n²).','Θ(2ⁿ).'],'b',
 'The recursion tree has lg n + 1 levels, each costing n. Master theorem: a = 2, b = 2, d = 1, log₂2 = d.'),
(2006,'T(n) = T(n−1) + n with T(1) = 1 solves to:',
 ['Θ(n).','Θ(n lg n).','Θ(n²).','Θ(2ⁿ).'],'c',
 'Unroll: n + (n−1) + … + 1 = n(n+1)/2. The master theorem does not apply because the size shrinks by subtraction.'),
(2007,'T(n) = 3T(n/2) + n solves to:',
 ['Θ(n).','Θ(n lg n).','Θ(n^log₂3) ≈ Θ(n^1.585).','Θ(n³).'],'c',
 'a = 3, b = 2, d = 1. log₂3 ≈ 1.585 > 1, so the leaves dominate: Θ(n^log₂3). This is Karatsuba multiplication.'),
(2008,'T(n) = T(n/2) + n solves to:',
 ['Θ(n).','Θ(n lg n).','Θ(lg n).','Θ(n²).'],'a',
 'Work per level is n, n/2, n/4, …, a geometric series below 2n. Master theorem: d = 1 > log₂1 = 0, so the top level dominates.'),
(2009,'In the substitution method for T(n) = 2T(n/2) + n, the guess T(n) ≤ cn fails because:',
 ['The base case is wrong.','Substituting gives cn + n, which is not ≤ cn for any c.','c must be negative.','Logarithms cannot appear.'],'b',
 'The induction step produces an extra + n that no constant absorbs. The correct guess needs the lg n factor.'),
(2010,'In BFS, why must the to-do list be a FIFO queue for dist[] to be correct?',
 ['So that all level-k vertices leave before any level-(k+1) vertex.','So that vertices are visited in alphabetical order.','So that each edge is relaxed twice.','So that the graph becomes acyclic.'],'a',
 'The level invariant needs vertices processed in non-decreasing distance. A stack breaks this and gives DFS.'),
(2011,'The cut property says: for any cut, a lightest edge crossing it:',
 ['Belongs to every spanning tree.','Belongs to some minimum spanning tree.','Has the smallest weight in the whole graph.','Is never chosen by Kruskal.'],'b',
 'The exchange argument swaps a tree edge crossing the cut for the lightest one without increasing weight. With ties, "some" MST, not "every".'),
(2012,'Union-find with union by rank and path compression costs, for m operations on n items:',
 ['O(m n).','O(m log n) worst case per operation.','O(m α(n)) amortised, with α(n) ≤ 4 in practice.','O(m) worst case per operation.'],'c',
 'The inverse Ackermann bound is amortised over the sequence. A single find may still be longer than constant.'),
(2013,'Dijkstra can fail with negative edges because:',
 ['The priority queue cannot store negative keys.','A settled vertex may later be reached by a shorter path through a negative edge.','Negative edges create cycles.','Relaxation is undefined for negative weights.'],'b',
 'The proof that the extracted vertex is final uses w ≥ 0 to say the rest of a path cannot reduce its length. With A→B=2, A→C=5, C→B=−4, B is settled at 2 but the true distance is 1.'),
(2014,'Bellman–Ford relaxes all edges |V| − 1 times. Its running time and negative-cycle test are:',
 ['O(V + E); count the vertices.','O(V · E); one extra round that still improves a distance reveals a negative cycle.','O(E log V); use a heap.','O(V²); compare with Floyd.'],'b',
 'Each round is O(E), and |V| − 1 rounds suffice because a shortest path has at most |V| − 1 edges. A |V|-th improving round is only possible with a reachable negative cycle.'),
(2015,'Naive recursive Fibonacci has recurrence T(n) = T(n−1) + T(n−2) + 1. Memoisation changes the cost to Θ(n) because:',
 ['Additions become faster.','Each of the n + 1 states is computed once and later requests cost O(1).','The recurrence becomes T(n) = 2T(n/2) + 1.','The base cases are removed.'],'b',
 'Count states, not calls. The branching call tree with about φⁿ leaves becomes a chain of n table fills.'),
]

# ---------------------------------------------------------------- Written questions (ids 301–399)
NEW_WRITTEN = [
{"id":301,"block":"Theory","level":"Medium",
 "question":"State a loop invariant for the outer loop of insertion sort and check initialisation, maintenance and termination on the input [3, 1, 2].",
 "answer":"Invariant: at the start of outer iteration i, the prefix s[0 … i−1] holds the first i input items in sorted order. Initialisation (i = 1): the prefix is [3], one item, sorted. Maintenance i = 1: the sorted prefix is [3]; item 1 slides left past 3, giving [1, 3, 2]; the prefix [1, 3] is sorted and holds the first two items. Maintenance i = 2: item 2 slides past 3 and stops at 1, giving [1, 2, 3]; prefix [1, 2, 3] is sorted. In general, sliding s[i] left stops at the first item not larger than it, so the prefix gains one item and stays sorted, and no other position changes. Termination: the loop ends at i = n = 3, and the invariant then says s[0 … 2] holds all three items sorted, which is the specification. The invariant is true on every input because each part was argued for an arbitrary iteration, not for this trace alone."},
{"id":302,"block":"Theory","level":"Medium",
 "question":"A dynamic array starts with capacity 4 and doubles when full. Count the total copies made by 20 appends, then use the aggregate method to give the amortised cost per append.",
 "answer":"Capacity is full before appends 5, 9 and 17. Copies at those moments: 4 (to capacity 8), 8 (to capacity 16), 16 (to capacity 32). Total copies 4 + 8 + 16 = 28. Each append also writes its own item: 20 writes. Total work 48 for 20 appends, so the amortised cost is 48/20 = 2.4 per append. In general the copies are a geometric series ending at most at the current size, so copies ≤ 2n, writes = n, total ≤ 3n, amortised ≤ 3 = O(1). The single worst append (number 17) costs 17 units, so the worst-case cost per call is Θ(n) even though the amortised cost is constant."},
{"id":303,"block":"Theory","level":"Easy",
 "question":"Solve T(n) = T(n/2) + 1 with T(1) = 1 using a recursion tree.",
 "answer":"Level k has one call of size n/2ᵏ doing 1 unit of work. The sizes reach 1 when n/2ᵏ = 1, that is k = lg n, so there are lg n + 1 levels. Total work = (lg n + 1) · 1 = lg n + 1 = Θ(lg n). Check with the master form: a = 1, b = 2, d = 0, log₂1 = 0 = d, so Θ(n⁰ lg n) = Θ(lg n). This is binary search."},
{"id":304,"block":"Theory","level":"Medium",
 "question":"Solve T(n) = 2T(n/2) + n with T(1) = 1 by the recursion-tree method, then verify T(n) ≤ c·n lg n by substitution.",
 "answer":"Recursion tree: level k has 2ᵏ calls of size n/2ᵏ, each doing n/2ᵏ work, so every level costs 2ᵏ · n/2ᵏ = n. There are lg n + 1 levels (sizes n, n/2, …, 1). Total n(lg n + 1) = Θ(n lg n). Substitution: assume T(m) ≤ c m lg m for m < n. Then T(n) ≤ 2 · c(n/2) lg(n/2) + n = c n (lg n − 1) + n = c n lg n − c n + n ≤ c n lg n whenever c ≥ 1. Base: T(2) = 2·1 + 2 = 4 ≤ c · 2 · lg 2 = 2c needs c ≥ 2. Take c = 2; the induction closes for all n ≥ 2, so T(n) = O(n lg n). The tree count shows the bound is also Ω, so Θ(n lg n)."},
{"id":305,"block":"Theory","level":"Easy",
 "question":"Solve T(n) = T(n−1) + n with T(1) = 1. Explain why the master theorem does not apply.",
 "answer":"Unroll: T(n) = n + T(n−1) = n + (n−1) + T(n−2) = … = n + (n−1) + … + 2 + T(1) = n(n+1)/2 − 1 + 1 = n(n+1)/2. The dominant term is n²/2, so T(n) = Θ(n²). The master theorem needs the form a T(n/b) + nᵈ with the size divided by a constant b > 1. Here the size decreases by subtraction, n → n−1, so the recursion has n levels rather than log n levels, and the theorem's cases do not describe it. This recurrence is recursive selection sort."},
{"id":306,"block":"Theory","level":"Medium",
 "question":"Solve T(n) = 3T(n/2) + n. Which master-theorem case applies, and what does the recursion tree look like at the leaves?",
 "answer":"a = 3, b = 2, d = 1. Compare d with log_b a = log₂3 ≈ 1.585. Since d < log₂3, case 3 applies: T(n) = Θ(n^log₂3) ≈ Θ(n^1.585). Recursion tree: level k has 3ᵏ calls of size n/2ᵏ, so the work per level is 3ᵏ · n/2ᵏ = n · (3/2)ᵏ, which grows with k. The last level k = lg n has 3^lg n = n^log₂3 leaves, each costing a constant, and this bottom level dominates the sum (a geometric series with ratio 3/2 is dominated by its last term). This is the Karatsuba multiplication recurrence, which beats the schoolbook Θ(n²)."},
{"id":307,"block":"Theory","level":"Easy",
 "question":"Solve T(n) = T(n/2) + n and compare the answer with T(n) = 2T(n/2) + n.",
 "answer":"Recursion tree: one call per level, sizes n, n/2, n/4, …, so work per level is n, n/2, n/4, … The sum is n(1 + 1/2 + 1/4 + …) < 2n, so T(n) = Θ(n). The top level dominates. Master form: a = 1, b = 2, d = 1, log₂1 = 0 < 1, case 1, Θ(n¹). With 2T(n/2) + n the two calls per level keep the work at exactly n on every level, and the lg n levels add up to Θ(n lg n). The number of recursive calls, not just the + n, decides the answer."},
{"id":308,"block":"Theory","level":"Medium",
 "question":"Read the recurrence off this code and solve it.\n\nf(A, lo, hi):\n    if hi − lo < 1: return\n    mid = (lo + hi) // 2\n    f(A, lo, mid)\n    f(A, mid + 1, hi)\n    for i from lo to hi: print A[i]\n\nThen say how the answer changes if the for loop is removed.",
 "answer":"Let n = hi − lo + 1. The function makes two recursive calls, each on about n/2 items, and then a loop of n iterations. So T(n) = 2T(n/2) + n with T(1) = O(1). This is the mergesort shape: a recursion tree with n work per level and lg n + 1 levels, giving Θ(n lg n). Master form a = 2, b = 2, d = 1, log₂2 = 1 = d, case 2, Θ(n lg n). Without the for loop the work outside the calls is constant: T(n) = 2T(n/2) + 1. The tree has 2ᵏ calls at level k each costing 1, so the leaves dominate: 2^lg n = n leaves, T(n) = Θ(n). (Master form d = 0 < log₂2 = 1, case 3, Θ(n¹).) Dropping the + n term changes the answer from n lg n to n, which is why it must never be dropped by accident."},
{"id":309,"block":"Theory","level":"Hard",
 "question":"Prove that in BFS from s, every vertex v leaves the queue with dist[v] equal to its true shortest edge count δ(v). Then explain what breaks if vertices are marked discovered on dequeue instead of on enqueue.",
 "answer":"Claim (by induction on k): the vertices with δ = k are exactly those enqueued with dist = k, and they all leave the queue before any vertex with dist = k + 1. Base k = 0: only s has δ = 0, it is enqueued with dist 0 and leaves first. Step: assume the claim for all levels ≤ k. When a level-k vertex u is dequeued, each undiscovered neighbour v is enqueued with dist k + 1. Every vertex v with δ(v) = k + 1 has a neighbour u with δ(u) = k, and it was not discovered from any level j < k, because that would give a walk of j + 1 ≤ k edges, contradicting δ(v) = k + 1. So v is enqueued with dist k + 1 by some level-k vertex, and no vertex with δ > k + 1 is enqueued at this time because it has no level-k neighbour. Since the queue is FIFO and all level-k vertices were enqueued before any level-(k+1) vertex, the level-(k+1) vertices leave in one block after them. Hence dist[v] = δ(v) when v leaves the queue, and it is never changed later. The argument uses FIFO order: a stack would let a vertex found by a long path be processed first. If marking happens on dequeue, a vertex with several level-k neighbours is enqueued once per neighbour. The first copy dequeued sets the correct distance, and later copies are ignored, so dist stays correct, but the queue may hold one entry per edge, so the running time can rise from O(n + m) to Θ(m) queue entries plus repeated neighbour scans, and the parent array becomes ambiguous."},
{"id":310,"block":"Theory","level":"Hard",
 "question":"State the cut property and prove it with an exchange argument. Then explain in one sentence each how Prim's and Kruskal's algorithms rely on it.",
 "answer":"Cut property: for any partition of the vertices into non-empty sets S and V∖S, if e is a minimum-weight edge with one endpoint in each set, then some minimum spanning tree contains e. Proof: let T be any MST. If e ∈ T we are done. Otherwise T + e contains exactly one cycle, the tree path between the endpoints of e plus e itself. This cycle starts in S, crosses to V∖S and returns, so besides e it contains at least one other edge f crossing the cut. T' = T − f + e is connected (the path that used f can now go around the cycle through e), has n − 1 edges, so it is a spanning tree, and w(T') = w(T) − w(f) + w(e) ≤ w(T) because w(e) ≤ w(f). Since T is minimum, w(T') = w(T), so T' is an MST containing e. Prim: at each step the cut is (tree vertices, other vertices) and Prim adds the minimum-weight crossing edge, so every chosen edge is in some MST; because the chosen edges always extend one tree, the argument can be applied with T chosen to contain all previous edges, giving one MST that contains all of them. Kruskal: when edge (u, v) is accepted, u and v are in different components; take S = the component containing u; no lighter edge crosses this cut, because all lighter edges were already considered and any crossing one would have been accepted, so (u, v) is a minimum crossing edge and is safe by the cut property."},
{"id":311,"block":"Theory","level":"Medium",
 "question":"Give a 3-vertex directed graph with one negative edge on which Dijkstra from the source returns a wrong distance. Trace Dijkstra to show the wrong value, and state which step of the correctness argument fails.",
 "answer":"Vertices A (source), B, C. Edges A→B = 2, A→C = 5, C→B = −4. Dijkstra: dist = [A 0, B ∞, C ∞]. Settle A, relax its edges: B = 2, C = 5. The smallest unsettled distance is B = 2; settle B, it has no outgoing edges. Settle C = 5; relax C→B: 5 + (−4) = 1 < 2, but B is already settled, so the standard algorithm does not change it (and even if it did, any vertex settled through B would already be wrong). Reported dist[B] = 2. True distance: the path A→C→B costs 5 − 4 = 1. The correctness argument says: on a true shortest path to the first wrongly settled vertex v, the first unsettled vertex y satisfies dist[y] ≤ δ(y) ≤ δ(v), using that the remaining edges from y to v have non-negative total weight. Here the remaining edge C→B is negative, so δ(C) = 5 is larger than δ(B) = 1, and the inequality δ(y) ≤ δ(v) fails; C is not extracted before B even though it lies on B's shortest path."},
{"id":312,"block":"Theory","level":"Medium",
 "question":"Run Bellman–Ford from S on the directed graph with edges, in this order: S→A = 6, S→B = 7, A→C = 5, B→C = −2, C→A = −3. Show every round, state when you may stop, and explain how a negative cycle would be detected.",
 "answer":"Start dist = [S 0, A ∞, B ∞, C ∞]. Round 1: S→A gives A = 6; S→B gives B = 7; A→C gives C = 11; B→C gives 7 − 2 = 5 < 11, C = 5; C→A gives 5 − 3 = 2 < 6, A = 2. After round 1: [0, 2, 7, 5]. Round 2: S→A 6 > 2 no; S→B no; A→C 2 + 5 = 7 > 5 no; B→C 5 no; C→A 2 no. No change, so the answer is final and the third round (|V| − 1 = 3) can be skipped. Final distances: A = 2 (path S→B→C→A = 7 − 2 − 3), B = 7, C = 5 (path S→B→C). Cost in general: |V| − 1 rounds of |E| relaxations, O(V·E), here at most 3 × 5 = 15 relaxations. Negative-cycle detection: after the |V| − 1 rounds, run one more round over all edges. If any dist still decreases, some path with |V| or more edges is shorter than every path with fewer edges, which is possible only if a reachable cycle has negative total weight; then report that shortest paths are undefined. Here the cycle A→C→A has weight 5 − 3 = 2 > 0, so no decrease occurs in the extra round."},
{"id":313,"block":"Theory","level":"Medium",
 "question":"Write the recurrence for naive recursive Fibonacci and show it is exponential. Then write the recurrence for the memoised version and show it is Θ(n).",
 "answer":"Naive: fib(n) calls fib(n−1) and fib(n−2) and does one addition, so T(n) = T(n−1) + T(n−2) + 1 with T(0) = T(1) = 1. Lower bound: T(n−1) ≥ T(n−2), so T(n) ≥ 2T(n−2) + 1 ≥ 2T(n−2), and unrolling gives T(n) ≥ 2^(n/2) · T(0 or 1) = Ω(2^(n/2)) = Ω(1.414ⁿ). More precisely the number of calls satisfies the Fibonacci recurrence itself, so T(n) = Θ(Fₙ) = Θ(φⁿ) with φ ≈ 1.618; either way exponential. Memoised: the first call for each k in 0 … n computes f[k] once, making two calls that either return immediately from the table (O(1)) or are themselves first calls. Charge each first call O(1) for its own addition and its two table lookups; there are n + 1 first calls, so total work is Θ(n). As a recurrence for the work of computing a new state, T(n) = T(n−1) + O(1) (the call for n−2 is already cached by the time it is needed), which unrolls to Θ(n). Week 7 connection: a subtracting recurrence with two calls is exponential, with one call it is linear; memoisation removes the second call by making it a lookup."},
]

EXTRA_TESTS = {3:[2001], 4:[2002,2003], 7:[2004,2005,2006,2007,2008,2009], 8:[2010], 10:[2011,2012], 11:[2013,2014], 12:[2015]}
EXTRA_WRITTEN = {3:[301], 4:[302], 7:[303,304,305,306,307,308], 8:[309], 10:[310], 11:[311,312], 12:[313]}

# ---------------------------------------------------------------- sanity checks
_mcq_ids = [m[0] for m in NEW_MCQ]
_written_ids = [w['id'] for w in NEW_WRITTEN]
assert len(set(_mcq_ids)) == len(_mcq_ids) and all(2001 <= i <= 2099 for i in _mcq_ids)
assert len(set(_written_ids)) == len(_written_ids) and all(301 <= i <= 399 for i in _written_ids)
assert all(len(m[2]) == 4 and m[3] in 'abcd' for m in NEW_MCQ)
assert all(w['level'] in ('Easy', 'Medium', 'Hard') for w in NEW_WRITTEN)
assert all(i in _mcq_ids for ids in EXTRA_TESTS.values() for i in ids)
assert all(i in _written_ids for ids in EXTRA_WRITTEN.values() for i in ids)
assert set(EXTRA_TESTS) | set(EXTRA_WRITTEN) <= set(THEORY)
