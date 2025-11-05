import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { clearAuth, getToken } from "../auth";
import "./AdminPage.css"; // ✅ import the CSS

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [desc, setDesc] = useState("");
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => setErr("Failed to load events."));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/events", { title, date, venue, description: desc });
      alert("Event created successfully!");
      setTitle("");
      setDate("");
      setVenue("");
      setDesc("");
      const updated = await api.get("/events");
      setEvents(updated.data);
    } catch (e) {
      alert(e.response?.data?.msg || "Error creating event.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      alert("Event deleted successfully!");
      setEvents(events.filter((e) => e.id !== id));
    } catch (e) {
      alert("Failed to delete event.");
    }
  }

  function logout() {
    clearAuth();
    navigate("/login");
  }

  function viewFeedback() {
    navigate("/admin/feedback");
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button onClick={viewFeedback} className="btn btn-blue">
            View All Feedback
          </button>
          <button onClick={logout} className="btn btn-red">
            Logout
          </button>
        </div>
      </div>

      {/* Create Event */}
      <section>
        <h3>Create Event</h3>
        <form onSubmit={handleCreate}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Date (YYYY-MM-DDTHH:mm:ss)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button type="submit" className="btn btn-blue">
            Create Event
          </button>
        </form>
      </section>

      {/* Event List */}
      <section>
        <h3>All Events</h3>
        {err && <div style={{ color: "red" }}>{err}</div>}
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          events.map((ev) => (
            <div className="event-card" key={ev.id}>
              <h4>{ev.title}</h4>
              <p><strong>Date:</strong> {ev.date}</p>
              <p><strong>Venue:</strong> {ev.venue}</p>
              <p>{ev.description}</p>
              <button onClick={() => handleDelete(ev.id)} className="btn btn-red">
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
