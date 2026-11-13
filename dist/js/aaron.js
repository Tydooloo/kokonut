// Aaron Ko's portfolio. The hero is a colour portrait standing in front of a ring of
// project cards that curves behind the head. The ring turns on its own and with the
// scroll; the portrait and the ring shift a little with the cursor to give depth.
import { $, $$, motion, pointer, clamp, smooth, damp, tilt, webglAvailable } from './core.js';
import { createStage, THREE } from './stage.js';
import { drawCovers } from './covers.js';

const root = document.documentElement;
tilt($$('[data-tilt]'), 10);

/* Local time in Auckland, next to the location. */
const clock = $('[data-clock]');
if (clock) {
  const format = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: 'numeric', minute: '2-digit' });
  const paint = () => { clock.textContent = format.format(new Date()); };
  paint(); setInterval(paint, 20000);
}

const covers = Object.fromEntries($$('[data-cover]').map(canvas => [canvas.dataset.cover, canvas]));
const coversReady = drawCovers(covers);

const stageEl = $('[data-ring-stage]');
const portrait = $('[data-portrait]');
if (stageEl && webglAvailable()) start().catch(() => root.classList.add('no-webgl'));
else root.classList.add('no-webgl');

async function start() {
  await coversReady;
  const ids = JSON.parse(stageEl.dataset.projects);
  const CAMERA_Z = 6, RADIUS = 2.9, CARD_W = 1.5, CARD_H = 1.0, slots = ids.length * 2;

  // Each card is bent around the ring, sits on the far side of its holder and faces the centre,
  // so the cards read correctly as they pass behind the portrait.
  const cardGeometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 1);
  const position = cardGeometry.attributes.position;
  for (let i = 0; i < position.count; i++) { const angle = position.getX(i) / RADIUS; position.setXYZ(i, Math.sin(angle) * RADIUS, position.getY(i), RADIUS - Math.cos(angle) * RADIUS); }
  position.needsUpdate = true;

  const ring = new THREE.Group();
  const cards = Array.from({ length: slots }, (_, i) => {
    const texture = new THREE.CanvasTexture(covers[ids[i % ids.length]]);
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
    const card = new THREE.Mesh(cardGeometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
    const holder = new THREE.Group();
    card.position.z = -RADIUS;
    holder.add(card);
    holder.rotation.y = (i / slots) * Math.PI * 2;
    ring.add(holder);
    return { card, holder };
  });

  const state = { yaw: 0, spin: 0.35, speed: 0.1, lastScroll: scrollY, away: 0, px: 0, py: 0 };
  const view = { visibleH: 1, height: 1 };

  const stage = createStage(stageEl, {
    fov: 30, environment: false,
    onResize({ width, height }) {
      view.height = height;
      view.visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(15)) * CAMERA_Z;
      ring.scale.setScalar(clamp(view.visibleH * width / height / 5.2, 0.6, 1.12));
    },
    onFrame(dt) {
      const still = motion.paused;
      const heroRect = stageEl.getBoundingClientRect();
      state.away = damp(state.away, smooth(0.1, 0.9, clamp(-heroRect.top / heroRect.height)), 5, dt);

      // The ring sits at the height of the eyes in the portrait.
      const face = portrait.getBoundingClientRect();
      const eyeLine = face.top + face.height * 0.36 - heroRect.top;
      ring.position.set(0, (0.5 - eyeLine / view.height) * view.visibleH * 1.5, -0.4);

      state.yaw = damp(state.yaw, still ? 0 : pointer.x * 0.2, 3, dt);
      const velocity = Math.abs(scrollY - state.lastScroll); state.lastScroll = scrollY;
      state.speed = damp(state.speed, 0.1 + Math.min(velocity, 60) * 0.02, 4, dt);
      if (!still) state.spin += dt * state.speed;
      ring.rotation.set(0.1 + (still ? 0 : pointer.y * 0.03), state.spin + state.yaw, -0.07);
      cards.forEach(({ card, holder }) => {
        const facing = Math.cos(holder.rotation.y + ring.rotation.y); // 1 when the card is directly behind the portrait
        card.material.opacity = smooth(-0.1, 0.5, facing) * (1 - state.away * 0.7);
        card.material.color.setScalar(0.5 + smooth(0.2, 1, facing) * 0.42);
        card.visible = card.material.opacity > 0.01;
      });

      // The portrait moves a touch against the cursor, and sinks slightly as the page scrolls.
      state.px = damp(state.px, still ? 0 : pointer.x * -14, 4, dt);
      state.py = damp(state.py, (still ? 0 : pointer.y * -8) + state.away * 60, 4, dt);
      portrait.style.setProperty('--px', `${state.px.toFixed(1)}px`);
      portrait.style.setProperty('--py', `${state.py.toFixed(1)}px`);
    },
  });
  stage.camera.position.set(0, 0, CAMERA_Z);
  stage.scene.add(ring);
  root.classList.add('has-webgl');
}
