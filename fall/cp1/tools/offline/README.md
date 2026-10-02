# CP1 offline Week-1 pilot

Build: `python3 fall/cp1/tools/offline/build.py`. Only the maintainer's build downloads dependencies; their SHA-256 hashes are pinned in assets.json. Output: `fall/cp1/offline/CP1_Week_01_Offline.html` (about 16.3 MB).

Distribute that **single HTML file** before class (download or permitted file transfer). Open it directly in a browser; no Python installation, local web server, account, service-worker cache or classroom internet is required. Keep the original notebooks and live course route in place during the pilot.

Students use Run, Save notebook and Open saved work. Saved notebooks remain `.ipynb` files. Save before closing; there is no cloud sync or guaranteed browser autosave. Stop/restart terminates the worker and resets Python state while preserving edits. Code is never run automatically on notebook restore. Notebook text is from the existing Week-1 source; a banner explains how its Colab instructions map to the local controls.

Scope: Week 1, all 118 source cells (77 Markdown, 41 code), core Python/standard library. No NumPy, Matplotlib, widgets, Colab services, arbitrary notebook import or persistent Python filesystem. `input()` uses per-cell pre-entered lines. Output is capped at 400 stdout/stderr messages per run. External links require internet. This is a pilot, not a claim that all 14 weeks or managed classroom browsers have been verified.

Verification on 2026-10-02:
- Safari local-file feasibility probe ran Python math and virtual-file read/write with network fetch blocked.
- Chrome local-file full pilot initialized; study helper and Hello World ran.
- Checked wheel-distance arithmetic, types, persistent globals across cells, math import, virtual-file write/read and intentional error reporting.
- Infinite loop stayed in the worker; Stop/restart restored a responsive Python runtime.
- Save downloaded valid `.ipynb` containing the edited code and stdout. Open saved work restored the edited code without running it.
- Visual check at desktop size: header, instructions, lesson typography and cell controls.
- Browser connection policy is `connect-src 'none'`; runtime fetch resolves only the embedded asset allowlist, with no fallback. No physical network adapter was disabled for the test.

Still required before a classroom rollout: open the file on one actual managed classroom PC and test Run + Save + reopen. Browser policies can prohibit local scripting/WebAssembly/downloads independently of installation permissions. Full cross-browser/mobile testing, later-week packages and the notebook's external diagrams/animations are outside this pilot.

## Complete Week 3

Build with `python3 fall/cp1/tools/offline/build.py --week 3`.
Validate with `python3 fall/cp1/tools/offline/verify_week03.py`.

`CP1_Week_03_Offline.html` includes all 120 lesson cells and 55 worked-solution cells, covering 12 exercises and the bridge. There are 72 runnable code cells. Navigation is an open left sidebar; the top toolbar scrolls normally. The hosted version offers a Download offline HTML link. It is linked from the existing Week-3 page and the dashboard's Week-3 notebook resources.

Solutions execute in a separate persistent Python globals dictionary from the lesson/practice. Restart clears both. Save exports the combined notebook with week identity metadata; restore accepts the matching offline edition and restores code and stream outputs without running anything. In an ordinary Jupyter/Colab runtime this combined file uses the normal shared namespace, so restart the kernel before switching between practice and solutions there.

Offline adaptations are in week03.py: remove local-relative/Colab solution dependencies, align the phase title, clarify sensor-model ranges, identify the simplified battery model, and compare voltage against 3.24/3.96 V to avoid binary floating-point misclassification at the exact 80% boundary.

Validation: all 72 code cells and their supplied assertions execute; 36 additional cases exercise actual answer code at motor thresholds, shaft limits, battery boundaries/invalid readings, ticket-age boundaries and season boundaries. Chrome local-file checks confirmed Python startup, conditional/short-circuit behavior, independent solution globals, and the left-menu/nonsticky-toolbar layout. Classroom-managed PCs still require their own compatibility check.

### Beginner error display

Student executions have filenames such as `Cell 10`. errors.js extracts student-cell locations from the Python traceback, including functions defined in earlier cells. The UI shows the real error type/message, a brief teaching hint, a marked source excerpt from the last run, and a button selecting the line in the editor. Internal frames remain under Technical details. Runtime failures retain preceding stdout and explain that earlier statements may already have changed variables. A rerun clears the prior error panel; `.ipynb` exports retain the full traceback with the correct error type.

Run `node fall/cp1/tools/offline/verify_errors.cjs`. Browser checks reproduced `gpa =` at line 4, confirmed Go to line selects it, verified division by zero after a print, and confirmed a successful rerun removes the error. Hints are guidance, not automatic fixes or correctness grading.
