# AA timing lab checks

GitHub Actions runs this suite after each successful Pages deployment from
`main`. To run it manually against the live site, select **Run workflow** in
**Actions → Check deployed AA labs**.

Run locally from this directory with Node.js 24.

```sh
npm ci
npx playwright install chromium
npm test
```

Set `AA_BASE_URL` to test another copy of the course. Include the trailing
slash, for example `http://localhost:8473/aa/`.
