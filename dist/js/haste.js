// Haste: one phone that travels with you down the page. It flies between the
// placeholders marked [data-anchor], turns as it goes, and shows the screen each
// section talks about. Macro "orbs" and leaves orbit it.
import { $, $$, motion, pointer, clamp, damp, webglAvailable } from './core.js';
import { createStage, THREE } from './stage.js';
import { buildPhone, PHONE } from './model-phone.js';
import { init as initDemo } from './demo.js';

const root = document.documentElement;
const demo = $('[data-demo]');
if (demo) initDemo(demo, JSON.parse(demo.dataset.meals));

/* Story steps: the one nearest the middle of the screen is active. */
const steps = $$('[data-step]');
let activeStep = 0;
const watchSteps = () => {
  let best = 0, bestDistance = Infinity;
  steps.forEach((step, i) => {
    const rect = step.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - innerHeight / 2);
    if (distance < bestDistance) { bestDistance = distance; best = i; }
  });
  if (best !== activeStep || !steps[best].classList.contains('is-active')) {
    activeStep = best;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === best));
  }
};
addEventListener('scroll', watchSteps, { passive: true });
watchSteps();

const stageEl = $('[data-haste-stage]');
if (stageEl && webglAvailable()) start().catch(() => root.classList.add('no-webgl'));
else root.classList.add('no-webgl');

