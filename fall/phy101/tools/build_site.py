#!/usr/bin/env python3
"""
Static week-notes generator for PHY101.

    python3 fall/phy101/tools/build_site.py            # every week with an animation set
    python3 fall/phy101/tools/build_site.py 1 2        # only these weeks
    python3 fall/phy101/tools/build_site.py all        # all 13

Reads the CANONICAL sources and writes generated pages:

    calendar.json            dates, titles, lab column, scope   (never edited here)
    notebooks/Week_NN.ipynb  the teaching content
    tools/figures.py         the inline SVG figure library
        |
        v
    w1/index.html ... w13/index.html      published as
                                          https://arifsolmaz.github.io/phy101/wN/

Nothing under w*/ is hand-edited. Editing a notebook and re-running this script
is the only way the web notes change, which is what stops them drifting away
from the notebooks the way a second hand-written copy would. PUBLIC_URLS.md
records the routing rule this preserves.

WHAT THIS DOES BEYOND CONVERTING MARKDOWN
-----------------------------------------
A notebook cell is an undifferentiated block of prose. A textbook page is not:
it has typed furniture, and the reader navigates by recognising the shape of a
thing before reading it. So the notebook's own conventions are used to classify
each block, and the classes are given that shape:

    heading "Worked example ..."   -> numbered worked-example box
    heading "Checkpoint ..."       -> "check yourself" box
    heading "Learning Objectives"  -> numbered objective cards
    heading "Interactive ..."      -> the week's animation, or a Colab pointer
    display maths with \\boxed      -> numbered key-equation card, and an entry
                                      in the end-of-page equation summary
    paragraph opening "Not this
    week" / "Not yet"              -> caution callout
    paragraph marked TR / Turkce   -> margin note in the gutter, beside the
                                      English rather than interrupting it

Section headings are numbered (2.1, 2.2, ...) and collected into a contents
card. Figures come from tools/figures.py, are numbered per week, and carry
their Turkish caption as a margin note.

The notebook's ipywidgets demonstrations cannot survive as static HTML, so each
becomes either a registered animation (assets/anim-wN.js) or an honest pointer
to Colab. The animation keeps the notebook's prediction prompt, because
COURSE_POLICY.md 6 requires the prediction before the demonstration.

Problem sets stay in the notebook: inline answers at a clean public URL would
reach the parallel sections sitting the same common exam.
"""

import html
import json
import pathlib
import posixpath
from urllib.parse import urlsplit, urlunsplit, quote, unquote
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import figures as FIGLIB

ROOT = pathlib.Path(__file__).resolve().parents[1]          # .../fall/phy101
REPO_SUBPATH = "fall/phy101"
GITHUB = "https://github.com/ArifSolmaz/courses/blob/main/" + REPO_SUBPATH
COLAB = "https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/" + REPO_SUBPATH

SITE = "PHY101 · Physics I"

KATEX = "0.16.11"
SRI_CSS = "sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
SRI_JS = "sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg"
SRI_AUTO = "sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk"

FONTS = ("https://fonts.googleapis.com/css2"
         "?family=JetBrains+Mono:wght@400;600;700"
         "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400"
         "&family=Syne:wght@400;600;700&display=swap")

