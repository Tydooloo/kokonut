import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { page, escape as esc, words, logo } from './layout.mjs';
import { haste, studio, principles, hasteNav } from './content.mjs';
import { icon } from './icons.mjs';

const manifest = JSON.parse(readFileSync('dist/releases/manifest.json', 'utf8'));
const archived = manifest.releases.find(app => app.id === 'haste');
const mb = bytes => `${(bytes / 1e6).toFixed(1)} MB`;
// Template lines whose interpolation is empty would leave trailing spaces and blank lines.
const tidy = html => html.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
const save = (path, html) => { mkdirSync(`dist/${path}`, { recursive: true }); writeFileSync(`dist/${path}index.html`, tidy(html)); };
const ext = 'target="_blank" rel="noopener noreferrer"';

/* ---------- Shared components ---------- */

const head = ({ eyebrow, title, lead, center = false, level = 'h2' }) => `<div class="section-head${center ? ' is-center' : ''}">
  ${eyebrow ? `<p class="eyebrow reveal">${eyebrow}</p>` : ''}
  <${level} class="${level === 'h1' ? 'display' : 'headline'}" data-words>${words(title)}</${level}>
  ${lead ? `<p class="lead reveal" style="--i:2">${lead}</p>` : ''}
</div>`;

const hasteIcon = (size = 28) => `<img class="app-icon" src="/assets/haste/icon.webp" alt="" width="${size}" height="${size}">`;

const hasteTabs = current => `<nav class="subnav wrap" aria-label="Haste">${hasteIcon(26)}<span class="subnav-title">Haste</span><div class="subnav-links">${hasteNav.map(([label, href]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></nav>`;

const phoneStage = () => `<div class="phone-stage" data-phone role="img" aria-label="The Haste app on a 3D phone, showing the ${haste.screens[0].label} screen">
  <div class="stage-fallback phone-fallback">${haste.screens.map((s, i) => `<img src="/assets/haste/screen-${s.id}.webp" alt="" width="660" height="1434" decoding="async" loading="${i ? 'lazy' : 'eager'}"${i ? ' hidden' : ''}>`).join('')}</div>
  <canvas aria-hidden="true"></canvas>
  <p class="stage-hint" aria-hidden="true">Drag to rotate</p>
</div>
<div class="screen-tabs" role="group" aria-label="Choose an app screen">${haste.screens.map((s, i) => `<button type="button" data-screen="${i}" aria-pressed="${i === 0}">${s.label}</button>`).join('')}</div>`;

const story = () => `<div class="story" data-story>
  <div class="story-visual"><div class="story-sticky">${phoneStage()}</div></div>
  <ol class="story-steps">${haste.screens.map((s, i) => `<li class="story-step" data-step="${i}"><span class="step-num">0${i + 1} · ${s.label}</span><h3>${s.title}</h3><p>${s.text}</p></li>`).join('')}</ol>
</div>`;

const bento = () => `<div class="bento">${haste.features.map((f, i) => `<article class="card spotlight reveal${f.size ? ` is-${f.size}` : ''}" style="--i:${i % 4}">
  <span class="card-icon">${icon(f.icon)}</span>
  ${f.stat ? `<p class="card-stat"><span data-count="${f.stat}">${f.stat}</span><small>${f.statLabel}</small></p>` : ''}
  <h3>${f.title}</h3><p>${f.text}</p>
</article>`).join('')}</div>`;

const platforms = () => `<div class="platforms">${haste.platforms.map((p, i) => `<article class="platform card reveal" style="--i:${i}">
  <div class="platform-top"><span class="card-icon">${icon(p.icon)}</span><span class="status status-${p.tone}"><i></i>${p.status}</span></div>
  <h3>${p.name}</h3><p>${p.text}</p>
</article>`).join('')}</div>`;

