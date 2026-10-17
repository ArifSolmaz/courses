const cards = [
  {
    "id": 1,
    "week": "9",
    "title": "A queue spreads; DFS goes deeper",
    "question": "A robot can choose B or C from A.",
    "a": [
      "BFS",
      "Visit the nearest rooms first."
    ],
    "b": [
      "DFS",
      "Follow B as far as possible, then return."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A graph is a list of places and direct connections. A drawing helps us see them."
      },
      {
        "title": "Follow the change",
        "text": "BFS uses a queue: first waiting, first served. DFS keeps the current route on a stack."
      },
      {
        "title": "Explain the result",
        "text": "Returning means the current call has finished. It does not mean deleting the discovery record."
      }
    ],
    "lesson": "Choose a search by the question you need to answer.",
    "check": "Does DFS promise the fewest edges?",
    "answer": "No. It finds a route, but that route can be longer than another route.",
    "extra": "All neighbors and new roots are considered alphabetically.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "compare",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "9",
    "title": "Leave a thread behind you",
    "question": "Explore A → B → D before returning to A.",
    "a": [
      "Go deeper",
      "Enter an unseen neighbor."
    ],
    "b": [
      "Come back",
      "Return when no unseen neighbor remains."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Start at A and mark it before following any edge."
      },
      {
        "title": "Follow the change",
        "text": "At B, remember that A is waiting. At D, remember that B is waiting."
      },
      {
        "title": "Explain the result",
        "text": "When D finishes, resume B where it stopped. Do not restart B from the beginning."
      }
    ],
    "lesson": "DFS remembers unfinished work.",
    "check": "After D finishes, where do we return?",
    "answer": "To B, the call that entered D. Then B can finish or try another neighbor.",
    "extra": "A DFS call stack contains active ancestors, not every vertex ever visited.",
    "refs": [
      "1-1",
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "simple",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "9",
    "title": "Three states prevent a false alarm",
    "question": "Two routes both lead to D.",
    "a": [
      "Active",
      "The call has started but has not finished."
    ],
    "b": [
      "Finished",
      "All outgoing edges have been checked."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Enter A, B and D. D has no outgoing edges, so it finishes."
      },
      {
        "title": "Follow the change",
        "text": "Return to A and enter C. C also points to D, but D is finished."
      },
      {
        "title": "Explain the result",
        "text": "This shared destination does not create a route back to C. It is not a directed cycle."
      }
    ],
    "lesson": "Visited alone is not enough to detect a directed cycle.",
    "check": "Does C → D prove a cycle?",
    "answer": "No. D is finished, not an active ancestor of C.",
    "extra": "White means unseen, gray means active, black means finished. Our table spells out the states.",
    "refs": [
      "1-2",
      "2-1"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "diamond",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "9",
    "title": "Read the original six-place example",
    "question": "Follow A → B → D → E, then inspect E → B.",
    "a": [
      "First route",
      "B is still waiting for D and E."
    ],
    "b": [
      "Return edge",
      "E points back to active B."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The current stack is A, B, D, E. These calls have started and have not finished."
      },
      {
        "title": "Follow the change",
        "text": "E → B closes the route B → D → E → B. This is a directed cycle."
      },
      {
        "title": "Explain the result",
        "text": "Finish E, D and B. Then visit C and F. C → D reaches an already finished branch."
      }
    ],
    "lesson": "The active stack gives a concrete cycle witness.",
    "check": "Which edge closes the cycle?",
    "answer": "E → B. The existing tree route from B to E completes the loop.",
    "extra": "A graph may have both cyclic and acyclic regions. DFS still visits all vertices.",
    "refs": [
      "1-3",
      "3-1"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "original",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "9",
    "title": "Entry and exit are two different moments",
    "question": "Give each entry and each finish the next clock number.",
    "a": [
      "Entry",
      "The call begins."
    ],
    "b": [
      "Exit",
      "The call has checked all its outgoing edges."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A enters first. Its exit comes after every call below it has finished."
      },
      {
        "title": "Follow the change",
        "text": "In A → B → D, the time interval for D lies inside the interval for B, which lies inside A’s interval."
      },
      {
        "title": "Explain the result",
        "text": "Each vertex gets two clock events. Six vertices give twelve events, regardless of how many edges are inspected."
      }
    ],
    "lesson": "A child finishes before its parent finishes.",
    "check": "Can a parent finish while its child is active?",
    "answer": "No. Recursive DFS must return from that child before finishing the parent.",
    "extra": "The clock counts entry and exit events, not seconds or total operations.",
    "refs": [
      "1-3",
      "2-1"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "original",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "9",
    "title": "An explicit stack can remember calls",
    "question": "A long chain can make many nested Python calls.",
    "a": [
      "Recursive DFS",
      "The language stores the unfinished calls."
    ],
    "b": [
      "Iterative DFS",
      "We store each vertex and its next neighbor index."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "On entering A, keep a frame for A. It records which neighbor should be tried next."
      },
      {
        "title": "Follow the change",
        "text": "Push a new frame when an unseen neighbor is found. Pop a frame only after all its neighbors are checked."
      },
      {
        "title": "Explain the result",
        "text": "This simulates recursive DFS. A stack of vertex labels alone may produce different discovery and finish orders."
      }
    ],
    "lesson": "A frame remembers both the place and the unfinished work.",
    "check": "How many active frames can a chain of n vertices need?",
    "answer": "n. The chain can be fully entered before the first return.",
    "extra": "Python’s recursion limit is finite. An explicit stack avoids relying on deep recursive calls.",
    "refs": [
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-5",
    "visual": "simple",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "9",
    "title": "Count places and connections separately",
    "question": "Compare a chain with a graph that has more edges.",
    "a": [
      "Vertex work",
      "Enter and finish each vertex once."
    ],
    "b": [
      "Edge work",
      "Inspect every neighbor-list entry."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let n be the number of vertices and m the number of edges. They measure different things."
      },
      {
        "title": "Follow the change",
        "text": "A full DFS using adjacency lists performs work proportional to n + m. An undirected edge appears in two lists."
      },
      {
        "title": "Explain the result",
        "text": "Θ(n + m) means the work grows like that total, up to constant factors. Scanning a full adjacency matrix instead costs Θ(n²)."
      }
    ],
    "lesson": "More connections mean more inspections even if the number of places is unchanged.",
    "check": "If all n vertices are isolated, is full DFS free?",
    "answer": "No. It still starts and finishes n separate roots: Θ(n) work.",
    "extra": "The cost is for a full traversal. Sorting neighbors is not included; lists are already ordered.",
    "refs": [
      "1-6"
    ],
    "ref": "lecture-notes.html#topic-1-6",
    "visual": "cost",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "9",
    "title": "Four names describe four edge situations",
    "question": "Classify an edge at the moment DFS inspects it.",
    "a": [
      "Tree or back",
      "An unseen destination becomes a child; an active destination is an ancestor."
    ],
    "b": [
      "Forward or cross",
      "A finished destination is either a descendant or in an earlier finished branch."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A tree edge makes a new call. It discovers a vertex for the first time."
      },
      {
        "title": "Follow the change",
        "text": "A back edge points to an active ancestor. It proves a cycle in a directed graph."
      },
      {
        "title": "Explain the result",
        "text": "A forward edge points to a finished descendant; a cross edge points to a different finished branch. Use the trace, not the shape of the drawing."
      }
    ],
    "lesson": "Edge classes depend on the chosen DFS order.",
    "check": "Is every edge to a finished vertex a forward edge?",
    "answer": "No. C → D in the diamond is a cross edge. A → D after A → B → D is a forward edge.",
    "extra": "These four classes describe directed DFS. Undirected edges need the separate rule in the next example.",
    "refs": [
      "2-1",
      "2-2",
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "classes",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "9",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one idea from the last examples in your own words."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What was the most useful distinction?",
    "answer": "Keep your own one-sentence reminder.",
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
    "week": "9",
    "title": "A two-way corridor is not a two-edge cycle",
    "question": "Walk from A to B along one undirected corridor.",
    "a": [
      "Return to the parent",
      "B sees the same corridor back to A."
    ],
    "b": [
      "Return to another ancestor",
      "A different edge can close a real cycle."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "An undirected edge is stored in both endpoint lists. Seeing the reverse entry does not create a second physical edge."
      },
      {
        "title": "Follow the change",
        "text": "Skip the parent edge when detecting a cycle in a simple undirected graph."
      },
      {
        "title": "Explain the result",
        "text": "In triangle A–B–C–A, C sees ancestor A through a different edge. That gives a real cycle of three edges."
      }
    ],
    "lesson": "Do not count the same undirected corridor twice.",
    "check": "Does a single corridor AB contain a cycle?",
    "answer": "No. But adding AC and BC makes a triangle and creates a cycle.",
    "extra": "This rule assumes no parallel edges. Each undirected edge is classified once as tree or back.",
    "refs": [
      "1-4",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "undirected",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "9",
    "title": "Change one arrow; change the answer",
    "question": "Start with A → B → C. Add C → A.",
    "a": [
      "Before",
      "The route ends at C."
    ],
    "b": [
      "After",
      "C leads back to the still-active A."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The first graph has no way to return to an earlier vertex by following arrows."
      },
      {
        "title": "Follow the change",
        "text": "The new edge completes A → B → C → A. DFS detects it when A is still active."
      },
      {
        "title": "Explain the result",
        "text": "In a sensor model, feedback can be intentional. A cycle is a graph property; whether it is a problem depends on the model."
      }
    ],
    "lesson": "Show the actual loop before calling something a cycle.",
    "check": "If the new edge is A → C instead, is there a cycle?",
    "answer": "No. It is a shortcut in the same direction. There is still no path back to A.",
    "extra": "A dependency cycle prevents a prerequisite order; a feedback system may deliberately contain cycles.",
    "refs": [
      "3-1",
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "cycle",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "9",
    "title": "Which job can start first?",
    "question": "A = mount base, B = install sensor, C = calibrate, D = test.",
    "a": [
      "Prerequisites",
      "A → C and B → C mean both A and B must finish before C."
    ],
    "b": [
      "Order",
      "C → D means testing must wait for calibration."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "An arrow u → v means u must come before v. It does not say how long either job takes."
      },
      {
        "title": "Follow the change",
        "text": "A and B have no prerequisites. Either can be first."
      },
      {
        "title": "Explain the result",
        "text": "C waits for both. After C, D can start. A, B, C, D and B, A, C, D both work."
      }
    ],
    "lesson": "A topological order places every prerequisite before the job that needs it.",
    "check": "Can C be first?",
    "answer": "No. It would violate both A → C and B → C.",
    "extra": "This is an order of prerequisites, not an optimized time schedule.",
    "refs": [
      "4-1"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "jobs",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "9",
    "title": "Finish first, then reverse",
    "question": "Use DFS on A → B, A → C, B → D, C → D, C → E, D → E.",
    "a": [
      "Finish list",
      "E, D, B, C, A."
    ],
    "b": [
      "Reverse list",
      "A, C, B, D, E."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "DFS finishes E before D because D must wait for its child to return."
      },
      {
        "title": "Follow the change",
        "text": "With no back edge, each directed edge leads to a vertex that finishes earlier than its source."
      },
      {
        "title": "Explain the result",
        "text": "Reverse the full finish list. Check every edge: its source must now appear before its destination."
      }
    ],
    "lesson": "Reverse finishing order works only when the directed graph has no cycle.",
    "check": "Why is discovery order A, B, D, E, C wrong here?",
    "answer": "C must come before D and E, but discovery order puts C after both.",
    "extra": "Run DFS from every unseen vertex, not just one source. Reject the order if any back edge is found.",
    "refs": [
      "4-2",
      "4-3"
    ],
    "ref": "lecture-notes.html#topic-4-2",
    "visual": "topodfs",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "9",
    "title": "Kahn: start a job with nothing left to wait for",
    "question": "Use the same five-vertex dependency graph.",
    "a": [
      "Waiting count",
      "The indegree counts incoming prerequisites still present."
    ],
    "b": [
      "Ready queue",
      "A vertex enters when its waiting count reaches zero."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Initial counts are A:0, B:1, C:1, D:2, E:2. Only A is ready."
      },
      {
        "title": "Follow the change",
        "text": "Remove A. B and C become ready. Removing B reduces D to one; it is not ready yet."
      },
      {
        "title": "Explain the result",
        "text": "After C, D becomes ready. After D, E becomes ready. The queue produces A, B, C, D, E."
      }
    ],
    "lesson": "A job becomes ready when all its remaining prerequisites have been removed.",
    "check": "Why not add D after removing B?",
    "answer": "D still waits for C. One remaining prerequisite is enough to block it.",
    "extra": "The demo uses a FIFO queue. Initially ready vertices and neighbor lists are alphabetical.",
    "refs": [
      "4-4",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "kahn",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "9",
    "title": "Two different answers can both be correct",
    "question": "Compare DFS and Kahn on the same DAG.",
    "a": [
      "DFS gives",
      "A, C, B, D, E."
    ],
    "b": [
      "Kahn gives",
      "A, B, C, D, E."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Both sequences contain each vertex exactly once."
      },
      {
        "title": "Follow the change",
        "text": "Check each edge in each sequence. A is before B and C; B and C are before D; C and D are before E."
      },
      {
        "title": "Explain the result",
        "text": "B and C have no ordering constraint between them. Swapping them is allowed; moving D before C is not."
      }
    ],
    "lesson": "Validate constraints, not a memorized single answer.",
    "check": "How many valid orders does this graph have?",
    "answer": "Two. A is first, D and E follow both B and C, and only the relative order of B and C is free.",
    "extra": "A chain has one valid order. n isolated vertices have n! orders. Counting all orders is harder than finding one.",
    "refs": [
      "4-6",
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-4-6",
    "visual": "orders",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "9",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one idea from the last examples in your own words."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What was the most useful distinction?",
    "answer": "Keep your own one-sentence reminder.",
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
    "week": "9",
    "title": "A stopped queue is useful evidence",
    "question": "Add E → B to the five-vertex dependency graph.",
    "a": [
      "Some work succeeds",
      "A and C can be removed."
    ],
    "b": [
      "Remaining work is blocked",
      "B → D → E → B is a cycle."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Kahn may produce a partial list before it gets stuck. Here A makes C ready, but B still waits for E."
      },
      {
        "title": "Follow the change",
        "text": "After removing C, no remaining vertex has indegree zero."
      },
      {
        "title": "Explain the result",
        "text": "Only two of five vertices were removed. Report a cycle and do not label the partial list a complete topological order."
      }
    ],
    "lesson": "An empty ready queue is success only if every vertex was removed.",
    "check": "Are all blocked vertices necessarily on a cycle?",
    "answer": "No. A job downstream from a cycle can be blocked without being part of the cycle itself.",
    "extra": "For finite directed graphs, Kahn removes every vertex exactly when the graph is acyclic.",
    "refs": [
      "4-4",
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "blocked",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "9",
    "title": "Try your own dependency graph",
    "question": "Edit arrows between A, B, C, D, E and F.",
    "a": [
      "A working plan",
      "Try AB AC BD CD."
    ],
    "b": [
      "A circular plan",
      "Try AB BC CA."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "AB means A → B. BA is a different arrow. All six vertices exist even if some have no edges."
      },
      {
        "title": "Follow the change",
        "text": "Predict which vertices are ready before starting the trace. Then follow the queue and remaining counts."
      },
      {
        "title": "Explain the result",
        "text": "Remove an arrow from a cycle and try again. Check whether any other cycle remains before claiming the whole graph is acyclic."
      }
    ],
    "lesson": "The trace is recalculated from your arrows.",
    "check": "What happens with an empty edge list?",
    "answer": "All six vertices are ready. Any permutation is valid; this FIFO demo returns A, B, C, D, E, F.",
    "extra": "Use distinct letters A–F. Duplicate arrows are merged. Self-loops are excluded by this editor.",
    "refs": [
      "editor",
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-editor",
    "visual": "editor",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "9",
    "title": "Run the dependency check in Python",
    "question": "The code implements Kahn’s algorithm on the same five jobs.",
    "a": [
      "State",
      "indegree stores remaining prerequisite counts; ready stores eligible jobs."
    ],
    "b": [
      "Result",
      "order is complete only when its length equals the number of vertices."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The first loops create one count per vertex, then add one for every incoming edge."
      },
      {
        "title": "Follow the change",
        "text": "The while loop removes a ready vertex, appends it to order and reduces each outgoing neighbor’s count."
      },
      {
        "title": "Explain the result",
        "text": "A neighbor is enqueued only when its count reaches zero. The final length check distinguishes a full order from a blocked partial result."
      }
    ],
    "lesson": "The code and the visual follow the same queue rule.",
    "check": "Add \"B\" to E’s neighbor list. What changes?",
    "answer": "E → B creates B → D → E → B. The code reports a cycle and prints only the partial order A, C.",
    "extra": "Every neighbor must also be a dictionary key. This example needs no input() values.",
    "refs": [
      "4-4",
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "python",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "9",
    "title": "One failed junction can split a network",
    "question": "Compare chain A–B–C with triangle A–B–C–A.",
    "a": [
      "Chain",
      "Removing B separates A and C."
    ],
    "b": [
      "Triangle",
      "Removing B leaves corridor A–C."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Count connected components before the failure: both graphs start with one."
      },
      {
        "title": "Follow the change",
        "text": "Remove B and all its incident edges. Count components among the remaining vertices."
      },
      {
        "title": "Explain the result",
        "text": "The chain changes from one component to two: B is an articulation vertex. The triangle stays at one."
      }
    ],
    "lesson": "An articulation vertex increases the number of connected components when removed.",
    "check": "Is an endpoint of the three-vertex chain an articulation vertex?",
    "answer": "No. Removing A leaves connected B–C, so the component count does not increase.",
    "extra": "This is an undirected concept. The visual counts components directly; efficient DFS methods use additional low-link records.",
    "refs": [
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-6-1",
    "visual": "articulation",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "9",
    "title": "Reachable one way is not enough",
    "question": "A → B → C → A forms a loop, and C → D leaves it.",
    "a": [
      "Inside the group",
      "A, B and C can each reach the others."
    ],
    "b": [
      "Outside the group",
      "D cannot return to A, B or C."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A strongly connected component is a maximal group with reachability in both directions between every pair."
      },
      {
        "title": "Follow the change",
        "text": "A, B and C form one such group. D alone forms another; a zero-edge path reaches itself."
      },
      {
        "title": "Explain the result",
        "text": "The arrow C → D connects the groups but does not merge them. A DFS tree can span several strongly connected components."
      }
    ],
    "lesson": "A one-way link does not make two groups mutually reachable.",
    "check": "What if we add D → A?",
    "answer": "Now all four vertices can reach one another, so they form one strongly connected component.",
    "extra": "SCCs belong to directed graphs. Collapsing each SCC into one vertex always gives a DAG.",
    "refs": [
      "6-2"
    ],
    "ref": "lecture-notes.html#topic-6-2",
    "visual": "scc",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "9",
    "title": "Choose the tool, then explain the evidence",
    "question": "A robot route, a build plan and a waiting loop ask different questions.",
    "a": [
      "Fewest unweighted moves",
      "Use BFS and distance layers."
    ],
    "b": [
      "Dependencies and loops",
      "Use DFS with active states or Kahn for a prerequisite order."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For a robot’s shortest unweighted route, a deep first route is not enough. BFS minimizes the number of edges."
      },
      {
        "title": "Follow the change",
        "text": "For a build plan, state what the arrows mean and test whether all prerequisites can be ordered."
      },
      {
        "title": "Explain the result",
        "text": "For a cycle, name its vertices and arrows. In a wait-for model with one instance of each resource, a waiting cycle indicates deadlock."
      }
    ],
    "lesson": "Match the algorithm to the question and justify the answer with a small trace.",
    "check": "A graph has A → B, A → C, B → D, C → D. Is D being reached twice a cycle?",
    "answer": "No. Both routes move toward D; no route returns to A, B or C. Valid orders include A, B, C, D and A, C, B, D.",
    "extra": "Practice: draw a chain, a diamond and a cycle. Predict DFS events and Kahn outcomes before stepping.",
    "refs": [
      "8-1",
      "8-2"
    ],
    "ref": "lecture-notes.html#topic-8-1",
    "visual": "diamond",
    "minutes": 8,
    "block": "DFS and dependencies",
    "start": 172,
    "end": 180
  }
];
