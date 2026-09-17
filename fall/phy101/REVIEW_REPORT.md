# PHY101 notebook and solutions review

## Single-notebook edition — 12 September 2026

**What changed.** The course had two notebooks per week: a 14-file source-module library in `notebooks/` and 13 generated dated lessons in `calendar/`, both linked from the dashboard. They are merged into **one complete notebook per week** (`notebooks/Week_01.ipynb` … `Week_13.ipynb`) and five optional `extensions/` notebooks (circular motion, angular momentum, resonance, waves and sound, review and projects). The builder, the question-bank JSON and the two verification records of the old pipeline are removed; everything lives in the notebooks and in git history (commit `2ad4750`).

**Coverage.** An automated audit during the merge confirmed that every teaching cell of the 14 modules (theory, demonstrations, checkpoints, worked examples, the 60 question-bank examples) appears exactly once across the 18 notebooks, and that all 90 problems of the nine core modules appear exactly once in the weekly notebooks (weeks 06 and 07 reuse five review problems). Split modules are assigned by topic: Module 04 P1/P3 with the Newton introduction in Week 03 and P2, P4–P10 in Week 04; Module 06 P1, P2, P4, P8 in Week 05 and P3, P5–P7, P9, P10 in Week 08; Module 09 P1–P2 in Week 10 (with two supporting circular-motion problems) and P3–P10 in Week 11.

**Structure.** Every notebook follows the same numbered sections with a linked table of contents: before you start → setup → concepts with demonstrations and worked examples → question-bank examples → problem set (L1/L2/L3, answers under *Answer and steps*) → exit check → solutions and next week. Checkpoints keep their model answers, now collapsed; separate model-answer and “your working” cells were folded into the question cells.

**Demonstration controls.** The shared interface was rewritten. Root cause of the earlier “sometimes unresponsive” sliders: the old interface drew inside `IPython.utils.capture.capture_output`, which swaps the kernel’s display publisher; ipykernel 7 dispatches widget messages concurrently, so a slider message arriving during a draw raised `AttributeError: 'CapturingDisplayPublisher' object has no attribute 'set_parent'` inside the kernel’s shell loop, after which no further widget message was processed. The new interface draws through the standard Output-widget route (`clear_output(wait=True)` then display), shows an **Updating…** status immediately, reports the draw time, and switches each demonstration between live-drag updates and update-on-release from measured draw times. Sliders no longer default to release-only. The Colab custom widget manager is no longer enabled (core ipywidgets work natively in Colab).

**Verification.** All 18 notebooks validate against the notebook schema and execute in fresh kernels (`tools/validate_notebooks.py`); after execution one control of every demonstration panel (53 panels) was moved and every panel redrew without error. Typical draw times are 0.07–0.25 s; the seven animation-rebuilding demonstrations take 2–5 s and run in release mode. A live JupyterLab check confirmed a front-end control change reaching the kernel and triggering a redraw with no kernel error; the browser pane could not be displayed during that session, so the repaint itself was verified through the kernel record rather than visually. Google Colab execution was not exercised. Dashboard and syllabus links point only at the 13 weekly notebooks and the 5 extension notebooks; `tools/sync_calendar.py --check --public-only` passes.

The sections below describe the earlier two-notebook editions and are kept as a record.

Reviewed 11 September 2026 against the local course notes, the lecture column of the supplied schedule image, and the separate `phy101-solutions` repository.

## Additional fully worked examples — current revision

Sixty additional examples are now embedded in the source notes and the relevant
dated lessons, before the existing practice sections. Fifty-five are based on
the supplied mechanics question bank; five explicitly labelled instructor
extensions connect its spring and swing models to periodic motion. Each has a
complete open solution, LaTeX algebra, units, physical interpretation, a check,
Turkish support, and a chapter/section/question reference.

Independent reviews checked every example against its source and physical model.
One collision is an explicitly adapted variant: the bank's rebound speed would
require an unmentioned kinetic-energy gain, so the worked example uses a passive
collision with a stated 6.00 m/s rebound and verifies the 8.10 J energy loss.
The angular-speed example and the combined inertia/rotational-energy example
were placed in Weeks 10 and 11 respectively to match their prerequisites.

