// Hero: thousands of GPU particles that draw either the Kokonut logo or Haste's
// leaves, and morph from one to the other. The canvas spans the whole hero, so
// nothing is cut off: the logo sits in its own column (never over the headline),
// a fine dust drifts across the full width, the pointer pushes particles aside,
// and scrolling away scatters them across the screen.
import { createStage, THREE, clamp, damp } from './stage.js';
import { coconut, flame, rng } from './shapes.js';
import { motion } from './motion.js';

const HOLD = 6, MORPH = 1.6, SHAPES = 2, FOV = 35, DISTANCE = 6, LOGO_SPAN = 3;
const TINTS = [new THREE.Color(0xd9b98f), new THREE.Color(0x9fd0b8)];

const logoVertex = /* glsl */`
uniform float uTime, uT, uFrom, uTo, uScatter, uSize, uPixelRatio, uMouseStrength;
uniform vec3 uMouse;
attribute vec3 aP1, aC0, aC1;
attribute vec4 aRand;
varying vec3 vColor;
varying float vAlpha;
vec3 shapeP(float i) { return i < .5 ? position : aP1; }
vec3 shapeC(float i) { return i < .5 ? aC0 : aC1; }
void main() {
  float t = clamp(uT * 1.45 - aRand.x * .45, 0., 1.);
  float e = t * t * t * (t * (t * 6. - 15.) + 10.);
  vec3 p = mix(shapeP(uFrom), shapeP(uTo), e);
  float wave = sin(t * 3.14159);
  vec3 n = vec3(
    sin(p.y * 3.1 + uTime * .9 + aRand.y * 6.283),
    sin(p.z * 2.7 + uTime * 1.1 + aRand.z * 6.283),
    sin(p.x * 3.3 + uTime * .8 + aRand.w * 6.283));
  p += n * (.006 + wave * .45 * (.4 + aRand.y));
  vec3 dir = normalize(p + (aRand.xyz - .5) * .8 + 1e-4);
  p += dir * uScatter * (1.5 + aRand.w * 5.);
  vec4 world = modelMatrix * vec4(p, 1.);
  vec3 d = world.xyz - uMouse;
  float push = smoothstep(.8, 0., length(d.xy)) * uMouseStrength;
  world.xyz += normalize(d + vec3(0., 0., .2)) * push * .45;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (.5 + aRand.w * .9) / -mv.z;
  vColor = mix(shapeC(uFrom), shapeC(uTo), e) * (1. + push * .9);
  vAlpha = 1. - uScatter * .85;
}`;

