import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../auth";
import "./MyFeedbackPage.css"; // optional CSS file

export default function MyFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  function logout() {
    clearAuth();
    navigate("/login");
  }

  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await api.get("/feedback/my");
        setFeedback(res.data);
      } catch (e) {
        console.error("Error loading feedback:", e);
        setErr("Failed to load your feedback.");
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, []);

  if (loading) return <div className="loading">Loading feedback...</div>;
  if (err) return <div className="error">{err}</div>;

  return (
    <div className="my-feedback-page">
      {/* Header */}
      <div className="header">
        <h2>My Feedback</h2>
        <button onClick={logout} className="btn btn-logout">Logout</button>
      </div>

      {feedback.length === 0 ? (
        <p>You haven’t submitted any feedback yet.</p>
      ) : (
        <div className="feedback-list">
          {feedback.map((fb, i) => (
            <div key={i} className="feedback-card">
              <h3>{fb.event_title}</h3>
              <p><strong>Rating:</strong> {fb.rating}/5</p>
              <p><strong>Comment:</strong> {fb.comment}</p>
              <p className="date">{fb.created_at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
