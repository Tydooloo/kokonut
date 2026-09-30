import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OrbitMotion, frontProject, TAU, shortestAngle} from '../dist/orbit-motion.mjs';

test('one card holds focus for a full reading interval, then snaps exactly to the next', () => {
  const orbit = new OrbitMotion();
  orbit.update(3.7, 3.7);
  assert.equal(orbit.phase, 0);
  orbit.update(.5, 4.2);
  assert.ok(orbit.phase < 0 && orbit.phase > -Math.PI / 2);
  orbit.update(.42, 4.62);
  assert.equal(orbit.phase, -Math.PI / 2);
  assert.equal(frontProject(orbit.phase), 1);
  orbit.update(3.7, 8.32);
  assert.equal(orbit.phase, -Math.PI / 2);
});

test('autoplay visits each of the four products once, then wraps', () => {
  const orbit = new OrbitMotion();
  for (const expected of [1, 2, 3, 0]) {
    orbit.update(orbit.dwell + orbit.duration, 0);
    assert.equal(frontProject(orbit.phase), expected);
  }
});

test('pause freezes a transition and resumes from exactly the same place', () => {
  const orbit = new OrbitMotion();
  orbit.update(4.1, 4.1);
  const phase = orbit.phase, elapsed = orbit.transition.elapsed;
  orbit.update(2, 6.1, {automatic: false});
  orbit.update(2, 8.1, {held: true});
  assert.equal(orbit.phase, phase);
  assert.equal(orbit.transition.elapsed, elapsed);
  orbit.update(.52, 8.62);
  assert.equal(frontProject(orbit.phase), 1);
});

test('drag cancels automatic travel and release settles on a readable card', () => {
  const orbit = new OrbitMotion();
  orbit.update(4.1, 4.1);
  orbit.move(-.8, 4.2);
  assert.equal(orbit.transition, null);
  orbit.release(-1, 4.3);
  orbit.update(1, 5.3);
  assert.ok(Math.abs(shortestAngle(orbit.phase + frontProject(orbit.phase) * TAU / 4)) < 1e-9);
  const settled = orbit.phase;
  orbit.update(3, 8.3);
  assert.equal(orbit.phase, settled);
});

test('manual selection works with autoplay paused and without animation', () => {
  const orbit = new OrbitMotion();
  orbit.select(2, 0, true);
  orbit.update(1, 1, {automatic: false});
  assert.equal(frontProject(orbit.phase), 2);
  orbit.select(3, 2, false);
  assert.equal(frontProject(orbit.phase), 3);
  orbit.update(10, 12, {automatic: false});
  assert.equal(frontProject(orbit.phase), 3);
  orbit.select(0, 13, true);
  orbit.update(10, 23, {held: true});
  assert.equal(frontProject(orbit.phase), 0, 'Keyboard focus holds autoplay without blocking requested selection');
});

test('card timing and position remain consistent across frame rates', () => {
  const simulate = fps => {
    const orbit = new OrbitMotion();
    for (let i = 0; i < fps * 14; i++) orbit.update(1 / fps, i / fps);
    return orbit.phase;
  };
  assert.ok(Math.abs(simulate(30) - simulate(120)) < 1e-10);
});
