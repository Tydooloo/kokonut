// Pure maths behind the pedal demo: no Web Audio here, so Node can test it.

export const BPM = 112;
export const EIGHTH = 60 / BPM / 2;

export const clamp01 = value => Math.min(1, Math.max(0, Number(value) || 0));
export const midiToFreq = midi => 440 * Math.pow(2, (midi - 69) / 12);

// Knob value 0..1 -> rotation about the knob's vertical axis. 0 points to
// seven o'clock, 1 to five o'clock, turning clockwise as seen from above.
export const knobAngle = value => -(clamp01(value) - 0.5) * 1.5 * Math.PI;

// Tone knob: an exponential sweep of the low-pass cutoff, 700 Hz to 8.4 kHz.
export const toneFrequency = value => 700 * Math.pow(12, clamp01(value));

// Normalised tanh saturation. More drive means a harder knee; output stays in [-1, 1].
export function driveCurve(amount, samples = 1024) {
  const k = 1 + clamp01(amount) * 36;
  const norm = Math.tanh(k);
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / norm;
  }
  return curve;
}

// An original two-bar riff in E. Each step is an eighth note.
// chord: power chord on the root. mute: a short palm-muted root.
const E = 40, G = 43, A = 45, Bb = 46, D = 50;
export const riff = [
  { step: 0, root: E, kind: 'chord', length: 2 },
  { step: 2, root: E, kind: 'mute' },
  { step: 3, root: E, kind: 'mute' },
  { step: 4, root: G, kind: 'chord', length: 1 },
  { step: 5, root: A, kind: 'chord', length: 3 },
  { step: 8, root: E, kind: 'chord', length: 2 },
  { step: 10, root: E, kind: 'mute' },
  { step: 11, root: E, kind: 'mute' },
  { step: 12, root: Bb, kind: 'chord', length: 1 },
  { step: 13, root: A, kind: 'chord', length: 1 },
  { step: 14, root: G, kind: 'chord', length: 1 },
  { step: 15, root: D, kind: 'mute' },
];
export const RIFF_STEPS = 16;

export const chordNotes = (root, kind) => (kind === 'chord' ? [root, root + 7, root + 12] : [root]);

// Karplus–Strong plucked string: a burst of filtered noise circulating in a
// delay line one period long, averaged each pass so high partials die first.
export function karplusStrong(freq, sampleRate, seconds, { brightness = 0.6, decay = 0.996, random = Math.random } = {}) {
  const period = Math.max(2, Math.round(sampleRate / freq));
  const ring = new Float32Array(period);
  let smooth = 0, mean = 0;
  for (let i = 0; i < period; i++) {
    smooth += brightness * ((random() * 2 - 1) - smooth);
    ring[i] = smooth;
    mean += smooth;
  }
  mean /= period;
  for (let i = 0; i < period; i++) ring[i] -= mean;
  const out = new Float32Array(Math.floor(sampleRate * seconds));
  let index = 0, peak = 0;
  for (let i = 0; i < out.length; i++) {
    const next = index + 1 === period ? 0 : index + 1;
    const value = ring[index];
    out[i] = value;
    ring[index] = decay * 0.5 * (value + ring[next]);
    index = next;
    if (Math.abs(value) > peak) peak = Math.abs(value);
  }
  if (peak > 0) for (let i = 0; i < out.length; i++) out[i] *= 0.9 / peak;
  return out;
}
