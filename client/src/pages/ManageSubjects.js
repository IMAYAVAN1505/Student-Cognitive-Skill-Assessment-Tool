import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManageSubjects.css';

const SUBJECT_NAMES = [
  'Memory Skills', 'Attention & Focus', 'Logical Reasoning', 'Problem Solving',
  'Verbal Ability', 'Numerical Ability', 'Analytical Thinking', 'Critical Thinking',
  'Decision Making', 'Pattern Recognition',
];

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setSubjects([]);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/subjects', { name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setEditName(subject.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await api.put(`/subjects/${id}`, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      setMessage('Subject name updated successfully in portal!');
      setTimeout(() => setMessage(''), 3000);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="manage-subjects">
      <h1 className="page-title">Subject Management</h1>
      <p className="page-desc">Add subjects for assessments. Predefined: {SUBJECT_NAMES.join(', ')}.</p>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="card add-subject-form">
        <form onSubmit={handleAdd} className="form-row">
          <input
            type="text"
            className="input"
            placeholder="New subject name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Add subject</button>
        </form>
      </div>

      <div className="subjects-list card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(subjects || []).map((s) => (
              <tr key={s._id}>
                <td>
                  {editingId === s._id ? (
                    <input
                      type="text"
                      className="input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ maxWidth: '200px' }}
                    />
                  ) : (
                    <strong>{s.name}</strong>
                  )}
                </td>
                <td>
                  {editingId === s._id ? (
                    <div className="btn-group">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(s._id)}>Save</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="btn-group">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                      <button type="button" className="btn btn-secondary btn-sm delete" onClick={() => handleDelete(s._id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
