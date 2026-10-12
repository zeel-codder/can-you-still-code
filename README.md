# Can You Still Code?

A small browser game for the AI era: 3 random levels (~5 minutes) from a pool of 10, all hand-written JavaScript with no AI, no autocomplete and no paste. At the end you get an "AI-free coding score", a rank and a roast, plus a share image for X and other social media.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # checks every level's solution, the predict answers and the scoring
npm run build    # static site in dist/
```

## Deploy

Deploys to Cloudflare Workers: `npm run deploy`. `npm run preview` builds and runs it locally with Wrangler.

No domain is hard-coded. The share card and share text use the page's own address, and a tiny Worker (`worker/index.ts`) fills the site's address into the link-preview tags for whatever domain serves it. Point any domain or subdomain at the Worker and previews just work.

## Link previews

`index.html` has Open Graph and X/Twitter card tags, so links show a rich preview on WhatsApp, X, LinkedIn, Facebook, Discord, Slack, Telegram and iMessage. Crawlers need absolute URLs, so the tags use a `__SITE_ORIGIN__` placeholder that the Worker replaces on each request. The preview image is `public/og-image.png` (1200×630). After deploying, you can check the preview with LinkedIn's Post Inspector, Facebook's Sharing Debugger or opengraph.xyz.

## Adding a level

Each run plays one problem per tier, picked at random from the pool. "Run it back" always picks different ones. Add a problem to the tier's file:

- `src/levels/write.ts` (tier 1) and `src/levels/fix.ts` (tier 2): code levels need `fnName`, `starterCode`, `tests` and a reference `solution`.
- `src/levels/predict.ts` (tier 3): a template with a `generate(rand)` function that returns a `snippet` and its `expectedOutput`, using the seeded `rand` so values change every run.

`npm test` proves every solution passes, every starter fails, and every predict template's answer matches what JS really logs across 300 random seeds.
