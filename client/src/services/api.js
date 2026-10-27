import axios from 'axios';

const SESSION_TOKEN_KEY = 'phytoguard_session_fallback';

let inMemoryAuthToken = '';
try {
  inMemoryAuthToken = window.sessionStorage?.getItem(SESSION_TOKEN_KEY) || '';
} catch {
  inMemoryAuthToken = '';
}

export function setFallbackAuthToken(token) {
  inMemoryAuthToken = token || '';
  try {
    if (token) {
      window.sessionStorage?.setItem(SESSION_TOKEN_KEY, token);
    } else {
      window.sessionStorage?.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // Ignore restricted storage in strict privacy sandboxes
  }
}

export const api = axios.create({
  baseURL: (import.meta.env?.VITE_API_BASE_URL || '') + '/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'PhytoGuardClient',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (inMemoryAuthToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${inMemoryAuthToken}`;
  }
  return config;
});

export default api;
