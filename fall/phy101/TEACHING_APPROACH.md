# PHY101 — Physical meaning before calculation

Adopted 20 September 2026. Applies to all 13 weekly notebooks, final review, eight laboratory briefs, six optional extensions and the classroom activity guidance. The notebook is the source of truth; weekly web lessons are generated from it.

## What we take from the shared explanation

The reference is [The Physical Meaning of Vectors, shared Gemini conversation](https://share.gemini.google/xuD3ybErmUyP), read on 20 September 2026. Its useful teaching structure is **physical question → meaning of the operation → geometry → concrete application → equation**. The goal is to understand why an operation describes an event, rather than recognise a formula and substitute numbers.

This is an adapted teaching method, not adoption of every claim or topic in the conversation. Corrections and boundaries:

- Wind **from the east** moves west. A northbound aircraft with that wind has a northwest ground velocity in the stated model.
- A cross product is not generally called an outer product. Dot products produce scalars; three-dimensional cross products produce axial vectors, with order-dependent sign.
- Addition combines compatible quantities in the same coordinate system. Linear superposition is a model property, not a universal rule for physical responses or energy.
- Gradient points toward greatest local scalar-field increase; a conservative force is the negative potential-energy gradient. PHY101 uses the existing one-dimensional form, negative slope, without requiring vector calculus.
- Converging flow alone does not establish negative divergence. Divergence describes local net outward flux per volume; incompressible flow can converge geometrically without nonzero divergence. Curl describes local circulation, not merely a visibly curved path. These operators and electromagnetic applications remain outside the required course.
- Every analogy must name its limitations. A diagram, simulation or repeated evaluation of the same formula is not independent experimental verification.

## The student routine

Keep the established six-step method: **draw → choose a law → rearrange symbolically → check a limiting case → substitute with units → interpret**. Strengthen the first two steps rather than adding an unrelated checklist:

1. Draw the system, interactions, coordinate axes and relevant geometry. Identify the quantity, units and scalar/vector character.
2. Say what the operation does: combine effects, scale, project, measure turning, read a rate, accumulate a change, or weight a distribution. State the assumptions that make that operation the right one.
3. Predict a sign, direction or trend before calculation. Give a physical reason.
4. Use the existing symbolic calculation and limiting-case check; then calculate with units.
5. Interpret the result in the original picture. Change one parameter or assumption and explain the effect.

A short Turkish explanation supports each new concept bridge. Diagnostic answers are in closed details panels, following a written prediction. These are teaching prompts, not changes to the common-exam rubric, topic order, release schedule or credit policy.

## Topic-specific implementation

| Material | Physical meaning and geometric bridge | Diagnostic distinction |
| --- | --- | --- |
| Week 01 | Quantities, scaling, tip-to-tail addition, projection, perpendicular area/turning | Path versus displacement; compatible sums; dot versus cross; wind direction |
| Week 02 | Graph slopes and signed areas; rectangle plus triangle | Distance versus displacement; velocity versus acceleration |
| Week 03 | Components sharing one clock; interactions on one body | Horizontal speed versus flight time; reaction pairs on different bodies |
| Week 04 | Contact constraints and projections on an incline | Actual static friction versus its maximum; relative slipping |
| Week 05 | Force along displacement, signed work area and energy rate | Work versus power; perpendicular force versus zero force |
| Week 06 | Select an operation from the requested physical quantity | Acceleration, speed after distance, and power require different routes |
| Week 07 | Explain previously studied diagrams and diagnose errors | Model/sign errors cannot be repaired by changing arithmetic |
| Week 08 | Configuration energy, reference choice and negative slope | Energy value versus force; constant offset versus physical difference |
| Week 09 | Force accumulated over time; momentum of a system | Impulse versus work; momentum versus kinetic-energy conservation |
| Week 10 | Shared angle, local arc distance and mass weighted by squared radius | Angular versus tangential speed; axis-dependent inertia |
| Week 11 | Lever arm, cross-product direction and angular-momentum account | Torque versus force; conserved angular momentum versus changing energy |
| Week 12 | Mass-weighted position; independent force and torque balances | Zero resultant versus zero turning effect; contact constraints |
| Week 13 | Negative linear restoration and phase of motion | Restoring force versus drag; amplitude versus period and energy |
| Final review | Operation map plus a motor accelerate/hold/brake transfer check | Graph axes and assumptions determine the meaning of a calculation |
| Lab 00 / Lab 02 | Resolution, repeated readings and operational definitions | Precision versus offset; digits versus evidence |
| Lab 03 | Cylinder geometry and sensitivity of inferred density | Squared diameter amplifies fractional error |
| Lab 04 | Free-fall triangular velocity area and linearised graph | Slope of height–time-squared is not velocity; delay can bias slope |
| Lab 05 | Projectile and incline projections | Conditions behind range symmetry and sliding onset |
| Lab 09 | Signed momenta and positive kinetic energies | Conservation tests use external impulse and measured uncertainty |
| Lab 10 | String/arc geometry and independent angular measurement | Algebraic agreement does not test an assumed no-slip relation |
| Lab 11 | Separate force/torque systems; tangential restoring force | Object property versus response; small-angle assumptions |
| Circular-motion extension | Difference of velocity arrows | Constant speed versus zero acceleration |
| Angular-momentum extension | Perpendicular change of angular momentum | Steady precession versus arbitrary gyroscopic motion |
| Gravitation extension | Tangent velocity, central force, potential reference | Zero work versus zero force; negative total energy versus kinetic energy |
| Resonance extension | Force–velocity timing and accumulated power | Phase and dissipation determine energy transfer |
| Waves extension | Material motion, pattern motion and linear superposition | Displacement cancellation versus energy cancellation |
| Review/projects extension | Predictions, limiting cases and independent data | Implementation check versus model validation |
| Calculator activity | Question-specific prediction and explanation for all 15 drills | Correct keypresses plus physical sense; no speed bonus |
| History portal | Physical question, diagram, meaning, evidence, limitation | Modern explanatory notation versus historical attribution |

## Classroom use

Use the new concept bridge beside the relevant existing theory, figure or demonstration; do not read every paragraph aloud as additional lecture time. Ask students for a 30–60 second written prediction, compare two explanations, then use the existing calculation or animation. Choose examples across mechatronics, computer and chemical engineering without requiring programming or specialist knowledge.

For labs, connect every transformed axis or calculated quantity to the measurement that supports it. Name shared inputs when two derived estimates are correlated. Investigate disagreement; do not force observations to match the idealised model.

For the calculator activity, follow [the meaning prompts](calc/MEANING_PROMPTS.md) and [day-of-class guidance](calc/DAY-OF-CLASS.md). These explanation prompts are a supervised discussion routine; the online form still collects its existing numeric answers. Scores remain 10 for a correct eligible answer, 0 otherwise, with no speed bonus. No claim is made that this prevents AI assistance or verifies identity.

## Maintenance and verification

Preserve existing problem identifiers, worked examples, notebook code, release links and the fixed calendar. Keep optional extensions explicitly outside added common-exam scope. Place topic-specific explanations in the relevant concept section; avoid repeating generic introductory prose in place of teaching the topic.

After editing sources, regenerate all weekly pages and run the existing site verification. Validate notebook structure and mathematical rendering, check that new explanations reach the Learn stage, and inspect representative lessons at desktop and narrow widths. A content revision does not require redeploying the separate instructor app unless its source changes.
