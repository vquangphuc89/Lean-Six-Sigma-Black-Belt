import fs from 'fs';

function fixFile(file, replacers) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [search, replace] of replacers) {
    if (typeof search === 'string') {
      content = content.replaceAll(search, replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned: ${file}`);
  } else {
    console.log(`No change: ${file}`);
  }
}

// 1. 16.Conversion of Probabilities to the Sigma Scale.html
fixFile('sources/04. Process Management/04. Establishing Baselines/16.Conversion of Probabilities to the Sigma Scale.html', [
  ['$Z_{ST} = &Phi;^{-1}(P(0)) + 1.50 = &Phi;^{-1}(e^{-DPU}) + 1.50$', '<i>Z</i><sub>ST</sub> = &Phi;<sup>-1</sup>(<i>P</i>(0)) + 1.50 = &Phi;<sup>-1</sup>(<i>e</i><sup>-<i>DPU</i></sup>) + 1.50'],
  ['$DPU &harr; Yield &harr; DPMO &harr; Z_{ST} &harr; Z_{LT} &harr; C_{pk}$', '<i>DPU</i> &harr; Yield &harr; <i>DPMO</i> &harr; <i>Z</i><sub>ST</sub> &harr; <i>Z</i><sub>LT</sub> &harr; <i>C<sub>pk</sub></i>']
]);

// 2. 02.Define Value Opportunities.html
fixFile('sources/05. Project Application/01. Value Creation/02.Define Value Opportunities.html', [
  ['$Opportunity = f(Condition_1, Condition_2, &hellip;, Condition_N)$', '<i>Opportunity</i> = <i>f</i>(Condition<sub>1</sub>, Condition<sub>2</sub>, &hellip;, Condition<sub>N</sub>)']
]);

// 3. 03.Measure Value Conditions.html
fixFile('sources/05. Project Application/01. Value Creation/03.Measure Value Conditions.html', [
  ['$&delta;_{X1}$', '&delta;<sub>X1</sub>'],
  ['$X_1 &hellip; X_K$', '<i>X</i><sub>1</sub> &hellip; <i>X<sub>K</sub></i>'],
  ['$&mu;_{baseline}$', '&mu;<sub>baseline</sub>'],
  ['$&sigma;_{baseline}$', '&sigma;<sub>baseline</sub>'],
  ['$&delta;_X = |X_{entitlement} - X_{baseline}|$', '&delta;<sub>X</sub> = |<i>X</i><sub>entitlement</sub> &minus; <i>X</i><sub>baseline</sub>|']
]);

// 4. 09.Describing the Essence of Value Creation.html
fixFile('sources/05. Project Application/01. Value Creation/09.Describing the Essence of Value Creation.html', [
  ['$R &rarr; D &rarr; M &rarr; A &rarr; I &rarr; C &rarr; S &rarr; I$', '<i>R</i> &rarr; <i>D</i> &rarr; <i>M</i> &rarr; <i>A</i> &rarr; <i>I</i> &rarr; <i>C</i> &rarr; <i>S</i> &rarr; <i>I</i>']
]);

// 5. 02.Practical Applications of the DFSS Methodology - Part A.html
fixFile('sources/05. Project Application/04. DFSS Principles/02.Practical Applications of the DFSS Methodology - Part A.html', [
  [/\(\$246\.5\^circ\s*\\?t?ext\{\s*C\s*\}\s*p?m\s*4\.5\^circ\s*\\?t?ext\{\s*C\s*\}\$\)/g, '(246.5&deg;C &plusmn; 4.5&deg;C)'],
  [/\$246\.5\^circ[\s\S]*?4\.5\^circ[\s\S]*?\$/g, '246.5&deg;C &plusmn; 4.5&deg;C'],
  [/\$125\s*\\?t?ext\{\s*J\s*\}\s*p?m\s*8\s*\\?t?ext\{\s*J\s*\}\$/g, '125 J &plusmn; 8 J'],
  [/\$125[\s\S]*?8[\s\S]*?J\$/g, '125 J &plusmn; 8 J']
]);

// 6. 10.Key Responsibilities of a Six Sigma Black Belt.html
fixFile('sources/05. Project Application/07. Roles/10.Key Responsibilities of a Six Sigma Black Belt.html', [
  ['\\1,050,000 + \\240,000 = $1,290,000$', '$1,050,000 + $240,000 = $1,290,000']
]);

// 7. 14.Primary Characteristics of a Black Belt - Part B.html
fixFile('sources/05. Project Application/07. Roles/14.Primary Characteristics of a Black Belt - Part B.html', [
  ['từ $0.8$ lên 1.67+', 'từ 0.8 lên 1.67+'],
  ['từ $0.1$ (đổ lỗi cho hoàn cảnh) đến $1.0$', 'từ 0.1 (đổ lỗi cho hoàn cảnh) đến 1.0']
]);

// 8. 15.Primary Characteristics of a Black Belt - Part C.html
fixFile('sources/05. Project Application/07. Roles/15.Primary Characteristics of a Black Belt - Part C.html', [
  ['đạt $1.0$ nếu giải pháp', 'đạt 1.0 nếu giải pháp']
]);

// 9. 18.Nature of Purpose of Six Sigma Green Belts.html
fixFile('sources/05. Project Application/07. Roles/18.Nature of Purpose of Six Sigma Green Belts.html', [
  ['từ $0.0$ (rất gắn kết) đến $0.8$', 'từ 0.0 (rất gắn kết) đến 0.8']
]);

// 10. 25.Understanding the Scope of Six Sigma White Belt Projects.html
fixFile('sources/05. Project Application/07. Roles/25.Understanding the Scope of Six Sigma White Belt Projects.html', [
  ['Kaizen (10k - 25k$)', 'Kaizen ($10k - $25k)']
]);
