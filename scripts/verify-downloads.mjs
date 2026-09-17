import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const {releases}=JSON.parse(readFileSync('dist/releases/manifest.json','utf8'));
for(const app of releases){
  // No authentication: these checks use the same public links as site visitors.
  const head=await fetch(app.url,{method:'HEAD'});
  assert.equal(head.status,200,`${app.name}: public download status`);
  assert.equal(Number(head.headers.get('content-length')),app.bytes,`${app.name}: download size`);
  assert.match(head.headers.get('content-disposition')||'',/attachment/i,`${app.name}: attachment response`);
  const response=await fetch(app.url,{headers:{Range:'bytes=0-3'}});
  assert.equal(response.status,206,`${app.name}: ranged APK response`);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.toString('hex'),'504b0304',`${app.name}: APK ZIP signature`);
  console.log(`PASS: ${app.name}, public APK attachment, ${app.bytes} bytes, valid APK header.`);
}
