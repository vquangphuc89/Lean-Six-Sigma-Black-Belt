import { getCurrentUser } from './auth';

const THEME_KEY = 'lss_app_theme';

const getStorageKey = () => {
  const user = getCurrentUser();
  if (user && user.id) {
    return `lss_study_data_${user.id}`;
  }
  return 'lss_study_data_guest';
};

// Dữ liệu mặc định ban đầu
const getInitialData = () => ({
  completedLessons: {}, // { 'lss-1': '2026-09-19T...' }
  bookmarkedLessons: {}, // { 'lss-1': true }
  notes: {}, // { 'lss-1': 'Ghi chú cho bài học...' }
  quizScores: {}, // { 'lss-1': { score: 8, total: 8, passed: true, timestamp: '...' } }
  checklists: {}, // { 'actin1-1': true }
  studySeconds: 0,
  streak: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  activeLessonId: 'lss-1'
});

export const getStudyData = () => {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    const initial = getInitialData();
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    
    // Cập nhật streak nếu ngày học liên tiếp
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastStudyDate !== today) {
      const lastDate = new Date(parsed.lastStudyDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        parsed.streak = (parsed.streak || 0) + 1;
      } else if (diffDays > 1) {
        parsed.streak = 1;
      }
      parsed.lastStudyDate = today;
      saveStudyData(parsed);
    }
    return { ...initial, ...parsed };
  } catch (e) {
    console.error('Lỗi khi đọc dữ liệu học tập:', e);
    return getInitialData();
  }
};

export const saveStudyData = (data) => {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Lỗi khi lưu dữ liệu học tập:', e);
  }
};

export const toggleCompleteLesson = (lessonId) => {
  const data = getStudyData();
  const isCompleted = !!data.completedLessons[lessonId];
  if (isCompleted) {
    delete data.completedLessons[lessonId];
  } else {
    data.completedLessons[lessonId] = new Date().toISOString();
  }
  saveStudyData(data);
  return data;
};

export const toggleBookmarkLesson = (lessonId) => {
  const data = getStudyData();
  if (data.bookmarkedLessons[lessonId]) {
    delete data.bookmarkedLessons[lessonId];
  } else {
    data.bookmarkedLessons[lessonId] = true;
  }
  saveStudyData(data);
  return data;
};

export const saveLessonNote = (lessonId, noteText) => {
  const data = getStudyData();
  data.notes[lessonId] = noteText;
  saveStudyData(data);
  return data;
};

export const recordQuizResult = (lessonId, score, total) => {
  const data = getStudyData();
  data.quizScores[lessonId] = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: new Date().toISOString()
  };
  saveStudyData(data);
  return data;
};

export const setActiveLesson = (lessonId) => {
  const data = getStudyData();
  data.activeLessonId = lessonId;
  saveStudyData(data);
  return data;
};

export const addStudyTime = (seconds) => {
  const data = getStudyData();
  data.studySeconds = (data.studySeconds || 0) + seconds;
  saveStudyData(data);
  return data;
};

// Theme Management
export const getAppTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'dark';
};

export const setAppTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
};

// Export & Import Dữ Liệu
export const exportDataAsJSON = () => {
  const user = getCurrentUser();
  const data = getStudyData();
  const payload = {
    user: user ? { name: user.name, email: user.email, beltTrack: user.beltTrack } : 'Guest',
    exportedAt: new Date().toISOString(),
    studyData: data
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const userPrefix = user ? user.name.replace(/\s+/g, '_') : 'Guest';
  a.download = `LSS_Progress_${userPrefix}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Dữ liệu JSON không hợp lệ');
    }
    const dataToSave = parsed.studyData ? parsed.studyData : parsed;
    saveStudyData(dataToSave);
    return { success: true, data: dataToSave };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
