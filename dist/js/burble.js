// Burble: black ink on paper. Loose notes float around the headline; as you scroll
// they fly into three tidy stacks, and one is pulled back out by a search. The page
// itself takes ink from the cursor, and a small demo shows where a note would be filed.
import { $, $$, motion, pointer, clamp, lerp, smooth, damp, pinProgress, finePointer, webglAvailable } from './core.js';
import { createStage, THREE } from './stage.js';
import { buildSheet, sheetKinds, SHEET } from './model-paper.js';

const root = document.documentElement;

/* ---------- Filing story: which step is showing ---------- */
const filing = $('[data-filing]');
const steps = $$('[data-step]', filing), dots = $$('.b-dots li', filing);
let progress = 0, stepIndex = 0;
const paintSteps = () => {
  progress = pinProgress(filing);
  const index = Math.min(steps.length - 1, Math.floor(progress * steps.length * 0.999));
  filing.style.setProperty('--p', progress.toFixed(4));
  if (index === stepIndex && steps[index].classList.contains('is-active')) return;
  stepIndex = index;
  steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  filing.dataset.stage = index;
};
addEventListener('scroll', paintSteps, { passive: true });
addEventListener('resize', paintSteps);
paintSteps();

/* ---------- Ink: the cursor leaves a stroke that dries and fades ---------- */
const inkCanvas = $('[data-ink]');
if (inkCanvas && finePointer) {
  const ctx = inkCanvas.getContext('2d');
  const points = [];
  let ratio = 1, drawing = false;
  const resize = () => { ratio = Math.min(devicePixelRatio || 1, 2); inkCanvas.width = innerWidth * ratio; inkCanvas.height = innerHeight * ratio; };
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', event => {
    if (motion.paused || scrollY > innerHeight * 0.7) return;
    const last = points[points.length - 1], now = performance.now();
    const gap = !last || now - last.t > 140;
    const speed = last && !gap ? Math.hypot(event.clientX - last.x, event.clientY - last.y) / Math.max(1, now - last.t) : 0;
    points.push({ x: event.clientX, y: event.clientY, t: now, width: clamp(4.2 - speed * 1.5, 1.1, 4.2), start: gap });
    if (points.length > 700) points.shift();
    if (!drawing) { drawing = true; requestAnimationFrame(draw); }
  }, { passive: true });
  const HOLD = 1500, FADE = 1100;
  function draw(now) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    while (points.length && now - points[0].t > HOLD + FADE) points.shift();
    ctx.lineCap = 'round'; ctx.strokeStyle = '#191919';
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (b.start) continue;
      ctx.globalAlpha = clamp(1 - (now - b.t - HOLD) / FADE) * 0.82;
      ctx.lineWidth = (a.width + b.width) / 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    if (points.length) requestAnimationFrame(draw); else drawing = false;
  }
}

