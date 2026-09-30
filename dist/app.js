import { setupMotionControls } from './motion.mjs';

document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
const motion = setupMotionControls();
if (document.querySelector('[data-orbit]')) {
  import('./orbit.mjs').then(({setupOrbit}) => setupOrbit({motionEnabled: () => motion.enabled, resumeMotion: () => motion.setEnabled(true)})).catch(() => {
    document.querySelector('[data-orbit]').dataset.renderState = 'fallback';
    document.body.classList.add('orbit-unavailable');
  });
}

if (document.querySelector('[data-model]')) {
  const start = () => import('./scenes.mjs').then(({setupScenes}) => setupScenes({motionEnabled: () => motion.enabled})).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, {timeout: 1200});
  else setTimeout(start, 150);
}

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (isIOS) document.querySelectorAll('[data-device-notice]').forEach(notice => {
  notice.textContent = 'These downloads need an Android phone or tablet. APKs cannot be installed on iPhone or iPad. Read the app’s test notes before downloading.';
});
document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = !navigator.clipboard;
  button.addEventListener('click', async () => {
    const original = button.textContent;
    try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = 'Checksum copied'; }
    catch { button.textContent = 'Select and copy the checksum above'; }
    setTimeout(() => { button.textContent = original; }, 3500);
  });
});