// Dust: sparse points drifting slowly upwards across the whole hero, wrapping at the edges.
const dustVertex = /* glsl */`
uniform float uTime, uSize, uPixelRatio, uMouseStrength, uScatter;
uniform vec2 uView;
uniform vec3 uMouse, uTint;
attribute vec4 aRand;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float depth = position.z * 1.6;
  float reach = (${DISTANCE.toFixed(1)} - depth) / ${DISTANCE.toFixed(1)};
  float y = mod(position.y + 1. + uTime * (.006 + aRand.x * .014), 2.) - 1.;
  float x = position.x + sin(uTime * .15 + aRand.y * 6.283) * .015;
  vec3 world = vec3(x * uView.x * reach, y * uView.y * reach, depth);
  vec3 d = world - uMouse;
  float push = smoothstep(1.1, 0., length(d.xy)) * uMouseStrength;
  world.xy += normalize(d.xy + 1e-4) * push * .5;
  world.y += uScatter * (.4 + aRand.z) * 1.5;
  vec4 mv = viewMatrix * vec4(world, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (.35 + aRand.z * .8) / -mv.z;
  vColor = mix(uTint, vec3(1.), aRand.w * .4);
  vAlpha = (.25 + aRand.w * .6) * smoothstep(1., .8, abs(y)) * (1. + push) * (1. - uScatter * .6);
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

async function imagePixels(src, size) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

export async function init(hero, switcher) {
  const anchor = hero.querySelector('.hero-visual');
  const small = matchMedia('(max-width: 900px)').matches;
  const count = small ? 7000 : 14000, dustCount = small ? 900 : 2200;
  const random = rng(20261112);
  const [logoImage, iconImage] = await Promise.all([imagePixels('/assets/logo.svg', 240), imagePixels('/assets/haste/icon.webp', 220)]);
  const shapes = [coconut(count, random, logoImage), flame(count, random, iconImage)];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(shapes[0].positions, 3));
  geometry.setAttribute('aP1', new THREE.BufferAttribute(shapes[1].positions, 3));
  shapes.forEach((shape, i) => geometry.setAttribute(`aC${i}`, new THREE.BufferAttribute(shape.colors, 3)));
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = random();
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));

  const shared = {
    uTime: { value: 0 }, uScatter: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio || 1, 2) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uMouseStrength: { value: 0 },
  };
  const uniforms = { ...shared, uT: { value: 1 }, uFrom: { value: 0 }, uTo: { value: 0 }, uSize: { value: 30 }, uOpacity: { value: 0.8 } };
  const blend = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const points = new THREE.Points(geometry, new THREE.ShaderMaterial({ uniforms, vertexShader: logoVertex, fragmentShader, ...blend }));
  points.frustumCulled = false;

  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3), dustRand = new Float32Array(dustCount * 4);
  for (let i = 0; i < dustPositions.length; i++) dustPositions[i] = random() * 2 - 1;
  for (let i = 0; i < dustRand.length; i++) dustRand[i] = random();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('aRand', new THREE.BufferAttribute(dustRand, 4));
  const dustUniforms = { ...shared, uSize: { value: 34 }, uOpacity: { value: 1 }, uView: { value: new THREE.Vector2(1, 1) }, uTint: { value: TINTS[0].clone() } };
  const dust = new THREE.Points(dustGeometry, new THREE.ShaderMaterial({ uniforms: dustUniforms, vertexShader: dustVertex, fragmentShader, ...blend }));
  dust.frustumCulled = false;

  const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: 0, lastMove: -10 };
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const state = { from: 0, to: 0, t: 1, hold: 0, queued: null, autoPausedUntil: 0 };
  // Where the logo sits: the centre of the .hero-visual column, in world units at z = 0.
  const place = { x: 0, y: 0, scale: 1 };

  const stage = createStage(hero, {
    fov: FOV, environment: false,
    onResize({ width, height }) {
      const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * DISTANCE, unit = viewH / height;
      dustUniforms.uView.value.set(viewH * (width / height) / 2 + 0.3, viewH / 2 + 0.3);
      const box = anchor.getBoundingClientRect(), frame = hero.getBoundingClientRect();
      place.x = (box.left + box.width / 2 - frame.left - width / 2) * unit;
      place.y = -(box.top + box.height / 2 - frame.top - height / 2) * unit;
      place.scale = clamp((Math.min(box.width, box.height * 0.86) * unit) / LOGO_SPAN, 0.35, 1.6);
      uniforms.uSize.value = 30 * clamp(Math.min(box.width, box.height) / 560, 0.75, 1.15);
    },
    onFrame(dt, time) {
      const still = motion.paused;
      if (!still) shared.uTime.value = time;
      if (state.t < 1) {
        state.t = still ? 1 : Math.min(1, state.t + dt / MORPH);
        if (state.t === 1) { state.from = state.to; state.hold = 0; if (state.queued !== null) { go(state.queued); state.queued = null; } }
      } else if (!still && performance.now() > state.autoPausedUntil) {
        state.hold += dt;
        if (state.hold >= HOLD) go((state.to + 1) % SHAPES);
      }
      uniforms.uT.value = state.t; uniforms.uFrom.value = state.from; uniforms.uTo.value = state.to;
      dustUniforms.uTint.value.lerpColors(TINTS[state.from], TINTS[state.to], state.t);
      progress(state.t < 1 ? 0 : state.hold / HOLD);

      pointer.sx = damp(pointer.sx, pointer.x, 4, dt); pointer.sy = damp(pointer.sy, pointer.y, 4, dt);
      const idle = time - pointer.lastMove > 1.4;
      pointer.active = damp(pointer.active, idle || still ? 0 : 1, idle ? 1.5 : 6, dt);
      shared.uMouseStrength.value = pointer.active;
      ray.setFromCamera({ x: pointer.sx, y: pointer.sy }, stage.camera);
      if (ray.ray.intersectPlane(plane, hit)) shared.uMouse.value.copy(hit);

      points.rotation.y = (still ? 0 : Math.sin(time * 0.22) * 0.34) + pointer.sx * 0.2;
      points.rotation.x = -pointer.sy * 0.12;
      points.position.set(place.x, place.y + (still ? 0 : Math.sin(time * 0.6) * 0.04), 0);
      points.scale.setScalar(place.scale);
      // The logo stays crisp while the hero fills the screen, then scatters as it scrolls away.
      const rect = hero.getBoundingClientRect();
      shared.uScatter.value = Math.pow(clamp((-rect.top / rect.height - 0.45) / 0.45, 0, 1), 1.2);
    },
  });
  stage.camera.position.set(0, 0, DISTANCE);
  stage.scene.add(dust, points);

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

  hero.addEventListener('pointermove', event => {
    const rect = stage.canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointer.lastMove = stage.clock.time;
  }, { passive: true });
  motion.subscribe(() => stage.render());
}
