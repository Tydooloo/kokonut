// Motion is an enhancement; navigation and download links never depend on it.
export function setupMotionControls(win = window, doc = document) {
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !preference.matches;
  const toggles = [...doc.querySelectorAll('[data-motion-toggle]')];
  function update() {
    doc.documentElement.classList.toggle('motion-paused', !enabled);
    for (const toggle of toggles) {
      toggle.hidden = false;
      toggle.innerHTML = enabled ? '<span aria-hidden="true">Ⅱ</span> Pause motion' : '<span aria-hidden="true">▷</span> Resume motion';
      toggle.setAttribute('aria-label', enabled ? 'Pause animations' : 'Resume animations');
      toggle.setAttribute('aria-pressed', String(!enabled));
    }
    win.dispatchEvent(new win.CustomEvent('kokonut:motion', {detail: {enabled}}));
  }
  const toggle = () => { enabled = !enabled; update(); };
  const change = event => { enabled = !event.matches; update(); };
  toggles.forEach(button => button.addEventListener('click', toggle));
  preference.addEventListener('change', change);
  update();
  return {
    get enabled() { return enabled; },
    setEnabled(value) { enabled = Boolean(value); update(); },
    dispose() {
      toggles.forEach(button => button.removeEventListener('click', toggle));
      preference.removeEventListener('change', change);
    },
  };
}
