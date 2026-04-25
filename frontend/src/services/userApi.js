import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({ baseURL: API_URL });

// Inject JWT token automatically on every request
api.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem('uems_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (_e) {
    localStorage.removeItem('uems_user');
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
  register: async (userData, options = {}) => {
    const { persistSession = true } = options;
    try {
      console.log('Registering user:', userData);
      const res = await api.post('/auth/register', userData);
      console.log('Registration response:', res.data);
      if (persistSession && res.data.data?.token) {
        localStorage.setItem('uems_user', JSON.stringify(res.data.data));
      }
      return res.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      console.log('Logging in user:', credentials.email);
      const res = await api.post('/auth/login', credentials);
      console.log('Login response:', res.data);
      if (res.data.data?.token) localStorage.setItem('uems_user', JSON.stringify(res.data.data));
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: () => localStorage.removeItem('uems_user'),
  forgotPassword: async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { identifier: email });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  verifyResetCode: async (payload) => {
    try {
      const res = await api.post('/auth/verify-reset-code', payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (data) => {
    try {
      const res = await api.post('/auth/reset-password', data);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
};

export const profileService = {
  getProfile: async () => (await api.get('/profile')).data,
  updateProfile: async (data) => {
    const res = await api.put('/profile/update', data);
    const current = JSON.parse(localStorage.getItem('uems_user'));
    if (current) localStorage.setItem('uems_user', JSON.stringify({ ...current, ...res.data.data }));
    return res.data;
  },
  sendPasswordOtp: async (data) => (await api.post('/profile/send-otp', data)).data,
  changePassword: async (data) => (await api.put('/profile/change-password', data)).data,
  changePasswordDirect: async (data) => (await api.put('/profile/change-password-direct', data)).data,
  uploadProfileImage: async (formData) => {
    const res = await api.post('/profile/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const current = JSON.parse(localStorage.getItem('uems_user'));
    if (current) localStorage.setItem('uems_user', JSON.stringify({ ...current, ...res.data.data }));
    return res.data;
  },
  deleteProfileImage: async () => {
    // Use fetch to avoid global axios response interceptor auto-logout on 401
    const raw = localStorage.getItem('uems_user');
    const token = raw ? JSON.parse(raw).token : null;
    const response = await fetch(`${API_URL}/profile/delete-image`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || 'Delete failed');
      err.response = { status: response.status, data };
      throw err;
    }
    const current = JSON.parse(localStorage.getItem('uems_user'));
    if (current && data.data) localStorage.setItem('uems_user', JSON.stringify({ ...current, ...data.data }));
    return data;
  },
};

export const adminService = {
  getUsers: async (search = '', role = '') => {
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return (await api.get(`/admin/users${qs}`)).data;
  },
  updateRole: async (userId, role) => (await api.put('/admin/user-role', { userId, role })).data,
  updateStatus: async (userId, status) => (await api.put('/admin/user-status', { userId, status })).data,
  unlockUser: async (userId) => (await api.put('/admin/unlock-user', { userId })).data,
  getOrganizerEvents: async (userId) => (await api.get(`/admin/organizer-events/${userId}`)).data,
  getStudentRegistrations: async () => (await api.get('/admin/student-registrations')).data,
  requestEventEdit: async (eventId, reason = '') => (await api.post(`/admin/events/${eventId}/request-edit`, { reason })).data,
  requestEventDelete: async (eventId, reason = '') => (await api.post(`/admin/events/${eventId}/request-delete`, { reason })).data
};

export default api;
