import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

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

export const notificationService = {
    async getAll(unreadOnly = false) {
        const params = unreadOnly ? { unreadOnly: 'true' } : {};
        const { data } = await api.get('/notifications', { params });
        return data.data;
    },

    async markAsRead(id) {
        await api.put(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
        await api.put('/notifications/read-all');
    },

    async clearAll() {
        await api.delete('/notifications/clear-all');
    },
};
