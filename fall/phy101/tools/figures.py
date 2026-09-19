"""
PHY101 figure library.

Hand-drawn inline SVG for the week notes. Inline rather than image files so the
figures scale, print, and follow the light/dark theme: every colour is a CSS
custom property from assets/site.css, so nothing needs redrawing per theme.

Each entry:
    after      - substring of the heading of the notebook cell it follows
    slug       - stable id, used for the anchor (fig-w2-signs)
    caption    - English caption, shown under the figure
    caption_tr - Turkish caption, shown in the margin
    svg        - the drawing, with a viewBox and no fixed width

Figures are numbered per week by build_site.py (Figure 2.1, 2.2, ...), so the
order here is the order they appear. A figure earns its place only if it shows
something the prose cannot: a sign convention, a geometric relation, a scaling.

RULES LEARNED THE HARD WAY
1. Arrowheads use one marker per colour. `fill="context-stroke"` looks right in
   the spec and renders BLACK in Chromium, which silently ruined every arrow in
   the first version of this file.
2. Angle arcs, tangents and points on curves are computed, never eyeballed. An
   arc whose end does not sit exactly on the vector reads as a tick crossing it;
   a "tangent" that is really a chord is worse than no tangent at all.
3. One scale for both axes whenever a length is the point. A 3-4-5 triangle
   drawn at 60 px/km across and 35 px/km up is not a 3-4-5 triangle.
4. Keep text inside the viewBox. Check the right edge against label length.
5. Run tools/figcheck.py and LOOK at the proof sheet at full size before
   believing any of this.
"""

HEAD_COLOURS = ("accent", "blue", "green", "muted", "ink")


def _markers(pfx, colours=HEAD_COLOURS):
    """One arrowhead marker per colour.

    markerUnits defaults to strokeWidth, so a 5.5-wide marker on a 2.4 stroke
    gives a head about 13 px across.
    """
    out = ["<defs>"]
    for c in colours:
        out.append(
            f'<marker id="{pfx}-{c}" viewBox="0 0 10 10" refX="8.6" refY="5" '
            f'markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">'
            f'<path d="M 0 1 L 10 5 L 0 9 z" class="fig-head-{c}"/></marker>'
        )
    out.append("</defs>")
    return "".join(out)


