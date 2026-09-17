import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sceneProgress, setupMotion} from '../dist/motion.mjs';

function harness(reduced = false) {
  const trace = [];
  const frames = new Map();
  const classes = new Set();
  const scenes = [0, 1].map(id => ({
    values: new Map(),
    classes: new Set(),
    classList: {
      toggle(name,on) { if(on) scenes[id].classes.add(name); else scenes[id].classes.delete(name); },
      remove(name) {scenes[id].classes.delete(name);},
    },
    getBoundingClientRect() { trace.push(`read${id}`); return {top: 200, height: 400}; },
    style: {
      setProperty(key, value) { trace.push(`write${id}`); scenes[id].values.set(key, value); },
      removeProperty(key) { scenes[id].values.delete(key); },
    },
  }));
  const preference = Object.assign(new EventTarget(), {matches: reduced});
  const toggle = Object.assign(new EventTarget(), {hidden: true, attrs: {}, setAttribute(k,v) {this.attrs[k]=v;}});
  const doc = Object.assign(new EventTarget(), {
    hidden: false,
    querySelectorAll: () => scenes,
    querySelector: () => toggle,
    documentElement: {classList: {
      toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
      remove: name => classes.delete(name),
    }},
  });
  let observer, frameId = 0;
  const win = Object.assign(new EventTarget(), {
    innerHeight: 800,
    matchMedia: () => preference,
    requestAnimationFrame: cb => {frames.set(++frameId,cb);return frameId;},
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) {this.callback=callback;this.observed=new Set();observer=this;}
      observe(target) {this.observed.add(target);}
      disconnect() {this.observed.clear();}
    },
  });
  const cleanup = setupMotion(win,doc);
  return {scenes,doc,win,toggle,preference,frames,classes,trace,cleanup,observer,
    intersect(visible=true) {observer.callback(scenes.map(target=>({target,isIntersecting:visible})));},
    flush() {const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());},
  };
}

test('progress is bounded across entering, centered and leaving scenes', () => {
  assert.equal(sceneProgress(800,400,800),-1);
  assert.equal(sceneProgress(200,400,800),0);
  assert.equal(sceneProgress(-400,400,800),1);
  assert.equal(sceneProgress(-10000,400,800),1);
  assert.equal(sceneProgress(10000,400,800),-1);
  assert.equal(sceneProgress(0,0,0),0);
  assert.equal(sceneProgress(NaN,400,800),0);
});

test('scroll bursts share one frame, read before writing, then stop at rest', () => {
  const h=harness();
  h.intersect();
  assert.equal(h.scenes[0].classes.has('scene-visible'),true);
  for(let i=0;i<20;i++) h.win.dispatchEvent(new Event('scroll'));
  assert.equal(h.frames.size,1);
  h.flush();
  assert.deepEqual(h.trace,['read0','read1','write0','write1']);
  assert.equal(h.frames.size,0);
  h.intersect(false);
  assert.equal(h.scenes[0].classes.has('scene-visible'),false);
  h.win.dispatchEvent(new Event('scroll'));
  assert.equal(h.frames.size,0,'no frames for offscreen scenes');
  h.cleanup();
});

test('system reduced motion and manual pause cancel work and restore static content', () => {
  const h=harness(true);
  assert.equal(h.observer.observed.size,0);
  assert.equal(h.toggle.hidden,true);
  h.preference.matches=false;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.observer.observed.size,2);
  h.intersect();h.flush();
  assert.equal(h.scenes[0].values.size,1);
  h.win.dispatchEvent(new Event('scroll'));
  h.toggle.dispatchEvent(new Event('click'));
  assert.equal(h.frames.size,0);
  assert.equal(h.scenes[0].values.size,0);
  assert.equal(h.classes.has('motion-enabled'),false);
  assert.equal(h.toggle.attrs['aria-pressed'],'false');
  h.toggle.dispatchEvent(new Event('click'));
  assert.equal(h.classes.has('motion-enabled'),true);
  h.preference.matches=true;
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.classes.has('motion-enabled'),false);
  assert.equal(h.observer.observed.size,0);
  h.cleanup();
});

test('visibility, resize and restored pages schedule safely; cleanup removes listeners', () => {
  const h=harness();h.intersect();
  h.doc.hidden=true;
  h.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.frames.size,0);
  h.win.dispatchEvent(new Event('scroll'));
  assert.equal(h.frames.size,0);
  h.doc.hidden=false;
  h.doc.dispatchEvent(new Event('visibilitychange'));
  h.win.dispatchEvent(new Event('resize'));
  h.win.dispatchEvent(new Event('pageshow'));
  assert.equal(h.frames.size,1);
  h.flush();h.cleanup();
  assert.equal(h.toggle.hidden,true);
  assert.equal(h.scenes[0].values.size,0);
  h.win.dispatchEvent(new Event('scroll'));
  h.preference.dispatchEvent(new Event('change'));
  assert.equal(h.frames.size,0);
  assert.equal(h.observer.observed.size,0);
});
