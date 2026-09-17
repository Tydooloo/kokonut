import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {footer} from './layout.mjs';
for(const path of readdirSync('dist',{recursive:true}).filter(path=>path.endsWith('.html'))) {
  const source=readFileSync(`dist/${path}`,'utf8');
  const markup=footer({home:path==='index.html',compact:/^(privacy|releases|404)/.test(path)});
  const updated=/<footer\b[^]*?<\/footer>/.test(source)
    ? source.replace(/<footer\b[^]*?<\/footer>/,markup)
    : source.replace('</body>',markup+'</body>');
  writeFileSync(`dist/${path}`,updated);
}
console.log('Rendered complete footer navigation on every HTML page.');
