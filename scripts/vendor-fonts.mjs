import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
mkdirSync('dist/assets/fonts', {recursive:true});
mkdirSync('docs/licenses', {recursive:true});
const response = await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Manrope:wght@400..800&display=swap', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
if (!response.ok) throw new Error('Font stylesheet download failed');
const css=await response.text();
const blocks=[...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(match=>match[1]);
if(blocks.length!==2) throw new Error('Expected two Latin variable font definitions');
const local=[];
for(const block of blocks){
  const family=block.match(/font-family: '([^']+)'/)[1];
  const slug=family.toLowerCase().replace(' ','-');
  const url=block.match(/url\(([^)]+)\)/)[1];
  const file=await fetch(url);
  if(!file.ok) throw new Error(`${family} download failed`);
  writeFileSync(`dist/assets/fonts/${slug}-latin.woff2`,Buffer.from(await file.arrayBuffer()));
  local.push(block.replace(url,`/assets/fonts/${slug}-latin.woff2`));
  const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${slug.replace('-','')}/OFL.txt`);
  if(!license.ok) throw new Error(`${family} license unavailable`);
  writeFileSync(`docs/licenses/${slug}-OFL.txt`,await license.text());
}
const current=readFileSync('dist/styles.css','utf8');
writeFileSync('dist/styles.css',current.replace(/^@import[^\n]*\n/,local.join('\n')+'\n'));
console.log('Saved two local variable fonts with their OFL licenses.');
