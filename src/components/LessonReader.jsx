import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  X, 
  Clock, 
  Share2, 
  Maximize2,
  Minimize2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LessonReader({ 
  lesson, 
  studyData, 
  onToggleComplete, 
  onToggleBookmark, 
  onSaveNote, 
  onNavigatePrev, 
  onNavigateNext,
  hasPrev,
  hasNext,
  onAddStudyTime
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  // Đồng bộ ghi chú của bài học hiện tại
  useEffect(() => {
    if (lesson) {
      setNoteText(studyData.notes[lesson.id] || '');
    }
  }, [lesson, studyData.notes]);

  // Bộ đếm thời gian học tự động khi đang xem bài
  useEffect(() => {
    const timer = setInterval(() => {
      if (onAddStudyTime) onAddStudyTime(10); // Cứ 10 giây ghi nhận vào tổng thời gian học
    }, 10000);
    return () => clearInterval(timer);
  }, [lesson, onAddStudyTime]);

  if (!lesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <p>Vui lòng chọn một bài học từ danh mục bên trái.</p>
      </div>
    );
  }

  const isCompleted = !!studyData.completedLessons[lesson.id];
  const isBookmarked = !!studyData.bookmarkedLessons[lesson.id];

  const handleToggleComplete = () => {
    onToggleComplete(lesson.id);
    if (!isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNoteText(val);
    onSaveNote(lesson.id, val);
  };

  return (
    <div className="reader-container">
      {/* Reader Control Header */}
      <div className="reader-header">
        <div className="reader-title-box">
          <div className="reader-breadcrumb">
            {lesson.moduleName} &bull; {lesson.subtopicName}
          </div>
          <h2 className="reader-title">
            Bài {lesson.order}: {lesson.cleanTitle}
          </h2>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Nút Hoàn thành */}
          <button 
            className={`btn ${isCompleted ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleToggleComplete}
            title={isCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu đã hoàn thành'}
            style={{ fontSize: '0.84rem', padding: '7px 14px' }}
          >
            <CheckCircle2 size={16} />
            {isCompleted ? 'Đã Hoàn Thành' : 'Chưa Hoàn Thành'}
          </button>

          {/* Bookmark */}
          <button 
            className="btn-icon"
            onClick={() => onToggleBookmark(lesson.id)}
            title={isBookmarked ? 'Bỏ lưu bài học' : 'Lưu bài học để ôn tập'}
            style={{ color: isBookmarked ? 'var(--gold)' : 'inherit' }}
          >
            <Star size={18} fill={isBookmarked ? 'var(--gold)' : 'none'} />
          </button>

          {/* Ghi chú cá nhân */}
          <button 
            className={`btn-icon ${showNotes ? 'active' : ''}`}
            onClick={() => setShowNotes(!showNotes)}
            title="Mở sổ tay ghi chú riêng cho bài này"
            style={{ position: 'relative' }}
          >
            <FileText size={18} />
            {noteText.trim() && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--emerald-vibrant)'
              }} />
            )}
          </button>

          {/* Mở trang web độc lập */}
          <a 
            href={lesson.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-icon"
            title="Mở bài học trong tab mới độc lập"
          >
            <ExternalLink size={17} />
          </a>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

          {/* Prev / Next Navigation */}
          <button 
            className="btn-icon" 
            disabled={!hasPrev}
            onClick={onNavigatePrev}
            title="Bài học trước"
            style={{ opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="btn-icon" 
            disabled={!hasNext}
            onClick={onNavigateNext}
            title="Bài học kế tiếp"
            style={{ opacity: hasNext ? 1 : 0.4, cursor: hasNext ? 'pointer' : 'not-allowed' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Body: Iframe + Slide-in Notes Drawer */}
      <div className="reader-body-wrapper">
        <iframe 
          ref={iframeRef}
          src={lesson.url}
          title={lesson.cleanTitle}
          className="reader-frame"
        />

        {/* Notes Drawer */}
        {showNotes && (
          <aside className="notes-drawer">
            <div className="notes-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--emerald-mint)" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Sổ Tay Cá Nhân</span>
              </div>
              <button className="btn-icon" onClick={() => setShowNotes(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '12px 20px', background: 'rgba(2, 44, 34, 0.4)', fontSize: '0.78rem', color: 'var(--emerald-mint)' }}>
              💡 Ghi lại suy nghĩ, công thức tính toán hoặc ý tưởng áp dụng dự án DMAIC tại doanh nghiệp. Dữ liệu được lưu tự động!
            </div>

            <textarea 
              className="notes-editor"
              placeholder="Nhập ghi chú cho bài học này tại đây..."
              value={noteText}
              onChange={handleNoteChange}
            />

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>{noteText.trim() ? `${noteText.trim().split(/\s+/).length} từ` : 'Trống'}</span>
              <span>Đã lưu vào bộ nhớ máy</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
