# Scroll motion

`dist/motion.mjs` progressively enhances the static HTML. It updates a bounded CSS variable on visible scenes; CSS moves phones, orbital graphics, the text strip and coconut accents. The hero cards retain their original quarter-second hover/focus straighten-and-lift effect, independently of scrolling. The studio sticker has been removed. Text and navigation remain in their normal layout.

- Native scrolling is preserved: no wheel interception, scroll locking, pinning or synthetic scroll position.
- One requestAnimationFrame per burst of scroll/resize events. All geometry reads precede style writes. JavaScript does not run an animation loop at rest.
- The banner has three identical, contiguous tiles and a 36-second CSS loop. Its bounded scroll offset remains on the outer wrapper. Each tile is at least one viewport wide, keeping both edges covered over the full animation cycle. The CSS loop pauses offscreen and respects the motion switch and system reduced motion.
- IntersectionObserver limits updates to visible and soon-visible scenes. Hidden tabs cancel pending frames. Resize, font readiness and restored pages request a fresh measurement.
- System reduced motion disables every decorative scroll transform. Preference changes take effect immediately. A footer button can also switch motion off for the current page; no preference is stored or tracked.
- Content is visible before JavaScript runs and stays usable if animation cannot load. Animation imports are isolated from download and checksum controls. Native links, downloads and FAQ disclosures need no JavaScript.
- `dist/accordion.mjs` adds a 260ms height and opacity transition to help disclosures. A new click reverses from the currently rendered height. Resize, visibility and motion-preference changes settle immediately to natural layout. Without motion or Web Animations support, the native disclosure handles clicks and keyboard input.

## Verification

`node --test scripts/motion.test.mjs` runs four regression tests covering bounds, frame batching, read/write ordering, offscreen work, reduced motion, manual pause, visibility, resize, restored pages and cleanup. In the Windows sandbox, use `node --test --test-isolation=none scripts/motion.test.mjs` to avoid a restricted child-process spawn.

Browser checks covered home at 320, 390, 768 and 1440px, and all three app pages at 320, 768 and 1440px. No document/heading overflow or broken images was found. Scroll transforms were observed changing, the footer pause control restored static content and stayed paused through scrolling, and resuming worked. Browser console checks returned no warnings or errors. System preference changes were verified in the controller tests, not by changing the operating system's setting.

The FAQ heading and rows share a centered 800px maximum-width container; its desktop center differs from the viewport content center by less than one CSS pixel. Disclosures were checked in the browser. No physical-device frame-rate or Android install claim is made.

The follow-up checks verified rapid keyboard reversals, settled open/closed state, removal of fixed heights, resizing mid-transition, and native open/close while motion is off. Banner tiles were identical, touched without a visible gap, and covered every possible loop phase at 320, 768, 1440 and 2560px. Every page's footer was checked at 320px without horizontal overflow. The download button's shared hover/focus style measured approximately 13.8:1 text contrast in the focused browser state.
