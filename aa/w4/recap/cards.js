const cards = [
  {
    "id": 19,
    "week": "1–4",
    "title": "Start with four small questions",
    "question": "Write your answer. You do not need any symbols yet.",
    "a": [
      "Two jobs",
      "1. Check each of 8 lights.\n2. Undo the last robot command."
    ],
    "b": [
      "Two more jobs",
      "3. Put 13 parts into boxes that hold 5.\n4. Look for a code in a sorted list."
    ],
    "lesson": "First say what you would do. Then say what you would count.",
    "check": "How many checks or boxes do you need? Which command should you undo first?",
    "answer": "1: 8 checks. 2: Undo the last command first. 3: 3 boxes. 4: If you can check the middle quickly, you can remove about half of the remaining choices each step.",
    "ref": "lecture-notes.html",
    "extra": "Count one light check as one unit of work. An undo command needs enough saved information to reverse the action.",
    "widget": "",
    "block": "Starting check",
    "minutes": 8,
    "start": 0,
    "end": 8,
    "walkthrough": [
      {
        "title": "Name the job",
        "text": "For the lights, the job is to check all 8. For the boxes, the job is to make enough space for all 13 parts."
      },
      {
        "title": "Do one small action",
        "text": "Check one light, then the next. Fill one box with 5 parts, then another with 5. Three parts still need a third box."
      },
      {
        "title": "Say what you counted",
        "text": "You counted 8 light checks and 3 boxes. These are different kinds of work. Always name the unit before using a formula."
      }
    ]
  },
  {
    "id": 20,
    "week": "2–3",
    "title": "Two loops do not always mean n²",
    "question": "Compare the work in these two cases.",
    "a": [
      "One job after another",
      "Turn on 8 lights. Then turn them off.\n8 + 8 = 16 actions."
    ],
    "b": [
      "One job inside another",
      "Test each of 8 senders with each of 8 receivers.\n8 × 8 = 64 tests."
    ],
    "lesson": "Count how often the work happens. Do not just count the loops.",
    "check": "What if there are 4 senders and 6 receivers? What about 4 on-actions and 6 off-actions?",
    "answer": "The first task needs 24 tests. The second needs 10 actions. Two different sizes can be called n and m.",
    "ref": "lecture-notes.html",
    "extra": "Work done in sequence adds. Work repeated for every combination multiplies. If the inner task changes size, add its actual counts.",
    "widget": "",
    "block": "Starting check",
    "minutes": 7,
    "start": 8,
    "end": 15,
    "walkthrough": [
      {
        "title": "Follow case A",
        "text": "Turn on lights 1 through 8. That is 8 actions. Then turn them off: 8 more. You have done two separate passes."
      },
      {
        "title": "Follow case B",
        "text": "Choose sender 1 and test all 8 receivers. Repeat for sender 2, then every other sender. There are 8 groups of 8 tests."
      },
      {
        "title": "Explain the difference",
        "text": "A adds two groups: 8+8. B repeats a whole group 8 times: 8×8. That is why counting two loops is not enough."
      }
    ]
  },
  {
    "week": "1",
    "title": "A short next step can lead to a long trip",
    "question": "A robot starts at 0. It must visit −4, −1, 1 and 3 on a line, then return to 0.",
    "a": [
      "Go to the nearest next stop",
      "0 → −1 → 1 → 3 → −4 → 0\nDistance: 1+2+2+7+4 = 16.\nAt the first tie, choose −1."
    ],
    "b": [
      "Try another route",
      "0 → −1 → −4 → 1 → 3 → 0\nDistance: 1+3+5+2+3 = 14.\nBoth routes visit every stop."
    ],
    "lesson": "The nearest next stop did not give the shortest whole trip. A rule that seems sensible can fail.",
    "check": "Is a shorter trip correct if it skips a required stop?",
    "answer": "No. It must do the whole job. A fast answer to the wrong problem is not a correct answer.",
    "ref": "../w1/#lesson",
    "extra": "The two end points are 7 units apart. A closed trip must cross this span in both directions, so it needs at least 14 units. The second route reaches this bound. Here a visit means the robot stops to do the required task.",
    "widget": "",
    "id": 1,
    "block": "Correctness and counterexamples",
    "minutes": 4,
    "start": 15,
    "end": 19,
    "walkthrough": [
      {
        "title": "Read the route",
        "text": "The numbers are positions on a line. Going from −1 to 1 takes 2 units. Going from 3 to −4 takes 7 units. An arrow means the next stop."
      },
      {
        "title": "Follow the nearest-stop rule",
        "text": "At 0, −1 and 1 are equally near; choose −1. From −1, 1 is nearer than −4. The rule keeps choosing a short next move, but later needs the long move from 3 to −4."
      },
      {
        "title": "Compare whole trips",
        "text": "Add every move, including the return to 0. The first route costs 16 and the second costs 14. Both do the job, but the first is not the shortest."
      }
    ]
  },
  {
    "week": "1",
    "title": "Which job should the test bench do first?",
    "question": "Choose as many jobs as possible. Each job has a fixed start and end time.",
    "a": [
      "Choose a shortest job",
      "A: 0–3   B: 2–4   C: 3–5\nB and C tie. Choose B.\nB overlaps both others: only 1 job."
    ],
    "b": [
      "Choose the job that ends first",
      "Choose A, which ends at 3.\nThen choose C, which starts at 3.\nResult: 2 jobs."
    ],
    "lesson": "For this job-count problem, repeatedly choosing the earliest-ending job that fits gives the best count.",
    "check": "What if B pays $1,000 but A and C together pay $200?",
    "answer": "The goal has changed. The largest number of jobs may not give the most money.",
    "ref": "../w1/#example-1-1",
    "extra": "There is one test bench. A job can start exactly when another ends. To remove the shortest-job tie, change C to 3–6: B is now uniquely shortest and still loses. Replacing the first job of an optimal schedule with an earlier-ending job leaves room for its later jobs.",
    "widget": "",
    "id": 2,
    "block": "Correctness and counterexamples",
    "minutes": 4,
    "start": 19,
    "end": 23,
    "walkthrough": [
      {
        "title": "Read the time intervals",
        "text": "A uses the bench from time 0 to time 3. B needs it from 2 to 4. They overlap, so one bench cannot do both."
      },
      {
        "title": "Try the two choices",
        "text": "Choosing B blocks both A and C. Choosing A leaves the bench free at time 3, exactly when C starts. So A and C can both run."
      },
      {
        "title": "Name the goal",
        "text": "We want the number of completed jobs, not the shortest single job. One short choice can leave room for fewer jobs overall."
      }
    ]
  },
  {
    "id": 21,
    "week": "1",
    "title": "Test the value at the boundary",
    "question": "Raise an alarm only when temperature is ABOVE 80.",
    "a": [
      "Wrong rule: temperature ≥ 80",
      "79 → no alarm\n80 → alarm\n81 → alarm"
    ],
    "b": [
      "Required rule: temperature > 80",
      "79 → no alarm\n80 → no alarm\n81 → alarm"
    ],
    "lesson": "Testing only 79 and 81 misses the mistake. Testing 80 finds it.",
    "check": "How does “at least 80” differ from “above 80”?",
    "answer": "“At least 80” includes 80. “Above 80” does not. Write the requirement before checking the rule.",
    "ref": "lecture-notes.html",
    "extra": "This is a simple threshold example. We count the given numeric readings; real sensor error and alarm design are outside this example.",
    "widget": "",
    "block": "Correctness and counterexamples",
    "minutes": 4,
    "start": 23,
    "end": 27,
    "walkthrough": [
      {
        "title": "Focus on the word above",
        "text": "Above 80 means greater than 80. Exactly 80 is not above 80. The symbols > and ≥ differ at that one boundary."
      },
      {
        "title": "Test the boundary",
        "text": "At 79, both rules say no. At 81, both say yes. At 80, only the ≥ rule says yes, so that test reveals the mistake."
      },
      {
        "title": "Connect the test to the rule",
        "text": "A test is useful when it can separate a correct rule from a wrong one. Here, the exact boundary is the important case."
      }
    ]
  },
  {
    "id": 22,
    "week": "1",
    "title": "The largest coin is not always the best choice",
    "question": "You have unlimited coins worth 1, 3 and 4. Make 6 using as few coins as possible.",
    "a": [
      "Take the largest coin first",
      "4 + 1 + 1 = 6\n3 coins."
    ],
    "b": [
      "Try a different choice",
      "3 + 3 = 6\n2 coins."
    ],
    "lesson": "One failing example is enough to disprove an “always works” claim.",
    "check": "Try making 5. Does success with 5 fix the failure with 6?",
    "answer": "No. For 5, 4+1 is best. But the same rule still fails for 6.",
    "ref": "lecture-notes.html",
    "extra": "These are made-up coin values. We are not making a claim about every real currency. Trying all possible choices can check a small example.",
    "widget": "",
    "block": "Correctness and counterexamples",
    "minutes": 4,
    "start": 27,
    "end": 31,
    "walkthrough": [
      {
        "title": "Follow the largest-first rule",
        "text": "For a total of 6, take a 4. You still need 2. Only the 1 coin fits, so take two 1 coins. That uses 3 coins."
      },
      {
        "title": "Try another first choice",
        "text": "Start with 3. You still need 3, so take another 3. That uses only 2 coins. There is no 6 coin, so one coin cannot work."
      },
      {
        "title": "Explain why the rule fails",
        "text": "Choosing the largest coin looked good for the first step. It left an awkward remainder. A smaller first coin gave a better complete answer."
      }
    ]
  },
  {
    "week": "1",
    "title": "Testing is useful. A proof goes further.",
    "question": "A method worked on 100 test inputs.",
    "a": [
      "What the tests tell us",
      "It worked on those 100 inputs.\nA different input could still fail."
    ],
    "b": [
      "What a proof must show",
      "The starting state is right.\nEach step keeps the needed facts true.\nThe method finishes with the required result."
    ],
    "lesson": "A proof covers every allowed input, not just the inputs we tried.",
    "check": "How many orders are there for 4 different parts? What about 8?",
    "answer": "4! = 24. 8! = 40,320. Twice as many parts gives 1,680 times as many orders.",
    "ref": "../w1/#lesson",
    "extra": "n! means n × (n−1) × … × 1. Trying every order is called brute force. For full correctness, also show that the method stops. For example, the number of unprocessed items gets smaller each step.",
    "widget": "",
    "id": 3,
    "block": "Correctness and counterexamples",
    "minutes": 4,
    "start": 31,
    "end": 35,
    "walkthrough": [
      {
        "title": "Separate evidence from a guarantee",
        "text": "A successful test tells you about that input. It does not tell you what happens on every other allowed input."
      },
      {
        "title": "See why trying everything grows fast",
        "text": "For 4 different parts, choose the first in 4 ways, the next in 3, then 2, then 1. Multiply: 4×3×2×1=24 orders."
      },
      {
        "title": "Understand what a proof adds",
        "text": "A proof explains why every allowed input works. It must also show that the method finishes; a loop that never stops cannot deliver an answer."
      }
    ]
  },
  {
    "week": "2",
    "title": "n just means how many items we have",
    "question": "Check every sensor. Count one sensor check as one unit of work.",
    "a": [
      "Check each sensor once",
      "4 sensors → 4 checks\n8 sensors → 8 checks"
    ],
    "b": [
      "Check each sensor twice",
      "4 sensors → 8 checks\n8 sensors → 16 checks"
    ],
    "lesson": "In both methods, twice as many sensors means twice as much work. The growth pattern is the same; the counts are different.",
    "check": "If n=6, how many checks does the second method make?",
    "answer": "12 checks. n is the number of sensors, not a time in seconds.",
    "ref": "../w2/#lesson",
    "extra": "We use a simple cost model. A small comparison or a memory access takes one fixed amount of work. Real time also depends on hardware and software. Very long strings or very large numbers need more care.",
    "widget": "growth",
    "id": 4,
    "block": "Count the work",
    "minutes": 4,
    "start": 35,
    "end": 39,
    "walkthrough": [
      {
        "title": "Give n a meaning",
        "text": "n is the number of sensors. When n=4, there are four sensors to check. The letter is just a short name for the input size."
      },
      {
        "title": "Count both methods",
        "text": "One pass checks 4 sensors once: 4 checks. Two passes check the same 4 twice: 8 checks. With 8 sensors, the counts become 8 and 16."
      },
      {
        "title": "Look at the change",
        "text": "Both counts double when the number of sensors doubles. One method still does twice as much work as the other. Same growth does not mean same count."
      }
    ]
  },
  {
    "id": 23,
    "week": "2–3",
    "title": "Move the key. Count the checks.",
    "question": "Look through six compartments from left to right. Stop when you find the key.",
    "a": [
      "Key in the first compartment",
      "Open the first compartment.\n1 check."
    ],
    "b": [
      "Key in the last compartment",
      "Check all six compartments.\n6 checks."
    ],
    "lesson": "The method is the same. The input changes how much work it does.",
    "check": "Try positions 2, 5 and 6. Then try “Not present”.",
    "answer": "The counts are 2, 5 and 6. If the key is not present, you must check all 6 before saying so.",
    "ref": "lecture-notes.html",
    "extra": "A check means looking in one compartment. There is at most one key. The demo resets when you change its location.",
    "widget": "search",
    "block": "Count the work",
    "minutes": 4,
    "start": 39,
    "end": 43,
    "walkthrough": [
      {
        "title": "Start at the left",
        "text": "The closed compartments are marked ?. Open the first one. If it has no key, move to the second. Do not skip a compartment."
      },
      {
        "title": "Stop for a reason",
        "text": "If you find the key in compartment 2, you have made 2 checks and can stop. If no key is present, you cannot know that until all 6 have been checked."
      },
      {
        "title": "Change the input",
        "text": "Move the key and run the same rule again. The number of checks changes because the input changed, not because the search rule changed."
      }
    ]
  },
  {
    "week": "2–3",
    "title": "Best case and worst case",
    "question": "Check 8 sensors from left to right. Stop at the first faulty sensor.",
    "a": [
      "Fault in the first sensor",
      "1 check.\nThis case still needs 1 check in a longer list."
    ],
    "b": [
      "Fault in the last sensor",
      "8 checks.\nWith 16 sensors, this case needs 16."
    ],
    "lesson": "Best case: one check, Θ(1). Worst case: n checks, Θ(n). These describe the same method.",
    "check": "If exactly one sensor is faulty and each position is equally likely, what is the average for 8 sensors?",
    "answer": "(1+2+3+4+5+6+7+8)/8 = 4.5 checks. A single run has a whole number of checks; an average need not.",
    "ref": "../w3/#r0_A",
    "extra": "The average depends on the probability model. If no sensor is faulty, all n are checked. Do not automatically average the best and worst counts in other problems.",
    "widget": "",
    "id": 6,
    "block": "Count the work",
    "minutes": 4,
    "start": 43,
    "end": 47,
    "walkthrough": [
      {
        "title": "Find the easiest input",
        "text": "If the first sensor is faulty, one check finds it. The search stops immediately. This is the best case."
      },
      {
        "title": "Find the hardest input",
        "text": "If only the last sensor is faulty, every earlier sensor must be checked first. That takes n checks. This is the worst case."
      },
      {
        "title": "Understand the average",
        "text": "For 8 equally likely fault positions, the possible counts are 1 through 8. Their sum is 36; dividing by 8 gives 4.5. That is an average, not half a check in one run."
      }
    ]
  },
  {
    "week": "3",
    "title": "Add the work or multiply it?",
    "question": "Four sensors need testing. First describe the task.",
    "a": [
      "Two full passes",
      "4 temperature checks + 4 voltage checks = 8.\nFor 8 sensors: 8+8=16.\nAdd the work: Θ(n)."
    ],
    "b": [
      "Every sensor against every sensor",
      "Include self-tests. Count AB and BA separately.\n4×4=16; 8×8=64.\nThis model gives Θ(n²)."
    ],
    "lesson": "Tasks done one after another add. A task repeated for every outer step may multiply.",
    "check": "If each different pair is checked only once, how many checks for 4 sensors?",
    "answer": "6: AB, AC, AD, BC, BD, CD. For 8 sensors: 28. The formula is n(n−1)/2, which grows as Θ(n²).",
    "ref": "../w3/",
    "extra": "For groups of three different sensors, the count is n(n−1)(n−2)/6: 4 groups for 4 sensors and 56 for 8. Always check the loop limits before naming a growth class.",
    "widget": "",
    "id": 7,
    "block": "Count the work",
    "minutes": 8,
    "start": 47,
    "end": 55,
    "walkthrough": [
      {
        "title": "Count a full pass",
        "text": "A temperature pass visits all 4 sensors. A voltage pass visits all 4 again. The second pass happens after the first, so add 4+4."
      },
      {
        "title": "Count a repeated inner task",
        "text": "For sensor A, compare with A, B, C and D. Do the same for B, C and D. Four outer choices each cause four inner checks: 4×4."
      },
      {
        "title": "Check what is included",
        "text": "The 16-count model includes AA and counts AB separately from BA. If you only want different unordered pairs, remove those repeats: the count becomes 6."
      }
    ]
  },
  {
    "week": "2–3",
    "title": "Keep half. Remove half.",
    "question": "Look for a part number in a sorted array of boxes.",
    "a": [
      "Check one at a time",
      "16 boxes: up to 16 checks.\n32 boxes: up to 32 checks."
    ],
    "b": [
      "Use the middle to choose a side",
      "16 → 8 → 4 → 2 → 1\n32 → 16 → 8 → 4 → 2 → 1\nTwice the size adds one halving step."
    ],
    "lesson": "log₂16=4 means four halvings take 16 down to 1. Here, a logarithm counts halving steps.",
    "check": "Does binary search in 16 boxes always need at most 4 box checks?",
    "answer": "No. Standard middle-item search can inspect 5 boxes. With distinct keys and n≥1, the worst successful search inspects ⌊log₂n⌋+1 boxes. Its growth is Θ(log n).",
    "ref": "../w3/",
    "extra": "The animation models size reduction, not the exact remaining candidates in binary search. One box inspection is one step here; code may use separate equality and less-than comparisons. The data must be sorted, with fast middle access. log₂(8×4)=3+2=5; log₂(n²)=2log₂n. A fixed change of log base changes only a constant factor.",
    "widget": "half",
    "id": 8,
    "block": "Count the work",
    "minutes": 3,
    "start": 55,
    "end": 58,
    "walkthrough": [
      {
        "title": "See why sorted order helps",
        "text": "Look at the middle value. If your target is larger, every value on the smaller side can be removed from the search. This works because the values are in order."
      },
      {
        "title": "Count halvings, not items",
        "text": "In the size model, 16 becomes 8, then 4, then 2, then 1. There are four arrows. log₂16=4 is a short way to write that count."
      },
      {
        "title": "Separate the model from the search",
        "text": "The model stops when one candidate remains. A search may still need to inspect that candidate. That is why 16 items can require 5 middle-item checks."
      }
    ]
  },
  {
    "week": "2–3",
    "title": "Round up for enough space",
    "question": "Put 10 parts into boxes that each hold at most 4.",
    "a": [
      "⌈10/4⌉ = 3 boxes needed",
      "[4 parts] [4 parts] [2 parts]\nYou need space for every part. Round up."
    ],
    "b": [
      "⌊10/4⌋ = 2 full boxes",
      "Two boxes are completely full.\nThe last box is only half full. Round down."
    ],
    "lesson": "⌈x⌉ is the smallest integer at least x. ⌊x⌋ is the largest integer at most x. These are rounding operations.",
    "check": "What if there are 12 parts? What if there are no parts?",
    "answer": "12/4=3, so both answers are 3. With no parts, you need 0 boxes.",
    "ref": "../w3/#r0_a0",
    "extra": "The word “ceiling” can also be used as a picture for an upper bound. Do not mix them up: ⌈2.5⌉ gives the number 3; O(n) describes a growth bound.",
    "widget": "boxes",
    "id": 9,
    "block": "Count the work",
    "minutes": 3,
    "start": 58,
    "end": 61,
    "walkthrough": [
      {
        "title": "Fill the boxes",
        "text": "Put 4 parts in the first box and 4 in the second. You have packed 8 of the 10 parts. Two parts are still outside."
      },
      {
        "title": "Make room for the rest",
        "text": "A third box is needed for those 2 parts. It is not full, but it is still a box. So the number of boxes needed is 3."
      },
      {
        "title": "Choose the right rounding",
        "text": "10÷4=2.5. Round up to count enough boxes: 3. Round down to count completely full boxes: 2. The question decides which answer you need."
      }
    ]
  },
  {
    "id": 26,
    "week": "2–3",
    "title": "Seats and full teams",
    "question": "There are 17 students. A minibus holds 5. A complete project team needs exactly 5.",
    "a": [
      "Give everyone a seat",
      "5+5+5+2\n4 minibuses: ⌈17/5⌉."
    ],
    "b": [
      "Count complete teams",
      "5+5+5, with 2 left over.\n3 complete teams: ⌊17/5⌋."
    ],
    "lesson": "The division is the same. The question decides whether to round up or down.",
    "check": "Try 20 students. Then try 21. How many are left outside the complete teams?",
    "answer": "20: 4 buses, 4 full teams, 0 left over. 21: 5 buses, 4 full teams, 1 left over.",
    "ref": "lecture-notes.html",
    "extra": "We count five student seats per vehicle. “Full teams” does not mean everyone must belong to a full team; the leftover count matters.",
    "widget": "",
    "block": "Count the work",
    "minutes": 3,
    "start": 61,
    "end": 64,
    "walkthrough": [
      {
        "title": "Count the full groups",
        "text": "Three groups of 5 use 15 of the 17 students. Two students are left. So there are 3 complete teams."
      },
      {
        "title": "Ask whether anyone may be left out",
        "text": "For transport, nobody may be left without a seat. The remaining 2 students need another minibus. So 4 vehicles are needed."
      },
      {
        "title": "Notice the different questions",
        "text": "Full teams counts only complete groups. Vehicles needed must cover everybody. This is why the same division can lead to different answers."
      }
    ]
  },
  {
    "id": 25,
    "week": "2–3",
    "title": "Setup work plus work for each item",
    "question": "Preparing a printer takes 3 work units. Printing each label takes 2.",
    "a": [
      "4 parts",
      "3 + 2×4 = 11 work units."
    ],
    "b": [
      "8 parts",
      "3 + 2×8 = 19 work units."
    ],
    "lesson": "Doubling the input does not have to double the total exactly. Fixed setup work matters less for larger batches. T(n)=2n+3 is Θ(n).",
    "check": "Find the work for 10 and 100 parts. Does O(n) mean at most exactly n steps?",
    "answer": "The counts are 23 and 203. No: O(n) allows a fixed multiple of n as an upper bound.",
    "ref": "lecture-notes.html",
    "extra": "These are work units, not measured seconds. The setup cost is fixed in this model; the printing cost grows with the number of parts.",
    "widget": "",
    "block": "Count the work",
    "minutes": 3,
    "start": 64,
    "end": 67,
    "walkthrough": [
      {
        "title": "Separate setup from repeated work",
        "text": "The printer is prepared once, costing 3 units. That cost does not repeat for every part. Each label then costs 2 more units."
      },
      {
        "title": "Build the total",
        "text": "For 4 labels, add 3+2+2+2+2=11. For 8 labels, add the setup once and eight copies of 2: 3+16=19."
      },
      {
        "title": "Read the formula",
        "text": "T(n) means the work for n parts. In T(n)=2n+3, 2n is the label work and 3 is the fixed setup. The setup is why doubling n does not exactly double this total."
      }
    ]
  },
  {
    "week": "2",
    "title": "O, Ω and Θ: three statements about growth",
    "question": "Let the work be T(n)=2n+3. For n=4 it is 11; for n=8 it is 19.",
    "a": [
      "O(n): an upper bound",
      "For n≥1, 2n+3 ≤ 5n.\nThe work stays below a fixed multiple of n."
    ],
    "b": [
      "Ω(n), then Θ(n)",
      "2n+3 ≥ 2n gives a lower bound: Ω(n).\nBoth bounds together give Θ(n)."
    ],
    "lesson": "Θ(n) means linear growth, not exactly n steps. O gives an upper bound. Θ gives both upper and lower bounds.",
    "check": "Is 2n+3 also O(n²)?",
    "answer": "Yes: for n≥1, 2n+3 ≤ 5n². It is true, but less precise. Θ(n) tells us the growth pattern more clearly.",
    "ref": "../w2/#notes",
    "extra": "The multipliers must be positive constants, independent of n. The bounds must hold for every sufficiently large n. O does not mean worst case, and Ω does not mean best case. First choose the cost function, then describe its growth.",
    "widget": "",
    "id": 5,
    "block": "Count the work",
    "minutes": 3,
    "start": 67,
    "end": 70,
    "walkthrough": [
      {
        "title": "Read the symbols as sentences",
        "text": "T(n) means the work for n items. Here it is 2n+3. The sign ≤ means “at most”; ≥ means “at least”. O(n) says a fixed multiple of n can stay above the work for all sufficiently large n."
      },
      {
        "title": "Put the work between two bounds",
        "text": "For n≥1, 2n is below 2n+3. Also, 2n+3 is at most 5n. So 2n ≤ T(n) ≤ 5n. For n=4, this reads 8 ≤ 11 ≤ 20."
      },
      {
        "title": "Name what the bounds tell us",
        "text": "The upper bound gives O(n). The lower bound gives Ω(n). Having both gives Θ(n): linear growth. None of these says the count is exactly n."
      }
    ]
  },
  {
    "id": 40,
    "week": "1–4",
    "title": "Take a 10-minute break",
    "question": "Step away from the screen. We will continue with small examples.",
    "a": [
      "Take a break",
      "Stand up and rest."
    ],
    "b": [
      "Ready for the next part",
      "Have paper, a pen and a few small cards ready."
    ],
    "lesson": "This break is included in the three-hour lesson.",
    "check": "Use Next when you are ready to continue.",
    "answer": "There is no task to finish during the break.",
    "extra": "The times are a teaching guide, not a countdown. The page will not move on automatically.",
    "ref": "lecture-notes.html",
    "widget": "",
    "block": "Break",
    "minutes": 10,
    "start": 70,
    "end": 80
  },
  {
    "week": "3",
    "title": "The same values, in a different order",
    "question": "Sort four readings from smallest to largest.",
    "a": [
      "Already sorted: 1,2,3,4",
      "Insertion: 3 value comparisons, 0 shifts.\nSelection: 3+2+1=6 comparisons."
    ],
    "b": [
      "Reversed: 4,3,2,1",
      "Insertion: 6 comparisons, 6 shifts.\nSelection: still 6 comparisons."
    ],
    "lesson": "Insertion puts the next card into a sorted hand. Selection scans the remaining cards to find the smallest.",
    "check": "What stays true after each full insertion step?",
    "answer": "The processed left part is sorted and contains the same values that originally belonged to that part.",
    "ref": "../w3/",
    "extra": "We count value comparisons, not loop-bound checks. Selection needs a stronger fact: the left part is sorted AND none of its values is greater than a value on the right. “The left part is sorted” alone is not enough.",
    "widget": "",
    "id": 10,
    "block": "Sorting and reasoning",
    "minutes": 5,
    "start": 80,
    "end": 85,
    "walkthrough": [
      {
        "title": "Watch insertion on sorted cards",
        "text": "In 1,2,3,4, each new card is already after a smaller one. Check 2 against 1, 3 against 2, and 4 against 3. Nothing needs to shift."
      },
      {
        "title": "Reverse the cards",
        "text": "In 4,3,2,1, each new card must pass all earlier cards. The shifts are 1, then 2, then 3: 6 in total. Input order changes the work."
      },
      {
        "title": "Compare selection",
        "text": "Selection still looks through the remaining values to find the smallest. Its scans have 3, then 2, then 1 comparisons, even if the input is already sorted."
      }
    ]
  },
  {
    "id": 27,
    "week": "3",
    "title": "Move the cards and count the work",
    "question": "Use four cards: 3, 1, 4, 2. Build a sorted section on the left.",
    "a": [
      "Insertion: place the next card",
      "[3] → [1,3] → [1,3,4]\nThen put 2 between 1 and 3."
    ],
    "b": [
      "Selection: find the smallest left",
      "Choose 1, then 2, then 3.\nScan all remaining values each time."
    ],
    "lesson": "Count comparisons and shifts separately. They are different actions.",
    "check": "Sort 3,1,4,2 with each method. Then try 1,2,3,4.",
    "answer": "This insertion method uses 5 value comparisons and 3 shifts on the first input. Selection uses 6 comparisons. On sorted input, insertion uses 3; selection still uses 6.",
    "ref": "lecture-notes.html",
    "extra": "Insertion shifts values larger than the current key one place right. It stops at a smaller or equal value. Writing the key into its final position is not counted as a shift here.",
    "widget": "insertion",
    "block": "Sorting and reasoning",
    "minutes": 5,
    "start": 85,
    "end": 90,
    "walkthrough": [
      {
        "title": "Start with a one-card sorted part",
        "text": "For 3,1,4,2, the first card [3] is already sorted. Take the next card, 1. Compare it with 3, shift 3 right, and put 1 before it."
      },
      {
        "title": "Place the next cards",
        "text": "4 is already after 3, so it stays. To place 2, shift 4 and 3 right. Stop when you reach 1, then put 2 after it."
      },
      {
        "title": "Read the two counters",
        "text": "Comparisons ask whether one value is larger. Shifts move an old value one slot right. The mixed example has 5 comparisons but only 3 shifts; not every comparison causes a move."
      }
    ]
  },
  {
    "id": 29,
    "week": "3",
    "title": "Remember the largest value so far",
    "question": "Read 7, 2, 9, 4. Keep just one “largest so far” value.",
    "a": [
      "Keep the right fact",
      "Start: 7\nSee 2: keep 7\nSee 9: change to 9\nSee 4: keep 9"
    ],
    "b": [
      "Keep only the latest value",
      "7 → 2 → 9 → 4\nThe answer becomes 4. That is wrong."
    ],
    "lesson": "The saved value must be the largest value seen so far. This fact is called a loop invariant.",
    "check": "Try −5, −2, −8. Is it safe to start the saved value at 0?",
    "answer": "No. The answer should be −2, but 0 would remain. For a nonempty list, start with its first value.",
    "ref": "lecture-notes.html",
    "extra": "The first value is the maximum of a one-item list. Each comparison keeps the fact true. The scan stops after the last item. An empty list needs a separate rule.",
    "widget": "",
    "block": "Sorting and reasoning",
    "minutes": 5,
    "start": 90,
    "end": 95,
    "walkthrough": [
      {
        "title": "Choose a valid starting value",
        "text": "Start with the first reading, 7. It is the largest among the values seen so far because you have seen only one value."
      },
      {
        "title": "Update only when needed",
        "text": "2 is smaller than 7, so keep 7. 9 is larger, so save 9. 4 is smaller than 9, so keep 9. The final saved value is 9."
      },
      {
        "title": "State the fact that stays true",
        "text": "After every step, the saved value is the largest among the readings already seen. This repeated true statement is the loop invariant. It explains why the final answer works."
      }
    ]
  },
  {
    "week": "2–3",
    "title": "Faster now does not mean faster at every size",
    "question": "Two methods take A=10n and B=n² work units.",
    "a": [
      "n=4",
      "A: 40 units\nB: 16 units\nB does less work."
    ],
    "b": [
      "n=100",
      "A: 1,000 units\nB: 10,000 units\nA does less work."
    ],
    "lesson": "Linear growth does not guarantee less work on every small input. Here the counts meet at n=10.",
    "check": "If n doubles, what happens to n, n² and n³?",
    "answer": "They become 2, 4 and 8 times as large. log₂n increases by 1.",
    "ref": "../w2/#lesson",
    "extra": "For sufficiently large n, the growth order is 1, log n, n, n log n, n², n³, 2ⁿ, n!. Increasing n by 1 doubles 2ⁿ. A useful picture for n log n is about log n levels, each doing about n work.",
    "widget": "",
    "id": 11,
    "block": "Sorting and reasoning",
    "minutes": 5,
    "start": 95,
    "end": 100,
    "walkthrough": [
      {
        "title": "Use actual numbers first",
        "text": "At n=4, method A costs 10×4=40. Method B costs 4×4=16. B wins on this small input even though its growth is quadratic."
      },
      {
        "title": "Make the input larger",
        "text": "At n=100, A costs 1,000 and B costs 10,000. A now wins. The fixed factor 10 matters less than repeatedly multiplying n by itself."
      },
      {
        "title": "Read a growth label correctly",
        "text": "Θ(n) describes how work grows at large sizes. It is not a promise that the method wins at every small size or on every computer."
      }
    ]
  },
  {
    "id": 28,
    "week": "2–3",
    "title": "Different counts can have the same growth",
    "question": "Read all 8 measurements. Compare three work models.",
    "a": [
      "Actual counts",
      "A: 8 reads.\nB: 16 reads.\nC: 8 reads plus 100 setup units."
    ],
    "b": [
      "As the input grows",
      "n → Θ(n)\n2n → Θ(n)\nn+100 → Θ(n)"
    ],
    "lesson": "The same growth class does not mean the same count or the same running time.",
    "check": "Find C for n=4 and n=400. Do two examples prove Θ(n)?",
    "answer": "The counts are 104 and 500. Two examples do not prove it. But for all n≥100, n ≤ n+100 ≤ 2n does.",
    "ref": "lecture-notes.html",
    "extra": "Small examples help us see a pattern. A bound for every sufficiently large input explains why the pattern continues.",
    "widget": "",
    "block": "Sorting and reasoning",
    "minutes": 5,
    "start": 100,
    "end": 105,
    "walkthrough": [
      {
        "title": "Keep exact counts separate",
        "text": "For n=8, A does 8 units, B does 16, and C does 108. These are plainly different amounts of work."
      },
      {
        "title": "Change the input size",
        "text": "Each extra item adds 1 unit to A, 2 to B, and 1 to C. The setup of 100 in C does not grow with the number of items."
      },
      {
        "title": "Recognize the shared pattern",
        "text": "All three have linear growth, Θ(n). This groups their growth patterns without claiming that their exact counts or real running times match."
      }
    ]
  },
  {
    "week": "4",
    "title": "Numbered slots or a chain of addresses?",
    "question": "Store 8 parts. Get the sixth part, or add a new part at the front.",
    "a": [
      "Array: numbered slots",
      "Calculate the location of the sixth item.\nTo insert at the front, shift 8 items."
    ],
    "b": [
      "Linked list: follow the next address",
      "Follow links to reach the sixth item.\nTo add at the front, change a few links."
    ],
    "lesson": "Choose a structure for the operations you need most. There is no single best structure for every job.",
    "check": "Does deleting the value 30 from a linked list always take constant work?",
    "answer": "No. Finding it may take Θ(n) in the worst case. Once the needed nodes are known, updating the links takes O(1).",
    "ref": "lecture-notes.html#topic-2-2",
    "extra": "For a singly linked list, deletion usually needs the previous node too. A doubly linked node stores both previous and next links, using more memory. A sentinel is a dummy node that reduces special cases. The new node is assumed to be allocated already.",
    "widget": "",
    "id": 12,
    "block": "Data structures",
    "minutes": 4,
    "start": 105,
    "end": 109,
    "walkthrough": [
      {
        "title": "Follow an array access",
        "text": "An array has fixed-size numbered slots. Knowing the position lets the computer calculate its address directly. It does not need to walk through earlier slots."
      },
      {
        "title": "Follow a linked-list access",
        "text": "A node stores a value and the address of the next node. To reach the sixth node from the first, follow five links. Adding at the front instead needs only a few link changes."
      },
      {
        "title": "Separate finding from changing",
        "text": "Finding the place may be slow. Changing links at an already-known place may be quick. A claim about one step does not automatically describe the whole operation."
      }
    ]
  },
  {
    "id": 30,
    "week": "4",
    "title": "Knowing a position is not the same as searching",
    "question": "Get the item in slot 8. Then find the item labelled “Alex”.",
    "a": [
      "You know its position",
      "Calculate the address of a fixed-size array slot.\nOne access."
    ],
    "b": [
      "You know only its label",
      "Without an extra search structure, read labels.\nYou may need to inspect every item."
    ],
    "lesson": "Constant-time array access does not make every value search constant-time.",
    "check": "Write six labels. Compare looking up a position with looking up a name.",
    "answer": "Position access is Θ(1). A plain value search is Θ(n) in the worst case. A sorted array also allows binary search.",
    "ref": "lecture-notes.html",
    "extra": "This is a memory model, not a claim about walking time in a warehouse. Array slots have a fixed size, and label comparisons are treated as constant-cost operations.",
    "widget": "",
    "block": "Data structures",
    "minutes": 4,
    "start": 109,
    "end": 113,
    "walkthrough": [
      {
        "title": "Use a position",
        "text": "Slot 8 gives a location. With fixed-size array slots, the computer calculates that address and reads the item."
      },
      {
        "title": "Use a name instead",
        "text": "The name Alex does not tell you a slot number. Without an extra index, check labels until you find it or reach the end."
      },
      {
        "title": "Explain the difference",
        "text": "An array gives fast access to a known position. It does not automatically give fast search for an unknown position. “Access” and “search” are different tasks."
      }
    ]
  },
  {
    "week": "4",
    "title": "Do you search more often, or insert more often?",
    "question": "Store part codes. You need to find, add and remove codes.",
    "a": [
      "Unsorted array",
      "Search: up to n checks.\nAppend: constant work if there is space."
    ],
    "b": [
      "Sorted array",
      "Search: logarithmic work with binary search.\nInsert in order: up to n shifts."
    ],
    "lesson": "A sorted array can be a good choice for many searches and few updates. Name the frequent operation first.",
    "check": "Can deletion be cheap in an unsorted array if order does not matter?",
    "answer": "If the position is known, move the last item into the gap and reduce the size. Finding that position may still take n checks.",
    "ref": "lecture-notes.html#topic-1-4",
    "extra": "We assume spare capacity for a constant-time append and no resizing during this deletion. In a nonempty sorted array, the minimum is first and the maximum is last. In an unsorted array, finding the minimum needs a full scan.",
    "widget": "",
    "id": 13,
    "block": "Data structures",
    "minutes": 4,
    "start": 113,
    "end": 117,
    "walkthrough": [
      {
        "title": "Search the unsorted version",
        "text": "If codes have no order, a failed search may inspect every code. Adding a new code at the end is easy if there is spare capacity."
      },
      {
        "title": "Search the sorted version",
        "text": "Sorted codes let binary search remove a large part of the search area. But a new code may belong near the front, forcing later codes to shift."
      },
      {
        "title": "Choose for the workload",
        "text": "Many searches and few updates can make sorted storage useful. Many middle insertions can make those shifts expensive. Say which operation happens often before choosing."
      }
    ]
  },
  {
    "week": "4",
    "title": "When storage fills, add one slot or double it?",
    "question": "Start with an empty array of capacity 1. Append 8 readings at the END.",
    "a": [
      "Add one slot each time",
      "Old items copied: 1+2+3+4+5+6+7=28.\nWrite 8 new items.\nTotal: 36."
    ],
    "b": [
      "Double the capacity",
      "Old items copied: 1+2+4=7.\nWrite 8 new items.\nTotal: 15."
    ],
    "lesson": "Doubling gives Θ(n) total work for n appends: amortized O(1) per append. Inserting in the middle can still require shifts.",
    "check": "Does amortized O(1) mean every append is quick?",
    "answer": "No. An append that copies the array can take Θ(n). Amortized analysis spreads total work across a sequence; it does not need probabilities.",
    "ref": "lecture-notes.html#topic-3-1",
    "extra": "The counts include only item copies and new-item writes, not allocation or control overhead. Growing by a fixed amount such as 10 gives Θ(n²) total copies. Doubling uses extra empty space to reduce copying.",
    "widget": "resize",
    "id": 14,
    "block": "Data structures",
    "minutes": 4,
    "start": 117,
    "end": 121,
    "walkthrough": [
      {
        "title": "Fill the first slot",
        "text": "Capacity means available space, not the number of stored items. Start with space for 1. The first append writes one item without copying old items."
      },
      {
        "title": "Follow doubling",
        "text": "The second item needs capacity 2: copy 1 old item. The third needs capacity 4: copy 2. The fifth needs capacity 8: copy 4. Up to 8 items, old copies total 1+2+4=7."
      },
      {
        "title": "Count the whole sequence",
        "text": "Also write each of the 8 new items once: 7+8=15 actions. Some appends are expensive, but total work grows linearly. Amortized cost describes this whole-sequence accounting, not the worst single append."
      }
    ]
  },
  {
    "week": "4",
    "title": "Last in, or first in?",
    "question": "A arrives, then B, then C. Remove one item.",
    "a": [
      "Stack: a pile of plates",
      "A → B → C\nC leaves first: LIFO.\nUndo the most recent action first."
    ],
    "b": [
      "Queue: a waiting line",
      "A → B → C\nA leaves first: FIFO.\nServe the first arrival first."
    ],
    "lesson": "Stack and queue rules tell us the removal order. Arrays or linked lists can implement those rules.",
    "check": "How can two stacks act as a queue?",
    "answer": "Push A,B,C onto the input stack. When the output stack is empty, move all items across: C,B,A. Now A is on top. Each item moves across once.",
    "ref": "lecture-notes.html#topic-5-3",
    "extra": "This gives amortized O(1) operations with constant-cost stack operations. A single transfer can take Θ(n). Stacks support depth-first exploration; queues support breadth-first exploration. The order makes the difference.",
    "widget": "order",
    "id": 15,
    "block": "Data structures",
    "minutes": 4,
    "start": 121,
    "end": 125,
    "walkthrough": [
      {
        "title": "Read the same arrivals",
        "text": "A arrives first, then B, then C. A stack puts the newest item on top. A queue keeps the oldest item at the front."
      },
      {
        "title": "Remove one item",
        "text": "The stack removes C, the latest arrival. The queue removes A, the earliest arrival. Nothing about the values changed; only the removal rule changed."
      },
      {
        "title": "Match the rule to the job",
        "text": "Undo usually needs the latest saved action first. A waiting line usually needs the earliest arrival first. That is why one uses a stack and the other a queue."
      }
    ]
  },
  {
    "id": 31,
    "week": "4",
    "title": "Undo commands or print files?",
    "question": "A, B and C arrive in that order. Remove two items.",
    "a": [
      "Undo commands",
      "Undo C, then B.\nUse a stack."
    ],
    "b": [
      "Print waiting files",
      "Print A, then B.\nUse a queue."
    ],
    "lesson": "The same input can need a different output order because the purpose is different.",
    "check": "Add A,B; remove one; add C; remove the rest. Write the output for each structure.",
    "answer": "Stack: B,C,A. Queue: A,B,C.",
    "ref": "lecture-notes.html",
    "extra": "Undo requires a reversible operation and enough saved state. A stack gives an order; it does not guarantee that a physical robot motion is safe to reverse.",
    "widget": "",
    "block": "Data structures",
    "minutes": 4,
    "start": 125,
    "end": 129,
    "walkthrough": [
      {
        "title": "Follow the stack sequence",
        "text": "Add A then B. Remove B because it arrived last. Add C. Remove C, then A. The output order is B,C,A."
      },
      {
        "title": "Follow the queue sequence",
        "text": "Add A then B. Remove A because it arrived first. Add C behind B. Remove B, then C. The output order is A,B,C."
      },
      {
        "title": "Keep arrival and removal separate",
        "text": "Both structures received the same items in the same order. Different removal rules produce different results. Choose the rule that matches the application."
      }
    ]
  },
  {
    "week": "4",
    "title": "Three small uses of a stack",
    "question": "A stack lets you return to the most recent unfinished task.",
    "a": [
      "Check brackets",
      "([ ]) is valid: close [ before (.\n([ )] fails: ) arrives while [ is on top."
    ],
    "b": [
      "Read postfix: 3 4 + 2 ×",
      "Push 3 and 4. Add them to get 7.\nPush 2. Multiply to get 14."
    ],
    "lesson": "To track the minimum, save the minimum so far with each entry. For 5,3,7, save 5,3,3. Pop 7 and the minimum is still 3.",
    "check": "Push 100 items, then remove them all with one multi-pop. How much item work is done?",
    "answer": "100 pushes and 100 removals: 200 item actions. The final call is expensive, but each item is pushed and removed only once.",
    "ref": "lecture-notes.html#topic-4-1",
    "extra": "In postfix, the first popped value is the right operand: 8 2 − means 8−2. Bracket checking must finish with an empty stack and reject unmatched closings. Starting empty, m push/pop/multi-pop calls take O(m) total under constant-cost basic operations. With N initial items, use O(m+N).",
    "widget": "",
    "id": 16,
    "block": "Data structures",
    "minutes": 4,
    "start": 129,
    "end": 133,
    "walkthrough": [
      {
        "title": "Use the stack for brackets",
        "text": "Read an opening bracket and push it. At a closing bracket, check the top. In ([ )], the ) needs a (, but the top is [. That is the error."
      },
      {
        "title": "Use the stack for a calculation",
        "text": "In 3 4 + 2 ×, push 3 and 4. The + removes them and pushes 7. Push 2. The × removes 7 and 2 and pushes 14."
      },
      {
        "title": "See the common idea",
        "text": "The next action needs the most recent saved information. The stack keeps that information ready on top. For subtraction, remember that pop order determines left and right operands."
      }
    ]
  },
  {
    "week": "4",
    "title": "Keep only the last three readings",
    "question": "The sensor sends 10, 20, 30, then 40. Keep the last three.",
    "a": [
      "Shift and add again",
      "10,20,30 → 20,30,40\nFor a large window, move and reread many items."
    ],
    "b": [
      "Ring buffer plus a running sum",
      "Replace the old 10 with 40.\nSum: 60−10+40=90.\nAverage: 90/3=30."
    ],
    "lesson": "Physical slots may hold 40,20,30 while the time order is 20,30,40. A start position tells us where the oldest reading is.",
    "check": "After just 10 and 20 arrive, should we divide by 3?",
    "answer": "No. There are only two valid readings: (10+20)/2=15. Divide by the number actually stored.",
    "ref": "lecture-notes.html#topic-6-3",
    "extra": "For capacity 3, the next position is (i+1) % 3: 0→1→2→0. A count, flag or spare slot distinguishes full from empty. Overwriting the oldest item is a deliberate policy here; it is not suitable for every application.",
    "widget": "sensor",
    "id": 17,
    "block": "Data structures",
    "minutes": 4,
    "start": 133,
    "end": 137,
    "walkthrough": [
      {
        "title": "Fill the window",
        "text": "After 10,20,30, the three slots are full. The sum is 60. To keep only the latest three readings, the next reading must replace the oldest one, 10."
      },
      {
        "title": "Update the total",
        "text": "When 40 arrives, subtract 10 from 60 and add 40. The new sum is 90. There are still 3 readings, so the average is 90÷3=30."
      },
      {
        "title": "Read the slots in time order",
        "text": "The memory slots now show 40,20,30. Start at the oldest slot to read 20,30,40. Moving the start position avoids shifting every stored item."
      }
    ]
  },
  {
    "id": 32,
    "week": "4",
    "title": "Can a rare slow append miss a deadline?",
    "question": "Most sensor appends are cheap. Sometimes the whole array must move.",
    "a": [
      "Build a report",
      "Total work matters.\nA growing array may be suitable."
    ],
    "b": [
      "Handle a tight time limit",
      "One slow append may be too late.\nConsider storage allocated in advance."
    ],
    "lesson": "Amortized O(1) is not a worst-case bound for every call. Ask which delay matters.",
    "check": "What should happen when a fixed buffer fills? Compare a live display with a lossless recorder.",
    "answer": "A live display may discard old readings. A lossless recorder must prevent or handle overflow without silently losing required data.",
    "ref": "lecture-notes.html",
    "extra": "A real deadline needs more than a growth class: hardware, allocation, scheduling and maximum input sizes matter. This example explains why total cost alone is not enough.",
    "widget": "",
    "block": "Data structures",
    "minutes": 3,
    "start": 137,
    "end": 140,
    "walkthrough": [
      {
        "title": "Look at a typical append",
        "text": "If a growing array has free space, writing the new reading is cheap. Many appends look like this."
      },
      {
        "title": "Look at the resize append",
        "text": "When it fills, one append may allocate more space and copy all old readings. Even if total work is good, this one call can be slow."
      },
      {
        "title": "Ask the timing question",
        "text": "A report may care about total completion time. A task with a tight deadline also cares about the slowest call. An amortized bound alone does not answer that second question."
      }
    ]
  },
  {
    "id": 43,
    "week": "1–4",
    "title": "Take a 10-minute break",
    "question": "Step away from the screen. We will continue with small examples.",
    "a": [
      "Take a break",
      "Stand up and rest."
    ],
    "b": [
      "Ready for the next part",
      "Have paper, a pen and a few small cards ready."
    ],
    "lesson": "This break is included in the three-hour lesson.",
    "check": "Use Next when you are ready to continue.",
    "answer": "There is no task to finish during the break.",
    "extra": "The times are a teaching guide, not a countdown. The page will not move on automatically.",
    "ref": "lecture-notes.html",
    "widget": "",
    "block": "Break",
    "minutes": 10,
    "start": 140,
    "end": 150
  },
  {
    "id": 33,
    "week": "4",
    "title": "Sensor exercise: update the window by hand",
    "question": "Read 4, 8, 12, 16. Draw three slots. Record the sum and average after each arrival.",
    "a": [
      "Add the current readings again",
      "4 → average 4\n4,8 → 6\n4,8,12 → 8\n8,12,16 → 12"
    ],
    "b": [
      "Update the saved sum",
      "4\n4+8=12\n12+12=24\n24−4+16=36 → average 12"
    ],
    "lesson": "Both methods give the same answer. Updating the sum avoids scanning the whole window each time.",
    "check": "Repeat with a two-slot window. Then use three slots for 4,4,4,20.",
    "answer": "Two slots: averages 4,6,10,14. Three slots for the second input: 4,4,4,28/3≈9.33.",
    "ref": "lecture-notes.html",
    "extra": "Draw both the physical slots and the readings from oldest to newest. Real floating-point sums can accumulate rounding error. These small integer sums are exact; the displayed decimal average may be rounded.",
    "widget": "",
    "block": "Sensor and design practice",
    "minutes": 7,
    "start": 150,
    "end": 157,
    "walkthrough": [
      {
        "title": "Build the first window",
        "text": "The first reading 4 gives average 4. Then 4 and 8 give sum 12 and average 6. With 12 added, sum 24 divided by 3 gives 8."
      },
      {
        "title": "Slide the full window",
        "text": "When 16 arrives, drop 4. Keep 8,12,16. Update the sum: 24−4+16=36. Divide by 3 to get 12."
      },
      {
        "title": "Try the changed case",
        "text": "With only two slots, the final readings are 12 and 16, so the final average is 14. Window size changes which readings remain, and therefore changes the answer."
      }
    ]
  },
  {
    "id": 34,
    "week": "4",
    "title": "Choose a structure for the job",
    "question": "A factory application has three tasks.",
    "a": [
      "The tasks",
      "1. Undo the last command.\n2. Test parts in arrival order.\n3. Display the last 100 temperatures."
    ],
    "b": [
      "Starting choices",
      "1. Stack: last in, first out.\n2. Queue: first in, first out.\n3. Ring buffer: a fixed recent window."
    ],
    "lesson": "Explain the frequent operation, the removal order, and what happens when storage fills.",
    "check": "Could all three be built using arrays?",
    "answer": "Yes. Stack and queue are rules for operations. An array can implement them. Index and capacity choices determine the cost.",
    "ref": "lecture-notes.html",
    "extra": "These are reasonable starting designs, not the only possible designs. State your assumptions and explain the tradeoff.",
    "widget": "",
    "block": "Sensor and design practice",
    "minutes": 7,
    "start": 157,
    "end": 164,
    "walkthrough": [
      {
        "title": "Identify the item needed next",
        "text": "Undo needs the latest saved command. A test line needs the oldest waiting part. A live graph needs only a recent window of temperatures."
      },
      {
        "title": "Choose the rule",
        "text": "Use a stack for latest-first, a queue for oldest-first, and a ring buffer for the fixed recent window. These choices follow from the required behavior."
      },
      {
        "title": "Choose how to store it",
        "text": "An array can implement these rules. You still need to decide where to read, where to write, and what to do when storage fills. Naming a structure is only the first design step."
      }
    ]
  },
  {
    "id": 35,
    "week": "1–4",
    "title": "Search an archive of part codes",
    "question": "Load 10,000 codes once. Search them many times. Updates are rare.",
    "a": [
      "Keep them unsorted",
      "Easy to load.\nEach search may scan all the codes."
    ],
    "b": [
      "Sort once",
      "Pay an initial sorting cost.\nThen use binary search for later lookups."
    ],
    "lesson": "Count both setup work and repeated work. The number of searches matters.",
    "check": "Now suppose there are many insertions in the middle and very few searches. Does the first choice still follow?",
    "answer": "No. Maintaining sorted order can require many shifts. Reconsider which operation happens most often.",
    "ref": "lecture-notes.html",
    "extra": "Assume fast array access and fixed-cost code comparisons. The best choice can change when the workload changes.",
    "widget": "",
    "block": "Sensor and design practice",
    "minutes": 6,
    "start": 164,
    "end": 170,
    "walkthrough": [
      {
        "title": "Count repeated searches",
        "text": "An unsorted archive may need to check all 10,000 codes on each failed lookup. Repeating that search many times repeats the large scan."
      },
      {
        "title": "Pay for preparation once",
        "text": "Sorting takes work at the start. Afterward, binary search can inspect far fewer codes per lookup because it uses the order."
      },
      {
        "title": "Change the workload",
        "text": "If updates become frequent, keeping the array sorted can cause many shifts. The best tradeoff depends on how often searches and updates happen, not just the number of codes."
      }
    ]
  },
  {
    "week": "1–4",
    "title": "Quick check: explain the action first",
    "question": "Use everyday words first. Add the symbol only after the explanation.",
    "a": [
      "Four questions",
      "1. Scan 20 sensors, then 40.\n2. Double a sorted array; keep halving the search.\n3. Serve the first arrival first.\n4. Put 17 parts in boxes holding 5."
    ],
    "b": [
      "Answers with reasons",
      "1. Twice the checks: Θ(n).\n2. About one extra search step: Θ(log n).\n3. Queue: FIFO.\n4. ⌈17/5⌉=4 boxes."
    ],
    "lesson": "Ask: Is the result correct? What work am I counting? How does that work change when the input grows?",
    "check": "Which answer can you explain without using its symbol?",
    "answer": "Use 4 objects, then 8. Do the actions and count them. After that, name the growth pattern.",
    "ref": "lecture-notes.html",
    "extra": "These are checks of understanding, not a timed exam. If an answer is wrong, separate a misunderstood task from a counting error or an unfamiliar symbol.",
    "widget": "",
    "id": 18,
    "block": "Final check",
    "minutes": 5,
    "start": 170,
    "end": 175,
    "walkthrough": [
      {
        "title": "Start with the action",
        "text": "Scanning means visiting every sensor. Serving arrivals means choosing the oldest waiting item. Packing means providing enough total space."
      },
      {
        "title": "Use a small count",
        "text": "20 sensors need 20 checks; 40 need 40. Three boxes hold only 15 parts, so 17 parts need a fourth box."
      },
      {
        "title": "Add the name afterward",
        "text": "The scan has linear growth. Oldest-first is FIFO. Rounding up gives enough boxes. The names summarize actions you can already explain."
      }
    ]
  },
  {
    "id": 36,
    "week": "1–4",
    "title": "One last check with new numbers",
    "question": "Write your answers and one short reason for each.",
    "a": [
      "Questions",
      "1. Two full scans: 9 items, then 18.\n2. 22 people, 6 seats per vehicle.\n3. Undo the latest saved setting."
    ],
    "b": [
      "Answers",
      "1. 18 actions, then 36: twice the work.\n2. ⌈22/6⌉=4 vehicles.\n3. Stack: last action first."
    ],
    "lesson": "Does Θ(n) mean exactly n steps? Use 2n+3 to explain.",
    "check": "Choose one idea you found difficult. Make a new example with different numbers.",
    "answer": "No. For n≥1, 2n ≤ 2n+3 ≤ 5n. This gives Θ(n), even though the exact count is not n.",
    "ref": "lecture-notes.html",
    "extra": "In your new example, state what n means and what one unit of work means. Then check a small input by hand.",
    "widget": "",
    "block": "Final check",
    "minutes": 5,
    "start": 175,
    "end": 180,
    "walkthrough": [
      {
        "title": "Do the arithmetic",
        "text": "Two scans of 9 items mean 9+9=18 actions. Two scans of 18 mean 18+18=36. For 22 people, three 6-seat vehicles leave 4 people without seats."
      },
      {
        "title": "Explain the rule",
        "text": "So use 4 vehicles. For undo, take the latest saved setting first. These answers come from the job requirement, not from memorizing a symbol."
      },
      {
        "title": "Check the growth statement",
        "text": "2n+3 is not exactly n. It still lies between 2n and 5n for all n≥1. This is why Θ(n) describes growth rather than an exact step count."
      }
    ]
  }
];
