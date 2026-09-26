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
let missingFb = [];
let totalBtns = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // find checkQuiz calls
  const regex = /checkQuiz\s*\(\s*this\s*,\s*(?:true|false)\s*,\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    totalBtns++;
    const fbId = match[1];
    if (!content.includes(`id="${fbId}"`) && !content.includes(`id='${fbId}'`)) {
      missingFb.push({ file, fbId });
    }
  }
}

console.log('Total checkQuiz buttons checked:', totalBtns);
console.log('Missing feedback elements:', missingFb.length);
if (missingFb.length > 0) {
  console.log('Detail of missing feedback elements:', missingFb);
}
