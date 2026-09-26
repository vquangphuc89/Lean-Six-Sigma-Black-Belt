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
const suspects = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Math wrappers: $...$ where it wraps math symbols, formulas, or numbers like $0.8$
    const matches = l.match(/\$([^$]+)\$/g);
    if (matches) {
      matches.forEach(m => {
        const inner = m.slice(1, -1).trim();
        // Skip common false positives between two dollar amounts like "$100 to $200" -> match is "$ to $"
        if (inner.includes('to') || inner.includes('đến') || inner.includes('&ndash;') || inner.includes('-') && !inner.includes('=')) {
          // Check if both sides are likely currency
          return;
        }
        // If inner is just a number like "0.8" or "1.0" or "1,290,000"
        if (/^[0-9.,]+$/.test(inner)) {
          suspects.push({ file, line: idx + 1, match: m, inner, fullLine: l.trim() });
          return;
        }
        // If inner has math characters
        if (/[=_\\^&]/.test(inner) || /^[a-zA-Z]$/.test(inner) || /^[a-zA-Z]_[0-9a-zA-Z]+$/.test(inner)) {
          suspects.push({ file, line: idx + 1, match: m, inner, fullLine: l.trim() });
        }
      });
    }
  });
}

console.log(`Found ${suspects.length} suspect math wrappers:`);
suspects.forEach(s => {
  console.log(`${s.file}:${s.line} [${s.match}] -> ${s.fullLine.substring(0, 100)}`);
});
