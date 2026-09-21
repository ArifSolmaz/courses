# Maintaining the PHY101 notebooks

There is **one notebook per week**: `notebooks/Week_01.ipynb` … `Week_13.ipynb`, plus
`notebooks/Final_Review.ipynb`, eight laboratory briefs in `labs/` and six optional
`extensions/*.ipynb`. Edit the physics, examples and problems **directly in those files**; there is
no separate source library and no build step.

**Before editing anything, read [COURSE_POLICY.md](../COURSE_POLICY.md).** The weekly topic order and the
laboratory order are fixed by the departmental schedule and the exams are common, so a change that moves,
merges or drops a topic is not a maintenance decision — it breaks the agreement with the parallel
sections. `sync_calendar.py` now asserts both: the lab column must match the departmental schedule, and no
experiment may measure a week that has not yet been taught.

Also fixed by policy and applied throughout: `g = 9.81 m/s²`, three significant figures in reported
answers, one significant figure on uncertainties, exact unit-conversion definitions never rounded, and the
significant-figure teaching cells in Week 01 (`w01-019`, `w01-045`, `w01-047`) deliberately exempt from
rounding — a four-digit number is the lesson there. Every problem and worked example ends symbolically
with a limiting-case check before numbers appear, and every interactive demonstration carries a prediction
prompt above it. The course dashboard and syllabus read their calendar
from `calendar.json` through the generated `web/phy101-calendar.js`.

Week 01 was rewritten on 21 September 2026 to follow **Young & Freedman 15e chapter 1 section by
section**: its topic headings are `Section 1.1:` … `Section 1.10:` (the `Section` prefix keeps the
left-hand side of a bilingual heading ASCII, which is what `split_bilingual()` needs to pull the
Turkish out as a subtitle), the eleven chapter examples are the worked examples, and the six boxed
equations are the chapter's own Key Equations (1.9), (1.14), (1.16), (1.19), (1.20) and (1.25).
The figure anchors in `figures.py` point at those headings, so renaming one silently drops a figure
— `build_site.py` fails loudly instead, which is the intent.

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
6. **Engineering practice examples** — original scenarios with a prediction, symbolic route, limiting
   check, numerical answer and interpretation. Do not publish reserved exam-bank items or variants
   that only change names and numbers. Preserve example cell IDs and legacy anchors when replacing
   content; regenerate the HTML with `python3 fall/phy101/tools/build_site.py all`.
   Week 01 titles this section **Bridging problem and variation problems** instead, because Young &
   Freedman ch. 1 supplies both, and the practice is better spent on the chapter's own Bridging
   Problem and Key Example Variation Problems than on invented scenarios. A renamed section needs its
   slug adding to `STAGE_OF` in `build_site.py`, or the stage bar files it under *Learn*.
7. **Problem set — predict, then check** — core (L1), intermediate (L2), challenge (L3); each
   problem keeps its `Module XX Pn` identifier for the solution collection and hides its **answer** in
   `<details><summary>Answer …</summary>`. The answer is inline so a student can self-check; the full
   worked route stays in the solutions collection under its release schedule, so the two do not
   duplicate each other. Extra practice written for a notebook (Weeks 05 and 10) carries no module
   identifier and keeps its full reasoning inline instead.
8. **Exit check** with model responses, optional extension link, solutions and next week.

