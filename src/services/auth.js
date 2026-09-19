const USERS_KEY = 'lss_accounts_v1';
const CURRENT_USER_KEY = 'lss_current_user_v1';

// Tài khoản mẫu mặc định để người dùng có thể đăng nhập ngay
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

export const login = (email, password) => {
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

  // Lưu phiên đăng nhập
  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    beltTrack: found.beltTrack || 'Black Belt Candidate',
    company: found.company || 'Doanh Nghiệp',
    avatarBg: found.avatarBg || 'linear-gradient(135deg, #059669, #022c22)'
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
};

export const register = ({ name, email, password, beltTrack, company }) => {
  const users = getAllUsers();
  const existing = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (existing) {
    return { success: false, message: 'Email này đã được đăng ký! Vui lòng chọn đăng nhập.' };
  }

  if (!name.trim() || !email.trim() || !password.trim()) {
    return { success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' };
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

  // Tự động đăng nhập
  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    beltTrack: newUser.beltTrack,
    company: newUser.company,
    avatarBg: newUser.avatarBg
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUserProfile = (updatedFields) => {
  const current = getCurrentUser();
  if (!current) return null;

  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updatedFields };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  const updatedSession = { ...current, ...updatedFields };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));
  return updatedSession;
};
