// Cover art for the portfolio's projects, drawn in code on 960 x 640 canvases.
// The same canvases appear in the work list and on the ring of cards behind the portrait.
import { sheetCanvas } from './model-paper.js';

const image = src => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
const W = 960, H = 640;

const painters = {
  async haste(ctx) {
    const [icon, screen] = await Promise.all([image('/assets/haste/icon.webp'), image('/assets/haste/screen-journal.webp')]);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#dcebdf'); bg.addColorStop(1, '#f1f4ea');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(251, 252, 248, .9)'; ctx.beginPath(); ctx.arc(700, 330, 300, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(19, 35, 26, .06)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(700, 330, 236, 0, Math.PI * 2); ctx.stroke();
    // Phone
    ctx.save(); ctx.translate(700, 340); ctx.rotate(-0.12);
    ctx.shadowColor = 'rgba(14, 27, 20, .35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 30;
    ctx.fillStyle = '#0e1b14'; ctx.beginPath(); ctx.roundRect(-128, -270, 256, 540, 38); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.roundRect(-118, -260, 236, 520, 30); ctx.clip();
    ctx.drawImage(screen, -118, -260, 236, 236 * screen.height / screen.width);
    ctx.restore();
    // Mark and name
    ctx.save(); ctx.beginPath(); ctx.roundRect(72, 196, 92, 92, 24); ctx.clip(); ctx.drawImage(icon, 72, 196, 92, 92); ctx.restore();
    ctx.fillStyle = '#13231a'; ctx.font = '650 118px Geist, system-ui, sans-serif'; ctx.letterSpacing = '-6px'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Haste', 66, 420);
    ctx.fillStyle = '#2c8a62'; ctx.font = 'italic 400 46px "Instrument Serif", Georgia, serif'; ctx.letterSpacing = '0px';
    ctx.fillText('Log a meal in seconds.', 72, 482);
  },
  async burble(ctx) {
    ctx.fillStyle = '#fbfaf7'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e6e3dc'; ctx.lineWidth = 2;
    for (let y = 80; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    [['sketch', 700, 150, 0.14, 5], ['checklist', 800, 330, -0.1, 2], ['sticky', 640, 400, 0.06, 9]].forEach(([kind, x, y, angle, seed]) => {
      const sheet = sheetCanvas(kind, seed);
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.shadowColor = 'rgba(25, 25, 25, .18)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 12;
      ctx.drawImage(sheet, -110, -148, 220, 296);
      ctx.restore();
    });
    ctx.fillStyle = '#191919'; ctx.font = '500 168px Newsreader, Georgia, serif'; ctx.letterSpacing = '-7px'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Burble', 64, 360);
    ctx.strokeStyle = '#191919'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(72, 402); ctx.bezierCurveTo(190, 378, 300, 424, 520, 396); ctx.stroke();
    ctx.fillStyle = '#6b6862'; ctx.font = 'italic 400 44px Newsreader, Georgia, serif'; ctx.letterSpacing = '0px';
    ctx.fillText('The notebook that organizes itself.', 70, 478);
  },
  async cairn(ctx) {
    ctx.fillStyle = '#0a0908'; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(700, 640, 0, 700, 640, 520);
    glow.addColorStop(0, 'rgba(255, 122, 26, .5)'); glow.addColorStop(1, 'rgba(255, 122, 26, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    const beam = ctx.createLinearGradient(0, 0, 0, H);
    beam.addColorStop(0, 'rgba(255, 200, 150, .2)'); beam.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(660, 0); ctx.lineTo(740, 0); ctx.lineTo(940, H); ctx.lineTo(460, H); ctx.fill();
    // A cairn
    [[700, 520, 170, 54], [690, 420, 124, 46], [712, 338, 84, 36], [698, 276, 48, 26]].forEach(([x, y, rx, ry], i) => {
      const stone = ctx.createRadialGradient(x - rx * 0.4, y - ry * 0.6, 4, x, y, rx);
      stone.addColorStop(0, '#fbf5ea'); stone.addColorStop(0.6, '#cfc4b2'); stone.addColorStop(1, '#8d8272');
      ctx.fillStyle = stone; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, i % 2 ? 0.05 : -0.04, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#ede6da'; ctx.font = '400 236px Anton, Impact, sans-serif'; ctx.letterSpacing = '4px'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('CAIRN', 56, 392);
    ctx.fillStyle = '#ff7a1a'; ctx.font = '500 40px Geist, system-ui, sans-serif'; ctx.letterSpacing = '0px';
    ctx.fillText('Your plugins, on stage.', 62, 462);
  },
  async kokonut(ctx) {
    const logo = await image('/assets/logo.svg');
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1d1611'); bg.addColorStop(1, '#0f0c0a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(690, 300, 0, 690, 300, 420);
    glow.addColorStop(0, 'rgba(247, 239, 223, .16)'); glow.addColorStop(1, 'rgba(247, 239, 223, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(logo, 520, 120, 360, 360);
    ctx.fillStyle = '#f7efdf'; ctx.font = '600 128px Geist, system-ui, sans-serif'; ctx.letterSpacing = '-6px'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('kokonut', 60, 400);
    ctx.fillStyle = '#c9ad80'; ctx.font = 'italic 400 44px "Instrument Serif", Georgia, serif'; ctx.letterSpacing = '0px';
    ctx.fillText('An independent studio.', 66, 462);
  },
};

// Draws every cover it is given ({ id: canvas }) once the typefaces are ready.
export async function drawCovers(canvases) {
  await Promise.all(['650 118px Geist', 'italic 400 46px "Instrument Serif"', '500 168px Newsreader', 'italic 400 44px Newsreader', '400 236px Anton'].map(font => document.fonts.load(font))).catch(() => {});
  await Promise.all(Object.entries(canvases).map(async ([id, canvas]) => {
    const ctx = canvas.getContext('2d');
    try { ctx.save(); await painters[id]?.(ctx); ctx.restore(); }
    catch { ctx.restore(); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, H); }
  }));
}
