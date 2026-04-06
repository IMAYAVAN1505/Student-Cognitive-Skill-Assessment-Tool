import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
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
      const userId = user.id || user._id;
      const res = await api.put(`/users/${userId}`, form);

      // The backend now returns the structured user object
      updateUser(res.data);

      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';


  return (
    <div className="profile-page">
      {/* Purple Header Section */}
      <div className="profile-header-purple">
        <div className="profile-avatar-overlapping">
          <div className="profile-avatar-circle">
            {initials}
          </div>
        </div>
      </div>

      {/* White Content Section */}
      <div className="profile-content-white">
        {/* User Name and Edit Icon */}
        <div className="profile-name-container">
          <h2 className="profile-name-centered">{user.name}</h2>
          {!isEditing && (
            <button
              type="button"
              className="edit-icon-btn"
              onClick={() => setIsEditing(true)}
              title="Edit Profile"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Contact Information */}
        {!isEditing && (
          <div className="contact-info-section">
            <div className="contact-item">
              <span className="contact-label">Mail</span>
              <span className="contact-value">{user.email}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Department</span>
              <span className="contact-value">{user.department || 'Not provided'}</span>
            </div>
            {/* Role-specific fields removed for a minimal profile */}
          </div>
        )}


        {/* Edit Form */}
        {isEditing && (
          <div className="profile-edit-card">
            <div className="edit-header">
              <h3>Edit Profile</h3>
              <button type="button" className="btn-close" onClick={() => setIsEditing(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="profile-form">
              {message && <div className={`profile-msg ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}

              <div className="form-group">
                <label className="label">NAME</label>
                <input type="text" className="input" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="label">EMAIL</label>
                <input type="text" className="input" value={user.email} disabled />
              </div>

              <div className="form-group">
                <label className="label">DEPARTMENT</label>
                <input type="text" className="input" name="department" value={form.department} onChange={handleChange} />
              </div>


              {/* Role-specific fields removed from edit form */}

              <button type="submit" className="btn btn-primary save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
