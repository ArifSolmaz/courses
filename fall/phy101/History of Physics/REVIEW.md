# Review notes: what changed and why

This file records the review of the original `physica_github_pages_bundle` and every change
made in the rebuilt `index.html`. Delete it before publishing if you like.

## 1. Physics and history corrections

| Where | Original | Fixed |
|---|---|---|
| Maxwell lab | Readout claimed E ∥ y, B ∥ x, S ∥ +z. But ŷ × x̂ = −ẑ. | E ∥ x̂, B ∥ ŷ, S = E×B/μ₀ ∥ +ẑ, drawn in a consistent oblique projection. The "wave speed c" slider (c is not adjustable) became a refractive-index slider; f stays fixed, v and λ change. |
| Photoelectric card | `K_max = hν − Φ = hc/λ − eV₀` (implies Φ = eV₀) | `K_max = hν − Φ = eV₀` |
| Transistor card | `I_D = I_S(e^{qV_BE/kT} − 1)` mixes diode and BJT notation | `I_C = I_S(e^{qV_BE/k_BT} − 1)` |
| Bohr card | Rydberg formula in n₁/n₂ while the lab uses nᵢ/n_f | Written in n_f, nᵢ |
| Cannon lab | Altitude readout initialised at 450 km but computed as (r−R)×4 → 64 km; "escape" declared at an arbitrary 600 px radius; hard-coded 7.9 / 11.2 km/s thresholds inconsistent with the launch altitude | Real units (GM⊕, R⊕, 400 km launch). Orbital elements (e, perigee, apogee, period) computed analytically and the predicted conic drawn as a dashed overlay; status (sub-orbital / circular / elliptical / unbound) follows from the energy and perigee, not from pixel thresholds. Circular and escape speeds *at the launch altitude* are displayed (7.67 and 10.85 km/s). |
| Carnot lab | PV cycle was four hand-placed Bézier curves; sliders changed only the efficiency number; "Net work: Active Area" placeholder | Isotherms PV = nRT and adiabats PVᵞ = const computed for the chosen T_H, T_C and expansion ratio; Q_in, Q_out, W and η reported in kJ; T–S diagram added (η visible as an area ratio); gas colour follows temperature; heat and work arrows per stroke. |
| Bohr lab | Series named by wavelength ("Lyman" = anything < 380 nm); orbit radii linear (30, 55, 80 …) instead of ∝ n²; spectrum-bar colour stops unrelated to the wavelength axis; absorption never animated | Series named by n_f; radii rₙ = n²a₀ to scale; energy-level ladder added; spectrum strip on a log-λ axis with Lyman/Balmer/Paschen lines and a physically mapped visible band; emission and absorption both animated; frequency readout added. |
| LIGO card | "1/10,000th the width of a proton" attached to ΔL ≈ 4×10⁻¹⁸ m (that is ~1/400 of a proton) | ΔL for GW150914 ≈ a few thousandths of a proton diameter; best sensitivity below 10⁻¹⁹ m. |
| Planck card and quiz Q8 | Repeats the myth that the "ultraviolet catastrophe" motivated Planck in 1900 | Planck was driven by Wien's law failing against Rubens–Kurlbaum infrared data; Rayleigh (1900)/Jeans (1905) made the divergence explicit and Ehrenfest named it in 1911. The quiz explanation now says so. |
| Boltzmann card | "Temperature is simply the average kinetic energy" | Proportional to the average kinetic energy per degree of freedom (½k_BT each). |
| Newton card | "Invented differential and integral calculus" | Developed the calculus independently of Leibniz. |
| Uncertainty principle | Milestone dated 1925–1926 | 1925–1927 (Heisenberg's paper is 1927). |
| Quiz Q9 | "insulators have bandgap > 5 eV" | Several eV, with examples (diamond 5.5 eV, SiO₂ ≈ 9 eV). |
| Quiz explanations | Every explanation opened with "Brilliant!/Spot on!/Superb!", so a wrong answer read "Incorrect. Brilliant! …" | Interjections removed; verdict line states the correct letter. |
| Syllabus | Young & Freedman Module 3 "Ch. 11–14" and Module 4 "Ch. 15–16" (Ch. 14 is periodic motion) | Module 3: Ch. 11–13; Module 4: Ch. 14–16; edition note added. |
| Equation inspector | Several "meaning" cells contained raw LaTeX without delimiters and units like `kg\cdot m/s^2` rendered as literal backslashes | Wrapped in `$…$`; units rendered with `\mathrm`. |
| Three cards | Markdown `**bold**` inside HTML strings rendered as literal asterisks | Converted to `<strong>`. |

## 2. Coverage gaps filled

The syllabus table cited Hooke, Huygens, Bernoulli, Coulomb, Young, Fresnel and Fourier, but the
timeline had no milestone for oscillations, fluids, electrostatics, wave optics or heat conduction.
Five milestones were added (Hooke & Huygens 1660–1678; Bernoulli & Euler 1738–1757; Coulomb &
Gauss 1785; Young & Fresnel 1801–1818; Fourier 1822), two master equations (Gauss's law, the linear
wave equation), five quiz questions on those topics (including the equal-transit-time lift
misconception and the Tacoma Narrows flutter-vs-resonance distinction), and a **Mechatronics &
Control Engineering** lineage, which was missing from a portal built for a mechatronics department.

## 3. Technical and usability fixes

- **Distorted canvases.** Every simulation canvas had a fixed 680×420 bitmap stretched with
  `width:100%; height:100%`, so circles rendered as ellipses. All canvases now draw in a logical
  680×420 coordinate system scaled uniformly to the CSS size at the device pixel ratio.
- **No mobile navigation.** Six links plus two buttons overflowed and were clipped by
  `overflow-x:hidden`. Added a hamburger menu with `aria-expanded`.
- **Horizontal overflow on phones** from `minmax(360px, 1fr)` grids → `minmax(min(100%, 340px), 1fr)`.
- **Five permanent `requestAnimationFrame` loops** (hero + four labs, hidden ones included) → one
  scheduler that runs only the visible tab, pauses when the labs scroll off-screen, and respects
  `prefers-reduced-motion` for the decorative hero.
- **Timeline not chronological** despite its title; the 6 eras in the data were never rendered.
  Cards now sort by a numeric `sortYear`; the eras appear as a clickable strip and combine with the
  field filter and full-text search (which now also searches the deep-dive text).
- **Dialogs** rebuilt on `<dialog>`: focus moves in and returns, Esc closes, background scroll is
  locked, `aria-labelledby` set.
- **Quiz** "Retake" reloaded the whole page; now resets in place, shows a per-question review,
  and accepts A–D / Enter keys. 13 of the 15 correct answers sat in position B, so option order is
  now shuffled every time a question loads.
- Tabs use the WAI-ARIA tabs pattern with arrow-key navigation; filters use `aria-pressed`;
  sliders have real `<label>`s and a Firefox thumb style; the undefined `text-cyan` class is gone.
- Sticky nav no longer covers anchor targets (`scroll-margin-top`); `scroll-smooth` (a Tailwind
  class with no CSS behind it) replaced by real CSS.
- KaTeX updated 0.16.8 → 0.18.7; favicon, `theme-color` and Open Graph tags added; a print
  stylesheet turns the page into a handout; the Markdown export now includes the deep dives,
  symbol tables and syllabus map.
- The "🚀 GitHub Pages" button and deployment dialog were removed from the student-facing page
  (that guidance belongs in this README, where it now lives).
- The data block is pretty-printed instead of a single 110 KB line, so content edits are diffable.

## 4. Design changes

The original used the generic dark "glass card" kit: three typefaces, gradient-text headline,
ALL-CAPS eyebrow labels over every heading, hover-lift on every card, arrows appended to buttons,
and a particle-mesh hero unrelated to physics. The rebuild keeps the dark palette and category
colours but uses one type family (IBM Plex Serif for headings, Plex Sans for text, Plex Mono for
readouts), removes decorative chrome, and gives the page two subject-specific moments: the hero
runs Kepler's second law live (equal areas in equal times, periods ∝ a^3/2), and the era strip
is a real chronological structure rather than another card grid. Colour contrast was raised on
muted text, focus rings are visible, and the layout was verified at 390 px and 1280 px.

## 5. Verification

Loaded in headless Chromium: zero console errors or warnings; no horizontal overflow at 390 px or
1280 px; every filter, tab, dialog, preset, quiz path and the Markdown export exercised. Numerical
spot checks: circular orbit at 400 km → 92.3 min (ISS 92.9 min); v₀ = 9 km/s → e = 0.376, apogee
8558 km, T = 187.5 min; Carnot 800/300 K, r = 2 → η = 62.5 %, W = 2.88 kJ; Hα → 1.889 eV,
656.5 nm (vacuum), 457 THz; Lyman-α → 121.6 nm; glass (n = 1.5) at 800 nm → 374.7 THz,
199,862 km/s, 533 nm, 251 Ω.
