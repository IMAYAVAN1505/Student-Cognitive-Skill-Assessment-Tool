import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './MyAssessments.css';

export default function MyAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assessments')
      .then(res => {
        const assessmentsWithQuestions = (res.data || []).filter(a =>
          a.questions && Array.isArray(a.questions) && a.questions.length > 0
        );
        setAssessments(assessmentsWithQuestions);
      })
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="my-assessments">
      <h1 className="page-title">My Assessments</h1>
      <p className="page-desc">Available tests by subject. Click Start to attempt. Only teachers can add questions; you can only take tests.</p>
      <div className="assessments-grid">
        {assessments.length ? assessments.map((a) => (
          <div key={a._id} className="assessment-card glass-card">
            <span className="assessment-meta">{a.subject?.name}</span>
            <h3>{a.title}</h3>
            <p className="assessment-questions">{a.questions?.length || 0} questions • {a.durationMinutes || 30} min</p>
            <Link to={`/dashboard/test/${a._id}`} className="btn btn-primary">Start Test</Link>
          </div>
        )) : (
          <div className="no-data-block">
            <p className="no-data">No assessments available yet.</p>
            <p className="no-data-hint">Assessments are created by your institution. Teachers add questions; you can only view and take tests here. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
