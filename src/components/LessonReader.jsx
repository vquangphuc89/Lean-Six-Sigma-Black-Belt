import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  BookOpen,
  Sparkles,
  HelpCircle
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
  onAddStudyTime,
  onRecordQuizResult
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const iframeRef = useRef(null);

  // Lấy kết quả quiz đã lưu của bài hiện tại
  const quizRecord = studyData.quizScores ? studyData.quizScores[lesson?.id] : null;

  // Cầu nối giao tiếp 2 chiều với Iframe để tự động bắt kết quả 8 câu trắc nghiệm
  const setupIframeBridge = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !lesson) return;
      const iframeWin = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframeWin?.document;
      if (!iframeWin || !iframeDoc) return;

      const scanAndRecord = () => {
        try {
          const allQuizCards = iframeDoc.querySelectorAll('.quiz-card');
          const total = allQuizCards.length;
          if (total === 0) return;

          const answeredCards = Array.from(allQuizCards).filter(card => 
            card.querySelector('.quiz-btn.correct') || card.querySelector('.quiz-btn.wrong')
          );
          const correctCards = Array.from(allQuizCards).filter(card => 
            card.querySelector('.quiz-btn.correct')
          );

          const score = correctCards.length;
          const answeredCount = answeredCards.length;

          if (answeredCount > 0 && onRecordQuizResult) {
            onRecordQuizResult(lesson.id, score, total);
          }

          if (answeredCount === total && total > 0) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            // Tự động đánh dấu hoàn thành bài học nếu đạt từ 75% trở lên
            if (score / total >= 0.75 && !studyData.completedLessons[lesson.id] && onToggleComplete) {
              onToggleComplete(lesson.id);
            }
          }
        } catch (scanErr) {
          console.warn('Lỗi quét đáp án trong iframe:', scanErr);
        }
      };

      // Quét ngay lập tức nếu đã có đáp án được chọn
      scanAndRecord();

      if (iframeWin.__quizBridgeAttached) return;

      const originalCheckQuiz = iframeWin.checkQuiz;

      // Ghi đè hàm checkQuiz trong iframe để bắt sự kiện mỗi khi học viên click chọn đáp án
      iframeWin.checkQuiz = function(btn, isCorrect, feedbackId, explanationEn, explanationVi) {
        if (typeof originalCheckQuiz === 'function') {
          originalCheckQuiz(btn, isCorrect, feedbackId, explanationEn, explanationVi);
        } else {
          var parent = btn.parentElement;
          var buttons = parent.querySelectorAll('.quiz-btn');
          buttons.forEach(function(b) { b.disabled = true; });
          var feedbackEl = iframeDoc.getElementById(feedbackId);
          if (isCorrect) {
            btn.classList.add('correct');
            if (feedbackEl) {
              feedbackEl.className = 'quiz-fb show success';
              feedbackEl.innerHTML = '<strong>✅ Chính xác! (Master Black Belt Analysis):</strong><br>' + explanationEn + '<br><em style="color:#a7f3d0; display:block; margin-top:4px;">' + explanationVi + '</em>';
            }
          } else {
            btn.classList.add('wrong');
            if (feedbackEl) {
              feedbackEl.className = 'quiz-fb show error';
              feedbackEl.innerHTML = '<strong>❌ Chưa tối ưu (Common Trap):</strong><br>' + explanationEn + '<br><em style="color:#fecaca; display:block; margin-top:4px;">' + explanationVi + '</em>';
            }
          }
        }

        // Chờ DOM cập nhật class rồi tính điểm và lưu
        setTimeout(scanAndRecord, 80);
      };

      iframeWin.__quizBridgeAttached = true;
    } catch (err) {
      console.warn('Iframe bridge error:', err);
    }
  }, [lesson, onRecordQuizResult, onToggleComplete, studyData.completedLessons]);

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

  // Tự động kết nối cầu nối khi bài học thay đổi hoặc iframe load lại
  useEffect(() => {
    const t1 = setTimeout(setupIframeBridge, 500);
    const t2 = setTimeout(setupIframeBridge, 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lesson?.id, setupIframeBridge]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Huy hiệu điểm Quiz */}
          {quizRecord && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: quizRecord.percentage >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${quizRecord.percentage >= 80 ? 'var(--emerald-vibrant)' : 'var(--red)'}`,
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: quizRecord.percentage >= 80 ? 'var(--emerald-mint)' : '#fca5a5'
              }}
              title="Điểm số bài trắc nghiệm đã được ghi nhận tự động vào Đấu Trường Luyện Đề và Cloud!"
            >
              <Sparkles size={14} color={quizRecord.percentage >= 80 ? 'var(--emerald-vibrant)' : '#f87171'} />
              <span>Điểm: {quizRecord.percentage}% ({quizRecord.score}/{quizRecord.total})</span>
            </div>
          )}

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
          onLoad={setupIframeBridge}
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
              <span>Đã lưu vào bộ nhớ &amp; Cloud</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