FIGURES = {

    # ================================================================== WEEK 1
    1: [
        {
            "after": "Scalars vs. Vectors",
            "slug": "fig-w1-components",
            "caption": "A vector and its components. The components are the two sides of a right "
                       "triangle whose hypotenuse is the vector, so neither component can ever be "
                       "longer than the vector itself.",
            "caption_tr": "Bir vektör ve bileşenleri. Bileşenler, hipotenüsü vektör olan bir dik "
                          "üçgenin iki kenarıdır; bu yüzden hiçbir bileşen vektörün kendisinden "
                          "uzun olamaz.",
            # O=(50,215) tip=(300,85); arc r=50 ends at (94.36,191.93) — computed, on the vector
            "svg": """<svg viewBox="0 0 420 260" role="img" aria-labelledby="t-comp d-comp">
<title id="t-comp">A vector resolved into horizontal and vertical components</title>
<desc id="d-comp">A vector at 27 degrees above the horizontal axis. A blue arrow along the x-axis
is its horizontal component V cosine theta; a green arrow up the y-axis is its vertical component
V sine theta. Dashed lines complete the rectangle to the vector's tip.</desc>
""" + _markers("m1a") + """
<line x1="50" y1="215" x2="400" y2="215" class="fig-axis"/>
<line x1="50" y1="215" x2="50" y2="25" class="fig-axis"/>
<text x="396" y="234" class="fig-lab" text-anchor="end">x</text>
<text x="36" y="32" class="fig-lab">y</text>

<!-- construction lines to the tip -->
<line x1="300" y1="85" x2="300" y2="215" class="fig-thin-dash"/>
<line x1="300" y1="85" x2="50" y2="85" class="fig-thin-dash"/>

<!-- the two components, drawn on the axes -->
<line x1="50" y1="215" x2="300" y2="215" class="fig-vec fig-blue" marker-end="url(#m1a-blue)"/>
<line x1="50" y1="215" x2="50" y2="85" class="fig-vec fig-green" marker-end="url(#m1a-green)"/>

<!-- the vector -->
<line x1="50" y1="215" x2="300" y2="85" class="fig-vec fig-accent" marker-end="url(#m1a-accent)"/>

<!-- right angle where the construction line meets the x-axis -->
<path d="M 300 201 L 314 201 L 314 215" class="fig-thin"/>

<!-- angle arc: ends exactly on the vector -->
<path d="M 100 215 A 50 50 0 0 0 94.36 191.93" class="fig-thin fig-accent"/>
<text x="108" y="207" class="fig-lab fig-accent">θ</text>

<text x="175" y="236" class="fig-lab fig-blue" text-anchor="middle">V cos θ</text>
<text x="60" y="150" class="fig-lab fig-green">V sin θ</text>
<text x="168" y="136" class="fig-lab fig-accent" font-size="15">V</text>
</svg>""",
        },
        {
            "after": "Vector Addition",
            "slug": "fig-w1-tiptotail",
            "caption": "Walking 3 km east, then 4 km north. Both axes use the same scale, so the "
                       "closing side really is 5 km long: the distance walked is 7 km, but the "
                       "displacement is 5 km. Components add; magnitudes do not.",
            "caption_tr": "3 km doğu, sonra 4 km kuzey. İki eksen aynı ölçekte, bu yüzden kapanan "
                          "kenar gerçekten 5 km uzunluğunda: yürünen yol 7 km, yer değiştirme 5 km.",
            # uniform 45 px/km: 3 km = 135 px, 4 km = 180 px, hypotenuse = 225 px = 5.00 km
            "svg": """<svg viewBox="0 0 420 270" role="img" aria-labelledby="t-tt d-tt">
<title id="t-tt">Two displacements added tip to tail</title>
<desc id="d-tt">A 3 kilometre eastward arrow followed by a 4 kilometre northward arrow, with a
5 kilometre resultant arrow closing the triangle from start to finish. Both axes are drawn to the
same scale.</desc>
""" + _markers("m1b") + """
<line x1="40" y1="235" x2="340" y2="235" class="fig-axis"/>
<line x1="60" y1="250" x2="60" y2="30" class="fig-axis"/>
<text x="336" y="254" class="fig-lab" text-anchor="end">east (km)</text>
<text x="48" y="24" class="fig-lab">north (km)</text>

<!-- one tick per kilometre, same spacing on both axes -->
<g class="fig-thin">
  <line x1="105" y1="231" x2="105" y2="239"/><line x1="150" y1="231" x2="150" y2="239"/>
  <line x1="195" y1="231" x2="195" y2="239"/><line x1="240" y1="231" x2="240" y2="239"/>
  <line x1="56" y1="190" x2="64" y2="190"/><line x1="56" y1="145" x2="64" y2="145"/>
  <line x1="56" y1="100" x2="64" y2="100"/><line x1="56" y1="55" x2="64" y2="55"/>
</g>

<line x1="60" y1="235" x2="195" y2="235" class="fig-vec fig-blue" marker-end="url(#m1b-blue)"/>
<line x1="195" y1="235" x2="195" y2="55" class="fig-vec fig-green" marker-end="url(#m1b-green)"/>
<line x1="60" y1="235" x2="195" y2="55" class="fig-vec fig-accent" marker-end="url(#m1b-accent)"/>
<path d="M 195 221 L 209 221 L 209 235" class="fig-thin"/>

<text x="127" y="256" class="fig-lab fig-blue" text-anchor="middle">3 km</text>
<text x="205" y="150" class="fig-lab fig-green">4 km</text>
<text x="115.5" y="136.0" class="fig-lab fig-accent" font-size="14" text-anchor="middle" transform="rotate(-53.13 115.5 136.0)">5 km</text>
<circle cx="60" cy="235" r="4" class="fig-dot"/>
</svg>""",
        },
        {
            "after": "Dot Product",
            "slug": "fig-w1-projection",
            "caption": "The dot product measures how much of one vector lies along another. The "
                       "green dimension line is the projection of A on B, equal to A cos θ. The "
                       "perpendicular part of A contributes nothing to it.",
            "caption_tr": "Skaler çarpım, bir vektörün ne kadarının diğeri boyunca uzandığını "
                          "ölçer. Yeşil ölçü çizgisi A'nın B üzerindeki izdüşümüdür: A cos θ. "
                          "A'nın dik bileşeni buna hiç katkı yapmaz.",
            # O=(55,160) A tip=(255,55); arc r=44 ends at (93.96,139.55) — computed, on the vector
            "svg": """<svg viewBox="0 0 420 240" role="img" aria-labelledby="t-pr d-pr">
<title id="t-pr">Projection of one vector onto another</title>
<desc id="d-pr">Vector A at 28 degrees to the horizontal vector B. A dashed perpendicular drops
from the tip of A onto B, and a green dimension line below the axis marks the projection A cosine
theta from the common origin to the foot of that perpendicular.</desc>
""" + _markers("m1c") + """
<line x1="55" y1="160" x2="380" y2="160" class="fig-vec fig-blue" marker-end="url(#m1c-blue)"/>
<text x="372" y="182" class="fig-lab fig-blue" text-anchor="end">B</text>

<line x1="55" y1="160" x2="255" y2="55" class="fig-vec fig-accent" marker-end="url(#m1c-accent)"/>
<text x="140" y="96" class="fig-lab fig-accent" font-size="15">A</text>

<line x1="255" y1="55" x2="255" y2="160" class="fig-thin-dash"/>
<path d="M 241 160 L 241 146 L 255 146" class="fig-thin"/>

<!-- projection as a dimension line below the axis, so it never fights with B -->
<g class="fig-dim">
  <line x1="55" y1="190" x2="255" y2="190"/>
  <line x1="55" y1="184" x2="55" y2="196"/>
  <line x1="255" y1="184" x2="255" y2="196"/>
</g>
<text x="155" y="212" class="fig-lab fig-green" text-anchor="middle">A cos θ</text>

<path d="M 99 160 A 44 44 0 0 0 93.96 139.55" class="fig-thin fig-accent"/>
<text x="106" y="152" class="fig-lab fig-accent">θ</text>
<text x="266" y="104" class="fig-note">A sin θ adds nothing</text>
</svg>""",
        },
    ],

    # ================================================================== WEEK 2
    2: [
        {
            "after": "The Kinematic Equations",
            "slug": "fig-w2-slope-area",
            "caption": "The two readings that replace memorised formulas. On the position graph "
                       "the slope of the tangent is the velocity; on the velocity graph the shaded "
                       "area is the displacement. Both hold whether or not the acceleration is "
                       "constant.",
            "caption_tr": "Ezberlenen formüllerin yerini alan iki okuma: konum grafiğinde teğetin "
                          "eğimi hızdır, hız grafiğinde gölgeli alan yer değiştirmedir. İkisi de "
                          "ivme sabit olmasa bile geçerlidir.",
            # Left: quadratic Bezier P0(40,172) C(130,164) P2(196,48).
            # Tangent taken at t=0.55: point (131.74,130.53), direction (0.7515,-0.6595),
            # drawn +/-52 px so it stays inside the panel. The dot sits ON that point.
            "svg": """<svg viewBox="0 0 440 210" role="img" aria-labelledby="t-sa d-sa">
<title id="t-sa">Slope of a position graph and area under a velocity graph</title>
<desc id="d-sa">Left: a curved position-time graph with a straight tangent touching it at one
point, labelled slope equals v. Right: a rising velocity-time graph with the region between the
line and the time axis shaded, labelled area equals delta x.</desc>
<g>
  <line x1="40" y1="175" x2="200" y2="175" class="fig-axis"/>
  <line x1="40" y1="175" x2="40" y2="30" class="fig-axis"/>
  <text x="198" y="194" class="fig-lab" text-anchor="end">t</text>
  <text x="28" y="38" class="fig-lab">x</text>
  <path d="M 40 172 Q 130 164 196 48" class="fig-curve fig-blue"/>
  <line x1="92.66" y1="164.83" x2="170.82" y2="96.23" class="fig-dash fig-accent"/>
  <circle cx="131.74" cy="130.53" r="4.5" class="fig-dot fig-accent"/>
  <text x="104" y="86" class="fig-lab fig-accent">slope = v</text>
</g>
<g transform="translate(232,0)">
  <line x1="40" y1="175" x2="200" y2="175" class="fig-axis"/>
  <line x1="40" y1="175" x2="40" y2="30" class="fig-axis"/>
  <text x="198" y="194" class="fig-lab" text-anchor="end">t</text>
  <text x="28" y="38" class="fig-lab">v</text>
  <path d="M 40 152 L 150 75.85 L 150 175 L 40 175 Z" class="fig-fill"/>
  <path d="M 40 152 L 196 44" class="fig-curve fig-green"/>
  <text x="95" y="150" class="fig-lab fig-green" text-anchor="middle">area = Δx</text>
</g>
</svg>""",
        },
        {
            "after": "Free Fall",
            "slug": "fig-w2-signs",
            "caption": "A ball thrown straight up, at three moments. The velocity arrow shrinks, "
                       "vanishes and then reverses — but the acceleration arrow is the same in all "
                       "three. At the top the velocity is zero and the acceleration is still "
                       "9.81 m/s² downward.",
            "caption_tr": "Yukarı atılan bir top, üç anda. Hız oku kısalır, kaybolur, sonra yön "
                          "değiştirir; ama ivme oku üçünde de aynıdır. Tepede hız sıfırdır, ivme "
                          "hâlâ aşağı doğru 9.81 m/s²'dir.",
            "svg": """<svg viewBox="0 0 440 240" role="img" aria-labelledby="t-sg d-sg">
<title id="t-sg">Velocity and acceleration of a ball thrown straight up</title>
<desc id="d-sg">Three snapshots of a ball: rising with an upward velocity arrow, at the top of its
flight with no velocity arrow, and falling with a downward velocity arrow. In all three the
acceleration arrow points down and has the same length.</desc>
""" + _markers("m2b") + """
<text x="220" y="26" class="fig-lab" text-anchor="middle">a is the same arrow in all three</text>
<line x1="30" y1="150" x2="30" y2="92" class="fig-vec fig-muted" marker-end="url(#m2b-muted)"/>
<text x="40" y="100" class="fig-note">+ up</text>
<line x1="22" y1="210" x2="420" y2="210" class="fig-axis"/>

<g transform="translate(130,0)">
  <circle cx="0" cy="132" r="11" class="fig-ball"/>
  <line x1="0" y1="119" x2="0" y2="72" class="fig-vec fig-green" marker-end="url(#m2b-green)"/>
  <text x="10" y="80" class="fig-lab fig-green">v</text>
  <line x1="-36" y1="118" x2="-36" y2="166" class="fig-vec fig-accent" marker-end="url(#m2b-accent)"/>
  <text x="-52" y="146" class="fig-lab fig-accent" text-anchor="end">a</text>
  <text x="0" y="230" class="fig-note" text-anchor="middle">rising</text>
</g>
<g transform="translate(250,0)">
  <circle cx="0" cy="66" r="11" class="fig-ball"/>
  <text x="16" y="70" class="fig-lab fig-green">v = 0</text>
  <line x1="-36" y1="52" x2="-36" y2="100" class="fig-vec fig-accent" marker-end="url(#m2b-accent)"/>
  <text x="-52" y="80" class="fig-lab fig-accent" text-anchor="end">a</text>
  <text x="0" y="230" class="fig-note" text-anchor="middle">at the top</text>
</g>
<g transform="translate(370,0)">
  <circle cx="0" cy="132" r="11" class="fig-ball"/>
  <line x1="0" y1="145" x2="0" y2="192" class="fig-vec fig-green" marker-end="url(#m2b-green)"/>
  <text x="10" y="186" class="fig-lab fig-green">v</text>
  <line x1="-36" y1="118" x2="-36" y2="166" class="fig-vec fig-accent" marker-end="url(#m2b-accent)"/>
  <text x="-52" y="146" class="fig-lab fig-accent" text-anchor="end">a</text>
  <text x="0" y="230" class="fig-note" text-anchor="middle">falling</text>
</g>
</svg>""",
        },
        {
            "after": "Braking Distance",
            "slug": "fig-w2-vsquared",
            "caption": "Stopping distance goes as the square of the speed, because the kinetic "
                       "energy that has to be removed does. Twice the speed is four times the "
                       "distance, not twice — the single most useful consequence of this week.",
            "caption_tr": "Durma mesafesi süratin karesiyle artar, çünkü yok edilmesi gereken "
                          "kinetik enerji de öyle artar. İki kat sürat, iki kat değil dört kat "
                          "mesafe demektir — bu haftanın en işe yarar sonucu.",
            # bar widths are exactly 38 * (1, 4, 9)
            "svg": """<svg viewBox="0 0 440 156" role="img" aria-labelledby="t-vs d-vs">
<title id="t-vs">Stopping distance at one, two and three times a reference speed</title>
<desc id="d-vs">Three horizontal bars showing stopping distance growing as the square of speed:
one unit at speed v, four units at two v, nine units at three v.</desc>
<line x1="42" y1="18" x2="42" y2="140" class="fig-axis"/>
<text x="30" y="40" class="fig-lab" text-anchor="end">v</text>
<rect x="42" y="24" width="34" height="24" class="fig-bar"/>
<text x="86" y="41" class="fig-note">1 unit</text>

<text x="30" y="82" class="fig-lab" text-anchor="end">2v</text>
<rect x="42" y="66" width="136" height="24" class="fig-bar"/>
<text x="188" y="83" class="fig-note">4 units</text>

<text x="30" y="124" class="fig-lab" text-anchor="end">3v</text>
<rect x="42" y="108" width="306" height="24" class="fig-bar"/>
<text x="358" y="125" class="fig-note">9 units</text>
</svg>""",
        },
    ],


    # ================================================================== WEEK 3
    3: [
        {
            "after": "Theory: Projectile Motion",
            "slug": "fig-w3-independence",
            "caption": "Two balls released at the same instant from the same height: one dropped, "
                       "one launched horizontally. Their vertical equations are identical, so at "
                       "every instant they are level with each other. Horizontal speed changes "
                       "where the second ball lands, not when.",
            "caption_tr": "Aynı anda aynı yükseklikten bırakılan iki top: biri serbest, biri yatay "
                          "atışla. Düşey denklemleri aynıdır, bu yüzden her anda aynı hizadadır. "
                          "Yatay hız, ikinci topun nereye düştüğünü değiştirir, ne zaman düştüğünü "
                          "değil.",
            # drops go as t^2: 9, 36, 81, 144 px below the release line (unit 9 px)
            # horizontal steps are equal: 50 px per tick
            "svg": """<svg viewBox="0 0 430 252" role="img" aria-labelledby="t-ind d-ind">
<title id="t-ind">A dropped ball and a horizontally launched ball fall together</title>
<desc id="d-ind">Strobe positions of two balls released together from the same height. The dropped
ball stays on a vertical line; the launched ball moves equal horizontal steps. Dashed level lines
join the two balls at each instant, showing they are always at the same height. The spacing between
levels grows as the square of the time.</desc>
""" + _markers("m3a") + """
<line x1="40" y1="200" x2="420" y2="200" class="fig-axis"/>
<line x1="70" y1="26" x2="70" y2="196" class="fig-thin"/>

<!-- level lines: the whole point of the figure -->
<g class="fig-thin-dash">
  <line x1="70" y1="49" x2="140" y2="49"/>
  <line x1="70" y1="76" x2="190" y2="76"/>
  <line x1="70" y1="121" x2="240" y2="121"/>
  <line x1="70" y1="184" x2="290" y2="184"/>
</g>
<g class="fig-note" text-anchor="end">
  <text x="62" y="53">t₁</text><text x="62" y="80">t₂</text>
  <text x="62" y="125">t₃</text><text x="62" y="188">t₄</text>
</g>

<!-- launch velocity at the release point -->
<line x1="90" y1="32" x2="146" y2="32" class="fig-vec fig-green" marker-end="url(#m3a-green)"/>
<text x="118" y="24" class="fig-lab fig-green" text-anchor="middle">v₀</text>

<!-- dropped ball: same x at every instant -->
<g class="fig-ball">
  <circle cx="90" cy="49" r="7"/><circle cx="90" cy="76" r="7"/>
  <circle cx="90" cy="121" r="7"/><circle cx="90" cy="184" r="7"/>
</g>
<!-- launched ball: equal horizontal steps, identical heights -->
<g class="fig-ball">
  <circle cx="140" cy="49" r="7"/><circle cx="190" cy="76" r="7"/>
  <circle cx="240" cy="121" r="7"/><circle cx="290" cy="184" r="7"/>
</g>
<circle cx="90" cy="32" r="4" class="fig-dot fig-accent"/>
<text x="62" y="36" class="fig-note" text-anchor="end">t₀</text>

<text x="90" y="222" class="fig-note" text-anchor="middle">dropped</text>
<text x="215" y="222" class="fig-note" text-anchor="middle">launched horizontally</text>
<text x="356" y="112" class="fig-note" text-anchor="middle">levels spread</text>
<text x="356" y="128" class="fig-note" text-anchor="middle">as t², not as t</text>
</svg>""",
        },
        {
            "after": "first force diagram",
            "slug": "fig-w3-fbd",
            "caption": "The same block, twice. On the left it is sliding to the right on a rough "
                       "table after the push has ended; on the right is every force acting on it. "
                       "Motion is not a force, so there is no forward arrow — the most common "
                       "single error in mechanics.",
            "caption_tr": "Aynı blok, iki kez. Solda itme bittikten sonra pürüzlü masada sağa "
                          "kayıyor; sağda ona etki eden bütün kuvvetler. Hareket bir kuvvet "
                          "değildir, bu yüzden ileri doğru ok yoktur — mekanikteki en yaygın hata.",
            "svg": """<svg viewBox="0 0 480 266" role="img" aria-labelledby="t-fbd d-fbd">
<title id="t-fbd">A sliding block and its free-body diagram</title>
<desc id="d-fbd">Left panel: a block sliding right along a rough table, with a velocity arrow.
Right panel: the same block isolated, with three force arrows — the normal force up, the weight
down, and kinetic friction pointing left, backwards along the motion. A crossed-out dashed arrow
marks the forward force that does not exist.</desc>
""" + _markers("m3b") + """
<line x1="20" y1="170" x2="226" y2="170" class="fig-axis"/>
<rect x="78" y="118" width="80" height="52" rx="3" class="fig-ball"/>
<line x1="168" y1="134" x2="214" y2="134" class="fig-vec fig-green" marker-end="url(#m3b-green)"/>
<text x="191" y="126" class="fig-lab fig-green" text-anchor="middle">v</text>
<text x="122" y="248" class="fig-note" text-anchor="middle">(a) sliding on a rough table</text>

<line x1="245" y1="40" x2="245" y2="236" class="fig-thin-dash"/>

<rect x="316" y="116" width="68" height="48" rx="3" class="fig-ball"/>
<line x1="350" y1="140" x2="350" y2="52" class="fig-vec fig-blue" marker-end="url(#m3b-blue)"/>
<line x1="350" y1="140" x2="350" y2="228" class="fig-vec fig-accent" marker-end="url(#m3b-accent)"/>
<line x1="350" y1="140" x2="264" y2="140" class="fig-vec fig-green" marker-end="url(#m3b-green)"/>
<text x="358" y="66" class="fig-lab fig-blue">N</text>
<text x="358" y="212" class="fig-lab fig-accent">mg</text>
<text x="272" y="130" class="fig-lab fig-green">f</text>

<line x1="390" y1="140" x2="438" y2="140" class="fig-thin-dash fig-muted"
      marker-end="url(#m3b-muted)"/>
<g class="fig-thin fig-muted" style="stroke-width:1.8">
  <line x1="406" y1="132" x2="422" y2="148"/><line x1="422" y1="132" x2="406" y2="148"/>
</g>
<text x="414" y="194" class="fig-note" text-anchor="middle">no forward force</text>
<text x="352" y="248" class="fig-note" text-anchor="middle">(b) every force on the block</text>
</svg>""",
        },
    ],

    # ================================================================== WEEK 4
    4: [
        {
            "after": "Block on an Incline",
            "slug": "fig-w4-incline",
            "caption": "The weight resolved along and perpendicular to a 30° slope. Choosing the "
                       "axes along the surface, not horizontal and vertical, is the single choice "
                       "that makes incline problems easy: only mg sin θ drives the motion, and "
                       "mg cos θ is what the surface has to support.",
            "caption_tr": "Ağırlığın 30°'lik eğime paralel ve dik bileşenleri. Eksenleri "
                          "yatay/düşey değil yüzey boyunca seçmek, eğik düzlem problemlerini "
                          "kolaylaştıran tek karardır: hareketi yalnızca mg sin θ sürer, yüzeyin "
                          "taşıması gereken ise mg cos θ'dır.",
            # slope exactly 30.000 deg; components close the parallelogram exactly (verified)
            "svg": """<svg viewBox="0 0 430 250" role="img" aria-labelledby="t-inc d-inc">
<title id="t-inc">Weight resolved into components along and perpendicular to an incline</title>
<desc id="d-inc">A block on a 30 degree incline. Its weight mg points straight down and is resolved
into mg sine theta down the slope and mg cosine theta into the surface; dashed lines complete the
parallelogram. The normal force N points out of the surface, equal and opposite to the
perpendicular component.</desc>
""" + _markers("m4a") + """
<path d="M 60 18.7 L 400 215 L 60 215 Z" class="fig-fill"/>
<path d="M 60 18.7 L 400 215 L 60 215 Z" class="fig-axis"/>

<!-- the block, sitting on the slope -->
<g transform="translate(223,89.71) rotate(30)">
  <rect x="-34" y="-20" width="68" height="40" rx="3" class="fig-ball"/>
</g>

<!-- parallelogram construction -->
<g class="fig-thin-dash">
  <line x1="181.43" y1="161.71" x2="223" y2="185.71"/>
  <line x1="264.57" y1="113.71" x2="223" y2="185.71"/>
</g>

<line x1="223" y1="89.71" x2="223" y2="185.71" class="fig-vec fig-accent"
      marker-end="url(#m4a-accent)"/>
<line x1="223" y1="89.71" x2="264.57" y2="113.71" class="fig-vec fig-green"
      marker-end="url(#m4a-green)"/>
<line x1="223" y1="89.71" x2="181.43" y2="161.71" class="fig-vec fig-muted"
      marker-end="url(#m4a-muted)"/>
<line x1="223" y1="89.71" x2="264.57" y2="17.71" class="fig-vec fig-blue"
      marker-end="url(#m4a-blue)"/>

<text x="231" y="181" class="fig-lab fig-accent">mg</text>
<text x="274" y="122" class="fig-lab fig-green">mg sin θ</text>
<text x="172" y="188" class="fig-lab fig-muted" text-anchor="end">mg cos θ</text>
<text x="272" y="22" class="fig-lab fig-blue">N</text>

<path d="M 345 215 A 55 55 0 0 1 352.37 187.5" class="fig-thin fig-accent"/>
<text x="338" y="206" class="fig-lab fig-accent" text-anchor="end">θ</text>
</svg>""",
        },
        {
            "after": "Friction Model",
            "slug": "fig-w4-friction",
            "caption": "Friction against applied force. While nothing slips, static friction is "
                       "whatever it needs to be — the 45° line, not μs N. μs N is only the largest "
                       "value it can reach. Once sliding begins the force drops to the fixed "
                       "kinetic value and stays there, however hard you pull.",
            "caption_tr": "Uygulanan kuvvete karşı sürtünme. Kayma yokken statik sürtünme, μs N "
                          "değil, gereken değerdir — 45°'lik doğru. μs N yalnızca ulaşabileceği en "
                          "büyük değerdir. Kayma başlayınca kuvvet sabit kinetik değere düşer ve ne "
                          "kadar çekerseniz çekin orada kalır.",
            # both axes 1 px per newton, so the static branch is exactly 45 degrees
            "svg": """<svg viewBox="0 0 440 244" role="img" aria-labelledby="t-fr d-fr">
<title id="t-fr">Friction force as a function of applied force</title>
<desc id="d-fr">A graph with applied force on the horizontal axis and friction force on the
vertical axis, both to the same scale. Friction follows a 45 degree line while the object does not
slip, reaches a maximum at mu-s times N, then drops to the smaller constant kinetic value mu-k
times N once sliding starts.</desc>
""" + _markers("m4b") + """
<line x1="60" y1="200" x2="410" y2="200" class="fig-axis"/>
<line x1="60" y1="200" x2="60" y2="34" class="fig-axis"/>
<text x="406" y="222" class="fig-lab" text-anchor="end">applied force F</text>
<text x="68" y="30" class="fig-lab">friction f</text>

<g class="fig-thin-dash">
  <line x1="60" y1="60" x2="200" y2="60"/>
  <line x1="60" y1="95" x2="200" y2="95"/>
  <line x1="200" y1="200" x2="200" y2="103"/>
</g>
<line x1="200" y1="196" x2="200" y2="204" class="fig-thin"/>
<g class="fig-lab" text-anchor="end">
  <text x="54" y="64">μs N</text><text x="54" y="99">μk N</text>
</g>

<line x1="60" y1="200" x2="200" y2="60" class="fig-curve fig-green"/>
<line x1="200" y1="95" x2="382" y2="95" class="fig-curve fig-accent"/>
<line x1="200" y1="66" x2="200" y2="89" class="fig-dash fig-accent" style="stroke-width:2" marker-end="url(#m4b-accent)"/>
<circle cx="200" cy="60" r="4.5" class="fig-dot fig-green"/>

<text x="150" y="176" class="fig-note" text-anchor="middle">no slipping: f = F</text>
<text x="292" y="122" class="fig-note" text-anchor="middle">sliding: f = μk N</text>
<text x="200" y="220" class="fig-note" text-anchor="middle">slip begins</text>
</svg>""",
        },
    ],

    # ================================================================== WEEK 5
    5: [
        {
            "after": "Work by a constant force",
            "slug": "fig-w5-workangle",
            "caption": "The same force, the same displacement, three different angles. Only the "
                       "component along the motion does work, so the sign of the work is the sign "
                       "of cos θ: pushing along the motion adds energy, a perpendicular force does "
                       "nothing at all, and a force opposing the motion removes energy.",
            "caption_tr": "Aynı kuvvet, aynı yer değiştirme, üç farklı açı. Yalnızca hareket "
                          "yönündeki bileşen iş yapar; bu yüzden işin işareti cos θ'nın işaretidir: "
                          "hareket yönünde itmek enerji katar, dik kuvvet hiçbir şey yapmaz, "
                          "harekete karşı kuvvet enerji götürür.",
            "svg": """<svg viewBox="0 0 480 220" role="img" aria-labelledby="t-wa d-wa">
<title id="t-wa">The sign of work for three force directions</title>
<desc id="d-wa">Three panels, each showing a block displaced to the right by the same amount. In
the first the force points along the motion and the work is positive; in the second the force is
perpendicular and the work is zero; in the third the force opposes the motion and the work is
negative.</desc>
""" + _markers("m5a") + """
<g class="fig-note" text-anchor="middle">
  <text x="84" y="20">θ = 0°</text><text x="244" y="20">θ = 90°</text><text x="404" y="20">θ = 180°</text>
</g>

<g transform="translate(0,0)">
  <line x1="24" y1="120" x2="150" y2="120" class="fig-axis"/>
  <rect x="62" y="92" width="44" height="28" rx="3" class="fig-ball"/>
  <line x1="108" y1="106" x2="156" y2="106" class="fig-vec fig-accent" marker-end="url(#m5a-accent)"/>
  <text x="132" y="98" class="fig-lab fig-accent" text-anchor="middle">F</text>
  <line x1="62" y1="142" x2="138" y2="142" class="fig-vec fig-blue" marker-end="url(#m5a-blue)"/>
  <text x="100" y="160" class="fig-lab fig-blue" text-anchor="middle">d</text>
  <text x="84" y="188" class="fig-lab fig-green" text-anchor="middle">W &gt; 0</text>
  <text x="84" y="206" class="fig-note" text-anchor="middle">speeds it up</text>
</g>

<g transform="translate(160,0)">
  <line x1="24" y1="120" x2="150" y2="120" class="fig-axis"/>
  <rect x="62" y="92" width="44" height="28" rx="3" class="fig-ball"/>
  <line x1="84" y1="90" x2="84" y2="42" class="fig-vec fig-accent" marker-end="url(#m5a-accent)"/>
  <text x="94" y="58" class="fig-lab fig-accent">F</text>
  <line x1="62" y1="142" x2="138" y2="142" class="fig-vec fig-blue" marker-end="url(#m5a-blue)"/>
  <text x="100" y="160" class="fig-lab fig-blue" text-anchor="middle">d</text>
  <text x="84" y="188" class="fig-lab" text-anchor="middle">W = 0</text>
  <text x="84" y="206" class="fig-note" text-anchor="middle">no energy moves</text>
</g>

<g transform="translate(320,0)">
  <line x1="24" y1="120" x2="150" y2="120" class="fig-axis"/>
  <rect x="62" y="92" width="44" height="28" rx="3" class="fig-ball"/>
  <line x1="60" y1="106" x2="12" y2="106" class="fig-vec fig-accent" marker-end="url(#m5a-accent)"/>
  <text x="36" y="98" class="fig-lab fig-accent" text-anchor="middle">F</text>
  <line x1="62" y1="142" x2="138" y2="142" class="fig-vec fig-blue" marker-end="url(#m5a-blue)"/>
  <text x="100" y="160" class="fig-lab fig-blue" text-anchor="middle">d</text>
  <text x="84" y="188" class="fig-lab fig-accent" text-anchor="middle">W &lt; 0</text>
  <text x="84" y="206" class="fig-note" text-anchor="middle">slows it down</text>
</g>
</svg>""",
        },
        {
            "after": "area under an F–x graph",
            "slug": "fig-w5-area",
            "caption": "Work done by a varying force is the signed area under the force–position "
                       "graph. Area above the axis is energy put in; area below it is energy taken "
                       "out. Here the positive area is twice the negative one, so the net work is "
                       "+6 J — read off the graph, with nothing integrated.",
            "caption_tr": "Değişen bir kuvvetin yaptığı iş, kuvvet–konum grafiğinin altındaki "
                          "işaretli alandır. Eksenin üstündeki alan verilen, altındaki alan alınan "
                          "enerjidir. Burada pozitif alan negatifin iki katıdır, net iş +6 J; "
                          "grafikten okunur, integral alınmaz.",
            # F(x) = piecewise linear through (0,0)->(2,6)->(4,0)->(6,-3)->(8,0)
            # 30 px per unit x from x0=60; 14 px per newton from the axis at y=120
            "svg": """<svg viewBox="0 0 440 236" role="img" aria-labelledby="t-ar d-ar">
<title id="t-ar">Work as the signed area under a force-position graph</title>
<desc id="d-ar">A force-position graph. Between zero and four metres the force is positive and the
shaded area above the axis is positive work of plus twelve joules. Between four and eight metres
the force is negative and the shaded area below the axis is negative work of minus six joules.</desc>
""" + _markers("m5b") + """
<path d="M 60 120 L 120 36 L 180 120 Z" fill="var(--green)" opacity=".16"/>
<path d="M 180 120 L 240 162 L 300 120 Z" fill="var(--phy-orange)" opacity=".20"/>

<line x1="40" y1="120" x2="400" y2="120" class="fig-axis"/>
<line x1="60" y1="180" x2="60" y2="24" class="fig-axis"/>
<text x="396" y="112" class="fig-lab" text-anchor="end">x (m)</text>
<text x="68" y="22" class="fig-lab">F (N)</text>

<g class="fig-thin">
  <line x1="120" y1="116" x2="120" y2="124"/><line x1="180" y1="116" x2="180" y2="124"/>
  <line x1="240" y1="116" x2="240" y2="124"/><line x1="300" y1="116" x2="300" y2="124"/>
</g>
<g class="fig-note" text-anchor="middle">
  <text x="120" y="136">2</text><text x="180" y="136">4</text>
  <text x="240" y="136">6</text><text x="300" y="136">8</text>
</g>

<path d="M 60 120 L 120 36 L 180 120 L 240 162 L 300 120" class="fig-curve fig-accent"/>
<text x="120" y="80" class="fig-lab fig-green" text-anchor="middle">+12 J</text>
<line x1="240" y1="176" x2="240" y2="166" class="fig-thin"/>
<text x="240" y="192" class="fig-lab fig-accent" text-anchor="middle">−6 J</text>
<text x="330" y="60" class="fig-note">net work</text>
<text x="330" y="76" class="fig-note">= +6 J</text>
</svg>""",
        },
    ],

    # ================================================================== WEEK 8
    8: [
        {
            "after": "Conservation of mechanical energy",
            "slug": "fig-w8-bars",
            "caption": "The same energy, three times. As the cart descends, potential energy turns "
                       "into kinetic energy and back, but the two bars always stack to the same "
                       "total height. That dashed ceiling is the whole content of conservation of "
                       "mechanical energy.",
            "caption_tr": "Aynı enerji, üç kez. Araba alçaldıkça potansiyel enerji kinetiğe ve geri "
                          "dönüşür; ama iki çubuk her zaman aynı toplam yüksekliğe yığılır. O "
                          "kesikli tavan, mekanik enerjinin korunumunun tamamıdır.",
            # U is proportional to height above the datum; K = E - U. Every bar totals 90 px.
            "svg": """<svg viewBox="0 0 420 336" role="img" aria-labelledby="t-eb d-eb">
<title id="t-eb">Energy bar charts at three points on a track</title>
<desc id="d-eb">A cart on a curved track at a high point A, a low point B and a middle point C.
Below each point a stacked bar shows potential energy in blue and kinetic energy in green. The bars
have different splits but exactly the same total height, marked by a dashed line labelled E is
constant.</desc>
""" + _markers("m8a") + """
<line x1="30" y1="180" x2="392" y2="180" class="fig-thin-dash"/>
<text x="34" y="174" class="fig-note">y = 0</text>

<path d="M 60 60 C 120 160, 150 160, 200 160 C 250 160, 290 120, 340 110"
      class="fig-curve fig-muted"/>
<g class="fig-thin-dash">
  <line x1="60" y1="69" x2="60" y2="180"/>
  <line x1="200" y1="169" x2="200" y2="180"/>
  <line x1="340" y1="119" x2="340" y2="180"/>
</g>
<g class="fig-ball">
  <circle cx="60" cy="60" r="9"/><circle cx="200" cy="160" r="9"/><circle cx="340" cy="110" r="9"/>
</g>
<g class="fig-lab" text-anchor="middle">
  <text x="60" y="42">A</text><text x="200" y="142">B</text><text x="340" y="92">C</text>
</g>

<line x1="20" y1="200" x2="400" y2="200" class="fig-dash fig-accent"/>
<text x="396" y="194" class="fig-lab fig-accent" text-anchor="end">E = constant</text>

<rect x="38" y="200" width="44" height="90" fill="var(--phy-blue)" opacity=".75"/>
<rect x="178" y="275" width="44" height="15" fill="var(--phy-blue)" opacity=".75"/>
<rect x="178" y="200" width="44" height="75" fill="var(--green)" opacity=".75"/>
<rect x="318" y="237.5" width="44" height="52.5" fill="var(--phy-blue)" opacity=".75"/>
<rect x="318" y="200" width="44" height="37.5" fill="var(--green)" opacity=".75"/>
<line x1="20" y1="290" x2="400" y2="290" class="fig-axis"/>

<g class="fig-lab" text-anchor="middle">
  <text x="60" y="308">A</text><text x="200" y="308">B</text><text x="340" y="308">C</text>
</g>
<rect x="148" y="322" width="12" height="9" fill="var(--phy-blue)" opacity=".75"/>
<text x="166" y="331" class="fig-note">U</text>
<rect x="212" y="322" width="12" height="9" fill="var(--green)" opacity=".75"/>
<text x="230" y="331" class="fig-note">K</text>
</svg>""",
        },
        {
            "after": "Spring Launcher",
            "slug": "fig-w8-spring",
            "caption": "Why the spring energy carries a half. The force needed to hold a spring "
                       "grows linearly with the stretch, so the energy stored is the area of a "
                       "triangle, not of the dashed rectangle: ½kx², not kx². Double the stretch "
                       "and you store four times the energy.",
            "caption_tr": "Yay enerjisindeki ½ neden var? Yayı tutmak için gereken kuvvet uzamayla "
                          "doğrusal artar; depolanan enerji kesikli dikdörtgenin değil bir üçgenin "
                          "alanıdır: kx² değil ½kx². Uzama iki katına çıkınca enerji dört katına "
                          "çıkar.",
            "svg": """<svg viewBox="0 0 420 230" role="img" aria-labelledby="t-sp d-sp">
<title id="t-sp">Elastic potential energy as the triangular area under F equals k x</title>
<desc id="d-sp">A graph of spring force against stretch. The line F equals k x rises from the origin.
The shaded triangle under it, of base x and height k x, is the stored energy one half k x squared.
A dashed rectangle of the same base and height encloses twice that area.</desc>
""" + _markers("m8b") + """
<line x1="60" y1="190" x2="390" y2="190" class="fig-axis"/>
<line x1="60" y1="190" x2="60" y2="30" class="fig-axis"/>
<text x="386" y="212" class="fig-lab" text-anchor="end">stretch x</text>
<text x="68" y="28" class="fig-lab">force F</text>

<path d="M 60 190 L 240 60 L 240 190 Z" fill="var(--green)" opacity=".20"/>
<rect x="60" y="60" width="180" height="130" fill="var(--phy-orange)" opacity=".07"/>
<rect x="60" y="60" width="180" height="130" class="fig-dash fig-muted" fill="none"/>
<line x1="60" y1="190" x2="286" y2="27" class="fig-curve fig-accent"/>
<text x="292" y="32" class="fig-lab fig-accent">F = kx</text>

<text x="240" y="206" class="fig-lab" text-anchor="middle">x</text>
<text x="54" y="64" class="fig-lab" text-anchor="end">kx</text>

<text x="196" y="158" class="fig-lab fig-green" text-anchor="middle">½kx²</text>
<text x="116" y="80" class="fig-note" text-anchor="middle">the dashed rectangle</text>
<text x="116" y="96" class="fig-note" text-anchor="middle">kx² is twice too big</text>
</svg>""",
        },
    ],

    # ================================================================== WEEK 9
    9: [
        {
            "after": "Impulse-Momentum Theorem",
            "slug": "fig-w9-impulse",
            "caption": "Two ways of stopping the same moving mass. The areas under the two curves "
                       "are equal, because the momentum change is the same either way — but "
                       "stretching the collision to four times the duration cuts the peak force to "
                       "a quarter. That is the whole engineering content of an airbag.",
            "caption_tr": "Aynı kütleyi durdurmanın iki yolu. İki eğrinin altındaki alanlar eşittir, "
                          "çünkü momentum değişimi her iki durumda da aynıdır — ama çarpışmayı dört "
                          "kat uzatmak tepe kuvveti dörtte bire düşürür. Hava yastığının bütün "
                          "mühendislik içeriği budur.",
            # both triangles have area 3600 px^2: 0.5*60*120 and 0.5*240*30 (verified)
            "svg": """<svg viewBox="0 0 420 250" role="img" aria-labelledby="t-im d-im">
<title id="t-im">Two force-time pulses carrying the same impulse</title>
<desc id="d-im">A force against time graph with two triangular pulses of equal area. The first is
tall and brief, reaching four times the peak force over a quarter of the duration; the second is low
and long. Equal area means equal impulse and therefore the same change in momentum.</desc>
""" + _markers("m9a") + """
<path d="M 60 190 L 90 70 L 120 190 Z" fill="var(--phy-orange)" opacity=".22"/>
<path d="M 60 190 L 180 160 L 300 190 Z" fill="var(--phy-blue)" opacity=".22"/>

<line x1="40" y1="190" x2="390" y2="190" class="fig-axis"/>
<line x1="60" y1="190" x2="60" y2="44" class="fig-axis"/>
<text x="386" y="210" class="fig-lab" text-anchor="end">time t</text>
<text x="68" y="42" class="fig-lab">force F</text>

<path d="M 60 190 L 90 70 L 120 190" class="fig-curve fig-accent"/>
<path d="M 60 190 L 180 160 L 300 190" class="fig-curve fig-blue"/>

<g class="fig-thin">
  <line x1="54" y1="70" x2="60" y2="70"/><line x1="54" y1="160" x2="60" y2="160"/>
</g>
<text x="48" y="74" class="fig-lab fig-accent" text-anchor="end">4F</text>
<text x="48" y="164" class="fig-lab fig-blue" text-anchor="end">F</text>

<text x="136" y="72" class="fig-note fig-accent">hard stop: brief, violent</text>
<text x="196" y="150" class="fig-note fig-blue" text-anchor="middle">airbag: long, gentle</text>
<text x="222" y="230" class="fig-note" text-anchor="middle">equal areas — equal impulse J = Δp</text>
</svg>""",
        },
        {
            "after": "Conservation of Momentum",
            "slug": "fig-w9-collisions",
            "caption": "The same two carts, two different collisions. Momentum is conserved in "
                       "both: one cart at v, or two carts at v/2, carry the same mv. Kinetic "
                       "energy is not — sticking together halves it, and that loss is what tells "
                       "the two cases apart.",
            "caption_tr": "Aynı iki araba, iki farklı çarpışma. Momentum her ikisinde de korunur: "
                          "v hızıyla tek araba ile v/2 hızıyla iki araba aynı mv'yi taşır. Kinetik "
                          "enerji korunmaz — yapışmak onu yarıya indirir; iki durumu ayıran da bu "
                          "kayıptır.",
            "svg": """<svg viewBox="0 0 460 284" role="img" aria-labelledby="t-co d-co">
<title id="t-co">An elastic and a perfectly inelastic collision between equal masses</title>
<desc id="d-co">Top row, elastic: a moving cart strikes a stationary one of equal mass and stops
dead while the second moves off at the original speed. Bottom row, perfectly inelastic: the same
carts stick together and move off at half the speed. Both conserve momentum; only the first
conserves kinetic energy.</desc>
""" + _markers("m9b") + """
<text x="110" y="20" class="fig-note" text-anchor="middle">before</text>
<text x="340" y="20" class="fig-note" text-anchor="middle">after</text>
<line x1="222" y1="28" x2="222" y2="262" class="fig-thin-dash"/>

<line x1="20" y1="96" x2="200" y2="96" class="fig-axis"/>
<rect x="40" y="66" width="40" height="30" rx="3" class="fig-ball"/>
<rect x="140" y="66" width="40" height="30" rx="3" class="fig-ball"/>
<line x1="86" y1="52" x2="132" y2="52" class="fig-vec fig-green" marker-end="url(#m9b-green)"/>
<text x="109" y="44" class="fig-lab fig-green" text-anchor="middle">v</text>
<text x="160" y="114" class="fig-note" text-anchor="middle">at rest</text>

<line x1="244" y1="96" x2="440" y2="96" class="fig-axis"/>
<rect x="262" y="66" width="40" height="30" rx="3" class="fig-ball"/>
<rect x="352" y="66" width="40" height="30" rx="3" class="fig-ball"/>
<line x1="398" y1="52" x2="444" y2="52" class="fig-vec fig-green" marker-end="url(#m9b-green)"/>
<text x="421" y="44" class="fig-lab fig-green" text-anchor="middle">v</text>
<text x="282" y="114" class="fig-note" text-anchor="middle">stopped</text>
<text x="110" y="140" class="fig-lab" text-anchor="middle">elastic — K conserved</text>

<line x1="20" y1="230" x2="200" y2="230" class="fig-axis"/>
<rect x="40" y="200" width="40" height="30" rx="3" class="fig-ball"/>
<rect x="140" y="200" width="40" height="30" rx="3" class="fig-ball"/>
<line x1="86" y1="186" x2="132" y2="186" class="fig-vec fig-green" marker-end="url(#m9b-green)"/>
<text x="109" y="178" class="fig-lab fig-green" text-anchor="middle">v</text>
<text x="160" y="248" class="fig-note" text-anchor="middle">at rest</text>

<line x1="244" y1="230" x2="440" y2="230" class="fig-axis"/>
<rect x="312" y="200" width="80" height="30" rx="3" class="fig-ball"/>
<line x1="398" y1="186" x2="421" y2="186" class="fig-vec fig-accent" marker-end="url(#m9b-accent)"/>
<text x="410" y="178" class="fig-lab fig-accent" text-anchor="middle">v/2</text>
<text x="352" y="248" class="fig-note" text-anchor="middle">stuck together</text>
<text x="110" y="278" class="fig-lab fig-accent" text-anchor="middle">inelastic — half the K gone</text>
</svg>""",
        },
    ],
    # ================================================================= WEEK 10
    10: [
        {
            "after": "Angular Kinematics",
            "slug": "fig-w10-omega-r",
            "caption": "One disc, one angular velocity, two different speeds. Every point turns "
                       "through the same angle in the same time, so ω is a property of the whole "
                       "disc — but the point twice as far from the axis travels twice as far, so "
                       "v = ωr. This is the bridge between the angular and linear columns.",
            "caption_tr": "Tek disk, tek açısal hız, iki farklı sürat. Her nokta aynı sürede aynı "
                          "açıyı tarar; bu yüzden ω bütün diskin özelliğidir — ama eksene iki kat "
                          "uzaktaki nokta iki kat yol alır: v = ωr. Açısal ve doğrusal sütunlar "
                          "arasındaki köprü budur.",
            # r1 = 47.5 px, r2 = 95 px exactly; arrows 40 px and 80 px -> both ratios exactly 2
            "svg": """<svg viewBox="0 0 380 248" role="img" aria-labelledby="t-wr d-wr">
<title id="t-wr">Two points on a rotating disc at different radii</title>
<desc id="d-wr">A disc turning with one angular velocity. A point halfway out has a velocity arrow
of one length; a point on the rim, twice as far from the axis, has an arrow exactly twice as long.
Dimension bars below mark the two radii as r and 2r.</desc>
""" + _markers("m10a") + """
<circle cx="110" cy="110" r="80" class="fig-axis" fill="var(--bg-soft)"/>
<line x1="110" y1="110" x2="190" y2="110" class="fig-thin"/>

<path d="M 140 110 A 30 30 0 0 0 110 80" class="fig-thin fig-accent"
      marker-end="url(#m10a-accent)"/>
<text x="116" y="72" class="fig-lab fig-accent">ω</text>

<line x1="150" y1="110" x2="150" y2="76" class="fig-vec fig-blue" marker-end="url(#m10a-blue)"/>
<line x1="190" y1="110" x2="190" y2="42" class="fig-vec fig-green" marker-end="url(#m10a-green)"/>
<text x="158" y="80" class="fig-lab fig-blue">v</text>
<text x="198" y="48" class="fig-lab fig-green">2v</text>

<circle cx="110" cy="110" r="4" class="fig-dot"/>
<circle cx="150" cy="110" r="4.5" class="fig-dot fig-blue"/>
<circle cx="190" cy="110" r="4.5" class="fig-dot fig-green"/>

<g class="fig-thin">
  <line x1="110" y1="200" x2="150" y2="200"/>
  <line x1="110" y1="194" x2="110" y2="206"/><line x1="150" y1="194" x2="150" y2="206"/>
  <line x1="110" y1="226" x2="190" y2="226"/>
  <line x1="110" y1="220" x2="110" y2="232"/><line x1="190" y1="220" x2="190" y2="232"/>
</g>
<text x="104" y="204" class="fig-lab fig-blue" text-anchor="end">r</text>
<text x="104" y="230" class="fig-lab fig-green" text-anchor="end">2r</text>

<text x="300" y="104" class="fig-note" text-anchor="middle">same ω,</text>
<text x="300" y="120" class="fig-note" text-anchor="middle">different v</text>
</svg>""",
        },
        {
            "after": "Moment of Inertia",
            "slug": "fig-w10-inertia",
            "caption": "Two objects of exactly the same mass, spun about the same axle. Moving the "
                       "mass twice as far out makes it four times as hard to start or stop turning, "
                       "because inertia counts each piece of mass by the square of its distance. "
                       "Mass alone does not tell you how hard something is to spin.",
            "caption_tr": "Tam olarak aynı kütleye sahip iki cisim, aynı mil etrafında döndürülüyor. "
                          "Kütleyi iki kat dışarı taşımak, döndürmeyi veya durdurmayı dört kat "
                          "zorlaştırır; çünkü eylemsizlik her kütle parçasını uzaklığın karesiyle "
                          "sayar. Kütle tek başına bir cismin ne kadar zor döneceğini söylemez.",
            # blobs are identical (same mass); radii are exactly 30 and 60 px -> I ratio 4
            "svg": """<svg viewBox="0 0 420 244" role="img" aria-labelledby="t-mi d-mi">
<title id="t-mi">The same two masses at two distances from the axis</title>
<desc id="d-mi">Two dumbbells with identical masses on the same axle. In the first the masses sit
at distance r from the axis; in the second at twice that distance. The moment of inertia is four
times larger in the second, although the mass is unchanged.</desc>
""" + _markers("m10b") + """
<line x1="40" y1="110" x2="160" y2="110" class="fig-vec fig-muted"/>
<circle cx="70" cy="110" r="15" class="fig-ball"/>
<circle cx="130" cy="110" r="15" class="fig-ball"/>
<circle cx="100" cy="110" r="5" class="fig-dot fig-accent"/>
<g class="fig-thin">
  <line x1="100" y1="140" x2="100" y2="166"/><line x1="130" y1="140" x2="130" y2="166"/>
  <line x1="100" y1="160" x2="130" y2="160"/>
</g>
<text x="115" y="154" class="fig-lab" text-anchor="middle">r</text>
<text x="100" y="196" class="fig-lab fig-blue" text-anchor="middle">I = 2mr²</text>

<line x1="210" y1="110" x2="390" y2="110" class="fig-vec fig-muted"/>
<circle cx="240" cy="110" r="15" class="fig-ball"/>
<circle cx="360" cy="110" r="15" class="fig-ball"/>
<circle cx="300" cy="110" r="5" class="fig-dot fig-accent"/>
<g class="fig-thin">
  <line x1="300" y1="140" x2="300" y2="166"/><line x1="360" y1="140" x2="360" y2="166"/>
  <line x1="300" y1="160" x2="360" y2="160"/>
</g>
<text x="330" y="154" class="fig-lab" text-anchor="middle">2r</text>
<text x="300" y="196" class="fig-lab fig-green" text-anchor="middle">I = 8mr² = 4I</text>

<text x="210" y="228" class="fig-note" text-anchor="middle">same mass — four times the inertia, because r is squared</text>
</svg>""",
        },
    ],

    # ================================================================= WEEK 11
    11: [
        {
            "after": "Rotational Kinetic Energy",
            "slug": "fig-w11-rolling",
            "caption": "A rolling wheel is turning and translating at once, and the two add. The "
                       "point touching the ground is instantaneously at rest — that is exactly what "
                       "'rolling without slipping' means — while the top of the wheel moves at "
                       "twice the speed of the axle.",
            "caption_tr": "Yuvarlanan bir tekerlek aynı anda hem döner hem öteler ve ikisi toplanır. "
                          "Yere değen nokta o anda duruyordur — 'kaymadan yuvarlanma' tam olarak "
                          "budur — tekerleğin tepesi ise milin iki katı süratle hareket eder.",
            # arrows are 60 px at the axle and exactly 120 px at the top
            "svg": """<svg viewBox="0 0 420 246" role="img" aria-labelledby="t-ro d-ro">
<title id="t-ro">Velocities at the top, centre and contact point of a rolling wheel</title>
<desc id="d-ro">A wheel rolling to the right. The contact point with the ground has zero velocity,
the axle moves at v, and the top of the wheel moves at exactly twice v. The speed grows linearly
with height above the contact point.</desc>
""" + _markers("m11a") + """
<line x1="20" y1="180" x2="400" y2="180" class="fig-axis"/>
<circle cx="140" cy="110" r="70" class="fig-axis" fill="var(--bg-soft)"/>
<line x1="140" y1="40" x2="140" y2="180" class="fig-thin-dash"/>

<path d="M 104 110 A 36 36 0 0 1 176 110" class="fig-thin fig-accent"
      marker-end="url(#m11a-accent)"/>
<text x="140" y="66" class="fig-lab fig-accent" text-anchor="middle">ω</text>

<line x1="140" y1="40" x2="260" y2="40" class="fig-vec fig-green" marker-end="url(#m11a-green)"/>
<line x1="140" y1="110" x2="200" y2="110" class="fig-vec fig-blue" marker-end="url(#m11a-blue)"/>
<text x="268" y="46" class="fig-lab fig-green">2v</text>
<text x="208" y="116" class="fig-lab fig-blue">v</text>

<circle cx="140" cy="40" r="4.5" class="fig-dot fig-green"/>
<circle cx="140" cy="110" r="4.5" class="fig-dot fig-blue"/>
<circle cx="140" cy="180" r="5" class="fig-dot fig-accent"/>
<text x="150" y="200" class="fig-lab fig-accent">v = 0</text>

<text x="330" y="104" class="fig-note" text-anchor="middle">speed grows</text>
<text x="330" y="120" class="fig-note" text-anchor="middle">with height above</text>
<text x="330" y="136" class="fig-note" text-anchor="middle">the contact point</text>
<text x="210" y="232" class="fig-note" text-anchor="middle">rolling without slipping: v = ωR</text>
</svg>""",
        },
        {
            "after": "Angular momentum and its conservation",
            "slug": "fig-w11-angmom",
            "caption": "Pulling the masses halfway in quarters the moment of inertia, so the spin "
                       "rate must quadruple to keep L = Iω unchanged. No torque is applied — the "
                       "skater simply rearranges where the mass sits, and the rotation does the "
                       "rest.",
            "caption_tr": "Kütleleri yarı yarıya içeri çekmek eylemsizlik momentini dörtte bire "
                          "indirir; L = Iω sabit kalsın diye dönme hızı dört katına çıkmak "
                          "zorundadır. Hiç tork uygulanmaz — patenci yalnızca kütlenin yerini "
                          "değiştirir, gerisini dönme halleder.",
            # radii exactly 60 and 30 px: I scales by 1/4, so omega must scale by 4
            "svg": """<svg viewBox="0 0 420 240" role="img" aria-labelledby="t-am d-am">
<title id="t-am">Angular momentum conserved as the masses are pulled inwards</title>
<desc id="d-am">Two rotating dumbbells of the same mass. In the first the masses are at radius r
and it turns slowly; in the second they are at half that radius, the moment of inertia is a quarter
and the rotation is four times faster, so the angular momentum is unchanged.</desc>
""" + _markers("m11b") + """
<line x1="34" y1="110" x2="166" y2="110" class="fig-vec fig-muted"/>
<circle cx="40" cy="110" r="11" class="fig-ball"/>
<circle cx="160" cy="110" r="11" class="fig-ball"/>
<circle cx="100" cy="110" r="5" class="fig-dot fig-accent"/>
<path d="M 146 110 A 46 46 0 0 0 123 70.16" class="fig-thin fig-accent"
      marker-end="url(#m11b-accent)"/>
<g class="fig-thin">
  <line x1="100" y1="132" x2="100" y2="152"/><line x1="160" y1="132" x2="160" y2="152"/>
  <line x1="100" y1="146" x2="160" y2="146"/>
</g>
<text x="130" y="166" class="fig-lab" text-anchor="middle">r</text>
<text x="100" y="182" class="fig-lab fig-blue" text-anchor="middle">I,  ω</text>

<line x1="264" y1="110" x2="336" y2="110" class="fig-vec fig-muted"/>
<circle cx="270" cy="110" r="11" class="fig-ball"/>
<circle cx="330" cy="110" r="11" class="fig-ball"/>
<circle cx="300" cy="110" r="5" class="fig-dot fig-accent"/>
<path d="M 346 110 A 46 46 0 1 0 267.47 77.47" class="fig-thin fig-accent"
      marker-end="url(#m11b-accent)"/>
<g class="fig-thin">
  <line x1="300" y1="132" x2="300" y2="152"/><line x1="330" y1="132" x2="330" y2="152"/>
  <line x1="300" y1="146" x2="330" y2="146"/>
</g>
<text x="315" y="166" class="fig-lab" text-anchor="middle">r/2</text>
<text x="300" y="182" class="fig-lab fig-green" text-anchor="middle">I/4,  4ω</text>

<text x="210" y="216" class="fig-note" text-anchor="middle">no torque acts, so L = Iω is the same on both sides</text>
</svg>""",
        },
    ],

    # ================================================================= WEEK 12
    12: [
        {
            "after": "Torque",
            "slug": "fig-w12-leverarm",
            "caption": "The same force applied at the same point, twice. What changes the turning "
                       "effect is the perpendicular distance from the pivot to the force's line of "
                       "action. Pushing at 30° to the rod gives only half the torque, because "
                       "d⊥ = r sin θ — the lever arm, not the distance to where you push.",
            "caption_tr": "Aynı noktada, aynı büyüklükte kuvvet, iki kez. Döndürme etkisini "
                          "değiştiren şey, dayanak noktasından kuvvetin etki doğrusuna olan dik "
                          "uzaklıktır. Çubuğa 30° ile itmek torkun yalnızca yarısını verir, çünkü "
                          "d⊥ = r sin θ — itilen noktaya olan uzaklık değil, moment kolu.",
            # r = 110 px; the foot of the perpendicular is (277.50, 207.63), d_perp = 55.00 = r sin30
            "svg": """<svg viewBox="0 0 440 264" role="img" aria-labelledby="t-la d-la">
<title id="t-la">Torque from a perpendicular push and from an angled push</title>
<desc id="d-la">Left: a force perpendicular to a rod at distance r from the pivot, giving torque
r F. Right: the same force applied at the same point but at thirty degrees to the rod; the
perpendicular distance from the pivot to the line of action is r sine theta, exactly half, so the
torque is halved.</desc>
""" + _markers("m12a") + """
<line x1="40" y1="160" x2="170" y2="160" class="fig-proj"/>
<line x1="40" y1="160" x2="170" y2="160" class="fig-vec fig-muted"/>
<line x1="170" y1="160" x2="170" y2="100" class="fig-vec fig-accent"
      marker-end="url(#m12a-accent)"/>
<text x="178" y="112" class="fig-lab fig-accent">F</text>
<circle cx="40" cy="160" r="5" class="fig-dot"/>
<text x="40" y="150" class="fig-note" text-anchor="middle">pivot</text>
<path d="M 156 160 L 156 146 L 170 146" class="fig-thin"/>
<text x="105" y="180" class="fig-lab fig-green" text-anchor="middle">d⊥ = r</text>
<text x="105" y="250" class="fig-note" text-anchor="middle">perpendicular push:  τ = rF</text>

<line x1="215" y1="40" x2="215" y2="240" class="fig-thin-dash"/>

<line x1="250" y1="160" x2="360" y2="160" class="fig-vec fig-muted"/>
<line x1="360" y1="160" x2="407.6" y2="132.5" class="fig-vec fig-accent"
      marker-end="url(#m12a-accent)"/>
<text x="404" y="120" class="fig-lab fig-accent">F</text>
<line x1="360" y1="160" x2="273" y2="210.2" class="fig-thin-dash"/>
<line x1="250" y1="160" x2="277.5" y2="207.63" class="fig-proj"/>
<line x1="250" y1="160" x2="277.5" y2="207.63" class="fig-dim"/>
<path d="M 271.6 200 L 277.5 196.6 L 281 202.5" class="fig-thin"/>
<circle cx="250" cy="160" r="5" class="fig-dot"/>
<line x1="360" y1="160" x2="402" y2="160" class="fig-thin-dash"/>
<path d="M 394 160 A 34 34 0 0 0 389.4 143" class="fig-thin fig-accent"/>
<text x="392" y="156" class="fig-lab fig-accent">θ</text>
<text x="290" y="192" class="fig-lab fig-green">d⊥</text>
<text x="330" y="250" class="fig-note" text-anchor="middle">angled push:  τ = rF sin θ  =  ½rF</text>
</svg>""",
        },
        {
            "after": "Static Equilibrium",
            "slug": "fig-w12-tipping",
            "caption": "Whether a tilted box falls back or goes over is decided by one line. While "
                       "the weight line through the centre of mass still falls inside the pivot, "
                       "gravity turns it back; once it passes outside, the same weight turns it "
                       "over. For this box the switch happens at 38.7°.",
            "caption_tr": "Eğilmiş bir kutunun geri düşmesi mi yoksa devrilmesi mi, tek bir çizgiye "
                          "bağlıdır. Kütle merkezinden geçen ağırlık doğrusu dayanak noktasının "
                          "içinde kaldığı sürece yerçekimi kutuyu geri döndürür; dışına çıktığı anda "
                          "aynı ağırlık onu devirir. Bu kutu için sınır 38,7°'dir.",
            # COM after rotation about the pivot: 20 deg -> (99.51,129.33) inside; 50 deg -> (132.59,127.22) outside
            "svg": """<svg viewBox="0 0 460 254" role="img" aria-labelledby="t-tp d-tp">
<title id="t-tp">A tilted box that falls back and one that tips over</title>
<desc id="d-tp">Two boxes tilted about their bottom-right corner. In the first, tilted twenty
degrees, the vertical line from the centre of mass lands inside the pivot corner and the box falls
back. In the second, tilted fifty degrees, the line lands outside the pivot and the box tips
over.</desc>
""" + _markers("m12b") + """
<line x1="20" y1="190" x2="440" y2="190" class="fig-axis"/>

<g transform="rotate(20 120 190)">
  <rect x="40" y="90" width="80" height="100" rx="2" class="fig-ball"/>
</g>
<line x1="99.51" y1="129.33" x2="99.51" y2="204" class="fig-dash fig-accent"/>
<circle cx="99.51" cy="129.33" r="5" class="fig-dot fig-accent"/>
<circle cx="120" cy="190" r="4.5" class="fig-dot"/>
<text x="128" y="204" class="fig-note">pivot</text>
<text x="99" y="120" class="fig-lab fig-accent" text-anchor="middle">cm</text>
<text x="86" y="232" class="fig-lab fig-green" text-anchor="middle">inside → falls back</text>

<g transform="rotate(50 340 190)">
  <rect x="260" y="90" width="80" height="100" rx="2" class="fig-ball"/>
</g>
<line x1="352.59" y1="127.22" x2="352.59" y2="204" class="fig-dash fig-accent"/>
<circle cx="352.59" cy="127.22" r="5" class="fig-dot fig-accent"/>
<circle cx="340" cy="190" r="4.5" class="fig-dot"/>
<text x="312" y="204" class="fig-note" text-anchor="end">pivot</text>
<text x="352" y="118" class="fig-lab fig-accent" text-anchor="middle">cm</text>
<text x="352" y="232" class="fig-lab fig-accent" text-anchor="middle">outside → tips over</text>
</svg>""",
        },
    ],

    # ================================================================= WEEK 13
    13: [
        {
            "after": "What is Simple Harmonic Motion?",
            "slug": "fig-w13-xva",
            "caption": "One oscillation, read three ways. Velocity is zero exactly where the "
                       "displacement is largest, and largest exactly where the displacement is "
                       "zero; acceleration is the mirror image of displacement, which is the whole "
                       "content of a = −ω²x. Each curve is the previous one shifted a quarter "
                       "period.",
            "caption_tr": "Bir salınım, üç ayrı okuma. Hız, yer değiştirmenin en büyük olduğu yerde "
                          "tam sıfırdır ve yer değiştirmenin sıfır olduğu yerde tam en büyüktür; "
                          "ivme ise yer değiştirmenin ayna görüntüsüdür — a = −ω²x'in tamamı budur. "
                          "Her eğri, bir öncekinin çeyrek periyot kaymış hâlidir.",
            "svg": """<svg viewBox="0 0 400 274" role="img" aria-labelledby="t-xva d-xva">
<title id="t-xva">Displacement, velocity and acceleration over one period of SHM</title>
<desc id="d-xva">Three stacked graphs against a common time axis covering one full period. The
displacement is a cosine, the velocity is a negative sine — a quarter period behind — and the
acceleration is a negative cosine, the mirror image of the displacement.</desc>
""" + _markers("m13a") + """
<line x1="60" y1="14" x2="60" y2="246" class="fig-dash fig-accent"/>
<g class="fig-thin-dash">
  <line x1="135" y1="14" x2="135" y2="246"/><line x1="210" y1="14" x2="210" y2="246"/>
  <line x1="285" y1="14" x2="285" y2="246"/>
</g>
<g class="fig-axis">
  <line x1="50" y1="50" x2="370" y2="50"/><line x1="50" y1="130" x2="370" y2="130"/>
  <line x1="50" y1="210" x2="370" y2="210"/>
</g>
<g class="fig-lab" text-anchor="end">
  <text x="44" y="54">x</text><text x="44" y="134">v</text><text x="44" y="214">a</text>
</g>
<path d="M 60.0 18.0 L 62.5 18.0 L 65.0 18.2 L 67.5 18.4 L 70.0 18.7 L 72.5 19.1 L 75.0 19.6 L 77.5 20.1 L 80.0 20.8 L 82.5 21.5 L 85.0 22.3 L 87.5 23.2 L 90.0 24.1 L 92.5 25.1 L 95.0 26.2 L 97.5 27.4 L 100.0 28.6 L 102.5 29.9 L 105.0 31.2 L 107.5 32.6 L 110.0 34.0 L 112.5 35.5 L 115.0 37.0 L 117.5 38.5 L 120.0 40.1 L 122.5 41.7 L 125.0 43.3 L 127.5 45.0 L 130.0 46.7 L 132.5 48.3 L 135.0 50.0 L 137.5 51.7 L 140.0 53.3 L 142.5 55.0 L 145.0 56.7 L 147.5 58.3 L 150.0 59.9 L 152.5 61.5 L 155.0 63.0 L 157.5 64.5 L 160.0 66.0 L 162.5 67.4 L 165.0 68.8 L 167.5 70.1 L 170.0 71.4 L 172.5 72.6 L 175.0 73.8 L 177.5 74.9 L 180.0 75.9 L 182.5 76.8 L 185.0 77.7 L 187.5 78.5 L 190.0 79.2 L 192.5 79.9 L 195.0 80.4 L 197.5 80.9 L 200.0 81.3 L 202.5 81.6 L 205.0 81.8 L 207.5 82.0 L 210.0 82.0 L 212.5 82.0 L 215.0 81.8 L 217.5 81.6 L 220.0 81.3 L 222.5 80.9 L 225.0 80.4 L 227.5 79.9 L 230.0 79.2 L 232.5 78.5 L 235.0 77.7 L 237.5 76.8 L 240.0 75.9 L 242.5 74.9 L 245.0 73.8 L 247.5 72.6 L 250.0 71.4 L 252.5 70.1 L 255.0 68.8 L 257.5 67.4 L 260.0 66.0 L 262.5 64.5 L 265.0 63.0 L 267.5 61.5 L 270.0 59.9 L 272.5 58.3 L 275.0 56.7 L 277.5 55.0 L 280.0 53.3 L 282.5 51.7 L 285.0 50.0 L 287.5 48.3 L 290.0 46.7 L 292.5 45.0 L 295.0 43.3 L 297.5 41.7 L 300.0 40.1 L 302.5 38.5 L 305.0 37.0 L 307.5 35.5 L 310.0 34.0 L 312.5 32.6 L 315.0 31.2 L 317.5 29.9 L 320.0 28.6 L 322.5 27.4 L 325.0 26.2 L 327.5 25.1 L 330.0 24.1 L 332.5 23.2 L 335.0 22.3 L 337.5 21.5 L 340.0 20.8 L 342.5 20.1 L 345.0 19.6 L 347.5 19.1 L 350.0 18.7 L 352.5 18.4 L 355.0 18.2 L 357.5 18.0 L 360.0 18.0" class="fig-curve fig-blue"/>
<path d="M 60.0 130.0 L 62.5 131.7 L 65.0 133.3 L 67.5 135.0 L 70.0 136.7 L 72.5 138.3 L 75.0 139.9 L 77.5 141.5 L 80.0 143.0 L 82.5 144.5 L 85.0 146.0 L 87.5 147.4 L 90.0 148.8 L 92.5 150.1 L 95.0 151.4 L 97.5 152.6 L 100.0 153.8 L 102.5 154.9 L 105.0 155.9 L 107.5 156.8 L 110.0 157.7 L 112.5 158.5 L 115.0 159.2 L 117.5 159.9 L 120.0 160.4 L 122.5 160.9 L 125.0 161.3 L 127.5 161.6 L 130.0 161.8 L 132.5 162.0 L 135.0 162.0 L 137.5 162.0 L 140.0 161.8 L 142.5 161.6 L 145.0 161.3 L 147.5 160.9 L 150.0 160.4 L 152.5 159.9 L 155.0 159.2 L 157.5 158.5 L 160.0 157.7 L 162.5 156.8 L 165.0 155.9 L 167.5 154.9 L 170.0 153.8 L 172.5 152.6 L 175.0 151.4 L 177.5 150.1 L 180.0 148.8 L 182.5 147.4 L 185.0 146.0 L 187.5 144.5 L 190.0 143.0 L 192.5 141.5 L 195.0 139.9 L 197.5 138.3 L 200.0 136.7 L 202.5 135.0 L 205.0 133.3 L 207.5 131.7 L 210.0 130.0 L 212.5 128.3 L 215.0 126.7 L 217.5 125.0 L 220.0 123.3 L 222.5 121.7 L 225.0 120.1 L 227.5 118.5 L 230.0 117.0 L 232.5 115.5 L 235.0 114.0 L 237.5 112.6 L 240.0 111.2 L 242.5 109.9 L 245.0 108.6 L 247.5 107.4 L 250.0 106.2 L 252.5 105.1 L 255.0 104.1 L 257.5 103.2 L 260.0 102.3 L 262.5 101.5 L 265.0 100.8 L 267.5 100.1 L 270.0 99.6 L 272.5 99.1 L 275.0 98.7 L 277.5 98.4 L 280.0 98.2 L 282.5 98.0 L 285.0 98.0 L 287.5 98.0 L 290.0 98.2 L 292.5 98.4 L 295.0 98.7 L 297.5 99.1 L 300.0 99.6 L 302.5 100.1 L 305.0 100.8 L 307.5 101.5 L 310.0 102.3 L 312.5 103.2 L 315.0 104.1 L 317.5 105.1 L 320.0 106.2 L 322.5 107.4 L 325.0 108.6 L 327.5 109.9 L 330.0 111.2 L 332.5 112.6 L 335.0 114.0 L 337.5 115.5 L 340.0 117.0 L 342.5 118.5 L 345.0 120.1 L 347.5 121.7 L 350.0 123.3 L 352.5 125.0 L 355.0 126.7 L 357.5 128.3 L 360.0 130.0" class="fig-curve fig-green"/>
<path d="M 60.0 242.0 L 62.5 242.0 L 65.0 241.8 L 67.5 241.6 L 70.0 241.3 L 72.5 240.9 L 75.0 240.4 L 77.5 239.9 L 80.0 239.2 L 82.5 238.5 L 85.0 237.7 L 87.5 236.8 L 90.0 235.9 L 92.5 234.9 L 95.0 233.8 L 97.5 232.6 L 100.0 231.4 L 102.5 230.1 L 105.0 228.8 L 107.5 227.4 L 110.0 226.0 L 112.5 224.5 L 115.0 223.0 L 117.5 221.5 L 120.0 219.9 L 122.5 218.3 L 125.0 216.7 L 127.5 215.0 L 130.0 213.3 L 132.5 211.7 L 135.0 210.0 L 137.5 208.3 L 140.0 206.7 L 142.5 205.0 L 145.0 203.3 L 147.5 201.7 L 150.0 200.1 L 152.5 198.5 L 155.0 197.0 L 157.5 195.5 L 160.0 194.0 L 162.5 192.6 L 165.0 191.2 L 167.5 189.9 L 170.0 188.6 L 172.5 187.4 L 175.0 186.2 L 177.5 185.1 L 180.0 184.1 L 182.5 183.2 L 185.0 182.3 L 187.5 181.5 L 190.0 180.8 L 192.5 180.1 L 195.0 179.6 L 197.5 179.1 L 200.0 178.7 L 202.5 178.4 L 205.0 178.2 L 207.5 178.0 L 210.0 178.0 L 212.5 178.0 L 215.0 178.2 L 217.5 178.4 L 220.0 178.7 L 222.5 179.1 L 225.0 179.6 L 227.5 180.1 L 230.0 180.8 L 232.5 181.5 L 235.0 182.3 L 237.5 183.2 L 240.0 184.1 L 242.5 185.1 L 245.0 186.2 L 247.5 187.4 L 250.0 188.6 L 252.5 189.9 L 255.0 191.2 L 257.5 192.6 L 260.0 194.0 L 262.5 195.5 L 265.0 197.0 L 267.5 198.5 L 270.0 200.1 L 272.5 201.7 L 275.0 203.3 L 277.5 205.0 L 280.0 206.7 L 282.5 208.3 L 285.0 210.0 L 287.5 211.7 L 290.0 213.3 L 292.5 215.0 L 295.0 216.7 L 297.5 218.3 L 300.0 219.9 L 302.5 221.5 L 305.0 223.0 L 307.5 224.5 L 310.0 226.0 L 312.5 227.4 L 315.0 228.8 L 317.5 230.1 L 320.0 231.4 L 322.5 232.6 L 325.0 233.8 L 327.5 234.9 L 330.0 235.9 L 332.5 236.8 L 335.0 237.7 L 337.5 238.5 L 340.0 239.2 L 342.5 239.9 L 345.0 240.4 L 347.5 240.9 L 350.0 241.3 L 352.5 241.6 L 355.0 241.8 L 357.5 242.0 L 360.0 242.0" class="fig-curve fig-accent"/>
<g class="fig-note" text-anchor="middle">
  <text x="135" y="264">T/4</text><text x="210" y="264">T/2</text>
  <text x="285" y="264">3T/4</text><text x="360" y="264">T</text>
</g>
<circle cx="60" cy="18" r="4" class="fig-dot fig-blue"/>
<circle cx="60" cy="130" r="4" class="fig-dot fig-green"/>
<circle cx="60" cy="242" r="4" class="fig-dot fig-accent"/>
<text x="60" y="264" class="fig-note fig-accent" text-anchor="middle">t = 0</text>
</svg>""",
        },
        {
            "after": "Energy in SHM",
            "slug": "fig-w13-energy",
            "caption": "The two energies against position, not time. Potential energy is the "
                       "parabola ½kx², kinetic energy is whatever is left over, and at every single "
                       "position the two add to the same total. The mass is fastest at the centre "
                       "and momentarily still at each end.",
            "caption_tr": "İki enerji, zamana değil konuma karşı. Potansiyel enerji ½kx² "
                          "parabolüdür, kinetik enerji ise geriye kalandır; her konumda ikisi aynı "
                          "toplamı verir. Kütle merkezde en hızlıdır, uçlarda ise bir an için "
                          "durur.",
            # U = E(x/A)^2 and K = E(1-(x/A)^2) sampled exactly; E = 130 px, A = 120 px
            "svg": """<svg viewBox="0 0 400 240" role="img" aria-labelledby="t-en d-en">
<title id="t-en">Potential and kinetic energy against displacement in SHM</title>
<desc id="d-en">A graph against displacement from minus A to plus A. Potential energy is an upward
parabola, zero at the centre and maximum at the ends; kinetic energy is the inverted parabola,
maximum at the centre and zero at the ends. At every position the two add to the same constant
total energy.</desc>
""" + _markers("m13b") + """
<line x1="64" y1="60" x2="336" y2="60" class="fig-dash fig-muted"/>
<text x="396" y="46" class="fig-lab fig-muted" text-anchor="end">E = ½kA²</text>

<line x1="60" y1="190" x2="340" y2="190" class="fig-axis"/>
<line x1="200" y1="196" x2="200" y2="40" class="fig-axis"/>

<path d="M 80.0 60.0 L 82.0 64.3 L 84.0 68.5 L 86.0 72.7 L 88.0 76.8 L 90.0 80.8 L 92.0 84.7 L 94.0 88.6 L 96.0 92.4 L 98.0 96.1 L 100.0 99.7 L 102.0 103.3 L 104.0 106.8 L 106.0 110.2 L 108.0 113.6 L 110.0 116.9 L 112.0 120.1 L 114.0 123.2 L 116.0 126.3 L 118.0 129.3 L 120.0 132.2 L 122.0 135.1 L 124.0 137.9 L 126.0 140.6 L 128.0 143.2 L 130.0 145.8 L 132.0 148.3 L 134.0 150.7 L 136.0 153.0 L 138.0 155.3 L 140.0 157.5 L 142.0 159.6 L 144.0 161.7 L 146.0 163.7 L 148.0 165.6 L 150.0 167.4 L 152.0 169.2 L 154.0 170.9 L 156.0 172.5 L 158.0 174.1 L 160.0 175.6 L 162.0 177.0 L 164.0 178.3 L 166.0 179.6 L 168.0 180.8 L 170.0 181.9 L 172.0 182.9 L 174.0 183.9 L 176.0 184.8 L 178.0 185.6 L 180.0 186.4 L 182.0 187.1 L 184.0 187.7 L 186.0 188.2 L 188.0 188.7 L 190.0 189.1 L 192.0 189.4 L 194.0 189.7 L 196.0 189.9 L 198.0 190.0 L 200.0 190.0 L 202.0 190.0 L 204.0 189.9 L 206.0 189.7 L 208.0 189.4 L 210.0 189.1 L 212.0 188.7 L 214.0 188.2 L 216.0 187.7 L 218.0 187.1 L 220.0 186.4 L 222.0 185.6 L 224.0 184.8 L 226.0 183.9 L 228.0 182.9 L 230.0 181.9 L 232.0 180.8 L 234.0 179.6 L 236.0 178.3 L 238.0 177.0 L 240.0 175.6 L 242.0 174.1 L 244.0 172.5 L 246.0 170.9 L 248.0 169.2 L 250.0 167.4 L 252.0 165.6 L 254.0 163.7 L 256.0 161.7 L 258.0 159.6 L 260.0 157.5 L 262.0 155.3 L 264.0 153.0 L 266.0 150.7 L 268.0 148.3 L 270.0 145.8 L 272.0 143.2 L 274.0 140.6 L 276.0 137.9 L 278.0 135.1 L 280.0 132.2 L 282.0 129.3 L 284.0 126.3 L 286.0 123.2 L 288.0 120.1 L 290.0 116.9 L 292.0 113.6 L 294.0 110.2 L 296.0 106.8 L 298.0 103.3 L 300.0 99.7 L 302.0 96.1 L 304.0 92.4 L 306.0 88.6 L 308.0 84.7 L 310.0 80.8 L 312.0 76.8 L 314.0 72.7 L 316.0 68.5 L 318.0 64.3 L 320.0 60.0" class="fig-curve fig-blue"/>
<path d="M 80.0 190.0 L 82.0 185.7 L 84.0 181.5 L 86.0 177.3 L 88.0 173.2 L 90.0 169.2 L 92.0 165.3 L 94.0 161.4 L 96.0 157.6 L 98.0 153.9 L 100.0 150.3 L 102.0 146.7 L 104.0 143.2 L 106.0 139.8 L 108.0 136.4 L 110.0 133.1 L 112.0 129.9 L 114.0 126.8 L 116.0 123.7 L 118.0 120.7 L 120.0 117.8 L 122.0 114.9 L 124.0 112.1 L 126.0 109.4 L 128.0 106.8 L 130.0 104.2 L 132.0 101.7 L 134.0 99.3 L 136.0 97.0 L 138.0 94.7 L 140.0 92.5 L 142.0 90.4 L 144.0 88.3 L 146.0 86.3 L 148.0 84.4 L 150.0 82.6 L 152.0 80.8 L 154.0 79.1 L 156.0 77.5 L 158.0 75.9 L 160.0 74.4 L 162.0 73.0 L 164.0 71.7 L 166.0 70.4 L 168.0 69.2 L 170.0 68.1 L 172.0 67.1 L 174.0 66.1 L 176.0 65.2 L 178.0 64.4 L 180.0 63.6 L 182.0 62.9 L 184.0 62.3 L 186.0 61.8 L 188.0 61.3 L 190.0 60.9 L 192.0 60.6 L 194.0 60.3 L 196.0 60.1 L 198.0 60.0 L 200.0 60.0 L 202.0 60.0 L 204.0 60.1 L 206.0 60.3 L 208.0 60.6 L 210.0 60.9 L 212.0 61.3 L 214.0 61.8 L 216.0 62.3 L 218.0 62.9 L 220.0 63.6 L 222.0 64.4 L 224.0 65.2 L 226.0 66.1 L 228.0 67.1 L 230.0 68.1 L 232.0 69.2 L 234.0 70.4 L 236.0 71.7 L 238.0 73.0 L 240.0 74.4 L 242.0 75.9 L 244.0 77.5 L 246.0 79.1 L 248.0 80.8 L 250.0 82.6 L 252.0 84.4 L 254.0 86.3 L 256.0 88.3 L 258.0 90.4 L 260.0 92.5 L 262.0 94.7 L 264.0 97.0 L 266.0 99.3 L 268.0 101.7 L 270.0 104.2 L 272.0 106.8 L 274.0 109.4 L 276.0 112.1 L 278.0 114.9 L 280.0 117.8 L 282.0 120.7 L 284.0 123.7 L 286.0 126.8 L 288.0 129.9 L 290.0 133.1 L 292.0 136.4 L 294.0 139.8 L 296.0 143.2 L 298.0 146.7 L 300.0 150.3 L 302.0 153.9 L 304.0 157.6 L 306.0 161.4 L 308.0 165.3 L 310.0 169.2 L 312.0 173.2 L 314.0 177.3 L 316.0 181.5 L 318.0 185.7 L 320.0 190.0" class="fig-curve fig-green"/>

<g class="fig-thin">
  <line x1="80" y1="186" x2="80" y2="194"/><line x1="320" y1="186" x2="320" y2="194"/>
</g>
<g class="fig-note" text-anchor="middle">
  <text x="80" y="210">−A</text><text x="200" y="210">0</text><text x="320" y="210">+A</text>
</g>
<text x="96" y="130" class="fig-lab fig-blue" text-anchor="middle">U</text>
<text x="218" y="86" class="fig-lab fig-green">K</text>
<circle cx="80" cy="60" r="4" class="fig-dot fig-blue"/>
<circle cx="320" cy="60" r="4" class="fig-dot fig-blue"/>
<circle cx="200" cy="60" r="4" class="fig-dot fig-green"/>
<text x="200" y="232" class="fig-note" text-anchor="middle">at every x the two heights add to E</text>
</svg>""",
        },
    ],
}


def for_week(week):
    return FIGURES.get(week, [])
