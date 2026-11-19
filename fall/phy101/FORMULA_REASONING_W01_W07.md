# PHY101 Formula Reasoning Draft, Weeks 01-07

Purpose: this is not a proof sheet. It is a teaching map for non-physics-major students:
where the common equations come from, why each one is useful, what it can find, and what
breaks when the assumptions change.

Use this later as insertable blocks in the weekly notes. Each block should be short on the
student page, but this draft keeps the full instructor logic visible.

## How To Use This Draft

For each formula block, teach the same questions:

1. Where did this equation come from?
2. What problem does it solve?
3. Which quantity is missing or inconvenient?
4. What can I find with it?
5. What assumptions must be true?
6. What changes if the assumptions are not true?

The classroom phrase:

> A formula is a compressed story. Before using it, unpack the story: what was kept, what
> was ignored, and which variable it was designed to find.

---

## Week 01: Units, Dimensions, Vectors

### W01-1. Unit Conversion As Multiplying By One

Core idea:

```tex
1\ \mathrm{min}=60\ \mathrm{s}
\qquad\Rightarrow\qquad
\frac{60\ \mathrm{s}}{1\ \mathrm{min}}=1
```

Where it comes from:

The same physical time interval can be described in two different units. The ratio of two
equal quantities is 1, so multiplying by that ratio changes the unit description but not the
physical quantity.

Why we need it:

Add or equate quantities only when their dimensions agree. For numerical substitution,
convert to a consistent set of units, or carry units explicitly so they cancel. Unit
conversion is not a separate topic from physics; it is the first check that the equation can
even mean something.

What it can find:

- Convert speed, area, volume, density, force, energy units.
- Catch missing squared or cubed conversion factors.
- Catch impossible equations whose terms have different dimensions.

Simple core example:

```tex
72\ \mathrm{km/h}
=\left(72\ \frac{\mathrm{km}}{\mathrm h}\right)
\times\left(\frac{1000\ \mathrm m}{1\ \mathrm{km}}\right)
\times\left(\frac{1\ \mathrm h}{3600\ \mathrm s}\right)
=20\ \mathrm{m/s}
```

Edge cases and traps:

- For area, square the length conversion: `cm^2 -> m^2` uses `(10^{-2})^2`.
- For volume, cube the length conversion: `in.^3 -> cm^3` uses `(2.54)^3`.
- Defined conversions, like `1 in = 2.54 cm`, are exact; they do not limit significant figures.
- Do not mix unit systems inside one equation unless every term has been converted.

---

### W01-2. Dimensional Consistency

Core idea:

```tex
[v]=L/T,\qquad [a]=L/T^2,\qquad [F]=ML/T^2
```

Where it comes from:

Every physical quantity has a type: length, mass, time, or a combination of them. Terms
added or equated must have compatible dimensions and physical meanings. Matching dimensions
alone does not prove that an equation is correct.

Why we need it:

It catches formulas that cannot be true before doing any numbers.

Simple core example:

Check:

```tex
x=x_0+v_0t+\frac12at^2
```

Each term has length dimension:

```tex
[x]=L,\quad [x_0]=L,\quad [v_0t]=(L/T)T=L,\quad [at^2]=(L/T^2)T^2=L
```

Edge cases and traps:

- Dimensional analysis cannot catch missing dimensionless factors, like `2` or `1/2`.
- It cannot decide the sign.
- It cannot tell whether the model applies, only whether the units are possible.

---

### W01-3. Vector Components Come From A Right Triangle

Core equations:

```tex
A_x=A\cos\theta,\qquad A_y=A\sin\theta
```

```tex
A=\sqrt{A_x^2+A_y^2},\qquad \tan\theta=\frac{A_y}{A_x}
```

Where they come from:

A vector arrow and its x-y components form a right triangle. The vector magnitude is the
hypotenuse. The component magnitudes are side lengths; the signed components also include
the direction set by the coordinate axes.

Why we need them:

Real motion and real forces rarely point exactly along the axes. Components let us turn one
angled vector problem into two one-dimensional problems.

What they can find:

- Horizontal and vertical velocity components.
- Force components along and perpendicular to a surface.
- Resultant displacement or velocity from components.
- Direction angle from component signs.

Simple core example:

A projectile leaves at `v_0=20 m/s`, `theta=37 deg`.

```tex
v_{0x}=v_0\cos\theta=(20)\cos37^\circ=16.0\ \mathrm{m/s}
```

```tex
v_{0y}=v_0\sin\theta=(20)\sin37^\circ=12.0\ \mathrm{m/s}
```

Edge cases and traps:

- For `A_x=A\cos\theta`, `A_y=A\sin\theta`, measure `\theta` from `+x` toward `+y`.
  Use the signs implied by the actual direction.
- If the vector is measured from vertical, sine and cosine may swap.
- Calculator `arctan(A_y/A_x)` does not know the quadrant. Sketch signs first, or use
  `atan2(A_y,A_x)`.
- If `A_x=0`, the tangent formula is not usable. A vertical vector has angle `90 deg` or
  `270 deg`; the zero vector has no defined direction.
- Components can be negative. Magnitude is nonnegative.

---

### W01-4. Vector Addition Becomes Component Addition

Core equations:

