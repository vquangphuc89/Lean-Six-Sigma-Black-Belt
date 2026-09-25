import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDirArg = process.argv[2] || 'sources';
const sourcesDir = path.resolve(rootDir, targetDirArg);

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

function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Extracts all <button ...> tags properly without breaking on `>` inside quotes
 */
function extractButtonTags(html) {
  const buttons = [];
  let idx = 0;
  const lower = html.toLowerCase();

  while ((idx = lower.indexOf('<button', idx)) !== -1) {
    const startIdx = idx;
    idx += 7; // skip '<button'

    let inDbl = false;
    let inSgl = false;
    let tagEnd = -1;

    for (let i = idx; i < html.length; i++) {
      const ch = html[i];
      if (ch === '"' && !inSgl) {
        inDbl = !inDbl;
      } else if (ch === "'" && !inDbl) {
        inSgl = !inSgl;
      } else if (ch === '>' && !inDbl && !inSgl) {
        tagEnd = i;
        break;
      }
    }

    if (tagEnd === -1) {
      // unclosed tag
      break;
    }

    const tag = html.slice(startIdx, tagEnd + 1);
    // Find closing </button>
    const closeBtnIdx = lower.indexOf('</button>', tagEnd);
    let fullHtml = tag;
    if (closeBtnIdx !== -1) {
      fullHtml = html.slice(startIdx, closeBtnIdx + 9);
      idx = closeBtnIdx + 9;
    } else {
      idx = tagEnd + 1;
    }

    buttons.push({
      startIdx,
      tag,
      fullHtml
    });
  }

  return buttons;
}

/**
 * Accurately parses an attribute from tag
 */
function getAttribute(tag, attrName) {
  const regex = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
  const m = tag.match(regex);
  if (m) {
    return m[1] !== undefined ? m[1] : m[2];
  }
  return null;
}

const files = getHtmlFiles(sourcesDir);
console.log(`Checking ${files.length} HTML files...`);

const brokenFiles = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(sourcesDir, file);

  const buttonTags = extractButtonTags(content);
  const quizButtons = buttonTags.filter(b => b.tag.includes('quiz-btn') || b.tag.includes('checkQuiz'));

  const fileBroken = [];

  for (const b of quizButtons) {
    // 1. Check if onclick attribute exists
    const onclickValue = getAttribute(b.tag, 'onclick');
    if (!onclickValue) {
      fileBroken.push({
        type: 'MISSING_ONCLICK',
        tag: b.tag
      });
      continue;
    }

    // 2. Check if onclick has severed double quotes or malformed structure
    // Notice: getAttribute(b.tag, 'onclick') gets what's between the first pair of quotes!
    // If the HTML was: onclick="checkQuiz(this, true, 'fb', 'He said "Hello"')">
    // Then getAttribute will get: `checkQuiz(this, true, 'fb', 'He said `
    // which does NOT end with a valid function call syntax like `)`!
    const trimmed = onclickValue.trim();
    if (!trimmed.endsWith(')')) {
      fileBroken.push({
        type: 'SEVERED_ONCLICK_CODE',
        detail: 'Lệnh onclick bị đứt đoạn (thường do chứa dấu ngoặc kép đôi " bên trong)',
        extractedCode: onclickValue,
        tag: b.tag
      });
      continue;
    }

    // 3. Test if the JavaScript inside onclick is syntactically valid
    const decodedCode = decodeHtmlEntities(onclickValue);
    try {
      new vm.Script(`function testOnclick() { ${decodedCode}; }`);
    } catch (err) {
      fileBroken.push({
        type: 'JS_SYNTAX_ERROR',
        detail: err.message,
        extractedCode: onclickValue,
        tag: b.tag
      });
    }
  }

  // Also check if any card has buttons without quiz-btn or other weirdness
  if (fileBroken.length > 0) {
    brokenFiles.push({
      file: relPath,
      brokenCount: fileBroken.length,
      errors: fileBroken
    });
  }
}

fs.writeFileSync(
  path.join(__dirname, 'accurate_broken_report.json'),
  JSON.stringify(brokenFiles, null, 2),
  'utf8'
);

console.log(`\n================ KẾT QUẢ CHÍNH XÁC ================`);
console.log(`Số file có câu hỏi trắc nghiệm BỊ LỖI KHÔNG CLICK ĐƯỢC: ${brokenFiles.length} / ${files.length}`);

let totalErrors = 0;
brokenFiles.forEach((f, idx) => {
  totalErrors += f.brokenCount;
  console.log(`\n[${idx + 1}] ${f.file} (${f.brokenCount} lỗi):`);
  f.errors.forEach(e => {
    console.log(`   ❌ [${e.type}] ${e.detail || ''}`);
    console.log(`      Code: ${e.extractedCode}`);
    console.log(`      Tag:  ${e.tag.slice(0, 140)}...`);
  });
});
console.log(`\nTổng số nút bị lỗi không bấm được: ${totalErrors}`);