const demo = () => `<div class="demo card reveal" data-demo data-meals="${esc(JSON.stringify(haste.demo))}">
  <div class="demo-input">
    <p class="demo-label">${icon('mic')} What did you eat?</p>
    <div class="demo-field"><span data-demo-typed>Pick a meal below</span><i class="caret" aria-hidden="true"></i></div>
    <div class="demo-chips" role="group" aria-label="Sample meals">${haste.demo.map((m, i) => `<button type="button" data-meal="${i}" aria-pressed="false">${m.label}</button>`).join('')}</div>
    <button class="btn btn-primary demo-run" type="button" data-demo-run disabled>${icon('spark')} Estimate</button>
  </div>
  <div class="demo-result" data-demo-result aria-live="polite">
    <div class="demo-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="demo-ring-fill" cx="60" cy="60" r="52"/></svg><p><strong data-kcal>0</strong><small>kcal</small></p></div>
    <dl class="demo-macros">${[['protein', 'Protein'], ['carbs', 'Carbs'], ['fat', 'Fat']].map(([id, label]) => `<div class="macro-${id}"><dt>${label}</dt><dd><span data-macro="${id}">0</span>g</dd><i><b data-bar="${id}"></b></i></div>`).join('')}</dl>
    <p class="demo-status" data-demo-status>Your estimate appears here. You review it before anything is saved.</p>
    <button class="btn btn-ghost demo-save" type="button" data-demo-save disabled>${icon('review')} Save to journal</button>
  </div>
  <p class="demo-note">${icon('spark')} A demo with example numbers. The real app estimates from your photo, voice or text and shows its confidence.</p>
</div>`;

const tickerItems = ['Haste 1.2.10 — testing on Google Play', 'Haste for iPhone — in preparation', 'No ads. No trackers.', 'Voice transcribed on-device', '469 cited NZ servings', 'Made in New Zealand'];
const ticker = () => `<div class="ticker" role="region" aria-label="Haste status"><div class="ticker-track">${[0, 1].map(copy => `<ul${copy ? ' aria-hidden="true"' : ''}>${tickerItems.map(item => `<li>${item}</li>`).join('')}</ul>`).join('')}</div></div>`;

const ctaBeta = (title = 'Want in early?') => `<div class="cta-strip reveal"><div><h3>${title}</h3><p>Haste is in closed testing on Google Play. Send us the email on your Google account and we’ll add you.</p></div><div class="cta-actions"><a class="btn btn-primary" data-magnetic href="${haste.betaMail}">Join the beta ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/get/">How it works</a></div></div>`;

const nextCard = (href, small, title, text) => `<nav class="next-page wrap" aria-label="Next"><a class="card spotlight" href="${href}"><small>${small}</small><strong>${title}</strong><span>${text} ${icon('arrowRight')}</span></a></nav>`;

const principleCards = () => `<div class="principles">${principles.map(([ic, t, d], i) => `<article class="principle reveal" style="--i:${i}"><span class="card-icon">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>`;

/* ---------- Home ---------- */

save('', page({
  title: 'Kokonut — Calm, fast, private software',
  description: 'Kokonut is an independent New Zealand software studio. Meet Haste: snap, say or type a meal and it’s logged in seconds.',
  bodyClass: 'home',
  body: `<main id="main">
<section class="hero" aria-labelledby="hero-title" data-particles>
  <canvas class="hero-canvas" aria-hidden="true"></canvas>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker reveal"><span class="pulse" aria-hidden="true"></span>Software studio · New Zealand</p>
      <h1 class="display" id="hero-title" data-words>${words('Software that|gets *out of your way.*')}</h1>
      <p class="hero-lead reveal" style="--i:3">Kokonut makes calm, fast, private apps. Our first, Haste, turns logging a meal into a few seconds of your day.</p>
      <div class="hero-actions reveal" style="--i:4"><a class="btn btn-primary" data-magnetic href="/haste/">Meet Haste ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/about/">About Kokonut</a></div>
    </div>
    <div class="hero-visual"><img class="hero-fallback" src="/assets/logo.svg" alt="" width="360" height="360">
      <div class="morph-switch" role="group" aria-label="Change the particle sculpture" data-morph-switch>${['Kokonut', 'Haste'].map((label, i) => `<button type="button" data-morph="${i}" aria-pressed="${i === 0}">${label}<i aria-hidden="true"></i></button>`).join('')}</div>
    </div>
  </div>
</section>
${ticker()}
<section class="section feature-haste">
  <div class="wrap feature-grid">
    <div class="feature-copy">
      ${head({ eyebrow: `${hasteIcon()} Our app · Haste`, title: 'Log a meal in the time|it takes to *say it.*', lead: haste.description })}
      <ul class="quick-points">${[['camera', 'Snap, say or type'], ['mic', 'Voice stays on your phone'], ['shield', 'No ads, no tracking']].map(([ic, t], i) => `<li class="reveal" style="--i:${i + 2}">${icon(ic)}${t}</li>`).join('')}</ul>
      <div class="hero-actions reveal" style="--i:5"><a class="btn btn-primary" data-magnetic href="/haste/">Explore Haste ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/get/">Get Haste</a></div>
    </div>
    <div class="feature-visual" data-story>${phoneStage()}</div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${head({ eyebrow: 'How we work', title: 'Small studio.|*Serious about craft.*' })}
    ${principleCards()}
    <p class="section-link reveal"><a class="text-link" href="/about/">More about Kokonut ${icon('arrowRight')}</a></p>
  </div>
