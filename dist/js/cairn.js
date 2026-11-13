// Cairn: a concept on a dark stage. The pedal hasn't been designed yet, so the model
// is a glowing outline with a question mark. It turns toward the cursor; drag to spin it.
import { $, motion, pointer, clamp, damp, webglAvailable } from './core.js';
import { createStage, shadowTexture, glowTexture, THREE } from './stage.js';
import { buildPedal } from './model-pedal.js';

const root = document.documentElement;
const stageEl = $('[data-pedal-stage]');
if (stageEl && webglAvailable()) start().catch(() => root.classList.add('no-webgl'));
else root.classList.add('no-webgl');

async function start() {
  const pedal = await buildPedal();
  const rig = new THREE.Group();
  rig.add(pedal.group);

  // Floor: a contact shadow and a pool of amber light.
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.2), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.2;
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), new THREE.MeshBasicMaterial({ map: glowTexture('rgba(255, 122, 26, 1)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.2 }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -0.21;
  rig.add(pool, shadow);

  // Dust drifting through the spotlight.
  const COUNT = 260, positions = new Float32Array(COUNT * 3), seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions.set([(Math.random() - 0.5) * 6, Math.random() * 4 - 0.4, (Math.random() - 0.5) * 4], i * 3);
    seeds[i] = Math.random() * 100;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ size: 0.022, color: 0xffc890, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));

  const REST_YAW = -0.38;
  const pose = { yaw: REST_YAW, pitch: 0, dragging: false, last: -10, lift: 0 };
  const fit = { distance: 4.6 };

  const stage = createStage(stageEl, {
    fov: 30, exposure: 1.15,
    onResize({ width, height }) {
      // Keep the whole pedal in frame on narrow screens.
      fit.distance = clamp(3.1 / (width / height) / 0.536, 4.5, 16);
    },
    onFrame(dt, time) {
      const still = motion.paused;
      stage.camera.position.set(0, fit.distance * 0.53, fit.distance * 0.848);
      stage.camera.lookAt(0, 0.5, 0);
      if (!pose.dragging && time - pose.last > 1.6) {
        const rest = REST_YAW + (still ? 0 : Math.sin(time * 0.35) * 0.16 + pointer.x * 0.22);
        pose.yaw = damp(pose.yaw, rest, 2.2, dt);
        pose.pitch = damp(pose.pitch, still ? 0 : pointer.y * 0.07, 3, dt);
      }
      rig.rotation.set(pose.pitch, pose.yaw, 0);
      pose.lift = damp(pose.lift, 1, 2.4, dt);
      pedal.group.position.y = 0.12 + (still ? 0 : Math.sin(time * 0.9) * 0.05) + (1 - pose.lift) * -0.4;
      pedal.update(dt, time, still);
      if (!still) {
        const array = dustGeometry.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          array[i * 3 + 1] += dt * (0.05 + (seeds[i] % 1) * 0.06);
          array[i * 3] += Math.sin(time * 0.4 + seeds[i]) * dt * 0.05;
          if (array[i * 3 + 1] > 3.6) array[i * 3 + 1] = -0.4;
        }
        dustGeometry.attributes.position.needsUpdate = true;
      }
    },
  });
  stage.scene.add(rig, dust);
  // Stage lighting: one hard amber key from above, cool rim from behind.
  const key = new THREE.SpotLight(0xffb070, 90, 20, 0.5, 0.6, 1.4); key.position.set(0.5, 6.5, 2.5);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 1.6); rim.position.set(-4, 2, -5);
  const front = new THREE.DirectionalLight(0xfff1df, 0.9); front.position.set(2, 3, 6);
  stage.scene.add(key, key.target, rim, front);

  /* Drag to turn */
  const canvas = stage.canvas;
  let lastX = 0;
  canvas.addEventListener('pointerdown', event => { pose.dragging = true; lastX = event.clientX; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', event => {
    if (!pose.dragging) return;
    const dx = event.clientX - lastX; lastX = event.clientX;
    pose.yaw = clamp(pose.yaw + dx * 0.008, -1.5, 1.5);
    pose.last = stage.clock.time;
    stageEl.classList.add('has-turned');
  });
  const release = () => { pose.dragging = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  root.classList.add('has-webgl');
}
