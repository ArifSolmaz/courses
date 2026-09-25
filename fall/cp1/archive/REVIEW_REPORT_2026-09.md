# CP1 review: recommendations implemented

Updated 11 September 2026. All actionable recommendations from the course audit have been applied. The 14-week topic sequence and planned review sessions remain in place. Actual CP1 teaching and examination dates still require the official dated timetable; none have been inferred from PHY101.

**Türkçe:** İncelemedeki içerik ve kullanım sorunları giderildi. On dört haftalık konu sırası, molalar ve tekrar süreleri korundu. Her alıştırma için açıklamalı çözüm eklendi. Resmî CP1 tarihleri verilmediği için takvim tarihleri tahmin edilmedi.

## Light and dark theme correction — 11 September 2026

Code examples now pair their text and surface colors in both themes, with a larger
reading size. Syllabus labels, table headings, ordinary links and button focus use
readable theme colors. On screens up to 600px wide, syllabus schedule and grading
rows stack into labelled cards. Updated asset versions make browsers fetch the
corrected styles.

Browser checks cover all 14 weekly dashboard panels and the full syllabus in light
and dark mode at 1440, 390 and 320 px: **90 states**, with no detected text-contrast
failures or horizontal page overflow. Code-block contrast is at least **13.66:1 in
light mode** and **16.02:1 in dark mode**. The existing course structure/coverage check
also passes. Notebook content and execution records are unchanged.

## Start here

- [Course dashboard](web/CP1_Course_Dashboard.html)
- [Simple English/Turkish study guide](STUDY_GUIDE.md)
- [All worked solutions](solutions/README.md)
- [Syllabus](web/CP1_Syllabus.html)

## What changed

| Audit finding | Applied correction |
|---|---|
| Wrong final-project answers and dashboard description | Week 14 now consistently uses the three-column, 20-record sensor dataset. The dashboard links the existing lesson and solution notebooks. All displayed counts, means, sensor ranges and output filenames agree. |
| Untouched starters reported as complete | Replaced execution-history inference with an explicit student self-report. Untouched notebooks report zero reviewed exercises. Concept checks and practice reflection have separate labels; neither is a submitted grade. Invalid reflection input clears stale results. |
| Incorrect expected answers | Corrected W02 string length and formatting width; W06 temperature mean/hot-hour counts; W09 character count and sensor maximum; W10 BMI; W11 discounts and the physics model; W13 weighted grades; W14 statistics and cleaned-data filtering. |
| Dashboard exercises and copied code disagreed with notebooks | Exercise IDs, titles, objectives and workload now come from the notebooks through a synchronization script. Each week has clear lesson and full-solution links. Static HTML preserves Python backslash escapes, fixing the W13 copied-code failure. |
| Checkpoints preceded their lessons | Moved or replaced premature checkpoints and added explanations for comprehensions, dictionary operations, tuple returns, mutation and local rebinding. Difficult examples include traces, step-by-step reasoning and Turkish notes. |
| Core capstone could not deliver the advertised tool | W14 Exercises 1–10 are core, including saving the report and assembling the program. Exercises 11–12 are optional. The five-hour roadmap distributes project work across the session and retains four breaks plus final review. |
| Grading and workload contradictions | Syllabus and outline now consistently describe private weekly practice. Assessment consists only of the midterm exam (50%) and final exam (50%). Weekly notebooks, exercises, projects, demonstrations and presentations are ungraded practice; no weekly submission is required. Exercise counts match the actual notebooks, and provided worked solutions are explicitly permitted study aids. |
| Incomplete solutions and weak validation guidance | Added complete solutions for every numbered exercise and every bridge/preview. Validation covers finite values, malformed records, unknown sensors, invalid timestamps, empty groups and file-level errors. Replaced the protected-system-file writing example with a simulated permission error. |
| Misleading small explanations | Clarified `isdigit()` scope, mutation versus return value, Boolean loop conditions, pyramid centring, continuous BMI ranges and first-occurrence ties. Supplied missing demonstrations and explained the small standard-library tools used in the project. |
| Notebook format warnings and display issues | Added stable, unique cell IDs and validated every notebook without schema warnings. Restored mobile topic names and improved light-theme contrast. |

## Complete solution coverage

| Material | Count |
|---|---:|
| Lesson notebooks | 14 |
| Complete solution notebooks | 14 |
| Numbered exercise slots | 171 |
| Core exercise slots | 114 |
| Optional exercise slots | 57 |
| Bridge exercises and preview walkthroughs | 13 |
| Total worked sections | 184 |

Weeks 1–13 have eight core exercises each. Week 14 has ten core milestones, including the supplied dataset setup. The solution set includes 11 bridge exercises and the two introductory preview walkthroughs.

Solutions contain the task and required data, specific English reasoning, Turkish explanations, executable Python and expected results or checks. They run in order without live keyboard input. A short reading guide explains assertions, numerical tolerances and paired test cases. Student notebooks retain editable exercise cells.

## Final project agreement

The input is `sensor_data.csv`, with columns `timestamp,sensor,value`. Of its 20 records, 15 are valid and 5 are rejected.

| Sensor | Valid count | Mean |
|---|---:|---:|
| Temperature | 6 | 23.02 |
| Humidity | 5 | 45.38 |
| Pressure | 4 | 1012.86 |

The full program produces `sensor_data_clean.csv` and `sensor_report.txt`. A negative temperature within the stated range remains valid. Unknown sensors, malformed rows, invalid timestamps and nonfinite readings receive rejection reasons. Empty groups retain `None` statistics and display `N/A`. Empty and header-only files are handled explicitly; a wrong header or missing file returns a clear file-level error. The optional specified time filter returns six cleaned readings.

## Verification

- **28/28 notebooks passed in fresh Python 3 Jupyter kernels:** 557 lesson code cells and 252 solution code cells, **809 total**. Each notebook ran in its own temporary working folder; finite sample replies exercised interactive lesson examples.
- All reference-solution checks passed, including boundary cases and the complete sensor pipeline's persisted outputs, empty input, malformed records and error paths.
- All notebooks pass schema validation without warnings, with unique cell IDs. Coverage checks confirm one complete labelled solution section for each required exercise and bridge/preview.
- Regression checks verify that untouched starters cannot imply completion and invalid self-reports cannot retain an earlier completion count.
- The execution harness was independently checked for fresh-kernel isolation, repeated prompts, preservation of source arrays/strings and native outputs. Saved examples abbreviate the temporary execution-directory name as `[runtime folder]`.
- Browser checks exercised all 14 week panels and all 28 notebook downloads. W13 code copied from the rendered page compiles with literal newline escapes preserved. Desktop, mobile and light-theme layouts were reviewed.
- 116 local and repository-backed page links resolve to existing files. Dashboard JavaScript syntax checks and Git whitespace checks pass.
- [Machine-readable verification](verification.json) records each successfully executed notebook, code-cell count and code hash. These hashes match the final notebook code.

An initial integrated run caught the legacy Week 1 `record_checkpoint` interface after the shared-helper update. Compatibility was restored and all 14 lesson notebooks were rerun successfully. The 14 solution notebooks had already passed; their code was unchanged.

## Keeping the course synchronized

The [maintenance instructions](tools/README.md) describe preparation, synchronization and verification. The dashboard, outline counts, syllabus topic table and solution index are generated from the notebooks and their metadata. Re-run these tools after course edits rather than maintaining separate exercise lists manually.

Colab links open the published repository copy. Open a fresh notebook from the course dashboard to use the latest published revision; an existing Colab tab or personal copy may retain earlier content. No live student Colab session or official dated CP1 calendar was available for verification.
