import { expect, test } from '@playwright/test';

const openGridAStar = 'A* -> (moves, terrain cost, popped): (6, 6, 7)';
const labs = [
  { week: 1, timingRows: 4, output: ['100: first hit', '1000: no hit'] },
  { week: 2, timingRows: 6, output: ['100: scan', '1000: pairs'] },
  { week: 3, timingRows: 8, output: ['100/100: scan', '1000/0: binary'] },
  { week: 4, timingRows: 4, output: ['128: shift', '8192: ring'] },
  { week: 5, timingRows: 4, output: ['100: binary pair', '1000: hash pair'] },
  { week: 6, timingRows: 4, output: ['5 -> 16', '31 -> 23'] },
  { week: 7, timingRows: 4, output: ['32: list', '512: heap'] },
  { week: 8, timingRows: 2, output: ['(4, 28, 8)', '(6, 6, 73)'] },
  { week: 9, timingRows: 4, output: ['(4, 28, 8)', '(8, 8, 9)', '(6, 6, 74)'] },
  {
    week: 10,
    timingRows: 4,
    output: [
      'Dijkstra -> (moves, terrain cost, popped): (8, 8, 9)',
      'A* -> (moves, terrain cost, popped): (8, 8, 9)',
      'Dijkstra -> (moves, terrain cost, popped): (6, 6, 74)',
      openGridAStar,
      'Path: [(12, 12), (12, 13), (12, 14), (12, 15), (12, 16), (12, 17), (12, 18)]',
    ],
  },
  { week: 11, timingRows: 4, output: ['20: chain', '200: cycle'] },
  { week: 12, timingRows: 2, output: ['(19, 54, 1)', '(199, 584, 1)'] },
  { week: 13, timingRows: 4, output: ['(31, 251) (31, 25)', '(64, 48619) (64, 81)'] },
  { week: 14, timingRows: 6, output: ['6 exact -> 26.116', '8 exact -> 30.501'] },
];

const languages = [
  { code: 'en', path: '', run: 'Run Python 1', stop: 'Stop', stopped: /^Stopped\./, finished: 'Finished' },
  { code: 'tr', path: 'tr/', run: 'Python 1 kodunu çalıştır', stop: 'Durdur', stopped: /^Durduruldu\./, finished: 'Tamamlandı' },
];

async function openLab(page, week, language) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(`w${week}/${language.path}`, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `Week ${week} page should respond successfully`).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', language.code);

  const timing = page.locator('#timing');
  return {
    run: timing.getByRole('button', { name: language.run, exact: true }),
    stop: timing.getByRole('button', { name: language.stop, exact: true }),
    status: timing.getByRole('status'),
    output: timing.locator('.py-output'),
    errors,
  };
}

for (const language of languages) {
  test.describe(language.code, () => {
    for (const { week, timingRows, output } of labs) {
      test(`Week ${week} timing lab runs`, async ({ page }) => {
        const lab = await openLab(page, week, language);
        await lab.run.click();
        await expect(lab.status).toHaveText(language.finished);
        await expect(lab.run).toBeEnabled();
        const result = await lab.output.innerText();
        for (const expected of output) {
          expect(result).toContain(expected);
        }
        // Timings vary by machine. Verify that every expected pair of measurements was printed.
        const measurements = result.split('\n').filter(line => /\d+\.\d+ ms\s+\d+\.\d+ ms\s*$/.test(line));
        expect(measurements).toHaveLength(timingRows);
        expect(lab.errors).toEqual([]);
      });
    }

    test('Week 10 restarts while Python is still loading', async ({ page }) => {
      const lab = await openLab(page, 10, language);
      const runtimeRequested = Promise.withResolvers();
      const releaseRuntime = Promise.withResolvers();
      // Hold the real download until the second run starts, so both attempts share the pending load.
      await page.route('**/python-runtime.js', async route => {
        runtimeRequested.resolve();
        await releaseRuntime.promise;
        await route.continue();
      }, { times: 1 });

      try {
        await lab.run.click();
        await runtimeRequested.promise;
        await lab.stop.click();
        await expect(lab.status).toHaveText(language.stopped);
        await expect(lab.run).toBeEnabled();
        await lab.run.click();
      } finally {
        releaseRuntime.resolve();
      }

      await expect(lab.status).toHaveText(language.finished);
      await expect(lab.output).toContainText(openGridAStar);
      await expect(lab.run).toBeEnabled();
      await expect(lab.stop).toBeDisabled();
      expect(lab.errors).toEqual([]);
    });
  });
}
