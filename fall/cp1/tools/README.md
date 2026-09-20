# Maintaining CP1

The lesson notebooks are the source for exercise IDs, titles, objectives and core/optional workload. The solution notebooks provide one labelled section for every exercise and bridge. The dashboard and index are generated from those files.

After editing lesson or solution content, run these commands from `fall/cp1`:

```powershell
python -X utf8 tools/prepare_notebooks.py
python -X utf8 tools/sync_course.py
python -X utf8 tools/verify_course.py --execute --save-outputs
```

`prepare_notebooks.py` maintains the shared study-feedback tools, solution links and stable cell IDs. It preserves lesson content and student exercise cells. The final practice checkpoint uses an explicit self-report; execution history is never treated as proof of completion.

`sync_course.py` checks solution coverage, creates `course_manifest.json`, and updates the dashboard, syllabus topic table, outline counts and solution index. Edit the dashboard shell in `tools/templates/dashboard.html`, its behaviour in `web/cp1-dashboard.js`, and its styles in `web/cp1-dashboard.css`. The dashboard displays actual notebook Python as escaped static HTML, preserving backslash escapes. Shared CP1 light/dark colors are maintained in `web/cp1-theme.css`; pair `--code-bg` with `--code-text` instead of giving code blocks a fixed background. When those assets change, update their version query in the dashboard template and syllabus so existing browsers load the revised styles.

`verify_course.py` checks notebook schemas, unique IDs, complete solution mappings, exercise counts, links advertised by the dashboard and honest practice feedback. With `--execute`, it runs lesson and solution notebooks in fresh kernels and separate temporary working folders. Finite sample input replies exercise interactive lesson examples. Solution notebooks must run without interactive input. With `--save-outputs`, successful outputs are saved back to the original notebooks; the audit fixture cells are never saved.

Execution requires `nbformat`, `nbclient` and the Python 3 Jupyter kernel. A bounded rerun can use `--match Week_14*` or `--kind lessons`; structural coverage is still checked across the course. The execution report is written to the system temporary folder as `cp1-execution-report.json`. Saved text output abbreviates the temporary execution-directory path to `[runtime folder]`; the original notebook code is unchanged.

Section metadata convention:

```json
{"cp1": {"solution_for": "EX01"}}
```

Use this on exactly one Markdown section per exercise; use `BRIDGE` for the transition exercise or preview in Weeks 1–13. Relevant code and test cells may carry the same label. Keep source exercise markers such as `# ✏️ [EX1]` so synchronization can identify the corresponding student cell.

There are 171 numbered exercise slots, plus 13 bridge/preview walkthroughs in the solution set. Weeks 1–13 have eight core exercises each; Week 14 has ten core milestones and two optional bonuses. Weekly practice is ungraded. Do not add dates or release gates without an actual CP1 timetable or an instructor decision.

For page verification, serve the repository locally and check all fourteen week panels and the complete syllabus in both themes at desktop and narrow widths. Expand every code example; inspect text/background contrast, links, table headings, button focus, theme persistence and notebook/solution downloads. Colab links open the published repository copy; local edits need publication before they appear there.

## Weekly HTML engineering experiences

The [course home](../web/CP1_Course_Dashboard.html) and `web/Week_01.html` through
`web/Week_14.html` accompany the Colab notebooks. Author the scenarios, models,
reference outputs, case traces and selected notebook exercise IDs in
`lessons/experiences.py`. The source is deliberately separate from the notebooks:
it adds an engineering investigation without rewriting their practice sequence.

`sync_course.py` calls `render_experiences.py`, generates all fifteen pages, and
maintains links in the dashboard, syllabus, manifest and Markdown indexes.
Shared presentation and interactions live in `web/cp1-experiences.css` and
`web/cp1-experiences.js`. Update their version queries in the renderer when
changing published assets. No framework, external font or runtime dependency is
required. Essential content and case answers remain readable without JavaScript.

Run `python tools/verify_experiences.py` after synchronization. It executes every
small teaching model in an isolated temporary folder, compares reference output,
checks selected notebook IDs, verifies reproducible generation, and checks local
links and fragment targets. Run the existing `verify_course.py` for notebook
coverage. Interactive checks should include case reveal/reset, slider endpoints,
note persistence and Markdown export, light/dark themes, mobile widths and print.

