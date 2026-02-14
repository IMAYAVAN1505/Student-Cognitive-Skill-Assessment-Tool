import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', rollNumber: '', course: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        rollNumber: user.rollNumber || '',
        course: user.course || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put(`/users/${user.id || user._id}`, form);
      updateUser(res.data);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Edit profile</h1>
          <p className="page-desc">Update your name and details.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          Finish
        </button>
      </div>
      <div className="profile-card glass-card">
        <form onSubmit={handleSubmit} className="profile-form">
          {message && <div className={`profile-msg ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}

          <div className="form-group">
            <label className="label">Name</label>
            <input type="text" className="input" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input type="text" className="input" value={user.email} disabled />
          </div>

          {user.role === 'teacher' && (
            <div className="form-group">
              <label className="label">Assigned subjects</label>
              <div className="profile-readonly">
                {(user.assignedSubjects?.length
                  ? user.assignedSubjects.map(s => s?.name || s).filter(Boolean).join(', ')
                  : 'None (admin assigns subjects to you)')}
              </div>
            </div>
          )}

          {user.role === 'student' && (
            <>
              <div className="form-group">
                <label className="label">Roll number</label>
                <input type="text" className="input" name="rollNumber" value={form.rollNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Course</label>
                <input type="text" className="input" name="course" value={form.course} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <input type="text" className="input" name="department" value={form.department} onChange={handleChange} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
