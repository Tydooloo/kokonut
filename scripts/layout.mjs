import { pages, studio, haste } from './content.mjs';
import { icon } from './icons.mjs';
export { pages };

export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Wrap each word so headings can rise into view word by word without layout shift.
// Accepts light inline markup: *a few words* becomes <em>, | forces a line break.
export function words(text) {
  let index = 0, emphasis = false;
  return text.split('|').map(line => line.trim().split(/\s+/).map(word => {
    const opens = word.startsWith('*');
    const close = /\*([.,!?]?)$/.exec(word);
    const bare = escape(word.replace(/^\*/, '').replace(/\*([.,!?]?)$/, '$1'));
    const inner = emphasis || opens ? `<em>${close ? bare.slice(0, bare.length - close[1].length) : bare}</em>${close ? close[1] : ''}` : bare;
    if (opens) emphasis = true;
    if (close) emphasis = false;
    return `<span class="w"><span style="--i:${index++}">${inner}</span></span>`;
  }).join(' ')).join('<br>');
}

const nav = [['Haste', '/#haste', 'haste'], ['Pedal', '/#pedal', 'pedal'], ['Studio', '/#studio', 'studio'], ['Contact', '/#contact', 'contact']];

export function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" data-header><div class="header-bar">
  <a class="brand" href="/" aria-label="Kokonut home"><img src="/favicon.svg" alt="" width="30" height="30"><span>Kokonut</span></a>
  <nav class="site-nav" aria-label="Main">${nav.map(([label, href, id]) => `<a href="${href}" data-nav="${id}">${label}</a>`).join('')}</nav>
  <a class="header-cta" href="/haste/#get">Get Haste ${icon('arrowUpRight')}</a>
</div></header>`;
}

export function footer() {
  const col = (title, links) => `<div class="footer-col"><h2>${title}</h2>${links.map(([label, href, external]) => `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}${external ? ` ${icon('arrowUpRight')}` : ''}</a>`).join('')}</div>`;
  return `<footer class="site-footer"><div class="wrap">
  <div class="footer-top">
    <div class="footer-brand"><a class="brand" href="/" aria-label="Kokonut home"><img src="/favicon.svg" alt="" width="30" height="30"><span>Kokonut</span></a><p>Independent software and curious hardware, made in New Zealand.</p></div>
    ${col('Products', [['Haste', '/haste/'], ['VST Pedal', '/pedal/'], ['Release details', '/releases/']])}
    ${col('Studio', [['Home', '/'], ['About', '/#studio'], ['Contact', '/#contact'], ['GitHub', studio.github, true]])}
    ${col('Legal', [['Website privacy', '/privacy/'], ['Haste privacy policy', haste.privacyPolicy, true], ['Haste support', '/haste/#support']])}
  </div>
  <div class="footer-wordmark" aria-hidden="true">Kokonut</div>
  <div class="footer-bottom"><span>© <span data-year>2026</span> Kokonut</span><button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false">Pause motion</button><a href="#main">Back to top ↑</a></div>
</div></footer>`;
}

export function page({ title, description, path = '', body, bodyClass = '', image = '/assets/haste/icon-512.jpg' }) {
  return `<!doctype html>
<html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0a0c0b"><meta name="color-scheme" content="dark">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${studio.url}/${path}"><meta property="og:image" content="${studio.url}${image}"><meta name="twitter:card" content="summary">
<link rel="canonical" href="${studio.url}/${path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/bricolage-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css"><script src="/js/boot.js"></script><script type="module" src="/js/main.js"></script></head>
<body class="${bodyClass}"><div class="scroll-progress" aria-hidden="true"></div>${header()}${body}${footer()}</body></html>\n`;
}