ANIMS = {
    1: [("Vector Components", {
        "name": "w1-vectors",
        "label": "Predict, then watch",
        "title": "The signs, quadrant by quadrant \u2014 and the arctan trap",
        "desc": "Turn one vector all the way round and watch each component change sign as it "
                "crosses an axis, with the angle a calculator would report shown beside the one "
                "that is true. The second view is Example 1.5, the cross-country skier.",
        "foot": "Equations (1.5) give the components and (1.7) the direction \u2014 but any two "
                "angles 180\u00b0 apart share a tangent, so the sketch, not the calculator, decides "
                "the quadrant. Example 1.7 and VP1.7.3 both turn on exactly this.",
        "foot_tr": "\u0130\u015faretler b\u00f6lgeden gelir; arktanjant tek ba\u015f\u0131na b\u00f6lgeyi bilemez, \u00e7izim bilir.",
    }), ("Vector Addition in Any Order", {
        "name": "w1-order",
        "label": "Predict, then watch",
        "title": "Three displacements, six routes, one buried key",
        "desc": "The three legs of Example 1.7 laid head to tail. Shuffle the order and the route "
                "across the field changes completely while the resultant does not move.",
        "foot": "Equations (1.3): vector addition is commutative and associative. The three "
                "contestants each walk 147.5 m to finish 12.7 m from where they started.",
        "foot_tr": "Toplama s\u0131ras\u0131 bile\u015fkeyi de\u011fi\u015ftirmez; yaln\u0131zca ara yol de\u011fi\u015fir.",
    }), ("Scalar and Vector Products", {
        "name": "w1-products",
        "label": "Predict, then watch",
        "title": "One angle, two products",
        "desc": "As the angle between two vectors grows, AB cos \u03c6 falls from +AB through zero "
                "to \u2212AB while AB sin \u03c6 rises from zero to AB and back.",
        "foot": "Each product vanishes exactly where the other is extreme. That is why one of them "
                "measures alignment \u2014 work, in Week 05 \u2014 and the other measures turning: "
                "torque, in Week 11.",
        "foot_tr": "Biri s\u0131f\u0131rken \u00f6teki en b\u00fcy\u00fckt\u00fcr: biri hizalanmay\u0131, \u00f6teki d\u00f6nd\u00fcrmeyi \u00f6l\u00e7er.",
    })],
    2: [("x-t, v-t, a-t Graph Explorer", {
        "name": "w2-graphs",
        "label": "Predict, then watch",
        "title": "One motion, three graphs, one clock",
        "desc": "The time cursor moves across position, velocity and acceleration together, and the "
                "shaded area under the velocity graph is the displacement.",
        "foot": "Velocity is the slope of the position graph; displacement is the area under the "
                "velocity graph. Both are visible here before either is written as calculus. "
                "Area below the axis is shaded red because it counts as negative displacement — "
                "which is why the throw comes back to where it started.",
        "foot_tr": "Hız, konum grafiğinin eğimi; yer değiştirme ise hız "
                   "grafiğinin altındaki alandır.",
    })],
    3: [("Animated Projectile Trajectory", {
        "name": "w3-independence",
        "label": "Predict, then watch",
        "title": "Dropped and launched, falling together",
        "desc": "Raise the launch speed and the two balls still fall level with each other: "
                "horizontal speed changes where the second lands, never when.",
        "foot": "The vertical equation does not contain the horizontal speed. That is the whole "
                "of the independence of motion.",
        "foot_tr": "Düşey denklemde yatay hız hiç geçmez.",
    }), ("Range vs Launch Angle", {
        "name": "w3-range",
        "label": "Predict, then watch",
        "title": "Why two angles share a range",
        "desc": "Drag the launch angle and watch its complement keep exactly the same range, "
                "reaching it by a taller, slower route.",
        "foot": "Angles that add to 90° share a range, because sin 2θ is unchanged by θ → 90° − θ.",
        "foot_tr": "Toplamı 90° olan açılar aynı menzili verir.",
    })],
    4: [("Inclined Plane Simulator", {
        "name": "w4-incline",
        "label": "Predict, then watch",
        "title": "Does it slide? The two forces that decide",
        "desc": "Compare the driving force mg sin θ with the friction available μs N, and change "
                "the mass to watch the critical angle refuse to move.",
        "foot": "The mass cancels: tan θc = μs. A heavy block is pulled harder and grips harder, "
                "in exactly the same proportion.",
        "foot_tr": "Kütle sadeleşir: tan θc = μs.",
    }), ("Atwood Machine Simulator", {
        "name": "w4-atwood",
        "label": "Predict, then watch",
        "title": "Tension trapped between two weights",
        "desc": "Change either mass and watch the tension stay squeezed between the two weights, "
                "never above the heavier or below the lighter.",
        "foot": "T = 2m₁m₂g/(m₁+m₂) — the harmonic mean, which is always between the two.",
        "foot_tr": "Gerilme her zaman iki ağırlığın arasındadır.",
    })],
    5: [("Work as the area under an F–x graph", {
        "name": "w5-area",
        "label": "Predict, then watch",
        "title": "Work is the signed area, and it accumulates",
        "desc": "Watch the area under F(x) sweep out as the block advances, with the kinetic "
                "energy below it following step for step.",
        "foot": "Area above the axis adds energy, area below removes it. Equal areas cancel exactly.",
        "foot_tr": "Eksenin üstündeki alan enerji verir, altındaki alır.",
    })],
    8: [("Roller Coaster Energy Simulator", {
        "name": "w8-track",
        "label": "Predict, then watch",
        "title": "The energy account, kept live",
        "desc": "K and U trade places as the cart runs the track, but their total is a flat line — "
                "until you turn friction on.",
        "foot": "The reachable-height line is E/mg: the cart can never climb above it.",
        "foot_tr": "Ulaşılabilir yükseklik çizgisi E/mg'dir.",
    }), ("Spring-Block Oscillation with Energy", {
        "name": "w8-spring",
        "label": "Predict, then watch",
        "title": "Why the spring energy carries a square",
        "desc": "Double the compression and the launch height goes up four times, not two — the "
                "guides on the curve show the factor directly.",
        "foot": "Us = ½kx². The square is why a small extra squeeze buys so much height.",
        "foot_tr": "Us = ½kx²; kare, küçük bir ek sıkıştırmanın neden çok kazandırdığını açıklar.",
    })],
    9: [("Impulse-Momentum Theorem Visualizer", {
        "name": "w9-impulse",
        "label": "Predict, then watch",
        "title": "Same area, gentler force",
        "desc": "Stretch the stopping time and watch the area under the force–time curve hold "
                "still while its peak collapses.",
        "foot": "J = Δp is fixed by the momentum change. Only the shape of the pulse is yours to "
                "choose — which is exactly what an airbag chooses.",
        "foot_tr": "J = Δp sabittir; yalnızca darbenin biçimi değişir.",
    }), ("Animated 1D Collision Simulator", {
        "name": "w9-collisions",
        "label": "Predict, then watch",
        "title": "From perfectly elastic to perfectly stuck",
        "desc": "One slider runs from a bouncy collision to a sticky one. Momentum never moves; "
                "kinetic energy drains away.",
        "foot": "Momentum is conserved in every case here. The energy lost is what distinguishes "
                "the collisions from one another.",
        "foot_tr": "Momentum her durumda korunur; çarpışmaları ayıran kayıp enerjidir.",
    })],
    10: [("Animated Rotating Disk", {
        "name": "w10-omega",
        "label": "Predict, then watch",
        "title": "One ω, many speeds",
        "desc": "Two points on one turning disc keep the same angular velocity while their linear "
                "speeds differ in exact proportion to their radii.",
        "foot": "v = ωr is the bridge between the angular column and the linear one.",
        "foot_tr": "v = ωr, açısal ve doğrusal sütunlar arasındaki köprüdür.",
    }), ("Moment of Inertia Comparison", {
        "name": "w10-inertia",
        "label": "Predict, then watch",
        "title": "The same mass, four times as hard to spin",
        "desc": "Two rigs of identical mass get identical torques; the one with its mass further "
                "out turns a quarter as far in the same time.",
        "foot": "I = Σmr². The square on r is why where the mass sits matters more than how much "
                "of it there is.",
        "foot_tr": "I = Σmr²; kütlenin nerede olduğu, ne kadar olduğundan çok şey belirler.",
    })],
    11: [("Rolling vs Sliding Down an Incline", {
        "name": "w11-race",
        "label": "Predict, then watch",
        "title": "A race decided by shape alone",
        "desc": "Hoop, disc and sphere roll down the same ramp. Change the angle, the mass, the "
                "radius — the order never changes.",
        "foot": "a = g sin θ/(1+c). Only the shape factor c survives; mass and radius cancel.",
        "foot_tr": "a = g sin θ/(1+c); yalnızca biçim çarpanı kalır.",
    }), ("Angular Momentum — Pulling the Masses In", {
        "name": "w11-angmom",
        "label": "Predict, then watch",
        "title": "L holds still while everything else moves",
        "desc": "Pull the masses inward and watch four bars respond: L pinned, I down, ω up, and "
                "K up as well — because the pulling does work.",
        "foot": "K = L²/2I, so halving I doubles the energy. Conservation of L does not mean "
                "conservation of energy.",
        "foot_tr": "K = L²/2I; L'nin korunması enerjinin korunması demek değildir.",
    })],
    12: [("Beam Balance Simulator", {
        "name": "w12-balance",
        "label": "Predict, then watch",
        "title": "Both equilibrium conditions, running at once",
        "desc": "Slide the load along the plank and watch the two support forces trade the weight "
                "between them, with ΣF and Στ held at zero throughout.",
        "foot": "Push the load past a support and a reaction goes negative — the plank would lift "
                "off, and something would have to hold it down.",
        "foot_tr": "Yükü desteğin ötesine itince tepki negatife döner.",
    }), ("Seesaw/Lever Equilibrium", {
        "name": "w12-tipping",
        "label": "Predict, then watch",
        "title": "Slide or tip — which threshold comes first",
        "desc": "Two angles compete: tan θ = μs for sliding and tan θ = b/h for tipping. Change "
                "the shape and watch them swap places.",
        "foot": "Neither threshold contains the mass. A tall narrow box topples; a wide flat one "
                "slides.",
        "foot_tr": "İki eşikte de kütle yoktur.",
    })],
    13: [("Animated Spring-Mass Oscillation", {
        "name": "w13-shm",
        "label": "Predict, then watch",
        "title": "One motion, read four ways",
        "desc": "x, v and a share a time cursor while the phase-space loop beside them closes once "
                "per cycle.",
        "foot": "Each curve is the previous one a quarter period later, and a = −ω²x is the mirror "
                "you can see.",
        "foot_tr": "Her eğri bir öncekinin çeyrek periyot sonrasıdır.",
    }), ("Energy Exchange Visualization", {
        "name": "w13-energy",
        "label": "Predict, then watch",
        "title": "Two energies, one constant total",
        "desc": "K and U swap back and forth against position and against time — and complete two "
                "cycles for every one of the motion.",
        "foot": "The mass passes the centre twice per cycle, so the energy curves run at twice the "
                "frequency of x.",
        "foot_tr": "Kütle her çevrimde merkezden iki kez geçer; enerji eğrileri iki kat frekanslıdır.",
    })],
}

