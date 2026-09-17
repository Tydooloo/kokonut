import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve('dist');
const files = readdirSync(root, {recursive:true}).filter(file=>file.endsWith('.html'));
let count=0;
for(const file of files){
  const html=readFileSync(join(root,file),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one primary heading`);
  assert.match(html, /name="viewport"/, `${file}: mobile viewport`);
  assert.match(html, /<title>[^<]+<\/title>/, `${file}: page title`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size, ids.length,`${file}: duplicate IDs`);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const ref=match[1];
    if(/^(https?:|data:|mailto:)/.test(ref)) continue;
    const [path,anchor]=ref.split('#');
    const target = path ? join(root,path.endsWith('/')?path+'index.html':path) : join(root,file);
    assert.ok(existsSync(target),`${file}: missing ${ref}`);
    if(anchor&&target.endsWith('.html')) assert.ok(readFileSync(target,'utf8').includes(`id="${anchor}"`),`${file}: missing anchor ${ref}`);
    count++;
  }
}
const css=readFileSync(join(root,'styles.css'),'utf8');
assert.ok(!css.includes('@import'), 'Fonts must be local');
for(const match of css.matchAll(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g)) assert.ok(existsSync(join(root,match[1])),`Missing CSS asset ${match[1]}`);
const manifest=JSON.parse(readFileSync(join(root,'releases/manifest.json'),'utf8'));
assert.equal(manifest.releases.length,3);
for(const app of manifest.releases){
  const url=new URL(app.url);
  assert.equal(url.origin,'https://github.com');
  assert.ok(url.pathname.startsWith(`/Tydooloo/kokonut/releases/download/${manifest.tag}/`));
  assert.match(app.sha256,/^[a-f0-9]{64}$/);
  assert.ok(app.bytes>0&&app.minSdk===24);
  for(const file of ['index.html',`${app.id}/index.html`,'releases/index.html']) assert.ok(readFileSync(join(root,file),'utf8').includes(app.url),`${file}: missing ${app.name} download`);
}
assert.ok(!readdirSync(root,{recursive:true}).some(path=>/\.(apk|env)$/.test(path)), 'APKs and secrets stay out of website assets');
console.log(`PASS: ${files.length} HTML pages, ${count} local references, local fonts and all three release records.`);
