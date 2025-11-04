import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [desc, setDesc] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/feedback')
      .then(res => setFeedbacks(res.data))
      .catch(() => setErr('Failed to load feedback.'));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/events', { title, date, venue, description: desc });
      alert('Event created successfully!');
      setTitle('');
      setDate('');
      setVenue('');
      setDesc('');
    } catch (e) {
      alert(e.response?.data?.msg || 'Error creating event.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      alert('Event deleted successfully!');
    } catch (e) {
      alert('Failed to delete event.');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      {/* Create Event Section */}
      <section style={{ marginBottom: 30 }}>
        <h3>Create Event</h3>
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <div>
            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
              required
            />
          </div>

          <div>
            <input
              placeholder="Date (YYYY-MM-DDTHH:mm:ss)"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
              required
            />
          </div>

          <div>
            <input
              placeholder="Venue"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              style={{ width: '100%', height: 100, marginBottom: 8 }}
            />
          </div>

          <button type="submit">Create Event</button>
        </form>
      </section>

      {/* Feedback Section */}
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
