// Point-cloud sculptures for the hero. Pure functions: no DOM, no WebGL,
// so they run the same in the browser and in Node tests.

// Small, fast, seedable PRNG (mulberry32): the sculptures look the same on every visit.
export function rng(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgb = hex => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
const mixRgb = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function cloud(count) {
  return { positions: new Float32Array(count * 3), colors: new Float32Array(count * 3) };
}

function put(target, index, [x, y, z], color, jitter = 0, random) {
  const c = jitter ? color.map(v => Math.min(1, Math.max(0, v + (random() - 0.5) * jitter))) : color;
  target.positions.set([x, y, z], index * 3);
  target.colors.set(c, index * 3);
}

// Rotate every point about X, then Y, then Z (radians), and scale.
export function transform(target, { x = 0, y = 0, z = 0, scale = 1, offset = [0, 0, 0] } = {}) {
  const p = target.positions;
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  for (let i = 0; i < p.length; i += 3) {
    let [px, py, pz] = [p[i], p[i + 1], p[i + 2]];
    [py, pz] = [py * cx - pz * sx, py * sx + pz * cx];
    [px, pz] = [px * cy + pz * sy, -px * sy + pz * cy];
    [px, py] = [px * cz - py * sz, px * sz + py * cz];
    p[i] = px * scale + offset[0]; p[i + 1] = py * scale + offset[1]; p[i + 2] = pz * scale + offset[2];
  }
  return target;
}

// Kokonut's mark: a halved coconut seen three-quarters on, as in the logo.
export function coconut(count, random = rng(1)) {
  const out = cloud(count);
  const huskDark = rgb(0x5e3f28), husk = rgb(0x9a6a43), huskLight = rgb(0xc08b5c);
  const flesh = rgb(0xfff6e2), inner = rgb(0xdcc9ab), innerDeep = rgb(0xa88f6c);
  const R = 1, inside = 0.6;
  for (let i = 0; i < count; i++) {
    const pick = random(), phi = random() * Math.PI * 2;
    if (pick < 0.46) {
      // Husk: lower hemisphere with fibrous streaks.
      const y = -Math.pow(random(), 0.85), r = Math.sqrt(1 - y * y) * R * (1 + (random() - 0.5) * 0.05);
      const streak = 0.5 + 0.5 * Math.sin(phi * 38 + y * 9);
      const color = mixRgb(mixRgb(huskDark, husk, random()), huskLight, streak * 0.45);
      put(out, i, [Math.cos(phi) * r, y * 0.94, Math.sin(phi) * r], color, 0.06, random);
    } else if (pick < 0.78) {
      // Flesh: the bright ring at the cut.
      const r = inside + (R - inside) * Math.sqrt(random());
      put(out, i, [Math.cos(phi) * r, -random() * 0.04, Math.sin(phi) * r], flesh, 0.04, random);
    } else if (pick < 0.95) {
      // Inside of the shell, darker toward the bottom.
      const y = -random() * inside, r = Math.sqrt(Math.max(0, inside * inside - y * y));
      put(out, i, [Math.cos(phi) * r, y * 0.94 - 0.02, Math.sin(phi) * r], mixRgb(inner, innerDeep, -y / inside), 0.05, random);
    } else {
      // Loose fibres drifting around it.
      const d = 1.2 + random() * 0.7, theta = Math.acos(2 * random() - 1);
      put(out, i, [Math.sin(theta) * Math.cos(phi) * d, Math.cos(theta) * d * 0.8, Math.sin(theta) * Math.sin(phi) * d], mixRgb(husk, huskLight, random()), 0.1, random);
    }
  }
  return transform(out, { x: 0.42, z: -0.28, scale: 1.15, offset: [0, 0.18, 0] });
}

// Haste's leaves, sampled from the real app icon's pixels.
// `image` is ImageData-like: { width, height, data: RGBA bytes }.
export function flame(count, random = rng(2), image) {
  const out = cloud(count);
  const { width, height, data } = image;
  const pixels = [];
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const o = (y * width + x) * 4;
    const lum = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
    if (lum > 0.3) { pixels.push(o); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  if (!pixels.length) throw new Error('flame: icon has no bright pixels');
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, span = Math.max(maxX - minX, maxY - minY) / 2;
  const scale = 1.2 / span;
  const ember = rgb(0xa7cdbb);
  for (let i = 0; i < count; i++) {
    if (random() < 0.06) {
      // Embers rising above the leaves.
      const t = random();
      put(out, i, [(random() - 0.5) * 1.3 * (1 - t * 0.5), 0.9 + t * 0.6, (random() - 0.5) * 0.6], ember.map(v => v * (1 - t * 0.7)), 0.1, random);
      continue;
    }
    const o = pixels[Math.floor(random() * pixels.length)];
    const px = (o / 4) % width, py = Math.floor(o / 4 / width);
    const color = [data[o] / 255, data[o + 1] / 255, data[o + 2] / 255];
    const bright = color[1] > 0.8;
    const depth = (bright ? 0.12 : -0.12) + (random() + random() + random() - 1.5) * 0.08;
    put(out, i, [(px + random() - 0.5 - cx) * scale, -(py + random() - 0.5 - cy) * scale, depth], color.map(v => Math.min(1, v * 1.08)), 0.05, random);
  }
  return transform(out, { offset: [0, -0.12, 0] });
}
