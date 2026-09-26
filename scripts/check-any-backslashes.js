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
let backslashMatches = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Remove <style>...</style> and <script>...</script> before checking
  const bodyOnly = content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  const matches = bodyOnly.match(/\\[a-zA-Z]{2,}/g);
  if (matches) {
    const uniq = [...new Set(matches)];
    backslashMatches.push({ file, count: matches.length, tags: uniq });
  }
}

console.log(`Files with any backslash words in HTML body: ${backslashMatches.length}`);
if (backslashMatches.length > 0) {
  console.log(backslashMatches);
}
