import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcesDir = path.join(rootDir, 'sources');

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

function sanitizeJsArg(str) {
  let s = str.trim();
  // Strip leading/trailing quotes
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  
  // Normalize escaped quotes
  s = s.replace(/\\'/g, "'").replace(/\\"/g, '"');
  
  // Replace double quotes with &quot;
  s = s.replace(/"/g, '&quot;');
  
  // Replace single quotes with typographic apostrophe ’ (U+2019)
  s = s.replace(/'/g, '’');
  
  return s.trim();
}

/**
 * Repairs all buttons calling checkQuiz in a single file
 */
function repairFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Find all <button tags that contain checkQuiz
  // We can search for `<button`
  let pos = 0;
  let repairedInFile = 0;

  while ((pos = content.indexOf('<button', pos)) !== -1) {
    // Find the end of this opening <button ...> tag
    // The opening tag ends at the `>` following the `checkQuiz(...)` call
    // Note: because `checkQuiz` call ends with `)` before `">`, find `)>` or `)" >` or `)">`
    const nextCheckQuiz = content.indexOf('checkQuiz', pos);
    // If no checkQuiz or checkQuiz belongs to another button, skip
    const nextCloseButton = content.indexOf('</button>', pos);
    if (nextCheckQuiz === -1 || (nextCloseButton !== -1 && nextCheckQuiz > nextCloseButton)) {
      pos += 7;
      continue;
    }

    // Now find the end of opening <button ...> tag
    // It is the `>` immediately followed by button text (e.g. A., B., C., D. or newline)
    // We look for `\)\s*["']?\s*>` starting from nextCheckQuiz
    const searchSlice = content.slice(nextCheckQuiz, nextCheckQuiz + 3000);
    const endMatch = searchSlice.match(/\)\s*["']?\s*>/);
    if (!endMatch) {
      pos += 7;
      continue;
    }

    const tagEndIdx = nextCheckQuiz + endMatch.index + endMatch[0].length;
    const openingTag = content.slice(pos, tagEndIdx);

    // Parse the components from openingTag
    const isCorrectMatch = openingTag.match(/checkQuiz\s*\(\s*this\s*,\s*(true|false)\s*,/i);
    const fbIdMatch = openingTag.match(/checkQuiz\s*\(\s*this\s*,\s*(?:true|false)\s*,\s*['"]([^'"]+)['"]\s*,/i);

    if (!isCorrectMatch || !fbIdMatch) {
      pos = tagEndIdx;
      continue;
    }

    const isCorrect = isCorrectMatch[1];
    const fbId = fbIdMatch[1];

    // Extract the arguments between fbId and the closing `)`
    const fbIdPos = openingTag.indexOf(fbId);
    const afterId = openingTag.slice(fbIdPos + fbId.length);
    const rest = afterId.replace(/^['"]\s*,\s*/, '');
    const innerArgs = rest.replace(/\s*\)\s*["']?\s*>$/, '');

    // Check if innerArgs can be split by `', '` or `", "` or similar
    const sepMatch = innerArgs.match(/['"]\s*,\s*['"]/);
    if (!sepMatch) {
      pos = tagEndIdx;
      continue;
    }

    const rawArg4 = innerArgs.slice(0, sepMatch.index + 1);
    const rawArg5 = innerArgs.slice(sepMatch.index + sepMatch[0].length - 1);

    const cleanArg4 = sanitizeJsArg(rawArg4);
    const cleanArg5 = sanitizeJsArg(rawArg5);

    const newOpeningTag = `<button class="quiz-btn" onclick="checkQuiz(this, ${isCorrect}, '${fbId}', '${cleanArg4}', '${cleanArg5}')">`;

    if (newOpeningTag !== openingTag) {
      // Validate with vm.Script before replacing
      const testCode = `checkQuiz(this, ${isCorrect}, '${fbId}', '${cleanArg4}', '${cleanArg5}')`;
      const decodedTestCode = decodeHtmlEntities(testCode);
      try {
        new vm.Script(`function test() { ${decodedTestCode}; }`);
        // Replace in content
        content = content.slice(0, pos) + newOpeningTag + content.slice(tagEndIdx);
        repairedInFile++;
        pos += newOpeningTag.length;
      } catch (err) {
        console.error(`Validation failed in ${filePath} for fbId ${fbId}: ${err.message}`);
        pos = tagEndIdx;
      }
    } else {
      pos = tagEndIdx;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return repairedInFile;
  }
  return 0;
}

const files = getHtmlFiles(sourcesDir);
console.log(`Starting repair process across ${files.length} HTML files...`);

let totalRepairedButtons = 0;
let modifiedFilesCount = 0;

for (const file of files) {
  const relPath = path.relative(sourcesDir, file);
  const count = repairFile(file);
  if (count > 0) {
    modifiedFilesCount++;
    totalRepairedButtons += count;
    console.log(`✅ [${modifiedFilesCount}] ${relPath}: Đã sửa ${count} nút`);
  }
}

console.log(`\n================ HOÀN TẤT SỬA LỖI ================`);
console.log(`Tổng số file đã sửa: ${modifiedFilesCount}`);
console.log(`Tổng số nút trắc nghiệm đã được phục hồi: ${totalRepairedButtons}`);
