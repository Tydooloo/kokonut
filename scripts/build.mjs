import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { page, escape as esc, words } from './layout.mjs';
import { haste, pedal, studio } from './content.mjs';
import { icon } from './icons.mjs';

const manifest = JSON.parse(readFileSync('dist/releases/manifest.json', 'utf8'));
const archived = manifest.releases.find(app => app.id === 'haste');
const mb = bytes => `${(bytes / 1e6).toFixed(1)} MB`;
// Template lines whose interpolation is empty would leave trailing spaces and blank lines.
const tidy = html => html.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
const save = (path, html) => { mkdirSync(`dist/${path}`, { recursive: true }); writeFileSync(`dist/${path}index.html`, tidy(html)); };
const ext = 'target="_blank" rel="noopener noreferrer"';

/* ---------- Shared components ---------- */

const head = ({ eyebrow, title, lead, id = '', center = false, level = 'h2' }) => `<div class="section-head${center ? ' is-center' : ''}">
  <p class="eyebrow reveal">${eyebrow}</p>
  <${level} class="headline" data-words${id ? ` id="${id}"` : ''}>${words(title)}</${level}>
  ${lead ? `<p class="lead reveal" style="--i:2">${lead}</p>` : ''}
</div>`;

const hasteIcon = (size = 28) => `<img class="app-icon" src="/assets/haste/icon.webp" alt="" width="${size}" height="${size}">`;

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

const pedalFallback = `<svg viewBox="0 0 300 380" class="pedal-svg" aria-hidden="true"><rect x="20" y="10" width="260" height="360" rx="26" fill="#e6dfcf"/><rect x="62" y="40" width="176" height="52" rx="8" fill="#14110e"/><path d="M78 70h20l8-12 10 22 9-16 8 6h27" stroke="#ff8a3d" stroke-width="3" fill="none"/>${[75, 150, 225].map(x => `<circle cx="${x}" cy="150" r="27" fill="#1d1d1f"/><path d="M${x} 150v-20" stroke="#e6dfcf" stroke-width="4" stroke-linecap="round"/>`).join('')}<circle cx="150" cy="222" r="7" fill="#ff8a3d"/><circle cx="150" cy="300" r="34" fill="#b9b6ae"/><circle cx="150" cy="300" r="22" fill="#d9d6ce"/></svg>`;

const pedalLab = () => `<div class="pedal-lab" data-pedal-lab>
  <div class="pedal-stage" data-pedal role="img" aria-label="Interactive 3D model of the VST Pedal concept">
    <div class="stage-fallback">${pedalFallback}</div>
    <canvas aria-hidden="true"></canvas>
    <p class="stage-hint" aria-hidden="true">Turn a knob · Stomp the switch · Drag to look around</p>
  </div>
  <div class="pedal-console">
    <button class="play-button" type="button" data-pedal-play aria-pressed="false"><span class="play-icon">${icon('play')}</span><span class="pause-icon">${icon('pause')}</span><span data-play-label>Play the demo riff</span></button>
    <div class="pedal-knobs">${[['drive', 'Drive', 62], ['tone', 'Tone', 55], ['mix', 'Space', 40]].map(([id, label, value]) => `<label class="knob-control"><span>${label}</span><input type="range" min="0" max="100" value="${value}" data-param="${id}"><output>${value}</output></label>`).join('')}</div>
    <button class="bypass-button" type="button" data-pedal-bypass aria-pressed="true"><i></i><span data-bypass-label>Effect on</span></button>
    <p class="console-note">${icon('sound')} Synthesised live in your browser with the Web Audio API. A sketch of the feel, not a VST host. Yet.</p>
  </div>
</div>`;

