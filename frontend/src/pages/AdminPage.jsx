import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getToken } from '../auth';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [events, setEvents] = useState([]); // ✅ NEW
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  // ✅ Redirect if not logged in
  useEffect(() => {
    const token = getToken();
    if (!token) navigate('/login');
  }, [navigate]);

  // ✅ Load feedback and events
  useEffect(() => {
    api.get('/feedback')
      .then(res => setFeedbacks(res.data))
      .catch(() => setErr('Failed to load feedback.'));

    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(() => setErr('Failed to load events.'));
  }, []);

  // ✅ Create new event
  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/events', { title, date, venue, description: desc });
      alert('Event created successfully!');
      setTitle('');
      setDate('');
      setVenue('');
      setDesc('');
      // 🔄 Refresh events list
      const updated = await api.get('/events');
      setEvents(updated.data);
    } catch (e) {
      alert(e.response?.data?.msg || 'Error creating event.');
    }
  }

  // ✅ Delete event
  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      alert('Event deleted successfully!');
      setEvents(events.filter(e => e.id !== id)); // remove locally
    } catch (e) {
      alert('Failed to delete event.');
    }
  }

  // ✅ Logout function
  function logout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button
          onClick={logout}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {/* 🔹 Create Event Section */}
      <section style={{ marginBottom: 30 }}>
        <h3>Create Event</h3>
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          <input
            placeholder="Date (YYYY-MM-DDTHH:mm:ss)"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          <input
            placeholder="Venue"
            value={venue}
            onChange={e => setVenue(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
            required
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ width: '100%', height: 100, marginBottom: 8 }}
          />
          <button type="submit">Create Event</button>
        </form>
      </section>

      {/* 🔹 All Events Section */}
      <section style={{ marginBottom: 30 }}>
        <h3>All Events</h3>
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <h4>{ev.title}</h4>
              <p><strong>Date:</strong> {ev.date}</p>
              <p><strong>Venue:</strong> {ev.venue}</p>
              <p>{ev.description}</p>
              <button
                onClick={() => handleDelete(ev.id)}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>

      {/* 🔹 Feedback Section */}
      <section>
        <h3>All Feedback</h3>
        {err && <div style={{ color: 'red' }}>{err}</div>}
        {feedbacks.length === 0 ? (
          <p>No feedback yet.</p>
        ) : (
          feedbacks.map(f => (
            <div
              key={f.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p>
                <strong>Event ID:</strong> {f.event_id} &nbsp;|&nbsp;
                <strong>User ID:</strong> {f.user_id}
              </p>
              <p><strong>Rating:</strong> {f.rating}/5</p>
              <p>{f.comment}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