```tex
R_x=A_x+B_x,\qquad R_y=A_y+B_y,\qquad R_z=A_z+B_z
```

Where they come from:

Adding arrows head-to-tail means all horizontal changes accumulate into the total horizontal
change, and all vertical changes accumulate into the total vertical change.

Why we need them:

Graphical vector addition is good for meaning, but components give reliable numbers.

What they can find:

- Resultant displacement.
- Relative velocity result, such as wind plus aircraft velocity.
- Net force components before using Newton's second law.

Simple core example:

Walk `3 m` east and `4 m` north.

```tex
R_x=3\ \mathrm m,\qquad R_y=4\ \mathrm m,\qquad
R=\sqrt{(3\ \mathrm m)^2+(4\ \mathrm m)^2}=5\ \mathrm m
```

Edge cases and traps:

- Add components, not magnitudes.
- Directions matter through signs.
- If vectors are not in the same coordinate system, choose one system first.

---

### W01-5. Dot Product Is A Projection

Core equations:

```tex
\vec A\cdot\vec B=AB\cos\phi
```

```tex
\vec A\cdot\vec B=A_xB_x+A_yB_y+A_zB_z
```

Where they come from:

The dot product equals the signed projection of one vector along the other, multiplied by
the other vector's magnitude. The factor `\cos\phi` keeps the parallel part.

Why we need it:

Work in Week 05 uses the force component along displacement for a constant force over a
finite displacement:

```tex
W=\vec F\cdot\vec d
```

So the dot product is the vector tool behind work.

What it can find:

- Work by an angled force.
- Angle between two vectors.
- Whether two vectors are perpendicular.

Simple core example:

A `20 N` force pulls `3.0 m` at `60 deg` above the displacement.

```tex
W=Fd\cos\theta=(20)(3.0)\cos60^\circ=30\ \mathrm J
```

Edge cases and traps:

- `theta=0`: maximum positive contribution for fixed magnitudes.
- `theta=90 deg`: zero contribution, even if the force is large.
- `theta=180 deg`: negative contribution.
- Dot product is a scalar, not a vector.
- A zero dot product means perpendicular only when both vectors are nonzero.

---

### W01-6. Cross Product Measures Perpendicular Area

Core equations:

```tex
C=|\vec C|=AB\sin\phi
```

```tex
\vec C=\vec A\times\vec B
```

```tex
C_x=A_yB_z-A_zB_y,\quad
C_y=A_zB_x-A_xB_z,\quad
C_z=A_xB_y-A_yB_x
```

Where it comes from:

The cross product keeps the part of one vector perpendicular to the other and gives a vector
perpendicular to the plane of the two inputs.

Why we need it:

It prepares students for rotational ideas later: torque and angular momentum are cross
products. In Weeks 01-07 it is mostly a vector literacy tool.

Simple core example:

Two perpendicular vectors with magnitudes `6` and `4`:

```tex
C=AB\sin90^\circ=24
```

Edge cases and traps:

- For nonparallel nonzero vectors, the direction is given by the right-hand rule.
- Parallel vectors give the zero vector, which has no direction.
- Order matters: `\vec A\times\vec B=-(\vec B\times\vec A)`.
- If the input vectors have units, the cross product has the product of those units.

---

## Week 02: One-Dimensional Motion

### W02-1. Velocity Comes From Position Change

Core equations:

```tex
v_{{\rm av},x}=\frac{\Delta x}{\Delta t}
```

```tex
v_x=\frac{dx}{dt}
```

Where they come from:

Motion asks how position changes with time. Average velocity uses a finite interval.
Instantaneous velocity is the slope at one instant.

Why we need them:

They connect graphs to motion: slope of `x(t)` is the signed x-velocity.

What they can find:

- Average velocity over an interval.
- Instantaneous velocity from a tangent slope.
- Sign of motion.

Simple core example:

Position changes from `1 m` to `7 m` in `3 s`.

```tex
v_{{\rm av},x}=\frac{7\ \mathrm m-1\ \mathrm m}{3\ \mathrm s}=2\ \mathrm{m/s}
```

Edge cases and traps:

- Average velocity is displacement over time, not total distance over time.
- Average speed is total path length over time.
- Negative velocity means direction, not "less speed."

---

### W02-2. Acceleration Comes From Velocity Change

Core equations:

```tex
a_{{\rm av},x}=\frac{\Delta v_x}{\Delta t}
```

```tex
a_x=\frac{dv_x}{dt}
```

Where they come from:

Acceleration measures how velocity changes with time.

Why we need it:

It tells whether velocity is changing and in which direction. It is the bridge to forces in
Week 03.

Simple core example:

A cart changes from `2 m/s` to `8 m/s` in `3 s`. This establishes average
acceleration; it is also the instantaneous acceleration only if acceleration is constant.

```tex
a_{{\rm av},x}=\frac{8-2}{3}=2\ \mathrm{m/s^2}
```

Edge cases and traps:

- Negative acceleration does not always mean slowing down. It means acceleration points in
  the negative direction.
- If velocity and acceleration have the same sign, speed increases.
- If velocity and acceleration have opposite signs, speed decreases.

---

### W02-3. First Constant-Acceleration Equation

Core equation:

```tex
v=v_0+at
```