The browser cases are prepared fixtures, not hardware simulations or automatic
scores. Weeks 1, 4 and 10 also include adjustable mathematical models. Notes are
stored locally under a versioned, week-specific key and can be downloaded;
nothing is submitted to an instructor. The HTML activities fit within existing
guided sessions and do not add graded homework or change assessment weights.

Weekly pages are continuous lessons: the opening problem, explanation and example
code, worked variations, and practical work with a Colab link are on the same page.
There are no stage tabs, stage-completion controls or hidden lesson panels. Notes
and AI/partner guidance are optional disclosures. Shared navigation still supplies
the week picker and resource menu; do not add `data-learning-path` or `data-step`
to CP1 lessons. The old stage fragment IDs remain as scroll destinations for old
links. `CP1_Experiences.html` remains a redirect to the course home.

## Weekly openings

Each lesson’s `intro` in `lessons/experiences.py` supplies the connection to the
previous week, the first task before code, the reason for the Python tool, and
the intended outcome. Together with its `brief`, this generates the same opening
in the HTML lesson and the second notebook cell. Edit it there, then run
`tools/sync_course.py`; do not maintain a separate notebook introduction. The
verifier checks that the two versions agree.

The fourteen weeks progress through **Describe and decide** (1–5), **Organise
observations** (6–9), and **Build a checkable report** (10–14). These are stages of
understanding, not an extra continuous hardware project or new assessment. The
small examples retain their own supplied data. Objectives, participation rules
and class schedules remain in the notebooks as expandable reference sections.

### Notebook animations

Each weekly HTML page has one **See the Colab code run** workspace with four
notebook topics. The 56 topics map to actual notebook Part headings and related
exercise IDs; 159 contrasting cases cover normal, boundary and faulty behavior.
The engineering introductions remain separate.

- Author code, cases and mappings in `lessons/notebook_labs.py`.
- `tools/build_notebook_labs.py` executes these trusted examples in temporary
  directories and records Python line/call/return/exception events, variables,
  container identity, output and persisted files. A 150-step limit contains the
  intentional infinite-loop demonstration.
- `tools/sync_course.py` regenerates the 14 `web/lab-data/week-NN.js` files along
  with the pages. The browser loads only the current week's data.
- `web/cp1-lab.js` and `web/cp1-lab.css` present Play/Pause, Step, Back, Restart,
  speed, timeline, topic/case selectors and Copy Python. No browser-side Python
  interpreter, uploaded code or network service is involved.

A highlighted line is **about to execute**. Its effects appear at the next event.
Function frames expose local/global scope; object labels expose list aliasing;
output is separate from return values. File panes show persisted file contents,
which may change only when buffered writes are closed. Inputs are curated cases;
copy the displayed code into Colab for unrestricted editing.

Run `python3 fall/cp1/tools/verify_notebook_labs.py` after changing examples. It
checks source mappings, exact regeneration and semantic fixtures for ranges,
loop control, aliasing, function stacks, errors, CSV quoting and saved reports.
Also check playback, case switching, keyboard scrubbing and mobile layout in the
browser. All animations are ungraded practice.

The animation workspace is bounded to the viewport height. Code, variables and
collections share the central area; output and playback controls remain visible
below it. Long content scrolls inside each pane, and execution follows the active
line and changed state. Expand opens the same workspace in a native modal dialog;
Close or Escape restores it without resetting the selected case or step. The
Guide contains explanations and notebook references. Check inline and expanded
layouts at 1280×720 and 1366×768 when changing this UI.

## Meaning and state-tracing explanations

`lessons/reasoning.json` authors one topic-specific bridge for each of the 14 weeks: meaning, representation, prediction, worked steps, explanation, transfer question and Turkish support. `render_experiences.py` publishes it in the weekly HTML and synchronises the matching `cp1-reasoning-NN` notebook cell. Edit the JSON and run the normal preparation/synchronisation workflow; do not hand-edit generated explanations. Existing exercise IDs, code cells, animation fixtures and assessment weights stay unchanged. `verify_experiences.py` checks that the two versions agree.
