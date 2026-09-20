# PHYSICA — Teacher's Guide

*How to teach with the portal in Physics for Scientists and Engineers (PHYS 101/102)*

---

## How to use this guide

The guide has four parts. **Part I** explains what the site is for and how it fits a semester. **Part II** is the substance: lecture notes for all 27 milestones, era by era, with the history, the anecdotes (and which of them are legend), board-level derivations, worked numbers, demonstrations and the questions students ask. **Part III** contains the session plans for the four labs and the activities for the matrix, the equations and the self-test. **Part IV** covers assessment, a term project with its rubric, a misconception bank and logistics. The appendices hold reference tables of every lab readout, an English–Turkish glossary, a chronology, and a reading list of reliable histories.

Every number in the lecture notes and demo scripts was checked against the running site, so you can read them aloud with confidence: when a student fires the cannon at 9.00 km/s, the readout will say apogee 8558 km and period 187.5 min.

---

# Part I — Teaching with the portal

## 1. What the site is for

Textbooks present physics as finished: definitions, laws, worked examples, problems. Students learn to *use* the equations without ever learning *why anyone needed them*. PHYSICA supplies the missing layer. Every milestone card follows one narrative shape:

1. **The crisis** — what physicists could not explain or engineers could not build.
2. **The breakthrough** — the idea that resolved it, with its governing equation.
3. **The engineering legacy** — the industry, device or design method that exists because of it.

Three pedagogical commitments follow from that shape.

**Crisis before law.** When students meet a crisis first, they are in the same position as the historical scientist and can try to solve it themselves. Retrieval of a law is stronger when it was preceded by a question the student personally could not answer. In practice this means: show the crisis, hide the breakthrough, ask the room.

**Engineering as the destination, not the afterthought.** Mechatronics and engineering students accept abstraction more willingly when they can see the actuator, sensor or structure at the end of the chain. Every card and lab ends in a device. Use those endings; they are the reason the course exists for your students.

**Equations as sentences.** The Master Equation Inspector treats an equation as a statement to be read aloud, symbol by symbol, with units. Students who can read $\nabla\times\vec{E} = -\partial\vec{B}/\partial t$ as "a changing magnetic field curls an electric field into existence" will not confuse it with Ampère's law on an exam.

**What the site is not.** It is not a problem bank and not a replacement for the textbook's drill. It gives the *why*; Young & Freedman gives the *how much*. The syllabus map at the bottom of the page connects the two, module by module.

---

## Physical meaning routine for PHY101

Use the [course-wide approach](../../TEACHING_APPROACH.md) with every selected milestone: identify the physical question, draw its geometry, explain what the operation measures, predict a sign or trend, and then inspect the equation and evidence. For Newton, distinguish net force from velocity; for energy, distinguish transferred work from transfer rate; for rotation, show the perpendicular lever arm. Ask what observation could distinguish the proposed model from another explanation.

The portal also covers PHY102 and later physics. Those cards remain optional context for PHY101 and do not enlarge its common-exam scope. Modern vector notation can explain an older discovery without implying the historical author used that notation. Historical chronology and evidence should not be replaced by a present-day analogy.

**TR:** Önce fiziksel soru, şekil ve işlemin anlamı; sonra tahmin, denklem ve kanıt. Portalın ileri konuları PHY101 ortak sınav kapsamını genişletmez.

## 2. Orientation for instructors

### 2.1 The modules at a glance

| Module | What it contains | Typical class use | Time |
|---|---|---|---|
| **Timeline** | 27 milestone cards in 6 eras; filter by era or field; full-text search; a deep-dive dialog per card | Opening a topic: read the crisis, discuss, reveal | 5–15 min per card |
| **Labs** | 4 simulations on real equations and constants: Newton's cannon, Maxwell's wave, Carnot cycle, Bohr atom | Predict–observe–explain demos; small-group exploration | 20–45 min each |
| **Engineering matrix** | 8 disciplines mapped to their physical foundations and daily-use equations | First week (motivation); before choosing project topics | 10–20 min |
| **Master equations** | 14 equations dissected: symbol, SI unit, meaning, intuition, use | Equation-reading drills; dimensional analysis | 5 min per equation |
| **Self-test** | 15 conceptual multiple-choice questions with explanations; keyboard A–D; end-of-test review | Clicker-style polling; pre/post diagnostic; homework | 25–40 min for all 15 |
| **Syllabus map** | Module → textbook chapters → pioneers → paradigms → engineering bridge | Course planning; "where are we" orientation | 2 min |
| **Study notes / Print** | Markdown export of everything; print stylesheet for handouts | Revision packs; offline reading | — |

### 2.2 Classroom technical checklist

- **Browser.** Any current Chrome, Edge, Firefox or Safari. The page is a single file; nothing to install.
- **Internet.** Needed for equation rendering (KaTeX) and fonts. Without it the page works but equations show as raw LaTeX (`\frac{GM}{r^2}`). If your classroom network is unreliable, see §17.1 for the offline option.
- **Projector.** The theme is dark. On a weak projector, raise the browser zoom to 125–150 % (Ctrl/Cmd +) and dim the room lights; the simulations are drawn with high-contrast colours and stay legible. Alternatively press **Print** in the footer and project the print preview for a light-background version of the cards.
- **Keyboard shortcuts worth knowing.** Esc closes any dialog. In the labs, ← → move between tabs once a tab has focus. In the self-test, A–D answer and Enter advances — useful for polling without touching the mouse.
- **Mobile.** The site works on phones; students can run the labs on their own devices during class. The nav collapses to a menu button.

### 2.3 A five-minute first-day introduction (script)