Where it comes from:

Start with constant acceleration:

```tex
a=\frac{v-v_0}{t}
```

Then multiply by `t`:

```tex
at=v-v_0
```

Then add `v_0`:

```tex
v=v_0+at
```

Why we need it:

It updates velocity after a time interval when acceleration is constant.

Use it when:

- Given `v_0`, `a`, `t`.
- Asked for `v`.
- Or rearrange to find `t` or `a`.

Simple core example:

From rest, `a=3.0 m/s^2` for `5.0 s`.

```tex
v=0+(3.0)(5.0)=15\ \mathrm{m/s}
```

Edge cases and traps:

- Only for constant acceleration during that phase.
- Time starts at the beginning of the phase. Reset `t=0` for a new phase.
- If `a=0`, it reduces to constant velocity: `v=v_0`.

---

### W02-4. Displacement From Area Under Velocity

Core equations:

```tex
x(t)-x(t_0)=\int_{t_0}^{t} v_x(t')\,dt'
```

For constant acceleration:

```tex
\Delta x=\frac{v_{0x}+v_x}{2}t
```

Where they come from:

On a velocity-time graph, a thin strip has signed area `v_x dt`, which has units of
distance. Adding all strips gives signed displacement.

For constant acceleration, the `v_x(t)` graph is a straight line, so the area is a
trapezoid: average height times width. If velocity crosses zero, the negative region still
counts as negative displacement.

Why we need it:

It turns a velocity story into a position story.

Simple core example:

Velocity increases linearly from `2 m/s` to `8 m/s` in `3 s`.

```tex
\Delta x=\frac{2+8}{2}(3)=15\ \mathrm m
```

Edge cases and traps:

- Area below the time axis is negative displacement.
- Distance traveled is not always the same as signed area if velocity changes sign.
- If acceleration is not constant, the graph may not be a trapezoid.

---

### W02-5. Position Formula With Time

Core equation:

```tex
x=x_0+v_0t+\frac12at^2
```

Derivation from earlier equations:

Start with displacement as average velocity times time:

```tex
x-x_0=\frac{v_0+v}{2}t
```

Use:

```tex
v=v_0+at
```

Substitute:

```tex
x-x_0=\frac{v_0+(v_0+at)}{2}t
```

Simplify:

```tex
x-x_0=v_0t+\frac12at^2
```

Why we need it:

It finds position or displacement after a known time under constant acceleration.

Use it when:

- You know `x_0`, `v_0`, `a`, `t`.
- You need `x`.
- You do not need final velocity first.

Simple core example:

From rest with `a=3.0 m/s^2` for `5.0 s`:

```tex
\Delta x=0+\frac12(3.0)(5.0)^2=37.5\ \mathrm m
```

Edge cases and traps:

- Square the whole time.
- The endpoint average `(\,v_0+v\,)/2` works here because `v(t)` is linear under constant
  acceleration; it is not a general definition of average velocity.
- If `a=0`, it becomes `x=x_0+v_0t`.
- If the motion has separate phases, use a separate equation for each phase.

---

### W02-6. No-Time Kinematics Equation

Core equation:

```tex
v^2=v_0^2+2a(x-x_0)
```

Derivation from earlier equations:

Start with:

```tex
x-x_0=\frac{v_0+v}{2}t
```

From:

```tex
v=v_0+at
```

solve for time, for `a\ne0`:

```tex
t=\frac{v-v_0}{a}
```

Substitute:

```tex
x-x_0=\frac{v_0+v}{2}\frac{v-v_0}{a}
```

Use `(v_0+v)(v-v_0)=v^2-v_0^2`:

```tex
x-x_0=\frac{v^2-v_0^2}{2a}
```

Rearrange:

```tex
v^2=v_0^2+2a(x-x_0)
```

Why we need it:

It removes time. Use it when the problem relates signed displacement and velocity
components, but time is missing or unnecessary.

What it can find:

- Final speed after a displacement.
- Required acceleration over a distance.
- Stopping distance.
- Maximum height in vertical motion.

Simple core example:

A car brakes from `20 m/s` to rest with acceleration magnitude `4.0 m/s^2`.

```tex
0=(20)^2+2(-4)d
\quad\Rightarrow\quad
d=50\ \mathrm m
```

Edge cases and traps:

- Use signed acceleration and signed displacement.
- The square loses direction. After finding `v^2`, choose the sign of `v` from the diagram.
- Only valid for constant acceleration.
- If `a=0`, do not divide by `a` in the derivation. The final relation reduces to
  `v^2=v_0^2`; use `\Delta x=v_0t` when time or displacement is needed.

---

### W02-7. Free Fall Is Kinematics With `a=-g`

Core equations, upward positive:

```tex
y=y_0+v_{0y}t-\frac12gt^2
```

```tex
v_y=v_{0y}-gt
```

```tex
v_y^2=v_{0y}^2-2g(y-y_0)
```

Where they come from:

They are the Week 02 constant-acceleration equations with:

```tex
a_y=-g
```

Why we need them:

They describe vertical motion near Earth's surface when `g` is approximately constant and
air resistance is neglected. In this document use `g=9.81\ \mathrm{m/s^2}` unless a problem
states otherwise.

Simple core example:

