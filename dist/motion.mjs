// Decorative motion never owns scrolling or hides content. One frame reads all
// visible scenes before writing transforms. The CSS banner loop is visibility-gated.
export function sceneProgress(top, height, viewportHeight) {
  const span = (height + viewportHeight) / 2;
  if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(top)) return 0;
  return Math.max(-1, Math.min(1, (viewportHeight / 2 - top - height / 2) / span));
}

export function setupMotion(win = window, doc = document) {
  const scenes = [...doc.querySelectorAll('[data-motion-scene]')];
  if (!scenes.length || !win.IntersectionObserver || !win.matchMedia) return () => {};
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = doc.querySelector('[data-motion-toggle]');
  const active = new Set();
  let enabled = false;
  let paused = false;
  let disposed = false;
  let frame = 0;

  function render() {
    frame = 0;
    if (!enabled || doc.hidden) return;
    const updates = [...active].map(scene => {
      const bounds = scene.getBoundingClientRect();
      return [scene, sceneProgress(bounds.top, bounds.height, win.innerHeight)];
    });
    for (const [scene, progress] of updates) {
      scene.style.setProperty('--scene-progress', progress.toFixed(4));
    }
  }
  function schedule() {
    if (!disposed && enabled && active.size && !frame && !doc.hidden) frame = win.requestAnimationFrame(render);
  }
  const observer = new win.IntersectionObserver(entries => {
    if (!enabled) return;
    for (const entry of entries) {
      entry.target.classList.toggle('scene-visible', entry.isIntersecting);
      if (entry.isIntersecting) active.add(entry.target);
      else active.delete(entry.target);
    }
    schedule();
  }, {rootMargin: '80px'});

  function synchronize() {
    enabled = !preference.matches && !paused;
    doc.documentElement.classList.toggle('motion-enabled', enabled);
    if (toggle) {
      toggle.hidden = preference.matches;
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = enabled ? 'Motion on' : 'Motion off';
    }
    observer.disconnect();
    active.clear();
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    for (const scene of scenes) {
      scene.classList.remove('scene-visible');
      scene.style.removeProperty('--scene-progress');
      if (enabled) observer.observe(scene);
    }
    doc.dispatchEvent(new Event('kokonut:motionchange'));
  }
  function toggleMotion() { paused = !paused; synchronize(); }
  function onVisibility() {
    if (doc.hidden && frame) { win.cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }
  preference.addEventListener('change', synchronize);
  toggle?.addEventListener('click', toggleMotion);
  win.addEventListener('scroll', schedule, {passive: true});
  win.addEventListener('resize', schedule, {passive: true});
  win.addEventListener('pageshow', schedule);
  doc.addEventListener('visibilitychange', onVisibility);
  doc.fonts?.ready.then(schedule);
  synchronize();

  return () => {
    disposed = true;
    enabled = false;
    observer.disconnect();
    active.clear();
    if (frame) win.cancelAnimationFrame(frame);
    doc.documentElement.classList.remove('motion-enabled');
    for (const scene of scenes) {
      scene.style.removeProperty('--scene-progress');
      scene.classList.remove('scene-visible');
    }
    preference.removeEventListener('change', synchronize);
    toggle?.removeEventListener('click', toggleMotion);
    if (toggle) toggle.hidden = true;
    win.removeEventListener('scroll', schedule);
    win.removeEventListener('resize', schedule);
    win.removeEventListener('pageshow', schedule);
    doc.removeEventListener('visibilitychange', onVisibility);
  };
}
