import axios from 'axios';

// Resolve the backend API base URL.
// In production this comes from NEXT_PUBLIC_API_URL (set in .env.production or
// in the hosting provider's environment). Falls back to localhost for local dev.
const apiBaseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const api = axios.create({
  baseURL: apiBaseURL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
