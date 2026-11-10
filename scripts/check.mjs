// Static checks for the built site: pages, links, anchors, assets, scripts and release data.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { pages } from './layout.mjs';

const root = resolve('dist');
const files = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
let refs = 0;
for (const file of files) {
  const html = readFileSync(join(root, file), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: exactly one h1`);
  assert.match(html, /name="viewport"/, `${file}: mobile viewport`);
  assert.match(html, /<title>[^<]+<\/title>/, `${file}: title`);
  assert.match(html, /<main\b[^>]*id="main"/, `${file}: skip-link target`);
  const footer = html.match(/<footer\b[^]*?<\/footer>/)?.[0];
  assert.ok(footer, `${file}: footer`);
  for (const [, path] of pages) assert.ok(html.includes(`href="${path}"`), `${file}: no link to ${path}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), `${file}: inline scripts are blocked by the CSP`);
  assert.ok(!/(src|href)="https?:\/\/(?!kokonut\.cc)[^"]*\.(js|css|woff2?)"/.test(html), `${file}: third-party scripts, styles or fonts`);
  assert.ok(!/sidequest|revisen/i.test(html.replace(/SideQuest and Revisen have been retired/, '')), `${file}: retired products still mentioned`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(https?:|data:|mailto:)/.test(ref)) continue;
    const [path, anchor] = ref.split('#');
    const target = path ? join(root, path.endsWith('/') ? `${path}index.html` : path) : join(root, file);
    assert.ok(existsSync(target), `${file}: missing ${ref}`);
    if (anchor && target.endsWith('.html')) assert.ok(readFileSync(target, 'utf8').includes(`id="${anchor}"`), `${file}: missing anchor ${ref}`);
    refs++;
  }
}

const css = readFileSync(join(root, 'styles.css'), 'utf8');
assert.ok(!css.includes('@import'), 'Fonts must be local');
for (const match of css.matchAll(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g)) assert.ok(existsSync(join(root, match[1])), `Missing CSS asset ${match[1]}`);

// Every relative module import must resolve, and nothing may load from a CDN at runtime.
const scripts = readdirSync(join(root, 'js')).filter(file => file.endsWith('.js'));
for (const file of scripts) {
  const source = readFileSync(join(root, 'js', file), 'utf8');
  for (const match of source.matchAll(/(?:from\s+|import\()\s*'([^']+)'/g)) {
    assert.ok(match[1].startsWith('.'), `js/${file}: bare import ${match[1]}`);
    assert.ok(existsSync(resolve(root, 'js', match[1])), `js/${file}: missing import ${match[1]}`);
  }
  for (const match of source.matchAll(/['"`](\/assets\/[^'"`$]+)['"`]/g)) assert.ok(existsSync(join(root, match[1])), `js/${file}: missing asset ${match[1]}`);
  assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(source), `js/${file}: external URL`);
}
for (const id of ['capture', 'journal', 'progress']) assert.ok(existsSync(join(root, `assets/haste/screen-${id}.webp`)), `Haste ${id} screen`);

const manifest = JSON.parse(readFileSync(join(root, 'releases/manifest.json'), 'utf8'));
assert.deepEqual(manifest.releases.map(app => app.id), ['haste'], 'Only Haste is distributed');
for (const app of manifest.releases) {
  assert.equal(new URL(app.url).origin, 'https://github.com');
  assert.match(app.sha256, /^[a-f0-9]{64}$/);
  assert.ok(readFileSync(join(root, 'releases/index.html'), 'utf8').includes(app.url), 'Release page links the archived APK');
}
assert.ok(!readdirSync(root, { recursive: true }).some(path => /\.(apk|env)$/.test(path)), 'No APKs or secrets in website assets');

const pedal = readFileSync(join(root, 'pedal/index.html'), 'utf8');
assert.ok(/No prototype yet/.test(pedal) && /concept/i.test(pedal), 'Pedal is labelled as a concept');
assert.ok(!pedal.includes('/releases/download/'), 'No pedal download');
const home = readFileSync(join(root, 'index.html'), 'utf8');
for (const hook of ['data-particles', 'data-phone', 'data-pedal-lab', 'data-morph-switch']) assert.ok(home.includes(hook), `Home: ${hook}`);
assert.ok(readFileSync(join(root, 'haste/index.html'), 'utf8').includes('id="support"'), 'Haste support section (App Store support URL)');

console.log(`PASS: ${files.length} pages, ${refs} local references, ${scripts.length} scripts with resolved imports, Haste release data.`);
