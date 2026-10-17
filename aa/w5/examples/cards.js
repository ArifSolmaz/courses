/* Week 5: a guided 180-minute lesson. */
const cards = [
  {
    "id": 1,
    "week": "5",
    "title": "Look at every box, or skip half?",
    "question": "A sorted row has seven sensor IDs. Find ID 60.",
    "a": [
      "One by one",
      "Check 10, 20, 30, 40, 50, then 60: six checks."
    ],
    "b": [
      "Use the order",
      "Check the middle, 40. Then check the middle of the right half, 60: two checks."
    ],
    "walkthrough": [
      {
        "title": "What is a check?",
        "text": "Read one ID and compare it with 60. We count visited IDs, not seconds."
      },
      {
        "title": "Why can we skip?",
        "text": "All IDs to the left of 40 are smaller than 40. None can be 60. The row must already be sorted."
      },
      {
        "title": "What does log mean here?",
        "text": "Repeatedly cutting the possible area in half gives logarithmic growth. For this seven-item row, any successful search needs at most three checks."
      }
    ],
    "lesson": "Use information about order to avoid unnecessary checks.",
    "check": "Find 10 using the middle-first method.",
    "answer": "Check 40, then 20, then 10: three checks.",
    "extra": "Binary search needs sorted data and efficient access to the middle. It is not the same as walking through a linked list.",
    "refs": [
      "0-1",
      "warmup"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "binary",
    "minutes": 6,
    "block": "Search trees",
    "start": 0,
    "end": 6
  },
  {
    "id": 2,
    "week": "5",
    "title": "An ID is a key. A reading is a value.",
    "question": "How do we store the latest reading for sensor 30?",
    "a": [
      "Find an exact ID",
      "30 → 21°C. Search uses the ID to find the reading."
    ],
    "b": [
      "Ask an ordered question",
      "Which ID is next after 30? This asks about key order, not temperature."
    ],
    "walkthrough": [
      {
        "title": "Separate key and value",
        "text": "The key identifies the record. The value contains its information. Here keys are unique sensor IDs."
      },
      {
        "title": "Three basic changes",
        "text": "Search finds a record. Insert adds a new key. Delete removes a key. Updating an existing reading changes its value."
      },
      {
        "title": "Four ordered questions",
        "text": "Minimum finds the smallest key; maximum finds the largest. Predecessor finds the next smaller key; successor finds the next larger key."
      }
    ],
    "lesson": "A dictionary describes the operations we need. A tree or a hash table is a way to build it.",
    "check": "IDs are 20, 30 and 50. What is the successor of 30?",
    "answer": "50. Successor means the next stored key, not the number 31.",
    "extra": "The seven lecture operations are search, insert, delete, minimum, maximum, predecessor and successor. Duplicate-key rules must be chosen explicitly.",
    "refs": [
      "1-1"
    ],
    "ref": "lecture-notes.html#topic-1-1",
    "visual": "dictionary",
    "minutes": 6,
    "block": "Search trees",
    "start": 6,
    "end": 12
  },
  {
    "id": 3,
    "week": "5",
    "title": "Fast search can make insertion harder",
    "question": "Insert 25 into records with keys 10, 20, 30, 40.",
    "a": [
      "Unsorted linked list",
      "With a head pointer, add 25 at the front quickly. Finding an arbitrary ID may require walking through every node."
    ],
    "b": [
      "Sorted array",
      "Find keys with binary search. To insert 25, move 30 and 40 one place right."
    ],
    "walkthrough": [
      {
        "title": "Count what changes",
        "text": "In the list, create a node and change links at the head. In the array, preserve the sorted order by shifting items."
      },
      {
        "title": "Separate finding from editing",
        "text": "A linked-list change can be constant-time when the required node and links are already known. Finding that position may still take a full walk."
      },
      {
        "title": "Ask about the workload",
        "text": "A fixed sorted array can be a good choice for frequent searches. Many insertions and deletions may make shifts expensive."
      }
    ],
    "lesson": "Choose by the operations you repeat, not by one attractive speed claim.",
    "check": "Where would 5 go in the sorted array?",
    "answer": "At the front. All four existing items must move one position right.",
    "extra": "The array has enough space here. Growing its storage may add copying. A singly linked list may need the predecessor to delete a known node.",
    "refs": [
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-1-2",
    "visual": "array",
    "minutes": 6,
    "block": "Search trees",
    "start": 12,
    "end": 18
  },
  {
    "id": 4,
    "week": "5",
    "title": "A tree is a set of smaller-or-larger decisions",
    "question": "Start at 50. Which side can contain 40?",
    "a": [
      "Left of 50",
      "All keys in the left subtree are smaller than 50. Here: 20, 30, 40."
    ],
    "b": [
      "Right of 50",
      "All keys in the right subtree are larger than 50. Here: 60, 70, 80."
    ],
    "walkthrough": [
      {
        "title": "Read the picture",
        "text": "The top node is the root. A link leads to a child. A subtree is one node and everything below it."
      },
      {
        "title": "Apply the rule everywhere",
        "text": "At node 30, 20 goes left and 40 goes right. Both are still inside the left subtree of 50."
      },
      {
        "title": "Notice the difference",
        "text": "Any binary tree has at most two children per node. A binary search tree, or BST, also obeys this key-order rule."
      }
    ],
    "lesson": "The rule covers the whole subtree, not just the immediate children.",
    "check": "Could 55 be placed as the right child of 30?",
    "answer": "No. It is larger than 30, but it would be in the left subtree of 50, where every key must be below 50.",
    "extra": "These examples use distinct keys. The same rule must hold after every insertion and deletion.",
    "refs": [
      "1-3"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "bst",
    "minutes": 6,
    "block": "Search trees",
    "start": 18,
    "end": 24
  },
  {
    "id": 5,
    "week": "5",
    "title": "Follow one path, not every branch",
    "question": "Search for 60, then try an ID that is not present.",
    "a": [
      "Find 60",
      "50 → 70 → 60. Three visited nodes."
    ],
    "b": [
      "Try 65",
      "50 → 70 → 60 → empty right link. Three visited nodes, then a missing link."
    ],
    "walkthrough": [
      {
        "title": "Start at the root",
        "text": "60 is larger than 50, so move right. We do not search the left subtree."
      },
      {
        "title": "Change direction when needed",
        "text": "60 is smaller than 70, so move left. At 60, the key matches and the search stops."
      },
      {
        "title": "Understand a failed search",
        "text": "For 65, move right from 60. There is no child. The ordering rule tells us that no other location could contain 65."
      }
    ],
    "lesson": "A BST search follows one root-to-node path.",
    "check": "Find 20. Which nodes are checked?",
    "answer": "50, 30, 20. It does not check 40, 60, 70 or 80.",
    "extra": "We count visits to existing nodes. Tests of empty pointers are not included in the displayed count.",
    "refs": [
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-4",
    "visual": "search",
    "minutes": 6,
    "block": "Search trees",
    "start": 24,
    "end": 30
  },
  {
    "id": 6,
    "week": "5",
    "title": "Smallest: keep going left",
    "question": "Find the smallest and largest sensor IDs.",
    "a": [
      "Minimum",
      "50 → 30 → 20. Stop when there is no left child."
    ],
    "b": [
      "Maximum",
      "50 → 70 → 80. Stop when there is no right child."
    ],
    "walkthrough": [
      {
        "title": "Why left works",
        "text": "A left child has a smaller key. Every right subtree contains larger keys, so it cannot improve the minimum."
      },
      {
        "title": "Know when to stop",
        "text": "At 20 there is no left child. No smaller key remains below it, and all ancestors on this path are larger."
      },
      {
        "title": "Reverse the idea",
        "text": "To find the maximum, always choose the right child. In an empty tree there is no minimum or maximum."
      }
    ],
    "lesson": "Minimum and maximum use the order already stored in the tree.",
    "check": "What is the minimum of the subtree rooted at 70?",
    "answer": "60. Start at 70 and move left once.",
    "extra": "A minimum query can still take many steps in a tall tree. It is not automatically constant-time.",
    "refs": [
      "1-5"
    ],
    "ref": "lecture-notes.html#topic-1-5",
    "visual": "minmax",
    "minutes": 6,
    "block": "Search trees",
    "start": 30,
    "end": 36
  },
  {
    "id": 7,
    "week": "5",
    "title": "Insert by searching for an empty place",
    "question": "Build a tree from 50, 30, 70, 20, 40, 60, 80.",
    "a": [
      "Insert 40",
      "40 < 50, then 40 > 30. Attach it to the empty right link of 30."
    ],
    "b": [
      "Insert 65 later",
      "65 > 50, 65 < 70, 65 > 60. Attach it as the right child of 60."
    ],
    "walkthrough": [
      {
        "title": "First key starts the tree",
        "text": "An empty tree has no root. The first key, 50, becomes its root."
      },
      {
        "title": "Each new key follows comparisons",
        "text": "An insertion follows the same path as an unsuccessful search for that key. The first empty link becomes its position."
      },
      {
        "title": "Keep the rule true",
        "text": "We attach one new leaf. Existing keys stay in their relative positions. Inserting the same set in another order can produce another shape."
      }
    ],
    "lesson": "The insertion order affects the shape and therefore later search time.",
    "check": "Where would 25 be added?",
    "answer": "To the right of 20: follow 50 → 30 → 20, then the empty right link.",
    "extra": "If a key already exists, this dictionary updates its value instead of adding another node. Other applications may use a different duplicate policy.",
    "refs": [
      "1-6",
      "example-1"
    ],
    "ref": "lecture-notes.html#topic-1-6",
    "visual": "insert",
    "minutes": 6,
    "block": "Search trees",
    "start": 36,
    "end": 42
  },
  {
    "id": 8,
    "week": "5",
    "title": "Read the tree in sorted order",
    "question": "Can we list all IDs from smallest to largest?",
    "a": [
      "Follow the links as drawn",
      "The root, 50, appears at the top. Reading top-to-bottom does not give sorted order."
    ],
    "b": [
      "Use in-order traversal",
      "Visit left subtree, then the node, then right subtree: 20, 30, 40, 50, 60, 70, 80."
    ],
    "walkthrough": [
      {
        "title": "Finish the left part first",
        "text": "Start at 50 but do not output it yet. Its left subtree contains smaller keys. Within that subtree, output 20 before 30 and 40."
      },
      {
        "title": "Then output the root",
        "text": "Once all smaller keys have been output, output 50."
      },
      {
        "title": "Finish the right part",
        "text": "Apply the same rule to the right subtree: 60, 70, 80. Each node is output once, so listing all n keys takes work proportional to n."
      }
    ],
    "lesson": "The tree shape guides the walk; the BST rule makes the output sorted.",
    "check": "If the tree is a chain, is in-order output still sorted?",
    "answer": "Yes. The order rule still holds. The walk still visits every node, but recursion may need much more stack space.",
    "extra": "Traversal takes Θ(n) time for n nodes. Θ means the growth is bounded both above and below by constant multiples of n.",
    "refs": [
      "2-1"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "inorder",
    "minutes": 6,
    "block": "Search trees",
    "start": 42,
    "end": 48
  },
  {
    "id": 9,
    "week": "5",
    "title": "Next means next stored key",
    "question": "What comes just after 50? What comes just after 40?",
    "a": [
      "50 has a right subtree",
      "Its successor is the smallest key in that subtree: 60."
    ],
    "b": [
      "40 has no right subtree",
      "Move up. 30 is smaller than 40. The first larger ancestor is 50."
    ],
    "walkthrough": [
      {
        "title": "Use the right subtree if it exists",
        "text": "All its keys are larger than the current key. Its minimum is the closest larger stored key."
      },
      {
        "title": "Otherwise look at ancestors",
        "text": "Move up until you come from an ancestor’s left side. That ancestor is the next larger key. Parent links or a saved search path help us move up."
      },
      {
        "title": "Reverse for predecessor",
        "text": "For the next smaller key, use the maximum of the left subtree, or move up to the first smaller ancestor."
      }
    ],
    "lesson": "Successor and predecessor are about order, even when IDs have gaps.",
    "check": "What is the successor of 80? The predecessor of 60?",
    "answer": "80 has no successor in this tree. The predecessor of 60 is 50.",
    "extra": "Searching for the starting node may add work if only its key is known. Each path operation is bounded by the tree height plus one.",
    "refs": [
      "2-2",
      "example-2"
    ],
    "ref": "lecture-notes.html#topic-2-2",
    "visual": "successor",
    "minutes": 6,
    "block": "Search trees",
    "start": 48,
    "end": 54
  },
  {
    "id": 10,
    "week": "5",
    "title": "Remove a leaf, or reconnect one child",
    "question": "How do we delete a node without losing the keys below it?",
    "a": [
      "No children",
      "Delete leaf 20. Set the left link of 30 to empty."
    ],
    "b": [
      "One child",
      "In a separate small tree, 30 has only child 40. Delete 30 by connecting its parent 50 directly to 40."
    ],
    "walkthrough": [
      {
        "title": "Find the node first",
        "text": "Follow the normal search path. Finding the node can take longer than changing its links."
      },
      {
        "title": "A leaf has nothing to preserve below it",
        "text": "Its parent’s link becomes empty. No other key needs to move."
      },
      {
        "title": "One child must stay connected",
        "text": "Connect the parent to that child. All keys in the child’s subtree already satisfy the old node’s ancestor constraints."
      }
    ],
    "lesson": "Deletion changes links while preserving both records and the BST rule.",
    "check": "If the root has only one child, what becomes the new root?",
    "answer": "Its child. The whole child subtree stays attached.",
    "extra": "The two pictures are separate starting trees. They are not two consecutive deletions from one tree.",
    "refs": [
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-3",
    "visual": "deleteSimple",
    "minutes": 6,
    "block": "Search trees",
    "start": 54,
    "end": 60
  },
  {
    "id": 11,
    "week": "5",
    "title": "Two children: use the next key",
    "question": "Delete 50 from the seven-key tree.",
    "a": [
      "Do not drop either branch",
      "Both the 30-subtree and the 70-subtree contain records we must keep."
    ],
    "b": [
      "Replace with successor 60",
      "Copy the complete record for 60 into the root position. Then remove the old 60 node."
    ],
    "walkthrough": [
      {
        "title": "Choose a safe replacement",
        "text": "60 is the smallest key in the right subtree. It is larger than every left-subtree key and smaller than the remaining right-subtree keys."
      },
      {
        "title": "Move the record, not just the label",
        "text": "The value belongs with its key. If the implementation copies records, it must copy both the key and its value."
      },
      {
        "title": "Remove the old successor",
        "text": "The successor has no left child. Removing it reduces to the zero-child or one-child case. Here it is a leaf."
      }
    ],
    "lesson": "A two-child deletion can be reduced to an easier deletion.",
    "check": "Could we use 40 instead of 60?",
    "answer": "Yes. 40 is the predecessor, the largest key in the left subtree. Remove its old node after moving its complete record.",
    "extra": "The displayed intermediate replacement is part of one deletion operation, not a finished tree with two permanent copies. The lecture also traces deletion in a deeper tree.",
    "refs": [
      "2-3",
      "example-3"
    ],
    "ref": "lecture-notes.html#topic-2-3",
    "visual": "deleteTwo",
    "minutes": 6,
    "block": "Search trees",
    "start": 60,
    "end": 66
  },
  {
    "id": 12,
    "week": "5",
    "title": "The same keys can make a much slower tree",
    "question": "Find 80 in two trees with exactly the same seven keys.",
    "a": [
      "Short tree",
      "Insertion order 50, 30, 70, 20, 40, 60, 80 gives a three-level tree. Find 80 in three checks."
    ],
    "b": [
      "Chain",
      "Insertion order 20, 30, 40, 50, 60, 70, 80 gives seven levels. Find 80 in seven checks."
    ],
    "walkthrough": [
      {
        "title": "Define height carefully",
        "text": "We count edges on the longest downward path from the root. The short tree has height 2. The chain has height 6."
      },
      {
        "title": "Connect height to work",
        "text": "A search visits at most h + 1 nodes when height is h. O(h + 1) says that path work has an upper bound proportional to this quantity."
      },
      {
        "title": "Read log without fear",
        "text": "A perfect tree has 1, then 2, then 4 nodes on its levels. Seven nodes fit in three levels. More balanced levels let the number of stored nodes grow quickly without a long path."
      }
    ],
    "lesson": "A BST is fast only when its paths stay short.",
    "check": "How many nodes fit in four full levels?",
    "answer": "1 + 2 + 4 + 8 = 15 nodes. The height is 3 edges.",
    "extra": "For a perfect tree, n = 2^(h + 1) − 1. A general BST need not be perfect or balanced.",
    "refs": [
      "3-1",
      "3-2",
      "3-5"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "height",
    "minutes": 6,
    "block": "Search trees",
    "start": 66,
    "end": 72
  },
  {
    "id": 13,
    "week": "5",
    "title": "Random order helps. Balance gives a guarantee.",
    "question": "What if IDs arrive already sorted?",
    "a": [
      "Ordinary BST",
      "Sorted insertion makes a chain. A random permutation gives expected logarithmic search cost, but can still give a bad shape."
    ],
    "b": [
      "Balanced BST",
      "AVL or red-black trees maintain a height bound as keys change. Basic search, insert and delete have O(log n) worst-case bounds."
    ],
    "walkthrough": [
      {
        "title": "Separate chance from a guarantee",
        "text": "Expected describes an average under stated randomness. It does not promise that every insertion order is good."
      },
      {
        "title": "Balance is maintained deliberately",
        "text": "Balanced trees rearrange local links when needed. The key order stays the same. We do not need rotation rules for this introduction."
      },
      {
        "title": "Use the tree to sort",
        "text": "Insert n distinct keys into a balanced tree, then read them in order. Building takes O(n log n); traversal takes Θ(n). Overall: O(n log n)."
      }
    ],
    "lesson": "An ordinary BST and a balanced BST do not offer the same worst-case promise.",
    "check": "How slow can sorting via an ordinary BST be with sorted input?",
    "answer": "The insertion paths grow: 0 + 1 + … + (n − 1) comparisons, giving Θ(n²) building time. Traversal is still Θ(n).",
    "extra": "Expected bounds for random insertion assume a uniformly random permutation of distinct keys. To sort repeated keys, preserve multiplicities rather than silently updating records.",
    "refs": [
      "3-3",
      "3-4",
      "3-6"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "balance",
    "minutes": 6,
    "block": "Search trees",
    "start": 72,
    "end": 78
  },
  {
    "id": 14,
    "week": "5",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen. Come back ready to explain an example.",
    "a": [
      "Before the break",
      "Think of one idea you can now explain."
    ],
    "b": [
      "After the break",
      "We will use the idea in a different situation."
    ],
    "walkthrough": [],
    "lesson": "A short pause is part of the lesson.",
    "check": "What is one question you still have?",
    "answer": "Keep it ready for the next discussion.",
    "extra": "The lesson times include individual practice and teacher discussion.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 78,
    "end": 88
  },
  {
    "id": 15,
    "week": "5",
    "title": "Use a key to calculate a starting slot",
    "question": "A hash table has five slots, numbered 0 to 4.",
    "a": [
      "Key 13",
      "13 divided by 5 leaves remainder 3. Start at slot 3."
    ],
    "b": [
      "Key 8",
      "8 divided by 5 also leaves remainder 3. Two keys want the same slot."
    ],
    "walkthrough": [
      {
        "title": "Understand mod",
        "text": "k mod 5 means the remainder after dividing k by 5. The result is one of 0, 1, 2, 3, 4."
      },
      {
        "title": "A slot is not the key",
        "text": "The table stores the original key and its value. The slot only tells us where to start looking."
      },
      {
        "title": "Expect collisions",
        "text": "Different keys can give the same slot. This is called a collision. It does not mean the keys are equal, and it is not an error by itself."
      }
    ],
    "lesson": "A hash function chooses a starting location. Collision handling finishes the job.",
    "check": "Where do 10 and 15 start?",
    "answer": "Both start at slot 0, because each is a multiple of 5.",
    "extra": "This simple remainder function is for learning. It can distribute patterned real data badly. We use nonnegative integer keys.",
    "refs": [
      "4-1",
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "hash",
    "minutes": 6,
    "block": "Hash tables",
    "start": 88,
    "end": 94
  },
  {
    "id": 16,
    "week": "5",
    "title": "Collision option 1: keep a small chain",
    "question": "Insert 10, 15, 3, 20, 8, 13 using five buckets.",
    "a": [
      "Bucket 0",
      "10 → 15 → 20. These keys all leave remainder 0."
    ],
    "b": [
      "Bucket 3",
      "3 → 8 → 13. These keys all leave remainder 3."
    ],
    "walkthrough": [
      {
        "title": "Compute the bucket",
        "text": "Each key goes to the bucket given by its remainder. Each bucket holds a list of records."
      },
      {
        "title": "Search inside that bucket",
        "text": "To find 20, look in bucket 0 and compare with 10, 15, then 20. Other buckets do not need searching."
      },
      {
        "title": "A long chain costs more",
        "text": "If all keys land in one bucket, searching that chain may examine every record. Having many buckets alone does not ensure even distribution."
      }
    ],
    "lesson": "Chaining stores several records behind one bucket.",
    "check": "How many key checks find 13 in the drawn chain?",
    "answer": "Three: 3, 8, 13. The diagram appends keys to each chain in insertion order.",
    "extra": "An implementation that inserts at the head can produce a different chain order and a different count. Both orders are valid.",
    "refs": [
      "4-3",
      "example-4"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "chain",
    "minutes": 6,
    "block": "Hash tables",
    "start": 94,
    "end": 100
  },
  {
    "id": 17,
    "week": "5",
    "title": "Collision option 2: try the next slot",
    "question": "Insert 10, 15, 3, 20 into a five-slot table.",
    "a": [
      "10 and 15",
      "10 takes slot 0. For 15, slot 0 is occupied, so try slot 1."
    ],
    "b": [
      "3 and 20",
      "3 takes slot 3. For 20, slots 0 and 1 are occupied, so use slot 2."
    ],
    "walkthrough": [
      {
        "title": "Start at the hash location",
        "text": "Linear probing tries h(k), then h(k)+1, and so on. At the end, wrap back to slot 0."
      },
      {
        "title": "Occupied does not mean found",
        "text": "Compare the stored key with the requested key. If it differs, keep probing along the same sequence."
      },
      {
        "title": "Know the limits",
        "text": "An empty slot ends an unsuccessful search, provided deletion has been handled correctly. A full-table search must stop after checking all slots."
      }
    ],
    "lesson": "Open addressing keeps records in the table itself.",
    "check": "How many slots does insertion of 20 inspect here?",
    "answer": "Three: 0, 1, 2. The third is empty and receives 20.",
    "extra": "The load must stay below 1 for spare slots. Nearby occupied groups can grow into clusters and make probing longer.",
    "refs": [
      "4-4",
      "example-5"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "probe",
    "minutes": 6,
    "block": "Hash tables",
    "start": 100,
    "end": 106
  },
  {
    "id": 18,
    "week": "5",
    "title": "Deleted is different from never used",
    "question": "Insert 7, 14, 21, 1 into seven slots. Then delete 14 and search for 21.",
    "a": [
      "Wrong: mark slot 1 empty",
      "Search for 21 starts at 0, then stops at 1. It wrongly reports that 21 is missing."
    ],
    "b": [
      "Correct: mark slot 1 deleted",
      "Search passes the deleted marker and finds 21 at slot 2."
    ],
    "walkthrough": [
      {
        "title": "Recall the insertion path",
        "text": "7, 14 and 21 all start at slot 0. They occupy slots 0, 1 and 2. Key 1 probes from slot 1 and ends at slot 3."
      },
      {
        "title": "An empty slot carries information",
        "text": "A never-used slot says this probe path did not previously continue beyond it. Deleting a record must not create that false message."
      },
      {
        "title": "Keep a tombstone",
        "text": "A deleted marker, also called a tombstone, preserves the search path. It can be reused for insertion, but a dictionary must still check that the key is not already farther along."
      }
    ],
    "lesson": "A deletion must preserve the evidence used by future searches.",
    "check": "Does a tombstone end an unsuccessful search?",
    "answer": "No. Continue until the key, a never-used slot, or the end of a complete bounded probe cycle.",
    "extra": "Too many tombstones can slow searches. Rebuilding the table removes old markers.",
    "refs": [
      "4-5",
      "example-6"
    ],
    "ref": "lecture-notes.html#topic-4-5",
    "visual": "tombstone",
    "minutes": 6,
    "block": "Hash tables",
    "start": 106,
    "end": 112
  },
  {
    "id": 19,
    "week": "5",
    "title": "A table needs breathing room",
    "question": "What changes when four records occupy five slots instead of ten?",
    "a": [
      "Five slots",
      "Load factor α = 4/5 = 0.8. In open addressing, few empty slots remain."
    ],
    "b": [
      "Ten slots",
      "Load factor α = 4/10 = 0.4. More space usually makes collision handling easier."
    ],
    "walkthrough": [
      {
        "title": "Read the fraction",
        "text": "Load factor means number of stored records divided by number of buckets or slots. It measures how full the table is."
      },
      {
        "title": "Resizing means rehashing",
        "text": "Changing the number of slots can change every hash location. With key 8: 8 mod 5 is 3, but 8 mod 10 is 8."
      },
      {
        "title": "One operation can be expensive",
        "text": "A resize processes many existing records. With geometric growth and suitable hashing, that occasional cost can be spread across many insertions. This is amortized analysis."
      }
    ],
    "lesson": "Extra space helps, but good distribution and a suitable resize policy still matter.",
    "check": "Can chaining have load factor 2?",
    "answer": "Yes: for example, ten records in five buckets. Open addressing cannot store two records per slot.",
    "extra": "Expected constant-time operations need suitable hashing and controlled load. Tombstones also affect probing even though they are not live records.",
    "refs": [
      "4-6"
    ],
    "ref": "lecture-notes.html#topic-4-6",
    "visual": "load",
    "minutes": 6,
    "block": "Hash tables",
    "start": 112,
    "end": 118
  },
  {
    "id": 20,
    "week": "5",
    "title": "Three speed claims that mean different things",
    "question": "Which promise can you safely make about finding a record?",
    "a": [
      "Balanced tree",
      "Worst-case O(log n): even a difficult key follows a path whose length is bounded logarithmically."
    ],
    "b": [
      "Hash table",
      "Expected O(1) under suitable hashing and load assumptions. A bad collision pattern can still cause O(n) work."
    ],
    "walkthrough": [
      {
        "title": "Expected: average under a model",
        "text": "Imagine many valid random choices of hash function. Expected cost averages over that randomness, for the stated assumptions."
      },
      {
        "title": "Amortized: average across operations",
        "text": "A costly resize can be paid for by many cheap insertions. This does not make each individual insertion constant-time."
      },
      {
        "title": "Worst case: include the difficult case",
        "text": "A bound must still hold for the most difficult permitted input. This matters when an individual operation has a tight deadline."
      }
    ],
    "lesson": "Expected, amortized and worst-case are different kinds of statement.",
    "check": "Is “hashing is always one step” correct?",
    "answer": "No. Computing the hash, resolving collisions and occasional resizing all take work.",
    "extra": "Here keys fit in a machine word. Hashing a long string also costs time to read its characters. Real-time timing needs implementation and hardware analysis too.",
    "refs": [
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-4-7",
    "visual": "bounds",
    "minutes": 6,
    "block": "Hash tables",
    "start": 118,
    "end": 124
  },
  {
    "id": 21,
    "week": "5",
    "title": "Take a ten-minute break",
    "question": "Step away from the screen. Come back ready to explain an example.",
    "a": [
      "Before the break",
      "Think of one idea you can now explain."
    ],
    "b": [
      "After the break",
      "We will use the idea in a different situation."
    ],
    "walkthrough": [],
    "lesson": "A short pause is part of the lesson.",
    "check": "What is one question you still have?",
    "answer": "Keep it ready for the next discussion.",
    "extra": "The lesson times include individual practice and teacher discussion.",
    "ref": "lecture-notes.html#topic-8",
    "minutes": 10,
    "block": "Break",
    "visual": null,
    "start": 124,
    "end": 134
  },
  {
    "id": 22,
    "week": "5",
    "title": "A good hash spreads the actual keys",
    "question": "Our IDs are 10, 20, 30, 40. Compare two simple hash rules.",
    "a": [
      "Remainder after division by 10",
      "All four keys go to bucket 0. Nine buckets are unused."
    ],
    "b": [
      "Remainder after division by 7",
      "The buckets are 3, 6, 2, 5. These four keys spread out."
    ],
    "walkthrough": [
      {
        "title": "Look at the data pattern",
        "text": "All IDs are multiples of 10. A remainder rule using 10 loses exactly the part that distinguishes these IDs."
      },
      {
        "title": "Compare the result",
        "text": "Division by 7 happens to separate these four keys. This example does not prove that 7 works well for every workload."
      },
      {
        "title": "Choose more than a pretty example",
        "text": "A useful hash should be fast, repeatable for the same key, and spread the actual key population well. For hostile inputs, randomization or stronger protections may matter."
      }
    ],
    "lesson": "Test the hash against the keys you expect, including patterned keys.",
    "check": "Would keys 7, 14, 21 spread well with remainder 7?",
    "answer": "No. All three map to bucket 0. A different divisor alone is not a universal guarantee.",
    "extra": "An ordinary hash-table function is not automatically a cryptographic hash. Security uses have additional requirements.",
    "refs": [
      "5-1"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "quality",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 134,
    "end": 140
  },
  {
    "id": 23,
    "week": "5",
    "title": "Collisions can arrive surprisingly early",
    "question": "Imagine each ID independently choosing one of 365 equally likely buckets.",
    "a": [
      "Only two IDs",
      "A collision has probability 1/365: about 0.27%."
    ],
    "b": [
      "Twenty-three IDs",
      "There are 253 pairs. The chance of at least one shared bucket is about 50.7%."
    ],
    "walkthrough": [
      {
        "title": "Count opportunities, not just records",
        "text": "Any pair can collide. For 23 IDs there are 23 × 22 / 2 = 253 different pairs."
      },
      {
        "title": "Calculate the opposite event",
        "text": "No collision means the second avoids one used bucket, the third avoids two, and so on. Multiply 364/365 × 363/365 × … × 343/365."
      },
      {
        "title": "Subtract from one",
        "text": "One minus the no-collision probability gives about 0.507. We do not add pair probabilities, because their events overlap."
      }
    ],
    "lesson": "You need collision handling long before every bucket is full.",
    "check": "Does 50.7% mean a collision is certain with 23 IDs?",
    "answer": "No. It is a probability under the stated random model. Some sets collide; others do not.",
    "extra": "The birthday analogy assumes independent, uniform choices among 365 days and ignores leap days. Real birthdays are not perfectly uniform.",
    "refs": [
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-2",
    "visual": "birthday",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 140,
    "end": 146
  },
  {
    "id": 24,
    "week": "5",
    "title": "Find two readings that make a target",
    "question": "Values are 4, 7, 1, 6. Find two different positions whose values add to 10.",
    "a": [
      "Try every pair",
      "You can compare each value with all later values. The number of pairs grows roughly like n²."
    ],
    "b": [
      "Remember earlier values",
      "For each value x, ask whether 10 − x has already appeared. Use a hash set of earlier values."
    ],
    "walkthrough": [
      {
        "title": "Read 4 first",
        "text": "We need 6, but the set is empty. Add 4. For 7 we need 3; for 1 we need 9. Neither is present, so add each value."
      },
      {
        "title": "Read 6 last",
        "text": "We need 4. It is already in the set. The pair is 4 + 6 = 10."
      },
      {
        "title": "Check before adding",
        "text": "This prevents using the same position twice. For target 10, one 5 is not enough. A second 5 can match the earlier one."
      }
    ],
    "lesson": "Remember useful past information instead of testing all pairs again.",
    "check": "For values [5, 5] and target 10, will the method work?",
    "answer": "Yes. The first 5 is stored after a failed lookup. The second finds the earlier 5.",
    "extra": "Expected O(n) time with suitable constant-time hash operations; O(n) extra space. This version finds one pair, not all pairs.",
    "refs": [
      "5-4"
    ],
    "ref": "lecture-notes.html#topic-5-4",
    "visual": "twoSum",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 146,
    "end": 152
  },
  {
    "id": 25,
    "week": "5",
    "title": "Text search: hash first, then check the letters",
    "question": "Find ABRA inside ABRACADABRA.",
    "a": [
      "Every four-letter window",
      "ABRA, BRAC, RACA, ACAD, CADA, ADAB, DABR, ABRA."
    ],
    "b": [
      "Use a rolling hash",
      "Compare a small numeric fingerprint first. If it matches, compare the actual letters to confirm."
    ],
    "walkthrough": [
      {
        "title": "Use windows the same size",
        "text": "ABRA has four letters. Slide a four-letter window one position at a time. The two matches start at positions 0 and 7."
      },
      {
        "title": "Update the fingerprint",
        "text": "A rolling hash removes the outgoing character’s contribution, shifts the remaining contributions, and adds the incoming character. The visual uses base 31, modulus 101 and ASCII codes."
      },
      {
        "title": "Never trust only the fingerprint",
        "text": "Different text can have the same hash. Hash equality selects a candidate; checking the letters decides whether it is a real match."
      }
    ],
    "lesson": "Rabin–Karp uses hashing as a filter, not as proof that two strings are equal.",
    "check": "If a window hash differs from the pattern hash, must we compare its letters?",
    "answer": "No. With the same hash rule, equal strings must have equal hashes. Different hashes rule out an exact match.",
    "extra": "Frequent collisions or many candidate matches can require much verification. This version can take O(N × M) worst-case time for text length N and pattern length M.",
    "refs": [
      "5-5",
      "example-9"
    ],
    "ref": "lecture-notes.html#topic-5-5",
    "visual": "rabin",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 152,
    "end": 158
  },
  {
    "id": 26,
    "week": "5",
    "title": "A fingerprint is a clue, not an identity",
    "question": "Two files have the same small hash. Are they necessarily identical?",
    "a": [
      "Quick filtering",
      "A duplicate finder can group files by hash, then compare the actual content."
    ],
    "b": [
      "Exact evidence",
      "If the content differs, the files are different even if their hashes match."
    ],
    "walkthrough": [
      {
        "title": "Notice what was compressed",
        "text": "A small fixed-size number cannot give a unique value to every possible file. Some different files must share it."
      },
      {
        "title": "Pick the right tool",
        "text": "Hash tables use hashes for lookup. Text search uses them to reject many windows quickly. Content checks may need much stronger hash functions."
      },
      {
        "title": "Match the guarantee to the task",
        "text": "For an exact classroom duplicate detector, verify the original content. Security designs need cryptographic primitives and a threat model, not this remainder demonstration."
      }
    ],
    "lesson": "The same general idea can support different tasks, with different guarantees.",
    "check": "Does a different hash prove that two files are different?",
    "answer": "Yes, when the same deterministic hash rule is applied to both complete files. A matching hash alone is not a general proof of equality.",
    "extra": "This lesson introduces applications. It does not claim that simple table hashes provide security or authentication.",
    "refs": [
      "5-3"
    ],
    "ref": "lecture-notes.html#topic-5-3",
    "visual": "fingerprint",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 158,
    "end": 164
  },
  {
    "id": 27,
    "week": "5",
    "title": "Choose for the question the machine must answer",
    "question": "One system handles message IDs. Another searches a time interval.",
    "a": [
      "CAN message ID lookup",
      "Given ID 70, find its handler. A hash table is a candidate for exact-key lookup."
    ],
    "b": [
      "Sensor readings from time 30 to 60",
      "A balanced ordered tree can find the start, then report the records in order."
    ],
    "walkthrough": [
      {
        "title": "Say the query clearly",
        "text": "“Find this exact ID” and “show every time in this interval” are different operations. A data structure good for one may not be good for the other."
      },
      {
        "title": "Count the returned records",
        "text": "A balanced tree can report k matching records in O(log n + k) with a suitable range traversal. Even perfect searching must spend time reporting the k answers."
      },
      {
        "title": "Check the engineering constraints",
        "text": "Consider changes, memory, worst-case deadlines and fixed versus changing keys. A small fixed CAN ID set may also suit a sorted array, direct table or a carefully designed fixed lookup."
      }
    ],
    "lesson": "There is no best structure without a workload and constraints.",
    "check": "Which helps answer “next timestamp after 40”: an ordinary hash table or a balanced tree?",
    "answer": "The balanced tree maintains key order and supports successor queries. An ordinary hash table does not maintain that order.",
    "extra": "A mathematical operation bound is not a complete real-time guarantee. Multiple readings at one timestamp need unique composite keys or a list of readings per key.",
    "refs": [
      "6-1",
      "example-7",
      "6-2",
      "6-3"
    ],
    "ref": "lecture-notes.html#topic-6-1",
    "visual": "engineering",
    "minutes": 6,
    "block": "Applications and practice",
    "start": 164,
    "end": 170
  },
  {
    "id": 28,
    "week": "5",
    "title": "Explain your choice",
    "question": "Take ten minutes: draw, count, and explain before checking the answers.",
    "a": [
      "Tree challenge",
      "Insert 30, 10, 50, 40. Find 40. Delete 30 using its successor. Draw the result."
    ],
    "b": [
      "Hash challenge",
      "With five slots and linear probing, insert 10, 15, 20. Delete 15. Explain how to find 20."
    ],
    "walkthrough": [
      {
        "title": "Tree answer",
        "text": "Find 40 via 30 → 50 → 40: three node visits. The successor of 30 is 40. Move its record into the root and remove the old 40. The final tree has root 40, left 10, right 50."
      },
      {
        "title": "Hash answer",
        "text": "The keys occupy slots 0, 1, 2. Mark slot 1 deleted. Searching for 20 checks slot 0, passes the marker at 1, and finds 20 at 2."
      },
      {
        "title": "Explain the common idea",
        "text": "Both structures skip work by preserving information. A BST preserves key order. A probing table preserves a search path, including deleted markers."
      }
    ],
    "lesson": "Explain what is counted, why the search can stop, and which assumptions make the claim true.",
    "check": "Is a BST always logarithmic? Is a hash lookup always constant-time?",
    "answer": "No to both. A BST needs controlled height. Expected constant-time hashing needs suitable distribution and load; worst cases can be linear.",
    "extra": "Use the linked exercises for more practice. The lesson simplifies the presentation, not the definitions or the performance assumptions.",
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
