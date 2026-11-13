// Behaviour every page shares: entrance reveals, counters, the motion toggle,
// a sticky-nav state, and small helpers the scenes use to follow scroll and pointer.
import { motion } from './motion.js';

export { motion };
const root = document.documentElement;
root.dataset.ready = '1';
root.dataset.motion = motion.paused ? 'off' : 'on';

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (edge0, edge1, x) => { const t = clamp((x - edge0) / (edge1 - edge0)); return t * t * (3 - 2 * t); };
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

$$('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

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
}), { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
$$('[data-count]').forEach(node => { if (!motion.paused) node.textContent = '0'; });
$$('.reveal, [data-words]').forEach(node => revealer.observe(node));

/* Navigation bar: gains a backdrop once the page has scrolled. */
const nav = $('[data-nav]');
if (nav) {
  const paint = () => nav.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', paint, { passive: true });
  paint();
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

/* Pointer position, normalised to -1..1 across the viewport (0,0 is the centre). */
export const pointer = { x: 0, y: 0, px: innerWidth / 2, py: innerHeight / 2, active: false };
addEventListener('pointermove', event => {
  pointer.px = event.clientX; pointer.py = event.clientY;
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = (event.clientY / innerHeight) * 2 - 1;
  pointer.active = true;
}, { passive: true });

/* How far an element has travelled through the viewport.
   0 when its top reaches the top of the viewport, 1 when its bottom reaches the bottom:
   the natural progress of a tall section with a sticky child. */
export function pinProgress(element) {
  const rect = element.getBoundingClientRect();
  const travel = rect.height - innerHeight;
  return travel <= 0 ? 0 : clamp(-rect.top / travel);
}

/* Cards that lean toward the pointer. */
export function tilt(nodes, strength = 9) {
  if (!finePointer) return;
  nodes.forEach(node => {
    node.addEventListener('pointermove', event => {
      if (motion.paused) return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5, y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty('--rx', `${(-y * strength).toFixed(2)}deg`);
      node.style.setProperty('--ry', `${(x * strength).toFixed(2)}deg`);
      node.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      node.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    node.addEventListener('pointerleave', () => { node.style.setProperty('--rx', '0deg'); node.style.setProperty('--ry', '0deg'); });
  });
}

export function webglAvailable() {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')); }
  catch { return false; }
}
