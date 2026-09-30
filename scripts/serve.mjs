import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
// Exercise the production policy locally, including textures embedded in GLB files.
const headerText = await readFile(resolve(root, '_headers'), 'utf8');
const defaultBlock = headerText.match(/^\/\*\r?\n((?:[ \t]+[^\r\n]+\r?\n?)*)/)?.[1] || '';
const defaultHeaders = Object.fromEntries(defaultBlock.trim().split(/\r?\n/).filter(Boolean).map(line => {
  const colon = line.indexOf(':');
  return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
}));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.glb': 'model/gltf-binary' };
createServer(async (request, response) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const data = await readFile(path);
    response.writeHead(200, { ...defaultHeaders, 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404, { ...defaultHeaders, 'Content-Type': 'text/html' }).end(await readFile(resolve(root, '404.html')).catch(() => 'Not found')); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://localhost:4173'));
