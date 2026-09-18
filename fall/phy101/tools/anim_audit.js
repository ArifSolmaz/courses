const { chromium } = require('playwright');

/* Per-animation invariants: relations that must hold for EVERY slider setting
   and EVERY scrub position. Values are parsed out of the stat readouts, so this
   checks the numbers the student actually sees, not the code that made them. */
const num = s => { const m = String(s).match(/-?\d+(\.\d+)?([eE][-+]?\d+)?/); return m ? parseFloat(m[0]) : NaN; };
const close = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 0.02 : tol) * Math.max(1, Math.abs(a), Math.abs(b));

const INVARIANTS = {
  "w3-independence": S => close(num(S["height of dropped"]), num(S["height of launched"]), 0.001)
      ? null : "dropped and launched heights differ",
  "w3-range": S => close(num(S["range"]), num(S["complement"].split("gives")[1]), 0.02)
      ? null : "complement does not share the range",
  "w4-incline": S => {
    if (/held/.test(S["state"]) && num(S["acceleration"]) !== 0) return "held but accelerating";
    if (/sliding/.test(S["state"]) && !(num(S["mg sin θ"]) > num(S["friction available"]) - 0.05))
      return "sliding though friction exceeds the drive";
    return null; },
  "w4-atwood": S => { const T = num(S["tension"]), a = num(S["m₁g"]), b = num(S["m₂g"]);
    return (T >= Math.min(a,b) - 0.05 && T <= Math.max(a,b) + 0.05) ? null : "tension outside the two weights"; },
  /* K must stay consistent with the speed it reports: K = 1/2 m v^2, so K/v^2
     is the same at every scrub position for one slider setting. */
  "w5-area": (S, bag, c) => { const K = num(S["kinetic energy"]), v = num(S["speed"]);
    if (v < 0.05) return null;
    const half = +c.sliders[0] / 2;                 // K/v^2 must equal m/2
    const step = Math.abs(K) < 10 ? 0.005 : 0.05;   // half the displayed precision
    const slack = (step + 2 * Math.abs(K / v) * 0.005) / (v * v);
    return Math.abs(K / (v * v) - half) <= slack + 1e-9
      ? null : `K/v^2 = ${(K/(v*v)).toFixed(4)}, expected m/2 = ${half}`; },
  "w8-track": S => close(num(S["total"]), num(S["kinetic"]) + num(S["potential"]), 0.02)
      ? null : "K + U does not equal the total",
  "w8-spring": S => { const d = S["double the squeeze"];
    return /4\.00|still 4/.test(d) ? null : "doubling is not a factor of four"; },
  /* A triangular pulse peaks at twice its mean; a square one is its own mean.
     Either way the impulse must not move when the stopping time does. */
  "w9-impulse": (S, bag, c) => { const av = num(S["average force"]), pk = num(S["peak force"]);
    const want = /square/.test(c.seg || "") ? av : 2 * av;
    if (!close(pk, want, 0.02)) return `peak ${pk} is not the expected ${want.toFixed(1)}`;
    const J = num(S["impulse = Δp"]);
    bag.J = bag.J || {}; const key = String(c.sliders);
    if (bag.J[key] == null) bag.J[key] = J;
    return close(bag.J[key], J, 0.001) ? null : "impulse changed with the stopping time"; },
  "w9-collisions": S => { const p = S["momentum"].split("→");
    return close(num(p[0]), num(p[1]), 0.02) ? null : "momentum not conserved"; },
  "w10-omega": S => close(num(S["rim speed"]) , num(S["inner speed"]) * num(S["ratio"]), 0.02)
      ? null : "ratio does not match the two speeds",
  "w10-inertia": S => close(num(S["I twice out"]), 4 * num(S["I close in"]), 0.02)
      ? null : "outer inertia is not four times the inner",
  "w11-race": S => /sphere.*disc.*hoop/.test(S["finishing order"]) ? null : "finishing order wrong",
  /* The whole point: L must equal I times omega, and must not move at all. */
  "w11-angmom": (S, bag) => { const L = num(S["L = Iω"]), I = num(S["I"]), om = num(S["ω"]);
    if (!close(L, I * om, 0.02)) return `L ${L} != I*omega ${(I*om).toFixed(3)}`;
    bag.L = bag.L == null ? L : bag.L;
    return close(bag.L, L, 0.001) ? null : "L changed"; },
  "w12-balance": S => (Math.abs(num(S["ΣF"])) < 0.5 && Math.abs(num(S["Στ about A"])) < 0.5)
      ? null : "equilibrium conditions not satisfied",
  "w12-tipping": S => { const sl = num(S["slides at"]), tp = num(S["tips at"]);
    const first = /tips first/.test(S["which comes first"]) ? "tip" : "slide";
    return ((first === "tip") === (tp < sl)) ? null : "names the wrong threshold as first"; },
  "w13-shm": S => { const om = num(S["ω"]), x = num(S["x"]), a = num(S["a"]);
    return close(a, -om * om * x, 0.02) ? null : "a is not -omega^2 x"; },
  "w13-energy": S => close(num(S["K + U"]), num(S["total ½kA²"]), 0.02)
      ? null : "K + U does not equal the total"
};

