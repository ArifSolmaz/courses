# Independent AA research case study

18 example-led pieces on the 3SUM/APSP preprint, linked from the Week 5 landing page. Canonical location: `aa/research/3sum-apsp/`; the old Week 5 URL redirects here. An explicit course connection map distinguishes central topics, supporting links and analogies. Week numbers refer to the course, not paper sections. Allow roughly 45–60 minutes with discussion, in addition to the existing 180-minute lesson. No change to assessment or exam scope is implied.

Content progression: define 3SUM and APSP; distinguish an algorithm from a hardness hypothesis; compare constants and exponent changes; explain reductions; build a small matrix connection-count example; distinguish requested outputs from a full product; illustrate shared preparation and dependency pruning; read the thin-product theorem; connect online queries to Week 5 data structures; discuss scientific significance, AI/human contributions, formal verification and engineering limits.

Primary basis: Alman and Vassilevska Williams, arXiv:2610.06783v1 (CC BY 4.0), with attribution on the page. Formalization scope checked against anthropics/formal-math/3sum-apsp README on 17 October 2026. The lesson does not reproduce the full algebraic proof or implement the research algorithm. All small visual computations are expressly labelled teaching examples. The Lean library was not rebuilt.

Validation:
- `node tools/aa_checks/check-w5-breakthrough.cjs`: content shape, all 16 matrix entries, shared-dependency unions, exponent ratios, and both 3SUM lists.
- `node tools/aa_checks/check-w5.cjs`: existing Week 5 regression checks still pass.
- All 18 pieces checked in browser at 1280×720 and 390×844 (36 observations): no page/visual horizontal overflow. The laptop visual panels fit inside the viewport when scrolled into view; longer explanations remain below.
- Browser interactions verified: alternate 3SUM input, weighted detour, matrix selection, shared A/B dependencies, exponent slider boundary, and arrow-key navigation. Native slider keys do not change lesson pieces. No observed console errors.
- New page/landing-page local references resolve; JavaScript syntax and `git diff --check` pass.
- Print-all support included; native print output has not been visually audited.

No push performed as part of this addition.
