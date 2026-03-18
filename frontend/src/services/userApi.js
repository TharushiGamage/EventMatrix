import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Inject JWT token automatically on every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('uems_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('uems_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.data?.token) localStorage.setItem('uems_user', JSON.stringify(res.data.data));
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.data?.token) localStorage.setItem('uems_user', JSON.stringify(res.data.data));
    return res.data;
  },
  logout: () => localStorage.removeItem('uems_user'),
};

export const profileService = {
  getProfile: async () => (await api.get('/profile')).data,
  updateProfile: async (data) => {
    const res = await api.put('/profile/update', data);
    const current = JSON.parse(localStorage.getItem('uems_user'));
    if (current) localStorage.setItem('uems_user', JSON.stringify({ ...current, ...res.data.data }));
    return res.data;
  },
  changePassword: async (data) => (await api.put('/profile/change-password', data)).data,
};

export const adminService = {
  getUsers: async (search = '') => (await api.get(`/admin/users${search ? `?search=${search}` : ''}`)).data,
  updateRole: async (userId, role) => (await api.put('/admin/user-role', { userId, role })).data,
  updateStatus: async (userId, status) => (await api.put('/admin/user-status', { userId, status })).data,
  unlockUser: async (userId) => (await api.put('/admin/unlock-user', { userId })).data,
};

export default api;