(async () => {
  const week = process.argv[2];
  const b = await chromium.launch({ executablePath: process.env.PWEXE, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const jsErrs = [];
  p.on('pageerror', e => jsErrs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') jsErrs.push(m.text()); });
  await p.goto(`file:///home/claude/animlab/lab-w${week}.html`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.anim-gate .anim-opts button').forEach(x => x.click()));
  await p.waitForTimeout(200);

  const names = await p.$$eval('[data-anim]', hs => hs.map(h => h.getAttribute('data-anim')));
  const report = [];
  for (const name of names) {
    const cases = await p.evaluate((nm) => {
      const host = document.querySelector(`[data-anim="${nm}"]`);
      const ranges = [...host.querySelectorAll('.anim-controls input[type=range]')];
      const scrub = ranges.find(r => (r.getAttribute('aria-label') || '').includes('Scrub'));
      const sliders = ranges.filter(r => r !== scrub);
      const segs = [...host.querySelectorAll('.anim-controls .seg')];
      const fire = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
      const read = () => {
        const out = {};
        host.querySelectorAll('.anim-stats .stat').forEach(s => {
          const b = s.querySelector('b'); if (!b) return;
          out[s.textContent.replace(b.textContent, '').trim()] = b.textContent.trim();
        });
        return out;
      };
      const pos = s => [s.min, (+s.min + +s.max) / 2, s.max];
      const results = [];
      // lattice over the sliders, plus every segmented option, x 5 scrub positions
      const combos = [];
      for (let i = 0; i < 3; i++) combos.push(sliders.map(s => pos(s)[i]));
      if (sliders.length > 1) { combos.push(sliders.map((s, j) => pos(s)[j % 3])); }
      for (const combo of combos) {
        sliders.forEach((s, j) => fire(s, combo[j]));
        const segBtns = segs.length ? [...segs[0].querySelectorAll('button')] : [null];
        for (const sb of segBtns) {
          if (sb) sb.click();
          for (const f of [0, 250, 500, 750, 1000]) {
            if (scrub) fire(scrub, f);
            /* record what the inputs ACTUALLY hold: a range input snaps to its
               step, so the value written is not always the value in force. */
            results.push({ sliders: sliders.map(s => s.value), seg: sb ? sb.textContent.trim() : null,
                           scrub: f, stats: read() });
          }
        }
      }
      return results;
    }, name);

    const bad = [];
    const bag = {};
    const inv = INVARIANTS[name];
    for (const c of cases) {
      for (const [k, v] of Object.entries(c.stats)) {
        if (/NaN|undefined|Infinity/i.test(v)) bad.push(`NaN/undefined in "${k}" = "${v}" (scrub ${c.scrub}, sliders ${c.sliders})`);
      }
      if (inv) { const msg = inv(c.stats, bag, c); if (msg) bad.push(`${msg} (scrub ${c.scrub}, sliders ${c.sliders}, seg ${c.seg})`); }
    }
    report.push({ name, cases: cases.length, problems: [...new Set(bad)].slice(0, 4) });
  }
  for (const r of report) {
    console.log(`${r.problems.length ? 'FAIL' : ' ok '} ${r.name.padEnd(17)} ${String(r.cases).padStart(3)} cases`);
    r.problems.forEach(x => console.log(`        - ${x}`));
  }
  if (jsErrs.length) console.log('  JS errors: ' + [...new Set(jsErrs)].slice(0,3).join(' | '));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
