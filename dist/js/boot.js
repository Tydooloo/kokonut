// Runs before first paint: lets CSS hide content that will animate in.
// If the main module never starts (blocked or failed), show everything after 4 s.
document.documentElement.classList.add('js');
setTimeout(function () {
  if (!document.documentElement.dataset.ready) document.documentElement.classList.remove('js');
}, 4000);
