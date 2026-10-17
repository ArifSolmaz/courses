const cards = [
  {
    "id": 1,
    "week": "12",
    "title": "A tempting choice is not always safe",
    "question": "Make amount 6 using coin values 1, 3 and 4; copies are unlimited.",
    "a": [
      "Largest first",
      "4 + 1 + 1 uses three coins."
    ],
    "b": [
      "Better choice",
      "3 + 3 uses two coins."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Last week’s Dijkstra needed nonnegative weights; Prim needed a cut-property argument. A greedy rule needs a reason to be correct."
      },
      {
        "title": "Follow the change",
        "text": "Here taking the largest coin first looks sensible but loses. One counterexample disproves a claim that the rule always works."
      },
      {
        "title": "Explain the result",
        "text": "Backtracking explores alternative choices. Dynamic programming reuses answers to repeated smaller questions. Neither means guessing blindly."
      }
    ],
    "lesson": "Choose the method from the structure of the problem.",
    "check": "Does this prove that every greedy algorithm is wrong?",
    "answer": "No. It disproves this coin rule for arbitrary denominations. Other greedy algorithms have valid proofs.",
    "extra": "This coin example allows repeated coins. Later task-selection examples allow each task only once.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "0-4",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "greedy",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "12",
    "title": "Take it or leave it",
    "question": "Choose any subset of three optional tasks A, B and C.",
    "a": [
      "Take A",
      "Continue deciding about B and C."
    ],
    "b": [
      "Skip A",
      "Still decide about B and C."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Represent a partial answer as a list of choices. At each position, try a candidate, explore its consequences, then undo that choice."
      },
      {
        "title": "Follow the change",
        "text": "Each of three tasks has two independent options: take or skip. This gives 2 × 2 × 2 = 8 subsets, including the empty one."
      },
      {
        "title": "Explain the result",
        "text": "The recursion stops when all decisions have been made. A complete answer is one leaf of the search tree."
      }
    ],
    "lesson": "Backtracking is choose, explore, undo.",
    "check": "How many subsets are there for four distinct tasks?",
    "answer": "16. Adding a task doubles the number because every old subset has a version with it and a version without it.",
    "extra": "Listing all subsets already requires exponentially many outputs. Printing each chosen list adds work proportional to its length.",
    "refs": [
      "1-1",
      "1-2",
      "1-3",
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "subsets",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "12",
    "title": "Ordering differs from choosing",
    "question": "Arrange three different jobs A, B and C in a sequence.",
    "a": [
      "Subset",
      "AB and BA describe the same selected set."
    ],
    "b": [
      "Permutation",
      "ABC and BAC are different orders."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Choose the first job from three candidates. For the second slot, choose from the two unused jobs."
      },
      {
        "title": "Follow the change",
        "text": "The last slot has one remaining job. That makes 3 × 2 × 1 = 6 permutations."
      },
      {
        "title": "Explain the result",
        "text": "Track which jobs are used. Undo that mark when returning so another branch can use the job in a different position."
      }
    ],
    "lesson": "A permutation uses every item once and cares about order.",
    "check": "Can AAB be a permutation of A, B, C?",
    "answer": "No. A is repeated and C is missing.",
    "extra": "n! means n × (n−1) × … × 1. For zero items, there is one empty ordering: 0! = 1.",
    "refs": [
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-5",
    "visual": "permutations",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "12",
    "title": "Repeated labels create duplicate answers",
    "question": "Arrange the letters A, A and B.",
    "a": [
      "Treat the two As as distinct",
      "Six index permutations are generated."
    ],
    "b": [
      "Treat equal letters as identical",
      "Only AAB, ABA and BAA are different strings."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Swapping two equal As changes their hidden identities but not the visible answer."
      },
      {
        "title": "Follow the change",
        "text": "At a given depth, try each distinct remaining value only once. A frequency table can track how many copies remain."
      },
      {
        "title": "Explain the result",
        "text": "Restore the frequency after returning. The next branch needs the original supply of letters."
      }
    ],
    "lesson": "Avoid duplicate choices at the same decision level.",
    "check": "How many distinct arrangements does AAB have?",
    "answer": "Three: AAB, ABA and BAA. This is 3! / 2!, because swapping the two As does not change the string.",
    "extra": "Duplicate handling depends on the task: two physical jobs with the same duration can still be distinct jobs.",
    "refs": [
      "1-7"
    ],
    "ref": "lecture-notes.html#topic-1-7",
    "visual": "duplicates",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "12",
    "title": "Place queens one row at a time",
    "question": "Place four queens on a 4 × 4 board so that none attack each other.",
    "a": [
      "One queen per row",
      "The next decision is its column."
    ],
    "b": [
      "Reject a conflict early",
      "Do not extend a placement that already shares a column or diagonal."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Store the column for each filled row. This representation prevents row conflicts automatically."
      },
      {
        "title": "Follow the change",
        "text": "For an earlier queen at row r, column c, a new queen at row R, column C conflicts if C = c or abs(R − r) = abs(C − c). Here abs means the nonnegative size of the difference: the row gap equals the column gap."
      },
      {
        "title": "Explain the result",
        "text": "Try columns in order. If no column works, remove the most recent queen and try another column there."
      }
    ],
    "lesson": "A permanent conflict is a reason to stop that branch.",
    "check": "Does adding later queens fix an existing diagonal attack?",
    "answer": "No. Both attacking queens remain in place in every extension of that partial placement.",
    "extra": "The visual computes all two solutions for four queens. A rejected candidate is shown before it is removed.",
    "refs": [
      "2-1",
      "2-2",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "queens",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "12",
    "title": "Sudoku: start where few choices remain",
    "question": "A 4 × 4 Sudoku uses digits 1–4 and 2 × 2 boxes.",
    "a": [
      "Many candidates",
      "A cell may permit several values."
    ],
    "b": [
      "One candidate",
      "The cell can be filled immediately."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A candidate must be absent from the cell’s row, column and box. These are three separate checks."
      },
      {
        "title": "Follow the change",
        "text": "Choosing the empty cell with the fewest candidates often exposes contradictions sooner. It changes search order, not the definition of a valid solution."
      },
      {
        "title": "Explain the result",
        "text": "If a cell has no candidate, undo a previous choice. If every cell is filled consistently, a solution has been found."
      }
    ],
    "lesson": "Good candidate selection reduces wasted search.",
    "check": "Does the fewest-candidates rule guarantee no backtracking?",
    "answer": "No. A locally legal choice can still lead to a contradiction later.",
    "extra": "The small board makes the same logic visible without a full 9 × 9 puzzle. All clues remain fixed.",
    "refs": [
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-4",
    "visual": "sudoku",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "12",
    "title": "Fit tasks into exactly nine milliseconds",
    "question": "Task durations are 3, 34, 4, 12, 5 and 2 ms. Each task may be used once.",
    "a": [
      "Valid selection",
      "4 + 5 = 9."
    ],
    "b": [
      "Another valid selection",
      "3 + 4 + 2 = 9."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For each task, decide take or skip. Without pruning there are 2⁶ = 64 complete subsets and 127 calls in the full binary decision tree."
      },
      {
        "title": "Follow the change",
        "text": "Because these durations are positive, a partial sum above 9 can never fall back to 9. Stop exploring that branch."
      },
      {
        "title": "Explain the result",
        "text": "Continue until all positions are considered. List task indices as well as values when equal durations could represent different jobs."
      }
    ],
    "lesson": "A safe prune must rule out every completion of a partial answer.",
    "check": "Can task 34 be in a solution here?",
    "answer": "No. Its duration alone exceeds 9 and all other durations are positive.",
    "extra": "Node counts depend on when checks occur. Our comparison counts every entered recursive call, including calls that immediately prune.",
    "refs": [
      "3-1",
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "tasks",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "12",
    "title": "A negative value breaks the overshoot rule",
    "question": "Choose from 5, 4, −3 and 2 to make 6.",
    "a": [
      "Temporary sum",
      "5 + 4 = 9, above the target."
    ],
    "b": [
      "Later correction",
      "9 + (−3) = 6, a valid solution."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The positive-duration rule relied on sums never decreasing. A negative remaining value removes that guarantee."
      },
      {
        "title": "Follow the change",
        "text": "Pruning at 9 would lose the valid subset 5, 4, −3. A faster search that misses answers is not an equivalent algorithm."
      },
      {
        "title": "Explain the result",
        "text": "A safe general bound adds all remaining negative values for a lower bound and all remaining positive values for an upper bound. Prune only if the target lies outside that interval."
      }
    ],
    "lesson": "Every pruning rule has assumptions. State and test them.",
    "check": "Is “stop above half the target” safe even for positive durations?",
    "answer": "No. A solution often needs a partial sum above half the target before reaching the target itself.",
    "extra": "Negative numbers here are a mathematical counterexample, not physical negative execution durations.",
    "refs": [
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "unsafe",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "12",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one choice or one table entry."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What information did the state need?",
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
    "week": "12",
    "title": "Fibonacci repeats the same questions",
    "question": "F(0) = 0, F(1) = 1, and F(n) = F(n−1) + F(n−2).",
    "a": [
      "Direct recursion",
      "To find F(5), ask for F(4) and F(3)."
    ],
    "b": [
      "Repeated work",
      "The F(4) branch also asks for F(3)."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Every call with n ≥ 2 makes two smaller calls. The base cases return immediately."
      },
      {
        "title": "Follow the change",
        "text": "Draw the calls for F(5). F(3), F(2), F(1) and F(0) appear more than once."
      },
      {
        "title": "Explain the result",
        "text": "F(5) is only 5, but the naive computation enters 15 calls. The answer’s size and the amount of computation are different quantities."
      }
    ],
    "lesson": "Repeated subproblems create reusable work.",
    "check": "How many calls does naive F(3) make?",
    "answer": "Five: F(3), F(2), F(1), F(0), F(1). Count each invocation, including base cases.",
    "extra": "The call recurrence is C(0)=C(1)=1 and C(n)=1+C(n−1)+C(n−2). Thus C(n)=2F(n+1)−1.",
    "refs": [
      "4-1",
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "fib",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "12",
    "title": "Memoization remembers a completed answer",
    "question": "Use a cache while computing F(5).",
    "a": [
      "First request for F(3)",
      "Compute it and store 2."
    ],
    "b": [
      "Later request for F(3)",
      "Read 2 from the cache."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Check whether n is cached before computing its children. Cache the completed answer under n."
      },
      {
        "title": "Follow the change",
        "text": "The same subproblem has the same answer, so later calls can reuse it. A request to a cached value still takes a lookup, but does not expand again."
      },
      {
        "title": "Explain the result",
        "text": "There are only n + 1 possible nonnegative states from 0 to n. Each is computed at most once."
      }
    ],
    "lesson": "Cache by the information that determines the answer.",
    "check": "Is a cache entry valid if the problem’s rules change?",
    "answer": "Not necessarily. Include all relevant rules in the key, or clear the cache when they change.",
    "extra": "For Fibonacci we count additions as unit work: O(n) states and O(n) cache/stack space. Large integer arithmetic has extra bit costs.",
    "refs": [
      "4-3",
      "5-1",
      "5-6"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "memo",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "12",
    "title": "Fill a table in dependency order",
    "question": "Build F(0), F(1), F(2), …, F(6).",
    "a": [
      "Known start",
      "0 and 1."
    ],
    "b": [
      "Next value",
      "Add the previous two entries."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "F(2) is 0 + 1 = 1. F(3) is 1 + 1 = 2. Continue only after the needed earlier values exist."
      },
      {
        "title": "Follow the change",
        "text": "This is bottom-up dynamic programming. It uses the same recurrence as recursion and memoization."
      },
      {
        "title": "Explain the result",
        "text": "For just the final Fibonacci value, keep only the last two values. That saves stored entries, but does not change the number of additions."
      }
    ],
    "lesson": "The recurrence stays the same; evaluation order and storage change.",
    "check": "What is F(6)?",
    "answer": "8. The table is 0, 1, 1, 2, 3, 5, 8.",
    "extra": "Not every recursive algorithm benefits from caching. The subproblems must overlap, and cached answers must be reusable.",
    "refs": [
      "4-4",
      "4-5",
      "5-9"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "table",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "12",
    "title": "Count ways to climb four steps",
    "question": "Each move climbs one or two steps; order matters.",
    "a": [
      "Last move was one step",
      "Come from step 3."
    ],
    "b": [
      "Last move was two steps",
      "Come from step 2."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Every route to step n ends in exactly one of these two ways. The groups do not overlap."
      },
      {
        "title": "Follow the change",
        "text": "Therefore ways[n] = ways[n−1] + ways[n−2]. Start with ways[0] = 1: one empty sequence of moves."
      },
      {
        "title": "Explain the result",
        "text": "For four steps the routes are 1111, 112, 121, 211 and 22. There are five."
      }
    ],
    "lesson": "Explain what a state counts before writing the recurrence.",
    "check": "Why is ways[0] one rather than zero?",
    "answer": "There is one way to do nothing. This lets a first move produce a valid route instead of multiplying possibilities by zero.",
    "extra": "These are ordered move sequences. A move of 1 followed by 2 differs from a move of 2 followed by 1.",
    "refs": [
      "5-3",
      "5-4"
    ],
    "ref": "lecture-notes.html#topic-5-3",
    "visual": "stairs",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "12",
    "title": "A state must remember what matters",
    "question": "Two partial task selections both total 4, but may leave different tasks available.",
    "a": [
      "Insufficient state",
      "“Current sum = 4” alone."
    ],
    "b": [
      "Sufficient state",
      "“Next task index i, remaining target t.”"
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "If later choices depend on which tasks remain, the total alone cannot determine the answer."
      },
      {
        "title": "Follow the change",
        "text": "Processing tasks in a fixed order lets i describe exactly which suffix is still available. Use state (i,t) for whether that suffix can make t."
      },
      {
        "title": "Explain the result",
        "text": "Define the state, base cases, transition, evaluation order and final answer. These five questions make the table meaningful."
      }
    ],
    "lesson": "Merge subproblems only when their future choices are equivalent.",
    "check": "Can a one-row task DP use only totals?",
    "answer": "Yes, if its outer loop tracks the processed task prefix. That missing information is carried by the algorithm stage.",
    "extra": "For nonnegative integer durations and target T, decision DP takes O(nT) time. This is pseudo-polynomial in the numeric target, not polynomial in its bit length.",
    "refs": [
      "5-2",
      "5-4",
      "6-3"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "state",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "12",
    "title": "Choose a team: take or skip the last person",
    "question": "How many three-person teams can be chosen from five people?",
    "a": [
      "Last person is included",
      "Choose the other two from four people."
    ],
    "b": [
      "Last person is excluded",
      "Choose all three from four people."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The two cases are disjoint and cover every team. So C(n,k) = C(n−1,k−1) + C(n−1,k)."
      },
      {
        "title": "Follow the change",
        "text": "Choosing nobody has one result, the empty team. Choosing everybody also has one result."
      },
      {
        "title": "Explain the result",
        "text": "Fill Pascal’s triangle row by row. C(5,3) = C(4,2) + C(4,3) = 6 + 4 = 10."
      }
    ],
    "lesson": "A two-dimensional state can still have a simple two-case explanation.",
    "check": "Is choosing A,B,C different from choosing C,B,A?",
    "answer": "No. Teams are unordered subsets. Counting orders would count the same team several times.",
    "extra": "C(n,k)=0 when k<0 or k>n. This is a counting table, not a list of every team.",
    "refs": [
      "5-5"
    ],
    "ref": "lecture-notes.html#topic-5-5",
    "visual": "binomial",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "12",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain one choice or one table entry."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What information did the state need?",
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
    "week": "12",
    "title": "Nobody gets their own label",
    "question": "Assign labels 1, 2 and 3 to positions 1, 2 and 3, with no fixed position.",
    "a": [
      "Valid",
      "2, 3, 1 and 3, 1, 2."
    ],
    "b": [
      "Invalid",
      "2, 1, 3 leaves label 3 in its own position."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Build a permutation, but reject a candidate equal to the current position. This conflict can never be fixed by later choices."
      },
      {
        "title": "Follow the change",
        "text": "For three positions exactly two complete assignments survive. For four, nine survive."
      },
      {
        "title": "Explain the result",
        "text": "Optional counting shortcut: D(n) = (n−1)(D(n−1)+D(n−2)), starting D(0)=1 and D(1)=0. This counts without listing."
      }
    ],
    "lesson": "Pruning lists solutions; a recurrence can count them.",
    "check": "How many derangements are there for two positions?",
    "answer": "One: 2, 1. Neither label stays in its original position.",
    "extra": "The recurrence splits according to whether the label sent to position 1 swaps back or belongs to a longer cycle. Its proof is optional enrichment.",
    "refs": [
      "1-6",
      "5-7"
    ],
    "ref": "lecture-notes.html#topic-1-6",
    "visual": "derange",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "12",
    "title": "Exactly two edges is a different question",
    "question": "A → B costs 2, B → C costs 3, and A → C costs 1.",
    "a": [
      "Any number of edges",
      "The direct route to C costs 1."
    ],
    "b": [
      "Exactly two edges",
      "A → B → C costs 5."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let dp[k][v] be the cheapest walk from A to v using exactly k edges. Both k and v are needed."
      },
      {
        "title": "Follow the change",
        "text": "Initialize dp[0][A]=0 and every other zero-edge destination to ∞."
      },
      {
        "title": "Explain the result",
        "text": "Build a new row from the previous row only: dp[k][v] = min over u → v of dp[k−1][u] + weight(u,v). Reusing the current row would accidentally allow extra edges."
      }
    ],
    "lesson": "The state must encode the constraint you want to enforce.",
    "check": "Can we keep dp[1][C]=1 as the answer for exactly two edges?",
    "answer": "No. That value uses one edge. With exactly two edges, the answer is 5 here.",
    "extra": "These are walks, so repeated vertices are permitted. A fixed edge limit keeps the problem bounded even with negative edges or cycles.",
    "refs": [
      "5-8"
    ],
    "ref": "lecture-notes.html#topic-5-8",
    "visual": "walk",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "12",
    "title": "Run the stair-counting table in Python",
    "question": "Edit n and compute the number of one-step/two-step sequences.",
    "a": [
      "Base entries",
      "ways[0]=1 and, when needed, ways[1]=1."
    ],
    "b": [
      "Transition",
      "Every later entry adds the previous two."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The list holds a separate answer for every step count. Initialization handles zero steps explicitly."
      },
      {
        "title": "Follow the change",
        "text": "The loop moves from 2 up to n, so both dependencies already exist before each addition."
      },
      {
        "title": "Explain the result",
        "text": "Print the table and final count. Try n=0, n=1 and n=4 to check the boundary cases and the five known routes."
      }
    ],
    "lesson": "A runnable table connects the recurrence to actual values.",
    "check": "What should the code return for n=5?",
    "answer": "8. There are five routes to step 4 and three to step 3; append a 1-step or 2-step move respectively.",
    "extra": "The browser example restricts n to 0–30 so the output stays readable. Python integers represent these counts exactly.",
    "refs": [
      "4-4",
      "5-3"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "python",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "12",
    "title": "A robot counts routes around an obstacle",
    "question": "Move only right or down on a 3 × 4 grid.",
    "a": [
      "Arrive from above",
      "Use all routes to the cell above."
    ],
    "b": [
      "Arrive from the left",
      "Use all routes to the cell on the left."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Set the start cell to 1 if it is open. A blocked cell has zero routes."
      },
      {
        "title": "Follow the change",
        "text": "Every other open cell gets above + left. Outside the grid contributes zero."
      },
      {
        "title": "Explain the result",
        "text": "Fill rows from top to bottom and cells left to right. Toggle a blocked cell and rebuild the entire table from these rules."
      }
    ],
    "lesson": "The direction restriction makes the dependency graph acyclic.",
    "check": "Would this same recurrence count arbitrary four-direction walks?",
    "answer": "No. Four-direction movement can create cycles and infinitely many walks. The right/down restriction is essential.",
    "extra": "This counts routes; it does not minimize cost or list every route. A blocked start or goal gives zero routes.",
    "refs": [
      "6-2"
    ],
    "ref": "lecture-notes.html#topic-6-2",
    "visual": "grid",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "12",
    "title": "Stop a robot-arm branch only when it cannot recover",
    "question": "Three joints each have twelve allowed angles.",
    "a": [
      "All full configurations",
      "12³ = 1,728."
    ],
    "b": [
      "Early collision checks",
      "Reject a prefix as soon as a fixed earlier link already intersects an obstacle."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Test 12 first-joint angles. Four fail, leaving 8. Test 8 × 12 = 96 second-joint candidates; three per surviving prefix fail, leaving 8 × 9 = 72 prefixes."
      },
      {
        "title": "Follow the change",
        "text": "Test 72 × 12 = 864 third-joint candidates. The total is 12 + 96 + 864 = 972 prefix-level checks."
      },
      {
        "title": "Explain the result",
        "text": "These are not the same unit as 1,728 full-configuration checks. Compare costs only with a stated collision-testing model. We skip 864 complete configurations in this example."
      }
    ],
    "lesson": "Pruning saves work when a prefix already proves failure.",
    "check": "Why can a later joint not fix an earlier link hitting a wall?",
    "answer": "For a fixed base and fixed earlier joint angles in this serial-arm model, later joint choices do not move that earlier link.",
    "extra": "This is a counting model, not a physical collision simulator. It assumes the stated number of rejected angles for every surviving prefix at each level.",
    "refs": [
      "6-1"
    ],
    "ref": "lecture-notes.html#topic-6-1",
    "visual": "arm",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "12",
    "title": "List, count, or decide?",
    "question": "The requested output determines what work is needed.",
    "a": [
      "Backtracking",
      "List valid task subsets, queen placements or assignments."
    ],
    "b": [
      "Dynamic programming",
      "Count routes or decide whether a target total can be reached by reusing states."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Listing every solution can require exponential output even when a compact DP counts solutions quickly."
      },
      {
        "title": "Follow the change",
        "text": "For once-only task selection with nonnegative integer durations, process tasks one at a time. Update a one-row reachability table from high sums to low sums."
      },
      {
        "title": "Explain the result",
        "text": "Descending order prevents the same task from being reused during its own iteration. Backtracking and DP can solve related questions, but their output may differ."
      }
    ],
    "lesson": "Specify the output, state and assumptions before comparing methods.",
    "check": "With one task of duration 3 and target 6, should once-only DP say yes?",
    "answer": "No. An ascending in-place update could wrongly use that task twice. Descending updates avoid this mistake.",
    "extra": "For practice, explain one safe prune, one repeated subproblem and one base case without code. Then trace a small counterexample to a wrong rule.",
    "refs": [
      "5-9",
      "6-3",
      "7-1",
      "7-2"
    ],
    "ref": "lecture-notes.html#topic-5-9",
    "visual": "decision",
    "minutes": 8,
    "block": "Backtracking and dynamic programming",
    "start": 172,
    "end": 180
  }
];
