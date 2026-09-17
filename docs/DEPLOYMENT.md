# Live deployment

Deployed and verified on 17 September 2026.

- Public website: https://kokonut.cc
- Alternate hostname: https://www.kokonut.cc
- Hosting address: https://kokonut.aaronko1005.chatgpt.site
- Website source: https://github.com/Tydooloo/kokonut
- APK release: https://github.com/Tydooloo/kokonut/releases/tag/android-test-2026-09-17
- Live website source revision: `992849e15a89d8cad21a6521f3eb2bbd7621304f`
- Passing CI for that revision: https://github.com/Tydooloo/kokonut/actions/runs/35203075033
- Published design version: 2
- Successful deployment: `appgdep_6aabad9fbb648191b83c293cb640be1c`

## Domain

Cloudflare manages the kokonut.cc zone. The following new website records were added; the existing MX, SPF and DKIM records were preserved.

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| A | @ | 162.159.143.30 | DNS only |
| A | @ | 172.66.3.26 | DNS only |
| CNAME | www | custom-domains.chatgpt.site | DNS only |

Both hostnames are registered to the Site in `.openai/hosting.json`. Their `_openai-site-verification` and `_cf-custom-hostname` TXT records were installed using the hosting provider's returned values. Retain the verification records. Both hostname and SSL states were confirmed active. HTTP redirects to HTTPS.

## Live checks

The homepage, `/sidequest/`, `/macrova/`, `/revisen/`, `/releases/` and `/privacy/` responded with HTTP 200 at the hosting address. The homepage, all app pages and release page also responded with HTTP 200 on kokonut.cc. The www homepage and SideQuest page returned the correct pages over HTTPS. The public release manifest contains all three apps, and an unknown route returns HTTP 404.

All three public GitHub APK URLs responded without authentication, with an attachment disposition, the recorded Content-Length and the APK ZIP header. GitHub's stored SHA-256 digest matches each locally inspected file. A physical phone installation was not performed in this task.

The optional `_headers` file is included for compatible static hosts. This Sites deployment did not return its custom CSP or nosniff headers in the checked CSS response; do not claim those headers are active here.

The version 2 design was checked on both kokonut.cc and www.kokonut.cc. Homepage and all three app-page HTML match the tested source after excluding Cloudflare's observed per-request browser-check script. CSS, application JavaScript, the motion module, original coconut SVG and all three official app icon assets match byte-for-byte. The motion module is served as JavaScript. The public homepage initialized the motion controls correctly, displayed Kokonut with a capital K and the original coconut, and had no horizontal overflow. All three public APK response checks passed again.

## Future publication

GitHub holds the independent website history and public APK release assets. A GitHub push alone does not redeploy Sites. Keep app implementation and runtime data in their separate repositories.

Regenerate changed app/release pages, run `node scripts/check.mjs`, review the changes, commit and push to GitHub. Reuse the existing Site ID. Obtain a short-lived source write credential through Sites, push the same commit to its source repository using a per-command HTTP authorization header, and never persist that credential in files or remotes. Package `.openai/hosting.json` and the public `dist/` directory, save that exact pushed version, deploy it publicly, and confirm terminal success before checking the domain.

Only website assets belong in the deployment archive. APK binaries are GitHub Release assets, and credentials or app runtime data must not enter the website repository or archive.

On this Windows machine, Git Bash is installed at `C:/Program Files/Git/bin/bash.exe` but is not on the default PATH. Invoke the Sites `skills/sites-hosting/scripts/package-site.sh` helper with that executable and `/c/Users/...` paths for its arguments; GNU tar interprets a `C:` archive path as a remote host. The helper-built version 2 archive was validated before saving.
