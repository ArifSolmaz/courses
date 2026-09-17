# PHY101 — Teaching handoff for calendar Weeks 10–13

The course is delivered to **Mechatronics Engineering, Computer Engineering and Chemical Engineering** students in one class. Use the weekly notebooks below; each one is complete for its week and follows the adopted lecture schedule. The final four weeks pose each physical model as an application question from all three departments.

The shared learning standard is **draw → choose a law → rearrange to the symbolic answer → check a limiting case → substitute with units → interpret**. The limiting-case step was added on 17 September 2026 and is required in every worked example, problem and laboratory prediction; see [COURSE_POLICY.md](COURSE_POLICY.md) §3. A physical explanation and a paper calculation come before any optional simulation. Students may use either discipline’s application context.

**Türkçe:** Mekatronik, Bilgisayar ve Kimya Mühendisliği öğrencileri için farklı fizik öğretmiyoruz; ortak fizik yasasını üç bölümün kendi örnekleriyle açıklıyoruz. Derse bu blokta katılan öğrencilerin önceki notebook’ları kullandığını varsaymayın.

## The actual final four calendar weeks

| Week / dates (2026) | Notebook and lecture | Opening recap / assumption |
| --- | --- | --- |
| 10 · 23–27 November | [Week 10 — Rotation of rigid bodies](notebooks/Week_10.ipynb) | Convert degrees to radians; connect $v=R\omega$ and constant angular acceleration; define the rotation axis before choosing $I$. |
| 11 · 30 November–4 December | [Week 11 — Dynamics of rotational motion](notebooks/Week_11.ipynb) | Draw torques, use $\sum\tau=I\alpha$, include rotational energy, and state the no-slip condition. **Now also teaches angular momentum** ($L=I\omega$, $\sum\tau=dL/dt$, conservation), which the course's learning outcomes require, plus a non-examinable pendulum preview for that week's experiment. |
| 12 · 7–11 December | [Week 12 — Equilibrium and centre of mass](notebooks/Week_12.ipynb) | Resolve forces into components; use perpendicular lever arms; require both $\sum\vec F=0$ and $\sum\tau=0$. |
| 13 · 14–18 December | [Week 13 — Periodic motion](notebooks/Week_13.ipynb) | Recall $F=-kx$, $\sum F=ma$, $\omega_0=\sqrt{k/m}$ and $T=2\pi/\omega_0$; explain equilibrium, amplitude and period. |

The exact Tuesday lecture hours remain those already published. There is no additional compulsory resonance, waves or capstone week after Week 13; the [final-review notebook](notebooks/Final_Review.ipynb) serves the examination period and is not a fourteenth teaching week.

**Laboratory in this block.** Week 10 runs *Katı Cisimlerin Dönmesi* ([Lab 10](labs/Lab_10_Rotation.ipynb)), Week 11 runs *Eylemsizlik Momenti – Basit Sarkaç* ([Lab 11](labs/Lab_11_Inertia_Pendulum.ipynb)) and Week 12 is the make-up session. The Week 11 experiment needs the simple pendulum two weeks before its lecture, so the brief carries a self-contained primer; do not assume students have met it. Laboratory analysis technique is not examined in the common final.

**TR:** 11. hafta deneyi basit sarkacı, dersinden iki hafta önce gerektirir; brifing kendi hazırlığını içerir, öğrencilerin konuyu bildiğini varsaymayın.

## A 10–15-minute entry routine

1. Ask students to draw the system and identify the quantity to predict.
2. Recall one necessary equation and its assumptions. Explain the algebraic operation on both sides, such as dividing $\tau=I\alpha$ by $I$.
3. Work through one small calculation with SI units.
4. Predict what changes if one parameter doubles, then inspect a prepared graph or check the calculation.

Use each weekly notebook’s “Before you start” section, which includes the “Joining this lesson / Derse buradan başlayanlar” recap. If a prerequisite is unfamiliar, repair it with the small example before the main practice. The buffer is inside the existing lesson; it is not a programming lesson or an extra week.

## Shared physical applications

| Physics | Mechatronics Engineering context | Computer Engineering context | Chemical Engineering context |
| --- | --- | --- | --- |
| Rotation and inertia | Predict the acceleration of a flywheel or robot joint for a known torque. | Check a supplied motion trace for radian/degree or time-unit errors; compare its angular acceleration with $\tau/I$. | Estimate the motor torque needed to bring a stirrer or centrifuge rotor to working speed. |
| Rotational energy | Include both translation and rotation when predicting speed or required work. | Compare a model’s energy before and after a no-slip rolling motion; explain any mismatch. | Account for the kinetic energy stored in a spinning rotor when sizing a drive or a brake. |
| Equilibrium | Balance a beam, bracket or robot arm using the same calculation. | Verify reported support loads with a hand force-and-torque balance. | Find the support reactions of a pipe run or vessel whose load is not centred. |
| Periodic motion | Predict vibration of a suspended mass or a compliant mechanism. | Read period from a displacement trace and compare it with a physical model. | Keep a pump or pipe mount’s natural period away from the pump cycle time. |

These contexts change the setting, not the expected physics. No student needs to write Python to explain a discrepancy between the equation, units and observed graph.

## Materials to share

Share the relevant **weekly notebook**: its “Before you start” recap, two worked examples and a small practice set suited to the available class time. Use its **Open in Colab** link on the [course dashboard](web/PHY101_Course_Dashboard.html) for browser access; use **Download notebook** when a colleague needs a local `.ipynb` file. Problems are labelled `Module XX Pn`; the number names the complete solution file (09 for rotation, 08 for equilibrium, 11 for periodic motion), not a calendar week.

The optional notebooks [Angular_Momentum](extensions/Angular_Momentum.ipynb), [Resonance](extensions/Resonance.ipynb), [Waves_and_Sound](extensions/Waves_and_Sound.ipynb) and [Review_and_Projects](extensions/Review_and_Projects.ipynb) remain available as extension resources. Complete solutions for all 140 problems and three projects stay in the separate solutions repository under its release process.

See [the adopted calendar](SCHEDULE_ALIGNMENT.md) and [the complete course outline](content.md).
