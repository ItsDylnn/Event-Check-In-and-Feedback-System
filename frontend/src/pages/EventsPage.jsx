import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/events')
      .then(res => {
        if (mounted) setEvents(res.data);
      })
      .catch(() => setErr('Failed to load events'))
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (err) return <div style={{ color: 'red' }}>{err}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Upcoming Events</h2>

      {events.length === 0 && <p>No events available.</p>}

      {events.map(event => {
        const registered = localStorage.getItem(`registered_${event.id}`);
        return (
          <div
            key={event.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              margin: '10px 0',
              padding: 15,
            }}
          >
            <h3>{event.title}</h3>
            <p><strong>Date:</strong> {event.date ? new Date(event.date).toLocaleString() : 'TBA'}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p>{event.description}</p>

            <button
              disabled={registered}
              onClick={() => {
                localStorage.setItem(`registered_${event.id}`, 'true');
                alert('Registered for event successfully!');
              }}
              style={{ marginRight: 10 }}
            >
              {registered ? 'Registered' : 'Register'}
            </button>

            <button onClick={() => navigate(`/events/${event.id}/feedback`)}>
              Leave Feedback
            </button>
          </div>
        );
      })}
    </div>
  );
}
