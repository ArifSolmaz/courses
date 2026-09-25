# PHY101 Week 01 — scientific and visual review

Reviewed 21 September 2026 against repository revision `a7d6254` and the live Week 01 page.

**Original verdict (before repair):** the core vector algebra and several checked numerical answers are sound, but the lesson needs corrections before being treated as scientifically reviewed. There are also two material presentation defects: incomplete visible problem statements and distorted mobile animation geometry. The following tables record the initial audit; the repair and verification record below supersedes this verdict.

## Original scientific findings (resolved below)

| Priority | Location / notebook cell | Finding and correction |
| --- | --- | --- |
| High | §1.5, `w01-021` | Uncertainty is incorrectly defined as the difference between two measurements and equated with error. A discrepancy between readings is not their uncertainty. Distinguish measurement error from uncertainty; discuss resolution, repeatability, calibration and technique. Digits alone do not establish a numerical uncertainty or coverage probability. The watch example also confuses display resolution with measurement precision. Update the Turkish explanation too. |
| High | §1.10 bridge, `w01-meaning-products` | “The normal force on a sliding block never appears in an energy budget” is false without a stationary-surface assumption. A moving support can do work. State that the normal does zero work when perpendicular to the instantaneous displacement in the chosen frame. Qualify `W = F·Δr` as a constant-force result. |
| High | §1.1, `w01-011` | A well-established theory does not become a law. Laws describe relationships; theories provide explanatory frameworks. Rigid links and massless cables are idealizations in a model, not each a physical theory. An anomalous measurement also needs checks of uncertainty and assumptions before claiming falsification. |
| Medium | §1.3, `w01-013` | The kilogram definition took effect on **20 May 2019**, following the 2018 decision. Both the English table and Turkish summary currently say 2018. Describe the second using the unperturbed ground-state hyperfine transition of caesium-133. The pre-1967 history omits the ephemeris second. |
| Medium | §1.3 and Example 1.1, `w01-013`, `w01-015` | Distinguish pound mass (`lb`) from pound-force (`lbf`). The purported exact force conversion is also missing its final digit: `1 lbf = 4.4482216152605 N`. The international mile is exactly `1609.344 m`, not `1609 m`. For 763.0 mi/h, the unrounded result is 341.09152 m/s: 341.1 m/s to four significant figures, or 341 m/s under the course's three-figure policy. If retaining a textbook's approximate conversion, mark it approximate and explain why. |
| Medium | Example 1.2, `w01-016`; §1.4, `w01-014` | The text calls `in²·cm` “not a volume”; it does have volume dimensions, but is an inconvenient mixed-unit expression. Likewise `min²/s` has time dimensions and is not nonsense; it simply has not achieved the requested conversion to seconds. This distinction matters in a lesson on dimensional analysis. |
| Medium | §1.7, `w01-026` | Magnitude is **nonnegative**, not “always positive”: the zero vector has magnitude zero. Correct the Turkish text too. |
| Medium | §1.10, `w01-040` | “All unit vectors … are mutually perpendicular” is false. The chosen Cartesian basis vectors i, j, k are mutually perpendicular; arbitrary unit vectors need not be. |
| Medium | Example 1.6, `w01-030` | Part (b) specifies 37° from +y but does not say toward +x; without the referenced textbook drawing this is ambiguous. Add the direction or a local sketch. Part (a)'s rounding explanation is contradictory and invents a figure-based precision justification. Specify whether 45° is exact/idealized or measured, then apply a consistent precision convention; do not claim that trigonometry itself makes the third digit unsupported. |
| Medium | VP1.10.4, `w01-060` | The supplied work and x-component fix Fy, but not Fz. The reported force magnitude and angle silently assume Fz = 0. Explicitly state that the constant force lies in the xy-plane; otherwise part (b) is underdetermined. |
| Medium | VP1.10.2, `w01-058` | Quadrants I and IV alone do not guarantee an obtuse angle or negative dot product. Use the actual directions (55° and approximately −60.3°) to justify the 115° separation. |
| Low | §1.8 and equation summary, `w01-029`, `w01-048` | The arctangent warning handles quadrant ambiguity but should also address Ax = 0: use ±90° for a nonzero vertical vector; the zero vector has no direction. Angle-between-vector formulas require both vectors to be nonzero. |
| Low | Checkpoint 2, `w01-028` | It asks for two impossible options independent of the magnitudes, but only a negative magnitude is universally impossible. Zero is possible for equal vectors. Rewrite the prompt to distinguish the general prohibition from the restrictions imposed by 3 m and 4 m. |
| Low | Bridging problem, `w01-051` | Remove the redundant `…/1 ÷ 1` from the symbolic work expression. Explain the vertical-wall limit as a loss of the normal-load constraint, not a physical permission for infinite weight. Make clear which rounding policy is used for the 35° input. |

