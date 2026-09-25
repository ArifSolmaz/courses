# Week 1 story animations

Added 22 September 2026. The two stories follow the supplied bilingual Skiena notes (Lecture 1). Primary reference: https://www3.cs.stonybrook.edu/~skiena/373/newlectures/lecture1.pdf

- Robot tour: nearest neighbour failure (84 vs 64), leftmost-start line success, closest-pair line success, six-point two-row failure (12 + sqrt(40) vs 16), outside optimal tour, and all six fixed-start rectangle tours.
- Ties are deterministic and described; all tours include their final return edge. The nearest-neighbour tie rule matches the Week 1 written exercise. Closest pair enforces degree at most two and rejects premature cycles.
- On the line, point spacing is explicitly schematic; distances come from coordinates. Two-dimensional diagrams use equal axis scales. Intersections without vertices are not junctions.
- Exhaustive search shows current candidate and best tested so far. Text distinguishes n!, (n−1)!, and reversal symmetry, and does not claim every exact method enumerates every tour.
- Film scheduling: both source counterexamples, a seven-offer example, touching endpoints, tied finish times, and the empty case. All three rules are selectable for every case. Intervals have positive duration and use [start, finish); the objective is unweighted role count.
- Correctness explanation uses the standard first-job exchange argument and identifies fee/travel/multiple-actor changes as outside its assumptions.

Verification: `node aa/tools/verify_week1_stories.cjs` compares tour optima with independent subset dynamic programming and 1,029 interval sets with independent scheduling dynamic programming. It checks conflict-free schedules, all tour vertices, closing edges and closest-pair degrees. Browser checks cover all case results, previous/next/reset/play/pause/end controls, desktop and 390-pixel layouts, light/dark contrast and console errors. The story widgets are on the main lesson route, with readable text traces, native controls, live status, reduced-motion support and no-JavaScript summaries.
