import axios from 'axios';
import { useAppStore } from '../../store/useAppStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const originalMessage = error.response?.data?.message || error.message;
    
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (status === 401) {
      friendlyMessage = 'Your session has expired. Please log in again.';
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    } else if (status === 403) {
      friendlyMessage = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      friendlyMessage = 'The requested resource could not be found.';
    } else if (status === 400 || status === 409) {
      friendlyMessage = originalMessage; // Show validation/conflict errors
    } else if (status >= 500) {
      friendlyMessage = 'Our servers are experiencing issues. We are working on it.';
    }

    useAppStore.getState().addNotification(friendlyMessage, 'error');

    return Promise.reject(new Error(friendlyMessage));
  }
);
