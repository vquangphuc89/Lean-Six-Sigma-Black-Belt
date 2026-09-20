import { getCurrentUser } from './auth';
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const THEME_KEY = 'lss_app_theme';

const getStorageKey = (overrideUser) => {
  const user = overrideUser || getCurrentUser();
  if (user && user.id) {
    return `lss_study_data_${user.id}`;
  }
  return 'lss_study_data_guest';
};

// Dữ liệu mặc định ban đầu
export const getInitialData = () => ({
  completedLessons: {}, // { 'lss-1': '2026-09-19T...' }
  bookmarkedLessons: {}, // { 'lss-1': true }
  notes: {}, // { 'lss-1': 'Ghi chú cho bài học...' }
  quizScores: {}, // { 'lss-1': { score: 8, total: 8, percentage: 100, timestamp: '...' } }
  checklists: {},
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

// Debounce helper cho việc đồng bộ đám mây chống nghẽn mạng
let cloudSyncTimeout = null;
export const syncStudyDataToCloud = async (data, immediate = false) => {
  const user = getCurrentUser();
  if (!isFirebaseConfigured || !db || !user || !user.id) return;
  // Không đồng bộ tài khoản mẫu offline
  if (user.id.startsWith('usr-default')) return;

  const performSync = async () => {
    try {
      const docRef = doc(db, 'study_data', user.id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
        userEmail: user.email || '',
        userName: user.name || ''
      }, { merge: true });
    } catch (err) {
      console.warn('⚠️ Lỗi đồng bộ dữ liệu lên Firebase Firestore:', err);
    }
  };

  if (immediate) {
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    await performSync();
  } else {
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    cloudSyncTimeout = setTimeout(performSync, 1200); // 1.2s debounce
  }
};

export const saveStudyData = (data, options = { syncCloud: true, immediate: false }) => {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
    
    if (options.syncCloud) {
      syncStudyDataToCloud(data, options.immediate);
    }
  } catch (e) {
    console.error('Lỗi khi lưu dữ liệu học tập:', e);
  }
};

// Tải dữ liệu từ Firestore khi đăng nhập hoặc khởi động
export const fetchCloudStudyData = async (user) => {
  if (!isFirebaseConfigured || !db || !user || !user.id) {
    return getStudyData();
  }

  try {
    const docRef = doc(db, 'study_data', user.id);
    const snap = await getDoc(docRef);
    const localData = getStudyData();

    if (snap.exists()) {
      const cloudData = snap.data();
      // Gộp thông minh giữa Cloud và Local: ưu tiên giữ các bài đã học ở cả 2 nơi
      const mergedData = {
        ...getInitialData(),
        ...localData,
        ...cloudData,
        completedLessons: {
          ...(localData.completedLessons || {}),
          ...(cloudData.completedLessons || {})
        },
        bookmarkedLessons: {
          ...(localData.bookmarkedLessons || {}),
          ...(cloudData.bookmarkedLessons || {})
        },
        notes: {
          ...(localData.notes || {}),
          ...(cloudData.notes || {})
        },
        quizScores: {
          ...(localData.quizScores || {}),
          ...(cloudData.quizScores || {})
        },
        studySeconds: Math.max(localData.studySeconds || 0, cloudData.studySeconds || 0),
        streak: Math.max(localData.streak || 1, cloudData.streak || 1)
      };

      saveStudyData(mergedData, { syncCloud: false });
      return mergedData;
    } else {
      // Chưa có trên cloud, đẩy dữ liệu local hiện tại lên cloud
      if (Object.keys(localData.completedLessons || {}).length > 0) {
        await syncStudyDataToCloud(localData, true);
      }
      return localData;
    }
  } catch (err) {
    console.warn('Lỗi khi tải dữ liệu từ Cloud Firestore:', err);
    return getStudyData();
  }
};

// Lắng nghe dữ liệu thời gian thực từ Firestore (Realtime Sync)
export const subscribeToCloudStudyData = (userId, onDataUpdate) => {
  if (!isFirebaseConfigured || !db || !userId) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'study_data', userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const initial = getInitialData();
        const merged = { ...initial, ...cloudData };
        // Lưu vào local cache
        const key = `lss_study_data_${userId}`;
        localStorage.setItem(key, JSON.stringify(merged));
        onDataUpdate(merged);
      }
    }, (error) => {
      console.warn('Realtime listener error:', error);
    });
  } catch (err) {
    console.warn('Lỗi thiết lập realtime listener:', err);
    return () => {};
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
  saveStudyData(data, { syncCloud: true, immediate: true });
  return data;
};

export const toggleBookmarkLesson = (lessonId) => {
  const data = getStudyData();
  if (data.bookmarkedLessons[lessonId]) {
    delete data.bookmarkedLessons[lessonId];
  } else {
    data.bookmarkedLessons[lessonId] = true;
  }
  saveStudyData(data, { syncCloud: true, immediate: true });
  return data;
};

export const saveLessonNote = (lessonId, noteText) => {
  const data = getStudyData();
  data.notes[lessonId] = noteText;
  saveStudyData(data, { syncCloud: true, immediate: false });
  return data;
};

export const recordQuizResult = (lessonId, score, total) => {
  const data = getStudyData();
  if (!data.quizScores) {
    data.quizScores = {};
  }
  data.quizScores[lessonId] = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: new Date().toISOString()
  };
  saveStudyData(data, { syncCloud: true, immediate: true });
  return data;
};

export const setActiveLesson = (lessonId) => {
  const data = getStudyData();
  data.activeLessonId = lessonId;
  saveStudyData(data, { syncCloud: true, immediate: false });
  return data;
};

export const addStudyTime = (seconds) => {
  const data = getStudyData();
  data.studySeconds = (data.studySeconds || 0) + seconds;
  saveStudyData(data, { syncCloud: true, immediate: false });
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
    saveStudyData(dataToSave, { syncCloud: true, immediate: true });
    return { success: true, data: dataToSave };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
