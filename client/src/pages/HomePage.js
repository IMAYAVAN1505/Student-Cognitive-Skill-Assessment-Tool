import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/subjects" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/questions" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="home-nav-inner container">
          <div className="home-brand">
            <span className="home-logo">◉</span>
            <span className="home-app-name">Cognitive Skill Assessment</span>
          </div>
          <div className="home-actions">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        </div>
      </nav>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Unlock Your <span>Potential</span></h1>
          <p className="hero-desc">
            Advanced cognitive skill assessment powered by data science.
            Track your progress, identify strengths, and grow with our modern analytics platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>
      <section className="features">
        <div className="container">
          <h2>What you can do</h2>
          <div className="feature-grid">
            <div className="feature-card glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🧠</div>
              <h3>Cognitive Analytics</h3>
              <p>In-depth analysis of memory, focus, and logical reasoning patterns.</p>
            </div>
            <div className="feature-card glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📊</div>
              <h3>Real-time Tracking</h3>
              <p>Visualize your growth with dynamic charts and performance trends.</p>
            </div>
            <div className="feature-card glass-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎯</div>
              <h3>Role-based Tools</h3>
              <p>Admins manage subjects; teachers add questions; students take adaptive tests.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="home-footer">
        <div className="container">© Student Cognitive Skill Assessment Tool</div>
      </footer>
    </div>
  );
}
