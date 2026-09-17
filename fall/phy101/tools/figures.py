"""
PHY101 figure library.

Hand-drawn inline SVG for the week notes. Inline rather than image files so the
figures scale, print, and follow the light/dark theme: every colour is a CSS
custom property from assets/site.css, so nothing needs redrawing per theme.

Each entry:
    after    - substring of the heading of the notebook cell it follows
    slug     - stable id, used for the anchor (fig-w2-signs)
    caption  - English caption, shown under the figure
    caption_tr - Turkish caption, shown in the margin
    svg      - the drawing, with a viewBox and no fixed width

Figures are numbered per week by build_site.py (Figure 2.1, 2.2, ...), so the
order here is the order they appear. A figure earns its place only if it shows
something the prose cannot: a sign convention, a geometric relation, a scaling.
"""

# Shared drawing vocabulary. Kept as plain strings so the SVG stays readable.
_DEFS = """<defs>
  <marker id="{pfx}-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="context-stroke"/>
  </marker>
</defs>"""


FIGURES = {

    # ------------------------------------------------------------------ WEEK 1
    1: [
        {
            "after": "Scalars vs. Vectors",
            "slug": "fig-w1-components",
            "caption": "A vector and its components. The components are the sides of a right "
                       "triangle whose hypotenuse is the vector, which is why they are never "
                       "larger than the vector itself.",
            "caption_tr": "Bir vektör ve bileşenleri. Bileşenler, hipotenüsü vektör olan bir "
                          "dik üçgenin kenarlarıdır; bu yüzden hiçbir bileşen vektörün "
                          "kendisinden büyük olamaz.",
            "svg": """<svg viewBox="0 0 420 260" role="img" aria-labelledby="t-comp d-comp">
<title id="t-comp">A vector resolved into horizontal and vertical components</title>
<desc id="d-comp">A vector V at angle theta above the horizontal axis, with a dashed
horizontal component V cosine theta and a dashed vertical component V sine theta forming
a right triangle.</desc>
""" + _DEFS.format(pfx="c") + """
<!-- axes -->
<line x1="40" y1="220" x2="400" y2="220" class="fig-axis"/>
<line x1="40" y1="220" x2="40" y2="20" class="fig-axis"/>
<text x="396" y="240" class="fig-lab" text-anchor="end">x</text>
<text x="26" y="28" class="fig-lab">y</text>

<!-- the triangle -->
<line x1="40" y1="220" x2="300" y2="220" class="fig-dash fig-blue"/>
<line x1="300" y1="220" x2="300" y2="80" class="fig-dash fig-green"/>
<line x1="40" y1="220" x2="300" y2="80" class="fig-vec fig-accent" marker-end="url(#c-ar)"/>

<!-- right-angle mark -->
<path d="M 300 206 L 286 206 L 286 220" class="fig-thin"/>

<!-- angle arc -->
<path d="M 92 220 A 52 52 0 0 0 80 190" class="fig-thin fig-accent"/>
<text x="98" y="205" class="fig-lab fig-accent">θ</text>

<!-- labels -->
<text x="170" y="242" class="fig-lab fig-blue" text-anchor="middle">V cos θ</text>
<text x="312" y="154" class="fig-lab fig-green">V sin θ</text>
<text x="150" y="136" class="fig-lab fig-accent" font-size="15">V</text>

<!-- the point -->
<circle cx="300" cy="80" r="4" class="fig-dot fig-accent"/>
</svg>""",
        },
        {
            "after": "Vector Addition",
            "slug": "fig-w1-tiptotail",
            "caption": "Walking 3 km east then 4 km north. The distance walked is 7 km, but the "
                       "displacement is the third side of the triangle: 5 km. Components add; "
                       "magnitudes do not.",
            "caption_tr": "3 km doğu, sonra 4 km kuzey. Yürünen yol 7 km, ama yer değiştirme "
                          "üçgenin üçüncü kenarıdır: 5 km.",
            "svg": """<svg viewBox="0 0 420 260" role="img" aria-labelledby="t-tt d-tt">
<title id="t-tt">Two displacements added tip to tail</title>
<desc id="d-tt">A 3 kilometre eastward arrow followed by a 4 kilometre northward arrow, with a
5 kilometre resultant arrow closing the triangle from start to finish.</desc>
""" + _DEFS.format(pfx="t") + """
<line x1="40" y1="220" x2="400" y2="220" class="fig-axis"/>
<line x1="40" y1="220" x2="40" y2="20" class="fig-axis"/>
<text x="396" y="240" class="fig-lab" text-anchor="end">east</text>
<text x="20" y="28" class="fig-lab">north</text>

<!-- grid ticks -->
<g class="fig-thin">
  <line x1="130" y1="216" x2="130" y2="224"/><line x1="220" y1="216" x2="220" y2="224"/>
  <line x1="36" y1="150" x2="44" y2="150"/><line x1="36" y1="80" x2="44" y2="80"/>
</g>

<line x1="40" y1="220" x2="220" y2="220" class="fig-vec fig-blue" marker-end="url(#t-ar)"/>
<line x1="220" y1="220" x2="220" y2="80" class="fig-vec fig-green" marker-end="url(#t-ar)"/>
<line x1="40" y1="220" x2="220" y2="80" class="fig-vec fig-accent" marker-end="url(#t-ar)"/>
<path d="M 220 206 L 206 206 L 206 220" class="fig-thin"/>

<text x="130" y="243" class="fig-lab fig-blue" text-anchor="middle">3 km</text>
<text x="232" y="154" class="fig-lab fig-green">4 km</text>
<text x="108" y="140" class="fig-lab fig-accent" font-size="15">5 km</text>
<text x="248" y="196" class="fig-note">not 7 km</text>
<circle cx="40" cy="220" r="4" class="fig-dot"/>
<circle cx="220" cy="80" r="4" class="fig-dot fig-accent"/>
</svg>""",
        },
        {
            "after": "Dot Product",
            "slug": "fig-w1-projection",
            "caption": "The dot product measures how much of one vector lies along another. "
                       "The shaded length is the projection of A on B, equal to A cos θ.",
            "caption_tr": "Skaler çarpım, bir vektörün ne kadarının diğeri boyunca uzandığını "
                          "ölçer. Gölgeli uzunluk A'nın B üzerindeki izdüşümüdür: A cos θ.",
            "svg": """<svg viewBox="0 0 420 220" role="img" aria-labelledby="t-pr d-pr">
<title id="t-pr">Projection of one vector onto another</title>
<desc id="d-pr">Vector A at an angle to vector B, with a perpendicular dropped from the tip of A
onto B marking the projection A cosine theta.</desc>
""" + _DEFS.format(pfx="p") + """
<line x1="50" y1="170" x2="370" y2="170" class="fig-vec fig-blue" marker-end="url(#p-ar)"/>
<text x="360" y="192" class="fig-lab fig-blue" text-anchor="end">B</text>

<line x1="50" y1="170" x2="250" y2="50" class="fig-vec fig-accent" marker-end="url(#p-ar)"/>
<text x="150" y="98" class="fig-lab fig-accent" font-size="15">A</text>

<!-- dropped perpendicular -->
<line x1="250" y1="50" x2="250" y2="170" class="fig-dash"/>
<path d="M 250 156 L 236 156 L 236 170" class="fig-thin"/>

<!-- projection bar -->
<line x1="50" y1="170" x2="250" y2="170" class="fig-proj"/>
<text x="150" y="163" class="fig-lab fig-green" text-anchor="middle">A cos θ</text>

<path d="M 96 170 A 46 46 0 0 0 82 142" class="fig-thin fig-accent"/>
<text x="100" y="158" class="fig-lab fig-accent">θ</text>
<text x="264" y="112" class="fig-note">A sin θ contributes nothing</text>
</svg>""",
        },
    ],

    # ------------------------------------------------------------------ WEEK 2
    2: [
        {
            "after": "The Kinematic Equations",
            "slug": "fig-w2-slope-area",
            "caption": "The two readings that replace memorised formulas. On the position graph "
                       "the slope is the velocity; on the velocity graph the area is the "
                       "displacement. Both work whether or not the acceleration is constant.",
            "caption_tr": "Ezberlenen formüllerin yerini alan iki okuma: konum grafiğinde eğim "
                          "hızdır, hız grafiğinde alan yer değiştirmedir. İkisi de ivme sabit "
                          "olmasa bile geçerlidir.",
            "svg": """<svg viewBox="0 0 440 210" role="img" aria-labelledby="t-sa d-sa">
<title id="t-sa">Slope of a position graph and area under a velocity graph</title>
<desc id="d-sa">Left: a curved position-time graph with a tangent line marking the slope as
velocity. Right: a velocity-time graph with the area beneath it shaded, marking the
displacement.</desc>
<!-- LEFT: x-t, slope -->
<g>
  <line x1="36" y1="170" x2="196" y2="170" class="fig-axis"/>
  <line x1="36" y1="170" x2="36" y2="26" class="fig-axis"/>
  <text x="192" y="190" class="fig-lab" text-anchor="end">t</text>
  <text x="22" y="34" class="fig-lab">x</text>
  <path d="M 36 168 Q 120 160 190 44" class="fig-curve fig-blue"/>
  <!-- tangent -->
  <line x1="92" y1="176" x2="176" y2="96" class="fig-dash fig-accent"/>
  <circle cx="134" cy="136" r="4" class="fig-dot fig-accent"/>
  <text x="104" y="74" class="fig-lab fig-accent">slope = v</text>
</g>
<!-- RIGHT: v-t, area -->
<g transform="translate(232,0)">
  <line x1="36" y1="170" x2="196" y2="170" class="fig-axis"/>
  <line x1="36" y1="170" x2="36" y2="26" class="fig-axis"/>
  <text x="192" y="190" class="fig-lab" text-anchor="end">t</text>
  <text x="22" y="34" class="fig-lab">v</text>
  <path d="M 36 150 L 160 60 L 160 170 L 36 170 Z" class="fig-fill"/>
  <path d="M 36 150 L 190 38" class="fig-curve fig-green"/>
  <text x="84" y="146" class="fig-lab fig-green">area = Δx</text>
</g>
</svg>""",
        },
        {
            "after": "Free Fall",
            "slug": "fig-w2-signs",
            "caption": "A ball thrown straight up, at three moments. The velocity arrow shrinks, "
                       "vanishes, then reverses — but the acceleration arrow never changes. At the "
                       "top the velocity is zero and the acceleration is still 9.81 m/s² downward.",
            "caption_tr": "Yukarı atılan bir top, üç anda. Hız oku kısalır, kaybolur, sonra yön "
                          "değiştirir; ama ivme oku hiç değişmez. Tepede hız sıfırdır, ivme hâlâ "
                          "aşağı doğru 9.81 m/s²'dir.",
            "svg": """<svg viewBox="0 0 440 250" role="img" aria-labelledby="t-sg d-sg">
<title id="t-sg">Velocity and acceleration of a ball thrown straight up</title>
<desc id="d-sg">Three snapshots of a ball: rising with an upward velocity arrow, at the top with
no velocity arrow, and falling with a downward velocity arrow. In all three the acceleration
arrow points down and has the same length.</desc>
""" + _DEFS.format(pfx="s") + """
<!-- positive direction -->
<line x1="28" y1="215" x2="28" y2="45" class="fig-vec fig-muted" marker-end="url(#s-ar)"/>
<text x="38" y="52" class="fig-note">+ up</text>
<line x1="20" y1="220" x2="420" y2="220" class="fig-axis"/>

<!-- rising -->
<g transform="translate(120,0)">
  <circle cx="0" cy="130" r="11" class="fig-ball"/>
  <line x1="0" y1="124" x2="0" y2="74" class="fig-vec fig-green" marker-end="url(#s-ar)"/>
  <text x="10" y="80" class="fig-lab fig-green">v</text>
  <line x1="-34" y1="120" x2="-34" y2="170" class="fig-vec fig-accent" marker-end="url(#s-ar)"/>
  <text x="-58" y="150" class="fig-lab fig-accent">a</text>
  <text x="0" y="244" class="fig-note" text-anchor="middle">rising</text>
</g>
<!-- at the top -->
<g transform="translate(240,0)">
  <circle cx="0" cy="66" r="11" class="fig-ball"/>
  <text x="14" y="64" class="fig-lab fig-green">v = 0</text>
  <line x1="-34" y1="56" x2="-34" y2="106" class="fig-vec fig-accent" marker-end="url(#s-ar)"/>
  <text x="-58" y="86" class="fig-lab fig-accent">a</text>
  <text x="0" y="244" class="fig-note" text-anchor="middle">at the top</text>
</g>
<!-- falling -->
<g transform="translate(360,0)">
  <circle cx="0" cy="130" r="11" class="fig-ball"/>
  <line x1="0" y1="136" x2="0" y2="186" class="fig-vec fig-green" marker-end="url(#s-ar)"/>
  <text x="10" y="182" class="fig-lab fig-green">v</text>
  <line x1="-34" y1="120" x2="-34" y2="170" class="fig-vec fig-accent" marker-end="url(#s-ar)"/>
  <text x="-58" y="150" class="fig-lab fig-accent">a</text>
  <text x="0" y="244" class="fig-note" text-anchor="middle">falling</text>
</g>
<text x="230" y="26" class="fig-lab" text-anchor="middle">a is the same arrow in all three</text>
</svg>""",
        },
        {
            "after": "Braking Distance",
            "slug": "fig-w2-vsquared",
            "caption": "Stopping distance goes as the square of the speed, because the kinetic "
                       "energy to be removed does. Twice the speed is four times the distance, not "
                       "twice — the single most useful consequence of this week.",
            "caption_tr": "Durma mesafesi süratin karesiyle artar. İki kat sürat, iki kat değil "
                          "dört kat mesafe demektir — bu haftanın en işe yarar sonucu.",
            "svg": """<svg viewBox="0 0 440 200" role="img" aria-labelledby="t-vs d-vs">
<title id="t-vs">Stopping distance at one, two and three times a reference speed</title>
<desc id="d-vs">Three horizontal bars showing stopping distance growing as the square of speed:
one unit at v, four units at two v, nine units at three v.</desc>
<g class="fig-bar-g">
  <text x="8" y="44" class="fig-lab">v</text>
  <rect x="42" y="30" width="38" height="20" class="fig-bar"/>
  <text x="90" y="45" class="fig-note">1 unit</text>

  <text x="8" y="104" class="fig-lab">2v</text>
  <rect x="42" y="90" width="152" height="20" class="fig-bar"/>
  <text x="204" y="105" class="fig-note">4 units</text>

  <text x="8" y="164" class="fig-lab">3v</text>
  <rect x="42" y="150" width="342" height="20" class="fig-bar"/>
  <text x="394" y="165" class="fig-note">9 units</text>
</g>
</svg>""",
        },
    ],
}


def for_week(week):
    return FIGURES.get(week, [])
