#!/usr/bin/env python3
"""
Static week-notes generator for PHY101.

    python3 fall/phy101/tools/build_site.py            # every week that has an animation set
    python3 fall/phy101/tools/build_site.py 1 2        # only these weeks
    python3 fall/phy101/tools/build_site.py all        # all 13

Reads the CANONICAL sources and writes generated pages:

    calendar.json            dates, titles, lab column, scope   (never edited here)
    notebooks/Week_NN.ipynb  the teaching content
        |
        v
    w1/index.html ... w13/index.html      published as
                                          https://arifsolmaz.github.io/phy101/wN/

Nothing under w*/ is hand-edited. Editing a notebook and re-running this script
is the only way the web notes change, which is what stops them drifting away
from the notebooks the way a second hand-written copy would. PUBLIC_URLS.md
records the routing rule this preserves.

What a page carries (decided 17 September 2026): the concepts, worked examples,
the method/standards block, the lab box and the animations. Problem sets stay
in the notebook, because inline answers at a clean public URL would reach the
parallel sections sitting the same common exam.

The notebook's ipywidgets demonstrations cannot survive as static HTML, so each
becomes either a registered animation (assets/anim-wN.js) or an honest pointer
to Colab. The animation keeps the notebook's prediction prompt, because
COURSE_POLICY.md 6 requires the prediction before the demonstration.
"""

import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]          # .../fall/phy101
REPO_SUBPATH = "fall/phy101"
GITHUB = "https://github.com/ArifSolmaz/courses/blob/main/" + REPO_SUBPATH
COLAB = "https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/" + REPO_SUBPATH

SITE = "PHY101 · Physics I"

KATEX = "0.16.11"
SRI_CSS = "sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
SRI_JS = "sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg"
SRI_AUTO = "sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk"

# Which interactive notebook cell each animation replaces, matched on the cell's
# heading text. Weeks with no entry fall back to a Colab pointer.
ANIMS = {
    1: [("Vector Components Visualizer", {
        "name": "w1-vectors",
        "label": "Predict, then watch",
        "title": "Components, and why 3 + 4 = 5",
        "desc": "Resolve one vector into components, or watch two displacements join tip-to-tail.",
        "foot": "The same idea is examined every week from here on: components add, magnitudes do not.",
        "foot_tr": "Bileşenler toplanır, büyüklükler toplanmaz.",
    })],
    2: [("x-t, v-t, a-t Graph Explorer", {
        "name": "w2-graphs",
        "label": "Predict, then watch",
        "title": "One motion, three graphs, one clock",
        "desc": "The time cursor moves across position, velocity and acceleration together, and the "
                "shaded area under the velocity graph is the displacement.",
        "foot": "Velocity is the slope of the position graph; displacement is the area under the "
                "velocity graph. Both are visible here before either is written as calculus. "
                "Area below the axis is shaded red because it counts as negative displacement \u2014 "
                "which is why the throw comes back to where it started.",
        "foot_tr": "Hız, konum grafiğinin eğimi; yer değiştirme ise hız "
                   "grafiğinin altındaki alandır.",
    })],
}

MATH_TOKEN = "@@MATH%d@@"
CODE_TOKEN = "@@CODE%d@@"


def protect(text, pattern, token, store, flags=0):
    def sub(m):
        store.append(m.group(0))
        return token % (len(store) - 1)
    return re.sub(pattern, sub, text, flags=flags)


def rewrite_link(target):
    """Point notebook-relative links at something a browser can actually open."""
    t = target.strip()
    if t.startswith(("http://", "https://", "mailto:")):
        return t
    if t.startswith("#"):
        return None                                   # in-page anchor: drop the link, keep the words
    t = re.sub(r"^\.\./", "", t)
    if t.endswith(".ipynb"):
        return f"{COLAB}/{t}"
    if t.endswith(".md"):
        return f"{GITHUB}/{t}"
    return "../" + t


def inline(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text, flags=re.S)
    text = re.sub(r"(?<![\w*])\*([^*\n]+?)\*(?![\w*])", r"<em>\1</em>", text)

    def link(m):
        label, target = m.group(1), m.group(2)
        url = rewrite_link(target)
        return label if url is None else f'<a href="{html.escape(url, quote=True)}">{label}</a>'
    return re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)


