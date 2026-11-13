# Kokonut

The website for **Kokonut**, an independent studio: [kokonut.cc](https://kokonut.cc).

One domain, five separately designed places:

| Address | What it is | Look |
|---|---|---|
| `/` | The studio hub: the three products on a 3D turntable | Takes on the colours of whichever product is in front |
| `/haste/` | **Haste**, the AI calorie tracker | Pale sage and forest green; one phone that travels down the page |
| `/burble/` | **Burble**, the AI notebook | Black ink on paper; loose notes that file themselves |
| `/cairn/` | **Cairn**, the universal pedal | A gig poster on a dark stage; a pedal that is still a question mark |
| `/aaron/` | **Aaron Ko's portfolio** | Dark and editorial; a colour portrait with the projects on a ring curving behind it |

`/haste/support/` (the App Store support URL), `/privacy/` and the 404 page are plain utility pages.

The site presents Haste and Burble as released on the App Store and Google Play, and Burble as a web app too. Cairn is presented as a concept with a waitlist: development has not started, so its page is short and its 3D model is deliberately a placeholder. See "Before going live" below.

## What's on the pages

- **Hub.** A phone, a handful of notes and the Cairn placeholder, all modelled in code, on a turntable. Drag it, use the arrows or the tabs.
- **Haste.** The phone flies between sections as you scroll, turns as it goes and shows the screen each section talks about. Macro-coloured orbs and leaves orbit it. A try-it demo estimates a sample meal.
- **Burble.** Thirty notes, each drawn in code, float around the headline and dodge the cursor. Scrolling files them into three stacks, then a search pulls one back out. The cursor leaves ink on the page. A demo files whatever you type.
- **Cairn.** A dark slab with glowing edges, sketched outlines for controls and a large "?" floating above it, under a spotlight. One short description: a universal pedal that brings your production sounds live, and not just a guitar pedal.
- **Portfolio.** A colour cut-out portrait stands in the middle of the hero. Project covers, drawn in code, circle on a 3D ring that passes behind the head; the ring turns on its own and faster as you scroll, and the portrait shifts slightly against the cursor.

Everything is served from this repository. There's no CDN, analytics, cookie or framework at runtime, and no build step for the browser code.

## Preview locally

```sh
node scripts/serve.mjs
```

Open **http://localhost:4173**. The server applies the production security headers from `dist/_headers`.

## Where things live

| Path | What it is |
|---|---|
| `scripts/content.mjs` | Every claim and link: products, store links, the portfolio's projects and bio |
| `scripts/build.mjs` | Generates all pages. Run after any content change |
| `scripts/layout.mjs` | The document shell, the footer, and each world's typefaces and colours |
| `dist/css/base.css` | Shared typefaces, reset, entrance motion, store buttons |
| `dist/css/<world>.css` | One stylesheet per world: `hub`, `haste`, `burble`, `cairn`, `aaron`, `plain` |
| `dist/js/core.js` | Shared behaviour: reveals, motion toggle, scroll and pointer helpers |
| `dist/js/<world>.js` | One script per world, holding its scene |
| `dist/js/model-phone.js`, `model-pedal.js`, `model-paper.js` | The 3D objects, shared by the product pages and the hub |
| `dist/js/covers.js` | Project cover art for the portfolio |
| `dist/js/stage.js` | Shared WebGL setup: renderer, resize, sleep when off-screen |

After editing content, run `node scripts/build.mjs`. CI fails if the committed pages don't match a fresh build.

## Before going live

- **App Store links.** `links.hasteIos` and `links.burbleIos` in `scripts/content.mjs` are placeholders. Replace them with the real listing URLs.
- **Burble web app.** `links.burbleWeb` points to `https://burble.kokonut.cc`. Change it if the app lives elsewhere.
- **Portrait.** `dist/assets/aaron/portrait.webp` is the hero portrait, cut off its grey backdrop. To replace it, save a 4:5 cut-out on a transparent background, about 900 × 1125, with the figure running off the bottom edge, over the same file.
- **Portfolio details.** The bio, projects and skills in `aaron` are written from the project repositories. Add degree, year and anything else worth showing.

## Haste assets

`scripts/prepare-haste-assets.py` copies Haste's current icon and three real app screens (rendered with sample data) from the Haste repository. It needs Pillow:

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

`check.mjs` covers every page, link, anchor, asset and module import, confirms nothing loads from a third party, and checks that each page has the hooks its scene needs. The tests cover the demo numbers, the Burble sample notes, the Cairn page's concept wording, the store links and the heading helper.

## Deployment

Pushing to GitHub doesn't redeploy the site. See `docs/DEPLOYMENT.md`.

Three.js 0.180.0 (MIT) is vendored in `dist/vendor/three`. Fonts are Geist, Instrument Serif, Newsreader and Anton, all under the SIL Open Font License (`docs/licenses/`); `node scripts/vendor-fonts.mjs` refreshes them. The logo is `dist/assets/logo.svg` (also the favicon).
