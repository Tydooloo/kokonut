# Product carousel motion

The homepage uses one Three.js scene: four animated Blender product models inside cards, arranged around the original coconut SVG icon. The enlarged foreground card has larger lettering and holds focus for 3.8 seconds. A cubic easing curve advances the circle by a quarter-turn over 0.82 seconds, then the next reading interval begins. Card sizes change with depth so one product has clear visual priority.

- The small icon button beside the introductory text pauses automatic rotation only. Blender playback, model tilting, card bobbing and the coconut's gentle float continue. Resume continues an interrupted transition, or begins a fresh reading interval if already settled.
- The footer's motion control still pauses every animation. Reduced-motion users start with a static scene. Explicitly resuming from the compact carousel button enables motion and synchronizes the global control.
- Wheel input and page scrolling do not drive the carousel. No wheel or scroll listener changes its angle, timing or velocity. Vertical touch gestures remain native page scrolling; horizontal dragging starts only after the gesture crosses its threshold.
- Dragging takes control and suppresses accidental navigation. Releasing settles onto the nearest product, with a small directional bias for a deliberate flick. Manual selection remains available while automatic rotation is paused.
- Every card is an ordinary anchor with a perspective-matched hit area. Pointer selection opens the product page. A raycast checks occlusion by nearer cards and the opaque parts of the coconut icon.
- Tab brings the focused product forward. Left/Right moves between products. Arrow keys on the stage animate to the adjacent card; Enter opens the featured product. Keyboard focus holds automatic advancement, while requested keyboard transitions still run.
- The models have stronger independent bobbing and tilting, on top of their original Blender animation clips. Card movement is gentler at the foreground position so the text remains readable.
- Rendering stops when the scene is offscreen or the document is hidden. Animation time resumes without a large jump. Resources are disposed when leaving the page, with back/forward cache support.
- WebGL or asset failure falls back to rendered cards and the original icon. The same static collection works without site scripts. The removed controls strip and product index are not duplicated in the fallback.

`scripts/orbit.test.mjs` verifies reading intervals, exact snap destinations, four-product cycling, pause/resume, drag settling, manual selection while paused or focused, and consistent timing across frame rates. `scripts/motion.test.mjs` covers reduced-motion startup, synchronized controls, preference changes and explicit carousel resume.
