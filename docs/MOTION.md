# Scroll motion

`dist/motion.mjs` progressively enhances the static HTML. It updates a bounded CSS variable on visible scenes; CSS moves app cards, phones, orbital graphics, the text strip and coconut accents. Text and navigation remain in their normal layout.

- Native scrolling is preserved: no wheel interception, scroll locking, pinning or synthetic scroll position.
- One requestAnimationFrame per burst of scroll/resize events. All geometry reads precede style writes. No animation loop runs at rest.
- IntersectionObserver limits updates to visible and soon-visible scenes. Hidden tabs cancel pending frames. Resize, font readiness and restored pages request a fresh measurement.
- System reduced motion disables every decorative scroll transform. Preference changes take effect immediately. A footer button can also switch motion off for the current page; no preference is stored or tracked.
- Content is visible before JavaScript runs and stays usable if animation cannot load. The motion import is isolated from download and checksum controls. Native links, downloads and FAQ disclosures need no JavaScript.

## Verification

`node --test scripts/motion.test.mjs` runs four regression tests covering bounds, frame batching, read/write ordering, offscreen work, reduced motion, manual pause, visibility, resize, restored pages and cleanup. In the Windows sandbox, use `node --test --test-isolation=none scripts/motion.test.mjs` to avoid a restricted child-process spawn.

Browser checks covered home at 320, 390, 768 and 1440px, and all three app pages at 320, 768 and 1440px. No document/heading overflow or broken images was found. Scroll transforms were observed changing, the footer pause control restored static content and stayed paused through scrolling, and resuming worked. Browser console checks returned no warnings or errors. System preference changes were verified in the controller tests, not by changing the operating system's setting.

The FAQ heading and rows share a centered 800px maximum-width container; its desktop center differs from the viewport content center by less than one CSS pixel. Disclosures were checked in the browser. No physical-device frame-rate or Android install claim is made.