Two cells are inserted in every weekly notebook and should stay where they are:
`wXX-standards` (the method, the numeric policy, the textbook chapters and that week's laboratory session)
immediately before the setup anchor, and `wXX-psrule` (predict before opening an answer) immediately after
the problem-set heading. `labs/` briefs share a single structure: prediction → apparatus → procedure →
data tables → analysis → discussion → report, with the shared technique in
`labs/Lab_00_Uncertainty_Toolkit.ipynb` rather than repeated per brief.

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

## The web week notes

`fall/phy101/wN/index.html` is a **generated** page, published as
`https://arifsolmaz.github.io/phy101/wN/`. It carries the concepts, worked examples, the standards
block, the lab box and the animations; the problem sets stay in the notebook, because inline answers
at a clean public URL would reach the parallel sections sitting the same common exam.

```bash
python3 fall/phy101/tools/build_site.py 1 2      # just these weeks
python3 fall/phy101/tools/build_site.py all      # all thirteen
python3 fall/phy101/tools/verify_site.py         # regenerate and compare, byte for byte
python3 fall/phy101/tools/build_short_urls.py    # redirects for the short-URL repo
```

Edit the **notebook**, then rebuild. Never edit anything under `w*/`: `verify_site.py` fails if a
published page differs from a fresh build, which catches a hand-edit and a stale build equally.

Prev/next links only point at weeks that are actually published, so a half-released term never hands a
student a 404. That makes the links depend on which pages exist, so **publish a new week with
`build_site.py all`** rather than one week alone; otherwise the previous week still says "All weeks"
where it should now say "Week NN". `verify_site.py` catches exactly this and names the stale page.

The notebook's ipywidgets demonstrations cannot run in static HTML. Each one becomes either a
registered animation or an honest pointer to Colab, decided by the `ANIMS` table at the top of
`build_site.py`, which matches on the interactive cell's heading text. If a heading is reworded in the
notebook, the build fails loudly rather than silently dropping the animation.

### What the page makes of a notebook cell

The builder classifies each cell from the notebook's own conventions, so the page gets typed furniture
instead of a wall of prose. This means **the notebook's headings and markup are load-bearing**:

| In the notebook | On the page |
| --- | --- |
| `### Worked example: ...` or `### Worked Example 1: ...` | numbered worked-example box |
| `### Worked Examples` (plural, alone) | an ordinary section heading, not an example |
| `#### Checkpoint 1 of 3 ...` | "Check yourself" box |
| `### Learning Objectives` + numbered list | numbered objective cards |
| `### Interactive ...` | the week's animation, or a Colab pointer |
| a display equation wrapped in `\boxed{...}` | numbered **key-equation card** + an entry in the end-of-page summary |
| a paragraph opening `**Not this week.**`, `**Not yet.**`, `**Caution**` | caution callout |
| a paragraph opening `**TR:**` / `**Türkçe:**` | margin note in the gutter (its `TR:` prefix stripped) |
| `## Heading / Türkçe başlık` | numbered section with the Turkish as a subtitle |

Two editorial rules follow from that table:

1. **Box the equations you want highlighted.** A `\boxed{}` display equation becomes a key-equation card
   and appears in the week's summary; an unboxed one is just prose. Week 02 originally boxed nothing, so
   its page had no key equations at all until the four constant-acceleration equations were boxed in the
   notebook. Boxing them improved the Colab notebook too, which is the point of keeping one source.
2. **Do not box a final numerical answer outside a worked example.** Inside a worked example, boxed
   answers are left alone — the builder ignores `\boxed` there, and a numeric-looking box anywhere else
   is filtered by `looks_like_an_answer()`. Otherwise "Q = 0.283 m³/s" gets advertised as a law.

### Figures: never approve one you have not looked at large

Figures come from `tools/figures.py`, are numbered per week, anchored to a heading substring, and carry
their Turkish caption as a margin note.

```bash
python3 fall/phy101/tools/figcheck.py     # lint + write the proof sheets
# then LOOK at tools/figproof-light.html and figproof-dark.html
```

`figcheck.py` writes `figproof-light.html`, `figproof-dark.html` and `figproof-grid.html` (the last with
a 20-unit coordinate grid for checking alignment). Every figure appears there far larger than on a week
page. **This exists because a figure judged inside a full-page screenshot is about 480 px wide, and at
that size real faults are invisible.** The first version of this library shipped with black arrowheads,
a "tangent" that was a chord, a dot that missed its curve, and a 3-4-5 triangle drawn at different
scales on the two axes — all of which looked fine small.

The linter catches the mechanical faults:

- `fill="context-stroke"` — in the SVG spec, ignored by Chromium, renders the arrowhead **black**. Use
  one marker per colour (`#pfx-accent`, `#pfx-blue`, …) with the `.fig-head-*` classes.
- `marker-end` pointing at an undefined id, duplicate element ids across figures (the proof sheet shows
  them all at once), coordinates outside the viewBox, missing `aria-labelledby`.

The faults it cannot catch, which you have to look for:

- a label overlapping a line it does not belong to, or crossing an axis;
- an angle arc whose ends do not sit exactly on the two lines — it then reads as a tick through them;
- a tangent that is really a secant, or a marker dot that is not on its curve (compute these, do not
  eyeball them: the Bézier point and tangent direction for Figure 2.1 are worked out in a comment);
- a tip dot under an arrowhead, or two arrowheads meeting at one point;
- non-uniform axis scales where a length is the whole point;
- mostly-empty drawings — tighten the viewBox rather than leaving a field of white. A figure whose anchor stops matching fails the build rather than
silently disappearing. Every colour in them is a CSS custom property, so they follow the theme with no
second drawing.

Animations live in `assets/anim-wN.js` and register into the shared harness in `assets/anim.js`
(`PhyAnim.register(name, fn)`, with `PhyAnim.ui` providing `Scene`/`plot`, `Player`, `predict`,
`seg`, `slider`, `stat`). The harness follows the same conventions as `aa/assets/anim.js` — no
dependencies, light/dark tokens read at draw time, `prefers-reduced-motion` honoured by stepping
instead of animating, and ARIA state on every control. Every animation opens with a **predict gate**:
the reader must commit to an answer before it will run, per COURSE_POLICY.md 6.

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

Laboratory briefs and `Final_Review.ipynb` are markdown-only or have plain code cells with no
demonstration panels; the runner reports them as `paper-only` or runs them without the panel check.

Dependencies: `nbformat`, `nbclient`, `ipykernel`, `numpy`, `matplotlib`, `scipy`, `sympy`,
`ipywidgets`. Also open a notebook in Jupyter or Colab and move a few sliders: execution alone does
not show whether controls, figures and readouts fit together on screen.

### Checking a figure by measurement, not by eye

Looking at the proof sheet catches most faults, but the eye is unreliable about
two things in particular, and both have already produced wrong figures here:

* **Does a shape actually sit where it should?** Figure 4.1's block *looked* as
  though it floated off the slope. Probing the rendered DOM
  (`svg.getScreenCTM().inverse().multiply(rect.getScreenCTM())`, then mapping the
  rect's corners into user space) showed the bottom edge at a clearance of
  exactly 0.00 along its whole length. The eye was wrong; measure before
  redrawing.
* **Does a label overflow or land on a curve?** `text.getBBox()` compared with
  the viewBox catches overflow; substituting the label's x-range into the curve's
  own equation catches collisions. Figure 8.2's note and Figure 13.1's three
  annotations were both printed straight over their curves and neither the lint
  nor a quick glance flagged them.

**Direction is physics, not decoration.** Figure 11.1 shipped a first draft with
the wheel rolling right and ω drawn counter-clockwise. A rotation arrow must be
checked against every velocity arrow in the same figure.

### Week 01 regression checks

Week 01 includes 44 worked examples: the original 20 plus 24 optional, attributed Chapter 1 textbook exercises. Keep the extra bank separate from the required three-hour route.

```bash
node fall/phy101/tools/verify_week01_animations.cjs
python fall/phy101/tools/verify_week01_notebook.py --output-dir /tmp/phy101-week01-qa
```

The animation check covers all slider settings and six addition orders at five sizes. The notebook check executes its source, exercises all three graphical panels and every converter unit pair, rejects unknown dimensional symbols and saves boundary plots for visual inspection. Numerical checks supplement browser and plot inspection; they do not replace it. See `../WEEK01_REVIEW.md` for the audit and repair record.
