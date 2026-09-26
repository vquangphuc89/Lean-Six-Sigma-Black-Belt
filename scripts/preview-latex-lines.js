import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scripts/latex-report.json', 'utf8'));

console.log(`=== ANALYZING ALL ${report.length} FILES WITH RAW LATEX ===`);

report.forEach((item, idx) => {
  console.log(`\n--------------------------------------------------`);
  console.log(`[${idx + 1}] ${item.file}`);
  item.items.forEach(it => {
    console.log(`  Line ${it.lineNum}: ${it.content}`);
  });
});
