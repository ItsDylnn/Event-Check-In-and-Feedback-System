import axios from 'axios';
import { clearAuth } from './auth'; 

const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({ baseURL });

// ✅ Attach the token before each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Automatically handle expired or invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Token expired or invalid — logging out...');
      clearAuth(); // removes token, role, etc. from localStorage
      window.location.href = '/login'; // redirect user
    }
    return Promise.reject(error);
  }
);

export default api;
