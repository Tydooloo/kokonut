// Generates every page. Run after any content change: node scripts/build.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { page, footer, escape as esc, words, logo, ext } from './layout.mjs';
import { studio, links, haste, burble, cairn, aaron } from './content.mjs';
import { icon } from './icons.mjs';

// Template lines whose interpolation is empty would leave trailing spaces and blank lines.
const tidy = html => html.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
const save = (path, html) => { mkdirSync(`dist/${path}`, { recursive: true }); writeFileSync(`dist/${path}index.html`, tidy(html)); };
const json = value => esc(JSON.stringify(value));

/* ---------- Shared components ---------- */

const store = (href, kind) => `<a class="store" href="${href}" ${ext}>${icon(kind === 'ios' ? 'phone' : 'play')}<span><small>${kind === 'ios' ? 'Download on the' : 'Get it on'}</small><strong>${kind === 'ios' ? 'App Store' : 'Google Play'}</strong></span></a>`;
const stores = (ios, android) => `<div class="stores">${store(ios, 'ios')}${store(android, 'android')}</div>`;
// The small way back to the studio that every product page carries.
const studioChip = () => `<a class="studio-chip" href="/" aria-label="Kokonut, the studio">${logo(20)}<span>kokonut</span></a>`;
const hasteIcon = (size = 28) => `<img class="app-icon" src="/assets/haste/icon.webp" alt="" width="${size}" height="${size}">`;
const stones = `<svg class="stones" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><ellipse cx="16" cy="25.5" rx="12" ry="4.5"/><ellipse cx="15" cy="16.5" rx="8.5" ry="3.8"/><ellipse cx="17" cy="9" rx="5.5" ry="3"/><ellipse cx="15.5" cy="3.6" rx="2.8" ry="1.9"/></svg>`;

/* ---------- Hub ---------- */

const slides = [
  { id: 'haste', no: '01', name: 'Haste', kind: haste.tagline, line: 'Log a meal in seconds.', status: 'Out now · iPhone and Android', href: '/haste/' },
  { id: 'burble', no: '02', name: 'Burble', kind: burble.tagline, line: 'The notebook that organizes itself.', status: 'Out now · iPhone, Android and web', href: '/burble/' },
  { id: 'cairn', no: '03', name: 'Cairn', kind: cairn.tagline, line: 'Your production sounds, live.', status: 'Concept · Waitlist open', href: '/cairn/' },
];

save('', page({
  world: 'hub',
  title: 'Kokonut — Haste, Burble and Cairn',
  description: 'Kokonut is an independent studio from New Zealand. It makes Haste, an AI calorie tracker, and Burble, an AI notebook, and is planning Cairn, a universal pedal for the stage.',
  body: `<div class="hub" data-hub data-active="haste">
<div class="hub-bg" aria-hidden="true"><i data-bg="haste"></i><i data-bg="burble"></i><i data-bg="cairn"></i></div>
<div class="hub-stage" data-hub-stage><canvas aria-hidden="true"></canvas></div>
<header class="hub-top">
  <a class="hub-brand" href="/" aria-label="Kokonut home">${logo(28)}<span>kokonut</span></a>
  <a class="hub-person" href="/aaron/"><span>Made by Aaron Ko</span>${icon('arrowUpRight')}</a>
</header>
<main id="main" class="hub-main">
  <h1 class="hub-h1">An independent studio.<br>Three things worth making.</h1>
  <div class="hub-slides">${slides.map((s, i) => `
    <article class="hub-slide${i ? '' : ' is-active'}" data-slide="${s.id}"${i ? ' inert' : ''}>
      <p class="hub-no"><span>${s.no}</span> / 03 · ${s.kind}</p>
      <h2 class="hub-name">${s.name}</h2>
      <p class="hub-line">${s.line}</p>
      <p class="hub-status"><i></i>${s.status}</p>
      <a class="hub-enter" href="${s.href}">Enter ${s.name} ${icon('arrowRight')}</a>
    </article>`).join('')}
  </div>
  <div class="hub-controls">
    <button class="hub-arrow" type="button" data-hub-prev aria-label="Previous product">${icon('arrowLeft')}</button>
    <div class="hub-tabs" role="tablist" aria-label="Products">${slides.map((s, i) => `<button type="button" role="tab" aria-selected="${!i}" data-tab="${s.id}">${s.name}</button>`).join('')}</div>
    <button class="hub-arrow" type="button" data-hub-next aria-label="Next product">${icon('arrowRight')}</button>
  </div>
  <p class="hub-hint">Drag to turn</p>
</main>
${footer({ note: 'Kokonut is a one-person studio in Auckland, New Zealand.', extra: [['Website privacy', '/privacy/'], ['GitHub', studio.github, true]] })}
</div>`,
}));

