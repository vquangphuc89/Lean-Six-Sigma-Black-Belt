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
const latexCmdRegex = /\\(vec|text|alpha|beta|gamma|delta|Delta|sum|prod|int|frac|times|le|ge|cong|approx|quad|qquad|sigma|mu|equiv|cdot|infty|sqrt|pm)(?![a-zA-Z])/g;

let count = 0;
let remaining = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace \Delta before anything else without \b since \w includes _
  content = content.replace(/\\Delta(?![a-zA-Z])/g, '&Delta;');
  content = content.replace(/\\delta(?![a-zA-Z])/g, '&delta;');
  content = content.replace(/\\sigma(?![a-zA-Z])/g, '&sigma;');
  content = content.replace(/\\mu(?![a-zA-Z])/g, '&mu;');
  content = content.replace(/\\alpha(?![a-zA-Z])/g, '&alpha;');
  content = content.replace(/\\beta(?![a-zA-Z])/g, '&beta;');
  content = content.replace(/\\gamma(?![a-zA-Z])/g, '&gamma;');
  content = content.replace(/\\pm(?![a-zA-Z])/g, '&plusmn;');
  content = content.replace(/\\ge(?![a-zA-Z])/g, '&ge;');
  content = content.replace(/\\le(?![a-zA-Z])/g, '&le;');
  content = content.replace(/\\times(?![a-zA-Z])/g, '&times;');
  content = content.replace(/\\cdot(?![a-zA-Z])/g, '&sdot;');
  content = content.replace(/\\approx(?![a-zA-Z])/g, '&asymp;');
  content = content.replace(/\\cong(?![a-zA-Z])/g, '&cong;');
  content = content.replace(/\\equiv(?![a-zA-Z])/g, '&equiv;');
  content = content.replace(/\\propto(?![a-zA-Z])/g, '&prop;');
  content = content.replace(/\\sum(?![a-zA-Z])/g, '&sum;');
  content = content.replace(/\\prod(?![a-zA-Z])/g, '&prod;');
  content = content.replace(/\\quad(?![a-zA-Z])/g, '&nbsp;&nbsp;');
  content = content.replace(/\\qquad(?![a-zA-Z])/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  content = content.replace(/\\in(?![a-zA-Z])/g, '&isin;');
  content = content.replace(/\\to(?![a-zA-Z])|\\rightarrow(?![a-zA-Z])/g, '&rarr;');
  content = content.replace(/\\infty(?![a-zA-Z])/g, '&infin;');
  content = content.replace(/\\\$/g, '$');
  content = content.replace(/\\_/g, '_');

  if (content !== original) {
    count++;
    fs.writeFileSync(file, content, 'utf8');
  }

  const rem = content.match(latexCmdRegex);
  if (rem) {
    remaining.push({ file, rem: [...new Set(rem)] });
  }
}

console.log(`Updated ${count} files.`);
console.log(`Files with any remaining LaTeX commands: ${remaining.length}`);
if (remaining.length > 0) {
  console.log(remaining);
}