MATH_TOKEN = "@@MATH%d@@"
CODE_TOKEN = "@@CODE%d@@"


# ---------------------------------------------------------------- markdown

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
    parts = urlsplit(t)
    course_path = posixpath.normpath(posixpath.join("notebooks", unquote(parts.path)))
    encoded = quote(course_path, safe="/")
    if course_path == "labs":
        base = GITHUB.replace("/blob/", "/tree/") + "/labs"
    elif course_path.endswith(".ipynb"):
        base = f"{COLAB}/{encoded}"
    elif course_path.endswith(".md"):
        base = f"{GITHUB}/{encoded}"
    else:
        base = "../" + encoded
    return urlunsplit((*urlsplit(base)[:3], parts.query, parts.fragment))



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
            # Notebook images need absolute URLs in Colab; generated pages use
            # local assets so previews and published pages load the same drawing.
            raw = raw.replace("https://arifsolmaz.github.io/courses/fall/phy101/assets/", "../assets/")
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


# ---------------------------------------------------------------- components

CAUTION_LEADS = ("Not this week", "Not yet", "Caution", "A caution", "The catch")


def is_examples_header(head_l):
    """"Worked Examples" alone is a section divider, not an example itself."""
    return bool(re.match(r"^(?:\W*\s*)?worked examples\s*$", head_l))


TR_PREFIX = re.compile(
    r"^\s*(?:<strong>\s*)?(?:TR|Türkçe(?:\s+destek)?|Turkish)\s*[:.]?\s*"
    r"(?:</strong>)?\s*[:.]?\s*", re.I)


def to_margin_notes(body):
    """Move Turkish paragraphs out of the reading column and into the gutter.

    The aside carries its own "Türkçe" label, so the paragraph's own "TR:"
    prefix is stripped instead of being printed twice.
    """
    def repl(m):
        text = TR_PREFIX.sub("", m.group(1)).strip()
        return ('<aside class="mn" lang="tr"><span class="mn-label">TÜRKÇE</span>'
                f"<p>{text}</p></aside>")
    return re.sub(r'<p lang="tr">(.*?)</p>', repl, body, flags=re.S)


