// frontend/src/auth.js
export function saveAuth({ token, role, name }) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem('role');
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
}
