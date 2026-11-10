# Design notes — November 2026 redesign

## Direction

The site is now Kokonut's company site, not a portfolio grid. It has two products and gives each a moment you can play with, rather than a card.

- **Dark and warm.** A near-black background with cream type. Each product has its own accent: coconut cream for the studio, Haste's sage green, and the pedal's LED orange. Sections set `--accent`, so cards, icons and highlights follow automatically.
- **Type.** Bricolage Grotesque (Haste's own display face) for headings, DM Sans for text, and a monospace for labels and status.
- **Motion with purpose.** Headings rise in word by word. Cards fade up in a stagger. A soft light follows the pointer across cards, and primary buttons lean gently toward the pointer. The header tucks away while you read downwards. A scroll-progress line runs along the top. Every effect respects `prefers-reduced-motion`, and the footer's **Pause motion** stops them for the visit.

## The three interactive pieces

**Hero particles** (`particles.js`, `shapes.js`). One `THREE.Points` draws every point; the GPU does all the work. Each point stores its position in all three sculptures, and the vertex shader blends between them with a per-point delay, so the morph flows rather than snaps. The Haste sculpture is sampled from the real app icon at runtime. Shapes hold for 6.5 s, and the chips under the hero pick one directly. On phones, the sculpture sits above the headline so text stays readable.

**Phone** (`phone-3d.js`). An extruded, bevelled body with glass, a camera plateau and the Haste mark on the back. The screens are real app screens, cross-faded on change. Dragging spins it with inertia, and it eases back to its resting pose. On desktop, the phone is sticky beside three story steps; scrolling a step to the centre switches the screen.

**Pedal** (`pedal-*.js`). `PedalState` is the single source of truth for the HTML sliders, the 3D model and the audio. The sliders are real, keyboard-accessible range inputs, so the demo works without WebGL or a mouse. Audio starts only on **Play**, stops when the pedal scrolls away and records nothing.

## Robustness

- 3D modules load only when their section is within a few hundred pixels, and each render loop sleeps while off-screen or in a background tab.
- Without WebGL, the hero shows the coconut mark, the phone shows a styled screenshot that still switches screens, and the pedal shows an illustration with working audio controls.
- A lost WebGL context falls back to the same artwork.
- If the main script never runs, `boot.js` reveals all hidden content after 4 s.
- The CSP allows only same-origin scripts, so there are no inline scripts.

## Honesty rules

- Haste's status (closed testing on Google Play, iPhone in preparation, 1.3 in development) comes from the Haste repository's `docs/STATUS.md`. Feature copy follows `docs/APP_STORE_LISTING.md`.
- The pedal is labelled as a concept everywhere. The audio note says it's a browser synthesis, not a VST host.
- The archived 1.0.0 APK is marked as superseded by the Play version.