Verification covers 148 numerical checks, all 60 source anchors, and browser
typesetting of 963 mathematical expressions with no math errors or display
overflow at 1440 × 1000. All 27 notebook schemas validate. Each new example occurs
once in its source module and once in its assigned dated lesson; all 140 original
source problem IDs remain present. Executable code is unchanged from the
successfully executed Colab-layout revision. See `worked_examples_verification.json`
and `examples/README.md` for the current example data and maintenance procedure.

## Colab table and demonstration layout — prior verification

The three reported Colab issues are addressed in both the fourteen source modules
and the thirteen dated lessons. Self-referential “Open in Colab” links and badges
are removed from notebooks; the course dashboard and syllabus retain their launch
buttons. Notebook navigation still links to other lessons and the course page.

Table blocks now use full-width HTML with explicit column widths. This is necessary
because Colab strips inline CSS and typesets mathematics against the narrow initial
columns of its Markdown tables. Equations retain their LaTeX source. Absolute-value
bars inside mathematics no longer accidentally split table columns.

The shared widget layout places a wrapping control toolbar above the complete
output. It has no fixed-height inner scrolling pane. All three vector demonstrations
combine the graph, legend and numerical table in one 840 × 360 pixel image.
Kinematics, centre-of-mass, inertia and oscillation displays are also shorter, with
related values kept in the same graphic. Repeated callbacks still replace complete
MIME records in one persistent output widget.

In actual Colab rendering, eight representative tables with 43 mathematical
expressions produced no MathJax errors. The SI-prefix table expanded from about
212 × 456 pixels to 1000 × 231 pixels, with all seven conversions on single lines.
Long prose rows use horizontal scrolling when their content cannot fit the screen.
Local browser checks at 1366 × 768 and 1440 × 900 show each Week 1 widget's controls,
plot, numerical table and legend together in a 413–445 pixel-high panel. Thirteen
actual slider/dropdown changes kept the output visible.

All 27 final notebooks passed fresh-kernel execution, with callback-output checks
and matching final code hashes. The source modules retain all 140 numbered problems;
all 13 dated lessons reproduce, and the maintenance pipeline is idempotent.
Current verification is recorded in `notebook_review_verification.json`. Hosted
Colab table rendering and local live widget execution are distinct checks: a local
kernel does not establish that a signed-in Colab runtime has executed successfully.

## Lecture scope and Colab links — prior verification

The course materials now use only the lecture topics and dates. Preparation and
administrative information for the separate practical course have been removed.
Week 11 stays focused on rotational dynamics; the simple-pendulum model remains in
Week 13 with periodic motion. The course page and notebook navigation distinguish
**Open in Colab** from **Download notebook**. Public course synchronization can use
`--public-only` to avoid accessing the separate solutions repository.

This revision changes explanations, navigation and generated calendar content. The
only change inside source-notebook code cells renames a comment in Module 08 to
“Engineering example”;
it does not change a calculation. The fresh-kernel and complete MathJax counts below
are records of the earlier textbook edition, not newly executed checks for this
revision. The published Week 1 mathematics was previously inspected in Colab;
execution of hosted Colab runtimes and widget callbacks was not tested.

The checks for that revision validated all 27 notebooks and their opening Colab links, confirmed
that all 13 dated lessons reproduce, and pass both public and full calendar
synchronization. The unchanged code in 26 notebooks and Module 08’s comment-only edit
have identical executable syntax to the earlier tested edition. Browser checks
at desktop and mobile sizes cover all 13 weekly and 14 source-module Colab actions,
the overview and syllabus links, separate downloads, and the removal of
practical-course information, with no page overflow.

## Screenshot-driven notebook revision — prior verification

The follow-up review addresses the reported Week 1 vector diagrams, missing examples, equation formatting, disappearing interactive outputs, and Week 3 projectile table. Changes were made in all fourteen source modules and rebuilt into the thirteen dated lessons.

