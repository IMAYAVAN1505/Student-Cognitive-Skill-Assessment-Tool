import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './SubjectQuestions.css';

export default function SubjectQuestions() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editForm, setEditForm] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`Fetching subject data for ID: ${subjectId}`);
                const subRes = await api.get(`/subjects/${subjectId}`);
                console.log('Subject response:', subRes.data);
                setSubject(subRes.data);

                try {
                    console.log(`Fetching questions for subject ID: ${subjectId}`);
                    const qRes = await api.get(`/questions?subject=${subjectId}`);
                    console.log('Questions response:', qRes.data);
                    const filtered = qRes.data.filter(q => {
                        const qSubId = q.subject?._id || q.subject;
                        return qSubId?.toString() === subjectId.toString();
                    });
                    setQuestions(filtered);
                } catch (qErr) {
                    console.error('Questions fetch failed:', qErr);
                    // Don't set global error if questions fail, just log it
                }
            } catch (err) {
                console.error('Subject fetch failed:', err);
                const errorMsg = err.response?.data?.message || err.message || 'Failed to load subject';
                setError(`Subject Fetch Error: ${errorMsg} (Status: ${err.response?.status})`);
            } finally {
                setLoading(false);
            }
        };
        if (subjectId) fetchData();
    }, [subjectId, api]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            setQuestions(prev => prev.filter(q => q._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        }
    };

    const handleEditClick = (q) => {
        setEditingQuestion(q);
        setEditForm({
            questionText: q.questionText,
            options: [...q.options],
            correctAnswer: q.correctAnswer
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/questions/${editingQuestion._id}`, editForm);
            setQuestions(prev => prev.map(q => q._id === editingQuestion._id ? res.data : q));
            setEditingQuestion(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update');
        }
    };

    const handleEditFormChange = (field, value, index = null) => {
        if (field === 'options') {
            const newOptions = [...editForm.options];
            newOptions[index] = value;
            setEditForm({ ...editForm, options: newOptions });
        } else {
            setEditForm({ ...editForm, [field]: value });
        }
    };

    if (loading) return <div className="page-loading">Loading questions...</div>;
    if (error) return (
        <div className="page-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/teacher/questions')}>Back to Subjects</button>
        </div>
    );
    if (!subject) return <div className="page-error">Subject not found.</div>;

    return (
        <div className="subject-questions">
            <div className="header-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/teacher/questions')}>
                    ← Back to Subjects
                </button>
            </div>

            <div className="subject-header card">
                <h1 className="page-title">{subject.name}</h1>
                <p className="page-desc">Managing questions for {subject.name}</p>
            </div>

            <div className="questions-list card">
                <h2>Questions ({questions.length})</h2>
                {questions.length ? (
                    <ul>
                        {questions.map((q) => (
                            <li key={q._id} className="question-item">
                                <div className="q-content">
                                    <p className="q-text">{q.questionText}</p>
                                    <div className="q-options">
                                        {q.options.map((opt, i) => (
                                            <span key={i} className={`q-opt ${opt === q.correctAnswer ? 'correct' : ''}`}>
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="q-actions">
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleEditClick(q)}>Edit</button>
                                    <button type="button" className="btn btn-secondary btn-sm delete-btn" onClick={() => handleDelete(q._id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">No questions found for this subject.</p>
                )}
            </div>

            {editingQuestion && (
                <div className="modal-overlay" onClick={() => setEditingQuestion(null)}>
                    <div className="modal card" onClick={e => e.stopPropagation()}>
                        <h3>Edit Question</h3>
                        <form onSubmit={handleUpdate} className="edit-form">
                            <label className="label">Question text</label>
                            <textarea
                                className="input"
                                rows={3}
                                value={editForm.questionText}
                                onChange={(e) => handleEditFormChange('questionText', e.target.value)}
                                required
                            />
                            <label className="label">Options (4)</label>
                            {editForm.options.map((opt, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    className="input"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => handleEditFormChange('options', e.target.value, i)}
                                    required
                                />
                            ))}
                            <label className="label">Correct answer</label>
                            <input
                                type="text"
                                className="input"
                                value={editForm.correctAnswer}
                                onChange={(e) => handleEditFormChange('correctAnswer', e.target.value)}
                                required
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingQuestion(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
