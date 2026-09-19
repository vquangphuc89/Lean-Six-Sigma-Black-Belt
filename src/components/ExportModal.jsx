import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { exportDataAsJSON, importDataFromJSON, saveStudyData } from '../services/storage';

export default function ExportModal({ studyData, onClose, onDataUpdated }) {
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  const handleExport = () => {
    exportDataAsJSON();
    setStatusMsg({ type: 'success', text: 'Đã tải tệp sao lưu JSON về máy tính của bạn!' });
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setStatusMsg({ type: 'error', text: 'Vui lòng dán nội dung tệp JSON vào ô bên dưới.' });
      return;
    }
    const res = importDataFromJSON(importText);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Khôi phục dữ liệu học tập thành công!' });
      onDataUpdated(res.data);
      setTimeout(() => onClose(), 1500);
    } else {
      setStatusMsg({ type: 'error', text: `Lỗi khôi phục: ${res.error}` });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập và ghi chú về ban đầu không?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const completedCount = Object.keys(studyData.completedLessons || {}).length;
  const bookmarksCount = Object.keys(studyData.bookmarkedLessons || {}).length;
  const notesCount = Object.keys(studyData.notes || {}).filter(k => studyData.notes[k]?.trim()).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--emerald-vibrant)" />
            <h3 className="modal-title">Quản Trị Dữ Liệu Học Tập</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current status info */}
        <div style={{
          background: 'var(--bg-card)',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '20px',
          fontSize: '0.86rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
            Dữ liệu hiện tại trên thiết bị này:
          </div>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--emerald-mint)', flexWrap: 'wrap' }}>
            <span>✅ {completedCount} Bài đã học</span>
            <span>⭐ {bookmarksCount} Bài lưu</span>
            <span>📝 {notesCount} Ghi chú</span>
            <span>🔥 Streak {studyData.streak || 1} ngày</span>
          </div>
        </div>

        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--emerald-vibrant)' : 'var(--red)'}`,
            color: statusMsg.type === 'success' ? 'var(--emerald-mint)' : '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {statusMsg.text}
          </div>
        )}

        {/* Action 1: Export */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
            1. Tải Về Tệp Sao Lưu (Export Backup)
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
            style={{ width: '100%', padding: '10px' }}
          >
            <Download size={16} /> Tải Về File Dữ Liệu (.json)
          </button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Lưu tệp này vào máy tính hoặc Google Drive để có thể phục hồi bất kỳ lúc nào.
          </div>
        </div>

        {/* Action 2: Import */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
            2. Khôi Phục Dữ Liệu Từ File (Import Restore)
          </div>
          
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload}
            style={{ marginBottom: '8px', fontSize: '0.84rem' }}
          />

          <textarea 
            placeholder="Hoặc dán mã JSON sao lưu vào đây..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            style={{
              width: '100%',
              height: '80px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'none',
              marginBottom: '10px'
            }}
          />

          <button 
            className="btn btn-outline"
            onClick={handleImport}
            style={{ width: '100%', padding: '9px' }}
          >
            <Upload size={16} /> Khôi Phục Tiến Độ Ngay
          </button>
        </div>

        {/* Action 3: Reset */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleResetData}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} /> Xóa toàn bộ dữ liệu & đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
