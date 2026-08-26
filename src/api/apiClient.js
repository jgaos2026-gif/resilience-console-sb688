/**
 * apiClient.js — thin fetch wrapper with JWT bearer auth
 * Replaces base44Client.js
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function getToken() {
  return sessionStorage.getItem('sb688_token');
}

export function setToken(token) {
  sessionStorage.setItem('sb688_token', token);
}

export function clearToken() {
  sessionStorage.removeItem('sb688_token');
}

async function request(method, path, body) {
  const token   = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
};

export default api;
