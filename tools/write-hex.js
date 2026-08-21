const fs = require('fs');
const path = require('path');
const target = process.argv[2];
const mode = process.argv[3];
const hex = process.argv[4] || '';
const dir = path.dirname(target);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const content = Buffer.from(hex, 'hex').toString('utf8');
if (mode === 'w') {
  fs.writeFileSync(target, content, 'utf8');
} else {
  fs.appendFileSync(target, content, 'utf8');
}
console.log((mode === 'w' ? 'Wrote ' : 'Appended ') + target);
