import axios from 'axios';
import { toast } from 'react-toastify';

const baseUrl =
  import.meta.env.VITE_ENVIRONMENT === 'development'
    ? import.meta.env.VITE_DEV_BASE_URL
    : import.meta.env.VITE_PROD_BASE_URL;

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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Error:', response.data);
      toast.error(response.data.message || 'An error occurred');

      if (response.status === 401) {
        // Handle unauthorized access, e.g., redirect to login
        localStorage.removeItem('token');
        // You might want to redirect the user to the login page here
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request Error:', error.request);
      toast.error('No response from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);