## Visual and functional findings

1. **High — worked-example folding hides the problem itself.** On the live page, Examples 1.7, 1.8 and 1.10 hide their displayed givens behind “Show the worked route.” Example 1.8 visibly ends at “Given the two displacements”; Example 1.10 ends at “Find the angle between the vectors.” A student cannot attempt either without revealing the solution. `tools/build_site.py:fold_examples()` splits at the first closing paragraph rather than the start of the solution. Keep all problem paragraphs, equations and lists visible; fold at an explicit solution marker.
2. **High — mobile vector geometry has unequal display scales.** At 390 px viewport width, the component canvas had a 353 × 340 backing size but rendered at 318 × 340 CSS pixels. Horizontal compression changes apparent angles. At the 45° setting the readouts correctly give equal components, but the plotted arrow is steeper than 45°. Size the canvas from its actual content box and calculate one pixels-per-unit scale from both available dimensions. Recheck after resizing and revealing the prediction panel.
3. **Medium — long equations require hidden horizontal travel.** The three cross-product component equations are on one line. At 390 px, the equation container is 321 px wide while its content is about 597 px wide. The end is also outside the initial visible card at 1280 px desktop width. This is locally scrollable, not missing mathematics, but there is little indication of more content. Put Cx, Cy and Cz on separate aligned lines. Apply the same treatment to lengthy substitution chains.
4. **Medium — two competing equation-number systems.** The prose promises textbook numbering, but the automatic card calls the cross-product components “Key equation 1.6,” while the textbook reference is (1.25). Use “Key relation 6 · textbook (1.25)” or the textbook number alone. This is especially confusing because textbook (1.6) is the magnitude formula.
5. **Medium — mobile teaching density.** Turkish notes become full-width blocks, several prediction instructions repeat, and the first lesson is long. The topic picker helps. Keep one prediction prompt per demonstration and make the core in-class path explicit without removing scheduled topics.
6. **Low — inconsistent bilingual heading handling.** “Section 1.3: Standards and units / Standartlar ve birimler” remains a single heading while neighbouring Turkish titles become subtitles. `split_bilingual()` relies on Turkish-specific characters, absent from this particular translation. Use explicit bilingual metadata or a reliable delimiter rule.
7. **Low — animation wording.** The three-vector animation offers three orders although its heading says six routes; either expose all six permutations or describe the available three. “147.5 m between them” should be “147.5 m each” for contestants following all three legs. The resultant calculation itself agrees with the example.

## Checks completed

- Read the Week 01 notebook explanations, worked examples, variations and problem answers; inspected the generator and Week 01 animation code for the reported defects.
- Inspected the live lesson at 1280 px desktop and 390 px mobile width, including all four static vector figures, worked-example disclosure and the component animation.
- No KaTeX error elements were found. The page has no document-level horizontal overflow at either inspected width; individual long equations still need scrolling.
- Checked the products animation at 0° and 180°: dot products +20 and −20, cross-product magnitude zero, direction correctly reported undefined. Checked the component display at 1° and 45°; numerical readouts were correct.
- Recomputed selected examples/problem answers: exact mile conversion; cylindrical-pin volume 452.624… mm³; drone resultant (554.325…, −12.719…) m, magnitude 554.471… m, return bearing 271.314…°. The pin and drone reported rounded answers agree.
- Site verification passed **398 checks across 13 generated pages**. This verifies reproducibility/structure, not scientific correctness.
- Did not execute the Colab notebook or verify its five widget demonstrations in a running notebook frontend. Did not independently establish the claimed exact correspondence to every Young & Freedman 15e example/equation number. Those claims require comparison with the authorized edition.

## Primary references used