def unbox(tex):
    r"""Remove \boxed{...} but keep its contents.

    The key-equation card is already a box, so letting KaTeX draw another one
    inside it gives a box inside a box. Brace counting rather than a regex,
    because the contents contain braces of their own.
    """
    out, i = [], 0
    needle = r"\boxed{"
    while True:
        j = tex.find(needle, i)
        if j < 0:
            out.append(tex[i:])
            return "".join(out)
        out.append(tex[i:j])
        depth, k = 1, j + len(needle)
        while k < len(tex) and depth:
            if tex[k] == "{":
                depth += 1
            elif tex[k] == "}":
                depth -= 1
            k += 1
        out.append(tex[j + len(needle):k - 1] if depth == 0 else tex[j + len(needle):k])
        i = k


def looks_like_an_answer(tex):
    """True when the boxed thing is a number with a unit, not a relation.

    Worked examples box their final answers, so treating every \boxed as a key
    equation ended up advertising "Q = 0.283 m^3/s" as a law of physics. A key
    equation relates symbols to each other; an answer is arithmetic.
    """
    inner = re.findall(r"\\boxed\{(.+?)\}", tex, re.S)
    if not inner:
        return False
    body = inner[-1]
    stripped = re.sub(r"\\mathrm\{[^}]*\}", "", body)          # units are not symbols
    stripped = re.sub(r"\\[a-zA-Z]+", "", stripped)            # nor are macro names
    letters = set(re.findall(r"[A-Za-z]", stripped))
    digits = re.findall(r"\d", stripped)
    return len(letters) <= 2 and len(digits) >= 2


def to_key_equations(body, week, counter, collected, allow=True):
    """A display equation the notebook marked with \boxed is a key equation."""
    def repl(m):
        tex = m.group(1)
        if not allow or "\\boxed" not in tex or looks_like_an_answer(tex):
            return m.group(0)
        counter[0] += 1
        num = (f"1.{[9, 14, 16, 19, 20, 25][counter[0] - 1]}"
               if week == 1 and counter[0] <= 6 else f"{week}.{counter[0]}")
        shown = unbox(tex)
        collected.append((num, shown))
        return (f'<div class="keyeq" id="eq-{week}-{counter[0]}">'
                f'<div class="keyeq-head"><span>Key equation {num}</span></div>'
                f'<div class="keyeq-body">{shown}</div></div>')
    return re.sub(r"<p>\s*(\$\$.*?\$\$)\s*</p>", repl, body, flags=re.S)


def to_cautions(body):
    def repl(m):
        lead = m.group(1)
        if not any(lead.startswith(x) for x in CAUTION_LEADS):
            return m.group(0)
        return ('<div class="callout caution"><span class="callout-label">Watch out</span>'
                f"<p><strong>{lead}</strong>{m.group(2)}</p></div>")
    return re.sub(r"<p><strong>([^<]{3,40})</strong>(.*?)</p>", repl, body, flags=re.S)


def split_heading(body):
    """Pull the first heading off a block so it can be re-framed as a box header."""
    m = re.search(r"<(h[2-6])>(.*?)</\1>", body, re.S)
    if not m:
        return None, body
    return m.group(2), (body[:m.start()] + body[m.end():]).strip()


NON_ASCII = re.compile(r"[^\x00-\x7f]")


def split_bilingual(title):
    """"Before you start / Baslamadan once" -> (English, Turkish).

    Only splits when the right-hand side actually looks Turkish, so an
    English heading that happens to contain a slash is left alone.
    """
    if " / " not in title:
        return title, ""
    left, right = title.rsplit(" / ", 1)
    if (NON_ASCII.search(right) and not NON_ASCII.search(left)) or right.strip() == "Standartlar ve birimler":
        return left.strip(), right.strip()
    return title, ""


def number_sections(body, week, sections):
    """Number h2 headings, give them ids, and record them for the contents card."""
    def repl(m):
        title = m.group(1)
        # the notebook already numbers its sections ("2. Concepts ..."); drop it
        # so the page does not print two numbers for one heading
        title = re.sub(r"^\s*\d+\.\s+", "", title)
        en, tr = split_bilingual(title)
        plain = re.sub(r"<[^>]+>", "", en).strip()
        slug = re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")[:48] or f"s{len(sections) + 1}"
        num = f"{week}.{len(sections) + 1}"
        sections.append((num, plain, slug))
        sub = f'<em lang="tr">{tr}</em>' if tr else ""
        return f'<h2 id="{slug}"><span class="num">{num}</span>{en}{sub}</h2>'
    return re.sub(r"<h2>(.*?)</h2>", repl, body, flags=re.S)


def tidy_subheadings(body):
    """Give h3 topics the same bilingual treatment, without numbering them."""
    def repl(m):
        en, tr = split_bilingual(m.group(2))
        sub = f'<em lang="tr">{tr}</em>' if tr else ""
        return f"<{m.group(1)}>{en}{sub}</{m.group(1)}>"
    return re.sub(r"<(h3|h4)>(.*?)</\1>", repl, body, flags=re.S)


