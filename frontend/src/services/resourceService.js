import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('uems_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

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

export async function getResources(params = {}) {
  const { data } = await api.get('/resources', { params });
  return data.data.resources;
}

export async function getResourceStats() {
  const { data } = await api.get('/resources/stats');
  return data.data;
}

export async function getBookings() {
  const { data } = await api.get('/resources/bookings');
  return data.data.bookings;
}

export async function createResource(payload) {
  const { data } = await api.post('/resources', payload);
  return data.data;
}

export async function checkResourceAvailability(payload) {
  const { data } = await api.post('/resources/check-availability', payload);
  return data.data;
}

export async function createResourceBooking(payload) {
  const { data } = await api.post('/resources/bookings', payload);
  return data.data;
}
