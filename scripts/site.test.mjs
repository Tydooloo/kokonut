import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, coconut, flame } from '../dist/js/shapes.js';
import { words } from './layout.mjs';
import { haste, pages, nav, hasteNav } from './content.mjs';

const finite = array => array.every(Number.isFinite);

test('rng is deterministic and in [0, 1)', () => {
  const a = rng(9), b = rng(9);
  const values = Array.from({ length: 1000 }, () => a());
  assert.deepEqual(values.slice(0, 5), Array.from({ length: 5 }, () => b()));
  assert.ok(values.every(v => v >= 0 && v < 1));
});

test('logos fill every point with finite, bounded positions and colours', () => {
  const image = { width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) };
  for (let i = 0; i < 64; i++) if (i % 3 === 0) image.data.set([197, 227, 211, 255], i * 4);
  for (const shape of [coconut(3000, rng(1), image), flame(3000, rng(2), image)]) {
    assert.equal(shape.positions.length, 9000);
    assert.ok(finite(shape.positions) && finite(shape.colors));
    assert.ok(shape.positions.every(v => Math.abs(v) < 3), 'stays inside the hero');
    assert.ok(shape.colors.every(v => v >= 0 && v <= 1));
  }
});

test('logos refuse an empty image', () => {
  const empty = { width: 2, height: 2, data: new Uint8ClampedArray(16) };
  assert.throws(() => flame(10, rng(1), empty));
  assert.throws(() => coconut(10, rng(1), empty));
});

test('every particle sits on a visible pixel of the logo, with no strays', () => {
  // A 10 x 10 image with only its left half visible: no point may land in the right half.
  const image = { width: 10, height: 10, data: new Uint8ClampedArray(400) };
  for (let y = 0; y < 10; y++) for (let x = 0; x < 5; x++) image.data.set([240, 230, 210, 255], (y * 10 + x) * 4);
  const shape = coconut(2000, rng(3), image);
  const xs = shape.positions.filter((_, i) => i % 3 === 0);
  const span = Math.max(...xs) - Math.min(...xs);
  assert.ok(span < 1.3 * 2 * 1.15, 'stays within the logo');
  assert.ok(Math.abs((Math.max(...xs) + Math.min(...xs)) / 2) < 0.2, 'centred on the logo, nothing elsewhere');
});

test('demo meals have consistent example numbers', () => {
  assert.ok(haste.demo.length >= 3);
  for (const meal of haste.demo) {
    for (const key of ['kcal', 'protein', 'carbs', 'fat']) assert.ok(Number.isFinite(meal[key]) && meal[key] > 0, `${meal.id}: ${key}`);
    // Energy from macros (4/4/9 kcal per gram) should be within 15% of the stated calories.
    const fromMacros = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;
    assert.ok(Math.abs(fromMacros - meal.kcal) / meal.kcal < 0.15, `${meal.id}: ${fromMacros} vs ${meal.kcal} kcal`);
  }
});

test('every navigation target is a real page', () => {
  const known = new Set(pages.map(([, href]) => href));
  for (const [, href] of [...nav, ...hasteNav]) assert.ok(known.has(href), href);
});

test('heading words are escaped and indexed for staggered reveals', () => {
  const html = words('Hi <b>|*there*.');
  assert.match(html, /&lt;b&gt;/);
  assert.match(html, /<br>/);
  assert.match(html, /<em>there<\/em>\./);
  assert.match(html, /--i:2/);
});
