import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  PlayCircle, 
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';

export default function PracticeArena({ curriculum, studyData, onSelectLesson }) {
  const [selectedModule, setSelectedModule] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unsubmitted' | 'passed' | 'review'
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách tất cả bài học
  const allLessons = curriculum.modules.flatMap(m => m.subtopics.flatMap(s => s.lessons));

  // Lọc bài học theo phân hệ, trạng thái và tìm kiếm
  const filteredLessons = allLessons.filter(les => {
    const matchesMod = selectedModule === 'all' || les.moduleName.startsWith(selectedModule);
    const quizRecord = studyData.quizScores ? studyData.quizScores[les.id] : null;
    
    let matchesStatus = true;
    if (statusFilter === 'unsubmitted') matchesStatus = !quizRecord;
    if (statusFilter === 'passed') matchesStatus = quizRecord && quizRecord.percentage >= 80;
    if (statusFilter === 'review') matchesStatus = quizRecord && quizRecord.percentage < 80;

    const matchesSearch = !searchTerm || 
      les.cleanTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (les.titleEn && les.titleEn.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMod && matchesStatus && matchesSearch;
  });

  // Thống kê số liệu trắc nghiệm
  const allScores = Object.values(studyData.quizScores || {});
  const totalSubmitted = allScores.length;
  const passedCount = allScores.filter(q => (q.percentage || 0) >= 80).length;
  const reviewCount = allScores.filter(q => (q.percentage || 0) < 80).length;
  const unsubmittedCount = allLessons.length - totalSubmitted;
  const avgScore = totalSubmitted > 0 
    ? Math.round(allScores.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalSubmitted) 
    : 0;

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

      {/* KPI Stats Bar - 3 Trạng Thái Chuẩn Hóa */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* 1. Chưa nộp bài - Màu Cam */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'unsubmitted' ? 'all' : 'unsubmitted')}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${statusFilter === 'unsubmitted' ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)'}`,
            padding: '16px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700', marginBottom: '4px' }}>
            <Clock size={14} /> CHƯA NỘP BÀI
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b' }}>
            {unsubmittedCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>đề thi</span>
          </div>
        </div>

        {/* 2. Hoàn thành (>= 80%) - Màu Xanh Lá */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'passed' ? 'all' : 'passed')}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${statusFilter === 'passed' ? 'var(--emerald-vibrant)' : 'rgba(16, 185, 129, 0.4)'}`,
            padding: '16px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--emerald-mint)', fontWeight: '700', marginBottom: '4px' }}>
            <CheckCircle2 size={14} /> HOÀN THÀNH (&ge; 80%)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--emerald-vibrant)' }}>
            {passedCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>đề đạt chuẩn</span>
          </div>
        </div>

        {/* 3. Cần ôn lại (< 80%) - Màu Đỏ */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'review' ? 'all' : 'review')}
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${statusFilter === 'review' ? '#ef4444' : 'rgba(239, 68, 68, 0.4)'}`,
            padding: '16px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#fca5a5', fontWeight: '700', marginBottom: '4px' }}>
            <AlertCircle size={14} /> CẦN ÔN LẠI (&lt; 80%)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>
            {reviewCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>đề cần ôn</span>
          </div>
        </div>

        {/* Điểm trung bình */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px 20px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ĐIỂM TRUNG BÌNH TÍCH LŨY
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: avgScore >= 80 ? 'var(--emerald-vibrant)' : (totalSubmitted === 0 ? 'var(--text-secondary)' : '#f59e0b') }}>
            {totalSubmitted > 0 ? `${avgScore}%` : '---'}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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

          {/* Lọc nhanh theo 3 trạng thái */}
          <button 
            className="btn"
            onClick={() => setStatusFilter(statusFilter === 'passed' ? 'all' : 'passed')}
            style={{ 
              fontSize: '0.8rem', 
              padding: '6px 12px',
              background: statusFilter === 'passed' ? 'var(--emerald-vibrant)' : 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--emerald-vibrant)',
              color: statusFilter === 'passed' ? '#ffffff' : 'var(--emerald-mint)',
              fontWeight: '700'
            }}
          >
            ✅ Hoàn thành ({passedCount})
          </button>
          <button 
            className="btn"
            onClick={() => setStatusFilter(statusFilter === 'review' ? 'all' : 'review')}
            style={{ 
              fontSize: '0.8rem', 
              padding: '6px 12px',
              background: statusFilter === 'review' ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              color: statusFilter === 'review' ? '#ffffff' : '#fca5a5',
              fontWeight: '700'
            }}
          >
            ⚠️ Cần ôn lại ({reviewCount})
          </button>
          <button 
            className="btn"
            onClick={() => setStatusFilter(statusFilter === 'unsubmitted' ? 'all' : 'unsubmitted')}
            style={{ 
              fontSize: '0.8rem', 
              padding: '6px 12px',
              background: statusFilter === 'unsubmitted' ? '#f59e0b' : 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: statusFilter === 'unsubmitted' ? '#ffffff' : '#fbbf24',
              fontWeight: '700'
            }}
          >
            ⏳ Chưa nộp ({unsubmittedCount})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
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

          // Xác định 3 trạng thái chuẩn:
          // 1. Hoàn thành: >= 80% (Xanh lá)
          // 2. Cần ôn lại: < 80% (Đỏ)
          // 3. Chưa nộp bài: (Cam)
          const isPassed = quizRecord && quizRecord.percentage >= 80;
          const isReview = quizRecord && quizRecord.percentage < 80;
          const isUnsubmitted = !quizRecord;

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
                borderColor: isPassed 
                  ? 'rgba(16, 185, 129, 0.5)' 
                  : (isReview ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.25)')
              }}
              onClick={() => onSelectLesson(les)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = isPassed ? 'var(--emerald-vibrant)' : (isReview ? '#ef4444' : '#f59e0b')}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = isPassed ? 'rgba(16, 185, 129, 0.5)' : (isReview ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.25)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--emerald-mint)', fontWeight: '700' }}>
                    {les.subtopicName}
                  </span>

                  {/* 3 Trạng Thái Hiển Thị Chuẩn Hóa Theo Yêu Cầu */}
                  {isPassed && (
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid var(--emerald-vibrant)',
                      color: 'var(--emerald-mint)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={13} color="var(--emerald-vibrant)" />
                      Hoàn thành ({quizRecord.percentage}%)
                    </span>
                  )}

                  {isReview && (
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertCircle size={13} color="#f87171" />
                      Cần ôn lại ({quizRecord.percentage}%)
                    </span>
                  )}

                  {isUnsubmitted && (
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} color="#fbbf24" />
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
                  <button 
                    className="btn btn-outline"
                    style={{ 
                      fontSize: '0.78rem', 
                      padding: '6px 14px',
                      borderColor: isPassed ? 'rgba(16, 185, 129, 0.4)' : (isReview ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)')
                    }}
                  >
                    <PlayCircle size={14} /> {isUnsubmitted ? 'Vào Làm Đề' : (isPassed ? 'Xem Lại / Thi Lại' : 'Ôn Luyện Lại')}
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
