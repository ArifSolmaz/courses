# PHY101 — Adopted teaching calendar and content alignment

**Adopted 11 September 2026; single-notebook edition 12 September 2026.** The lecture topics and dates in the supplied schedule image define this course calendar. The teaching sequence is the 13 weekly notebooks in `notebooks/`, linked from the dashboard, syllabus and course outline. Each weekly notebook is complete on its own; the former source-module library has been merged into these files.

The calendar contains **11 topic weeks, one protected review week and one midterm week**. Work/kinetic energy precedes review and the midterm; potential energy/conservation follows them. Momentum comes next, then rigid-body rotation, rotational dynamics, equilibrium/centre of mass, and finally periodic motion.

**Türkçe:** Bu tablo dersin kullanılan sırasıdır. Her hafta için tek bir not vardır ve o haftanın tamamını kapsar.

## Calendar and actual weekly notes

| Week | Dates (2026) | Lecture | Weekly notebook | Problem identifiers used (solution files) |
| --- | --- | --- | --- | --- |
| 01 | 21–25 September | Measurement, units, physical quantities and vectors / Ölçme ve birim sistemleri, fiziksel nicelikler ve vektörler | [Week 01](notebooks/Week_01.ipynb) | 01 |
| 02 | 28 September–2 October | Motion in one dimension / Bir boyutta hareket | [Week 02](notebooks/Week_02.ipynb) | 02 |
| 03 | 5–9 October | Motion in two dimensions and Newton’s laws / İki boyutta hareket ve Newton yasaları | [Week 03](notebooks/Week_03.ipynb) | 03 + introductory laws/FBD in 04 |
| 04 | 12–16 October | Friction and applications of Newton’s laws / Sürtünme kuvveti ve Newton hareket yasaları uygulamaları | [Week 04](notebooks/Week_04.ipynb) | 04 |
| 05 | 19–23 October | Work and kinetic energy / İş ve kinetik enerji | [Week 05](notebooks/Week_05.ipynb) | 06: work, kinetic energy and power |
| 06 | 26–30 October | Problem solving and review / Soru çözümü ve özet | [Week 06](notebooks/Week_06.ipynb) | 01–04 and the taught work/kinetic-energy sections of 06 |
| 07 | 2–6 November | Midterm / Vize | [Week 07](notebooks/Week_07.ipynb) | Exam preparation using previously taught material |
| 08 | 9–13 November | Potential energy and conservation of energy / Potansiyel enerji ve enerjinin korunumu | [Week 08](notebooks/Week_08.ipynb) | 06: potential energy and energy conservation |
| 09 | 16–20 November | Linear momentum, impulse and collisions / Doğrusal momentum, itme ve çarpışmalar | [Week 09](notebooks/Week_09.ipynb) | 07 |
| 10 | 23–27 November | Rotation of rigid bodies / Katı cisimlerin dönme hareketi | [Week 10](notebooks/Week_10.ipynb) | 09: angular kinematics and moment of inertia |
| 11 | 30 November–4 December | Dynamics of rotational motion / Dönme hareketi dinamiği | [Week 11](notebooks/Week_11.ipynb) | 09: torque, rotational energy and rolling; selected 10 |
| 12 | 7–11 December | Equilibrium and centre of mass / Denge ve kütle merkezi | [Week 12](notebooks/Week_12.ipynb) | 08 |
| 13 | 14–18 December | Periodic motion / Periyodik hareket | [Week 13](notebooks/Week_13.ipynb) | 11: spring–mass and small-angle pendulum motion |

The image supplies lecture date ranges, not clock times; existing Tuesday lecture times, assessment weights and institutional exam arrangements remain unchanged.

## Content changes made for this calendar

- **Week 03 contains both 2D motion and the introduction to Newton’s laws.** Week 04 then applies those laws to friction.
- **Energy is divided into two actual weekly notebooks.** Week 05 teaches work/kinetic energy; Week 08 teaches potential energy/conservation. The October review week and November midterm remain between them.
- **Week 06 is review and Week 07 is midterm preparation/navigation.** Neither is filled with a newly scheduled physics topic.
- **Rotation is divided between Weeks 10 and 11.** Equilibrium and centre of mass are taught in Week 12, followed by periodic motion in Week 13.
- **The final four weekly notebooks address all three departments.** Short joining recaps pose the same physics as Mechatronics, Computer and Chemical Engineering application questions.
- **Extra material stays optional.** Circular motion, angular momentum, resonance, waves and projects are five optional notebooks in `extensions/`, not separate calendar weeks.

The primary **Open in Colab** action opens `notebooks/Week_01.ipynb` through `notebooks/Week_13.ipynb` in Colab. A separate **Download notebook** action retrieves the `.ipynb` file. Every problem keeps its `Module XX Pn` identifier, which names the complete solution file in the separate solutions repository. Release dates follow the final main teaching use of each source module: energy module 06 on 17 November, momentum module 07 on 24 November, rotation module 09 on 8 December, equilibrium module 08 on 15 December, and periodic-motion module 11 on 18 December. The optional extension notebooks (solution files 05, 10, 12, 13 and 14) open at term end, 18 December; early files 01–04 retain their existing dates. Review does not reopen a previously assigned problem set.

## Review buffers and maintenance

Use 10–15-minute prerequisite checks within Weeks 03, 08 and 10 and short entry recaps in Weeks 10–13. Week 06 remains the full scheduled review opportunity. These are transitions within the existing calendar, not added weeks. The holiday-adjusted Week 06 meeting and the exact midterm sitting follow official arrangements.

The canonical calendar data is `calendar.json`, including the extension-notebook list. The dashboard, syllabus, course outline and release mapping must be checked against it whenever dates or assignments change (`tools/sync_calendar.py --check --public-only`). See [the teaching handoff](TEACHING_HANDOFF.md) for the final four weeks.

**Verification, 12 September 2026 (single-notebook edition):** all 13 weekly and 5 extension notebooks validate and execute in fresh kernels; every demonstration panel redraws after a control change. See [REVIEW_REPORT.md](REVIEW_REPORT.md).