/* ---------- Haste ---------- */

const demo = () => `<div class="demo" data-demo data-meals="${json(haste.demo)}">
  <div class="demo-input">
    <p class="demo-label">${icon('mic')} What did you eat?</p>
    <div class="demo-field"><span data-demo-typed>Pick a meal below</span><i class="caret" aria-hidden="true"></i></div>
    <div class="demo-chips" role="group" aria-label="Sample meals">${haste.demo.map((m, i) => `<button type="button" data-meal="${i}" aria-pressed="false">${m.label}</button>`).join('')}</div>
    <button class="btn demo-run" type="button" data-demo-run disabled>${icon('spark')} Estimate</button>
  </div>
  <div class="demo-result" aria-live="polite">
    <div class="demo-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="demo-ring-fill" cx="60" cy="60" r="52"/></svg><p><strong data-kcal>0</strong><small>kcal</small></p></div>
    <dl class="demo-macros">${[['protein', 'Protein'], ['carbs', 'Carbs'], ['fat', 'Fat']].map(([id, label]) => `<div class="macro-${id}"><dt>${label}</dt><dd><span data-macro="${id}">0</span>g</dd><i><b data-bar="${id}"></b></i></div>`).join('')}</dl>
    <p class="demo-status" data-demo-status>Your estimate appears here. You review it before anything is saved.</p>
    <button class="btn btn-quiet demo-save" type="button" data-demo-save disabled>${icon('check')} Save to journal</button>
  </div>
  <p class="demo-note">A demo with example numbers. The app estimates from your photo, voice or text and shows its confidence.</p>
</div>`;