async function start() {
  const phone = await buildPhone(JSON.parse(stageEl.dataset.screens));
  const anchors = $$('[data-anchor]').map(element => ({
    element,
    yaw: Number(element.dataset.yaw || 0), pitch: Number(element.dataset.pitch || 0), roll: Number(element.dataset.roll || 0),
    screen: Number(element.dataset.screen || 0), story: 'storyAnchor' in element.dataset,
  }));

  const CAMERA_Z = 9;
  const rig = new THREE.Group();        // position and scale follow the active anchor
  const tumble = new THREE.Group();     // rotation
  tumble.add(phone.group);
  rig.add(tumble);

  // A soft shadow on the "wall" behind the phone gives the light page some depth.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128; shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  sctx.filter = 'blur(14px)';
  sctx.fillStyle = 'rgba(18, 44, 30, .55)';
  sctx.beginPath(); sctx.roundRect(34, 44, 60, 168, 14); sctx.fill();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PHONE.W * 2.1, PHONE.H * 1.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false, opacity: 0.5 }));
  shadow.position.set(0.1, -0.16, -0.7);
  rig.add(shadow);

  /* Orbiting pieces: macro orbs, leaves cut from the Haste mark, and thin rings. */
  const orbit = new THREE.Group();
  rig.add(orbit);
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.5);
  leafShape.bezierCurveTo(0.42, -0.2, 0.4, 0.3, 0.06, 0.5);
  leafShape.bezierCurveTo(-0.36, 0.22, -0.34, -0.22, 0, -0.5);
  const leafGeometry = new THREE.ExtrudeGeometry(leafShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 20 });
  leafGeometry.center();
  const sphere = new THREE.SphereGeometry(1, 40, 28);
  const ring = new THREE.TorusGeometry(1, 0.16, 20, 56);
  const material = (color, roughness = 0.35) => new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.4 });
  const palette = { protein: 0x3fae7d, carbs: 0xf3ae45, fat: 0xef7a68, mint: 0xa9d2bd, sage: 0x6f9f86, cream: 0xfbf3e1 };
  const recipe = [
    ['sphere', 'protein', 0.085], ['leaf', 'mint', 0.15], ['sphere', 'carbs', 0.066], ['ring', 'cream', 0.07], ['leaf', 'sage', 0.12],
    ['sphere', 'fat', 0.055], ['sphere', 'mint', 0.04], ['leaf', 'mint', 0.1], ['ring', 'protein', 0.05], ['sphere', 'carbs', 0.036],
    ['leaf', 'sage', 0.09], ['sphere', 'cream', 0.048], ['sphere', 'protein', 0.032], ['leaf', 'mint', 0.08],
  ];
  const geometries = { sphere, leaf: leafGeometry, ring };
  const orbs = recipe.map(([kind, color, size], i) => {
    const mesh = new THREE.Mesh(geometries[kind], material(palette[color], kind === 'leaf' ? 0.5 : 0.3));
    mesh.scale.setScalar(size * (kind === 'leaf' ? 1.6 : 1));
    orbit.add(mesh);
    const seed = i * 2.399963; // golden angle keeps them evenly spread
    return { mesh, angle: seed, radius: 0.6 + (i % 5) * 0.085 + Math.sin(seed) * 0.04, height: Math.cos(seed * 1.7) * 0.74, speed: 0.1 + (i % 4) * 0.035, tilt: seed, spin: 0.3 + (i % 3) * 0.25 };
  });

  const view = { unit: 1, width: 1, height: 1 };
  const state = { x: 0, y: 0, scale: 0.0001, yaw: 0, pitch: 0, roll: 0, spin: 0, gather: 0, active: -1, shown: false };

  const stage = createStage(stageEl, {
    fov: 28, exposure: 1.08,
    onResize({ width, height }) {
      view.width = width; view.height = height;
      view.unit = 2 * Math.tan(THREE.MathUtils.degToRad(14)) * CAMERA_Z / height; // world units per CSS pixel at z = 0
    },
    onFrame(dt, time) {
      const still = motion.paused;
      // The anchor with the most of itself on screen wins.
      let best = -1, bestShare = 0.18, rect = null;
      anchors.forEach((anchor, i) => {
        const r = anchor.element.getBoundingClientRect();
        if (!r.height) return;
        const share = clamp((Math.min(r.bottom, view.height) - Math.max(r.top, 0)) / Math.min(r.height, view.height));
        if (share > bestShare) { bestShare = share; best = i; rect = r; }
      });
      let target = { yaw: state.yaw, pitch: 0, roll: 0, scale: 0.0001 };
      if (best >= 0) {
        const anchor = anchors[best];
        if (best !== state.active) {
          if (state.active >= 0 && !still) state.spin += (best > state.active ? 1 : -1) * Math.PI * 2;
          state.active = best;
          if (!state.shown) { state.shown = true; state.x = (rect.left + rect.width / 2 - view.width / 2) * view.unit; state.y = -(rect.top + rect.height / 2 - view.height / 2) * view.unit; }
        }
        // In the story the phone leans a different way and changes screen with each step.
        const lean = anchor.story ? [1, 0, -1][activeStep] : 1;
        phone.setScreen(anchor.story ? activeStep : anchor.screen);
        target = {
          x: (rect.left + rect.width / 2 - view.width / 2) * view.unit,
          y: -(rect.top + rect.height / 2 - view.height / 2) * view.unit,
          scale: Math.min(rect.height, rect.width * 2.1) * view.unit / PHONE.H * 0.94,
          yaw: anchor.yaw * lean, pitch: anchor.pitch, roll: anchor.roll * lean,
        };
        state.gather = damp(state.gather, anchor.story ? 1 : 0, 2.5, dt);
      } else state.active = -1;

      const follow = still ? 40 : 5.5;
      if (best >= 0) { state.x = damp(state.x, target.x, follow, dt); state.y = damp(state.y, target.y, follow, dt); }
      state.scale = damp(state.scale, target.scale, still ? 40 : 6, dt);
      state.spin = damp(state.spin, 0, 3.2, dt);
      const sway = still ? 0 : Math.sin(time * 0.6) * 0.07;
      state.yaw = damp(state.yaw, target.yaw + (still ? 0 : pointer.x * 0.28) + sway, 4, dt);
      state.pitch = damp(state.pitch, target.pitch + (still ? 0 : pointer.y * 0.16), 4, dt);
      state.roll = damp(state.roll, target.roll, 4, dt);

      rig.position.set(state.x, state.y + (still ? 0 : Math.sin(time * 1.1) * 0.035 * state.scale), 0);
      rig.scale.setScalar(Math.max(state.scale, 0.0001));
      rig.visible = state.scale > 0.01;
      tumble.rotation.set(state.pitch, state.yaw + state.spin, state.roll);
      phone.update(dt);

      // Orbs drift around the phone; in the story they pull in close.
      const reach = 1 + state.gather * 0.06;
      orbs.forEach((orb, i) => {
        if (!still) orb.angle += dt * orb.speed;
        const r = orb.radius * reach;
        orb.mesh.position.set(Math.cos(orb.angle) * r, orb.height + Math.sin(time * 0.8 + i) * 0.04, Math.sin(orb.angle) * r * 0.8);
        orb.mesh.rotation.set(orb.tilt + time * orb.spin * 0.4, orb.tilt * 2 + time * orb.spin, 0);
      });
      orbit.rotation.set(pointer.y * 0.1, pointer.x * -0.18, 0);
    },
  });

  stage.camera.position.set(0, 0, CAMERA_Z);
  stage.scene.add(rig);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 6);
  const fill = new THREE.DirectionalLight(0xbfe6d0, 1.6); fill.position.set(-4, 1, 2);
  const rim = new THREE.DirectionalLight(0xfff0cf, 2.4); rim.position.set(2, -1, -4);
  stage.scene.add(key, fill, rim);
  root.classList.add('has-webgl');
}
