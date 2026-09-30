# Website verification

## Product-focus carousel revision — 30 September 2026

- Replaced the live extruded wordmark with the original coconut icon. Cards and their lettering are larger, with additional model float and tilt. One foreground card holds focus for 3.8 seconds, followed by a 0.82-second snap to the next product.
- Removed the annotated controls strip and product index. Renamed the shared navigation to Products and About me, including narrow screens. The About me introduction uses first-person copy.
- The compact top button pauses automatic rotation while model animation continues. Browser observations recorded an unchanged phase with an increasing idle-animation clock while paused.
- Wheel input now scrolls the page only. In the browser, an active carousel stayed at phase 0 while a wheel gesture moved the page by 338px. A separate paused check moved the page by 512px without changing the phase.
- Dragging at phone width did not navigate. With automatic rotation paused, releasing settled exactly onto Haste; keyboard activation opened its correct product page.
- Forced reduced-motion startup produced a fixed phase, zero idle-animation time and a Resume automatic rotation button. Explicit resume enabled rotation and synchronized the footer's global motion control.
- Ten tests pass: six carousel timing/selection tests and four motion preference/control tests. Static verification covers eight pages, 225 local references, all four animated product GLBs and the existing release records. Syntax and whitespace checks pass.
- Desktop and responsive browser inspection covers the user's 846 × 930 preview, 390 × 844 and 320 × 760. The featured card remains readable and the document has no horizontal overflow. Neighbouring cards intentionally peek beyond the scene edge on narrow screens.
- The original Blender product sources are retained. The old extruded wordmark remains an unused design study and is no longer loaded or required by the website. This remains a local revision.

## Automatic 3D orbit revision — 30 September 2026

- The homepage has one WebGL scene with four cards, four original Blender animation clips and a new Blender-built Kokonut wordmark. The previous horizontal gallery and its controller have been removed.
- Eight current tests pass: five orbit-controller tests and three motion-preference tests. Static verification passes for eight HTML pages, 229 local references, all five GLBs, four rendered fallbacks and the unchanged Android release records. Module syntax and whitespace checks pass.
- Browser observations confirmed automatic rotation without input, immediate drag and wheel takeover, a stationary page during wheel control, delayed automatic recovery, and no navigation after a drag.
- Pointer selection opened the pedal concept page. Keyboard activation opened SideQuest, Haste and Revisen and exposed their exact existing GitHub APK links. Arrow navigation moves focus and brings the corresponding card forward. Pause synchronizes both controls and freezes the scene.
- Responsive previews were inspected at 320 × 760, 390 × 844, 768 × 1024 and 1440 × 900, with no document overflow. Dragging also worked at phone width. The narrow header and project index were adjusted to fit.
- An isolated local QA server forced the reduced-motion preference: the initial angle remained fixed, the control read Resume animations, and Next still brought Haste forward while paused.
- The same isolated server forced WebGL initialization failure: rendered card artwork and all four anchors remained, without a canvas. A page served without website scripts also displayed all four cards; its Haste link opened the correct page. QA overrides exist only in the ignored artifacts folder and are not part of the website.
- Normal previews reported no browser errors or warnings. All assets load under the production CSP. The existing project-page models remain independent of the new homepage renderer.
- New source: art/kokonut-wordmark.blend, art/build_wordmark.py and the local SIL-licensed font instance. The existing art/kokonut-collection.blend and animated models are retained. The Blender rebuild command now rebuilds the wordmark too.
- Screenshots: artifacts/orbit-desktop.png and artifacts/orbit-mobile.png. Preview: http://localhost:4173/.

Scope: local working changes, not a deployment. Desktop browser input was used at responsive sizes; physical touch hardware was not tested. Forced startup failure verifies the static fallback, not a physical GPU failure. Earlier APK response checks below remain applicable; release metadata and download URLs were not changed.

## Earlier horizontal portfolio redesign — 30 September 2026

