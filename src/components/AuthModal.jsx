import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { login, register } from '../services/auth';

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

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  const handleQuickDemoLogin = () => {
    setEmail('blackbelt@mindpro.vn');
    setPassword('123');
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = login('blackbelt@mindpro.vn', '123');
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      }
    }, 200);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = register({ name, email, password, beltTrack, company });
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
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

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(2, 44, 34, 0.4)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
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

        {/* Quick 1-Click Login Button for convenience */}
        {mode === 'login' && (
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(2, 44, 34, 0.6))',
                border: '1px dashed var(--emerald-vibrant)',
                color: 'var(--emerald-mint)',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={16} color="var(--emerald-vibrant)" />
              Đăng Nhập Nhanh Bằng Tài Khoản Mẫu (1 Click)
            </button>
            <div style={{ textAlign: 'center', margin: '14px 0 6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              &mdash; HOẶC ĐĂNG NHẬP BẰNG TÀI KHOẢN CỦA BẠN &mdash;
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
                  placeholder="Ví dụ: Nguyễn Văn A"
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
                placeholder="Nhập mật khẩu"
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
            {loading ? 'Đang xác thực...' : (mode === 'login' ? 'Đăng Nhập Vào Hệ Thống' : 'Tạo Tài Khoản & Bắt Đầu Học')}
          </button>
        </form>
      </div>
    </div>
  );
}
