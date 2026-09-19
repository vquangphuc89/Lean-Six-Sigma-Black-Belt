import React, { useState } from 'react';
import { 
  X, 
  User, 
  Award, 
  Building2, 
  Mail, 
  Calendar, 
  LogOut, 
  Save, 
  CheckCircle,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { updateUserProfile, logout } from '../services/auth';

export default function UserProfileModal({ user, studyData, onClose, onUserUpdated, onLogout }) {
  const [name, setName] = useState(user.name || '');
  const [beltTrack, setBeltTrack] = useState(user.beltTrack || '');
  const [company, setCompany] = useState(user.company || '');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = updateUserProfile({ name, beltTrack, company });
    onUserUpdated(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleLogoutClick = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?')) {
      logout();
      onLogout();
      onClose();
    }
  };

  const completedCount = Object.keys(studyData.completedLessons || {}).length;
  const bookmarkedCount = Object.keys(studyData.bookmarkedLessons || {}).length;
  const hours = ((studyData.studySeconds || 0) / 3600).toFixed(1);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={22} color="var(--emerald-vibrant)" />
            <h3 className="modal-title">Hồ Sơ Học Viên Black Belt</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* User Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, var(--wood-deep) 0%, var(--wood-dark) 100%)',
          padding: '18px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-highlight)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: user.avatarBg || 'var(--emerald)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: '800',
            border: '2px solid var(--emerald-vibrant)',
            flexShrink: 0
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--emerald-mint)', fontWeight: '600' }}>
              {user.beltTrack}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '2px' }}>
              {user.email} &bull; {user.company}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '10px 12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--emerald-vibrant)' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Bài Đã Học</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '10px 12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--emerald-mint)' }}>
              {hours}h
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Thời Gian Học</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '10px 12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--gold)' }}>
              {bookmarkedCount} ⭐
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Bài Đã Lưu</div>
          </div>
        </div>

        {savedMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--emerald-vibrant)',
            color: 'var(--emerald-mint)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.84rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle size={15} /> Đã cập nhật hồ sơ thành công!
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
              Họ & Tên:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
              Mục Tiêu Đai (Belt Track):
            </label>
            <input
              type="text"
              value={beltTrack}
              onChange={(e) => setBeltTrack(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-secondary)' }}>
              Doanh Nghiệp / Bộ Phận:
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleLogoutClick}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} /> Đăng Xuất
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Save size={15} /> Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
