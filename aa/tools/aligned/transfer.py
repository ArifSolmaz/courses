"""Engineering transfer sections and practice items for the 14 aligned weeks.

Exports (imported by aligned/build.py):
  TRANSFER      {week: '<section class="transfer">…</section>'} rendered before Practice.
  NEW_MCQ       [(id, question, [4 options], 'a'-'d', explanation)]  ids 3001–3099.
  NEW_MCQ_LEVEL {id: 'Easy'|'Medium'|'Hard'} honest difficulty for each NEW_MCQ item.
  NEW_WRITTEN   [{'id', 'block', 'level', 'question', 'answer'}]  ids 401–499.
  EXTRA_TESTS   {week: [mcq ids]}    EXTRA_WRITTEN {week: [written ids]}

Register NEW_MCQ ids as given (no +1000 offset; 3001+ is free) with
origin 'course' and the level from NEW_MCQ_LEVEL. Register NEW_WRITTEN into
skiena_material.EXERCISES before calling question_bank.bank().

NOTE_LINES re-exports the one-line "engineering transfer" sentences already
authored in skiena_material.WEEK_NOTES for the new weeks whose topic matches
(build.py may show them, e.g. under Notes); the sections below stay within a
180-word budget and do not embed them.
"""
import html

try:  # tools/ is on sys.path when tools/build.py runs; stay importable without it.
    from skiena_material import WEEK_NOTES as _NOTES
except Exception:  # pragma: no cover
    _NOTES = {}

# new week -> old WEEK_NOTES week whose transfer sentence still fits the topic
_NOTE_MAP = {1: 1, 2: 5, 3: 3, 4: 4, 5: 11, 7: 13, 14: 14}
NOTE_LINES = {w: _NOTES[o][3] for w, o in _NOTE_MAP.items() if o in _NOTES}

BLOCK = 'Engineering transfer'
TITLE = 'Where an engineer meets this'


def _section(week, paragraphs, problem, check):
    """Build one transfer section: prose, then one boxed mini-problem with its check."""
    body = ''.join(f'<p>{p}</p>' for p in paragraphs)
    return (f'<section class="transfer" id="transfer" aria-labelledby="transfer-title">'
            f'<h3 id="transfer-title">{TITLE}</h3>{body}'
            f'<div class="mini-problem"><p><strong>Mini-problem.</strong> {problem}</p>'
            f'<details><summary>Check your answer</summary><p>{check}</p></details></div></section>')