def pipe_table(rows):
    def cells(line):
        return [c.strip() for c in line.strip().strip("|").split("|")]
    head = cells(rows[0])
    body = [cells(r) for r in rows[2:]] if len(rows) > 2 else []
    out = ["<table>",
           "<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead>",
           "<tbody>"]
    for r in body:
        r = r + [""] * (len(head) - len(r))
        out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r[:len(head)]) + "</tr>")
    out += ["</tbody>", "</table>"]
    return "\n".join(out)


TR_START = re.compile(r"^\s*(?:<strong>)?(?:TR|Türkçe|Turkish)\b", re.I)


def md_to_html(text, heading_shift=0):
    math, code = [], []
    text = protect(text, r"```.*?```", CODE_TOKEN, code, re.S)
    text = protect(text, r"`[^`\n]+`", CODE_TOKEN, code)
    text = protect(text, r"\$\$.+?\$\$", MATH_TOKEN, math, re.S)
    text = protect(text, r"\$[^$\n]+?\$", MATH_TOKEN, math)

    out, para, lst, table = [], [], None, None

    def flush_para():
        nonlocal para
        if para:
            body = inline(" ".join(para).strip())
            attr = ' lang="tr"' if TR_START.match(body) else ""
            out.append(f"<p{attr}>{body}</p>")
            para = []

    def flush_list():
        nonlocal lst
        if lst:
            tag, items = lst
            out.append(f"<{tag}>" + "".join(f"<li>{inline(i)}</li>" for i in items) + f"</{tag}>")
            lst = None

    def flush_table():
        nonlocal table
        if table:
            out.append('<div class="tablewrap">' + pipe_table(table) + "</div>")
            table = None

    def flush_all():
        flush_para()
        flush_list()
        flush_table()

    for raw in text.split("\n"):
        stripped = raw.strip()

        if stripped.startswith("|") and "|" in stripped[1:]:
            flush_para()
            flush_list()
            table = (table or []) + [stripped]
            continue
        flush_table()

        if not stripped:
            flush_para()
            flush_list()
            continue
        if re.match(r'^<a id="[^"]+"></a>$', stripped):
            continue
        if stripped.startswith("<"):
            flush_all()
            out.append(raw.rstrip())
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            flush_all()
            level = max(2, min(6, len(m.group(1)) + heading_shift))
            out.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
            continue

        if re.match(r"^(-{3,}|\*{3,}|_{3,})$", stripped):
            flush_all()
            out.append("<hr>")
            continue

        if stripped.startswith(">"):
            flush_list()
            flush_para()
            out.append(f"<blockquote><p>{inline(stripped.lstrip('> ').strip())}</p></blockquote>")
            continue

        m = re.match(r"^[-*+]\s+(.*)$", stripped)
        if m:
            flush_para()
            if not lst or lst[0] != "ul":
                flush_list()
                lst = ("ul", [])
            lst[1].append(m.group(1))
            continue

        m = re.match(r"^\d+[.)]\s+(.*)$", stripped)
        if m:
            flush_para()
            if not lst or lst[0] != "ol":
                flush_list()
                lst = ("ol", [])
            lst[1].append(m.group(1))
            continue

        if lst:
            lst[1][-1] += " " + stripped
            continue
        para.append(stripped)

    flush_all()
    result = "\n".join(out)
    for i, c in enumerate(code):
        if c.startswith("```"):
            repl = f"<pre><code>{html.escape(c.strip('`').strip())}</code></pre>"
        else:
            repl = f"<code>{html.escape(c.strip('`'))}</code>"
        result = result.replace(CODE_TOKEN % i, repl)
    for i, c in enumerate(math):
        result = result.replace(MATH_TOKEN % i, c)
    return result


# ---------------------------------------------------------------- notebook walk

def heading_of(md_text):
    for line in md_text.split("\n"):
        m = re.match(r"^#{1,6}\s+(.*)$", line.strip())
        if m:
            return m.group(1)
    return ""


def anim_block(cfg, prose_html):
    foot = f"<p>{cfg['foot']}</p>" if cfg.get("foot") else ""
    if cfg.get("foot_tr"):
        foot += f'\n    <p lang="tr">{cfg["foot_tr"]}</p>'
    return f"""{prose_html}
<div class="anim" data-anim="{cfg['name']}">
  <div class="anim-head">
    <span class="label">{cfg['label']}</span>
    <h4>{cfg['title']}</h4>
    <p>{cfg['desc']}</p>
  </div>
  <div class="anim-foot">
    {foot}
    <p><em>The notebook runs the same demonstration with sliders in Colab.</em></p>
  </div>
</div>"""


