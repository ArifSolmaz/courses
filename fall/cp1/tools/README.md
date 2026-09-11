# Maintaining CP1

The lesson notebooks are the source for exercise IDs, titles, objectives and core/optional workload. The solution notebooks provide one labelled section for every exercise and bridge. The dashboard and index are generated from those files.

After editing lesson or solution content, run these commands from `fall/cp1`:

```powershell
python -X utf8 tools/prepare_notebooks.py
python -X utf8 tools/sync_course.py
python -X utf8 tools/verify_course.py --execute --save-outputs
```

`prepare_notebooks.py` maintains the shared study-feedback tools, solution links and stable cell IDs. It preserves lesson content and student exercise cells. The final practice checkpoint uses an explicit self-report; execution history is never treated as proof of completion.

`sync_course.py` checks solution coverage, creates `course_manifest.json`, and updates the dashboard, syllabus topic table, outline counts and solution index. Edit the dashboard shell in `tools/templates/dashboard.html`, its behaviour in `web/cp1-dashboard.js`, and its styles in `web/cp1-dashboard.css`. The dashboard displays actual notebook Python as escaped static HTML, preserving backslash escapes.

`verify_course.py` checks notebook schemas, unique IDs, complete solution mappings, exercise counts, links advertised by the dashboard and honest practice feedback. With `--execute`, it runs lesson and solution notebooks in fresh kernels and separate temporary working folders. Finite sample input replies exercise interactive lesson examples. Solution notebooks must run without interactive input. With `--save-outputs`, successful outputs are saved back to the original notebooks; the audit fixture cells are never saved.

Execution requires `nbformat`, `nbclient` and the Python 3 Jupyter kernel. A bounded rerun can use `--match Week_14*` or `--kind lessons`; structural coverage is still checked across the course. The execution report is written to the system temporary folder as `cp1-execution-report.json`. Saved text output abbreviates the temporary execution-directory path to `[runtime folder]`; the original notebook code is unchanged.

Section metadata convention:

```json
{"cp1": {"solution_for": "EX01"}}
```

Use this on exactly one Markdown section per exercise; use `BRIDGE` for the transition exercise or preview in Weeks 1–13. Relevant code and test cells may carry the same label. Keep source exercise markers such as `# ✏️ [EX1]` so synchronization can identify the corresponding student cell.

There are 171 numbered exercise slots, plus 13 bridge/preview walkthroughs in the solution set. Weeks 1–13 have eight core exercises each; Week 14 has ten core milestones and two optional bonuses. Weekly practice is ungraded. Do not add dates or release gates without an actual CP1 timetable or an instructor decision.

For page verification, serve the repository locally and check all fourteen week buttons, notebook/solution downloads, the light theme and a narrow viewport. Colab links open the published repository copy; local edits need publication before they appear there.
