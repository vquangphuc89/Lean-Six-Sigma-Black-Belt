import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Database,
  Laptop,
  Server
} from 'lucide-react';
import { forcePushToCloud, forcePullFromCloud, getSyncStatus } from '../services/storage';

export default function CloudSyncModal({ user, studyData, syncInfo, onClose, onDataUpdated }) {
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const localCompleted = Object.keys(studyData?.completedLessons || {}).length;
  const localQuizzes = Object.keys(studyData?.quizScores || {}).length;

  const handleForcePush = async () => {
    setLoading(true);
    setActionMsg({ type: 'info', text: 'Đang đẩy toàn bộ tiến độ học từ máy tính này lên Cloud Firestore...' });
    const res = await forcePushToCloud();
    setLoading(false);
    if (res?.success) {
      setActionMsg({ type: 'success', text: '✅ Đã đẩy dữ liệu lên Đám mây thành công! Mở máy tính khác và tải lại để xem kết quả.' });
    } else {
      setActionMsg({ type: 'error', text: `❌ Đẩy dữ liệu thất bại: ${res?.error || 'Lỗi kết nối'}` });
    }
  };

  const handleForcePull = async () => {
    setLoading(true);
    setActionMsg({ type: 'info', text: 'Đang tải dữ liệu mới nhất từ Cloud Firestore về máy tính này...' });
    const res = await forcePullFromCloud();
    setLoading(false);
    if (res?.success && res?.data) {
      if (onDataUpdated) onDataUpdated(res.data);
      setActionMsg({ type: 'success', text: '✅ Đã tải dữ liệu từ Đám mây thành công! Giao diện đã được cập nhật.' });
    } else {
      setActionMsg({ type: 'error', text: `❌ Tải dữ liệu thất bại: ${res?.error || 'Lỗi kết nối'}` });
    }
  };

  const copyRulesToClipboard = () => {
    const rulesCode = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`;
    navigator.clipboard.writeText(rulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isError = syncInfo?.status === 'error';
  const isSynced = syncInfo?.status === 'synced';
  const isSyncing = syncInfo?.status === 'syncing' || loading;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '620px', 
          backgroundColor: '#0f172a', 
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isError ? '#ef4444' : '#10b981'
            }}>
              <Cloud size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                Trung Tâm Đồng Bộ Đám Mây (Cloud Sync)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Đồng bộ tiến độ học tập và bài thi trắc nghiệm giữa các thiết bị
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Main Status Banner */}
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: isError 
              ? 'rgba(239, 68, 68, 0.12)' 
              : isSynced 
                ? 'rgba(16, 185, 129, 0.12)' 
                : 'rgba(59, 130, 246, 0.12)',
            border: `1px solid ${
              isError 
                ? 'rgba(239, 68, 68, 0.4)' 
                : isSynced 
                  ? 'rgba(16, 185, 129, 0.4)' 
                  : 'rgba(59, 130, 246, 0.4)'
            }`
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {isError ? (
                <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : isSynced ? (
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <RefreshCw size={24} color="#3b82f6" className="animate-spin" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '1rem',
                  color: isError ? '#f87171' : isSynced ? '#34d399' : '#60a5fa'
                }}>
                  {isError 
                    ? 'Chưa Thể Đồng Bộ Lên Cloud Firestore' 
                    : isSynced 
                      ? 'Đám Mây Đã Đồng Bộ Thời Gian Thực' 
                      : 'Đang Kiểm Tra & Đồng Bộ Dữ Liệu...'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                  {isError ? (
                    syncInfo?.error?.message || 'Quyền truy cập Firestore bị từ chối hoặc cơ sở dữ liệu chưa được kích hoạt.'
                  ) : isSynced ? (
                    `Lần đồng bộ gần nhất: ${syncInfo?.lastSyncTime || 'Vừa xong'}. Mọi tiến độ học và điểm trắc nghiệm được tự động cập nhật liên tục.`
                  ) : (
                    'Hệ thống đang kiểm tra kết nối với Cloud Firestore...'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* If Error: Show Explicit Step-by-Step Fix with Rules Copy */}
          {isError && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: '700', fontSize: '0.92rem' }}>
                <ShieldAlert size={18} />
                <span>Cách khắc phục trong 30 giây trên Firebase Console:</span>
              </div>
              <ol style={{ 
                margin: '10px 0 12px 18px', 
                padding: 0, 
                fontSize: '0.84rem', 
                color: '#e2e8f0', 
                lineHeight: 1.6 
              }}>
                <li>
                  Truy cập <strong>Firebase Console</strong> &gt; Chọn dự án <strong>lean-six-sigma-22598</strong>.
                </li>
                <li>
                  Ở menu bên trái, chọn <strong>Firestore Database</strong> &gt; Bấm tab <strong>Rules</strong> (ở trên cùng).
                </li>
                <li>
                  Dán đoạn mã phân quyền bên dưới vào và nhấn nút <strong>Publish</strong> màu xanh:
                </li>
              </ol>

              <div style={{
                position: 'relative',
                backgroundColor: '#020617',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#34d399',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.4
              }}>
                {`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}`}
                
                <button 
                  onClick={copyRulesToClipboard}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: copied ? '#059669' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép Rules'}</span>
                </button>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <a 
                  href="https://console.firebase.google.com/project/lean-six-sigma-22598/firestore/rules" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#38bdf8',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  <span>Mở trang Firestore Rules trên Firebase Console</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* Comparison Stats: Local vs Cloud */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* Local Stats */}
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600' }}>
                <Laptop size={16} color="#38bdf8" />
                <span>Máy Tính Hiện Tại (Local)</span>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Bài học hoàn thành:</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{localCompleted} / 228</strong>
              </div>
              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Đã thi trắc nghiệm:</span>
                <strong style={{ color: '#a78bfa', fontSize: '1.05rem' }}>{localQuizzes} bài</strong>
              </div>
            </div>

            {/* Cloud Stats */}
            <div style={{
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', fontWeight: '600' }}>
                <Server size={16} color="#34d399" />
                <span>Đám Mây (Cloud Firestore)</span>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Bài học đã ghi nhận:</span>
                <strong style={{ color: '#34d399', fontSize: '1.05rem' }}>
                  {isError ? 'Chưa kết nối' : `${syncInfo?.cloudLessonCount ?? localCompleted} / 228`}
                </strong>
              </div>
              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Tài khoản:</span>
                <span style={{ color: '#e2e8f0', fontSize: '0.8rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'Chưa đăng nhập'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Message */}
          {actionMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              backgroundColor: actionMsg.type === 'error' 
                ? 'rgba(239, 68, 68, 0.2)' 
                : actionMsg.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : 'rgba(59, 130, 246, 0.2)',
              color: actionMsg.type === 'error' ? '#fca5a5' : actionMsg.type === 'success' ? '#6ee7b7' : '#93c5fd',
              border: '1px solid currentColor'
            }}>
              {actionMsg.text}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleForcePush}
              disabled={isSyncing}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '0.88rem',
                border: 'none',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                opacity: isSyncing ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <ArrowUpCircle size={18} />
              <span>Đẩy Lên Cloud (Push)</span>
            </button>

            <button
              onClick={handleForcePull}
              disabled={isSyncing}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                fontWeight: '600',
                fontSize: '0.88rem',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                opacity: isSyncing ? 0.6 : 1
              }}
            >
              <ArrowDownCircle size={18} />
              <span>Tải Về Từ Cloud (Pull)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
