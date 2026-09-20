import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  HelpCircle, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle, 
  PlayCircle, 
  RotateCw,
  Search,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PracticeArena({ curriculum, studyData, onSelectLesson, onRecordQuizResult }) {
  const [selectedModule, setSelectedModule] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'submitted' | 'unsubmitted'
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách tất cả bài học
  const allLessons = curriculum.modules.flatMap(m => m.subtopics.flatMap(s => s.lessons));

  // Lọc bài học có quiz
  const filteredLessons = allLessons.filter(les => {
    const matchesMod = selectedModule === 'all' || les.moduleName.startsWith(selectedModule);
    const hasQuizScore = !!(studyData.quizScores && studyData.quizScores[les.id]);
    
    let matchesStatus = true;
    if (statusFilter === 'submitted') matchesStatus = hasQuizScore;
    if (statusFilter === 'unsubmitted') matchesStatus = !hasQuizScore;

    const matchesSearch = !searchTerm || 
      les.cleanTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (les.titleEn && les.titleEn.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMod && matchesStatus && matchesSearch;
  });

  // Thống kê số liệu trắc nghiệm
  const allScores = Object.values(studyData.quizScores || {});
  const totalSubmitted = allScores.length;
  const avgScore = totalSubmitted > 0 
    ? Math.round(allScores.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalSubmitted) 
    : 0;
  const passedCount = allScores.filter(q => (q.percentage || 0) >= 80).length;

  const handleQuickMarkDone = (e, lesson) => {
    e.stopPropagation();
    const total = lesson.quizCount || 8;
    if (onRecordQuizResult) {
      onRecordQuizResult(lesson.id, total, total);
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  return (
    <div className="content-scrollable">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="brand-badge">Trắc Nghiệm Tình Huống &amp; Phản Xạ Nhanh</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Đấu Trường Luyện Đề Đa Tầng (Practice Arena)
        </h1>
        <p style={{ color: 'var(--emerald-mint)', fontSize: '0.92rem' }}>
          Hệ thống thử thách gồm 8 câu hỏi tình huống thực chiến mỗi bài học theo 3 tầng tư duy chuẩn SSMI MindPro.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ĐÃ NỘP BÀI TEST
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--emerald-mint)' }}>
            {totalSubmitted} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {allLessons.length} đề</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ĐIỂM TRUNG BÌNH
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: avgScore >= 80 ? 'var(--emerald-vibrant)' : '#f59e0b' }}>
            {totalSubmitted > 0 ? `${avgScore}%` : '---'}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ĐẠT CHUẨN SSMI (&ge; 80%)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--emerald-vibrant)' }}>
            {passedCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>bài test</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)',
        padding: '14px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${selectedModule === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedModule('all')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Tất Cả 4 Phân Hệ
          </button>
          <button 
            className={`btn ${selectedModule === '01' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedModule('01')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            01. Foundation
          </button>
          <button 
            className={`btn ${selectedModule === '02' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedModule('02')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            02. Breakthrough
          </button>
          <button 
            className={`btn ${selectedModule === '03' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedModule('03')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            03. Business
          </button>
          <button 
            className={`btn ${selectedModule === '04' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedModule('04')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            04. Process
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

          <button 
            className={`btn ${statusFilter === 'submitted' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            Đã Nộp ({totalSubmitted})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--emerald-mint)' }} />
          <input 
            type="text" 
            placeholder="Lọc bài kiểm tra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Grid of Quizzes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredLessons.map(les => {
          const quizRecord = studyData.quizScores ? studyData.quizScores[les.id] : null;
          const cleanTitleDecoded = (les.cleanTitle || '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

          return (
            <div 
              key={les.id}
              className="arena-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                cursor: 'pointer',
                borderColor: quizRecord ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'
              }}
              onClick={() => onSelectLesson(les)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--emerald-vibrant)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = quizRecord ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--emerald-mint)', fontWeight: '700' }}>
                    {les.moduleName.substring(0, 2)} • Bài {les.order}
                  </span>
                  {quizRecord ? (
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: quizRecord.percentage >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: quizRecord.percentage >= 80 ? '#6ee7b7' : '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={13} />
                      Điểm: {quizRecord.percentage}% ({quizRecord.score}/{quizRecord.total})
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                      Chưa nộp bài
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
                  {cleanTitleDecoded}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxHeight: '40px', overflow: 'hidden' }}>
                  {les.titleEn || les.description || 'Bài học tình huống thực chiến chuẩn SSMI MindPro.'}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald-mint)' }}>
                  {les.quizCount > 0 ? `${les.quizCount} câu trắc nghiệm` : '8 câu trắc nghiệm tình huống'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!quizRecord && (
                    <button 
                      className="btn"
                      onClick={(e) => handleQuickMarkDone(e, les)}
                      style={{
                        fontSize: '0.74rem',
                        padding: '4px 8px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--emerald-mint)'
                      }}
                      title="Ghi nhận bạn đã làm bài học này và lưu điểm 100% vào hệ thống"
                    >
                      <Check size={12} /> Đã Làm (100%)
                    </button>
                  )}

                  <button 
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                  >
                    <PlayCircle size={14} /> Vào Làm Đề
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
