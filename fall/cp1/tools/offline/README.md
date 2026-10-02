# Complete CP1 offline notebooks

Build all 14 weeks with `python3 fall/cp1/tools/offline/build.py --all`, or one with `--week 5`. Only the maintainer build downloads dependencies. `assets.json` and `science-assets.json` pin official distribution assets by SHA-256. Outputs are `fall/cp1/offline/CP1_Week_XX_Offline.html`: about 16.3 MB each for Weeks 1–12 and 33.8 MB for Weeks 13–14.

Each single HTML includes the complete maintained lesson notebook and its complete worked solutions. Students can open the hosted page or download the HTML before class and open it in a normal browser. Python runs inside a worker; no Python installation, Google account, local server or classroom network is needed after downloading. The weekly pages and dashboard resource panels link to each edition.

## Interface and persistence

The open left sidebar highlights the current section during scrolling and follows the active entry inside its own scroll area. The top toolbar is not sticky. The notebook uses the available page width, with code on the left and inputs/output on the right above 1100 px, and stacked cells below that. All teaching disclosures, helper code and error details are expanded. Code/input textareas grow to their wrapped content on edits and layout changes; outputs have no fixed-height scroll box. Code is editable, Run and Shift+Enter execute a cell, and Stop/restart terminates Python while preserving edits. `input()` consumes the cell's pre-entered lines; lesson examples have editable sample responses.

Save notebook exports `.ipynb` with edited code, input values, stdout and plots. Open saved work accepts the matching week and restores code, inputs and safe outputs without executing code. Variables are not saved: rerun setup cells after reopening. Markdown remains the trusted original. There is no cloud sync or automatic persistence.

Lesson and solution code have separate global namespaces and working directories. This prevents ordinary solution examples supplying hidden variables/files to practice, but is not a security boundary against deliberate Python code. In normal Jupyter/Colab the exported combined notebook uses one kernel; restart between lesson and answers there.

Weeks 11–14 show generated files in “Python files in this session,” with download buttons. Runtime files disappear on restart and are not included in the notebook export; save them separately or rerun their creation cells. The file list is limited to 100 files, four directory levels and 10 MB per downloadable file. Weeks 13–14 bundle NumPy, Matplotlib and their dependencies; figures render below their code cells and are saved in notebook output. Week 12's `%%writefile` examples are converted to ordinary `with open` code producing the same files.

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
