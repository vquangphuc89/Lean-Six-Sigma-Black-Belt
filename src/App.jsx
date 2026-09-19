import React, { useState, useEffect, useMemo } from 'react';
import curriculumData from './data/curriculum.json';
import { 
  getStudyData, 
  toggleCompleteLesson, 
  toggleBookmarkLesson, 
  saveLessonNote, 
  setActiveLesson, 
  addStudyTime, 
  getAppTheme, 
  setAppTheme 
} from './services/storage';

import { getCurrentUser } from './services/auth';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonReader from './components/LessonReader';
import PracticeArena from './components/PracticeArena';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';

import { 
  Award, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Database, 
  BookOpen, 
  LayoutDashboard, 
  Sparkles,
  ChevronRight,
  Flame,
  User,
  LogIn
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [studyData, setStudyData] = useState(() => getStudyData());
  const [theme, setTheme] = useState(() => getAppTheme());
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'reader' | 'arena'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Flatten all lessons into linear list for easy prev/next navigation
  const allLessons = useMemo(() => {
    return curriculumData.modules.flatMap(m => m.subtopics.flatMap(s => s.lessons));
  }, []);

  // Current active lesson state
  const [activeLesson, setActiveLessonState] = useState(() => {
    const savedId = studyData.activeLessonId;
    const found = allLessons.find(l => l.id === savedId);
    return found || allLessons[0];
  });

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setAppTheme(newTheme);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    // Reload study data specifically for this user
    setStudyData(getStudyData());
  };

  const handleLogout = () => {
    setUser(null);
    setStudyData(getStudyData());
  };

  const handleSelectLesson = (lesson) => {
    setActiveLessonState(lesson);
    setActiveLesson(lesson.id);
    setStudyData(getStudyData());
    setCurrentView('reader');
  };

  const handleToggleComplete = (lessonId) => {
    const updated = toggleCompleteLesson(lessonId);
    setStudyData({ ...updated });
  };

  const handleToggleBookmark = (lessonId) => {
    const updated = toggleBookmarkLesson(lessonId);
    setStudyData({ ...updated });
  };

  const handleSaveNote = (lessonId, text) => {
    const updated = saveLessonNote(lessonId, text);
    setStudyData({ ...updated });
  };

  const handleAddStudyTime = (sec) => {
    const updated = addStudyTime(sec);
    setStudyData({ ...updated });
  };

  // Prev / Next index
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrev) {
      handleSelectLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      handleSelectLesson(allLessons[currentIndex + 1]);
    }
  };

  // Progress metrics for header
  const completedCount = Object.keys(studyData.completedLessons || {}).length;
  const totalLessons = allLessons.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        curriculum={curriculumData}
        studyData={studyData}
        activeLesson={activeLesson}
        onSelectLesson={handleSelectLesson}
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Top Header */}
        <header className="top-nav">
          <div className="nav-brand">
            <button 
              className="btn-icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: window.innerWidth < 900 ? 'flex' : 'none' }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="brand-title">
              <Award size={22} color="var(--emerald-vibrant)" />
              <span>Lean Six Sigma</span> Black Belt Masterclass
            </div>
          </div>

          {/* Center Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCurrentView('dashboard')}
              style={{ fontSize: '0.84rem', padding: '6px 14px' }}
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>
            <button 
              className={`btn ${currentView === 'reader' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCurrentView('reader')}
              style={{ fontSize: '0.84rem', padding: '6px 14px' }}
            >
              <BookOpen size={15} /> Bài Học
            </button>
            <button 
              className={`btn ${currentView === 'arena' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCurrentView('arena')}
              style={{ fontSize: '0.84rem', padding: '6px 14px' }}
            >
              <Sparkles size={15} /> Luyện Đề
            </button>
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Streak & Progress */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--border-color)',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--emerald-mint)'
            }}>
              <Flame size={14} color="#f59e0b" />
              <span>{progressPercent}%</span>
              <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>({completedCount}/{totalLessons})</span>
            </div>

            {/* Backup / Export Data Modal */}
            <button 
              className="btn-icon" 
              onClick={() => setShowExportModal(true)}
              title="Sao lưu hoặc khôi phục dữ liệu học tập"
            >
              <Database size={17} />
            </button>

            {/* Theme Toggle */}
            <button 
              className="btn-icon" 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Account / Profile Area */}
            {user ? (
              <div 
                onClick={() => setShowProfileModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--emerald-vibrant)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                title="Xem hồ sơ cá nhân và cài đặt tài khoản"
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: user.avatarBg || 'var(--emerald)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  fontWeight: '800'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--emerald-mint)' }}>
                    {user.beltTrack?.split(' ')[0] || 'Black'} Belt
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setShowAuthModal(true)}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <LogIn size={15} /> Đăng Nhập
              </button>
            )}
          </div>
        </header>

        {/* User Login Banner on Dashboard if not logged in */}
        {!user && currentView === 'dashboard' && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(5, 150, 105, 0.2) 0%, rgba(2, 44, 34, 0.4) 100%)',
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--emerald-mint)' }}>
              <Sparkles size={16} color="var(--emerald-vibrant)" />
              <span>
                Đăng nhập tài khoản để lưu giữ tiến độ cá nhân, sổ tay ghi chú và chứng chỉ của bạn!
              </span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background: 'var(--emerald-vibrant)',
                border: 'none',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Đăng Nhập Ngay
            </button>
          </div>
        )}

        {/* View Switcher */}
        {currentView === 'dashboard' && (
          <Dashboard 
            curriculum={curriculumData}
            studyData={studyData}
            onSelectLesson={handleSelectLesson}
            onToggleComplete={handleToggleComplete}
            onAddStudyTime={handleAddStudyTime}
          />
        )}

        {currentView === 'reader' && (
          <LessonReader 
            lesson={activeLesson}
            studyData={studyData}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onSaveNote={handleSaveNote}
            onNavigatePrev={handleNavigatePrev}
            onNavigateNext={handleNavigateNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onAddStudyTime={handleAddStudyTime}
          />
        )}

        {currentView === 'arena' && (
          <PracticeArena 
            curriculum={curriculumData}
            studyData={studyData}
            onSelectLesson={handleSelectLesson}
          />
        )}
      </div>

      {/* Backup / Restore Modal */}
      {showExportModal && (
        <ExportModal 
          studyData={studyData}
          onClose={() => setShowExportModal(false)}
          onDataUpdated={(newData) => setStudyData(newData)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && user && (
        <UserProfileModal 
          user={user}
          studyData={studyData}
          onClose={() => setShowProfileModal(false)}
          onUserUpdated={(updatedUser) => setUser(updatedUser)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
