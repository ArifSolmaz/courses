# Complete CP1 offline notebooks

Build all 14 weeks with `python3 fall/cp1/tools/offline/build.py --all`, or one with `--week 5`. Only the maintainer build downloads dependencies. `assets.json` and `science-assets.json` pin official distribution assets by SHA-256. Outputs are `fall/cp1/offline/CP1_Week_XX_Offline.html`: about 16.3 MB each for Weeks 1–12 and 33.8 MB for Weeks 13–14.

Each single HTML includes the complete maintained lesson notebook and its complete worked solutions. Students can open the hosted page or download the HTML before class and open it in a normal browser. Python runs inside a worker; no Python installation, Google account, local server or classroom network is needed after downloading. The weekly pages and dashboard resource panels link to each edition.

## Interface and persistence

The open left sidebar highlights the current section during scrolling and follows the active entry inside its own scroll area. The top toolbar is not sticky. The notebook uses the available page width, with aligned Code and Output panels on laptops. They stack on phones (650 px or narrower) and in the narrow sidebar layout (851–1000 px). Input values sit below both panels and are hidden when the code has no direct input() call. Visibility updates as code is edited; an EOFError also reveals inputs for indirect calls. Comments and ordinary string examples do not create input boxes. Weeks 04–12 have been rebuilt with this layout; rebuilding other weeks applies the shared template. All teaching disclosures, helper code and error details are expanded. Code/input textareas grow to their wrapped content on edits and layout changes; outputs have no fixed-height scroll box. Code is editable, Run and Shift+Enter execute a cell, and Stop/restart terminates Python while preserving edits. `input()` consumes the cell's pre-entered lines; lesson examples have editable sample responses.

Save notebook exports `.ipynb` with edited code, input values, stdout and plots. Open saved work accepts the matching week and restores code, inputs and safe outputs without executing code. Variables are not saved: rerun setup cells after reopening. Markdown remains the trusted original. There is no cloud sync or automatic persistence.

Lesson and solution code have separate global namespaces and working directories. This prevents ordinary solution examples supplying hidden variables/files to practice, but is not a security boundary against deliberate Python code. In normal Jupyter/Colab the exported combined notebook uses one kernel; restart between lesson and answers there.

Weeks 11–14 show generated files in “Python files in this session,” with download buttons. Runtime files disappear on restart and are not included in the notebook export; save them separately or rerun their creation cells. The file list is limited to 100 files, four directory levels and 10 MB per downloadable file. Weeks 13–14 bundle NumPy, Matplotlib and their dependencies; figures render below their code cells and are saved in notebook output. Week 12 uses ordinary `with open` setup code in both the source notebook and HTML.

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

- `python3 fall/cp1/tools/offline/verify_content_parity.py`: compares every Week 4–12 lesson and solution cell with the embedded HTML, permits only platform-specific instructions, and executes the original notebooks to verify their saved outputs. Week 5 sample input responses live in notebook cell metadata and are reused by the HTML builder.

- `python3 fall/cp1/tools/offline/verify_week06.py`: tests 20 changed-data/boundary cases against the actual teaching code and verifies all 13 published solution outputs.

- `python3 fall/cp1/tools/offline/verify_week07.py`: tests 20 changed-data/boundary cases and all 13 published solution outputs, including empty groups, tied maxima, dictionary order and repeated unknown IDs.

- `python3 fall/cp1/tools/offline/verify_week08.py`: checks 20 boundary cases and all 13 expected outputs against both student notes and worked solutions.

- `python3 fall/cp1/tools/offline/verify_week09.py`: checks function return values and absence of unwanted printing on 51 boundary/changed-input cases, plus all 13 student/solution outputs. Covers calibration endpoints, empty data, dynamic pressure, calculator errors and local/global scope.

- `python3 fall/cp1/tools/offline/verify_week10.py`: checks all 13 student/solution outputs and 55 boundary/behavior cases, including shared-list mutation, sensor call order, equal exam weights, refactoring parity and empty reports.

- `python3 fall/cp1/tools/offline/verify_week11.py`: verifies all 13 student/solution outputs and 71 boundary/error cases, including live-input exhaustion, missing versus zero readings, nonfinite calculations, absolute-zero boundaries and 50/50 exam weights.

- `python3 fall/cp1/tools/offline/verify_week12.py`: verifies all 13 exercise outputs and 28 file/edge-case checks in disposable folders. Covers CSV quoting and multiline source tracking, rejection exports, unchanged raw input, rerun behavior, empty datasets, appending, and 50/50 exam scores. The parity runner also isolates all file-producing notebook runs.
