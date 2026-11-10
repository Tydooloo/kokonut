// Wires one pedal lab: accessible HTML controls, the audio engine (created on
// the first press of Play, as browsers require) and, when WebGL exists, the 3D model.
import { PedalState } from './pedal-state.js';

export function init(lab, { webgl }) {
  const inputs = [...lab.querySelectorAll('[data-param]')];
  const state = new PedalState(Object.fromEntries(inputs.map(input => [input.dataset.param, input.value / 100])));
  const play = lab.querySelector('[data-pedal-play]');
  const playLabel = lab.querySelector('[data-play-label]');
  const bypass = lab.querySelector('[data-pedal-bypass]');
  const bypassLabel = lab.querySelector('[data-bypass-label]');
  let engine = null, starting = null;

  const paint = input => {
    const value = Math.round(state.values[input.dataset.param] * 100);
    input.value = value;
    input.style.setProperty('--fill', `${value}%`);
    input.nextElementSibling.textContent = value;
  };
  inputs.forEach(input => {
    paint(input);
    input.addEventListener('input', () => state.set(input.dataset.param, input.value / 100));
  });
  state.addEventListener('change', event => inputs.filter(input => input.dataset.param === event.detail.param).forEach(paint));

  state.addEventListener('bypass', () => {
    bypass.setAttribute('aria-pressed', String(state.on));
    bypassLabel.textContent = state.on ? 'Effect on' : 'Bypassed';
  });
  bypass.addEventListener('click', () => state.toggle());

  state.addEventListener('play', () => {
    play.setAttribute('aria-pressed', String(state.playing));
    playLabel.textContent = state.playing ? 'Pause the riff' : 'Play the demo riff';
  });
  play.addEventListener('click', async () => {
    if (!engine) {
      starting ??= import('./pedal-audio.js').then(module => (engine = module.createEngine(state)));
      await starting;
    }
    state.setPlaying(!state.playing);
  });

  // Never keep playing once the pedal has scrolled out of view.
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) state.setPlaying(false); }).observe(lab);

  const stage = lab.querySelector('[data-pedal]');
  if (webgl && stage) {
    new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      import('./pedal-3d.js').then(module => module.init(stage, state, () => engine)).catch(error => console.warn('Pedal 3D unavailable', error));
    }, { rootMargin: '400px' }).observe(stage);
  }
}
