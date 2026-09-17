# PHY101 — Physics I / Fizik I

**Teaching calendar:** 13 weeks, 21 September–18 December 2026. The lecture column of the departmental schedule defines the course sequence: 11 topic weeks, one review week and one midterm week. The *Deney* column defines eight laboratory sessions.

**The sequence is fixed and the exams are common.** Colleagues teach parallel sections from the same topic list, and the midterm and final are common examinations written against it. Topics are therefore never moved between weeks, merged or dropped; enrichment is added inside a week or as clearly non-examinable material. Examinable scope is exactly the Week 01–13 topic list. See [the course policy](COURSE_POLICY.md).

**TR:** Haftalık konu sırası ve deney sırası bölüm izlencesiyle sabittir; vize ve final ortak sınavdır. Konular haftalar arasında taşınmaz; zenginleştirme hafta içinde veya açıkça sınav kapsamı dışında yapılır.

**Course materials: one notebook per week.** The 13 files in [notebooks/](notebooks/) are the complete course. Each weekly notebook contains, in the same order every week:

1. **Before you start** — retrieval question, learning objectives, the algebra bridge for the topic, the shared standards block (symbolic answer → limiting check → numbers; `g = 9.81`, three significant figures), the matching textbook chapters, and that week's laboratory session if it has one.
2. **Setup for the interactive graphs** — two cells to run once per session.
3. **Concepts, demonstrations and worked examples** — the theory with hand-worked algebra, the interactive checks placed next to the idea they illustrate, Think·Pair·Explain checkpoints with model answers, and the worked examples.
4. **More worked examples from the question bank** — fully solved examples with units, checks and Turkish notes.
5. **Problem set — predict, then check** — the complete set for the week, grouped as core (L1), intermediate (L2) and challenge (L3). Every problem shows its **answer** so students can check themselves; the **full worked solution** is in the solutions collection and opens on the date printed under each problem. Weeks 05 and 10 carry extra practice written for the notebook, with complete reasoning attached and no module identifier.
6. **Exit check and model responses**, then the solution-file release dates and next week’s topic.

On the [course dashboard](web/PHY101_Course_Dashboard.html), choose **Open in Colab** to read and run a notebook in the browser. **Download notebook** saves the `.ipynb` file for local Jupyter.

**Türkçe:** Her hafta için tek bir not vardır ve o haftanın tamamını kapsar: konu anlatımı, etkileşimli grafikler, çözümlü örnekler ve adım adım yanıtlı problem seti aynı dosyadadır. Ders sayfasındaki **Open in Colab** bağlantısı notu tarayıcıda açar; **Download notebook** dosyayı bilgisayarınıza indirir. Kod yazmak öğrenme hedefi değildir.

**Audience:** the course is delivered to **Mechatronics Engineering, Computer Engineering and Chemical Engineering** students together. The physical laws, algebra and standards of explanation are the same for all three departments; the application questions in Weeks 10–13 are posed from each department’s perspective.

**Learning sequence:** draw → choose a physical principle → write the equation → rearrange → substitute with units → interpret and check. English explanations include short Turkish support. Students can solve on paper; Python and interactive plots are optional ways to check a prediction.

## Weekly sequence

