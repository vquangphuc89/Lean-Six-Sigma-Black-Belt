import fs from 'fs';

const targetFiles = [
  'sources/02. Breakthrough Vision/06. Leverage Principle/08.Development of Breakthrough Power - Part A.html',
  'sources/02. Breakthrough Vision/08. Performance Breakthrough/04.Problem Solving Focus of the DMAIC Method - Part A.html',
  'sources/03. Business Principles/03. Success Factors/08.Focusing Application Projects on Business Goals.html',
  'sources/03. Business Principles/06. Underpinning Economics/04.Historical Belief about Product Quality and Costs.html',
  'sources/04. Process Management/04. Establishing Baselines/16.Conversion of Probabilities to the Sigma Scale.html',
  'sources/04. Process Management/05. Performance Benchmarks/05.Construction of a Sigma-Based Benchmarking Chart.html',
  'sources/04. Process Management/05. Performance Benchmarks/11.Constructing a Metrics Conversion Table.html',
  'sources/05. Project Application/01. Value Creation/01.Recognize Value Needs.html',
  'sources/05. Project Application/01. Value Creation/02.Define Value Opportunities.html',
  'sources/05. Project Application/01. Value Creation/03.Measure Value Conditions.html',
  'sources/05. Project Application/01. Value Creation/09.Describing the Essence of Value Creation.html',
  'sources/05. Project Application/04. DFSS Principles/02.Practical Applications of the DFSS Methodology - Part A.html',
  'sources/05. Project Application/04. DFSS Principles/04.Primary Domains and Aims of DFSS.html'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace specific math expressions
  content = content.replace(/\$Y = f\(X\) \+ e\$/g, '<i>Y = f(X) + e</i>');
  content = content.replace(/\$Y\s*=\s*f\(X\)\$/g, '<i>Y = f(X)</i>');
  content = content.replace(/\$USL = 10 phút\$/g, 'USL = 10 phút');
  content = content.replace(/\$Gap = 0\$/g, 'Gap = 0');
  content = content.replace(/\$Gap = \|Ought - Is\|\$/g, 'Gap = |Ought - Is|');
  content = content.replace(/\$DPU\$/g, '<i>DPU</i>');
  content = content.replace(/\$DPMO\$/g, '<i>DPMO</i>');
  content = content.replace(/\$Yield\$/g, '<i>Yield</i>');
  content = content.replace(/\$Z\$/g, '<i>Z</i>');
  content = content.replace(/\$Z_\{ST\}\$/g, '<i>Z</i><sub>ST</sub>');
  content = content.replace(/\$Z_\{LT\}\$/g, '<i>Z</i><sub>LT</sub>');
  content = content.replace(/\$P\(0\) = e\^\{-DPU\}\$/g, '<i>P(0) = e<sup>-DPU</sup></i>');
  content = content.replace(/\$Z_\{ST\} = &Phi;\^\{-1\}\(e\^\{-DPU\}\) \+ 1\.50\$/g, '<i>Z</i><sub>ST</sub> = &Phi;<sup>-1</sup>(<i>e</i><sup>-DPU</sup>) + 1.50');
  content = content.replace(/\$Gap_X = \|X_\{goal\} - X_\{baseline\}\|\$/g, 'Gap<sub>X</sub> = |X<sub>goal</sub> - X<sub>baseline</sub>|');
  content = content.replace(/\$X_\{is\} = 08:30\$/g, 'X<sub>is</sub> = 08:30');
  content = content.replace(/\$X_\{ought\} = 06:00\$/g, 'X<sub>ought</sub> = 06:00');
  content = content.replace(/\$LSL_\{CTQ\}\$/g, 'LSL<sub>CTQ</sub>');
  content = content.replace(/\$LSL_Y\$/g, 'LSL<sub>Y</sub>');
  content = content.replace(/\$USL_Y\$/g, 'USL<sub>Y</sub>');
  content = content.replace(/\$C_1, C_2, &hellip;, C_N\$/g, 'C<sub>1</sub>, C<sub>2</sub>, &hellip;, C<sub>N</sub>');
  content = content.replace(/\$C_1 &hellip; C_N\$/g, 'C<sub>1</sub> &hellip; C<sub>N</sub>');
  content = content.replace(/\$X_1, X_2 &hellip; X_N\$/g, 'X<sub>1</sub>, X<sub>2</sub> &hellip; X<sub>N</sub>');
  content = content.replace(/\$C_\{is\}\$/g, 'C<sub>is</sub>');
  content = content.replace(/\$C_\{ought\}\$/g, 'C<sub>ought</sub>');
  content = content.replace(/\$w_1 = 0\.50\$/g, 'w<sub>1</sub> = 0.50');
  content = content.replace(/\$([YXZ])\$/g, '<i>$1</i>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated math notation in: ${file}`);
  }
});
