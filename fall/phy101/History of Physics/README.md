# PHYSICA — How Physics Forged Modern Engineering

A single-file, interactive portal for introductory *Physics for Scientists and Engineers*
(PHYS 101/102). It follows the chain from Archimedes to LIGO: the crisis each generation
faced, the idea that resolved it, the governing equation, and the branch of engineering that
grew from it.

## What's inside

| Module | Content |
|---|---|
| Timeline | 27 paradigm shifts in chronological order, grouped into 6 eras; filter by era or field, full-text search, deep-dive dialog per milestone |
| Labs | 4 simulations that integrate the real equations with real constants: Newton's cannon (velocity-Verlet, analytic Kepler orbit overlay), Maxwell's plane wave (correct E×B geometry, refractive index), Carnot cycle (computed isotherms/adiabats, PV + TS diagrams, piston), Bohr atom (orbits to scale, energy ladder, hydrogen spectrum with Lyman/Balmer/Paschen lines) |
| Engineering matrix | 8 disciplines (Mechatronics & Control, Mechanical, Electrical, Civil, Aerospace, Computer, Chemical, Biomedical) mapped to their physical foundations and governing equations |
| Master equations | 14 equations dissected symbol by symbol, with SI units, intuition and engineering use |
| Self-test | 15 conceptual questions with full explanations, keyboard support, and an end-of-test review |
| Syllabus map | Module-by-module alignment with Young & Freedman and Halliday, Resnick & Walker |
| Study notes | One-click Markdown export of the whole content; a print stylesheet turns the page into a handout |

Instructors: `docs/TEACHER_GUIDE.md` (also provided as `.pdf` and `.docx`) is a ~34,000-word companion in four parts.
Part I covers semester plans and timeline teaching; **Part II is lecture notes for all 27 milestones** — history and anecdotes
(with the legends flagged as legends), board-level derivations, worked numbers with a mechatronics slant, cheap demonstrations
and the questions students actually ask; Part III has the four lab session scripts with the exact readouts the site produces;
Part IV has assessment, a term project with rubric, a misconception bank and logistics. Appendices: reference tables for every
lab, an English–Turkish glossary, a chronology and a further-reading list.

Math is rendered by [KaTeX](https://katex.org) (loaded from jsDelivr). Fonts come from Google Fonts.
Both need an internet connection; everything else runs locally.

## Deploy to GitHub Pages

1. Create a repository (for example `physics-intro`) and upload `index.html` to its root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<username>.github.io/physics-intro/`.

The page is a single file with no build step, so it can also be dropped into any LMS that
accepts an HTML file or an iframe (Canvas, Moodle, Google Sites).

## Editing the content

Everything students read lives in one JavaScript object near the bottom of `index.html`:

```js
const SITE_DATA = {
  "eras": [...],        // 6 eras: name, period, start/end year, colour, summary
  "milestones": [...],  // 27 cards: crisis / breakthrough / equation / engineeringImpact / deepDive
  "disciplines": [...], // engineering matrix
  "equations": [...],   // master equations with symbol breakdown
  "quiz": [...],        // question, options, index of the correct option, explanation
  "syllabus": [...],
  "meta": { ... }       // course code, author, institution shown in the hero and footer
};
```

- Equations are LaTeX strings (double the backslashes inside the JSON-style object: `"\\frac{a}{b}"`).
- Inline math inside prose uses `$...$`; the text fields accept simple HTML (`<strong>`, `<em>`).
- Every milestone needs a numeric `sortYear` (BCE years are negative) and an `eraId`; the era
  strip counts and sorts from these automatically, and the hero statistics update themselves.
- Categories (colours and filter labels) are defined in the `CATEGORIES` object at the top of the
  script; the valid values are `mechanics`, `thermo`, `em`, `relativity`, `quantum`, `astro`.
- To change the course code or author line, edit `SITE_DATA.meta`.

The stylesheet is in the `<style>` block; all colours, fonts and spacing are CSS custom properties
declared in `:root`, so a light theme or a different typeface is a few lines.

## Physics conventions used by the labs

- **Newton's cannon**: GM⊕ = 3.986004418 × 10⁵ km³/s², R⊕ = 6371 km, launch altitude 400 km.
  Orbital elements are computed analytically from the launch speed; the trajectory is integrated
  numerically (velocity Verlet, ≤ 2 s steps) at 600× real time.
- **Maxwell**: E ∥ x̂, B ∥ ŷ, propagation along +ẑ, so S = E×B/μ₀ ∥ +ẑ. Frequency is fixed by the
  source; entering a medium of index n changes v and λ but not f. η = η₀/n assumes μᵣ = 1.
- **Carnot**: 1 mol ideal monatomic gas (γ = 5/3), V₁ = 10 L, Q = nRT ln(V₂/V₁) on the isotherms,
  TVᵞ⁻¹ = const on the adiabats.
- **Bohr**: Eₙ = −13.5984 eV / n², λ = hc/ΔE with hc = 1239.84 eV·nm (vacuum wavelengths).

## Licence and attribution

Content and code © 2026 Dr. Arif Solmaz, Mechatronics Engineering, İSTÜN. Add a `LICENSE` file if
you want others to reuse it; CC BY 4.0 for the content and MIT for the code is a common pairing
for open educational resources.
