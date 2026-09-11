#!/usr/bin/env python3
"""Build 13 dated, scoped PHY101 lessons from the enriched topic-module library.

The calendar JSON controls lecture dates and titles; the explicit selections below control
what is actually taught. Source cell IDs are checked rather than guessed from cell
positions. Original module notebooks and the private solution repository are read
only. Run --check to detect stale generated lessons, or --execute for fresh-kernel
QA copies in the OS temporary directory (never store execution output in lessons).
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import tempfile
from datetime import date
from pathlib import Path

import nbformat

ROOT = Path(__file__).resolve().parents[1]

# Original, short teaching material fills genuine transitions between the source
# modules. These are worked class examples, not additions to the stable P1–P10 sets.
CONTENT = {
"unit_example": r'''## Worked example: one conversion, one physical quantity

A cart travels at 72 km/h. Convert its speed to SI units before using a motion equation.
$$72\,\frac{\mathrm{km}}{\mathrm h}\times\frac{1000\,\mathrm m}{1\,\mathrm{km}}
\times\frac{1\,\mathrm h}{3600\,\mathrm s}=20\,\mathrm{m/s}.$$
The kilometre and hour units cancel. Multiplying by each conversion ratio changes the number and unit together, while preserving the speed.

**Check:** 20 metres every second is 72,000 metres in an hour. **TR:** Önce birimleri sadeleştir; yalnızca sayıları çarpıp bölme. Aynı fiziksel hızı farklı birimlerle yazıyoruz.''',
"newton_intro": r'''## A first force diagram: which interactions act on one object?

For today's Newton introduction, practise weight, support and an applied force. Draw only forces **on the chosen object**. A third-law partner acts on the other object.

A 2.0 kg cart on a horizontal frictionless track is pulled right by 6.0 N. Choose right and up positive. Vertical forces balance: $N-mg=0$, so $N=2.0(9.81)=19.62$ N. Horizontally,
$$\sum F_x=ma_x\Rightarrow6.0=2.0a_x\Rightarrow a_x=3.0\,\mathrm{m/s^2}.$$
From rest, after 2.0 s its velocity is $v_x=0+(3.0)(2.0)=6.0$ m/s. The force on the cart causes its acceleration. The opposite force **on the hand or rope** does not cancel it on the cart's diagram.

**Check:** With the pull removed, the ideal cart keeps its velocity; zero force means zero acceleration, not necessarily zero velocity. **TR:** Bu hafta önce tek cismin kuvvetlerini ayırıyoruz. Sürtünmenin türleri ve eğik düzlem uygulamaları gelecek haftanın konusudur.''',
"kinetic_bridge": r'''## Kinetic energy: solve for speed one operation at a time

Kinetic energy describes motion: $K=\tfrac12mv^2$, measured in joules ($1\,\mathrm J=1\,\mathrm{kg\,m^2/s^2}$). Net work changes it:
$$W_{\rm net}=K_f-K_i=\tfrac12mv_f^2-\tfrac12mv_i^2.$$
The word **net** matters: add the work of all forces first. Positive work increases kinetic energy, negative work decreases it, and a force perpendicular to displacement does zero work.

A 4.0 kg cart starts at 2.0 m/s and receives 24 J of net work. Its initial energy is $K_i=\tfrac12(4)(2^2)=8$ J. Thus $K_f=8+24=32$ J. Solve $32=\tfrac12(4)v_f^2$:
$$64=4v_f^2\Rightarrow16=v_f^2\Rightarrow v_f=4.0\,\mathrm{m/s}.$$
We multiplied both sides by 2, divided by 4 kg, and took the positive square root for speed. Energy does not give the direction; use the diagram.

**TR:** Bu hafta iş ve kinetik enerji kullanıyoruz. Potansiyel enerji ve korunma hesabını vizeden sonraki 8. haftada kuracağız. Sonucun sürat olması için karekök adımını unutma.''',
"work_example": r'''## Worked example: opposite forces do opposite work

A 3.0 kg box already slides to the right at 2.0 m/s. A 12 N horizontal pull and a 3 N friction force act over 4.0 m. Find its final speed.

The pull does $W_{\rm pull}=12(4)\cos0^\circ=48$ J. Friction does $W_f=3(4)\cos180^\circ=-12$ J. Weight and normal are perpendicular to motion and do zero work.
$$W_{\rm net}=48-12=36\,\mathrm J,\qquad K_i=\tfrac12(3)(2^2)=6\,\mathrm J.$$
$$K_f=6+36=42\,\mathrm J=\tfrac12(3)v_f^2
\Rightarrow v_f^2=\frac{2(42)}3=28\Rightarrow v_f=5.292\,\mathrm{m/s}.$$
**Check by Newton:** $a=(12-3)/3=3$ m/s² and $v_f^2=2^2+2(3)(4)=28$ m²/s². Both routes predict the same speed.

**TR:** Sürtünmenin yaptığı iş negatiftir. Ancak toplam iş hâlâ pozitif olduğu için cisim hızlanır.''',
"power_example": r'''## Power: how quickly is work done?

Average power is $P=W/\Delta t$. At constant velocity with force parallel to motion, $P=Fv$. Power is measured in watts: $1\,\mathrm W=1\,\mathrm{J/s}$.

For the module's lifting example, a motor raises a 200 kg crate at constant speed 0.50 m/s. There is no acceleration, so its upward force is $F=mg=200(9.81)=1962$ N.
$$P=Fv=(1962\,\mathrm N)(0.50\,\mathrm{m/s})=981\,\mathrm W.$$
In 4.0 s it lifts 2.0 m and does $W=1962(2)=3924$ J; dividing by 4.0 s again gives 981 W. This is mechanical output power; electrical input would require motor efficiency.

**TR:** İş enerji aktarımıdır; güç bunun ne kadar hızlı yapıldığını gösterir. Sabit hızda kuvvet sıfır değildir, net kuvvet sıfırdır.''',
"potential_intro": r'''## After the midterm: put gravitational work into an energy account

Recall $W_{\rm net}=K_f-K_i$. For a vertical displacement with upward positive, gravity does
$$W_g=-mg(y_f-y_i)=mgy_i-mgy_f.$$
Define gravitational potential energy $U_g=mgy$ relative to one chosen zero height. Then $W_g=U_{g,i}-U_{g,f}$. Substitute into work–energy and add $U_{g,f}$ to both sides:
$$K_i+U_{g,i}=K_f+U_{g,f}.$$
We have reorganized the same physics. Do not count gravitational work a second time after including $U_g$.

A spring stores $U_s=\tfrac12kx^2$, with $x$ measured from its natural length. This is the triangular area under the applied-force-versus-extension graph. If other forces such as friction do work,
$$K_i+U_i+W_{\rm other}=K_f+U_f.$$
Friction usually makes $W_{\rm other}<0$ for the chosen moving system. Mechanical energy decreases while energy transfers to thermal/internal forms.

**TR:** Önce sıfır yüksekliği seç. $mgh$ yalnızca seçtiğin referansa göre anlamlıdır; iki durum arasında aynı referansı koru.''',
"friction_energy_example": r'''## Worked example: use the actual ramp length for friction

Module 06's example has a 4 kg block descending a 2 m high, 25° ramp with initial speed 1 m/s and $\mu_k=0.15$. Choose the bottom as zero height; the block is already sliding down.

Ramp distance is $s=h/\sin25^\circ=4.7324$ m. The normal force is $N=mg\cos25^\circ=35.5635$ N, so $f_k=0.15N=5.3345$ N and $W_f=-f_ks=-25.2451$ J.
$$K_i=\tfrac12(4)(1^2)=2\,\mathrm J,\quad U_i=4(9.81)(2)=78.48\,\mathrm J.$$
$$K_f=K_i+U_i+W_f=2+78.48-25.2451=55.2349\,\mathrm J.$$
$$v_f=\sqrt{2K_f/m}=\sqrt{2(55.2349)/4}=5.2552\,\mathrm{m/s}.$$
**Check:** Without friction, $v_f=\sqrt{1^2+2g(2)}=6.3435$ m/s, so the smaller result is reasonable. Use full precision in intermediate calculations.

**TR:** Sürtünme eğik düzlem boyunca etkir; yaptığı işte düşey yüksekliği değil, eğik yol uzunluğunu kullan.''',
"inelastic_example": r'''## Worked example: the two carts stick together

A 2.0 kg cart moves right at 3.0 m/s and hits a stationary 1.0 kg cart. They stick. Choose right positive and neglect external impulse during the short collision.
$$m_1v_{1i}+m_2v_{2i}=(m_1+m_2)v_f,$$
$$2(3)+1(0)=3v_f\Rightarrow v_f=2.0\,\mathrm{m/s}\text{ right}.$$
Initial kinetic energy is $K_i=\tfrac12(2)(3^2)=9$ J; final energy is $K_f=\tfrac12(3)(2^2)=6$ J. Momentum stays 6 kg m/s, while 3 J transfers to internal energy. Momentum conservation alone does not make a collision elastic.

**TR:** Yapışma anında önce momentumu kullan. Mekanik enerjinin tamamının korunacağını varsayma.''',
"rotation_intro": r'''## Rotation begins with angle, not torque

A rigid body keeps its shape. Every point shares the same angular displacement $\Delta\theta$, angular velocity $\omega$, and angular acceleration $\alpha$, although points farther from the axis move farther.

One revolution is $2\pi$ radians. Convert 120 RPM:
$$120\frac{\mathrm{rev}}{\mathrm{min}}\times\frac{2\pi\,\mathrm{rad}}{1\,\mathrm{rev}}\times\frac{1\,\mathrm{min}}{60\,\mathrm s}
=4\pi=12.566\,\mathrm{rad/s}.$$
For a point 0.20 m from the axis, $v=r\omega=0.20(12.566)=2.513$ m/s. A point at half that radius has half the tangential speed but the same $\omega$.

**Today's scope:** describe rotation and calculate moment of inertia. Next week we use torque to explain how rotation changes. **TR:** Bu hafta dönmenin kinematiği ve kütlenin eksene göre dağılımını öğreniyoruz; torkla ivmelendirme sonraki haftada.''',
"inertia_example": r'''## Worked example: moving the same mass changes inertia

Two small masses, each 0.50 kg, are mounted on a light rod, each 0.20 m from its central rotation axis. Treat them as particles.
$$I=\sum mr^2=0.50(0.20)^2+0.50(0.20)^2=0.0400\,\mathrm{kg\,m^2}.$$
Move both to 0.40 m without changing their masses:
$$I_{\rm new}=2[0.50(0.40)^2]=0.160\,\mathrm{kg\,m^2}=4I.$$
The distance from the axis is squared, so doubling it quadruples the inertia. The total mass is still 1.00 kg.

**Check:** $\mathrm{kg}\times\mathrm{m^2}$ is the unit of inertia. The $r$ in the formula is distance from the **specified rotation axis**, not distance from an arbitrary end of the rod. **TR:** Eksenin yerini çizmeden eylemsizlik momenti hesaplama.''',
"torque_dynamics": r'''## From a force to an angular acceleration

For rotation about a fixed axis, take counterclockwise positive. A force's torque component is $\tau=rF\sin\phi=F\ell_\perp$, where $\ell_\perp$ is the perpendicular distance from the axis to the force's line of action. Add signed torques before using
$$\sum\tau=I\alpha.$$
A 2.0 kg solid disk of radius 0.20 m has $I=\tfrac12MR^2=0.0400$ kg m². A tangential 3.0 N push gives $\tau=Fr=0.600$ N m. Divide both sides of $0.600=0.0400\alpha$ by $I$:
$$\alpha=15.0\,\mathrm{rad/s^2}.$$
From rest, after 2.0 s, $\omega=\alpha t=30.0$ rad/s and $\theta=\alpha t^2/2=30.0$ rad. Work and rotational energy agree:
$$W=\tau\theta=0.600(30.0)=18.0\,\mathrm J
=\tfrac12I\omega^2.$$
**TR:** Önce toplam torku bul, sonra $I$'ya böl. Kuvveti doğrudan $I\alpha$'ya eşitlemek birim bakımından yanlıştır.''',
"review_start": r'''## Review week: reconnect the first five teaching weeks

No new topic is introduced this week. Use the 29 October holiday week for question solving and repair of the foundations already taught: units/vectors, 1D/2D motion, Newton's laws/friction, work and kinetic energy. Potential energy and its conservation account begin after the midterm.

Start by rating each skill **can explain / need a hint / need help**: unit conversion; choosing signs; velocity components; drawing one object's forces; rearranging an equation; checking work signs. Choose two weak skills, then use the worked review activities below. **TR:** Amaç yeni formül eklemek değil, bildiğimiz konuları birbirine bağlamak ve eksik adımı bulmak.''',
"review_a": r'''## Review A — motion plus force, with a complete worked route

A 2.0 kg cart begins at rest on a horizontal track. A 10 N force pulls right while a 2 N friction force acts left for 3.0 s. Assume the cart is already in the sliding regime once motion begins and these forces stay constant.

1. Draw the cart: right pull, left friction, upward normal, downward weight. Choose right positive.
2. Net horizontal force is $10-2=8$ N. From $F_{\rm net}=ma$, divide by 2.0 kg: $a=4.0$ m/s².
3. $v=0+at=4.0(3.0)=12.0$ m/s and $d=0+at^2/2=4.0(9.0)/2=18.0$ m.
4. Check the same motion with work: $W_{\rm net}=F_{\rm net}d=8(18)=144$ J. The change in kinetic energy is $\Delta K=\tfrac12(2)(12^2)-0=144$ J.

**Explain:** Why is $10/2$ the wrong acceleration? Why is friction work negative even while speed increases? **Answer:** acceleration uses the net 8 N, and the negative friction work is smaller than the positive pulling work. **TR:** Aynı durumu iki yöntemle kontrol etmek, yalnızca son sayıyı kontrol etmekten daha değerlidir.''',
"review_b": r'''## Review B — one clock for two directions

A ball leaves a 1.25 m high table horizontally at 3.0 m/s. Ignore drag. Set upward positive and floor height to zero.
$$0=1.25-\tfrac12gt^2\Rightarrow t^2=\frac{2(1.25)}{9.81}
\Rightarrow t=0.50482\,\mathrm s.$$
Horizontal range is $x=v_xt=3.0(0.50482)=1.5145$ m. Just before impact $v_y=-gt=-4.9523$ m/s. Speed is
$$v=\sqrt{v_x^2+v_y^2}=\sqrt{3.0^2+4.9523^2}=5.7901\,\mathrm{m/s}.$$
The vertical force is $mg$ down throughout the flight; horizontal net force is zero. At release the vertical speed is zero but acceleration is already downward.

**Try then check:** If horizontal launch speed doubles, time stays 0.50482 s and range doubles to 3.0289 m. **TR:** Yatay hız iki katına çıkınca düşey denklem değişmez; ortak süre değişmeden yatay yol artar.''',
"review_c": r'''## Review C — repair a tempting wrong solution

A 1000 kg vehicle slows from 72 km/h to 36 km/h. A learner writes “energy halves because speed halves.” Correct the reasoning.

Convert the speeds first: $72/3.6=20$ m/s and $36/3.6=10$ m/s.
$$K_i=\tfrac12(1000)(20^2)=200000\,\mathrm J,
\quad K_f=\tfrac12(1000)(10^2)=50000\,\mathrm J.$$
$$W_{\rm net}=K_f-K_i=-150000\,\mathrm J.$$
Energy becomes one quarter, because speed is squared. If the net retarding force is constant at 3000 N, take forward positive and write $W=-Fd$:
$$-150000=-3000d\Rightarrow d=50.0\,\mathrm m.$$
**Check:** $a=-3000/1000=-3.0$ m/s², and $10^2=20^2+2(-3)d$ also gives 50.0 m. **TR:** Eksi işaretini kaybetme; fren kuvveti hareket yönüne terstir.''',
"midterm_start": r'''## Midterm week — preparation and reflection, no new teaching unit

The supplied calendar marks **2–6 November as Vize / Midterm**. It does not give the exact exam day, duration, room, question count, or permitted materials. Follow the instructor's announced examination arrangements.

This notebook is a short preparation aid using only Calendar Weeks 1–5. Calendar Week 6 contains the full review activities. You do not need to run Python to prepare or demonstrate a calculation.

Before calculating: draw the situation, choose axes, list givens with units, select a physical law, rearrange symbolically, substitute, and explain the sign. **TR:** Burada yeni konu yok. Sınavın gününü ve uygulama kurallarını ders duyurusundan kontrol et.''',
"midterm_rehearsal": r'''## A 15-minute self-check with its worked explanation

A 4.0 kg object moving right at 2.0 m/s receives a constant net force of 8.0 N rightward over 3.0 m. Find final speed in two ways. Cover the calculation first and try it on paper.

**Force and motion:** $a=F_{\rm net}/m=8/4=2.0$ m/s². Time is unnecessary, so use
$$v_f^2=v_i^2+2ad=2^2+2(2)(3)=16\Rightarrow v_f=4.0\,\mathrm{m/s}.$$
**Work and kinetic energy:** $W=8(3)=24$ J and $K_i=\tfrac12(4)(2^2)=8$ J. Then $K_f=32$ J, so
$$32=\tfrac12(4)v_f^2\Rightarrow64=4v_f^2\Rightarrow v_f^2=16\Rightarrow v_f=4.0\,\mathrm{m/s}.$$
**Check:** both routes agree. The unit of $2ad$ is m²/s², matching $v^2$. The result is a speed; the stated force/motion directions establish that the object still moves right.

**TR:** Ezberden çok denklem seçimini çalış. Süre verilmiyorsa süre içermeyen bir bağıntı kullanabilirsin.''',
"midterm_after": r'''## After the exam: keep a short error log

For one question, record the **first** uncertain step: units, diagram, signs, law choice, algebra, or interpretation. Redo that step before looking at a numerical answer. Compare with the worked examples and the relevant Module XX problem solution when released.

Next teaching week begins potential energy and conservation. First bring back one established statement: **net work equals the change in kinetic energy**. **TR:** Yanlış soruyu tamamen kopyalamak yerine ilk hata yaptığın adımı bul ve düzelt.''',
"periodic_entry": r'''## What makes motion periodic? / Hareket ne zaman periyodiktir?

Periodic motion repeats after a period $T$. Frequency is $f=1/T$. Simple harmonic motion is a special periodic motion: the restoring acceleration is proportional to displacement and opposite in direction, $a=-\omega^2x$.

Today we introduce spring–mass motion and the small-angle pendulum, then connect their displacement, velocity, acceleration and energy. The pendulum period $T=2\pi\sqrt{L/g}$ will follow from the restoring torque and the small-angle assumption. Damping/resonance are optional extensions after the core examples; they do not add another dated teaching week.

**TR:** Periyodik olan her hareket basit harmonik değildir. Burada ayırt edici özellik, ivmenin denge noktasına yönelmesi ve uzaklıkla orantılı olmasıdır.'''
}


def source(module, cell_id, **kwargs):
    return {"type": "source", "module": module, "cell_id": cell_id, **kwargs}


def prose(key):
    return {"type": "prose", "key": key}


# Sequence is teaching order. Subsection boundaries are exact source headings;
# excluded material is not silently copied into the generated calendar lesson.
LESSONS = {
1: {"focus": ["Units, dimensions and measurement precision", "Vector components and addition"],
    "recap": "What is a measurable quantity? Give a number together with a unit. / Ölçüm sonucunu sayı ve birimle birlikte söyle.",
    "sections": [source(1,"physics-algebra-bridge-w01"),source(1,"cell-5"),prose("unit_example"),source(1,"cell-8"),source(1,"cell-11"),source(1,"week_01-018"),source(1,"cell-13"),source(1,"week_01-035"),source(1,"cell-16"),source(1,"cell-30"),source(1,"week_01-053")],
    "practice": [(1,1),(1,3),(1,4)],"optional_practice": [(1,2),(1,5)],
    "support_sections": [source(1,"cell-19"),source(1,"cell-32")],
    "demos": [source(1,"cell-15"),source(1,"cell-18"),source(1,"cell-21")],"demo_prompt": "Start with components: predict the signs at 130° before changing the angle. Choose the addition or projection demo only after its paper example. One visual check is enough during class; the other views remain available for review.",
    "exit": "Write the components of a vector and explain why displacement need not equal path length."},
2: {"focus": ["Position, velocity and acceleration", "Constant acceleration and free fall"],
    "recap": r"Convert $36\,\mathrm{km/h}$ to $10\,\mathrm{m/s}$. Choose which direction is positive before assigning a sign.",
    "sections": [source(2,"physics-algebra-bridge-w02"),source(2,"cell-5",before="### Analogy"),source(2,"cell-6"),source(2,"cell-21"),source(2,"cell-23"),source(2,"cell-25")],
    "practice": [(2,1),(2,2),(2,3)],"optional_practice": [(2,4),(2,7)],
    "demos": [source(2,"cell-11")],"demo_prompt": r"Use $v_0=5\,\mathrm{m/s}$ and $a=-1\,\mathrm{m/s^2}$. Predict the turning time and distinguish signed displacement from distance.",
    "exit": "Explain why a thrown ball has zero velocity but nonzero acceleration at its highest point."},
3: {"focus": ["Two-dimensional motion: components share one time", "Newton’s three laws and a first force diagram"],
    "recap": r"Resolve a velocity into horizontal and vertical components; recall $a_y=-g$ when upward is positive.",
    "sections": [source(3,"physics-algebra-bridge-w03"),source(3,"cell-4"),source(3,"cell-16"),source(3,"cell-18"),source(4,"cell-4",start="### 2.1 The Three Laws",before="### 2.2 Common Forces"),prose("newton_intro")],
    "practice": [(3,2),(3,3),(4,1)],"optional_practice": [(3,1)],
    "demos": [source(3,"cell-8")],"demo_prompt": "The range graph assumes equal launch/landing heights and no air resistance. Explain why it cannot directly answer the cliff example.",
    "exit": "Draw one object's forces and explain why action–reaction partners do not cancel on its diagram."},
4: {"focus": ["Static and kinetic friction; force diagrams", "Inclines and connected bodies"],
    "recap": r"Apply $\sum\mathbf F=m\mathbf a$ to one object. Review vector components from Weeks 1–3.",
    "sections": [source(4,"physics-algebra-bridge-w04"),source(4,"cell-4",start="### 2.2 Common Forces"),source(4,"cell-15"),source(4,"cell-17"),source(4,"cell-19")],
    "practice": [(4,2),(4,4),(4,5)],"optional_practice": [(4,6),(4,7)],
    "demos": [source(4,"cell-12")],"demo_prompt": "Predict the static threshold before changing mass. Explain why static friction equals the needed force only up to its limit.",
    "exit": "Explain which coefficient decides whether sliding starts and which coefficient predicts acceleration after sliding."},
5: {"focus": ["Work by a force and its sign", "Kinetic energy, work–energy and power"],
    "recap": r"Find net force first. Review $F\cos\theta$ as the force component along a displacement.",
    "sections": [source(6,"cell-4",start="### 2.1 Work by a constant force",before="### 2.3 Key energy definitions"),prose("kinetic_bridge"),prose("work_example"),source(6,"cell-13"),prose("power_example")],
    "practice": [(6,1),(6,2),(6,4)],"optional_practice": [(6,8)],
    "demos": [source(6,"cell-12",adapt="constant_work_only")],"demo_prompt": "The selected graph uses a constant 15 N force. Predict the rectangular area at 2 m and 4 m before moving the endpoint.",
    "exit": "Show algebraically why doubling speed quadruples kinetic energy, and explain the sign of friction work."},
6: {"focus": ["Repair units, signs and force diagrams", "Solve motion/work questions and explain errors"],
    "recap": "Choose two foundations that need practice; no new formulas are introduced.",
    "sections": [prose("review_start"),prose("review_a"),prose("review_b"),prose("review_c")],
    "practice": [(1,2),(2,4),(3,2),(4,1),(6,1)],"optional_practice": [],"demos": [],
    "exit": "Explain one solution without code and identify the first step that still needs clarification."},
7: {"sections": [prose("midterm_start"),prose("midterm_rehearsal"),prose("midterm_after")],
    "practice": [],"optional_practice": [],"demos": [],"exit": "Use announced exam arrangements; bring one unresolved conceptual question to review."},
8: {"focus": ["Potential energy and a consistent reference", "Conservation with springs and dissipative work"],
    "recap": r"Restore $W_{\rm net}=K_f-K_i$ from Week 5. Distinguish an equation from its numerical substitution.",
    "sections": [prose("potential_intro"),source(6,"97b62121"),source(6,"cell-4",start="### 2.5 Conservation of Mechanical Energy"),source(6,"cell-15"),prose("friction_energy_example")],
    "practice": [(6,3),(6,5),(6,6)],"optional_practice": [],
    "demos": [source(6,"cell-6")],"demo_prompt": "Predict kinetic and gravitational energy at launch, the peak and return. Explain why total mechanical energy stays constant in this model.",
    "exit": "Choose a zero height, write initial/final energies, and show where friction belongs without counting gravity twice."},
9: {"focus": ["Momentum and impulse", "Elastic and inelastic collisions"],
    "recap": "Use signed velocities and separate before/after states. Review kinetic energy from Week 5.",
    "sections": [source(7,"95fd070f"),source(7,"cell-2"),source(7,"cell-3"),source(7,"cell-7"),prose("inelastic_example"),source(7,"cell-14")],
    "practice": [(7,1),(7,2),(7,4)],"optional_practice": [(7,5)],
    "demos": [source(7,"cell-9")],"demo_prompt": "Predict the signs of final velocities. Compare momentum and kinetic energy when switching between elastic and sticking collisions.",
    "exit": "State the condition for momentum conservation and explain why a sticking collision loses kinetic energy."},
10: {"focus": ["Radians and angular kinematics", "Moment of inertia and axis choice"],
    "recap": "Review the constant-acceleration equation pattern from Week 2; replace position by angle only after identifying the axis.",
    "sections": [prose("rotation_intro"),source(9,"week_09-007"),source(9,"week_09-028"),source(9,"week_09-013"),prose("inertia_example")],
    "practice": [(9,1),(9,2)],"optional_practice": [],
    "demos": [source(9,"week_09-017")],"demo_prompt": "Predict which has larger inertia: ring or disk at equal mass and radius. Explain why rod comparisons also require its length and axis.",
    "exit": "Convert RPM to rad/s and explain how moving mass away from the axis changes I."},
11: {"focus": ["Torque, angular acceleration and work", "Rotational energy and rolling"],
    "recap": r"Calculate $I$ about the actual axis and recall $\omega=\omega_0+\alpha t$.",
    "sections": [prose("torque_dynamics"),source(9,"week_09-018"),source(9,"week_09-030")],
    "practice": [(9,3),(9,5),(9,7)],"optional_practice": [(9,8),(9,9)],
    "demos": [source(9,"week_09-020")],"demo_prompt": r"Predict the rolling order from $\dfrac{I}{MR^2}$ before running the comparison. State the no-slip condition and explain the two kinetic-energy terms.",
    "extension": "If core work is secure, Module 10 explains angular momentum and its conservation. It is supporting reading here, not a second complete lecture. The full periodic-motion lesson follows in Calendar Week 13.",
    "exit": r"Use $\sum\tau=I\alpha$ with signed torque, then explain why some downhill energy goes into rotation."},
12: {"focus": ["Centre of mass", "Force and torque balance"],
    "recap": "Review torque and perpendicular lever arms from Week 11. Static equilibrium requires both zero net force and zero net torque.",
    "sections": [source(8,"week_08-004"),source(8,"week_08-006"),source(8,"week_08-023"),source(8,"week_08-016"),source(8,"week_08-025")],
    "practice": [(8,1),(8,3),(8,5)],"optional_practice": [(8,6)],
    "demos": [source(8,"week_08-010"),source(8,"week_08-020")],"demo_prompt": "Predict the shift of centre of mass when one mass increases. For the seesaw, balance the moments before moving a control.",
    "exit": "Choose a pivot that removes one unknown, then verify the reaction forces add to the total load."},
13: {"focus": ["Periodic motion and spring–mass SHM", "Pendulum period, energy and initial conditions"],
    "recap": "Recall restoring forces, the energy account from Week 8, and torque from Week 11. A full cycle returns to the same position and direction.",
    "sections": [prose("periodic_entry"),source(11,"week_11-009"),source(11,"week_11-032"),source(11,"week_11-014"),source(11,"week_11-034"),source(11,"week_11-020")],
    "practice": [(11,1),(11,2),(11,4)],"optional_practice": [(11,5)],
    "demos": [source(11,"week_11-013"),source(11,"week_11-019")],"demo_prompt": "Identify where speed is zero and acceleration is largest. Compare the small-angle pendulum curve with the full model without deriving its code.",
    "extension": "Damping is optional enrichment in Module 11; forced oscillations and resonance are in Module 12. Waves/sound (Module 13) and computational projects (Module 14) remain extension resources, not extra calendar weeks.",
    "exit": "Explain the difference between period and frequency, and connect restoring force, acceleration and energy at an endpoint."}
}

# Model responses also cover the new entry, exit and visual predictions. The
# learner may choose a different valid example, but no new calculation is left
# with only an unexplained final number or an unavailable solution reference.
CHECKS = {
1: r'''**Entry:** “A distance of 5 m” identifies a quantity, number and unit. A number such as 5 alone cannot identify the physical distance.

**Exit:** For magnitude $A$ at angle $\theta$ from positive $x$, $A_x=A\cos\theta$ and $A_y=A\sin\theta$. Walking 3 m out and 3 m back gives distance 6 m but displacement 0 m: displacement compares endpoints.

**Visual prediction:** At $130^\circ$, a magnitude of 5 gives $A_x=5\cos130^\circ=-3.21394$ and $A_y=5\sin130^\circ=3.83022$. The signs locate quadrant II. Squaring and adding gives $A_x^2+A_y^2=25$ (before rounding), so the magnitude stays 5. Rotating changes components, not length. In the addition view, equal opposite vectors give a zero resultant with undefined direction. In projection, the signed component is positive at $0^\circ$, zero at $90^\circ$, and negative at $180^\circ$.''',
2: r'''**Entry:** $36\,\mathrm{km/h}\times1000/3600=10\,\mathrm{m/s}$. A leftward velocity is negative if right is positive; a sign needs a stated axis.

**Exit:** At the highest point of a vertical throw, the instantaneous velocity is zero while gravity still gives $a_y=-9.81$ m/s². The velocity changes through zero; the ball does not stay there.

**Visual prediction:** With $v_0=5$ m/s and $a=-1$ m/s², set $v=5-t=0$, so the turning time is 5 s. Before that turn, $\Delta x=5(5)-5^2/2=12.5$ m and distance is also 12.5 m. If motion continues to 10 s, displacement is $5(10)-10^2/2=0$ but distance is $12.5+12.5=25$ m.''',
3: r'''**Entry:** $v_x=v_0\cos\theta$, $v_y=v_0\sin\theta$ initially. With upward positive and no air resistance, $a_y=-g$ and $a_x=0$.

**Exit:** For the example cart, draw weight down, normal up and pull right. Its third-law partner is the cart's force on the pulling hand/rope. Because that partner acts on another object, it is absent from the cart's force sum.

**Visual prediction:** $R=v_0^2\sin(2\theta)/g$ uses a flight time $2v_0\sin\theta/g$, derived by setting final height equal to initial height. A cliff landing is lower, so solve the vertical height equation for its positive time and then use $R=v_xt$.''',
4: r'''**Entry:** Resolve the actual forces along the chosen axes, add them with signs, and divide their sum by mass. For a ramp tilted by $\theta$, the weight components have magnitudes $mg\sin\theta$ parallel and $mg\cos\theta$ perpendicular to it.

**Exit:** Compare the needed static friction with $\mu_sN$ to decide whether rest is possible. Once the object slides, use $f_k=\mu_kN$ opposite the relative sliding direction to find its acceleration. Do not automatically set static friction equal to its maximum.

**Visual prediction:** On the horizontal surface with no other vertical forces, $N=mg$ and the threshold is $F_{\rm threshold}=\mu_smg$. Doubling mass doubles this threshold. Below it, $f_s=F_{\rm applied}$ and net horizontal force is zero.''',
5: r'''**Entry:** Along a displacement $d$, only $F\cos\theta$ contributes to $W=Fd\cos\theta$. Add each force's work with its sign before applying $W_{\rm net}=\Delta K$.

**Exit:** $K(2v)=\tfrac12m(2v)^2=4(\tfrac12mv^2)=4K(v)$. For sliding friction opposite the displacement, $\theta=180^\circ$, so $W_f=f_kd\cos180^\circ=-f_kd$.

**Visual prediction:** The rectangular area is force times displacement: $W(2\,\mathrm m)=15(2)=30$ J and $W(4\,\mathrm m)=15(4)=60$ J. Doubling distance doubles the work of this constant force.''',
6: r'''**Entry and exit example:** In Review A, choosing right positive gives $F_{\rm net}=10-2=8$ N. Divide by 2 kg to obtain $a=4$ m/s²; then $d=at^2/2=18$ m. The second route gives $W_{\rm net}=8(18)=144$ J, equal to $\Delta K=\tfrac12(2)(12^2)=144$ J. A valid explanation names Newton's second law and the work–energy theorem and identifies the first personally uncertain step. The choice of weak skill is a self-assessment, not a new numerical problem.''',
7: r'''**Preparation check:** The rehearsal's two routes both give $v_f=4.0$ m/s to the right. A useful error-log entry would be: “I forgot to square 2 m/s in the initial kinetic energy; $K_i=\tfrac12(4)(2^2)=8$ J.” Exam time, room and permitted materials are administrative details supplied by the instructor, not quantities to infer from this notebook.''',
8: r'''**Entry:** Net work equals the change in kinetic energy: $W_{\rm net}=K_f-K_i$. An equation relates physical quantities generally; substitution inserts the particular givens with units.

**Exit:** Choose the ramp bottom as zero height. Then $U_f=0$, and $K_i+mgh-f_ks=K_f$. Gravity is already represented by $mgh$, so adding another $+mgh$ as gravitational work would count the same transfer twice. The full numerical ramp solution appears above.

**Visual prediction:** For a vertical launch from zero height with no drag, initially $K_i=\tfrac12mv_0^2$ and $U_i=0$. At the peak $K=0$ and $U=\tfrac12mv_0^2$. On returning to launch height, $U=0$ and kinetic energy returns to its initial value. Their sum remains constant.''',
9: r'''**Entry:** Use one axis for both carts. Label the states before and after, then compute $p=mv$ with the velocity sign; compute $K=mv^2/2$ without attaching a direction sign to energy.

**Exit:** Momentum is conserved when external impulse on the chosen system is negligible. In the worked sticking example, $p_i=2(3)+1(0)=6$ kg m/s and $p_f=3(2)=6$ kg m/s, but kinetic energy decreases from 9 J to 6 J.

**Visual prediction:** For a moving 2 kg cart at 3 m/s and a stationary 1 kg cart, an elastic collision gives $v_{1f}=(2-1)3/(2+1)=1$ m/s and $v_{2f}=2(2)3/(2+1)=4$ m/s, both rightward. Energy is $\tfrac12(2)(1)^2+\tfrac12(1)(4)^2=9$ J. Sticking gives their common 2 m/s speed and only 6 J. For other controls, predict signs from the signed momentum equations before observing.''',
10: r'''**Entry:** At constant angular acceleration, $\omega=\omega_0+\alpha t$ and $\Delta\theta=\omega_0t+\alpha t^2/2$ have the same algebraic form as the linear motion equations.

**Exit:** Multiply RPM by $2\pi/60$ to obtain rad/s; the 120 RPM example gives $4\pi$ rad/s. In $I=\sum mr^2$, moving every mass to twice its axis distance multiplies every contribution by four, so it multiplies $I$ by four.

**Visual prediction:** At equal $M,R$, a ring has $MR^2$ and a disk has $MR^2/2$: the ring's inertia is twice the disk's. A rod has $ML^2/12$ about its centre or $ML^2/3$ about its end. Its length and chosen axis are needed before comparing it to the ring.''',
11: r'''**Entry:** The disk example uses its central axis: $I=MR^2/2=0.0400$ kg m². Its tangential force supplies $\tau=Fr=0.600$ N m, so $\alpha=\tau/I=15.0$ rad/s² and $\omega=0+\alpha(2.0)=30.0$ rad/s.

**Exit:** A rolling body carries translational energy $Mv^2/2$ and rotational energy $I\omega^2/2$. With no slip, $v=R\omega$, so a fall from rest through height $h$ gives $Mgh=\tfrac12Mv^2[1+I/(MR^2)]$. Divide by the bracket and take the positive square root for speed.

**Visual prediction:** Smaller $I/(MR^2)$ gives greater speed and acceleration for the same height and ramp. In the animation, a solid sphere (2/5) beats a solid cylinder (1/2), which beats a ring (1). No slip requires the contact point to be instantaneously at rest relative to the fixed ramp.

**Review priority:** Use the 150–170 minute block to revisit torque signs, the no-slip condition and the two kinetic-energy terms. Show the optional rolling animation only when the paper calculation is understood.''',
12: r'''**Entry:** Static equilibrium needs both $\sum\vec F=0$ and $\sum\tau=0$. Pick a pivot, measure perpendicular lever arms and assign torque signs consistently.

**Exit:** In a beam supported at A and B, choosing A as pivot removes A's unknown reaction from the torque equation. Solve for B, then use $R_A+R_B=W_{\rm total}$ to find A. Substitute both values back into force and torque sums; the worked beam example supplies all numerical steps.

**Visual prediction:** Increasing one positive mass shifts $x_{\rm cm}=\sum m_ix_i/\sum m_i$ toward that mass's position. A seesaw with 20 kg at 2 m to the left needs 40 kg at 1 m to the right: $20g(2)=40g(1)$, so the torques cancel. The pivot support supplies the total upward force $(20+40)g=588.6$ N for a light beam.''',
13: r'''**Entry:** A restoring force points toward equilibrium: for a spring, $F=-kx$. In energy bookkeeping, choose one zero of potential energy for all compared states. A full cycle returns to the same position and direction; its duration is the period.

**Exit:** Period is seconds per cycle, frequency is cycles per second: $f=1/T$. At a spring oscillator endpoint $x=\pm A$, speed and kinetic energy are zero; $|F|=kA$ and $|a|=kA/m=\omega^2A$ are greatest and directed toward equilibrium. Potential energy is $kA^2/2$ there.

**Visual prediction:** At equilibrium, acceleration is zero and speed is greatest; at endpoints the reverse is true. The full pendulum model approaches the small-angle result at small amplitude. At larger amplitude its period is longer, so the curves gradually shift in phase. The graph's displayed $T$ is the small-angle estimate; measure successive peaks on the full-model curve to see its longer period. No numerical solver is needed to explain these observations.'''
}

SETUP_IDS = {1:"cell-3",2:"cell-3",3:"cell-3",4:"cell-3",6:"cell-3",7:"cell-4",8:"week_08-007",9:"week_09-008",11:"week_11-007"}


def md(text, cell_id, **metadata):
    return nbformat.v4.new_markdown_cell(text.strip(),id=cell_id,metadata=metadata)


def read_modules():
    return {m:nbformat.read(ROOT/"notebooks"/f"Week_{m:02}.ipynb",as_version=4) for m in range(1,15)}


def copy_source(spec, modules, serial):
    module=spec['module'];matches=[c for c in modules[module].cells if c.id==spec['cell_id']]
    if len(matches)!=1:
        raise ValueError(f"Module {module:02}: expected unique cell ID {spec['cell_id']!r}")
    cell=copy.deepcopy(matches[0]);original=cell.source
    if spec.get('start'):
        if spec['start'] not in cell.source:raise ValueError(f"Missing subsection start: {spec}")
        cell.source=cell.source[cell.source.index(spec['start']):]
    if spec.get('before'):
        if spec['before'] not in cell.source:raise ValueError(f"Missing subsection end: {spec}")
        cell.source=cell.source[:cell.source.index(spec['before'])]
    if spec.get('adapt')=='constant_work_only':
        old="force_type=IntSlider(min=1, max=3, step=1, value=1, description='Force type')"
        if old not in cell.source:raise ValueError('Constant-work demo selector changed upstream')
        cell.source=cell.source.replace(old,"force_type=widgets.fixed(2)")
    if cell.cell_type=='markdown':
        cell.source=re.sub(r'\bWeek\s*(\d{1,2})\b',lambda m:f'Module {int(m.group(1)):02}',cell.source)
        cell.source=re.sub(r'\*\*Optional:\*\* The following code checks or visualizes the calculation; reading or editing it is not required\.','',cell.source)
        cell.source=cell.source.strip()
    else:
        cell.outputs=[];cell.execution_count=None
        cell.metadata.setdefault('jupyter',{})['source_hidden']=True
        cell.metadata['collapsed']=True
    cell.id=f"m{module:02}-{spec['cell_id']}-{serial}"[:64]
    cell.metadata['phy101_source']={"module":module,"notebook":f"../notebooks/Week_{module:02}.ipynb","cell_id":spec['cell_id'],"source_sha256":hashlib.sha256(original.encode()).hexdigest(),**{k:v for k,v in spec.items() if k in ['start','before','adapt']}}
    return cell


def problem(module, number, modules, serial):
    pattern=re.compile(r'^### L[123].*?\bP'+str(number)+r'\b',re.M)
    matches=[c for c in modules[module].cells if c.cell_type=='markdown' and pattern.search(c.source)]
    if len(matches)!=1:raise ValueError(f"Module {module:02} P{number}: expected one source problem")
    spec=source(module,matches[0].id)
    cell=copy_source(spec,modules,serial)
    cell.source=re.sub(r'\bP'+str(number)+r'\b',f'Module {module:02} P{number}',cell.source,count=1)
    cell.source+=f'\n\n**Think · Pair · Explain:** Try this concrete problem alone first. Compare your diagram and symbolic equation with a partner; explain the sign, unit, or assumption that determines the answer before opening the worked key. **TR:** Önce kendi çözümünü dene; sonra eşinle denklem seçimini ve en kritik işlem adımını karşılaştır.\n\n**Stable solution reference:** Module {module:02} P{number}, in `Week_{module:02}_Python_Solutions.ipynb`. The calendar week number does not change the problem ID. Use the released solution link on the course dashboard.\n\n**Your working / Çözümün:** givens with units → diagram → principle → algebra → result → physical check.'
    cell.metadata['phy101_problem']={"module":module,"problem":number}
    return cell


def readable_date(value):
    return date.fromisoformat(value).strftime('%d %B %Y').lstrip('0')


def build_lesson(row, modules, calendar):
    week=row['week'];lesson=LESSONS[week];cells=[]
    def add(text,key):cells.append(md(text,f'calendar-w{week:02}-{key}'))
    session=readable_date(row['session_date']) if row['session_date'] else 'Exact exam date follows the instructor announcement / Kesin sınav günü ders duyurusunda'
    add(f"# Calendar Week {week:02} — {row['title_en']}\n\n## {row['title_tr']}\n\n**Date range:** {readable_date(row['start'])} – {readable_date(row['end'])}  \n**Class / exam:** {session}\n\n**This week's scope:** {row['scope']}.\n\nThese are the actual notes selected for this dated lesson. Read the physics and do the algebra on paper; the optional demonstrations are grouped at the end. Existing numbered source notebooks are a **topic library**, so a label such as **Module 06 P2** stays the same even when taught in Calendar Week 05. **TR:** Takvim haftası ile kaynak modül numarası farklıdır; bu dosyadaki sıra o haftanın gerçek ders sırasıdır.","title")
    colab_base = 'https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/phy101/'
    add(f'[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colab_base}{row["notebook"]})\n\n[Open this lesson in Colab / Bu dersi Colab’da aç]({colab_base}{row["notebook"]}) · [Course page / Ders sayfası](https://arifsolmaz.github.io/courses/fall/phy101/web/PHY101_Course_Dashboard.html)\n\nRead the explanations first. For interactive figures, open Colab and run Setup, then the demonstration. **Türkçe:** Etkileşimli grafikler için önce hazırlık hücrelerini, ardından ilgili gösterimi çalıştır.','colab')
    navigation=['[1. Read and work through the examples](#lesson-concepts)']
    if lesson['practice']:navigation.append('[2. Practise on paper](#lesson-practice)')
    navigation.append('[3. Check your understanding](#lesson-exit)')
    if lesson['demos']:navigation.append('[4. Optional visual checks](#lesson-demos)')
    add('## Find your place / Nereden devam etmeli?\n\n**Notes edition: 11 September 2026 — typeset equations and worked explanations.**\n\n'+' · '.join(navigation)+'\n\nEnglish carries the main explanation; Turkish notes unpack the difficult step. Keep the model answers closed until you have tried the example or question.','navigation')
    if row['kind']!='midterm':
        focus=lesson['focus']
        add(f"## A three-hour route with review space / Üç saatlik ders akışı\n\n| Minutes | Activity |\n|---|---|\n| 0–10 | Retrieval: {lesson['recap']} |\n| 10–50 | {focus[0]} |\n| 50–60 | Break / Ara |\n| 60–100 | {focus[1]} |\n| 100–110 | Break / Ara |\n| 110–150 | Guided paper practice: core problems below |\n| 150–170 | Review difficult steps, one optional visual check, and questions |\n| 170–180 | Explain the result and exit check |\n\nThe core route is enough for the lesson. Extra problems and visual demonstrations are optional; use the review space to slow down when a sign or algebra step is unclear.","route")
    add('<a id="lesson-concepts"></a>\n\n## Read and work through the examples / Konu ve çözümlü örnekler','concepts')
    for index,spec in enumerate(lesson['sections']):
        if spec['type']=='source':cells.append(copy_source(spec,modules,f's{index}'))
        else:add(CONTENT[spec['key']],spec['key'])
    if lesson['practice']:
        add('<a id="lesson-practice"></a>\n\n## Core paper practice / Temel alıştırmalar\n\nTry the diagram and symbolic equation before opening an answer. These are selected problems from the full module sets, not renamed problems. Each has a stable Module XX Pn reference for the complete solution.', 'practice')
        for index,(module,number) in enumerate(lesson['practice']):cells.append(problem(module,number,modules,f'p{index}'))
    add('<a id="lesson-exit"></a>\n\n## Exit check / Çıkış kontrolü\n\n'+lesson['exit']+'\n\nWrite one sentence naming the physical principle and one line of algebra you can now explain. **TR:** Sonuca nasıl ulaştığını bir cümleyle anlat; emin olmadığın ilk adımı işaretle.','exit')
    add('## Check your explanations / Açıklamalarını kontrol et\n\n<details>\n<summary>Worked model responses — open after trying</summary>\n\n'+CHECKS[week]+'\n\n**TR:** Bu yanıtları kopyalamadan önce kendi işlemini dene; sonra birim, işaret ve kullanılan ilkeyi karşılaştır.\n\n</details>','model-checks')
    if lesson['optional_practice']:
        add('## Optional additional practice / İsteğe bağlı ek çalışma\n\nUse these only after the core practice is understood; they do not add a new scheduled topic.','optional-practice')
        for index,(module,number) in enumerate(lesson['optional_practice']):cells.append(problem(module,number,modules,f'opt{index}'))
    if lesson.get('extension'):add('## Optional supporting reading / İsteğe bağlı destek\n\n'+lesson['extension'],'extension')
    if lesson.get('support_sections'):
        add('## Optional preview: dot product and projection / İzdüşüme hazırlık\n\nReturn to these tools when studying work. Finish components and addition first; this preview does not add another required topic to today’s calendar.','support')
        for index,spec in enumerate(lesson['support_sections']):cells.append(copy_source(spec,modules,f'support{index}'))
    if lesson['demos']:
        add('<a id="lesson-demos"></a>\n\n## Optional visual demonstration / İsteğe bağlı görselleştirme\n\n'+lesson['demo_prompt']+'\n\nRun the setup cells once, then the selected demo. Controls stay beside a scrolling result pane. Predict first, change one input, and explain the observation; coding is not a learning requirement. **TR:** Kod ayrıntılarını öğrenmek zorunda değilsin. Önce tahmin et, sonra tek değişkeni değiştir ve sonucu açıkla.','demos')
        demo_modules=list(dict.fromkeys(s['module'] for s in lesson['demos']))
        for module in demo_modules:cells.append(copy_source(source(module,SETUP_IDS[module]),modules,f'setup{module}'))
        cells.append(copy_source(source(demo_modules[0],'phy101-widget-layout'),modules,'interface'))
        for index,spec in enumerate(lesson['demos']):
            origin=modules[spec['module']].cells
            position=next(i for i,c in enumerate(origin) if c.id==spec['cell_id'])
            preceding=next((c.source for c in reversed(origin[:position]) if c.cell_type=='markdown'), '')
            title=next((line.lstrip('# ').strip() for line in preceding.splitlines() if line.startswith('#')),f'Visual check {index+1}')
            add(f'### Visual check {index+1}: {title}\n\nUse the controls below. Predict → adjust one value → explain the result. / Tahmin et → tek değeri değiştir → sonucu açıkla.',f'demo-title-{index}')
            cells.append(copy_source(spec,modules,f'demo{index}'))
    used=sorted({c.metadata['phy101_source']['module'] for c in cells if 'phy101_source' in c.metadata})
    links='; '.join(f'[Module {m:02} — Open in Colab]({colab_base}notebooks/Week_{m:02}.ipynb)' for m in used)
    dates='; '.join(f'Module {m:02}: {calendar["release_dates"][str(m)]}' for m in used)
    add('## Sources and solution references / Kaynaklar\n\n'+(links if links else f'[Review lesson — Open in Colab]({colab_base}calendar/Week_06.ipynb)')+'\n\n'+('Solution release dates from the course calendar: '+dates+'.\n\n' if dates else '')+'The module library keeps all original problem IDs and full topic coverage. Complete solutions stay in the separate solutions collection and follow the dashboard release dates. The selected notes above are the teaching sequence for this calendar week.','sources')
    nb=nbformat.v4.new_notebook(cells=cells,metadata={'kernelspec':{'display_name':'Python 3','language':'python','name':'python3'},'language_info':{'name':'python'},'phy101_calendar':{'week':week,'kind':row['kind'],'start':row['start'],'end':row['end'],'session_date':row['session_date'],'title_en':row['title_en'],'title_tr':row['title_tr'],'modules':row['modules'],'support_modules':row['support_modules'],'source_modules_used':used,'generated_by':'tools/build_calendar_notebooks.py','calendar_source':'../calendar.json'}})
    nb.nbformat_minor=5
    nbformat.validate(nb)
    ids=[c.id for c in nb.cells]
    assert len(ids)==len(set(ids))
    if row['kind'] in ['review','midterm']:assert not any(c.cell_type=='code' for c in nb.cells)
    assert len(lesson['demos'])<=(3 if week==1 else 2)
    return nb


def execute_qa(notebooks):
    from nbclient import NotebookClient
    qa_root=Path(tempfile.mkdtemp(prefix='phy101-calendar-qa-'))
    reports=[]
    for week,notebook in notebooks:
        if not any(c.cell_type=='code' for c in notebook.cells):
            reports.append({'week':week,'status':'paper-only; no execution needed','code_cells':0});continue
        copy_nb=copy.deepcopy(notebook)
        # Observe errors that widgets can catch and hide inside Output.
        class CheckedClient(NotebookClient):
            def process_message(self,msg,cell,cell_index):
                if msg['msg_type']=='error':self.qa_errors.append(msg['content'])
                return super().process_message(msg,cell,cell_index)
        client=CheckedClient(copy_nb,timeout=180,kernel_name='python3',store_widget_state=True,
                             resources={'metadata':{'path':str(ROOT)}})
        client.qa_errors=[]
        executed=client.execute()
        state=executed.metadata.get('widgets',{}).get('application/vnd.jupyter.widget-state+json',{}).get('state',{})
        widget_errors=[o for v in state.values() for o in v.get('state',{}).get('outputs',[]) if o.get('output_type')=='error']
        assert not client.qa_errors and not widget_errors, (week,client.qa_errors,widget_errors)
        nbformat.write(executed,qa_root/f'Week_{week:02}_executed.ipynb')
        reports.append({'week':week,'status':'passed fresh kernel','code_cells':sum(c.cell_type=='code' for c in notebook.cells),'widget_errors':0})
        print(f'Execution PASS: Calendar Week {week:02}',flush=True)
    (qa_root/'report.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(f'QA report: {qa_root / "report.json"}',flush=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true',help='Check generated notebook JSON against source/calendar without rewriting.')
    parser.add_argument('--execute',action='store_true',help='Execute QA copies in fresh kernels; keep lesson outputs empty.')
    parser.add_argument('--weeks',help='Comma-separated calendar weeks; default all 13.')
    args=parser.parse_args()
    calendar=json.loads((ROOT/'calendar.json').read_text(encoding='utf-8'))
    rows=calendar['weeks'];assert [r['week'] for r in rows]==list(range(1,14))
    requested={int(v) for v in args.weeks.split(',')} if args.weeks else set(range(1,14))
    assert requested<=set(range(1,14))
    modules=read_modules();built=[]
    for row in rows:
        week=row['week']
        if week not in requested:continue
        notebook=build_lesson(row,modules,calendar);path=ROOT/row['notebook']
        assert path.parent==ROOT/'calendar'
        if args.check:
            if not path.exists() or nbformat.read(path,as_version=4)!=notebook:raise SystemExit(f'Stale/missing generated lesson: {path}')
        else:
            path.parent.mkdir(exist_ok=True)
            path.write_text(nbformat.writes(notebook)+'\n',encoding='utf-8',newline='\n')
        built.append((week,notebook))
        print(f'Calendar Week {week:02}: {len(notebook.cells)} cells, {len(LESSONS[week]["practice"])} core problems, {len(LESSONS[week]["demos"])} optional demos')
    if args.execute:execute_qa(built)


if __name__=='__main__':
    main()
