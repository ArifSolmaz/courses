const cards = [
  {
    "id": 1,
    "week": "8",
    "title": "Choose the right waiting line",
    "question": "A robot discovers places B, C and D in that order.",
    "a": [
      "Queue: first in, first out",
      "Process B, then C, then D. Older discoveries stay ahead of newer ones."
    ],
    "b": [
      "Stack: last in, first out",
      "Process D first. This can follow one route deeply before returning to the others."
    ],
    "walkthrough": [
      {
        "title": "Recall the removal rule",
        "text": "The same records can be stored with different rules. A queue and a stack do not promise the same exploration order."
      },
      {
        "title": "Count two kinds of work",
        "text": "This week we count places visited and connections examined separately. Many connections can exist between relatively few places."
      },
      {
        "title": "Name the sizes",
        "text": "n is the number of vertices, or places. m is the number of edges, or connections. The letters describe different quantities."
      }
    ],
    "lesson": "BFS uses a FIFO queue to explore in distance layers.",
    "check": "Can a graph with many vertices have no edges?",
    "answer": "Yes. The vertices are all isolated. n can be large while m is zero.",
    "extra": "We use finite graphs. Most examples are simple: no repeated edges or edges from a vertex to itself.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "queue",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "8",
    "title": "A graph records what connects to what",
    "question": "Rooms A, B, C and D are joined by corridors AB, AC, BD and CD.",
    "a": [
      "Vertices",
      "A vertex represents a room. Its label is an identifier, not a position or a distance."
    ],
    "b": [
      "Edges",
      "An edge represents a direct corridor. A route from A to D may need more than one corridor."
    ],
    "walkthrough": [
      {
        "title": "Choose what the model represents",
        "text": "The same graph idea can model rooms, components, people, web pages or machine states. The meaning of an edge must be stated."
      },
      {
        "title": "Read adjacency",
        "text": "B and C are neighbors of A. D is not a direct neighbor of A, even though A can reach D through another room."
      },
      {
        "title": "Separate drawing from meaning",
        "text": "Moving a dot on the page does not change the graph. Only changing its vertices or edges changes its connectivity."
      }
    ],
    "lesson": "The model stores connections; the picture is one way to display them.",
    "check": "In this graph, are B and C directly connected?",
    "answer": "No. There is no BC edge. They can reach one another through A or D.",
    "extra": "A dictionary can map each vertex label to its neighbors. A vertex with no neighbors still needs a record.",
    "refs": [
      "1-1",
      "1-3"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "graph",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "8",
    "title": "One-way, two-way, cheap or expensive?",
    "question": "Compare a corridor, a one-way door and a route with a travel cost.",
    "a": [
      "Direction",
      "An undirected edge AB permits travel both ways. A directed edge A → B does not automatically permit B → A."
    ],
    "b": [
      "Weight",
      "A weight may mean time, distance or energy. An unweighted graph counts each traversed edge as one step."
    ],
    "walkthrough": [
      {
        "title": "Keep direction separate from weight",
        "text": "A graph can be directed and weighted, directed and unweighted, or undirected with either type of cost."
      },
      {
        "title": "Read the arrow",
        "text": "To find vertices reachable from a source, follow outgoing arrows. The reverse direction is a different question."
      },
      {
        "title": "Choose the right question",
        "text": "Fewest edges and smallest total weight are not always the same objective. Ordinary BFS solves the first."
      }
    ],
    "lesson": "State the edge rules before choosing an algorithm.",
    "check": "If A → B exists, must BFS starting at B discover A?",
    "answer": "No. A reverse route must actually exist.",
    "extra": "Self-loops and parallel edges are possible graph features, but our editable demos use simple graphs without them.",
    "refs": [
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "types",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "8",
    "title": "Change one connection and predict the effect",
    "question": "Begin with AB, AC, BD and CD. Add an isolated room E.",
    "a": [
      "No corridor to E",
      "E exists but is unreachable from A. It forms a separate component."
    ],
    "b": [
      "Add DE",
      "E becomes reachable from A in three edges, for example A → B → D → E."
    ],
    "walkthrough": [
      {
        "title": "Count the graph",
        "text": "The starting four-room graph has n = 4 and m = 4. Adding isolated E changes n but does not add an edge."
      },
      {
        "title": "Try a different case",
        "text": "The editor below accepts undirected edge pairs. Remove all edges, add a shortcut, or isolate a vertex and predict the BFS distances."
      },
      {
        "title": "Recompute from the model",
        "text": "The visual and distances are calculated from your edge list. They are not fixed answers pasted beside a changing picture."
      }
    ],
    "lesson": "Small edits can change reachability and shortest routes.",
    "check": "What does adding AD do to the distance from A to D?",
    "answer": "It becomes one edge. Other longer routes can still exist.",
    "extra": "Use distinct labels A through F. Each undirected pair is stored once in the input and in both directions in the neighbor lists.",
    "refs": [
      "1-4",
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "editor",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "8",
    "title": "Store the same graph in two ways",
    "question": "Represent the four-room graph AB, AC, BD, CD.",
    "a": [
      "Neighbor lists",
      "A: B,C; B: A,D; C: A,D; D: B,C. Each row lists only actual neighbors."
    ],
    "b": [
      "Adjacency matrix",
      "Use a row and column for every vertex. Entry 1 means an edge exists; 0 means it does not."
    ],
    "walkthrough": [
      {
        "title": "Match labels to positions",
        "text": "A matrix needs a fixed vertex order. We use A, B, C, D for both rows and columns."
      },
      {
        "title": "Notice symmetry",
        "text": "For an undirected graph, AB and BA entries match. A directed graph does not generally have this symmetry."
      },
      {
        "title": "Preserve isolated vertices",
        "text": "An empty neighbor list or an all-zero matrix row can represent a vertex with no outgoing edges. Do not silently omit it."
      }
    ],
    "lesson": "Two representations can encode exactly the same graph.",
    "check": "How many 1 entries appear in this undirected matrix?",
    "answer": "Eight. Each of the four edges appears in two symmetric positions.",
    "extra": "A simple unweighted matrix can use Boolean entries. Weighted graphs need a clear convention for absent edges, especially if zero is a valid weight.",
    "refs": [
      "2-1",
      "2-5"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "representations",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "8",
    "title": "Choose storage by the operations you need",
    "question": "Compare a sparse network with a graph containing almost every possible edge.",
    "a": [
      "Neighbor lists",
      "Storage is Θ(n + m). Enumerating one vertex’s neighbors costs proportional to its degree."
    ],
    "b": [
      "Matrix",
      "Storage is Θ(n²). Testing one specified edge is O(1), but scanning all neighbors requires reading a whole row."
    ],
    "walkthrough": [
      {
        "title": "Count concrete slots",
        "text": "For n = 6, a full matrix has 36 entries. Three undirected edges create six neighbor entries, plus six vertex-list headers."
      },
      {
        "title": "Separate counts from bytes",
        "text": "An array entry, a pointer and a Python object do not necessarily use the same number of bytes. The visual counts logical entries only."
      },
      {
        "title": "Include lookup assumptions",
        "text": "In a plain neighbor list, testing an edge may scan that list. A hash set of neighbors offers different expected lookup costs and overhead."
      }
    ],
    "lesson": "There is no universally best representation without knowing the workload.",
    "check": "What is the maximum number of edges in a simple undirected graph with six vertices?",
    "answer": "6 × 5 / 2 = 15. A simple directed graph without self-loops can have 30.",
    "extra": "Density compares actual edges with the maximum possible under the graph’s rules. A matrix uses n² entries even when few edges exist.",
    "refs": [
      "2-2",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "storage",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "8",
    "title": "Convert carefully: do not lose or double edges",
    "question": "Turn an adjacency matrix into neighbor lists, or do the reverse.",
    "a": [
      "Matrix to lists",
      "Scan the n² entries. For each present edge in row u and column v, add v to u’s list."
    ],
    "b": [
      "Lists to matrix",
      "Initialize n² absent entries, then mark the listed connections. Dense initialization already costs Θ(n²)."
    ],
    "walkthrough": [
      {
        "title": "An edge can have two stored entries",
        "text": "In an undirected adjacency list, AB appears in A’s list and BA in B’s. These represent one undirected edge."
      },
      {
        "title": "Count degrees",
        "text": "The sum of undirected degrees is 2m. In a directed graph, the outdegree sum and indegree sum each equal m."
      },
      {
        "title": "Separate input and output size",
        "text": "Reading a matrix takes quadratic work even if the graph is sparse. Writing a full matrix also requires its quadratic space."
      }
    ],
    "lesson": "Algorithm cost includes initializing and reading the representation.",
    "check": "If undirected degrees sum to 10, how many edges are there?",
    "answer": "Five, for a graph stored symmetrically with each edge contributing once at each endpoint.",
    "extra": "Our simple examples have no self-loops. Degree conventions for loops require care, although the standard undirected degree-sum identity still holds.",
    "refs": [
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-4",
    "visual": "conversion",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "8",
    "title": "BFS spreads out one layer at a time",
    "question": "Start at room A. Discover the nearest rooms before more distant ones.",
    "a": [
      "Layer 0 and layer 1",
      "A has distance 0. Its neighbors B and C have distance 1."
    ],
    "b": [
      "Layer 2",
      "D is first reached through B or C, so its distance is 2."
    ],
    "walkthrough": [
      {
        "title": "Discover the source",
        "text": "Set its distance to zero, mark it discovered, and put it into the queue."
      },
      {
        "title": "Process the oldest queued vertex",
        "text": "Remove the front vertex and inspect its neighbors. Each undiscovered neighbor gets distance current + 1."
      },
      {
        "title": "Mark before enqueueing",
        "text": "Record the neighbor as discovered immediately, then add it to the queue. Other routes must not enqueue it again."
      }
    ],
    "lesson": "The queue holds discovered vertices whose neighbors still need processing.",
    "check": "Does a queued vertex count as already discovered?",
    "answer": "Yes. It is discovered when enqueued, not only when later removed.",
    "extra": "Discovery order and processing order are related but are not the same event. The visual labels each operation explicitly.",
    "refs": [
      "3-1",
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "layers",
    "minutes": 8,
    "block": "Graphs and storage",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "8",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen. Return ready to explain a small graph.",
    "a": [
      "Before the break",
      "Choose one idea you can draw."
    ],
    "b": [
      "After the break",
      "Use it to solve a new case."
    ],
    "walkthrough": [],
    "lesson": "Practice, discussion and breaks are included in the schedule.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for discussion.",
    "extra": "These times guide the lesson; there is no automatic timer.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 64,
    "end": 74
  },
  {
    "id": 10,
    "week": "8",
    "title": "Follow the queue, one action at a time",
    "question": "Trace BFS from A with neighbors examined alphabetically.",
    "a": [
      "First discoveries",
      "A discovers B and C. Queue: B, C."
    ],
    "b": [
      "Shared destination",
      "B discovers D. Later C also has an edge to D, but D is already discovered and is not enqueued again."
    ],
    "walkthrough": [
      {
        "title": "Watch the front",
        "text": "The queue display reads from front to back. Removing B leaves C before the newly added D."
      },
      {
        "title": "Inspect every listed neighbor",
        "text": "An already-discovered neighbor still requires an adjacency-entry inspection. It just does not create a new queue entry."
      },
      {
        "title": "Stop when the queue is empty",
        "text": "All vertices reachable from the source have then been processed. Unreachable vertices remain undiscovered."
      }
    ],
    "lesson": "Queue order explains the layers; discovery checks prevent repeated work.",
    "check": "What are the discovery order and distances here?",
    "answer": "A, B, C, D. Their distances are 0, 1, 1, 2.",
    "extra": "Changing neighbor order can change which shortest-path parent is recorded. It does not change shortest-edge distances.",
    "refs": [
      "3-3",
      "3-4"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "trace",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "8",
    "title": "Connect the trace to Python",
    "question": "Run the same four-room example using a FIFO deque.",
    "a": [
      "distance records discovery",
      "A key appears in distance as soon as the vertex is found. The dictionary also stores its distance from A."
    ],
    "b": [
      "parent records a route",
      "When B first discovers D, parent[D] becomes B. Later visits do not overwrite that first discovery."
    ],
    "walkthrough": [
      {
        "title": "Initialize the state",
        "text": "The source has distance zero and no parent. deque([start]) creates the waiting line. All vertices named as neighbors must be present as dictionary keys."
      },
      {
        "title": "Remove from the front",
        "text": "popleft() returns the oldest queued vertex efficiently. Each loop then scans that vertex’s neighbor list."
      },
      {
        "title": "Discover once",
        "text": "The if test prevents repeated enqueueing. Set distance and parent before queue.append(v). This makes cycles safe to traverse."
      }
    ],
    "lesson": "The code follows the same discover, queue, process sequence as the visual.",
    "check": "What happens if the source is an isolated vertex with an empty list?",
    "answer": "It is processed once. Its distance remains zero, and the queue then becomes empty.",
    "extra": "Each Run starts fresh. Editing the Python changes only that run; the graph editor and visual trace are separate demonstrations.",
    "refs": [
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "python",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "8",
    "title": "Why do n and m both appear in the cost?",
    "question": "In an undirected neighbor-list representation, every edge is listed twice.",
    "a": [
      "Vertex work",
      "Each discovered vertex is enqueued and processed once."
    ],
    "b": [
      "Connection work",
      "Scan every adjacency entry of each processed vertex. An undirected edge contributes two entries."
    ],
    "walkthrough": [
      {
        "title": "Add the two costs",
        "text": "For a complete traversal with adjacency lists, work is O(n + m), including bookkeeping initialization when it touches all n vertices."
      },
      {
        "title": "Account for the reachable part",
        "text": "A source-only implementation with lazy dictionaries can process only reachable vertices and their adjacency entries. Reading the entire graph beforehand is a separate cost."
      },
      {
        "title": "Change the representation, change the scan",
        "text": "With a matrix, scanning each processed vertex’s whole row costs n entries. A full traversal can take Θ(n²) even when m is small."
      }
    ],
    "lesson": "An edge inspection is work even when the neighbor was discovered earlier.",
    "check": "For the connected four-room graph, how many neighbor entries are inspected?",
    "answer": "Eight: each of four undirected edges is examined from both endpoints. Four vertices are processed.",
    "extra": "These counters exclude parsing, drawing, string processing and hardware timing. O(n + m) assumes suitable constant-time queue and discovery operations.",
    "refs": [
      "3-5"
    ],
    "ref": "lecture-notes.html#topic-3-5",
    "visual": "bfscost",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "8",
    "title": "An arrow changes who can reach whom",
    "question": "Use directed edges A → B, B → C and D → C.",
    "a": [
      "Start at A",
      "Reach A, B and C. D is not reachable because its arrow points toward C, not away from C toward D."
    ],
    "b": [
      "Start at D",
      "Reach D and C. There is no outgoing route to B or A."
    ],
    "walkthrough": [
      {
        "title": "Follow outgoing neighbors",
        "text": "The adjacency list contains destinations of outgoing edges. BFS must obey this direction."
      },
      {
        "title": "Do not infer reverse travel",
        "text": "C can be reached from A and D, but C cannot necessarily reach either source."
      },
      {
        "title": "Name the connectivity question",
        "text": "For directed graphs, weak connectivity ignores direction; strong connectivity requires mutual reachability. They are different from one BFS reachability set."
      }
    ],
    "lesson": "Reachability depends on both the source and edge direction.",
    "check": "Starting at C in this graph, which vertices are reached?",
    "answer": "Only C. It has no outgoing edges.",
    "extra": "The undirected connected-component method later in the lesson should not be mistaken for a strongly connected component algorithm.",
    "refs": [
      "3-6"
    ],
    "ref": "lecture-notes.html#topic-3-6",
    "visual": "directed",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "8",
    "title": "Parents turn discoveries into a shortest route",
    "question": "Find a route from A to D in the four-room graph.",
    "a": [
      "Record one parent",
      "With alphabetical neighbors, D is first discovered from B, so parent[D] = B and parent[B] = A."
    ],
    "b": [
      "Walk backward, then reverse",
      "D → B → A becomes A → B → D. The route uses two edges."
    ],
    "walkthrough": [
      {
        "title": "Why parents form a tree",
        "text": "Every reached vertex except the source receives one parent at first discovery. Its parent has distance one smaller, so parent links cannot form a cycle."
      },
      {
        "title": "Why the distance is shortest",
        "text": "FIFO processes all vertices at distance k before processing distance k + 1. A shorter route would have discovered the target in an earlier layer."
      },
      {
        "title": "Recognize multiple correct routes",
        "text": "A → C → D also has two edges. A different neighbor order can choose it without changing the minimum distance."
      }
    ],
    "lesson": "BFS returns one shortest-edge route; it need not be the only one.",
    "check": "What route should we report for an unreachable target?",
    "answer": "No route. Do not invent a parent chain or confuse an undiscovered distance with zero.",
    "extra": "The source’s zero-edge route to itself is valid. The BFS tree includes only reached vertices and discovery edges, not every original edge.",
    "refs": [
      "4-1",
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "parents",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "8",
    "title": "Two small implementation choices matter",
    "question": "Compare a FIFO queue with a stack, and early marking with late marking.",
    "a": [
      "Use FIFO for shortest edge counts",
      "On edges AB, BC, CD and AD, following A → B → C → D deeply can reach D by a three-edge route even though AD is one edge."
    ],
    "b": [
      "Mark on discovery",
      "If B and C both lead to D, mark D when the first parent enqueues it. The second parent then skips enqueueing."
    ],
    "walkthrough": [
      {
        "title": "DFS can still explore correctly",
        "text": "A depth-first search can find reachable vertices. Its first-discovery route is not guaranteed to use the fewest edges."
      },
      {
        "title": "Avoid duplicate queue entries",
        "text": "If D stays unmarked while waiting, multiple vertices may enqueue it. Distances and parents become harder to manage correctly."
      },
      {
        "title": "Keep the simple invariant",
        "text": "Each vertex has at most one queue entry in this BFS. Assign its first distance before appending it."
      }
    ],
    "lesson": "The ordering rule and the marking moment are part of the algorithm, not cosmetic details.",
    "check": "Must every late-marking variant return a wrong answer?",
    "answer": "No. More careful variants can handle duplicate entries. But the simple one-entry-per-vertex argument relies on marking when enqueued.",
    "extra": "The depth-first counterexample assumes a neighbor order that follows the long route first.",
    "refs": [
      "4-3",
      "4-4"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "fifo",
    "minutes": 8,
    "block": "BFS and paths",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "8",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen. Return ready to explain a small graph.",
    "a": [
      "Before the break",
      "Choose one idea you can draw."
    ],
    "b": [
      "After the break",
      "Use it to solve a new case."
    ],
    "walkthrough": [],
    "lesson": "Practice, discussion and breaks are included in the schedule.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for discussion.",
    "extra": "These times guide the lesson; there is no automatic timer.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 122,
    "end": 132
  },
  {
    "id": 17,
    "week": "8",
    "title": "Fewest edges is not always cheapest",
    "question": "There is a direct edge A–D costing 10, and a two-edge route A–B–D costing 1 + 1.",
    "a": [
      "BFS chooses by edge count",
      "A–D has one edge, so it wins the fewest-edges question."
    ],
    "b": [
      "Travel cost gives another answer",
      "A–B–D costs 2, which is cheaper than 10 despite using more edges."
    ],
    "walkthrough": [
      {
        "title": "State the objective",
        "text": "If each edge represents one equal-time move, minimizing edge count also minimizes that time. With unequal weights, this connection breaks."
      },
      {
        "title": "Choose an appropriate method",
        "text": "Dijkstra’s algorithm handles nonnegative weighted shortest paths. BFS remains the simpler method when all edges have equal positive cost."
      },
      {
        "title": "Do not mix outputs",
        "text": "A BFS distance of 1 here means one edge. It does not mean one unit of energy or one millisecond."
      }
    ],
    "lesson": "Correctness depends on what the distance is measuring.",
    "check": "If every edge costs exactly 3, can BFS minimize total cost?",
    "answer": "Yes. Total cost is three times the edge count, so the objectives agree.",
    "extra": "Negative weights require different assumptions and algorithms. They are outside this introductory BFS lesson.",
    "refs": [
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-5",
    "visual": "weights",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "8",
    "title": "Restart to find every connected group",
    "question": "Use undirected edges AB, BC and DE, with isolated vertex F.",
    "a": [
      "One BFS from A",
      "It reaches A, B and C, but not D, E or F."
    ],
    "b": [
      "Continue from undiscovered vertices",
      "Start at D to find D,E. Finally start at F. The graph has three connected components."
    ],
    "walkthrough": [
      {
        "title": "Keep a global discovered set",
        "text": "After one BFS finishes, do not forget which vertices it reached. The next search starts at a still-undiscovered vertex."
      },
      {
        "title": "Give each run a component label",
        "text": "Every vertex reached in that run belongs to the same connected component."
      },
      {
        "title": "Count total work",
        "text": "Across all runs, each vertex is processed once and each adjacency entry is inspected once. With lists, total work stays O(n + m)."
      }
    ],
    "lesson": "Several BFS runs do not automatically multiply the work by n.",
    "check": "Does an isolated vertex form a component?",
    "answer": "Yes. F is a one-vertex connected component.",
    "extra": "This is the connected-component procedure for undirected graphs. Directed strong connectivity needs a different procedure.",
    "refs": [
      "5-1"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "components",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "8",
    "title": "Can every edge connect opposite groups?",
    "question": "Try colouring a square with two colours, then try a triangle.",
    "a": [
      "Square",
      "Alternate colours around four vertices. Every edge connects different colours."
    ],
    "b": [
      "Triangle",
      "After two alternating steps, the closing edge joins two vertices of the same colour. Two colours cannot satisfy every edge."
    ],
    "walkthrough": [
      {
        "title": "Use BFS layers to assign colours",
        "text": "Give the source colour 0. Give each newly discovered neighbor the opposite colour."
      },
      {
        "title": "Check already-coloured neighbors too",
        "text": "If an edge joins equal colours, the graph is not bipartite. A conflict can occur on a non-tree edge."
      },
      {
        "title": "Check every component",
        "text": "Restart from any uncoloured vertex. A valid source component does not prove that the entire disconnected graph is bipartite."
      }
    ],
    "lesson": "An undirected graph is bipartite exactly when it has no odd-length cycle.",
    "check": "Is an isolated vertex compatible with bipartiteness?",
    "answer": "Yes. It has no edges imposing a conflict.",
    "extra": "A self-loop would immediately make a graph non-bipartite. Our square and triangle examples have no loops.",
    "refs": [
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "bipartite",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "8",
    "title": "A grid is a graph with a clear movement rule",
    "question": "Plan a robot route on a small grid with blocked cells.",
    "a": [
      "Vertices and edges",
      "Each free cell is a vertex. Connect horizontal and vertical neighbors if both cells are free."
    ],
    "b": [
      "Equal-cost movement",
      "Each permitted move costs one step. BFS therefore finds a route with the fewest moves."
    ],
    "walkthrough": [
      {
        "title": "Choose the state model",
        "text": "This simple robot has no orientation, turning cost or footprint. A real robot may need a richer state and collision model."
      },
      {
        "title": "Let obstacles remove moves",
        "text": "Blocked cells are not traversable. Moving diagonally is not allowed in this demonstration."
      },
      {
        "title": "Estimate the graph size",
        "text": "An empty R × C grid has RC vertices and R(C − 1) + C(R − 1) undirected edges. Generating neighbors on demand avoids storing a dense matrix."
      }
    ],
    "lesson": "BFS is useful when the model’s moves have equal cost.",
    "check": "How many vertices and undirected edges does an empty 3 × 4 grid have?",
    "answer": "12 vertices and 3 × 3 + 4 × 2 = 17 edges. A full adjacency matrix would have 144 entries.",
    "extra": "If moves have unequal energy or time costs, use a weighted model and an appropriate path algorithm.",
    "refs": [
      "6",
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-6",
    "visual": "robot",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "8",
    "title": "Use a small graph to challenge a claim",
    "question": "Test “BFS visits every vertex” and “all BFS trees are identical.”",
    "a": [
      "Disconnected graph",
      "A source-only BFS cannot cross between disconnected components."
    ],
    "b": [
      "Two equal-length routes",
      "In the diamond graph, D can have parent B or C. Both give distance 2 from A."
    ],
    "walkthrough": [
      {
        "title": "Check the quantifier",
        "text": "“Every vertex reachable from the source” is accurate. “Every vertex in any graph” is not."
      },
      {
        "title": "Separate invariants from choices",
        "text": "Minimum distances are fixed by the graph and source. Discovery order and chosen parents can vary with neighbor order."
      },
      {
        "title": "Keep labels and costs distinct",
        "text": "The alphabetical label of a vertex and its drawing position do not determine its shortest-path distance."
      }
    ],
    "lesson": "Explain the assumptions before deciding whether an answer is correct.",
    "check": "If two valid BFS runs give different parents for D, must one be wrong?",
    "answer": "No. Compare their distances and verify that every parent edge leads from the previous layer.",
    "extra": "The editor lets you vary edges and sources to test these claims directly.",
    "refs": [
      "7-1"
    ],
    "ref": "lecture-notes.html#topic-7-1",
    "visual": "counterexamples",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "8",
    "title": "Draw, trace, explain",
    "question": "Use vertices A through E and undirected edges AB, AC, BD, CD, DE.",
    "a": [
      "Trace from A",
      "Predict the queue, distances and parents with alphabetical neighbor order."
    ],
    "b": [
      "Then remove DE",
      "Explain what changes for E and what stays the same for A through D."
    ],
    "walkthrough": [
      {
        "title": "Trace answer",
        "text": "Discovery order is A,B,C,D,E. Distances are 0,1,1,2,3. Parents are A:none, B:A, C:A, D:B, E:D."
      },
      {
        "title": "After removal",
        "text": "E remains a vertex but is unreachable from A. The distances to A,B,C,D are unchanged."
      },
      {
        "title": "Count and justify",
        "text": "Initially n = 5 and m = 5. A full connected BFS scans 10 adjacency entries. FIFO and discovery-time marking explain the shortest layers and single enqueue per vertex."
      }
    ],
    "lesson": "Connect the representation, queue rule, output and cost in one explanation.",
    "check": "Does the BFS tree contain every edge of the original connected graph?",
    "answer": "No. It contains one parent edge for every non-source vertex: n − 1 edges. Extra original edges may connect already-discovered vertices.",
    "extra": "The linked original notes preserve the longer exercises and additional interactive demonstrations.",
    "refs": [
      "7-2",
      "8"
    ],
    "ref": "lecture-notes.html#topic-7-2",
    "visual": "final",
    "minutes": 8,
    "block": "Applications and practice",
    "start": 172,
    "end": 180
  }
];
