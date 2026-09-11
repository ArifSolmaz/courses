# PHY101 notebook and solutions review

Reviewed 11 September 2026 against the local course notes, the lecture column of the supplied schedule image, and the separate `phy101-solutions` repository.

## Lecture scope and Colab links — current revision

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

Current checks validate all 27 notebooks and their opening Colab links, confirm
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

- Parameter controls sit beside a bounded, separately scrolling output area on desktop. On narrow screens they stack above a shorter output area.
- Sliders redraw after release, reducing repeated calculation while dragging.
- Animation playback controls appear above the image and remain visible while its pane scrolls.
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
