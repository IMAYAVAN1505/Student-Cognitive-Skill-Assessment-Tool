import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css'; // Reuse dashboard styles for cards/charts

export default function StudentInsights() {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get(`/users/${studentId}`),
            api.get(`/results/student/${studentId}`)
        ])
            .then(([userRes, resRes]) => {
                setStudent(userRes.data);
                setResults(resRes.data);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    if (loading) return <div className="page-loading">Loading student data...</div>;
    if (!student) return <div className="page-loading">Student not found.</div>;

    return (
        <div className="student-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '16px' }}>
                        ← Back to Students
                    </button>
                    <h1 className="page-title">{student.name}'s Profile</h1>
                    <p className="page-desc">{student.course} • {student.department} • Roll: {student.rollNumber}</p>
                </div>
                <div className="activity-status" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span className="status-dot"></span> Active Student
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card color-1">
                    <div className="stat-header">
                        <div className="stat-icon-box">📊</div>
                    </div>
                    <div className="stat-value">{results.length}</div>
                    <span className="stat-label">Assessments Completed</span>
                </div>
                <div className="stat-card color-2">
                    <div className="stat-header">
                        <div className="stat-icon-box">📈</div>
                    </div>
                    <div className="stat-value">
                        {results.length ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0}%
                    </div>
                    <span className="stat-label">Average Score</span>
                </div>
                <div className="stat-card color-3">
                    <div className="stat-header">
                        <div className="stat-icon-box">🎯</div>
                    </div>
                    <div className="stat-value">{results[0]?.percentage || 0}%</div>
                    <span className="stat-label">Recent Score</span>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card" style={{ gridColumn: 'span 2', padding: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px' }}>Assessment History</h2>
                    <div className="reports-table-wrap">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'right' }}>Date completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></span>
                                                <strong
                                                    className="subject-link"
                                                    style={{ cursor: 'pointer', color: 'var(--text)', fontWeight: 700 }}
                                                    onClick={() => setSelectedResult(r)}
                                                >
                                                    {r.subject?.name || r.subject || 'N/A'}
                                                </strong>
                                            </div>
                                        </td>
                                        <td><span className="percentage-tag" style={{ display: 'block', textAlign: 'center', width: 'fit-content', margin: '0 auto' }}>{r.percentage}%</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--text-muted)' }}>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedResult && (
                <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
                    <div className="modal glass-card" style={{ border: '1px solid var(--border)', background: 'var(--card)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Assessment Result</h3>
                            <button className="btn-close" onClick={() => setSelectedResult(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="result-summary" style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                                <div className="summary-item" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Subject</label>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedResult.subject?.name || selectedResult.subject}</span>
                                </div>
                                <div className="summary-item" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Score</label>
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6', filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.3))' }}>{selectedResult.percentage}%</span>
                                </div>
                                <div className="summary-item">
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Completed On</label>
                                    <span style={{ fontWeight: 600 }}>{new Date(selectedResult.completedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ gap: '16px' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedResult(null)}>Dismiss</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
