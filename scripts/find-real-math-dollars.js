import fs from 'fs';
import path from 'path';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getHtmlFiles('sources');
const mathItems = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // If line has onclick or button, skip if it's just currency calculations
    const cleanL = l.replace(/onclick="[^"]*"/g, '');
    const matches = cleanL.match(/\$([^$]+)\$/g);
    if (matches) {
      matches.forEach(m => {
        const inner = m.slice(1, -1).trim();
        // check if this is pure currency span like "$100 to $" or "$200,000 &bull;"
        if (/^[0-9,.]+\s*(to|đến|&ndash;|-|&bull;|\+|\*|\/)/i.test(inner)) return;
        if (/(to|đến|&ndash;|-|&bull;)\s*[0-9,.]*$/i.test(inner)) return;
        if (/^\s*(USD|triệu|tỷ|k|M|B)\s*$/i.test(inner)) return;
        if (/^\s*$/.test(inner)) return;

        mathItems.push({ file, line: idx + 1, match: m, inner, lineText: l.trim() });
      });
    }
  });
}

console.log(`Found ${mathItems.length} items:`);
mathItems.forEach(item => {
  console.log(`${item.file}:${item.line} -> ${item.match} | in: ${item.lineText.substring(0, 100)}`);
});