def figure_block(fig, week, index):
    num = f"{week}.{index}"
    tr = ""
    if fig.get("caption_tr"):
        tr = ('<aside class="mn fig-ref"><span class="mn-label">'
              f'ŞEKİL {num}</span><p>{fig["caption_tr"]}</p></aside>')
    return (f'{tr}<figure class="figure" id="{fig["slug"]}">{fig["svg"]}'
            f'<figcaption><span class="fig-num">Figure {num}</span>{fig["caption"]}'
            "</figcaption></figure>")


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
<div class="callout grey">
  <span class="callout-label">Interactive in the notebook</span>
  <p><strong>{html.escape(title)}</strong> is a live demonstration with sliders. It needs a running
  Python kernel. Use the notebook in the practice section, run its setup cell once,
  then run this demonstration.</p>
</div>"""


def notebook_body(week, nb):
    """Walk the notebook and emit a typeset body plus the page's structure."""
    anims = ANIMS.get(week, [])
    figs = list(FIGLIB.for_week(week))
    used_anims, used_figs = set(), set()
    pre = f"w{week:02d}"
    out = []
    section = "front"
    skipped = {"code": 0, "setup": 0, "problems": 0, "contents": 0}
    sections, equations = [], []
    eq_counter, fig_counter, wex_counter, chk_counter = [0], [0], [0], [0]

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

        raw_head = ""
        m = re.match(r"^#{1,6}\s+(.*)$", src.strip().split("\n")[0])
        if m:
            raw_head = m.group(1)

        head_probe = raw_head.lower()
        in_example = (
            (re.match(r"^(?:\W*\s*)?worked example", head_probe)
             or re.match(r"^example \d", head_probe))
            and not is_examples_header(head_probe)
        ) or "checkpoint" in head_probe

        body = md_to_html(src, heading_shift=0)
        body = to_key_equations(body, week, eq_counter, equations, allow=not in_example)
        body = to_cautions(body)
        body = to_margin_notes(body)

        head_l = raw_head.lower()

        # --- interactive demonstrations -------------------------------------
        if "nteractive" in head_l:
            cfg = None
            for needle, candidate in anims:
                if needle.lower() in head_l and candidate["name"] not in used_anims:
                    cfg = candidate
                    break
            if cfg:
                used_anims.add(cfg["name"])
                out.append(anim_block(cfg, body))
            else:
                out.append(colab_pointer(raw_head, body, week))

        # --- worked examples -------------------------------------------------
        elif (re.match(r"^(?:\W*\s*)?worked example", head_l)
              or re.match(r"^example \d", head_l)) and not is_examples_header(head_l):
            title, rest = split_heading(body)
            if title is None:
                out.append(body)
            else:
                wex_counter[0] += 1
                num = f"{week}.{wex_counter[0]}"
                title = re.sub(r"^\s*(?:Worked [Ee]xample\s*\d*\s*[:—-]?\s*)", "", title).strip()
                title = title or "Worked example"
                out.append(f'<section class="wex" id="wex-{week}-{wex_counter[0]}">'
                           f'<div class="wex-head"><span class="wex-num">Worked example {num}</span>'
                           f"<h3>{title}</h3></div>"
                           f'<div class="wex-body">{rest}</div></section>')

        # --- checkpoints -----------------------------------------------------
        elif "checkpoint" in head_l:
            title, rest = split_heading(body)
            chk_counter[0] += 1
            label = f"Check yourself {week}.{chk_counter[0]}"
            clean = re.sub(r"^[^A-Za-z]*", "", title or "").strip()
            clean = re.sub(r"^Checkpoint\s*\d+\s*of\s*\d+\s*[—-]?\s*", "", clean).strip()
            out.append(f'<div class="checkpoint"><span class="checkpoint-label">{label}'
                       f"{' · ' + clean if clean else ''}</span>{rest}</div>")

        # --- learning objectives --------------------------------------------
        elif "learning objectives" in head_l:
            body = body.replace("<ol>", '<ol class="objectives">', 1)
            out.append(body)

        # --- the lesson plan -------------------------------------------------
        elif src.lstrip().startswith("## Lesson plan"):
            title, rest = split_heading(body)
            out.append('<div class="callout blue"><span class="callout-label">'
                       f"How the three hours run</span>{rest}</div>")

        else:
            out.append(body)

        # --- figures that follow this block ----------------------------------
        for i, fig in enumerate(figs):
            if fig["slug"] in used_figs:
                continue
            if fig["after"].lower() in head_l:
                used_figs.add(fig["slug"])
                fig_counter[0] += 1
                out.append(figure_block(fig, week, fig_counter[0]))

    body = "\n\n".join(out)
    body = number_sections(body, week, sections)
    body = tidy_subheadings(body)

    missing_anim = [c["name"] for _, c in anims if c["name"] not in used_anims]
    missing_fig = [f["slug"] for f in figs if f["slug"] not in used_figs]
    meta = {"sections": sections, "equations": equations,
            "figures": fig_counter[0], "examples": wex_counter[0]}
    return body, skipped, missing_anim, missing_fig, meta


# ---------------------------------------------------------------- page

