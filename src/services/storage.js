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

// Trạng thái đồng bộ toàn cục (Real-time Cloud Sync State)
let currentSyncStatus = {
  status: isFirebaseConfigured ? 'syncing' : 'offline', // 'synced' | 'syncing' | 'error' | 'offline'
  lastSyncTime: null,
  error: null,
  cloudLessonCount: 0,
  localLessonCount: 0
};

const syncListeners = new Set();
export const subscribeToSyncStatus = (listener) => {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => syncListeners.delete(listener);
};

export const updateSyncStatus = (newStatus) => {
  currentSyncStatus = { ...currentSyncStatus, ...newStatus };
  syncListeners.forEach(listener => {
    try { listener(currentSyncStatus); } catch (e) {}
  });
};

export const getSyncStatus = () => currentSyncStatus;

// Tự động di chuyển dữ liệu khách (Guest Mode) sang tài khoản đã đăng nhập
export const migrateGuestDataToUser = (user) => {
  if (!user || !user.id) return null;
  try {
    const guestKey = 'lss_study_data_guest';
    const guestRaw = localStorage.getItem(guestKey);
    if (!guestRaw) return null;
    const guestData = JSON.parse(guestRaw);
    if (!guestData) return null;

    const hasGuestProgress = Object.keys(guestData.completedLessons || {}).length > 0 || 
                             Object.keys(guestData.quizScores || {}).length > 0;
    if (!hasGuestProgress) return null;

    const userKey = `lss_study_data_${user.id}`;
    const userRaw = localStorage.getItem(userKey);
    const userData = userRaw ? JSON.parse(userRaw) : getInitialData();

    const merged = {
      ...getInitialData(),
      ...userData,
      completedLessons: { ...(userData.completedLessons || {}), ...(guestData.completedLessons || {}) },
      quizScores: { ...(userData.quizScores || {}), ...(guestData.quizScores || {}) },
      bookmarkedLessons: { ...(userData.bookmarkedLessons || {}), ...(guestData.bookmarkedLessons || {}) },
      notes: { ...(userData.notes || {}), ...(guestData.notes || {}) },
      studySeconds: Math.max(userData.studySeconds || 0, guestData.studySeconds || 0),
      streak: Math.max(userData.streak || 1, guestData.streak || 1)
    };

    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(guestKey);
    console.log('🔄 Đã tự động chuyển đổi dữ liệu khách sang tài khoản:', user.email);
    return merged;
  } catch (e) {
    console.error('Lỗi di chuyển dữ liệu khách:', e);
    return null;
  }
};

