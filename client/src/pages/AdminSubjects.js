import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminSubjects.css';

const SUBJECT_NAMES = [
  'Memory Skills', 'Attention & Focus', 'Logical Reasoning', 'Problem Solving',
  'Verbal Ability', 'Numerical Ability', 'Analytical Thinking', 'Critical Thinking',
  'Decision Making', 'Pattern Recognition',
];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const load = async () => {
    const [subRes, userRes] = await Promise.all([
      api.get('/subjects'),
      api.get('/users'),
    ]);
    setSubjects(subRes.data);
    setUsers(userRes.data.filter(u => u.role === 'teacher'));
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

  const openAssignModal = (subject) => {
    setAssignModal(subject);
    setSelectedTeacherIds((subject.assignedTeachers || []).map(t => t._id || t.id));
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    try {
      await api.put(`/subjects/${assignModal._id}/assign-teachers`, { assignedTeachers: selectedTeacherIds });
      setAssignModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const toggleTeacher = (teacherId) => {
    setSelectedTeacherIds(prev =>
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
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

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="admin-subjects">
      <h1 className="page-title">Subject management</h1>
      <p className="page-desc">Add subjects and assign teachers. Predefined: {SUBJECT_NAMES.join(', ')}.</p>

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
              <th>Assigned teachers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong></td>
                <td>
                  {(s.assignedTeachers || []).map(t => t.name).join(', ') || '—'}
                  <button type="button" className="btn-link" onClick={() => openAssignModal(s)}>Assign</button>
                </td>
                <td>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <h3>Assign teachers to {assignModal.name}</h3>
            <div className="assign-list">
              {users.map((u) => {
                const id = u._id || u.id;
                return (
                  <label key={id} className="assign-item">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(id)}
                      onChange={() => toggleTeacher(id)}
                    />
                    {u.name} ({u.email})
                  </label>
                );
              })}
            </div>
            <button type="button" className="btn btn-primary" onClick={handleAssign}>Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setAssignModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
