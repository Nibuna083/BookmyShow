import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
};

export const showsAPI = {
  getAll: () => api.get('/shows'),
  getById: (id) => api.get(`/shows/${id}`),
};

export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  confirm: (id, paymentData) => api.post(`/bookings/${id}/confirm`, paymentData),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getAll: () => api.get('/bookings'),
};

export default api;