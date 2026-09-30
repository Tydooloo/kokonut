import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/GLTFLoader.js';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.js';
import {OrbitMotion, frontProject, TAU, clamp} from './orbit-motion.mjs';

const CARD_W = 2.48, CARD_H = 3.48;
const palette = ['#dcebba', '#f1d2b5', '#d8cef3', '#c7d4f2'];
const sublines = ['Get your people together.', 'A little less food admin.', 'Keep learning. Keep going.', 'Your plug-ins. On stage.'];

function roundedRect(width, height, radius) {
  const s = new THREE.Shape(), x = -width / 2, y = -height / 2;
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

function cardLettering(name, index) {
  const canvas = document.createElement('canvas');
  canvas.width = 992; canvas.height = 1392;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#30382d';
  ctx.font = '500 34px "DM Sans", sans-serif';
  ctx.fillText(`0${index + 1} / ${index === 3 ? 'HARDWARE' : 'SOFTWARE'}`, 76, 100);
  ctx.textAlign = 'right';
  ctx.fillText(index === 3 ? 'CONCEPT' : 'ANDROID', 916, 100);
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#30382d30';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(76, 1152); ctx.lineTo(916, 1152); ctx.stroke();
  ctx.font = '600 92px "DM Sans", sans-serif';
  ctx.fillText(name, 76, 1244);
  ctx.font = '400 43px "DM Sans", sans-serif';
  ctx.fillText(sublines[index], 79, 1306);
  ctx.lineWidth = 4; ctx.strokeStyle = '#30382d';
  ctx.beginPath(); ctx.moveTo(863, 1241); ctx.lineTo(909, 1195);
  ctx.moveTo(874, 1195); ctx.lineTo(909, 1195); ctx.lineTo(909, 1230); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function contactShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const shade = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  shade.addColorStop(0, '#19271038'); shade.addColorStop(.6, '#19271016'); shade.addColorStop(1, '#19271000');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export async function setupOrbit({motionEnabled = () => true, resumeMotion = () => {}} = {}) {
  const stage = document.querySelector('[data-orbit]');
  if (!stage) return;
  if (navigator.connection?.saveData) {
    stage.dataset.renderState = 'fallback';
    document.body.classList.add('orbit-unavailable');
    return;
  }
  const links = [...stage.querySelectorAll('[data-project]')];
  const autoplayButton = document.querySelector('[data-orbit-autoplay]');
  const motion = new OrbitMotion({count: links.length});
  let autoplay = true;
  let renderer, environmentTarget, frame = 0, last = 0, elapsed = 0;
  let visible = true, disposed = false, ready = false, gesture = null;
  let hover = -1, focused = -1, pointer = null, blockClickUntil = 0, pointerFocus = false;
  let width = 1, height = 1, compact = false, narrow = false;
  const removers = [], mixers = [], pickables = [], cards = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
  const raycaster = new THREE.Raycaster();
  const rayPoint = new THREE.Vector2();
  const projected = new THREE.Vector3();
  const corners = [[-CARD_W / 2, CARD_H / 2], [CARD_W / 2, CARD_H / 2], [CARD_W / 2, -CARD_H / 2], [-CARD_W / 2, -CARD_H / 2]];
  const brand = new THREE.Group();
  scene.add(brand);
  let resizeObserver, intersectionObserver;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect(); intersectionObserver?.disconnect();
    removers.forEach(remove => remove());
    mixers.forEach(mixer => mixer.stopAllAction());
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    textures.forEach(item => item.dispose());
    materials.forEach(item => item.dispose());
    geometries.forEach(item => item.dispose());
    environmentTarget?.dispose(); renderer?.dispose();
  }
  function fallback() {
    ready = false;
    stage.classList.remove('orbit-ready', 'is-dragging', 'is-hovering');
    stage.dataset.renderState = 'fallback';
    document.body.classList.add('orbit-unavailable');
    links.forEach(link => link.removeAttribute('style'));
    renderer?.domElement.remove();
    if (autoplayButton) autoplayButton.hidden = true;
    dispose();
  }
  function schedule() {
    if (!ready || disposed || frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function hitAt(x, y) {
    const bounds = stage.getBoundingClientRect();
    rayPoint.set((x - bounds.left) / width * 2 - 1, -(y - bounds.top) / height * 2 + 1);
    raycaster.setFromCamera(rayPoint, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit?.object.userData.projectIndex ?? -1;
  }
  function updateHover(event) {
    if (event.pointerType === 'touch') return;
    pointer = {x: event.clientX, y: event.clientY};
    const next = hitAt(event.clientX, event.clientY);
    if (next !== hover) {
      hover = next;
      stage.classList.toggle('is-hovering', hover >= 0);
    }
  }
  function projectLink(card) {
    // DOM anchors follow the actual perspective quad, including its hit area.
    const points = corners.map(([x, y]) => {
      projected.set(x, y, .025).applyMatrix4(card.group.matrixWorld).project(camera);
      return [(projected.x + 1) * width / 2, (1 - projected.y) * height / 2];
    });
    const left = Math.min(...points.map(p => p[0])), top = Math.min(...points.map(p => p[1]));
    const w = Math.max(...points.map(p => p[0])) - left, h = Math.max(...points.map(p => p[1])) - top;
    card.link.style.cssText = `left:${left.toFixed(2)}px;top:${top.toFixed(2)}px;width:${w.toFixed(2)}px;height:${h.toFixed(2)}px;z-index:${60 + Math.round(card.group.position.z * 10)};clip-path:polygon(${points.map(([x,y]) => `${((x-left)/w*100).toFixed(2)}% ${((y-top)/h*100).toFixed(2)}%`).join(',')})`;
  }
  function draw(dt = 0) {
    if (!ready || disposed) return;
    if (motionEnabled()) {
      elapsed += dt;
      mixers.forEach(mixer => mixer.update(dt * 1.12));
    }
    brand.position.set(narrow ? 0 : -.45, narrow ? 2.45 : compact ? 1.0 : .85, -.1);
    brand.scale.setScalar(narrow ? .82 : 1);
    brand.rotation.copy(camera.rotation);
    brand.rotation.z += Math.sin(elapsed * .9) * .07;
    brand.position.y += Math.sin(elapsed * 1.05) * .13;
    for (const [i, card] of cards.entries()) {
      const angle = motion.phase + i * TAU / cards.length;
      const positionAngle = angle + (narrow ? 0 : .48);
      const x = Math.sin(positionAngle), z = Math.cos(positionAngle);
      const emphasis = THREE.MathUtils.smoothstep(Math.cos(angle), .3, 1);
      const size = (narrow ? .76 : compact ? .87 : .94) + emphasis * (narrow ? .25 : .34);
      card.group.position.set(x * (narrow ? 2.9 : compact ? 3.55 : 4.55), .4 - z * .68 + Math.sin(elapsed * 1.1 + i * 1.5) * .12, z * (narrow ? 3.6 : 3.7));
      card.group.scale.setScalar(size);
      card.group.rotation.set(-.015 + Math.sin(elapsed * .8 + i) * .035, x * -.22, -x * .055 + Math.sin(elapsed * .9 + i) * (.045 - emphasis * .022));
      const targetLift = hover === i || focused === i ? .10 : 0;
      card.lift += (targetLift - card.lift) * (motionEnabled() ? 1 - Math.exp(-dt * 8) : 1);
      card.group.position.y += card.lift;
      card.model.position.y = .19 + Math.sin(elapsed * 1.25 + i) * .13;
      card.model.position.z = .25 + Math.cos(elapsed * .85 + i) * .05;
      card.model.rotation.set(Math.sin(elapsed * .8 + i) * .10, Math.sin(elapsed * .95 + i) * .20, Math.sin(elapsed * .7 + i) * .035);
      if (hover === i && pointer && motionEnabled()) card.model.rotation.y += clamp((pointer.x / window.innerWidth - .5) * .16, -.1, .1);
    }
    scene.updateMatrixWorld(true);
    cards.forEach(projectLink);
    const front = frontProject(motion.phase, cards.length);
    stage.dataset.frontProject = links[front].dataset.project;
    stage.dataset.orbitPhase = motion.phase.toFixed(4);
    stage.dataset.orbitState = motion.transition ? 'transition' : 'focus';
    stage.dataset.autoRotation = String(autoplay && motionEnabled());
    stage.dataset.idleTime = elapsed.toFixed(3);
    renderer.render(scene, camera);
  }
  function tick(now) {
    frame = 0;
    if (!ready || disposed || !visible || document.hidden) return;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    motion.update(dt, now / 1000, {automatic: autoplay && motionEnabled(), animate: motionEnabled(), held: (gesture && (!gesture.touch || gesture.dragging)) || focused >= 0 || stage.matches(':focus-visible')});
    draw(dt);
    if (motionEnabled()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = stage.clientWidth; height = stage.clientHeight;
    if (!width || !height || !renderer) return;
    narrow = width < 600;
    compact = width < 1000 || width / height < 1.35;
    camera.aspect = width / height;
    // The featured card stays large. Neighbouring cards can peek in at phone edges.
    camera.position.set(0, 1.55, narrow ? 12.9 : compact ? 12.8 : 13.25);
    camera.lookAt(0, .25, 0);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.25), compact ? 1.5 : 1.75));
    renderer.setSize(width, height, false);
    draw();
  }

  try {
    stage.dataset.renderState = 'loading';
    await Promise.all([document.fonts.load('500 34px "DM Sans"'), document.fonts.load('600 92px "DM Sans"')]);
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.domElement.className = 'orbit-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.prepend(renderer.domElement);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmrem.fromScene(environment, .035);
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = .65;
    environment.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9ea28d, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 7, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(0xf1ffd4, 1.2);
    rim.position.set(5, 2, -3); scene.add(rim);
    const loader = new GLTFLoader();
    const iconImage = new Image();
    iconImage.src = '/favicon.svg';
    const [assets] = await Promise.all([
      Promise.all(links.map(link => loader.loadAsync(`/assets/3d/${link.dataset.project}.glb`))),
      iconImage.decode(),
    ]);
    // Rasterize the existing vector at texture resolution without changing its artwork.
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = iconCanvas.height = 512;
    const iconContext = iconCanvas.getContext('2d');
    iconContext.drawImage(iconImage, 0, 0, 512, 512);
    const iconTexture = new THREE.CanvasTexture(iconCanvas);
    iconTexture.colorSpace = THREE.SRGBColorSpace;
    const icon = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 2.05), new THREE.MeshBasicMaterial({map: iconTexture, transparent: true, alphaTest: .02, toneMapped: false}));
    const alpha = iconContext.getImageData(0, 0, 512, 512).data;
    const castIcon = icon.raycast.bind(icon);
    icon.raycast = (ray, intersections) => {
      const hits = [];
      castIcon(ray, hits);
      for (const hit of hits) {
        const px = clamp(Math.floor(hit.uv.x * 512), 0, 511), py = clamp(Math.floor((1 - hit.uv.y) * 512), 0, 511);
        if (alpha[(py * 512 + px) * 4 + 3] > 8) intersections.push(hit);
      }
    };
    brand.add(icon); pickables.push(icon);
    const shape = roundedRect(CARD_W, CARD_H, .11);
    const bodyGeometry = new THREE.ExtrudeGeometry(shape, {depth: .07, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 3, steps: 1, curveSegments: 8});
    bodyGeometry.translate(0, 0, -.08);
    const printGeometry = new THREE.ShapeGeometry(shape, 10);
    const shadowTexture = contactShadow();
    for (const [i, link] of links.entries()) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(bodyGeometry, new THREE.MeshStandardMaterial({color: palette[i], roughness: .52, metalness: .05}));
      body.userData.projectIndex = i;
      pickables.push(body);
      group.add(body);
      const print = new THREE.Mesh(printGeometry, new THREE.MeshBasicMaterial({map: cardLettering(link.dataset.name, i), transparent: true, depthWrite: false, toneMapped: false}));
      // ShapeGeometry UVs use world units. Normalize them to the printed face.
      if (i === 0) {
        const uv = printGeometry.attributes.uv;
        for (let j = 0; j < uv.count; j++) uv.setXY(j, (uv.getX(j) + CARD_W / 2) / CARD_W, (uv.getY(j) + CARD_H / 2) / CARD_H);
      }
      print.position.z = .013; group.add(print);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.65), new THREE.MeshBasicMaterial({map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false}));
      shadow.position.set(.1, .1, .025); group.add(shadow);
      const model = new THREE.Group();
      const gltf = assets[i];
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const scale = Math.min(1.86 / size.x, 2.30 / size.y);
      const normalizer = new THREE.Group();
      normalizer.scale.setScalar(scale);
      normalizer.position.copy(center).multiplyScalar(-scale);
      normalizer.add(gltf.scene);
      model.add(normalizer); model.position.set(0, .19, .22);
      group.add(model);
      gltf.scene.traverse(object => { if (object.isMesh) { object.userData.projectIndex = i; pickables.push(object); } });
      const mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      mixer.setTime(i * .85 + .1); mixers.push(mixer);
      scene.add(group); cards.push({group, model, link, lift: 0});
    }
    ready = true;
    resize();
    stage.classList.add('orbit-ready');
    stage.dataset.renderState = 'ready';
    function syncAutoplay() {
      if (!autoplayButton) return;
      const playing = autoplay && motionEnabled();
      const label = playing ? 'Pause automatic rotation' : 'Resume automatic rotation';
      autoplayButton.hidden = false;
      autoplayButton.setAttribute('aria-pressed', String(!playing));
      autoplayButton.setAttribute('aria-label', label);
      autoplayButton.title = label;
      autoplayButton.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>';
    }
    syncAutoplay();
    if (autoplayButton) listen(autoplayButton, 'click', () => {
      if (!motionEnabled()) { autoplay = true; resumeMotion(); }
      else autoplay = !autoplay;
      if (autoplay && !motion.transition) motion.remaining = motion.dwell;
      syncAutoplay(); draw(); schedule();
    });
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    }, {threshold: .05});
    intersectionObserver.observe(stage);
    listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fallback(); });
    listen(stage, 'dragstart', event => event.preventDefault());
    listen(stage, 'pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerFocus = true;
      focused = -1;
      gesture = {id: event.pointerId, touch: event.pointerType === 'touch', x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), velocity: 0, dragging: false};
    });
    listen(stage, 'pointermove', event => {
      if (!gesture) { updateHover(event); draw(); return; }
      if (gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (event.pointerType === 'touch' && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture = null; pointerFocus = false; return; }
        if (Math.abs(dx) < 8) return;
        gesture.dragging = true;
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      }
      event.preventDefault();
      const now = performance.now(), delta = (event.clientX - gesture.lastX) * (compact ? .009 : .005);
      gesture.velocity = gesture.velocity * .3 + delta / Math.max(.008, (now - gesture.lastTime) / 1000) * .7;
      gesture.lastX = event.clientX; gesture.lastTime = now;
      motion.move(delta, now / 1000);
      hover = -1;
      draw(); schedule();
    });
    const finish = (event, cancelled = false) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const old = gesture; gesture = null;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      stage.classList.remove('is-dragging');
      if (old.dragging) {
        blockClickUntil = performance.now() + 500;
        motion.release(cancelled || performance.now() - old.lastTime > 120 ? 0 : old.velocity, performance.now() / 1000, motionEnabled());
      }
      pointerFocus = false;
      draw(); schedule();
    };
    listen(stage, 'pointerup', event => finish(event));
    listen(stage, 'pointercancel', event => finish(event, true));
    listen(stage, 'lostpointercapture', event => finish(event, true));
    listen(stage, 'pointerleave', () => {
      hover = -1; pointer = null; stage.classList.remove('is-hovering');
    });
    // No wheel or scroll handler: document scrolling never changes the card angle.
    listen(stage, 'click', event => {
      if (performance.now() < blockClickUntil) { event.preventDefault(); event.stopPropagation(); return; }
      // Keep native anchors (including modified clicks), but never click through the coconut icon.
      if (event.detail > 0) {
        const index = hitAt(event.clientX, event.clientY);
        const link = event.target.closest('[data-project]');
        if (index < 0 || link !== links[index]) event.preventDefault();
      }
    }, true);
    listen(stage, 'focusin', event => {
      if (pointerFocus || gesture) return;
      const index = links.indexOf(event.target.closest('[data-project]'));
      if (index >= 0) {
        focused = index; hover = -1;
        motion.select(index, performance.now() / 1000, false);
        draw();
      }
    });
    listen(stage, 'focusout', () => { focused = -1; motion.remaining = motion.dwell; });
    function step(direction) {
      hover = -1; focused = -1;
      motion.select((frontProject(motion.phase) + direction + cards.length) % cards.length, performance.now() / 1000, motionEnabled());
      draw(); schedule();
    }
    listen(stage, 'keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        const from = links.indexOf(event.target);
        if (from >= 0) links[(from + direction + links.length) % links.length].focus({preventScroll: true});
        else step(direction);
      }
      if (event.key === 'Enter' && event.target === stage) links[frontProject(motion.phase)].click();
      if (event.key === 'Escape') { hover = -1; focused = -1; event.target.blur(); }
    });
    listen(window, 'kokonut:motion', () => {
      cancelAnimationFrame(frame); frame = 0;
      syncAutoplay();
      draw(); schedule();
    });
    listen(document, 'visibilitychange', () => {
      cancelAnimationFrame(frame); frame = 0; last = performance.now();
      if (!document.hidden) schedule();
    });
    listen(window, 'pagehide', event => {
      cancelAnimationFrame(frame); frame = 0;
      if (!event.persisted) dispose();
    });
    listen(window, 'pageshow', () => schedule());
    schedule();
  } catch (error) {
    console.warn('The 3D orbit is unavailable; project links and rendered artwork remain available.', error.message);
    fallback();
  }
}