Thrown upward at `20 m/s`. At the top, `v_y=0`.

```tex
0=(20)^2-2gH
\quad\Rightarrow\quad
H=\frac{20^2}{2g}=20.4\ \mathrm m
```

Edge cases and traps:

- For a purely vertical throw, velocity is zero at the highest point but acceleration is
  still `-g`. For an oblique projectile, only the vertical component is zero at the top.
- `g` is positive magnitude; the sign comes from the axis.
- Air resistance changes the model.

---

## Week 03: Projectile Motion And Newton's Laws

### W03-1. Projectile Motion Is Two 1D Motions With One Clock

Core equations:

```tex
x=x_0+v_{0x}t,\qquad v_x=v_{0x}
```

```tex
y=y_0+v_{0y}t-\frac12gt^2,\qquad v_y=v_{0y}-gt
```

Where they come from:

The vector kinematics equation can describe both directions together, but calculations are
usually simpler after resolving it into x and y components. Gravity acts vertically, so in
the no-drag, constant-`g` model:

```tex
a_x=0,\qquad a_y=-g
```

Why we need it:

Components let us keep the horizontal and vertical stories separate while using the same
elapsed time `t`.

What it can find:

- Time of flight.
- Range.
- Maximum height.
- Velocity components at any time.
- Speed at impact.

Simple core example:

Horizontal launch from height `h=1.25 m` with `v_{0x}=3.0 m/s`, choosing the launch point
as `x_0=0`.

Vertical time:

```tex
0=h-\frac12gt^2
\quad\Rightarrow\quad
t=\sqrt{\frac{2h}{g}}=0.5048\ \mathrm s
```

Horizontal range:

```tex
\Delta x=v_{0x}t=(3.0)(0.5048)=1.51\ \mathrm m
```

Edge cases and traps:

- Do not calculate separate horizontal and vertical times.
- The displayed same-height range shortcut only works for equal launch and landing heights.
  The component method above works for unequal heights.
- If the object lands on a cliff, platform, or ramp, solve the actual vertical equation.
- Ordinary speed-dependent drag couples the component equations and invalidates these
  vacuum formulas. Some idealized drag models, such as linear drag with fixed coefficients,
  remain componentwise separable.

---

### W03-2. Same-Height Range Formula

Core equation:

```tex
R=\frac{v_0^2\sin(2\theta)}{g}
```

Where it comes from:

Start with same-height flight time:

```tex
T=\frac{2v_{0y}}{g}=\frac{2v_0\sin\theta}{g}
```

This comes from solving:

```tex
0=v_{0y}T-\frac12gT^2
```

and discarding the launch-time root `T=0`. For the usual above-ground flight case, the
vertical launch component is positive and the launch angle is between `0 deg` and `90 deg`.

Horizontal range is:

```tex
R=v_{0x}T
```

Substitute the horizontal component:

```tex
v_{0x}=v_0\cos\theta
```

Then:

```tex
R=(v_0\cos\theta)\frac{2v_0\sin\theta}{g}
```

Use:

```tex
2\sin\theta\cos\theta=\sin(2\theta)
```

So:

```tex
R=\frac{v_0^2\sin(2\theta)}{g}
```

Why we need it:

It quickly predicts range when launch and landing heights are the same and drag is ignored.

Simple core example:

Same speed at `30 deg` and `60 deg`:

```tex
\sin(60^\circ)=\sin(120^\circ)
```

So ranges are equal, but the `60 deg` shot stays in the air longer and goes higher.

Edge cases and traps:

- Not valid for different launch and landing heights.
- Not valid with drag.
- `45 deg` maximum is only for equal heights, no drag, fixed initial speed.
- Equal range does not mean equal time or equal height.

---

### W03-3. Newton's Second Law Is The Bridge From Forces To Motion

Core equation:

```tex
\sum\vec F=m\vec a
```

Component form:

```tex
\sum F_x=ma_x,\qquad \sum F_y=ma_y
```

Where it comes from:

Newton's second law states that the external force sum on one chosen object determines its
acceleration in an inertial frame for a constant-mass particle. The full law is a vector
sum; each component equation uses signed components.

Why we need it:

Kinematics describes motion. Newton's law explains motion: why the acceleration has that
value.

What it can find:

- Acceleration from forces.
- Unknown force from acceleration.
- Normal force or tension from a component equation.

Simple core example:

Forces: `10 N` right, `6 N` left, mass `2 kg`.

```tex
\sum F_x=10-6=4\ \mathrm N
```

```tex
a_x=\frac{\sum F_x}{m}=\frac{4}{2}=2\ \mathrm{m/s^2}
```

Edge cases and traps:

- Draw only forces on the chosen object.
- Net force is not an extra force arrow.
- If acceleration is zero, velocity may still be nonzero and constant.
- Third-law forces act on different objects, so they do not cancel in one free-body diagram.

---

### W03-4. Normal Force Is Whatever The Constraint Requires

Common but limited equation:

```tex
N=mg
```

More general origin:

Use Newton's second law perpendicular to the surface.

Example on a horizontal floor with no vertical acceleration:

```tex
\sum F_y=0
```

If only `N` upward and `mg` downward:

```tex
N-mg=0
\quad\Rightarrow\quad
N=mg
```