TRANSFER = {
1: _section(1, [
 'A pick-and-place head must visit 30 holes and return to the feeder. “Visit them in a good order” is not a specification. Write an optimisation: legal outputs are closed tours visiting every hole once; the objective is total head travel in millimetres; minimise it.',
 'Now any proposed tour can be checked: add up its moves. A tie rule (“at equal distance take the lower hole number”) makes a trace reproducible. Nearest-neighbour is a heuristic: fast, easy to check, and one small board can show it is not optimal. A tour 5 % too long, repeated 20 000 times a day, is real money.'],
 'Feeder at 0, holes at 1, −2 and 6 (mm, on a line). Run nearest-neighbour from 0 and compare with the lower bound 2 × (rightmost − leftmost).',
 'Nearest-neighbour: 0→1 (1), →−2 (3), →6 (8), →0 (6): 18 mm. Bound: 2 × (6 − (−2)) = 16 mm. The tour 0→1→6→−2→0 costs 1 + 5 + 8 + 2 = 16 mm, so nearest-neighbour is not optimal here.'),
2: _section(2, [
 'A 1 kHz control loop has 1 ms per iteration. Missing it once can jerk a motor or lose a sample. Timing engineers call the number that matters WCET: worst-case execution time.',
 'Suppose the loop does 200 µs of fixed I/O work and then scans a 150-entry calibration table at 5 µs per comparison. An average successful search stops near the middle: about 75 comparisons, 375 µs. The worst input scans all 150: 750 µs. Total 950 µs. It fits, but only the worst-case figure proves it. The average hides the iteration that overruns.'],
 'The table grows to 200 entries; nothing else changes. Is the deadline still met on every input?',
 'Worst case: 200 × 5 µs + 200 µs = 1200 µs > 1000 µs. Missed on the worst input, although the average (700 µs) fits. Binary search needs at most ⌊lg 200⌋ + 1 = 8 comparisons: 40 µs, worst case 240 µs.'),
3: _section(3, [
 'A camera on a sorting line delivers H × W pixels. Smoothing with a k × k kernel is two loops over pixels with a k × k loop inside: about k²HW multiply-adds. The counts multiply because every pixel runs the whole inner loop.',
 'A 3 × 3 kernel on 640 × 480 costs 9 × 307 200 ≈ 2.8 million operations per frame. Doubling the width doubles the work; doubling k quadruples it. A separable kernel (one horizontal pass, then one vertical pass) needs about 2kHW: those loops are added, not nested.'],
 'A 320 × 240 image, a 5 × 5 kernel, 20 ns per multiply-add. Does one frame fit in the 33 ms available at 30 frames per second? What does the separable version cost?',
 '25 × 76 800 = 1 920 000 multiply-adds × 20 ns = 38.4 ms: too slow. Separable: 2 × 5 × 76 800 = 768 000 operations = 15.4 ms, which fits.'),
4: _section(4, [
 'An interrupt samples a sensor; the main loop consumes the samples later. That needs a queue. A ring buffer is a fixed array of N slots with head and tail indices that wrap with mod N. Push and pop are O(1), memory is fixed at compile time, and no allocator runs in the interrupt.',
 'A linked list also pushes and pops in O(1), but each node carries a 4-byte pointer and needs allocation. An allocator has an unpredictable worst case and can fragment a small heap. Decide what a full ring does: drop the oldest sample or refuse the newest.'],
 'A ring of 8 slots holds samples in slots 5, 6, 7 (head = 5, tail = 7). Push one sample, then pop one. Which slot does the new sample take, and where are head and tail afterwards?',
 'Push: tail = (7 + 1) mod 8 = 0, the sample goes to slot 0. Pop removes slot 5 and moves head to 6. The buffer now holds slots 6, 7, 0.'),
5: _section(5, [
 'A CAN node receives frames with 11-bit identifiers (0–2047) but handles perhaps twenty of them. A direct table of 2048 entries wastes RAM on an 8 KB device. A 32-slot hash table with h(id) = id mod 32 usually finds a key in one probe.',
 'Collisions are the price. Identifiers are often spaced regularly (0x100, 0x120, 0x140 …), and a power-of-two modulus sends them all to one slot. The identifier set is fixed at design time, so test the table offline and pick a modulus, often a prime, that spreads the real keys.'],
 'Insert 0x100 (256), 0x120 (288), 0x140 (320), 0x121 (289) into 32 slots with linear probing, h = id mod 32. Where does each land? How many probes to look up 0x121?',
 '256, 288, 320 are all 0 mod 32: slots 0, 1, 2. 289 mod 32 = 1: probes 1, 2, takes 3. Lookup of 0x121: three probes. With mod 37 the keys land in 34, 29, 24, 30: no collision.'),
6: _section(6, [
 'A real-time operating system keeps many software timers: wake task A at 5 ms, blink the LED at 9 ms. Each tick the scheduler asks: which timer is due first? Then it reinserts the fired timer with its next period.',
 'An unsorted array inserts in O(1) but finds the minimum in O(n). A sorted list finds the minimum in O(1) but inserts in O(n). A binary min-heap keyed on due time does both in O(log n): 6 steps for 64 timers, inside a tick that must finish quickly. Equal due times come out in no promised order; add a sequence number if that matters.'],
 'Due times in a min-heap array (position 1 first): [5, 9, 7, 12, 10]. Insert a timer due at 6. Give the array afterwards.',
 'Append 6 at position 6; its parent is position 3 (7). 7 > 6, swap: [5, 9, 6, 12, 10, 7]. Its new parent is position 1 (5), and 5 ≤ 6, so stop.'),
7: _section(7, [
 'A data logger holds 10 000 entries from three sensors, and a report needs them in timestamp order. Mergesort does it in about n lg n ≈ 133 000 comparisons and is stable: equal timestamps keep their arrival order.',
 'A histogram of 12-bit ADC samples is a different job. Values are integers 0–4095, so counting sort works: count each value, then write the values out in order, n + 4096 steps. The Ω(n log n) lower bound counts key comparisons; counting sort makes none, it uses the key as an array index. The bound still binds any sort that only compares.'],
 'Sort 4096 samples of 12-bit values with counting sort. Count the steps and compare with the fewest comparisons any comparison sort needs, lg(4096!) ≈ 43 000.',
 'Count 4096 steps, prefix sums over 4096 counters, place 4096: about 12 300 steps, under a third of the 43 000 comparisons. With 24-bit values the 16.7 million counters would not fit; use two 12-bit radix passes.'),
8: _section(8, [
 'A mobile robot keeps an occupancy grid: each cell is free or blocked. Make each free cell a vertex and join 4-neighbours (up, down, left, right) with an edge. Breadth-first search from the robot’s cell gives the path with the fewest moves to any goal, and the parent pointers give the path itself.',
 'A 100 × 100 grid has 10 000 vertices and at most 20 000 edges, so BFS takes a few tens of thousands of steps and one parent entry per cell (about 20 KB). Allowing diagonal moves changes the graph to 8 neighbours and changes the answer. A straight-line estimate can be far below the true move count when a wall is in the way.'],
 'Rows 0–2, columns 0–2. Cells (0,1) and (1,1) are blocked. Start (0,0), goal (0,2). Run BFS with 4-neighbours and give the fewest moves.',
 'Layers: 0 {(0,0)}, 1 {(1,0)}, 2 {(2,0)}, 3 {(2,1)}, 4 {(2,2)}, 5 {(1,2)}, 6 {(0,2)}. Six moves. The straight-line distance is only 2 cells.'),
9: _section(9, [
 'A sensor-fusion pipeline is a set of stages: read IMU, read GPS, run the filter (needs both), run the controller (needs the filter), log (needs both). A build system has the same shape: compile before link. The arrows mean “must finish before”. A topological order is a valid execution order.',
 'Add “calibrate the IMU from the controller output” and the graph gets a cycle: IMU → filter → controller → IMU. No topological order exists. At run time each stage waits for the other: a deadlock. Depth-first search finds the cycle as a back edge before the system is built.'],
 'Stages A–E with edges A→C, B→C, C→D, D→E, C→E. Give one topological order and the number of valid orders. Then add E→A: what happens?',
 'A, B, C, D, E is valid. Only A and B can swap (C needs both, D needs C, E needs C and D): two orders. With E→A the cycle A→C→D→E→A appears; no order exists and the pipeline deadlocks.'),
10: _section(10, [
 'Six sensors and a gateway must be cabled so that every sensor reaches the gateway, possibly through another sensor. Cable is paid per metre. If any node may relay, the cheapest cabling is a minimum spanning tree: Kruskal sorts candidate runs by length and uses union-find to reject a run that closes a loop.',
 'The MST minimises total cable, not each sensor’s distance to the gateway. A sensor at the end of a chain may have a long relay path. Ask which quantity the customer pays for before choosing the algorithm.'],
 'Gateway G, sensors S1–S3. Distances (m): S1–S2 2, G–S1 3, S2–S3 4, G–S2 5, S1–S3 7, G–S3 8. Run Kruskal, give the total cable and S3’s path length to G.',
 'Accept S1–S2 (2), G–S1 (3), S2–S3 (4); reject G–S2 (5) as a loop. Total 9 m. S3 reaches G via S2 and S1: 4 + 2 + 3 = 9 m, longer than the 8 m direct run the MST left out. A star from G would cost 16 m.'),
11: _section(11, [
 'On the same occupancy grid, moves are not equal: a mud cell takes eight times longer than asphalt. Give each move the terrain time of the cell entered. BFS counts moves; Dijkstra counts cost. Because no cost is negative, the cheapest tentative cell can be finalised safely: that is the invariant Dijkstra relies on.',
 'A* is Dijkstra with a hint: it orders the queue by cost so far plus an estimate h of the cost remaining, such as straight-line distance. If h never overestimates, A* returns the same cheapest path and usually expands far fewer cells. An overestimating h can miss the best route.'],
 'Cells: S (0,0); M (0,1) mud 8; G (0,2) asphalt 1; A (1,0) gravel 3; B (1,1) gravel 3; C (1,2) asphalt 1. Run Dijkstra from S to G. What does BFS return?',
 'Finalise S 0, A 3, B 6, C 7, then G at 8 (through C), tied with M at 8. Cheapest path S→A→B→C→G, cost 8. BFS returns S→M→G, two moves, cost 9.'),
12: _section(12, [
 'A three-joint arm with 12 allowed angles per joint has 12³ = 1728 configurations; six joints give millions. To find a collision-free configuration, backtracking sets joint 1, then 2, then 3, and undoes a choice before trying the next.',
 'Pruning is where the saving is. If link 1 already passes through the wall, every configuration keeping that angle is invalid too, so the whole subtree is skipped. This is sound only because no completion can repair a collision that has already happened. Rejecting a partial arm because it “looks awkward” is a heuristic and may discard the only solution.'],
 'Joint 1 has 4 of 12 angles in the wall. For the other 8, joint 2 has 3 colliding angles each. How many collision checks in total, against 1728?',
 'Joint 1: 12 checks, 4 × 144 = 576 configurations skipped. Joint 2: 96 checks, 8 × 3 × 12 = 288 skipped. Joint 3: 8 × 9 × 12 = 864 checks. Total 12 + 96 + 864 = 972.'),
13: _section(13, [
 'A wrist accelerometer records a gesture as a series of samples. The same gesture done slowly and quickly gives series of different lengths with shifted peaks, so comparing sample i with sample i fails. Dynamic time warping (DTW) lets one sample match several.',
 'DTW is edit distance for numbers: D[i,j] = |aᵢ − bⱼ| + min(D[i−1,j], D[i,j−1], D[i−1,j−1]). The three predecessors play the roles of deletion, insertion and match. Filling the table costs O(nm); two series of 100 samples need 10 000 cells, fine on a microcontroller. A band near the diagonal cuts time and memory when speeds differ by a bounded factor.'],
 'a = [1, 3, 3, 1], b = [1, 3, 1]. Fill the DTW table and give the distance. What does sample-by-sample comparison of the first three samples give?',
 'Rows for a, columns for b: [0, 2, 2], [2, 0, 2], [4, 0, 2], [4, 2, 0]. DTW distance 0: both 3s of a match the single 3 of b. Sample-by-sample: |1−1| + |3−3| + |3−1| = 2.'),
14: _section(14, [
 'Ten jobs, each a fixed sequence of operations on five machines: minimise the time the last job finishes (the makespan). Job-shop scheduling is NP-hard, so no known method solves every instance quickly. Production does not stop; the question changes.',
 'Priority rules (shortest processing time first, earliest due date first) give a schedule in seconds with no guarantee. A lower bound makes that useful: no schedule beats the busiest machine’s total load, or the longest job run in sequence. Heuristic 46 minutes, bound 40: the optimum is in 40–46 and the worst-case loss is known.'],
 'Machine loads: M1 30, M2 40, M3 25 min. The longest job needs 35 min in sequence. A priority rule gives 46. Give a lower bound and the largest possible loss. Could a 38-minute schedule exist?',
 'Bound = max(40, 35) = 40 min. The heuristic is at most 6 min (15 %) above optimal. 38 is impossible: M2 alone needs 40. Small instances can still be solved exactly by branch and bound.'),
}