def head_html(title, desc, week, has_anim):
    animcss = '<link rel="stylesheet" href="../assets/anim.css">\n' if has_anim else ""
    scripts = ""
    if has_anim:
        scripts = ('<script defer src="../assets/anim.js?v=20260921"></script>\n'
                   f'<script defer src="../assets/anim-w{week}.js?v=20260921"></script>\n')
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
    if (!t) t = "light";
    document.documentElement.setAttribute("data-theme", t);
    var l = localStorage.getItem("phy101_lang");
    if (l) document.documentElement.setAttribute("data-lang", l);
  }} catch (e) {{}}
}})();
</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ctext y=%2724%27 x=%273%27 font-size=%2722%27 font-family=%27monospace%27 font-weight=%27700%27 fill=%27%23e65100%27%3EF%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css"><link rel="stylesheet" href="../../../assets/learning-path.css?v=1"><link rel="stylesheet" href="../assets/reading-simple.css?v=2"><link rel="stylesheet" href="../../../assets/course-navigation.css?v=2"><script defer src="../../../assets/course-navigation.js?v=1"></script><script defer src="../../../assets/learning-path.js?v=1"></script>
{animcss}<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/katex.min.css" integrity="{SRI_CSS}" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/katex.min.js" integrity="{SRI_JS}" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@{KATEX}/dist/contrib/auto-render.min.js" integrity="{SRI_AUTO}" crossorigin="anonymous"></script>
{scripts}<script defer src="../assets/app.js?v=2"></script>
</head>
<body>
<a class="skip" href="#main">Skip to the notes</a>
<header class="site-header">
  <a class="brand" href="../web/PHY101_Course_Dashboard.html">PHY101 / course home</a>
  <nav class="header-nav" aria-label="Course pages">
    <details class="path-menu"><summary>Settings</summary><div>
    <button class="hlink" data-lang-toggle type="button" aria-pressed="false" title="Hide the Turkish notes">EN + TR</button>
    <button class="hlink" data-theme-toggle type="button">&#9788; Light</button></div></details>
  </nav>
</header>
<main class="wrap" id="main">
<article class="col">
"""


FOOT = f"""</article>
</main>
<footer class="site-footer">
  <span>{SITE} &middot; Dr. Arif Solmaz &middot; &#304;ST&#220;N</span>

