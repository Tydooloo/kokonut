// Loose notes for Burble: sheets of paper whose contents are drawn in code
// (handwriting, checklists, sketches, a photo, a voice memo). Used on the Burble
// page, where they file themselves, and in the hub carousel.
import { THREE } from './stage.js';

export const SHEET = { W: 1, H: 1.34 };
const INK = '#191919', RULE = '#e6e3dc';
const PENS = { blue: '#2f5bea', red: '#c4302b', green: '#3c8d4f', yellow: 'rgba(232, 197, 71, .55)' };

// A small seeded generator, so every visit draws the same notes.
const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// One line of "handwriting": joined loops with word gaps.
function scribble(ctx, random, x, y, width, size = 7, color = INK) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let cursor = x;
  while (cursor < x + width - 14) {
    const wordWidth = Math.min(16 + random() * 46, x + width - cursor);
    ctx.beginPath(); ctx.moveTo(cursor, y);
    for (let dx = 0; dx < wordWidth; dx += 3.4) ctx.lineTo(cursor + dx + random() * 1.6, y + Math.sin(dx * 0.9 + random()) * size * (0.35 + random() * 0.5) - (random() > 0.86 ? size : 0));
    ctx.stroke();
    cursor += wordWidth + 9 + random() * 7;
  }
}

