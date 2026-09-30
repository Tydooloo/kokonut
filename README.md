# Kokonut

Independent software and curious hardware. A portfolio for **SideQuest**, **Haste**, **Revisen**, and the **VST Pedal** hardware concept.

Four product cards move around the original Kokonut coconut icon in one live 3D scene. A larger foreground card holds focus for 3.8 seconds, followed by a snappy 0.82-second transition to the next product. Blender models float and tilt more visibly inside the cards. Dragging or keyboard input selects a product; page scrolling never drives the carousel. A small pause button stops automatic rotation while the floating models continue. Every card opens its own page. The pedal is explicitly a concept; no prototype, compatibility or download is claimed.

## Preview locally

```sh
node scripts/serve.mjs
```

Open **http://localhost:4173**. No package installation or frontend build is required. The server uses the production security headers.

## Edit the website

- `scripts/content.mjs` — project names, descriptions, features and setup notes.
- `scripts/build.mjs` — all eight HTML pages and the sitemap.
- `scripts/layout.mjs` — common header, footer and document metadata.
- `dist/styles.css` — the complete responsive visual system.
- `dist/orbit.mjs` — homepage scene, perspective card links, Blender playback, gestures and keyboard access.
- `dist/orbit-motion.mjs` — product reading intervals, timed snap transitions and manual selection.
- `dist/scenes.mjs` — independent model views on the project detail pages.
- `dist/motion.mjs` — reduced-motion preference and synchronized pause controls.
- `dist/releases/manifest.json` — existing Android release metadata; the redesign leaves it unchanged.

After changing page content or release data, run `node scripts/build.mjs`. The older `render-app-pages.mjs` and `render-releases.mjs` commands delegate to this build, so they cannot restore the previous design.

## Blender source

Open **`art/kokonut-collection.blend`** in Blender. It contains four original product sculptures, packed screen textures, studio lighting, a camera, and editable animation actions. The app interfaces are illustrative, not actual screenshots. The pedal is a concept rendering.

`art/build_scene.py` recreates the scene and exports a separate animated GLB for each project. Runtime assets are in `dist/assets/3d/`; small WebP posters provide immediate artwork and a no-WebGL fallback.

The centre uses the existing `dist/favicon.svg` coconut icon without altering its artwork. The earlier `art/kokonut-wordmark.blend` is retained as an unused design study; the live scene does not load its GLB.

To rebuild on Windows with Blender 4.5 and Python with Pillow:

```powershell
./scripts/build-art.ps1 -Blender 'C:/path/to/blender.exe' -Python 'C:/path/to/python.exe'
node scripts/build.mjs
```

The texture generator uses the system Arial font to rasterize illustrative interfaces. It does not distribute that font. Web fonts remain the repository's existing, locally hosted DM Sans assets and licenses.

Three.js 0.180.0 and its MIT license are vendored locally. `node scripts/vendor-three.mjs` refreshes that exact pinned version. The website does not contact a CDN at runtime.

## Verification

```sh
node scripts/check.mjs
node --test scripts/orbit.test.mjs scripts/motion.test.mjs
node scripts/verify-downloads.mjs
git diff --check
```

Static checks cover pages, anchors, assets, all four embedded GLB animations, concept status and the existing release records. Public download checks verify status, byte sizes, attachment headers and APK signatures at the start of each file. They do not install or exercise the apps.

See `docs/REDESIGN.md` for design and browser verification notes. `docs/DEPLOYMENT.md` records the hosting setup and publication workflow for kokonut.cc.
