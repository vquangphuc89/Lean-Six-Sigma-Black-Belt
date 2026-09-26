import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(searchDir(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = searchDir('sources');
console.log(`=== TOÀN DIỆN KIỂM TRA ${htmlFiles.length} TỆP HTML ===\n`);

// 1. KIỂM TRA TRẮC NGHIỆM (QUIZ AUDIT)
let totalQuizzes = 0;
let quizErrors = [];
let unclickableButtons = [];

for (let file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all quiz buttons
  const btnMatches = content.match(/<button[^>]*class=["'][^"']*quiz-btn[^"']*["'][^>]*>/gi) || [];
  totalQuizzes += btnMatches.length;

  // Check each button
  for (let btn of btnMatches) {
    // Check onclick attribute
    const onclickMatch = btn.match(/onclick=["']([^"']+)["']/i);
    if (!onclickMatch) {
      unclickableButtons.push({ file, btn, reason: 'Nút không có thuộc tính onclick' });
      continue;
    }

    const onclick = onclickMatch[1];
    if (!onclick.includes('checkQuiz')) {
      unclickableButtons.push({ file, btn, reason: 'Onclick không gọi checkQuiz' });
      continue;
    }

    // Parse checkQuiz call: checkQuiz(this, true/false, 'feedbackId', ...)
    const cqMatch = onclick.match(/checkQuiz\s*\(\s*this\s*,\s*(true|false)\s*,\s*['"]([^'"]+)['"]/);
    if (!cqMatch) {
      unclickableButtons.push({ file, btn, onclick, reason: 'Cú pháp checkQuiz không hợp lệ' });
      continue;
    }

    const isCorrect = cqMatch[1];
    const fbId = cqMatch[2];

    // Check if feedback container exists in document
    const fbExists = content.includes(`id="${fbId}"`) || content.includes(`id='${fbId}'`);
    if (!fbExists) {
      quizErrors.push({ file, fbId, reason: `Không tìm thấy thẻ phản hồi id="${fbId}"` });
    }
  }
}

console.log('--- KẾT QUẢ KIỂM TRA TRẮC NGHIỆM ---');
console.log(`Tổng số nút câu hỏi trắc nghiệm đã quét: ${totalQuizzes}`);
console.log(`Số nút trắc nghiệm bị lỗi không bấm được: ${unclickableButtons.length}`);
if (unclickableButtons.length > 0) {
  console.log('Chi tiết nút lỗi:', unclickableButtons);
}
console.log(`Số lỗi thiếu thẻ feedback: ${quizErrors.length}`);
if (quizErrors.length > 0) {
  console.log('Chi tiết feedback lỗi:', quizErrors);
}

// 2. KIỂM TRA CÔNG THỨC TOÁN HỌC (MATH FORMULA AUDIT)
console.log('\n--- KẾT QUẢ KIỂM TRA CÔNG THỨC TOÁN HỌC ---');

// Check for MathJax / KaTeX inclusion in files
let mathjaxFiles = 0;
let katexFiles = 0;
for (let file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('mathjax') || content.includes('MathJax')) mathjaxFiles++;
  if (content.includes('katex') || content.includes('KaTeX')) katexFiles++;
}
console.log(`Số file nhúng MathJax: ${mathjaxFiles}`);
console.log(`Số file nhúng KaTeX: ${katexFiles}`);

// Check for raw LaTeX syntax
const latexCommands = [
  '\\\\vec', '\\\\text', '\\\\alpha', '\\\\beta', '\\\\gamma', '\\\\delta', '\\\\Delta',
  '\\\\sum', '\\\\prod', '\\\\int', '\\\\frac', '\\\\times', '\\\\le', '\\\\ge',
  '\\\\cong', '\\\\approx', '\\\\quad', '\\\\qquad', '\\\\sigma', '\\\\mu',
  '\\\\equiv', '\\\\cdot', '\\\\infty', '\\\\sqrt', '\\\\pm'
];
const rawLatexRegex = new RegExp(latexCommands.join('|'), 'g');

let filesWithRawLatex = [];
for (let file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(rawLatexRegex);
  if (matches && matches.length > 0) {
    const uniqueMatches = [...new Set(matches)];
    filesWithRawLatex.push({
      file,
      count: matches.length,
      tags: uniqueMatches
    });
  }
}

console.log(`Số file chứa mã lệnh LaTeX thô (\\vec, \\text, \\prod, \\sum...): ${filesWithRawLatex.length} / ${htmlFiles.length}`);

console.log('\nChi tiết các file chứa mã LaTeX:');
filesWithRawLatex.slice(0, 30).forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.count} occurrences] ${item.file}`);
  console.log(`   Lệnh: ${item.tags.join(', ')}`);
});
