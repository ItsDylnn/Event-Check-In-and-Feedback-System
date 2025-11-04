import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../auth';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  // 🔹 Logout function
  function logout() {
    clearAuth();
    navigate('/login');
  }

  useEffect(() => {
    let mounted = true;
    api.get('/events')
      .then(res => {
        if (mounted) setEvents(res.data);
      })
      .catch((error) => {
        console.error('Error loading events:', error);
        setErr(`Failed to load events: ${error.response?.data?.message || error.message}`);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (err) return <div style={{ color: 'red' }}>{err}</div>;

  return (
    <div style={{ padding: 20 }}>
      {/* 🔹 Header with Logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Upcoming Events</h2>
        <button
          onClick={logout}
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

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
            <p><strong>Date:</strong> {event.date || 'TBA'}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p>{event.description}</p>

            <button
              disabled={registered}
              onClick={() => {
                localStorage.setItem(`registered_${event.id}`, 'true');
                alert('Registered for event successfully!');
              }}
              style={{
                marginRight: 10,
                background: registered ? '#ccc' : '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: registered ? 'not-allowed' : 'pointer'
              }}
            >
              {registered ? 'Registered' : 'Register'}
            </button>

            <button
              onClick={() => navigate(`/events/${event.id}/feedback`)}
              style={{
                background: '#2ecc71',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Leave Feedback
            </button>
          </div>
        );
      })}
    </div>
  );
}
