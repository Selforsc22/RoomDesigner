import axios from 'axios';
import type { User, Design } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/register', {
      email,
      username,
      password,
    });
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
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