| Week | Dates (2026) | Lecture | Deney / Laboratory | Notebook |
| --- | --- | --- | --- | --- |
| 01 | 21–25 September | Measurement, units, physical quantities and vectors / Ölçme ve birim sistemleri, fiziksel nicelikler ve vektörler | — | [Week 01](notebooks/Week_01.ipynb) |
| 02 | 28 September–2 October | Motion in one dimension / Bir boyutta hareket | [Laboratuvar Tanıtımı](labs/Lab_02_Introduction.ipynb) | [Week 02](notebooks/Week_02.ipynb) |
| 03 | 5–9 October | Motion in two dimensions and Newton’s laws / İki boyutta hareket ve Newton yasaları | [Ölçme Cihazları](labs/Lab_03_Measuring_Instruments.ipynb) | [Week 03](notebooks/Week_03.ipynb) |
| 04 | 12–16 October | Friction and applications of Newton’s laws / Sürtünme kuvveti ve Newton hareket yasaları uygulamaları | [Bir Boyutta Hareket - Serbest Düşme](labs/Lab_04_Free_Fall.ipynb) | [Week 04](notebooks/Week_04.ipynb) |
| 05 | 19–23 October | Work and kinetic energy / İş ve kinetik enerji | [Eğik Atış - Sürtünme](labs/Lab_05_Projectile_Friction.ipynb) | [Week 05](notebooks/Week_05.ipynb) |
| 06 | 26–30 October | Problem solving and review / Soru çözümü ve özet | — | [Week 06](notebooks/Week_06.ipynb) |
| 07 | 2–6 November | Midterm / Vize | — | [Week 07](notebooks/Week_07.ipynb) |
| 08 | 9–13 November | Potential energy and conservation of energy / Potansiyel enerji ve enerjinin korunumu | — | [Week 08](notebooks/Week_08.ipynb) |
| 09 | 16–20 November | Linear momentum, impulse and collisions / Doğrusal momentum, itme ve çarpışmalar | [Bir Boyutta Çarpışma](labs/Lab_09_Collision_1D.ipynb) | [Week 09](notebooks/Week_09.ipynb) |
| 10 | 23–27 November | Rotation of rigid bodies / Katı cisimlerin dönme hareketi | [Katı Cisimlerin Dönmesi](labs/Lab_10_Rotation.ipynb) | [Week 10](notebooks/Week_10.ipynb) |
| 11 | 30 November–4 December | Dynamics of rotational motion / Dönme hareketi dinamiği | [Eylemsizlik Momenti - Basit Sarkaç](labs/Lab_11_Inertia_Pendulum.ipynb) | [Week 11](notebooks/Week_11.ipynb) |
| 12 | 7–11 December | Equilibrium and centre of mass / Denge ve kütle merkezi | Telafi | [Week 12](notebooks/Week_12.ipynb) |
| 13 | 14–18 December | Periodic motion / Periyodik hareket | — | [Week 13](notebooks/Week_13.ipynb) |

The supplied image gives lecture date ranges; the existing Tuesday lecture times and grading policy remain in force.

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
- **Week 11:** predict rotational motion with torque, inertia, rotational energy and rolling. Periodic motion, including the simple-pendulum model, is taught in Week 13.
- **Week 12:** equilibrium and centre of mass, after rotation. Require both force and torque balance, using perpendicular lever arms.
- **Week 13:** periodic motion. Derive the spring–mass model from Newton’s law and use the small-angle pendulum model with its assumptions. Damping is an optional section at the end of the notebook.

## Review and transition time inside the calendar

Reserve 10–15 minutes at the start of Weeks 03, 08 and 10 for prerequisite recall, followed by a short worked example. Keep the scheduled Week 06 for review. In Weeks 10–13, begin with the “Joining this lesson / Derse buradan başlayanlar” recap in the notebook so students from any of the three departments can enter without prior notebook experience. Short checks after examples ask students to explain a sign, unit or limiting case; they do not add teaching weeks.

## Optional extension notebooks

Five notebooks in [extensions/](extensions/) go beyond the scheduled weeks. They have the same structure as a weekly notebook and are listed on the dashboard under **Extension notebooks**. They are not additional calendar weeks.

| Notebook | Topic | Relation to the calendar |
| --- | --- | --- |
| [Circular_Motion](extensions/Circular_Motion.ipynb) | Centripetal acceleration, banked curves, loops, conical pendulum | Supports Week 10 |
| [Angular_Momentum](extensions/Angular_Momentum.ipynb) | Angular momentum, gyroscopes, rotational collisions | Supports Week 11 |
| [Resonance](extensions/Resonance.ipynb) | Driven damped oscillators, resonance curves, quality factor | Supports Week 13 |
| [Waves_and_Sound](extensions/Waves_and_Sound.ipynb) | Travelling waves, superposition, standing waves, sound | Beyond the calendar |
| [Review_and_Projects](extensions/Review_and_Projects.ipynb) | Formula review and three mini-projects | Beyond the calendar |

## Problem identifiers and complete solution files

