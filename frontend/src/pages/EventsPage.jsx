import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../auth';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

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

  // 🔹 Handle registration popup
  const openRegisterPopup = (event) => {
    setSelectedEvent(event);
    setShowPopup(true);
  };

  const handleRegisterSubmit = async () => {
    if (!email || !phone) {
      alert('Please enter both email and phone number.');
      return;
    }

    try {
      await api.post(`/events/${selectedEvent.id}/register`, { email, phone });
      localStorage.setItem(`registered_${selectedEvent.id}`, 'true');
      setMessage(`Registered for ${selectedEvent.title} successfully!`);
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register for event.');
    } finally {
      setShowPopup(false);
      setEmail('');
      setPhone('');
    }
  };

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

      {message && <p style={{ color: 'green' }}>{message}</p>}
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
              onClick={() => openRegisterPopup(event)}
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

      {/* 🔹 Popup Modal */}
      {showPopup && selectedEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            width: 300,
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}>
            <h3>Register for {selectedEvent.title}</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                margin: '10px 0',
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc'
              }}
            />
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                marginBottom: 10,
                padding: 8,
                borderRadius: 6,
                border: '1px solid #ccc'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: '#ccc',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterSubmit}
                style={{
                  background: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
