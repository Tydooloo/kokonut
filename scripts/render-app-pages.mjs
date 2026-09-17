import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('dist/releases/manifest.json', 'utf8'));
let home = readFileSync('dist/index.html', 'utf8');
const content = {
  sidequest: {
    title: 'SideQuest — Make more memories together',
    description: 'Discover activities, plan with your private friend group, and save the memories. Explore SideQuest and download the Android test APK.',
    intro: 'Good plans. Great company.',
    body: 'From the first “anyone keen?” to the photos you’ll keep.',
    features: [
      ['Find your next thing', 'Browse activities by cost, time and group size. Save a favourite for later.'],
      ['Make the plan', 'Poll a date, collect RSVPs, and keep your schedule and group chat together.'],
      ['Keep the good bits', 'Save photos, videos and inside jokes in your private group.'],
    ],
    firstTitle: 'Bring your people.',
    first: 'Sign in with Google or email, then create a private group or join one with an invite. Head to Discover for activity ideas and turn one into a plan.',
    caveat: 'SideQuest uses hosted services for accounts, group data and media. It needs an internet connection. Current notifications are inside the app; these test builds are still being refined.',
  },
  macrova: {
    title: 'Macrova — Food logging, without the homework',
    description: 'Keep a food journal with photo, voice, text or manual entry. Understand Macrova’s estimates and test-build requirements, and download the Android APK.',
    intro: 'Less food admin. More living.',
    body: 'Start with what you know. You decide what goes in your journal.',
    features: [
      ['Start with what you know', 'Use a photo, voice or text. Enter known nutrition manually when you have it.'],
      ['Have the final say', 'Review portions and assumptions before saving. With AI connected, adjust and re-estimate.'],
      ['See your days together', 'Browse daily logs, edit meals and repeat favourites. Food logs stay on your device.'],
    ],
    firstTitle: 'Start with one meal.',
    first: 'Use the local explore flow to try manual food entry, then review and save a meal. AI estimation and USDA food or barcode lookup need a reachable backend configured by your test organiser.',
    caveat: 'The download does not include a public AI server. Firebase account availability depends on configuration. Explore entries can be temporary, and local food logs do not automatically transfer to another phone.',
  },
  revisen: {
    title: 'Revisen — Your mistakes. Your next step.',
    description: 'Turn first-year maths and engineering questions into focused practice. Link mistakes to course materials and download the Revisen Android pilot.',
    intro: 'Make the tricky bits click.',
    body: 'Your questions. Your course. A clearer next step.',
    features: [
      ['Keep the question', 'Capture a problem from text, a screenshot or your camera. Keep your working alongside it.'],
      ['Connect it to your course', 'Add course materials, review suggested passages, and confirm the links that help.'],
      ['Practise the next step', 'Get checked practice for supported maths and motion questions. Self-mark other questions and revisit when due.'],
    ],
    firstTitle: 'Connect, then get curious.',
    first: 'Get a reachable Revisen server URL from your test organiser and enter it in Connection settings. You can then create an account or explore the server’s sample workspace.',
    caveat: 'This is a server-dependent pilot. Without a reachable backend, the learning workspace will not work. Optional AI transcription and explanations need a configured Gemini service; they do not establish mastery or grade all question types.',
  },
};
const logo='<a class="wordmark" href="/" aria-label="Kokonut home"><img class="coconut-logo" src="/favicon.svg" alt="" width="38" height="38">Kokonut.</a>';
for(const app of manifest.releases){
  const data=content[app.id];
  const feature=home.match(new RegExp(`<article class="app-feature ${app.id}"[^]*?</article>`))?.[0];
  if(!feature) throw new Error(`Missing ${app.id} homepage feature`);
  const hero=feature.replace('<h3>','<h1>').replace('</h3>','</h1>').replace(/<a class="text-link"[^]*?<\/a>/,'<a class="button button-dark" href="#test-build">Get the test build <span aria-hidden="true">↓</span></a>');
  const cards=data.features.map(([title,copy],index)=>`<article><span class="step-number">0${index+1}</span><h3>${title}</h3><p>${copy}</p></article>`).join('');
  const other=manifest.releases.filter(item=>item.id!==app.id).map(item=>`<a href="/${item.id}/">Explore ${item.name} <span aria-hidden="true">↗</span></a>`).join('');
  const html=`<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f7f8f2"><title>${data.title} — Kokonut</title><meta name="description" content="${data.description}"><meta property="og:title" content="${data.title}"><meta property="og:description" content="${data.description}"><meta property="og:type" content="website"><meta property="og:url" content="https://kokonut.cc/${app.id}/"><link rel="canonical" href="https://kokonut.cc/${app.id}/"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script></head><body class="app-page app-page-${app.id}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap">${logo}<nav aria-label="Main navigation"><a href="/#apps">All apps</a><a class="nav-download" href="#test-build">Download <span aria-hidden="true">↓</span></a></nav></header><main id="main"><div class="wrap"><nav class="app-breadcrumb" aria-label="Breadcrumb"><a href="/">Kokonut</a><span aria-hidden="true">/</span><span aria-current="page">${app.name}</span></nav>${hero}<section class="app-story" aria-labelledby="app-story-title"><p class="eyebrow">WHAT YOU CAN DO</p><h2 id="app-story-title">${data.intro}</h2><p class="app-story-intro">${data.body}</p><div class="app-capabilities">${cards}</div></section><section class="app-test-build" id="test-build" aria-labelledby="test-title"><div><p class="eyebrow">EARLY ACCESS / ANDROID</p><h2 id="test-title">Try <em>${app.name}.</em></h2><h3>${data.firstTitle}</h3><p>${data.first}</p><p class="app-caveat">${data.caveat}</p></div><div class="app-download-panel"><span class="build-badge">${app.id==='revisen'?'BACKEND SETUP REQUIRED':'DEVELOPMENT TEST BUILD'}</span><h3>${app.name} ${app.version}</h3><p>${(app.bytes/1e6).toFixed(1)} MB · Android ${app.minAndroid}+<br>Published 17 September 2026</p><a class="button button-dark" href="${app.url}" aria-label="Download ${app.name} APK, ${(app.bytes/1e6).toFixed(1)} MB">Download APK <span aria-hidden="true">↓</span></a><a class="release-detail-link" href="/releases/#${app.id}">File details &amp; SHA-256 checksum</a><a class="release-detail-link" href="/#install">How to install on Android</a><p class="platform-note">APKs do not install on iPhone or iPad.</p></div></section><nav class="more-apps" aria-label="More Kokonut apps"><span>More from the coconut.</span>${other}</nav></div></main><footer class="site-footer"><div class="wrap"><a class="footer-wordmark" href="/" aria-label="Kokonut home">Kokonut<img src="/favicon.svg" alt="" width="140" height="140"></a><div class="footer-bottom"><span>© <span data-year>2026</span> Kokonut. Made with curiosity.</span><div><a href="/">Home</a><a href="/releases/">Release details</a><a href="/privacy/">Website privacy</a></div></div></div></footer></body></html>\n`;
  mkdirSync(`dist/${app.id}`,{recursive:true});
  writeFileSync(`dist/${app.id}/index.html`,html);
  home=home.replace(`href="#${app.id}"`,`href="/${app.id}/"`);
  home=home.replace(new RegExp(`(<article class="app-feature ${app.id}"[^]*?<a class="text-link" href=")[^"]+`),`$1/${app.id}/`);
}
writeFileSync('dist/index.html',home);
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','sidequest/','macrova/','revisen/','releases/','privacy/'].map(path=>`<url><loc>https://kokonut.cc/${path}</loc></url>`).join('')}</urlset>\n`);
console.log('Rendered three dedicated app pages, linked from the homepage and sitemap.');