- **Mathematics and explanations:** vector components, dot/scalar/vector products, determinants and problem calculations use LaTeX. Worked examples explain signs, units, substitutions and algebra operations. All 140 numbered source problems include substantive Turkish guidance or translations; all 42 source checkpoints now contain concrete activities with worked model responses.
- **Week 1 figures:** component, addition and projection readouts sit outside the diagram. Axis limits include the complete resultant, including two parallel magnitude-10 vectors. Legends replace overlapping labels. Zero-resultant direction is explicitly undefined; projection and original-vector views are separate. The addition methods are correctly named tip-to-tail and parallelogram.
- **Persistent controls:** each slider callback captures its complete PNG/HTML/text result, then replaces the persistent output model in one update. The previous figure remains visible during calculation. Desktop controls remain beside the result; narrow screens use a bounded stacked panel.
- **Week 3 table:** horizontal and vertical equations now use the same time and retain both initial coordinates. A worked example explains each substitution. Equal-height shortcuts and the fact that only vertical velocity vanishes at an apex are stated explicitly.
- **Wider plot audit:** corrected clipped trajectories and arrows, friction/contact conditions, torque and seesaw directions, collision replay, signed rotation, mixed-unit axes, oscillator limits, resonance bandwidth interpretation, and rolling/landing boundaries. These fixes preserve the original problem givens and the adopted schedule.
- **Organization:** dated lessons have working section-navigation links, named visual checks, paper-based Think–Pair–Explain practice, and clearly separated optional material. Week 1 includes the projection explanation as a preview for work, while components and addition remain its core route.

**Prior textbook-edition verification:** all **27 course notebooks** passed schema and fresh-kernel execution checks: **133 source code cells and 37 dated-lesson code cells**. The tested code hashes matched the files at that time. All 140 problem identifiers and 42 source checkpoints were present. Calendar assembly reproduced, calendar/release labels agreed, and refreshing the shared interface was idempotent.

Live JupyterLab checks covered repeated vector updates, the reported 130° component diagram, maximum parallel addition, projection views, rendered equations/determinants/problem answers, the projectile table, and all four lesson navigation links. Desktop (1366 × 900) and narrow (480 × 800) panels were inspected; the narrow controls have no horizontal overflow. Independent plot reviews also exercised representative boundary values and animation frames. These checks sampled parameter combinations in JupyterLab. Published Week 1 typesetting was also checked in Colab; hosted Colab runtime execution and widget callbacks were not tested.

See [the earlier execution and browser-check record](notebook_review_verification.json). The textbook-format edition was prepared for the course website and Colab links. The private solutions were not modified in that follow-up. The corrected source answer keys in modules 06–07 agree with their existing private hand-worked solutions.

## Complete textbook-format pass — prior verification

A second read-through covered every source Markdown cell, including answer disclosures. It removed remaining ASCII formulas, fragmented SI units, ambiguous inline fractions, and overly compressed calculation chains. Source modules 02–14 alone had 245 Markdown cells refined; Module 01 and the generated lesson transitions were also polished. All numerical givens, stable problem identifiers and tested code were retained. The notebook reading guides and course dashboard identify the 11 September 2026 edition.

For that edition, all 976 source/calendar Markdown cells were exported for a complete browser typesetting check. MathJax rendered 5,602 expressions across all 27 notebooks with no parse-error nodes. Code hashes matched the successful execution record at the time of that check.

The old Week 1 screenshot was traced to the earlier online notebook; the local revised section already had LaTeX. Publication therefore includes both the notebook files and the pages that link to them.

## What changed

The main course now contains **13 dated weekly notebooks**, assembled from **14 enriched source modules**. Each weekly lesson contains the material for its actual calendar slot. The source modules include a physics-first reading guide, clearer topic-specific algebra explanations, and expanded worked examples. The sequence is **draw → choose a physical principle → write the equation → rearrange → substitute with units → interpret and check**. English remains the main language, with concise Turkish explanations at difficult steps. Students can complete their reasoning on paper.

Long demonstration code is collapsed and labelled. Written reflection spaces use ordinary text instead of Python string variables. Numerical checks remain optional; students do not need to write programs to follow the solutions.

The separate solutions repository contains **all 140 numbered problems, including their subparts, and all three capstone project walkthroughs**. Every module's ten hand-worked solutions appear before its optional numerical appendix. Missing information or ambiguous geometry is stated explicitly, with conditional answers where needed. Dashboard solution lists now cover all ten problems per module.

**Türkçe:** Amaç kodu takip etmek değil, hesabın neden ve nasıl yapıldığını anlamak. Çözümlerde denklem seçimi, iki tarafa uygulanan cebir işlemi, birimler ve sonucun fiziksel anlamı açıklanıyor. Eksik verilen bir bilgiyi sessizce varsaymıyoruz.

## Demonstrations and controls

