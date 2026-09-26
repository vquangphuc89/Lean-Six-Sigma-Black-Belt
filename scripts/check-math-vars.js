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
let varMath = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const bodyOnly = content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  // Look for math variables starting with a letter or symbol inside dollar signs, e.g. $Y = f(X)$, $C_{pk}$, $N = 8$, $p$-value
  const matches = bodyOnly.match(/\$([a-zA-Z&][^$]{0,60})\$/g);
  if (matches) {
    // filter out things that are actually currency or false positives
    const actualMath = matches.filter(m => {
      const inner = m.slice(1, -1).trim();
      if (/^(USD|VNĐ|VND|triệu|tỷ)/i.test(inner)) return false;
      return true;
    });
    if (actualMath.length > 0) {
      varMath.push({ file, count: actualMath.length, samples: actualMath.slice(0, 5) });
    }
  }
}

console.log(`Files with $variable$ math notation: ${varMath.length}`);
if (varMath.length > 0) {
  varMath.slice(0, 20).forEach(x => {
    console.log(` - ${x.file}: ${x.samples.join(', ')}`);
  });
}