const roadmap = () => `<ol class="roadmap">${pedal.roadmap.map(([n, title, text, now], i) => `<li class="reveal${now ? ' is-now' : ''}" style="--i:${i}"><span class="road-num">${n}${now ? '<b>Now</b>' : ''}</span><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>`;

const questions = () => `<div class="questions">${pedal.questions.map((q, i) => `<article class="card spotlight reveal" style="--i:${i}"><span class="card-icon">${icon(q.icon)}</span><h3>${q.title}</h3><p>${q.text}</p></article>`).join('')}</div>`;

const tickerItems = ['Haste 1.2.10 — testing on Google Play', 'Haste for iPhone — in preparation', 'VST Pedal — concept stage', 'No ads. No trackers.', 'Voice transcribed on-device', 'Made in New Zealand'];
const ticker = () => `<div class="ticker" role="region" aria-label="Studio status"><div class="ticker-track">${[0, 1].map(copy => `<ul${copy ? ' aria-hidden="true"' : ''}>${tickerItems.map(item => `<li>${item}</li>`).join('')}</ul>`).join('')}</div></div>`;

/* ---------- Home ---------- */

save('', page({
  title: 'Kokonut — Independent software & hardware',
  description: 'Kokonut is an independent New Zealand studio. Meet Haste, the food journal you can talk to, and the VST Pedal, a hardware concept for guitarists.',
  bodyClass: 'home',
  body: `<main id="main">
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-visual" data-particles><canvas aria-hidden="true"></canvas><img class="hero-fallback" src="/favicon.svg" alt="" width="420" height="420"></div>
  <div class="wrap hero-inner">
    <p class="kicker reveal"><span class="pulse" aria-hidden="true"></span>Independent studio · New Zealand</p>
    <h1 class="display" id="hero-title" data-words>${words('Tools that get|out of *your way.*')}</h1>
    <p class="hero-lead reveal" style="--i:3">Kokonut makes fast, private software for everyday life, and hardware ideas for the stage. Fewer things, made properly.</p>
    <div class="hero-actions reveal" style="--i:4"><a class="btn btn-primary" data-magnetic href="#haste">Meet Haste ${icon('arrowRight')}</a><a class="btn btn-ghost" href="#pedal">Play with the pedal</a></div>
  </div>
  <div class="wrap hero-foot">
    <div class="morph-switch" role="group" aria-label="Change the particle sculpture" data-morph-switch>
      ${['Kokonut', 'Haste', 'VST Pedal'].map((label, i) => `<button type="button" data-morph="${i}" aria-pressed="${i === 0}">${label}<i aria-hidden="true"></i></button>`).join('')}
    </div>
    <a class="scroll-cue" href="#haste"><span>Scroll</span>${icon('arrowDown')}</a>
  </div>
</section>
${ticker()}
<section class="section haste-section" id="haste" data-section="haste">
  <div class="wrap">
    ${head({ eyebrow: `${hasteIcon()} Haste · Food journal`, title: 'Log a meal in the time|it takes to *say it.*', lead: haste.description })}
    ${story()}
    ${bento()}
    ${platforms()}
    <div class="cta-strip reveal"><div><h3>Want in early?</h3><p>Haste is in closed testing. Send us the email on your Google account and we’ll add you.</p></div><div class="cta-actions"><a class="btn btn-primary" data-magnetic href="${haste.betaMail}">Join the beta ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/">Everything about Haste</a></div></div>
  </div>
</section>
<section class="section pedal-section" id="pedal" data-section="pedal">
  <div class="wrap">
    ${head({ eyebrow: '<span class="tag-concept">Concept</span> VST Pedal · Hardware', title: 'Your plug-ins.|On the *floor.*', lead: pedal.description })}
    ${pedalLab()}
    ${roadmap()}
    <p class="section-link reveal"><a class="text-link" href="/pedal/">Inside the idea: latency, hosting and the hard questions ${icon('arrowRight')}</a></p>
  </div>
</section>
<section class="section studio-section" id="studio" data-section="studio">
  <div class="wrap">
    <div class="studio-grid">
      ${head({ eyebrow: 'The studio', title: 'Built one idea|at a *time.*' })}
      <div class="studio-copy reveal" style="--i:1"><p>Kokonut is a small, independent studio. I design, build and ship everything here myself, from the database schema to the last pixel, and I’d rather make one thing properly than five things halfway.</p><p>Right now that means Haste, and a guitar pedal I can’t stop thinking about.</p></div>
    </div>
    <div class="principles">${[
      ['lock', 'Private by default', 'No ads, no trackers, no analytics on this site. Voice stays on the device. Data leaves your phone only when a feature needs it.'],
      ['bolt', 'Fast is a feature', 'If logging a meal takes longer than eating it, people stop. Every screen is designed around the fewest taps.'],
      ['review', 'Honest about what’s ready', 'Testing means testing. Concepts are labelled as concepts. Estimates are shown as estimates.'],
    ].map(([ic, t, d], i) => `<article class="principle reveal" style="--i:${i}"><span class="card-icon">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    <dl class="stats">${[
      [469, '', 'cited NZ food servings in Haste'],
      [0, '', 'ads or third-party trackers'],
      [2, '', 'platforms from one Flutter codebase'],
      [100, '%', 'on-device voice transcription'],
    ].map(([n, unit, label], i) => `<div class="stat reveal" style="--i:${i}"><dt>${label}</dt><dd><span data-count="${n}">${n}</span>${unit}</dd></div>`).join('')}</dl>
    <div class="stack reveal"><h3>Built with</h3><ul>${['Flutter', 'Dart', 'Supabase', 'Postgres', 'Edge Functions', 'whisper.cpp', 'Kotlin widgets', 'Swift packages', 'Three.js', 'WebGL shaders', 'Web Audio'].map(t => `<li>${t}</li>`).join('')}</ul></div>
  </div>
</section>
<section class="section contact-section" id="contact" data-section="contact">
  <div class="wrap">
    <p class="eyebrow reveal">Contact</p>
    <h2 class="mega" data-words>${words('Let’s make|something *good.*')}</h2>
    <a class="contact-mail reveal" data-magnetic href="mailto:${studio.email}">${studio.email} ${icon('arrowUpRight')}</a>
    <div class="contact-cards">${[
      [haste.betaMail, 'Try Haste', 'Join the closed beta on Android.', false],
      [`mailto:${studio.email}?subject=VST%20Pedal`, 'Talk hardware', 'Play live? Tell me about your rig.', false],
      [studio.github, 'GitHub', 'This website’s source and releases.', true],
    ].map(([href, t, d, external], i) => `<a class="contact-card card spotlight reveal" style="--i:${i}" href="${href}"${external ? ` ${ext}` : ''}><span><strong>${t}</strong><small>${d}</small></span>${icon('arrowUpRight')}</a>`).join('')}</div>
  </div>
</section>
</main>`,
}));

