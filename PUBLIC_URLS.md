# Public course URLs

Student-facing short URLs are published from `ArifSolmaz/arifsolmaz.github.io` and point to the canonical material in this repository.

## Current routes

| Course material | Student URL | Canonical source |
|---|---|---|
| Algorithm Analysis | https://arifsolmaz.github.io/aa/ | `aa/` |
| Algorithm Analysis week `N` | `https://arifsolmaz.github.io/aa/wN/` | `aa/wN/` |
| Computer Programming I | https://arifsolmaz.github.io/cp1/ | `fall/cp1/web/CP1_Course_Dashboard.html` |
| Computer Programming I week `N` | `https://arifsolmaz.github.io/cp1/wN/` | dashboard section `#week-N`, for N = 1–14 |
| Physics I | https://arifsolmaz.github.io/phy101/ | `fall/phy101/web/PHY101_Course_Dashboard.html` |
| Physics I week `N` | `https://arifsolmaz.github.io/phy101/wN/` | `fall/phy101/wN/index.html`, **generated** from the Week N notebook, for N = 1–13 |
| History of Physics | https://arifsolmaz.github.io/phy101/history/ | `fall/phy101/History of Physics/index.html` |

## Maintenance rule

Keep teaching content, notebooks, solutions, and dashboards in this repository. The short URL pages contain no teaching content; they only route students to these canonical files. Consequently, ordinary weekly updates require changes here only and do not require editing the short URLs.

### Generated pages do not break this rule

`/phy101/wN/` serves readable week notes rather than a dashboard anchor, but the rule above still holds, because those pages are **generated, never hand-written**:

    calendar.json + notebooks/Week_NN.ipynb  --(tools/build_site.py)-->  fall/phy101/wN/index.html

The notebook stays the single source of truth. Editing a notebook and re-running the builder is the only way the web notes change, so the two cannot drift apart the way a second hand-written copy would. `tools/verify_site.py` enforces this: it rebuilds every published page and fails if the file on disk differs, which catches both a hand-edit and a notebook edited without rebuilding.

**Never edit anything under `fall/phy101/w*/`.** The next build overwrites it.

    python3 fall/phy101/tools/build_site.py all     # regenerate every week page
    python3 fall/phy101/tools/verify_site.py        # prove they match their notebooks

The short-URL redirect files themselves are generated too, into `fall/phy101/tools/short-urls/`, and copied into `ArifSolmaz/arifsolmaz.github.io` when the route shape changes. They still carry no teaching content.

When a new course is published, use the same pattern:

- `/<course-code>/` for the course dashboard.
- `/<course-code>/wN/` for week N.
- `/<course-code>/<named-resource>/` for stable resources such as `history`.

Use lowercase route names and never rename a published student URL during a semester.