// Debounce helper cho việc đồng bộ đám mây chống nghẽn mạng
let cloudSyncTimeout = null;
export const syncStudyDataToCloud = async (data, immediate = false) => {
  const user = getCurrentUser();
  if (!isFirebaseConfigured || !db) {
    updateSyncStatus({ status: 'offline', error: null });
    return { success: false, error: 'Firebase chưa được cấu hình' };
  }
  if (!user || !user.id || user.id.startsWith('usr-default')) {
    updateSyncStatus({ status: 'offline', error: null });
    return { success: false, error: 'Chưa đăng nhập tài khoản Cloud' };
  }

  updateSyncStatus({ status: 'syncing', error: null });

  const performSync = async () => {
    try {
      const docRef = doc(db, 'study_data', user.id);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
        userEmail: user.email || '',
        userName: user.name || ''
      };
      await setDoc(docRef, payload, { merge: true });
      const completedCount = Object.keys(data.completedLessons || {}).length;
      updateSyncStatus({ 
        status: 'synced', 
        lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
        localLessonCount: completedCount,
        cloudLessonCount: completedCount,
        error: null 
      });
      return { success: true };
    } catch (err) {
      console.error('⚠️ Lỗi đồng bộ dữ liệu lên Firebase Firestore:', err);
      let errorMsg = err.message || 'Lỗi không xác định';
      let errorCode = err.code || 'unknown';
      if (err.code === 'permission-denied') {
        errorMsg = 'Quyền truy cập Firestore bị từ chối (Missing or insufficient permissions). Bạn cần cài đặt Rules cho Firestore Database trên Firebase Console.';
      } else if (err.code === 'not-found') {
        errorMsg = 'Cơ sở dữ liệu Firestore chưa được tạo trên Firebase Console.';
      }
      updateSyncStatus({ 
        status: 'error', 
        error: { code: errorCode, message: errorMsg } 
      });
      return { success: false, error: errorMsg, code: errorCode };
    }
  };

  if (immediate) {
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    return await performSync();
  } else {
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    return new Promise((resolve) => {
      cloudSyncTimeout = setTimeout(async () => {
        const res = await performSync();
        resolve(res);
      }, 800);
    });
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

// Tải dữ liệu từ Firestore khi đăng nhập hoặc khởi động với Deep Merge hai chiều
export const fetchCloudStudyData = async (user) => {
  if (!isFirebaseConfigured || !db || !user || !user.id || user.id.startsWith('usr-default')) {
    updateSyncStatus({ status: 'offline', error: null });
    return getStudyData();
  }

  updateSyncStatus({ status: 'syncing', error: null });

  try {
    const docRef = doc(db, 'study_data', user.id);
    const snap = await getDoc(docRef);
    const localData = getStudyData();
    const localCount = Object.keys(localData.completedLessons || {}).length;

    if (snap.exists()) {
      const cloudData = snap.data();
      const cloudCount = Object.keys(cloudData.completedLessons || {}).length;

      // Hợp nhất dữ liệu học tập giữa Cloud và Local: không bao giờ để mất bài học ở bất kỳ máy nào
      const mergedCompletedLessons = {
        ...(cloudData.completedLessons || {}),
        ...(localData.completedLessons || {})
      };

      // Hợp nhất điểm thi quizScores: ưu tiên giữ điểm cao nhất
      const mergedQuizScores = { ...(cloudData.quizScores || {}) };
      if (localData.quizScores) {
        Object.entries(localData.quizScores).forEach(([lessonId, localScore]) => {
          const cloudScore = mergedQuizScores[lessonId];
          if (!cloudScore || (localScore.percentage || 0) >= (cloudScore.percentage || 0)) {
            mergedQuizScores[lessonId] = localScore;
          }
        });
      }

      const mergedData = {
        ...getInitialData(),
        ...cloudData,
        ...localData,
        completedLessons: mergedCompletedLessons,
        quizScores: mergedQuizScores,
        bookmarkedLessons: {
          ...(cloudData.bookmarkedLessons || {}),
          ...(localData.bookmarkedLessons || {})
        },
        notes: {
          ...(cloudData.notes || {}),
          ...(localData.notes || {})
        },
        studySeconds: Math.max(localData.studySeconds || 0, cloudData.studySeconds || 0),
        streak: Math.max(localData.streak || 1, cloudData.streak || 1)
      };

      const finalCount = Object.keys(mergedData.completedLessons).length;

      // Cập nhật lại LocalStorage
      saveStudyData(mergedData, { syncCloud: false });

      // Nếu local có bài mới hơn cloud, cập nhật ngược lên cloud
      if (finalCount > cloudCount || Object.keys(mergedQuizScores).length > Object.keys(cloudData.quizScores || {}).length) {
        await syncStudyDataToCloud(mergedData, true);
      } else {
        updateSyncStatus({
          status: 'synced',
          lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
          localLessonCount: finalCount,
          cloudLessonCount: cloudCount,
          error: null
        });
      }

      return mergedData;
    } else {
      // Dữ liệu chưa tồn tại trên Cloud: nếu máy tính hiện tại đã học bài, đẩy ngay lên Cloud
      if (localCount > 0) {
        await syncStudyDataToCloud(localData, true);
      } else {
        updateSyncStatus({
          status: 'synced',
          lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
          localLessonCount: 0,
          cloudLessonCount: 0,
          error: null
        });
      }
      return localData;
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ Cloud Firestore:', err);
    let errorMsg = err.message || 'Lỗi không xác định';
    let errorCode = err.code || 'unknown';
    if (err.code === 'permission-denied') {
      errorMsg = 'Quyền truy cập Firestore bị từ chối (Missing or insufficient permissions). Bạn cần cài đặt Rules cho Firestore Database trên Firebase Console.';
    } else if (err.code === 'not-found') {
      errorMsg = 'Cơ sở dữ liệu Firestore chưa được tạo trên Firebase Console.';
    }
    updateSyncStatus({
      status: 'error',
      error: { code: errorCode, message: errorMsg }
    });
    return getStudyData();
  }
};

// Ép đẩy dữ liệu từ máy hiện tại lên Đám mây (Force Push)
export const forcePushToCloud = async () => {
  const data = getStudyData();
  return await syncStudyDataToCloud(data, true);
};

// Ép tải lại dữ liệu mới nhất từ Đám mây về máy này (Force Pull)
export const forcePullFromCloud = async () => {
  const user = getCurrentUser();
  if (!user || !user.id || user.id.startsWith('usr-default')) {
    return { success: false, error: 'Chưa đăng nhập tài khoản Cloud' };
  }
  const cloudData = await fetchCloudStudyData(user);
  return { success: true, data: cloudData };
};

// Lắng nghe dữ liệu thời gian thực từ Firestore (Realtime Sync)
export const subscribeToCloudStudyData = (userId, onDataUpdate) => {
  if (!isFirebaseConfigured || !db || !userId || userId.startsWith('usr-default')) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'study_data', userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const localData = getStudyData();

        const merged = {
          ...getInitialData(),
          ...localData,
          ...cloudData,
          completedLessons: {
            ...(localData.completedLessons || {}),
            ...(cloudData.completedLessons || {})
          },
          quizScores: {
            ...(localData.quizScores || {}),
            ...(cloudData.quizScores || {})
          },
          bookmarkedLessons: {
            ...(localData.bookmarkedLessons || {}),
            ...(cloudData.bookmarkedLessons || {})
          },
          notes: {
            ...(localData.notes || {}),
            ...(cloudData.notes || {})
          },
          studySeconds: Math.max(localData.studySeconds || 0, cloudData.studySeconds || 0),
          streak: Math.max(localData.streak || 1, cloudData.streak || 1)
        };

        const key = `lss_study_data_${userId}`;
        localStorage.setItem(key, JSON.stringify(merged));

        const count = Object.keys(merged.completedLessons).length;
        updateSyncStatus({
          status: 'synced',
          lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
          localLessonCount: count,
          cloudLessonCount: count,
          error: null
        });

        onDataUpdate(merged);
      }
    }, (error) => {
      console.error('Realtime listener error:', error);
      let errorMsg = error.message;
      if (error.code === 'permission-denied') {
        errorMsg = 'Quyền truy cập Firestore bị từ chối (Missing or insufficient permissions). Bạn cần cài đặt Rules trên Firebase Console.';
      }
      updateSyncStatus({
        status: 'error',
        error: { code: error.code || 'realtime-error', message: errorMsg }
      });
    });
  } catch (err) {
    console.error('Lỗi thiết lập realtime listener:', err);
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
