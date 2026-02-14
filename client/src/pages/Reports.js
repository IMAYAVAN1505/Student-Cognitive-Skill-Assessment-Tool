import React, { useState, useEffect } from 'react';
import api from '../api';
import './Reports.css';

export default function Reports() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my-results')
      .then(res => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;

  const totalTests = results.length;
  const avgScore = totalTests
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / totalTests)
    : 0;
  const bestScore = totalTests
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  return (
    <div className="reports-page">
      <h1 className="page-title">Reports</h1>
      <p className="page-desc">Your assessment history and performance overview.</p>

      <div className="reports-summary">
        <div className="summary-card glass-card">
          <span className="summary-label">Total Tests</span>
          <div className="summary-value">{totalTests}</div>
        </div>
        <div className="summary-card glass-card">
          <span className="summary-label">Average Score</span>
          <div className="summary-value">{avgScore}%</div>
        </div>
        <div className="summary-card glass-card">
          <span className="summary-label">Best Score</span>
          <div className="summary-value">{bestScore}%</div>
        </div>
      </div>

      <div className="reports-table-wrap glass-card">
        {results.length ? (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assessment</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>{r.subject?.name}</td>
                  <td>{r.assessment?.title}</td>
                  <td><strong>{r.percentage}%</strong> ({r.score}/{r.totalQuestions})</td>
                  <td>{new Date(r.completedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No results yet. Take an assessment from My Assessments.</p>
        )}
      </div>
    </div>
  );
}
