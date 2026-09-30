import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupMotionControls} from '../dist/motion.mjs';
function harness(reduced) {
  const media = Object.assign(new EventTarget(), {matches: reduced});
  const buttons = [0, 1].map(() => Object.assign(new EventTarget(), {hidden: true, attrs: {}, setAttribute(key, value) {this.attrs[key] = value;}}));
  const classes = new Set();
  const doc = {querySelectorAll: () => buttons, documentElement: {classList: {toggle(name, on) {on ? classes.add(name) : classes.delete(name);}}}};
  const win = Object.assign(new EventTarget(), {matchMedia: () => media, CustomEvent});
  const events = [];
  win.addEventListener('kokonut:motion', event => events.push(event.detail.enabled));
  return {media, buttons, classes, events, controls: setupMotionControls(win, doc)};
}
test('reduced motion starts paused before 3D or orbit animation is initialized', () => {
  const h = harness(true);
  assert.equal(h.controls.enabled, false);
  assert.ok(h.classes.has('motion-paused'));
  assert.deepEqual(h.events, [false]);
  h.buttons.forEach(b => { assert.equal(b.hidden, false); assert.equal(b.attrs['aria-pressed'], 'true'); assert.equal(b.attrs['aria-label'], 'Resume animations'); });
});
test('either motion button pauses and resumes all controls in sync', () => {
  const h = harness(false);
  h.buttons[0].dispatchEvent(new Event('click'));
  assert.equal(h.controls.enabled, false);
  h.buttons.forEach(b => assert.equal(b.attrs['aria-pressed'], 'true'));
  h.buttons[1].dispatchEvent(new Event('click'));
  assert.equal(h.controls.enabled, true);
  assert.deepEqual(h.events, [true, false, true]);
});
test('system changes are honored and cleanup removes event handlers', () => {
  const h = harness(false);
  h.media.matches = true;
  h.media.dispatchEvent(Object.assign(new Event('change'), {matches: true}));
  assert.equal(h.controls.enabled, false);
  h.controls.dispose();
  h.buttons[0].dispatchEvent(new Event('click'));
  h.media.dispatchEvent(Object.assign(new Event('change'), {matches: false}));
  assert.deepEqual(h.events, [true, false]);
});

test('explicit resume from the carousel enables motion and synchronizes the global control', () => {
  const h = harness(true);
  h.controls.setEnabled(true);
  assert.equal(h.controls.enabled, true);
  assert.deepEqual(h.events, [false, true]);
  h.buttons.forEach(button => assert.equal(button.attrs['aria-label'], 'Pause animations'));
});
