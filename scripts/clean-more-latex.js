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

let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Additional LaTeX symbols
  content = content.replace(/\\Phi(?![a-zA-Z])/g, '&Phi;');
  content = content.replace(/\\longleftrightarrow(?![a-zA-Z])/g, '&harr;');
  content = content.replace(/\\leftrightarrow(?![a-zA-Z])/g, '&harr;');
  content = content.replace(/\\dots(?![a-zA-Z])/g, '&hellip;');
  content = content.replace(/\\mum(?![a-zA-Z])/g, '&mu;m');
  content = content.replace(/\\circC(?![a-zA-Z])/g, '&deg;C');
  content = content.replace(/\\circ(?![a-zA-Z])/g, '&deg;');
  content = content.replace(/\\bar\{([^{}]+)\}/g, '<span style="text-decoration:overline;">$1</span>');
  content = content.replace(/\\bar\s*([a-zA-Z])/g, '<span style="text-decoration:overline;">$1</span>');
  content = content.replace(/\\ln(?![a-zA-Z])/g, 'ln');
  content = content.replace(/\\epsilon(?![a-zA-Z])/g, '&epsilon;');
  content = content.replace(/\\sim(?![a-zA-Z])/g, '~');
  content = content.replace(/\\mathbf\{([^{}]+)\}/g, '<strong>$1</strong>');
  content = content.replace(/\\widehat\{([^{}]+)\}/g, '$1&#770;');
  content = content.replace(/\\hat\{([^{}]+)\}/g, '$1&#770;');

  if (content !== original) {
    count++;
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`Cleaned additional symbols in ${count} files.`);
