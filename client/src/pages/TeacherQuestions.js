import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './TeacherQuestions.css';

export default function TeacherQuestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    subject: '',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState([]);

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const mySubjectIds = (user?.assignedSubjects || []).map(s => s._id || s);
  const mySubjects = subjects.filter(s => mySubjectIds.includes(s._id));

  useEffect(() => {
    Promise.all([api.get('/subjects'), api.get('/questions')])
      .then(([subRes, qRes]) => {
        setSubjects(subRes.data);
        setQuestions(qRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOptionChange = (index, value) => {
    const opts = [...form.options];
    opts[index] = value;
    setForm({ ...form, options: opts });
  };

  const handleSubmit = async (e, shouldClose = true) => {
    e.preventDefault();
    if (!form.subject || !form.questionText.trim() || form.options.some(o => !o.trim()) || !form.correctAnswer.trim()) {
      alert('Fill all fields and 4 options.');
      return;
    }
    try {
      await api.post('/questions', {
        subject: form.subject,
        questionText: form.questionText.trim(),
        options: form.options.map(o => o.trim()),
        correctAnswer: form.correctAnswer.trim(),
      });
      setForm({ subject: '', questionText: '', options: ['', '', '', ''], correctAnswer: '' });
      if (shouldClose) setShowForm(false);
      api.get('/questions').then(res => setQuestions(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="teacher-questions">
      <h1 className="page-title">Question management</h1>
      <p className="page-desc">Add questions only for your assigned subjects. You have access to: {mySubjects.map(s => s.name).join(', ') || 'None'}.</p>

      <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add question'}
      </button>

      {showForm && (
        <div className="card question-form-card">
          <form onSubmit={(e) => handleSubmit(e, window.submitShouldClose)}>
            <label className="label">Subject</label>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
              <option value="">Select subject</option>
              {mySubjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <label className="label">Question text</label>
            <textarea className="input" rows={3} value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} required />
            <label className="label">Options (4)</label>
            {[0, 1, 2, 3].map(i => (
              <input key={i} type="text" className="input" placeholder={`Option ${i + 1}`} value={form.options[i]} onChange={(e) => handleOptionChange(i, e.target.value)} required />
            ))}
            <label className="label">Correct answer (exact text)</label>
            <input type="text" className="input" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} required />
            <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" onClick={() => (window.submitShouldClose = true)}>Save & Close</button>
              <button type="submit" className="btn btn-secondary" onClick={() => (window.submitShouldClose = false)}>Save & Add Another</button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-columns-container">
        {mySubjects.map(subject => {
          const subjectQuestions = questions.filter(q => {
            const qSubId = q.subject?._id || q.subject;
            return qSubId?.toString() === subject._id?.toString();
          });
          return (
            <div key={subject._id} className="subject-card card" onClick={() => navigate(`/teacher/questions/${subject._id}`)}>
              <h2 className="column-title">
                {subject.name}
              </h2>
              <div className="subject-info">
                <span className="q-count">{subjectQuestions.length} Questions</span>
                <span className="arrow">→</span>
              </div>
            </div>
          );
        })}
        {mySubjects.length === 0 && (
          <div className="card" style={{ width: '100%', padding: '20px' }}>
            <p className="no-data">No assigned subjects found. Please contact admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
