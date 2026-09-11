# PHY101 — Teaching handoff for calendar Weeks 10–13

The primary course serves **Computer Engineering and Mechatronics Engineering**. During the final three or four teaching weeks, the same material also supports colleagues’ **Software Engineering and Mechanical Engineering** classes. Use the dated weekly notebooks below; their content follows the adopted lecture schedule.

The shared learning standard is **draw → choose a law → rearrange → substitute with units → interpret and check**. A physical explanation and a paper calculation come before any optional simulation. Students may use either discipline’s application context.

**Türkçe:** Bölümler için farklı fizik öğretmiyoruz; ortak fizik yasasını farklı mühendislik örnekleriyle açıklıyoruz. Derse bu blokta katılan öğrencilerin önceki notebook’ları kullandığını varsaymayın.

## The actual final four calendar weeks

| Week / dates (2026) | Main notebook and lecture | Opening recap / assumption |
| --- | --- | --- |
| 10 · 23–27 November | [Week 10 — Rotation of rigid bodies](calendar/Week_10.ipynb) | Convert degrees to radians; connect $v=R\omega$ and constant angular acceleration; define the rotation axis before choosing $I$. |
| 11 · 30 November–4 December | [Week 11 — Dynamics of rotational motion](calendar/Week_11.ipynb) | Draw torques, use $\sum\tau=I\alpha$, include rotational energy, and state the no-slip condition. |
| 12 · 7–11 December | [Week 12 — Equilibrium and centre of mass](calendar/Week_12.ipynb) | Resolve forces into components; use perpendicular lever arms; require both $\sum\vec F=0$ and $\sum\tau=0$. |
| 13 · 14–18 December | [Week 13 — Periodic motion](calendar/Week_13.ipynb) | Recall $F=-kx$, $\sum F=ma$, $\omega_0=\sqrt{k/m}$ and $T=2\pi/\omega_0$; explain equilibrium, amplitude and period. |

The exact Tuesday lecture hours remain those already published. There is no additional compulsory resonance, waves or capstone week after Week 13.

## A 10–15-minute entry routine

1. Ask students to draw the system and identify the quantity to predict.
2. Recall one necessary equation and its assumptions. Explain the algebraic operation on both sides, such as dividing $\tau=I\alpha$ by $I$.
3. Work through one small calculation with SI units.
4. Predict what changes if one parameter doubles, then inspect a prepared graph or check the calculation.

Use each calendar notebook’s prerequisite recap and the relevant source notebook’s “Joining this lesson / Derse buradan başlayanlar” explanation. If a prerequisite is unfamiliar, repair it with the small example before the main practice. The buffer is inside the existing lesson; it is not a programming lesson or an extra week.

## Shared physical applications

| Physics | Computer / Software Engineering context | Mechatronics / Mechanical Engineering context |
| --- | --- | --- |
| Rotation and inertia | Check a supplied motion trace for radian/degree or time-unit errors; compare its angular acceleration with $\tau/I$. | Predict the acceleration of a flywheel or robot joint for a known torque. |
| Rotational energy | Compare a model’s energy before and after a no-slip rolling motion; explain any mismatch. | Include both translation and rotation when predicting speed or required work. |
| Equilibrium | Verify reported support loads with a hand force-and-torque balance. | Balance a beam, bracket or robot arm using the same calculation. |
| Periodic motion | Read period from a displacement trace and compare it with a physical model. | Predict vibration of a suspended mass or a compliant mechanism. |

These contexts change the setting, not the expected physics. No student needs to write Python to explain a discrepancy between the equation, units and observed graph.

## Materials to share

Share the relevant **calendar notebook**, its entry recap, two worked examples and a small practice set suited to the available class time. Use its **Open in Colab** link on the [course dashboard](web/PHY101_Course_Dashboard.html) for browser access; use **Download notebook** when a colleague needs a local `.ipynb` file. Source module 09 supplies rotation, source 10 offers selected angular-momentum extensions, source 08 supplies equilibrium, and source 11 supplies periodic motion. These source numbers differ from calendar week numbers; the weekly notebook identifies its source problem IDs for solution lookup.

Source modules [12](notebooks/Week_12.ipynb), [13](notebooks/Week_13.ipynb) and [14](notebooks/Week_14.ipynb) remain optional resonance, waves and synthesis resources. Complete solutions for all 140 source problems and three projects stay in the separate solutions repository under its release process.

See [the adopted calendar](SCHEDULE_ALIGNMENT.md) and [the complete course outline](content.md).
