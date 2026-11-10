# Kokonut

The website for **Kokonut**, an independent studio: [kokonut.cc](https://kokonut.cc).

It presents two products:

- **Haste**, the food journal. Version 1.2.10 is in closed testing on Google Play; the iPhone version is in preparation.
- **VST Pedal**, a hardware concept for running Windows VST plug-ins on stage. No prototype exists; the site says so.

SideQuest and Revisen were retired from the site in November 2026. Their pages, art and downloads remain in Git history.

## What's on the page

- **Particle hero.** 16,000 GPU particles morph between the Kokonut coconut, Haste's leaves (sampled from the real app icon) and the pedal. They react to the pointer and scatter as you scroll.
- **3D phone.** A phone modelled in code shows real Haste screens. On desktop, the phone stays pinned while three story steps scroll past and switch its screen. Drag to spin it.
- **Playable pedal.** A modelled stompbox whose knobs turn, whose footswitch stomps and whose LED and display react to live audio. **Play** synthesises an original riff in the browser (Karplus–Strong strings → drive → tone → tape delay → plate reverb) with the Web Audio API.

Everything is served from this repository. There's no CDN, analytics, cookie or framework at runtime, and no build step for the browser code.

## Preview locally

```sh
node scripts/serve.mjs
```

Open **http://localhost:4173**. The server applies the production security headers from `dist/_headers`.

## Where things live

| Path | What it is |
|---|---|
| `scripts/content.mjs` | Every product claim: Haste features, platforms, FAQ, pedal questions and roadmap |
| `scripts/build.mjs` | Generates all pages from shared components. Run after any content change |
| `scripts/layout.mjs` | Document head, header, footer and the word-by-word heading helper |
| `scripts/icons.mjs` | The site's original line icons |
| `dist/styles.css` | The complete visual system |
| `dist/js/main.js` | Site behaviour; lazy-loads the 3D modules when their section is near |
| `dist/js/stage.js` | Shared WebGL setup: renderer, lighting, resize, sleep when off-screen |
| `dist/js/particles.js`, `shapes.js` | Hero shader and the point-cloud sculptures |
| `dist/js/phone-3d.js` | The phone |
| `dist/js/pedal-*.js` | Pedal state, UI, audio engine, DSP maths and 3D model |
| `dist/releases/manifest.json` | The archived Haste test APK's size and checksums |

After editing content, run `node scripts/build.mjs`. CI fails if the committed pages don't match a fresh build.

## Haste assets

`scripts/prepare-haste-assets.py` copies Haste's current icon, three real app screens (rendered with demo data) and its Bricolage Grotesque typeface from the Haste repository. It needs Pillow, fontTools and brotli:

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

`check.mjs` covers every page, link, anchor, asset and module import, and it confirms nothing loads from a third party. The tests cover the sculptures, knob and tone maths, the drive curve, the string synthesis and the heading helper. `node scripts/verify-downloads.mjs` checks the archived APK's public download.

## Deployment

Pushing to GitHub doesn't redeploy the site. See `docs/DEPLOYMENT.md`.

Three.js 0.180.0 (MIT) is vendored in `dist/vendor/three`. Fonts are DM Sans and Bricolage Grotesque, both under the SIL Open Font License (`docs/licenses/`).
