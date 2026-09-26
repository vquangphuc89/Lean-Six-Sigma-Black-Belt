import fs from 'fs';

const filesToClean = [
  'sources/05. Project Application/01. Value Creation/02.Define Value Opportunities.html',
  'sources/05. Project Application/01. Value Creation/03.Measure Value Conditions.html',
  'sources/05. Project Application/04. DFSS Principles/02.Practical Applications of the DFSS Methodology - Part A.html'
];

filesToClean.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/\$w_i\$/g, '<i>w<sub>i</sub></i>');
  content = content.replace(/\$&delta;_X = 2\.5\$/g, '&delta;<sub>X</sub> = 2.5');
  content = content.replace(/\$&delta;_X = 1\.4\$/g, '&delta;<sub>X</sub> = 1.4');
  content = content.replace(/\$&delta;_X\$/g, '&delta;<sub>X</sub>');
  content = content.replace(/\$X_1\$/g, '<i>X</i><sub>1</sub>');
  content = content.replace(/\$LSL_X\$/g, 'LSL<sub>X</sub>');
  content = content.replace(/\$USL_X\$/g, 'USL<sub>X</sub>');
  content = content.replace(/\$LSL_Y = 45\.0\s*\\?text\{\s*N\s*\}\$/g, 'LSL<sub>Y</sub> = 45.0 N');
  content = content.replace(/\$LSL_Y = 45\.0\s*N\$/g, 'LSL<sub>Y</sub> = 45.0 N');
  content = content.replace(/\$LSL_Y = 45\.0\t?ext\{\s*N\s*\}\$/g, 'LSL<sub>Y</sub> = 45.0 N');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned: ${file}`);
  }
});
