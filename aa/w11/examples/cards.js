const cards = [
  {
    "id": 1,
    "week": "11",
    "title": "The cheapest network is not the cheapest trip",
    "question": "Recall triangle AB = 2, BC = 2, AC = 3.",
    "a": [
      "Install a network",
      "The MST uses AB and BC, total 4."
    ],
    "b": [
      "Travel from A to C",
      "The direct edge costs 3, less than the tree route costing 4."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Last week we minimized the sum of installed cables. This week we minimize the sum of weights along a route from a source."
      },
      {
        "title": "Follow the change",
        "text": "A source is the starting vertex. A target is the destination. The route can pass through intermediate vertices."
      },
      {
        "title": "Explain the result",
        "text": "DFS finds reachable vertices; a topological order respects directed dependencies. Neither alone solves every weighted shortest-path problem."
      }
    ],
    "lesson": "First decide which quantity you want to minimize.",
    "check": "Does an MST necessarily contain the shortest route from A to C?",
    "answer": "No. Here its route costs 4 while the direct edge costs 3.",
    "extra": "Weights may represent time, distance or a modeled energy cost. The graph and its meaning must be stated.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "mst",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "11",
    "title": "Fewer roads can still take longer",
    "question": "Compare direct A → D = 10 with A → B → C → D, each edge costing 1.",
    "a": [
      "Fewest edges",
      "One edge, cost 10."
    ],
    "b": [
      "Smallest total",
      "Three edges, cost 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "BFS explores by number of edges. It discovers the direct destination in one move."
      },
      {
        "title": "Follow the change",
        "text": "For travel time, add the weights: the three-edge route costs 1 + 1 + 1 = 3."
      },
      {
        "title": "Explain the result",
        "text": "When all edges have the same positive cost, minimizing edge count also minimizes total cost. With different costs, it may not."
      }
    ],
    "lesson": "Count edges for BFS; add weights for a weighted shortest route.",
    "check": "Which route is better if every edge costs 1?",
    "answer": "The direct route: one move costs 1, compared with three moves costing 3.",
    "extra": "We compare routes allowed by the graph. An arrow permits travel only in its displayed direction.",
    "refs": [
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "hops",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "11",
    "title": "Adding the same number can change the winner",
    "question": "A three-edge route costs 1 + 1 + 1; a direct route costs 4.",
    "a": [
      "Before adding 10",
      "Three edges cost 3, direct costs 4."
    ],
    "b": [
      "After adding 10 per edge",
      "Three edges cost 33, direct costs 14."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The original winner is the three-edge route because 3 is smaller than 4."
      },
      {
        "title": "Follow the change",
        "text": "Adding 10 to each edge charges the longer route three extra fees, but the direct route only one."
      },
      {
        "title": "Explain the result",
        "text": "This can reverse the ranking. It is not a valid way to remove negative weights before using Dijkstra."
      }
    ],
    "lesson": "A constant added per edge is not a constant added per route.",
    "check": "What if both competing routes have exactly two edges?",
    "answer": "Both gain 20, so their relative cost stays unchanged. Different edge counts cause this problem.",
    "extra": "Multiplying every edge by the same positive number preserves route comparisons; adding a constant generally does not.",
    "refs": [
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "shift",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "11",
    "title": "Relax means: test a cheaper offer",
    "question": "Our best known route to B costs 2. Edge B → C costs 1.",
    "a": [
      "Current C offer",
      "A direct route costs 5."
    ],
    "b": [
      "Via B",
      "2 + 1 = 3, so replace 5 with 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "dist[v] stores the best route cost found so far. It is a known feasible cost, not always the final shortest cost."
      },
      {
        "title": "Follow the change",
        "text": "For edge u → v of weight w, compute candidate = dist[u] + w. Update only if candidate is strictly smaller."
      },
      {
        "title": "Explain the result",
        "text": "When the number improves, set parent[v] = u. That remembers the last edge of the improved route."
      }
    ],
    "lesson": "Relaxation is a comparison followed by a possible update.",
    "check": "What if C already has cost 3?",
    "answer": "The equal offer does not update it in our implementation. Its existing parent remains.",
    "extra": "∞ means no route has been found yet. Do not relax out of an unreachable vertex.",
    "refs": [
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "small",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "11",
    "title": "Store a parent to recover the route",
    "question": "At the end, C has cost 3 and parent B; B has parent A.",
    "a": [
      "Backward lookup",
      "C → B → A follows parent records."
    ],
    "b": [
      "Forward journey",
      "Reverse that list: A → B → C."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A distance alone says how much a route costs. Parent records say which route produced that cost."
      },
      {
        "title": "Follow the change",
        "text": "Start at the target and follow parents until the source is reached, then reverse the list."
      },
      {
        "title": "Explain the result",
        "text": "A shortest route has shortest subroutes when finite shortest distances exist. Otherwise replacing a subroute by a cheaper one would improve the whole route."
      }
    ],
    "lesson": "A parent record is the previous vertex on the chosen route.",
    "check": "What if the target still has distance ∞?",
    "answer": "Report unreachable. Do not invent a route or treat ∞ as a large travel time.",
    "extra": "Only reconstruct after the algorithm finishes successfully. Parents around a reachable negative cycle do not define a shortest route.",
    "refs": [
      "1-3",
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "parents",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "11",
    "title": "Dijkstra finishes the smallest current offer",
    "question": "Use A → B = 2, A → C = 5, B → C = 1.",
    "a": [
      "After processing A",
      "B has offer 2; C has offer 5."
    ],
    "b": [
      "After processing B",
      "C improves to 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Start with source A at 0 and everyone else at ∞. Select the smallest unsettled distance."
      },
      {
        "title": "Follow the change",
        "text": "Settle A, then B. Relax B → C and improve C from 5 to 3. Settle C last."
      },
      {
        "title": "Explain the result",
        "text": "With nonnegative weights, a detour through a vertex with a larger distance cannot later create a smaller cost for the settled vertex."
      }
    ],
    "lesson": "Nonnegative weights make Dijkstra’s finalization rule safe.",
    "check": "Is zero allowed as an edge cost?",
    "answer": "Yes. Zero cannot reduce the total cost already paid, so the nonnegative-weight argument still applies.",
    "extra": "Settled means the shortest distance is final under the algorithm’s assumptions. It does not mean every route to that vertex was examined.",
    "refs": [
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2-6"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "small",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "11",
    "title": "Follow the lecture’s five-vertex graph",
    "question": "Graph W is undirected, with source A.",
    "a": [
      "Early estimate for D",
      "Via C: 1 + 8 = 9."
    ],
    "b": [
      "Better estimate for D",
      "Via C and B: 1 + 2 + 5 = 8."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Settle A at 0, then C at 1. C improves B from 4 to 3 and gives D an offer of 9."
      },
      {
        "title": "Follow the change",
        "text": "Settle B at 3. BD = 5 improves D to 8. D’s outgoing edge to E offers 8 + 3 = 11."
      },
      {
        "title": "Explain the result",
        "text": "E already has cost 11 through C. Strict improvement keeps its old parent C. Both routes cost 11, but our table records one."
      }
    ],
    "lesson": "A later relaxation can improve an unsettled estimate.",
    "check": "What are the final distances A, B, C, D, E?",
    "answer": "0, 3, 1, 8, 11. For E, A–C–E and A–C–B–D–E both cost 11.",
    "extra": "Tie handling can change the parent tree without changing shortest distances.",
    "refs": [
      "2-5"
    ],
    "ref": "lecture-notes.html#topic-2-5",
    "visual": "weighted",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "11",
    "title": "Old queue entries are not new routes to process",
    "question": "C was queued with cost 5, then improved to 3.",
    "a": [
      "Useful entry",
      "The queued cost equals the current dist[C]."
    ],
    "b": [
      "Stale entry",
      "The queued cost 5 no longer equals dist[C] = 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A simple heap implementation pushes the improved pair without deleting the older pair."
      },
      {
        "title": "Follow the change",
        "text": "When a pair is popped, compare its stored cost to the current distance. Skip an outdated pair."
      },
      {
        "title": "Explain the result",
        "text": "Do not confuse Dijkstra’s full route cost with Prim’s single-edge connection key. The update formulas answer different questions."
      }
    ],
    "lesson": "Skip stale queue records and keep the correct meaning of the priority.",
    "check": "What does Dijkstra compare when relaxing B → C?",
    "answer": "dist[B] + weight(B,C), the entire route cost. Prim compares only the connecting edge weight.",
    "extra": "Array-based Dijkstra takes O(n² + m). A standard heap implementation on a simple graph takes O((n + m) log n). Our teaching trace sorts a small list instead of using an efficient heap.",
    "refs": [
      "2-2",
      "2-7"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "small",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "11",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain why one route beats another."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "Which assumption mattered most?",
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
    "week": "11",
    "title": "One negative edge can break finalization",
    "question": "A → B = 2, A → C = 5, C → B = −4.",
    "a": [
      "Early decision",
      "A settled-once Dijkstra would finalize B at 2."
    ],
    "b": [
      "Later discovery",
      "A → C → B costs 5 − 4 = 1."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The negative edge can lower the total cost after a larger prefix cost. That defeats the proof used by Dijkstra."
      },
      {
        "title": "Follow the change",
        "text": "A negative edge does not make every run wrong, but it removes the general correctness guarantee."
      },
      {
        "title": "Explain the result",
        "text": "Use an algorithm that supports negative weights. The visual computes this example with Bellman–Ford; our Dijkstra runner rejects negative input."
      }
    ],
    "lesson": "A counterexample is enough to reject a general guarantee.",
    "check": "Is there a negative cycle in this example?",
    "answer": "No. There is no route back to A or C from B. A negative edge and a negative cycle are different things.",
    "extra": "Negative costs may model credits or recovered energy, not negative travel time. Physical battery constraints may require a richer state model.",
    "refs": [
      "3-1",
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "negative",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "11",
    "title": "Bellman–Ford keeps offering improvements",
    "question": "Use S → A = 4, S → B = 2, B → A = −3, A → C = 1, B → C = 5.",
    "a": [
      "First offers",
      "A becomes 4 and B becomes 2."
    ],
    "b": [
      "Better offers",
      "B improves A to −1, then A improves C to 0."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Start at S = 0. Scan every edge in the displayed input order, updating distances immediately."
      },
      {
        "title": "Follow the change",
        "text": "In this order, several edges can carry an improvement forward during the same pass. It is not limited to exactly one edge of progress per pass."
      },
      {
        "title": "Explain the result",
        "text": "Scan again. If a whole pass makes no improvement, stop. Otherwise at most n − 1 relaxation passes are needed when no reachable negative cycle exists."
      }
    ],
    "lesson": "A full pass revisits every edge; it does not permanently settle vertices.",
    "check": "What is the final cost to C?",
    "answer": "0, using S → B → A → C: 2 − 3 + 1 = 0.",
    "extra": "The trace uses in-place updates. A version that copies the previous distance table each pass has different intermediate tables.",
    "refs": [
      "3-3",
      "3-4"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "bellman",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "11",
    "title": "The edge order changes progress, not the answer",
    "question": "Run the same graph with its edge list reversed.",
    "a": [
      "Helpful order",
      "An improvement can travel through several edges in one pass."
    ],
    "b": [
      "Unhelpful order",
      "An edge may be inspected before its source gets a useful distance."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Reversing the list does not reverse the arrows. It only changes which edge is examined first."
      },
      {
        "title": "Follow the change",
        "text": "An edge that was too early gets another chance next pass. Eventually the same finite distances are found."
      },
      {
        "title": "Explain the result",
        "text": "For the lecture’s other example, S → A = 6, S → B = 7, A → C = 5, B → C = −2, C → A = −3, the final distances are A = 2, B = 7, C = 5."
      }
    ],
    "lesson": "Write the edge order when tracing a pass by hand.",
    "check": "In the second example, is A → C → A a negative cycle?",
    "answer": "No. Its cost is 5 − 3 = 2. Repeating it makes a route more expensive.",
    "extra": "The first scenario reverses the previous example’s edge order. The following scenario traces the second lecture example.",
    "refs": [
      "3-4",
      "3-5"
    ],
    "ref": "lecture-notes.html#topic-3-4",
    "visual": "order",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "11",
    "title": "Why n − 1 passes can be enough",
    "question": "A simple route visits each of n vertices at most once.",
    "a": [
      "Route length",
      "At most n − 1 edges."
    ],
    "b": [
      "Pass guarantee",
      "After k passes, routes using at most k edges have had enough opportunities to propagate."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "If no reachable negative cycle exists, remove repeated cycles from a shortest walk without making it more expensive. A simple shortest route remains."
      },
      {
        "title": "Follow the change",
        "text": "After the first pass, every one-edge route from the source has been considered. Each later pass can extend the previous guarantee by one more edge."
      },
      {
        "title": "Explain the result",
        "text": "A pass may make even more progress because updates are immediate. n − 1 is a worst-case bound, not a required number for every example."
      }
    ],
    "lesson": "A path-length argument explains the pass limit.",
    "check": "How many relaxation passes are sufficient for five vertices without a reachable negative cycle?",
    "answer": "At most four, followed by a check for any further possible improvement.",
    "extra": "Standard worst-case work is O(nm), plus O(n) initialization. On graphs with no edges, initialization still matters.",
    "refs": [
      "3-6",
      "3-7"
    ],
    "ref": "lecture-notes.html#topic-3-6",
    "visual": "passes",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "11",
    "title": "A loop can make the cost fall forever",
    "question": "S → A = 1, A → B = 2, B → C = −4, C → A = 1.",
    "a": [
      "One loop",
      "A → B → C → A costs −1."
    ],
    "b": [
      "Repeat the loop",
      "Each extra circuit reduces the walk cost by another 1."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The source can reach the loop. Costs to its vertices keep falling: there is no smallest finite value."
      },
      {
        "title": "Follow the change",
        "text": "After n − 1 passes, an edge can still improve. That is evidence of a reachable negative cycle."
      },
      {
        "title": "Explain the result",
        "text": "Only targets reachable from such a cycle have unbounded-below cost. A cycle in a disconnected region does not affect this source’s distances."
      }
    ],
    "lesson": "Report affected destinations as unbounded, not as ordinary shortest routes.",
    "check": "Does every vertex in the graph become −∞?",
    "answer": "No. The source S cannot be reached back from the loop in this example, so its distance remains 0. A, B and C are affected.",
    "extra": "Shortest-path algorithms here allow repeated walks when discussing negative cycles. A simple-path-only optimization is a different problem.",
    "refs": [
      "3-1",
      "3-3",
      "3-6"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "cycle",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "11",
    "title": "A DAG lets us process each vertex once",
    "question": "Use A → B = 2, A → C = 5, C → B = −4.",
    "a": [
      "A valid topological order",
      "A, C, B."
    ],
    "b": [
      "Shortest distances",
      "A = 0, C = 5, B = 1."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A DAG is a directed graph without cycles. A topological order puts every edge’s source before its destination."
      },
      {
        "title": "Follow the change",
        "text": "Process A, then C, then B, relaxing outgoing edges. Every possible predecessor of B has already been handled before B is processed."
      },
      {
        "title": "Explain the result",
        "text": "Negative weights are safe here: the ordering, rather than nonnegative weights, ensures that later vertices cannot send improvements backward."
      }
    ],
    "lesson": "In a DAG, dependency order can replace a priority queue.",
    "check": "Would A, B, C be a valid topological order?",
    "answer": "No. The edge C → B requires C to appear before B.",
    "extra": "First verify acyclicity. A topological traversal and all relaxations take O(n + m).",
    "refs": [
      "4-1"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "dag",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "11",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain why one route beats another."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "Which assumption mattered most?",
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
    "week": "11",
    "title": "Floyd–Warshall answers every pair",
    "question": "A → B = 2, B → C = 1, A → C = 5.",
    "a": [
      "Direct table",
      "A to C initially costs 5."
    ],
    "b": [
      "Allow B as an intermediate",
      "A to B plus B to C costs 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Rows are starting vertices; columns are destinations. Initialize diagonal entries to 0 and missing routes to ∞."
      },
      {
        "title": "Follow the change",
        "text": "For each intermediate vertex k, test every pair i, j: is dist[i,k] + dist[k,j] smaller than dist[i,j]?"
      },
      {
        "title": "Explain the result",
        "text": "Keep k as the outer loop. After every k, the table permits routes through all intermediates processed so far."
      }
    ],
    "lesson": "A small table can hold shortest distances for all source–target pairs.",
    "check": "How does doubling the number of vertices change n³ work?",
    "answer": "It multiplies the main triple-loop work by eight. A 200-vertex table uses 200³ = 8,000,000 pair checks.",
    "extra": "Floyd–Warshall uses Θ(n³) time and Θ(n²) space. A negative diagonal detects a negative cycle; pairs that can reach and leave that cycle need separate −∞ handling.",
    "refs": [
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-2",
    "visual": "floyd",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "11",
    "title": "Try your own weighted arrows",
    "question": "Edit edges between A, B, C, D and E; the source is A.",
    "a": [
      "Positive or zero weights",
      "Bellman–Ford still works. Dijkstra would also be suitable."
    ],
    "b": [
      "Negative weights",
      "Check for reachable negative cycles before reporting routes."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Each line means source, destination, cost. A B 4 means A → B costs 4, not a two-way corridor."
      },
      {
        "title": "Follow the change",
        "text": "Predict an improvement, then trace the edge scans. The distances and parent records are calculated from your input."
      },
      {
        "title": "Explain the result",
        "text": "Try isolating E, adding a shortcut, or creating a negative loop. The final screen distinguishes finite, unreachable and unbounded destinations."
      }
    ],
    "lesson": "Changing the case recomputes the result.",
    "check": "What happens with no edges?",
    "answer": "A has distance 0. B, C, D and E are unreachable, shown as ∞.",
    "extra": "All five vertices always exist. No self-loops or repeated directed pairs in this editor. Opposite arrows are allowed.",
    "refs": [
      "1-4",
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "editor",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "11",
    "title": "Run Dijkstra in Python",
    "question": "The code uses the small A, B, C example.",
    "a": [
      "Heap",
      "Pop the smallest stored distance."
    ],
    "b": [
      "Relaxation",
      "Push a new record only when an offer improves."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The graph gives outgoing edges as destination–weight pairs. Initialization sets source A to 0 and the other vertices to infinity."
      },
      {
        "title": "Follow the change",
        "text": "The heap returns the cheapest pending offer. If it is stale, continue without reprocessing that record."
      },
      {
        "title": "Explain the result",
        "text": "For every outgoing edge, compare cost + weight with the current estimate. Update the distance and parent together. The code rejects negative weights."
      }
    ],
    "lesson": "The numbers, queue and parents in the visual match the code.",
    "check": "Change the B → C weight from 1 to 10. What happens?",
    "answer": "The direct A → C route costing 5 wins; C’s parent stays A. B still costs 2.",
    "extra": "Every destination must be a graph key. Each run starts fresh, and this example needs no input() values.",
    "refs": [
      "2-2",
      "2-7"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "python",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "11",
    "title": "A robot can take more moves and arrive sooner",
    "question": "Two rows: S, mud, goal above three detour cells.",
    "a": [
      "Direct route",
      "Enter mud for 8, then goal for 1: total 9 in two moves."
    ],
    "b": [
      "Detour",
      "Enter cells costing 3, 3, 1, then goal for 1: total 8 in four moves."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Moves are up, down, left or right. The cost is charged when entering the destination cell; the starting cell costs nothing."
      },
      {
        "title": "Follow the change",
        "text": "BFS selects the two-move route. Dijkstra compares accumulated terrain costs and chooses the four-move route."
      },
      {
        "title": "Explain the result",
        "text": "If mud changes to cost 1, the direct route costs 2 and becomes best. A correct answer depends on the actual movement rules and weights."
      }
    ],
    "lesson": "Fewest moves and smallest travel cost can disagree.",
    "check": "Why is the detour cost 8 rather than 7?",
    "answer": "The robot must also enter the goal cell, which costs 1. So the sum is 3 + 3 + 1 + 1.",
    "extra": "The visual labels every cell’s entry cost. It computes both routes on this grid.",
    "refs": [
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "robot",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "11",
    "title": "A* adds a safe estimate of what remains",
    "question": "On the same four-direction grid, every move costs at least 1.",
    "a": [
      "g",
      "The route cost paid so far."
    ],
    "b": [
      "h",
      "Manhattan steps to the goal times minimum entry cost 1."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A* prioritizes g + h. Manhattan distance is the horizontal plus vertical separation from the goal."
      },
      {
        "title": "Follow the change",
        "text": "Here one move changes h by at most 1 and costs at least 1, so h is consistent: h(u) ≤ cost(u,v) + h(v)."
      },
      {
        "title": "Explain the result",
        "text": "With this consistent estimate, a closed-set A* can keep settled cells closed and still return an optimal route. It may explore fewer cells; it is not guaranteed to do so on every map."
      }
    ],
    "lesson": "A useful estimate guides the search without overstating the remaining cost.",
    "check": "What if h is always zero?",
    "answer": "A* uses g alone and behaves like Dijkstra, with the same tie rule.",
    "extra": "Admissibility alone needs care for graph search: inconsistent estimates can require reopening improved states. The estimate here is consistent.",
    "refs": [
      "5-1",
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "astar",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "11",
    "title": "Choose from the assumptions, not the name",
    "question": "A robot route, a dependency graph and an all-room distance table need different tools.",
    "a": [
      "One source",
      "BFS for equal positive weights; Dijkstra for nonnegative weights; Bellman–Ford when negatives are possible."
    ],
    "b": [
      "Special structure",
      "Use topological relaxation on a DAG; consider Floyd–Warshall for all pairs on a modest graph."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Ask what an edge means, whether it is directed, and what its weight measures."
      },
      {
        "title": "Follow the change",
        "text": "Ask whether you need one target, one source to all vertices, or all pairs. Check for negative weights, cycles and DAG structure."
      },
      {
        "title": "Explain the result",
        "text": "Explain the chosen route by adding its weights. Check unreachable targets and negative-cycle effects before presenting a number as final."
      }
    ],
    "lesson": "Algorithm choice follows the problem’s assumptions.",
    "check": "A directed acyclic graph has negative edges. Must you use Bellman–Ford?",
    "answer": "No. Topological relaxation works in O(n + m) and supports negative weights because a DAG has no cycles.",
    "extra": "Scheduling longest dependency chains is a different objective from shortest routes. Energy recovery models must also respect battery capacity and other physical limits.",
    "refs": [
      "5-1",
      "5-2",
      "6-1",
      "6-2"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "choose",
    "minutes": 8,
    "block": "Shortest routes and their assumptions",
    "start": 172,
    "end": 180
  }
];
