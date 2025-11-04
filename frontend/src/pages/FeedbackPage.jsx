import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post(`/events/${id}/feedback`, { rating, comment });
      alert('Thanks for your feedback!');
      navigate('/events');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Something went wrong.');
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>Submit Feedback</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            style={{ marginLeft: 10, width: 60 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Comment</label><br />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ width: '100%', height: 100 }}
          />
        </div>

        <button type="submit">Submit</button>
      </form>

      {err && <div style={{ color: 'red', marginTop: 10 }}>{err}</div>}
    </div>
  );
}
