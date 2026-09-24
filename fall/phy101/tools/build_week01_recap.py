#!/usr/bin/env python3
"""Build the Week 1 HTML extension using the course shell and shared math renderer."""
from pathlib import Path
from build_site import head_html, FOOT
ROOT=Path(__file__).resolve().parents[1]
head=head_html('Week 01 recap — two vector problems','Two solved Chapter 1 recap problems with interactive dot and cross products.',1,False)
head=head.replace('</head>','<link rel="stylesheet" href="../assets/week01-recap.css?v=4">\n<script defer src="../assets/week01-recap.js?v=4"></script>\n<script defer src="../assets/week01-trig.js?v=2"></script>\n</head>')
head=head.replace('<article class="col">','<article class="col recap">')
body=(ROOT/'tools/materials/week01-recap.html').read_text()
(ROOT/'w1/recap.html').write_text(head+body+FOOT)
print('Built w1/recap.html')
