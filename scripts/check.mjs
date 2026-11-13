// Static checks for the built site: pages, links, anchors, assets, scripts and the hooks each scene needs.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { pages } from './layout.mjs';

const root = resolve('dist');
const read = file => readFileSync(join(root, file), 'utf8');
const files = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
let refs = 0;
for (const file of files) {
  const html = read(file);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: exactly one h1`);
  assert.match(html, /name="viewport"/, `${file}: mobile viewport`);
  assert.match(html, /<title>[^<]+<\/title>/, `${file}: title`);
  assert.match(html, /<main\b[^>]*id="main"/, `${file}: skip-link target`);
  assert.ok(html.match(/<footer\b[^]*?<\/footer>/), `${file}: footer`);
  for (const [, path] of pages) assert.ok(html.includes(`href="${path}"`), `${file}: no link to ${path}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), `${file}: inline scripts are blocked by the CSP`);
  assert.ok(!/(src|href)="https?:\/\/(?!kokonut\.cc)[^"]*\.(js|css|woff2?)"/.test(html), `${file}: third-party scripts, styles or fonts`);
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

// Stylesheets: local fonts only, and every referenced file exists.
const styles = readdirSync(join(root, 'css')).filter(file => file.endsWith('.css'));
for (const file of styles) {
  const css = read(`css/${file}`);
  assert.ok(!css.includes('@import'), `css/${file}: fonts and styles must be local`);
  for (const match of css.matchAll(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g)) assert.ok(existsSync(join(root, match[1])), `css/${file}: missing ${match[1]}`);
}

// Every relative module import must resolve, and nothing may load from a CDN at runtime.
const scripts = readdirSync(join(root, 'js')).filter(file => file.endsWith('.js'));
for (const file of scripts) {
  const source = read(`js/${file}`);
  for (const match of source.matchAll(/(?:from\s+|import\(|^import\s+)\s*'([^']+)'/gm)) {
    assert.ok(match[1].startsWith('.'), `js/${file}: bare import ${match[1]}`);
    assert.ok(existsSync(resolve(root, 'js', match[1])), `js/${file}: missing import ${match[1]}`);
  }
  for (const match of source.matchAll(/['"`](\/assets\/[^'"`$]+)['"`]/g)) assert.ok(existsSync(join(root, match[1])), `js/${file}: missing asset ${match[1]}`);
  assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(source), `js/${file}: external URL`);
}
for (const id of ['capture', 'journal', 'progress']) assert.ok(existsSync(join(root, `assets/haste/screen-${id}.webp`)), `Haste ${id} screen`);
assert.ok(!readdirSync(root, { recursive: true }).some(path => /\.(apk|env)$/.test(path)), 'No APKs or secrets in website assets');

// Each world has its stylesheet and script, and the hooks its scene looks for.
const hooks = {
  'index.html': ['hub', ['data-hub-stage', 'data-slide="haste"', 'data-slide="burble"', 'data-slide="cairn"', 'data-tab']],
  'haste/index.html': ['haste', ['data-haste-stage', 'data-anchor', 'data-story', 'data-demo', 'data-meals', 'apps.apple.com', 'play.google.com']],
  'burble/index.html': ['burble', ['data-sheets', 'data-filing', 'data-stack', 'data-file-demo', 'data-ink', 'burble.kokonut.cc', 'apps.apple.com', 'play.google.com']],
  'cairn/index.html': ['cairn', ['data-pedal-stage', 'Not just', 'mailto:']],
  'aaron/index.html': ['aaron', ['data-ring-stage', 'data-portrait', 'data-cover="haste"', 'data-cover="burble"', 'data-cover="cairn"', 'University of Auckland']],
};
for (const [file, [world, marks]] of Object.entries(hooks)) {
  const html = read(file);
  assert.ok(html.includes(`data-world="${world}"`) && existsSync(join(root, `css/${world}.css`)) && existsSync(join(root, `js/${world}.js`)), `${file}: ${world} stylesheet and script`);
  for (const mark of marks) assert.ok(html.includes(mark), `${file}: ${mark}`);
}
const portrait = read('aaron/index.html').match(/<img class="a-portrait"[^>]* src="([^"]+)"/)[1];
assert.ok(existsSync(join(root, portrait)), `Portfolio portrait ${portrait}`);
assert.ok(read('haste/support/index.html').includes('admin@kokonut.cc'), 'Haste support page has the support email (App Store support URL)');
console.log(`PASS: ${files.length} pages, ${refs} local references, ${styles.length} stylesheets, ${scripts.length} scripts with resolved imports.`);
