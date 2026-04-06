import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import heroImg from '../assets/hero-illustration.png';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/users" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/subjects" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className="home-nav">
        <div className="home-nav-inner container">
          <Link to="/" className="home-logo">
            Cognitive Assessment
            </Link>
          <div className="home-nav-links">
            <Link to="/login" className="btn btn-signin">SIGN IN</Link>
            <Link to="/register" className="btn btn-signup">SIGN UP</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>Online assessment</h1>
            <p className="hero-description">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. 
              Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, 
              ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
            </p>
            <div className="hero-cta">
              <a href="#features" className="btn btn-dark">Read More</a>
              <Link to="/login" className="btn btn-outline-dark">Sign In</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src={heroImg} alt="Online Assessment Illustration" />
          </div>
        </div>
      </main>
      
      {/* STATS */}
      <section className="stats-section">
        <div className="container stats-inner">
          <div className="stat-box">
            <h3>10k+</h3>
            <p>ACTIVE STUDENTS</p>
          </div>
          <div className="stat-box">
            <h3>500+</h3>
            <p>FACULTY MEMBERS</p>
          </div>
          <div className="stat-box">
            <h3>50+</h3>
            <p>INSTITUTIONS</p>
          </div>
          <div className="stat-box">
            <h3>99.9%</h3>
            <p>SYSTEM UPTIME</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Core Platform Features</h2>
            <p>Everything you need to manage your academic ecosystem efficiently.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">📅</div>
              <h4>Smart Scheduling</h4>
              <p>Automated timetable generation and exam scheduling optimized for resource efficiency.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">📖</div>
              <h4>Material Repository</h4>
              <p>Centralized paperless library for all study materials, courses, and assignments.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">📊</div>
              <h4>Advanced Analytics</h4>
              <p>Real-time tracking of student performance and faculty engagement data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGNED FOR EVERYONE */}
      <section className="everyone-section">
        <div className="container">
          <h2>Designed for Everyone</h2>
          <div className="everyone-grid">
            <div className="everyone-roles">
              <div className="role-item">
                <div className="role-icon">🛡️</div>
                <div className="role-text">
                  <h5>Administrators</h5>
                  <p>Total control over institutional settings, user management, and comprehensive oversight.</p>
                </div>
              </div>
              <div className="role-item">
                <div className="role-icon">👥</div>
                <div className="role-text">
                  <h5>Faculty</h5>
                  <p>Simplified attendance, course management, and direct student engagement tools.</p>
                </div>
              </div>
              <div className="role-item">
                <div className="role-icon">⚡</div>
                <div className="role-text">
                  <h5>Students</h5>
                  <p>One-stop portal for schedules, materials, grades, and academic communication.</p>
                </div>
              </div>
            </div>
            <div className="everyone-cards">
              <div className="ev-card">
                <span className="check-icon">✓</span>
                <span>Paperless Operation</span>
              </div>
              <div className="ev-card">
                <span className="check-icon blue">✓</span>
                <span>Secure Access</span>
              </div>
              <div className="ev-card">
                <span className="check-icon">✓</span>
                <span>Automated Sync</span>
              </div>
              <div className="ev-card">
                <span className="check-icon yellow">✓</span>
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUSTAINABLE BANNER */}
      <section className="sustainable-banner">
        <div className="container banner-inner">
          <div className="banner-icon">🌿</div>
          <h2>"Towards Sustainable Academic excellence"</h2>
          <p>Cognitive Assessment helps institutions reduce their carbon footprint by digitizing administrative workflows and academic resources.</p>
          <div className="banner-stats">
            <div className="b-stat">
              <h4>~65%</h4>
              <p>PAPER REDUCTION</p>
            </div>
            <div className="b-stat">
              <h4>40%</h4>
              <p>TIME EFFICIENCY</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to modernize your institution?</h2>
          <p>Join the growing community of institutions embracing sustainable management with Cognitive Assessment.</p>
          <Link to="/login" className="btn btn-primary cta-btn">Sign In Now</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">cognitive assessment</div>
            <p>Sustainable Academic Operations Platform</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h6>Features</h6>
              <Link to="/">Overview</Link>
              <Link to="/">Documentation</Link>
              <Link to="/">API</Link>
            </div>
            <div className="footer-col">
              <h6>Resources</h6>
              <Link to="/">Blog</Link>
              <Link to="/">Community</Link>
              <Link to="/">Support</Link>
            </div>
            <div className="footer-col">
              <h6>Legal</h6>
              <Link to="/">Privacy</Link>
              <Link to="/">Terms</Link>
              <Link to="/">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>© 2024 Sustainable Academic Operations Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}