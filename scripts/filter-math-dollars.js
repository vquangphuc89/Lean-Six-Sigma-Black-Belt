import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/dollar-math-full.json', 'utf8'));

// Filter to find actual math wrappers:
// inner has variables, greek letters, formulas, or standalone numbers wrapped in $
const mathList = data.filter(item => {
  const inner = item.inner;
  // If it's pure currency context like "$100k -> Prototype $500" or "$160,000 / $20,000"
  if (/^[0-9,.]+\s*(USD|triệu|tỷ|k|M|B)?$/i.test(inner)) {
    // A standalone number wrapped in $ e.g. $0.8$ or $1.0$ or $1,290,000$
    return true;
  }
  if (/[=_^\\&<>]/.test(inner)) return true;
  if (/^[a-zA-Z]$/.test(inner)) return true;
  if (/^[a-zA-Z]_[0-9a-zA-Z]+$/.test(inner)) return true;
  return false;
});

// Let's filter out false positives from currency like "$100 -> Prototype $"
const finalMath = mathList.filter(item => {
  const inner = item.inner;
  // check if it's like "100 -> Prototype"
  if (/->|&rarr;/.test(inner)) return false;
  // check if inner has "USD" or "triệu"
  if (/USD|triệu|tỷ|đồng|VND/i.test(inner)) return false;
  // check if it's an arithmetic equation between currency numbers in quiz feedback e.g. "350,000 = "
  if (/^[0-9,.]+\s*[\*\+\-\/=]\s*$/i.test(inner)) return false;
  if (/^[\*\+\-\/=]\s*[0-9,.]+$/i.test(inner)) return false;
  return true;
});

console.log(`Filtered down to ${finalMath.length} definite math items:`);
finalMath.forEach(x => {
  console.log(`${x.file}:${x.line} [${x.match}] -> ${x.context}`);
});
