# Kokonut

The independent home for SideQuest, Haste and Revisen at https://kokonut.cc.

This is a fresh website repository. App source, credentials, accounts and Git histories remain in their own projects. Only public website assets and release metadata belong here.

Built with semantic HTML, responsive CSS and small progressive JavaScript. The website lives in `dist/` and works without a frontend framework or build step.

## Local preview

Run `node scripts/serve.mjs`, then visit http://localhost:4173.

## Android test releases

APKs are distributed as public GitHub Release assets, never committed to Git. Each release records the Android package, version, byte size, signing certificate and SHA-256 checksum. These initial APKs came from existing build outputs; their exact source revisions are not attested. The website discloses any backend setup required by a test build.

## Delivery

Meaningful milestones are committed and pushed independently. Sites serves the website; the custom domain is configured through its DNS owner.

## Checks and content updates

- `node scripts/check.mjs` validates pages, links, asset references and download records. GitHub Actions runs it on pushes and pull requests.
- `node scripts/verify-downloads.mjs` checks the public APK responses without authentication.
- `node scripts/render-releases.mjs` regenerates the release page and homepage download buttons from `dist/releases/manifest.json`.
- `node scripts/render-app-pages.mjs` regenerates the dedicated app pages and sitemap. Detailed app copy is maintained in that script; visual previews come from the homepage app sections.
- `scripts/prepare-releases.mjs` describes the initial APK packaging operation. Update its release date, versions, inputs and inspected hashes deliberately when preparing a new release. Do not rerun it to replace a published release silently.

The app repositories are read-only inputs to this website workflow. Publishing a website or APK does not deploy or configure an app backend.
