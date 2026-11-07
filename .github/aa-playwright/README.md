# AA timing lab checks

GitHub Actions runs this suite against a local preview of the pull request
merge commit and against the live site after each successful Pages deployment
from `main`. To run it manually against the live site, select **Run workflow**
in **Actions → Check AA timing labs**.

Each weekly test checks the three-hour class sections, runs the starter and
appends the variation shown on the page through the lab editor. Separate
Week 10 tests cover stopping and restarting during Python startup. Both
languages run the same checks.

Run locally from this directory with Node.js 24.

```sh
npm ci
npx playwright install chromium
npm test
```

Set `AA_PREVIEW=1` before running `npm test` to have Playwright serve the
checked-out site files with Python on port 4173. Regenerate the committed
lessons before previewing changes to the course generator.

To test an existing server, set `AA_BASE_URL` instead. Include the trailing
slash, for example `http://localhost:8473/aa/`.
