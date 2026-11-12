// Point-cloud logos for the hero. Pure functions: no DOM, no WebGL,
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

function cloud(count) {
  return { positions: new Float32Array(count * 3), colors: new Float32Array(count * 3) };
}

const luminance = (data, o) => (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;

// Turn a logo image into a point cloud: every point sits on a visible pixel and takes
// its colour, so the particles draw the real logo and nothing else. Brighter pixels
// sit slightly forward, which gives the flat mark some depth as it turns.
// `image` is ImageData-like: { width, height, data: RGBA bytes }.
function fromImage(count, random, image, visible, { size = 1.2, shade = () => 1 } = {}) {
  const out = cloud(count);
  const { width, height, data } = image;
  const pixels = [];
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const o = (y * width + x) * 4;
    if (!visible(data, o)) continue;
    pixels.push(o); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (!pixels.length) return null;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, scale = size / (Math.max(maxX - minX, maxY - minY) / 2);
  for (let i = 0; i < count; i++) {
    const o = pixels[Math.floor(random() * pixels.length)];
    const px = (o / 4) % width, py = Math.floor(o / 4 / width);
    const lum = luminance(data, o), brightness = shade(lum);
    const depth = (lum - 0.55) * 0.3 + (random() + random() + random() - 1.5) * 0.05;
    out.positions.set([(px + random() - 0.5 - cx) * scale, -(py + random() - 0.5 - cy) * scale, depth], i * 3);
    out.colors.set([0, 1, 2].map(c => Math.min(1, Math.max(0, (data[o + c] / 255) * brightness + (random() - 0.5) * 0.05))), i * 3);
  }
  return out;
}

// Kokonut's logo, sampled from /assets/logo.svg (transparent background).
export function coconut(count, random = rng(1), image) {
  const out = fromImage(count, random, image, (data, o) => data[o + 3] > 128, {
    size: 1.3,
    // Additive particles brighten where they overlap, so the cream face and its tan cavity
    // get pulled apart; otherwise the whole cut face reads as one white patch.
    shade: lum => (lum > 0.6 ? 0.35 + 0.6 * Math.pow((lum - 0.6) / 0.4, 1.5) : 0.9),
  });
  if (!out) throw new Error('coconut: logo has no visible pixels');
  return out;
}

// Haste's leaves, sampled from the app icon (light leaves on a dark tile).
export function flame(count, random = rng(2), image) {
  const out = fromImage(count, random, image, (data, o) => luminance(data, o) > 0.3, { size: 1.2, shade: () => 1.05 });
  if (!out) throw new Error('flame: icon has no bright pixels');
  return out;
}
