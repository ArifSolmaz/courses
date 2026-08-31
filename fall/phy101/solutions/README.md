# Python Solution Lab — PHY101

**42 fully worked Python solutions: one at every difficulty level (L1, L2, L3), for all 14 weeks.**

`Week_XX_Python_Solutions.ipynb` is the companion to `notebooks/Week_XX.ipynb`. For each week it
works three selected problems — one **L1 (Basic)**, one **L2 (Intermediate)**, one **L3
(Challenge)** — in full, using the course workflow:

> **Diagram → Principle → Equation → Predict → Verify**

## Where this sits in the course

| Folder | Role | Audience |
| --- | --- | --- |
| `notebooks/` | Lecture + demos + the 10-problem set (L1–L3), solution cells left empty | Taught from |
| `student-practice/` | Assessed 5-part modelling notebooks | Graded |
| **`solutions/`** | **Worked Python solutions to selected problems at every level** | **Released after the due date** |
| `exam-practice/` | Timed rehearsals (W3, 5, 8, 11, 14) | Weeks 3, 5, 8, 11, 14 |

## Release policy

**Do not publish a week's solution notebook before that week's problem set is due.** These are
teaching artefacts, not answer keys — but they will function as answer keys if released early.

Suggested cadence:

- Release `Week_XX_Python_Solutions.ipynb` at the **start of Week XX+1**, once the set is closed.
- In the live check, ask students to **change one parameter** in a solution cell and predict the
  new result before running it. Every notebook is written with parameters at the top and sweeps
  downstream, so this works without editing anything else.

## Why these problems

Each selected problem is one where Python does something hand algebra cannot. The techniques
build deliberately across the semester:

| Week | L1 | L2 | L3 | Headline technique |
| ---: | --- | --- | --- | --- |
| 1 | P4 | P5 | P9 | `arctan2` quadrant safety; vectorised sums; direction sweep |
| 2 | P3 | P7 | P9 | Three-route cross-check; critical-value sweep; **SymPy** |
| 3 | P2 | P6 | P9 | Axis-independence strobe; sensitivity; `np.roots` + `brentq` |
| 4 | P4 | P5 | P9 | Friction as a capped function; **`np.linalg.solve` for FBDs** |
| 5 | P3 | P5 | P9 | Design charts; safe-speed bands; **`solve_ivp` + `brentq`** |
| 6 | P4 | P8 | P9 | Peak vs average power; four integration routes; ODE + root-find |
| 7 | P4 | P5 | P9 | Energy audit; mass-ratio limits; **a collision engine** |
| 8 | P1 | P6 | P9 | Weighted averages; 3×3 equilibrium; motor-sizing sweep |
| 9 | P3 | P7 | P9 | Linear↔rotational dictionary; rolling race; coupled FBDs |
| 10 | P4 | P6 | P9 | Conserved L vs rising KE; total-loss tuning; two-phase analysis |
| 11 | P1 | P6 | P10 | Phase & energy plots; envelope vs exact ODE; **damping design** |
| 12 | P3 | P8 | P9 | `arctan2` branches; driven-ODE validation; transmissibility study |
| 13 | P1 | P6 | P10 | Crest tracking; harmonic series; **Fourier synthesis** |
| 14 | P2 | P7 | P9 | One system three principles; peak counting; course synthesis |

## Verification standard

Every code cell ends with an `assert` against the expected answer, and most compute the result by
**two independent routes** (energy vs. forces, symbolic vs. numerical, closed form vs.
simulation). All 42 cells have been executed end to end; running a notebook top to bottom with no
`AssertionError` means every number on the page is checked.

Dependencies: `numpy`, `matplotlib`, `scipy`, `sympy` — all preinstalled in Google Colab.

---

# ⚠️ Errata in the existing answer keys

Building these solutions surfaced **nine problems in `notebooks/Week_XX.ipynb` whose printed
`<details>` answers are wrong or imprecise.** Each was confirmed by at least two independent
methods; the relevant solution cell prints the discrepancy and shows the reconciliation.