But with an upward angled pull, where `\theta` is the pull angle above a horizontal surface,
contact is maintained, and vertical acceleration is zero:

```tex
N+F\sin\theta-mg=0
\quad\Rightarrow\quad
N=mg-F\sin\theta
```

Why we need it:

Friction depends on `N`, so a wrong normal force gives wrong friction.

Simple core example:

A box is pushed downward by `5 N` in addition to its weight:

```tex
N-mg-5\ \mathrm N=0
\quad\Rightarrow\quad
N=mg+5\ \mathrm N
```

Edge cases and traps:

- `N=mg` requires zero vertical acceleration and no additional vertical forces on a
  horizontal surface; the object may still accelerate horizontally.
- On a simple fixed incline with no other perpendicular forces, often `N=mg\cos\theta`.
- In an elevator, `N=m(g+a_y)` if upward is positive, contact is maintained, and no other
  vertical forces act.
- `N=0` is the separation threshold. If a calculation gives `N<0`, the assumed contact
  solution is impossible.

---

### W03-5. Third Law Is Not Equilibrium

Core equation:

```tex
\vec F_{A\to B}=-\vec F_{B\to A}
```

Where it comes from:

Forces come from interactions. If A pushes B, B pushes A with equal magnitude and opposite
direction.

Why we need it:

It prevents the most common force-diagram error: canceling forces that act on different
objects or calling weight and normal a third-law pair.

Simple core example:

A book rests on a table.

- Earth pulls book downward: weight on book.
- Book pulls Earth upward: third-law partner of weight.
- Table pushes book upward: normal on book.
- Book pushes table downward: third-law partner of normal.

Edge cases and traps:

- Two equal and opposite forces on the same particle cancel each other, but translational
  equilibrium requires the sum of all forces to vanish. For an extended body, rotational
  equilibrium also requires zero net torque.
- Third-law partners are the same type of force and act on different objects.
- A truck and bicycle exert equal collision forces, but accelerations differ because masses
  differ.

---

## Week 04: Friction, Inclines, Connected Bodies, Circular Motion

### W04-1. Incline Components Come From Rotating The Axes

Core equations:

```tex
w_\parallel=mg\sin\theta,\qquad w_\perp=mg\cos\theta
```

If no friction:

```tex
a=g\sin\theta,\qquad N=mg\cos\theta
```

Where they come from:

Weight still points vertically downward. Choosing axes along and perpendicular to the slope
turns weight into two component magnitudes. Here the angle theta is the incline angle from
the horizontal. The sine factor gives the component along the plane; the cosine factor gives
the component into the plane.

Why we need it:

Incline problems are just Newton's second law with better axes.

Simple core example:

A frictionless block on a `30 deg` incline:

```tex
a=g\sin30^\circ=4.91\ \mathrm{m/s^2}
```

```tex
N=mg\cos30^\circ
```

Edge cases and traps:

- `theta=0`: flat table, `a=0`, `N=mg`.
- `theta=90 deg`: free fall, `a=g`, `N=0`.
- Do not swap sine and cosine. Check the limiting cases.

---

### W04-2. Friction Is A Contact Rule, Not A New Motion Equation

Core equations:

```tex
0\le |f_s|\le \mu_s N
```

```tex
|f_k|=\mu_k N
```

Where they come from:

Friction is an empirical contact model. Static friction adjusts to prevent slipping, up to a
limit. Kinetic friction is used after sliding begins.

Why we need it:

Newton's law needs actual forces. Friction tells us what contact force to put into Newton's
law.

How to use:

1. Determine whether the contacting surfaces slip relative to each other, or assume no slip
   and test it.
2. Under no slip, use Newton's second law and the contact constraint to find the required
   static friction. Use equilibrium only if acceleration is zero.
3. Check whether required friction is less than or equal to `\mu_sN`.
4. If sliding, use `f_k=\mu_kN` opposite relative sliding velocity.

Simple core example:

Box on horizontal floor, `N=20 N`, `\mu_s=0.40`. A `5 N` pull is applied.

```tex
f_{s,\max}=\mu_sN=(0.40)(20)=8\ \mathrm N
```

The required static friction is `5 N`, so it holds:

```tex
f_s=5\ \mathrm N
```

Edge cases and traps:

- Static friction is not automatically `\mu_sN`; that is only the maximum.
- Kinetic friction is not used before sliding starts.
- Friction opposes relative sliding or slipping tendency at the contact, not always the
  object's velocity.
- "At rest relative to the surface" is not the same as "at rest in the laboratory."

---

### W04-3. Sliding Down A Rough Incline

Core equation:

```tex
a=g(\sin\theta-\mu_k\cos\theta)
```

Derivation from earlier equations:

Down slope positive:

```tex
mg\sin\theta-f_k=ma
```

Use:

```tex
f_k=\mu_kN,\qquad N=mg\cos\theta
```

So:

```tex
mg\sin\theta-\mu_kmg\cos\theta=ma
```

Cancel `m`:

```tex
a=g(\sin\theta-\mu_k\cos\theta)
```

Why we need it:

It shows that for this model the sliding acceleration does not depend on mass.

Simple core example:

`theta=30 deg`, `\mu_k=0.20`:

```tex
a=g(\sin30^\circ-0.20\cos30^\circ)
=3.21\ \mathrm{m/s^2}\ {\rm downhill}
```

Edge cases and traps:

- This equation assumes it is already sliding.
- It also assumes a fixed straight incline and no other forces along or perpendicular to the
  plane.
- To decide whether it starts sliding, use static friction first.
- If the expression is negative while the block is sliding down, it slows down, not instantly
  moves up.
- If the block is sliding uphill, friction points downhill and the displayed sign pattern
  changes. At the instant the block stops, reassess static friction instead of continuing the
  kinetic-friction equation blindly through reversal.

---

### W04-4. Atwood Machine Comes From Adding Two Newton Equations

Core equations:

```tex
a=\frac{m_1-m_2}{m_1+m_2}g
```

```tex
T=\frac{2m_1m_2}{m_1+m_2}g
```

Derivation:

Let `m_1>m_2`. Choose positive downward for `m_1` and positive upward for `m_2`.

```tex
m_1g-T=m_1a
```

```tex
T-m_2g=m_2a
```

Add the equations:

```tex
(m_1-m_2)g=(m_1+m_2)a
```

So:

```tex
a=\frac{m_1-m_2}{m_1+m_2}g
```

Then substitute into one mass equation to find `T`:

```tex
T=m_1(g-a)=\frac{2m_1m_2}{m_1+m_2}g
```

Why we need it:

It teaches connected-body reasoning: one acceleration constraint, separate free-body
diagrams, then combine equations.

Simple core example:

`m_1=7 kg`, `m_2=3 kg`:

```tex
a=\frac{7-3}{7+3}g=0.4g=3.92\ \mathrm{m/s^2}
```

```tex
T=\frac{2(7)(3)}{7+3}g=41.2\ \mathrm N
```

Edge cases and traps:

- If `m_1=m_2`, acceleration is zero.
- Acceleration magnitude is less than `g` when both masses are positive.
- Tension is not equal to the heavier weight.
- The simple formula assumes a taut inextensible string, a fixed frictionless massless
  pulley, negligible axle friction, and no other forces besides weights and string tensions.

---

### W04-5. Circular Acceleration Comes From Direction Change

Core equations:

```tex
a_{\rm rad}=\frac{v^2}{r}
```

```tex
v=\frac{2\pi r}{T}
```

```tex
a_{\rm rad}=\frac{4\pi^2r}{T^2}
```

Where they come from:

Even at constant speed, velocity changes because its direction changes. For uniform circular
motion, the total acceleration points inward. In nonuniform circular motion there is also a
tangential acceleration `a_t=dv/dt`; the radial component remains `a_{\rm rad}=v^2/r`.

A compact geometric reason for `v^2/r`: for two nearby points on a circle, the small
velocity-direction triangle is similar to the small radius triangle:

```tex
\frac{\Delta v}{v}\approx\frac{\Delta s}{r}
```

Dividing by the time interval and taking the short-time limit gives:

```tex
a_{\rm rad}=\frac{\Delta v}{\Delta t}\approx
\frac{v}{r}\frac{\Delta s}{\Delta t}\to\frac{v^2}{r}
```

Why we need it:

Circular motion is not force-free motion. Something must provide inward acceleration.

Simple core example:

A car turns with speed `v` on radius `r`:

```tex
a_{\rm rad}=\frac{v^2}{r}
```

Doubling speed makes required inward acceleration four times larger.

Edge cases and traps:

- Constant speed does not mean zero acceleration.
- For uniform circular motion, acceleration is inward, not forward.
- The period formula uses constant speed. If speed varies, `2\pi r/T` is average speed over
  one revolution, not the instantaneous speed.
- Here `T` means period. Earlier it meant tension or flight time, so define it locally.
- Smaller radius means larger acceleration at the same speed.

---

### W04-6. Centripetal Force Is The Inward Net Force

Core equation:

```tex
\sum F_{\rm inward}=m\frac{v^2}{r}
```

Where it comes from:

Put the radial acceleration component into Newton's second law, choosing inward as positive.
Outward force components are negative:

```tex
\sum F_{\rm inward}=ma_{\rm rad}
```

with:

```tex
a_{\rm rad}=v^2/r
```

Why we need it:

It prevents drawing a fake "centripetal force." The inward force is supplied by real forces:
tension, friction, normal force, or gravity.

Simple core example, flat curve:

Assume an unbanked horizontal road, constant speed, no vertical acceleration, `N=mg`, and
no simultaneous braking or propulsive demand using the same friction capacity.

Static friction supplies the inward force:

```tex
f_s=m\frac{v^2}{r}
```

Since `f_s\le \mu_smg`:

```tex
m\frac{v^2}{r}\le \mu_smg
```

Cancel `m`:

```tex
v_{\max}=\sqrt{\mu_sgr}
```

Edge cases and traps:

- Do not draw "centripetal force" as an extra arrow.
- If speed is too large, required friction exceeds its maximum.
- The mass cancels in the flat-curve speed limit, but that does not mean force is zero.

---

## Week 05: Work, Kinetic Energy, Power

### W05-1. Work Is Force Along Displacement

Core equation:

```tex
W=\vec F\cdot\Delta\vec r=F\,\Delta r\cos\theta
```

