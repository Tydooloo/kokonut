// Native details remain the fallback; animate only after capability checks.
export function setupAccordions(doc = document, win = window) {
  const pending = new Set();
  const preference = win.matchMedia('(prefers-reduced-motion: reduce)');
  for (const details of doc.querySelectorAll('.install-help details')) {
    if (!details.animate) continue;
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.faq-answer');
    if (!summary || !answer) continue;
    let animation = null;
    let fade = null;
    let expanded = details.open;

    function settle() {
      const previous = animation;
      animation = null;
      if (previous) { previous.onfinish = null; previous.cancel(); }
      fade?.cancel();
      fade = null;
      details.open = expanded;
      details.style.height = '';
      details.style.overflow = '';
      delete details.dataset.expanded;
      pending.delete(settle);
    }

    summary.addEventListener('click', event => {
      // Without motion (or JavaScript), the browser owns the disclosure entirely.
      if (preference.matches || !doc.documentElement.classList.contains('motion-enabled')) {
        if (animation) settle();
        return;
      }
      event.preventDefault();
      const start = details.getBoundingClientRect().height;
      const wasOpen = details.open;
      const opacity = Number(win.getComputedStyle(answer).opacity);
      expanded = animation ? !expanded : !details.open;
      const previous = animation;
      animation = null;
      if (previous) {previous.onfinish = null; previous.cancel();}
      fade?.cancel();
      details.style.height = '';
      details.open = true;
      details.dataset.expanded = String(expanded);
      const style = win.getComputedStyle(details);
      const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const end = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + borders;
      details.style.height = `${end}px`;
      details.style.overflow = 'hidden';
      const timing = {duration: 260, easing: 'cubic-bezier(.22,1,.36,1)'};
      animation = details.animate([{height:`${start}px`},{height:`${end}px`}],timing);
      fade = answer.animate([{opacity:wasOpen ? opacity : 0},{opacity:expanded ? 1 : 0}],timing);
      pending.add(settle);
      animation.onfinish = settle;
    });
  }
  const finishAll = () => { for (const finish of [...pending]) finish(); };
  win.addEventListener('resize', finishAll, {passive:true});
  preference.addEventListener('change', finishAll);
  doc.addEventListener('kokonut:motionchange', finishAll);
  doc.addEventListener('visibilitychange', () => {if(doc.hidden) finishAll();});
}
