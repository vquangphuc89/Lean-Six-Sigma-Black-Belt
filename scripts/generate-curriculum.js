import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcesDir = path.join(rootDir, 'sources');
const publicSourcesDir = path.join(rootDir, 'public', 'sources');
const outputDataDir = path.join(rootDir, 'src', 'data');

console.log('🔄 Bắt đầu phân tích kho học liệu từ:', sourcesDir);

if (!fs.existsSync(sourcesDir)) {
  console.error('❌ Không tìm thấy thư mục sources!');
  process.exit(1);
}

// Đảm bảo các thư mục đích tồn tại
if (!fs.existsSync(publicSourcesDir)) {
  fs.mkdirSync(publicSourcesDir, { recursive: true });
}
if (!fs.existsSync(outputDataDir)) {
  fs.mkdirSync(outputDataDir, { recursive: true });
}

// Đồng bộ thư mục sources vào public/sources để Vite phục vụ static
console.log('📦 Đang đồng bộ các tệp bài học vào public/sources/...');
fs.cpSync(sourcesDir, publicSourcesDir, { recursive: true });
console.log('✅ Đã đồng bộ tài nguyên tĩnh thành công.');

// Hàm trích xuất metadata từ nội dung HTML
function extractHtmlMetadata(htmlContent, fallbackTitle) {
  let title = fallbackTitle;
  let titleEn = '';
  let description = '';
  let quizCount = 0;
  let flashcardCount = 0;
  let checklistCount = 0;

  // Title tag
  const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/—.*$/i, '').trim();
  }

  // Hero title En
  const heroEnMatch = htmlContent.match(/<div class="hero-title-en">([^<]+)<\/div>/i);
  if (heroEnMatch) {
    titleEn = heroEnMatch[1].trim();
  }

  // Hero desc
  const heroDescMatch = htmlContent.match(/<p class="hero-desc">([^<]+)<\/p>/i);
  if (heroDescMatch) {
    description = heroDescMatch[1].trim();
  }

  // Quizzes count
  const quizzes = htmlContent.match(/class=["']quiz-card["']/gi);
  if (quizzes) quizCount = quizzes.length;

  // Flashcards count
  const flashcards = htmlContent.match(/class=["']flashcard["']/gi);
  if (flashcards) flashcardCount = flashcards.length;

  // Checklist count
  const checklist = htmlContent.match(/class=["']action-item["']/gi);
  if (checklist) checklistCount = checklist.length;

  // Ước tính thời lượng đọc (phút)
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const words = plainText.trim().split(/\s+/).length;
  const readTimeMin = Math.max(3, Math.round(words / 200));

  return {
    title,
    titleEn,
    description,
    quizCount,
    flashcardCount,
    checklistCount,
    readTimeMin
  };
}

// Quét toàn bộ Modules
const moduleDirs = fs.readdirSync(sourcesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

let globalLessonIndex = 0;
const modulesData = [];

for (const mod of moduleDirs) {
  const modPath = path.join(sourcesDir, mod.name);
  const subtopicDirs = fs.readdirSync(modPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const subtopicsData = [];

  for (const sub of subtopicDirs) {
    const subPath = path.join(modPath, sub.name);
    const files = fs.readdirSync(subPath)
      .filter(f => f.endsWith('.html'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const lessonsData = [];

    for (const file of files) {
      globalLessonIndex++;
      const filePath = path.join(subPath, file);
      const relativeUrl = `/sources/${encodeURIComponent(mod.name)}/${encodeURIComponent(sub.name)}/${encodeURIComponent(file)}`;
      
      let htmlContent = '';
      try {
        htmlContent = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.warn('Cảnh báo: Không thể đọc file', filePath);
      }

      const cleanFileName = file.replace(/\.html$/i, '').replace(/_Done$/i, '');
      const meta = extractHtmlMetadata(htmlContent, cleanFileName);

      lessonsData.push({
        id: `lss-${globalLessonIndex}`,
        order: globalLessonIndex,
        file: file,
        cleanTitle: meta.title || cleanFileName,
        titleEn: meta.titleEn,
        description: meta.description,
        quizCount: meta.quizCount,
        flashcardCount: meta.flashcardCount,
        checklistCount: meta.checklistCount,
        readTimeMin: meta.readTimeMin,
        url: relativeUrl,
        moduleName: mod.name,
        subtopicName: sub.name
      });
    }

    subtopicsData.push({
      id: `sub-${mod.name.substring(0, 2)}-${sub.name.substring(0, 2)}`,
      name: sub.name,
      cleanName: sub.name.replace(/^\d+\.\s*/, ''),
      lessonsCount: lessonsData.length,
      lessons: lessonsData
    });
  }

  const modLessonCount = subtopicsData.reduce((acc, s) => acc + s.lessonsCount, 0);

  modulesData.push({
    id: `mod-${mod.name.substring(0, 2)}`,
    name: mod.name,
    cleanName: mod.name.replace(/^\d+\.\s*/, ''),
    subtopicsCount: subtopicsData.length,
    lessonsCount: modLessonCount,
    subtopics: subtopicsData
  });
}

const curriculum = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalModules: modulesData.length,
  totalSubtopics: modulesData.reduce((acc, m) => acc + m.subtopicsCount, 0),
  totalLessons: globalLessonIndex,
  modules: modulesData
};

const outputPath = path.join(outputDataDir, 'curriculum.json');
fs.writeFileSync(outputPath, JSON.stringify(curriculum, null, 2), 'utf-8');

console.log('==================================================');
console.log(`🎉 Tạo chỉ mục thành công!`);
console.log(`📚 Tổng số Phân hệ (Modules): ${curriculum.totalModules}`);
console.log(`📑 Tổng số Chuyên đề (Subtopics): ${curriculum.totalSubtopics}`);
console.log(`📖 Tổng số Bài học (Lessons): ${curriculum.totalLessons}`);
console.log(`💾 Đã lưu tại: ${outputPath}`);
console.log('==================================================');
