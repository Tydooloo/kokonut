export const pages = [
  ['Home', '/'], ['SideQuest', '/sidequest/'], ['Haste', '/haste/'],
  ['Revisen', '/revisen/'], ['Release details', '/releases/'], ['Website privacy', '/privacy/'],
];

export function footer({home = false, compact = false} = {}) {
  const links = [...pages, ['Get the apps', '/#downloads'], ['How to install', '/#install']]
    .map(([label, href]) => `<a href="${href}">${label}<span aria-hidden="true">↗</span></a>`).join('');
  return `<footer class="site-footer${compact ? ' compact-footer' : ''}" data-motion-scene><div class="wrap">
${home ? '<div class="footer-top"><p>Stay a little<br><em>curious.</em></p><a href="/#apps">Meet the apps <span aria-hidden="true">↗</span></a></div>' : ''}
<nav class="footer-links" aria-label="Footer navigation">${links}</nav>
${compact ? '' : '<a class="footer-wordmark" href="/" aria-label="Kokonut home">Kokonut<img src="/favicon.svg" alt="" width="140" height="140"></a>'}
<div class="footer-bottom"><span>© <span data-year>2026</span> Kokonut. Made with curiosity.</span><div><button class="motion-toggle" type="button" data-motion-toggle aria-label="Scroll animations" aria-pressed="true" hidden>Motion on</button><a href="#main">Back to top ↑</a></div></div>
</div></footer>`;
}
