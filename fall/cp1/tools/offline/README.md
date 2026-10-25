# Complete CP1 offline notebooks

Build all 14 weeks with `python3 fall/cp1/tools/offline/build.py --all`, or one with `--week 5`. Only the maintainer build downloads dependencies. `assets.json` and `science-assets.json` pin official distribution assets by SHA-256. Outputs are `fall/cp1/offline/CP1_Week_XX_Offline.html`: about 16.3 MB each for Weeks 1–12 and 33.8 MB for Weeks 13–14.

Each single HTML includes the complete maintained lesson notebook and its complete worked solutions. Students can open the hosted page or download the HTML before class and open it in a normal browser. Python runs inside a worker; no Python installation, Google account, local server or classroom network is needed after downloading. The weekly pages and dashboard resource panels link to each edition.

### Week 6 guided edition

Week 6 is an instructor-approved offline-specific edition, authored in
`week06.py`. It replaces the old offline lesson/practice/solution sequence with
14 main activities and 10 optional activities (the approved 20A–C and 21A–B cards
are individual runnable activities). All teaching content is English. Every
activity has Predict, Run, and Change one thing steps, complete independent code,
and a single requested edit. Harder activities are explicitly labelled Optional.
The original Colab notebooks, solutions and web-course pages are unchanged.

Rebuild with `python3 fall/cp1/tools/offline/build.py --week 6`, then run
`python3 fall/cp1/tools/offline/verify_week06_guided.py`. This checks exact outputs
for all 24 starting programs and all 24 requested changes, optional labels,
English-only content, step coverage and source/HTML parity. The older Week 6
boundary and explanation verifiers still check the original notebook editions.

### Week 7 guided edition

Week 7 uses the approved draft in `week07.py`: 12 main activities and 13 optional
activities, all in English. Each independent program has Predict, Run, and Change
one thing steps. This replaces the former offline lesson/practice/solution
sequence; the original Colab notebooks, solutions and web-course pages remain
unchanged. Harder counting, grouping, reporting and parsing examples are optional.

Rebuild with `python3 fall/cp1/tools/offline/build.py --week 7`, then run
`python3 fall/cp1/tools/offline/verify_week07_guided.py`. It executes all 25 starting
programs and all 25 requested changes and verifies their exact outputs, labels,
English step structure and source/HTML parity. The older Week 7 boundary and
explanation checks continue to verify the original notebook editions.

## Interface and persistence

Weeks 6–7 provide per-cell **Undo last change** and **Restore original code**
buttons beside Run. Undo (also Ctrl/Cmd+Z in the editor) walks back up to 100
recent edit events in that cell. Restoring the original code can itself be undone.
The original always comes from the page's authored example, even after opening
saved work. Histories are session-only and reset when a saved notebook is opened;
they survive running cells and restarting Python. Both actions update saved code
without running it or changing Python variables. An English note reminds students
to rerun to update the output. Other cells keep their own edits and histories.

The open left sidebar highlights the current section during scrolling and follows the active entry inside its own scroll area. The top toolbar is not sticky. The notebook uses the available page width, with aligned Code and Output panels on laptops. They stack on phones (650 px or narrower) and in the narrow sidebar layout (851–1000 px). Input values sit below both panels and are hidden when the code has no direct input() call. Visibility updates as code is edited; an EOFError also reveals inputs for indirect calls. Comments and ordinary string examples do not create input boxes. Weeks 01–14 have been rebuilt with this layout; rebuilding other weeks applies the shared template. All teaching disclosures, helper code and error details are expanded. Code/input textareas grow to their wrapped content on edits and layout changes; outputs have no fixed-height scroll box. Code is editable, Run and Shift+Enter execute a cell, and Stop/restart terminates Python while preserving edits. `input()` consumes the cell's pre-entered lines; lesson examples have editable sample responses.

Save notebook exports `.ipynb` with edited code, input values, stdout and plots. Open saved work accepts the matching week and restores code, inputs and safe outputs without executing code. Variables are not saved: rerun setup cells after reopening. Markdown remains the trusted original. There is no cloud sync or automatic persistence.

