/* Week 6: guided examples with explicit assumptions. */
const cards = [
  {
    "id": 1,
    "week": "6",
    "title": "Three rules for choosing the next job",
    "question": "Jobs arrive as A, B, C. Their deadlines are 9, 3, 7 milliseconds.",
    "a": [
      "Arrival order",
      "A queue chooses A first. A stack chooses C first."
    ],
    "b": [
      "Deadline order",
      "A priority queue chooses B first, because 3 ms is the earliest deadline."
    ],
    "walkthrough": [
      {
        "title": "Separate the job from the rule",
        "text": "The same three jobs can be stored in each structure. The removal rule changes which job comes out first."
      },
      {
        "title": "Name the operations",
        "text": "A stack removes the newest item. A queue removes the oldest. A priority queue removes the item with the best priority key."
      },
      {
        "title": "Storage is a second choice",
        "text": "Arrays and linked structures can implement these rules. This week we use an array to store a heap, which implements a priority queue."
      }
    ],
    "lesson": "First decide what “next” means. Then choose the data structure.",
    "check": "If C becomes the most urgent job, does a normal queue automatically move it first?",
    "answer": "No. Its rule is arrival order. A priority queue must use the updated priority key and maintain its ordering rule.",
    "extra": "The deadline is the key; the job name is its associated value. Earlier deadlines mean smaller keys here.",
    "refs": [
      "0-1",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "order",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 0,
    "end": 6
  },
  {
    "id": 2,
    "week": "6",
    "title": "Keep the minimum easy to reach",
    "question": "Repeatedly ask: which sensor task has the earliest deadline?",
    "a": [
      "Search again each time",
      "An unsorted array may need a full scan. A hash table does not keep keys in deadline order."
    ],
    "b": [
      "Keep useful order",
      "A min-heap keeps a minimum at its root. Reading that value does not require a scan."
    ],
    "walkthrough": [
      {
        "title": "Recall the tree option",
        "text": "A BST finds its minimum by following left links. A balanced BST keeps the path short; an ordinary BST may have a long path."
      },
      {
        "title": "Ask a narrower question",
        "text": "A heap focuses on the minimum or maximum. It does not support all ordered-dictionary questions as efficiently as a balanced tree."
      },
      {
        "title": "Separate reading from removal",
        "text": "Peek reads the minimum in constant time. Removing it changes the heap and usually needs repairs."
      }
    ],
    "lesson": "Easy access to the minimum does not make every operation constant-time.",
    "check": "Does a min-heap also find an arbitrary ID immediately?",
    "answer": "No. The heap order does not tell us which branch contains an arbitrary key; worst-case search is O(n).",
    "extra": "O(n) is an upper bound proportional to the number of items. Reading the root is O(1), independent of heap size.",
    "refs": [
      "0-2"
    ],
    "ref": "lecture-notes.html#topic-0-2",
    "visual": "minimum",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 6,
    "end": 12
  },
  {
    "id": 3,
    "week": "6",
    "title": "Why pay to sort data?",
    "question": "Sensor readings arrive as 41, 7, 19, 3, 25, 12, 8.",
    "a": [
      "Before sorting",
      "A single scan can find a minimum. Many later questions may repeat work."
    ],
    "b": [
      "After sorting",
      "The order 3, 7, 8, 12, 19, 25, 41 helps with searching, finding neighbors, and detecting repeated values."
    ],
    "walkthrough": [
      {
        "title": "Pay an initial cost",
        "text": "Sorting changes the arrangement. It is not free, so include its cost when comparing methods."
      },
      {
        "title": "Use the arrangement more than once",
        "text": "Many searches on a fixed sorted array can use binary search. Neighbor-based questions can use a simple scan."
      },
      {
        "title": "Match the investment to the need",
        "text": "Sorting may be unnecessary if all you need is one minimum. It becomes more useful when later work benefits from the order."
      }
    ],
    "lesson": "Sorting is useful when its cost buys something the application needs.",
    "check": "For one minimum query on unsorted readings, must we sort first?",
    "answer": "No. A single scan finds the minimum in Θ(n) time. Sorting everything would do extra work.",
    "extra": "Θ(n) means growth proportional to n, within constant factors. Operation counts are not measured execution times.",
    "refs": [
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "sorting",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 12,
    "end": 18
  },
  {
    "id": 4,
    "week": "6",
    "title": "The closest readings become neighbors",
    "question": "Which two readings have the smallest numerical difference?",
    "a": [
      "Try every pair",
      "Seven readings have 21 pairs. Larger inputs quickly create many pairs to check."
    ],
    "b": [
      "Sort, then check neighbors",
      "3, 7, 8, 12, 19, 25, 41 gives gaps 4, 1, 4, 7, 6, 16. The closest pair is 7 and 8."
    ],
    "walkthrough": [
      {
        "title": "Read difference as distance",
        "text": "The distance between 7 and 8 is 1. It does not matter which was recorded first."
      },
      {
        "title": "Why adjacent pairs are enough",
        "text": "For sorted x ≤ y ≤ z, the gap z − x includes both smaller gaps. Skipping over y cannot produce a strictly smaller gap than both neighbors."
      },
      {
        "title": "Include both stages",
        "text": "Sorting takes its own time. The following scan checks only n − 1 gaps. Equal values also become neighbors, giving a gap of zero."
      }
    ],
    "lesson": "One useful order can replace many unnecessary comparisons.",
    "check": "For [6, 2, 6, 9], what is the closest pair?",
    "answer": "Sort to [2, 6, 6, 9]. The two occurrences of 6 have difference 0.",
    "extra": "This is distance between numbers on a line. Points in two or three dimensions need a different argument.",
    "refs": [
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "neighbors",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 18,
    "end": 24
  },
  {
    "id": 5,
    "week": "6",
    "title": "A tie rule is part of the task",
    "question": "Sort students by decreasing grade. Ece and Can both have 90.",
    "a": [
      "Stable, grade only",
      "Input Ece 90, Ali 85, Can 90, Deniz 85 becomes Ece 90, Can 90, Ali 85, Deniz 85."
    ],
    "b": [
      "Grade, then name",
      "An explicit alphabetical tie rule gives Can 90, Ece 90, Ali 85, Deniz 85."
    ],
    "walkthrough": [
      {
        "title": "Define which key wins",
        "text": "Decreasing grade means a larger grade comes first. A smaller name comes first only if we explicitly choose name as a second key."
      },
      {
        "title": "Understand stability",
        "text": "A stable sort keeps the original relative order of records whose complete sort keys are equal. It does not automatically alphabetize tied names."
      },
      {
        "title": "Keep records together",
        "text": "Move the name and grade together. Sorting just grades would lose the connection to each student."
      }
    ],
    "lesson": "A secondary key and a stable sort solve different problems.",
    "check": "If we sort only by grade stably, who comes first: Ece or Can?",
    "answer": "Ece, because Ece appeared first among the two equal-grade records.",
    "extra": "For these names, Python’s key (-grade, name) gives the second result. Python sorted() is stable; ordinary in-place heapsort is not generally stable.",
    "refs": [
      "1-3"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "ties",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 24,
    "end": 30
  },
  {
    "id": 6,
    "week": "6",
    "title": "Pair large with small to balance the loads",
    "question": "Four parts have weights 1, 3, 5, 9. Make two pairs and minimize the heaviest pair.",
    "a": [
      "Put the large parts together",
      "(1, 3) weighs 4; (5, 9) weighs 14. The heaviest pair is 14."
    ],
    "b": [
      "Pair opposite ends",
      "(1, 9) weighs 10; (3, 5) weighs 8. The heaviest pair is 10."
    ],
    "walkthrough": [
      {
        "title": "Name the objective",
        "text": "We want the largest pair sum to be as small as possible. The total weight stays 18 for every complete pairing."
      },
      {
        "title": "Check all choices here",
        "text": "The third pairing, (1, 5) and (3, 9), gives 6 and 12. Of the three possible pairings, the opposite-end pairing has the smallest maximum: 10."
      },
      {
        "title": "Why opposite ends make sense",
        "text": "Suppose the smallest and largest are in different pairs. Swap partners so they are paired together. The largest-plus-smallest cannot exceed the old pair containing the largest; the other new pair is also no heavier than that old pair. Repeat on the remaining values."
      }
    ],
    "lesson": "Sort, then pair the two ends and move inward.",
    "check": "For [2, 4, 6, 8], what pairs and largest sum do we get?",
    "answer": "(2, 8) and (4, 6); both weigh 10, so the largest sum is 10.",
    "extra": "There must be an even number of values. Each item is used once. This solves this specific largest-pair-sum objective, not every balancing problem.",
    "refs": [
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "pairing",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 30,
    "end": 36
  },
  {
    "id": 7,
    "week": "6",
    "title": "Peek reads. Extract removes.",
    "question": "A timer priority queue stores deadlines 5, 9, 7.",
    "a": [
      "Peek",
      "Read 5. All three timers remain stored."
    ],
    "b": [
      "Extract minimum",
      "Return 5 and remove that record. The next minimum is 7."
    ],
    "walkthrough": [
      {
        "title": "Choose min or max",
        "text": "An earlier deadline uses a min-priority queue. If larger task numbers mean more urgent, use a max-priority queue instead."
      },
      {
        "title": "Insert a new record",
        "text": "A new deadline of 2 must become reachable as the next minimum. A heap repairs its order after inserting."
      },
      {
        "title": "Decide what happens on ties",
        "text": "If two deadlines are equal, either can win unless we add a tie rule, such as an increasing arrival sequence number."
      }
    ],
    "lesson": "A priority queue is a set of operations, not necessarily a particular storage format.",
    "check": "Can we peek twice and get 5 both times?",
    "answer": "Yes, if no update occurs between peeks. Peek does not remove anything.",
    "extra": "Empty queues have no minimum. Your program must check for emptiness or handle the library’s error.",
    "refs": [
      "2-1"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "peek",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 36,
    "end": 42
  },
  {
    "id": 8,
    "week": "6",
    "title": "Repeated scans make selection sort expensive",
    "question": "Sort four values by repeatedly selecting the smallest remaining one.",
    "a": [
      "Scan each remaining group",
      "Finding the next minimum needs 3, then 2, then 1 value comparisons: six in total."
    ],
    "b": [
      "Maintain a heap",
      "Build a heap, then repeatedly remove its minimum. Each repair follows a short tree path instead of rescanning the whole group."
    ],
    "walkthrough": [
      {
        "title": "Count the comparisons precisely",
        "text": "For m remaining items, a scan needs m − 1 comparisons to choose a minimum. A single remaining item needs none."
      },
      {
        "title": "Add, do not multiply blindly",
        "text": "For n items the scan counts are (n − 1) + … + 1. Their sum is n(n − 1)/2, which grows quadratically."
      },
      {
        "title": "Change the expensive operation",
        "text": "Heap construction plus repeated heap removals gives O(n log n) sorting. Small examples may not show a practical speed gain because other overhead also matters."
      }
    ],
    "lesson": "The high-level idea can stay the same while a better data structure reduces the repeated work.",
    "check": "How many minimum-selection comparisons for five values?",
    "answer": "4 + 3 + 2 + 1 = 10. This count excludes swaps and loop-control tests.",
    "extra": "A balanced-tree implementation is tree sort. A heap implementation is heap-based sorting. They are not the same data structure.",
    "refs": [
      "2-2"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "selection",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 42,
    "end": 48
  },
  {
    "id": 9,
    "week": "6",
    "title": "Use the picture, then run the Python",
    "question": "Python’s heapq module stores a min-heap in an ordinary list.",
    "a": [
      "Add an earlier deadline",
      "Starting from [5, 9, 7], push 2. The heap becomes [2, 5, 7, 9]."
    ],
    "b": [
      "Remove it",
      "Pop returns 2. The remaining heap is [5, 9, 7], which is valid even though it is not fully sorted."
    ],
    "walkthrough": [
      {
        "title": "Build first",
        "text": "import heapq loads the module. jobs creates the list. heapify rearranges it into a heap in place; it does not return a new list."
      },
      {
        "title": "Push and inspect",
        "text": "heappush adds 2 and repairs the order. jobs[0] reads the minimum, so the first print shows Next: 2."
      },
      {
        "title": "Pop and inspect",
        "text": "heappop removes and returns the minimum. The next two prints show Removed: 2 and Remaining heap: [5, 9, 7]. Change the inserted number and run again."
      }
    ],
    "lesson": "The list is a heap representation, not a sorted result.",
    "check": "If we push 8 instead of 2, what is removed first?",
    "answer": "5. It is still the smallest deadline. Inserting a value does not mean it will be the next one removed.",
    "extra": "Python uses zero-based indices. The runnable cell starts fresh each time. The first run loads the browser Python runtime.",
    "refs": [
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-3",
    "visual": "python",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 48,
    "end": 54
  },
  {
    "id": 10,
    "week": "6",
    "title": "A heap has two rules, not full sorted order",
    "question": "Is [1, 3, 2, 5, 4] a valid min-heap?",
    "a": [
      "Shape rule",
      "Fill levels from the top, left to right. The final level may be incomplete, but it has no gaps before existing nodes."
    ],
    "b": [
      "Value rule",
      "Each parent is no larger than either of its children. Siblings do not need to be in order."
    ],
    "walkthrough": [
      {
        "title": "Read the array as levels",
        "text": "1 is the root. Its children are 3 and 2. The next two values, 5 and 4, are children of 3."
      },
      {
        "title": "Check the edges",
        "text": "1 ≤ 3, 1 ≤ 2, 3 ≤ 5 and 3 ≤ 4. Every parent-child comparison passes."
      },
      {
        "title": "Do not add a rule we do not need",
        "text": "3 appears before 2 in the array. That is allowed. A heap is not a BST: its left subtree is not required to contain smaller keys than its right subtree."
      }
    ],
    "lesson": "Complete shape plus parent-child order gives a binary heap.",
    "check": "Can [2, 2, 3] be a min-heap?",
    "answer": "Yes. Equal keys are allowed: a parent must be no larger, not strictly smaller.",
    "extra": "This lesson uses min-heaps until the ascending in-place heapsort example, which explicitly switches to a max-heap.",
    "refs": [
      "3-1"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "rules",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 54,
    "end": 60
  },
  {
    "id": 11,
    "week": "6",
    "title": "The smallest root is not enough",
    "question": "Compare [1, 3, 2, 5, 4] with [1, 5, 2, 3, 4].",
    "a": [
      "Valid heap",
      "Every parent is no larger than its children."
    ],
    "b": [
      "Invalid heap",
      "The root is still 1, but parent 5 is larger than its children 3 and 4."
    ],
    "walkthrough": [
      {
        "title": "Check each edge",
        "text": "Start with the root’s two edges, then check the lower parent-child edges. One failure is enough to reject the heap."
      },
      {
        "title": "Why the root rule follows",
        "text": "If every parent is no larger than its child, following any path downward never decreases the values. Therefore no descendant is smaller than the root."
      },
      {
        "title": "Why the reverse claim fails",
        "text": "A smallest root does not guarantee that lower edges are correct. You must check the whole parent-child rule."
      }
    ],
    "lesson": "A local rule must hold at every parent, not just at the top.",
    "check": "Is [1, 4, 2, 3] valid?",
    "answer": "No. At index 1, parent 4 is larger than its child 3 at index 3.",
    "extra": "A compact array automatically supplies the complete shape. The checker below validates its value order, not arbitrary drawings with missing positions.",
    "refs": [
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "validate",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 60,
    "end": 66
  },
  {
    "id": 12,
    "week": "6",
    "title": "An index is a location, not a value",
    "question": "Where are the children of the value at array index 1?",
    "a": [
      "Python: indices start at 0",
      "For index i, children are 2i + 1 and 2i + 2. Index 1 has children at 3 and 4."
    ],
    "b": [
      "Lecture: positions start at 1",
      "For position p, children are 2p and 2p + 1. Position 2 has children at 4 and 5."
    ],
    "walkthrough": [
      {
        "title": "Use one convention at a time",
        "text": "The same node has zero-based index 1 and one-based position 2. Its value may be 3; that value is not used to calculate its children."
      },
      {
        "title": "Go to the parent",
        "text": "In Python indexing, the parent is (i − 1) // 2 for i > 0. For index 4, 3 // 2 is 1. Integer division discards the fractional part here."
      },
      {
        "title": "Check that the child exists",
        "text": "With five values, valid indices are 0 through 4. Index 2 would have children 5 and 6, but neither is present. The root has no parent."
      }
    ],
    "lesson": "Choose the indexing convention before doing any arithmetic.",
    "check": "In a ten-item heap, what are the children of zero-based index 4?",
    "answer": "Index 9 exists. Index 10 does not. In one-based positions, this is parent 5 with only child 10.",
    "extra": "All new visual traces use zero-based indices. The preserved lecture includes one-based teaching code as well as Python heapq examples.",
    "refs": [
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "indices",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 66,
    "end": 72
  },
  {
    "id": 13,
    "week": "6",
    "title": "Why a heap path stays short",
    "question": "A complete heap has seven nodes. How many edges can one value travel upward?",
    "a": [
      "Seven nodes",
      "Three levels hold 1 + 2 + 4 nodes. The root is two edges above the bottom level."
    ],
    "b": [
      "Fifteen nodes",
      "Four levels hold 1 + 2 + 4 + 8 nodes. The root is three edges above the bottom level."
    ],
    "walkthrough": [
      {
        "title": "Count edges, not nodes",
        "text": "Height is the number of edges on the longest root-to-leaf path. A single-node heap has height 0."
      },
      {
        "title": "Each level roughly doubles capacity",
        "text": "Adding a full level lets us store about twice as many nodes while adding only one edge to a path."
      },
      {
        "title": "Read the notation in plain words",
        "text": "For a nonempty complete heap, height is floor(log₂ n). Floor means round down. For n = 10, 2³ ≤ 10 < 2⁴, so the height is 3."
      }
    ],
    "lesson": "Logarithmic height means the path grows slowly as the number of records grows.",
    "check": "What is the height for 8 nodes? For 1 node?",
    "answer": "8 nodes have height 3. One node has height 0. An empty heap needs separate handling.",
    "extra": "O(log n) describes asymptotic growth of repair work; O(log(n + 1)) also handles tiny sizes neatly. It is not an exact count of comparisons.",
    "refs": [
      "3-4",
      "0-3"
    ],
    "ref": "lecture-notes.html#topic-3-4",
    "visual": "height",
    "minutes": 6,
    "block": "Sorting and heap rules",
    "start": 72,
    "end": 78
  },
  {
    "id": 14,
    "week": "6",
    "title": "Take a ten-minute break",
    "question": "Leave the screen for a few minutes. Return ready to trace the next example.",
    "a": [
      "Before the break",
      "Choose one idea you can now explain with a picture."
    ],
    "b": [
      "After the break",
      "We will use that idea in another situation."
    ],
    "walkthrough": [],
    "lesson": "The break is part of the three-hour lesson.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for the next discussion.",
    "extra": "Times include individual practice and teacher discussion, not just reading.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 78,
    "end": 88
  },
  {
    "id": 15,
    "week": "6",
    "title": "Insert at the end, then move up",
    "question": "Add deadline 1 to the min-heap [2, 4, 3].",
    "a": [
      "Preserve the shape",
      "Append at the next array position: [2, 4, 3, 1]. Only the new parent-child path may be out of order."
    ],
    "b": [
      "Repair the order",
      "Swap 1 with parent 4, then with parent 2. Final heap: [1, 2, 3, 4]."
    ],
    "walkthrough": [
      {
        "title": "Why the end?",
        "text": "The next free array slot is the next valid position in the complete tree. Adding a node elsewhere could create a gap."
      },
      {
        "title": "Why move upward?",
        "text": "Only the new key can be smaller than its parent. Compare them; if the child is smaller, swap and continue at the parent position."
      },
      {
        "title": "When do we stop?",
        "text": "Stop at the root or when the parent is no larger. Each swap moves the new key one level toward the root."
      }
    ],
    "lesson": "Bubble up repairs one ancestor path while keeping the complete shape.",
    "check": "What if we insert 8 into [2, 4, 3]?",
    "answer": "Append 8. Parent 4 is no larger than 8, so no swaps are needed.",
    "extra": "The logarithmic bound is for heap repair. A resizable array can separately need a linear-time copy when its capacity grows.",
    "refs": [
      "4-1"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "insert",
    "minutes": 6,
    "block": "Repair and build",
    "start": 88,
    "end": 94
  },
  {
    "id": 16,
    "week": "6",
    "title": "Remove the root, then move down",
    "question": "Extract the minimum from [1, 3, 2, 7, 4].",
    "a": [
      "Fill the hole from the end",
      "Return 1. Move the final value 4 to the root and shorten the array: [4, 3, 2, 7]."
    ],
    "b": [
      "Repair downward",
      "Choose smaller child 2, swap it with 4, and finish with [2, 3, 4, 7]."
    ],
    "walkthrough": [
      {
        "title": "Why use the last value?",
        "text": "Removing the last array position preserves the complete shape. Removing an arbitrary interior position would leave a gap."
      },
      {
        "title": "Choose the smaller child",
        "text": "To restore a min-heap, the new parent must be no larger than both children. Promoting 3 here would still leave 2 below a larger root."
      },
      {
        "title": "Handle boundaries",
        "text": "Stop if the current node has no children, or if it is already no larger than its smallest child. With one item, extraction simply leaves an empty heap."
      }
    ],
    "lesson": "Bubble down assumes the child subtrees are already heaps.",
    "check": "What does extraction from [4] return, and what remains?",
    "answer": "It returns 4 and leaves []. There is no replacement value and no repair path.",
    "extra": "Extracting from an empty heap is not valid. The visual reports that case rather than inventing a minimum.",
    "refs": [
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-2",
    "visual": "extract",
    "minutes": 6,
    "block": "Repair and build",
    "start": 94,
    "end": 100
  },
  {
    "id": 17,
    "week": "6",
    "title": "Count repairs separately from array growth",
    "question": "Compare reading a root with adding and removing records.",
    "a": [
      "Peek",
      "Read one location. No repair and no record removal."
    ],
    "b": [
      "Insert or extract",
      "At most one upward or downward path. A level may require more than one comparison."
    ],
    "walkthrough": [
      {
        "title": "Know what is being counted",
        "text": "The visual counters count comparisons between stored values and swaps of two positions. They do not count loop tests, index arithmetic, or writing the appended item."
      },
      {
        "title": "A bound is not an exact count",
        "text": "For n nodes, a repair path has O(log n) levels. In bubble down, choosing the smaller child can add a comparison before comparing it with the parent."
      },
      {
        "title": "Account for storage",
        "text": "Preallocated capacity avoids a growth copy. With a dynamically growing array, distinguish heap repair from occasional allocation and copying."
      }
    ],
    "lesson": "Peek is O(1); heap repair for insert and extract is O(log n) in the worst case.",
    "check": "Can insertion use zero swaps?",
    "answer": "Yes. Append a key that is no smaller than its parent. We still test the parent-child order when a parent exists.",
    "extra": "A max-heap reverses the comparison rule. The same path-length reasoning applies.",
    "refs": [
      "4-3"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "cost",
    "minutes": 6,
    "block": "Repair and build",
    "start": 100,
    "end": 106
  },
  {
    "id": 18,
    "week": "6",
    "title": "Building by repeated insertion can repeat work",
    "question": "Insert 7, 6, 5, 4, 3, 2, 1 into an initially empty min-heap.",
    "a": [
      "Descending arrival",
      "Each new value is the smallest so far. It climbs from its new leaf to the root."
    ],
    "b": [
      "A more favorable arrival",
      "Insert 1, 2, 3, 4, 5, 6, 7. Every new value can stay where it is appended."
    ],
    "walkthrough": [
      {
        "title": "Watch the new value",
        "text": "With descending input, each insertion repeats comparisons along an ancestor path. Many later insertions begin near the bottom."
      },
      {
        "title": "Add the path lengths",
        "text": "For seven descending values, the upward swaps are 0 + 1 + 1 + 2 + 2 + 2 + 2 = 10."
      },
      {
        "title": "Distinguish cases",
        "text": "Repeated insertion takes Θ(n log n) in the worst case. Favorable input can use much less work. This does not change the worst-case bound."
      }
    ],
    "lesson": "When all values are already available, we can build a heap more efficiently.",
    "check": "How many swaps for inserting 1 through 7 in increasing order?",
    "answer": "Zero. Every appended value is already no smaller than its parent.",
    "extra": "This compares heap-order repair only. The input lists have the same keys; their arrival orders differ.",
    "refs": [
      "5-1"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "repeated",
    "minutes": 6,
    "block": "Repair and build",
    "start": 106,
    "end": 112
  },
  {
    "id": 19,
    "week": "6",
    "title": "Build from the lowest parents upward",
    "question": "Turn [9, 4, 7, 1, 3, 8, 2] into a min-heap.",
    "a": [
      "Do not start by fixing only the root",
      "Lower subtrees may still be wrong. A root repair assumes those subtrees are already heaps."
    ],
    "b": [
      "Fix parents in reverse order",
      "Using zero-based indices, repair 2, then 1, then 0. The leaves need no repair."
    ],
    "walkthrough": [
      {
        "title": "Find the last parent",
        "text": "For n = 7, floor(n/2) − 1 = 2. Indices 3 through 6 are leaves and already form one-node heaps."
      },
      {
        "title": "Repair from the bottom",
        "text": "At index 2, swap 7 and 2. At index 1, swap 4 and 1. Now both child subtrees of the root are heaps."
      },
      {
        "title": "Repair the root last",
        "text": "Move 9 down by swapping first with 1, then with 3. The result is [1, 3, 2, 4, 9, 8, 7]. It is a heap, not a sorted array."
      }
    ],
    "lesson": "Before repairing a parent, make sure its children already root valid heaps.",
    "check": "Which one-based positions match zero-based 2, 1, 0?",
    "answer": "Positions 3, 2, 1. The lecture and this visual perform the same repairs with different labels.",
    "extra": "Ties are resolved by choosing the left child in these visual traces. Other valid implementations may produce another valid heap shape.",
    "refs": [
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "heapify",
    "minutes": 6,
    "block": "Repair and build",
    "start": 112,
    "end": 118
  },
  {
    "id": 20,
    "week": "6",
    "title": "Most nodes have almost nowhere to go",
    "question": "Why is bottom-up heap construction linear rather than n log n?",
    "a": [
      "An overestimate",
      "Charge every node the maximum tree height. That treats leaves as if they could travel all the way down."
    ],
    "b": [
      "Count the available downward distances",
      "For a perfect 15-node tree: 8 leaves × 0, 4 parents × 1, 2 nodes × 2, 1 root × 3 = 11 possible downward moves."
    ],
    "walkthrough": [
      {
        "title": "Many cheap nodes",
        "text": "Over half the nodes of a large complete binary tree are at or near the bottom. Leaves need no downward repair."
      },
      {
        "title": "Few expensive nodes",
        "text": "Only a few nodes can move several levels. At most one root can use the entire height."
      },
      {
        "title": "Add these unequal costs",
        "text": "Summing the available downward distances gives O(n). Processing the array also requires linear work, so bottom-up construction is Θ(n)."
      }
    ],
    "lesson": "Many short repairs can be cheaper than giving every item one long repair.",
    "check": "Does the 15-node example always perform 11 swaps?",
    "answer": "No. Eleven is a sum of maximum possible downward distances. The actual values determine whether those moves are needed.",
    "extra": "The displayed 11 is a move-capacity bound, not an exact comparison count. Constant work per examined level still gives linear total time.",
    "refs": [
      "5-3",
      "0-3"
    ],
    "ref": "lecture-notes.html#topic-5-3",
    "visual": "linear",
    "minutes": 6,
    "block": "Repair and build",
    "start": 118,
    "end": 124
  },
  {
    "id": 21,
    "week": "6",
    "title": "Take a ten-minute break",
    "question": "Leave the screen for a few minutes. Return ready to trace the next example.",
    "a": [
      "Before the break",
      "Choose one idea you can now explain with a picture."
    ],
    "b": [
      "After the break",
      "We will use that idea in another situation."
    ],
    "walkthrough": [],
    "lesson": "The break is part of the three-hour lesson.",
    "check": "What is still unclear?",
    "answer": "Keep that question ready for the next discussion.",
    "extra": "Times include individual practice and teacher discussion, not just reading.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 124,
    "end": 134
  },
  {
    "id": 22,
    "week": "6",
    "title": "Ascending heapsort uses a max-heap",
    "question": "Sort [4, 1, 3, 2] in place from smallest to largest.",
    "a": [
      "Build a max-heap",
      "Parents are no smaller than their children. [4, 2, 3, 1] puts the largest value at the root."
    ],
    "b": [
      "Place the largest at the right",
      "Swap root 4 with the last active value. Keep 4 in the sorted suffix; repair only the smaller active heap."
    ],
    "walkthrough": [
      {
        "title": "Change the rule explicitly",
        "text": "We used min-heaps to get the next smallest value. In-place ascending heapsort uses a max-heap so that the next largest value can go at the right end."
      },
      {
        "title": "Shrink the active region",
        "text": "The sorted suffix is outside the heap. Its values must not participate in later repairs."
      },
      {
        "title": "Repeat until done",
        "text": "Place 4, then 3, then 2. The final array is [1, 2, 3, 4]. Bottom-up building is O(n); all removals together are O(n log n)."
      }
    ],
    "lesson": "The active heap shrinks while the sorted suffix grows.",
    "check": "Does an already sorted suffix still need heap repairs?",
    "answer": "No. Those items are in their final positions and are excluded from the active heap.",
    "extra": "Iterative in-place heapsort uses O(1) extra working space and is not generally stable. The visualization stores snapshots for teaching; its extra storage is not the algorithm’s space bound.",
    "refs": [
      "5-4"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "heapsort",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 134,
    "end": 140
  },
  {
    "id": 23,
    "week": "6",
    "title": "Stop when you have the answer you need",
    "question": "Find the third smallest occurrence in [9, 4, 7, 1, 3, 8, 2].",
    "a": [
      "Sort all values",
      "1, 2, 3, 4, 7, 8, 9. The third value is 3."
    ],
    "b": [
      "Extract only three minima",
      "Build a min-heap, then remove 1, 2 and 3. Stop without fully sorting the rest."
    ],
    "walkthrough": [
      {
        "title": "Build once",
        "text": "Bottom-up heap construction costs O(n). You do not need to sort the original array first."
      },
      {
        "title": "Count extractions",
        "text": "The first extraction gives the smallest occurrence. After k extractions, the kth result is the kth smallest occurrence."
      },
      {
        "title": "Check the request",
        "text": "Require 1 ≤ k ≤ n. Repeated values count separately: in [1, 1, 4], the second smallest occurrence is 1."
      }
    ],
    "lesson": "This method costs O(n + k log n) and changes the heap as it works.",
    "check": "For [2, 2, 5, 8], what is the second smallest?",
    "answer": "2. This question counts occurrences, not distinct values.",
    "extra": "If the original input must stay unchanged, build the heap from a copy. This is one selection method, not a claim that it is always optimal.",
    "refs": [
      "5-5"
    ],
    "ref": "lecture-notes.html#topic-5-5",
    "visual": "kth",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 140,
    "end": 146
  },
  {
    "id": 24,
    "week": "6",
    "title": "The next timer is not always the next clock tick",
    "question": "Timers A, B and C first expire at 5, 9 and 7 ms. Their periods are 5, 9 and 7 ms.",
    "a": [
      "First event",
      "A fires at 5 ms. Its next due time is 10 ms. Put the new record back into the queue."
    ],
    "b": [
      "Next event",
      "C fires at 7 ms, before A’s new 10 ms deadline. C is then scheduled for 14 ms."
    ],
    "walkthrough": [
      {
        "title": "Use due time as the key",
        "text": "A min-priority queue chooses the earliest pending event. This visual jumps to that event time; it does not simulate every hardware clock tick."
      },
      {
        "title": "Reschedule deliberately",
        "text": "Here next due time = previous scheduled due time + period. For example, A goes from 5 to 10 to 15. Real systems also need a policy for late callbacks."
      },
      {
        "title": "Make ties predictable",
        "text": "The demo orders records by (due time, enqueue sequence). If several timers are due together, one event step handles only one of them."
      }
    ],
    "lesson": "Extract one event, handle it, and reinsert its next occurrence.",
    "check": "If two timers expire during one real clock tick, is one extraction enough?",
    "answer": "No. Process both due events. For r events, heap work is O(r log n), plus the callback work.",
    "extra": "A heap alone does not guarantee real-time deadlines. Memory allocation, callbacks, interrupts and the actual hardware all matter.",
    "refs": [
      "6"
    ],
    "ref": "lecture-notes.html#topic-6",
    "visual": "timers",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 146,
    "end": 152
  },
  {
    "id": 25,
    "week": "6",
    "title": "An invariant is a promise we keep",
    "question": "How can we trust a heap repair without testing every possible input?",
    "a": [
      "Before each downward repair step",
      "Both child subtrees are already heaps. Only the current parent can be too large."
    ],
    "b": [
      "After the swap",
      "The promoted smaller child is correctly placed. Any remaining problem follows the displaced value one level down."
    ],
    "walkthrough": [
      {
        "title": "State what stays true",
        "text": "A useful invariant says which part is already correct and where an error may still remain. It is more precise than saying “the code seems to work.”"
      },
      {
        "title": "Check progress",
        "text": "Every swap moves the possible problem down one level. A finite heap has only finitely many levels."
      },
      {
        "title": "Check the stopping condition",
        "text": "At a leaf there is no child edge to violate. If the parent is already no larger than its children, the remaining local problem has gone."
      }
    ],
    "lesson": "Correctness needs both a preserved rule and a reason the process ends.",
    "check": "Can this repair rule safely fix an arbitrary array just by starting at the root once?",
    "answer": "No. Its child-subtree assumption might be false. Bottom-up heapify establishes that assumption before each repair.",
    "extra": "Insertion has a similar argument: only the new value’s ancestor path needs attention. The complete shape is preserved throughout both repairs.",
    "refs": [
      "0-3",
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-0-3",
    "visual": "invariant",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 152,
    "end": 158
  },
  {
    "id": 26,
    "week": "6",
    "title": "Choose the structure for the repeated question",
    "question": "A system receives changing deadlines. Another needs records between two times.",
    "a": [
      "Repeated earliest deadline",
      "A min-heap gives constant-time peek and logarithmic repair after insert or extract."
    ],
    "b": [
      "Time range or next key after x",
      "A balanced search tree preserves the order needed for these queries. A heap does not offer the same navigation."
    ],
    "walkthrough": [
      {
        "title": "Do not confuse heap order with sorted order",
        "text": "The root is a minimum, but siblings and separate branches are not sorted relative to one another."
      },
      {
        "title": "Include the workload",
        "text": "For a tiny fixed list, a scan may be simplest. For changing priorities, record lookup and key updates may require extra indexing support."
      },
      {
        "title": "Separate mathematics from timing",
        "text": "A height bound limits levels of repair. It does not say that each level takes one machine instruction or a fixed number of microseconds."
      }
    ],
    "lesson": "A heap is powerful for the job it is designed to do.",
    "check": "Can binary search directly search the underlying heap array?",
    "answer": "No. The heap array need not be sorted. The condition required for binary search is missing.",
    "extra": "Deleting or updating a known heap index can be repaired in O(log n). Finding the item’s index may still require O(n) without an auxiliary map.",
    "refs": [
      "0-1",
      "0-2",
      "6"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "choice",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 158,
    "end": 164
  },
  {
    "id": 27,
    "week": "6",
    "title": "Small counterexamples catch big misunderstandings",
    "question": "Test the claims “a heap is sorted” and “the root being smallest is enough.”",
    "a": [
      "Valid but not sorted",
      "[1, 3, 2] is a valid min-heap, although its array order is not increasing."
    ],
    "b": [
      "Smallest root but invalid",
      "[1, 5, 2, 3] has the smallest value at its root but violates the 5 → 3 edge."
    ],
    "walkthrough": [
      {
        "title": "One counterexample is enough",
        "text": "A universal claim says every case works. One valid exception disproves it."
      },
      {
        "title": "Trace the actual rule",
        "text": "For each non-root item, compare it with its parent. For a compact array, that is enough to check min-heap order."
      },
      {
        "title": "Try a new case",
        "text": "Use the editable checker. Change one value at a time and predict which edge will pass or fail before advancing the trace."
      }
    ],
    "lesson": "Draw a small case before trusting a sentence about an algorithm.",
    "check": "Does [3, 3, 3, 3] pass? Why?",
    "answer": "Yes. The shape is complete, and every parent equals its child. Equality is allowed.",
    "extra": "A valid heap is not necessarily the exact heap produced by one specified sequence of swaps. Procedure-tracing questions require that exact sequence.",
    "refs": [
      "3-2",
      "7-1"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "counterexample",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 164,
    "end": 170
  },
  {
    "id": 28,
    "week": "6",
    "title": "Build it, repair it, explain it",
    "question": "Use the final ten minutes to draw the states and check your reasoning.",
    "a": [
      "Insertion challenge",
      "Add 0 to [1, 3, 2, 7, 4]. Show every upward swap."
    ],
    "b": [
      "Extraction challenge",
      "From a fresh [1, 3, 2, 7, 4], remove the minimum. Show the replacement and downward swap."
    ],
    "walkthrough": [
      {
        "title": "Insertion answer",
        "text": "Append 0 at index 5. Its parent is index 2 with value 2: swap. Then its parent is root 1: swap. Final heap: [0, 3, 1, 7, 4, 2]."
      },
      {
        "title": "Extraction answer",
        "text": "Return 1. Move last value 4 to the root: [4, 3, 2, 7]. Swap with smaller child 2. Final heap: [2, 3, 4, 7]."
      },
      {
        "title": "Explain the cost",
        "text": "Peek reads one location. One repair follows a logarithmic path. Bottom-up construction is linear because most nodes have short downward paths. Sorting by repeated extraction costs O(n log n)."
      }
    ],
    "lesson": "Name the rule, trace the path, and say exactly what you count.",
    "check": "Does linear-time heap construction mean that heapsort is linear-time?",
    "answer": "No. Building is only the first stage. Repeated extractions add O(n log n) worst-case work.",
    "extra": "All original Week 6 topics are linked from these examples. The preserved notes contain the longer exercises and additional runnable code.",
    "refs": [
      "7-1",
      "7-2",
      "8"
    ],
    "ref": "lecture-notes.html#topic-7-1",
    "visual": "final",
    "minutes": 10,
    "block": "Applications and practice",
    "start": 170,
    "end": 180
  }
];
