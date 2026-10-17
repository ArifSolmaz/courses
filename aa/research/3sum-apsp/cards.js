/* Original classroom examples; research explanations adapted from the cited CC BY 4.0 paper. */
const caseCards = [
  {
    "title": "A tiny number. A much bigger question.",
    "lead": "Can an AI help find a new way to solve an old problem? First separate three different achievements.",
    "visual": "flow",
    "nodes": [
      "Solve one example",
      "Find a method for every valid input",
      "Prove a better growth bound"
    ],
    "steps": [
      {
        "title": "One answer",
        "text": "Finding three numbers that add to zero solves one instance. It does not tell us how hard the next list will be."
      },
      {
        "title": "One algorithm",
        "text": "An algorithm must work for all inputs covered by its assumptions. We count how its work grows as inputs get larger."
      },
      {
        "title": "One research result",
        "text": "This paper reports faster algorithms, not newly solvable problems. The surprise is a fixed improvement in the exponent, with consequences for other problems."
      }
    ],
    "take": "Our question: what changed in the method, the evidence and the connections between problems?",
    "question": "Does solving a very large example prove a faster algorithm?",
    "answer": "No. A general correctness argument and a running-time bound are needed.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "Abstract; §1"
  },
  {
    "title": "3SUM: can three different readings balance?",
    "lead": "Choose three positions in a list. Do their values add to zero? Negative readings are allowed.",
    "visual": "triples",
    "nodes": [],
    "steps": [
      {
        "title": "Read the question",
        "text": "For [-5, 2, 3, 7], the first three readings give -5 + 2 + 3 = 0. The answer is yes. A reading cannot be reused from the same position."
      },
      {
        "title": "Understand the output",
        "text": "The decision problem asks yes or no. Showing a matching triple is a useful classroom illustration, but is more output than a decision answer requires."
      },
      {
        "title": "Know what n means",
        "text": "n is the number of readings, not the size of their sum. The paper’s integer bound assumes values whose magnitude is at most a fixed power of n."
      }
    ],
    "take": "These tiny lists explain the problem; this control uses ordinary enumeration, not the new algorithm.",
    "question": "For [-5, 2, 4, 7], is there a zero-sum triple?",
    "answer": "No. The four possible sums are 1, 4, 6 and 13.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1; Theorem 22"
  },
  {
    "title": "Why does Week 5 hashing not already solve it?",
    "lead": "A fast lookup helps, but we may still ask too many questions.",
    "visual": "flow",
    "nodes": [
      "Choose a pair a, b",
      "Look up −(a+b)",
      "Repeat for many pairs"
    ],
    "steps": [
      {
        "title": "Try the obvious method",
        "text": "Store the values in a hash table. For a chosen pair, look for the negative of their sum. Keep position or frequency information so that three distinct positions are used."
      },
      {
        "title": "Count the repeated work",
        "text": "There are n(n−1)/2 unordered pairs. Even with expected constant-time lookups under suitable hashing assumptions, checking all pairs gives quadratic work."
      },
      {
        "title": "Compare with another method",
        "text": "Sorting and using two moving pointers for each fixed first value also gives O(n²) time. Faster lookups alone do not remove the quadratic number of pairs."
      }
    ],
    "take": "Making one action cheap is different from reducing how many actions we need.",
    "question": "If each lookup is twice as fast, have we reduced the exponent?",
    "answer": "No. Half of n² is still quadratic. That changes a constant factor.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1: 3SUM; classroom connection to Week 5"
  },
  {
    "title": "APSP: every station needs a distance to every station",
    "lead": "A factory has directed routes. Find the shortest travel distance for every ordered pair of stations.",
    "visual": "route",
    "nodes": [],
    "steps": [
      {
        "title": "Try one pair",
        "text": "A→C costs 9 directly. A→B costs 2 and B→C costs 3. Going through B costs 5, which is better."
      },
      {
        "title": "Repeat the question",
        "text": "APSP asks about all ordered pairs, not only A→C. Its output is a table of distances; unreachable pairs can have distance infinity."
      },
      {
        "title": "See the textbook count",
        "text": "Floyd–Warshall considers each possible intermediate station k for each pair i,j. Three loops over n stations give O(n³). Our three-station picture illustrates one update, not the new algorithm."
      }
    ],
    "take": "The paper covers directed graphs with polynomially bounded integer weights; shortest distances assume no negative cycles.",
    "question": "Does a route with fewer edges always have a smaller total cost?",
    "answer": "No. The one-edge route costs 9; the two-edge route costs 5. BFS alone does not solve this weighted problem.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1: APSP; Theorem 22"
  },
  {
    "title": "The old claim was a hypothesis, not a proven wall",
    "lead": "“We know how to do this” and “no one can do better” are different claims.",
    "visual": "flow",
    "nodes": [
      "Known method: O(n²)",
      "Hypothesis: no O(n²⁻ε) for fixed ε > 0",
      "New result: ε = 0.0008"
    ],
    "steps": [
      {
        "title": "An upper bound",
        "text": "An O(n²) algorithm gives a way to solve the problem. It does not prove that every possible method needs that much work."
      },
      {
        "title": "The hypothesis",
        "text": "The 3SUM hypothesis ruled out a fixed positive saving in the exponent in the stated model. The APSP hypothesis made the analogous claim below exponent 3."
      },
      {
        "title": "Why the new bound conflicts",
        "text": "1.9992 = 2 − 0.0008. The saving is small, but fixed: it does not shrink toward zero as n grows. This is enough to contradict the 3SUM hypothesis."
      }
    ],
    "take": "A conjecture can guide research for years and still turn out to be false.",
    "question": "Would O(n² / log n) cross exactly the same boundary?",
    "answer": "No. It improves on n², but not by a fixed power n^ε. Earlier improvements of that sort did not settle the hypothesis.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1: fine-grained hypotheses"
  },
  {
    "title": "Small exponent change does not promise a faster laptop run",
    "lead": "Move the input-size slider. This compares powers only; it is not a benchmark.",
    "visual": "exponent",
    "nodes": [],
    "steps": [
      {
        "title": "Read the ratio",
        "text": "For 3SUM, n² divided by n^1.9992 equals n^0.0008. At n = one billion, the old power is only about 1.0167 times the new power."
      },
      {
        "title": "Remember the missing costs",
        "text": "An O bound hides constant factors and lower-order work. A more complicated algorithm can be slower for practical input sizes even when its exponent is smaller."
      },
      {
        "title": "Separate the two questions",
        "text": "Theory asks whether the claimed barrier can be crossed. Engineering asks whether a particular implementation saves time, memory or energy on our actual workload."
      }
    ],
    "take": "The research significance comes from the fixed exponent saving and the technique, not a demonstrated percentage speedup on a PC.",
    "question": "If the new method had a constant factor 100 times larger, would the billion-input comparison prove it faster?",
    "answer": "No. In that made-up cost model the ratio would be n^0.0008 / 100, about 0.01017. The new method would be much slower at that size.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "Abstract; teaching calculation from the stated exponents"
  },
  {
    "title": "A reduction is a translation with a cost",
    "lead": "Imagine translating a factory question into a form that another solver understands.",
    "visual": "flow",
    "nodes": [
      "Problem A",
      "Translate input",
      "Solve problem B",
      "Translate answer"
    ],
    "steps": [
      {
        "title": "Keep the answer",
        "text": "A correct reduction preserves what we need to know: the answer to B must let us recover the answer to A."
      },
      {
        "title": "Pay for translation",
        "text": "If translation makes the instance enormous or takes too long, a faster B solver may not help A. A fine-grained reduction controls these costs carefully."
      },
      {
        "title": "Read the arrow correctly",
        "text": "A → B means we can solve A using a solver for B. A faster B can help A. A faster A does not automatically give a faster B."
      }
    ],
    "take": "The arrows are algorithms, not just statements that two topics look similar.",
    "question": "If B gets faster, is every problem in computer science now faster?",
    "answer": "No. We need an appropriate reduction and a cost analysis for each claimed consequence.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1; §1.2"
  },
  {
    "title": "The paper finds a shared route through several problems",
    "lead": "Different-looking questions can lead to the same smaller computational task.",
    "visual": "flow",
    "nodes": [
      "3SUM / APSP",
      "Exact Triangle",
      "Sparse, lopsided triangle tasks",
      "Selected entries of a thin matrix product"
    ],
    "steps": [
      {
        "title": "An intermediate question",
        "text": "Exact Triangle asks whether a graph contains a triangle whose three edge weights sum to zero. It is not the same as merely asking whether any triangle exists."
      },
      {
        "title": "A different triangle task",
        "text": "The sparse-triangle task asks, for specified edges, whether each belongs to a triangle. Lopsided means one of the three vertex groups is much smaller than the other two."
      },
      {
        "title": "Why this route matters",
        "text": "The paper combines reductions with a faster way to compute selected matrix-product entries. The savings survive the translations and yield faster algorithms for 3SUM and APSP."
      }
    ],
    "take": "This is a conceptual route map. Each arrow hides a construction and a proof; the small pictures do not prove the reductions.",
    "question": "Where does the benefit travel when the rightmost solver improves?",
    "answer": "Back along the reductions toward the problems that use it, provided the translation costs permit the saving.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§3, especially §3.1–3.4"
  },
  {
    "title": "A matrix can count shared connections",
    "lead": "Two machines may connect through a middle station. We can record connections using 0 and 1.",
    "visual": "matrix",
    "nodes": [],
    "steps": [
      {
        "title": "Read the two tables",
        "text": "X says which left stations reach each middle station. Y says which middle stations reach each right station. A 1 means an edge exists; 0 means it does not."
      },
      {
        "title": "Calculate one output",
        "text": "For L1→R1, multiply matching entries and add: 1×1 + 0×1 = 1. There is one two-edge walk through the middle group."
      },
      {
        "title": "Make the triangle connection",
        "text": "If an L1–R1 closing edge also exists, a shared middle neighbour gives a triangle. An output greater than zero detects that shared neighbour. Here there are no edge weights; the earlier reduction handles the weighted problem."
      }
    ],
    "take": "This small 4×2 by 2×4 example teaches the representation. It does not satisfy the paper’s large thin-matrix regime and demonstrates no speedup.",
    "question": "If an output entry is zero, is there a two-edge walk through this middle group?",
    "answer": "No. No middle station has both required connections. Other routes outside this two-layer model are not being tested.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1.1; §2"
  },
  {
    "title": "Only some answers are requested",
    "lead": "A full result table has N² positions. Suppose we only want the highlighted ones.",
    "visual": "wanted",
    "nodes": [],
    "steps": [
      {
        "title": "Name W",
        "text": "W is the set of requested output positions. A sparse set means relatively few entries are requested, even if the input matrices themselves are dense."
      },
      {
        "title": "Two obvious choices",
        "text": "Compute the whole product and throw most entries away, or calculate each requested row–column dot product separately."
      },
      {
        "title": "The research question",
        "text": "Can we reuse the hidden arithmetic between requested entries without doing the work for every unwanted entry? Merely hiding cells on the screen would save no computation."
      }
    ],
    "take": "The theorem beats both obvious choices in its stated parameter range. Selecting a few cells alone is not the new algorithm.",
    "question": "Can we claim subquadratic time while still explicitly printing all N² entries?",
    "answer": "No, not in a model that charges for writing every output entry. The theorem asks for only the entries in W.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "Theorem 5; §2.4"
  },
  {
    "title": "Prepare once. Reuse the preparation.",
    "lead": "Before multiplying, an algebraic algorithm forms combinations of input values. The paper calls this encoding.",
    "visual": "flow",
    "nodes": [
      "Prepare X block once",
      "Reuse with Y block 1",
      "Reuse with Y block 2",
      "Reuse with Y block 3"
    ],
    "steps": [
      {
        "title": "Think of a factory setup",
        "text": "If one calibration belongs only to a machine, repeating it for every work order wastes effort. This is an analogy for reuse, not a timing model for the theorem."
      },
      {
        "title": "What is actually shared",
        "text": "The arithmetic preparation for an X block depends on that X block alone. The same prepared values can be used when it is paired with several Y blocks. The same idea applies to Y. The construction adapts Coppersmith’s rectangular multiplication approach, using an algebraic identity due to Schönhage; it builds on earlier mathematics."
      },
      {
        "title": "Why preparation matters",
        "text": "Skipping some multiplications would be useless if preparation already cost too much. The proof counts this cost too, and the thin shape helps keep it under control."
      }
    ],
    "take": "A correct speed analysis includes setup, useful calculations and assembly of the answers.",
    "question": "If we save 10 calculations but repeat a setup costing 1,000, have we shown a net saving?",
    "answer": "No. Count the complete procedure, including the repeated preparation.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§2.4.1: sharing the encoding"
  },
  {
    "title": "Keep shared work. Skip irrelevant work.",
    "lead": "Select an output. Highlight the calculations it needs. This is a toy dependency diagram.",
    "visual": "sharing",
    "nodes": [],
    "steps": [
      {
        "title": "Follow dependencies",
        "text": "An output may depend on several intermediate calculations. We must keep all of those calculations, even when some are also used by another output."
      },
      {
        "title": "Count the union",
        "text": "If A needs {u,v,a} and B needs {u,v,b}, together they need four distinct calculations, not six. The shared u and v need be computed only once."
      },
      {
        "title": "The difficult proof",
        "text": "The paper prunes an algebraic recursion and proves that the union of needed leaves is small enough. It also counts encoding and decoding. The picture explains the question the proof answers; it is not the actual recursion."
      }
    ],
    "take": "The hard part is proving enough work can be skipped for every allowed requested set, not showing that one friendly example saves work.",
    "question": "Do two requested outputs always require twice the work of one?",
    "answer": "No. They may share dependencies. But if dependencies barely overlap, savings may be small; that is why a general counting proof is necessary.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§2.4.2–2.4.4"
  },
  {
    "title": "Read the central theorem one symbol at a time",
    "lead": "You do not need to reproduce the proof. Learn how to read its promise and its conditions.",
    "visual": "formula",
    "nodes": [
      "X: N × D",
      "Y: D × N",
      "Wanted: |W| ≤ N² / √D",
      "Work: O(N² / D^0.063)"
    ],
    "steps": [
      {
        "title": "The shape",
        "text": "N counts the many outer rows and columns. D is the short shared dimension. The theorem requires D ≤ N^(1/18), so these are very thin matrices."
      },
      {
        "title": "The output limit",
        "text": "|W| means the number of requested entries. At most N²/√D entries may be requested. We are not obtaining the whole N×N output for free."
      },
      {
        "title": "Where a power saving comes from",
        "text": "If D = N^δ for a fixed positive δ ≤ 1/18, dividing by D^0.063 means dividing by N^(0.063δ). That is a fixed power saving. If D stays constant, this expression alone gives no exponent saving."
      }
    ],
    "take": "The later reductions and parameter choices produce the headline 3SUM and APSP exponents; do not read them directly from this one formula.",
    "question": "Is this a theorem for every pair of square matrices?",
    "answer": "No. It has a thin-shape condition and a limit on requested outputs. Removing those conditions would be a different claim.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "Theorem 5; §2.4.4"
  },
  {
    "title": "What if the next question is not known yet?",
    "lead": "This connects directly to Week 5: build a data structure now, answer queries later.",
    "visual": "flow",
    "nodes": [
      "Preprocess X and Y",
      "A request arrives: entry (i,j)",
      "Answer using stored work",
      "Another request can be different"
    ],
    "steps": [
      {
        "title": "Known requests",
        "text": "In the selected-output problem, W is known in advance. We can plan which parts of the calculation are needed. That is an offline task: the requests are available before the work starts."
      },
      {
        "title": "New requests arrive",
        "text": "In the data-structure version, a user may ask for a different matrix entry later. Preparation must support entries that were not named in advance. We cannot simply keep only the original requested paths."
      },
      {
        "title": "Pay now, save later",
        "text": "Section 4 develops a way to store shared intermediate information and combine it when a query arrives. Its thin-matrix regime includes preprocessing O(N²/D^0.063) and query time O(D^0.437). These are conditional on the theorem’s size and input assumptions, not promises for any matrix."
      }
    ],
    "take": "Like a search tree or hash table, a research data structure trades preparation and storage for later query work. Its guarantee comes from its own proof.",
    "question": "Why not just compute and store every possible answer?",
    "answer": "That would require writing N² entries. The research goal is to prepare in less than quadratic time while also answering faster than scanning all D terms of a dot product.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§4; Theorem 3: data structure version"
  },
  {
    "title": "Why researchers said “wow”",
    "lead": "There are several separate reasons to care. The decimal change is the visible result, not the whole story.",
    "visual": "flow",
    "nodes": [
      "A conjectured barrier falls",
      "A reusable algebraic technique",
      "Connections spread the saving",
      "An AI-origin discovery"
    ],
    "steps": [
      {
        "title": "A belief changed",
        "text": "A fixed exponent saving contradicts the old hypotheses. Results conditional on those hypotheses no longer establish those claimed barriers, although their logical reductions remain valid."
      },
      {
        "title": "A technique travels",
        "text": "The same connections once used to explain difficulty now help transfer faster algorithms. This does not invalidate complexity theory; testing and replacing hypotheses is part of research."
      },
      {
        "title": "A new contributor",
        "text": "The authors credit Claude with the core discovery. Human researchers developed and presented the work. This is an example of AI contributing a research idea, rather than merely producing code for a known method."
      }
    ],
    "take": "A foundational change can matter before it becomes a useful library function.",
    "question": "Does disproving a hypothesis make every theorem that mentioned it a false theorem?",
    "answer": "No. “If H, then C” can remain logically correct. Once H is refuted, we cannot use it to establish C. C needs its own analysis.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1; §6; Acknowledgments and Methodology"
  },
  {
    "title": "What was checked—and what was not?",
    "lead": "Separate discovery, a written argument, formal verification and a practical benchmark.",
    "visual": "flow",
    "nodes": [
      "Model proposes an algorithm",
      "Researchers develop the paper",
      "Formal statements and proofs",
      "Independent scrutiny and implementation"
    ],
    "steps": [
      {
        "title": "Who did what",
        "text": "The paper reports that an internal Anthropic model found the core idea during cryptography work, using 16 million output tokens without human input during that run. The authors then simplified, extended and took responsibility for the paper."
      },
      {
        "title": "What Lean adds",
        "text": "Anthropic publishes formal proofs for the main integer-machine claims. A proof checker checks the formal statement under its definitions; humans still need to inspect whether those definitions express the intended claim."
      },
      {
        "title": "Keep the scope precise",
        "text": "The repository distinguishes the main deterministic results from real-input running times that are not proved for a machine there. This lesson has not rebuilt the proof library. The cited paper is the October 5 preprint, version 1, not a classroom speed benchmark."
      }
    ],
    "take": "“The AI says so” is not the evidence. The algorithm, argument and checkable proof artifacts are the evidence to examine.",
    "question": "Does formal verification prove the algorithm is fast on your laptop?",
    "answer": "No. A formal running-time theorem concerns a defined machine model. Wall-clock speed needs an implementation and measurement.",
    "source": "https://github.com/anthropics/formal-math/tree/main/3sum-apsp",
    "reference": "Lean README"
  },
  {
    "title": "What this result does not say",
    "lead": "Keep the size of the claim accurate. A large discovery does not settle every hard problem.",
    "visual": "flow",
    "nodes": [
      "Faster polynomial algorithms",
      "Not a P versus NP solution",
      "Not all graph problems",
      "Not a guaranteed practical speedup"
    ],
    "steps": [
      {
        "title": "Different kinds of difficulty",
        "text": "3SUM and APSP already had polynomial-time algorithms. Improving their powers does not settle P versus NP or provide a fast method for every NP-complete problem."
      },
      {
        "title": "Different assumptions",
        "text": "The paper does not refute SETH through these results. It explicitly separates CNF-SAT and Orthogonal Vectors from the problems receiving the stated improvements."
      },
      {
        "title": "Different uses",
        "text": "A shortest-path table is not a shortest tour visiting all stations. APSP does not solve the travelling-salesperson problem just because both involve routes."
      }
    ],
    "take": "Ask: which problem, which inputs, which cost model, which guarantee?",
    "question": "Can a factory replace every routing algorithm with this result?",
    "answer": "No. First identify the actual task. Single-source routing, all-pairs distances and a tour through every station are different problems.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§1; §1.2: relationships to unaffected conjectures"
  },
  {
    "title": "What should an engineer take from this?",
    "lead": "Bring the research lesson back to trees, hash tables and real design decisions.",
    "visual": "flow",
    "nodes": [
      "Define the question",
      "Avoid repeated work",
      "Count all costs",
      "Verify the claim",
      "Measure the implementation"
    ],
    "steps": [
      {
        "title": "Question the workload",
        "text": "Before optimizing a lookup, ask whether you are asking it a quadratic number of times. Before computing a full table, ask which entries are actually required."
      },
      {
        "title": "Keep the proof and the experiment",
        "text": "A proof can guarantee a property over all allowed inputs. Experiments tell us about tested instances and practical costs. We need to know which kind of evidence we have."
      },
      {
        "title": "Choose a responsible takeaway",
        "text": "AI can propose surprising ideas. Your engineering role includes defining requirements, testing assumptions, checking outputs and deciding whether the method is useful under real constraints."
      }
    ],
    "take": "Do not memorize 1.9992. Remember the difference between a method, a hypothesis, a proof and a useful implementation.",
    "question": "Explain the “wow” in one sentence without saying “AI is faster”.",
    "answer": "A new way to share and skip algebraic work crossed a conjectured exponent barrier, and reductions carried the saving to other problems; the claims came with a paper and formal proof artifacts.",
    "source": "https://arxiv.org/html/2610.06783v1",
    "reference": "§6; course reflection"
  }
];
