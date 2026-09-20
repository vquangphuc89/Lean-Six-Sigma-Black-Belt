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
  RotateCcw,
  Clock,
  AlertCircle
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

  // Cầu nối giao tiếp 2 chiều với Iframe để thực thi Chế độ Thi & Nộp Bài (Submit Mode)
  const setupIframeBridge = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !lesson) return;
      const iframeWin = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframeWin?.document;
      if (!iframeWin || !iframeDoc) return;

      const allQuizCards = iframeDoc.querySelectorAll('.quiz-card');
      const total = allQuizCards.length;
      if (total === 0) return;

      // 1. Tiêm CSS cho chế độ Chọn Đáp Án & Nút Nộp Bài
      if (!iframeDoc.getElementById('quiz-exam-styles')) {
        const styleEl = iframeDoc.createElement('style');
        styleEl.id = 'quiz-exam-styles';
        styleEl.textContent = `
          .quiz-btn.selected {
            background: rgba(16, 185, 129, 0.28) !important;
            border-color: #34d399 !important;
            box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.4) !important;
            color: #ffffff !important;
            font-weight: 700 !important;
          }
          .quiz-btn.correct-answer-hint {
            border: 2px dashed #34d399 !important;
            background: rgba(16, 185, 129, 0.12) !important;
            color: #d1fae5 !important;
          }
          .quiz-btn.correct-answer-hint::after {
            content: " ★ (Đáp án đúng SSMI)";
            color: #34d399;
            font-weight: 800;
            font-size: 0.8rem;
          }
          .quiz-submit-container {
            background: linear-gradient(135deg, rgba(2, 44, 34, 0.95), rgba(6, 78, 59, 0.95));
            border: 2px solid var(--emerald-vibrant, #10b981);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0 24px 0;
            text-align: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          }
          .quiz-submit-btn {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: #ffffff;
            border: none;
            padding: 13px 36px;
            font-size: 1.05rem;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
            font-family: inherit;
          }
          .quiz-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
          }
          .quiz-retake-btn {
            background: rgba(16, 185, 129, 0.15);
            color: #6ee7b7;
            border: 1px solid #10b981;
            padding: 10px 24px;
            font-size: 0.92rem;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 14px;
          }
          .quiz-retake-btn:hover {
            background: rgba(16, 185, 129, 0.3);
            color: #ffffff;
          }
        `;
        iframeDoc.head.appendChild(styleEl);
      }

      // 2. Tạo hoặc tìm khung Nộp Bài (Submit Container)
      let submitBox = iframeDoc.getElementById('quiz-submit-container');
      if (!submitBox) {
        submitBox = iframeDoc.createElement('div');
        submitBox.id = 'quiz-submit-container';
        submitBox.className = 'quiz-submit-container';
        const lastCard = allQuizCards[allQuizCards.length - 1];
        lastCard.parentNode.insertBefore(submitBox, lastCard.nextSibling);
      }

      // 3. Hàm hiển thị Kết quả sau khi Nộp Bài
      const renderResultView = (score, totalCount, percentage) => {
        const isPassed = percentage >= 80;
        submitBox.innerHTML = `
          <div style="border-radius: 12px; padding: 20px; background: ${isPassed ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)'}; border: 1px solid ${isPassed ? '#10b981' : '#ef4444'}; text-align: center;">
            <div style="font-size: 1.35rem; font-weight: 800; color: ${isPassed ? '#6ee7b7' : '#fca5a5'}; margin-bottom: 6px;">
              ${isPassed ? '🎉 HOÀN THÀNH ĐẠT CHUẨN SSMI (≥ 80%)' : '⚠️ CẦN ÔN LUYỆN LẠI (< 80%)'}
            </div>
            <div style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
              Kết quả: <span style="color: ${isPassed ? '#34d399' : '#f87171'}; font-size: 1.35rem;">${score} / ${totalCount} câu (${percentage}%)</span>
            </div>
            <p style="color: ${isPassed ? '#a7f3d0' : '#fecaca'}; font-size: 0.88rem; margin: 0 auto 16px auto; max-width: 600px; line-height: 1.5;">
              ${isPassed 
                ? 'Xuất sắc! Bạn đã đạt yêu cầu từ 80% trở lên của phân cấp Master Black Belt. Kết quả đã được đồng bộ lên Đấu Trường Luyện Đề & Cloud!'
                : 'Điểm số dưới 80%. Bạn hãy đọc kỹ phần giải thích Master Black Belt ở từng câu hỏi phía trên để củng cố kiến thức trước khi làm lại.'
              }
            </p>
            <button id="btn-quiz-retake" class="quiz-retake-btn">
              🔄 Làm Lại Bài Thi (Retake Exam)
            </button>
          </div>
        `;
        const retakeBtn = submitBox.querySelector('#btn-quiz-retake');
        if (retakeBtn) {
          retakeBtn.onclick = resetExam;
        }
      };

      // 4. Hàm làm lại bài thi (Reset Exam)
      const resetExam = () => {
        iframeWin.__examSubmitted = false;
        allQuizCards.forEach(card => {
          delete card._selectedData;
          const buttons = card.querySelectorAll('.quiz-btn');
          buttons.forEach(b => {
            b.disabled = false;
            b.classList.remove('selected', 'correct', 'wrong', 'correct-answer-hint');
          });
          const fbs = card.querySelectorAll('.quiz-fb');
          fbs.forEach(fb => {
            fb.className = 'quiz-fb';
            fb.innerHTML = '';
          });
        });
        renderSubmitBar();
        const firstCard = allQuizCards[0];
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      // 5. Hàm thực thi Nộp Bài (Submit Exam)
      const submitExam = () => {
        const answered = Array.from(allQuizCards).filter(c => c._selectedData).length;
        if (answered < total) {
          const confirmSubmit = iframeWin.confirm(
            `Bạn mới chọn ${answered}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?`
          );
          if (!confirmSubmit) return;
        }

        iframeWin.__examSubmitted = true;
        let score = 0;

        allQuizCards.forEach(card => {
          const buttons = card.querySelectorAll('.quiz-btn');
          buttons.forEach(b => { b.disabled = true; });

          if (card._selectedData) {
            const { btn, isCorrect, feedbackId, explanationEn, explanationVi } = card._selectedData;
            const feedbackEl = iframeDoc.getElementById(feedbackId);

            if (isCorrect) {
              score++;
              btn.classList.add('correct');
              if (feedbackEl) {
                feedbackEl.className = 'quiz-fb show success';
                feedbackEl.innerHTML = '<strong>✅ Chính xác! (Master Black Belt Analysis):</strong><br>' + 
                  explanationEn + '<br><em style="color:#a7f3d0; display:block; margin-top:4px;">' + explanationVi + '</em>';
              }
            } else {
              btn.classList.add('wrong');
              const correctBtn = card.querySelector('.quiz-btn[onclick*="true"]');
              if (correctBtn && correctBtn !== btn) {
                correctBtn.classList.add('correct-answer-hint');
              }
              if (feedbackEl) {
                feedbackEl.className = 'quiz-fb show error';
                feedbackEl.innerHTML = '<strong>❌ Chưa tối ưu (Common Trap):</strong><br>' + 
                  explanationEn + '<br><em style="color:#fecaca; display:block; margin-top:4px;">' + explanationVi + '</em>';
              }
            }
          } else {
            const correctBtn = card.querySelector('.quiz-btn[onclick*="true"]');
            if (correctBtn) correctBtn.classList.add('correct-answer-hint');
            const firstFb = card.querySelector('.quiz-fb');
            if (firstFb) {
              firstFb.className = 'quiz-fb show error';
              firstFb.innerHTML = '<strong>⚠️ Chưa chọn đáp án:</strong> Vui lòng xem đáp án đúng phía trên.';
            }
          }
        });

        const percentage = Math.round((score / total) * 100);
        renderResultView(score, total, percentage);

        if (onRecordQuizResult) {
          onRecordQuizResult(lesson.id, score, total);
        }

        if (percentage >= 80) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          if (!studyData.completedLessons[lesson.id] && onToggleComplete) {
            onToggleComplete(lesson.id);
          }
        }
      };

      // 6. Hàm hiển thị Thanh Nộp Bài trước khi nộp
      const renderSubmitBar = () => {
        const answered = Array.from(allQuizCards).filter(c => c._selectedData).length;
        submitBox.innerHTML = `
          <div style="font-size: 0.95rem; color: #a7f3d0; margin-bottom: 12px; font-weight: 600;">
            Tiến độ: <strong style="color: #ffffff; font-size: 1.15rem;">${answered} / ${total}</strong> câu đã chọn
          </div>
          <button id="btn-quiz-submit-exam" class="quiz-submit-btn">
            🚀 NỘP BÀI (SUBMIT EXAM)
          </button>
          <div style="color: #6ee7b7; font-size: 0.78rem; margin-top: 10px; font-style: italic;">
            Sau khi bấm Nộp bài, hệ thống sẽ chấm điểm và hiển thị giải thích chi tiết đúng/sai của từng câu.
          </div>
        `;
        const submitBtn = submitBox.querySelector('#btn-quiz-submit-exam');
        if (submitBtn) {
          submitBtn.onclick = submitExam;
        }
      };

      // 7. Nếu học viên đã có kết quả trước đó, hiển thị trạng thái đã nộp kèm giải thích
      if (quizRecord) {
        iframeWin.__examSubmitted = true;
        allQuizCards.forEach(card => {
          const buttons = card.querySelectorAll('.quiz-btn');
          buttons.forEach(b => { b.disabled = true; });
          const correctBtn = card.querySelector('.quiz-btn[onclick*="true"]');
          if (correctBtn) {
            correctBtn.classList.add('correct');
          }
          const fb = card.querySelector('.quiz-fb');
          if (fb) {
            fb.className = 'quiz-fb show success';
            fb.innerHTML = '<strong>✅ Đáp án chuẩn (Master Black Belt Standard):</strong><br>Kết quả bài thi đã được ghi nhận trên hệ thống.';
          }
        });
        renderResultView(quizRecord.score, quizRecord.total, quizRecord.percentage);
      } else {
        renderSubmitBar();
      }

      // 8. Ghi đè hàm checkQuiz trong iframe thành Chế độ Chọn (Selection Mode)
      iframeWin.checkQuiz = function(btn, isCorrect, feedbackId, explanationEn, explanationVi) {
        if (iframeWin.__examSubmitted) return;

        var card = btn.closest('.quiz-card');
        if (!card) return;

        var siblingButtons = card.querySelectorAll('.quiz-btn');
        siblingButtons.forEach(function(b) {
          b.classList.remove('selected');
        });

        btn.classList.add('selected');

        card._selectedData = {
          btn: btn,
          isCorrect: isCorrect,
          feedbackId: feedbackId,
          explanationEn: explanationEn,
          explanationVi: explanationVi
        };

        renderSubmitBar();
      };

      iframeWin.__quizBridgeAttached = true;
    } catch (err) {
      console.warn('Iframe bridge error:', err);
    }
  }, [lesson, onRecordQuizResult, onToggleComplete, quizRecord, studyData.completedLessons]);

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
          {/* Huy hiệu điểm Quiz Header theo 3 trạng thái */}
          {!quizRecord && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#fbbf24'
              }}
              title="Chưa nộp bài trắc nghiệm cho bài học này"
            >
              <Clock size={13} color="#fbbf24" />
              <span>Chưa nộp bài</span>
            </div>
          )}

          {quizRecord && quizRecord.percentage >= 80 && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--emerald-vibrant)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '800',
                color: 'var(--emerald-mint)'
              }}
              title="Đã hoàn thành đạt chuẩn SSMI (>= 80%)"
            >
              <CheckCircle2 size={13} color="var(--emerald-vibrant)" />
              <span>Hoàn thành ({quizRecord.percentage}%)</span>
            </div>
          )}

          {quizRecord && quizRecord.percentage < 80 && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '800',
                color: '#fca5a5'
              }}
              title="Điểm dưới 80%, cần ôn luyện lại"
            >
              <AlertCircle size={13} color="#f87171" />
              <span>Cần ôn lại ({quizRecord.percentage}%)</span>
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

      {/* Interactive Quiz Status & Fast-Action Banner - 3 Trạng Thái Chuẩn Hóa */}
      <div style={{
        background: !quizRecord
          ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(2, 44, 34, 0.3) 100%)'
          : (quizRecord.percentage >= 80 
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(2, 44, 34, 0.4) 100%)'
              : 'linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(2, 44, 34, 0.4) 100%)'),
        borderBottom: `1px solid ${!quizRecord ? 'rgba(245, 158, 11, 0.35)' : (quizRecord.percentage >= 80 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)')}`,
        padding: '9px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.83rem'
      }}>
        {/* 1. Chưa nộp bài - Màu Cam */}
        {!quizRecord && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#fbbf24" />
              <span>
                <strong style={{ color: '#fbbf24' }}>⏳ Chưa nộp bài:</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  Bài học có {lesson.quizCount || 8} câu hỏi trắc nghiệm tình huống chuẩn SSMI. Hãy cuộn xuống để làm bài.
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={scrollToQuiz}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.6)',
                  color: '#fbbf24',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Cuộn trang tới phần câu hỏi trắc nghiệm"
              >
                <ArrowDown size={13} /> Làm Bài Trắc Nghiệm
              </button>
            </div>
          </>
        )}

        {/* 2. Hoàn thành (>= 80%) - Màu Xanh Lá */}
        {quizRecord && quizRecord.percentage >= 80 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--emerald-vibrant)" />
              <span>
                <strong style={{ color: 'var(--emerald-mint)' }}>
                  ✅ Hoàn thành: {quizRecord.score}/{quizRecord.total} câu ({quizRecord.percentage}%)
                </strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  &bull; Đạt chuẩn SSMI (&ge; 80%) &bull; Đã đồng bộ Cloud
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={scrollToQuiz}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--emerald-vibrant)',
                  color: 'var(--emerald-mint)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Xem lại hoặc làm lại trắc nghiệm"
              >
                <RotateCcw size={13} /> Xem Lại / Làm Lại
              </button>
            </div>
          </>
        )}

        {/* 3. Cần ôn lại (< 80%) - Màu Đỏ */}
        {quizRecord && quizRecord.percentage < 80 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#f87171" />
              <span>
                <strong style={{ color: '#fca5a5' }}>
                  ⚠️ Cần ôn lại: {quizRecord.score}/{quizRecord.total} câu ({quizRecord.percentage}%)
                </strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  &bull; Dưới chuẩn 80%. Hãy làm lại câu hỏi để nâng cao kết quả.
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={scrollToQuiz}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Làm lại các câu hỏi trắc nghiệm"
              >
                <RotateCcw size={13} /> Làm Lại Đề Thi
              </button>
            </div>
          </>
        )}
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