def colab_pointer(title, prose_html, week):
    return f"""{prose_html}
<div class="note grey">
  <span class="label">Interactive in the notebook</span>
  <p><strong>{html.escape(title)}</strong> is a live demonstration with sliders. It needs a running
  Python kernel, so it cannot run on this page &mdash;
  <a href="{COLAB}/notebooks/Week_{week:02d}.ipynb">open Week {week:02d} in Colab</a>, run the setup
  cell once, then run this demonstration.</p>
  <p lang="tr">Bu g&ouml;sterim &ccedil;al&#305;&#351;an bir Python &ccedil;ekirde&#287;i gerektirir;
  not defterini Colab'da a&ccedil;&#305;p kurulum h&uuml;cresini bir kez &ccedil;al&#305;&#351;t&#305;r.</p>
</div>"""


def notebook_body(week, nb):
    """Walk the notebook and emit the web body, section by section."""
    anims = ANIMS.get(week, [])
    used = set()
    pre = f"w{week:02d}"
    out = []
    section = "front"
    skipped = {"code": 0, "setup": 0, "problems": 0, "contents": 0}

    for cell in nb["cells"]:
        src = "".join(cell["source"])
        if cell["cell_type"] == "code":
            skipped["code"] += 1
            continue

        for anchor in re.findall(r'<a id="([^"]+)"></a>', src):
            if anchor.startswith(pre + "-"):
                section = anchor[len(pre) + 1:]

        if section == "setup":
            skipped["setup"] += 1
            continue
        if section == "problems":
            skipped["problems"] += 1
            continue
        if src.lstrip().startswith("## Contents"):
            skipped["contents"] += 1
            continue
        if re.match(r"^#\s+Week\s", src.strip()):
            continue                                   # the hero replaces the title cell

        head = heading_of(src)
        body = md_to_html(src, heading_shift=-1)

        if "nteractive" in head:
            cfg = None
            for needle, candidate in anims:
                if needle.lower() in head.lower() and candidate["name"] not in used:
                    cfg = candidate
                    break
            if cfg:
                used.add(cfg["name"])
                out.append(anim_block(cfg, body))
            else:
                out.append(colab_pointer(head, body, week))
            continue

        if src.lstrip().startswith("## Lesson plan"):
            out.append('<div class="note blue">' + body + "</div>")
            continue

        out.append(body)

    missing = [c["name"] for _, c in anims if c["name"] not in used]
    return "\n\n".join(out), skipped, missing


# ---------------------------------------------------------------- page assembly

def head_html(title, desc, week, has_anim):
    animcss = '<link rel="stylesheet" href="../assets/anim.css">\n' if has_anim else ""
    scripts = ""
    if has_anim:
        scripts = ('<script defer src="../assets/anim.js"></script>\n'
                   f'<script defer src="../assets/anim-w{week}.js"></script>\n')
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<script>
/* Set the theme before the first paint so the page never flashes the wrong one. */
(function () {{
  try {{
    var t = localStorage.getItem("phy101_theme");
    if (!t) t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
  }} catch (e) {{}}
}})();
</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ctext y=%2724%27 x=%273%27 font-size=%2722%27 font-family=%27monospace%27 font-weight=%27700%27 fill=%27%23e65100%27%3EF%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&amp;family=Syne:wght@400;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
{animcss}<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/katex.min.css" integrity="{SRI_CSS}" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/katex.min.js" integrity="{SRI_JS}" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/contrib/auto-render.min.js" integrity="{SRI_AUTO}" crossorigin="anonymous"></script>
{scripts}<script defer src="../assets/app.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to the notes</a>
<header class="site-header">
  <a class="brand" href="../web/PHY101_Course_Dashboard.html">PHY<span>101</span> / physics I</a>
  <nav class="header-nav" aria-label="Course pages">
    <a class="hlink" href="../web/PHY101_Course_Dashboard.html">Dashboard</a>
    <a class="hlink" href="../web/PHY101_Course_Dashboard.html#overview">All weeks</a>
    <a class="hlink" href="../web/PHY101_Syllabus.html">Syllabus</a>
    <a class="hlink" href="{COLAB}/labs/Lab_00_Uncertainty_Toolkit.ipynb">Lab toolkit</a>
    <button class="hlink" data-theme-toggle type="button">&#9788; Light</button>
  </nav>
