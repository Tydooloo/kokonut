import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, coconut, flame, pedal } from '../dist/js/shapes.js';
import { knobAngle, toneFrequency, driveCurve, karplusStrong, riff, RIFF_STEPS, chordNotes, midiToFreq } from '../dist/js/pedal-dsp.js';
import { words } from './layout.mjs';

const finite = array => array.every(Number.isFinite);

test('rng is deterministic and in [0, 1)', () => {
  const a = rng(9), b = rng(9);
  const values = Array.from({ length: 1000 }, () => a());
  assert.deepEqual(values.slice(0, 5), Array.from({ length: 5 }, () => b()));
  assert.ok(values.every(v => v >= 0 && v < 1));
});

test('sculptures fill every point with finite, bounded positions and colours', () => {
  const image = { width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) };
  for (let i = 0; i < 64; i++) if (i % 3 === 0) image.data.set([197, 227, 211, 255], i * 4);
  for (const shape of [coconut(3000, rng(1)), flame(3000, rng(2), image), pedal(3000, rng(3))]) {
    assert.equal(shape.positions.length, 9000);
    assert.ok(finite(shape.positions) && finite(shape.colors));
    assert.ok(shape.positions.every(v => Math.abs(v) < 3), 'stays inside the hero');
    assert.ok(shape.colors.every(v => v >= 0 && v <= 1));
  }
});

test('flame refuses an icon with no visible leaves', () => {
  assert.throws(() => flame(10, rng(1), { width: 2, height: 2, data: new Uint8ClampedArray(16) }));
});

test('knob angle sweeps 270 degrees clockwise and clamps', () => {
  assert.equal(knobAngle(0.5), -0);
  assert.ok(Math.abs(knobAngle(0) - Math.PI * 0.75) < 1e-9);
  assert.ok(Math.abs(knobAngle(1) + Math.PI * 0.75) < 1e-9);
  assert.equal(knobAngle(5), knobAngle(1));
});

test('tone sweep is exponential from 700 Hz to 8.4 kHz', () => {
  assert.equal(toneFrequency(0), 700);
  assert.ok(Math.abs(toneFrequency(1) - 8400) < 1e-6);
  assert.ok(toneFrequency(0.5) < (700 + 8400) / 2);
});

test('drive curve is odd, monotonic and bounded', () => {
  for (const amount of [0, 0.5, 1]) {
    const curve = driveCurve(amount, 257);
    assert.ok(Math.abs(curve[0] + 1) < 1e-6 && Math.abs(curve[256] - 1) < 1e-6);
    assert.ok(Math.abs(curve[128]) < 1e-9);
    for (let i = 1; i < curve.length; i++) assert.ok(curve[i] >= curve[i - 1]);
  }
  assert.ok(driveCurve(1, 257)[140] > driveCurve(0, 257)[140], 'more drive saturates sooner');
});

test('Karplus-Strong pluck is normalised, decays and has no DC', () => {
  const samples = karplusStrong(110, 48000, 1, { random: rng(5) });
  assert.equal(samples.length, 48000);
  const peak = Math.max(...samples.map(Math.abs));
  assert.ok(Math.abs(peak - 0.9) < 1e-6);
  const energy = (from, to) => samples.slice(from, to).reduce((sum, v) => sum + v * v, 0);
  assert.ok(energy(40000, 48000) < energy(0, 8000) / 4, 'string decays');
  assert.ok(Math.abs(samples.slice(0, 4800).reduce((a, b) => a + b, 0) / 4800) < 0.02);
});

test('riff fits two bars and uses real power chords', () => {
  assert.ok(riff.every(event => event.step >= 0 && event.step < RIFF_STEPS));
  assert.deepEqual(chordNotes(40, 'chord'), [40, 47, 52]);
  assert.ok(Math.abs(midiToFreq(69) - 440) < 1e-9);
});

test('heading words are escaped and indexed for staggered reveals', () => {
  const html = words('Hi <b>|*there*.');
  assert.match(html, /&lt;b&gt;/);
  assert.match(html, /<br>/);
  assert.match(html, /<em>there<\/em>\./);
  assert.match(html, /--i:2/);
});
