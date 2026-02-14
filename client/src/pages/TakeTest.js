import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './TakeTest.css';

export default function TakeTest() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'student') {
      setLoading(false);
      setError('Only students can take assessments.');
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    api.get(`/assessments/${assessmentId}/attempt`)
      .then(res => {
        if (!res.data || !res.data.questions || res.data.questions.length === 0) {
          setError('This assessment has no questions yet. Please contact your teacher.');
          setLoading(false);
          return;
        }
        setAssessment(res.data);
        setAnswers(res.data.draftAnswers || {});
        setTimeLeft(res.data.durationMinutes * 60);
        setError('');
        setLoading(false);
      })
      .catch(err => {
        const message = err.response?.data?.message ||
          (err.response?.status === 403 ? 'Only students can take assessments.' :
            err.response?.status === 404 ? 'Assessment not found.' :
              'Could not load assessment. Please try again.');
        setError(message);
        setLoading(false);
        if (user?.role === 'student' && err.response?.status !== 400) {
          setTimeout(() => navigate('/dashboard/assessments'), 2000);
        }
      });
  }, [assessmentId, navigate, user]);

  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (isFinal = true) => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      await api.post('/results/submit', { assessmentId, answers, isFinal });
      if (isFinal) {
        navigate('/dashboard/reports');
      } else {
        setMessage('Progress saved.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !error) return <div className="page-loading">Loading assessment and questions...</div>;
  if (error && !assessment) {
    return (
      <div className="take-test take-test-error">
        <div className="card" style={{ padding: 24 }}>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate(user?.role === 'teacher' ? '/teacher/questions' : user?.role === 'admin' ? '/admin/subjects' : '/dashboard/assessments')}>
            Go back
          </button>
        </div>
      </div>
    );
  }
  if (!assessment) return <div className="page-loading">Loading assessment...</div>;

  const questions = assessment?.questions || [];
  const current = questions.length > 0 && currentIndex < questions.length ? questions[currentIndex] : null;
  const options = current && Array.isArray(current.options) && current.options.length > 0 ? current.options : [];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="take-test">
      <div className="test-header card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{assessment.title}</h1>
            <p>{assessment.subject?.name} • {questions.length} questions</p>
          </div>
          <div className="test-meta-right" style={{ textAlign: 'right' }}>
            <div className={`test-timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
              Time Left: {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </div>
            <button
              type="button"
              className="btn btn-primary finish-btn"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              style={{ marginTop: '0.5rem' }}
            >
              {submitting ? 'Submitting...' : 'Finish'}
            </button>
          </div>
        </div>
        <div className="test-progress">
          Question {currentIndex + 1} of {questions.length} • Answered: {answeredCount}
        </div>
      </div>

      <div className="test-body card">
        {current && current.questionText ? (
          <>
            {message && <div className="test-msg success">{message}</div>}
            <div className="question-block">
              <h2 className="question-text">{current.questionText}</h2>
              {current.difficulty && <p className="question-difficulty">{current.difficulty}</p>}
              {options.length > 0 ? (
                <ul className="options-list">
                  {options.map((opt, i) => (
                    <li key={i}>
                      <label className="option-label">
                        <input
                          type="radio"
                          name={`q-${current._id}`}
                          checked={answers[current._id] === opt}
                          onChange={() => handleOptionSelect(current._id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-options">No options available for this question.</p>
              )}
            </div>
            <div className="test-nav">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
              >
                Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => setCurrentIndex(i => i + 1)}>
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </>
        ) : questions.length === 0 ? (
          <p>No questions in this assessment. Please contact your teacher.</p>
        ) : (
          <p>Loading question...</p>
        )}
      </div>

      <div className="test-quick-nav card">
        <p>Jump to question:</p>
        <div className="quick-dots">
          {questions.map((q, i) => (
            <button
              key={q._id}
              type="button"
              className={`quick-dot ${i === currentIndex ? 'active' : ''} ${answers[q._id] ? 'answered' : ''}`}
              onClick={() => setCurrentIndex(i)}
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
