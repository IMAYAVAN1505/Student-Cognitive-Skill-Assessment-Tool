import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) return;
    if ((location.pathname === '/dashboard' || location.pathname === '/dashboard/') && user.role === 'admin') {
      navigate('/admin/users', { replace: true });
    } else if ((location.pathname === '/dashboard' || location.pathname === '/dashboard/') && user.role === 'teacher') {
      navigate('/teacher/subjects', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const studentNav = [
    { to: '/dashboard/profile', label: 'Profile', icon: '👤', end: false },
    { to: '/dashboard', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/dashboard/assessments', label: 'My Assessments', icon: '📝', end: false },
    { to: '/dashboard/reports', label: 'Reports', icon: '📊', end: false },
  ];

  const adminNav = [
    { to: '/admin/users', label: 'Users', icon: '👥', end: true },
    { to: '/admin/profile', label: 'Profile', icon: '👤', end: false },
  ];

  const teacherNav = [
    { to: '/teacher/profile', label: 'Profile', icon: '👤', end: false },
    { to: '/teacher/subjects', label: 'Subjects', icon: '📚', end: true },
    { to: '/teacher/questions', label: 'Questions', icon: '❓', end: false },
    { to: '/teacher/students', label: 'Student', icon: '👨‍🎓', end: false },
  ];

  const nav = user?.role === 'admin' ? adminNav : user?.role === 'teacher' ? teacherNav : studentNav;
  const base = user?.role === 'admin' ? '/admin/users' : user?.role === 'teacher' ? '/teacher/subjects' : '/dashboard';

  return (
    <div className="dashboard-layout">
      {/* Background Glows */}
      <div className="glow-blob glow-1"></div>
      <div className="glow-blob glow-2"></div>
      <div className="glow-blob glow-3"></div>

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <svg viewBox="0 0 24 24" fill="none" className="brand-logo-svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#3b82f6" />
            </svg>
          </div>
          <span className="sidebar-title">Cognitive Assessment</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{icon}</span>
              <span className="sidebar-text">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="dashboard-header">
          <button type="button" className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="header-spacer" />
          <ProfileDropdown />
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
