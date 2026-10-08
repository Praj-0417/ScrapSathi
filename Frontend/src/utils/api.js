import axios from 'axios';
import { toast } from 'react-toastify';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.PROD) {
    return (
      import.meta.env.VITE_PROD_BASE_URL ||
      import.meta.env.VITE_FALLBACK_PROD_BASE_URL ||
      'https://scrapsaathi-backend.onrender.com/api'
    );
  }
  return import.meta.env.VITE_DEV_BASE_URL || 'http://localhost:8000/api';
};

const rawBase = getBaseUrl();
const baseUrl = rawBase.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle and log errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      console.error('Response Error:', response.status, response.data?.message);

      if (response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login only if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('Request Error: No response received', error.request);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);
