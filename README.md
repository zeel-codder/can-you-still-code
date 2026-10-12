# Can You Still Code?

A small browser game for the AI era: 3 random levels (~5 minutes) from a pool of 10, all hand-written JavaScript with no AI, no autocomplete and no paste. At the end you get an "AI-free coding score", a rank and a roast, plus a share image for X and other social media.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # checks every level's solution, the predict answers and the scoring
npm run build    # static site in dist/
```

## Deploy (Netlify)

1. On Netlify: **Add new site → Import an existing project → GitHub →** pick this repo.
2. Leave the settings alone: `netlify.toml` already sets the build command (`npm test && npm run build`), the `dist` folder and Node 22.
3. Optional: **Domain management → Add a domain** for a custom (sub)domain, then trigger a redeploy so link previews use it.

Every push to `main` redeploys automatically, and pull requests get their own preview URL. Tests run first, so a failing commit never goes live.

No domain is hard-coded: the share card and share text use the page's own address, and the link-preview tags get the site's address from Netlify during the build.

## Link previews

`index.html` has Open Graph and X/Twitter card tags, so links show a rich preview on WhatsApp, X, LinkedIn, Facebook, Discord, Slack, Telegram and iMessage. Crawlers need absolute URLs, so the tags use a `__SITE_ORIGIN__` placeholder that `vite.config.ts` replaces with Netlify's `URL` (production) or `DEPLOY_PRIME_URL` (branch and preview deploys). Local builds leave them relative. The preview image is `public/og-image.png` (1200×630). After deploying, you can check the preview with LinkedIn's Post Inspector, Facebook's Sharing Debugger or opengraph.xyz.

## Adding a level

Each run plays one problem per tier, picked at random from the pool. "Run it back" always picks different ones. Add a problem to the tier's file:

- `src/levels/write.ts` (tier 1) and `src/levels/fix.ts` (tier 2): code levels need `fnName`, `starterCode`, `tests` and a reference `solution`.
- `src/levels/predict.ts` (tier 3): a template with a `generate(rand)` function that returns a `snippet` and its `expectedOutput`, using the seeded `rand` so values change every run.

`npm test` proves every solution passes, every starter fails, and every predict template's answer matches what JS really logs across 300 random seeds.
