import { mkdirSync, copyFileSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

const repo = 'Tydooloo/kokonut';
const tag = 'android-test-2026-09-17';
const certificate = 'cd1271bd466652a7754b04b8cec6e5f4129f22a25a0d39e8e4f7e76e90538bdd';
const apps = [
  { id:'sidequest', name:'SideQuest', version:'1.0.0', packageName:'app.sidequest.sidequest', source:'../SideQuest/build/app/outputs/flutter-apk/app-debug.apk', expectedHash:'a3ffde378b9983a8b7e340988450e4dcc0986289e05eb45c5a73ad58058967f5', notes:'Connect to the internet and sign in to use groups, activities, plans and shared memories. This build is configured for hosted Firebase and Supabase services. Service availability and account flows have not been retested as part of this website release.' },
  { id:'macrova', name:'Macrova', version:'0.1.0', packageName:'com.example.macrova', source:'../Macrova/macrova/build/app/outputs/flutter-apk/app-debug.apk', expectedHash:'76c7c0e2639a65ae57babaea3daa7028f34bb3f46f1515847febc5457d684b02', notes:'Manual food logging works on-device. AI estimation and USDA lookup need a configured, reachable Macrova backend; no public backend is supplied by this download. Account features require Firebase setup. Food logs stay on this device. This development build is intended for local feature testing.' },
  { id:'revisen', name:'Revisen', version:'0.1.0', packageName:'app.revisen.revisen', source:'../Revisen/build/app/outputs/flutter-apk/app-debug.apk', expectedHash:'d984040717c0344a1cafdb9af740c42a2765d0dce9ca64e0f01d3e31fd6c016d', notes:'A reachable Revisen backend is required for accounts, course materials and practice. No public backend is supplied by this download. Ask the person running your test for their server URL and enter it in the app’s Connection settings. Installing the APK alone is not enough to use the learning workspace.' },
];
mkdirSync('artifacts/apks', {recursive:true});
mkdirSync('dist/releases', {recursive:true});
const releases = apps.map(({source,expectedHash,...app})=>{
  const file = `${app.id}-${app.version}-test.apk`;
  const target = `artifacts/apks/${file}`;
  copyFileSync(source,target);
  const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex');
  if(sha256 !== expectedHash) throw new Error(`${app.name} APK changed since inspection. Reverify before publishing.`);
  return { ...app, file, bytes:statSync(target).size, sha256, certificateSha256:certificate, versionCode:1, minSdk:24, minAndroid:'7.0', architectures:['arm64-v8a','armeabi-v7a','x86_64'], buildType:'debug', url:`https://github.com/${repo}/releases/download/${tag}/${file}` };
});
writeFileSync('dist/releases/manifest.json',JSON.stringify({ date:'2026-09-17', tag, repository:repo, releaseUrl:`https://github.com/${repo}/releases/tag/${tag}`, releases },null,2)+'\n');
console.log(JSON.stringify(releases.map(({name,bytes,sha256})=>({name,bytes,sha256}))));
