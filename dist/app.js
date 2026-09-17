document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });

const notice = document.querySelector('[data-device-notice]');
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (notice && isIOS) notice.textContent = 'Browsing on iPhone or iPad? These APKs need an Android phone or tablet. Open kokonut.cc on an Android device to install. Read each app’s test notes before downloading.';

document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = !navigator.clipboard;
  button.addEventListener('click', async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = 'Checksum copied';
    } catch { button.textContent = 'Select and copy the checksum above'; }
    setTimeout(() => { button.textContent = original; }, 3500);
  });
});
