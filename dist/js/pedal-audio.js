// Web Audio signal chain for the pedal demo:
// plucked strings -> [bypass | drive -> tone -> cab -> tape delay + plate] -> limiter.
import { driveCurve, toneFrequency, riff, RIFF_STEPS, EIGHTH, chordNotes, midiToFreq, karplusStrong } from './pedal-dsp.js';
import { rng } from './shapes.js';

export function createEngine(state) {
  const ctx = new AudioContext({ latencyHint: 'interactive' });
  const node = (type, props = {}) => Object.assign(ctx[`create${type}`](), props);
  const param = (audioParam, value, time = 0.03) => audioParam.setTargetAtTime(value, ctx.currentTime, time);

  const input = node('Gain');
  const dry = node('Gain'), fxIn = node('Gain');
  const highpass = node('BiquadFilter', { type: 'highpass' }); highpass.frequency.value = 90;
  const pre = node('Gain');
  const shaper = node('WaveShaper', { oversample: '4x' });
  const post = node('Gain');
  const tone = node('BiquadFilter', { type: 'lowpass' }); tone.Q.value = 0.8;
  const cab = node('BiquadFilter', { type: 'peaking' }); cab.frequency.value = 1900; cab.gain.value = 4; cab.Q.value = 0.9;
  const cabTop = node('BiquadFilter', { type: 'lowpass' }); cabTop.frequency.value = 6200;
  const fxDry = node('Gain');
  const delay = node('Delay'); delay.delayTime.value = EIGHTH * 3;
  const feedback = node('Gain'); feedback.gain.value = 0.36;
  const tape = node('BiquadFilter', { type: 'lowpass' }); tape.frequency.value = 2600;
  const delayWet = node('Gain');
  const plate = node('Convolver');
  const plateWet = node('Gain');
  const master = node('Gain'); master.gain.value = 0;
  const limiter = node('DynamicsCompressor'); limiter.threshold.value = -10; limiter.ratio.value = 12; limiter.attack.value = 0.003; limiter.release.value = 0.15;
  const analyser = node('Analyser', { fftSize: 1024 });

  input.connect(dry).connect(master);
  input.connect(fxIn).connect(highpass).connect(pre).connect(shaper).connect(post).connect(tone).connect(cab).connect(cabTop);
  cabTop.connect(fxDry).connect(master);
  cabTop.connect(delay).connect(tape).connect(feedback).connect(delay);
  tape.connect(delayWet).connect(master);
  cabTop.connect(plate).connect(plateWet).connect(master);
  master.connect(limiter).connect(analyser).connect(ctx.destination);

  // Plate reverb: two channels of exponentially decaying noise.
  const random = rng(42);
  const length = Math.floor(ctx.sampleRate * 2.4);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) data[i] = (random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
  }
  plate.buffer = impulse;

  const apply = () => {
    const { drive, tone: brightness, mix } = state.values;
    shaper.curve = driveCurve(drive);
    param(pre.gain, 1 + drive * 14);
    param(post.gain, 0.55 / (1 + drive * 1.6));
    param(tone.frequency, toneFrequency(brightness));
    param(delayWet.gain, mix * 0.5);
    param(plateWet.gain, mix * 0.65);
    param(fxDry.gain, 1 - mix * 0.35);
  };
  const bypass = () => {
    param(fxIn.gain, state.on ? 1 : 0, 0.01);
    param(dry.gain, state.on ? 0 : 0.9, 0.01);
  };
  apply(); bypass();
  state.addEventListener('change', apply);
  state.addEventListener('bypass', bypass);

  // Rendered strings, cached per note.
  const cache = new Map();
  const buffer = (midi, kind) => {
    const key = `${midi}:${kind}`;
    if (!cache.has(key)) {
      const muted = kind === 'mute';
      const samples = karplusStrong(midiToFreq(midi), ctx.sampleRate, muted ? 0.35 : 2.2, { brightness: muted ? 0.35 : 0.7, decay: muted ? 0.97 : 0.997, random });
      const audio = ctx.createBuffer(1, samples.length, ctx.sampleRate);
      audio.copyToChannel(samples, 0);
      cache.set(key, audio);
    }
    return cache.get(key);
  };
  riff.forEach(event => chordNotes(event.root, event.kind).forEach(midi => buffer(midi, event.kind)));

  const playEvent = (event, time) => {
    chordNotes(event.root, event.kind).forEach((midi, i) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer(midi, event.kind);
      const gain = ctx.createGain();
      const start = time + i * 0.011;
      const end = time + (event.kind === 'mute' ? EIGHTH * 0.9 : EIGHTH * event.length);
      gain.gain.setValueAtTime(event.kind === 'mute' ? 0.55 : 0.32, start);
      gain.gain.setTargetAtTime(0, end, 0.05);
      source.connect(gain).connect(input);
      source.start(start);
      source.stop(end + 0.4);
    });
  };

  let timer = 0, step = 0, next = 0;
  const schedule = () => {
    while (next < ctx.currentTime + 0.12) {
      riff.filter(event => event.step === step).forEach(event => playEvent(event, next));
      next += EIGHTH;
      step = (step + 1) % RIFF_STEPS;
    }
  };
  const start = async () => {
    await ctx.resume();
    step = 0; next = ctx.currentTime + 0.06;
    master.gain.cancelScheduledValues(ctx.currentTime);
    param(master.gain, 0.8, 0.02);
    schedule();
    timer = setInterval(schedule, 25);
  };
  const stop = () => {
    clearInterval(timer);
    param(master.gain, 0, 0.15);
  };
  state.addEventListener('play', () => (state.playing ? start() : stop()));

  const wave = new Float32Array(analyser.fftSize);
  return {
    analyser,
    waveform() { analyser.getFloatTimeDomainData(wave); return wave; },
    level() {
      analyser.getFloatTimeDomainData(wave);
      let sum = 0;
      for (let i = 0; i < wave.length; i++) sum += wave[i] * wave[i];
      return Math.sqrt(sum / wave.length);
    },
  };
}