Where it comes from:

For a constant force acting through a straight finite displacement, the dot product extracts
the force component along that displacement.

Why we need it:

It turns force acting over distance into energy transfer for the particle or translational
motion model used here.

What it can find:

- Work by a push, pull, friction force, weight, or tension.
- Sign of energy transfer.
- Whether a force affects speed through work.

Simple core example:

`20 N` force, `3.0 m` displacement, `60 deg` angle:

```tex
W=(20)(3.0)\cos60^\circ=30\ \mathrm J
```

Edge cases and traps:

- Force along motion: positive work.
- Force perpendicular to motion: zero work.
- Force opposite motion: negative work.
- A normal force often does zero work because displacement along the normal is zero, not
  because the normal force is zero. Moving constraints can do work through a normal force.
- For a variable force or curved path, use `W=\int \vec F\cdot d\vec r`; work depends on the
  force along each local displacement, not only on the angle to the net displacement.

---

### W05-2. Variable-Force Work Is Area Under The Force Graph

Core equation:

```tex
W=\int_{x_1}^{x_2}F_x(x)\,dx
```

Where it comes from:

Break the path into tiny pieces. On one tiny piece:

```tex
dW=F_x(x)\,dx
```

Add all pieces:

```tex
W=\int_{x_1}^{x_2}F_x(x)\,dx
```

Why we need it:

Constant force is a rectangle. Variable force is still area, but the shape may be a triangle
or a curve.

Simple core example:

Force increases linearly from `0` to `6 N` over `2 m`. The force-position graph is a triangle:

```tex
W=\frac12(2)(6)=6\ \mathrm J
```

Edge cases and traps:

- Area below the axis is negative work.
- The force must be the signed component along the path.
- If the path is not straight, use the general path integral `W=\int \vec F\cdot d\vec r`,
  or `W=\int F_t\,ds` with a signed tangential component.

---

### W05-3. Kinetic Energy Comes From Accumulating Newton's Law Over Distance

Core equation:

```tex
K=\frac12mv^2
```

Work-energy theorem:

```tex
W_{\rm net}=\Delta K=\frac12mv_f^2-\frac12mv_i^2
```

Where it comes from, conceptually:

Here `K` is particle or translational kinetic energy. Rolling or rotating bodies may also
need rotational kinetic energy.

Newton's law says force changes motion:

```tex
F_{\rm net}=ma
```

For constant mass, constant collinear net force, one-dimensional motion, and a consistently
signed displacement:

```tex
W_{\rm net}=F_{{\rm net},x}\Delta x=ma_x\Delta x
```

From kinematics:

```tex
v_f^2=v_i^2+2ad
```

Rearrange:

```tex
ad=\frac{v_f^2-v_i^2}{2}
```

Substitute into work:

```tex
W_{\rm net}=m\frac{v_f^2-v_i^2}{2}
=\frac12mv_f^2-\frac12mv_i^2
```

The general work-energy theorem comes from adding infinitesimal pieces:

```tex
dW_{\rm net}=m\vec a\cdot d\vec r
=m\vec v\cdot d\vec v
=d\left(\frac12mv^2\right)
```

Why we need it:

It finds speed from distance and forces without needing time or acceleration explicitly.

What it can find:

- Final speed after net work.
- Stopping distance from friction or braking force.
- Work required to change speed.
- Whether speed increases or decreases.

Simple core example:

A `3.0 kg` box at `2.0 m/s` receives `36 J` of net work.

```tex
K_i=\frac12(3)(2^2)=6\ \mathrm J
```

```tex
K_f=6+36=42\ \mathrm J
```

```tex
42=\frac12(3)v_f^2
\quad\Rightarrow\quad
v_f=5.3\ \mathrm{m/s}
```

Edge cases and traps:

- Use net work, not just one force's work.
- Energy gives speed, not direction.
- Forces perpendicular to displacement do zero work but can change direction.
- Work-energy does not require constant acceleration, but you must know the work.

---

### W05-4. Friction Work Is Negative When It Opposes Motion

Core equation:

```tex
W_f=-f_kd=-\mu_kNd
```

Where it comes from:

This form assumes kinetic friction is opposite the local displacement, `\mu_kN` is constant,
and `d` is the traveled path length. Use a path integral if `N` varies along the path.

Use:

```tex
W=Fd\cos\theta
```

For kinetic friction opposite displacement, `theta=180 deg`, so:

```tex
\cos180^\circ=-1
```

Why we need it:

When kinetic friction opposes the motion in this frame, its work is negative. The object's
kinetic-energy change depends on the net work of all forces. In the object-plus-surface
system, sliding commonly increases internal energy.

Simple core example:

`f_k=12 N`, `d=4.0 m`:

```tex
W_f=-(12)(4.0)=-48\ \mathrm J
```

Edge cases and traps:

- Static friction can do positive, negative, or zero work depending on the situation.
- Friction direction depends on relative motion at the contact.
- If the point of application has no displacement during the interval in the chosen frame,
  the force does no work. Zero net displacement after motion does not generally imply zero
  work.

---

### W05-5. Power Is Rate Of Doing Work

Core equations:

```tex
\overline P=\frac{W}{\Delta t}
```

