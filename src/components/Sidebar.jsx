import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Star, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Bookmark, 
  FileText, 
  Sparkles,
  LayoutDashboard,
  Layers,
  Award
} from 'lucide-react';

export default function Sidebar({ 
  curriculum, 
  studyData, 
  activeLesson, 
  onSelectLesson, 
  currentView, 
  setCurrentView,
  isOpen,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'completed' | 'uncompleted' | 'bookmarked'
  const [expandedModules, setExpandedModules] = useState({ 'mod-01': true });
  const [expandedSubtopics, setExpandedSubtopics] = useState({ 'sub-01-01': true });

  // Toggle Module Accordion
  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Toggle Subtopic Accordion
  const toggleSubtopic = (subId) => {
    setExpandedSubtopics(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  // Filter lessons
  const filteredCurriculum = useMemo(() => {
    if (!searchQuery && filterTab === 'all') return curriculum.modules;

    const query = searchQuery.toLowerCase().trim();

    return curriculum.modules.map(mod => {
      const filteredSubtopics = mod.subtopics.map(sub => {
        const filteredLessons = sub.lessons.filter(les => {
          // Lọc theo search query
          const matchesQuery = !query || 
            les.cleanTitle.toLowerCase().includes(query) || 
            (les.titleEn && les.titleEn.toLowerCase().includes(query)) ||
            (les.description && les.description.toLowerCase().includes(query));

          if (!matchesQuery) return false;

          // Lọc theo tab
          const isCompleted = !!studyData.completedLessons[les.id];
          const isBookmarked = !!studyData.bookmarkedLessons[les.id];

          if (filterTab === 'completed') return isCompleted;
          if (filterTab === 'uncompleted') return !isCompleted;
          if (filterTab === 'bookmarked') return isBookmarked;

          return true;
        });

        return { ...sub, lessons: filteredLessons };
      }).filter(sub => sub.lessons.length > 0);

      return { ...mod, subtopics: filteredSubtopics };
    }).filter(mod => mod.subtopics.length > 0);
  }, [curriculum, searchQuery, filterTab, studyData]);

  // Thống kê nhanh
  const totalCompleted = Object.keys(studyData.completedLessons || {}).length;
  const totalLessons = curriculum.totalLessons || 228;
  const progressPercent = Math.round((totalCompleted / totalLessons) * 100);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--wood-dark), var(--emerald))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                MindPro Black Belt
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--emerald-mint)', fontWeight: '600' }}>
                SSMI Executive Standard
              </div>
            </div>
          </div>
          <span className="brand-badge">{progressPercent}% ĐẠT</span>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm trong 228 bài học..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Navigation Views */}
      <div style={{ padding: '8px 14px', display: 'flex', gap: '6px' }}>
        <button 
          className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={15} /> Dashboard
        </button>
        <button 
          className={`nav-tab-btn ${currentView === 'reader' ? 'active' : ''}`}
          onClick={() => setCurrentView('reader')}
        >
          <BookOpen size={15} /> Bài Học
        </button>
        <button 
          className={`nav-tab-btn ${currentView === 'arena' ? 'active' : ''}`}
          onClick={() => setCurrentView('arena')}
        >
          <Sparkles size={15} /> Luyện Đề
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="sidebar-nav-tabs">
        <button 
          className={`nav-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          Tất cả ({totalLessons})
        </button>
        <button 
          className={`nav-tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterTab('completed')}
        >
          Đã học ({totalCompleted})
        </button>
        <button 
          className={`nav-tab-btn ${filterTab === 'bookmarked' ? 'active' : ''}`}
          onClick={() => setFilterTab('bookmarked')}
        >
          ⭐ Lưu ({Object.keys(studyData.bookmarkedLessons || {}).length})
        </button>
      </div>

      {/* Curriculum Accordion Tree */}
      <div className="sidebar-tree">
        {filteredCurriculum.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '0.9rem' }}>Không tìm thấy bài học phù hợp</p>
          </div>
        ) : (
          filteredCurriculum.map(mod => {
            const isModExpanded = expandedModules[mod.id] || searchQuery.length > 0;
            const modCompletedCount = mod.subtopics.reduce((acc, sub) => {
              return acc + sub.lessons.filter(l => !!studyData.completedLessons[l.id]).length;
            }, 0);

            return (
              <div key={mod.id} className="module-accordion">
                {/* Module Header */}
                <div className="module-header" onClick={() => toggleModule(mod.id)}>
                  <div className="module-header-title">
                    <Layers size={16} color="var(--emerald-vibrant)" />
                    <span style={{ fontSize: '0.86rem' }}>{mod.cleanName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--emerald-mint)',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {modCompletedCount}/{mod.lessonsCount}
                    </span>
                    {isModExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                </div>

                {/* Subtopics List */}
                {isModExpanded && (
                  <div>
                    {mod.subtopics.map(sub => {
                      const isSubExpanded = expandedSubtopics[sub.id] || searchQuery.length > 0;
                      return (
                        <div key={sub.id} className="subtopic-item">
                          <div 
                            className="subtopic-header"
                            onClick={() => toggleSubtopic(sub.id)}
                          >
                            <span>{sub.cleanName}</span>
                            {isSubExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          </div>

                          {/* Lessons Links */}
                          {isSubExpanded && (
                            <div>
                              {sub.lessons.map(les => {
                                const isCompleted = !!studyData.completedLessons[les.id];
                                const isBookmarked = !!studyData.bookmarkedLessons[les.id];
                                const hasNote = !!studyData.notes[les.id];
                                const isActive = activeLesson && activeLesson.id === les.id;

                                return (
                                  <div 
                                    key={les.id}
                                    className={`lesson-link ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                      onSelectLesson(les);
                                      if (currentView !== 'reader') setCurrentView('reader');
                                      if (window.innerWidth < 900) onClose();
                                    }}
                                  >
                                    <div className={`lesson-status-icon ${isCompleted ? 'completed' : ''}`}>
                                      {isCompleted && <CheckCircle2 size={12} />}
                                    </div>
                                    <span style={{ 
                                      flex: 1, 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap' 
                                    }}>
                                      {les.order}. {les.cleanTitle}
                                    </span>
                                    {isBookmarked && (
                                      <Star size={13} fill="var(--gold)" color="var(--gold)" />
                                    )}
                                    {hasNote && (
                                      <FileText size={13} color="var(--emerald-mint)" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
