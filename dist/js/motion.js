// One shared motion preference: the OS setting, overridable for this page visit.
const query = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();
let paused = query.matches;

export const motion = {
  get paused() { return paused; },
  set(value) {
    paused = Boolean(value);
    document.documentElement.dataset.motion = paused ? 'off' : 'on';
    listeners.forEach(listener => listener(paused));
  },
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
};
query.addEventListener('change', event => motion.set(event.matches));
