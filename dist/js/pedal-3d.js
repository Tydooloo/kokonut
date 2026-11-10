// The VST Pedal, modelled in code. Knobs turn when dragged, the footswitch
// stomps, the LED and display react to the live audio.
import { createStage, roundedRect, shadowTexture, glowTexture, THREE, clamp, damp } from './stage.js';
import { knobAngle } from './pedal-dsp.js';
import { motion } from './motion.js';

const W = 1.2, D = 1.55, H = 0.36, TOP = H / 2;
const KNOBS = [['drive', 'DRIVE', -0.36], ['tone', 'TONE', 0], ['mix', 'SPACE', 0.36]];
const KNOB_Z = -0.16, LED_Z = 0.2, SWITCH_Z = 0.48, DISPLAY_Z = -0.53;
const REST_YAW = -0.32;

function topGraphics() {
  const Wp = W - 0.1, Dp = D - 0.1, cw = 1024, ch = Math.round(1024 * Dp / Wp), s = cw / Wp;
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const at = (x, z) => [(x + Wp / 2) * s, (z + Dp / 2) * s];
  const ink = '#2b2621', orange = '#e8672a';
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.textBaseline = 'middle';

  ctx.font = '700 34px Bricolage, "DM Sans", sans-serif';
  ctx.textAlign = 'left'; ctx.fillText('Kokonut', ...at(-0.48, -0.665));
  ctx.font = '600 22px ui-monospace, Consolas, monospace';
  ctx.textAlign = 'right'; ctx.fillText('VST · 01', ...at(0.48, -0.665));

  KNOBS.forEach(([, label, x]) => {
    const [cx, cy] = at(x, KNOB_Z);
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i <= 10; i++) {
      const a = (-135 + i * 27) * Math.PI / 180, r1 = 0.15 * s, r2 = (i % 5 ? 0.165 : 0.178) * s;
      ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r1, cy - Math.cos(a) * r1); ctx.lineTo(cx + Math.sin(a) * r2, cy - Math.cos(a) * r2); ctx.stroke();
    }
    ctx.font = '700 26px ui-monospace, Consolas, monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 0.21 * s);
  });

  ctx.fillStyle = orange;
  ctx.fillRect(...at(-0.48, 0.2), 0.38 * s, 5);
  ctx.fillRect(...at(0.1, 0.2), 0.38 * s, 5);
  ctx.fillStyle = ink;
  ctx.font = '600 20px ui-monospace, Consolas, monospace'; ctx.textAlign = 'left';
  ctx.fillText('ACTIVE', ...at(0.07, LED_Z - 0.045));
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(...at(0, SWITCH_Z), 0.17 * s, 0, Math.PI * 2); ctx.stroke();

  const vertical = (text, x, z, angle) => { ctx.save(); ctx.translate(...at(x, z)); ctx.rotate(angle); ctx.textAlign = 'center'; ctx.fillText(text, 0, 0); ctx.restore(); };
  ctx.font = '600 18px ui-monospace, Consolas, monospace';
  vertical('OUT ←', -0.51, -0.25, -Math.PI / 2);
  vertical('← IN', 0.51, -0.25, Math.PI / 2);
  ctx.textAlign = 'left'; ctx.fillText('MADE IN NZ', ...at(-0.48, 0.68));
  ctx.textAlign = 'right'; ctx.fillStyle = orange; ctx.fillText('CONCEPT', ...at(0.48, 0.68));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function knurledKnob() {
  const geometry = new THREE.CylinderGeometry(0.104, 0.114, 0.13, 144, 1);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    if (r < 0.09) continue;
    const k = 1 + 0.028 * Math.cos(Math.atan2(z, x) * 36);
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export async function init(container, state, getEngine) {
  await document.fonts.load('700 34px Bricolage').catch(() => {});
  const pedal = new THREE.Group();
  const picks = [];

  const body = new THREE.MeshPhysicalMaterial({ color: 0xd8cfbb, roughness: 0.52, metalness: 0.04, clearcoat: 0.35, clearcoatRoughness: 0.45 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdedbd4, metalness: 1, roughness: 0.14 });
  const black = new THREE.MeshStandardMaterial({ color: 0x141416, metalness: 0.65, roughness: 0.32 });

  const shell = new THREE.ExtrudeGeometry(roundedRect(W - 0.08, D - 0.08, 0.1), { depth: H - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 8, curveSegments: 24 });
  shell.translate(0, 0, -(H - 0.08) / 2);
  shell.rotateX(-Math.PI / 2);
  pedal.add(new THREE.Mesh(shell, body));

  const art = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, D - 0.1), new THREE.MeshStandardMaterial({ map: topGraphics(), transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
  art.rotation.x = -Math.PI / 2;
  art.position.y = TOP + 0.001;
  pedal.add(art);

  // Display.
  const displayCanvas = document.createElement('canvas');
  displayCanvas.width = 640; displayCanvas.height = 192;
  const displayTexture = new THREE.CanvasTexture(displayCanvas);
  displayTexture.colorSpace = THREE.SRGBColorSpace;
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.016, 0.24), new THREE.MeshPhysicalMaterial({ color: 0x080706, roughness: 0.1, clearcoat: 1 }));
  bezel.position.set(0, TOP + 0.006, DISPLAY_Z);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.186), new THREE.MeshBasicMaterial({ map: displayTexture, toneMapped: false }));
  screen.rotation.x = -Math.PI / 2;
  screen.position.set(0, TOP + 0.0145, DISPLAY_Z);
  pedal.add(bezel, screen);

  // Knobs.
  const knobGeometry = knurledKnob();
  const knobs = KNOBS.map(([param, , x]) => {
    const group = new THREE.Group();
    group.position.set(x, TOP, KNOB_Z);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.128, 0.016, 64), black);
    skirt.position.y = 0.008;
    const knob = new THREE.Mesh(knobGeometry, black);
    knob.position.y = 0.081;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.086, 0.012, 64), chrome);
    cap.position.y = 0.152;
    const pointer = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.006, 0.075), new THREE.MeshBasicMaterial({ color: 0xff8a3d, toneMapped: false }));
    pointer.position.set(0, 0.159, -0.042);
    group.add(skirt, knob, cap, pointer);
    [skirt, knob, cap, pointer].forEach(mesh => { mesh.userData = { knob: param }; picks.push(mesh); });
    pedal.add(group);
    return { param, group, angle: knobAngle(state.values[param]), hover: 0 };
  });

  // LED.
  const ledLens = new THREE.MeshStandardMaterial({ color: 0x3a1406, emissive: 0xff5a1f, emissiveIntensity: 2.5, roughness: 0.2 });
  const ledBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.018, 40), chrome);
  ledBezel.position.set(0, TOP + 0.009, LED_Z);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), ledLens);
  led.position.set(0, TOP + 0.016, LED_Z);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,120,50,1)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.position.set(0, TOP + 0.05, LED_Z);
  glow.scale.setScalar(0.5);
  const ledLight = new THREE.PointLight(0xff6a2a, 0.6, 1.2, 2);
  ledLight.position.set(0, TOP + 0.09, LED_Z);
  pedal.add(ledBezel, led, glow, ledLight);

  // Footswitch: nut, shaft and a domed cap that travels when stomped.
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 6), chrome);
  nut.position.set(0, TOP + 0.015, SWITCH_Z);
  const plunger = new THREE.Group();
  plunger.position.set(0, TOP, SWITCH_Z);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.06, 40), chrome);
  shaft.position.y = 0.06;
  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.098, 0.034, 64), chrome);
  capBase.position.y = 0.105;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.094, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), chrome);
  dome.scale.y = 0.32;
  dome.position.y = 0.122;
  plunger.add(shaft, capBase, dome);
  [nut, shaft, capBase, dome].forEach(mesh => { mesh.userData = { stomp: true }; picks.push(mesh); });
  pedal.add(nut, plunger);

  // Jacks on the sides, DC on the back, screws on the corners.
  [[-1, 'out'], [1, 'in']].forEach(([side]) => {
    const jackNut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), chrome);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.024, 24), new THREE.MeshBasicMaterial({ color: 0x050505 }));
    [jackNut, hole].forEach(mesh => { mesh.rotation.z = Math.PI / 2; mesh.position.set(side * (W / 2 + 0.008), 0, -0.25); pedal.add(mesh); });
  });
  const dc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 24), black);
  dc.rotation.x = Math.PI / 2; dc.position.set(0, 0, -D / 2 - 0.01);
  pedal.add(dc);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 20), chrome);
    screw.position.set(sx * (W / 2 - 0.085), TOP + 0.003, sz * (D / 2 - 0.085));
    pedal.add(screw);
  });

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.7), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.9 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.002;

  const rig = new THREE.Group();
  rig.add(pedal, shadow);

  // Display drawing.
  const dctx = displayCanvas.getContext('2d');
  const names = { drive: 'DRIVE', tone: 'TONE', mix: 'SPACE' };
  let lastDraw = 0;
  function drawDisplay(time, engine) {
    const { width: w, height: h } = displayCanvas;
    const on = state.on, playing = state.playing && engine;
    dctx.fillStyle = '#0c0805'; dctx.fillRect(0, 0, w, h);
    dctx.globalAlpha = on ? 1 : 0.4;
    dctx.fillStyle = '#ff8a3d'; dctx.font = '600 22px ui-monospace, Consolas, monospace'; dctx.textBaseline = 'middle';
    dctx.textAlign = 'left'; dctx.fillText('VST HOST', 22, 28);
    dctx.textAlign = 'right'; dctx.fillText(on ? (playing ? '● LIVE' : 'READY') : 'BYPASS', w - 22, 28);
    dctx.strokeStyle = '#ff8a3d'; dctx.lineWidth = 3; dctx.beginPath();
    const wave = playing ? engine.waveform() : null;
    for (let x = 0; x <= w - 44; x += 4) {
      const i = wave ? Math.floor((x / (w - 44)) * (wave.length - 1)) : 0;
      const v = wave ? clamp(wave[i] * 2.2, -1, 1) : Math.sin(x * 0.04 + time * 2) * 0.06;
      const y = 92 + v * 46;
      x ? dctx.lineTo(22 + x, y) : dctx.moveTo(22 + x, y);
    }
    dctx.stroke();
    const change = state.lastChange, recent = performance.now() - change.at < 1400 && change.param in names;
    dctx.font = '600 24px ui-monospace, Consolas, monospace';
    if (recent) {
      const value = Math.round(state.values[change.param] * 100);
      dctx.textAlign = 'left'; dctx.fillText(names[change.param], 22, 162);
      dctx.fillStyle = 'rgba(255,138,61,.2)'; dctx.fillRect(160, 152, w - 290, 20);
      dctx.fillStyle = '#ff8a3d'; dctx.fillRect(160, 152, (w - 290) * value / 100, 20);
      dctx.textAlign = 'right'; dctx.fillText(`${value}%`, w - 22, 162);
    } else {
      dctx.globalAlpha *= 0.7; dctx.textAlign = 'left';
      dctx.fillText('AMP  ›  TAPE  ›  PLATE', 22, 162);
    }
    dctx.globalAlpha = 1;
    for (let y = 0; y < h; y += 4) { dctx.fillStyle = 'rgba(0,0,0,.18)'; dctx.fillRect(0, y, w, 1); }
    displayTexture.needsUpdate = true;
  }

  const pose = { yaw: REST_YAW, pitch: 0, velocity: 0, mode: null, last: -10, press: 0, hoverX: 0 };
  const fit = { factor: 1 };
  const camDir = new THREE.Vector3(0, 2.15, 2.35);
  let ledLevel = 0;

  const stage = createStage(container, {
    fov: 30, exposure: 0.85,
    onResize({ width, height }) { fit.factor = Math.max(1, 1.1 / (width / height)); },
    onFrame(dt, time) {
      const still = motion.paused, engine = getEngine();
      stage.camera.position.copy(camDir).multiplyScalar(fit.factor);
      stage.camera.lookAt(0, -0.06, 0.06);
      if (pose.mode !== 'orbit') {
        pose.yaw += pose.velocity;
        pose.velocity *= Math.pow(0.05, dt);
        if (time - pose.last > 2.5 && Math.abs(pose.velocity) < 0.002) {
          const rest = REST_YAW + (still ? 0 : Math.sin(time * 0.35) * 0.14) + pose.hoverX * 0.12;
          pose.yaw = damp(pose.yaw, rest + Math.round((pose.yaw - rest) / (Math.PI * 2)) * Math.PI * 2, 2, dt);
          pose.pitch = damp(pose.pitch, 0, 2, dt);
        }
      }
      rig.rotation.set(pose.pitch, pose.yaw, 0);
      rig.position.y = still ? 0 : Math.sin(time * 0.9) * 0.015;

      knobs.forEach(knob => {
        knob.angle = damp(knob.angle, knobAngle(state.values[knob.param]), 18, dt);
        knob.group.rotation.y = knob.angle;
        knob.group.scale.setScalar(1 + knob.hover * 0.04);
      });
      pose.press = damp(pose.press, 0, 14, dt);
      plunger.position.y = TOP - pose.press * 0.022;

      const level = state.playing && engine ? engine.level() : 0;
      ledLevel = damp(ledLevel, level, 20, dt);
      const lit = state.on ? 1 : 0;
      ledLens.emissiveIntensity = lit * (1.6 + ledLevel * 14);
      glow.material.opacity = lit * clamp(0.65 + ledLevel * 3, 0, 1);
      glow.scale.setScalar(0.42 + lit * ledLevel * 1.6);
      ledLight.intensity = lit * (0.35 + ledLevel * 3);

      if (time - lastDraw > 1 / 30) { lastDraw = time; drawDisplay(still ? 0 : time, engine); }
    },
  });
  stage.scene.add(rig);
  const key = new THREE.DirectionalLight(0xfff1e0, 1.5); key.position.set(-2, 4, 3);
  const rim = new THREE.DirectionalLight(0xff9a55, 3.2); rim.position.set(3, 1.2, -3);
  const fill = new THREE.DirectionalLight(0xa7c6ff, 0.6); fill.position.set(-3, 0.5, -1);
  stage.scene.add(key, rim, fill);
  state.addEventListener('bypass', () => { if (!stage.running) stage.render(); });

  // Pointer: turn knobs, stomp the switch, or orbit the pedal.
  const canvas = stage.canvas, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pick = event => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera);
    return ray.intersectObjects(picks, false)[0]?.object.userData;
  };
  let start = { x: 0, y: 0, value: 0, param: null };
  canvas.addEventListener('pointerdown', event => {
    const target = pick(event);
    container.classList.add('has-interacted');
    canvas.setPointerCapture(event.pointerId);
    start = { x: event.clientX, y: event.clientY, value: 0, param: null };
    if (target?.knob) { pose.mode = 'knob'; start.param = target.knob; start.value = state.values[target.knob]; canvas.style.cursor = 'ns-resize'; }
    else if (target?.stomp) { pose.mode = 'stomp'; pose.press = 1; state.toggle(); }
    else { pose.mode = 'orbit'; }
  });
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pose.hoverX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    if (pose.mode === 'knob') {
      state.set(start.param, start.value + (start.y - event.clientY) / 170 + (event.clientX - start.x) / 240);
    } else if (pose.mode === 'orbit') {
      const dx = event.clientX - (start.lx ?? start.x), dy = event.clientY - (start.ly ?? start.y);
      start.lx = event.clientX; start.ly = event.clientY;
      pose.velocity = dx * 0.008;
      pose.yaw += dx * 0.008;
      pose.pitch = clamp(pose.pitch + dy * 0.004, -0.3, 0.45);
      pose.last = stage.clock.time;
    } else if (!pose.mode && event.pointerType === 'mouse') {
      const target = pick(event);
      knobs.forEach(knob => { knob.hover = target?.knob === knob.param ? 1 : 0; });
      canvas.style.cursor = target?.knob ? 'ns-resize' : target?.stomp ? 'pointer' : '';
    }
  });
  const release = () => { if (pose.mode === 'orbit') pose.last = stage.clock.time; pose.mode = null; canvas.style.cursor = ''; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { pose.hoverX = 0; knobs.forEach(knob => { knob.hover = 0; }); });
}
