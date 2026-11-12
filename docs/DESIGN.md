# Design notes

## Direction (November 2026)

kokonut.cc is the company site for Kokonut and its one product, Haste. Each topic has its own page, and navigation never jumps around a long page:

| Page | Purpose |
|---|---|
| `/` | The studio in one screen, a Haste feature with the 3D phone, principles, beta call-to-action |
| `/haste/` | Haste overview: scroll story, try-it demo, features, privacy |
| `/haste/get/` | Platforms, how to join the beta, the archived APK |
| `/haste/support/` | FAQ, support email, privacy policy and account deletion links (the App Store support URL) |
| `/about/` | The studio, principles, numbers, stack |
| `/contact/` | Email and contact routes |

Haste pages share a sub-navigation (Overview · Get Haste · Support). The main navigation marks the current section.

## Identity

- **Logo.** A geometric halved coconut: a brown bowl, a dark lip shadow and a cream cut face with a tan cavity, tilted −16°. Flat colours, no outlines, so it reads at 16 px. `dist/assets/logo.svg` and `dist/favicon.svg` are the same file. The wordmark is lowercase "kokonut" set in Geist.
- **Type.** Geist for everything, Geist Mono for small labels, and Instrument Serif italic for the emphasised words in headings.
- **Colour.** Near-black with warm cream type. Coconut cream is the studio accent, and Haste's sage green is the product accent. Sections set `--accent`, so cards, icons and highlights follow.

## Motion

Headings rise in word by word, and cards fade up in a stagger. A soft light follows the pointer across cards, and primary buttons lean gently toward it. The header tucks away while you read downwards, and a progress line runs along the top. Pages cross-fade with the View Transitions API while the header stays in place. Everything respects `prefers-reduced-motion`, and the footer's **Pause motion** stops it for the visit.

## Interactive pieces

**Hero particles** (`particles.js`, `shapes.js`). One `THREE.Points`; the GPU does the work. Each point stores its position in both sculptures (the coconut and Haste's leaves, sampled from the app icon at runtime), and the shader blends them with a per-point delay. The canvas has its own grid column, sized to fit the sculpture. On phones it sits above the headline. It never overlaps text.

**Phone** (`phone-3d.js`). An extruded, bevelled body with glass, a camera plateau and the Haste mark on the back, showing real app screens. Drag to spin it; it eases back to rest. On the Haste page it's sticky beside the story steps.

**Try-it demo** (`demo.js`). Three sample meals with example numbers (checked in tests against 4/4/9 kcal per gram). It shows the feel of capture → estimate → review → save, and says plainly that the numbers are examples.

## Robustness

- 3D and the demo load only when their section is near. Render loops sleep off-screen or in background tabs.
- Without WebGL, the hero shows the logo and the phone shows a styled screenshot that still switches screens.
- If the main script never runs, `boot.js` reveals all hidden content after 4 s.
- The CSP allows only same-origin scripts, so there are no inline scripts.

## Honesty rules

- Haste's status comes from the Haste repository's `docs/STATUS.md`, and feature copy follows `docs/APP_STORE_LISTING.md`.
- Demo numbers are labelled as examples. The archived 1.0.0 APK is marked as superseded by the Play version.
