import axios from 'axios';
import type { User, Design } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Test localStorage availability on module load
try {
  const testKey = '__localStorage_test__';
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
  console.log('API Service: localStorage is available');
} catch (e) {
  console.error('API Service: localStorage is NOT available!', e);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    console.log('Register: Making request to backend...');
    const response = await api.post<{ user: User; token: string }>('/auth/register', {
      email,
      username,
      password,
    });
    console.log('Register: Response received', { hasToken: !!response.data.token });
    // Store token in localStorage
    if (response.data.token) {
      try {
        localStorage.setItem('token', response.data.token);
        console.log('Register: Token stored in localStorage');
        // Verify storage
        const storedToken = localStorage.getItem('token');
        console.log('Register: Token verification', { stored: !!storedToken });
      } catch (storageError) {
        console.error('Register: Failed to store token in localStorage!', storageError);
        throw new Error('localStorage not available. Please check browser settings.');
      }
    } else {
      console.error('Register: No token in response!', response.data);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    console.log('Login: Making request to backend...');
    const response = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
    console.log('Login: Response received', { hasToken: !!response.data.token });
    // Store token in localStorage
    if (response.data.token) {
      try {
        localStorage.setItem('token', response.data.token);
        console.log('Login: Token stored in localStorage');
        // Verify storage
        const storedToken = localStorage.getItem('token');
        console.log('Login: Token verification', { stored: !!storedToken });
      } catch (storageError) {
        console.error('Login: Failed to store token in localStorage!', storageError);
        throw new Error('localStorage not available. Please check browser settings.');
      }
    } else {
      console.error('Login: No token in response!', response.data);
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    // Remove token from localStorage
    localStorage.removeItem('token');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

// Design API
export const designAPI = {
  getAll: async () => {
    const response = await api.get<Design[]>('/designs');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Design>(`/designs/${id}`);
    return response.data;
  },

  create: async (design: Partial<Design>) => {
    const response = await api.post<Design>('/designs', design);
    return response.data;
  },

  update: async (id: string, design: Partial<Design>) => {
    const response = await api.put<Design>(`/designs/${id}`, design);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/designs/${id}`);
    return response.data;
  },
};

export default api;
