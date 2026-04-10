// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getTeam: () => api.get('/auth/team'),
  inviteUser: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/invite', data),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
};

// ─── Tasks ──────────────────────────────────────────────────────────────────
export const taskApi = {
  getAll: (params?: Record<string, string>) =>
    api.get('/tasks', { params }),
  getOne: (id: string) => api.get(`/tasks/${id}`),
  create: (data: Partial<any>) => api.post('/tasks', data),
  update: (id: string, data: Partial<any>) => api.put(`/tasks/${id}`, data),
  move: (id: string, columnId: string, order: number) =>
    api.put(`/tasks/${id}/move`, { columnId, order }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, text: string) =>
    api.post(`/tasks/${id}/comments`, { text }),
  getActivity: (id: string) => api.get(`/tasks/${id}/activity`),
  getStats: () => api.get('/tasks/stats/dashboard'),
  uploadAttachment: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/tasks/${id}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAttachment: (taskId: string, attachmentId: string) =>
    api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
};

// ─── Columns ─────────────────────────────────────────────────────────────────
export const columnApi = {
  getAll: () => api.get('/columns'),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/mark-read'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

// ─── Projects ────────────────────────────────────────────────────────────────
export const projectApi = {
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; color?: string; icon?: string; members?: string[] }) =>
    api.post('/projects', data),
  update: (id: string, data: Partial<{ name: string; description: string; color: string; icon: string; members: string[] }>) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: (id: string) => api.get(`/projects/${id}/stats`),
};

export default api;
