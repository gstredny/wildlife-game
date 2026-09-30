// Refresh the explicit offline asset list after adding modules or downloading photos.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const files = folder => readdirSync(new URL(folder, root), { withFileTypes: true })
  .flatMap(entry => entry.isDirectory() ? files(`${folder}/${entry.name}`) : [`./${folder}/${entry.name}`]);
const assets = ['./', './index.html', './style.css', ...files('src'), ...files('art'),
  './voice/manifest.json', './manifest.json', ...files('icons')];
const path = new URL('sw.js', root);
const worker = readFileSync(path, 'utf8').replace(/const FILES = \[[\s\S]*?\];/,
  `const FILES = ${JSON.stringify(assets, null, 2)};`);
writeFileSync(path, worker);
console.log(`Offline list: ${assets.length} files plus recorded voice clips`);
