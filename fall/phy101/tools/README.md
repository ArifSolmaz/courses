# Maintaining the PHY101 notebooks

There is **one notebook per week**: `notebooks/Week_01.ipynb` … `Week_13.ipynb`, plus five optional
`extensions/*.ipynb`. Edit the physics, examples and problems **directly in those files**; there is
no separate source library and no build step. The course dashboard and syllabus read their calendar
from `calendar.json` through the generated `web/phy101-calendar.js`.

Since 12 September 2026 the former fourteen source modules and the generated “calendar” lessons are
merged into the weekly notebooks. The old files, the builder and the question-bank JSON remain in git
history (commit `2ad4750` and earlier) if a past version is ever needed.

## Weekly notebook structure

Keep the section order the same in every week so students can navigate by the table of contents:

1. Title, dates, scope and “How to use this notebook”; a **Contents** cell with anchor links.
2. Lesson plan (3 hours).
3. **Before you start** — retrieval question, learning objectives, algebra bridge.
4. **Setup for the interactive graphs (run once)** — the module setup cell(s) and the shared
   interface cell (id `phy101-widget-layout`).
5. **Concepts, demonstrations and worked examples** — theory, demos beside their concept,
   checkpoints (model answers in `<details>`), worked examples.
6. **More worked examples from the question bank**.
7. **Problem set with step-by-step answers** — core (L1), intermediate (L2), challenge (L3); each
   problem keeps its `Module XX Pn` identifier for the solution collection and hides its answer in
   `<details><summary>Answer and steps …</summary>`.
8. **Exit check** with model responses, optional extension link, solutions and next week.

Headings: weekly sections are `##`, topics inside a section are `###`, sub-topics and problems `####`.
Code cells stay collapsed (`#@title …`, Colab form view) so a reader sees a one-line run button.

## Interactive demonstrations

`physics_widgets.py` is the shared interface and is embedded verbatim in every notebook that has
code. A demonstration is written as an ordinary plotting function plus `physics_interact(...)`
with ipywidgets controls (the same arguments as `ipywidgets.interact`). Button-driven demos use
`physics_panel(controls, output)`.

How it behaves:

* Every control change first shows **Updating…** in the status line under the controls, then the
  graph is replaced through the same Output-widget route that `ipywidgets.interact` uses
  (`clear_output(wait=True)` followed by the new figure). The old figure stays until the new one
  arrives, so nothing disappears.
* The status line reports the draw time. Graphs that draw in under about 0.12 s update **live while
  dragging**; graphs that need more than about 0.25 s switch to **update on release**, so a fast
  slider can never leave the kernel behind. The mode is decided per demonstration from measured
  draw times, so it adapts to Colab and to slower laptops.
* Do not wrap drawing in `IPython.utils.capture.capture_output` or replace `shell.display_pub`:
  ipykernel 7 dispatches widget messages concurrently and the earlier capture-based interface
  raised `AttributeError: 'CapturingDisplayPublisher' object has no attribute 'set_parent'`,
  after which the kernel’s shell loop stopped and every slider went dead. That was the cause of
  demonstrations that “sometimes did not respond”.
* Keep figures small (about 8–12 inches wide at 100 dpi). Demonstrations that rebuild an animation
  on every change (the 1-D collision, Newton’s cradle, spring–block energy, rolling and wave
  animations) take 2–5 s per draw; they work, but they always run in release mode. Reducing their
  frame count (`physics_frames(..., maximum=...)`) is the way to make them faster.

After editing `physics_widgets.py`, re-embed it everywhere:

```bash
python -B fall/phy101/tools/refresh_notebook_interface.py
```

This also clears stale outputs, keeps code collapsed, and converts plain pipe tables in Markdown
cells to full-width HTML tables (Colab strips inline CSS and lays Markdown tables out with narrow
columns, which breaks equations). Write new tables as pipe tables and run the script; existing
HTML tables are left alone.

## Calendar and solution release dates

`calendar.json` is the single source for dates, titles, the module numbers used in each week, the
extension notebooks and the solution release dates. After changing it:

```bash
python -B fall/phy101/tools/sync_calendar.py --write --public-only
python -B fall/phy101/tools/sync_calendar.py --check --public-only
```

Drop `--public-only` to also update the private `phy101-solutions` repository (its `schedule.json`
and the calendar note in each solution file); use `--solutions-root PATH` if that repository is not
beside `courses`. Nothing is published by these commands.

## Executing the notebooks for QA

```bash
python -B fall/phy101/tools/validate_notebooks.py fall/phy101/notebooks/Week_03.ipynb --output-dir /tmp/phy101-checks
```

Each notebook runs in a fresh kernel; afterwards one control of every demonstration is moved and the
panel must redraw without an error. Results and executed copies go to the output directory; never
store executed outputs in the source notebooks. The runner ignores nbclient’s Output-widget
front-end emulation, which otherwise races with the kernel’s shell socket and stalls for the whole
cell timeout.

Dependencies: `nbformat`, `nbclient`, `ipykernel`, `numpy`, `matplotlib`, `scipy`, `sympy`,
`ipywidgets`. Also open a notebook in Jupyter or Colab and move a few sliders: execution alone does
not show whether controls, figures and readouts fit together on screen.
