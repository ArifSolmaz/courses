import { expect, test } from '@playwright/test';

const openGridAStar = 'A* -> (moves, terrain cost, popped): (6, 6, 7)';
const labs = [
  { week: 1, timingRows: 4, output: ['100: first hit', '1000: no hit'] },
  { week: 2, timingRows: 6, output: ['100: scan', '1000: pairs'] },
  { week: 3, timingRows: 8, output: ['100/100: scan', '1000/0: binary'] },
  { week: 4, timingRows: 4, output: ['128: shift', '8192: ring'] },
  { week: 5, timingRows: 4, output: ['100: binary pair', '1000: hash pair'] },
  { week: 6, timingRows: 4, output: ['5 -> 16', '31 -> 23'] },
  { week: 7, timingRows: 8, output: ['32: list', '512: heap'] },
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

const variations = {
  1: { measurements: ['last hit'] },
  2: { measurements: ['unordered pairs', 'unordered pairs'], lines: ['200 -> (19900, 0)', '400 -> (79800, 0)'] },
  3: { lines: ['220 -> 1', '221 -> 3', '900 -> 5'] },
  4: { measurements: ['1: shift', '1: ring', '1024: shift', '1024: ring'] },
  5: { lines: ['0 -> 0', '5 -> None', '8 -> 8', '9 -> None'] },
  6: { measurements: ['ordered', 'reversed', 'duplicates'] },
  7: { lines: ['[(3, 1), (3, 4), (5, 3), (7, 2)]'] },
  8: { lines: ['(5, 5, 6, [(0, 0), (1, 0), (2, 0), (2, 1), (2, 2), (1, 2)])', '(None, None, 3, [])'] },
  9: { lines: ['1 -> (4, 4) (4, 4)', '2 -> (4, 7) (4, 7)', '3 -> (4, 10) (8, 8)', '9 -> (4, 28) (8, 8)'] },
  10: { lines: [
    'manhattan (3, 3, 4, [(0, 0), (0, 1), (0, 2), (0, 3)])',
    'zero (5, 1, 8, [(0, 0), (1, 0), (1, 1), (1, 2), (1, 3), (0, 3)])',
  ] },
  11: { lines: ['[4, 1, 0, 2, 3]'] },
  12: { lines: ['(3, 4, 1) (3, 7, 1) (2, 3, 2)'] },
  13: { lines: ['(7, 55) (7, 15)'] },
  14: { lines: ['[0, 2, 1, 3, 0] -> [0, 1, 2, 3, 0]'] },
};

const languages = [
  {
    code: 'en', path: '', run: 'Run Python 1', stop: 'Stop', stopped: /^Stopped\./, finished: 'Finished',
    edit: 'Edit code', minutes: 'min', plan: /^180 minutes · .*10 min break/,
    worked: 'Show the worked steps', procedure: 'Lab procedure', variation: 'Show a ready-to-run variation',
    model: 'Compare a model answer', exit: 'Exit ticket',
    traceModel: 'Compare a three-sentence explanation', exitModel: 'Compare a sample exit answer',
    heapNext: 'Next', heapPrevious: 'Previous',
  },
  {
    code: 'tr', path: 'tr/', run: 'Python 1 kodunu çalıştır', stop: 'Durdur', stopped: /^Durduruldu\./, finished: 'Tamamlandı',
    edit: 'Kodu düzenle', minutes: 'dk', plan: /^180 dakika · .*10 dk ara/,
    worked: 'Çözüm adımlarını göster', procedure: 'Deney adımları', variation: 'Kopyalanabilir deney kodu',
    model: 'Örnek çözümü karşılaştır', exit: 'Çıkış sorusu',
    traceModel: 'Üç cümlelik örnek açıklama', exitModel: 'Örnek çıkış yanıtı',
    heapNext: 'Sonraki', heapPrevious: 'Önceki',
  },
];

function measurementLabels(result) {
  return result.split('\n').flatMap(line => {
    const match = line.match(/^(.+?)\s+\d+\.\d+ ms\s+\d+\.\d+ ms\s*$/);
    return match ? [match[1]] : [];
  });
}

async function checkHeapDiagram(diagram, operation, frames, language) {
  const previous = diagram.getByRole('button', { name: language.heapPrevious, exact: true });
  const next = diagram.getByRole('button', { name: language.heapNext, exact: true });
  const visibleFrame = diagram.locator('.heap-frame:visible');
  const last = frames.length - 1;

  async function checkFrame(index, direction) {
    const position = `${index + 1} / ${frames.length}`;
    await test.step(`Heap ${operation}: ${direction}, frame ${position}`, async () => {
      await expect(visibleFrame).toHaveCount(1);
      await expect(visibleFrame.locator('svg.heap-tree')).toBeVisible();
      await expect(visibleFrame.locator('svg.heap-tree text')).toHaveText(frames[index]);
      await expect(visibleFrame.locator('.heap-array strong')).toHaveText(frames[index]);
      await expect(diagram.locator('output')).toHaveText(position);
      if (index === 0) await expect(previous).toBeDisabled();
      else await expect(previous).toBeEnabled();
      if (index === last) await expect(next).toBeDisabled();
      else await expect(next).toBeEnabled();
    });
  }

  await expect(diagram.locator('.heap-frame')).toHaveCount(frames.length);
  await checkFrame(0, 'initial');
  for (let index = 1; index <= last; index++) {
    await next.click();
    await checkFrame(index, 'next');
  }
  for (let index = last - 1; index >= 0; index--) {
    await previous.click();
    await checkFrame(index, 'previous');
  }
}

async function checkClassroomSections(page, week, language) {
  const opening = page.locator('section[aria-labelledby="lesson-title"]');
  await expect(opening.getByText(language.plan)).toBeVisible();
  await expect(opening.locator('.eyebrow').getByText(new RegExp(`^15 ${language.minutes} ·`))).toBeVisible();

  for (const [id, minutes] of Object.entries({ paper: 35, timing: 45, studio: 45, 'exam-practice': 25, 'exit-ticket': 5 })) {
    const section = page.locator(`#${id}`);
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(/\S/);
    await expect(section.locator(':scope > .eyebrow')).toHaveText(`${minutes} ${language.minutes}`);
  }

  if (week === 7) {
    const diagrams = page.locator('#heap-basics .heap-diagram');
    await expect(diagrams).toHaveCount(2);
    await checkHeapDiagram(diagrams.first(), 'insertion', [
      ['4', '9', '7'],
      ['4', '9', '7', '3'],
      ['4', '3', '7', '9'],
      ['3', '4', '7', '9'],
    ], language);
    await checkHeapDiagram(diagrams.last(), 'removal', [
      ['3', '4', '7', '9'],
      ['9', '4', '7'],
      ['4', '9', '7'],
    ], language);
    await expect(page.locator('#robot-timers table').last().locator('tbody tr')).toHaveCount(19);
    await expect(page.locator('#midterm-card table tbody a')).toHaveCount(7);
  } else {
    await expect(page.locator('#concepts .concept-frames li').nth(2)).toBeVisible();
    await expect(page.locator('#common-mistakes .concept-glossary dt')).toHaveCount(3);
  }

  const paper = page.locator('#paper');
  await expect(paper.getByText(language.traceModel, { exact: true })).toBeVisible();
  for (const heading of await paper.getByRole('heading', { level: 3 }).all()) {
    await expect(heading).toHaveText(/\S/);
  }
  await paper.getByText(language.worked, { exact: true }).click();
  const workedSteps = paper.locator('details[open] ol > li');
  await expect(workedSteps).toHaveCount(3);
  for (const step of await workedSteps.all()) {
    await expect(step).toBeVisible();
    await expect(step).toHaveText(/\S/);
  }

  const timing = page.locator('#timing');
  await expect(timing.getByRole('heading', { name: language.procedure, exact: true })).toBeVisible();
  await expect(timing.locator(':scope > ol > li')).toHaveCount(3);
  const studio = page.locator('#studio');
  await expect(studio.locator('h2 + p')).toHaveText(/\S/);
  await expect(studio.locator(':scope > ol > li')).toHaveCount(3);
  await studio.getByText(language.model, { exact: true }).click();
  const answer = studio.locator('details[open] > p');
  await expect(answer).toBeVisible();
  await expect(answer).toHaveText(/\S/);
  await expect(page.locator('#exam-practice .practice-list > li')).toHaveCount(3);
  await expect(page.locator('#drills .practice-list > li')).toHaveCount(5);
  const exit = page.locator('#exit-ticket');
  await expect(exit.getByRole('heading', { name: language.exit, exact: true })).toBeVisible();
  await expect(exit.locator('h2 + p')).toHaveText(/\S/);
  await exit.getByText(language.exitModel, { exact: true }).click();
  const exitAnswer = exit.locator('details[open] > p');
  await expect(exitAnswer).toBeVisible();
  await expect(exitAnswer).toHaveText(/\S/);
}

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
      test(`Week ${week} classroom sections, timing lab and variation`, async ({ page }) => {
        const lab = await openLab(page, week, language);
        await test.step('Verify the three-hour lesson sections', async () => {
          await checkClassroomSections(page, week, language);
        });
        await test.step('Run the starter lab', async () => {
          await lab.run.click();
          await expect(lab.status).toHaveText(language.finished);
          await expect(lab.run).toBeEnabled();
          const result = await lab.output.innerText();
          for (const expected of output) {
            expect(result).toContain(expected);
          }
          expect(measurementLabels(result)).toHaveLength(timingRows);
        });
        await test.step('Append and run the published variation', async () => {
          const timing = page.locator('#timing');
          await timing.getByText(language.variation, { exact: true }).click();
          const snippet = timing.locator('.lab-variation code');
          await expect(snippet).toBeVisible();
          await expect(snippet).toHaveText(/\S/);
          await timing.getByRole('button', { name: language.edit, exact: true }).click();
          const editor = timing.locator('.py-editor');
          await editor.fill(`${await editor.inputValue()}\n\n${await snippet.textContent()}`);
          await lab.run.click();
          await expect(lab.status).toHaveText(language.finished);
          await expect(lab.run).toBeEnabled();

          const result = await lab.output.innerText();
          const { lines: expectedLines = [], measurements: expectedMeasurements = [] } = variations[week];
          const lines = result.split('\n');
          for (const line of expectedLines) {
            expect(lines).toContain(line);
          }
          // Check labels and row counts while letting measured times vary by machine.
          const measurements = measurementLabels(result);
          expect(measurements).toHaveLength(timingRows + expectedMeasurements.length);
          expect(measurements.slice(timingRows)).toEqual(expectedMeasurements);
        });
        expect(lab.errors).toEqual([]);
      });
    }

    test('Week 8 worked reminders and small route example', async ({ page }) => {
      await page.goto(`w8/${language.path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.week-reminder')).toHaveCount(7);
      await expect(page.locator('svg.bfs-grid')).toHaveCount(5);
      const cell = page.locator('#python-example-2');
      await cell.getByRole('button', {
        name: language.code === 'en' ? 'Run Python 2' : 'Python 2 kodunu çalıştır',
        exact: true,
      }).click();
      await expect(cell.getByRole('status')).toHaveText(language.finished);
      await expect(cell.locator('.py-output')).toHaveText(
        'Moves: 2\nPath: [(0, 0), (0, 1), (1, 1)]\n'
      );
      const links = page.locator('.week-reminder h3 a');
      for (let week = 1; week <= 7; week++) {
        await expect(links.filter({ hasText: new RegExp(' ' + week + '$') })).toHaveCount(1);
      }
    });


    test('Week 9 cost updates, reminders and small graph', async ({ page }) => {
      await page.goto(`w9/${language.path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.week-reminder')).toHaveCount(8);
      await expect(page.locator('svg.route-svg')).toHaveCount(2);
      const cell = page.locator('#python-example-2');
      await cell.getByRole('button', {
        name: language.code === 'en' ? 'Run Python 2' : 'Python 2 kodunu çalıştır',
        exact: true,
      }).click();
      await expect(cell.getByRole('status')).toHaveText(language.finished);
      await expect(cell.locator('.py-output')).toHaveText(
        'Settle: S 0\nSettle: B 2\nSettle: A 3\nSkip stale: A 5\nSettle: G 6\nCost: 6\nPath: S -> B -> A -> G\n'
      );
      const links = page.locator('.week-reminder h3 a');
      for (let week = 1; week <= 8; week++) {
        await expect(links.filter({ hasText: new RegExp(' ' + week + '$') })).toHaveCount(1);
      }
    });

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
