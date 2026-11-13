// A phone modelled in code, showing real Haste screens. Used by the Haste page
// (where it travels with the scroll) and by the hub carousel.
import { roundedRect, roundedPlane, THREE } from './stage.js';

export const PHONE = { W: 0.74, H: 1.56, D: 0.085, R: 0.12 };
const { W, H, D, R } = PHONE;

export async function buildPhone(screens) {
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


  // Screens cross-fade: B fades in over A, then A takes B's texture.
  let current = 0, fade = 1;
  return {
    group: phone,
    get screen() { return current; },
    setScreen(index, instant = false) {
      if (index === current || !textures[index]) return;
      current = index;
      if (fade < 1) screenA.material.map = screenB.material.map;
      if (instant) { screenA.material.map = textures[index]; screenB.material.opacity = 0; fade = 1; return; }
      screenB.material.map = textures[index];
      screenB.material.opacity = 0;
      fade = 0;
    },
    update(dt) {
      if (fade >= 1) return;
      fade = Math.min(1, fade + dt / 0.45);
      screenB.material.opacity = fade;
      if (fade === 1) { screenA.material.map = screenB.material.map; screenB.material.opacity = 0; }
    },
  };
}
