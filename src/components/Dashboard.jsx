import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  Clock, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  PlayCircle,
  ShieldCheck,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Pause,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ 
  curriculum, 
  studyData, 
  onSelectLesson, 
  onToggleComplete,
  onAddStudyTime
}) {
  // Pomodoro Timer State
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);

  useEffect(() => {
    let interval = null;
    if (pomodoroRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => prev - 1);
        if (onAddStudyTime) onAddStudyTime(1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setPomodoroRunning(false);
      confetti({ particleCount: 80, spread: 60 });
      alert('🎉 Chúc mừng! Bạn đã hoàn thành phiên tập trung 25 phút!');
      setPomodoroSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroSeconds, onAddStudyTime]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính toán số liệu
  const totalLessons = curriculum.totalLessons || 228;
  const completedCount = Object.keys(studyData.completedLessons || {}).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);
  const bookmarkedCount = Object.keys(studyData.bookmarkedLessons || {}).length;
  const notesCount = Object.keys(studyData.notes || {}).filter(k => studyData.notes[k]?.trim()).length;

  // Điểm thi Quiz trung bình
  const quizScores = Object.values(studyData.quizScores || {});
  const avgQuizScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((acc, q) => acc + (q.percentage || 0), 0) / quizScores.length)
    : 0;

  // Giờ học
  const totalHours = ((studyData.studySeconds || 0) / 3600).toFixed(1);

  // Tìm bài học gần nhất hoặc tiếp theo
  let nextLesson = null;
  for (const mod of curriculum.modules) {
    for (const sub of mod.subtopics) {
      for (const les of sub.lessons) {
        if (!studyData.completedLessons[les.id]) {
          nextLesson = les;
          break;
        }
      }
      if (nextLesson) break;
    }
    if (nextLesson) break;
  }
  if (!nextLesson && curriculum.modules[0]?.subtopics[0]?.lessons[0]) {
    nextLesson = curriculum.modules[0].subtopics[0].lessons[0];
  }

  return (
    <div className="content-scrollable">
      {/* Executive Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--wood-deep) 0%, var(--wood-dark) 60%, var(--water-ocean) 120%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: '16px',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="brand-badge">Dr. Mikel J. Harry • SSMI MindPro</span>
            <span style={{ 
              background: 'rgba(217, 119, 6, 0.2)', 
              border: '1px solid var(--gold-border)',
              color: '#fef08a',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Flame size={13} color="#f59e0b" /> Streak {studyData.streak || 1} Ngày
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.25', marginBottom: '8px' }}>
            Trung Tâm Tự Học Lean Six Sigma Black Belt
          </h1>
          <p style={{ color: 'var(--emerald-mint)', fontStyle: 'italic', fontSize: '1.02rem', marginBottom: '20px' }}>
            "In God we trust, all others must bring data." &mdash; W. Edwards Deming & Dr. Mikel J. Harry
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {nextLesson && (
              <button 
                className="btn btn-primary"
                onClick={() => onSelectLesson(nextLesson)}
                style={{ padding: '10px 22px', fontSize: '0.95rem' }}
              >
                <PlayCircle size={18} />
                Tiếp Tục Học: {nextLesson.cleanTitle}
              </button>
            )}

            {/* Pomodoro Focus Mini Widget */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(2, 44, 34, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 14px',
              borderRadius: '10px'
            }}>
              <Clock size={16} color="var(--emerald-mint)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>
                {formatTimer(pomodoroSeconds)}
              </span>
              <button 
                onClick={() => setPomodoroRunning(!pomodoroRunning)}
                style={{
                  background: pomodoroRunning ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid ' + (pomodoroRunning ? 'var(--red)' : 'var(--emerald-vibrant)'),
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {pomodoroRunning ? <Pause size={12} /> : <Play size={12} />}
                {pomodoroRunning ? 'Dừng' : 'Bắt đầu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Tiến Độ Toàn Khóa</div>
            <div className="stat-value">{progressPercent}%</div>
            <div className="stat-sub">{completedCount} / {totalLessons} bài học hoàn thành</div>
          </div>
          <div className="stat-icon">
            <Award size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Thời Gian Nghiên Cứu</div>
            <div className="stat-value">{totalHours}h</div>
            <div className="stat-sub">{studyData.streak || 1} ngày học liên tục</div>
          </div>
          <div className="stat-icon">
            <Clock size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Điểm Trắc Nghiệm Đa Tầng</div>
            <div className="stat-value">{avgQuizScore > 0 ? `${avgQuizScore}%` : '---'}</div>
            <div className="stat-sub">{quizScores.length} bài test đã nộp</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Sổ Tay & Đánh Dấu</div>
            <div className="stat-value">{bookmarkedCount} ⭐</div>
            <div className="stat-sub">{notesCount} bài có ghi chú cá nhân</div>
          </div>
          <div className="stat-icon">
            <Star size={28} />
          </div>
        </div>
      </div>

      {/* Module Breakdown */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Lộ Trình 4 Phân Hệ Black Belt (Executive Curriculum)
            </h2>
            <p style={{ color: 'var(--emerald-mint)', fontSize: '0.88rem' }}>
              Kiến trúc chuyển đổi chuẩn hóa theo phương pháp luận SSMI & Dr. Mikel J. Harry
            </p>
          </div>
        </div>

        <div className="module-overview-grid">
          {curriculum.modules.map(mod => {
            const modCompleted = mod.subtopics.reduce((acc, sub) => {
              return acc + sub.lessons.filter(l => !!studyData.completedLessons[l.id]).length;
            }, 0);
            const modPercent = Math.round((modCompleted / mod.lessonsCount) * 100);

            // Tìm bài tiếp theo của riêng module này
            let nextInMod = null;
            for (const sub of mod.subtopics) {
              for (const les of sub.lessons) {
                if (!studyData.completedLessons[les.id]) {
                  nextInMod = les;
                  break;
                }
              }
              if (nextInMod) break;
            }

            return (
              <div key={mod.id} className="module-card">
                <div>
                  <div className="module-card-badge">{mod.name.substring(0, 2)} • {mod.subtopicsCount} Chuyên đề</div>
                  <h3 className="module-card-title">{mod.cleanName}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', minHeight: '40px' }}>
                    Bao gồm {mod.lessonsCount} bài học chuyên sâu với công cụ toán học, ma trận và 8 câu trắc nghiệm thực chiến.
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700' }}>
                    <span style={{ color: 'var(--emerald-mint)' }}>Hoàn thành: {modCompleted}/{mod.lessonsCount}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{modPercent}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${modPercent}%` }}></div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.82rem', padding: '7px 12px' }}
                      onClick={() => onSelectLesson(nextInMod || mod.subtopics[0].lessons[0])}
                    >
                      <BookOpen size={14} /> {nextInMod ? 'Học Tiếp' : 'Xem Lại'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarked Lessons Section */}
      {bookmarkedCount > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="var(--gold)" fill="var(--gold)" />
            Các Bài Học Bạn Đã Lưu Để Ôn Tập ({bookmarkedCount})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {curriculum.modules.flatMap(m => m.subtopics.flatMap(s => s.lessons))
              .filter(l => studyData.bookmarkedLessons[l.id])
              .map(les => (
                <div 
                  key={les.id}
                  onClick={() => onSelectLesson(les)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--emerald-vibrant)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ overflow: 'hidden', paddingRight: '12px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {les.cleanTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald-mint)' }}>
                      {les.moduleName} • {les.readTimeMin} phút đọc
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--emerald-vibrant)" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