/* ---------- Haste ---------- */

save('haste/', page({
  title: 'Haste — The food journal you can talk to — Kokonut',
  description: 'Snap, say or type your meals. Haste estimates calories and macros, keeps voice on your phone and keeps your streak going. In testing on Android.',
  path: 'haste/', bodyClass: 'product-page haste-page',
  body: `<main id="main">
<section class="product-hero wrap">
  <nav class="breadcrumb reveal" aria-label="Breadcrumb"><a href="/">Kokonut</a><span aria-hidden="true">/</span><span aria-current="page">Haste</span></nav>
  <div class="product-hero-mark reveal"><img src="/assets/haste/icon.webp" alt="Haste app icon" width="96" height="96"></div>
  <p class="eyebrow reveal">Haste · Food journal · v${haste.version}</p>
  <h1 class="display" data-words>${words('Food logging that|keeps *up with you.*')}</h1>
  <p class="hero-lead reveal" style="--i:3">${haste.description}</p>
  <div class="hero-actions reveal" style="--i:4"><a class="btn btn-primary" data-magnetic href="#get">Get Haste ${icon('arrowDown')}</a><a class="btn btn-ghost" href="#how">See how it works</a></div>
</section>
<section class="section" id="how"><div class="wrap">
  ${head({ eyebrow: 'How it works', title: 'Three screens.|*That’s it.*', lead: 'Capture what you ate, check your day, watch the trend. Real screens from the app, rendered with demo data.' })}
  ${story()}
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Features', title: 'Small details.|*Big difference.*' })}
  ${bento()}
</div></section>
<section class="section privacy-band"><div class="wrap split">
  ${head({ eyebrow: `${icon('shield')} Privacy`, title: 'Your journal is|*nobody’s business.*' })}
  <ul class="checklist reveal">${['Voice is transcribed on your phone. Recordings never leave it.', 'Photos are sent for an estimate only when you ask, and aren’t stored on our servers.', 'No ads, no analytics SDK, no tracking.', 'Friends see your streak, never your meals, weight or photos.', 'Delete your account and its data from Settings.'].map(t => `<li>${icon('review')}<span>${t}</span></li>`).join('')}</ul>
</div></section>
<section class="section" id="get"><div class="wrap">
  ${head({ eyebrow: 'Get Haste', title: 'Ready when|*you are.*', lead: 'Haste is in closed testing on Google Play. The iPhone version is on its way.' })}
  ${platforms()}
  <div class="cta-strip reveal"><div><h3>Join the Android beta</h3><p>Email us from the Google account you use on your phone. We’ll add you to the testers and send the Play link.</p></div><div class="cta-actions"><a class="btn btn-primary" data-magnetic href="${haste.betaMail}">Request access ${icon('arrowRight')}</a></div></div>
  <p class="fine reveal">Looking for the original sideload build? The <a href="/releases/">archived v${archived.version} APK</a> is still available for reference. It’s older than the Play version.</p>
</div></section>
<section class="section" id="support"><div class="wrap split">
  <div>${head({ eyebrow: 'Support', title: 'Questions,|*answered.*' })}<p class="reveal support-mail">Still stuck? <a href="${haste.supportMail}">${studio.email}</a></p><p class="reveal support-links"><a class="text-link" href="${haste.privacyPolicy}" ${ext}>Privacy policy ${icon('arrowUpRight')}</a><a class="text-link" href="${haste.deleteAccount}" ${ext}>Account deletion ${icon('arrowUpRight')}</a></p></div>
  <div class="faq reveal">${haste.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true"></span></summary><div><p>${a}</p></div></details>`).join('')}</div>
</div></section>
<nav class="next-page wrap" aria-label="Next"><a class="card spotlight" href="/pedal/"><small>Next from Kokonut</small><strong>VST Pedal</strong><span>A hardware concept for guitarists ${icon('arrowRight')}</span></a></nav>
</main>`,
}));

/* ---------- Pedal ---------- */

const flow = ['Guitar', 'Input', 'Your VST chain', 'Output', 'Amp / PA'];
save('pedal/', page({
  title: 'VST Pedal — A hardware concept by Kokonut',
  description: pedal.description,
  path: 'pedal/', bodyClass: 'product-page pedal-page',
  body: `<main id="main">
<section class="product-hero wrap">
  <nav class="breadcrumb reveal" aria-label="Breadcrumb"><a href="/">Kokonut</a><span aria-hidden="true">/</span><span aria-current="page">VST Pedal</span></nav>
  <p class="eyebrow reveal"><span class="tag-concept">Concept</span> Hardware · No prototype yet</p>
  <h1 class="display" data-words>${words('Off the desk.|On the *floor.*')}</h1>
  <p class="hero-lead reveal" style="--i:3">${pedal.description}</p>
</section>
<section class="section section-tight"><div class="wrap">${pedalLab()}</div></section>
<section class="section"><div class="wrap split">
  ${head({ eyebrow: 'The question', title: 'Why should your sound|*stay at home?*' })}
  <div class="prose-block reveal"><p>A DAW puts a world of amps, pedals and spaces a click away. Getting those exact sounds onto a stage usually means bringing the computer too: a laptop on an ironing board, an audio interface, a nervous glance at the battery.</p><p>The idea is simple to say and hard to build: a pedal that hosts your Windows VST plug-ins itself. One box on the floor, your signal chain inside, real knobs and a footswitch in charge.</p><p class="note">This is an early concept. Hardware, plug-in compatibility, latency, controls and release plans are all still open. Nothing here is a product specification.</p></div>
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Signal path', title: 'Simple on the outside.' })}
  <ol class="flow reveal" aria-label="Proposed signal path">${flow.map((step, i) => `<li${i === 2 ? ' class="is-core"' : ''}><span>${step}</span></li>`).join('')}</ol>
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Open questions', title: 'The hard parts,|*on purpose.*', lead: 'A concept is only useful if it’s honest about what could stop it.' })}
  ${questions()}
</div></section>
<section class="section"><div class="wrap">
  ${head({ eyebrow: 'Roadmap', title: 'Where it’s *headed.*', lead: 'A direction, not a promise. No dates until the feasibility work says yes.' })}
  ${roadmap()}
  <div class="cta-strip reveal"><div><h3>Play live?</h3><p>I’d love to hear what’s in your rig and what you’d want from a pedal like this.</p></div><div class="cta-actions"><a class="btn btn-primary" data-magnetic href="mailto:${studio.email}?subject=VST%20Pedal">Get in touch ${icon('arrowRight')}</a></div></div>
</div></section>
<nav class="next-page wrap" aria-label="Next"><a class="card spotlight" href="/haste/"><small>Next from Kokonut</small><strong>Haste</strong><span>The food journal you can talk to ${icon('arrowRight')}</span></a></nav>
</main>`,
}));

/* ---------- Releases ---------- */

save('releases/', page({
  title: 'Release details — Kokonut',
  description: 'How to get Haste, plus the checksum and details of the archived Android test build.',
  path: 'releases/', bodyClass: 'prose-page',
  body: `<main class="prose wrap" id="main">
<p class="eyebrow reveal">Release details</p>
<h1 class="headline" data-words>${words('Builds &|*checksums.*')}</h1>
<p class="prose-lead reveal">Current Haste builds go out through Google Play closed testing. <a href="/haste/#get">Request access</a> to get the latest version.</p>
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
<h2>The pedal demo</h2>
<p>The VST Pedal demo synthesises sound in your browser with the Web Audio API, only after you press play. Nothing is recorded and nothing is sent anywhere.</p>
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
  body: `<main class="prose wrap" id="main"><img class="lost-coconut" src="/favicon.svg" alt="" width="120" height="120"><p class="eyebrow">404</p><h1 class="headline" data-words>${words('This one|*wandered off.*')}</h1><p class="prose-lead">The page may have moved. SideQuest and Revisen have been retired; everything else is a click away.</p><div class="hero-actions"><a class="btn btn-primary" href="/">Back home ${icon('arrowRight')}</a><a class="btn btn-ghost" href="/haste/">Haste</a></div></main>`,
})));

writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'haste/', 'pedal/', 'releases/', 'privacy/'].map(path => `<url><loc>${studio.url}/${path}</loc></url>`).join('')}</urlset>\n`);
console.log('Built 6 pages: home, Haste, VST Pedal, releases, privacy and 404.');