/* ---------- Filing demo ---------- */
const demo = $('[data-file-demo]');
if (demo) {
  const samples = JSON.parse(demo.dataset.samples);
  const input = $('[data-capture]', demo), go = $('[data-capture-go]', demo), tree = $('[data-tree]', demo);
  const toast = $('[data-toast]', demo), toastText = $('[data-toast-text]', demo), undo = $('[data-undo]', demo);
  let lastNote = null, typing = 0;

  // Simple stand-in rules for anything typed by hand. The real app uses AI.
  const guess = text => {
    const day = /\b(mon|tues|wednes|thurs|fri|satur|sun)day\b|\btomorrow\b|\btonight\b/i.exec(text);
    const time = /\b(?:at )?(\d{1,2})(?::(\d\d))? ?(am|pm)?\b/i.exec(text);
    if (day) return { result: 'Added to', path: ['Calendar', `${day[0][0].toUpperCase()}${day[0].slice(1).toLowerCase()}${time ? ` ${time[1]}:${time[2] || '00'}${time[3] ? ` ${time[3].toLowerCase()}` : ''}` : ''}`] };
    if (/\b(buy|get|pick up|remember to|call|email|book|pay|send)\b/i.test(text)) return { result: 'Task added to', path: ['Personal', 'Tasks'] };
    if (/\b(lecture|exam|assignment|study|course|uni|proof|theorem|algorithm)\b/i.test(text)) return { result: 'Filed in', path: ['Uni', 'Algorithms'] };
    if (/\b(idea|plan|build|design|project|feature|launch)\b/i.test(text)) return { result: 'Filed in', path: ['Projects', 'Website'] };
    if (/\b(recipe|cook|dinner|bake|lunch)\b/i.test(text)) return { result: 'Filed in', path: ['Personal', 'Recipes'] };
    return { result: 'Filed in', path: ['Personal', 'Journal'] };
  };

  // Find the tree node for a path, creating any folder that doesn't exist yet.
  const nodeFor = path => {
    let list = tree, node = null, key = '';
    path.forEach(name => {
      key = key ? `${key}/${name}` : name;
      node = [...list.children].find(item => item.dataset.node === key);
      if (!node) {
        node = document.createElement('li'); node.dataset.node = key; node.className = 'is-new';
        const label = document.createElement('span'); label.textContent = name; node.append(label);
        list.append(node);
      }
      list = node.querySelector(':scope > ul') || node.appendChild(document.createElement('ul'));
    });
    return { node, list };
  };

  const file = () => {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const sample = samples.find(s => s.input.toLowerCase() === text.toLowerCase());
    const { result, path } = sample || guess(text);
    const { node, list } = nodeFor(path);
    $$('.is-hit', tree).forEach(hit => hit.classList.remove('is-hit'));
    const note = document.createElement('li'); note.className = 'tree-note';
    note.textContent = text;
    list.prepend(note);
    node.classList.add('is-hit');
    node.scrollIntoView({ block: 'nearest', behavior: motion.paused ? 'auto' : 'smooth' });
    toastText.replaceChildren(`${result} `, Object.assign(document.createElement('strong'), { textContent: path.join(' / ') }));
    toast.classList.remove('is-shown'); void toast.offsetWidth; toast.classList.add('is-shown');
    undo.hidden = false; lastNote = { note, node };
    input.value = '';
  };

  go.addEventListener('click', file);
  input.addEventListener('keydown', event => { if (event.key === 'Enter') file(); });
  undo.addEventListener('click', () => {
    if (!lastNote) return;
    lastNote.note.remove(); lastNote.node.classList.remove('is-hit');
    if (lastNote.node.classList.contains('is-new') && !lastNote.node.querySelector('.tree-note')) lastNote.node.remove();
    lastNote = null; undo.hidden = true;
    toastText.textContent = 'Undone. Nothing was filed.';
  });
  $$('[data-sample]', demo).forEach(chip => chip.addEventListener('click', async () => {
    const mine = ++typing, text = samples[Number(chip.dataset.sample)].input;
    if (motion.paused) input.value = text;
    else for (let n = 1; n <= text.length; n++) {
      if (mine !== typing) return;
      input.value = text.slice(0, n);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    await new Promise(resolve => setTimeout(resolve, motion.paused ? 0 : 260));
    if (mine === typing) file();
  }));
}

/* ---------- The sheets ---------- */
const stageEl = $('[data-sheets]');
if (stageEl && webglAvailable()) start(); else root.classList.add('no-webgl');

function start() {
  const COUNT = 30, CAMERA_Z = 10;
  const stacks = $$('[data-stack]');
  const view = { unit: 1, width: 1, height: 1, halfW: 1, halfH: 1 };
  const toWorld = (px, py) => [(px - view.width / 2) * view.unit, -(py - view.height / 2) * view.unit];

  const sheets = Array.from({ length: COUNT }, (_, i) => {
    const group = buildSheet(sheetKinds[i % sheetKinds.length], i + 1);
    const golden = i * 2.399963, wobble = Math.sin(i * 12.9898) * 43758.5453, r1 = wobble - Math.floor(wobble), r2 = (r1 * 7.13) % 1, r3 = (r1 * 3.71) % 1;
    return {
      group, i, stack: i % 3, level: Math.floor(i / 3),
      angle: golden, ring: 0.7 + r1 * 0.5, depth: -3.2 + r2 * 4.4,
      tumble: new THREE.Euler((r1 - 0.5) * 1.1, (r2 - 0.5) * 1.4, (r3 - 0.5) * 1.3),
      drift: 0.25 + r3 * 0.5, phase: golden, lean: (r2 - 0.5) * 0.16, nudge: [(r1 - 0.5) * 0.08, (r3 - 0.5) * 0.05],
      push: new THREE.Vector2(), size: 0.85 + r2 * 0.4,
    };
  });
  const found = sheets[16]; // the note the search pulls back out

  let intro = 0;
  const stage = createStage(stageEl, {
    fov: 35, environment: false,
    onResize({ width, height }) {
      view.width = width; view.height = height;
      view.unit = 2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * CAMERA_Z / height;
      view.halfW = width * view.unit / 2; view.halfH = height * view.unit / 2;
    },
    onFrame(dt, time) {
      const still = motion.paused;
      intro = Math.min(1, intro + dt * 0.7);
      // Once the story has finished, the canvas scrolls away with it.
      const filingRect = filing.getBoundingClientRect();
      const leave = Math.max(0, view.height - filingRect.bottom);
      stageEl.style.transform = leave ? `translateY(${-leave}px)` : '';

      const p = progress;
      const base = Math.min(view.height * 0.2, view.width * 0.24) * view.unit; // sheet height in world units
      const targets = stacks.map(stack => { const r = stack.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; });
      const [mx, my] = toWorld(pointer.px, pointer.py);
      const pull = smooth(0.74, 0.92, p);

      sheets.forEach(sheet => {
        const order = sheet.i / COUNT;
        const filed = smooth(0.1 + order * 0.3, 0.42 + order * 0.3, p);
        // Loose: a ring around the headline, drifting.
        const sway = still ? 0 : time * sheet.drift;
        let x = Math.cos(sheet.angle) * view.halfW * sheet.ring * 1.02 + Math.sin(sway + sheet.phase) * 0.14;
        let y = Math.sin(sheet.angle) * view.halfH * sheet.ring * 0.98 + Math.cos(sway * 0.8 + sheet.phase) * 0.14;
        let z = sheet.depth;
        let scale = base / SHEET.H * sheet.size;
        let rx = sheet.tumble.x + Math.sin(sway * 0.7) * 0.25, ry = sheet.tumble.y + Math.cos(sway * 0.6) * 0.3, rz = sheet.tumble.z;

        // The cursor pushes loose sheets aside.
        if (!still && pointer.active && filed < 0.5) {
          const dx = x - mx, dy = y - my, distance = Math.hypot(dx, dy), reach = base * 1.5;
          if (distance < reach && distance > 0.001) { const force = (1 - distance / reach) * base * 0.9; sheet.push.x += dx / distance * force * dt * 9; sheet.push.y += dy / distance * force * dt * 9; }
        }
        sheet.push.multiplyScalar(Math.exp(-dt * 2.2));
        x += sheet.push.x * (1 - filed); y += sheet.push.y * (1 - filed);

        // Filed: squared up on its stack.
        if (filed > 0) {
          const target = targets[sheet.stack];
          const [tx, ty] = toWorld(target.x, target.y);
          const stackScale = target.h * view.unit / SHEET.H * 0.86;
          const fx = tx + sheet.nudge[0] * stackScale, fy = ty + sheet.nudge[1] * stackScale + sheet.level * 0.012 * stackScale, fz = sheet.level * 0.03;
          const arc = Math.sin(filed * Math.PI);
          x = lerp(x, fx, filed); y = lerp(y, fy, filed) + arc * 0.5; z = lerp(z, fz, filed) + arc * 1.6;
          scale = lerp(scale, stackScale, filed);
          rx = lerp(rx, 0, filed); ry = lerp(ry, 0, filed) + arc * 0.5; rz = lerp(rz, sheet.lean, filed);
        }
        // Found: one note lifts off its stack and comes forward.
        if (sheet === found && pull > 0) {
          const centre = targets[1], [cx, cy] = toWorld(centre.x, centre.y);
          x = lerp(x, cx, pull); y = lerp(y, cy + centre.h * view.unit * 0.04, pull); z = lerp(z, 2.2, pull);
          scale *= 1 + pull * 0.55; rz = lerp(rz, -0.04, pull); ry += Math.sin(pull * Math.PI) * 0.6;
        }
        const enter = smooth(sheet.i * 0.018, sheet.i * 0.018 + 0.45, intro);
        sheet.group.position.set(x * (1 + (1 - enter) * 0.6), y * (1 + (1 - enter) * 0.6), z);
        sheet.group.rotation.set(rx, ry, rz + (1 - enter) * 1.2);
        sheet.group.scale.setScalar(scale * (0.2 + enter * 0.8));
        sheet.group.visible = enter > 0.01;
      });
    },
  });
  stage.camera.position.set(0, 0, CAMERA_Z);
  stage.scene.add(...sheets.map(sheet => sheet.group));
  stage.scene.add(new THREE.AmbientLight(0xffffff, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-2, 3, 6);
  stage.scene.add(sun);
  stage.renderer.toneMapping = THREE.NoToneMapping;
  root.classList.add('has-webgl');
}
