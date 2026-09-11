# PHY101 — Physics I / Fizik I

**Teaching calendar:** 13 weeks, 21 September–18 December 2026. The supplied lecture/laboratory schedule is the adopted course sequence: 11 topic weeks, one review week and one midterm week.

**Main course materials:** the 13 weekly notebooks in [calendar/](calendar/), each assembled around its actual dated lecture topic. The fourteen original notebooks in [notebooks/](notebooks/) remain a source and extension library. Start with the calendar notebook for the teaching week.

**Audience:** Computer Engineering and Mechatronics Engineering. The final four calendar weeks also support colleagues teaching Software Engineering and Mechanical Engineering. The physical laws, algebra and standards of explanation are shared across all four groups.

**Learning sequence:** draw → choose a physical principle → write the equation → rearrange → substitute with units → interpret and check. English explanations include short Turkish support. Students can solve on paper; Python and interactive plots are optional ways to check a prediction.

**Türkçe:** Ders akışı artık ekteki takvimi izler. Çalışmaya o tarihe ait `calendar/Week_XX.ipynb` dosyasından başlayın. Kod yazmak öğrenme hedefi değildir; hesabın neden ve nasıl yapıldığını açıklamak önemlidir.

## Adopted weekly sequence

| Week | Dates (2026) | Lecture | Laboratory | Weekly notes |
| --- | --- | --- | --- | --- |
| 01 | 21–25 September | Measurement, units, physical quantities and vectors / Ölçme ve birim sistemleri, fiziksel nicelikler ve vektörler | No experiment named | [Week 01](calendar/Week_01.ipynb) |
| 02 | 28 September–2 October | Motion in one dimension / Bir boyutta hareket | INTRO | [Week 02](calendar/Week_02.ipynb) |
| 03 | 5–9 October | Motion in two dimensions and Newton’s laws / İki boyutta hareket ve Newton yasaları | Measuring instruments / Ölçme cihazları | [Week 03](calendar/Week_03.ipynb) |
| 04 | 12–16 October | Friction and applications of Newton’s laws / Sürtünme kuvveti ve Newton hareket yasaları uygulamaları | 1D motion — free fall / Bir boyutta hareket — serbest düşme | [Week 04](calendar/Week_04.ipynb) |
| 05 | 19–23 October | Work and kinetic energy / İş ve kinetik enerji | Projectile motion — friction / Eğik atış — sürtünme | [Week 05](calendar/Week_05.ipynb) |
| 06 | 26–30 October | Problem solving and review / Soru çözümü ve özet | No experiment named | [Week 06](calendar/Week_06.ipynb) |
| 07 | 2–6 November | Midterm / Vize | No experiment named | [Week 07](calendar/Week_07.ipynb) |
| 08 | 9–13 November | Potential energy and conservation of energy / Potansiyel enerji ve enerjinin korunumu | No experiment named | [Week 08](calendar/Week_08.ipynb) |
| 09 | 16–20 November | Linear momentum, impulse and collisions / Doğrusal momentum, itme ve çarpışmalar | One-dimensional collision / Bir boyutta çarpışma | [Week 09](calendar/Week_09.ipynb) |
| 10 | 23–27 November | Rotation of rigid bodies / Katı cisimlerin dönme hareketi | Rotation of rigid bodies / Katı cisimlerin dönmesi | [Week 10](calendar/Week_10.ipynb) |
| 11 | 30 November–4 December | Dynamics of rotational motion / Dönme hareketi dinamiği | Moment of inertia — simple pendulum / Eylemsizlik momenti — basit sarkaç | [Week 11](calendar/Week_11.ipynb) |
| 12 | 7–11 December | Equilibrium and centre of mass / Denge ve kütle merkezi | Make-up laboratory / Telafi | [Week 12](calendar/Week_12.ipynb) |
| 13 | 14–18 December | Periodic motion / Periyodik hareket | No experiment named | [Week 13](calendar/Week_13.ipynb) |

“No experiment named” transcribes the blank/red cells in the image. It does not infer a cancelled lesson or a laboratory date. The supplied image gives date ranges; the existing Tuesday lecture times and grading policy remain in force.

## What each teaching block builds

