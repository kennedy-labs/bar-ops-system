import axios from 'axios';

// Resolve the backend API base URL.
// In production this comes from NEXT_PUBLIC_API_URL (set in the hosting provider's
// environment, e.g. Vercel dashboard). It falls back to the deployed Render backend
// so the frontend reliably reaches the live API even if the env var is missing.
const apiBaseURL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://bar-ops-system.onrender.com';

const api = axios.create({
  baseURL: apiBaseURL,
});

// Add a request interceptor to include the JWT token.
// localStorage is only available in the browser; guard it so the client can
// never crash during server-side static rendering (e.g. build-time export).
// The token is stored via JSON.stringify, so parse it before using.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('token');
    if (raw) {
      try {
        const token = JSON.parse(raw) as string;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Fall back to the raw value if it wasn't JSON-encoded.
        config.headers.Authorization = `Bearer ${raw}`;
      }
    }
  }
  return config;
});

export default api;
