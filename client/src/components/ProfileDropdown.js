import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileDropdown.css';

export default function ProfileDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="profile-avatar">{initials}</span>
        <span className="profile-name">{user?.name}</span>
        <span className="profile-chevron">▼</span>
      </button>
      {open && (
        <div className="profile-menu card">
          <div className="profile-menu-header">
            <span className="profile-menu-avatar">{initials}</span>
            <div>
              <div className="profile-menu-name">{user?.name}</div>
              <div className="profile-menu-email">{user?.email}</div>
              {(user?.rollNumber || user?.course) && (
                <div className="profile-menu-meta">
                  {user?.rollNumber && <span>Roll: {user.rollNumber}</span>}
                  {(user?.course || user?.department) && (
                    <span>{[user.course, user.department].filter(Boolean).join(' • ')}</span>
                  )}
                </div>
              )}
              {user?.role === 'teacher' && (
                <div className="profile-menu-meta profile-menu-subjects">
                  <strong>Assigned subjects:</strong>{' '}
                  {(user?.assignedSubjects?.length
                    ? user.assignedSubjects.map(s => s?.name || s).filter(Boolean).join(', ')
                    : 'None')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
