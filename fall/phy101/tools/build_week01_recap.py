#!/usr/bin/env python3
"""Build the two Week 01 extension pages with the course shell and shared math renderer.

    python3 fall/phy101/tools/build_week01_recap.py

    tools/materials/week01-recap-products.html  ->  w1/recap.html
        Chapter 1 review of the scalar and vector products: eight worked
        review examples (Y&F Examples 1.9–1.11, VP1.10.2, VP1.10.4, P9 and
        two originals), six animations in assets/anim-w1-recap.js plus the
        shared "one angle, two products" animation from anim-w1.js, and the
        edge-case table. Runs on the same PhyAnim harness as the week page,
        so the predict gates, sliders, theme and KaTeX behave identically.

    tools/materials/week01-vector-lab.html      ->  w1/vector-lab.html
        The standalone "why cosine, why sine" geometry explorer.

    tools/materials/week01-recap.html           ->  w1/worked-solutions.html
        The two original solved problems with their guided steps and
        explorers (assets/week01-recap.js / .css).

Both pages are generated; edit the materials, never the pages.
"""
from pathlib import Path
from build_site import head_html, FOOT

ROOT = Path(__file__).resolve().parents[1]

# --- recap.html: the products-of-vectors review --------------------------------
head = head_html("Week 01 recap — products of vectors",
                 "Chapter 1 review: every worked example on the scalar and vector products, "
                 "with animations to predict against.", 1, True)
head = head.replace("</head>",
                    '<script defer src="../assets/anim-w1-recap.js?v=2"></script>\n</head>')
body = (ROOT / "tools/materials/week01-recap-products.html").read_text(encoding="utf-8")
nav = ('<nav class="week-nav">\n  <a href="./">&larr; Week 01 notes</a>\n'
       '  <a href="vector-lab.html">Why cosine, why sine? &middot; explorer</a>\n'
       '  <a href="worked-solutions.html">Two solved problems &rarr;</a>\n</nav>\n')
(ROOT / "w1/recap.html").write_text(head + body + nav + FOOT, encoding="utf-8")

# --- vector-lab.html: the "why cosine, why sine" explorer (standalone page) -----
(ROOT / "w1/vector-lab.html").write_text(
    (ROOT / "tools/materials/week01-vector-lab.html").read_text(encoding="utf-8"), encoding="utf-8")

# --- worked-solutions.html: the two solved problems ----------------------------
head2 = head_html("Week 01 — two solved vector problems",
                  "Two solved Chapter 1 recap problems with interactive dot and cross products.", 1, False)
head2 = head2.replace("</head>", '<link rel="stylesheet" href="../assets/week01-recap.css?v=4">\n'
                                 '<script defer src="../assets/week01-recap.js?v=4"></script>\n'
                                 '<script defer src="../assets/week01-trig.js?v=2"></script>\n</head>')
head2 = head2.replace('<article class="col">', '<article class="col recap">')
body2 = (ROOT / "tools/materials/week01-recap.html").read_text(encoding="utf-8")
(ROOT / "w1/worked-solutions.html").write_text(head2 + body2 + FOOT, encoding="utf-8")
print("Built w1/recap.html, w1/vector-lab.html and w1/worked-solutions.html")