Every problem keeps a stable identifier of the form **Module XX Pn** (for example *Module 06 P2* in Week 05). The number names the complete solution file `Week_XX_Python_Solutions.ipynb` in the separate `phy101-solutions` repository, not a calendar week. Module 04 is taught in Weeks 03–04, Module 06 in Weeks 05 and 08, and Module 09 in Weeks 10–11. Each solution file opens on the dashboard one week after the last lecture that uses it, capped at term end; the release dates come from [calendar.json](calendar.json). Until then the notebooks’ own **Answer** blocks give the answer, so students can check themselves without being handed the route.

## Laboratory strand

Eight sessions from the departmental *Deney* column, with one shared technique file. Analysis technique
is a laboratory requirement and is **not** examined in the common exams; the physics measured is.

| Week | Experiment | Brief | Measures |
| --- | --- | --- | --- | --- |
| 02 | Laboratuvar Tanıtımı | [Lab 02](labs/Lab_02_Introduction.ipynb) | [Laboratuvar Tanıtımı](labs/Lab_02_Introduction.ipynb) | Safety, logbook discipline, first honest result |
| 03 | Ölçme Cihazları | [Lab 03](labs/Lab_03_Measuring_Instruments.ipynb) | [Ölçme Cihazları](labs/Lab_03_Measuring_Instruments.ipynb) | Caliper and micrometer; density with propagated uncertainty (Week 01) |
| 04 | Bir Boyutta Hareket – Serbest Düşme | [Lab 04](labs/Lab_04_Free_Fall.ipynb) | [Bir Boyutta Hareket - Serbest Düşme](labs/Lab_04_Free_Fall.ipynb) | $g$ from $h$ against $t^2$; the release delay read off the intercept (Week 02) |
| 05 | Eğik Atış – Sürtünme | [Lab 05](labs/Lab_05_Projectile_Friction.ipynb) | [Eğik Atış - Sürtünme](labs/Lab_05_Projectile_Friction.ipynb) | Predicted vs measured range; $\mu_s = \tan\alpha_c$ (Week 03) |
| 09 | Bir Boyutta Çarpışma | [Lab 09](labs/Lab_09_Collision_1D.ipynb) | [Bir Boyutta Çarpışma](labs/Lab_09_Collision_1D.ipynb) | Momentum conserved, kinetic energy not (Week 09) |
| 10 | Katı Cisimlerin Dönmesi | [Lab 10](labs/Lab_10_Rotation.ipynb) | [Katı Cisimlerin Dönmesi](labs/Lab_10_Rotation.ipynb) | Angular kinematics; $v = R\omega$ two ways (Week 10) |
| 11 | Eylemsizlik Momenti – Basit Sarkaç | [Lab 11](labs/Lab_11_Inertia_Pendulum.ipynb) | [Eylemsizlik Momenti - Basit Sarkaç](labs/Lab_11_Inertia_Pendulum.ipynb) | $I$ from a falling mass; $T^2$ against $L$ (Week 11, plus a Week 13 primer) |
| 12 | Telafi | — | Telafi | Make-up for any missed experiment |

Shared technique: [Lab 00 — measurement and uncertainty toolkit](labs/Lab_00_Uncertainty_Toolkit.ipynb).

## Revision and supplements

| File | What it is | Examinable |
| --- | --- | --- |
| [Final_Review](notebooks/Final_Review.ipynb) | Weeks 01–13 revision for the common final: choosing a principle, a twelve-question self-diagnosis, the formula map, six mixed worked routes | Yes — it revises examinable material |
| [Gravitation_and_Orbits](extensions/Gravitation_and_Orbits.ipynb) | Newton's law of gravitation, orbits, Kepler's laws, escape speed, and a transit-light-curve capstone | **No** — not on the departmental topic list |

Week 01 also carries a **concept pre-check**: twelve conceptual questions with no answers, whose answered
twin is Final_Review §3. See [the concept-inventory protocol](CONCEPT_INVENTORY.md).

See [the course policy](COURSE_POLICY.md), [the textbook and laboratory map](TEXTBOOK_MAP.md),
[schedule implementation](SCHEDULE_ALIGNMENT.md), [the final-four-week teaching handoff](TEACHING_HANDOFF.md),
[the maintenance guide](tools/README.md) and [the review and verification record](REVIEW_REPORT.md).
