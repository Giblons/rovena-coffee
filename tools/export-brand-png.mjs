import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, '../public/brand');

const exports = [
  { svg: 'logo-circular-white.svg', png: 'logo-circular-white.png', width: 800 },
  { svg: 'logo-bronze-on-black.svg', png: 'logo-bronze-on-black.png', width: 800 },
  { svg: 'logo-on-cream.svg', png: 'logo-on-cream.png', width: 840 },
  { svg: 'business-card.svg', png: 'business-card.png', width: 1280 },
];

for (const item of exports) {
  const svg = readFileSync(join(brandDir, item.svg), 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: item.width } });
  const pngData = resvg.render();
  writeFileSync(join(brandDir, item.png), pngData.asPng());
  console.log(`Wrote ${item.png}`);
}

// Favicon from circular logo
const faviconSvg = readFileSync(join(brandDir, 'logo-circular-white.svg'), 'utf8');
const faviconResvg = new Resvg(faviconSvg, { fitTo: { mode: 'width', value: 64 } });
writeFileSync(join(__dirname, '../public/favicon.png'), faviconResvg.render().asPng());
console.log('Wrote favicon.png');
