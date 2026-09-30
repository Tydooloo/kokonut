import {mkdir, writeFile} from 'node:fs/promises';
const version = '0.180.0';
const files = {
  'three.core.js': 'build/three.core.min.js',
  'three.module.js': 'build/three.module.min.js',
  'GLTFLoader.js': 'examples/jsm/loaders/GLTFLoader.js',
  'BufferGeometryUtils.js': 'examples/jsm/utils/BufferGeometryUtils.js',
  'RoomEnvironment.js': 'examples/jsm/environments/RoomEnvironment.js',
  LICENSE: 'LICENSE',
};
await mkdir('dist/vendor/three', {recursive: true});
await Promise.all(Object.entries(files).map(async ([name, path]) => {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/three@${version}/${path}`);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const source = (await response.text()).replaceAll("from 'three'", "from './three.module.js'")
    .replaceAll("from '../utils/BufferGeometryUtils.js'", "from './BufferGeometryUtils.js'")
    .replaceAll('./three.core.min.js', './three.core.js');
  await writeFile(`dist/vendor/three/${name}`, source);
}));
console.log(`Vendored Three.js ${version}; all browser dependencies are served locally.`);
