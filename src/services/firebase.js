import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Kiểm tra xem đã cấu hình đầy đủ biến môi trường Firebase hợp lệ chưa
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  !firebaseConfig.apiKey.startsWith('AIzaSy...') &&
  firebaseConfig.apiKey.length > 15
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('🔥 Firebase Cloud Synchronization đã được kết nối thành công!');
  } catch (err) {
    console.warn('⚠️ Lỗi khởi tạo Firebase, ứng dụng chuyển sang chế độ lưu cục bộ:', err);
  }
} else {
  console.info('ℹ️ Firebase chưa được cấu hình. Hệ thống đang chạy ở chế độ Lưu Cục Bộ (LocalStorage).');
}

export { app, auth, db, googleProvider };