- [BIPM: SI definitions and implementation date](https://www.bipm.org/en/measurement-units)
- [BIPM: 2018 resolution, effective 20 May 2019](https://www.bipm.org/en/-/resolution-cgpm-26-1)
- [NIST: basic definitions of measurement uncertainty](https://physics.nist.gov/cuu/Uncertainty/basic.html)
- [NIST: mile conversion](https://www.nist.gov/pml/us-surveyfoot/revised-unit-conversion-factors)
- [NIST: pound-force](https://www.nist.gov/glossary-term/29611)
- [NASA teaching material: scientific theories and laws](https://solarsystem.nasa.gov/genesismission/educate/diffangle/exploringorigins/pdf/TinM-StudentText.PDF)

Recommended repair order: uncertainty and physical assumptions; incomplete problem statements; mobile graph scaling; equation layout and numbering; remaining wording/precision corrections. Preserve topic order, notebook cell IDs and the fixed departmental schedule.

## Repair and verification — 21 September 2026

All scientific findings above have been addressed in the canonical Week 01 notebook, including the English and Turkish explanations. The new definition of uncertainty distinguishes error, resolution, precision and accuracy; force/work assumptions and vector edge cases are explicit. Exact conversion definitions are preserved.

The user-provided Young & Freedman 15e textbook was checked for Example 1.6 and Chapter 1 Exercises 1.1–1.5, 1.11–1.14, 1.24, 1.26–1.27, 1.30–1.33, 1.36, 1.39–1.40, 1.42–1.44 and 1.47–1.48 (printed pp. 27–29). These 24 exercises have course-authored solutions, bringing the lesson to 44 worked examples. The extra practice is optional and does not alter the departmental schedule or assessment. Publisher files are not included in the repository.

Visual repairs include complete visible problem statements before disclosure, aligned multi-line calculations, textbook equation numbering, equal coordinate scales at all widths, stacked mobile product plots, shortened mobile annotations and six addition orders. The shared disclosure correction also regenerates the other week pages.

### Verification evidence

- `node tools/verify_week01_animations.cjs`: all supported component magnitudes/angles, product magnitudes/angles, six addition orders at 1001 time positions, and five canvas widths. Checks actual Scene transforms, numerical readouts, finite coordinates, axis limits and equal scales.
- `python tools/verify_week01_notebook.py --output-dir /tmp/phy101-week01-qa`: notebook execution, all three graphical panel callbacks, 453 conversion cases across every unit pair (positive, zero and negative values), dimensional consistency and unknown-symbol rejection; 13 boundary plots rendered.
- Notebook plots visually inspected for zero vectors, 45° components, reversed addition order and antiparallel products.
- Browser review at 390 px and desktop width: animation controls, mobile product stacking, route selection, worked-solution disclosure and KaTeX rendering.
- `python tools/verify_site.py`: 398 checks across 13 pages, including reproducible generation.

These checks support confidence in the implemented mathematical behavior; they do not claim proof against every browser or a live Google Colab service failure. The notebook was executed in a fresh local Jupyter kernel with widget callbacks exercised, rather than through a signed-in Colab session.


## Illustrated solution review — 21 September 2026

Reviewed every new drawing individually at its rendered resolution, checked its question/solution pairing, and checked all 22 image bounds at desktop and 390 px phone width. Original diagrams are generated by `tools/draw_week01_solutions.py`; they are not textbook figure scans. Full-size links support inspecting small labels on phones. Two-dimensional vector axes use equal scales. The wire and light-travel diagrams are explicitly schematic; the 3D view is explicitly perspective.

| Exercise | Individual visual and scientific checks |
|---|---|
| 1.1 | Conversion sequence, direction of ratios, title and box spacing |
| 1.2 | Three-dimensional cube, dashed hidden edges, cubed conversion |
| 1.3 | Start/finish, light direction, distance dimension and travel time |
| 1.4 | Cube edges and cubic metres/cubic centimetres relation |
| 1.5 | Giga prefix, successive time conversions, 365-day assumption |
| 1.11 | 12:5.98 side ratio, area/perimeter expressions and labels |
| 1.12 | Radius rather than diameter, axial length, schematic warning |
| 1.13 | Reference and approximation separated, signed error definition |
| 1.14 | Six-significant-figure values, independent comparison rows |
| 1.24 | Four component pairs, quadrants, endpoint labels and units |
| 1.26 | Negative components, 34° clockwise from negative y, angle arc |
| 1.27 | Negative x/positive y, 32° counter-clockwise from positive y |
| 1.30 | All three component pairs, distinct units, quadrant titles |
| 1.31 | N/W/S route, head-to-tail connections, resultant endpoint |
| 1.32 | Required downward sum, identical translated B, corrected component |
| 1.33 | All three constructions, reversed vectors, resultant directions |
| 1.36 | Difference from B head to A head and its copy at the origin |
| 1.39 | 3D components, common origin, perspective and equal axis spans |
| 1.40 | Acute included angle and common origin |
| 1.42 | Clockwise A-to-B rotation, negative-z cross-product direction |
| 1.43 | Obtuse/acute arcs and geometrically perpendicular third pair |
| 1.44 | Parallelogram edges, 120° included angle, opposite normals |

Removed arrow endpoint padding, moved labels away from shafts, separated dense titles, clarified the 3D origin, and replaced the light-travel flowchart with a physical schematic. Browser checks found no missing drawings, no KaTeX errors and no whole-page horizontal overflow. All 398 site regeneration checks passed. Numerical answers were cross-checked with the supplied instructor manual; its Exercise 1.32 transposed intermediate component is documented in the solution.