Lesson and solution code have separate global namespaces and working directories. This prevents ordinary solution examples supplying hidden variables/files to practice, but is not a security boundary against deliberate Python code. In normal Jupyter/Colab the exported combined notebook uses one kernel; restart between lesson and answers there.

Weeks 11–14 show generated files in “Python files in this session,” with download buttons. Runtime files disappear on restart and are not included in the notebook export; save them separately or rerun their creation cells. The file list is limited to 100 files, four directory levels and 10 MB per downloadable file. Weeks 13–14 bundle NumPy, Matplotlib and their dependencies; figures render inside the Output panel beside the code on laptops (below on narrow screens) and are saved in notebook output. Week 12 uses ordinary `with open` setup code in both the source notebook and HTML.

## Runtime and limitations

Core engine: Pyodide 0.29.2 / Python 3.13. Scientific packages: NumPy 2.2.5, Matplotlib 3.8.4 with the Agg renderer. Markdown: marked 15.0.12 and DOMPurify 3.2.7. Core license text is embedded; scientific wheels retain their license files.

CSP uses `connect-src 'none'`. Worker fetch resolves only embedded assets at a synthetic URL, with no network fallback. No arbitrary package installation, notebook widgets or Colab services are included. External links need internet. Stdout/stderr is capped at 400 messages per run; Stop/restart can interrupt an infinite loop. Browser policy can independently restrict local scripts, WebAssembly or downloads, so the actual managed classroom PCs still need a compatibility trial.

Python failures show the real exception, the student cell/line, an excerpt, a short hint and Go to line. Full internal traceback is under Technical details. Hints are guidance, not correctness grading.

## Verification

- `python3 fall/cp1/tools/offline/verify_all.py`: executes 541 lesson cells and 252 solution cells in independent temporary folders, with preset input. Requires local NumPy and Matplotlib. Includes supplied answer assertions; empty practice placeholders remain student work.
- `python3 fall/cp1/tools/offline/verify_week03.py`: 72 Week-3 cells and 36 additional boundary/invalid-input cases.
- `node fall/cp1/tools/offline/verify_errors.cjs`: syntax location, cross-cell traceback, nine common exceptions and unknown fallback.
- Browser checks on 2026-10-02: Week-13 embedded scientific runtime starts under the no-network CSP; a full solution renders a PNG and creates its downloadable file. Week-12 converted setup writes a file which the following read cell reads correctly. Sidebar tracking and nonsticky toolbar visually checked. These localhost previews exercise the same embedded runtime; they are not a test on the managed classroom PCs.
- Earlier basic-runtime checks in Safari/Chrome opened HTML directly from disk, ran Python, interrupted an infinite loop and verified notebook save/reopen. The later scientific bundle has not been tested directly from disk on every browser. In-app browser download-event automation timed out, so it does not establish successful disk download for the new PNG control.

- `python3 fall/cp1/tools/offline/verify_week04_05.py`: executes all 143 lesson/solution code cells, checks input visibility, and tests both temperature stopping outcomes.

- `python3 fall/cp1/tools/offline/verify_content_parity.py`: compares every Week 1–14 lesson and solution cell with the embedded HTML, permits only platform-specific instructions, and executes the original notebooks to verify their saved outputs. Week 5 sample input responses live in notebook cell metadata and are reused by the HTML builder.

- `python3 fall/cp1/tools/offline/verify_week06.py`: tests 20 changed-data/boundary cases against the actual teaching code and verifies all 13 published solution outputs.

- `python3 fall/cp1/tools/offline/verify_week07.py`: tests 20 changed-data/boundary cases and all 13 published solution outputs, including empty groups, tied maxima, dictionary order and repeated unknown IDs.

- `python3 fall/cp1/tools/offline/verify_week08.py`: checks 20 boundary cases and all 13 expected outputs against both student notes and worked solutions.

