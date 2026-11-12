# Kokonut

The website for **Kokonut**, an independent studio: [kokonut.cc](https://kokonut.cc).

The site is about two things: the studio and its app, **Haste**, a food journal. Version 1.2.10 is in closed testing on Google Play; the iPhone version is in preparation.

Each topic has its own page: Home, Haste (Overview, Get Haste, Support), About and Contact. Earlier projects (SideQuest, Revisen and the VST Pedal concept) were retired in November 2026 and remain in Git history.

## What's on the page

- **Particle hero.** 14,000 GPU particles draw either the Kokonut logo or Haste's leaves, both sampled from the real logo images, and morph from one to the other. A fine dust drifts across the whole width of the hero. The particles react to the pointer and scatter once you've scrolled most of the way past. The logo keeps to its own column, so it never covers text.
- **3D phone.** A phone modelled in code shows real Haste screens. On the Haste page it stays pinned while three story steps scroll past and switch its screen. Drag to spin it.
- **Try-it demo.** Pick a sample meal on the Haste page: it types itself in, Estimate fills the calorie ring and macro bars, Save confirms. Example numbers only, and labelled as such.
- **Page transitions.** Pages cross-fade with the View Transitions API while the header stays put.

Everything is served from this repository. There's no CDN, analytics, cookie or framework at runtime, and no build step for the browser code.

## Preview locally

```sh
node scripts/serve.mjs
```

Open **http://localhost:4173**. The server applies the production security headers from `dist/_headers`.

## Where things live

| Path | What it is |
|---|---|
| `scripts/content.mjs` | Every product claim and the navigation: Haste features, platforms, FAQ, demo meals, principles |
| `scripts/build.mjs` | Generates all pages from shared components. Run after any content change |
| `scripts/layout.mjs` | Document head, header, footer and the word-by-word heading helper |
| `scripts/icons.mjs` | The site's original line icons |
| `dist/styles.css` | The complete visual system |
| `dist/js/main.js` | Site behaviour; lazy-loads the 3D modules when their section is near |
| `dist/js/stage.js` | Shared WebGL setup: renderer, lighting, resize, sleep when off-screen |
| `dist/js/particles.js`, `shapes.js` | Hero shader and the point-cloud sculptures |
| `dist/js/phone-3d.js` | The phone |
| `dist/js/demo.js` | The Haste try-it demo |
| `dist/releases/manifest.json` | The archived Haste test APK's size and checksums |

After editing content, run `node scripts/build.mjs`. CI fails if the committed pages don't match a fresh build.

## Haste assets

`scripts/prepare-haste-assets.py` copies Haste's current icon and three real app screens (rendered with demo data) from the Haste repository. It needs Pillow:

```sh
python scripts/prepare-haste-assets.py ../Haste
```

## Checks

```sh
node scripts/build.mjs
node scripts/check.mjs
node --test scripts/site.test.mjs
git diff --check
```

`check.mjs` covers every page, link, anchor, asset and module import, and it confirms nothing loads from a third party. The tests cover the sculptures, the demo's example numbers, navigation targets and the heading helper. `node scripts/verify-downloads.mjs` checks the archived APK's public download.

## Deployment

Pushing to GitHub doesn't redeploy the site. See `docs/DEPLOYMENT.md`.

Three.js 0.180.0 (MIT) is vendored in `dist/vendor/three`. Fonts are Geist, Geist Mono and Instrument Serif, all under the SIL Open Font License (`docs/licenses/`); `node scripts/vendor-fonts.mjs` refreshes them. The logo is `dist/assets/logo.svg` (also the favicon).
