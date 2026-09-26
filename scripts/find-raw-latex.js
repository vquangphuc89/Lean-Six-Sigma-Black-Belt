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
const latexCmdRegex = /\\(vec|text|alpha|beta|gamma|delta|Delta|sum|prod|int|frac|times|le|ge|cong|approx|quad|qquad|sigma|mu|equiv|cdot|infty|sqrt|pm)\b/g;

let detailedList = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let fileMatches = [];
  
  lines.forEach((line, idx) => {
    // Exclude script blocks or style blocks if any
    const m = line.match(latexCmdRegex);
    if (m) {
      fileMatches.push({
        lineNum: idx + 1,
        matches: [...new Set(m)],
        content: line.trim()
      });
    }
  });

  if (fileMatches.length > 0) {
    detailedList.push({
      file,
      totalCount: fileMatches.reduce((acc, x) => acc + x.matches.length, 0),
      items: fileMatches
    });
  }
}

console.log(`Total files with raw LaTeX: ${detailedList.length}`);
fs.writeFileSync('scripts/latex-report.json', JSON.stringify(detailedList, null, 2), 'utf8');

detailedList.forEach((f, i) => {
  console.log(`${i+1}. ${f.file} (${f.items.length} lines):`);
  f.items.slice(0, 3).forEach(it => {
    console.log(`   L${it.lineNum}: [${it.matches.join(', ')}] ${it.content.slice(0, 90)}...`);
  });
});