const kinds = {
  lined(ctx, random, w, h) {
    ctx.strokeStyle = RULE; ctx.lineWidth = 1.5;
    for (let y = 70; y < h - 20; y += 30) { ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(w - 22, y); ctx.stroke(); }
    ctx.lineWidth = 3.4; scribble(ctx, random, 24, 44, w * 0.55, 10); ctx.lineWidth = 1.7;
    for (let y = 64; y < h - 60; y += 30) scribble(ctx, random, 24, y, (w - 48) * (0.55 + random() * 0.45));
  },
  checklist(ctx, random, w, h) {
    ctx.lineWidth = 3.2; scribble(ctx, random, 24, 46, w * 0.45, 10);
    for (let i = 0; i < 7; i++) {
      const y = 86 + i * 38;
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(26, y - 11, 18, 18);
      if (i < 3) { ctx.strokeStyle = PENS.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(29, y - 2); ctx.lineTo(34, y + 4); ctx.lineTo(43, y - 9); ctx.stroke(); }
      scribble(ctx, random, 56, y, (w - 84) * (0.5 + random() * 0.5), 6, i < 3 ? '#a8a49b' : INK);
    }
  },
  sketch(ctx, random, w, h) {
    ctx.fillStyle = RULE;
    for (let y = 24; y < h; y += 22) for (let x = 24; x < w; x += 22) ctx.fillRect(x, y, 2, 2);
    ctx.strokeStyle = PENS.blue; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
    ctx.strokeRect(34, 60, 86, 60); ctx.strokeRect(w - 124, 150, 90, 62);
    ctx.beginPath(); ctx.arc(78, 244, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(122, 92); ctx.bezierCurveTo(170, 96, 150, 172, w - 128, 178); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 140, 168); ctx.lineTo(w - 126, 179); ctx.lineTo(w - 142, 188); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(114, 240); ctx.lineTo(w - 96, 214); ctx.stroke();
    scribble(ctx, random, 44, 92, 62, 5); scribble(ctx, random, w - 114, 182, 66, 5); scribble(ctx, random, 30, h - 34, w * 0.5, 6);
  },
  photo(ctx, random, w, h) {
    const top = 26, size = w - 52;
    const sky = ctx.createLinearGradient(0, top, 0, top + size);
    sky.addColorStop(0, '#cfd6d2'); sky.addColorStop(1, '#eee9dd');
    ctx.fillStyle = sky; ctx.fillRect(26, top, size, size);
    ctx.fillStyle = '#8f9a94'; ctx.beginPath(); ctx.moveTo(26, top + size); ctx.lineTo(26 + size * 0.34, top + size * 0.42); ctx.lineTo(26 + size * 0.6, top + size); ctx.fill();
    ctx.fillStyle = '#5f6b66'; ctx.beginPath(); ctx.moveTo(26 + size * 0.3, top + size); ctx.lineTo(26 + size * 0.68, top + size * 0.56); ctx.lineTo(26 + size, top + size * 0.9); ctx.lineTo(26 + size, top + size); ctx.fill();
    ctx.fillStyle = '#f4f2ec'; ctx.beginPath(); ctx.arc(26 + size * 0.76, top + size * 0.26, 18, 0, Math.PI * 2); ctx.fill();
    scribble(ctx, random, 30, top + size + 34, w * 0.62, 7);
  },
  sticky(ctx, random, w, h) {
    ctx.lineWidth = 3.4;
    for (let i = 0; i < 4; i++) { ctx.lineWidth = 3.4; scribble(ctx, random, 30, 78 + i * 52, (w - 60) * (0.6 + random() * 0.4), 12); }
    ctx.strokeStyle = PENS.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(w * 0.42, 78, w * 0.3, 26, -0.05, 0, Math.PI * 2); ctx.stroke();
  },
  voice(ctx, random, w, h) {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(46, 54, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbfaf7'; ctx.beginPath(); ctx.moveTo(40, 44); ctx.lineTo(56, 54); ctx.lineTo(40, 64); ctx.fill();
    ctx.fillStyle = INK;
    for (let i = 0; i < 34; i++) { const bar = 6 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 54 * (0.5 + random() * 0.5); ctx.fillRect(28 + i * 5.9, 140 - bar / 2, 3, bar); }
    for (let y = 214; y < h - 30; y += 30) scribble(ctx, random, 26, y, (w - 52) * (0.5 + random() * 0.5), 6, '#6b6862');
  },
  graph(ctx, random, w, h) {
    ctx.lineWidth = 3.2; scribble(ctx, random, 24, 44, w * 0.4, 9);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(36, 78); ctx.lineTo(36, 226); ctx.lineTo(w - 26, 226); ctx.stroke();
    ctx.strokeStyle = PENS.red; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= w - 76; x += 6) { const y = 214 - Math.pow(x / (w - 76), 1.7) * 116 - Math.sin(x * 0.09) * 9; if (x) ctx.lineTo(42 + x, y); else ctx.moveTo(42, y); }
    ctx.stroke();
    for (let y = 262; y < h - 24; y += 28) scribble(ctx, random, 26, y, (w - 52) * (0.5 + random() * 0.5), 6);
  },
  highlight(ctx, random, w, h) {
    for (let i = 0, y = 52; y < h - 30; y += 32, i++) {
      const width = (w - 48) * (0.6 + random() * 0.4);
      if (i === 1 || i === 4 || i === 5) { ctx.fillStyle = PENS.yellow; ctx.fillRect(22, y - 14, width * 0.8, 24); }
      scribble(ctx, random, 24, y, width, 7);
    }
  },
};
export const sheetKinds = Object.keys(kinds);

export function sheetCanvas(kind, seed = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 288; canvas.height = Math.round(288 * SHEET.H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = kind === 'sticky' ? '#f6e9a8' : seed % 3 ? '#ffffff' : '#fdfcf8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  kinds[kind](ctx, rng(seed * 7919 + 13), canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(25, 25, 25, .16)'; ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  return canvas;
}

let shadowMap = null;
function shadowTexture() {
  if (shadowMap) return shadowMap;
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.filter = 'blur(9px)'; ctx.fillStyle = 'rgba(25, 25, 25, .5)';
  ctx.fillRect(22, 24, 84, 112);
  return (shadowMap = new THREE.CanvasTexture(canvas));
}

// A sheet with a soft shadow just behind it.
export function buildSheet(kind, seed) {
  const texture = new THREE.CanvasTexture(sheetCanvas(kind, seed));
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const group = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(SHEET.W, SHEET.H), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0, side: THREE.DoubleSide }));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(SHEET.W * 1.5, SHEET.H * 1.42), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.2, depthWrite: false }));
  shadow.position.set(0.03, -0.05, -0.012);
  shadow.renderOrder = -1;
  group.add(shadow, paper);
  return group;
}