- Parameter controls form a wrapping toolbar directly above the full-width result, which uses its natural height without a nested vertical scroller.
- Sliders redraw after release, reducing repeated calculation while dragging.
- Animation playback controls appear above the image in the same output.
- Animations use at most 60 displayed frames, retaining the original calculation data, first/last frames, and first-to-last playback duration.
- Inline plotting is selected explicitly to prevent local kernels from waiting on a separate desktop plot window.

Notebooks remain self-contained: the shared layout code is embedded, so students do not need to download a helper module. Source outputs are cleared to avoid retaining stale graphs; run the setup/layout cells and the chosen demonstration in a live notebook. A static GitHub preview cannot run sliders.

## Adopted lecture calendar — implementation update, 11 September 2026

The supplied 13-row schedule is now the adopted teaching sequence. The main materials are `calendar/Week_01.ipynb` through `calendar/Week_13.ipynb`, with the dashboard, syllabus and course outline organized around those dated weeks. See [the adopted calendar and content arrangement](SCHEDULE_ALIGNMENT.md).

The sequence keeps work/kinetic energy in Week 05, review in Week 06, midterm in Week 07, potential energy/conservation in Week 08, momentum in Week 09, rigid-body rotation in Week 10, rotational dynamics in Week 11, equilibrium/centre of mass in Week 12, and periodic motion in Week 13. Week 03 includes both two-dimensional motion and the introduction to Newton’s laws. Periodic motion and the simple-pendulum model belong to Week 13.

The original fourteen source modules remain available for supporting and extension material, with source problem identifiers retained in the assembled weekly content. This is an actual content/calendar reorganization, not a proposed reading map. The image does not change existing Tuesday class times or grading weights.

**Prior calendar QA:** all 13 weekly notebooks validated and reproduced from the builder. All 37 code cells in the 11 interactive weekly lessons passed fresh-kernel execution; their tested code matched that edition. Review and midterm are paper-only. The dashboard's 13 primary links return the matching notebook files; dashboard and syllabus show the same lecture dates and topics. All 14 release dates agree with the private publisher, whose output matches the expected modules at all 18 before/on-release boundaries. No notebooks were published during these checks.

The weekly selection includes 50 references to source problems, plus worked answers for every new recap, review and demonstration prompt. Independent content review checked the energy/rotation split and Newton introduction. All 41 notebooks across the calendar, source library and private solutions pass schema validation.

## Support for colleagues

The main audience remains Computer and Mechatronics Engineering. The final weekly lessons include short joining recaps, with applications also relevant to Software and Mechanical Engineering. The [teaching handoff](TEACHING_HANDOFF.md) uses the actual calendar notebooks for Weeks 10–13, dated 23 November–18 December. The source modules retain their longer recaps and optional extensions.

## Calculation corrections

The review checked assumptions as well as arithmetic. Substantive corrections include:

| Source modules / problems | Correction or clarification |
| --- | --- |
| 01–03 | Vector and turning-point values; projectile timing and the distinction between airborne motion and motion after landing |
| 04–05 | Sliding versus impending slip; tension/contact assumptions; circular-motion speeds and frictional loop energy |
| 06 | Gravity during vertical spring expansion; departure height versus total rise; an unspecified floor distance is kept conditional |
| 07 | Energy loss and the additional collision required in a three-body sequence |
| 08–10 | Ladder equilibrium, infeasible seesaw geometry, rolling assumptions, massive-pulley dynamics, coupling loss, and mechanical versus electrical energy |
| 11–12 | Initial conditions in damped motion; natural frequency versus displacement resonance; force versus base excitation; feasibility of an isolation target |
| 13–14 | Coherence versus phase, Fourier coefficients, limits of a trench model, rolling distances, and complete project parameter fitting |

The relevant notebook solutions contain the actual derivations and checks.

## Prior verification of the enriched source edition

These earlier checks covered the complete source library and solution collection before the current lecture-scope and navigation revision. They are retained as a record of the tested edition; calendar validation for that edition is recorded above.