</footer>
</body>
</html>
"""

MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def month_day(iso):
    _, m, d = (int(x) for x in iso.split("-"))
    return f"{d} {MONTHS[m - 1]}"


def published_weeks():
    """Weeks that currently have a generated page on disk."""
    out = set()
    for d in ROOT.glob("w*"):
        m = re.match(r"^w(\d+)$", d.name)
        if m and (d / "index.html").is_file():
            out.add(int(m.group(1)))
    return out


def contents_card(sections):
    if len(sections) < 3:
        return ""
    items = "".join(
        f'<li><span class="num">{num}</span><a href="#{slug}">{html.escape(title)}</a></li>'
        for num, title, slug in sections)
    return ('<nav class="toc" aria-label="On this page">'
            '<span class="toc-label">On this page</span>'
            f"<ol>{items}</ol></nav>")


def summary_card(week, equations):
    if not equations:
        return ""
    items = "".join(
        f'<div class="summary-item"><span class="tag">Equation {num}</span>{tex}</div>'
        for num, tex in equations)
    return (f'<section class="summary"><h2 id="key-equations">'
            '<span class="num">∑</span>Key equations of this week</h2>'
            '<p>Every equation the notebook boxed, in the order it appeared. If you can say what each '
            'symbol is and when the equation does <em>not</em> apply, you are ready for the problem '
            'set.</p>'
            '<aside class="mn" lang="tr"><span class="mn-label">TÜRKÇE</span><p>Bu haftanın '
            'çerçeveli denklemleri. Her sembolün ne olduğunu ve denklemin ne zaman '
            'geçerli <em>olmadığını</em> söyleyebiliyorsan problem setine '
            'hazırsın.</p></aside>'
            f'<div class="summary-grid">{items}</div></section>')



# ---------------------------------------------------------------- stages
#
# A week's notes run to 9,000 words when everything is on one scroll. The
# notebook's own section order gives four natural stages, and the page shows
# one at a time behind a stage bar (all four print). Weeks without the full
# structure (the review and midterm weeks) keep a single scroll.

STAGES = [
    ("prepare", "Prepare", "plan, objectives, pre-check"),
    ("learn", "Learn", "concepts, animations and worked examples"),
    ("practise", "Practise", "practice examples and the problem set"),
    ("check", "Check", "exit check and key equations"),
]
STAGE_OF = {
    "before-you-start": "prepare",
    "concepts-demonstrations-and-worked-examples": "learn",
    "more-worked-examples-from-the-question-bank": "practise",  # old heading compatibility
    "engineering-practice-examples": "practise",
    "bridging-problem-and-variation-problems": "practise",
    "optional-extension": "practise",
    "exit-check": "check",
    "solutions-and-next-week": "check",
}


def split_by_h2(body):
    """[(slug, html)] — the first entry has slug '' when text precedes the first h2."""
    parts, last, slug = [], 0, ""
    for m in re.finditer(r'<h2 id="([^"]+)">', body):
        if m.start() > last or parts or slug:
            parts.append((slug, body[last:m.start()]))
        slug, last = m.group(1), m.start()
    parts.append((slug, body[last:]))
    return [(sl, h) for sl, h in parts if h.strip()]


WEX_RE = re.compile(r'<section class="wex" id="([^"]+)">(<div class="wex-head">.*?</div>)'
                    r'<div class="wex-body">(.*?)</div></section>', re.S)


def fold_examples(chunk):
    """Practice examples: keep the problem statement visible, fold the worked route."""
    def repl(m):
        ident, head, rest = m.group(1), m.group(2), m.group(3)
        # A question can contain several paragraphs, lists and display equations.
        # Fold at the authored reasoning boundary, never at its first paragraph.
        boundary = re.search(r'<p>\s*<strong>(?:IDENTIFY|Predict|Symbolic|Solution|Draw|SET UP)', rest)
        if not boundary:
            return m.group(0)
        problem, route = rest[:boundary.start()], rest[boundary.start():].strip()
        if not route:
            return m.group(0)
        return (f'<section class="wex wex-fold" id="{ident}">{head}<div class="wex-body">{problem}'
                f'<details class="wex-more"><summary>Show the worked route '
                f'<span lang="tr">/ Çözüm yolunu göster</span></summary>{route}</details></div></section>')
    return WEX_RE.sub(repl, chunk)


def topic_list(chunk):
    """Give the topic headings of the Learn stage ids and list them under the h2."""
    seen, items = set(), []
    def repl(m):
        title = re.sub(r"<em lang=\"tr\">.*?</em>", "", m.group(1), flags=re.S)
        title = re.sub(r"<[^>]+>", "", title).strip()
        base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:40] or "topic"
        slug, k = "t-" + base, 2
        while slug in seen:
            slug, k = f"t-{base}-{k}", k + 1
        seen.add(slug)
        items.append((slug, title))
        return f'<h3 id="{slug}">{m.group(1)}</h3>'
    # only top-level topics: h3s inside worked-example boxes carry no id
    out, last = [], 0
    for box in re.finditer(r'<section class="wex.*?</section>', chunk, re.S):
        out.append(re.sub(r"<h3>(.*?)</h3>", repl, chunk[last:box.start()], flags=re.S))
        out.append(box.group(0)); last = box.end()
    out.append(re.sub(r"<h3>(.*?)</h3>", repl, chunk[last:], flags=re.S))
    chunk = "".join(out)
    items = [(sl, t) for sl, t in items if t.lower() not in ("worked examples",)]
    if len(items) < 3:
        return chunk
    nav = ('<details class="path-reference"><summary>Find a topic in this lesson</summary><nav class="topics" aria-label="Topics in this stage"><ol>'
           + "".join(f'<li><a href="#{sl}">{html.escape(t)}</a></li>' for sl, t in items) + "</ol></nav></details>")
    return re.sub(r"(</h2>)", r"\1" + nav.replace("\\", "\\\\"), chunk, count=1)


def stage_layout(body, intro, lab_box, summary, problems):
    """Return a continuous lesson, preserving existing section bookmarks."""
    parts = split_by_h2(body)
    slugs = [sl for sl, _ in parts]
    if "before-you-start" not in slugs or "concepts-demonstrations-and-worked-examples" not in slugs:
        return None
    buckets = {k: [] for k, _, _ in STAGES}
    buckets["prepare"].append(intro)
    if lab_box:
        buckets["prepare"].append(lab_box)
    for sl, h in parts:
        stage = "prepare" if sl == "" else STAGE_OF.get(sl, "learn")
        if stage in ("learn", "practise"):
            h = fold_examples(h)
        if sl == "optional-extension":
            h = '<details class="path-reference"><summary>Optional extension notebooks</summary><div>' + h + '</div></details>'
        if sl == "solutions-and-next-week":
            h = re.sub(r'<p><a href="[^"]+">Course page / Ders sayfası</a></p>', '', h)
            h = '<details class="path-reference"><summary>Solutions &amp; next week</summary><div>' + h + '</div></details>'
        buckets[stage].append(h)
    buckets["prepare"] = ['<p class="prepare-start">Before you begin, use the preparation below to recall the ideas you need. Then continue to the worked lesson.</p><details class="path-reference"><summary>Preparation, learning goals &amp; laboratory details</summary><div>' + "\n".join(buckets["prepare"]) + '</div></details>']
    buckets["practise"].append(problems)
    buckets["check"].append(summary)

    # Preserve deep links, but read all stages without tabs or route buttons.
    return '\n'.join(f'<section class="stage lesson-part" id="stage-{key}">' + '\n\n'.join(buckets[key]) + '</section>' for key, name, desc in STAGES)


def week_page(wk, nb, known=None):
    num = wk["week"]
    body, skipped, missing_anim, missing_fig, meta = notebook_body(num, nb)
    has_anim = bool(ANIMS.get(num)) and not missing_anim
    lab = wk.get("lab")

    chips = ['<span class="chip gold">3-hour session</span>']
    if wk["session_date"]:
        chips.append(f'<span class="chip">class {month_day(wk["session_date"])}</span>')
    if lab:
        chips.append(f'<span class="chip green">lab: {html.escape(lab["title_tr"])}</span>')
    if meta["examples"]:
        chips.append(f'<span class="chip">{meta["examples"]} worked examples</span>')
    if meta["figures"]:
        chips.append(f'<span class="chip">{meta["figures"]} figures</span>')
    chips.append('<span class="chip blue">departmental schedule &middot; common exams</span>')

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

    intro = f"""<div class="callout orange">
  <span class="callout-label">How to use this page</span>
  <p>These notes are generated from the <strong>Week {num:02d} notebook</strong>, so they always say the
  same thing it does. Read here; do the problems in the notebook, where every problem shows its answer
  and the full worked solution opens later.</p>
  <aside class="mn" lang="tr"><span class="mn-label">T&Uuml;RK&Ccedil;E</span><p>Bu sayfa Week {num:02d} not
  defterinden &uuml;retilir, yani her zaman onunla ayn&#305; &#351;eyi s&ouml;yler. Konuyu burada oku;
  problemleri not defterinde &ccedil;&ouml;z.</p></aside>
