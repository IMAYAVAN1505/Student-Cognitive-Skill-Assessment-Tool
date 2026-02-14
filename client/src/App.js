import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import MyAssessments from './pages/MyAssessments';
import Reports from './pages/Reports';
import TakeTest from './pages/TakeTest';
import AdminSubjects from './pages/AdminSubjects';
import TeacherQuestions from './pages/TeacherQuestions';
import TeacherStudents from './pages/TeacherStudents';
import StudentInsights from './pages/StudentInsights';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import SubjectQuestions from './pages/SubjectQuestions';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={['student']}>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="assessments" element={<MyAssessments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="test/:assessmentId" element={<TakeTest />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/admin/subjects" replace />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/teacher" element={
          <PrivateRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/teacher/questions" replace />} />
          <Route path="questions" element={<TeacherQuestions />} />
          <Route path="questions/:subjectId" element={<SubjectQuestions />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="students/:studentId" element={<StudentInsights />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