- `python3 fall/cp1/tools/offline/verify_week09.py`: checks function return values and absence of unwanted printing on 51 boundary/changed-input cases, plus all 13 student/solution outputs. Covers calibration endpoints, empty data, dynamic pressure, calculator errors and local/global scope.

- `python3 fall/cp1/tools/offline/verify_week10.py`: checks all 13 student/solution outputs and 55 boundary/behavior cases, including shared-list mutation, sensor call order, equal exam weights, refactoring parity and empty reports.

- `python3 fall/cp1/tools/offline/verify_week11.py`: verifies all 13 student/solution outputs and 71 boundary/error cases, including live-input exhaustion, missing versus zero readings, nonfinite calculations, absolute-zero boundaries and 50/50 exam weights.

- `python3 fall/cp1/tools/offline/verify_week12.py`: verifies all 13 exercise outputs and 28 file/edge-case checks in disposable folders. Covers CSV quoting and multiline source tracking, rejection exports, unchanged raw input, rerun behavior, empty datasets, appending, and 50/50 exam scores. The parity runner also isolates all file-producing notebook runs.

- `python3 fall/cp1/tools/offline/verify_week13.py`: verifies all 13 student/solution outputs and 46 numerical, boundary, CSV and plot checks. Covers tied peaks, moving-average ties, constant-column normalization, invalid timestamps, finite data, calibration range, one-row CSV shape and PNG creation.

- `python3 fall/cp1/tools/offline/verify_week14.py`: verifies all 12 milestone outputs and 64 pipeline, boundary, export and plot checks. Covers empty/all-rejected logs, duplicate readings, timestamps, inclusive limits, nonfinite data, CSV quoting, rejection round trips, unchanged raw input, reruns, file-level failures and labelled plots.

- `python3 fall/cp1/tools/offline/verify_week04_explanations.py`: checks walkthrough coverage for all 73 Week 4 code cells (436 non-comment lines), four comment-only starters and three syntax templates. Source hashes and exact line references detect explanations that become stale after code edits. The notebooks retain full walkthroughs below their code. Weeks 1–14 HTML show numbered code with one selected-line explanation beside the output; Edit code opens a numbered editor. Duplicate teaching comments are removed from executable examples, and practice instructions are kept in their explanations. Edited code disables the authored explanation until restored, avoiding incorrect line references.

- `python3 fall/cp1/tools/offline/verify_week05_explanations.py`: checks all 70 Week 5 lesson/solution code blocks, 491 executable lines and 13 practice starters. Source hashes, displayed line numbers and notebook text must match the selected-line explanations. Inactive infinite-loop comparisons are preserved as comments; ordinary repeated teaching comments move into the walkthrough.

- `python3 fall/cp1/tools/offline/verify_week06_explanations.py`: checks synchronized Line focus explanations for all 44 Week 6 code blocks and 441 executable lines, including lesson examples, exercise setup and worked solutions. The Week 6 boundary checker selects exercises from metadata so removing presentation comments and inserting walkthroughs cannot shift its targets.

- `python3 fall/cp1/tools/offline/verify_week07_explanations.py`: checks all 48 Week 7 code blocks and 421 executable lines for synchronized selected-line explanations. The boundary checker uses exercise metadata and verifies the published outputs independently of walkthrough placement.

- `python3 fall/cp1/tools/offline/verify_week08_explanations.py`: checks all 55 Week 8 code blocks and 491 nonblank, non-comment code lines, including lines inside multiline strings. Notebook walkthroughs match selected-line explanations; the boundary checker finds exercises through metadata and verifies both student-facing and solution outputs.

- `python3 fall/cp1/tools/offline/verify_week09_explanations.py`: checks all 49 Week 9 code blocks, 376 nonblank non-comment code lines and 12 comment-only practice starters. Multiline docstring contents and executable behavior are preserved, and function boundary/output checks locate cells through metadata.

- `python3 fall/cp1/tools/offline/verify_week10_explanations.py`: checks all 51 Week 10 code blocks, 621 nonblank non-comment lines and 13 comment-only practice starters. Scope, mutation, composition and report examples retain their behavior; 55 boundary checks and all 13 exercise outputs pass.

