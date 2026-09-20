import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Award, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { login, register, loginWithGoogle } from '../services/auth';
import { isFirebaseConfigured } from '../services/firebase';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [beltTrack, setBeltTrack] = useState('Black Belt Candidate (Chiến Tướng Thực Thi)');
  const [company, setCompany] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Lỗi đăng nhập không xác định');
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('blackbelt@mindpro.vn');
    setPassword('123');
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login('blackbelt@mindpro.vn', '123');
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Lỗi đăng nhập tài khoản mẫu');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await loginWithGoogle();
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Lỗi đăng nhập với Google');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await register({ name, email, password, beltTrack, company });
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Lỗi đăng ký tài khoản');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={22} color="var(--emerald-vibrant)" />
            <h3 className="modal-title">
              {mode === 'login' ? 'Đăng Nhập Học Viên' : 'Đăng Ký Tài Khoản'}
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Sync Mode Status Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.78rem',
          background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          color: isFirebaseConfigured ? 'var(--emerald-mint)' : '#fbbf24'
        }}>
          <Cloud size={14} />
          <span>
            {isFirebaseConfigured 
              ? 'Máy chủ Cloud Firebase sẵn sàng: Dữ liệu tự động đồng bộ giữa máy tính & điện thoại.' 
              : 'Chế độ Lưu Cục Bộ: Đăng ký/Đăng nhập để lưu tiến độ trên trình duyệt này.'}
          </span>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(2, 44, 34, 0.4)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'login' ? 'var(--emerald-vibrant)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'register' ? 'var(--emerald-vibrant)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--red)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Logins (Google & Demo) */}
        {mode === 'login' && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Google Sign-in Button */}
            {isFirebaseConfigured && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--emerald-vibrant)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Đăng Nhập Bằng Tài Khoản Google
              </button>
            )}

            {/* Demo Account Button */}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(2, 44, 34, 0.5))',
                border: '1px dashed var(--emerald-vibrant)',
                color: 'var(--emerald-mint)',
                padding: '9px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={15} color="var(--emerald-vibrant)" />
              Đăng Nhập Nhanh Bằng Tài Khoản Mẫu (1 Click)
            </button>

            <div style={{ textAlign: 'center', margin: '6px 0 2px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              &mdash; HOẶC DÙNG EMAIL CỦA BẠN &mdash;
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Họ & Tên Học Viên:
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--emerald-mint)' }} />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Võ Quang Phúc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Email Đăng Nhập:
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--emerald-mint)' }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Mật Khẩu:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--emerald-mint)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '9px 38px 9px 36px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Lộ Trình Đai Mục Tiêu (Belt Track):
                </label>
                <select
                  value={beltTrack}
                  onChange={(e) => setBeltTrack(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="Black Belt Candidate (Chiến Tướng Thực Thi)">Black Belt (Thực thi toàn thời gian)</option>
                  <option value="Master Black Belt Aspirant (Cố Vấn & Đào Tạo)">Master Black Belt (Cố vấn & Đào tạo)</option>
                  <option value="Green Belt Practitioner (Kiêm Nhiệm Dự Án)">Green Belt (Kiêm nhiệm dự án)</option>
                  <option value="Champion / Sponsor (Lãnh Đạo Bảo Trợ)">Champion (Lãnh đạo bảo trợ)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Đơn Vị / Doanh Nghiệp Công Tác:
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--emerald-mint)' }} />
                  <input
                    type="text"
                    placeholder="Ví dụ: VinFast, Samsung, FPT, Unilever..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.92rem', marginTop: '6px' }}
          >
            {loading ? 'Đang kết nối Cloud...' : (mode === 'login' ? 'Đăng Nhập Vào Hệ Thống' : 'Tạo Tài Khoản & Bắt Đầu Học')}
          </button>
        </form>
      </div>
    </div>
  );
}
