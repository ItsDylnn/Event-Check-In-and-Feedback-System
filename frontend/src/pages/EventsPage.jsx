import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../auth';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]); // ✅ Tracks backend registrations
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  // 🔹 Logout function
  function logout() {
    clearAuth();
    navigate('/login');
  }

  // 🔹 Load events + registration info from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [eventsRes, regRes] = await Promise.all([
          api.get('/events'),
          api.get('/events/registrations')
        ]);
        setEvents(eventsRes.data);
        setRegisteredIds(regRes.data.registered_event_ids || []);
      } catch (error) {
        console.error('Error loading events:', error);
        setErr('Failed to load events or registrations.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function isRegistered(eventId) {
    return registeredIds.includes(eventId);
  }

  // 🔹 Handle Register Popup
  function openRegisterPopup(event) {
    setSelectedEvent(event);
    setShowPopup(true);
  }

  function closePopup() {
    setShowPopup(false);
    setEmail('');
    setPhone('');
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    try {
      await api.post(`/events/${selectedEvent.id}/register`, { email, phone });
      alert('Registered successfully!');
      setRegisteredIds([...registeredIds, selectedEvent.id]); // ✅ Update state
      closePopup();
    } catch (error) {
      alert(error.response?.data?.msg || 'Error registering for event.');
    }
  }

  async function handleUnregister(eventId) {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return;
    try {
      await api.delete(`/events/${eventId}/unregister`);
      alert('You have been unregistered from the event.');
      setRegisteredIds(registeredIds.filter(id => id !== eventId)); // ✅ Update state
    } catch (error) {
      alert(error.response?.data?.msg || 'Error unregistering.');
    }
  }

  if (loading) return <div>Loading events...</div>;
  if (err) return <div style={{ color: 'red' }}>{err}</div>;

  return (
    <div style={{ padding: 20 }}>
      {/* 🔹 Header */}
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

      {events.map(event => (
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

          {!isRegistered(event.id) ? (
            <button
              onClick={() => openRegisterPopup(event)}
              style={{
                marginRight: 10,
                background: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          ) : (
            <button
              onClick={() => handleUnregister(event.id)}
              style={{
                marginRight: 10,
                background: '#f39c12',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Unregister
            </button>
          )}

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
      ))}

      {/* 🔹 Popup Form */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 20,
            width: 300,
            textAlign: 'center'
          }}>
            <h3>Register for {selectedEvent.title}</h3>
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 10 }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 10 }}
              />
              <button
                type="submit"
                style={{
                  background: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  marginRight: 10
                }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={closePopup}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