> **A later full audit of all 141 keys found 27 defective problems, not 9.** The nine below are simply the
> ones that happen to fall on a problem with a worked solution (W12 P9 is a tenth: its part (b)
> is infeasible, and the Week 12 notebook proves that). The other 17 are documented in
> `_instructor_verification/02_ERRATA_DERIVATIONS.md` (instructor-only) and are **not** reflected
> anywhere student-facing yet.

| Week | Problem | Key states | Correct value | Why the key is wrong |
| ---: | --- | --- | --- | --- |
| 8 | L2 P6 (ladder) | $N_w = 290.7$ N | **284.8 N** | Uses $g \approx 10$; the problem states $g = 9.81$ |
| 9 | L2 P7 (rolling) | $v_{\rm hollow} = 4.18$ m/s, $\Delta t = 0.10$ s | **4.202 m/s, 0.119 s** | Rounding drift |
| 9 | L3 P9 (Atwood) | $a=1.26$, $T_1=59.85$, $T_2=55.44$, $\alpha=15.75$ | **$a=1.453$, $T_1=58.50$, $T_2=56.32$, $\alpha=18.17$** | **Fails its own pulley torque equation** by 2.3× |
| 10 | L2 P6 (coaxial disks) | 83.8 % of KE lost | **80.2 %** | Arithmetic; its own $\omega_f = 3.125$ implies 80.2 % |
| 11 | L2 P6 (damped) | $x(5T_d) = 0.0046$ m, $E/E_0 = 0.034\%$ | **0.00163 m, 0.0043 %** | Corresponds to $\gamma t \approx 4.0$, not $5.03$ |
| 12 | L2 P8 (amplitudes) | 0.0800 / 0.300 / 0.0480 m | **0.0793 / 0.300 / 0.0467 m** | Drops the $(2\gamma\omega_d)^2$ term off resonance |
| 13 | L3 P10 (Fourier) | $b_n = \frac{9h}{2n^2\pi^2}\sin\frac{n\pi}{3}$ | $b_n = \frac{9h}{n^2\pi^2}\sin\frac{n\pi}{3}$ | **Factor of 2** — fails the projection integral |
| 14 | L2 P7 (damped) | $n \approx 3.66$ oscillations | **$n \approx 5.78$** | $\ln(10)/\gamma = 2.303$ s over $T_d = 0.398$ s |
| 14 | L3 P9 (rolling up) | $d_{\rm solid} = 4.33$ m | **4.221 m** ($d_{\rm hollow} = 5.025$ m) | Arithmetic |

### The two most important

- **W09 L3 P9 (Atwood with a massive pulley)** is the serious one. The key's tensions and angular
  acceleration are mutually inconsistent: $(T_1 - T_2)R = 0.353$ N·m but $I\alpha = 0.151$ N·m.
  Reproducing $a = 1.26$ m/s² would require an effective pulley mass of $7.1$ kg instead of the
  stated $3.0$ kg. **Fix this before releasing the Week 9 set.**
- **W13 L3 P10 (Fourier coefficients)** hands students a formula that is off by a factor of two.
  A student who trusts it will reconstruct a pluck of half the stated height. The corrected
  general form for a triangular pluck of peak $h$ at $x_p$ is
  $$b_n = \frac{2hL^2}{n^2\pi^2\,x_p(L-x_p)}\sin\frac{n\pi x_p}{L}.$$

### Two keys worth reading before you teach them

Both of these keys are **correct** — they are noted because the solutions go further than the
key does, and you may want to know why.

- **W03 L2 P6 (complementary angles).** The key correctly finds $y(150) = 18.2$ m $> 15$ m and
  notes that *both* angles clear the wall, preferring $25.9^\circ$ for its shorter flight time.
  The solution adds a robustness view: the flat shot's margin is only $3.2$ m and a $-4\%$
  muzzle-speed error puts it into the wall, while the lofted shot keeps $\sim60$ m of clearance.
  Both readings are defensible; the solution says so explicitly.
- **W07 L3 P9 (collision chain).** The key is complete and correct, including the third
  collision where B rebounds into A, giving $v_A = -2.0$, $v_B = 0$, $v_C = +4.0$ m/s. Only the
  problem *statement* understates it, saying "(A hits B, then B hits C)". The solution builds a
  loop that runs until no pair is approaching and proves termination, so the third collision
  cannot be missed.
