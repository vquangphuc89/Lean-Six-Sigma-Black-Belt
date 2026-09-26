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
let dollarMatches = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const bodyOnly = content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  // Look for patterns like $...$ where the content inside is math and not currency
  // Currency examples: $350k, $350,000, $50K - $60K, $10M, $2,000 USD
  const matches = bodyOnly.match(/\$([^$\n]{1,80})\$/g);
  if (matches) {
    const nonCurrency = matches.filter(m => {
      const inner = m.slice(1, -1).trim();
      // If it looks like currency: digits, commas, dots, currency suffix
      if (/^\s*\d+[\d,\.]*\s*(k|K|\$|USD|triệu|tỷ|M|B)?\s*$/i.test(inner)) return false;
      if (/^\s*\d+[\d,\.]*\s*(&ndash;|-)\s*\$?\d+[\d,\.]*\s*(k|K|\$|USD|triệu|tỷ|M|B)?\s*$/i.test(inner)) return false;
      return true;
    });
    if (nonCurrency.length > 0) {
      dollarMatches.push({ file, count: nonCurrency.length, samples: nonCurrency.slice(0, 5) });
    }
  }
}

console.log(`Files with non-currency dollar sign math wrappers: ${dollarMatches.length}`);
if (dollarMatches.length > 0) {
  console.log(dollarMatches.slice(0, 15));
}