</section>
<section class="section section-tight-top"><div class="wrap">${ctaBeta()}</div></section>
</main>`,
}));

/* ---------- Haste: overview ---------- */

save('haste/', page({
  title: 'Haste — The food journal you can talk to — Kokonut',
  description: 'Snap, say or type your meals. Haste estimates calories and macros, keeps voice on your phone and keeps your streak going.',
  path: 'haste/', section: '/haste/', bodyClass: 'product-page haste-page',
  body: `<main id="main">
${hasteTabs('/haste/')}
<section class="product-hero wrap">
  <div class="product-hero-mark reveal"><img src="/assets/haste/icon.webp" alt="Haste app icon" width="104" height="104"></div>
  <p class="eyebrow reveal">Food journal · Android & iPhone</p>
  <h1 class="display" data-words>${words('Food logging that|keeps *up with you.*')}</h1>
  <p class="hero-lead reveal" style="--i:3">${haste.description}</p>
  <div class="hero-actions reveal" style="--i:4"><a class="btn btn-primary" data-magnetic href="/haste/get/">Get Haste ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/support/">Questions? Read the FAQ</a></div>
</section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'How it works', title: 'Three screens.|*That’s it.*', lead: 'Capture what you ate, check your day, watch the trend. These are real screens from the app, shown with demo data.' })}
  ${story()}
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Try it', title: 'Pick a meal.|*Watch it log.*', lead: 'This is how an estimate feels in Haste: say what you ate, check the numbers, save.' })}
  ${demo()}
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Features', title: 'Small details.|*Big difference.*' })}
  ${bento()}
</div></section>
<section class="section privacy-band"><div class="wrap split">
  ${head({ eyebrow: `${icon('shield')} Privacy`, title: 'Your journal is|*nobody’s business.*' })}
  <ul class="checklist reveal">${haste.privacy.map(t => `<li>${icon('review')}<span>${t}</span></li>`).join('')}</ul>
</div></section>
${nextCard('/haste/get/', 'Next', 'Get Haste', 'Android beta now, iPhone soon')}
</main>`,
}));

/* ---------- Haste: get ---------- */

save('haste/get/', page({
  title: 'Get Haste — Kokonut',
  description: 'Haste is in closed testing on Google Play. Here’s how to join, and what’s coming to iPhone.',
  path: 'haste/get/', section: '/haste/', bodyClass: 'product-page haste-page',
  body: `<main id="main">
${hasteTabs('/haste/get/')}
<section class="page-hero wrap">${head({ level: 'h1', eyebrow: 'Get Haste', title: 'Ready when|*you are.*', lead: 'Haste is in closed testing on Google Play, and the iPhone version is on its way.' })}</section>
<section class="section section-tight-top"><div class="wrap">
  ${platforms()}
  <ol class="join-steps">${[['mail', 'Email us', 'Write from the Google account you use on your Android phone.'], ['users', 'We add you', 'You join the tester list, usually within a day.'], ['download', 'Install from Play', 'Open the Play link we send and install Haste like any app.']].map(([ic, t, d], i) => `<li class="reveal" style="--i:${i}"><span class="join-num">0${i + 1}</span><span class="card-icon">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  <div class="cta-strip reveal"><div><h3>Join the Android beta</h3><p>One email is all it takes. We’ll reply with your Play link.</p></div><div class="cta-actions"><a class="btn btn-primary" data-magnetic href="${haste.betaMail}">Request access ${icon('arrowRight')}</a></div></div>
  <p class="fine reveal">Looking for the original sideload build? The <a href="/releases/">archived v${archived.version} APK</a> is still available for reference. It’s older than the Play version.</p>
</div></section>
${nextCard('/haste/support/', 'Next', 'Support', 'Answers about accuracy, privacy and your account')}
</main>`,
}));

/* ---------- Haste: support ---------- */

