// A modelled phone running real Haste screens. Drag to spin it; it eases back
// to a resting pose. Screens cross-fade when the story or the tabs change.
import { createStage, roundedRect, roundedPlane, shadowTexture, THREE, clamp, damp } from './stage.js';
import { motion } from './motion.js';

const W = 0.74, H = 1.56, D = 0.085, R = 0.12;
const REST_YAW = -0.42;

export async function init(container, screens) {
  const loader = new THREE.TextureLoader();
  const load = async src => {
    const texture = await loader.loadAsync(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };
  const [icon, ...textures] = await Promise.all(['/assets/haste/icon.webp', ...screens.map(id => `/assets/haste/screen-${id}.webp`)].map(load));

  const phone = new THREE.Group();
  const frame = new THREE.MeshPhysicalMaterial({ color: 0x2b3430, metalness: 0.92, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 });

  const bodyGeometry = new THREE.ExtrudeGeometry(roundedRect(W - 0.02, H - 0.02, R - 0.01), { depth: D - 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 6, curveSegments: 28 });
  bodyGeometry.translate(0, 0, -(D - 0.02) / 2);
  phone.add(new THREE.Mesh(bodyGeometry, frame));

  const front = D / 2 + 0.0006;
  const bezel = new THREE.Mesh(roundedPlane(W - 0.014, H - 0.014, R - 0.007, 28), new THREE.MeshBasicMaterial({ color: 0x030403 }));
  bezel.position.z = front;
  phone.add(bezel);

  const SW = W - 0.052, SH = H - 0.052;
  const screenGeometry = roundedPlane(SW, SH, R - 0.032, 28);
  textures.forEach(texture => { texture.anisotropy = 8; });
  const screenA = new THREE.Mesh(screenGeometry, new THREE.MeshBasicMaterial({ map: textures[0], toneMapped: false }));
  const screenB = new THREE.Mesh(screenGeometry, new THREE.MeshBasicMaterial({ map: textures[0], toneMapped: false, transparent: true, opacity: 0 }));
  screenA.position.z = front + 0.0008; screenB.position.z = front + 0.0012;
  phone.add(screenA, screenB);

  const island = new THREE.Mesh(roundedPlane(0.19, 0.054, 0.027), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  island.position.set(0, SH / 2 - 0.052, front + 0.0016);
  phone.add(island);

  // Glass: reflections only, added on top of the screen.
  const glass = new THREE.Mesh(roundedPlane(W - 0.014, H - 0.014, R - 0.007, 28), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  glass.position.z = front + 0.002;
  phone.add(glass);

  const button = (x, y, h) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.014, h, 0.032), frame);
    mesh.position.set(x, y, 0);
    phone.add(mesh);
  };
  button(-W / 2 - 0.004, 0.42, 0.08); button(-W / 2 - 0.004, 0.27, 0.14); button(-W / 2 - 0.004, 0.1, 0.14); button(W / 2 + 0.004, 0.24, 0.2);

  // Back: camera plateau, lenses and the Haste mark.
  const back = -D / 2;
  const plateau = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(0.3, 0.3, 0.075), { depth: 0.008, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 16 }), frame);
  plateau.position.set(-W / 2 + 0.2, H / 2 - 0.2, back - 0.012);
  phone.add(plateau);
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x050607, roughness: 0.05, metalness: 0.2, clearcoat: 1 });
  const lensRing = new THREE.MeshStandardMaterial({ color: 0x9aa39f, metalness: 1, roughness: 0.25 });
  [[-0.065, 0.065], [-0.065, -0.065], [0.065, 0]].forEach(([x, y]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 40), lensRing);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 40), lensGlass);
    [ring, lens].forEach(mesh => { mesh.rotation.x = Math.PI / 2; mesh.position.set(plateau.position.x + x, plateau.position.y + y, back - 0.022); phone.add(mesh); });
  });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), new THREE.MeshBasicMaterial({ map: icon, alphaMap: icon, alphaTest: 0.35, transparent: true, toneMapped: false }));
  mark.rotation.y = Math.PI;
  mark.position.set(0, -0.05, back - 0.0012);
  phone.add(mark);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.55), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.16;

  const pose = { yaw: REST_YAW, pitch: 0.06, velocity: 0, dragging: false, last: -10, hoverX: 0, hoverY: 0 };
  const fade = { value: 1 };
  const fit = { z: 3.35 };

  const stage = createStage(container, {
    fov: 30, exposure: 1.05,
    onResize({ width, height }) {
      // Keep the whole phone in frame on narrow, portrait containers.
      fit.z = Math.max(3.35, 3.35 * 0.6 / (width / height));
    },
    onFrame(dt, time) {
      const still = motion.paused;
      stage.camera.position.z = fit.z;
      if (!pose.dragging) {
        pose.yaw += pose.velocity;
        pose.velocity *= Math.pow(0.05, dt);
        if (time - pose.last > 2.2 && Math.abs(pose.velocity) < 0.002) {
          const rest = REST_YAW + (still ? 0 : Math.sin(time * 0.45) * 0.22) + pose.hoverX * 0.25;
          const nearest = rest + Math.round((pose.yaw - rest) / (Math.PI * 2)) * Math.PI * 2;
          pose.yaw = damp(pose.yaw, nearest, 2.2, dt);
        }
        pose.pitch = damp(pose.pitch, 0.06 - pose.hoverY * 0.14, 3, dt);
      }
      phone.rotation.set(pose.pitch, pose.yaw, still ? 0 : Math.sin(time * 0.7) * 0.025);
      const float = still ? 0 : Math.sin(time * 1.1) * 0.035;
      phone.position.y = float + 0.06;
      shadow.material.opacity = 0.75 - float * 3;
      shadow.scale.setScalar(1 - float);
      if (fade.value < 1) {
        fade.value = Math.min(1, fade.value + dt / 0.45);
        screenB.material.opacity = fade.value;
        if (fade.value === 1) { screenA.material.map = screenB.material.map; screenB.material.opacity = 0; }
      }
    },
  });
  stage.scene.add(phone, shadow);
  stage.camera.position.set(0, 0.05, 3.9);
  stage.camera.lookAt(0, 0, 0);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(2.5, 3, 4);
  const rim = new THREE.DirectionalLight(0xa7cdbb, 4); rim.position.set(-3, 1.5, -2.5);
  const rim2 = new THREE.DirectionalLight(0xe2cfae, 2); rim2.position.set(3, -1, -2);
  stage.scene.add(key, rim, rim2);
  stage.camera.position.z = fit.z;

  const canvas = stage.canvas;
  let lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', event => {
    pose.dragging = true; lastX = event.clientX; lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    container.classList.add('has-interacted');
  });
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pose.hoverX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pose.hoverY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    if (!pose.dragging) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    lastX = event.clientX; lastY = event.clientY;
    pose.velocity = dx * 0.011;
    pose.yaw += dx * 0.011;
    pose.pitch = clamp(pose.pitch + dy * 0.006, -0.5, 0.5);
    pose.last = stage.clock.time;
  });
  const release = () => { pose.dragging = false; pose.last = stage.clock.time; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { pose.hoverX = 0; pose.hoverY = 0; });

  let current = 0;
  return {
    setScreen(index) {
      if (index === current || !textures[index]) return;
      current = index;
      if (fade.value < 1) screenA.material.map = screenB.material.map;
      screenB.material.map = textures[index];
      screenB.material.opacity = 0;
      fade.value = motion.paused ? 0.999 : 0;
      if (!motion.paused && !pose.dragging) pose.velocity += 0.035;
      if (!stage.running) { screenA.material.map = textures[index]; screenB.material.opacity = 0; fade.value = 1; stage.render(); }
    },
  };
}
