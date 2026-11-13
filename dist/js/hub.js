// The hub: Kokonut's three products as objects on a turntable. Drag it, use the
// arrows or the tabs; the page takes on the colours of whichever one is in front.
import { $, $$, motion, pointer, clamp, damp, webglAvailable } from './core.js';
import { createStage, THREE } from './stage.js';
import { buildPhone, PHONE } from './model-phone.js';
import { buildPedal } from './model-pedal.js';
import { buildSheet } from './model-paper.js';

const root = document.documentElement;
const hub = $('[data-hub]');
const slides = $$('[data-slide]'), tabs = $$('[data-tab]');
const ids = slides.map(slide => slide.dataset.slide);
let active = 0, touched = false;

function show(index, byUser = true) {
  active = (index + ids.length) % ids.length;
  if (byUser) touched = true;
  hub.dataset.active = ids[active];
  slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === active); slide.inert = i !== active; });
  tabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === active)));
}
tabs.forEach((tab, i) => tab.addEventListener('click', () => show(i)));
$('[data-hub-prev]').addEventListener('click', () => show(active - 1));
$('[data-hub-next]').addEventListener('click', () => show(active + 1));
addEventListener('keydown', event => {
  if (event.target.closest('input, textarea')) return;
  if (event.key === 'ArrowRight') show(active + 1);
  if (event.key === 'ArrowLeft') show(active - 1);
});
// Until someone takes over, move on by itself every few seconds.
setInterval(() => { if (!touched && !motion.paused && !document.hidden && scrollY < 80) show(active + 1, false); }, 6500);

const stageEl = $('[data-hub-stage]');
if (stageEl && webglAvailable()) start().catch(() => root.classList.add('no-webgl'));
else root.classList.add('no-webgl');

async function start() {
  const [phone, pedal] = await Promise.all([buildPhone(['journal']), buildPedal()]);

  // Burble: a fanned handful of notes.
  const notes = new THREE.Group();
  [['lined', 3], ['sketch', 5], ['checklist', 2], ['highlight', 8], ['sticky', 9]].forEach(([kind, seed], i) => {
    const sheet = buildSheet(kind, seed);
    sheet.position.set((i - 2) * 0.2, Math.abs(i - 2) * -0.05, i * 0.05);
    sheet.rotation.z = (2 - i) * 0.14;
    notes.add(sheet);
  });

  const RADIUS = 1.5, STEP = Math.PI * 2 / 3;
  const carousel = new THREE.Group();
  const items = [
    { object: phone.group, scale: 1.75, tilt: [0.04, -0.4, 0.05] },
    { object: notes, scale: 1.3, tilt: [-0.05, -0.28, 0] },
    { object: pedal.group, scale: 1.02, tilt: [0.98, -0.34, 0] },
  ].map((item, i) => {
    const holder = new THREE.Group(), body = new THREE.Group();
    body.add(item.object); holder.add(body);
    holder.position.set(Math.sin(i * STEP) * RADIUS, 0, Math.cos(i * STEP) * RADIUS);
    holder.rotation.y = i * STEP;
    body.scale.setScalar(item.scale);
    carousel.add(holder);
    return { ...item, body, focus: i ? 0 : 1 };
  });

  const turn = { angle: 0, drag: 0, dragging: false, moved: 0 };
  const layout = { x: 1.25, y: 0.1, z: 11.6 };
  const stage = createStage(stageEl, {
    fov: 28, exposure: 1.08,
    onResize({ width, height }) {
      const wide = width / height > 1.05;
      layout.x = wide ? Math.min(2.1, width / height * 1.15) : 0;
      layout.y = wide ? 0.12 : 1.75;
      layout.z = wide ? 11.6 : 16.5;
    },
    onFrame(dt, time) {
      const still = motion.paused;
      stage.camera.position.z = layout.z;
      // Take the shortest way round to the active product.
      const target = -active * STEP;
      let delta = (target - turn.angle) % (Math.PI * 2);
      if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2;
      turn.angle = still ? turn.angle + delta : damp(turn.angle, turn.angle + delta, 3.4, dt);
      carousel.rotation.y = turn.angle + turn.drag;
      carousel.position.set(layout.x, layout.y, 0);
      carousel.rotation.x = still ? 0.06 : 0.06 + pointer.y * 0.04;
      items.forEach((item, i) => {
        item.focus = damp(item.focus, i === active ? 1 : 0, 4, dt);
        const bob = still ? 0 : Math.sin(time * 0.9 + i * 2) * 0.05;
        item.body.position.y = bob;
        // Each object keeps facing the camera as the turntable carries it round.
        const facing = -(carousel.rotation.y + i * STEP);
        item.body.rotation.set(item.tilt[0] + (still ? 0 : pointer.y * 0.08 * item.focus), facing + item.tilt[1] + (still ? 0 : Math.sin(time * 0.5 + i) * 0.14 + pointer.x * 0.3 * item.focus), item.tilt[2]);
        item.body.scale.setScalar(item.scale * (0.45 + item.focus * 0.55));
      });
      phone.update(dt);
      pedal.update(dt, time, still);
    },
  });
  stage.camera.position.set(0, 0.5, layout.z);
  stage.camera.lookAt(0, 0.1, 0);
  stage.scene.add(carousel);
  stage.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 8);
  const rim = new THREE.DirectionalLight(0xffd9a8, 1.6); rim.position.set(-5, 2, -3);
  stage.scene.add(key, rim);

  /* Drag to turn; let go and it settles on the nearest product. */
  let lastX = 0;
  stageEl.addEventListener('pointerdown', event => { turn.dragging = true; turn.moved = 0; lastX = event.clientX; stageEl.setPointerCapture(event.pointerId); stageEl.classList.add('is-dragging'); });
  stageEl.addEventListener('pointermove', event => {
    if (!turn.dragging) return;
    const dx = event.clientX - lastX; lastX = event.clientX;
    turn.moved += Math.abs(dx);
    turn.drag = clamp(turn.drag + dx * 0.006, -STEP * 1.2, STEP * 1.2);
  });
  const release = () => {
    if (!turn.dragging) return;
    turn.dragging = false; stageEl.classList.remove('is-dragging');
    const steps = Math.round(turn.drag / STEP);
    turn.angle += turn.drag; turn.drag = 0;
    if (turn.moved > 6) show(active - steps - (steps === 0 && Math.abs(turn.angle + active * STEP) > STEP * 0.28 ? Math.sign(turn.angle + active * STEP) : 0));
  };
  stageEl.addEventListener('pointerup', release);
  stageEl.addEventListener('pointercancel', release);
  root.classList.add('has-webgl');
}