```tex
P=\vec F\cdot\vec v
```

Where they come from:

Average power is energy transferred per time. Instantaneous power is:

```tex
P=\frac{dW}{dt}
```

It also comes from:

```tex
dW=\vec F\cdot d\vec r
```

Divide by `dt`:

```tex
\frac{dW}{dt}=\vec F\cdot\frac{d\vec r}{dt}
```

Since:

```tex
\frac{d\vec r}{dt}=\vec v
```

we get:

```tex
P=\vec F\cdot\vec v
```

Why we need it:

Work tells total energy transferred. Power tells how fast the transfer happens, which matters
for motors and machines.

Simple core example:

A hoist lifts a `200 kg` crate at constant speed `0.50 m/s`, assuming an ideal hoist with
no losses and neglecting other loads.

Force required:

```tex
F=mg=(200)(9.81)=1962\ \mathrm N
```

Power:

```tex
P_{\rm out}=Fv=(1962)(0.50)=981\ \mathrm W\approx0.98\ \mathrm{kW}
```

Edge cases and traps:

- Constant speed does not mean zero motor force or zero power.
- Same work in half the time means twice the average power.
- Average power may be less than peak instantaneous power.
- Electrical input power would require efficiency: `P_{\rm in}=P_{\rm out}/\eta`.

---

## Weeks 06-07: Review And Midterm Reasoning

In this draft plan, Weeks 06 and 07 introduce no new physics equations. They should help
students choose among the Week 01-05 equations.

### R1. Decision Map: Which Equation Family?

Use the constant-acceleration shortcuts when:

- The problem gives motion variables: `x`, `v`, `a`, `t`.
- Forces are not asked for or are already summarized by acceleration.
- Motion has constant acceleration in the phase.

Kinematics more broadly also includes graphs, derivatives, integrals, and variable
acceleration.

Use Newton's laws when:

- The problem asks for acceleration from forces.
- The problem asks for normal force, tension, or friction.
- You need a free-body diagram.

Use work-energy when:

- Distance and speed are central.
- Time is missing.
- You need final speed after forces act through a distance.
- Forces may vary with position and can be handled by area under a graph.

Use power when:

- The question asks for rate of energy transfer.
- A motor, pump, actuator, hoist, or machine capacity is involved.

Methods can be combined: find acceleration with Newton's law, then use kinematics; use
energy for speed and Newton's law for a contact force.

---

### R2. Same Result, Different Routes

Core example:

A `4 kg` object starts at `2 m/s`, accelerates at `2 m/s^2` over `3 m`. Initial motion and
acceleration are along the positive x-direction, so the positive speed root matches the
motion.

Kinematics:

```tex
v_f^2=v_i^2+2a\Delta x=2^2+2(2)(3)=16\ \mathrm{m^2/s^2}
```

```tex
v_f=4.0\ \mathrm{m/s}
```

Energy:

```tex
F_{\rm net}=ma=(4)(2)=8\ \mathrm N
```

```tex
W_{\rm net}=F_{{\rm net},x}\Delta x=(8)(3)=24\ \mathrm J
```

```tex
K_i=\frac12(4)(2^2)=8\ \mathrm J
```

```tex
K_f=K_i+W_{\rm net}=32\ \mathrm J
```

```tex
32=\frac12(4)v_f^2
\quad\Rightarrow\quad
v_f=4.0\ \mathrm{m/s}
```

Reasoning point:

Both methods agree because the work-energy theorem follows from Newton's second law; the
earlier constant-force derivation illustrates this relationship.

Edge cases:

- If time is asked for, kinematics may be more direct.
- If force varies with distance, energy may be more direct.
- If direction is asked for, energy alone is not enough.

---

## Insertable Mini-Block Template

Use this template when updating the notes later.

```markdown
#### Where this equation comes from

Equation:

$$ ... $$

It comes from:

1. Start with ...
2. Substitute ...
3. Rearrange ...

#### Why we use it

Use this equation when ...

It can find ...

#### Tiny example

...

#### What if conditions change?

- If ..., then ...
- If ..., do not use this shortcut; go back to ...
```

---

## Priority List For Inserting Into Notes Later

High priority, because students use these constantly:

1. Unit multipliers and dimensional consistency.
2. Vector components and component addition.
3. The four constant-acceleration equations and when each is chosen.
4. Projectile motion as two 1D motions with one shared time.
5. Newton's second law as signed force sum, not just "F=ma".
6. Normal force from perpendicular force balance.
7. Static versus kinetic friction decision procedure.
8. Incline acceleration and mass cancellation.
9. Atwood machine from adding two free-body equations.
10. Circular motion: inward net force, not a separate centripetal force.
11. Work as dot product and work-energy as accumulated Newton's law.
12. Power as rate of work.

Medium priority:

1. Cross product as preparation for rotation.
2. Same-height projectile range formula and complementary angles.
3. Flat-curve speed limit.
4. Vertical-loop minimum speed as a future optional addition; it depends on the
   contact/string model and must not be given as an unconditional `\sqrt{gr}` rule.
5. Conical pendulum as a future optional addition.

Lower priority for Week 01-07:

1. Full determinant form of the cross product.
2. Optional drag model.
3. Long multi-step engineering examples.

