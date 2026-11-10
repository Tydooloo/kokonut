// Hero: thousands of GPU particles that morph between the Kokonut coconut,
// Haste's leaves and the VST Pedal. The pointer pushes particles aside;
// scrolling away scatters them.
import { createStage, THREE, clamp, damp } from './stage.js';
import { coconut, flame, pedal, rng } from './shapes.js';
import { motion } from './motion.js';

const HOLD = 6.5, MORPH = 1.9;

const vertexShader = /* glsl */`
uniform float uTime, uT, uFrom, uTo, uScatter, uSize, uPixelRatio, uMouseStrength;
uniform vec3 uMouse;
attribute vec3 aP1, aP2, aC0, aC1, aC2;
attribute vec4 aRand;
varying vec3 vColor;
varying float vAlpha;
vec3 shapeP(float i) { return i < .5 ? position : (i < 1.5 ? aP1 : aP2); }
vec3 shapeC(float i) { return i < .5 ? aC0 : (i < 1.5 ? aC1 : aC2); }
void main() {
  float t = clamp(uT * 1.45 - aRand.x * .45, 0., 1.);
  float e = t * t * t * (t * (t * 6. - 15.) + 10.);
  vec3 p = mix(shapeP(uFrom), shapeP(uTo), e);
  float wave = sin(t * 3.14159);
  vec3 n = vec3(
    sin(p.y * 3.1 + uTime * .9 + aRand.y * 6.283),
    sin(p.z * 2.7 + uTime * 1.1 + aRand.z * 6.283),
    sin(p.x * 3.3 + uTime * .8 + aRand.w * 6.283));
  p += n * (.01 + wave * .5 * (.4 + aRand.y));
  vec3 dir = normalize(p + (aRand.xyz - .5) * .8 + 1e-4);
  p += dir * uScatter * (1.2 + aRand.w * 3.5);
  vec4 world = modelMatrix * vec4(p, 1.);
  vec3 d = world.xyz - uMouse;
  float push = smoothstep(.8, 0., length(d.xy)) * uMouseStrength;
  world.xyz += normalize(d + vec3(0., 0., .2)) * push * .45;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (.5 + aRand.w * .9) / -mv.z;
  vColor = mix(shapeC(uFrom), shapeC(uTo), e) * (1. + push * .9);
  vAlpha = 1. - uScatter * .9;
}`;

const fragmentShader = /* glsl */`
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - .5);
  if (d > .5) discard;
  gl_FragColor = vec4(vColor, smoothstep(.5, .08, d) * vAlpha * uOpacity);
}`;

async function iconPixels(src, size) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

export async function init(container, switcher) {
  const small = matchMedia('(max-width: 900px)').matches;
  const count = small ? 7000 : 16000;
  const random = rng(20261110);
  const shapes = [coconut(count, random), flame(count, random, await iconPixels('/assets/haste/icon.webp', 220)), pedal(count, random)];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(shapes[0].positions, 3));
  geometry.setAttribute('aP1', new THREE.BufferAttribute(shapes[1].positions, 3));
  geometry.setAttribute('aP2', new THREE.BufferAttribute(shapes[2].positions, 3));
  shapes.forEach((shape, i) => geometry.setAttribute(`aC${i}`, new THREE.BufferAttribute(shape.colors, 3)));
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = random();
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);

  const uniforms = {
    uTime: { value: 0 }, uT: { value: 1 }, uFrom: { value: 0 }, uTo: { value: 0 },
    uScatter: { value: 0 }, uSize: { value: small ? 34 : 30 }, uPixelRatio: { value: Math.min(devicePixelRatio || 1, 2) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseStrength: { value: 0 }, uOpacity: { value: small ? 0.72 : 0.78 },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);

  const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: 0, lastMove: -10 };
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const state = { from: 0, to: 0, t: 1, hold: 0, queued: null, autoPausedUntil: 0 };
  let heroHeight = innerHeight, layout = { x: 0, y: 0, scale: 1 };

  const stage = createStage(container, {
    fov: 35, environment: false,
    onResize({ width, height }) {
      const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(35 / 2)) * 6, viewW = viewH * (width / height);
      const wide = width / height > 1.05;
      layout = wide ? { x: viewW * 0.2, y: -0.05, scale: Math.min(1.15, viewW / 7) + 0.15 } : { x: 0, y: viewH * 0.26, scale: Math.min(0.62, viewW / 3.1) };
      heroHeight = container.getBoundingClientRect().height;
    },
    onFrame(dt, time) {
      const still = motion.paused;
      if (!still) uniforms.uTime.value = time;
      // Morph timeline: hold a shape, then flow into the next.
      if (state.t < 1) {
        state.t = still ? 1 : Math.min(1, state.t + dt / MORPH);
        if (state.t === 1) { state.from = state.to; state.hold = 0; if (state.queued !== null) { go(state.queued); state.queued = null; } }
      } else if (!still && performance.now() > state.autoPausedUntil) {
        state.hold += dt;
        if (state.hold >= HOLD) go((state.to + 1) % 3);
      }
      uniforms.uT.value = state.t; uniforms.uFrom.value = state.from; uniforms.uTo.value = state.to;
      progress(state.t < 1 ? 0 : state.hold / HOLD);

      pointer.sx = damp(pointer.sx, pointer.x, 4, dt); pointer.sy = damp(pointer.sy, pointer.y, 4, dt);
      const idle = time - pointer.lastMove > 1.4;
      pointer.active = damp(pointer.active, idle || still ? 0 : 1, idle ? 1.5 : 6, dt);
      uniforms.uMouseStrength.value = pointer.active;
      ray.setFromCamera({ x: pointer.sx, y: pointer.sy }, stage.camera);
      if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit);

      const sway = still ? 0 : Math.sin(time * 0.22) * 0.42;
      points.rotation.y = sway + pointer.sx * 0.28;
      points.rotation.x = -pointer.sy * 0.14;
      points.position.set(layout.x, layout.y + (still ? 0 : Math.sin(time * 0.6) * 0.05), 0);
      points.scale.setScalar(layout.scale);
      uniforms.uScatter.value = Math.pow(clamp(scrollY / (heroHeight * 0.85), 0, 1), 1.4);
    },
  });
  stage.camera.position.set(0, 0, 6);
  stage.scene.add(points);

  const buttons = [...switcher.querySelectorAll('[data-morph]')];
  function progress(value) {
    buttons.forEach((button, i) => button.style.setProperty('--p', i === state.to ? value.toFixed(3) : 0));
  }
  function go(index) {
    if (index === state.to && state.t === 1) return;
    if (state.t < 1) { state.queued = index; return; }
    state.from = state.to; state.to = index; state.t = 0; state.hold = 0;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  buttons.forEach((button, i) => {
    const choose = pauseFor => { state.autoPausedUntil = performance.now() + pauseFor; go(i); };
    button.addEventListener('click', () => choose(14000));
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') choose(9000); });
  });

  addEventListener('pointermove', event => {
    if (event.clientY > heroHeight) return;
    const rect = stage.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointer.lastMove = stage.clock.time;
  }, { passive: true });
  motion.subscribe(() => stage.render());
}
