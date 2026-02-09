import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inspectorApi = {
  list: () => api.get('/inspectors'),
  create: (data: any) => api.post('/inspectors', data),
  update: (id: string, data: any) => api.put(`/inspectors/${id}`, data),
  delete: (id: string) => api.delete(`/inspectors/${id}`),
};

export const factoryApi = {
  list: () => api.get('/factories'),
  create: (data: any) => api.post('/factories', data),
  update: (id: string, data: any) => api.put(`/factories/${id}`, data),
  delete: (id: string) => api.delete(`/factories/${id}`),
};

export const taskApi = {
  list: (status?: string) => api.get('/tasks', { params: { status } }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const scheduleApi = {
  generate: (data: any) => api.post('/schedules/generate', data),
  get: (id: string) => api.get(`/schedules/${id}`),
  update: (id: string, data: any) => api.put(`/schedules/${id}`, data),
};

export const statsApi = {
  getCostStats: () => api.get('/stats/cost'),
};
