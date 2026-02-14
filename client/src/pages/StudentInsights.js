import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './StudentDashboard.css'; // Reuse dashboard styles for cards/charts

export default function StudentInsights() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="activity-status" style={{ fontSize: '1rem' }}>
                    <span className="status-dot"></span> Active Student
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card color-1">
                    <div className="stat-label">Assessments Taken</div>
                    <div className="stat-value">{results.length}</div>
                </div>
                <div className="stat-card color-2">
                    <div className="stat-label">Average Score</div>
                    <div className="stat-value">
                        {results.length ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0}%
                    </div>
                </div>
                <div className="stat-card color-3">
                    <div className="stat-label">Recent Score</div>
                    <div className="stat-value">{results[0]?.percentage || 0}%</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <h2>Assessment History</h2>
                    <div className="reports-table-wrap" style={{ marginTop: '20px' }}>
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Assessment</th>
                                    <th>Subject</th>
                                    <th>Score</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r._id}>
                                        <td><strong>{r.assessment?.title || 'Unknown Assessment'}</strong></td>
                                        <td>{r.subject?.name || r.subject || 'N/A'}</td>
                                        <td><span className="percentage-tag">{r.percentage}%</span></td>
                                        <td>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="no-data">No assessment data available for this student.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
