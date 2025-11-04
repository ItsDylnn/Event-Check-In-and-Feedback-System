import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginRegister from './pages/LoginRegister'
import EventsPage from './pages/EventsPage'
import FeedbackPage from './pages/FeedbackPage'
import AdminPage from './pages/AdminPage'
import { getRole } from './auth'

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
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/events" /> : <LoginRegister />} 
      />
      <Route
        path="/events"
        element={
          <RequireAuth>
            <EventsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/events/:id/feedback"
        element={
          <RequireAuth>
            <FeedbackPage />
          </RequireAuth>
        }
      />
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
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/events" /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}
