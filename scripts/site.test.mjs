import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { words } from './layout.mjs';
import { haste, burble, cairn, aaron, links, pages } from './content.mjs';

test('demo meals have consistent example numbers', () => {
  assert.ok(haste.demo.length >= 3);
  for (const meal of haste.demo) {
    for (const key of ['kcal', 'protein', 'carbs', 'fat']) assert.ok(Number.isFinite(meal[key]) && meal[key] > 0, `${meal.id}: ${key}`);
    // Energy from macros (4/4/9 kcal per gram) should be within 15% of the stated calories.
    const fromMacros = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;
    assert.ok(Math.abs(fromMacros - meal.kcal) / meal.kcal < 0.15, `${meal.id}: ${fromMacros} vs ${meal.kcal} kcal`);
  }
});

test('the phone has a screen for every Haste story step', () => {
  assert.deepEqual(haste.screens.map(screen => screen.id), ['capture', 'journal', 'progress']);
});

test('Burble sample notes are filed under folders the demo notebook starts with', () => {
  const roots = new Set(burble.tree.map(node => node.name));
  for (const sample of burble.demo) {
    assert.ok(roots.has(sample.path[0]), `${sample.id}: ${sample.path[0]}`);
    assert.ok(sample.input.length <= 80, `${sample.id}: fits the capture field`);
  }
  assert.equal(burble.stacks.length, 3, 'the filing story has three stacks');
});

test('Cairn is described as a concept, with no sound demo', () => {
  const page = readFileSync('dist/cairn/index.html', 'utf8');
  assert.match(page, /Concept/);
  assert.ok(!/data-sound|Hear it/.test(page));
  assert.equal(cairn.pillars.length, 3);
});

test('store, web-app and waitlist links are well formed', () => {
  for (const [name, href] of Object.entries(links)) {
    const url = new URL(href);
    assert.ok(['https:', 'mailto:'].includes(url.protocol), name);
  }
  assert.equal(new URL(links.hasteAndroid).searchParams.get('id'), 'com.kokonut.haste');
  assert.equal(new URL(links.burbleAndroid).searchParams.get('id'), 'com.kokonut.burble');
});

test('portfolio projects link to real pages and have cover art', () => {
  const known = new Set(pages.map(([, href]) => href));
  const covers = readFileSync('dist/js/covers.js', 'utf8');
  for (const project of aaron.projects) {
    assert.ok(known.has(project.href), `${project.id}: ${project.href}`);
    assert.ok(covers.includes(`async ${project.id}(ctx)`), `${project.id}: cover painter`);
  }
});

test('heading words are escaped and indexed for staggered reveals', () => {
  const html = words('Hi <b>|*there*.');
  assert.match(html, /&lt;b&gt;/);
  assert.match(html, /<br>/);
  assert.match(html, /<em>there<\/em>\./);
  assert.match(html, /--i:2/);
});