</header>
<main class="wrap" id="main">
"""


FOOT = f"""</main>
<footer class="site-footer">
  <span>{SITE} &middot; Dr. Arif Solmaz &middot; &#304;ST&#220;N</span>
  <span><a href="../web/PHY101_Course_Dashboard.html">Dashboard</a> &middot;
        <a href="https://arifsolmaz.github.io/courses/">All courses</a></span>
</footer>
</body>
</html>
"""

MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def published_weeks():
    """Weeks that currently have a generated page on disk."""
    out = set()
    for d in ROOT.glob("w*"):
        m = re.match(r"^w(\d+)$", d.name)
        if m and (d / "index.html").is_file():
            out.add(int(m.group(1)))
    return out


def month_day(iso):
    _, m, d = (int(x) for x in iso.split("-"))
    return f"{d} {MONTHS[m - 1]}"


def week_page(wk, nb, known=None):
    num = wk["week"]
    body, skipped, missing = notebook_body(num, nb)
    has_anim = bool(ANIMS.get(num)) and not missing
    lab = wk.get("lab")

    chips = ['<span class="chip gold">3-hour session</span>']
    if wk["session_date"]:
        chips.append(f'<span class="chip">class {month_day(wk["session_date"])}</span>')
    if lab:
        chips.append(f'<span class="chip green">lab: {html.escape(lab["title_tr"])}</span>')
    chips.append('<span class="chip blue">departmental schedule &middot; common exams</span>')

    # Only offer a neighbour that is actually published: linking to a week whose
    # page has not been generated yet would hand students a 404.
    published = known if known is not None else published_weeks()
    prev_link = (f'<a href="../w{num - 1}/">&larr; Week {num - 1:02d}</a>'
                 if (num - 1) in published
                 else '<a href="../web/PHY101_Course_Dashboard.html">&larr; Dashboard</a>')
    if (num + 1) in published:
        next_link = f'<a href="../w{num + 1}/">Week {num + 1:02d} &rarr;</a>'
    elif num >= 13:
        next_link = f'<a href="{COLAB}/notebooks/Final_Review.ipynb">Final review &rarr;</a>'
    else:
        next_link = '<a href="../web/PHY101_Course_Dashboard.html">All weeks &rarr;</a>'

    intro = f"""<div class="note orange">
  <span class="label">How to use this page</span>
  <p>These notes are generated from the <strong>Week {num:02d} notebook</strong>, so they always say the
  same thing it does. Read here; do the problems in the notebook, where every problem shows its answer
  and the full worked solution opens later.</p>
  <p lang="tr">Bu sayfa Week {num:02d} not defterinden &uuml;retilir, yani her zaman onunla
  ayn&#305; &#351;eyi s&ouml;yler. Konuyu burada oku; problemleri not defterinde &ccedil;&ouml;z.</p>
  <div class="btn-row" style="margin-top:.8rem">
    <a class="btn" href="{COLAB}/notebooks/Week_{num:02d}.ipynb">Open Week {num:02d} in Colab</a>
    <a class="btn secondary" href="../notebooks/Week_{num:02d}.ipynb" download>Download notebook</a>
  </div>
</div>"""

    lab_box = ""
    if lab:
        brief = (f'<a class="btn secondary" href="{COLAB}/{lab["brief"]}">Open the lab brief</a>'
                 if lab.get("brief") else "")
        covers = ""
        if lab.get("covers_week") and lab["covers_week"] != num:
            covers = f' It measures the physics of <strong>Week {lab["covers_week"]:02d}</strong>.'
        lab_box = f"""<div class="note green">
  <span class="label">This week in the laboratory</span>
  <p><strong>{html.escape(lab["title_tr"])} / {html.escape(lab["title_en"])}</strong> &mdash;
  {html.escape(lab["focus"])}.{covers}</p>
  <p>Do the prediction in &sect;1 of the brief <strong>before</strong> you arrive; you will be asked for
  your predicted number at the bench. Laboratory analysis technique is not examined in the common
  midterm or final &mdash; the physics being measured is.</p>
  <p lang="tr">Deneye gelmeden &ouml;nce brifingin &sect;1'indeki tahmini yap.</p>
  <div class="btn-row" style="margin-top:.8rem">{brief}
    <a class="btn secondary" href="{COLAB}/labs/Lab_00_Uncertainty_Toolkit.ipynb">Uncertainty toolkit</a>
  </div>