- All **28 notebooks** pass notebook-schema validation with unique cell IDs.
- All **14 source-module notebooks** executed from start to finish in fresh Python kernels. Their default interactive callbacks reported no captured errors; code hashes matched the tested source at that time.
- All **45 optional private solution-code cells** execute successfully in fresh per-notebook namespaces, including their assertions.
- The independent early-module arithmetic audit passes **151 checks**; see `phy101-solutions/scripts/verify_weeks_01_05.py`.
- Dashboard and syllabus scripts parse. The dashboard's resource library has exactly 14 solution cards and 140 problem rows, with optional code collapsed. Desktop/mobile navigation, the actual weekly-notebook download, and release checks at Istanbul midnight were exercised in a browser.
- Live JupyterLab browser checks covered a kinematics plot and a wave animation: parameter changes redraw the output, animation playback advances, and controls remain with the output. Desktop (1366 × 768) and narrow (480 × 800) layouts were inspected; the narrow parameter pane has no horizontal overflow.
- All four custom button-driven demos in notebooks 03–04 were exercised in fresh kernels: launch, fire, new target, incline, and Atwood controls produced their expected outputs without captured errors. A first QA run timed out between cells; a grouped-cell retry completed successfully.
- Both repositories pass whitespace checks with their existing Windows line endings (`git -c core.whitespace=cr-at-eol diff --check`). Original line-ending conventions are preserved to avoid unrelated whole-file differences.
- Refreshing the embedded interface leaves all 14 final notebooks unchanged in content, cell IDs, and metadata (checked on temporary copies).

Execution validates code and default parameter choices; it does not prove every possible slider combination or every physical assumption. Hosted Google Colab runtime execution and widget callbacks were not tested; published Week 1 typesetting was inspected in Colab. See [maintenance instructions](tools/README.md) for refreshing embedded controls and rerunning the notebook checks.

The course website uses the revised calendar, source notebooks and course pages from the `courses` repository. The separate full-solution collection retains its scheduled release process.

---

# Revision and verification record — 17 September 2026

## What changed

**1. The departmental constraint is now recorded and machine-checked.** `calendar.json` carries an
`assessment_constraint` block (fixed sequence, common midterm and final, examinable scope = Weeks 01–13
only) and the `Deney` column as a `lab` entry per week. `tools/sync_calendar.py` asserts that the lab
column still matches the departmental schedule, that no experiment measures a week that has not yet been
taught, and that every lab brief and supplement file exists. This makes a well-meant "improvement" that
reorders topics fail the check rather than reach a student.

**2. Laboratory strand added (new `labs/`).** Eight briefs matching the official `Deney` column, plus
`Lab_00_Uncertainty_Toolkit.ipynb` holding all shared technique — reading uncertainty, repeats and the
standard error, propagation, significant figures, linearising to read a slope, and deciding agreement by
counting σ. Each brief opens with a symbolic prediction plus a limiting check, made before the apparatus
is switched on, and marking is explicitly on reasoning about the student's own data rather than proximity
to the accepted value. The Week 11 session needs the simple pendulum two weeks before its lecture, so
Lab 11 §3 is a self-contained derivation and Week 11 carries a matching non-examinable preview.

**3. Numeric policy applied.** `g = 9.81 m/s²` (already consistent), three significant figures in
reported values, one significant figure on uncertainties. **701 over-precise numbers were rounded** across
the 13 weekly and 5 extension notebooks — values such as `96.175745`, `162,051` and `73.575` that came
from calculator output on two- and three-digit data. Protected from the sweep: mathematical constants,
**exact unit-conversion definitions** (rounding `1 ft = 0.3048 m` would be a factual error, not a
precision policy), and the three Week 01 cells where a four-digit number *is* the lesson (`w01-019`,
`w01-045`, `w01-047`). Every notebook now states the convention that displayed intermediate values are
rounded for reading while the arithmetic carries full precision.

**4. Rigour raised without raising the arithmetic load.** The course method gained a step —
*draw → choose a law → rearrange to the symbolic answer → **check a limiting case** → substitute with
units → interpret* — carried by a `wXX-standards` cell in every weekly notebook, which also lists that
week's textbook chapters and laboratory session. Graph-first calculus bridges were added where the
notation earns its place: velocity and acceleration as slopes and displacement as an area (Week 02), work
as the area under `F`–`x` (Week 05), and why a restoring force proportional to displacement *forces* a
sinusoid (Week 13). A `wXX-psrule` cell puts the predict-before-you-open rule at the head of every problem
set, and every interactive demonstration now carries a prediction prompt above it.

