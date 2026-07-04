# Antibiogram Trainer

A drag-and-drop game for memorizing the antibiogram (which antibiotics cover which germs, and
from which family). Based on the aetherist/antibiogram chart in
[`references/antibiogram.jpg`](references/antibiogram.jpg).

Each round you get one antibiotic and drag a block onto the correct cell — its **family row ×
each germ it covers**. Cover several germs, get one block per germ. Right placements lock in with
a solid outline; misses reveal the correct spot with a dashed outline (no penalty drama). Skip to
reveal an answer, End anytime for a scorecard with a mistake log that tracks repeated confusions
across sessions.

## Run

```bash
npm install
npm run dev      # http://localhost:5173  (append #play to jump straight into a session)
npm run build    # typecheck + production build to dist/
npm run test     # scoring + dataset-integrity + app smoke tests (Vitest)
```

## Data

The chart data lives in [`src/data/antibiogram.ts`](src/data/antibiogram.ts) (the source of
truth) with a human-readable copy in
[`references/antibiogram-data.md`](references/antibiogram-data.md). Both were pixel-verified from
the source image. All colors are CSS variables in `src/styles/theme.css` — no hardcoded colors in
components.

Settings (celebration mode, try-again toggle) persist in `localStorage`. See
[`FUTURE.md`](FUTURE.md) for planned work.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages at
<https://yaniv-kaplan.github.io/antibiogram/> via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Vite's `base` is set to
`/antibiogram/` for production builds so asset paths resolve under the repo subpath.

One-time setup: in the repo **Settings → Pages**, set **Source** to **GitHub Actions**.
