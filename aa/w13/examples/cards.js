const cards = [
  {
    "id": 1,
    "week": "13",
    "title": "Give every table entry a meaning",
    "question": "A DP table is a collection of answers to smaller questions.",
    "a": [
      "Useful entry",
      "“Fewest coins needed to make amount 6.”"
    ],
    "b": [
      "Unclear entry",
      "“The number at index 6.”"
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Last week, memoization saved repeated answers and bottom-up DP computed them in dependency order."
      },
      {
        "title": "Follow the change",
        "text": "First define the state in words. Then give base cases, choices and a rule that combines smaller answers."
      },
      {
        "title": "Explain the result",
        "text": "Finally identify the answer cell and count states times work per state. A table is not automatically fast or correct."
      }
    ],
    "lesson": "The meaning of the state comes before the formula.",
    "check": "Why can a correct-looking table still solve the wrong problem?",
    "answer": "Its state or final answer may describe a different objective, such as counting choices instead of minimizing cost.",
    "extra": "We keep examples small enough to trace. Arithmetic counts assume ordinary unit-cost operations unless noted.",
    "refs": [
      "0-1",
      "0-2",
      "0-3",
      "0-4",
      "warmup",
      "1-1",
      "1-2"
    ],
    "ref": "lecture-notes.html#topic-0-1",
    "visual": "recipe",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 0,
    "end": 8
  },
  {
    "id": 2,
    "week": "13",
    "title": "Make six with as few coins as possible",
    "question": "Coin values are 1, 3 and 4; any number of copies is allowed.",
    "a": [
      "Largest first",
      "4 + 1 + 1 uses three coins."
    ],
    "b": [
      "Best answer",
      "3 + 3 uses two coins."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let dp[t] be the fewest coins for amount t. Set dp[0]=0: no coins are needed to make zero."
      },
      {
        "title": "Follow the change",
        "text": "For each coin c that fits, consider 1 + dp[t−c]. The last coin is c; the earlier coins make the remainder."
      },
      {
        "title": "Explain the result",
        "text": "Take the minimum. If no candidate is possible, store ∞, meaning unreachable. Memoization and a table evaluate the same recurrence."
      }
    ],
    "lesson": "Try every possible last coin, then reuse the best smaller answer.",
    "check": "With coins 3 and 4 only, can we make amount 2?",
    "answer": "No. Its entry stays ∞. A missing solution is different from a solution using zero coins.",
    "extra": "This is minimum coin count with unlimited copies, not counting the number of ways and not once-only selection.",
    "refs": [
      "1-3",
      "1-4"
    ],
    "ref": "lecture-notes.html#topic-1-3",
    "visual": "coins",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 8,
    "end": 16
  },
  {
    "id": 3,
    "week": "13",
    "title": "Fix cat into cut",
    "question": "An insertion, deletion or replacement costs one; matching a letter costs zero.",
    "a": [
      "Keep c and t",
      "They already match."
    ],
    "b": [
      "Replace a with u",
      "One operation completes the change."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Edit distance is the smallest total number of allowed operations, under the stated operation costs."
      },
      {
        "title": "Follow the change",
        "text": "Let D[i][j] be the cost to transform the first i source letters into the first j target letters."
      },
      {
        "title": "Explain the result",
        "text": "The last action either deletes a source letter, inserts a target letter, or matches/replaces the two last letters. Compare all three."
      }
    ],
    "lesson": "Two prefix lengths describe a smaller editing problem.",
    "check": "What is the distance from cat to cat?",
    "answer": "Zero. All letters match; no operation is needed.",
    "extra": "We use character-by-character Levenshtein distance. Swapping adjacent letters is not a single allowed operation here.",
    "refs": [
      "2-1",
      "2-2",
      "2-3"
    ],
    "ref": "lecture-notes.html#topic-2-1",
    "visual": "edit",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 16,
    "end": 24
  },
  {
    "id": 4,
    "week": "13",
    "title": "Why the empty row and column matter",
    "question": "Transform an empty string into cut, or cat into an empty string.",
    "a": [
      "Empty → cut",
      "Insert three letters: cost 3."
    ],
    "b": [
      "cat → empty",
      "Delete three letters: cost 3."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The first row is 0,1,2,… because building a prefix from nothing needs that many insertions."
      },
      {
        "title": "Follow the change",
        "text": "The first column is 0,1,2,… because removing a prefix needs that many deletions."
      },
      {
        "title": "Explain the result",
        "text": "Fill left to right, row by row. Each cell needs only above, left and diagonal-above-left, so those cells must already be known."
      }
    ],
    "lesson": "Boundary entries are real smaller problems, not decoration.",
    "check": "How much work is needed for source length m and target length n?",
    "answer": "There are (m+1)(n+1) entries and constant work per entry: O(mn) time for nonempty lengths. The full table uses O(mn) space.",
    "extra": "With an empty string, initializing the boundary still takes linear work. Two rolling rows can reduce storage if only the distance is required.",
    "refs": [
      "2-7",
      "2-8"
    ],
    "ref": "lecture-notes.html#topic-2-7",
    "visual": "edit",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 24,
    "end": 32
  },
  {
    "id": 5,
    "week": "13",
    "title": "Recover the edits, not just their number",
    "question": "Transform sun into snow.",
    "a": [
      "Distance",
      "Three operations."
    ],
    "b": [
      "One concrete script",
      "Delete u, insert o, insert w."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Start at the final table cell. Follow a predecessor whose cost explains the current cell."
      },
      {
        "title": "Follow the change",
        "text": "A diagonal step is a match or replacement; up is a deletion; left is an insertion. Reverse the collected actions to read them forward."
      },
      {
        "title": "Explain the result",
        "text": "One optimal transformation is sun → sn → sno → snow. Another optimal script may exist because predecessor costs can tie."
      }
    ],
    "lesson": "Store or recover choices to explain the computed answer.",
    "check": "Why is printing “3” not a full explanation?",
    "answer": "It says the minimum cost but does not show a sequence of edits achieving it. A script supplies that evidence.",
    "extra": "Our traceback prefers match/replacement, then deletion, then insertion on ties. It may choose a different optimal script from the written example.",
    "refs": [
      "2-5",
      "2-6"
    ],
    "ref": "lecture-notes.html#topic-2-5",
    "visual": "trace",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 32,
    "end": 40
  },
  {
    "id": 6,
    "week": "13",
    "title": "Try two words of your own",
    "question": "Change the source and target, then follow the table.",
    "a": [
      "Same word",
      "Every character can match for zero cost."
    ],
    "b": [
      "Different words",
      "Only the chosen minimum-cost sequence determines the distance."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The empty-prefix symbol ∅ is a boundary label; it is not a character in either string."
      },
      {
        "title": "Follow the change",
        "text": "Each step explains the candidate costs for the current cell. The orange cell is being filled now."
      },
      {
        "title": "Explain the result",
        "text": "The final step includes one optimal alignment and its edit operations. Inputs rebuild both the table and the explanation."
      }
    ],
    "lesson": "Changing the words recomputes the answer.",
    "check": "What is the distance from ab to ba?",
    "answer": "Two with these operations: replace both letters, or delete one and reinsert it. A swap is not a one-step operation here.",
    "extra": "The editor accepts up to eight ASCII letters per word, including an empty word. Case is significant.",
    "refs": [
      "2-4"
    ],
    "ref": "lecture-notes.html#topic-2-4",
    "visual": "editor",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 40,
    "end": 48
  },
  {
    "id": 7,
    "week": "13",
    "title": "Run edit distance in Python",
    "question": "The code computes the distance from cat to cut.",
    "a": [
      "Table boundaries",
      "Insertions from empty; deletions to empty."
    ],
    "b": [
      "Inner cell",
      "Choose the cheapest deletion, insertion or match/replacement."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The outer loop selects a source prefix length and the inner loop a target prefix length."
      },
      {
        "title": "Follow the change",
        "text": "If the last letters match, the diagonal adds zero; otherwise it adds one. The other two options always add one."
      },
      {
        "title": "Explain the result",
        "text": "Print each row and the bottom-right answer. Change the two strings and rerun, including an empty string to test the boundary."
      }
    ],
    "lesson": "The code and visual use the same recurrence and costs.",
    "check": "What should the code print for cat and cut?",
    "answer": "Distance 1. Replacing a with u is enough, and zero edits cannot change the word.",
    "extra": "No input() values are needed. Keep strings short to make the printed matrix readable.",
    "refs": [
      "2-6"
    ],
    "ref": "lecture-notes.html#topic-2-6",
    "visual": "python",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 48,
    "end": 56
  },
  {
    "id": 8,
    "week": "13",
    "title": "Keep a common sequence, with gaps allowed",
    "question": "Compare ABCD and ACBD.",
    "a": [
      "Common sequence",
      "ABD appears in both, in order."
    ],
    "b": [
      "Not necessarily adjacent",
      "Characters may have gaps between them."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "For matching last characters, extend the LCS of the shorter prefixes by one."
      },
      {
        "title": "Follow the change",
        "text": "For different last characters, discard one last character or the other and keep the larger result."
      },
      {
        "title": "Explain the result",
        "text": "The longest common subsequence has length 3 here. ABD and ACD both work. This differs from a contiguous substring."
      }
    ],
    "lesson": "A subsequence preserves order but may skip items.",
    "check": "Is the insertion/deletion-only distance the same as ordinary edit distance?",
    "answer": "Not always. Insertion/deletion-only distance equals m+n−2LCS. Allowing replacement at cost 1 can be cheaper.",
    "extra": "For these strings, 4+4−2×3 = 2 insertion/deletion operations.",
    "refs": [
      "3-1"
    ],
    "ref": "lecture-notes.html#topic-3-1",
    "visual": "lcs",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 56,
    "end": 64
  },
  {
    "id": 9,
    "week": "13",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain the meaning of one table cell."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What did the state remember?",
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
    "week": "13",
    "title": "Increasing means the numbers must rise",
    "question": "Read 3, 1, 4, 1, 5, 9, 2, 6 without rearranging it.",
    "a": [
      "Valid subsequence",
      "3, 4, 5, 6 has length 4."
    ],
    "b": [
      "Invalid shortcut",
      "Sorting the whole input changes the original order."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A strict increasing subsequence takes later positions whose values are larger. Equal values cannot extend it."
      },
      {
        "title": "Follow the change",
        "text": "For each ending position i, consider earlier positions j with value[j] < value[i]. Extend the best such subsequence by one."
      },
      {
        "title": "Explain the result",
        "text": "Alternatively, LCS with a sorted, duplicate-free copy gives the strict LIS length. Removing duplicates is essential to keep the strict meaning."
      }
    ],
    "lesson": "Choose positions in the original order, not a new sorted order.",
    "check": "Can 1,1 be part of a strictly increasing subsequence?",
    "answer": "No. It is nondecreasing, but not strictly increasing.",
    "extra": "The simple endpoint DP shown here takes O(n²). Faster O(n log n) LIS methods exist, but are not needed for this trace.",
    "refs": [
      "3-2"
    ],
    "ref": "lecture-notes.html#topic-3-2",
    "visual": "lis",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 74,
    "end": 82
  },
  {
    "id": 11,
    "week": "13",
    "title": "Mix two streams without reversing either",
    "question": "Mix AB and CD into a four-letter stream.",
    "a": [
      "Valid mix",
      "ACBD preserves A before B and C before D."
    ],
    "b": [
      "Invalid mix",
      "ADBC puts D before C."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "State S[i][j] asks whether the first i+j output letters can be formed from the first i letters of one input and j of the other."
      },
      {
        "title": "Follow the change",
        "text": "The next letter must come from the next unused letter of one of the two inputs."
      },
      {
        "title": "Explain the result",
        "text": "If both choices match, consider both possibilities through the table. First check that output length equals the sum of input lengths."
      }
    ],
    "lesson": "Interleaving preserves each input’s internal order.",
    "check": "Is CABD valid?",
    "answer": "Yes. Take C, then A and B, then D. Both input orders are preserved.",
    "extra": "This decides whether a mix is possible; it does not require a unique source assignment for repeated letters.",
    "refs": [
      "3-3"
    ],
    "ref": "lecture-notes.html#topic-3-3",
    "visual": "shuffle",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 82,
    "end": 90
  },
  {
    "id": 12,
    "week": "13",
    "title": "Find a near-match inside a longer message",
    "question": "Find cat inside xxcutyy, allowing edits.",
    "a": [
      "Whole-string distance",
      "Would also charge for unrelated surrounding letters."
    ],
    "b": [
      "Substring matching",
      "May start and finish inside the text."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Use source-prefix rows for the pattern and text-prefix columns. Initialize the entire top row to zero so a match can begin anywhere."
      },
      {
        "title": "Follow the change",
        "text": "Use the same edit recurrence. Finish at the smallest entry in the last pattern row, rather than only the bottom-right entry."
      },
      {
        "title": "Explain the result",
        "text": "The substring cut has distance 1 from cat. The surrounding xx and yy do not need to be edited."
      }
    ],
    "lesson": "Changing boundaries and the goal changes the question.",
    "check": "Does the top row of zeros mean every match has cost zero?",
    "answer": "No. It only makes the start position free. Transforming the pattern into the chosen substring still incurs edits.",
    "extra": "The visual shows the complete final table and the best ending column. Ties may identify more than one equally good substring.",
    "refs": [
      "3-4"
    ],
    "ref": "lecture-notes.html#topic-3-4",
    "visual": "approx",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 90,
    "end": 98
  },
  {
    "id": 13,
    "week": "13",
    "title": "Pack value, not just the biggest item",
    "question": "Items (weight,value): (2,3), (3,4), (4,5). Capacity is 5.",
    "a": [
      "Highest-value item alone",
      "Weight 4, value 5."
    ],
    "b": [
      "Better pair",
      "Weights 2+3 fit; values 3+4 give 7."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let V[i][w] mean best value using the first i items with capacity at most w."
      },
      {
        "title": "Follow the change",
        "text": "Either skip item i, or take it and add its value to the best result from the previous item row at the remaining capacity."
      },
      {
        "title": "Explain the result",
        "text": "Both choices use the previous row, preventing reuse. Subset sum uses a similar state but stores true/false instead of a maximum value."
      }
    ],
    "lesson": "0/1 means each item can be taken at most once.",
    "check": "Why is O(nW) called pseudo-polynomial?",
    "answer": "W is a numeric capacity. Doubling its bit length can make its value—and the table width—grow exponentially.",
    "extra": "Weights and capacity are nonnegative integers in this model; item weights in the example are positive. The numeric target is not the same as its input bit length.",
    "refs": [
      "4-1",
      "4-2"
    ],
    "ref": "lecture-notes.html#topic-4-1",
    "visual": "knapsack",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 98,
    "end": 106
  },
  {
    "id": 14,
    "week": "13",
    "title": "A higher-paying job can beat two short jobs",
    "question": "A runs [1,10) and pays 10; B runs [2,3) and pays 3; C runs [4,5) and pays 4.",
    "a": [
      "Earliest finish first",
      "Chooses B and C, earning 7."
    ],
    "b": [
      "Best total payment",
      "Chooses A, earning 10."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Sort jobs by finish time. For each job i, find the last earlier job p(i) that finishes no later than i starts."
      },
      {
        "title": "Follow the change",
        "text": "Compare skipping i with taking its fee plus OPT[p(i)]. Store the better value."
      },
      {
        "title": "Explain the result",
        "text": "Earliest-finish greedy solves the unweighted maximum-count problem, but this weighted objective is different."
      }
    ],
    "lesson": "A recurrence must match the reward being optimized.",
    "check": "Can one job finish exactly when another starts?",
    "answer": "Yes under the half-open interval convention [start,finish). The compatibility test is finish ≤ start.",
    "extra": "Sorting and predecessor lookup can take O(n log n), followed by O(n) DP. The teaching example uses a simple scan for predecessors.",
    "refs": [
      "4-3"
    ],
    "ref": "lecture-notes.html#topic-4-3",
    "visual": "schedule",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 106,
    "end": 114
  },
  {
    "id": 15,
    "week": "13",
    "title": "Best ending here differs from best anywhere",
    "question": "Sequence: −2, 3, −1, 4, −5.",
    "a": [
      "Extend the previous segment",
      "Carry its sum forward if it helps."
    ],
    "b": [
      "Start again",
      "Use the current value alone if earlier values hurt."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let ending[i] be the best sum of a nonempty contiguous segment that ends at i."
      },
      {
        "title": "Follow the change",
        "text": "Choose max(value[i], ending[i−1]+value[i]). Separately track the best ending value seen anywhere."
      },
      {
        "title": "Explain the result",
        "text": "The best segment is 3,−1,4, with sum 6. You cannot skip the −1 because the segment must be contiguous."
      }
    ],
    "lesson": "Keep the state needed for extension, plus the overall answer.",
    "check": "For −5,−2,−7, is the answer 0?",
    "answer": "No, because we require a nonempty segment. The answer is −2. Allowing an empty segment would change the problem.",
    "extra": "Kadane’s algorithm uses O(n) time and constant additional space when only the best sum and endpoints are needed.",
    "refs": [
      "4-4"
    ],
    "ref": "lecture-notes.html#topic-4-4",
    "visual": "kadane",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 114,
    "end": 122
  },
  {
    "id": 16,
    "week": "13",
    "title": "Take a short break",
    "question": "Pause for ten minutes.",
    "a": [
      "Rest",
      "Step away from the screen."
    ],
    "b": [
      "When you return",
      "Explain the meaning of one table cell."
    ],
    "walkthrough": [],
    "lesson": "Understanding matters more than speed.",
    "check": "What did the state remember?",
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
    "week": "13",
    "title": "Two fragile test pieces change the strategy",
    "question": "Find the highest safe floor in a ten-floor building using two identical eggs.",
    "a": [
      "Egg breaks",
      "Search lower floors with one fewer egg."
    ],
    "b": [
      "Egg survives",
      "Search higher floors with the same number of eggs."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A test must allow for both outcomes. For a candidate floor, take one plus the worse remaining case."
      },
      {
        "title": "Follow the change",
        "text": "Choose the test floor that minimizes this worst case. With one egg, test upward one floor at a time."
      },
      {
        "title": "Explain the result",
        "text": "For two eggs, four drops suffice for ten floors: first-egg probes can be 4,7,9,10. After a break, test the skipped lower floors in order."
      }
    ],
    "lesson": "Minimize the worst-case number of tests, not the best-case number.",
    "check": "Why do three drops not suffice with two eggs and ten floors?",
    "answer": "Three drops can distinguish thresholds across at most 3+2+1=6 floors. Four drops cover 4+3+2+1=10.",
    "extra": "There are eleven possible highest-safe thresholds, from 0 to 10. Eggs share a fixed monotone breaking threshold; the model ignores noise.",
    "refs": [
      "4-5"
    ],
    "ref": "lecture-notes.html#topic-4-5",
    "visual": "eggs",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 132,
    "end": 140
  },
  {
    "id": 18,
    "week": "13",
    "title": "The first cut affects every later cost",
    "question": "Cut a length-10 piece at positions 2 and 5. A cut costs the length of the current piece.",
    "a": [
      "Cut at 2 first",
      "Pay 10, then 8 for cutting the remaining piece: total 18."
    ],
    "b": [
      "Cut at 5 first",
      "Pay 10, then 5 for cutting the left piece: total 15."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "The finished pieces are identical, but the order changes the sizes being cut."
      },
      {
        "title": "Follow the change",
        "text": "For each interval, try every required first cut inside it. Add the interval length and the best costs for the left and right intervals."
      },
      {
        "title": "Explain the result",
        "text": "An interval with no required internal cut costs zero. Fill smaller intervals before larger ones."
      }
    ],
    "lesson": "Interval endpoints define a reusable smaller problem.",
    "check": "For length 20 with cuts 3,8,10, what is the minimum?",
    "answer": "37: cut at 10 for cost 20, then at 3 within length 10, then at 8 within length 7. Total 20+10+7.",
    "extra": "This is a segment-length cost model, also used for copying/splitting strings. It does not model arbitrary physical cutting costs.",
    "refs": [
      "4-6"
    ],
    "ref": "lecture-notes.html#topic-4-6",
    "visual": "cuts",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 140,
    "end": 148
  },
  {
    "id": 19,
    "week": "13",
    "title": "Count fuel stops, not road legs",
    "question": "Range is 60. Stations are at 40,70,120,150; destination is 190.",
    "a": [
      "Road legs",
      "0→40→70→120→150→190: five legs."
    ],
    "b": [
      "Refills",
      "Four stops; the initial tank is already full."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Let L[i] be the minimum number of legs to point i. Look back at points within one tank’s range."
      },
      {
        "title": "Follow the change",
        "text": "Use 1+min L[j] over reachable earlier points. An unreachable point retains ∞."
      },
      {
        "title": "Explain the result",
        "text": "Subtract one from the number of legs for refills before the destination. Here every intermediate stop is needed."
      }
    ],
    "lesson": "The answer must use the unit the question asks for.",
    "check": "What if the gap between two consecutive available points exceeds 60?",
    "answer": "The trip is impossible under these assumptions. Do not turn ∞ into a finite stop count.",
    "extra": "Every stop refills to the same full range, prices do not matter, and travel is forward. A farthest-reachable greedy rule also works for this model.",
    "refs": [
      "4-7"
    ],
    "ref": "lecture-notes.html#topic-4-7",
    "visual": "fuel",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 148,
    "end": 156
  },
  {
    "id": 20,
    "week": "13",
    "title": "Split ordered work fairly",
    "question": "Split 1,2,3,4,5 into two nonempty contiguous groups.",
    "a": [
      "Cut after 2",
      "Group sums 3 and 12; largest is 12."
    ],
    "b": [
      "Cut after 3",
      "Group sums 6 and 9; largest is 9."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Keep item order. For a candidate final split x, compare the best earlier partition with the sum of the final group."
      },
      {
        "title": "Follow the change",
        "text": "The objective is to minimize the largest group sum. So take the maximum within each candidate, then the minimum across candidates."
      },
      {
        "title": "Explain the result",
        "text": "The four possible cuts give largest sums 14,12,9,10. The best split is [1,2,3] and [4,5]."
      }
    ],
    "lesson": "Min outside, max inside expresses the fairness objective.",
    "check": "May we reorder the items to balance the groups?",
    "answer": "No. Reordering is a different problem. This one requires contiguous groups in original order.",
    "extra": "For k groups, interval sums from prefix sums give O(kn²) time. Impossible states, such as one item in two nonempty groups, have value ∞.",
    "refs": [
      "5-1",
      "5-2"
    ],
    "ref": "lecture-notes.html#topic-5-1",
    "visual": "partition",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 156,
    "end": 164
  },
  {
    "id": 21,
    "week": "13",
    "title": "Align a slow gesture with a faster one",
    "question": "Sensor samples A=[1,3,3,1], B=[1,3,1].",
    "a": [
      "Index-by-index",
      "The first three pairs cost 0+0+2, and one A sample remains."
    ],
    "b": [
      "DTW alignment",
      "Both consecutive 3s in A can align to the single 3 in B."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "Local cost is abs(A[i]−B[j]). Add it to the cheapest predecessor above, left or diagonal."
      },
      {
        "title": "Follow the change",
        "text": "A horizontal or vertical step repeats an alignment partner; it is not a literal character deletion or insertion."
      },
      {
        "title": "Explain the result",
        "text": "With standard endpoint-constrained DTW, these two sequences have total alignment cost 0. This does not prove that two physical gestures are identical."
      }
    ],
    "lesson": "Time alignment can handle different sampling pace.",
    "check": "Can a very narrow alignment band exclude a good route?",
    "answer": "Yes. It reduces computation but can also exclude the unconstrained optimum or leave no legal alignment.",
    "extra": "The full table has O(mn) cells. Real sensor pipelines also need decisions about scaling, noise, sampling and admissible warping.",
    "refs": [
      "dtw"
    ],
    "ref": "lecture-notes.html#topic-dtw",
    "visual": "dtw",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 164,
    "end": 172
  },
  {
    "id": 22,
    "week": "13",
    "title": "DP is not a promise of a small table",
    "question": "Some states need a prefix; others need an entire visited set.",
    "a": [
      "Edit distance",
      "Two prefix lengths give about m×n states."
    ],
    "b": [
      "Traveling salesperson",
      "Visited subset plus current city gives exponentially many states."
    ],
    "walkthrough": [
      {
        "title": "Start with the example",
        "text": "A state must retain everything that affects future choices. If deletion cost depends on recent edits, prefix lengths alone may not suffice."
      },
      {
        "title": "Follow the change",
        "text": "For a tour visiting every city once, current city alone is insufficient. Which cities remain matters too."
      },
      {
        "title": "Explain the result",
        "text": "Held–Karp subset DP takes O(n²2ⁿ) time in its standard form. It improves on permutation enumeration but remains exponential."
      }
    ],
    "lesson": "Count states and choices per state; do not assume DP makes every problem easy.",
    "check": "Does optimal substructure mean a greedy choice is always safe?",
    "answer": "No. DP compares the relevant alternatives; greedy commits to one. A greedy rule needs its own proof.",
    "extra": "Recap by naming each state, its boundary, its transition and its goal. Then demonstrate the answer on a tiny instance.",
    "refs": [
      "6-1",
      "6-2",
      "6-3",
      "8-1",
      "8-2"
    ],
    "ref": "lecture-notes.html#topic-6-1",
    "visual": "limits",
    "minutes": 8,
    "block": "Dynamic programming applications",
    "start": 172,
    "end": 180
  }
];
