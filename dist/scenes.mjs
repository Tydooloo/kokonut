import * as THREE from './vendor/three/three.module.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

export function setupScenes({motionEnabled}) {
  const elements = [...document.querySelectorAll('[data-model]')];
  if (!elements.length || navigator.connection?.saveData) return;
  const views = elements.map(element => ({element, visible: false, loaded: false, loading: false, failed: false, x: 0, y: 0}));
  const loader = new GLTFLoader();
  let frame = 0, last = 0, destroyed = false;

  function schedule() {
    if (destroyed || document.hidden || !motionEnabled() || frame || !views.some(view => view.visible && view.loaded)) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    if (destroyed || document.hidden || !motionEnabled()) return;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    for (const view of views) {
      if (!view.loaded || !view.visible || view.failed) continue;
      view.mixer.update(dt);
      const ease = 1 - Math.exp(-dt * 5);
      view.pivot.rotation.y += (view.x * .20 - view.pivot.rotation.y) * ease;
      view.pivot.rotation.x += (-view.y * .08 - view.pivot.rotation.x) * ease;
      view.renderer.render(view.scene, view.camera);
    }
    if (views.some(view => view.visible && view.loaded && !view.failed)) frame = requestAnimationFrame(tick);
  }
  async function load(view) {
    if (view.loaded || view.loading || view.failed || destroyed) return;
    view.loading = true;
    view.element.dataset.renderState = 'loading';
    try {
      const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      view.renderer = renderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 2));
      renderer.setClearColor(0, 0);
      renderer.toneMapping = THREE.AgXToneMapping;
      renderer.toneMappingExposure = .95;
      renderer.domElement.className = 'model-canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      view.element.append(renderer.domElement);
      const scene = new THREE.Scene();
      const environment = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environmentTarget = pmrem.fromScene(environment, .04);
      view.environmentTarget = environmentTarget;
      scene.environment = environmentTarget.texture;
      scene.environmentIntensity = .7;
      environment.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7b8668, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(-3, 5, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xe6efff, .65);
      fill.position.set(4, 1, 3);
      scene.add(fill);
      const camera = new THREE.OrthographicCamera(-3, 3, 3.125, -3.125, .1, 50);
      camera.position.set(0, 0, 14);
      const pivot = new THREE.Group();
      scene.add(pivot);
      Object.assign(view, {scene, camera, pivot});
      const gltf = await loader.loadAsync(`/assets/3d/${view.element.dataset.model}.glb`);
      if (destroyed) { renderer.dispose(); return; }
      pivot.add(gltf.scene);
      const mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      view.mixer = mixer;
      mixer.update(.001);
      const resize = () => {
        const width = view.element.clientWidth, height = view.element.clientHeight;
        if (!width || !height || view.failed) return;
        const aspect = width / height;
        camera.left = -3.125 * aspect;
        camera.right = 3.125 * aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
      };
      view.resize = new ResizeObserver(resize);
      view.resize.observe(view.element);
      resize();
      renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        view.failed = true;
        view.element.classList.remove('is-ready');
        view.element.dataset.renderState = 'fallback';
      });
      const hoverTarget = view.element.closest('.project-card, .project-hero-art') || view.element;
      hoverTarget.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch' || !motionEnabled()) return;
        const rect = hoverTarget.getBoundingClientRect();
        view.x = (event.clientX - rect.left) / rect.width - .5;
        view.y = (event.clientY - rect.top) / rect.height - .5;
      });
      hoverTarget.addEventListener('pointerleave', () => { view.x = 0; view.y = 0; });
      view.loaded = true;
      view.element.classList.add('is-ready');
      view.element.dataset.renderState = 'ready';
      schedule();
    } catch (error) {
      view.failed = true;
      view.renderer?.dispose();
      view.renderer?.domElement.remove();
      view.element.dataset.renderState = 'fallback';
      console.warn('3D artwork unavailable; keeping the rendered project image.', error.message);
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const view = views.find(v => v.element === entry.target);
      view.visible = entry.isIntersecting;
      if (view.visible && motionEnabled()) load(view);
    }
    schedule();
  }, {rootMargin: '80px'});
  elements.forEach(element => observer.observe(element));
  window.addEventListener('kokonut:motion', () => {
    if (!motionEnabled()) { cancelAnimationFrame(frame); frame = 0; }
    else { views.filter(view => view.visible).forEach(load); schedule(); }
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); frame = 0;
    if (!document.hidden) schedule();
  });
  window.addEventListener('pagehide', event => {
    cancelAnimationFrame(frame); frame = 0;
    if (event.persisted) return;
    destroyed = true;
    observer.disconnect();
    for (const view of views) {
      view.resize?.disconnect();
      view.mixer?.stopAllAction();
      view.scene?.traverse(object => {
        object.geometry?.dispose();
        if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          material.map?.dispose(); material.dispose();
        }
      });
      view.environmentTarget?.dispose();
      view.renderer?.dispose();
    }
  });
  window.addEventListener('pageshow', () => schedule());
}
