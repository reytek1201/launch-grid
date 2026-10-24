# LaunchGrid restaurants

Next.js site for restaurant clients. One deploy per client; the demo is Trattoria Cinque Lune (fictional).

```
npm install
npm run dev -- -p 3100     # http://localhost:3100
npm run lint
npm run build
npm run images             # PNG masters in clients/demo/assets/incoming -> public/demo/*.jpg
node scripts/build-manifest.mjs   # rebuild clients/demo/images.json (alt text comes from assets/image-log.md)
```

- Data comes from `clients/demo/fixtures/trattoria.ts` (typed `SiteData` in `lib/types.ts`).
- Original PNGs stay out of git (`clients/*/assets/incoming/`); the site serves the optimized JPGs in `public/demo/`.
- Image log and exact prompts: `clients/demo/assets/image-log.md`, `prompts.md`.
- Plans: `../docs/restaurant-build-plan.md`, `../docs/trattoria-site-plan.md`.
- Next.js here is 16.x. Read `node_modules/next/dist/docs/` before relying on older habits.
