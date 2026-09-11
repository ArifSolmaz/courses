# PHY101 — Adopted teaching calendar and content alignment

**Adopted 11 September 2026.** The lecture topics and dates in the supplied schedule image define this course calendar. The primary teaching sequence is the 13 dated weekly notebooks in `calendar/`, linked from the dashboard, syllabus and course outline. The original fourteen notebooks are retained as a source/extension library, not the teaching timetable.

The calendar contains **11 topic weeks, one protected review week and one midterm week**. Work/kinetic energy precedes review and the midterm; potential energy/conservation follows them. Momentum comes next, then rigid-body rotation, rotational dynamics, equilibrium/centre of mass, and finally periodic motion.

**Türkçe:** Bu tablo artık öneri ya da yalnızca bir eşleştirme değildir; dersin kullanılan sırası ve haftalık notların düzenidir. Eski konu dosyalarının sırası takvim yerine kullanılmaz.

## Calendar and actual weekly notes

| Week | Dates (2026) | Lecture | Weekly notes | Source material used |
| --- | --- | --- | --- | --- |
| 01 | 21–25 September | Measurement, units, physical quantities and vectors / Ölçme ve birim sistemleri, fiziksel nicelikler ve vektörler | [Week 01](calendar/Week_01.ipynb) | 01 |
| 02 | 28 September–2 October | Motion in one dimension / Bir boyutta hareket | [Week 02](calendar/Week_02.ipynb) | 02 |
| 03 | 5–9 October | Motion in two dimensions and Newton’s laws / İki boyutta hareket ve Newton yasaları | [Week 03](calendar/Week_03.ipynb) | 03 + introductory laws/FBD in 04 |
| 04 | 12–16 October | Friction and applications of Newton’s laws / Sürtünme kuvveti ve Newton hareket yasaları uygulamaları | [Week 04](calendar/Week_04.ipynb) | 04 |
| 05 | 19–23 October | Work and kinetic energy / İş ve kinetik enerji | [Week 05](calendar/Week_05.ipynb) | 06: work, kinetic energy and power |
| 06 | 26–30 October | Problem solving and review / Soru çözümü ve özet | [Week 06](calendar/Week_06.ipynb) | 01–04 and the taught work/kinetic-energy sections of 06 |
| 07 | 2–6 November | Midterm / Vize | [Week 07](calendar/Week_07.ipynb) | Exam preparation using previously taught material |
| 08 | 9–13 November | Potential energy and conservation of energy / Potansiyel enerji ve enerjinin korunumu | [Week 08](calendar/Week_08.ipynb) | 06: potential energy and energy conservation |
| 09 | 16–20 November | Linear momentum, impulse and collisions / Doğrusal momentum, itme ve çarpışmalar | [Week 09](calendar/Week_09.ipynb) | 07 |
| 10 | 23–27 November | Rotation of rigid bodies / Katı cisimlerin dönme hareketi | [Week 10](calendar/Week_10.ipynb) | 09: angular kinematics and moment of inertia |
| 11 | 30 November–4 December | Dynamics of rotational motion / Dönme hareketi dinamiği | [Week 11](calendar/Week_11.ipynb) | 09: torque, rotational energy and rolling; selected 10 |
| 12 | 7–11 December | Equilibrium and centre of mass / Denge ve kütle merkezi | [Week 12](calendar/Week_12.ipynb) | 08 |
| 13 | 14–18 December | Periodic motion / Periyodik hareket | [Week 13](calendar/Week_13.ipynb) | 11: spring–mass and small-angle pendulum motion |

The image supplies lecture date ranges, not clock times; existing Tuesday lecture times, assessment weights and institutional exam arrangements remain unchanged.

## Content changes made for this calendar

- **Week 03 contains both 2D motion and the introduction to Newton’s laws.** Week 04 then applies those laws to friction.
- **Energy is divided into two actual weekly notebooks.** Week 05 teaches work/kinetic energy; Week 08 teaches potential energy/conservation. The October review week and November midterm remain between them.
- **Week 06 is review and Week 07 is midterm preparation/navigation.** Neither is filled with a newly scheduled physics topic.
- **Rotation is divided between Weeks 10 and 11.** Equilibrium and centre of mass are taught in Week 12, followed by periodic motion in Week 13.
- **The final four weekly notebooks support all four engineering audiences.** Short joining recaps and common physical applications support Computer/Mechatronics and colleagues’ Software/Mechanical classes.
- **Extra source material stays optional.** Circular motion, extended angular momentum, resonance, waves and projects remain available without being presented as separate calendar weeks.

The primary **Open in Colab** action opens the corresponding `calendar/Week_01.ipynb` through `calendar/Week_13.ipynb` in Colab. A separate **Download notebook** action retrieves the `.ipynb` file. The table above links directly to those notebook files for reference. Source module/problem identifiers are preserved in the assembled content for solution lookup. Source solutions remain in their separate repository. Release dates follow the final main teaching use of each source module: energy module 06 on 17 November, momentum module 07 on 24 November, rotation module 09 on 8 December, equilibrium module 08 on 15 December, and periodic-motion module 11 on 18 December. Extension modules 05, 10, 12, 13 and 14 open at term end, 18 December; early modules 01–04 retain their existing dates. Review does not reopen a previously assigned problem set.

## Review buffers and maintenance

Use 10–15-minute prerequisite checks within Weeks 03, 08 and 10 and short entry recaps in Weeks 10–13. Week 06 remains the full scheduled review opportunity. These are transitions within the existing calendar, not added weeks. The holiday-adjusted Week 06 meeting and the exact midterm sitting follow official arrangements.

The canonical calendar data is `calendar.json`. The dashboard, syllabus, weekly notebooks, course outline and release mapping must be checked against its 13 entries whenever dates or assignments change. See [the teaching handoff](TEACHING_HANDOFF.md) for the final four weeks.

**Prior textbook-edition validation, 11 September 2026:** all 13 dated notebooks validated and reproduced; all 37 code cells in the 11 interactive lessons passed fresh-kernel execution, and review/midterm remained paper-only. All 13 dashboard links returned the matching notebooks. Dashboard, syllabus and the private publisher agreed on dates; publisher output was checked immediately before and on each release date. These results describe the earlier edition. See [REVIEW_REPORT.md](REVIEW_REPORT.md) for the current lecture-scope/link revision and the prior verification record.
