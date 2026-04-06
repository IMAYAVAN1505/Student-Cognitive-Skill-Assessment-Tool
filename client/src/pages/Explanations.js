import React from 'react';
import { Link } from 'react-router-dom';
import './Explanations.css';

export default function Explanations() {
    return (
        <div className="explanations-page">
            <nav className="home-nav">
                <div className="home-nav-inner container">
                    <Link to="/" className="home-logo-box">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" />
                            </svg>
                        </div>
                        <span className="home-app-name">Cognitive<span className="name-accent">AI</span></span>
                    </Link>
                    <div className="home-actions">
                        <Link to="/" className="btn btn-ghost">Back to Home</Link>
                        <Link to="/register" className="btn btn-primary">Get Started →</Link>
                    </div>
                </div>
            </nav>

            <div className="container explanations-content">
                <header className="explanations-header">
                    <div className="section-label">Detailed Insights</div>
                    <h1>How Cognitive AI <span className="section-highlight">Works</span></h1>
                    <p className="hero-desc">Explore the advanced technology and methodology behind our cognitive assessment platform.</p>
                </header>

                <div className="explanation-section glass-card" id="neural-analytics">
                    <div className="explanation-icon-wrap feature-icon-wrap--1">
                        <span className="feature-icon">🧠</span>
                    </div>
                    <div className="explanation-text">
                        <h2>Neural Analytics Engine</h2>
                        <p>Our proprietary AI engine uses deep learning models to analyze student performance data beyond simple correct/incorrect answers. We track:</p>
                        <ul>
                            <li><strong>Memory Retention:</strong> Analyzing recall patterns over time to identify long-term knowledge gaps.</li>
                            <li><strong>Focus Dynamics:</strong> Measuring engagement levels and attention spans through interactive assessment modules.</li>
                            <li><strong>Logical Reasoning:</strong> Evaluating the step-by-step problem-solving process to understand cognitive strategy.</li>
                        </ul>
                    </div>
                </div>

                <div className="explanation-section glass-card" id="performance-tracking">
                    <div className="explanation-icon-wrap feature-icon-wrap--2">
                        <span className="feature-icon">⚡</span>
                    </div>
                    <div className="explanation-text">
                        <h2>Real-time Performance Metrics</h2>
                        <p>Instant feedback is crucial for growth. Our platform provides a low-latency analytics dashboard that updates as soon as an assessment is completed.</p>
                        <ul>
                            <li><strong>Dynamic Charts:</strong> Interactive visualizations that help identify trends in cognitive development.</li>
                            <li><strong>Actionable Insights:</strong> Automated recommendations for subjects and skills that need more attention.</li>
                            <li><strong>Comparative Analysis:</strong> Benchmarking individual growth against historical performance and peer averages.</li>
                        </ul>
                    </div>
                </div>

                <div className="explanation-section glass-card" id="institutional-grade">
                    <div className="explanation-icon-wrap feature-icon-wrap--3">
                        <span className="feature-icon">🛡️</span>
                    </div>
                    <div className="explanation-text">
                        <h2>Institutional-Grade Infrastructure</h2>
                        <p>Built for scale and security, Cognitive AI provides robust administrative tools for educational institutions of all sizes.</p>
                        <ul>
                            <li><strong>Role-Based Access:</strong> Granular permissions for Admins, Teachers, and Students to ensure data integrity.</li>
                            <li><strong>Secure Data Flow:</strong> End-to-end encryption for all student personal data and assessment results.</li>
                            <li><strong>Automated Workflows:</strong> Streamlined tools for managing thousands of assessments and complex reporting structures.</li>
                        </ul>
                    </div>
                </div>

                <section className="cta-strip explanations-cta">
                    <div className="cta-strip-glow" aria-hidden="true" />
                    <div className="container cta-inner">
                        <div className="cta-text">
                            <h3>Start your journey today</h3>
                            <p>Experience the power of Cognitive AI and unlock your full potential.</p>
                        </div>
                        <Link to="/register" className="btn btn-cta">Create Your Account →</Link>
                    </div>
                </section>
            </div>

            <footer className="home-footer">
                <div className="container footer-inner">
                    <div className="footer-copy">© 2026 Cognitive Assessment • Student Cognitive Skill Assessment Tool</div>
                </div>
            </footer>
        </div>
    );
}
