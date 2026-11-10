// Single source of truth for one pedal: the HTML controls, the 3D model and
// the audio engine all read from and write to this object.
import { clamp01 } from './pedal-dsp.js';

export class PedalState extends EventTarget {
  constructor(values) {
    super();
    this.values = { drive: 0.62, tone: 0.55, mix: 0.4, ...values };
    this.on = true;
    this.playing = false;
    this.lastChange = { param: null, at: 0 };
  }
  set(param, value) {
    const next = clamp01(value);
    if (!(param in this.values) || this.values[param] === next) return;
    this.values[param] = next;
    this.lastChange = { param, at: performance.now() };
    this.dispatchEvent(new CustomEvent('change', { detail: { param, value: next } }));
  }
  toggle(on = !this.on) {
    this.on = on;
    this.lastChange = { param: 'bypass', at: performance.now() };
    this.dispatchEvent(new CustomEvent('bypass', { detail: { on } }));
  }
  setPlaying(playing) {
    if (this.playing === playing) return;
    this.playing = playing;
    this.dispatchEvent(new CustomEvent('play', { detail: { playing } }));
  }
}