</div>"""

    problems = f"""<h2>Problem set</h2>
<div class="note grey">
  <p>The problem set for this week &mdash; core (L1), intermediate (L2) and challenge (L3) &mdash; is in
  the notebook, not on this page. Each problem shows its <strong>answer</strong> so you can check
  yourself; the full worked solution opens on the date printed under it.</p>
  <p><strong>Write your own attempt first:</strong> symbolic answer, one limiting-case check, then
  numbers. Opening the answer first turns a problem into a worked example, and worked examples do not
  build the skill the exam tests.</p>
  <p lang="tr">Problem seti bu sayfada de&#287;il, not defterinde. &Ouml;nce kendi denemeni yaz &mdash;
  sembolik sonu&ccedil;, s&#305;n&#305;r kontrol&uuml;, sonra say&#305;lar.</p>
  <div class="btn-row" style="margin-top:.8rem">
    <a class="btn" href="{COLAB}/notebooks/Week_{num:02d}.ipynb">Problem set in Colab</a>
  </div>
</div>"""

    page = "\n".join([
        head_html(f"Week {num:02d}: {wk['title_en']} — {SITE}", wk["scope"], num, has_anim),
        f"""<div class="hero">
  <div class="eyebrow">Week {num:02d} &middot; {month_day(wk['start'])}&ndash;{month_day(wk['end'])} 2026</div>
  <h1>{html.escape(wk['title_en'])}<em lang="tr">{html.escape(wk['title_tr'])}</em></h1>
  <p class="lede">{html.escape(wk['scope'])}.</p>
  <div class="hero-meta">{''.join(chips)}</div>
</div>""",
        intro,
        lab_box,
        body,
        problems,
        f"""<nav class="week-nav">
  {prev_link}
  <button class="done-btn" type="button" data-done="w{num}" aria-pressed="false">mark this week done</button>
  {next_link}
</nav>""",
        FOOT,
    ])
    return page, skipped, missing


def main(argv):
    calendar = json.loads((ROOT / "calendar.json").read_text(encoding="utf-8"))
    if argv and argv[0] == "all":
        wanted = [w["week"] for w in calendar["weeks"]]
    elif argv:
        wanted = [int(a) for a in argv]
    else:
        wanted = sorted(ANIMS)

    # What will exist once this run finishes: already-published pages plus the
    # ones about to be written. Neighbour links are drawn from this.
    known = published_weeks() | set(wanted)

    failures = []
    for wk in calendar["weeks"]:
        if wk["week"] not in wanted:
            continue
        nb = json.loads((ROOT / wk["notebook"]).read_text(encoding="utf-8"))
        page, skipped, missing = week_page(wk, nb, known)
        target = ROOT / f"w{wk['week']}" / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        note = ""
        if missing:
            note = "   !! animation host never placed: " + ", ".join(missing)
            failures.append((wk["week"], missing))
        print(f"  wrote {target.relative_to(ROOT)}  ({len(page):,} bytes; skipped "
              f"{skipped['code']} code, {skipped['setup']} setup, {skipped['problems']} problem cells)"
              f"{note}")

    # A manifest of the weeks that actually have a page, so the dashboard can
    # link only to pages that exist instead of a hand-kept list going stale.
    built = sorted(int(d.name[1:]) for d in ROOT.glob("w*") if (d / "index.html").is_file())
    manifest = ROOT / "web" / "phy101-notes.js"
    manifest.write_text(
        "// Generated by tools/build_site.py - the weeks that have a notes page.\n"
        f"window.PHY101_NOTES = {json.dumps(built)};\n", encoding="utf-8")
    print(f"  wrote {manifest.relative_to(ROOT)}  (weeks {built})")

    if failures:
        print("\nFAILED: an ANIMS heading matched no interactive cell "
              "(did the notebook heading change?).", file=sys.stderr)
        return 1
    print(f"\nOK - {len(wanted)} week page(s) built from calendar.json and the notebooks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
