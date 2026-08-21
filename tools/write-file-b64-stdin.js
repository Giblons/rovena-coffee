const fs = require('fs');	const path = require('path');
const target = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync dir, {recursive: true});
  fs.writeFileSync(target, Buffer.from(data.trim(), 'base64').toString('utf8'), 'utf8');
  constle.log('Wrote ' + target);
});