**5. Content gaps closed.** Angular momentum (`L = Iω`, `Στ = dL/dt`, conservation) is now taught inside
Week 11, where it belongs to *Dönme Hareketi Dinamiği* — it was previously a stated learning outcome
available only in an optional extension. Week 05's objectives and opening energy account, which had
drifted into Week 08's potential-energy territory, were corrected to work and kinetic energy only. The two
thin weeks gained a full L1–L3 ladder: four extra problems for Week 05 and three for Week 10, written for
the notebooks, carrying no module identifier and keeping their complete reasoning inline.

**6. The double-topic Week 03 is handled openly** rather than silently. Week 02 closes with a projectile
preview and three ten-minute preparation tasks; Week 03 opens with a minute-by-minute plan for its two
topics and says plainly which half to prioritise if only one lands; Week 04 opens with a fifteen-minute
repair block on free-body diagrams, third-law pairs and incline components. No topic was moved.

**7. New material.** `notebooks/Final_Review.ipynb` for the common final (choosing a principle, a
twelve-question self-diagnosis, the formula map grouped by principle, six mixed worked routes, exam
technique and an error-log routine). `extensions/Gravitation_and_Orbits.ipynb` — the biggest gap against
every standard text — as clearly non-examinable enrichment, ending in a transit-light-curve capstone.
A concept pre-check in Week 01 whose answered twin is Final_Review §3.

**8. Documentation.** `COURSE_POLICY.md` (the constraint, the numeric rules, the symbolic-first
requirement, laboratory marking, and the tensions accepted with their mitigations), `TEXTBOOK_MAP.md`
(Young & Freedman / Serway & Jewett / Halliday, Resnick & Walker / OpenStax / MIT OCW per week, plus what
is deliberately excluded and why), and `CONCEPT_INVENTORY.md` (FCI/FMCE pre-post protocol, Hake normalized
gain, and the instruction never to reproduce controlled items in student-facing material).

**9. Web.** The dashboard and syllabus gained a Laboratory column fed from `calendar.json`, a common-exam
and examinable-scope notice, links to the labs, final review, textbook map and policy, and — new — a
**complete static fallback inside `<noscript>`**, so the whole calendar, every lab and every notebook link
work with JavaScript disabled. The syllabus footer named the wrong institution (*Istanbul University*); it
now reads İstanbul Sağlık ve Teknoloji Üniversitesi, matching the `istun.edu.tr` contact address.

## Verification performed

| Check | Result |
| --- | --- |
| `sync_calendar.py --check --public-only` | passes, including the new lab-column and supplement assertions |
| `nbformat.validate` on all 28 notebooks | 28 valid, 0 failed; no duplicate cell ids |
| **Code cells unchanged in all 18 pre-existing notebooks** | confirmed by SHA-256 of concatenated code against pre-revision copies — every edit was to markdown, so the 12 September execution and panel-redraw QA still stands |
| Fresh-kernel execution of the two new notebooks with code | `Lab_00_Uncertainty_Toolkit` and `Gravitation_and_Orbits` both pass |
| `Final_Review.ipynb` | `paper-only`, as intended |
| **Every authored figure recomputed programmatically** | found and fixed real drift: the Lab 00 five-times chain (sum of squares, `s`, standard error, and the propagated `δg` and σ-gap), Week 10 X1 `a_c` and X3 `t₁`, Final Review Route A's wrong-`N` variant and Route E's `v_max`/`a_max`, and the gravitation capstone's `R_p` and `a` |
| 174 relative links across notebooks and docs | all resolve; two apparent failures are LaTeX, not links |
| Inline JavaScript in both HTML pages | `node --check` passes; 4-column headers match 4-cell rows |
| Residual wording | no remaining promise of inline "step-by-step answers"; historical mentions in this report left as the dated record they are |

## Known and deliberately unresolved

- **Week 03 still carries two topics** and Week 11's experiment still precedes its lecture. Both are fixed
  by the departmental schedule; the mitigations above are the available remedy, and
  `COURSE_POLICY.md` §1 records them as accepted tensions rather than oversights.
- **`REVIEW_REPORT.md` references `notebook_review_verification.json`, which is not in the repository.**
  Pre-existing; either restore the file or drop the reference.
- The weekly notebooks were **not** re-executed in fresh kernels this round. Justified by the unchanged
  code hashes above; run `validate_notebooks.py` over `notebooks/` and `extensions/` on a machine with
  `ipywidgets` before the term starts if you want belt and braces.
- The concept-inventory protocol is documented but **not yet run**; it needs ethics approval before the
  Week 01 pre-test if the results are to be published.