1. Open the page. Let the hero animation run for ten seconds and ask: *"What is the yellow dot? What are the wedges?"* (The Sun at a focus; the area each planet sweeps in the same time interval — Kepler's second law, live. Note that outer planets move slower: $T^2\propto a^3$.) This tells students the site will show them physics, not decorate it.
2. Scroll to the timeline. Click the **1785–1890s** era and say: *"Everything that makes your phone work was discovered by these five people, before anyone had a light bulb."*
3. Open the **Labs** tab and fire the cannon at the **Circular** preset. *"This is the ISS. Nothing holds it up. By week 6 you will be able to explain why."*
4. Open the **Engineering matrix** and click their discipline (Mechatronics & Control is first). *"These four boxes are your degree."*
5. Tell them where the self-test is, that it is not graded, and that the study notes button downloads everything as a text file they can search.

### 2.4 Text you can paste into the LMS for students

> **PHYSICA** is our course companion: https://\<your-username\>.github.io/\<repo\>/
> Use it in three ways. (1) Before each lecture, read the milestone cards listed in the weekly plan — the *crisis* paragraph is the question we will start class with. (2) After each lab session, repeat the simulation on your own device and complete the worksheet. (3) Before each exam, take the self-test until you can explain why every wrong option is wrong, not just which option is right. The **Download study notes** button gives you the whole site as a Markdown file for offline revision.

---

## 3. Fitting the site into a semester

### 3.1 Model A — weekly companion (two-semester sequence)

The syllabus map on the site defines eight modules. The plan below assigns them to a 14-week PHYS 101 (mechanics, oscillations and waves, thermodynamics) and a 14-week PHYS 102 (electromagnetism, optics, modern physics). Adjust the week numbers to your own calendar; the site content does not change.

**PHYS 101**

| Week | Textbook module (site) | Milestone cards to assign | Lab / activity | Self-test items |
|---|---|---|---|---|
| 1 | Module 1 — Kinematics | Archimedes, Copernicus, Galileo | Engineering matrix tour; hero (Kepler II) | — |
| 2 | Module 1 — Newton's laws | Newton (Principia) | Cannon lab, part 1 (sub-orbital shots only) | Q1 |
| 3 | Module 2 — Work, energy | Joule (first law, as energy accounting) | Equation inspector: Newton II, First Law | — |
| 4 | Module 2 — Momentum, rotation | Kepler (2nd law = angular momentum) | Hero animation as a demo of $L$ conservation | Q7 (preview) |
| 5 | Module 3 — Gravitation | Kepler, Newton, General relativity (GPS only) | **Cannon lab, full session** (§11.1) | Q4 |
| 6 | Module 3 — Fluids | Archimedes, Bernoulli & Euler | Equation inspector: Bernoulli (matrix, Mechanical) | Q11 |
| 7 | Module 2/4 — Analytical mechanics, SHM | Hooke & Huygens, Lagrange & Hamilton | Equation inspector: Euler–Lagrange | Q7, Q15 |
| 8 | Module 4 — Waves | Young & Fresnel (interference), Fourier | Equation inspector: Wave equation | Q13 |
| 9 | Module 5 — Temperature, heat | Fourier (heat equation), Joule | — | — |
| 10 | Module 5 — First law, gases | Joule & Mayer | Carnot lab, part 1 (isothermal stroke only) | — |
| 11 | Module 5 — Second law | Carnot, Clausius & Kelvin | **Carnot lab, full session** (§11.3) | Q3 |
| 12 | Module 5 — Statistical view | Boltzmann & Gibbs | Equation inspector: $S = k_B\ln\Omega$ | Q5 |
| 13 | Review | Era strip: Antiquity–1638, 1660–1834, 1822–1900s | Self-test in class (items 1, 3, 5, 7, 11, 13, 15) | — |
| 14 | Project presentations | — | Milestone-card project (§15.1) | — |

**PHYS 102**

| Week | Textbook module (site) | Milestone cards to assign | Lab / activity | Self-test items |
|---|---|---|---|---|
| 1 | Module 6 — Charge, Coulomb, Gauss | Coulomb & Gauss | Equation inspector: Gauss's law | Q14 |
| 2 | Module 6 — Potential, capacitance | Coulomb & Gauss (deep dive) | Matrix: Electrical engineering | — |
| 3 | Module 6 — Current, circuits | Coulomb & Gauss (Volta, Ohm in deep dive) | Matrix: Mechatronics (motor equations) | — |
| 4 | Module 6 — Magnetism | Faraday (Ørsted, Ampère) | — | — |
| 5 | Module 6 — Induction | Faraday | Equation inspector: Faraday's law | Q10 |
| 6 | Module 6 — Maxwell's equations | Maxwell, Hertz & Tesla | **Maxwell lab, full session** (§11.2) | Q2 |
| 7 | Module 7 — EM waves, light | Maxwell, Young & Fresnel | Maxwell lab (refractive index) | — |
| 8 | Module 7 — Interference, diffraction | Young & Fresnel, LIGO | Equation inspector: Ampère–Maxwell | Q12 |
| 9 | Module 8 — Relativity | Special relativity, General relativity | Cannon lab revisited (GPS clocks discussion) | Q4 |
| 10 | Module 8 — Photons | Planck, Einstein (photoelectric) | — | Q8 |
| 11 | Module 8 — Atoms | Bohr | **Bohr lab, full session** (§11.4) | — |
| 12 | Module 8 — Quantum mechanics | de Broglie, Schrödinger & Heisenberg | Equation inspector: Schrödinger, Uncertainty | Q6 |
| 13 | Module 8 — Solids, devices | The transistor; Matrix: Computer engineering | — | Q9 |
| 14 | Review | Era strip: 1900–present | Full self-test; study-notes export | all |

### 3.2 Model B — flipped

Assign two cards per lecture as pre-reading, with one written question due before class: *"State the crisis in your own words and propose one way you would have tried to solve it."* Open class by reading three student proposals aloud (anonymously), then reveal the breakthrough. This costs ten minutes and consistently produces the most engaged first ten minutes of a lecture, because students have already committed to a position.

### 3.3 Model C — four lab workshops

If lecture time is scarce, run the four labs as 45-minute workshops in weeks 5, 11 (PHYS 101) and 6, 11 (PHYS 102), using the session plans in §11. Each plan has a worksheet with an answer key.

### 3.4 Model D — a single "history of physics for engineers" lecture

For a seminar or the last week of a course: era strip (5 min per era, one card each), the cannon and Bohr labs (10 min each), the matrix for their discipline (5 min). Ninety minutes.

---

## 4. Teaching the timeline

### 4.1 The crisis-first routine (8–12 minutes per card)

1. **Project the card, cover the breakthrough.** Scroll so that only the year, title, pioneers and *The crisis* paragraph are visible. Read the crisis aloud.
2. **Ask the room to solve it.** *"You are Carnot. Every engine in France wastes 97 % of its coal. What experiment would you do?"* Take three answers. Do not evaluate them yet.
3. **Reveal the breakthrough.** Scroll down. Ask which student proposal was closest. Usually one is; say so.
4. **Read the equation aloud as a sentence.** For $\eta = 1 - T_C/T_H$: "The best possible efficiency is one minus the ratio of the temperatures. Nothing about the gas, the piston, or the engineer's skill appears."
5. **End on the legacy.** Read *Engineering legacy* and ask for one device in the room that depends on it.
6. **Assign the deep dive** as reading; it contains the material that will appear in the next problem set.

### 4.2 Era-level discussion prompts

Click an era in the strip to filter the cards; each prompt below works with the cards it shows.

- **Antiquity – 1638 (The Geometric & Empirical Dawn).** *Why did it take 1,900 years to go from Archimedes to Galileo?* (Aristotle's authority; no quantitative measurement of time — Galileo used water clocks and inclined planes to slow motion down.) Ask what a "water clock" limits you to measuring.
- **1660 – 1834 (Classical Synthesis).** *Hooke's law, Bernoulli's equation and Newton's laws all look like different physics. What single idea do they share?* (Conservation of energy, before anyone had named it.)
- **1785 – 1890s (The Field Paradigm).** *Faraday could not do calculus. How did he beat the mathematicians?* (Lines of force: a picture that turned out to be the correct concept, which Maxwell then formalised.) Link to how engineers sketch field lines in motor design today.
- **1822 – 1900s (Thermodynamic Revolution).** *Carnot's engine is imaginary and cannot be built. Why is it the most important engine in history?* (It sets the ceiling every real engine is judged against.)
- **1905 – 1916 (Relativity).** *If GPS engineers ignored Einstein, how long before the system was useless?* (About a day for 11 km of error — card: General relativity.)
- **1900 – present (Quantum Realm).** *Which card describes the most-manufactured object in human history?* (The transistor: more than $10^{22}$ have been made.)

### 4.3 Search scavenger hunt (10 minutes, pairs)

Give pairs five search terms and ask which card each leads to and why the term appears there. Good sets: `entropy`, `Michelson`, `Lenz`, `Kutta`, `Ehrenfest`; or `377`, `13.6`, `4.184`, `38.7`, `1.12` (numbers only — students must recognise $Z_0$, hydrogen's ionisation energy, the mechanical equivalent of heat, the GPS clock drift, silicon's bandgap).

### 4.4 Card critique (homework, 30 minutes)

Assign one card per student with the instruction: *"Find one claim on this card and verify it against your textbook or a primary source. Report the claim, the source, and whether the card is correct, incomplete or wrong."* Students learn that an authoritative-looking web page can be checked, and you collect a free audit of the content. The Planck card is a good example to show first: it now states that the "ultraviolet catastrophe" was named only in 1911 and was not Planck's motivation — a correction to what most textbooks say.

---

# Part II — Lecture notes

These are lecture notes in the plain sense: what to say, in what order, with the numbers already worked out. Each milestone follows the same shape so that you can teach any of them in 20–30 minutes or expand it to a full session:

- **Hook** — a true story to open with. Where a popular anecdote is legend, the notes say so; students should learn that too.
- **The setting** and **The crisis** — the state of knowledge and the problem that could not be solved.
- **The idea, on the board** — the reasoning, at first-year level, in the order a board plan should follow.
- **Numbers for the board** — a worked example, usually with a mechatronics flavour, using the same constants as the site.
- **Demonstrations** — things that can be done in a lecture theatre with cheap equipment.
- **Questions students ask** — the two or three that come up every year, with answers.
- **The engineering bridge** — the device or design method that exists because of this idea.
- **On the site** — which card, lab and self-test item to use.

Dates are the dates of publication unless stated. Quotations older than a century are given in translation where needed; later remarks are paraphrased.

---

## 5. Era 1 — The Geometric and Empirical Dawn (Antiquity to 1638)

**Lecture at a glance.** One 90-minute lecture or two 45-minute sessions. Objectives: students can state Archimedes' law of the lever and principle of buoyancy; explain retrograde motion as an effect of reference frame; state Kepler's three laws and connect the second to angular momentum; describe how Galileo measured acceleration and why the results overthrew Aristotle. Board plan: (1) lever and buoyancy from equilibrium; (2) the two frames, geocentric and heliocentric, and the synodic-period formula; (3) Kepler's laws with the ellipse drawn; (4) $d \propto t^2$ from the inclined plane.

The theme to state at the start: for two thousand years physics was *geometry plus observation*, with no concept of force as a cause of acceleration. Everything in this era is either a statement about equilibrium (Archimedes), about the shape of paths (Copernicus, Kepler), or about how distance grows with time (Galileo). The word "why" is only asked seriously by Newton, in the next era.

### 5.1 Archimedes: statics, levers and buoyant forces (c. 250 BCE)

**Hook.** The bath and the shout of "Eureka" come from Vitruvius, a Roman writing two centuries after the event, and the story as told cannot be right: the volume of gold displaced by a wreath is far too small to measure by watching a water level rise. Galileo, in a short essay written when he was 22 (*La Bilancetta*, 1586), argued that Archimedes must have used a hydrostatic balance: weigh the crown in air, weigh it in water, and the ratio gives its density directly. That is the version to teach, because it is the version that works and because it shows a second great physicist reading the first one critically. What is not legend is the ending: Archimedes was killed by a Roman soldier when Syracuse fell in 212 BCE, and Cicero later found his tomb by looking for the sphere-in-a-cylinder he had asked to be carved on it, the result he was proudest of.

**The setting.** Greek natural philosophy explained motion by purpose: heavy things move down because "down" is their natural place. Archimedes did something different. In *On the Equilibrium of Planes* he starts from axioms ("equal weights at equal distances balance") and *derives* the law of the lever; in *On Floating Bodies* he derives buoyancy. It is the first physics done in the style of Euclid, and the first that an engineer could use.

**The crisis.** Practical: how do you know whether a ship will float upright, whether a crane will lift a block, whether a crown is pure gold? Conceptual: there was no idea that a quantitative rule connected weight, distance and equilibrium at all.

**The idea, on the board.**

1. *The lever.* Draw a beam on a fulcrum with weights $F_1$ at distance $d_1$ and $F_2$ at $d_2$. Archimedes' argument is a symmetry argument: replace each weight by many equal unit weights spread evenly about its position; the whole collection balances when its centre of symmetry is over the fulcrum. Result: $F_1 d_1 = F_2 d_2$. Point out that this is the first appearance of *torque*, and that the "centre of symmetry" is what we now call the centre of gravity, another Archimedean invention.
2. *Buoyancy.* Draw a cube of side $a$ submerged with its top at depth $h$. Pressure on the top face is $\rho g h$, on the bottom face $\rho g (h + a)$. The net upward force is $\rho g a \cdot a^2 = \rho g V$: the weight of the displaced fluid. Archimedes did not have the pressure argument (that is Stevin and Pascal, 1600s); he reasoned from the equilibrium of the fluid itself. Both routes are worth showing.
3. *The hydrostatic balance.* Weight in air $W$, apparent weight in water $W'$. Then $W - W' = \rho_w g V$, so the density is $\rho = \rho_w \, W/(W - W')$. This is how densities were measured for the next two thousand years.

**Numbers for the board.** An underwater inspection robot has a hull volume of 12.0 L and a mass of 11.5 kg. Buoyant force $= 1000 \times 0.012 \times 9.81 = 117.7$ N; weight $= 112.8$ N; net $+4.9$ N upward, so it floats gently and its thrusters must push it down. Ask what happens in seawater ($\rho = 1025$ kg/m³): the net force rises to 7.9 N, which is why the same ROV needs ballast at sea. Then the crown: a 1.000 kg "gold" wreath that weighs 0.937 kg in water has density $1000 \times 1/(1 - 0.937) = 15{,}900$ kg/m³, well below gold's 19,300, so it is alloyed with silver (10,500).

**Demonstrations.** A metre rule on a pencil with coins at measured distances, to see $F_1 d_1 = F_2 d_2$ to three significant figures. A Cartesian diver (a pipette weighted to float in a squeezed plastic bottle) for buoyancy and compressibility. A kitchen scale reading changing when a submerged finger is dipped into a beaker of water on it: the scale reads the buoyant force pushed back down on the water, Newton's third law arriving 1,900 years early.

**Questions students ask.** *Why does a steel ship float?* Because what matters is the average density of the volume it displaces, hull plus air; a ship is a steel shell around a lot of air. *Does the buoyant force depend on depth?* No, as long as the object is fully submerged and the fluid is incompressible: the pressure difference between top and bottom depends only on the object's height. (At great depth water's compressibility matters slightly; that is how the Cartesian diver sinks.)

**The engineering bridge.** Naval architecture begins here: a ship's stability is analysed with the metacentric height, which is Archimedes' centre of gravity and centre of buoyancy in conversation. Hydraulic presses (Pascal) multiply force with the same logic as the lever. In mechatronics, the lever is every gear ratio, every linkage and every robotic gripper: mechanical advantage is torque balance.

**On the site.** Card *Archimedes*; Engineering matrix, Civil (Hydrostatics). No lab; the cannon lab's "why does it stay up" question is the natural sequel two weeks later.

### 5.2 Copernicus: the reference-frame revolution (1543)

**Hook.** The tradition, from a letter written by his friend Tiedemann Giese within weeks of the event, is that Copernicus was shown the first printed copy of *De revolutionibus orbium coelestium* on the day he died, 24 May 1543, after a stroke had left him barely conscious. What he certainly did not see was the anonymous preface that the Lutheran theologian Andreas Osiander had slipped into the front, telling readers that the heliocentric arrangement was only a calculating device and need not be true. For decades readers assumed the preface was Copernicus's own; it was Kepler who exposed the substitution in 1609. The book itself had been circulating in outline since about 1514, and Copernicus, a canon in Frombork who also practised medicine and advised on currency reform, had hesitated for thirty years to publish.

**The setting.** Ptolemy's *Almagest* (c. 150 CE) predicted planetary positions with epicycles, deferents and the equant, and it worked to about the accuracy of naked-eye observation. That is the point to make: the geocentric system was not stupid, it was a successful model that had grown complicated. Copernicus's system, students are surprised to learn, used circles and epicycles too, and roughly as many of them; its advantage was not fewer parts but a *natural* explanation of two things Ptolemy had to build in by hand.

**The crisis.** Retrograde motion: every outer planet periodically stops, drifts backwards for weeks, then resumes. Ptolemy modelled this with an epicycle per planet. And the order and distances of the planets were undetermined: Ptolemy could scale each planet's orbit independently.

**The idea, on the board.**

1. Draw the Sun, the Earth's orbit and Mars's orbit. Mark the Earth at five successive positions as it overtakes Mars on the inside. Draw the lines of sight; where they land on a distant background, Mars's apparent position reverses. Retrograde motion is *parallax caused by our own motion*: nothing in the sky moves backwards.
2. Because all retrograde loops are now explained by one motion (the Earth's), the ratios of the planets' distances follow from the geometry: the heliocentric system fixes the *scale* of the solar system in units of the Earth–Sun distance. Copernicus got the relative distances essentially right.
3. The synodic-period formula. If the Earth's period is $T_\oplus$ and the planet's is $T$, the time between successive oppositions $T_{syn}$ satisfies $1/T_{syn} = |1/T_\oplus - 1/T|$: the two hands of a clock overlap when the fast one has gained a full lap on the slow one. This is the first equation on the site's timeline, and it is a change-of-frame calculation.

**Numbers for the board.** Mars returns to opposition every 780 days. Then $1/T = 1/365.25 - 1/780 = 0.0014556$ per day, so $T = 687$ days: Copernicus could compute the true orbital period of Mars from the Earth. Do the same for Venus (synodic 584 d, inner planet, so the sign flips): $1/T = 1/365.25 + 1/584$, giving $T = 225$ days.

**Demonstrations.** Two students walking around a lamp on the floor at different radii, the inner one faster; the outer student, watched from the inner one against the wall behind, appears to reverse as they are passed. Ten minutes, and nobody who has done it ever confuses retrograde motion again.

**Questions students ask.** *If the Earth moves, why don't we feel it?* The answer is Galileo's relativity, two milestones later; promise it. *Was Copernicus right that the Sun is the centre?* Only of the solar system, and the orbits are ellipses (Kepler) with the Sun at a focus, not circles centred on it. The important idea that survived is that the *choice of frame* is a choice, and that some choices make the physics simple.

**The engineering bridge.** Reference frames are the daily bread of mechatronics: a robot's tool position is transformed from joint frames to the base frame with exactly the rotation-and-translation logic Copernicus used; a satellite navigation receiver converts between Earth-centred inertial and Earth-fixed frames; an inertial measurement unit reports accelerations in the body frame and the control software rotates them into the world frame. Choosing the frame in which the motion is simplest is a design decision, not a fact of nature.

**On the site.** Card *Copernicus*; the hero animation shows a heliocentric frame. Self-test: none directly; Q7 (Lagrangian mechanics) is the later payoff of "choose coordinates wisely".

### 5.3 Kepler: the geometry of celestial orbits (1609–1619)

**Hook.** Kepler came to Prague in 1600 to work for Tycho Brahe, who owned the best planetary observations in the world and guarded them jealously; Tycho died the next year and Kepler inherited the data. (Tycho's famous metal nose was real; the long-standing rumour that he was poisoned with mercury was tested by exhuming him in 2010 and found to be false.) Kepler's first assignment was the orbit of Mars. He fitted circles for years and got to within 8 arcminutes of the observations, better than any astronomer before him. Then he threw the fit away, because Tycho's instruments were good to 2 arcminutes and 8 was therefore an error. *Astronomia Nova* (1609) says that these eight minutes alone pointed the way to a reform of all astronomy. That sentence is the birth of modern data analysis: the model must fit within the measurement uncertainty, or the model is wrong. Tell students that the same Kepler spent six years defending his mother against a charge of witchcraft, published the first mathematical treatment of why snowflakes have six-fold symmetry (1611), and worked out the volumes of wine barrels (1615) with a method that anticipates integral calculus.

**The setting.** Copernicus had moved the Sun to the centre but kept uniform circular motion, the Greek ideal. Kepler was convinced the Sun physically drove the planets, and guessed a force falling off as $1/r$ (wrong, but the first proposal that a *force* explains an orbit).

**The crisis.** No combination of circles reproduced Mars's positions to Tycho's accuracy. Either the observations were wrong or circles were.

**The idea, on the board.**

1. *First law.* The orbit is an ellipse with the Sun at one focus. Draw it with the two foci marked and define eccentricity $e = c/a$. Mars has $e = 0.093$: its orbit is nearly circular, but the Sun is displaced from the centre by 9 % of the radius, which is what the 8 arcminutes were detecting.
2. *Second law.* The line from Sun to planet sweeps equal areas in equal times. Derive its modern meaning: for a central force, torque about the Sun is zero, so angular momentum $L = m r^2 \dot\theta$ is constant; the area swept per unit time is $\tfrac{1}{2} r^2 \dot\theta = L/2m$. Kepler found the law empirically in 1602, before he had the ellipse; the physics behind it waited for Newton.
3. *Third law.* $T^2 \propto a^3$, found on 15 May 1618 after a false start on 8 March, as Kepler records in *Harmonices Mundi*. Show where it comes from for a circular orbit: $GMm/r^2 = m v^2/r$ and $v = 2\pi r/T$ give $T^2 = 4\pi^2 r^3/GM$. The constant is the same for every body orbiting the same central mass, which is why the law lets you weigh the Sun, or a planet, or a star with an exoplanet.

**Numbers for the board.** Geostationary orbit: $T = 86{,}164$ s (one sidereal day), so $r = (GM T^2/4\pi^2)^{1/3} = 42{,}164$ km, an altitude of 35,786 km. Every television satellite sits at that radius because of a law found in 1618. Second example, from the site's hero animation: a planet at $e = 0.65$ moves $\,(1+e)/(1-e) = 4.7$ times faster at perihelion than at aphelion, straight from $L = m r v_\perp$ being constant.

**Demonstrations.** Draw an ellipse on the board with two pins (or two students' fingers) and a loop of string; the geometry is obvious once seen. Then the hero animation on the site: pause it and ask which planet is moving fastest and why. A rotating stool with dumbbells for angular momentum conservation, to give Kepler's second law a body.

**Questions students ask.** *Why an ellipse and not some other oval?* For planetary gravity, the inverse-square central force gives closed Kepler ellipses for all bound initial conditions; other power laws generally make the orbit precess rather than close. This is Newton's answer, and the site's cannon lab draws the predicted conic analytically from each launch speed. *Is the Sun really at the focus?* At the common centre of mass, which for the Sun and Jupiter lies just outside the Sun's surface; that wobble is how the first exoplanets were detected.

**The engineering bridge.** Orbital mechanics is applied Kepler: launch windows, Hohmann transfers (two burns, two ellipses), constellation design for GPS and Starlink, and the transit-timing analysis that finds planets around other stars from the interval between dips in a star's brightness.

**On the site.** Card *Kepler*; hero animation; cannon lab (§11.1) shows the analytic ellipse; self-test Q4 (GPS) uses orbital radius.

### 5.4 Galileo: quantitative kinematics and falling bodies (1638)

**Hook.** Galileo almost certainly never dropped weights from the Leaning Tower of Pisa; the story appears only in a biography by his last pupil, Viviani, written after his death. Someone did drop weights, though: in 1586 the Flemish engineer Simon Stevin and his friend Jan de Groot dropped two lead balls, one ten times heavier than the other, about ten metres from a church tower in Delft, and reported that they hit the planks below with a single thud. Galileo's real experiment was slower and cleverer. He rolled bronze balls down a grooved inclined plane to dilute gravity, timed them with a water clock (weighing the water that flowed while the ball rolled), and found that the distances covered in successive equal intervals were in the ratio 1 : 3 : 5 : 7. The story that he timed the runs by singing is a modern conjecture. Also worth telling: the *Discorsi* of 1638, the book that contains all this, was published in Protestant Leiden because its author was under house arrest in Arcetri after his 1633 trial, and "eppur si muove" is a phrase first attributed to him a century later.

**The setting.** Aristotle's physics held that heavier bodies fall proportionally faster and that motion requires a continued push. Both are what everyday experience with air and friction suggests. Galileo's achievement was to see through the friction to the law.

**The crisis.** Nobody could say *how* a body falls, only that it does. Without a quantitative law of motion there is no ballistics, no theory of machines, no way to compare a cart and a cannonball.

**The idea, on the board.**

1. *The thought experiment.* Tie a heavy stone H to a light one L. If heavy things fall faster, L should slow H down, so the pair falls slower than H alone. But the pair is heavier than H, so by the same rule it should fall faster. Contradiction; the only escape is that all bodies fall alike. Let students find the contradiction themselves; it is the site's self-test Q1.
2. *Odd-number rule to* $d \propto t^2$. Distances in successive seconds 1, 3, 5, 7 give cumulative distances 1, 4, 9, 16: $d \propto t^2$. From $d = \tfrac{1}{2} a t^2$ the acceleration is constant. On an incline of angle $\theta$ the acceleration is $g\sin\theta$, so extrapolating to $\theta = 90°$ gives free fall. Galileo could not time a free fall with a water clock; the incline was the instrument that made the invisible measurable.
3. *Superposition.* A projectile keeps its horizontal velocity and accelerates vertically; the path is a parabola. Two independent motions add: this is the idea that becomes vector addition.
4. *Inertia and relativity.* The ship argument from the *Dialogo* (1632): below decks on a smoothly moving ship, no experiment reveals the motion. This is Galilean relativity, the principle that Einstein will keep in 1905 while changing everything else.

**Numbers for the board.** A pick-and-place robot releases a part from a conveyor moving at 1.5 m/s, 0.8 m above the bin. Fall time $t = \sqrt{2 \times 0.8/9.81} = 0.404$ s; horizontal travel $1.5 \times 0.404 = 0.61$ m. The bin must be 61 cm downstream of the release point. Then Galileo's incline: at $\theta = 3°$, $a = 9.81 \sin 3° = 0.513$ m/s², so a ball takes $\sqrt{2 \times 2/0.513} = 2.8$ s to roll 2 m: slow enough for a water clock, and for a phone's slow-motion camera.

**Demonstrations.** The best one costs nothing: hold a coin and a piece of paper, drop them (paper flutters), then put the paper on top of the coin and drop again (they fall together; the coin shields the paper from air). A ball launched horizontally and one dropped from the same height, released together (a ruler flicked off a table edge does both at once), hit the floor simultaneously. A student's phone taped to a trolley on a ramp, logging the accelerometer: mechatronics students can have Galileo's data in numbers in five minutes.

**Questions students ask.** *Why do a feather and a hammer fall differently then?* Air drag; in the vacuum of the Moon in 1971 the astronaut David Scott dropped both and they landed together. *Is $g$ the same everywhere?* It varies from 9.78 at the equator to 9.83 m/s² at the poles, from rotation and the Earth's oblateness, which matters for calibrating precision scales and accelerometers.

**The engineering bridge.** Every trajectory planner, every ballistics table and every accelerometer calibration rests on constant-acceleration kinematics. The MEMS accelerometer in a phone is a mass on a spring measuring exactly the acceleration Galileo measured with water; the inclined plane's trick, diluting a large effect so a slow instrument can see it, is a standard measurement strategy.

**On the site.** Card *Galileo*; self-test Q1; the cannon lab (§11.1) is Galileo's projectile taken to orbital speed.

---

## 6. Era 2 — The Classical Synthesis and Analytical Mechanics (1660–1834)

**Lecture at a glance.** Two 90-minute lectures. Objectives: derive simple harmonic motion from a linear restoring force; state Newton's laws and the law of gravitation and perform the Moon test; derive Bernoulli's equation from work and energy; write a Lagrangian for a one-degree-of-freedom mechanism. Board plan: (1) $F = -kx \Rightarrow \ddot x + \omega_0^2 x = 0$; (2) the Moon test $a_{moon} = g/60^2$; (3) energy per unit volume along a streamline; (4) $L = T - V$ for a pendulum, then for a cart-pole.

The theme: between 1660 and 1834 physics acquired *force* as the cause of acceleration, and then discovered that force is not even needed, because energy and geometry (Lagrange) do the same job with less bookkeeping. Mechatronics students should hear that the second half of that sentence is what their robotics course is made of.

### 6.1 Hooke and Huygens: elasticity, oscillation and timekeeping (1660–1678)

**Hook.** Robert Hooke announced his law in 1676 as an anagram, *ceiiinosssttuv*, to establish priority without revealing the result, and unscrambled it two years later: *ut tensio, sic vis*, "as the extension, so the force". He said he had known it since 1660. Hooke was the Royal Society's Curator of Experiments, expected to produce several new demonstrations a week, and did: *Micrographia* (1665) gave the word "cell" to biology. He also fought Newton over everything, including credit for the inverse-square law, and no portrait of him is known to survive. Newton's famous line about standing on the shoulders of giants was written to Hooke in 1676; whether it was a graceful compliment or a jab at a short man with a stoop is still argued. Christiaan Huygens, meanwhile, built the first pendulum clock in 1656, discovered Titan and the true shape of Saturn's rings, and in 1665, ill in bed watching two of his clocks hung on the same beam, noticed that their pendulums fell into step, swinging in exact opposition. He called it "an odd kind of sympathy". It was the first recorded observation of coupled oscillators synchronising, a phenomenon mechatronics students will meet again in phase-locked loops and in swarms of robots.

**The setting.** Galileo had observed that a pendulum's swings take nearly equal times regardless of amplitude, and had proposed using one to keep time, but there was no theory of periodic motion and no quantitative law of elastic restoring forces. Clocks drifted by a quarter of an hour a day.

**The crisis.** Navigation at sea needed accurate time (longitude is time), astronomy needed it too, and structural design had no way to relate load to deformation.

**The idea, on the board.**

1. *Hooke's law.* $F = -kx$. Stress the sign: the force opposes the displacement. Generalise immediately to $\sigma = E\varepsilon$: a bar of length $L$ and cross-section $A$ has $k = EA/L$. Steel, $E = 200$ GPa, so a 1 m rod of 1 cm² has $k = 2\times10^{7}$ N/m and stretches 0.5 mm under 10 kN.
2. *From Hooke to SHM.* Newton's second law (borrow it from the next lecture) gives $m\ddot x = -kx$, so $\ddot x + \omega_0^2 x = 0$ with $\omega_0 = \sqrt{k/m}$. Solution $x = A\cos(\omega_0 t + \phi)$, period $T = 2\pi\sqrt{m/k}$: independent of amplitude. This is why the equation is the most reused in engineering: an LC circuit, a vibrating blade, a quartz crystal, a bridge cable and a MEMS gyroscope all obey it.
3. *The pendulum.* Tangential restoring force $-mg\sin\theta \approx -mg\theta$ for small angles, so $T = 2\pi\sqrt{L/g}$, again independent of amplitude, but only approximately. Huygens showed that a bob constrained to move on a *cycloid* is exactly isochronous, and built clocks with cycloidal "cheeks" to force it. Huygens also gave the first formula for centripetal acceleration, $a = v^2/r$, which Newton used.
4. *Energy.* $E = \tfrac{1}{2}kA^2$ sloshes between kinetic and potential twice per cycle. Draw the two curves; the sum is flat.

**Numbers for the board.** A quartz watch crystal is a tiny tuning fork cut to resonate at 32,768 Hz, chosen because it is $2^{15}$: fifteen halvings in a binary counter give exactly one pulse per second. Its frequency shifts by a few parts per million with temperature, which is why a cheap watch gains or loses a few seconds a month. Second example: a MEMS accelerometer has a proof mass of 1 μg on springs with $k = 4$ N/m; $\omega_0 = \sqrt{4/10^{-9}} = 6.3\times10^4$ rad/s, so $f_0 = 10$ kHz, and it can follow accelerations well below that frequency.

**Demonstrations.** A mass on a spring and a pendulum side by side, timed with a phone, to check $T \propto \sqrt{m}$ and $T \propto \sqrt{L}$. Two pendulums hanging from a common slack string: set one swinging and watch the energy pass to the other and back, Huygens' sympathy on a desk. A long pendulum swung at 10° and at 60°, timed: the periods differ by about 7 %, which is why Huygens needed his cycloid.

**Questions students ask.** *Why does the period not depend on amplitude?* Because a larger swing has both farther to go and a proportionally larger restoring force; for a linear spring the two effects cancel exactly. *What breaks Hooke's law?* Yielding: beyond the elastic limit the material deforms permanently, and design codes keep working stresses well below it.

**The engineering bridge.** Vibration engineering is Hooke plus damping plus forcing: natural frequencies, resonance and the $Q$ factor (self-test Q15). Timekeeping runs from Huygens' pendulum through the quartz crystal to the caesium atomic clock, and precision timing is what makes GPS possible. Elasticity is the basis of every load cell, strain gauge and force sensor.

**On the site.** Card *Hooke & Huygens*; Master equation *Wave equation*; self-test Q15 (resonance); Engineering matrix, Mechatronics (Oscillations, Damping & Feedback).

### 6.2 Newton: the Principia, the three laws and universal gravitation (1687)

**Hook.** In August 1684 Edmond Halley visited Cambridge to ask what path a planet would follow under a force falling off as the inverse square of distance. Newton replied, an ellipse, and that he had calculated it years ago but could not find the papers. Halley's question produced, three years later, the *Principia*, which the Royal Society could not afford to print because it had spent its budget on a lavish *History of Fishes*; Halley paid for it himself. The apple is not a myth: Newton told the story himself, in old age, to William Stukeley in his garden in 1726 and to John Conduitt; the apple fell, it did not hit him, and what struck him was that the same pull might reach as far as the Moon. Newton spent his last three decades as Warden and then Master of the Mint, personally pursuing counterfeiters (one, William Chaloner, was hanged in 1699), and wrote more on alchemy and theology than on physics. A 1979 analysis of his hair found mercury.

**The setting.** Kepler had the laws of orbits, Galileo the law of falling, Huygens the centripetal acceleration; Descartes had a vortex theory of the heavens. Nobody had connected the fall of an apple with the motion of the Moon.

**The crisis.** Terrestrial and celestial mechanics were two subjects with two sets of rules. And nobody could derive Kepler's laws from anything.

**The idea, on the board.**

1. *The three laws.* State them precisely. First: inertia (Galileo's ship). Second: $\vec F = d\vec p/dt$, which reduces to $\vec F = m\vec a$ at constant mass; Newton's own statement is about momentum, and rockets need the general form. Third: forces come in pairs acting on *different* bodies, so they never cancel on one body. The commonest student error in the whole course is applying the third law to a single object.
2. *The Moon test.* This is the calculation that made the theory. The Moon orbits at $r = 60 R_\oplus$ with period 27.3 days. Its centripetal acceleration is $a = 4\pi^2 r/T^2 = 4\pi^2 (3.84\times10^8)/(2.36\times10^6)^2 = 2.72\times10^{-3}$ m/s². If gravity falls off as $1/r^2$, then at 60 Earth radii it should be $g/3600 = 9.81/3600 = 2.72\times10^{-3}$ m/s². The apple and the Moon obey the same law. Do this on the board slowly; it is the most convincing three lines in physics.
3. *Universal gravitation.* $F = G m_1 m_2/r^2$. Newton never knew $G$; Cavendish measured the Earth's density in 1798 and $G$ was extracted later. Show that Kepler's third law follows (as in §5.3) and, for strong students, that the ellipse follows from the inverse square (the site's cannon lab draws it).
4. *Why it is called a synthesis.* Tides, the precession of the equinoxes, the shape of the Earth, comets on ellipses: one law, previously separate facts.

**Numbers for the board.** A DC motor drives a robot joint with rotor-plus-load inertia $J = 2\times10^{-4}$ kg·m² and produces 0.05 N·m of torque; the angular acceleration is $\alpha = \tau/J = 250$ rad/s², so it reaches 1,000 rpm (105 rad/s) in 0.42 s. Newton's second law for rotation, $\tau = J\alpha$, is the first equation of every servo design. Then the third law in a rocket: a 1 kg drone expelling 20 g/s of air downward at 15 m/s gets $F = \dot m v = 0.3$ N of lift from momentum flux, an idea Newton stated in the *Principia*'s momentum form.

**Demonstrations.** A tablecloth pulled from under a place setting (inertia). A student on a skateboard pushing against a wall (third law). Two spring scales hooked together and pulled: they always read the same. For gravitation, the site's cannon lab, which was Newton's own thought experiment from the popular *System of the World*.

**Questions students ask.** *Does the Earth pull the apple or the apple pull the Earth?* Both, with equal force; the Earth's acceleration is $m_{apple}/M_\oplus$ times smaller, about $10^{-25}$ m/s². *Why doesn't the Moon fall down?* It does, continuously; it also moves sideways fast enough to keep missing. The cannon lab shows this at 7.67 km/s.

**The engineering bridge.** Rigid-body dynamics, multibody simulation, the equations of every vehicle, aircraft and robot; orbital mechanics for satellites; the inertial navigation inside a drone (integrate $\vec a$ twice). The Newton–Euler formulation is one of the two standard ways to compute a robot's dynamics (Lagrange's, in §6.4, is the other).

**On the site.** Card *Newton*; Master equations *Newton II*, *Gravitation*; cannon lab (§11.1); self-test Q4 uses the orbital numbers.

### 6.3 Bernoulli and Euler: fluid dynamics and the energy of flow (1738–1757)

**Hook.** Daniel Bernoulli's *Hydrodynamica* appeared in 1738. His father Johann, one of the great mathematicians of the age, then published his own *Hydraulica* with the date 1732 printed on it, to make it appear that the son had copied the father. Four years earlier the two had shared a Paris Academy prize, and Johann had responded by banning Daniel from the house. Daniel also devised a way of measuring the pressure in a flowing fluid by piercing the pipe wall with a small open tube and reading the height of the column; physicians used the same idea to measure blood pressure by puncturing an artery until the inflatable cuff arrived in 1896. Leonhard Euler, Daniel's friend from Basel, lost the sight of one eye in 1738 and was almost totally blind from 1771, and produced roughly half of his enormous output afterwards, dictating; Arago said he calculated as other men breathe. His 1757 equations of ideal fluid motion were the first partial differential equations for a continuum. Viscosity was added by Navier in 1822 and Stokes in 1845; whether the resulting Navier–Stokes equations always have smooth solutions is one of the seven Millennium Prize problems, with a million dollars unclaimed.

**The setting.** Torricelli had the efflux law (1643), Pascal the principle of hydrostatic pressure (1653), but a moving fluid had no theory.

**The crisis.** Pumps, canals, ships and fountains were designed by rule of thumb. There was no relation between how fast a fluid moves, its pressure and its height.

**The idea, on the board.**

1. *Continuity.* For an incompressible fluid, $A_1 v_1 = A_2 v_2$: a narrowing pipe speeds the flow.
2. *Bernoulli from work–energy.* Follow a parcel of fluid of volume $V$ along a streamline from section 1 to section 2. The pressure forces do net work $(P_1 - P_2)V$; this equals the change in kinetic plus gravitational potential energy, $\tfrac{1}{2}\rho V(v_2^2 - v_1^2) + \rho V g(h_2 - h_1)$. Divide by $V$: $P + \tfrac{1}{2}\rho v^2 + \rho g h = \text{const}$. Every term is an energy per unit volume, and the derivation shows exactly when it fails: whenever energy is lost to friction (viscosity) or the flow is unsteady or compressible.
3. *Consequences.* Torricelli's law $v = \sqrt{2gh}$ falls out. So does the Venturi meter and the pitot tube ($P_{stag} - P_{static} = \tfrac{1}{2}\rho v^2$).
4. *Lift, correctly.* Air over the top of a wing does move faster and the pressure there is lower, but *not* because it "has farther to go and must meet up": it arrives at the trailing edge earlier than the air below. The flow speeds up because the wing shape and angle of attack turn it; the pressure difference integrated over the surface is the lift, consistent with Bernoulli along streamlines and with Newton's third law applied to the downward-deflected air. Teach the misconception explicitly (self-test Q11); half the class believes it.

**Numbers for the board.** A drone's pitot tube reads a dynamic pressure of 300 Pa in air of density 1.225 kg/m³: airspeed $v = \sqrt{2 \times 300/1.225} = 22$ m/s. A Venturi flow meter in a coolant line narrows from 20 mm to 10 mm diameter; continuity makes the velocity four times larger, so the pressure drop for water at 2 m/s inlet speed is $\tfrac{1}{2}\times1000\times(8^2 - 2^2) = 30$ kPa, easily read with a differential pressure sensor.

**Demonstrations.** Blow between two empty cans hanging on strings: they move together. A ping-pong ball held aloft in a hair-dryer stream (a pressure and flow-turning effect; resist the one-line "Bernoulli" explanation). Holes drilled at three heights in a plastic bottle of water: the jets' ranges show $v = \sqrt{2gh}$.

**Questions students ask.** *If pressure is lower where the fluid is faster, why does a garden hose spray harder when I squeeze the end?* The jet is faster, and it is the *momentum* of the jet you feel; inside the narrowing the static pressure did drop. *Why is Bernoulli wrong for the vacuum cleaner?* Because the flow is turbulent and viscous, and energy is lost; engineers add loss coefficients.

**The engineering bridge.** Hydraulics and pneumatics (every excavator and every pneumatic gripper), HVAC ducting, pump curves, turbomachinery, aerodynamics of drones and the blood-flow modelling used to design stents. Computational fluid dynamics solves Navier–Stokes numerically; Bernoulli remains the sanity check for its output.

**On the site.** Card *Bernoulli & Euler*; Engineering matrix, Mechanical (Fluid Mechanics) and Aerospace; self-test Q11.

### 6.4 Lagrange and Hamilton: analytical mechanics (1788–1834)

**Hook.** Joseph-Louis Lagrange opened the *Mécanique analytique* (1788) by announcing that no figures would be found in the work; mechanics had become pure analysis. He had come to Berlin in 1766 to succeed Euler at Frederick the Great's academy, then to Paris, where he survived the Revolution, helped design the metric system, and was called by Napoleon "the lofty pyramid of the mathematical sciences". Half a century later William Rowan Hamilton, an Irish prodigy who read Hebrew at seven, recast Lagrange's equations in the form that quantum mechanics would inherit; he is better known for the day in 1843 when, walking with his wife along the Royal Canal in Dublin, he saw the rule for multiplying quaternions and scratched $i^2 = j^2 = k^2 = ijk = -1$ into the stone of Broom Bridge. Quaternions were dismissed for a century and now rotate every drone, game character and spacecraft. Hamilton's optical–mechanical analogy, the idea that a particle's path and a light ray obey the same variational principle, is what Schrödinger followed to his equation in 1926.

**The setting.** Newton's laws worked, but for any mechanism with constraints (a bead on a wire, a pendulum, a linkage) one had to introduce unknown constraint forces and then eliminate them, in Cartesian coordinates that suited nothing.

**The crisis.** Bookkeeping. A four-bar linkage or a spinning top in Newtonian form is a thicket of tensions and reaction forces that do no work and that nobody wants to know.

**The idea, on the board.**

1. *Generalised coordinates.* Describe the system by the minimum number of coordinates that respect the constraints: one angle for a pendulum, two for a double pendulum, six for a robot arm.
2. *The Lagrangian.* $L = T - V$, kinetic minus potential energy, written in those coordinates. Hamilton's principle: the actual motion makes the action $\int L\,dt$ stationary. From that, the Euler–Lagrange equations $\frac{d}{dt}\frac{\partial L}{\partial \dot q_i} = \frac{\partial L}{\partial q_i}$. Ideal constraint forces never appear because they do no virtual work in the allowed motion.
3. *The pendulum, both ways.* Newton: tension $T$, two components, eliminate $T$. Lagrange: $L = \tfrac{1}{2} m L^2\dot\theta^2 - mgL(1 - \cos\theta)$, one line, giving $\ddot\theta + (g/L)\sin\theta = 0$ directly.
4. *Symmetry and conservation.* If $L$ does not depend on a coordinate, its conjugate momentum $\partial L/\partial\dot q$ is conserved; a system that looks the same from any angle conserves angular momentum. Noether made this general in 1918. This is the deepest reason physics has conservation laws.
5. *Hamilton.* Define $H = \sum p_i \dot q_i - L$, usually the total energy, and the equations become first-order: $\dot q = \partial H/\partial p$, $\dot p = -\partial H/\partial q$. State it; the students will meet $\hat H$ in the Schrödinger equation.

**Numbers for the board.** A single-link robot arm: motor torque $\tau$, link inertia about the joint $J$, mass $m$, centre of mass at distance $l_c$. $L = \tfrac{1}{2}J\dot\theta^2 - mgl_c(1-\cos\theta)$ gives $J\ddot\theta + mgl_c\sin\theta = \tau$. With $J = 0.05$ kg·m², $m = 2$ kg, $l_c = 0.3$ m, holding the arm horizontal needs $\tau = 2\times9.81\times0.3 = 5.9$ N·m, and the small-angle natural frequency about the hanging position is $\sqrt{mgl_c/J} = 10.8$ rad/s. Then the cart-pole (inverted pendulum on a cart), the standard control benchmark: with cart mass $M$, pole mass $m$, length $l$, $L = \tfrac{1}{2}(M+m)\dot x^2 + m l \dot x\dot\theta\cos\theta + \tfrac{1}{2}m l^2\dot\theta^2 - mgl\cos\theta$; two Euler–Lagrange equations later the students have the model they will linearise and stabilise in their control course.

**Demonstrations.** A double pendulum (two rods, two bearings) released from a moderate angle: chaos in front of the class, and the observation that the Lagrangian for it fits on one line while the Newtonian version does not fit on the board. A gyroscope or a spinning bicycle wheel for angular-momentum conservation.

**Questions students ask.** *Is Lagrange's mechanics different physics from Newton's?* No; it is the same laws in a form that removes the forces you do not care about. It becomes different physics only in quantum mechanics, where the Hamiltonian is fundamental. *Why $T - V$ and not $T + V$?* Because it is the quantity whose time integral is stationary along the real path; $T + V$ is conserved, which is a different statement. (Feynman's *Lectures*, vol. II, ch. 19, is the best account for strong students.)

**The engineering bridge.** Every robotics textbook derives manipulator dynamics with Lagrange; every multibody simulation package (used for vehicles, mechanisms, biomechanics) is built on the same principle; control engineers derive the plant model this way before they design the controller.

**On the site.** Card *Lagrange & Hamilton*; Master equation *Euler–Lagrange*; Engineering matrix, Mechatronics and Aerospace; self-test Q7.

---

## 7. Era 3 — Heat, Work and the Thermodynamic Revolution (1822–1900s)

**Lecture at a glance.** Two 90-minute lectures. Objectives: write the heat equation and expand a square wave in harmonics; derive the Carnot efficiency and explain why it is a ceiling; state the first law with correct signs and compute a mechanical equivalent; define entropy and show a spontaneous process increases it; connect entropy to microstates and temperature to average energy. Board plan: (1) $\partial T/\partial t = \alpha\nabla^2 T$ and the square-wave series; (2) the Carnot cycle on a $T$–$S$ diagram; (3) $\Delta U = Q - W$ with Joule's paddle wheel; (4) $dS = \delta Q_{rev}/T$ and the two-reservoir example; (5) $S = k_B\ln\Omega$ with four coins.

The theme: the nineteenth century discovered that *heat is energy*, that energy is conserved, and that something else, entropy, is not, so that every process has a direction. Engineers should be told at the outset that this era was driven by steam engines, not by curiosity, and that its main result (no engine can beat $1 - T_C/T_H$) is still the number that decides the design of every power plant, engine and refrigerator.

### 7.1 Fourier: the analytical theory of heat and harmonic analysis (1822)

**Hook.** Joseph Fourier was orphaned at nine, nearly guillotined in 1794 (arrested during the Terror, freed when Robespierre fell), and went to Egypt with Napoleon in 1798 as scientific secretary of the expedition; he later wrote the historical preface to the monumental *Description de l'Égypte* and, as prefect of Grenoble, showed a boy named Champollion the Egyptian inscriptions that Champollion would decipher twenty years later. As prefect he drained the marshes of Bourgoin and built the Grenoble–Turin road; in the evenings he worked on heat. His 1807 memoir was held up by Lagrange and Laplace, who objected that his trigonometric series could not possibly represent an arbitrary function; the objection was wrong, though making it rigorous took a century. The book came out in 1822. Fourier was also the first person, in 1824, to argue that the atmosphere warms the Earth by trapping heat, the effect we now call the greenhouse effect. He believed heat was good for the health, kept his rooms very hot and wrapped himself in blankets, and died in 1830.

**The setting.** Heat was still "caloric", an invisible fluid; Newton had a cooling law; nobody had an equation for how temperature spreads through a solid.

**The crisis.** Cannon founders, boiler makers and anyone insulating a building were working blind, and mathematics had no tool for problems with an arbitrary initial condition.

**The idea, on the board.**

1. *Fourier's law.* Heat flux is proportional to the temperature gradient: $q = -k\,\partial T/\partial x$ (W/m²). Conductivities: copper 400, steel 50, glass 1, air 0.026 W/m·K.
2. *Conservation.* The energy in a slab changes by the difference between flux in and flux out: $\rho c\,\partial T/\partial t = -\partial q/\partial x$. Combine: $\partial T/\partial t = \alpha\,\partial^2 T/\partial x^2$ with $\alpha = k/\rho c$ (m²/s). Wherever the temperature profile is curved, it flattens. The same equation describes any diffusion: dopants in silicon, moisture in concrete, the price of an option.
3. *Solving it.* Separation of variables gives solutions $\sin(n\pi x/L)\,e^{-\alpha (n\pi/L)^2 t}$: each spatial harmonic decays, and the sharper ones decay fastest. To handle an arbitrary initial profile you must write it as a sum of sines; Fourier's claim, scandalous in 1807, was that you always can.
4. *The square wave.* $f(t) = \frac{4}{\pi}\left(\sin\omega t + \tfrac{1}{3}\sin 3\omega t + \tfrac{1}{5}\sin 5\omega t + \dots\right)$. Draw the first three partial sums. The corners live in the high harmonics; a band-limited channel rounds them (self-test Q13). The overshoot near the jump, about 9 %, never goes away: the Gibbs phenomenon.
5. *Time scale.* From dimensions, the diffusion time across a length $L$ is $t \sim L^2/\alpha$. Double the thickness, four times the time.

**Numbers for the board.** A 1 cm aluminium heat spreader ($\alpha = 9.7\times10^{-5}$ m²/s): $t \sim L^2/\alpha \approx 1$ s. The same thickness of glass ($\alpha = 3.4\times10^{-7}$): 5 minutes. Of rubber or hard plastic ($\alpha \approx 10^{-7}$): a quarter of an hour or more, which is why a plastic handle stays cool. Then signals: a 1 MHz PWM motor-drive signal with 20 ns edges has significant content up to $0.35/t_r \approx 17$ MHz; that is the bandwidth the current-sense amplifier and the EMC filter must be designed for.

**Demonstrations.** A free spectrum-analyser app on a phone listening to a tuning fork, then to a clarinet or a voice: pure tone versus harmonic series. Ice cubes on copper, steel and plastic blocks at room temperature (the copper block "feels" coldest and melts the ice fastest; conductivity, not temperature). A thermal camera, if available, watching a hand print fade from a desk.

**Questions students ask.** *Why does metal feel colder than wood at the same temperature?* Because it conducts heat from your hand faster; your skin senses heat flux, not temperature. *Can a square wave really contain a 1 GHz component?* Any real square wave has finite rise time, and the series is truncated where the edges are; that is exactly why designers specify rise time, not just frequency.

**The engineering bridge.** Thermal design of electronics (heat sinks, heat pipes, junction temperatures), building insulation, heat exchangers; and, through the Fourier transform, all of signal processing, modal analysis of vibrating structures, MRI image reconstruction and JPEG compression. The Fast Fourier Transform (Cooley and Tukey, 1965) is arguably the most executed algorithm on Earth.

**On the site.** Card *Fourier*; Master equation *Wave equation* (the other great linear PDE); self-test Q13.

### 7.2 Carnot: the theoretical efficiency limit of heat engines (1824)

**Hook.** Sadi Carnot was 28 when he published *Réflexions sur la puissance motrice du feu* in 1824, at his own expense, in an edition of about 600 copies that almost nobody read. His father Lazare had been "the Organiser of Victory" of the Revolutionary armies and also the author of a theory of machines that stressed how work is lost in shocks and friction; the son inherited the habit of asking what is lost. Sadi's motive was frankly national: Britain's steam engines were the source of its power, and France did not understand them. He died of cholera in 1832 at 36, and most of his papers and belongings were burned as a precaution. The notes that survived show him abandoning the caloric theory and writing that heat is nothing but motive power that has changed its form, a first law of thermodynamics that nobody read until 1878. His book was rescued by Clapeyron, who gave it graphs and equations in 1834, and then by Kelvin and Clausius.

**The setting.** Watt's engines converted a few per cent of their coal into work, and every improvement was empirical. The prevailing theory, caloric, treated heat as a fluid that flowed from hot to cold like water through a mill wheel.

**The crisis.** Was there a limit? Could a better engineer, a better fluid or a better mechanism push efficiency toward 100 %?

**The idea, on the board.**

1. *The waterfall.* Carnot's picture: as water yields work only by falling, caloric yields work only by falling from a hot body to a cold one, and the work depends on the height of the fall, that is, on the temperature difference. Wrong in detail (heat is not conserved; some becomes work), right in structure.
2. *The reversible engine.* Define the four strokes: isothermal expansion at $T_H$, adiabatic expansion, isothermal compression at $T_C$, adiabatic compression. Every step can be run backwards. Carnot's theorem: no engine between the same two reservoirs can beat a reversible one, and all reversible ones have the same efficiency. Proof by contradiction: a better engine driving the reversible one backwards would move heat from cold to hot with no other effect.
3. *The efficiency.* On a $T$–$S$ diagram (which needs entropy, from §7.4, but can be introduced as "heat divided by temperature" for now) the cycle is a rectangle: $Q_{in} = T_H\Delta S$, $Q_{out} = T_C\Delta S$, $W = (T_H - T_C)\Delta S$, so $\eta = 1 - T_C/T_H$. Nothing about the gas, the piston or the engineer appears; only two temperatures.
4. *For the ideal gas explicitly.* Isothermal work $nRT\ln(V_2/V_1)$ on both isotherms; the adiabats obey $TV^{\gamma-1} = \text{const}$, so the two volume ratios are equal and the $\ln$ terms cancel. The site's Carnot lab does this arithmetic live.

**Numbers for the board.** A car engine's peak gas temperature is about 2500 K and the exhaust is dumped at 300 K: Carnot limit 88 %; a real petrol engine reaches 30–35 %. A combined-cycle gas turbine, 1700 K inlet and 300 K sink: limit 82 %, real 63 %. A Peltier cooler at $T_H = 320$ K, $T_C = 280$ K: the coefficient of performance for cooling, $T_C/(T_H - T_C) = 7$ at best, in practice about 1, which is why Peltier modules are used only where compactness beats efficiency.

**Demonstrations.** A low-temperature-difference Stirling engine (a desktop kit) running on a cup of hot coffee, then on a bowl of ice with the top warmed by a hand: it runs in reverse. A "drinking bird". The site's Carnot lab with the two reservoir sliders, asking the class to predict before each move.

**Questions students ask.** *Why can't we just reach $T_C = 0$?* Absolute zero is unattainable (the third law), and the cold sink in practice is the environment, about 300 K; the only lever is $T_H$, which is a materials problem. *Is the Carnot engine real?* No real engine runs a Carnot cycle; it is the benchmark, the way a frictionless plane is. Rankine, Otto, Diesel and Brayton cycles are what is built, and each has its own lower ceiling.

**The engineering bridge.** Power-plant design (why turbine inlet temperatures keep rising and why blades are single-crystal superalloys with cooling channels), refrigeration and heat-pump design, thermal management of electronics, and the concept of *exergy*, the fraction of an energy source that can become work.

**On the site.** Card *Carnot*; Carnot lab (§11.3); self-test Q3.

### 7.3 Joule and Mayer: the conservation of energy (1843)

**Hook.** James Joule was a Manchester brewer's son, taught as a boy by John Dalton, with a private laboratory and no academic post. He established in 1841 that a current produces heat at a rate $I^2R$ (Joule's law), and from 1843 measured the mechanical equivalent of heat every way he could: paddle wheels churning water, water forced through fine tubes, gas compressed. The precision was extraordinary: temperature rises of a few hundredths of a degree, with a thermometer he had made to read to 1/200 of a degree Fahrenheit. William Thomson (later Lord Kelvin) recalled meeting the newly married Joule in 1847 near Chamonix, on his honeymoon, carrying a long thermometer with which he intended to measure the temperature difference between the top and bottom of a waterfall. A German physician, Julius Robert Mayer, had reached the conservation of energy first, in 1842, from an observation made as a ship's doctor in Java in 1840: the venous blood of sailors in the tropics was unexpectedly red, meaning the body was burning less fuel to keep warm, which set him thinking about the balance of heat and work in the body. His paper was ignored, and priority disputes embittered his later years. Helmholtz gave the principle its general form in 1847.

**The setting.** Caloric was supposedly conserved; Rumford (1798) had shown that boring cannon produced apparently unlimited heat, which a conserved fluid could not explain, but the idea persisted for fifty more years.

**The crisis.** Heat and work were measured in different units and were not thought to be the same thing. Without a common currency, no energy budget for any machine could be written.

**The idea, on the board.**

1. *The paddle wheel.* Falling weights of mass $m$ descend a height $h$ and turn paddles in insulated water; the water warms by $\Delta T$. Then $mgh = c_w M\Delta T$, where $M$ is the mass of water. Joule's 1850 value was 772 foot-pounds per BTU; the modern value is 778, i.e. 4.184 J per calorie. Show the arithmetic: 1 kg of water raised 1 °C stores 4184 J, the work of lifting it 427 m.
2. *The first law.* $\Delta U = Q - W$ (heat in, work done *by* the system). Insist on signs and on the words "internal energy": $U$ is a property of the state; $Q$ and $W$ are not, which is why the site's master-equation table writes $\delta Q$ and $\delta W$ with the inexact differential.
3. *Joule heating.* $P = I^2R = V^2/R$: electrical work becomes internal energy of the conductor. This is where a mechatronics student's motor driver gets hot.
4. *The two paths.* A gas taken from state A to state B by different routes needs different $Q$ and $W$ but the same $Q - W$. Draw two paths on a $P$–$V$ diagram; the area under each is $W$; the difference is $Q$.

**Numbers for the board.** A 2 kW kettle running for 100 s delivers 200 kJ; for 1 kg of water, $\Delta T = 200{,}000/4184 = 48$ K. A 20 A motor-driver MOSFET with $R_{DS(on)} = 10$ mΩ dissipates $I^2R = 4$ W; with a thermal resistance of 40 K/W to ambient it would reach 160 °C above ambient without a heat sink. Joule's own experiment scaled to a lecture theatre: dropping 10 kg through 2 m into 1 kg of water 50 times warms it by $50\times10\times9.81\times2/4184 = 2.3$ K; his patience was the instrument.

**Demonstrations.** Rub your hands. A bicycle pump held while pumping (compression work becomes heat). A hand-crank generator lighting a lamp, then the lamp touched: mechanical, electrical, light, heat, one currency. A lead shot in a cardboard tube inverted twenty times, with a thermometer in the shot: the classic Joule demonstration; the theory gives $mgh/(mc) = 9.81/128 = 0.08$ K per inversion for lead, and a class typically measures a few degrees after a hundred.

**Questions students ask.** *Is heat a form of energy or a transfer of energy?* A transfer; a body contains internal energy, not heat. Sloppy language here is the source of half of the confusion in thermodynamics. *Where did the caloric go?* Into the internal energy concept: what the caloric theory called the amount of caloric is roughly what we call internal energy, minus its claim to be conserved separately.

**The engineering bridge.** Every energy budget: battery capacity in watt-hours, the efficiency chain from fuel to wheels, the thermal design of a motor controller, calorimetry in materials testing. The joule, the watt and the kilowatt-hour are Joule's monument.

**On the site.** Card *Joule & Mayer*; Master equation *First law*; Carnot lab readouts ($Q_{in}$, $Q_{out}$, $W$).

### 7.4 Clausius and Kelvin: entropy and the second law (1850–1865)

**Hook.** In 1865 Rudolf Clausius coined a word. He wanted a name for the quantity $\int\delta Q/T$ that he had shown never decreases, and he built it from the Greek *tropē*, transformation, deliberately making it sound like "energy" because, he said, the two quantities were so closely related. His summary of thermodynamics in two sentences is still the best: the energy of the universe is constant; the entropy of the universe tends to a maximum. William Thomson, who became Lord Kelvin, proposed the absolute temperature scale in 1848, was knighted for his part in the transatlantic telegraph cable of 1866, and used thermodynamics to estimate the age of the Earth at 20 to 400 million years, far too short for Darwin's geology. In 1904 Ernest Rutherford, lecturing in London on radioactivity as a new source of the Earth's internal heat, saw the old man in the audience and, by his own account, said that Kelvin had been right *provided no new source of heat was discovered*, whereupon Kelvin beamed. The line usually attributed to Kelvin, that there is nothing new to be discovered in physics, is not documented; what he actually said, in 1900, was that two "clouds" hung over physics: the failure to detect the aether, and the failure of equipartition. Those clouds became relativity and quantum theory.

**The setting.** Carnot's efficiency limit and Joule's conservation of energy were both established by 1850 but looked incompatible: if heat is conserved as it falls (Carnot's picture), it cannot also be converted (Joule's).

**The crisis.** Which is it? And why do all processes have a direction, when the first law allows them to run either way?

**The idea, on the board.**

1. *Two statements of the second law.* Clausius: heat never passes spontaneously from a colder to a hotter body. Kelvin–Planck: no cyclic process can convert heat from a single reservoir entirely into work. Show they are equivalent: violating one lets you build a machine that violates the other.
2. *Entropy.* For a reversible process $dS = \delta Q_{rev}/T$; $S$ is a state function (that is Clausius's theorem, $\oint\delta Q_{rev}/T = 0$). For any process in an isolated system, $\Delta S \ge 0$.
3. *The example that makes it real.* One joule flows from a body at 400 K to one at 300 K. The hot body loses $1/400$ J/K; the cold one gains $1/300$ J/K; net $+8.3\times10^{-4}$ J/K. The reverse flow would give a net decrease, which is forbidden. Direction, quantified.
4. *Reconciling Carnot and Joule.* In the Carnot cycle, heat is not conserved (some becomes work) but *entropy* is: $Q_{in}/T_H = Q_{out}/T_C$. Carnot's "falling caloric" was really falling entropy.
5. *Absolute temperature.* Kelvin defined $T$ so that $Q_{in}/Q_{out} = T_H/T_C$ for a reversible engine, a definition independent of any thermometer substance.

**Numbers for the board.** A data centre rejects 10 MW of heat to a river at 290 K: entropy is produced at $10^7/290 = 34$ kW/K. Landauer's principle (1961): erasing one bit at 300 K must dissipate at least $k_B T\ln 2 = 2.9\times10^{-21}$ J; a processor erasing $10^{18}$ bits per second therefore dissipates at least 3 mW even if perfectly built, a floor that real chips exceed by many orders of magnitude. A heat pump moving 3 kW into a house at 293 K from air at 273 K needs at minimum $W = Q_{in}(1 - T_C/T_H) = 3\times(1 - 273/293) = 0.2$ kW: a coefficient of performance of 15 in the ideal case, about 4 in practice.

**Demonstrations.** Cream poured into coffee, then the question "what would it take to un-mix it?". A short video of a shattering cup played forwards and backwards: the class identifies the real direction instantly, and cannot say from Newton's laws why. The site's Carnot lab with the $T$–$S$ diagram: the rectangle's width is the entropy that passes through the engine unchanged.

**Questions students ask.** *Is entropy disorder?* Sometimes a useful metaphor, often misleading (a crystal forming from a liquid *increases* the universe's entropy by releasing heat). Entropy counts microstates, which is the next lecture. *Does life violate the second law?* No; organisms are open systems that export entropy to their surroundings, as a refrigerator does.

**The engineering bridge.** Refrigeration and heat-pump cycles (COP), exergy analysis of plants, the thermodynamics of computing, and the reason a battery cannot be charged with the heat it produced.

**On the site.** Card *Clausius & Kelvin*; Master equation *Second law*; Carnot lab $T$–$S$ panel; self-test Q3.

### 7.5 Boltzmann and Gibbs: statistical mechanics (1877)

**Hook.** Ludwig Boltzmann's tombstone in Vienna carries the equation $S = k\log W$. He never wrote it in that form; Planck did, in 1900, and named the constant after him. Boltzmann spent his career defending the reality of atoms against Ernst Mach, who would interrupt his lectures with "Have you seen one?", and against the energeticists led by Ostwald. He died in 1906, two years before Jean Perrin's experiments on Brownian motion, following Einstein's 1905 analysis, settled the matter in his favour. Across the Atlantic, Josiah Willard Gibbs, a reclusive Yale professor, published the whole of chemical thermodynamics in the *Transactions of the Connecticut Academy of Arts and Sciences*, where nobody read it; Maxwell, who did, made a plaster cast of Gibbs's thermodynamic surface with his own hands and sent it to New Haven in 1875. Gibbs's 1902 book made statistical mechanics a discipline.

**The setting.** Thermodynamics worked but explained nothing: temperature, entropy and pressure were defined by what they did, not by what they were. The kinetic theory of gases (Clausius, Maxwell) had begun to derive pressure from molecular collisions.

**The crisis.** What *is* entropy? And how can reversible molecular collisions produce irreversible behaviour?

**The idea, on the board.**

1. *Microstates and macrostates.* Four coins: the macrostate "two heads" has $W = 6$ microstates; "four heads" has 1. With $10^{23}$ coins the peak is so sharp that "half heads" is a law of nature. Ask the class to count for 4 coins, then compute for 100 with the binomial: $W(50) = 1.0\times10^{29}$ versus $W(100) = 1$.
2. *Entropy.* $S = k_B\ln W$. Logarithm because entropy must add when systems combine and $W$ multiplies. $k_B = 1.38\times10^{-23}$ J/K converts a count into the units Clausius used. Show that a gas expanding into twice the volume has $W$ multiplied by $2^N$, so $\Delta S = Nk_B\ln 2$, the same as the thermodynamic $nR\ln 2$: the two definitions agree.
3. *Temperature.* Equipartition: each quadratic degree of freedom carries $\tfrac{1}{2}k_B T$ on average. Temperature is the average energy per degree of freedom, and $k_B T$ at room temperature is 0.026 eV, a number every electronic engineer should carry in their head.
4. *The Boltzmann factor.* The probability of a state of energy $E$ is proportional to $e^{-E/k_BT}$. Consequences: the Maxwell–Boltzmann speed distribution; Arrhenius reaction rates; the number of electrons that reach the conduction band in a semiconductor, $\propto e^{-E_g/2k_BT}$; the 60 mV per decade limit on how sharply a transistor can switch.
5. *Irreversibility.* Collisions are reversible; the drift to the most probable macrostate is not a law of mechanics but of counting. Boltzmann's H-theorem made this precise and was attacked for the rest of his life.

**Numbers for the board.** Thermal noise in a 10 kΩ resistor over a 1 MHz bandwidth at 300 K: $v_{rms} = \sqrt{4k_BTR\Delta f} = \sqrt{4\times1.38\times10^{-23}\times300\times10^4\times10^6} = 13$ μV. That noise floor is Boltzmann's factor in an amplifier, and it is why sensor front-ends use low resistances and narrow bandwidths. Silicon at 300 K: with $E_g = 1.12$ eV the factor $e^{-E_g/2k_BT} = e^{-21.5} = 4.5\times10^{-10}$ sets the intrinsic carrier density at about $10^{10}$ cm⁻³; at 400 K it is several hundred times larger, which is why leakage currents grow so fast with temperature.

**Demonstrations.** Every student tosses four coins ten times; tally the class histogram on the board and compare with 1 : 4 : 6 : 4 : 1. A Galton board (marbles through pegs) if the department has one. Perfume opened at the front of the room: the time it takes to reach the back is diffusion, molecules doing their random walk.

**Questions students ask.** *If all microstates are equally likely, why doesn't the air rush into one corner?* It could; the probability is $2^{-N}$ with $N \sim 10^{25}$, which is zero for any practical purpose. *What is $k_B$ really?* A unit conversion between energy and temperature; in units where $T$ is measured in joules, $k_B = 1$.

**The engineering bridge.** Noise floors in every sensor and communication link, reliability testing (Arrhenius acceleration: 10 °C hotter, roughly twice the failure rate), semiconductor device physics, diffusion in materials processing, and the whole of chemical engineering's thermodynamics.

**On the site.** Card *Boltzmann & Gibbs*; Master equation *Boltzmann entropy*; self-test Q5 and Q9.

---

## 8. Era 4 — The Field Paradigm and Electrodynamics (1785–1890s)

**Lecture at a glance.** Three 90-minute lectures (electrostatics and optics; induction; Maxwell and Hertz). Objectives: state Coulomb's and Gauss's laws and use symmetry; derive the double-slit fringe spacing; state Faraday's law with Lenz's sign and apply it to a generator; explain why the displacement current was needed and derive $c$ from $\mu_0$ and $\varepsilon_0$; describe how Hertz produced and detected radio waves. Board plan: (1) $1/r^2$ and flux; (2) path difference $d\sin\theta = m\lambda$; (3) $\mathcal{E} = -d\Phi_B/dt$ on a rotating loop; (4) the four equations and the wave equation; (5) a dipole and its wavelength.

The theme: in 1785 electricity was a parlour trick and light was a stream of Newtonian corpuscles; by 1888 electricity, magnetism and light were one field theory, tested by a spark jumping across a room. No era on the timeline matters more to an electrical or mechatronics engineer, because every motor, sensor, transformer and antenna they will ever design is in these five cards.

### 8.1 Coulomb and Gauss: putting numbers on electric charge (1785)

**Hook.** Charles-Augustin de Coulomb was a military engineer who spent eight years building fortifications in Martinique and came home with damaged health and a permanent interest in how materials behave under load. Before electricity, he wrote the prize-winning memoir on friction (1781) that every mechatronics student still uses: friction force proportional to normal force, independent of contact area, and larger at rest than in motion, the "Coulomb friction" in every servo model. His torsion balance, a needle hung on a thin silver wire whose twist measures forces far smaller than any balance could weigh, gave the inverse-square law of electrostatics in 1785. Carl Friedrich Gauss, who as a schoolboy is said to have summed the integers from 1 to 100 in seconds, built the first working electromagnetic telegraph with Wilhelm Weber in 1833, a kilometre across Göttingen, and gave the flux form of the law that opens Maxwell's equations. Two other names belong here: Alessandro Volta, whose pile of zinc and silver discs (1800) was the first source of continuous current, after a decade of argument with Galvani about twitching frogs' legs (both were partly right); and Georg Ohm, whose 1827 law was dismissed by one critic as "a web of naked fancies" and earned him the Royal Society's Copley Medal fourteen years later.

**The setting.** Leyden jars stored charge, Franklin had named positive and negative, lightning was known to be electrical, but there was no force law and no steady current.

**The crisis.** Without a force law there is no electrostatics; without a current there is no experiment on it.

**The idea, on the board.**

1. *Coulomb's law.* $F = \frac{1}{4\pi\varepsilon_0}\frac{q_1 q_2}{r^2}$, with $1/4\pi\varepsilon_0 = 9\times10^9$ N·m²/C². Compare with gravitation: same form, $10^{36}$ times stronger between two protons, and of both signs, which is why matter is neutral and gravity dominates at large scales.
2. *The field.* $\vec E = \vec F/q$; a charge modifies the space around it, and a test charge responds to the field where it is. This step, the *field* as a thing in itself, is Faraday's contribution and Maxwell's, and this lecture should plant it.
3. *Gauss's law.* Field lines start on positive charge and end on negative; the net number leaving a closed surface counts the enclosed charge: $\oint\vec E\cdot d\vec A = Q_{enc}/\varepsilon_0$. With symmetry it is algebra. Sphere: $E = Q/4\pi\varepsilon_0 r^2$ outside, so a uniformly charged shell acts as a point charge. Infinite plane: $E = \sigma/2\varepsilon_0$, independent of distance. Two plates: $E = \sigma/\varepsilon_0$ between, zero outside.
4. *The capacitor.* $V = Ed$, $Q = \sigma A$, so $C = Q/V = \varepsilon_0 A/d$; a dielectric multiplies by $\varepsilon_r$. Energy $\tfrac{1}{2}CV^2$; energy density $\tfrac{1}{2}\varepsilon_0E^2$.
5. *Conductors.* In equilibrium $E = 0$ inside a conductor; all charge sits on the surface; the field just outside is $\sigma/\varepsilon_0$ and normal to the surface. A closed conducting shell shields its interior completely (self-test Q14).

**Numbers for the board.** Air breaks down at 3 MV/m, so a 1 mm gap arcs at 3 kV; this sets the spacing of every high-voltage layout. An electrostatic comb-drive actuator in a MEMS mirror: plates 100 μm by 500 μm separated by 2 μm, at 50 V: $F = \tfrac{1}{2}\varepsilon_0 A V^2/d^2 = 0.5\times8.85\times10^{-12}\times5\times10^{-8}\times2500/(4\times10^{-12}) = 1.4\times10^{-4}$ N, 140 μN, which is enough to steer a mirror weighing micrograms. A capacitive touchscreen: a fingertip adds about 1 pF to a sensing electrode; the controller detects a change of that size against a baseline of tens of picofarads.

**Demonstrations.** A balloon rubbed on hair, bending a thin stream of water from a tap (polarisation of a neutral dielectric). An electroscope charged by induction. A phone inside a metal biscuit tin loses its signal: a Faraday cage, though at radio frequency the argument is about skin depth rather than electrostatics, which is worth saying. A Van de Graaff generator if the department has one: the hair-raising demonstration is Coulomb repulsion made visible.

**Questions students ask.** *If a conductor shields its inside, why does my phone work in a car?* The windows are holes larger than the wavelength; a car is a poor cage. *Why is $\varepsilon_0$ such a strange number?* It is a unit conversion inherited from choosing the ampere; in Gaussian units it is absent.

**The engineering bridge.** Capacitors, dielectrics, insulation coordination, ESD protection, electrostatic precipitators, inkjet printing, MEMS actuators, capacitive sensors of every kind (touch, proximity, humidity, accelerometers read their proof mass capacitively), and Ohm's law in every circuit.

**On the site.** Card *Coulomb & Gauss*; Master equation *Gauss's law*; self-test Q14.

### 8.2 Young and Fresnel: light as a wave (1801–1818)

**Hook.** Thomas Young could read at two, knew a dozen languages by adolescence, was a practising physician, gave his name to the modulus of elasticity, proposed the three-colour theory of vision, and made the first real progress in reading the Rosetta Stone before Champollion; his contemporaries called him "Phenomenon Young". When he announced in 1801 that light showed interference, and therefore was a wave, the *Edinburgh Review* mocked him at length, and the corpuscular theory of Newton held on in England for another twenty years. In France, Augustin Fresnel, an engineer of roads and bridges who had lost his post for royalist sympathies during Napoleon's Hundred Days in 1815, used the enforced idleness to work out the mathematics of diffraction. He submitted it to the Academy's 1818 prize competition, where Siméon Poisson, a committed corpuscularist on the jury, showed that Fresnel's theory absurdly predicted a bright spot at the very centre of the shadow of a circular disc. François Arago went into the laboratory and found the spot. Fresnel then invented the stepped lighthouse lens (1822) that carries his name, installed the first one at Cordouan in 1823, and died of tuberculosis at 39.

**The setting.** Huygens' wave theory (1690) existed but could not explain sharp shadows or the colours of thin films; Newton's authority stood behind particles.

**The crisis.** Two theories, one phenomenon, and no decisive experiment.

**The idea, on the board.**

1. *Superposition and coherence.* Two waves of the same frequency add; the result depends on their phase difference. Two lamps do not interfere because their phases wander; two slits lit by one source do, because the phase difference at any point is fixed by geometry.
2. *The double slit.* Slits separated by $d$, screen at distance $L$. Path difference $d\sin\theta$; bright fringes where $d\sin\theta = m\lambda$. For small angles the fringe spacing is $\Delta y = \lambda L/d$. Measuring $\Delta y$ measures $\lambda$: Young got about 0.7 μm for red light, the first measurement of the wavelength of light.
3. *Thin films.* Reflections from the two surfaces of a soap film interfere; the phase change on reflection from a denser medium adds half a wavelength; the colours are wavelengths where the path difference $2nt$ gives constructive interference.
4. *Diffraction.* A single slit of width $a$ has minima at $a\sin\theta = m\lambda$; light spreads more the narrower the slit. A circular aperture of diameter $D$ gives an Airy disc of angular radius $1.22\lambda/D$: the resolution limit of every telescope, camera and lithography lens.
5. *Transverse waves.* Fresnel and Arago showed (1819) that perpendicularly polarised beams do not interfere: light oscillates *across* its direction of travel. That fact is what Maxwell's theory will have to reproduce.

**Numbers for the board.** A 650 nm laser pointer through two slits 0.25 mm apart onto a wall 2 m away: $\Delta y = 650\times10^{-9}\times2/2.5\times10^{-4} = 5.2$ mm, easily measured with a ruler. A CD as a grating: tracks 1.6 μm apart, so green light (532 nm) has its first-order beam at $\sin\theta = 0.33$, $\theta = 19°$; a DVD (0.74 μm) throws it to 46°. Photolithography: with $\lambda = 193$ nm, NA $= 1.35$ (water immersion) and $k_1 = 0.25$, the minimum half-pitch is $k_1\lambda/\text{NA} = 36$ nm; the industry needed 13.5 nm EUV to go further (self-test Q12).

**Demonstrations.** Laser pointer and a CD or DVD held at grazing incidence: a rainbow of orders across the ceiling. A laser through a single human hair: the diffraction pattern gives the hair's diameter from the minima spacing ($a = \lambda L/\Delta y$), typically 60–80 μm, and every student can measure their own. A soap film on a wire loop, held vertically: horizontal colour bands that drift downward as the film thins, then a black region at the top just before it breaks (destructive interference, film thinner than a quarter wavelength).

**Questions students ask.** *Where does the energy go in a dark fringe?* Into the bright ones; interference redistributes energy, it does not destroy it. *Does the double slit work with one photon at a time?* Yes, and the fringes still form (Taylor, 1909; Tonomura with electrons, 1989); that is the beginning of quantum mechanics, in §10.4.

**The engineering bridge.** Interferometers that calibrate machine tools to a fraction of a wavelength, anti-reflection and dielectric-mirror coatings, diffraction gratings in every spectrometer, DWDM multiplexers that put 80 colours down one optical fibre, holography, and the Rayleigh criterion that governs the resolution of cameras, microscopes and chip lithography. The Fresnel lens is in every lighthouse, car headlamp, overhead projector and solar concentrator.

**On the site.** Card *Young & Fresnel*; self-test Q12; Maxwell lab (§11.2) for what the wave is made of.

### 8.3 Faraday: induction and the electromagnetic field (1831)

**Hook.** Michael Faraday was a blacksmith's son apprenticed to a bookbinder, who read the books he bound. He attended four lectures by Humphry Davy at the Royal Institution in 1812, wrote them up, bound the notes, and sent them to Davy, who hired him as an assistant the next year; on a tour of Europe Davy's wife treated him as a servant. Davy is often said to have called Faraday his greatest discovery. Faraday had almost no mathematics, and did not need it: in 1821 he built the first electric motor (a wire circling a magnet in a dish of mercury), on 29 August 1831 he wound two coils on an iron ring and saw a galvanometer kick when he connected and disconnected the first, and by October he had a copper disc turning between the poles of a magnet producing a steady current, the first generator. He drew lines of force, which the mathematicians thought childish and which Maxwell thought was the truth. He discovered the laws of electrolysis, the Faraday cage (1836), and the rotation of polarised light by a magnetic field (1845), the first link between light and magnetism. He refused a knighthood and twice refused the presidency of the Royal Society, advised on lighthouses, wrote to *The Times* in 1855 about the filth of the Thames, and founded the Christmas Lectures for children. The two famous quips, "what use is a newborn baby?" and "one day, sir, you may tax it", are not documented and should be taught as legend.

**The setting.** Ørsted had shown in 1820 that a current deflects a compass needle (traditionally, during a lecture demonstration); within weeks Ampère had the force between currents; Arago had magnetised iron with a coil. Electricity made magnetism. Nobody could make magnetism produce electricity.

**The crisis.** The reverse effect had to exist by symmetry, and had been sought for a decade, but everybody was looking for a steady effect from a steady magnet.

**The idea, on the board.**

1. *Flux.* $\Phi_B = \int\vec B\cdot d\vec A$ through a loop. The quantity that matters is not the field but its flux through the circuit.
2. *Faraday's law.* $\mathcal{E} = -\,d\Phi_B/dt$. The induced EMF equals the rate of change of flux; only *change* produces current, which is why the ring only responded at switch-on and switch-off. Three ways to change flux: change $B$, change the area, change the angle. Each is an industry.
3. *Lenz's law.* The minus sign: the induced current opposes the change that made it. Energy conservation demands it; without it a generator would run away.
4. *The generator.* A loop of area $A$ turning at angular speed $\omega$ in field $B$: $\Phi = BA\cos\omega t$, so $\mathcal{E} = BA\omega\sin\omega t$: alternating voltage, amplitude proportional to speed. That sentence is the electricity grid.
5. *The motor is the generator backwards.* A spinning motor generates a back-EMF $K_e\omega$ that opposes the supply; the current is $(V - K_e\omega)/R$, which is why a stalled motor draws the most current and why the site's Mechatronics panel has $V = L\,di/dt + Ri + K_e\dot\theta$.
6. *Field.* Faraday's lines of force fill space and carry energy; the field is real, and Maxwell will write its equations of motion.

**Numbers for the board.** A brushless drone motor with $K_v = 1000$ rpm/V has $K_e = 1/(1000\times2\pi/60) = 9.5$ mV per rad/s; at 8000 rpm (838 rad/s) it generates 8 V of back-EMF, so on a 12 V battery with 0.1 Ω winding resistance the current is $(12 - 8)/0.1 = 40$ A, while at stall it would be 120 A: the reason for a soft start. A bicycle dynamo: 20 turns, $A = 5$ cm², $B = 0.3$ T, at 3000 rpm (314 rad/s): peak EMF $= NBA\omega = 20\times0.3\times5\times10^{-4}\times314 = 0.94$ V, so a real dynamo uses more turns and a stronger field. Wireless phone charging (Qi) is a transformer with an air gap at 100–200 kHz; the frequency is high because $\mathcal{E}$ scales with $\omega$ and the coils are small.

**Demonstrations.** The best demonstration in the whole course: a strong neodymium magnet dropped down a vertical copper pipe falls in slow motion, while a non-magnetic slug drops through instantly. Lenz's law you can see. A coil, a magnet and an LED: the LED flashes only while the magnet moves. A hand-crank generator that becomes hard to turn when its lamp is connected (Lenz again: the load is felt as torque).

**Questions students ask.** *If the magnet is stationary and the coil moves, or vice versa, is it the same physics?* The same EMF, but in 1905 Einstein pointed out that the explanations were different (a magnetic force on moving charges versus an induced electric field), and that asymmetry is the first sentence of his relativity paper. *Why does the transformer need AC?* Because only changing flux induces; DC gives one kick and then nothing.

**The engineering bridge.** Generators and the grid, transformers, induction motors (Tesla, §8.5), eddy-current brakes, induction hobs, magnetic encoders, the pickup on an electric guitar, RFID and wireless charging, and the current transformers that measure the grid itself.

**On the site.** Card *Faraday*; Master equation *Faraday's law*; self-test Q10; Engineering matrix, Mechatronics (Electromagnetic Actuation).

### 8.4 Maxwell: the electromagnetic synthesis (1865)

**Hook.** James Clerk Maxwell was nicknamed "Dafty" at school in Edinburgh, wrote a paper on ovals at fourteen that a professor read to the Royal Society of Edinburgh on his behalf, proved that Saturn's rings must be a swarm of particles (1857; Voyager confirmed it in 1980), and made the first colour photograph, of a tartan ribbon, in 1861. He also invented the demon that bears his name (1867) and the statistical treatment of gases. In 1861–62 he built an elaborate mechanical model of the electromagnetic field, vortices in a fluid with tiny "idle wheels" between them, and found that disturbances in it travelled at a speed fixed by the electric and magnetic constants: 310,740 km/s, using numbers Weber and Kohlrausch had measured. Fizeau had measured the speed of light at 314,858 km/s. Maxwell wrote that he could scarcely avoid concluding that light itself was an electromagnetic wave. In 1865 he threw the mechanical scaffolding away and published the field equations on their own; the 1873 *Treatise* followed, and he became the first Cavendish Professor. He died at 48, of the same cancer that had killed his mother at the same age. The compact four-equation form students learn is Heaviside's (1884); Maxwell had twenty.

**The setting.** Coulomb, Gauss, Ampère and Faraday had four separate laws. Faraday's field lines lacked equations; the mathematicians' equations lacked a field.

**The crisis.** Ampère's law, $\nabla\times\vec B = \mu_0\vec J$, was inconsistent with conservation of charge: take the divergence of both sides, and since $\nabla\cdot(\nabla\times\vec B) = 0$ you need $\nabla\cdot\vec J = 0$, which is false while a capacitor charges. Draw the capacitor: a loop around the wire has current through one surface spanning it and none through a surface passing between the plates. Something was missing (self-test Q2).

**The idea, on the board.**

1. *Displacement current.* Between the plates the electric field is changing; add $\mu_0\varepsilon_0\,\partial\vec E/\partial t$ to Ampère's law and the inconsistency disappears. A changing $\vec E$ makes $\vec B$, as a changing $\vec B$ makes $\vec E$.
2. *The four equations.* Gauss (charge makes diverging $\vec E$), Gauss for magnetism (no monopoles), Faraday (changing $\vec B$ curls $\vec E$), Ampère–Maxwell (current and changing $\vec E$ curl $\vec B$). Write them, read each aloud as a sentence.
3. *The wave equation.* In empty space take the curl of Faraday's law and substitute Ampère–Maxwell: $\nabla^2\vec E = \mu_0\varepsilon_0\,\partial^2\vec E/\partial t^2$. This is d'Alembert's equation with $v = 1/\sqrt{\mu_0\varepsilon_0}$. Compute it on the board: $\mu_0 = 4\pi\times10^{-7}$, $\varepsilon_0 = 8.854\times10^{-12}$, product $1.113\times10^{-17}$, so $v = 2.998\times10^8$ m/s. Two constants measured with coils and capacitors give the speed of light. Pause here; it is the most astonishing line in classical physics.
4. *The plane wave.* $\vec E$ and $\vec B$ perpendicular to each other and to the direction of travel, in phase, with $E = cB$; the energy flux is $\vec S = \vec E\times\vec B/\mu_0$ and the ratio $E/H = \sqrt{\mu_0/\varepsilon_0} = 377\ \Omega$ is the impedance of free space. The site's Maxwell lab draws exactly this.
5. *Light is transverse*, as Fresnel had shown; the spectrum runs from radio to gamma with one set of equations.

**Numbers for the board.** A half-wave dipole for 2.4 GHz Wi-Fi is $\lambda/2 = 6.25$ cm; for 433 MHz telemetry a quarter-wave whip is 17.3 cm; students can measure both on modules in the lab. A microwave oven runs at 2.45 GHz; a chocolate bar heated without the turntable shows melted spots every half wavelength, 6.1 cm apart, and $c = 2\times0.061\times2.45\times10^9 = 2.99\times10^8$ m/s falls out. Sunlight delivers about 1 kW/m² at the ground; from $S = E^2/377$ the electric field amplitude is $\sqrt{2\times1000\times377} = 870$ V/m.

**Demonstrations.** The chocolate-bar experiment (take the turntable out). A near-field probe (a loop of wire on an oscilloscope) held near a switching power supply, showing the radiated field of a "closed" circuit. The site's Maxwell lab with the refractive-index slider.

**Questions students ask.** *What is waving, if there is no aether?* The field itself; there is no medium, and the Michelson–Morley experiment (1887) failed to find one. *Why do the $\vec E$ and $\vec B$ waves not lag each other like voltage and current in a coil?* In a travelling wave each field's spatial variation drives the other's time variation, which keeps them in step; in a standing wave they are a quarter cycle apart.

**The engineering bridge.** All of radio-frequency engineering, antenna design, transmission lines and impedance matching, optics, EMC, and the finite-difference and finite-element solvers that design every antenna and motor. Einstein's relativity is the consequence of taking these equations literally.

**On the site.** Card *Maxwell*; Master equations *Ampère–Maxwell*, *Faraday's law*; Maxwell lab (§11.2); self-test Q2.

### 8.5 Hertz, Tesla and the birth of wireless (1887)

**Hook.** Heinrich Hertz, at Karlsruhe between 1886 and 1888, made sparks jump across a gap in an induction coil and watched, across the darkened lecture hall, tiny sparks answer in the gap of a loop of wire. He measured the wavelength by setting up standing waves against a zinc sheet, focused the waves with a parabolic mirror, refracted them with a prism made of pitch, and showed they were polarised: light's cousin, at a wavelength of a few metres. He also noticed that the receiving spark jumped more easily when ultraviolet light fell on the gap, published it, and left it unexplained; it was the photoelectric effect, and Einstein would explain it in 1905. Asked what his waves were good for, he is reported to have said: nothing whatsoever, they only prove Maxwell right. He died at 36. Within a decade Marconi was sending them across the Channel, and in December 1901 claimed to hear the letter S across the Atlantic (whether he really did is still debated). Nikola Tesla, who had arrived in New York in 1884 almost penniless, patented the AC induction motor in 1888, sold the patents to Westinghouse, and won the "war of the currents" against Edison when Niagara Falls was harnessed with AC in 1895.

**The setting.** Maxwell's theory was accepted by a few and doubted by many; it predicted that any oscillating current should radiate, and nobody had seen it.

**The crisis.** A theory of light that had never been tested at any wavelength other than light's.

**The idea, on the board.**

1. *An oscillating dipole radiates.* Charges accelerating back and forth along a wire produce fields that detach and travel outward at $c$; the frequency is set by the circuit ($f = 1/2\pi\sqrt{LC}$), the wavelength by $\lambda = c/f$. Hertz's large dipole oscillated at tens of megahertz, with wavelengths of several metres; for the mirror and prism experiments he built a smaller one at about 450 MHz, $\lambda = 66$ cm.
2. *Near and far field.* Close to the antenna the fields fall as $1/r^2$ and $1/r^3$; beyond about a wavelength the radiated field falls as $1/r$ and the power as $1/r^2$. Sketch both regions; sensors and RFID live in one, communications in the other.
3. *Standing waves.* A reflected wave interferes with the incident one; nodes are $\lambda/2$ apart. Hertz measured $\lambda$ with a metal sheet; the microwave oven does the same with chocolate.
4. *The spectrum.* Same equations from 30 kHz (submarine communication) to 30 EHz (gamma rays): only the source and the detector differ.
5. *Induction motor.* Three coils fed with three-phase current make a rotating magnetic field (the physics of §8.3); it induces currents in a squirrel-cage rotor, which is dragged around a little slower than the field. No brushes, no commutator, nothing to wear: Tesla's motor runs most of the world's pumps and fans.

**Numbers for the board.** FM radio at 100 MHz: $\lambda = 3$ m, so a car aerial of 75 cm is a quarter wave. A LoRa module at 868 MHz: $\lambda = 34.5$ cm. Radar ranging: a pulse returning after 6.67 μs has travelled to a target 1 km away and back. A 4-pole induction motor on 50 Hz mains has a synchronous speed of $120f/p = 1500$ rpm and runs at about 1450 rpm; the 3 % difference, the slip, is what produces the torque.

**Demonstrations.** Hertz's experiment in thirty seconds: click a piezoelectric gas lighter near an AM radio tuned between stations and hear the spark. A cheap 433 MHz transmitter and a length of wire as antenna, with a software-defined-radio dongle showing the signal on a laptop. A three-phase rotating field with three coils and a compass, if the department has the demonstration set.

**Questions students ask.** *Why does Wi-Fi go through walls but not through metal?* The wall is a dielectric that attenuates; metal reflects because its free electrons cancel the field within a skin depth of microns. *Why did Tesla's AC beat Edison's DC?* Because transformers (Faraday) let AC be sent at high voltage with low $I^2R$ loss and stepped down at the user; DC could not be transformed until power electronics arrived a century later.

**The engineering bridge.** Radio, radar, LiDAR, GPS signals, Bluetooth and Wi-Fi, RFID, wireless charging, antenna design, EMC compliance testing, and the induction motors and variable-frequency drives of industrial automation.

**On the site.** Card *Hertz & Tesla*; Maxwell lab (§11.2); Engineering matrix, Electrical.

---

## 9. Era 5 — The Spacetime Revolution (1905–1916)

**Lecture at a glance.** One 90-minute lecture, or two if the light-clock derivation and the GPS calculation are both done in full. Objectives: state the two postulates and derive time dilation from a light clock; use $\gamma$ for a muon and for a GPS satellite; state the equivalence principle and compute the gravitational frequency shift $gh/c^2$; explain the net GPS clock offset. Board plan: (1) the light clock; (2) $\gamma = 15.8$ for the muon; (3) the falling lift; (4) $\Delta f/f = gh/c^2$ and the two GPS numbers.

The theme: relativity is not exotic. A mechatronics engineer who uses a GNSS receiver is using both theories every second, and the numbers are small only because $c$ is large; they are not zero. Teach it as the physics of clocks.

### 9.1 Special relativity (1905)

**Hook.** In 1905 Albert Einstein was a "technical expert, third class" at the Swiss patent office in Bern, examining patents for electrical devices, having failed to get an academic job. In the evenings he met two friends, Habicht and Solovine, in what they called the Olympia Academy, to read Hume, Mach and Poincaré. That year he published a paper on the photoelectric effect (§10.2), one on Brownian motion, one on special relativity, and one deriving $E = mc^2$, plus his doctoral thesis. The relativity paper, received on 30 June, cites no literature and thanks one person, his friend Michele Besso. Its first paragraph is about Faraday's magnet and coil (§8.3): the physics depends only on relative motion, but the explanations differ, and Einstein found that asymmetry intolerable. He later said the question had been with him since he was sixteen and wondered what a light wave would look like if he could ride alongside it. His old mathematics teacher Hermann Minkowski, who had called him a lazy dog, gave the theory its four-dimensional form in 1908, announcing that space by itself and time by itself were doomed to fade away. The Michelson–Morley experiment (1887) had failed to detect the aether; Lorentz and Poincaré had the transformation equations by 1904–05; Einstein's contribution was to derive everything from two postulates and to take the result about time literally.

**The setting.** Maxwell's equations gave one speed for light and did not say relative to what. Galileo's relativity said all inertial frames are equivalent. The two seemed incompatible.

**The crisis.** If the aether frame existed, the Earth's motion through it should be measurable; it was not.

**The idea, on the board.**

1. *Two postulates.* The laws of physics are the same in every inertial frame; the speed of light in vacuum is $c$ in every inertial frame, regardless of the motion of the source.
2. *The light clock.* A pulse bounces between mirrors a distance $h$ apart; one tick is $2h/c$. Seen from a frame in which the clock moves at $v$, the pulse travels a longer diagonal path, $2\sqrt{h^2 + (vt/2)^2}$, but still at $c$, so the tick takes longer: $\Delta t = \gamma\,\Delta t_0$ with $\gamma = 1/\sqrt{1 - v^2/c^2}$. Moving clocks run slow, and the derivation needs nothing but Pythagoras and the second postulate.
3. *Consequences.* Length contraction $L = L_0/\gamma$; relativity of simultaneity (two events simultaneous in one frame are not in another, which is the key to every "paradox"); velocity addition; the Lorentz transformation as the general rule.
4. *Energy and momentum.* $E = \gamma mc^2$, $p = \gamma mv$, $E^2 = (pc)^2 + (mc^2)^2$. At rest $E = mc^2$: mass is a form of energy. For $v \ll c$, $E \approx mc^2 + \tfrac{1}{2}mv^2$: Newton is the low-speed limit.
5. *The muon.* Cosmic-ray muons live 2.2 μs at rest and are created 15 km up; at 0.998$c$ they should travel 660 m before decaying, yet they reach the ground. With $\gamma = 15.8$ they live 35 μs in our frame and travel 10 km; in their own frame the atmosphere is contracted to 1 km. Frisch and Smith measured this on Mount Washington in 1962.

**Numbers for the board.** A GPS satellite moves at 3.87 km/s: $\gamma - 1 \approx v^2/2c^2 = 8.3\times10^{-11}$, so its clock loses $8.3\times10^{-11}\times86{,}400 = 7.2$ μs per day relative to the ground. A 100 kV electron microscope: kinetic energy 0.1 MeV against a rest energy of 0.511 MeV, so $\gamma = 1.196$, $v = 0.55c$, and the de Broglie wavelength is 3.7 pm rather than the 3.9 pm the non-relativistic formula gives (self-test Q6). One gram of mass is $9\times10^{13}$ J, or 25 GWh, the daily output of a large power station.

**Demonstrations.** None with apparatus; two on paper. Draw the light clock and have the class derive $\gamma$ themselves. Then draw a spacetime diagram for the "pole in the barn" and let the relativity of simultaneity resolve it. If the department can borrow a cosmic-ray detector (the open-source CosmicWatch design costs about 100 dollars to build), the muon rate at ground level is the demonstration.

**Questions students ask.** *Which clock is really slow?* Each observer sees the other's clock slow; the situation is symmetric until one of them accelerates to come back, which breaks the symmetry (the twin case). *Does mass increase with speed?* Modern usage keeps $m$ invariant and lets $E$ and $p$ carry the $\gamma$; "relativistic mass" is an older bookkeeping that confuses more than it helps.

**The engineering bridge.** GPS (below), particle accelerators, synchrotron light sources, electron microscopes, the design of high-speed electronics where signal delay at $c$ across a board is the timing budget, and nuclear energy ($E = mc^2$).

**On the site.** Card *Special relativity*; Master equation *Energy–momentum*; self-test Q4, Q6.

### 9.2 General relativity (1915)

**Hook.** In 1907, still in the patent office, Einstein had what he called the happiest thought of his life: a person falling freely does not feel their own weight. Gravity, locally, is indistinguishable from acceleration, and can be transformed away. Turning that into a theory took eight years and, by his own admission, more mathematics than he had; in 1912 he wrote to his friend Marcel Grossmann for help with Riemannian geometry. In November 1915, in a race he was only partly aware of with the mathematician David Hilbert, he presented the final field equations, and on 18 November calculated that they accounted for the 43 arcseconds per century of Mercury's perihelion advance that Newton's theory could not; he wrote that he was beside himself with joy. The 1919 solar eclipse expeditions led by Eddington measured the bending of starlight and made Einstein the most famous scientist alive ("Lights All Askew in the Heavens", ran the *New York Times* headline). In 1977 the first GPS test satellite carried a clock that could be switched between an uncorrected rate and one offset by the predicted relativistic amount, so that the engineers could check the theory before relying on it. The prediction held.

**The setting.** Special relativity worked for inertial frames but left gravity as Newton's instantaneous action at a distance, incompatible with a maximum speed $c$.

**The crisis.** Mercury's orbit disagreed with Newton by 43″ per century, a discrepancy Le Verrier had found in 1859 and attributed to an unseen planet, Vulcan, which does not exist.

**The idea, on the board.**

1. *The equivalence principle.* In a closed lift you cannot tell gravity from acceleration. Therefore light must bend in a gravitational field (it bends in an accelerating lift), and clocks must run at different rates at different heights.
2. *Gravitational time dilation, without geometry.* A light pulse sent upward a height $h$ in a lift accelerating at $g$ arrives when the receiver has gained speed $gh/c$, so it is Doppler-shifted to lower frequency by $\Delta f/f = gh/c^2$. By equivalence, a clock lower in a gravitational field runs slow by the same fraction. Pound and Rebka measured this in 1959 up a 22.5 m tower at Harvard: $\Delta f/f = 2.5\times10^{-15}$, using the Mössbauer effect.
3. *Geometry.* Matter tells spacetime how to curve; curved spacetime tells matter how to move. The field equations $G_{\mu\nu} + \Lambda g_{\mu\nu} = (8\pi G/c^4)\,T_{\mu\nu}$: read them from the site's equation inspector, note the units, and note the size of $8\pi G/c^4 \approx 2\times10^{-43}$, which is why spacetime is so stiff and gravitational waves so weak.
4. *Three classic tests.* Perihelion of Mercury (43″/century), light bending (1.75″ at the Sun's limb, twice the Newtonian value), gravitational redshift. Modern tests: Shapiro delay, binary pulsars, gravitational waves (§10.7).

**Numbers for the board.** The GPS clock, done in full. A satellite at $r = 26{,}571$ km sits in a weaker potential than the ground, so its clock runs *fast* by $\frac{GM}{c^2}\left(\frac{1}{R_\oplus} - \frac{1}{r}\right) = \frac{3.986\times10^{14}}{8.988\times10^{16}}\left(1.570\times10^{-7} - 3.764\times10^{-8}\right) = 5.3\times10^{-10}$, which is 45.7 μs per day (the site quotes 45.9 with a small orbital-eccentricity correction). Special relativity slows it by 7.2 μs per day (§9.1). Net: the satellite clock gains 38.5 μs per day; at $c$ that is 11.6 km of position error per day, so the clocks are built to run slow by $4.465\times10^{-10}$ before launch, ticking at 10.22999999543 MHz instead of 10.23. Then the Pound–Rebka number, and the everyday one: a clock on a mountain 1 km up gains $gh/c^2 \times 86{,}400 = 9.4$ ns per day, which optical clocks can now measure over a height difference of a centimetre.

**Demonstrations.** The stretched rubber sheet with a heavy ball, used with an explicit warning that it shows curvature of *space* only and needs gravity to work, so it is a metaphor, not a model. Better: the site's cannon lab on its circular preset, with the calculation of what a clock on that projectile does: at 400 km the gravitational gain is only 3.6 μs per day while the 7.67 km/s speed costs 28 μs per day, so a low-orbit clock runs *slow* by about 25 μs per day, and the two effects cancel only at about 3,200 km altitude. The GPS satellites, four times higher, are on the other side of that crossover. A video of the 1919 eclipse plates or of the Hafele–Keating experiment (1971), in which caesium clocks flown around the world on airliners came back offset by the predicted tens of nanoseconds.

**Questions students ask.** *If the satellite clock gains 38 μs a day, why not just correct in software?* That is done for residual effects; the main offset is corrected in hardware because the whole system's timing is built on the nominal frequency. *Is gravity a force or not?* In general relativity it is not a force but the geometry of free fall; an accelerometer in free fall reads zero, as every phone's does when dropped, which is a cheap demonstration of the equivalence principle.

**The engineering bridge.** GNSS positioning, satellite geodesy, timekeeping networks, the relativistic corrections in interplanetary navigation, and gravitational-wave detectors, which are the most sensitive mechatronic systems ever built.

**On the site.** Card *General relativity*; Master equation *Einstein field equations*; self-test Q4; cannon lab (§11.1) for the orbital numbers.

---

## 10. Era 6 — The Quantum Realm, Solid State and Modern Frontiers (1900–present)

**Lecture at a glance.** Four 90-minute lectures (Planck and the photon; Bohr and de Broglie; wave mechanics; the transistor and LIGO). Objectives: use Planck's and Wien's laws for thermal sources; apply $K_{max} = hf - \Phi$; derive the Bohr radius and energies; compute de Broglie wavelengths; solve the particle in a box and estimate tunnelling; explain a p–n junction and a transistor switch; explain how an interferometer measures $10^{-18}$ m. Board plan: (1) $\lambda_{max}T$ and $E = hf$; (2) the photoelectric stopping potential; (3) $r_n = n^2 a_0$; (4) $\lambda = h/p$; (5) $E_n = n^2h^2/8mL^2$; (6) the diode equation; (7) $h = \Delta L/L$.

The theme: every device a mechatronics engineer touches, from the LED on a status panel to the MOSFET in a motor driver to the laser in a LiDAR, exists because five people between 1900 and 1927 accepted that energy comes in lumps and that particles are waves. This era ends with an engineering achievement, LIGO, that used all of the preceding physics at once.

### 10.1 Planck: energy quantization (1900)

**Hook.** When Max Planck asked his Munich professor Philipp von Jolly in 1874 whether he should study physics, Jolly told him that almost everything had already been discovered and only a few holes remained to be filled. Planck, a gifted pianist who later played duets with Einstein, went into physics anyway to fill the holes. On Sunday 7 October 1900 his colleague Heinrich Rubens came to tea with new infrared measurements of blackbody radiation that broke Wien's law at long wavelengths; by that evening Planck had guessed a formula that fitted everything, and by 14 December he had a derivation, which required him to assume that the oscillators in the cavity walls could only hold energy in multiples of $hf$. He called it, in a letter thirty years later, an act of desperation. He did not believe the quantum was real for another decade. His later life was marked by tragedy: a son killed at Verdun in 1916, two daughters dead in childbirth, and his son Erwin executed in 1945 for the plot against Hitler. He is also the source of the observation that a new scientific truth triumphs not by convincing its opponents but because its opponents eventually die.

**The setting.** Kirchhoff had shown (1859) that a cavity in equilibrium emits a universal spectrum depending only on temperature; Stefan and Boltzmann had the $T^4$ law; Wien had the displacement law and a formula good at short wavelengths.

**The crisis.** Wien's law failed in the infrared. Classical equipartition, applied honestly (Rayleigh 1900, Jeans 1905), gave a spectrum rising without limit at high frequency, a result Ehrenfest later called the ultraviolet catastrophe. Teach the history straight: the catastrophe was named in 1911 and was not what drove Planck; the infrared data were.

**The idea, on the board.**

1. *Counting modes.* A cavity supports standing waves; the number of modes per unit frequency grows as $f^2$. Give each $k_BT$ (equipartition) and the energy density diverges. Draw the Rayleigh–Jeans curve shooting off the top of the board.
2. *Planck's move.* If an oscillator of frequency $f$ can only hold $0, hf, 2hf, \dots$, then at temperatures where $hf \gg k_BT$ it almost never gets excited: high-frequency modes are frozen out. The average energy per mode becomes $hf/(e^{hf/k_BT} - 1)$ instead of $k_BT$, and the spectrum turns over. Planck's law: $u(f) \propto f^3/(e^{hf/k_BT} - 1)$.
3. *Consequences.* Wien's displacement law $\lambda_{max}T = 2.898\times10^{-3}$ m·K and the Stefan–Boltzmann law $P = \sigma A T^4$ both follow, with $\sigma$ expressed in terms of $h$, $k_B$ and $c$. Planck extracted $h = 6.55\times10^{-34}$ J·s and $k_B$ from the data (modern values: $h = 6.626\times10^{-34}\ \mathrm{J\,s}$ and $k_B = 1.381\times10^{-23}\ \mathrm{J/K}$) and, from $k_B$, Avogadro's number and the charge of the electron, all better than anyone had them.
4. *Emissivity.* Real surfaces emit $\varepsilon\sigma T^4$ with $0 < \varepsilon < 1$; polished metal about 0.05, black paint 0.95, human skin 0.98. Every infrared thermometer assumes a value; a wrong one gives a wrong temperature.

**Numbers for the board.** The Sun (5800 K) peaks at 500 nm, which is why eyes evolved to see there; a human body (310 K) peaks at 9.3 μm, in the long-wave infrared band (8–14 μm) that thermal cameras and PIR motion sensors use; a soldering iron at 620 K peaks at 4.7 μm and does not glow at all; an object must reach about 800 K (the Draper point) before its tail reaches the visible and it glows dull red. A 100 W incandescent bulb at 2800 K radiates only a few per cent of its power as visible light; an LED converts 40 % or more. Radiative cooling of a spacecraft: a 1 m² radiator at 300 K with $\varepsilon = 0.9$ dumps $0.9\times5.67\times10^{-8}\times300^4 = 413$ W into space, and there is no other way to get rid of heat up there.

**Demonstrations.** An infrared thermometer pointed at a shiny kettle and at a piece of black tape stuck on it: the tape reads the true temperature, the metal reads far lower (emissivity). A lamp on a dimmer, turned up slowly: dull red, orange, yellow, white, Wien's law by eye. A thermal camera, if available, watching a hand print fade or a soldering iron heat up.

**Questions students ask.** *Does $E = hf$ apply to a radio wave?* Yes: a 100 MHz photon carries $4\times10^{-7}$ eV, so a radio signal is a flood of $10^{20}$ photons per second and behaves classically; quantization matters when $hf$ is comparable to $k_BT$ or to an atomic energy. *Why is the sky blue and not violet, if shorter wavelengths scatter more?* Because sunlight has less violet, the eye is less sensitive to it, and the eye's colour response mixes; scattering ($\propto 1/\lambda^4$, Rayleigh) is only part of the answer.

**The engineering bridge.** Thermal imaging, non-contact thermometry, radiative heat transfer in engines and spacecraft, LED and lamp design, and the quantum itself, which every later card depends on.

**On the site.** Card *Planck*; self-test Q8; Bohr lab (§11.4) for the next step.

### 10.2 Einstein: the photoelectric effect and the photon (1905)

**Hook.** Hertz had noticed in 1887 that ultraviolet light helped sparks jump; Philipp Lenard showed in 1902 that light ejects electrons from metal with an energy that depends on the light's colour but not on its brightness, which no wave theory could explain. Einstein's 1905 paper, the one he described to a friend as "very revolutionary", proposed that light arrives in packets of energy $hf$. The American physicist Robert Millikan found the idea so implausible that he spent ten years trying to disprove it, built the apparatus to measure the stopping potential precisely, and in 1916 confirmed Einstein's equation exactly; Millikan's Nobel Prize (1923) cited that work. Einstein's own Nobel Prize (for 1921) was awarded for the photoelectric law, with relativity conspicuously not mentioned; under the terms of his divorce, the prize money went to his first wife, Mileva Marić. Lenard, whose experiments had started it all, became a Nazi and a bitter public enemy of Einstein.

**The setting.** Planck had quantized the *emission* of radiation by oscillators; light itself was still Maxwell's continuous wave, and the wave theory had just won the argument with Young and Fresnel.

**The crisis.** Three facts. Below a threshold frequency no electrons are emitted no matter how bright the light. Above it, the maximum kinetic energy rises with frequency and does not depend on intensity. Emission is instantaneous even in dim light, whereas a wave would need time to deliver enough energy to one electron.

**The idea, on the board.**

1. *Photons.* Light of frequency $f$ is absorbed in quanta of energy $hf$; one photon ejects one electron.
2. *The equation.* $K_{max} = hf - \Phi$, where $\Phi$ is the work function, the energy needed to leave the metal. Threshold at $hf_0 = \Phi$. Measured by the stopping potential $V_0$ that just halts the fastest electrons: $K_{max} = eV_0$. A plot of $V_0$ against $f$ is a straight line of slope $h/e$: that is how Millikan measured $h$.
3. *Why waves cannot do it.* Intensity is energy per area per time; a wave spreads its energy over the surface and would need minutes to give one atom an electron-volt, but emission takes nanoseconds.
4. *Duality.* The same light shows interference (§8.2) and photons. Neither picture is wrong; the next three cards make the situation general.

**Numbers for the board.** Sodium, $\Phi = 2.28$ eV: threshold wavelength $1240/2.28 = 544$ nm, so green light barely works and red does not; violet light at 400 nm (3.10 eV) gives $K_{max} = 0.82$ eV and a stopping potential of 0.82 V. A silicon photodiode responds only to photons with energy above the bandgap, 1.12 eV, i.e. wavelengths below 1.1 μm, which is why silicon cameras see near-infrared and why fibre-optic receivers at 1550 nm use InGaAs instead. A 5 mW red laser pointer emits $5\times10^{-3}/(1.9\times1.6\times10^{-19}) = 1.6\times10^{16}$ photons per second.

**Demonstrations.** A solar cell and a multimeter under a lamp with colour filters gives a photocurrent for every visible colour, because silicon's threshold lies in the infrared at 1.1 μm; use it to show that the current follows the photon *count*, not the colour, then point out that an infrared remote control (940 nm) still drives it while a longer-wavelength source would not. To see a real threshold, use the classic demonstration: a freshly sanded zinc plate on a charged electroscope is discharged by an ultraviolet lamp but not by a bright visible lamp, however close.

**Questions students ask.** *Is a photon a particle or a wave?* It is a quantum of the electromagnetic field, and it shows whichever behaviour the experiment asks about; "both" is a better answer than "neither". *If light is photons, what is the frequency of a photon?* The frequency of the field mode it belongs to; the photon is not a little ball with a frequency painted on it.

**The engineering bridge.** Photodiodes, solar cells (the 1954 Bell Labs silicon cell was the first practical one; the Shockley–Queisser limit of 33.7 % for a single junction is Planck's spectrum meeting the bandgap), image sensors, photomultipliers, optical encoders and every light-based sensor in a mechatronic system.

**On the site.** Card *Einstein (photoelectric)*; Bohr lab (§11.4) for the emission side; self-test Q9 for the bandgap.

### 10.3 Bohr: the quantized atom and atomic spectra (1913)

**Hook.** Niels Bohr was a good goalkeeper; his brother Harald was better, and won an Olympic silver medal with Denmark's football team in 1908. In 1912 Niels was in Manchester with Rutherford, whose nuclear atom had a fatal flaw: an orbiting electron radiates, and should spiral into the nucleus in about $10^{-11}$ s. In February 1913 a colleague showed Bohr the formula that a Swiss schoolteacher, Johann Balmer, had found in 1885 at the age of sixty for the wavelengths of hydrogen's visible lines, and Bohr later said that as soon as he saw it the whole thing was clear. His trilogy of papers appeared that year. Bohr went on to found the institute in Copenhagen where quantum mechanics was argued into shape, to conduct a decades-long debate with Einstein about what it meant, and, in 1943, to escape occupied Denmark to Sweden and then to Britain in the empty bomb bay of a Mosquito aircraft, nearly dying of oxygen starvation on the way because his large head did not fit the helmet. When Denmark awarded him the Order of the Elephant in 1947 he designed his own coat of arms with the yin-yang symbol and the motto *contraria sunt complementa*, opposites are complementary.

**The setting.** Rutherford's scattering experiments (1911) had put the positive charge in a tiny nucleus with electrons outside. Spectroscopists had a century of line wavelengths and empirical formulas, and no theory of any of them.

**The crisis.** Classical electrodynamics predicted that atoms could not exist and that their light, if any, should be a continuous smear.

**The idea, on the board.**

1. *Two postulates.* Electrons occupy stationary orbits in which they do not radiate, selected by the condition that angular momentum is a multiple of $\hbar$: $L = mvr = n\hbar$. Radiation occurs only in a jump between orbits, with $hf = E_i - E_f$.
2. *The derivation, in six lines.* Coulomb force supplies the centripetal force: $ke^2/r^2 = mv^2/r$. With $mvr = n\hbar$, eliminate $v$: $r_n = n^2\hbar^2/(mke^2) = n^2 a_0$, $a_0 = 0.0529$ nm. The energy is $E = \tfrac{1}{2}mv^2 - ke^2/r = -ke^2/2r$ (the virial theorem in disguise), so $E_n = -\frac{mk^2e^4}{2\hbar^2}\frac{1}{n^2} = -\frac{13.6\ \text{eV}}{n^2}$. Do this on the board slowly; it is the first time students see a constant of nature (13.6 eV) come out of other constants.
3. *Spectra.* $\frac{1}{\lambda} = R_H\left(\frac{1}{n_f^2} - \frac{1}{n_i^2}\right)$ with $R_H = 1.097\times10^7$ m⁻¹: Balmer's formula ($n_f = 2$) derived, and the Lyman ($n_f = 1$) and Paschen ($n_f = 3$) series predicted and found. Show the site's spectrum strip: the lines crowd toward each series limit, as $1/n^2$ demands.
4. *Absorption.* The same energies in reverse: a gas absorbs exactly the wavelengths it can emit. Fraunhofer's dark lines in the solar spectrum are hydrogen, sodium, iron in the Sun's atmosphere; this is how the composition of stars and of exoplanet atmospheres is measured.
5. *Limits.* The model fails for helium, says nothing about line intensities, and gives the ground state the wrong angular momentum. It is a scaffold; Schrödinger replaces it in §10.5, and the correct answers for hydrogen happen to coincide.

**Numbers for the board.** Hα: $13.6(1/4 - 1/9) = 1.89$ eV, 656 nm, the red of hydrogen discharge tubes and of every emission nebula. Ionisation from the ground state: 13.6 eV, a photon of 91.2 nm. Sodium's yellow street-lamp light (589 nm, 2.1 eV) and the red of a helium–neon laser (632.8 nm) are transitions of the same kind in heavier atoms. An LED's colour is set the same way by its bandgap: 1.9 eV red, 2.3 eV green, 2.8 eV blue, which is why blue LEDs needed gallium nitride and a Nobel Prize (2014). The caesium atomic clock counts a hyperfine transition at 9,192,631,770 Hz, and that number now *defines* the second.

**Demonstrations.** Gas discharge tubes (hydrogen, helium, neon, sodium) viewed through cheap diffraction-grating glasses: each student sees the Balmer lines as separate coloured images of the tube. Flame tests with sodium, lithium, copper and potassium salts on a wire loop. The site's Bohr lab with the six presets, in order of decreasing wavelength.

**Questions students ask.** *Why doesn't the electron radiate in a stationary state?* Bohr simply postulated it; the honest answer arrives with quantum mechanics, where a stationary state has a static probability distribution and no oscillating charge. *Do electrons really orbit?* No. The radii $n^2a_0$ survive as the most probable distances, but the picture of a planet is the thing this model gets most wrong.

**The engineering bridge.** Spectroscopy in every form (emission, absorption, LIBS, ICP), lasers, LEDs, gas-discharge and plasma lighting, atomic clocks, and the semiconductor bandgap as the solid-state version of $\Delta E$.

**On the site.** Card *Bohr*; Bohr lab (§11.4); Master equation *Schrödinger* for what replaced it.

### 10.4 de Broglie: matter waves (1924)

**Hook.** Louis de Broglie was a prince, later a duke, who began in history and switched to physics under the influence of his elder brother Maurice, an experimental physicist with a private laboratory; during the First World War he served as a radio operator in the transmitter installed on the Eiffel Tower. His 1924 doctoral thesis proposed that if light waves came in particles, particles should come with waves: $\lambda = h/p$. His examiners were unsure what to make of it and sent it to Einstein, who replied that the author had lifted a corner of the great veil. The experimental confirmation was an accident. At Bell Labs, Davisson and Germer were bombarding a nickel target with electrons when a liquid-air bottle burst and oxidised it; to clean the target they baked it, which recrystallised it into a few large crystals, and the electrons scattered off it afterward came out in sharp peaks at the angles Bragg's law gives for X-rays of the same wavelength (1927). The same year George Paget Thomson diffracted electrons through thin metal foils; his father J. J. Thomson had won the Nobel Prize for showing the electron was a particle, and the son won one (1937) for showing it was a wave. De Broglie's own Nobel came in 1929, five years after the thesis.

**The setting.** Bohr's quantum condition $L = n\hbar$ was a rule without a reason.

**The crisis.** Why those orbits?

**The idea, on the board.**

1. *The hypothesis.* $\lambda = h/p$ for every particle; $E = hf$ for every wave. Light's momentum $p = E/c = h/\lambda$ (from relativity, §9.1) is the pattern, extended to matter.
2. *Bohr's rule explained.* An electron wave on a circular orbit must close on itself: $2\pi r = n\lambda = nh/mv$, hence $mvr = n\hbar$. The quantum condition is a standing-wave condition, like a guitar string. Draw an orbit with three wavelengths fitting and one with 2.5 not fitting.
3. *Why we do not see it.* $\lambda$ for a tennis ball at 30 m/s is $6.6\times10^{-34}/(0.058\times30) = 4\times10^{-34}$ m; for an electron at 100 eV it is 0.12 nm, the spacing of atoms in a crystal, so a crystal diffracts electrons as a grating diffracts light.
4. *Bragg diffraction.* $2d\sin\theta = n\lambda$; Davisson and Germer's peak at 50° for 54 eV electrons gave $\lambda = 0.165$ nm, matching $h/p = 0.167$ nm.

**Numbers for the board.** Electrons at 100 kV in a transmission electron microscope: $\lambda = 3.7$ pm (relativistic), a hundred thousand times shorter than visible light, which is why a TEM resolves atoms while an optical microscope stops at 200 nm (self-test Q6). Thermal neutrons at 2200 m/s: $\lambda = 6.63\times10^{-34}/(1.675\times10^{-27}\times2200) = 0.18$ nm, so neutron diffraction maps crystal structures and, because neutrons feel magnetic moments, magnetic order. Buckminsterfullerene molecules (720 atomic mass units) were diffracted through a grating in 1999, with $\lambda = 2.5$ pm.

**Demonstrations.** Standing waves on a string driven by a vibrator: only integer numbers of half-wavelengths fit, quantization you can hold. Tonomura's 1989 video of electrons arriving one at a time and building up an interference pattern is the definitive demonstration and is freely available. Scanning-electron-microscope images of anything the students have made in the workshop, if the department has an SEM.

**Questions students ask.** *Is the electron spread out over the wave?* The wave gives the probability of finding it; a detector always finds a whole electron. That is the content of the next card. *Does a wave belong to one electron or to many?* Tonomura's experiment settles it: one at a time, the pattern still forms.

**The engineering bridge.** Electron microscopy (every semiconductor fab, every failure-analysis lab), electron-beam lithography for the masks that print chips, neutron scattering, the scanning tunnelling microscope, and the wave nature of electrons in every quantum device.

**On the site.** Card *de Broglie*; self-test Q6; Bohr lab (§11.4).

### 10.5 Schrödinger and Heisenberg: wave mechanics and uncertainty (1925–1927)

**Hook.** In June 1925 Werner Heisenberg, 23, fled a hay-fever attack in Göttingen for the treeless island of Helgoland and came back with a mechanics built from tables of numbers that Max Born recognised as matrices; Heisenberg had not known what a matrix was. Six months later Erwin Schrödinger, 38, spent Christmas at a villa in Arosa with a companion whose identity is still unknown and returned with a wave equation, prompted by a challenge from Peter Debye, who had remarked after a seminar on de Broglie's thesis that if there were waves there ought to be a wave equation. In the first half of 1926 Schrödinger published a series of papers that solved the hydrogen atom, the oscillator and the rigid rotor, and showed that his waves and Heisenberg's matrices were the same theory. In 1927 Heisenberg published the uncertainty principle; Bohr corrected the details of his argument but not the result. Schrödinger, who never accepted the Copenhagen interpretation, invented the cat (1935) to show what he thought was absurd about it; it has been on T-shirts ever since. Wolfgang Pauli, whose exclusion principle (1925) explains the periodic table, was said to break apparatus merely by entering a laboratory, a joke his colleagues called the Pauli effect. Schrödinger left Austria in 1938 for Dublin, where his 1944 lectures *What is Life?* proposed that heredity was stored in an "aperiodic crystal" and sent Watson and Crick after the structure of DNA.

**The setting.** Bohr's model worked for hydrogen and for nothing else; de Broglie had waves without an equation; the correspondence with classical mechanics was a set of rules of thumb.

**The crisis.** No theory. The old quantum theory was a collection of rules that happened to work for hydrogen and nowhere else.

**The idea, on the board.**

1. *Motivating the equation.* A free particle wave $\psi = e^{i(kx - \omega t)}$ with $p = \hbar k$ and $E = \hbar\omega$; the operator $-i\hbar\,\partial/\partial x$ extracts $p$ and $i\hbar\,\partial/\partial t$ extracts $E$. Write $E = p^2/2m + V$ as operators acting on $\psi$: $i\hbar\,\partial\psi/\partial t = -\frac{\hbar^2}{2m}\nabla^2\psi + V\psi$. This is not a derivation (Schrödinger's own route was Hamilton's optical analogy, §6.4) but it shows where every symbol comes from.
2. *What $\psi$ means.* Born (1926): $|\psi|^2$ is the probability density. Stationary states have $|\psi|^2$ constant in time, which is why a Bohr orbit does not radiate.
3. *Particle in a box.* Length $L$, $\psi = 0$ at the walls: $\psi_n = \sin(n\pi x/L)$, $E_n = n^2h^2/8mL^2$. Energy is quantized because the wave must fit, exactly de Broglie's standing-wave picture. Smaller box, larger spacing: this is why nanometre-sized crystals (quantum dots) have colours set by their size, the 2023 Nobel Prize.
4. *Tunnelling.* In a region where $V > E$ the wavefunction decays as $e^{-\kappa x}$ with $\kappa = \sqrt{2m(V - E)}/\hbar$; a barrier of width $d$ transmits with probability $\sim e^{-2\kappa d}$. Classically impossible; it is how alpha decay works, how the Sun burns, and how flash memory is written.
5. *Uncertainty.* A wave localised to $\Delta x$ needs a spread of wavenumbers $\Delta k \gtrsim 1/2\Delta x$ (Fourier, §7.1), so $\Delta x\,\Delta p \ge \hbar/2$. It is not a limit of instruments; it is a property of waves, the same one that makes a short pulse broadband.
6. *Spin and exclusion.* Electrons carry spin ½, and no two can share a state (Pauli): hence shells, the periodic table, chemistry, and the fact that solids are solid.

**Numbers for the board.** An electron in a 1 nm box: $E_1 = h^2/8mL^2 = (6.63\times10^{-34})^2/(8\times9.11\times10^{-31}\times10^{-18}) = 6\times10^{-20}$ J $= 0.38$ eV, and $E_2 - E_1 = 1.1$ eV: a photon in the near infrared; make the box 0.5 nm and the gap is 4.5 eV, ultraviolet. Tunnelling through a 1 eV barrier: $\kappa = \sqrt{2\times9.11\times10^{-31}\times1.6\times10^{-19}}/1.05\times10^{-34} = 5.1\times10^9$ m⁻¹, so 1 nm of barrier transmits $e^{-10.2} = 4\times10^{-5}$ and 2 nm transmits $10^{-9}$. For a real metal surface the barrier is about 4.5 eV and $\kappa \approx 10^{10}$ m⁻¹, so the current of a scanning tunnelling microscope changes by a factor of ten for every 0.1 nm of tip height, which is how it images single atoms. A flash memory cell stores charge behind an 8 nm oxide barrier that leaks slowly enough to keep data for ten years.

**Demonstrations.** A string driven at its resonances (the box); a laser beam totally internally reflected in a glass block, with a second block pressed against it: light tunnels across the air gap when it is thinner than a wavelength (frustrated total internal reflection), the optical analogue of the effect. A set of quantum-dot vials under a UV lamp, if the chemistry department has them: the same material, five sizes, five colours.

**Questions students ask.** *Is the cat really both alive and dead?* Schrödinger's point was that the theory, taken naively, seemed to say so; the modern answer involves decoherence, the rapid loss of superposition for any object interacting with its surroundings, which is also the enemy every quantum-computer engineer fights. *Does uncertainty mean we cannot know things?* It means position and momentum are not both defined at once for a wave; it says nothing about our ignorance.

**The engineering bridge.** Band theory and every semiconductor device, tunnel diodes and flash memory, the STM and atomic-force microscope, quantum dots in displays, MRI (nuclear spin), lasers (stimulated emission), and the quantum computers now being engineered.

**On the site.** Cards *Schrödinger & Heisenberg*; Master equations *Schrödinger*, *Uncertainty*; self-test Q9.

### 10.6 The transistor and the solid state (1947)

**Hook.** In the last weeks of 1947 at Bell Laboratories, John Bardeen and Walter Brattain pressed two closely spaced gold contacts, made by slitting gold foil wrapped around a plastic wedge with a razor blade, against a slab of germanium, and on 16 December saw a small signal at one contact appear amplified at the other. A week later they demonstrated it to the laboratory's managers with a voice signal. Their group leader, William Shockley, had not been in the room, was bitterly aggrieved, and over New Year in a Chicago hotel worked out the junction transistor, a sandwich of doped layers that could be manufactured; it is his device that took over. All three shared the 1956 Nobel Prize; Bardeen won a second in 1972 for superconductivity, the only person to win the physics prize twice. Shockley left to found a company in his home town of Palo Alto in 1956, drove away his best engineers within a year (the "traitorous eight", who founded Fairchild, whose alumni founded Intel), and thereby created Silicon Valley by repulsion. The first transistor radio, the Regency TR-1, sold for 49.95 dollars in 1954. In 1958 Jack Kilby built the first integrated circuit; in 1965 Gordon Moore noticed that the number of transistors on a chip was doubling every year or two; more than $10^{22}$ transistors have been made since, more than all the grains of sand on Earth.

**The setting.** Vacuum tubes amplified and switched but were hot, fragile and short-lived; the telephone network needed something better. Quantum mechanics had explained why some solids conduct (Bloch, 1928; Wilson's band theory, 1931) and had predicted that "semi-conductors" could be controlled by impurities.

**The crisis.** Nobody could make a solid-state amplifier. Shockley's field-effect design of 1945 did not work, for reasons Bardeen traced to electrons trapped at the surface, and it was in probing those surface states that the point-contact device appeared.

**The idea, on the board.**

1. *Bands.* Bring $10^{23}$ atoms together and their levels smear into bands. A metal has a partly filled band and conducts; an insulator has a full band separated by a large gap from an empty one; a semiconductor is an insulator with a small gap (silicon 1.12 eV, germanium 0.67 eV) that thermal energy or light can bridge.
2. *Doping.* Phosphorus in silicon donates an electron (n-type); boron accepts one, leaving a hole (p-type). The carrier density is set by the impurity, not by temperature, at one part in a million.
3. *The p–n junction.* Diffusion of carriers across the junction leaves a depletion region with a built-in field; the diode equation $I = I_S(e^{qV/k_BT} - 1)$ follows from the Boltzmann factor (§7.5): forward bias lowers the barrier exponentially. At 300 K, $k_BT/q = 26$ mV, so the current increases tenfold every 60 mV.
4. *The bipolar transistor.* Two junctions back to back; a small base current controls a large collector current, $I_C = \beta I_B$ with $\beta \sim 100$, and $I_C \approx I_S e^{qV_{BE}/k_BT}$.
5. *The MOSFET.* A gate above an insulating oxide creates a conducting channel by the field effect, Shockley's original idea, made to work by Atalla and Kahng in 1959–60 once the silicon surface could be passivated with its own oxide. Complementary pairs (CMOS, 1963) draw almost no current except when switching; that is why a billion of them can sit in your pocket. Switching energy $\tfrac{1}{2}CV^2$ per gate per transition, and the 60 mV per decade subthreshold slope from step 3 sets the lowest voltage at which they can be turned off.

**Numbers for the board.** A gate with $C = 1$ fF at 0.8 V switching at 3 GHz dissipates $\tfrac{1}{2}\times10^{-15}\times0.64\times3\times10^9 = 1$ μW; a billion of them, 1 kW, which is why not all of a chip switches at once and why clock speeds stopped rising around 2005. A motor-driver MOSFET with $R_{DS(on)} = 5$ mΩ at 30 A dissipates 4.5 W of conduction loss plus switching loss of $\tfrac{1}{2}VI(t_r + t_f)f$; at 48 V, 30 A, 50 ns rise and fall times and 20 kHz, that is another 1.4 W. A silicon diode's forward voltage drops about 2 mV per kelvin, which is why a diode is also a thermometer.

**Demonstrations.** The circuit every mechatronics student should build in week one: a transistor as a switch driving an LED from a microcontroller pin through a base resistor. A diode's exponential characteristic traced on a curve tracer or with a multimeter and a resistor ladder. A thermistor in a cup of hot water, the Boltzmann factor as a temperature sensor. A germanium point-contact diode (still sold) and a crystal radio, the 1947 device's grandparent.

**Questions students ask.** *Why silicon and not germanium?* Silicon's oxide is a superb insulator and passivating layer, its bandgap is larger (less leakage at high temperature), and it is the second most abundant element in the crust. *Is Moore's law over?* Transistor counts still rise through 3D stacking, but Dennard scaling (constant power density as transistors shrink) ended in the mid-2000s, which is why clock rates plateaued and cores multiplied.

**The engineering bridge.** All of electronics: microcontrollers, motor drivers (H-bridges of MOSFETs), sensors with on-chip amplifiers, power converters, memory, and the CMOS image sensors that let robots see.

**On the site.** Card *The transistor*; self-test Q9; Engineering matrix, Computer & Semiconductor.

### 10.7 LIGO: gravitational waves (2015)

**Hook.** At 09:50:45 UTC on 14 September 2015, during an engineering run before the official start of observations, the two LIGO detectors, in Louisiana and Washington state, recorded a chirp lasting a fifth of a second: two black holes of 36 and 29 solar masses, 1.3 billion light-years away, spiralling together and merging into one of 62, with three solar masses converted into gravitational radiation. For that fifth of a second the event radiated more power than all the stars in the observable universe combined. Einstein had predicted such waves in 1916 and had tried, in 1936, to prove they did not exist; the journal's referee found the error, Einstein withdrew the paper in a fury at the impertinence of peer review, and then corrected it. Joseph Weber claimed detections with aluminium bars in the 1960s that nobody could reproduce. Rainer Weiss wrote the design of a laser-interferometer detector in a 1972 internal report; the project took over forty years, the largest grant the US National Science Foundation had ever made, and a near-cancellation in 1994 that Barry Barish's management rescued. Before the first detection the collaboration had trained itself with secret "blind injections", fake signals inserted by a small team to test whether the rest would be fooled; in 2010 one of them, nicknamed the Big Dog, went all the way to a drafted paper before the envelope was opened. GW150914 was real. The announcement came on 11 February 2016; the Nobel Prize to Weiss, Barish and Thorne in 2017; and in August 2017 the merger of two neutron stars was seen in gravitational waves and, seconds later, by telescopes across the spectrum, with the spectroscopic signature of freshly made gold and platinum.

**The setting.** General relativity was a century old and tested only in the weak-field regime of the solar system and the binary pulsar. Black holes had never been observed directly, only inferred.

**The crisis.** A prediction of the theory that no instrument could reach: a strain of $10^{-21}$, meaning a 4 km arm changes length by about $4\times10^{-18}$ m, roughly a few thousandths of a proton diameter.

**The idea, on the board.**

1. *What a gravitational wave is.* A ripple in spacetime curvature travelling at $c$, produced by accelerating mass with a changing quadrupole moment (a spinning dumbbell radiates; a spinning sphere does not). It stretches space in one transverse direction while squeezing the perpendicular one, at twice the orbital frequency of the source.
2. *Strain.* $h = \Delta L/L$. From the field equations, $h \sim (G/c^4)\,\ddot{Q}/r$; the $G/c^4 \approx 10^{-43}$ in front (§9.2) is why only solar-mass objects moving near $c$ produce anything measurable, and why $h$ is $10^{-21}$ even for them.
3. *The Michelson interferometer.* Split a laser beam, send the halves down perpendicular arms of length $L$, reflect them, recombine: the output intensity depends on the phase difference $\Delta\phi = 4\pi\Delta L/\lambda$. A gravitational wave lengthens one arm while shortening the other, doubling the effect. The arms are 4 km because $\Delta L = hL$ grows with $L$, and Fabry–Pérot cavities bounce the light about 300 times to make the arms effectively 1200 km long.
4. *Noise.* Seismic motion (suppressed by quadruple pendulums and active isolation), thermal motion of the mirrors and their suspensions (fused silica fibres, low mechanical loss), and the quantum shot noise of the light itself (reduced by circulating hundreds of kilowatts and by injecting squeezed light). The detector is a feedback-control problem with hundreds of loops keeping the cavities on resonance: it is the largest mechatronic system ever built.
5. *The chirp.* As the black holes spiral in, the frequency and amplitude rise; the rate of rise gives the "chirp mass", the amplitude gives the distance, and the ringdown gives the final mass and spin. The signal lasted 0.2 s and swept from 35 to 250 Hz, in the audio band; play it.

**Numbers for the board.** $h = 10^{-21}$ over $L = 4$ km: $\Delta L = 4\times10^{-18}$ m, about 1/400 of a proton diameter ($1.7\times10^{-15}$ m) and roughly $3\times10^{11}$ times smaller than the laser wavelength of 1064 nm. With 300 round trips the phase shift is $4\pi\times300\times4\times10^{-18}/1.064\times10^{-6} = 1.4\times10^{-8}$ rad. As an order-of-magnitude guide, shot noise pushes the design toward enormous photon counts, one reason for the high circulating laser power. The merger's peak power, $3.6\times10^{49}$ W, is fifty times the luminosity of all stars in the observable universe; the energy, $5\times10^{47}$ J, is three solar masses times $c^2$.

**Demonstrations.** A Michelson interferometer built from a laser pointer, a beam splitter and two mirrors on a breadboard (kits cost under 100 dollars): fringes shift when someone taps the table, walks past, or breathes on one arm. Then play the GW150914 audio and its spectrogram, and show the two detectors' traces overlaid. The site's card and the LIGO open-data site have both.

**Questions students ask.** *If space stretches, doesn't the light's wavelength stretch too, cancelling the effect?* The wave changes the arm length while the light is in flight; the light entering the arm keeps the frequency it had when it was emitted, and the round-trip time changes. (The full answer is subtle and worth reading before teaching.) *Why two detectors?* Coincidence rejects local noise, and the delay between them (6.9 ms for GW150914; at most 10 ms) gives a direction on the sky.

**The engineering bridge.** Precision metrology, seismic and vibration isolation, ultra-low-loss optics and coatings, high-power stabilised lasers, squeezed-light quantum sensing, and large-scale feedback control. Every technique on the list has already leaked into industry: mirror coatings, laser stabilisation and isolation systems in particular.

**On the site.** Card *LIGO*; Master equation *Einstein field equations*; Young & Fresnel card for the interferometer; the date of the detection is the anniversary of the day this guide was finished.

---

# Part III — Session plans and activities

## 11. Lab session plans

Each plan is written for 45 minutes with the site projected and students on their own devices in pairs. The pattern is **predict → observe → explain**: students write a prediction before anything is clicked, the class watches, then explains the gap. Expected readouts are quoted from the site; the full tables are in Appendix A.

### 11.1 Newton's cannon — from ballistics to orbit

**Learning objectives.** Students will be able to (a) state why an orbiting body is in free fall, (b) compute circular and escape speed at a given altitude, (c) classify a trajectory from its total energy, and (d) explain the sub-orbital, elliptical and hyperbolic regimes in terms of the Kepler ellipse's perigee.

**Before class.** Cards: Newton (Principia), Kepler. Students should know $a = GM/r^2$ and $v_{circ} = \sqrt{GM/r}$.

**Setting.** The cannon sits 400 km up (the ISS altitude) and fires horizontally. The readout shows the circular and escape speeds *at that altitude* — 7.67 and 10.85 km/s — not the surface values of 7.9 and 11.2 km/s that textbooks quote. That difference is your first teaching point: ask why both are lower up here.

**Demo script (15 min).**

1. *Predict.* "I fire at 6.5 km/s. Where does it land?" Collect answers (most say "a few hundred km").
   *Observe:* preset **Sub-orbital 6.50** → *Impact after 9.6 min, 3651 km downrange.* Point out the dashed ellipse: the shot was on a Kepler orbit whose perigee lies 2581 km below the surface. "Every cannonball is a satellite that hits the ground."
2. *Predict.* "7.5 km/s — still short of circular. Does it land?"
   *Observe:* set the slider to 7.50 and fire → *Impact after 27.7 min, 12283 km downrange* — three-quarters of the way around the planet, perigee only 177 km below the surface. This is the moment students see that "orbit" and "falling" are the same motion.
3. **Circular 7.67** → *Circular orbit at 400 km: period 92.4 min.* Ask: "Why 92 minutes and not 24 hours?" (Period depends on $r$: $T = 2\pi\sqrt{r^3/GM}$; geostationary needs $r = 42{,}164$ km.)
4. **Elliptical 9.00** → *e = 0.376, perigee 400 km, apogee 8558 km, period 187.5 min.* Note that the launch point became the *perigee*: above circular speed you are at the low point of the orbit. Watch the speed readout fall toward apogee and recover — Kepler's second law in numbers.
5. Slider to 10.50 → *apogee 93,328 km, period 34 h.* The view zooms out to fit; "the Moon is at 384,000 km — we are a quarter of the way there."
6. **Escape 11.00** → *Unbound trajectory (e = 1.055, hyperbolic).* Ask what changed. (Sign of total energy: $\tfrac{1}{2}v^2 - GM/r \ge 0$.)

**Student worksheet (20 min, pairs).**

| # | Task | Expected |
|---|---|---|
| 1 | Compute $v_{circ}$ at 400 km by hand: $\sqrt{3.986\times10^5 / 6771}$. Compare with the readout. | 7.673 km/s |
| 2 | Compute the circular period $2\pi r/v$. | 5545 s = 92.4 min |
| 3 | Fire at 8.00, 8.50, 9.00 km/s and tabulate apogee altitude. Then compute $a$ from $v$ via $\epsilon = v^2/2 - GM/r$, $a = -GM/2\epsilon$, and apogee $= 2a - r$. | 1693, 4384, 8558 km |
| 4 | Find (by trial) the lowest speed that does not hit the ground. Explain what limits it. | ≈ 7.56 km/s; perigee just reaches $R_\oplus$ (no atmosphere in the model) |
| 5 | Fire at 10.85 km/s, then at 10.86 km/s, and compare the status lines. What separates the two? | 10.85 is still bound: apogee 53 million km, period 43 years; 10.86 is unbound, $e = 1.003$. The knife-edge is $\epsilon = \tfrac{1}{2}v^2 - GM/r = 0$ at $v_{esc} = 10.851$ km/s |
| 6 | Reset and fire at 3.00 km/s. Is this a "parabola"? What does the dashed curve say? | Ellipse; the parabola of projectile problems is the limit of a very eccentric ellipse near the surface |

**Debrief prompts.**
- "Astronauts float because there is no gravity up there." Ask the class to refute it with the readout: at 400 km, $g = GM/r^2 = 8.7\ \text{m/s}^2$, 89 % of the surface value. They float because they and the station fall together.
- Why does the sim integrate numerically when the ellipse can be computed analytically? (The dashed curve *is* the analytic answer; the trail is what a real flight computer does, step by step. Ask where they agree and whether they would for a real satellite with drag and a non-spherical Earth.)

**Common wrong ideas surfaced.** Orbit requires an engine running; "escape velocity" is a speed you must maintain; the higher the orbit, the faster the satellite; centrifugal force holds satellites up.

**Mechatronics link.** Attitude and orbit control on a CubeSat is exactly this integrator with thrusters as inputs; reaction wheels use conservation of angular momentum from the Kepler card. The elliptical-orbit speed readout is the source of the Doppler shift a ground station must track.

**Extension.** Ask students to estimate how much $\Delta v$ takes a satellite from the 400 km circular orbit to the 9.00 km/s ellipse (1.33 km/s — a single burn at perigee), then read about Hohmann transfers on the Kepler card. For strong students: derive $e = 1 - r_0/a$ for a tangential launch above circular speed and confirm $e = 0.376$ at 9.00 km/s.

### 11.2 Maxwell's wave — light is a self-propagating field

**Learning objectives.** (a) Describe the geometry of a plane EM wave: $\vec{E}$, $\vec{B}$ and $\vec{k}$ mutually perpendicular, with $\vec{E}\times\vec{B}$ along $\vec{k}$; (b) explain that entering a medium changes speed and wavelength but not frequency; (c) compute $f$, $v$, $\lambda$ and the wave impedance for a given medium; (d) interpret the Poynting vector as an energy flux that pulses but never reverses.

**Before class.** Cards: Faraday, Maxwell, Hertz & Tesla. Students should have seen $c = 1/\sqrt{\mu_0\varepsilon_0}$.

**Demo script (12 min).**

1. Start with the vacuum default (800 nm, $n = 1$, 30° view). Identify the three axes: $x$ carries $\vec{E}$ (cyan), $y$ carries $\vec{B}$ (amber, drawn $\times c$ so that it is visible), $z$ is the direction of travel. Ask which way $\vec{E}\times\vec{B}$ points; have them use the right-hand rule on their own hands. Then show the green arrows: $\vec{S}$ is always along $+z$ and pulses as $\cos^2$. "Energy never flows backward in a travelling wave, even though $\vec{E}$ and $\vec{B}$ reverse twice per cycle."
2. Toggle **Field vectors** off to show only the envelopes, then on again. Turn the viewing angle to 10° and to 60° so students see the $\vec{B}$ oscillation is in a plane perpendicular to $\vec{E}$, not a drawing artefact.
3. *Predict.* "I send this wave into glass. Which of $f$, $v$, $\lambda$ change?" Take a vote (many say all three).
   *Observe:* slide $n$ to 1.50 → readouts: *374.7 THz (unchanged), 199,862 km/s, 533 nm, 251.2 Ω.* The frequency is fixed by the source; the medium can only change the speed, and $\lambda = v/f$ follows.
4. Set $n = 2.42$ (diamond) → *123,881 km/s, 331 nm.* "The same photon that is red in air is ultraviolet-sized inside a diamond — that is why diamonds sparkle: the large $n$ bends and disperses light strongly."
5. Change $\lambda_0$ to 1550 nm → *193.4 THz.* "This is the telecom window: fibre-optic data travels at $c/1.47$ and the wavelength inside the glass is about 1.05 μm."

**Student worksheet (20 min).**

| # | Task | Expected |
|---|---|---|
| 1 | With $\lambda_0 = 550$ nm compute $f = c/\lambda_0$ and compare. | 545.1 THz |
| 2 | For water ($n = 1.33$) compute $v$ and $\lambda$ and check. | 225,408 km/s; 414 nm |
| 3 | The wave impedance in vacuum is $\eta_0 = \sqrt{\mu_0/\varepsilon_0} \approx 376.7\ \Omega$. Show that $\eta = \eta_0/n$ for a non-magnetic medium and verify at $n = 1.5$. | $\eta = \sqrt{\mu_0/(\varepsilon_r\varepsilon_0)} = \eta_0/\sqrt{\varepsilon_r} = \eta_0/n$; 251.2 Ω |
| 4 | Count how many wavelengths fit on screen at 800 nm / $n=1$ and at $n = 2$. What is the ratio? | 2.0 |
| 5 | If $E_0 = 100$ V/m, what is $B_0$ in vacuum? Why is $\vec{B}$ drawn as large as $\vec{E}$ on screen? | $B_0 = E_0/c = 3.3\times10^{-7}$ T; scaled by $c$ for visibility |
| 6 | Pause the animation. Mark a point where $\vec{E} = 0$. What are $\vec{B}$ and $\vec{S}$ there? | Both zero — in a plane wave $\vec{E}$ and $\vec{B}$ are in phase |

**Debrief prompts.** Why are $\vec{E}$ and $\vec{B}$ in phase and not 90° apart as in an LC circuit? (In a travelling wave each field's *spatial* derivative sources the other's *time* derivative — Faraday and Ampère–Maxwell — which keeps them in step; standing waves are the case where they are 90° apart.) What sets $\eta_0 = 377\ \Omega$ and why do antenna engineers care? (Matching a 50 Ω or 75 Ω line to free space is the antenna's job.)

**Common wrong ideas.** Frequency changes in a medium (colour is set by frequency, so glass would change colours); $\vec{E}$ and $\vec{B}$ are 90° out of phase; the wave needs a medium (the aether — Michelson–Morley card); the drawn $\vec{B}$ amplitude is physically as large as $\vec{E}$.

**Mechatronics link.** A 2.4 GHz Wi-Fi module's antenna is $\lambda/4 \approx 3.1$ cm — students can measure one on a dev board. Ultrasonic and LiDAR range sensors both rely on knowing $v$ in the medium; the readout that $v$ changes with $n$ is the same physics as sound speed changing with temperature.

**Extension.** The lab's frequency readout is $f = c/\lambda_0$. Ask students to derive $c = 1/\sqrt{\mu_0\varepsilon_0}$ from the two curl equations (Maxwell card) by taking the curl of Faraday's law and substituting Ampère–Maxwell — the derivation on the Maxwell card's deep dive.

### 11.3 Carnot engine — the ceiling on every heat engine

**Learning objectives.** (a) Trace the four strokes of the Carnot cycle on both PV and TS diagrams; (b) compute $Q_{in}$, $Q_{out}$, $W$ and $\eta$ for an ideal gas; (c) explain why $\eta$ depends only on the reservoir temperatures; (d) read efficiency as an area ratio on the TS diagram.

**Before class.** Cards: Carnot, Joule & Mayer, Clausius & Kelvin. Students should know $PV = nRT$, isothermal work $nRT\ln(V_2/V_1)$, and that adiabats obey $TV^{\gamma-1} = $ const.

**Setting.** The working fluid is 1 mol of an ideal monatomic gas ($\gamma = 5/3$), starting at $V_1 = 10$ L. The default reservoirs are 800 K and 300 K with an isothermal expansion ratio of 2.

**Demo script (15 min).**

1. Press **Run cycle** and let one full cycle play (about 12 s). Narrate the strokes as the status line changes: isothermal expansion (heat arrows from the hot plate), adiabatic expansion (plate turns grey: "insulated"), isothermal compression (heat arrows into the cold plate), adiabatic compression. Point out the gas colour tracking temperature and the work arrow reversing direction on the piston rod.
2. Read the numbers: *η = 62.5 %, Q_in = 4.61 kJ, Q_out = 1.73 kJ, W = 2.88 kJ.* Check $W = Q_{in} - Q_{out}$ aloud.
3. *Predict.* "I double the expansion ratio to 4. Efficiency goes up, down, or stays?" Vote.
   *Observe:* ratio slider to 4.0 → *η still 62.5 %; Q_in 9.22 kJ, W 5.76 kJ.* Twice the work per cycle, same efficiency. "Efficiency is about temperatures; work per cycle is about how much gas you push. That is why big engines are not more efficient than small ones — only hotter ones are."
4. *Predict.* "Raise $T_H$ to 1200 K." → *η = 75.0 %, W = 5.19 kJ.* Then "warm the cold sink to 450 K" → *η = 43.75 %.* Ask which is cheaper for a power plant: a hotter boiler or a colder river. (Colder sink is free but limited by climate; hotter source is limited by materials — the turbine-blade insight box.)
5. Show the extreme: $T_H = 500$ K, $T_C = 450$ K → *η = 10 %, W = 0.29 kJ.* The PV loop collapses to a sliver. "A low-grade heat source is nearly useless for making work — but excellent for heating a building."
6. Switch attention to the **TS diagram**: the cycle is a rectangle. The rectangle's area is $W$; the area under its top edge, down to $T = 0$, is $Q_{in}$. Efficiency is the ratio of the two areas, visible at a glance: $\eta = (T_H - T_C)\Delta S / T_H\Delta S$.

**Student worksheet (20 min).**

| # | Task | Expected |
|---|---|---|
| 1 | With the defaults, compute $Q_{in} = nRT_H\ln 2$ and $Q_{out} = nRT_C\ln 2$. | 4.61 kJ, 1.73 kJ |
| 2 | Compute $W/Q_{in}$ and compare with $1 - T_C/T_H$. | 0.625 both |
| 3 | The status line gives $T$, $P$, $V$ during the cycle. Pause on the adiabatic expansion and check $TV^{\gamma-1}$ at two moments. | Constant to rounding |
| 4 | Compute $V_3$ from $T_H V_2^{\gamma-1} = T_C V_3^{\gamma-1}$ with $V_2 = 20$ L. | $V_3 = 20\,(800/300)^{1.5} = 87.1$ L |
| 5 | Set $T_H = 1500$ K, $T_C = 200$ K. What is $\eta$? Why can no real engine reach even this? | 86.7 %; irreversibilities (friction, finite-rate heat transfer) and materials |
| 6 | Read $\Delta S$ from the TS axis for ratio 2 and ratio 4. | $8.314\ln 2 = 5.76$ J/K; 11.5 J/K |

**Debrief prompts.** The Second Law card says heat never flows spontaneously from cold to hot. Where in this cycle does the engine "pay" for moving heat? (It does not — the engine moves heat from hot to cold and skims work; run it backward and it becomes a refrigerator that costs work.) Why does a real steam turbine at 800 K/300 K achieve about 40 %, not 62.5 %? (Rankine cycle is not Carnot; finite temperature differences in the boiler and condenser generate entropy.)

**Common wrong ideas.** Efficiency can reach 100 % with better engineering; efficiency depends on the working fluid; "heat" is a substance the gas contains; adiabatic means "no temperature change".

**Mechatronics link.** Peltier coolers and heat pumps in climate-controlled enclosures are Carnot's cycle run backward; their coefficient of performance $T_C/(T_H - T_C)$ is why they are inefficient at large temperature differences. Thermal management of a motor driver is a Second-Law problem: the heat must go *somewhere colder*.

**Extension.** Change the gas to diatomic in your head: with $\gamma = 1.4$ the adiabats are shallower, so $V_3$ is larger (11.6× rather than 4.35×) but $\eta$ is unchanged. Ask students to explain why $\gamma$ cancels out of the efficiency.

### 11.4 Bohr atom and hydrogen spectrum — why atoms have colours

**Learning objectives.** (a) Use $E_n = -13.6\ \text{eV}/n^2$ to compute transition energies and wavelengths; (b) name the Lyman, Balmer and Paschen series and locate them in the spectrum; (c) distinguish emission from absorption; (d) explain why orbit radii grow as $n^2$ and why the energy levels converge.

**Before class.** Cards: Planck, Einstein (photoelectric), Bohr. Students should know $E = hf = hc/\lambda$ and the value $hc = 1240\ \text{eV·nm}$.

**Setting.** The left panel shows the six lowest Bohr orbits *to scale* ($r_n = n^2 a_0$), the right panel the energy ladder, and the bottom strip the spectrum on a logarithmic wavelength axis with the actual hydrogen lines drawn in. All wavelengths are vacuum values.

**Demo script (12 min).**

1. Point at the orbits: "The $n = 1$ orbit is tiny — 5 px — because radii go as $n^2$. Textbook drawings that space the orbits evenly are lying to you." Point at the ladder: the levels crowd toward zero; that is the $1/n^2$.
2. Press **Hα 656 nm**. Watch the electron drop from $n = 3$ to $n = 2$ and the red wave packet leave. Readouts: *1.889 eV, 656.5 nm, 457 THz, Balmer, visible, red.* On the spectrum strip the marker sits on the red Balmer line. "This is the colour of a hydrogen discharge tube and of every emission nebula in the sky."
3. **Hβ 486 nm**, **Hγ 434 nm**: the photons get bluer and the lines crowd together toward the Balmer limit at 364.7 nm. Ask what the limit corresponds to. (Electron arriving from $n = \infty$ — i.e., capture of a free electron.)
4. *Predict.* "$n = 2 \to 1$: visible?" → **Lyman-α 122 nm**: *10.199 eV, ultraviolet.* "Nothing in the Lyman series is visible; hydrogen's *strongest* line is invisible to us."
5. **Paschen-α 1.88 μm**: infrared. Point at the strip: three series, three regions — UV, visible, IR — each labelled by the *lower* level.
6. Press **Absorb Hα**. A red photon flies in, is absorbed, and the electron rises from $n = 2$ to $n = 3$. "Same energy, opposite direction. This is how a spectrograph sees an exoplanet's atmosphere: light from the star passes through the planet's gas and specific wavelengths go missing."

**Student worksheet (20 min).**

| # | Task | Expected |
|---|---|---|
| 1 | Compute $\Delta E$ for $3 \to 2$ from $13.6(1/4 - 1/9)$ and $\lambda = 1240/\Delta E$. | 1.89 eV; 656 nm |
| 2 | Compute the Balmer limit ($\infty \to 2$). | $13.6/4 = 3.40$ eV; 365 nm |
| 3 | Which transition produces 486 nm? Which produces 1.88 μm? Verify with the menus. | $4 \to 2$; $4 \to 3$ |
| 4 | What is the ionisation energy of hydrogen from the ground state? What photon wavelength does it take? | 13.6 eV; 91.2 nm |
| 5 | Set $n_i = 6$, $n_f = 5$. Is this visible? Which series? | 7.46 μm, infrared, Pfund |
| 6 | The Bohr orbital period scales as $n^3$. If the animation were to scale, how many times slower would $n = 6$ be than $n = 2$? | 27× |

**Debrief prompts.** Why can the electron sit only on these rungs? (Bohr: $L = n\hbar$; de Broglie card: a whole number of wavelengths must fit around the orbit.) Why do LEDs come in specific colours? (Bandgap plays the role of $\Delta E$; the transistor and Schrödinger cards.) What happens to the spectrum for He$^+$? ($Z^2 = 4$ times the energies; the Balmer-like lines move into the UV.)

**Common wrong ideas.** The electron "spirals" between levels; emission and absorption lines are at different wavelengths; visible light means "the electron went to $n = 1$"; the orbit picture is literally true (the Schrödinger card is the correction).

**Mechatronics link.** Optical encoders, IR proximity sensors and photodiodes are all tuned to specific $\Delta E$: a silicon photodiode responds only below 1.1 μm because $E_g = 1.12$ eV. Flame and plasma sensors identify species by their lines exactly as the spectrum strip does.

**Extension.** Give students the Rydberg constant $R_H = 1.097\times10^7\ \text{m}^{-1}$ and ask them to show it equals $E_1/hc$. Then ask why the site's Hα is 656.5 nm while many tables say 656.3 nm (vacuum vs air wavelength; $n_{air} = 1.00028$).

---

## 12. Teaching with the engineering matrix

The matrix answers the question every engineering student asks in week 2: *"Why do I need this?"* Mechatronics & Control is listed first because that is who the portal serves; the other seven let students see neighbouring disciplines.

**Activity — "Four boxes" (15 min, week 1).** Project the Mechatronics panel. For each of the four foundation boxes, ask students to name one course in their own curriculum that depends on it. Typical mapping: Rigid-Body & Lagrangian Dynamics → Dynamics, Robotics; Electromagnetic Actuation → Electric Machines, Power Electronics; Oscillations, Damping & Feedback → Control Systems, Vibrations; Sensing Physics → Measurement & Instrumentation. Write the mapping on the board and leave it there for the semester: it is the argument for the course.

**Activity — jigsaw (30 min, any week).** Assign each group a discipline. Groups read their panel and prepare a two-minute explanation of one *governing equation in daily use* — what each symbol is, and one situation where an engineer would compute it. Then regroup so each new group has one member per discipline. Students hear seven equations explained by peers. The DC-motor pair $J\ddot\theta + b\dot\theta = K_t i$ and $V = L\,di/dt + Ri + K_e\dot\theta$ is the one to insist on for mechatronics students: it is Newton's second law and Faraday's law in the same device.

**Activity — the missing discipline (homework).** Ask students to draft a ninth panel (e.g., Energy Systems, Automotive, Environmental) in the same format: tagline, description, four physics foundations with pioneers and applications, four key equations. The data structure is in the README; the best submissions can be added to the site.

---

## 13. Teaching with the master equations

### 13.1 The equation-reading protocol (5 min per equation)

Open an equation card. Before reading the inspector, ask a student to read the formula aloud as an English sentence. Then open the dialog and go through the symbol table row by row, asking two questions per row: *"What is the unit?"* and *"What would happen to the left side if this doubled?"* Finish by reading the *Physical intuition* paragraph aloud and asking whether the student's sentence matched it.

Order that works well in PHYS 101: Newton II → Gravitation → Wave equation → First law → Second law → Boltzmann → Euler–Lagrange. In PHYS 102: Gauss → Faraday → Ampère–Maxwell → Energy–momentum → Einstein field equations (read only; do not derive) → Schrödinger → Uncertainty.

### 13.2 Dimensional-analysis drills

Every symbol table lists SI units. Use them for five-minute drills:

1. Show that both sides of $\nabla\times\vec{B} = \mu_0\vec{J} + \mu_0\varepsilon_0\,\partial\vec{E}/\partial t$ have units of T/m. (Students need $\mu_0$ in H/m = T·m/A, $\varepsilon_0$ in F/m, and that $\mu_0\varepsilon_0$ has units s²/m².)
2. From $E^2 = (pc)^2 + (m_0c^2)^2$, confirm that $pc$ is an energy.
3. From $S = k_B\ln\Omega$, explain why entropy has the units of $k_B$ and why $\ln\Omega$ must be dimensionless.
4. In the Schrödinger equation, use $|\psi|^2\,d^3r$ = probability to derive the unit of $\psi$ in three dimensions (m$^{-3/2}$).
5. In $\Delta x\,\Delta p \ge \hbar/2$, verify that J·s = kg·m²/s.

### 13.3 Build-your-own symbol table (homework)

Give students an equation not on the site — $\tau = I\alpha$, $Q = \pi r^4\Delta P/8\mu L$ (Poiseuille), $V = L\,di/dt$, $\omega_0 = 1/\sqrt{LC}$ — and ask for a table in the site's format (symbol, unit, meaning), an intuition paragraph, and one engineering use. Grade the *meaning* column strictly: "the constant" is not a meaning; "the ratio of current to voltage rate of change, set by the coil geometry" is.

---

## 14. Using the self-test

### 14.1 Three modes

- **Diagnostic (week 1 and week 14).** Students take all 15 questions on their own devices at the start and end of the course; they report their two scores. The site does not store anything, so ask them to screenshot the result page. Expect low week-1 scores: the questions assume nothing beyond secondary-school physics, but every item has a plausible distractor.
- **Clicker polling (in class).** Project a question, have students answer by show of hands or by typing the letter into the LMS chat, then press the letter on the keyboard to reveal. **Option order is shuffled every time a question loads**, so refer to answers by content ("the one about equal transit time") rather than by letter, and do not expect the same letter on students' screens.
- **Exam preparation (homework).** The instruction that matters: *"Take it until you can explain why each wrong option is wrong."* The explanations are written for that purpose; the wrong options are the misconceptions in §16.

### 14.2 Notes on each item

| # | Targets | What the wrong options represent | Follow-up in class |
|---|---|---|---|
| 1 | Galileo's *reductio* on falling bodies | Vacuum "cancels gravity"; heavy = 2g; buoyancy confusion | Have a student re-derive the contradiction with two masses tied together, on the board |
| 2 | Why displacement current was necessary | Aether; thermodynamic motivation; "just for symmetry" | Charging capacitor: draw the Ampèrian loop with two surfaces |
| 3 | Carnot bound $\eta \le 1 - T_C/T_H$ | Higher $\eta$ from better engineering; efficiency from heat capacity | Run the Carnot lab at 600/300 K: 50 % appears on screen |
| 4 | GR vs SR clock effects on GPS | Signs reversed; one effect only; magnitude wrong | 38.7 μs/day × c = 11.6 km/day of position drift |
| 5 | Macroscopic vs statistical thermodynamics | "Statistical means approximate"; entropy as disorder only | $S = k_B\ln\Omega$ card: count microstates for 4 coins |
| 6 | de Broglie wavelength and TEM resolution | Electrons "smaller than light"; wavelength independent of momentum | Compute $\lambda$ at 100 kV, 3.7 pm; compare with visible 500 nm |
| 7 | Why Lagrangian mechanics: constraint forces vanish | "More accurate"; "relativistic"; "fewer equations" | Pendulum: one generalized coordinate $\theta$ instead of $x$, $y$ and tension |
| 8 | Planck's quantum and the blackbody divergence | Planck as an experimentalist; quantization of *space*; UV catastrophe as an astronomical event | Read the Planck card's crisis: the 1911 naming and the true infrared motivation |
| 9 | Bandgap as the basis of switching | Metals as switches; bandgap as "energy stored"; insulators as conductors | Silicon 1.12 eV: why a photodiode ignores light beyond 1.1 μm |
| 10 | Faraday's law as the generator principle | Coulomb; Ampère; Ohm confused with induction | $\mathcal{E} = -d\Phi_B/dt$: sign, Lenz, and the motor equation on the Mechatronics panel |
| 11 | Bernoulli and lift; the equal-transit-time myth | Equal transit time; "fast air = high pressure"; thrust-only lift | Show the NASA smoke-pulse photograph if you have it; discuss the Kutta condition qualitatively |
| 12 | Rayleigh criterion in photolithography | Ohm; Carnot; relativity as distractors | $k_1\lambda/\text{NA}$ with $k_1 = 0.25$, NA = 1.35 at 193 nm ≈ 36 nm half-pitch |
| 13 | Fourier series and bandwidth | "Below cutoff, so perfect"; "no frequency content"; frequency shifting | Sketch the 1st + 3rd harmonic sum on the board; mention Gibbs ringing on an oscilloscope |
| 14 | Gauss's law and shielding | Absorption/heating; optical reflection; gravity | Static vs time-varying shielding: skin depth and seams |
| 15 | Forced resonance and damping | "Too heavy to matter"; frequency doubling; "electrical only" | Tacoma Narrows was flutter, not resonance: a useful correction of the usual story |

---

# Part IV — Assessment and logistics

## 15. Assessment and projects

### 15.1 Milestone-card authoring project (the recommended term project)

Students, in pairs, write a new milestone card in the site's format. The output is a JSON object that drops directly into `SITE_DATA.milestones` (README: *Editing the content*), so the class literally extends the course resource. The exercise forces exactly the skills the course is for: identify the crisis, state the law, connect it to a device, and check the history.

**Required fields.** `title`, `pioneers`, `year`, `sortYear`, `eraId`, `category`, `categoryLabel`, `crisis` (60–120 words), `breakthrough` (80–150 words), `equation` (LaTeX), `engineeringImpact` (40–80 words), `deepDive` (120–200 words), plus a separate list of three sources (one primary or scholarly).

**Suggested topics not yet on the site**, chosen for mechatronics relevance:

- Watt's governor (1788) and Maxwell's *On Governors* (1868) — the physics of feedback
- Ørsted and Ampère (1820) — the force law that makes a motor
- Ohm (1827) and Kirchhoff (1845) — circuit laws
- Seebeck (1821), Peltier (1834) — thermoelectric sensing and cooling
- The Curie brothers (1880) — piezoelectricity: accelerometers and ultrasonic transducers
- Hall (1879) — the Hall effect: current sensing and encoders
- Rayleigh (1877) — *The Theory of Sound*: acoustics and vibration modes
- Reynolds (1883) — turbulence and the Reynolds number
- Rutherford (1911) — the nuclear atom (the Bohr card's prerequisite)
- Compton (1923) — photons carry momentum
- Bardeen, Cooper & Schrieffer (1957) — superconductivity: MRI magnets and maglev
- Maiman (1960) — the laser: LiDAR, fibre communications, machining
- Kao (1966) — low-loss optical fibre
- Boyle & Smith (1969) — the CCD: every camera sensor

**Rubric (20 points).**

| Criterion | 4 | 2 | 0 |
|---|---|---|---|
| Crisis is a real, specific unsolved problem of its time | Named problem, dated, with what people wrongly believed | Vague "people didn't understand X" | Missing or anachronistic |
| Breakthrough states the idea, not just the result | The reasoning step is visible | Result stated without mechanism | Incorrect physics |
| Equation is correct, correctly typeset, with symbols defined | Renders; every symbol defined in the text | Minor typesetting or one undefined symbol | Wrong or absent |
| Engineering legacy is concrete | Names devices or design methods and the dependency | Generic industry names | None |
| Historical accuracy and sources | Three sources, at least one primary/scholarly; dates verified | Two sources; one date uncertain | Unsourced or containing a known myth |

Ask for the JSON *and* a one-page rendered preview: students paste their object into a copy of `index.html`, open it, and screenshot their card. Doing so catches every typesetting error before you see it.

### 15.2 The crisis memo (short written assignment, repeatable)

One page, written *from inside the crisis*: "You are Joule in 1843. Write a memo to the Royal Society explaining what you measured and why the caloric theory cannot survive it." Grade for physics accuracy and for whether the student argues from the evidence available *at the time* (no appeals to later knowledge). Six good prompts: Galileo 1638, Carnot 1824, Faraday 1831, Joule 1843, Planck 1900, Einstein 1905 (photoelectric).

### 15.3 Quantitative problems built on the labs

These use the labs' own constants, so students can verify their answers on screen.

1. **Orbit insertion.** A launcher releases a satellite at 400 km altitude moving horizontally at 7.90 km/s. Find the eccentricity, apogee altitude and period. *(ε = −27.66 km²/s², a = 7205 km, e = 0.060, apogee 1268 km, T = 101.5 min.)*
2. **Grazing shot.** Show that the lowest launch speed at 400 km that avoids the surface is 7.56 km/s and that this shot would take about 44 min to complete half an orbit if the Earth were not in the way. *(Perigee = R⊕ gives a = 6571 km; T/2 = 44.2 min — accept 43–45.)*
3. **Fibre link.** A 1550 nm signal travels 40 km of fibre with $n = 1.468$. Find the frequency, the wavelength in the glass, and the propagation delay. *(193.4 THz; 1056 nm; 196 μs.)*
4. **Power-plant ceiling.** Steam enters a turbine at 565 °C and is condensed at 30 °C. Find the Carnot limit and compare with a real efficiency of 42 %. *(838 K / 303 K → 63.8 %; the real plant achieves two-thirds of the ceiling.)* Then find the cold-sink temperature that would be needed to reach 70 % with the same $T_H$. *(251 K — impossible with river water, which is why the boiler side is where engineers work.)*
5. **Hydrogen in a star.** Which Balmer transition produces the 410.3 nm line? What is the photon energy in eV and in joules? *(6 → 2; 3.022 eV; 4.84 × 10⁻¹⁹ J.)*

### 15.4 Exam question stems that the site prepares students for

- "State the crisis that led to ___ and explain in one paragraph how ___ resolved it." (Cards.)
- "A projectile is launched horizontally at altitude $h$ with speed $v$. Classify the trajectory and justify with the sign of the total energy." (Cannon lab.)
- "Light of wavelength 600 nm in vacuum enters water. Give $f$, $v$, $\lambda$ and explain which quantity is invariant and why." (Maxwell lab.)
- "Sketch the Carnot cycle on a T–S diagram and identify $Q_{in}$, $Q_{out}$ and $W$ as areas." (Carnot lab.)
- "Compute the three longest-wavelength lines of the Paschen series and state the region of the spectrum." (Bohr lab.)
- "Read the following equation as a sentence and give the SI unit of every symbol." (Equation inspector.)

---

## 16. Misconception bank

| Misconception | Where the site confronts it | What to say |
|---|---|---|
| Heavier objects fall faster | Galileo card; Q1 | Tie two stones together — Aristotle's rule contradicts itself |
| Satellites stay up because there is no gravity in space | Cannon lab | $g$ at 400 km is 8.7 m/s². The satellite falls continuously; the readout shows it |
| An orbit needs an engine | Cannon lab | Nothing is firing after $t = 0$; the trajectory is pure free fall |
| Escape velocity must be *maintained* | Cannon lab, 11 km/s shot | Speed drops the whole way out; escape is an energy condition, not a speed floor |
| Frequency changes when light enters glass | Maxwell lab | Frequency readout does not move; $v$ and $\lambda$ do |
| $\vec{E}$ and $\vec{B}$ are 90° out of phase in light | Maxwell lab | Pause: where $\vec{E} = 0$, $\vec{B} = 0$ |
| Heat is a fluid the gas "contains" | Joule, Fourier cards; Carnot lab | Heat only appears crossing a boundary — the arrows exist only during two strokes |
| Efficiency can reach 100 % with better engineering | Carnot lab; Q3 | Sliders cannot get there; the ceiling is set by temperatures alone |
| Entropy = disorder | Boltzmann card; Q5 | Entropy counts microstates; "disorder" is a metaphor that fails for crystals and for gravity |
| The electron spirals between orbits | Bohr lab | The jump is discrete; the animation eases the radius only to be watchable |
| Emission and absorption lines differ | Bohr lab, Absorb Hα | Same 656.5 nm both ways |
| Faster air over the wing because it "has farther to go" | Bernoulli card; Q11 | The upper flow arrives *first*; lift is flow turning |
| The ultraviolet catastrophe drove Planck | Planck card; Q8 | Named 1911; Planck's problem was the infrared data |
| Tacoma Narrows collapsed from resonance | Q15 | Aeroelastic flutter — self-excited, not forced |
| A Faraday cage "absorbs" fields | Coulomb & Gauss card; Q14 | Surface charge cancels the interior field; nothing is absorbed |
| "Classical" physics is wrong and replaced | Relativity, Quantum eras | Every later theory reduces to the earlier one in its domain; GPS uses all of them at once |

---

## 17. Logistics and troubleshooting

### 17.1 Offline classrooms

Equations depend on KaTeX from a CDN. To run fully offline: download the three KaTeX files referenced in the `<head>` (`katex.min.css`, `katex.min.js`, `contrib/auto-render.min.js`) and the fonts folder from the same release, place them beside `index.html`, and change the three URLs to local paths. Fonts from Google are optional; the page falls back to system fonts.

### 17.2 Embedding in an LMS

Canvas, Moodle and Google Sites all accept an `<iframe src="https://<user>.github.io/<repo>/" width="100%" height="900"></iframe>`. Deep links work: `…/#labs`, `…/#quiz`, `…/#equations`.

### 17.3 Editing and extending

All content is in the `SITE_DATA` object at the bottom of `index.html` (README: *Editing the content*). After any edit, open the file locally and check for a red "KaTeX parse error" — the usual cause is a single backslash where JSON needs two. Keep a copy of the original before editing; GitHub's history also lets you revert.

### 17.4 Accessibility

Every control is keyboard-reachable; dialogs trap focus and close on Esc; the hero animation stops for users who have set *reduce motion*; colour is never the only carrier of meaning (era and field are also labelled in text). Canvas simulations have text alternatives in their `aria-label` and in the caption below each stage; students who cannot see the canvas can still use the readouts, which are ordinary text.

### 17.5 If something looks wrong

- Equations show as `$...$` → no internet, or the CDN is blocked. See §17.1.
- A simulation is frozen → it pauses when scrolled off-screen or when its tab is hidden; scroll back or re-select the tab.
- Cannon status says "Elliptical" for a speed just below escape → correct: 10.85 km/s is bound with an apogee of 53 million km. The knife-edge is a good teaching moment (§11.1, task 5).
- The quiz shows a different letter than yesterday → options are shuffled on every load by design.

---

## Appendix A — Reference readouts

### A.1 Newton's cannon (launch altitude 400 km; $v_{circ} = 7.673$, $v_{esc} = 10.851$ km/s)

| $v_0$ (km/s) | Outcome | Details |
|---|---|---|
| 3.00 | impact | 5.5 min, 961 km downrange, 4.05 km/s at impact |
| 4.00 | impact | 5.9 min, 1384 km |
| 5.00 | impact | 6.6 min, 1950 km |
| 6.00 | impact | 8.1 min, 2858 km |
| 6.50 | impact | 9.6 min, 3651 km, 7.05 km/s |
| 7.00 | impact | 12.6 min, 5176 km |
| 7.50 | impact (grazing) | 27.7 min, 12283 km; perigee 177 km below surface |
| 7.56 | lowest non-impacting | perigee at the surface |
| 7.673 | circular | period 92.4 min |
| 8.00 | ellipse | e = 0.087, apogee 1693 km, T = 106.0 min |
| 8.50 | ellipse | e = 0.227, apogee 4384 km, T = 136.1 min |
| 9.00 | ellipse | e = 0.376, apogee 8558 km, T = 187.5 min |
| 10.00 | ellipse | e = 0.699, apogee 31,802 km, T = 9.3 h |
| 10.50 | ellipse | e = 0.873, apogee 93,328 km, T = 34 h |
| 10.85 | ellipse (barely) | apogee 5.3 × 10⁷ km, T = 43 yr |
| 10.86 | hyperbola | e = 1.003 |
| 11.00 | hyperbola | e = 1.055 |
| 12.00 | hyperbola | e = 1.446 |

### A.2 Carnot cycle (1 mol, $\gamma = 5/3$, $V_1 = 10$ L)

| $T_H$ (K) | $T_C$ (K) | $V_2/V_1$ | η | $Q_{in}$ (kJ) | $Q_{out}$ (kJ) | $W$ (kJ) | $V_3$ (L) | $P_1$ (kPa) |
|---|---|---|---|---|---|---|---|---|
| 800 | 300 | 2 | 62.5 % | 4.61 | 1.73 | 2.88 | 87.1 | 665 |
| 800 | 300 | 4 | 62.5 % | 9.22 | 3.46 | 5.76 | 174.2 | 665 |
| 1200 | 300 | 2 | 75.0 % | 6.92 | 1.73 | 5.19 | 160.0 | 998 |
| 600 | 300 | 2 | 50.0 % | 3.46 | 1.73 | 1.73 | 56.6 | 499 |
| 800 | 450 | 2 | 43.75 % | 4.61 | 2.59 | 2.02 | 47.4 | 665 |
| 500 | 450 | 2 | 10.0 % | 2.88 | 2.59 | 0.29 | 23.4 | 416 |
| 1500 | 200 | 2 | 86.7 % | 8.64 | 1.15 | 7.49 | 410.8 | 1247 |

### A.3 Hydrogen transitions ($E_n = -13.5984\ \text{eV}/n^2$, vacuum wavelengths)

| Transition | ΔE (eV) | λ | f | Series / region |
|---|---|---|---|---|
| 2 → 1 | 10.199 | 121.6 nm | 2466 THz | Lyman, UV |
| 3 → 1 | 12.087 | 102.6 nm | 2923 THz | Lyman, UV |
| 4 → 1 | 12.748 | 97.3 nm | 3083 THz | Lyman, UV |
| ∞ → 1 | 13.598 | 91.2 nm | — | Lyman limit (ionisation) |
| 3 → 2 (Hα) | 1.889 | 656.5 nm | 457 THz | Balmer, red |
| 4 → 2 (Hβ) | 2.550 | 486.3 nm | 617 THz | Balmer, blue-green |
| 5 → 2 (Hγ) | 2.856 | 434.2 nm | 690 THz | Balmer, violet |
| 6 → 2 (Hδ) | 3.022 | 410.3 nm | 731 THz | Balmer, violet |
| ∞ → 2 | 3.400 | 364.7 nm | — | Balmer limit |
| 4 → 3 (Paschen-α) | 0.661 | 1.876 μm | 160 THz | Paschen, IR |
| 5 → 3 | 0.967 | 1.282 μm | 234 THz | Paschen, IR |
| 6 → 3 | 1.133 | 1.094 μm | 274 THz | Paschen, IR |
| ∞ → 3 | 1.511 | 820.6 nm | — | Paschen limit |
| 5 → 4 | 0.306 | 4.05 μm | 74 THz | Brackett, IR |
| 6 → 5 | 0.166 | 7.46 μm | 40 THz | Pfund, IR |

### A.4 Maxwell lab readouts

| $\lambda_0$ (nm) | $f$ (THz) | $n$ | $v$ (km/s) | λ in medium (nm) | η (Ω) |
|---|---|---|---|---|---|
| 400 | 749.5 | 1.00 | 299,792 | 400 | 376.7 |
| 550 | 545.1 | 1.33 (water) | 225,408 | 414 | 283.3 |
| 800 | 374.7 | 1.50 (glass) | 199,862 | 533 | 251.2 |
| 800 | 374.7 | 2.42 (diamond) | 123,881 | 331 | 155.7 |
| 1310 | 228.8 | 1.47 (fibre) | 203,940 | 891 | 256.3 |
| 1550 | 193.4 | 1.47 (fibre) | 203,940 | 1054 | 256.3 |

---

## Appendix B — English–Turkish glossary of terms used on the site

For Turkish-medium sections or bilingual classes. Terms follow standard Turkish physics usage.

| English | Türkçe |
|---|---|
| paradigm shift | paradigma değişimi |
| reference frame | referans (başvuru) çerçevesi |
| inertia | eylemsizlik |
| momentum / angular momentum | momentum / açısal momentum |
| torque | tork (dönme momenti) |
| moment of inertia | eylemsizlik momenti |
| gravitation | kütleçekimi |
| orbit / eccentricity | yörünge / dış merkezlik |
| perigee / apogee | yerberi / yeröte |
| escape velocity | kaçış hızı |
| buoyancy | kaldırma kuvveti |
| streamline | akım çizgisi |
| stress / strain | gerilme / birim şekil değiştirme |
| restoring force | geri çağırıcı kuvvet |
| simple harmonic motion | basit harmonik hareket |
| natural frequency / damping / resonance | doğal frekans / sönüm / rezonans |
| feedback | geri besleme |
| work / heat / internal energy | iş / ısı / iç enerji |
| temperature / entropy | sıcaklık / entropi |
| efficiency / reservoir | verim / ısı deposu |
| isothermal / adiabatic | izotermal (eşsıcaklık) / adyabatik |
| heat conduction / diffusion | ısı iletimi / yayınım (difüzyon) |
| charge / electric field / magnetic field | yük / elektrik alanı / manyetik alan |
| flux / induction | akı / indüksiyon |
| displacement current | yer değiştirme akımı |
| electromagnetic wave | elektromanyetik dalga |
| wavelength / frequency / wave speed | dalga boyu / frekans / dalga hızı |
| refractive index | kırılma indisi |
| wave impedance | dalga empedansı |
| interference / diffraction | girişim / kırınım |
| spectrum / spectral line | tayf / tayf çizgisi |
| ultraviolet / infrared | morötesi / kırmızı ötesi |
| emission / absorption | salma / soğurma |
| photon / energy level | foton / enerji düzeyi |
| ground state / ionisation | taban durumu / iyonlaşma |
| wavefunction / uncertainty principle | dalga fonksiyonu / belirsizlik ilkesi |
| bandgap / semiconductor / transistor | bant aralığı / yarıiletken / transistör |
| spacetime / time dilation | uzayzaman / zaman genleşmesi |
| gravitational wave | kütleçekim dalgası |
| exoplanet transit | ötegezegen geçiş olayı |


---

## Appendix C — Chronology at a glance

| Year | Milestone | Pioneers | Era | Lecture notes |
|---|---|---|---|---|
| c. 250 BCE | Archimedes: Statics, Levers & Buoyant Forces | Archimedes of Syracuse | The Geometric & Empirical Dawn | §5.1 |
| 1543 | Copernicus: The Reference Frame Revolution | Nicolaus Copernicus | The Geometric & Empirical Dawn | §5.2 |
| 1609 – 1619 | Kepler's Laws: The Geometry of Celestial Orbits | Johannes Kepler (using Tycho Brahe's observations) | The Geometric & Empirical Dawn | §5.3 |
| 1638 | Galileo: Quantitative Kinematics & Falling Bodies | Galileo Galilei | The Geometric & Empirical Dawn | §5.4 |
| 1660 – 1678 | Hooke & Huygens: Elasticity, Oscillation and the Physics of Timekeeping | Robert Hooke, Christiaan Huygens | The Classical Synthesis & Analytical Mechanics | §6.1 |
| 1687 | Newton: The Principia, The Three Laws & Universal Gravity | Sir Isaac Newton | The Classical Synthesis & Analytical Mechanics | §6.2 |
| 1738 – 1757 | Bernoulli & Euler: Fluid Dynamics and the Energy of Flow | Daniel Bernoulli, Leonhard Euler (later Navier and Stokes) | The Classical Synthesis & Analytical Mechanics | §6.3 |
| 1785 | Coulomb & Gauss: Putting Numbers on Electric Charge | Charles-Augustin de Coulomb, Carl Friedrich Gauss (with Volta and Ohm) | The Field Paradigm & Electrodynamics | §8.1 |
| 1788 – 1834 | Lagrangian & Hamiltonian Mechanics: Energy & Least Action | Leonhard Euler, Joseph-Louis Lagrange, William Rowan Hamilton | The Classical Synthesis & Analytical Mechanics | §6.4 |
| 1801 – 1818 | Young & Fresnel: Light as a Wave | Thomas Young, Augustin-Jean Fresnel, François Arago | The Field Paradigm & Electrodynamics | §8.2 |
| 1822 | Fourier: The Analytical Theory of Heat and the Birth of Harmonic Analysis | Joseph Fourier | Heat, Work & The Thermodynamic Revolution | §7.1 |
| 1824 | Sadi Carnot: The Theoretical Efficiency Limit of Heat Engines | Nicolas Léonard Sadi Carnot | Heat, Work & The Thermodynamic Revolution | §7.2 |
| 1831 | Faraday: Electromagnetic Induction & Lines of Force | Michael Faraday, Hans Christian Oersted, André-Marie Ampère | The Field Paradigm & Electrodynamics | §8.3 |
| 1843 | Joule & Mayer: Conservation of Energy (First Law) | James Prescott Joule, Julius Robert von Mayer, Hermann von Helmholtz | Heat, Work & The Thermodynamic Revolution | §7.3 |
| 1850 – 1865 | Clausius & Kelvin: Entropy and the Arrow of Time | Rudolf Clausius, William Thomson (Lord Kelvin) | Heat, Work & The Thermodynamic Revolution | §7.4 |
| 1865 | Maxwell: The Electromagnetic Synthesis & The Wave Nature of Light | James Clerk Maxwell | The Field Paradigm & Electrodynamics | §8.4 |
| 1877 | Boltzmann & Gibbs: Statistical Mechanics & Microstates | Ludwig Boltzmann, J. Willard Gibbs, James Clerk Maxwell | Heat, Work & The Thermodynamic Revolution | §7.5 |
| 1887 | Hertz & Tesla: Experimental Radio Waves & The AC Grid | Heinrich Hertz, Nikola Tesla, Oliver Heaviside | The Field Paradigm & Electrodynamics | §8.5 |
| 1900 | Planck: The Quantum Hypothesis & Blackbody Radiation | Max Planck | The Quantum Realm, Solid State & Modern Frontiers | §10.1 |
| 1905 | Einstein: The Photon & The Photoelectric Effect | Albert Einstein | The Quantum Realm, Solid State & Modern Frontiers | §10.2 |
| 1905 | Einstein: Special Relativity & Mass-Energy Equivalence | Albert Einstein, Hendrik Lorentz, Henri Poincaré | The Spacetime Revolution: Relativity | §9.1 |
| 1913 | Bohr: Quantized Electron Orbits & Atomic Spectra | Niels Bohr | The Quantum Realm, Solid State & Modern Frontiers | §10.3 |
| 1915 | Einstein: General Relativity & Spacetime Curvature | Albert Einstein, Marcel Grossmann, David Hilbert | The Spacetime Revolution: Relativity | §9.2 |
| 1924 | De Broglie: Wave-Particle Duality of Matter | Louis de Broglie | The Quantum Realm, Solid State & Modern Frontiers | §10.4 |
| 1925 – 1927 | Wave Mechanics & The Uncertainty Principle | Erwin Schrödinger, Werner Heisenberg, Max Born | The Quantum Realm, Solid State & Modern Frontiers | §10.5 |
| 1947 | The Transistor: Quantum Mechanics Forges the Computer Age | John Bardeen, Walter Brattain, William Shockley | The Quantum Realm, Solid State & Modern Frontiers | §10.6 |
| 2015 – Present | LIGO: Precision Optomechanical Engineering & Spacetime Waves | Rainer Weiss, Kip Thorne, Barry Barish (LIGO Scientific Collaboration) | The Quantum Realm, Solid State & Modern Frontiers | §10.7 |

---

## Appendix D — Further reading

Histories and biographies that the lecture notes draw on, chosen for reliability and readability. An asterisk marks the one book to read first for each era.

**General**
- Thomas S. Kuhn, *The Structure of Scientific Revolutions* (1962): the source of the phrase "paradigm shift".
- Malcolm Longair, *Theoretical Concepts in Physics* (3rd ed., 2020): case studies from Newton to Einstein with the derivations worked through.*
- Emilio Segrè, *From Falling Bodies to Radio Waves* (1984) and *From X-Rays to Quarks* (1980).
- Helge Kragh, *Quantum Generations: A History of Physics in the Twentieth Century* (1999).
- Robert P. Crease, *The Prism and the Pendulum: The Ten Most Beautiful Experiments in Science* (2003).

**Era 1**
- Reviel Netz and William Noel, *The Archimedes Codex* (2007).
- Owen Gingerich, *The Book Nobody Read* (2004), on Copernicus and his readers.
- Max Caspar, *Kepler* (English translation 1959).
- J. L. Heilbron, *Galileo* (2010).* Dava Sobel, *Galileo's Daughter* (1999).

**Era 2**
- Richard S. Westfall, *Never at Rest: A Biography of Isaac Newton* (1980); James Gleick, *Isaac Newton* (2003) for a short version.*
- Lisa Jardine, *The Curious Life of Robert Hooke* (2003).
- Dava Sobel, *Longitude* (1995), on clocks and navigation after Huygens.
- Steven Strogatz, *Sync* (2003), which opens with Huygens' sympathetic clocks.
- Cornelius Lanczos, *The Variational Principles of Mechanics* (1949), for Lagrange and Hamilton done properly.

**Era 3**
- D. S. L. Cardwell, *From Watt to Clausius* (1971).*
- Stephen G. Brush, *The Kind of Motion We Call Heat* (1976).
- Carlo Cercignani, *Ludwig Boltzmann: The Man Who Trusted Atoms* (1998).
- Hans Christian von Baeyer, *Warmth Disperses and Time Passes* (1998).
- Sadi Carnot, *Reflections on the Motive Power of Fire* (Dover edition, with the papers of Clapeyron and Clausius).

**Era 4**
- Nancy Forbes and Basil Mahon, *Faraday, Maxwell, and the Electromagnetic Field* (2014).*
- James Hamilton, *A Life of Discovery: Michael Faraday* (2002); Basil Mahon, *The Man Who Changed Everything: The Life of James Clerk Maxwell* (2003).
- Andrew Robinson, *The Last Man Who Knew Everything* (2006), on Thomas Young.
- Jed Z. Buchwald, *The Rise of the Wave Theory of Light* (1989).
- Jill Jonnes, *Empires of Light* (2003), on Edison, Tesla and Westinghouse.

**Era 5**
- Abraham Pais, *'Subtle is the Lord': The Science and the Life of Albert Einstein* (1982).*
- Walter Isaacson, *Einstein: His Life and Universe* (2007).
- N. David Mermin, *It's About Time: Understanding Einstein's Relativity* (2005), for teaching the light clock.

**Era 6**
- Manjit Kumar, *Quantum: Einstein, Bohr, and the Great Debate about the Nature of Reality* (2008).*
- Abraham Pais, *Niels Bohr's Times* (1991).
- Michael Riordan and Lillian Hoddeson, *Crystal Fire: The Birth of the Information Age* (1997), on the transistor.
- Janna Levin, *Black Hole Blues* (2016) and Harry Collins, *Gravity's Kiss* (2017), on LIGO.

**Primary sources, freely available**
- Galileo, *Two New Sciences* (1638; Crew and de Salvio translation, Dover).
- Newton, *Principia* (1687; Cohen and Whitman translation, 1999).
- Faraday, *Experimental Researches in Electricity* (1839–1855).
- Maxwell, "A Dynamical Theory of the Electromagnetic Field" (1865).
- Einstein's 1905 papers, in translation, at the Einstein Papers Project (einsteinpapers.press.princeton.edu).
- LIGO data and the GW150914 audio at the Gravitational Wave Open Science Center (gwosc.org).

---

*Prepared to accompany the PHYSICA portal (index.html). Numbers quoted in this guide were verified against the running site on 14 September 2026.*
