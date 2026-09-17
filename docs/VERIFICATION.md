# Website verification

Verified on 17 September 2026.

- Seven HTML documents pass static checks: homepage, three app pages, releases, privacy and 404.
- 179 local href/src references resolve, including anchors; CSS references resolve to local font assets.
- Dedicated app pages checked in-browser at 320, 768 and 1440 CSS pixels: no document or heading overflow and no broken images.
- Home, SideQuest mobile page and Macrova tablet page inspected visually, including the coconut mark. Homepage geometry checked at 320, 390, 768 and 1440 CSS pixels without overflow. Navigation from the homepage to SideQuest and release checksum expand/copy interactions passed in the browser.
- Three APKs passed Android `apksigner verify`. Android package, versions, minimum SDK 24 and ARMv7/ARM64/x86-64 architectures were read from each APK using `aapt`.
- All three uploaded GitHub Release assets match their local SHA-256 hashes and sizes. The release is public and tagged `android-test-2026-09-17`.
- Local fonts are shipped with their SIL Open Font Licenses. The website uses no client analytics, third-party fonts, form submissions or local storage.
- The design refinement uses the official source-project app icons, the retained original coconut, capitalized Kokonut wordmarks, shorter copy, consistent illustrated app panels and centered help. See [icon provenance](APP-ICONS.md).
- Four motion regression tests passed. Responsive geometry was rechecked for the redesigned home and app pages, with no clipped headings or broken images. FAQ expand, scroll animation, pause and resume passed in-browser. See [motion behavior and validation](MOTION.md).
- Every HTML page, including privacy and 404, now contains the complete footer navigation. Static checks enforce links to all six content pages. Footer links also provide downloads and installation help. Cross-page navigation from the 404 footer to homepage downloads was verified.
- The banner now repeats continuously with complete edge coverage through 2560px. Hero cards use their previous hover/focus lift and the sticker is gone. Help disclosures animate and handle rapid reversal, keyboard use, resize and motion-off native operation. The download button retains dark text over its highlighted background.

Limits: no physical Android installation was performed in this website task. Signature, binary metadata and download verification do not prove every app feature works. SideQuest live account flows were not retested. Macrova AI/lookup and Revisen learning features require their own configured backend. The website does not activate those services.

See [deployment verification](DEPLOYMENT.md) for the live domain, HTTPS, routes, public APK response checks and exact published source revision.
