const cards = [
  {
    "id": 1,
    "week": "10",
    "title": "Connect every place, not every pair",
    "question": "A factory needs a cable network between its stations.",
    "a": [
      "Connected",
      "A message can reach every station, possibly through other stations."
    ],
    "b": [
      "Directly connected",
      "A cable joins two stations without an intermediate station."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Each vertex is a station. Each undirected edge is an allowed cable route. Its weight is the cost of installing that cable."
      },
      {
        "title": "Follow the change",
        "text": "BFS and DFS can find connections, but their ordinary versions do not choose the cheapest total installation."
      },
      {
        "title": "Explain the result",
        "text": "A tree connects all its vertices without a cycle. A tree with n vertices has n − 1 edges. Five stations need four edges in a tree."
      }
    ],
    "lesson": "Ask what the cost measures before choosing an algorithm.",
    "check": "Does every station need a direct cable to every other station?",
    "answer": "No. A connected network may relay messages through other stations.",
    "extra": "We model undirected graphs. Physical cable costs are nonnegative; MST algorithms also work with negative weights when the solution is required to be a tree.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "warmup",
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "intro",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "10",
    "title": "Three stations, three possible trees",
    "question": "Cable costs: AB = 1, BC = 2, AC = 3.",
    "a": [
      "Choose AB and BC",
      "All three stations connect. Total cost is 3."
    ],
    "b": [
      "Choose AB and AC",
      "All three stations still connect. Total cost is 4."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A spanning tree includes every vertex, with no cycle. Here it must contain exactly two edges."
      },
      {
        "title": "Follow the change",
        "text": "Try all three pairs. Their totals are 3, 4 and 5. They all connect the three stations."
      },
      {
        "title": "Explain the result",
        "text": "The cheapest pair is AB and BC. That is the minimum spanning tree, or MST. Taking all three edges would form a cycle."
      }
    ],
    "lesson": "Minimum means the smallest total among spanning trees.",
    "check": "Why not choose just AB, with cost 1?",
    "answer": "It leaves C disconnected. A cheaper invalid solution does not solve the problem.",
    "extra": "The answer minimizes the sum of selected edge weights, not the length of each individual route.",
    "refs": [
      "1-2",
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "triangle",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "10",
    "title": "Trying every choice becomes expensive",
    "question": "Graph W has five vertices and seven possible cables.",
    "a": [
      "All candidates",
      "There are 35 ways to choose four of the seven edges."
    ],
    "b": [
      "Valid trees",
      "Only 21 of those choices are connected trees."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A candidate with four edges may still contain a cycle and leave one station isolated. The edge count alone does not prove it is a tree."
      },
      {
        "title": "Follow the change",
        "text": "Check connectivity and cycles, then compare costs only among valid trees."
      },
      {
        "title": "Explain the result",
        "text": "For this small graph, checking every candidate finds minimum cost 11. With many edges, enumerating subsets soon becomes impractical."
      }
    ],
    "lesson": "Use brute force as a small-example check, not a large-network plan.",
    "check": "Can five vertices and four selected edges still be disconnected?",
    "answer": "Yes. A triangle plus a separate two-vertex edge has four edges but two components.",
    "extra": "The visual lists the graph and counts all candidate subsets directly. Prim and Kruskal avoid this exhaustive search.",
    "refs": [
      "1-3"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "enumerate",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "10",
    "title": "Split the stations into two sides",
    "question": "In Graph W, put A, B and C on one side; D and E on the other.",
    "a": [
      "Crossing edges",
      "BD costs 5, CD costs 8, CE costs 10."
    ],
    "b": [
      "Internal edges",
      "AB, AC, BC and DE stay within one side."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A cut divides all vertices into two nonempty groups. A crossing edge has one endpoint in each group."
      },
      {
        "title": "Follow the change",
        "text": "Any spanning tree needs at least one crossing edge. Otherwise the two sides cannot communicate."
      },
      {
        "title": "Explain the result",
        "text": "BD is the cheapest crossing edge. The cut property says this edge belongs to some MST. If the lightest crossing edge is unique, every MST contains it."
      }
    ],
    "lesson": "The cheapest crossing edge is safe; an internal edge does not cross this cut.",
    "check": "Is DE a candidate for joining these two sides?",
    "answer": "No. Both D and E are on the same side. Its low cost of 3 does not make it a crossing edge.",
    "extra": "For a greedy algorithm, choose cuts that no already-selected edge crosses. This preserves the ability to extend the selected forest to an MST.",
    "refs": [
      "2-1",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "cut",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "10",
    "title": "Replace an expensive bridge",
    "question": "Start with the tree AB, BC, CD, DE, costing 17.",
    "a": [
      "Add BD = 5",
      "This creates cycle B–C–D–B."
    ],
    "b": [
      "Remove CD = 8",
      "The graph remains a tree and the total falls to 14."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Adding one edge to a tree creates exactly one cycle: the new edge plus the existing path between its endpoints."
      },
      {
        "title": "Follow the change",
        "text": "Remove another edge from that cycle. Here replacing CD with BD keeps every station connected and saves 3."
      },
      {
        "title": "Explain the result",
        "text": "For the cut-property proof, start with an MST. The cheapest crossing edge can replace a crossing edge on the cycle without increasing cost. The new tree is also an MST."
      }
    ],
    "lesson": "Exchange one edge while keeping the tree valid.",
    "check": "Is the illustrated cost-14 tree already minimum?",
    "answer": "No. Replace AB = 4 with AC = 1 to reach 11. The initial cost-17 tree was not an MST either.",
    "extra": "If the proof starts with a true MST, an exchange cannot make it strictly cheaper. The cost must stay equal.",
    "refs": [
      "2-2"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "exchange",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "10",
    "title": "Prim grows one connected network",
    "question": "Start at A in Graph W.",
    "a": [
      "Inside",
      "Vertices already connected to A by selected edges."
    ],
    "b": [
      "Outside",
      "Vertices not yet in this growing tree."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Start with A and no edge. Compare only edges that cross from the current tree to an outside vertex."
      },
      {
        "title": "Follow the change",
        "text": "Take AC = 1. Now A and C are inside. BC = 2 is the cheapest next crossing edge, so add B."
      },
      {
        "title": "Explain the result",
        "text": "Next take BD = 5, then DE = 3. The selected costs are 1 + 2 + 5 + 3 = 11."
      }
    ],
    "lesson": "Prim always adds the cheapest edge across the current boundary.",
    "check": "Why not take DE = 3 before BD = 5?",
    "answer": "At that moment D and E are both outside. DE does not connect to Prim’s growing tree yet.",
    "extra": "This example starts at A. Different starts can change selection order; they do not change the minimum total.",
    "refs": [
      "3-1",
      "3-2",
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "prim",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "10",
    "title": "Prim’s key is one edge, not a whole route",
    "question": "After adding C, B has two possible connections to the tree.",
    "a": [
      "Old offer",
      "AB costs 4."
    ],
    "b": [
      "Better offer",
      "CB costs 2, so B’s key becomes 2."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A key records the cheapest single edge currently connecting an outside vertex to the tree."
      },
      {
        "title": "Follow the change",
        "text": "When B joins, D’s offer improves from CD = 8 to BD = 5. When D joins, E’s offer improves from CE = 10 to DE = 3."
      },
      {
        "title": "Explain the result",
        "text": "Do not add the route cost from A to B when updating D. That calculation belongs to a shortest-path problem, not Prim."
      }
    ],
    "lesson": "Keep the cheapest connection offer for each outside vertex.",
    "check": "After B joins, is D’s key 5 or 8?",
    "answer": "5. It is the weight of BD, not the cost of the full A–C–B–D route, which is 8.",
    "extra": "The step trace displays every current offer. A dash means no connection from the tree is known yet.",
    "refs": [
      "3-2",
      "3-5"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "prim",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "10",
    "title": "Count work using the implementation",
    "question": "Compare a simple scan-based Prim with sorted-edge Kruskal.",
    "a": [
      "Simple Prim",
      "Repeat a scan of n candidates about n times: work grows like n²."
    ],
    "b": [
      "Kruskal",
      "Sort m edges: comparison sorting takes O(m log m), then test connections."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "n counts vertices; m counts edges. They are different inputs. A dense graph can have about n² edges."
      },
      {
        "title": "Follow the change",
        "text": "For simple Prim, doubling n roughly quadruples the main scanning work. A heap-based implementation has a different bound."
      },
      {
        "title": "Explain the result",
        "text": "For Kruskal, sorting usually dominates. Include O(n) initialization for isolated vertices: O(n + m log m) with efficient union-find, for m at least 2."
      }
    ],
    "lesson": "A cost claim belongs to a particular implementation.",
    "check": "Does the short Prim demo below prove that all Prim implementations cost n²?",
    "answer": "No. Our teaching trace scans crossing edges, so its own worst-case work is O(nm). The standard array/matrix implementation achieves O(n²).",
    "extra": "With adjacency lists and a binary heap, Prim has O((n + m) log n) time. Log means slow-growing repeated-halving scale, not a time unit.",
    "refs": [
      "3-4",
      "4-6",
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-3-4",
    "visual": "cost",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "10",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one edge choice in your own words."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What makes an edge safe to add?",
    "answer": "Keep a short reminder of the rule you just used.",
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
    "week": "10",
    "title": "Kruskal may build several small pieces",
    "question": "Sort Graph W’s edges from cheapest to most expensive.",
    "a": [
      "Accept",
      "An edge joins two currently separate components."
    ],
    "b": [
      "Reject",
      "Its endpoints already have a selected path between them."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Take AC = 1, BC = 2, and DE = 3. Two separate pieces now exist: ABC and DE."
      },
      {
        "title": "Follow the change",
        "text": "AB = 4 would close cycle A–C–B–A. Reject it even though its weight is smaller than BD’s."
      },
      {
        "title": "Explain the result",
        "text": "Take BD = 5 to join the two pieces. Four accepted edges connect five vertices. The total is 11."
      }
    ],
    "lesson": "Sort globally, but accept only edges that join different components.",
    "check": "Why is rejecting AB safe?",
    "answer": "Its endpoints are already connected through selected edges. Adding it would violate the no-cycle condition.",
    "extra": "Ties use input order in these traces. Prim and Kruskal can select different edges when more than one MST exists.",
    "refs": [
      "4-1",
      "4-3",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "kruskal",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "10",
    "title": "A larger example uses the same rule",
    "question": "Graph H has seven vertices and repeated weights.",
    "a": [
      "First five accepted edges",
      "AD = 5, CE = 5, DF = 6, AB = 7, BE = 7."
    ],
    "b": [
      "Last connection",
      "EG = 9 connects G to the other six vertices."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Sorting equal weights does not require inventing new costs. The demo keeps the original input order for ties."
      },
      {
        "title": "Follow the change",
        "text": "After the first five accepted edges, A through F are connected. BC = 8, EF = 8 and BD = 9 each stay inside that component, so reject them."
      },
      {
        "title": "Explain the result",
        "text": "Accept EG = 9. The six accepted edges cost 5 + 5 + 6 + 7 + 7 + 9 = 39."
      }
    ],
    "lesson": "The same component test works on larger graphs.",
    "check": "Must all edges with weight 9 receive the same decision?",
    "answer": "No. BD = 9 is rejected because it closes a cycle; EG = 9 is accepted because it joins G.",
    "extra": "Weight sets the order of consideration. Connectivity sets the accept/reject decision.",
    "refs": [
      "4-4"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "larger",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "10",
    "title": "Union-find asks: are we already connected?",
    "question": "Begin with six separate elements, numbered 1 to 6.",
    "a": [
      "find(x)",
      "Follow parent links to the representative of x’s group."
    ],
    "b": [
      "union(a, b)",
      "Join the roots if the groups are different."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Union 1 with 2, then 3 with 4. There are now two pairs and two single elements."
      },
      {
        "title": "Follow the change",
        "text": "Union 2 with 4. Their roots are 1 and 3, so merge those roots. Elements 1, 2, 3 and 4 now share a group."
      },
      {
        "title": "Explain the result",
        "text": "Union 5 with 6. A later union of 1 with 3 changes nothing because they already have the same root."
      }
    ],
    "lesson": "Compare group representatives, not just the two endpoint labels.",
    "check": "In Kruskal, what does an unsuccessful union mean?",
    "answer": "The endpoints are already connected by accepted edges, so this new edge would close a cycle and must be rejected.",
    "extra": "Union-find parent links are bookkeeping links. They are not necessarily cables in the original graph.",
    "refs": [
      "5-1",
      "5-2",
      "5-5"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "union",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "10",
    "title": "Small under large keeps the tree shallow",
    "question": "Compare arbitrary links with union by group size.",
    "a": [
      "Without the size rule",
      "A chain of eight elements can force seven parent-link steps to the root."
    ],
    "b": [
      "With the size rule",
      "Attach the smaller root tree under the larger root tree."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A vertex gets one level deeper only when its whole group is attached below another group."
      },
      {
        "title": "Follow the change",
        "text": "Under the size rule, that other group is at least as large. The new group therefore has at least twice as many elements."
      },
      {
        "title": "Explain the result",
        "text": "Starting with one element, three doublings reach eight. An eight-element union-by-size tree has depth at most three, before compression."
      }
    ],
    "lesson": "A depth increase must be paid for by a doubling in group size.",
    "check": "How many doublings take 1 to 16?",
    "answer": "Four: 1 → 2 → 4 → 8 → 16. This explains the log₂ n depth bound.",
    "extra": "The chain is a possible result without the size rule, not a possible height-eight outcome with that rule.",
    "refs": [
      "5-3",
      "5-6"
    ],
    "ref": "lecture-notes.html#topic-5-3",
    "visual": "size",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "10",
    "title": "A search can leave a shorter path behind",
    "question": "In the union example, 4 points to 3 and 3 points to 1.",
    "a": [
      "Before find(4)",
      "Follow 4 → 3 → 1: two parent-link steps."
    ],
    "b": [
      "After compression",
      "Point 4 straight to 1. Next time takes one step."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Find first locates the root. It must not change which group the element belongs to."
      },
      {
        "title": "Follow the change",
        "text": "Full path compression redirects every visited non-root element straight to that root."
      },
      {
        "title": "Explain the result",
        "text": "The group stays the same. Future searches have less walking to do. Size is meaningful at roots; compression does not change the group’s size."
      }
    ],
    "lesson": "Compression changes parent links, not connectivity.",
    "check": "Does compression make 4 a new group leader?",
    "answer": "No. The root remains 1. Only the route to that root becomes shorter.",
    "extra": "Our visual uses full compression. The archived Python example uses path halving; both shorten paths but update different links.",
    "refs": [
      "5-4",
      "5-7"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "compression",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "10",
    "title": "Nearly constant is not exactly one step",
    "question": "Repeat find on the same long chain.",
    "a": [
      "Without compression",
      "Every search repeats the entire walk."
    ],
    "b": [
      "With compression",
      "The first search is long; later searches are short."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For an eight-element chain, find at the deepest element follows seven links. Eight repeated searches without compression use 56 links."
      },
      {
        "title": "Follow the change",
        "text": "With full compression, the first search uses seven links and the next seven each use one: fourteen total."
      },
      {
        "title": "Explain the result",
        "text": "Union by size plus compression has a very slowly growing amortized bound. Amortized means we bound a sequence of operations, not promise that every single call takes one step."
      }
    ],
    "lesson": "Judge the total work across many operations.",
    "check": "Does a long first find contradict the amortized bound?",
    "answer": "No. It can shorten paths for many later operations. The bound concerns the whole sequence.",
    "extra": "Initialization costs O(n). A standard bound for q subsequent operations with both heuristics is O(n + q α(n)); α grows extraordinarily slowly. The chain demonstration isolates compression without the size rule.",
    "refs": [
      "5-4",
      "5-6"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "repeat",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "10",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one edge choice in your own words."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What makes an edge safe to add?",
    "answer": "Keep a short reminder of the rule you just used.",
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
    "week": "10",
    "title": "Change the cable prices yourself",
    "question": "Use A through E as the five stations.",
    "a": [
      "Connected input",
      "Prim and Kruskal should agree on minimum total cost."
    ],
    "b": [
      "Disconnected input",
      "There is no spanning tree of all five stations."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Enter one allowed edge per line, for example A B 4. The numbers are abstract costs; negative costs are allowed in this mathematical tree problem."
      },
      {
        "title": "Follow the change",
        "text": "Predict which edge will be accepted or rejected, then trace Kruskal. The graph, selected edges, components and sum come from your input."
      },
      {
        "title": "Explain the result",
        "text": "If an isolated station remains, report a minimum spanning forest. Never call separate trees one spanning tree."
      }
    ],
    "lesson": "A changed input requires a newly computed answer.",
    "check": "What happens if the edge list is empty?",
    "answer": "All five stations remain isolated. The forest has zero edges and cost 0, but no spanning tree exists.",
    "extra": "This editor uses a simple undirected graph: no self-loops or duplicate endpoint pairs. All five vertices always exist.",
    "refs": [
      "1-3",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "editor",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "10",
    "title": "Run Kruskal in the browser",
    "question": "The Python example uses Graph W.",
    "a": [
      "find",
      "Follow parent links and shorten paths."
    ],
    "b": [
      "Sorted loop",
      "Accept an edge only when its roots differ."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The parent and size dictionaries begin with one group per vertex. find returns a root and uses path halving to shorten a long path."
      },
      {
        "title": "Follow the change",
        "text": "The sorted loop examines edges by weight. Equal roots mean reject. Otherwise attach the smaller root group under the larger and record the edge."
      },
      {
        "title": "Explain the result",
        "text": "The final edge count tells us whether the result spans the whole graph. The sum is computed from accepted edges only."
      }
    ],
    "lesson": "The code implements the same decisions as the diagram.",
    "check": "Change BD from 5 to 20. What should the new total be?",
    "answer": "14: AC = 1, BC = 2, DE = 3 and CD = 8 connect all five vertices.",
    "extra": "Edit costs and run again. Every endpoint must be a declared vertex. No input() values are needed.",
    "refs": [
      "4-7",
      "5-7"
    ],
    "ref": "lecture-notes.html#topic-4-7",
    "visual": "python",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "10",
    "title": "Cheapest network is not shortest journey",
    "question": "Use triangle AB = 2, BC = 2, AC = 3.",
    "a": [
      "MST",
      "AB and BC cost 4 in total."
    ],
    "b": [
      "Shortest A-to-C route",
      "The direct AC edge costs 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The two cheapest edges form the MST. Installing these costs 4, and every station can communicate."
      },
      {
        "title": "Follow the change",
        "text": "Travel from A to C along that tree costs 2 + 2 = 4. The original graph offers a shorter direct route costing 3."
      },
      {
        "title": "Explain the result",
        "text": "Installing AC as well would improve that journey but would raise total network cost and create a cycle. These are different objectives."
      }
    ],
    "lesson": "Total installation cost and individual route cost are different questions.",
    "check": "Does an MST always include every shortest route?",
    "answer": "No. This triangle is a counterexample: the shortest A-to-C edge is excluded.",
    "extra": "For latency, reliability or capacity requirements, an MST alone may not be a suitable engineering design.",
    "refs": [
      "6-2"
    ],
    "ref": "lecture-notes.html#topic-6-2",
    "visual": "shortest",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "10",
    "title": "Equal weights do not always mean several answers",
    "question": "Compare triangles with weights 1, 1, 1 and 1, 1, 2.",
    "a": [
      "All three weights are 1",
      "Any two edges give an MST: three answers."
    ],
    "b": [
      "Only two weights are 1",
      "Both weight-1 edges must be chosen: one answer."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Distinct edge weights guarantee a unique MST in a connected graph."
      },
      {
        "title": "Follow the change",
        "text": "The converse is false: an MST can be unique even when some weights repeat."
      },
      {
        "title": "Explain the result",
        "text": "Compare complete valid trees, not just whether two numbers in the graph match. The visual enumerates the three tree choices in each triangle."
      }
    ],
    "lesson": "Repeated weights allow ties, but do not force multiple MSTs.",
    "check": "In triangle 1, 1, 2, why is the MST unique?",
    "answer": "The pair of weight-1 edges costs 2. Each alternative contains the weight-2 edge and costs 3.",
    "extra": "With ties, a lightest crossing edge belongs to some MST; it need not belong to every MST.",
    "refs": [
      "6-3"
    ],
    "ref": "lecture-notes.html#topic-6-3",
    "visual": "ties",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "10",
    "title": "Cable a gateway and three sensors",
    "question": "A is the gateway; B, C and D are sensors that can relay messages.",
    "a": [
      "Direct star",
      "AB = 3, AC = 5, AD = 8: total 16 metres."
    ],
    "b": [
      "MST",
      "BC = 2, AB = 3, CD = 4: total 9 metres."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "We pay for total installed cable. All listed routes are allowed, and a sensor can forward data to another sensor."
      },
      {
        "title": "Follow the change",
        "text": "Kruskal joins the nearest sensor pair, then the gateway, then D. All four devices become connected with three cables."
      },
      {
        "title": "Explain the result",
        "text": "The saving is 7 metres, but D’s route to A is 4 + 2 + 3 = 9 metres, longer than its direct 8-metre connection."
      }
    ],
    "lesson": "State what the client pays for and what the devices can do.",
    "check": "If one selected cable breaks, does an MST guarantee a backup route?",
    "answer": "No. Removing any tree edge disconnects the tree. Redundancy needs extra connections and a different design objective.",
    "extra": "This model assumes relay is allowed and cost is additive. It does not optimize bandwidth, delay or fault tolerance.",
    "refs": [
      "7-1",
      "8-1",
      "8-2"
    ],
    "ref": "lecture-notes.html#topic-7-1",
    "visual": "cable",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "10",
    "title": "Use the tree, but keep the assumptions",
    "question": "A tree can also help group points or build a simple visiting tour.",
    "a": [
      "Clustering",
      "Remove the k − 1 largest MST edges to leave k components."
    ],
    "b": [
      "Optional tour idea",
      "Walk each tree edge twice, then skip repeated visits when direct shortcuts are allowed."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "On chain A–B–C–D–E with weights 1, 1, 8, 1, removing the largest edge leaves groups ABC and DE. This is the single-linkage clustering idea."
      },
      {
        "title": "Follow the change",
        "text": "For a complete metric distance graph, shortcutting a doubled-tree walk cannot increase length because of the triangle inequality. The resulting tour costs at most twice the MST, hence at most twice an optimal tour."
      },
      {
        "title": "Explain the result",
        "text": "These applications have different goals. Clustering can join points through a thin chain, and the tour guarantee does not apply to arbitrary missing links or non-metric costs."
      }
    ],
    "lesson": "Name the objective and assumptions before reusing an algorithm.",
    "check": "How many edges must we remove from a tree to make three groups?",
    "answer": "Two. Each removed tree edge increases the component count by one. Start at one, then two, then three.",
    "extra": "The tour step is optional enrichment. Recap: Prim grows a tree; Kruskal merges components; union-find detects whether an edge closes a cycle.",
    "refs": [
      "7-2",
      "7-3"
    ],
    "ref": "lecture-notes.html#topic-7-2",
    "visual": "applications",
    "minutes": 8,
    "block": "Minimum spanning trees and union-find",
    "start": 172,
    "end": 180
  }
];
