import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../auth";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/events/feedback/all")
      .then((res) => setFeedbacks(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load feedback.");
      });
  }, []);

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>All Feedback</h2>
        <button
          onClick={logout}
          style={{
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((fb) => (
          <div
            key={fb.feedback_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 15,
              marginBottom: 12,
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ margin: 0 }}>{fb.event_title}</h3>
            <p style={{ margin: "4px 0" }}>
              <strong>User:</strong> {fb.user_name} ({fb.user_email})
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Rating:</strong> ⭐ {fb.rating}/5
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Comment:</strong> {fb.comment || "No comment"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