- **Weeks 01–02:** units, vector components and motion graphs. Explain slope, sign and units before using constant-acceleration equations.
- **Week 03:** resolve two-dimensional motion into components, then introduce force diagrams and Newton’s laws in the same week. Projectile calculations use the stated no-drag, constant-gravity model.
- **Week 04:** apply Newton’s laws to friction and connected bodies. Distinguish static friction’s bound from kinetic friction’s model.
- **Week 05:** calculate work, kinetic-energy change and power. Start from work–energy; the potential-energy/conservation treatment belongs to Week 08.
- **Week 06:** protected problem solving and summary. Repair algebra, vector and force-diagram errors using already taught material; introduce no new topic before the midterm. Use the official holiday-adjusted meeting arrangement during the 29 October week.
- **Week 07:** midterm. Its notebook provides preparation and navigation, not a replacement lecture or a claim about the exact exam time.
- **Week 08:** introduce potential energy and conservation, following the review and midterm. Account for gravitational, spring and nonconservative work with clearly chosen initial/final states.
- **Week 09:** momentum, impulse and collisions. Define the system, signs and the external-impulse condition before applying conservation.
- **Week 10:** describe rigid-body rotation with angular kinematics and moment of inertia. Connect radians and angular quantities to familiar linear motion.
- **Week 11:** predict rotational motion with torque, inertia, rotational energy and rolling. A short simple-pendulum preparation supports this week’s laboratory; the full periodic-motion lecture remains in Week 13.
- **Week 12:** equilibrium and centre of mass, after rotation. Require both force and torque balance, using perpendicular lever arms.
- **Week 13:** periodic motion. Derive the spring–mass model from Newton’s law and use the small-angle pendulum model with its assumptions.

## Review and transition time inside the calendar

Reserve 10–15 minutes at the start of Weeks 03, 08 and 10 for prerequisite recall, followed by a short worked example. Keep the scheduled Week 06 for review. In Weeks 10–13, begin with the relevant “Joining this lesson / Derse buradan başlayanlar” recap so colleagues’ classes can enter without prior notebook experience. Short checks after examples ask students to explain a sign, unit or limiting case; they do not add teaching weeks.

Before the Week 11 moment-of-inertia/simple-pendulum laboratory, recall $T=2\pi\sqrt{L/g}$, SI units and the small-angle assumption. Before the measuring-instruments laboratory, revisit units and significant figures; the course notebook does not replace the laboratory’s instrument instructions.

## Source and extension library

These module numbers are retained for problem identifiers and solution links. They are not another calendar.

| Source module | Role in the adopted course |
| --- | --- |
| [01 — Units and vectors](notebooks/Week_01.ipynb) | Week 01 foundation and later reference |
| [02 — 1D kinematics](notebooks/Week_02.ipynb) | Week 02 and free-fall laboratory preparation |
| [03 — 2D motion](notebooks/Week_03.ipynb) | Week 03 and projectile laboratory preparation |
| [04 — Newton’s laws and friction](notebooks/Week_04.ipynb) | Introductory laws in Week 03; applications in Week 04 |
| [05 — Circular motion](notebooks/Week_05.ipynb) | Supporting force/rotation examples; no separate dated topic week |
| [06 — Work and energy](notebooks/Week_06.ipynb) | Split between Week 05 work/kinetic energy and Week 08 potential/conservation |
| [07 — Momentum](notebooks/Week_07.ipynb) | Week 09 |
| [08 — Equilibrium and centre of mass](notebooks/Week_08.ipynb) | Week 12, after rotational dynamics |
| [09 — Rotation](notebooks/Week_09.ipynb) | Split between Weeks 10 and 11 |
| [10 — Angular momentum](notebooks/Week_10.ipynb) | Selected supporting rotational-conservation examples |
| [11 — Periodic motion](notebooks/Week_11.ipynb) | Week 13 core; short pendulum preparation before the Week 11 lab |
| [12 — Resonance](notebooks/Week_12.ipynb) | Optional oscillation extension |
| [13 — Waves and sound](notebooks/Week_13.ipynb) | Optional wave/acoustics extension |
| [14 — Review and projects](notebooks/Week_14.ipynb) | Optional synthesis examples and three project choices |

Complete worked solutions cover all 140 source-module problems and all three source projects in the separate `phy101-solutions` repository. A calendar problem retains its source module and problem identifier so its solution is unambiguous. Public availability follows the configured release schedule; optional source modules do not create additional scheduled lessons.

See [schedule implementation](SCHEDULE_ALIGNMENT.md), [the final-four-week teaching handoff](TEACHING_HANDOFF.md), and [the review and verification record](REVIEW_REPORT.md).