# ---------------------------------------------------------------------------
# One MCQ per week (ids 3001–3014). Tuple format as build.NEW.
NEW_MCQ = [
(3001, 'A pick-and-place controller must choose the order of 30 holes. Which statement turns this into an optimisation problem whose answer can be checked?',
 ['Legal outputs are closed tours visiting every hole once; the objective is total head travel; minimise it.', 'Use the fastest available routing library.', 'Choose an order the operator finds natural.', 'Minimise the number of holes on the board.'], 'a',
 'An optimisation problem needs a set of legal outputs and a measurable objective. Given both, any proposed tour can be measured and compared; “natural” or “fast library” cannot be checked.'),
(3002, 'A 1 kHz control loop does 200 µs of fixed work, then a linear search of 150 entries at 5 µs per comparison. Which figure decides whether the 1 ms deadline is met on every iteration?',
 ['The average case, about 575 µs.', 'The best case, 205 µs.', 'The worst case, 950 µs.', 'The amortised cost over one second.'], 'c',
 'A deadline is a guarantee about every iteration, so only the worst-case execution time (150 × 5 + 200 = 950 µs) answers it. The average would hide the iteration that overruns.'),
(3003, 'A k × k kernel applied to an H × W image costs about k²HW multiply-adds. Which change multiplies the work by four?',
 ['Doubling the image width only.', 'Doubling the kernel side k.', 'Adding one extra image row.', 'Halving the image height.'], 'b',
 'Work is proportional to k², so doubling k multiplies it by four. Doubling W alone doubles it, one row adds a little, halving H halves it.'),
(3004, 'A ring buffer has 8 slots and its tail index is 7. Where is the next sample stored?',
 ['Slot 8.', 'Slot 0.', 'Slot 7 again, overwriting it.', 'A newly allocated slot.'], 'b',
 'The tail advances with (7 + 1) mod 8 = 0. Wrapping the index is what lets a fixed array behave as a queue without allocating memory.'),
(3005, 'CAN identifiers 0x100, 0x120 and 0x140 are inserted in that order into a 32-slot table with h(id) = id mod 32 and linear probing. How many probes does a lookup of 0x140 take?',
 ['1', '2', '3', '32'], 'c',
 '256, 288 and 320 are all 0 mod 32. 0x100 takes slot 0, 0x120 probes 0 and takes 1, 0x140 probes 0, 1 and takes 2. Looking it up repeats those three probes.'),
(3006, 'An RTOS timer heap holds due times [5, 9, 7, 12, 10] (min-heap, position 1 first). After inserting a timer due at 6, the array is:',
 ['[5, 9, 6, 12, 10, 7]', '[5, 6, 9, 12, 10, 7]', '[5, 9, 7, 12, 10, 6]', '[6, 5, 9, 12, 10, 7]'], 'a',
 '6 is appended at position 6, whose parent is position 3 (7). 7 > 6, so they swap. The new parent is position 1 (5), and 5 ≤ 6, so the bubble-up stops.'),
(3007, 'Why does the Ω(n log n) lower bound for sorting not forbid sorting 12-bit ADC samples in linear time with counting sort?',
 ['Counting sort makes fewer comparisons than the bound allows.', 'The bound counts key comparisons only; counting sort compares no keys, it uses each value as an array index.', 'ADC samples arrive already sorted.', 'The bound applies only when n is larger than 4096.'], 'b',
 'The lower bound is a statement about algorithms that learn the order only by comparing keys. Counting sort uses the numeric value of a bounded key as an address, which the comparison model does not allow.'),
(3008, 'A robot runs BFS on a 4-neighbour occupancy grid from its cell to a goal cell. What does the parent chain give?',
 ['The path with the fewest moves.', 'The path with the lowest terrain cost.', 'Some path, with no guarantee.', 'The path with the fewest turns.'], 'a',
 'BFS discovers cells in order of edge count from the source, so the parent chain is a path with the minimum number of moves. Terrain cost needs Dijkstra.'),
(3009, 'Depth-first search over a sensor-fusion dependency graph reports a back edge. For the running system this means:',
 ['A valid order exists, with one stage repeated.', 'There is a cycle: no topological order exists and the stages would wait for each other.', 'The graph is a tree.', 'The pipeline has two independent inputs.'], 'b',
 'A back edge closes a cycle. A cycle of “must finish before” constraints cannot be ordered, and at run time each stage waits for the other: deadlock.'),
(3010, 'Gateway G and sensors S1, S2, S3 with cable lengths S1–S2 2, G–S1 3, S2–S3 4, G–S2 5, S1–S3 7, G–S3 8. The minimum total cable that connects everything is:',
 ['9 m', '10 m', '16 m', '8 m'], 'a',
 'Kruskal accepts S1–S2 (2), G–S1 (3) and S2–S3 (4), rejects G–S2 (cycle) and stops with three edges: 9 m. A star from G would cost 16 m.'),
(3011, 'A* is used instead of Dijkstra on a terrain-cost grid with a heuristic that never overestimates the remaining cost. What changes?',
 ['The same cheapest path is found, usually after expanding fewer cells.', 'A shorter path than Dijkstra’s is found.', 'The path with the fewest moves is found instead.', 'It works only on grids without obstacles.'], 'a',
 'With an admissible heuristic A* is still exact: it returns a cheapest path. The heuristic only changes the order in which cells are expanded, so it typically saves work.'),
(3012, 'Backtracking searches robot-arm joint angles one joint at a time. When is it sound to discard a partial configuration?',
 ['When the links placed so far already collide, so no choice of the remaining joints can help.', 'When the partial configuration looks awkward.', 'When half of the search tree has been explored.', 'Whenever the first joint is at 0°.'], 'a',
 'Pruning is sound only if no completion of the partial solution can be valid. A collision already present cannot be undone by later joints; “looks awkward” is a heuristic that may discard the only solution.'),
(3013, 'A gesture template has 100 samples and a live recording has 120. Filling the full dynamic-time-warping table costs about:',
 ['220 cell updates.', '12 000 cell updates.', '100 × lg 120 cell updates.', '2¹⁰⁰ cell updates.'], 'b',
 'DTW fills an n × m table with constant work per cell: 100 × 120 = 12 000. It is the same table shape as edit distance.'),
(3014, 'A job-shop heuristic gives makespan 46 minutes; a lower bound is 40 minutes. What can you conclude?',
 ['The optimal makespan is between 40 and 46 inclusive.', 'The optimal makespan is exactly 40.', 'The heuristic is exactly 15 % too slow.', 'The problem is therefore in P.'], 'a',
 'A lower bound says no schedule finishes earlier; the heuristic is a real schedule, so it is an upper bound. The optimum lies in [40, 46]. Where in that range is unknown without more search.'),
]
NEW_MCQ_LEVEL = {3001: 'Easy', 3002: 'Easy', 3003: 'Easy', 3004: 'Easy', 3005: 'Medium', 3006: 'Medium', 3007: 'Easy',
                 3008: 'Easy', 3009: 'Easy', 3010: 'Medium', 3011: 'Easy', 3012: 'Easy', 3013: 'Easy', 3014: 'Easy'}

