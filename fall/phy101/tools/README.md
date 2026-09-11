# Maintaining the PHY101 notebooks

Students start from the thirteen dated lessons in `calendar/`. Their schedule comes
from `calendar.json`, including lecture topics, review and the midterm. The fourteen
files in `notebooks/` are the source-module library, with stable problem identifiers.
The course dashboard uses **Open in Colab** as the primary notebook action and
provides **Download notebook** separately. Check that each action targets the same
week or source module whenever notebook paths change.
Inside notebooks, keep course navigation and links to other lessons, but do not
add an “Open in Colab” badge or link back to the notebook already being read.

For lecture-content or notebook-link changes that keep solution release dates the
same, run from the courses repository:

```powershell
python -B fall/phy101/tools/sync_calendar.py --write --public-only
python -B fall/phy101/tools/build_calendar_notebooks.py
python -B fall/phy101/tools/sync_calendar.py --check --public-only
```

The `--public-only` mode updates or checks the browser calendar and source-notebook
routes without reading or writing the private solutions repository. The builder
selects the material for each dated week; source-module numbers remain stable.

When teaching assignments or release dates change, synchronize the private solution
schedule as well:

```powershell
python -B fall/phy101/tools/sync_calendar.py --write
python -B fall/phy101/tools/build_calendar_notebooks.py
python -B fall/phy101/tools/sync_calendar.py --check
```

Full synchronization updates `web/phy101-calendar.js`, source-notebook routes, the
private `phy101-solutions/schedule.json`, and calendar labels inside private solution
notebooks. Use `--solutions-root PATH` if that repository is not beside `courses`.
Neither synchronization mode nor the builder publishes files.

Edit physics explanations and problems in the source notebooks. The private
`phy101-solutions` repository holds the complete worked solutions until release.

Additional fully solved examples are authored in `../examples/worked_examples_*.json`.
Run `sync_worked_examples.py` before rebuilding the dated lessons when changing them.
Each example retains its bank chapter/section/question reference, and its
`calendar_week` selects the relevant teaching week. The original question-bank
Word files are not needed for rebuilding. See `../examples/README.md`.

`physics_widgets.py` supplies the shared control/plot layout. Its code is embedded
in every notebook so Colab needs no extra repository download. After changing it:

```powershell
python -B fall/phy101/tools/refresh_notebook_interface.py
```

This maintains the labelled reading guide, collapsed code metadata, a wrapping
control toolbar above a full-width result, and text-based student working spaces. It preserves the lesson
explanations and problem statements. It also clears old outputs and upgrades old
notebook schemas to v4.5 for stable cell IDs. Rebuild the dated lessons afterward.

The layout uses the documented [ipywidgets Layout](https://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Layout.html)
and [Interact](https://ipywidgets.readthedocs.io/en/stable/examples/Using%20Interact.html)
APIs. Sliders update on release. Results use their natural height, with no nested
vertical scrolling pane. Static GitHub previews cannot execute Python callbacks.

Slider results are captured as complete MIME records and assigned to a persistent
Output widget after each callback completes. Avoid clearing the surrounding panel
or replacing its controls during a redraw. When adding a demo, use ordinary inline
figures, `display(HTML(...))`, or printed results; asynchronous displays and
`display_id` updates need separate handling. Close displayed figures after use.

For vector diagrams, put the plot and numeric table side by side in **one figure**,
use a legend instead of labels at intersecting arrows, and calculate limits from all endpoints. Check
zero, parallel, perpendicular, opposite, and maximum-length vectors. Preserve
source cell IDs and subsection headings: the calendar builder selects by them.
Add worked explanations inside the selected source cells so dated lessons inherit
them. New optional demos need a deliberate entry in the builder's `LESSONS` map.

`notebook_tables.py` formats Markdown table blocks as full-width HTML tables in both
source modules and generated lessons. Colab strips inline CSS and lays ordinary
Markdown tables out with narrow fixed columns; its math renderer can then split
equations across lines. Preserve the tested table/column width attributes and math
markup. Check representative tables in Colab itself after changing this formatter.

Execute edited notebooks in fresh kernels and store QA outputs outside source:

```powershell
python -B fall/phy101/tools/validate_notebooks.py fall/phy101/calendar/Week_03.ipynb --output-dir "$env:TEMP/phy101-checks"
```

Dependencies: `nbformat`, `nbclient`, `ipykernel`, `numpy`, `matplotlib`, `scipy`,
`sympy`, and `ipywidgets`. Also open representative notebooks in Jupyter/Colab,
change controls, and check both desktop and narrow-screen layouts. Execution alone
does not check whether controls, figures and numerical readouts fit together.

The earlier screenshot-driven edition's execution hashes and verification scope are
recorded in `../notebook_review_verification.json`; they describe that tested edition. Refresh the interface, rebuild lessons,
check calendar synchronization, and execute the affected notebooks before updating
that record. Also exercise repeated live slider updates; an initial visible plot
alone does not establish that subsequent updates work.
