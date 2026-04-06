import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './Reports.css';

export default function Reports() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

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
                <th className="col-score">Score</th>
                <th className="col-date">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong
                      className="subject-link"
                      style={{ cursor: 'pointer', color: 'var(--primary)' }}
                      onClick={() => setSelectedResult(r)}
                    >
                      {r.subject?.name}
                    </strong>
                  </td>
                  <td className="col-score"><strong>{r.percentage}%</strong> ({r.score}/{r.totalQuestions})</td>
                  <td className="col-date">{new Date(r.completedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No results yet. Take an assessment from My Assessments.</p>
        )}
      </div>

      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assessment Result</h3>
              <button className="btn-close" onClick={() => setSelectedResult(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="result-summary">
                <div className="summary-item" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <label>Subject</label>
                  <span>{selectedResult.subject?.name}</span>
                </div>
                <div className="summary-item">
                  <label>Score</label>
                  <span className="score-high">{selectedResult.percentage}%</span>
                </div>
                <div className="summary-item">
                  <label>Completed On</label>
                  <span>{new Date(selectedResult.completedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="result-details">
                <h4>Performance Breakdown</h4>
                <p>You answered <strong>{selectedResult.score}</strong> correct out of <strong>{selectedResult.totalQuestions}</strong> questions.</p>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${selectedResult.percentage}%` }}></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedResult(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
