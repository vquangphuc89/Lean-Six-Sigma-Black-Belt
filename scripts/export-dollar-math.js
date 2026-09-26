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
const nonCurrencyMatches = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // If the line contains $ something $
    // Let's find all pairs of $...$ where the content inside is NOT starting with a number and currency
    const matches = l.match(/\$([^$]+)\$/g);
    if (matches) {
      matches.forEach(m => {
        const inner = m.slice(1, -1).trim();
        // Check if inner is pure currency range like "100 to $200" or "50k - $100k"
        if (/^[0-9.,kMB]+\s*(to|đến|&ndash;|-|\+|\/|\*|&bull;)\s*$/i.test(inner)) return;
        if (/^(to|đến|&ndash;|-|\+|\/|\*|&bull;)\s*[0-9.,kMB]+$/i.test(inner)) return;
        // Check if inside is pure currency amount like "$1,000" (which shouldn't have trailing $)
        // Or if inside is variable/formula
        nonCurrencyMatches.push({
          file,
          line: idx + 1,
          match: m,
          inner,
          context: l.trim().substring(0, 100)
        });
      });
    }
  });
}

fs.writeFileSync('scripts/dollar-math-full.json', JSON.stringify(nonCurrencyMatches, null, 2), 'utf8');
console.log(`Saved ${nonCurrencyMatches.length} items to scripts/dollar-math-full.json`);
