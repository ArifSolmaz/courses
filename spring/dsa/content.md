# DSA.md
# Data Structures & Algorithms (Python, Colab-temelli)
**Süre:** 14 hafta — **3 saat/hafta**
**Format:** Teori+demo + Colab benchmark/plot

## 🎯 CORE MASTERY: "I can pick the right data structure and prove it"
> **Empirical Complexity Reasoning — measure, don't guess.** Given a performance
> problem, the student can identify the bottleneck, choose the right data
> structure or algorithm, implement the solution, and *benchmark to prove*
> the choice was correct.
>
> Every week teaches a new *data structure or algorithm* but always in service
> of this ONE skill. The weekly question is always:
> **"When should I reach for this structure, and how do I prove it was the right choice?"**

## Haftalık teslim seti (standart)
Her hafta 2 notebook:
- `Wxx_DSA_Core.ipynb` (≈2 saat): teori + uygulama demosu
- `Wxx_DSA_Benchmark.ipynb` (≈1 saat): ölçüm + yorum + plot

## DSA hedefleri
- Big-O sezgisi ve kanıtlama yerine "ölçerek destekleme" — **THE core method**
- Python veri yapılarının gerçek maliyetleri — **know your tools**
- Veri yapısı seçimini problem bağlamında gerekçelendirme — **choose wisely**
- Benchmark → grafik → kısa rapor akışı — **prove it**

## Colab benchmark standardı
- Aynı veri boyutlarında (n = 1e3, 1e4, 1e5…) ölç
- `time` veya `timeit` ile süreyi topla
- Sonuçları plotla
- 5–8 satırlık yorum: "neden bu eğri böyle?"

---

## 14 Haftalık Konu Planı (DSA)

### PHASE 1: Learning to Measure & Predict (Weeks 1-2)
*"Before you can choose, you must learn to measure and predict performance"*

### Week 01 — The Measuring Mindset: Big-O & Benchmarking
**Core mastery link:** This is your fundamental tool: predict performance with Big-O, then verify with benchmarks. Theory + measurement = informed choices.
- Big-O: kavram, ölçek, trade-off
- Benchmark mantığı (Colab)
- `matplotlib` hızlı tekrar: plot, title, label, legend
- Benchmark: aynı işi farklı n ile ölç + sonuçları plotla

### Week 02 — Know Your Tools: Python Built-in Costs
**Core mastery link:** Your first real choice: list vs dict vs set. Each has different costs. Measure them. Now you can choose.
- Python list/dict/set operasyon maliyetleri
- Benchmark: membership (`in`) list vs set
- When to reach for each structure

### PHASE 2: First Data Structure Choices (Weeks 3-4)
*"Linear structures and recursion — your first trade-off decisions"*

### Week 03 — The Right Queue: Stack, Queue & Deque
**Core mastery link:** Stack vs Queue vs Deque — different structures for different access patterns. Benchmark proves why list.pop(0) is the wrong choice.
- Stack/Queue/Deque (ADT)
- Benchmark: list pop(0) vs deque popleft

### Week 04 — Divide & Remember: Recursion & Memoization
**Core mastery link:** Naive recursion can be exponentially slow. Memoization trades space for time — a fundamental DS trade-off. Benchmark: O(2^n) → O(n).
- Recursion + call stack + memoization
- Benchmark: naive vs memoized

### PHASE 3: Choosing Between O(n), O(log n), O(1) (Weeks 5-7)
*"The big three complexity classes — when each wins"*

### Week 05 — Finding Things: Linear vs Binary Search
**Core mastery link:** O(n) vs O(log n) — binary search is dramatically faster but requires sorted data. The trade-off: sort once, search many times. Prove it.
- Searching: linear vs binary
- Benchmark: sıralı veri üzerinde binary search avantajı

### Week 06 — Ordering Things: Sorting Algorithms
**Core mastery link:** Different sorts win in different situations. Insertion sort for small/nearly-sorted, merge for guaranteed O(n log n). Know the trade-offs, measure them.
- Sorting: insertion/merge/quick (kavramsal)
- Benchmark: farklı sorting yaklaşımları (küçük ölçeklerde)

### Week 07 — Instant Lookup: Hashing
**Core mastery link:** O(1) average lookup — the fastest possible. But at what cost? Collisions, memory. Build a hash table, benchmark dict vs list lookup.
- Hashing sezgisi, indeksleme yaklaşımı
- Benchmark: dict lookup ile hızlandırma

### PHASE 4: Hierarchical Structures (Weeks 8-10)
*"Trees and heaps — new trade-offs for ordered and prioritized data"*

### Week 08 — Always the Best: Heap & Priority Queue
**Core mastery link:** When you always need the min/max element, a heap gives O(log n) insert + O(1) peek. Benchmark: sorted() vs heapq for top-k problems.
- Heap / priority queue (`heapq`)
- Benchmark: en küçük k eleman, priority kullanımı

### Week 09 — Hierarchical Data: Trees & Traversal
**Core mastery link:** Trees organize data hierarchically. Traversal order matters — different orders serve different purposes. The right traversal is a structural choice.
- Tree kavramı + traversal (in-order, pre-order, post-order, level-order)
- Mini uygulama: traversal çıktısı doğrulama

### Week 10 — Ordered Hierarchy: Binary Search Trees
**Core mastery link:** BST combines tree structure with search efficiency. O(log n) search/insert when balanced, O(n) when skewed. Shape matters — prove it.
- BST sezgisi, arama/ekleme
- Balanced vs skewed performance
- Kavramsal + küçük implementasyon

### PHASE 5: Network Structures (Weeks 11-12)
*"Graphs — when your data is a network of connections"*

### Week 11 — Connected Data: Graphs, BFS & DFS
**Core mastery link:** When data forms a network (social, road, dependency), graphs are the right structure. BFS finds shortest paths by edges. DFS explores exhaustively. Choose based on the question.
- Graph temsil (adj list) + BFS/DFS
- Studio: BFS ile en kısa adım sayısı

### Week 12 — Weighted Paths: Dijkstra's Algorithm
**Core mastery link:** When edges have costs, BFS fails. Dijkstra finds cheapest paths using a heap. The right algorithm for weighted graphs — benchmark it.
- Dijkstra (temel) + ağırlıklı graph sezgisi
- Mini rota planlama

### PHASE 6: Algorithmic Optimization (Week 13)
*"When the right data structure isn't enough — algorithmic thinking"*

### Week 13 — Trading Memory for Speed: Dynamic Programming
**Core mastery link:** DP eliminates redundant computation by remembering results. The ultimate space-time trade-off. Benchmark: exponential → polynomial.
- Dynamic Programming: 1–2 klasik problem
- Benchmark: memoization/DP etkisi

### PHASE 7: Proving Mastery (Week 14)
*"Choose, implement, benchmark, prove — the complete cycle"*

### Week 14 — Final Project: Fast Log Indexer
**Core mastery link:** This is the proof. Given a real problem, choose data structures, implement, benchmark against brute force, and write a conclusion: "My choice was right because..."
- Log kayıtlarını `dict/set` ile indeksle
- Hızlı sorgular (time range / id / threshold)
- Benchmark raporu + plot
- Kısa sonuç paragrafı: "Seçtiğim DS neden doğruydu?"
