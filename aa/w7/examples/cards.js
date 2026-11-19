const cards = [
  {
    "id": 1,
    "week": "7",
    "title": "Keep the question in mind",
    "question": "Do you need the next minimum, an exact ID, or all records in order?",
    "a": [
      "Next deadline",
      "A min-heap keeps the minimum at its root. Its array need not be sorted."
    ],
    "b": [
      "Exact ID or ordered records",
      "Hashing helps exact lookup under suitable assumptions. A balanced search tree supports ordered queries."
    ],
    "walkthrough": [
      {
        "title": "Heap reminder",
        "text": "In [1, 3, 2], the root is smallest but the array is not sorted. Heap extraction needs a repair after removing the root."
      },
      {
        "title": "Dictionary reminder",
        "text": "An ordinary BST may become a chain. A balanced BST controls height. Hashing does not preserve numerical order."
      },
      {
        "title": "This week’s task",
        "text": "Now we want the whole collection in sorted order. We will compare ways to divide and combine the work."
      }
    ],
    "lesson": "A good structure for one question is not automatically best for every question.",
    "check": "Can you use binary search directly on [1, 3, 2]?",
    "answer": "No. Binary search requires a sorted sequence; heap order alone is insufficient.",
    "extra": "A hash-table lookup is expected O(1) only under suitable distribution and load assumptions.",
    "refs": [
      "0-1",
      "0-2"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "recap",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 0,
    "end": 6
  },
  {
    "id": 2,
    "week": "7",
    "title": "Count actions before naming the growth",
    "question": "Compare halving a pile of eight cards with removing one card at a time.",
    "a": [
      "Halve",
      "8 → 4 → 2 → 1: three reductions."
    ],
    "b": [
      "Remove one",
      "8 → 7 → 6 → 5 → 4 → 3 → 2 → 1: seven reductions."
    ],
    "walkthrough": [
      {
        "title": "Define the count",
        "text": "Here one action reduces the size. We are not counting the full sorting algorithm yet."
      },
      {
        "title": "Read log simply",
        "text": "log₂ 8 = 3 because three halvings reach 1. For uneven sizes we must decide how to round."
      },
      {
        "title": "Read O and Θ",
        "text": "O describes an upper growth bound. Θ describes a tight growth rate, bounded above and below by constant multiples for sufficiently large inputs."
      }
    ],
    "lesson": "A short path does not by itself tell us the total work of all paths.",
    "check": "If every level processes all eight cards, do three levels mean only three card actions?",
    "answer": "No. Three levels times eight card actions per level gives 24 actions in that model.",
    "extra": "These are size models. Actual comparisons depend on the algorithm and input.",
    "refs": [
      "0-3",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-3",
    "visual": "tools",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 6,
    "end": 12
  },
  {
    "id": 3,
    "week": "7",
    "title": "Recursion means solving a smaller version",
    "question": "Count four parts by separating the first part from the rest.",
    "a": [
      "Large problem",
      "Count [A, B, C, D]. Count the remaining three, then add one."
    ],
    "b": [
      "Stopping case",
      "An empty collection contains zero parts. No smaller call is needed."
    ],
    "walkthrough": [
      {
        "title": "Make the task smaller",
        "text": "Each recursive call receives one fewer part. The smaller result is the count of everything except the first part."
      },
      {
        "title": "Reach a base case",
        "text": "The empty input returns 0 immediately. Without a stopping case, the process would keep asking for another answer."
      },
      {
        "title": "Return answers upward",
        "text": "The pending calls add one in reverse order: 0 becomes 1, then 2, then 3, then 4. Calls need storage while waiting."
      }
    ],
    "lesson": "A recursive solution needs a base case, progress toward it, and a way to use the smaller answer.",
    "check": "What fails if a recursive call receives the same input size forever?",
    "answer": "There is no progress toward the base case. It may continue until the call stack limit is reached.",
    "extra": "This is a teaching model. A simple loop is usually easier for counting a list. Recursion does not automatically make an algorithm faster.",
    "refs": [
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "recursion",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 12,
    "end": 18
  },
  {
    "id": 4,
    "week": "7",
    "title": "Turn the actions into a recurrence",
    "question": "T(n) means the work needed for an input of size n.",
    "a": [
      "One half-sized call",
      "One smaller problem plus constant local work: T(n) = T(n/2) + O(1)."
    ],
    "b": [
      "Two half-sized calls",
      "Solve both halves, then process all n items: T(n) = 2T(n/2) + Θ(n)."
    ],
    "walkthrough": [
      {
        "title": "Count calls",
        "text": "The number before T counts recursive calls, not the number of loops written in the source."
      },
      {
        "title": "Count their sizes",
        "text": "A half-sized call uses n/2 items in this simplified model. A call with n − 1 is a different pattern."
      },
      {
        "title": "Count local work",
        "text": "Add the work done outside the recursive calls. A linear merge contributes Θ(n); reading one value contributes constant work."
      }
    ],
    "lesson": "Calls, sizes, and local work are three separate questions.",
    "check": "What recurrence describes one call on n − 1 items plus a scan of n items?",
    "answer": "T(n) = T(n − 1) + Θ(n), with a constant-size base case.",
    "extra": "Use floor and ceiling for unequal halves. Power-of-two inputs make the introductory pictures easier.",
    "refs": [
      "1-2",
      "recurrence"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "recurrence",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 18,
    "end": 24
  },
  {
    "id": 5,
    "week": "7",
    "title": "Merge two sorted rows",
    "question": "Merge [2, 5, 8] and [1, 4, 9] into one sorted row.",
    "a": [
      "Compare the front values",
      "2 versus 1: take 1. Then 2 versus 4: take 2."
    ],
    "b": [
      "Continue without going backward",
      "Take the smaller remaining front each time. When one row is empty, copy the rest of the other row."
    ],
    "walkthrough": [
      {
        "title": "Use the sorted-input promise",
        "text": "The smallest remaining value of each row is at its front. We never need to search behind that front."
      },
      {
        "title": "Move one pointer",
        "text": "After copying a value, advance only its row’s pointer. The other candidate remains for the next comparison."
      },
      {
        "title": "Finish the leftovers",
        "text": "Once one row is empty, the other row is already sorted. Its remaining values can be appended directly."
      }
    ],
    "lesson": "Two sorted inputs can be merged with linear work in their total length.",
    "check": "Does this procedure correctly sort two arbitrary unsorted rows?",
    "answer": "No. It depends on each input row already being sorted.",
    "extra": "At most a + b − 1 value comparisons are needed when both rows are nonempty. All a + b output values still need writing.",
    "refs": [
      "2-1"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "merge",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 24,
    "end": 30
  },
  {
    "id": 6,
    "week": "7",
    "title": "Merge sort: split, solve, combine",
    "question": "Sort [7, 2, 5, 1].",
    "a": [
      "Split into small problems",
      "[7, 2] and [5, 1], then single-item lists. A single item is already sorted."
    ],
    "b": [
      "Merge upward",
      "[7] and [2] become [2, 7]. [5] and [1] become [1, 5]. Merge those to get [1, 2, 5, 7]."
    ],
    "walkthrough": [
      {
        "title": "Base case",
        "text": "Lists of length zero or one return immediately. The Python example makes a copy so it does not modify the original input."
      },
      {
        "title": "Recursive work",
        "text": "Each half is sorted with the same function. Only after both answers return do we merge them."
      },
      {
        "title": "Combine carefully",
        "text": "The merge compares front candidates using indices. Choosing the left candidate on equal keys preserves their original relative order."
      }
    ],
    "lesson": "Each merge receives sorted halves because the smaller calls have already finished.",
    "check": "Why does the code use indices instead of repeatedly deleting the first list item?",
    "answer": "Deleting the front of a Python list shifts the remaining items. Indices avoid those repeated shifts and preserve linear merge work.",
    "extra": "The runnable example uses slices and a separate output list. It is not an in-place sorting algorithm.",
    "refs": [
      "2-2"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "python",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 30,
    "end": 36
  },
  {
    "id": 7,
    "week": "7",
    "title": "Count merge work one level at a time",
    "question": "Imagine sorting eight values by balanced splitting.",
    "a": [
      "Bottom merging level",
      "Four merges of size 2 write 8 output items in total."
    ],
    "b": [
      "Next two levels",
      "Two merges of size 4 write 8; one merge of size 8 writes 8. Total merge writes: 24."
    ],
    "walkthrough": [
      {
        "title": "Add across a level",
        "text": "Subproblem sizes differ between levels, but their sum is eight on each merging level."
      },
      {
        "title": "Count levels",
        "text": "Three merging levels connect single items to eight items. For n a power of two, there are log₂ n such levels."
      },
      {
        "title": "Multiply the totals",
        "text": "n output writes per level across log₂ n merging levels gives n log₂ n merge writes in this model. Standard merge sort has Θ(n log n) time."
      }
    ],
    "lesson": "Count all work across a level, then count the levels.",
    "check": "For four values, how many output writes across merging levels?",
    "answer": "Two levels × four values = eight merge-output writes.",
    "extra": "This counts output writes in merges, not exact comparisons, slicing, allocation, or elapsed time. Standard merge sort also needs linear auxiliary storage.",
    "refs": [
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-3",
    "visual": "mergecost",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 36,
    "end": 42
  },
  {
    "id": 8,
    "week": "7",
    "title": "Do two sets share an ID?",
    "question": "Compare sorted IDs [1, 4, 7] and [2, 4, 9].",
    "a": [
      "Smaller value can be skipped",
      "1 < 2, so advance the first pointer. Then 2 < 4, so advance the second pointer."
    ],
    "b": [
      "Equal values answer the question",
      "The two pointers reach 4 and 4. The sets share ID 4."
    ],
    "walkthrough": [
      {
        "title": "Use both sorted orders",
        "text": "If the current left value is smaller, it cannot match any later right value, which is at least the current right value."
      },
      {
        "title": "Advance one side",
        "text": "Skip only the smaller current value. Equality proves an intersection; stop if all you need is a yes/no answer."
      },
      {
        "title": "Include preparation",
        "text": "The two-pointer scan is O(a + b). Sorting initially unsorted inputs adds its own cost."
      }
    ],
    "lesson": "The same front-pointer idea supports more than merging.",
    "check": "If one row ends without a match, what can we conclude?",
    "answer": "The sets are disjoint: no common value was found, and no unexamined pair can match.",
    "extra": "Hashing is another option with expected linear total work under suitable assumptions and additional storage.",
    "refs": [
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-4",
    "visual": "sets",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 42,
    "end": 48
  },
  {
    "id": 9,
    "week": "7",
    "title": "Merging: three mistakes to avoid",
    "question": "Try a tie and an exhausted row.",
    "a": [
      "Equal values",
      "Left [2A] and right [2B] have equal keys. Take 2A first to keep original order."
    ],
    "b": [
      "One row ends",
      "Left [1] and right [2, 3] merge to [1, 2, 3]. Do not forget the remaining 2 and 3."
    ],
    "walkthrough": [
      {
        "title": "Do not confuse merge with concatenate",
        "text": "Putting [2, 7] before [1, 5] gives [2, 7, 1, 5], which is not sorted."
      },
      {
        "title": "State the tie policy",
        "text": "Stability is about equal-key records. Their names or payloads must stay with their keys."
      },
      {
        "title": "Count copying too",
        "text": "An empty row may mean zero further key comparisons, but copying the remaining row still takes work."
      }
    ],
    "lesson": "Correct values, preserved records, and honest cost counts all matter.",
    "check": "Does zero comparisons imply zero work when merging [] and [1, 2, 3]?",
    "answer": "No. Returning a newly materialized result still requires three output writes.",
    "extra": "Different implementations may reuse storage instead. State the implementation before counting its work.",
    "refs": [
      "2-5"
    ],
    "ref": "lecture-notes.html#topic-2-5",
    "visual": "mergeerrors",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 48,
    "end": 54
  },
  {
    "id": 10,
    "week": "7",
    "title": "A recursion tree is a work map",
    "question": "For T(n) = 2T(n/2) + n, draw n = 8.",
    "a": [
      "Nodes describe subproblems",
      "One size-8 problem creates two size-4 problems; each creates two size-2 problems."
    ],
    "b": [
      "Labels describe local work",
      "At these levels, local work totals 8, then 4 + 4 = 8, then 2 + 2 + 2 + 2 = 8."
    ],
    "walkthrough": [
      {
        "title": "Keep recursive and local work separate",
        "text": "A node’s local-work label excludes the recursive calls below it. Otherwise we would count the same work twice."
      },
      {
        "title": "Sum each level",
        "text": "Add the node labels horizontally. A large number of small nodes can still have the same total as one large node."
      },
      {
        "title": "Then sum the levels",
        "text": "The internal levels contribute 8 × 3 in this model. Eight constant-cost leaves add O(8), which does not change Θ(n log n)."
      }
    ],
    "lesson": "The tree shows where the work happens; it is not an extra data structure the sorting algorithm must build.",
    "check": "Do eight leaves each cost eight units?",
    "answer": "No. Each leaf has size one and constant base-case work. Together they contribute Θ(8).",
    "extra": "This example uses equal halves and linear local work. Other recurrences can have different level totals.",
    "refs": [
      "3-1"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "tree",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 54,
    "end": 60
  },
  {
    "id": 11,
    "week": "7",
    "title": "Removing one item is not halving",
    "question": "Compare T(n) = T(n − 1) + n with balanced splitting.",
    "a": [
      "One long chain",
      "For n = 5, local work is 5, 4, 3, 2, followed by a constant base case."
    ],
    "b": [
      "A growing sum",
      "With base cost T(1) = 1 and exactly n local work above it, T(5) = 5 + 4 + 3 + 2 + 1 = 15."
    ],
    "walkthrough": [
      {
        "title": "Count the depth",
        "text": "The chain loses one item per call. Its depth grows in proportion to n, not log n."
      },
      {
        "title": "Add unequal costs",
        "text": "Later calls scan fewer items, but there are many calls. The sum 1 + … + n is n(n + 1)/2."
      },
      {
        "title": "Name the growth",
        "text": "The largest term is proportional to n², so the recurrence has Θ(n²) growth under these assumptions."
      }
    ],
    "lesson": "Recursion alone does not imply logarithmic work.",
    "check": "What is the exact sum for n = 6 in this model?",
    "answer": "6 + 5 + 4 + 3 + 2 + 1 = 21.",
    "extra": "The exact 15 and 21 use local cost n and base cost 1. Θ(n) local cost gives the same asymptotic growth, not necessarily those exact totals.",
    "refs": [
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "subtract",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 60,
    "end": 66
  },
  {
    "id": 12,
    "week": "7",
    "title": "Check a proposed formula",
    "question": "For T(n) = T(n − 1) + n and T(1) = 1, try T(n) = n(n + 1)/2.",
    "a": [
      "Check the beginning",
      "At n = 1, the formula gives 1. It matches the base case."
    ],
    "b": [
      "Check one general step",
      "Assume T(n − 1) = (n − 1)n/2. Add n to obtain n(n + 1)/2."
    ],
    "walkthrough": [
      {
        "title": "A few numerical examples are not a proof",
        "text": "They can suggest a formula, but they do not cover every possible n."
      },
      {
        "title": "Use the smaller-case assumption",
        "text": "Substitution replaces T(n − 1) with the proposed formula for the smaller size. Then ordinary algebra checks the recurrence."
      },
      {
        "title": "Connect the steps",
        "text": "The base case starts the argument. The induction step carries it from each positive integer to the next."
      }
    ],
    "lesson": "A proof needs a starting case and a valid general step.",
    "check": "Why is checking only n = 5 insufficient?",
    "answer": "Many incorrect formulas happen to match one input. The general step must work for every permitted n.",
    "extra": "For asymptotic bounds, substitute a bound with suitable constants and check the inequality as well as the base cases.",
    "refs": [
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "substitution",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 66,
    "end": 72
  },
  {
    "id": 13,
    "week": "7",
    "title": "Three recurrence patterns, three outcomes",
    "question": "Compare the work above, across, and below the recursive calls.",
    "a": [
      "One half plus one check",
      "T(n) = T(n/2) + 1: one constant-cost node per level, giving Θ(log n)."
    ],
    "b": [
      "Two halves: cheap or expensive combining?",
      "2T(n/2) + 1 gives Θ(n). But 2T(n/2) + n gives Θ(n log n)."
    ],
    "walkthrough": [
      {
        "title": "Count the branches",
        "text": "Two recursive calls create more nodes than one call, even when both use half-sized inputs."
      },
      {
        "title": "Count local work",
        "text": "With constant work per node in a full binary recursion tree, the number of nodes is proportional to n. Linear work at every node instead gives n per level."
      },
      {
        "title": "Use the tool only where it fits",
        "text": "The usual Master theorem applies to forms like aT(n/b) + f(n), with its assumptions. T(n − 1) + n is not that form."
      }
    ],
    "lesson": "Do not assign a complexity just because you see recursion or division by two.",
    "check": "Which pattern matches merge sort?",
    "answer": "Two half-sized calls plus linear merging: 2T(n/2) + Θ(n), giving Θ(n log n).",
    "extra": "These introductory claims use constant-size base cases and convenient power-of-two inputs. Exact floors and ceilings do not change these bounds.",
    "refs": [
      "3-4",
      "3-5"
    ],
    "ref": "lecture-notes.html#topic-3-4",
    "visual": "patterns",
    "minutes": 6,
    "block": "Recursion and merging",
    "start": 72,
    "end": 78
  },
  {
    "id": 14,
    "week": "7",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen, then return ready to explain a small example.",
    "a": [
      "Before the break",
      "Choose one idea you can draw."
    ],
    "b": [
      "After the break",
      "We will compare it with a different method."
    ],
    "walkthrough": [],
    "lesson": "Practice and breaks are included in the lesson time.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for discussion.",
    "extra": "The schedule is a teaching guide, not an automatic timer.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 78,
    "end": 88
  },
  {
    "id": 15,
    "week": "7",
    "title": "Partition around a pivot",
    "question": "Use last value 3 as the pivot for [4, 1, 5, 2, 3].",
    "a": [
      "Place smaller values left",
      "The scan moves 1 and 2 into the left region. Values at least 3 stay in the other region."
    ],
    "b": [
      "Place the pivot between regions",
      "After this partition, [1, 2, 3, 4, 5] happens to be fully sorted. That is not guaranteed after one partition."
    ],
    "walkthrough": [
      {
        "title": "Fix one precise procedure",
        "text": "The visual uses a last-element pivot and a strict less-than test. A boundary marks the next position for a smaller value."
      },
      {
        "title": "Scan once",
        "text": "Compare each other value with the pivot. If it is smaller, move it to the boundary and advance the boundary."
      },
      {
        "title": "Finish the partition",
        "text": "Swap the pivot into the boundary position. Recursively sort the two regions, excluding this pivot position."
      }
    ],
    "lesson": "Partition establishes a boundary, not necessarily sorted subarrays.",
    "check": "Does partitioning [7, 2, 5, 1, 4] fully sort it?",
    "answer": "No. This procedure gives [2, 1, 4, 7, 5]. The pivot is placed correctly, but both sides still need work.",
    "extra": "Other partition schemes have different states and recursion boundaries. Follow the specified procedure.",
    "refs": [
      "4-1"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "partition",
    "minutes": 6,
    "block": "Quicksort",
    "start": 88,
    "end": 94
  },
  {
    "id": 16,
    "week": "7",
    "title": "A pivot can share the work—or barely reduce it",
    "question": "Sort seven distinct keys.",
    "a": [
      "Near-middle pivot",
      "Two regions of about three keys lead to a short recursion tree."
    ],
    "b": [
      "Always an extreme pivot",
      "Regions have sizes 0 and 6, then 0 and 5, and so on. The scan work piles up."
    ],
    "walkthrough": [
      {
        "title": "Balanced case",
        "text": "A level can examine O(n) values, and balanced recursion has O(log n) levels. This gives Θ(n log n) work."
      },
      {
        "title": "Worst case",
        "text": "Choosing the smallest or largest key repeatedly creates a chain of partitions. Their comparisons sum to n(n − 1)/2 for this simple scheme."
      },
      {
        "title": "Separate one bad split from a pattern",
        "text": "One uneven split does not prove quadratic total work. The worst case needs repeated extreme splits."
      }
    ],
    "lesson": "Partition quality determines how much work remains.",
    "check": "For sorted seven-key input with the last key always chosen as pivot, how many pivot comparisons?",
    "answer": "6 + 5 + 4 + 3 + 2 + 1 = 21.",
    "extra": "This count is for distinct keys and the demonstrated one-comparison-per-scanned-item partition.",
    "refs": [
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-2",
    "visual": "balance",
    "minutes": 6,
    "block": "Quicksort",
    "start": 94,
    "end": 100
  },
  {
    "id": 17,
    "week": "7",
    "title": "Random pivots reduce dependence on input order",
    "question": "Would an already sorted input always force the worst case?",
    "a": [
      "Fixed last-key pivot",
      "Sorted input repeatedly chooses the maximum in this scheme."
    ],
    "b": [
      "Uniformly random pivot",
      "Each current key has equal chance of being selected. Input order alone no longer forces extreme choices."
    ],
    "walkthrough": [
      {
        "title": "State the randomness",
        "text": "Expected analysis averages over random pivot choices for a fixed input. It is not a guarantee about every individual run."
      },
      {
        "title": "Why the average improves",
        "text": "Many pivots leave useful work on both sides. The full analysis gives expected O(n log n) comparisons for distinct keys."
      },
      {
        "title": "Keep the limitation",
        "text": "A sequence of unlucky choices can still be quadratic. Sampling heuristics such as median-of-three can help practice, but do not by themselves guarantee the worst-case bound."
      }
    ],
    "lesson": "Expected performance and worst-case performance are different promises.",
    "check": "Does random pivot selection guarantee two equal halves?",
    "answer": "No. It can choose any rank, including the minimum or maximum.",
    "extra": "Duplicate-heavy data needs appropriate partitioning too. Randomizing does not fix a strict two-way scheme that sends all equal keys to one side.",
    "refs": [
      "4-3",
      "4-4"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "random",
    "minutes": 6,
    "block": "Quicksort",
    "start": 100,
    "end": 106
  },
  {
    "id": 18,
    "week": "7",
    "title": "Equal keys need attention",
    "question": "Try sorting [4, 4, 4, 4] with strict two-way partitioning.",
    "a": [
      "Two-way rule: less than pivot",
      "No value is less than 4. The pivot leaves a region of size three, then two, then one."
    ],
    "b": [
      "Three-way partition",
      "Separate values into less than, equal to, and greater than the pivot. Here all four belong in the equal region."
    ],
    "walkthrough": [
      {
        "title": "Duplicates are not rare noise",
        "text": "Sensor readings and categorical values often repeat. An algorithm should handle them deliberately."
      },
      {
        "title": "Do not recurse on the equal region",
        "text": "All equal keys already have the same sorting key. Only the less-than and greater-than regions need further sorting."
      },
      {
        "title": "Still preserve records",
        "text": "Equal-key records may carry different timestamps or IDs. A typical in-place quicksort does not guarantee stable relative order."
      }
    ],
    "lesson": "Random pivots and duplicate handling solve different problems.",
    "check": "How many strict two-way pivot comparisons for four equal values?",
    "answer": "3 + 2 + 1 = 6. A three-way partition can group them in one linear pass.",
    "extra": "The three-way picture illustrates grouping. It is not a claim that the displayed two-way implementation suddenly becomes three-way.",
    "refs": [
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-4-7",
    "visual": "duplicates",
    "minutes": 6,
    "block": "Quicksort",
    "start": 106,
    "end": 112
  },
  {
    "id": 19,
    "week": "7",
    "title": "Choose by guarantees and measured workload",
    "question": "Compare merge sort, heapsort, and quicksort.",
    "a": [
      "Need stable order of equal keys",
      "A stable merge sort is a natural candidate; ordinary heapsort and in-place quicksort are not generally stable."
    ],
    "b": [
      "Need a worst-case time bound",
      "Merge sort and heapsort provide O(n log n) worst-case time. Ordinary quicksort can be quadratic."
    ],
    "walkthrough": [
      {
        "title": "Include memory",
        "text": "Standard array merge sort uses O(n) auxiliary storage. Iterative heapsort can use O(1) extra space. Quicksort also needs stack management."
      },
      {
        "title": "Read benchmark conditions",
        "text": "Numbers depend on language, implementation, hardware, input sizes and key distributions. A timing table from one system is not a universal ranking."
      },
      {
        "title": "Prefer a suitable library",
        "text": "Production libraries may combine algorithms and protections. Choose their documented guarantees rather than assuming the function name reveals the implementation."
      }
    ],
    "lesson": "The right question is which guarantees and costs the application needs.",
    "check": "Does “in-place quicksort partition” mean the whole recursive sort uses no extra memory?",
    "answer": "No. Recursive calls use stack space. Naive recursion can use O(n) stack in the worst case.",
    "extra": "Recursing on the smaller partition and iterating over the larger can bound stack depth, but does not remove quadratic comparison time.",
    "refs": [
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-5",
    "visual": "choice",
    "minutes": 6,
    "block": "Quicksort",
    "start": 112,
    "end": 118
  },
  {
    "id": 20,
    "week": "7",
    "title": "Match nuts and bolts with cross-comparisons",
    "question": "You may compare a nut with a bolt, but not two nuts or two bolts.",
    "a": [
      "Choose one nut",
      "Compare that nut with each bolt. Find its matching bolt and separate smaller and larger bolts."
    ],
    "b": [
      "Use the matching bolt",
      "Compare it with the other nuts. This creates matching smaller and larger nut groups."
    ],
    "walkthrough": [
      {
        "title": "Use only allowed comparisons",
        "text": "A nut-bolt test tells us too small, equal, or too large. Directly sorting nuts against nuts would break the problem’s rule."
      },
      {
        "title": "Create corresponding groups",
        "text": "The matching pair separates both collections at the same size. Recurse on the corresponding smaller groups and larger groups."
      },
      {
        "title": "Finish at small groups",
        "text": "With distinct sizes and one matching bolt per nut, this quicksort-like method can solve the matching problem. Random pivot choices give expected O(n log n) comparisons."
      }
    ],
    "lesson": "Divide-and-conquer can work even when ordinary same-type sorting is not allowed.",
    "check": "Why find the matching bolt before partitioning the nuts?",
    "answer": "We need a bolt to compare against nuts. The original pivot nut cannot be compared directly with other nuts.",
    "extra": "This introduction assumes distinct sizes and a perfect one-to-one matching set. Missing or duplicate matches need additional rules.",
    "refs": [
      "4-6"
    ],
    "ref": "lecture-notes.html#topic-4-6",
    "visual": "nuts",
    "minutes": 6,
    "block": "Quicksort",
    "start": 118,
    "end": 124
  },
  {
    "id": 21,
    "week": "7",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen, then return ready to explain a small example.",
    "a": [
      "Before the break",
      "Choose one idea you can draw."
    ],
    "b": [
      "After the break",
      "We will compare it with a different method."
    ],
    "walkthrough": [],
    "lesson": "Practice and breaks are included in the lesson time.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for discussion.",
    "extra": "The schedule is a teaching guide, not an automatic timer.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 124,
    "end": 134
  },
  {
    "id": 22,
    "week": "7",
    "title": "Sorting by comparisons needs enough answers",
    "question": "Three distinct keys can arrive in six different orders.",
    "a": [
      "One yes/no comparison",
      "At most two outcomes. That cannot distinguish six possible orders."
    ],
    "b": [
      "Three comparisons on the deepest path",
      "Two comparisons give at most four outcome paths. Three give at most eight, enough capacity for six orders."
    ],
    "walkthrough": [
      {
        "title": "Think of a decision tree",
        "text": "Each comparison chooses a branch. A correct algorithm needs a distinguishable outcome for every possible ordering of distinct keys."
      },
      {
        "title": "Count the possibilities",
        "text": "n distinct keys have n! possible orders. A binary decision tree of height h has at most 2^h leaves."
      },
      {
        "title": "Read the lower bound",
        "text": "Thus the worst-case number of comparisons is at least ceiling(log₂(n!)), which grows as Ω(n log n). Ceiling means round up."
      }
    ],
    "lesson": "This is a worst-case lower bound for general comparison sorting, not every specialized sorting task.",
    "check": "Does the bound say every input needs n log n comparisons?",
    "answer": "No. It says some inputs require that much work asymptotically in the comparison model. Favorable inputs can be easier.",
    "extra": "The binary model uses distinct keys. Counting and radix methods exploit additional key structure and do not contradict this bound.",
    "refs": [
      "5-1"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "lower",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 134,
    "end": 140
  },
  {
    "id": 23,
    "week": "7",
    "title": "Count small integer keys instead of comparing pairs",
    "question": "Readings are [3, 1, 2, 3, 0, 1], all in the allowed range 0 through 15.",
    "a": [
      "Count occurrences",
      "Nonzero counts are: 0 → 1, 1 → 2, 2 → 1, 3 → 2."
    ],
    "b": [
      "Rebuild numerical order",
      "Write 0 once, 1 twice, 2 once, and 3 twice: [0, 1, 1, 2, 3, 3]."
    ],
    "walkthrough": [
      {
        "title": "Use the key as an index",
        "text": "The key selects a counter directly. We are not learning order only through pairwise comparisons."
      },
      {
        "title": "Count the whole cost",
        "text": "Scan n inputs, initialize and scan k counters, then write n outputs. Work is Θ(n + k), where k is the size of the key range."
      },
      {
        "title": "Check whether the range is small",
        "text": "A few values spread between 0 and a billion do not justify a billion counters. Range size matters as well as item count."
      }
    ],
    "lesson": "Counting sort is useful when the integer range is suitably small.",
    "check": "Is this automatically faster if n = 6 and keys range from 0 to one billion?",
    "answer": "No. The enormous counter range can dominate time and memory.",
    "extra": "This simple visual reconstructs bare keys. Stable counting sort for full records uses cumulative counts and an output array to preserve equal-key order.",
    "refs": [
      "5-2",
      "5-3"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "counting",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 140,
    "end": 146
  },
  {
    "id": 24,
    "week": "7",
    "title": "Buckets group ranges, then sort inside each group",
    "question": "Place values [0.42, 0.12, 0.88, 0.30, 0.74] into four equal-width buckets.",
    "a": [
      "Spread-out input",
      "Some buckets get one or two values. Sorting each small bucket can be cheap."
    ],
    "b": [
      "Concentrated input",
      "If every value lands in one bucket, the inner sorting method still faces almost the whole input."
    ],
    "walkthrough": [
      {
        "title": "Define the boundaries",
        "text": "For x in [0, 1), choose bucket floor(4x). The intervals are [0, .25), [.25, .5), [.5, .75), [.75, 1)."
      },
      {
        "title": "Sort within each bucket",
        "text": "Distribution alone is not enough: .42 and .30 land together but are initially out of order."
      },
      {
        "title": "Join buckets in order",
        "text": "All values in an earlier bucket are no larger than those in a later one. After internal sorting, concatenating gives sorted output."
      }
    ],
    "lesson": "Expected linear bucket-sort claims need a suitable distribution and bucket count.",
    "check": "Where does 0.50 go? Is 1.00 allowed in this example?",
    "answer": "0.50 goes to bucket 2. The stated input range excludes 1.00.",
    "extra": "With insertion sort inside buckets, concentration can give quadratic time. Other inner algorithms change that worst-case behavior.",
    "refs": [
      "5-4"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "buckets",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 146,
    "end": 152
  },
  {
    "id": 25,
    "week": "7",
    "title": "Sort digits, preserving previous work",
    "question": "Use least-significant-digit radix sort on nonnegative integers.",
    "a": [
      "First pass",
      "Group stably by the units digit. Values with the same digit keep their current relative order."
    ],
    "b": [
      "Later passes",
      "Sort stably by tens, then hundreds. Treat missing leading digits as zero."
    ],
    "walkthrough": [
      {
        "title": "Work from right to left",
        "text": "The units pass establishes order of the lowest digit. The next stable pass adds the tens digit without destroying that lower-digit order within ties."
      },
      {
        "title": "Stability is essential",
        "text": "If a later pass randomly reorders equal-digit items, earlier work can be lost."
      },
      {
        "title": "Count passes and buckets",
        "text": "With d digits and base b, stable counting passes cost O(d(n + b)). This is not automatically O(n) if the number of digits grows."
      }
    ],
    "lesson": "Radix sort uses the internal structure of the keys, not only comparisons between whole keys.",
    "check": "Why should 2 be treated like 002 in a three-digit example?",
    "answer": "Leading zeros put it in the correct low groups on later passes without changing its numerical value.",
    "extra": "This lesson uses nonnegative base-10 integers. Negative numbers and variable-length text require explicit ordering and encoding rules.",
    "refs": [
      "5-5"
    ],
    "ref": "lecture-notes.html#topic-5-5",
    "visual": "radix",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 152,
    "end": 158
  },
  {
    "id": 26,
    "week": "7",
    "title": "Sensor logs and ADC readings need different choices",
    "question": "One device merges sorted time logs. Another counts ADC reading levels.",
    "a": [
      "Two time-ordered logs",
      "Use a linear merge. Each input is already sorted, so there is no need to sort their union from scratch."
    ],
    "b": [
      "Small ADC range",
      "For a 12-bit ADC, codes run from 0 to 4095. A 4096-counter histogram records how often each code appears."
    ],
    "walkthrough": [
      {
        "title": "Keep the output goal clear",
        "text": "A histogram answers frequency questions. It does not preserve the timestamps or identities of individual readings."
      },
      {
        "title": "Choose the memory budget",
        "text": "4096 four-byte counters occupy 16384 bytes, or 16 KiB, before language/container overhead. Counter overflow must also be considered."
      },
      {
        "title": "Separate records from bare keys",
        "text": "To sort full records stably by ADC code, use a stable record-sorting method. Simply repeating each code from its count loses the associated record data."
      }
    ],
    "lesson": "Use the structure already present in the data, and preserve the information the application needs.",
    "check": "Can a histogram reconstruct the original arrival order?",
    "answer": "No. Different arrival sequences can produce the same counts.",
    "extra": "Merged timestamp ties need a policy, such as source priority or arrival sequence. A timestamp alone may not uniquely identify a record.",
    "refs": [
      "6"
    ],
    "ref": "lecture-notes.html#topic-6",
    "visual": "engineering",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 158,
    "end": 164
  },
  {
    "id": 27,
    "week": "7",
    "title": "Use small examples to reject false claims",
    "question": "Test “one partition sorts everything” and “a constant number of loops means constant time.”",
    "a": [
      "Partition counterexample",
      "[7, 2, 5, 1, 4] partitions to [2, 1, 4, 7, 5]. The pivot is placed, but the sides are not sorted."
    ],
    "b": [
      "Counting counterexample",
      "Counting sort uses a fixed number of loops, but those loops still process n items and k counters."
    ],
    "walkthrough": [
      {
        "title": "State exactly what is promised",
        "text": "Partition promises that values are on the correct side of a pivot. It does not promise sorted order within each side."
      },
      {
        "title": "Read loop lengths",
        "text": "A loop over all n items has work that grows with n even if it appears only once in the source."
      },
      {
        "title": "Check assumptions",
        "text": "Before naming a complexity, ask about input order, duplicate keys, key range, and what operations are counted."
      }
    ],
    "lesson": "A short trace is often the fastest way to uncover a mistaken claim.",
    "check": "Does the comparison lower bound forbid a linear scan that checks whether input is already sorted?",
    "answer": "No. Checking sortedness is a different task from sorting arbitrary inputs.",
    "extra": "A counterexample disproves a universal claim. Passing a few examples does not prove an algorithm correct.",
    "refs": [
      "7-1",
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-7-1",
    "visual": "counterexample",
    "minutes": 6,
    "block": "Limits and applications",
    "start": 164,
    "end": 170
  },
  {
    "id": 28,
    "week": "7",
    "title": "Explain the path, then name the cost",
    "question": "Use the final ten minutes to solve two small tasks.",
    "a": [
      "Merge challenge",
      "Merge [1, 4, 6] and [2, 3, 5]. Count comparisons and output writes separately."
    ],
    "b": [
      "Sorting choice",
      "You have many integer readings in 0..15. Explain when counting is useful and what information it preserves."
    ],
    "walkthrough": [
      {
        "title": "Merge answer",
        "text": "Take 1, 2, 3, 4, 5 using five comparisons. Append leftover 6. Six values are written to the output."
      },
      {
        "title": "Counting answer",
        "text": "Use 16 counters, scan the readings, then scan the counters. Cost is Θ(n + 16), which is Θ(n) for this fixed range. Reconstructed keys do not retain record identity."
      },
      {
        "title": "Recap the main contrast",
        "text": "Balanced splitting with linear combining gives n log n work. Repeatedly losing just one item can give n². Specialized integer methods exploit more information than comparison sorting."
      }
    ],
    "lesson": "An accurate explanation names the task, the assumptions, and the counted work.",
    "check": "Which statement is safer: “quicksort is always n log n” or “randomized quicksort is expected n log n under suitable assumptions”?",
    "answer": "The second. Ordinary quicksort still has quadratic worst cases, and duplicate handling matters.",
    "extra": "The linked original notes contain longer exercises, extra interactive demonstrations, and additional runnable Python examples.",
    "refs": [
      "7-2",
      "8"
    ],
    "ref": "lecture-notes.html#topic-7-2",
    "visual": "final",
    "minutes": 10,
    "block": "Limits and applications",
    "start": 170,
    "end": 180
  }
];
