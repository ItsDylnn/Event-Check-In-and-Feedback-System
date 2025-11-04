import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import EventsPage from './pages/EventsPage';
import FeedbackPage from './pages/FeedbackPage';
import AdminPage from './pages/AdminPage';
import { getRole } from './auth';
import AdminFeedbackPage from './pages/AdminFeedbackPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const role = getRole();
  if (role !== 'admin') return <Navigate to="/events" replace />;
  return children;
}

export default function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Routes>
      {/* 🔹 Login Page */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/events" /> : <LoginRegister />} 
      />

      {/* 🔹 Events Page (Employee) */}
      <Route
        path="/events"
        element={
          <RequireAuth>
            <EventsPage />
          </RequireAuth>
        }
      />

      {/* 🔹 Feedback Page (Employee) */}
      <Route
        path="/events/:id/feedback"
        element={
          <RequireAuth>
            <FeedbackPage />
          </RequireAuth>
        }
      />

      {/* 🔹 Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          </RequireAuth>
        }
      />

      {/* 🔹 Admin Feedback Page */}
      <Route
        path="/admin/feedback"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminFeedbackPage />
            </RequireAdmin>
          </RequireAuth>
        }
      />

      {/* 🔹 Default Redirect */}
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/events" /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}
