import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../auth";
import "./EventsPage.css"; // ✅ import styles

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  // ✅ Logout
  function logout() {
    clearAuth();
    navigate("/login");
  }

  // ✅ Load events + registrations
  useEffect(() => {
    async function loadData() {
      try {
        const [eventsRes, regRes] = await Promise.all([
          api.get("/events"),
          api.get("/events/registrations"),
        ]);
        setEvents(eventsRes.data);
        setRegisteredIds(regRes.data.registered_event_ids || []);
      } catch (error) {
        console.error("Error loading events:", error);
        setErr("Failed to load events or registrations.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function isRegistered(eventId) {
    return registeredIds.includes(eventId);
  }

  function openRegisterPopup(event) {
    setSelectedEvent(event);
    setShowPopup(true);
  }

  function closePopup() {
    setShowPopup(false);
    setEmail("");
    setPhone("");
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    try {
      await api.post(`/events/${selectedEvent.id}/register`, { email, phone });
      alert("Registered successfully!");
      setRegisteredIds([...registeredIds, selectedEvent.id]);
      closePopup();
    } catch (error) {
      alert(error.response?.data?.msg || "Error registering for event.");
    }
  }

  async function handleUnregister(eventId) {
    if (!window.confirm("Are you sure you want to unregister from this event?")) return;
    try {
      await api.delete(`/events/${eventId}/unregister`);
      alert("You have been unregistered from the event.");
      setRegisteredIds(registeredIds.filter((id) => id !== eventId));
    } catch (error) {
      alert(error.response?.data?.msg || "Error unregistering.");
    }
  }

  if (loading) return <div className="loading">Loading events...</div>;
  if (err) return <div className="error">{err}</div>;

  return (
    <div className="events-page">
      {/* 🔹 Header */}
      <div className="events-header">
        <h2>Upcoming Events</h2>
        <button onClick={logout} className="btn btn-logout">
          Logout
        </button>
      </div>

      {events.length === 0 && <p className="empty">No events available.</p>}

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.title}</h3>
            <p>
              <strong>Date:</strong> {event.date || "TBA"}
            </p>
            <p>
              <strong>Venue:</strong> {event.venue}
            </p>
            <p>{event.description}</p>

            <div className="btn-group">
              {!isRegistered(event.id) ? (
                <button className="btn btn-register" onClick={() => openRegisterPopup(event)}>
                  Register
                </button>
              ) : (
                <button className="btn btn-unregister" onClick={() => handleUnregister(event.id)}>
                  Unregister
                </button>
              )}

              <button
                className="btn btn-feedback"
                onClick={() => navigate(`/events/${event.id}/feedback`)}
              >
                Leave Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Register for {selectedEvent.title}</h3>
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="popup-buttons">
                <button type="submit" className="btn btn-register">
                  Submit
                </button>
                <button type="button" className="btn btn-cancel" onClick={closePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
