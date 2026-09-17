# Kokonut

The independent home for SideQuest, Macrova and Revisen at https://kokonut.cc.

This is a fresh website repository. App source, credentials, accounts and Git histories remain in their own projects. Only public website assets and release metadata belong here.

Built with semantic HTML, responsive CSS and small progressive JavaScript. The website lives in `dist/` and works without a frontend framework or build step.

## Local preview

Run `node scripts/serve.mjs`, then visit http://localhost:4173.

## Android test releases

APKs are distributed as public GitHub Release assets, never committed to Git. Each release records the source revision, Android package, version, byte size and SHA-256 checksum. The website must accurately disclose any backend setup required by a test build.

## Delivery

Meaningful milestones are committed and pushed independently. Sites serves the website; the custom domain is configured through its DNS owner.
