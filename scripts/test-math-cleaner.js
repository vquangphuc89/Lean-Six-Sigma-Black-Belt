import fs from 'fs';

function cleanMath(text) {
  let res = text;

  // 1. Specific LaTeX patterns in .math-formula
  // \vec{V}_{\text{Method}} = \alpha \cdot \text{Time} + \beta \cdot \text{Scope} + \gamma \cdot \text{Depth}
  // \vec{W}_{\text{WB}} = [0.80, 0.20, 0.00, 0.00] \quad | \quad \vec{W}_{\text{BB}} = [0.00, 0.20, 0.20_{\text{SPC}}, 0.60_{\text{DOE}}]
  // \text{DMAIC} \equiv \text{Define}(VOC) \rightarrow \text{Measure}(Gage\_R\&R) \rightarrow \text{Analyze}(\text{Diagnostics}) \rightarrow \text{Improve}(\text{DOE}) \rightarrow \text{Control}(\text{SPC})

  // Replace \vec{X}
  res = res.replace(/\\vec\{([A-Za-z])\}/g, '<strong>$1&#x20D7;</strong>');
  
  // Replace \text{...}
  res = res.replace(/\\text\{([^{}]+)\}/g, '$1');

  // Math Greek & symbols
  res = res.replace(/\\alpha\b/g, '&alpha;');
  res = res.replace(/\\beta\b/g, '&beta;');
  res = res.replace(/\\gamma\b/g, '&gamma;');
  res = res.replace(/\\Delta\b/g, '&Delta;');
  res = res.replace(/\\delta\b/g, '&delta;');
  res = res.replace(/\\sigma\b/g, '&sigma;');
  res = res.replace(/\\mu\b/g, '&mu;');
  res = res.replace(/\\pm\b/g, '&plusmn;');
  res = res.replace(/\\times\b/g, '&times;');
  res = res.replace(/\\cdot\b/g, '&sdot;');
  res = res.replace(/\\ge\b/g, '&ge;');
  res = res.replace(/\\le\b/g, '&le;');
  res = res.replace(/\\approx\b/g, '&asymp;');
  res = res.replace(/\\cong\b/g, '&cong;');
  res = res.replace(/\\equiv\b/g, '&equiv;');
  res = res.replace(/\\propto\b/g, '&prop;');
  res = res.replace(/\\sum\b/g, '&sum;');
  res = res.replace(/\\prod\b/g, '&prod;');
  res = res.replace(/\\quad\b/g, '&nbsp;&nbsp;');
  res = res.replace(/\\qquad\b/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  res = res.replace(/\\in\b/g, '&isin;');
  res = res.replace(/\\to\b|\\rightarrow\b/g, '&rarr;');
  res = res.replace(/\\infty\b/g, '&infin;');
  res = res.replace(/\\_/g, '_');

  // Replace subscripts and superscripts in math contexts:
  // e.g. _{Method} -> <sub>Method</sub>
  res = res.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
  res = res.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
  res = res.replace(/\^([0-9]+)/g, '<sup>$1</sup>');

  // Handle inline math like $\Delta$ or $Y_{\text{observed}}$ or $C_{pk} \ge 1.5$
  // Be careful with currency like $350k or $50,000!
  // A math block usually has letters, subscripts, Greek, or operators like = or \ge
  res = res.replace(/\$([^$]+)\$/g, (match, inner) => {
    // If it's pure currency like $350,000 or $50k or $1.0 Tỷ, don't remove dollar sign
    if (/^\s*\d+[\d,\.]*\s*(k|\$|USD|triệu|tỷ)?\s*$/i.test(inner)) {
      return match;
    }
    // Clean inner math
    let cleanedInner = inner
      .replace(/\\text\{([^{}]+)\}/g, '$1')
      .replace(/\\Delta\b/g, '&Delta;')
      .replace(/\\delta\b/g, '&delta;')
      .replace(/\\sigma\b/g, '&sigma;')
      .replace(/\\mu\b/g, '&mu;')
      .replace(/\\ge\b/g, '&ge;')
      .replace(/\\le\b/g, '&le;')
      .replace(/\\times\b/g, '&times;')
      .replace(/\\approx\b/g, '&asymp;')
      .replace(/\\pm\b/g, '&plusmn;')
      .replace(/_([a-zA-Z0-9]+)/g, '<sub>$1</sub>');
    return cleanedInner;
  });

  return res;
}

// Test on Lesson 25 and Lesson 26
const testFiles = [
  'sources/05. Project Application/07. Roles/25.Understanding the Scope of Six Sigma White Belt Projects.html',
  'sources/05. Project Application/07. Roles/26.Analytical Tools Related to the Practice of Six Sigma.html'
];

testFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const cleaned = cleanMath(content);
  console.log(`\n================ ${file} ================`);
  // Print math formula blocks
  const matches = cleaned.match(/<div class="math-formula">([\s\S]*?)<\/div>/g) || [];
  matches.forEach(m => console.log('Cleaned Formula:', m.trim()));
});
