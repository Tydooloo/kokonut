// Download the site's fonts (Latin subset) and their licenses so nothing loads from Google at runtime.
// Run once after changing fonts: node scripts/vendor-fonts.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const fonts = [
  { family: 'Geist', query: 'Geist:wght@300..800', file: 'geist', license: 'geist' },
  { family: 'Instrument Serif', query: 'Instrument+Serif:ital@1', file: 'instrument-serif-italic', license: 'instrumentserif' },
  { family: 'Instrument Serif', query: 'Instrument+Serif', file: 'instrument-serif', license: 'instrumentserif' },
  { family: 'Newsreader', query: 'Newsreader:opsz,wght@6..72,300..700', file: 'newsreader', license: 'newsreader' },
  { family: 'Newsreader', query: 'Newsreader:ital,opsz,wght@1,6..72,300..700', file: 'newsreader-italic', license: 'newsreader' },
  { family: 'Anton', query: 'Anton', file: 'anton', license: 'anton' },
];
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
mkdirSync('dist/assets/fonts', { recursive: true });
mkdirSync('docs/licenses', { recursive: true });

for (const font of fonts) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${font.query}&display=swap`, { headers: { 'User-Agent': agent } })).text();
  const block = css.match(/\/\* latin \*\/\s*@font-face\s*\{[^}]+\}/)?.[0];
  if (!block) throw new Error(`${font.family}: no Latin font file`);
  const url = block.match(/url\(([^)]+)\)/)[1];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${font.family}: download failed`);
  writeFileSync(`dist/assets/fonts/${font.file}-latin.woff2`, Buffer.from(await response.arrayBuffer()));
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${font.license}/OFL.txt`);
  if (!license.ok) throw new Error(`${font.family}: license unavailable`);
  writeFileSync(`docs/licenses/${font.file.replace('-italic', '')}-OFL.txt`, await license.text());
  console.log(`${font.family}: dist/assets/fonts/${font.file}-latin.woff2`);
}
