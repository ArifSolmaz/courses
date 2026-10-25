const cards = [
  {
    "id": 1,
    "week": "14",
    "title": "Finding an answer and checking it are different jobs",
    "question": "Choose tasks from 8,7,6,5,4 so one machine gets total 15.",
    "a": [
      "Find",
      "Search for a suitable subset."
    ],
    "b": [
      "Check",
      "Given 8 and 7, add them and check that each task is used once."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A supplied answer is called a certificate or witness. A checker must verify every required condition, not trust the answer’s label."
      },
      {
        "title": "Follow the change",
        "text": "The subset 8,7 is easy to check: its sum is 15 and both indices occur in the input."
      },
      {
        "title": "Explain the result",
        "text": "Finding a witness may require many attempts. This distinction motivates NP, but one hard-looking example is not a proof of complexity."
      }
    ],
    "lesson": "Checkers and search procedures answer different practical questions.",
    "check": "Does one rejected subset prove no solution exists?",
    "answer": "No. It only rejects that candidate. Another subset may work.",
    "extra": "Complexity describes growing families of inputs, not how long one fixed puzzle feels.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "warmup",
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "witness",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "14",
    "title": "Ask a yes/no question first",
    "question": "Distribute five jobs across two identical machines.",
    "a": [
      "Optimization",
      "What is the smallest possible finishing time?"
    ],
    "b": [
      "Decision",
      "Is there an assignment finishing by time 15?"
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A search version asks for a suitable assignment itself. A decision version asks only whether one exists."
      },
      {
        "title": "Follow the change",
        "text": "For a claimed yes assignment, check that every job is assigned exactly once and no machine’s total exceeds the limit."
      },
      {
        "title": "Explain the result",
        "text": "P and NP are classes of decision problems. Optimization versions are usually discussed as NP-hard, rather than called NP-complete without qualification."
      }
    ],
    "lesson": "State the problem version before naming its complexity class.",
    "check": "Is “the best finishing time is 15” certified just by a schedule of length 15?",
    "answer": "No. That schedule proves an upper bound of 15. A lower bound or another proof is needed to show nothing shorter works.",
    "extra": "Here jobs are independent, indivisible, available at time zero and processed without preemption on identical machines.",
    "refs": [
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "versions",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "14",
    "title": "What P and NP actually say",
    "question": "Think about algorithms whose running time is polynomial in input length.",
    "a": [
      "P",
      "Decision problems solvable in polynomial time."
    ],
    "b": [
      "NP",
      "Yes-instances have polynomial-size certificates verifiable in polynomial time."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "If you can solve a decision problem in polynomial time, you can also verify yes by solving it. Therefore P is contained in NP."
      },
      {
        "title": "Follow the change",
        "text": "NP does not mean “not polynomial.” Some familiar easy problems belong to both P and NP."
      },
      {
        "title": "Explain the result",
        "text": "Whether every NP problem also lies in P remains unresolved. We must not teach P ≠ NP as a proved fact."
      }
    ],
    "lesson": "NP describes efficient verification of yes-certificates.",
    "check": "Does a fast verifier automatically give a known fast solver?",
    "answer": "No. Whether this always follows is the P versus NP question.",
    "extra": "Polynomial time is a mathematical growth category. Large constants or a high polynomial degree can still make an algorithm impractical.",
    "refs": [
      "1-3",
      "5-5"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "classes",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "14",
    "title": "Count the candidates before promising speed",
    "question": "An n-item subset search may examine 2ⁿ subsets.",
    "a": [
      "n = 10",
      "1,024 subsets."
    ],
    "b": [
      "n = 20",
      "1,048,576 subsets."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Adding one item doubles the candidate set. Doubling n does much more than double it."
      },
      {
        "title": "Follow the change",
        "text": "A DP table can help, but a state containing an arbitrary subset can still have exponentially many states."
      },
      {
        "title": "Explain the result",
        "text": "Subset-sum DP with O(nT) time depends on the numeric target T. It is pseudo-polynomial in binary-encoded input size."
      }
    ],
    "lesson": "A table does not automatically remove exponential growth.",
    "check": "If n rises from 20 to 21, how many subsets are added?",
    "answer": "Another 1,048,576: the total doubles to 2,097,152.",
    "extra": "Counting a brute-force algorithm’s work does not prove every possible algorithm must take that long.",
    "refs": [
      "1-4",
      "4-3"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "growth",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "14",
    "title": "Small wording changes can change the problem",
    "question": "Compare visiting every edge with visiting every vertex.",
    "a": [
      "Euler circuit",
      "Use each edge exactly once and return to the start."
    ],
    "b": [
      "Hamiltonian cycle",
      "Visit each vertex exactly once and return to the start."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For undirected graphs, an Euler circuit can be found efficiently when the non-isolated vertices are connected and all degrees are even."
      },
      {
        "title": "Follow the change",
        "text": "Hamiltonian-cycle existence is NP-complete for general graphs. Its similar wording does not give it the same algorithm."
      },
      {
        "title": "Explain the result",
        "text": "Likewise, 2-SAT has a polynomial-time algorithm, while 3-SAT is NP-complete. Check the exact rules."
      }
    ],
    "lesson": "Similar pictures do not imply equivalent computational problems.",
    "check": "Does NP-complete mean every small Hamiltonian instance takes a long time?",
    "answer": "No. Some instances are trivial. The classification concerns a general worst-case guarantee.",
    "extra": "For simple undirected Hamiltonian cycles we require at least three vertices. Trivial empty-edge Euler conventions are separate boundary cases.",
    "refs": [
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-5",
    "visual": "changes",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "14",
    "title": "A reduction is an answer-preserving translator",
    "question": "Turn an A-instance into a B-instance, then use a solver for B.",
    "a": [
      "Required translation",
      "Runs in polynomial time and produces polynomial-size output."
    ],
    "b": [
      "Required logic",
      "A is yes exactly when the translated B is yes."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A polynomial many-one reduction is a function transforming instances. It must preserve both yes and no answers."
      },
      {
        "title": "Follow the change",
        "text": "If B has a polynomial solver, translate A and call that solver. This gives a polynomial solver for A."
      },
      {
        "title": "Explain the result",
        "text": "The transformation must not secretly solve A by exponential search before producing its output."
      }
    ],
    "lesson": "A ≤p B means a solver for B can be used to solve A.",
    "check": "Does translating a single example prove a reduction?",
    "answer": "No. The construction and equivalence argument must work for every valid source instance.",
    "extra": "Our examples illustrate reductions with small inputs, while the proof needs a general rule.",
    "refs": [
      "2-1",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "reduction",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "14",
    "title": "Use sorting as a familiar problem translator",
    "question": "Find the smallest gap between distinct positions in a list of numbers.",
    "a": [
      "Unsorted input",
      "9,2,6,3."
    ],
    "b": [
      "After sorting",
      "2,3,6,9; only adjacent gaps need comparison."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Sorting creates an order where a closest pair must be adjacent: any value between two endpoints would yield a no-larger gap."
      },
      {
        "title": "Follow the change",
        "text": "Check gaps 1,3,3. The smallest is 1, between 2 and 3."
      },
      {
        "title": "Explain the result",
        "text": "This algorithmic use of a sorting subroutine helps explain reduction thinking. It is not by itself a many-one NP-hardness proof between decision problems."
      }
    ],
    "lesson": "Reuse a known solver after justifying the transformation.",
    "check": "What happens when the input contains duplicate values?",
    "answer": "The sorted list puts equal values together, giving minimum gap 0.",
    "extra": "Assume at least two numbers and ordinary numeric ordering. Sorting dominates at O(n log n) comparisons.",
    "refs": [
      "2-2"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "sort",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "14",
    "title": "To prove a new problem hard, point the arrow toward it",
    "question": "Let A be a known NP-complete decision problem and B the new problem.",
    "a": [
      "Correct hardness direction",
      "A → B: solving B would solve A."
    ],
    "b": [
      "Wrong direction for this goal",
      "B → A only says A can help solve B."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "First show B is in NP by describing a polynomial-size witness and polynomial-time checker."
      },
      {
        "title": "Follow the change",
        "text": "Then construct a polynomial transformation from a known NP-hard problem A to B."
      },
      {
        "title": "Explain the result",
        "text": "Prove both directions: source yes gives target yes, and target yes implies source yes. Together, membership and hardness establish NP-completeness."
      }
    ],
    "lesson": "Hardness follows the reduction arrow; algorithms can be reused backward.",
    "check": "Is showing B in NP enough to prove B NP-complete?",
    "answer": "No. P problems are also in NP. You still need an NP-hardness argument.",
    "extra": "NP-hard problems need not belong to NP or even be decision problems. NP-complete means both NP-hard and in NP.",
    "refs": [
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-4",
    "visual": "proof",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "14",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one guarantee and its assumptions."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "Which direction did the reduction go?",
    "answer": "Keep your own short reminder.",
    "extra": "The break is included in the three-hour plan.",
    "refs": [],
    "ref": "lecture-notes.html",
    "visual": null,
    "minutes": 10,
    "block": "Break",
    "start": 64,
    "end": 74
  },
  {
    "id": 10,
    "week": "14",
    "title": "SAT asks whether some switch settings satisfy every rule",
    "question": "Use clauses (a OR b) AND (NOT a OR c).",
    "a": [
      "Inside a clause",
      "At least one literal must be true."
    ],
    "b": [
      "Between clauses",
      "Every clause must be true."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A variable is a true/false switch. A literal is a variable or its negation. A clause is an OR of literals."
      },
      {
        "title": "Follow the change",
        "text": "An assignment gives values to all variables. Evaluate every clause to verify it."
      },
      {
        "title": "Explain the result",
        "text": "There are eight assignments for three variables. The visual checks them all, while a verifier checks only the supplied assignment."
      }
    ],
    "lesson": "One satisfying assignment proves yes; one failure does not prove no.",
    "check": "Does a=true, b=false, c=true work?",
    "answer": "Yes. The first clause is true through a, and the second through c.",
    "extra": "The example is small enough for exhaustive search. SAT’s NP-completeness is a theorem about arbitrary growing instances.",
    "refs": [
      "3-1",
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "sat",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "14",
    "title": "Three literals are enough to express a longer clause",
    "question": "Convert a OR b OR c OR d using one fresh switch w.",
    "a": [
      "First clause",
      "a OR b OR w."
    ],
    "b": [
      "Second clause",
      "NOT w OR c OR d."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The new question is whether there exists a value of w making both clauses true."
      },
      {
        "title": "Follow the change",
        "text": "If all original literals are false, the first clause demands w=true and the second demands w=false. No choice works."
      },
      {
        "title": "Explain the result",
        "text": "If a or b is true, choose w=false. Otherwise c or d must be true, and w=true works. This proves equivalence for every original assignment."
      }
    ],
    "lesson": "Auxiliary variables are chosen, not required to work for every value.",
    "check": "Must w be a fresh variable?",
    "answer": "Yes. Reusing an existing variable can add unintended constraints and break the equivalence.",
    "extra": "This explains one four-literal CNF clause. A full CNF-SAT to 3-SAT reduction treats every clause and uses fresh auxiliary variables for each.",
    "refs": [
      "3-3",
      "3-4"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "gadget",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "14",
    "title": "Cover every corridor with endpoint cameras",
    "question": "Graph: A–B–C–D, a four-vertex path.",
    "a": [
      "Vertex cover",
      "Choose B and C: every edge has a selected endpoint."
    ],
    "b": [
      "Independent set",
      "The unchosen vertices A and D have no edge between them."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A cover C leaves no edge with both endpoints outside C. That is exactly the definition that V−C is independent."
      },
      {
        "title": "Follow the change",
        "text": "Therefore a cover of size at most k exists exactly when an independent set of size at least n−k exists."
      },
      {
        "title": "Explain the result",
        "text": "For this path, minimum cover size is 2 and maximum independent-set size is 2. Click vertices to test the relationship."
      }
    ],
    "lesson": "Complement the selected vertex set, not the graph, for this first relationship.",
    "check": "Is choosing only B a cover?",
    "answer": "No. Edge C–D has neither endpoint selected.",
    "extra": "A vertex cover covers edges, not necessarily every vertex. Isolated vertices need no camera under this model.",
    "refs": [
      "4-1"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "cover",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "14",
    "title": "Now complement the graph",
    "question": "Keep the same vertices; replace every absent distinct-vertex edge by an edge and remove every existing edge.",
    "a": [
      "Independent in G",
      "No pair in the selected group is adjacent."
    ],
    "b": [
      "Clique in the complement",
      "Every pair in that same group is adjacent."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A clique is a set whose distinct vertices are pairwise connected."
      },
      {
        "title": "Follow the change",
        "text": "The graph complement flips adjacency, so an independent set becomes a clique without changing its vertices or size."
      },
      {
        "title": "Explain the result",
        "text": "Combine this with the cover relation to transport a decision question through cover → independent set → clique."
      }
    ],
    "lesson": "The set-complement step and graph-complement step are different operations.",
    "check": "Does the complement add an edge from a vertex to itself?",
    "answer": "No. We use simple graphs, so only pairs of distinct vertices are flipped.",
    "extra": "The complement may have O(n²) edges. That is still polynomial output size.",
    "refs": [
      "4-1",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "complement",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "14",
    "title": "How a 3-SAT graph encodes choices",
    "question": "For each variable, join its true and false literal vertices; for each clause, make a triangle.",
    "a": [
      "Variable edge",
      "At least one endpoint must enter a cover."
    ],
    "b": [
      "Clause triangle",
      "At least two vertices must enter a cover."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For n variables and m three-literal clauses, ask for a cover of size at most n+2m."
      },
      {
        "title": "Follow the change",
        "text": "Connect each clause-literal occurrence to the variable vertex carrying that same literal. The budget forces exactly one per variable edge and two per triangle."
      },
      {
        "title": "Explain the result",
        "text": "Each unchosen clause vertex then needs its literal vertex selected. Interpret selected variable literals as true: every clause has a true literal. Conversely, a satisfying assignment builds such a cover."
      }
    ],
    "lesson": "The budget turns local graph constraints into consistent truth choices.",
    "check": "Why not choose both variable literals everywhere?",
    "answer": "The tight n+2m budget has no spare vertices after covering all variable edges and clause triangles.",
    "extra": "This construction is optional depth. It is a general proof idea; the preceding camera example makes the simpler cover relationships concrete.",
    "refs": [
      "4-2",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-2",
    "visual": "construction",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "14",
    "title": "Equal machine loads are a partition question",
    "question": "Jobs are 8,7,6,5,4; total work is 30.",
    "a": [
      "Equal split",
      "Each machine receives total 15."
    ],
    "b": [
      "Witness",
      "8+7 and 6+5+4."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Partition asks whether every input number can be placed in one of two groups with equal totals."
      },
      {
        "title": "Follow the change",
        "text": "A verifier checks that the groups contain each input item once and have equal sums. With positive integer durations, an odd total makes equality impossible."
      },
      {
        "title": "Explain the result",
        "text": "General subset sum asks for an arbitrary target, not necessarily half the total. Both have pseudo-polynomial DP and NP-complete decision versions for binary-encoded integers."
      }
    ],
    "lesson": "Input encoding matters when discussing complexity.",
    "check": "If total work is odd, can two integer-load groups be equal?",
    "answer": "No. Half of an odd integer is not an integer, whereas each group sums integer durations.",
    "extra": "This two-machine assignment is a restricted scheduling model. General job-shop scheduling also includes machine routes and operation-order constraints.",
    "refs": [
      "4-3",
      "4-4",
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "partition",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "14",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one guarantee and its assumptions."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "Which direction did the reduction go?",
    "answer": "Keep your own short reminder.",
    "extra": "The break is included in the three-hour plan.",
    "refs": [],
    "ref": "lecture-notes.html",
    "visual": null,
    "minutes": 10,
    "block": "Break",
    "start": 122,
    "end": 132
  },
  {
    "id": 17,
    "week": "14",
    "title": "A fast schedule may be good without being best",
    "question": "Sort 8,7,6,5,4 from longest to shortest, then assign each to the less-loaded machine.",
    "a": [
      "LPT heuristic",
      "Final loads 17 and 13."
    ],
    "b": [
      "Exact optimum",
      "15 and 15."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The heuristic makes a complete feasible assignment quickly. It is not guaranteed to find the exact optimum."
      },
      {
        "title": "Follow the change",
        "text": "Enumerate the small instance to verify that assigning 8,7 together gives makespan 15."
      },
      {
        "title": "Explain the result",
        "text": "Total work divided by two is a lower bound of 15. A schedule reaching that bound is certified optimal."
      }
    ],
    "lesson": "A feasible solution plus a matching lower bound proves optimality.",
    "check": "Does the LPT result prove a 16-unit schedule is impossible?",
    "answer": "No. It is only an upper bound of 17. In fact a 15-unit schedule exists.",
    "extra": "Tie-breaking chooses the first least-loaded machine in this trace. Each job runs once; there are no release times or precedence constraints.",
    "refs": [
      "5-1",
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "lpt",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "14",
    "title": "Use a bound to describe what you know",
    "question": "Machine loads are 30,40,25 minutes; the longest job chain is 35 minutes. A feasible schedule takes 46.",
    "a": [
      "Lower bound",
      "max(40,35)=40 minutes."
    ],
    "b": [
      "Upper bound",
      "The known feasible schedule gives 46 minutes."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "No schedule can finish before a machine completes its total assigned work, or before a job completes its required sequential operations."
      },
      {
        "title": "Follow the change",
        "text": "Therefore 40 ≤ OPT ≤ 46. The schedule is at most 6 minutes above optimum."
      },
      {
        "title": "Explain the result",
        "text": "Its ratio to optimum is at most 46/40=1.15. This is a bound, not a claim that the true loss equals 15%."
      }
    ],
    "lesson": "Report a solution and a justified gap, not an unsupported claim of optimality.",
    "check": "Can a feasible schedule take only 38 minutes?",
    "answer": "No under these assumptions. The machine with 40 minutes of work rules it out.",
    "extra": "The figures alone do not construct a valid 46-minute schedule; its feasibility must already have been checked.",
    "refs": [
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "bounds",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "14",
    "title": "A simple cover algorithm has a provable factor",
    "question": "Repeatedly choose an uncovered edge, take both endpoints, then ignore all edges they cover.",
    "a": [
      "Returned cover",
      "On A–B–C–D, it may choose all four vertices."
    ],
    "b": [
      "Minimum cover",
      "Two vertices suffice."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The picked edges share no endpoints, so they form a matching."
      },
      {
        "title": "Follow the change",
        "text": "Any cover must take at least one endpoint from each picked edge. If there are r picked edges, OPT is at least r."
      },
      {
        "title": "Explain the result",
        "text": "The algorithm takes 2r endpoints and covers every edge. Thus its cover size is at most 2OPT. It can hit this bound on the path."
      }
    ],
    "lesson": "An approximation guarantee is a proof that holds for every allowed input.",
    "check": "Is this the same as picking only one endpoint of each edge?",
    "answer": "No. The proof and coverage guarantee use both endpoints of every picked edge.",
    "extra": "The guarantee is for unweighted minimum vertex cover. Arbitrary vertex costs require a different algorithm and analysis.",
    "refs": [
      "5-3"
    ],
    "ref": "lecture-notes.html#topic-5-3",
    "visual": "approx",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "14",
    "title": "The MST tour bound needs metric distances",
    "question": "Visit every corner of a unit square and return to the start.",
    "a": [
      "MST",
      "Three unit sides cost 3."
    ],
    "b": [
      "Tour",
      "The square perimeter costs 4."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For a complete undirected metric graph with nonnegative costs, removing one edge from an optimal tour gives a spanning tree, so MST ≤ OPT."
      },
      {
        "title": "Follow the change",
        "text": "Walking each MST edge twice costs 2MST. Shortcut repeated vertices; triangle inequality ensures shortcuts do not increase the cost."
      },
      {
        "title": "Explain the result",
        "text": "The resulting tour is at most 2MST ≤ 2OPT. Without the metric assumptions, this guarantee does not follow."
      }
    ],
    "lesson": "A guarantee travels with its assumptions.",
    "check": "Does the square example have to reach the factor-2 worst case?",
    "answer": "No. Its perimeter tour is actually optimal. A worst-case guarantee can be loose on an individual instance.",
    "extra": "This is optional enrichment connecting MST, traversal and approximation. A missing direct edge can prevent a proposed shortcut.",
    "refs": [
      "5-4"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "tour",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "14",
    "title": "Run a checker, then a tiny exact search",
    "question": "Python verifies whether selected job indices sum to 15.",
    "a": [
      "Verification",
      "Check valid distinct indices and add their durations."
    ],
    "b": [
      "Search",
      "Try all 32 subsets of five jobs."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The checker rejects repeated indices even if they happen to sum to the target. Certificates must satisfy membership constraints too."
      },
      {
        "title": "Follow the change",
        "text": "The search calls the checker on candidates. It returns every valid subset for this small input."
      },
      {
        "title": "Explain the result",
        "text": "A short verification program is not a polynomial-time search algorithm: the outer candidate loop still has 2ⁿ possibilities."
      }
    ],
    "lesson": "Separate the verifier’s work from the search loop’s work.",
    "check": "What should the valid subset [0,1] represent?",
    "answer": "Jobs 8 and 7, totaling 15. Indices are zero-based in the code.",
    "extra": "This exhaustive demo is deliberately small. Increasing input size makes the candidate loop grow exponentially.",
    "refs": [
      "1-1",
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "python",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "14",
    "title": "Finish by choosing the right promise",
    "question": "A complexity result helps set realistic expectations for an engineering solver.",
    "a": [
      "Exact methods",
      "Use structure, DP, branch and bound or an exact solver when feasible."
    ],
    "b": [
      "Approximate methods",
      "Use a proven approximation or a heuristic with measured bounds."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "NP-completeness does not prove every instance is hard, nor does it prove no polynomial algorithm exists unless P ≠ NP is established."
      },
      {
        "title": "Follow the change",
        "text": "For a new problem, specify inputs, constraints, objective and verification. Then inspect whether known structure or reductions apply."
      },
      {
        "title": "Explain the result",
        "text": "Course recap: define the question, choose a representation, justify correctness, count work and test boundary cases. AI-generated code still needs these checks."
      }
    ],
    "lesson": "Understand what the solver guarantees before trusting its output.",
    "check": "If a solver times out, has it proved the instance has no solution?",
    "answer": "No. A timeout is a resource limit, not a mathematical certificate of impossibility.",
    "extra": "P versus NP remains open. This lesson focuses on what the definitions and established reductions actually imply.",
    "refs": [
      "5-1",
      "5-5",
      "recap",
      "8-1",
      "8-2"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "recap",
    "minutes": 8,
    "block": "Reductions, NP-completeness and engineering choices",
    "start": 172,
    "end": 180
  }
];
