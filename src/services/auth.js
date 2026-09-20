import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const USERS_KEY = 'lss_accounts_v1';
const CURRENT_USER_KEY = 'lss_current_user_v1';

// Tài khoản mẫu mặc định khi chưa có kết nối Firebase
const DEFAULT_ACCOUNTS = [
  {
    id: 'usr-default-1',
    name: 'Nguyễn Văn A',
    email: 'blackbelt@mindpro.vn',
    password: '123',
    beltTrack: 'Black Belt Candidate (Chiến Tướng Thực Thi)',
    company: 'MindPro Enterprise Solution',
    createdAt: new Date().toISOString(),
    avatarBg: 'linear-gradient(135deg, #059669, #022c22)'
  }
];

export const getAllUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi khi tải danh sách tài khoản:', e);
    return DEFAULT_ACCOUNTS;
  }
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const formatFirebaseError = (error) => {
  const code = error.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email hoặc mật khẩu không chính xác!';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký! Vui lòng chọn đăng nhập.';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn, vui lòng nhập ít nhất 6 ký tự.';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ.';
    case 'auth/configuration-not-found':
      return 'Chưa bật phương thức Đăng nhập Google trong Firebase Console (Vào Authentication > Sign-in method > Bật Google).';
    case 'auth/unauthorized-domain':
      return 'Tên miền này chưa được cấp phép. Vui lòng thêm lean-six-sigma-black-belt.vercel.app vào Authentication > Settings > Authorized domains.';

    case 'auth/popup-closed-by-user':
      return 'Đã hủy cửa sổ đăng nhập Google.';
    case 'auth/too-many-requests':
      return 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.';
    default:
      return error.message || 'Đã có lỗi xảy ra trong quá trình xác thực.';
  }
};

export const login = async (email, password) => {
  // 1. Nếu đã kết nối Firebase
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      let profileData = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        email: fbUser.email,
        beltTrack: 'Black Belt Candidate (Chiến Tướng Thực Thi)',
        company: 'Doanh Nghiệp',
        avatarBg: 'linear-gradient(135deg, #059669, #022c22)'
      };

      // Tải hồ sơ bổ sung từ Firestore
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            profileData = { ...profileData, ...userDoc.data() };
          } else {
            await setDoc(doc(db, 'users', fbUser.uid), profileData);
          }
        } catch (dbErr) {
          console.warn('Lỗi đọc profile Firestore:', dbErr);
        }
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileData));
      return { success: true, user: profileData, source: 'firebase' };
    } catch (err) {
      console.error('Firebase Login Error:', err);
      // Nếu là tài khoản demo mà Firebase chưa có, thử fallback sang local
      if (email.toLowerCase().trim() === 'blackbelt@mindpro.vn' && password === '123') {
        return loginLocal(email, password);
      }
      return { success: false, message: formatFirebaseError(err) };
    }
  }

  // 2. Chế độ Local Fallback
  return loginLocal(email, password);
};

const loginLocal = (email, password) => {
  const users = getAllUsers();
  const found = users.find(
    u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
  );

  if (!found) {
    return { 
      success: false, 
      message: 'Email hoặc mật khẩu không chính xác! (Mẹo: Có thể dùng blackbelt@mindpro.vn / 123)' 
    };
  }

  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    beltTrack: found.beltTrack || 'Black Belt Candidate',
    company: found.company || 'Doanh Nghiệp',
    avatarBg: found.avatarBg || 'linear-gradient(135deg, #059669, #022c22)'
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser, source: 'local' };
};

export const register = async ({ name, email, password, beltTrack, company }) => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    return { success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' };
  }

  // 1. Nếu đã kết nối Firebase
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      // Cập nhật tên hiển thị
      await updateProfile(fbUser, { displayName: name.trim() });

      const newUserData = {
        id: fbUser.uid,
        name: name.trim(),
        email: fbUser.email.toLowerCase(),
        beltTrack: beltTrack || 'Black Belt Candidate (Chiến Tướng Thực Thi)',
        company: company ? company.trim() : 'Doanh nghiệp cá nhân',
        createdAt: new Date().toISOString(),
        avatarBg: 'linear-gradient(135deg, #059669, #064e3b)'
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), newUserData);
        } catch (dbErr) {
          console.warn('Lỗi lưu profile Firestore:', dbErr);
        }
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUserData));
      return { success: true, user: newUserData, source: 'firebase' };
    } catch (err) {
      console.error('Firebase Register Error:', err);
      return { success: false, message: formatFirebaseError(err) };
    }
  }

  // 2. Chế độ Local Fallback
  const users = getAllUsers();
  const existing = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (existing) {
    return { success: false, message: 'Email này đã được đăng ký! Vui lòng chọn đăng nhập.' };
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    beltTrack: beltTrack || 'Black Belt Candidate',
    company: company ? company.trim() : 'Doanh nghiệp cá nhân',
    createdAt: new Date().toISOString(),
    avatarBg: 'linear-gradient(135deg, #059669, #064e3b)'
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    beltTrack: newUser.beltTrack,
    company: newUser.company,
    avatarBg: newUser.avatarBg
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser, source: 'local' };
};

export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return { 
      success: false, 
      message: 'Chức năng Đăng nhập Google cần được kích hoạt Firebase. Vui lòng xem hướng dẫn cài đặt Firebase.' 
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    let profileData = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Học viên Black Belt',
      email: fbUser.email,
      beltTrack: 'Black Belt Candidate (Chiến Tướng Thực Thi)',
      company: 'Doanh Nghiệp',
      avatarBg: 'linear-gradient(135deg, #059669, #022c22)'
    };

    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          profileData = { ...profileData, ...userDoc.data() };
        } else {
          await setDoc(doc(db, 'users', fbUser.uid), profileData);
        }
      } catch (dbErr) {
        console.warn('Lỗi Firestore:', dbErr);
      }
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileData));
    return { success: true, user: profileData, source: 'firebase' };
  } catch (err) {
    console.error('Google Sign-in Error:', err);
    return { success: false, message: formatFirebaseError(err) };
  }
};

export const logout = async () => {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Lỗi đăng xuất Firebase:', err);
    }
  }
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUserProfile = async (updatedFields) => {
  const current = getCurrentUser();
  if (!current) return null;

  const updatedSession = { ...current, ...updatedFields };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));

  // Cập nhật local users cache
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updatedFields };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Cập nhật Firestore nếu đã kết nối Firebase
  if (isFirebaseConfigured && db && current.id) {
    try {
      await setDoc(doc(db, 'users', current.id), updatedFields, { merge: true });
    } catch (dbErr) {
      console.warn('Lỗi cập nhật hồ sơ lên Firestore:', dbErr);
    }
  }

  return updatedSession;
};

// Lắng nghe thay đổi trạng thái xác thực (Auth State Listener)
export const subscribeToAuthChanges = (onUserChanged) => {
  if (!isFirebaseConfigured || !auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      let profileData = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        beltTrack: 'Black Belt Candidate (Chiến Tướng Thực Thi)',
        company: 'Doanh Nghiệp',
        avatarBg: 'linear-gradient(135deg, #059669, #022c22)'
      };

      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            profileData = { ...profileData, ...userDoc.data() };
          }
        } catch (e) {
          // ignore
        }
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileData));
      onUserChanged(profileData);
    } else {
      // Khi không có firebase user, chỉ xóa nếu phiên hiện tại là của firebase
      const current = getCurrentUser();
      if (current && !current.id.startsWith('usr-default') && !current.id.startsWith('usr-')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        onUserChanged(null);
      }
    }
  });
};
