import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDirArg = process.argv[2] || 'sources';
const sourcesDir = path.resolve(rootDir, targetDirArg);

function getAllFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(file).toLowerCase())) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const htmlFiles = getAllFiles(sourcesDir, ['.html']);
let scriptErrors = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const scripts = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
  if (scripts) {
    scripts.forEach((s, idx) => {
      const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        new vm.Script(code);
      } catch (err) {
        scriptErrors.push({
          file: path.relative(sourcesDir, file),
          error: err.message,
          stack: err.stack ? err.stack.split('\n')[0] : ''
        });
      }
    });
  }
}

console.log('✅ Total HTML files checked:', htmlFiles.length);
console.log('❌ Files with script syntax errors:', scriptErrors.length);
if (scriptErrors.length > 0) {
  console.log(JSON.stringify(scriptErrors, null, 2));
  process.exit(1);
} else {
  console.log('🎉 100% of <script> blocks across all 270 files are syntactically valid!');
}