save('haste/support/', page({
  title: 'Haste support — Kokonut',
  description: 'Answers about getting Haste, AI estimates, privacy and deleting your account. Contact Haste support.',
  path: 'haste/support/', section: '/haste/', bodyClass: 'product-page haste-page',
  body: `<main id="main">
${hasteTabs('/haste/support/')}
<section class="page-hero wrap">${head({ level: 'h1', eyebrow: 'Support', title: 'Questions,|*answered.*' })}</section>
<section class="section section-tight-top"><div class="wrap split support-grid">
  <div class="faq reveal">${haste.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true"></span></summary><div><p>${a}</p></div></details>`).join('')}</div>
  <aside class="support-card card reveal" style="--i:1">
    <span class="card-icon">${icon('mail')}</span>
    <h2>Still stuck?</h2>
    <p>Email us and a real person will get back to you.</p>
    <a class="btn btn-primary" href="${haste.supportMail}">${studio.email}</a>
    <div class="support-links"><a class="text-link" href="${haste.privacyPolicy}" ${ext}>Privacy policy ${icon('arrowUpRight')}</a><a class="text-link" href="${haste.deleteAccount}" ${ext}>Account deletion ${icon('arrowUpRight')}</a></div>
  </aside>
</div></section>
</main>`,
}));

/* ---------- About ---------- */

save('about/', page({
  title: 'About Kokonut',
  description: 'Kokonut is a small, independent software studio in New Zealand, building calm, fast, private apps.',
  path: 'about/', section: '/about/', bodyClass: 'about-page',
  body: `<main id="main">
<section class="page-hero wrap">
  <div class="about-mark reveal">${logo(88)}</div>
  ${head({ level: 'h1', eyebrow: 'About Kokonut', title: 'Built one idea|at a *time.*' })}
</section>
<section class="section section-tight-top"><div class="wrap studio-grid">
  <p class="studio-intro reveal">Kokonut is a small, independent software studio in New Zealand.</p>
  <div class="studio-copy reveal" style="--i:1"><p>I design, build and ship everything here myself, from the database schema to the last pixel. I’d rather make one thing properly than five things halfway.</p><p>Right now that one thing is Haste: a food journal fast enough that you’ll actually keep using it, and private enough that you can trust it.</p></div>
</div></section>
<section class="section section-tight-top"><div class="wrap">
  ${head({ eyebrow: 'Principles', title: 'What we *won’t* compromise.' })}
  ${principleCards()}
  <dl class="stats">${[
    [469, '', 'cited NZ food servings in Haste'],
    [0, '', 'ads or third-party trackers'],
    [2, '', 'platforms from one Flutter codebase'],
    [100, '%', 'on-device voice transcription'],
  ].map(([n, unit, label], i) => `<div class="stat reveal" style="--i:${i}"><dt>${label}</dt><dd><span data-count="${n}">${n}</span>${unit}</dd></div>`).join('')}</dl>
  <div class="stack reveal"><h3>Built with</h3><ul>${['Flutter', 'Dart', 'Supabase', 'Postgres', 'Edge Functions', 'whisper.cpp', 'Kotlin widgets', 'Swift packages', 'Three.js', 'WebGL shaders'].map(t => `<li>${t}</li>`).join('')}</ul></div>
</div></section>
${nextCard('/contact/', 'Say hello', 'Contact', 'Beta access, support or just a chat')}
</main>`,
}));

/* ---------- Contact ---------- */

save('contact/', page({
  title: 'Contact — Kokonut',
  description: 'Get in touch with Kokonut about Haste, the beta or anything else.',
  path: 'contact/', section: '/contact/', bodyClass: 'contact-page',
  body: `<main id="main" class="contact-main">
<section class="wrap">
  <p class="eyebrow reveal">Contact</p>
  <h1 class="mega" data-words>${words('Let’s|*talk.*')}</h1>
  <a class="contact-mail reveal" data-magnetic href="mailto:${studio.email}">${studio.email} ${icon('arrowUpRight')}</a>
  <div class="contact-cards">${[
    [haste.betaMail, 'Try Haste', 'Join the closed beta on Android.', false],
    [haste.supportMail, 'Haste support', 'Questions about the app or your account.', false],
    [studio.github, 'GitHub', 'This website’s source and releases.', true],
  ].map(([href, t, d, external], i) => `<a class="contact-card card spotlight reveal" style="--i:${i}" href="${href}"${external ? ` ${ext}` : ''}><span><strong>${t}</strong><small>${d}</small></span>${icon('arrowUpRight')}</a>`).join('')}</div>
</section>
</main>`,
}));

/* ---------- Releases ---------- */

save('releases/', page({
  title: 'Release details — Kokonut',
  description: 'How to get Haste, plus the checksum and details of the archived Android test build.',
  path: 'releases/', section: '/haste/', bodyClass: 'prose-page',
  body: `<main class="prose wrap" id="main">
<p class="eyebrow reveal">Release details</p>
<h1 class="headline" data-words>${words('Builds &|*checksums.*')}</h1>
<p class="prose-lead reveal">Current Haste builds go out through Google Play closed testing. <a href="/haste/get/">Request access</a> to get the latest version.</p>
<article class="release card" id="haste">
  <div class="release-head">${hasteIcon(48)}<div><h2>Haste ${archived.version}</h2><p>Archived Android test build · ${archived.published}</p></div><span class="status status-soon"><i></i>Superseded</span></div>
  <p>${esc(archived.notes)} This build predates the Google Play version (${haste.version}) and is kept for reference.</p>
  <dl class="facts"><div><dt>File</dt><dd>${archived.file}</dd></div><div><dt>Size</dt><dd>${mb(archived.bytes)} (${archived.bytes.toLocaleString('en-NZ')} bytes)</dd></div><div><dt>Requires</dt><dd>Android ${archived.minAndroid}+</dd></div><div><dt>Package</dt><dd>${archived.packageName}</dd></div></dl>
  <div class="checksums"><p>SHA-256</p><code>${archived.sha256}</code><button class="copy-button" type="button" data-copy="${archived.sha256}">Copy</button><p>Signing certificate SHA-256</p><code>${archived.certificateSha256}</code></div>
  <a class="btn btn-ghost" href="${esc(archived.url)}">${icon('download')} Download archived APK · ${mb(archived.bytes)}</a>
</article>
<h2>About these files</h2>
<p>APKs are public GitHub Release assets, so no GitHub account is needed. Android only: they won’t install on an iPhone or iPad. Installing an older build over a newer one isn’t supported. The SHA-256 above identifies the exact file; it doesn’t verify every feature on every phone.</p>
<p><a href="${manifest.releaseUrl}">GitHub release</a> · <a href="/releases/manifest.json">Release manifest (JSON)</a></p>
</main>`,
}));

/* ---------- Privacy ---------- */

save('privacy/', page({
  title: 'Website privacy — Kokonut',
  description: 'How the Kokonut website handles visitor information.',
  path: 'privacy/', bodyClass: 'prose-page',
  body: `<main class="prose wrap" id="main">
<p class="eyebrow reveal">Website privacy</p>
<h1 class="headline" data-words>${words('A little|*clarity.*')}</h1>
<p class="prose-lead reveal">This page covers kokonut.cc. Haste has its own <a href="${haste.privacyPolicy}" ${ext}>privacy policy</a>.</p>
<h2>Browsing</h2>
<p>This website doesn’t use analytics, advertising trackers, sign-up forms or cookies, and it doesn’t write to your browser’s storage. It never asks for your location, camera, microphone or contacts. The “Pause motion” setting lasts for the current page only.</p>
<p>Our hosting and network providers process ordinary request information, like IP addresses, requested pages and browser details, to serve and protect the site. Fonts, scripts, 3D graphics and images all come from this website; no third-party CDN is contacted.</p>
<h2>The Haste demo</h2>
<p>The “Try it” demo on the Haste page runs entirely in your browser with example numbers. Nothing you pick is sent anywhere.</p>
<h2>Email and downloads</h2>
<p>Email links open your own mail app. If you write to us, we use your message only to reply. Archived APK links lead to GitHub, which handles the request under its own privacy terms.</p>
<p><a href="/">Back to Kokonut</a></p>
</main>`,
}));

/* ---------- 404 ---------- */

writeFileSync('dist/404.html', tidy(page({
  title: 'Page not found — Kokonut',
  description: 'That page has wandered off.',
  bodyClass: 'prose-page not-found',
  body: `<main class="prose wrap" id="main"><img class="lost-coconut" src="/assets/logo.svg" alt="" width="120" height="120"><p class="eyebrow">404</p><h1 class="headline" data-words>${words('This one|*wandered off.*')}</h1><p class="prose-lead">The page may have moved, or belonged to a project we’ve retired. Haste and everything else is a click away.</p><div class="hero-actions"><a class="btn btn-primary" href="/">Back home ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/">Haste</a></div></main>`,
})));

writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'haste/', 'haste/get/', 'haste/support/', 'about/', 'contact/', 'releases/', 'privacy/'].map(path => `<url><loc>${studio.url}/${path}</loc></url>`).join('')}</urlset>\n`);
console.log('Built 9 pages: home, Haste (overview, get, support), about, contact, releases, privacy and 404.');
