#!/usr/bin/env python3
"""
Check the generated PHY101 week pages.

    python3 fall/phy101/tools/verify_site.py

The important check is REGENERABILITY: each published page is rebuilt from
calendar.json plus the notebook and compared byte for byte with what is on
disk. If they differ, either someone hand-edited a generated page (which the
next build would silently destroy) or the build was never re-run after a
notebook changed. Both are the drift this pipeline exists to prevent.

Also checked: assets referenced by each page exist, the KaTeX subresource
hashes are still pinned, every declared animation has its module, no raw
markdown survived the conversion, and no link points into a section that the
web page deliberately leaves out.
"""

import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build_site as B

ROOT = B.ROOT
FAILS = []
CHECKS = [0]


def check(ok, message):
    CHECKS[0] += 1
    if not ok:
        FAILS.append(message)
    return ok


# W06 is a review session and W07 is the midterm: neither introduces a new
# equation, so neither is expected to produce a key-equation rail.
TEACHING_EXEMPT = {6, 7}


def main():
    # Notebook links must be resolved from notebooks/, including moved resources.
    for target, expected in [
        ("Final_Review.ipynb", B.COLAB + "/notebooks/Final_Review.ipynb"),
        ("../extensions/Resonance.ipynb", B.COLAB + "/extensions/Resonance.ipynb"),
        ("Final_Review.ipynb?x=1#section", B.COLAB + "/notebooks/Final_Review.ipynb?x=1#section"),
        ("../COURSE_POLICY.md", B.GITHUB + "/COURSE_POLICY.md"),
        ("../labs/", B.GITHUB.replace("/blob/", "/tree/") + "/labs"),
    ]:
        check(B.rewrite_link(target) == expected, f"incorrect notebook link rewrite: {target}")

    calendar = json.loads((ROOT / "calendar.json").read_text(encoding="utf-8"))
    pages = sorted(ROOT.glob("w*/index.html"))
    check(bool(pages), "no generated week pages found - run build_site.py")

    for page in pages:
        week = int(re.match(r"w(\d+)$", page.parent.name).group(1))
        rel = page.relative_to(ROOT)
        wk = next((w for w in calendar["weeks"] if w["week"] == week), None)
        if not check(wk is not None, f"{rel}: week {week} is not in calendar.json"):
            continue

        html_text = page.read_text(encoding="utf-8")
        nb = json.loads((ROOT / wk["notebook"]).read_text(encoding="utf-8"))

        # 1. regenerable, byte for byte
        fresh, _, missing_anim, missing_fig, meta = B.week_page(wk, nb, B.published_weeks())
        check(fresh == html_text,
              f"{rel}: differs from a fresh build - it was hand-edited, or the notebook "
              f"changed and build_site.py was not re-run")
        check(not missing_anim, f"{rel}: animation host never placed: {', '.join(missing_anim)}")
        check(not missing_fig, f"{rel}: figure never placed: {', '.join(missing_fig)}")

        # 1b. the typed furniture actually came out
        check(meta["sections"], f"{rel}: no numbered sections were produced")
        check(len(meta["sections"]) <= 9,
              f"{rel}: {len(meta['sections'])} sections - the heading hierarchy has flattened again")
        n_fig = len(re.findall(r'<figure class="figure"', html_text))
        check(n_fig == meta["figures"], f"{rel}: figure count disagrees with the build")
        # Furniture the build produced must actually reach the page. Weeks that
        # legitimately carry none (W06 review, W07 midterm) are not failures; a
        # component that was built and then silently vanished is.
        for label, n in (("Key equation", len(meta["equations"])),
                         ("Worked example", meta["examples"]),
                         ("Figure", n_fig)):
            if not n:
                continue
            check(label in html_text,
                  f"{rel}: {n} {label!r} built but none rendered on the page")

        # Every teaching week must end up with at least one key equation. This is
        # what boxing the central equations in the notebooks bought; without the
        # check a future edit could quietly empty a week's summary card again.
        if week not in TEACHING_EXEMPT:
            check(meta["equations"],
                  f"{rel}: no key equations - box the week's central equation with "
                  f"\\boxed{{}} in the notebook")

        # 1c. margin notes must not repeat the label the aside already carries
        dupes = re.findall(r'<span class="mn-label"[^>]*>T[^<]*</span>\s*<p>\s*'
                           r'(?:<strong>)?\s*(?:TR|T\u00fcrk\u00e7e|Turkish)\s*[:.]', html_text)
        check(not dupes, f"{rel}: {len(dupes)} margin note(s) still print their own TR: prefix")

        # 2. local assets exist
        for href in set(re.findall(r'(?:href|src)="(\.\./[^"]+)"', html_text)):
            target = (page.parent / href).resolve()
            if target.suffix in (".css", ".js"):
                check(target.is_file(), f"{rel}: missing asset {href}")

        # Colab can return HTTP 200 even when its underlying notebook does not exist.
        for target in set(re.findall(re.escape(B.COLAB) + r'/([^"?#]+)', html_text)):
            check((ROOT / target).is_file(), f"{rel}: Colab notebook missing: {target}")

        # 3. KaTeX still pinned
        check(B.SRI_CSS in html_text and B.SRI_JS in html_text and B.SRI_AUTO in html_text,
              f"{rel}: KaTeX subresource-integrity hashes are not all present")

        # 4. declared animations have a module
        for name in set(re.findall(r'data-anim="([^"]+)"', html_text)):
            mod = ROOT / "assets" / f"anim-w{week}.js"
            check(mod.is_file(), f"{rel}: declares {name} but {mod.name} is missing")
            if mod.is_file():
                check(f'register("{name}"' in mod.read_text(encoding="utf-8"),
                      f"{rel}: {mod.name} never registers {name}")

        # 5. no raw markdown left in the output
        body = html_text.split('<main', 1)[-1]
        body = re.sub(r"<svg.*?</svg>", "", body, flags=re.S)      # figures are hand-written SVG
        for pattern, label in [(r"\*\*[^*\n]{2,60}\*\*", "bold markdown"),
                               (r"@@(?:MATH|CODE)\d+@@", "a protected-token placeholder"),
                               (r"\]\((?:\.\./|#)[^)]*\)", "an unconverted markdown link")]:
            hits = re.findall(pattern, body)
            check(not hits, f"{rel}: {label} survived conversion, e.g. {hits[:2]}")

        # 6. no links into sections the page omits
        omitted = re.findall(r'href="#w\d+-(problems|setup)"', html_text)
        check(not omitted, f"{rel}: links into an omitted section: {set(omitted)}")

        print(f"  checked {rel}")

    print(f"\n{CHECKS[0]} checks on {len(pages)} page(s)")
    if FAILS:
        print("\nFAILED:", file=sys.stderr)
        for f in FAILS:
            print("  - " + f, file=sys.stderr)
        return 1
    print("OK - every page regenerates byte for byte from calendar.json and its notebook.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
