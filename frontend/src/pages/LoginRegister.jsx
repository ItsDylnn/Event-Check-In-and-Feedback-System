import React, { useState } from 'react'
import api from '../api'
import { saveAuth } from '../auth'
import { useNavigate } from 'react-router-dom'

export default function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/auth/register', { name, email, password });
        setIsRegister(false);
        setErr('Registered. Please login.');
        return;
      }

      const res = await api.post('/auth/login', { email, password });
      saveAuth({
        token: res.data.access_token,
        role: res.data.role,
        name: res.data.name,
      });

      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/events');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Error');
    }
  }

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '2rem auto',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isRegister ? 'Register' : 'Login'}
      </h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isRegister && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold' }}>Name</label>
            <input
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Email</label>
          <input
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>Password</label>
          <input
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(v => !v)}
        style={{
          marginTop: '15px',
          padding: '8px',
          backgroundColor: 'transparent',
          border: '1px solid #007bff',
          color: '#007bff',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
      {err && (
        <div style={{ 
          color: 'red', 
          marginTop: '15px', 
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          {err}
        </div>
      )}
    </div>
  );
}
