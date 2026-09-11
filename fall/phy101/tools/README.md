# Maintaining the PHY101 notebooks

Students start from the thirteen dated lessons in `calendar/`. Their schedule comes
from `calendar.json`, including review, midterm, and laboratory topics. The fourteen
files in `notebooks/` are the source-module library, with stable problem identifiers.

After a teaching-calendar or source-content change, run from the courses repository:

```powershell
python fall/phy101/tools/build_calendar_notebooks.py
python fall/phy101/tools/sync_calendar.py --write
python fall/phy101/tools/sync_calendar.py --check
```

The builder selects the material for each dated week; it does not assign every source
module its own calendar week. The sync command updates `web/phy101-calendar.js` and
the private `phy101-solutions/schedule.json` together. Use `--solutions-root PATH` if
that repository is not beside `courses`. The sync also refreshes the calendar labels
inside private solutions and source-module notebooks, so old links point readers
to the appropriate dated lesson. Neither command publishes files.

Edit physics explanations and problems in the source notebooks. The private
`phy101-solutions` repository holds the complete worked solutions until release.

`physics_widgets.py` supplies the shared control/plot layout. Its code is embedded
in every notebook so Colab needs no extra repository download. After changing it:

```powershell
python fall/phy101/tools/refresh_notebook_interface.py
```

This maintains the labelled reading guide, collapsed code metadata, controls beside
bounded output panes, and text-based student working spaces. It preserves the lesson
explanations and problem statements. It also clears old outputs and upgrades old
notebook schemas to v4.5 for stable cell IDs. Rebuild the dated lessons afterward.

The layout uses the documented [ipywidgets Layout](https://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Layout.html)
and [Interact](https://ipywidgets.readthedocs.io/en/stable/examples/Using%20Interact.html)
APIs. Sliders update on release; generated charts and animation controls stay in the
result pane. Static GitHub previews cannot execute Python callbacks.

Slider results are captured as complete MIME records and assigned to a persistent
Output widget after each callback completes. Avoid clearing the surrounding panel
or replacing its controls during a redraw. When adding a demo, use ordinary inline
figures, `display(HTML(...))`, or printed results; asynchronous displays and
`display_id` updates need separate handling. Close displayed figures after use.

For vector diagrams, put numeric values in a separate readout, use a legend instead
of labels at intersecting arrows, and calculate limits from all endpoints. Check
zero, parallel, perpendicular, opposite, and maximum-length vectors. Preserve
source cell IDs and subsection headings: the calendar builder selects by them.
Add worked explanations inside the selected source cells so dated lessons inherit
them. New optional demos need a deliberate entry in the builder's `LESSONS` map.

Execute edited notebooks in fresh kernels and store QA outputs outside source:

```powershell
python fall/phy101/tools/validate_notebooks.py fall/phy101/calendar/Week_03.ipynb --output-dir "$env:TEMP/phy101-checks"
```

Dependencies: `nbformat`, `nbclient`, `ipykernel`, `numpy`, `matplotlib`, `scipy`,
`sympy`, and `ipywidgets`. Also open representative notebooks in Jupyter/Colab,
change controls, and check both desktop and narrow-screen layouts. Execution alone
does not check whether controls are visible beside figures.

The screenshot-driven revision's final hashes and verification scope are recorded
in `../notebook_review_verification.json`. Refresh the interface, rebuild lessons,
check calendar synchronization, and execute the affected notebooks before updating
that record. Also exercise repeated live slider updates; an initial visible plot
alone does not establish that subsequent updates work.
