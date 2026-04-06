import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    course: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form);
      const role = data?.user?.role;
      if (role === 'admin') navigate('/admin/users');
      else if (role === 'teacher') navigate('/teacher/subjects');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-box" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="auth-logo-svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#3b82f6" />
            </svg>
          </div>
          <h1>Create Account</h1>
          <p>Join the Cognitive Assessment ecosystem</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label className="label">Name</label>
            <input type="text" className="input" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Select the role</label>
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'student' && (
            <>
              <div className="form-group">
                <label className="label">Roll number</label>
                <input type="text" className="input" name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="e.g. STU001" />
              </div>
              <div className="form-group">
                <label className="label">Course</label>
                <input type="text" className="input" name="course" value={form.course} onChange={handleChange} placeholder="e.g. B.Sc. Cognitive Science" />
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <input type="text" className="input" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Psychology" />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
