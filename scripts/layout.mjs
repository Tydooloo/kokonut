import { pages, studio } from './content.mjs';
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

export const logo = (size = 26) => `<img class="logo-mark" src="/assets/logo.svg" alt="" width="${size}" height="${size}">`;
export const ext = 'target="_blank" rel="noopener noreferrer"';

// Each world (hub, haste, burble, cairn, aaron, plain) has its own stylesheet, script,
// typefaces and browser chrome colour, so the designs stay independent.
const worlds = {
  hub: { theme: '#0c0d0c', scheme: 'dark', fonts: ['geist', 'instrument-serif-italic'] },
  haste: { theme: '#eef2e9', scheme: 'light', fonts: ['geist', 'instrument-serif-italic'] },
  burble: { theme: '#fbfaf7', scheme: 'light', fonts: ['newsreader', 'geist'] },
  cairn: { theme: '#0a0908', scheme: 'dark', fonts: ['anton', 'geist'] },
  aaron: { theme: '#0b0b0c', scheme: 'dark', fonts: ['instrument-serif', 'geist'] },
  plain: { theme: '#0c0d0c', scheme: 'dark', fonts: ['geist'] },
};

// The same destinations in every footer; each world styles them its own way.
export function footer({ note, extra = [] }) {
  const link = ([label, href, external]) => `<a href="${href}"${external ? ` ${ext}` : ''}>${label}</a>`;
  return `<footer class="foot"><div class="foot-in">
  <p class="foot-note">${note}</p>
  <nav class="foot-links" aria-label="Everything on this site">${pages.map(link).join('')}${extra.map(link).join('')}</nav>
  <div class="foot-base"><span>© <span data-year>2026</span> Kokonut</span><button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false">Pause motion</button><a href="#main">Back to top ${icon('arrowUp')}</a></div>
</div></footer>`;
}

export function page({ world, title, description, path = '', body, image = '/assets/haste/icon-512.jpg' }) {
  const { theme, scheme, fonts } = worlds[world];
  return `<!doctype html>
<html lang="en-NZ" data-world="${world}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="${theme}"><meta name="color-scheme" content="${scheme}">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${studio.url}/${path}"><meta property="og:image" content="${studio.url}${image}"><meta name="twitter:card" content="summary">
<link rel="canonical" href="${studio.url}/${path}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
${fonts.map(font => `<link rel="preload" href="/assets/fonts/${font}-latin.woff2" as="font" type="font/woff2" crossorigin>`).join('')}
<link rel="stylesheet" href="/css/base.css"><link rel="stylesheet" href="/css/${world}.css"><script src="/js/boot.js"></script><script type="module" src="/js/${world}.js"></script></head>
<body><a class="skip-link" href="#main">Skip to content</a>${body}</body></html>\n`;
}