- All eight pages pass static checks, including 224 local references, unique IDs, footer navigation, fonts and unchanged Android release metadata.
- All four GLBs have valid headers, embedded textures and actual Blender animation channels. All four WebP fallbacks exist; combined poster size is about 144 KB.
- Six current regression tests pass: gallery bounds, deliberate swipes versus click movements, inertia, initial reduced motion, synchronized controls, and preference updates/cleanup.
- All eight routes were checked at 320px without document overflow or broken loaded images. The home gallery and Haste page were visually inspected at 390px. The pedal concept was inspected at 768px. The desktop collection was inspected at 1280px, with all navigation controls fitting the 720px-tall viewport.
- Browser dragging at desktop and mobile widths changed the project without opening its link. Clicking the Haste and pedal cards opened the correct pages. Project selectors and the End key reached the fourth project. Pause controls updated together. Release-checksum disclosure and the Haste APK link were verified.
- All four live models reached the ready state under the actual production CSP. No browser errors or warnings were reported during that check. The local server serves the same policy as `dist/_headers`.
- All three public APK URLs returned successful attachment responses, the recorded byte sizes, and the expected ZIP signature via a four-byte range request. No APK download URL, checksum or other release metadata was changed.
- `git diff --check` passes. The saved source Blender file is approximately 2.65 MB and includes editable collection animation loops.
- Browser screenshots are saved locally under `artifacts/` (ignored by Git). The local preview runs at `http://localhost:4173`.

Scope: this is a local redesign on `redesign/interactive-collection`. It has not been pushed or deployed. App installation, backend functionality, physical touch devices and a real pedal were not tested. The pedal is explicitly an early concept, with no prototype or downloadable product. WebGL failure fallback is implemented and its assets checked; no physical GPU-failure test was performed.

## Previous published website

Verified on 17 September 2026.

- Seven HTML documents pass static checks: homepage, three app pages, releases, privacy and 404.
- 179 local href/src references resolve, including anchors; CSS references resolve to local font assets.
- Dedicated app pages checked in-browser at 320, 768 and 1440 CSS pixels: no document or heading overflow and no broken images.
- Home, SideQuest mobile page and Haste tablet page inspected visually, including the coconut mark. Homepage geometry checked at 320, 390, 768 and 1440 CSS pixels without overflow. Navigation from the homepage to SideQuest and release checksum expand/copy interactions passed in the browser.
- Three APKs passed Android `apksigner verify`. Android package, versions, minimum SDK 24 and ARMv7/ARM64/x86-64 architectures were read from each APK using `aapt`.
- All three uploaded GitHub Release assets match their local SHA-256 hashes and sizes. The release is public and tagged `android-test-2026-09-17`.
- Local fonts are shipped with their SIL Open Font Licenses. The website uses no client analytics, third-party fonts, form submissions or local storage.
- The design refinement uses the official source-project app icons, the retained original coconut, capitalized Kokonut wordmarks, shorter copy, consistent illustrated app panels and centered help. See [icon provenance](APP-ICONS.md).
- Four motion regression tests passed. Responsive geometry was rechecked for the redesigned home and app pages, with no clipped headings or broken images. FAQ expand, scroll animation, pause and resume passed in-browser. See [motion behavior and validation](MOTION.md).
- Every HTML page, including privacy and 404, now contains the complete footer navigation. Static checks enforce links to all six content pages. Footer links also provide downloads and installation help. Cross-page navigation from the 404 footer to homepage downloads was verified.
- The banner now repeats continuously with complete edge coverage through 2560px. Hero cards use their previous hover/focus lift and the sticker is gone. Help disclosures animate and handle rapid reversal, keyboard use, resize and motion-off native operation. The download button retains dark text over its highlighted background.

Limits: no physical Android installation was performed in this website task. Signature, binary metadata and download verification do not prove every app feature works. SideQuest live account flows were not retested. Haste AI/lookup and Revisen learning features require their own configured backend. The website does not activate those services.

See [deployment verification](DEPLOYMENT.md) for the live domain, HTTPS, routes, public APK response checks and exact published source revision.
