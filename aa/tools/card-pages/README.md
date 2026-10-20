# Current Week 4–7 card-page sources

These HTML files preserve the authored interactive main pages for Weeks 4–7. `aligned/build.py` reads each file, adds the learning bridge idempotently, and writes `wN/index.html`.

Edit these files when changing the card-page shell. The card banks, visuals and navigation scripts remain in `w4/recap/` and `w5/…w7/examples/`. Separately authored `lecture-notes.html`, `teknik-notlar/` and their interactive content are kept in place; this generator must not overwrite them with the older plain-language sources. The full generated question-bank lessons remain under `wN/ek-notlar/`.
