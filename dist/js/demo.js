// "Try it" panel on the Haste page: pick a sample meal, it types itself in,
// Estimate fills the calorie ring and macro bars, Save confirms. Example numbers only.
import { motion } from './motion.js';

const RING = 2 * Math.PI * 52;
const GOAL = 800; // the ring shows the meal against a notional 800 kcal meal budget

export function init(root, meals) {
  const typed = root.querySelector('[data-demo-typed]');
  const chips = [...root.querySelectorAll('[data-meal]')];
  const run = root.querySelector('[data-demo-run]');
  const save = root.querySelector('[data-demo-save]');
  const status = root.querySelector('[data-demo-status]');
  const kcal = root.querySelector('[data-kcal]');
  const ring = root.querySelector('.demo-ring-fill');
  const macros = Object.fromEntries(['protein', 'carbs', 'fat'].map(id => [id, { value: root.querySelector(`[data-macro="${id}"]`), bar: root.querySelector(`[data-bar="${id}"]`) }]));
  let meal = null, token = 0;

  ring.style.strokeDasharray = RING;
  ring.style.strokeDashoffset = RING;

  const animate = (duration, step) => new Promise(resolve => {
    if (motion.paused) { step(1); resolve(); return; }
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      step(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });

  const show = (fraction, values) => {
    kcal.textContent = Math.round(values.kcal * fraction);
    ring.style.strokeDashoffset = RING * (1 - Math.min(1, values.kcal / GOAL) * fraction);
    for (const id of ['protein', 'carbs', 'fat']) {
      macros[id].value.textContent = Math.round(values[id] * fraction);
      macros[id].bar.style.transform = `scaleX(${Math.min(1, values[id] / 80) * fraction})`;
    }
  };
  const reset = () => { show(1, { kcal: 0, protein: 0, carbs: 0, fat: 0 }); root.classList.remove('is-estimated', 'is-saved'); save.disabled = true; };

  chips.forEach((chip, i) => chip.addEventListener('click', async () => {
    const mine = ++token;
    meal = meals[i];
    chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
    reset();
    run.disabled = true;
    status.textContent = 'Listening… transcribed on your phone.';
    root.classList.add('is-typing');
    const text = meal.input;
    if (motion.paused) typed.textContent = text;
    else for (let n = 1; n <= text.length; n++) {
      if (mine !== token) return;
      typed.textContent = text.slice(0, n);
      await new Promise(resolve => setTimeout(resolve, 22));
    }
    root.classList.remove('is-typing');
    if (mine !== token) return;
    run.disabled = false;
    status.textContent = 'Ready. Press Estimate.';
    run.focus({ preventScroll: true });
  }));

  run.addEventListener('click', async () => {
    if (!meal) return;
    const mine = ++token;
    run.disabled = true;
    root.classList.add('is-thinking');
    status.textContent = 'Estimating…';
    await new Promise(resolve => setTimeout(resolve, motion.paused ? 0 : 750));
    root.classList.remove('is-thinking');
    if (mine !== token) return;
    await animate(1100, t => show(t, meal));
    root.classList.add('is-estimated');
    status.textContent = `${meal.kcal} kcal · ${meal.confidence.toLowerCase()} confidence. Adjust anything, then save.`;
    save.disabled = false;
  });

  save.addEventListener('click', () => {
    save.disabled = true;
    root.classList.add('is-saved');
    status.textContent = 'Saved to today’s journal. Streak kept. 🔥';
  });
}