save('haste/', page({
  world: 'haste',
  title: 'Haste — AI calorie tracker for iPhone and Android',
  description: haste.description,
  path: 'haste/',
  body: `<div class="h-stage" data-haste-stage data-screens="${json(haste.screens.map(s => s.id))}" aria-hidden="true"><canvas></canvas></div>
<header class="h-nav" data-nav>
  <a class="h-brand" href="/haste/" aria-current="page">${hasteIcon(30)}<span>Haste</span></a>
  <nav aria-label="On this page"><a href="#how">How it works</a><a href="#try">Try it</a><a href="#features">Features</a><a href="#faq">Questions</a></nav>
  <div class="h-nav-end">${studioChip()}<a class="btn btn-small" href="#get">Get the app</a></div>
</header>
<main id="main">
<section class="h-hero">
  <div class="h-hero-copy">
    <p class="h-kicker reveal"><i></i>Out now on iPhone and Android</p>
    <h1 class="h-display" data-words>${words('Log a meal|in *seconds.*')}</h1>
    <p class="h-lead reveal" style="--i:3">Snap a photo, say it out loud or type it. Haste estimates the calories and macros, you check the numbers, and your streak keeps going.</p>
    <div class="reveal" style="--i:4">${stores(links.hasteIos, links.hasteAndroid)}</div>
    <p class="h-fine reveal" style="--i:5">Free to download · No ads · Voice stays on your phone</p>
  </div>
  <div class="h-hero-phone">
    <div class="h-anchor" data-anchor data-yaw="-0.48" data-pitch="0.08" data-roll="0.07" data-screen="1"><img class="h-fallback" src="/assets/haste/screen-journal.webp" alt="The Haste journal: today’s calories and macros" width="330" height="717"></div>
    <p class="h-float h-float-a" aria-hidden="true"><strong>620</strong> kcal<small>Chicken, rice &amp; broccoli</small></p>
    <p class="h-float h-float-b" aria-hidden="true"><i></i>High confidence</p>
    <p class="h-float h-float-c" aria-hidden="true">${icon('flame')}<strong>12</strong> day streak</p>
  </div>
  <a class="h-scroll" href="#how"><span>See how it works</span>${icon('arrowDown')}</a>
</section>

<section class="h-story" id="how" data-story>
  <div class="h-story-phone"><div class="h-anchor" data-anchor data-story-anchor data-yaw="0.36" data-pitch="0.04" data-roll="-0.03" data-screen="0"></div></div>
  <div class="h-steps">${haste.screens.map((s, i) => `
    <article class="h-step" data-step="${i}">
      <p class="h-step-no">0${i + 1}<span>${s.label}</span></p>
      <h2 class="h-headline" data-words>${words(s.title)}</h2>
      <p class="h-step-text reveal" style="--i:2">${s.text}</p>
      <img class="h-step-shot" src="/assets/haste/screen-${s.id}.webp" alt="The ${s.label} screen in Haste" width="330" height="717" loading="lazy">
    </article>`).join('')}
  </div>
</section>

<section class="h-try" id="try"><div class="wrap">
  <div class="h-head"><p class="h-eyebrow reveal">Try it</p><h2 class="h-headline" data-words>${words('Say it.|*Watch it add up.*')}</h2><p class="h-sub reveal" style="--i:2">Pick a meal and press Estimate. This is the whole loop: capture, estimate, review, save.</p></div>
  ${demo()}
</div></section>

<section class="h-features" id="features"><div class="wrap">
  <div class="h-head"><p class="h-eyebrow reveal">Features</p><h2 class="h-headline" data-words>${words('Small app.|*Sharp tools.*')}</h2></div>
  <div class="bento">${haste.features.map((f, i) => `<article class="tile${f.size ? ` tile-${f.size}` : ''} reveal" style="--i:${i % 4}">
    <span class="tile-icon">${icon(f.icon)}</span>${f.stat ? `<p class="tile-stat"><span data-count="${f.stat}">${f.stat}</span><small>${f.statLabel}</small></p>` : ''}
    <h3>${f.title}</h3><p>${f.text}</p></article>`).join('')}</div>
</div></section>

<section class="h-privacy"><div class="wrap h-privacy-grid">
  <div class="h-head"><p class="h-eyebrow reveal">Privacy</p><h2 class="h-headline" data-words>${words('What you eat|is *your business.*')}</h2><p class="h-sub reveal" style="--i:2"><a href="${haste.privacyPolicy}" ${ext}>Read the privacy policy ${icon('arrowUpRight')}</a></p></div>
  <ul class="h-checks">${haste.privacy.map((line, i) => `<li class="reveal" style="--i:${i}">${icon('check')}<span>${line}</span></li>`).join('')}</ul>
</div></section>

<section class="h-faq" id="faq"><div class="wrap h-faq-grid">
  <div class="h-head"><p class="h-eyebrow reveal">Questions</p><h2 class="h-headline" data-words>${words('Good to|*know.*')}</h2><p class="h-sub reveal" style="--i:2">Something else? <a href="/haste/support/">Visit support</a>.</p></div>
  <div class="faq">${haste.faq.map(([q, a]) => `<details><summary>${q}<i aria-hidden="true"></i></summary><p>${a}</p></details>`).join('')}</div>
</div></section>

<section class="h-get" id="get"><div class="wrap h-get-grid">
  <div class="h-get-copy">
    <h2 class="h-display" data-words>${words('Start with|*your next meal.*')}</h2>
    <p class="h-lead reveal" style="--i:3">Haste is free on the App Store and Google Play. Your journal syncs between phones.</p>
    <div class="reveal" style="--i:4">${stores(links.hasteIos, links.hasteAndroid)}</div>
  </div>
  <div class="h-get-phone"><div class="h-anchor" data-anchor data-yaw="0.3" data-pitch="0.02" data-roll="-0.05" data-screen="2"></div></div>
</div></section>
</main>
${footer({ note: 'Haste is made by Kokonut. Estimates can be wrong; check portions and labels before you rely on them. Not a medical device.', extra: [['Haste support', '/haste/support/'], ['Privacy policy', haste.privacyPolicy, true], ['Website privacy', '/privacy/']] })}`,
}));

/* ---------- Burble ---------- */

