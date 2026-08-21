const fs = require('fs');
const path = require('path');
const target = process.argv[2];
const mode = process.argv[3];
const b64 = process.argv[4] || '';
const dir = path.dirname(target);
if (!isFsExists(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
function isFsExists(d) { return fs.existsSync(d); }
const content = Buffer.from(b64, 'base64').toString('utf8');
if (mode === 'w') {
  fs.writeFileSync(target, content, 'utf8');
  console.log('Clear & wrote ' + target);
} else {
  fs.appendFileSync(target, content, 'utf8');
  console.log('Appended to ' + target);
}
