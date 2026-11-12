// Site-wide behaviour. Heavy 3D modules load only when their section is near.
import { motion } from './motion.js';

const root = document.documentElement;
root.dataset.ready = '1';
root.dataset.motion = motion.paused ? 'off' : 'on';
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

$$('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

/* Header: frosted once scrolled, tucked away while reading downwards. */
const header = document.querySelector('[data-header]');
let lastY = scrollY, ticking = false;
const onScroll = () => {
  const y = scrollY;
  header.classList.toggle('is-scrolled', y > 24);
  if (!header.contains(document.activeElement)) header.classList.toggle('is-hidden', y > 360 && y > lastY + 2);
  if (y < lastY - 2) header.classList.remove('is-hidden');
  lastY = y; ticking = false;
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Reveal on scroll, plus number counters. */
const countUp = node => {
  const target = Number(node.dataset.count);
  if (motion.paused || !target) { node.textContent = target; return; }
  const start = performance.now(), duration = 1600;
  const step = now => {
    const t = Math.min(1, (now - start) / duration);
    node.textContent = Math.round(target * (1 - Math.pow(2, -10 * t)));
    if (t < 1) requestAnimationFrame(step); else node.textContent = target;
  };
  requestAnimationFrame(step);
};
const revealer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-in');
  $$('[data-count]', entry.target).forEach(countUp);
  revealer.unobserve(entry.target);
}), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
$$('[data-count]').forEach(node => { if (!motion.paused) node.textContent = '0'; });
$$('.reveal, [data-words]').forEach(node => revealer.observe(node));

/* Pointer-following light on cards, and magnetic buttons. */
if (finePointer) {
  $$('.spotlight').forEach(card => card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }));
  $$('[data-magnetic]').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (motion.paused) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * 0.18}px`);
      button.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * 0.3}px`);
    });
    button.addEventListener('pointerleave', () => { button.style.setProperty('--mx', '0px'); button.style.setProperty('--my', '0px'); });
  });
}

/* Motion toggle in the footer. */
const toggles = $$('[data-motion-toggle]');
const paintToggles = () => toggles.forEach(button => {
  button.setAttribute('aria-pressed', String(motion.paused));
  button.textContent = motion.paused ? 'Resume motion' : 'Pause motion';
});
toggles.forEach(button => button.addEventListener('click', () => motion.set(!motion.paused)));
motion.subscribe(paintToggles);
paintToggles();

/* Copy buttons (release checksums). */
$$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = 'Copied'; }
  catch { button.textContent = 'Select and copy'; }
  setTimeout(() => { button.textContent = 'Copy'; }, 2000);
}));

/* ---------- 3D ---------- */
const webgl = (() => {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); }
  catch { return false; }
})();
const whenNear = (element, callback, margin = '300px') => new IntersectionObserver((entries, observer) => {
  if (!entries[0].isIntersecting) return;
  observer.disconnect();
  callback();
}, { rootMargin: margin }).observe(element);
const warn = label => error => console.warn(`${label} unavailable`, error);

const hero = document.querySelector('[data-particles]');
const morphSwitch = document.querySelector('[data-morph-switch]');
const heroFallback = () => { hero?.classList.add('is-fallback'); if (morphSwitch) morphSwitch.hidden = true; };
if (hero && webgl) import('./particles.js').then(module => module.init(hero, morphSwitch)).catch(error => { heroFallback(); warn('Hero particles')(error); });
else heroFallback();

$$('[data-story]').forEach(story => {
  const stage = story.querySelector('[data-phone]');
  const tabs = $$('[data-screen]', story);
  const steps = $$('[data-step]', story);
  const fallbacks = $$('.phone-fallback img', story);
  const labels = tabs.map(tab => tab.textContent);
  let phone = null, current = 0;
  const show = index => {
    current = index;
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    fallbacks.forEach((img, i) => { img.hidden = i !== index; });
    stage.setAttribute('aria-label', `The Haste app on a 3D phone, showing the ${labels[index]} screen`);
    phone?.setScreen(index);
  };
  tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
  steps.forEach((step, i) => step.addEventListener('click', () => show(i)));
  const wide = matchMedia('(min-width: 901px)');
  const stepObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && wide.matches) show(Number(entry.target.dataset.step));
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(step => stepObserver.observe(step));
  show(0);
  if (webgl) whenNear(stage, () => import('./phone-3d.js')
    .then(module => module.init(stage, tabs.map(tab => tab.textContent.toLowerCase())))
    .then(api => { phone = api; phone.setScreen(current); })
    .catch(warn('Phone 3D')));
});

$$('[data-demo]').forEach(demo => whenNear(demo, () => import('./demo.js').then(module => module.init(demo, JSON.parse(demo.dataset.meals))).catch(warn('Haste demo'))));
