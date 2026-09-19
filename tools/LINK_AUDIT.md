# Course link audit — 19 September 2026

Scope: AA, CP1, OOP, Physics I, CP2, DSA and Physics II. Checked current HTML,
Markdown and notebook Markdown links, linked assets, filename case and local anchors.
Generated source templates are checked through their emitted pages; archived files,
code examples and executable notebook network requests are outside this link audit.

## Repairs

- Physics I: fixed notebook-relative URL resolution in the HTML generator. The
  Week 1 Final Review link now includes `notebooks/`; query strings and fragments
  survive rewriting. Added regression checks for sibling notebooks, extensions,
  policy documents, lab directories and every generated Colab target.
- OOP: replaced 28 retired Core/Studio links with 14 weekly notebook links;
  corrected the Week 13 starter link and its displayed filename.
- DSA: replaced 26 retired Core/Benchmark links with 13 weekly notebook links.
- Physics II: replaced 28 retired Lecture/ProblemLab links with 14 weekly notebook
  links; repaired the notebook-directory link. Updated the descriptions to match
  the single weekly notebook structure.
- Physics I: repaired the dynamically generated lab-directory link and the Week 12
  GitHub directory URL. Converted an obsolete historical verification-file link
  in the review report into an explicit historical reference.
- AA, CP1 and CP2: no broken course destinations found in this audit.

## Verification

- 2,877 link references audited; no missing local targets or anchor failures.
- All 38 distinct external HTTP destinations responded successfully.
- All 116 current course notebooks exist in the public `main` tree checked at
  commit `7f90bf1562ac22531f108da94b3357c72ad38fcf`.
- All seven dashboards inspected after JavaScript generated their links, including
  hidden weekly panels. No missing same-page anchors found. The repaired Physics I
  dashboard was refreshed to confirm its new lab-directory URL.
- Corrected Final Review link opened in Colab; its title, contents and teaching
  sections loaded with no “notebook not found” error. Its raw GitHub response was
  also verified as a valid eight-cell notebook.
- Physics I: 355 site and link-regression checks pass. CP1: its course verifier
  passes, including 327 page links. AA guide: 643 unique local links checked.

The fixes are local until published. HTTP success verifies reachability at audit
 time, not every action within a third-party service or future notebook execution.

## Repeat the audit

From the repository root:

```sh
python3 tools/audit_links.py
python3 tools/audit_links.py --online --output /tmp/course-links.json
python3 fall/phy101/tools/verify_site.py
```

The checker validates a Colab link against the actual notebook path rather than
accepting Colab’s HTTP-200 application shell as proof that a notebook exists.
It exits unsuccessfully for missing local targets, bad anchors or failed online
requests. Generated dashboard links still need a rendered-browser check; an
optional `--rendered` JSON file accepts `{source, line, url}` entries captured
from those pages for inclusion in the same audit.
