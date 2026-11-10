// Shared WebGL scaffolding: renderer, camera, studio lighting, resizing,
// and a render loop that sleeps while the canvas is off-screen or the tab is hidden.
import * as THREE from '../vendor/three/three.module.js';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';

export { THREE };

export function createStage(container, { fov = 30, environment = true, exposure = 1, onFrame, onResize } = {}) {
  const canvas = container.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  if (environment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }

  const size = { width: 1, height: 1 };
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    size.width = width; size.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    onResize?.(size);
    camera.updateProjectionMatrix();
    if (!running) render();
  };

  let visible = false, running = false, frame = 0, last = 0, ready = false;
  const clock = { time: 0 };
  const render = () => {
    renderer.render(scene, camera);
    if (!ready) { ready = true; container.classList.add('is-ready'); }
  };
  const tick = now => {
    const dt = Math.min((now - (last || now)) / 1000, 1 / 20);
    last = now;
    clock.time += dt;
    onFrame?.(dt, clock.time);
    render();
    frame = running ? requestAnimationFrame(tick) : 0;
  };
  const update = () => {
    const shouldRun = visible && !document.hidden;
    if (shouldRun && !running) { running = true; last = 0; frame = requestAnimationFrame(tick); }
    if (!shouldRun && running) { running = false; cancelAnimationFrame(frame); }
  };

  new ResizeObserver(resize).observe(container);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { rootMargin: '100px' }).observe(container);
  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); container.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => location.reload());

  resize();
  return { renderer, scene, camera, canvas, size, clock, render, get running() { return running; } };
}

export function roundedRect(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -height / 2, r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - r);
  shape.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + height);
  shape.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

// A flat rounded rectangle whose UVs span 0..1, so a texture fills it exactly.
export function roundedPlane(width, height, radius, segments = 16) {
  const geometry = new THREE.ShapeGeometry(roundedRect(width, height, radius), segments);
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) uv.setXY(i, position.getX(i) / width + 0.5, position.getY(i) / height + 0.5);
  return geometry;
}

// Soft contact shadow, drawn once into a small canvas.
export function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.22)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function glowTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.25, color.replace(/[\d.]+\)$/, '0.35)'));
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
