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
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={submit}>
        {isRegister && (
          <div>
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegister(v => !v)}>
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
      {err && <div style={{ color: 'red' }}>{err}</div>}
    </div>
  );
}
