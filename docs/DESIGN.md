# Design notes

## Direction (November 2026)

kokonut.cc holds five places that share a domain and a footer and nothing else. Each has its own palette, typeface, motion and 3D scene, so a visitor to one never feels they are on a template.

| Page | Idea | Palette | Type |
|---|---|---|---|
| `/` hub | Three products on a turntable; the page becomes the one in front | Borrowed from the active product | Geist; each name in its own product's face |
| `/haste/` | Fresh and light; one phone that follows you down the page | Pale sage `#eef2e9`, forest `#0e1b14`, mint `#a9d2bd` | Geist with Instrument Serif italic |
| `/burble/` | Black ink on paper, as in the app's own design notes | Paper `#fbfaf7`, ink `#191919`, hairlines only | Newsreader with Geist |
| `/cairn/` | A gig poster on a dark stage, with the product still a question | Black `#0a0908`, bone `#ede6da`, amber `#ff7a1a` | Anton with Geist |
| `/aaron/` | A dark editorial portfolio | Near-black `#0b0b0c`, warm white, sand `#dcc7a2` | Instrument Serif with Geist |

Labels and buttons are set in an ordinary sans in sentence case. There are no monospaced or letter-spaced capitals: they read as machine-made.

## The scenes

**Hub** (`hub.js`). The phone, a fan of notes and the Cairn placeholder sit on a turntable and always face the camera. Drag, arrows, tabs or the arrow keys turn it; it moves on by itself until someone touches it. Three background layers cross-fade and the text colours follow.

**Haste** (`haste.js`). One fixed canvas over the page. Empty placeholders marked `data-anchor` say where the phone should be; it flies to whichever is most on screen, sized to fit, and makes a full turn on the way. In the story it changes screen and lean with each step. This makes the layout responsive for free: move a placeholder in CSS and the phone follows.

**Burble** (`burble.js`, `model-paper.js`). Thirty sheets with contents drawn in code from a seeded generator. Scroll progress through the tall filing section moves each one from a loose ring to its place on a stack, staggered, then lifts one out for the search. The stacks' positions are read from the page, so the sheets land on the dashed trays at any size. A 2D canvas draws the cursor's ink trail, which fades after a moment.

**Cairn** (`cairn.js`, `model-pedal.js`). Development has not started, so nothing about the hardware is shown as decided. The model is a dark slab with glowing edges, faint outlines where controls might go, a line of light sweeping across it and a large "?" floating above. The page is short on purpose: what it is, that it is not just a guitar pedal, and a waitlist. There is no sound demo.

**Portfolio** (`aaron.js`, `covers.js`). The hero follows the classic dark-portfolio layout: a colour cut-out portrait in the centre standing on the bottom edge, the headline bottom left, a quote bottom right. The portrait is an ordinary image, in front of the canvas and behind the words. The canvas draws only the ring of project cards, placed at eye level so it curves behind the head; cards fade out before they come round the front. There are no particle effects.

## Robustness

- Every scene sleeps when off-screen or in a background tab.
- Without WebGL each page still works: Haste shows screenshots, the portfolio shows the portrait image, the others simply lose their 3D.
- If a page's script never runs, `boot.js` reveals all hidden content after 4 s.
- The CSP allows only same-origin scripts, so there are no inline scripts.
- Everything respects `prefers-reduced-motion`, and each footer's **Pause motion** stops movement for the visit.

## What the pages claim

- Haste and Burble are presented as released on the App Store and Google Play; Burble also as a web app. Store and web links are in `scripts/content.mjs` (`links`); the App Store ones are placeholders until the listings exist.
- Burble's page describes the product in Burble's `docs/PRODUCT.md`.
- Cairn is presented as a concept with a waitlist. The page gives no specifications, prices or dates.
- Demo numbers and filing results are labelled as examples.