const treeMarkup = () => `<ul class="tree" data-tree>${burble.tree.map(node => `<li data-node="${node.name}"><span>${icon(node.name === 'Calendar' ? 'calendar' : 'folder')}${node.name}</span>${node.children.length ? `<ul>${node.children.map(child => `<li data-node="${node.name}/${child}"><span>${icon('page')}${child}</span></li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>`;

save('burble/', page({
  world: 'burble',
  title: 'Burble — the notebook that organizes itself',
  description: burble.description,
  path: 'burble/',
  body: `<div class="b-sheets" data-sheets aria-hidden="true"><canvas></canvas></div>
<canvas class="b-ink" data-ink aria-hidden="true"></canvas>
<header class="b-nav" data-nav>
  <a class="b-brand" href="/burble/" aria-current="page"><span class="b-mark" aria-hidden="true">B</span>Burble</a>
  <nav aria-label="On this page"><a href="#how">How it works</a><a href="#try">Try it</a><a href="#features">Features</a><a href="#get">Get Burble</a></nav>
  <div class="b-nav-end">${studioChip()}<a class="b-btn b-btn-small" href="${links.burbleWeb}" ${ext}>Open Burble</a></div>
</header>
<main id="main">
<section class="b-hero">
  <p class="b-kicker reveal">AI note-taking · iPhone, Android and the web</p>
  <h1 class="b-display" data-words>${words('The notebook that|*organizes itself.*')}</h1>
  <svg class="b-underline" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M6 24C90 8 170 34 262 20S430 6 506 22c34 7 62 6 88-2" pathLength="1"/></svg>
  <p class="b-lead reveal" style="--i:4">Type, write by hand, talk or snap a photo. Burble puts every thought in the right place, in open files that stay yours.</p>
  <div class="b-actions reveal" style="--i:5">
    <a class="b-btn" href="${links.burbleWeb}" ${ext}>${icon('globe')} Open Burble in your browser</a>
    ${stores(links.burbleIos, links.burbleAndroid)}
  </div>
  <p class="b-fine reveal" style="--i:6">Nothing to install on the web. Make an account and your notebook is on every device.</p>
  <p class="b-hint" aria-hidden="true">${icon('pen')} Move your cursor. This page takes ink.</p>
</section>

<section class="b-filing" id="how" data-filing>
  <div class="b-pin">
    <div class="b-stacks" aria-hidden="true"><p class="b-search">${icon('search')}<span>tomatoes</span><i></i></p>${burble.stacks.map(name => `<div class="b-stack" data-stack><span>${name}</span></div>`).join('')}</div>
    <div class="b-steps">${burble.steps.map((s, i) => `
      <article class="b-step${i ? '' : ' is-active'}" data-step="${i}">
        <p class="b-step-no">0${i + 1} — ${s.label}</p>
        <h2 class="b-headline">${words(s.title)}</h2>
        <p>${s.text}</p>
      </article>`).join('')}
    </div>
    <ol class="b-dots" aria-hidden="true">${burble.steps.map((s, i) => `<li${i ? '' : ' class="is-active"'}>${s.label}</li>`).join('')}</ol>
  </div>
</section>

<section class="b-try" id="try"><div class="b-wrap">
  <header class="b-head"><p class="b-eyebrow reveal">Try it</p><h2 class="b-headline" data-words>${words('Write something.|*Watch where it goes.*')}</h2></header>
  <div class="b-demo" data-file-demo data-samples="${json(burble.demo)}">
    <div class="b-capture">
      <label for="capture">Capture</label>
      <div class="b-field"><input id="capture" type="text" autocomplete="off" maxlength="80" placeholder="Type a thought, or pick one below" data-capture><button type="button" data-capture-go aria-label="File this note">${icon('arrowUp')}</button></div>
      <div class="b-chips" role="group" aria-label="Sample captures">${burble.demo.map((d, i) => `<button type="button" data-sample="${i}">${d.label}</button>`).join('')}</div>
      <p class="b-toast" data-toast role="status"><span data-toast-text>Burble shows you where each note went.</span><button type="button" data-undo hidden>${icon('undo')} Undo</button></p>
    </div>
    <div class="b-vault">
      <p class="b-vault-title">${icon('search')} Your notebook</p>
      ${treeMarkup()}
    </div>
    <p class="b-note">An example with sample filing rules. The app reads what you wrote and files it with AI, then learns from your corrections.</p>
  </div>
</div></section>

<section class="b-features" id="features"><div class="b-wrap">
  <header class="b-head"><p class="b-eyebrow reveal">Features</p><h2 class="b-headline" data-words>${words('Everything a notebook|*should already do.*')}</h2></header>
  <div class="b-grid">${burble.features.map((f, i) => `<article class="reveal" style="--i:${i % 3}"><span>${f.no}</span><h3>${f.title}</h3><p>${f.text}</p></article>`).join('')}</div>
</div></section>

<section class="b-get" id="get"><div class="b-wrap">
  <p class="b-eyebrow reveal">Get Burble</p>
  <h2 class="b-display" data-words>${words('On every screen|*you own.*')}</h2>
  <ul class="b-platforms reveal" style="--i:3">${burble.platforms.map(name => `<li>${name}</li>`).join('')}</ul>
  <div class="b-get-grid">
    <div class="b-web reveal">
      <h3>${icon('globe')} On the web</h3>
      <p>Burble runs in your browser as a full app, not a preview. Make an account, and the notes you write here are on your phone before you’ve picked it up.</p>
      <a class="b-btn" href="${links.burbleWeb}" ${ext}>Open Burble ${icon('arrowUpRight')}</a>
      <a class="b-text-link" href="${links.burbleWeb}" ${ext}>Create an account</a>
    </div>
    <div class="b-apps reveal" style="--i:1">
      <h3>${icon('phone')} On your phone and tablet</h3>
      <p>Native apps for iPhone, iPad and Android, with widgets, the share sheet and a pen that keeps up with your hand.</p>
      ${stores(links.burbleIos, links.burbleAndroid)}
    </div>
  </div>
  <ul class="b-principles">${burble.principles.map((line, i) => `<li class="reveal" style="--i:${i}">${line}</li>`).join('')}</ul>
</div></section>
</main>
${footer({ note: 'Burble is made by Kokonut. Black ink on paper.', extra: [['Website privacy', '/privacy/'], ['Contact', `mailto:${studio.email}?subject=Burble`]] })}`,
}));

/* ---------- Cairn ---------- */

save('cairn/', page({
  world: 'cairn',
  title: 'Cairn — the universal pedal',
  description: cairn.description,
  path: 'cairn/',
  body: `<header class="c-nav" data-nav>
  <a class="c-brand" href="/cairn/" aria-current="page">${stones}<span>Cairn</span></a>
  <nav aria-label="On this page"><a href="#about">What it is</a><a href="#waitlist">Waitlist</a></nav>
  <div class="c-nav-end">${studioChip()}<a class="c-btn c-btn-small" href="#waitlist">Join the waitlist</a></div>
</header>
<main id="main">
<section class="c-hero">
  <p class="c-status reveal"><i></i>Concept · Waitlist open</p>
  <h1 class="c-poster"><span>Your sound,</span><span class="c-poster-b">on stage.</span></h1>
  <div class="c-stage" data-pedal-stage role="img" aria-label="A glowing outline of a pedal with a question mark on it. Cairn has not been designed yet."><canvas></canvas></div>
  <div class="c-hero-foot">
    <p class="c-lead reveal">Cairn is a universal pedal that brings your production sounds to the stage, live.</p>
    <div class="c-hero-actions reveal" style="--i:1"><a class="c-btn" href="#waitlist">Join the waitlist</a></div>
  </div>
  <p class="c-hint" aria-hidden="true">Still taking shape · Drag to turn</p>
</section>

<section class="c-about" id="about"><div class="c-wrap">
  <h2 class="c-headline" data-words>${words('Not just|a guitar pedal.')}</h2>
  <p class="c-lead reveal" style="--i:2">Most pedals give you their sounds. Cairn is meant to give you yours, on anything you play or sing.</p>
</div></section>

<section class="c-pillars"><div class="c-wrap c-pillar-grid">${cairn.pillars.map((p, i) => `<article class="reveal" style="--i:${i}"><p class="c-stat">${p.stat}</p><h3>${p.label}</h3><p>${p.text}</p></article>`).join('')}</div></section>

<section class="c-cta" id="waitlist"><div class="c-wrap">
  <h2 class="c-poster c-poster-small" data-words>${words('Be first|on the floor.')}</h2>
  <p class="c-lead reveal" style="--i:2">Cairn is an idea we haven’t started building yet. Join the waitlist to hear when we do, and to be first in line.</p>
  <a class="c-btn c-btn-big reveal" style="--i:3" href="${links.cairnWaitlist}">${icon('mail')} Join the waitlist</a>
  <p class="c-fine reveal" style="--i:4">Opens your mail app. Tell us what you play.</p>
</div></section>
</main>
${footer({ note: 'Cairn is a concept from Kokonut. Development has not started, and nothing shown here is a final design.', extra: [['Website privacy', '/privacy/'], ['Contact', `mailto:${studio.email}?subject=Cairn`]] })}`,
}));

/* ---------- Aaron Ko: portfolio ---------- */

save('aaron/', page({
  world: 'aaron',
  title: 'Aaron Ko — student, founder, builder',
  description: aaron.description,
  path: 'aaron/',
  body: `<header class="a-nav" data-nav>
  <a class="a-mark" href="/aaron/" aria-current="page">Aaron Ko</a>
  <p class="a-where"><i></i>${aaron.location} · <span data-clock></span></p>
  <nav aria-label="On this page"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
</header>
<main id="main">
<section class="a-hero" data-hero>
  <div class="a-stage" data-ring-stage data-projects="${json(aaron.projects.map(p => p.id))}" aria-hidden="true"><canvas></canvas></div>
  <img class="a-portrait" data-portrait src="${aaron.portrait}" alt="Aaron Ko" width="900" height="1125" fetchpriority="high">
  <div class="a-hero-copy">
    <p class="a-kicker reveal">Hi, I’m Aaron</p>
    <h1 class="a-display" data-words>${words('Student, founder,|*builder of things.*')}</h1>
    <a class="a-pill reveal" style="--i:4" href="#work"><i>${icon('arrowDown')}</i>See the work</a>
  </div>
  <blockquote class="a-quote reveal" style="--i:5"><p>“${aaron.quote}”</p><footer>${aaron.university}</footer></blockquote>
</section>

<section class="a-work" id="work">
  <header class="a-head"><p class="a-label reveal">Selected work</p><h2 class="a-headline" data-words>${words('Four things I’ve|*made from nothing.*')}</h2></header>
  <ol class="a-projects">${aaron.projects.map(p => `
    <li class="a-project reveal" data-project="${p.id}">
      <a class="a-project-link" href="${p.href}" aria-label="${p.name}: ${p.kind}">
        <span class="a-no">${p.no}</span>
        <h3>${p.name}</h3>
        <span class="a-kind">${p.kind}</span>
        <span class="a-year">${p.year}</span>
        <span class="a-go">${icon('arrowUpRight')}</span>
      </a>
      <div class="a-project-body">
        <div class="a-cover" data-tilt><canvas data-cover="${p.id}" width="960" height="640" role="img" aria-label="${p.name} cover art"></canvas></div>
        <div class="a-project-text">
          <p class="a-summary">${p.summary}</p>
          <ul>${p.points.map(point => `<li>${point}</li>`).join('')}</ul>
          <dl><div><dt>Role</dt><dd>${p.role}</dd></div><div><dt>Built with</dt><dd>${p.stack.join(' · ')}</dd></div></dl>
        </div>
      </div>
    </li>`).join('')}
  </ol>
</section>

<section class="a-about" id="about">
  <header class="a-head"><p class="a-label reveal">About</p><h2 class="a-headline" data-words>${words('I take ideas|*the whole way.*')}</h2></header>
  <div class="a-about-grid">
    <div class="a-bio">${aaron.about.map((text, i) => `<p class="reveal" style="--i:${i}">${text}</p>`).join('')}
      <dl class="a-facts reveal" style="--i:2"><div><dt>Studying at</dt><dd>${aaron.university}</dd></div><div><dt>Based in</dt><dd>${aaron.location}</dd></div><div><dt>Founder of</dt><dd><a href="/">Kokonut</a></dd></div></dl>
    </div>
    <div class="a-skills">${aaron.skills.map(([group, items], i) => `<div class="reveal" style="--i:${i}"><h3>${group}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></div>`).join('')}
      <div class="reveal" style="--i:3"><h3>Earlier</h3><ul class="a-earlier">${aaron.earlier.map(([name, text, tech]) => `<li><strong>${name}</strong> ${text} <small>${tech}</small></li>`).join('')}</ul></div>
    </div>
  </div>
</section>

<section class="a-contact" id="contact">
  <p class="a-label reveal">Contact</p>
  <h2 class="a-mega" data-words>${words('Let’s make|*something good.*')}</h2>
  <div class="a-contact-row reveal" style="--i:3">
    <a class="a-mail" href="mailto:${aaron.email}">${aaron.email} ${icon('arrowUpRight')}</a>
    <a class="a-pill" href="${aaron.github}" ${ext}><i>${icon('github')}</i>GitHub</a>
  </div>
</section>
</main>
${footer({ note: 'Designed and built by Aaron Ko. Every scene on this site is drawn in code.', extra: [['Website privacy', '/privacy/']] })}`,
}));

/* ---------- Plain pages: support, privacy, 404 ---------- */

const plainTop = () => `<header class="p-nav"><a class="p-brand" href="/" aria-label="Kokonut home">${logo(26)}<span>kokonut</span></a><nav aria-label="Products"><a href="/haste/">Haste</a><a href="/burble/">Burble</a><a href="/cairn/">Cairn</a></nav></header>`;
const plainFoot = () => footer({ note: 'Kokonut is a one-person studio in Auckland, New Zealand.', extra: [['Haste support', '/haste/support/'], ['Website privacy', '/privacy/']] });

save('haste/support/', page({
  world: 'plain',
  title: 'Haste support — Kokonut',
  description: 'Help with Haste: common questions, the support email, the privacy policy and account deletion.',
  path: 'haste/support/',
  body: `${plainTop()}<main class="prose" id="main">
<p class="eyebrow">${hasteIcon(22)} Haste support</p>
<h1 data-words>${words('How can|we *help?*')}</h1>
<p class="prose-lead">Email <a href="${haste.supportMail}">${studio.email}</a> and a person will reply. Include your phone model and what you were doing, and we can usually sort it out in one message.</p>
<div class="prose-actions"><a class="p-btn" href="${haste.supportMail}">${icon('mail')} Email support</a><a class="p-btn p-btn-ghost" href="/haste/">About Haste</a></div>
<h2>Common questions</h2>
<div class="faq">${haste.faq.map(([q, a]) => `<details><summary>${q}<i aria-hidden="true"></i></summary><p>${a}</p></details>`).join('')}</div>
<h2>Your account and data</h2>
<p><a href="${haste.privacyPolicy}" ${ext}>Haste privacy policy</a> · <a href="${haste.deleteAccount}" ${ext}>Delete your account</a></p>
<p>You can also export your journal as a ZIP, or delete your account and its data, from Settings in the app.</p>
</main>${plainFoot()}`,
}));

save('privacy/', page({
  world: 'plain',
  title: 'Website privacy — Kokonut',
  description: 'How the Kokonut website handles visitor information.',
  path: 'privacy/',
  body: `${plainTop()}<main class="prose" id="main">
<p class="eyebrow">Website privacy</p>
<h1 data-words>${words('A little|*clarity.*')}</h1>
<p class="prose-lead">This page covers kokonut.cc. Haste has its own <a href="${haste.privacyPolicy}" ${ext}>privacy policy</a>.</p>
<h2>Browsing</h2>
<p>This website doesn’t use analytics, advertising trackers, sign-up forms or cookies, and it doesn’t write to your browser’s storage. It never asks for your location, camera, microphone or contacts. The “Pause motion” setting lasts for the current page only.</p>
<p>Our hosting and network providers process ordinary request information, like IP addresses, requested pages and browser details, to serve and protect the site. Fonts, scripts, 3D graphics and images all come from this website; no third-party CDN is contacted.</p>
<h2>The demos</h2>
<p>The Haste meal demo and the Burble filing demo run entirely in your browser. Nothing you pick or type is sent anywhere.</p>
<h2>Email and stores</h2>
<p>Email links open your own mail app. If you write to us, we use your message only to reply. App Store and Google Play links lead to Apple and Google, which handle those visits under their own privacy terms.</p>
<p><a href="/">Back to Kokonut</a></p>
</main>${plainFoot()}`,
}));

writeFileSync('dist/404.html', tidy(page({
  world: 'plain',
  title: 'Page not found — Kokonut',
  description: 'That page has wandered off.',
  body: `${plainTop()}<main class="prose not-found" id="main"><img class="lost-coconut" src="/assets/logo.svg" alt="" width="96" height="96"><p class="eyebrow">404</p><h1 data-words>${words('This one|*wandered off.*')}</h1><p class="prose-lead">The page may have moved. Everything Kokonut makes is one click away.</p><div class="prose-actions"><a class="p-btn" href="/">Back to Kokonut ${icon('arrowRight')}</a></div></main>${plainFoot()}`,
})));

const sitemap = ['', 'haste/', 'burble/', 'cairn/', 'aaron/', 'haste/support/', 'privacy/'];
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(path => `<url><loc>${studio.url}/${path}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${sitemap.length + 1} pages: hub, Haste, Burble, Cairn, the portfolio, Haste support, privacy and 404.`);
