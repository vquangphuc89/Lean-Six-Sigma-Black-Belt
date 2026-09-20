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
  Sparkles,
  HelpCircle,
  ArrowDown,
  RotateCcw
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

  // Cuộn trang iframe xuống đúng phần Đấu trường trắc nghiệm
  const scrollToQuiz = () => {
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
      if (iframeDoc) {
        const arena = iframeDoc.querySelector('.interactive-arena') || iframeDoc.querySelector('.quiz-card');
        if (arena) {
          arena.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (e) {
      console.warn('Scroll error:', e);
    }
  };

  // Xác nhận nhanh 100% (dành cho người học đã làm xong 8 câu)
  const handleQuickRecordFullScore = () => {
    if (!lesson) return;
    const total = lesson.quizCount || 8;
    if (onRecordQuizResult) {
      onRecordQuizResult(lesson.id, total, total);
    }
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    // Tự động tick hoàn thành bài học
    if (!studyData.completedLessons[lesson.id] && onToggleComplete) {
      onToggleComplete(lesson.id);
    }

    // Tô xanh các đáp án đúng trong tệp HTML
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
      if (iframeDoc) {
        const quizCards = iframeDoc.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
          const firstCorrectBtn = card.querySelector('.quiz-btn[onclick*="true"]');
          if (firstCorrectBtn) {
            firstCorrectBtn.classList.add('correct');
          }
          const fb = card.querySelector('.quiz-fb');
          if (fb) {
            fb.className = 'quiz-fb show success';
            fb.innerHTML = '<strong>✅ Chính xác! (Đã ghi nhận kết quả vào Đấu Trường &amp; Cloud)</strong>';
          }
        });
      }
    } catch (e) {
      // ignore
    }
  };

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
      if (onAddStudyTime) onAddStudyTime(10);
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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNoteText(val);
    onSaveNote(lesson.id, val);
  };

  // Làm sạch tiêu đề (giải mã &amp;...)
  const cleanTitleDecoded = (lesson.cleanTitle || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return (
    <div className="reader-container">
      {/* Reader Control Header */}
      <div className="reader-header">
        <div className="reader-title-box">
          <div className="reader-breadcrumb">
            {lesson.moduleName} &bull; {lesson.subtopicName}
          </div>
          <h2 className="reader-title">
            Bài {lesson.order}: {cleanTitleDecoded}
          </h2>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Huy hiệu điểm Quiz Header */}
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
              <span>Đề: {quizRecord.percentage}% ({quizRecord.score}/{quizRecord.total})</span>
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

      {/* Interactive Quiz Status & Fast-Action Banner */}
      <div style={{
        background: quizRecord 
          ? 'linear-gradient(90deg, rgba(5, 150, 105, 0.2) 0%, rgba(2, 44, 34, 0.4) 100%)' 
          : 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(2, 44, 34, 0.3) 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '9px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.83rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color={quizRecord ? "var(--emerald-vibrant)" : "#f59e0b"} />
          <span>
            {quizRecord ? (
              <>
                <strong style={{ color: 'var(--emerald-mint)' }}>🎯 Đã Nộp Bài: {quizRecord.score}/{quizRecord.total} câu ({quizRecord.percentage}%)</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>&bull; Đã đồng bộ lên Đấu Trường Luyện Đề &amp; Cloud</span>
              </>
            ) : (
              <>
                <strong style={{ color: '#fbbf24' }}>⚡ Thử Thách Trắc Nghiệm:</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>Bài học có {lesson.quizCount || 8} câu trắc nghiệm thực chiến chuẩn SSMI.</span>
              </>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={scrollToQuiz}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--emerald-mint)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Cuộn trang tới phần 8 câu hỏi trắc nghiệm"
          >
            <ArrowDown size={13} /> Cuộn Tới 8 Câu Hỏi
          </button>

          {/* Nút Ghi nhận nhanh 100% nếu học viên đã làm bài */}
          <button
            onClick={handleQuickRecordFullScore}
            style={{
              background: quizRecord ? 'transparent' : 'var(--emerald-vibrant)',
              border: quizRecord ? '1px solid var(--emerald-vibrant)' : 'none',
              color: quizRecord ? 'var(--emerald-mint)' : '#ffffff',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Xác nhận bạn đã làm bài và lưu kết quả 100% (8/8 câu) vào Đấu Trường Luyện Đề & Cloud"
          >
            <CheckCircle2 size={13} />
            {quizRecord ? 'Cập Nhật Lại 100% (8/8)' : '✅ Lưu Kết Quả 100% (Đã làm 8 câu)'}
          </button>
        </div>
      </div>

      {/* Main Body: Iframe + Slide-in Notes Drawer */}
      <div className="reader-body-wrapper">
        <iframe 
          ref={iframeRef}
          src={lesson.url}
          title={cleanTitleDecoded}
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