</div>"""

    lab_box = ""
    if lab:
        brief = (f'<a class="btn secondary" href="{COLAB}/{lab["brief"]}">Open the lab brief</a>'
                 if lab.get("brief") else "")
        covers = ""
        if lab.get("covers_week") and lab["covers_week"] != num:
            covers = f' It measures the physics of <strong>Week {lab["covers_week"]:02d}</strong>.'
        lab_box = f"""<div class="callout green">
  <span class="callout-label">This week in the laboratory</span>
  <p><strong>{html.escape(lab["title_tr"])} / {html.escape(lab["title_en"])}</strong> &mdash;
  {html.escape(lab["focus"])}.{covers}</p>
  <p>Do the prediction in &sect;1 of the brief <strong>before</strong> you arrive; you will be asked for
  your predicted number at the bench. Laboratory analysis technique is not examined in the common
  midterm or final &mdash; the physics being measured is.</p>
  <aside class="mn" lang="tr"><span class="mn-label">T&Uuml;RK&Ccedil;E</span><p>Deneye gelmeden &ouml;nce
  brifingin &sect;1'indeki tahmini yap.</p></aside>
  <div class="btn-row">{brief}
    <a class="btn secondary" href="{COLAB}/labs/Lab_00_Uncertainty_Toolkit.ipynb">Uncertainty toolkit</a>
  </div>
</div>"""

    problems = f"""<h2 id="problem-set"><span class="num">{num}.P</span>Problem set</h2>
<div class="callout grey">
  <p>The problem set for this week &mdash; core (L1), intermediate (L2) and challenge (L3) &mdash; is in
  the notebook, not on this page. Each problem shows its <strong>answer</strong> so you can check
  yourself; the full worked solution opens on the date printed under it.</p>
  <p><strong>Write your own attempt first:</strong> symbolic answer, one limiting-case check, then
  numbers. Opening the answer first turns a problem into a worked example, and worked examples do not
  build the skill the exam tests.</p>
  <aside class="mn" lang="tr"><span class="mn-label">T&Uuml;RK&Ccedil;E</span><p>Problem seti bu sayfada
  de&#287;il, not defterinde. &Ouml;nce kendi denemeni yaz &mdash; sembolik sonu&ccedil;,
  s&#305;n&#305;r kontrol&uuml;, sonra say&#305;lar.</p></aside>
  <div class="btn-row">
    <a class="btn" href="{COLAB}/notebooks/Week_{num:02d}.ipynb">Problem set in Colab</a>
  </div>
</div>"""

    hero = f"""<div class="hero">
  <div class="eyebrow">Week {num:02d} &middot; {month_day(wk['start'])}&ndash;{month_day(wk['end'])} 2026</div>
  <h1>{html.escape(wk['title_en'])}<em lang="tr">{html.escape(wk['title_tr'])}</em></h1>
  <p class="lede">{html.escape(wk['scope'])}.</p>

</div>"""
    summary = summary_card(num, meta["equations"])
    staged = stage_layout(body, intro, lab_box, summary, problems)
    if staged:
        middle = [staged]
    else:
        middle = [intro, lab_box, contents_card(meta["sections"]), body, summary, problems]

    chapter_resource = '<a href="https://drive.google.com/file/d/1v5tJxyEvDnrLoW1X_rfTq5RwYD8N0cbJ/view?usp=share_link">CH-1</a>' if num == 1 else ""
    page = "\n".join([
        head_html(f"Week {num:02d}: {wk['title_en']} — {SITE}", wk["scope"], num, has_anim),
        hero,
        *middle,
        f'<details class="path-resources" id="lesson-resources"><summary>Downloads &amp; course resources</summary><div><a href="../notebooks/Week_{num:02d}.ipynb" download>Download this notebook</a>{chapter_resource}<a href="../web/PHY101_Course_Dashboard.html#course-info">Course resources</a></div></details>',
        FOOT,
    ])
    return page, skipped, missing_anim, missing_fig, meta


def main(argv):
    calendar = json.loads((ROOT / "calendar.json").read_text(encoding="utf-8"))
    if argv and argv[0] == "all":
        wanted = [w["week"] for w in calendar["weeks"]]
    elif argv:
        wanted = [int(a) for a in argv]
    else:
        wanted = sorted(ANIMS)

    known = published_weeks() | set(wanted)
    failures = []
    for wk in calendar["weeks"]:
        if wk["week"] not in wanted:
            continue
        nb = json.loads((ROOT / wk["notebook"]).read_text(encoding="utf-8"))
        page, skipped, missing_anim, missing_fig, meta = week_page(wk, nb, known)
        target = ROOT / f"w{wk['week']}" / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")

        notes = []
        if missing_anim:
            notes.append("animation host never placed: " + ", ".join(missing_anim))
            failures.append(wk["week"])
        if missing_fig:
            notes.append("figure never placed: " + ", ".join(missing_fig))
            failures.append(wk["week"])
        print(f"  wrote {target.relative_to(ROOT)}  ({len(page):,} bytes; "
              f"{len(meta['sections'])} sections, {meta['examples']} examples, "
              f"{len(meta['equations'])} key equations, {meta['figures']} figures; "
              f"skipped {skipped['code']} code, {skipped['problems']} problem cells)"
              + ("   !! " + "; ".join(notes) if notes else ""))

    built = sorted(int(d.name[1:]) for d in ROOT.glob("w*") if (d / "index.html").is_file())
    manifest = ROOT / "web" / "phy101-notes.js"
    manifest.write_text(
        "// Generated by tools/build_site.py - the weeks that have a notes page.\n"
        f"window.PHY101_NOTES = {json.dumps(built)};\n", encoding="utf-8")
    print(f"  wrote {manifest.relative_to(ROOT)}  (weeks {built})")

    if failures:
        print("\nFAILED: an ANIMS or FIGURES anchor matched no cell "
              "(did a notebook heading change?).", file=sys.stderr)
        return 1
    print(f"\nOK - {len(wanted)} week page(s) built from calendar.json and the notebooks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