# ---------------------------------------------------------------------------
# One written item per week (ids 401–414). Dict format as skiena_exercises.json.
NEW_WRITTEN = [
{'id': 401, 'block': BLOCK, 'level': 'Medium',
 'question': 'A pick-and-place head starts at 0 and must visit holes at 2, −3 and 7 (mm, on a line) and return. Trace nearest-neighbour with the tie rule “at equal distance choose the lower coordinate”, give its length, state the lower bound 2 × (rightmost − leftmost), and give a tour that meets it.',
 'answer': 'From 0 the nearest hole is 2 (distance 2; −3 is 3 away). From 2, both −3 and 7 are 5 away; the tie rule chooses −3 (5). From −3 the only unvisited hole is 7 (10). Return 7 → 0 (7). Nearest-neighbour length: 2 + 5 + 10 + 7 = 24 mm. Lower bound: any closed tour crosses from −3 to 7 and back, so at least 2 × (7 − (−3)) = 20 mm. The tour 0 → 2 → 7 → −3 → 0 costs 2 + 5 + 10 + 3 = 20 mm and meets the bound, so it is optimal and nearest-neighbour is 20 % too long on this board.'},
{'id': 402, 'block': BLOCK, 'level': 'Medium',
 'question': 'A 1 kHz control loop (1 ms budget) does 200 µs of fixed work and then searches a calibration table with a linear scan at 5 µs per comparison. The table grows from 150 to 200 entries. Compute the average and worst-case iteration time for 200 entries, decide whether the deadline is safe, and propose a fix with its worst-case time.',
 'answer': 'Average successful search: about 100 comparisons = 500 µs, total 700 µs, which fits. Worst case (last entry or missing key): 200 × 5 = 1000 µs, total 1200 µs > 1000 µs. The deadline is missed on the worst input, so the loop is not safe even though its average fits. Fix: keep the table sorted and use binary search. Worst case ⌊lg 200⌋ + 1 = 8 comparisons = 40 µs, total 240 µs, with 760 µs of margin. The relevant bound for a deadline is always the worst case; an average is only a throughput figure.'},
{'id': 403, 'block': BLOCK, 'level': 'Medium',
 'question': 'A 320 × 240 camera image is filtered with a 5 × 5 kernel at 20 ns per multiply-add. Count the operations and time for one frame, decide whether it fits the 33 ms available at 30 frames per second, and repeat for a separable kernel (one horizontal 5-tap pass and one vertical 5-tap pass).',
 'answer': 'Pixels: 320 × 240 = 76 800. Nested loops: each pixel runs the 5 × 5 = 25-tap inner loop, so 25 × 76 800 = 1 920 000 multiply-adds. Time: 1 920 000 × 20 ns = 38.4 ms > 33 ms, so the frame does not fit. Separable: two passes of 5 taps per pixel, added not multiplied: 2 × 5 × 76 800 = 768 000 multiply-adds = 15.4 ms, which fits with margin. The count is Θ(k²HW) for the direct kernel and Θ(kHW) for the separable one; k = 5 gives the factor 25/10 = 2.5 observed.'},
{'id': 404, 'block': BLOCK, 'level': 'Medium',
 'question': 'An MCU stores 256 two-byte ADC samples in a queue filled by an interrupt. Compare a ring buffer with a singly linked list on a 32-bit MCU (4-byte pointers, 8-byte allocator header per block): give the memory each needs, the cost of push and pop, and explain why the linked list is unsuitable inside the interrupt.',
 'answer': 'Ring buffer: 256 × 2 = 512 bytes for the slots plus two indices (say 2 bytes each): about 516 bytes, fixed at compile time. Push and pop are O(1): store or read one slot and advance an index with mod 256. Linked list: each node holds 2 bytes of data and a 4-byte pointer, plus the 8-byte allocator header: 14 bytes × 256 = 3584 bytes, about seven times more, and only if the allocator finds the blocks. Push and pop at the ends are also O(1) pointer operations, but push must first call the allocator, whose worst-case time is not bounded by a small constant and which may fail from fragmentation. An interrupt must finish in bounded time and must not call code that may block or fail, so the ring buffer is the correct choice. The ring needs one explicit policy for the full case (drop oldest or reject newest); the list hides that decision until memory runs out.'},
{'id': 405, 'block': BLOCK, 'level': 'Medium',
 'question': 'A CAN node handles identifiers 0x100, 0x120, 0x140 and 0x121. Insert them in that order into a table with linear probing using h(id) = id mod 32, then again using h(id) = id mod 37. Give each slot, the number of probes to look up 0x121 in each table, and explain why the second modulus can be chosen at design time.',
 'answer': 'Decimal values: 0x100 = 256, 0x120 = 288, 0x140 = 320, 0x121 = 289. Mod 32: 256, 288 and 320 are multiples of 32, so all hash to 0; 289 hashes to 1. Insert: 256 → slot 0; 288 → probes 0, takes 1; 320 → probes 0, 1, takes 2; 289 → probes 1, 2, takes 3. Lookup of 0x121 probes 1, 2, 3: three probes. Mod 37: 256 = 6 × 37 + 34 → slot 34; 288 = 7 × 37 + 29 → slot 29; 320 = 8 × 37 + 24 → slot 24; 289 = 7 × 37 + 30 → slot 30. No collisions; every lookup is one probe. The identifier set of a bus is fixed when the system is designed, so the table can be built and tested offline and a modulus chosen that spreads exactly these keys; a prime modulus avoids the regular spacing of identifiers that a power of two maps onto one slot.'},
{'id': 406, 'block': BLOCK, 'level': 'Medium',
 'question': 'An RTOS keeps 64 periodic timers. Every 1 ms tick it removes each timer that is due and reinserts it with its next due time. Compare three structures for this workload: an unsorted array, a sorted linked list, and a binary min-heap. Give the cost of find-minimum and insert for each, the work per tick when one timer fires, and one property the heap does not guarantee.',
 'answer': 'Unsorted array: insert O(1) (append), find-minimum O(n): 64 steps to find the due timer each tick. Sorted list: find-minimum O(1) (the head), but reinserting the fired timer walks the list to its place: O(n), up to 64 steps. Min-heap keyed on due time: find-minimum O(1) (the root), remove-minimum and insert O(log n) each: lg 64 = 6 levels, so about 12 steps per fired timer. Per tick with one firing: array about 64 + 1, sorted list about 1 + 64, heap about 6 + 6. The heap wins as n grows, and its per-tick worst case is small and predictable, which a scheduler needs. Not guaranteed: two timers with the same due time can be removed in either order; add a sequence number to the key if first-in-first-out among ties is required.'},
{'id': 407, 'block': BLOCK, 'level': 'Medium',
 'question': 'A logger must sort 4096 samples of 12-bit ADC values. Describe counting sort for this input, count its steps, compare with the fewest comparisons any comparison-based sort needs (lg(4096!) ≈ 43 000), and explain what changes if the values were 24-bit.',
 'answer': 'Counting sort: allocate 4096 counters (values 0–4095), scan the samples and increment the counter of each value (4096 steps), turn the counters into starting positions with a prefix sum (4096 steps), then place each sample at its position (4096 steps). About 12 300 steps, all simple array operations, and no sample is ever compared with another. A comparison sort must make at least lg(4096!) ≈ 43 000 comparisons in the worst case, more than three times the counting-sort total. There is no contradiction: the lower bound applies to algorithms whose only information about order comes from comparisons, and counting sort uses the value itself as an address. With 24-bit values the counter array would need 16.7 million entries, which does not fit an MCU; radix sort by two 12-bit digits, each a stable counting pass, keeps the cost at 2 × (4096 + 4096) counter steps plus placement.'},
{'id': 408, 'block': BLOCK, 'level': 'Medium',
 'question': 'A 3 × 3 occupancy grid has rows 0–2 and columns 0–2; cells (0,1) and (1,1) are blocked. The robot starts at (0,0) and the goal is (0,2). Run BFS with 4-neighbour moves, listing each layer, and give the fewest moves and the path. Compare with the Manhattan distance between start and goal.',
 'answer': 'Layer 0: (0,0). Its free neighbours: (1,0) only, since (0,1) is blocked. Layer 1: (1,0), parent (0,0). Neighbours of (1,0): (0,0) seen, (1,1) blocked, (2,0). Layer 2: (2,0). Neighbours: (2,1). Layer 3: (2,1). Neighbours: (1,1) blocked, (2,2). Layer 4: (2,2). Neighbours: (1,2). Layer 5: (1,2). Neighbours: (0,2), (1,1) blocked. Layer 6: (0,2), the goal. Fewest moves: 6, path (0,0) → (1,0) → (2,0) → (2,1) → (2,2) → (1,2) → (0,2) read from the parent pointers. The Manhattan distance is |0 − 0| + |2 − 0| = 2, so the straight-line estimate is three times too small; BFS is exact because it counts edges in the real graph.'},
{'id': 409, 'block': BLOCK, 'level': 'Medium',
 'question': 'A sensor-fusion pipeline has stages A (read IMU), B (read GPS), C (filter), D (controller) and E (logger), with “must finish before” edges A→C, B→C, C→D, D→E, C→E. Give a topological order, count all valid orders, then add an edge E→A (the logger tunes the IMU) and explain what DFS reports and what it means at run time.',
 'answer': 'In-degrees: A 0, B 0, C 2, D 1, E 2. Start with A and B in either order, then C (both inputs done), then D (needs C), then E (needs C and D). One valid order: A, B, C, D, E. Counting: only A and B are free to swap, because C must wait for both, D for C, and E for D; so exactly two valid orders (A, B, … and B, A, …). Adding E→A creates the cycle A→C→D→E→A. A DFS starting at A reaches E while A is still on the stack, so the edge E→A is a back edge; no topological order exists. At run time A waits for E, which waits for D, which waits for C, which waits for A: a deadlock. The fix is to break the cycle, for example by feeding the calibration from the previous cycle’s logged value, which removes the edge from this iteration’s graph.'},
{'id': 410, 'block': BLOCK, 'level': 'Medium',
 'question': 'Cable a gateway G and sensors S1, S2, S3 with candidate runs (m): S1–S2 2, G–S1 3, S2–S3 4, G–S2 5, S1–S3 7, G–S3 8. Run Kruskal with union-find, showing the sets after each accepted edge, give the total cable, and compare S3’s relay path to G with its direct run. Which objective does each number serve?',
 'answer': 'Sorted edges: S1–S2 2, G–S1 3, S2–S3 4, G–S2 5, S1–S3 7, G–S3 8. Sets start as {G}, {S1}, {S2}, {S3}. S1–S2 (2): different sets, accept → {G}, {S1, S2}, {S3}. G–S1 (3): accept → {G, S1, S2}, {S3}. S2–S3 (4): accept → {G, S1, S2, S3}. Three edges join four nodes, so stop; G–S2, S1–S3 and G–S3 would each close a loop. Total cable: 2 + 3 + 4 = 9 m. In this tree S3 reaches G through S2 and S1: 4 + 2 + 3 = 9 m, while the rejected direct run G–S3 is 8 m. The MST minimises total installed cable (9 m against 16 m for a star), which is the right objective when cable cost dominates and relaying is free. If each sensor’s latency or hop count to the gateway is what matters, the objective is a shortest-path tree, and the answer can be different.'},
{'id': 411, 'block': BLOCK, 'level': 'Medium',
 'question': 'A 2 × 3 terrain grid: row 0 has S (0,0), M (0,1) mud cost 8, G (0,2) asphalt cost 1; row 1 has A (1,0) gravel 3, B (1,1) gravel 3, C (1,2) asphalt 1. A move costs the terrain of the cell entered. Run Dijkstra from S to G, showing tentative distances and the order in which cells are finalised, give the cheapest path, and state what BFS would return and what it costs. Then say how an admissible A* heuristic would change the run.',
 'answer': 'Start: S = 0, others ∞. Finalise S (0): relax M = 8, A = 3. Finalise A (3): relax B = 3 + 3 = 6 (S already final). Finalise B (6): M through B would be 6 + 8 = 14, no improvement; C = 6 + 1 = 7. Finalise C (7): G = 7 + 1 = 8; B already final. Now G and M are both tentative 8; finalise G (8), done. Cheapest path: S → A → B → C → G, cost 3 + 3 + 1 + 1 = 8. Finalising the cheapest tentative cell is safe because every move costs at least 0, so no later route can undercut it. BFS ignores costs and returns S → M → G, only two moves, but it costs 8 + 1 = 9. A* adds a heuristic such as Manhattan distance to G (S 2, A 3, B 2, C 1, M 1) to the priority; because moving one cell costs at least 1 the heuristic never overestimates, so A* still returns the cost-8 path but would prefer to expand cells nearer the goal first.'},
{'id': 412, 'block': BLOCK, 'level': 'Medium',
 'question': 'A three-joint arm allows 12 angles per joint. Backtracking sets joint 1, then joint 2, then joint 3, checking for collisions after each joint. Joint 1 has 4 angles that put link 1 in the wall; for each remaining joint-1 angle, 3 of the 12 joint-2 angles collide. Count the configurations skipped by each pruning level, the full configurations tested, and the total collision checks, and compare with testing all 12³ configurations. State the condition that makes this pruning sound.',
 'answer': 'Total configurations: 12 × 12 × 12 = 1728. Level 1: 12 checks of joint 1; the 4 colliding angles each cut off 12 × 12 = 144 configurations, so 576 are skipped after 4 checks. Level 2: for each of the 8 surviving joint-1 angles, 12 checks of joint 2 (96 checks); the 3 colliding angles each cut off 12 joint-3 choices, so 8 × 3 × 12 = 288 configurations are skipped. Level 3: the 8 × 9 = 72 surviving pairs each test 12 joint-3 angles: 864 full configurations. Checks in total: 12 + 96 + 864 = 972, against 1728 full tests without pruning, and 576 + 288 = 864 configurations were never built. Pruning is sound because a collision of the links placed so far cannot be undone by any setting of the later joints; every completion of the rejected partial configuration would still collide. If instead a partial arm were rejected because it “looks unlikely to reach the target”, that is a heuristic and could discard a valid solution.'},
{'id': 413, 'block': BLOCK, 'level': 'Medium',
 'question': 'Gesture template a = [1, 3, 3, 1] and recording b = [1, 3, 1]. Fill the dynamic-time-warping table D[i,j] = |aᵢ − bⱼ| + min(D[i−1,j], D[i,j−1], D[i−1,j−1]) with D[1,1] = |a₁ − b₁| and edges taken as ∞, give the DTW distance and the matching (warping path), and compare with sample-by-sample comparison of the first three samples.',
 'answer': 'Local costs |aᵢ − bⱼ|, rows a = 1, 3, 3, 1 and columns b = 1, 3, 1: row 1 [0, 2, 0], row 2 [2, 0, 2], row 3 [2, 0, 2], row 4 [0, 2, 0]. Fill: D[1,1] = 0; D[1,2] = 2 + 0 = 2; D[1,3] = 0 + 2 = 2. D[2,1] = 2 + 0 = 2; D[2,2] = 0 + min(2, 2, 0) = 0; D[2,3] = 2 + min(2, 0, 2) = 2. D[3,1] = 2 + 2 = 4; D[3,2] = 0 + min(0, 4, 2) = 0; D[3,3] = 2 + min(2, 0, 0) = 2. D[4,1] = 0 + 4 = 4; D[4,2] = 2 + min(0, 4, 4) = 2; D[4,3] = 0 + min(2, 2, 0) = 0. DTW distance D[4,3] = 0. Path: (1,1), (2,2), (3,2), (4,3): both 3s of a match the single 3 of b, so the slower gesture is stretched onto the faster one at zero cost. Sample-by-sample on the first three samples: |1 − 1| + |3 − 3| + |3 − 1| = 2, and the fourth sample of a has no partner at all. The table has 4 × 3 = 12 cells: O(nm), the same shape as edit distance, with the three predecessors playing the roles of deletion, insertion and match.'},
{'id': 414, 'block': BLOCK, 'level': 'Medium',
 'question': 'A job shop has three machines with total loads M1 30 min, M2 40 min, M3 25 min; the longest job needs 35 min of operations in sequence. A priority-rule heuristic produces a schedule with makespan 46 min. Give a lower bound on the optimal makespan with its justification, the largest possible loss of the heuristic, whether a 38-minute schedule can exist, and what changes if a second heuristic reaches 41. Explain why NP-hardness does not forbid solving this instance exactly.',
 'answer': 'Lower bounds: no schedule can finish before the busiest machine has done all its work, so makespan ≥ 40 (M2); and no schedule can finish before the longest job has run its operations one after another, so makespan ≥ 35. The bound is the larger, 40 min. The heuristic’s 46 is a real schedule, so it is an upper bound: the optimum lies in [40, 46] and the heuristic loses at most 6 min, 15 %. A 38-minute schedule is impossible because M2 alone needs 40 min. If a second heuristic reaches 41, the optimum lies in [40, 41]; the remaining possible gain is 1 min, and further search rarely pays. NP-hardness says no known method is fast on every instance of every size; it does not forbid an exact answer here. A branch-and-bound search that uses the same bound to cut branches can settle an instance this small in acceptable time, and the bound is what tells you when to stop.'},
]

EXTRA_TESTS = {w: [3000 + w] for w in range(1, 15)}
EXTRA_WRITTEN = {w: [400 + w] for w in range(1, 15)}

# --- sanity checks ---------------------------------------------------------
assert sorted(TRANSFER) == list(range(1, 15))
_mcq_ids = [t[0] for t in NEW_MCQ]
assert len(set(_mcq_ids)) == len(_mcq_ids) and all(3001 <= i <= 3099 for i in _mcq_ids)
assert all(len(t[2]) == 4 and t[3] in 'abcd' for t in NEW_MCQ)
assert set(NEW_MCQ_LEVEL) == set(_mcq_ids)
_w_ids = [x['id'] for x in NEW_WRITTEN]
assert len(set(_w_ids)) == len(_w_ids) and all(401 <= i <= 499 for i in _w_ids)
assert all(x['level'] in ('Easy', 'Medium', 'Hard') and x['answer'] for x in NEW_WRITTEN)
assert set(i for a in EXTRA_TESTS.values() for i in a) == set(_mcq_ids)
assert set(i for a in EXTRA_WRITTEN.values() for i in a) == set(_w_ids)