- `python3 fall/cp1/tools/offline/verify_week11_explanations.py`: checks all 56 Week 11 code blocks, 794 nonblank non-comment lines and 13 comment-only starters. Error-handler, return and finally explanations distinguish failures from valid zero results. The retry reader clamps negative attempt limits to zero; 72 error/boundary cases and all 13 exercise outputs pass.

- `python3 fall/cp1/tools/offline/verify_week12_explanations.py`: checks all 60 Week 12 code blocks, 581 nonblank non-comment lines and 13 comment-only starters. File writes, printed output, append/overwrite behavior and CSV parsing limits are explained separately; 28 file/edge-case checks and all 13 exercise outputs pass.

- `python3 fall/cp1/tools/offline/verify_week13_explanations.py`: checks all 48 Week 13 code blocks and 689 nonblank non-comment lines, including supplied exercise data. Array axes, masks, population standard deviation, moving-window ties, physical units and calibration assumptions are explained; all 13 exercise outputs and 46 numerical/boundary/CSV/plot checks pass.

- `python3 fall/cp1/tools/offline/verify_week14_explanations.py`: checks all 31 Week 14 code blocks, 445 nonblank non-comment lines and 11 comment-only starters. All 12 exercise outputs and 64 pipeline/boundary/export/plot checks pass. On laptop screens, Week 14 long code and text-output panels scroll internally so explanations and plots remain alongside each other; all content remains available, with full flow on narrow screens and in print.

## Weeks 1–14 output links

After running a cell, selecting a numbered line highlights the stdout fragments produced by that statement. Loop/condition headers also select output produced inside their bodies. Attribution is captured during actual execution, including repeated prints and calls to helpers defined in other cells; it is not guessed from expected output. Statements with no printed output show a short note. Code edits suspend old highlights until rerun. Saved notebook outputs retain plain text; reopen and rerun to recreate output links. The Week 1–14 builds enable this capture.

- `python3 fall/cp1/tools/offline/verify_output_trace.py`: tests nested loops, nonprinting assignments, partial-line writes, multiline calls, cross-cell helpers and error cleanup; checks repeated input prompts and continue behavior, and compares captured stdout with normal execution for all 794 Week 1–14 cells. File examples execute in separate temporary folders for plain and traced runs; generated file contents must also match, and file writes must not be attributed as printed output.

Weeks 13–14 also link explicit `plt.show()` calls to their displayed plots. Selecting `savefig` does not claim a displayed plot: it writes a file. Automatically displayed figures without an explicit active-cell display call have no invented line attribution. Edits clear both text and image highlights until rerun.

- `python3 fall/cp1/tools/offline/verify_plot_trace.py`: checks distinct figure displays, PNG payloads, cross-cell display helpers, untraced automatic display and figure cleanup.

## Weeks 1–3 completion

All 211 early-week lesson and solution code blocks use synchronized numbered Line focus explanations: Week 1 covers 370 lines, Week 2 covers 476, and Week 3 covers 553. Comments that are the subject of a lesson, deliberately commented-out errors, and comment-only practice starters are preserved. Ordinary duplicate teaching comments move into the explanations.

- `verify_week01_explanations.py`, `verify_week02_explanations.py`, and `verify_week03_explanations.py` check every active line, source hash, and notebook/HTML explanation pair.
- `verify_early_examples.py` checks equal midterm/final weighting, sensor endpoints, exact battery bands, invalid readings, and conversion/rounding distinctions.
- `verify_week03.py` locates worked code by stable source metadata and retains the 36 decision-boundary/invalid-input cases.

Week 2 sample input responses now live in notebook metadata, shared with the HTML. Its grade exercise and saved output use one midterm and one final at 50% each. Week 3 sensor and battery corrections now live in both notebooks; the HTML no longer silently changes their algorithms. All 794 course code cells run, with 542 lesson and 252 solution cells. Notebook-to-HTML parity verification now covers Weeks 1–14.
