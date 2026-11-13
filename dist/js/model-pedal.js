// Cairn is still a concept, so its pedal is drawn as a question: a dark slab with
// glowing edges, controls only sketched in outline, and a large "?" floating above it. Used on the Cairn page and in the hub carousel.
import { roundedRect, THREE } from './stage.js';

export const PEDAL = { W: 2.4, D: 1.5, H: 0.36 };
const { W, D, H } = PEDAL;
const AMBER = 0xff7a1a;

export async function buildPedal() {
  await document.fonts.load('400 200px Anton').catch(() => {});
  const pedal = new THREE.Group();

  // The body: a bevelled slab lying flat, dark and featureless, with its edges traced in light.
  const bodyGeometry = new THREE.ExtrudeGeometry(roundedRect(W, D, 0.14), { depth: H - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 18 });
  bodyGeometry.translate(0, 0, -(H - 0.06) / 2);
  bodyGeometry.rotateX(-Math.PI / 2);
  const body = new THREE.Mesh(bodyGeometry, new THREE.MeshPhysicalMaterial({ color: 0x1a1512, metalness: 0.7, roughness: 0.3, clearcoat: 0.8, transparent: true, opacity: 0.9 }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeometry, 28), new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.75, toneMapped: false }));
  pedal.add(body, edges);
  const top = H / 2 + 0.004;

  // Controls, sketched: thin outlines where switches and knobs might end up.
  const outline = (radius, x, z) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 8, 48), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.38, toneMapped: false }));
    ring.rotation.x = Math.PI / 2; ring.position.set(x, top, z);
    pedal.add(ring);
    return ring;
  };
  const rings = [
    ...[-0.87, -0.29, 0.29, 0.87].map(x => outline(0.14, x, 0.42)),
    ...[0.6, 0.86].map(x => outline(0.085, x, -0.42)),
  ];

  // The question mark, lit from within.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '400 430px Anton, Impact, sans-serif';
  ctx.shadowColor = 'rgba(255, 122, 26, .9)'; ctx.shadowBlur = 46;
  ctx.fillStyle = '#ffb070'; ctx.fillText('?', 256, 282);
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff1e2'; ctx.fillText('?', 256, 282);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  // It stands above the slab and always faces the viewer.
  const mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  mark.scale.setScalar(1.35); mark.position.set(0, 0.86, 0);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false, toneMapped: false, blending: THREE.AdditiveBlending, opacity: 0.25 }));
  glow.scale.setScalar(1.75); glow.position.copy(mark.position);
  mark.renderOrder = 6; glow.renderOrder = 5;
  pedal.add(glow, mark);

  // A line of light that sweeps the top, as if the thing were still being worked out.
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, 0.014), new THREE.MeshBasicMaterial({ color: 0xffc890, transparent: true, opacity: 0.7, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }));
  scan.rotation.x = -Math.PI / 2; scan.position.y = top + 0.003;
  pedal.add(scan);

  return {
    group: pedal,
    update(dt, time, still = false) {
      if (still) { scan.visible = false; return; }
      scan.visible = true;
      const sweep = (time * 0.22) % 1;
      scan.position.z = (sweep - 0.5) * (D - 0.24);
      scan.material.opacity = Math.sin(sweep * Math.PI) * 0.7;
      const pulse = 0.5 + Math.sin(time * 1.6) * 0.5;
      mark.material.opacity = 0.8 + pulse * 0.2;
      mark.position.y = glow.position.y = 0.86 + Math.sin(time * 1.1) * 0.05;
      glow.material.opacity = 0.14 + pulse * 0.22;
      edges.material.opacity = 0.55 + pulse * 0.25;
      rings.forEach((ring, i) => { ring.material.opacity = 0.22 + Math.max(0, Math.sin(time * 1.1 - i * 0.7)) * 0.3; });
    },
  };
}
