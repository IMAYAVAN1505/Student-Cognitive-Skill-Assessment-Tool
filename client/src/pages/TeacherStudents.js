import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminUsers.css';
import { Link } from 'react-router-dom';

export default function TeacherStudents() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users?role=student')
            .then(res => setStudents(res.data))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatActivity = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const activityDate = new Date(date);
        const diffMs = now - activityDate;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 5) return <><span className="status-dot"></span> Online</>;
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return activityDate.toLocaleDateString();
    };

    if (loading) return <div className="page-loading">Loading students...</div>;

    return (
        <div className="admin-users">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-desc">Overview of all registered students and their recent activity.</p>
                </div>
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Details</th>
                            <th>Recent Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                            <tr key={s._id || s.id}>
                                <td>
                                    <Link to={`/teacher/students/${s._id || s.id}`} className="student-link">
                                        <strong>{s.name}</strong>
                                    </Link>
                                </td>
                                <td>{s.email}</td>
                                <td>
                                    {s.rollNumber && `Roll: ${s.rollNumber}`}
                                    {s.course && ` • ${s.course}`}
                                    {s.department && ` • ${s.department}`}
                                    {!s.rollNumber && !s.course && !s.department && '—'}
                                </td>
                                <td>
                                    <div className="activity-status">
                                        {formatActivity(s.updatedAt)}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="no-data">No students found matching "{searchTerm}"</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
