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
| Physics I week `N` | `https://arifsolmaz.github.io/phy101/wN/` | dashboard section `#week-N`, for N = 1–13 |
| History of Physics | https://arifsolmaz.github.io/phy101/history/ | `fall/phy101/History of Physics/index.html` |

## Maintenance rule

Keep teaching content, notebooks, solutions, and dashboards in this repository. The short URL pages contain no teaching content; they only route students to these canonical files. Consequently, ordinary weekly updates require changes here only and do not require editing the short URLs.

When a new course is published, use the same pattern:

- `/<course-code>/` for the course dashboard.
- `/<course-code>/wN/` for week N.
- `/<course-code>/<named-resource>/` for stable resources such as `history`.

Use lowercase route names and never rename a published student URL during a semester.
