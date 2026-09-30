export const pages = [
  ['Home', '/'], ['SideQuest', '/sidequest/'], ['Haste', '/haste/'],
  ['Revisen', '/revisen/'], ['VST Pedal', '/pedal/'],
  ['Release details', '/releases/'], ['Website privacy', '/privacy/'],
];
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function header() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap">
  <a class="wordmark" href="/" aria-label="Kokonut home"><img src="/favicon.svg" alt="" width="37" height="37"><span class="wordmark-name">Kokonut</span></a>
  <nav aria-label="Main navigation"><a href="/#products">Products</a><a href="/#about">About me</a><a class="nav-download" href="/releases/">Downloads <span aria-hidden="true">↗</span></a></nav></header>`;
}
export function footer() {
  return `<footer class="site-footer"><div class="wrap"><div class="footer-top"><a class="footer-wordmark" href="/" aria-label="Kokonut home">Kokonut</a><p>Independent software.<br>A healthy sense of curiosity.</p></div>
  <nav class="footer-links" aria-label="Footer navigation">${pages.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}<a href="/#install">Installation help</a></nav>
  <div class="footer-bottom"><span>© <span data-year>2026</span> Kokonut</span><span>Small studio. Open possibilities.</span><button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false" aria-label="Pause animations" hidden>Pause motion</button><a href="#main">Back to top ↑</a></div></div></footer>`;
}
export function page({title, description, path = '', body, bodyClass = ''}) {
  return `<!doctype html>
<html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#efefe9">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="https://kokonut.cc/${path}">
<link rel="canonical" href="https://kokonut.cc/${path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script></head>
<body class="${bodyClass}">${header()}${body}${footer()}</body></html>\n`;
}
